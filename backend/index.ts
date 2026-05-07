import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "./db";
import { getUploadPresignedUrl } from "./r2";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "secret-key-change-me";

// Middleware
app.use(cors());
app.use(express.json());

// Types
interface DecodedToken {
  userId: string;
}

interface AuthRequest extends Request {
  userId?: string;
}

// Zod schemas
const SignupSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  channelName: z.string().min(3),
  gender: z.enum(["Male", "Female", "Others"]),
  description: z.string().optional(),
});

const LoginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

const UploadSchema = z.object({
  videoUrl: z.string().url(),
  thumbnail: z.string().url(),
});

// Auth middleware
const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Routes

// Signup
app.post("/auth/signup", async (req: Request, res: Response) => {
  try {
    const body = SignupSchema.parse(req.body);

    const existingUser = await prisma.user.findFirst({
      where: { username: body.username },
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const user = await prisma.user.create({
      data: {
        username: body.username,
        password: hashedPassword,
        channelName: body.channelName,
        gender: body.gender,
        description: body.description || "",
        banner: "",
        profilePicture: "",
      },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({ token, userId: user.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login
app.post("/auth/login", async (req: Request, res: Response) => {
  try {
    const body = LoginSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: { username: body.username },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(body.password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, userId: user.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user profile
app.get("/users/:id", async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: String(req.params.id) },
      include: { uploads: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Don't send password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Upload video
app.post(
  "/uploads",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const body = UploadSchema.parse(req.body);

      const upload = await prisma.uploads.create({
        data: {
          videoUrl: body.videoUrl,
          thumbnail: body.thumbnail,
          userId: req.userId!,
        },
      });

      res.status(201).json(upload);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get all uploads for user
app.get(
  "/users/:id/uploads",
  async (req: Request, res: Response) => {
    try {
      const uploads = await prisma.uploads.findMany({
        where: { userId: String(req.params.id) },
      });

      res.json(uploads);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get feed - all videos from all users
app.get("/api/videos", async (req: Request, res: Response) => {
  try {
    const uploads = await prisma.uploads.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            channelName: true,
            profilePicture: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(uploads);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete upload
app.delete(
  "/uploads/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const upload = await prisma.uploads.findUnique({
        where: { id: String(req.params.id) },
      });

      if (!upload) {
        return res.status(404).json({ error: "Upload not found" });
      }

      if (upload.userId !== req.userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      await prisma.uploads.delete({
        where: { id: String(req.params.id) },
      });

      res.json({ message: "Upload deleted" });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get single upload by id
app.get("/uploads/:id", async (req: Request, res: Response) => {
  try {
    const upload = await prisma.uploads.findUnique({
      where: { id: String(req.params.id) },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            channelName: true,
            profilePicture: true,
            subscriberCount: true,
            description: true,
          },
        },
      },
    });

    if (!upload) {
      return res.status(404).json({ error: "Upload not found" });
    }

    res.json(upload);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Generate presigned URL for R2 upload
const PresignedUrlSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  folder: z.enum(["videos", "thumbnails"]),
});

app.post(
  "/uploads/presigned-url",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { fileName, contentType, folder } = PresignedUrlSchema.parse(req.body);

      const ext = fileName.split(".").pop();
      const key = `${folder}/${req.userId}-${Date.now()}.${ext}`;

      const url = await getUploadPresignedUrl(key, contentType);
      res.json({ url, key });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues });
      }
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  }
);

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
