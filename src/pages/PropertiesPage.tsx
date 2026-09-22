import { useEffect, useMemo, useState } from 'react'
import { CatalogFilters } from '../components/CatalogFilters'
import { CatalogPropertyCard } from '../components/CatalogPropertyCard'
import { FloatingWhatsApp } from '../components/FloatingWhatsApp'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { emptyFilters, filterProperties } from '../data/propertyCatalog'
import { useProperties } from '../hooks/useProperties'

export function PropertiesPage() {
  const { properties, source, loading } = useProperties()
  const [filters, setFilters] = useState(emptyFilters)
  const filtered = useMemo(() => filterProperties(properties, filters), [properties, filters])

  useEffect(() => {
    document.title = 'Imóveis disponíveis | Ferreira Imóveis'
  }, [])

  return (
    <>
      <Header variant="solid" />
      <main id="conteudo" className="catalog-page">
        <section className="catalog-hero">
          <span className="section-kicker">Catálogo Ferreira</span>
          <h1>Imóveis ativos.<br /><em>Decisão sem enrolação.</em></h1>
          <div className="catalog-hero__meta">
            <p>Filtre o que importa, abra a ficha completa e, quando fizer sentido, fale diretamente com o corretor.</p>
            <div><strong>{filtered.length}</strong><span>{filtered.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}</span></div>
          </div>
          {source === 'fallback' && !loading && <p className="catalog-source-note">Prévia local: conecte o Google Sheets para carregar o catálogo real.</p>}
        </section>
        <CatalogFilters properties={properties} filters={filters} onChange={setFilters} />
        <section className="catalog-results" aria-live="polite">
          {filtered.length > 0 ? filtered.map((property) => <CatalogPropertyCard property={property} key={property.code} />) : (
            <div className="catalog-empty">
              <span>Sem resultados</span>
              <h2>Nenhum imóvel combina com estes filtros.</h2>
              <p>Limpe alguns critérios ou chame a Ferreira para uma busca personalizada.</p>
              <button type="button" className="button button--dark" onClick={() => setFilters(emptyFilters)}>Limpar filtros</button>
            </div>
          )}
        </section>
      </main>
      <FloatingWhatsApp />
      <Footer />
    </>
  )
}
