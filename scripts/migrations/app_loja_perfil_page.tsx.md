# Migração: app\loja\perfil\page.tsx

## Status: Pendente

### Arquivo Original
```typescript
// TODO: Substituir imports do PocketBase por Supabase
import createPocketBase from '@/lib/pocketbase'
// TODO: Substituir uso do PocketBase por Supabase
const pb = createPocketBase()
```

### Migração Necessária
1. Substituir `import createPocketBase from '@/lib/pocketbase'` por `import { supabase } from '@/lib/supabaseClient'`
2. Substituir `const pb = createPocketBase()` por `const { data, error } = await supabase.from('tabela').select()`
3. Atualizar queries para usar sintaxe do Supabase
4. Atualizar autenticação para usar Supabase Auth
5. Testar funcionalidade

### Exemplo de Migração
```typescript
// Antes (PocketBase)
import createPocketBase from '@/lib/pocketbase'
const pb = createPocketBase()
const records = await pb.collection('usuarios').getList()

// Depois (Supabase)
import { supabase } from '@/lib/supabaseClient'
const { data: records, error } = await supabase
  .from('usuarios')
  .select('*')
```

---
