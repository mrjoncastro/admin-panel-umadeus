# Dockerfile para Gateway (Next.js)
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install --frozen-lockfile || yarn install --frozen-lockfile || pnpm install --frozen-lockfile
RUN npm run build || yarn build || pnpm build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app .
EXPOSE 3000
CMD ["npm", "run", "start"] 