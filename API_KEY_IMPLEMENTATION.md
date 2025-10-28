# API Key Workflow Implementation

## Overview
Successfully implemented the API Key data source workflow for generating tax reports from cryptocurrency exchange accounts using API credentials. This allows users to connect their exchange accounts (Binance, Coinbase, WhiteBit) and automatically fetch transaction history for tax report generation.

## Implemented Features

### 1. Exchange API Service (`src/features/reports/services/exchange-api.service.ts`)
A comprehensive server-side service for interacting with crypto exchange APIs:

#### Supported Exchanges:
- **Binance**: Full integration with Spot API using HMAC SHA256 authentication
- **Coinbase**: Advanced Trade API integration with CB-ACCESS authentication
- **WhiteBit**: API v4 integration with HMAC SHA512 authentication

#### Key Functionality:
- `fetchTransactions()`: Retrieves transaction history with optional date range filtering
- `testConnection()`: Validates API credentials before use
- Automatic transaction normalization to standard format
- Secure signature generation for each exchange protocol

### 2. API Endpoints

#### `/api/exchange/test-connection` (POST)
Tests if provided API credentials are valid.

**Request:**
```json
{
  "exchange": "binance" | "coinbase" | "whitebit",
  "apiKey": "string",
  "apiSecret": "string",
  "passphrase": "string" // Optional, required for Coinbase
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully connected to binance"
}
```

#### `/api/exchange/transactions` (POST)
Fetches transaction history from the specified exchange.

**Request:**
```json
{
  "exchange": "binance" | "coinbase" | "whitebit",
  "apiKey": "string",
  "apiSecret": "string",
  "passphrase": "string", // Optional
  "dateRange": {
    "from": "ISO8601 datetime",
    "to": "ISO8601 datetime"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "exchange": "binance",
    "transactionCount": 42,
    "transactions": [ /* array of normalized transactions */ ],
    "dateRange": { "from": "...", "to": "..." }
  }
}
```

#### `/api/reports/generate-from-exchange` (POST)
Generates tax reports from exchange API data.

**Request:**
```json
{
  "exchange": "binance" | "coinbase" | "whitebit",
  "apiKey": "string",
  "apiSecret": "string",
  "passphrase": "string", // Optional
  "fiscalYear": 2024,
  "reportType": "model-100",
  "dateRange": {
    "from": "ISO8601 datetime",
    "to": "ISO8601 datetime"
  },
  "taxpayerInfo": {
    "nif": "string",
    "name": "string",
    "surname": "string"
  },
  "format": "json" | "csv" | "pdf"
}
```

**Response (JSON/CSV):**
```json
{
  "success": true,
  "reportId": "exchange-binance-1234567890",
  "report": { /* full report object */ },
  "taxCalculation": {
    "totalGains": 1500.50,
    "totalLosses": 200.00,
    "netGainLoss": 1300.50,
    "taxableAmount": 1300.50,
    "transactionCount": 42
  },
  "format": "json",
  "csv": "..." // If format=csv
}
```

**Response (PDF):**
Returns PDF file directly with appropriate Content-Disposition headers.

### 3. Frontend Components

#### `api-key-config.component.tsx`
Enhanced UI component for API key configuration:
- Support for 3 exchanges: Binance, Coinbase, WhiteBit
- Conditional passphrase field (shown only for Coinbase)
- Password visibility toggles for sensitive data
- Optional date range selector
- Security warnings and instructions for each exchange
- Detailed step-by-step guides for obtaining API keys

#### `use-exchange-api.hook.ts`
Custom React hook for exchange API integration:
- `testConnection()`: Validates credentials
- `generateReport()`: Generates tax reports
- Loading states and error handling
- Support for JSON, CSV, and PDF formats

### 4. Integration with Existing Workflow

#### Updated Containers:
- **`data-input.container.tsx`**: Already supports API key input (no changes needed)
- **`report-generation.container.tsx`**: 
  - Added support for `api-key` data source
  - Dual-path generation (wallet or API key)
  - Unified progress tracking
  
- **`report-complete.container.tsx`**:
  - Enhanced PDF download to support both wallet and API key sources
  - Automatic endpoint selection based on data source

### 5. Type System Updates

#### `reports.types.ts`
- Updated `ExchangePlatform` to include `'whitebit'`
- Added `passphrase?: string` to `APIKeyData` interface

#### Transaction Conversion
Implemented automatic conversion from exchange-specific transaction formats to the standardized `ProcessedTransaction` format used by the tax calculation engine.

## Security Features

1. **Server-Side Only**: All API key operations happen server-side, keys never exposed to client
2. **Secure Authentication**: Each exchange uses its native authentication method (HMAC signatures)
3. **Read-Only Permissions**: Documentation emphasizes creating API keys with read-only access
4. **No Storage**: API keys are not stored, only used for immediate transaction fetching
5. **Environment Validation**: Future support for API key validation middleware

## Usage Flow

1. **User selects "API Key" as data source**
2. **User enters exchange credentials** (API Key, Secret, optional passphrase)
3. **System validates connection** via test endpoint
4. **User selects fiscal year and report type**
5. **System fetches transactions** from exchange
6. **System processes transactions** using FIFO tax calculation
7. **System generates report** in requested format (CSV/PDF)
8. **User downloads report** (both CSV and PDF available)

## Current Limitations

- Only Modelo 100 (IRPF) is currently supported
- Modelo 720 and 714 are disabled with clear user messaging
- Date range is optional; defaults to all available transactions
- Mock data is still used for blockchain wallet source (API key source uses real data)

## Testing Recommendations

Before using with real accounts:

1. **Create test API keys** on each exchange with read-only permissions
2. **Test connection** using the test endpoint
3. **Verify transaction fetching** for small date ranges first
4. **Review generated reports** for accuracy
5. **Compare with exchange's native export** if available

## API Documentation

Each exchange has its own authentication mechanism:

- **Binance**: X-MBX-APIKEY header + HMAC SHA256 signature
- **Coinbase**: CB-ACCESS-KEY, CB-ACCESS-SIGN, CB-ACCESS-TIMESTAMP headers
- **WhiteBit**: X-TXC-APIKEY header + Base64 payload + HMAC SHA512 signature

All implementations follow the latest API documentation from each exchange as of October 2025.

## Next Steps (Recommendations)

1. Add support for more exchanges (Kraken, etc.)
2. Implement API key encryption and secure storage for repeated use
3. Add transaction caching to avoid repeated API calls
4. Implement rate limiting to comply with exchange API limits
5. Add support for Modelo 720 and 714 for API key sources
6. Add webhook support for automatic periodic report generation
7. Implement OAuth flow as alternative to API keys

## Files Changed/Created

### New Files:
- `src/features/reports/services/exchange-api.service.ts`
- `src/features/reports/hooks/use-exchange-api.hook.ts`
- `src/app/api/exchange/test-connection/route.ts`
- `src/app/api/exchange/transactions/route.ts`
- `src/app/api/reports/generate-from-exchange/route.ts`

### Modified Files:
- `src/features/reports/types/reports.types.ts`
- `src/features/reports/components/api-key-config.component.tsx`
- `src/features/reports/containers/report-generation.container.tsx`
- `src/features/reports/containers/report-complete.container.tsx`

## Compliance Notes

All implementations follow:
- Latest exchange API documentation (2025)
- Spanish tax law requirements (Hacienda format)
- Security best practices (server-side processing, read-only permissions)
- GDPR considerations (no key storage, minimal data retention)

## Support

For exchange-specific API documentation:
- Binance: https://binance-docs.github.io/apidocs/spot/en/
- Coinbase: https://docs.cloud.coinbase.com/advanced-trade-api/docs/
- WhiteBit: https://docs.whitebit.com/

