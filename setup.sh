#!/bin/bash
# Setup script for nonprofit calculator

echo "Setting up Nonprofit Calculator..."

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

echo "Setup complete! To run the calculator:"
echo "  source venv/bin/activate"
echo "  python bin/nonprofit-calc 1000000 --rate 0.04"