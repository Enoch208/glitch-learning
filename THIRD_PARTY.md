# Third-party software

Licences come from `pnpm licenses list --prod`. The production tree contains MIT, ISC, Apache-2.0, BSD-3-Clause and 0BSD packages, plus one CC-BY-4.0 data package. There is no GPL, LGPL, AGPL or SSPL. `sharp` is overridden out of the tree because its libvips binary is LGPL; images are served as pre-sized WebP instead.

## Runtime

| Package                 | Version      | Licence   | Purpose                             |
| ----------------------- | ------------ | --------- | ----------------------------------- |
| next                    | 16.3.5       | MIT       | Application framework               |
| react, react-dom        | 19.3.0       | MIT       | UI                                  |
| zod                     | 4.6.5        | MIT       | Validating traces and rule programs |
| zustand                 | 5.0.15       | MIT       | Run state on the device             |
| motion                  | 13.4.0       | MIT       | Animation on the base ten canvas    |
| @phosphor-icons/react   | 2.1.10       | MIT       | Icons                               |
| caniuse-lite (via Next) | 1.0.30001810 | CC-BY-4.0 | Browser support data                |

## Fonts

| Font              | Licence                   | Purpose                                 |
| ----------------- | ------------------------- | --------------------------------------- |
| Plus Jakarta Sans | SIL Open Font License 1.1 | Interface text                          |
| JetBrains Mono    | SIL Open Font License 1.1 | Numbers in the inspector and evaluation |

Both are self-hosted at build time through `next/font`.

## Development only

TypeScript, ESLint and typescript-eslint, Prettier, Vitest, Tailwind CSS and its PostCSS plugin, all under MIT or Apache-2.0. None of them ship in the app.
