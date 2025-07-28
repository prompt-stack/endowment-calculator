#!/bin/bash

# @script add-all-metadata
# @purpose Master script to add comprehensive metadata to all project files
# @layer infrastructure
# @deps [add-metadata.sh, add-docker-metadata.sh, add-react-metadata.sh]

echo "🏷️  Comprehensive Metadata Addition for Nonprofit Calculator"
echo "==========================================================="

# Check if required scripts exist
scripts_dir="$(dirname "$0")"

if [ ! -f "$scripts_dir/add-docker-metadata.sh" ]; then
    echo "❌ Missing add-docker-metadata.sh"
    exit 1
fi

if [ ! -f "$scripts_dir/add-react-metadata.sh" ]; then
    echo "❌ Missing add-react-metadata.sh"
    exit 1
fi

if [ ! -f "$scripts_dir/add-metadata.sh" ]; then
    echo "❌ Missing add-metadata.sh"
    exit 1
fi

echo "✅ All required scripts found"
echo ""

# Add Docker metadata
echo "1️⃣ Adding Docker & Infrastructure metadata..."
"$scripts_dir/add-docker-metadata.sh" --all
echo ""

# Add React/TypeScript metadata
echo "2️⃣ Adding React/TypeScript metadata..."
"$scripts_dir/add-react-metadata.sh" --all
echo ""

# Add Python/Flask metadata (dry run - just report)
echo "3️⃣ Analyzing Python/Flask files..."
echo "   Backend files found:"
find . -name "*.py" -not -path "./venv/*" -not -path "./frontend/*" | wc -l | sed 's/^/   /'
echo "   (Python metadata available via add-metadata.sh)"
echo ""

# Generate metadata report
echo "4️⃣ Generating metadata coverage report..."

total_files=0
files_with_metadata=0

# Count Docker files
docker_files=$(find . -name "Dockerfile*" -o -name "docker-compose*.yml" -o -name ".dockerignore" -o -name "nginx.conf" | grep -v node_modules | wc -l)
docker_with_metadata=$(find . \( -name "Dockerfile*" -o -name "docker-compose*.yml" -o -name ".dockerignore" -o -name "nginx.conf" \) -exec grep -l "@dockerfile\|@docker-compose\|@dockerignore\|@nginx" {} \; 2>/dev/null | wc -l)

# Count React files
react_files=$(find ./frontend/src -name "*.tsx" -o -name "*.ts" -o -name "*.css" | wc -l)
react_with_metadata=$(find ./frontend/src \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) -exec grep -l "@fileoverview\|@component" {} \; 2>/dev/null | wc -l)

# Count Python files
python_files=$(find . -name "*.py" -not -path "./venv/*" -not -path "./frontend/*" | wc -l)
python_with_metadata=$(find . -name "*.py" -not -path "./venv/*" -not -path "./frontend/*" -exec grep -l "@file\|@module_type" {} \; 2>/dev/null | wc -l)

total_files=$((docker_files + react_files + python_files))
files_with_metadata=$((docker_with_metadata + react_with_metadata + python_with_metadata))

echo "📊 Metadata Coverage Report:"
echo "   Docker/Infrastructure: $docker_with_metadata/$docker_files files"
echo "   React/TypeScript:      $react_with_metadata/$react_files files"  
echo "   Python/Flask:          $python_with_metadata/$python_files files"
echo "   Total Coverage:        $files_with_metadata/$total_files files"

coverage_percent=$((files_with_metadata * 100 / total_files))
echo "   Coverage Percentage:   $coverage_percent%"

if [ $coverage_percent -gt 80 ]; then
    echo "   Status: ✅ Excellent metadata coverage"
elif [ $coverage_percent -gt 60 ]; then
    echo "   Status: 🟡 Good metadata coverage"
else
    echo "   Status: 🔴 Needs improvement"
fi

echo ""
echo "🎯 Next Steps:"
echo "   1. Run 'docker-compose up --build' to test the application"
echo "   2. Run './scripts/add-metadata.sh' for Python files if needed"
echo "   3. Use grammar-ops tools for advanced code analysis"
echo ""
echo "✅ Comprehensive metadata addition complete!"