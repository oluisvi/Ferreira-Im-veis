# Entrada temática sincronizada — Ferreira Imóveis

## Conceito preservado

A entrada continua usando a metáfora já criada para o projeto: **telhado / fachada / limiar de uma casa**. A melhoria não troca a direção visual; transforma a cena em uma cobertura real do carregamento do primeiro viewport.

## Fluxo

1. **0–0,5 s — construção do telhado:** as duas águas e a base são desenhadas.
2. **0,2–1,0 s — identificação:** marca/CRECI entram e uma luz discreta estabiliza a composição.
3. **em paralelo — preparação do site:** React já monta header/hero/conteúdo; a imagem crítica do hero recebe `fetchPriority="high"`, `loading="eager"` e `decoding="async"`; fontes e imagem crítica são aguardadas.
4. **mínimo de 1,05 s — preservação da microcena:** mesmo em conexão rápida, a abertura tem tempo suficiente para ser percebida.
5. **quando o primeiro viewport está pronto — revelação:** telhado e identificação recuam, a luz apaga e as duas metades abrem como um limiar arquitetônico.
6. **fallback — 3,6 s:** se algum recurso crítico não resolver, a revelação é liberada mesmo assim. A saída tem 760 ms e não depende de `animationend`.

## Sincronização

A intro não usa mais um `setTimeout(1800)` cego. Ela aguarda a primeira condição que ocorrer:

- `duração mínima + conteúdo crítico pronto`; ou
- `timeout máximo de segurança`.

Antes de abrir, são solicitados dois frames de pintura (com fallback próprio), reduzindo a chance de revelar uma composição ainda não estabilizada.

## Hero atrás da entrada

Enquanto a primeira intro está ativa, as animações de entrada do hero são desativadas e o hero fica em seu **estado visual final** atrás das portas. Quando a intro abre, não existe uma segunda animação começando do zero. Depois dessa primeira abertura, a classe `intro-completed` mantém esse estado estável até o fim da visita atual.

## Performance

- nenhuma dependência nova;
- sem GSAP, Motion, Canvas ou WebGL;
- `preconnect` para Unsplash e Google Fonts;
- `preload` da imagem crítica do hero;
- apenas o primeiro viewport é considerado crítico; imagens das seções seguintes continuam livres para carregar normalmente.

## Acessibilidade e fallback

- intro continua `aria-hidden="true"`;
- `prefers-reduced-motion: reduce` continua removendo a cena;
- a intro continua tocando apenas na primeira visita da sessão;
- falha de `sessionStorage`, imagem, fonte ou readiness não pode prender a página indefinidamente;
- o conteúdo real continua montado por trás do overlay.

## Mobile

A composição específica já existente para mobile é preservada. O telhado continua reposicionado e redimensionado pelo breakpoint de 800 px, enquanto a lógica de readiness é a mesma em qualquer viewport.

## Testes adicionados/atualizados

`IntroPortal.test.tsx` cobre:

- primeira exibição;
- persistência por sessão;
- espera real por conteúdo crítico;
- timeout seguro;
- `prefers-reduced-motion`.

## Por que essa abertura pertence à Ferreira

A cena depende da linguagem imobiliária/arquitetônica do projeto: o visitante vê um telhado sendo construído e atravessa uma abertura que funciona como entrada física para o espaço do site. O mesmo gesto não teria a mesma coerência para uma marca de finanças, moda ou gastronomia sem mudar completamente o objeto e a ação.
