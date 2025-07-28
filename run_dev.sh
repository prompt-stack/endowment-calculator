#!/bin/bash
# Development runner script

echo "Starting Nonprofit Calculator Development Server..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install flask

# Run the app
echo "Starting Flask app..."
python3 app.py