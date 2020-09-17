// src/Modules/Credentials/CredentialInput.ts
import { Field, ID, InputType } from 'type-graphql';
import { Credential } from './CredentialModel';

@InputType()
export class CredentialInput implements Partial<Credential> {
  @Field()
  public username: string;

  @Field()
  public password: string;
}
