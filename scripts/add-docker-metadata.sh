#!/bin/bash

# @script add-docker-metadata
# @purpose Add universal metadata to Docker and containerization files
# @output console
# @layer infrastructure
# @deps [grammar-ops/scripts/add-js-metadata.sh]

add_metadata_to_dockerfile() {
    local file=$1
    local file_rel=${file#./}
    local filename=$(basename "$file")
    local dirname=$(dirname "$file")
    
    # Skip if already has metadata
    if head -10 "$file" | grep -q "@dockerfile" 2>/dev/null; then
        echo "✓ Already has metadata: $file"
        return
    fi
    
    # Determine service type and purpose
    local service_type="unknown"
    local purpose="[TODO: Add purpose]"
    local base_image=""
    local exposed_ports=""
    local llm_write="suggest-only"
    local llm_role="infrastructure"
    
    # Extract base image
    base_image=$(grep "^FROM" "$file" | head -1 | awk '{print $2}' | cut -d':' -f1)
    
    # Extract exposed ports
    exposed_ports=$(grep "^EXPOSE" "$file" | awk '{print $2}' | tr '\n' ', ' | sed 's/,$//')
    
    # Determine service type based on filename and location
    if [[ "$file" =~ Dockerfile\.backend ]]; then
        service_type="backend"
        purpose="Backend API service container"
        llm_write="read-only"
    elif [[ "$file" =~ Dockerfile\.dev ]]; then
        service_type="development"
        purpose="Development environment container with hot reload"
        llm_write="full-edit"
    elif [[ "$dirname" =~ frontend ]] && [[ "$filename" == "Dockerfile" ]]; then
        service_type="frontend"
        purpose="Frontend application container with Nginx"
        llm_write="read-only"
    elif [[ "$filename" == "Dockerfile" ]]; then
        service_type="application"
        purpose="Main application container"
    fi
    
    # Create metadata header
    local metadata="# @dockerfile $file_rel
# @purpose $purpose
# @service_type $service_type
# @base_image $base_image
# @exposed_ports [$exposed_ports]
# @layer infrastructure
# @llm-read true
# @llm-write $llm_write
# @llm-role $llm_role

"
    
    # Read current content
    local content=$(cat "$file")
    
    # Write metadata + content
    echo "$metadata$content" > "$file"
    
    echo "✅ Added metadata to: $file"
    echo "   Service: $service_type"
    echo "   Base: $base_image"
    echo "   Ports: [$exposed_ports]"
}

add_metadata_to_docker_compose() {
    local file=$1
    local file_rel=${file#./}
    local filename=$(basename "$file")
    
    # Skip if already has metadata
    if head -10 "$file" | grep -q "@docker-compose" 2>/dev/null; then
        echo "✓ Already has metadata: $file"
        return
    fi
    
    # Determine compose type
    local compose_type="production"
    local purpose="Multi-service container orchestration"
    local llm_write="suggest-only"
    
    if [[ "$filename" =~ dev ]]; then
        compose_type="development"
        purpose="Development environment with volume mounting and hot reload"
        llm_write="full-edit"
    elif [[ "$filename" =~ test ]]; then
        compose_type="testing"
        purpose="Testing environment configuration"
    fi
    
    # Extract services
    local services=$(grep "^  [a-zA-Z]" "$file" | grep -v "^  #" | sed 's/:$//' | tr '\n' ', ' | sed 's/,$//' | sed 's/,/, /g')
    
    # Extract networks
    local networks=$(sed -n '/^networks:/,/^[a-zA-Z]/p' "$file" | grep "^  [a-zA-Z]" | sed 's/:$//' | tr '\n' ', ' | sed 's/,$//' | sed 's/,/, /g')
    
    # Create metadata header
    local metadata="# @docker-compose $file_rel
# @purpose $purpose
# @compose_type $compose_type
# @services [$services]
# @networks [$networks]
# @layer infrastructure
# @llm-read true
# @llm-write $llm_write
# @llm-role orchestration

"
    
    # Read current content
    local content=$(cat "$file")
    
    # Write metadata + content
    echo "$metadata$content" > "$file"
    
    echo "✅ Added metadata to: $file"
    echo "   Type: $compose_type"
    echo "   Services: [$services]"
}

add_metadata_to_dockerignore() {
    local file=$1
    local file_rel=${file#./}
    local context_type="backend"
    
    if [[ "$file" =~ frontend ]]; then
        context_type="frontend"
    fi
    
    # Skip if already has metadata
    if head -5 "$file" | grep -q "@dockerignore" 2>/dev/null; then
        echo "✓ Already has metadata: $file"
        return
    fi
    
    local metadata="# @dockerignore $file_rel
# @purpose Exclude files from Docker build context for $context_type
# @context_type $context_type
# @layer infrastructure
# @llm-read true
# @llm-write full-edit
# @llm-role build-optimization

"
    
    # Read current content
    local content=$(cat "$file")
    
    # Write metadata + content
    echo "$metadata$content" > "$file"
    
    echo "✅ Added metadata to: $file"
    echo "   Context: $context_type"
}

add_metadata_to_nginx() {
    local file=$1
    local file_rel=${file#./}
    
    # Skip if already has metadata
    if head -5 "$file" | grep -q "@nginx" 2>/dev/null; then
        echo "✓ Already has metadata: $file"
        return
    fi
    
    local metadata="# @nginx $file_rel
# @purpose Nginx configuration for frontend proxy and static serving
# @proxy_target backend:5000
# @layer infrastructure
# @llm-read true
# @llm-write suggest-only
# @llm-role reverse-proxy

"
    
    # Read current content
    local content=$(cat "$file")
    
    # Write metadata + content
    echo "$metadata$content" > "$file"
    
    echo "✅ Added metadata to: $file"
}

# Process files based on command
case "$1" in
    "--all")
        echo "=== Adding metadata to all Docker files ==="
        
        # Dockerfiles
        find . -name "Dockerfile*" -not -path "./node_modules/*" | while read file; do
            add_metadata_to_dockerfile "$file"
        done
        
        # Docker Compose files
        find . -name "docker-compose*.yml" -o -name "docker-compose*.yaml" | while read file; do
            add_metadata_to_docker_compose "$file"
        done
        
        # .dockerignore files
        find . -name ".dockerignore" | while read file; do
            add_metadata_to_dockerignore "$file"
        done
        
        # Nginx configs
        find . -name "nginx.conf" -o -name "*.nginx" | while read file; do
            add_metadata_to_nginx "$file"
        done
        ;;
        
    "--dockerfiles")
        echo "=== Adding metadata to Dockerfiles ==="
        find . -name "Dockerfile*" -not -path "./node_modules/*" | while read file; do
            add_metadata_to_dockerfile "$file"
        done
        ;;
        
    "--compose")
        echo "=== Adding metadata to Docker Compose files ==="
        find . -name "docker-compose*.yml" -o -name "docker-compose*.yaml" | while read file; do
            add_metadata_to_docker_compose "$file"
        done
        ;;
        
    "--single")
        if [ -z "$2" ]; then
            echo "Error: Please provide a file path"
            exit 1
        fi
        
        file="$2"
        if [[ "$file" =~ Dockerfile ]]; then
            add_metadata_to_dockerfile "$file"
        elif [[ "$file" =~ docker-compose ]]; then
            add_metadata_to_docker_compose "$file"
        elif [[ "$file" =~ dockerignore ]]; then
            add_metadata_to_dockerignore "$file"
        elif [[ "$file" =~ nginx ]]; then
            add_metadata_to_nginx "$file"
        else
            echo "Unknown Docker file type: $file"
        fi
        ;;
        
    *)
        echo "Usage: $0 [--all|--dockerfiles|--compose|--single <file>]"
        echo ""
        echo "Add universal metadata to Docker and containerization files"
        echo ""
        echo "Options:"
        echo "  --all          Process all Docker files"
        echo "  --dockerfiles  Process only Dockerfile* files"
        echo "  --compose      Process only docker-compose files"
        echo "  --single FILE  Process a single file"
        echo ""
        echo "Supported file types:"
        echo "  - Dockerfile, Dockerfile.*, *.dockerfile"
        echo "  - docker-compose.yml, docker-compose.*.yml"
        echo "  - .dockerignore"
        echo "  - nginx.conf, *.nginx"
        ;;
esac

echo ""
echo "Docker metadata addition complete!"