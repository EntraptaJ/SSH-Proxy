// src/Modules/Session/SessionState.ts
import { registerEnumType } from 'type-graphql';

export enum SessionStatus {
  CONNECTING = 'connecting',
  AUTHENICATING = 'authenicating',
  CONNECTED = 'connected',
  EXIT = 'exit',
}

registerEnumType(SessionStatus, {
  name: 'SessionStatus',
});
