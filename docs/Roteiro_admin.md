// joyrideRoteiros.js
// Roteiros de tours via react-joyride para o Painel Admin

# Joyride Roteiros

Este **Markdown** documenta os roteiros de tours via `react-joyride` para o **Painel Admin**.

## Implementação

- Utilize seletores estáveis (p.ex.: `data-attribute` ou classes específicas).
- **Padrão atual:** todos os elementos têm `data-tour="..."` para facilitar a localização.
- Ajuste `placement`, `offset` e, se necessário, `delay` para garantir exibição responsiva.
- Importe e mapeie cada rota `admin/*` ao seu tour correspondente.
- Para rotas dinâmicas (ex.: `admin/financeiro/saldo`), registre lógica condicional.
- Teste cada step em homologação e produção para validar seletores.

export const adminDashboardTour = [
{ target: 'body', content: 'Visão geral do Painel de Coordenação: métricas, filtros, exportações e gráficos.', placement: 'top' },
{ target: 'h1', content: 'Título principal do Painel de Coordenação.', placement: 'bottom' },
{ target: '.stats-overview .stats-card', content: 'Cards com métricas de inscrições, pedidos e valores.', placement: 'right' },
{ target: '[data-tour="dashboard-filter"]', content: 'Filtros e seleção de período para análise temporal.', placement: 'bottom' },
{ target: '[data-tour="btn-export-csv"]', content: 'Botão para exportar dados em CSV.', placement: 'bottom' },
{ target: '[data-tour="btn-export-xlsx"]', content: 'Botão para exportar dados em XLSX.', placement: 'bottom' },
{ target: '.chart-evolucao-inscricoes', content: 'Gráfico de evolução de inscrições.', placement: 'top' },
{ target: '.chart-evolucao-pedidos', content: 'Gráfico de evolução de pedidos.', placement: 'top' },
];

// === Inscrições Recebidas ===
export const adminInscricoesTour = [
{ target: 'body', content: 'Gerencie inscrições recebidas: busca, filtro por status e exportação.', placement: 'top' },
{ target: 'h1', content: 'Título “Inscrições Recebidas”.', placement: 'bottom' },
{ target: 'input[placeholder*="Buscar por nome"]', content: 'Campo de busca por nome, telefone ou CPF.', placement: 'right' },
{ target: '.status-filter', content: 'Selecione um status para filtrar inscrições.', placement: 'right' },
{ target: '[data-tour="btn-export-csv"]', content: 'Exporte inscrições em CSV.', placement: 'bottom' },
{ target: '[data-tour="tabela-inscricoes"] thead', content: 'Cabeçalho da tabela de inscrições.', placement: 'bottom' },
{ target: '[data-tour="tabela-inscricoes"] tbody tr:first-child', content: 'Primeiro registro de inscrição.', placement: 'right' },
{ target: '[data-tour="tabela-inscricoes"] tbody tr:first-child .btn-view', content: 'Ver detalhes da inscrição.', placement: 'left' },
{ target: '[data-tour="tabela-inscricoes"] tbody tr:first-child .btn-confirm', content: 'Confirmar inscrição.', placement: 'left' },
{ target: '[data-tour="tabela-inscricoes"] tbody tr:first-child .btn-cancel', content: 'Cancelar inscrição.', placement: 'left' },
];

// === Pedidos Recebidos ===
export const adminPedidosTour = [
{ target: 'body', content: 'Gerencie pedidos: busca, filtros, ordenação e exportação.', placement: 'top' },
{ target: 'h1', content: 'Título “Pedidos Recebidos”.', placement: 'bottom' },
{ target: 'input[placeholder*="Buscar por produto"]', content: 'Campo de busca por produto, e-mail ou nome.', placement: 'right' },
{ target: '.status-filter', content: 'Selecione um status para filtrar pedidos.', placement: 'right' },
{ target: '.field-filter', content: 'Filtrar por campo específico.', placement: 'right' },
{ target: '.btn-sort-date', content: 'Ordenar pedidos por data.', placement: 'bottom' },
{ target: '[data-tour="btn-export-csv"]', content: 'Exporte pedidos em CSV.', placement: 'bottom' },
{ target: '[data-tour="tabela-pedidos"] thead', content: 'Cabeçalho da tabela de pedidos.', placement: 'bottom' },
{ target: '[data-tour="tabela-pedidos"] tbody tr:first-child', content: 'Primeiro registro de pedido.', placement: 'right' },
{ target: '[data-tour="tabela-pedidos"] tbody tr:first-child .btn-details', content: 'Ver detalhes do pedido.', placement: 'left' },
];

// === Eventos Cadastrados ===
export const adminEventosTour = [
{ target: 'body', content: 'Crie, edite e exclua eventos no painel administrativo.', placement: 'top' },
{ target: 'h1', content: 'Título “Eventos”.', placement: 'bottom' },
{ target: '[data-tour="btn-novo-evento"]', content: 'Clique para criar um novo evento.', placement: 'right' },
{ target: '[data-tour="tabela-eventos"] thead', content: 'Cabeçalho da tabela de eventos.', placement: 'bottom' },
{ target: '[data-tour="tabela-eventos"] tbody tr:first-child .btn-editar', content: 'Editar evento existente.', placement: 'left' },
{ target: '[data-tour="tabela-eventos"] tbody tr:first-child .btn-excluir', content: 'Excluir evento existente.', placement: 'left' },
];

// === Produtos ===
export const adminProdutosTour = [
{ target: 'body', content: 'Gerencie produtos: visualização e criação.', placement: 'top' },
{ target: '[data-tour="btn-novo-produto"]', content: 'Clique para adicionar um novo produto.', placement: 'bottom' },
{ target: '[data-tour="tabela-produtos"]', content: 'Tabela com produtos cadastrados.', placement: 'top' },
];

// Observação: o formulário de criação é exibido em um modal na mesma rota
// `/admin/produtos`, portanto não há tour separado para `/admin/produtos/novo`.


// === Clientes ===
export const adminClientesTour = [
{ target: 'body', content: 'Visualize e gerencie clientes cadastrados.', placement: 'top' },
{ target: '[data-tour="tabela-clientes"]', content: 'Tabela com histórico de clientes.', placement: 'top' },
];

// === Campos Dinâmicos ===
export const adminCamposTour = [
{ target: 'body', content: 'Gerencie campos dinâmicos utilizados em formulários.', placement: 'top' },
{ target: '[data-tour="lista-campos"]', content: 'Lista de campos cadastrados.', placement: 'right' },
{ target: '[data-tour="btn-novo-campo"]', content: 'Adicionar novo campo.', placement: 'bottom' },
];

// === Configurações Gerais ===
export const adminConfiguracoesTour = [
{ target: 'body', content: 'Ajustes gerais do sistema e preferências.', placement: 'top' },
{ target: '[data-tour="form-config"]', content: 'Formulário de configurações.', placement: 'bottom' },
{ target: '[data-tour="toggle-confirmar-inscricoes"]', content: 'Ativar/desativar confirmação manual de inscrições.', placement: 'right' },
];

// === Financeiro ===
export const adminFinanceiroTour = [
{ target: 'body', content: 'Visão geral financeira: saldo e transferências.', placement: 'top' },
{ target: '[data-tour="saldo-atual"]', content: 'Mostra o saldo disponível.', placement: 'right' },
{ target: '[data-tour="btn-transferir-saldo"]', content: 'Iniciar transferência bancária.', placement: 'bottom' },
];

// === Saldo Detalhado ===
export const adminFinanceiroSaldoTour = [
{ target: 'body', content: 'Seção de Saldo: valores disponíveis e a liberar, além de extrato detalhado.', placement: 'top' },
{ target: 'h1', content: 'Título “Saldo”.', placement: 'bottom' },
{ target: '[data-tour="stats-card"]:nth-of-type(1)', content: 'Saldo Disponível.', placement: 'right' },
{ target: '[data-tour="stats-card"]:nth-of-type(2)', content: 'Valor a Liberar.', placement: 'right' },
{ target: '[data-tour="range-start"]', content: 'Data de início para filtrar o extrato.', placement: 'bottom' },
{ target: '[data-tour="range-end"]', content: 'Data de fim para filtrar o extrato.', placement: 'bottom' },
{ target: '[data-tour="btn-export-pdf"]', content: 'Exportar extrato em PDF.', placement: 'bottom' },
{ target: '[data-tour="btn-export-xlsm"]', content: 'Exportar extrato em XLSM.', placement: 'bottom' },
{ target: '[data-tour="tabela-extrato"] thead', content: 'Cabeçalho do extrato com colunas Data, Descrição e Valor.', placement: 'top' },
];

// === Usuários do Sistema ===
export const adminUsuariosTour = [
{ target: 'body', content: 'Gerencie usuários: visualização e adição.', placement: 'top' },
{ target: '.status-filter', content: 'Filtro por função ou campo.', placement: 'right' },
{ target: '[data-tour="btn-novo-usuario"]', content: 'Adicionar novo usuário.', placement: 'bottom' },
{ target: '[data-tour="tabela-usuarios"]', content: 'Tabela com usuários cadastrados.', placement: 'top' },
];

// === Posts e Notícias ===
export const adminPostsTour = [
// Resumo: criação e gerenciamento de posts e notícias
{ target: 'body', content: 'Este tour apresenta como criar novos posts, visualizar a tabela e navegar na paginação.', placement: 'top' },
// Título da página
{ target: 'h1', content: 'Título “Posts”.', placement: 'bottom' },
// Botão para criar post
{ target: '[data-tour="btn-novo-post"]', content: 'Clique aqui para adicionar um novo post.', placement: 'right' },
// Cabeçalho da tabela
{ target: '[data-tour="tabela-posts"] thead', content: 'Colunas: Título, Data, Categoria e Ações.', placement: 'bottom' },
// Primeiro post da lista (edição/exclusão)
{ target: '.tabela-posts tbody tr:first-child .btn-editar', content: 'Editar este post.', placement: 'left' },
{ target: '.tabela-posts tbody tr:first-child .btn-excluir', content: 'Excluir este post.', placement: 'left' },
// Controles de paginação
{ target: '.pagination', content: 'Use os botões “Anterior” e “Próxima” para navegar entre páginas.', placement: 'top' },
];

// === Perfil do Administrador ===
export const adminPerfilTour = [
{ target: 'body', content: 'Edite seus dados pessoais e preferências.', placement: 'top' },
{ target: '[data-tour="perfil-dados"]', content: 'Dados de perfil visíveis.', placement: 'right' },
{ target: '[data-tour="btn-editar-perfil"]', content: 'Botão para editar perfil.', placement: 'top' },
];

// === Integração WhatsApp ===
export const adminWhatsappTour = [
{ target: 'body', content: 'Configuração da integração com WhatsApp.', placement: 'top' },
{ target: '[data-tour="onboarding-wizard"]', content: 'Passos iniciais do wizard de integração.', placement: 'bottom' },
];

// Export padrão para fácil importação
export default {
adminDashboardTour,
adminInscricoesTour,
adminPedidosTour,
adminEventosTour,
adminProdutosTour,
adminClientesTour,
adminCamposTour,
adminConfiguracoesTour,
adminFinanceiroTour,
adminFinanceiroSaldoTour,
adminUsuariosTour,
adminPostsTour,
adminPerfilTour,
adminWhatsappTour,
};
