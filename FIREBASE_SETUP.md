# Firebase Setup Guide for Rage Meter

This guide will walk you through setting up Firebase for the Rage Meter application.

## Prerequisites

- A Google account
- A web browser

## Step-by-Step Instructions

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Sign in with your Google account
3. Click **"Add project"** or **"Create a project"**
4. Enter project name: `rage-meter` (or any name you prefer)
5. Click **"Continue"**
6. **Disable Google Analytics** (optional, not needed for this app) or leave it enabled
7. Click **"Create project"**
8. Wait for the project to be created
9. Click **"Continue"**

### Step 2: Enable Firestore Database

1. In the Firebase Console, click on **"Build"** in the left sidebar
2. Click **"Firestore Database"**
3. Click **"Create database"**
4. Select **"Start in test mode"** (you can add security rules later)
5. Click **"Next"**
6. Choose a **location** closest to you (e.g., `us-central`, `europe-west`, etc.)
7. Click **"Enable"**
8. Wait for the database to be created

### Step 3: Configure Firestore Security Rules (Important!)

⚠️ **IMPORTANT**: After creating the database in test mode, set up proper security rules:

1. In the Firestore console, click on the **"Rules"** tab
2. Replace the existing rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to everyone
    // Allow write access only to authenticated users
    match /stats/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /daily_rage/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"** to save the rules

### Step 4: Enable Authentication

1. In the Firebase Console, click **"Build"** → **"Authentication"**
2. Click **"Get started"**
3. Under "Sign-in providers", find **"Email/Password"**
4. Click on **"Email/Password"**
5. Toggle the **"Enable"** switch
6. Click **"Save"**

### Step 5: Create Your User Account

1. Still in Authentication, click the **"Users"** tab
2. Click **"Add user"** (top right button)
3. Enter your email address
4. Enter a password (must be at least 6 characters)
5. Click **"Add user"**

📝 **IMPORTANT**: Write down your email and password - you'll need these to log into the Rage Meter!

### Step 6: Get Your Firebase Configuration

1. Click the **gear icon** (⚙️) next to "Project Overview" in the left sidebar
2. Click **"Project settings"**
3. Scroll down to the **"Your apps"** section
4. Click the **web icon** `</>` to add a web app
5. Register your app:
   - App nickname: `Rage Meter`
   - Check **"Also set up Firebase Hosting"** (optional)
6. Click **"Register app"**
7. **Copy the `firebaseConfig` object** that appears (the code snippet shown)

You should see something like:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Step 7: Add Configuration to Your App

1. Open `src/config/firebase.ts` in your project
2. Replace the placeholder values with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_AUTH_DOMAIN_HERE",
  projectId: "YOUR_PROJECT_ID_HERE",
  storageBucket: "YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
  appId: "YOUR_APP_ID_HERE"
};
```

3. Save the file

### Step 8: Verify Everything Works

1. In your terminal, run `npm install`
2. Run `npm run dev`
3. Open your browser to `http://localhost:5173`
4. You should see the Rage Meter page
5. Try clicking **"SIGN IN TO MASH"** and enter your credentials
6. If you can log in successfully, you're all set! 🔥

## Troubleshooting

### "Firebase API key not valid"
- Double-check that you copied all 6 values correctly
- Make sure there are no extra spaces or quotes

### "Permission denied"
- Go back to Firestore Rules and make sure you published the rules correctly
- Ensure you're logged in when trying to increase the rage score

### "User not found" or "Wrong password"
- Verify the user was created in Authentication → Users
- Try creating a new user if needed

### "Network error" or "Cannot connect to Firebase"
- Check your internet connection
- Verify you're using the correct project ID
- Make sure Firestore and Authentication are enabled

## Optional: Firebase Hosting Setup

If you want to deploy your Rage Meter to the web:

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project:
```bash
firebase init hosting
```

4. Build your app:
```bash
npm run build
```

5. Deploy:
```bash
firebase deploy --only hosting
```

Your app will be live at `https://your-project-id.web.app`

## Need Help?

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Authentication Docs](https://firebase.google.com/docs/auth)

