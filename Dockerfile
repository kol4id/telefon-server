FROM node:20.9.0
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
COPY .env .
RUN npm run build
EXPOSE 4200
CMD ["npm", "run", "start:prod"]
