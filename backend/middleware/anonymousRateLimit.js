// middleware/anonymousRateLimit.js
// ──────────────────────────────────────────────────────────────
// Simple in-memory rate limiter for anonymous QR creation.
// Limits: 10 QR codes per session token per day.
// For production, replace the in-memory store with Redis.
// ──────────────────────────────────────────────────────────────

const rateLimitStore = new Map(); // key: sessionToken, value: { count, resetAt }

const ANON_DAILY_LIMIT = 10;    // max QR codes per anonymous session per day
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
// BUG-005 fix: cap maximum entries to prevent memory exhaustion
const MAX_STORE_ENTRIES = 10000;

const anonymousRateLimit = (req, res, next) => {
  // Only rate-limit anonymous users
  if (req.userId) return next(); // authenticated user — skip

  const sessionToken = req.sessionToken;
  if (!sessionToken) return next(); // no token — will be rejected by optionalAuth anyway

  const now = Date.now();

  // Reject new entries if store is at capacity (DoS protection)
  if (!rateLimitStore.has(sessionToken) && rateLimitStore.size >= MAX_STORE_ENTRIES) {
    return res.status(429).json({
      success: false,
      message: 'Server is busy. Please try again later or create a free account.',
    });
  }

  let entry = rateLimitStore.get(sessionToken);

  // Reset if window has expired
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    rateLimitStore.set(sessionToken, entry);
  }

  entry.count += 1;

  if (entry.count > ANON_DAILY_LIMIT) {
    return res.status(429).json({
      success: false,
      message: `You've reached the daily limit of ${ANON_DAILY_LIMIT} QR codes. Create a free account for unlimited access.`,
      limit: ANON_DAILY_LIMIT,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    });
  }

  // Set rate limit headers
  res.set({
    'X-RateLimit-Limit': ANON_DAILY_LIMIT,
    'X-RateLimit-Remaining': ANON_DAILY_LIMIT - entry.count,
    'X-RateLimit-Reset': Math.ceil(entry.resetAt / 1000),
  });

  next();
};

// Periodic cleanup to prevent memory leak (run every hour)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) rateLimitStore.delete(key);
  }
}, 60 * 60 * 1000);

// BUG-005 fix: use ES module export for consistency with codebase
export default anonymousRateLimit;
