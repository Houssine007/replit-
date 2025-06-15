import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Users, 
  Brain, 
  UserRoundCheck, 
  Briefcase, 
  BarChart3, 
  Grid3X3,
  FileText,
  Settings,
  TrendingUp
} from "lucide-react";

const navigation = [
  {
    name: "Tableau de Bord",
    href: "/",
    icon: TrendingUp,
  },
  {
    name: "Compétences",
    href: "/competences",
    icon: Brain,
  },
  {
    name: "Employés",
    href: "/employes",
    icon: UserRoundCheck,
  },
  {
    name: "Postes",
    href: "/postes",
    icon: Briefcase,
  },
  {
    name: "Analyses",
    href: "/analyses",
    icon: BarChart3,
  },
  {
    name: "Matrice de Compétences",
    href: "/matrice",
    icon: Grid3X3,
  },
];

const tools = [
  {
    name: "Exports",
    href: "/exports",
    icon: FileText,
  },
  {
    name: "Paramètres",
    href: "/parametres",
    icon: Settings,
  },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-sidebar-background border-r border-sidebar-border flex-shrink-0">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-medium text-sidebar-foreground">ERP GPEC</h1>
            <p className="text-sm text-sidebar-foreground/70">Gestion des Compétences</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        <div className="px-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <a
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "text-sidebar-primary bg-sidebar-primary/10 border-r-2 border-sidebar-primary"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </a>
                </Link>
              );
            })}
          </div>
        </div>
        
        <div className="px-4 mt-8">
          <h3 className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wide mb-3">
            Outils
          </h3>
          <div className="space-y-2">
            {tools.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <a
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "text-sidebar-primary bg-sidebar-primary/10"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </a>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </aside>
  );
}
