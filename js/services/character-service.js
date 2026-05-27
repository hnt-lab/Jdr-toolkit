// ═══════════════════════════════════════
// CHARACTER SERVICE — collection 'characters'
// Deux types de documents :
//   - Fiche joueur  : {uid}_{campId}
//   - Document MJ   : {mjUid}_{campId}_mj
// ═══════════════════════════════════════
const characterService = {

  // ─── HELPERS ───
  _docId(uid, campId)   { return uid + '_' + campId; },
  _mjDocId(uid, campId) { return uid + '_' + campId + '_mj'; },

  // ─── FICHE JOUEUR ───
  getCharacter(uid, campId) {
    return fbDb.collection('characters').doc(this._docId(uid, campId)).get();
  },

  setCharacter(uid, campId, data) {
    return fbDb.collection('characters').doc(this._docId(uid, campId)).set(data);
  },

  updateCharacter(uid, campId, data) {
    return fbDb.collection('characters').doc(this._docId(uid, campId)).update(data);
  },

  deleteCharacter(uid, campId) {
    return fbDb.collection('characters').doc(this._docId(uid, campId)).delete();
  },

  // Écoute temps réel sur la fiche d'un joueur. Retourne la fonction unsubscribe.
  listenCharacter(uid, campId, cb, onError) {
    return fbDb.collection('characters').doc(this._docId(uid, campId))
      .onSnapshot(cb, onError || (() => {}));
  },

  // ─── DOC MJ ───
  getMjDoc(mjUid, campId) {
    return fbDb.collection('characters').doc(this._mjDocId(mjUid, campId)).get();
  },

  setMjDoc(mjUid, campId, data) {
    return fbDb.collection('characters').doc(this._mjDocId(mjUid, campId)).set(data);
  },

  updateMjDoc(mjUid, campId, data) {
    return fbDb.collection('characters').doc(this._mjDocId(mjUid, campId)).update(data);
  },

  // Écoute temps réel sur le doc MJ (état combat, PNJs…). Retourne unsubscribe.
  listenMjDoc(mjUid, campId, cb, onError) {
    return fbDb.collection('characters').doc(this._mjDocId(mjUid, campId))
      .onSnapshot(cb, onError || (() => {}));
  },

  // ─── REQUÊTES ───
  // Tous les joueurs d'une campagne (pour le MJ)
  getCharactersByCampaign(campId) {
    return fbDb.collection('characters').where('campaignId', '==', campId).get();
  },

  // Écoute temps réel sur tous les joueurs d'une campagne. Retourne unsubscribe.
  listenCharactersByCampaign(campId, cb, onError) {
    return fbDb.collection('characters').where('campaignId', '==', campId)
      .onSnapshot(cb, onError || (() => {}));
  },

  // Écoute des joueurs d'une table (pour Party HUD). Retourne unsubscribe.
  listenCharactersByTable(campId, cb, onError) {
    return fbDb.collection('characters').where('campaignId', '==', campId)
      .onSnapshot(cb, onError || (() => {}));
  },

  // Tous les personnages d'un joueur dans une table (pour suppression membre)
  getCharactersByTableAndUser(tableId, uid) {
    return fbDb.collection('characters')
      .where('tableId', '==', tableId)
      .where('userId', '==', uid)
      .get();
  },

  // Fin de tour : signal joueur → suppression flag après lecture MJ
  clearTurnDone(docId) {
    return fbDb.collection('characters').doc(docId)
      .update({ turnDone: firebase.firestore.FieldValue.delete() });
  },

  // Exclure un joueur d'une campagne
  ejectCharacter(docId) {
    return fbDb.collection('characters').doc(docId).update({ ejectedFromCampaign: true });
  }

};
