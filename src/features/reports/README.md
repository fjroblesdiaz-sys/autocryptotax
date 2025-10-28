# Reports Feature

This feature handles the generation of tax reports for cryptocurrency transactions according to Spanish tax authorities' requirements.

## Architecture

The reports feature follows a **multi-page architecture** where each step of the report generation process is a separate page/route. This provides better UX, allows users to navigate back and forth, and maintains clean separation of concerns.

### Page Structure

```
/reports                    → Data source selection (landing page)
/reports/data-input         → Data collection (receives source via query param)
/reports/configure          → Report configuration (type and fiscal year)
/reports/generate           → Report generation with progress
/reports/complete           → Completion and download (receives report ID)
```

### Data Flow

Data is passed between pages using:
1. **URL parameters** - For identifiers and simple values (e.g., `?source=wallet`, `?id=report-123`)
2. **Session Storage** - For complex data that needs to persist across pages (using `reportDataStorage` utility)

### Folder Structure

```
src/features/reports/
├── components/              # Reusable UI components
│   ├── data-source-selection.component.tsx
│   ├── wallet-data.component.tsx
│   ├── csv-upload.component.tsx
│   ├── api-key-config.component.tsx
│   ├── oauth-authorization.component.tsx
│   ├── manual-entry.component.tsx
│   ├── report-generation-wizard.component.tsx
│   └── report-complete.component.tsx
├── containers/              # Business logic and state management
│   ├── data-source-selection.container.tsx
│   ├── data-input.container.tsx
│   ├── report-config.container.tsx
│   ├── report-generation.container.tsx
│   ├── report-complete.container.tsx
│   └── reports.container.tsx (deprecated - legacy single-page version)
├── types/                   # TypeScript type definitions
│   └── reports.types.ts
├── utils/                   # Utility functions
│   └── report-data-storage.ts
└── hooks/                   # Custom React hooks
    └── use-report-generation.hook.ts (deprecated - used by legacy container)
```

### Architecture Rules

Following the project's basic architecture principles:

1. **Pages** (`src/app/reports/**`) - Minimal, only handle routing and URL parameters
   - Should be as simple as possible
   - Only import and render containers
   - Pass URL parameters as props to containers

2. **Containers** (`src/features/reports/containers/**`) - Business logic layer
   - Contain all state management
   - Handle navigation logic
   - Orchestrate component composition
   - Marked with `'use client'` directive when needed

3. **Components** (`src/features/reports/components/**`) - Pure UI components
   - Presentational only
   - Receive data via props
   - No direct routing logic
   - Reusable across different contexts

### Data Source Types

The system supports multiple data sources for importing transactions:

- **Wallet** - Direct blockchain wallet connection
- **CSV** - Manual CSV file upload
- **API Key** - Exchange API integration
- **OAuth** - OAuth-based exchange authorization
- **Manual** - Manual transaction entry

### Report Types

Generates reports for Spanish tax models:

- **Model 720** - Declaration of assets abroad
- **Model 100** - Personal income tax
- **Model 714** - Wealth tax

### Session Storage

The `reportDataStorage` utility (`utils/report-data-storage.ts`) manages data persistence across pages:

```typescript
// Save data
reportDataStorage.save({ dataSource: 'wallet' });

// Get all data
const data = reportDataStorage.get();

// Get specific field
const source = reportDataStorage.getField('dataSource');

// Clear all data
reportDataStorage.clear();
```

### Example: Adding a New Step

To add a new step in the report generation flow:

1. Create a new page in `src/app/reports/[your-step]/page.tsx`
2. Create a container in `src/features/reports/containers/your-step.container.tsx`
3. Update navigation in the relevant containers
4. Update the session storage interface if needed

```typescript
// src/app/reports/your-step/page.tsx
import { YourStepContainer } from '@/features/reports/containers/your-step.container';

export default function YourStepPage() {
  return <YourStepContainer />;
}

// src/features/reports/containers/your-step.container.tsx
'use client';

export const YourStepContainer = () => {
  // Your business logic here
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Your UI here */}
    </div>
  );
};
```

## Development

### Adding New Data Sources

1. Add the type to `DataSourceType` in `types/reports.types.ts`
2. Create a new component in `components/`
3. Update `DataInputContainer` to handle the new source
4. Update `DataSourceSelection` component to include the new option

### Testing the Flow

1. Start at `/reports`
2. Select a data source
3. Fill in the required data
4. Configure the report
5. Watch the generation progress
6. Download the completed report

## Migration Notes

The previous single-page wizard implementation (`reports.container.tsx` and `use-report-generation.hook.ts`) is now deprecated but kept for reference. The new multi-page architecture provides:

- Better user experience with proper browser navigation
- Ability to bookmark and share specific steps
- Cleaner separation of concerns
- Better performance (code splitting per route)
- More maintainable codebase

