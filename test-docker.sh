#!/bin/bash

# @script test-docker
# @purpose Test Docker setup for nonprofit calculator
# @layer infrastructure
# @deps [docker-compose.yml, Docker daemon]

echo "🐳 Testing Docker Setup for Nonprofit Calculator"
echo "================================================"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is running"

# Check if docker-compose is available
if ! command -v docker-compose >/dev/null 2>&1; then
    echo "❌ docker-compose not found. Please install Docker Compose."
    exit 1
fi

echo "✅ Docker Compose is available"

# Build the services
echo ""
echo "🏗️  Building Docker images..."
docker-compose build --no-cache

if [ $? -eq 0 ]; then
    echo "✅ Docker images built successfully"
else
    echo "❌ Failed to build Docker images"
    exit 1
fi

# Start the services
echo ""
echo "🚀 Starting services..."
docker-compose up -d

if [ $? -eq 0 ]; then
    echo "✅ Services started successfully"
else
    echo "❌ Failed to start services"
    exit 1
fi

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Test backend health
echo ""
echo "🔍 Testing backend connectivity..."
backend_health=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/portfolios)

if [ "$backend_health" = "200" ]; then
    echo "✅ Backend is responding (status: $backend_health)"
else
    echo "❌ Backend health check failed (status: $backend_health)"
    echo "Backend logs:"
    docker-compose logs backend
fi

# Test frontend
echo ""
echo "🔍 Testing frontend connectivity..."
frontend_health=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)

if [ "$frontend_health" = "200" ]; then
    echo "✅ Frontend is responding (status: $frontend_health)"
else
    echo "❌ Frontend health check failed (status: $frontend_health)"
    echo "Frontend logs:"
    docker-compose logs frontend
fi

# Show running containers
echo ""
echo "📋 Running containers:"
docker-compose ps

# Show access URLs
echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo "   API:      http://localhost:5000/api/portfolios"
echo ""
echo "To stop services: docker-compose down"
echo "To view logs:     docker-compose logs -f"