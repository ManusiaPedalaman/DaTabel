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

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
              prompt, 
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType
                }
              }
            ]
        });

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
    return NextResponse.json({ error: error?.message || "Failed to process image(s) with AI" }, { status: 500 });
  }
}


