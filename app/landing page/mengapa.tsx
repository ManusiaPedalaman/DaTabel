
"use client";

import { CheckCircle2 } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";

const reasons = [
  "99% AI accuracy for handwriting",
  "Clean Excel format, ready to edit",
  "Supports various languages & math symbols",
  "Secure: Data encrypted and automatically deleted",
];

export default function Mengapa() {
  return (
    <div className="py-20 bg-muted/30 -mx-4 px-4 md:-mx-8 md:px-8 rounded-[3rem] my-12">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12">
            
            <div className="flex-1 space-y-6 text-center md:text-left">
                <FadeIn direction="left">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                        Why DaTabel?
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        We understand the frustration of manual data entry. DaTabel is built to save your valuable time.
                    </p>
                </FadeIn>
            </div>

            <div className="flex-1 w-full">
                <div className="grid gap-4">
                    {reasons.map((reason, index) => (
                        <FadeIn key={index} delay={index * 0.1} direction="right">
                             <div className="flex items-center gap-3 p-4 bg-background rounded-2xl border shadow-sm hover:scale-[1.02] transition-transform">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <span className="font-medium">{reason}</span>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
}