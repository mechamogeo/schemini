/**
 * Brazilian document and format validators
 */

/**
 * Validate a Brazilian CPF (Cadastro de Pessoas Físicas)
 * CPF has 11 digits with 2 check digits calculated using modulo 11
 */
export function isValidCPF(cpf: string): boolean {
  // Remove non-digit characters
  const digits = cpf.replace(/\D/g, '');

  // Must have exactly 11 digits
  if (digits.length !== 11) {
    return false;
  }

  // Reject known invalid patterns (all same digits)
  if (/^(\d)\1+$/.test(digits)) {
    return false;
  }

  // Convert to array of numbers for easier manipulation
  const nums = digits.split('').map((d) => Number.parseInt(d, 10));

  // Calculate first check digit (positions 0-8 with weights 10-2)
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const num = nums[i];
    if (num === undefined) return false;
    sum += num * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== nums[9]) {
    return false;
  }

  // Calculate second check digit (positions 0-9 with weights 11-2)
  sum = 0;
  for (let i = 0; i < 10; i++) {
    const num = nums[i];
    if (num === undefined) return false;
    sum += num * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== nums[10]) {
    return false;
  }

  return true;
}

/**
 * Validate a Brazilian CNPJ (Cadastro Nacional da Pessoa Jurídica)
 * CNPJ has 14 digits with 2 check digits calculated using modulo 11
 */
export function isValidCNPJ(cnpj: string): boolean {
  // Remove non-digit characters
  const digits = cnpj.replace(/\D/g, '');

  // Must have exactly 14 digits
  if (digits.length !== 14) {
    return false;
  }

  // Reject known invalid patterns (all same digits)
  if (/^(\d)\1+$/.test(digits)) {
    return false;
  }

  // Convert to array of numbers for easier manipulation
  const nums = digits.split('').map((d) => Number.parseInt(d, 10));

  // CNPJ multipliers for check digit calculation
  const firstMultipliers = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const secondMultipliers = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  // Calculate first check digit
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const num = nums[i];
    const mult = firstMultipliers[i];
    if (num === undefined || mult === undefined) return false;
    sum += num * mult;
  }
  let remainder = sum % 11;
  const firstCheckDigit = remainder < 2 ? 0 : 11 - remainder;
  if (firstCheckDigit !== nums[12]) {
    return false;
  }

  // Calculate second check digit
  sum = 0;
  for (let i = 0; i < 13; i++) {
    const num = nums[i];
    const mult = secondMultipliers[i];
    if (num === undefined || mult === undefined) return false;
    sum += num * mult;
  }
  remainder = sum % 11;
  const secondCheckDigit = remainder < 2 ? 0 : 11 - remainder;
  if (secondCheckDigit !== nums[13]) {
    return false;
  }

  return true;
}

/**
 * Validate a Brazilian CEP (Código de Endereçamento Postal)
 * CEP has 8 digits, optionally formatted as XXXXX-XXX
 */
export function isValidCEP(cep: string): boolean {
  // Remove non-digit characters
  const digits = cep.replace(/\D/g, '');

  // Must have exactly 8 digits
  if (digits.length !== 8) {
    return false;
  }

  // CEP cannot be all zeros
  if (digits === '00000000') {
    return false;
  }

  return true;
}
