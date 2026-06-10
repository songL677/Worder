import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif"
        ],
        mono: [
          "JetBrains Mono",
          "SFMono-Regular",
          "Consolas",
          "Liberation Mono",
          "monospace"
        ]
      },
      colors: {
        ink: "#1f2933",
        paper: "#fbfbf8",
        line: "#d8ddd4",
        sage: "#6b7f63",
        clay: "#a45d45",
        steel: "#52687a"
      }
    }
  },
  plugins: [require("@tailwindcss/typography")]
};

export default config;
