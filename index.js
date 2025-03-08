import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import { connectToDb } from "./config/db.js";
import authRoutes from "./routes/user.route.js";
import issueRoutes from "./routes/issue.route.js";

// Load environment variables first
dotenv.config();

// Create an Express application
const app = express();

// Middleware configuration
const middleware = [
  express.json(),
  cookieParser(),
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
];

app.use(middleware);

// Routes configuration
const routes = [
  { path: "/api/v1/users", handler: authRoutes },
  { path: "/api/v1/issues", handler: issueRoutes },
];

routes.forEach((route) => app.use(route.path, route.handler));

// Port configuration
const PORT = process.env.PORT || 5000;

// Server startup
const startServer = async () => {
  try {
    console.log(`Connecting to the database...`);
    await connectToDb(); // Ensure DB is connected first
    console.log(`Server is running on port ${PORT}`);

    app.listen(PORT);
  } catch (error) {
    console.error("Error starting the server:", error);
  }
};

// Start the server
startServer();
