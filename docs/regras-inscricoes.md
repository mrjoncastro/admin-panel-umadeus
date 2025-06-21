# Regras de Visualiza\u00e7\u00e3o e Inscri\u00e7\u00f5es

Este documento descreve como cada perfil acessa as inscri\u00e7\u00f5es, o processo de cria\u00e7\u00e3o realizado pelo usu\u00e1rio e os par\u00e2metros dispon\u00edveis na API.

## Perfis Dispon\u00edveis

- **Coordenador**
- **L\u00edder**
- **Usu\u00e1rio**

## Escopo de Visualiza\u00e7\u00e3o

- **Coordenador** – visualiza todas as inscri\u00e7\u00f5es de todos os campos e pode aprovar ou cancelar cada uma.
- **L\u00edder** – visualiza somente as inscri\u00e7\u00f5es vinculadas ao seu campo.
- **Usu\u00e1rio** – visualiza apenas as inscri\u00e7\u00f5es feitas por ele na p\u00e1gina `/loja/cliente`.

## Cria\u00e7\u00e3o de Inscri\u00e7\u00e3o

1. O usu\u00e1rio acessa o formul\u00e1rio de inscri\u00e7\u00e3o e preenche seus dados pessoais.
2. Seleciona o campo desejado e confirma os termos de participa\u00e7\u00e3o.
3. Escolhe o produto de inscri\u00e7\u00e3o (quando houver) e envia o formul\u00e1rio.
4. A lideran\u00e7a aprova a inscri\u00e7\u00e3o caso o modo de confirma\u00e7\u00e3o manual esteja habilitado.
5. A API verifica se já existe usuário com o e-mail informado.
   - Se existir, o ID é usado em `criado_por`.
   - Caso contrário, cria usuário e vincula o ID à inscrição.

## Par\u00e2metros da API

A rota `GET /api/inscricoes` aceita os seguintes filtros:

- `status` – filtra por status da inscri\u00e7\u00e3o (ex.: `pendente`, `aprovado`, `cancelado`).
- `perPage` – define a quantidade de registros retornados por p\u00e1gina.

## Efeito de `confirma_inscricoes`

Quando `confirma_inscricoes` está **ativado** em `clientes_config`, cada inscrição permanece `pendente` até que um líder ou coordenador a aprove na tela **Inscrições**. Somente após essa aprovação o pedido é criado e o link de pagamento é enviado.

Com a opção **desativada**, o pedido é gerado automaticamente logo após o envio do formulário (desde que o evento tenha `cobra_inscricao` habilitado e um produto definido). A inscrição já é confirmada e a cobrança segue para o usuário.

## Formulário Multi-etapas

O frontend utiliza o componente `InscricaoWizard` para guiar o usuário pelo preenchimento dos dados em etapas.
As etapas são:
1. Dados Pessoais
2. Endereço
3. Campo de Atuação
4. Produto Vinculado
5. Forma de Pagamento (exibida apenas quando `confirmaInscricoes` está desativado)
6. Confirmação final do envio

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
