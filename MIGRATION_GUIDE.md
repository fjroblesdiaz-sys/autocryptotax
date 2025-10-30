# Report System Migration Guide

## Overview

The report generation system has been migrated from client-side storage (localStorage, IndexedDB, React Context) to a server-side database + Cloudinary architecture.

## Architecture Changes

### Before
- Report data stored in React Context
- Session data in localStorage/sessionStorage
- Generated reports in IndexedDB
- Reports generated on-demand during download

### After
- Report data stored in PostgreSQL database via Prisma
- Generated report files uploaded to Cloudinary
- Frontend polls database for status
- Reports downloaded directly from Cloudinary

## New Database Schema

```prisma
model ReportRequest {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // User's input data
  dataSource     String?  // 'wallet' | 'csv' | 'manual' | 'api-key' | 'oauth'
  sourceData     Json?    // Dynamic data based on source
  reportType     String?  // 'model-100' | 'model-720' | 'model-714'
  fiscalYear     Int?
  
  // Generation status
  status          String  @default("draft")  // 'draft' | 'processing' | 'completed' | 'error'
  errorMessage    String?
  
  // Generated results (in Cloudinary)
  cloudinaryPublicId String?
  cloudinaryUrl      String?
  fileFormat         String?  // 'csv' | 'pdf' | 'json'
  generatedReport    Json?    // Structured report data
  
  // Statistics
  totalTransactions Int?
  totalGains        Float?
  totalLosses       Float?
  netResult         Float?
  
  // Taxpayer info
  taxpayerNif     String?
  taxpayerName    String?
  taxpayerSurname String?
}
```

## API Endpoints Created

### Report Request CRUD
- `POST /api/report-requests` - Create new report request
- `GET /api/report-requests` - List all report requests
- `GET /api/report-requests/[id]` - Get specific report request
- `PATCH /api/report-requests/[id]` - Update report request
- `DELETE /api/report-requests/[id]` - Delete report request

### Report Generation (Refactored)
- `POST /api/reports/generate` - Generate report from wallet (saves to DB + Cloudinary)
- `POST /api/reports/generate-from-exchange` - Generate from exchange API (saves to DB + Cloudinary)

### Report Download
- `GET /api/reports/download/[id]` - Download report from Cloudinary (redirects to Cloudinary URL)

## Frontend Flow

### Old Flow
1. Select data source → Store in Context
2. Input data → Store in Context
3. Configure report → Store in Context
4. Generate → Call API, store result in Context/IndexedDB
5. Download → Generate PDF/CSV on-the-fly

### New Flow
1. Select data source → Create ReportRequest in DB → Navigate with `reportRequestId`
2. Input data → Update ReportRequest with sourceData
3. Configure report → Update ReportRequest with reportType & fiscalYear
4. Generate → Call API with reportRequestId → API uploads to Cloudinary → Updates DB
5. Poll status → Frontend polls ReportRequest until status = 'completed'
6. Download → Redirect to Cloudinary URL

## Setup Instructions

### 1. Environment Variables

Create `.env` file with:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/autocryptotax?schema=public"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
CLOUDINARY_FOLDER="crypto-tax-reports"
```

### 2. Run Migrations

```bash
# Generate Prisma client
pnpm prisma generate

# Create database tables
pnpm prisma db push

# Or create a migration
pnpm prisma migrate dev --name init-report-requests
```

### 3. Cloudinary Setup

1. Sign up at https://cloudinary.com/
2. Get your Cloud Name, API Key, and API Secret from dashboard
3. Add them to `.env` file

## Files Modified

### New Files Created
- `src/lib/prisma.ts` - Prisma client singleton
- `src/lib/cloudinary.ts` - Cloudinary upload utilities
- `src/features/reports/services/report-request.service.ts` - API client for report requests
- `src/features/reports/hooks/use-report-request.hook.ts` - React hook for report requests
- `src/app/api/report-requests/route.ts` - CRUD endpoints
- `src/app/api/report-requests/[id]/route.ts` - Single report request endpoints
- `src/app/api/reports/download/[id]/route.ts` - Download endpoint
- `prisma/schema.prisma` - Database schema

### Files Modified
- `src/app/api/reports/generate.ts` - Now saves to DB and uploads to Cloudinary
- `src/app/api/reports/generate-from-exchange/route.ts` - Now saves to DB and uploads to Cloudinary
- `src/features/reports/containers/data-source-selection.container.tsx` - Creates report request
- `src/features/reports/containers/data-input.container.tsx` - Updates report request
- `src/features/reports/containers/report-config.container.tsx` - Updates report request
- `src/app/reports/data-input/page.tsx` - Passes reportRequestId param
- `src/app/reports/configure/page.tsx` - Passes reportRequestId param

### Files to be Refactored
- `src/features/reports/containers/report-generation.container.tsx` - Needs to poll database
- `src/features/reports/containers/report-complete.container.tsx` - Needs to download from Cloudinary
- `src/app/reports/generate/page.tsx` - Needs to pass reportRequestId
- `src/app/reports/complete/page.tsx` - Needs to use reportRequestId

### Files to be Removed (After Migration)
- `src/features/reports/context/report-data.context.tsx` - No longer needed
- `src/features/reports/utils/report-data-storage.ts` - No longer needed
- `src/lib/cache-manager.ts` - No longer needed

## Migration Checklist

- [x] Install dependencies (Prisma, Cloudinary)
- [x] Create Prisma schema
- [x] Create Prisma client utility
- [x] Create Cloudinary utility
- [x] Create report request CRUD APIs
- [x] Refactor generation APIs to use DB + Cloudinary
- [x] Create download API
- [x] Create frontend service layer
- [x] Create React hook for report requests
- [x] Refactor data source selection page
- [x] Refactor data input page
- [x] Refactor configuration page
- [ ] Refactor generation page (polling)
- [ ] Refactor complete page (Cloudinary download)
- [ ] Remove old Context provider
- [ ] Remove localStorage utilities
- [ ] Remove IndexedDB cache manager
- [ ] Update all imports
- [ ] Test end-to-end flow
- [ ] Clean up old code

## Testing

1. Start with fresh database
2. Go through full flow: Select → Input → Configure → Generate → Download
3. Verify report is saved in database
4. Verify file is uploaded to Cloudinary
5. Verify download works from Cloudinary
6. Test error scenarios

## Benefits

1. **No data loss**: Reports persisted in database and cloud storage
2. **Better UX**: Users can close tab and come back later
3. **Scalability**: Server-side generation can handle heavy workloads
4. **History**: All reports accessible from dashboard
5. **Security**: Sensitive data not stored in client-side storage
6. **Reliability**: Cloudinary provides CDN and reliable storage

## Next Steps

To complete the migration:

1. Finish refactoring generation and complete containers (see "Files to be Refactored")
2. Test the full flow end-to-end
3. Remove old code (see "Files to be Removed")
4. Deploy database migrations to production
5. Configure Cloudinary for production

