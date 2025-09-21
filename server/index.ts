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

// Serve the React build folder
app.use(express.static(path.join(__dirname, "../dist")));

import apiRoutes from './routes.js';
app.use(apiRoutes);

// Fallback for SPA (so React Router works)
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});