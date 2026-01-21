#!/bin/bash

#######################################################
# Mermaid Diagrams to Images Converter
#
# This script converts all Mermaid diagrams to PNG and SVG
#
# Prerequisites:
#   npm install -g @mermaid-js/mermaid-cli
#
# Usage:
#   chmod +x convert-all.sh
#   ./convert-all.sh
#######################################################

echo "======================================"
echo "Mermaid Diagrams Converter"
echo "======================================"
echo ""

# Check if mmdc is installed
if ! command -v mmdc &> /dev/null; then
    echo "❌ Error: mermaid-cli (mmdc) is not installed"
    echo ""
    echo "Please install it first:"
    echo "  npm install -g @mermaid-js/mermaid-cli"
    echo ""
    echo "Or use Docker (no Node.js required):"
    echo "  docker pull minlag/mermaid-cli"
    echo ""
    exit 1
fi

# Create output directories
echo "📁 Creating output directories..."
mkdir -p output/png
mkdir -p output/svg
mkdir -p output/pdf
echo "✅ Directories created"
echo ""

# Counter
total=0
success=0
failed=0

# Convert each markdown file
for file in *.md; do
    # Skip README
    if [ "$file" == "README.md" ]; then
        continue
    fi

    total=$((total + 1))
    basename="${file%.md}"

    echo "📄 Processing: $file"

    # Convert to PNG
    if mmdc -i "$file" -o "output/png/${basename}.png" -b transparent 2>/dev/null; then
        echo "  ✅ PNG created: output/png/${basename}.png"
    else
        echo "  ❌ PNG conversion failed"
        failed=$((failed + 1))
    fi

    # Convert to SVG
    if mmdc -i "$file" -o "output/svg/${basename}.svg" -b transparent 2>/dev/null; then
        echo "  ✅ SVG created: output/svg/${basename}.svg"
    else
        echo "  ❌ SVG conversion failed"
        failed=$((failed + 1))
    fi

    # Convert to PDF (optional, comment out if not needed)
    # if mmdc -i "$file" -o "output/pdf/${basename}.pdf" 2>/dev/null; then
    #     echo "  ✅ PDF created: output/pdf/${basename}.pdf"
    # else
    #     echo "  ❌ PDF conversion failed"
    #     failed=$((failed + 1))
    # fi

    success=$((success + 1))
    echo ""
done

# Summary
echo "======================================"
echo "Conversion Complete!"
echo "======================================"
echo "Total files processed: $total"
echo "Successful conversions: $success"
if [ $failed -gt 0 ]; then
    echo "Failed conversions: $failed"
fi
echo ""
echo "Output directories:"
echo "  📁 PNG files: output/png/"
echo "  📁 SVG files: output/svg/"
echo ""
echo "You can now use these images in presentations,"
echo "documentation, or anywhere else!"
echo ""

# Optional: Open output folder
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo "Opening output folder..."
    open output/
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open output/ 2>/dev/null || echo "Output saved to: $(pwd)/output/"
else
    # Windows/Other
    echo "Output saved to: $(pwd)/output/"
fi
