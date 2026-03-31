import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPurchaseHistory {
  ingredientId: Types.ObjectId;
  ingredientName: string;
  unit: string;
  quantityPurchased: number;
  pricePaid: number;
  costPerKgAtPurchase?: number;
  costPerUnitAtPurchase?: number;
}

export type PurchaseHistoryDocument = IPurchaseHistory & Document;

const PurchaseHistorySchema = new Schema<PurchaseHistoryDocument>(
  {
    ingredientId: {
      type: Schema.Types.ObjectId,
      ref: 'Ingredient',
      required: true,
    },
    ingredientName: { type: String, required: true },
    unit: {
      type: String,
      required: true,
      default: 'kg',
      enum: ['kg', 'unidad'],
    },
    quantityPurchased: { type: Number, required: true, min: 0.01 },
    pricePaid: { type: Number, required: true, min: 0.01 },
    costPerKgAtPurchase: { type: Number },
    costPerUnitAtPurchase: { type: Number },
  },
  { timestamps: true },
);

export const PurchaseHistory =
  mongoose.models.PurchaseHistory ||
  mongoose.model<PurchaseHistoryDocument>(
    'PurchaseHistory',
    PurchaseHistorySchema,
  );
