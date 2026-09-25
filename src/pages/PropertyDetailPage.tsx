import { useEffect, useMemo, useRef, useState } from 'react'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { buildPropertyWhatsAppUrl, formatArea, formatCurrency, getMapUrl, getPropertyLocation } from '../data/propertyCatalog'
import { useProperties } from '../hooks/useProperties'
import { trackEvent, trackWhatsAppClick } from '../analytics/tracker'

function Fact({ label, value }: { label: string; value: string | number | null }) {
  if (value === null || value === '') return null
  return <div className="property-detail__fact"><span>{label}</span><strong>{value}</strong></div>
}

export function PropertyDetailPage({ code }: { code: string }) {
  const { properties, loading, source } = useProperties()
  const property = useMemo(() => properties.find((item) => item.code.toLowerCase() === code.toLowerCase()), [properties, code])
  const [selectedImage, setSelectedImage] = useState('')
  const [imageIndex, setImageIndex] = useState(0)
  const dragStartX = useRef<number | null>(null)

  useEffect(() => {
    if (!property) return
    setSelectedImage(property.mainImage || property.photos[0] || '')
    setImageIndex(0)
    document.title = `${property.title} | Ferreira Corretor de Imóveis`
    trackEvent('property_view', { propertyId: property.code, propertyType: property.type, city: property.city, neighborhood: property.neighborhood })
  }, [property])

  if (!property && loading) return <><Header variant="solid" /><main id="conteudo" className="property-loading"><span>Carregando imóvel…</span></main></>
  if (!property) return <><Header variant="solid" /><main id="conteudo" className="property-not-found"><span>{source === 'fallback' ? 'Catálogo indisponível' : 'Catálogo Ferreira'}</span><h1>Imóvel não encontrado.</h1><p>Ele pode ter sido vendido, removido da planilha ou estar temporariamente indisponível.</p><a className="button button--dark" href="/imoveis">Voltar aos imóveis</a></main><Footer /></>

  const mapUrl = getMapUrl(property)
  const photos = property.photos.length ? property.photos : [property.mainImage]
  const selectImage = (index: number) => {
    const nextIndex = (index + photos.length) % photos.length
    setImageIndex(nextIndex)
    setSelectedImage(photos[nextIndex])
    trackEvent(nextIndex === 0 ? 'property_gallery_open' : 'property_gallery_interaction', { propertyId: property.code, imageIndex: nextIndex + 1, totalImages: photos.length })
  }
  const moveImage = (step: number) => selectImage(imageIndex + step)

  return (
    <>
      <Header variant="solid" />
      <main id="conteudo" className="property-detail">
        <div className="property-detail__topbar"><a href="/imoveis">← Voltar aos imóveis</a><span>{property.code}</span></div>
        <section className="property-detail__gallery" aria-label="Galeria do imóvel">
          <div className="property-detail__main-image" onPointerDown={(event) => { dragStartX.current = event.clientX }} onPointerUp={(event) => { if (dragStartX.current === null) return; const distance = event.clientX - dragStartX.current; dragStartX.current = null; if (Math.abs(distance) > 45) moveImage(distance < 0 ? 1 : -1) }} onPointerCancel={() => { dragStartX.current = null }}>
            <img src={selectedImage || property.mainImage} alt={`${property.title} — foto ${imageIndex + 1}`} draggable="false" />
            {photos.length > 1 && <><button type="button" className="property-detail__gallery-control property-detail__gallery-control--prev" onClick={() => moveImage(-1)} aria-label="Foto anterior">‹</button><button type="button" className="property-detail__gallery-control property-detail__gallery-control--next" onClick={() => moveImage(1)} aria-label="Próxima foto">›</button><span className="property-detail__gallery-count">{String(imageIndex + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}</span></>}
          </div>
          {photos.length > 1 && <div className="property-detail__thumbs" aria-label={`${photos.length} fotos do imóvel`}>{photos.map((photo, index) => <button type="button" className={index === imageIndex ? 'is-active' : ''} onClick={() => selectImage(index)} key={`${photo}-${index}`} aria-label={`Ver foto ${index + 1} de ${photos.length}`}><img src={photo} alt="" loading="lazy" /></button>)}</div>}
        </section>
        <section className="property-detail__intro">
          <div><span className="section-kicker">{property.type} · {property.purpose}</span><h1>{property.title}</h1><p>⌖ {getPropertyLocation(property)}</p></div>
          <div className="property-detail__price"><span>Valor</span><strong>{formatCurrency(property.price)}</strong></div>
        </section>
        <section className="property-detail__facts" aria-label="Informações principais"><Fact label="Área" value={formatArea(property.area)} /><Fact label="Construída" value={formatArea(property.builtArea)} /><Fact label="Terreno" value={formatArea(property.lotArea)} /><Fact label="Quartos" value={property.bedrooms} /><Fact label="Banheiros" value={property.bathrooms} /><Fact label="Vagas" value={property.parkingSpaces} /></section>
        <section className="property-detail__content">
          <article><span className="section-kicker">Sobre o imóvel</span><h2>O que você precisa saber <em>antes da visita.</em></h2><p>{property.description || 'Entre em contato para receber a descrição completa deste imóvel.'}</p></article>
          <aside className="property-detail__contact-card"><span>Interesse neste imóvel?</span><strong>Fale direto com {property.broker || 'Ferreira'}.</strong><p>O código {property.code} vai automaticamente na mensagem para deixar a conversa mais rápida.</p><a className="button button--accent" href={buildPropertyWhatsAppUrl(property)} target="_blank" rel="noreferrer" onClick={() => trackWhatsAppClick('property_page', { propertyId: property.code, propertyType: property.type, city: property.city, neighborhood: property.neighborhood })}>Chamar no WhatsApp <span>↗</span></a><small>CRECI {property.creci || 'consultar corretor'}</small></aside>
        </section>
        {(property.features.length > 0 || property.palette.length > 0) && <section className="property-detail__extras">{property.features.length > 0 && <div><span className="section-kicker">Diferenciais</span><div className="property-detail__tags">{property.features.map((feature) => <span key={feature}>{feature}</span>)}</div></div>}{property.palette.length > 0 && <div><span className="section-kicker">Atmosfera</span><div className="property-detail__palette">{property.palette.map((color) => <span key={color}><i style={{ background: color }} />{color}</span>)}</div></div>}</section>}
        <section className="property-detail__secondary"><div><span className="section-kicker">Custos</span><Fact label="Condomínio" value={property.condominiumFee === null ? null : formatCurrency(property.condominiumFee)} /><Fact label="IPTU" value={property.propertyTax === null ? null : formatCurrency(property.propertyTax)} /></div><div><span className="section-kicker">Localização</span><h2>{getPropertyLocation(property) || 'Consulte a localização'}</h2>{mapUrl && <a href={mapUrl} target="_blank" rel="noreferrer">Abrir localização no mapa ↗</a>}</div></section>
      </main>
      <div className="property-detail__mobile-cta"><span><small>{property.code}</small><strong>{formatCurrency(property.price)}</strong></span><a href={buildPropertyWhatsAppUrl(property)} target="_blank" rel="noreferrer" onClick={() => trackWhatsAppClick('property_mobile', { propertyId: property.code, propertyType: property.type, city: property.city, neighborhood: property.neighborhood })}>WhatsApp ↗</a></div>
      <Footer />
    </>
  )
}
