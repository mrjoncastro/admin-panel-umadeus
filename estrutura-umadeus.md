# 📁 Estrutura de Projeto – UMADEUS

Este documento descreve a **arquitetura de pastas e responsabilidades** do projeto UMADEUS, com orientações baseadas em **boas práticas de desenvolvimento, organização e performance**.

---

## 🧭 Visão Geral

O projeto é dividido logicamente em duas áreas:

| Área        | Função Principal                         | Acesso            | Público-alvo        |
|-------------|-------------------------------------------|-------------------|----------------------|
| **Loja**    | Página pública para venda e inscrições    | Público           | Visitantes e inscritos |
| **Admin**   | Painel de gestão e controle de dados      | Privado (auth)    | Coordenadores e líderes |

Ambas coexistem no mesmo projeto Next.js (App Router) hospedado na **Vercel**.

---

## 📦 Estrutura de Pastas

```bash
/app
├── admin/                 # Painel administrativo completo
│   ├── api/               # Rotas internas (se necessário)
│   ├── campos/            # Gestão de campos de atuação
│   ├── components/        # Componentes exclusivos do admin
│   ├── dashboard/         # Painel principal do administrador
│   ├── erro/              # Página de erro genérica
│   ├── inscricoes/        # Listagem e gestão de inscrições
│   ├── lider-painel/      # Painel exclusivo para lideranças locais
│   ├── obrigado/          # Página de agradecimento
│   ├── pedidos/           # Gestão de pedidos vinculados à inscrição
│   ├── pendente/          # Tela para inscrições pendentes
│   ├── perfil/            # Tela de perfil do usuário logado
│   ├── redefinir-senha/   # Recuperação de senha
│   └── usuarios/          # Gestão de usuários autenticados
│   └── layout.tsx         # Layout do admin com navegação segura

├── loja/                  # Área pública da vitrine e inscrições
│   ├── components/        # Componentes reutilizáveis da loja
│   ├── eventos/           # Formulário de inscrição em eventos
│   ├── inscricoes/        # Envio e visualização pública (se necessário)
│   ├── produtos/          # Listagem e detalhes dos produtos
│   ├── layout.tsx         # Layout público da loja
│   └── page.tsx           # Home da loja

├── layout.tsx             # Layout raiz compartilhado
├── globals.css            # CSS global compartilhado
```

---

## 🛍️ Loja – Boas Práticas

- Roteamento claro e semântica amigável (ex: `/loja/produtos/kit-jovem`)
- SEO: uso de metadados dinâmicos e URLs limpas
- Utilizar `next export` para páginas estáticas
- Separar lógica de exibição (componentes) da lógica de dados (lib/services)
- Formulários com validação (Zod ou HTML5) + feedback visual
- Responsivo (mobile-first) com Tailwind

---

## 🛠️ Admin – Boas Práticas

- Rotas protegidas com `useAuthGuard` e validação de `role`
- Layout persistente com navegação clara entre seções (dashboard, pedidos, etc)
- Paginação, filtros e expand para consultas PocketBase
- Armazenamento de token com `pb.authStore` e persistência no localStorage
- Preferir chamadas via `getList()` com `expand` para evitar múltiplas requisições
- Limpar dados e tokens no logout (`pb.authStore.clear()`)

---

## ⚙️ Performance e Desenvolvimento

- Componentes desacoplados e reutilizáveis
- Usar `useMemo`/`useCallback` para evitar renders desnecessários
- Evitar `any` e manter todos os dados tipados via `types/`
- Aplicar lazy loading para rotas não críticas (`next/dynamic`)
- Dividir código entre `/lib`, `/services` e `/hooks` para clareza
- Rodar `next build` e `npm run export` para verificar compatibilidade de build estático

---

## ✅ Checklist de Qualidade

- [ ] Todas as rotas públicas funcionam sem autenticação
- [ ] Painel admin exige login e validação de role
- [ ] Componentes são reutilizáveis e coesos
- [ ] Formulários validam dados e exibem status (loading, erro, sucesso)
- [ ] Layout responsivo e acessível
- [ ] Integração com PocketBase documentada e centralizada

---

## 📌 Considerações Finais

Esta estrutura busca garantir **clareza, escalabilidade e manutenibilidade** do projeto UMADEUS, atendendo tanto ao público final quanto às lideranças administrativas. Deve ser evoluída com base no crescimento do projeto, mantendo a consistência na organização e nos princípios de performance e segurança.
