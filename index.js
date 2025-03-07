import cookieParser from "cookie-parser";
import cors from "cors";
import { connectToDb } from "./config/db.js";
import authRoutes from './routes/user.route.js'
import issueRoutes from './routes/issue.route.js'
import express from "express";

import dotenv from "dotenv";

dotenv.config()

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
