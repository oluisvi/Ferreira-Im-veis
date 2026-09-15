# Prompt — Entrada Temática Adaptativa para Websites

Use o texto abaixo como prompt mestre em outros projetos.

---

Quero que você conceba e implemente uma animação de entrada autoral para este website. A abertura precisa nascer da identidade, do setor, do objeto simbólico e da linguagem visual específicos do projeto. Não use um loader genérico, logo girando, barra de progresso, partículas aleatórias ou a mesma transição aplicada a qualquer marca.

## Objetivo

Transforme os primeiros 1 a 2 segundos da visita em uma microcena que introduza o universo da marca e conduza naturalmente ao hero. A animação deve funcionar como um limiar entre “fora” e “dentro” da experiência.

## Antes de desenhar

Analise o material disponível e identifique:

1. setor e atividade da marca;
2. principal objeto, gesto, ferramenta, ambiente ou matéria associado a ela;
3. geometria, símbolo ou movimento já presente na identidade;
4. emoção que a entrada deve provocar;
5. composição, cores, tipografia e ritmo do hero;
6. ação física que pode revelar o conteúdo de modo coerente;
7. limitações de desempenho, mobile e acessibilidade.

Não invente uma metáfora apenas porque ela produz um efeito visual chamativo. Escolha uma ação que o visitante reconheceria como pertencente àquele universo mesmo sem ver o nome da marca.

## Método criativo

Construa a ideia com esta fórmula:

**UNIVERSO DA MARCA → OBJETO OU MATÉRIA → GESTO CARACTERÍSTICO → TRANSFORMAÇÃO DA TELA → REVELAÇÃO DO HERO**

Exemplos de raciocínio, não modelos para copiar:

- imobiliária ou arquitetura → porta, janela, fachada, planta, telhado ou luz atravessando um ambiente → abrir, deslizar, enquadrar ou iluminar;
- barbearia → capa, toalha, navalha, espuma ou cadeira → tecido atravessando a tela, corte preciso ou giro controlado;
- finanças → moeda, fluxo, livro-caixa, gráfico ou transferência → passagem de valor, contagem, alinhamento ou fluxo entre estados;
- moda → tecido, cabideiro, armário, etiqueta ou peça → puxar, vestir, desdobrar, costurar ou revelar por camadas;
- gastronomia → vapor, prato, embalagem, ingrediente ou chama → servir, abrir, derramar ou transformar;
- música → capa, fita, disco, palco ou onda sonora → girar, abrir cortina, modular ou sincronizar;
- tecnologia → interface, sinal, dado ou dispositivo específico do produto → conectar, inicializar ou transformar, sem recorrer automaticamente a estética futurista genérica.

Depois de analisar o projeto, proponha de duas a três metáforas possíveis em poucas linhas, compare clareza, originalidade, custo técnico e coerência com a marca, e recomende uma. Aguarde aprovação antes de implementar.

## Regras de direção

- A abertura deve compartilhar cores, tipografia, proporções e geometria com o site.
- O último quadro da animação deve se conectar visualmente ao primeiro quadro do hero.
- Prefira uma única transformação memorável a vários efeitos simultâneos.
- Use o logo como matéria visual apenas quando sua geometria permitir; não transforme a abertura em vinheta corporativa.
- Evite copiar literalmente sites de referência. Extraia princípios e reconstrua-os para a marca.
- Evite teatralidade incompatível com o porte, público ou proposta do negócio.
- Não esconda conteúdo para compensar carregamento lento.
- A animação não deve parecer anúncio, splash screen de aplicativo ou vídeo institucional.

## Requisitos de experiência

- Duração recomendada: 1,2 a 2 segundos.
- Exibir apenas na primeira visita da sessão, salvo requisito contrário.
- Não repetir em navegação interna.
- Não depender do carregamento de vídeo, WebGL ou imagens pesadas.
- Não bloquear a página indefinidamente se um evento de animação falhar; inclua encerramento seguro por tempo.
- Não capturar foco nem impedir tecnologias assistivas de acessar o conteúdo real.
- Marcar a cena decorativa com semântica apropriada, como `aria-hidden="true"`.
- Respeitar `prefers-reduced-motion`; nesse modo, remover ou reduzir a cena a uma transição instantânea e elegante.
- Manter o hero e a navegação funcionais sem JavaScript ou quando a animação for ignorada.
- Reorientar a composição no mobile; não apenas reduzir a versão desktop.

## Requisitos técnicos

- Use CSS e APIs nativas quando forem suficientes.
- Só introduza Motion, GSAP, Canvas ou WebGL se a metáfora exigir e o benefício superar custo, bundle e manutenção.
- Não use scroll-jacking.
- Evite layout shift, barras de rolagem temporárias e flashes de conteúdo incorretos.
- Sincronize a saída da cobertura com a entrada do hero.
- Implemente teste para: primeira exibição, persistência por sessão, encerramento seguro e movimento reduzido.
- Valide em desktop, mobile, teclado, conexão lenta e dispositivo menos potente.

## Entrega esperada

Apresente:

1. conceito e relação com a marca;
2. storyboard de 4 a 6 momentos com tempos aproximados;
3. comportamento desktop, mobile e movimento reduzido;
4. estratégia de implementação e fallback;
5. código integrado ao design system existente;
6. testes e evidências de validação;
7. breve explicação de por que essa abertura não serviria igualmente para uma marca de outro setor.

O resultado deve fazer o visitante sentir que entrou no mundo específico daquela marca antes mesmo de começar a navegar.

---
