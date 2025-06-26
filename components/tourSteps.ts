import { Step } from 'react-joyride'

export const stepsByRoute: Record<string, Step[]> = {
  '/admin/dashboard': [
    { target: '.stats-card', content: 'Aqui você vê as principais métricas do sistema.', placement: 'bottom' },
    { target: '.nav-inscricoes', content: 'Acesse e gerencie as inscrições.', placement: 'right' },
  ],
  '/admin/inscricoes': [
    { target: '.filtro-inscricoes', content: 'Use os filtros para encontrar inscrições específicas.', placement: 'bottom' },
    { target: '.tabela-inscricoes', content: 'Lista completa das inscrições realizadas.', placement: 'top' },
  ],
  '/admin/pedidos': [
    { target: '.filtro-pedidos', content: 'Filtre por status ou data para localizar pedidos.', placement: 'bottom' },
    { target: '.tabela-pedidos', content: 'Acompanhe todos os pagamentos gerados.', placement: 'top' },
  ],
  '/admin/produtos': [
    { target: '.btn-novo-produto', content: 'Clique para cadastrar um novo produto.', placement: 'left' },
    { target: '.tabela-produtos', content: 'Gerencie os itens disponíveis para venda.', placement: 'top' },
  ],
  '/admin/clientes': [
    { target: '.filtro-clientes', content: 'Busque clientes por nome ou telefone.', placement: 'bottom' },
    { target: '.tabela-clientes', content: 'Visualize o histórico de cada cliente.', placement: 'top' },
  ],
  '/admin/campos': [
    { target: '.lista-campos', content: 'Campos de atuação cadastrados.', placement: 'top' },
    { target: '.btn-novo-campo', content: 'Adicione um novo campo à lista.', placement: 'left' },
  ],
  '/admin/configuracoes': [
    { target: '.form-config', content: 'Personalize cores, logo e opções do sistema.', placement: 'top' },
    { target: '.toggle-modo-demonstracao', content: 'Ative o modo de demonstração para ocultar dados reais.', placement: 'right' },
  ],
  '/admin/eventos': [
    { target: '.btn-novo-evento', content: 'Crie eventos para receber inscrições.', placement: 'left' },
    { target: '.tabela-eventos', content: 'Lista de eventos cadastrados.', placement: 'top' },
  ],
  '/admin/financeiro': [
    { target: '.saldo-atual', content: 'Veja o saldo disponível para saque.', placement: 'bottom' },
    { target: '.btn-transferir-saldo', content: 'Inicie a transferência do valor para sua conta.', placement: 'left' },
  ],
  '/admin/usuarios': [
    { target: '.btn-novo-usuario', content: 'Adicione colaboradores ao sistema.', placement: 'left' },
    { target: '.tabela-usuarios', content: 'Controle o nível de acesso de cada usuário.', placement: 'top' },
  ],
  '/admin/posts': [
    { target: '.btn-novo-post', content: 'Publique novidades no blog.', placement: 'left' },
    { target: '.tabela-posts', content: 'Gerencie seus artigos publicados.', placement: 'top' },
  ],
  '/admin/perfil': [
    { target: '.perfil-dados', content: 'Consulte seus dados pessoais e de acesso.', placement: 'top' },
    { target: '.btn-editar-perfil', content: 'Atualize suas informações de usuário.', placement: 'left' },
  ],
  '/admin/whatsapp': [
    { target: '.onboarding-wizard', content: 'Configure a integração com o WhatsApp.', placement: 'top' },
  ],
  '/app/home': [
    { target: '.welcome-banner', content: 'Bem‑vindo ao seu painel pessoal!', placement: 'bottom' },
    { target: '.menu-pedidos', content: 'Confira seus pedidos e status aqui.', placement: 'right' },
  ],
}
