import { Zap, Brain, TrendingUp } from "lucide-react";
import { ValueCard } from "@/components/ValueCard";

export default function Fitur() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">
      {/* Value Prop 1: Speed (Purple Box) */}
      <div className="md:col-span-1 h-full">
        <ValueCard 
          icon={<Zap className="w-7 h-7" />} 
          title="Instant"
          variant="violet" 
          description="Upload a photo and get an Excel file in seconds. No waiting."
        />
      </div>

      {/* Value Prop 2: AI Tech (Dark Box) */}
      <div className="md:col-span-1 h-full">
        <ValueCard 
          icon={<Brain className="w-7 h-7" />} 
          title="Smart AI & Visual Fidelity" 
          variant="dark"
          description="Detects table grid borders, cell colors, merged headers, and handwriting to match your original document."
        />
      </div>

      {/* Value Prop 3: Productivity (Yellow Box) */}
      <div className="md:col-span-1 h-full">
        <ValueCard 
          icon={<TrendingUp className="w-7 h-7" />} 
          title="Boost Productivity" 
          variant="yellow"
          description="Let your team focus on data analysis, not tedious manual data entry."
        />
      </div>
    </div>
  );
}