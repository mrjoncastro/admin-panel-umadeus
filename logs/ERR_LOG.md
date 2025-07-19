# Registro de Erros

> Em ambiente local o log é gravado em `logs/ERR_LOG.md`. Em produção (por exemplo, na Vercel) o arquivo é salvo em `/tmp/ERR_LOG.md` ou enviado para o Sentry. Baixe esse arquivo ou consulte o painel do Sentry para visualizar os registros.

# Registro de Erros

> Em ambiente local o log é gravado em `logs/ERR_LOG.md`. Em produção (por exemplo, na Vercel) o arquivo é salvo em `/tmp/ERR_LOG.md` ou encaminhado para um serviço externo. Baixe esse arquivo ou acesse sua ferramenta de coleta para visualizar os registros.

## [2025-06-07] Corrigida tipagem da página de categoria que quebrava build - dev - 450cce4

## [2025-06-07] Corrigido efeito em ListaInscricoes que não respondia a mudanças de autenticação - dev - 668eeb0

## [2025-06-07] Corrigido erro de importacao no blog - dev - 1f6facf

## [2025-06-07] Corrigido mock de fetch nas stories do blog para retornar Response - dev - 4ab1693

## [2025-06-07] Erro 'Property "posts" does not exist on type "{}"' em stories do blog, causando falha no build - dev - 441b5f1

## [2025-06-07] Erro 'Property 'primary' does not exist on type 'DefaultColors' resolvido em twColors - dev - a63d0a1

## [2025-06-07] Removidos tipos do React 19 e downgrade para React 18.2 para resolver erros em tempo de execução - dev - 469ca13

## [2025-06-07] Resolvido loop infinito em admin/perfil causado por dependências do useEffect - dev - 261ebe7

## [2025-06-09] Adicionada página e API de eventos com cabeçalhos de autenticação para evitar 401 - dev - a2d7bd0

## [2025-06-09] Adicionado log de host do PocketBase nas rotas de produtos para verificar inconsistências de banco

## [2025-06-09] Ajustado envio de token e usuário nas páginas de produtos e categorias para evitar 401 - dev - 668eeb0

## [2025-06-09] Cabeçalhos de autenticação ausentes geravam 401 nas rotas de produtos; tokens foram adicionados em todas as páginas do admin - dev - 668eeb0

## [2025-06-09] Cadastro de produtos não enviava dados à API; adicionada chamada POST com logs - dev - 91694f6

## [2025-06-09] Corrigido erro de imagem sem src na loja/produtos - dev - 1937fbf

## [2025-06-09] Corrigido retorno 401 ao acessar rotas de produtos e categorias no admin - dev - 655ebf9

## [2025-06-09] Recuperação de token em cada requisição nas páginas de categorias e edição de produto para evitar 401 - dev - e512eac

## [2025-06-09] Recuperação do token no momento da requisição para evitar 401 nas páginas de produtos - dev - 0a36fd1

## [2025-06-09] Tratamento de dados de categoria para evitar erro "categorias.map is not a function" no modal de produto - dev - 20a0ca8

## [2025-06-10] Ajustado uso de getURL nos produtos e categorias para impedir erro na loja - dev - 2b29c07

## [2025-06-10] Corrigido carregamento de slug e imagens absolutas em loja/produtos/[slug] - dev - 3a448ad

## [2025-06-12] Ajustado carregamento de gêneros e imagens no detalhe do produto - dev - 6fd0697

## [2025-06-12] Ajustado preview do Storybook para aplicar AppConfigProvider e exibir cores primarias - dev - 30fade5

## [2025-06-12] Ajustado tipo Produto em loja/produtos/[slug] para compatibilidade com types - dev - 707ff02

## [2025-06-12] Corrigido erro "Expression expected" no preview do Storybook renomeando arquivo para .tsx - dev - 25cd01a

## [2025-06-12] Corrigido erro de build em login por falta de Suspense - dev - 823ad2b

## [2025-06-12] Corrigido erro de build por importacao de fs/promises no bundle de cliente - dev - 94b6508

## [2025-06-12] Corrigido prefixo de tipo incorreto no preview do Storybook - dev - c3ffbb6

## [2025-06-13] Corrigido erro "saldo undefined" na página Financeiro - dev - f8df755

## [2025-06-13] Implementadas rotas de saldo e transferência Asaas com verificação de permissão - dev - 7c89834

## [2025-06-15] Corrigido erro "Cannot read properties of undefined (reading 'toFixed')" em SaldoPage - dev - edbc5b2

## [2025-06-16] Erro ao atualizar configuracoes: ClientResponseError 404: The requested resource wasn't found. - development

## [2025-06-16] Erro ao atualizar produto p0470fjbh9yj96k: ClientResponseError 400: Failed to update record. | host: https://umadeus-production.up.railway.app | user: 1yd52dql17e5c0j - development

## [2025-06-16] Erro ao criar transferência: {"errors":[{"code":"invalid_action","description":"A sua conta ainda não está totalmente aprovada para utilizar o Pix."}]} - development

## [2025-06-17] Erro ao criar inscrição: ClientResponseError 400: Failed to create record. - development

## [2025-06-17] Erro ao criar transferência: {"errors":[{"code":"invalid_action","description":"A sua conta ainda não está totalmente aprovada para utilizar o Pix."}]} - development

## [2025-06-17] Erro ao obter configuracoes: ClientResponseError 404: The requested resource wasn't found. - development

## [2025-06-17] Limite de caracteres para checkout implementado - dev - 66b7255

## [2025-06-18] Erro ao criar compra: ClientResponseError 400: Failed to create record. - development

## [2025-06-18] Erro no checkout: Error: {"errors":[{"code":"invalid_object","description":"O campo successUrl é inválido."},{"code":"invalid_object","description":"O campo cancelUrl é inválido."},{"code":"invalid_object","description":"O campo expiredUrl é inválido."}]} - development

## [2025-06-18] Erro no checkout: Error: {"errors":[{"code":"invalid_object","description":"O tipo de cobrança DETACHED deve ser informado junto com o tipo de cobrança INSTALLMENT"}]} - development

## [2025-06-18] Erro no checkout: Error: {"errors":[{"code":"invalid_object","description":"Para gerar cobranças com Pix é necessário criar uma chave Pix no Asaas."},{"code":"invalid_object","description":"O valor total do Split R$ 7,00 excede o valor a receber da cobrança R$ 2,77. O split máximo deve ser menor ou igual ao valor da cobrança menos o desconto."}]} - development

## [2025-06-18] Erro no checkout: Error: {"errors":[{"code":"invalid_object","description":"Para gerar cobranças com Pix é necessário criar uma chave Pix no Asaas."}]} - development

## [2025-06-19] Erro ao atualizar configuracoes: ClientResponseError 400: Failed to update record. - development

## [2025-06-20] Caminho incorreto dos testes de acessibilidade corrigido em package.json - dev - 01d4b28

## [2025-06-20] Corrigido erro 'Cannot read properties of undefined (reading 'replace')' em ConfiguracoesPage ajustando funcao isColorLight - dev - 3d07f5f

## [2025-06-20] Corrigido erro de hidratação e ordem de hooks em UsuariosPage e Layout - dev - 30c0f0f

## [2025-06-21] Build falhou: next not found - dev

## [2025-06-21] Corrigido erro 403 no dashboard requisitando admin/api/usuarios/${user.id} - dev - ab8a6ee

## [2025-06-21] Erro ao atualizar configuracoes: ClientResponseError 400: Failed to update record. - development

## [2025-06-21] Erro ao criar pedido: ClientResponseError 400: Failed to create record. - development

## [2025-06-21] Erro no checkout: Error - development

## [2025-06-21] Lint falhou: next not found - dev

## [2025-06-21] Suporte ao campo logo nos eventos e formulários. Rotas corrigidas - dev

## [2025-06-22] Erro ao criar pedido: ClientResponseError 400: Failed to create record. - development

## [2025-06-22] Erro no checkout: Error - development

## [2025-06-25] Erro 404 ao buscar clientes_config por ID em /admin/api/configuracoes; corrigido consultando por campo cliente - dev - a259f55

## [2025-06-26] Consulta por ID na clientes_config gerava 404. Commit c58e7c1 mudou para filtrar por campo cliente.

## [2025-07-09] Erro no checkout: {"errors":[{"code":"invalid_object","description":"O valor total do Split excede o valor a receber"}]} - development

## [2025-07-09] Resolvido erro de Split no checkout ajustando o valor automaticamente quando a API retorna o limite. Commit: 4285c3777ccd95b6024d424a54fe5528118646a4

## [2025-07-11] Corrigida tipagem da página de post do blog que quebrava build - dev - 82aa56e

## [2025-07-21] Erro de CORS ao chamar o PocketBase diretamente pelo cliente. Agora todas as requisições passam por rotas internas do Next.js. - dev - a521f30

## [2025-07-26] Erro 401 ao criar pedido na loja devido a token não enviado; rota ajustada para incluir cabeçalhos de autenticação - dev

## [2025-07-27] Corrigido erro de cliente não encontrado ao registrar usuário; validação agora usa campo cliente em clientes_config - dev - 6967030

## [2025-07-27] Registro de usuário não incluía role e bairro; rota atualizada para enviar role "usuario" e campo bairro - dev

## [2025-07-30] Logout nao funcionava para coordenador e lider; botao agora usa logout() do contexto - dev - 6948482

## [2025-07-31] Erro ao buscar produto: ClientResponseError 404: The requested resource wasn't found. - production - 2df37e3

## [2025-06-22] Corrigido erro de tipagem no Next.js para parametros de URL nas páginas de eventos. - dev

## [2025-06-22] Erro ao confirmar inscrição: API /api/asaas retornava "pedidoId e valorBruto são obrigatórios" devido ao uso de pedido.id na página admin/inscricoes. Corrigido para usar pedido.pedidoId. - dev - c89ca25

## [2025-06-22] Falha ao criar pedido ao aprovar inscrição; página admin/inscricoes enviava `id_inscricao` em vez de `inscricaoId`. Ajustado para enviar o campo correto. - dev - 36974c3

## [2025-06-22] Campo `aprovada` não era enviado ao confirmar inscrições, impedindo a compra de produtos que exigem aprovação. Página admin/inscricoes agora define `aprovada: true`. - dev - e7773fb

## [2025-06-22] Recusar inscrição não atualizava `aprovada` nem `confirmado_por_lider`. Ajustado para enviar ambos ao cancelar. - dev - 76c0333

## [2025-06-22] Erro ao confirmar inscrição: API /api/asaas retornava "pedidoId e valorBruto são obrigatórios" devido ao uso de pedido.id na página admin/inscricoes. Corrigido para usar pedido.pedidoId. - dev - c89ca25

## [2025-06-22] Falha ao criar pedido ao aprovar inscrição; página admin/inscricoes enviava `id_inscricao` em vez de `inscricaoId`. Ajustado para enviar o campo correto. - dev - 36974c3

## [2025-06-22] Erro ao criar cobrança: status 400 | {"errors":[{"code":"invalid_action","description":"Wallet [906c2a75-b67a-4263-bee1-6bccca34feb3] inexistente."}]} - development

## [2025-06-22] Erro ao gerar link de pagamento Asaas: Error: Erro ao criar cobrança - development

## [2025-06-22] Erro ao criar pedido: ClientResponseError 400: Failed to create record. - development

## [2025-06-22] Falha ao atualizar pedido z845p88270drm85: ClientResponseError 404: The requested resource wasn't found. - development

## [2025-06-22] Falha ao atualizar pedido z845p88270drm85: ClientResponseError 404: The requested resource wasn't found. - development

## [2025-06-22] Falha ao atualizar pedido z845p88270drm85: ClientResponseError 404: The requested resource wasn't found. | {"data":{},"message":"The requested resource wasn't found.","status":404} - development

## [2025-06-22] Falha ao atualizar pedido z845p88270drm85: ClientResponseError 404: The requested resource wasn't found. | {"data":{},"message":"The requested resource wasn't found.","status":404} - development

## [2025-06-22] Falha ao atualizar pedido z845p88270drm85: ClientResponseError 404: The requested resource wasn't found. | {"data":{},"message":"The requested resource wasn't found.","status":404} - development

## [2025-06-23] Pagamento de inscrição redirecionava ao checkout em vez de usar o link existente. Botão corrigido para reutilizar link_pagamento do pedido. - dev - f095415

## [2025-06-23] Erro ao gerar link de pagamento Asaas: TypeError: ranges is not iterable - development

## [2025-06-25] Logout era abortado antes do fetch finalizar; headers agora aguardam logout() antes de redirecionar - dev - b4e0600

## [2025-06-25] Botão Sair no perfil de usuário não encerrava sessão. Logout agora aguarda fetch e fecha menus antes de redirecionar - dev - 3fec475

## [2025-07-31] Erro ao criar inscrição com usuário logado: API retornava "validation_not_unique" para o email. Rota /loja/api/inscricoes agora reutiliza o usuário autenticado quando disponível - dev

## [2025-07-31] Build falhava por "usuario" possivelmente nulo em /loja/api/inscricoes. Adicionada checagem final para garantir usuario antes de prosseguir - dev - 209f481

## [2025-06-27] Diversos fetch('/api') não enviavam token de autenticação. Adicionada função getAuthHeaders em hooks e páginas - dev

## [2025-06-27] Erro "Token ou usuário ausente" ao atualizar perfil. Login agora retorna token e contexto salva credenciais.

## [2025-06-27] Corrigida tipagem de retorno em getAuthHeaders para HeadersInit evitando erro de build em app/admin/inscricoes/page.tsx - dev - 5b28761

## [2025-06-27] Correção de dependências de pb em diversos useEffect - dev

## [2025-06-27] Perfil do cliente não enviava gênero e data_nascimento retornava formato inválido. Rota de atualização agora ajusta cookie - dev

## [2025-06-27] EventForm nao normalizava data_nascimento ao preencher usuario; campo ficava vazio. Valor agora cortado para YYYY-MM-DD - dev

## [2025-06-27] EventForm nao preenchia endereco via CEP; adicionado lookup usando fetchCep - dev

## [2025-06-27] Perfil do cliente não enviava gênero e data_nascimento retornava formato inválido. Rota de atualização agora ajusta cookie - dev

## [2025-06-27] EventForm nao normalizava data_nascimento ao preencher usuario; campo ficava vazio. Valor agora cortado para YYYY-MM-DD - dev

## [2025-08-10] Webhook agora registra accountId e externalReference quando cliente ausente - dev - dbfc979

## [2025-06-30] Correção de loop infinito ao memoizar PocketBase nas páginas de inscrições e loja - dev - b51998f1

## [2025-06-30] Erro ao criar pedido: TypeError: Cannot read properties of undefined (reading 'id') - test

## [2025-06-30] Rota /api/pedidos retornava apenas items, ocultando totalPages; resposta atualizada para incluir o resultado completo - dev - de10e3d

## [2025-06-30] Correção paginação em /api/inscricoes - dev - 237edb0

## [2025-06-30] Lista de pedidos duplicada ao carregar admin/pedidos. Adicionada deduplicação no fetch - dev - c29e2ce4

## [2025-06-30] Cadastro da loja não salvava endereço e role ao criar novo usuário. Rota /loja/api/inscricoes agora utiliza data.role e campos completos - dev

## [2025-06-30] Consulta de produto ja filtra por cliente na API, evitando verificacao redundante do tenant - dev

## [2025-06-30] Produtos exclusivos retornavam erro 403 na loja. Página agora exibe detalhes e exige login apenas na compra - dev - c18ad74d

## [2025-07-01] Corrigida tipagem de params na página de confirmação de senha; build falhava por incompatibilidade com PageProps - dev - 7d2b5981

## [2025-08-11] Mostrar erro detalhado ao enviar inscrição no InscricaoForm - dev - 99686afe

## [2025-08-12] Página de produto travava quando não havia imagens. Galeria oculta quando array vazio - dev - cc4a5671

## [2025-08-13] Erro persistia quando objeto de imagens estava vazio; fallback para array vazio e uso de useMemo - dev - 636db478

## [2025-08-14] inscricoes.some is not a function quando API retorna objeto; parseado data.items em useInscricoes - dev - 09a133f7

## [2025-07-02] Erro de checkout retornava campo 'error' nao tratado; exibicao atualizada - prod - aaccd7eb

## [2025-08-15] PATCH /api/inscricoes/[id] excedeu tentativas de retry - dev - <commit-link>

## [2025-07-02] Erro ao criar pedido: TypeError: Cannot read properties of undefined (reading 'id') - test

## [2025-07-02] Erro ao criar pedido: TypeError: Cannot read properties of undefined (reading 'id') - test

## [2025-08-16] Inscricoes bloqueavam usuario logado por CPF existente. Rota /api/usuarios/exists aceita excludeId e EventForm ignora o proprio usuario - dev - cb2b0073

## [2025-07-02] Erro ao criar pedido: TypeError: Cannot read properties of undefined (reading 'id') - test

## [2025-07-02] Webhook Asaas retornava 500 sem tratamento de erro; rota atualizada com logConciliacaoErro - dev - ac00e3389c99092fa0fd57e563bacc899c65f109

## [2025-07-02] Webhook Asaas inclui detalhes no erro interno - dev - a1a2c3ba

## [2025-07-02] Webhook Asaas usa host do tenant no envio de notificacoes - dev - c3800972

## [2025-07-02] Webhook Asaas nao usa mais NEXT_PUBLIC_SITE_URL; host obtido do tenant - dev - fcee1eaf7bdf79c55c4c019c94e5c91d38117490

## [2025-07-02] getTenantHost retornava dominio sem protocolo, causando erros de redirecionamento - dev - 3d2de08d

## [2025-07-05] Validação de paymentMethod na rota Asaas - dev - 83c8b653

## [2025-07-05] Forma de pagamento 'Credito' mapeada para pix nas rotas - dev - 10307d3

## [2025-07-05] Consulta de inscrição pública retornava erro "Token ou usuário ausente" ao usar rota protegida. Componente ConsultaInscricao chama /api/inscricoes/public - dev

## [2025-07-05] GET /api/inscricoes/public retornava "Erro interno" quando nenhuma inscrição era encontrada. Rota atualizada para retornar 404 com "Inscrição não encontrada". Commit 6d3daeac - dev

## [2025-07-05] Login falhava sem redirectTo; fallback para '/' implementado - dev - 75187664

## [2025-07-05] Removida chamada de login com campos inexistentes apos refatoracao do CreateUserForm; erro de compilacao resolvido - dev - ea109718f369e58f51b00b3994a51ea16c9bee64

## [2025-07-06] Erro "Todos os campos obrigatórios" ao enviar inscrição sem dados completos. Etapa de revisão agora exibe telefone, nascimento e gênero antes de concluir - dev - 3b2d91f4

## [2025-07-06] Validação de dados ausentes na etapa de revisão impede erro de campos obrigatórios - dev - 8fd176cd

## [2025-07-06] Revisão checa todos os campos obrigatórios para evitar erro de envio - dev - 66769d90

## [2025-07-06] Etapa de revisão exibe ícone de edição para ajustar dados antes do envio - dev - 6d8ffadc

## [2025-07-06] Revisão inclui endereço completo e valida ausência antes do envio - dev - 3968f02f
## [2025-07-07] Build falhou devido a 'Unexpected character' ao compilar template.md?raw - dev
## [2025-07-07] Erro ao criar pedido: TypeError: Cannot read properties of undefined (reading 'id') - test
## [2025-07-07] Erro ao gerar link de pagamento Asaas: TypeError: cobrancaResponse.clone is not a function - test
## [2025-07-08] Erro no painel devido a código duplicado em DashboardAnalytics.tsx - dev - resolvido restaurando arquivo e tipagens.
## [2025-07-08] Líder não conseguia definir status "aguardando_pagamento" ao confirmar inscrição. PATCH /api/inscricoes/[id] agora permite esse valor. - dev
## [2025-07-08] Modal de edição excedia altura da tela no fluxo de inscrição, impedindo salvar ou cancelar. Adicionado overflow-y-auto e max-h-screen nos modais de edição. - prod - bca77d01a1630e5dd09ae4e9579e9a71d3341df3
## [2025-07-11] ModalEditarPerfil não enviava cabeçalhos de autenticação, impedindo salvar perfil durante inscrição. Cabeçalhos adicionados. - dev - f969efa7
## [2025-08-17] Patch /api/usuarios/[id] nao atualizava cookie de autenticacao apos salvar CPF ou outros dados. Rota agora retorna usuario atualizado e define cookie - dev - 6c3bbe3d
## [2025-07-15] Erro ao criar pedido: TypeError: Cannot read properties of undefined (reading 'id') - test
## [2025-07-15] Erro ao gerar link de pagamento Asaas: TypeError: cobrancaResponse.clone is not a function - test
## [2025-08-18] ConsultaInscricao sobrescrevia CPF/email do lider ao logar, exibindo inscricao errada e redirecionando para home. Efeito ajustado para manter valores digitados. - dev - 3155a7a1
## [2025-08-19] EventForm buscava inscricoes pendentes de todo o campo para lider, exibindo inscricoes de subordinados e bloqueando prosseguimento. Lista agora filtrada para mostrar apenas as inscricoes do usuario logado. - dev - 7b24a941
## [2025-07-17] Lista de pedidos nao atualizava paginacao ao aplicar filtros. Paginas recalculadas e pagina atual redefinida. - dev - 04cd8656
## [2025-07-17] Pedidos buscavam apenas a primeira pagina; resultado incompleto e paginacao incorreta. Fetch atualizado para usar fetchAllPages e pagina resetada ao alterar filtros globais. - dev - a2bf8fc4
## [2025-07-17] Inscricoes buscavam paginas manualmente; fetchAllPages adotado e paginacao recalculada ao filtrar. - dev - ac1da4cd
## [2025-07-18] Erro ao criar pedido avulso: ClientResponseError 400: Failed to create record. Ajustado para não enviar campos vazios. - dev - 1f72bca4
## [2025-08-22] Erro ao criar pedido avulso por tamanho indefinido; campo agora selecionável e genero preenchido via CPF. - dev - 8caa9780
## [2025-07-18] Erro ao criar pedido: TypeError: Cannot read properties of undefined (reading 'id') - test
