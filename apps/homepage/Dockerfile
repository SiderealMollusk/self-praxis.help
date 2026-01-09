# Start as root (default) but prepare permissions
FROM node:18-alpine

WORKDIR /app

# 1. Ownership: Give /app to `node` user upfront
RUN chown -R node:node /app

# 2. Switch to `node` user immediately
USER node

# 3. Copy files with correct ownership (Avoids massive chown later)
COPY --chown=node:node package*.json ./
RUN npm ci

COPY --chown=node:node . .
RUN npm run build

# 4. Create data directory (as node user)
RUN mkdir -p data

# Expose port 80
EXPOSE 80

# Run the server
CMD ["node", "server.js"]
