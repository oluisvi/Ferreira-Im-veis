import { ChangeEvent, FormEvent, useState } from 'react'

const SCRIPT_URL = import.meta.env.VITE_PROPERTIES_SCRIPT_URL as string | undefined
const BLOB_UPLOAD_URL = import.meta.env.VITE_BLOB_UPLOAD_URL || '/api/upload-image'

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

export function Admin() {
  const [values, setValues] = useState(initialValues)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!SCRIPT_URL) {
      setStatus('error')
      return
    }

    setStatus('saving')
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
        if (!upload.ok) throw new Error('Falha ao enviar a imagem')
        imageUrl = (await upload.json()).url
      }
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ ...values, imagem: imageUrl, id: crypto.randomUUID() }),
      })
      setValues(initialValues)
      setImageFile(null)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    setImageFile(event.target.files?.[0] ?? null)
  }

  function update(name: keyof typeof initialValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }))
  }

  return (
    <main className="admin-page">
      <section className="admin-shell">
        <header className="admin-header">
          <span>Ferreira Imóveis</span>
          <h1>Cadastro de imóveis</h1>
          <p>Preencha os campos abaixo para adicionar uma linha na planilha que alimenta o site.</p>
        </header>

        <form className="admin-form" onSubmit={handleSubmit}>
          <label>
            Status
            <select value={values.ativo} onChange={(event) => update('ativo', event.target.value)}>
              <option value="sim">Ativo no site</option>
              <option value="não">Oculto</option>
            </select>
          </label>
          <label>
            Categoria
            <select value={values.categoria} onChange={(event) => update('categoria', event.target.value)}>
              <option>Casa</option>
              <option>Apartamento</option>
              <option>Refúgio</option>
            </select>
          </label>
          <label>
            Título
            <input value={values.titulo} onChange={(event) => update('titulo', event.target.value)} required />
          </label>
          <label>
            Preço
            <input value={values.preco} onChange={(event) => update('preco', event.target.value)} placeholder="R$ 650.000" />
          </label>
          <label>
            Localização
            <input value={values.localizacao} onChange={(event) => update('localizacao', event.target.value)} />
          </label>
          <label>
            Área
            <input value={values.area} onChange={(event) => update('area', event.target.value)} placeholder="120 m²" />
          </label>
          <label>
            Quartos
            <input value={values.quartos} onChange={(event) => update('quartos', event.target.value)} />
          </label>
          <label>
            Banheiros
            <input value={values.banheiros} onChange={(event) => update('banheiros', event.target.value)} />
          </label>
          <label>
            Vagas
            <input value={values.vagas} onChange={(event) => update('vagas', event.target.value)} />
          </label>
          <label className="admin-form__wide">
            Descrição
            <textarea value={values.descricao} onChange={(event) => update('descricao', event.target.value)} rows={5} />
          </label>
          <label className="admin-form__wide">
            Imagem principal
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
            <small>{imageFile ? `Arquivo selecionado: ${imageFile.name}` : 'A imagem será enviada automaticamente ao Blob.'}</small>
          </label>
          <label className="admin-form__wide">
            Link da imagem (opcional)
            <input value={values.imagem} onChange={(event) => update('imagem', event.target.value)} />
          </label>
          <label className="admin-form__wide">
            Link do anúncio original
            <input value={values.link} onChange={(event) => update('link', event.target.value)} />
          </label>
          <button type="submit" disabled={status === 'saving'}>
            {status === 'saving' ? 'Salvando...' : 'Adicionar na planilha'}
          </button>
          <output>
            {status === 'success' && 'Imóvel enviado para a planilha.'}
            {status === 'error' && 'Configure VITE_PROPERTIES_SCRIPT_URL para salvar na planilha.'}
          </output>
        </form>
      </section>
    </main>
  )
}
