// src/Modules/Users/UserResolver.ts
import {
  Arg,
  FieldResolver,
  ID,
  Mutation,
  Query,
  Resolver,
  ResolverInterface,
} from 'type-graphql';
import { UserInput } from './UserInput';
import { User } from './UserModel';

@Resolver(User)
export class UserResolver {
  @Query(() => [User])
  public async users(): Promise<User[]> {
    return User.find();
  }

  @Mutation(() => User)
  public async createUser(
    @Arg('input', () => UserInput) input: UserInput
  ): Promise<User> {
    const user = User.create(input);

    return user.save();
  }

  @Mutation(() => [User])
  public async deleteUser(
    @Arg('userId', () => ID) userId: string
  ): Promise<User[]> {
    const user = await User.findOneOrFail({
      where: {
        id: userId,
      },
    });

    await user.remove();

    return User.find();
  }
}
