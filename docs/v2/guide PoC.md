# Guia de Implementação: Comissão Engine PoC

Este guia apresenta o **objetivo**, **arquitetura** e **fluxo de cálculo** para o serviço de cálculo de comissões, agora com **4 níveis de repasse** e levando em conta as **taxas do Asaas**.

---

## 1. Objetivo do PoC
Validar a lógica de cálculo reverso do valor bruto (`G`) para que, após dedução das taxas do gateway Asaas, sejam atendidos corretamente **quatro níveis de repasse**:

| Nível | Descrição |
|:-----:|:---------|
| **1** | **Fornecedor:** recebe exatamente o **custo** oferecido pelo fornecedor. |
| **2** | **Vendedor:** recebe a **margem de venda** (preço de venda – custo). |
| **3** | **Host (Tenant):** recebe **4%** sobre a **margem do vendedor**, funcionando como taxa de vitrine ao expor produtos de outros tenants. |
| **4** | **Plataforma:** recebe **5%** sobre o **preço de venda**. |

**Regras gerais:**
1. Fornecedor e Vendedor negociam livremente seus valores (custo e preço de venda).  
2. Host e Plataforma têm comissões fixas em % conforme acima.  
3. As taxas do Asaas (fixa `F` + percentual `P`) incidem sobre o **valor bruto cobrado**.  
4. A fórmula reversa garante que, após descontar `F + P×G`, reste exatamente a soma dos repasses dos 4 níveis.

---

## 2. Arquitetura e Estrutura do Projeto

```
commission-engine/
├── Dockerfile
├── docker-compose.yml
├── tsconfig.json
└── src/
    ├── index.ts        # Entrypoint Express + rota /calculate
    ├── database.ts     # Pool PostgreSQL
    ├── models.ts       # Persistência em commission_log (inclui created_at)
    ├── fees.ts         # Lógica de fees Asaas e comissões (4% host, 5% plat)
    └── types.ts        # Definições de InputData, OutputData, SplitItem
```

- **Stack:** Node.js, Express.js, TypeScript, PostgreSQL.  
- **Segurança & Logs:** `helmet`, `morgan`.  
- **Env vars:** `.env` para `DATABASE_URL`, `WALLETID_{FORNECEDOR,VENDEDOR,HOST,PLATFORM}`.

---

## 3. Fluxo de Cálculo `/calculate`

1. **Entrada** (`InputData`):
   ```jsonc
   {
     "cost": number,             // valor de custo (Fornecedor)
     "salePrice": number,        // preço de venda (Vendedor)
     "paymentMethod": "pix" | "boleto" | "credit",
     "installments": number,     // default: 1
     "grossPix": number?         // opcional: piso para Pix
   }
   ```
2. **Cálculos internos**:
   ```ts
   const sellerMargin = salePrice - cost;                                      // Nível 2
   const hostCommission   = sellerMargin * 0.04;                                // 4% sobre margem
   const platformCommission = salePrice * 0.05;                                 // 5% sobre venda

   const S = cost
           + sellerMargin
           + hostCommission
           + platformCommission;                                               // soma líquida dos 4 níveis

   const { fixedFee: F, percentFee: P } = obterTaxasAsaas(paymentMethod, installments);

   // Cálculo reverso: G = (S + F) / (1 - P)
   let G = (S + F) / (1 - P);
   // Aplica piso de Pix se fornecido
   if (grossPix) G = Math.max(G, grossPix);

   const grossFinal = round(G, 2);
   ```
3. **Montagem do `split`** para envio ao gateway:
   ```ts
   const split = [
     { walletId: process.env.WALLETID_FORNECEDOR!, fixedValue: cost },
     { walletId: process.env.WALLETID_VENDEDOR!,   fixedValue: sellerMargin },
     { walletId: process.env.WALLETID_HOST!,       fixedValue: hostCommission },
     { walletId: process.env.WALLETID_PLATFORM!,   fixedValue: platformCommission },
   ];

   const payload = { value: grossFinal, split };
   ```
4. **Persistência** em `commission_log`:
   ```sql
   INSERT INTO commission_log (
     cost, sale_price, seller_margin,
     host_commission, platform_commission,
     fee_fixed, fee_percent,
     gross_value, split_payload, created_at
   ) VALUES (...);
   ```
5. **Resposta** (`OutputData`):
   ```json
   {
     "grossFinal": number,
     "feeFixed": number,
     "feePercent": number,
     "platformMargin": number,
     "split": [ ... ]
   }
   ```

---

## 4. Boas Práticas

- **Variáveis sensíveis:** Vault/GitHub Secrets. `.env` não versionado.  
- **Tipagem:** TypeScript + validação (e.g. Zod) para `InputData`.  
- **Logs & Monitoramento:** `morgan` → agregador externo (ELK/Grafana).  
- **Tratamento de erros:** Sentry + `try/catch` em commits DB.  
- **Testes:** Jest cobrindo `fees.ts` e rota `/calculate`, meta ≥80%.

---

## 5. Observabilidade

- **OpenTelemetry:** instrumentar o serviço para rastreamento distribuído (traces).  
- **Prometheus:** expor métricas (counters para contagem de requisições, histograms para latência, gauges para uso de recursos).  
- **Dashboards:** configurar visualizações no Grafana para monitorar performance e erros.  
- **Kubernetes Probes:** readiness e liveness para health checks.

---

## 6. Extensibilidade

- **Split Dinâmico:** carregar configuração de wallets (IDs e percentuais/fixedValues) de um JSON ou tabela DB, permitindo adicionar/remover níveis sem deploy.  
- **Regras de Comissão:** suportar novas regras (por exemplo, escalonamento de percentuais) via arquivos de configuração.  
- **Hooks:** pré e pós processamento para customizar cálculo e payload antes do envio ao gateway.

---

## 7. CI/CD e Deploy

1. **GitHub Actions**:  
   - Lint (ESLint)  
   - Type-check (`tsc`)  
   - Testes (Jest)  
   - Build & push Docker image
2. **Kubernetes**:  
   - Helm chart com Deployment (readiness/liveness), Service e ConfigMap.  
   - Canary via ArgoCD.

---

## 8. Próximos Passos

- **Autenticação:** implementar JWT + RBAC no endpoint `/calculate`.  
- **Documentação:** exemplos de payload no Wiki, Postman collection e aprimorar Swagger.  
- **Governança:** versionamento de API e plano de rollback de migrations.  
- **Análises:** relatórios de uso da engine e auditoria de logs de comissão.

*Commission Engine PoC — Diretrizes Next MultiApp*

