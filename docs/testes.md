# Guia de Testes

Este projeto utiliza [Vitest](https://vitest.dev/) para testes unitários e [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) para componentes React.

## Dependências

Instale as dependências de desenvolvimento com:

```bash
npm install
```

## Estrutura

Os arquivos de teste ficam no diretório `__tests__/` na raiz do projeto. Cada módulo possui um arquivo `*.test.ts` **ou** `*.test.tsx` correspondente.

## Execução

Para rodar a linter e toda a bateria de testes utilize:

```bash
npm run lint
npm run test
npm run a11y
```

Os testes de acessibilidade seguem o padrão `*.a11y.test.tsx` e ficam em
`__tests__/a11y/`.

Em ambientes de integração contínua utilize `npm run test:ci` para uma
execução única dos testes.

Antes de rodar `npm run lint`, `npm run build` ou `npm run test`, certifique-se de executar `npm install` para instalar todos os módulos necessários, como **Next** e **Vitest**.

Recomenda-se executar estes comandos antes de abrir um pull request.
