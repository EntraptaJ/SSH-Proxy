import { Field, ID, ObjectType } from 'type-graphql';
// src/Modules/History/HistoryModel.ts
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Host } from '../Hosts/HostModel';
import type { Session } from '../Session/SessionModel';
import type { User } from '../Users/UserModel';

@ObjectType()
@Entity()
export class History extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Field()
  @CreateDateColumn()
  public date: Date;

  @Field()
  @Column('text', {
    select: false,
  })
  public shellOutput: string;

  @ManyToOne('User')
  public user: User;

  @ManyToOne('Host')
  public host: Host;

  @ManyToOne('Session', 'history')
  @JoinColumn()
  public session: Session;
}
