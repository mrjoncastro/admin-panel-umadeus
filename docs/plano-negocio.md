# Estrutura Multi-tenant PocketBase — m

Implementamos a base multi-tenant do sistema no banco usando PocketBase, já preparada para isolamento de dados entre diferentes clientes (tenants) desde o desenvolvimento.

## Estrutura das Coleções

### 1. m24_clientes
- Cadastro central de cada cliente (tenant).
- Campo `documento` (CPF ou CNPJ) obrigatório e único, para identificação fiscal e integrações.


#### Tabela de Campos

| Campo | Descrição |
|-------|-----------|
| `documento` | CPF ou CNPJ do cliente, usado em integrações. |
| `nome` | Nome ou razão social do cliente. |
| `dominio` | Endereço principal configurado. |
| `tipo_dominio` | Indica se o cliente usa subdomínio ou domínio próprio. |
| `verificado` | Confirma se o domínio está validado. |
| `modo_validacao` | Método adotado para validação do domínio. |
| `logo_url` | URL do logotipo exibido na plataforma. |
| `cor_primary` | Cor principal utilizada na personalização. |
| `responsavel_nome` | Nome da pessoa responsável. |
| `responsavel_email` | E-mail de contato do responsável. |
| `ativo` | Indica se o cliente está ativo no sistema. |
| `created` | Data de criação do cadastro. |

### 2. clientes_config
- Mapeia cada domínio para o ID do cliente correspondente (`cliente`).
- Serve de ponte para que funções como `getTenantFromHost` identifiquem o tenant a partir do hostname.

### 3. Coleções filhas (usuarios, produtos, pedidos, inscricoes)
- Todas possuem campo de relação obrigatória `cliente` (referência à coleção `clientes`).
- Isso garante que todo registro esteja sempre vinculado a um cliente.

## Permissões e Lógica Multi-tenant

- Todas queries, leituras e gravações devem ser filtradas pelo campo `cliente`.
- **É obrigatório que toda criação, edição, atualização ou exclusão de usuários, pedidos, inscrições, compras e quaisquer outros registros SEMPRE inclua o campo `cliente`, vinculando corretamente ao cliente (tenant) em questão.**
- O fluxo de autenticação, consulta ou cadastro deve sempre:
  1. **Procurar primeiro o cliente** (tenant) usando `documento` (CPF/CNPJ) ou domínio.
  2. **Isolar todas as operações** usando o ID do cliente (campo `cliente`).
  3. Garantir que cada usuário veja/edite apenas dados do seu próprio cliente (tenant).

> **Exemplo de filtro em query:**
> Buscar pedidos apenas do cliente autenticado:
> ```js
> pb.collection('pedidos').getFullList({ filter: `cliente='ID_DO_CLIENTE'` })
> ```

- O escopo do usuário (coordenador, lider, usuario) deve ser respeitado dentro do tenant.

As rotas de servidor (`/api`) chamam `getTenantFromHost` para identificar o cliente pelo domínio. Essa função consulta `clientes_config` e retorna o ID que será usado para buscar as credenciais em `m24_clientes`.

## Benefícios

- Estrutura pronta para SaaS: escalável, segura, pronta para deploy em nuvem.
- Fácil integração com pagamentos, notas fiscais e automações.
- Permissões e isolamento já padronizados desde o desenvolvimento local.

---

> Adote este padrão multi-tenant em toda a aplicação, SEMPRE consultando, criando e isolando pelo cliente antes de qualquer outra operação — isso inclui obrigatoriamente toda criação, edição e atualização de registros nas coleções filhas. Assim, a transição para produção será transparente e segura.


# Integração Multi-tenant com Asaas (Subcontas)

## 1. Uso de Subcontas e API Key do Asaas

* **Cada cliente (tenant) possui sua própria subconta no Asaas.**
* Para cada subconta, armazene com segurança a respectiva **API Key** (ex: campo `asaas_api_key` na coleção `m24_clientes`).
* Toda operação de cobrança, consulta ou emissão de pagamento deve sempre utilizar a **API Key da subconta do cliente envolvido**.
* **Nunca exponha a API Key de nenhuma subconta no frontend.** Toda requisição ao Asaas deve ser feita via backend, buscando a chave correta do cliente antes de qualquer chamada.

## 2. Webhook do Asaas em ambiente multi-tenant

* O webhook do Asaas aponta para um único endpoint:

  ```
  https://SEUDOMINIO.com/api/asaas/webhook
  ```
* Ao receber uma notificação:

  1. **Identifique a subconta do evento** (usando `accountId` do payload ou relacionando pelo `id_pagamento` ao pedido/inscrição).
  2. Busque no banco o cliente dono da subconta (`m24_clientes.asaas_api_key` ou `m24_clientes.asaas_account_id`).
  3. Atualize registros apenas desse cliente.
  4. Registre/logue o evento para conciliação.

## 3. Fluxo multi-tenant usando subcontas

* Sempre que interagir com o Asaas, busque a **API Key da subconta** do cliente responsável:

  ```js
  // Exemplo: buscar chave da subconta
  const cliente = await pb.collection('m24_clientes').getOne(CLIENTE_ID)
  const apiKey = cliente.asaas_api_key
  // Usar apiKey na autenticação das chamadas
  ```

* O campo `asaas_account_id` também pode ser salvo para facilitar matching no webhook.

* **Pedidos estão sempre vinculados a inscrições, enquanto compras realizadas na loja não têm relação com inscrições.**

* **Ao criar um pedido ou compra, envie o campo `externalReference` (externalID) com uma estrutura clara que permita identificar o `cliente`, o `usuario` e, quando aplicável, a `inscricao`.**

  * Exemplo de formato:

    ```json
    {
      "externalReference": "cliente_abc123_usuario_xyz789_inscricao_456def"
    }
    ```
  * Para compras sem inscrição:

    ```json
    {
      "externalReference": "cliente_abc123_usuario_xyz789"
    }
    ```
  * No webhook, o backend deve extrair esse identificador e usá-lo para localizar com segurança o cliente e o usuário responsáveis pela transação.

## 4. Segurança

* Armazene as API Keys das subcontas em campo seguro. Nunca exponha ao frontend.
* O backend deve garantir que nenhuma operação de um cliente utilize a API Key de outro.

---

> Toda integração com o Asaas deve buscar e utilizar a API Key da subconta correta do cliente (tenant) em todas as etapas (criação de cobrança, consultas, webhooks, etc). O sistema deve garantir o isolamento completo das operações financeiras entre clientes, tanto nas requisições quanto no processamento dos eventos retornados pelo Asaas. O campo `externalReference` deve ser sempre preenchido com um identificador claro que contenha a origem da transação (cliente, usuário e, se aplicável, inscrição).

# Requisitos Funcionais - Módulo Financeiro (Integração com Asaas)

## 📃 User Stories

### Transferências externas (Pix ou TED)

* **Como** usuário administrador da conta, **quero** realizar uma transferência externa para conta bancária ou chave Pix, **para** sacar saldo ou enviar valores externos.

  * Deve suportar: valor, conta bancária (banco, agência, conta, tipo), ou chave Pix (tipo e valor), agendamento opcional, descrição e `externalReference`.

### Transferência interna (entre contas Asaas)

* **Como** usuário administrador, **quero** transferir entre minha conta Asaas e subcontas vinculadas, **para** distribuir saldos.

  * Deve solicitar `walletId` da conta de destino, com transferência imediata e sem custos.

### Consultar transferências

* **Como** administrador, **quero** listar todas as transferências feitas, **para** acompanhar histórico com paginação e filtros.
* **Como** administrador, **quero** recuperar detalhes de uma transferência específica por `id`, **para** analisar status e dados retornados.

### Cancelar transferência agendada

* **Como** administrador, **quero** cancelar uma transferência agendada externa antes da execução, **para** evitar envio indevido.

### Consultar saldo da conta

* **Como** administrador, **quero** recuperar meu saldo atual disponível via API, **para** tomar decisões financeiras.

### Outras informações financeiras

* **Como** administrador, **quero** ver estatísticas de cobranças e valores de split, **para** analisar receitas e repasses.

---

## 🔍 Caso de Uso – “Fazer transferência externa via Pix/TED”

* **Nome**: Transferência Externa

* **Atores**: Administrador

* **Pré-condição**:

  * Usuário autenticado com permissão `transfer.create`
  * Saldo disponível ≥ valor solicitado

* **Fluxo Principal**:

  1. Usuário escolhe “Transferência Externa” na UI
  2. Seleciona método: “Conta bancária” ou “Pix”
  3. Preenche dados: valor, conta/chave Pix, data opcional e descrição
  4. (Opcional) Insere `externalReference`
  5. Confirma e clica em “Enviar”
  6. Sistema chama `POST /v3/transfers`

     * Se `pixAddressKey`: Pix
     * Se `bankAccount`: TED
  7. Exibe status (sucesso ou erro)

* **Fluxos Alternativos**:

  * Dados inválidos: mostrar mensagem por campo
  * Erro HTTP 409: exibir erro de duplicidade

* **Requisitos Funcionais**:

  1. Validar campos obrigatórios (valor > 0, dados bancários ou Pix)
  2. Suportar `externalReference`
  3. Escolha automática entre Pix/TED conforme dados
  4. Tratar status HTTP e exibir resposta
  5. Permitir cancelamento de transferências agendadas

* **Riscos**:

  * HTTP 409 por duplicidade
  * Uso incorreto da chave Pix pode redirecionar fundos

---

## 📆 Caso de Uso – “Consultar saldo”

* **Nome**: Visualizar Saldo

* **Atores**: Administrador

* **Pré-condição**: Conta autenticada

* **Fluxo Principal**:

  1. Usuário acessa aba Financeiro
  2. Seleciona “Ver Saldo”
  3. Chama `GET /v3/account/balance`
  4. Exibe: saldo disponível, saldo em processamento, limite, etc.

* **Requisitos Funcionais**:

  * Mostrar todos os campos retornados pela API
  * Atualizar informação em tempo real

* **Riscos**:

  * Necessária interpretação correta de cada campo financeiro

---

## ✅ Sumário dos Requisitos

| ID       | User Story                         | Endpoint Asaas            | Requisitos principais                                           |
| -------- | ---------------------------------- | ------------------------- | --------------------------------------------------------------- |
| US-FT-01 | Transferência externa Pix/TED      | POST /v3/transfers        | valor, conta/chave, agendamento, descrição, `externalReference` |
| US-FT-02 | Transferência interna entre contas | POST /v3/transfers        | `walletId`, transferência imediata                              |
| US-FT-03 | Listar transferências              | GET /v3/transfers         | paginação, filtros                                              |
| US-FT-04 | Detalhes da transferência          | GET /v3/transfers/{id}    | status, dados da operação                                       |
| US-FT-05 | Cancelar transferência             | DELETE /v3/transfers/{id} | antes da execução                                               |
| US-FT-06 | Consultar saldo                    | GET /v3/account/balance   | mostrar todos os campos da resposta                             |
| US-FT-07 | Estatísticas e split               | GET endpoints financeiros | dados consolidados                                              |

---

## 📌 Requisitos Não Funcionais

1. **Desempenho**:

   * As operações de listagem e consulta devem responder em até 2 segundos para até 100 itens.
   * Transferências devem ser registradas em até 1 segundo após confirmação.

2. **Segurança**:

   * Todas as chamadas à API devem ser autenticadas via token seguro.
   * Dados bancários devem ser criptografados em trânsito e em repouso.

3. **Disponibilidade**:

   * O sistema deve estar disponível 99,5% do tempo mensal.
   * API de integração com o Asaas deve ter fallback para indisponibilidade temporária.

4. **Escalabilidade**:

   * A aplicação deve ser capaz de suportar 1000 transferências simultâneas sem degradação.

5. **Auditabilidade**:

   * Toda solicitação de transferência deve ser registrada com timestamp, IP de origem e identificador do usuário.

6. **Usabilidade**:

   * A UI deve fornecer mensagens de erro claras em caso de falha.
   * Campos devem ter validação instantânea no frontend.

7. **Conformidade**:

   * O módulo financeiro deve seguir as diretrizes da LGPD e normas do BACEN para operações financeiras eletrônicas.
