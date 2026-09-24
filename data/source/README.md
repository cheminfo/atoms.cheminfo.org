# Source datasets

The pools as they were first written, in French, kept so the site can be
translated back without losing a name. The site reads the language-free
skeleton in `src/data/*.ts` and the names in `src/data/locales/`.

| File             | Holds                                                       |
| ---------------- | ----------------------------------------------------------- |
| `electrons.json` | 25 formulas and their French names                          |
| `neutrons.json`  | 9 isotopic formulas and their French names                  |
| `lewis.json`     | 19 formulas and the SMILES of their Lewis structure         |
| `oxidation.json` | 60 compounds, per-element oxidation states, EN and FR names |

The `answer` fields of `electrons.json` and `neutrons.json` are not read: the
site computes every answer, and four of the stored electron counts are wrong
(`NO3(1-)`, `NO2(1-)`, `OH(1-)` and `S2O3(2-)` each carry one or two electrons
too many).
