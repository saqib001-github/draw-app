import bcrypt from "bcryptjs";
import prisma from "@repo/database";
import { generateJwtToken, NotFoundError, ValidationError } from "@repo/common";

export class UserService {
  static async signup(email: string, password: string, name?: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ValidationError("User already exists");
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
      process.env.JWT_SECRET!
    );

    return { user, token };
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new ValidationError("Invalid credentials");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    const token = generateJwtToken(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET!
    );

    return { user, token };
  }

  static async createRoom(userId: string, name: string, description?: string) {
    // do not fetch password
    return prisma.room.create({
      data: {
        name,
        description,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
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
      throw new NotFoundError("User not found");
    }

    return user;
  }

  static async getRoomBySlug(slug: string) {
    const room = await prisma.room.findUnique({
      where: { slug },
      include: {
        owner: true,
        participants: true,
      },
    });

    if (!room) {
      throw new NotFoundError("Room not found");
    }

    return room;
  }
  static async getRoomChats(roomId: string) {
    const chats = await prisma.chat.findMany({
      where: { roomId },
      take: 50,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return chats;
  }
  static async getRoomShapes(roomId: string) {
    const shapes = await prisma.stroke.findMany({
      where: { roomId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return shapes;
  }
}
