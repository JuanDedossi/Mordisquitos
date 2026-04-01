import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITrayRecipe {
  recipeId: Types.ObjectId;
  quantity: number;
}

export interface ITray {
  name: string;
  recipes: ITrayRecipe[];
  profitRuleId: Types.ObjectId;
  customSellingPrice: number | null;
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
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Tray =
  (mongoose.models.Tray as mongoose.Model<TrayDocument>) ||
  mongoose.model<TrayDocument>('Tray', TraySchema);
