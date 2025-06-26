/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                inter: ["Inter", "sans-serif"],
                poppins: ["Poppins", "sans-serif"],
            },
            colors: {
                primary: {
                    DEFAULT: '#4F8CFF',
                    light: '#A7C7FF',
                    dark: '#2563EB',
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                },
                accent: {
                    DEFAULT: '#A78BFA',
                    light: '#DDD6FE',
                },
                success: {
                    DEFAULT: '#34D399',
                    light: '#6EE7B7',
                },
                gray: {
                    50: '#F9FAFB',
                    100: '#F3F4F6',
                    200: '#E5E7EB',
                    300: '#D1D5DB',
                    400: '#9CA3AF',
                    500: '#6B7280',
                    600: '#4B5563',
                    700: '#374151',
                    800: '#1F2937',
                    900: '#111827',
                },
            },
            borderRadius: {
                xl: '1.25rem',
                '2xl': '2rem',
            },
            boxShadow: {
                glass: '0 4px 32px 0 rgba(31, 38, 135, 0.08)',
            },
        },
    },
    plugins: [],
} 