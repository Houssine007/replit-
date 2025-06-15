export interface DashboardStats {
  totalEmployees: number;
  totalSkills: number;
  totalPositions: number;
  skillCategories: Array<{
    category: string;
    count: number;
  }>;
}

export interface SkillsMatrixRow {
  employeeId: number;
  employeeName: string;
  positionTitle: string;
  skillName: string;
  skillCategory: string;
  currentLevel: number;
  requiredLevel: number;
}

export interface SkillGap {
  positionId: number;
  positionTitle: string;
  department: string;
  skillName: string;
  skillCategory: string;
  requiredLevel: number;
  averageCurrentLevel: number;
  gap: number;
}

export type SkillCategory = 'technique' | 'managériale' | 'comportementale' | 'transversale';

export interface SkillFormData {
  name: string;
  description?: string;
  category: SkillCategory;
}

export interface PositionFormData {
  title: string;
  description?: string;
  department?: string;
  level?: string;
}

export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email?: string;
  positionId?: number;
  department?: string;
  hireDate?: Date;
}
