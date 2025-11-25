import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/mongodb.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from the server directory
// dotenv.config({ path: path.join(__dirname, ".env") });
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;
connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true }));
// Serve static assets from the client's Vite build output (one level up)
app.use(express.static(path.join(__dirname, "client", "dist")));

// API Endpoints
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// Fallback to serve index.html for SPA routing
app.use((_, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
