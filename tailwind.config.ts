import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1A1210",
          50: "#F7F3EE",
          100: "#EDE6DC",
          200: "#D4C6B6",
          300: "#B39A82",
          400: "#8C6E57",
          500: "#6B4E3D",
          600: "#4A3429",
          700: "#2E201A",
          800: "#1A1210",
          900: "#120C0B",
        },
        ajrak: {
          DEFAULT: "#8B1E3F",
          50: "#FBECEE",
          100: "#F4D0D6",
          200: "#E5A0AD",
          300: "#CC6A7E",
          400: "#B03A56",
          500: "#8B1E3F",
          600: "#6F1732",
          700: "#521226",
          800: "#380C1A",
          900: "#220810",
        },
        gold: {
          DEFAULT: "#C4A35A",
          50: "#FBF6EA",
          100: "#F3E6C8",
          200: "#E6CC91",
          300: "#D4B86A",
          400: "#C4A35A",
          500: "#A8863E",
          600: "#86682E",
          700: "#624B22",
          800: "#423217",
          900: "#2A1F0E",
        },
        cream: {
          DEFAULT: "#F7F1E6",
          50: "#FDFAF5",
          100: "#F7F1E6",
          200: "#EDE3D0",
          300: "#E0D0B4",
        },
        sand: "#E8DCC8",
        sage: "#6E7F62",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        sindhi: ["var(--font-sindhi)", "serif"],
      },
      boxShadow: {
        soft: "0 10px 40px -18px rgba(26, 18, 16, 0.35)",
        gold: "0 8px 30px -12px rgba(196, 163, 90, 0.45)",
      },
      backgroundImage: {
        "ajrak-fade":
          "linear-gradient(180deg, rgba(34,8,16,0.92) 0%, rgba(26,18,16,0.96) 100%)",
      },
      maxWidth: {
        page: "80rem",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
