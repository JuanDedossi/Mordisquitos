import { Types } from 'mongoose';
import { Sale, SaleDocument } from '../models/sale.model';
import { findRecipeById, updateRecipeStock } from './recipes.service';

export interface CreateSaleInput {
  items: { recipeId: string; quantity: number }[];
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
  const recipes = await Promise.all(
    dto.items.map((item) => findRecipeById(item.recipeId)),
  );

  const errors: string[] = [];
  for (let i = 0; i < dto.items.length; i++) {
    const recipe = recipes[i];
    const requested = dto.items[i].quantity;

    if (recipe.sellUnit === 'kg') {
      if (recipe.stock < requested) {
        errors.push(
          `Stock insuficiente de "${recipe.name}": disponible ${recipe.stock}g, solicitado ${requested}g`,
        );
      }
    } else {
      if (recipe.stock < requested) {
        errors.push(
          `Stock insuficiente de "${recipe.name}": disponible ${recipe.stock}, solicitado ${requested}`,
        );
      }
    }
  }

  if (errors.length > 0) {
    throw { status: 400, message: errors.join(' | ') };
  }

  await Promise.all(
    dto.items.map((item, i) =>
      updateRecipeStock(item.recipeId, {
        stock: recipes[i].stock - item.quantity,
      }),
    ),
  );

  const saleItems = dto.items.map((item, i) => {
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
      recipeId: new Types.ObjectId(item.recipeId),
      recipeName: recipe.name,
      quantity: item.quantity,
      unitPrice,
      subtotal,
    };
  });

  const total = saleItems.reduce((sum, item) => sum + item.subtotal, 0);

  const result = await Sale.create({ items: saleItems, total });
  return result as SaleDocument;
}
