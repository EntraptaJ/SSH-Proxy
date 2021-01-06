// src/Modules/Users/UserModelFactory.ts
import { FactoryBuilder } from 'factory.io';
import { User } from './UserModel';
import { internet } from 'faker';

export const userFactory = FactoryBuilder.of(User)
  .props({
    password: 'password',
    username: internet.userName(),
  })
  .build();
