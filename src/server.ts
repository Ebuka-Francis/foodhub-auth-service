import dotenv from "dotenv";
dotenv.config();

import app from "./App";
import { connectDB } from "../src/config/db";

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('FoodHub Auth Service is up and running!');
});

const start = async (): Promise<void> => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Auth service running on port ${PORT}`);
  });
};

start();