FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npx", "serve", "-s", "build", "-l", "tcp://0.0.0.0:$PORT"] 