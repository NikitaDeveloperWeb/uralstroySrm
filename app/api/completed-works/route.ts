import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';
import { createCompletedWorkSchema, updateCompletedWorkSchema } from '@/shared/lib/validators';

// GET /api/completed-works - получить список выполненных работ
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const where: any = {};
    if (projectId) where.projectId = Number(projectId);

    const works = await prisma.completedWork.findMany({
      where,
      include: {
        project: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(works);
  } catch (error) {
    console.error('GET /api/completed-works error:', error);
    return errorResponse('Не удалось получить выполненные работы', 500);
  }
}

// PATCH /api/completed-works - bulk update (replace all for projectId)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, works } = body;

    if (!projectId || !Array.isArray(works)) {
      return errorResponse('Необходим projectId и массив works', 400);
    }

    // Delete existing for this project
    await prisma.completedWork.deleteMany({
      where: { projectId },
    });

    // Create new works
    await prisma.completedWork.createMany({
      data: works.map((w: any) => ({
        projectId,
        name: w.name,
        quantity: w.quantity,
        cost: w.cost,
        category: w.category || null,
      })),
    });

    // Fetch all created
    const all = await prisma.completedWork.findMany({
      where: { projectId },
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(all);
  } catch (error) {
    console.error('PATCH /api/completed-works error:', error);
    return handlePrismaError(error);
  }
}

// POST /api/completed-works - создать выполненную работу
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createCompletedWorkSchema.parse(body);

    const work = await prisma.completedWork.create({
      data: validated,
      include: {
        project: true,
      },
    });

    return successResponse(work, 201);
  } catch (error) {
    console.error('POST /api/completed-works error:', error);
    return handlePrismaError(error);
  }
}
