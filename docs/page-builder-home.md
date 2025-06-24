# Page Builder - Home

Esta funcionalidade permite montar a página inicial da loja através de blocos dinâmicos.
As seções são armazenadas na coleção `home_sections` do PocketBase e podem ser
reordenadas no painel administrativo.

## API

- `GET /api/home-sections` – lista as seções da home para o tenant atual.
- `POST /api/home-sections` – cria uma nova seção (requer papel `coordenador`).
- `PUT /api/home-sections/:id` – atualiza dados da seção (requer papel `coordenador`).
- `DELETE /api/home-sections/:id` – remove a seção (requer papel `coordenador`).

## Admin

O construtor visual está acessível em `/admin/page-builder/home`. Ele utiliza
`@dnd-kit` para arrastar e soltar os blocos e os componentes do design system
para os formulários de criação.
