import { Request, Response } from "express";
import { PrismaClient, Users } from "@prisma/client";
import { getVietnamTime } from "../utils/method";
import { getUserIdFromToken } from "../utils/jwtToken";

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
        is_email_verified: true,
      },
    });
  res.status(200).json({
    content: {
      data: data,
    },
    statusCode: 200,
    dateTime: getVietnamTime(),
  });
};

export const getProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const token = req.headers.token as string | undefined;

  if (!token) {
    res.status(401).json({
      content: { message: "Unauthorized" },
      statusCode: 401,
      dateTime: getVietnamTime(),
    });
  }

  if (token && process.env.SECRET_KEY) {
    const decoded: { user_id: number; email: string } | boolean =
      getUserIdFromToken(token, process.env.SECRET_KEY);

    if (typeof decoded === "object") {
      const { user_id } = decoded;

      const checkUser: Omit<
        Users,
        "password" | "created_at" | "updated_at"
      > | null = await prisma.users.findUnique({
        where: {
          user_id: user_id,
        },
        select: {
          user_id: true,
          username: true,
          email: true,
          phone_number: true,
          address: true,
          role: true,
          avatar_url: true,
          is_email_verified: true,
        },
      });

      if (!checkUser || checkUser === null) {
        res.status(400).json({
          content: {
            message: "Lấy thông tin người dùng không thành công",
          },
          statusCode: 400,
          dateTime: getVietnamTime(),
        });
        return;
      }

      res.status(200).json({
        content: {
          data: checkUser,
        },
        statusCode: 200,
        dateTime: getVietnamTime(),
      });
      return;
    }

    res.status(400).json({
      content: {
        message: "Lấy thông tin người dùng không thành công",
      },
      statusCode: 400,
      dateTime: getVietnamTime(),
    });
  }
};

export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const token = req.headers.token as string | undefined;
  const { username, phone_number, address } = req.body;

  if (!token) {
    res.status(401).json({
      content: { message: "Unauthorized" },
      statusCode: 401,
      dateTime: getVietnamTime(),
    });
  }

  if (token && process.env.SECRET_KEY) {
    const decoded: { user_id: number; email: string } | boolean =
      getUserIdFromToken(token, process.env.SECRET_KEY);

    if (typeof decoded === "object") {
      const { user_id } = decoded;

      await prisma.users.update({
        where: {
          user_id: user_id,
        },
        data: {
          username: username,
          phone_number: phone_number,
          address: address,
        },
      });

      res.status(200).json({
        content: {
          message: "Cập nhật thông tin thành công",
        },
        statusCode: 200,
        dateTime: getVietnamTime(),
      });
      return;
    }

    res.status(400).json({
      content: {
        message: "Lấy thông tin người dùng không thành công",
      },
      statusCode: 400,
      dateTime: getVietnamTime(),
    });
  }
};
