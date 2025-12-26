import { bundlerConfig } from "./bundler-config";
import { AppConfig } from "./types";

export const APP_CONFIG: AppConfig = {
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
};
