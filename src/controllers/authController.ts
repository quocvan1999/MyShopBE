import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { sendMail } from "../config/sendMail";
import { createToken, verifyToken } from "../utils/jwtToken";
import crypto from "crypto";
import { getVietnamTime, isExpiresAt } from "../utils/method";

const prisma = new PrismaClient();

export const sinup = async (req: Request, res: Response): Promise<void> => {
  const { username, password, email, phone, address } = req.body;

  const checkEmail = await prisma.users.findUnique({
    where: {
      email,
    },
  });

  if (checkEmail) {
    res.status(400).json({
      content: { message: "Email đã tồn tại" },
      statusCode: 400,
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
      phone_number: phone,
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
        id: createUser.user_id,
        name: username,
        email: createUser.email,
        phone: createUser.phone_number,
        address: createUser.address,
        role: createUser.role,
        avatar: createUser.avatar_url,
      },
      message: "Đăng ký tài khoản thành công",
    },
    statusCode: 201,
    dateTime: getVietnamTime(),
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

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

export const extendToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const refreshToken: string = req.cookies.refreshToken;

  if (!refreshToken) {
    res
      .status(401)
      .json({ content: {}, statusCode: 401, dateTime: getVietnamTime() });
  }

  const checkTokenDb = await prisma.refreshTokens.findUnique({
    where: {
      refresh_token: refreshToken,
    },
  });

  if (!checkTokenDb || checkTokenDb == null) {
    res
      .status(401)
      .json({ content: {}, statusCode: 401, dateTime: getVietnamTime() });
    return;
  }

  const checkDateToken = verifyToken(refreshToken, `${process.env.SECRET_KEY}`);

  if (!checkDateToken) {
    res
      .status(401)
      .json({ content: {}, statusCode: 401, dateTime: getVietnamTime() });

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
    res.status(400).json({
      content: { message: "Email không tồn tại" },
      statusCode: 400,
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
    res.status(400).json({
      content: { message: "Code không tồn tại" },
      statusCode: 400,
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
    res.status(400).json({
      content: { message: "Code hết hạn" },
      statusCode: 400,
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
