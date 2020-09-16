// src/Users.ts
import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Host } from '../Hosts/HostModel';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public readonly id: string;

  @Column('varchar')
  public username: string;

  @Column('varchar')
  public password: string;

  @ManyToMany(() => Host)
  @JoinTable()
  public allowedHosts: Host[];
}
