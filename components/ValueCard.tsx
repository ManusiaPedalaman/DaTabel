
"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

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
            return "bg-[#8b5cf6] text-white border-transparent"; // Violet-500
        case "dark":
             return "bg-[#6d28d9] text-white border-transparent"; // Violet-700
        case "yellow":
            return "bg-[#fbbf24] text-[#1e1b4b] border-transparent"; // Amber-400
        default:
            return "bg-card text-card-foreground border-border";
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`p-8 rounded-[2rem] border shadow-sm h-full flex flex-col justify-start items-start text-left cursor-pointer ${variantStyles} ${className}`}
    >
        
        {/* Icon Pill - Color depends on variant */}
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
    </motion.div>
  );
}
