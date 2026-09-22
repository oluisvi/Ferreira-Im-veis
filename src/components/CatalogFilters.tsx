import { emptyFilters, uniquePropertyValues, type Property, type PropertyFilters } from '../data/propertyCatalog'

export function CatalogFilters({
  properties,
  filters,
  onChange,
}: {
  properties: Property[]
  filters: PropertyFilters
  onChange: (filters: PropertyFilters) => void
}) {
  const cities = uniquePropertyValues(properties, 'city')
  const neighborhoods = uniquePropertyValues(properties, 'neighborhood')
  const types = uniquePropertyValues(properties, 'type')
  const purposes = uniquePropertyValues(properties, 'purpose')

  const update = (key: keyof PropertyFilters, value: string) => onChange({ ...filters, [key]: value })

  return (
    <section className="catalog-filters" aria-label="Filtros do catálogo">
      <label className="catalog-filters__search">
        <span>Busca rápida</span>
        <input value={filters.search} onChange={(event) => update('search', event.target.value)} placeholder="Código, imóvel, cidade ou bairro" />
      </label>
      <label><span>Cidade</span><select value={filters.city} onChange={(event) => update('city', event.target.value)}><option value="">Todas</option>{cities.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label><span>Bairro</span><select value={filters.neighborhood} onChange={(event) => update('neighborhood', event.target.value)}><option value="">Todos</option>{neighborhoods.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label><span>Finalidade</span><select value={filters.purpose} onChange={(event) => update('purpose', event.target.value)}><option value="">Todas</option>{purposes.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label><span>Tipo</span><select value={filters.type} onChange={(event) => update('type', event.target.value)}><option value="">Todos</option>{types.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label><span>Preço mínimo</span><input type="number" min="0" inputMode="numeric" value={filters.minPrice} onChange={(event) => update('minPrice', event.target.value)} placeholder="R$ 0" /></label>
      <label><span>Preço máximo</span><input type="number" min="0" inputMode="numeric" value={filters.maxPrice} onChange={(event) => update('maxPrice', event.target.value)} placeholder="Sem limite" /></label>
      <button type="button" className="catalog-filters__clear" onClick={() => onChange(emptyFilters)}>Limpar filtros</button>
    </section>
  )
}
