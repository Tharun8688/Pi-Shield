import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 10000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Point to client build output
const clientBuildPath = path.join(__dirname, "../client/dist");

console.log(`Serving client from: ${clientBuildPath}`);

app.use(express.static(clientBuildPath));

// Use '/*' to avoid edge-cases with some path parsing implementations
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
