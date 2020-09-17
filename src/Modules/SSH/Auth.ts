// src/Modules/SSH/Auth.ts

import { AuthContext } from 'ssh2';
import { getConnection } from 'typeorm';
import { Credential } from '../Credentials/CredentialModel';
import { Host } from '../Hosts/HostModel';
import { User } from '../Users/UserModel';

export async function performAuth(
  ctx: AuthContext
): Promise<{ host: Host; user: User; credentials: Credential }> {
  /**
   * Split username to array with "." as the seperator
   */
  const usernameArray = ctx.username.split('.');

  console.log(usernameArray);

  /**
   * Pop off the last entry I.E "root.host1" and find the database record for that hostname
   */
  const hostKey = usernameArray.pop();
  console.log(hostKey);

  const host = await Host.findOne({
    relations: ['credentials'],
    where: {
      key: hostKey,
    },
  });

  console.log(host, hostKey);

  if (!host) {
    throw new Error('Invalid Host');
  }

  /**
   * Join the username again with `.` to support usernames inclduing `.`
   */
  const username = usernameArray.join('.');

  const [user, credentials] = await Promise.all([
    User.findOneOrFail({
      where: {
        username,
      },
    }),
    getConnection()
      .getRepository(Credential)
      .createQueryBuilder('credential')
      .leftJoinAndSelect('credential.users', 'users')
      .where('credential.hostId = :hostId', { hostId: host.id })
      .andWhere('users.username = :username', { username })
      .getOne(),
  ]);

  console.log(user, credentials);

  if (!user) {
    console.warn(`User ${username} doesn't exist. Rejecting Connection`);
    throw new Error('Invalid User');
  }

  console.log(ctx.method);

  switch (ctx.method) {
    case 'password':
      /**
       * Check that the incoming password matches what is in the database
       */
      if (user.password !== ctx.password) {
        console.log(`User password doesn't match`);
        throw new Error('Invalid Password');
      }

      console.log('Password correct');

      return {
        user,
        host,
        credentials,
      };
    default:
      throw new Error('Invalid Auth');
  }
}
