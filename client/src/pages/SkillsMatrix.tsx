import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Download, Grid3X3, Filter } from "lucide-react";
import SkillLevel from "@/components/SkillLevel";
import type { SkillsMatrixRow } from "@/types";
import type { Employee, Position } from "@shared/schema";

export default function SkillsMatrix() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedPosition, setSelectedPosition] = useState<string>("all");

  const { data: matrixData, isLoading: matrixLoading } = useQuery<SkillsMatrixRow[]>({
    queryKey: ["/api/dashboard/skills-matrix"],
  });

  const { data: employees } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const { data: positions } = useQuery<Position[]>({
    queryKey: ["/api/positions"],
  });

  // Process matrix data to group by employee and skills
  const processedMatrix = () => {
    if (!matrixData) return [];

    const employeeMap = new Map();
    
    matrixData.forEach(row => {
      if (!employeeMap.has(row.employeeId)) {
        employeeMap.set(row.employeeId, {
          employeeId: row.employeeId,
          employeeName: row.employeeName,
          positionTitle: row.positionTitle,
          skills: new Map()
        });
      }
      
      const employee = employeeMap.get(row.employeeId);
      if (row.skillName && row.currentLevel !== null) {
        employee.skills.set(row.skillName, {
          currentLevel: row.currentLevel,
          requiredLevel: row.requiredLevel,
          category: row.skillCategory
        });
      }
    });

    return Array.from(employeeMap.values());
  };

  // Get unique skills for table headers
  const getUniqueSkills = () => {
    if (!matrixData) return [];
    
    const skillsSet = new Set();
    matrixData.forEach(row => {
      if (row.skillName) {
        skillsSet.add(row.skillName);
      }
    });
    
    return Array.from(skillsSet) as string[];
  };

  // Get unique departments
  const getDepartments = () => {
    if (!employees) return [];
    const departments = new Set(employees.map(emp => emp.department).filter(Boolean));
    return Array.from(departments) as string[];
  };

  // Filter data based on selections
  const filteredMatrix = processedMatrix().filter(employee => {
    if (selectedDepartment !== "all") {
      const emp = employees?.find(e => e.id === employee.employeeId);
      if (emp?.department !== selectedDepartment) return false;
    }
    
    if (selectedPosition !== "all") {
      if (employee.positionTitle !== selectedPosition) return false;
    }
    
    return true;
  });

  const uniqueSkills = getUniqueSkills();
  const departments = getDepartments();
  const uniquePositions = Array.from(new Set(matrixData?.map(row => row.positionTitle).filter(Boolean))) as string[];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ['Employé', 'Poste', ...uniqueSkills];
    const csvContent = [
      headers.join(','),
      ...filteredMatrix.map(employee => [
        `"${employee.employeeName}"`,
        `"${employee.positionTitle || ''}"`,
        ...uniqueSkills.map(skill => {
          const skillData = employee.skills.get(skill);
          return skillData ? skillData.currentLevel : '0';
        })
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `matrice-competences-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Matrice de Compétences</h1>
          <p className="text-muted-foreground">Visualisez les niveaux de compétences de vos équipes</p>
        </div>
        <Button onClick={handleExport} disabled={matrixLoading}>
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-material">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Filtres</CardTitle>
          </div>
          <CardDescription>
            Filtrez la matrice par département ou poste
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Département
              </label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les départements" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les départements</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Poste
              </label>
              <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les postes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les postes</SelectItem>
                  {uniquePositions.map(position => (
                    <SelectItem key={position} value={position}>{position}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedDepartment("all");
                  setSelectedPosition("all");
                }}
              >
                Réinitialiser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matrix */}
      <Card className="shadow-material">
        <CardHeader>
          <CardTitle>Matrice des Compétences</CardTitle>
          <CardDescription>
            {filteredMatrix.length} employé{filteredMatrix.length > 1 ? "s" : ""} affiché{filteredMatrix.length > 1 ? "s" : ""}
            {uniqueSkills.length > 0 && ` • ${uniqueSkills.length} compétence${uniqueSkills.length > 1 ? "s" : ""}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {matrixLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredMatrix.length === 0 ? (
            <div className="text-center py-12">
              <Grid3X3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Aucune donnée de matrice
              </h3>
              <p className="text-muted-foreground">
                Aucun employé trouvé avec les filtres sélectionnés ou aucune évaluation de compétences disponible.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground min-w-[200px]">
                      Employé
                    </th>
                    {uniqueSkills.map(skill => (
                      <th key={skill} className="text-center py-3 px-4 font-medium text-muted-foreground min-w-[100px]">
                        <div className="truncate" title={skill}>
                          {skill}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredMatrix.map((employee) => (
                    <tr key={employee.employeeId} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(employee.employeeName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{employee.employeeName}</p>
                            <p className="text-sm text-muted-foreground">{employee.positionTitle}</p>
                          </div>
                        </div>
                      </td>
                      {uniqueSkills.map(skill => {
                        const skillData = employee.skills.get(skill);
                        return (
                          <td key={skill} className="py-3 px-4 text-center">
                            {skillData ? (
                              <div className="flex flex-col items-center space-y-1">
                                <SkillLevel level={skillData.currentLevel} size="sm" />
                                {skillData.requiredLevel && skillData.currentLevel < skillData.requiredLevel && (
                                  <Badge variant="outline" className="text-xs px-1 py-0">
                                    Req: {skillData.requiredLevel}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Legend */}
          {!matrixLoading && filteredMatrix.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-100 rounded-full" />
                    <span>Niveau 1-2 (Débutant)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-100 rounded-full" />
                    <span>Niveau 3 (Intermédiaire)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-100 rounded-full" />
                    <span>Niveau 4-5 (Expert)</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  "Req" indique le niveau requis pour le poste
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
