FROM node:26-slim

WORKDIR /app
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci --omit=dev

COPY src/ src/
RUN npm run build

ENV PORT=8080
EXPOSE ${PORT}
ENV SIPGATE_WEBHOOK_SERVER_ADDRESS=""

CMD ["npm", "run", "start:dist"]
