# Relatório de cliques no WhatsApp

Esta versão passa a registrar os cliques dos CTAs de WhatsApp em uma aba própria do Google Sheets e exibe a contagem no painel `/admin` em **Relatório**.

## O que mudou

- Todos os principais CTAs de WhatsApp chamam `trackWhatsAppClick`.
- O evento continua sendo enviado ao Microsoft Clarity e ao Vercel Analytics.
- Uma cópia mínima do evento também é enviada para `/api/whatsapp-click`.
- A API do projeto encaminha o evento para o Google Apps Script já configurado em `PROPERTIES_SCRIPT_URL`.
- O Apps Script cria automaticamente a aba `WhatsAppClicks` na mesma planilha.
- O `/api/admin-clarity` consulta essa aba e adiciona ao relatório os cliques das últimas 24, 48 ou 72 horas.

## Passo necessário no Google Apps Script

1. Abra o Apps Script que hoje recebe o cadastro de imóveis.
2. Substitua o código atual pelo conteúdo de `docs/google-apps-script.gs` desta versão.
3. Salve.
4. Vá em **Implantar > Gerenciar implantações**.
5. Edite a implantação Web App existente e publique uma **nova versão**, mantendo o acesso necessário para o site.
6. Não troque `PROPERTIES_SCRIPT_URL` se a URL da implantação continuar a mesma.

A aba `WhatsAppClicks` será criada automaticamente no primeiro clique ou na primeira consulta do relatório.

## Importante sobre histórico

A Data Export API do Microsoft Clarity não fornece a contagem dos eventos personalizados `whatsapp_click` no endpoint usado pelo painel. Por isso, os cliques anteriores a esta atualização não podem ser preenchidos retroativamente nesta nova contagem. O histórico do painel começa após a publicação desta versão.

## Dados gravados por clique

A aba registra apenas:

- data/hora;
- origem do CTA;
- caminho da página;
- código/tipo/cidade/bairro do imóvel, quando o clique veio de um imóvel.

O sistema não grava o conteúdo da conversa do WhatsApp nem dados digitados pelo usuário no WhatsApp.
