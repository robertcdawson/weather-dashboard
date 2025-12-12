interface RateLimiterOptions {
  maxRequests: number;
  timeWindow: number; // in milliseconds
}

class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private timeWindow: number;

  constructor({ maxRequests, timeWindow }: RateLimiterOptions) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
  }

  async acquireToken(): Promise<void> {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.timeWindow - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.acquireToken();
    }

    this.requests.push(now);
  }
}

// Create instances for different APIs
export const weatherRateLimiter = new RateLimiter({
  maxRequests: 10,
  timeWindow: 10000, // 10 seconds
});

export const airQualityRateLimiter = new RateLimiter({
  maxRequests: 5,
  timeWindow: 10000, // 10 seconds
}); 