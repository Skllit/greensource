# Dockerfile 
FROM node:23-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3804 
CMD ["npm","run","dev"]
