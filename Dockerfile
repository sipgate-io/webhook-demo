FROM node:17.4.0-slim

WORKDIR /app
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci --production

COPY src/ src/

ENV PORT=8080
EXPOSE ${PORT}
ENV SIPGATE_WEBHOOK_SERVER_ADDRESS=""

CMD ["npm", "run", "start"]