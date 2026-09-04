import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';
import { createTechEquipmentSchema } from '@/shared/lib/validators';

export async function GET() {
  try {
    const equipment = await prisma.techEquipment.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(equipment);
  } catch (error) {
    console.error('GET /api/tech-equipment error:', error);
    return errorResponse('Не удалось получить технику', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createTechEquipmentSchema.parse(body);

    const equipment = await prisma.techEquipment.create({
      data: validated,
    });

    return successResponse(equipment, 201);
  } catch (error) {
    console.error('POST /api/tech-equipment error:', error);
    return handlePrismaError(error);
  }
}
