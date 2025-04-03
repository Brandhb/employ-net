import { createLogger } from './logger';

const logger = createLogger('circuit-breaker');

interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
}

export class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount: number = 0;
  private nextAttempt: number = Date.now();
  private readonly options: CircuitBreakerOptions;

  constructor(options: CircuitBreakerOptions = { failureThreshold: 3, resetTimeout: 30000 }) {
    this.options = options;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() > this.nextAttempt) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
    logger.info(`Circuit breaker state: ${this.state}`);
  }

  private onFailure(): void {
    this.failureCount++;
    logger.warn(`Circuit breaker failure count: ${this.failureCount}`);

    if (this.failureCount >= this.options.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.options.resetTimeout;
      logger.error(`Circuit breaker OPEN until ${new Date(this.nextAttempt)}`);
    }
  }
}

// Create circuit breakers for different services
export const typeformCircuitBreaker = new CircuitBreaker();
export const muxCircuitBreaker = new CircuitBreaker();
export const paymentCircuitBreaker = new CircuitBreaker();