// ═════════════════════════════════════════════════════════════════════════════
// MIGRATION PROGRESSIVE V1 → V2
// Par défaut, ce service ne fait qu'un audit. execute:true doit être demandé
// explicitement et n'est destiné qu'à un projet Firebase de test avant validation.
// ═════════════════════════════════════════════════════════════════════════════
const v2MigrationService = {
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

  _legacyCharacterId(legacyDocId) {
    const safe = String(legacyDocId || '').replace(/[^A-Za-z0-9_-]/g, '_');
    if (!safe) throw new Error('Identifiant historique invalide');
    return `legacy_${safe}`;
  },

  _classesLabel(characterData) {
    return ((characterData && characterData.classes) || [])
      .map(entry => `${entry.name || '?'} ${entry.level || 1}`)
      .join(' / ');
  },

  _rootFromLegacy(docId, legacy, gmAccessIds) {
    const C = this._contracts();
    const sheet = (legacy && legacy.characterData) || {};
    return C.buildCharacter({
      ownerId: legacy.userId,
      identity: {
        name: sheet.charName || sheet.name || 'Personnage',
        portrait: sheet.portrait || null,
        race: sheet.race || null,
        background: sheet.background || null
      },
      migratedFrom: `characters/${docId}`,
      gmAccessIds: gmAccessIds || []
    });
  },

  _projectionFromLegacy(characterId, legacy) {
    const C = this._contracts();
    const sheet = legacy.characterData || {};
    return C.buildPublicCharacter({
      characterId,
      userId: legacy.userId,
      name: sheet.charName || sheet.name || 'Personnage',
      portrait: sheet.portrait || null,
      race: sheet.race || null,
      classes: this._classesLabel(sheet),
      hp: sheet.hp,
      hpMax: sheet.hpMax,
      temporaryHp: C.temporaryHpOf(sheet),
      conditions: sheet.conditions || [],
      concentration: sheet.concentration || null,
      inspiration: sheet.inspiration || false
    });
  },

  async _gmAccessIdsForLegacy(legacy) {
    const db = this._db();
    let tableId = legacy.tableId || null;
    if (!tableId && legacy.campaignId) {
      const campaign = await db.doc(`campaigns/${legacy.campaignId}`).get();
      tableId = campaign.exists ? campaign.data().tableId || null : null;
    }
    if (!tableId) return [];
    const members = await db.collection(`tables/${tableId}/members`).get();
    return members.docs
      .filter(doc => {
        const member = doc.data() || {};
        return member.leftAt == null && (member.role === 'owner' || member.role === 'gm');
      })
      .map(doc => doc.id);
  },

  async inspectLegacyCharacters() {
    const snapshot = await this._db().collection('characters').get();
    const report = {
      totalDocuments: snapshot.size,
      playerDocuments: 0,
      gmDocuments: 0,
      alreadyMigrated: 0,
      invalid: [],
      candidates: []
    };
    snapshot.docs.forEach(doc => {
      const data = doc.data() || {};
      if (doc.id.endsWith('_mj')) {
        report.gmDocuments++;
        return;
      }
      report.playerDocuments++;
      if (data.migratedTo) {
        report.alreadyMigrated++;
        return;
      }
      if (!data.userId || !data.campaignId || !data.characterData) {
        report.invalid.push({
          docId: doc.id,
          reason: 'userId, campaignId ou characterData manquant'
        });
        return;
      }
      report.candidates.push({
        legacyDocId: doc.id,
        characterId: this._legacyCharacterId(doc.id),
        userId: data.userId,
        tableId: data.tableId || null,
        campaignId: data.campaignId,
        name: data.characterData.charName || data.characterData.name || 'Personnage'
      });
    });
    return report;
  },

  async inspectLegacyTables() {
    const db = this._db();
    const tables = await db.collection('tables').get();
    const report = {
      totalTables: tables.size,
      alreadyV2: 0,
      invalid: [],
      candidates: []
    };
    for (const tableDoc of tables.docs) {
      const table = tableDoc.data() || {};
      if (table.schemaVersion === this._contracts().SCHEMA_VERSION) {
        report.alreadyV2++;
        continue;
      }
      const ownerId = table.ownerId || table.mjId;
      if (!ownerId) {
        report.invalid.push({ tableId: tableDoc.id, reason: 'ownerId/mjId manquant' });
        continue;
      }
      const memberIds = [...new Set([ownerId, ...(table.memberIds || [])])];
      const campaigns = await db
        .collection('campaigns')
        .where('tableId', '==', tableDoc.id)
        .get();
      report.candidates.push({
        tableId: tableDoc.id,
        name: table.name || 'Table',
        ownerId,
        memberCount: memberIds.length,
        campaignCount: campaigns.size
      });
    }
    return report;
  },

  async migrateLegacyTables(options) {
    const opts = options || {};
    if (opts.execute !== true) {
      return { dryRun: true, ...(await this.inspectLegacyTables()) };
    }
    if (opts.confirmation !== 'MIGRER_TABLES_V2_TEST') {
      throw new Error('Confirmation de migration des tables de test manquante');
    }
    const C = this._contracts();
    const db = this._db();
    const tables = await db.collection('tables').get();
    const result = { dryRun: false, migrated: [], skipped: [], failed: [] };
    for (const tableDoc of tables.docs) {
      const table = tableDoc.data() || {};
      if (table.schemaVersion === C.SCHEMA_VERSION) {
        result.skipped.push(tableDoc.id);
        continue;
      }
      const ownerId = table.ownerId || table.mjId;
      if (!ownerId) {
        result.failed.push({ tableId: tableDoc.id, reason: 'propriétaire absent' });
        continue;
      }
      try {
        const campaigns = await db
          .collection('campaigns')
          .where('tableId', '==', tableDoc.id)
          .get();
        const memberIds = [...new Set([ownerId, ...(table.memberIds || [])])];
        if ((memberIds.length * 2) + campaigns.size + 1 > 450) {
          throw new Error('table trop volumineuse pour un batch unique');
        }
        const batch = db.batch();
        const now = this._serverTimestamp();
        batch.set(
          tableDoc.ref,
          {
            schemaVersion: C.SCHEMA_VERSION,
            ownerId,
            archivedAt: table.archivedAt || null,
            updatedAt: now,
            migratedFromSchema: 1
          },
          { merge: true }
        );
        memberIds.forEach(userId => {
          const role = userId === ownerId ? C.TABLE_ROLES.OWNER : C.TABLE_ROLES.PLAYER;
          batch.set(
            db.doc(C.PATHS.tableMember(tableDoc.id, userId)),
            C.buildTableMember({
              userId,
              role,
              displayNameSnapshot:
                (table.memberNames && table.memberNames[userId]) ||
                (userId === ownerId ? table.mjName : null) ||
                'Membre',
              avatarSnapshot:
                (table.memberAvatars && table.memberAvatars[userId]) ||
                (userId === ownerId ? table.mjAvatar : null),
              joinedAt: table.createdAt || now,
              leftAt: null
            })
          );
          batch.set(db.doc(C.PATHS.userTable(userId, tableDoc.id)), {
            schemaVersion: C.SCHEMA_VERSION,
            tableId: tableDoc.id,
            role,
            leftAt: null,
            updatedAt: now
          });
        });
        campaigns.docs.forEach(campaignDoc => {
          const campaign = campaignDoc.data() || {};
          const wasFinished = campaign.status === 'finished';
          batch.set(
            campaignDoc.ref,
            {
              schemaVersion: C.SCHEMA_VERSION,
              createdBy: campaign.createdBy || campaign.ownerId || ownerId,
              archivedAt: campaign.archivedAt || (wasFinished ? now : null),
              archivedBy: campaign.archivedBy || (wasFinished ? ownerId : null),
              updatedAt: now,
              migratedFromStatus: campaign.status || null
            },
            { merge: true }
          );
        });
        await batch.commit();
        result.migrated.push({
          tableId: tableDoc.id,
          memberCount: memberIds.length,
          campaignCount: campaigns.size
        });
      } catch (error) {
        result.failed.push({
          tableId: tableDoc.id,
          reason: error && error.message ? error.message : String(error)
        });
      }
    }
    return result;
  },

  async migrateLegacyCharacters(options) {
    const opts = options || {};
    if (opts.execute !== true) {
      return {
        dryRun: true,
        ...(await this.inspectLegacyCharacters())
      };
    }
    if (opts.confirmation !== 'MIGRER_VERS_V2_TEST') {
      throw new Error('Confirmation de migration de test manquante');
    }

    const C = this._contracts();
    const db = this._db();
    const snapshot = await db.collection('characters').get();
    const result = { dryRun: false, migrated: [], skipped: [], failed: [] };

    // Un batch par personnage : l'échec d'une fiche ne bloque pas toutes les autres
    // et chaque fiche reste atomique avec ses participations et sa projection.
    for (const doc of snapshot.docs) {
      const legacy = doc.data() || {};
      if (doc.id.endsWith('_mj') || legacy.migratedTo) {
        result.skipped.push(doc.id);
        continue;
      }
      if (!legacy.userId || !legacy.campaignId || !legacy.characterData) {
        result.failed.push({ docId: doc.id, reason: 'document incomplet' });
        continue;
      }
      try {
        const characterId = this._legacyCharacterId(doc.id);
        const root = this._rootFromLegacy(
          doc.id,
          legacy,
          await this._gmAccessIdsForLegacy(legacy)
        );
        const projection = this._projectionFromLegacy(characterId, legacy);
        const now = this._serverTimestamp();
        const batch = db.batch();
        const characterRef = db.doc(C.PATHS.character(characterId));
        const sheetRef = db.doc(C.PATHS.characterSheet(characterId));
        const playerRef = db.doc(
          C.PATHS.campaignPlayer(legacy.campaignId, legacy.userId)
        );
        const participationRef = db.doc(
          C.PATHS.campaignCharacter(legacy.campaignId, characterId)
        );
        const publicRef = db.doc(
          C.PATHS.publicCharacter(legacy.campaignId, characterId)
        );

        batch.set(characterRef, {
          ...root,
          createdAt: legacy.createdAt || now,
          updatedAt: now
        });
        batch.set(sheetRef, {
          schemaVersion: C.SCHEMA_VERSION,
          ...legacy.characterData,
          resources: typeof v2DataService !== 'undefined'
            ? v2DataService._buildRestResources(legacy.characterData)
            : {},
          updatedAt: now
        });
        batch.set(
          playerRef,
          C.buildCampaignPlayer({
            userId: legacy.userId,
            currentCharacterId: characterId,
            characterIds: [characterId],
            joinedAt: legacy.createdAt || now,
            leftAt: legacy.leftCampaign ? legacy.updatedAt || now : null
          }),
          { merge: true }
        );
        batch.set(
          participationRef,
          C.buildCampaignCharacter({
            characterId,
            ownerId: legacy.userId,
            joinedAt: legacy.createdAt || now,
            retiredAt: legacy.leftCampaign ? legacy.updatedAt || now : null
          })
        );
        batch.set(publicRef, { ...projection, updatedAt: now });
        batch.update(doc.ref, {
          migratedTo: C.PATHS.character(characterId),
          migratedAt: now
        });
        await batch.commit();
        result.migrated.push({ legacyDocId: doc.id, characterId });
      } catch (error) {
        result.failed.push({
          docId: doc.id,
          reason: error && error.message ? error.message : String(error)
        });
      }
    }
    return result;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = v2MigrationService;
}
