# Cloudflare Pages Deployment Guide

This guide will walk you through deploying your Rage Meter app to Cloudflare Pages.

## Prerequisites

1. A Cloudflare account (free tier works fine)
2. Your repository pushed to GitHub, GitLab, or Bitbucket
3. Firebase configuration already set up (see `FIREBASE_SETUP.md`)

## Deployment Methods

You have two options: **GitHub Integration** (recommended) or **Direct Upload**.

---

## Method 1: GitHub Integration (Recommended)

This method automatically deploys your site whenever you push to your repository.

### Step 1: Push Your Code to GitHub

If you haven't already, push your repository to GitHub:

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Connect to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages** in the sidebar
3. Click **Create a project**
4. Click **Connect to Git**
5. Select your Git provider (GitHub, GitLab, or Bitbucket)
6. Authorize Cloudflare Pages to access your repositories
7. Select your `rage` repository

### Step 3: Configure Build Settings

Configure the following settings:

- **Project name**: `rage-meter` (or your preferred name)
- **Production branch**: `main` (or `master` if that's your default branch)
- **Framework preset**: `Vite` (Cloudflare will auto-detect this)
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (leave as default)

### Step 4: Environment Variables (Optional)

If you want to use environment variables for Firebase config (recommended for production), you can add them in the build settings:

1. In the build configuration, scroll to **Environment variables**
2. Add any variables you need (though your Firebase config is currently hardcoded)

**Note**: For now, your Firebase configuration is in `src/config/firebase.ts`. If you want to use environment variables, you'll need to modify the code to read from `import.meta.env`.

### Step 5: Deploy

1. Click **Save and Deploy**
2. Cloudflare will:
   - Install dependencies (`npm install`)
   - Run the build command (`npm run build`)
   - Deploy the `dist` folder

### Step 6: Custom Domain (Optional)

1. After deployment completes, click on your project
2. Go to **Custom domains**
3. Click **Set up a custom domain**
4. Enter your domain name
5. Follow the DNS configuration instructions

---

## Method 2: Direct Upload (Manual Deployment)

If you prefer to deploy manually or don't want to connect your Git repository:

### Step 1: Build Your Project Locally

```bash
npm install
npm run build
```

This creates a `dist` folder with your production build.

### Step 2: Create a Cloudflare Pages Project

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages**
3. Click **Create a project**
4. Select **Upload assets**

### Step 3: Upload the dist Folder

1. Drag and drop the `dist` folder, or click to browse
2. Enter a project name
3. Click **Deploy site**

### Step 4: Update Deployments

For future updates, repeat Steps 1-3 whenever you make changes.

---

## Build Configuration Reference

If you need to configure manually, use these settings:

```
Build command: npm run build
Build output directory: dist
Node version: 18.x (or higher)
Framework preset: Vite
```

---

## Troubleshooting

### Build Fails

1. **Check build logs**: Click on your deployment → View build log
2. **Common issues**:
   - Missing dependencies: Ensure `package.json` has all required packages
   - TypeScript errors: Run `npm run build` locally to catch errors first
   - Node version: Cloudflare Pages uses Node 18.x by default (should work fine)

### Site Shows Blank Page

1. **Check routing**: The `public/_redirects` file is already included in this project
2. This file ensures all routes are handled by your React app (for React Router)
3. If you still have issues, verify the `_redirects` file is in your `dist` folder after build

### Firebase Errors

1. **CORS issues**: Make sure your Cloudflare Pages domain is allowed in Firebase settings (if required)
2. **Auth domain**: Verify your Firebase `authDomain` matches your Cloudflare Pages URL
3. **Firestore rules**: Ensure your Firestore security rules allow reads from your domain

---

## Automatic Deployments

With GitHub integration, Cloudflare Pages will:
- ✅ Deploy on every push to your production branch
- ✅ Create preview deployments for pull requests
- ✅ Show build status in your GitHub repository

---

## Preview Deployments

When you create a pull request:
1. Cloudflare automatically builds and deploys a preview
2. You'll get a unique preview URL
3. Preview deployments are perfect for testing before merging

---

## Performance Tips

Cloudflare Pages automatically provides:
- ✅ Global CDN distribution
- ✅ Automatic HTTPS
- ✅ DDoS protection
- ✅ Fast edge caching

No additional configuration needed!

---

## Updating Your Deployment

### With GitHub Integration

Simply push to your repository:
```bash
git add .
git commit -m "Update rage meter"
git push origin main
```

Cloudflare will automatically rebuild and deploy.

### With Direct Upload

1. Run `npm run build` locally
2. Go to Cloudflare Pages dashboard
3. Click **Upload new deployment**
4. Upload the new `dist` folder

---

## Need Help?

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- Check your build logs in the Cloudflare dashboard for specific errors

---

Happy deploying! 🔥

