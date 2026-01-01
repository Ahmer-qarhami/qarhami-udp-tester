FROM node:18-alpine

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 9490

CMD ["npx", "nodemon", "server.js"]
