import { expect, test } from 'vitest';

import { formatSigned, parseInteger, parseNumber } from '../answers.ts';

test('a number is read the way a student types it', () => {
  expect(
    ['42', '+5', '−3', '-3', '1,5', '75.8 %', ' 12 ', '.5'].map(parseNumber),
  ).toStrictEqual([42, 5, -3, -3, 1.5, 75.8, 12, 0.5]);
  expect(['', 'abc', '1.2.3', '--1'].map(parseNumber)).toStrictEqual([
    null,
    null,
    null,
    null,
  ]);
});

test('a whole number rejects a decimal', () => {
  expect(parseInteger('7')).toBe(7);
  expect(parseInteger('7.5')).toBeNull();
});

test('a signed number is written with its sign and a true minus', () => {
  expect([5, -2, 0].map(formatSigned)).toStrictEqual(['+5', '−2', '0']);
});
