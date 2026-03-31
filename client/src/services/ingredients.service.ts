import api from './api';
import type { Ingredient, RegisterPurchasePayload, UpdateIngredientPayload } from '../types/ingredient.types';

export interface IngredientsListResponse {
  success: boolean;
  data: Ingredient[];
  total: number;
  page: number;
  totalPages: number;
}

export const ingredientsService = {
  async list(params: { page?: number; limit?: number; search?: string } = {}): Promise<IngredientsListResponse> {
    const { data } = await api.get('/ingredients', { params });
    return data;
  },

  async registerPurchase(payload: RegisterPurchasePayload): Promise<Ingredient> {
    const { data } = await api.post('/ingredients/purchase', payload);
    return data.data;
  },

  async update(id: string, payload: UpdateIngredientPayload): Promise<Ingredient> {
    const { data } = await api.put(`/ingredients/${id}`, payload);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/ingredients/${id}`);
  },
};
