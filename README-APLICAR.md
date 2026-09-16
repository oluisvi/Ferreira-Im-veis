# Ferreira Imóveis — Motion de Sections + CTA WhatsApp

Patch incremental sobre a versão com entrada temática sincronizada.

## O que este patch NÃO altera

- IntroPortal / cena do telhado.
- Hero / primeira section.
- Sincronização do carregamento implementada anteriormente.
- Conteúdo, identidade, paleta ou estrutura geral.

## O que foi adicionado

### Motion a partir da section 02

- `02 · Possibilidades`: heading, filtro e cards entram em sequência editorial.
- Cards usam stagger leve e imagem estabilizando de um scale discreto.
- `03 · Atendimento pessoal`: retrato entra lateralmente e copy sobe em cadência.
- `04 · A jornada`: título e linhas surgem progressivamente.
- `05 · Vamos conversar`: telhado decorativo e conteúdo entram com escala/rise controlado.
- `prefers-reduced-motion` mantém tudo direto e sem coreografia.
- Sem Motion/GSAP: apenas IntersectionObserver + CSS.

### WhatsApp mais visível

- Novo CTA persistente no canto inferior após sair do hero.
- O CTA não aparece por cima da primeira section.
- Some automaticamente quando a section final de contato entra no viewport.
- Mobile recebe versão horizontal adaptada à safe area.
- Botão final de WhatsApp ganha mais contraste, presença e microinteração.

## Como aplicar

Extraia esta pasta por cima da raiz do projeto atual e permita substituir os arquivos existentes.

Arquivos modificados/adicionados:

- `src/App.tsx`
- `src/components/ScrollMotion.tsx` (novo)
- `src/components/FloatingWhatsApp.tsx` (novo)
- `src/components/PropertyDiscovery.tsx`
- `src/components/PropertyCard.tsx`
- `src/components/About.tsx`
- `src/components/Process.tsx`
- `src/components/Contact.tsx`
- `src/styles/motion.css`

## Validação recomendada

```bash
npm test
npm run build
npm run dev
```

No navegador, valide:

1. Intro e hero continuam exatamente como antes.
2. Scroll até `Imóveis`: motion começa somente ali.
3. CTA fixo de WhatsApp surge depois que o hero sai da tela.
4. CTA fixo some ao entrar em `Vamos conversar`.
5. Filtros de imóveis continuam funcionando.
6. Hover dos cards e linhas da jornada continuam funcionando após os reveals.
7. Mobile mantém CTA acessível sem cobrir conteúdo importante.
8. Com `prefers-reduced-motion: reduce`, os conteúdos aparecem sem coreografia.
