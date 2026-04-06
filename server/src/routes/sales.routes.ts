import { Router, Request, Response, NextFunction } from 'express';
import { findAllSales, getSaleStats, createSale } from '../services/sales.service';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string, 10) || 20);

    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;

    // Si dateTo viene sin hora, extenderlo al final del día
    if (dateTo && !isNaN(dateTo.getTime())) {
      dateTo.setHours(23, 59, 59, 999);
    }

    const { data, total } = await findAllSales(
      page,
      limit,
      dateFrom && !isNaN(dateFrom.getTime()) ? dateFrom : undefined,
      dateTo && !isNaN(dateTo.getTime()) ? dateTo : undefined,
    );
    res.json({
      success: true,
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getSaleStats();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await createSale(req.body);
    res.json({
      success: true,
      data,
      message: 'Venta registrada exitosamente',
    });
  } catch (err) {
    next(err);
  }
});

export default router;
