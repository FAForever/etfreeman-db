# CLAUDE.md

## Project: Unit Database (FAF)
Supreme Commander unit database built with Vue.js 3.

## File Structure

### Application
**Location:** `src/`
- `main.js` - App entry point
- `App.vue` - Root component with global sass imports
- `index.html` - Main HTML file

**Router:** `src/router/`
- `index.js` - Vue Router 4 configuration with hash mode
  - `/` - View A (HomeView)
  - `/by-class` - View B (ByClassView)
  - `/:ids` - Compare view (comma-separated unit IDs)
  - Route guards for lastListView tracking and saved view restoration

**Components:** `src/components/`
- `ThumbComponent.vue` - Unit thumbnail tile (accepts `mini` prop for compact display)
- `FiltersComponent.vue` - Faction/kind/tech filters (uses `route.path` for view mode active state, `row` prop for horizontal layout)
- `Header.vue` - Version display + view switcher buttons
- `AppFooter.vue` - Footer
- `UnitComponent.vue` - Full unit details for compare view (accepts `unit` and `showedSections` props)
  - `unit/` - Sub-components for unit sections:
    - `UnitHeader.vue` - Unit name, icon, description
    - `WeaponsSection.vue` - Weapon stats with DPS, damage, cycle info
    - `DefenseSection.vue` - HP, shields, regen
    - `EconomySection.vue` - Build/r reclaim/mass/energy stats
    - `IntelSection.vue` - Radar, sonar, stealth, vision
    - `PhysicsSection.vue` - Speed, acceleration, turn rate
    - `AirPhysicsSection.vue` - Air-specific physics (layers, loiter)
    - `AbilitiesSection.vue` - Special abilities (transport, tactical nuke, etc.)
    - `UpgradesSection.vue` - Upgrade/build options
    - `VeterancySection.vue` - Veterancy bonuses
    - `WreckageSection.vue` - Wreckage/reclaim values

**Views:** `src/views/`
- `HomeView.vue` - **View A**: Faction grid layout with horizontal filters (uses `home_A` modifier)
- `ByClassView.vue` - **View B**: Category masonry layout with vertical sidebar (uses `home_B` modifier)
- `CompareView.vue` - Unit comparison screen with section toggles (saved to localStorage)

**State:** `src/stores/`
- `unitData.js` - Pinia store for unit data and selection
- `utils/` - Shared utilities:
  - `categorizer.js` - Unit categorization and tree generation
    - Exports: `categorize()`, `generateTierTree()`, `generateTypeTree()`, `getTech()`, `kindMap`
  - `categorizerData/` - Categorization data tables
    - `categorizeTables.js` - Lookup tables: `kindMap`, `TypeById`, `TypeToSection`, `sectionByType`, `typeOverrides`
    - `categorizeOrders.js` - Sort orders: `SECTION_ORDER`, `customOrderModifiers`, `sortTierKey`, `sortFaction`, `sortUnits`
  - `unitDecorator/` - Unit data decoration
    - `index.js` - Public API: exports `decorateUnit`, `decorateUnits`
    - `decorator.js` - Main decoration (adds DPS, fireCycle functions to weapons)
    - `dps2.js` - FA-accurate DPS calculation (MATH_IRound, firing cycle simulation, beam handling)

**Utilities:** `src/composables/`
- `useUnitData.js` - Composable wrapping store, adds `effectiveVisibleFactions` computed
- `useOptimalLayout.js` - Optimal section layout algorithm for ByClassView (replaces useUnitGrouping)
- `useStatRows.js` - Stat row formatting for unit details
- `useDoubleClickHandler.js` - Double-click event handling
- `helpers/common.js` - Common utility functions

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

**Tests:** `src/__tests__/`
- `stores/unitData.spec.js` - Store tests
- `utils/dpsCalculator.spec.js` - DPS calculator tests (imports `calculateDps` from `stores/utils/unitDecorator/dps2.js`)

### Build & Config
- `vite-plugin-spritesmith.js` - Custom plugin for PNG sprite generation
- `vite.config.js` - Vite config with Vue dev server (port 9001), sprite generation, Sass auto-imports
- `vitest.config.js` - Testing config
- `eslint.config.js` - ESLint flat config
- `package.json` - Scripts

### Data Generator
**Location:** `tools/generator/`
- Parses FAF Lua blueprints to JSON from the official FAForever repositories
- **Files:**
  - `fetcher.js` - Fetches blueprints from GitHub API (fa and nomads repos)
  - `downloader.js` - Downloads and caches blueprints locally
  - `parser.js` - Lua AST parser (handles blueprint and version files)
  - `index.js` - Main generator orchestration, pre-calculates `ProjectileFragmentMultiplier`
- **Scripts:**
  - `npm run download-blueprints` - Downloads blueprints to local cache
  - `npm run generate` - Fetches and generates on-the-fly (slim only)
  - `npm run generate:cached` - Generates from cache (fast, slim only)
  - `npm run generate:fat` - Fetches and generates with fat file
  - `npm run generate:cached:fat` - Generates from cache with fat file
- **Outputs:** `src/public/data/{index.json, projectiles.json, version.json}` + optional `index.fat.json`
  - `index.json` - Slim version with essential properties only
  - `projectiles.json` - Projectile fragment data for nested fragmentation DPS calculations
  - `index.fat.json` - Full unit data (only with `--withfat` flag)
  - `version.json` - FAF version number

## Key Patterns

**View Layout System:**
- Both main views use `.home` base class with modifiers:
  - `home_A` - Horizontal layout with top filters (HomeView)
  - `home_B` - Vertical layout with sidebar filters (ByClassView)
- `--factionCount` CSS variable controls grid column count
- View preference persisted to localStorage as `faf-last-view`

**Unit Properties (added by decorator + categorizer):**
- From `decorator.js`:
  - `id` - Unit blueprint ID
  - `name` - Unit name from blueprint
  - `description` - Unit description
  - `faction` - Faction name
  - `kind` - Basic kind (Build, Land, Air, Naval, Base) via `kindMap`
  - `tech` - Tech level (T1, T2, T3, EXP) via `getTech()`
  - `strategicIcon` - Strategic icon path
  - `icon` - Unit icon path
  - `fullName` - Display name with tech prefix (e.g., "T3 Percival: T3 Assault Bot")
  - `selected` - Boolean for compare view selection
  - `fireCycle` / `beamCycle` - Functions for weapon cycle formatting
- From `categorizer.js`:
  - `type` - Specific unit type (e.g., "T3 Assault Bot", "T2 Gunship")
  - `section` - High-level section (e.g., "Land", "Structures - Weapons")
  - `sortOrder` - Numeric value for sorting within categories
- Weapon properties (added to each weapon in `blueprint.Weapon` array):
  - `dps` - Calculated using FA-accurate algorithm (`calculateDps`)
  - `dpsShields` - DPS including DamageToShields bonus (only present if weapon has DamageToShields)
  - `fullDamage` - Total damage per projectile including fragments
  - `fullSalvoDamage` - `fullDamage * cycleProjs`
  - `projectileDotText` - Formatted DoT info
  - `isTML` - Boolean indicating if weapon is a Tactical Missile Launcher

**Categorization (categorizer.js):**
- `categorize(bp)` - Mutates blueprint to add `type`, `section`, `sortOrder`
- `type` is determined from `TypeById` lookup or generated from tech + description
- `section` maps from `type` via `TypeToSection` lookup
- `sortOrder` combines unit number, tech level, and custom modifiers
- `generateTierTree(units)` - Returns nested structure: `section -> tech -> faction -> units[]`
- `generateTypeTree(units)` - Returns nested structure: `section -> type -> faction -> units[]`

**DPS Calculation (dps2.js):**
- Implements FA game-accurate DPS calculation based on `fa\lua\ui\game\unitviewDetail.lua`
- `MATH_IRound(val)` - Banker's rounding to 0.1 precision (rounds .05 to nearest even)
- `calculateProjectileDamage(weapon, toShields)` - Returns damage per projectile
  - Beams: `damage * (1 + floor(beamTicks / (collisionTicks + 1)))`
  - Non-beams: `damage * DoTPulses + InitialDamage`
  - Fragments: multiplies by `weapon.ProjectileFragmentMultiplier` (pre-calculated by generator)
- `calculateFiringCycle(weapon)` - Returns `{ cycleProjs, cycleTime }`
  - Iterates `RackBones` with proper muzzle counting
  - Handles `RackFireTogether`, `MuzzleSalvoDelay`, `RackSalvoChargeTime`, `RackSalvoReloadTime`
- `calculateDps(weapon, toShields)` - Returns `(damage * cycleProjs) / cycleTime`
- Special cases:
  - `NukeWeapon` returns -1
  - `ForceSingleFire` returns null
  - Weapons without `RackBones` default to `MuzzleSalvoSize || 1`

**Unit Selection:**
- `unit.selected` toggled by `store.toggleUnitSelection(id)`
- Contender IDs stored in `store.contenders`
- Used for compare view URL generation

**Filter Behavior:**
- Faction filters default to `['UEF', 'Cybran', 'Aeon', 'Seraphim']` (Nomads excluded)
- Empty filter array = show all (applies to faction, kind, tech filters)
- `effectiveVisibleFactions` computed in `useUnitData.js` handles "empty = all" logic
- Text filter searches across `id`, `name`, `description`, `faction`, `kind`
- Inactive filters styled with `filter: grayscale(1); opacity: 0.4`

**Data Loading:**
- `store.loadData()` on app startup
- Fat data loads when URL has `?fat` query parameter
- Units decorated via `decorateUnits()` after loading

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

**useOptimalLayout(tierTree, containerWidth, ...):**
- Computes optimal section arrangement for ByClassView to minimize rows and wasted space
- Uses subset enumeration for first 2 rows, First-Fit Decreasing for remaining
- Section scores prioritize Land/Air to top rows
- Returns computed `optimalOrder` as flattened section list with tier data
