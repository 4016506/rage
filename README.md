# 🔥 RAGE METER 🔥

A fiery web application to track your rage levels with dramatic visual effects and comprehensive statistics!

## Features

- **Interactive Rage Counter**: Mash the spacebar to increase your rage score with intense visual effects
- **Authentication**: Password-protected access to rage-mashing privileges
- **Auto-Reset**: Scores automatically reset to 0 at midnight Pacific Time
- **Statistics Tracking**:
  - Current rage score
  - All-time high
  - Weekly total (resets every Monday)
  - Monthly total
- **Historical Data**: View your rage history with interactive charts
- **Fiery UI**: Red-hot design with flame animations and glow effects

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Firebase (Firestore + Authentication)
- **Charts**: Chart.js with React Chart.js 2
- **Routing**: React Router DOM

## Firebase Setup Instructions

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

### 2. Enable Firestore Database

1. In your Firebase project, go to "Build" → "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (or configure your own security rules)
4. Select a location for your database
5. Click "Enable"

### 3. Enable Authentication

1. Go to "Build" → "Authentication"
2. Click "Get started"
3. Under "Sign-in method", enable "Email/Password"
4. Click "Email/Password" → Toggle "Enable" → Click "Save"

### 4. Create a User Account

1. Still in Authentication, click "Users" tab
2. Click "Add user"
3. Enter an email and password for yourself
4. Click "Add user"
5. **Save these credentials** - you'll need them to log in!

### 5. Get Your Firebase Configuration

1. Go to Project Settings (gear icon next to "Project Overview")
2. Scroll down to "Your apps"
3. Click the Web icon (</>) to add a web app
4. Register your app with a nickname (e.g., "Rage Meter")
5. Copy the firebase configuration object

### 6. Configure the App

1. Open `src/config/firebase.ts`
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

### 7. (Optional) Configure Security Rules

For production, you should configure Firestore security rules:

1. Go to Firestore Database → Rules
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Anyone can read stats
    match /stats/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Anyone can read daily rage data
    match /daily_rage/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

Click "Publish"

## Installation & Running

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to the URL shown (usually `http://localhost:5173`)

4. Build for production:
```bash
npm run build
```

## Usage

### Viewing the Rage Meter

Anyone can view the rage meter at the main page. You'll see:
- Current rage score
- All-time high
- Weekly total
- Monthly total

### Mashing the Spacebar

1. Click "SIGN IN TO MASH"
2. Enter the credentials you created in Firebase
3. Start mashing that spacebar! 💥

Each press increases the score by 1 and triggers intense visual effects.

### Viewing History

Click "📊 HISTORY" in the navigation to see:
- Interactive chart of rage scores over time
- Data table with all recorded scores
- Filter by time period (All Time, Last 30 Days, Last 7 Days)

### Developer Controls

1. Click the "SHOW DEV" button in the top right
2. Use "RESET CURRENT SCORE" to manually reset today's score
3. Use "CLEAR ALL STATISTICS" to wipe all data

**⚠️ Warning**: These buttons are irreversible!

## Auto-Reset Behavior

- **Daily**: Score resets to 0 at midnight Pacific Time
- **Weekly**: Total resets every Monday at midnight Pacific Time
- **Monthly**: Total resets at the beginning of each month

## Data Structure

### Firestore Collections

**`stats/rage_stats`**
```typescript
{
  currentScore: number;
  today: string; // YYYY-MM-DD
  allTimeHigh: number;
  weeklyTotal: number;
  monthlyTotal: number;
  lastReset: Timestamp;
}
```

**`daily_rage/{date}`**
```typescript
{
  date: string; // YYYY-MM-DD
  score: number;
  timestamp: Timestamp;
}
```

## Customization

### Changing Colors

Edit the CSS files to modify the color scheme:
- `src/App.css` - Global styles
- `src/components/RageMeter.css` - Main meter styles
- `src/components/History.css` - History page styles

Key color variables:
- Primary rage color: `#ff4500` (Red-Orange)
- Glow effects: Various shades from red to yellow
- Background: Dark gradients

### Adjusting Auto-Reset Timezone

Edit `src/services/rageService.ts` and modify the PST timezone references to your preferred timezone.

## Troubleshooting

**"Firebase not configured" error**
- Make sure you've replaced all placeholder values in `src/config/firebase.ts`

**Can't log in**
- Verify your user was created in Firebase Authentication
- Check that Email/Password authentication is enabled

**Stats not updating**
- Check browser console for errors
- Verify Firestore security rules allow authenticated writes

**Visual effects not showing**
- Try refreshing the page
- Check that CSS files are loading correctly

## License

MIT License - Feel free to rage on!

## Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

Built with 🔥 and ☕️ by someone who definitely needed a rage meter.

