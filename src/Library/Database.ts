// src/Library/TypeORM.ts
import { findModuleFiles } from '../Utils//moduleFileFinder';
import {
  EntitySchema,
  EntitySubscriberInterface,
  createConnection,
  Connection,
} from 'typeorm';

export async function getEntities(): Promise<EntitySchema[]> {
  const modelModules = await findModuleFiles(/.*Model\.((ts|js)x?)/);

  return modelModules.flatMap((resolverModule) =>
    Object.values(resolverModule as { [key: string]: EntitySchema })
  );
}

interface EntitySubscriberModule {
  [key: string]: ClassType<EntitySubscriberInterface>;
}

export async function getEntitySubscribers(): Promise<
  ClassType<EntitySubscriberInterface>[]
> {
  const entitySubscriberModules = await findModuleFiles<EntitySubscriberModule>(
    /.*EntitySubscriber\.((ts|js)x?)/
  );

  return entitySubscriberModules.flatMap((entitySubscriberModule) =>
    Object.values(entitySubscriberModule)
  );
}

export async function connectDatabase(testing = false): Promise<Connection> {
  const [entities, subscribers] = await Promise.all([
    getEntities(),
    getEntitySubscribers(),
  ]);

  return createConnection({
    type: 'postgres',
    database: 'ssh-proxy',
    username: 'postgres',
    password: 'pgpass',
    host: 'Database',
    synchronize: true,
    subscribers,

    entities,
  });
}
