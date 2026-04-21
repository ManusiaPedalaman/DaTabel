"use client";

import { Upload, Camera, MoveRight, FileUp, X, FileSpreadsheet, Download, Copy, Eye, RotateCcw, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/FadeIn";
import { useState, useRef } from "react";
import JSZip from "jszip";

export default function Hero() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [conversionResults, setConversionResults] = useState<string[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'image/webp'];
    
    const validFiles = Array.from(files).filter(file => validTypes.includes(file.type));
    
    if (validFiles.length === 0) {
        alert("Please upload valid image (JPG, PNG) or PDF files.");
        return;
    }
    
    const newFiles = [...selectedFiles, ...validFiles];
    if (newFiles.length > 5) {
        alert("Anda hanya dapat mengunggah maksimal 5 file sekaligus.");
        setSelectedFiles(newFiles.slice(0, 5));
    } else {
        setSelectedFiles(newFiles);
    }
    
    setConversionResults([]); // Reset prev results
    setPreviewVisible(false);
  };

  const startConversionProcess = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
          formData.append("files", file);
      });

      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
         const err = await response.json();
         throw new Error(err.error || "Gagal mengunggah file");
      }
      
      const data = await response.json();
      setConversionResults(data.results);
      
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Terjadi kesalahan saat mengkonversi gambar.");
    } finally {
      setIsUploading(false);
    }
  };

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
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
    }
  };

  const handleStartOver = () => {
      setSelectedFiles([]);
      setConversionResults([]);
      setPreviewVisible(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleCopy = () => {
      if (conversionResults.length > 0) {
          const combined = conversionResults.join('\n\n\n');
          navigator.clipboard.writeText(combined);
          alert("Data copied to clipboard!");
      }
  };

  const handleDownload = async () => {
      if (conversionResults.length === 0) return;

      if (conversionResults.length === 1) {
          // Single file download (CSV)
          const blob = new Blob([conversionResults[0]], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.setAttribute("href", url);
          const fileName = selectedFiles[0]?.name ? selectedFiles[0].name.replace(/\.[^/.]+$/, "") + ".csv" : `databel_result_${Date.now()}.csv`;
          link.setAttribute("download", fileName);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      } else {
          // Multiple files download (ZIP)
          try {
              const zip = new JSZip();
              
              conversionResults.forEach((result, index) => {
                  const originalName = selectedFiles[index]?.name ? selectedFiles[index].name.replace(/\.[^/.]+$/, "") : `table_${index + 1}`;
                  zip.file(`${originalName}.csv`, result);
              });
              
              const content = await zip.generateAsync({ type: "blob" });
              const url = URL.createObjectURL(content);
              const link = document.createElement("a");
              link.setAttribute("href", url);
              link.setAttribute("download", `databel_results_${Date.now()}.zip`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
          } catch (error) {
              console.error("Error creating ZIP file:", error);
              alert("Gagal membuat file ZIP.");
          }
      }
  };

  const handleUploadPhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleUseCameraClick = () => {
    cameraInputRef.current?.click();
  };

  return (
    <FadeIn direction="up" fullWidth={true}>
      <div className="relative group overflow-hidden rounded-3xl sm:rounded-[2rem] bg-white dark:bg-card border-none p-4 sm:p-8 h-auto flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all duration-500 min-h-[500px] w-full max-w-full min-w-0">
        
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

        <div className="space-y-6 max-w-2xl z-10 flex flex-col items-center w-full min-w-0">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-1 rounded-full bg-secondary/20 px-3 py-1 text-xs font-semibold text-secondary-foreground dark:text-secondary transition-colors"
          >
            <span>New AI Engine V2</span>
            <MoveRight className="w-3 h-3" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight lg:text-5xl text-balance"
          >
            The best place to convert <span className="text-primary italic underline decoration-secondary decoration-wavy decoration-2 underline-offset-4 break-words">Paper Tables</span> to Excel
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-muted-foreground max-w-lg text-balance"
          >
              Stop typing manually. Let our AI handle the messy table structure for you instantly.
          </motion.p>

          {/* === STATE 1: NO FILE SELECTED (Upload Buttons & Drag-Drop) === */}
          {!selectedFiles.length && (
            <>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full pt-4"
              >
                   <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileInputChange} 
                      accept=".jpg,.jpeg,.png,.webp,.pdf" 
                      className="hidden" 
                      multiple
                   />
                   <input 
                      type="file" 
                      ref={cameraInputRef} 
                      onChange={handleFileInputChange} 
                      accept="image/*" 
                      capture="environment" 
                      className="hidden" 
                      multiple
                   />
                   <motion.button 
                      onClick={handleUploadPhotoClick}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto justify-center h-12 px-8 rounded-full bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 transition-all flex items-center gap-2 hover:shadow-primary/40"
                   >
                      <Upload className="w-5 h-5" />
                      Upload Photo
                   </motion.button>
                   <motion.button 
                      onClick={handleUseCameraClick}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto justify-center h-12 px-8 rounded-full bg-white dark:bg-secondary text-secondary-foreground border-2 border-secondary font-bold transition-all flex items-center gap-2 hover:bg-secondary/10"
                   >
                      <Camera className="w-5 h-5" />
                      Use Camera
                   </motion.button>
              </motion.div>
    
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className={`relative mt-6 w-full max-w-md rounded-xl border-2 border-dashed p-6 sm:p-8 transition-all duration-200 ease-in-out cursor-pointer ${
                  isDragging
                    ? "border-primary bg-primary/5 scale-[1.02]"
                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleUploadPhotoClick}
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
            </>
          )}

          {/* === STATE 2: FILE SELECTED OR CONVERTING === */}
          {selectedFiles.length > 0 && conversionResults.length === 0 && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="w-full max-w-2xl mt-8 bg-card border border-border/50 rounded-2xl shadow-sm p-4 sm:p-6 text-left relative z-20"
            >
               <div className="flex items-center justify-between mb-2">
                   <h3 className="font-bold text-lg text-foreground">Ready to Convert</h3>
                   <button onClick={handleStartOver} disabled={isUploading} className="text-muted-foreground hover:text-destructive transition-colors">
                       <X className="w-5 h-5" />
                   </button>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-muted/40 p-4 rounded-xl border border-border/50 mb-6 max-h-[240px] overflow-y-auto custom-scrollbar">
                   {selectedFiles.map((file, idx) => (
                       <div key={idx} className="flex items-center gap-3 bg-white dark:bg-card p-2 rounded-lg border border-border/50">
                           <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center overflow-hidden shrink-0 border border-primary/20">
                               {file.type.startsWith('image/') ? (
                                   <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                               ) : (
                                   <FileSpreadsheet className="w-5 h-5 text-primary" />
                               )}
                           </div>
                           <div className="flex-1 min-w-0 text-left">
                               <p className="font-semibold text-xs text-foreground truncate">{file.name}</p>
                               <p className="text-[10px] text-muted-foreground mt-0.5">{(file.size / 1024).toFixed(0)} KB</p>
                           </div>
                       </div>
                   ))}
               </div>

               <div className="flex justify-center">
                   <motion.button 
                      onClick={startConversionProcess}
                      disabled={isUploading}
                      whileHover={{ scale: isUploading ? 1 : 1.05 }}
                      whileTap={{ scale: isUploading ? 1 : 0.95 }}
                      className={`h-12 px-10 rounded-full bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 w-full sm:w-auto ${isUploading ? 'opacity-90 cursor-wait' : 'hover:shadow-primary/40'}`}
                   >
                      {isUploading ? (
                          <>
                             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                             Converting...
                          </>
                      ) : (
                          "Convert to Excel"
                      )}
                   </motion.button>
               </div>
            </motion.div>
          )}

          {/* === STATE 3: CONVERSION COMPLETE / SUCCESS === */}
          {conversionResults.length > 0 && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="w-full max-w-4xl mt-6 relative z-20 min-w-0"
             >
                {/* Result Dashboard Card */}
                <div className="bg-card border border-border/50 rounded-2xl shadow-sm p-3 sm:p-5 flex flex-col items-center justify-center gap-4 mb-6 w-full min-w-0">
                    
                    <div className="flex items-center gap-3 bg-muted/30 p-2 pr-4 rounded-xl border border-border/50 w-full">
                        <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="text-left min-w-0 flex-1">
                            <p className="font-semibold text-sm text-foreground truncate max-w-[150px] sm:max-w-[200px]">
                                {selectedFiles.length === 1 ? selectedFiles[0].name.replace(/\.[^/.]+$/, "") + ".xlsx" : `${selectedFiles.length} files converted`}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400 font-medium">100% Converted</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 w-full">
                        <button 
                          onClick={() => setPreviewVisible(!previewVisible)}
                          className={`w-full sm:w-auto justify-center h-10 px-4 rounded-full font-medium text-sm transition-all flex items-center gap-2 ${previewVisible ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                        >
                           <Eye className="w-4 h-4 shrink-0" />
                           <span>Preview</span>
                        </button>
                        <button 
                          onClick={handleCopy}
                          className="w-full sm:w-auto justify-center h-10 px-4 rounded-full bg-secondary text-secondary-foreground font-medium text-sm hover:bg-secondary/80 transition-all flex items-center gap-2"
                        >
                           <Copy className="w-4 h-4 shrink-0" />
                           <span>Copy</span>
                        </button>
                        <button 
                          onClick={handleDownload}
                          className="w-full sm:w-auto justify-center h-10 px-5 rounded-full bg-green-600 text-white font-bold text-sm hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all flex items-center gap-2"
                        >
                           <Download className="w-4 h-4" />
                           Download All
                        </button>
                    </div>
                </div>

                <button 
                  onClick={handleStartOver}
                  className="mx-auto w-full sm:w-auto justify-center h-10 px-6 mb-6 rounded-full border border-border bg-white dark:bg-card text-foreground font-medium text-sm hover:bg-muted transition-all flex items-center gap-2"
                >
                   <RotateCcw className="w-4 h-4" />
                   Start over
                </button>

                {/* Preview Grid */}
                {previewVisible && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="w-full max-w-full bg-white dark:bg-card border border-border/50 rounded-2xl shadow-sm text-left overflow-hidden min-w-0"
                    >
                        <div className="bg-muted px-4 py-3 border-b border-border/50 flex items-center justify-between">
                            <h3 className="font-semibold text-sm">Data Preview</h3>
                            <div className="flex gap-2">
                                <button onClick={handleDownload} className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md font-medium transition-colors">Download</button>
                                <button onClick={handleCopy} className="text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-1 rounded-md font-medium transition-colors">Copy</button>
                            </div>
                        </div>
                        <div className="flex flex-row overflow-x-auto snap-x snap-mandatory custom-scrollbar w-full pb-4">
                            {conversionResults.map((result, index) => (
                                <div key={index} className="w-[90%] sm:w-[80%] shrink-0 snap-center px-4 pt-4 first:pl-4 last:pr-4">
                                    <div className="mb-2 font-semibold text-primary text-sm flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> 
                                        {selectedFiles[index]?.name || `Table ${index + 1}`}
                                    </div>
                                    <div className="p-0 overflow-x-auto custom-scrollbar w-full max-w-full block border border-border/50 rounded-lg">
                                        <table className="w-full text-sm text-left whitespace-nowrap min-w-max">
                                             <thead className="text-xs text-muted-foreground bg-muted/30 sticky top-0 z-10 shadow-sm">
                                                 <tr>
                                                     {/* Simple CSV parsing logic for preview */}
                                                     {result.trim().split('\n')[0]?.split(',').map((header, idx) => (
                                                         <th key={idx} className="px-4 py-3 border-b border-border/50 font-semibold">{header.replace(/['"]+/g, '') || `Col ${idx + 1}`}</th>
                                                     ))}
                                                 </tr>
                                             </thead>
                                             <tbody className="divide-y divide-border/50">
                                                 {result.trim().split('\n').slice(1).map((row, rowIndex) => (
                                                     <tr key={rowIndex} className="hover:bg-muted/30 transition-colors">
                                                         {row.split(',').map((cell, cellIndex) => (
                                                             <td key={cellIndex} className="px-4 py-3 border-r border-border/50 last:border-r-0">{cell.replace(/['"]+/g, '')}</td>
                                                         ))}
                                                     </tr>
                                                 ))}
                                             </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
             </motion.div>
          )}

        {/* Closing tags for the white card container */}
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
           className="absolute bottom-0 right-0 w-200 h-100 bg-secondary/10 rounded-full blur-2xl -z-0 translate-y-1/2 translate-x-1/4"
         />
         {/* Top decorative elements - Animated */}
         <motion.div 
           animate={{ 
              rotate: [0, 360],
           }}
           transition={{ 
              duration: 20, 
              repeat: Infinity,
              ease: "linear"
           }}
           className="absolute top-0 right-300 w-200 h-100 bg-secondary/10 rounded-full blur-2xl -z-0 -translate-y-1/2 translate-x-1/4"
         />
         <motion.div 
           animate={{ y: [0, -10, 0] }}
           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
           className="absolute top-10 right-10 text-primary/20 rotate-12"
         >
             <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20"/></svg>
         </motion.div>
         {/* Bottom Left decorative elements - Animated */}
         <motion.div 
           animate={{ y: [0, -10, 0] }}
           transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
           className="absolute bottom-10 left-10 text-primary/20 -rotate-12"
         >
             <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20"/></svg>
         </motion.div>
      </div>
    </FadeIn>
  );
}