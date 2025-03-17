FROM node:20.18.0
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .
COPY .env .env
RUN npm run build

EXPOSE 4200

CMD ["npm", "run", "dev"]
