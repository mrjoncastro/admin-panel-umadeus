# 🏪 Perfil Fornecedor - Arquitetura de Marketplace

Este documento descreve a implementação do **perfil fornecedor** no sistema M24Vendas, seguindo a arquitetura de marketplace onde o líder/coordenador atua como intermediário entre clientes e fornecedores.

## 🎯 Conceito Arquitetural

### Modelo de Marketplace
- **Líder/Coordenador**: Figura central que serve como intermediário
- **Fornecedor**: Produz e fornece os artefatos/produtos
- **Cliente**: Compra os produtos através da plataforma

### Fluxo de Responsabilidades
1. **Fornecedor** cadastra e gerencia produtos
2. **Coordenador** aprova produtos e fornecedores
3. **Cliente** compra produtos na loja
4. **Sistema** calcula e distribui comissões

## 🏗️ Estrutura Implementada

### Área do Fornecedor (`/vendor`)
```
/app/vendor/
├── layout.tsx              # Layout com navegação específica
├── page.tsx                # Dashboard principal
├── produtos/
│   └── page.tsx            # Gestão de produtos
├── comissoes/
│   └── page.tsx            # Comissões e saques
├── perfil/
│   └── page.tsx            # Perfil do fornecedor
├── pedidos/                # Visualização de pedidos
├── avaliacoes/             # Avaliações recebidas
├── notificacoes/           # Notificações do sistema
└── configuracoes/          # Configurações da conta
```

### Gestão Admin (`/admin/fornecedores`)
```
/app/admin/fornecedores/
├── page.tsx                # Lista e gestão de fornecedores
├── novo/                   # Cadastro de novo fornecedor
└── [id]/                   # Detalhes do fornecedor
```

## 🔧 Funcionalidades Implementadas

### Dashboard do Fornecedor
- **Métricas em tempo real**: Produtos, vendas, comissões
- **Alertas**: Produtos pendentes de aprovação
- **Ações rápidas**: Links para principais funcionalidades
- **Histórico de atividades**: Últimas vendas e aprovações

### Gestão de Produtos
- **Listagem completa** com filtros por status
- **Status de aprovação**: Pendente, Aprovado, Rejeitado
- **Motivos de rejeição**: Feedback detalhado da coordenação
- **Métricas por produto**: Vendas, estoque, avaliações

### Sistema de Comissões
- **Visualização de comissões**: Por produto e período
- **Status de comissões**: Pendente, Liberada, Paga
- **Solicitação de saques**: Com taxas e prazos
- **Histórico financeiro**: Comissões e saques realizados

### Perfil Completo
- **Dados pessoais**: Nome, documento, contato
- **Endereço**: Informações de localização
- **Dados bancários**: Para recebimento de comissões
- **Redes sociais**: Instagram, Facebook, WhatsApp
- **Status de aprovação**: Ativo, Pendente, Rejeitado

### Painel Administrativo
- **Aprovação de fornecedores**: Com motivos de rejeição
- **Gestão de status**: Ativar, suspender, rejeitar
- **Métricas gerais**: Total de fornecedores por status
- **Visualização detalhada**: Histórico e performance

## 📊 Tipos e Modelos

### Fornecedor (`Vendor`)
```typescript
type Vendor = {
  id: string
  nome: string
  nome_fantasia?: string
  documento: string
  tipo_documento: 'cpf' | 'cnpj'
  email: string
  telefone: string
  endereco: VendorEndereco
  status: 'ativo' | 'suspenso' | 'pendente_aprovacao' | 'rejeitado'
  comissao_percentual: number
  conta_bancaria: ContaBancaria
  documentos_verificacao: string[]
  data_aprovacao?: string
  aprovado_por?: string
  motivo_rejeicao?: string
  configuracoes: VendorConfiguracoes
  metricas?: VendorMetricas
}
```

### Produto Marketplace (`ProdutoMarketplace`)
```typescript
type ProdutoMarketplace = Produto & {
  vendor_id: string
  aprovado: boolean
  aprovado_por?: string
  data_aprovacao?: string
  motivo_rejeicao?: string
  moderacao_status: 'pendente' | 'aprovado' | 'rejeitado' | 'revisao'
  vendas_totais: number
  estoque_disponivel: number
  origem: 'admin' | 'vendor'
  destaque: boolean
}
```

### Comissão (`Comissao`)
```typescript
type Comissao = {
  id: string
  vendor_id: string
  pedido_id: string
  produto_id: string
  valor_venda: number
  percentual_comissao: number
  valor_comissao: number
  status: 'pendente' | 'liberada' | 'paga' | 'cancelada'
  data_liberacao?: string
  data_pagamento?: string
}
```

## 🔄 Fluxos de Trabalho

### 1. Cadastro de Fornecedor
1. Fornecedor se cadastra na plataforma
2. Status inicial: `pendente_aprovacao`
3. Coordenador revisa documentos e informações
4. Aprovação ou rejeição com motivo
5. Fornecedor aprovado pode cadastrar produtos

### 2. Gestão de Produtos
1. Fornecedor cadastra produto
2. Status inicial: `pendente`
3. Coordenador aprova ou rejeita
4. Produto aprovado fica visível na loja
5. Vendas geram comissões automáticas

### 3. Sistema de Comissões
1. Venda realizada na loja
2. Comissão calculada automaticamente
3. Status: `pendente` (período de retenção)
4. Após período: status `liberada`
5. Fornecedor solicita saque
6. Processamento e pagamento

## 🎨 Interface e UX

### Design System
- **Cores consistentes**: Status com cores padronizadas
- **Ícones intuitivos**: Lucide React para consistência
- **Layout responsivo**: Mobile-first com Tailwind CSS
- **Feedback visual**: Loading states e confirmações

### Navegação
- **Sidebar dedicada**: Links principais sempre visíveis
- **Breadcrumbs**: Localização clara na aplicação
- **Tabs organizadas**: Agrupamento lógico de funcionalidades
- **Ações contextuais**: Botões relevantes por página

## 🔐 Segurança e Permissões

### Controle de Acesso
```typescript
role: 'coordenador' | 'lider' | 'usuario' | 'fornecedor'
```

### Middleware de Autenticação
- **Rotas protegidas**: `/vendor/*` apenas para fornecedores
- **Validação de tenant**: Fornecedor associado ao cliente correto
- **Sessão segura**: Tokens JWT com expiração

## 📈 Métricas e Analytics

### Dashboard Fornecedor
- Total de produtos cadastrados
- Vendas realizadas no mês
- Comissões pendentes e pagas
- Avaliação média dos produtos

### Dashboard Admin
- Total de fornecedores por status
- Novos cadastros no período
- Produtos aguardando aprovação
- Performance geral do marketplace

## 🚀 Próximos Passos

### Funcionalidades Planejadas
1. **Sistema de avaliações**: Clientes avaliam fornecedores
2. **Relatórios avançados**: Analytics detalhados
3. **Integração com pagamentos**: Automatização de saques
4. **Notificações em tempo real**: WebSockets ou push
5. **Chat integrado**: Comunicação coordenador-fornecedor

### Melhorias Técnicas
1. **Testes automatizados**: Jest + Testing Library
2. **Performance**: Lazy loading e cache
3. **SEO**: Meta tags e sitemap
4. **PWA**: Service workers para offline
5. **API REST**: Endpoints documentados

---

## 💡 Conclusão

O perfil fornecedor implementado segue a arquitetura de marketplace proposta, onde:

- **Fornecedores** têm autonomia para gerenciar produtos e acompanhar vendas
- **Coordenadores** mantêm controle sobre qualidade e aprovações
- **Clientes** têm acesso a produtos diversificados e de qualidade
- **Sistema** automatiza comissões e facilita a gestão

Esta implementação cria um ecossistema sustentável onde todas as partes se beneficiam, mantendo a qualidade e a confiança da plataforma.