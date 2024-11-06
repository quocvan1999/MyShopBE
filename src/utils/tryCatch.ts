import { NextFunction, Request, Response } from "express";
import { ControllerType } from "../types/controller.type";

export const tryCatch =
  (controller: ControllerType) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await controller(req, res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error(String(error)));
      }
    }
  };
