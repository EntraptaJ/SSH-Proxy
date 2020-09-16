// src/Modules/SSH/Server.ts

import { AuthContext, Client as SSHClient, Server as SSHServer } from 'ssh2';
import { getConnection } from 'typeorm';
import { config } from '../../Library/Config';
import { getHostKeys } from '../Crypto/Keys';
import { History } from '../History/HistoryModel';
import { Host } from '../Hosts/HostModel';
import { User } from '../Users/UserModel';
import { Session } from '../Session/SessionModel';
import { SessionStatus } from '../Session/SessionState';
import pEvent from 'p-event';
import { performAuth } from './Auth';

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
    /**
     * Host database entry
     */
    let host: Host;

    /**
     * Incoming users database entry
     */
    let user: User;

    /**
     * SSH Session
     */
    let destSession: SSHClient = new SSHClient();

    for await (const authCtx of pEvent.iterator<string, AuthContext>(
      client,
      'authentication',
      {
        resolutionEvents: ['ready'],
      }
    )) {
      try {
        const authResponse = await performAuth(authCtx);

        console.log('Auth Successful');
        authCtx.accept();

        host = authResponse.host;
        user = authResponse.user;
      } catch (err) {
        console.log(err);
        authCtx.reject();
      }
    }

    const sessionRecord = Session.create({
      user,
      host,
      sessionStatus: SessionStatus.AUTHENICATING,
    });

    console.log('Client ready');

    for await (const accept of pEvent.iterator(client, 'session', {
      resolutionEvents: ['close'],
    })) {
      const session = accept();

      session.on('pty', (accept, reject, info) => {
        accept();
      });

      await sessionRecord.save();

      console.log('Session record: ', sessionRecord);

      await sessionRecord.reload();

      console.log('SessionRecod: ', sessionRecord);

      /**
       * Connect to the end host via SSH repeating the users credentials
       */
      destSession.connect({
        host: host.hostname,
        username: user.username,
        password: user.password,
      });

      const [acceptShell] = await Promise.all([
        pEvent<string, Function>(session, 'shell'),
        pEvent(destSession, 'ready'),
      ]);

      const serverChannel = acceptShell();

      await Session.update(
        {
          id: sessionRecord.id,
        },
        {
          sessionStatus: SessionStatus.CONNECTED,
        }
      );

      destSession.shell((err, channel) => {
        if (err) {
          console.error('Error: ', err);
        }

        console.log('helloWorld');

        channel.on('exit', () => {
          console.log('OnExit');
          serverChannel.close;
        });

        channel.on('data', async (msg) => {
          let history = History.create({
            host,
            user,
            shellOutput: msg.toString(),
            session: sessionRecord,
          });

          await history.save();
        });

        /**
         * Pipe from client to serer, back into client
         */
        channel.pipe(serverChannel).pipe(channel);
      });
    }

    await Session.update(
      {
        id: sessionRecord.id,
      },
      {
        sessionStatus: SessionStatus.EXIT,
      }
    );
  });

  return sshServer.listen(config.ssh.port, config.ssh.bindHost);
}
