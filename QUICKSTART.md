# Rage Meter - Quick Start Guide

Get your Rage Meter up and running in 5 minutes!

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Google account

## Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Firebase

**Option A: Follow the detailed guide**
- Read `FIREBASE_SETUP.md` for step-by-step instructions

**Option B: Quick summary**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore (test mode is fine for now)
4. Enable Authentication (Email/Password)
5. Create a user account
6. Copy your Firebase config
7. Paste it into `src/config/firebase.ts`

### 3. Run the App

```bash
npm run dev
```

Open your browser to `http://localhost:5173`

### 4. Sign In and Start Raging!

1. Click "SIGN IN TO MASH"
2. Enter your credentials
3. Mash that spacebar! 🔥

## Key Features

### Main Page
- **Current Rage Score**: Your score for today
- **All-Time High**: Highest score ever achieved
- **Weekly Total**: This week's rage (resets Monday)
- **Monthly Total**: This month's rage (resets monthly)

### History Page
- View your rage history as a chart
- See all daily scores in a table
- Filter by time period

### Developer Controls
- Click "SHOW DEV" to reveal reset buttons
- Use with caution! ⚠️

## What You Need to Remember

- **Your login credentials**: Email and password you created in Firebase
- **Today's score resets** at midnight Pacific Time
- **Weekly total resets** every Monday
- **Only authenticated users** can increase the rage meter

## Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check for linting errors
npm run lint
```

## Need Help?

- **Firebase setup issues**: See `FIREBASE_SETUP.md`
- **General questions**: Check `README.md`
- **Code issues**: Check browser console for errors

## Next Steps

1. ✅ Set up Firebase
2. ✅ Install dependencies
3. ✅ Run the app
4. ✅ Log in
5. 🔥 **START RAGING!** 🔥

Enjoy your fiery rage meter! 💥

