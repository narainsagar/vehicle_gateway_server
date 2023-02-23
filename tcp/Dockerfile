FROM node:14

WORKDIR /tcp

COPY package*.json ./

RUN npm install

COPY server.js ./

EXPOSE 4000

CMD ["node", "server.js"]