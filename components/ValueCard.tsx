import { ReactNode } from "react";

interface ValueCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
  variant?: "violet" | "dark" | "yellow" | "default";
}

export function ValueCard({ icon, title, description, className, variant = "default" }: ValueCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "violet":
        return "bg-[#8b5cf6] text-white border-transparent";
      case "dark":
        return "bg-[#6d28d9] text-white border-transparent";
      case "yellow":
        return "bg-[#fbbf24] text-[#1e1b4b] border-transparent";
      default:
        return "bg-card text-card-foreground border-border";
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <div 
      className={`p-8 rounded-[2rem] border shadow-sm h-full flex flex-col justify-start items-start text-left cursor-pointer transition-transform duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] ${variantStyles} ${className || ""}`}
    >
      {/* Icon Pill */}
      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-6 shadow-sm ${
        variant === 'yellow' ? 'bg-white text-[#fbbf24]' : 'bg-white/20 text-white'
      } ${variant === 'default' ? 'bg-secondary/10 text-primary' : ''}`}>
        {icon}
      </div>

      <h3 className="text-2xl font-bold mb-3 tracking-tight">{title}</h3>
      <p className={`text-base leading-relaxed ${
        variant === 'default' ? 'text-muted-foreground' : 'text-white/90'
      } ${variant === 'yellow' ? '!text-[#1e1b4b]/80' : ''}`}>
        {description}
      </p>
    </div>
  );
}
