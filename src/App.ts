import express, { Application } from "express";
import cors from "cors";
import authRoutes from "./routes/Authroutes";

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "auth-service" });
});

export default app;