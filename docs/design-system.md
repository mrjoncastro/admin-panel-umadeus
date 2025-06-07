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

## Botões e Inputs

Utilizamos classes utilitárias para manter a consistência visual de elementos
interativos. Os estilos base encontram-se em `app/globals.css` e devem ser
reaproveitados nos componentes.

```html
<button class="btn btn-primary">Salvar</button>
<input class="input-base" />
```

## Adicionando Novos Tokens

1. Inclua a variável desejada em `app/globals.css` ou expanda a paleta de cores em `tailwind.config.js`.
2. Atualize a documentação em `docs/design-tokens.md` e, se necessário, neste guia.
3. Crie ou atualize os componentes afetados e sua história correspondente em `stories/`.
4. Rode `npm run lint` e `npm run storybook` para validar que tudo está funcionando.

Manter os tokens padronizados garante consistência visual em todo o projeto.

## Guia de Contribuição

Siga estas etapas para colaborar com o design system.

### Criar novos tokens

1. Defina a variável em `app/globals.css` ou acrescente novas cores em
   `tailwind.config.js`.
2. Descreva o novo token em `docs/design-tokens.md` e atualize eventuais
   trechos deste documento.
3. Ajuste ou crie componentes que utilizem o token e registre a mudança em
   `stories/`.

### Exemplos de componentes

Os componentes principais ficam em `stories/` e demonstram padrões de uso.
Uma estrutura mínima de exemplo seria:

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
import { MeuBotao } from '../components/MeuBotao';

export default { title: 'Design System/MeuBotao', component: MeuBotao };

export const Padrão = () => <MeuBotao />;
```

### Referências ao Storybook

Execute `npm run storybook` para iniciar a interface e validar os componentes.
Qualquer novo token ou componente deve ter uma história correspondente.
