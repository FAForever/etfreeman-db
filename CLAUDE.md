# CLAUDE.md

## Project: Unit Database (FAF)
Supreme Commander: Forged Alliance Forever (FAF) unit database web application built with Vue 3.

## File Structure

### Application
**Location:** `src/`

**Entry:**
- `main.js` - App entry point
- `App.vue` - Root component with global sass imports
- `index.html` - Main HTML file

**Router:** `src/router/index.js`
- Vue Router 4 with hash mode
- Routes: `/`, `/by-type`, `/:ids` (compare)
- View preference persisted as `faf-last-view`

---

### Views: `src/views/`
- `HomeView.vue` - View A: Faction grid with horizontal filters (redirects from mobile)
- `ByTypeView.vue` - View B: Category masonry layout with vertical sidebar
- `CompareView.vue` - Unit comparison with dynamic sections, URL-based unit selection

---

### Components: `src/components/`

**App-level:**
- `BackgroundPicture.vue` - Background image display
- `Icon.vue` - Icon component
- `SvgSprite.vue` - SVG sprite display
- `ThumbComponent.vue` - Unit thumbnail tile (`mini` prop for compact)
- `FiltersComponent.vue` - Faction/kind/tech filters
- `Header.vue` - Version display + view switcher
- `HomeTop.vue` - Home view header
- `SettingsPanel.vue` - Settings panel

**ByType view:**
- `ByTypeSection.vue` - Section component for type-based view

**Home view:**
- `HomeSection.vue` - Tier-based section display
- `HomeSectionTier.vue` - Individual tier component
- `config.js` - Section sort scores, tier buttons, min widths

**Compare view:**
- `BackButton.vue` - Navigation back
- `FilterButton.vue` - Filter toggle
- `SectionFilters.vue` - Section visibility filters
- `SettingsButton.vue` - Settings toggle
- `SettingsPanel.vue` - Comparison settings
- `UnitRow.vue` - Row of units in comparison
- `CalculationSelect.vue` - Efficiency calculation selector

**Filters:**
- `FiltersHeader.vue` - Filter header bar
- `FilterGroups.vue` - Filter group display

**Unit detail:**
- `UnitComponent.vue` - Main unit card with dynamic layout
- `unit/sections/` - Unit data sections:
  - `Header.vue` - Unit name, icon, description
  - `Defense.vue` - HP, shields, regen
  - `Economy.vue` - Build costs, production, storage
  - `Offense.vue` - Weapon stats with DPS table
  - `Physics.vue` - Speed, acceleration, turn rate
  - `Abilities.vue` - Special abilities
  - `Intel.vue` - Radar, sonar, stealth, vision
  - `Transport.vue` - Transport capacity
  - `Veterancy.vue` - Veterancy bonuses
  - `Wreckage.vue` - Wreckage/reclaim values
  - `Enhancements.vue` - ACU/SACM upgrades
  - `index.js` - Barrel export
- `unit/helpers/` - Unit display helpers:
  - `WeaponGroup.vue` - Collapsible weapon group table rows
  - `Projectile.vue` - Projectile info display
  - `LineItem.vue` - Generic line item display
  - `Enhancement.vue` - Enhancement item display

**UI components:**
- `ToggleSwitch.vue` - On/off toggle
- `Select.vue` - Dropdown select
- `Input.vue` - Text input
- `Resizer.vue` - Slide-out panel resizer
- `CostsList.vue` - Economy cost list
- `SingleCostItem.vue` - Single cost display
- `BuildtimeIcon.vue` - Build time icon
- `EnergyIcon.vue` - Energy icon
- `MassIcon.vue` - Mass icon
- `HpIcon.vue` - HP icon

---

### Stores: `src/stores/`

**`unitData.js`** - Main unit data store
- State: `units`, `unitsMap`, `version`, `unitDefaults`
- Computed: `visibleUnits`, `tierTree`, `typeTree`
- Actions: `loadData()`, `setData()`, `toggleUnitSelection()`

**`filterStore.js`** - Filter state
- State: `factions` (Set), `kinds` (Set), `tech` (Set), `search` (string)
- Actions: `passesFilters()`, `toggleFaction()`, etc.
- Note: Factions stored lowercase: `'uef'`, `'cybran'`, `'aeon'`, `'seraphim'`

**`compare/index.js`** - Comparison view store (composes sub-stores)
- `useShowedSections.js` - Section visibility (all on by default)
- `useCompareToggles.js` - Toggle settings (compactSections, minorWeaponStats, etc.)
- `useEfficiencySettings.js` - Efficiency calculation modes (unitMode, weaponMode, invert)
- `useSettingsSaver.js` - Settings persistence to localStorage
- `sectionOrder.js` - Default section order array

**`utils/contenders.js`** - Unit selection management
- Exports: `contenders`, `toggleUnitSelection()`, `clearSelection()`, `smartSelect()`

---

### Store Utilities: `src/stores/utils/`

**`categorizer.js`** - Unit categorization
- Exports: `categorize()`, `generateTierTree()`, `generateTypeTree()`, `getTech()`, `deriveKind()`
- Adds to blueprints: `type`, `section`, `sortOrder`

**`categorizerData/`** - Categorization data
- `categorizeTables.js` - Lookup tables: `TypeById`, `TypeToSection`, `sectionByType`
- `categorizeOrders.js` - Sort orders: `SECTION_ORDER`, `customOrderModifiers`, sort functions

**`unitDecorator/`** - Unit data decoration
- `decorator.js` - Main decoration (adds DPS, fireCycle to weapons)
- `dps/index.js` - DPS API: `calculateDps()`, `calculateFiringCycle()`, `getDetailedCycle()`
- `dps/calculations.js` - Core math: `MATH_IRound()`, `calculateProjectileDamage()`, rack processing
- `dps/formatters.js` - Cycle text formatting for UI

---

### Composables: `src/composables/`

**Core:**
- `useUnitData.js` - Wrapper around unitDataStore, adds `effectiveVisibleFactions`
- `useContainerWidth.js` - Container width observation
- `useUnitsPerRow.js` - Calculate units per row for layout
- `useDoubleClickHandler.js` - Double-click event handling
- `useClickOutside.js` - Click outside detection
- `useMods.js` - Mod integration
- `useResizeWatcher.js` - Resize observation
- `useRowAlignment.js` - Row alignment logic
- `useFactionColorFilter.js` - Faction color filtering

**Layout:**
- `useOptimalLayout.js` - Optimal section layout algorithm (subset enumeration + FFD)

**Weapon:**
- `useWeaponGroups.js` - Weapon grouping by category
- `useCalcEfficiency.js` - Efficiency calculation (DPS/mass, etc.)
- `useWeaponColumns.js` - Dynamic column selection for weapon tables

**UI:**
- `useAutoShrinkTable.js` - Auto-shrink overflowing tables

**Helpers:**
- `helpers/common.js` - Common utilities: `formatNum()`, `shorten()`, `round()`, `smartRound()`, `throttle()`
- `helpers/weaponHelper.js` - Weapon type helpers: `isMissile()`, `isTorpedo()`, `isAntiMissile()`, etc.

**Weapon modules:**
- `weapon/useWeaponGrouping.js` - Weapon grouping for comparison tables
- `weapon/weaponStats.js` - Stat collection and formatting for weapon tables
- `weapon/weaponTooltips.js` - Tooltip generation for weapon stats
- `weapon/StatsCollector.js` - Stats collection utility

---

### Static Assets: `src/`

**`data/svgicons/`** - SVG icon data (clear, arrow_left, factions, cog, filter, plus, buildtime)

**`public/`** - Public assets
- `data/` - Generated JSON data files
- `fonts/` - Font files
- `img/` - Images (ui, strategic, units)

**`sass/`** - Styles
- `abstracts/` - Variables and mixins
- `generated/` - Auto-generated sprites (git-ignored)
- `modules/` - Style modules

---

### Tests: `src/__tests__/`
- `setup.js` - Test setup
- `stores/unitData.spec.js` - Store tests
- `stores/filterStore.spec.js` - Filter store tests
- `utils/dpsCalculator.spec.js` - DPS calculation tests (22 test cases)

---

### Data Generator: `tools/generator/`

**Purpose:** Parse FAF Lua blueprints to JSON from official FAForever repositories

**Core files:**
- `index.js` - Main generator orchestration (args: `--cached`, `--withfat`)
- `parser.js` - Lua AST parser using luaparse
  - `parseBlueprint()` - Parse unit blueprint
  - `parseProjectile()` - Parse projectile data
  - `parseProjectileScript()` - Parse projectile script (childCount, splitType)
  - `parseVersion()` - Parse version.lua
  - `parseShield()` - Parse shield.lua constants
  - `parseVeterancyConstants()` - Parse veterancy multipliers
  - `parseWreckageConstants()` - Parse wreckage multipliers
- `fetcher.js` - Fetch blueprints from GitHub API
- `downloader.js` - Download and cache blueprints locally

**New modules:**
- `Distillator.js` - Whitelist-based data distillation
  - `filterUnits()` - Campaign/force-exclude filtering
  - `distillUnit()` - Property whitelist distillation
- `BlueprintEnricher.js` - Unit enrichment from projectiles
  - Adds `__fragmentCount`, `Projectile` data, `childCount`, `childSplitType`, `isAntiMissileFlare`
- `CacheManager.js` - Local cache management
- `whitelist.js` - Property whitelist for distillation
- `weaponExtractor.js` - Extract specific weapons for testing

**Scripts:**
```bash
npm run download-blueprints    # Download to cache
npm run generate               # Fetch and generate (slim)
npm run generate:cached        # Generate from cache (slim)
npm run generate:fat           # Fetch and generate with fat
npm run generate:cached:fat    # Generate from cache with fat
```

**Outputs:** `src/public/data/{index.json, projectiles.json, version.json}` + optional `index.fat.json`

---

### Build & Config
- `vite.config.js` - Vite config (port 9001, sprite generation, Sass auto-imports)
- `vite-plugin-spritesmith.js` - PNG sprite generation plugin
- `vitest.config.js` - Testing config with `@` alias resolution
- `eslint.config.js` - ESLint flat config
- `package.json` - Scripts

---

## Key Patterns

### View Layout System
- HomeView: `.home.home_A` - Horizontal layout with top filters
- ByTypeView: `.home.home_B` - Vertical layout with sidebar filters
- `--factionCount` CSS variable controls grid columns
- View preference persisted to `faf-last-view`

### Unit Properties (added by decorator + categorizer)

**From decorator:**
- `id` - Unit blueprint ID
- `name` - Unit name from blueprint
- `description` - Unit description
- `faction` - Faction name (lowercase)
- `kind` - Basic kind (Land, Air, Naval, Base)
- `tech` - Tech level (T1, T2, T3, EXP)
- `strategicIcon` - Strategic icon path
- `icon` - Unit icon path
- `fullName` - Display name with tech prefix

**From categorizer:**
- `type` - Specific type (e.g., "T3 Assault Bot")
- `section` - High-level section (e.g., "Land")
- `sortOrder` - Numeric sort value

**Weapon properties:**
- `dps` - Damage per second
- `dpsShields` - DPS including DamageToShields bonus (if applicable)
- `fullDamage` - Total damage per projectile including fragments
- `fullSalvoDamage` - `fullDamage * cycleProjs`
- `projectileDotText` - Formatted DoT info
- `firingCycle` - `{ cycleProjs, cycleTime }`
- `__fragmentCount` - Pre-calculated fragment multiplier
- `__splitCount` - Child projectile count
- `Projectile` - Projectile cost/health data

### DPS Calculation (`stores/utils/unitDecorator/dps/`)

**Three-layer architecture:**

1. `calculations.js` - Pure math functions:
   - `MATH_IRound(val)` - Banker's rounding to 0.1
   - `calculateProjectileDamage(weapon, toShields)` - Damage per projectile
   - `getBeamDamageTicks(weapon)` - Beam damage tick count
   - `getDoTBreakdown(weapon)` - Damage over Time breakdown
   - `getSalvoInfo(weapon)` - Salvo classification
   - `getFiringCooldown(weapon)` - Firing cooldown calc
   - `processRackSequence(weapon)` - Rack/muzzle processing

2. `index.js` - Main API:
   - `calculateDps(weapon, toShields)` - DPS calculation
   - `calculateFiringCycle(weapon)` - Cycle calculation
   - `getDetailedCycle(weapon, toShields, isOneTimeUse)` - Cycle text

3. `formatters.js` - UI formatting:
   - `formatDmg()` - Damage text
   - `formatStandardBeamCycle()` - Beam cycle text
   - `formatMuzzleSalvoCycle()` - Muzzle salvo text
   - `formatMultiRackSalvoCycle()` - Multi-rack salvo text
   - `formatCommonCycle()` - Common cycle text
   - `formatNukeCycle()` - Nuke cycle text

### Weapon Grouping

**Categories:** Direct, Anti-Air, Torpedo, Depth charge, Anti-Missile, Anti-Torpedo, Nuke, Sniper mode, Kamikaze, Overcharge

**Grouped by:** `WeaponCategory`, custom mappings, special cases

**Sorted by:** DPS descending

### Filter Behavior
- Faction filters stored as `Set` with lowercase values: `'uef'`, `'cybran'`, `'aeon'`, `'seraphim'`
- Empty Set = show all (applies to faction, kind, tech)
- Text filter searches: `id`, `name`, `description`, `faction`, `kind`
- Inactive filters: `filter: grayscale(1); opacity: 0.4`

### Compare View Features

**Efficiency calculations:**
- Modes: `DPS/mass`, `DPS/energy`, `DPS/BT`, `DPM/mass`, etc.
- Invertible: `mass/DPS`, etc.
- Separate for units and weapons

**Section toggles:**
- All sections visible by default
- Persisted to localStorage key `faf-compare-sections`

**Dynamic columns:**
- Only show columns with data present
- Configurable minor stat toggles

**Auto-shrink:**
- Tables auto-shrink to fit width
- Progressive font/cell reduction (11 levels)

### Layout Algorithms

**useOptimalLayout:**
- Subset enumeration for first 2 rows
- First-Fit Decreasing for remaining
- Section scores prioritize Land/Air

**ByTypeView:**
- Masonry layout via `@yeger/vue-masonry-wall`

### Data Loading
- `store.loadData()` on startup
- Fat data loads when URL has `?fat` query parameter
- Units decorated via `decorateUnits()` after loading

### Sprite Generation
- Auto-generated on build/dev from `src/public/img/`
- Outputs to `src/sass/generated/*.sass`
- Bin-pack algorithm for optimal sheets
- Watched for hot reload

### Sass Auto-imports
Available in all `.sass`/`.vue` files:
- `@/sass/abstracts/colors.sass`
- `@/sass/abstracts/mixins.sass` (as `*`)
- `sass:color`
- `sass:math`

### Section Order
```
Land, Air, Naval, Construction - Buildpower, Structures - Weapons,
Structures - Support, Structures - Intelligence, Structures - Economy,
Structures - Factories, Experimental, Unknown
```

### Faction Order
```
uef: 1, cybran: 2, aeon: 3, seraphim: 4, nomads: 5
```

### Tier Order
```
T1: 1, T2: 2, T3: 3, EXP: 4, '': 1
```

### Weapon Columns
TYPE, DPS, DPS_PER_MASS, HP, DPS_TO_SHIELDS, DPS_TO_SHIELDS_PER_MASS,
RANGE, AOE, DOT, MUZZLE_VELOCITY, FIRING_TOLERANCE, YAW,
RANDOMNESS, RANDOMNESS_MOVE, CYCLE, CYCLE_TO_SHIELDS

## Key Exports

### DPS Module
```javascript
import { calculateDps, calculateFiringCycle, getDetailedCycle } from '@/stores/utils/unitDecorator/dps/index.js'
```

### Decorator
```javascript
import { decorateUnit, decorateUnits } from '@/stores/utils/unitDecorator/decorator.js'
```

### Categorizer
```javascript
import { categorize, generateTierTree, generateTypeTree } from '@/stores/utils/categorizer.js'
```

### Stores
```javascript
import { useUnitDataStore } from '@/stores/unitData.js'
import { useFilterStore } from '@/stores/filterStore.js'
import { useCompareStore } from '@/stores/compare/index.js'
```

### Composables
```javascript
import { useWeaponGroups } from '@/composables/useWeaponGroups.js'
import { useCalcEfficiency } from '@/composables/useCalcEfficiency.js'
import { useOptimalLayout } from '@/composables/useOptimalLayout.js'
import { useWeaponColumns } from '@/composables/useWeaponColumns.js'
```
