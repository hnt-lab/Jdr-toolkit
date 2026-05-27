// ═══════════════════════════════════════
// AUTH SERVICE — toutes les opérations Firebase Auth
// Aucune logique UI ici, uniquement des Promises.
// ═══════════════════════════════════════
const authService = {

  signIn(email, pw) {
    return fbAuth.signInWithEmailAndPassword(email, pw);
  },

  register(email, pw) {
    return fbAuth.createUserWithEmailAndPassword(email, pw);
  },

  signOut() {
    return fbAuth.signOut();
  },

  resetPassword(email) {
    return fbAuth.sendPasswordResetEmail(email);
  },

  // Ré-authentifie l'utilisateur courant (requis avant updateEmail/updatePassword/delete)
  reauthenticate(currentEmail, pw) {
    const cred = firebase.auth.EmailAuthProvider.credential(currentEmail, pw);
    return fbAuth.currentUser.reauthenticateWithCredential(cred);
  },

  updateEmail(newEmail) {
    return fbAuth.currentUser.updateEmail(newEmail);
  },

  updatePassword(newPw) {
    return fbAuth.currentUser.updatePassword(newPw);
  },

  updateProfile(data) {
    return fbAuth.currentUser.updateProfile(data);
  },

  sendEmailVerification() {
    return fbAuth.currentUser.sendEmailVerification();
  },

  deleteAccount() {
    return fbAuth.currentUser.delete();
  },

  onAuthStateChanged(cb) {
    return fbAuth.onAuthStateChanged(cb);
  }

};
