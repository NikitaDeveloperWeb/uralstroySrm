import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mkdirSync, existsSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/webp',
];

const CATEGORIES = ['contracts', 'reports', 'schedules'] as const;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const where: Record<string, unknown> = {};
  if (category) where.category = category;

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.document.count({ where }),
  ]);

  return NextResponse.json({
    documents,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = formData.get('name') as string;
  const description = (formData.get('description') as string) || null;
  const category = formData.get('category') as string;
  const file = formData.get('file') as File | null;

  if (!name || !category) {
    return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
  }

  if (!CATEGORIES.includes(category as any)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
  const dir = join(process.cwd(), 'public', 'docs', category);
  const filePath = join(dir, fileName);

  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  writeFileSync(filePath, new Uint8Array(bytes));

  const document = await prisma.document.create({
    data: {
      name,
      description,
      category,
      fileName,
      mimeType: file.type,
      fileSize: file.size,
    },
  });

  return NextResponse.json(document, { status: 201 });
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  const body = await request.json();

  const updated = await prisma.document.update({
    where: { id },
    data: {
      name: body.name || document.name,
      description: body.description ?? document.description,
      category: CATEGORIES.includes(body.category as any) ? body.category : document.category,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID not provided' }, { status: 400 });
  }

  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  const filePath = join(process.cwd(), 'public', 'docs', document.category, document.fileName);
  try {
    unlinkSync(filePath);
  } catch {
    // ignore if file doesn't exist
  }

  await prisma.document.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
