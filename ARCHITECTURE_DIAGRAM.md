# AutoCryptoTax - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (Next.js + React)                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    ReportDataProvider (Context)                   │  │
│  │  - dataSource: 'api-key' | 'wallet' | ...                       │  │
│  │  - sourceData: { apiKey, apiSecret }                             │  │
│  │  - reportType: 'model-100'                                       │  │
│  │  - fiscalYear: 2025                                              │  │
│  │  - generatedReport: GeneratedReport                              │  │
│  │  - reportCSV: string                                             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                   ↓                                      │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                         UI FLOW (Wizard)                          │  │
│  │                                                                   │  │
│  │  Step 1: Data Source Selection (/reports/data-input)            │  │
│  │    └─ DataSourceSelectionContainer + Component                   │  │
│  │         ↓                                                         │  │
│  │  Step 2: API Configuration (/reports/configure)                  │  │
│  │    └─ ReportConfigContainer + APIKeyConfig                       │  │
│  │         ↓                                                         │  │
│  │  Step 3: Report Type & Year (Wizard Component)                   │  │
│  │    └─ ReportGenerationWizard                                     │  │
│  │         ↓                                                         │  │
│  │  Step 4: Generation (/reports/generate)                          │  │
│  │    └─ ReportGenerationContainer → Calls Backend API              │  │
│  │         ↓                                                         │  │
│  │  Step 5: Complete (/reports/complete)                            │  │
│  │    └─ ReportCompleteContainer + Component → Downloads            │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
                                   ↓ HTTP POST
┌─────────────────────────────────────────────────────────────────────────┐
│                        BACKEND (Next.js API Routes)                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  POST /api/reports/generate-from-exchange                               │
│  ├─ 1. Validate request (Zod)                                          │
│  ├─ 2. Extract API credentials                                          │
│  ├─ 3. Call ExchangeAPIService.fetchAllTransactions()                  │
│  │     ↓                                                                │
│  │  ┌──────────────────────────────────────────────────────────────┐  │
│  │  │              ExchangeAPIService (Strategy Pattern)            │  │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │  │
│  │  │  │           BinanceStrategy                                │ │  │
│  │  │  │  - fetchAccountInfo()      → /api/v3/account            │ │  │
│  │  │  │  - fetchAllSymbols()       → /api/v3/exchangeInfo       │ │  │
│  │  │  │  - fetchDeposits()         → /sapi/v1/capital/deposit   │ │  │
│  │  │  │  - fetchWithdrawals()      → /sapi/v1/capital/withdraw  │ │  │
│  │  │  │  - fetchTradesForSymbol()  → /api/v3/myTrades           │ │  │
│  │  │  │  - makeRequest()           → HMAC SHA256 signature       │ │  │
│  │  │  └─────────────────────────────────────────────────────────┘ │  │
│  │  │                                                               │  │
│  │  │  Returns: ExchangeTransaction[]                              │  │
│  │  └──────────────────────────────────────────────────────────────┘  │
│  │                                                                      │
│  ├─ 4. convertExchangeTransactions() → ProcessedTransaction[]          │
│  │     ├─ Identify assets with missing prices                          │
│  │     ├─ Fetch prices from PriceAPIService (CoinGecko)               │
│  │     └─ Apply prices to transactions and fees                        │
│  │                                                                      │
│  ├─ 5. Filter by fiscal year                                           │
│  │                                                                      │
│  ├─ 6. calculateTaxFIFO() → TaxCalculationResult                       │
│  │     ┌──────────────────────────────────────────────────────────┐   │
│  │     │          Tax Calculation Service (FIFO)                   │   │
│  │     │  - Create FIFO queue per asset                            │   │
│  │     │  - Process buys → queue.add()                             │   │
│  │     │  - Process sells → queue.remove() + calculate gains       │   │
│  │     │  - Track holdings and capital gains                       │   │
│  │     │  Returns: {                                               │   │
│  │     │    transactions: ProcessedTransaction[],                  │   │
│  │     │    holdings: AssetHolding[],                              │   │
│  │     │    capitalGains: CapitalGain[],                           │   │
│  │     │    summary: { totalGains, totalLosses, netResult }        │   │
│  │     │  }                                                         │   │
│  │     └──────────────────────────────────────────────────────────┘   │
│  │                                                                      │
│  ├─ 7. Build SpanishTaxReport object                                   │
│  │                                                                      │
│  ├─ 8. Generate outputs                                                 │
│  │     ├─ PDF: generateModel100PDF(report, taxCalculation)             │
│  │     │   └─ Uses pdf-lib to create 2-page Modelo 100 PDF            │
│  │     │                                                                │
│  │     └─ CSV: formatModel100CSV(report, taxCalculation)               │
│  │         ├─ Section 1: TODAS LAS TRANSACCIONES (ALL 44 txs)         │
│  │         ├─ Section 2: GANANCIAS Y PÉRDIDAS (capital gains)         │
│  │         ├─ Section 3: RESUMEN FISCAL (summary)                      │
│  │         └─ Section 4: POSICIONES ACTUALES (holdings)                │
│  │                                                                      │
│  └─ 9. Return JSON response                                             │
│       { reportId, report, csv, summary }                                │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
                                   ↓ Response
┌─────────────────────────────────────────────────────────────────────────┐
│                          CACHE LAYER (Client-Side)                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    localStorage (Small Data)                      │  │
│  │  Key: "cache_version" → "3.0"                                    │  │
│  │  Key: "report_xxx" → {                                           │  │
│  │    version: "3.0",                                                │  │
│  │    timestamp: 1698765432000,                                      │  │
│  │    report: { id, type, year, summary, ... },                     │  │
│  │    csv: "TODAS LAS TRANSACCIONES\n...",                          │  │
│  │    dataSource: "api-key",                                         │  │
│  │    reportType: "model-100",                                       │  │
│  │    fiscalYear: 2025                                               │  │
│  │  }                                                                │  │
│  │                                                                   │  │
│  │  Max: 3 reports | Max age: 24h | Auto-cleanup on version bump   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              IndexedDB: AutoCryptoTaxCache (Large Data)          │  │
│  │  Store: "pdfs"                                                    │  │
│  │  Entry: {                                                         │  │
│  │    id: "report-xxx",                                              │  │
│  │    blob: Blob(12345 bytes),  ← PDF binary data                   │  │
│  │    timestamp: 1698765432000,                                      │  │
│  │    version: "3.0"                                                 │  │
│  │  }                                                                │  │
│  │                                                                   │  │
│  │  Validated on read: version + age check                          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                       Cache Manager                               │  │
│  │  - initializeCacheManager()    → On app load                     │  │
│  │  - saveReportToCache()         → After generation                │  │
│  │  - getReportFromCache()        → On complete page                │  │
│  │  - savePDFToCache()            → After first download            │  │
│  │  - getPDFFromCache()           → Before generating new PDF       │  │
│  │  - cleanOldReports()           → Auto cleanup                    │  │
│  │  - clearAllCaches()            → Manual reset (window.xxx)       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
                                   ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL APIS                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    Binance API                                    │  │
│  │  https://api.binance.com                                          │  │
│  │  - Authentication: HMAC SHA256                                    │  │
│  │  - Rate limits: Weight-based                                      │  │
│  │  - Endpoints:                                                     │  │
│  │    • GET /api/v3/account          (balances)                     │  │
│  │    • GET /api/v3/exchangeInfo     (valid symbols)                │  │
│  │    • GET /sapi/v1/capital/deposit/hisrec  (deposits)             │  │
│  │    • GET /sapi/v1/capital/withdraw/history (withdrawals)         │  │
│  │    • GET /api/v3/myTrades         (trade history)                │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    CoinGecko API                                  │  │
│  │  https://api.coingecko.com/api/v3                                 │  │
│  │  - Free tier (no auth)                                            │  │
│  │  - Rate limits: 10-50 calls/min                                   │  │
│  │  - Cache: 5 min (current), 24h (historical)                      │  │
│  │  - Endpoints:                                                     │  │
│  │    • GET /simple/price?ids=...&vs_currencies=eur                 │  │
│  │    • GET /coins/{id}/history?date=DD-MM-YYYY                     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
USER INPUT                 CONTEXT STATE              CACHE                BACKEND
    │                          │                       │                      │
    │  Select "API Key"        │                       │                      │
    ├─────────────────────────→│                       │                      │
    │                          │ dataSource = 'api-key'│                      │
    │                          │                       │                      │
    │  Enter credentials       │                       │                      │
    ├─────────────────────────→│                       │                      │
    │                          │ sourceData = { ... }  │                      │
    │                          │                       │                      │
    │  Select Modelo 100       │                       │                      │
    ├─────────────────────────→│                       │                      │
    │                          │ reportType = 'model-100'                     │
    │                          │ fiscalYear = 2025     │                      │
    │                          │                       │                      │
    │  Click "Generate"        │                       │                      │
    │                          │                       │                      │
    │                          │ POST /api/reports/generate-from-exchange     │
    │                          │ ─────────────────────────────────────────────→│
    │                          │                       │                      │
    │                          │                       │  1. Fetch Binance   │
    │                          │                       │  2. Fetch CoinGecko │
    │                          │                       │  3. Calculate FIFO  │
    │                          │                       │  4. Generate PDF/CSV│
    │                          │                       │                      │
    │                          │ ←─────────────────────────────────────────────│
    │                          │  { reportId, report, csv, summary }          │
    │                          │                       │                      │
    │                          │ generatedReport = ... │                      │
    │                          │ reportCSV = '...'     │                      │
    │                          │                       │                      │
    │                          │ ──────────────────────→│                      │
    │                          │  saveReportToCache()  │                      │
    │                          │                       │ localStorage: report_xxx
    │                          │                       │                      │
    │  Navigate to /complete   │                       │                      │
    │                          │                       │                      │
    │  [Page loads]            │                       │                      │
    │                          │                       │                      │
    │  If context empty:       │                       │                      │
    │                          │ ←─────────────────────│                      │
    │                          │  getReportFromCache() │                      │
    │                          │                       │                      │
    │  Click "Download CSV"    │                       │                      │
    ├──────────────────────────┼───────────────────────→│                      │
    │                          │  Use reportCSV        │                      │
    │  ←─── CSV file ───────────────────────────────────│                      │
    │                          │                       │                      │
    │  Click "Download PDF"    │                       │                      │
    ├──────────────────────────┼───────────────────────→│                      │
    │                          │  getPDFFromCache()    │                      │
    │                          │                       │ IndexedDB: pdfs/xxx  │
    │                          │                       │                      │
    │  If cached:              │                       │                      │
    │  ←─── PDF blob ───────────────────────────────────│                      │
    │                          │                       │                      │
    │  If not cached:          │                       │                      │
    │                          │ POST /api/reports/download                   │
    │                          │ ─────────────────────────────────────────────→│
    │                          │ ←─────────────────────────────────────────────│
    │                          │  PDF buffer           │                      │
    │                          │ ──────────────────────→│                      │
    │                          │  savePDFToCache()     │ IndexedDB: pdfs/xxx  │
    │  ←─── PDF file ───────────────────────────────────│                      │
    │                          │                       │                      │
```

---

## Component Tree

```
App Layout
└─ ReportDataProvider
   └─ /reports
      ├─ /reports/data-input
      │  └─ DataSourceSelectionContainer
      │     └─ DataSourceSelection
      │        ├─ Card: Wallet
      │        ├─ Card: API Key ✓
      │        ├─ Card: CSV (disabled)
      │        ├─ Card: OAuth (disabled)
      │        └─ Card: Manual (disabled)
      │
      ├─ /reports/configure
      │  └─ ReportConfigContainer
      │     └─ APIKeyConfig
      │        ├─ Select: Platform (Binance)
      │        ├─ Input: API Key
      │        ├─ Input: API Secret
      │        └─ Button: Conectar API
      │
      ├─ /reports/generate
      │  └─ ReportGenerationContainer
      │     ├─ useEffect: Validation
      │     ├─ useEffect: startGeneration()
      │     └─ LoadingScreen
      │        ├─ Spinner
      │        ├─ Progress text
      │        └─ Step indicators
      │
      └─ /reports/complete?reportId=xxx
         └─ ReportCompleteContainer
            ├─ useEffect: Load from context/cache
            ├─ handleDownloadCSV()
            └─ handleDownloadPDF()
               └─ ReportComplete
                  ├─ Success Header
                  ├─ Report Summary Card
                  │  ├─ Report info
                  │  ├─ Statistics
                  │  └─ Download Buttons
                  │     ├─ Button: Descargar PDF
                  │     └─ Button: Descargar CSV
                  ├─ What's Included Card
                  └─ Next Steps Card
```

---

## Service Dependencies

```
ReportGenerationContainer
    │
    ├─→ useReportData() (Context)
    │   ├─ dataSource
    │   ├─ sourceData
    │   ├─ reportType
    │   ├─ fiscalYear
    │   ├─ setGeneratedReport()
    │   └─ setReportCSV()
    │
    └─→ fetch('/api/reports/generate-from-exchange')
        │
        ├─→ exchangeAPIService.fetchAllTransactions()
        │   │
        │   └─→ BinanceStrategy
        │       ├─ fetchAccountInfo()
        │       ├─ fetchAllSymbols()
        │       ├─ fetchDeposits()
        │       ├─ fetchWithdrawals()
        │       └─ fetchTradesForSymbol()
        │           └─ makeRequest() (HMAC signature)
        │
        ├─→ priceAPIService.getPricesInEUR()
        │   └─ CoinGecko API
        │       └─ Cache (LRU, 5min TTL)
        │
        ├─→ calculateTaxFIFO()
        │   ├─ FIFOQueue per asset
        │   ├─ Process transactions
        │   └─ Calculate capital gains
        │
        ├─→ generateModel100PDF()
        │   └─ pdf-lib
        │       ├─ Create pages
        │       ├─ Draw tables
        │       └─ Return buffer
        │
        └─→ formatModel100CSV()
            ├─ Section 1: All transactions
            ├─ Section 2: Capital gains
            ├─ Section 3: Summary
            └─ Section 4: Holdings
```

---

## Error Flow

```
User Action
    │
    ├─ Validation Error (client-side)
    │  └─→ Show error message in form
    │      └─→ User corrects input
    │
    ├─ API Error (backend)
    │  │
    │  ├─ 400 Bad Request (Zod validation)
    │  │  └─→ Show "Invalid request" error
    │  │
    │  ├─ 401 Unauthorized (Binance API)
    │  │  └─→ Show "Invalid API key" error
    │  │
    │  ├─ 403 Forbidden (Binance API)
    │  │  └─→ Show "IP restriction" error
    │  │
    │  ├─ 429 Rate Limited (Binance API)
    │  │  └─→ Retry with exponential backoff
    │  │
    │  └─ 500 Internal Error
    │     └─→ Show "Server error" message
    │        └─→ Log to console for debugging
    │
    └─ Cache Error
       │
       ├─ Version mismatch
       │  └─→ Auto-delete old cache
       │     └─→ Force regeneration
       │
       ├─ Expired (>24h)
       │  └─→ Auto-delete expired report
       │     └─→ Load from context or regenerate
       │
       └─ Quota exceeded
          └─→ Delete oldest reports
             └─→ Keep only 3 most recent
```

---

## Performance Optimizations

### 1. **Parallel API Calls**
```typescript
// Fetch account info, deposits, withdrawals simultaneously
const [accountInfo, deposits, withdrawals] = await Promise.all([
  fetchAccountInfo(),
  fetchDeposits(),
  fetchWithdrawals(),
]);
```

### 2. **Batch Price Fetching**
```typescript
// Collect all assets needing prices
const assetsNeedingPrices = new Set<string>();
transactions.forEach(tx => {
  if (tx.price === 0) assetsNeedingPrices.add(tx.asset);
});

// Fetch all prices in one API call
const prices = await priceAPIService.getPricesInEUR(Array.from(assetsNeedingPrices));
```

### 3. **Smart Symbol Filtering**
```typescript
// Fetch all valid symbols once
const allValidSymbols = await fetchAllSymbols();

// Filter before making trade requests
const validSymbolsToCheck = symbolsToCheck.filter(s => allValidSymbols.includes(s));

// Only fetch trades for valid symbols
for (const symbol of validSymbolsToCheck) {
  const trades = await fetchTradesForSymbol(symbol);
}
```

### 4. **LRU Cache for Prices**
```typescript
// Cache current prices for 5 minutes
const currentPriceCache = new LRUCache({
  max: 100,
  ttl: 5 * 60 * 1000,
});

// Cache historical prices for 24 hours
const historicalPriceCache = new LRUCache({
  max: 500,
  ttl: 24 * 60 * 60 * 1000,
});
```

### 5. **IndexedDB for Large Files**
```typescript
// Don't store PDFs in localStorage (size limit + slow)
// Use IndexedDB instead (supports large blobs)
await savePDFToCache(reportId, pdfBlob);
```

---

## Security Considerations

### 1. **API Credentials**
- ✅ Never stored in cache (only in memory during session)
- ✅ Trimmed to remove accidental whitespace
- ✅ Sent via HTTPS to backend
- ✅ Backend never logs credentials
- ✅ User advised to use read-only API keys

### 2. **Cache**
- ✅ Only stores non-sensitive data (report metadata, CSV)
- ✅ Auto-expires after 24 hours
- ✅ Version-controlled (invalidated on updates)
- ✅ Cleared on logout/browser close (sessionStorage behavior via context)

### 3. **Backend**
- ✅ Zod validation on all inputs
- ✅ HMAC SHA256 signature for Binance API
- ✅ Rate limiting handling
- ✅ Error messages don't leak sensitive info

---

## Scalability Considerations

### Current Limitations
- Client-side cache (localStorage/IndexedDB)
- No user accounts / persistence
- PDF generation on server (CPU-intensive)
- CoinGecko free tier (limited rate)

### Future Improvements
- [ ] Server-side report storage (database)
- [ ] User authentication (NextAuth.js)
- [ ] Background job queue for PDF generation
- [ ] Redis cache for prices
- [ ] CDN for static assets
- [ ] Pagination for large transaction lists

---

**For implementation details, see:**
- `REPORT_GENERATION_WORKFLOW.md` (Full documentation)
- `WORKFLOW_SUMMARY.md` (Quick reference)

