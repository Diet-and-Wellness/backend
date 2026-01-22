import express from "express";
import cors from "cors";
import morgan from "morgan";

import routes from "./routes.js";
import errorHandler from "#middlewares/error.js";

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// Logging middleware
// app.use(morgan("dev"));
app.use(morgan("combined"));

// Routes setup
app.use("/api", routes);

// Error handling middleware
app.use(errorHandler);

export default app;
