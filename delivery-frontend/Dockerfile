# delivery-frontend/Dockerfile
FROM node:23-slim

WORKDIR /app

# Copy lockfile first so we only re‑install on dependency changes
COPY package*.json ./

# Increase retries & timeouts, enforce official registry
RUN npm config set registry https://registry.npmjs.org/ \
 && npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm install

# Now copy rest of your code
COPY . .

EXPOSE 3802

# Make sure this matches your package.json script (usually "dev")
CMD ["npm", "run", "dev"]
