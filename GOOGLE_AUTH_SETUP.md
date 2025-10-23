# Google Authentication Setup Guide

## The Problem: Redirect URLs

The issue you're experiencing is related to **redirect URL configuration**. When using Google OAuth with Supabase, you need to configure the redirect URLs correctly in both Google Cloud Console and your application.

## Solution: Proper Redirect URL Configuration

### 1. Google Cloud Console Setup

In your Google Cloud Console OAuth client, you need to add these **Authorized redirect URIs**:

```
https://fszodwdgyrrarqjvjkab.supabase.co/auth/v1/callback
http://localhost:3000
https://your-production-domain.com
```

**Important:** 
- The Supabase callback URL (`https://fszodwdgyrrarqjvjkab.supabase.co/auth/v1/callback`) is **mandatory**
- Add your local development URL (`http://localhost:3000`)
- Add your production domain URL

### 2. Update Your Production Domain

In `src/contexts/SupabaseAuthContext.jsx`, replace `'https://your-production-domain.com'` with your actual production domain:

```javascript
// For production, use your actual domain
return 'https://your-actual-domain.com'; // Replace with your actual domain
```

### 3. How Google OAuth Flow Works

1. **User clicks "Sign in with Google"**
2. **Redirects to Google** → User authenticates
3. **Google redirects to Supabase** → `https://fszodwdgyrrarqjvjkab.supabase.co/auth/v1/callback`
4. **Supabase processes the auth** → Creates session
5. **Supabase redirects to your app** → Your domain (localhost or production)

### 4. Environment-Specific Configuration

The code now automatically detects the environment:

- **Development**: `http://localhost:3000`
- **Production**: Your actual domain (you need to update this)

### 5. Supabase Dashboard Configuration

In your Supabase Dashboard:

1. Go to **Authentication** > **URL Configuration**
2. Set **Site URL** to your production domain
3. Add **Redirect URLs**:
   - `http://localhost:3000` (for development)
   - `https://your-production-domain.com` (for production)

## Common Issues & Solutions

### Issue: "Redirect URI mismatch"
**Solution**: Make sure all URLs in Google Cloud Console match exactly what you're using

### Issue: "Invalid client"
**Solution**: 
1. Check that Client ID and Secret in Supabase match Google Cloud Console
2. Ensure the OAuth client is not deleted or disabled

### Issue: "Access blocked"
**Solution**: 
1. Add your domain to Google Cloud Console authorized origins
2. Verify your domain in Google Search Console (for production)

## Testing

1. **Local Development**: Should redirect to `http://localhost:3000`
2. **Production**: Should redirect to your production domain

## Files Modified

- `src/contexts/SupabaseAuthContext.jsx` - Added environment-specific redirect logic

## Next Steps

1. **Update the production domain** in the code
2. **Add all URLs to Google Cloud Console**
3. **Configure Supabase redirect URLs**
4. **Test in both environments**

The key is that Google OAuth always goes through Supabase first (`https://fszodwdgyrrarqjvjkab.supabase.co/auth/v1/callback`), then Supabase redirects to your app.