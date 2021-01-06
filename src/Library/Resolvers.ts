// src/Library/Resolvers.ts
import { GraphQLSchema } from 'graphql';
import 'reflect-metadata';
import { buildSchema, NonEmptyArray, ResolverData } from 'type-graphql';
import { findModuleFiles } from '../Utils/moduleFileFinder';
import type { Context } from './Context';
import type { ResolverFn } from 'apollo-server';

type ResolverModule = { [key: string]: ResolverFn };

/**
 * Get all resolvers functions within the Modules folder
 *
 * @returns Promise resolving to all exported classes within Resolver modules within `src/Modules`
 */
export async function getResolvers(): Promise<NonEmptyArray<ResolverFn>> {
  const resolverModules = await findModuleFiles<ResolverModule>(
    /.*Resolver\.((ts|js)x?)/,
  );

  const resolverFns = Object.freeze(
    resolverModules.flatMap((resolverModule) => Object.values(resolverModule)),
  );

  return [resolverFns[0], ...resolverFns.slice(1)];
}

/**
 * Build a GraphQL schema with the provided resovlers
 * @param resolvers Array of `type-graphql` resolvers
 *
 * @returns Promise resolving to the created GraphQL schema
 */
export async function buildGQLSchema(
  resolvers: NonEmptyArray<ResolverFn>,
): Promise<GraphQLSchema> {
  return buildSchema({
    resolvers: resolvers,
    container: ({ context }: ResolverData<Context>) => context.container,
  });
}
