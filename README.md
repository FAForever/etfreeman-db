# FAF Unit Database

Web-based unit database for Forged Alliance Forever (FAF).

[Check it out](https://faforever.github.io/etfreeman-db/)

## Features

- **Comprehensive Unit Data** - All units from FAF with accurate stats
- **FA-Accurate DPS** - DPS calculations matching the game engine
- **Unit Comparison** - Compare multiple units side-by-side
- **Two View Modes** - Choose what you like
- **Weapon Details** - Grouped weapons with cycle information, efficiency metrics
- **Responsive Design** - Works on desktop and mobile

## Tech Stack

- Vue.js 3 + Vue Router + Pinia
- Vite
- Sass with auto-generated sprite sheets
- Vitest for testing
- Node.js-based Lua blueprint parser

## Installation

```bash
npm install
```

## Development

```bash
# Development server (http://localhost:9001)
npm run serve

# Production build
npm run build

# Run tests
npm run test
npm run test:watch
npm run test:ui
```

## Data Generation

The project parses FAF Lua blueprints from the official repositories into JSON format.

```bash
# Download blueprints to local cache
npm run download-blueprints

# Generate data from cache (recommended for development)
npm run generate:cached

# Fetch and generate data on-the-fly
npm run generate

# Generate with fat file (complete unit data)
npm run generate:fat
npm run generate:cached:fat
```

### Data Sources

Parses data from official FAForever repositories:
- Unit blueprints from [FAForever/fa](https://github.com/FAForever/fa)
- Projectile blueprints for fragmentation data
- Game constants (shield defaults, veterancy multipliers, wreckage multipliers, version) from FAF Lua scripts

### Generated Files

Output to `src/public/data/`:
- `index.json` - Slim version with essential properties
- `index.fat.json` - Complete unit data (optional)
- `projectiles.json` - Projectile fragment data for nested fragmentation
- `version.json` - FAF version number

## Project Structure

```
├── src/
│   ├── components/       # Vue components
│   │   ├── app/         # App-level components
│   │   ├── compare/     # Compare view components
│   │   ├── filters/     # Filter components
│   │   ├── homeview/    # Home view components
│   │   ├── bytypeview/  # ByType view components
│   │   ├── unit/        # Unit detail components
│   │   │   ├── sections/  # Unit data sections
│   │   │   └── helpers/   # Unit display helpers
│   │   └── ui/          # Reusable UI components
│   ├── views/           # Route views (Home, ByType, Compare)
│   ├── stores/          # Pinia stores
│   │   ├── compare/     # Comparison view sub-stores
│   │   └── utils/       # Store utilities (categorizer, decorator, DPS)
│   ├── composables/     # Reusable composition functions
│   ├── router/          # Vue Router configuration
│   ├── sass/            # Styles and generated sprites
│   ├── public/          # Static assets and data
│   └── __tests__/       # Unit tests
├── tools/
│   └── generator/       # Data generation pipeline
│       ├── index.js           # Main orchestration
│       ├── parser.js          # Lua AST parser
│       ├── fetcher.js         # GitHub API fetcher
│       ├── downloader.js      # Local cache manager
│       ├── Distillator.js     # Data distillation
│       ├── BlueprintEnricher.js  # Projectile enrichment
│       └── whitelist.js       # Property whitelist
├── vite.config.js       # Vite configuration
└── vitest.config.js     # Testing configuration
```

## DPS Calculation

The database implements FA-accurate DPS calculation based on the game engine:

- **MATH_IRound** - Banker's rounding to 0.1 precision
- **Firing Cycle Simulation** - Accurate rack/muzzle processing
- **Beam Handling** - Proper beam damage tick calculation
- **DoT Weapons** - Damage over Time breakdown
- **Fragmentation** - Nested fragment support
- **Split Projectiles** - Water-split and child projectile handling

See `src/stores/utils/unitDecorator/dps/` for implementation.

## Acknowledgments

This project initially was just a rewrite of [spooky-db](https://github.com/FAForever/spooky-db) using modern tech stack

## Links

- [FAF Website](https://faforever.com/)
