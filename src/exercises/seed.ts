import { XSadd } from 'ml-xsadd';

const LARGEST_SEED = 2 ** 32 - 1;

/**
 * Pick `count` items out of a pool, the same ones in the same order for the
 * same seed, on every machine and in every browser: a series is a link.
 *
 * The pool is shuffled by Fisher–Yates driven by XSadd, and the series is the
 * head of that shuffle, so asking for more questions from the same seed keeps
 * the ones already on screen.
 * @param pool - Everything a series can draw from.
 * @param count - How many to take; more than the pool holds takes them all.
 * @param seed - An unsigned 32-bit integer.
 * @returns The picked items, in drawn order.
 */
export function pickSeeded<T>(
  pool: readonly T[],
  count: number,
  seed: number,
): T[] {
  const generator = new XSadd(seed);
  const order = new Array<number>(pool.length);
  for (let index = 0; index < pool.length; index++) order[index] = index;
  for (let index = pool.length - 1; index > 0; index--) {
    const other = Math.floor(generator.getFloat() * (index + 1));
    const kept = order[index] as number;
    order[index] = order[other] as number;
    order[other] = kept;
  }
  const size = Math.max(0, Math.min(count, pool.length));
  const picked = new Array<T>(size);
  for (let index = 0; index < size; index++) {
    picked[index] = pool[order[index] as number] as T;
  }
  return picked;
}

/**
 * A seed for a series nobody has asked for yet.
 * @returns An unsigned 32-bit integer.
 */
export function freshSeed(): number {
  return new XSadd().getUint32();
}

/**
 * Read a seed out of an address.
 * @param raw - The `seed` parameter, as typed or as a link carries it.
 * @returns The seed, or null when the parameter is absent or not one.
 */
export function parseSeed(raw: string | null | undefined): number | null {
  if (raw === null || raw === undefined || !/^\d{1,10}$/u.test(raw)) {
    return null;
  }
  const seed = Number(raw);
  return seed <= LARGEST_SEED ? seed : null;
}
