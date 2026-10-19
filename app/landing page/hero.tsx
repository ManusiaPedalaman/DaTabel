"use client";

import { 
  Upload, 
  Camera, 
  MoveRight, 
  FileUp, 
  X, 
  FileSpreadsheet, 
  Download, 
  Copy, 
  Eye, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Info 
} from "lucide-react";
import { useState, useRef, useEffect, memo } from "react";
import { createPortal } from "react-dom";
import { optimizeFileBatch } from "@/lib/imageOptimizer";

export interface CellData {
  text: string;
  bg_color?: string | null;
  text_color?: string | null;
  bold?: boolean;
  align?: 'left' | 'center' | 'right';
  border?: boolean;
  col_span?: number;
}

export interface TableData {
  title?: string;
  has_all_borders: boolean;
  border_color?: string | null;
  rows: CellData[][];
}

export interface ModalNotification {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
}

// Isolated typewriter component to prevent re-rendering the entire Hero every 55ms
const TYPING_WORDS = ["Paper Tables", "jpeg", "jpg", "png", "webp", "pdf"];

const TypewriterText = memo(function TypewriterText() {
  const [wordIndex, setWordIndex] = useState(0);
  const [typedText, setTypedText] = useState("Paper Tables");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = TYPING_WORDS[wordIndex];
    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      if (typedText.length < currentWord.length) {
        timer = setTimeout(() => {
          setTypedText(currentWord.substring(0, typedText.length + 1));
        }, 110);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      if (typedText.length > 0) {
        timer = setTimeout(() => {
          setTypedText(currentWord.substring(0, typedText.length - 1));
        }, 55);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % TYPING_WORDS.length);
        }, 300);
      }
    }

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, wordIndex]);

  return (
    <span className="text-primary italic underline decoration-secondary decoration-wavy decoration-2 underline-offset-4 break-words inline-flex items-center">
      <span>{typedText}</span>
      <span className="inline-block w-[3px] h-[0.9em] bg-secondary ml-1 animate-pulse not-italic rounded-full align-middle" />
    </span>
  );
});

export default function Hero() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [conversionResults, setConversionResults] = useState<unknown[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [activeTableIndex, setActiveTableIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [modalNotification, setModalNotification] = useState<ModalNotification | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModalNotification(null);
      }
    };
    if (modalNotification?.isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalNotification?.isOpen]);

  const showAlert = (message: string, options?: { title?: string; type?: 'info' | 'warning' | 'error' | 'success' }) => {
    setModalNotification({
      isOpen: true,
      title: options?.title || (options?.type === 'error' ? 'Terjadi Kesalahan' : options?.type === 'warning' ? 'Perhatian' : options?.type === 'success' ? 'Berhasil' : 'Pemberitahuan'),
      message,
      type: options?.type || 'info',
    });
  };

  const normalizeTableData = (raw: unknown): TableData => {
    if (!raw) {
      return { has_all_borders: true, border_color: '#C48B80', rows: [] };
    }

    if (typeof raw === 'object' && raw !== null && 'rows' in raw && Array.isArray((raw as { rows: unknown }).rows)) {
      const typedObj = raw as { title?: unknown; has_all_borders?: unknown; border_color?: unknown; rows: unknown[] };
      return {
        title: typeof typedObj.title === 'string' ? typedObj.title : undefined,
        has_all_borders: Boolean(typedObj.has_all_borders ?? true),
        border_color: typeof typedObj.border_color === 'string' && typedObj.border_color.startsWith('#') ? typedObj.border_color : '#C48B80',
        rows: typedObj.rows.map((row: unknown) =>
          Array.isArray(row)
            ? row.map((cell: unknown) => {
                const cellObj = typeof cell === 'object' && cell !== null ? (cell as Record<string, unknown>) : null;
                return cellObj
                  ? {
                      text: String(cellObj.text ?? ''),
                      bg_color: typeof cellObj.bg_color === 'string' ? cellObj.bg_color : null,
                      text_color: typeof cellObj.text_color === 'string' ? cellObj.text_color : null,
                      bold: Boolean(cellObj.bold),
                      align: (cellObj.align === 'center' || cellObj.align === 'right' ? cellObj.align : 'left') as 'left' | 'center' | 'right',
                      border: cellObj.border !== undefined ? Boolean(cellObj.border) : true,
                      col_span: typeof cellObj.col_span === 'number' && cellObj.col_span > 1 ? cellObj.col_span : 1,
                    }
                  : {
                      text: String(cell ?? ''),
                      bg_color: null,
                      text_color: null,
                      bold: false,
                      align: 'left',
                      border: true,
                      col_span: 1,
                    };
              })
            : []
        ),
      };
    }

    if (typeof raw === 'string') {
      const lines = raw.trim().split('\r\n').filter(l => l.trim().length > 0);
      const rows = lines.map((line, rIdx) => {
        const parts = line.includes('\t') ? line.split('\t') : line.split(',');
        return parts.map((val, cIdx) => ({
          text: val.replace(/^["']|["']$/g, '').trim(),
          bg_color: null,
          text_color: null,
          bold: rIdx === 0,
          align: cIdx === 0 ? ('center' as const) : ('left' as const),
          border: true,
          col_span: 1,
        }));
      });
      return {
        has_all_borders: true,
        border_color: '#C48B80',
        rows,
      };
    }

    return { has_all_borders: true, border_color: '#C48B80', rows: [] };
  };

  const toCsvString = (table: TableData): string => {
    return table.rows
      .map(row =>
        row
          .map(cell => {
            const t = (cell.text || '').replace(/"/g, '""');
            return t.includes(',') || t.includes('\r\n') || t.includes('"') ? `"${t}"` : t;
          })
          .join(',')
      )
      .join('\r\n');
  };

  const generateExcelBuffer = async (table: TableData): Promise<ArrayBuffer> => {
    const ExcelJSModule = await import('exceljs');
    const ExcelJS = ExcelJSModule.default || ExcelJSModule;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(table.title ? table.title.substring(0, 30) : 'DataTabel');

    const toArgb = (hex?: string | null): string | undefined => {
      if (!hex) return undefined;
      const clean = hex.replace('#', '').trim().toUpperCase();
      if (clean.length === 6) return 'FF' + clean;
      if (clean.length === 8) return clean;
      return undefined;
    };

    const borderColorArgb = toArgb(table.border_color) || 'FFC48B80';
    const defaultBorder = {
      top: { style: 'thin' as const, color: { argb: borderColorArgb } },
      left: { style: 'thin' as const, color: { argb: borderColorArgb } },
      bottom: { style: 'thin' as const, color: { argb: borderColorArgb } },
      right: { style: 'thin' as const, color: { argb: borderColorArgb } },
    };

    table.rows.forEach((row, rowIdx) => {
      const excelRow = worksheet.getRow(rowIdx + 1);
      const isTitleRow = rowIdx === 0 && row.some(c => (c.col_span || 1) > 2);
      excelRow.height = isTitleRow ? 32 : 22;

      let colCursor = 1;
      row.forEach((cell) => {
        const colSpan = Math.max(1, cell.col_span || 1);
        const startCol = colCursor;
        const endCol = colCursor + colSpan - 1;

        const primaryCell = worksheet.getCell(rowIdx + 1, startCol);
        primaryCell.value = cell.text ?? '';

        if (colSpan > 1) {
          worksheet.mergeCells(rowIdx + 1, startCol, rowIdx + 1, endCol);
        }

        for (let c = startCol; c <= endCol; c++) {
          const cCell = worksheet.getCell(rowIdx + 1, c);

          if (table.has_all_borders || cell.border) {
            cCell.border = defaultBorder;
          }

          const bgArgb = toArgb(cell.bg_color);
          if (bgArgb && bgArgb !== 'FFFFFFFF') {
            cCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: bgArgb },
            };
          }

          const textArgb = toArgb(cell.text_color);
          cCell.font = {
            name: 'Segoe UI',
            size: isTitleRow ? 13 : (cell.bold ? 10.5 : 10),
            bold: Boolean(cell.bold || isTitleRow),
            color: textArgb ? { argb: textArgb } : undefined,
          };

          const horizontalAlign: 'left' | 'center' | 'right' = (cell.align || (isTitleRow || colSpan > 1 ? 'center' : 'left'));
          cCell.alignment = {
            horizontal: horizontalAlign,
            vertical: 'middle',
            wrapText: true,
          };
        }

        colCursor = endCol + 1;
      });
    });

    worksheet.columns.forEach((col, idx) => {
      let maxLength = 10;
      table.rows.forEach(r => {
        if (r[idx] && (r[idx].col_span || 1) === 1) {
          maxLength = Math.max(maxLength, (r[idx].text || '').length);
        }
      });
      col.width = Math.min(Math.max(maxLength + 3, 10), 35);
    });

    return (await workbook.xlsx.writeBuffer()) as ArrayBuffer;
  };

  const handleFileSelect = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'image/webp'];
    
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const type = (file.type || '').toLowerCase();
      if (validTypes.includes(type)) return true;
      const ext = file.name.split('.').pop()?.toLowerCase();
      return ['jpg', 'jpeg', 'png', 'webp', 'pdf'].includes(ext || '');
    });
    
    if (validFiles.length === 0) {
        showAlert("Format file tidak didukung. Harap unggah file gambar (JPG, PNG, WebP) atau PDF.", { type: "warning", title: "Format Tidak Sesuai" });
        return;
    }

    for (const f of validFiles) {
      if (f.type === 'application/pdf' && f.size > 4.2 * 1024 * 1024) {
        showAlert("Ukuran file PDF tidak boleh lebih dari 4 MB.", { type: "warning", title: "Ukuran PDF Terlalu Besar" });
        return;
      }
    }

    setIsOptimizing(true);
    let optimizedFiles: File[] = [];
    try {
      optimizedFiles = await optimizeFileBatch(validFiles);
    } catch (e) {
      console.warn("Failed optimizing files:", e);
      optimizedFiles = validFiles;
    } finally {
      setIsOptimizing(false);
    }
    
    const newFiles = [...selectedFiles, ...optimizedFiles];
    if (newFiles.length > 5) {
        showAlert("Anda hanya dapat mengunggah maksimal 5 file sekaligus.", { type: "warning", title: "Batas Unggahan" });
        setSelectedFiles(newFiles.slice(0, 5));
    } else {
        setSelectedFiles(newFiles);
    }
    
    setConversionResults([]);
    setPreviewVisible(false);
  };

  const startConversionProcess = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    
    try {
      const readyFiles = await optimizeFileBatch(selectedFiles);

      const formData = new FormData();
      readyFiles.forEach((file) => {
          formData.append("files", file);
      });

      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      const responseText = await response.text();
      let data: { error?: string; results?: unknown[] } | null = null;
      try {
        data = JSON.parse(responseText);
      } catch {
        // Response is not JSON
      }
      
      if (!response.ok) {
        if (response.status === 413) {
          throw new Error("Ukuran foto/file melebihi batas upload server. Silakan coba ambil foto dari jarak lebih dekat atau pilih foto yang lebih ringkas.");
        }
        if (data && data.error) {
          throw new Error(data.error);
        }
        if (response.status === 504) {
          throw new Error("Waktu pemrosesan habis (Timeout). Silakan coba lagi beberapa saat.");
        }
        throw new Error(
          responseText.length > 0 && responseText.length < 120
            ? responseText
            : `Terjadi kendala pada server (Status ${response.status}). Silakan coba beberapa saat lagi.`
        );
      }
      
      if (!data || !data.results) {
        throw new Error("Gagal menerima hasil konversi dari AI. Silakan coba lagi.");
      }

      setConversionResults(data.results || []);
      
    } catch (error: unknown) {
      console.error("Error uploading file:", error);
      const errMsg = error instanceof Error ? error.message : "Terjadi kesalahan saat mengkonversi gambar.";
      showAlert(errMsg, { type: "error" });
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
    e.target.value = "";
  };

  const handleStartOver = () => {
      setSelectedFiles([]);
      setConversionResults([]);
      setPreviewVisible(false);
      setActiveTableIndex(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleCopy = () => {
      if (conversionResults.length > 0) {
          const activeTable = normalizeTableData(conversionResults[activeTableIndex] || conversionResults[0]);
          const tsvText = activeTable.rows
            .map(row => row.map(cell => cell.text).join('\t'))
            .join('\r\n');
          navigator.clipboard.writeText(tsvText);
          showAlert("Data tabel berhasil disalin ke clipboard!", { type: "success" });
      }
  };

  const downloadSingleTable = async (index: number) => {
      const raw = conversionResults[index];
      if (!raw) return;
      try {
          const table = normalizeTableData(raw);
          const buffer = await generateExcelBuffer(table);
          const blob = new Blob([buffer], { 
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
          });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          const rawName = selectedFiles[index]?.name ? selectedFiles[index].name.replace(/\.[^/.]+$/, "") : `table_${index + 1}`;
          const cleanName = rawName.replace(/[/\\?%*:|"<>]/g, '_').trim();
          link.setAttribute("download", `${cleanName}.xlsx`);
          document.body.appendChild(link);
          link.click();
          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          }, 300);
      } catch (e) {
          console.error("Error exporting Excel:", e);
          showAlert("Gagal mengunduh file Excel.", { type: "error" });
      }
  };

  const downloadSingleCsv = (index: number) => {
      const raw = conversionResults[index];
      if (!raw) return;
      try {
          const table = normalizeTableData(raw);
          const csv = toCsvString(table);
          const bom = "\uFEFF";
          const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          const rawName = selectedFiles[index]?.name ? selectedFiles[index].name.replace(/\.[^/.]+$/, "") : `table_${index + 1}`;
          const cleanName = rawName.replace(/[/\\?%*:|"<>]/g, '_').trim();
          link.setAttribute("download", `${cleanName}.csv`);
          document.body.appendChild(link);
          link.click();
          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          }, 300);
      } catch (e) {
          console.error("Error downloading CSV:", e);
          showAlert("Gagal mengunduh file CSV.", { type: "error" });
      }
  };

  const handleDownload = async () => {
      if (conversionResults.length === 0) return;
      
      if (conversionResults.length === 1) {
          await downloadSingleTable(0);
      } else {
          try {
              // Dynamically import JSZip on-demand to save bundle size
              const JSZipModule = await import("jszip");
              const JSZip = JSZipModule.default || JSZipModule;
              const zip = new JSZip();
              
              for (let index = 0; index < conversionResults.length; index++) {
                  const table = normalizeTableData(conversionResults[index]);
                  const rawName = selectedFiles[index]?.name ? selectedFiles[index].name.replace(/\.[^/.]+$/, "") : `table_${index + 1}`;
                  const cleanName = rawName.replace(/[/\\?%*:|"<>]/g, '_').trim();
                  const buffer = await generateExcelBuffer(table);
                  zip.file(`${cleanName}.xlsx`, buffer);
              }
              
              const content = await zip.generateAsync({ type: "blob" });
              const url = window.URL.createObjectURL(content);
              const link = document.createElement("a");
              link.href = url;
              link.setAttribute("download", `databel_excel_${Date.now()}.zip`);
              document.body.appendChild(link);
              link.click();
              setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
              }, 300);
          } catch (error) {
              console.error("Error creating ZIP file:", error);
              showAlert("Gagal membuat file ZIP.", { type: "error" });
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
    <div className="relative group overflow-hidden rounded-3xl sm:rounded-[2rem] bg-white dark:bg-card border-none p-4 sm:p-8 h-auto flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all duration-500 min-h-[500px] w-full max-w-full min-w-0">
      
      {/* Decorative Blob - GPU-Composited CSS Animation */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-0 animate-pulse-ambient pointer-events-none" />

      <div className={`space-y-6 z-10 flex flex-col items-center w-full min-w-0 transition-all duration-300 ${conversionResults.length > 0 ? 'max-w-5xl' : 'max-w-2xl'}`}>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary/20 px-3.5 py-1 text-xs font-semibold text-secondary-foreground dark:text-secondary transition-colors">
          <span>New AI Engine V2.3 (Borders & Color Match)</span>
          <MoveRight className="w-3 h-3" />
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight lg:text-5xl leading-tight text-foreground">
          <span className="block">The best place to convert</span>
          <span className="block mt-1 sm:mt-2">
            <TypewriterText />{" "}
            <span>to Excel</span>
          </span>
        </h1>
        
        <p className="text-lg text-muted-foreground max-w-lg text-balance">
          Stop typing manually. Let our AI handle the messy table structure for you instantly.
        </p>

        {/* === STATE 1: NO FILE SELECTED (Upload Buttons & Drag-Drop) === */}
        {!selectedFiles.length && (
          <>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full pt-4">
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
                 <button 
                    type="button"
                    onClick={handleUploadPhotoClick}
                    className="w-full sm:w-auto justify-center h-12 px-8 rounded-full bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 transition-transform duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 hover:shadow-primary/40 cursor-pointer"
                 >
                    <Upload className="w-5 h-5" />
                    Upload Photo
                 </button>
                 <button 
                    type="button"
                    onClick={handleUseCameraClick}
                    className="w-full sm:w-auto justify-center h-12 px-8 rounded-full bg-white dark:bg-secondary text-secondary-foreground border-2 border-secondary font-bold transition-transform duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 hover:bg-secondary/10 cursor-pointer"
                 >
                    <Camera className="w-5 h-5" />
                    Use Camera
                 </button>
            </div>
  
            <div
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
                    Supports JPG, PNG, PDF (Maks. 5 file)
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* === STATE 2: FILE SELECTED OR CONVERTING === */}
        {selectedFiles.length > 0 && conversionResults.length === 0 && (
          <div 
             className="w-full max-w-2xl mt-8 bg-card border border-border/50 rounded-2xl shadow-sm p-4 sm:p-6 text-left relative z-20 transition-all duration-200"
          >
             <div className="flex items-center justify-between mb-2">
                 <h3 className="font-bold text-lg text-foreground">Ready to Convert</h3>
                 <button onClick={handleStartOver} disabled={isUploading} className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer" title="Batal">
                     <X className="w-5 h-5" />
                 </button>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-muted/40 p-4 rounded-xl border border-border/50 mb-6 max-h-[240px] overflow-y-auto custom-scrollbar">
                 {selectedFiles.map((file, idx) => (
                     <div key={idx} className="flex items-center gap-3 bg-white dark:bg-card p-2 rounded-lg border border-border/50">
                         <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center overflow-hidden shrink-0 border border-primary/20">
                             {file.type.startsWith('image/') ? (
                                 <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" loading="lazy" />
                             ) : (
                                 <FileSpreadsheet className="w-5 h-5 text-primary" />
                             )}
                         </div>
                         <div className="flex-1 min-w-0 text-left">
                             <p className="font-semibold text-xs text-foreground truncate">{file.name}</p>
                             <p className="text-[10px] text-muted-foreground mt-0.5">{(file.size / 1024).toFixed(0)} KB</p>
                         </div>
                         <button
                             type="button"
                             onClick={(e) => {
                                 e.stopPropagation();
                                 const updated = selectedFiles.filter((_, i) => i !== idx);
                                 setSelectedFiles(updated);
                                 if (updated.length === 0) handleStartOver();
                             }}
                             disabled={isUploading}
                             className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-md hover:bg-muted shrink-0 cursor-pointer"
                             title="Hapus file"
                         >
                             <X className="w-3.5 h-3.5" />
                         </button>
                     </div>
                 ))}
             </div>

             <div className="flex justify-center">
                 <button 
                    type="button"
                    onClick={startConversionProcess}
                    disabled={isUploading || isOptimizing}
                    className={`h-12 px-10 rounded-full bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 transition-transform duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer ${(isUploading || isOptimizing) ? 'opacity-90 cursor-wait' : 'hover:shadow-primary/40'}`}
                 >
                    {isUploading ? (
                        <>
                           <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                           Converting...
                        </>
                    ) : isOptimizing ? (
                        <>
                           <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                           Optimizing...
                        </>
                    ) : (
                        "Convert to Excel"
                    )}
                 </button>
             </div>
          </div>
        )}

        {/* === STATE 3: CONVERSION COMPLETE / SUCCESS === */}
        {conversionResults.length > 0 && (
           <div className="w-full max-w-4xl mt-6 relative z-20 min-w-0 transition-all duration-200">
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

                  <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 w-full">
                      <button 
                        type="button"
                        onClick={() => setPreviewVisible(!previewVisible)}
                        className={`w-full sm:w-auto justify-center h-10 px-4 rounded-full font-medium text-sm transition-all flex items-center gap-2 cursor-pointer ${previewVisible ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                      >
                         <Eye className="w-4 h-4 shrink-0" />
                         <span>Preview</span>
                      </button>
                      <button 
                        type="button"
                        onClick={handleCopy}
                        className="w-full sm:w-auto justify-center h-10 px-4 rounded-full bg-secondary text-secondary-foreground font-medium text-sm hover:bg-secondary/80 transition-all flex items-center gap-2 cursor-pointer"
                      >
                         <Copy className="w-4 h-4 shrink-0" />
                         <span>Copy</span>
                      </button>
                      <button 
                        type="button"
                        onClick={handleDownload}
                        className="w-full sm:w-auto justify-center h-10 px-5 rounded-full bg-green-600 text-white font-bold text-sm hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all flex items-center gap-2 cursor-pointer"
                      >
                         <Download className="w-4 h-4" />
                         <span>{selectedFiles.length === 1 ? "Download Excel (.xlsx)" : "Download Semua (.zip)"}</span>
                      </button>
                      {selectedFiles.length === 1 && (
                          <button 
                            type="button"
                            onClick={() => downloadSingleCsv(0)}
                            className="w-full sm:w-auto justify-center h-10 px-4 rounded-full border border-border bg-background hover:bg-muted text-muted-foreground font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                            title="Download sebagai CSV"
                          >
                             <span>Unduh CSV</span>
                          </button>
                      )}
                  </div>
              </div>

              <button 
                type="button"
                onClick={handleStartOver}
                className="mx-auto w-full sm:w-auto justify-center h-10 px-6 mb-6 rounded-full border border-border bg-white dark:bg-card text-foreground font-medium text-sm hover:bg-muted transition-all flex items-center gap-2 cursor-pointer"
              >
                 <RotateCcw className="w-4 h-4" />
                 Start over
              </button>

              {/* Preview Grid */}
              {previewVisible && (() => {
                  const activeRaw = conversionResults[activeTableIndex] || conversionResults[0];
                  const activeTable = normalizeTableData(activeRaw);
                  const hasBorders = activeTable.has_all_borders;

                  return (
                    <div 
                      className="w-full max-w-full bg-white dark:bg-card border border-border/50 rounded-2xl shadow-sm text-left overflow-hidden min-w-0 transition-all duration-200"
                    >
                        {/* Preview Card Header */}
                        <div className="bg-muted px-4 py-3 border-b border-border/50 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-sm text-foreground">Data Preview</h3>
                                <span className="text-xs text-muted-foreground bg-background/80 px-2 py-0.5 rounded-full border border-border/50">
                                    {activeTable.rows.length} baris
                                </span>
                                {activeTable.title && (
                                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-pink-500/10 text-pink-700 dark:text-pink-300 border border-pink-500/20 px-2.5 py-0.5 rounded-full">
                                    {activeTable.title}
                                  </span>
                                )}
                                {activeTable.border_color && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
                                    Border: {activeTable.border_color}
                                  </span>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <button 
                                  type="button"
                                  onClick={() => downloadSingleTable(activeTableIndex)} 
                                  className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download Excel (.xlsx)</span>
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => downloadSingleCsv(activeTableIndex)} 
                                  className="text-xs bg-background hover:bg-muted text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 border border-border/60 cursor-pointer"
                                  title="Download format CSV"
                                >
                                    <span>CSV</span>
                                </button>
                                <button 
                                  type="button"
                                  onClick={handleCopy} 
                                  className="text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy</span>
                                </button>
                            </div>
                        </div>

                        {/* Multiple Table Tab Switcher */}
                        {conversionResults.length > 1 && (
                            <div className="flex items-center gap-2 overflow-x-auto p-2.5 bg-muted/30 border-b border-border/50 custom-scrollbar">
                                <span className="text-xs font-semibold text-muted-foreground shrink-0 pl-1">Tabel:</span>
                                {conversionResults.map((_, tIdx) => (
                                    <button
                                      type="button"
                                      key={tIdx}
                                      onClick={() => setActiveTableIndex(tIdx)}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                                        activeTableIndex === tIdx
                                          ? 'bg-primary text-primary-foreground shadow-sm'
                                          : 'bg-background hover:bg-muted text-muted-foreground border border-border/60'
                                      }`}
                                    >
                                        {selectedFiles[tIdx]?.name ? (selectedFiles[tIdx].name.length > 20 ? selectedFiles[tIdx].name.substring(0, 18) + '...' : selectedFiles[tIdx].name) : `Tabel ${tIdx + 1}`}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Table Info Bar */}
                        <div className="px-4 py-2 bg-muted/10 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                            <span className="text-muted-foreground">
                                Menampilkan: <strong className="text-foreground">{selectedFiles[activeTableIndex]?.name || `Tabel ${activeTableIndex + 1}`}</strong>
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                                Warna sel & border disinkronkan otomatis sesuai gambar
                            </span>
                        </div>

                        {/* Table Container */}
                        <div className="p-3 sm:p-4 overflow-x-auto custom-scrollbar w-full max-w-full block overscroll-x-contain">
                            <table 
                              className={`w-full text-xs sm:text-sm text-left min-w-max border-collapse ${hasBorders ? 'border' : ''}`}
                              style={{ borderColor: activeTable.border_color || '#C48B80' }}
                            >
                                 <tbody className="text-foreground">
                                     {activeTable.rows.map((row, rowIndex) => {
                                         const isTitleRow = rowIndex === 0 && row.some(c => (c.col_span || 1) > 2);
                                         return (
                                             <tr key={rowIndex} className="hover:bg-primary/5 transition-colors">
                                                 {row.map((cell, cellIndex) => {
                                                     const text = cell?.text ?? '';
                                                     const isCheck = text === '✓' || text.toLowerCase() === 'v' || text === 'âœ“';
                                                     const customBg = cell?.bg_color;
                                                     const customText = cell?.text_color;
                                                     const isBold = Boolean(cell?.bold || isTitleRow);
                                                     const align = cell?.align || (isTitleRow || (cell.col_span && cell.col_span > 1) ? 'center' : 'left');
                                                     const colSpan = Math.max(1, cell?.col_span || 1);
                                                     const cellHasBorder = hasBorders || cell?.border;

                                                     return (
                                                         <td 
                                                           key={cellIndex} 
                                                           colSpan={colSpan}
                                                           style={{
                                                             backgroundColor: customBg || undefined,
                                                             color: customText || undefined,
                                                             borderColor: cellHasBorder ? (activeTable.border_color || '#C48B80') : undefined,
                                                           }}
                                                           className={`px-3.5 py-2 transition-colors ${
                                                             cellHasBorder ? 'border' : ''
                                                           } ${
                                                             isBold ? 'font-bold' : ''
                                                           } ${
                                                             isTitleRow ? 'text-base sm:text-lg text-center py-3.5 tracking-wide' : ''
                                                           } ${
                                                             align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'
                                                           }`}
                                                         >
                                                             {isCheck ? (
                                                                 <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500/15 text-green-600 dark:text-green-400 font-bold text-xs">
                                                                     ✓
                                                                 </span>
                                                             ) : (
                                                                 text !== '' ? text : <span className="opacity-0">-</span>
                                                             )}
                                                         </td>
                                                     );
                                                 })}
                                             </tr>
                                         );
                                     })}
                                 </tbody>
                            </table>
                        </div>
                    </div>
                  );
              })()}
           </div>
        )}

      {/* Closing tags for the white card container */}
      </div>

      {/* Bottom decorative elements - Composited CSS Animation */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[250px] bg-secondary/10 rounded-full blur-2xl -z-0 translate-y-1/2 translate-x-1/4 animate-spin-slow pointer-events-none" />
      {/* Top decorative elements - Composited CSS Animation */}
      <div className="absolute top-0 right-72 w-[500px] h-[250px] bg-secondary/10 rounded-full blur-2xl -z-0 -translate-y-1/2 translate-x-1/4 animate-spin-slow pointer-events-none" />
      
      {/* Floating decorative elements - Composited CSS Animation */}
      <div className="absolute top-10 right-10 text-primary/20 rotate-12 animate-float-1 pointer-events-none">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20"/></svg>
      </div>
      <div className="absolute bottom-10 left-10 text-primary/20 -rotate-12 animate-float-2 pointer-events-none">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20"/></svg>
      </div>

      {/* Centered Web-Themed Modal Alert Notification */}
      {isMounted && typeof document !== "undefined" && modalNotification?.isOpen && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
          onClick={() => setModalNotification(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-card border border-border/80 shadow-2xl p-6 text-center relative overflow-hidden transition-transform duration-200"
          >
            {/* Glow ambient background effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-10 w-40 h-40 bg-primary/20 rounded-full blur-2xl -z-0 pointer-events-none" />

            {/* Close button X */}
            <button
              type="button"
              onClick={() => setModalNotification(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon Circle */}
            <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 relative z-10">
              {modalNotification.type === 'warning' ? (
                <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-sm">
                  <AlertTriangle className="w-7 h-7" />
                </div>
              ) : modalNotification.type === 'error' ? (
                <div className="w-14 h-14 rounded-2xl bg-destructive/15 border border-destructive/30 flex items-center justify-center text-destructive shadow-sm">
                  <AlertCircle className="w-7 h-7" />
                </div>
              ) : modalNotification.type === 'success' ? (
                <div className="w-14 h-14 rounded-2xl bg-green-500/15 border border-green-500/30 flex items-center justify-center text-green-500 shadow-sm">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
                  <Info className="w-7 h-7" />
                </div>
              )}
            </div>

            {/* Title */}
            <h3 className="font-bold text-lg text-foreground mb-2 relative z-10">
              {modalNotification.title}
            </h3>

            {/* Message */}
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 relative z-10">
              {modalNotification.message}
            </p>

            {/* OK Action Button */}
            <div className="relative z-10 flex justify-center">
              <button
                type="button"
                onClick={() => setModalNotification(null)}
                className="w-full sm:w-auto min-w-[130px] h-11 px-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25 transition-transform duration-200 hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
