import { z } from "zod";

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, "VALIDATION_ERROR", 400, details);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "You are not authorized to perform this action") {
    super(message, "UNAUTHORIZED", 401);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, "NOT_FOUND", 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, "CONFLICT", 409);
  }
}

export interface Result<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export function handleError(error: unknown): Result<never> {
  console.error("Error:", error);

  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
  }

  if (error instanceof z.ZodError) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: error.errors,
      },
    };
  }

  // Handle Prisma errors
  if (error && typeof error === "object" && "code" in error) {
    const prismaError = error as { code: string; message: string };
    switch (prismaError.code) {
      case "P2002":
        return {
          success: false,
          error: {
            code: "DUPLICATE_ENTRY",
            message: "A record with this information already exists",
          },
        };
      case "P2025":
        return {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Record not found",
          },
        };
    }
  }

  // Default error response
  return {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    },
  };
}

export function success<T>(data: T): Result<T> {
  return {
    success: true,
    data,
  };
}