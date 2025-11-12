# CLAUDE.md

## Project: Unit Database (FAF)
Supreme Commander unit database built with Vue.js 3.

## File Structure

### Application
**Location:** `src/`
- `main.js` - App entry point, router setup
- `App.vue` - Root component with global sass imports
- `index.html` - Main HTML file

**Components:** `src/components/`
- `ThumbComponent.vue` - Unit thumbnail tile
- `FiltersComponent.vue` - Faction/kind/tech filters (uses `route.path` for view mode active state)
- `AppFooter.vue` - Footer
- `UnitComponent.vue` - Full unit details for compare view (accepts `unit` and `showedSections` props)
  - `unit/` - Sub-components for unit sections (DefenseSection, EconomySection, etc.)

**Views:** `src/views/`
- `HomeView.vue` - Main unit grid by faction (dynamic grid columns via CSS var `--factionCount`)
- `ByClassView.vue` - Units grouped by category and detailed classification (filtered factions hidden completely)
- `CompareView.vue` - Unit comparison screen with section toggles (saved to localStorage)

**State:** `src/stores/`
- `unitData.js` - Pinia store for unit data and selection
- `utils/unitDecorator/` - Unit data transformation (modular structure):
  - `index.js` - Public API exports
  - `decorator.js` - Main decoration orchestration
  - `classification.js` - Classification and categorization logic
  - `dps.js` - Weapon cycle formatting functions (fireCycle, beamCycle)
  - `dps2.js` - FA-accurate DPS calculation (based on fa\lua\ui\game\unitviewDetail.lua)
  - `lookups.js` - Static lookup tables
  - `exceptions.js` - Special case configurations

**Utilities:** `src/composables/`
- `useUnitData.js` - Composable wrapping store
- `useUnitGrouping.js` - Unit hierarchy grouping for ByClassView
- `useStatRows.js` - Stat row formatting for unit details
- `useDoubleClickHandler.js` - Double-click event handling
- `helpers/` - Utility functions (sorting, unit ID parsing, common helpers)

**Static Assets:** `src/public/`
- `img/` - Images (faction headers, background, sprite sources)
  - `ui/` - UI icon sources
  - `strategic/` - Strategic icon sources
  - `units/` - Unit icon sources
- `data/` - Unit JSON data

**Styles:** `src/sass/`
- `normalize.sass` - CSS reset
- `fonts.sass` - Font declarations
- `abstracts/` - Sass variables and mixins
  - `colors.sass` - Faction color map
  - `vars.sass` - Global CSS variables
  - `mixins.sass` - Responsive mixins
- `generated/` - Auto-generated sprite sheets (git-ignored)
  - `ui_sprites.sass`
  - `strategic_sprites.sass`
  - `units_sprites.sass`

**Tests:** `src/__tests__/`
- `stores/unitData.spec.js` - Store tests
- `utils/unitDecorator.spec.js` - Unit decorator tests (imports from `stores/utils/unitDecorator`)
- `utils/dpsCalculator.spec.js` - DPS calculator tests (imports from `stores/utils/unitDecorator`)

### Build & Config
- `vite-plugin-spritesmith.js` - Custom plugin for PNG sprite generation
- `vite.config.js` - Vite config with:
  - Vue dev server (port 9001)
  - Sprite generation plugin
  - Sass preprocessor with auto-imports
- `vitest.config.js` - Testing config
- `package.json` - Scripts (see below)

### Data Generator
**Location:** `tools/generator/`
- Parses FAF Lua blueprints to JSON from the official FAForever repositories
- **Files:**
  - `fetcher.js` - Fetches blueprints from GitHub API (fa and nomads repos)
  - `downloader.js` - Downloads and caches blueprints locally
  - `parser.js` - Lua AST parser (handles blueprint and version files)
  - `index.js` - Main generator orchestration
- **Scripts:**
  - `npm run download-blueprints` - Downloads blueprints to local cache
  - `npm run generate` - Fetches and generates on-the-fly (slim only)
  - `npm run generate:cached` - Generates from cache (fast, slim only)
  - `npm run generate:fat` - Fetches and generates with fat file
  - `npm run generate:cached:fat` - Generates from cache with fat file
- **Outputs:** `src/public/data/{index.json, projectiles.json, version.json}` + optional `index.fat.json`
  - `index.json` - Slim version with essential properties only (always generated)
  - `projectiles.json` - Projectile fragment data for nested fragmentation DPS calculations (always generated)
  - `index.fat.json` - Full unit data (only generated with `--withfat` flag)
  - `version.json` - FAF version number (always generated)

## Key Patterns

**Unit Properties (added by decorator):**
- `classification` - Basic type (Build, Land, Air, Naval, Base)
- `detailedClassification` - Specific classification (e.g., "T2 Engineering Station", "T3 Assault Bot")
- `category` - Grouping category (e.g., "Land", "Construction - Buildpower", "Structures - Weapons")
- `sortOrder` - Numeric value for sorting units by category and detail
- `tech` - Tech level (T1, T2, T3, EXP)
- `fullName` - Display name with tech prefix
- `fireCycle` / `beamCycle` - Functions for weapon cycle formatting
- Weapon properties (added to each weapon in blueprint.Weapon array):
  - `dps` - Calculated using FA-accurate algorithm (calculateDps2)
  - `dpsShields` - DPS including DamageToShields bonus (only present if weapon has DamageToShields)
  - `isTML` - Boolean indicating if weapon is a Tactical Missile Launcher

**DPS Calculation (dps2.js):**
- Implements FA game-accurate DPS calculation based on `fa\lua\ui\game\unitviewDetail.lua`
- Key features:
  - Full firing cycle simulation with RackBones iteration
  - Tick-based rounding (MATH_IRound: 0.1s precision)
  - Beam weapon calculation with BeamLifetime and BeamCollisionDelay
  - Nested projectile fragmentation support (reads from projectiles.json)
  - DoTPulses and InitialDamage handling
  - MuzzleChargeDelay support
  - Returns 2-decimal rounded values using .toFixed(2)
- Special cases:
  - NukeWeapon returns -1
  - ForceSingleFire returns null
  - Weapons without RackBones default to MuzzleSalvoSize || 1

**Routing:** Vue Router 4 with hash mode
- `/` - Home view
- `/by-class` - Classification view
- `/:ids` - Compare view (comma-separated unit IDs)
- Catch-all redirects to `/`

**Unit Selection:** `unit.selected` toggled by `store.toggleUnitSelection()` in `stores/unitData.js`

**Filter Behavior:**
- Faction filters default to `['UEF', 'Cybran', 'Aeon', 'Seraphim']` (Nomads excluded initially)
- Empty filter array = show all (applies to all filter types)
- `effectiveVisibleFactions` computed in `useUnitData.js` handles "empty = all" logic
- Inactive filters styled with `filter: grayscale(1); opacity: 0.4`

**Data Loading:** `stores/unitData.js` → `loadData()` on app startup

**Compare View Section Toggles:**
- Section visibility stored in `ref()` object (Defense, Economy, Abilities, etc.)
- Persisted to localStorage key `faf-compare-sections` on every toggle
- Passed as prop to UnitComponent, controls v-if on each section

**Sprite Generation:** Auto-generated on build/dev from PNG sources in `src/public/img/`
- Outputs to `src/sass/generated/*.sass`
- Uses bin-pack algorithm for optimal sprite sheets
- Watched for hot reload during development

**Sass Auto-imports:** Available in all `.sass`/`.vue` files via vite.config.js:
- `@/sass/abstracts/colors.sass`
- `@/sass/abstracts/mixins.sass` (as `*`)
- `sass:color`
- `sass:math`

## Token Efficiency
- Use Grep/Glob instead of reading files when searching
- Be specific about file/line when reporting bugs
