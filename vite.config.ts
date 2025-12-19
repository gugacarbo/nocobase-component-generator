import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@components": path.resolve(__dirname, "./src/components"),
			"@utils": path.resolve(__dirname, "./src/utils"),
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
