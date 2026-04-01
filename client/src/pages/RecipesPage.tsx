import { useState, useEffect, useCallback } from 'react';
import { MdAdd } from 'react-icons/md';
import { RecipeCard } from '../components/recipes/RecipeCard';
import { RecipeFormModal } from '../components/recipes/RecipeFormModal';
import { SearchBar } from '../components/common/SearchBar';
import { Pagination } from '../components/common/Pagination';
import { recipesService } from '../services/recipes.service';
import { ingredientsService } from '../services/ingredients.service';
import { profitRulesService } from '../services/profit-rules.service';
import type { Recipe, CreateRecipePayload, UpdateRecipePayload } from '../types/recipe.types';
import type { Ingredient } from '../types/ingredient.types';
import type { ProfitRule } from '../types/profit-rule.types';

export function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [profitRules, setProfitRules] = useState<ProfitRule[]>([]);

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

  // Load supporting data once
  useEffect(() => {
    Promise.all([
      ingredientsService.list({ limit: 200 }),
      profitRulesService.list(),
    ]).then(([ingsRes, rules]) => {
      setIngredients(ingsRes.data);
      setProfitRules(rules);
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchRecipes, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchRecipes, search]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCreate = async (payload: CreateRecipePayload) => {
    await recipesService.create(payload);
    setPage(1);
    setSearch('');
    await fetchRecipes();
  };

  const handleEdit = async (id: string, payload: UpdateRecipePayload) => {
    const updated = await recipesService.update(id, payload);
    setRecipes((prev) => prev.map((r) => (r._id === id ? updated : r)));
  };

  const handleDelete = async (id: string) => {
    const recipe = recipes.find((r) => r._id === id);
    if (!recipe) return;
    if (!window.confirm('¿Eliminar esta receta?')) return;
    await recipesService.delete(id);
    await fetchRecipes();
  };

  const handleUpdatePrice = async (id: string, price: number | null) => {
    const updated = await recipesService.updatePrice(id, price);
    setRecipes((prev) => prev.map((r) => (r._id === id ? updated : r)));
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
          Recetas
        </h1>
        <SearchBar value={search} onChange={handleSearch} placeholder="Buscar receta..." />
      </div>

      {/* Content */}
      <div style={{ padding: 'var(--space-lg)' }}>
        {!loading && (
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.8rem',
              color: 'var(--color-text-secondary)',
              margin: '0 0 var(--space-md)',
            }}
          >
            {total} {total === 1 ? 'receta' : 'recetas'}
            {search && ` para "${search}"`}
          </p>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>
            Cargando...
          </div>
        ) : recipes.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--space-2xl)',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {search
              ? `No se encontraron recetas para "${search}"`
              : 'Aún no hay recetas. Creá la primera con el botón de abajo.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe._id}
                recipe={recipe}
                profitRules={profitRules}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onUpdatePrice={handleUpdatePrice}
              />
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* FAB */}
      <button
        onClick={() => setModalOpen(true)}
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
        Nueva Receta
      </button>

      <RecipeFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        ingredients={ingredients}
        profitRules={profitRules}
      />
    </div>
  );
}
