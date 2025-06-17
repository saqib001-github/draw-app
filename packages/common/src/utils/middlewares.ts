import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";
import { verifyJwtToken } from "./jwt-utility";
import { sendResponse } from "./response";
import { ValidationError } from "./errors";
export const validateSchema = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      return next(error);
    }
  };
};

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new ValidationError("Authentication token missing");
    }

    const decoded = verifyJwtToken(token, process.env.JWT_SECRET as string);
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

export const handleErrors = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err.stack);

  return sendResponse(res, {
    status: err.status || 500,
    message: err.message || "Internal Server Error",
  });
};
