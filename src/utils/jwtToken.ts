import jwt from "jsonwebtoken";

export const createToken = (
  data: { user_id: number; email: string },
  secretKey: string,
  time: string
): string => {
  return jwt.sign({ payload: data }, secretKey, {
    algorithm: "HS256",
    expiresIn: time,
  });
};

export const verifyToken = (token: string, secretKey: string) => {
  try {
    jwt.verify(token, secretKey);
    return true;
  } catch (error) {
    return false;
  }
};
