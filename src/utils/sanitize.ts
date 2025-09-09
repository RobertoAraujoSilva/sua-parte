// Utility functions for data sanitization

export const sanitizeString = (input: string): string => {
  return input.replace(/[<>\"'&]/g, '');
};

export const sanitizeForLog = (input: string): string => {
  return input.replace(/[\r\n\t]/g, ' ').replace(/[<>\"'&]/g, '');
};

export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[<>\"'&]/g, '')
    .replace(/[^\w\s.-]/g, '')
    .trim();
};

export const validateUserId = (userId: string): boolean => {
  return /^[a-zA-Z0-9-_]+$/.test(userId);
};