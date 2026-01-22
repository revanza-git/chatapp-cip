import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: number;
  username: string;
  role: string;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function checkPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateJwt(user: { id: number; username: string; role: string }) {
  const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
  const expiresIn = '24h';
  const payload: JwtPayload = {
    userId: user.id,
    username: user.username,
    role: user.role
  };
  const token = jwt.sign(payload, secret, { expiresIn, issuer: 'security-chatbot' });
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return { token, expiresAt };
}

export function verifyJwt(token: string): JwtPayload {
  const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
  return jwt.verify(token, secret) as JwtPayload;
}
