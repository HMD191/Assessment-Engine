# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json & package-lock.json first (caching layer)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Stage 2: Run
FROM node:20-alpine

WORKDIR /app

# Copy package.json + node_modules
COPY package*.json ./
RUN npm install --production

# Copy built files
COPY --from=builder /app/dist ./dist

# Expose port for API
EXPOSE 3000

# Default command (API)
CMD ["node", "dist/main.js"]
