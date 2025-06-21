# Requisitos Funcionais — Inscrição de Participantes

## 📌 User Story Geral

**Como** participante de um evento,
**quero** me inscrever por meio de um formulário guiado por etapas,
**para** que meu cadastro como usuário seja criado automaticamente, vinculado ao campo correto, e que eu visualize possíveis cobranças associadas.

---

## 📋 Requisitos Funcionais

### RF001 – Formulário de inscrição em etapas (FormWizard)

- **Etapas:**

  1. **Identificação Pessoal:** nome, e-mail, CPF, telefone, data de nascimento
     (agrupados em um único bloco de `FormFieldGroup` para compactação visual)
  2. **Endereço:** CEP, estado, cidade, número, complemento
     (bloco de endereço estruturado com autofill por CEP se disponível)
  3. **Campo de Atuação:** seleção obrigatória de `campo_id`
     (carregado dinamicamente da coleção `campos`)
  4. **Termos e Política:** checkbox de aceite com link para política
  5. **Cobranças/Eventos:** produtos vinculados e detalhes da cobrança (se aplicável)

- **Componentes UI recomendados:**

  - `FormWizard`, `FormField`, `InputWithMask`, `SelectField`, `Checkbox`, `AddressField`
  - **Agrupadores como:** `FormFieldGroup` ou `AccordionGroup` para reduzir densidade visual

- **Progress Bar:**

  - Deve indicar o número total de etapas e destacar a etapa atual.
  - **Componente:** `Stepper` ou barra de progresso horizontal com número e descrição curta de cada etapa
  - A etapa ativa deve ter estilo destacado (token de cor do tenant)

---

### RF002 – Criação automática de usuário

- Se o e-mail informado ainda não existir:

  - Criar usuário com:

    - `nome`, `email`, `cpf`, `telefone`, `data_nascimento`, `cliente`, `perfil = 'usuario'`
    - `campo_id`: selecionado no formulário
    - `endereco`: estado, cidade, cep, numero

- Se já existir, apenas vincular a inscrição ao usuário existente.

---

### RF003 – Seleção obrigatória do campo

- Campo `campo_id` obrigatório no formulário.
- **Componente:** `SelectField`
- **Fonte:** coleção `campos` do tenant atual.
- Validação: lista apenas os campos disponíveis do cliente.

---

### RF004 – Verificação de produtos e cobranças vinculadas ao evento

- Após a criação do usuário, o sistema deve consultar:

  - Se existem **produtos vinculados ao evento atual**.
  - Se existe alguma **cobrança prevista** (e.g., taxa de inscrição, pacote obrigatório).

- Se houver cobrança:

  - Exibir etapa com os detalhes dos produtos/cobranças.
  - Associar os itens selecionados à inscrição e/ou ao usuário.

- A cobrança pode ser exibida, mas o pagamento pode ser tratado posteriormente.

---

### RF005 – Confirmação da inscrição conforme regras do evento

- O sistema deve verificar, na configuração do evento, o método de confirmação definido:

  - **Modo 1:** Confirmação manual por **líder** ou **coordenador** do campo

    - Inscrição entra com status "pendente de aprovação".
    - Apenas após aprovação, é liberado acesso ou cobrança.

  - **Modo 2:** Geração automática do **checkout de pagamento**

    - Após inscrição, sistema já inicia processo de cobrança (via integração como Asaas).

- A lógica deve se basear no campo `modo_confirmacao` do evento, com valores possíveis:

  - `manual` → fluxo de aprovação
  - `automatico` → fluxo de pagamento imediato

---

### RF006 – Adesão ao Design System Multi-tenant

- Componentes devem usar temas e tokens expostos via `TenantProvider`.
- Campos como `SelectField`, `FormWizard`, `Stepper`, `FormFieldGroup` devem ser estilizados com base no design system e documentados no Storybook.
