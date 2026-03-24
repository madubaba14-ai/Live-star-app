export function getFirebaseConfig() {
  return {
    apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY            || '',
    authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN        || '',
    projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID         || '',
    storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET     || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID|| '',
    appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID             || '',
    agoraAppId:        process.env.NEXT_PUBLIC_AGORA_APP_ID                || '',
    paypalClientId:    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID            || '',
    cloudinaryCloudName:    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME    || '',
    cloudinaryUploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '',
  }
}
