// Falha se houver cor literal (hexadecimal, rgb/rgba/hsl/hsla) fora de src/styles/_tokens.scss (SC-002).
// Uso: npm run lint:colors
import { readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';

const SOURCE_DIRECTORY = 'src';
const ALLOWED_FILE = join('src', 'styles', '_tokens.scss');
const EXTENSIONS = new Set(['.scss', '.css', '.html', '.ts']);
const PATTERNS = [/#[0-9a-fA-F]{3,8}\b/, /\b(rgb|rgba|hsl|hsla)\(/];

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

function shouldCheck(path) {
  return EXTENSIONS.has(extname(path)) && !path.endsWith('.spec.ts') && path !== ALLOWED_FILE;
}

function findOccurrences(path) {
  return readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .flatMap((line, index) =>
      PATTERNS.some((pattern) => pattern.test(line))
        ? [`${relative('.', path).split(sep).join('/')}:${index + 1}: ${line.trim()}`]
        : [],
    );
}

const occurrences = listFiles(SOURCE_DIRECTORY).filter(shouldCheck).flatMap(findOccurrences);

if (occurrences.length > 0) {
  console.error('Cores literais encontradas fora de src/styles/_tokens.scss:');
  occurrences.forEach((occurrence) => console.error(occurrence));
  process.exit(1);
}
console.log('Nenhuma cor literal fora de src/styles/_tokens.scss.');
