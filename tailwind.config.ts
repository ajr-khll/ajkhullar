import type { Config } from "tailwindcss";

// Tailwind is used minimally here — mainly for resets and a few utilities.
// The System 7 visual language is handled entirely in system7.css + variables.css.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
