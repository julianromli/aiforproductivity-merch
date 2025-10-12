# Vercel Blob Storage Setup Guide

## Overview

Vercel Blob storage is required for the logo upload feature in the Admin Customize Panel. Without it configured, admins can still use external URLs for logos, but cannot upload files directly.

## When is Vercel Blob Required?

- ✅ **Required**: If you want to use "Upload File" mode for logo
- ❌ **Not Required**: If you only use "Use URL" mode with external image URLs

## Quick Setup (Production - Vercel)

### Step 1: Create Blob Store

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`afpmerchtest` or your project name)
3. Click **Storage** in the sidebar
4. Click **Create Database** → **Blob**
5. Name it (e.g., `afpmerch-storage`)
6. Click **Create**

### Step 2: Connect to Project

Vercel automatically:
- Creates `BLOB_READ_WRITE_TOKEN` environment variable
- Connects the Blob store to your project
- Makes it available to all deployments

**That's it!** ✅ No manual configuration needed.

### Step 3: Verify Setup

1. Go to your project **Settings** → **Environment Variables**
2. Check that `BLOB_READ_WRITE_TOKEN` exists
3. Redeploy your project (or wait for next automatic deployment)
4. Try uploading a logo at `/admin/customize`

---

## Local Development Setup (Optional)

### Option A: Use Production Blob (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project → **Storage** → Your Blob store
3. Click **Connect** → **Environment Variables**
4. Copy the `BLOB_READ_WRITE_TOKEN` value
5. Add to your local `.env.local`:
   ```
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
   ```

### Option B: Create Separate Local Blob

1. Go to [Vercel Storage](https://vercel.com/dashboard/stores)
2. Create a new Blob store for local dev
3. Get the token and add to `.env.local`

### Option C: Use URL Mode Only

Don't need local uploads? Just use "Use URL" mode in the customize panel.

---

## Troubleshooting

### Error: "Vercel Blob Not Configured"

**Symptom**: Logo upload fails with 503 error

**Cause**: `BLOB_READ_WRITE_TOKEN` not set in environment variables

**Solution**:
1. **For Production**: Follow "Quick Setup" above
2. **For Local Dev**: Add token to `.env.local`
3. **Alternative**: Use "Use URL" mode instead

### Error: "Failed to upload logo"

**Possible Causes**:
1. **Token expired**: Regenerate token in Vercel Dashboard
2. **Network issue**: Check internet connection
3. **File too large**: Max 2MB for logos
4. **Invalid file type**: Only JPEG, PNG, WebP, GIF, SVG allowed

**Solution**:
1. Check browser console for detailed error
2. Verify file size and type
3. Try using "Use URL" mode as alternative

### Blob Store Not Appearing

**Solution**:
1. Make sure you created Blob store (not KV, Postgres, etc.)
2. Check it's connected to the right project
3. Redeploy your project after creating store

---

## How It Works

### Upload Flow

```
User selects file
    ↓
POST /api/admin/upload/logo
    ↓
Check BLOB_READ_WRITE_TOKEN exists
    ↓
Upload to Vercel Blob
    ↓
Return public URL
    ↓
Save URL to site_settings database
```

### File Storage

- **Location**: Vercel Blob (CDN-backed)
- **Access**: Public (anyone with URL can view)
- **Path**: `logos/logo-{timestamp}.{ext}`
- **CDN**: Automatic via Vercel Edge Network
- **Max Size**: 2MB per logo

### Cost

**Vercel Blob Pricing** (as of 2025):
- **Free Plan**: 500MB storage, 1GB bandwidth/month
- **Pro Plan**: 100GB storage, 1TB bandwidth/month
- **Enterprise**: Custom limits

**For logo uploads**: Free plan is more than enough!
- Average logo: 50-200KB
- 500MB = ~2,500 logos
- Logos rarely change, so bandwidth is minimal

---

## Alternative: Use External URLs

Don't want to use Vercel Blob? No problem!

### Upload to External Service

1. Upload logo to:
   - [Imgur](https://imgur.com/) - Free image hosting
   - [Cloudinary](https://cloudinary.com/) - Free tier available
   - Your own CDN/server
   - Google Drive (public link)
   - GitHub (via raw.githubusercontent.com)

2. Get the direct image URL

3. In Admin Customize Panel:
   - Click "Use URL" mode
   - Paste the image URL
   - Save

**Pros**:
- No Vercel Blob needed
- Use existing image hosting
- More control over storage

**Cons**:
- Manual upload process
- Must ensure URL is publicly accessible
- Need to manage images separately

---

## Best Practices

### File Naming
- ✅ Automatic timestamped names
- ✅ No random suffixes (cleaner URLs)
- ✅ Original extension preserved

### File Validation
- ✅ Type validation (only images + SVG)
- ✅ Size limit (2MB max)
- ✅ Server-side validation

### Security
- ✅ Authentication required for upload
- ✅ Public read access (for logo display)
- ✅ Token stored securely in env vars

### Performance
- ✅ CDN-backed delivery
- ✅ Automatic optimization
- ✅ Global edge network

---

## FAQ

### Q: Is Vercel Blob required to run the app?
**A**: No. You can use external URL mode for logos. Blob is only needed for direct file uploads.

### Q: Can I use different storage (S3, Cloudinary, etc.)?
**A**: Yes, but requires code changes. The current implementation uses Vercel Blob. You'd need to modify `/api/admin/upload/logo/route.ts`.

### Q: What happens to old logos when I upload new ones?
**A**: Old logos remain in storage. Vercel Blob doesn't have delete API yet. Since logos are small and rarely changed, this is not a concern.

### Q: Can I use the same Blob store for products and logos?
**A**: Yes! The app already does this. Logos go to `logos/` folder, products to `products/` folder in the same Blob store.

### Q: Does it work with Vercel's free plan?
**A**: Yes! Free plan includes Blob storage (500MB). Perfect for small stores.

---

## Summary

**For Production (Easiest)**:
1. Create Blob store in Vercel Dashboard
2. It auto-configures - nothing else needed!

**For Local Dev**:
1. Copy token from Vercel Dashboard
2. Add to `.env.local`
3. Or just use "Use URL" mode

**Don't Want Blob?**:
- Use "Use URL" mode
- Upload to external service
- Paste URL in admin panel

**That's it!** Simple and flexible. 🎉

---

**Need Help?**
- Check Vercel Docs: https://vercel.com/docs/storage/vercel-blob
- Contact support if Blob store creation fails
- Use URL mode as fallback

**Last Updated**: 2025-01-31
