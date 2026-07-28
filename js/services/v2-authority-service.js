// Passerelle cliente vers les opérations V2 qui exigent l'Admin SDK.
// Elle reste inactive hors test local V2 tant que le backend n'est pas déployé.
const v2AuthorityService = {
  _functionsInstance: null,

  _isLocalV2() {
    const local = typeof location !== 'undefined'
      && (location.hostname === 'localhost' || location.hostname === '127.0.0.1');
    return local && localStorage.getItem('mjtk_v2_test') === '1';
  },

  _functions() {
    if (!this._isLocalV2()) {
      throw new Error('Autorité V2 disponible uniquement dans le test local');
    }
    if (!firebase.functions) throw new Error('SDK Firebase Functions indisponible');
    if (!this._functionsInstance) {
      this._functionsInstance = firebase.app().functions('europe-west1');
      this._functionsInstance.useEmulator('127.0.0.1', 5002);
    }
    return this._functionsInstance;
  },

  async _call(name, data) {
    const result = await this._functions().httpsCallable(name)(data || {});
    return result.data;
  },

  createInvite(tableId, code) {
    return this._call('createTableInvite', { tableId, code });
  },

  joinTable(code, profile) {
    return this._call('joinTableWithCode', {
      code,
      displayName: profile && profile.displayName,
      avatar: profile && profile.avatar
    });
  },

  joinCampaignWithCharacter(campaignId, characterId) {
    return this._call('joinCampaignWithCharacter', { campaignId, characterId });
  },

  leaveCampaign(campaignId) {
    return this._call('leaveCampaign', { campaignId });
  },

  removeCharacterFromCampaign(campaignId, characterId) {
    return this._call('removeCharacterFromCampaign', { campaignId, characterId });
  },

  setMemberRole(tableId, userId, role) {
    return this._call('setTableMemberRole', { tableId, userId, role });
  },

  removeMember(tableId, userId) {
    return this._call('removeTableMember', { tableId, userId });
  },

  leaveTable(tableId) {
    return this._call('leaveTable', { tableId });
  },

  transferOwnership(tableId, userId) {
    return this._call('transferTableOwnership', { tableId, userId });
  },

  finalizeRest(campaignId, proposalId) {
    return this._call('finalizeGroupRest', { campaignId, proposalId });
  },

  proposeRest(campaignId, type) {
    return this._call('proposeGroupRest', { campaignId, type });
  },

  rejectRest(campaignId, proposalId) {
    return this._call('rejectGroupRest', { campaignId, proposalId });
  },

  deleteArchivedCampaign(campaignId) {
    return this._call('deleteArchivedCampaign', { campaignId });
  },

  archiveCampaign(campaignId) {
    return this._call('archiveCampaignWithSnapshots', { campaignId });
  },

  deleteOwnedCharacter(characterId) {
    return this._call('deleteOwnedCharacter', { characterId });
  },

  applyCorrection(campaignId, requestId) {
    return this._call('applyCharacterCorrection', { campaignId, requestId });
  },

  rejectCorrection(campaignId, requestId) {
    return this._call('rejectCharacterCorrection', { campaignId, requestId });
  },

  updateCharacterSheet(campaignId, characterId, sheet) {
    return this._call('updateCharacterSheetByGm', {
      campaignId,
      characterId,
      sheet
    });
  },

  updateCharacterVitals(campaignId, characterId, patch) {
    return this._call('updateCharacterVitalsByGm', {
      campaignId,
      characterId,
      patch
    });
  },

  updateOwnedItemState(tableId, instanceId, patch) {
    return this._call('updateOwnedItemState', { tableId, instanceId, patch });
  },

  proposeItemTransfer(tableId, instanceId, targetCharacterId) {
    return this._call('proposeItemTransfer', {
      tableId,
      instanceId,
      targetCharacterId
    });
  },

  decideItemTransfer(tableId, transferId, accepted) {
    return this._call('decideItemTransfer', {
      tableId,
      transferId,
      accepted: accepted === true
    });
  }
};
