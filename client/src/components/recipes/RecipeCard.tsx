import { useState } from 'react';
import { MdEdit, MdDelete, MdExpandMore, MdExpandLess, MdCheck, MdClose } from 'react-icons/md';
import type { Recipe, UpdateRecipePayload } from '../../types/recipe.types';
import type { ProfitRule } from '../../types/profit-rule.types';

interface RecipeCardProps {
  recipe: Recipe;
  profitRules: ProfitRule[];
  onEdit: (id: string, payload: UpdateRecipePayload) => Promise<void>;
  onDelete: (id: string) => void;
}

export function RecipeCard({ recipe, profitRules, onEdit, onDelete }: RecipeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState(recipe.name);
  const [editRuleId, setEditRuleId] = useState(recipe.profitRuleId);
  const [loading, setLoading] = useState(false);

  const fmt = (v: number) =>
    `$${v.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleSave = async () => {
    const payload: UpdateRecipePayload = {};
    if (editName.trim() !== recipe.name) payload.name = editName.trim();
    if (editRuleId !== recipe.profitRuleId) payload.profitRuleId = editRuleId;
    if (Object.keys(payload).length === 0) { setEditingName(false); return; }
    setLoading(true);
    try {
      await onEdit(recipe._id, payload);
      setEditingName(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditName(recipe.name);
    setEditRuleId(recipe.profitRuleId);
    setEditingName(false);
  };

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}
    >
      {/* Main row */}
      <div style={{ padding: 'var(--space-md) var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
        {editingName ? (
          <>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              autoFocus
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                fontWeight: 600,
                border: 'none',
                borderBottom: '2px solid var(--color-primary)',
                outline: 'none',
                padding: 'var(--space-xs) 0',
                background: 'transparent',
                color: 'var(--color-text-primary)',
                width: '100%',
              }}
            />
            <select
              value={editRuleId}
              onChange={(e) => setEditRuleId(e.target.value)}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                border: '1.5px solid rgba(218, 193, 184, 0.4)',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--space-xs) var(--space-sm)',
                color: 'var(--color-text-primary)',
                background: 'transparent',
                marginTop: 'var(--space-xs)',
              }}
            >
              {profitRules.map((r) => (
                <option key={r._id} value={r._id}>{r.name} — {r.marginPercentage}%</option>
              ))}
            </select>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-xs)', marginTop: 'var(--space-xs)' }}>
              <button onClick={handleCancel} disabled={loading} style={iconBtnStyle}><MdClose size={20} /></button>
              <button onClick={handleSave} disabled={loading} style={{ ...iconBtnStyle, color: 'var(--color-success)' }}><MdCheck size={20} /></button>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {recipe.name}
                </span>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: 'var(--space-xs) 0 0' }}>
                  {recipe.profitRuleName} · {recipe.marginPercentage}% margen
                </p>
              </div>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary)', whiteSpace: 'nowrap', marginLeft: 'var(--space-md)' }}>
                {recipe.sellUnit === 'kg' ? `${fmt(recipe.sellingPrice)}/kg` : fmt(recipe.sellingPrice)}
              </span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 'var(--space-xs)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                <button onClick={() => setEditingName(true)} style={iconBtnStyle} title="Editar"><MdEdit size={18} /></button>
                <button onClick={() => setExpanded((v) => !v)} style={iconBtnStyle} title="Ver detalle">
                  {expanded ? <MdExpandLess size={18} /> : <MdExpandMore size={18} />}
                </button>
                <button onClick={() => onDelete(recipe._id)} style={{ ...iconBtnStyle, color: 'var(--color-error)' }} title="Eliminar"><MdDelete size={18} /></button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Expanded detail */}
      {expanded && !editingName && (
        <div style={{ borderTop: '1px solid rgba(218, 193, 184, 0.2)', padding: 'var(--space-md) var(--space-lg)', background: '#f8f4db' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 var(--space-sm)' }}>
            Ingredientes
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Ingrediente', 'Cantidad', 'Costo'].map((h) => (
                  <th key={h} style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'var(--color-text-secondary)', textAlign: 'left', paddingBottom: 'var(--space-xs)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recipe.ingredients.map((ing) => (
                <tr key={ing.ingredientId}>
                  <td style={tdStyle}>{ing.ingredientName}</td>
                  <td style={tdStyle}>{ing.quantity}{ing.ingredientUnit === 'unidad' ? ' u.' : 'g'}</td>
                  <td style={tdStyle}>{fmt(ing.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 'var(--space-sm)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              Costo producción: <strong>{fmt(recipe.cost)}</strong>
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              Margen ({recipe.marginPercentage}%): <strong>{fmt(recipe.sellingPrice - recipe.cost)}</strong>
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              {recipe.sellUnit === 'kg' ? `Precio por kg: ${fmt(recipe.sellingPrice)}` : `Precio de venta: ${fmt(recipe.sellingPrice)}`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

const iconBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 'var(--space-xs)',
  color: 'var(--color-text-secondary)',
  borderRadius: 'var(--radius-sm)',
  display: 'flex',
  alignItems: 'center',
};

const tdStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '0.8rem',
  color: 'var(--color-text-primary)',
  padding: '2px 0',
};
