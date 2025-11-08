# FAF Unit Database

Web-based unit database for Forged Alliance Forever (FAF).  
Check it out [here](https://faforever.github.io/etfreeman-db/#/)  
Rewrite of the [original spooky-db](https://github.com/FAForever/spooky-db).  

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
```

## Data Generation

The project parses FAF Lua blueprints from the official repositories into JSON format:

```bash
# Download blueprints to local cache
npm run download-blueprints

# Generate data from cache (recommended for development)
npm run generate:cached

# Fetch and generate data on-the-fly
npm run generate
```

Generated files are output to `src/public/data/`:
- `index.json` - Slim version with essential properties
- `index.fat.json` - Complete unit data
- `version.json` - FAF version number

## Project Structure

```
├── src/
│   ├── components/       # Vue components
│   ├── views/           # Route views
│   ├── stores/          # Pinia stores and utilities
│   ├── composables/     # Reusable composition functions
│   ├── sass/            # Styles and generated sprites
│   ├── public/          # Static assets and data
│   └── __tests__/       # Unit tests
├── tools/
│   └── generator/       # Data generation pipeline
├── vite.config.js       # Vite configuration
└── vitest.config.js     # Testing configuration
```

## Links

- [FAF Website](https://faforever.com/)
- [Original spooky-db](https://github.com/FAForever/spooky-db)
