import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function extractPdfText(buffer: Buffer): Promise<string> {
  // Use pdfjs-dist legacy build directly — installed as a dependency of pdf-parse
  // The legacy build is the correct one for Node.js server environments
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs' as any);

  // Point worker to the bundled worker file using an absolute file:// URL
  const workerPath = path.join(
    process.cwd(),
    'node_modules',
    'pdfjs-dist',
    'legacy',
    'build',
    'pdf.worker.mjs'
  );
  pdfjsLib.GlobalWorkerOptions.workerSrc = `file:///${workerPath.replace(/\\/g, '/')}`;

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  let text = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = (content.items as any[])
      .map((item: any) => item.str)
      .join(' ');
    text += pageText + '\n';
    page.cleanup();
  }

  return text;
}

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
      // Extract from Adobe PDF using pdfjs-dist legacy build
      try {
        extractedText = await extractPdfText(buffer);
      } catch (pdfErr: any) {
        console.warn('PDF extraction failed:', pdfErr?.message);
      }
    } else {
      // Plain text, Markdown, RTF, CSV, HTML
      extractedText = buffer.toString('utf-8');
      // Strip HTML tags if any
      extractedText = extractedText.replace(/<[^>]*>?/gm, ' ');
    }

    // Clean whitespace and remove control chars
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
