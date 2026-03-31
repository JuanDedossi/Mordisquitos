import {
  Ingredient,
  IngredientDocument,
} from '../models/ingredient.model';
import { PurchaseHistory } from '../models/purchase-history.model';

export interface RegisterPurchaseInput {
  ingredientName: string;
  isNew?: boolean;
  ingredientId?: string;
  unit?: string;
  quantityPurchased: number;
  pricePaid: number;
}

export interface UpdateIngredientInput {
  name: string;
}

export async function findAllIngredients(
  page = 1,
  limit = 10,
  search?: string,
): Promise<{ data: IngredientDocument[]; total: number }> {
  const query = search ? { name: { $regex: search, $options: 'i' } } : {};

  const [data, total] = await Promise.all([
    Ingredient.find(query)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec(),
    Ingredient.countDocuments(query),
  ]);

  return { data: data as IngredientDocument[], total };
}

export async function findIngredientById(
  id: string,
): Promise<IngredientDocument> {
  const ingredient = await Ingredient.findById(id).exec();
  if (!ingredient) {
    throw { status: 404, message: 'Ingrediente no encontrado' };
  }
  return ingredient as IngredientDocument;
}

export async function findIngredientsByIds(
  ids: string[],
): Promise<IngredientDocument[]> {
  const result = await Ingredient.find({ _id: { $in: ids } }).exec();
  return result as IngredientDocument[];
}

export async function registerPurchase(
  dto: RegisterPurchaseInput,
): Promise<IngredientDocument> {
  const unit = dto.unit ?? 'kg';
  const isWeight = unit === 'kg';

  const costPerKg = isWeight
    ? (dto.pricePaid / dto.quantityPurchased) * 1000
    : 0;
  const costPer100g = isWeight ? costPerKg / 10 : 0;
  const costPerUnit = !isWeight
    ? dto.pricePaid / dto.quantityPurchased
    : 0;

  let ingredient: IngredientDocument | null = null;

  if (dto.isNew || !dto.ingredientId) {
    const existing = await Ingredient.findOne({
      name: { $regex: `^${dto.ingredientName}$`, $options: 'i' },
    }).exec();
    if (existing) {
      throw {
        status: 409,
        message: `Ya existe un ingrediente con el nombre "${dto.ingredientName}"`,
      };
    }
    ingredient = (await Ingredient.create({
      name: dto.ingredientName,
      unit,
      costPerKg,
      costPer100g,
      costPerUnit,
    })) as IngredientDocument;
  } else {
    const updateFields: Record<string, number> = isWeight
      ? { costPerKg, costPer100g }
      : { costPerUnit };
    ingredient = (await Ingredient.findByIdAndUpdate(
      dto.ingredientId,
      updateFields,
      { new: true },
    ).exec()) as IngredientDocument | null;
    if (!ingredient) {
      throw { status: 404, message: 'Ingrediente no encontrado' };
    }
  }

  await PurchaseHistory.create({
    ingredientId: ingredient._id,
    ingredientName: ingredient.name,
    unit,
    quantityPurchased: dto.quantityPurchased,
    pricePaid: dto.pricePaid,
    costPerKgAtPurchase: isWeight ? costPerKg : undefined,
    costPerUnitAtPurchase: !isWeight ? costPerUnit : undefined,
  });

  return ingredient;
}

export async function updateIngredient(
  id: string,
  dto: UpdateIngredientInput,
): Promise<IngredientDocument> {
  const existing = await Ingredient.findOne({
    name: { $regex: `^${dto.name}$`, $options: 'i' },
    _id: { $ne: id },
  }).exec();
  if (existing) {
    throw {
      status: 409,
      message: `Ya existe un ingrediente con el nombre "${dto.name}"`,
    };
  }

  const ingredient = (await Ingredient.findByIdAndUpdate(
    id,
    { name: dto.name },
    { new: true },
  ).exec()) as IngredientDocument | null;
  if (!ingredient) {
    throw { status: 404, message: 'Ingrediente no encontrado' };
  }
  return ingredient;
}

export async function deleteIngredient(id: string): Promise<void> {
  const ingredient = await Ingredient.findById(id).exec();
  if (!ingredient) {
    throw { status: 404, message: 'Ingrediente no encontrado' };
  }
  await Ingredient.deleteOne({ _id: id }).exec();
}

export async function checkIngredientInUse(_id: string): Promise<boolean> {
  return false;
}
