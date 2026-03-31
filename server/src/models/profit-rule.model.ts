import mongoose, { Schema, Document } from 'mongoose';

export interface IProfitRule {
  name: string;
  description: string;
  marginPercentage: number;
}

export type ProfitRuleDocument = IProfitRule & Document;

const ProfitRuleSchema = new Schema<ProfitRuleDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    marginPercentage: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

export const ProfitRule =
  mongoose.models.ProfitRule ||
  mongoose.model<ProfitRuleDocument>('ProfitRule', ProfitRuleSchema);
