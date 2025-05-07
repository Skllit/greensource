# Dockerfile 
FROM node:23-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3803 
CMD ["npm","run","dev"]
