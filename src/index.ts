// src/index.ts
import fastify from 'fastify';
import hyperid from 'hyperid';
import { createApolloServer } from './Library/Apollo';
import { config } from './Library/Config';
import { connectDatabase } from './Library/Database';
import { logger, LogMode } from './Library/Logger';
import { startSSHServer } from './Modules/SSH/Server';

logger.log(LogMode.INFO, 'Starting SSH-Proxy');

/**
 * Fastify Web Server
 */
const webServer = fastify({
  genReqId: () => hyperid().uuid,
});

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

sshServer.listen(8022, '0.0.0.0');

await webServer.register(apiServer.createHandler());

await webServer.listen(8080, config.bindHost);

logger.log(LogMode.INFO, 'Started SSH server');

logger.log(LogMode.INFO, 'SSH-Proxy server running');
