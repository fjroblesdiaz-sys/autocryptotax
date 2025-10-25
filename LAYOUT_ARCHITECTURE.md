# Layout Architecture

## Overview

The application now uses a centralized layout structure to prevent unnecessary re-renders of the navbar and footer when navigating between pages.

## Structure

```
src/
├── app/
│   ├── layout.tsx                    # Root layout (wraps all pages with AppLayout)
│   ├── page.tsx                      # Home page
│   ├── dashboard/
│   │   └── page.tsx                  # Dashboard page
│   ├── reports/
│   │   └── page.tsx                  # Reports page
│   ├── staking/
│   │   └── page.tsx                  # Staking page
│   └── airdrop/
│       └── page.tsx                  # Airdrop page
│
├── components/
│   └── layouts/
│       └── app-layout.tsx            # Main app layout (Navbar + Content + Footer)
│
└── features/
    ├── home/
    │   ├── components/
    │   │   ├── home-navbar.component.tsx    # Navbar component
    │   │   └── home-footer.component.tsx    # Footer component
    │   └── containers/
    │       └── home.container.tsx            # Home page content only
    ├── dashboard/
    │   └── containers/
    │       └── dashboard.container.tsx       # Dashboard content only
    ├── reports/
    │   └── containers/
    │       └── reports.container.tsx         # Reports content only
    ├── staking/
    │   └── containers/
    │       └── staking.container.tsx         # Staking content only
    └── airdrop/
        └── containers/
            └── airdrop.container.tsx         # Airdrop content only
```

## How It Works

### Root Layout (`src/app/layout.tsx`)

The root layout wraps all pages with the `AppLayout` component:

```tsx
<Providers>
  <AppLayout>
    {children}
  </AppLayout>
</Providers>
```

### AppLayout Component (`src/components/layouts/app-layout.tsx`)

The AppLayout component provides the consistent structure for all pages:

```tsx
<div className="flex min-h-screen flex-col">
  <HomeNavbar />           {/* Persistent navbar */}
  <main className="flex-1">
    {children}             {/* Page content */}
  </main>
  <HomeFooter />           {/* Persistent footer */}
</div>
```

### Page Containers

All page containers now only render their specific content without navbar/footer:

- ✅ **Before**: Each container included `<HomeNavbar />` and `<HomeFooter />`
- ✅ **After**: Containers only render page-specific content

## Benefits

1. **No Re-renders**: Navbar and footer persist across navigation, preventing unnecessary re-renders
2. **Better Performance**: Faster page transitions as only content changes
3. **Consistent State**: Navbar state (wallet connection, etc.) persists across pages
4. **Cleaner Code**: Containers focus only on their specific content
5. **DRY Principle**: Layout code is defined once, not repeated in every container

## Example: Before vs After

### Before (❌ Re-renders on every navigation)

```tsx
// dashboard.container.tsx
export const DashboardContainer = () => {
  return (
    <>
      <HomeNavbar />        {/* Re-renders on navigation */}
      <div>Dashboard content</div>
      <HomeFooter />        {/* Re-renders on navigation */}
    </>
  );
};
```

### After (✅ No re-renders)

```tsx
// dashboard.container.tsx
export const DashboardContainer = () => {
  return (
    <div>Dashboard content</div>  {/* Only content re-renders */}
  );
};
```

## Adding New Pages

When creating new pages, follow this pattern:

1. Create the page route in `src/app/[page-name]/page.tsx`
2. Create the container in `src/features/[feature]/containers/[feature].container.tsx`
3. The container should **only** render page-specific content
4. The navbar and footer will automatically wrap your content via `AppLayout`

## Special Cases

### Pages Without Footer

If you need a page without the footer, you can modify `AppLayout` to accept a `showFooter` prop:

```tsx
<AppLayout showFooter={false}>
  {/* Your content */}
</AppLayout>
```

### Custom Layouts

For pages that need a completely different layout (e.g., auth pages), you can create a separate layout component and use Next.js route groups or layout files.

## Migration Checklist

- ✅ Created `AppLayout` component
- ✅ Updated root `layout.tsx` to use `AppLayout`
- ✅ Removed navbar/footer from `HomeContainer`
- ✅ Removed navbar/footer from `DashboardContainer`
- ✅ Removed navbar/footer from `ReportsContainer`
- ✅ Removed navbar/footer from `AirdropContainer`
- ✅ Removed navbar/footer from `StakingContainer`
- ✅ All pages now use centralized layout

## Testing

To verify the layout is working correctly:

1. Navigate between different pages (Home → Dashboard → Staking → Airdrop)
2. The navbar should **not** flicker or re-render
3. Wallet connection state should persist across pages
4. Page transitions should be smooth and fast

---

**Note**: This architecture follows Next.js 13+ App Router best practices for layouts and nested routing.
