# Implementação — Catálogo Google Sheets

Este patch adiciona ao projeto atual:

- Google Sheets como fonte de imóveis;
- função Vercel `/api/properties` como camada segura de leitura;
- somente `Status = Ativo` é publicado;
- fallback local para desenvolvimento/apresentação;
- rota `/imoveis` com busca e filtros;
- rota `/imovel/FI-001` com ficha completa;
- galeria, preço, metragem, quartos, banheiros, vagas, diferenciais, custos, localização e paleta opcional;
- CTA de WhatsApp por imóvel com código na mensagem;
- CTA fixo mobile na página de detalhe;
- rewrites do Vercel para deep links;
- template CSV pronto para importar no Google Sheets;
- sem banco SQL e sem credenciais Google no navegador.

## Aplicação

Extraia este ZIP por cima do repositório atual da Ferreira Imóveis.

Depois configure `GOOGLE_SHEET_ID` e `GOOGLE_SHEET_NAME` no Vercel conforme `docs/google-sheets/README.md`.

## Validação

```bash
npm test
npm run build
```

Sem a variável do Google Sheets o site continua funcional usando os 3 imóveis demonstrativos locais.
