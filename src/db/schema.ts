import { integer, pgTable, varchar, text, timestamp, boolean } from "drizzle-orm/pg-core";

// Users table - stores authentication and basic user info
export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer(), // Made optional - not required for all users
  email: varchar({ length: 255 }).notNull().unique(),
  emailVerified: timestamp(),
  password: varchar({ length: 255 }), // Hashed password for credentials provider
  image: text(), // Changed to text() to support base64 images
  role: varchar({ length: 20 }).default("client").notNull(), // "client" or "manager"
  approved: boolean().default(false).notNull(), // Whether the user is approved by manager (managers are always approved)
  subscriptionExpires: timestamp(), // When the client's subscription expires
  wodEnabled: boolean().default(false).notNull(), // Whether WOD is enabled for this user
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const profiles = pgTable("profiles", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().references(() => users.id).notNull(),
  name: varchar({ length: 255 }),
  email: varchar({ length: 255 }),
  phone: varchar({ length: 50 }),
  dateOfBirth: timestamp(), // Date of birth to calculate age
  goals: text(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const personalRecords = pgTable("personal_records", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().references(() => users.id).notNull(),
  exercise: varchar({ length: 255 }).notNull(),
  weight: varchar({ length: 50 }).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const reservations = pgTable("reservations", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().references(() => users.id).notNull(),
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

// Workout of the Day (WOD) table
export const workoutOfDay = pgTable("workout_of_day", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  date: timestamp().notNull().unique(), // Date for the workout (one per day)
  title: varchar({ length: 255 }).notNull(), // WOD title
  description: text().notNull(), // Full WOD description
  createdBy: integer().references(() => users.id).notNull(), // Manager who created it
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

// Class attendees - for managers to add users to specific classes
export const classAttendees = pgTable("class_attendees", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().references(() => users.id).notNull(),
  reservationId: integer().references(() => reservations.id), // Optional: link to reservation
  day: varchar({ length: 20 }).notNull(),
  time: varchar({ length: 20 }).notNull(),
  date: timestamp().notNull(),
  addedBy: integer().references(() => users.id).notNull(), // Manager who added the user
  createdAt: timestamp().defaultNow().notNull(),
});
