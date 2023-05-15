import { Column, Entity } from 'typeorm';
import { ROLES } from '../../../constants/roles';
import { BaseEntity } from '../../../database/config/base.entity';
import { I_User } from '../../../interfaces/user.interface';
import { Exclude } from 'class-transformer';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity implements I_User {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true })
  token: string;

  @Column()
  codePhone: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  imageURL: string;

  @Column({ type: 'enum', enum: ROLES, default: 'NORMAL' })
  role: ROLES;

  @Column({ default: false })
  isActive: boolean;
}
