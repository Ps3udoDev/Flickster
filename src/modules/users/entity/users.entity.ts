import { Column, Entity } from 'typeorm';
import { ROLES } from '../../../constants/roles';
import { BaseEntity } from '../../../database/config/base.entity';
import { I_User } from '../../../interfaces/user.interface';

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
  password: string;

  @Column()
  token: string;

  @Column()
  codePhone: string;

  @Column()
  phone: string;

  @Column()
  imageURL: string;

  @Column({ type: 'enum', enum: ROLES })
  role: ROLES;

  @Column()
  isActive: boolean;
}
