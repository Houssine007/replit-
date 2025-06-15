import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Edit, Trash2, Briefcase, Building, Users } from "lucide-react";
import PositionForm from "@/components/PositionForm";
import type { Position, Employee } from "@shared/schema";

export default function Positions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: positions, isLoading: positionsLoading } = useQuery<Position[]>({
    queryKey: ["/api/positions"],
  });

  const { data: employees } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (positionId: number) => {
      await apiRequest("DELETE", `/api/positions/${positionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/positions"] });
      toast({
        title: "Succès",
        description: "Poste supprimé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression du poste",
        variant: "destructive",
      });
    },
  });

  const filteredPositions = positions?.filter(position =>
    position.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    position.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    position.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    position.level?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getLevelColor = (level: string | null) => {
    switch (level?.toLowerCase()) {
      case "junior":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "senior":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "expert":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getEmployeeCount = (positionId: number) => {
    return employees?.filter(emp => emp.positionId === positionId && emp.isActive).length || 0;
  };

  const getDepartmentStats = () => {
    if (!positions) return [];
    
    const stats = positions.reduce((acc, position) => {
      const dept = position.department || "Non défini";
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(stats).map(([department, count]) => ({
      department,
      count,
      percentage: (count / positions.length) * 100,
    }));
  };

  const getLevelStats = () => {
    if (!positions) return [];
    
    const stats = positions.reduce((acc, position) => {
      const level = position.level || "Non défini";
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(stats).map(([level, count]) => ({
      level,
      count,
      percentage: (count / positions.length) * 100,
    }));
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedPosition(null);
  };

  const handleEdit = (position: Position) => {
    setSelectedPosition(position);
    setIsFormOpen(true);
  };

  const handleDelete = (positionId: number) => {
    const employeeCount = getEmployeeCount(positionId);
    if (employeeCount > 0) {
      toast({
        title: "Impossible de supprimer",
        description: `Ce poste est assigné à ${employeeCount} employé(s). Veuillez d'abord réassigner ces employés.`,
        variant: "destructive",
      });
      return;
    }
    deleteMutation.mutate(positionId);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion des Postes</h1>
          <p className="text-muted-foreground">Gérez les postes et leurs descriptions dans votre organisation</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedPosition(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Poste
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedPosition ? "Modifier le Poste" : "Nouveau Poste"}
              </DialogTitle>
            </DialogHeader>
            <PositionForm
              position={selectedPosition || undefined}
              onSuccess={handleFormSuccess}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-material">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Postes</p>
                {positionsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-foreground mt-1">{positions?.length || 0}</p>
                )}
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-material">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Départements</p>
                {positionsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {getDepartmentStats().length}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-material">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Postes Occupés</p>
                {positionsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {positions?.filter(pos => getEmployeeCount(pos.id) > 0).length || 0}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-material">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Postes Vacants</p>
                {positionsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {positions?.filter(pos => getEmployeeCount(pos.id) === 0).length || 0}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="shadow-material">
        <CardHeader>
          <CardTitle>Rechercher des Postes</CardTitle>
          <CardDescription>
            Filtrez les postes par titre, département, niveau ou description
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un poste..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Positions List */}
      <Card className="shadow-material">
        <CardHeader>
          <CardTitle>Liste des Postes</CardTitle>
          <CardDescription>
            {filteredPositions.length} poste{filteredPositions.length > 1 ? "s" : ""} trouvé{filteredPositions.length > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {positionsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-full mb-2" />
                    <div className="flex space-x-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPositions.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchQuery ? "Aucun poste trouvé" : "Aucun poste"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? "Essayez avec d'autres termes de recherche" 
                  : "Commencez par ajouter votre premier poste"
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un Poste
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPositions.map((position) => (
                <div key={position.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-foreground">{position.title}</h3>
                      {position.level && (
                        <Badge className={getLevelColor(position.level)}>
                          {position.level}
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {getEmployeeCount(position.id)} employé{getEmployeeCount(position.id) > 1 ? "s" : ""}
                      </Badge>
                    </div>
                    {position.department && (
                      <p className="text-sm text-muted-foreground mb-2">
                        <Building className="h-3 w-3 inline mr-1" />
                        {position.department}
                      </p>
                    )}
                    {position.description && (
                      <p className="text-sm text-muted-foreground">{position.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(position)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer le poste "{position.title}" ? 
                            {getEmployeeCount(position.id) > 0 && (
                              <span className="text-destructive font-medium">
                                <br />Attention: Ce poste est actuellement assigné à {getEmployeeCount(position.id)} employé(s).
                              </span>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(position.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={getEmployeeCount(position.id) > 0}
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
