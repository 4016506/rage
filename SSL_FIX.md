# Fixing "Not Secure" Warning on Cloudflare Pages

If your site shows "Not Secure" despite using `https://`, this is typically a Cloudflare SSL/TLS configuration issue.

## Quick Fix Steps

### 1. Check SSL/TLS Encryption Mode

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your domain (`4016506.com`)
3. Navigate to **SSL/TLS** in the sidebar
4. Check the **Encryption mode** setting
5. **Set it to "Full" or "Full (strict)"** (NOT "Flexible")

**Why?**
- **Flexible**: Encrypts traffic between visitor and Cloudflare, but not between Cloudflare and your origin (Cloudflare Pages). This causes the "Not Secure" warning.
- **Full**: Encrypts end-to-end (recommended for Cloudflare Pages)
- **Full (strict)**: Same as Full, but also validates the certificate (best for custom origins)

Since you're using Cloudflare Pages, **"Full" is recommended** and will work perfectly.

### 2. Wait for Certificate Propagation

After changing the encryption mode:
- It may take **5-15 minutes** for the change to take effect
- Cloudflare automatically generates SSL certificates for your domain
- Try clearing your browser cache or using incognito mode

### 3. Verify Custom Domain Setup

Make sure your custom domain is properly configured in Cloudflare Pages:

1. Go to Cloudflare Dashboard → **Pages**
2. Select your `rage-meter` project
3. Go to **Custom domains**
4. Verify `rage.4016506.com` is listed and shows ✅ **Active**

### 4. Check DNS Settings

Ensure your DNS is properly configured:

1. In Cloudflare Dashboard, go to **DNS** → **Records**
2. You should have a CNAME record:
   - **Name**: `rage` (or `rage.4016506.com`)
   - **Target**: Your Cloudflare Pages URL (e.g., `rage-meter.pages.dev`)
   - **Proxy status**: 🟠 Proxied (orange cloud)

**Important**: The orange cloud (Proxied) must be enabled for SSL to work.

## Troubleshooting

### Still seeing "Not Secure"?

1. **Hard refresh your browser**:
   - Mac: `Cmd + Shift + R`
   - Windows/Linux: `Ctrl + Shift + R`

2. **Clear browser cache** or try incognito/private mode

3. **Check browser console** for mixed content warnings:
   - Open Developer Tools (F12)
   - Go to Console tab
   - Look for security warnings

4. **Verify in Cloudflare**:
   - SSL/TLS → **Edge Certificates**
   - Ensure "Always Use HTTPS" is enabled
   - Check that certificates are issued (may take a few minutes)

### Certificate Not Issuing?

If Cloudflare isn't issuing certificates:

1. Go to **SSL/TLS** → **Edge Certificates**
2. Scroll to **Certificate Authority Authorization (CAA)**
3. Ensure there are no CAA records blocking Cloudflare

### Testing SSL

You can test your SSL configuration using:
- [SSL Labs SSL Test](https://www.ssllabs.com/ssltest/)
- Enter your domain: `rage.4016506.com`

## Expected Result

After fixing the encryption mode, you should see:
- ✅ Green lock icon in the address bar
- ✅ "Secure" or no warning (depending on browser)
- ✅ Valid HTTPS connection

## Summary

**Most common fix**: Change SSL/TLS encryption mode from "Flexible" to "Full" in Cloudflare Dashboard.

This usually resolves the "Not Secure" warning within 5-15 minutes.

