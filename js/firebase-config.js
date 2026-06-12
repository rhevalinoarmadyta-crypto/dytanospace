/**
 * ============================================================
 *  firebase-config.js  —  dytanospace Firebase Configuration
 * ============================================================
 *
 *  CARA SETUP (5 menit):
 *  1. Buka https://console.firebase.google.com/
 *  2. Klik "Add project" beri nama: dytanospace
 *  3. Di sidebar, klik Project Settings → tab "General"
 *  4. Scroll ke "Your apps" → klik ikon </> (Web)
 *  5. Daftarkan app → salin firebaseConfig → paste di bawah
 *
 *  AKTIFKAN AUTH PROVIDERS (Authentication → Sign-in method):
 *  ✅ Google   → Enable → Save
 *  ✅ Apple    → Enable → masukkan Service ID dari Apple Developer
 *  ✅ Phone    → Enable → Save
 *
 *  WHITELIST DOMAIN (Authentication → Settings → Authorized domains):
 *  Tambahkan: localhost
 *  Tambahkan: dytanospace.com  (untuk produksi)
 *
 *  PENTING: file:// protocol tidak didukung OAuth.
 *  Jalankan lokal dengan: npx http-server . -p 8080
 *  Lalu buka: http://localhost:8080
 * ============================================================
 */

const firebaseConfig = {
  apiKey:            "AIzaSyAe0Pz4vn5go_FrNJFzOmUmj5iQClqhy0",
  authDomain:        "dytanospace.firebaseapp.com",
  projectId:         "dytanospace",
  storageBucket:     "dytanospace.firebasestorage.app",
  messagingSenderId: "412369839345",
  appId:             "1:412369839345:web:519d94344b9060d25b3550",
  measurementId:     "G-NJFT7379FH"
};
