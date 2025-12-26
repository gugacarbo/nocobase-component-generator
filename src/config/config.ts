import { bundlerConfig } from "./bundler-config";
import { AppConfig } from "./types";

export const APP_CONFIG: AppConfig = {
	loggerVerbose: true,
	componentsPath: "components",
	supportedExtensions: [
		".tsx",
		//  ".jsx"
	],

	// Endpoint da API para bundle
	bundler: bundlerConfig,
	server: {
		host: "localhost",
		bundleApiEndpoint: "/api/bundle",
		port: 3001,
	},
	aliases: {
		"@/*": ["./src/*"],
		"@app/*": ["./src/app/*"],
		"@bundler/*": ["./src/bundler/*"],
		"@nocobase/*": ["./src/nocobase/*"],
		"@components/*": ["./components/*"],
		"@utils/*": ["components/utils/*"],
		"@common/*": ["./src/common/*"],
	},
};
