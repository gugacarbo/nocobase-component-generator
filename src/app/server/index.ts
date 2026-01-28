import express from "express";
import { handleBundleRequest } from "./bundle-api";
import { Logger } from "@/common/Logger";
import { APP_CONFIG } from "@/config/config";

const app = express();

app.use(express.json());

app.post(APP_CONFIG.server.bundleApiEndpoint, async (req, res) => {
	const result = await handleBundleRequest(req.body);

	if (result.success) {
		res.json(result);
	} else {
		res.status(400).json(result);
	}
});

app.listen(APP_CONFIG.server.port, () => {
	Logger.start(`Bundle API server rodando na porta ${APP_CONFIG.server.port}`);
});
