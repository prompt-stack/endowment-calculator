#!/bin/bash

# Comprehensive test runner for nonprofit-calculator
# Runs both Python backend tests and React frontend tests

echo "🧪 Running Nonprofit Calculator Test Suite"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall test status
BACKEND_STATUS=0
FRONTEND_STATUS=0

# Run Python backend tests
echo -e "\n${YELLOW}📊 Running Backend Tests (Python)${NC}"
echo "----------------------------------------"

# Check if virtual environment exists
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    pip install pytest pytest-cov
fi

# Run pytest with coverage
python -m pytest tests/ -v --cov=lib --cov=app --cov-report=term-missing
BACKEND_STATUS=$?

if [ $BACKEND_STATUS -eq 0 ]; then
    echo -e "${GREEN}✅ Backend tests passed!${NC}"
else
    echo -e "${RED}❌ Backend tests failed!${NC}"
fi

# Run React frontend tests
echo -e "\n${YELLOW}⚛️  Running Frontend Tests (React)${NC}"
echo "----------------------------------------"

cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
fi

# Run vitest
npm test -- --run
FRONTEND_STATUS=$?

if [ $FRONTEND_STATUS -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend tests passed!${NC}"
else
    echo -e "${RED}❌ Frontend tests failed!${NC}"
fi

cd ..

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