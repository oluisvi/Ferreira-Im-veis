import { lazy, Suspense } from 'react'

const AdminRoute = lazy(() => import('./pages/AdminRoute').then(({ AdminRoute }) => ({ default: AdminRoute })))
const HomeRoute = lazy(() => import('./pages/HomeRoute').then(({ HomeRoute }) => ({ default: HomeRoute })))
const CatalogRoute = lazy(() => import('./pages/CatalogRoute').then(({ CatalogRoute }) => ({ default: CatalogRoute })))
const PropertyRoute = lazy(() => import('./pages/PropertyRoute').then(({ PropertyRoute }) => ({ default: PropertyRoute })))
const NotFoundRoute = lazy(() => import('./pages/NotFoundRoute').then(({ NotFoundRoute }) => ({ default: NotFoundRoute })))

function RouteLoading() {
  return <main className="route-loading" role="status"><span>Carregando página…</span></main>
}

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  const route = path === '/admin'
    ? <AdminRoute />
    : path === '/'
      ? <HomeRoute />
      : path === '/imoveis'
        ? <CatalogRoute />
        : path.startsWith('/imoveis/') || path.startsWith('/imovel/')
          ? <PropertyRoute code={decodeURIComponent(path.slice(path.startsWith('/imoveis/') ? '/imoveis/'.length : '/imovel/'.length))} />
          : <NotFoundRoute />

  return <Suspense fallback={<RouteLoading />}>{route}</Suspense>
}
