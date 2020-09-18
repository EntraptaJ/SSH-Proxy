// src/Modules/Credentials/CredentialResolver.ts
import { Arg, ID, Mutation, Query, Resolver } from 'type-graphql';
import { User } from '../Users/UserModel';
import { Credential } from './CredentialModel';

@Resolver(Credential)
export class CredentialResolver {
  @Query(() => [Credential])
  public async credentials(): Promise<Credential[]> {
    return Credential.find({});
  }

  @Mutation(() => Credential)
  public async addUserToCredential(
    @Arg('credentialId', () => ID) credentialId: string,
    @Arg('userId', () => ID) userId: string,
  ): Promise<Credential> {
    const [credential, user] = await Promise.all([
      Credential.findOneOrFail({
        relations: ['users'],
        where: {
          id: credentialId,
        },
      }),
      User.findOneOrFail({
        where: {
          id: userId,
        },
      }),
    ]);

    const users = await credential.users;
    users.push(user);

    return credential.save();
  }
}
