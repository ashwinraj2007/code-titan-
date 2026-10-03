import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { performDetection } from '@/lib/detector-service';
import { ScanRequest } from '@/types/detector';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body: ScanRequest = await req.json();

    const { text, title, checkParaphrase, checkWebPlagiarism, checkAiWriting } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid submission: Text content is required.' },
        { status: 400 }
      );
    }

    const trimmed = text.trim();
    if (trimmed.length < 20) {
      return NextResponse.json(
        { error: 'Text is too short for reliable analysis. Please provide at least 20 characters.' },
        { status: 400 }
      );
    }

    // Limit to 25,000 characters per scan (~4,000 words) for free student tier
    if (trimmed.length > 25000) {
      return NextResponse.json(
        { error: 'Document exceeds free student tier limit (maximum 25,000 characters per scan).' },
        { status: 413 }
      );
    }

    const result = await performDetection(trimmed, {
      documentTitle: title || 'Document Analysis',
      checkParaphrase: checkParaphrase ?? true,
      checkWebPlagiarism: checkWebPlagiarism ?? true,
      checkAiWriting: checkAiWriting ?? true,
    });

    return NextResponse.json({
      success: true,
      data: result,
      userTier: session?.user ? (session.user as any).tier || 'free_student' : 'guest_preview',
      isStudent: session?.user ? (session.user as any).isStudent ?? true : true,
    });
  } catch (error: any) {
    console.error('API /api/detect error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal detector engine error.' },
      { status: 500 }
    );
  }
}
