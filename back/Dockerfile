FROM node:alpine

WORKDIR /app

COPY package*.json ./

ENV http_proxy=http://mackcloud:cloud2019@172.16.50.1:8080
ENV https_proxy=http://mackcloud:cloud2019@172.16.50.1:8080

RUN npm install

COPY . .

#RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]