import api from './api';
import type { ProfitRule, CreateProfitRulePayload, UpdateProfitRulePayload } from '../types/profit-rule.types';

export const profitRulesService = {
  async list(): Promise<ProfitRule[]> {
    const { data } = await api.get('/profit-rules');
    return data.data;
  },

  async create(payload: CreateProfitRulePayload): Promise<ProfitRule> {
    const { data } = await api.post('/profit-rules', payload);
    return data.data;
  },

  async update(id: string, payload: UpdateProfitRulePayload): Promise<ProfitRule> {
    const { data } = await api.patch(`/profit-rules/${id}`, payload);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/profit-rules/${id}`);
  },
};
