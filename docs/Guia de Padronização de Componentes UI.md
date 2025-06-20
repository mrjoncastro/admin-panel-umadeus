**Guia de Padronização de Componentes UI**

Este documento orienta a criação e padronização de componentes em seu Design System, garantindo coesão visual, consistência de código e melhores práticas de usabilidade/accessibilidade.

---

## 1. Convenções Gerais

- **Nomeclatura**: Componentes devem usar PascalCase (ex.: `Button`, `TextField`).
- **Estrutura de Pastas**:

  ```bash
  /components
    ├── atoms       # Componentes mais básicos (cores, tipografia, botões)
    ├── molecules   # Combinações de átomos (inputs com label, cards)
    ├── organisms   # Blocos de UI complexos (modais, tabelas, formulários)
    ├── templates   # Páginas ou telas inteiras compostas por organisms
  ```

- **Props Padrão**:

  - `className?: string` para extensão de estilo.
  - `id?: string`, `data-testid?: string` para testes.
  - `aria-*` para acessibilidade.

- **Estilos**: Utilizar classes utilitárias do Tailwind e tokens do Design System (`input-base`, `btn-primary`, etc.).
- **Documentação**: Cada componente deve ter:

  1. **Descrição** breve do propósito.
  2. **API** de props (com tipos, obrigatoriedade e defaultValues).
  3. **Exemplos** de uso (Storybook).
  4. **Notas de Acessibilidade** (labels, roles, keyboard support).

---

## 2. Componentes Recomendados para Padronização

### 2.1 Atoms

- **Button**: variantes `primary`, `secondary`, `danger`, `link`.
- **Text**: estilos tipográficos (`Heading`, `Body`, `Caption`).
- **Icon** / **IconButton**: wrappers para ícones SVG.
- **Input** (TextField): campos de texto com label, placeholder e mensagens de erro.
- **Select** (SelectField): dropdown nativo estilizado.
- **Checkbox** / **Radio**: opções de seleção únicas ou múltiplas.
- **ToggleSwitch**: alternador binário (on/off).
- **Spinner** / **Loader**: indicação de carregamento.

### 2.2 Molecules

- **InputWithMask**: Input + máscara (CPF, telefone).
- **FormField**: Label + Input/Select + ErrorMessage + wrapper acessível.
- **Card**: container de conteúdo (ex.: `SaldoCard`).
- **Badge** / **Tag**: rótulos de status ou categorias.
- **SmoothTabs**: abas de navegação interna.
- **Avatar**: foto ou iniciais do usuário.

### 2.3 Organisms

- **Modal** / **ModalAnimated**: janela modal com animação de abertura/fechamento.
- **LoadingOverlay**: layer semitransparente com spinner central.
- **Table**: componentes para `thead`, `tbody`, sortable, paginado.
- **Pagination**: navegação por páginas de dados.
- **Toast** / **Alert**: notificações temporárias.
- **Stepper**: barra de progresso para multi-step forms.
- **FormWizard**: estrutura para formulários multi-etapa.

### 2.4 Templates

- **LoginForm**: combinação de campos e botões para autenticação.
- **CheckoutForm**: fluxo de pagamento e revisão de pedido.
- **DashboardLayout**: sidebar + header + content area.

---

## 3. Exemplos de Documentação de Componente

### `Button`

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'link'
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
  className?: string
}

function Button({
  variant = 'primary',
  disabled = false,
  className,
  ...props
}: ButtonProps) {
  const base = 'py-2 px-4 rounded-md font-medium focus:outline-none'
  const styleMap = {
    primary: 'bg-purple-600 hover:bg-purple-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    link: 'underline text-purple-600 hover:text-purple-700 bg-transparent',
  }
  return (
    <button
      className={`${base} ${styleMap[variant]} ${className ?? ''}`}
      disabled={disabled}
      aria-disabled={disabled}
      {...props}
    />
  )
}
```

---

## 4. Boas Práticas de Acessibilidade

1. **Labels**: sempre use `<label htmlFor>` e `id` correspondente.
2. **Focus**: todos os componentes interativos devem ter estilo de foco visível.
3. **Roles e ARIA**: definir `role` (e.g., `role="alert"` em erros) e atributos como `aria-live`.
4. **Contraste**: siga AA ou AAA conforme necessidade do projeto.
5. **Keyboard**: suporta navegação e ativação via teclado.

---

## 5. Workflows e Ferramentas\$1

## 6. Considerações do Plano de Negócio

Para garantir que o design system esteja plenamente alinhado ao seu plano de negócio multi-tenant e às regras de personalização de cada cliente, siga estas diretrizes:

- **Temas e Branding Dinâmicos**: todos os componentes devem suportar tokens de cor e logo configuráveis por tenant (e.g., `m24_clientes.cor_primary`, `logo_url`). Utilize variáveis CSS (`--color-primary`, `--logo-url`) expostas pelo `TenantProvider` para aplicar estilos dinamicamente.

- **Feature Toggles**: incorpore componentes como `ToggleSwitch` para ativar/desativar funcionalidades específicas de cada cliente. Por exemplo, controle a exibição do checkbox de confirmação de inscrição com base no campo `clientes_config.confirma_inscricoes`.

- **Seleção de Métodos de Pagamento**: crie um componente `PaymentMethodSelector` que receba do contexto do tenant as opções permitidas (Pix, Boleto, Crédito) e limites de parcelas definidos no plano de negócio.

- **Filtragem e Isolamento de Dados**: o layout e os componentes de navegação (e.g., `DashboardLayout`, `SmoothTabs`) devem respeitar o escopo multi-tenant, usando o hook ou contexto `useTenant()` para filtrar rotas, dados e menus conforme o host em `clientes_config`.

- **Configurador de Componentes**: disponibilize um `TenantProvider` que carrega e expõe em React Context:

  - **Tokens de Design** (cores, fontes, espaçamentos) personalizados.
  - **URLs de API** e credenciais (sem expor chaves sensíveis no cliente).
  - **Regras de Negócio** (confirmações, limites de uso, branding).

- **Documentação Integrada**: em cada Storybook, inclua um _story_ de “Tema Dinâmico” que demonstra a aplicação de diferentes configurações de tenant, para validar visualmente as variações de branding.

Com essas adições, o design system não só unifica a interface, mas também reflete diretamente as necessidades e restrições definidas no plano de negócio, assegurando consistência e escalabilidade para cada cliente.

---

Com este guia completo, você terá um mapa detalhado de componentes, integrações e personalizações necessários para suportar todo o seu fluxo de negócios multi-tenant.
