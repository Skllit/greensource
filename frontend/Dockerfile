# Dockerfile 
FROM node:23-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3801 
CMD ["npm","run","dev"]
