// src/Modules/Hosts/HostResolver.ts
import {
  Arg,
  FieldResolver,
  ID,
  Mutation,
  Query,
  Resolver,
  Root,
} from 'type-graphql';
import { CredentialInput } from '../Credentials/CredentialInput';
import { Credential } from '../Credentials/CredentialModel';
import { HostInput } from './HostInput';
import { Host } from './HostModel';

@Resolver(Host)
export class HostResovler {
  @Query(() => [Host])
  public async hosts(): Promise<Host[]> {
    return Host.find();
  }

  @Mutation(() => [Host])
  public async createHost(
    @Arg('input', () => HostInput) input: HostInput,
  ): Promise<Host[]> {
    const host = Host.create(input);

    await host.save();

    return Host.find();
  }

  @Mutation(() => Host)
  public async addCredential(
    @Arg('hostId', () => ID) hostId: string,
    @Arg('input', () => CredentialInput) input: CredentialInput,
  ): Promise<Host> {
    const [host] = await Promise.all([
      Host.findOneOrFail({
        where: {
          id: hostId,
        },
      }),
    ]);

    const credential = Credential.create({
      host,
      ...input,
    });

    await credential.save();

    return host;
  }

  @FieldResolver(() => [Credential])
  public async credentials(@Root() host: Host): Promise<Credential[]> {
    return Credential.find({
      where: {
        host,
      },
    });
  }

  // @FieldResolver(() => [User])
  // public async authorizedUsers(@Root() host: Host): Promise<User[]> {
  //   return getConnection()
  //     .getRepository(User)
  //     .createQueryBuilder('user')
  //     .leftJoinAndSelect('user.allowedHosts', 'allowedHosts')
  //     .where('allowedHosts.id = :hostId', { hostId: host.id })
  //     .getMany();
  // }
}
