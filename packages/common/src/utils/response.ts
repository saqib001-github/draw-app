import { Response, Request, NextFunction } from "express";

interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  status: number;
}

export const sendResponse = <T>(
  res: Response,
  { data, message, status = 200 }: Omit<APIResponse<T>, "success">,
) => {
  return res.status(status).json({
    success: status >= 200 && status < 300,
    message,
    data,
    status,
  });
};

export const wrapAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
