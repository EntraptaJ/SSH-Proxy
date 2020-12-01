// src/Library/Context.ts
import { FastifyRequest } from 'fastify';
import { Container } from 'typedi';
import { ContainerInterface } from 'typeorm';

export interface Context {
  requestId: string;

  container: ContainerInterface;
}

interface ContextRequest {
  request: FastifyRequest;
}

let count = 0;

/**
 * Get the GraphQL Context
 */
export function getGQLContext({ request, ...test }: ContextRequest): Context {
  const requestId =
    process.env.NODE_ENV === 'TEST'
      ? (count++).toString()
      : (request.id as string);

  const container = Container.of(requestId);

  const context = { requestId, container };
  container.set('context', context);

  return context;
}
