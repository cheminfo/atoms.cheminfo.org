/** The name of every compound a question shows, per tool, keyed by formula. */
export interface LocaleNames {
  electrons: Readonly<Record<string, string>>;
  neutrons: Readonly<Record<string, string>>;
  lewis: Readonly<Record<string, string>>;
  oxidation: Readonly<Record<string, string>>;
}
