import cookieParser from "cookie-parser";
import express, { NextFunction, Request, Response } from "express";
import { swaggerUi, swaggerSpec } from "./config/swaggerConfig";
import cors from "cors";

import rootRoutes from "./routes/rootRoutes";
import { CustomErrorType } from "./types/customError.type";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(cookieParser());

app.use(express.json());

app.use("/swagger/api", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api", rootRoutes);

app.use(
  (err: CustomErrorType, req: Request, res: Response, next: NextFunction) => {
    res.status(err.statusCode || 500).json({
      message: err.message || "Internal Server Error",
    });
  }
);

app.listen(8080, () => {
  console.log("BE starting with port 8080");
});
