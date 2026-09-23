# FERREIRA CORRETOR DE IMÓVEIS
## Redesign Premium Mobile-First baseado no layout de referência

Trabalhe no repositório atualmente aberto da **Ferreira Corretor de Imóveis**.

Repositório de referência:
`https://github.com/oluisvi/Ferreira-Im-veis`

Deploy atual:
`https://ferreira-imoveis.vercel.app/`

Este projeto já existe, já possui catálogo, páginas de imóvel, animações, transições e uma entrada temática. **Não reinicie o projeto. Não troque a stack. Não descarte sistemas que funcionam. Faça um redesign incremental e integrado.**

A imagem de referência fornecida pelo usuário deve ser tratada como **direção de layout, hierarquia, composição, densidade e linguagem imobiliária premium**, não como template para cópia literal.

---

# 1. NOME DA MARCA

Regra obrigatória:

**FERREIRA CORRETOR DE IMÓVEIS**

Não tratar a marca apenas como “Ferreira Imóveis” em pontos institucionais importantes.

Atualizar onde fizer sentido:

- logo tipográfico / BrandMark;
- `aria-label`;
- títulos de página;
- metadados;
- rodapé;
- catálogo;
- página individual de imóvel;
- textos institucionais.

Pode usar “Ferreira” de forma curta em microcopy e CTA quando o contexto já deixar a marca clara, mas a identidade principal precisa dizer **Ferreira Corretor de Imóveis**.

---

# 2. OBJETIVO DO REDESIGN

Transformar o case atual em uma experiência real de negócio, com prioridade em:

**confiança + clareza + desejo + descoberta de imóveis + contato pelo WhatsApp + conversão**

A experiência deve parecer uma imobiliária/corretor premium, contemporânea, próxima e confiável.

O site precisa ficar muito mais próximo da composição da referência:

- header claro e elegante;
- hero fotográfico de alto impacto;
- headline de leitura imediata;
- busca de imóveis acima da dobra;
- bloco de confiança logo após o hero;
- cards de imóveis mais comerciais e escaneáveis;
- seção institucional dividida entre imagem e texto;
- CTA escuro de WhatsApp;
- rodapé forte;
- muito espaço em branco;
- dourado/bronze usado com disciplina;
- preto/carvão para contraste;
- branco marfim quente como fundo principal.

Não copie textos, métricas ou conteúdos fictícios da imagem de referência.

---

# 3. O QUE DEVE SER PRESERVADO

O redesign deve preservar e reaproveitar o que já funciona no projeto:

### Entrada temática

Manter `IntroPortal` e a ideia do telhado/limiar arquitetônico.

Preservar:

- execução apenas na primeira visita da sessão;
- espera pelo conteúdo crítico;
- timeout seguro;
- sincronização com o hero;
- `prefers-reduced-motion`;
- sem bloquear a aplicação indefinidamente.

Pode adaptar cores e pequenos detalhes visuais para a nova paleta, mas não transformar em loader genérico.

### Molduras e linguagem arquitetônica

Manter o motivo visual do telhado, linhas arquitetônicas e molduras do projeto.

O `ArchitecturalFrame` deve continuar existindo como elemento autoral, porém de forma mais refinada e integrada ao novo hero.

### Motion

Manter `ScrollMotion`, `data-reveal`, hover refinado, microinterações e transições existentes.

Refinar timing e aparência quando necessário, mas não remover a personalidade do site.

### Catálogo

Preservar:

- `/imoveis`;
- `/imovel/:codigo`;
- Google Sheets / fallback atual;
- filtros;
- dados dos imóveis;
- WhatsApp por imóvel;
- galeria;
- informações técnicas;
- mapa;
- responsividade;
- estados vazios e loading.

### Conversão

Preservar e melhorar o `FloatingWhatsApp`.

---

# 4. DIREÇÃO VISUAL

## Paleta

Criar tokens semânticos e manter compatibilidade com o CSS atual.

Sugestão de direção:

```css
--color-canvas: #f6f3ec;
--color-surface: #fffdf9;
--color-surface-soft: #ece6da;
--color-ink: #141310;
--color-text-secondary: #746e64;
--color-accent: #aa884c;
--color-accent-strong: #8f6e36;
--color-line: rgba(20, 19, 16, 0.12);
--color-inverse: #11110f;
```

Se o projeto continuar usando `--red`, transforme-o temporariamente em alias do novo accent para evitar refactor desnecessário.

Não usar vermelho como cor principal do redesign.

## Tipografia

Manter a combinação existente:

- **DM Sans** para UI, navegação, corpo e cards;
- **Instrument Serif** para ênfases editoriais, frases especiais e momentos premium.

Não exagerar no serif.

Headline principal precisa ser forte, compacta e muito legível no mobile.

## Geometria

Usar:

- cards com radius moderado;
- botões sólidos e elegantes;
- superfícies claras;
- sombras suaves;
- linhas finas;
- detalhes arquitetônicos;
- recortes apenas quando reforçarem a identidade.

Não transformar tudo em cards gigantes arredondados.

---

# 5. MOBILE FIRST É REGRA

Comece a implementação pensando em:

- 360px;
- 390px;
- 430px.

Depois escale para tablet, laptop e desktop.

Mobile não deve ser uma versão encolhida do desktop.

No mobile:

- hero com headline curta e legível;
- busca imediatamente acessível;
- CTA principal visível sem rolar muito;
- formulário em uma coluna;
- cards de imóveis em scroll horizontal com `scroll-snap` ou uma composição vertical muito eficiente;
- toque com áreas confortáveis;
- menu simples;
- sem dependência de hover;
- WhatsApp persistente sem cobrir conteúdo;
- imagens recortadas especificamente para telas verticais;
- motion reduzido em dispositivos mais fracos quando necessário.

---

# 6. NOVA HOME

A home deve seguir esta sequência.

## Header

Transformar a home em um header claro/premium semelhante ao layout de referência.

O header deve conter:

- BrandMark;
- Início;
- Imóveis;
- Sobre;
- Como funciona / Serviços;
- Contato;
- CTA “Falar no WhatsApp”.

No mobile, manter menu compacto e acessível.

O CTA de WhatsApp precisa ficar visualmente separado da navegação.

## Hero

Criar um hero imobiliário forte e fotográfico.

Sugestão de copy:

**Eyebrow**
`SEU PRÓXIMO ENDEREÇO COMEÇA AQUI`

**H1**
`Encontre o imóvel ideal para a sua próxima fase.`

Pode enfatizar `imóvel ideal` ou `próxima fase` com o accent/Instrument Serif.

**Lead**
`Explore oportunidades selecionadas e conte com atendimento direto para encontrar o que realmente combina com você.`

Adicionar uma pequena mensagem visual no lado oposto em desktop:

`Mais que anúncios. Decisões acompanhadas de perto.`

Manter a moldura arquitetônica/telhado como assinatura visual.

A fotografia deve continuar sendo protagonista.

## Busca rápida no hero

A busca deve ficar dentro ou levemente sobreposta ao final do hero, inspirada na referência.

Criar:

- finalidade;
- tipo;
- cidade;
- bairro;
- faixa de preço;
- botão “Buscar imóveis”.

Pode existir um controle rápido “Comprar / Alugar” se isso mapear para os valores reais do catálogo.

Ao enviar, navegar para `/imoveis` usando query params.

Exemplo:

```text
/imoveis?purpose=Venda&type=Casa&city=Jacareí&maxPrice=900000
```

A página `/imoveis` deve ler os parâmetros e inicializar seus filtros com eles.

Não criar filtros que não tenham função.

## Trust strip

Logo após o hero, criar quatro pilares compactos.

Usar conteúdo verificável e sem métricas inventadas:

- Imóveis selecionados
- Atendimento direto
- Busca orientada
- Negociação acompanhada

A intenção é transmitir confiança rapidamente.

## Imóveis em destaque

Redesenhar `PropertyDiscovery`.

Título:

`Imóveis em destaque`

Subtexto curto e CTA:

`Ver todos os imóveis`

Cards mais próximos do mercado imobiliário premium:

- imagem ampla;
- badge finalidade;
- título;
- localização;
- características principais;
- preço;
- CTA de detalhes;
- acesso ao WhatsApp.

No mobile, priorizar scroll lateral com `scroll-snap` se ficar mais confortável.

Não usar stagger exagerado no novo grid.

Se a fonte ainda for fallback/demo, manter uma comunicação honesta e discreta informando que o catálogo oficial ainda será conectado.

Nunca apresentar imóveis demonstrativos como se fossem imóveis reais.

## Sobre

Criar seção split image + copy inspirada na referência.

Não usar métricas inventadas como “+500 imóveis” ou “10 anos” sem dados reais.

Sugestão:

**Kicker**
`SOBRE A FERREIRA CORRETOR DE IMÓVEIS`

**Título**
`Atendimento próximo para decisões que pedem confiança.`

**Texto**
`Cada busca começa entendendo o momento, as prioridades e o que realmente faz sentido para você. A partir disso, a seleção fica mais objetiva e a negociação mais clara.`

Provas possíveis:

- `CRECI 133794-F` / Registro profissional
- `Atendimento direto` / Conversa com o corretor
- `Curadoria pessoal` / Busca guiada pelo seu perfil

Usar uma imagem residencial de ambientação enquanto não houver fotografia institucional real.

Se usar imagem de ambientação, não apresentar como foto do corretor.

## Como funciona / Serviços

Preservar o `Process`, mas atualizar a estética.

Manter a jornada:

`Entender -> Selecionar -> Visitar -> Negociar`

No desktop pode virar quatro blocos horizontais.

No mobile deve ser uma sequência clara e confortável.

Adicionar `id="servicos"` ou equivalente para navegação.

## CTA principal

Redesenhar a seção de contato como uma faixa escura premium, próxima do layout de referência.

Título:

`Quer ajuda para encontrar o imóvel certo?`

Texto:

`Conte o que você procura e continue a conversa diretamente pelo WhatsApp.`

CTA:

`Falar no WhatsApp`

Adicionar microprovas curtas:

- atendimento direto;
- conversa sem compromisso;
- busca personalizada.

Manter o telhado/moldura de fundo como elemento gráfico de baixa opacidade.

## Footer

Rodapé escuro e mais completo.

Exibir:

- marca completa;
- CRECI;
- links;
- WhatsApp;
- navegação principal;
- direitos autorais.

Não inventar e-mail, endereço ou redes sociais que não existam no projeto.

---

# 7. CATÁLOGO `/imoveis`

Redesenhar para a mesma identidade da home.

A página atual funciona e deve ser preservada funcionalmente.

Melhorar:

- header;
- título;
- densidade;
- filtros;
- cards;
- estados;
- responsividade;
- ritmo visual;
- CTA.

Os filtros precisam ser excelentes no mobile.

Não criar uma grade de inputs pequena demais.

No mobile, considerar uma composição em blocos ou uma área expansível, desde que continue simples e acessível.

Inicializar os filtros pelos query params vindos do hero.

Manter a contagem de resultados.

No estado vazio, além de “limpar filtros”, oferecer CTA para WhatsApp com uma mensagem que reflita a busca atual quando for simples fazê-lo.

---

# 8. PÁGINA DO IMÓVEL `/imovel/:codigo`

Esta área é importante e deve continuar existindo.

Preservar:

- galeria;
- thumbnails;
- preço;
- área;
- quartos;
- banheiros;
- vagas;
- descrição;
- diferenciais;
- custos;
- localização;
- mapa;
- WhatsApp;
- CTA mobile fixo.

Alterar a identidade visual para ficar coerente com a nova home.

Direção:

- fundo marfim;
- superfícies brancas;
- accent dourado/bronze;
- títulos DM Sans + serif apenas na ênfase;
- galeria com enquadramento sofisticado;
- cards de fatos mais leves;
- contato lateral escuro;
- CTA WhatsApp muito claro;
- hierarquia melhor no mobile.

Evitar que a página pareça um segundo site desconectado.

---

# 9. BRANDMARK E TEXTOS

Atualizar o `BrandMark` para comunicar:

`FERREIRA`
`CORRETOR DE IMÓVEIS · CRECI 133794-F`

A linha inferior pode diminuir no mobile, mas não deve mudar o nome institucional.

Atualizar `aria-label` e `document.title`.

Exemplos:

`Ferreira Corretor de Imóveis | Encontre seu próximo imóvel`

`Imóveis disponíveis | Ferreira Corretor de Imóveis`

`{nome do imóvel} | Ferreira Corretor de Imóveis`

---

# 10. MOTION

Preservar a personalidade atual.

Manter:

- IntroPortal;
- roof drawing;
- abertura dos painéis;
- reveal ao scroll;
- imagem do hero entrando;
- hover suave em cards;
- CTA com microinteração;
- FloatingWhatsApp entrando depois do hero.

Refinar o motion para a nova identidade:

- menos agressivo;
- mais silencioso;
- mais “luxury editorial”;
- 180-280ms para UI;
- 450-800ms para transições expressivas;
- easing suave;
- sem scroll-jacking;
- sem parallax pesado;
- sem dependência nova.

Não instalar GSAP, Motion ou Three.js para este redesign.

A stack atual já consegue entregar a experiência.

---

# 11. CONVERSÃO

A experiência precisa responder rápido:

1. Que negócio é este?
2. O que eu posso encontrar aqui?
3. Por que confiar?
4. Como eu procuro?
5. Como eu falo com o corretor?

Manter CTA de WhatsApp em pontos estratégicos sem transformar o site em spam:

- header;
- hero / busca;
- cards;
- detalhe do imóvel;
- CTA final;
- FloatingWhatsApp depois do hero.

Mensagens de WhatsApp devem ser pré-preenchidas e contextuais.

Não usar urgência falsa.

---

# 12. ACESSIBILIDADE

Preservar ou melhorar:

- HTML semântico;
- `focus-visible`;
- skip link;
- navegação por teclado;
- `aria-expanded`;
- labels persistentes;
- alt text;
- contraste;
- tamanho de toque;
- `prefers-reduced-motion`.

A busca e o catálogo devem funcionar sem depender de hover.

---

# 13. PERFORMANCE

Não adicionar dependências novas sem necessidade.

Preservar:

- hero crítico com `fetchPriority="high"`;
- intro sincronizada com conteúdo crítico;
- lazy loading nas imagens abaixo da dobra;
- CSS e React nativos;
- fallback funcional.

O redesign premium deve vir de:

- hierarquia;
- imagem;
- tipografia;
- composição;
- espaço;
- motion disciplinado;

não de runtime pesado.

---

# 14. IMPLEMENTAÇÃO

Faça uma inspeção focada dos arquivos relacionados à home, catálogo, detalhe, estilos e motion.

Arquivos prováveis:

```text
src/App.tsx
src/components/Header.tsx
src/components/BrandMark.tsx
src/components/Hero.tsx
src/components/PropertyDiscovery.tsx
src/components/PropertyCard.tsx
src/components/About.tsx
src/components/Process.tsx
src/components/Contact.tsx
src/components/Footer.tsx
src/components/FloatingWhatsApp.tsx
src/pages/PropertiesPage.tsx
src/pages/PropertyDetailPage.tsx
src/content/siteContent.ts
src/styles/tokens.css
src/styles/global.css
src/styles/hero.css
src/styles/properties.css
src/styles/content.css
src/styles/motion.css
src/styles/catalog.css
index.html
```

Você pode criar componentes adicionais pequenos, como:

```text
QuickPropertySearch.tsx
TrustStrip.tsx
```

Prefira componentes pequenos e específicos.

Evite refactor geral desnecessário.

---

# 15. TESTES

Atualize testes que dependam de copy antiga.

Rode:

```bash
npm test
npm run build
```

Também valide manualmente:

- `/`
- `/imoveis`
- `/imovel/FI-001`
- menu mobile;
- busca do hero para catálogo;
- filtros;
- WhatsApp;
- primeira execução do IntroPortal;
- segunda navegação sem intro;
- reduced motion;
- 360px;
- 390px;
- 430px;
- tablet;
- desktop.

Não considerar concluído com erro de console ou overflow horizontal.

---

# 16. CRITÉRIOS DE ACEITE

A tarefa está concluída quando:

- a marca aparece como **Ferreira Corretor de Imóveis**;
- a home se aproxima da linguagem visual da referência sem copiá-la;
- o hero e a busca funcionam muito bem no mobile;
- as animações e molduras autorais continuam presentes;
- a home parece uma experiência imobiliária real, não um case conceitual;
- catálogo e página individual compartilham a mesma identidade;
- WhatsApp está integrado ao funil;
- não existem métricas ou provas inventadas;
- fallback/demo continua identificado honestamente;
- acessibilidade e reduced motion continuam funcionando;
- nenhum sistema funcional do catálogo foi removido;
- `npm test` passa;
- `npm run build` passa;
- o layout não quebra em larguras intermediárias.

---

# 17. ENTREGA FINAL

Ao terminar, responda somente com:

### Alterado
Resumo objetivo das mudanças.

### Preservado
Sistemas existentes mantidos.

### Verificado
Testes, build e rotas validadas.

### Pendente
Somente o que depender de conteúdo real do cliente, como fotos institucionais, imóveis oficiais, endereço, redes ou dados não fornecidos.

Não invente dados para preencher pendências.
