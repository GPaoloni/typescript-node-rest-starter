export type AuthToken = {
  accessToken: string;
  kind: string;
};

export interface Profile {
  info: string;
  fname: string;
  lname: string;
}

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
}
