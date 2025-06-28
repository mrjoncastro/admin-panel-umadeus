## [POST] /api/chats/message/broadcast

Permite envio de mensagens manuais via WhatsApp para líderes, usuários ou todos.

- Campo `role`: define o público-alvo (`lider`, `usuario` ou `todos`)
- Campo `message`: texto a ser enviado

### Exemplo de payload
```json
{
  "message": "Olá, esta é uma mensagem de teste!",
  "role": "lider"
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
- O envio é feito para todos os usuários do público selecionado com telefone válido.
- O campo `errors` lista falhas individuais de envio. 