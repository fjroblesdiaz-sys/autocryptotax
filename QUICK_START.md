# Quick Start Guide - Server-Side Reports

## 5-Minute Setup

### Step 1: Environment Variables (1 min)

Create `.env` file in project root:

```bash
# Database - Use one of these:

# Option A: Local PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/autocryptotax"

# Option B: Free hosted option - Neon (https://neon.tech)
# DATABASE_URL="postgresql://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require"

# Option C: Railway (https://railway.app)
# DATABASE_URL="postgresql://[user]:[password]@[host].railway.app:[port]/[dbname]"

# Cloudinary - Free tier (https://cloudinary.com/users/register/free)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
CLOUDINARY_FOLDER="crypto-tax-reports"
```

**Getting Cloudinary credentials:**
1. Go to https://cloudinary.com/users/register/free
2. Sign up (free tier: 25 GB storage, 25 GB bandwidth/month)
3. Dashboard → Account Details → Copy Cloud name, API Key, API Secret

### Step 2: Database Setup (1 min)

```bash
# Generate Prisma client and create tables
pnpm prisma generate
pnpm prisma db push
```

### Step 3: Update Two Page Files (2 min)

**File 1: `src/app/reports/generate/page.tsx`**

Replace the entire file with:

```typescript
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ReportGenerationContainerNew } from '@/features/reports/containers/report-generation-new.container';

function GeneratePageInner() {
  const searchParams = useSearchParams();
  const reportRequestIdParam = searchParams.get('reportRequestId');
  return <ReportGenerationContainerNew reportRequestIdParam={reportRequestIdParam} />;
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Generando...</div>}>
      <GeneratePageInner />
    </Suspense>
  );
}
```

**File 2: `src/app/reports/complete/page.tsx`**

Replace the entire file with:

```typescript
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ReportCompleteContainerNew } from '@/features/reports/containers/report-complete-new.container';

function CompletePageInner() {
  const searchParams = useSearchParams();
  const reportRequestIdParam = searchParams.get('reportRequestId');
  return <ReportCompleteContainerNew reportRequestIdParam={reportRequestIdParam} />;
}

export default function CompletePage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Cargando...</div>}>
      <CompletePageInner />
    </Suspense>
  );
}
```

### Step 4: Test It! (1 min)

```bash
# Start the app
pnpm dev

# Open browser
# http://localhost:3000/reports

# Go through the flow:
# 1. Select "Exchange API Keys"
# 2. Enter your Binance/Coinbase credentials
# 3. Select Model 100 and fiscal year
# 4. Watch it generate (with polling!)
# 5. Download from Cloudinary
```

---

## Verify Everything Works

### Check Database
```bash
pnpm prisma studio
```
You should see `ReportRequest` table with your report.

### Check Cloudinary
Go to https://console.cloudinary.com/console/media_library
You should see your generated report file.

### Check Console
Look for these logs:
```
[API] Created new report request: xxx
[API] Uploading report to Cloudinary...
[API] Successfully uploaded to Cloudinary: https://...
[API] Report generation completed successfully
```

---

## Common Issues

**"Failed to connect to database"**
- Check DATABASE_URL is correct
- For local PostgreSQL: ensure it's running (`brew services start postgresql` or `sudo service postgresql start`)
- For hosted: check connection string format

**"Cloudinary upload failed"**
- Verify CLOUDINARY_* env vars are set correctly
- Check you haven't exceeded free tier limits
- Try regenerating API key in Cloudinary dashboard

**"Report stuck in processing"**
- Check server console for errors
- Verify exchange API credentials are valid
- Check database: `pnpm prisma studio` → ReportRequest → Check `errorMessage` field

---

## Clean Up Old Code (Optional)

After verifying everything works, you can delete:

```bash
# Remove old files
rm src/features/reports/context/report-data.context.tsx
rm src/features/reports/utils/report-data-storage.ts
rm src/lib/cache-manager.ts
```

And remove `ReportDataProvider` from your providers file.

---

## What Changed?

**Before:**
- Report data in React Context
- Files in browser's IndexedDB
- Generated on-demand during download

**After:**
- Report data in PostgreSQL
- Files in Cloudinary CDN
- Generated once, downloaded many times

**Benefits:**
- ✅ No data loss if user closes browser
- ✅ Fast downloads from CDN
- ✅ Report history and analytics
- ✅ Scalable server-side generation

---

## Need Help?

1. Check `IMPLEMENTATION_SUMMARY.md` for detailed info
2. Check `MIGRATION_GUIDE.md` for architecture details
3. Check server console for error messages
4. Check `pnpm prisma studio` to inspect database

Enjoy your new server-side report system! 🎉

