// Notes du personnage : stockage séparé selon leur véritable audience.
const v2CharacterNotesService = {
  _db() {
    if (typeof fbDb === 'undefined' || !fbDb) throw new Error('Firestore indisponible');
    return fbDb;
  },
  _collection(characterId, visibility) {
    const name = visibility === 'gm' ? 'gmShares' : 'privateNotes';
    return this._db().collection('characters').doc(characterId).collection(name);
  },
  _timestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
  },

  async list(characterId) {
    const [privateSnap, gmSnap] = await Promise.all([
      this._collection(characterId, 'private').orderBy('createdAt', 'desc').get(),
      this._collection(characterId, 'gm').orderBy('createdAt', 'desc').get()
    ]);
    const map = (snap, visibility) => snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      visibility
    }));
    return [...map(privateSnap, 'private'), ...map(gmSnap, 'gm')]
      .sort((a, b) => {
        const av = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
        const bv = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
        return av - bv;
      });
  },

  add(characterId, visibility, input) {
    if (!['private', 'gm'].includes(visibility)) throw new Error('Destination de note invalide');
    const now = this._timestamp();
    return this._collection(characterId, visibility).add({
      schemaVersion: 2,
      title: String(input.title || '').trim() || null,
      date: String(input.date || '').trim() || null,
      content: String(input.content || '').trim(),
      authorId: input.authorId,
      createdAt: now,
      updatedAt: now
    });
  },

  remove(characterId, visibility, noteId) {
    return this._collection(characterId, visibility).doc(noteId).delete();
  }
};
