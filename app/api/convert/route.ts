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

    // 2. Hubungi Gemini AI menggunakan API Key
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // 3. Berikan instruksi (prompt) ke Gemini
    const prompt = "Please convert this table image into structured CSV data. Return ONLY the raw CSV text without markdown blocks.";
    
    // Process all files in parallel
    const conversionPromises = files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString('base64');

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
              prompt, 
              {
                inlineData: {
                  data: base64Data,
                  mimeType: file.type
                }
              }
            ]
        });
        return response.text;
    });

    const results = await Promise.all(conversionPromises);

    // 4. Kembalikan array data rapi ke tampilan layar depan pengguna
    return NextResponse.json({ results });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to process image(s) with AI" }, { status: 500 });
  }
}
