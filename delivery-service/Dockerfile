# Dockerfile 
FROM node:23-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3809
CMD ["npm","run","dev"]
