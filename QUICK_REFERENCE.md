# Rage Meter - Quick Reference Card

## 🚀 Start the App

```bash
npm install        # First time only
npm run dev        # Start development server
```

Then open: `http://localhost:5173`

## 🔥 Firebase Setup Checklist

- [ ] Create Firebase project
- [ ] Enable Firestore Database
- [ ] Enable Authentication (Email/Password)
- [ ] Create user account
- [ ] Copy config to `src/config/firebase.ts`
- [ ] Set Firestore security rules

**See**: `FIREBASE_SETUP.md` for details

## ⌨️ Key Features

| Feature | Shortcut/Button | Notes |
|---------|----------------|-------|
| Increase rage | `Spacebar` | Must be authenticated |
| View history | `📊 HISTORY` link | Anyone can view |
| Sign in | `SIGN IN TO MASH` | Required for mashing |
| Dev controls | `SHOW DEV` button | Toggle dev buttons |
| Reset today | `RESET CURRENT SCORE` | Dev mode only |
| Clear all | `CLEAR ALL STATISTICS` | Dev mode only |

## 📊 Data Reset Schedule

| Data | Reset Time | Location |
|------|------------|----------|
| Daily score | Midnight PST | Every day |
| Weekly total | Monday midnight PST | Weekly |
| Monthly total | Month start | Monthly |
| All-time high | Never | Permanent |

## 🎨 Customization

| Setting | File | Location |
|---------|------|----------|
| Firebase config | `src/config/firebase.ts` | Lines 8-14 |
| Timezone | `src/services/rageService.ts` | Line 34 |
| Colors | `src/**/*.css` | Throughout |
| Animations | `src/**/*.css` | @keyframes |

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't sign in | Check Firebase config |
| Score won't increase | Must be authenticated |
| "Permission denied" | Check Firestore rules |
| No visual effects | Refresh browser |
| Build errors | Run `npm install` |

## 📁 Important Files

| File | Purpose |
|------|---------|
| `src/config/firebase.ts` | Firebase config |
| `src/services/rageService.ts` | Data operations |
| `src/services/authService.ts` | Login/logout |
| `src/components/RageMeter.tsx` | Main page |
| `src/components/History.tsx` | Stats page |

## 🎯 Development

```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production
npm run lint     # Check code
```

## 📖 Documentation

- **README.md**: Full overview
- **QUICKSTART.md**: 5-minute setup
- **FIREBASE_SETUP.md**: Firebase guide
- **PROJECT_SUMMARY.md**: Feature list
- **QUICK_REFERENCE.md**: This file

## 🔗 Useful Links

- [Firebase Console](https://console.firebase.google.com/)
- [Vite Docs](https://vitejs.dev/)
- [React Docs](https://react.dev/)
- [Firestore Docs](https://firebase.google.com/docs/firestore)

## 💡 Tips

1. **Keep your credentials safe** - You need them to mash!
2. **Check timezone** - Resets are in Pacific Time
3. **Use dev buttons carefully** - Irreversible!
4. **Monitor Firebase usage** - Free tier limits apply
5. **Save your data** - Export if needed

## 🎉 You're All Set!

Start mashing that spacebar and watch your rage score soar! 🔥

---

**Need help?** Check the full documentation files or browser console for errors.

