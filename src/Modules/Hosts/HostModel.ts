// src/Modules/Hosts/HostModel.ts
import { Field, ID, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Credential } from '../Credentials/CredentialModel';

@ObjectType()
@Entity()
export class Host extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  public readonly id: string;

  @Field()
  @Column('varchar')
  public hostname: string;

  @Field()
  @Column('varchar')
  public key: string;

  @OneToMany('Credential', 'host')
  public credentials: Credential[];
}
