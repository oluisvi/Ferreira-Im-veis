import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { type Property } from '../data/propertyCatalog'
import { upload } from '@vercel/blob/client'
import '../styles/admin.css'

type AuthState = 'checking' | 'anonymous' | 'authenticated'
type AdminView = 'home' | 'properties' | 'manage' | 'report'
type SaveStatus = 'idle' | 'saving' | 'success' | 'error'
type ReportStatus = 'idle' | 'loading' | 'success' | 'error'
type ManageStatus = 'idle' | 'loading' | 'refreshing' | 'error'
type SaveProgress = { phase: 'uploading' | 'saving'; completed: number; total: number }
type NotificationKind = 'success' | 'error' | 'info' | 'warning'
type AdminNotification = { id: number; kind: NotificationKind; title: string; message: string }

type ClarityPage = {
  url: string
  path: string
  pageSessions: number
  scrollDepth: number
  engagementSeconds: number
  activeSeconds: number
  deadClickRate: number
  rageClickRate: number
  quickbackRate: number
  excessiveScrollRate: number
  scriptErrorRate: number
  errorClickRate: number
  propertyIntent: boolean
}

type ClarityBreakdown = { label: string; pageSessions: number; share: number }

type WhatsAppBreakdown = { label: string; count: number; share: number }

type WhatsAppStats = {
  available: boolean
  total: number
  sources: WhatsAppBreakdown[]
  pages: WhatsAppBreakdown[]
  properties: WhatsAppBreakdown[]
  message?: string
}

type ClarityReport = {
  periodDays: number
  generatedAt: string
  summary: {
    pageSessions: number
    propertyIntentSessions: number
    propertyIntentRate: number
    averageScrollDepth: number
    averageEngagementSeconds: number
    deadClickRate: number
    rageClickRate: number
    quickbackRate: number
    excessiveScrollRate: number
  }
  pages: ClarityPage[]
  devices: ClarityBreakdown[]
  sources: ClarityBreakdown[]
  whatsapp?: WhatsAppStats
  notes: {
    sessionDefinition: string
    conversionDefinition: string
    customEvents: string
  }
}

const initialValues = {
  ativo: 'sim',
  categoria: 'Casa',
  titulo: '',
  preco: '',
  localizacao: '',
  area: '',
  quartos: '',
  banheiros: '',
  vagas: '',
  descricao: '',
  imagem: '',
  video: '',
  link: '',
}

function formatSeconds(value: number) {
  if (value < 60) return `${Math.round(value)}s`
  const minutes = Math.floor(value / 60)
  const seconds = Math.round(value % 60)
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`
}

function cleanSourceLabel(value: string) {
  if (!value || value === 'Não identificado') return 'Direto / não identificado'
  return value
}


function cleanWhatsAppSource(value: string) {
  const labels: Record<string, string> = {
    floating_button: 'Botão flutuante',
    header_desktop: 'Header · desktop',
    header_mobile: 'Menu mobile',
    hero: 'Hero · início',
    footer_link: 'Footer · WhatsApp',
    footer_phone: 'Footer · telefone',
    home_property_card: 'Card de imóvel · início',
    property_card: 'Card do catálogo',
    contact: 'Seção de contato',
    empty_results: 'Busca sem resultados',
    property_page: 'Página do imóvel',
    property_mobile: 'CTA mobile do imóvel',
  }
  return labels[value] || value || 'Não identificado'
}

function readStoredReport(days: number): ClarityReport | null {
  try {
    const raw = window.localStorage.getItem(`ferreira-admin-clarity-${days}`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { savedAt?: number; report?: ClarityReport }
    if (!parsed.savedAt || !parsed.report || Date.now() - parsed.savedAt > 15 * 60 * 1000) return null
    return parsed.report
  } catch {
    return null
  }
}

function storeReport(days: number, report: ClarityReport) {
  try {
    window.localStorage.setItem(`ferreira-admin-clarity-${days}`, JSON.stringify({ savedAt: Date.now(), report }))
  } catch {
    // Local cache is optional; the server still protects the Clarity token.
  }
}

const MEDIA_TYPES: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif', gif: 'image/gif',
  mp4: 'video/mp4', webm: 'video/webm',
}

function getMediaType(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase() || ''
  const byExtension = MEDIA_TYPES[extension]
  if (byExtension) return byExtension
  return /^(image\/(jpeg|png|webp|avif|gif)|video\/(mp4|webm))$/.test(file.type) ? file.type : ''
}

function mediaPath(file: File) {
  const relativePath = (file as File & { webkitRelativePath?: string }).webkitRelativePath
  return (relativePath || file.name).replace(/\\/g, '/').split('/').filter((part) => part && part !== '.' && part !== '..').join('/')
}

function mediaSummary(files: File[]) {
  const photos = files.filter((file) => getMediaType(file)?.startsWith('image/')).length
  const videos = files.filter((file) => getMediaType(file)?.startsWith('video/')).length
  return [photos ? `${photos} foto${photos > 1 ? 's' : ''}` : '', videos ? `${videos} vídeo${videos > 1 ? 's' : ''}` : ''].filter(Boolean).join(' e ')
}


const MANAGE_CACHE_KEY = 'ferreira-admin-property-list-v1'

function readManageCache(): Property[] | null {
  try {
    const raw = window.sessionStorage.getItem(MANAGE_CACHE_KEY)
    if (!raw) return null
    const cached = JSON.parse(raw) as { savedAt?: number; properties?: Property[] }
    if (!cached.savedAt || Date.now() - cached.savedAt > 30 * 60 * 1000 || !Array.isArray(cached.properties)) return null
    return cached.properties
  } catch { return null }
}

function writeManageCache(properties: Property[]) {
  try { window.sessionStorage.setItem(MANAGE_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), properties })) } catch { /* Optional cache. */ }
}

function parseAdminNumber(value: string): number | null {
  const raw = value.trim().replace(/[^0-9,.-]/g, '')
  if (!raw) return null
  const normalized = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : /^-?\d{1,3}(\.\d{3})+$/.test(raw) ? raw.replace(/\./g, '') : raw
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function AdminToast({ notification, onDismiss }: { notification: AdminNotification | null; onDismiss: () => void }) {
  if (!notification) return null
  return <div className="admin-toast-region" aria-live={notification.kind === 'error' ? 'assertive' : 'polite'}>
    <section className={`admin-toast admin-toast--${notification.kind}`} role={notification.kind === 'error' ? 'alert' : 'status'}>
      <span className="admin-toast__mark" aria-hidden="true" />
      <div className="admin-toast__copy"><strong>{notification.title}</strong><p>{notification.message}</p></div>
      <button type="button" className="admin-toast__close" onClick={onDismiss} aria-label="Fechar notificação"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" /></svg></button>
    </section>
  </div>
}

export function Admin() {
  const [authState, setAuthState] = useState<AuthState>('checking')
  const [authConfigured, setAuthConfigured] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [notification, setNotification] = useState<AdminNotification | null>(null)
  const [loggingIn, setLoggingIn] = useState(false)
  const [view, setView] = useState<AdminView>('home')

  const [values, setValues] = useState(initialValues)
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [saveProgress, setSaveProgress] = useState<SaveProgress | null>(null)
  const [manageProperties, setManageProperties] = useState<Property[]>([])
  const [manageStatus, setManageStatus] = useState<ManageStatus>('idle')
  const [manageSearch, setManageSearch] = useState('')
  const [manageVisibility, setManageVisibility] = useState<'all' | 'active' | 'hidden'>('all')
  const [manageType, setManageType] = useState('')
  const manageLoaded = useRef(false)
  const [editingCode, setEditingCode] = useState('')
  const [pendingDelete, setPendingDelete] = useState<Property | null>(null)
  const [deleting, setDeleting] = useState(false)
  const deleteInFlight = useRef(false)
  const [existingPhotos, setExistingPhotos] = useState<string[]>([])

  const [reportDays, setReportDays] = useState(3)
  const [reportStatus, setReportStatus] = useState<ReportStatus>('idle')
  const [reportCache, setReportCache] = useState<Record<number, ClarityReport>>({})

  const report = reportCache[reportDays]
  const notify = (kind: NotificationKind, message: string) => {
    const titles: Record<NotificationKind, string> = { success: 'Concluído', error: 'Não foi possível concluir', info: 'Informação', warning: 'Atenção' }
    setNotification({ id: Date.now() + Math.random(), kind, title: titles[kind], message })
  }
  const dismissNotification = () => setNotification(null)

  useEffect(() => {
    if (!notification) return
    const timeout = window.setTimeout(() => setNotification((current) => current?.id === notification.id ? null : current), 6000)
    return () => window.clearTimeout(timeout)
  }, [notification])
  const filteredManageProperties = useMemo(() => {
    const query = manageSearch.trim().toLocaleLowerCase('pt-BR')
    return [...manageProperties].reverse().filter((property) => {
      const searchable = [property.code, property.title, property.city, property.neighborhood].join(' ').toLocaleLowerCase('pt-BR')
      const isActive = ['ativo', 'active'].includes(property.status.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase())
      const matchesVisibility = manageVisibility === 'all' || (manageVisibility === 'active' ? isActive : !isActive)
      return (!query || searchable.includes(query)) && matchesVisibility && (!manageType || property.type === manageType)
    })
  }, [manageProperties, manageSearch, manageVisibility, manageType])
  const manageTypes = useMemo(() => [...new Set(manageProperties.map((property) => property.type).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [manageProperties])

  useEffect(() => {
    if (authState !== 'authenticated' || view !== 'manage' || manageStatus === 'loading' || manageStatus === 'refreshing' || manageLoaded.current) return
    manageLoaded.current = true
    const cachedProperties = readManageCache()
    if (cachedProperties) {
      setManageProperties(cachedProperties)
      setManageStatus('refreshing')
    } else {
      setManageStatus('loading')
    }
    fetch('/api/properties?admin=1', { headers: { Accept: 'application/json' }, cache: 'no-store' })
      .then(async (response) => {
        const body = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(body.error || 'N\u00e3o foi poss\u00edvel carregar os im\u00f3veis.')
        const nextProperties = Array.isArray(body.properties) ? body.properties : []
        setManageProperties(nextProperties)
        writeManageCache(nextProperties)
        setManageStatus('idle')
      })
      .catch(() => {
        if (cachedProperties) {
          setManageStatus('idle')
          notify('warning', 'Atualiza\u00e7\u00e3o indispon\u00edvel. Mostrando a \u00faltima lista salva nesta sess\u00e3o.')
        } else {
          setManageStatus('error')
          notify('error', 'N\u00e3o foi poss\u00edvel carregar a lista de im\u00f3veis.')
        }
      })
  }, [authState, view, manageStatus])

  useEffect(() => {
    let active = true
    fetch('/api/admin-session', { headers: { Accept: 'application/json' } })
      .then(async (response) => {
        const body = await response.json().catch(() => ({}))
        if (!active) return
        setAuthConfigured(body.configured !== false)
        if (body.configured === false) notify('error', 'Configure ADMIN_USERNAME e ADMIN_PASSWORD nas vari\u00e1veis de ambiente para habilitar o acesso.')
        setAuthState(response.ok && body.authenticated ? 'authenticated' : 'anonymous')
      })
      .catch(() => {
        if (active) setAuthState('anonymous')
      })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (authState !== 'authenticated' || view !== 'report' || reportCache[reportDays]) return
    const stored = readStoredReport(reportDays)
    if (stored) {
      setReportCache((current) => ({ ...current, [reportDays]: stored }))
      setReportStatus('success')
      notify('success', 'Relat\u00f3rio atualizado.')
      return
    }
    void loadReport(reportDays)
  }, [authState, view, reportDays, reportCache])

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoggingIn(true)
    setNotification(null)
    try {
      const response = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.error || 'Não foi possível entrar.')
      setPassword('')
      setAuthState('authenticated')
      notify('success', 'Sess\u00e3o iniciada.')
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'N\u00e3o foi poss\u00edvel entrar.')
    } finally {
      setLoggingIn(false)
    }
  }

  async function handleLogout() {
    try { await fetch('/api/admin-logout', { method: 'POST' }) } catch { /* local session still closes */ }
    setAuthState('anonymous')
    try { window.sessionStorage.removeItem(MANAGE_CACHE_KEY) } catch { /* Optional cache. */ }
    setReportCache({})
    setView('home')
    manageLoaded.current = false
    notify('info', 'Sess\u00e3o encerrada.')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const wasEditing = Boolean(editingCode)
    setStatus('saving')
    setSaveProgress({ phase: mediaFiles.length ? 'uploading' : 'saving', completed: 0, total: mediaFiles.length })

    try {
      let imageUrl = values.imagem
      let videoUrl = values.video
      const uploadedByIndex: ({ file: File; type: string; url: string } | undefined)[] = new Array(mediaFiles.length)
      let nextIndex = 0
      let completedUploads = 0
      let uploadError: unknown = null
      const connection = (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } }).connection
      const slowConnection = connection?.saveData || ['slow-2g', '2g', '3g'].includes(connection?.effectiveType || '')
      const concurrency = slowConnection ? 2 : 4
      const workers = Array.from({ length: Math.min(concurrency, mediaFiles.length) }, async () => {
        while (nextIndex < mediaFiles.length && !uploadError) {
          const index = nextIndex++
          const file = mediaFiles[index]
          const type = getMediaType(file)!
          try {
            const blob = await upload('imoveis/' + mediaPath(file), file, { access: 'public', contentType: type, handleUploadUrl: '/api/upload-token', multipart: true })
            uploadedByIndex[index] = { file, type, url: blob.url }
            completedUploads += 1
            setSaveProgress({ phase: 'uploading', completed: completedUploads, total: mediaFiles.length })
          } catch (error) { uploadError = error; return }
        }
      })
      await Promise.all(workers)
      if (uploadError) throw uploadError
      const uploaded = uploadedByIndex.filter((item): item is { file: File; type: string; url: string } => Boolean(item))
      const uploadedImages = uploaded.filter(({ type }) => type.startsWith('image/')).map(({ url }) => url)
      const uploadedVideo = uploaded.find(({ type }) => type.startsWith('video/'))?.url
      if (uploadedImages.length) imageUrl = uploadedImages[0]
      if (uploadedVideo) videoUrl = uploadedVideo

      const propertyId = editingCode || crypto.randomUUID()
      const previous = manageProperties.find((property) => property.code === propertyId)
      const nextPhotos = [...new Set([...existingPhotos, ...uploadedImages, imageUrl].filter(Boolean))]
      const location = values.localizacao.trim()
      const optimisticProperty: Property = {
        code: propertyId, title: values.titulo, type: values.categoria, purpose: previous?.purpose || 'Venda',
        city: location || previous?.city || '', neighborhood: previous?.neighborhood || '', address: location || previous?.address || '',
        price: parseAdminNumber(values.preco), bedrooms: parseAdminNumber(values.quartos), bathrooms: parseAdminNumber(values.banheiros),
        parkingSpaces: parseAdminNumber(values.vagas), area: parseAdminNumber(values.area), builtArea: previous?.builtArea ?? null, lotArea: previous?.lotArea ?? null,
        description: values.descricao, mainImage: imageUrl || previous?.mainImage || '', photos: nextPhotos, video: videoUrl,
        broker: previous?.broker || 'Ferreira', creci: previous?.creci || '', whatsapp: previous?.whatsapp || '',
        status: values.ativo === 'sim' ? 'Ativo' : 'Oculto', featured: previous?.featured || false,
        features: previous?.features || [], palette: previous?.palette || [], condominiumFee: previous?.condominiumFee ?? null,
        propertyTax: previous?.propertyTax ?? null, latitude: previous?.latitude ?? null, longitude: previous?.longitude ?? null,
      }
      setSaveProgress({ phase: 'saving', completed: mediaFiles.length, total: mediaFiles.length })
      const response = await fetch('/api/admin-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, imagem: imageUrl, imagens: nextPhotos.join(' | '), video: videoUrl, midias: uploaded.map(({ url }) => url).join(' | '), id: propertyId, action: editingCode ? 'update_property' : 'create_property' }),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        if (response.status === 401) setAuthState('anonymous')
        throw new Error(body.error || 'N\u00e3o foi poss\u00edvel salvar o im\u00f3vel.')
      }

      const nextManageProperties = wasEditing
        ? manageProperties.map((property) => property.code === propertyId ? optimisticProperty : property)
        : [...manageProperties, optimisticProperty]
      setManageProperties(nextManageProperties)
      writeManageCache(nextManageProperties)
      setValues(initialValues)
      setEditingCode('')
      setExistingPhotos([])
      manageLoaded.current = false
      setMediaFiles([])
      setSaveProgress(null)
      setStatus('success')
      notify('success', wasEditing ? 'Im\u00f3vel atualizado com sucesso.' : 'Im\u00f3vel adicionado com sucesso.')
      setManageSearch('')
      setManageVisibility('all')
      setManageType('')
      setView('manage')
    } catch (error) {
      setStatus('error')
      setSaveProgress(null)
      notify('error', error instanceof Error ? error.message : 'N\u00e3o foi poss\u00edvel salvar o im\u00f3vel.')
    }
  }

  async function loadReport(days: number, force = false) {
    if (!force && reportCache[days]) return
    setReportStatus('loading')
    try {
      const response = await fetch(`/api/admin-clarity?days=${days}${force ? '&refresh=1' : ''}`, {
        headers: { Accept: 'application/json' },
        cache: force ? 'reload' : 'default',
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        if (response.status === 401) setAuthState('anonymous')
        throw new Error(body.error || 'Não foi possível carregar o relatório.')
      }
      const nextReport = body as ClarityReport
      setReportCache((current) => ({ ...current, [days]: nextReport }))
      storeReport(days, nextReport)
      setReportStatus('success')
    } catch (error) {
      setReportStatus('error')
      notify('error', error instanceof Error ? error.message : 'N\u00e3o foi poss\u00edvel carregar o relat\u00f3rio.')
    }
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files ? Array.from(event.target.files) : []
    const supported = selected.filter((file) => getMediaType(file))
    const videos = supported.filter((file) => getMediaType(file)?.startsWith('video/'))
    const images = supported.filter((file) => getMediaType(file)?.startsWith('image/'))
    const limitedVideos = videos.slice(0, 10)
    const limitedImages = images.slice(0, Math.max(0, 10 - limitedVideos.length))
    const limited = [...limitedVideos, ...limitedImages]
    const unsupportedCount = selected.length - supported.length
    const droppedVideoCount = videos.length - limitedVideos.length
    const droppedImageCount = images.length - limitedImages.length
    const messages = []
    if (unsupportedCount) messages.push(unsupportedCount + ' arquivo(s) ignorado(s): formato n\u00e3o aceito.')
    if (droppedImageCount && !droppedVideoCount) messages.push('Limite de 10 arquivos: removemos ' + droppedImageCount + ' imagem(ns) para manter todos os v\u00eddeos.')
    else if (droppedVideoCount) messages.push('Limite de 10 arquivos: v\u00eddeos t\u00eam prioridade; ' + droppedVideoCount + ' v\u00eddeo(s) excedente(s) e ' + droppedImageCount + ' imagem(ns) n\u00e3o entraram.')
    setMediaFiles(limited)
    if (messages.length) notify('warning', messages.join(' '))
  }

  function update(name: keyof typeof initialValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }))
  }

  function startEditing(property: Property) {
    const normalizedStatus = property.status.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    const activeValue = ['ativo', 'active'].includes(normalizedStatus) ? 'sim' : 'n\u00e3o'
    setValues({ ativo: activeValue, categoria: property.type || 'Casa', titulo: property.title, preco: property.price?.toString() || '', localizacao: [property.neighborhood, property.city].filter(Boolean).join(', '), area: property.area?.toString() || '', quartos: property.bedrooms?.toString() || '', banheiros: property.bathrooms?.toString() || '', vagas: property.parkingSpaces?.toString() || '', descricao: property.description, imagem: property.mainImage, video: property.video || '', link: '' })
    setExistingPhotos(property.photos)
    setEditingCode(property.code)
    setView('properties')
    notify('info', 'Editando o im\u00f3vel ' + property.code + '.')
  }

  function startAdding() {
    setEditingCode('')
    setExistingPhotos([])
    setValues(initialValues)
    setMediaFiles([])
    setStatus('idle')
    setView('properties')
  }
  async function deleteProperty(property: Property) {
    setPendingDelete(property)
  }

  async function confirmDelete() {
    if (!pendingDelete || deleteInFlight.current) return
    const property = pendingDelete
    deleteInFlight.current = true
    setDeleting(true)
    try {
      const response = await fetch('/api/admin-property', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: property.code, confirmation: true }) })
      const body = await response.json().catch(() => ({}))
      if (response.status === 401) setAuthState('anonymous')
      if (!response.ok || body.ok !== true || body.exists !== false) throw new Error(body.error || 'A exclusão não foi confirmada. Tente novamente.')
      const nextProperties = manageProperties.filter((item) => item.code.trim().toLowerCase() !== property.code.trim().toLowerCase())
      setManageProperties(nextProperties)
      writeManageCache(nextProperties)
      setPendingDelete(null)
      notify(body.externalMedia ? 'warning' : 'success', body.externalMedia ? 'Imóvel excluído. Links externos saíram da planilha, mas os arquivos continuam no provedor original.' : 'Imóvel excluído com sucesso.')
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Não foi possível concluir a exclusão. Tente novamente.')
    } finally {
      deleteInFlight.current = false
      setDeleting(false)
    }
  }

  if (authState === 'checking') {
    return <main className="admin-page admin-page--center"><AdminToast notification={notification} onDismiss={dismissNotification} /><div className="admin-auth-card"><span className="admin-eyebrow">Ferreira Imóveis</span><div className="admin-loading-mark" aria-hidden="true">F</div><p>Verificando acesso administrativo…</p></div></main>
  }

  if (authState === 'anonymous') {
    return (
      <main className="admin-page admin-page--center">
        <AdminToast notification={notification} onDismiss={dismissNotification} />
        <section className="admin-auth-card">
          <div className="admin-auth-card__brand"><span className="admin-brand-mark">F</span><div><span className="admin-eyebrow">Área restrita</span><strong>Ferreira Imóveis</strong></div></div>
          <div className="admin-auth-card__intro">
            <h1>Acesso administrativo</h1>
            <p>Entre para cadastrar imóveis e acompanhar o comportamento dos visitantes no site.</p>
          </div>
          <form className="admin-login" onSubmit={handleLogin}>
            <label>Usuário<input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required /></label>
            <label>Senha<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
            <button type="submit" disabled={loggingIn || !authConfigured}>{loggingIn ? 'Entrando…' : 'Entrar no painel'} <span>→</span></button>
            
          </form>
          <a className="admin-back-link" href="/">← Voltar ao site</a>
        </section>
      </main>
    )
  }

  return (
    <main className="admin-page">
      <AdminToast notification={notification} onDismiss={dismissNotification} />
      <section className="admin-shell">
        <header className="admin-topbar">
          <a className="admin-brand" href="/" aria-label="Voltar para Ferreira Imóveis"><span className="admin-brand-mark">F</span><span><strong>Ferreira</strong><small>Administração</small></span></a>
          <nav className="admin-tabs" aria-label="Áreas do painel">
            <button type="button" className={view === 'home' ? 'is-active' : ''} onClick={() => setView('home')}><span>00</span> Início</button>
            <button type="button" className={view === 'properties' ? 'is-active' : ''} onClick={() => setView('properties')}><span>01</span> Imóveis</button>
            <button type="button" className={view === 'report' ? 'is-active' : ''} onClick={() => setView('report')}><span>02</span> Relatório</button>
          </nav>
          <button className="admin-logout" type="button" onClick={handleLogout}>Sair ↗</button>
        </header>

        {view === 'home' ? (
          <section className="admin-panel admin-home">
            <header className="admin-header">
              <span>Painel administrativo</span>
              <div className="admin-header__row"><div><h1>O que você deseja fazer?</h1><p>Escolha uma ação para administrar o catálogo da Ferreira Imóveis.</p></div><div className="admin-header__badge"><i />Sessão protegida</div></div>
            </header>
            
            <div className="admin-home__actions">
              <button type="button" onClick={startAdding}><span>01</span><strong>Adicionar imóvel</strong><small>Cadastrar uma nova oportunidade no catálogo.</small><b>→</b></button>
              <button type="button" onClick={() => { setStatus('idle'); manageLoaded.current = false; setView('manage') }}><span>02</span><strong>Editar imóvel</strong><small>Localizar um imóvel publicado e alterar seus dados.</small><b>→</b></button>
              <button type="button" onClick={() => { setStatus('idle'); manageLoaded.current = false; setView('manage') }}><span>03</span><strong>Excluir imóvel</strong><small>Gerenciar e remover definitivamente um imóvel vendido.</small><b>→</b></button>
            </div>
          </section>
        ) : view === 'properties' || view === 'manage' ? (
          <section className="admin-panel">
            <button className="admin-back-button" type="button" onClick={() => { if (view === 'manage') { manageLoaded.current = false; setView('home') } else if (editingCode) setView('manage'); else setView('home') }}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m0 0 7-7m-7 7 7 7" /></svg>
              {view === 'manage' || !editingCode ? 'Voltar ao in\u00edcio' : 'Voltar \u00e0 lista'}
            </button>
            <header className="admin-header">
              <span>{view === 'manage' ? 'Catálogo · gerenciamento' : 'Catálogo · Google Sheets'}</span>
              <div className="admin-header__row"><div><h1>{view === 'manage' ? 'Gerenciar imóveis' : editingCode ? 'Editar imóvel' : 'Cadastro de imóveis'}</h1><p>{view === 'manage' ? 'Edite ou exclua definitivamente os imóveis publicados no catálogo.' : editingCode ? `Atualize os dados do imóvel ${editingCode} sem criar uma nova publicação.` : 'Adicione um novo imóvel ao catálogo conectado ao Google Sheets. A publicação segue o status definido abaixo.'}</p></div><div className="admin-header__badge"><i />Conectado ao fluxo de cadastro</div></div>
            </header>

            {view === 'manage' ? (
              <div className='admin-manage-list'>
                
                <div className='admin-manage-toolbar' role='search'>
                  <label>Buscar im&oacute;vel<input type='search' value={manageSearch} onChange={(event) => setManageSearch(event.target.value)} placeholder='C&oacute;digo, nome, cidade ou bairro' /></label>
                  <label>Status<select value={manageVisibility} onChange={(event) => setManageVisibility(event.target.value as 'all' | 'active' | 'hidden')}><option value='all'>Todos</option><option value='active'>Ativos</option><option value='hidden'>Ocultos</option></select></label>
                  <label>Categoria<select value={manageType} onChange={(event) => setManageType(event.target.value)}><option value=''>Todas</option>{manageTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
                  <span className='admin-manage-order'>Mais recentes primeiro</span>
                  <button type='button' className='admin-manage-add' onClick={startAdding}><svg viewBox='0 0 24 24' aria-hidden='true'><path d='M12 5v14M5 12h14' /></svg> Adicionar im&oacute;vel</button>
                </div>
                <div className='admin-manage-grid'>
                  {manageStatus === 'loading' && <div className='admin-manage-skeleton' role='status' aria-label='Carregando im&oacute;veis'>{Array.from({ length: 5 }, (_, index) => <div key={index}><i /><span><b /><b /><b /></span><em /></div>)}</div>}
                  {manageStatus === 'refreshing' && <p className='admin-manage-refreshing' role='status'>Atualizando lista...</p>}
                  {manageStatus === 'error' && <div className='admin-manage-error' role='alert'><p>N&atilde;o foi poss&iacute;vel carregar a lista de im&oacute;veis.</p><button type='button' onClick={() => { manageLoaded.current = false; setManageStatus('idle') }}>Tentar novamente</button></div>}
                  
                  {manageStatus !== 'loading' && manageStatus !== 'error' && filteredManageProperties.length === 0 && <p className='admin-manage-empty'>{manageProperties.length ? 'Nenhum im\u00f3vel corresponde aos filtros.' : 'Ainda n\u00e3o h\u00e1 im\u00f3veis cadastrados.'}</p>}
                  {manageStatus !== 'loading' && manageStatus !== 'error' && filteredManageProperties.map((property) => {
                    const isPendingDelete = pendingDelete?.code === property.code
                    const isActive = ['ativo', 'active'].includes(property.status.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase())
                    return <article key={property.code} className={isPendingDelete ? 'is-delete-pending' : ''}>
                      <img src={property.mainImage} alt='' loading='lazy' decoding='async' />
                      <div className='admin-manage-card__info'>
                        {isPendingDelete ? <><strong>Excluir im&oacute;vel definitivamente?</strong><small>&ldquo;{property.title}&rdquo; e suas m&iacute;dias ser&atilde;o removidas.</small></> : <><span>{property.code} &middot; {property.city}</span><strong>{property.title}</strong><small>{property.price ? `R$ ${property.price.toLocaleString('pt-BR')}` : 'Pre\u00e7o sob consulta'}</small><small className={'admin-manage-card__status' + (isActive ? '' : ' is-hidden')}>{isActive ? 'Ativo no site' : 'Oculto no site'}</small></>}
                      </div>
                      <div className='admin-manage-card__actions'>
                        {isPendingDelete ? <><button type='button' disabled={deleting} onClick={() => { setPendingDelete(null); notify('info', 'Exclus\u00e3o cancelada.') }}>Cancelar</button><button type='button' className='is-danger' disabled={deleting} onClick={() => void confirmDelete()}>{deleting ? 'Excluindo e atualizando planilha...' : 'Sim, excluir'}</button></> : <><button type='button' disabled={deleting} onClick={() => startEditing(property)}>Editar</button><button type='button' className='is-danger' disabled={deleting} onClick={() => void deleteProperty(property)}>Excluir</button></>}
                      </div>
                    </article>
                  })}
                </div>
              </div>
            ) : <form className="admin-form" onSubmit={handleSubmit}>
              {status === 'saving' && saveProgress && <div className='admin-save-progress admin-form__wide' role='status' aria-live='polite'><strong>{saveProgress.phase === 'uploading' ? `Enviando m&iacute;dia ${saveProgress.completed} de ${saveProgress.total}` : 'Salvando dados do im&oacute;vel...'}</strong>{saveProgress.phase === 'uploading' && <progress value={saveProgress.completed} max={saveProgress.total} />}</div>}
              <label>Status<select value={values.ativo} onChange={(event) => update('ativo', event.target.value)}><option value="sim">Ativo no site</option><option value="não">Oculto</option></select></label>
              <label>Categoria<select value={values.categoria} onChange={(event) => update('categoria', event.target.value)}><option>Casa</option><option>Apartamento</option><option>Refúgio</option></select></label>
              <label>Título<input value={values.titulo} onChange={(event) => update('titulo', event.target.value)} required /></label>
              <label>Preço<input value={values.preco} onChange={(event) => update('preco', event.target.value)} placeholder="R$ 650.000" /></label>
              <label>Localização<input value={values.localizacao} onChange={(event) => update('localizacao', event.target.value)} /></label>
              <label>Área<input value={values.area} onChange={(event) => update('area', event.target.value)} placeholder="120 m²" /></label>
              <label>Quartos<input value={values.quartos} onChange={(event) => update('quartos', event.target.value)} /></label>
              <label>Banheiros<input value={values.banheiros} onChange={(event) => update('banheiros', event.target.value)} /></label>
              <label>Vagas<input value={values.vagas} onChange={(event) => update('vagas', event.target.value)} /></label>
              <label className="admin-form__wide">Descrição<textarea value={values.descricao} onChange={(event) => update('descricao', event.target.value)} rows={5} /></label>
              <div className="admin-media-notice admin-form__wide" id="admin-media-note" role="note"><strong>Envie at&eacute; 10 arquivos por im&oacute;vel</strong><span>O limite inclui fotos e v&iacute;deos juntos. Formatos aceitos: JPG, PNG, WebP, AVIF, GIF, MP4 e WebM.</span></div>
              <label className="admin-form__wide admin-media-field">Fotos e vídeos<input type="file" aria-describedby="admin-media-note" accept=".jpg,.jpeg,.png,.webp,.avif,.gif,.mp4,.webm,image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/webm" multiple onChange={handleImageChange} /><small>{mediaFiles.length ? `Prontos para envio: ${mediaSummary(mediaFiles)}` : 'Selecione várias fotos ou vídeos. A primeira imagem será a capa.'}</small></label>
              <label className="admin-form__wide admin-media-field">Selecionar pasta do imóvel<input type="file" aria-describedby="admin-media-note" accept=".jpg,.jpeg,.png,.webp,.avif,.gif,.mp4,.webm,image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/webm" multiple {...({ webkitdirectory: 'true' } as any)} onChange={handleImageChange} /><small>{mediaFiles.length ? `Prontos para envio: ${mediaSummary(mediaFiles)}` : 'Em Chrome/Edge, escolha a pasta completa; imagens e vídeos serão separados automaticamente.'}</small></label>
              
              <label className="admin-form__wide">Vídeo por URL (opcional)<input value={values.video} onChange={(event) => update('video', event.target.value)} placeholder="https://.../tour.mp4" /></label>
              <label className="admin-form__wide">Link da imagem (opcional)<input value={values.imagem} onChange={(event) => update('imagem', event.target.value)} /></label>
              <label className="admin-form__wide">Link do anúncio original<input value={values.link} onChange={(event) => update('link', event.target.value)} /></label>
              <button type="submit" disabled={status === 'saving'}>{status === 'saving' ? 'Salvando…' : editingCode ? 'Atualizar imóvel' : 'Adicionar na planilha'} <span>→</span></button>
            </form>}
          </section>
        ) : (
          <section className="admin-panel admin-report">
            <header className="admin-header admin-report__header">
              <span>Clarity + Google Sheets · comportamento e contato</span>
              <div className="admin-header__row">
                <div><h1>Relatório de comportamento</h1><p>Uma leitura rápida de intenção, profundidade de navegação, sinais de atrito e cliques de contato para entender onde os potenciais clientes avançam ou travam.</p></div>
                <a className="admin-clarity-link" href="https://clarity.microsoft.com/" target="_blank" rel="noreferrer">Abrir Clarity <span>↗</span></a>
              </div>
            </header>

            <div className="admin-report__toolbar">
              <div><span>Período disponível pela API</span><div className="admin-periods">{[1, 2, 3].map((days) => <button type="button" className={reportDays === days ? 'is-active' : ''} onClick={() => setReportDays(days)} key={days}>{days === 1 ? '24 horas' : days === 2 ? '48 horas' : '72 horas'}</button>)}</div></div>
              <button className="admin-refresh" type="button" onClick={() => void loadReport(reportDays, true)} disabled={reportStatus === 'loading'}>{reportStatus === 'loading' ? 'Atualizando…' : 'Atualizar dados'} ↻</button>
            </div>

            {reportStatus === 'loading' && !report && <div className="admin-report__state"><span className="admin-loading-mark">F</span><strong>Carregando comportamento recente…</strong><p>Consultando os dados agregados do Microsoft Clarity.</p></div>}
            

            {report && (
              <>
                <div className="admin-kpis">
                  <article><span>Sessões por página</span><strong>{report.summary.pageSessions.toLocaleString('pt-BR')}</strong><small>atividade acumulada nas URLs</small></article>
                  <article className="is-highlight"><span>Interesse em imóveis</span><strong>{report.summary.propertyIntentRate.toLocaleString('pt-BR')}%</strong><small>{report.summary.propertyIntentSessions.toLocaleString('pt-BR')} sessões em catálogo/detalhes</small></article>
                  <article className="is-contact"><span>Cliques no WhatsApp</span><strong>{report.whatsapp?.available ? report.whatsapp.total.toLocaleString('pt-BR') : '—'}</strong><small>{report.whatsapp?.available ? `registrados nas últimas ${report.periodDays * 24}h` : 'registro próprio ainda não disponível'}</small></article>
                  <article><span>Scroll médio</span><strong>{report.summary.averageScrollDepth.toLocaleString('pt-BR')}%</strong><small>profundidade média das páginas</small></article>
                  <article><span>Engajamento médio</span><strong>{formatSeconds(report.summary.averageEngagementSeconds)}</strong><small>tempo médio por sessão de página</small></article>
                </div>

                <div className="admin-report__grid">
                  <section className="admin-report-card admin-report-card--wide">
                    <header><div><span>Jornada</span><h2>Páginas com maior atividade</h2></div><small>Use para identificar onde a intenção se concentra.</small></header>
                    <div className="admin-pages-table">
                      {report.pages.slice(0, 8).map((page, index) => (
                        <article key={page.url}>
                          <span className="admin-rank">{String(index + 1).padStart(2, '0')}</span>
                          <div className="admin-page-name"><strong>{page.path}</strong><small>{page.propertyIntent ? 'Página de intenção imobiliária' : 'Página institucional / navegação'}</small></div>
                          <div><strong>{page.pageSessions.toLocaleString('pt-BR')}</strong><small>sessões</small></div>
                          <div><strong>{page.scrollDepth.toLocaleString('pt-BR')}%</strong><small>scroll</small></div>
                          <div><strong>{formatSeconds(page.engagementSeconds)}</strong><small>engaj.</small></div>
                        </article>
                      ))}
                    </div>
                  </section>

                  <section className="admin-report-card">
                    <header><div><span>Atrito</span><h2>Sinais que merecem atenção</h2></div></header>
                    <div className="admin-friction-list">
                      <div><span>Dead clicks</span><strong>{report.summary.deadClickRate.toLocaleString('pt-BR')}%</strong><i><b style={{ width: `${Math.min(report.summary.deadClickRate, 100)}%` }} /></i></div>
                      <div><span>Rage clicks</span><strong>{report.summary.rageClickRate.toLocaleString('pt-BR')}%</strong><i><b style={{ width: `${Math.min(report.summary.rageClickRate, 100)}%` }} /></i></div>
                      <div><span>Quickbacks</span><strong>{report.summary.quickbackRate.toLocaleString('pt-BR')}%</strong><i><b style={{ width: `${Math.min(report.summary.quickbackRate, 100)}%` }} /></i></div>
                      <div><span>Scroll excessivo</span><strong>{report.summary.excessiveScrollRate.toLocaleString('pt-BR')}%</strong><i><b style={{ width: `${Math.min(report.summary.excessiveScrollRate, 100)}%` }} /></i></div>
                    </div>
                    <p className="admin-report-card__hint">Esses sinais não significam automaticamente um problema. Eles servem para escolher quais páginas e gravações revisar no Clarity.</p>
                  </section>

                  <section className="admin-report-card">
                    <header><div><span>Contato</span><h2>Origem dos cliques no WhatsApp</h2></div><small>Mostra quais CTAs estão gerando mais contatos.</small></header>
                    {report.whatsapp?.available ? (
                      report.whatsapp.sources.length > 0 ? (
                        <div className="admin-breakdown">{report.whatsapp.sources.map((item) => <div key={item.label}><div><span>{cleanWhatsAppSource(item.label)}</span><strong>{item.count.toLocaleString('pt-BR')} · {item.share.toLocaleString('pt-BR')}%</strong></div><i><b style={{ width: `${Math.min(item.share, 100)}%` }} /></i></div>)}</div>
                      ) : <p className="admin-report-card__hint">Ainda não houve cliques de WhatsApp registrados neste período.</p>
                    ) : <p className="admin-report-card__hint">{report.whatsapp?.message || 'A contagem de cliques ainda não está disponível.'}</p>}
                  </section>

                  <section className="admin-report-card">
                    <header><div><span>Contexto</span><h2>Dispositivos</h2></div></header>
                    <div className="admin-breakdown">{report.devices.map((item) => <div key={item.label}><div><span>{item.label}</span><strong>{item.share.toLocaleString('pt-BR')}%</strong></div><i><b style={{ width: `${Math.min(item.share, 100)}%` }} /></i></div>)}</div>
                  </section>

                  <section className="admin-report-card">
                    <header><div><span>Aquisição</span><h2>Origens de tráfego</h2></div></header>
                    <div className="admin-breakdown">{report.sources.map((item) => <div key={item.label}><div><span>{cleanSourceLabel(item.label)}</span><strong>{item.share.toLocaleString('pt-BR')}%</strong></div><i><b style={{ width: `${Math.min(item.share, 100)}%` }} /></i></div>)}</div>
                  </section>

                  <section className="admin-report-card admin-report-card--conversion">
                    <header><div><span>Conversão</span><h2>Como ler as leads</h2></div></header>
                    <div className="admin-conversion-flow"><div><span>01</span><strong>Visita</strong><small>entrada no site</small></div><i>→</i><div><span>02</span><strong>Interesse</strong><small>/imoveis e detalhes</small></div><i>→</i><div><span>03</span><strong>Contato</strong><small>{report.whatsapp?.available ? `${report.whatsapp.total.toLocaleString('pt-BR')} clique${report.whatsapp.total === 1 ? '' : 's'} no período` : 'evento whatsapp_click'}</small></div></div>
                    <p>{report.notes.customEvents} A contagem exibida aqui começa após a publicação desta versão do rastreamento.</p>
                    <a href="https://clarity.microsoft.com/" target="_blank" rel="noreferrer">Revisar Smart Events e gravações no Clarity ↗</a>
                  </section>
                </div>

                <footer className="admin-report__notes">
                  <span>Atualizado {new Date(report.generatedAt).toLocaleString('pt-BR')}</span>
                  <p>{report.notes.sessionDefinition} {report.notes.conversionDefinition}</p>
                </footer>
              </>
            )}
          </section>
        )}
      </section>
    </main>
  )
}
