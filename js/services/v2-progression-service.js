// Corrections et validations de progression : demande MJ puis application serveur historisée.
const v2ProgressionService = {
  _db() {
    if (typeof fbDb === 'undefined' || !fbDb) throw new Error('Firestore indisponible');
    return fbDb;
  },

  _timestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
  },

  async requestCorrection(campaignId, input) {
    const ref = this._db().collection('campaigns').doc(campaignId)
      .collection('correctionRequests').doc();
    await ref.set({
      schemaVersion: 2,
      status: 'pending',
      kind: input.kind === 'progression' ? 'progression' : 'correction',
      characterId: input.characterId,
      ownerId: input.ownerId,
      requestedBy: input.requestedBy,
      reason: String(input.reason || '').trim() || null,
      patch: { ...(input.patch || {}) },
      proposedSheet: input.kind === 'progression' && input.proposedSheet
        ? { ...input.proposedSheet }
        : null,
      requestedAt: this._timestamp()
    });
    return ref.id;
  },

  apply(campaignId, requestId) {
    if (typeof v2AuthorityService === 'undefined') {
      throw new Error('Autorité serveur indisponible');
    }
    return v2AuthorityService.applyCorrection(campaignId, requestId);
  },

  reject(campaignId, requestId) {
    if (typeof v2AuthorityService === 'undefined') {
      throw new Error('Autorité serveur indisponible');
    }
    return v2AuthorityService.rejectCorrection(campaignId, requestId);
  },

  listenPending(campaignId, callback, onError) {
    return this._db().collection('campaigns').doc(campaignId)
      .collection('correctionRequests').where('status', '==', 'pending')
      .onSnapshot(callback, onError || (() => {}));
  }
};
