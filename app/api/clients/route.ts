import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';
import { createClientSchema } from '@/shared/lib/validators';

// GET /api/clients - получить список клиентов
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const clients = await prisma.client.findMany({
      where,
      include: {
        projects: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(clients);
  } catch (error) {
    console.error('GET /api/clients error:', error);
    return errorResponse('Не удалось получить клиентов', 500);
  }
}

// POST /api/clients - создать клиента
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createClientSchema.parse(body);

    const client = await prisma.client.create({
      data: validated,
      include: {
        projects: true,
      },
    });

    return successResponse(client, 201);
  } catch (error) {
    console.error('POST /api/clients error:', error);
    return handlePrismaError(error);
  }
}
