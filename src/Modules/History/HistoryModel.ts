// src/Modules/History/HistoryModel.ts
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Host } from '../Hosts/HostModel';
import { User } from '../Users/UserModel';

@Entity()
export class History extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @CreateDateColumn()
  public date: Date;

  @Column('varchar')
  public shellOutput: string;

  @ManyToOne(() => User)
  public user: User;

  @ManyToOne(() => Host)
  public host: Host;
}
