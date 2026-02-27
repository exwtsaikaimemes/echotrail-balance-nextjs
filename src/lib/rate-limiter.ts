// Sliding window rate limiter
// 5 attempts per minute per IP

const windowMs = 60 * 1000; // 1 minute
const maxAttempts = 5;
const attempts = new Map<string, number[]>();

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  let timestamps = attempts.get(ip) || [];
  timestamps = timestamps.filter(t => t > windowStart);

  if (timestamps.length >= maxAttempts) {
    const resetAt = timestamps[0] + windowMs;
    return { allowed: false, remaining: 0, resetAt };
  }

  timestamps.push(now);
  attempts.set(ip, timestamps);

  return { allowed: true, remaining: maxAttempts - timestamps.length, resetAt: now + windowMs };
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  const windowStart = now - windowMs;
  attempts.forEach((timestamps, ip) => {
    const valid = timestamps.filter(t => t > windowStart);
    if (valid.length === 0) attempts.delete(ip);
    else attempts.set(ip, valid);
  });
}, 60 * 1000);
