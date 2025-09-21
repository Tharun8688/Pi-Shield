import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 8080; // Railway provides PORT

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve React static files
app.use(express.static(path.join(__dirname, "../dist")));

// ✅ Fallback route (Express 5 compatible)
app.get(/.*/, (_, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});