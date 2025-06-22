| Arquivo | Função / Export | Rota | Objetivo |
| ------- | --------------- | ---- | -------- |
| app/admin/api/asaas/estatisticas/route.ts | GET | /admin/api/asaas/estatisticas | Endpoint admin para asaas/estatisticas (GET) |
| app/admin/api/asaas/extrato/route.ts | GET | /admin/api/asaas/extrato | Endpoint admin para asaas/extrato (GET) |
| app/admin/api/asaas/saldo/route.ts | GET | /admin/api/asaas/saldo | Endpoint admin para asaas/saldo (GET) |
| app/admin/api/asaas/transferencia/route.ts | POST, DELETE | /admin/api/asaas/transferencia | Endpoint admin para asaas/transferencia (POST, DELETE) |
| app/admin/api/asaas/webhook/route.ts | POST | /admin/api/asaas/webhook | Endpoint admin para asaas/webhook (POST) |
| app/admin/api/bank-accounts/route.ts | GET, POST | /admin/api/bank-accounts | Endpoint admin para bank accounts (GET, POST) |
| app/admin/api/campos/[id]/route.ts | PUT, DELETE | /admin/api/campos/[id] | Endpoint admin para campos/id (PUT, DELETE) |
| app/admin/api/campos/route.ts | GET, POST | /admin/api/campos | Endpoint admin para campos (GET, POST) |
| app/admin/api/categorias/[id]/route.ts | PUT, DELETE | /admin/api/categorias/[id] | Endpoint admin para categorias/id (PUT, DELETE) |
| app/admin/api/categorias/route.ts | GET, POST | /admin/api/categorias | Endpoint admin para categorias (GET, POST) |
| app/admin/api/clientes/[id]/route.ts | PUT | /admin/api/clientes/[id] | Endpoint admin para clientes/id (PUT) |
| app/admin/api/clientes/route.ts | GET | /admin/api/clientes | Endpoint admin para clientes (GET) |
| app/admin/api/configuracoes/route.ts | GET, PUT | /admin/api/configuracoes | Endpoint admin para configuracoes (GET, PUT) |
| app/admin/api/eventos/[id]/route.ts | GET, PUT, DELETE | /admin/api/eventos/[id] | Endpoint admin para eventos/id (GET, PUT, DELETE) |
| app/admin/api/eventos/route.ts | GET, POST | /admin/api/eventos | Endpoint admin para eventos (GET, POST) |
| app/admin/api/pix-keys/route.ts | GET, POST | /admin/api/pix-keys | Endpoint admin para pix keys (GET, POST) |
| app/admin/api/posts/[slug]/route.ts | GET | /admin/api/posts/[slug] | Endpoint admin para posts/slug (GET) |
| app/admin/api/posts/route.ts | POST | /admin/api/posts | Endpoint admin para posts (POST) |
| app/admin/api/produtos/[id]/route.ts | GET, PUT, DELETE | /admin/api/produtos/[id] | Endpoint admin para produtos/id (GET, PUT, DELETE) |
| app/admin/api/produtos/route.ts | GET, POST | /admin/api/produtos | Endpoint admin para produtos (GET, POST) |
| app/admin/api/recuperar-link/route.ts | POST | /admin/api/recuperar-link | Endpoint admin para recuperar link (POST) |
| app/admin/api/usuarios/[id]/route.ts | GET | /admin/api/usuarios/[id] | Endpoint admin para usuarios/id (GET) |
| app/admin/api/usuarios/route.ts | GET, POST | /admin/api/usuarios | Endpoint admin para usuarios (GET, POST) |
| app/admin/campos/page.tsx | GerenciarCamposPage | /admin/campos | Página admin/campos |
| app/admin/clientes/components/ListaClientes.tsx | ListaClientes |  | Componente UI ListaClientes |
| app/admin/clientes/page.tsx | ClientesPage | /admin/clientes | Página admin/clientes |
| app/admin/components/BackToTopButton.tsx | BackToTopButton |  | Componente UI BackToTopButton |
| app/admin/components/DashboardAnalytics.tsx | DashboardAnalytics |  | Componente UI DashboardAnalytics |
| app/admin/components/NotificationBell.tsx | NotificationBell |  | Componente UI NotificationBell |
| app/admin/components/RedefinirSenhaModal.tsx | RedefinirSenhaModal |  | Componente UI RedefinirSenhaModal |
| app/admin/components/TooltipIcon.tsx | TooltipIcon |  | Componente UI TooltipIcon |
| app/admin/components/TourIcon.tsx | TourIcon |  | Componente UI TourIcon |
| app/admin/configuracoes/page.tsx | ConfiguracoesPage | /admin/configuracoes | Página admin/configuracoes |
| app/admin/dashboard/components/DashboardResumo.tsx | DashboardResumo |  | Componente UI DashboardResumo |
| app/admin/dashboard/page.tsx | DashboardPage | /admin/dashboard | Página admin/dashboard |
| app/admin/erro/page.tsx | ErroPage | /admin/erro | Página admin/erro |
| app/admin/eventos/editar/[id]/page.tsx | EditarEventoPage | /admin/eventos/editar/[id] | Página admin/eventos/editar/id |
| app/admin/eventos/novo/page.tsx | NovoEventoPage | /admin/eventos/novo | Página admin/eventos/novo |
| app/admin/eventos/page.tsx | AdminEventosPage | /admin/eventos | Página admin/eventos |
| app/admin/financeiro/page.tsx | FinanceiroPage | /admin/financeiro | Página admin/financeiro |
| app/admin/financeiro/saldo/page.tsx | SaldoPage | /admin/financeiro/saldo | Página admin/financeiro/saldo |
| app/admin/financeiro/transferencias/components/TransferenciaForm.tsx | TransferenciaForm |  | Componente UI TransferenciaForm |
| app/admin/financeiro/transferencias/modals/BankAccountModal.tsx | BankAccountModal |  | Código auxiliar |
| app/admin/financeiro/transferencias/page.tsx | TransferenciasPage | /admin/financeiro/transferencias | Página admin/financeiro/transferencias |
| app/admin/inscricoes/componentes/ModalEdit.tsx | ModalEditarInscricao |  | Código auxiliar |
| app/admin/inscricoes/componentes/ModalVisualizarPedido.tsx | ModalVisualizarPedido |  | Código auxiliar |
| app/admin/inscricoes/page.tsx | ListaInscricoesPage | /admin/inscricoes | Página admin/inscricoes |
| app/admin/inscricoes/recuperar/page.tsx | RecuperarPagamentoPage | /admin/inscricoes/recuperar | Página admin/inscricoes/recuperar |
| app/admin/layout.tsx | RootLayout, metadata | /admin | Código auxiliar |
| app/admin/lider-painel/page.tsx | LiderDashboardPage | /admin/lider-painel | Página admin/lider painel |
| app/admin/not-found.tsx | NotFound |  | Código auxiliar |
| app/admin/obrigado/page.tsx | ObrigadoPage | /admin/obrigado | Página admin/obrigado |
| app/admin/page.tsx | AdminIndex | /admin | Página admin |
| app/admin/pedidos/componentes/ModalEditarPedido.tsx | ModalEditarPedido |  | Código auxiliar |
| app/admin/pedidos/page.tsx | PedidosPage | /admin/pedidos | Página admin/pedidos |
| app/admin/pendente/page.tsx | PagamentoPendentePage | /admin/pendente | Página admin/pendente |
| app/admin/perfil/components/ModalEditarPerfil.tsx | ModalEditarPerfil |  | Componente UI ModalEditarPerfil |
| app/admin/perfil/page.tsx | PerfilPage | /admin/perfil | Página admin/perfil |
| app/admin/posts/components/EditorToolbar.tsx | EditorToolbar |  | Componente UI EditorToolbar |
| app/admin/posts/components/PostContentEditor.tsx | PostMarkdownEditor |  | Componente UI PostContentEditor |
| app/admin/posts/editar/[slug]/page.tsx | EditarPostPage | /admin/posts/editar/[slug] | Página admin/posts/editar/slug |
| app/admin/posts/novo/page.tsx | NovoPostPage | /admin/posts/novo | Página admin/posts/novo |
| app/admin/posts/page.tsx | AdminPostsPage | /admin/posts | Página admin/posts |
| app/admin/produtos/categorias/ModalCategoria.tsx | ModalCategoria |  | Código auxiliar |
| app/admin/produtos/categorias/page.tsx | CategoriasAdminPage | /admin/produtos/categorias | Página admin/produtos/categorias |
| app/admin/produtos/editar/[id]/page.tsx | EditarProdutoPage | /admin/produtos/editar/[id] | Página admin/produtos/editar/id |
| app/admin/produtos/novo/ModalProduto.tsx | ModalProduto |  | Código auxiliar |
| app/admin/produtos/page.tsx | AdminProdutosPage | /admin/produtos | Página admin/produtos |
| app/admin/redefinir-senha/RedefinirSenhaClient.tsx | RedefinirSenhaClient |  | Código auxiliar |
| app/admin/redefinir-senha/page.tsx | RedefinirSenhaPage | /admin/redefinir-senha | Página admin/redefinir senha |
| app/admin/usuarios/novo/page.tsx | NovoUsuarioPage | /admin/usuarios/novo | Página admin/usuarios/novo |
| app/admin/usuarios/page.tsx | UsuariosPage | /admin/usuarios | Página admin/usuarios |
| app/api/asaas/checkout/route.ts | POST | /api/asaas/checkout | Endpoint para asaas/checkout (POST) |
| app/api/asaas/route.ts | POST | /api/asaas | Endpoint para asaas (POST) |
| app/api/asaas/webhook/route.ts | POST | /api/asaas/webhook | Endpoint para asaas/webhook (POST) |
| app/api/auth/login/route.ts | POST | /api/auth/login | Endpoint para auth/login (POST) |
| app/api/auth/logout/route.ts | POST | /api/auth/logout | Endpoint para auth/logout (POST) |
| app/api/auth/me/route.ts | GET | /api/auth/me | Endpoint para auth/me (GET) |
| app/api/campos/route.ts | GET, POST | /api/campos | Endpoint para campos (GET, POST) |
| app/api/checkout-link/route.ts | GET | /api/checkout-link | Endpoint para checkout link (GET) |
| app/api/eventos/[id]/route.ts | GET | /api/eventos/[id] | Endpoint para eventos/id (GET) |
| app/api/eventos/route.ts | GET | /api/eventos | Endpoint para eventos (GET) |
| app/api/inscricoes/[id]/route.ts | DELETE | /api/inscricoes/[id] | Endpoint para inscricoes/id (DELETE) |
| app/api/inscricoes/route.ts | GET, POST | /api/inscricoes | Endpoint para inscricoes (GET, POST) |
| app/api/lider/[id]/route.ts | GET | /api/lider/[id] | Endpoint para lider/id (GET) |
| app/api/n8n/route.ts | POST | /api/n8n | Endpoint para n8n (POST) |
| app/api/pedidos/[id]/route.ts | GET, PATCH, DELETE | /api/pedidos/[id] | Endpoint para pedidos/id (GET, PATCH, DELETE) |
| app/api/pedidos/route.ts | GET, POST | /api/pedidos | Endpoint para pedidos (GET, POST) |
| app/api/posts/[slug]/route.ts | GET | /api/posts/[slug] | Endpoint para posts/slug (GET) |
| app/api/posts/route.ts | GET | /api/posts | Endpoint para posts (GET) |
| app/api/produtos/[slug]/route.ts | GET | /api/produtos/[slug] | Endpoint para produtos/slug (GET) |
| app/api/produtos/route.ts | GET | /api/produtos | Endpoint para produtos (GET) |
| app/api/register/route.ts | POST | /api/register | Endpoint para register (POST) |
| app/api/signup/route.ts | POST | /api/signup | Endpoint para signup (POST) |
| app/api/tenant-config/route.ts | GET, PUT | /api/tenant-config | Endpoint para tenant config (GET, PUT) |
| app/api/tenant/route.ts | GET | /api/tenant | Endpoint para tenant (GET) |
| app/api/usuario/atualizar-dados/route.ts | PATCH | /api/usuario/atualizar-dados | Endpoint para usuario/atualizar dados (PATCH) |
| app/api/usuarios/[id]/route.ts | GET, PATCH | /api/usuarios/[id] | Endpoint para usuarios/id (GET, PATCH) |
| app/api/usuarios/confirm-password-reset/route.ts | POST | /api/usuarios/confirm-password-reset | Endpoint para usuarios/confirm password reset (POST) |
| app/api/usuarios/password-reset/route.ts | POST | /api/usuarios/password-reset | Endpoint para usuarios/password reset (POST) |
| app/blog/layout.tsx | BlogLayout | /blog | Código auxiliar |
| app/blog/page.tsx | generateMetadata, BlogPage | /blog | Página blog |
| app/blog/post/[slug]/page.tsx | generateStaticParams, generateMetadata, dynamic | /blog/post/[slug] | Página blog/post/slug |
| app/campos/page.tsx | GerenciarCamposPage | /campos | Página campos |
| app/cliente/components/DashboardHeader.tsx | DashboardHeader |  | Componente UI DashboardHeader |
| app/cliente/components/InscricoesTable.tsx | InscricoesTable |  | Componente UI InscricoesTable |
| app/cliente/components/PedidosTable.tsx | PedidosTable |  | Componente UI PedidosTable |
| app/cliente/components/ProfileForm.tsx | ProfileForm |  | Componente UI ProfileForm |
| app/cliente/components/Sidebar.tsx | Sidebar |  | Componente UI Sidebar |
| app/cliente/dashboard/page.tsx | DashboardPage | /cliente/dashboard | Página cliente/dashboard |
| app/cliente/inscricoes/page.tsx | InscricoesPage | /cliente/inscricoes | Página cliente/inscricoes |
| app/cliente/layout.tsx | ClientLayout | /cliente | Código auxiliar |
| app/cliente/pedidos/page.tsx | PedidosPage | /cliente/pedidos | Página cliente/pedidos |
| app/cliente/perfil/page.tsx | PerfilPage | /cliente/perfil | Página cliente/perfil |
| app/completar-cadastro/page.tsx | CompletarCadastroPage | /completar-cadastro | Página completar cadastro |
| app/iniciar-tour/page.tsx | generateMetadata, IniciarTourPage | /iniciar-tour | Página iniciar tour |
| app/inscricoes/lider/[liderId]/evento/[eventoId]/page.tsx | InscricaoPage | /inscricoes/lider/[liderId]/evento/[eventoId] | Página inscricoes/lider/liderId/evento/eventoId |
| app/inscricoes/lider/[liderId]/page.tsx | EscolherEventoPage | /inscricoes/lider/[liderId] | Página inscricoes/lider/liderId |
| app/inscricoes/lider/evento/page.tsx | CadastroViaLider | /inscricoes/lider/evento | Página inscricoes/lider/evento |
| app/inscricoes/obrigado/page.tsx | ObrigadoPage | /inscricoes/obrigado | Página inscricoes/obrigado |
| app/layout.tsx | metadata |  | Código auxiliar |
| app/login/page.tsx | LoginPage | /login | Página login |
| app/loja/api/inscricoes/route.ts | POST | /loja/api/inscricoes | Endpoint para inscricoes (POST) |
| app/loja/api/minhas-inscricoes/route.ts | GET | /loja/api/minhas-inscricoes | Endpoint para minhas inscricoes (GET) |
| app/loja/api/pedidos/route.ts | GET | /loja/api/pedidos | Endpoint para pedidos (GET) |
| app/loja/carrinho/metadata.ts | generateMetadata |  | Código auxiliar |
| app/loja/carrinho/page.tsx | CarrinhoPage | /loja/carrinho | Página loja/carrinho |
| app/loja/categorias/[slug]/metadata.ts | generateMetadata |  | Código auxiliar |
| app/loja/categorias/metadata.ts | generateMetadata |  | Código auxiliar |
| app/loja/categorias/page.tsx | dynamic | /loja/categorias | Página loja/categorias |
| app/loja/checkout/metadata.ts | generateMetadata |  | Código auxiliar |
| app/loja/checkout/page.tsx | CheckoutPage | /loja/checkout | Página loja/checkout |
| app/loja/cliente/metadata.ts | generateMetadata |  | Código auxiliar |
| app/loja/cliente/page.tsx | AreaCliente | /loja/cliente | Página loja/cliente |
| app/loja/eventos/[id]/metadata.ts | generateMetadata |  | Código auxiliar |
| app/loja/eventos/metadata.ts | generateMetadata |  | Código auxiliar |
| app/loja/eventos/page.tsx | EventosFormPage | /loja/eventos | Página loja/eventos |
| app/loja/inscricoes/confirmacao/metadata.ts | generateMetadata |  | Código auxiliar |
| app/loja/inscricoes/confirmacao/page.tsx | ConfirmacaoInscricaoPage | /loja/inscricoes/confirmacao | Página loja/inscricoes/confirmacao |
| app/loja/layout.tsx | RootLayout | /loja | Código auxiliar |
| app/loja/login/metadata.ts | generateMetadata |  | Código auxiliar |
| app/loja/login/route.ts | GET | /loja/login | Código auxiliar |
| app/loja/metadata.ts | generateMetadata |  | Código auxiliar |
| app/loja/not-found.tsx | NotFound |  | Código auxiliar |
| app/loja/page.tsx | Home | /loja | Página loja |
| app/loja/perfil/metadata.ts | generateMetadata |  | Código auxiliar |
| app/loja/perfil/page.tsx | PerfilPage | /loja/perfil | Página loja/perfil |
| app/loja/produtos/[slug]/metadata.ts | generateMetadata |  | Código auxiliar |
| app/loja/produtos/[slug]/page.tsx | ProdutoDetalhe | /loja/produtos/[slug] | Página loja/produtos/slug |
| app/loja/produtos/metadata.ts | generateMetadata |  | Código auxiliar |
| app/loja/produtos/page.tsx | dynamic | /loja/produtos | Página loja/produtos |
| app/loja/sucesso/metadata.ts | generateMetadata |  | Código auxiliar |
| app/not-found.tsx | NotFound |  | Código auxiliar |
| app/page.tsx | Home |  | Página page.tsx |
| app/signup/page.tsx | SignUpPage | /signup | Página signup |
| components/admin/ModalProdutoForm.tsx | ModalProdutoForm |  | Componente UI ModalProdutoForm |
| components/admin/index.ts | default |  | Componente UI index |
| components/atoms/Button.tsx | Button |  | Componente UI Button |
| components/atoms/Spinner.tsx | Spinner |  | Componente UI Spinner |
| components/atoms/TextField.tsx | TextField |  | Componente UI TextField |
| components/atoms/ToggleSwitch.tsx | ToggleSwitch |  | Componente UI ToggleSwitch |
| components/atoms/index.ts | Button, TextField, default |  | Componente UI index |
| components/molecules/AddToCartButton.tsx | AddToCartButton |  | Componente UI AddToCartButton |
| components/molecules/CartButton.tsx | CartButton |  | Componente UI CartButton |
| components/molecules/CartPreview.tsx | CartPreview |  | Componente UI CartPreview |
| components/molecules/FormField.tsx | FormField |  | Componente UI FormField |
| components/molecules/InputWithMask.tsx | InputWithMask |  | Componente UI InputWithMask |
| components/molecules/MdxRenderer.tsx | MdxRenderer |  | Componente UI MdxRenderer |
| components/molecules/NextPostButton.tsx | NextPostButton |  | Componente UI NextPostButton |
| components/molecules/SaldoCard.tsx | SaldoCard |  | Componente UI SaldoCard |
| components/molecules/SmoothTabs.tsx | SmoothTabs |  | Componente UI SmoothTabs |
| components/molecules/index.ts | FormField, InputWithMask, default |  | Componente UI index |
| components/organisms/AuthModal.tsx | AuthModal |  | Componente UI AuthModal |
| components/organisms/BlogClient.tsx | BlogClient |  | Componente UI BlogClient |
| components/organisms/BlogHeroCarousel.tsx | BlogHeroCarousel |  | Componente UI BlogHeroCarousel |
| components/organisms/BlogPostsList.tsx | BlogPostsList |  | Componente UI BlogPostsList |
| components/organisms/BlogSidebar.tsx | BlogSidebar |  | Componente UI BlogSidebar |
| components/organisms/EventForm.tsx | EventForm |  | Componente UI EventForm |
| components/organisms/FormWizard.tsx | FormWizard |  | Componente UI FormWizard |
| components/organisms/Hero.tsx | BlogHeroCarousel |  | Componente UI Hero |
| components/organisms/InscricaoForm.tsx | InscricaoForm |  | Componente UI InscricaoForm |
| components/organisms/InscricaoLojaWizard.tsx | InscricaoLojaWizard |  | Componente UI InscricaoLojaWizard |
| components/organisms/InscricaoWizard.tsx | InscricaoWizard |  | Componente UI InscricaoWizard |
| components/organisms/LoadingOverlay.tsx | LoadingOverlay |  | Componente UI LoadingOverlay |
| components/organisms/ModalAnimated.tsx | ModalAnimated |  | Componente UI ModalAnimated |
| components/organisms/PostSuggestions.tsx | PostSuggestions |  | Componente UI PostSuggestions |
| components/organisms/ProdutoInterativo.tsx | ProdutoInterativo |  | Componente UI ProdutoInterativo |
| components/organisms/ProdutosFiltrados.tsx | ProdutosFiltrados |  | Componente UI ProdutosFiltrados |
| components/organisms/ProdutosFiltradosCategoria.tsx | ProdutosFiltrados |  | Componente UI ProdutosFiltradosCategoria |
| components/organisms/index.ts | default |  | Componente UI index |
| components/templates/Footer.tsx | Footer |  | Template/Layout Footer |
| components/templates/FooterLoja.tsx | Footer |  | Template/Layout FooterLoja |
| components/templates/Header.tsx | Header |  | Template/Layout Header |
| components/templates/HeaderAdmin.tsx | Header |  | Template/Layout HeaderAdmin |
| components/templates/HeaderLoja.tsx | Header |  | Template/Layout HeaderLoja |
| components/templates/LayoutWrapper.tsx | LayoutWrapper |  | Template/Layout LayoutWrapper |
| components/templates/LayoutWrapperAdmin.tsx | LayoutWrapper |  | Template/Layout LayoutWrapperAdmin |
| components/templates/LoginForm.tsx | LoginForm |  | Template/Layout LoginForm |
| components/templates/SignUpForm.tsx | SignUpForm |  | Template/Layout SignUpForm |
| components/templates/index.ts | default |  | Template/Layout index |
| lib/apiAuth.ts | requireRole |  | Funções utilitárias (apiAuth.ts) |
| lib/asaas.ts | buildCheckoutUrl, buildExternalReference, createCheckout |  | Funções utilitárias (asaas.ts) |
| lib/asaasFees.ts | getAsaasFees, calculateGross, calculateNet |  | Funções utilitárias (asaasFees.ts) |
| lib/bankAccounts.ts | searchBanks, createBankAccount, createPixKey, getPixKeysByTenant, getBankAccountsByTenant, fetchBankAccounts, fetchPixKeys, createBankAccountApi, createPixKeyApi |  | Funções utilitárias (bankAccounts.ts) |
| lib/chartSetup.ts | setupCharts |  | Funções utilitárias (chartSetup.ts) |
| lib/clienteAuth.ts | requireClienteFromHost |  | Funções utilitárias (clienteAuth.ts) |
| lib/constants.ts | MAX_ITEM_NAME_LENGTH, MAX_ITEM_DESCRIPTION_LENGTH |  | Funções utilitárias (constants.ts) |
| lib/context/AuthContext.tsx | AuthProvider, useAuthContext |  | Funções utilitárias (AuthContext.tsx) |
| lib/context/CartContext.tsx | CartProvider, useCart |  | Funções utilitárias (CartContext.tsx) |
| lib/context/TenantContext.tsx | TenantProvider, useTenant, defaultConfig |  | Funções utilitárias (TenantContext.tsx) |
| lib/context/ThemeContext.tsx | ThemeProvider, useTheme |  | Funções utilitárias (ThemeContext.tsx) |
| lib/context/ToastContext.tsx | ToastProvider, useToast |  | Funções utilitárias (ToastContext.tsx) |
| lib/events.ts | atualizarStatus |  | Funções utilitárias (events.ts) |
| lib/fetchTenantConfig.ts | fetchTenantConfig |  | Funções utilitárias (fetchTenantConfig.ts) |
| lib/flows/orderFlow.ts | criarPedido, criarInscricao |  | Funções utilitárias (orderFlow.ts) |
| lib/getTenantFromHost.ts | getTenantFromHost |  | Funções utilitárias (getTenantFromHost.ts) |
| lib/getUserFromHeaders.ts | getUserFromHeaders |  | Funções utilitárias (getUserFromHeaders.ts) |
| lib/hooks/useAuth.ts | useAuth |  | Funções utilitárias (useAuth.ts) |
| lib/hooks/useAuthGuard.ts | useAuthGuard |  | Funções utilitárias (useAuthGuard.ts) |
| lib/hooks/useInscricoes.ts | useInscricoes |  | Funções utilitárias (useInscricoes.ts) |
| lib/hooks/useProdutos.ts | useProdutos |  | Funções utilitárias (useProdutos.ts) |
| lib/hooks/useSyncTenant.ts | useSyncTenant |  | Funções utilitárias (useSyncTenant.ts) |
| lib/logger.ts | logInfo |  | Funções utilitárias (logger.ts) |
| lib/paymentMethodMap.ts | toAsaasBilling |  | Funções utilitárias (paymentMethodMap.ts) |
| lib/pbWithAuth.ts | getPocketBaseFromRequest |  | Funções utilitárias (pbWithAuth.ts) |
| lib/pocketbase.ts | createPocketBase, updateBaseAuth, clearBaseAuth |  | Funções utilitárias (pocketbase.ts) |
| lib/posts/getPostBySlug.ts | getPostBySlug |  | Funções utilitárias (getPostBySlug.ts) |
| lib/posts/getPostsClientPB.ts | getPostsClientPB |  | Funções utilitárias (getPostsClientPB.ts) |
| lib/posts/getPostsFromPB.ts | getPostsFromPB |  | Funções utilitárias (getPostsFromPB.ts) |
| lib/posts/getPostsPocketBase.ts | listPosts, getRecentPosts |  | Funções utilitárias (getPostsPocketBase.ts) |
| lib/posts/getRecentPostsPB.ts | getRecentPostsPB |  | Funções utilitárias (getRecentPostsPB.ts) |
| lib/posts/getRelatedPosts.ts | getRelatedPosts |  | Funções utilitárias (getRelatedPosts.ts) |
| lib/posts/getRelatedPostsFromPB.ts | getRelatedPostsFromPB |  | Funções utilitárias (getRelatedPostsFromPB.ts) |
| lib/products.ts | filtrarProdutos |  | Funções utilitárias (products.ts) |
| lib/products/getProductBySlug.ts | getProductBySlug |  | Funções utilitárias (getProductBySlug.ts) |
| lib/server/logger.ts | logConciliacaoErro |  | Funções utilitárias (logger.ts) |
| lib/services/pocketbase.ts | fetchInscricoes, fetchProdutos, fetchUsuario |  | Funções utilitárias (pocketbase.ts) |
| lib/templates/inscricao.ts | criarInscricao |  | Template/Layout inscricao |
