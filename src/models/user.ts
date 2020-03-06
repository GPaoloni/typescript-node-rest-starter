import { AuthToken } from './auth-token';
import { Profile } from './profile';

export interface User {
  email: string;
  password: string;
  username?: string;
  role?: string;

  active?: boolean;

  passwordResetToken?: string;
  passwordResetExpires?: Date;

  activationToken?: string;
  activationExpires?: Date;

  tokens?: Array<AuthToken>;

  profile?: Profile;

  comparePassword: (candidatePassword: string) => Promise<boolean>;
}