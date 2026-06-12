/**
 * ============================================================
 *  auth.js  —  dytanospace SSO Authentication Module
 *  Mendukung: Google SSO · Apple SSO · Phone OTP
 *  Powered by Firebase Authentication
 * ============================================================
 */

window.DytanospaceAuth = (function () {

  /* ── State Internal ── */
  let _auth = null;
  let _googleProvider = null;
  let _appleProvider = null;
  let _recaptchaVerifier = null;
  let _confirmationResult = null;
  let _isReady = false;

  /* ── Cek apakah config sudah diisi (bukan placeholder) ── */
  function _isConfigFilled() {
    return (
      typeof firebaseConfig !== 'undefined' &&
      firebaseConfig.apiKey &&
      !firebaseConfig.apiKey.startsWith('GANTI')
    );
  }

  /* ── Inisialisasi Firebase ── */
  function _init() {
    if (!_isConfigFilled()) {
      console.warn('[dytanospace Auth] Firebase belum dikonfigurasi.');
      return false;
    }

    try {
      if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }

      _auth = firebase.auth();
      _auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

      _googleProvider = new firebase.auth.GoogleAuthProvider();
      _googleProvider.addScope('email');
      _googleProvider.addScope('profile');
      _googleProvider.setCustomParameters({ prompt: 'select_account' });

      _appleProvider = new firebase.auth.OAuthProvider('apple.com');
      _appleProvider.addScope('email');
      _appleProvider.addScope('name');

      _isReady = true;
      console.info('[dytanospace Auth] Firebase siap.');
      return true;

    } catch (err) {
      console.error('[dytanospace Auth] Error inisialisasi Firebase:', err.message);
      return false;
    }
  }

  function isReady() { return _isReady; }

  function onAuthStateChanged(callback) {
    if (_auth) {
      _auth.onAuthStateChanged(callback);
    } else {
      callback(null);
    }
  }

  function getCurrentUser() {
    return _auth ? _auth.currentUser : null;
  }

  async function signInWithGoogle() {
    if (!_auth) throw new Error('Firebase belum dikonfigurasi.');
    const result = await _auth.signInWithPopup(_googleProvider);
    return result.user;
  }

  async function signInWithApple() {
    if (!_auth) throw new Error('Firebase belum dikonfigurasi.');
    const result = await _auth.signInWithPopup(_appleProvider);
    return result.user;
  }

  function _setupRecaptcha(containerEl) {
    if (!_auth) return null;

    if (_recaptchaVerifier) {
      try { _recaptchaVerifier.clear(); } catch (_) {}
      _recaptchaVerifier = null;
    }

    _recaptchaVerifier = new firebase.auth.RecaptchaVerifier(containerEl, {
      size: 'invisible',
      callback: () => {},
      'expired-callback': () => {
        if (_recaptchaVerifier) {
          try { _recaptchaVerifier.clear(); } catch (_) {}
          _recaptchaVerifier = null;
        }
      }
    });

    return _recaptchaVerifier;
  }

  async function sendPhoneOTP(phoneNumber, recaptchaContainerId) {
    if (!_auth) throw new Error('Firebase belum dikonfigurasi.');
    const verifier = _setupRecaptcha(recaptchaContainerId);
    if (!verifier) throw new Error('reCAPTCHA gagal diinisialisasi.');
    _confirmationResult = await _auth.signInWithPhoneNumber(phoneNumber, verifier);
    return _confirmationResult;
  }

  async function verifyPhoneOTP(otp) {
    if (!_confirmationResult) {
      throw new Error('Tidak ada OTP yang sedang menunggu verifikasi.');
    }
    const result = await _confirmationResult.confirm(otp);
    return result.user;
  }

  async function resendPhoneOTP(phoneNumber, recaptchaContainerId) {
    _confirmationResult = null;
    return sendPhoneOTP(phoneNumber, recaptchaContainerId);
  }

  async function signOut() {
    if (_auth) {
      await _auth.signOut();
    }
  }

  _init();

  return {
    isReady,
    onAuthStateChanged,
    getCurrentUser,
    signInWithGoogle,
    signInWithApple,
    sendPhoneOTP,
    verifyPhoneOTP,
    resendPhoneOTP,
    signOut
  };

})();
