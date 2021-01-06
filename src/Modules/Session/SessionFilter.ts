// src/Modules/Session/SessionFilter.ts
import { Field, InputType } from 'type-graphql';
import { Session } from './SessionModel';
import { SessionStatus } from './SessionState';

@InputType()
export class SessionFilter implements Partial<Session> {
  @Field(() => SessionStatus, { nullable: true })
  public sessionStatus?: SessionStatus;
}
