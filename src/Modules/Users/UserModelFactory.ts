// src/Modules/Users/UserModelFactory.ts
import { Factory } from 'factory.io';
import { User } from './UserModel';
import { internet } from 'faker';

export const userFactory = new Factory(User)

  .props({
    password: 'password',
    username: internet.userName(),
  })
  .done();
