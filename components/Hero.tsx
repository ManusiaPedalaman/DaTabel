
"use client";

import { Upload, Camera, MoveRight, FileUp } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export function Hero() {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Handle file drop here
    console.log("File dropped:", e.dataTransfer.files[0]);
  };

  return (
    <div className="relative group overflow-hidden rounded-[2rem] bg-white dark:bg-card border-none p-8 h-full flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all duration-500">
      
      {/* Decorative Blob - Animated */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
        className="absolute top-0 left-1/2 -translate-x-1/2 -mt-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-0"
      />

      <div className="space-y-6 max-w-2xl z-10 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-1 rounded-full bg-secondary/20 px-3 py-1 text-xs font-semibold text-secondary-foreground transition-colors"
        >
          <span>New AI Engine V2</span>
          <MoveRight className="w-3 h-3" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-extrabold tracking-tight lg:text-5xl text-balance"
        >
          The best place to convert <span className="text-primary italic underline decoration-secondary decoration-wavy decoration-2 underline-offset-4">Paper Tables</span> to Excel
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-muted-foreground max-w-lg text-balance"
        >
            Stop typing manually. Let our AI handle the messy table structure for you instantly.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3 w-full pt-4"
        >
             <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="h-12 px-8 rounded-full bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center gap-2"
             >
                <Upload className="w-5 h-5" />
                Upload Photo
             </motion.button>
             <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="h-12 px-8 rounded-full bg-white dark:bg-secondary text-secondary-foreground border-2 border-secondary font-bold hover:bg-secondary/10 transition-all flex items-center gap-2"
             >
                <Camera className="w-5 h-5" />
                Use Camera
             </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`relative mt-6 w-full max-w-md rounded-xl border-2 border-dashed p-8 transition-all duration-200 ease-in-out ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center text-center gap-2">
            <div className={`p-3 rounded-full transition-colors ${isDragging ? "bg-primary/10" : "bg-muted"}`}>
              <FileUp className={`w-6 h-6 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Drag & drop your file here
              </p>
              <p className="text-xs text-muted-foreground">
                Supports JPG, PNG, PDF
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Bottom decorative elements - Animated */}
       <motion.div 
         animate={{ 
            rotate: [0, 360],
         }}
         transition={{ 
            duration: 20, 
            repeat: Infinity,
            ease: "linear"
         }}
         className="absolute bottom-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl -z-0 translate-y-1/2 translate-x-1/4"
       />
       <motion.div 
         animate={{ y: [0, -10, 0] }}
         transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
         className="absolute bottom-10 left-10 text-primary/20 rotate-12"
       >
           <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20"/></svg>
       </motion.div>
    </div>
  );
}
