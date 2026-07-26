import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryColumn({ name: 'username' })
  username!: string;

  @Column({ name: 'password' })
  password!: string;

  @Column({ name: 'role', type: 'varchar', nullable: true })
  role!: string | null;
}
