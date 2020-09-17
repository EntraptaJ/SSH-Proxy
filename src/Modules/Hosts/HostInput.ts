// src/Modules/Hosts/HostInput.ts
import { Field, InputType } from 'type-graphql';
import { Host } from './HostModel';

@InputType()
export class HostInput implements Partial<Host> {
  @Field()
  public hostname: string;

  @Field()
  public key: string;
}
