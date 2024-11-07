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

export const getUsersSearchPagination = async (
  req: Request,
  res: Response
): Promise<void> => {
  const query = req.query.query as string | undefined;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  // Tính toán số bản ghi bỏ qua dựa trên page và limit
  const skip = (page - 1) * limit;

  // Sử dụng Prisma để tìm kiếm với điều kiện và phân trang
  const users: Omit<Users, "password" | "created_at" | "updated_at">[] =
    await prisma.users.findMany({
      where: {
        OR: [
          {
            username: {
              contains: query,
              startsWith: query,
              endsWith: query,
            },
          },
          { email: { contains: query } },
          { phone_number: { contains: query } },
          { address: { contains: query, startsWith: query, endsWith: query } },
        ],
      },
      skip: skip,
      take: limit,
      orderBy: {
        created_at: "desc",
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

  // Đếm tổng số bản ghi phù hợp với điều kiện tìm kiếm
  const totalCount = await prisma.users.count({
    where: {
      OR: [
        {
          username: {
            contains: query,
            startsWith: query,
            endsWith: query,
          },
        },
        { email: { contains: query } },
        { phone_number: { contains: query } },
        { address: { contains: query, startsWith: query, endsWith: query } },
      ],
    },
  });

  // Tính toán tổng số trang
  const totalPages = Math.ceil(totalCount / limit);

  res.status(200).json({
    content: {
      data: users,
      query: query,
      pagination: {
        totalItems: totalCount,
        totalPages: totalPages,
        currentPage: page,
        itemsPerPage: limit,
      },
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
