# @dockerfile frontend/Dockerfile
# @purpose Frontend application container with Nginx
# @service_type frontend
# @base_image node
# @exposed_ports [80]
# @layer infrastructure
# @llm-read true
# @llm-write read-only
# @llm-role infrastructure

# Frontend Dockerfile
FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
