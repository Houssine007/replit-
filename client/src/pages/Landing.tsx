import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Users, TrendingUp, Target, BarChart3, Award } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            ERP GPEC
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Système de Gestion Prévisionnelle des Emplois et des Compétences
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Optimisez la gestion des compétences de votre entreprise avec notre solution complète 
            d'analyse des écarts, de planification des carrières et de développement des talents.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="px-8 py-4 text-lg"
          >
            Se Connecter
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-material">
            <CardHeader>
              <Brain className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Référentiel de Compétences</CardTitle>
              <CardDescription>
                Gérez un catalogue complet de compétences avec niveaux de maîtrise et catégorisation
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-material">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Analyse des Écarts</CardTitle>
              <CardDescription>
                Identifiez automatiquement les écarts entre compétences requises et actuelles
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-material">
            <CardHeader>
              <Target className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Mobilité Professionnelle</CardTitle>
              <CardDescription>
                Planifiez les évolutions de carrière et détectez les opportunités de mobilité
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-material">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Tableaux de Bord</CardTitle>
              <CardDescription>
                Visualisez les KPIs RH et suivez les performances en temps réel
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-material">
            <CardHeader>
              <Award className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Évaluations</CardTitle>
              <CardDescription>
                Système d'évaluation complet avec suivi des progressions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-material">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Gestion d'Équipe</CardTitle>
              <CardDescription>
                Organisez vos équipes et optimisez l'allocation des ressources
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Benefits Section */}
        <Card className="border-0 shadow-material-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-4">Pourquoi Choisir Notre Solution ?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-primary">Gestion Intelligente</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>✓ Algorithmes d'analyse prédictive</li>
                  <li>✓ Recommandations automatisées</li>
                  <li>✓ Détection proactive des risques</li>
                  <li>✓ Optimisation des parcours de formation</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-primary">Interface Moderne</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>✓ Design responsive et intuitif</li>
                  <li>✓ Visualisations interactives</li>
                  <li>✓ Export de données facilité</li>
                  <li>✓ Gestion des rôles utilisateurs</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Prêt à transformer la gestion des compétences de votre entreprise ?
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            variant="outline"
            className="px-8 py-4"
          >
            Commencer Maintenant
          </Button>
        </div>
      </div>
    </div>
  );
}
