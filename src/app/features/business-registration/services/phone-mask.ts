/** Máscara de telefone brasileiro, só de exibição (research R-06, data-model.md §7). */

/** Remove tudo que não for `0-9`. */
export function extractDigits(text: string): string {
  return text.replace(/\D/g, '');
}

/**
 * Formata os dígitos durante a digitação: `(XX`, `(XX) XXXX`, `(XX) XXXX-XXXX` (até 10) e
 * `(XX) XXXXX-XXXX` (11). Mais de 11 dígitos (só por colagem) ficam crus — inválidos, não truncados.
 */
export function formatPhone(digits: string): string {
  const length = digits.length;
  if (length === 0 || length > 11) {
    return digits;
  }
  const areaCode = digits.slice(0, 2);
  if (length <= 2) {
    return `(${areaCode}`;
  }
  const prefixLength = length === 11 ? 5 : 4;
  const prefix = digits.slice(2, 2 + prefixLength);
  const suffix = digits.slice(2 + prefixLength);
  return suffix.length === 0 ? `(${areaCode}) ${prefix}` : `(${areaCode}) ${prefix}-${suffix}`;
}
