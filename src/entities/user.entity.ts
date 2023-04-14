import { UserStatus } from '@enums';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity()
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  username!: string;

  @Column({ type: 'varchar', select: false, nullable: true })
  password: string | null;

  @Column({ type: 'varchar', nullable: true })
  firstName: string | null;

  @Column({ type: 'varchar', nullable: true })
  lastName: string | null;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.INACTIVE })
  status: UserStatus;

  @Column('varchar', { nullable: true })
  verifyToken?: string;
}
