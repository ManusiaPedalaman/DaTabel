"use client";

import * as React from "react";
import { useTheme } from "next-themes";

export function Header() {
  const { setTheme, theme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

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
                            aria-label="Toggle theme"
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

                {/* Follow Me Button */}
                <a 
                  href="https://saweria.co/ANDM" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hidden min-[420px]:inline-flex h-8 items-center justify-center rounded-full bg-primary px-3 sm:px-4 text-xs font-medium text-primary-foreground shadow hover:bg-primary/90 transition-transform hover:scale-105"
                >
                    Support me
                </a>

                {/* Animated 3-Line Hamburger Button */}
                <button 
                  className="md:hidden relative w-9 h-9 flex flex-col justify-center items-center rounded-xl hover:bg-muted/60 transition-colors p-1.5 text-foreground focus:outline-none cursor-pointer"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-label={isMenuOpen ? "Tutup menu" : "Buka menu"}
                >
                  {/* Line 1 (Top) */}
                  <span
                    className={`w-5 h-0.5 bg-foreground rounded-full block origin-center transition-all duration-200 ${
                      isMenuOpen ? "rotate-45 translate-y-[6px]" : ""
                    }`}
                  />
                  {/* Line 2 (Middle) */}
                  <span
                    className={`w-5 h-0.5 bg-foreground rounded-full block my-1 origin-center transition-all duration-200 ${
                      isMenuOpen ? "opacity-0 scale-x-0" : ""
                    }`}
                  />
                  {/* Line 3 (Bottom) */}
                  <span
                    className={`w-5 h-0.5 bg-foreground rounded-full block origin-center transition-all duration-200 ${
                      isMenuOpen ? "-rotate-45 -translate-y-[6px]" : ""
                    }`}
                  />
                </button>
            </div>
        </div>

        {/* Mobile Menu Dropdown with CSS Transition */}
        {isMenuOpen && (
          <div 
            className="md:hidden absolute top-full left-0 w-full mt-2 p-4 bg-background/95 backdrop-blur-xl border border-border/40 rounded-2xl shadow-xl flex flex-col gap-4 text-center overflow-hidden transition-all duration-200 ease-out"
          >
              <a href="#home" className="text-sm font-medium hover:text-primary transition-colors py-2" onClick={() => setIsMenuOpen(false)}>Home</a>
              <a href="#works" className="text-sm font-medium hover:text-primary transition-colors py-2" onClick={() => setIsMenuOpen(false)}>How it works</a>
              <a href="#features" className="text-sm font-medium hover:text-primary transition-colors py-2" onClick={() => setIsMenuOpen(false)}>Features</a>
              <a href="#why" className="text-sm font-medium hover:text-primary transition-colors py-2" onClick={() => setIsMenuOpen(false)}>Why?</a>
              
              {/* Mobile Support Me Button */}
              <div className="pt-2 border-t border-border/40 flex justify-center">
                  <a 
                    href="https://saweria.co/ANDM" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full h-10 px-6 rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-all flex items-center justify-center cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                  >
                      Support me
                  </a>
              </div>
          </div>
        )}
      </header>
    </div>
  );
}
