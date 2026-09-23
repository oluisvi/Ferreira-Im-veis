import type { VercelRequest, VercelResponse } from '@vercel/node'

const DEFAULT_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1EcXVnUFR6N1IPiMvEPH5-AyGrvWQXR3T517-qmhfgqY/export?format=csv&gid=1830906592'

export default async function handler(_request: VercelRequest, response: VercelResponse) {
  try {
    const source = process.env.PROPERTIES_CSV_URL || DEFAULT_SHEET_CSV_URL
    const upstream = await fetch(source)
    if (!upstream.ok) return response.status(upstream.status).send('Não foi possível ler a planilha.')
    response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    response.setHeader('Content-Type', 'text/csv; charset=utf-8')
    return response.status(200).send(await upstream.text())
  } catch {
    return response.status(502).send('Falha ao consultar a planilha.')
  }
}
