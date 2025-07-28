#!/bin/bash

# @script add-react-metadata
# @purpose Add universal metadata to React/TypeScript files following grammar-ops standards
# @output console
# @layer frontend
# @deps [grammar-ops/scripts/add-js-metadata.sh]

add_metadata_to_tsx() {
    local file=$1
    local file_rel=${file#./}
    local filename=$(basename "$file" .tsx)
    local dirname=$(dirname "$file")
    
    # Skip if already has metadata
    if head -10 "$file" | grep -q "@fileoverview" 2>/dev/null; then
        echo "✓ Already has metadata: $file"
        return
    fi
    
    # Determine component layer and metadata based on directory structure
    local layer="unknown"
    local purpose="[TODO: Add purpose]"
    local llm_write="full-edit"
    local llm_role="component"
    local status="stable"
    local dependencies="[]"
    
    # Analyze directory structure for layer classification
    if [[ "$dirname" =~ components/primitives ]]; then
        layer="primitives"
        purpose="$(echo $filename | sed 's/([A-Z])/ \1/g' | sed 's/^./\u&/') primitive component"
        llm_role="pure-component"
        dependencies="[]"
    elif [[ "$dirname" =~ components/composed ]]; then
        layer="composed"
        purpose="$(echo $filename | sed 's/([A-Z])/ \1/g' | sed 's/^./\u&/') composed component"
        llm_role="stateful-component"
        # Extract primitive dependencies
        dependencies=$(grep -E "from ['\"]\.\.\/primitives" "$file" 2>/dev/null | \
            sed -E "s/.*from ['\"]\.\.\/primitives\/([^'\"]*).*/\1/" | \
            tr '\n' ', ' | sed 's/,$//' | sed 's/,/, /g')
        if [ ! -z "$dependencies" ]; then
            dependencies="[$dependencies]"
        else
            dependencies="[]"
        fi
    elif [[ "$dirname" =~ components/features ]]; then
        layer="features"
        purpose="$(echo $filename | sed 's/([A-Z])/ \1/g' | sed 's/^./\u&/') feature component"
        llm_role="business-logic"
        # Extract all component dependencies
        dependencies=$(grep -E "from ['\"]\.\.\/\.\.\/" "$file" 2>/dev/null | \
            sed -E "s/.*from ['\"]\.\.\/\.\.\/.*\/([^'\"]*).*/\1/" | \
            tr '\n' ', ' | sed 's/,$//' | sed 's/,/, /g')
        if [ ! -z "$dependencies" ]; then
            dependencies="[$dependencies]"
        else
            dependencies="[]"
        fi
    elif [[ "$dirname" =~ components/layout ]]; then
        layer="layout"
        purpose="$(echo $filename | sed 's/([A-Z])/ \1/g' | sed 's/^./\u&/') layout component"
        llm_role="structural-component"
    elif [[ "$dirname" =~ components/pages ]]; then
        layer="pages"
        purpose="$(echo $filename | sed 's/([A-Z])/ \1/g' | sed 's/^./\u&/') page component"
        llm_role="route-component"
    elif [[ "$dirname" =~ hooks ]]; then
        layer="hooks"
        purpose="$(echo $filename | sed 's/([A-Z])/ \1/g' | sed 's/^./\u&/') custom hook"
        llm_role="state-management"
    elif [[ "$dirname" =~ services ]]; then
        layer="services"
        purpose="$(echo $filename | sed 's/([A-Z])/ \1/g' | sed 's/^./\u&/') service layer"
        llm_role="api-service"
        llm_write="suggest-only"
    elif [[ "$dirname" =~ types ]]; then
        layer="types"
        purpose="Type definitions for $(echo $filename | sed 's/([A-Z])/ \1/g')"
        llm_role="type-definitions"
    elif [[ "$dirname" =~ utils ]]; then
        layer="utils"
        purpose="Utility functions for $(echo $filename | sed 's/([A-Z])/ \1/g')"
        llm_role="utility"
    fi
    
    # Create metadata header
    local metadata="/**
 * @fileoverview $purpose
 * @layer $layer
 * @status $status
 * @dependencies $dependencies
 */

"
    
    # Read current content
    local content=$(cat "$file")
    
    # Write metadata + content
    echo "$metadata$content" > "$file"
    
    echo "✅ Added metadata to: $file"
    echo "   Layer: $layer"
    echo "   Purpose: $purpose"
    echo "   Role: $llm_role"
}

add_metadata_to_ts() {
    local file=$1
    local file_rel=${file#./}
    local filename=$(basename "$file" .ts)
    local dirname=$(dirname "$file")
    
    # Skip if already has metadata
    if head -10 "$file" | grep -q "@fileoverview" 2>/dev/null; then
        echo "✓ Already has metadata: $file"
        return
    fi
    
    # Determine file type and metadata
    local layer="unknown"
    local purpose="[TODO: Add purpose]"
    local llm_write="full-edit"
    local llm_role="utility"
    
    if [[ "$dirname" =~ hooks ]]; then
        layer="hooks"
        purpose="$(echo $filename | sed 's/use//' | sed 's/([A-Z])/ \1/g' | sed 's/^./\u&/') custom hook"
        llm_role="state-management"
    elif [[ "$dirname" =~ services ]]; then
        layer="services"
        purpose="$(echo $filename | sed 's/([A-Z])/ \1/g' | sed 's/^./\u&/') service"
        llm_role="api-service"
        llm_write="suggest-only"
    elif [[ "$dirname" =~ types ]]; then
        layer="types"
        purpose="Type definitions for $(echo $filename | sed 's/([A-Z])/ \1/g')"
        llm_role="type-definitions"
    elif [[ "$dirname" =~ utils ]]; then
        layer="utils"
        purpose="Utility functions for $(echo $filename | sed 's/([A-Z])/ \1/g')"
        llm_role="utility"
    fi
    
    # Create metadata header
    local metadata="/**
 * @fileoverview $purpose
 * @layer $layer
 * @status stable
 */

"
    
    # Read current content
    local content=$(cat "$file")
    
    # Write metadata + content
    echo "$metadata$content" > "$file"
    
    echo "✅ Added metadata to: $file"
    echo "   Layer: $layer"
    echo "   Purpose: $purpose"
}

add_metadata_to_css() {
    local file=$1
    local file_rel=${file#./}
    local filename=$(basename "$file" .css)
    local dirname=$(dirname "$file")
    
    # Skip if already has metadata
    if head -10 "$file" | grep -q "@fileoverview" 2>/dev/null; then
        echo "✓ Already has metadata: $file"
        return
    fi
    
    # Determine component relationship
    local component_name=""
    local layer="unknown"
    
    if [[ "$dirname" =~ components/primitives ]]; then
        layer="primitives"
        component_name=$(echo $filename | sed 's/^./\u&/')
    elif [[ "$dirname" =~ components/composed ]]; then
        layer="composed"
        component_name=$(echo $filename | sed 's/^./\u&/')
    elif [[ "$dirname" =~ components/features ]]; then
        layer="features"
        component_name=$(echo $filename | sed 's/^./\u&/')
    elif [[ "$dirname" =~ components/pages ]]; then
        layer="pages"
        component_name=$(echo $filename | sed 's/^./\u&/')
    elif [[ "$dirname" =~ components/layout ]]; then
        layer="layout"
        component_name=$(echo $filename | sed 's/^./\u&/')
    fi
    
    # Create metadata header
    local metadata="/**
 * @fileoverview $(echo $component_name | sed 's/-/ /g') component styles
 * @component $component_name
 * @layer $layer
 */

"
    
    # Read current content
    local content=$(cat "$file")
    
    # Write metadata + content
    echo "$metadata$content" > "$file"
    
    echo "✅ Added metadata to: $file"
    echo "   Component: $component_name"
    echo "   Layer: $layer"
}

# Process files based on command
case "$1" in
    "--all")
        echo "=== Adding metadata to all React/TS files ==="
        
        # TypeScript React components
        find ./frontend/src -name "*.tsx" | while read file; do
            add_metadata_to_tsx "$file"
        done
        
        # TypeScript files
        find ./frontend/src -name "*.ts" -not -name "*.tsx" | while read file; do
            add_metadata_to_ts "$file"
        done
        
        # CSS files
        find ./frontend/src -name "*.css" | while read file; do
            add_metadata_to_css "$file"
        done
        ;;
        
    "--components")
        echo "=== Adding metadata to React components ==="
        find ./frontend/src/components -name "*.tsx" | while read file; do
            add_metadata_to_tsx "$file"
        done
        ;;
        
    "--hooks")
        echo "=== Adding metadata to hooks ==="
        find ./frontend/src/hooks -name "*.ts" -o -name "*.tsx" | while read file; do
            if [[ "$file" =~ \.tsx$ ]]; then
                add_metadata_to_tsx "$file"
            else
                add_metadata_to_ts "$file"
            fi
        done
        ;;
        
    "--services")
        echo "=== Adding metadata to services ==="
        find ./frontend/src/services -name "*.ts" -o -name "*.tsx" | while read file; do
            if [[ "$file" =~ \.tsx$ ]]; then
                add_metadata_to_tsx "$file"
            else
                add_metadata_to_ts "$file"
            fi
        done
        ;;
        
    "--single")
        if [ -z "$2" ]; then
            echo "Error: Please provide a file path"
            exit 1
        fi
        
        file="$2"
        if [[ "$file" =~ \.tsx$ ]]; then
            add_metadata_to_tsx "$file"
        elif [[ "$file" =~ \.ts$ ]]; then
            add_metadata_to_ts "$file"
        elif [[ "$file" =~ \.css$ ]]; then
            add_metadata_to_css "$file"
        else
            echo "Unsupported file type: $file"
        fi
        ;;
        
    *)
        echo "Usage: $0 [--all|--components|--hooks|--services|--single <file>]"
        echo ""
        echo "Add universal metadata to React/TypeScript files"
        echo ""
        echo "Options:"
        echo "  --all         Process all React/TS files"
        echo "  --components  Process only React components"
        echo "  --hooks       Process only custom hooks"
        echo "  --services    Process only service files"
        echo "  --single FILE Process a single file"
        echo ""
        echo "Supported file types:"
        echo "  - *.tsx (React components)"
        echo "  - *.ts (TypeScript files)"
        echo "  - *.css (Component styles)"
        ;;
esac

echo ""
echo "React/TypeScript metadata addition complete!"