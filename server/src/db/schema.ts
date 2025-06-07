
import { serial, text, pgTable, timestamp, boolean } from 'drizzle-orm/pg-core';

export const tasksTable = pgTable('tasks', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  deadline: timestamp('deadline').notNull(),
  completed: boolean('completed').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// TypeScript type for the table schema
export type Task = typeof tasksTable.$inferSelect;
export type NewTask = typeof tasksTable.$inferInsert;

// Export all tables for proper query building
export const tables = { tasks: tasksTable };
