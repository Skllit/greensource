# Dockerfile 
FROM node:23-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3808 
CMD ["npm","run","dev"]
