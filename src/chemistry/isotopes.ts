import { elementsAndStableIsotopes } from 'chemical-elements';

/** One stable isotope of an element. */
export interface StableIsotope {
  /** Mass number A. */
  massNumber: number;
  /** Isotopic mass, in u. */
  mass: number;
  /** Natural abundance, in percent. */
  abundance: number;
}

/** An element whose natural isotopic composition is two stable isotopes. */
export interface TwoIsotopeElement {
  symbol: string;
  name: string;
  atomicNumber: number;
  /** Standard atomic mass: the abundance-weighted mean of the two isotopic masses. */
  atomicMass: number;
  /** The two isotopes, lighter first. */
  isotopes: readonly [StableIsotope, StableIsotope];
}

/**
 * Every element with exactly two stable isotopes, lightest element first.
 *
 * Such an element is the one case where its atomic mass alone decides the
 * composition: with abundances x and 1 − x, `M = x·m₁ + (1 − x)·m₂` has one
 * unknown.
 */
export const TWO_ISOTOPE_ELEMENTS: readonly TwoIsotopeElement[] =
  collectTwoIsotopeElements();

/**
 * Find a two-isotope element by symbol.
 * @param symbol - Its symbol, e.g. `Cl`.
 * @returns The element, or undefined when it has not exactly two stable isotopes.
 */
export function twoIsotopeElement(
  symbol: string,
): TwoIsotopeElement | undefined {
  for (const element of TWO_ISOTOPE_ELEMENTS) {
    if (element.symbol === symbol) return element;
  }
  return undefined;
}

/**
 * Solve `M = x·m₁ + (1 − x)·m₂` for the abundance of the lighter isotope.
 * @param atomicMass - The element's atomic mass M.
 * @param lighter - The mass m₁ of the lighter isotope.
 * @param heavier - The mass m₂ of the heavier isotope.
 * @returns The abundance of the lighter isotope, in percent.
 */
export function lighterAbundance(
  atomicMass: number,
  lighter: number,
  heavier: number,
): number {
  return ((heavier - atomicMass) / (heavier - lighter)) * 100;
}

/**
 * The mass number of an element's most abundant stable isotope, for an
 * example of how to write an isotope.
 * @param symbol - An element symbol.
 * @returns The mass number, or twice the atomic number when the element has no
 * stable isotope.
 */
export function commonMassNumber(symbol: string): number {
  for (const element of elementsAndStableIsotopes) {
    if (element.symbol !== symbol) continue;
    let best: { nominal: number; abundance?: number } | undefined;
    for (const isotope of element.isotopes) {
      if (
        best === undefined ||
        (isotope.abundance ?? 0) > (best.abundance ?? 0)
      ) {
        best = isotope;
      }
    }
    return best?.nominal ?? 2 * element.number;
  }
  return 0;
}

function collectTwoIsotopeElements(): TwoIsotopeElement[] {
  const found: TwoIsotopeElement[] = [];
  for (const element of elementsAndStableIsotopes) {
    if (element.isotopes.length !== 2 || element.mass === null) continue;
    const [first, second] = element.isotopes;
    if (first === undefined || second === undefined) continue;
    const [lighter, heavier] =
      first.nominal < second.nominal ? [first, second] : [second, first];
    found.push({
      symbol: element.symbol,
      name: element.name,
      atomicNumber: element.number,
      atomicMass: element.mass,
      isotopes: [toStable(lighter), toStable(heavier)],
    });
  }
  found.sort((a, b) => a.atomicNumber - b.atomicNumber);
  return found;
}

function toStable(isotope: {
  nominal: number;
  mass: number;
  abundance?: number;
}): StableIsotope {
  return {
    massNumber: isotope.nominal,
    mass: isotope.mass,
    abundance: (isotope.abundance ?? 0) * 100,
  };
}
