// Cycle collectif du repos : proposer → participer → décision MJ → application serveur.
const v2RestService = {
  _db() {
    if (typeof fbDb === 'undefined' || !fbDb) throw new Error('Firestore indisponible');
    return fbDb;
  },
  _contracts() {
    if (typeof DataContracts === 'undefined') throw new Error('DataContracts indisponible');
    return DataContracts;
  },
  _timestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
  },
  _ref(path) {
    return this._db().doc(path);
  },

  async propose(campaignId, input) {
    if (typeof v2AuthorityService === 'undefined') {
      throw new Error('Autorité serveur indisponible');
    }
    const result = await v2AuthorityService.proposeRest(campaignId, input.type);
    return result.proposalId;
  },

  setParticipation(campaignId, proposalId, userId, participates, options) {
    const C = this._contracts();
    return this._ref(C.PATHS.restParticipant(campaignId, proposalId, userId)).set(
      C.buildRestParticipation({
        userId,
        participates,
        healing: options && options.healing,
        hitDiceSpent: options && options.hitDiceSpent,
        answeredAt: this._timestamp()
      })
    );
  },

  decide(campaignId, proposalId, userId, approved) {
    if (typeof v2AuthorityService === 'undefined') {
      throw new Error('Autorité serveur indisponible');
    }
    return approved
      ? v2AuthorityService.finalizeRest(campaignId, proposalId)
      : v2AuthorityService.rejectRest(campaignId, proposalId);
  },

  listenOpen(campaignId, callback, onError) {
    return this._db().collection('campaigns').doc(campaignId)
      .collection('restProposals').where('status', '==', 'proposed')
      .onSnapshot(callback, onError || (() => {}));
  },

  listenParticipants(campaignId, proposalId, callback, onError) {
    return this._db().collection('campaigns').doc(campaignId)
      .collection('restProposals').doc(proposalId)
      .collection('participants')
      .onSnapshot(callback, onError || (() => {}));
  }
};
