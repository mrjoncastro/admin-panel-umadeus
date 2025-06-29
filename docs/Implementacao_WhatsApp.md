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
  "success": 12,
  "failed": 3,
  "errors": ["Telefone inválido: Fulano", "Ciclano: Erro ao enviar texto: ..."]
}
```

- Apenas coordenadores podem acessar esta rota.
- O envio é feito apenas para os usuários selecionados com telefone válido.
- O campo `errors` lista falhas individuais de envio. 

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
