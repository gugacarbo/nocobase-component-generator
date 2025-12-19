import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			"/api": {
				target: "http://localhost:3001",
				changeOrigin: true
			}
		}
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@bundler": path.resolve(__dirname, "./src/bundler"),
			"@builder": path.resolve(__dirname, "./src/component-builder"),
			"@components": path.resolve(
				__dirname,
				"./src/component-builder/components",
			),
			"@src-components": path.resolve(__dirname, "./src/components"),
			"@utils": path.resolve(__dirname, "./src/component-builder/utils"),
		},
	},
	build: {
		lib: {
			entry: path.resolve(__dirname, "src/bundler.ts"),
			name: "NocoBaseBundler",
			fileName: "bundler",
			formats: ["es"],
		},
		rollupOptions: {
			external: ["fs", "path", "esbuild", "typescript", "prettier"],
		},
	},
});
