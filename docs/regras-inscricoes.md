# Regras de Visualiza\u00e7\u00e3o e Inscri\u00e7\u00f5es

Este documento descreve como cada perfil acessa as inscri\u00e7\u00f5es, o processo de cria\u00e7\u00e3o realizado pelo usu\u00e1rio e os par\u00e2metros dispon\u00edveis na API.

## Perfis Dispon\u00edveis

- **Coordenador**
- **L\u00edder**
- **Usu\u00e1rio**

## Escopo de Visualiza\u00e7\u00e3o

- **Coordenador** – visualiza todas as inscri\u00e7\u00f5es de todos os campos e pode aprovar ou cancelar cada uma.
- **L\u00edder** – visualiza somente as inscri\u00e7\u00f5es vinculadas ao seu campo.
- **Usuário** – visualiza apenas as inscrições feitas por ele na página `/cliente/dashboard`.

## Cria\u00e7\u00e3o de Inscri\u00e7\u00e3o

1. O usu\u00e1rio acessa o formul\u00e1rio de inscri\u00e7\u00e3o e preenche seus dados pessoais.
2. Seleciona o campo desejado e confirma os termos de participa\u00e7\u00e3o.
   - Em rotas com `liderId` o campo é definido automaticamente conforme o líder e o valor não pode ser alterado.
3. Escolhe o produto de inscri\u00e7\u00e3o (quando houver) e envia o formul\u00e1rio.
4. A lideran\u00e7a aprova a inscri\u00e7\u00e3o caso o modo de confirma\u00e7\u00e3o manual esteja habilitado.
5. A API verifica se já existe usuário com o e-mail informado.
   - Se existir, o ID é usado em `criado_por`.
   - Caso contrário, cria usuário e vincula o ID à inscrição.
6. Quando a inscrição é enviada pela rota `/loja/api/inscricoes`, o sistema
   efetua o login automaticamente caso o usuário ainda não esteja autenticado.
7. Após a confirmação bem-sucedida, o usuário é redirecionado para `/inscricoes/conclusao`.

## Par\u00e2metros da API

A rota `GET /api/inscricoes` aceita os seguintes filtros:

- `status` – filtra por status da inscri\u00e7\u00e3o (ex.: `pendente`, `aprovado`, `cancelado`).
- `perPage` – define a quantidade de registros retornados por p\u00e1gina.

### Campos esperados nos endpoints

- **POST /api/inscricoes**
  - `nome`, `email`, `telefone`, `cpf`, `data_nascimento`, `genero`, `campo`, `eventoId`, `produtoId`, `tamanho`, `paymentMethod`, `liderId`
- **POST /loja/api/inscricoes**
  - `user_first_name`, `user_last_name`, `user_email`, `user_phone`, `user_cpf`, `user_birth_date`, `user_gender`, `user_cep`, `user_address`, `user_neighborhood`, `user_state`, `user_city`, `user_number`, `campo`, `evento`, `produtoId`, `tamanho`, `paymentMethod`

## Efeito de `confirma_inscricoes`

Quando `confirma_inscricoes` está **ativado** em `clientes_config`, cada inscrição permanece `pendente` até que um líder ou coordenador a aprove na tela **Inscrições**. Somente após essa aprovação o pedido é criado e o link de pagamento é enviado.

Com a opção **desativada**, o pedido é gerado automaticamente logo após o envio do formulário (desde que o evento tenha `cobra_inscricao` habilitado e um produto definido). A inscrição já é confirmada e a cobrança segue para o usuário.

## Formulário Multi-etapas

O frontend utiliza o componente `InscricaoWizard` para guiar o usuário pelo preenchimento dos dados em etapas. A mesma experiência está disponível na rota `loja/eventos/[id]` por meio do `InscricaoLojaWizard`.
As etapas são:

1. Dados Pessoais
2. Endereço
3. Campo de Atuação
4. Produto Vinculado
5. Revisão
6. Forma de Pagamento (exibida apenas quando `confirmaInscricoes` está desativado)
7. Confirmação final do envio

## Geração de Pedidos

O pedido proveniente da inscrição traz o campo `canal` com valor `inscricao`, diferenciando-o das compras comuns via checkout. Consulte [docs/regras-pedidos.md](docs/regras-pedidos.md) para o processo completo de pedidos.

## Fluxo Resumido

```text
[Usuário preenche Formulário]
        |
[Usuário já existe por e-mail?]
     /            \
   Sim            Não
   |               |
 [Usar ID]    [Criar Usuário]
     \            /
      v          v
[Evento tem produto?]
    /              \
  Não              Sim
  |                 |
[Inscrição gratuita] [Verifica confirmaInscricoes]
                         |
            ┌────────────┴─────────────┐
            |                          |
   Ativado (manual)            Desativado (automático)
            |                          |
[Status: pendente]            [Gerar pedido + cobrança]
[Aguardar aprovação]            [Asaas gera link?]
            |                          |
      [Aprovado?]                  /          \
            |                  Falha        Sucesso
[Gerar pedido + cobrança]       |             |
            |                 [Erro]   [Redirecionar para pagamento]
            v                               |
[Status do pedido: pendente → pago]       v
                      [Fim]
```

## Consulta e Redirecionamento

Para evitar cadastros duplicados, a tela de consulta chama primeiro a rota
`/api/usuarios/exists` enviando o **CPF** e o **e-mail** informados. Caso a API
retorne que já existe usuário com esses dados e o visitante **não esteja logado**, um
modal oferece o link de login:

```
/login?redirectTo=/inscricoes?evento=ID&cpf=CPF&email=EMAIL
```

Ao concluir o login, o componente `LoginForm` lê o parâmetro `redirectTo` e
executa `router.replace` para voltar à página indicada. Assim, o fluxo de
inscrição continua exatamente de onde parou.

Quando o usuário já está logado, os campos de CPF e e‑mail ficam preenchidos com
os dados da conta e permanecem desabilitados para edição. Caso a tela seja
acessada com `cpf` e `email` na URL (após o redirecionamento de login, por
exemplo), esses valores são ignorados e a consulta é feita diretamente com o CPF
e o e‑mail do usuário autenticado.

> **Nota**: para cadastrar outra pessoa, faça logout e repita o processo.

A seguir é feita uma requisição para `/api/inscricoes/public` passando `cpf`,
`email` e `evento`. As respostas definem o que será exibido:

1. **200 OK** – uma inscrição existente é retornada e seus dados aparecem na
   tabela.
2. **404 Not Found** – quando não há inscrição cadastrada. Se o usuário estiver
   logado **ou** as inscrições ainda estiverem abertas, o componente `EventForm`
   é mostrado para criar uma nova inscrição. Ao abrir, o CPF e o e‑mail
   digitados na consulta são repassados ao formulário, poupando o usuário de
   redigitar essas informações. Com o período encerrado, é exibida uma mensagem
   informando que não é mais possível se inscrever.

## Edição de Inscrição

Líderes podem atualizar dados como nome ou tamanho da camiseta, mas **não**
podem alterar o campo `status` durante a edição. Apenas coordenadores mantêm
permissão para mudar o status manualmente.
