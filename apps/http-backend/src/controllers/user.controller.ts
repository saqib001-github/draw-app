import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { sendResponse } from "@repo/common";

export class UserController {
  static async signup(req: Request, res: Response) {
    const { email, password, name } = req.body;
    const result = await UserService.signup(email, password, name);

    return sendResponse(res, {
      message: "User created successfully",
      data: result,
      status: 201,
    });
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const result = await UserService.login(email, password);

    return sendResponse(res, {
      message: "Login successful",
      data: result,
      status: 200,
    });
  }

  static async createRoom(req: Request, res: Response) {
    const { name, description } = req.body;
    const userId = req.user.id;

    const room = await UserService.createRoom(userId, name, description);

    return sendResponse(res, {
      message: "Room created successfully",
      data: room,
      status: 201,
    });
  }

  static async userProfile(req: Request, res: Response) {
    const userId = req.user.id;
    const user = await UserService.getUserProfile(userId);

    return sendResponse(res, {
      message: "User profile retrieved successfully",
      data: user,
      status: 200,
    });
  }
}
