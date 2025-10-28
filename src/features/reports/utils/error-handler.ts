/**
 * Error Handling Utilities for Report Generation
 */

export class ReportGenerationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ReportGenerationError';
  }
}

export class ValidationError extends ReportGenerationError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class BlockchainFetchError extends ReportGenerationError {
  constructor(message: string, details?: unknown) {
    super(message, 'BLOCKCHAIN_FETCH_ERROR', 503, details);
    this.name = 'BlockchainFetchError';
  }
}

export class PriceFetchError extends ReportGenerationError {
  constructor(message: string, details?: unknown) {
    super(message, 'PRICE_FETCH_ERROR', 503, details);
    this.name = 'PriceFetchError';
  }
}

export class TaxCalculationError extends ReportGenerationError {
  constructor(message: string, details?: unknown) {
    super(message, 'TAX_CALCULATION_ERROR', 500, details);
    this.name = 'TaxCalculationError';
  }
}

export class ReportFormatError extends ReportGenerationError {
  constructor(message: string, details?: unknown) {
    super(message, 'REPORT_FORMAT_ERROR', 500, details);
    this.name = 'ReportFormatError';
  }
}

/**
 * Format error for API response
 */
export function formatErrorResponse(error: unknown): {
  error: string;
  code?: string;
  details?: unknown;
} {
  if (error instanceof ReportGenerationError) {
    return {
      error: error.message,
      code: error.code,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      error: error.message,
      code: 'UNKNOWN_ERROR',
    };
  }

  return {
    error: 'An unknown error occurred',
    code: 'UNKNOWN_ERROR',
  };
}

/**
 * Check if error is recoverable (user can retry)
 */
export function isRecoverableError(error: unknown): boolean {
  if (error instanceof BlockchainFetchError) return true;
  if (error instanceof PriceFetchError) return true;
  if (error instanceof ValidationError) return false; // User needs to fix input
  
  return false;
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof ValidationError) {
    return `Error de validación: ${error.message}`;
  }

  if (error instanceof BlockchainFetchError) {
    return 'No se pudieron obtener las transacciones de la blockchain. Por favor, inténtalo de nuevo.';
  }

  if (error instanceof PriceFetchError) {
    return 'No se pudieron obtener los precios históricos. Por favor, inténtalo de nuevo.';
  }

  if (error instanceof TaxCalculationError) {
    return 'Error al calcular los impuestos. Por favor, contacta con soporte.';
  }

  if (error instanceof ReportFormatError) {
    return 'Error al generar el formato del informe. Por favor, contacta con soporte.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ha ocurrido un error desconocido. Por favor, inténtalo de nuevo.';
}

