import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import projectRoutes from "./routes/project.route";

dotenv.config();
connectDB();
const app = express();
app.use(express.json());
// Routes
app.use("/api/projects", projectRoutes);
// app.use("/api/auth", );
export default app;
