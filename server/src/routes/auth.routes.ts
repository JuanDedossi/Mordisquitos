import { Router, Request, Response } from 'express';
import { getTenants, resolveTenantByPin } from '../config/tenants';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const pin = typeof _req.query.pin === 'string' ? _req.query.pin : undefined;

  if (!pin) {
    return res.status(401).json({ success: false, error: 'No autorizado' });
  }

  const tenants = getTenants();

  // Dev mode: sin auth configurado
  if (tenants.length === 0) {
    return res.json({ status: 'ok', user: 'dev', timestamp: new Date().toISOString() });
  }

  const tenant = resolveTenantByPin(pin);
  if (!tenant) {
    return res.status(401).json({ success: false, error: 'No autorizado' });
  }

  res.json({
    status: 'ok',
    user: tenant.label,
    timestamp: new Date().toISOString(),
  });
});

export default router;
