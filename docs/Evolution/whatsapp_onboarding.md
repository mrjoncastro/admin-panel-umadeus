# 📱 WhatsApp Onboarding API

> Documentação dos endpoints necessários para o fluxo de onboarding da instância WhatsApp  
> Inclui cadastro, verificação, polling, envio de teste e envio de produção.

---

## 📑 Índice

1. [Cadastro de Instância](#1-cadastro-de-instância)
2. [Check de Existência](#2-check-de-existência)
3. [Polling de Conexão](#3-polling-de-conexão)
4. [Envio de Mensagem de Teste](#4-envio-de-mensagem-de-teste)
5. [Exclusão de Instância](#5-exclusao-de-instancia)
6. [Envio de Mensagem (Produção)](#6-envio-de-mensagem-produção)
7. [Fluxo Front-end (React)](#7-fluxo-front-end-react)
8. [Boas Práticas](#8-boas-práticas)

---

## 1. Cadastro de Instância

**POST** `/api/chats/whatsapp/cadastrar`

- **Headers**

  - `Content-Type: application/json`
  - `x-tenant-id: <tenantId>`
  - Cookie `pb_auth`

- **Body**
  ```json
  {
    "telefone": "5511999999999"
  }
  Resposta 201
  ```

json
Copiar
Editar
{
"instance": {
"instanceName": "nome-do-cliente",
"instanceId": "uuid",
/_ …outros campos… _/
},
"apiKey": "CHAVE_EVOLUTION",
"pairingCode": "ABC1234",
"qrCodeUrl": "https://…/qr-<uuid>.png",
"qrBase64": "<base64 sem prefixo>"
}
Erros

Status Código Descrição
400 invalid_phone Telefone fora do padrão E.164
400 tenant_ausente Cabeçalho x-tenant-id faltando
401 unauthorized Usuário sem permissão
500 server_error Erro interno

2. Check de Existência
   GET /api/chats/whatsapp/instance/check

Headers

x-tenant-id: <tenantId>

Resposta 200

Se não existir:

json
Copiar
Editar
null
Se existir:

json
Copiar
Editar
{
"instanceName": "nome-do-cliente",
"apiKey": "…",
"telefone": "5511999999999",
"sessionStatus": "pending" | "connected" | "disconnected"
} 3. Polling de Conexão
POST /api/chats/whatsapp/instance/connectionState

Headers

Content-Type: application/json

x-tenant-id: <tenantId>

Body

json
Copiar
Editar
{
"instanceName": "nome-do-cliente",
"apiKey": "…"
}
Resposta 200

json
Copiar
Editar
{
"instance": { "state": "open" | "close" | "pending" },
"state": "open" | "close" | "pending"
}
Ações Internas

Se state === "open" → atualiza sessionStatus = connected

Se state === "close" → atualiza sessionStatus = pending

4. Envio de Mensagem de Teste
   POST /api/chats/whatsapp/message/sendTest/{instanceName}

Headers

Content-Type: application/json

x-tenant-id: <tenantId>

Body

json
Copiar
Editar
{
"to": "5511999999999",
"message": "Olá! QR autenticado com sucesso!"
}
Resposta 200

json
Copiar
Editar
{
"ok": true,
"result": { /_ retorno da Evolution _/ }
}
Erros

409 Conflict se config_finished === true

500 se falha na API externa

5. Exclusão de Instância
   DELETE /api/chats/whatsapp/instance/delete

Headers

x-tenant-id: <tenantId>

Resposta 200

json
Copiar
Editar
{
"ok": true
}

---

6. Envio de Mensagem (Produção)
   POST /api/chats/whatsapp/message/sendText/{instanceName}

Headers

Content-Type: application/json

x-tenant-id: <tenantId>

Body

json
Copiar
Editar
{
"to": "5511999999999",
"message": "Texto qualquer"
}
Resposta 200
→ JSON retornado pela Evolution

Erros: 400 / 404 / 500 conforme validações

7. Fluxo Front-end (React)
   Step 1: usuário insere DDD+número → chama /cadastrar.

Step 2: mostra spinner até resposta.

Step 3: exibe QR Code (qrBase64 inline) e inicia polling /connectionState.

Step 4: ao detectar state === open, exibe campo de destino e chama /sendTest/{instanceName}.

Step 5: exibe mensagem de sucesso e bloqueia reenvio (config_finished = true).

8. Boas Práticas
   Utilize middleware para validar pb_auth e x-tenant-id.

Trate erros com try/catch e retorne códigos HTTP adequados.

Separe rotas de teste (sendTest) e produção (sendText).

Escreva testes automatizados de integração para cada endpoint.
