// src/Modules/Hosts/HostFilter.ts

import { Field, InputType } from 'type-graphql';
import { Host } from './HostModel';

@InputType()
export class HostFilter implements Partial<Host> {
  @Field({ nullable: true })
  public id: string;
}
