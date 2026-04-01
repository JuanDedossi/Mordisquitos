export interface RecipeIngredient {
  ingredientId: string;
  ingredientName: string;
  ingredientUnit: string;
  quantity: number;
  cost: number;
}

export interface Recipe {
  _id: string;
  name: string;
  ingredients: RecipeIngredient[];
  cost: number;
  profitRuleId: string;
  profitRuleName: string;
  marginPercentage: number;
  sellingPrice: number;
  sellUnit: string;
  yieldGrams: number;
  yieldUnits: number;
  pricePerKg: number;
  pricePer100g: number;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecipePayload {
  name: string;
  ingredients: { ingredientId: string; quantity: number }[];
  profitRuleId: string;
  sellUnit?: string;
  yieldGrams?: number;
  yieldUnits?: number;
}

export interface UpdateRecipePayload {
  name?: string;
  ingredients?: { ingredientId: string; quantity: number }[];
  profitRuleId?: string;
  sellUnit?: string;
  yieldGrams?: number;
  yieldUnits?: number;
}
