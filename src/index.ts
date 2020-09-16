// src/index.ts
import { config } from './Library/Config';
import { connectDatabase } from './Library/Database';
import { startSSHServer } from './Modules/SSH/Server';

console.info('Starting SSH-Proxy', config);

console.info('Connecting to Database');

/**
 * Connect to database
 */
const database = await connectDatabase();

console.info('Database Connected');

console.info('Starting SSH Server');

const sshServer = await startSSHServer();
console.info('Started SSH server');

console.info('SSH-Proxy server running');
