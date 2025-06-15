import {
  users,
  skills,
  positions,
  employees,
  positionSkills,
  employeeSkills,
  type User,
  type UpsertUser,
  type Skill,
  type InsertSkill,
  type Position,
  type InsertPosition,
  type Employee,
  type InsertEmployee,
  type PositionSkill,
  type InsertPositionSkill,
  type EmployeeSkill,
  type InsertEmployeeSkill,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Skills operations
  getSkills(): Promise<Skill[]>;
  getSkill(id: number): Promise<Skill | undefined>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: number, skill: Partial<InsertSkill>): Promise<Skill>;
  deleteSkill(id: number): Promise<void>;
  
  // Positions operations
  getPositions(): Promise<Position[]>;
  getPosition(id: number): Promise<Position | undefined>;
  createPosition(position: InsertPosition): Promise<Position>;
  updatePosition(id: number, position: Partial<InsertPosition>): Promise<Position>;
  deletePosition(id: number): Promise<void>;
  
  // Employees operations
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee>;
  deleteEmployee(id: number): Promise<void>;
  
  // Position skills operations
  getPositionSkills(positionId: number): Promise<PositionSkill[]>;
  createPositionSkill(positionSkill: InsertPositionSkill): Promise<PositionSkill>;
  deletePositionSkill(positionId: number, skillId: number): Promise<void>;
  
  // Employee skills operations
  getEmployeeSkills(employeeId: number): Promise<EmployeeSkill[]>;
  createEmployeeSkill(employeeSkill: InsertEmployeeSkill): Promise<EmployeeSkill>;
  updateEmployeeSkill(id: number, employeeSkill: Partial<InsertEmployeeSkill>): Promise<EmployeeSkill>;
  deleteEmployeeSkill(id: number): Promise<void>;
  
  // Analytics operations
  getSkillsMatrix(): Promise<any[]>;
  getSkillGaps(): Promise<any[]>;
  getDashboardStats(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations - mandatory for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Skills operations
  async getSkills(): Promise<Skill[]> {
    return await db.select().from(skills).orderBy(desc(skills.createdAt));
  }

  async getSkill(id: number): Promise<Skill | undefined> {
    const [skill] = await db.select().from(skills).where(eq(skills.id, id));
    return skill;
  }

  async createSkill(skill: InsertSkill): Promise<Skill> {
    const [newSkill] = await db.insert(skills).values(skill).returning();
    return newSkill;
  }

  async updateSkill(id: number, skill: Partial<InsertSkill>): Promise<Skill> {
    const [updatedSkill] = await db
      .update(skills)
      .set({ ...skill, updatedAt: new Date() })
      .where(eq(skills.id, id))
      .returning();
    return updatedSkill;
  }

  async deleteSkill(id: number): Promise<void> {
    await db.delete(skills).where(eq(skills.id, id));
  }

  // Positions operations
  async getPositions(): Promise<Position[]> {
    return await db.select().from(positions).orderBy(desc(positions.createdAt));
  }

  async getPosition(id: number): Promise<Position | undefined> {
    const [position] = await db.select().from(positions).where(eq(positions.id, id));
    return position;
  }

  async createPosition(position: InsertPosition): Promise<Position> {
    const [newPosition] = await db.insert(positions).values(position).returning();
    return newPosition;
  }

  async updatePosition(id: number, position: Partial<InsertPosition>): Promise<Position> {
    const [updatedPosition] = await db
      .update(positions)
      .set({ ...position, updatedAt: new Date() })
      .where(eq(positions.id, id))
      .returning();
    return updatedPosition;
  }

  async deletePosition(id: number): Promise<void> {
    await db.delete(positions).where(eq(positions.id, id));
  }

  // Employees operations
  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(employees).orderBy(desc(employees.createdAt));
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee;
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [newEmployee] = await db.insert(employees).values(employee).returning();
    return newEmployee;
  }

  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee> {
    const [updatedEmployee] = await db
      .update(employees)
      .set({ ...employee, updatedAt: new Date() })
      .where(eq(employees.id, id))
      .returning();
    return updatedEmployee;
  }

  async deleteEmployee(id: number): Promise<void> {
    await db.delete(employees).where(eq(employees.id, id));
  }

  // Position skills operations
  async getPositionSkills(positionId: number): Promise<PositionSkill[]> {
    return await db.select().from(positionSkills).where(eq(positionSkills.positionId, positionId));
  }

  async createPositionSkill(positionSkill: InsertPositionSkill): Promise<PositionSkill> {
    const [newPositionSkill] = await db.insert(positionSkills).values(positionSkill).returning();
    return newPositionSkill;
  }

  async deletePositionSkill(positionId: number, skillId: number): Promise<void> {
    await db.delete(positionSkills).where(
      and(
        eq(positionSkills.positionId, positionId),
        eq(positionSkills.skillId, skillId)
      )
    );
  }

  // Employee skills operations
  async getEmployeeSkills(employeeId: number): Promise<EmployeeSkill[]> {
    return await db.select().from(employeeSkills).where(eq(employeeSkills.employeeId, employeeId));
  }

  async createEmployeeSkill(employeeSkill: InsertEmployeeSkill): Promise<EmployeeSkill> {
    const [newEmployeeSkill] = await db.insert(employeeSkills).values(employeeSkill).returning();
    return newEmployeeSkill;
  }

  async updateEmployeeSkill(id: number, employeeSkill: Partial<InsertEmployeeSkill>): Promise<EmployeeSkill> {
    const [updatedEmployeeSkill] = await db
      .update(employeeSkills)
      .set({ ...employeeSkill, updatedAt: new Date() })
      .where(eq(employeeSkills.id, id))
      .returning();
    return updatedEmployeeSkill;
  }

  async deleteEmployeeSkill(id: number): Promise<void> {
    await db.delete(employeeSkills).where(eq(employeeSkills.id, id));
  }

  // Analytics operations
  async getSkillsMatrix(): Promise<any[]> {
    const result = await db
      .select({
        employeeId: employees.id,
        employeeName: sql<string>`${employees.firstName} || ' ' || ${employees.lastName}`,
        positionTitle: positions.title,
        skillName: skills.name,
        skillCategory: skills.category,
        currentLevel: employeeSkills.currentLevel,
        requiredLevel: positionSkills.requiredLevel,
      })
      .from(employees)
      .leftJoin(positions, eq(employees.positionId, positions.id))
      .leftJoin(employeeSkills, eq(employees.id, employeeSkills.employeeId))
      .leftJoin(skills, eq(employeeSkills.skillId, skills.id))
      .leftJoin(positionSkills, and(
        eq(positions.id, positionSkills.positionId),
        eq(skills.id, positionSkills.skillId)
      ))
      .where(eq(employees.isActive, true));

    return result;
  }

  async getSkillGaps(): Promise<any[]> {
    const result = await db
      .select({
        positionId: positions.id,
        positionTitle: positions.title,
        department: positions.department,
        skillName: skills.name,
        skillCategory: skills.category,
        requiredLevel: positionSkills.requiredLevel,
        averageCurrentLevel: sql<number>`COALESCE(AVG(${employeeSkills.currentLevel}), 0)`,
        gap: sql<number>`${positionSkills.requiredLevel} - COALESCE(AVG(${employeeSkills.currentLevel}), 0)`,
      })
      .from(positions)
      .innerJoin(positionSkills, eq(positions.id, positionSkills.positionId))
      .innerJoin(skills, eq(positionSkills.skillId, skills.id))
      .leftJoin(employees, eq(positions.id, employees.positionId))
      .leftJoin(employeeSkills, and(
        eq(employees.id, employeeSkills.employeeId),
        eq(skills.id, employeeSkills.skillId)
      ))
      .groupBy(positions.id, positions.title, positions.department, skills.name, skills.category, positionSkills.requiredLevel)
      .having(sql`${positionSkills.requiredLevel} - COALESCE(AVG(${employeeSkills.currentLevel}), 0) > 0`);

    return result;
  }

  async getDashboardStats(): Promise<any> {
    const [employeeCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(employees)
      .where(eq(employees.isActive, true));

    const [skillCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(skills);

    const [positionCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(positions);

    const skillCategories = await db
      .select({
        category: skills.category,
        count: sql<number>`count(*)`,
      })
      .from(skills)
      .groupBy(skills.category);

    return {
      totalEmployees: employeeCount.count,
      totalSkills: skillCount.count,
      totalPositions: positionCount.count,
      skillCategories,
    };
  }
}

export const storage = new DatabaseStorage();
