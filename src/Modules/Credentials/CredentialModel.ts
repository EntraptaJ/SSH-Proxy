// src/Modules/Credentials/CredentialModel.ts
import { Field, ID, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Host } from '../Hosts/HostModel';
import { User } from '../Users/UserModel';

@ObjectType()
@Entity()
export class Credential extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  public readonly id: string;

  @Field()
  @CreateDateColumn()
  public readonly creationDate: Date;

  @Column('varchar')
  @Field()
  public username: string;

  @Column('varchar')
  public password: string;

  @Field(() => [User])
  @ManyToMany(() => User, { lazy: true })
  @JoinTable()
  public users: User[];

  @ManyToOne(() => Host, (host) => host.credentials)
  public host: Host;

  @Column()
  public hostId: string;
}
