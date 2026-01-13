
import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const snippets = pgTable("snippets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  code: text("code").notNull(),
  output: text("output"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSnippetSchema = createInsertSchema(snippets).omit({ 
  id: true, 
  createdAt: true,
  output: true 
});

export type Snippet = typeof snippets.$inferSelect;
export type InsertSnippet = z.infer<typeof insertSnippetSchema>;

export type CompileRequest = {
  code: string;
};

export type CompileResponse = {
  success: boolean;
  output: string;
  error?: string;
};

export type DecompileResponse = {
  success: boolean;
  source: string;
  error?: string;
};
