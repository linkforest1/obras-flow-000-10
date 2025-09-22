/**
 * Security utilities for input validation, sanitization, and rate limiting
 */

// Rate limiting for authentication attempts
const authAttempts = new Map<string, { count: number; lastAttempt: number }>();
const AUTH_RATE_LIMIT = 5; // Max attempts
const AUTH_RATE_WINDOW = 15 * 60 * 1000; // 15 minutes

/**
 * Input sanitization utility
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/data:/gi, '') // Remove data: protocols
    .replace(/vbscript:/gi, '') // Remove vbscript: protocols
    .substring(0, 1000); // Limit length
};

/**
 * Email validation with enhanced security
 */
export const validateEmail = (email: string): boolean => {
  const sanitized = sanitizeInput(email);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(sanitized) && sanitized.length <= 254;
};

/**
 * Password strength validation
 */
export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Senha deve ter pelo menos 8 caracteres' };
  }
  
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return { 
      isValid: false, 
      message: 'Senha deve conter ao menos uma letra minúscula, uma maiúscula e um número' 
    };
  }
  
  if (/(.)\1{2,}/.test(password)) {
    return { isValid: false, message: 'Senha não pode ter caracteres repetidos consecutivamente' };
  }
  
  return { isValid: true };
};

/**
 * File upload security validation
 */
export const validateFileUpload = (file: File): { isValid: boolean; message?: string } => {
  // Check file size (10MB max)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { isValid: false, message: 'Arquivo muito grande. Máximo 10MB permitido.' };
  }

  // Check file type - more flexible for Excel files
  const filename = file.name.toLowerCase();
  const fileExtension = filename.substring(filename.lastIndexOf('.'));
  
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf', '.xlsx', '.xls', '.csv'];
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
    'application/vnd.ms-excel', // xls
    'text/csv',
    'application/octet-stream', // Sometimes Excel files are detected as this
    'application/zip' // xlsx files are actually zip containers
  ];
  
  // Check by file extension first (more reliable for Excel files)
  if (!allowedExtensions.includes(fileExtension)) {
    return { 
      isValid: false, 
      message: `Tipo de arquivo não permitido: ${fileExtension}. Use apenas: ${allowedExtensions.join(', ')}` 
    };
  }
  
  // For Excel/CSV files, be more lenient with MIME type detection
  if (['.xlsx', '.xls', '.csv'].includes(fileExtension)) {
    // Allow Excel files regardless of detected MIME type as browsers can be inconsistent
  } else if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      message: 'Tipo de arquivo não permitido. Use apenas imagens, PDFs ou planilhas.' 
    };
  }

  // Check file name for suspicious patterns (filename already declared above)
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return { isValid: false, message: 'Nome do arquivo contém caracteres não permitidos.' };
  }

  // Check for double extensions
  const parts = filename.split('.');
  if (parts.length > 2) {
    return { isValid: false, message: 'Arquivo com múltiplas extensões não é permitido.' };
  }

  return { isValid: true };
};

/**
 * Rate limiting for authentication attempts
 */
export const checkAuthRateLimit = (identifier: string): { allowed: boolean; remainingAttempts?: number } => {
  const now = Date.now();
  const attempts = authAttempts.get(identifier);
  
  if (!attempts) {
    authAttempts.set(identifier, { count: 1, lastAttempt: now });
    return { allowed: true, remainingAttempts: AUTH_RATE_LIMIT - 1 };
  }
  
  // Reset if window expired
  if (now - attempts.lastAttempt > AUTH_RATE_WINDOW) {
    authAttempts.set(identifier, { count: 1, lastAttempt: now });
    return { allowed: true, remainingAttempts: AUTH_RATE_LIMIT - 1 };
  }
  
  // Check if limit exceeded
  if (attempts.count >= AUTH_RATE_LIMIT) {
    return { allowed: false };
  }
  
  // Increment attempts
  attempts.count += 1;
  attempts.lastAttempt = now;
  authAttempts.set(identifier, attempts);
  
  return { allowed: true, remainingAttempts: AUTH_RATE_LIMIT - attempts.count };
};

/**
 * Reset rate limit (call on successful auth)
 */
export const resetAuthRateLimit = (identifier: string): void => {
  authAttempts.delete(identifier);
};

/**
 * Sanitize file name for upload
 */
export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .substring(0, 100); // Limit length
};

/**
 * Generate secure random string for CSRF tokens
 */
export const generateSecureToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Validate and sanitize URL inputs
 */
export const validateUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    const allowedProtocols = ['http:', 'https:'];
    return allowedProtocols.includes(parsed.protocol);
  } catch {
    return false;
  }
};

/**
 * Content filtering for comments and descriptions
 */
export const sanitizeContent = (content: string): string => {
  return sanitizeInput(content)
    .replace(/\b(script|javascript|vbscript|onload|onerror|onclick)\b/gi, '') // Remove script-related words
    .substring(0, 2000); // Limit content length
};