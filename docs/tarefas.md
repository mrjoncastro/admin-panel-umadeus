# Requisitos Funcionais — Inscrição com Criação de Usuário e Produtos Internos

## 📌 User Story Geral

**Como** participante de um evento,
**quero** me inscrever por meio de um formulário guiado por etapas,
**para** que meu cadastro como usuário seja criado automaticamente, vinculado ao campo correto e, se houver, visualizar produtos internos disponíveis conforme meu perfil.

---

## 📋 Requisitos Funcionais

### RF001 – Campo `exclusivo_user` no cadastro de produtos

- Campo booleano na coleção `produtos` para definir se o produto é de uso interno.
- **Nome do campo:** `exclusivo_user`
- **Tipo:** Boolean (default: `false`)
- **Visível para perfis:** `coordenador`
- **UI:** `ToggleSwitch` com label “Produto de uso interno?”

---

### RF002 – Formulário de inscrição em etapas (FormWizard)

- **Etapas:**

  1. Dados Pessoais (nome, e-mail, CPF)
  2. Seleção do Campo de Atuação
  3. Confirmação de Termos
  4. Exibição de Produtos (condicional)

- Componentes UI: `FormWizard`, `FormField`, `InputWithMask`, `SelectField`, `ToggleSwitch`

---

### RF003 – Criação automática de usuário

- Se o e-mail informado ainda não existir:

  - Criar usuário com:

    - `nome`, `email`, `cpf`, `cliente`, `perfil = 'usuario'`
    - `campo_id`: selecionado no formulário

- Se já existir, apenas vincular a inscrição ao usuário existente.

---

### RF004 – Seleção obrigatória do campo

- Campo `campo_id` obrigatório no formulário.
- **Componente:** `SelectField`
- **Fonte:** coleção `campos` do tenant atual.
- Validação: lista apenas os campos disponíveis do cliente.

---

### RF005 – Exibição condicional de produtos internos

- Após criação do usuário, sistema busca produtos vinculados ao evento:

  ```js
  cliente = TENANT_ID AND evento = EVENTO_ID
  ```

- Exibir etapa de produtos se:

  - Houver produtos disponíveis
  - Usuário tiver permissão para visualizar (`exclusivo_user = false` ou perfil autorizado)

---

### RF006 – Proteção de produtos internos na API

- Requisições públicas devem filtrar produtos com:

  ```js
  exclusivo_user = false
  ```

- Usuários com perfis especiais (ex.: `usuario`, `lider`, `coordenador`) podem visualizar todos.

---

### RF007 – Adesão ao Design System Multi-tenant

- Componentes devem usar temas e tokens expostos via `TenantProvider`.
- Campos como `ToggleSwitch`, `SelectField`, `FormWizard` devem ser estilizados com base no design system e documentados no Storybook.
