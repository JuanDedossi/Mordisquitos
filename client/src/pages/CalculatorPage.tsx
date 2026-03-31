import { useState, useEffect, useCallback } from 'react';
import { recipesService } from '../services/recipes.service';
import type { Recipe } from '../types/recipe.types';

export function CalculatorPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState('');
  const [mode, setMode] = useState<'price-to-weight' | 'weight-to-price'>('weight-to-price');
  const [input, setInput] = useState('');

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await recipesService.list({ limit: 200 });
      setRecipes(res.data.filter((r) => r.sellUnit === 'kg' && r.pricePerKg > 0));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRecipes();
  }, [fetchRecipes]);

  const selected = recipes.find((r) => r._id === selectedId);
  const inputNum = parseFloat(input);
  const hasInput = !isNaN(inputNum) && inputNum > 0 && selected;

  let resultValue = 0;
  let resultLabel = '';

  if (hasInput && selected) {
    if (mode === 'weight-to-price') {
      // input = grams → result = price
      resultValue = (inputNum / 1000) * selected.pricePerKg;
      resultLabel = 'Precio total';
    } else {
      // input = price → result = grams
      resultValue = (inputNum / selected.pricePerKg) * 1000;
      resultLabel = 'Peso';
    }
  }

  const fmt = (v: number) =>
    `$${v.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatWeight = (g: number) => {
    if (g >= 1000) return `${(g / 1000).toFixed(2)} kg`;
    return `${Math.round(g)} g`;
  };

  return (
    <div style={{ paddingBottom: '150px' }}>
      {/* Header */}
      <div
        style={{
          background: 'var(--color-secondary)',
          padding: 'var(--space-xl) var(--space-lg) var(--space-lg)',
          paddingTop: 'calc(var(--space-xl) + env(safe-area-inset-top))',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-headline)',
            fontSize: '1.75rem',
            color: 'var(--color-on-primary)',
            margin: 0,
          }}
        >
          Calculadora
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
            color: 'rgba(254, 250, 224, 0.8)',
            margin: 'var(--space-xs) 0 0',
          }}
        >
          Convertí precio ↔ peso para recetas al kg
        </p>
      </div>

      <div style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>
            Cargando...
          </div>
        ) : recipes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>
            No hay recetas que se vendan por peso.
          </div>
        ) : (
          <>
            {/* Recipe selector */}
            <div>
              <label style={labelStyle}>Receta</label>
              <select
                value={selectedId}
                onChange={(e) => { setSelectedId(e.target.value); setInput(''); }}
                style={inputStyle}
              >
                <option value="">— Seleccioná una receta —</option>
                {recipes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name} — {fmt(r.pricePerKg)}/kg
                  </option>
                ))}
              </select>
            </div>

            {selected && (
              <>
                {/* Price per kg info */}
                <div
                  style={{
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-sm)',
                    padding: 'var(--space-md) var(--space-lg)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Precio por kg
                    </span>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-primary)', margin: '4px 0 0' }}>
                      {fmt(selected.pricePerKg)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Stock disponible
                    </span>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: '4px 0 0' }}>
                      {selected.stock >= 1000 ? `${(selected.stock / 1000).toFixed(1)} kg` : `${selected.stock} g`}
                    </p>
                  </div>
                </div>

                {/* Mode toggle */}
                <div>
                  <label style={labelStyle}>Modo</label>
                  <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                    {([
                      { key: 'weight-to-price' as const, label: 'Peso → Precio' },
                      { key: 'price-to-weight' as const, label: 'Precio → Peso' },
                    ]).map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => { setMode(key); setInput(''); }}
                        style={{
                          flex: 1,
                          padding: 'var(--space-sm)',
                          borderRadius: 'var(--radius-sm)',
                          border: 'none',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          background: mode === key ? 'var(--color-primary)' : '#f2efd5',
                          color: mode === key ? 'var(--color-on-primary)' : 'var(--color-text-secondary)',
                          transition: 'all 0.2s',
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div>
                  <label style={labelStyle}>
                    {mode === 'weight-to-price' ? 'Peso deseado (gramos)' : 'Precio deseado ($)'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    {mode === 'price-to-weight' && (
                      <span style={prefixStyle}>$</span>
                    )}
                    <input
                      type="number"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={mode === 'weight-to-price' ? 'ej: 500' : 'ej: 1500'}
                      min="0"
                      style={{
                        ...inputStyle,
                        paddingRight: mode === 'weight-to-price' ? '2.5rem' : undefined,
                        paddingLeft: mode === 'price-to-weight' ? '2rem' : undefined,
                      }}
                    />
                    {mode === 'weight-to-price' && (
                      <span style={suffixStyle}>g</span>
                    )}
                  </div>
                </div>

                {/* Result */}
                {hasInput && (
                  <div
                    style={{
                      background: '#f8f4db',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-lg)',
                      textAlign: 'center',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {resultLabel}
                    </span>
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '2rem',
                        fontWeight: 700,
                        color: 'var(--color-primary)',
                        margin: 'var(--space-sm) 0 0',
                      }}
                    >
                      {mode === 'weight-to-price' ? fmt(resultValue) : formatWeight(resultValue)}
                    </p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: 'var(--space-xs) 0 0' }}>
                      {mode === 'weight-to-price'
                        ? `${inputNum}g de ${selected.name}`
                        : `${fmt(inputNum)} de ${selected.name}`}
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
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
