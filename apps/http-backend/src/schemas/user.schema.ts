import { z } from "zod";

export const signupSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string(),
  }),
});

export const createRoomSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Room name is required"),
    description: z.string().optional(),
  }),
});
