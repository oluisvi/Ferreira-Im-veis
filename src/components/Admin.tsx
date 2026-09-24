import { ChangeEvent, FormEvent, useEffect, useState } from 'react'

const BLOB_UPLOAD_URL = import.meta.env.VITE_BLOB_UPLOAD_URL || '/api/upload-image'

type AuthState = 'checking' | 'anonymous' | 'authenticated'
type AdminView = 'properties' | 'report'
type SaveStatus = 'idle' | 'saving' | 'success' | 'error'
type ReportStatus = 'idle' | 'loading' | 'success' | 'error'

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

export function Admin() {
  const [authState, setAuthState] = useState<AuthState>('checking')
  const [authConfigured, setAuthConfigured] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const [view, setView] = useState<AdminView>('properties')

  const [values, setValues] = useState(initialValues)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [saveMessage, setSaveMessage] = useState('')

  const [reportDays, setReportDays] = useState(3)
  const [reportStatus, setReportStatus] = useState<ReportStatus>('idle')
  const [reportError, setReportError] = useState('')
  const [reportCache, setReportCache] = useState<Record<number, ClarityReport>>({})

  const report = reportCache[reportDays]

  useEffect(() => {
    let active = true
    fetch('/api/admin-session', { headers: { Accept: 'application/json' } })
      .then(async (response) => {
        const body = await response.json().catch(() => ({}))
        if (!active) return
        setAuthConfigured(body.configured !== false)
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
      return
    }
    void loadReport(reportDays)
  }, [authState, view, reportDays, reportCache])

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoggingIn(true)
    setLoginError('')
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
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Não foi possível entrar.')
    } finally {
      setLoggingIn(false)
    }
  }

  async function handleLogout() {
    try { await fetch('/api/admin-logout', { method: 'POST' }) } catch { /* local session still closes */ }
    setAuthState('anonymous')
    setReportCache({})
    setView('properties')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('saving')
    setSaveMessage('')

    try {
      let imageUrl = values.imagem
      if (imageFile) {
        const upload = await fetch(BLOB_UPLOAD_URL, {
          method: 'POST',
          headers: {
            'Content-Type': imageFile.type || 'application/octet-stream',
            'X-Filename': imageFile.name,
          },
          body: imageFile,
        })
        const uploadBody = await upload.json().catch(() => ({}))
        if (!upload.ok) throw new Error(uploadBody.error || 'Falha ao enviar a imagem')
        imageUrl = uploadBody.url
      }

      const response = await fetch('/api/admin-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, imagem: imageUrl, id: crypto.randomUUID() }),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        if (response.status === 401) setAuthState('anonymous')
        throw new Error(body.error || 'Não foi possível salvar o imóvel.')
      }

      setValues(initialValues)
      setImageFile(null)
      setStatus('success')
      setSaveMessage('Imóvel enviado para a planilha com sucesso.')
    } catch (error) {
      setStatus('error')
      setSaveMessage(error instanceof Error ? error.message : 'Não foi possível salvar o imóvel.')
    }
  }

  async function loadReport(days: number, force = false) {
    if (!force && reportCache[days]) return
    setReportStatus('loading')
    setReportError('')
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
      setReportError(error instanceof Error ? error.message : 'Não foi possível carregar o relatório.')
    }
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    setImageFile(event.target.files?.[0] ?? null)
  }

  function update(name: keyof typeof initialValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }))
  }

  if (authState === 'checking') {
    return <main className="admin-page admin-page--center"><div className="admin-auth-card"><span className="admin-eyebrow">Ferreira Imóveis</span><div className="admin-loading-mark" aria-hidden="true">F</div><p>Verificando acesso administrativo…</p></div></main>
  }

  if (authState === 'anonymous') {
    return (
      <main className="admin-page admin-page--center">
        <section className="admin-auth-card">
          <div className="admin-auth-card__brand"><span className="admin-brand-mark">F</span><div><span className="admin-eyebrow">Área restrita</span><strong>Ferreira Imóveis</strong></div></div>
          <div className="admin-auth-card__intro">
            <h1>Acesso administrativo</h1>
            <p>Entre para cadastrar imóveis e acompanhar o comportamento dos visitantes no site.</p>
          </div>
          {!authConfigured && <div className="admin-alert admin-alert--error">Configure <code>ADMIN_USERNAME</code> e <code>ADMIN_PASSWORD</code> nas variáveis de ambiente antes de acessar.</div>}
          <form className="admin-login" onSubmit={handleLogin}>
            <label>Usuário<input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required /></label>
            <label>Senha<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
            <button type="submit" disabled={loggingIn || !authConfigured}>{loggingIn ? 'Entrando…' : 'Entrar no painel'} <span>→</span></button>
            {loginError && <output>{loginError}</output>}
          </form>
          <a className="admin-back-link" href="/">← Voltar ao site</a>
        </section>
      </main>
    )
  }

  return (
    <main className="admin-page">
      <section className="admin-shell">
        <header className="admin-topbar">
          <a className="admin-brand" href="/" aria-label="Voltar para Ferreira Imóveis"><span className="admin-brand-mark">F</span><span><strong>Ferreira</strong><small>Administração</small></span></a>
          <nav className="admin-tabs" aria-label="Áreas do painel">
            <button type="button" className={view === 'properties' ? 'is-active' : ''} onClick={() => setView('properties')}><span>01</span> Imóveis</button>
            <button type="button" className={view === 'report' ? 'is-active' : ''} onClick={() => setView('report')}><span>02</span> Relatório</button>
          </nav>
          <button className="admin-logout" type="button" onClick={handleLogout}>Sair ↗</button>
        </header>

        {view === 'properties' ? (
          <section className="admin-panel">
            <header className="admin-header">
              <span>Catálogo · Google Sheets</span>
              <div className="admin-header__row"><div><h1>Cadastro de imóveis</h1><p>Adicione um novo imóvel ao catálogo conectado ao Google Sheets. A publicação segue o status definido abaixo.</p></div><div className="admin-header__badge"><i />Conectado ao fluxo de cadastro</div></div>
            </header>

            <form className="admin-form" onSubmit={handleSubmit}>
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
              <label className="admin-form__wide">Imagem principal<input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} /><small>{imageFile ? `Arquivo selecionado: ${imageFile.name}` : 'A imagem será enviada automaticamente ao Blob.'}</small></label>
              <label className="admin-form__wide">Link da imagem (opcional)<input value={values.imagem} onChange={(event) => update('imagem', event.target.value)} /></label>
              <label className="admin-form__wide">Link do anúncio original<input value={values.link} onChange={(event) => update('link', event.target.value)} /></label>
              <button type="submit" disabled={status === 'saving'}>{status === 'saving' ? 'Salvando…' : 'Adicionar na planilha'} <span>→</span></button>
              <output className={status === 'success' ? 'is-success' : ''}>{saveMessage}</output>
            </form>
          </section>
        ) : (
          <section className="admin-panel admin-report">
            <header className="admin-header admin-report__header">
              <span>Microsoft Clarity · comportamento</span>
              <div className="admin-header__row">
                <div><h1>Relatório de comportamento</h1><p>Uma leitura rápida de intenção, profundidade de navegação e sinais de atrito para ajudar a entender onde os potenciais clientes avançam ou travam.</p></div>
                <a className="admin-clarity-link" href="https://clarity.microsoft.com/" target="_blank" rel="noreferrer">Abrir Clarity <span>↗</span></a>
              </div>
            </header>

            <div className="admin-report__toolbar">
              <div><span>Período disponível pela API</span><div className="admin-periods">{[1, 2, 3].map((days) => <button type="button" className={reportDays === days ? 'is-active' : ''} onClick={() => setReportDays(days)} key={days}>{days === 1 ? '24 horas' : days === 2 ? '48 horas' : '72 horas'}</button>)}</div></div>
              <button className="admin-refresh" type="button" onClick={() => void loadReport(reportDays, true)} disabled={reportStatus === 'loading'}>{reportStatus === 'loading' ? 'Atualizando…' : 'Atualizar dados'} ↻</button>
            </div>

            {reportStatus === 'loading' && !report && <div className="admin-report__state"><span className="admin-loading-mark">F</span><strong>Carregando comportamento recente…</strong><p>Consultando os dados agregados do Microsoft Clarity.</p></div>}
            {reportStatus === 'error' && !report && <div className="admin-alert admin-alert--error"><strong>Relatório indisponível.</strong><span>{reportError}</span></div>}

            {report && (
              <>
                {reportStatus === 'error' && <div className="admin-alert admin-alert--error"><strong>Não foi possível atualizar.</strong><span>{reportError} Os últimos dados carregados continuam abaixo.</span></div>}
                <div className="admin-kpis">
                  <article><span>Sessões por página</span><strong>{report.summary.pageSessions.toLocaleString('pt-BR')}</strong><small>atividade acumulada nas URLs</small></article>
                  <article className="is-highlight"><span>Interesse em imóveis</span><strong>{report.summary.propertyIntentRate.toLocaleString('pt-BR')}%</strong><small>{report.summary.propertyIntentSessions.toLocaleString('pt-BR')} sessões em catálogo/detalhes</small></article>
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
                    <header><div><span>Contexto</span><h2>Dispositivos</h2></div></header>
                    <div className="admin-breakdown">{report.devices.map((item) => <div key={item.label}><div><span>{item.label}</span><strong>{item.share.toLocaleString('pt-BR')}%</strong></div><i><b style={{ width: `${Math.min(item.share, 100)}%` }} /></i></div>)}</div>
                  </section>

                  <section className="admin-report-card">
                    <header><div><span>Aquisição</span><h2>Origens de tráfego</h2></div></header>
                    <div className="admin-breakdown">{report.sources.map((item) => <div key={item.label}><div><span>{cleanSourceLabel(item.label)}</span><strong>{item.share.toLocaleString('pt-BR')}%</strong></div><i><b style={{ width: `${Math.min(item.share, 100)}%` }} /></i></div>)}</div>
                  </section>

                  <section className="admin-report-card admin-report-card--conversion">
                    <header><div><span>Conversão</span><h2>Como ler as leads</h2></div></header>
                    <div className="admin-conversion-flow"><div><span>01</span><strong>Visita</strong><small>entrada no site</small></div><i>→</i><div><span>02</span><strong>Interesse</strong><small>/imoveis e detalhes</small></div><i>→</i><div><span>03</span><strong>Contato</strong><small>evento whatsapp_click</small></div></div>
                    <p>{report.notes.customEvents}</p>
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
