import { Types } from 'mongoose';
import { Recipe, RecipeDocument } from '../models/recipe.model';
import { findIngredientsByIds } from './ingredients.service';
import { findProfitRuleById } from './profit-rules.service';

export interface EnrichedRecipe {
  _id: Types.ObjectId;
  name: string;
  ingredients: {
    ingredientId: string;
    ingredientName: string;
    ingredientUnit: string;
    quantity: number;
    cost: number;
  }[];
  cost: number;
  profitRuleId: Types.ObjectId;
  profitRuleName: string;
  marginPercentage: number;
  sellingPrice: number;
  sellUnit: string;
  yieldGrams: number;
  yieldUnits: number;
  customSellingPrice: number | null;
  pricePerKg: number;
  pricePer100g: number;
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRecipeInput {
  name: string;
  ingredients: { ingredientId: string; quantity: number }[];
  profitRuleId: string;
  sellUnit?: string;
  yieldGrams?: number;
  yieldUnits?: number;
}

export interface UpdateRecipeInput {
  name?: string;
  ingredients?: { ingredientId: string; quantity: number }[];
  profitRuleId?: string;
  sellUnit?: string;
  yieldGrams?: number;
  yieldUnits?: number;
}

export interface UpdateRecipePriceInput {
  customSellingPrice: number | null;
}

export interface UpdateStockInput {
  stock: number;
}

async function enrichRecipes(
  recipes: RecipeDocument[],
): Promise<EnrichedRecipe[]> {
  if (recipes.length === 0) return [];

  const ingredientIds = [
    ...new Set(
      recipes.flatMap((r) =>
        r.ingredients.map((i) => i.ingredientId.toString()),
      ),
    ),
  ];
  const ruleIds = [
    ...new Set(recipes.map((r) => r.profitRuleId.toString())),
  ];

  const [ingredients, ruleResults] = await Promise.all([
    findIngredientsByIds(ingredientIds),
    Promise.all(
      ruleIds.map((id) => findProfitRuleById(id).catch(() => null)),
    ),
  ]);

  const ingredientMap = new Map(
    ingredients.map((i) => [i._id.toString(), i]),
  );
  const ruleMap = new Map(
    ruleResults
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .map((r) => [r._id.toString(), r]),
  );

  return recipes.map((recipe) => {
    const rule = ruleMap.get(recipe.profitRuleId.toString());
    let totalCost = 0;

    const enrichedIngredients = recipe.ingredients.map((ri) => {
      const ing = ingredientMap.get(ri.ingredientId.toString());
      let cost = 0;
      if (ing) {
        cost =
          ing.unit === 'unidad'
            ? ing.costPerUnit * ri.quantity
            : (ing.costPerKg * ri.quantity) / 1000;
      }
      totalCost += cost;
      return {
        ingredientId: ri.ingredientId.toString(),
        ingredientName: ing?.name ?? 'Desconocido',
        ingredientUnit: ing?.unit ?? 'kg',
        quantity: ri.quantity,
        cost,
      };
    });

    const margin = rule?.marginPercentage ?? 0;
    const sellUnit = recipe.sellUnit ?? 'unidad';
    const yieldGrams = recipe.yieldGrams ?? 0;
    const yieldUnits = (recipe as any).yieldUnits ?? 1;
    const customSellingPrice: number | null = (recipe as any).customSellingPrice ?? null;

    let sellingPrice: number;
    let pricePerKg = 0;

    if (customSellingPrice !== null) {
      sellingPrice = customSellingPrice;
      if (sellUnit === 'kg') pricePerKg = customSellingPrice;
    } else if (sellUnit === 'kg' && yieldGrams > 0) {
      const costPerKg = (totalCost / yieldGrams) * 1000;
      pricePerKg = costPerKg * (1 + margin / 100);
      sellingPrice = pricePerKg;
    } else {
      sellingPrice = (totalCost * (1 + margin / 100)) / yieldUnits;
    }

    const obj = (recipe as any).toObject();

    const pricePer100g = sellUnit === 'kg' ? pricePerKg / 10 : 0;

    return {
      ...obj,
      ingredients: enrichedIngredients,
      cost: totalCost,
      profitRuleName: rule?.name ?? 'Desconocido',
      marginPercentage: margin,
      sellingPrice,
      sellUnit,
      yieldGrams,
      yieldUnits,
      customSellingPrice,
      pricePerKg,
      pricePer100g,
    };
  });
}

async function enrichRecipe(
  recipe: RecipeDocument,
): Promise<EnrichedRecipe> {
  const [result] = await enrichRecipes([recipe]);
  return result;
}

export async function findAllRecipes(
  page = 1,
  limit = 10,
  search?: string,
): Promise<{ data: EnrichedRecipe[]; total: number }> {
  const query = search ? { name: { $regex: search, $options: 'i' } } : {};

  const [rawData, total] = await Promise.all([
    Recipe.find(query)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec(),
    Recipe.countDocuments(query),
  ]);

  const data = await enrichRecipes(rawData as RecipeDocument[]);
  return { data, total };
}

export async function findRecipeById(id: string): Promise<EnrichedRecipe> {
  const recipe = await Recipe.findById(id).exec();
  if (!recipe) {
    throw { status: 404, message: 'Receta no encontrada' };
  }
  return enrichRecipe(recipe as RecipeDocument);
}

export async function createRecipe(
  dto: CreateRecipeInput,
): Promise<EnrichedRecipe> {
  const existing = await Recipe.findOne({
    name: { $regex: `^${dto.name}$`, $options: 'i' },
  }).exec();
  if (existing) {
    throw {
      status: 409,
      message: `Ya existe una receta con el nombre "${dto.name}"`,
    };
  }

  await findProfitRuleById(dto.profitRuleId);
  const found = await findIngredientsByIds(
    dto.ingredients.map((i) => i.ingredientId),
  );
  if (found.length !== dto.ingredients.length) {
    throw { status: 404, message: 'Uno o más ingredientes no existen' };
  }

  const recipe = await Recipe.create({
    name: dto.name,
    ingredients: dto.ingredients.map((i) => ({
      ingredientId: new Types.ObjectId(i.ingredientId),
      quantity: i.quantity,
    })),
    profitRuleId: new Types.ObjectId(dto.profitRuleId),
    sellUnit: dto.sellUnit ?? 'unidad',
    yieldGrams: dto.yieldGrams,
    yieldUnits: dto.yieldUnits ?? 1,
  });

  return enrichRecipe(recipe as RecipeDocument);
}

export async function updateRecipe(
  id: string,
  dto: UpdateRecipeInput,
): Promise<EnrichedRecipe> {
  const recipe = await Recipe.findById(id).exec();
  if (!recipe) throw { status: 404, message: 'Receta no encontrada' };

  if (dto.name && dto.name !== (recipe as RecipeDocument).name) {
    const existing = await Recipe.findOne({
      name: { $regex: `^${dto.name}$`, $options: 'i' },
      _id: { $ne: id },
    }).exec();
    if (existing) {
      throw {
        status: 409,
        message: `Ya existe una receta con el nombre "${dto.name}"`,
      };
    }
  }

  const updates: Record<string, unknown> = {};
  if (dto.name) updates.name = dto.name;

  if (dto.profitRuleId) {
    await findProfitRuleById(dto.profitRuleId);
    updates.profitRuleId = new Types.ObjectId(dto.profitRuleId);
  }

  if (dto.ingredients) {
    const found = await findIngredientsByIds(
      dto.ingredients.map((i) => i.ingredientId),
    );
    if (found.length !== dto.ingredients.length) {
      throw { status: 404, message: 'Uno o más ingredientes no existen' };
    }
    updates.ingredients = dto.ingredients.map((i) => ({
      ingredientId: new Types.ObjectId(i.ingredientId),
      quantity: i.quantity,
    }));
    updates.customSellingPrice = null;
  }

  if (dto.sellUnit !== undefined) updates.sellUnit = dto.sellUnit;
  if (dto.yieldGrams !== undefined) updates.yieldGrams = dto.yieldGrams;
  if (dto.yieldUnits !== undefined) updates.yieldUnits = dto.yieldUnits;

  const updated = await Recipe.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true },
  ).exec();
  if (!updated) throw { status: 404, message: 'Receta no encontrada' };
  return enrichRecipe(updated as RecipeDocument);
}

export async function updateRecipePrice(
  id: string,
  dto: UpdateRecipePriceInput,
): Promise<EnrichedRecipe> {
  const updated = await Recipe.findByIdAndUpdate(
    id,
    { $set: { customSellingPrice: dto.customSellingPrice } },
    { new: true },
  ).exec();
  if (!updated) throw { status: 404, message: 'Receta no encontrada' };
  return enrichRecipe(updated as RecipeDocument);
}

export async function updateRecipeStock(
  id: string,
  dto: UpdateStockInput,
): Promise<EnrichedRecipe> {
  const updated = await Recipe.findByIdAndUpdate(
    id,
    { $set: { stock: dto.stock } },
    { new: true },
  ).exec();
  if (!updated) throw { status: 404, message: 'Receta no encontrada' };
  return enrichRecipe(updated as RecipeDocument);
}

export async function deleteRecipe(id: string): Promise<void> {
  const recipe = await Recipe.findById(id).exec();
  if (!recipe) throw { status: 404, message: 'Receta no encontrada' };
  await Recipe.findByIdAndDelete(id).exec();
}

export async function toggleRecipeActive(
  id: string,
): Promise<EnrichedRecipe> {
  const recipe = (await Recipe.findById(id).exec()) as RecipeDocument | null;
  if (!recipe) throw { status: 404, message: 'Receta no encontrada' };
  const updated = await Recipe.findByIdAndUpdate(
    id,
    { $set: { isActive: !recipe.isActive } },
    { new: true },
  ).exec();
  if (!updated) throw { status: 404, message: 'Receta no encontrada' };
  return enrichRecipe(updated as RecipeDocument);
}
