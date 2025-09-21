import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
const app = express();
const PORT = process.env.PORT || 10000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Resolve client build output. Try common output locations and pick the first that exists.
const candidatePaths = [
  path.join(__dirname, "../client/dist"), // when client built into client/dist
  path.join(__dirname, "../dist/client/dist"), // when build output ends up under dist/client/dist
  path.join(__dirname, "../..", "client", "dist"), // alternate nested layout
  path.join(__dirname, "../../dist"), // fallback
];

let clientBuildPath = candidatePaths.find((p) => fs.existsSync(path.join(p, "index.html")));
if (!clientBuildPath) {
  clientBuildPath = path.join(__dirname, "../client/dist");
}

console.log(`Serving client from: ${clientBuildPath}`);

app.use(express.static(clientBuildPath));

// Use '/*' to avoid edge-cases with some path parsing implementations
// Serve index.html for any request not handled by static middleware.
// Using `app.use` without a path avoids path-to-regexp parsing issues in some environments.
app.use((req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
