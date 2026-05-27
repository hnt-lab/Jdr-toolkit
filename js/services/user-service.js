// ═══════════════════════════════════════
// USER SERVICE — collection 'users' + feedback
// ═══════════════════════════════════════
const userService = {

  getUser(uid) {
    return fbDb.collection('users').doc(uid).get();
  },

  createUser(uid, data) {
    return fbDb.collection('users').doc(uid).set({
      ...data,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  },

  updateUser(uid, data) {
    return fbDb.collection('users').doc(uid).update(data);
  },

  deleteUser(uid) {
    return fbDb.collection('users').doc(uid).delete();
  },

  // Met à jour la bibliothèque de personnages (charLib[campId])
  setCharLib(uid, campId, meta) {
    return fbDb.collection('users').doc(uid).update({
      ['charLib.' + campId]: meta
    });
  },

  removeCharLib(uid, campId) {
    return fbDb.collection('users').doc(uid).update({
      ['charLib.' + campId]: firebase.firestore.FieldValue.delete()
    });
  },

  // Met à jour les compendiums personnalisés
  updateCompendiumLib(uid, compendiumLib) {
    return fbDb.collection('users').doc(uid).update({ compendiumLib });
  },

  // Envoie un retour utilisateur (bug report / suggestion)
  sendFeedback(uid, email, type, message) {
    return fbDb.collection('feedback').add({
      userId: uid || 'anonymous',
      email: email || '',
      type,
      message,
      ts: firebase.firestore.FieldValue.serverTimestamp()
    });
  }

};
