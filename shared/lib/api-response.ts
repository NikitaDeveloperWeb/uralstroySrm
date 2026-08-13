import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(
  message: string,
  status: number = 400,
  errors?: unknown
) {
  const body: Record<string, unknown> = {
    success: false,
    error: message,
  };
  if (errors) {
    body.errors = errors;
  }
  return NextResponse.json(body, { status });
}

export function handlePrismaError(error: unknown): Response {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        const field = error.meta?.target as string[] | undefined;
        return errorResponse(
          `Запись с таким ${field?.[0] || 'параметром'} уже существует`,
          409,
          { field: field }
        );
      }
      case 'P2025':
        return errorResponse('Запись не найдена', 404);
      case 'P2003':
        return errorResponse(
          'Невозможно удалить: запись используется в других данных',
          400
        );
      case 'P2023':
        return errorResponse(
          'Данные связи не найдены',
          400
        );
      default:
        console.error('Prisma error:', error.code, error.message);
        return errorResponse('Ошибка базы данных', 500);
    }
  }

  if (error instanceof ZodError) {
    return errorResponse(
      'Некорректные данные',
      400,
      error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }))
    );
  }

  if (error instanceof Error) {
    console.error('Request error:', error.message);
    return errorResponse(error.message, 400);
  }

  return errorResponse('Внутренняя ошибка сервера', 500);
}

export function deletedResponse(): Response {
  return new NextResponse(null, { status: 204 });
}
