import { Request, Response } from "express";
import { PrismaClient, Users } from "@prisma/client";
import { getVietnamTime } from "../utils/method";
import { getUserIdFromToken } from "../utils/jwtToken";

const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * tags:
 *   - name: Users
 *     description: Các API liên quan đến người dùng
 *
 * /api/users:
 *   get:
 *     summary: Lấy danh sách người dùng
 *     description: API này trả về danh sách người dùng mà không bao gồm các thông tin nhạy cảm như mật khẩu.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: token
 *         required: true
 *         description: accessToken
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: lấy danh sách người dùng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           user_id:
 *                             type: integer
 *                             example: 1
 *                           username:
 *                             type: string
 *                             example: John Doe
 *                           email:
 *                             type: string
 *                             example: johndoe@example.com
 *                           phone_number:
 *                             type: string
 *                             example: 0987654321
 *                           address:
 *                             type: string
 *                             example: 123 Main St, City, State, Zip Code
 *                           role:
 *                             type: string
 *                             example: "user"
 *                           avatar_url:
 *                             type: string
 *                             example: "https://example.com/avatar.jpg"
 *                           is_email_verified:
 *                             type: boolean
 *                             example: true
 *                     statusCode:
 *                       type: number
 *                       example: 200
 *                     dateTime:
 *                       type: string
 *                       format: date-time
 *                       example: "2022-01-01T12:00:00Z"
 *       401:
 *         description: Unauthorized
 */
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

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * tags:
 *   - name: Users
 *     description: Các API liên quan đến người dùng
 *
 * /api/users/profile:
 *   get:
 *     summary: Lấy thông tin người dùng đang đăng nhập
 *     description: API này trả về thông tin của người dùng đang đăng nhập thông qua accessToken
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: token
 *         required: true
 *         description: accessToken
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lấy thông tin người dùng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           user_id:
 *                             type: integer
 *                             example: 1
 *                           username:
 *                             type: string
 *                             example: John Doe
 *                           email:
 *                             type: string
 *                             example: johndoe@example.com
 *                           phone_number:
 *                             type: string
 *                             example: 0987654321
 *                           address:
 *                             type: string
 *                             example: 123 Main St, City, State, Zip Code
 *                           role:
 *                             type: string
 *                             example: "user"
 *                           avatar_url:
 *                             type: string
 *                             example: "https://example.com/avatar.jpg"
 *                           is_email_verified:
 *                             type: boolean
 *                             example: true
 *                     statusCode:
 *                       type: number
 *                       example: 200
 *                     dateTime:
 *                       type: string
 *                       format: date-time
 *                       example: "2022-01-01T12:00:00Z"
 *       400:
 *         description: Lấy thông tin người dùng không thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Lấy thông tin người dùng không thành công"
 *                 statusCode:
 *                   type: number
 *                   example: 400
 *                 dateTime:
 *                   type: string
 *                   format: date-time
 *                   example: "2022-01-01T12:00:00Z"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Unauthorized"
 *                 statusCode:
 *                   type: number
 *                   example: 401
 *                 dateTime:
 *                   type: string
 *                   format: date-time
 *                   example: "2022-01-01T12:00:00Z"
 */
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

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * tags:
 *   - name: Users
 *     description: Các API liên quan đến người dùng
 *
 * /api/users/profile:
 *   put:
 *     summary: Cập nhật thông tin người dùng đang đăng nhập
 *     description: API này dùng để cập nhật thông tin người dùng đang đăng nhập thông qua accessToken
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: token
 *         required: true
 *         description: accessToken
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Dữ liệu cập nhật
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "string"
 *               phone_number:
 *                 type: string
 *                 example: "0987654321"
 *               address:
 *                 type: string
 *                 example: "123 Main St, City, State, Zip Code"
 *     responses:
 *       200:
 *         description: Cập nhật thông tin thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Cập nhật thông tin thành công"
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 dateTime:
 *                   type: string
 *                   format: date-time
 *                   example: "2022-01-01T12:00:00Z"
 *       400:
 *         description: Cập nhật không thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Lấy thông tin người dùng không thành công"
 *                 statusCode:
 *                   type: number
 *                   example: 400
 *                 dateTime:
 *                   type: string
 *                   format: date-time
 *                   example: "2022-01-01T12:00:00Z"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Unauthorized"
 *                 statusCode:
 *                   type: number
 *                   example: 401
 *                 dateTime:
 *                   type: string
 *                   format: date-time
 *                   example: "2022-01-01T12:00:00Z"
 */
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
