# CI, Testing & Formatting Infrastructure

## What Was Added

### New `package.json` Scripts

| Script          | Command                             | Purpose                       |
| --------------- | ----------------------------------- | ----------------------------- |
| `typecheck`     | `tsc --noEmit -p tsconfig.app.json` | Type-check all `src/` code    |
| `test`          | `vitest run`                        | Run tests once (CI-friendly)  |
| `test:watch`    | `vitest`                            | Run tests in watch mode (dev) |
| `test:coverage` | `vitest run --coverage`             | Tests + v8 coverage report    |
| `format`        | `prettier --write .`                | Auto-format all files         |
| `format:check`  | `prettier --check .`                | Check formatting (CI gate)    |

### New Dev Dependencies

`vitest`, `@vitest/coverage-v8`, `jsdom`, `prettier`, `eslint-config-prettier`, `@testing-library/react`, `@testing-library/jest-dom`, `@types/jsdom`

### Files Created

| File                                | Purpose                                                               |
| ----------------------------------- | --------------------------------------------------------------------- |
| `.prettierrc.json`                  | Prettier config: 120 char width, `proseWrap: "always"`, no semicolons |
| `.prettierignore`                   | Mirrors `.gitignore` + binary assets                                  |
| `vitest.config.ts`                  | Vitest config with jsdom, `@/` alias, v8 coverage                     |
| `tests/setup.ts`                    | Global setup — imports `@testing-library/jest-dom` matchers           |
| `.github/workflows/ci.yml`          | CI workflow for PRs                                                   |
| `tests/utils/importManager.test.ts` | 19 tests for card upgrade/coercion                                    |
| `tests/utils/buildApiUrl.test.ts`   | 11 tests for API URL construction                                     |
| `tests/types/charactercard.test.ts` | 15 tests for type helpers & guards                                    |

### Files Modified

| File               | Change                                                                                 |
| ------------------ | -------------------------------------------------------------------------------------- |
| `eslint.config.js` | Added `eslint-config-prettier` to disable formatting rules that conflict with Prettier |
| `package.json`     | Added 6 new scripts + new devDependencies                                              |

---

## CI Workflow (`.github/workflows/ci.yml`)

Runs on **pull requests** and **pushes** to `main`/`master`:

1. **Install** — `npm ci`
2. **Lint** — `npm run lint` (ESLint)
3. **Format check** — `npm run format:check` (Prettier)
4. **Typecheck** — `npm run typecheck` (tsc)
5. **Build** — `npm run build` (Vite)
6. **Test** — `npm run test` (Vitest)

Uses concurrency groups to cancel stale runs on the same branch.

---

## ESLint Config Audit

The existing plugins are correct for this stack:

- ✅ `@eslint/js` — base JS rules
- ✅ `typescript-eslint` — TypeScript-specific rules
- ✅ `eslint-plugin-react-hooks` — hooks rules of React
- ✅ `eslint-plugin-react-refresh` — fast refresh safety
- ✅ **Added**: `eslint-config-prettier` — disables all formatting rules that would conflict with Prettier

> [!NOTE]
> No additional plugins are strictly required. Optional additions in the future:
>
> - `eslint-plugin-jsx-a11y` — accessibility linting for JSX
> - `eslint-plugin-import` — import ordering/validation

---

## Pre-existing Issues (Not Introduced by This PR)

### Typecheck (96 errors in 3 files)

All errors come from raw CSS embedded in `.tsx` files — TypeScript can't parse CSS syntax as code:

- `src/components/ui/irid-button.tsx` (57 errors)
- `src/components/ui/dotted-glow-background.tsx` (36 errors)
- `src/components/ui/background-beams-with-collision.tsx` (3 errors)

**Fix**: Move the CSS from these files into `.css` files or use `styled-components`/CSS modules.

### Lint (14 errors, 14 warnings)

Notable pre-existing issues:

- `@typescript-eslint/no-explicit-any` in several files
- `react-hooks/set-state-in-effect` in `LanguageContext.tsx`
- `react-hooks/exhaustive-deps` warnings in `vortex.tsx`

### Build

Vite build fails due to Tailwind CSS v4 `@apply bg-background` referencing an unknown utility class in `index.css`. This is a Tailwind theming configuration issue, not related to CI setup.

---

## Recommended Permanent Tests for `tests/`

> [!IMPORTANT]
> The following tests should be added to ensure long-term correctness of the data model and core utilities.

### 1. `tests/utils/importManager.test.ts` — **DONE (19 tests)**

Already covers: V3 passthrough, V2→V3 promotion, legacy promotion, string/array/boolean/number coercion, callbacks, extensions, assets, date handling, field resolution priority.

**Additional cases to add**:

- V1 card with `data` envelope → V3 promotion
- Deep character_book normalization (scan_depth, token_budget, recursive_scanning)
- Cards with mixed alias fields (`char_name` + `name` at different envelope levels)
- Extremely large payloads (performance sanity check)

### 2. `tests/utils/buildApiUrl.test.ts` — **DONE (11 tests)**

Already covers all provider paths and edge cases.

### 3. `tests/types/charactercard.test.ts` — **DONE (15 tests)**

Already covers: `createCharacterBookEntry`, `isValidCharacterBookEntry`, `normalizeCharacterBookEntry`, type guards.

### 4. `tests/utils/configManager.test.ts` — **TODO**

Test `loadConfig`/`saveConfig` with mocked `localStorage`:

- Round-trip serialization/deserialization
- Handling of corrupted JSON in localStorage
- Default fallback when no config stored

### 5. `tests/utils/promptMigration.test.ts` — **TODO**

- Returns defaults when input is `null`/`undefined`
- Passthrough when input is already valid
- Future migration paths (when versioned prompts are added)

### 6. `tests/utils/themeUtils.test.ts` — **TODO**

- Color computation helpers produce valid CSS values
- Edge cases: invalid hue/saturation/lightness inputs

### 7. `tests/utils/aiGenerator.test.ts` — **TODO**

- Request payload construction for different providers
- Error handling for network failures (mock `fetch`)
- Streaming response parsing

### 8. Component Smoke Tests — **TODO**

Using `@testing-library/react` (already installed):

- `tests/components/CharacterForm.test.tsx` — renders without crashing with empty props
- `tests/components/CharacterBook.test.tsx` — adding/removing entries updates state
- `tests/components/CharacterPreview.test.tsx` — renders preview with sample data
