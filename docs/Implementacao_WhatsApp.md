## [POST] /api/chats/message/broadcast

Permite envio de mensagens manuais via WhatsApp para contatos selecionados.

- Campo `message`: texto a ser enviado
- Campo `recipients`: array com os IDs dos destinatários

### Exemplo de payload
```json
{
  "message": "Olá, esta é uma mensagem de teste!",
  "recipients": ["id1", "id2"]
}
```

### Resposta
```json
{
  "success": true,
  "message": "3 mensagens adicionadas à fila",
  "queueId": "tenant123",
  "totalMessages": 3,
  "estimatedTime": 2
}
```

- Apenas coordenadores podem acessar esta rota.
- As mensagens são adicionadas a uma fila com envio controlado por lotes.
- O campo `estimatedTime` indica a duração aproximada (minutos) para concluir o broadcast.

## [GET] /api/chats/contacts?role=lider|usuario|todos

Retorna a lista de usuários do tenant filtrando pelo papel desejado.

- Query `role`: `lider`, `usuario` ou `todos` (padrão).
- Requer autenticação de coordenador.
- Responde com um array de contatos contendo `id`, `name`, `phone` e `avatarUrl`.

### Exemplo de resposta
```json
[
  {
    "id": "abc123",
    "name": "João",
    "phone": "5511999999999",
    "avatarUrl": "https://.../avatar.png"
  }
]
```
