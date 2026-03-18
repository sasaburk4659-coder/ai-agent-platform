import { COOKIE_NAME } from "@shared/const";
import { invokeLLM } from "./_core/llm";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,


  coins: router({
    getBalance: protectedProcedure.query(async ({ ctx }) => {
      const coins = await db.getUserCoins(ctx.user.id);
      return { coins };
    }),
    claimDaily: protectedProcedure.mutation(async ({ ctx }) => {
      try {
        const result = await db.dailyRewardUser(ctx.user.id);
        if (result.success) {
          const coins = await db.getUserCoins(ctx.user.id);
          return { success: true, coins, message: "300 coins claimed!" };
        }
        return { success: false, message: result.message };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to claim daily reward" });
      }
    }),
    estimateCost: publicProcedure
      .input(z.object({ prompt: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "You are a cost estimator. Analyze the user's request and estimate the cost in coins (1-1000). Consider complexity, time, and resources needed. Respond with ONLY a JSON object: {\"estimatedCoins\": number, \"reasoning\": string}",
              },
              {
                role: "user",
                content: input.prompt,
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "cost_estimate",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    estimatedCoins: { type: "number", description: "Estimated cost in coins" },
                    reasoning: { type: "string", description: "Why this cost" },
                  },
                  required: ["estimatedCoins", "reasoning"],
                  additionalProperties: false,
                },
              },
            },
          });

          const content = response.choices[0]?.message.content;
          if (!content) throw new Error("No response from LLM");

          const parsed = JSON.parse(typeof content === 'string' ? content : '');
          return {
            estimatedCoins: Math.min(Math.max(parsed.estimatedCoins, 1), 1000),
            reasoning: parsed.reasoning,
          };
        } catch (error) {
          return {
            estimatedCoins: 50,
            reasoning: "Standard task complexity",
          };
        }
      }),
  }),
  agent: router({
    executeTask: protectedProcedure
      .input(
        z.object({
          taskType: z.string(),
          prompt: z.string(),
          coinsCost: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const userCoins = await db.getUserCoins(ctx.user.id);
        if (userCoins < input.coinsCost) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Insufficient coins",
          });
        }

        // Create task
        const taskResult = await db.createAgentTask(
          ctx.user.id,
          input.taskType,
          input.prompt,
          input.coinsCost
        );

        // Deduct coins
        await db.addCoins(ctx.user.id, input.coinsCost, "spend", `Task: ${input.taskType}`);

        return {
          taskId: (taskResult as any).insertId || 0,
          success: true,
          coinsDeducted: input.coinsCost,
        };
      }),
    getTasks: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserTasks(ctx.user.id);
    }),
  }),
  api: router({
    generateKey: protectedProcedure
      .input(z.object({ name: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const key = await db.generateApiKey(ctx.user.id, input.name);
        return { success: true, key };
      }),
    getKeys: protectedProcedure.query(async ({ ctx }) => {
      const keys = await db.getUserApiKeys(ctx.user.id);
      return keys.map(k => ({
        id: k.id,
        name: k.name,
        key: k.key.substring(0, 10) + '...',
        isActive: k.isActive,
        lastUsed: k.lastUsed,
        createdAt: k.createdAt,
      }));
    }),
    deleteKey: protectedProcedure
      .input(z.object({ keyId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteApiKey(input.keyId);
        return { success: true };
      }),
    createEndpoint: protectedProcedure
      .input(z.object({ name: z.string(), url: z.string(), method: z.string(), description: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        await db.createApiEndpoint(ctx.user.id, input.name, input.url, input.method, input.description);
        return { success: true };
      }),
    getEndpoints: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserApiEndpoints(ctx.user.id);
    }),
    updateEndpoint: protectedProcedure
      .input(z.object({ endpointId: z.number(), name: z.string().optional(), url: z.string().optional(), method: z.string().optional(), description: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        await db.updateApiEndpoint(input.endpointId, {
          name: input.name,
          url: input.url,
          method: input.method,
          description: input.description,
        });
        return { success: true };
      }),
    deleteEndpoint: protectedProcedure
      .input(z.object({ endpointId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteApiEndpoint(input.endpointId);
        return { success: true };
      }),
  }),
  admin: router({
    getAllUsers: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      return db.getAllUsers();
    }),
    addCoinsToUser: protectedProcedure
      .input(z.object({ userId: z.number(), amount: z.number(), reason: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        await db.addCoins(input.userId, input.amount, "admin_adjust", input.reason);
        const newBalance = await db.getUserCoins(input.userId);
        return { success: true, newBalance };
      }),
    getSystemStats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      return db.getSystemStats();
    }),
  }),
  auth: router({
    register: publicProcedure
      .input(
        z.object({
          username: z.string().min(3),
          email: z.string().email(),
          password: z.string().min(6),
          ipAddress: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const existingUser = await db.getUserByUsername(input.username);
        if (existingUser) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Username already taken" });
        }

        const userCount = await db.countUsersByIp(input.ipAddress);
        if (userCount >= 5) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Maximum 5 users per IP address",
          });
        }

        const passwordHash = await bcrypt.hash(input.password, 10);

        await db.createUser({
          username: input.username,
          email: input.email,
          passwordHash,
          loginMethod: "manual",
          ipAddress: input.ipAddress,
          coins: 1000,
          role: input.email === "sasaburk4659@gmail.com" ? "admin" : "user",
        });

        return { success: true, message: "User created successfully" };
      }),
    login: publicProcedure
      .input(
        z.object({
          username: z.string(),
          password: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const user = await db.getUserByUsername(input.username);
        if (!user || !user.passwordHash) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid credentials" });
        }

        const passwordMatch = await bcrypt.compare(input.password, user.passwordHash);
        if (!passwordMatch) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid credentials" });
        }

        return { success: true, userId: user.id, username: user.username };
      }),
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
