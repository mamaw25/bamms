import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Custom theme configuration if needed
    },
  },
  plugins: [],
  // Disable CSS variables that use lab() color function
  corePlugins: {
    // This prevents Tailwind from generating lab() color functions
  },
}

export default config
