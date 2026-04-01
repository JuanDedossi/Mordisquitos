import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { SearchableSelect } from '../common/SearchableSelect';
import type { Ingredient, RegisterPurchasePayload } from '../../types/ingredient.types';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: RegisterPurchasePayload) => Promise<void>;
  existingIngredients: Ingredient[];
}

export function PurchaseModal({
  isOpen,
  onClose,
  onSubmit,
  existingIngredients,
}: PurchaseModalProps) {
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [selectedId, setSelectedId] = useState('');
  const [newName, setNewName] = useState('');
  const [unit, setUnit] = useState<'kg' | 'unidad'>('kg');
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setMode('existing');
      setSelectedId('');
      setNewName('');
      setUnit('kg');
      setQty('');
      setPrice('');
      setError('');
    }
  }, [isOpen]);

  // When selecting an existing ingredient, sync unit
  useEffect(() => {
    if (mode === 'existing' && selectedId) {
      const ing = existingIngredients.find((i) => i._id === selectedId);
      if (ing) setUnit(ing.unit as 'kg' | 'unidad');
    }
  }, [selectedId, mode, existingIngredients]);

  const isWeight = unit === 'kg';
  const qtyNum = parseFloat(qty);
  const priceNum = parseFloat(price);
  const isValid = qtyNum > 0 && priceNum > 0;
  const showPreview = isValid;

  const costPerKg = isValid && isWeight ? (priceNum / qtyNum) * 1000 : 0;
  const costPer100g = costPerKg / 10;
  const costPerUnit = isValid && !isWeight ? priceNum / qtyNum : 0;

  const formatCurrency = (v: number) =>
    `$${v.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleSubmit = async () => {
    setError('');
    if (!isValid) return;

    if (mode === 'existing' && !selectedId) {
      setError('Seleccioná un ingrediente.');
      return;
    }
    if (mode === 'new' && !newName.trim()) {
      setError('Ingresá el nombre del ingrediente.');
      return;
    }

    const selected = existingIngredients.find((i) => i._id === selectedId);

    const payload: RegisterPurchasePayload = {
      ingredientName: mode === 'new' ? newName.trim() : (selected?.name ?? ''),
      isNew: mode === 'new',
      ingredientId: mode === 'existing' ? selectedId : undefined,
      unit: mode === 'new' ? unit : undefined,
      quantityPurchased: qtyNum,
      pricePaid: priceNum,
    };

    setLoading(true);
    try {
      await onSubmit(payload);
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Ocurrió un error. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Compra">
      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 'var(--space-xs)', marginBottom: 'var(--space-lg)' }}>
        {(['existing', 'new'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              flex: 1,
              padding: 'var(--space-sm)',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: mode === m ? 'var(--color-primary)' : '#f2efd5',
              color: mode === m ? 'var(--color-on-primary)' : 'var(--color-text-secondary)',
              transition: 'all 0.2s',
            }}
          >
            {m === 'existing' ? 'Ingrediente existente' : 'Nuevo ingrediente'}
          </button>
        ))}
      </div>

      {/* Ingredient field */}
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <label style={labelStyle}>
          {mode === 'existing' ? 'Ingrediente' : 'Nombre'}
        </label>
        {mode === 'existing' ? (
          <SearchableSelect
            options={existingIngredients.map((ing) => ({ value: ing._id, label: `${ing.name} (${ing.unit === 'unidad' ? 'u.' : 'kg'})` }))}
            value={selectedId}
            onChange={(val) => setSelectedId(val)}
            placeholder="Buscar ingrediente..."
          />
        ) : (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="ej: Harina 000"
            style={inputStyle}
          />
        )}
      </div>

      {/* Unit selector (only for new ingredients) */}
      {mode === 'new' && (
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <label style={labelStyle}>Unidad de medida</label>
          <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
            {(['kg', 'unidad'] as const).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                style={{
                  flex: 1,
                  padding: 'var(--space-sm)',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: unit === u ? 'var(--color-primary)' : '#f2efd5',
                  color: unit === u ? 'var(--color-on-primary)' : 'var(--color-text-secondary)',
                  transition: 'all 0.2s',
                }}
              >
                {u === 'kg' ? 'Por peso (kg)' : 'Por unidad'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <label style={labelStyle}>{isWeight ? 'Gramos comprados' : 'Unidades compradas'}</label>
        <div style={{ position: 'relative' }}>
          <input
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder={isWeight ? 'ej: 1000' : 'ej: 12'}
            min="0"
            style={{ ...inputStyle, paddingRight: '2.5rem' }}
          />
          <span style={suffixStyle}>{isWeight ? 'g' : 'u.'}</span>
        </div>
      </div>

      {/* Price */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <label style={labelStyle}>Precio pagado</label>
        <div style={{ position: 'relative' }}>
          <span style={prefixStyle}>$</span>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="ej: 350"
            min="0"
            style={{ ...inputStyle, paddingLeft: '2rem' }}
          />
        </div>
      </div>

      {/* Calculated preview */}
      {showPreview && (
        <div
          style={{
            background: '#f8f4db',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-md)',
            marginBottom: 'var(--space-lg)',
          }}
        >
          <p style={{ margin: '0 0 4px', fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Costo calculado
          </p>
          {isWeight ? (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <span style={labelStyle}>Por kg</span>
                <p style={previewValueStyle}>{formatCurrency(costPerKg)}</p>
              </div>
              <div>
                <span style={labelStyle}>Por 100g</span>
                <p style={previewValueStyle}>{formatCurrency(costPer100g)}</p>
              </div>
            </div>
          ) : (
            <div>
              <span style={labelStyle}>Por unidad</span>
              <p style={previewValueStyle}>{formatCurrency(costPerUnit)}</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p style={{ color: 'var(--color-error)', fontFamily: 'var(--font-body)', fontSize: '0.85rem', marginBottom: 'var(--space-md)' }}>
          {error}
        </p>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
        <button onClick={onClose} disabled={loading} style={cancelBtnStyle}>
          Cancelar
        </button>
        <button onClick={handleSubmit} disabled={loading || !isValid} style={submitBtnStyle(loading || !isValid)}>
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
      </div>
    </Modal>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-body)',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'var(--color-text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: 'var(--space-xs)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: 'var(--space-sm) var(--space-md)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.95rem',
  color: 'var(--color-text-primary)',
  background: '#f2efd5',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  outline: 'none',
  boxSizing: 'border-box',
};

const suffixStyle: React.CSSProperties = {
  position: 'absolute',
  right: 'var(--space-md)',
  top: '50%',
  transform: 'translateY(-50%)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.85rem',
  color: 'var(--color-text-secondary)',
  pointerEvents: 'none',
};

const prefixStyle: React.CSSProperties = {
  position: 'absolute',
  left: 'var(--space-md)',
  top: '50%',
  transform: 'translateY(-50%)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.85rem',
  color: 'var(--color-text-secondary)',
  pointerEvents: 'none',
};

const previewValueStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '1.1rem',
  fontWeight: 700,
  color: 'var(--color-secondary)',
  margin: '2px 0 0',
};

const cancelBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: 'var(--space-md)',
  borderRadius: 'var(--radius-md)',
  border: '1.5px solid #dac1b8',
  background: 'transparent',
  fontFamily: 'var(--font-body)',
  fontSize: '0.95rem',
  fontWeight: 600,
  color: 'var(--color-text-secondary)',
  cursor: 'pointer',
};

const submitBtnStyle = (disabled: boolean): React.CSSProperties => ({
  flex: 2,
  padding: 'var(--space-md)',
  borderRadius: 'var(--radius-md)',
  border: 'none',
  background: disabled ? '#e0d5c8' : 'var(--color-primary)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.95rem',
  fontWeight: 600,
  color: disabled ? '#aaa' : 'var(--color-on-primary)',
  cursor: disabled ? 'not-allowed' : 'pointer',
  transition: 'background 0.2s',
});
