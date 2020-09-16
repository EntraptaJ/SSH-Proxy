// src/Modules/SSH/Server.ts

import { Client as SSHClient, Server as SSHServer } from 'ssh2';
import { getConnection } from 'typeorm';
import { config } from '../../Library/Config';
import { getHostKeys } from '../Crypto/Keys';
import { History } from '../History/HistoryModel';
import { Host } from '../Hosts/HostModel';
import { User } from '../Users/UserModel';
import { Session } from '../Session/SessionModel';
import { SessionStatus } from '../Session/SessionState';

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
  sshServer.on('connection', (client) => {
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

    client.on('authentication', async (ctx) => {
      /**
       * Split username to array with "." as the seperator
       */
      const usernameArray = ctx.username.split('.');

      /**
       * Pop off the last entry I.E "root.host1" and find the database record for that hostname
       */
      const hostKey = usernameArray.pop();
      host = await Host.findOne({
        where: {
          key: hostKey,
        },
      });

      if (!host) {
        ctx.reject();
      }

      /**
       * Join the username again with `.` to support usernames inclduing `.`
       */
      const username = usernameArray.join('.');

      user = await getConnection()
        .getRepository(User)
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.allowedHosts', 'allowedHosts')
        .where('user.username = :username', { username })
        .andWhere('allowedHosts.id = :hostId', { hostId: host.id })
        .getOne();

      if (!user) {
        console.warn(`User ${username} doesn't exist. Rejecting Connection`);
        ctx.reject();
      }

      if (!user.allowedHosts) {
        console.warn(`${username} attempting to access ${host.hostname}`);

        ctx.reject();
      }

      switch (ctx.method) {
        case 'password':
          const password = ctx.password;

          /**
           * Check that the incoming password matches what is in the database
           */
          if (user.password !== password) {
            console.log(`User password doesn't match`);
            ctx.reject();
          }

          console.log('??');

          ctx.accept();
        default:
          ctx.reject();
      }

      ctx.accept();
    });

    client.on('ready', (msg) => {
      client.on('session', async (accept, reject) => {
        const session = accept();

        const sessionRecord = Session.create({
          user,
          host,
          sessionStatus: SessionStatus.AUTHENICATING,
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

        session.on('shell', (accept, reject) => {
          destSession.on('ready', async () => {
            await Session.update(
              {
                id: sessionRecord.id,
              },
              {
                sessionStatus: SessionStatus.CONNECTED,
              }
            );

            destSession.on('continue', () => {
              console.log('Session onContinue');
            });

            destSession.shell((err, channel) => {
              if (err) {
                console.error('Error: ', err);
                reject();
              }

              const serverChannel = accept();

              channel.on('exit', () => {
                console.log('OnExit');
              });

              channel.on('data', async (msg, ...test) => {
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
          });
        });

        /**
         * Auto accept PTY Requests
         */
        session.on('pty', (accept, reject, info) => {
          accept();
        });

        session.on('close', async () => {
          await Session.update(
            {
              id: sessionRecord.id,
            },
            {
              sessionStatus: SessionStatus.EXIT,
            }
          );
          /**
           * Save the history entry once the user has closed the session
           */
          console.log('Ending seesion');
        });

        /**
         * TODO: Get Exec Working
         */
        session.once('exec', (accept, reject, info) => {
          console.log(`Client wants to exec`);

          var stream = accept();
          stream.stderr.write('Oh no, the dreaded errors!\n');
          stream.write('Just kidding about the errors!\n');
          stream.exit(0);
          stream.end();
        });
      });
    });
  });

  return sshServer.listen(config.ssh.port, config.ssh.bindHost);
}
