# Estrutura Multi-tenant PocketBase — m

Implementamos a base multi-tenant do sistema no banco usando PocketBase, já preparada para isolamento de dados entre diferentes clientes (tenants) desde o desenvolvimento.

---

## 1. Estrutura das Coleções

### 1.1. `m24_clientes`

Cadastro central de cada cliente (tenant).

- **Campo `documento`** (CPF ou CNPJ) **obrigatório** e **único**, para identificação fiscal e integrações.
- Outros campos principais:

  - `nome`: Nome ou razão social do cliente.
  - `dominio`: Endereço principal configurado.
  - `tipo_dominio`: `subdominio` ou `proprio`, indicando a forma de domínio.
  - `verificado`: Boolean, confirma se o domínio está validado.
  - `modo_validacao`: `manual` ou `wildcard`.
  - `logo_url`: URL do logotipo exibido na plataforma.
  - `cor_primary`: Cor principal utilizada na personalização (hex).
  - `responsavel_nome` e `responsavel_email`: Dados de contato do responsável.
  - `ativo`: Boolean, indica se o cliente está ativo.
  - `created`: Timestamp de criação do cadastro.

#### Tabela de Campos (exemplo)

| Campo             | Tipo     | Obrigatório | Observações                       |
| ----------------- | -------- | ----------- | --------------------------------- |
| documento         | String   | Sim         | CPF ou CNPJ (único)               |
| nome              | String   | Sim         | Razão social ou nome completo     |
| dominio           | String   | Não         | Domínio ou subdomínio configurado |
| tipo_dominio      | Enum     | Não         | `subdominio` / `proprio`          |
| verificado        | Boolean  | Não         | Indica validação do domínio       |
| modo_validacao    | Enum     | Sim         | `manual` / `wildcard`             |
| logo_url          | String   | Não         | URL de exibição do logo           |
| cor_primary       | String   | Não         | Cor principal (hex)               |
| responsavel_nome  | String   | Não         | Nome do contato                   |
| responsavel_email | String   | Não         | Email do contato                  |
| ativo             | Boolean  | Sim         | Status de ativação                |
| created           | DateTime | Sim         | Data e hora de criação            |

### 1.2. `clientes_config`

Mapeia cada domínio para o ID do cliente correspondente (`cliente`).

| Campo               | Tipo         | Obrigatório | Observações                        |
| ------------------- | ------------ | ----------- | ---------------------------------- |
| id                  | String       | Sim         | Identificador único                |
| dominio             | String       | Sim         | Domínio ou hostname                |
| cliente             | String (ref) | Sim         | `m24_clientes.id`                  |
| cor_primary         | String       | Não         | Cor primária para o domínio        |
| logo_url            | String       | Sim         | URL do logo                        |
| font                | String       | Não         | Fonte padrão da interface          |
| nome                | String       | Não         | Nome descritivo da configuração    |
| confirma_inscricoes | Boolean      | Não         | Habilita confirmação de inscrições |
| created             | DateTime     | Sim         | Timestamp de criação               |
| updated             | DateTime     | Sim         | Timestamp da última atualização    |

### 1.3. Coleções Filhas

Todas as coleções filhas (`usuarios`, `produtos`, `pedidos`, `inscricoes`, etc.) possuem o campo `cliente` (referência a `m24_clientes.id`) **obrigatório**, garantindo que todo dado seja associado a um tenant.

---

## 2. Permissões e Lógica Multi-tenant

1. **Filtro por cliente**: Todas as operações (queries, leituras, gravações) devem usar o campo `cliente` para isolar dados.
2. **Inclusão obrigatória**: Em criação, edição ou deleção de registros nas coleções filhas, incluir sempre o ID do cliente.
3. **Identificação do tenant**: Nas rotas de servidor (`/api`), use `getTenantFromHost` para mapear `Host` ➔ `clientes_config` ➔ `m24_clientes.id`.
4. **Escopo de usuário**: Cada perfil (`coordenador`, `lider`, `usuario`) só acessa dados do seu tenant.

> **Exemplo de filtro**:
>
> ```js
> pb.collection("pedidos").getFullList({ filter: `cliente='ID_DO_CLIENTE'` });
> ```

---

## 3. Benefícios

- **Pronto para SaaS**: Escalável e seguro, com isolamento de dados.
- **Integrações**: Facilita integração com pagamentos, notas fiscais e automações.
- **Permissões**: Isolamento e acesso controlado desde o início.

---

# Integração Multi-tenant com Asaas (Subcontas)

## 4. Uso de Subcontas e API Key do Asaas

- Cada cliente (tenant) possui sua própria subconta Asaas.
- Armazene em `m24_clientes.asaas_api_key` e `asaas_account_id` com segurança.
- Utilize **sempre** essa API Key no backend para cobranças, consultas e pagamentos.
- **Nunca** exponha a subconta no frontend.

## 5. Webhook do Asaas em Ambiente Multi-tenant

- Endpoint único:

  ```
  POST https://SEUDOMINIO.com/api/asaas/webhook
  ```

- Fluxo ao receber evento:

  1. Identificar `accountId` no payload.
  2. Buscar `m24_clientes` pelo `asaas_account_id`.
  3. Processar e atualizar somente registros desse cliente.
  4. Log para conciliação.

## 6. Fluxo Multi-tenant com Subcontas

1. Ao qualquer chamada ao Asaas, recupere:

   ```js
   const cliente = await pb.collection("m24_clientes").getOne(CLIENTE_ID);
   const apiKey = cliente.asaas_api_key;
   ```

2. Use `apiKey` no header de autenticação.
3. Utilize `asaas_account_id` para matching em webhooks.
4. Em `externalReference`, inclua identificadores:

   ```json
   {
     "externalReference": "cliente_${cliente.id}_usuario_${usuario.id}_inscricao_${inscricao.id}"
   }
   ```

## 7. Segurança

- Guarde as subcontas em campos seguros no banco.
- Backend só usa API Key correta por cliente.
- Sem cross-tenant leaks.

---

## 8. Cálculo de Cobranças

- Consulte o arquivo `docs/plano-negocio.md` para detalhes da lógica de cobrança.

---

> **Observação Final:**
> Adote este padrão multi-tenant em toda aplicação, garantindo que **toda** operação referencie e isole dados pelo `cliente` antes de prosseguir.
