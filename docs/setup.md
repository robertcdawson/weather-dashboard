# Weather Dashboard Setup Guide

## Prerequisites
- Node.js v18+ (recommended: v20+)
- npm v9+ or yarn

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd weather-dashboard

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite development server with HMR |
| `npm run build` | TypeScript compile + Vite production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint on TypeScript files |

## Dependencies

### Runtime Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.2.0 | UI framework |
| react-dom | ^18.2.0 | React DOM renderer |
| zustand | ^4.4.6 | State management with persistence |
| framer-motion | ^11.0.8 | Animations (card flip, modals) |
| lucide-react | ^0.292.0 | Weather and UI icons |
| tailwind-merge | ^2.0.0 | Tailwind class merging |
| clsx | ^2.0.0 | Conditional className utility |
| class-variance-authority | ^0.7.0 | Component variant styling |
| @radix-ui/react-dialog | ^1.0.5 | Accessible modal primitives |
| @radix-ui/react-slot | ^1.0.2 | Component composition |
| uuid | ^9.0.1 | Unique ID generation |

### Dev Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| vite | ^4.4.5 | Build tool and dev server |
| typescript | ^5.0.2 | Type checking |
| @vitejs/plugin-react | ^4.0.3 | React Fast Refresh |
| tailwindcss | ^3.3.5 | Utility-first CSS |
| postcss | ^8.4.31 | CSS processing |
| autoprefixer | ^10.4.16 | CSS vendor prefixes |
| eslint | ^8.45.0 | Code linting |
| @typescript-eslint/* | ^6.0.0 | TypeScript ESLint rules |

## Environment Variables

**No API keys required!** This app uses Open-Meteo's free API which doesn't require authentication.

APIs used:
- Weather: `https://api.open-meteo.com/v1/forecast`
- Air Quality: `https://air-quality-api.open-meteo.com/v1/air-quality`
- Geocoding: `https://geocoding-api.open-meteo.com/v1/search`
- Reverse Geocoding: `https://nominatim.openstreetmap.org/reverse`

## Project Structure

```
weather-dashboard/
├── src/
│   ├── api/           # API integration
│   ├── components/    # React components
│   │   ├── ui/        # Reusable UI components
│   │   └── weather/   # Weather-specific components
│   ├── hooks/         # Custom React hooks
│   ├── store/         # Zustand store
│   ├── types/         # TypeScript types
│   ├── utils/         # Utility functions
│   ├── App.tsx        # Root component
│   ├── main.tsx       # Entry point
│   └── index.css      # Global styles + Tailwind
├── docs/              # Documentation
├── public/            # Static assets
├── index.html         # HTML entry point
├── vite.config.ts     # Vite configuration
├── tailwind.config.js # Tailwind configuration
├── tsconfig.json      # TypeScript configuration
└── package.json       # Dependencies and scripts
```

## Troubleshooting

### Vite dev server not starting
```bash
# Clear Vite cache and reinstall
rm -rf node_modules/.vite
npm install
npm run dev
```

### TypeScript errors
```bash
# Run type checking separately
npx tsc --noEmit
```

### Port already in use
Vite will automatically try the next available port (5174, 5175, etc.)

## Browser Support

- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

Requires JavaScript enabled and modern CSS features (CSS Grid, Custom Properties, backdrop-filter).