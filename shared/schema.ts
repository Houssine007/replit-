import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("employee"), // admin, manager, employee
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Skills/Competencies table
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(), // technique, managériale, comportementale, transversale
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Positions/Jobs table
export const positions = pgTable("positions", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  department: varchar("department", { length: 100 }),
  level: varchar("level", { length: 50 }), // junior, senior, expert
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Employees table
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  positionId: integer("position_id").references(() => positions.id),
  department: varchar("department", { length: 100 }),
  hireDate: timestamp("hire_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Skills required for positions
export const positionSkills = pgTable("position_skills", {
  id: serial("id").primaryKey(),
  positionId: integer("position_id").references(() => positions.id),
  skillId: integer("skill_id").references(() => skills.id),
  requiredLevel: integer("required_level").notNull(), // 1-5 scale
  createdAt: timestamp("created_at").defaultNow(),
});

// Employee skill evaluations
export const employeeSkills = pgTable("employee_skills", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id),
  skillId: integer("skill_id").references(() => skills.id),
  currentLevel: integer("current_level").notNull(), // 1-5 scale
  evaluatedBy: varchar("evaluated_by").references(() => users.id),
  evaluationDate: timestamp("evaluation_date").defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  employees: many(employees),
}));

export const skillsRelations = relations(skills, ({ many }) => ({
  positionSkills: many(positionSkills),
  employeeSkills: many(employeeSkills),
}));

export const positionsRelations = relations(positions, ({ many, one }) => ({
  employees: many(employees),
  positionSkills: many(positionSkills),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  user: one(users, {
    fields: [employees.userId],
    references: [users.id],
  }),
  position: one(positions, {
    fields: [employees.positionId],
    references: [positions.id],
  }),
  employeeSkills: many(employeeSkills),
}));

export const positionSkillsRelations = relations(positionSkills, ({ one }) => ({
  position: one(positions, {
    fields: [positionSkills.positionId],
    references: [positions.id],
  }),
  skill: one(skills, {
    fields: [positionSkills.skillId],
    references: [skills.id],
  }),
}));

export const employeeSkillsRelations = relations(employeeSkills, ({ one }) => ({
  employee: one(employees, {
    fields: [employeeSkills.employeeId],
    references: [employees.id],
  }),
  skill: one(skills, {
    fields: [employeeSkills.skillId],
    references: [skills.id],
  }),
  evaluator: one(users, {
    fields: [employeeSkills.evaluatedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertSkillSchema = createInsertSchema(skills).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPositionSchema = createInsertSchema(positions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPositionSkillSchema = createInsertSchema(positionSkills).omit({
  id: true,
  createdAt: true,
});

export const insertEmployeeSkillSchema = createInsertSchema(employeeSkills).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Skill = typeof skills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Position = typeof positions.$inferSelect;
export type InsertPosition = z.infer<typeof insertPositionSchema>;
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type PositionSkill = typeof positionSkills.$inferSelect;
export type InsertPositionSkill = z.infer<typeof insertPositionSkillSchema>;
export type EmployeeSkill = typeof employeeSkills.$inferSelect;
export type InsertEmployeeSkill = z.infer<typeof insertEmployeeSkillSchema>;
