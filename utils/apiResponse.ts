import { NextResponse } from "next/server";

// ─── Standardized API Response ───
export interface ApiResponseBody<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    { success: true, data } satisfies ApiResponseBody<T>,
    { status }
  );
}

export function messageResponse(message: string, status = 200) {
  return NextResponse.json(
    { success: true, message } satisfies ApiResponseBody,
    { status }
  );
}

export function errorResponse(error: string, status = 500) {
  return NextResponse.json(
    { success: false, error } satisfies ApiResponseBody,
    { status }
  );
}

// ─── Custom Error Classes ───
export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.name = "ValidationError";
  }
}

export class AuthError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
    this.name = "AuthError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
    this.name = "ConflictError";
  }
}

// ─── Centralized Error Handler ───
export function handleApiError(error: unknown) {
  console.error("[API Error]", error);

  if (error instanceof AppError) {
    return errorResponse(error.message, error.statusCode);
  }

  if (error instanceof Error) {
    return errorResponse(error.message, 500);
  }

  return errorResponse("An unexpected error occurred", 500);
}
