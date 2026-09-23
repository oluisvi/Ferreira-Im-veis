export const BRAND_NAME = 'Ferreira Corretor de Imóveis'
export const CRECI = '133794-F'
export const WHATSAPP_NUMBER = '5512997665886'
export const WHATSAPP_NUMBER_DISPLAY = '(12) 99766-5886'
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`

export const navigation = [
  { label: 'Início', href: '/#inicio' },
  { label: 'Imóveis', href: '/imoveis' },
  { label: 'Sobre', href: '/#sobre' },
  { label: 'Como funciona', href: '/#servicos' },
  { label: 'Contato', href: '/#contato' },
] as const

export const processSteps = [
  ['01', 'Entender', 'A conversa começa pelo que você precisa viver, pelas prioridades e pelo momento da sua busca.'],
  ['02', 'Selecionar', 'A seleção organiza o que realmente faz sentido para você e elimina distrações.'],
  ['03', 'Visitar', 'Cada visita acontece com contexto, atenção aos detalhes e espaço para tirar dúvidas.'],
  ['04', 'Negociar', 'Acompanhamento direto para conduzir proposta, próximos passos e decisão com clareza.'],
] as const

export function buildWhatsAppUrl(message: string) {
  return `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`
}
