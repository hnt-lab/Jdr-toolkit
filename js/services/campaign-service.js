// ═══════════════════════════════════════
// CAMPAIGN SERVICE — collections 'tables', 'campaigns', 'tables/whispers'
// ═══════════════════════════════════════
const campaignService = {

  // ─── TABLES ───
  createTable(data) {
    return fbDb.collection('tables').add({
      ...data,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  },

  updateTable(tableId, data) {
    return fbDb.collection('tables').doc(tableId).update(data);
  },

  deleteTable(tableId) {
    return fbDb.collection('tables').doc(tableId).delete();
  },

  getTablesByMember(uid) {
    return fbDb.collection('tables').where('memberIds', 'array-contains', uid).get();
  },

  getTablesByMj(uid) {
    return fbDb.collection('tables').where('mjId', '==', uid).get();
  },

  getTableByInviteCode(code) {
    return fbDb.collection('tables').where('inviteCode', '==', code).limit(1).get();
  },

  // Ajoute un membre à une table (sur le document retourné par une query)
  addMember(tableRef, uid, name, avatar) {
    return tableRef.update({
      memberIds:    firebase.firestore.FieldValue.arrayUnion(uid),
      ['memberNames.'  + uid]: name,
      ['memberAvatars.' + uid]: avatar
    });
  },

  removeMember(tableId, uid) {
    return fbDb.collection('tables').doc(tableId).update({
      memberIds:    firebase.firestore.FieldValue.arrayRemove(uid),
      ['memberNames.'  + uid]: firebase.firestore.FieldValue.delete(),
      ['memberAvatars.' + uid]: firebase.firestore.FieldValue.delete()
    });
  },

  // ─── CAMPAGNES ───
  createCampaign(data) {
    return fbDb.collection('campaigns').add({
      ...data,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  },

  updateCampaign(campId, data) {
    return fbDb.collection('campaigns').doc(campId).update(data);
  },

  deleteCampaign(campId) {
    return fbDb.collection('campaigns').doc(campId).delete();
  },

  getCampaignsByTable(tableId) {
    return fbDb.collection('campaigns')
      .where('tableId', '==', tableId)
      .orderBy('createdAt', 'desc')
      .get();
  },

  // ─── CHUCHOTEMENTS (sous-collection de tables) ───
  listenWhispers(tableId, toUid, cb, onError) {
    return fbDb.collection('tables').doc(tableId)
      .collection('whispers')
      .where('to', '==', toUid)
      .limit(20)
      .onSnapshot(cb, onError || (() => {}));
  },

  sendWhisper(tableId, data) {
    return fbDb.collection('tables').doc(tableId).collection('whispers').add({
      ...data,
      ts: firebase.firestore.FieldValue.serverTimestamp()
    });
  },

  // ─── BATCH helpers ───
  // Retourne un batch Firestore pour les opérations atomiques (suppression table + campagnes)
  newBatch() {
    return fbDb.batch();
  },

  ref(collection, docId) {
    return docId
      ? fbDb.collection(collection).doc(docId)
      : fbDb.collection(collection).doc();
  }

};
