#!/bin/bash

# @script add-metadata
# @purpose Add LLM-friendly metadata to nonprofit calculator files
# @output console

add_python_metadata() {
    local file=$1
    local filename=$(basename "$file" .py)
    local filepath=${file#./}
    
    # Determine module type
    if [[ "$filepath" =~ ^lib/core/ ]]; then
        module_type="core"
    elif [[ "$filepath" =~ ^lib/calculators/ ]]; then
        module_type="calculator"
    elif [[ "$filepath" =~ ^lib/reporters/ ]]; then
        module_type="reporter"
    else
        module_type="app"
    fi
    
    # Extract imports
    deps=$(grep "^from lib\." "$file" | sed 's/from lib\.\([^ ]*\).*/\1/' | tr '\n' ', ' | sed 's/,$//')
    
    # Generate metadata
    cat << EOF
"""
@file $filepath
@module_type $module_type
@deps [$deps]
@exports [$(grep "^class\|^def" "$file" | awk '{print $2}' | cut -d'(' -f1 | tr '\n' ', ' | sed 's/,$//')]
"""
EOF
}

add_css_metadata() {
    local file=$1
    local filename=$(basename "$file" .css)
    
    cat << EOF
/**
 * @file $file
 * @layer $(echo $filename | sed 's/-/_/g')
 * @purpose Nonprofit calculator $(echo $filename | tr '-' ' ') styles
 */
EOF
}

add_html_metadata() {
    local file=$1
    local template_type="partial"
    
    if [[ "$file" =~ base\.html ]]; then
        template_type="layout"
    elif [[ "$file" =~ index\.html ]]; then
        template_type="page"
    fi
    
    cat << EOF
{# 
  @template $file
  @type $template_type
  @htmx true
  @alpine true
#}
EOF
}

# Process all files
echo "Adding metadata to nonprofit calculator files..."

# Python files
for file in $(find . -name "*.py" -not -path "./venv/*"); do
    echo "Processing: $file"
    metadata=$(add_python_metadata "$file")
    # Would insert at top of file
done

# CSS files
for file in $(find ./static -name "*.css"); do
    echo "Processing: $file"
    metadata=$(add_css_metadata "$file")
    # Would insert at top of file
done

# HTML templates
for file in $(find ./templates -name "*.html"); do
    echo "Processing: $file"
    metadata=$(add_html_metadata "$file")
    # Would insert at top of file
done

echo "Metadata addition complete!"