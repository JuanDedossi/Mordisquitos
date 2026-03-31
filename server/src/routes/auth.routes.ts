import { Router, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const pin = typeof _req.query.pin === 'string' ? _req.query.pin : undefined;

  if (pin !== process.env.APP_SECRET) {
    return res.status(401).json({ success: false, error: 'No autorizado' });
  }
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;
