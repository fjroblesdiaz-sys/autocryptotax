# Real-Time Progress Implementation

## ✅ What We've Implemented

### 1. **Improved Report Generation Container**
   - **File**: `src/features/reports/containers/report-generation-improved.container.tsx`
   - **Features**:
     - Uses the better structure from `report-generation.container.tsx`
     - Database-backed report requests (server-side state)
     - Real-time progress updates via Server-Sent Events (SSE)
     - Clean error handling and retry functionality
     - Automatic navigation to completion page

### 2. **Server-Sent Events (SSE) Endpoint**
   - **File**: `src/app/api/reports/progress/[id]/route.ts`
   - **Features**:
     - Real-time progress streaming to frontend
     - Polls database every second for status updates
     - Sends progress updates, completion, and error events
     - Automatic cleanup on client disconnect
     - Returns: `{ type, status, progress, message }`

### 3. **Updated Page**
   - **File**: `src/app/reports/generate/page.tsx`
   - Now uses `ReportGenerationImprovedContainer`

---

## 🔄 How It Works

```
User clicks "Generar Reporte"
    ↓
Frontend creates report request in database (status: 'draft')
    ↓
Navigate to /reports/generate?reportRequestId=xxx
    ↓
┌─────────────────────────────────────────────────────┐
│ ReportGenerationImprovedContainer starts            │
├─────────────────────────────────────────────────────┤
│ 1. Validates report request data                    │
│ 2. Calls POST /api/reports/generate-from-exchange   │
│    (or /api/reports/generate for wallet)            │
│ 3. Opens SSE connection to /api/reports/progress/id │
└─────────────────────────────────────────────────────┘
    ↓
API processes report (status: 'processing')
    ↓
SSE polls database every 1 second
    ├─> Sends progress updates to frontend
    ├─> Frontend updates UI (progress bar, messages)
    └─> When status = 'completed', closes stream
    ↓
Frontend navigates to /reports/complete
```

---

## 📊 Current Progress Tracking

### **Basic Progress (Implemented)**

The SSE endpoint currently provides basic progress based on status:

| Status | Progress % | Message |
|--------|-----------|---------|
| `draft` | 0% | Preparando... |
| `processing` | 50% | Generando informe... |
| `completed` | 100% | ¡Completado! |
| `error` | 0% | Error |

---

## 🚀 Next Steps: Enhanced Real-Time Progress

To implement **detailed real-time progress** showing each step, we need to:

### **Option 1: Add Progress Field to Database** (Recommended)

1. **Update Prisma Schema**:
```prisma
model ReportRequest {
  // ... existing fields
  progress Int? @default(0) // Progress percentage 0-100
  progressMessage String? // Current step message
}
```

2. **Update API Routes to Report Progress**:
```typescript
// In generate-from-exchange/route.ts

// Step 1: Fetch transactions
await prisma.reportRequest.update({
  where: { id: reportRequestId },
  data: { progress: 20, progressMessage: 'Obteniendo transacciones del exchange...' }
});

// Step 2: Process transactions
await prisma.reportRequest.update({
  where: { id: reportRequestId },
  data: { progress: 40, progressMessage: 'Procesando transacciones...' }
});

// Step 3: Calculate taxes
await prisma.reportRequest.update({
  where: { id: reportRequestId },
  data: { progress: 60, progressMessage: 'Calculando impuestos...' }
});

// Step 4: Generate report
await prisma.reportRequest.update({
  where: { id: reportRequestId },
  data: { progress: 80, progressMessage: 'Generando PDF...' }
});

// Step 5: Upload to Cloudinary
await prisma.reportRequest.update({
  where: { id: reportRequestId },
  data: { progress: 90, progressMessage: 'Subiendo archivo...' }
});

// Complete
await prisma.reportRequest.update({
  where: { id: reportRequestId },
  data: { 
    status: 'completed',
    progress: 100, 
    progressMessage: '¡Completado!' 
  }
});
```

3. **Update SSE Endpoint**:
```typescript
// In progress/[id]/route.ts
const reportRequest = await prisma.reportRequest.findUnique({
  where: { id },
  select: {
    // ... existing fields
    progress: true,
    progressMessage: true,
  },
});

const progressData = {
  type: 'progress',
  status: reportRequest.status,
  progress: reportRequest.progress || getProgressPercentage(reportRequest.status),
  message: reportRequest.progressMessage || getProgressMessage(reportRequest.status),
};
```

### **Option 2: Use Redis/Pub-Sub** (For High Scale)

For larger scale applications with many concurrent report generations:

1. Use Redis to store real-time progress
2. Publish progress updates to Redis channel
3. SSE endpoint subscribes to Redis channel
4. More scalable but adds infrastructure complexity

---

## 🎯 Detailed Progress Steps

Here's a breakdown of the generation process with suggested progress percentages:

### **For Exchange API Generation** (`generate-from-exchange/route.ts`)

| Step | Progress % | Message | Code Location |
|------|-----------|---------|---------------|
| Start | 10% | Iniciando... | Container start |
| Fetch Transactions | 25% | Obteniendo transacciones del exchange... | After `fetchTransactions()` |
| Process Transactions | 45% | Procesando transacciones... | After `convertExchangeTransactions()` |
| Calculate Taxes | 65% | Calculando impuestos con método FIFO... | After `calculateTaxFIFO()` |
| Generate Report | 80% | Generando documento PDF... | After `generateModel100PDF()` |
| Upload to Cloudinary | 90% | Subiendo archivo a Cloudinary... | After `uploadReportToCloudinary()` |
| Save to Database | 95% | Guardando en base de datos... | After final Prisma update |
| Complete | 100% | ¡Completado! | Status = 'completed' |

### **For Wallet Generation** (`generate/route.ts`)

| Step | Progress % | Message | Code Location |
|------|-----------|---------|---------------|
| Start | 10% | Iniciando... | Container start |
| Fetch Blockchain Data | 25% | Obteniendo transacciones de la blockchain... | After `fetchWalletTransactions()` |
| Process Transactions | 45% | Procesando transacciones... | After `processBlockchainTransactions()` |
| Calculate Taxes | 65% | Calculando impuestos con método FIFO... | After `calculateTaxFIFO()` |
| Generate Report | 80% | Generando documento PDF... | After `generateModel100PDF()` |
| Upload to Cloudinary | 90% | Subiendo archivo a Cloudinary... | After `uploadReportToCloudinary()` |
| Save to Database | 95% | Guardando en base de datos... | After final Prisma update |
| Complete | 100% | ¡Completado! | Status = 'completed' |

---

## 📝 Implementation Checklist

- [x] Create SSE endpoint for progress streaming
- [x] Create improved report generation container
- [x] Integrate SSE with container
- [x] Update page to use improved container
- [ ] Add `progress` and `progressMessage` fields to Prisma schema
- [ ] Run migration: `pnpm prisma migrate dev`
- [ ] Update generate-from-exchange API to report progress
- [ ] Update generate API to report progress
- [ ] Update SSE endpoint to read progress from database
- [ ] Test with real report generation

---

## 🧪 Testing

### **Test Basic Progress (Current)**
1. Navigate to `/reports`
2. Select "API Key" as data source
3. Enter exchange API credentials
4. Configure report (Model 100, 2025)
5. Click "Generar Reporte"
6. **Observe**: Progress bar shows 50% during processing
7. **Observe**: Automatic navigation to complete page

### **Test Enhanced Progress (After Implementation)**
1. Follow steps above
2. **Observe**: Progress bar updates through each step (25%, 45%, 65%, etc.)
3. **Observe**: Status messages change ("Obteniendo transacciones...", "Calculando impuestos...", etc.)
4. **Observe**: Real-time updates every second

---

## 🎨 UI Features

### **Current Progress Display**

```typescript
<Progress value={progress} className="w-full" />

<div className="flex items-center gap-2">
  {progress < 100 ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{progressMessage}</span>
    </>
  ) : (
    <>
      <CheckCircle2 className="h-4 w-4 text-green-500" />
      <span>¡Completado!</span>
    </>
  )}
</div>
```

The `ReportGenerationWizard` component already supports animated progress with step-by-step indicators!

---

## 🔧 Configuration

### **SSE Polling Interval**
Currently set to 1 second in `progress/[id]/route.ts`:

```typescript
const pollInterval = setInterval(async () => {
  // Poll database
}, 1000); // 1 second
```

You can adjust this based on:
- Lower values (500ms) = More responsive but higher DB load
- Higher values (2000ms) = Less responsive but lower DB load

---

## 🎯 Benefits

1. **Real-Time Feedback**: Users see exactly what's happening
2. **Better UX**: Reduces perceived wait time
3. **Error Transparency**: Users know immediately if something fails
4. **Progress Persistence**: Refreshing page won't lose progress
5. **Scalable**: SSE handles multiple concurrent generations
6. **Database-Backed**: Progress survives server restarts

---

## 📚 Additional Resources

- [MDN: Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [Next.js App Router Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [Prisma Transactions](https://www.prisma.io/docs/concepts/components/prisma-client/transactions)

