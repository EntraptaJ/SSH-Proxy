// src/index.ts
import { createApolloServer } from './Library/Apollo';
import { connectDatabase } from './Library/Database';
import { logger, LogMode } from './Library/Logger';
import { startSSHServer } from './Modules/SSH/Server';

logger.log(LogMode.INFO, 'Starting SSH-Proxy');

logger.log(LogMode.INFO, 'Connecting to Database');

/**
 * Connect to database
 */
await connectDatabase();

logger.log(LogMode.INFO, 'Database Connected');

const [apiServer, sshServer] = await Promise.all([
  createApolloServer(),
  startSSHServer(),
]);

logger.log(LogMode.INFO, 'Started SSH server');

apiServer.listen();

logger.log(LogMode.INFO, 'SSH-Proxy server running');
