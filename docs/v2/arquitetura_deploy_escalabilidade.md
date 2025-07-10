## Arquitetura de Deploy e Estratégia de Escalabilidade

---

### 1. Visão Geral  
Este documento descreve a arquitetura de deploy do MVP e a estratégia para garantir escalabilidade, alta disponibilidade e controle de custos em modelo **pay-as-you-go**.

---

### 2. Componentes da Arquitetura  

| Camada                | Tecnologia / Serviço               | Função Principal                                    |
|-----------------------|------------------------------------|-----------------------------------------------------|
| **Front-end**         | Vercel (Plano Pro)                 | Next.js SSR/SSG com ISR e Edge Caching               |
| **API & Business**    | Commission Engine (Docker)         | Lógica de pedidos, motor de comissões               |
| **Banco de Dados**    | PocketBase (Railway Starter)       | Armazenamento de dados (usuários, produtos, pedidos)|
| **Cache Dinâmico**    | Redis (contêiner Docker dedicado)  | Cache de queries críticas e sessões                  |
| **CDN & Edge**        | Vercel Edge Network / Cloudflare   | Distribuição global de assets estáticos e JSON       |
| **Observabilidade**   | OpenTelemetry → Prometheus → Grafana | Métricas, traces e dashboards                      |
| **Alertas**           | Grafana Alertas → Slack / E-mail   | Notificações sobre latência, erros e uso de recursos |

### 2.1. Segurança e Compliance  
- **TLS**: criptografia obrigatória em trânsito para todas as conexões (API e web).  
- **WAF**: uso de Web Application Firewall (Cloudflare/WAF do provedor) para proteção contra OWASP Top 10.  
- **IAM**: definição de políticas de acesso mínimo (least privilege) em todos os serviços.  
- **Criptografia em repouso**: banco e backups criptografados (AES-256).  
- **Políticas de logs**: retenção de logs de auditoria por no mínimo 90 dias.  

---

### 3. Fluxo de Deploy  

1. **CI/CD (Git → Vercel / Railway)**  
   - **Front-end**:  
     - Commit no repositório Next.js dispara build e deploy automático no Vercel.  
     - Páginas estáticas geradas com ISR; rotas dinâmicas servidas por Serverless Functions.  
   - **Back-end (Docker)**:  
     - Commit no repositório do Commission Engine atualiza imagem Docker no Registry.  
     - Railway detecta nova imagem, realiza deploy automático.  
2. **Configuração de DNS e Domínios**  
   - Subdomínios automáticos via integração Vercel ↔ Cloudflare.  
   - Mapeamento de domínios próprios por tenant.  
3. **Infraestrutura como Código (opcional)**  
   - Manter `docker-compose.yml` e/ou Terraform para cenários alternativos.  
4. **Pipeline Avançado**  
   - **Ambientes**: integração, staging e produção separados.  
   - **Testes Automatizados**: unitários, integração e end-to-end antes do deploy em staging.  
   - **Canary Deploy**: rolagem controlada de novas versões em produção, monitorando métricas-chave.  
   - **Rollback Automático**: revert em caso de aumento de erro 5xx ou latência acima de threshold.

---

### 4. Estratégia de Escalabilidade e Disaster Recovery & Multi-Região  

#### 4.1. Escalabilidade Horizontal  
- **Front-end**:  
  - Vercel escala automaticamente Serverless Functions conforme RPS; não há configuração manual.  
- **Back-end (Commission Engine)**:  
  - Definir réplicas mínimas (1 instância quente) → autoscale até 3–5 réplicas com base em métricas de CPU ou latência.  
  - No Railway: ajuste manual de réplicas ou use Cloud Run para autoscaling automático.

#### 4.2. Escalabilidade Vertical  
- **PocketBase**:  
  - Inicialmente 1 vCPU + 2 GB RAM; em picos, vertical scale até 2 vCPUs + 4 GB RAM.  
  - Monitorar locks do SQLite; se frequentes, considerar migração para Postgres (Supabase).  
- **Redis Cache**:  
  - Contêiner com 1 vCPU + 1 GB RAM, escala vertical conforme miss rate no cache.

#### 4.3. Caching & CDN  
- **ISR (Incremental Static Regeneration)**:  
  - Revalidar catálogo e detalhes de produto a cada X minutos, reduzindo carga no back-end.  
- **Edge Caching**:  
  - Configurar TTL de 24 h para JSON de catálogo no CDN Edge.  
- **Cache de API**:  
  - Redis para armazenar resultados de cálculos de comissão por tenant, com TTL de 5 minutos.

#### 4.4. Disaster Recovery & Multi-Região  
- **Backup Automático**: snapshots diários do banco e do estado dos containers.  
- **Failover**: réplica em região secundária com RTO < 1 h.  
- **Deploy Multirregional**: front-end no Vercel Edge; back-end em zonas distintas.

---

### 5. Métricas e Monitoramento  

| Métrica                     | Ferramenta      | SLO (MVP)                | Alerta                            |
|-----------------------------|-----------------|--------------------------|-----------------------------------|
| **P95 Latency (SSR/API)**   | Grafana         | ≤ 500 ms                 | P95 > 700 ms por 5 min            |
| **Taxa de Erros 5xx**       | Grafana         | < 0,1%                   | > 0,5% em 1 min                   |
| **CPU Uso (Containers)**    | Prometheus      | < 70%                    | > 85% por 3 min                   |
| **Memória Uso**             | Prometheus      | < 70%                    | > 85% por 3 min                   |
| **Throughput (RPS)**        | Grafana         | Sustentar 30–40 RPS      | RPS > 50 por pico > 5 min         |
| **Custo vCPU & RAM**        | Plataforma      | Budget configurado       | > 80% do budget → alerta         |

**Traces distribuídos** via OpenTelemetry para diagnosticar latências internas.  
**Dashboards**:  
- Visão geral por serviço, por rota e por tenant.  
- Gráficos de tendência para antecipar necessidade de scaling.

---

### 6. Métricas de Experiência do Usuário  

| Métrica                            | Ferramenta           | SLO (MVP)             | Alerta / Indicador de ação           |
|------------------------------------|----------------------|-----------------------|--------------------------------------|
| **Largest Contentful Paint (LCP)** | Web Vitals / Grafana | ≤ 2,5 s               | > 3 s para 10% de usuários em 1 dia  |
| **First Input Delay (FID)**        | Web Vitals / Grafana | ≤ 100 ms              | > 200 ms para 5% de usuários         |
| **Cumulative Layout Shift (CLS)**  | Web Vitals / Grafana | ≤ 0,1                 | > 0,25 para 5% de usuários           |
| **Time to First Byte (TTFB)**      | Grafana / Prometheus | ≤ 300 ms              | > 500 ms no P95                      |
| **Error Budget Burn Rate**         | Grafana              | < 5% gastos/semana    | > 20% em 1 semana → revisão        |
| **Sessões Rejeitadas (Bounce Rate)**| Google Analytics    | < 30%                 | > 40% em 1 dia → análise           |
| **CSAT (Satisfação do Usuário)**    | Surveys / GA        | ≥ 90%                 | < 80% → priorizar UX               |

---

### 7. Métricas de Avaliação de Migração de Banco  

| Métrica                                | Ferramenta      | Threshold Indicativo               | Ação Recomendada                      |
|----------------------------------------|-----------------|------------------------------------|---------------------------------------|
| SQLite Locks por minuto                | Railway Metrics | > 5 locks/min (P95)                | Considerar Postgres/Supabase         |
| Conexões simultâneas do DB             | Railway Metrics | > 80 conexões ativas               | Avaliar escalonamento ou outro DB    |
| Erros de Conexão/Lock Timeout (5xx)    | Prometheus      | > 0,5% das requisições do DB       | Migrar para banco gerenciado          |
| Latência média de consultas (P95)      | Grafana         | > 200 ms                           | Migrar schema e otimizar queries      |

---

### 8. Plano de Ações e Ciclo de Otimização  

1. **Instrumentar**  
   - Implantar OpenTelemetry nos serviços Next.js e Docker.  
   - Configurar Prometheus scrape targets e Grafana dashboards iniciais.  
   - Adicionar coleta de Web Vitals via Real User Monitoring (RUM).  
2. **Testar Cenários de Carga**  
   - Simular 350–400 usuários simultâneos (k6/Artillery).  
   - Validar SLIs e métricas de UX (LCP, FID, CLS).  
3. **Otimizar Cache**  
   - Ajustar TTL de ISR e Redis TTL para balancear dados frescos vs. desempenho.  
4. **Testes de Resiliência**  
   - Executar práticas de chaos engineering (simular falhas de instâncias, rede e dependências).  
5. **Automação de Backup e DR**  
   - Configurar scripts automatizados de backup/restauração e testes periódicos de restore.  
6. **Revisar Mensalmente**  
   - Analisar métricas reais e redefinir limites de autoscaling.  
   - Se uso constante ultrapassar limites do Starter, migrar PocketBase para plano Pro ou para Postgres gerenciado.  
7. **Planejar Migração de Banco**  
   - Quando concorrência e volume de dados crescerem, migrar para banco SQL robusto (e.g. Supabase) com replicação e backups automáticos.

---

Com essa arquitetura e estratégia, o MVP estará preparado para escalar de forma controlada, mantendo custos alinhados ao uso (pay-as-you-go) e garantindo uma experiência de usuário consistente e de alta qualidade.

