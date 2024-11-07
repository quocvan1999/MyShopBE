import jwt, { JwtPayload } from "jsonwebtoken";

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

export const verifyToken = (token: string, secretKey: string): boolean => {
  try {
    jwt.verify(token, secretKey);
    return true;
  } catch (error) {
    return false;
  }
};

export const getUserIdFromToken = (
  token: string,
  secretKey: string
): { email: string; user_id: number } | boolean => {
  try {
    const decoded = jwt.verify(token, secretKey);

    if (typeof decoded !== "string" && decoded !== null) {
      const { payload } = decoded as JwtPayload;

      if (payload) {
        return payload;
      }
    }
    return false;
  } catch (error) {
    return false;
  }
};
