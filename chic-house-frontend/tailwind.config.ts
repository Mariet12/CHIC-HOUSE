import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ألوان مناسبة مع اللوجو (Beige & Soft Brown)
        brandSand: "#E9DDCF", // الدرجة الأدق المطابقة للصورة
        primary: {
          DEFAULT: "#3D2817", // Dark Brown للوجو (مطابق للصورة)
          light: "#5A3F2A",
          dark: "#2A1A0F",
        },
        secondary: {
          DEFAULT: "#E9DDCF", // مطابق للون المرسل
          light: "#EFE3D8", // أفتح بسيط
          dark: "#DCCDBE", // أغمق بسيط للتباين
        },
        accent: {
          DEFAULT: "#D4A574", // Warm Beige
        },
        background: {
          DEFAULT: "#E9DDCF", // الخلفية العامة
        },
        beige: {
          50: "#FAF5ED",
          100: "#EFE3D8",
          200: "#E9DDCF",
          300: "#DCCDBE",
          400: "#D4A574",
        },
      },
      fontFamily: {
        // خط مشابه للخط الموجود في الصورة (rounded, bold)
        brand: ["var(--font-brand)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

