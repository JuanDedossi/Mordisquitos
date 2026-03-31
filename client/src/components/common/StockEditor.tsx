interface StockEditorProps {
  stock: number;
  onChange: (stock: number) => Promise<void> | void;
  disabled?: boolean;
  step?: number;
  unit?: string;
}

export function StockEditor({ stock, onChange, disabled, step = 1, unit = 'u.' }: StockEditorProps) {
  const handleDecrement = () => {
    if (stock <= 0) return;
    void onChange(Math.max(0, stock - step));
  };

  const handleIncrement = () => {
    void onChange(stock + step);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
      <button
        onClick={handleDecrement}
        disabled={disabled || stock <= 0}
        style={{
          width: 28,
          height: 28,
          borderRadius: 'var(--radius-sm)',
          border: '1.5px solid rgba(218, 193, 184, 0.4)',
          background: 'none',
          cursor: stock > 0 && !disabled ? 'pointer' : 'not-allowed',
          fontFamily: 'var(--font-body)',
          fontSize: '1rem',
          fontWeight: 700,
          color: stock > 0 ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: stock <= 0 || disabled ? 0.4 : 1,
        }}
      >
        −
      </button>
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.9rem',
          fontWeight: 600,
          color: stock === 0 ? 'var(--color-warning)' : 'var(--color-text-primary)',
          minWidth: '40px',
          textAlign: 'center',
        }}
      >
        {stock} {unit}
      </span>
      <button
        onClick={handleIncrement}
        disabled={disabled}
        style={{
          width: 28,
          height: 28,
          borderRadius: 'var(--radius-sm)',
          border: '1.5px solid rgba(218, 193, 184, 0.4)',
          background: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-body)',
          fontSize: '1rem',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        +
      </button>
    </div>
  );
}
