export const BRAND_NAME = 'Ferreira Corretor de Imóveis'
export const CRECI = '133794-F'
export const WHATSAPP_NUMBER = '5512997665886'
export const WHATSAPP_NUMBER_DISPLAY = '(12) 99766-5886'
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`

export type PropertyCategory = 'Casa' | 'Apartamento' | 'Refúgio'

export type PropertyConcept = {
  id: string
  category: PropertyCategory
  eyebrow: string
  title: string
  description: string
  image: string
  imageAlt: string
  isConcept: true
}

export type PropertyListing = {
  id: string
  category: PropertyCategory
  eyebrow: string
  title: string
  description: string
  image: string
  imageAlt: string
  price?: string
  location?: string
  area?: string
  bedrooms?: string
  bathrooms?: string
  parking?: string
  sourceUrl?: string
  isConcept?: false
}

export type PropertyItem = PropertyConcept | PropertyListing

export const navigation = [
  { label: 'Início', href: '#inicio' },
  { label: 'Imóveis', href: '/imoveis' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Como funciona', href: '/#servicos' },
  { label: 'Contato', href: '#contato' },
] as const

export const propertyConcepts: PropertyConcept[] = [
  {
    id: 'casa-luz',
    category: 'Casa',
    eyebrow: 'Casa · perfil contemporâneo',
    title: 'Luz, silêncio e espaço para viver com calma.',
    description: 'Uma referência visual do tipo de casa que podemos buscar juntos.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
    imageAlt: 'Casa contemporânea iluminada ao entardecer, imagem ilustrativa',
    isConcept: true,
  },
  {
    id: 'apartamento-horizonte',
    category: 'Apartamento',
    eyebrow: 'Apartamento · perfil urbano',
    title: 'A cidade por perto. O horizonte dentro de casa.',
    description: 'Atmosfera ilustrativa para uma busca conectada à sua rotina.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85',
    imageAlt: 'Interior de apartamento elegante com grandes janelas, imagem ilustrativa',
    isConcept: true,
  },
  {
    id: 'refugio-natureza',
    category: 'Refúgio',
    eyebrow: 'Refúgio · perfil natureza',
    title: 'Um endereço onde o tempo muda de ritmo.',
    description: 'Uma direção de busca para quem quer proximidade com a natureza.',
    image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1600&q=85',
    imageAlt: 'Casa de campo cercada por natureza, imagem ilustrativa',
    isConcept: true,
  },
]

export const processSteps = [
  ['01', 'Entender', 'A conversa começa pelo que você precisa viver — não por uma lista de anúncios.'],
  ['02', 'Selecionar', 'Curadoria objetiva para separar possibilidades de distrações.'],
  ['03', 'Visitar', 'Cada visita acontece com contexto, atenção e perguntas certas.'],
  ['04', 'Negociar', 'Acompanhamento pessoal para conduzir a decisão com segurança.'],
] as const

export function buildWhatsAppUrl(message: string) {
  return `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`
}
