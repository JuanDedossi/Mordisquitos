import { Types } from 'mongoose';
import { Sale, SaleDocument } from '../models/sale.model';
import { findRecipeById, updateRecipeStock } from './recipes.service';
import { findTrayById, updateTrayStock } from './trays.service';

export interface CreateSaleInput {
  items: { recipeId?: string; trayId?: string; quantity: number }[];
}

export async function findAllSales(
  page = 1,
  limit = 20,
): Promise<{ data: SaleDocument[]; total: number }> {
  const [data, total] = await Promise.all([
    Sale.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec(),
    Sale.countDocuments(),
  ]);
  return { data: data as SaleDocument[], total };
}

export async function getSaleStats(): Promise<{
  weekly: number;
  monthly: number;
}> {
  const now = new Date();
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [weeklyResult, monthlyResult] = await Promise.all([
    Sale.aggregate([
      { $match: { createdAt: { $gte: weekStart } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Sale.aggregate([
      { $match: { createdAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
  ]);

  return {
    weekly: weeklyResult[0]?.total ?? 0,
    monthly: monthlyResult[0]?.total ?? 0,
  };
}

export async function createSale(
  dto: CreateSaleInput,
): Promise<SaleDocument> {
  const recipeItems = dto.items.filter((i) => i.recipeId);
  const trayItems = dto.items.filter((i) => i.trayId);

  const [recipes, trays] = await Promise.all([
    Promise.all(recipeItems.map((item) => findRecipeById(item.recipeId!))),
    Promise.all(trayItems.map((item) => findTrayById(item.trayId!))),
  ]);

  const errors: string[] = [];

  // Validate recipe stock
  for (let i = 0; i < recipeItems.length; i++) {
    const recipe = recipes[i];
    const requested = recipeItems[i].quantity;
    if (recipe.stock < requested) {
      const unit = recipe.sellUnit === 'kg' ? 'g' : '';
      errors.push(
        `Stock insuficiente de "${recipe.name}": disponible ${recipe.stock}${unit}, solicitado ${requested}${unit}`,
      );
    }
  }

  // Validate tray stock
  for (let i = 0; i < trayItems.length; i++) {
    const tray = trays[i];
    const requested = trayItems[i].quantity;
    if (tray.stock < requested) {
      errors.push(
        `Stock insuficiente de bandeja "${tray.name}": disponible ${tray.stock}, solicitado ${requested}`,
      );
    }
  }

  if (errors.length > 0) {
    throw { status: 400, message: errors.join(' | ') };
  }

  // Deduct stock
  await Promise.all([
    ...recipeItems.map((item, i) =>
      updateRecipeStock(item.recipeId!, {
        stock: recipes[i].stock - item.quantity,
      }),
    ),
    ...trayItems.map((item, i) =>
      updateTrayStock(item.trayId!, {
        stock: trays[i].stock - item.quantity,
      }),
    ),
  ]);

  // Build sale items
  const saleItems = [
    ...recipeItems.map((item, i) => {
      const recipe = recipes[i];
      let subtotal: number;
      let unitPrice: number;

      if (recipe.sellUnit === 'kg') {
        unitPrice = recipe.pricePerKg;
        subtotal = (item.quantity / 1000) * recipe.pricePerKg;
      } else {
        unitPrice = recipe.sellingPrice;
        subtotal = item.quantity * recipe.sellingPrice;
      }

      return {
        itemType: 'recipe' as const,
        recipeId: new Types.ObjectId(item.recipeId!),
        recipeName: recipe.name,
        quantity: item.quantity,
        unitPrice,
        subtotal,
      };
    }),
    ...trayItems.map((item, i) => {
      const tray = trays[i];
      const unitPrice = tray.sellingPrice;
      const subtotal = item.quantity * unitPrice;

      return {
        itemType: 'tray' as const,
        trayId: new Types.ObjectId(item.trayId!),
        recipeName: tray.name,
        quantity: item.quantity,
        unitPrice,
        subtotal,
      };
    }),
  ];

  const total = saleItems.reduce((sum, item) => sum + item.subtotal, 0);

  const result = await Sale.create({ items: saleItems, total });
  return result as SaleDocument;
}
