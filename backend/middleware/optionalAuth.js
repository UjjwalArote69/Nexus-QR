// middleware/optionalAuth.js
// Flexible auth middleware that supports both logged-in and anonymous users.
//
// Priority:
// 1. JWT in Authorization header → sets req.userId (authenticated user)
// 2. x-session-token header → sets req.sessionToken (anonymous user)
// 3. Neither → rejects with 401
//
// Use this on endpoints that should work for BOTH anonymous and auth'd users
// (e.g. QR creation, file upload). For endpoints that REQUIRE auth (e.g. 
// fetching "my QR codes", editing), keep using your existing auth middleware.

import jwt from 'jsonwebtoken';

export const optionalAuth = (req, res, next) => {
  // 1. Try JWT first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.id || decoded.userId;
      req.sessionToken = null;
      return next();
    } catch (err) {
      // JWT is invalid/expired — fall through to session token
    }
  }

  // 2. Try session token
  const sessionToken = req.headers['x-session-token'];
  if (sessionToken && sessionToken.length >= 32) {
    req.userId = null;
    req.sessionToken = sessionToken;
    return next();
  }

  // 3. Neither — reject
  return res.status(401).json({
    success: false,
    message: 'Authentication required. Provide a JWT or session token.',
  });
};
