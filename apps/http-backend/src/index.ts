import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { handleErrors } from "@repo/common";
import userRouter from "./routes/user.routes";

dotenv.config();

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/users", userRouter);

// Error handling
app.use(handleErrors);

app.listen(PORT, () => {
  console.log(`HTTP Server running on port ${PORT}`);
});
