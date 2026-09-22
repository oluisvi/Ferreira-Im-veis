export const CRECI = '133794-F'
export const WHATSAPP_NUMBER = '5512997665886'
export const WHATSAPP_NUMBER_DISPLAY = '(12) 99766-5886'
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`

export const navigation = [
  { label: 'Início', href: '/#inicio' },
  { label: 'Imóveis', href: '/imoveis' },
  { label: 'Sobre', href: '/#sobre' },
  { label: 'Contato', href: '/#contato' },
] as const

export const processSteps = [
  ['01', 'Entender', 'A conversa começa pelo que você precisa viver — não por uma lista de anúncios.'],
  ['02', 'Selecionar', 'Curadoria objetiva para separar possibilidades de distrações.'],
  ['03', 'Visitar', 'Cada visita acontece com contexto, atenção e perguntas certas.'],
  ['04', 'Negociar', 'Acompanhamento pessoal para conduzir a decisão com segurança.'],
] as const

export function buildWhatsAppUrl(message: string) {
  return `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`
}
