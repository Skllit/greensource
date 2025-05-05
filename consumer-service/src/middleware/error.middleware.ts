import { Request, Response, NextFunction } from "express";
import { AppError } from "../types/error";
import dotenv from "dotenv";
dotenv.config();

interface ErrorResponse {
  success: boolean;
  error: {
    code: number;
    message: string;
    details?: any;
  };
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): Response<ErrorResponse> => {
  console.error("Error:", err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.statusCode,
        message: err.message,
      },
    });
  }

  // Handle mongoose validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        message: "Validation Error",
        details: err.message,
      },
    });
  }

  // Handle mongoose duplicate key errors
  if (err.name === "MongoServerError" && (err as any).code === 11000) {
    return res.status(409).json({
      success: false,
      error: {
        code: 409,
        message: "Duplicate key error",
        details: err.message,
      },
    });
  }

  // Default error
  return res.status(500).json({
    success: false,
    error: {
      code: 500,
      message: "Internal Server Error",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    },
  });
};
