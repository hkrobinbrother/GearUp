/**
 * Custom application error class.
 * Any error thrown with this class is caught by the global error handler
 * and converted into the standard { success, message, errorDetails } shape.
 */
class ApiError extends Error {
  statusCode: number;
  errorDetails?: unknown;
  isOperational: boolean;

  constructor(statusCode: number, message: string, errorDetails?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.errorDetails = errorDetails;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
