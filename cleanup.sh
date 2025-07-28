#!/bin/bash

# Cleanup script for nonprofit-calculator project
# This script organizes and removes unnecessary files

echo "🧹 Starting cleanup of nonprofit-calculator project..."

# Create archive directory for files we might want to reference later
mkdir -p archive/docs
mkdir -p archive/scripts
mkdir -p archive/debug

# Move debug/test files to archive
echo "📦 Archiving debug and test files..."
mv debug_calc.py debug_endpoints.py demo_with_ngrok.py archive/debug/ 2>/dev/null
mv simple_pdf_test.py variance_test.py archive/debug/ 2>/dev/null
mv test_*.py archive/debug/ 2>/dev/null

# Move non-essential documentation to archive
echo "📚 Archiving non-essential documentation..."
mv CLIENT_DEMO.md WHITE_LABEL_GUIDE.md analysis.md docker-deployment-summary.md transcript.md ngrok_instructions.md archive/docs/ 2>/dev/null

# Move demo scripts to archive
echo "🎬 Archiving demo scripts..."
mv quick_demo.sh run_demo.sh start_demo.sh archive/scripts/ 2>/dev/null

# Remove log files
echo "🗑️  Removing log files..."
rm -f app.log server.log

# Move grammar-ops to archive (it's a separate tool/framework)
echo "📁 Archiving grammar-ops framework..."
mv grammar-ops archive/ 2>/dev/null

# Clean up any Python cache files
echo "🐍 Cleaning Python cache..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
find . -type f -name "*.pyc" -delete 2>/dev/null

# Remove .DS_Store files if on macOS
echo "🍎 Removing .DS_Store files..."
find . -name ".DS_Store" -delete 2>/dev/null

echo "✅ Cleanup complete!"
echo ""
echo "📋 Summary:"
echo "- Debug/test files moved to: archive/debug/"
echo "- Extra docs moved to: archive/docs/"
echo "- Demo scripts moved to: archive/scripts/"
echo "- grammar-ops moved to: archive/"
echo "- Log files removed"
echo "- Python cache cleaned"
echo ""
echo "💡 The 'archive' folder contains files that might be useful for reference."
echo "   You can safely delete it once you're sure you don't need these files."