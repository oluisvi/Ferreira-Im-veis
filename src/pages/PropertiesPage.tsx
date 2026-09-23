import { useEffect, useMemo, useState } from 'react'
import { CatalogFilters } from '../components/CatalogFilters'
import { CatalogPropertyCard } from '../components/CatalogPropertyCard'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { buildWhatsAppUrl } from '../content/siteContent'
import { emptyFilters, filterProperties, filtersFromSearchParams } from '../data/propertyCatalog'
import { useProperties } from '../hooks/useProperties'

export function PropertiesPage() {
  const { properties, source, loading } = useProperties()
  const [filters, setFilters] = useState(() => filtersFromSearchParams(window.location.search))
  const filtered = useMemo(() => filterProperties(properties, filters), [properties, filters])

  useEffect(() => { document.title = 'Imóveis disponíveis | Ferreira Corretor de Imóveis' }, [])
  useEffect(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value) })
    const next = `${window.location.pathname}${params.size ? `?${params}` : ''}`
    window.history.replaceState({}, '', next)
  }, [filters])

  const searchSummary = [filters.purpose, filters.type, filters.city, filters.neighborhood].filter(Boolean).join(', ')
  const whatsappMessage = `Olá, Ferreira! Procurei imóveis${searchSummary ? ` com estes critérios: ${searchSummary}` : ''}, mas gostaria de ajuda para encontrar outras opções.`

  return (
    <>
      <Header variant="solid" />
      <main id="conteudo" className="catalog-page">
        <section className="catalog-hero">
          <div><span className="section-kicker">Catálogo Ferreira</span><h1>Encontre um imóvel que faça <em>sentido para você.</em></h1></div>
          <div className="catalog-hero__meta"><p>Use os filtros para reduzir a busca e abra cada ficha para ver detalhes e falar diretamente pelo WhatsApp.</p><div><strong>{String(filtered.length).padStart(2, '0')}</strong><span>{filtered.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}</span></div></div>
          {source === 'fallback' && !loading && <p className="catalog-source-note">Não foi possível carregar os imóveis do catálogo agora. Tente novamente em alguns instantes.</p>}
        </section>
        <div className="catalog-layout">
          <CatalogFilters properties={properties} filters={filters} onChange={setFilters} />
          <section className="catalog-results" aria-live="polite">
            {filtered.length > 0 ? filtered.map((property) => <CatalogPropertyCard property={property} key={property.code} />) : (
              <div className="catalog-empty"><span>Sem resultados</span><h2>Nenhum imóvel combina com estes filtros.</h2><p>Limpe alguns critérios ou peça uma busca personalizada para o Ferreira.</p><div><button type="button" className="button button--dark" onClick={() => setFilters(emptyFilters)}>Limpar filtros</button><a className="button button--accent" href={buildWhatsAppUrl(whatsappMessage)} target="_blank" rel="noreferrer">Pedir ajuda no WhatsApp ↗</a></div></div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
