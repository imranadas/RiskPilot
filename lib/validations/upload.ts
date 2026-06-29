const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["application/pdf"];

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateUploadedFile(file: File): ValidationResult {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: "Only PDF files are accepted." };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "File size must be under 10 MB." };
  }
  return { valid: true };
}

export function validateUploadBuffer(
  buffer: Buffer,
  mimeType: string
): ValidationResult {
  if (!ALLOWED_TYPES.includes(mimeType)) {
    return { valid: false, error: "Only PDF files are accepted." };
  }
  if (buffer.byteLength > MAX_FILE_SIZE) {
    return { valid: false, error: "File size must be under 10 MB." };
  }
  return { valid: true };
}
