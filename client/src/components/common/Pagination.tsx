import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-md)',
        padding: 'var(--space-md) 0',
      }}
    >
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        style={{
          background: 'none',
          border: 'none',
          cursor: page <= 1 ? 'not-allowed' : 'pointer',
          opacity: page <= 1 ? 0.3 : 1,
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
        }}
        aria-label="Página anterior"
      >
        <MdChevronLeft size={24} />
      </button>

      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.9rem',
          color: 'var(--color-text-secondary)',
        }}
      >
        {page} / {totalPages}
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        style={{
          background: 'none',
          border: 'none',
          cursor: page >= totalPages ? 'not-allowed' : 'pointer',
          opacity: page >= totalPages ? 0.3 : 1,
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
        }}
        aria-label="Página siguiente"
      >
        <MdChevronRight size={24} />
      </button>
    </div>
  );
}
