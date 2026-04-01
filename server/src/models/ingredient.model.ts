import mongoose, { Schema, Document } from 'mongoose';

export interface IIngredient {
  name: string;
  unit: string;
  costPerKg: number;
  costPer100g: number;
  costPerUnit: number;
}

export type IngredientDocument = IIngredient & Document;

const IngredientSchema = new Schema<IngredientDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    unit: {
      type: String,
      required: true,
      default: 'kg',
      enum: ['kg', 'unidad'],
    },
    costPerKg: { type: Number, default: 0 },
    costPer100g: { type: Number, default: 0 },
    costPerUnit: { type: Number, default: 0 },
  },
  { timestamps: true },
);

IngredientSchema.index({ name: 'text' });

export const Ingredient =
  (mongoose.models.Ingredient as mongoose.Model<IngredientDocument>) ||
  mongoose.model<IngredientDocument>('Ingredient', IngredientSchema);
