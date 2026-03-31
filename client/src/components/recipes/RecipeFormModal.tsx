import { useState, useEffect } from 'react';
import { MdAdd, MdClose } from 'react-icons/md';
import { Modal } from '../common/Modal';
import type { Ingredient } from '../../types/ingredient.types';
import type { ProfitRule } from '../../types/profit-rule.types';
import type { CreateRecipePayload } from '../../types/recipe.types';

interface IngredientRow {
  id: number;
  ingredientId: string;
  quantity: string;
}

interface RecipeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateRecipePayload) => Promise<void>;
  ingredients: Ingredient[];
  profitRules: ProfitRule[];
}

let rowCounter = 0;

export function RecipeFormModal({ isOpen, onClose, onSubmit, ingredients, profitRules }: RecipeFormModalProps) {
  const [name, setName] = useState('');
  const [rows, setRows] = useState<IngredientRow[]>([{ id: ++rowCounter, ingredientId: '', quantity: '' }]);
  const [profitRuleId, setProfitRuleId] = useState('');
  const [sellUnit, setSellUnit] = useState<'unidad' | 'kg'>('unidad');
  const [yieldGrams, setYieldGrams] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setRows([{ id: ++rowCounter, ingredientId: '', quantity: '' }]);
      setProfitRuleId(profitRules[0]?._id ?? '');
      setSellUnit('unidad');
      setYieldGrams('');
      setError('');
    } else {
      setProfitRuleId(profitRules[0]?._id ?? '');
    }
  }, [isOpen, profitRules]);

  const fmt = (v: number) =>
    `$${v.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getIngredient = (id: string) => ingredients.find((i) => i._id === id);
  const getRule = (id: string) => profitRules.find((r) => r._id === id);

  const validRows = rows.filter((r) => r.ingredientId && parseFloat(r.quantity) > 0);

  const totalCost = validRows.reduce((sum, row) => {
    const ing = getIngredient(row.ingredientId);
    if (!ing) return sum;
    const q = parseFloat(row.quantity);
    return sum + (ing.unit === 'unidad' ? ing.costPerUnit * q : (ing.costPerKg * q) / 1000);
  }, 0);

  const selectedRule = getRule(profitRuleId);
  const yieldG = parseFloat(yieldGrams);

  let sellingPrice = 0;
  if (selectedRule) {
    if (sellUnit === 'kg' && yieldG > 0) {
      const costPerKg = (totalCost / yieldG) * 1000;
      sellingPrice = costPerKg * (1 + selectedRule.marginPercentage / 100);
    } else {
      sellingPrice = totalCost * (1 + selectedRule.marginPercentage / 100);
    }
  }

  const isValid =
    name.trim().length >= 2 &&
    validRows.length > 0 &&
    profitRuleId !== '' &&
    (sellUnit !== 'kg' || yieldG > 0);

  const addRow = () => {
    setRows((prev) => [...prev, { id: ++rowCounter, ingredientId: '', quantity: '' }]);
  };

  const removeRow = (id: number) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRow = (id: number, field: 'ingredientId' | 'quantity', value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleSubmit = async () => {
    setError('');
    if (!isValid) return;
    const ingredientIds = validRows.map((r) => r.ingredientId);
    const hasDuplicates = new Set(ingredientIds).size !== ingredientIds.length;
    if (hasDuplicates) {
      setError('Hay ingredientes repetidos.');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        ingredients: validRows.map((r) => ({
          ingredientId: r.ingredientId,
          quantity: parseFloat(r.quantity),
        })),
        profitRuleId,
        sellUnit,
        yieldGrams: sellUnit === 'kg' ? yieldG : undefined,
      });
      onClose();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al crear la receta.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva Receta">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {/* Name */}
        <div>
          <label style={labelStyle}>Nombre de la receta</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='Ej: "Empanada de carne"'
            style={inputStyle}
            autoFocus
          />
        </div>

        {/* Ingredients */}
        <div>
          <label style={labelStyle}>Ingredientes</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {rows.map((row) => {
              const ing = getIngredient(row.ingredientId);
              const qNum = parseFloat(row.quantity);
              let rowCost: number | null = null;
              if (ing && qNum > 0) {
                rowCost = ing.unit === 'unidad' ? ing.costPerUnit * qNum : (ing.costPerKg * qNum) / 1000;
              }
              const unitLabel = ing ? (ing.unit === 'unidad' ? 'u.' : 'g') : 'g';
              return (
                <div key={row.id} style={{ display: 'flex', gap: 'var(--space-xs)', alignItems: 'center' }}>
                  <select
                    value={row.ingredientId}
                    onChange={(e) => updateRow(row.id, 'ingredientId', e.target.value)}
                    style={{ ...inputStyle, flex: 2, padding: 'var(--space-xs) var(--space-sm)' }}
                  >
                    <option value="">Ingrediente...</option>
                    {ingredients.map((i) => (
                      <option key={i._id} value={i._id}>{i.name} ({i.unit === 'unidad' ? 'u.' : 'kg'})</option>
                    ))}
                  </select>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type="number"
                      value={row.quantity}
                      onChange={(e) => updateRow(row.id, 'quantity', e.target.value)}
                      placeholder="0"
                      min="0"
                      step={ing?.unit === 'unidad' ? '1' : '1'}
                      style={{ ...inputStyle, width: '100%', paddingRight: '28px', boxSizing: 'border-box' }}
                    />
                    <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{unitLabel}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-text-secondary)', minWidth: '60px', textAlign: 'right' }}>
                    {rowCost !== null ? fmt(rowCost) : ''}
                  </span>
                  <button onClick={() => removeRow(row.id)} disabled={rows.length === 1} style={{ ...iconBtnStyle, opacity: rows.length === 1 ? 0.3 : 1 }}>
                    <MdClose size={16} />
                  </button>
                </div>
              );
            })}
          </div>
          <button onClick={addRow} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', marginTop: 'var(--space-sm)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-primary)', padding: 0, fontWeight: 600 }}>
            <MdAdd size={18} /> Agregar ingrediente
          </button>
        </div>

        {/* Profit rule */}
        <div>
          <label style={labelStyle}>Margen de ganancia</label>
          <select
            value={profitRuleId}
            onChange={(e) => setProfitRuleId(e.target.value)}
            style={inputStyle}
          >
            <option value="">Seleccioná un margen...</option>
            {profitRules.map((r) => (
              <option key={r._id} value={r._id}>{r.name} — {r.marginPercentage}%</option>
            ))}
          </select>
        </div>

        {/* Sell unit */}
        <div>
          <label style={labelStyle}>Se vende por</label>
          <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
            {(['unidad', 'kg'] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setSellUnit(u)}
                style={{
                  flex: 1,
                  padding: 'var(--space-sm)',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: sellUnit === u ? 'var(--color-primary)' : '#f2efd5',
                  color: sellUnit === u ? 'var(--color-on-primary)' : 'var(--color-text-secondary)',
                  transition: 'all 0.2s',
                }}
              >
                {u === 'unidad' ? 'Por unidad' : 'Por peso (kg)'}
              </button>
            ))}
          </div>
        </div>

        {/* Yield grams (only for kg) */}
        {sellUnit === 'kg' && (
          <div>
            <label style={labelStyle}>Rendimiento (gramos que produce la receta)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                value={yieldGrams}
                onChange={(e) => setYieldGrams(e.target.value)}
                placeholder="ej: 2000"
                min="0"
                style={{ ...inputStyle, paddingRight: '28px' }}
              />
              <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>g</span>
            </div>
          </div>
        )}

        {/* Preview */}
        {validRows.length > 0 && profitRuleId && (
          <div style={{ background: '#f8f4db', borderRadius: 'var(--radius-sm)', padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              Costo de producción: <strong>{fmt(totalCost)}</strong>
            </span>
            {selectedRule && (
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                Margen aplicado: <strong>{selectedRule.name} ({selectedRule.marginPercentage}%)</strong>
              </span>
            )}
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              {sellUnit === 'kg' ? `Precio por kg: ${fmt(sellingPrice)}` : `Precio de venta: ${fmt(sellingPrice)}`}
            </span>
          </div>
        )}

        {error && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-error)', margin: 0 }}>{error}</p>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 'var(--space-md)', paddingTop: 'var(--space-xs)' }}>
          <button onClick={onClose} disabled={loading} style={cancelBtnStyle}>Cancelar</button>
          <button onClick={handleSubmit} disabled={!isValid || loading} style={submitBtnStyle(!isValid || loading)}>
            {loading ? 'Creando...' : 'Crear Receta'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: 'var(--color-text-secondary)',
  display: 'block',
  marginBottom: 'var(--space-xs)',
};

const inputStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '0.9rem',
  padding: 'var(--space-xs) var(--space-sm)',
  border: '1.5px solid rgba(218, 193, 184, 0.4)',
  borderRadius: 'var(--radius-sm)',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  background: 'transparent',
  color: 'var(--color-text-primary)',
};

const cancelBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: 'var(--space-sm)',
  borderRadius: 'var(--radius-sm)',
  border: '1.5px solid rgba(218, 193, 184, 0.4)',
  background: 'transparent',
  fontFamily: 'var(--font-body)',
  fontSize: '0.9rem',
  fontWeight: 600,
  color: 'var(--color-text-secondary)',
  cursor: 'pointer',
};

const submitBtnStyle = (disabled: boolean): React.CSSProperties => ({
  flex: 1,
  padding: 'var(--space-sm)',
  borderRadius: 'var(--radius-sm)',
  border: 'none',
  background: disabled ? 'rgba(188, 108, 37, 0.3)' : 'var(--color-primary)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.9rem',
  fontWeight: 600,
  color: 'var(--color-on-primary)',
  cursor: disabled ? 'default' : 'pointer',
});

const iconBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '2px',
  color: 'var(--color-text-secondary)',
  display: 'flex',
  alignItems: 'center',
};
