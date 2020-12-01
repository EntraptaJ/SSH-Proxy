// src/Modules/Session/SessionModel.test.ts
import { TestSuite } from '@k-foss/ts-estests';
import { strictEqual } from 'assert';
import 'reflect-metadata';
import { createApolloTestClient } from '../../Library/Apollo';

export class UserResolverTest extends TestSuite {
  public testName = 'User Resolver Tests';

  public async test(): Promise<void> {
    const { query } = await createApolloTestClient();
    const result = await query({
      query: `
      {
        helloWorld
      }`,
    });

    console.log(result);

    strictEqual(result.data?.helloWorld, 'helloWorld', 'helloWorld Query');
  }
}
