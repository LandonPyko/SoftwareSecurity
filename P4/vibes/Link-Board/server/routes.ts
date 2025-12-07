import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import passport from "passport";
import { insertUserSchema, insertArticleSchema, type User } from "@shared/schema";
import { fromError } from "zod-validation-error";

declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      password: string;
      isAdmin: string;
    }
  }
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const validation = insertUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: fromError(validation.error).toString() });
      }

      const existingUser = await storage.getUserByUsername(validation.data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser(validation.data);
      
      req.login(user, (err) => {
        if (err) return next(err);
        const { password, ...userWithoutPassword } = user;
        res.status(201).json({ user: userWithoutPassword });
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: Express.User, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }

      req.login(user, (err) => {
        if (err) return next(err);
        const { password, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, (req, res) => {
    const { password, ...userWithoutPassword } = req.user!;
    res.json(userWithoutPassword);
  });

  app.get("/api/articles", async (req, res, next) => {
    try {
      const articles = await storage.getArticles();
      res.json(articles);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/articles", requireAuth, async (req, res, next) => {
    try {
      const validation = insertArticleSchema.safeParse({
        ...req.body,
        userId: req.user!.id,
      });

      if (!validation.success) {
        return res.status(400).json({ message: fromError(validation.error).toString() });
      }

      const article = await storage.createArticle(validation.data);
      res.status(201).json(article);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/articles/:id", requireAuth, async (req, res, next) => {
    try {
      const { id } = req.params;
      const articles = await storage.getArticles();
      const article = articles.find(a => a.id === id);

      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      const isOwner = article.userId === req.user!.id;
      const isAdmin = req.user!.isAdmin === "true";

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await storage.deleteArticle(id);
      res.json({ message: "Article deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  return httpServer;
}
