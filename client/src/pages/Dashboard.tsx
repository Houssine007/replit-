import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Brain, ClipboardCheck, TrendingUp, ArrowUpRight, Clock, AlertTriangle, Download } from "lucide-react";
import SkillLevel from "@/components/SkillLevel";
import type { DashboardStats, SkillsMatrixRow, SkillGap } from "@/types";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: skillsMatrix, isLoading: matrixLoading } = useQuery<SkillsMatrixRow[]>({
    queryKey: ["/api/dashboard/skills-matrix"],
  });

  const { data: skillGaps, isLoading: gapsLoading } = useQuery<SkillGap[]>({
    queryKey: ["/api/dashboard/skill-gaps"],
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "technique":
        return "bg-blue-500";
      case "managériale":
        return "bg-orange-500";
      case "comportementale":
        return "bg-green-500";
      case "transversale":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

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

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Tableau de Bord GPEC</h1>
        <p className="text-muted-foreground">Vue d'ensemble de la gestion des compétences et des ressources humaines</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-material">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Employés</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-foreground mt-1">{stats?.totalEmployees || 0}</p>
                )}
                <div className="flex items-center mt-2">
                  <span className="text-sm text-green-600 font-medium flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +5.2%
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">vs mois dernier</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-material">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compétences Référencées</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-foreground mt-1">{stats?.totalSkills || 0}</p>
                )}
                <div className="flex items-center mt-2">
                  <span className="text-sm text-green-600 font-medium flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +3
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">cette semaine</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Brain className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-material">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Évaluations en Cours</p>
                <p className="text-3xl font-bold text-foreground mt-1">23</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-yellow-600 font-medium flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    À traiter
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ClipboardCheck className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-material">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Écarts Détectés</p>
                {gapsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-foreground mt-1">{skillGaps?.length || 0}</p>
                )}
                <div className="flex items-center mt-2">
                  <span className="text-sm text-red-600 font-medium flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Urgents
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skills Overview */}
        <Card className="lg:col-span-2 shadow-material">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Répartition des Compétences par Catégorie</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">7 jours</Button>
                <Button variant="ghost" size="sm">30 jours</Button>
                <Button variant="ghost" size="sm">6 mois</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-2 w-32" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {stats?.skillCategories.map((category) => {
                  const percentage = stats.totalSkills > 0 ? (category.count / stats.totalSkills) * 100 : 0;
                  return (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getCategoryColor(category.category)}`} />
                        <span className="text-sm font-medium text-foreground capitalize">
                          Compétences {category.category}s
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Progress value={percentage} className="w-32" />
                        <span className="text-sm font-medium text-foreground w-8">{category.count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-material">
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">Sophie Martin</span> a complété son évaluation de compétences
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Il y a 2 heures</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <ClipboardCheck className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">Jean Dupont</span> a été assigné au poste de Développeur Senior
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Il y a 4 heures</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    Écart de compétence détecté pour le poste <span className="font-medium">Chef de Projet</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Il y a 6 heures</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Brain className="h-4 w-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    Nouvelle compétence <span className="font-medium">"Intelligence Artificielle"</span> ajoutée au référentiel
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Hier</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <Button variant="ghost" className="w-full text-center text-sm font-medium">
                Voir toutes les activités
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills Matrix Preview */}
      <Card className="shadow-material">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Matrice de Compétences - Aperçu</CardTitle>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
          <CardDescription>
            Aperçu des compétences de l'équipe développement
          </CardDescription>
        </CardHeader>
        <CardContent>
          {matrixLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="space-y-3">
                {skillsMatrix?.slice(0, 3).map((row, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {row.employeeName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{row.employeeName}</p>
                        <p className="text-sm text-muted-foreground">{row.positionTitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-muted-foreground">{row.skillName}</div>
                      <SkillLevel level={row.currentLevel} />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
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
                <Button variant="ghost">
                  Voir la matrice complète →
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gap Analysis */}
      <Card className="shadow-material">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Analyse des Écarts de Compétences</CardTitle>
            <Button variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Générer Rapport
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {gapsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {skillGaps?.slice(0, 3).map((gap, index) => (
                <div key={index} className="border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium text-foreground">{gap.positionTitle}</h3>
                        <Badge variant={getGapColor(gap.gap) as "default" | "secondary" | "destructive"}>
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Écart {getGapSeverity(gap.gap)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Département: {gap.department}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">Compétence manquante:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-red-700 border-red-200 bg-red-50">
                            {gap.skillName} (Niveau {gap.requiredLevel} requis, {gap.averageCurrentLevel.toFixed(1)} actuel)
                          </Badge>
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
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">{skillGaps?.length || 0} écarts</span> détectés
            </p>
            <Button variant="ghost">
              Voir tous les écarts →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
