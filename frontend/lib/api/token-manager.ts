/**
 * Simple token manager for API calls
 * Components using useAuth() from Clerk can set the token here
 * All API calls will automatically use it
 */

let currentToken: string | null = null;

export function setApiToken(token: string | null) {
  currentToken = token;
}

export function getApiToken(): string | null {
  return currentToken;
}
