// src/Modules/SSH/Server.ts

import pEvent from 'p-event';
import type { Session as SSHSession } from 'ssh2';
import {
  AuthContext,
  Client as SSHClient,
  PseudoTtyInfo,
  Server as SSHServer,
  SetEnvInfo,
} from 'ssh2';
import { config } from '../../Library/Config';
import { logger, LogMode } from '../../Library/Logger';
import { Credential } from '../Credentials/CredentialModel';
import { getHostKeys } from '../Crypto/Keys';
import { History } from '../History/HistoryModel';
import { Host } from '../Hosts/HostModel';
import { Session } from '../Session/SessionModel';
import { SessionStatus } from '../Session/SessionState';
import { User } from '../Users/UserModel';
import { performAuth } from './Auth';
import { execCommand } from './Utils';

/**
 * Start the SSH Proxy Server
 */
export async function startSSHServer(): Promise<SSHServer> {
  /**
   * Generate host Keys with Node Forge
   */
  const hostPrivateKey = await getHostKeys();

  const sshServer = new SSHServer({
    hostKeys: [hostPrivateKey],
  });

  /**
   * On Client connection to SSH server
   */
  sshServer.on('connection', async (client) => {
    logger.log(LogMode.DEBUG, 'New SSH connection recieved');

    /**
     * Host database entry
     */
    let host: Host;

    /**
     * Incoming users database entry
     */
    let user: User;

    let credentials: Credential;

    let pty: PseudoTtyInfo;

    let env: SetEnvInfo;

    /**
     * SSH Session
     */
    let destSession: SSHClient = new SSHClient();

    for await (const authCtx of pEvent.iterator<string, AuthContext>(
      client,
      'authentication',
      {
        resolutionEvents: ['ready'],
      },
    )) {
      try {
        const authResponse = await performAuth(authCtx);

        authCtx.accept();

        host = authResponse.host;
        user = authResponse.user;
        credentials = authResponse.credentials;
      } catch (err) {
        console.log(err);
        authCtx.reject();
      }
    }

    console.log('Client Ready');

    const sessionRecord = Session.create({
      user,
      host,
      sessionStatus: SessionStatus.AUTHENICATING,
    });

    for await (const accept of pEvent.iterator<string, () => SSHSession>(
      client,
      'session',
      {
        resolutionEvents: ['end'],
      },
    )) {
      console.log('Session created');

      const session = accept();

      session.on('pty', (accept, reject, info) => {
        console.log('Starting PTY', info);

        pty = info;
        accept();
      });

      session.on('signal', (...msg) => {
        console.log('Recieved Signal: ', ...msg);
      });

      await sessionRecord.save();

      /**
       * Connect to the end host via SSH repeating the users credentials
       */
      destSession.connect({
        host: host.hostname,
        username: credentials.username,
        password: credentials.password,
      });

      session.on('subsystem', () => {
        logger.log(LogMode.DEBUG, 'Subsystem requested');
      });

      session.on('env', (accept, reject, envInfo) => {
        console.log('Env', envInfo);

        accept();
      });

      session.on('shell', async (acceptShell, reject) => {
        // TODO: Handle dest session not "ready"ing / rejcet
        await pEvent(destSession, 'ready');

        const serverChannel = acceptShell();

        await Session.update(
          {
            id: sessionRecord.id,
          },
          {
            sessionStatus: SessionStatus.CONNECTED,
          },
        );

        destSession.shell(
          {
            ...pty,
          },
          (err, channel) => {
            if (err) {
              console.error('Error: ', err);
            }

            channel.on('exit', () => {
              serverChannel.close();
            });

            let line = ``;

            channel.on('data', async (msg) => {
              line += msg.toString();

              if (line.endsWith('\r\n')) {
                for (const newLine of line.split('\r\n')) {
                  let history = History.create({
                    host,
                    user,
                    shellOutput: newLine,
                    session: sessionRecord,
                  });

                  await history.save();
                }
                line = ``;
              }
            });

            /**
             * Pipe from client to serer, back into client
             */
            channel.pipe(serverChannel).pipe(channel);
          },
        );

        console.log('Dest Session Ready');
      });

      session.on('exec', async (accept, reject, info) => {
        console.log('Got exec request', info);

        await pEvent(destSession, 'ready');
        console.log('Exec dest session is ready');

        const execChannel = accept();

        console.log('Execing on dest server');

        const clientStream = await execCommand(info.command, destSession, {
          pty,
        });

        let line = ``;

        execChannel.on('data', (msg) => {
          console.log('ExecChannel Data', msg.toString());
        });

        clientStream.on('data', async (msg) => {
          console.log('clientData: ', msg.toString());

          line += msg.toString();

          if (line.endsWith('\r\n')) {
            for (const newLine of line.split('\r\n')) {
              let history = History.create({
                host,
                user,
                shellOutput: newLine,
                session: sessionRecord,
              });

              await history.save();
            }
            line = ``;
          }
        });

        execChannel.pipe(clientStream).pipe(execChannel);
      });

      console.log('HelloWorld');
    }

    console.log('Session Done');

    await sessionRecord.reload();

    await Session.update(
      {
        id: sessionRecord.id,
      },
      {
        sessionStatus: SessionStatus.EXIT,
      },
    );
  });

  return sshServer.listen(config.ssh.port, config.ssh.bindHost);
}
