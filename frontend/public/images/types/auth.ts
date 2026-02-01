export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  bio?: string;
  isVerified: boolean;
  followers: number;
  following: number;
  posts: number;
  createdAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface DecodedToken {
  sub: string;
  username: string;
  email: string;
  exp: number;
  iat: number;
}
