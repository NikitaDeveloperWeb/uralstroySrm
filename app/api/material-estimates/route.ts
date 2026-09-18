import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';
import { createMaterialEstimateSchema, updateMaterialEstimateSchema } from '@/shared/lib/validators';

// GET /api/material-estimates - получить список смет материалов
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const where: any = {};
    if (projectId) where.projectId = Number(projectId);

    const estimates = await prisma.materialEstimate.findMany({
      where,
      include: {
        project: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(estimates);
  } catch (error) {
    console.error('GET /api/material-estimates error:', error);
    return errorResponse('Не удалось получить сметы материалов', 500);
  }
}

// PATCH /api/material-estimates - bulk update (replace all for projectId)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, estimates } = body;

    if (!projectId || !Array.isArray(estimates)) {
      return errorResponse('Необходим projectId и массив estimates', 400);
    }

    // Delete existing for this project
    await prisma.materialEstimate.deleteMany({
      where: { projectId },
    });

    // Create new estimates
    const created = await prisma.materialEstimate.createMany({
      data: estimates.map((e: any) => ({
        projectId,
        name: e.name,
        quantity: e.quantity,
        cost: e.cost,
        category: e.category || null,
        stage: e.stage || null,
      })),
    });

    // Fetch all created
    const all = await prisma.materialEstimate.findMany({
      where: { projectId },
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(all);
  } catch (error) {
    console.error('PATCH /api/material-estimates error:', error);
    return handlePrismaError(error);
  }
}

// POST /api/material-estimates - создать смету материала
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Разрешаем создавать пустые заготовки
    const projectId = Number(body.projectId);
    if (!projectId) {
      return errorResponse('Не указан projectId', 400);
    }

    const estimate = await prisma.materialEstimate.create({
      data: {
        projectId,
        name: body.name || '',
        quantity: body.quantity || '',
        cost: Number(body.cost) || 0,
        category: body.category || null,
        stage: body.stage || null,
      },
      include: {
        project: true,
      },
    });

    return successResponse(estimate, 201);
  } catch (error) {
    console.error('POST /api/material-estimates error:', error);
    return handlePrismaError(error);
  }
}
