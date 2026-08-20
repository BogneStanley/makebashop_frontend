#################################
# Build stage
#################################
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

#################################
# Runtime stage (Angular SSR)
#################################
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist /app/dist

RUN npm ci --omit=dev

EXPOSE 4000

USER node

CMD ["node", "dist/shop_front/server/server.mjs"]
