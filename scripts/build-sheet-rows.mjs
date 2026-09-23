import { readFile, writeFile } from 'node:fs/promises'

const manifest = JSON.parse(await readFile('image-manifest.json', 'utf8'))
const byId = new Map()
for (const item of manifest) {
  const match = item.file.match(/(?:^|[\\/])(?:\d+[- ]*)?(\d{12,17})(?:[\\/])/)
  if (!match) continue
  const id = match[1]
  if (!byId.has(id)) byId.set(id, [])
  byId.get(id).push(item.url)
}

const listings = [
  ['2216678049174828','Casa de 2 quartos no Jardim do Marquês','Casa','Venda','Jacareí','Jardim do Marquês','',395000,2,1,'','', '', '', 'Imóvel novo em fase de acabamento. 2 dormitórios, sala, cozinha, banheiro, área de serviço, garagem coberta para 2 carros e portão automático.',''],
  ['926992380411508','Apartamento Residencial Santa Rita 2','Apartamento','Venda','Jacareí','','Rua Anésia Ruston, 504',235000,2,1,1,'','','','Lindo apartamento no Residencial Santa Rita 2. Cozinha planejada, sacada, térreo, 1 vaga, churrasqueira, quiosque, quadra e salão de festas.',''],
  ['1610344960899765','Sobrado geminado no Jardim Santa Marina','Sobrado geminado','Venda','Jacareí','Jardim Santa Marina','Avenida Dante Siani',699000,3,3,2,'','','','3 dormitórios, sendo 2 suítes com planejados, cozinha planejada, tetos rebaixados, área de serviço, churrasqueira e portão automático. Aceita financiamento.',''],
  ['1416996740480496','Casa no Parque dos Príncipes','Casa','Venda','Jacareí','Parque dos Príncipes','',379000,2,2,2,'','','','2 dormitórios, sendo 1 suíte, sala, cozinha, banheiro, área de serviço, sacada, garagem coberta para 2 carros e portão automático. Aceita financiamento.',''],
  ['1394452825948710','Sobrado no Parque dos Sinos','Sobrado geminado','Venda','Jacareí','Parque dos Sinos','Avenida Egídio Antônio Coimbra, 314',730000,3,3,3,'','','','3 dormitórios com sacada, sendo 1 suíte, sala para 2 ambientes, cozinha, banheiro, lavabo, área gourmet e garagem coberta para 3 carros.',''],
  ['27822923007388332','Casa no Residencial Bosque das Aroeiras','Casa','Venda','Jacareí','Residencial Bosque das Aroeiras','',385000,2,1,'','','','','2 dormitórios, sala, cozinha, banheiro, área de serviço, churrasqueira, portaria, playground e salão de festas.',''],
  ['971236592139439','Casa no Parque Imperial','Casa','Venda','Jacareí','Parque Imperial','Avenida São Paulo',325000,3,2,3,'','','','3 dormitórios, área gourmet, banheiro, lavabo, garagem coberta para 3 carros e portão automático.',''],
  ['1795097091674717','Apartamento no Jardim Paraíso','Apartamento','Venda','Jacareí','Jardim Paraíso','',259000,2,1,'','','','Lindo apartamento com 2 dormitórios, portaria, academia, salão de festas, churrasqueira e brinquedoteca.',''],
  ['1054882667291601','Casa próxima ao centro de Jacareí','Casa','Venda','Jacareí','Próximo ao centro','','395000',2,1,'','','','2 dormitórios, sala, sacada, despensa, área de serviço, garagem coberta e banheiro.',''],
  ['1603873628075709','Casa usada no Jardim das Indústrias','Casa','Venda','Jacareí','Jardim das Indústrias','',269000,2,1,2,'','','','Casa usada com ótima localização, próxima a mercados, creche, academia e escola. 2 dormitórios, sala, cozinha, copa, banheiro com box e garagem coberta para 2 carros.',''],
  ['2469725573439991','Casa no bairro Urbanova','Casa','Venda','São José dos Campos','Urbanova','Rua Professor Roberval Froes',1999000,3,3,2,'','','','Excelente localização próxima a shopping, escolas, supermercados, farmácias e parques. 3 dormitórios, sendo 2 suítes com planejados, piscina, área gourmet e garagem para 2 ou mais carros.',''],
  ['1968195377193948','Casa nova no Parque dos Príncipes','Casa','Venda','Jacareí','Parque dos Príncipes','',379000,2,2,2,'','','','Imóvel novo com 2 dormitórios, sendo 1 suíte, sala, cozinha americana, banheiro, área de serviço, quintal e 2 vagas de garagem.',''],
  ['27471117105911743','Casa em construção no Jardim Leblon','Casa','Venda','Jacareí','Jardim Leblon','',650000,3,3,3,'','','','Imóvel em construção com 3 dormitórios, sendo 1 suíte, banheiro, lavabo, piscina, garagem coberta para 3 carros e portão automático. Aceita financiamento.',''],
  ['2079446179656144','Casa no Residencial Coleginho','Casa','Venda','Jacareí','Residencial Coleginho','',1298000,3,3,2,'','','','3 dormitórios, sendo 1 suíte, sala, banheiro, lavabo, piscina, churrasqueira, varanda, sacada e ar-condicionado.',''],
]

const rows = listings.map((item, index) => {
  const [facebookId, title, type, purpose, city, neighborhood, address, price, rooms, baths, parking, area, built, land, description] = item
  const photos = byId.get(facebookId) ?? []
  return {
    code: `FB-${facebookId}`,
    title, type, purpose, city, neighborhood, address,
    price: Number(price), rooms, baths, parking, area, built, land, description,
    mainImage: photos[0] ?? '', photos: photos.join(' | '), realtor: 'Ferreira', creci: '133794-F',
    whatsapp: '', status: 'Ativo', featured: index < 3 ? 'Sim' : 'Não', differences: '', palette: '', condo: '', iptu: '', facebookId,
  }
})
await writeFile('sheet-rows.json', JSON.stringify(rows, null, 2), 'utf8')
console.log(JSON.stringify({ rows: rows.length, photos: rows.reduce((n, r) => n + (r.photos ? r.photos.split(' | ').length : 0), 0) }))
