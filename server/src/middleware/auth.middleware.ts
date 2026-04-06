import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { getTenants, TenantConfig } from '../config/tenants';
import { runWithTenant } from './tenant-context';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const tenants = getTenants();
  console.log('Tenants configurados:', tenants.map(t => t.label).join(', '));

  // Dev mode: sin auth configurado → pasa todo
  if (tenants.length === 0) {
    next();
    return;
  }

  const token = req.headers['x-app-token'];

  if (!token || typeof token !== 'string') {
    res.status(401).json({ success: false, error: 'No autorizado' });
    return;
  }

  // Timing-safe comparison contra todos los tenants configurados
  let matchedTenant: TenantConfig | null = null;
  const tokenBuf = Buffer.from(token);

  for (const tenant of tenants) {
    try {
      const pinBuf = Buffer.from(tenant.pin);
      if (
        pinBuf.length === tokenBuf.length &&
        crypto.timingSafeEqual(pinBuf, tokenBuf)
      ) {
        if (!matchedTenant) matchedTenant = tenant;
      }
    } catch {
      // ignorar entradas inválidas
    }
  }

  if (!matchedTenant) {
    res.status(401).json({ success: false, error: 'No autorizado' });
    return;
  }

  const tenant = matchedTenant;
  runWithTenant({ dbName: tenant.dbName, label: tenant.label }, () => next());
}
