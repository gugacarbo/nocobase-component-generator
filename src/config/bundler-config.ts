import { BundlerConfig } from "./types";

export const bundlerConfig: BundlerConfig = {
	exportTypescript: false,

	LIBRARY_MAPPINGS: {
		react: "React",
		"react-dom": "ReactDOM",
		antd: "antd",
		"@ant-design/icons": "antdIcons",
		"@formily/core": "formily",
		"@formily/react": "formily",
		"@nocobase/client": "nocobase",
		dayjs: "dayjs",
		lodash: "lodash",
	},
	EXCLUDED_FILES: ["main.tsx", "App.tsx", "index.ts"],
	EXCLUDED_DIRS: ["node_modules", "output", "bundler", "dist", "build", ".git"],
	IGNORED_MODULES: [],
	FILE_EXTENSIONS: /\.(tsx?|jsx?)$/,
	IMPORT_EXTENSIONS: [
		".tsx",
		".ts",
		// ".jsx", ".js"
	],

	PRETTIER_CONFIG: {
		parser: "typescript",
		semi: true,
		singleQuote: false,
		tabWidth: 4,
		useTabs: false,
		trailingComma: "es5",
		bracketSpacing: true,
		arrowParens: "avoid",
		printWidth: 80,
		endOfLine: "lf",
		jsxBracketSameLine: false,
	},
	OUTPUT_EXTENSION: ".jsx",
	TEMP_FILE_NAME: "temp.tsx",
	MOCK_TEST_PATTERN: /\.(mock|test|spec)\.(tsx?|jsx?)$/,
	BUNDLE_ONLY_PATTERN: /^\s*\/\/bundle-only:\s*(.+)$/,
	NO_BUNDLE_PATTERN: /(^|[^:])\/\/.*\bno-bundle\b/,
};
