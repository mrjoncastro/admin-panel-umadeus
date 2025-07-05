# Ajuste de Rate Limit

A rota publica `/api/inscricoes/public` utiliza `next-rate-limit` para evitar abusos.

Por padrao, cada IP pode realizar **5 consultas por minuto**. Para alterar este limite, edite o valor passado para `publicLimiter.checkNext` no arquivo `app/api/inscricoes/public/route.ts`.

```ts
// altera a quantidade permitida por minuto
publicLimiter.checkNext(req, 10)
```

Reimplante a aplicacao apos modificar o valor para que o novo limite entre em vigor.
