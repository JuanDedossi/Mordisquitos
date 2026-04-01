import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISaleItem {
  recipeId: Types.ObjectId;
  recipeName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface ISale {
  items: ISaleItem[];
  total: number;
}

export type SaleDocument = ISale & Document;

const SaleItemSchema = new Schema(
  {
    recipeId: {
      type: Schema.Types.ObjectId,
      ref: 'Recipe',
      required: true,
    },
    recipeName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    unitPrice: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const SaleSchema = new Schema<SaleDocument>(
  {
    items: { type: [SaleItemSchema], required: true },
    total: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true },
);

export const Sale =
  (mongoose.models.Sale as mongoose.Model<SaleDocument>) ||
  mongoose.model<SaleDocument>('Sale', SaleSchema);
