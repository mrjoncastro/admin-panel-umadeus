import { Step } from 'react-joyride'

export const stepsByRoute: Record<string, Step[]> = {
  '/admin/dashboard': [
    {
      target: '[data-tour="stats-card"]',
      content: 'Aqui você vê as principais métricas do sistema.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="nav-inscricoes"]',
      content: 'Acesse e gerencie as inscrições.',
      placement: 'right',
    },
  ],
  '/admin/inscricoes': [
    {
      target: '[data-tour="filtro-inscricoes"]',
      content: 'Use os filtros para encontrar inscrições específicas.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="tabela-inscricoes"]',
      content: 'Lista completa das inscrições realizadas.',
      placement: 'top',
    },
  ],
  '/admin/pedidos': [
    {
      target: '[data-tour="filtro-pedidos"]',
      content: 'Filtre por status ou data para localizar pedidos.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="tabela-pedidos"]',
      content: 'Acompanhe todos os pagamentos gerados.',
      placement: 'top',
    },
  ],
  '/admin/produtos': [
    {
      target: '[data-tour="btn-novo-produto"]',
      content: 'Clique para cadastrar um novo produto.',
      placement: 'left',
    },
    {
      target: '[data-tour="tabela-produtos"]',
      content: 'Gerencie os itens disponíveis para venda.',
      placement: 'top',
    },
  ],
  '/admin/clientes': [
    {
      target: '[data-tour="tabela-clientes"]',
      content: 'Visualize o histórico de cada cliente.',
      placement: 'top',
    },
  ],
  '/admin/campos': [
    {
      target: '[data-tour="lista-campos"]',
      content: 'Campos de atuação cadastrados.',
      placement: 'top',
    },
    {
      target: '[data-tour="btn-novo-campo"]',
      content: 'Adicione um novo campo à lista.',
      placement: 'left',
    },
  ],
  '/admin/configuracoes': [
    {
      target: '[data-tour="form-config"]',
      content: 'Personalize cores, logo e opções do sistema.',
      placement: 'top',
    },
    {
      target: '[data-tour="toggle-confirmar-inscricoes"]',
      content: 'Defina se as inscrições devem ser confirmadas manualmente.',
      placement: 'right',
    },
  ],
  '/admin/eventos': [
    {
      target: '[data-tour="btn-novo-evento"]',
      content: 'Crie eventos para receber inscrições.',
      placement: 'left',
    },
    {
      target: '[data-tour="tabela-eventos"]',
      content: 'Lista de eventos cadastrados.',
      placement: 'top',
    },
  ],
  '/admin/financeiro': [
    {
      target: '[data-tour="saldo-atual"]',
      content: 'Veja o saldo disponível para saque.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="btn-transferir-saldo"]',
      content: 'Inicie a transferência do valor para sua conta.',
      placement: 'left',
    },
  ],
  '/admin/financeiro/saldo': [
    {
      target: '[data-tour="stats-card"]:nth-of-type(1)',
      content: 'Saldo disponível detalhado.',
      placement: 'right',
    },
    {
      target: '[data-tour="stats-card"]:nth-of-type(2)',
      content: 'Valor pendente a liberar.',
      placement: 'right',
    },
    {
      target: '[data-tour="range-start"]',
      content: 'Selecione a data inicial do extrato.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="range-end"]',
      content: 'Selecione a data final do extrato.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="btn-export-pdf"]',
      content: 'Exporte o extrato em PDF.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="btn-export-xlsm"]',
      content: 'Exporte o extrato em XLSM.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="tabela-extrato"] thead',
      content: 'Cabeçalho do extrato.',
      placement: 'top',
    },
  ],
  '/admin/usuarios': [
    {
      target: '[data-tour="btn-novo-usuario"]',
      content: 'Adicione colaboradores ao sistema.',
      placement: 'left',
    },
    {
      target: '[data-tour="tabela-usuarios"]',
      content: 'Controle o nível de acesso de cada usuário.',
      placement: 'top',
    },
  ],
  '/admin/posts': [
    {
      target: '[data-tour="btn-novo-post"]',
      content: 'Publique novidades no blog.',
      placement: 'left',
    },
    {
      target: '[data-tour="tabela-posts"]',
      content: 'Gerencie seus artigos publicados.',
      placement: 'top',
    },
  ],
  '/admin/perfil': [
    {
      target: '[data-tour="perfil-dados"]',
      content: 'Consulte seus dados pessoais e de acesso.',
      placement: 'top',
    },
    {
      target: '[data-tour="btn-editar-perfil"]',
      content: 'Atualize suas informações de usuário.',
      placement: 'left',
    },
  ],
  '/admin/whatsapp': [
    {
      target: '[data-tour="onboarding-wizard"]',
      content: 'Configure a integração com o WhatsApp.',
      placement: 'top',
    },
  ],
}

export default stepsByRoute
