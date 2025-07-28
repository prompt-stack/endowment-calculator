#!/bin/bash

# Docker-based test runner for nonprofit-calculator
# Runs tests inside Docker containers matching production environment

echo "🧪 Running Nonprofit Calculator Test Suite (Docker)"
echo "================================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall test status
BACKEND_STATUS=0
FRONTEND_STATUS=0

# Build test images
echo -e "\n${YELLOW}🔨 Building test containers...${NC}"
docker-compose -f docker-compose.test.yml build

# Run Python backend tests in Docker
echo -e "\n${YELLOW}📊 Running Backend Tests (Python)${NC}"
echo "----------------------------------------"

docker-compose -f docker-compose.test.yml run --rm backend-test
BACKEND_STATUS=$?

if [ $BACKEND_STATUS -eq 0 ]; then
    echo -e "${GREEN}✅ Backend tests passed!${NC}"
else
    echo -e "${RED}❌ Backend tests failed!${NC}"
fi

# Run React frontend tests in Docker
echo -e "\n${YELLOW}⚛️  Running Frontend Tests (React)${NC}"
echo "----------------------------------------"

docker-compose -f docker-compose.test.yml run --rm frontend-test
FRONTEND_STATUS=$?

if [ $FRONTEND_STATUS -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend tests passed!${NC}"
else
    echo -e "${RED}❌ Frontend tests failed!${NC}"
fi

# Cleanup
echo -e "\n${YELLOW}🧹 Cleaning up test containers...${NC}"
docker-compose -f docker-compose.test.yml down

# Summary
echo -e "\n${YELLOW}📋 Test Summary${NC}"
echo "=================="

if [ $BACKEND_STATUS -eq 0 ] && [ $FRONTEND_STATUS -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed:${NC}"
    [ $BACKEND_STATUS -ne 0 ] && echo -e "  ${RED}- Backend tests failed${NC}"
    [ $FRONTEND_STATUS -ne 0 ] && echo -e "  ${RED}- Frontend tests failed${NC}"
    exit 1
fi