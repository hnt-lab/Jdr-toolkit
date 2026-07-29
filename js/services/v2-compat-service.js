// ═════════════════════════════════════════════════════════════════════════════
// LECTURE V2 AVEC REPLI V1 POUR LA MIGRATION
// ═════════════════════════════════════════════════════════════════════════════
const v2CompatService = {
  isEnabled() {
    const local =
      typeof location !== 'undefined' &&
      (location.hostname === 'localhost' || location.hostname === '127.0.0.1');
    if (local) return localStorage.getItem('mjtk_v2_test') === '1';
    return globalThis.MJTK_ENVIRONMENT
      && globalThis.MJTK_ENVIRONMENT.name === 'production';
  },

  setEnabledForLocalTest(enabled) {
    const local =
      typeof location !== 'undefined' &&
      (location.hostname === 'localhost' || location.hostname === '127.0.0.1');
    if (!local) throw new Error('Le modèle V2 ne peut être activé qu’en test local');
    if (enabled) localStorage.setItem('mjtk_v2_test', '1');
    else localStorage.removeItem('mjtk_v2_test');
  },

  async getHubTables(uid) {
    return this.isEnabled() ? this._getV2HubTables(uid) : this._getLegacyHubTables(uid);
  },

  async getCurrentCharacterId(campaignId, userId) {
    if (!this.isEnabled() || !campaignId || !userId) return null;
    const doc = await fbDb
      .collection('campaigns')
      .doc(campaignId)
      .collection('players')
      .doc(userId)
      .get();
    if (!doc.exists) return null;
    const participation = doc.data();
    return participation.leftAt == null
      ? participation.currentCharacterId || null
      : null;
  },

  async getCampaignPlayer(campaignId, userId) {
    if (!this.isEnabled() || !campaignId || !userId) return null;
    const doc = await fbDb
      .collection('campaigns')
      .doc(campaignId)
      .collection('players')
      .doc(userId)
      .get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  async _getLegacyHubTables(uid) {
    const tables = await fbDb
      .collection('tables')
      .where('memberIds', 'array-contains', uid)
      .get();
    return Promise.all(
      tables.docs.map(async tableDoc => {
        const campaigns = await fbDb
          .collection('campaigns')
          .where('tableId', '==', tableDoc.id)
          .orderBy('createdAt', 'desc')
          .get();
        return {
          id: tableDoc.id,
          ...tableDoc.data(),
          _schema: 1,
          _role: tableDoc.data().mjId === uid ? 'owner' : 'player',
          _isMJ: tableDoc.data().mjId === uid,
          campaigns: campaigns.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        };
      })
    );
  },

  async _getV2HubTables(uid) {
    const memberships = await fbDb
      .collection('users')
      .doc(uid)
      .collection('tables')
      .where('leftAt', '==', null)
      .get();
    const result = [];
    for (const membershipDoc of memberships.docs) {
      const tableId = membershipDoc.data().tableId || membershipDoc.id;
      const tableRef = fbDb.collection('tables').doc(tableId);
      const [tableDoc, members, campaigns] = await Promise.all([
        tableRef.get(),
        tableRef.collection('members').where('leftAt', '==', null).get(),
        fbDb
          .collection('campaigns')
          .where('tableId', '==', tableRef.id)
          .orderBy('createdAt', 'desc')
          .get()
      ]);
      if (!tableDoc.exists) continue;
      const table = tableDoc.data();
      const memberIds = [];
      const memberNames = {};
      const memberAvatars = {};
      const memberRoles = {};
      members.docs.forEach(doc => {
        const member = doc.data();
        memberIds.push(doc.id);
        memberNames[doc.id] = member.displayNameSnapshot || 'Membre';
        memberAvatars[doc.id] = member.avatarSnapshot || '⚔';
        memberRoles[doc.id] = member.role || 'player';
      });
      const role = membershipDoc.data().role || 'player';
      result.push({
        id: tableDoc.id,
        ...table,
        // Champs de compatibilité pour le rendu historique du Hub.
        mjId: table.ownerId,
        memberIds,
        memberNames,
        memberAvatars,
        _memberRoles: memberRoles,
        _schema: 2,
        _role: role,
        _isMJ: role === 'owner' || role === 'gm',
        campaigns: campaigns.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(campaign => !campaign.deletedAt)
      });
    }
    return result;
  }
};
