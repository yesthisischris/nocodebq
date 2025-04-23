import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const queries = pgTable("queries", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  sql: text("sql").notNull(),
  projectId: text("project_id").notNull(),
  dataset: text("dataset").notNull(),
  processingGb: text("processing_gb"),
  summary: text("summary"),
  results: jsonb("results"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertQuerySchema = createInsertSchema(queries).pick({
  prompt: true,
  sql: true,
  projectId: true,
  dataset: true,
  processingGb: true,
  summary: true,
  results: true,
});

export type InsertQuery = z.infer<typeof insertQuerySchema>;
export type Query = typeof queries.$inferSelect;

// Schema for prompt request
export const promptSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  projectId: z.string().min(1, "Project ID is required"),
  dataset: z.string().min(1, "Dataset is required"),
});

export type PromptRequest = z.infer<typeof promptSchema>;

// Schema for validation request
export const validationSchema = z.object({
  sql: z.string().min(1, "SQL is required"),
  projectId: z.string().min(1, "Project ID is required"),
  dataset: z.string().min(1, "Dataset is required"),
});

export type ValidationRequest = z.infer<typeof validationSchema>;

// Schema for execution request
export const executionSchema = z.object({
  sql: z.string().min(1, "SQL is required"),
  projectId: z.string().min(1, "Project ID is required"),
  dataset: z.string().min(1, "Dataset is required"),
});

export type ExecutionRequest = z.infer<typeof executionSchema>;
