export interface SaleItem {
  recipeId: string;
  recipeName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  _id: string;
  items: SaleItem[];
  total: number;
  createdAt: string;
}

export interface CreateSalePayload {
  items: { recipeId: string; quantity: number }[];
}

export interface SaleStats {
  weekly: number;
  monthly: number;
}
