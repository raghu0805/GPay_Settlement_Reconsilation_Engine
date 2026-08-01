# Multi-Stage Dockerfile for Google Pay Settlement Engine

# Stage 1: Build Application
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Build production bundle
RUN npm run build

# Stage 2: Serve Bundle with Lightweight Nginx
FROM nginx:alpine AS runner

# Copy custom Nginx configuration for SPA Routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files from Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP Port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
