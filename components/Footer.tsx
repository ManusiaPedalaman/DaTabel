
"use client";

import { Check, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";

export function Footer() {
  return (
    <footer className="mt-20 w-full">
      {/* Large CTA Section - Full Width */}
      <div className="relative overflow-hidden bg-[#8b5cf6] text-white py-24 text-center shadow-2xl shadow-primary/25 w-full">
            
            {/* Background Grid Pattern (Subtle) */}
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
            
            {/* Radiant Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_70%)] blur-2xl pointer-events-none"></div>

            <div className="container mx-auto px-4 relative z-10 flex flex-col items-center justify-center gap-8">
                
                <FadeIn direction="up">
                    <div className="space-y-8 flex flex-col items-center">
                        {/* Main Headline with Slanted Highlight */}
                        <div className="space-y-2">
                            <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase leading-tight">
                                Ready to Convert
                            </h2>
                            <div className="inline-block bg-black/20 -rotate-2 transform px-4 py-1 rounded-lg backdrop-blur-sm">
                                <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase text-white drop-shadow-sm">
                                    Your Paper Tables?
                                </h2>
                            </div>
                        </div>

                        {/* Pills / Tags */}
                        <div className="flex flex-wrap justify-center gap-3">
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-sm font-semibold">
                                <Zap className="w-4 h-4" />
                                <span>Fast Process</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-sm font-semibold">
                                <ShieldCheck className="w-4 h-4" />
                                <span>High Accuracy</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-sm font-semibold">
                                <Sparkles className="w-4 h-4" />
                                <span>Optimal Results</span>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <button 
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="mt-4 bg-white text-[#8b5cf6] px-10 py-5 rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-lg hover:shadow-xl hover:bg-gray-50 cursor-pointer"
                        >
                            Try for Free Now
                        </button>
                    </div>
                </FadeIn>
                
            </div>
      </div>

      {/* Copyright Footer */}
      <div className="border-t py-8 bg-background">
        <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 DaTabel. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
