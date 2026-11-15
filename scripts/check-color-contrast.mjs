// Verifica o contraste WCAG 2.1 dos pares de tokens de cor e a ausência de cores proibidas (FR-006).
// Uso: npm run lint:contrast
import { readFileSync } from 'node:fs';

const TOKENS_FILE = 'src/styles/_tokens.scss';

const EXPECTED_TOKENS = [
  'primary',
  'on-primary',
  'surface',
  'accent',
  'on-surface',
  'on-surface-variant',
  'error-bg',
  'error-text',
  'success-bg',
  'success-text',
  'info-bg',
  'info-text',
  'warning-bg',
  'warning-text',
];

// [texto/primeiro plano, fundo, razão mínima, observação]
const PAIRS = [
  ['on-surface', 'surface', 4.5, 'texto normal'],
  ['on-surface', 'accent', 4.5, 'texto normal'],
  ['on-surface-variant', 'surface', 4.5, 'texto normal'],
  ['error-text', 'surface', 4.5, 'texto normal'],
  ['primary', 'surface', 3, 'somente texto grande/UI'],
  ['on-primary', 'primary', 3, 'somente texto grande'],
  ['error-text', 'error-bg', 4.5, 'status'],
  ['success-text', 'success-bg', 4.5, 'status'],
  ['info-text', 'info-bg', 4.5, 'status'],
  ['warning-text', 'warning-bg', 4.5, 'status'],
];

const FORBIDDEN_COLORS = [
  '#FF0000',
  '#0000FF',
  '#FF00FF',
  '#800080',
  '#FF1493',
  '#FF8000',
  '#FFFF00',
];
const FORBIDDEN_DISTANCE = 60;

export function parseHexColor(hex) {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) {
    throw new Error(`Cor inválida: "${hex}". Use o formato #RRGGBB.`);
  }
  return [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));
}

export function relativeLuminance(hex) {
  const [red, green, blue] = parseHexColor(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function contrastRatio(foreground, background) {
  const first = relativeLuminance(foreground);
  const second = relativeLuminance(background);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

function colorDistance(first, second) {
  const a = parseHexColor(first);
  const b = parseHexColor(second);
  return Math.sqrt(a.reduce((sum, channel, index) => sum + (channel - b[index]) ** 2, 0));
}

function selfCheck() {
  const black = contrastRatio('#FFFFFF', '#000000').toFixed(2);
  const brand = contrastRatio('#FFFFFF', '#00A35C').toFixed(2);
  if (black !== '21.00' || brand !== '3.28') {
    console.error(
      `Autoverificação falhou: branco×preto=${black} (esperado 21.00), branco×primária=${brand} (esperado 3.28).`,
    );
    process.exit(1);
  }
}

function readTokens() {
  const content = readFileSync(TOKENS_FILE, 'utf8');
  const tokens = new Map();
  for (const match of content.matchAll(/--app-color-([a-z-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    tokens.set(match[1], match[2]);
  }
  return tokens;
}

function main() {
  selfCheck();
  const tokens = readTokens();
  const failures = [];

  const declared = [...tokens.keys()].sort();
  const expected = [...EXPECTED_TOKENS].sort();
  if (declared.join(',') !== expected.join(',')) {
    failures.push(
      `Tokens declarados (${declared.join(', ')}) diferem do contrato (${expected.join(', ')}).`,
    );
  }

  console.log('par | razão | mínimo | resultado');
  for (const [foreground, background, minimum, note] of PAIRS) {
    const ratio = contrastRatio(tokens.get(foreground), tokens.get(background));
    const passed = ratio >= minimum;
    console.log(
      `${foreground} × ${background} | ${ratio.toFixed(2)} | ${minimum} (${note}) | ${passed ? 'OK' : 'FALHA'}`,
    );
    if (!passed) {
      failures.push(`Contraste insuficiente: ${foreground} × ${background}.`);
    }
  }

  for (const [name, hex] of tokens) {
    for (const forbidden of FORBIDDEN_COLORS) {
      if (colorDistance(hex, forbidden) <= FORBIDDEN_DISTANCE) {
        failures.push(`Token ${name} (${hex}) próximo da cor proibida ${forbidden}.`);
      }
    }
  }

  if (failures.length > 0) {
    failures.forEach((failure) => console.error(`FALHA: ${failure}`));
    process.exit(1);
  }
  console.log('Todos os pares de contraste e cores proibidas verificados com sucesso.');
}

main();
