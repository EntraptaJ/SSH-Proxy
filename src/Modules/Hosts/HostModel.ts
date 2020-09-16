import { Field, ID, ObjectType } from 'type-graphql';
// src/Modules/Hosts/HostModel.ts
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
