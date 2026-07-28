// ═════════════════════════════════════════════════════════════════════════════
// ACCÈS FIRESTORE V2
// Ce service coexiste avec les services historiques pendant la migration.
// Il n'est pas encore utilisé par les écrans tant que les règles V2 ne sont pas
// testées et déployées.
// ═════════════════════════════════════════════════════════════════════════════
const v2DataService = {
  _db() {
    if (typeof fbDb === 'undefined' || !fbDb) throw new Error('Firestore indisponible');
    return fbDb;
  },

  _contracts() {
    if (typeof DataContracts === 'undefined') throw new Error('DataContracts indisponible');
    return DataContracts;
  },

  _serverTimestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
  },

  _ref(path) {
    return this._db().doc(path);
  },

  async createTableWithOwner(input) {
    const C = this._contracts();
    const db = this._db();
    const tableRef = db.collection('tables').doc();
    const now = this._serverTimestamp();
    const table = C.buildTable({ ...input, createdAt: now, updatedAt: now });
    const member = C.buildTableMember({
      userId: table.ownerId,
      role: C.TABLE_ROLES.OWNER,
      displayNameSnapshot: input.displayNameSnapshot || 'MJ',
      avatarSnapshot: input.avatarSnapshot || null,
      joinedAt: now
    });
    const batch = db.batch();
    batch.set(tableRef, table);
    batch.set(this._ref(C.PATHS.tableMember(tableRef.id, table.ownerId)), member);
    batch.set(this._ref(C.PATHS.userTable(table.ownerId, tableRef.id)), {
      schemaVersion: C.SCHEMA_VERSION,
      tableId: tableRef.id,
      role: C.TABLE_ROLES.OWNER,
      leftAt: null,
      updatedAt: now
    });
    await batch.commit();
    return tableRef.id;
  },

  getTable(tableId) {
    return this._ref(this._contracts().PATHS.table(tableId)).get();
  },

  getTableMember(tableId, userId) {
    return this._ref(this._contracts().PATHS.tableMember(tableId, userId)).get();
  },

  async loadCharacterSheet(characterId) {
    const snapshot = await this._ref(
      this._contracts().PATHS.characterSheet(characterId)
    ).get();
    return snapshot.exists ? snapshot.data() : null;
  },

  async loadArchivedCharacterSnapshot(characterId, campaignId) {
    const snapshot = await this._ref(
      this._contracts().PATHS.characterCampaignSnapshot(characterId, campaignId)
    ).get();
    return snapshot.exists ? snapshot.data() : null;
  },

  async listOwnedCharacters(userId) {
    const roots = await this._db().collection('characters')
      .where('ownerId', '==', userId)
      .get();
    return Promise.all(roots.docs.map(async root => ({
      id: root.id,
      ...root.data(),
      sheet: await this.loadCharacterSheet(root.id)
    })));
  },

  async listCharacterParticipations(characterId, userId) {
    const db = this._db();
    const memberships = await db.collection('users').doc(userId)
      .collection('tables').where('leftAt', '==', null).get();
    const result = [];
    for (const membership of memberships.docs) {
      const tableId = membership.data().tableId || membership.id;
      const [tableDoc, campaigns] = await Promise.all([
        db.collection('tables').doc(tableId).get(),
        db.collection('campaigns').where('tableId', '==', tableId).get()
      ]);
      for (const campaignDoc of campaigns.docs) {
        const playerDoc = await campaignDoc.ref.collection('players').doc(userId).get();
        if (!playerDoc.exists) continue;
        const player = playerDoc.data() || {};
        const ids = Array.isArray(player.characterIds) ? player.characterIds : [];
        if (!ids.includes(characterId) && player.currentCharacterId !== characterId) continue;
        result.push({
          tableId,
          tableName: tableDoc.exists ? tableDoc.data().name || 'Table' : 'Table',
          campaignId: campaignDoc.id,
          campaignName: campaignDoc.data().name || 'Campagne',
          archived: Boolean(campaignDoc.data().archivedAt),
          current: player.currentCharacterId === characterId && player.leftAt == null,
          leftAt: player.leftAt || null
        });
      }
    }
    return result;
  },

  async saveCharacterSheet(campaignId, characterId, userId, sheet) {
    const C = this._contracts();
    const db = this._db();
    const now = this._serverTimestamp();
    const batch = db.batch();
    const persistentSheet = {
      ...(sheet || {}),
      // Les exemplaires donnés par le MJ vivent dans itemInstances. Les recopier
      // dans la fiche créerait des doublons et exposerait leur état secret.
      inventory: Array.isArray(sheet && sheet.inventory)
        ? sheet.inventory.filter(item => !item || !item._v2InstanceId)
        : []
    };
    const normalizedSheet = {
      ...persistentSheet,
      schemaVersion: C.SCHEMA_VERSION,
      resources: this._buildRestResources(persistentSheet),
      updatedAt: now
    };
    batch.set(this._ref(C.PATHS.characterSheet(characterId)), normalizedSheet);
    if (campaignId) {
      batch.set(
        this._ref(C.PATHS.publicCharacter(campaignId, characterId)),
        C.buildPublicCharacter({
          characterId,
          userId,
          name: sheet.charName || sheet.name || 'Personnage',
          portrait: sheet.portrait || null,
          race: sheet.race || null,
          classes: (sheet.classes || []).map(entry =>
            `${entry.name || '?'} ${entry.level || 1}`
          ).join(' / '),
          hp: sheet.hp,
          hpMax: sheet.hpMax,
          temporaryHp: C.temporaryHpOf(sheet),
          conditions: sheet.conditions || [],
          concentration: sheet.concentration || null,
          inspiration: sheet.inspiration || false,
          pendingInitiative: sheet.pendingInitiative,
          deathSaves: sheet.deathSaves || null,
          actionLog: sheet.actionLog || [],
          updatedAt: now
        }),
        { merge: true }
      );
    }
    return batch.commit();
  },

  _buildRestResources(sheet) {
    const resources = {};
    const charges = sheet.combatCharges || {};
    const register = (id, current, max, recovery, stateKey) => {
      if (!['short', 'long'].includes(recovery) || !(Number(max) > 0)) return;
      resources[id] = {
        current: Math.max(0, Number(current == null ? max : current) || 0),
        max: Math.max(0, Number(max) || 0),
        recovery,
        stateKey: stateKey || id
      };
    };
    if (typeof SRD !== 'undefined' && Array.isArray(SRD.classes)) {
      (sheet.classes || []).forEach(classEntry => {
        const classData = SRD.classes.find(entry => entry.name === classEntry.name);
        (classData && classData.combatFeatures || []).forEach(feature => {
          if (!['short', 'long'].includes(feature.recovery)) return;
          const max = typeof getChargesMax === 'function'
            ? getChargesMax(feature, sheet)
            : Number(feature.charges) || 0;
          register(
            `${classEntry.name}:${feature.name}`,
            charges[feature.name],
            max,
            feature.recovery,
            feature.name
          );
        });
      });
    }
    (sheet.customCombatFeats || []).forEach(feature => {
      register(
        `custom:${feature.name}`,
        charges[feature.name],
        feature.charges,
        feature.recovery,
        feature.name
      );
    });
    const levelOf = name => ((sheet.classes || []).find(entry => entry.name === name) || {}).level || 0;
    const druidLevel = levelOf('Druide');
    if (druidLevel) register('Druide:Forme sauvage', charges['Forme sauvage'], druidLevel >= 20 ? 99 : 2, 'short', 'Forme sauvage');
    const monkLevel = levelOf('Moine');
    if (monkLevel) register('Moine:Ki', charges.Ki, monkLevel, 'short', 'Ki');
    return resources;
  },

  setMemberRole(tableId, userId, role) {
    const C = this._contracts();
    if (![C.TABLE_ROLES.GM, C.TABLE_ROLES.PLAYER].includes(role)) {
      throw new TypeError('Le rôle owner se transfère avec transferTableOwnership()');
    }
    if (typeof v2AuthorityService === 'undefined') {
      throw new Error('Autorité serveur indisponible');
    }
    return v2AuthorityService.setMemberRole(tableId, userId, role);
  },

  transferTableOwnership(tableId, currentOwnerId, nextOwnerId) {
    if (currentOwnerId === nextOwnerId) return;
    if (typeof v2AuthorityService === 'undefined') {
      throw new Error('Autorité serveur indisponible');
    }
    return v2AuthorityService.transferOwnership(tableId, nextOwnerId);
  },

  listenTableMembers(tableId, callback, onError) {
    return this._db()
      .collection('tables')
      .doc(tableId)
      .collection('members')
      .where('leftAt', '==', null)
      .onSnapshot(callback, onError || (() => {}));
  },

  async createCampaign(input) {
    const C = this._contracts();
    const db = this._db();
    const ref = db.collection('campaigns').doc();
    const chronicleRef = input.chronicleId
      ? db.collection('chronicles').doc(input.chronicleId)
      : db.collection('chronicles').doc();
    if (input.chronicleId) {
      const chronicle = await chronicleRef.get();
      if (!chronicle.exists || chronicle.data().tableId !== input.tableId) {
        throw new Error('Cette chronique n’appartient pas à la table');
      }
    }
    const now = this._serverTimestamp();
    const batch = db.batch();
    if (!input.chronicleId) {
      batch.set(chronicleRef, C.buildChronicle({
        tableId: input.tableId,
        name: input.name,
        createdBy: input.createdBy,
        createdAt: now,
        updatedAt: now
      }));
    }
    batch.set(ref, C.buildCampaign({
      ...input,
      chronicleId: chronicleRef.id,
      createdAt: now,
      updatedAt: now
    }));
    await batch.commit();
    return ref.id;
  },

  archiveCampaign(campaignId, userId) {
    if (typeof v2AuthorityService === 'undefined') {
      throw new Error('Autorité serveur indisponible');
    }
    return v2AuthorityService.archiveCampaign(campaignId);
  },

  restoreCampaign(campaignId) {
    return this._ref(this._contracts().PATHS.campaign(campaignId)).update({
      archivedAt: null,
      archivedBy: null,
      updatedAt: this._serverTimestamp()
    });
  },

  async createCharacter(input, sheet) {
    const C = this._contracts();
    const db = this._db();
    const ref = db.collection('characters').doc();
    const now = this._serverTimestamp();
    const batch = db.batch();
    batch.set(ref, C.buildCharacter({ ...input, createdAt: now, updatedAt: now }));
    batch.set(this._ref(C.PATHS.characterSheet(ref.id)), {
      schemaVersion: C.SCHEMA_VERSION,
      ...(sheet || {}),
      updatedAt: now
    });
    await batch.commit();
    return ref.id;
  },

  async joinCampaignWithCharacter(input) {
    if (typeof v2AuthorityService === 'undefined') {
      throw new Error('Autorité serveur indisponible');
    }
    return v2AuthorityService.joinCampaignWithCharacter(
      input.campaignId,
      input.characterId
    );
  },

  setLiveSession(tableId, input) {
    const C = this._contracts();
    const data = C.buildLiveSession({
      ...input,
      status: C.SESSION_STATUS.ACTIVE,
      startedAt: this._serverTimestamp()
    });
    return this._ref(C.PATHS.tableLive(tableId)).set(data);
  },

  endLiveSession(tableId, userId) {
    const C = this._contracts();
    return this._ref(C.PATHS.tableLive(tableId)).set(
      C.buildLiveSession({
        status: C.SESSION_STATUS.INACTIVE,
        endedBy: userId,
        endedAt: this._serverTimestamp()
      })
    );
  },

  publishCharacterProjection(campaignId, input) {
    const C = this._contracts();
    const data = C.buildPublicCharacter({
      ...input,
      updatedAt: this._serverTimestamp()
    });
    return this._ref(C.PATHS.publicCharacter(campaignId, data.characterId)).set(data);
  }
};
