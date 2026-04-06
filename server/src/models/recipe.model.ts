import mongoose, { Schema, Document, Types } from 'mongoose';
import { getTenantDb } from '../middleware/tenant-context';

export interface IRecipeIngredient {
  type: 'ingredient' | 'subRecipe';
  ingredientId?: Types.ObjectId;
  recipeId?: Types.ObjectId;
  quantity: number;
}

export interface IRecipe {
  name: string;
  ingredients: IRecipeIngredient[];
  profitRuleId: Types.ObjectId;
  sellUnit: string;
  yieldGrams: number;
  yieldUnits: number;
  customSellingPrice: number | null;
  stock: number;
  isActive: boolean;
  isSubRecipe: boolean;
}

export type RecipeDocument = IRecipe & Document;

const RecipeIngredientSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['ingredient', 'subRecipe'],
      default: 'ingredient',
    },
    ingredientId: {
      type: Schema.Types.ObjectId,
      ref: 'Ingredient',
      required: false,
    },
    recipeId: {
      type: Schema.Types.ObjectId,
      ref: 'Recipe',
      required: false,
    },
    quantity: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const RecipeSchema = new Schema<RecipeDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    ingredients: { type: [RecipeIngredientSchema], default: [] },
    profitRuleId: {
      type: Schema.Types.ObjectId,
      ref: 'ProfitRule',
      required: true,
    },
    sellUnit: {
      type: String,
      required: true,
      default: 'unidad',
      enum: ['unidad', 'kg'],
    },
    yieldGrams: { type: Number, min: 0 },
    yieldUnits: { type: Number, min: 1, default: 1 },
    customSellingPrice: { type: Number, default: null },
    stock: { type: Number, required: true, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    isSubRecipe: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export function getRecipeModel(): mongoose.Model<RecipeDocument> {
  const db = mongoose.connection.useDb(getTenantDb(), { useCache: true });
  return (db.models['Recipe'] as mongoose.Model<RecipeDocument>) ??
    db.model<RecipeDocument>('Recipe', RecipeSchema);
}
