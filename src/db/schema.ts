import { integer, pgTable, varchar, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer(), // Made optional - not required for all users
  email: varchar({ length: 255 }).notNull().unique(),
  clerkId: varchar({ length: 255 }).unique(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const profiles = pgTable("profiles", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().references(() => users.id).notNull(),
  clerkId: varchar({ length: 255 }).notNull(),
  name: varchar({ length: 255 }),
  email: varchar({ length: 255 }),
  phone: varchar({ length: 50 }),
  goals: text(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const personalRecords = pgTable("personal_records", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().references(() => users.id).notNull(),
  clerkId: varchar({ length: 255 }).notNull(),
  exercise: varchar({ length: 255 }).notNull(),
  weight: varchar({ length: 50 }).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const reservations = pgTable("reservations", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().references(() => users.id).notNull(),
  clerkId: varchar({ length: 255 }).notNull(),
  day: varchar({ length: 20 }).notNull(),
  time: varchar({ length: 20 }).notNull(),
  date: timestamp().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});

export const classSlots = pgTable("class_slots", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  day: varchar({ length: 20 }).notNull(),
  time: varchar({ length: 20 }).notNull(),
  capacity: integer().default(14).notNull(), // Maximum capacity for this slot (14 people)
  available: boolean().default(true).notNull(), // Whether this slot is available
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});
