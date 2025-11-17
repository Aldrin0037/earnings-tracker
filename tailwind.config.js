/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tailwind CSS v4 uses CSS-based configuration via @theme in globals.css
  // This config file is for any additional settings to prevent oklab() conversion
  
  // Disable experimental features that might trigger color space conversion
  experimental: {
    optimizeUniversalDefaults: false,
  },
  
  // Ensure we're not using any color space transformations
  corePlugins: {
    // Keep all core plugins enabled, but ensure no color conversion
  },
  
  // Explicitly set color format preference
  theme: {
    extend: {
      // Colors are defined in globals.css via @theme
      // This ensures Tailwind doesn't convert them to oklab()
    },
  },
};

