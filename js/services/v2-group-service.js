// Accès V2 aux données partagées et aux espaces réservés aux MJ.
// Les écrans historiques ne l'utilisent que lorsque le mode V2 local est actif.
const v2GroupService = {
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

  async createChronicle(input) {
    const C = this._contracts();
    const ref = this._db().collection('chronicles').doc();
    const now = this._timestamp();
    await ref.set(C.buildChronicle({ ...input, createdAt: now, updatedAt: now }));
    return ref.id;
  },

  async listTableChronicles(tableId) {
    const snapshot = await this._db().collection('chronicles')
      .where('tableId', '==', tableId)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  listenChronicleEntries(chronicleId, callback, onError) {
    return this._db()
      .collection('chronicles')
      .doc(chronicleId)
      .collection('entries')
      .orderBy('createdAt', 'asc')
      .onSnapshot(callback, onError || (() => {}));
  },

  async listChronicleEntries(chronicleId) {
    const snapshot = await this._db()
      .collection('chronicles')
      .doc(chronicleId)
      .collection('entries')
      .orderBy('createdAt', 'asc')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async addChronicleEntry(chronicleId, input) {
    const C = this._contracts();
    const ref = this._db().collection('chronicles').doc(chronicleId)
      .collection('entries').doc();
    const now = this._timestamp();
    await ref.set(C.buildChronicleEntry({ ...input, createdAt: now, updatedAt: now }));
    return ref.id;
  },

  updateChronicleEntry(chronicleId, entryId, content) {
    if (!String(content || '').trim()) throw new TypeError('content requis');
    return this._ref(this._contracts().PATHS.chronicleEntry(chronicleId, entryId)).update({
      content: String(content).trim(),
      updatedAt: this._timestamp()
    });
  },

  deleteChronicleEntry(chronicleId, entryId) {
    return this._ref(
      this._contracts().PATHS.chronicleEntry(chronicleId, entryId)
    ).delete();
  },

  listenDiscoveries(campaignId, callback, onError) {
    return this._db().collection('campaigns').doc(campaignId)
      .collection('discoveries').orderBy('revealedAt', 'asc')
      .onSnapshot(callback, onError || (() => {}));
  },

  async listDiscoveries(campaignId) {
    const snapshot = await this._db().collection('campaigns').doc(campaignId)
      .collection('discoveries').orderBy('revealedAt', 'asc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async addDiscovery(campaignId, input) {
    const C = this._contracts();
    const ref = this._db().collection('campaigns').doc(campaignId)
      .collection('discoveries').doc();
    await ref.set(C.buildDiscovery({
      ...input,
      revealedAt: this._timestamp()
    }));
    return ref.id;
  },

  deleteDiscovery(campaignId, discoveryId) {
    return this._ref(
      this._contracts().PATHS.discovery(campaignId, discoveryId)
    ).delete();
  },

  async returnDiscoveryToReserve(campaignId, discoveryId, userId) {
    const C = this._contracts();
    const db = this._db();
    const discoveryRef = this._ref(C.PATHS.discovery(campaignId, discoveryId));
    await db.runTransaction(async transaction => {
      const discoverySnap = await transaction.get(discoveryRef);
      if (!discoverySnap.exists) throw new Error('Découverte introuvable');
      const discovery = discoverySnap.data();
      const reserveCollection = db.collection('campaigns').doc(campaignId)
        .collection('gmReserve');
      const reserveRef = discovery.reserveEntryId
        ? reserveCollection.doc(discovery.reserveEntryId)
        : reserveCollection.doc();
      const reserveSnap = discovery.reserveEntryId
        ? await transaction.get(reserveRef)
        : null;
      const now = this._timestamp();
      if (reserveSnap?.exists) {
        transaction.update(reserveRef, { status: 'pending', updatedAt: now });
      } else {
        transaction.set(reserveRef, C.buildReserveEntry({
          type: discovery.type,
          title: discovery.title,
          content: discovery.content || null,
          source: discovery.source || null,
          material: discovery.material || null,
          image: discovery.image || null,
          status: 'pending',
          createdBy: userId,
          createdAt: now,
          updatedAt: now
        }));
      }
      transaction.delete(discoveryRef);
    });
    return discoveryId;
  },

  listenReserve(campaignId, callback, onError) {
    return this._db().collection('campaigns').doc(campaignId)
      .collection('gmReserve').orderBy('createdAt', 'asc')
      .onSnapshot(callback, onError || (() => {}));
  },

  async addReserveEntry(campaignId, input) {
    const C = this._contracts();
    const ref = this._db().collection('campaigns').doc(campaignId)
      .collection('gmReserve').doc();
    const now = this._timestamp();
    await ref.set(C.buildReserveEntry({ ...input, createdAt: now, updatedAt: now }));
    return ref.id;
  },

  async revealReserveEntry(campaignId, reserveEntryId, userId) {
    const C = this._contracts();
    const db = this._db();
    const reserveRef = this._ref(C.PATHS.gmReserve(campaignId, reserveEntryId));
    const discoveryRef = db.collection('campaigns').doc(campaignId)
      .collection('discoveries').doc();
    await db.runTransaction(async transaction => {
      const reserveSnap = await transaction.get(reserveRef);
      if (!reserveSnap.exists) throw new Error('Élément de réserve introuvable');
      const reserve = reserveSnap.data();
      transaction.set(discoveryRef, C.buildDiscovery({
        ...reserve,
        revealedBy: userId,
        revealedAt: this._timestamp(),
        reserveEntryId
      }));
      transaction.update(reserveRef, {
        status: 'revealed',
        revealedAt: this._timestamp(),
        updatedAt: this._timestamp()
      });
    });
    return discoveryRef.id;
  },

  deleteReserveEntry(campaignId, reserveEntryId) {
    return this._ref(
      this._contracts().PATHS.gmReserve(campaignId, reserveEntryId)
    ).delete();
  },

  listenGmJournal(tableId, callback, onError) {
    return this._db().collection('tables').doc(tableId)
      .collection('gmJournal').orderBy('updatedAt', 'desc')
      .onSnapshot(callback, onError || (() => {}));
  },

  async addGmJournalEntry(tableId, input) {
    const C = this._contracts();
    const ref = this._db().collection('tables').doc(tableId)
      .collection('gmJournal').doc();
    const now = this._timestamp();
    await ref.set(C.buildGmJournalEntry({ ...input, createdAt: now, updatedAt: now }));
    return ref.id;
  },

  updateGmJournalEntry(tableId, entryId, patch) {
    const C = this._contracts();
    const allowed = {};
    if (Object.prototype.hasOwnProperty.call(patch || {}, 'title')) {
      allowed.title = String(patch.title || '').trim() || null;
    }
    if (Object.prototype.hasOwnProperty.call(patch || {}, 'content')) {
      const content = String(patch.content || '').trim();
      if (!content) throw new TypeError('content requis');
      allowed.content = content;
    }
    if (Object.prototype.hasOwnProperty.call(patch || {}, 'state')) {
      if (!['notes', 'pinned', 'archived'].includes(patch.state)) {
        throw new TypeError('État de note invalide');
      }
      allowed.state = patch.state;
    }
    if (Object.prototype.hasOwnProperty.call(patch || {}, 'campaignId')) {
      allowed.campaignId = patch.campaignId || null;
    }
    if (Object.prototype.hasOwnProperty.call(patch || {}, 'linkType')) {
      allowed.linkType = patch.linkType || null;
      allowed.linkId = patch.linkType && patch.linkId ? patch.linkId : null;
    }
    if (!Object.keys(allowed).length) throw new TypeError('Aucune modification');
    allowed.updatedAt = this._timestamp();
    return this._ref(C.PATHS.tableGmJournalEntry(tableId, entryId))
      .update(allowed);
  },

  deleteGmJournalEntry(tableId, entryId) {
    return this._ref(
      this._contracts().PATHS.tableGmJournalEntry(tableId, entryId)
    ).delete();
  },

  updateReserveEntry(campaignId, reserveEntryId, patch) {
    const allowed = { updatedAt: this._timestamp() };
    if (Object.prototype.hasOwnProperty.call(patch || {}, 'status')) {
      if (!['pending', 'revealed', 'archived'].includes(patch.status)) {
        throw new TypeError('État de réserve invalide');
      }
      allowed.status = patch.status;
    }
    if (Object.prototype.hasOwnProperty.call(patch || {}, 'privateNote')) {
      allowed.privateNote = String(patch.privateNote || '').trim() || null;
    }
    if (Object.prototype.hasOwnProperty.call(patch || {}, 'linkedItemId')) {
      allowed.linkedItemId = patch.linkedItemId || null;
    }
    return this._ref(this._contracts().PATHS.gmReserve(campaignId, reserveEntryId))
      .update(allowed);
  }
};
