# Documento Estratégico de Desenvolvimento

Este guia descreve as diretrizes essenciais para a evolucao do projeto, abordando arquitetura, seguranca e processos de entrega.


### 1. Visão Geral
Este documento estabelece as diretrizes, processos e práticas recomendadas para o **desenvolvimento de software** do projeto Next MultiApp. O objetivo é garantir qualidade, produtividade e escalabilidade da equipe e da arquitetura, alinhando-se às metas de negócio e suporte aos tenants.

---

### 2. Objetivos Principais
1. **Padronização de Código:** Adotar convenções que facilitem a leitura, manutenção e revisão de pull requests.
2. **Processo de Entrega Contínua:** Implementar pipelines de CI/CD robustos para build, testes e deploy automático.
3. **Qualidade e Testabilidade:** Garantir alta cobertura de testes (unitários, integração e end-to-end) e práticas de QA.
4. **Segurança e Compliance:** Incorporar auditorias, políticas de acesso e controles de dependências.
5. **Documentação e Onboarding:** Facilitar entrada de novos desenvolvedores e clientes técnicos, mantendo repositório e wiki atualizados.
6. **Automação e Ferramentas:** Utilizar ferramentas que acelerem feedback (lint, formatação, análise estática, type checking).

---

### 3. Padrões de Arquitetura
- **Monorepo com Microserviços:** Organizar em pastas `services/` e `libs/` compartilhados, garantindo isolamento de domínio e reuso de utilitários.
- **Camadas Claras:** Segregar presentation (Next.js App), business logic (services/API) e data (bancos, PocketBase/Postgres).
- **Domain-Driven Design (DDD):** Modelar entidades (Tenant, Produto, Pedido, Comissão) e seus agregados, com repositórios e serviços dedicados.
- **API Contract First:** Definir schemas (OpenAPI ou GraphQL SDL) antes de implementar, garantindo contratos estáveis.

---

### 4. Convenções de Código
- **Linguagens:** TypeScript em frontend e backend, usando ESLint e Prettier.
- **Imports:** Ordenação via plugin `import/order`; evitar caminhos relativos profundos (`../../../`);
- **Estrutura de Pastas:** `components/` (atoms, molecules, organisms), `lib/`, `pages/` ou `app/` (Next.js), `services/`, `tests/`.
- **Naming:** PascalCase para componentes e classes, camelCase para variáveis e funções, CONSTANT_CASE para constantes.
- **Type Safety:** Não usar `any`; definir tipos explícitos para props, respostas de API e DTOs.

---

### 5. Testes e QA
- **Testes Unitários:** Cobertura mínima de 80% em cada serviço, usando Vitest (backend) e Jest (frontend).
- **Testes de Integração:** Validar rotas e fluxos críticos (ex.: criação de inscrição, checkout Asaas) com Supertest e Playwright.
- **End-to-End:** Automatizar cenários de usuário em Cypress ou Playwright against ambiente staging.
- **Revisão de Código:** PRs obrigatórios com pelo menos 1 reviewer, checklist de critérios (funcionalidade, testes, performance).

---

### 6. CI/CD e Deploy
- **Pipeline:** GitHub Actions:
  1. **Lint & Type-Check**
  2. **Testes Unitários**
  3. **Build**
  4. **Deploy Staging** (merge em `develop`)
  5. **Deploy Produção** (merge em `main`) com manual approval
- **Canary Deploy:** Usar ArgoCD para rollouts progressivos em Kubernetes.
- **Rollback:** Configurar health checks e alertas para reverter deploys automatizados.

---

### 7. Segurança e Compliance
- **Dependências:** Auditar com `npm audit` e `Snyk`; políticas de PR para atualizações de pacotes.
- **Secrets Management:** Variáveis sensíveis em Vault ou GitHub Secrets; nunca commitar `.env`.
- **Autenticação & Autorização:** Uso de JWT assinado no gateway; RBAC para coordenador, líder, usuário e fornecedor.
- **CORS & CSRF:** Configurar cabeçalhos adequados e tokens **anti**-CSRF nas rotas públicas.

---

### 8. Documentação e Onboarding
- **README Atualizado:** Passos de instalação, scripts disponíveis e convenções.
- **Wiki/Docs:** Manter `docs/` com arquitetura, fluxos de negócio e guias de estilo.
- **Storybook:** Documentar componentes visuais e variações por tenant.
- **Onboarding Kit:** Checklist para novos devs (setup local, licenças, acesso PocketBase, Asaas Sandbox).

---

### 9. Ferramentas e Integrações
- **ESLint + Prettier:** Formatação e linting automáticos via pre-commit (Husky).
- **Swagger / GraphQL Playground:** Para testes manuais de API.
- **OpenTelemetry + Prometheus:** Instrumentar serviços críticos.
- **Sentry:** Captura de erros em frontend e backend.

---

### 10. Roadmap de Desenvolvimento
| Etapa                | Tempo Estimado | Responsáveis            | Entregáveis Principais                                                |
| -------------------- | -------------- | ----------------------- | ---------------------------------------------------------------------- |
| Configuração Inicial | 2 semanas      | DevOps & Backend Team   | Monorepo, Docker, CI/CD básico                                        |
| Contratos de API     | 3 semanas      | API Team                | OpenAPI/GraphQL SDL, mocks                                            |
| Services Core        | 4 semanas      | Backend Team            | Auth, Tenant, Catalog Services, schemas RLS                            |
| Frontend Foundation  | 3 semanas      | Frontend Team           | Next.js App Router, ThemeProvider, componentes base                   |
| Testes & QA          | 2 semanas      | QA & Devs               | Suites unitária, integração e e2e configuradas                         |
| Mobile App           | 4 semanas      | Mobile Team             | Expo boilerplate, login, catálogo, carrinho, checkout Asaas           |
| Observabilidade      | 2 semanas      | DevOps                  | Logs centralizados, métricas, alertas                                  |

---

## Anexo A - Documento Estratégico de Melhorias ao Sistema

### 1. Resumo Executivo
Apresentamos um plano estratégico de melhorias para transformar o sistema atual (Next.js + PocketBase monolítico) em uma plataforma SaaS moderna, escalável e totalmente white-label. O objetivo é elevar a resiliência, a capacidade de evolução das funcionalidades marketplace e motor de comissões, além de fortalecer a experiência do usuário (web e mobile) para diferentes tenants.

### 2. Contexto Atual
- **Arquitetura:** Monólito Next.js com roteamento App Router e SDK PocketBase.
- **Multi-Tenancy:** Dados isolados via campo `cliente` e `clientes_config`; filtragem no backend.
- **Marketplace:** Catálogo de produtos por tenant, sem camada legada de serviços independente.
- **Pagamentos:** Integração única com Asaas (cálculo reverso de valor bruto), sem motor de comissões externo.
- **UI:** Design System padronizado via Tailwind, tokens CSS e Storybook.
- **Mobile:** Responsividade web, ainda sem app nativo.
- **Perfis de Acesso:** Coordenador, Líder, Usuário e Fornecedor.

### 3. Objetivos Estratégicos
1. **Escalabilidade e Resiliência**
   - Containerização, deploy canary e HPA para picos de carga.
2. **Multi-Tenancy Evoluído**
   - RLS em PostgreSQL, PoC de schema por tenant e Config Service.
3. **Marketplace Avançado**
   - Serviço de catálogo autônomo, GraphQL Gateway e cache Redis.
4. **Motor de Comissões Configurável**
   - Engine modular, dashboard de relatórios, repasses automáticos e fluxo de distribuição: fornecedor, sistema e coordenador.
5. **Plataforma White-Label Unificada**
   - TenantProvider, CMS leve e deep links.
6. **Experiência Omnichannel**
   - Expo/React Native, push notifications e sincronização offline.
7. **Governança e Observabilidade**
   - ELK/EFK, OpenTelemetry, SLIs/SLAs e on-call.

### 4. Propostas de Melhoria
1. **Arquitetura e Infraestrutura**: Monorepo, microserviços, Docker, Kubernetes e CI/CD.
2. **Multi-Tenancy**: RLS, schema por tenant e Config Service.
3. **Marketplace & API**: Catalog Service, GraphQL Gateway e versionamento.
4. **Motor de Comissões**: Serviço dedicado, regras dinâmicas e agendamentos.
5. **White-Label e CMS**: Theming dinâmico e CMS de conteúdo.
6. **Mobile Native**: React Native + Expo e push notifications.
7. **Observabilidade**: Logs centralizados, métricas e alertas.

### Roadmap de Implementação
| Fase | Duração | Principais Entregáveis |
| --- | --- | --- |
| Fase 1 | 1–2 meses | Monorepo + Docker; CI/CD básico; Auth Service. |
| Fase 2 | 2–3 meses | Catalog Service + RLS; API Versionada. |
| Fase 3 | 1–2 meses | Orders Service; Commission Engine PoC. |
| Fase 4 | 2–3 meses | React Native/Expo App; theming mobile. |
| Fase 5 | 1–2 meses | CMS Service; Observabilidade; SLIs/Alertas. |

---

*Documento elaborado pelo Especialista do Projeto Next MultiApp — Diretrizes de Desenvolvimento*

