import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		proxy: {
			"/api": {
				target: "http://localhost:3001",
				changeOrigin: true,
			},
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@app": path.resolve(__dirname, "./src/app"),
			"@bundler": path.resolve(__dirname, "./src/bundler"),
			"@nocobase": path.resolve(__dirname, "./src/nocobase"),
			"@components": path.resolve(__dirname, "./components"),
			"@utils": path.resolve(__dirname, "./components/utils"),
			"@common": path.resolve(__dirname, "./src/common"),
		},
	},
	build: {
		rollupOptions: {
			external: ["fs", "path", "esbuild", "typescript", "prettier"],
		},
	},
});
