# 🗄️ Banco de Dados - Sistema de Fornecedores

Este documento descreve a estrutura completa do banco de dados PocketBase para suportar o sistema de fornecedores/marketplace implementado.

## 📊 Visão Geral das Coleções

### **Coleções Principais**
- `vendors` - Fornecedores cadastrados
- `vendor_analytics` - Métricas e analytics dos fornecedores
- `vendor_notifications` - Notificações para fornecedores
- `comissoes` - Comissões geradas por vendas
- `saques_comissao` - Solicitações de saque
- `produto_avaliacoes` - Avaliações de produtos
- `marketplace_config` - Configurações do marketplace

### **Coleções Modificadas**
- `produtos` - Produtos com campos de marketplace
- `users` - Usuários com role de fornecedor
- `pedidos` - Pedidos com informações de comissão

---

## 🏢 Coleção: `vendors`

Armazena informações completas dos fornecedores.

```javascript
{
  "id": "string", // Auto-gerado
  "nome": "string", // Nome completo do fornecedor
  "nome_fantasia": "string?", // Nome comercial/marca
  "documento": "string", // CPF ou CNPJ
  "tipo_documento": "string", // "cpf" | "cnpj"
  "email": "string", // Email principal
  "telefone": "string", // Telefone de contato
  "data_nascimento": "date?", // Data de nascimento (CPF)
  
  // Endereço
  "endereco_cep": "string",
  "endereco_rua": "string", 
  "endereco_numero": "string",
  "endereco_complemento": "string?",
  "endereco_bairro": "string",
  "endereco_cidade": "string",
  "endereco_estado": "string",
  "endereco_pais": "string", // Default: "Brasil"
  
  // Status e aprovação
  "status": "string", // "ativo" | "suspenso" | "pendente_aprovacao" | "rejeitado"
  "data_aprovacao": "datetime?",
  "aprovado_por": "relation(users)?", // Quem aprovou
  "motivo_rejeicao": "text?",
  
  // Configurações financeiras
  "comissao_percentual": "number", // % de comissão padrão
  "valor_minimo_saque": "number", // Valor mínimo para saque
  
  // Dados bancários
  "banco": "string",
  "agencia": "string",
  "conta": "string",
  "tipo_conta": "string", // "corrente" | "poupanca"
  "titular": "string",
  "documento_titular": "string",
  
  // Configurações
  "auto_aprovar_produtos": "bool", // Default: false
  "notificar_vendas": "bool", // Default: true
  "notificar_comissoes": "bool", // Default: true
  "periodo_saque": "string", // "semanal" | "quinzenal" | "mensal"
  
  // Informações adicionais
  "logo_url": "file?", // Logo do fornecedor
  "descricao": "text?",
  "website": "url?",
  "instagram": "string?",
  "facebook": "string?",
  "whatsapp": "string?",
  
  // Documentos de verificação
  "documentos_verificacao": "file[]", // Documentos enviados
  
  // Controle
  "cliente": "relation(clientes)", // Tenant
  "created_by": "relation(users)", // Quem cadastrou
  "created_by_role": "string", // Role de quem cadastrou
  "created": "datetime",
  "updated": "datetime"
}
```

### **Índices**
- `email` (único por cliente)
- `documento` (único por cliente)
- `cliente + status`
- `created_by`

### **Regras de Acesso**
```javascript
// List/View
"@request.auth.verified = true && (@request.auth.role = 'coordenador' || @request.auth.role = 'lider' || id = @request.auth.vendor_id)"

// Create
"@request.auth.verified = true && (@request.auth.role = 'coordenador' || @request.auth.role = 'lider')"

// Update
"@request.auth.verified = true && (@request.auth.role = 'coordenador' || (@request.auth.role = 'lider' && status != 'ativo') || id = @request.auth.vendor_id)"

// Delete
"@request.auth.verified = true && @request.auth.role = 'coordenador'"
```

---

## 📦 Coleção: `produtos` (Modificada)

Produtos com campos adicionais para marketplace.

```javascript
{
  // Campos existentes do produto...
  "id": "string",
  "nome": "string",
  "descricao": "text",
  "detalhes": "text?",
  "preco": "number",
  "preco_bruto": "number",
  "categoria": "string",
  "slug": "string",
  "imagens": "file[]",
  "tamanhos": "json", // Array de tamanhos
  "cores": "json", // Array de cores  
  "generos": "json", // Array de gêneros
  "ativo": "bool",
  "requer_inscricao_aprovada": "bool",
  "exclusivo_user": "bool",
  "evento_id": "relation(eventos)?",
  
  // Campos do marketplace
  "vendor_id": "relation(vendors)", // Fornecedor responsável
  "origem": "string", // "admin" | "vendor"
  "created_by": "relation(users)", // Quem criou
  "created_by_role": "string", // Role de quem criou
  
  // Moderação e aprovação
  "moderacao_status": "string", // "pendente" | "aprovado" | "rejeitado" | "revisao"
  "aprovado": "bool", // Default: false
  "aprovado_por": "relation(users)?",
  "aprovado_por_role": "string?",
  "data_aprovacao": "datetime?",
  "motivo_rejeicao": "text?",
  "observacoes_internas": "text?",
  
  // Marketplace específico
  "destaque": "bool", // Produto em destaque
  "vendas_totais": "number", // Default: 0
  "estoque_disponivel": "number",
  "estoque_minimo": "number", // Default: 5
  "peso": "number?", // Para cálculo de frete
  "dimensoes_altura": "number?",
  "dimensoes_largura": "number?", 
  "dimensoes_profundidade": "number?",
  
  // Controle
  "cliente": "relation(clientes)",
  "created": "datetime",
  "updated": "datetime"
}
```

### **Índices Adicionais**
- `vendor_id + moderacao_status`
- `cliente + aprovado + ativo`
- `created_by + moderacao_status`
- `destaque + aprovado`

---

## 💰 Coleção: `comissoes`

Comissões geradas por vendas de produtos.

```javascript
{
  "id": "string",
  "vendor_id": "relation(vendors)",
  "pedido_id": "relation(pedidos)",
  "produto_id": "relation(produtos)",
  "produto_nome": "string", // Cache do nome
  "cliente_nome": "string", // Cache do nome do cliente
  
  // Valores
  "valor_venda": "number",
  "percentual_comissao": "number",
  "valor_comissao": "number",
  
  // Status e datas
  "status": "string", // "pendente" | "liberada" | "paga" | "cancelada"
  "data_venda": "datetime",
  "data_liberacao": "datetime?",
  "data_pagamento": "datetime?",
  
  // Pagamento
  "forma_pagamento": "string?", // "pix" | "ted" | "doc"
  "comprovante_pagamento": "file?",
  "observacoes": "text?",
  
  // Controle
  "cliente": "relation(clientes)",
  "created": "datetime",
  "updated": "datetime"
}
```

### **Índices**
- `vendor_id + status`
- `pedido_id`
- `cliente + data_venda`
- `status + data_liberacao`

---

## 💸 Coleção: `saques_comissao`

Solicitações de saque de comissões.

```javascript
{
  "id": "string",
  "vendor_id": "relation(vendors)",
  "comissoes_ids": "json", // Array de IDs das comissões
  
  // Valores
  "valor_solicitado": "number",
  "taxa_saque": "number", // Default: 5.00
  "valor_liquido": "number", // valor_solicitado - taxa_saque
  
  // Status e processamento
  "status": "string", // "solicitado" | "processando" | "pago" | "cancelado"
  "data_solicitacao": "datetime",
  "data_processamento": "datetime?",
  "data_pagamento": "datetime?",
  
  // Processamento
  "processado_por": "relation(users)?",
  "forma_pagamento": "string?", // "pix" | "ted" | "doc"
  "comprovante": "file?",
  "observacoes": "text?",
  
  // Controle
  "cliente": "relation(clientes)",
  "created": "datetime",
  "updated": "datetime"
}
```

---

## ⭐ Coleção: `produto_avaliacoes`

Avaliações dos produtos pelos clientes.

```javascript
{
  "id": "string",
  "produto_id": "relation(produtos)",
  "cliente_id": "relation(users)", // Cliente que avaliou
  "pedido_id": "relation(pedidos)", // Pedido relacionado
  
  // Avaliação
  "nota": "number", // 1-5
  "comentario": "text?",
  "data_compra": "datetime",
  "verificada": "bool", // Compra verificada
  
  // Resposta do fornecedor
  "resposta_vendor": "text?",
  "data_resposta": "datetime?",
  
  // Moderação
  "status": "string", // "ativa" | "moderada" | "removida"
  "denuncias": "number", // Default: 0
  
  // Controle
  "cliente": "relation(clientes)",
  "created": "datetime",
  "updated": "datetime"
}
```

---

## 📊 Coleção: `vendor_analytics`

Analytics mensais dos fornecedores.

```javascript
{
  "id": "string",
  "vendor_id": "relation(vendors)",
  "periodo": "string", // "YYYY-MM"
  
  // Métricas de vendas
  "vendas_quantidade": "number",
  "vendas_valor": "number",
  "comissao_valor": "number",
  "ticket_medio": "number",
  
  // Métricas de produtos
  "produtos_cadastrados": "number",
  "produtos_aprovados": "number",
  "produtos_rejeitados": "number",
  "visualizacoes_produtos": "number",
  
  // Métricas de satisfação
  "avaliacoes_recebidas": "number",
  "nota_media": "number",
  "conversao_taxa": "number", // %
  
  // Controle
  "cliente": "relation(clientes)",
  "created": "datetime",
  "updated": "datetime"
}
```

---

## 🔔 Coleção: `vendor_notifications`

Notificações para fornecedores.

```javascript
{
  "id": "string",
  "vendor_id": "relation(vendors)",
  
  // Notificação
  "tipo": "string", // "nova_venda" | "produto_aprovado" | "produto_rejeitado" | "comissao_liberada" | "saque_processado"
  "titulo": "string",
  "mensagem": "text",
  "link": "string?", // Link para ação relacionada
  "dados_extras": "json?", // Dados adicionais
  
  // Status
  "lida": "bool", // Default: false
  "data_leitura": "datetime?",
  
  // Controle
  "cliente": "relation(clientes)",
  "created": "datetime"
}
```

---

## ⚙️ Coleção: `marketplace_config`

Configurações globais do marketplace por cliente.

```javascript
{
  "id": "string",
  "cliente": "relation(clientes)",
  
  // Configurações gerais
  "habilitado": "bool", // Default: true
  "comissao_padrao": "number", // Default: 25
  "valor_minimo_saque": "number", // Default: 20
  "taxa_saque": "number", // Default: 5
  "periodo_retencao_dias": "number", // Default: 7
  
  // Moderação
  "moderacao_produtos": "bool", // Default: true
  "auto_aprovar_vendors": "bool", // Default: false
  "categorias_permitidas": "json", // Array de categorias
  
  // Pagamentos
  "formas_pagamento_comissao": "json", // ["pix", "ted", "doc"]
  
  // Notificações
  "notificar_novo_vendor": "bool", // Default: true
  "notificar_novo_produto": "bool", // Default: true
  "notificar_venda": "bool", // Default: true
  
  // Textos legais
  "termos_uso_vendor": "text?",
  "politica_comissao": "text?",
  
  "created": "datetime",
  "updated": "datetime"
}
```

---

## 👥 Coleção: `users` (Modificada)

Usuários com suporte ao role de fornecedor.

```javascript
{
  // Campos existentes...
  "id": "string",
  "nome": "string",
  "email": "string",
  "telefone": "string?",
  "role": "string", // "coordenador" | "lider" | "usuario" | "fornecedor"
  
  // Campos adicionais para fornecedores
  "vendor_id": "relation(vendors)?", // Referência ao fornecedor
  "vendor_approved": "bool?", // Se fornecedor foi aprovado
  
  // Controle existente...
  "cliente": "relation(clientes)",
  "created": "datetime",
  "updated": "datetime"
}
```

---

## 🛒 Coleção: `pedidos` (Modificada)

Pedidos com informações de comissão.

```javascript
{
  // Campos existentes...
  "id": "string",
  "produto": "relation(produtos)[]",
  "valor": "number",
  "status": "string",
  
  // Campos adicionais
  "vendor_ids": "json", // Array de vendor_ids dos produtos
  "gera_comissao": "bool", // Default: true
  "comissao_calculada": "bool", // Default: false
  "comissao_valor_total": "number?", // Valor total de comissões
  
  // Controle existente...
  "cliente": "relation(clientes)",
  "created": "datetime",
  "updated": "datetime"
}
```

---

## 🗂️ Coleções Auxiliares

### **`queue_jobs`** - Processamento assíncrono
```javascript
{
  "id": "string",
  "tipo": "string", // "calcular_comissao" | "processar_saque" | "enviar_email" | "atualizar_analytics"
  "payload": "json",
  "status": "string", // "pendente" | "processando" | "concluido" | "falhou"
  "prioridade": "string", // "alta" | "media" | "baixa"
  "tentativas": "number",
  "max_tentativas": "number",
  "agendado_para": "datetime?",
  "processado_em": "datetime?",
  "erro": "text?",
  "cliente": "relation(clientes)",
  "created": "datetime"
}
```

### **`denuncia_vendor`** - Sistema de denúncias
```javascript
{
  "id": "string",
  "vendor_id": "relation(vendors)",
  "denunciante_id": "relation(users)?",
  "tipo": "string", // "produto_inadequado" | "comportamento_inadequado" | "fraude" | "outros"
  "descricao": "text",
  "evidencias": "file[]",
  "status": "string", // "aberta" | "investigando" | "resolvida" | "improcedente"
  "resolucao": "text?",
  "resolvida_por": "relation(users)?",
  "data_resolucao": "datetime?",
  "cliente": "relation(clientes)",
  "created": "datetime"
}
```

---

## 📋 Scripts de Migração

### **1. Criação das novas coleções**
```javascript
// Executar no PocketBase Admin
migrate((db) => {
  // Criar coleção vendors
  const vendorsCollection = new Collection({
    name: "vendors",
    type: "base",
    schema: [
      // Definir todos os campos conforme documentação acima
    ]
  });
  
  return Dao(db).saveCollection(vendorsCollection);
});
```

### **2. Atualização da coleção users**
```javascript
migrate((db) => {
  const usersCollection = Dao(db).findCollectionByNameOrId("users");
  
  // Adicionar novos campos
  usersCollection.schema.push({
    name: "vendor_id",
    type: "relation",
    required: false,
    options: {
      collectionId: "vendors",
      cascadeDelete: false
    }
  });
  
  return Dao(db).saveCollection(usersCollection);
});
```

### **3. Atualização da coleção produtos**
```javascript
migrate((db) => {
  const produtosCollection = Dao(db).findCollectionByNameOrId("produtos");
  
  // Adicionar campos do marketplace
  const newFields = [
    { name: "vendor_id", type: "relation", options: { collectionId: "vendors" }},
    { name: "origem", type: "select", options: { values: ["admin", "vendor"] }},
    { name: "moderacao_status", type: "select", options: { values: ["pendente", "aprovado", "rejeitado", "revisao"] }},
    // ... outros campos
  ];
  
  newFields.forEach(field => produtosCollection.schema.push(field));
  
  return Dao(db).saveCollection(produtosCollection);
});
```

---

## 🔍 Queries Úteis

### **Fornecedores por status**
```javascript
// PocketBase SDK
const vendors = await pb.collection('vendors').getFullList({
  filter: 'status = "ativo" && cliente = "CLIENT_ID"',
  sort: '-created'
});
```

### **Produtos pendentes de aprovação**
```javascript
const produtosPendentes = await pb.collection('produtos').getFullList({
  filter: 'moderacao_status = "pendente" && cliente = "CLIENT_ID"',
  expand: 'vendor_id,created_by',
  sort: '-created'
});
```

### **Comissões liberadas por fornecedor**
```javascript
const comissoesLiberadas = await pb.collection('comissoes').getFullList({
  filter: 'vendor_id = "VENDOR_ID" && status = "liberada"',
  sort: '-data_liberacao'
});
```

### **Analytics do fornecedor**
```javascript
const analytics = await pb.collection('vendor_analytics').getFirstListItem({
  filter: 'vendor_id = "VENDOR_ID" && periodo = "2024-01"'
});
```

---

## 🔐 Configurações de Segurança

### **Regras de API**
- Todas as coleções devem validar o `cliente` (tenant)
- Fornecedores só acessam próprios dados
- Líderes acessam fornecedores do território
- Coordenadores têm acesso completo

### **Hooks do PocketBase**
```javascript
// Hook para calcular comissões após venda
onAfterRecordUpdate((e) => {
  if (e.collection.name === "pedidos" && e.record.status === "pago") {
    // Calcular e criar comissões
    calculateCommissions(e.record);
  }
});

// Hook para notificar aprovação de produto
onAfterRecordUpdate((e) => {
  if (e.collection.name === "produtos" && e.record.moderacao_status === "aprovado") {
    // Notificar fornecedor
    notifyVendor(e.record.vendor_id, "produto_aprovado", e.record);
  }
});
```

---

## 📊 Resumo Final

### **Coleções Criadas: 8**
- `vendors`
- `comissoes` 
- `saques_comissao`
- `produto_avaliacoes`
- `vendor_analytics`
- `vendor_notifications`
- `marketplace_config`
- `queue_jobs`

### **Coleções Modificadas: 3**
- `users` (+ campos de fornecedor)
- `produtos` (+ campos de marketplace)
- `pedidos` (+ campos de comissão)

### **Índices Recomendados: 15+**
- Performance otimizada para consultas frequentes
- Suporte a filtros complexos
- Relacionamentos eficientes

Esta estrutura suporta completamente o sistema de fornecedores implementado, garantindo performance, segurança e escalabilidade! 🚀