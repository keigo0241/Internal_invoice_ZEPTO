export function filterHalfWidthAlphanumericInput(value: string) {
  return value.replace(/[^A-Za-z0-9]/g, "");
}

export function filterHalfWidthNumericInput(value: string) {
  return value.replace(/[^0-9]/g, "");
}
