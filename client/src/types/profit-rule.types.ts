export interface ProfitRule {
  _id: string;
  name: string;
  description: string;
  marginPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfitRulePayload {
  name: string;
  description?: string;
  marginPercentage: number;
}

export interface UpdateProfitRulePayload {
  name?: string;
  description?: string;
  marginPercentage?: number;
}
