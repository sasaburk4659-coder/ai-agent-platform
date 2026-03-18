import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).unique(),
  /** Username for manual registration */
  username: varchar("username", { length: 64 }).unique(),
  /** Hashed password for manual registration */
  passwordHash: text("passwordHash"),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  loginMethod: varchar("loginMethod", { length: 64 }), // 'oauth' or 'manual'
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  /** IP address of user registration */
  ipAddress: varchar("ipAddress", { length: 45 }),
  /** Coins balance for the user */
  coins: bigint("coins", { mode: "number" }).default(1000).notNull(),
  /** Whether the account is active */
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const coinTransactions = mysqlTable("coinTransactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amount: bigint("amount", { mode: "number" }).notNull(),
  type: mysqlEnum("type", ["earn", "spend", "admin_adjust"]).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CoinTransaction = typeof coinTransactions.$inferSelect;
export type InsertCoinTransaction = typeof coinTransactions.$inferInsert;

export const agentTasks = mysqlTable("agentTasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  taskType: varchar("taskType", { length: 64 }).notNull(), // 'minecraft_mod', 'email', 'code_gen', etc
  prompt: text("prompt").notNull(),
  result: text("result"),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  coinsCost: bigint("coinsCost", { mode: "number" }).default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type AgentTask = typeof agentTasks.$inferSelect;
export type InsertAgentTask = typeof agentTasks.$inferInsert;

export const systemStats = mysqlTable("systemStats", {
  id: int("id").autoincrement().primaryKey(),
  totalUsers: int("totalUsers").default(0),
  totalCoinsDistributed: bigint("totalCoinsDistributed", { mode: "number" }).default(0),
  totalTasksCompleted: int("totalTasksCompleted").default(0),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemStats = typeof systemStats.$inferSelect;
export type InsertSystemStats = typeof systemStats.$inferInsert;

export const apiKeys = mysqlTable("apiKeys", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  key: varchar("key", { length: 255 }).unique().notNull(), // Hashed API key
  name: varchar("name", { length: 128 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  lastUsed: timestamp("lastUsed"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

export const apiEndpoints = mysqlTable("apiEndpoints", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  url: text("url").notNull(),
  method: varchar("method", { length: 10 }).default("POST").notNull(), // GET, POST, PUT, DELETE
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ApiEndpoint = typeof apiEndpoints.$inferSelect;
export type InsertApiEndpoint = typeof apiEndpoints.$inferInsert;
