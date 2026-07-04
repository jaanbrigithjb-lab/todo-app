# Stage 1: Build the React application
FROM node:20-alpine AS build
WORKDIR /app

# Copy package configuration and lock files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source
COPY . .

# Build for production
RUN npm run build

# Stage 2: Serve static files using Nginx
FROM nginx:alpine

# Copy built files from build stage to nginx html folder
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
