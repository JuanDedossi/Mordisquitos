import mongoose, { Schema, Document, Types } from 'mongoose';
import { getTenantDb } from '../middleware/tenant-context';

export interface ITrayRecipe {
  recipeId: Types.ObjectId;
  quantity: number;
}

export interface ITray {
  name: string;
  recipes: ITrayRecipe[];
  profitRuleId: Types.ObjectId;
  customSellingPrice: number | null;
  stock: number;
  isActive: boolean;
}

export type TrayDocument = ITray & Document;

const TrayRecipeSchema = new Schema(
  {
    recipeId: {
      type: Schema.Types.ObjectId,
      ref: 'Recipe',
      required: true,
    },
    quantity: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const TraySchema = new Schema<TrayDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    recipes: { type: [TrayRecipeSchema], default: [] },
    profitRuleId: {
      type: Schema.Types.ObjectId,
      ref: 'ProfitRule',
      required: true,
    },
    customSellingPrice: { type: Number, default: null },
    stock: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export function getTrayModel(): mongoose.Model<TrayDocument> {
  const db = mongoose.connection.useDb(getTenantDb(), { useCache: true });
  return (db.models['Tray'] as mongoose.Model<TrayDocument>) ??
    db.model<TrayDocument>('Tray', TraySchema);
}
