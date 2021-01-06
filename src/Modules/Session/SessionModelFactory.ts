/* eslint-disable @typescript-eslint/no-unsafe-call */
// src/Modules/Session/SessionModelFactory.ts
import { FactoryBuilder } from 'factory.io';
import { Session } from './SessionModel';
import { SessionStatus } from './SessionState';

export const sessionFactory = FactoryBuilder.of(Session)
  .options({ sequenceField: 'id' })
  .props({
    sessionStatus: SessionStatus.AUTHENICATING,
    history: [],
  })
  .build();
