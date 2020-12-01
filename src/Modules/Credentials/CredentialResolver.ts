// src/Modules/Credentials/CredentialResolver.ts
import { Arg, ID, Mutation, Query, Resolver } from 'type-graphql';
import { Service } from 'typedi';
import { APILogger } from '../Logger/APILoggerService';
import { User } from '../Users/UserModel';
import { UserRepository } from '../Users/UserRepository';
import { CredentialRepository } from './CredentialRepository';
import { Credential } from './CredentialModel';

@Service()
@Resolver(Credential)
export class CredentialResolver {
  public constructor(
    private userRepository: UserRepository,
    private credentialRepository: CredentialRepository,
  ) {
    console.log('CredentialResolver created!');
  }

  @Query(() => [Credential], {
    description: 'Query all credentials',
  })
  public async credentials(): Promise<Credential[]> {
    return this.credentialRepository.findAll();
  }

  @Mutation(() => Credential)
  public async addUserToCredential(
    @Arg('credentialId', () => ID) credentialId: string,
    @Arg('userId', () => ID) userId: string,
  ): Promise<Credential> {
    const [credential, user] = await Promise.all([
      this.credentialRepository.findOne({
        relations: ['users'],
        where: {
          id: credentialId,
        },
      }),
      this.userRepository.findOne({
        where: {
          id: userId,
        },
      }),
    ]);

    const users = await credential.users;
    users.push(user);

    return this.credentialRepository.saveUsingRepository(credential);
  }
}
