# Documento de Implementação: Tour In‑App para ADMIN e Espaço do Cliente

Este documento descreve passo‑a‑passo a implementação de um tour in‑app nas áreas **ADMIN** e **Espaço do Cliente** do sistema, utilizando **React Joyride**, integrado ao nosso design system (Tailwind CSS + shadcn/ui) e autenticação via PocketBase.

---

## 1. Visão Geral

- **Objetivo**: Orientar usuários em cada tela com dicas contextuais, reduzindo dúvidas e tornando o onboarding mais intuitivo.
- **Áreas contempladas**:

  - **ADMIN**: `/admin/dashboard`, `/admin/inscricoes`, `/admin/pedidos`, `/admin/usuarios`, `/admin/configuracoes` e demais.
  - **Cliente**: `/app/cliente/dashboard`, `/app/cliente/inscricoes`, `/app/cliente/pedidos`, `/app/cliente/perfil`.

---

## 2. Dependências

Instale o React Joyride no monorepo:

```bash
yarn workspace @your-org/admin add react-joyride
# ou, no workspace do client:
yarn workspace @your-org/client add react-joyride
```

---

## 3. Criação do Componente `AdminClientTour`

Crie o arquivo `components/AdminClientTour.tsx` no workspace do Admin/Client com o seguinte conteúdo:

```tsx
import { useEffect, useRef } from 'react'
import Joyride, { CallBackProps, Step, STATUS } from 'react-joyride'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import { HelpCircle } from 'lucide-react'

interface AdminClientTourProps {
  stepsByRoute: Record<string, Step[]>
}

export function AdminClientTour({ stepsByRoute }: AdminClientTourProps) {
  const router = useRouter()
  const tourRef = useRef<any>(null)
  const route = router.pathname
  const steps = stepsByRoute[route] || []

  // Controle de primeira execução
  useEffect(() => {
    const flag = `${route}-tour-completed`
    const done = localStorage.getItem(flag)
    if (steps.length && !done) {
      tourRef.current?.reset(true)
    }
  }, [route, steps])

  // Callback para marcar conclusão
  function handleJoyrideCallback(data: CallBackProps) {
    const { status } = data
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED]
    if (finishedStatuses.includes(status)) {
      localStorage.setItem(`${route}-tour-completed`, 'true')
    }
  }

  return (
    <>
      <Joyride
        ref={tourRef}
        steps={steps}
        continuous
        showSkipButton
        locale={{
          back: 'Voltar',
          close: 'Fechar',
          last: 'Finalizar',
          next: 'Próximo',
          skip: 'Pular',
        }}
        styles={{ options: { primaryColor: 'var(--accent)', zIndex: 10000 } }}
        callback={handleJoyrideCallback}
      />

      {/* Botão flutuante de Ajuda */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => tourRef.current?.reset(true)}
        >
          <HelpCircle size={24} />
        </Button>
      </div>
    </>
  )
}

export default AdminClientTour
```

**Comentários importantes**:

- Ajuste `primaryColor` no `styles.options` para usar `var(--accent)` do tenant.
- Extenda `stepsByRoute` sempre que adicionar novas páginas.
- O botão “Ajuda” reinicia o tour em qualquer rota.

---

## 4. Definição de Passos (`stepsByRoute`)

Crie ou edite o arquivo `components/tourSteps.ts`:

```ts
import { Step } from 'react-joyride'

export const stepsByRoute: Record<string, Step[]> = {
  '/admin/dashboard': [
    {
      target: '.stats-card',
      content: 'Aqui você vê as principais métricas do sistema.',
      placement: 'bottom',
    },
    {
      target: '.nav-inscricoes',
      content: 'Acesse e gerencie as inscrições.',
      placement: 'right',
    },
  ],
  // …adicione mais rotas conforme necessário
}
```

---

## 5. Integração no App

No arquivo principal (`_app.tsx` ou `app/layout.tsx`), importe e inclua o tour:

```tsx
import '@/styles/globals.css'
import AdminClientTour from '@/components/AdminClientTour'
import { stepsByRoute } from '@/components/tourSteps'
import { TenantProvider } from '@/contexts/tenant'
import MainLayout from '@/components/layout/MainLayout'

export default function App({ Component, pageProps }) {
  return (
    <TenantProvider>
      <MainLayout>
        <AdminClientTour stepsByRoute={stepsByRoute} />
        <Component {...pageProps} />
      </MainLayout>
    </TenantProvider>
  )
}
```

**Observação**: `MainLayout` deve englobar tanto o Admin quanto o Espaço do Cliente, carregando o contexto de `tenantId` e as variáveis de CSS.

---

## 6. Personalizações e Extensões

- **Novas rotas**: apenas adicione ao `stepsByRoute` com os seletores corretos.
- **Analytics**: dentro de `handleJoyrideCallback`, dispare eventos para seu sistema de métricas.
- **Design**: use classes Tailwind ou componentes shadcn/ui nos tooltips via `tooltipComponent` do Joyride.

---

## 7. Testes e Validação

1. Navegue até cada rota e confirme se o tour inicia apenas na primeira vez.
2. Teste o botão “Ajuda” para reiniciar o tour.
3. Verifique estilos e responsividade em diferentes resoluções.

---

> **Conclusão**: Com este guia, você terá um tour completo, leve e mantível, garantindo que seus usuários nunca fiquem perdidos no sistema.
