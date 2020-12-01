// src/Modules/Session/SessionModelFactory.ts
import { Factory } from 'factory.io';
import { Session } from './SessionModel';
import { SessionStatus } from './SessionState';

export const sessionFactory = new Factory(Session)
  .options({ idField: 'id' })
  .props({
    sessionStatus: SessionStatus.AUTHENICATING,
    history: [],
  })
  .done();
