import { NextApiRequest, NextApiResponse } from 'next';
import { randomBytes } from 'crypto';

// CSRF Protection
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

export function validateCSRFToken(req: NextApiRequest, token: string): boolean {
  const csrfToken = req.headers['x-csrf-token'] || req.body?.csrfToken;
  return csrfToken === token;
}

// Input Sanitization
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Remove potentially dangerous characters
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}

// XSS Protection Headers
export function setSecurityHeaders(res: NextApiResponse): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' https://api.paymongo.com; " +
    "frame-src 'none'; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';"
  );
}

// File Upload Security
export function validateFileUpload(file: any): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size too large. Maximum 5MB allowed.' };
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' };
  }

  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(fileExtension)) {
    return { isValid: false, error: 'Invalid file extension.' };
  }

  return { isValid: true };
}

// SQL Injection Protection (additional layer beyond Prisma)
export function sanitizeSQLInput(input: string): string {
  return input
    .replace(/['"`;\\]/g, '') // Remove dangerous SQL characters
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comment start
    .replace(/\*\//g, '') // Remove block comment end
    .trim();
}

// Rate limiting for specific actions
export function createActionRateLimit(action: string, maxAttempts: number, windowMs: number) {
  const attempts: { [key: string]: { count: number; resetTime: number } } = {};

  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    const key = `${action}-${getClientIdentifier(req)}`;
    const now = Date.now();

    if (!attempts[key] || attempts[key].resetTime < now) {
      attempts[key] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    attempts[key].count++;

    if (attempts[key].count > maxAttempts) {
      return res.status(429).json({
        error: 'Too many attempts',
        message: `Too many ${action} attempts. Please try again later.`,
        retryAfter: Math.ceil((attempts[key].resetTime - now) / 1000),
      });
    }

    next();
  };
}

function getClientIdentifier(req: NextApiRequest): string {
  const ip = req.headers['x-forwarded-for'] || 
             req.headers['x-real-ip'] || 
             req.connection.remoteAddress || 
             'unknown';
  return ip as string;
}

// Password strength validation
export function validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Phone number validation (Philippines)
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^(\+63|0)[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Security middleware wrapper
export function withSecurity(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Set security headers
    setSecurityHeaders(res);
    
    // Sanitize request body
    if (req.body) {
      req.body = sanitizeInput(req.body);
    }
    
    // Sanitize query parameters
    if (req.query) {
      req.query = sanitizeInput(req.query);
    }

    return handler(req, res);
  };
}
