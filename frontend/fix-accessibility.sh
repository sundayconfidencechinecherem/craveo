#!/bin/bash

echo "🔧 Fixing Accessibility Issues"
echo "============================="

# Find all image tags without alt text
echo "📸 Checking images without alt text..."

FILES_TO_FIX=$(grep -l "<img " src/app --include="*.tsx" --include="*.jsx" -r)

for file in $FILES_TO_FIX; do
  echo ""
  echo "📄 File: $file"
  echo "   Images found:"
  
  # Show lines with img tags
  grep -n "<img " "$file" | while read line; do
    if ! echo "$line" | grep -q "alt="; then
      echo "   ❌ Line $(echo $line | cut -d: -f1): Missing alt text"
      
      # Get the full line
      LINE_NUM=$(echo $line | cut -d: -f1)
      FULL_LINE=$(sed -n "${LINE_NUM}p" "$file")
      
      # Try to suggest alt text
      if echo "$FULL_LINE" | grep -q "src.*user\|avatar"; then
        echo "   💡 Suggested fix: Add alt='user avatar'"
      elif echo "$FULL_LINE" | grep -q "src.*food"; then
        echo "   💡 Suggested fix: Add alt='food image'"
      elif echo "$FULL_LINE" | grep -q "src.*logo"; then
        echo "   💡 Suggested fix: Add alt='logo'"
      else
        echo "   💡 Suggested fix: Add alt='image'"
      fi
    else
      echo "   ✅ Line $(echo $line | cut -d: -f1): Has alt text"
    fi
  done
done

echo ""
echo "🛠️ Quick fix command:"
echo "sed -i '' 's/<img src=\"\\([^\"]*\\)\" \\([^>]*\\)>/<img src=\"\\1\" alt=\"image\" \\2>/g' src/app/components/*.tsx"
