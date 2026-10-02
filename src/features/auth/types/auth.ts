export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface AuthUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  activeRole: string;
}

export interface LoginResult {
  user: AuthUser;
  token: string;
}
