import { describe, expect, it } from 'vitest'
import { parseCsv, rowsToProperties } from './propertiesData'

describe('properties sheet data', () => {
  it('parses quoted csv cells', () => {
    expect(parseCsv('titulo,descricao\n"Casa, centro","Linha 1"')).toEqual([
      ['titulo', 'descricao'],
      ['Casa, centro', 'Linha 1'],
    ])
  })

  it('maps sheet rows into property listings', () => {
    const properties = rowsToProperties([
      'ativo,categoria,titulo,preco,localizacao,area,quartos,banheiros,vagas,descricao,imagem,link',
      'sim,Casa,Casa térrea,R$ 500.000,Taubaté,140 m²,3,2,2,Boa casa,https://example.com/casa.jpg,https://facebook.com/item',
    ].join('\n'))

    expect(properties).toMatchObject([
      {
        category: 'Casa',
        title: 'Casa térrea',
        price: 'R$ 500.000',
        image: 'https://example.com/casa.jpg',
        isConcept: false,
      },
    ])
  })
})
