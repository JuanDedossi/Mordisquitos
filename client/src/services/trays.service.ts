import api from './api';
import type { Tray, CreateTrayPayload, UpdateTrayPayload } from '../types/tray.types';

export interface TraysListResponse {
  success: boolean;
  data: Tray[];
  total: number;
  page: number;
  totalPages: number;
}

export const traysService = {
  async list(params: { page?: number; limit?: number; search?: string; sortByStock?: boolean; hasStock?: boolean } = {}): Promise<TraysListResponse> {
    const { data } = await api.get('/trays', { params });
    return data;
  },

  async getById(id: string): Promise<Tray> {
    const { data } = await api.get(`/trays/${id}`);
    return data.data;
  },

  async create(payload: CreateTrayPayload): Promise<Tray> {
    const { data } = await api.post('/trays', payload);
    return data.data;
  },

  async update(id: string, payload: UpdateTrayPayload): Promise<Tray> {
    const { data } = await api.patch(`/trays/${id}`, payload);
    return data.data;
  },

  async updatePrice(id: string, customSellingPrice: number | null): Promise<Tray> {
    const { data } = await api.patch(`/trays/${id}/price`, { customSellingPrice });
    return data.data;
  },

  async updateStock(id: string, stock: number): Promise<Tray> {
    const { data } = await api.patch(`/trays/${id}/stock`, { stock });
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/trays/${id}`);
  },
};
