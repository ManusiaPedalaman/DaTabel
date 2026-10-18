import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // 1. Terima gambar dari hero.tsx
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (files.length > 5) {
      return NextResponse.json({ error: "Maximum 5 files allowed" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY environment variable is not configured." }, { status: 500 });
    }

    // 2. Hubungi Gemini AI menggunakan API Key
    const ai = new GoogleGenAI({ apiKey });
    
    // 3. Berikan instruksi (prompt) ke Gemini untuk mendeteksi data, border, warna, judul, dan metadata
    const prompt = `You are an expert document and table digitization AI.
Digitize the entire page from the image into a clean spreadsheet structure with high visual fidelity.

CRITICAL INSTRUCTIONS:
1. CAPTURE EVERYTHING ON THE PAGE (Title, Metadata, Tables, Footers):
   - Document Title: If there is a title or heading at the top (e.g. 'Daftar Belanja Bulanan'), include it as the first row. It should span across all columns ("col_span": total columns, e.g. 6).
   - Metadata / Info Header Boxes: If there is an info block or meta box above/around the tables (e.g. 'Bulan: Maret', 'Tempat Belanja: Grosir + minimarket', 'Anggaran: 850.000', 'Sebenarnya:', 'Selisih:'), recreate each row faithfully with all its labels and values, respecting column spans.
   - Side-by-side tables: If tables are displayed side-by-side (e.g. 2 sets of 'Nama Barang', 'Uk.', 'Harga'), capture all columns in the same rows (e.g. 6 columns wide: col 1-3 is left table, col 4-6 is right table).
   - Blank / Empty rows: Include blank rows or empty cells where they appear in the original grid layout (e.g. empty right-hand table rows or separator rows).

2. BORDERS & BORDER COLOR:
   - Identify if the tables and boxes have visible borders. Set "has_all_borders": true.
   - Detect the exact border line color (e.g. peach/rose/coral/brown hex code like '#D3A79E', '#C48B80', '#E2B0A6', or '#CBD5E1') as "border_color".
   - Each cell in a bordered box/table should have "border": true.

3. COLORS & FORMATTING:
   - Detect background color ("bg_color") for every cell (e.g. peach/pinkish fills for headers and info boxes, white or null for blank rows).
   - Detect appropriate text color ("text_color") and font weight ("bold": true/false).
   - Alignment ("align"): "center" for numbers, dates, units, codes, or headers; "left" for item names/descriptions; "right" for prices/currency.

Return ONLY raw JSON with this exact schema. Do NOT wrap in markdown code fences (\`\`\`json), do NOT include any introductory or concluding text:
{
  "title": "Daftar Belanja Bulanan",
  "has_all_borders": true,
  "border_color": "#C48B80",
  "rows": [
    [
      { "text": "...", "bg_color": "#HEX or null", "text_color": "#HEX or null", "bold": true/false, "align": "left/center/right", "border": true/false, "col_span": 1 }
    ]
  ]
}`;

    // Priority models with fallback
    const candidateModels = ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest', 'gemini-2.5-flash'];

    const generateContentWithRetry = async (contents: any) => {
      let lastError: any = null;
      for (const model of candidateModels) {
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            return await ai.models.generateContent({
              model,
              contents,
            });
          } catch (err: any) {
            lastError = err;
            const errMsg = String(err?.message || '');
            if (errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE') || errMsg.includes('429')) {
              // Wait 1.5s before retry or fallback
              await new Promise((resolve) => setTimeout(resolve, 1500));
              continue;
            }
            // For other errors, break attempt loop and try next candidate model
            break;
          }
        }
      }
      throw lastError;
    };
    
    // Process all files in parallel
    const conversionPromises = files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString('base64');

        let mimeType = file.type;
        if (!mimeType || mimeType === 'application/octet-stream') {
          const ext = file.name.split('.').pop()?.toLowerCase();
          if (ext === 'pdf') mimeType = 'application/pdf';
          else if (ext === 'png') mimeType = 'image/png';
          else if (ext === 'webp') mimeType = 'image/webp';
          else mimeType = 'image/jpeg';
        }

        const response = await generateContentWithRetry([
          prompt, 
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          }
        ]);

        let text = response.text || "";
        // Clean markdown code fences if present
        text = text.replace(/^```(?:json|csv)?\s*/gi, '').replace(/\s*```$/gi, '').trim();

        let tableData: any = null;

        // Try parsing JSON from Gemini
        try {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed && Array.isArray(parsed.rows)) {
              const sanitizedRows = parsed.rows.map((row: any[]) => {
                if (!Array.isArray(row)) return [];
                return row.map((cell: any) => {
                  if (typeof cell === 'string') {
                    return {
                      text: cell,
                      bg_color: null,
                      text_color: null,
                      bold: false,
                      align: 'left',
                      col_span: 1
                    };
                  }
                  return {
                    text: String(cell?.text ?? ''),
                    bg_color: typeof cell?.bg_color === 'string' && cell.bg_color.startsWith('#') ? cell.bg_color : null,
                    text_color: typeof cell?.text_color === 'string' && cell.text_color.startsWith('#') ? cell.text_color : null,
                    bold: Boolean(cell?.bold),
                    align: ['left', 'center', 'right'].includes(cell?.align) ? cell.align : 'left',
                    border: cell?.border !== undefined ? Boolean(cell.border) : undefined,
                    col_span: typeof cell?.col_span === 'number' && cell.col_span > 1 ? cell.col_span : 1
                  };
                });
              });

              tableData = {
                title: typeof parsed.title === 'string' ? parsed.title : undefined,
                has_all_borders: Boolean(parsed.has_all_borders ?? true),
                border_color: typeof parsed.border_color === 'string' && parsed.border_color.startsWith('#') ? parsed.border_color : '#C48B80',
                rows: sanitizedRows
              };
            }
          }
        } catch (e) {
          console.warn("JSON parsing failed, falling back to line split:", e);
        }

        // Fallback to CSV parsing if Gemini returned text or CSV
        if (!tableData) {
          const lines = text.split('\n').filter(l => l.trim().length > 0);
          const firstCsvLineIndex = lines.findIndex(line => line.includes(',') || line.includes(';') || line.includes('\t'));
          const relevantLines = firstCsvLineIndex >= 0 ? lines.slice(firstCsvLineIndex) : lines;
          
          const rows = relevantLines.map((line, rowIdx) => {
            const separator = line.includes('\t') ? '\t' : (line.includes(';') ? ';' : ',');
            return line.split(separator).map((col, colIdx) => ({
              text: col.replace(/^["']|["']$/g, '').trim(),
              bg_color: null,
              text_color: null,
              bold: rowIdx === 0,
              align: colIdx === 0 ? 'center' : 'left'
            }));
          });

          tableData = {
            has_all_borders: true,
            rows: rows
          };
        }

        return tableData;
    });

    const results = await Promise.all(conversionPromises);

    // 4. Kembalikan array data rapi ke tampilan layar depan pengguna
    return NextResponse.json({ results });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    let errorMessage = error?.message || "Failed to process image(s) with AI";
    try {
      const parsed = JSON.parse(errorMessage);
      if (parsed?.error?.message) {
        errorMessage = parsed.error.message;
      }
    } catch {
      // not JSON string, keep as is
    }

    if (errorMessage.includes("high demand") || errorMessage.includes("503")) {
      errorMessage = "Server AI sedang mengalami lonjakan trafik yang tinggi. Silakan tunggu beberapa detik dan coba lagi.";
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}


