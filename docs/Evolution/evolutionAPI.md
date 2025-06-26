## 1. Integração – Endpoints Principais

Nesta seção, detalhamos todos os endpoints disponíveis na Evolution API v2, incluindo parâmetros, exemplos de requisição/resposta e códigos de status.

> **Header obrigatório em todas as requisições**:
>
> ```http
> apikey: <SUA_CHAVE>
> Content-Type: application/json
> ```

**Base URL**: definida via variável de ambiente `EVOLUTION_API_URL`

> Exemplo (Linux/macOS):
>
> ```bash
> export EVOLUTION_API_URL=https://apievolution-evolution.r8dlf0.easypanel.host
> ```

---

### 1.1 Instâncias

#### 1.1.1 Criar Instância

- **Endpoint**: `POST /instance/create`
- **Body (JSON)**:

  ```json
  {
    "instanceName": "nomeDaInstancia",
    "qrcode": true,
    "integration": "WHATSAPP-BAILEYS"
    // ou "WHATSAPP-BUSINESS-API"
  }
  ```

- **Resposta 201**:

  ```json
  {
    "instance": "nomeDaInstancia",
    "status": "pending",
    "qrCodeUrl": "https://..."
  }
  ```

- **Erros Comuns**:

  - `400 Bad Request` – parâmetro faltando ou inválido
  - `409 Conflict` – instância já existe

#### 1.1.2 Listar Instâncias

- **Endpoint**: `GET /instance/fetchInstances`
- **Resposta 200**:

  ```json
  [
    { "instance": "inst1", "status": "connected" },
    { "instance": "inst2", "status": "disconnected" }
  ]
  ```

#### 1.1.3 Conectar Instância

- **Endpoint**: `GET /instance/connect/{instance}`
- **Path Parameter**:

  - `instance`: nome da instância

- **Resposta 200**:

  ```json
  { "instance": "inst1", "status": "connected" }
  ```

- **Uso**: força reconexão à conta WhatsApp e atualiza o status.

#### 1.1.4 Reiniciar Instância

- **Endpoint**: `POST /instance/restart/{instance}`
- **Resposta 200**:

  ```json
  { "instance": "inst1", "status": "restarting" }
  ```

#### 1.1.5 Definir Presença (Online/Away)

- **Endpoint**: `POST /instance/setPresence/{instance}`
- **Body**:

  ```json
  { "presence": "available" }
  ```

- **Valores**: `available`, `unavailable`, `composing`, `recording`, `paused`
- **Resposta 200**:

  ```json
  { "instance": "inst1", "presence": "available" }
  ```

#### 1.1.6 Status de Conexão

- **Endpoint**: `GET /instance/connectionState/{instance}`
- **Resposta 200**:

  ```json
  { "instance": "inst1", "connectionState": "CONNECTED" }
  ```

#### 1.1.7 Logout e Deleção

- **Logout**: `DELETE /instance/logout/{instance}` retorna `204 No Content`
- **Remover Instância**: `DELETE /instance/delete/{instance}` retorna `204 No Content`

---

### 1.2 Proxy

#### 1.2.1 Configurar Proxy

- **Endpoint**: `POST /proxy/set/{instance}`
- **Body**:

  ```json
  {
    "host": "proxy.exemplo.com",
    "port": 8080,
    "username": "user", // opcional
    "password": "pass" // opcional
  }
  ```

- **Resposta 200**: confirma configuração

#### 1.2.2 Obter Proxy

- **Endpoint**: `GET /proxy/find/{instance}`
- **Resposta 200**:

  ```json
  { "host": "proxy.exemplo.com", "port": 8080 }
  ```

---

### 1.3 Configurações Gerais

#### 1.3.1 Definir Configurações

- **Endpoint**: `POST /settings/set/{instance}`
- **Body**: qualquer chave suportada (e.g., `autoMarkRead`, `disableWebhook`)

  ```json
  { "autoMarkRead": true }
  ```

- **Resposta 200**: mapa completo das configurações ativas

#### 1.3.2 Obter Configurações

- **Endpoint**: `GET /settings/find/{instance}`
- **Resposta 200**:

  ```json
  { "autoMarkRead": true, "disableWebhook": false }
  ```

---

### 1.4 Envio de Mensagens

Para todos os endpoints de envio, o campo `instance` no path identifica a instância alvo.

#### 1.4.1 Enviar Texto

- **Endpoint**: `POST /message/sendText/{instance}`
- **Body**:

  ```json
  {
    "number": "5511999999999",
    "text": "Olá, mundo!"
  }
  ```

- **Resposta 200**:

  ```json
  { "messageId": "abc123" }
  ```

#### 1.4.2 Enviar Mídia

- **Endpoint**: `POST /message/sendMedia/{instance}`
- **Body** (URL ou base64):

  ```json
  {
    "number": "5511999999999",
    "mediaUrl": "https://.../imagem.jpg",
    "caption": "Legenda opcional"
  }
  ```

#### 1.4.3 Outros Tipos de Mensagem

- **PTV (vCard)**: `POST /message/sendPtv/{instance}`
- **Áudio (narrado)**: `POST /message/sendWhatsAppAudio/{instance}`
- **Sticker**: `POST /message/sendSticker/{instance}`
- **Localização**: `POST /message/sendLocation/{instance}`
- **Contatos**: `POST /message/sendContact/{instance}`
- **Reação**: `POST /message/sendReaction/{instance}`
- **Enquetes/Listas/Botões**: endpoints em `/message/sendPoll`, `/message/sendList`, `/message/sendButtons`

---

### 1.5 Chamadas (Voice & Fake)

- **Pasta**: `/call`
- **Endpoints**:

  - `POST /call/voice/{instance}`
  - `POST /call/fakeCall/{instance}`

- **Uso**: iniciar chamadas de voz ou simular chamada recebida

---

### 1.6 Operações de Chat, Labels e Perfil

#### 1.6.1 Chat

- **Listar Chats**: `GET /chat/list/{instance}`
- **Buscar Mensagens**: `GET /chat/fetchMessages/{instance}?chatId=<id>`
- **Marcar Lidas**: `POST /chat/markRead/{instance}`

#### 1.6.2 Labels

- **Criar Tag**: `POST /label/create/{instance}`
- **Aplicar Tag**: `POST /label/apply/{instance}`
- **Listar Tags**: `GET /label/list/{instance}`

#### 1.6.3 Perfil

- **Atualizar Nome/Status**: `POST /profile/updateName/{instance}` e `/profile/updateStatus/{instance}`
- **Atualizar Foto**: `POST /profile/updateProfilePicture/{instance}`
- **Privacidade**: endpoints em `/profile/privacy/*`

---

### 1.7 Grupos

- **Criar Grupo**: `POST /group/create/{instance}`
- **Editar Grupo**: `POST /group/edit/{instance}`
- **Buscar Convite**: `GET /group/fetchInvite/{instance}`
- **Participar**: `POST /group/join/{instance}`

---

### 1.8 Integrações Externas

Endpoints para configurar e testar integrações:

- **Webhooks**:

  - `POST /integration/webhook/set/{instance}`
  - `DELETE /integration/webhook/remove/{instance}`

- **RabbitMQ / SQS**:

  - `POST /integration/rabbitmq/set/{instance}`
  - `POST /integration/sqs/set/{instance}`

- **Chatwoot**: `POST /integration/chatwoot/set/{instance}`
- **Typebot**: `POST /integration/typebot/set/{instance}`
- **OpenAI & Dify**: configurar fluxos de NLP em `/integration/openai/set` e `/integration/dify/set`

---

### 1.9 Informações da API

- **Obter Status & Versão**: `GET /info`
- **Resposta 200**:

  ```json
  {
    "status": 200,
    "message": "API funcionando",
    "version": "2.x.x"
  }
  ```

---

## 2. Configuração de Ambiente

Antes de tudo, defina as variáveis:

```bash
export EVOLUTION_API_URL=https://apievolution-evolution.r8dlf0.easypanel.host
export POCKETBASE_URL=https://your-pocketbase-instance.url
```

## 3. Exemplos de Uso em JavaScript

```js
import axios from 'axios'
import PocketBase from 'pocketbase'

// Inicializa cliente PocketBase
const pb = new PocketBase(process.env.POCKETBASE_URL)

;(async () => {
  try {
    // Obtém registro na coleção whatsapp_clientes
    const cliente = await pb
      .collection('whatsapp_clientes')
      .getOne('ID_DO_REGISTRO')

    // Cria cliente Axios para Evolution API
    const evo = axios.create({
      baseURL: process.env.EVOLUTION_API_URL,
      headers: { apikey: cliente.apiKey },
    })

    // Envia mensagem de texto
    const res = await evo.post(`/message/sendText/${cliente.instanceName}`, {
      number: '5511999999999',
      text: 'Olá, mundo!',
    })

    console.log('Mensagem enviada, ID:', res.data.messageId)
  } catch (err) {
    console.error('Erro ao enviar mensagem:', err.response?.data || err.message)
  }
})()
```

> **Observação**: o `apiKey` é recuperado dinamicamente da coleção `whatsapp_clientes` no PocketBase para garantir segurança e multi-tenant.\*\*: Consulte sempre a documentação oficial para parâmetros avançados, limites de taxa e exemplos adicionais.

## 3. Coleção `whatsapp_clientes`

A coleção **whatsapp_clientes** possui o seguinte esquema de campos no PocketBase:

| Campo             | Tipo PB                                        | Detalhes                                       | Obrigatório | Descrição                                                          |
| ----------------- | ---------------------------------------------- | ---------------------------------------------- | ----------- | ------------------------------------------------------------------ |
| `id`              | Id                                             | -                                              | Sim         | Identificador único do registro                                    |
| `cliente`         | Relation                                       | Single m24_clientes                            | Sim         | Referência ao cliente no sistema                                   |
| `instanceName`    | Text                                           | Single                                         | Sim         | Nome da instância configurada na Evolution API                     |
| `instanceId`      | Text                                           | Single                                         | Sim         | ID interno gerado pela Evolution API                               |
| `apiKey`          | Text                                           | Single                                         | Sim         | Chave de API associada à instância                                 |
| `telefone`        | Text                                           | Single                                         |
| Sim               | Número E.164 utilizado na criação da instância |
|                   |
| `pairingCode`     | Text                                           | Single                                         | Não         | Código de pareamento (apenas enquanto `sessionStatus` = `pending`) |
| `sessionStatus`   | Select                                         | opções: `pending`, `connected`, `disconnected` | Sim         | Status da sessão                                                   |
| `qrCode`          | Text                                           | Single                                         | Não         | URL ou Base64 do QR Code para autenticação inicial                 |
| `config_finished` | Boolean                                        | -                                              | Não         | Indica se a configuração inicial foi completa                      |
| `created`         | Created                                        | timestamp                                      | Sim         | Data de criação do registro                                        |
| `updated`         | Updated                                        | timestamp                                      | Sim         | Data da última atualização do registro                             |

### 3.1 Endpoints de CRUD (`/admin/api/collections/whatsapp_clientes/records`)

Acesse a coleção via API administrativa (PocketBase) para criar, ler, atualizar e excluir registros:

- **Listar Clientes**

  ```http
  GET /admin/api/collections/whatsapp_clientes/records
  ```

- **Obter Cliente**

  ```http
  GET /admin/api/collections/whatsapp_clientes/records/{id}
  ```

- **Criar Cliente**

  ```http
  POST /admin/api/collections/whatsapp_clientes/records
  Content-Type: application/json

  { "cliente": "m24_clientes", "instanceName": "inst1", /* outros campos */ }
  ```

- **Atualizar Cliente**

  ```http
  PATCH /admin/api/collections/whatsapp_clientes/records/{id}
  Content-Type: application/json

  { "sessionStatus": "connected" }
  ```

- **Excluir Cliente**

  ```http
  DELETE /admin/api/collections/whatsapp_clientes/records/{id}
  ```

> Utilize autenticação administrativa (token ou cookie de sessão) para acessar estes endpoints de CRUD.
