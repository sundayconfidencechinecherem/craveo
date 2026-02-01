// app/head.tsx
export default function Head() {
  return (
    <>
      {/* Basic Meta */}
      <title>Craveo – Discover & Share Delicious Food Creations</title>
      <meta name="description" content="Share and discover delicious food creations from chefs and food lovers around the world. Join the Craveo community today!" />
      <meta name="author" content="Confidence Chinecherem" />
      <meta name="keywords" content="Food, Recipes, Cooking, Culinary, Craveo, Chefs, Social media food App" />
      <meta name="theme-color" content="#FF6B35" />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
      <meta name="format-detection" content="telephone=no" />

      {/* PWA & Mobile Web App */}
      <meta name="application-name" content="Craveo" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Craveo" />
      <meta name="mobile-web-app-capable" content="yes" />

      {/* Icons */}
      <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
      <link rel="manifest" href="/manifest.json" />
      <link rel="shortcut icon" href="/favicon.ico" />

      {/* Open Graph / Social Sharing */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content="Craveo – Discover & Share Delicious Food Creations" />
      <meta property="og:description" content="Join the Craveo community to explore, share, and enjoy delicious recipes and food content from people around the world." />
      <meta property="og:url" content="https://craveo.com" />
      <meta property="og:image" content="/images/og-image.png" />
      <meta property="og:site_name" content="Craveo" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Craveo – Discover & Share Delicious Food Creations" />
      <meta name="twitter:description" content="Join the Craveo community to explore, share, and enjoy delicious recipes and food content from around the world." />
      <meta name="twitter:image" content="/images/og-image.png" />
      <meta name="twitter:site" content="@CraveoApp" />
      <meta name="twitter:creator" content="@scchinecherem" />
    </>
  );
}
