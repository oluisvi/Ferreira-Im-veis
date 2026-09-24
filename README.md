# Ferreira Corretor de Imóveis

Site institucional e catálogo imobiliário da Ferreira Corretor de Imóveis. A aplicação usa React + Vite, é responsiva e mantém os imóveis sincronizados com Google Sheets.

Produção: https://ferreiracorretordeimoveis.vercel.app/

## Rotas

- `/` — página institucional, busca rápida e seleção de imóveis.
- `/imoveis` — catálogo completo com filtros e cards.
- `/imoveis/:codigo` — ficha exclusiva compatível com links antigos, com galeria, dados, descrição, localização e WhatsApp.
- `/admin` — painel autenticado para cadastro de imóveis e relatório de comportamento do Microsoft Clarity.
- `/api/properties` — API serverless que lê o catálogo.
- `/api/upload-image` — API autenticada de upload para o Vercel Blob.
- `/api/admin-clarity` — relatório agregado do Clarity para o painel administrativo.

O catálogo atual tem 16 imóveis ativos. A home mostra uma seleção reduzida; `/imoveis` mostra todos. No card do catálogo, o botão “Conversar sobre este imóvel” abre diretamente o WhatsApp com o código e o título do imóvel.

## Stack

- React 19, TypeScript e Vite.
- Vercel Functions para as rotas em `api/`.
- Google Sheets publicado como CSV.
- Google Apps Script para receber cadastros do `/admin`.
- Vercel Blob para imagens públicas.
- Vitest + Testing Library.

## Rodar localmente

Requer Node.js 20+ e npm.

```bash
npm install
npm run dev
```

Comandos úteis:

```bash
npm run build       # TypeScript e build de produção
npm test            # Vitest em modo watch
npm test -- --run   # testes em execução única
npm run preview     # prévia do build
```

## Variáveis de ambiente

Crie `.env.local` a partir de `.env.example`. Nunca versione esse arquivo nem tokens.

```env
PROPERTIES_SCRIPT_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
VITE_BLOB_UPLOAD_URL=/api/upload-image
GOOGLE_SHEET_CSV_URL=https://docs.google.com/spreadsheets/d/ID/export?format=csv&gid=GID
BLOB_READ_WRITE_TOKEN=token-do-vercel-blob

VITE_CLARITY_PROJECT_ID=seu-project-id
CLARITY_API_TOKEN=token-data-export

ADMIN_USERNAME=seu-usuario
ADMIN_PASSWORD=sua-senha-forte
ADMIN_SESSION_SECRET=uma-chave-longa-e-aleatoria
```

Somente variáveis `VITE_*` ficam disponíveis no frontend. Credenciais do admin, `CLARITY_API_TOKEN`, `PROPERTIES_SCRIPT_URL` e `BLOB_READ_WRITE_TOKEN` devem existir somente no ambiente da Vercel.

## Google Sheets

Planilha atual: https://docs.google.com/spreadsheets/d/1EcXVnUFR6N1IPiMvEPH5-AyGrvWQXR3T517-qmhfgqY/edit

Modelo: [`docs/google-sheets/ferreira-imoveis-template.csv`](docs/google-sheets/ferreira-imoveis-template.csv).

Campos usados: `Código`, `Título`, `Tipo`, `Finalidade`, `Cidade`, `Bairro`, `Preço`, `Quartos`, `Banheiros`, `Vagas`, `Área`, `Descrição`, `Foto principal`, `Fotos`, `Corretor`, `CRECI`, `WhatsApp`, `Status`, `Destaque`, `Diferenciais`, `Endereço`, `Latitude` e `Longitude`.

Regras:

1. `Código`, `Título` e `Status` são obrigatórios para publicação.
2. Somente `Status = Ativo` aparece no site; use `Oculto` para retirar sem apagar.
3. `Foto principal` é a capa. `Fotos` aceita URLs públicas separadas por `|`.
4. A ficha do imóvel mostra todas as URLs válidas de `Fotos` em miniaturas selecionáveis.
5. Preços e áreas aceitam números ou formatos pt-BR, como `850000` e `R$ 850.000`.
6. A API usa cache curto; depois de editar a planilha, aguarde aproximadamente um minuto e recarregue.

Detalhes: [`docs/google-sheets/README.md`](docs/google-sheets/README.md).

## Como adicionar um imóvel pelo `/admin`

1. Abra `/admin`.
2. Preencha status, categoria, título, preço, localização, área, quartos, banheiros, vagas e descrição.
3. Selecione a imagem principal. Ela será enviada automaticamente para `/api/upload-image` e armazenada no Vercel Blob.
4. Confira ou informe o link do anúncio original.
5. Clique em “Adicionar na planilha”.
6. O Google Apps Script adiciona uma nova linha no Sheets com a URL pública da imagem.
7. Com `Status = Ativo`, o imóvel aparece no catálogo depois da atualização do cache.

O fluxo é:

```text
/admin → /api/upload-image → Vercel Blob
      └→ Google Apps Script → Google Sheets → /api/properties → catálogo
```

O Apps Script de referência está em [`docs/google-apps-script.gs`](docs/google-apps-script.gs). Publique-o como Web App e coloque sua URL em `PROPERTIES_SCRIPT_URL`. O navegador envia o cadastro para `/api/admin-property`, que valida a sessão antes de encaminhar os dados ao Apps Script.

O `/admin` usa usuário e senha definidos em `ADMIN_USERNAME` e `ADMIN_PASSWORD`. A sessão é mantida em cookie `HttpOnly` assinado; `ADMIN_SESSION_SECRET` é recomendado em produção. Uploads e cadastro de imóveis também exigem a sessão válida.

## Relatório do Microsoft Clarity

A aba **Relatório** do `/admin` lê a Data Export API do Clarity por `/api/admin-clarity`. Configure `VITE_CLARITY_PROJECT_ID` para o rastreamento público e `CLARITY_API_TOKEN` somente no servidor. O relatório resume as últimas 24, 48 ou 72 horas por URL, dispositivo e origem, com scroll, engajamento e sinais como dead clicks, rage clicks, quickbacks e scroll excessivo.

O indicador **Interesse em imóveis** é um proxy de intenção baseado em visitas ao catálogo e páginas de imóvel. Cliques para WhatsApp continuam sendo enviados ao Clarity como o evento `whatsapp_click`; a contagem e as gravações desses eventos devem ser revisadas no próprio painel do Clarity. A API oficial de exportação é limitada a 10 chamadas por projeto por dia, por isso o endpoint usa cache curto.

O próprio `/admin` não inicializa Clarity nem Vercel Analytics, evitando que acessos administrativos contaminem os dados dos visitantes. O navegador também mantém o último relatório por 15 minutos para reduzir consultas repetidas à API.

## Imagens e Blob

`POST /api/upload-image` recebe o arquivo binário e os headers `Content-Type` e `X-Filename`. O arquivo é salvo em `imoveis/` com sufixo aleatório e acesso público; a resposta contém `url` e `pathname`.

Se o token for rotacionado, atualize `BLOB_READ_WRITE_TOKEN` na Vercel e faça novo deploy. As URLs já registradas na planilha continuam funcionando enquanto os blobs existirem.

## Estrutura

```text
api/                          Funções serverless
docs/                         Planilha, Apps Script e documentação
scripts/                      Importação e upload de imagens
src/components/               Componentes React
src/content/propertiesData.ts Integração de conteúdo
src/data/propertyCatalog.ts   Tipos, filtros, API e fallback
src/pages/                    Catálogo e fichas de imóveis
src/styles/                   Estilos globais, catálogo e admin
vercel.json                   Rewrite das rotas do SPA
```

## Navegação do catálogo

```text
/imoveis
   ↓ botão “Conversar sobre este imóvel”
WhatsApp com mensagem preenchida
```

As informações principais ficam no card. A rota `/imoveis/:codigo` continua disponível para consulta detalhada e galeria completa, mas o CTA principal do catálogo é a conversa direta pelo WhatsApp.

## Deploy e manutenção

O repositório está conectado à Vercel; push na branch `main` inicia deploy automático.

Antes de publicar:

```bash
npm run build
git diff --check
git status
```

Não crie simultaneamente `api/properties.js` e `api/properties.ts`: isso gera conflito de rota na Vercel. A implementação atual está em `api/properties.js`.

## Troubleshooting

- Catálogo vazio: confira a leitura pública da planilha e `Status = Ativo`.
- Imagem quebrada: confirme que a URL é pública e começa com `https://`.
- Admin não entra: confira `ADMIN_USERNAME`, `ADMIN_PASSWORD` e, se usado, `ADMIN_SESSION_SECRET`.
- Admin não salva: confira `PROPERTIES_SCRIPT_URL`, o Apps Script publicado e `BLOB_READ_WRITE_TOKEN` na Vercel.
- Relatório indisponível: confira `CLARITY_API_TOKEN` e o limite diário da Data Export API.
- Dados antigos: use `Ctrl + F5`; a API pode permanecer em cache por aproximadamente um minuto.
- Build com conflito: mantenha um único arquivo para cada rota serverless.

## Documentos relacionados

- [`docs/google-sheets/README.md`](docs/google-sheets/README.md) — configuração da planilha.
- [`IMPLEMENTACAO-CATALOGO-GOOGLE-SHEETS.md`](IMPLEMENTACAO-CATALOGO-GOOGLE-SHEETS.md) — integração do catálogo.
- [`IMPLEMENTACAO-ENTRADA.md`](IMPLEMENTACAO-ENTRADA.md) — entrada administrativa.
- [`IMPLEMENTACAO-MOTION.md`](IMPLEMENTACAO-MOTION.md) — animações e transições.

## Login do admin em desenvolvimento local

Ao executar `npm run dev`, o Vite também atende as rotas locais `/api/admin-*`, `/api/properties` e `/api/upload-image`. Isso permite testar `/admin` em `http://localhost:5173/admin` sem precisar executar `vercel dev`.

As credenciais padrão incluídas no `.env` são:

- usuário: `admin`
- senha: `123456`

Troque essas credenciais e defina `ADMIN_SESSION_SECRET` antes de publicar o site em produção.
