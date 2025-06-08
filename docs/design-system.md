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

## Paleta de Cores

Os principais tons de cor são definidos no `tailwind.config.js` e podem ser consumidos via classes `text-*` ou `bg-*`.

| Token            | Valor |
|------------------|-------|
| `primary-600`    | `#7c3aed` |
| `error-600`      | `#dc2626` |
| `neutral-200`    | `#d3d3d3` |
| `neutral-900`    | `#1e2019` |

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

Use os elementos `h1`, `h2` e `h3` para títulos. A classe `.heading` compartilha
os mesmos estilos do `h1` e pode ser adicionada a qualquer tag:

```html
<h1 class="heading">Título Principal</h1>
<h2 class="heading">Subtítulo</h2>
<h3 class="heading">Seção Interna</h3>
```

## Cartões e Tabelas

Utilize as classes `.card` e `.table-base` para aplicar bordas,
espaçamentos e cores padronizados em cartões e listas.

```html
<div class="card">Conteúdo do cartão</div>

<table class="table-base">
  <!-- linhas -->
</table>
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

## Personalização

O portal permite ajustar fonte, cor primária e logotipo dinamicamente. As
configurações são gerenciadas pelo `AppConfigProvider` (`lib/context/AppConfigContext.tsx`),
que salva as preferências no `localStorage`.
Além de definir `--accent`, o provedor gera uma paleta HSL e expõe as variáveis
`--primary-50` … `--primary-900`. As classes Tailwind utilizam essas variáveis
(`bg-[var(--primary-600)]`, `text-[var(--primary-500)]`, etc.), permitindo que
a interface se adapte à cor escolhida.
