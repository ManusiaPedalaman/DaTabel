
"use client";

import * as React from "react";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";

export function Header() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="sticky top-4 z-50 w-full flex justify-center px-4">
      <header className="relative w-full max-w-3xl rounded-3xl border border-border/40 bg-background/80 backdrop-blur-md shadow-sm transition-all duration-300">
        <div className="flex h-12 items-center justify-between px-6">
            {/* Logo */}
            <div className="flex items-center gap-1">
                <span className="text-xl font-black tracking-tight text-primary">Da</span>
                <span className="text-xl font-black tracking-tight text-foreground">Tabel</span>
            </div>
            
            {/* Nav (Desktop) */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                <a href="#home" className="hover:text-foreground transition-colors">Home</a>
                <a href="#works" className="hover:text-foreground transition-colors">How it works</a>
                <a href="#features" className="hover:text-foreground transition-colors">Features</a>
                <a href="#why" className="hover:text-foreground transition-colors">Why?</a>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
                {/* Theme Toggler */}
                <div className="flex items-center">
                    <label className="st-sunMoonThemeToggleBtn themeToggle relative inline-block w-6 h-6">
                        <input 
                            type="checkbox" 
                            className="themeToggleInput absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                            checked={theme === 'dark'} 
                            onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
                        />
                        <svg viewBox="0 0 20 20" className="sunMoonSvg w-full h-full fill-current">
                            <mask id="moon-mask">
                                <rect x="0" y="0" width="20" height="20" fill="white" />
                                <circle cx="11" cy="3" r="8" fill="black" />
                            </mask>
                            <circle className="sunMoon" cx="10" cy="10" r="8" mask="url(#moon-mask)" />
                            <g>
                                <circle className="sunRay sunRay1" cx="18" cy="10" r="1.5" />
                                <circle className="sunRay sunRay2" cx="14" cy="16.928" r="1.5" />
                                <circle className="sunRay sunRay3" cx="6" cy="16.928" r="1.5" />
                                <circle className="sunRay sunRay4" cx="2" cy="10" r="1.5" />
                                <circle className="sunRay sunRay5" cx="6" cy="3.0718" r="1.5" />
                                <circle className="sunRay sunRay6" cx="14" cy="3.0718" r="1.5" />
                            </g>
                        </svg>
                    </label>
                </div>

                {/* Follow Me Button (Hidden on Mobile) */}
                <button className="hidden sm:inline-flex h-8 items-center justify-center rounded-full bg-primary px-4 text-xs font-medium text-primary-foreground shadow hover:bg-primary/90">
                    Support me
                </button>

                {/* Mobile Menu Toggle */}
                <button 
                  className="md:hidden p-1 text-foreground"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full mt-2 p-4 bg-background/95 backdrop-blur-xl border border-border/40 rounded-2xl shadow-xl flex flex-col gap-4 text-center animate-in slide-in-from-top-2 fade-in duration-200">
              <a href="#home" className="text-sm font-medium hover:text-primary transition-colors py-2" onClick={() => setIsMenuOpen(false)}>Home</a>
              <a href="#works" className="text-sm font-medium hover:text-primary transition-colors py-2" onClick={() => setIsMenuOpen(false)}>How it works</a>
              <a href="#features" className="text-sm font-medium hover:text-primary transition-colors py-2" onClick={() => setIsMenuOpen(false)}>Features</a>
              <a href="#why" className="text-sm font-medium hover:text-primary transition-colors py-2" onClick={() => setIsMenuOpen(false)}>Why?</a>
          </div>
        )}
      </header>
    </div>
  );
}
