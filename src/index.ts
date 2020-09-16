// src/index.ts
import { createApolloServer } from './Library/Apollo';
import { connectDatabase } from './Library/Database';
import { startSSHServer } from './Modules/SSH/Server';

console.info('Starting SSH-Proxy');

console.info('Connecting to Database');

/**
 * Connect to database
 */
await connectDatabase();

console.info('Database Connected');

const [apiServer, sshServer] = await Promise.all([
  createApolloServer(),
  startSSHServer(),
]);

console.info('Started SSH server');

apiServer.listen();

console.info('SSH-Proxy server running');
