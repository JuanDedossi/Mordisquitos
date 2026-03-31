# 🍪 Mordisquitos

**Sistema de gestión interno para un negocio artesanal de alimentos.** Controlá ingredientes, recetas, márgenes de ganancia, stock de productos terminados y ventas — todo desde una app mobile-first pensada para el día a día del negocio.

---

## ✨ Funcionalidades

| Módulo | Descripción |
|---|---|
| **Ingredientes** | Registrá compras de materia prima (gramos + precio). El costo por kg y por 100g se calcula automáticamente. |
| **Recetas** | Definí productos con sus ingredientes y cantidades. El costo de producción se calcula en tiempo real. |
| **Márgenes de ganancia** | Administrá reglas de margen (presets y personalizadas) para calcular precios de venta sugeridos. |
| **Stock y Ventas** | Llevá el stock de productos terminados, registrá ventas y visualizá métricas de ganancia semanal/mensual. |
| **Calculadora** | Herramientas de cálculo rápido para el día a día. |

## 🏗️ Arquitectura

Monorepo con **pnpm workspaces** organizado en tres paquetes:

```
mordisquitos/
├── client/     → React 18 + Vite 5 + TypeScript
├── server/     → Express 4 + Mongoose 8 + TypeScript
└── shared/     → Tipos e interfaces compartidos
```

### Stack

| Capa | Tecnología |
|---|---|
| **Frontend** | React 18, React Router 6, Axios, Vite 5 |
| **Backend** | Express 4, Mongoose 8, TypeScript 5 |
| **Base de datos** | MongoDB |
| **Deploy** | Vercel (frontend + serverless functions) |
| **Monorepo** | pnpm workspaces |

### Design System

Paleta artesanal inspirada en tonos cálidos:

- 🟤 **Terracotta** `#ce631b` — color primario
- 🟫 **Sage** `#963c0a` — color secundario  
- 🟡 **Golden Amber** `#dda15e` — acentos
- 🟢 **Cream** `#fefae0` — fondo neutral

Tipografías: **Noto Serif** (headlines) + **Manrope** (cuerpo).

## 🚀 Inicio rápido

### Requisitos previos

- **Node.js** >= 18
- **pnpm** >= 9
- **MongoDB** (local o Atlas)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/mordisquitos.git
cd mordisquitos

# Instalar dependencias
pnpm install
```

### Variables de entorno

Creá un archivo `.env` en `server/`:

```env
MONGODB_URI=mongodb://localhost:27017/mordisquitos
PORT=3000
```

### Desarrollo

```bash
# Levantar client + server en paralelo
pnpm dev

# Solo frontend (localhost:5173)
pnpm dev:client

# Solo backend (localhost:3000)
pnpm dev:server
```

### Build

```bash
pnpm build:client
pnpm build:server
```

## 📁 Estructura del proyecto

```
├── api/                  # Entry point serverless (Vercel)
├── client/
│   └── src/
│       ├── components/   # Componentes por módulo
│       ├── pages/        # Páginas principales
│       ├── services/     # Capa de servicios (API calls)
│       ├── hooks/        # Custom hooks
│       ├── styles/       # Design tokens + estilos globales
│       ├── types/        # Tipos del frontend
│       └── utils/        # Utilidades
├── server/
│   └── src/
│       ├── models/       # Schemas de Mongoose
│       ├── routes/       # Rutas Express
│       ├── services/     # Lógica de negocio
│       └── middleware/   # Middlewares (auth, etc.)
├── shared/
│   └── src/
│       └── types/        # Tipos compartidos client/server
├── vercel.json           # Configuración de deploy
└── pnpm-workspace.yaml   # Configuración del monorepo
```

## 📐 Decisiones de diseño

- **Stock de recetas, no de ingredientes** — Los ingredientes solo tienen costo. El stock es de productos terminados y se gestiona manualmente.
- **Cálculo automático de precios** — Al registrar una compra de ingrediente, se recalculan los costos y precios de todas las recetas que lo usan.
- **Respuestas API estandarizadas** — Todas las respuestas siguen el formato `{ success, data, message }`.
- **PWA-ready** — Configurado con `vite-plugin-pwa` para uso offline.

## 📄 Licencia

MIT

---

<p align="center">
  Hecho con 🧡 para los que cocinan con pasión
</p>
