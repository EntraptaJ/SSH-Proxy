// src/Modules/Session/SessionResolver.ts
import {
  Arg,
  FieldResolver,
  Query,
  Resolver,
  ResolverInterface,
  Root,
} from 'type-graphql';
import { History } from '../History/HistoryModel';
import { SessionFilter } from './SessionFilter';
import { Session } from './SessionModel';
import { SessionStatus } from './SessionState';

@Resolver(Session)
export class SessionResolver implements ResolverInterface<Session> {
  @Query(() => String)
  public async helloWorld(): Promise<'helloWorld'> {
    return 'helloWorld';
  }

  @Query(() => [Session])
  public async sessions(
    @Arg('filter', () => SessionFilter, {
      nullable: true,
    })
    filter: SessionFilter
  ): Promise<Session[]> {
    return Session.find({
      where: {
        ...filter,
      },
    });
  }

  @FieldResolver(() => [History])
  public async history(@Root() { id }: Session): Promise<History[]> {
    return History.find({
      where: {
        session: id,
      },
    });
  }
}
