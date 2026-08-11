# CredPulse Frontend

Next.js frontend application for CredPulse financial analytics platform.

## Features

- Interactive transaction table with filtering, sorting, and pagination
- Spend analytics with category breakdown and monthly trends
- Rewards catalog with coin balance display
- Real-time coin redemption with optimistic updates
- Responsive design with dark theme
- Server-side processing and data fetching

## Tech Stack

- Next.js 14 with React 18
- TypeScript
- Recharts for data visualization
- Lucide React for icons
- Tailwind-like CSS utilities

## Prerequisites

- Node.js 18+
- Backend API service running

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your backend API URL:
   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   Navigate to `http://localhost:3000`

## Build for Production

```bash
npm run build
npm start
```

## Deployment

The frontend is configured for deployment on Vercel (see `vercel.json`).