import * as bcrypt from 'bcrypt';
import { ErrorManager } from 'src/utils/error.manager';

export const hashedPassword = (plainPassword: string): string => {
  return bcrypt.hashSync(plainPassword, 12);
};

export const comparePassword = (
  plainPassword: string,
  hashedPassword: string,
): boolean => {
  if (!plainPassword)
    throw new ErrorManager({
      type: 'BAD_REQUEST',
      message: 'Password not provided for compare',
    });

  if (!hashedPassword)
    throw new ErrorManager({
      type: 'INTERNAL_SERVER_ERROR',
      message: 'The user account is not well setted, contact admin',
    });

  const provePassword = bcrypt.compareSync(plainPassword, hashedPassword);
  if (provePassword) {
    return provePassword;
  } else {
    throw new ErrorManager({
      type: 'UNAUTHORIZED',
      message: 'Wrong Credentials',
    });
  }
};
