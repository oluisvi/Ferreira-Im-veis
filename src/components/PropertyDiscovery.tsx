import { useEffect, useMemo, useRef, useState } from 'react'
import { type PropertyCategory, type PropertyItem } from '../content/siteContent'
import { getProperties } from '../content/propertiesData'
import { PropertyCard } from './PropertyCard'

type Filter = 'Todos' | PropertyCategory
const filters: Filter[] = ['Todos', 'Casa', 'Apartamento', 'Refúgio']
const MAX_HOME_PROPERTIES = 6

export function PropertyDiscovery() {
  const [active, setActive] = useState<Filter>('Todos')
  const [properties, setProperties] = useState<PropertyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const scrollFrameRef = useRef<number | null>(null)
  const autoPauseUntilRef = useRef(0)
  const visible = useMemo(() => (active === 'Todos' ? properties : properties.filter((item) => item.category === active)).slice(0, MAX_HOME_PROPERTIES), [active, properties])

  useEffect(() => {
    let mounted = true
    getProperties().then((items) => {
      if (!mounted) return
      setProperties(items)
      setLoading(false)
    })
    return () => { mounted = false }
  }, [])

  const goTo = (next: number) => {
    if (!visible.length) return
    const safe = (next + visible.length) % visible.length
    setCurrent(safe)
    const track = trackRef.current
    const slide = track?.children.item(safe) as HTMLElement | null
    if (track && slide) track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: 'smooth' })
  }


  const syncCurrentFromScroll = () => {
    const track = trackRef.current
    if (!track || !visible.length) return
    if (scrollFrameRef.current !== null) window.cancelAnimationFrame(scrollFrameRef.current)

    scrollFrameRef.current = window.requestAnimationFrame(() => {
      const trackCenter = track.scrollLeft + track.clientWidth / 2
      let closestIndex = 0
      let closestDistance = Number.POSITIVE_INFINITY

      Array.from(track.children).forEach((child, index) => {
        const slide = child as HTMLElement
        const slideCenter = slide.offsetLeft - track.offsetLeft + slide.offsetWidth / 2
        const distance = Math.abs(slideCenter - trackCenter)
        if (distance < closestDistance) {
          closestDistance = distance
          closestIndex = index
        }
      })

      setCurrent(closestIndex)
      scrollFrameRef.current = null
    })
  }

  const pauseAutoScroll = () => {
    autoPauseUntilRef.current = Date.now() + 6500
  }

  useEffect(() => {
    setCurrent(0)
    trackRef.current?.scrollTo({ left: 0, behavior: 'smooth' })
  }, [active])

  useEffect(() => {
    if (visible.length <= 1) return
    const timer = window.setInterval(() => {
      if (Date.now() < autoPauseUntilRef.current) return
      goTo(current + 1)
    }, 4800)
    return () => window.clearInterval(timer)
  }, [current, visible.length])

  return (
    <section className="properties" id="imoveis">
      <header className="section-heading" data-reveal="rise">
        <div><span className="section-kicker">02 · Possibilidades</span><h2>Não é sobre procurar mais.<br /><em>É sobre encontrar melhor.</em></h2></div>
        <p>Uma curadoria objetiva para transformar anúncios soltos em possibilidades claras de visita e negociação.</p>
      </header>
      <div className="filterbar" aria-label="Filtrar conceitos de imóveis" data-reveal="line">
        <span>Explore por perfil</span>
        <div>{filters.map((filter) => <button type="button" className={filter === active ? 'is-active' : ''} aria-pressed={filter === active} onClick={() => { setCurrent(0); setActive(filter) }} key={filter}>{filter}</button>)}</div>
        <output>{loading ? '—' : `${String(visible.length).padStart(2, '0')} imóveis`}</output>
      </div>

      <div className="property-carousel" data-reveal="rise">
        <div className="property-carousel__topline">
          <span className="property-carousel__mobile-kicker">Seleção em destaque</span>
          <p>Uma seleção curta para conhecer algumas oportunidades sem transformar a página inicial em um catálogo extenso.</p>
          <div className="property-carousel__controls" aria-label="Controles do carrossel">
            <button type="button" onClick={() => { pauseAutoScroll(); goTo(current - 1) }} aria-label="Imóvel anterior">←</button>
            <span>{visible.length ? `${String(current + 1).padStart(2, '0')} / ${String(visible.length).padStart(2, '0')}` : '00 / 00'}</span>
            <button type="button" onClick={() => { pauseAutoScroll(); goTo(current + 1) }} aria-label="Próximo imóvel">→</button>
          </div>
        </div>
        <div className="property-carousel__track" ref={trackRef} onScroll={syncCurrentFromScroll} onPointerDown={pauseAutoScroll} onTouchStart={pauseAutoScroll}>
          {loading ? (
            <div className="property-carousel__loading" role="status">Carregando imóveis disponíveis…</div>
          ) : visible.length ? (
            visible.map((property, index) => <div className="property-carousel__slide" key={property.id}><PropertyCard property={property} index={index} /></div>)
          ) : (
            <div className="property-carousel__loading" role="status">Nenhum imóvel disponível neste perfil no momento.</div>
          )}
        </div>
        <div className="property-carousel__footer">
          <div className="property-carousel__dots" aria-label="Selecionar imóvel">
            {visible.map((property, index) => <button type="button" className={index === current ? 'is-active' : ''} onClick={() => { pauseAutoScroll(); goTo(index) }} aria-label={`Ir para imóvel ${index + 1}`} key={property.id} />)}
          </div>
          <a className="button button--dark" href="/imoveis">Ver todos os imóveis <span>→</span></a>
        </div>
      </div>
    </section>
  )
}
