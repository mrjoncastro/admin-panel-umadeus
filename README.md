This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Lint e boas práticas

Execute `npm run lint` para verificar problemas de código. Evite o uso de `any` especificando tipos adequados e sempre inclua todas as dependências utilizadas dentro dos hooks `useEffect`.

## Additional Features

- Interactive notification bell lists pending sign-up names and fields outside
  the header.
- Mobile navigation includes a "back to top" button for easier scrolling.
- Search forms for orders and registrations adapt to the user role and allow
  busca pelo nome do inscrito.
- Users can switch between light and dark themes.
- Toast notifications inform success or error of actions.
- Minimalist tables and buttons for a consistent look.
- Dashboard now includes temporal charts showing sign-up and order evolution,
  along with average order value and revenue per field for coordinators and
  leaders.
- Analytics charts support date range filters and allow exporting the data as
  CSV or XLSX spreadsheets.


## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz e defina as seguintes variáveis:

- `NEXT_PUBLIC_PB_URL` - URL do PocketBase
- `PB_ADMIN_EMAIL` - e-mail do administrador do PocketBase
- `PB_ADMIN_PASSWORD` - senha do administrador
- `MERCADO_PAGO_ACCESS_TOKEN` - token do Mercado Pago
- `NEXT_PUBLIC_SITE_URL` - endereço do site (opcional)

## Testes

Para rodar a suíte de testes utilize:

```bash
npm run test
```

## Build

Para gerar o build de produção execute:

```bash
npm run build
```
