# Ferreira Imóveis Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir uma vitrine editorial imobiliária responsiva, diferenciada e pronta para receber dados reais do corretor Ferreira.

**Architecture:** SPA estática em React e TypeScript, empacotada pelo Vite 8, com conteúdo centralizado em dados tipados e componentes por cena. A experiência usa CSS responsivo, IntersectionObserver e progressive enhancement; não há backend, catálogo real ou dependência de animação pesada no MVP.

**Tech Stack:** React, TypeScript, Vite 8, CSS nativo, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-15-ferreira-imoveis-site-design.md`

## Global Constraints

- Português-BR, mobile-first e página única.
- WhatsApp confirmado: `5512997665886`; CTA: `https://wa.me/5512997665886`.
- CRECI confirmado: `133794-F`.
- Não inventar cidade, preços, endereços, métricas, depoimentos ou ofertas comerciais reais.
- Cards e busca devem informar claramente que são demonstrações visuais.
- Preto, off-white e vermelho como acento; identidade por tipografia, fotografia, composição e linhas arquitetônicas.
- Respeitar `prefers-reduced-motion`, teclado, foco visível, contraste e HTML semântico.
- Nenhum 3D ou biblioteca de componentes no MVP.

---

### Task 1: Base do projeto e contrato de conteúdo

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/vite-env.d.ts`
- Create: `src/content/siteContent.ts`
- Create: `src/content/siteContent.test.ts`
- Create: `public/ferreira-imoveis.jpg`

**Interfaces:**
- Consumes: logo em `C:\Users\Home\Downloads\ferreira imoveis.jpg`.
- Produces: `siteContent`, `PropertyConcept`, `WHATSAPP_URL` e `WHATSAPP_NUMBER_DISPLAY`.

- [ ] **Step 1: criar configuração React/TypeScript/Vite 8 com scripts `dev`, `build`, `test` e `preview` e dependências mínimas.**
- [ ] **Step 2: escrever teste que exige `WHATSAPP_URL === "https://wa.me/5512997665886"`, CRECI `133794-F` e todos os imóveis com `isConcept: true`.**
- [ ] **Step 3: executar `npm.cmd test -- --run` e confirmar falha por conteúdo ausente.**
- [ ] **Step 4: implementar `siteContent.ts` com navegação, copy provisória, processo e três conceitos tipados sem preço/endereço.**
- [ ] **Step 5: copiar a logo original para `public/ferreira-imoveis.jpg` e executar `npm.cmd test -- --run`.**
- [ ] **Step 6: executar `npm.cmd run build` e confirmar saída em `dist/`.**

### Task 2: Fundação visual e shell acessível

**Files:**
- Create: `src/App.tsx`
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Create: `src/components/Header.tsx`
- Create: `src/components/BrandMark.tsx`
- Create: `src/components/Header.test.tsx`

**Interfaces:**
- Consumes: `siteContent.navigation`, logo e CRECI da Task 1.
- Produces: shell com `Header`, skip-link, `main#conteudo` e navegação responsiva.

- [ ] **Step 1: escrever teste que exige skip-link, nome acessível da navegação, CRECI e link para `#contato`.**
- [ ] **Step 2: executar o teste e confirmar falha por componentes ausentes.**
- [ ] **Step 3: definir tokens de cor, tipografia fluida, grid, raios, sombras, espaçamento e motion em `tokens.css`.**
- [ ] **Step 4: implementar `BrandMark` com recorte controlado da logo JPG e fallback textual.**
- [ ] **Step 5: implementar header semântico com menu mobile em botão, `aria-expanded`, Escape e fechamento após seleção.**
- [ ] **Step 6: executar testes e validar foco visível e navegação por teclado.**

### Task 3: Hero editorial e assinatura arquitetônica

**Files:**
- Create: `src/components/Hero.tsx`
- Create: `src/components/ArchitecturalFrame.tsx`
- Create: `src/components/Hero.test.tsx`
- Create: `src/styles/hero.css`

**Interfaces:**
- Consumes: `WHATSAPP_URL` e copy da Task 1.
- Produces: `Hero` com headline, CTA real, CTA secundário e moldura arquitetônica decorativa.

- [ ] **Step 1: escrever teste que exige um único `h1`, link de WhatsApp com URL confirmada e link para `#imoveis`.**
- [ ] **Step 2: executar o teste e confirmar falha.**
- [ ] **Step 3: implementar composição assimétrica com headline “Espaços para a próxima parte da sua história”, imagem atmosférica identificada como ilustrativa e bloco CRECI.**
- [ ] **Step 4: implementar `ArchitecturalFrame` como SVG/CSS decorativo inspirado no telhado da marca, com `aria-hidden="true"`.**
- [ ] **Step 5: adicionar entrada progressiva via classe `.is-ready`, mantendo conteúdo visível sem JavaScript e desativando transformação em `prefers-reduced-motion`.**
- [ ] **Step 6: executar testes.**

### Task 4: Descoberta e vitrine demonstrativa

**Files:**
- Create: `src/components/PropertyDiscovery.tsx`
- Create: `src/components/PropertyCard.tsx`
- Create: `src/components/PropertyDiscovery.test.tsx`
- Create: `src/styles/properties.css`

**Interfaces:**
- Consumes: `PropertyConcept[]` e categorias da Task 1.
- Produces: filtros locais acessíveis e cards conceituais explicitamente demonstrativos.

- [ ] **Step 1: escrever testes para filtrar conceitos por categoria, restaurar “Todos” e exibir “Conceito visual — conteúdo demonstrativo” em cada card.**
- [ ] **Step 2: executar testes e confirmar falha.**
- [ ] **Step 3: implementar filtros com botões pressionáveis, contador textual e atualização local sem simular consulta remota.**
- [ ] **Step 4: implementar cards editoriais com imagem ilustrativa, categoria, cenário e CTA “Conversar sobre este perfil” apontando para WhatsApp.**
- [ ] **Step 5: criar alternância de ritmo visual entre cards, evitando grade uniforme genérica.**
- [ ] **Step 6: executar testes.**

### Task 5: Confiança, processo e conversão

**Files:**
- Create: `src/components/About.tsx`
- Create: `src/components/Process.tsx`
- Create: `src/components/Contact.tsx`
- Create: `src/components/Footer.tsx`
- Create: `src/components/Contact.test.tsx`
- Create: `src/styles/content.css`

**Interfaces:**
- Consumes: WhatsApp, CRECI e conteúdo da Task 1.
- Produces: seções `#sobre`, processo, `#contato`, CTA final e rodapé.

- [ ] **Step 1: escrever teste que exige CRECI, quatro etapas do processo e link de contato com o WhatsApp correto.**
- [ ] **Step 2: executar teste e confirmar falha.**
- [ ] **Step 3: implementar apresentação honesta sem tempo de mercado, cidade ou diferenciais não confirmados.**
- [ ] **Step 4: implementar processo “Entender → Selecionar → Visitar → Negociar” com linguagem consultiva.**
- [ ] **Step 5: implementar painel de contato com mensagem pré-preenchida usando `encodeURIComponent`, sem formulário falso.**
- [ ] **Step 6: implementar rodapé e executar testes.**

### Task 6: Motion progressivo e responsividade

**Files:**
- Create: `src/hooks/useReveal.ts`
- Create: `src/hooks/useReveal.test.tsx`
- Create: `src/components/SectionIntro.tsx`
- Create: `src/styles/motion.css`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: seções das Tasks 3–5.
- Produces: `useReveal<T extends HTMLElement>()` e linguagem de reveal reutilizável.

- [ ] **Step 1: escrever teste com mock de `IntersectionObserver` comprovando aplicação de `.is-visible`.**
- [ ] **Step 2: executar teste e confirmar falha.**
- [ ] **Step 3: implementar hook com fallback imediato quando `IntersectionObserver` não existir.**
- [ ] **Step 4: aplicar reveals apenas a introduções e imagens, mantendo CTAs e texto essencial imediatamente disponíveis.**
- [ ] **Step 5: criar breakpoints por comportamento, reordenando hero, cards e contato no mobile em vez de apenas reduzir tamanhos.**
- [ ] **Step 6: executar testes e build.**

### Task 7: QA visual, funcional e de acessibilidade

**Files:**
- Modify: arquivos afetados pelos achados, sem ampliar escopo.

**Interfaces:**
- Consumes: aplicação completa.
- Produces: build verificado e experiência aprovada em desktop/mobile.

- [ ] **Step 1: executar `npm.cmd test -- --run` e corrigir somente falhas relacionadas.**
- [ ] **Step 2: executar `npm.cmd run build` e eliminar erros e avisos acionáveis.**
- [ ] **Step 3: abrir o site em navegador e verificar 1440×900, 768×1024 e 390×844.**
- [ ] **Step 4: testar menu, âncoras, filtros, links de WhatsApp e ausência de overflow horizontal.**
- [ ] **Step 5: testar teclado, foco, landmarks, textos alternativos e modo de movimento reduzido.**
- [ ] **Step 6: revisar todo texto visível para garantir que exemplos não pareçam imóveis reais.**
- [ ] **Step 7: realizar refinamento visual final mantendo direção aprovada e então repetir testes e build.**
