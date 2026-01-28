/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#020202",
                architect: "#2563eb", // Blue-600
                hardware: "#dc2626", // Red-600
                energy: "#eab308",    // Yellow-500
            },
        },
    },
    plugins: [],
}