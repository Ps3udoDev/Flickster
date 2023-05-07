export interface AuthTokenResult {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export interface IUseToken {
  id: string;
  email: string;
  role: string;
  isExpired: boolean;
}
