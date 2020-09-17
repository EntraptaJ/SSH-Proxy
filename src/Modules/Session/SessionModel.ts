import { Field, ID, ObjectType } from 'type-graphql';
// src/Modules/SessionModel.ts
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { History } from '../History/HistoryModel';
import { Host } from '../Hosts/HostModel';
import { User } from '../Users/UserModel';
import { SessionStatus } from './SessionState';

@ObjectType()
@Entity()
export class Session extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  public readonly id: string;

  @Field()
  @CreateDateColumn()
  public readonly startDate: Date;

  @Field(() => SessionStatus)
  @Column({
    type: 'enum',
    enum: SessionStatus,
  })
  public sessionStatus: SessionStatus;

  @Field(() => [History])
  @OneToMany('History', 'session')
  public history: History[];

  @ManyToOne(() => User)
  public user: User;

  @ManyToOne(() => Host)
  public host: Host;
}
