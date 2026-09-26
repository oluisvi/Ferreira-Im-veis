# Correção da exclusão de imóveis

**Atualização para erro 500 em /api/properties?admin=1:** a rota agora usa `api/properties.ts`, de modo que a Vercel compile a função junto com a autenticação em TypeScript. A leitura da sessão também ficou dentro do tratamento de erros. Publique este ZIP mais recente na Vercel. A rota `/api/properties?admin=1` deve responder JSON (HTTP 200 com uma sessão válida ou 401 sem sessão), e não `FUNCTION_INVOCATION_FAILED`. Se ainda ocorrer 500, consulte o log de execução da função para identificar o erro de inicialização exato. A publicação do Apps Script continua necessária caso ainda não tenha sido feita.

O projeto foi corrigido localmente. Nenhuma alteração foi publicada na sua Vercel nem executada na sua planilha real.

## Aplicação — atualizar os dois lados

1. Na planilha que realmente contém os imóveis, abra **Extensões > Apps Script**.
2. Substitua o código antigo pelo conteúdo completo de `docs/google-apps-script.gs` deste pacote. O arquivo separado `google-apps-script-corrigido.gs` contém o mesmo código. Substitua, não acrescente ao script antigo.
3. Salve e publique uma **nova versão da implantação existente** em **Implantar > Gerenciar implantações > Editar > Nova versão > Implantar**. Apenas salvar o editor não atualiza a versão usada pelo site. Preserve o acesso de aplicativo da Web necessário ao servidor e a execução pela conta com acesso à planilha.
4. Confirme que a URL terminada em `/exec` é a mesma configurada na Vercel em `PROPERTIES_SCRIPT_URL`. Acesse essa URL com `?action=delete-capabilities`: a resposta deve incluir `"ok":true,"protocol":2`.
5. Na Vercel, confira `BLOB_READ_WRITE_TOKEN`, usando o token do mesmo armazenamento que recebe os uploads. Mantenha também as configurações existentes de login do admin. Não coloque esse token em variável `VITE_`.
6. Publique o projeto corrigido na Vercel. Atualize Apps Script e site na mesma manutenção: o site novo exige o protocolo novo, e o script novo recusa a exclusão antiga.
7. Em `/admin`, crie um imóvel de teste com duas fotos e um vídeo, exclua-o e recarregue o painel e o catálogo. Confira a ausência das linhas nas abas e dos arquivos no armazenamento Blob.

**Fonte dos dados:** quando `PROPERTIES_SCRIPT_URL` está configurada, o catálogo também lê o Apps Script. Dessa forma, leitura e exclusão usam a mesma planilha vinculada ao script, em vez de possivelmente ler um CSV de outra planilha. O CSV continua como alternativa somente quando não há URL do Apps Script. Confira se ambas as abas abaixo pertencem ao catálogo antes de publicar.

## O que foi corrigido

- Busca e remove todas as linhas com o código do imóvel nas abas `Imoveis` e `ferreira-imoveis-template.csv`, se existirem. Reconhece Código/Codigo/Code/ID/Referência, espaços e diferenças entre maiúsculas e minúsculas.
- Obtém fotos, capa, galeria, vídeos e histórico de mídias diretamente das linhas da planilha. A lista enviada pelo navegador não controla quais arquivos serão apagados.
- Exclui arquivos exclusivos do imóvel no Vercel Blob e só depois remove as linhas. Arquivos também referenciados por outro imóvel são preservados.
- Se uma mídia falhar, retorna erro, mantém as linhas e URLs e permite tentar novamente — inclusive depois de recarregar a página. O Apps Script bloqueia edições nesse imóvel enquanto sua exclusão está pendente.
- Usa bloqueio nas gravações do Apps Script e um identificador de operação persistente, removido ao finalizar. A confirmação verifica novamente as mídias e as linhas.
- Remove eventos desse imóvel na aba `WhatsAppClicks` e ignora cliques atrasados de imóveis que já não existem.
- O painel trata erros de rede, bloqueia cliques repetidos e só retira o card após a confirmação completa. O gerenciamento também lista imóveis ocultos.
- O formato antigo de cadastro passa a guardar galeria e vídeo. A coluna `_midias`, criada automaticamente, mantém referências anteriores e todos os uploads concluídos enviados no cadastro/edição, inclusive vídeos adicionais, para futura exclusão.
- Uma resposta de catálogo vazio não é mais substituída por imóveis de exemplo na página inicial ou no catálogo.
- Corrige a quebra de linha do `.env.example`, que deixava `PROPERTIES_SCRIPT_URL` na linha de comentário.

## Limites e recuperação

- Google Sheets e Blob são serviços separados; não existe uma transação única entre eles. Em uma falha parcial, algumas mídias podem já ter sido apagadas, enquanto o registro continua na planilha. Corrija token/permissões/conexão e use **Excluir** novamente para concluir. Não remova as linhas manualmente durante essa recuperação, pois elas guardam as referências necessárias.
- Fotos externas (Google Drive, YouTube, outros sites) têm seus links removidos da planilha, mas o Vercel Blob não tem acesso para apagar os arquivos nesses provedores. O painel informa essa situação.
- Arquivos antigos que já ficaram órfãos, sem URL em nenhuma linha ou histórico, não podem ser associados com segurança a um imóvel neste projeto: os uploads antigos usam nomes de arquivo, sem um identificador do imóvel. Esta correção não apaga indiscriminadamente o armazenamento e não recupera referências que já foram perdidas.
- Faça a exclusão pelo painel. Alterações manuais nas células não participam do bloqueio do Apps Script; se as mídias mudarem durante a operação, a confirmação é recusada e pede nova tentativa.
- A remoção do cache do Blob pode levar até aproximadamente um minuto. Uma URL ainda renderizada nesse intervalo não comprova que o objeto continua no armazenamento.

## Validação local

- `npm run build`: aprovado (TypeScript + Vite).
- `npm run test -- --run tests`: 19 testes novos aprovados, cobrindo API + código real do Apps Script em um simulador de Sheets, e o painel em DOM simulado.
- Foram simulados Blob indisponível, falta de token, script antigo, erro lógico com HTTP 200, erro de rede no painel, falha na etapa final do Sheets, nova tentativa, duplicatas, mídias compartilhadas/externas, catálogo vazio, imóveis ocultos, eventos atrasados e clique repetido.
- A suíte anterior possui 7 falhas em 15 testes. As mesmas 7 falhas foram reproduzidas no ZIP original sem as alterações: 3 de App, 3 de IntroPortal e 1 de rota em propertyCatalog. Elas não foram mascaradas nem alteradas nesta correção.
- Os testes usam serviços simulados; a validação final na sua conta depende da publicação e das credenciais reais.

Referências oficiais: [versões do Apps Script](https://developers.google.com/apps-script/guides/versions), [aplicativos da Web](https://developers.google.com/apps-script/guides/web), [exclusão com o SDK do Blob](https://vercel.com/docs/vercel-blob/using-blob-sdk).
