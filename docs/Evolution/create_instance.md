# Rota: Cadastrar WhatsApp (POST) — Criar Instância

**Documentação Oficial da Evolution API v2.2.2**: [https://www.postman.com/agenciadgcode/evolution-api/documentation/jn0bbzv/evolution-api-v2-2-2](https://www.postman.com/agenciadgcode/evolution-api/documentation/jn0bbzv/evolution-api-v2-2-2)
**API Reference (Create Instance Basic)**: [https://doc.evolution-api.com/v1/api-reference/instance-controller/create-instance-basic](https://doc.evolution-api.com/v1/api-reference/instance-controller/create-instance-basic)

Esta rota registra o número de WhatsApp e cria/atualiza a instância associada, definindo dinamicamente o `instanceName` a partir do nome do cliente em `m24_cliente`.

---

## 1. Caminho

```
POST /api/chats/whatsapp/cadastrar
```

Arquivo:

```
app/api/chats/whatsapp/cadastrar/route.ts
```

---

## 2. Descrição

- Recebe no body:

  - `telefone` em formato E.164.
  - `instanceName`: identificador da instância (ex.: nome do cliente formatado).
  - `qrcode`: booleano (`true` para gerar QR Code imediatamente\`).

- Persiste em `whatsapp_clientes` os campos: `telefone`, `instanceName`, `apiKey`.

---

## 3. Validações e Autenticação

1. **Formato do Telefone**: regex `/^\+?[1-9]\d{7,14}$/`.
2. **Autenticação**: valida cookie `pb_auth` do PocketBase.
3. **Permissões**: apenas roles `coordinator` ou `admin`.

---

## 4. Request

### Headers

| Cabeçalho      | Obrigatório | Descrição                         |
| -------------- | ----------- | --------------------------------- |
| `Content-Type` | Sim         | `application/json`                |
| `Cookie`       | Sim         | Cookie `pb_auth` (JWT PocketBase) |

### Body

```json
{
  "telefone": "5511999999999",
  "instanceName": "{{instance}}",
  "qrcode": true
}
```

---

## 5. Response

### Sucesso (201)

```json
{
  "id": "<uuid>",
  "cliente": "m24_cliente/<id>",
  "instanceName": "nome-do-cliente",
  "apiKey": "<chave_api>",
  "qrCode": null,
  "sessionStatus": "pending"
}
```

### Erros

| Código | Descrição                              |
| ------ | -------------------------------------- |
| 400    | `invalid_phone` — Telefone inválido    |
| 401    | `unauthorized` — Falha de autenticação |
| 500    | `server_error` — Erro interno          |

```json
{ "error": "invalid_phone", "message": "Formato de telefone inválido" }
```

---

## 6. Exemplo de Implementação

```ts
// app/api/chats/whatsapp/cadastrar/route.ts
import { NextResponse } from 'next/server'
import PocketBase from 'pocketbase'
import { saveClient } from '@/lib/server/chats'
import type { NextRequest } from 'next/server'

const PHONE_REGEX = /^\+?[1-9]\d{7,14}$/

export async function POST(request: NextRequest) {
  try {
    const { telefone } = await request.json()
    if (!PHONE_REGEX.test(telefone)) {
      return NextResponse.json(
        { error: 'invalid_phone', message: 'Formato de telefone inválido' },
        { status: 400 },
      )
    }

    const pb = new PocketBase(process.env.POCKETBASE_URL!)
    await pb.authStore.loadFromCookie(
      request.cookies.get('pb_auth')?.value || '',
    )
    const authModel = pb.authStore.model
    if (!authModel) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Usuário não autenticado' },
        { status: 401 },
      )
    }

    const clienteData = await pb.collection('m24_cliente').getOne(authModel.id)
    const instanceName = clienteData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')

    const client = await saveClient({
      telefone,
      instanceName,
      apiKey: process.env.EVOLUTION_API_KEY!,
    })

    return NextResponse.json(client, { status: 201 })
  } catch (err) {
    console.error('Cadastro WhatsApp failed:', err)
    return NextResponse.json(
      { error: 'server_error', message: 'Erro interno' },
      { status: 500 },
    )
  }
}
```

---

## 7. Boas Práticas

- Use middleware para validar JWT e `x-tenant-id`.
- Trate erros com `try/catch` e retorne status apropriados.
- Escreva testes de integração para essa rota.

_Fim da documentação da rota Cadastrar WhatsApp._
