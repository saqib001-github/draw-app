import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@repo/database";
import { generateJwtToken } from "@repo/common";

export class UserService {
  static async signup(email: string, password: string, name?: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const token = generateJwtToken(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET!,
    );

    return { user, token };
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    const token = generateJwtToken(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET!,
    );

    return { user, token };
  }

  static async createRoom(userId: string, name: string, description?: string) {
    return prisma.room.create({
      data: {
        name,
        description,
        ownerId: userId,
        participants: {
          connect: { id: userId },
        },
      },
      include: {
        owner: true,
        participants: true,
      },
    });
  }

  static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        rooms: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
}
