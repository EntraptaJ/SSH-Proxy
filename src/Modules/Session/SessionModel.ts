// src/Modules/SessionModel.ts
import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { History } from '../History/HistoryModel';
import { Host } from '../Hosts/HostModel';
import { User } from '../Users/UserModel';

@Entity()
export class Session extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public readonly id: string;

  @CreateDateColumn()
  public readonly startDate: Date;

  @OneToMany(() => History, (history) => history.session)
  public history: History[];

  @ManyToOne(() => User)
  public user: User;

  @ManyToOne(() => Host)
  public host: Host;
}
