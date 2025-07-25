# 🏛️ Marketplace Hierárquico M24Vendas

## Visão Geral

O marketplace M24Vendas foi adaptado para trabalhar com uma **estrutura hierárquica territorial** em um único host, atendendo diferentes níveis organizacionais com **16.000 usuários simultâneos**.

### Estrutura Hierárquica

```
🏢 Coordenador Geral (Nacional)
    ├── 🏛️ Estado (São Paulo)
    │   ├── 🌆 Região (Grande São Paulo)
    │   │   ├── 🏘️ Cidade (São Paulo Capital) - Líder Local
    │   │   ├── 🏘️ Cidade (Osasco) - Líder Local
    │   │   └── 🏘️ Cidade (Guarulhos) - Líder Local
    │   └── 🌆 Região (Interior SP)
    │       ├── 🏘️ Cidade (Campinas) - Líder Local
    │       └── 🏘️ Cidade (Santos) - Líder Local
    └── 🏛️ Estado (Rio de Janeiro)
        └── ... (estrutura similar)
```

## 🎯 Características Principais

### 1. **Hierarquia de Usuários**
- **Coordenador Geral**: Visão nacional completa
- **Coordenador Regional**: Gerencia estado/região específica
- **Líder Local**: Responsável por cidade específica

### 2. **Sistema de Comissões Multinível**
- Cada venda gera comissões para **todos os níveis** da hierarquia
- Percentuais configuráveis por estado/região/cidade
- Cálculo automático e distribuição transparente

### 3. **Controle de Acesso Territorial**
- Usuários só veem dados de sua jurisdição
- Permissões baseadas no nível hierárquico
- Produtos podem ter disponibilidade territorial limitada

## 🏗️ Componentes da Arquitetura

### Entidades Principais

#### Estados
```typescript
type Estado = {
  id: string
  nome: string
  codigo: string // 'SP', 'RJ', 'MG'
  coordenador_geral: string
  configuracoes: {
    comissao_coordenador_geral: number // 5%
    comissao_coordenador_regional: number // 10%
    comissao_lider_local: number // 15%
    auto_aprovar_lideres: boolean
    requer_aprovacao_produtos: boolean
  }
}
```

#### Regiões
```typescript
type Regiao = {
  id: string
  nome: string
  estado_id: string
  coordenador_regional: string
  cidades: string[]
  configuracoes: {
    override_comissoes?: boolean
    meta_mensal_vendas?: number
  }
}
```

#### Cidades
```typescript
type Cidade = {
  id: string
  nome: string
  estado_id: string
  regiao_id?: string
  lider_local: string
  configuracoes: {
    meta_mensal_vendas?: number
    meta_mensal_inscricoes?: number
  }
}
```

## 💰 Sistema de Comissões Hierárquico

### Fluxo de Comissões

1. **Venda Realizada** (R$ 1.000)
   ```
   Valor do Produto: R$ 1.000
   ├── Vendor (40%): R$ 400
   ├── Líder Local (15%): R$ 150
   ├── Coordenador Regional (10%): R$ 100
   ├── Coordenador Geral (5%): R$ 50
   └── Plataforma (30%): R$ 300
   ```

2. **Distribuição Automática**
   - Comissões calculadas automaticamente
   - Período de retenção configurável (7-30 dias)
   - Liberação baseada em confirmação de entrega

### Configurações Flexíveis

- **Por Estado**: Percentuais padrão para todo o estado
- **Por Região**: Override dos percentuais do estado
- **Por Cidade**: Override dos percentuais da região

## 🔐 Controle de Acesso e Permissões

### Matriz de Permissões

| Funcionalidade | Coord. Geral | Coord. Regional | Líder Local |
|---|---|---|---|
| Ver todos estados | ✅ | ❌ | ❌ |
| Ver estado específico | ✅ | ✅ (seu estado) | ❌ |
| Ver região específica | ✅ | ✅ (sua região) | ✅ (sua região) |
| Ver cidade específica | ✅ | ✅ (suas cidades) | ✅ (sua cidade) |
| Gerenciar coord. regionais | ✅ | ❌ | ❌ |
| Gerenciar líderes locais | ✅ | ✅ | ❌ |
| Aprovar produtos | ✅ | ✅ | Configurável |
| Liberar comissões | ✅ | ✅ | ❌ |
| Processar saques | ✅ | ❌ | ❌ |

### Implementação de Segurança

```typescript
function verificarPermissao(
  usuario: Usuario,
  recurso: string,
  acao: string,
  contexto?: any
): boolean {
  // Coordenador geral tem acesso total
  if (usuario.nivel_hierarquia === 'coordenador_geral') {
    return true
  }
  
  // Verificar jurisdição territorial
  switch (usuario.nivel_hierarquia) {
    case 'coordenador_regional':
      return contexto?.estado_id === usuario.estado_id ||
             contexto?.regiao_id === usuario.regiao_id
    
    case 'lider_local':
      return contexto?.cidade_id === usuario.cidade_id
  }
  
  return false
}
```

## 📊 Dashboard e Analytics Hierárquicos

### Dashboard por Nível

#### Coordenador Geral
- Visão de todos os estados
- Performance nacional
- Ranking de coordenadores regionais
- Metas vs realizado por estado

#### Coordenador Regional
- Performance do estado/região
- Ranking de líderes locais
- Vendas por cidade
- Produtos mais vendidos na região

#### Líder Local
- Performance da cidade
- Vendas pessoais e da equipe
- Produtos locais
- Inscrições e conversões

### Relatórios Automáticos

```typescript
type RelatorioHierarquico = {
  tipo: 'vendas_estado' | 'vendas_regiao' | 'vendas_cidade' | 'comissoes_hierarquia'
  estado_id?: string
  regiao_id?: string
  cidade_id?: string
  periodo_inicio: string
  periodo_fim: string
  dados: {
    resumo_geral: any
    detalhamento_por_nivel: any
    comparativo_periodos?: any
  }
}
```

## 🚀 Otimizações para 16k Usuários

### 1. **Cache Hierárquico**
```typescript
// Cache por nível territorial
const cacheKeys = {
  estado: `dashboard:estado:${estadoId}:${periodo}`,
  regiao: `dashboard:regiao:${regiaoId}:${periodo}`,
  cidade: `dashboard:cidade:${cidadeId}:${periodo}`
}
```

### 2. **Rate Limiting Territorial**
```typescript
const rateLimits = {
  coordenador_geral: { requests: 1000, window: 60 },
  coordenador_regional: { requests: 500, window: 60 },
  lider_local: { requests: 200, window: 60 }
}
```

### 3. **Consultas Otimizadas**
- Índices por hierarquia territorial
- Filtros automáticos baseados em permissões
- Paginação inteligente por nível

## 🛠️ Implementação Técnica

### Coleções PocketBase

1. **estados** - Cadastro de estados
2. **regioes** - Regiões dentro dos estados
3. **cidades** - Cidades dentro das regiões
4. **usuarios** - Usuários com nível hierárquico
5. **comissoes_hierarquicas** - Comissões por nível
6. **produtos_hierarquicos** - Produtos com disponibilidade territorial

### Índices Recomendados

```sql
-- Consultas por hierarquia
CREATE INDEX idx_usuarios_hierarquia ON usuarios(nivel_hierarquia, estado_id, regiao_id, cidade_id);

-- Comissões por território
CREATE INDEX idx_comissoes_territorio ON comissoes_hierarquicas(estado_id, regiao_id, cidade_id, status);

-- Produtos por disponibilidade
CREATE INDEX idx_produtos_territorio ON produtos(estado_id, disponivel_estado_inteiro, ativo);

-- Performance queries
CREATE INDEX idx_vendas_periodo_territorio ON pedidos(created, estado_id, regiao_id, cidade_id, status);
```

### APIs Específicas

```typescript
// Buscar dados baseado na hierarquia do usuário
GET /api/hierarchy/dashboard
GET /api/hierarchy/usuarios/{nivel}
GET /api/hierarchy/comissoes/{periodo}
GET /api/hierarchy/produtos/disponiveis

// Gestão territorial
POST /api/hierarchy/estados
POST /api/hierarchy/regioes
POST /api/hierarchy/cidades

// Relatórios hierárquicos
POST /api/hierarchy/relatorios/gerar
GET /api/hierarchy/relatorios/{id}
```

## 📈 Métricas e KPIs Hierárquicos

### KPIs por Nível

#### Nacional (Coordenador Geral)
- GMV total
- Número de estados ativos
- Performance por região
- Crescimento mensal nacional

#### Regional (Coordenador Regional)
- GMV do estado/região
- Número de cidades ativas
- Performance vs outras regiões
- Cumprimento de metas regionais

#### Local (Líder Local)
- GMV da cidade
- Número de vendedores ativos
- Taxa de conversão local
- Cumprimento de metas locais

### Alertas Automáticos

- **Meta baixa**: Região/cidade abaixo de 80% da meta
- **Sem vendas**: Território sem vendas por 7+ dias
- **Estoque baixo**: Produtos com estoque crítico
- **Aprovações pendentes**: Produtos aguardando moderação

## 🔄 Fluxos de Negócio Hierárquicos

### Cadastro de Novo Líder
1. Coordenador Regional cria líder
2. Sistema associa à cidade/região
3. Define permissões baseadas no nível
4. Envia credenciais de acesso
5. Líder configura perfil e metas

### Venda com Comissões
1. Venda realizada por vendor/líder
2. Sistema identifica hierarquia territorial
3. Calcula comissões para todos os níveis
4. Registra comissões pendentes
5. Após confirmação, libera pagamentos

### Aprovação de Produtos
1. Vendor/líder cria produto
2. Sistema verifica nível de aprovação necessário
3. Envia para moderação hierárquica
4. Aprovador do nível adequado revisa
5. Produto liberado para território específico

## 🚦 Monitoramento e Observabilidade

### Métricas de Sistema
- Usuários ativos por nível
- Requisições por território
- Performance de queries hierárquicas
- Taxa de erro por nível de acesso

### Business Intelligence
- Dashboard executivo nacional
- Relatórios regionais automatizados
- Análise de performance territorial
- Previsão de vendas por região

## 🔮 Roadmap de Implementação

### Fase 1: Estrutura Base (2-3 semanas)
- [ ] Tipos e entidades hierárquicas
- [ ] Sistema de permissões territorial
- [ ] Cadastro de estados/regiões/cidades

### Fase 2: Comissões Hierárquicas (3-4 semanas)
- [ ] Cálculo de comissões multinível
- [ ] Sistema de liberação por território
- [ ] Relatórios de comissões

### Fase 3: Dashboard e Analytics (2-3 semanas)
- [ ] Dashboard por nível hierárquico
- [ ] Relatórios territoriais
- [ ] Alertas automáticos

### Fase 4: Otimizações e Scale (2-3 semanas)
- [ ] Cache territorial
- [ ] Rate limiting hierárquico
- [ ] Testes de carga para 16k usuários

**Total**: 9-13 semanas para implementação completa

## ✅ Benefícios da Arquitetura Hierárquica

1. **Escalabilidade**: Suporte a 16k usuários com performance
2. **Organização**: Estrutura territorial clara e intuitiva
3. **Autonomia**: Cada nível tem suas responsabilidades
4. **Transparência**: Comissões claras e auditáveis
5. **Flexibilidade**: Configurações por território
6. **Crescimento**: Facilita expansão para novos territórios