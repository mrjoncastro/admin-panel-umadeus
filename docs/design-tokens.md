# Design Tokens

Este documento lista os tokens de design definidos em `app/globals.css` e como utilizá-los nos componentes.

## Cores

- `--background`: cor de fundo principal.
- `--foreground`: cor do texto principal.
- `--text-primary`: cor de texto prioritária.
- `--text-secondary`: cor de texto secundária.
- `--accent`: cor de destaque/ação.
- `--color-secondary`: cor complementar utilizada em fundos e elementos de navegação.
- `neutral-50` a `neutral-950`: tons de cinza definidos no `tailwind.config.js` para uso em `@apply`.
- `error`: paleta de vermelhos para mensagens de erro (`text-error`).
- `primary-50` a `primary-900`: paleta roxa principal utilizada em botões e links.

## Espaçamentos

- `--space-xs`: `0.25rem` – espaçamentos muito pequenos.
- `--space-sm`: `0.5rem` – espaçamentos pequenos.
- `--space-md`: `1rem` – espaçamentos padrão.
- `--space-lg`: `1.5rem` – espaçamentos grandes.
- `--space-xl`: `2rem` – espaçamentos muito grandes.

## Fontes

- `--font-body`: fonte principal do site.
- `--font-heading`: fonte para títulos e ênfases.

## Uso

Os tokens podem ser consumidos via classes utilitárias do Tailwind usando valores arbitrários ou pelo atributo `style`.

Exemplo de uso em um componente:

```jsx
<button className="bg-[var(--accent)] text-white p-[var(--space-sm)]">
  Ação
</button>
```

```tsx
<div style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-md)' }}>
  Conteúdo
</div>
```

### Padrão de Botões e Inputs

Todos os componentes interativos utilizam classes globais para manter a
uniformidade. As principais são:

```html
<button class="btn btn-primary">Ação</button>
<input class="input-base" />
```

Essas classes aplicam cores `primary-600` e foco `error-600` definidos em
`tailwind.config.js`.
