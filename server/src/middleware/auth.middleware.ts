import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const secret = process.env.APP_SECRET;

  // Sin APP_SECRET configurado → dev mode, pasa todo
  if (!secret) {
    next();
    return;
  }

  const token = req.headers['x-app-token'];

  if (!token || typeof token !== 'string') {
    res.status(401).json({ success: false, error: 'No autorizado' });
    return;
  }

  // Timing-safe comparison para prevenir timing attacks
  try {
    const secretBuf = Buffer.from(secret);
    const tokenBuf = Buffer.from(token);

    if (
      secretBuf.length !== tokenBuf.length ||
      !crypto.timingSafeEqual(secretBuf, tokenBuf)
    ) {
      res.status(401).json({ success: false, error: 'No autorizado' });
      return;
    }
  } catch {
    res.status(401).json({ success: false, error: 'No autorizado' });
    return;
  }

  next();
}
