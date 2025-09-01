export interface JwtPayload {
  id: string;
  role: 'USER' | 'ADMIN';
}
