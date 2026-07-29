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
      ? v2AuthorityService.approveRest(campaignId, proposalId)
      : v2AuthorityService.rejectRest(campaignId, proposalId);
  },

  async applyForSelf(campaignId, proposalId, userId) {
    if (!userId || userId !== currentUser?.uid) throw new Error('Utilisateur incohérent');
    if (typeof RestEngine === 'undefined') throw new Error('Moteur de repos indisponible');
    const db = this._db();
    const campaignRef = db.collection('campaigns').doc(campaignId);
    const proposalRef = campaignRef.collection('restProposals').doc(proposalId);
    const participantRef = proposalRef.collection('participants').doc(userId);
    const playerRef = campaignRef.collection('players').doc(userId);
    return db.runTransaction(async transaction => {
      const [proposalSnap, participantSnap, playerSnap] = await Promise.all([
        transaction.get(proposalRef),
        transaction.get(participantRef),
        transaction.get(playerRef)
      ]);
      if (!proposalSnap.exists || proposalSnap.data().status !== 'approved') {
        throw new Error('Ce repos n’est pas autorisé');
      }
      if (!participantSnap.exists || participantSnap.data().participates !== true) {
        return { applied: false, reason: 'not-participating' };
      }
      if (participantSnap.data().appliedAt != null) {
        return { applied: false, reason: 'already-applied' };
      }
      if (!playerSnap.exists || playerSnap.data().leftAt != null) {
        throw new Error('Participation active introuvable');
      }
      const characterId = String(playerSnap.data().currentCharacterId || '');
      if (!characterId) throw new Error('Personnage courant introuvable');
      const characterRef = db.collection('characters').doc(characterId);
      const sheetRef = characterRef.collection('sheet').doc('current');
      const projectionRef = campaignRef.collection('publicCharacters').doc(characterId);
      const [characterSnap, sheetSnap] = await Promise.all([
        transaction.get(characterRef),
        transaction.get(sheetRef)
      ]);
      if (!characterSnap.exists || characterSnap.data().ownerId !== userId
        || !sheetSnap.exists) {
        throw new Error('Fiche du participant introuvable');
      }
      const proposal = proposalSnap.data();
      const participant = participantSnap.data();
      const now = this._timestamp();
      const nextSheet = RestEngine.applyRestToSheet(
        sheetSnap.data(),
        proposal.type,
        {
          healing: participant.healing,
          hitDiceSpent: participant.hitDiceSpent
        }
      );
      nextSheet.lastRest = {
        type: proposal.type,
        proposalId,
        appliedBy: userId,
        approvedBy: proposal.decidedBy,
        at: now
      };
      nextSheet.updatedAt = now;
      transaction.set(sheetRef, nextSheet);
      transaction.set(projectionRef, {
        hp: Math.max(0, Number(nextSheet.hp) || 0),
        hpMax: Math.max(1, Number(nextSheet.hpMax) || 1),
        temporaryHp: this._contracts().temporaryHpOf(nextSheet),
        conditions: Array.isArray(nextSheet.conditions) ? nextSheet.conditions : [],
        updatedAt: now
      }, { merge: true });
      transaction.update(participantRef, { appliedAt: now });
      return { applied: true, characterId };
    });
  },

  listenOpen(campaignId, callback, onError) {
    return this._db().collection('campaigns').doc(campaignId)
      .collection('restProposals').where('status', 'in', ['proposed', 'approved'])
      .onSnapshot(callback, onError || (() => {}));
  },

  listenParticipants(campaignId, proposalId, callback, onError) {
    return this._db().collection('campaigns').doc(campaignId)
      .collection('restProposals').doc(proposalId)
      .collection('participants')
      .onSnapshot(callback, onError || (() => {}));
  }
};
