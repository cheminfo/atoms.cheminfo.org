import { elementsObject } from 'chemical-elements';
import { MF } from 'mf-parser';

/** One kind of atom in one part of a formula. */
export interface FormulaAtom {
  /** Element symbol, e.g. `Fe`. */
  symbol: string;
  /** Mass number when the formula names the isotope, e.g. 56 in `[56Fe]`. */
  massNumber: number | null;
  /** How many of them the part holds. */
  count: number;
}

/** One `.`-separated part of a formula: its atoms and its charge. */
export interface FormulaPart {
  atoms: FormulaAtom[];
  charge: number;
}

/** A formula as this site reads it. */
export interface ParsedFormula {
  /** What was handed to the parser, after the site's normalisation. */
  formula: string;
  parts: FormulaPart[];
  /** Sum of the charges of every part. */
  charge: number;
}

/** A formula that cannot be read, with a message written for a student. */
export class FormulaError extends Error {
  override name = 'FormulaError';
}

interface ParserEntry {
  kind: string;
  value: unknown;
  multiplier?: number;
}

/**
 * Rewrite the ways a charge and a hydrate are commonly typed into the syntax
 * mf-parser reads, because it silently drops a trailing minus: `NO3-` would
 * otherwise be read as neutral nitrate.
 *
 * - `NO3-`, `SO4--`, `S2O3-2`, `CO3 2-`, `CO3^2-` → `NO3(-1)`, `SO4(-2)`, …
 * - `CuSO4.5H2O`, `CuSO4·5H2O`, `CuSO4*5H2O` → `CuSO4 . 5H2O`
 * @param text - The formula as typed.
 * @returns The formula the parser is given.
 */
export function normalizeFormula(text: string): string {
  let formula = text.trim().replaceAll(/[·•*]/g, '.');
  formula = formula.replaceAll(/\s*\.\s*/g, ' . ');

  const separated =
    /^(?<body>.*?\S)(?:\s+|\^)(?<digits>\d*)(?<signs>[+-]+)$/u.exec(formula);
  if (separated?.groups) {
    const { body = '', digits = '', signs = '' } = separated.groups;
    return withCharge(body, signs, digits);
  }
  const signThenDigits =
    /^(?<body>.*?[^\s(])(?<sign>[+-])(?<digits>\d+)$/u.exec(formula);
  if (signThenDigits?.groups) {
    const { body = '', sign = '', digits = '' } = signThenDigits.groups;
    return withCharge(body, sign, digits);
  }
  const trailingSigns = /^(?<body>.*?[^\s+-])(?<signs>[+-]+)$/u.exec(formula);
  if (trailingSigns?.groups) {
    const { body = '', signs = '' } = trailingSigns.groups;
    return withCharge(body, signs, '');
  }
  return formula;
}

/**
 * Read a formula into its parts, atoms and charges.
 * @param text - A formula as typed, e.g. `Fe(3+)`, `NO3-` or `[238U][19F]6`.
 * @returns The parsed formula.
 * @throws {FormulaError} When the text is empty or is not a formula.
 */
export function readFormula(text: string): ParsedFormula {
  const formula = normalizeFormula(text);
  if (formula === '') throw new FormulaError('Type a formula first.');

  let rawParts: ParserEntry[][];
  try {
    rawParts = new MF(formula).toParts() as ParserEntry[][];
  } catch (error) {
    throw new FormulaError(parserMessage(text, error));
  }

  const order = writtenOrder(formula);
  const parts: FormulaPart[] = [];
  let total = 0;
  for (const rawPart of rawParts) {
    const part = readPart(text, rawPart);
    part.atoms.sort(
      (a, b) =>
        (order.get(a.symbol) ?? order.size) -
        (order.get(b.symbol) ?? order.size),
    );
    total += part.charge;
    parts.push(part);
  }
  if (parts.every((part) => part.atoms.length === 0)) {
    throw new FormulaError(`“${text.trim()}” holds no atom.`);
  }
  return { formula, parts, charge: total };
}

/**
 * The atomic number of an element.
 * @param symbol - Its symbol.
 * @returns Z.
 * @throws {FormulaError} When the symbol is not an element.
 */
export function atomicNumber(symbol: string): number {
  const element = elementsObject[symbol];
  if (element === undefined) {
    throw new FormulaError(`“${symbol}” is not an element symbol.`);
  }
  return element.number;
}

/**
 * The name of an element, as the periodic table writes it.
 * @param symbol - Its symbol.
 * @returns The English name, or the symbol itself for an unknown one.
 */
export function elementName(symbol: string): string {
  return elementsObject[symbol]?.name ?? symbol;
}

/**
 * The canonical spelling of a formula, so two spellings of one compound
 * compare equal: `NaOH`, `HONa` and `NaHO` all give the same string.
 * @param text - A formula as typed.
 * @returns The canonical formula.
 * @throws {FormulaError} When the text is not a formula.
 */
export function canonicalFormula(text: string): string {
  const formula = normalizeFormula(text);
  try {
    return new MF(formula).toMF();
  } catch (error) {
    throw new FormulaError(parserMessage(text, error));
  }
}

/**
 * Atom counts per element over a whole formula, isotopes folded into their
 * element and every part added up.
 * @param parsed - A parsed formula.
 * @returns Symbol → count, in the order the formula first names each element.
 */
export function atomCounts(parsed: ParsedFormula): Map<string, number> {
  const counts = new Map<string, number>();
  for (const part of parsed.parts) {
    for (const atom of part.atoms) {
      counts.set(atom.symbol, (counts.get(atom.symbol) ?? 0) + atom.count);
    }
  }
  return counts;
}

/**
 * A formula written for prose, with true subscripts and superscripts and its
 * charge the way a chemist writes it: `NO₃⁻`, `Fe³⁺`, `²³⁸U¹⁹F₆`.
 * @param text - A formula as typed.
 * @returns The formula in Unicode, or the text itself when it is not one.
 */
export function formulaText(text: string): string {
  let written: string;
  try {
    written = new MF(normalizeFormula(text)).toText();
  } catch {
    return text.trim();
  }
  return written
    .replaceAll(/\s+•\s+/gu, '·')
    .replace(
      /(?<sign>[⁺⁻])(?<digits>[⁰¹²³⁴⁵⁶⁷⁸⁹]+)$/u,
      (_match, sign: string, digits: string) =>
        `${digits === '¹' ? '' : digits}${sign}`,
    );
}

/**
 * Where each element first appears in a formula as it is written, so a table
 * lists Sb before O for Sb2O5 rather than in the parser's canonical order.
 * @param formula - The formula as given to the parser.
 * @returns Symbol → position of its first appearance.
 */
function writtenOrder(formula: string): Map<string, number> {
  const order = new Map<string, number>();
  for (const match of formula.matchAll(/[A-Z][a-z]*/gu)) {
    if (!order.has(match[0])) order.set(match[0], order.size);
  }
  return order;
}

function withCharge(body: string, signs: string, digits: string): string {
  const sign = signs.startsWith('-') ? '-' : '+';
  const magnitude = digits === '' ? signs.length : Number(digits);
  return `${body.trim()}(${sign}${magnitude})`;
}

function readPart(text: string, rawPart: ParserEntry[]): FormulaPart {
  const atoms: FormulaAtom[] = [];
  let charge = 0;
  for (const entry of rawPart) {
    if (entry.kind === 'charge') {
      charge += Number(entry.value);
      continue;
    }
    const count = entry.multiplier ?? 1;
    if (!Number.isInteger(count) || count <= 0) {
      throw new FormulaError(
        `“${text.trim()}” gives an atom a count of ${count}; counts are whole numbers.`,
      );
    }
    if (entry.kind === 'atom' && typeof entry.value === 'string') {
      atomicNumber(entry.value);
      atoms.push({ symbol: entry.value, massNumber: null, count });
      continue;
    }
    if (entry.kind === 'isotope') {
      const { atom, isotope } = entry.value as {
        atom: string;
        isotope: number;
      };
      atomicNumber(atom);
      atoms.push({ symbol: atom, massNumber: isotope, count });
      continue;
    }
    throw new FormulaError(
      `“${text.trim()}” uses a notation this tool does not count.`,
    );
  }
  return { atoms, charge };
}

function parserMessage(text: string, error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  const unknown = /element unknown: (?<symbol>\S+)/u.exec(raw);
  if (unknown?.groups?.symbol) {
    return `“${unknown.groups.symbol}” is not an element symbol.`;
  }
  const first = raw.split('\n', 1)[0] ?? raw;
  return `“${text.trim()}” is not a formula this tool can read (${first}).`;
}
