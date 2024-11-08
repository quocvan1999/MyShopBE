import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { sendMail } from "../config/sendMail";
import { createToken, verifyToken } from "../utils/jwtToken";
import crypto from "crypto";
import { getVietnamTime, isExpiresAt } from "../utils/method";

const prisma = new PrismaClient();

/**
 * @swagger
 * tags:
 *   - name: AUTH
 *     description: Các API liên quan đến xác thực người dùng
 *
 * /api/auth/sinup:
 *   post:
 *     summary: Đăng ký tài khoản mới cho người dùng
 *     description: API này cho phép người dùng đăng ký tài khoản mới. Khi đăng ký thành công, một email xác nhận sẽ được gửi đến.
 *     tags:
 *       - AUTH
 *     requestBody:
 *       description: Thông tin đăng ký tài khoản
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "john_doe"
 *               password:
 *                 type: string
 *                 example: "P@ssw0rd"
 *               email:
 *                 type: string
 *                 example: "johndoe@example.com"
 *               phone_number:
 *                 type: string
 *                 example: "0987654321"
 *               address:
 *                 type: string
 *                 example: "123 Main St, City, State, Zip Code"
 *     responses:
 *       201:
 *         description: Đăng ký tài khoản thành công
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
 *                       example: "Đăng ký tài khoản thành công"
 *                     data:
 *                       type: object
 *                       properties:
 *                         user_id:
 *                           type: string
 *                           example: "12345"
 *                         username:
 *                           type: string
 *                           example: "john_doe"
 *                         email:
 *                           type: string
 *                           example: "johndoe@example.com"
 *                         phone_number:
 *                           type: string
 *                           example: "0987654321"
 *                         address:
 *                           type: string
 *                           example: "123 Main St, City, State, Zip Code"
 *                         role:
 *                           type: string
 *                           example: "user"
 *                         avatar_url:
 *                           type: string
 *                           example: "https://example.com/avatar.jpg"
 *                 statusCode:
 *                   type: number
 *                   example: 201
 *                 dateTime:
 *                   type: string
 *                   format: date-time
 *                   example: "2022-01-01T12:00:00Z"
 *       409:
 *         description: Email đã tồn tại
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
 *                       example: "Email đã tồn tại"
 *                 statusCode:
 *                   type: number
 *                   example: 409
 *                 dateTime:
 *                   type: string
 *                   format: date-time
 *                   example: "2022-01-01T12:00:00Z"
 */
export const sinup = async (req: Request, res: Response): Promise<void> => {
  const { username, password, email, phone_number, address } = req.body;

  const checkEmail = await prisma.users.findUnique({
    where: {
      email,
    },
  });

  if (checkEmail) {
    res.status(409).json({
      content: { message: "Email đã tồn tại" },
      statusCode: 409,
      dateTime: getVietnamTime(),
    });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const createUser = await prisma.users.create({
    data: {
      username,
      password: hashedPassword,
      email,
      phone_number: phone_number,
      address,
    },
  });

  const subject = "Đăng ký tài khoản thành công";
  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Đăng Ký Tài Khoản Thành Công</title>
<style>
  body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f5f5f5;
    color: #333;
  }
  .email-container {
    max-width: 600px;
    margin: 20px auto;
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
  }
  .email-header {
    background-color: #d32f2f;
    color: #ffffff;
    padding: 20px;
    text-align: center;
    font-size: 24px;
    font-weight: bold;
  }
  .email-body {
    padding: 20px;
    line-height: 1.6;
    color: #333333;
  }
  .email-footer {
    padding: 20px;
    text-align: center;
    font-size: 14px;
    color: #777777;
    border-top: 1px solid #e0e0e0;
  }
  .user-details {
    background-color: #ffebee;
    border: 1px solid #d32f2f;
    border-radius: 8px;
    padding: 15px;
    margin-top: 15px;
  }
  .user-details p {
    margin: 8px 0;
  }
  .set-password-button {
    display: inline-block;
    background-color: #d32f2f;
    color: #ffffff;
    text-decoration: none;
    padding: 12px 20px;
    margin-top: 20px;
    border-radius: 5px;
    font-size: 16px;
  }
</style>
</head>
<body>
<div class="email-container">
  <!-- Header -->
  <div class="email-header">
    Chào mừng đến với dịch vụ của chúng tôi!
  </div>
  <!-- Body -->
  <div class="email-body">
    <p>Xin chào <strong>${createUser.username}</strong>,</p>
    <p>Cảm ơn bạn đã đăng ký tài khoản với chúng tôi! Dưới đây là thông tin tài khoản của bạn:</p>
    <div class="user-details">
      <p><strong>Tên đăng nhập:</strong> ${createUser.username}</p>
      <p><strong>Email:</strong> ${createUser.email}</p>
      <p><strong>Số điện thoại:</strong> ${createUser.phone_number}</p>
      <p><strong>Địa chỉ:</strong> ${createUser.address}</p>
    </div>
    <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.</p>
    <p>Trân trọng,<br>Đội ngũ Hỗ trợ</p>
  </div>
  <!-- Footer -->
  <div class="email-footer">
    © 2024 Dịch vụ của chúng tôi. Đã đăng ký bản quyền.
  </div>
</div>
</body>
</html>`;

  await sendMail(createUser.email, subject, html);
  res.status(201).json({
    content: {
      data: {
        user_id: createUser.user_id,
        username: username,
        email: createUser.email,
        phone_number: createUser.phone_number,
        address: createUser.address,
        role: createUser.role,
        avatar_url: createUser.avatar_url,
      },
      message: "Đăng ký tài khoản thành công",
    },
    statusCode: 201,
    dateTime: getVietnamTime(),
  });
};

/**
 * @swagger
 * tags:
 *   - name: AUTH
 *     description: Các API liên quan đến xác thực người dùng
 *
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập
 *     description: API này cho phép người dùng đăng nhập vào hệ thống.
 *     tags:
 *       - AUTH
 *     requestBody:
 *       description: Thông tin đăng nhập của người dùng
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
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
 *                       example: "Đăng nhập thành công"
 *                     accessToken:
 *                       type: string
 *                       example: "<access_token>"
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 dateTime:
 *                   type: string
 *                   format: date-time
 *                   example: "2022-01-01T12:00:00Z"
 *       401:
 *         description: Mật khẩu không chính xác
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
 *                       example: "Mật khẩu không chính xác"
 *                 statusCode:
 *                   type: number
 *                   example: 401
 *                 dateTime:
 *                   type: string
 *                   format: date-time
 *                   example: "2022-01-01T12:00:00Z"
 *       404:
 *         description: Email không tồn tại
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
 *                       example: "Email không tồn tại"
 *                 statusCode:
 *                   type: number
 *                   example: 404
 *                 dateTime:
 *                   type: string
 *                   format: date-time
 *                   example: "2022-01-01T12:00:00Z"
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const checkEmail = await prisma.users.findUnique({
    where: {
      email,
    },
  });

  if (!checkEmail) {
    res.status(404).json({
      content: {
        message: "Email không tồn tại",
      },
      statusCode: 404,
      dateTime: getVietnamTime(),
    });
    return;
  }

  const checkPassword = bcrypt.compareSync(password, checkEmail.password);

  if (!checkPassword) {
    res.status(401).json({
      content: {
        message: "Mật khẩu không chính xác",
      },
      statusCode: 401,
      dateTime: getVietnamTime(),
    });
    return;
  }

  const accessToken: string = createToken(
    { email: checkEmail.email, user_id: checkEmail.user_id },
    `${process.env.SECRET_KEY}`,
    "2h"
  );

  const refreshToken: string = createToken(
    { email: checkEmail.email, user_id: checkEmail.user_id },
    `${process.env.SECRET_KEY}`,
    "7d"
  );
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.refreshTokens.upsert({
    where: {
      user_id: checkEmail.user_id,
    },
    update: {
      refresh_token: refreshToken,
      expires_at: expiresAt,
    },
    create: {
      user_id: checkEmail.user_id,
      refresh_token: refreshToken,
      expires_at: expiresAt,
    },
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(200).json({
    content: {
      message: "Đăng nhập thành công",
      accessToken: accessToken,
    },
    statusCode: 200,
    dateTime: getVietnamTime(),
  });
};

/**
 * @swagger
 * /api/auth/login-facebook:
 *   post:
 *     summary: Đăng nhập Facebook
 *     description: API này dùng để người dùng đăng nhập bằng Facebook
 *     tags:
 *       - AUTH
 *     requestBody:
 *       description: Thông tin đăng nhập
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "string"
 *               email:
 *                 type: string
 *                 example: "string"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
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
 *                       example: "Đăng nhập thành công"
 *                     accessToken:
 *                       type: string
 *                       example: "<access_token>"
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 dateTime:
 *                   type: string
 *                   format: date-time
 *                   example: "2022-01-01T12:00:00Z"
 */
export const loginFacebook = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, email } = req.body;

  const checkEmail = await prisma.users.findUnique({
    where: {
      email,
    },
  });

  if (!checkEmail) {
    const hashedPassword = await bcrypt.hash(
      `${process.env.FACEBOOK_USER_PASS}`,
      10
    );

    const createUser = await prisma.users.create({
      data: {
        username: name,
        password: hashedPassword,
        email,
        phone_number: "",
        address: "",
      },
    });

    const subject = "Đăng ký tài khoản thành công";
    const html = `<!DOCTYPE html>
  <html lang="vi">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Đăng Ký Tài Khoản Thành Công</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
      color: #333;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }
    .email-header {
      background-color: #d32f2f;
      color: #ffffff;
      padding: 20px;
      text-align: center;
      font-size: 24px;
      font-weight: bold;
    }
    .email-body {
      padding: 20px;
      line-height: 1.6;
      color: #333333;
    }
    .email-footer {
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #777777;
      border-top: 1px solid #e0e0e0;
    }
    .user-details {
      background-color: #ffebee;
      border: 1px solid #d32f2f;
      border-radius: 8px;
      padding: 15px;
      margin-top: 15px;
    }
    .user-details p {
      margin: 8px 0;
    }
    .set-password-button {
      display: inline-block;
      background-color: #d32f2f;
      color: #ffffff;
      text-decoration: none;
      padding: 12px 20px;
      margin-top: 20px;
      border-radius: 5px;
      font-size: 16px;
    }
  </style>
  </head>
  <body>
  <div class="email-container">
    <!-- Header -->
    <div class="email-header">
      Chào mừng đến với dịch vụ của chúng tôi!
    </div>
    <!-- Body -->
    <div class="email-body">
      <p>Xin chào <strong>${createUser.username}</strong>,</p>
      <p>Cảm ơn bạn đã đăng ký tài khoản với chúng tôi! Dưới đây là thông tin tài khoản của bạn:</p>
      <div class="user-details">
        <p><strong>Tên đăng nhập:</strong> ${createUser.username}</p>
        <p><strong>Email:</strong> ${createUser.email}</p>
        <p><strong>Số điện thoại:</strong> ${createUser.phone_number}</p>
        <p><strong>Địa chỉ:</strong> ${createUser.address}</p>
      </div>
      <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.</p>
      <p>Trân trọng,<br>Đội ngũ Hỗ trợ</p>
    </div>
    <!-- Footer -->
    <div class="email-footer">
      © 2024 Dịch vụ của chúng tôi. Đã đăng ký bản quyền.
    </div>
  </div>
  </body>
  </html>`;

    await sendMail(createUser.email, subject, html);
  }

  const checkUser = await prisma.users.findUnique({
    where: {
      email,
    },
  });

  if (checkUser) {
    const accessToken: string = createToken(
      { email: checkUser.email, user_id: checkUser.user_id },
      `${process.env.SECRET_KEY}`,
      "2h"
    );

    const refreshToken: string = createToken(
      { email: checkUser.email, user_id: checkUser.user_id },
      `${process.env.SECRET_KEY}`,
      "7d"
    );
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshTokens.upsert({
      where: {
        user_id: checkUser.user_id,
      },
      update: {
        refresh_token: refreshToken,
      },
      create: {
        user_id: checkUser.user_id,
        refresh_token: refreshToken,
        expires_at: expiresAt,
      },
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      content: {
        message: "Đăng nhập thành công",
        accessToken: accessToken,
      },
      statusCode: 200,
      dateTime: getVietnamTime(),
    });
  }
};

/**
 * @swagger
 * /api/auth/extend-token:
 *   post:
 *     summary: Extend the token
 *     description: API này dùng để tạo mới accessToken để duy trì đăng nhập trên client
 *     tags:
 *       - AUTH
 *     responses:
 *       200:
 *         description: Tạo mới accessToken thành công
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
 *                       example: "Tạo mới accessToken thành công"
 *                     accessToken:
 *                       type: string
 *                       example: "<access_token>"
 *                 statusCode:
 *                   type: number
 *                   example: 200
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
 *       404:
 *         description: Không tìm thấy tài nguyên
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
 *                       example: "Không tìm thấy tài nguyên"
 *                 statusCode:
 *                   type: number
 *                   example: 404
 *                 dateTime:
 *                   type: string
 *                   format: date-time
 *                   example: "2022-01-01T12:00:00Z"
 */
export const extendToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const refreshToken: string = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(401).json({
      content: { message: "Unauthorized" },
      statusCode: 401,
      dateTime: getVietnamTime(),
    });
  }

  const checkTokenDb = await prisma.refreshTokens.findUnique({
    where: {
      refresh_token: refreshToken,
    },
  });

  if (!checkTokenDb || checkTokenDb == null) {
    res.status(404).json({
      content: { message: "Không tìm thấy tài nguyên" },
      statusCode: 404,
      dateTime: getVietnamTime(),
    });
    return;
  }

  const checkDateToken = verifyToken(refreshToken, `${process.env.SECRET_KEY}`);

  if (!checkDateToken) {
    res.status(401).json({
      content: { message: "Unauthorized" },
      statusCode: 401,
      dateTime: getVietnamTime(),
    });

    await prisma.refreshTokens.delete({
      where: {
        token_id: checkTokenDb.token_id,
      },
    });
    return;
  }

  if (checkTokenDb?.user_id !== null && checkTokenDb?.user_id !== undefined) {
    const checkUser = await prisma.users.findUnique({
      where: {
        user_id: checkTokenDb.user_id,
      },
    });

    if (checkUser) {
      const accessToken: string = createToken(
        { email: checkUser.email, user_id: checkUser.user_id },
        `${process.env.SECRET_KEY}`,
        "2h"
      );

      res.status(200).json({
        content: {
          message: "Tạo mới accessToken thành công",
          accessToken: accessToken,
        },
        statusCode: 200,
        dateTime: getVietnamTime(),
      });
    }
  }
};

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Forgot password
 *     description: API này dùng để tạo mã khôi phục tài khoản và gửi mail về cho người dùng
 *     tags:
 *       - AUTH
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Gửi mã khôi phục tài khoản thành công
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
 *                       example: "Gửi mã khôi phục tài khoản thành công"
 *                     accessToken:
 *                       type: string
 *                       example: "<access_token>"
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 dateTime:
 *                   type: string
 *                   format: date-time
 *                   example: "2022-01-01T12:00:00Z"
 *       409:
 *         description: Email đã tồn tại
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
 *                       example: "Email đã tồn tại"
 *                 statusCode:
 *                   type: number
 *                   example: 409
 *                 dateTime:
 *                   type: string
 *                   format: date-time
 *                   example: "2022-01-01T12:00:00Z"
 */
export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;

  const checkEmail = await prisma.users.findUnique({
    where: {
      email,
    },
  });

  if (!checkEmail) {
    res.status(400).json({
      content: { message: "Email không tồn tại" },
      statusCode: 400,
      dateTime: getVietnamTime(),
    });
    return;
  }

  const code = crypto.randomBytes(3).toString("hex");
  const expired = new Date(new Date().getTime() + 2 * 60 * 1000);

  await prisma.forgotPasswordCodes.upsert({
    where: { user_id: checkEmail.user_id },
    update: {
      code: code,
      expires_at: expired,
    },
    create: {
      user_id: checkEmail.user_id,
      code: code,
      expires_at: expired,
    },
  });

  const subject = "Khôi phục mật khẩu cho tài khoản của bạn";
  const html = `
  <!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      color: #333333;
      line-height: 1.6;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid #dddddd;
      border-radius: 8px;
    }
    .header {
      text-align: center;
      padding: 10px 0;
    }
    .header h2 {
      color: #007bff;
      margin-bottom: 0;
    }
    .content {
      padding: 20px 0;
    }
    .code {
      font-size: 24px;
      font-weight: bold;
      color: #007bff;
      padding: 10px;
      border: 1px dashed #007bff;
      display: inline-block;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      color: #888888;
      font-size: 12px;
      padding-top: 10px;
      border-top: 1px solid #dddddd;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h2>Khôi phục mật khẩu</h2>
    </div>
    <div class="content">
      <p>Xin chào,</p>
      <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu của bạn. Vui lòng sử dụng mã xác nhận dưới đây để hoàn tất quá trình:</p>
      <div class="code">${code}</div>
      <p>Mã này có thời hạn trong 2 phút. Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.</p>
      <p>Trân trọng,<br>Công ty của bạn</p>
    </div>
    <div class="footer">
      <p>&copy; 2024 Công ty của bạn. Mọi quyền được bảo lưu.</p>
    </div>
  </div>
</body>
</html>

`;

  await sendMail(checkEmail.email, subject, html);
  res.status(200).json({
    content: { message: "Gửi mã khôi phục tài khoản thành công" },
    statusCode: 200,
    dateTiem: getVietnamTime(),
  });
};

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change password
 *     description: API này dùng để đổi mật khẩu tài khoản thông qua mã xác thực.
 *     tags:
 *       - AUTH
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "example@example.com"
 *               code:
 *                 type: string
 *                 example: "123456"
 *               newPass:
 *                 type: string
 *                 example: "NewP@ssw0rd"
 *             required:
 *               - email
 *               - code
 *               - newPass
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
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
 *                       example: "Đổi mật khẩu thành công"
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 dateTime:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T12:00:00Z"
 *       400:
 *         description: Mã code không chính xác
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
 *                       example: "Mã code không chính xác"
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *                 dateTime:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T12:00:00Z"
 *       401:
 *         description: Code hết hạn
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
 *                       example: "Code hết hạn"
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *                 dateTime:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T12:00:00Z"
 *       404:
 *         description: Dữ liệu không tồn tại
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
 *                       example: "Dữ liệu không tồn tại"
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *                 dateTime:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T12:00:00Z"
 *       409:
 *         description: Mật khẩu mới trùng với mật khẩu đã sử dụng gần đây
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
 *                       example: "Mật khẩu mới trùng với mật khẩu đã sử dụng gần đây"
 *                 statusCode:
 *                   type: integer
 *                   example: 409
 *                 dateTime:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T12:00:00Z"
 */
export const changePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, code, newPass } = req.body;

  const checkEmail = await prisma.users.findUnique({
    where: {
      email,
    },
  });

  if (!checkEmail) {
    res.status(404).json({
      content: { message: "Email không tồn tại" },
      statusCode: 404,
      dateTime: getVietnamTime(),
    });
    return;
  }

  const checkCode = await prisma.forgotPasswordCodes.findUnique({
    where: {
      user_id: checkEmail.user_id,
    },
  });

  if (!checkCode) {
    res.status(404).json({
      content: { message: "Code không tồn tại" },
      statusCode: 404,
      dateTime: getVietnamTime(),
    });
    return;
  }

  const checkCodeSuccess = code === checkCode.code;

  if (!checkCodeSuccess) {
    res.status(400).json({
      content: {
        message: "Code không chính xác",
      },
      statusCode: 400,
      dateTime: getVietnamTime(),
    });
    return;
  }

  const checkCodeDate = isExpiresAt(checkCode.expires_at);

  if (!checkCodeDate) {
    res.status(401).json({
      content: { message: "Code hết hạn" },
      statusCode: 401,
      dateTime: getVietnamTime(),
    });

    await prisma.forgotPasswordCodes.delete({
      where: {
        code_id: checkCode.code_id,
      },
    });
    return;
  }

  const checkPassHistory = await prisma.passwordHistory.findUnique({
    where: {
      user_id: checkEmail.user_id,
    },
  });

  if (checkPassHistory) {
    const isPast = bcrypt.compareSync(newPass, checkPassHistory.old_password);

    if (isPast) {
      res.status(409).json({
        content: {
          message: "Mật khẩu mới trùng với mật khẩu đã sử dụng gần đây",
        },
        statusCode: 409,
        dateTime: getVietnamTime(),
      });
      return;
    }
  }

  const hashedPassword = await bcrypt.hash(newPass, 10);

  await prisma.passwordHistory.upsert({
    where: { user_id: checkEmail.user_id },
    update: {
      old_password: checkEmail.password,
    },
    create: {
      user_id: checkEmail.user_id,
      old_password: checkEmail.password,
    },
  });

  await prisma.users.update({
    where: {
      user_id: checkEmail.user_id,
    },
    data: {
      password: hashedPassword,
    },
  });

  res.status(200).json({
    content: { message: "Đổi mật khẩu thành công" },
    statusCode: 200,
    dateTime: getVietnamTime(),
  });

  await prisma.forgotPasswordCodes.delete({
    where: {
      code_id: checkCode.code_id,
    },
  });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  const checkEmail = await prisma.users.findUnique({
    where: {
      email,
    },
  });

  if (!checkEmail) {
    res.status(400).json({
      content: { message: "Email không tồn tại" },
      statusCode: 400,
      dateTime: getVietnamTime(),
    });
    return;
  }

  const checkForgotPassword = await prisma.forgotPasswordCodes.findUnique({
    where: {
      user_id: checkEmail.user_id,
    },
  });

  if (checkForgotPassword) {
    await prisma.forgotPasswordCodes.delete({
      where: {
        user_id: checkEmail.user_id,
      },
    });
  }

  const checkRefToken = await prisma.refreshTokens.findUnique({
    where: {
      user_id: checkEmail.user_id,
    },
  });

  if (checkRefToken) {
    await prisma.refreshTokens.delete({
      where: {
        user_id: checkEmail.user_id,
      },
    });
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 0,
  });

  res.status(200).json({ message: "Đăng xuất thành công", statusCode: 200 });
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password, newPassword } = req.body;

  const checkEmail = await prisma.users.findUnique({
    where: {
      email,
    },
  });

  if (!checkEmail) {
    res.status(400).json({
      content: {
        message: "Email không tồn tại",
      },
      statusCode: 400,
      dateTime: getVietnamTime(),
    });
    return;
  }

  const checkPassword = bcrypt.compareSync(password, checkEmail.password);

  if (!checkPassword) {
    res.status(400).json({
      content: {
        message: "Mật khẩu không chính xác",
      },
      statusCode: 400,
      dateTime: getVietnamTime(),
    });
    return;
  }

  const historyPassword = await prisma.passwordHistory.findUnique({
    where: {
      user_id: checkEmail.user_id,
    },
  });

  if (historyPassword) {
    const isPast = bcrypt.compareSync(
      newPassword,
      historyPassword.old_password
    );

    if (isPast) {
      res.status(400).json({
        content: {
          message: "Mật khẩu mới trùng với mật khẩu đã sử dụng gần đây",
        },
        statusCode: 400,
        dateTime: getVietnamTime(),
      });
      return;
    }
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.passwordHistory.upsert({
    where: { user_id: checkEmail.user_id },
    update: {
      old_password: checkEmail.password,
    },
    create: {
      user_id: checkEmail.user_id,
      old_password: checkEmail.password,
    },
  });

  await prisma.users.update({
    where: {
      user_id: checkEmail.user_id,
    },
    data: {
      password: hashedPassword,
    },
  });

  res.status(200).json({
    content: {
      message: "Đổi mật khẩu thành công",
    },
    statusCode: 200,
    dateTime: getVietnamTime(),
  });
};

export const sendCodeVerifyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;

  const checkEmail = await prisma.users.findUnique({
    where: {
      email,
    },
  });

  if (!checkEmail) {
    res.status(400).json({
      content: {
        message: "Email không tồn tại",
      },
      statusCode: 400,
      dateTime: getVietnamTime(),
    });
    return;
  }

  const code = crypto.randomBytes(3).toString("hex");
  const expired = new Date(new Date().getTime() + 2 * 60 * 1000);

  await prisma.emailVerificationCodes.upsert({
    where: {
      user_id: checkEmail.user_id,
    },
    update: {
      verification_code: code,
      expires_at: expired,
    },
    create: {
      user_id: checkEmail.user_id,
      expires_at: expired,
      verification_code: code,
    },
  });

  const subject = "Xác thực email cho tài khoản của bạn";
  const html = `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mã Xác Thực</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 50px auto;
      background-color: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #333333;
      font-size: 24px;
      margin-bottom: 20px;
    }
    p {
      color: #555555;
      font-size: 16px;
      line-height: 1.5;
    }
    .code {
      display: inline-block;
      background-color: #4CAF50;
      color: #ffffff;
      padding: 10px 20px;
      font-size: 18px;
      text-align: center;
      border-radius: 5px;
      margin-top: 20px;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #888888;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Mã Xác Thực của Bạn</h1>
    <p>Chào bạn,</p>
    <p>Cảm ơn bạn đã đăng ký tài khoản. Để hoàn tất đăng ký, vui lòng nhập mã xác thực dưới đây:</p>
    
    <div class="code">${code}</div>
    
    <p>Mã xác thực của bạn sẽ hết hạn sau 02 phút.</p>
    
    <div class="footer">
      <p>Trân trọng,<br>Đội ngũ Hỗ trợ</p>
    </div>
  </div>
</body>
</html>
`;

  await sendMail(checkEmail.email, subject, html);
  res.status(200).json({
    content: { message: "Gửi mã xác thực email thành công" },
    statusCode: 200,
    dateTime: getVietnamTime(),
  });
};

export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { code, email } = req.body;

  const checkEmail = await prisma.users.findUnique({
    where: {
      email,
    },
  });

  if (!checkEmail) {
    res.status(400).json({
      content: {
        message: "Email không tồn tại",
      },
      statusCode: 400,
      dateTime: getVietnamTime(),
    });
    return;
  }

  const checkUserInEmailVerificationCodes =
    await prisma.emailVerificationCodes.findUnique({
      where: {
        user_id: checkEmail.user_id,
      },
    });

  if (!checkUserInEmailVerificationCodes) {
    res.status(400).json({
      content: {
        message: "Mã xác thực không tồn tại",
      },
      statusCode: 400,
      dateTime: getVietnamTime(),
    });
    return;
  }

  const checkCodeSuccess =
    code === checkUserInEmailVerificationCodes.verification_code;

  if (!checkCodeSuccess) {
    res.status(400).json({
      content: { message: "Mã xác thực không chính xác" },
      statusCode: 400,
      dateTime: getVietnamTime(),
    });
    return;
  }

  const checkCodeDate = isExpiresAt(
    checkUserInEmailVerificationCodes.expires_at
  );

  if (!checkCodeDate) {
    res.status(400).json({
      content: { message: "Mã xác thực hết hạn" },
      statusCode: 400,
      dateTime: getVietnamTime(),
    });

    await prisma.emailVerificationCodes.delete({
      where: {
        verification_id: checkUserInEmailVerificationCodes.verification_id,
      },
    });
    return;
  }

  await prisma.users.update({
    where: {
      user_id: checkEmail.user_id,
    },
    data: {
      is_email_verified: true,
    },
  });

  await prisma.emailVerificationCodes.delete({
    where: {
      verification_id: checkUserInEmailVerificationCodes.verification_id,
    },
  });

  res.status(200).json({
    content: { message: "Xác thực email thành công" },
    statusCode: 200,
    dateTime: getVietnamTime(),
  });
};
