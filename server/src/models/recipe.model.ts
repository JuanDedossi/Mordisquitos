import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRecipeIngredient {
  ingredientId: Types.ObjectId;
  quantity: number;
}

export interface IRecipe {
  name: string;
  ingredients: IRecipeIngredient[];
  profitRuleId: Types.ObjectId;
  sellUnit: string;
  yieldGrams: number;
  stock: number;
  isActive: boolean;
}

export type RecipeDocument = IRecipe & Document;

const RecipeIngredientSchema = new Schema(
  {
    ingredientId: {
      type: Schema.Types.ObjectId,
      ref: 'Ingredient',
      required: true,
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
    stock: { type: Number, required: true, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Recipe =
  mongoose.models.Recipe ||
  mongoose.model<RecipeDocument>('Recipe', RecipeSchema);
