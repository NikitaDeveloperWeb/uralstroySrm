import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const fileName = url.searchParams.get('file') || '';

  const document = await prisma.document.findFirst({
    where: { fileName },
  });

  if (!document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  const filePath = join(process.cwd(), 'public', 'docs', document.category, document.fileName);

  if (!existsSync(filePath)) {
    return NextResponse.json(
      { error: 'File not found on server' },
      { status: 404 }
    );
  }

  const fileBuffer = readFileSync(filePath);

  const response = new NextResponse(fileBuffer);

  const encodedName = encodeURIComponent(document.fileName).replace(/['()]/g, escape);
  response.headers.set('Content-Disposition', `attachment; filename="${encodedName}"; filename*=UTF-8''${encodedName}`);
  response.headers.set('Content-Type', document.mimeType || 'application/octet-stream');
  if (document.fileSize) {
    response.headers.set('Content-Length', document.fileSize.toString());
  }

  return response;
}
