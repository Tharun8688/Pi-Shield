import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 10000;

// Needed because `__dirname` is not available in ES modules by default
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, "../dist")));

// ✅ Fallback: regex works in Express 5
app.get(/.*/, (_, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});