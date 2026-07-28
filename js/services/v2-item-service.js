// Objets V2 : un modèle décrit l'objet, un exemplaire porte possession et état.
const v2ItemService = {
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

  async giveToCharacter(tableId, characterId, item, options) {
    const db = this._db();
    const C = this._contracts();
    const modelRef = db.collection('tables').doc(tableId).collection('itemModels').doc();
    const instanceRef = db.collection('tables').doc(tableId).collection('itemInstances').doc();
    const now = this._timestamp();
    const identification = options.identification || C.IDENTIFICATION.UNKNOWN;
    const display = identification === C.IDENTIFICATION.UNKNOWN
      ? {
          displayName: 'Objet non identifié',
          displayDescription: null,
          displayType: 'Objet',
          displayRarity: null
        }
      : identification === C.IDENTIFICATION.PARTIAL
        ? {
            displayName: item.name,
            displayDescription: null,
            displayType: item.type || null,
            displayRarity: item.rarity || null
          }
        : {
            displayName: item.name,
            displayDescription: item.desc || null,
            displayType: item.type || null,
            displayRarity: item.rarity || null
          };
    const batch = db.batch();
    batch.set(modelRef, C.buildItemModel({
      tableId,
      name: item.name,
      type: item.type,
      rarity: item.rarity,
      description: item.desc,
      value: item.value == null ? null : String(item.value),
      magical: item.type === 'Objet magique' || Boolean(item.magic),
      attunement: Boolean(item.attunement),
      createdBy: options.createdBy,
      createdAt: now,
      updatedAt: now
    }));
    batch.set(instanceRef, C.buildItemInstance({
      tableId,
      modelId: modelRef.id,
      ownerType: 'character',
      ownerId: characterId,
      carrierCharacterId: characterId,
      visibility: options.visibility,
      identification,
      ...display,
      attunement: Boolean(item.attunement),
      quantity: 1,
      charges: item.charges,
      equipped: false,
      state: {},
      createdAt: now,
      updatedAt: now
    }));
    await batch.commit();
    return { modelId: modelRef.id, instanceId: instanceRef.id };
  },

  async giveToGroup(tableId, carrierCharacterId, item, options) {
    const db = this._db();
    const C = this._contracts();
    const modelRef = db.collection('tables').doc(tableId).collection('itemModels').doc();
    const instanceRef = db.collection('tables').doc(tableId).collection('itemInstances').doc();
    const now = this._timestamp();
    const identification = options.identification || C.IDENTIFICATION.UNKNOWN;
    const display = this._revealedFields({
      name: item.name,
      description: item.desc,
      type: item.type,
      rarity: item.rarity
    }, identification);
    const batch = db.batch();
    batch.set(modelRef, C.buildItemModel({
      tableId,
      name: item.name,
      type: item.type,
      rarity: item.rarity,
      description: item.desc,
      value: item.value == null ? null : String(item.value),
      magical: item.type === 'Objet magique' || Boolean(item.magic),
      attunement: Boolean(item.attunement),
      createdBy: options.createdBy,
      createdAt: now,
      updatedAt: now
    }));
    batch.set(instanceRef, C.buildItemInstance({
      tableId,
      modelId: modelRef.id,
      ownerType: 'group',
      ownerId: null,
      carrierCharacterId: carrierCharacterId || null,
      visibility: 'group',
      identification,
      ...display,
      attunement: Boolean(item.attunement),
      quantity: 1,
      charges: item.charges,
      equipped: false,
      state: {},
      createdAt: now,
      updatedAt: now
    }));
    await batch.commit();
    return { modelId: modelRef.id, instanceId: instanceRef.id };
  },

  listenForCharacter(tableId, characterId, callback, onError) {
    const collection = this._db().collection('tables').doc(tableId)
      .collection('itemInstances');
    const snapshots = { owner: [], group: [], collective: [] };
    const emit = () => callback({
      docs: [...snapshots.owner, ...snapshots.group, ...snapshots.collective]
    });
    const fail = onError || (() => {});
    // Deux requêtes explicites : les règles peuvent alors prouver la visibilité
    // de chaque résultat sans ouvrir le modèle secret.
    const unsubscribeOwner = collection
      .where('ownerType', '==', 'character')
      .where('ownerId', '==', characterId)
      .where('visibility', '==', 'owner')
      .onSnapshot(snapshot => {
        snapshots.owner = snapshot.docs;
        emit();
      }, fail);
    const unsubscribeGroup = collection
      .where('ownerId', '==', characterId)
      .where('visibility', '==', 'group')
      .onSnapshot(snapshot => {
        snapshots.group = snapshot.docs;
        emit();
      }, fail);
    const unsubscribeCollective = collection
      .where('ownerType', '==', 'group')
      .where('visibility', '==', 'group')
      .onSnapshot(snapshot => {
        snapshots.collective = snapshot.docs;
        emit();
      }, fail);
    return () => {
      unsubscribeOwner();
      unsubscribeGroup();
      unsubscribeCollective();
    };
  },

  toInventoryItem(doc) {
    const data = typeof doc.data === 'function' ? doc.data() : doc;
    const id = doc.id || data.id;
    return {
      _v2InstanceId: id,
      name: data.displayName || 'Objet non identifié',
      desc: data.displayDescription || '',
      qty: Math.max(0, Number(data.quantity) || 0),
      itemType: data.displayType || 'Objet',
      rarity: data.displayRarity || '',
      attunement: Boolean(data.attunement),
      attuned: Boolean(data.state && data.state.attuned),
      charges: data.charges == null ? null : Math.max(0, Number(data.charges) || 0),
      chargesUsed: Math.max(0, Number(data.state && data.state.chargesUsed) || 0),
      equipped: Boolean(data.equipped),
      _v2PendingTransferId: data.pendingTransferId || null,
      _v2OwnerType: data.ownerType || 'character',
      _v2CarrierCharacterId: data.carrierCharacterId || null,
      _v2History: Array.isArray(data.history) ? data.history : [],
      _v2Identification: data.identification || 'unknown',
      _v2Visibility: data.visibility || 'owner'
    };
  },

  listenIncomingTransfers(tableId, userId, callback, onError) {
    return this._db().collection('tables').doc(tableId)
      .collection('itemTransfers')
      .where('toUserId', '==', userId)
      .onSnapshot(snapshot => {
        callback(snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(transfer => transfer.status === 'pending'));
      }, onError || (() => {}));
  },

  updateOwnedState(tableId, instanceId, patch) {
    return v2AuthorityService.updateOwnedItemState(tableId, instanceId, patch);
  },

  proposeTransfer(tableId, instanceId, targetCharacterId) {
    return v2AuthorityService.proposeItemTransfer(
      tableId,
      instanceId,
      targetCharacterId
    );
  },

  decideTransfer(tableId, transferId, accepted) {
    return v2AuthorityService.decideItemTransfer(
      tableId,
      transferId,
      accepted
    );
  },

  async listDistributed(tableId) {
    const db = this._db();
    const snapshot = await db.collection('tables').doc(tableId)
      .collection('itemInstances').get();
    return Promise.all(snapshot.docs.map(async instanceDoc => {
      const instance = instanceDoc.data();
      const [modelDoc, ownerDoc] = await Promise.all([
        db.collection('tables').doc(tableId).collection('itemModels')
          .doc(instance.modelId).get(),
        instance.ownerId
          ? db.collection('characters').doc(instance.ownerId).get()
          : Promise.resolve(null)
      ]);
      const model = modelDoc.exists ? modelDoc.data() : {};
      const owner = ownerDoc && ownerDoc.exists ? ownerDoc.data() : {};
      return {
        id: instanceDoc.id,
        ...instance,
        model,
        ownerName: owner.identity && owner.identity.name
          ? owner.identity.name
          : instance.ownerId || 'Groupe'
      };
    }));
  },

  _revealedFields(model, identification) {
    if (identification === 'unknown') {
      return {
        displayName: 'Objet non identifié',
        displayDescription: null,
        displayType: 'Objet',
        displayRarity: null
      };
    }
    if (identification === 'partial') {
      return {
        displayName: model.name,
        displayDescription: null,
        displayType: model.type || null,
        displayRarity: model.rarity || null
      };
    }
    return {
      displayName: model.name,
      displayDescription: model.description || null,
      displayType: model.type || null,
      displayRarity: model.rarity || null
    };
  },

  async updateDisclosure(tableId, instanceId, patch) {
    const db = this._db();
    const instanceRef = db.collection('tables').doc(tableId)
      .collection('itemInstances').doc(instanceId);
    const instanceDoc = await instanceRef.get();
    if (!instanceDoc.exists) throw new Error('Exemplaire introuvable');
    const instance = instanceDoc.data();
    const update = { updatedAt: this._timestamp() };
    if (patch.visibility) update.visibility = patch.visibility;
    if (patch.identification) {
      const modelDoc = await db.collection('tables').doc(tableId)
        .collection('itemModels').doc(instance.modelId).get();
      if (!modelDoc.exists) throw new Error('Modèle d’objet introuvable');
      update.identification = patch.identification;
      Object.assign(update, this._revealedFields(modelDoc.data(), patch.identification));
    }
    await instanceRef.update(update);
  },

  async revoke(tableId, instanceId) {
    const db = this._db();
    const instanceRef = db.collection('tables').doc(tableId)
      .collection('itemInstances').doc(instanceId);
    const instanceDoc = await instanceRef.get();
    if (!instanceDoc.exists) return;
    const batch = db.batch();
    batch.delete(instanceRef);
    if (instanceDoc.data().modelId) {
      batch.delete(db.collection('tables').doc(tableId)
        .collection('itemModels').doc(instanceDoc.data().modelId));
    }
    await batch.commit();
  }
};
