# Earnings Tracker

A personal earnings tracker application for managing daily income from bookings and inquiries, built with Next.js, TypeScript, and Tailwind CSS.

## 📌 Note for Contributors and Forks

If you're forking this repository, here are some important things to understand:

### Project Overview
This is a **single-user earnings tracking application** designed to help individuals track their daily income from bookings and inquiries. The application features:
- **Local-first storage** (localStorage by default) - all data is stored in your browser
- **Advance balance tracking** - manages advance payments and calculates remaining balances
- **Export functionality** - generate PNG/PDF reports of your earnings history
- **AI chat assistant** - integrated Gemini AI for natural language interactions

### Key Technical Details

1. **Color Format Issues**: This project uses Tailwind CSS v4 which may generate `oklab()` colors. The export functionality includes workarounds to convert these to RGB for compatibility with `html2canvas`. See `components/ExportButton.tsx` for the implementation.

2. **Data Structure**: 
   - Records are stored with an `isInitialAdvance` flag to distinguish the initial advance entry
   - Balance calculations are done sequentially based on date order
   - All calculations are in the `lib/calculations.ts` file

3. **Export System**: 
   - Uses a separate `ExportHistoryTable` component for clean exports
   - Temporarily disables problematic stylesheets during export to prevent oklab() parsing errors
   - The export table is hidden off-screen and made visible only during capture

4. **Environment Setup**:
   - No environment variables required for basic functionality (localStorage mode)
   - For AI features, add `NEXT_PUBLIC_GEMINI_API_KEY` to `.env.local`
   - For Google Sheets integration, add `NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY` and `NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID`

5. **Important Files**:
   - `lib/storage.ts` - Core data persistence logic
   - `lib/calculations.ts` - Business logic for earnings calculations
   - `components/ExportButton.tsx` - Export functionality with oklab() workarounds
   - `styles/globals.css` - All colors converted to RGB to prevent oklab() issues

### Getting Started After Forking

1. Clone your fork and install dependencies (use `--legacy-peer-deps` for React 19 compatibility)
2. The app works immediately with localStorage - no setup required
3. For AI features, add your Gemini API key to `.env.local`
4. Run `npm run dev` and start tracking your earnings!

### Customization Tips

- **Change currency symbol**: Edit `formatCurrency` function in `lib/calculations.ts`
- **Modify default rates**: Update `DEFAULT_SETTINGS` in `lib/storage.ts`
- **Adjust export styling**: Modify `components/ExportHistoryTable.tsx`
- **Add new fields**: Update the `DailyRecord` interface in `lib/storage.ts` and related components

## Features

- 📊 **Daily Earnings Entry**: Track base pay, bookings, and inquiry pay
- 💰 **Advance Management**: Keep track of advance payments and remaining balance
- 📈 **Historical Records**: View and filter your earnings history
- 📸 **Export Reports**: Generate PNG or PDF reports of your daily earnings
- ⚙️ **Customizable Settings**: Configure base pay rates and commission structure
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 💾 **Local Storage**: Data persists locally in your browser (Supabase support coming soon)

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Forms**: react-hook-form + zod validation
- **Export**: html2canvas (PNG) + jsPDF (PDF)
- **State Management**: React hooks
- **Storage**: localStorage (Supabase ready)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/earnings-tracker.git
cd earnings-tracker
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
# or
yarn install
```

3. Create environment file (optional - only needed for Supabase):
```bash
cp env.local.example .env.local
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
earnings-tracker/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Main dashboard page
│   ├── settings/          # Settings management
│   ├── history/           # Earnings history view
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── EarningsForm.tsx  # Daily entry form
│   ├── EarningsCard.tsx  # Earnings display card
│   ├── HistoryTable.tsx  # Records table
│   └── ExportButton.tsx  # Export functionality
├── lib/                   # Core business logic
│   ├── calculations.ts   # Earnings calculations
│   ├── storage.ts        # Data persistence layer
│   ├── schemas.ts        # Zod validation schemas
│   └── utils.ts          # Utility functions
├── styles/               # Global styles
│   └── globals.css       # Tailwind imports & theme
└── prisma/               # Database schema (future)
```

## Usage Guide

### 1. Dashboard

The dashboard is your main entry point for tracking daily earnings:

- **Date**: Select the date for your earnings entry
- **Base Pay**: Your guaranteed daily pay (configurable in settings)
- **Bookings**: Enter the number of bookings completed
- **Inquiry Pay**: Additional earnings from inquiries (optional)
- **Advance Used**: Amount deducted from advance balance
- **Action/Activity**: Brief description of daily activities
- **Notes**: Additional notes or details

The form automatically calculates:
- Booking Pay = Number of Bookings × Per Booking Rate
- Total Earnings = Base Pay + Booking Pay + Inquiry Pay
- Remaining Balance = Previous Balance - Advance Used + Total Earned

### 2. Settings

Configure your default values:
- **Default Base Pay**: Your standard daily rate
- **Per Booking Commission**: Commission per completed booking  
- **Initial Advance Balance**: Starting balance for calculations

Settings are saved in localStorage and persist between sessions.

### 3. History

View and manage your earnings records:
- **Filter by Date Range**: Select start and end dates
- **Search**: Find records by action or notes
- **Summary Stats**: View totals for filtered records
- **Pagination**: Navigate through large datasets
- **Delete Records**: Remove incorrect entries

### 4. Export

Export your daily earnings summary:
- **PNG Export**: High-quality image for sharing
- **PDF Export**: Professional document format (optional)

## Data Storage

### Local Storage Mode (Default)

Data is stored in your browser's localStorage:
- Settings: `earnings_settings`
- Records: `earnings_records`

**Important**: Data is tied to your browser and domain. Clearing browser data will delete all records.

### Supabase Mode (Coming Soon)

Set `NEXT_PUBLIC_BACKEND_MODE=supabase` in `.env.local` and configure:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL`

## Development

### Running Tests

```bash
npm test
# or
yarn test
```

### Building for Production

```bash
npm run build
npm start
# or
yarn build
yarn start
```

### Code Quality

```bash
npm run lint
# or
yarn lint
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Deploy with default settings

### Environment Variables

For production, set these in your deployment platform:
- `NEXT_PUBLIC_BACKEND_MODE=local` (or `supabase`)
- Supabase credentials (if using Supabase)

## Troubleshooting

### Common Issues

1. **Dependencies Installation Fails**
   - Use `npm install --legacy-peer-deps` due to React 19 compatibility

2. **Data Not Persisting**
   - Check browser's localStorage settings
   - Ensure not in private/incognito mode

3. **Export Not Working**
   - Allow pop-ups for the site
   - Check browser console for errors

4. **Form Validation Errors**
   - Ensure numeric fields have valid numbers
   - Check date format (YYYY-MM-DD)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

## Support

For issues and questions:
- Create an issue on GitHub
- Check existing issues for solutions

---

Made with ❤️ for daily earnings tracking