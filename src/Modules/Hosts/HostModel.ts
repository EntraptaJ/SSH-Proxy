// src/Modules/Hosts/HostModel.ts
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Host extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public readonly id: string;

  @Column('varchar')
  public hostname: string;

  @Column('varchar')
  public key: string;
}
