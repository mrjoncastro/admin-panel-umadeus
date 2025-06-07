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

| Token        | Valor   |
|--------------|---------|
| `--space-xs` | `0.25rem` |
| `--space-sm` | `0.5rem`  |
| `--space-md` | `1rem`    |
| `--space-lg` | `1.5rem`  |
| `--space-xl` | `2rem`    |

## Exemplos de Componentes

Os principais componentes têm exemplos interativos no Storybook. Alguns dos mais utilizados são:

- Botões (`stories/Button.stories.ts`)
- Cabeçalhos (`stories/Header.stories.ts`)
- Modais (`stories/ModalEditarPerfil.stories.tsx` e outros)
- Elementos de navegação como `BackToTopButton`

Execute `npm run storybook` para iniciar a interface e explorar os exemplos.

## Adicionando Novos Tokens

1. Inclua a variável desejada em `app/globals.css` ou expanda a paleta de cores em `tailwind.config.js`.
2. Atualize a documentação em `docs/design-tokens.md` e, se necessário, neste guia.
3. Crie ou atualize os componentes afetados e sua história correspondente em `stories/`.
4. Rode `npm run lint` e `npm run storybook` para validar que tudo está funcionando.

Manter os tokens padronizados garante consistência visual em todo o projeto.
