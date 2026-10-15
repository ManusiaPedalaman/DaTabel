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
    
    // 3. Berikan instruksi (prompt) ke Gemini
    const prompt = "You are a table extraction AI. Extract the tabular data from the image into clean CSV format. Output ONLY the CSV rows (header and data). Do NOT include any intro text, title, preamble, markdown formatting, backticks, or comments.";

    // Fallback models if primary model is experiencing high demand (503)
    const candidateModels = ['gemini-2.5-flash', 'gemini-3.5-flash-lite'];

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
        text = text.replace(/^```(?:csv)?\s*/gi, '').replace(/\s*```$/gi, '').trim();

        // If preamble exists before table headers, strip preamble lines
        const lines = text.split('\n');
        const firstCsvLineIndex = lines.findIndex(line => line.includes(',') || line.includes(';') || line.includes('\t'));
        if (firstCsvLineIndex > 0) {
          text = lines.slice(firstCsvLineIndex).join('\n');
        }

        return text;
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


