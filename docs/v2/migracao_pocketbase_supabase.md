# Estratégia de Migração PocketBase (SQLite) → Supabase (PostgreSQL)

## Visão Geral

Este documento descreve o passo a passo para migrar todos os dados do PocketBase (banco SQLite) para o Supabase (PostgreSQL), incluindo tabelas, relacionamentos e arquivos binários (imagens/anexos).

---

## 1. Exportação dos Dados do PocketBase (SQLite)

- Utilize o SQLite CLI ou uma ferramenta gráfica (ex: DB Browser for SQLite).
- Para cada tabela relevante (usuarios, produtos, pedidos, inscrições, categorias, eventos, etc.), exporte para CSV:

```sh
sqlite3 docs/v2/backup/data.db <<EOF
.headers on
.mode csv
.once usuarios.csv
SELECT * FROM usuarios;
.once produtos.csv
SELECT * FROM produtos;
.once pedidos.csv
SELECT * FROM pedidos;
.once inscricoes.csv
SELECT * FROM inscricoes;
.once categorias.csv
SELECT * FROM categorias;
.once eventos.csv
SELECT * FROM eventos;
.quit
EOF
```

---

## 2. Ajuste dos CSVs para o Schema do Supabase

- Abra os CSVs em um editor de planilhas ou edite via script.
- Ajuste nomes de colunas, tipos e formatação para bater com o schema do Supabase:
  - Campos booleanos: true/false
  - Datas: formato ISO (YYYY-MM-DD ou YYYY-MM-DDTHH:MM:SSZ)
  - IDs: UUID ou texto conforme o Supabase
  - Relacionamentos: garanta que IDs referenciados existam
- Se necessário, utilize um script Python para automatizar a transformação dos dados.

---

## 3. Importação dos CSVs para o Supabase (PostgreSQL)

- Use o psql ou o painel do Supabase para importar os CSVs:

```sh
psql $SUPABASE_URL -c "\copy usuarios FROM 'usuarios.csv' DELIMITER ',' CSV HEADER;"
psql $SUPABASE_URL -c "\copy produtos FROM 'produtos.csv' DELIMITER ',' CSV HEADER;"
psql $SUPABASE_URL -c "\copy pedidos FROM 'pedidos.csv' DELIMITER ',' CSV HEADER;"
psql $SUPABASE_URL -c "\copy inscricoes FROM 'inscricoes.csv' DELIMITER ',' CSV HEADER;"
psql $SUPABASE_URL -c "\copy categorias FROM 'categorias.csv' DELIMITER ',' CSV HEADER;"
psql $SUPABASE_URL -c "\copy eventos FROM 'eventos.csv' DELIMITER ',' CSV HEADER;"
```

- Corrija erros de constraint, tipos ou relacionamentos conforme necessário.

---

## 4. Ajuste de Relacionamentos e Constraints

- Após importar, rode scripts SQL para corrigir relacionamentos (ex: IDs, foreign keys).
- Ajuste policies RLS se necessário.

---

## 5. Migração de Arquivos Binários (Imagens, Anexos)

- Os arquivos ficam em `docs/v2/backup/storage/`.
- Para cada registro que referencia um arquivo, faça upload para o Supabase Storage.
- Atualize o campo correspondente no banco com a URL do novo arquivo.
- Scripts de automação podem ser usados para upload em lote.

---

## 6. Validação e Testes

- Valide a integridade dos dados migrados (contagem de registros, amostragem de dados, relacionamentos).
- Teste as principais funcionalidades do sistema já com o Supabase.

---

## 7. Dicas e Observações

- Sempre faça backup dos dados antes de iniciar a migração.
- Migre primeiro em ambiente de homologação/teste.
- Ajuste scripts conforme diferenças de schema ou regras de negócio.
- Para grandes volumes, divida a importação em lotes menores.

---

## 8. Exemplos de Scripts de Transformação

Se necessário, utilize scripts Python, Node.js ou planilhas para:
- Renomear colunas
- Converter tipos de dados
- Gerar novos UUIDs
- Corrigir formatação de datas

---

**Dúvidas ou problemas? Consulte a equipe de desenvolvimento ou abra um issue no repositório.** 