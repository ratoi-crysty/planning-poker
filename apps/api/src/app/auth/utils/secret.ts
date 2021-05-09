import { RuntimeException } from '@nestjs/core/errors/exceptions/runtime.exception';

export function getSecret(): string {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_TOKEN) {
    throw new RuntimeException('Cannot start the application without a valid JWT_TOKEN');
  }

  return process.env.JWT_TOKEN || 'devJwtKey';
}
