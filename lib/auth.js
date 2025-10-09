import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { JWT_COOKIE_NAME, TOKEN_REFRESH_THRESHOLD } from './constants';

export function getStoredToken() {
  return Cookies.get(JWT_COOKIE_NAME);
}

export function setStoredToken(token) {
  Cookies.set(JWT_COOKIE_NAME, token, {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}

export function removeStoredToken() {
  Cookies.remove(JWT_COOKIE_NAME);
}

export function decodeToken(token) {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

export function isTokenExpired(token) {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
}

export function shouldRefreshToken(token) {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return false;
  }

  const currentTime = Date.now();
  const expirationTime = decoded.exp * 1000;
  const timeUntilExpiration = expirationTime - currentTime;

  return timeUntilExpiration < TOKEN_REFRESH_THRESHOLD;
}

export function getUserFromToken(token) {
  const decoded = decodeToken(token);
  if (!decoded) {
    return null;
  }

  return {
    id: decoded.userId || decoded.sub,
    email: decoded.email,
    role: decoded.role,
    siteId: decoded.siteId,
  };
}
