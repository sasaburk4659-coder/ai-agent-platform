import { eq, sql, and, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, coinTransactions, agentTasks, systemStats } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId && !user.username) {
    throw new Error("User openId or username is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
      username: user.username,
      email: user.email,
      loginMethod: user.loginMethod,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "username", "passwordHash", "ipAddress"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId || user.email === "sasaburk4659@gmail.com") {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUser(data: InsertUser) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(users).values(data);
  return result;
}

export async function countUsersByIp(ipAddress: string) {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(users)
    .where(eq(users.ipAddress, ipAddress));

  return result[0]?.count ?? 0;
}

export async function addCoins(userId: number, amount: number, type: "earn" | "spend" | "admin_adjust", description?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Add transaction record
  await db.insert(coinTransactions).values({
    userId,
    amount: type === "spend" ? -amount : amount,
    type,
    description,
  });

  // Update user coins
  if (type === "spend") {
    await db
      .update(users)
      .set({ coins: sql`coins - ${amount}` })
      .where(eq(users.id, userId));
  } else {
    await db
      .update(users)
      .set({ coins: sql`coins + ${amount}` })
      .where(eq(users.id, userId));
  }
}

export async function getUserCoins(userId: number) {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.select({ coins: users.coins }).from(users).where(eq(users.id, userId));
  return result[0]?.coins ?? 0;
}

export async function dailyRewardUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const user = await getUserById(userId);
  if (!user) throw new Error("User not found");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if user already got reward today
  const lastReward = await db
    .select()
    .from(coinTransactions)
    .where(
      and(
        eq(coinTransactions.userId, userId),
        eq(coinTransactions.type, "earn"),
        gte(coinTransactions.createdAt, today)
      )
    )
    .limit(1);

  if (lastReward.length > 0) {
    return { success: false, message: "Already received daily reward" };
  }

  // Add 300 coins
  await addCoins(userId, 300, "earn", "Daily reward");
  return { success: true, message: "Daily reward claimed" };
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(users);
}

export async function updateUserCoins(userId: number, newAmount: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({ coins: newAmount }).where(eq(users.id, userId));
}

export async function createAgentTask(userId: number, taskType: string, prompt: string, coinsCost: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(agentTasks).values({
    userId,
    taskType,
    prompt,
    coinsCost,
  });

  return result;
}

export async function updateAgentTask(taskId: number, status: string, result?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(agentTasks)
    .set({
      status: status as any,
      result,
      completedAt: status === "completed" ? new Date() : undefined,
    })
    .where(eq(agentTasks.id, taskId));
}

export async function getUserTasks(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(agentTasks)
    .where(eq(agentTasks.userId, userId))
    .limit(limit);
}

export async function getSystemStats() {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(systemStats).limit(1);
  return result[0] ?? null;
}

export async function updateSystemStats(data: Partial<typeof systemStats.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const stats = await getSystemStats();
  if (!stats) {
    await db.insert(systemStats).values(data as any);
  } else {
    await db.update(systemStats).set(data as any).where(eq(systemStats.id, stats.id));
  }
}
