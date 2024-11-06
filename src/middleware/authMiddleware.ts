import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwtToken";
import dotenv from "dotenv";

dotenv.config();

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.token as string | undefined;

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
  }

  if (token && process.env.SECRET_KEY) {
    const isTokenValid = verifyToken(token, process.env.SECRET_KEY);

    if (isTokenValid) {
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  }
};
