// src/Modules/SSH/Auth.ts

import { AuthContext } from 'ssh2';
import { getConnection } from 'typeorm';
import { Host } from '../Hosts/HostModel';
import { User } from '../Users/UserModel';

export async function performAuth(
  ctx: AuthContext
): Promise<{ host: Host; user: User }> {
  /**
   * Split username to array with "." as the seperator
   */
  const usernameArray = ctx.username.split('.');

  /**
   * Pop off the last entry I.E "root.host1" and find the database record for that hostname
   */
  const hostKey = usernameArray.pop();
  const host = await Host.findOne({
    where: {
      key: hostKey,
    },
  });

  if (!host) {
    throw new Error('Invalid Host');
  }

  /**
   * Join the username again with `.` to support usernames inclduing `.`
   */
  const username = usernameArray.join('.');
  const user = await getConnection()
    .getRepository(User)
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.allowedHosts', 'allowedHosts')
    .where('user.username = :username', { username })
    .andWhere('allowedHosts.id = :hostId', { hostId: host.id })
    .getOne();

  if (!user) {
    console.warn(`User ${username} doesn't exist. Rejecting Connection`);
    throw new Error('Invalid User');
  }

  if (!user.allowedHosts) {
    console.warn(`${username} attempting to access ${host.hostname}`);

    throw new Error('User not authorized for host');
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

      return {
        user,
        host,
      };
    default:
      throw new Error('Invalid Auth');
  }
}
