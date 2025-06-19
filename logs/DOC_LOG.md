# Registro de Alterações Documentais

## [2025-06-06] Integração Asaas adicionada
## [2025-06-06] Adicionado docs/design-tokens.md com descrições de tokens e atualizados estilos globais.
## [2025-06-06] Atualizado README removendo vari\u00e1vel MERCADO_PAGO_ACCESS_TOKEN e documentando ASAAS_API_KEY.
## [2025-06-06] Adicionada seção 'Registro de Logs' no README
## [2025-06-06] Adicionada variavel ASAAS_WEBHOOK_SECRET no README

## [2025-06-06] Removidos console.log das rotas da API admin e criado utilitario logger para padronizar logs. Impacto: reducao de ruido e melhoria na manutencao.
## [2025-06-06] Adicionado CONTRIBUTING.md com orientações de contribuição.
## [2025-06-06] Adicionados stories do blog (Sidebar, HeroCarousel, PostSuggestions, NextPostButton e MiniPrecosPost).
## [2025-06-06] Corrigidos stories do blog e configuracao do Storybook.
## [2025-06-06] Adicionadas stories para DashboardResumo e modais, criado esqueleto da área do cliente na loja e removidos console.log restantes.
## [2025-06-06] Criada página de clientes no admin para editar dados e acompanhar pedidos.
## [2025-06-07] Adicionado docs/design-system.md e links no README e AGENTS.
## [2025-06-07] Documentados tokens neutros e atualizados estilos globais.
## [2025-06-07] Documentada paleta 'error' no design-tokens.
## [2025-06-07] Adicionada seção "Blog e CMS" ao README e script generate-posts no package.json.
## [2025-06-07] Atualizadas cores para tokens e padronizado exemplos de botoes
## [2025-06-07] Unificação de estilos globais e documentação do design system. Atualizados tokens de cores, utilitários e exemplos.
## [2025-06-07] Incluídas classes `.card` e `.table-base` no design system.

## [2025-06-07] Corrigidos nomes de ícones e atualizado manifest.json para remover referência ausente.
## [2025-06-08] Adicionados story do PostContentEditor
## [2025-06-07] Criado componente EditorToolbar no admin e integrado ao editor de posts.
## [2025-06-07] Atualizado script generatePostsJson para ler `keywords` e `headerImage` dos posts.
## [2025-06-07] Documentadas variantes `.btn-secondary` e `.btn-danger` no design system e adicionadas classes globais correspondentes.
## [2025-06-07] Documentada classe `.heading` e exemplo de uso em docs/design-system.md.
## [2025-06-07] Atualizado arquitetura.md incluindo se\xC3\xA7\xC3\xA3o do Blog e nova estrutura de pastas.
## [2025-06-07] Ajustado processo de tipagem na rota loja/categorias/[slug].
## [2025-06-07] Documentada correção do carregamento de inscrições ao subscrever mudanças de autenticação.
## [2025-06-07] Documentada correção do loop infinito em admin/perfil no ERR_LOG
## [2025-06-07] Documentada personalização via AppConfigProvider em docs/design-system.md.
## [2025-06-07] Portal adicionado na arquitetura e boas práticas ajustadas.

## [2025-06-07] Documentada protecao de SSR no AppConfigProvider.
## [2025-06-07] Geradas variáveis CSS dinâmicas de cor e mapeamento via Tailwind. Documentação atualizada.
## [2025-06-08] Gerado utilitário primaryShades e atualizado AppConfigProvider para definir variáveis CSS. Tailwind e testes ajustados.
## [2025-06-07] Adicionado docs/testes.md e atualizada secao de testes no README.
## [2025-06-08] Documentado uso de dominio proprio com Vercel no README
## [2025-06-08] Atualizadas regras de acesso: produtos agora vinculados ao campo `user_org` e consultas filtradas por usuário.
## [2025-06-09] Movido rota de inscricoes do admin para raiz e atualizados caminhos.
## [2025-06-09] Adicionado role 'usuario' e documentada seção de perfis de acesso no README.
## [2025-06-09] Atualizadas rotas de login do admin para \`/login\`.
## [2025-06-09] Atualizadas rotas de login do admin para "/login" e ajustadas referencias no Header.
## [2025-06-09] Adicionado menu de usuário no Header com link para "Área do Cliente" e botão de sair.
## [2025-06-09] Adicionado o uso do rawEnvKey nas requisições para o asaas.
## [2025-06-09] Removida pagina duplicada de login na loja e criado redirecionamento para /login.
## [2025-06-10] Adicionado componente CartPreview com documentação no Storybook.
## [2025-06-10] Implementado AuthModal com Login e Cadastro e integrado ao Header e páginas de produto.
## [2025-06-10] Atualizado arquitetura.md incluindo seções de carrinho, categorias, checkout, cliente e login na pasta `/app/loja`.
## [2025-06-10] Adicionados testes de cadastro/checkout e documentação do fluxo no README.
## [2025-06-10] README traduzido e introducao atualizada; adicionada nota de personalizacao.
## [2025-06-10] Atualizadas classes de cor para uso de bg-primary-* e text-primary-* nas páginas e docs.
## [2025-06-10] Padronizada sintaxe theme('colors.*') em globals.css e stories para compatibilidade com Tailwind.
## [2025-06-10] README atualizado incluindo novo endpoint /checkouts

## [2025-06-10] Documentada diferença entre inscrições e compras de loja no README
## [2025-06-11] Documentado endpoint /admin/api/asaas/checkout no README
## [2025-06-10] Adicionadas tarefas para checkout Asaas em docs/tarefas-checkout-asaas.md
## [2025-06-10] Atualizado fluxo de checkout para usar Checkout Pronto do Asaas em README e docs.
## [2025-06-11] Atualizado cadastro com novos campos e payload do checkout
## [2025-06-11] Foto do produto (base64) agora enviada no item do checkout, removida do cadastro de usuário
## [2025-06-11] Atualizado cadastro com novos campos e payload do checkout
## [2025-06-11] Foto do produto (base64) agora enviada no item do checkout, removida do cadastro de usuário
## [2025-06-11] Incluídos campos de endereço no cadastro e adequação do payload do checkout ao novo modelo do Asaas
## [2025-06-12] Exibidos detalhes de cor, tamanho e modelo no carrinho e checkout com aviso de cadastro obrigatório
## [2025-06-12] Cores do carrinho e checkout agora exibem nome da cor
## [2025-06-12] Exibidos detalhes de cor, tamanho e modelo no carrinho e checkout com aviso de cadastro obrigatório
## [2025-06-11] Atualizado cadastro com novos campos e payload do checkout
## [2025-06-11] Foto do produto (base64) agora enviada no item do checkout, removida do cadastro de usuário
## [2025-06-11] Incluídos campos de endereço no cadastro e adequação do payload do checkout ao novo modelo do Asaas
## [2025-06-12] Ajustado checkout para enviar dados completos do cliente e imagens dos produtos; página de checkout atualizada com novos campos
## [2025-06-12] Checkout carrega cpf, endereço e inclui data de nascimento
## [2025-06-12] Criada página /loja/perfil com inputs de CPF, telefone e data de nascimento. Atualizados Header e rotas da loja para incluir o novo caminho.
## [2025-06-12] Ajustado contexto de autenticação para armazenar tenantId e filtros multi-tenant
## [2025-06-13] Documentado formato de externalReference e atualizados testes de checkout
## [2025-06-13] README atualizado sobre ASAAS_API_KEY e .env.example ajustado
## [2025-06-12] Documentada coleção de compras e página no admin
## [2025-06-13] Documentado acesso restrito de /admin/compras aos coordenadores e atualizada proteção do código
## [2025-06-13] Adicionada página Minhas compras na loja e link no menu do usuário
## [2025-06-13] Adicionadas páginas de detalhes de compras e links na listagem.
## [2025-06-12] Adicionado guia iniciar-tour.md com passo a passo para clientes
## [2025-06-12] Criada página /iniciar-tour com guia de primeiro acesso e link atualizado no README
## [2025-06-12] Removido link Iniciar Tour do menu; adicionado ícone de tour junto ao sino
## [2025-06-12] Campo booleano 'tour' registrado para usuários e link Compras incluído no header
## [2025-06-12] Ícone de tour e página /admin/compras restritos ao admin; link público removido

## [2025-06-12] Adicionadas propriedades tipo_dominio, verificado e modo_validacao ao tipo Cliente.
## [2025-06-12] Adicionada tabela de campos em docs/plano-negocio.md incluindo tipo_dominio, verificado e modo_validacao

## [2025-06-12] Removida variavel NEXT_PUBLIC_TENANT_ID e implementada logica para obter tenant pelo host.

## [2025-06-12] Atualizados README e plano-negocio sobre getTenantFromHost e remoção do NEXT_PUBLIC_TENANT_ID.
## [2025-06-13] Documentadas seções de LoadingOverlay, SmoothTabs e ModalAnimated no design system.
## [2025-06-12] Corrigido uso da variável PB_URL na rota de recuperação de link. Agora utiliza NEXT_PUBLIC_PB_URL e README/.env.example atualizados. Impacto: padronização das variáveis de ambiente.
## [2025-06-14] Removidas entradas duplicadas de dependências e atualizado package-lock.json.
## [2025-06-14] Personalizacao salva nos campos cor_primary, logo_url e font da colecao clientes_config
## [2025-06-13] Documentada persistência das configurações no design system.
## [2025-06-15] Documentadas rotas de saldo e transferencia do Asaas no README e novo guia saldo-transferencia-asaas.md.
## [2025-06-13] Especificado no README que apenas coordenadores visualizam métricas financeiras; líderes veem somente contagens de inscrições e pedidos.
## [2025-06-13] DashboardAnalytics agora aceita mostrarFinanceiro para ocultar seções com valores
## [2025-06-16] Páginas Saldo e Transferências criadas com extrato exportável em PDF/XLSM. README e guia atualizados.
## [2025-06-16] Rota /admin/api/asaas/extrato atualizada para requireClienteFromHost e docs revisados.
## [2025-06-16] README e guia atualizados mencionando uso de /finance/transactions no extrato com mesmo cabeçalho de saldo.
## [2025-06-16] Extrato agora usa /financialTransactions e define offset, limit e order=asc.

## [2025-06-16] BankAccountModal criado com busca BrasilAPI e registro em clientes_contas_bancarias. Documentação e testes adicionados.
## [2025-06-16] Documentada variavel NEXT_PUBLIC_BRASILAPI_URL e formulario usa BrasilAPI
## [2025-06-16] Botão Nova conta integrado à página de Transferências com o BankAccountModal.

## [2025-06-17] BankAccountModal criado com busca BrasilAPI e registro em clientes_contas_bancarias. Documentação e testes adicionados.
## [2025-06-16] Documentada variavel NEXT_PUBLIC_BRASILAPI_URL e formulario usa BrasilAPI
## [2025-06-16] Documentada variavel NEXT_PUBLIC_N8N_WEBHOOK_URL e InscricaoForm usa URL do env. Impacto: integração n8n configurável.

## [2025-06-17] Atualizado Header removendo links de Inscricoes e Pedidos para lideres. Lint sem erros; build falhou em app/blog/post/[slug]/page.tsx.
## [2025-06-17] Menu Configurações restrito a coordenadores no Header e mobile. Lint e build executados com sucesso.
## [2025-06-17] Adicionada utilidade getTenantFromClient, atualizadas páginas da loja para buscá-lo e novos testes.
## [2025-06-25] Links de administração ajustados por papel no Header. Teste criado para validar comportamentos. Lint e build executados.
## [2025-06-26] Documentada sequência de carregamento de personalização no design system. Lint e build executados.
## [2025-06-26] Atualizada seção Personalização em docs/design-system.md com nova sequência de carregamento e busca pelo campo cliente.
## [2025-06-25] Registrado erro 404 ao ler clientes_config e correção documentada. - Lint: falhou (next not found) - Build: falhou (next not found)
## [2025-06-17] Especificado que o AppConfigProvider verifica o `localStorage` antes de requisitar `/api/tenant` e `clientes_config`, usando sempre o campo `cliente` na busca. Documentação esclarecida.
## [2025-06-26] Guia design-system revisado explicando busca por cliente. - Lint: falhou (next not found) - Build: falhou (next not found).
## [2025-06-27] Página de detalhes dos eventos adicionada em /loja/eventos/[id] com formulário pré-preenchido. Botão da listagem atualizado.
## [2025-06-27] InscricaoForm agora carrega dados do usuario, consulta CEP pela URL configurada e envia para o webhook mesmo em caso de erro. Lint e build executados com sucesso.
## [2025-06-17] Carrinho agora diferencia variações por ID único e páginas de carrinho/checkout exibem itens separadamente.
## [2025-06-17] Página de detalhes de eventos convertida para componente server e verificados botões de inscrição. Lint e build executados.
## [2025-06-28] Criada rota /loja/api/minhas-inscricoes filtrando por usuário e nova seção em /loja/cliente exibindo inscrições.

## [2025-06-17] Criado endpoint /loja/api/inscricoes e página de confirmação; formulário atualizado para usar nova rota. Lint e build executados.
## [2025-06-28] Inclusão do bairro no autofill do InscricaoForm.
## [2025-06-17] Tratamento de erro em /loja/api/inscricoes aprimorado usando ClientResponseError. Lint e build executados.
## [2025-06-17] Ajustadas chamadas PocketBase em /admin para tipagens genéricas, evitando uso de `any`. Lint e build executados.
## [2025-06-30] Callback do Asaas usa URLs do cliente e user-agent com nome do tenant. Lint e build executados.
## [2025-07-01] README atualizado explicando que toasts são o padrão para feedback. Impacto: documentação mais clara.
## [2025-06-17] Tratamento de erro em /loja/api/inscricoes aprimorado usando ClientResponseError. Lint e build executados.

## [2025-06-17] Atualizada mensagem 409 em inscricoes
## [2025-06-18] Implementada utilidade de taxas do Asaas e cálculo reverso nas rotas de checkout e cobrança. - Lint: falhou (next not found) - Build: falhou (next not found)
## [2025-07-02] Documentação atualizada indicando `npm install` antes de rodar lint, build ou testes. Nota adicionada ao CONTRIBUTING. Impacto: evitar erros por dependências ausentes.
## [2025-07-03] Atualizados exemplos de chamadas ao endpoint `/admin/api/asaas` com os campos `valorBruto`, `paymentMethod` e `installments`. Lint e build executados.
## [2025-07-04] Adicionada regra de exibição do total no checkout em docs/plano_calculo_cobrancas.md.
## [2025-07-05] Campo `confirma_inscricoes` documentado e suportado pelo AppConfig. Lint e build executados.
## [2025-07-05] Guia iniciar-tour atualizado explicando checkbox Modo de Demonstração em Configurações. Lint e build executados.
## [2025-07-05] Exibido total bruto na página de inscrição e teste atualizado. Lint e build executados.

## [2025-07-06] Guia iniciar-tour complementado com explicações sobre a opção "Confirmar inscrições manualmente?" e cobranças automáticas em eventos com `cobra_inscricao`. - Lint: falhou (next not found) - Build: falhou (next not found)
## [2025-07-07] Payload PIX atualizado com `operationType` e exemplos revisados no README e guia de saldo. - Lint: falhou (next not found) - Build: falhou (next not found)
## [2025-06-19] Removida documentação da coleção compras e rotas associadas. Campo `canal` descrito em Pedido. Lint e build executados.
## [2025-06-19] Coleção `compras` removida e campo `canal` adicionado ao tipo Pedido. Impacto: simplificação dos registros de vendas.
