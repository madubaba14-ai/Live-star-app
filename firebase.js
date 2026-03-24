// Firebase is initialized directly inside page.jsx (lazy loaded)
// This file is kept for compatibility

let _app = null
let _auth = null
let _db = null

export function isFirebaseAvailable() {
  return (
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'YOUR_API_KEY'
  )
}

export function getFirebaseAuth() {
  return _auth
}

export function getFirebaseDb() {
  return _db
}

export function setFirebaseInstances(app, auth, db) {
  _app = app
  _auth = auth
  _db = db
}
