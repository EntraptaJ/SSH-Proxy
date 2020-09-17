// src/Modules/Users/UserInput.ts
import { InputType, Field } from 'type-graphql';
import { User } from './UserModel';

@InputType()
export class UserInput implements Partial<User> {
  @Field()
  public username: string;

  @Field()
  public password: string;
}
