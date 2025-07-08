# Contribuindo

Este repositório segue arquitetura monorepo. Siga as orientações abaixo:

## Estrutura
- Serviços em `services/`
- Bibliotecas compartilhadas em `libs/`

## Guidelines
- Cada microserviço deve ter seu próprio Dockerfile e scripts
- Use libs compartilhadas via imports do `libs/`
- PRs devem passar por revisão de DevOps/Backend/Frontend conforme área
- Pipeline CI/CD roda lint, type-check, testes e build em cada PR

## Validação de código

Certifique-se de rodar `npm install` **antes** de executar `npm run lint` ou `npm run build`.

Execute `npm run lint` antes de cada commit para garantir que não há problemas de lint.

## Atualização da documentação

Qualquer alteração em documentos deve ser registrada em `logs/DOC_LOG.md`. Adicione uma linha seguindo o formato:

```
## [AAAA-MM-DD] Descrição da mudança
```

## Mensagens de commit

Utilize o padrão [Conventional Commits](https://www.conventionalcommits.org/) para descrever as alterações de forma consistente.
