"server-only";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { IAuthJwt } from "./types";

export function hashString(data: string) {
  return bcrypt.hash(data, 10);
}

export function verifyHash(hash: string, originalData: string) {
  return bcrypt.compare(originalData, hash);
}

export function generateToken(payload: IAuthJwt, secret: string) {
  return jwt.sign(payload, process.env.JWT_SECRET_KEY + secret, { expiresIn: "1d" });
}

export function decodeToken<T>(token: string) {
  return (jwt.decode(token.trim()) || {}) as T;
}

export function verifyToken<T>(token: string, secret: string) {
  return (jwt.verify(token.trim(), process.env.JWT_SECRET_KEY + secret) || {}) as T;
}
