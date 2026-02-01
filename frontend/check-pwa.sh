#!/bin/bash

echo "🔍 PWA Implementation Check"
echo "=========================="

# Check package.json
echo -n "📦 next-pwa installed: "
if npm list next-pwa > /dev/null 2>&1; then
  echo "✅"
else
  echo "❌"
fi

# Check manifest.json
echo -n "📄 manifest.json exists: "
if [ -f "public/manifest.json" ]; then
  echo "✅"
  echo "   Content:"
  cat public/manifest.json | python3 -m json.tool | head -20
else
  echo "❌"
fi

# Check next.config.js
echo -n "⚙️  next.config.js PWA config: "
if grep -q "next-pwa\|withPWA" next.config.js 2>/dev/null; then
  echo "✅"
  grep -A5 -B5 "next-pwa\|withPWA" next.config.js
else
  echo "❌"
fi

# Check layout.tsx for PWA tags
echo -n "🏷️  Layout PWA meta tags: "
if grep -q "manifest\|theme-color" src/app/layout.tsx 2>/dev/null; then
  echo "✅"
  grep -n "manifest\|theme-color" src/app/layout.tsx
else
  echo "❌"
fi

# Check for service worker
echo -n "🛠️  Service worker file: "
if [ -f "public/sw.js" ] || [ -f "public/service-worker.js" ]; then
  echo "✅"
else
  echo "❌"
fi

# Check if using Next.js Image component
echo -n "🖼️  Next.js Image component usage: "
if grep -r "next/image" src/app/components --include="*.tsx" --include="*.jsx" > /dev/null 2>&1; then
  echo "✅ (Found in components)"
else
  echo "❌ (Using regular img tags)"
  echo "   Current img tags found:"
  grep -r "<img " src/app/components --include="*.tsx" --include="*.jsx" | head -5
fi

# Check accessibility
echo -n "♿ Accessibility (alt attributes): "
IMG_COUNT=$(grep -r "<img " src/app/components --include="*.tsx" --include="*.jsx" | wc -l)
ALT_COUNT=$(grep -r "alt=" src/app/components --include="*.tsx" --include="*.jsx" | wc -l)
if [ "$IMG_COUNT" -eq "$ALT_COUNT" ] && [ "$IMG_COUNT" -gt 0 ]; then
  echo "✅ All $IMG_COUNT images have alt text"
else
  echo "⚠️  $ALT_COUNT/$IMG_COUNT images have alt text"
fi

echo ""
echo "📊 SUMMARY:"
echo "----------"
echo "Run these to see detailed status:"
echo "1. Check Lighthouse PWA score: npm run build && npx lighthouse http://localhost:3000 --view --only-categories=pwa"
echo "2. Check PWA installability: Open DevTools → Application → Manifest"
echo "3. Check service worker: DevTools → Application → Service Workers"
