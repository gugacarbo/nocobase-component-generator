import { bundlerConfig } from "./bundler-config";
import { serverConfig } from "./server-config";
import { AppConfig } from "./types";

export const APP_CONFIG: AppConfig = {
	loggerVerbose: false,
	componentsPath: "components",
	supportedExtensions: [".tsx" /*".jsx"*/],
	bundler: bundlerConfig,
	server: serverConfig,
};
