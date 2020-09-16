// src/index.ts
import { Server, Client as SSHClient } from 'ssh2';
import { ssh, pki } from 'node-forge';
import { User } from './Modules/Users/UserModel';
import { Host } from './Modules/Hosts/HostModel';
import { connectDatabase } from './Library/Database';
import { History } from './Modules/History/HistoryModel';

const generateKeyPair = (): Promise<pki.rsa.KeyPair> =>
  new Promise((resolve, reject) =>
    pki.rsa.generateKeyPair({ bits: 2048 }, (err, keypair) => {
      if (err) reject(err);

      resolve(keypair);
    })
  );

/**
 * Generate host Keys with Node Forge
 */
const generatedKey = await generateKeyPair();

/**
 * Convert RSA Private key to OpenSSH formaT
 */
const privateKey = ssh.privateKeyToOpenSSH(generatedKey.privateKey);

/**
 * Connect to database
 */
const database = await connectDatabase();

const sshServer = new Server({
  hostKeys: [privateKey],
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
     * Join the username again
     */
    const username = usernameArray.join('.');

    user = await database
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

        ctx.accept();
      default:
        ctx.reject();
    }

    ctx.accept();
  });

  client.on('ready', (msg) => {
    client.on('session', (accept, reject) => {
      const session = accept();

      /**
       * Connect to the end host via SSH repeating the users credentials
       */
      destSession.connect({
        host: host.hostname,
        username: user.username,
        password: user.password,
      });

      /**
       * Create the local history database entry
       */
      let history = History.create({
        host,
        user,
        shellOutput: ``,
      });

      session.on('shell', (accept, reject) => {
        destSession.on('ready', () => {
          destSession.shell((err, channel) => {
            if (err) {
              console.error('Error: ', err);
              reject();
            }

            const serverChannel = accept();

            channel.on('data', (msg) => {
              /**
               * On incoming data from the server, append to thee shellOutput on the history record
               */
              history.shellOutput += msg.toString();
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
        /**
         * Save the history entry once the user has closed the session
         */
        await history.save();
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

sshServer.listen(8022, '0.0.0.0');

console.info('SSH-Proxy server running');
