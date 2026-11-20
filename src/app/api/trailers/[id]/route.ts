import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const TRAILERS_DIR = path.resolve(process.cwd(), 'TicketX Resources/trailers');

// Helper to find trailer file by movie ID or keywords
function getTrailerFilePath(id: string): string | null {
  if (!fs.existsSync(TRAILERS_DIR)) return null;
  const files = fs.readdirSync(TRAILERS_DIR);

  // 1. Direct filename match
  const direct = files.find((f) => f.toLowerCase() === id.toLowerCase() || f.toLowerCase() === `${id.toLowerCase()}.mp4`);
  if (direct) return path.join(TRAILERS_DIR, direct);

  // 2. Movie ID mappings
  const cleanId = id.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const tokens = cleanId.split(/\s+/).filter((t) => t.length > 2 && t !== 'the' && t !== 'part');

  // Exact phrase match first
  let match = files.find((f) => f.toLowerCase().includes(cleanId));
  if (match) return path.join(TRAILERS_DIR, match);

  // Multi-token match
  if (tokens.length > 0) {
    match = files.find((f) => {
      const lower = f.toLowerCase();
      return tokens.every((tok) => lower.includes(tok));
    });
    if (match) return path.join(TRAILERS_DIR, match);
  }

  // Fallback to first available trailer if none matches so screen always plays something
  if (files.length > 0) {
    return path.join(TRAILERS_DIR, files[0]);
  }

  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const filePath = getTrailerFilePath(decodeURIComponent(id));
    if (!filePath || !fs.existsSync(filePath)) {
      return new NextResponse('Trailer not found', { status: 404 });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.get('range');

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const fileStream = fs.createReadStream(filePath, { start, end });

      const stream = new ReadableStream({
        start(controller) {
          fileStream.on('data', (chunk) => controller.enqueue(chunk));
          fileStream.on('end', () => controller.close());
          fileStream.on('error', (err) => controller.error(err));
        },
      });

      return new NextResponse(stream, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
          'Content-Type': 'video/mp4',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // Full file response
    const fileStream = fs.createReadStream(filePath);
    const stream = new ReadableStream({
      start(controller) {
        fileStream.on('data', (chunk) => controller.enqueue(chunk));
        fileStream.on('end', () => controller.close());
        fileStream.on('error', (err) => controller.error(err));
      },
    });

    return new NextResponse(stream, {
      status: 200,
      headers: {
        'Content-Length': fileSize.toString(),
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Trailer streaming error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}