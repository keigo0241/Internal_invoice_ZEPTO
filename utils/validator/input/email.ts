export function isEmailLike(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function validateEmailText(value: string, fieldName: string) {
  if (!isEmailLike(value)) {
    return `${fieldName}を確認してください。`;
  }

  return null;
}
