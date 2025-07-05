# IoT AQI Dashboard

A lightweight, real-time Air Quality Index monitoring dashboard built with Next.js.

## Features

- Real-time AQI monitoring
- Gas level readings (PM2.5, PM10, O₃, NO₂, SO₂, CO)
- Interactive charts and visualizations
- Lightweight and optimized for deployment
- Responsive design

## Tech Stack

- **Framework**: Next.js 15.2.4
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **UI Components**: Radix UI (minimal set)

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Netlify

### Option 1: Deploy via Netlify UI (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/iot-aqi-dashboard.git
   git push -u origin main
   ```

2. **Deploy to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Sign up/Login with your GitHub account
   - Click "New site from Git"
   - Choose your repository
   - Set build settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `out`
   - Click "Deploy site"

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

## Build Configuration

The project is configured for static export with:
- `next.config.mjs`: Static export enabled
- `netlify.toml`: Netlify-specific configuration
- Optimized bundle size (33 fewer dependencies)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── analytics/         # Analytics page
├── components/            # React components
│   ├── ui/               # Minimal UI components
│   ├── aqi-gauge.tsx     # AQI gauge component
│   ├── gas-card.tsx      # Gas reading cards
│   └── trend-chart.tsx   # Trend visualization
├── lib/                  # Utilities
├── public/               # Static assets
└── out/                  # Static export (generated)
```

## Performance Optimizations

- ✅ Removed 33 unused dependencies
- ✅ Minimal UI component library
- ✅ Static export for fast loading
- ✅ Optimized bundle size
- ✅ Lightweight theme system

## License

MIT License 