FROM node:22-alpine

WORKDIR /app
COPY package.json ./package.json
RUN npm install --omit=dev --no-audit --no-fund
COPY src ./src

ENV NODE_ENV=production
ENV PORT=1488
EXPOSE 1488

CMD ["node", "src/index.js"]
