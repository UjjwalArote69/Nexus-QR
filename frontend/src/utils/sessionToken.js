// src/utils/sessionToken.js
// Generates a persistent session token for anonymous users.
// This token is sent with every API request when the user is not logged in,
// allowing the backend to associate uploads and QR codes with an anonymous session.
// After login/registration, all QR codes tied to this token get claimed by the user.

const SESSION_TOKEN_KEY = 'klink_session_token';

/**
 * Get or create a session token for the current browser.
 * Persists in localStorage so it survives page refreshes.
 */
export const getSessionToken = () => {
  let token = localStorage.getItem(SESSION_TOKEN_KEY);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(SESSION_TOKEN_KEY, token);
  }
  return token;
};

/**
 * Clear the session token (called after successful claim).
 */
export const clearSessionToken = () => {
  localStorage.removeItem(SESSION_TOKEN_KEY);
};

/**
 * Check if a session token exists.
 */
export const hasSessionToken = () => {
  return !!localStorage.getItem(SESSION_TOKEN_KEY);
};