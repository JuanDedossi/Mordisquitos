import { useLocation, useNavigate } from 'react-router-dom';
import { MdKitchen, MdMenuBook, MdTrendingUp, MdInventory2, MdCalculate, MdGridView } from 'react-icons/md';

const navItems = [
  { path: '/ingredientes', icon: MdKitchen, label: 'Ingredientes' },
  { path: '/recetas', icon: MdMenuBook, label: 'Recetas' },
  { path: '/margenes', icon: MdTrendingUp, label: 'Márgenes' },
  { path: '/stock', icon: MdInventory2, label: 'Stock' },
  { path: '/bandejas', icon: MdGridView, label: 'Bandejas' },
  { path: '/calculadora', icon: MdCalculate, label: 'Calculadora' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(254, 250, 224, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: 'var(--space-sm) 0 calc(var(--space-sm) + env(safe-area-inset-bottom))',
        boxShadow: '0 -1px 0 rgba(84, 67, 60, 0.08)',
        zIndex: 100,
      }}
    >
      {navItems.map(({ path, icon: Icon, label }) => {
        const isActive = location.pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 'var(--space-xs) var(--space-md)',
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              transition: 'color 0.2s',
            }}
          >
            <Icon size={24} />
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.65rem',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
