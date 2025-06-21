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

## Par\u00e2metros da API

A rota `GET /api/inscricoes` aceita os seguintes filtros:

- `status` – filtra por status da inscri\u00e7\u00e3o (ex.: `pendente`, `aprovado`, `cancelado`).
- `perPage` – define a quantidade de registros retornados por p\u00e1gina.
