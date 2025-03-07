import dotenv from "dotenv";  // 1️⃣ Load environment variables first

dotenv.config();  // Ensure .env variables are available globally

import express from "express";  // 2️⃣ Import core modules next
import cors from "cors";  // 3️⃣ Middleware imports
import cookieParser from "cookie-parser";

import { connectToDb } from "./config/db.js";  // 4️⃣ Connect to database early
import authRoutes from "./routes/user.route.js";  // 5️⃣ Import route handlers
import issueRoutes from "./routes/issue.route.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000", 
    credentials: true, 
  })
);


// routes
app.use('/api/v1/users', authRoutes)
app.use('/api/v1/issues', issueRoutes)
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await connectToDb()
});
