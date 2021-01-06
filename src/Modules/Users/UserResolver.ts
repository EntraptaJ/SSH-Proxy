// src/Modules/Users/UserResolver.ts
import { Arg, ID, Mutation, Query, Resolver } from 'type-graphql';
import { Service } from 'typedi';
import { APILogger } from '../Logger/APILoggerService';
import { UserInput } from './UserInput';
import { User } from './UserModel';
import { UserRepository } from './UserRepository';

@Service()
@Resolver(User)
export class UserResolver {
  public constructor(
    private userRepository: UserRepository,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
    private logger: APILogger,
  ) {
    console.log('UserResolver created!');
  }

  @Query(() => [User], {
    description: 'Query all user entities',
  })
  public async users(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  @Mutation(() => User, {
    description: 'Create a new user entity',
  })
  public async createUser(
    @Arg('input', () => UserInput) input: UserInput,
  ): Promise<User> {
    return this.userRepository.createUser(input);
  }

  @Mutation(() => [User], {
    description: 'Delete a user entity',
  })
  public async deleteUser(
    @Arg('userId', () => ID) userId: string,
  ): Promise<User[]> {
    return this.userRepository.findAndDeleteUser(userId);
  }
}
