import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file was provided in the upload request.' },
        { status: 400 }
      );
    }

    const fileName = file.name || 'document';
    const lowerName = fileName.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = '';

    if (lowerName.endsWith('.docx')) {
      // Extract from Microsoft Word (.docx)
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value || '';

    } else if (lowerName.endsWith('.pdf')) {
      // Extract from PDF using pdf-parse v1 (simple function, no workers needed)
      try {
        const pdfParse = require('pdf-parse');
        const data = await pdfParse(buffer);
        extractedText = data.text || '';
      } catch (pdfErr: any) {
        console.warn('PDF parse error:', pdfErr?.message);
      }

    } else {
      // Plain text, Markdown, RTF, CSV, HTML
      extractedText = buffer.toString('utf-8');
      extractedText = extractedText.replace(/<[^>]*>?/gm, ' ');
    }

    // Clean whitespace and remove control characters
    const cleaned = extractedText
      .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .replace(/\r\n/g, '\n')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    if (!cleaned) {
      return NextResponse.json(
        { error: 'Could not extract readable text from this file. The file may be empty or an image-only scan.' },
        { status: 422 }
      );
    }

    const words = cleaned.split(/\s+/).filter(Boolean).length;

    return NextResponse.json({
      success: true,
      text: cleaned,
      fileName,
      wordCount: words,
      characterCount: cleaned.length,
    });

  } catch (error: any) {
    console.error('Error in /api/extract-text:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to extract text from file.' },
      { status: 500 }
    );
  }
}

