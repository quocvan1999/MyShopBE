import { Request, Response } from "express";
import { PrismaClient, Users } from "@prisma/client";
import { getVietnamTime } from "../utils/method";

const prisma = new PrismaClient();

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  const data: Omit<Users, "password" | "created_at" | "updated_at">[] =
    await prisma.users.findMany({
      select: {
        user_id: true,
        username: true,
        email: true,
        phone_number: true,
        address: true,
        role: true,
        avatar_url: true,
      },
    });
  res
    .status(200)
    .json({ statusCode: 200, content: data, dateTime: getVietnamTime() });
};
