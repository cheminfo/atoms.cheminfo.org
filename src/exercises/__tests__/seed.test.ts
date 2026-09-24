import { expect, test } from 'vitest';

import { freshSeed, parseSeed, pickSeeded } from '../seed.ts';

const POOL = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

test('one seed always draws the same series', () => {
  expect(pickSeeded(POOL, 4, 42)).toStrictEqual(pickSeeded(POOL, 4, 42));
  expect(pickSeeded(POOL, 4, 42)).not.toStrictEqual(pickSeeded(POOL, 4, 43));
});

test('asking for more keeps the questions already drawn', () => {
  expect(pickSeeded(POOL, 6, 7).slice(0, 3)).toStrictEqual(
    pickSeeded(POOL, 3, 7),
  );
});

test('a series never repeats a question and never outgrows its pool', () => {
  const series = pickSeeded(POOL, 20, 1);
  expect(series).toHaveLength(8);
  expect(new Set(series).size).toBe(8);
});

test('a seed read from an address is an unsigned 32-bit integer or nothing', () => {
  expect(parseSeed('123')).toBe(123);
  expect(parseSeed('4294967295')).toBe(4_294_967_295);
  expect(parseSeed('4294967296')).toBeNull();
  expect(parseSeed('-1')).toBeNull();
  expect(parseSeed('1.5')).toBeNull();
  expect(parseSeed(undefined)).toBeNull();
});

test('a fresh seed is a valid one', () => {
  const seed = freshSeed();
  expect(parseSeed(String(seed))).toBe(seed);
});
