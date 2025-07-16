# Padrão de Lint e Tipagem para Next.js + ESLint

## Problema

O Next.js (até a versão 15.4.x) **não é compatível com o ESLint 9.x** e o novo formato de configuração flat config (`eslint.config.mjs`).

- Ao tentar usar ESLint 9.x ou flat config, o comando `next lint` e o build quebram com erros de opções obsoletas.
- O build também pode apresentar erros de tipagem em arquivos `.next/types` mesmo com código correto, devido a bugs internos do Next.js.
- Issue oficial: https://github.com/vercel/next.js/issues/64409

## Solução aplicada

1. **Padronização de todo o projeto para ESLint 8.57.0** (última versão 8.x suportada pelo Next.js).
2. **Uso da configuração antiga do ESLint** (`.eslintrc.js`), compatível com Next.js e ESLint 8.x.
3. **Remoção de qualquer configuração flat config** (`eslint.config.mjs`).
4. **Scripts de lint** ajustados para rodar com a configuração antiga.
5. **Remoção de arquivos de lock duplicados** para evitar conflitos de dependências.

## Como manter o projeto saudável

- Sempre rode `npm run lint` antes do build.
- Use apenas `.eslintrc.js` para configuração do ESLint.
- **Não atualize o ESLint para a versão 9.x** até o Next.js liberar suporte.
- Se precisar de regras customizadas, adicione no bloco `rules` do `.eslintrc.js`.
- Caso surjam dúvidas, consulte a [issue oficial do Next.js](https://github.com/vercel/next.js/issues/64409).

## Exemplo de `.eslintrc.js`

```js
module.exports = {
  extends: ['next/core-web-vitals', 'next'],
  rules: {
    // Suas regras customizadas aqui
  },
};
```

---

**Este padrão garante builds confiáveis, lint funcional e tipagem segura até que o Next.js libere suporte oficial ao ESLint 9/flat config.** 