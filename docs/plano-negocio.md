# Estrutura Multi-tenant PocketBase — m

Implementamos a base multi-tenant do sistema no banco usando PocketBase, já preparada para isolamento de dados entre diferentes clientes (tenants) desde o desenvolvimento.

## Estrutura das Coleções

### 1. m24_clientes
- Cadastro central de cada cliente (tenant).
- Campo `documento` (CPF ou CNPJ) obrigatório e único, para identificação fiscal e integrações.
- Demais campos: `nome`, `dominio`, `logo_url`, `cor_primaria`, `responsavel_nome`, `responsavel_email`, `ativo`, `created`.

### 2. Coleções filhas (usuarios, produtos, pedidos, inscricoes)
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
