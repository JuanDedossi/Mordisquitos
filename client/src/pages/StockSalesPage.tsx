import { useState, useEffect, useCallback } from 'react';
import { MdAdd } from 'react-icons/md';
import { RecipeStockCard } from '../components/stock/RecipeStockCard';
import { ProfitMetrics } from '../components/stock/ProfitMetrics';
import { SaleModal } from '../components/sales/SaleModal';
import { SearchBar } from '../components/common/SearchBar';
import { Pagination } from '../components/common/Pagination';
import { recipesService } from '../services/recipes.service';
import { salesService } from '../services/sales.service';
import type { Recipe } from '../types/recipe.types';
import type { SaleStats, CreateSalePayload } from '../types/sale.types';

export function StockSalesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SaleStats>({ weekly: 0, monthly: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [preSelectedId, setPreSelectedId] = useState<string | undefined>(undefined);

  const limit = 10;

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await recipesService.list({ page, limit, search: search || undefined });
      setRecipes(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  const fetchStats = useCallback(async () => {
    const data = await salesService.getStats();
    setStats(data);
  }, []);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const timer = setTimeout(fetchRecipes, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchRecipes, search]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStockChange = async (id: string, stock: number) => {
    const updated = await recipesService.updateStock(id, stock);
    setRecipes((prev) => prev.map((r) => (r._id === id ? updated : r)));
  };

  const openSaleModal = (recipe?: Recipe) => {
    setPreSelectedId(recipe?._id);
    setModalOpen(true);
  };

  const handleSaleSubmit = async (payload: CreateSalePayload) => {
    await salesService.create(payload);
    // Refresh both recipes (stock changed) and stats
    await Promise.all([fetchRecipes(), fetchStats()]);
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
            margin: '0 0 var(--space-md)',
          }}
        >
          Stock y Ventas
        </h1>
        <SearchBar value={search} onChange={handleSearch} placeholder="Buscar receta..." />
      </div>

      {/* Content */}
      <div style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        {/* Profit metrics */}
        <ProfitMetrics stats={stats} />

        {/* Recipe count */}
        {!loading && (
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.8rem',
              color: 'var(--color-text-secondary)',
              margin: 0,
            }}
          >
            {total} {total === 1 ? 'receta' : 'recetas'}
            {search && ` para "${search}"`}
          </p>
        )}

        {/* List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>
            Cargando...
          </div>
        ) : recipes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>
            {search
              ? `No se encontraron recetas para "${search}"`
              : 'No hay recetas disponibles.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {recipes.map((recipe) => (
              <RecipeStockCard
                key={recipe._id}
                recipe={recipe}
                onStockChange={handleStockChange}
                onSell={openSaleModal}
              />
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* FAB */}
      <button
        onClick={() => openSaleModal()}
        style={{
          position: 'fixed',
          bottom: 'calc(72px + var(--space-lg))',
          right: 'var(--space-lg)',
          background: 'var(--color-primary)',
          color: 'var(--color-on-primary)',
          border: 'none',
          borderRadius: 'var(--radius-full)',
          padding: 'var(--space-md) var(--space-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)',
          boxShadow: '0 4px 16px rgba(188, 108, 37, 0.4)',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          fontSize: '0.9rem',
          fontWeight: 600,
          zIndex: 50,
        }}
      >
        <MdAdd size={20} />
        Nueva Venta
      </button>

      <SaleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSaleSubmit}
        recipes={recipes}
        preSelectedId={preSelectedId}
      />
    </div>
  );
}
