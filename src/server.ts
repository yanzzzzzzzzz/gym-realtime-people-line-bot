import "dotenv/config";
import express from "express";
import cors from "cors";
import { setupRoutes } from "./routes.js";

const app = express();
app.use(cors());
app.use(express.json());

setupRoutes(app);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
