import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';
import { createEmployeeSchema, updateEmployeeSchema } from '@/shared/lib/validators';

// GET /api/employees - получить список сотрудников
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brigadeId = searchParams.get('brigadeId');

    const where: any = {};
    if (brigadeId) where.brigadeId = Number(brigadeId);

    const employees = await prisma.employee.findMany({
      where,
      include: {
        brigade: true,
        workReports: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(employees);
  } catch (error) {
    console.error('GET /api/employees error:', error);
    return errorResponse('Не удалось получить сотрудников', 500);
  }
}

// POST /api/employees - создать сотрудника
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createEmployeeSchema.parse(body);

    const employee = await prisma.employee.create({
      data: validated,
      include: {
        brigade: true,
        workReports: true,
      },
    });

    return successResponse(employee, 201);
  } catch (error) {
    console.error('POST /api/employees error:', error);
    return handlePrismaError(error);
  }
}
