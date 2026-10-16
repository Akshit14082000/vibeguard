FROM node:22.14.0-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY tsconfig.json .node-version .env.example README.md ./
COPY src ./src
RUN npm run build
ENTRYPOINT ["node", "dist/cli.js"]
