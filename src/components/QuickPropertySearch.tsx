import { useMemo, useState, type FormEvent } from 'react'
import { uniquePropertyValues } from '../data/propertyCatalog'
import { useProperties } from '../hooks/useProperties'
import { trackEvent } from '../analytics/tracker'

type SearchState = { purpose: string; type: string; city: string; neighborhood: string; maxPrice: string }

const initialState: SearchState = { purpose: 'Venda', type: '', city: '', neighborhood: '', maxPrice: '' }

export function QuickPropertySearch() {
  const { properties } = useProperties()
  const [filters, setFilters] = useState(initialState)
  const types = useMemo(() => uniquePropertyValues(properties, 'type'), [properties])
  const cities = useMemo(() => uniquePropertyValues(properties, 'city'), [properties])
  const neighborhoods = useMemo(() => uniquePropertyValues(properties, 'neighborhood'), [properties])

  const update = (key: keyof SearchState, value: string) => setFilters((current) => ({ ...current, [key]: value }))

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value) })
    trackEvent('property_search', filters)
    window.location.href = `/imoveis?${params.toString()}`
  }

  return (
    <form className="quick-search" aria-label="Busca rápida de imóveis" onSubmit={submit}>
      <div className="quick-search__purpose" role="group" aria-label="Finalidade">
        <button type="button" className={filters.purpose === 'Venda' ? 'is-active' : ''} aria-pressed={filters.purpose === 'Venda'} onClick={() => update('purpose', 'Venda')}>Comprar</button>
        <button type="button" className={filters.purpose === 'Aluguel' ? 'is-active' : ''} aria-pressed={filters.purpose === 'Aluguel'} onClick={() => update('purpose', 'Aluguel')}>Alugar</button>
      </div>
      <label><span>Tipo de imóvel</span><select value={filters.type} onChange={(event) => update('type', event.target.value)}><option value="">Todos</option>{types.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label><span>Cidade</span><select value={filters.city} onChange={(event) => update('city', event.target.value)}><option value="">Todas</option>{cities.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label><span>Bairro</span><select value={filters.neighborhood} onChange={(event) => update('neighborhood', event.target.value)}><option value="">Todos</option>{neighborhoods.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label><span>Faixa de preço</span><select value={filters.maxPrice} onChange={(event) => update('maxPrice', event.target.value)}><option value="">Qualquer valor</option><option value="500000">Até R$ 500 mil</option><option value="750000">Até R$ 750 mil</option><option value="1000000">Até R$ 1 milhão</option><option value="1500000">Até R$ 1,5 milhão</option></select></label>
      <button className="quick-search__submit" type="submit"><span aria-hidden="true">⌕</span> Buscar imóveis</button>
    </form>
  )
}
