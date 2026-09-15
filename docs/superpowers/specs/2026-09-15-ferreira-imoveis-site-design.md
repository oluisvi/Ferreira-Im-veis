# Ferreira Imóveis — Especificação de Design

## Objetivo

Criar um MVP visual responsivo para apresentar o corretor Ferreira, gerar confiança e conduzir visitantes a um futuro atendimento por WhatsApp. O site deve estar pronto para receber dados e imóveis reais posteriormente, sem apresentar conteúdo demonstrativo como oferta comercial verdadeira.

## Escopo inicial

- Página única em português-BR.
- Navegação: Início, Imóveis, Sobre e Contato.
- Hero editorial com proposta de valor provisória.
- Busca visual demonstrativa por finalidade, tipo e localização.
- Vitrine com imóveis explicitamente identificados como exemplos.
- Apresentação do corretor sem alegações factuais não confirmadas.
- Explicação simples do processo de atendimento.
- Área de contato e CTA de WhatsApp usando o número confirmado (12) 99766-5886.
- Rodapé com a marca e o CRECI 133794-F.

## Direção criativa

A experiência será uma vitrine editorial imobiliária: base off-white, preto predominante e vermelho usado apenas como acento. A percepção premium virá de tipografia, fotografia, proporção, ritmo e espaço em branco. O símbolo do telhado inspira linhas arquitetônicas e recortes que conectam as cenas da página.

A assinatura visual será uma transição arquitetônica sutil: linhas derivadas do telhado enquadram e revelam conteúdos conforme a navegação. Ela terá alternativa estática para dispositivos com movimento reduzido. Não haverá 3D no MVP.

## Estrutura da experiência

1. **Chegada:** marca, proposta de valor e ações principais.
2. **Descoberta:** busca demonstrativa e categorias de interesse.
3. **Seleção:** imóveis de exemplo apresentados como protótipos, sem preços ou endereços inventados.
4. **Confiança:** apresentação do profissional e CRECI confirmado.
5. **Processo:** entender, selecionar, visitar e negociar.
6. **Conversão:** contato futuro via WhatsApp e formulário visual demonstrativo.

## Conteúdo e dados

Textos, imagens e imóveis provisórios ficarão centralizados para substituição rápida. O WhatsApp confirmado é (12) 99766-5886 e será configurado no formato internacional `5512997665886`. Não serão inventados cidade, depoimentos, métricas, endereço, preço, disponibilidade ou atributos comerciais. Fotografias provisórias serão tratadas como ambientação visual, não como inventário real.

## Implementação

O projeto será uma aplicação frontend modular e responsiva, sem backend nesta etapa. Componentes separarão navegação, hero, busca, vitrine, apresentação, processo, contato e rodapé. A interface funcionará com teclado, terá foco visível, HTML semântico, contraste adequado e respeito a `prefers-reduced-motion`.

## Estados e falhas

- Os CTAs de contato abrirão `https://wa.me/5512997665886` com uma mensagem inicial curta e editável.
- A busca demonstrativa atualizará a apresentação localmente, sem prometer consulta a um catálogo real.
- Imagens terão fallback e texto alternativo apropriado.
- O layout permanecerá íntegro sem animações e em telas pequenas.

## Validação

- Build de produção sem erros.
- Verificação funcional da navegação, busca demonstrativa e estados de CTA.
- Inspeção visual em desktop e mobile.
- Verificação básica de acessibilidade, movimento reduzido e ausência de overflow.
- Confirmação de que nenhum dado comercial fictício aparece como real.

## Fora do escopo

Catálogo real, páginas individuais, CMS, CRM, banco de dados, envio de formulário, analytics, mapas, publicação, SEO local definitivo e integrações externas serão definidos quando os dados do negócio estiverem disponíveis.
