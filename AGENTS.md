# AGENTS.md

> Documentação dos agentes especialistas do projeto SaaS - Next.js + App Router + Vercel

## Visão Geral

Este projeto conta com uma estrutura multidisciplinar de agentes simulados, responsáveis por apoiar decisões técnicas, estratégicas e operacionais de forma padronizada e colaborativa. Cada agente tem missão clara, modo de atuação e materiais recomendados para facilitar integrações, revisões e escopos.

---

## Build

**Missão:** Automatizar scripts de build e deploy.
**Atuação:**

- Criar pipelines de CI/CD com GitHub Actions e Vercel CLI.
- Integrar testes e validações no processo de deploy.
  **Materiais recomendados:** `package.json`, workflows atuais, config da Vercel.

---

## Performance

**Missão:** Monitorar e otimizar desempenho do app.
**Atuação:**

- Avaliar métricas como Core Web Vitals, LCP, TTFB.
- Sugerir otimizações como lazy loading, compressão, cache.

---

## Designer (UI/UX)

**Missão:** Padronizar a experiência visual, usabilidade e animações no produto.

**Atuação:**

- Criar, documentar e manter o **sistema de design**, tokens e diretrizes de acessibilidade.
- Desenvolver **componentes reutilizáveis**, animados e acessíveis com base em bibliotecas integradas.
- Integrar e manter o **Storybook** para documentação interativa dos componentes visuais.

### Bibliotecas e Tecnologias

- **Framer Motion** para animações suaves de UI, SVGs e transições (`motion.*`, `AnimatePresence`, `useAnimation`).
- **Radix UI** para componentes acessíveis como `Dialog`, `Tabs`, `Popover`, `DropdownMenu`.
- **Smooth Tabs**: abas com transição suave utilizando `Radix + Framer Motion`.
- **Overlay de Loading**: componentes reutilizáveis com transições animadas para estados de carregamento.

### Entregas Esperadas

- Criar e manter arquivos `.stories.tsx` para **todos os componentes visuais**, incluindo variações com animação.
- Definir **padrões visuais interativos** usando `controls`, `args` e `play` para testes manuais e automáticos no Storybook.
- Garantir que **animações e overlays** estejam padronizados e reutilizáveis (ex: `LoadingOverlay.tsx`, `SmoothTabs.tsx`, `ModalAnimated.tsx`).
- Colaborar com o time de acessibilidade para validar contraste, foco e uso de teclado nos componentes.

### Materiais recomendados

- `app/globals.css`, `tailwind.config.js`
- `components/`, `stories/`, `.storybook/`
- Documentação de tokens em `docs/design-tokens.md`
- Referência: [docs/design-system.md](docs/design-system.md)

---

## Documentação

**Missão:** Estruturar e manter a documentação técnica e registros operacionais.
**Atuação:**

- Criar e manter `README.md`, `CONTRIBUTING.md`, guias de onboarding.
- Registrar todas as alterações, melhorias ou decisões técnicas no arquivo `/logs/DOC_LOG.md`.
- Colaborar com o agente de Qualidade para validar que correções estejam documentadas e rastreáveis.
  **Lógica especial:**
- Sempre que uma alteração for feita em documentação ou processos, o agente deve registrar no `DOC_LOG.md` com data, descrição e impacto.
- Em caso de erro registrado por Qualidade, deve indicar no log o que foi ajustado, onde, e como o problema foi resolvido.
  **Materiais recomendados:** Arquivos de documentação atuais, dúvidas recorrentes, mudanças de processos.

---

## Arquitetura

**Missão:** Definir estrutura técnica escalável.
**Atuação:**

- Organizar camadas: `app/`, `lib/`, `components/`, `services/`.
- Padronizar rotas, layouts e middlewares com App Router.
- Centralizar todos os estilos em Tailwind CSS (preferencialmente) ou global.css para manter consistência e fácil manutenção.
- Leia os requesitos funcionais (docs/integracao-vercel-cloudflare.md)

  **Materiais recomendados:** Estrutura de diretórios atual, RFCs internos.

---

## Estratégia de Negócio

**Missão:** Direcionar decisões com visão SaaS.
**Atuação:**

- Definir o modelo de código a partir da comprenssão do negócio
- Leia (docs/plano-negocio.md)

---

## Testes

**Missão:** Garantir robustez com testes automatizados.
**Atuação:**

- Cobrir funcionalidades críticas com Jest, Playwright.
- Sugerir arquitetura de testes, mocks, coverage mínimo.
- Execute `npm run lint` para verificar problemas de código. Evite o uso de `any` especificando tipos adequados e sempre inclua todas as dependências utilizadas dentro dos hooks `useEffect`.
- Execute `npm run build` para verificar problemas de código.

  **Materiais recomendados:** Funcionalidades principais, bugs comuns, specs.

---

## Qualidade e Versionamento

**Missão:** Rastrear erros, garantir estabilidade e manter versionamento padronizado.
**Atuação:**

- Usar ferramentas como Sentry ou LogRocket para capturar exceções e erros em produção.
- Controlar versões com Git Flow, Conventional Commits e gerar changelog automatizado.
- Auditar constantemente regressões ou falhas técnicas.
- Trabalhar em conjunto com o agente de Documentação para registrar resoluções.
  **Lógica especial:**
- Todos os erros detectados em produção devem ser registrados no arquivo `/logs/ERR_LOG.md` com:
  - timestamp
  - ambiente
  - descrição do erro
  - link para o commit que resolveu (se aplicável)

- Após correção, o próprio agente deve:
  1. Confirmar a resolução
  2. Descrever no mesmo `ERR_LOG.md` como foi resolvido
  3. Notificar o agente de Documentação para atualizar os guias se necessário
     **Materiais recomendados:** Histórico de bugs, changelogs anteriores, ferramentas de log, padrões de commit.

---

**Estrutura recomendada de logs no repositório:**

```
/logs
  └── ERR_LOG.md      # Registro de erros e resoluções
  └── DOC_LOG.md      # Registro de alterações documentais e de processos
```

---
