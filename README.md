# Ferreira Corretor de Imóveis

Site institucional e catálogo de imóveis da Ferreira Corretor de Imóveis. A aplicação usa React + Vite, é responsiva e mantém o catálogo sincronizado com Google Sheets.

Produção: https://ferreiracorretordeimoveis.vercel.app/

## Rotas

- `/` — página institucional, busca rápida e seleção de imóveis.
- `/imoveis` — catálogo completo com filtros.
- `/imoveis/:codigo` — case exclusivo do imóvel, com galeria, dados, descrição, custos, localização e WhatsApp.
- `/admin` — formulário para cadastrar imóvel, enviar imagem ao Blob e gravar uma nova linha na planilha.
- `/api/properties` — API pública de leitura do catálogo.
- `/api/upload-image` — endpoint de upload de imagens no Vercel Blob.

O catálogo atual possui 16 imóveis ativos. A página inicial mostra uma seleção curta; `/imoveis` mostra todos.

## Stack

- React 19, TypeScript e Vite.
- Vercel Functions para as rotas em `api/`.
- Google Sheets publicado como CSV, fonte de dados do catálogo.
- Google Apps Script para receber cadastros do `/admin`.
- Vercel Blob para armazenar imagens públicas.
- Vitest + Testing Library.

## Rodar localmente

Requer Node.js 20+ e npm.

```bash
npm install
npm run dev
```

Comandos úteis:

```bash
npm run build       # valida TypeScript e gera dist/
npm test            # Vitest em modo watch
npm test -- --run   # testes em execução única
npm run preview     # serve o build de produção localmente
```

## Variáveis de ambiente

Crie `.env.local` a partir de `.env.example`. Esse arquivo nunca deve ser commitado.

```env
VITE_PROPERTIES_SCRIPT_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
VITE_BLOB_UPLOAD_URL=/api/upload-image
GOOGLE_SHEET_CSV_URL=https://docs.google.com/spreadsheets/d/ID/export?format=csv&gid=GID
BLOB_READ_WRITE_TOKEN=token-do-vercel-blob
```

No frontend, apenas variáveis `VITE_*` ficam disponíveis. O token do Blob deve existir somente no ambiente da Vercel e nunca no código, README ou GitHub.

O endpoint possui um fallback para a planilha atualmente configurada, mas `GOOGLE_SHEET_CSV_URL` deve ser configurada na Vercel para tornar a origem explícita.

## Google Sheets

Planilha usada atualmente: https://docs.google.com/spreadsheets/d/1EcXVnUFR6N1IPiMvEPH5-AyGrvWQXR3T517-qmhfgqY/edit

Modelo de colunas: [`docs/google-sheets/ferreira-imoveis-template.csv`](docs/google-sheets/ferreira-imoveis-template.csv).

Campos principais: `Código`, `Título`, `Tipo`, `Finalidade`, `Cidade`, `Bairro`, `Preço`, `Quartos`, `Banheiros`, `Vagas`, `Área`, `Descrição`, `Foto principal`, `Fotos`, `Corretor`, `CRECI`, `WhatsApp`, `Status`, `Destaque`, `Diferenciais`, `Endereço`, `Latitude` e `Longitude`.

Regras:

1. `Código`, `Título` e `Status` são necessários para publicar.
2. Somente linhas com `Status = Ativo` aparecem no site. Use `Oculto` para remover sem apagar.
3. `Foto principal` é a capa; `Fotos` aceita várias URLs públicas separadas por `|`.
4. A ficha `/imoveis/:codigo` exibe todas as URLs válidas de `Fotos` em miniaturas selecionáveis.
5. Preços e áreas podem ser numéricos (`850000`, `180`) ou formatados em pt-BR (`R$ 850.000`).
6. O endpoint usa cache curto da Vercel. Depois de editar a planilha, aguarde aproximadamente um minuto e recarregue.

Detalhes adicionais: [`docs/google-sheets/README.md`](docs/google-sheets/README.md).

## Fluxo do `/admin`

1. A pessoa preenche os dados do imóvel.
2. Ao selecionar uma imagem, o frontend envia o arquivo para `/api/upload-image`.
3. O Blob retorna uma URL pública.
4. O frontend envia os dados e a URL para `VITE_PROPERTIES_SCRIPT_URL`.
5. O Apps Script adiciona a linha no Google Sheets.
6. A API lê a linha ativa e o imóvel aparece no catálogo.

O Apps Script de referência está em [`docs/google-apps-script.gs`](docs/google-apps-script.gs). Publique-o como Web App e coloque a URL de implantação em `VITE_PROPERTIES_SCRIPT_URL`.

Importante: `/admin` não tem autenticação própria. Não trate essa rota como painel privado sem adicionar autenticação ou uma proteção na Vercel.

## Imagens e Blob

`POST /api/upload-image` recebe o arquivo binário e os headers `Content-Type` e `X-Filename`. O arquivo é salvo em `imoveis/` com sufixo aleatório e acesso público. A resposta contém `url` e `pathname`.

Se o token do Blob for rotacionado, atualize `BLOB_READ_WRITE_TOKEN` na Vercel e faça novo deploy. As URLs já salvas na planilha continuam funcionando enquanto os blobs existirem.

## Estrutura

```text
api/                          Funções serverless da Vercel
docs/                         Modelo da planilha, Apps Script e documentação
scripts/                      Importação de dados e upload de imagens
src/components/               Componentes React
src/content/propertiesData.ts Integração do catálogo institucional
src/data/propertyCatalog.ts   Tipos, filtros, API e fallback
src/pages/                    Catálogo e ficha individual do imóvel
src/styles/                   Estilos globais, catálogo e admin
vercel.json                   Rewrite das rotas do SPA
```

## Fluxo de navegação

```text
/imoveis
   ↓ clicar em um card
/imoveis/:codigo
   ↓ selecionar miniaturas / falar no WhatsApp / abrir mapa
← Voltar aos imóveis
```

O código das fichas usa `/imoveis/:codigo`. O roteador ainda aceita `/imovel/:codigo` para compatibilidade com links antigos.

## Deploy

O repositório está conectado à Vercel; push na branch `main` inicia deploy automático.

Antes de publicar:

```bash
npm run build
git diff --check
git status
```

Não crie simultaneamente `api/properties.js` e `api/properties.ts`: a Vercel considera os dois arquivos um conflito para a mesma rota. A implementação atual está em `api/properties.js`.

## Troubleshooting

- Catálogo vazio: confira acesso público de leitura da planilha e `Status = Ativo`.
- Imóvel não abre: confirme o código e use `/imoveis/:codigo`.
- Foto quebrada: confirme que a URL é pública e começa com `https://`.
- Admin não salva: confira `VITE_PROPERTIES_SCRIPT_URL`, o Apps Script publicado e `BLOB_READ_WRITE_TOKEN` na Vercel.
- Dados antigos: use `Ctrl + F5`; a API pode permanecer em cache por aproximadamente um minuto.
- Build com conflito: mantenha apenas um arquivo para cada rota serverless.

## Documentos relacionados

- [`docs/google-sheets/README.md`](docs/google-sheets/README.md) — configuração da planilha.
- [`IMPLEMENTACAO-CATALOGO-GOOGLE-SHEETS.md`](IMPLEMENTACAO-CATALOGO-GOOGLE-SHEETS.md) — integração do catálogo.
- [`IMPLEMENTACAO-ENTRADA.md`](IMPLEMENTACAO-ENTRADA.md) — entrada administrativa.
- [`IMPLEMENTACAO-MOTION.md`](IMPLEMENTACAO-MOTION.md) — animações e transições.
