import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { sendMail } from "../config/sendMail";
import { createToken } from "../utils/jwtToken";

const prisma = new PrismaClient();

export const sinup = async (req: Request, res: Response): Promise<void> => {
    const { username, password, email, phone, address } = req.body;

    const checkEmail = await prisma.users.findUnique({
        where: {
            email,
        },
    });

    if (checkEmail) {
        res.status(400).json({ message: "Email đã tồn tại", statusCode: 400 });
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createUser = await prisma.users.create({
        data: {
            username,
            password: hashedPassword,
            email,
            phone_number: phone,
            address,
        },
    });

    const subject = "Đăng ký tài khoản thành công";
    const text = `Chào ${createUser.username}, cảm ơn bạn đã đăng ký. Tài khoản của bạn đã được tạo thành công.`;
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

    await sendMail(createUser.email, subject, text, html);
    res.status(201).json({
        message: "Đăng ký tài khoản thành công",
        content: {
            id: createUser.user_id,
            name: username,
            email: createUser.email,
            phone: createUser.phone_number,
            address: createUser.address,
            role: createUser.role,
            avatar: createUser.avatar_url,
        },
        statusCode: 201,
    });

    return
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    const checkEmail = await prisma.users.findUnique({
        where: {
            email,
        },
    });

    if (!checkEmail) {
        res.status(400).json({ message: "Email không tồn tại", statusCode: 400 });
        return;
    }

    const checkPassword = bcrypt.compareSync(password, checkEmail.password);

    if (!checkPassword) {
        res
            .status(400)
            .json({ message: "Mật khẩu không chính xác", statusCode: 400 });
        return;
    }

    const accessToken: string = createToken(
        { email: checkEmail.email, user_id: checkEmail.user_id },
        `${process.env.SECRET_KEY}`,
        "1h"
    );

    const refreshToken: string = createToken(
        { email: checkEmail.email, user_id: checkEmail.user_id },
        `${process.env.SECRET_KEY}`,
        "7d"
    );
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshTokens.upsert({
        where: {
            user_id: checkEmail.user_id
        },
        update: {
            refresh_token: refreshToken
        },
        create: {
            user_id: checkEmail.user_id,
            refresh_token: refreshToken,
            expires_at: expiresAt
        }
    })

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ message: "Đăng nhập thành công", accessToken: accessToken, statusCode: 200 })
};

export const extendToken = async (req: Request, res: Response): Promise<void> => {

}