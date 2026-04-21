
"use client";

import { Zap, Brain, TrendingUp } from "lucide-react";
import { ValueCard } from "@/components/ValueCard";
import { FadeIn } from "@/components/FadeIn";

export default function Fitur() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">
        {/* Value Prop 1: Speed (Purple Box) */}
        <div className="md:col-span-1 h-full">
            <FadeIn delay={0.2} direction="up" className="h-full">
                <ValueCard 
                icon={<Zap className="w-7 h-7" />} 
                title="Instant"
                variant="violet" 
                description="Upload a photo and get an Excel file in seconds. No waiting."
                />
            </FadeIn>
        </div>

        {/* Value Prop 2: AI Tech (Dark Box) */}
        <div className="md:col-span-1 h-full">
            <FadeIn delay={0.3} direction="up" className="h-full">
                <ValueCard 
                icon={<Brain className="w-7 h-7" />} 
                title="Smart AI" 
                variant="dark"
                description="Our technology understands complex tables, merged headers, and handwriting."
                />
            </FadeIn>
        </div>

        {/* Value Prop 3: Productivity (Yellow Box) */}
        <div className="md:col-span-1 h-full">
            <FadeIn delay={0.4} direction="up" className="h-full">
                <ValueCard 
                icon={<TrendingUp className="w-7 h-7" />} 
                title="Boost Productivity" 
                variant="yellow"
                description="Let your team focus on data analysis, not tedious manual data entry."
                />
            </FadeIn>
        </div>
    </div>
  );
}