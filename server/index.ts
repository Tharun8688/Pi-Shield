import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to Pi-Shield 🚀");
});

import apiRoutes from './routes';

app.use(apiRoutes);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});