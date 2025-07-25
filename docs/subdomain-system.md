# 🌐 Sistema de Detecção por Subdomínio Regional

## 📋 Visão Geral

O sistema de detecção por subdomínio identifica automaticamente a região do usuário baseado no subdomínio acessado, aplicando **filtros de visibilidade hierárquica** e **identidade visual regional** correspondente.

## 🎯 Funcionalidades Principais

### **Detecção Automática de Região**
- **Análise de subdomínio** em tempo real no middleware
- **Cache inteligente** para performance (5 minutos TTL)
- **Fallback patterns** para subdomínios conhecidos
- **Configuração por PocketBase** ou padrões pré-definidos

### **Aplicação de Filtros**
- **Produtos filtrados automaticamente** por território
- **Visibilidade hierárquica** aplicada com base na região
- **Headers de contexto** para toda a aplicação
- **Cookies regionais** para persistência no frontend

## 🏗️ Arquitetura

### **1. Middleware (Detecção)**
```typescript
// middleware.ts
const regionDetection = await detectRegionFromSubdomain(hostname)

if (regionDetection.isValid) {
  // Configura headers e cookies regionais
  requestHeaders.set('x-region-id', regionDetection.regionId)
  requestHeaders.set('x-estado-id', regionDetection.estadoId)
  requestHeaders.set('x-cidade-id', regionDetection.cidadeId)
  
  response.cookies.set('regionId', regionDetection.regionId)
  // ... outros cookies
}
```

### **2. Serviço de Detecção**
```typescript
// lib/services/subdomain-detection.ts
export async function detectRegionFromSubdomain(
  hostname: string
): Promise<RegionDetectionResult> {
  const subdomain = extractSubdomain(hostname)
  
  // 1. Verificar cache
  // 2. Buscar no PocketBase
  // 3. Tentar padrões conhecidos
  // 4. Retornar resultado
}
```

### **3. Hooks React**
```typescript
// hooks/useCurrentRegion.ts
export function useCurrentRegion() {
  // Detecta região atual via cookies/headers
  // Fornece dados para componentes React
}
```

## 🌐 Configuração de Subdomínios

### **Estrutura de URLs**
```
https://saopaulo.m24vendas.com.br  → São Paulo Capital
https://rio.m24vendas.com.br       → Rio de Janeiro
https://bh.m24vendas.com.br        → Belo Horizonte
https://brasilia.m24vendas.com.br  → Distrito Federal
```

### **Configuração no PocketBase**
```json
// Coleção: regioes_subdominios
{
  "id": "1",
  "subdomain": "saopaulo",
  "regiao_id": "sao-paulo-capital", 
  "estado_id": "sao-paulo",
  "cidade_id": "sao-paulo-capital",
  "tenant_id": "saopaulo",
  "ativo": true,
  "configuracoes": {
    "identidade_visual_id": "tema_sp_1",
    "tema_customizado": true,
    "produtos_exclusivos": true,
    "comissao_override": {
      "lider_local": 15,
      "coordenador_regional": 8,
      "coordenador_geral": 5
    }
  },
  "seo": {
    "titulo_site": "M24 Vendas São Paulo",
    "descricao_meta": "Marketplace regional de São Paulo",
    "palavras_chave": ["marketplace", "sao paulo", "vendas"]
  }
}
```

## 🔍 Exemplos de Uso

### **1. Filtragem Automática de Produtos**
```typescript
// app/api/produtos/region/route.ts
export async function GET(request: NextRequest) {
  // Headers são automaticamente definidos pelo middleware
  const produtos = await buscarProdutosVisiveisPorSubdominio(request)
  
  return NextResponse.json({
    produtos: produtos.filter(p => {
      // Filtro automático já aplicado pela função
      return true
    }),
    region: {
      regionId: request.headers.get('x-region-id'),
      estadoId: request.headers.get('x-estado-id'),
      cidadeId: request.headers.get('x-cidade-id')
    }
  })
}
```

### **2. Componente React com Região**
```tsx
// components/ProductList.tsx
export function ProductList() {
  const { regionData, isValid } = useRegionData()
  
  if (!isValid) {
    return <div>Região não detectada</div>
  }
  
  return (
    <div>
      <h1>Produtos de {regionData.name}</h1>
      <p>Estado: {regionData.estado.name}</p>
      <ProductGrid regionId={regionData.id} />
    </div>
  )
}
```

### **3. Identidade Visual Automática**
```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  const { subdomain } = useCurrentRegion()
  
  // Tema regional aplicado automaticamente
  useRegionalTheme(subdomain)
  
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

## 📊 Padrões de Subdomínio

### **Cidades Principais**
| Subdomínio | Região | Estado | Cidade |
|------------|--------|--------|--------|
| `saopaulo` | São Paulo Capital | SP | São Paulo |
| `sp` | São Paulo Capital | SP | São Paulo |
| `rio` | Rio de Janeiro | RJ | Rio de Janeiro |
| `rj` | Rio de Janeiro | RJ | Rio de Janeiro |
| `bh` | Belo Horizonte | MG | Belo Horizonte |
| `brasilia` | Distrito Federal | DF | Brasília |
| `salvador` | Salvador | BA | Salvador |
| `fortaleza` | Fortaleza | CE | Fortaleza |
| `recife` | Recife | PE | Recife |
| `curitiba` | Curitiba | PR | Curitiba |
| `portoalegre` | Porto Alegre | RS | Porto Alegre |

### **Fallback e Padrões**
```typescript
// Se não encontra configuração no PocketBase
const knownPatterns = {
  'saopaulo': {
    regionId: 'sao-paulo-capital',
    estadoId: 'sao-paulo',
    cidadeId: 'sao-paulo-capital'
  },
  'rio': {
    regionId: 'rio-de-janeiro-capital',
    estadoId: 'rio-de-janeiro',
    cidadeId: 'rio-de-janeiro-capital'
  }
  // ... outros padrões
}
```

## ⚡ Performance e Cache

### **Cache de Subdomínios**
```typescript
// Cache em memória (produção: Redis)
const subdomainCache = new Map<string, RegionDetectionResult>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

// Função de cache
export function clearSubdomainCache(subdomain?: string) {
  if (subdomain) {
    subdomainCache.delete(`subdomain:${subdomain}`)
  } else {
    subdomainCache.clear()
  }
}
```

### **Otimizações**
- ✅ **Cache de 5 minutos** para detecção de subdomínio
- ✅ **Fallback patterns** para subdomínios conhecidos
- ✅ **Headers propagados** para toda aplicação
- ✅ **Cookies persistentes** para frontend
- ✅ **Invalidação inteligente** quando configuração muda

## 🔄 Integração com Sistemas

### **Sistema de Visibilidade**
```typescript
// Filtros automáticos baseados no subdomínio
export async function buscarProdutosVisiveisPorSubdominio(
  request: Request
) {
  const territorio = {
    estado_id: request.headers.get('x-estado-id'),
    regiao_id: request.headers.get('x-region-id'),
    cidade_id: request.headers.get('x-cidade-id')
  }
  
  return buscarProdutosVisiveis('user', territorio)
}
```

### **Sistema de Identidade Visual**
```typescript
// Tema regional aplicado automaticamente
const { tema } = useRegionalTheme(subdomain)

// CSS customizado carregado baseado na região
```

### **Sistema de Comissões**
```typescript
// Comissões override por região
const regionConfig = await detectRegionFromSubdomain(hostname)
const comissoes = regionConfig.config?.configuracoes.comissao_override || DEFAULT_COMISSOES
```

## 🛠️ APIs Disponíveis

### **Detecção de Região**
```http
GET /api/region/detect
# Retorna região baseada no hostname do request

POST /api/region/detect
Content-Type: application/json
{
  "hostname": "saopaulo.m24vendas.com.br"
}
```

### **Produtos por Região**
```http
GET /api/produtos/region?nivel_visibilidade=regiao,estado
# Retorna produtos visíveis na região atual

POST /api/produtos/region
Content-Type: application/json
{
  "filtros": {
    "nivel_visibilidade": ["regiao", "estado"],
    "status_autorizacao": ["aprovado", "automatico"]
  },
  "pagination": {
    "page": 1,
    "perPage": 20
  }
}
```

## 🔧 Configuração e Gestão

### **Criar Novo Subdomínio**
```typescript
await createRegionSubdomain({
  subdomain: 'novaredencao',
  regiao_id: 'nova-redencao',
  estado_id: 'para',
  cidade_id: 'nova-redencao',
  tenant_id: 'novaredencao',
  ativo: true,
  configuracoes: {
    identidade_visual_id: 'tema_default',
    tema_customizado: false,
    produtos_exclusivos: false
  },
  seo: {
    titulo_site: 'M24 Vendas Nova Redenção',
    descricao_meta: 'Marketplace local de Nova Redenção',
    palavras_chave: ['marketplace', 'nova redencao', 'para']
  }
})
```

### **Verificar Disponibilidade**
```typescript
const { available } = await checkSubdomainAvailability('novacidade')
```

### **Listar Configurações**
```typescript
const regioes = await listRegionSubdomains({
  estado_id: 'sao-paulo',
  ativo: true
})
```

## 📈 Casos de Uso Práticos

### **Caso 1: Usuário Acessa São Paulo**
```
1. User acessa: https://saopaulo.m24vendas.com.br
2. Middleware detecta subdomain: "saopaulo"
3. Busca configuração no PocketBase
4. Define headers: x-region-id=sao-paulo-capital
5. Produtos filtrados automaticamente para região SP
6. Tema visual "São Paulo" aplicado
7. Comissões regionais utilizadas
```

### **Caso 2: Produto Criado na Região**
```
1. Líder em SP cria produto
2. Sistema detecta região via headers: x-region-id
3. Aplica regras de visibilidade para SP
4. Produto fica visível apenas em São Paulo
5. Solicitação de ampliação vai para Coord. Regional SP
```

### **Caso 3: Novo Subdomínio**
```
1. Admin configura: campinas.m24vendas.com.br
2. Cria entrada em regioes_subdominios
3. Define identidade visual personalizada
4. Configura comissões especiais
5. Subdomínio ativo automaticamente
```

## 🚀 Benefícios do Sistema

### **Para Usuários**
- ✅ **Acesso direto** à região via URL
- ✅ **Produtos relevantes** geograficamente
- ✅ **Identidade visual** regional
- ✅ **Performance otimizada** com cache

### **Para Administradores**
- ✅ **Gestão centralizada** de subdomínios
- ✅ **Configuração flexível** por região
- ✅ **SEO otimizado** por localidade
- ✅ **Analytics regionalizados**

### **Para o Negócio**
- ✅ **Expansão escalável** para novas regiões
- ✅ **Branding regional** consistente
- ✅ **Controle de produtos** por território
- ✅ **Otimização de conversão** local

## 📞 Suporte e Monitoramento

### **Logs e Debug**
```typescript
// Logs detalhados de detecção
console.log('Subdomínio detectado:', {
  hostname,
  subdomain,
  regionFound: result.isValid,
  regionId: result.regionId,
  cached: !!cached
})
```

### **Métricas**
- **Taxa de detecção** de subdomínios
- **Performance do cache** (hit/miss ratio)
- **Regiões mais acessadas**
- **Erros de configuração**

### **Alertas**
- **Subdomínio não encontrado** → Notificar admin
- **Cache miss alto** → Verificar performance
- **Configuração inválida** → Alertas automáticos