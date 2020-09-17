// src/Library/Replayer.ts
import { connectDatabase } from './Database';
import { Session } from '../Modules/Session/SessionModel';

await connectDatabase();

const sessionId = '60a380f9-63b8-4ad0-a8f8-9c3070b52543';

const session = await Session.findOneOrFail({
  relations: ['history', 'history.shellOutput'],
  where: {
    id: sessionId,
  },
});

console.log(session);
