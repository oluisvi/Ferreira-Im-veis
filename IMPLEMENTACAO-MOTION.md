# Implementação — Motion de conteúdo e conversão

## Princípio

A primeira section já funciona como assinatura visual do site. Por isso, esta atualização não adiciona nenhuma nova animação ao hero. O ritmo começa somente quando o visitante entra no conteúdo de exploração.

## Sistema de reveal

`ScrollMotion.tsx` observa elementos marcados com `data-reveal` e adiciona `is-revealed` quando eles entram no viewport. A classe `reveal-enabled` só existe quando JavaScript, IntersectionObserver e movimento normal estão disponíveis, evitando conteúdo permanentemente oculto em fallback.

Variações usadas:

- `rise`: entrada vertical suave.
- `line`: entrada com pequena máscara/elevação.
- `from-left`: entrada lateral para o bloco visual do Sobre.
- `row`: progressão horizontal para a jornada.
- `scale`: escala controlada para elemento decorativo.
- `property`: reveal específico dos cards de imóveis.

## CTA persistente

`FloatingWhatsApp.tsx` observa o hero e a section `#contato`.

- Enquanto o hero estiver visível: CTA oculto.
- Depois de sair do hero: CTA visível.
- Quando o contato final aparecer: CTA oculto novamente.

Isso mantém a primeira composição limpa e cria uma ação de conversão clara durante a parte longa da navegação.
