import { type User, type InsertUser, type Article, type InsertArticle, users, articles } from "@shared/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, desc } from "drizzle-orm";
import pg from "pg";
import bcrypt from "bcrypt";

const { Pool } = pg;

export type ArticleWithUsername = Article & { username: string };

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getArticles(): Promise<ArticleWithUsername[]>;
  createArticle(article: InsertArticle): Promise<Article>;
  deleteArticle(id: string): Promise<void>;
  initializeAdmin(): Promise<void>;
}

export class DrizzleStorage implements IStorage {
  private db;

  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    this.db = drizzle(pool);
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const result = await this.db.insert(users).values({
      username: insertUser.username,
      password: hashedPassword,
    }).returning();
    return result[0];
  }

  async getArticles(): Promise<ArticleWithUsername[]> {
    const result = await this.db
      .select({
        id: articles.id,
        url: articles.url,
        title: articles.title,
        userId: articles.userId,
        createdAt: articles.createdAt,
        username: users.username,
      })
      .from(articles)
      .leftJoin(users, eq(articles.userId, users.id))
      .orderBy(desc(articles.createdAt));
    
    return result.map(row => ({
      ...row,
      username: row.username || "Unknown",
    }));
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const result = await this.db.insert(articles).values(article).returning();
    return result[0];
  }

  async deleteArticle(id: string): Promise<void> {
    await this.db.delete(articles).where(eq(articles.id, id));
  }

  async initializeAdmin(): Promise<void> {
    const adminUser = await this.getUserByUsername("admin");
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash("admin", 10);
      await this.db.insert(users).values({
        username: "admin",
        password: hashedPassword,
        isAdmin: "true",
      });
    }
  }
}

export const storage = new DrizzleStorage();
