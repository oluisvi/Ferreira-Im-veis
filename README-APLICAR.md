# Hotfix — Contact roof / telhado da section final

Este patch aplica apenas o refinamento visual pedido para a section `contact`:

- mantém o motivo do telhado;
- move o desenho para mais cima;
- centraliza horizontalmente no viewport;
- reduz a interferência sobre `05 · Vamos conversar`;
- preserva o restante do site.

## Como aplicar

Use este ZIP **por cima do projeto que já está com**:
1. entrada sincronizada, e
2. motion das sections + CTA WhatsApp.

Extraia e substitua os arquivos.

## Arquivos incluídos

- `src/styles/contact-roof-hotfix.css`
- `src/main.tsx`

## Validação recomendada

```bash
npm test
npm run build
```
