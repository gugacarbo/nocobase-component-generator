import express from "express";
import {handleBundleRequest} from "./bundle-api";

const app = express();
const PORT = 3001;

app.use(express.json());

app.post("/api/bundle", async (req, res) => {
    const result = await handleBundleRequest(req.body);

    if (result.success) {
        res.json(result);
    } else {
        res.status(400).json(result);
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Bundle API server rodando na porta ${PORT}`);
});
