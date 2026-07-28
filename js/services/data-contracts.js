// ═════════════════════════════════════════════════════════════════════════════
// CONTRATS DE DONNÉES V2
// Module pur : aucune dépendance DOM/Firebase. Utilisable dans le navigateur
// (window.DataContracts) et dans les tests Node (module.exports).
// ═════════════════════════════════════════════════════════════════════════════
(function initDataContracts(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.DataContracts = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildContracts() {
  'use strict';

  const SCHEMA_VERSION = 2;

  const TABLE_ROLES = Object.freeze({
    OWNER: 'owner',
    GM: 'gm',
    PLAYER: 'player'
  });

  const SESSION_STATUS = Object.freeze({
    ACTIVE: 'active',
    INACTIVE: 'inactive'
  });

  const VISIBILITY = Object.freeze({
    GM: 'gm',
    OWNER: 'owner',
    GROUP: 'group'
  });

  const IDENTIFICATION = Object.freeze({
    UNKNOWN: 'unknown',
    PARTIAL: 'partial',
    IDENTIFIED: 'identified'
  });

  const DISCOVERY_TYPES = Object.freeze({
    CLUE: 'clue',
    ARTIFACT: 'artifact',
    QUEST_ITEM: 'quest_item'
  });

  const PATHS = Object.freeze({
    userTable: (userId, tableId) =>
      `users/${requiredId(userId, 'userId')}/tables/${requiredId(tableId, 'tableId')}`,
    table: tableId => `tables/${requiredId(tableId, 'tableId')}`,
    tableMember: (tableId, userId) =>
      `tables/${requiredId(tableId, 'tableId')}/members/${requiredId(userId, 'userId')}`,
    tableLive: tableId => `tables/${requiredId(tableId, 'tableId')}/live/current`,
    tableNpc: (tableId, npcId) =>
      `tables/${requiredId(tableId, 'tableId')}/npcs/${requiredId(npcId, 'npcId')}`,
    tableItemModel: (tableId, modelId) =>
      `tables/${requiredId(tableId, 'tableId')}/itemModels/${requiredId(modelId, 'modelId')}`,
    tableItemInstance: (tableId, itemId) =>
      `tables/${requiredId(tableId, 'tableId')}/itemInstances/${requiredId(itemId, 'itemId')}`,
    tableGmJournalEntry: (tableId, entryId) =>
      `tables/${requiredId(tableId, 'tableId')}/gmJournal/${requiredId(entryId, 'entryId')}`,
    campaign: campaignId => `campaigns/${requiredId(campaignId, 'campaignId')}`,
    campaignPlayer: (campaignId, userId) =>
      `campaigns/${requiredId(campaignId, 'campaignId')}/players/${requiredId(userId, 'userId')}`,
    campaignCharacter: (campaignId, characterId) =>
      `campaigns/${requiredId(campaignId, 'campaignId')}/characters/${requiredId(characterId, 'characterId')}`,
    publicCharacter: (campaignId, characterId) =>
      `campaigns/${requiredId(campaignId, 'campaignId')}/publicCharacters/${requiredId(characterId, 'characterId')}`,
    publicCombat: campaignId =>
      `campaigns/${requiredId(campaignId, 'campaignId')}/publicState/combat`,
    gmCampaign: campaignId =>
      `campaigns/${requiredId(campaignId, 'campaignId')}/gmData/core`,
    gmReserve: (campaignId, reserveId) =>
      `campaigns/${requiredId(campaignId, 'campaignId')}/gmReserve/${requiredId(reserveId, 'reserveId')}`,
    discovery: (campaignId, discoveryId) =>
      `campaigns/${requiredId(campaignId, 'campaignId')}/discoveries/${requiredId(discoveryId, 'discoveryId')}`,
    restProposal: (campaignId, proposalId) =>
      `campaigns/${requiredId(campaignId, 'campaignId')}/restProposals/${requiredId(proposalId, 'proposalId')}`,
    restParticipant: (campaignId, proposalId, userId) =>
      `campaigns/${requiredId(campaignId, 'campaignId')}/restProposals/${requiredId(proposalId, 'proposalId')}/participants/${requiredId(userId, 'userId')}`,
    character: characterId => `characters/${requiredId(characterId, 'characterId')}`,
    characterSheet: characterId =>
      `characters/${requiredId(characterId, 'characterId')}/sheet/current`,
    characterCampaignSnapshot: (characterId, campaignId) =>
      `characters/${requiredId(characterId, 'characterId')}/campaignSnapshots/${requiredId(campaignId, 'campaignId')}`,
    characterHistory: characterId =>
      `characters/${requiredId(characterId, 'characterId')}/history/content`,
    characterJourneyEvent: (characterId, eventId) =>
      `characters/${requiredId(characterId, 'characterId')}/journey/${requiredId(eventId, 'eventId')}`,
    characterPrivateNote: (characterId, noteId) =>
      `characters/${requiredId(characterId, 'characterId')}/privateNotes/${requiredId(noteId, 'noteId')}`,
    characterGmShare: (characterId, shareId) =>
      `characters/${requiredId(characterId, 'characterId')}/gmShares/${requiredId(shareId, 'shareId')}`,
    chronicle: chronicleId => `chronicles/${requiredId(chronicleId, 'chronicleId')}`,
    chronicleEntry: (chronicleId, entryId) =>
      `chronicles/${requiredId(chronicleId, 'chronicleId')}/entries/${requiredId(entryId, 'entryId')}`
  });

  function requiredId(value, label) {
    const id = String(value == null ? '' : value).trim();
    if (!id || id.includes('/')) throw new TypeError(`${label || 'id'} invalide`);
    return id;
  }

  function requiredString(value, label) {
    const text = String(value == null ? '' : value).trim();
    if (!text) throw new TypeError(`${label || 'texte'} requis`);
    return text;
  }

  function optionalString(value) {
    const text = String(value == null ? '' : value).trim();
    return text || null;
  }

  function optionalDiscoveryImage(value) {
    if (value == null) return null;
    if (!value || typeof value !== 'object') throw new TypeError('image invalide');
    const mime = String(value.mime || '');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(mime)) throw new TypeError('image.mime invalide');
    const width = Number(value.width), height = Number(value.height), size = Number(value.size);
    if (!Number.isInteger(width) || width < 1 || width > 1600) throw new TypeError('image.width invalide');
    if (!Number.isInteger(height) || height < 1 || height > 1600) throw new TypeError('image.height invalide');
    if (!Number.isInteger(size) || size < 1 || size > 245760) throw new TypeError('image.size invalide');
    return {
      mediaId: requiredId(value.mediaId, 'image.mediaId'),
      mime, width, height, size,
      alt: optionalString(value.alt)
    };
  }

  function assertEnum(value, values, label) {
    if (!Object.values(values).includes(value)) {
      throw new TypeError(`${label || 'valeur'} invalide`);
    }
    return value;
  }

  function uniqueIds(values, label) {
    if (!Array.isArray(values)) throw new TypeError(`${label || 'identifiants'} invalides`);
    return [...new Set(values.map(value => requiredId(value, label || 'id')))];
  }

  function buildTable(input) {
    const data = input || {};
    const ownerId = requiredId(data.ownerId, 'ownerId');
    return {
      schemaVersion: SCHEMA_VERSION,
      name: requiredString(data.name, 'name'),
      ownerId,
      inviteCode: optionalString(data.inviteCode),
      requiredPacks: data.requiredPacks && typeof data.requiredPacks === 'object'
        ? { ...data.requiredPacks }
        : {},
      archivedAt: data.archivedAt || null,
      createdAt: data.createdAt || null,
      updatedAt: data.updatedAt || null
    };
  }

  function buildTableMember(input) {
    const data = input || {};
    const role = assertEnum(data.role || TABLE_ROLES.PLAYER, TABLE_ROLES, 'role');
    return {
      schemaVersion: SCHEMA_VERSION,
      userId: requiredId(data.userId, 'userId'),
      role,
      displayNameSnapshot: requiredString(data.displayNameSnapshot || 'Membre', 'displayNameSnapshot'),
      avatarSnapshot: optionalString(data.avatarSnapshot),
      joinedAt: data.joinedAt || null,
      leftAt: data.leftAt || null
    };
  }

  function buildCampaign(input) {
    const data = input || {};
    return {
      schemaVersion: SCHEMA_VERSION,
      tableId: requiredId(data.tableId, 'tableId'),
      name: requiredString(data.name, 'name'),
      shortDescription: optionalString(data.shortDescription),
      description: optionalString(data.description),
      encumbranceMode: ['none', 'simple', 'detailed'].includes(data.encumbranceMode)
        ? data.encumbranceMode
        : 'detailed',
      chronicleId: data.chronicleId ? requiredId(data.chronicleId, 'chronicleId') : null,
      createdBy: requiredId(data.createdBy, 'createdBy'),
      createdAt: data.createdAt || null,
      updatedAt: data.updatedAt || null,
      archivedAt: data.archivedAt || null,
      archivedBy: data.archivedBy ? requiredId(data.archivedBy, 'archivedBy') : null
    };
  }

  function buildLiveSession(input) {
    const data = input || {};
    const status = assertEnum(data.status || SESSION_STATUS.INACTIVE, SESSION_STATUS, 'status');
    const active = status === SESSION_STATUS.ACTIVE;
    return {
      schemaVersion: SCHEMA_VERSION,
      status,
      campaignId: active ? requiredId(data.campaignId, 'campaignId') : null,
      startedBy: active ? requiredId(data.startedBy, 'startedBy') : null,
      startedAt: active ? data.startedAt || null : null,
      endedBy: active ? null : data.endedBy ? requiredId(data.endedBy, 'endedBy') : null,
      endedAt: active ? null : data.endedAt || null
    };
  }

  function buildCharacter(input) {
    const data = input || {};
    const identity = data.identity || {};
    return {
      schemaVersion: SCHEMA_VERSION,
      ownerId: requiredId(data.ownerId, 'ownerId'),
      identity: {
        name: requiredString(identity.name, 'identity.name'),
        portrait: optionalString(identity.portrait),
        race: optionalString(identity.race),
        background: optionalString(identity.background)
      },
      createdAt: data.createdAt || null,
      updatedAt: data.updatedAt || null,
      deletedAt: data.deletedAt || null,
      migratedFrom: optionalString(data.migratedFrom),
      duplicatedFrom: optionalString(data.duplicatedFrom),
      // Champ maintenu par les opérations serveur d'adhésion et de rôle.
      // Le propriétaire ne peut pas le modifier directement.
      gmAccessIds: uniqueIds(data.gmAccessIds || [], 'gmAccessId')
    };
  }

  function buildCampaignPlayer(input) {
    const data = input || {};
    const characterIds = uniqueIds(data.characterIds || [], 'characterId');
    const currentCharacterId = data.currentCharacterId
      ? requiredId(data.currentCharacterId, 'currentCharacterId')
      : null;
    if (currentCharacterId && !characterIds.includes(currentCharacterId)) {
      throw new TypeError('currentCharacterId doit appartenir à characterIds');
    }
    return {
      schemaVersion: SCHEMA_VERSION,
      userId: requiredId(data.userId, 'userId'),
      currentCharacterId,
      characterIds,
      joinedAt: data.joinedAt || null,
      leftAt: data.leftAt || null
    };
  }

  function buildCampaignCharacter(input) {
    const data = input || {};
    return {
      schemaVersion: SCHEMA_VERSION,
      characterId: requiredId(data.characterId, 'characterId'),
      ownerId: requiredId(data.ownerId, 'ownerId'),
      joinedAt: data.joinedAt || null,
      retiredAt: data.retiredAt || null,
      finalSnapshot: data.finalSnapshot || null
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PV TEMPORAIRES EFFECTIFS — point de calcul UNIQUE.
  //
  // Deux sources les alimentent, et il n'y en a jamais eu qu'une de lue :
  //   • `hpTemp`, le champ de la fiche (modèle : state.js) — saisi par le MJ,
  //     posé par certaines capacités de classe ;
  //   • les statuts qui accordent des PV (`stat === 'hp'`) — le préréglage
  //     « 💚 PV temp. (sort) » comme un statut personnalisé.
  //
  // Deux défauts corrigés ici (retour de test du 2026-07-26) :
  //   1. la projection publique lisait `sheet.tempHp || sheet.temporaryHp`, deux
  //      noms qui n'existent sur AUCUNE fiche → le panneau MJ n'affichait jamais
  //      les PV temporaires d'un joueur ;
  //   2. la somme des statuts était bien calculée côté fiche… puis jetée sans
  //      être utilisée → un statut « bonus de PV » n'avait aucun effet visible.
  //
  // ⚠️ Toute lecture des PV temporaires passe par ici — fiche, panneau MJ,
  // projection publique et migration. Ne pas recalculer la somme sur place :
  // c'est exactement la divergence qui a produit ces deux défauts.
  function temporaryHpOf(sheet) {
    const data = sheet || {};
    const fromStatuses = (Array.isArray(data.statuses) ? data.statuses : [])
      .filter(status => status && status.stat === 'hp')
      .reduce((total, status) => total + (parseInt(status.value, 10) || 0), 0);
    const base = Number(data.hpTemp);
    return Math.max(0, (Number.isFinite(base) ? base : 0) + fromStatuses);
  }

  function buildPublicCharacter(input) {
    const data = input || {};
    const hpMax = Math.max(1, Number(data.hpMax) || 1);
    return {
      schemaVersion: SCHEMA_VERSION,
      characterId: requiredId(data.characterId, 'characterId'),
      userId: requiredId(data.userId, 'userId'),
      name: requiredString(data.name, 'name'),
      portrait: optionalString(data.portrait),
      race: optionalString(data.race),
      classes: optionalString(data.classes),
      hp: Math.max(0, Number(data.hp) || 0),
      hpMax,
      temporaryHp: Math.max(0, Number(data.temporaryHp) || 0),
      conditions: Array.isArray(data.conditions) ? [...data.conditions] : [],
      concentration: data.concentration || null,
      inspiration: Boolean(data.inspiration),
      pendingInitiative: data.pendingInitiative == null
        ? null
        : Number(data.pendingInitiative),
      deathSaves: data.deathSaves && typeof data.deathSaves === 'object'
        ? { ...data.deathSaves }
        : null,
      actionLog: Array.isArray(data.actionLog)
        ? data.actionLog.slice(-40).map(entry => ({ ...entry }))
        : [],
      shared: data.shared && typeof data.shared === 'object' ? { ...data.shared } : {},
      updatedAt: data.updatedAt || null
    };
  }

  function buildLocalSession(input) {
    const data = input || {};
    const mode = data.mode === 'prepare' ? 'prepare' : 'play';
    return {
      schemaVersion: SCHEMA_VERSION,
      tableId: requiredId(data.tableId, 'tableId'),
      campaignId: requiredId(data.campaignId, 'campaignId'),
      characterId: mode === 'play' && data.characterId
        ? requiredId(data.characterId, 'characterId')
        : null,
      mode
    };
  }

  function buildItemInstance(input) {
    const data = input || {};
    const ownerType = ['none', 'character', 'sidekick', 'group'].includes(data.ownerType)
      ? data.ownerType
      : 'none';
    const ownerId = ownerType === 'none' || ownerType === 'group'
      ? null
      : requiredId(data.ownerId, 'ownerId');
    return {
      schemaVersion: SCHEMA_VERSION,
      modelId: requiredId(data.modelId, 'modelId'),
      tableId: requiredId(data.tableId, 'tableId'),
      ownerType,
      ownerId,
      carrierCharacterId: data.carrierCharacterId
        ? requiredId(data.carrierCharacterId, 'carrierCharacterId')
        : null,
      visibility: assertEnum(data.visibility || VISIBILITY.GM, VISIBILITY, 'visibility'),
      identification: assertEnum(
        data.identification || IDENTIFICATION.UNKNOWN,
        IDENTIFICATION,
        'identification'
      ),
      // Copie limitée à ce que le porteur a le droit de voir. Le modèle
      // complet reste réservé aux MJ dans itemModels.
      displayName: optionalString(data.displayName),
      displayDescription: optionalString(data.displayDescription),
      displayType: optionalString(data.displayType),
      displayRarity: optionalString(data.displayRarity),
      attunement: Boolean(data.attunement),
      quantity: Math.max(1, Math.trunc(Number(data.quantity) || 1)),
      charges: data.charges == null ? null : Math.max(0, Math.trunc(Number(data.charges) || 0)),
      equipped: Boolean(data.equipped),
      state: data.state && typeof data.state === 'object' ? { ...data.state } : {},
      createdAt: data.createdAt || null,
      updatedAt: data.updatedAt || null
    };
  }

  function buildItemModel(input) {
    const data = input || {};
    return {
      schemaVersion: SCHEMA_VERSION,
      tableId: requiredId(data.tableId, 'tableId'),
      name: requiredString(data.name, 'name'),
      type: optionalString(data.type),
      rarity: optionalString(data.rarity),
      description: optionalString(data.description),
      value: optionalString(data.value),
      magical: Boolean(data.magical),
      attunement: Boolean(data.attunement),
      createdBy: requiredId(data.createdBy, 'createdBy'),
      createdAt: data.createdAt || null,
      updatedAt: data.updatedAt || null
    };
  }

  function buildChronicle(input) {
    const data = input || {};
    return {
      schemaVersion: SCHEMA_VERSION,
      tableId: requiredId(data.tableId, 'tableId'),
      name: requiredString(data.name || 'Chronique', 'name'),
      createdBy: requiredId(data.createdBy, 'createdBy'),
      createdAt: data.createdAt || null,
      updatedAt: data.updatedAt || null
    };
  }

  function buildChronicleEntry(input) {
    const data = input || {};
    return {
      schemaVersion: SCHEMA_VERSION,
      campaignId: requiredId(data.campaignId, 'campaignId'),
      authorId: requiredId(data.authorId, 'authorId'),
      authorNameSnapshot: requiredString(data.authorNameSnapshot || 'Membre', 'authorNameSnapshot'),
      content: requiredString(data.content, 'content'),
      createdAt: data.createdAt || null,
      updatedAt: data.updatedAt || null
    };
  }

  function buildReserveEntry(input) {
    const data = input || {};
    return {
      schemaVersion: SCHEMA_VERSION,
      type: assertEnum(data.type || DISCOVERY_TYPES.CLUE, DISCOVERY_TYPES, 'type'),
      title: requiredString(data.title, 'title'),
      content: optionalString(data.content),
      source: optionalString(data.source),
      material: optionalString(data.material),
      privateNote: optionalString(data.privateNote),
      linkedItemId: data.linkedItemId ? requiredId(data.linkedItemId, 'linkedItemId') : null,
      image: optionalDiscoveryImage(data.image),
      status: ['pending', 'revealed', 'archived'].includes(data.status)
        ? data.status
        : 'pending',
      createdBy: requiredId(data.createdBy, 'createdBy'),
      createdAt: data.createdAt || null,
      updatedAt: data.updatedAt || null
    };
  }

  function buildDiscovery(input) {
    const data = input || {};
    return {
      schemaVersion: SCHEMA_VERSION,
      type: assertEnum(data.type || DISCOVERY_TYPES.CLUE, DISCOVERY_TYPES, 'type'),
      title: requiredString(data.title, 'title'),
      content: optionalString(data.content),
      source: optionalString(data.source),
      material: optionalString(data.material),
      image: optionalDiscoveryImage(data.image),
      revealedBy: requiredId(data.revealedBy, 'revealedBy'),
      revealedAt: data.revealedAt || null,
      reserveEntryId: data.reserveEntryId
        ? requiredId(data.reserveEntryId, 'reserveEntryId')
        : null
    };
  }

  function buildGmJournalEntry(input) {
    const data = input || {};
    const state = ['notes', 'pinned', 'archived'].includes(data.state)
      ? data.state
      : 'notes';
    const linkType = ['npc', 'item', 'campaign', 'character'].includes(data.linkType)
      ? data.linkType
      : null;
    return {
      schemaVersion: SCHEMA_VERSION,
      campaignId: data.campaignId ? requiredId(data.campaignId, 'campaignId') : null,
      authorId: requiredId(data.authorId, 'authorId'),
      title: optionalString(data.title),
      content: requiredString(data.content, 'content'),
      state,
      linkType,
      linkId: linkType && data.linkId ? requiredId(data.linkId, 'linkId') : null,
      createdAt: data.createdAt || null,
      updatedAt: data.updatedAt || null
    };
  }

  function buildRestProposal(input) {
    const data = input || {};
    const type = data.type === 'long' ? 'long' : data.type === 'short' ? 'short' : null;
    if (!type) throw new TypeError('type de repos invalide');
    return {
      schemaVersion: SCHEMA_VERSION,
      type,
      status: 'proposed',
      requestedBy: requiredId(data.requestedBy, 'requestedBy'),
      requestedByName: requiredString(data.requestedByName || 'Membre', 'requestedByName'),
      requestedAt: data.requestedAt || null,
      decidedBy: null,
      decidedAt: null
    };
  }

  function buildRestParticipation(input) {
    const data = input || {};
    const hitDiceSpent = {};
    if (data.hitDiceSpent && typeof data.hitDiceSpent === 'object') {
      Object.entries(data.hitDiceSpent).forEach(([className, amount]) => {
        const key = String(className || '').trim().slice(0, 80);
        if (key) hitDiceSpent[key] = Math.max(0, Math.trunc(Number(amount) || 0));
      });
    }
    return {
      schemaVersion: SCHEMA_VERSION,
      userId: requiredId(data.userId, 'userId'),
      participates: Boolean(data.participates),
      healing: Math.max(0, Math.trunc(Number(data.healing) || 0)),
      hitDiceSpent,
      answeredAt: data.answeredAt || null
    };
  }

  return Object.freeze({
    SCHEMA_VERSION,
    TABLE_ROLES,
    SESSION_STATUS,
    VISIBILITY,
    IDENTIFICATION,
    DISCOVERY_TYPES,
    PATHS,
    buildTable,
    buildTableMember,
    buildCampaign,
    buildLiveSession,
    buildCharacter,
    buildCampaignPlayer,
    buildCampaignCharacter,
    buildPublicCharacter,
    temporaryHpOf,
    buildLocalSession,
    buildItemInstance,
    buildChronicle,
    buildChronicleEntry,
    buildReserveEntry,
    buildDiscovery,
    buildGmJournalEntry,
    buildRestProposal,
    buildRestParticipation,
    buildItemModel
  });
});
