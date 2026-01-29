import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

export default mergeConfig(
	viteConfig,
	defineConfig({
		test: {
			globals: true,
			environment: "node",
			include: ["src/**/*.{test,spec}.{ts,tsx}"],
			exclude: ["node_modules", "dist", "output"],
			coverage: {
				provider: "v8",
				reporter: ["text", "html", "lcov"],
				include: ["src/bundler/**/*.ts"],
				exclude: [
					"src/bundler/__tests__/**",
					"src/bundler/index.ts",
					"**/*.d.ts",
				],
			},
			testTimeout: 10000,
			setupFiles: ["./src/bundler/__tests__/setup.ts"],
		},
	}),
);
