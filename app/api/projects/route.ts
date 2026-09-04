import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';
import { createProjectSchema, updateProjectSchema } from '@/shared/lib/validators';

// GET /api/projects - получить список проектов
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const brigadeId = searchParams.get('brigadeId');

    const where: any = {};
    if (status) where.status = status;
    if (brigadeId) where.brigadeId = Number(brigadeId);

    const projects = await prisma.project.findMany({
      where,
      include: {
        brigade: true,
        unitRate: true,
        materials: true,
        completedWorks: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(projects);
  } catch (error) {
    console.error('GET /api/projects error:', error);
    return errorResponse('Не удалось получить проекты', 500);
  }
}


// POST /api/projects - создать проект
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createProjectSchema.parse(body);

    const project = await prisma.project.create({
      data: validated,
      include: {
        brigade: true,
        unitRate: true,
        materials: true,
        completedWorks: true,
      },
    });

    return successResponse(project, 201);
  } catch (error) {
    console.error('POST /api/projects error:', error);
    return handlePrismaError(error);
  }
}
