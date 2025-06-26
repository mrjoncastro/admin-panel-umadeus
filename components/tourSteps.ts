import { Step } from 'react-joyride'

export const stepsByRoute: Record<string, Step[]> = {
  '/admin/dashboard': [
    { target: '.stats-card', content: 'Aqui você vê as principais métricas do sistema.', placement: 'bottom' },
    { target: '.nav-inscricoes', content: 'Acesse e gerencie as inscrições.', placement: 'right' },
  ],
  '/app/home': [
    { target: '.welcome-banner', content: 'Bem‑vindo ao seu painel pessoal!', placement: 'bottom' },
    { target: '.menu-pedidos', content: 'Confira seus pedidos e status aqui.', placement: 'right' },
  ],
  // …adicione mais rotas conforme necessário
}
