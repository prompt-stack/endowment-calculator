#!/bin/bash

# @script docker-cleanup
# @purpose Clean up Docker resources and handle port conflicts
# @layer infrastructure

echo "🧹 Docker Cleanup for Nonprofit Calculator"
echo "========================================"

# Stop any running containers
echo "📦 Stopping containers..."
docker-compose down --volumes --remove-orphans 2>/dev/null
docker-compose -f docker-compose.dev.yml down --volumes --remove-orphans 2>/dev/null

# Kill processes on common ports
echo "🔌 Checking for port conflicts..."
for port in 3000 5000 8080; do
    if lsof -i :$port >/dev/null 2>&1; then
        echo "Found process on port $port:"
        lsof -i :$port
        echo "Killing process..."
        lsof -ti :$port | xargs kill -9 2>/dev/null
        echo "✅ Port $port cleared"
    fi
done

# Clean up Docker system
echo "🐳 Cleaning Docker system..."
docker system prune -f --volumes

# Remove specific images if they exist
echo "🖼️  Removing project images..."
docker rmi nonprofit-calculator-frontend nonprofit-calculator-backend 2>/dev/null

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📍 Next steps:"
echo "   docker-compose up --build       # Production (port 8080)"
echo "   docker-compose -f docker-compose.dev.yml up --build  # Development"
echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://localhost:8080"
echo "   Backend:  http://localhost:5000"