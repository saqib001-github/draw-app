import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";
import jwt from "jsonwebtoken";
import { verifyJwtToken } from "./jwt-utility";
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
      throw new Error("Authentication token missing");
    }

    const decoded = verifyJwtToken(token, process.env.JWT_SECRET as string);
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

export const handleErrors = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err.stack);

  if (err instanceof SyntaxError) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON payload",
      status: 400,
    });
  }

  if (err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: err,
      status: 400,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
    status: 500,
  });
};
