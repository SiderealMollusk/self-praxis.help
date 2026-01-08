FROM node:18-alpine

WORKDIR /app

# Copy package info and install dependencies (including server deps)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Create data directory (will be mounted over, but good for local dev)
RUN mkdir -p data

# Expose port 80
EXPOSE 80

# Run the server
CMD ["node", "server.js"]
