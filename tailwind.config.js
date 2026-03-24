/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // 固定カラー（テーマ非依存）
        accent: "#00D4A1",
        "accent-dark": "#00B88A",
        danger: "#F0425C",
        amber: "#F5A623",
        purple: "#8B6FC0",
        info: "#4A9EFF",
        // テーマ依存カラー
        bg: { light: "#F6F5F1", dark: "#06060C" },
        surface: { light: "#FFFFFF", dark: "#0E0E18" },
        "surface-2": { light: "#F0EFEB", dark: "#161624" },
        "surface-3": { light: "#E6E5E1", dark: "#1E1E30" },
        "t-text": { light: "#0C0C14", dark: "#EEEDF6" },
        "t-sub": { light: "#6E6E80", dark: "#8887A0" },
        "t-muted": { light: "#A0A0B0", dark: "#4A4962" },
      },
      borderRadius: {
        pill: "9999px",
      },
    },
  },
  plugins: [],
};
