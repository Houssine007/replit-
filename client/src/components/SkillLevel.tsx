import { cn } from "@/lib/utils";

interface SkillLevelProps {
  level: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function SkillLevel({ level, size = "md", className }: SkillLevelProps) {
  const getSkillLevelClass = (level: number) => {
    if (level <= 2) return "skill-level-1";
    if (level === 3) return "skill-level-3";
    return "skill-level-4";
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case "sm":
        return "w-6 h-6 text-xs";
      case "lg":
        return "w-10 h-10 text-base";
      default:
        return "w-8 h-8 text-sm";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-full",
        getSkillLevelClass(level),
        getSizeClasses(size),
        className
      )}
    >
      {level}
    </span>
  );
}
