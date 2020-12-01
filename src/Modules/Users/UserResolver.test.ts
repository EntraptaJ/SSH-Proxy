// src/Modules/Users/UserResolver.test.ts
import { TestSuite } from '@k-foss/ts-estests';
import { strictEqual, notStrictEqual } from 'assert';
import 'reflect-metadata';
import { getConnection } from 'typeorm';
import { createApolloTestClient } from '../../Library/Apollo';
import { connectDatabase } from '../../Library/Database';
import { saveOne } from '../../Library/Factory';
import { User } from './UserModel';
import { userFactory } from './UserModelFactory';

export class UserResolverTest extends TestSuite {
  public testName = 'User Resolver Tests';

  public async test(): Promise<void> {
    await connectDatabase(true);

    const users = await userFactory.buildMany(5);

    const repository = getConnection().getRepository(User);
    await repository.save(users);

    const { query } = await createApolloTestClient();
    const usersResult = await query({
      query: `
      {
        users {
          id
        }
      }`,
    });

    strictEqual(usersResult.data?.users.length >= 5, true);

    const createUserResult = await query({
      query: `
      mutation {
        createUser(input: {
          username: "randomUser1",
          password: "password123"
        }) {
          id

          username
        }
      }`,
    });

    console.log(createUserResult);

    notStrictEqual(createUserResult.data?.createUser.id, undefined);
    strictEqual(createUserResult.data?.createUser.username, 'randomUser1');
  }
}
