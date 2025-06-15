import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, AlertTriangle, BarChart3, Users, FileText, Filter, ArrowUp, ArrowDown } from "lucide-react";
import type { SkillGap, DashboardStats } from "@/types";
import type { Employee, Position } from "@shared/schema";

export default function Analysis() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");

  const { data: skillGaps, isLoading: gapsLoading } = useQuery<SkillGap[]>({
    queryKey: ["/api/dashboard/skill-gaps"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: employees } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const { data: positions } = useQuery<Position[]>({
    queryKey: ["/api/positions"],
  });

  // Get unique departments
  const getDepartments = () => {
    if (!skillGaps) return [];
    const departments = new Set(skillGaps.map(gap => gap.department).filter(Boolean));
    return Array.from(departments) as string[];
  };

  // Get gap severity
  const getGapSeverity = (gap: number) => {
    if (gap >= 2) return "Critique";
    if (gap >= 1) return "Modéré";
    return "Faible";
  };

  const getGapColor = (gap: number) => {
    if (gap >= 2) return "destructive";
    if (gap >= 1) return "secondary";
    return "default";
  };

  const getGapIcon = (gap: number) => {
    if (gap >= 2) return AlertTriangle;
    if (gap >= 1) return TrendingUp;
    return BarChart3;
  };

  // Filter gaps based on selections
  const filteredGaps = skillGaps?.filter(gap => {
    if (selectedDepartment !== "all" && gap.department !== selectedDepartment) {
      return false;
    }
    
    if (selectedSeverity !== "all") {
      const severity = getGapSeverity(gap.gap);
      if (severity.toLowerCase() !== selectedSeverity) {
        return false;
      }
    }
    
    return true;
  }) || [];

  // Calculate analytics
  const getAnalytics = () => {
    if (!skillGaps) return null;

    const totalGaps = skillGaps.length;
    const criticalGaps = skillGaps.filter(gap => gap.gap >= 2).length;
    const moderateGaps = skillGaps.filter(gap => gap.gap >= 1 && gap.gap < 2).length;
    
    const gapsByDepartment = skillGaps.reduce((acc, gap) => {
      const dept = gap.department || "Non défini";
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const gapsBySkill = skillGaps.reduce((acc, gap) => {
      acc[gap.skillName] = (acc[gap.skillName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topSkillGaps = Object.entries(gapsBySkill)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const averageGap = skillGaps.reduce((sum, gap) => sum + gap.gap, 0) / totalGaps;

    return {
      totalGaps,
      criticalGaps,
      moderateGaps,
      gapsByDepartment,
      topSkillGaps,
      averageGap
    };
  };

  const analytics = getAnalytics();
  const departments = getDepartments();

  const handleGenerateReport = () => {
    // Create detailed report content
    const reportContent = [
      "# Rapport d'Analyse des Écarts de Compétences",
      `Généré le: ${new Date().toLocaleDateString('fr-FR')}`,
      "",
      "## Résumé Exécutif",
      `- Nombre total d'écarts détectés: ${analytics?.totalGaps || 0}`,
      `- Écarts critiques (≥2): ${analytics?.criticalGaps || 0}`,
      `- Écarts modérés (1-2): ${analytics?.moderateGaps || 0}`,
      `- Écart moyen: ${analytics?.averageGap?.toFixed(2) || 0}`,
      "",
      "## Écarts par Compétence",
      ...(analytics?.topSkillGaps || []).map(([skill, count]) => `- ${skill}: ${count} écart(s)`),
      "",
      "## Détail des Écarts",
      ...filteredGaps.map(gap => 
        `### ${gap.positionTitle} - ${gap.department}\n` +
        `- Compétence: ${gap.skillName}\n` +
        `- Niveau requis: ${gap.requiredLevel}\n` +
        `- Niveau actuel moyen: ${gap.averageCurrentLevel.toFixed(1)}\n` +
        `- Écart: ${gap.gap.toFixed(1)}\n`
      )
    ].join('\n');

    // Download as text file
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `rapport-ecarts-competences-${new Date().toISOString().split('T')[0]}.txt`);
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
          <h1 className="text-2xl font-bold text-foreground">Analyse des Écarts</h1>
          <p className="text-muted-foreground">Analysez les écarts de compétences et générez des rapports</p>
        </div>
        <Button onClick={handleGenerateReport} disabled={gapsLoading}>
          <FileText className="h-4 w-4 mr-2" />
          Générer Rapport
        </Button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-material">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Écarts</p>
                {gapsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-foreground mt-1">{analytics?.totalGaps || 0}</p>
                )}
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-material">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Écarts Critiques</p>
                {gapsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-foreground mt-1">{analytics?.criticalGaps || 0}</p>
                )}
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-material">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Écarts Modérés</p>
                {gapsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-foreground mt-1">{analytics?.moderateGaps || 0}</p>
                )}
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-material">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Écart Moyen</p>
                {gapsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {analytics?.averageGap?.toFixed(1) || "0.0"}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Skills with Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-material">
          <CardHeader>
            <CardTitle>Compétences les Plus Problématiques</CardTitle>
            <CardDescription>
              Top 5 des compétences avec le plus d'écarts détectés
            </CardDescription>
          </CardHeader>
          <CardContent>
            {gapsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {analytics?.topSkillGaps.map(([skill, count], index) => (
                  <div key={skill} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">{index + 1}</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">{skill}</span>
                    </div>
                    <Badge variant="outline">{count} écart{count > 1 ? "s" : ""}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-material">
          <CardHeader>
            <CardTitle>Répartition par Département</CardTitle>
            <CardDescription>
              Distribution des écarts de compétences par département
            </CardDescription>
          </CardHeader>
          <CardContent>
            {gapsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-2 w-32" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(analytics?.gapsByDepartment || {}).map(([dept, count]) => {
                  const percentage = analytics ? (count / analytics.totalGaps) * 100 : 0;
                  return (
                    <div key={dept} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{dept}</span>
                      <div className="flex items-center space-x-4">
                        <Progress value={percentage} className="w-32" />
                        <span className="text-sm font-medium text-foreground w-8">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-material">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Filtres</CardTitle>
          </div>
          <CardDescription>
            Filtrez les écarts par département ou niveau de sévérité
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
                Sévérité
              </label>
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les sévérités" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les sévérités</SelectItem>
                  <SelectItem value="critique">Critique (≥2)</SelectItem>
                  <SelectItem value="modéré">Modéré (1-2)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedDepartment("all");
                  setSelectedSeverity("all");
                }}
              >
                Réinitialiser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Gap Analysis */}
      <Card className="shadow-material">
        <CardHeader>
          <CardTitle>Détail des Écarts de Compétences</CardTitle>
          <CardDescription>
            {filteredGaps.length} écart{filteredGaps.length > 1 ? "s" : ""} trouvé{filteredGaps.length > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {gapsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : filteredGaps.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Aucun écart trouvé
              </h3>
              <p className="text-muted-foreground">
                {selectedDepartment !== "all" || selectedSeverity !== "all" 
                  ? "Aucun écart ne correspond aux filtres sélectionnés."
                  : "Félicitations ! Aucun écart de compétences détecté."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGaps.map((gap, index) => {
                const IconComponent = getGapIcon(gap.gap);
                const severity = getGapSeverity(gap.gap);
                return (
                  <div key={index} className="border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-foreground">{gap.positionTitle}</h3>
                          <Badge variant={getGapColor(gap.gap) as "default" | "secondary" | "destructive"}>
                            <IconComponent className="h-3 w-3 mr-1" />
                            Écart {severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Département: {gap.department}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-foreground">Compétence:</span>
                            <p className="text-muted-foreground">{gap.skillName}</p>
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Niveau Requis:</span>
                            <p className="text-muted-foreground">{gap.requiredLevel}</p>
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Niveau Actuel:</span>
                            <p className="text-muted-foreground">{gap.averageCurrentLevel.toFixed(1)}</p>
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Écart:</span>
                            <p className="text-destructive font-medium">{gap.gap.toFixed(1)}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Button variant="outline" size="sm">
                          Voir Candidats
                        </Button>
                        <Button variant="outline" size="sm">
                          Planifier Formation
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
