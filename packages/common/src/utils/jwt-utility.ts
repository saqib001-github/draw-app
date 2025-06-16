import Jwt, { SignOptions, Secret } from "jsonwebtoken";

export const generateJwtToken = (
  payload: object,
  secret: Secret,
  expiresIn: SignOptions["expiresIn"] = "24h",
): string => {
  try {
    return Jwt.sign(payload, secret, { expiresIn });
  } catch (error) {
    throw new Error("Error generating token");
  }
};

export const verifyJwtToken = (token: string, secret: Secret): object => {
  try {
    return Jwt.verify(token, secret) as object;
  } catch (error) {
    throw new Error("Invalid token");
  }
};
