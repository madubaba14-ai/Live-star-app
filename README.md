# LiveStar ✦

Live streaming platform with gifts, premium video calls, and coin payments.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Fill in your keys in `.env.local`:

| Variable | Where to get it |
|----------|----------------|
| `NEXT_PUBLIC_FIREBASE_*` | [console.firebase.google.com](https://console.firebase.google.com) |
| `NEXT_PUBLIC_AGORA_APP_ID` | [console.agora.io](https://console.agora.io) |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | [developer.paypal.com](https://developer.paypal.com) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | [cloudinary.com](https://cloudinary.com) |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Cloudinary → Settings → Upload Presets |

### 3. Firebase setup
1. Create project → Enable **Authentication** (Email/Password)
2. Create **Firestore** database
3. Set Firestore rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Set your Admin UID
In `app/page.jsx` find this line and replace with your Firebase UID:
```js
const ADMIN_UIDS = ["YOUR_UID_HERE"]
```

### 5. Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel (free)
1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Add environment variables in Vercel dashboard
4. Deploy ✅

## Features
- 🔴 Live streaming (Agora)
- 🎁 Virtual gifts with animations
- 📹 Premium 1-on-1 video calls
- 💎 Coin system with PayPal top-up
- 💸 Withdrawal system (PayPal)
- 🔔 Real-time notifications
- 👥 Follow / Unfollow
- 👑 Admin panel
- 🎁 Daily bonus coins
