import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertSkillSchema, insertPositionSchema, insertEmployeeSchema, insertPositionSkillSchema, insertEmployeeSkillSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get('/api/dashboard/skills-matrix', isAuthenticated, async (req, res) => {
    try {
      const matrix = await storage.getSkillsMatrix();
      res.json(matrix);
    } catch (error) {
      console.error("Error fetching skills matrix:", error);
      res.status(500).json({ message: "Failed to fetch skills matrix" });
    }
  });

  app.get('/api/dashboard/skill-gaps', isAuthenticated, async (req, res) => {
    try {
      const gaps = await storage.getSkillGaps();
      res.json(gaps);
    } catch (error) {
      console.error("Error fetching skill gaps:", error);
      res.status(500).json({ message: "Failed to fetch skill gaps" });
    }
  });

  // Skills routes
  app.get('/api/skills', isAuthenticated, async (req, res) => {
    try {
      const skills = await storage.getSkills();
      res.json(skills);
    } catch (error) {
      console.error("Error fetching skills:", error);
      res.status(500).json({ message: "Failed to fetch skills" });
    }
  });

  app.get('/api/skills/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const skill = await storage.getSkill(id);
      if (!skill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      res.json(skill);
    } catch (error) {
      console.error("Error fetching skill:", error);
      res.status(500).json({ message: "Failed to fetch skill" });
    }
  });

  app.post('/api/skills', isAuthenticated, async (req, res) => {
    try {
      const skillData = insertSkillSchema.parse(req.body);
      const skill = await storage.createSkill(skillData);
      res.status(201).json(skill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid skill data", errors: error.errors });
      }
      console.error("Error creating skill:", error);
      res.status(500).json({ message: "Failed to create skill" });
    }
  });

  app.put('/api/skills/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const skillData = insertSkillSchema.partial().parse(req.body);
      const skill = await storage.updateSkill(id, skillData);
      res.json(skill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid skill data", errors: error.errors });
      }
      console.error("Error updating skill:", error);
      res.status(500).json({ message: "Failed to update skill" });
    }
  });

  app.delete('/api/skills/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSkill(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting skill:", error);
      res.status(500).json({ message: "Failed to delete skill" });
    }
  });

  // Positions routes
  app.get('/api/positions', isAuthenticated, async (req, res) => {
    try {
      const positions = await storage.getPositions();
      res.json(positions);
    } catch (error) {
      console.error("Error fetching positions:", error);
      res.status(500).json({ message: "Failed to fetch positions" });
    }
  });

  app.get('/api/positions/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const position = await storage.getPosition(id);
      if (!position) {
        return res.status(404).json({ message: "Position not found" });
      }
      res.json(position);
    } catch (error) {
      console.error("Error fetching position:", error);
      res.status(500).json({ message: "Failed to fetch position" });
    }
  });

  app.post('/api/positions', isAuthenticated, async (req, res) => {
    try {
      const positionData = insertPositionSchema.parse(req.body);
      const position = await storage.createPosition(positionData);
      res.status(201).json(position);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid position data", errors: error.errors });
      }
      console.error("Error creating position:", error);
      res.status(500).json({ message: "Failed to create position" });
    }
  });

  app.put('/api/positions/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const positionData = insertPositionSchema.partial().parse(req.body);
      const position = await storage.updatePosition(id, positionData);
      res.json(position);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid position data", errors: error.errors });
      }
      console.error("Error updating position:", error);
      res.status(500).json({ message: "Failed to update position" });
    }
  });

  app.delete('/api/positions/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePosition(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting position:", error);
      res.status(500).json({ message: "Failed to delete position" });
    }
  });

  // Position skills routes
  app.get('/api/positions/:id/skills', isAuthenticated, async (req, res) => {
    try {
      const positionId = parseInt(req.params.id);
      const skills = await storage.getPositionSkills(positionId);
      res.json(skills);
    } catch (error) {
      console.error("Error fetching position skills:", error);
      res.status(500).json({ message: "Failed to fetch position skills" });
    }
  });

  app.post('/api/positions/:id/skills', isAuthenticated, async (req, res) => {
    try {
      const positionId = parseInt(req.params.id);
      const skillData = insertPositionSkillSchema.parse({ ...req.body, positionId });
      const positionSkill = await storage.createPositionSkill(skillData);
      res.status(201).json(positionSkill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid position skill data", errors: error.errors });
      }
      console.error("Error creating position skill:", error);
      res.status(500).json({ message: "Failed to create position skill" });
    }
  });

  // Employees routes
  app.get('/api/employees', isAuthenticated, async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.get('/api/employees/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const employee = await storage.getEmployee(id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      console.error("Error fetching employee:", error);
      res.status(500).json({ message: "Failed to fetch employee" });
    }
  });

  app.post('/api/employees', isAuthenticated, async (req, res) => {
    try {
      const employeeData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(employeeData);
      res.status(201).json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid employee data", errors: error.errors });
      }
      console.error("Error creating employee:", error);
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  app.put('/api/employees/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const employeeData = insertEmployeeSchema.partial().parse(req.body);
      const employee = await storage.updateEmployee(id, employeeData);
      res.json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid employee data", errors: error.errors });
      }
      console.error("Error updating employee:", error);
      res.status(500).json({ message: "Failed to update employee" });
    }
  });

  app.delete('/api/employees/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEmployee(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting employee:", error);
      res.status(500).json({ message: "Failed to delete employee" });
    }
  });

  // Employee skills routes
  app.get('/api/employees/:id/skills', isAuthenticated, async (req, res) => {
    try {
      const employeeId = parseInt(req.params.id);
      const skills = await storage.getEmployeeSkills(employeeId);
      res.json(skills);
    } catch (error) {
      console.error("Error fetching employee skills:", error);
      res.status(500).json({ message: "Failed to fetch employee skills" });
    }
  });

  app.post('/api/employees/:id/skills', isAuthenticated, async (req, res) => {
    try {
      const employeeId = parseInt(req.params.id);
      const userId = req.user?.claims?.sub;
      const skillData = insertEmployeeSkillSchema.parse({ 
        ...req.body, 
        employeeId,
        evaluatedBy: userId 
      });
      const employeeSkill = await storage.createEmployeeSkill(skillData);
      res.status(201).json(employeeSkill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid employee skill data", errors: error.errors });
      }
      console.error("Error creating employee skill:", error);
      res.status(500).json({ message: "Failed to create employee skill" });
    }
  });

  app.put('/api/employee-skills/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const skillData = insertEmployeeSkillSchema.partial().parse(req.body);
      const employeeSkill = await storage.updateEmployeeSkill(id, skillData);
      res.json(employeeSkill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid employee skill data", errors: error.errors });
      }
      console.error("Error updating employee skill:", error);
      res.status(500).json({ message: "Failed to update employee skill" });
    }
  });

  app.delete('/api/employee-skills/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEmployeeSkill(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting employee skill:", error);
      res.status(500).json({ message: "Failed to delete employee skill" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
