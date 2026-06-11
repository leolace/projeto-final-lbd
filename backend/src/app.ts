import cors from "cors";
import express from "express";
import { pingDatabase } from "./db/service.js";
import { errorHandler } from "./middleware/error-handler.js";
import { authRouter } from "./routes/auth-router.js";
import { dashboardRouter } from "./routes/dashboard-router.js";
import { reportsRouter } from "./routes/reports-router.js";
import { seasonsRouter } from "./routes/seasons-router.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.get("/db/ping", async (_request, response, next) => {
  try {
    const database = await pingDatabase();

    response.json({
      ok: true,
      database
    });
  } catch (error) {
    next(error);
  }
});

app.use("/auth", authRouter);
app.use("/dashboard", dashboardRouter);
app.use("/reports", reportsRouter);
app.use("/seasons", seasonsRouter);

app.use(errorHandler);
