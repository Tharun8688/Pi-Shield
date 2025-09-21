import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();
const port = process.env.PORT || 3001;
const __dirname = path.resolve();

app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, "dist")));

import apiRoutes from './routes';

app.use(apiRoutes);

// Fallback for SPA routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});