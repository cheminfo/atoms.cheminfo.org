# atoms.cheminfo.org

Count the electrons and neutrons of a formula, work out isotopic abundances,
draw Lewis structures and assign oxidation states — each with a calculator and
a graded series of questions.

| Page       | Address       | What it does                                                   |
| ---------- | ------------- | -------------------------------------------------------------- |
| Electrons  | `/`           | Atomic numbers added up, the charge applied                    |
| Neutrons   | `/neutrons`   | A − Z for every atom of an isotopic formula                    |
| Isotopes   | `/isotopes`   | The two abundances of an element from its atomic mass          |
| Lewis      | `/lewis`      | Draw a structure; bonds, lone pairs and formal charge per atom |
| Oxidation  | `/oxidation`  | Every element's oxidation state, checked by the sum rule       |
| Cheatsheet | `/cheatsheet` | The rules on one printable page                                |
| About      | `/about`      | What the site is, what it is built on, how to cite it          |

A tool page carries `?seed=`, the series of questions on screen: the address
bar is always the link that reopens the same questions. `?count=` sets the
length of a series, `?embed` frames the page in a course, and `?hide=` switches
parts off (`playground`, `exercises`, `solutions`, `tabs`).

## Shape of the site

The family's pedagogic tools ship Tutorial · Playground · Exercises ·
Cheatsheet for a site that is one tool. This site holds five, so the shape is
applied per tool: every tool page opens on its calculator (the playground) and
follows it with its graded series (the exercises), and the site ends on one
cheatsheet.

## Development

```sh
npm install
npm run dev        # http://localhost:10919
npm run test       # unit tests, types, tokens, deployment contract, lint, format
npm run test-e2e   # Playwright
npm run build
```

## Content and languages

Every question is computed, never stored with its answer: the chemistry lives in
`src/chemistry/`, the grading, hints and solutions of each tool in `src/tools/`.

The pools are language-free (`src/data/*.ts`: formulas, oxidation states,
accepted structures); the names a question shows are per locale, in
`src/data/locales/en.ts` and `src/data/locales/fr.ts`. Only English is rendered
today. `data/source/` holds the datasets as they were first written, in French.

## Deployment

```sh
cp .env.example .env    # uncomment one COMPOSE_FILE line
docker compose up -d
```

The server's global `deploy.sh` pulls, tags and health-checks the image
(`/health`). `TRACKING_SCRIPT` in `.env` injects the analytics snippet into
every page at container start; unset, nothing is loaded.

## License

MIT
