import { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Buscar...',
  style,
}: SearchableSelectProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery('');
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFocus = () => {
    setIsOpen(true);
    setQuery('');
    setActiveIndex(-1);
  };

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
    setQuery('');
    setActiveIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') setIsOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && filtered[activeIndex]) {
        handleSelect(filtered[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
      setActiveIndex(-1);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', ...style }}>
      <input
        ref={inputRef}
        value={isOpen ? query : (selected?.label ?? '')}
        onChange={(e) => {
          setQuery(e.target.value);
          setActiveIndex(-1);
        }}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
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
        }}
      />
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 100,
            background: 'var(--color-surface)',
            border: '1.5px solid rgba(218, 193, 184, 0.4)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            maxHeight: '200px',
            overflowY: 'auto',
            marginTop: '2px',
          }}
        >
          {filtered.length === 0 ? (
            <div
              style={{
                padding: 'var(--space-sm)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                color: 'var(--color-text-secondary)',
              }}
            >
              Sin resultados
            </div>
          ) : (
            filtered.map((opt, idx) => (
              <div
                key={opt.value}
                onMouseDown={() => handleSelect(opt)}
                onMouseEnter={() => setActiveIndex(idx)}
                style={{
                  padding: 'var(--space-xs) var(--space-sm)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  background:
                    idx === activeIndex
                      ? 'rgba(188, 108, 37, 0.12)'
                      : opt.value === value
                      ? '#f2efd5'
                      : 'transparent',
                  color: 'var(--color-text-primary)',
                }}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
