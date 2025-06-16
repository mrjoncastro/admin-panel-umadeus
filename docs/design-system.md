# Design System

Este documento resume os principais tokens de estilo, tipografia, escala de espaçamento e exemplos de componentes usados neste projeto.

## Tokens Disponíveis

Os tokens são definidos em `app/globals.css` e documentados com detalhes em [design-tokens.md](./design-tokens.md). Entre eles estão:

- **Cores**: `--background`, `--foreground`, `--text-primary`, `--text-secondary`, `--accent`, `--color-secondary`.
- **Tipografia**: `--font-body` e `--font-heading` (baseadas na fonte Geist).
- **Espaçamentos**: `--space-xs`, `--space-sm`, `--space-md`, `--space-lg`, `--space-xl`.

## Tipografia

A tipografia padrão utiliza a fonte Geist para corpo de texto e títulos. Os estilos são configurados no arquivo `app/layout.tsx` e consumidos via variáveis CSS `--font-body` e `--font-heading`.

## Escala de Espaçamento

Utilize as variáveis de espaçamento para manter consistência entre componentes:

| Token        | Valor     |
| ------------ | --------- |
| `--space-xs` | `0.25rem` |
| `--space-sm` | `0.5rem`  |
| `--space-md` | `1rem`    |
| `--space-lg` | `1.5rem`  |
| `--space-xl` | `2rem`    |

## Paleta de Cores

Os principais tons de cor são definidos no `tailwind.config.js` e podem ser consumidos via classes `text-*` ou `bg-*`.

| Token         | Valor     |
| ------------- | --------- |
| `primary-600` | `#7c3aed` |
| `error-600`   | `#dc2626` |
| `neutral-200` | `#d3d3d3` |
| `neutral-900` | `#1e2019` |

## Bibliotecas Integradas

Este projeto inclui as seguintes bibliotecas de UI e animação:

- **Framer Motion**: animações fluidas com `motion.div`, `motion.svg`, transições e presença animada.
- **Radix UI**: componentes acessíveis e headless como `Dialog`, `Tabs`, `Popover` e `DropdownMenu`.
- **Smooth Tabs**: sistema de navegação por abas com transições suaves, baseado em Radix + Framer Motion.
- **Overlay de Loading**: baseado em `motion.div` e `AnimatePresence` para estados de carregamento globais.

## Exemplos de Componentes

Os principais componentes têm exemplos interativos no Storybook. Alguns dos mais utilizados são:

- Botões (`stories/Button.stories.ts`)
- Cabeçalhos (`stories/Header.stories.ts`)
- Modais (`stories/ModalEditarPerfil.stories.tsx` e outros)
- Tabs suaves (`stories/Tabs.stories.tsx`)
- Overlays de loading (`components/LoadingOverlay.tsx`)

Execute `npm run storybook` para iniciar a interface e explorar os exemplos.

## Botões e Inputs

Utilizamos classes utilitárias para manter a consistência visual de elementos interativos. Os estilos base encontram-se em `app/globals.css` e devem ser reaproveitados nos componentes.

As variantes disponíveis são:

- `.btn-primary` para ações principais
- `.btn-secondary` para ações neutras
- `.btn-danger` para operações destrutivas

```html
<button class="btn btn-primary">Salvar</button>
<button class="btn btn-secondary">Cancelar</button>
<button class="btn btn-danger">Excluir</button>
<input class="input-base" />
```

## Cabeçalhos

Use os elementos `h1`, `h2` e `h3` para títulos. A classe `.heading` compartilha os mesmos estilos do `h1` e pode ser adicionada a qualquer tag:

```html
<h1 class="heading">Título Principal</h1>
<h2 class="heading">Subtítulo</h2>
<h3 class="heading">Seção Interna</h3>
```

## Cartões e Tabelas

Utilize as classes `.card` e `.table-base` para aplicar bordas, espaçamentos e cores padronizados em cartões e listas.

```html
<div class="card">Conteúdo do cartão</div>

<table class="table-base">
  <!-- linhas -->
</table>
```

## Animações com Framer Motion

Você pode utilizar `motion.div`, `motion.svg`, `AnimatePresence` e `useAnimation` para criar transições elegantes. Exemplo de uso:

```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
>
  Conteúdo
</motion.div>
```

Para SVG:

```tsx
<motion.path d="..." initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
```

## LoadingOverlay

O componente `LoadingOverlay` utiliza `motion.div` e `AnimatePresence` para exibir
uma camada de carregamento animada. Ele cobre toda a tela (ou o bloco desejado)
com um fundo escurecido e um spinner, podendo também mostrar um texto
opcional. É indicado para chamadas assíncronas que precisam bloquear a
interação temporariamente.

## SmoothTabs

`SmoothTabs` combina `@radix-ui/react-tabs` com `framer-motion` para gerar
transições suaves entre as abas. Basta fornecer um array de objetos `tabs` com
`value`, `label` e `content`. O exemplo de uso está em
`stories/Tabs.stories.tsx`.

## ModalAnimated

`ModalAnimated` é um wrapper do `@radix-ui/react-dialog` que adiciona animações
de abertura e fechamento via `framer-motion`. É útil para exibir modais leves
sem código repetitivo. Consulte `stories/ModalEditarPerfil.stories.tsx` para um
exemplo de implementação.

## Adicionando Novos Tokens

1. Inclua a variável desejada em `app/globals.css` ou expanda a paleta de cores em `tailwind.config.js`.
2. Atualize a documentação em `docs/design-tokens.md` e, se necessário, neste guia.
3. Crie ou atualize os componentes afetados e sua história correspondente em `stories/`.
4. Rode `npm run lint` e `npm run storybook` para validar que tudo está funcionando.

Manter os tokens padronizados garante consistência visual em todo o projeto.

## Guia de Contribuição

Siga estas etapas para colaborar com o design system.

### Criar novos tokens

1. Defina a variável em `app/globals.css` ou acrescente novas cores em `tailwind.config.js`.
2. Descreva o novo token em `docs/design-tokens.md` e atualize eventuais trechos deste documento.
3. Ajuste ou crie componentes que utilizem o token e registre a mudança em `stories/`.

### Exemplos de componentes

Os componentes principais ficam em `stories/` e demonstram padrões de uso. Uma estrutura mínima de exemplo seria:

```tsx
// components/MeuBotao.tsx
export function MeuBotao() {
  return (
    <button className="bg-[var(--accent)] p-[var(--space-sm)] rounded">
      Ação
    </button>
  );
}

// stories/MeuBotao.stories.tsx
import { MeuBotao } from "../components/MeuBotao";

export default { title: "Design System/MeuBotao", component: MeuBotao };

export const Padrão = () => <MeuBotao />;
```

### Referências ao Storybook

Execute `npm run storybook` para iniciar a interface e validar os componentes. Qualquer novo token ou componente deve ter uma história correspondente.

## Personalização

O portal permite ajustar fonte, cor primária e logotipo dinamicamente. As configurações são gerenciadas pelo `AppConfigProvider` (`lib/context/AppConfigContext.tsx`).
Ao montar, o provedor busca as preferências em `/admin/api/configuracoes` e, caso a requisição falhe, utiliza o valor salvo no `localStorage`.
Quando `updateConfig` é chamado, os dados são enviados para essa mesma rota e gravados no `localStorage`, mantendo navegador e PocketBase sincronizados.

As personalizações agora também são persistidas nos campos `logo_url`, `cor_primaria` e `font` da coleção `m24_clientes`, evitando perda de dados entre dispositivos.

Além de definir `--accent`, o provedor gera uma paleta HSL e expõe as variáveis `--primary-50` … `--primary-900`. Essas variáveis são mapeadas para classes Tailwind (`bg-primary-*`, `text-primary-*`), eliminando a necessidade de usar `bg-[var(--primary-600)]` ou `text-[var(--primary-500)]`.
