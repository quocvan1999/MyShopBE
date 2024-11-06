import { Request, Response } from "express";

export type ControllerType = (req: Request, res: Response) => Promise<void>;
