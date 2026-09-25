# Catálogo Ferreira Imóveis — Google Sheets

O cliente administra os imóveis em uma planilha. O site lê a planilha pelo endpoint serverless `/api/properties` e **só publica linhas com `Status = Ativo`**.

## 1. Criar a planilha

Importe `ferreira-imoveis-template.csv` no Google Sheets e mantenha o nome da aba como `Imoveis`.

Campos principais:

- `Código`: identificador único, por exemplo `FI-001`.
- `Título`, `Tipo`, `Finalidade`, `Cidade`, `Bairro`, `Preço`.
- `Quartos`, `Banheiros`, `Vagas`, `Área`.
- `Descrição`.
- `Foto principal`: uma URL pública de imagem.
- `Fotos`: várias URLs separadas por ` | `.
- `Vídeo`: URL pública direta de um vídeo `.mp4` ou `.webm`.
- `Corretor`, `CRECI`, `WhatsApp`.
- `Status`: somente `Ativo` entra no site.
- `Destaque`: `Sim` coloca o imóvel na frente da seleção da homepage.
- `Diferenciais`: itens separados por ` | `.
- `Paleta`: opcional, aceita cores hex separadas por ` | ` para a ficha/case do imóvel.
- `Condomínio`, `IPTU`, `Área construída`, `Área terreno`, `Endereço`, `Latitude`, `Longitude`: opcionais.

Para `Preço`, `Condomínio`, `IPTU` e áreas, prefira valor numérico (`850000`, `180`, etc.). O parser também aceita valores formatados em pt-BR.

## 2. Permitir leitura

A planilha precisa estar acessível para leitura pelo endpoint do Google. Use compartilhamento somente de visualização; nunca coloque credenciais de edição no código.

## 3. Configurar no Vercel

Em **Project → Settings → Environment Variables**, adicione:

```text
GOOGLE_SHEET_ID=ID_DA_PLANILHA
GOOGLE_SHEET_NAME=Imoveis
```

O ID é o trecho entre `/d/` e `/edit` na URL da planilha.

Alternativamente, use uma URL CSV completa em `GOOGLE_SHEET_CSV_URL`.

Depois faça um novo deploy.

## 4. Fluxo do cliente

1. Cliente adiciona/edita uma linha.
2. Coloca `Status = Ativo` para publicar.
3. O site atualiza o catálogo automaticamente (cache curto de aproximadamente 1 minuto).
4. `Status = Inativo` remove o imóvel da resposta pública sem apagar a linha.

## Imagens

A URL precisa ser publicamente acessível. Links normais de CDN/Cloudinary/ImageKit funcionam melhor. O endpoint também tenta converter links compartilhados comuns do Google Drive para uma URL direta, mas para uso profissional recomenda-se um serviço de imagens dedicado.
