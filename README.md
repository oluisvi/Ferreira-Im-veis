# Ferreira Corretor de Imóveis

Redesign premium mobile-first da experiência digital da Ferreira Corretor de Imóveis.

## Rodar localmente

```bash
npm install
npm run dev
```

## Validar

```bash
npm test
npm run build
```

## Catálogo com Google Sheets

O projeto preserva a API `/api/properties` e aceita:

- `GOOGLE_SHEET_CSV_URL`, ou
- `GOOGLE_SHEET_ID` + `GOOGLE_SHEET_NAME`.

Sem configuração, a interface usa um catálogo demonstrativo claramente identificado como prévia.
