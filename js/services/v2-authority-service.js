// Autorité V2 Spark : transactions Firestore directes côté navigateur.
const v2AuthorityService = {
  _db() {
    if (typeof fbDb === 'undefined' || !fbDb) throw new Error('Firestore indisponible');
    return fbDb;
  },

  _uid() {
    if (typeof currentUser === 'undefined' || !currentUser || !currentUser.uid) {
      throw new Error('Connexion requise');
    }
    return currentUser.uid;
  },

  _timestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
  },

  async createInvite(tableId, code) {
    const db = this._db();
    const uid = this._uid();
    const normalized = String(code || '').trim().toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(normalized)) {
      throw new TypeError('Le code doit contenir exactement 6 lettres ou chiffres');
    }
    const tableRef = db.collection('tables').doc(tableId);
    const inviteRef = db.collection('inviteCodes').doc(normalized);
    await db.runTransaction(async transaction => {
      const [tableSnap, inviteSnap] = await Promise.all([
        transaction.get(tableRef),
        transaction.get(inviteRef)
      ]);
      if (!tableSnap.exists) throw new Error('Table introuvable');
      if (tableSnap.data().ownerId !== uid) {
        throw new Error('Seul le propriétaire peut créer une invitation');
      }
      if (inviteSnap.exists && inviteSnap.data().tableId !== tableId) {
        throw new Error('Ce code est déjà utilisé');
      }
      const now = this._timestamp();
      transaction.set(inviteRef, {
        schemaVersion: 2,
        tableId,
        createdBy: uid,
        createdAt: now,
        expiresAt: firebase.firestore.Timestamp.fromMillis(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        )
      });
      transaction.update(tableRef, { inviteCode: normalized, updatedAt: now });
    });
    return { ok: true, code: normalized };
  },

  async joinTable(code, profile) {
    const db = this._db();
    const uid = this._uid();
    const normalized = String(code || '').trim().toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(normalized)) throw new TypeError('Code invalide');
    const inviteRef = db.collection('inviteCodes').doc(normalized);
    let tableId = null;
    await db.runTransaction(async transaction => {
      const inviteSnap = await transaction.get(inviteRef);
      if (!inviteSnap.exists) throw new Error('Code invalide');
      const invite = inviteSnap.data();
      if (invite.expiresAt && invite.expiresAt.toMillis() < Date.now()) {
        throw new Error('Ce code a expiré');
      }
      tableId = String(invite.tableId || '');
      if (!tableId) throw new Error('Invitation invalide');
      const tableRef = db.collection('tables').doc(tableId);
      const memberRef = tableRef.collection('members').doc(uid);
      const userTableRef = db.collection('users').doc(uid).collection('tables').doc(tableId);
      const [tableSnap, memberSnap] = await Promise.all([
        transaction.get(tableRef),
        transaction.get(memberRef)
      ]);
      if (!tableSnap.exists || tableSnap.data().archivedAt != null) {
        throw new Error('Cette table n’est pas disponible');
      }
      const previous = memberSnap.exists ? memberSnap.data() : {};
      const role = previous.role === 'gm' ? 'gm' : 'player';
      const now = this._timestamp();
      transaction.set(memberRef, {
        schemaVersion: 2,
        userId: uid,
        role,
        displayNameSnapshot: String(profile && profile.displayName || 'Membre')
          .trim().slice(0, 80) || 'Membre',
        avatarSnapshot: String(profile && profile.avatar || '').trim().slice(0, 16) || null,
        joinedAt: previous.joinedAt || now,
        leftAt: null
      });
      transaction.set(userTableRef, {
        schemaVersion: 2,
        tableId,
        role,
        inviteCode: normalized,
        leftAt: null,
        updatedAt: now
      });
    });
    return { ok: true, tableId };
  },

  async joinCampaignWithCharacter(campaignId, characterId) {
    const db = this._db();
    const uid = this._uid();
    const campaignRef = db.collection('campaigns').doc(campaignId);
    const characterRef = db.collection('characters').doc(characterId);
    const sheetRef = characterRef.collection('sheet').doc('current');
    const playerRef = campaignRef.collection('players').doc(uid);
    const participationRef = campaignRef.collection('characters').doc(characterId);
    const projectionRef = campaignRef.collection('publicCharacters').doc(characterId);
    const campaignSnap = await campaignRef.get();
    if (!campaignSnap.exists || campaignSnap.data().archivedAt != null) {
      throw new Error('Cette campagne n’est pas disponible');
    }
    const tableId = String(campaignSnap.data().tableId || '');
    const gmMembers = await db.collection('tables').doc(tableId)
      .collection('members').where('leftAt', '==', null).get();
    const gmIds = gmMembers.docs
      .filter(doc => ['owner', 'gm'].includes(doc.data().role))
      .map(doc => doc.id);
    await db.runTransaction(async transaction => {
      const memberRef = db.collection('tables').doc(tableId).collection('members').doc(uid);
      const [memberSnap, characterSnap, sheetSnap, playerSnap, ...grantSnaps] =
        await Promise.all([
          transaction.get(memberRef),
          transaction.get(characterRef),
          transaction.get(sheetRef),
          transaction.get(playerRef),
          ...gmIds.map(gmId =>
            transaction.get(characterRef.collection('gmAccess').doc(gmId))
          )
        ]);
      if (!memberSnap.exists || memberSnap.data().leftAt != null) {
        throw new Error('Membre actif introuvable');
      }
      if (!characterSnap.exists || characterSnap.data().ownerId !== uid) {
        throw new Error('Ce personnage ne vous appartient pas');
      }
      if (!sheetSnap.exists) throw new Error('Fiche introuvable');
      const previous = playerSnap.exists ? playerSnap.data() : {};
      const characterIds = Array.from(new Set([
        ...(Array.isArray(previous.characterIds) ? previous.characterIds : []),
        characterId
      ]));
      const now = this._timestamp();
      const sheet = sheetSnap.data() || {};
      transaction.set(playerRef, {
        schemaVersion: 2,
        userId: uid,
        currentCharacterId: characterId,
        characterIds,
        joinedAt: previous.joinedAt || now,
        leftAt: null
      });
      transaction.set(participationRef, {
        schemaVersion: 2,
        characterId,
        ownerId: uid,
        joinedAt: now,
        retiredAt: null
      }, { merge: true });
      transaction.set(projectionRef, {
        schemaVersion: 2,
        characterId,
        userId: uid,
        name: String(sheet.charName || sheet.name || 'Personnage').slice(0, 120),
        portrait: sheet.portrait || null,
        race: sheet.race || null,
        classes: (sheet.classes || []).map(entry =>
          `${entry.name || '?'} ${entry.level || 1}`
        ).join(' / '),
        hp: Number(sheet.hp) || 0,
        hpMax: Math.max(1, Number(sheet.hpMax) || 1),
        temporaryHp: Math.max(0, Number(sheet.hpTemp || sheet.tempHp
          || sheet.temporaryHp) || 0),
        conditions: Array.isArray(sheet.conditions) ? sheet.conditions : [],
        concentration: sheet.concentration || null,
        inspiration: Boolean(sheet.inspiration),
        updatedAt: now
      }, { merge: true });
      gmIds.forEach((gmId, index) => {
        const previousGrant = grantSnaps[index].exists ? grantSnaps[index].data() : {};
        const campaignIds = Array.from(new Set([
          ...(Array.isArray(previousGrant.campaignIds) ? previousGrant.campaignIds : []),
          campaignId
        ]));
        transaction.set(characterRef.collection('gmAccess').doc(gmId), {
          schemaVersion: 2,
          gmId,
          tableId,
          campaignIds,
          grantedBy: uid,
          updatedAt: now
        });
      });
    });
    return { ok: true, campaignId, characterId };
  },

  async leaveCampaign(campaignId) {
    const db = this._db();
    const uid = this._uid();
    const campaignRef = db.collection('campaigns').doc(campaignId);
    const playerRef = campaignRef.collection('players').doc(uid);
    await db.runTransaction(async transaction => {
      const [campaignSnap, playerSnap] = await Promise.all([
        transaction.get(campaignRef),
        transaction.get(playerRef)
      ]);
      if (!campaignSnap.exists || !playerSnap.exists || playerSnap.data().leftAt != null) {
        throw new Error('Participation active introuvable');
      }
      const characterId = String(playerSnap.data().currentCharacterId || '');
      if (!characterId) throw new Error('Personnage courant introuvable');
      const participationRef = campaignRef.collection('characters').doc(characterId);
      const projectionRef = campaignRef.collection('publicCharacters').doc(characterId);
      const now = this._timestamp();
      transaction.update(playerRef, { leftAt: now });
      transaction.set(participationRef, { retiredAt: now }, { merge: true });
      transaction.delete(projectionRef);
    });
    return { ok: true, campaignId };
  },

  async removeCharacterFromCampaign(campaignId, characterId) {
    const db = this._db();
    const uid = this._uid();
    const campaignRef = db.collection('campaigns').doc(campaignId);
    const participationRef = campaignRef.collection('characters').doc(characterId);
    await db.runTransaction(async transaction => {
      const [campaignSnap, participationSnap] = await Promise.all([
        transaction.get(campaignRef),
        transaction.get(participationRef)
      ]);
      if (!campaignSnap.exists || !participationSnap.exists) {
        throw new Error('Participation introuvable');
      }
      const tableId = String(campaignSnap.data().tableId || '');
      const gmRef = db.collection('tables').doc(tableId).collection('members').doc(uid);
      const gmSnap = await transaction.get(gmRef);
      if (!gmSnap.exists || gmSnap.data().leftAt != null
        || !['owner', 'gm'].includes(gmSnap.data().role)) {
        throw new Error('Action réservée aux MJ');
      }
      const ownerId = String(
        participationSnap.data().ownerId || participationSnap.data().userId || ''
      );
      const playerRef = campaignRef.collection('players').doc(ownerId);
      const playerSnap = await transaction.get(playerRef);
      const now = this._timestamp();
      transaction.set(participationRef, { retiredAt: now }, { merge: true });
      transaction.delete(campaignRef.collection('publicCharacters').doc(characterId));
      if (playerSnap.exists && playerSnap.data().currentCharacterId === characterId) {
        transaction.update(playerRef, { leftAt: now });
      }
    });
    return { ok: true, campaignId, characterId };
  },

  async setMemberRole(tableId, userId, role) {
    if (!['gm', 'player'].includes(role)) throw new TypeError('Rôle invalide');
    const db = this._db();
    const uid = this._uid();
    if (uid === userId) throw new Error('Le propriétaire ne peut pas changer son propre rôle');
    const tableRef = db.collection('tables').doc(tableId);
    const memberRef = tableRef.collection('members').doc(userId);
    const userTableRef = db.collection('users').doc(userId).collection('tables').doc(tableId);
    await db.runTransaction(async transaction => {
      const [tableSnap, memberSnap] = await Promise.all([
        transaction.get(tableRef),
        transaction.get(memberRef)
      ]);
      if (!tableSnap.exists || tableSnap.data().ownerId !== uid) {
        throw new Error('Seul le propriétaire peut modifier un rôle');
      }
      if (!memberSnap.exists || memberSnap.data().leftAt != null) {
        throw new Error('Membre actif introuvable');
      }
      const now = this._timestamp();
      transaction.update(memberRef, { role, updatedAt: now });
      transaction.set(userTableRef, {
        schemaVersion: 2, tableId, role, leftAt: null, updatedAt: now
      }, { merge: true });
    });
    return { ok: true };
  },

  async removeMember(tableId, userId) {
    const db = this._db();
    const uid = this._uid();
    if (uid === userId) throw new Error('Le propriétaire ne peut pas s’exclure');
    const tableRef = db.collection('tables').doc(tableId);
    const memberRef = tableRef.collection('members').doc(userId);
    const userTableRef = db.collection('users').doc(userId).collection('tables').doc(tableId);
    await db.runTransaction(async transaction => {
      const [tableSnap, memberSnap] = await Promise.all([
        transaction.get(tableRef),
        transaction.get(memberRef)
      ]);
      if (!tableSnap.exists || tableSnap.data().ownerId !== uid) {
        throw new Error('Seul le propriétaire peut exclure un membre');
      }
      if (!memberSnap.exists || memberSnap.data().leftAt != null) {
        throw new Error('Membre actif introuvable');
      }
      const now = this._timestamp();
      transaction.update(memberRef, { leftAt: now, updatedAt: now });
      transaction.set(userTableRef, { leftAt: now, updatedAt: now }, { merge: true });
    });
    return { ok: true };
  },

  async leaveTable(tableId) {
    const db = this._db();
    const uid = this._uid();
    const tableRef = db.collection('tables').doc(tableId);
    const memberRef = tableRef.collection('members').doc(uid);
    const userTableRef = db.collection('users').doc(uid).collection('tables').doc(tableId);
    await db.runTransaction(async transaction => {
      const [tableSnap, memberSnap] = await Promise.all([
        transaction.get(tableRef),
        transaction.get(memberRef)
      ]);
      if (!tableSnap.exists || !memberSnap.exists || memberSnap.data().leftAt != null) {
        throw new Error('Membre actif introuvable');
      }
      if (tableSnap.data().ownerId === uid || memberSnap.data().role === 'owner') {
        throw new Error('Transférez la propriété avant de quitter la table');
      }
      const now = this._timestamp();
      transaction.update(memberRef, { leftAt: now, updatedAt: now });
      transaction.set(userTableRef, { leftAt: now, updatedAt: now }, { merge: true });
    });
    return { ok: true };
  },

  async transferOwnership(tableId, userId) {
    const db = this._db();
    const uid = this._uid();
    if (uid === userId) return { ok: true };
    const tableRef = db.collection('tables').doc(tableId);
    const currentRef = tableRef.collection('members').doc(uid);
    const nextRef = tableRef.collection('members').doc(userId);
    const currentIndexRef = db.collection('users').doc(uid).collection('tables').doc(tableId);
    const nextIndexRef = db.collection('users').doc(userId).collection('tables').doc(tableId);
    await db.runTransaction(async transaction => {
      const [tableSnap, currentSnap, nextSnap] = await Promise.all([
        transaction.get(tableRef),
        transaction.get(currentRef),
        transaction.get(nextRef)
      ]);
      if (!tableSnap.exists || tableSnap.data().ownerId !== uid
        || !currentSnap.exists || currentSnap.data().role !== 'owner') {
        throw new Error('Seul le propriétaire peut transférer la table');
      }
      if (!nextSnap.exists || nextSnap.data().leftAt != null) {
        throw new Error('Le nouveau propriétaire doit être un membre actif');
      }
      const now = this._timestamp();
      transaction.update(tableRef, { ownerId: userId, updatedAt: now });
      transaction.update(currentRef, { role: 'gm', updatedAt: now });
      transaction.update(nextRef, { role: 'owner', updatedAt: now });
      transaction.set(currentIndexRef, {
        schemaVersion: 2, tableId, role: 'gm', leftAt: null, updatedAt: now
      }, { merge: true });
      transaction.set(nextIndexRef, {
        schemaVersion: 2, tableId, role: 'owner', leftAt: null, updatedAt: now
      }, { merge: true });
    });
    return { ok: true };
  },

  approveRest(campaignId, proposalId) {
    return this._decideRest(campaignId, proposalId, 'approved');
  },

  finalizeRest(campaignId, proposalId) {
    return this.approveRest(campaignId, proposalId);
  },

  async proposeRest(campaignId, type) {
    if (!['short', 'long'].includes(type)) throw new TypeError('Type de repos invalide');
    const db = this._db();
    const uid = this._uid();
    const campaignRef = db.collection('campaigns').doc(campaignId);
    const proposalRef = campaignRef.collection('restProposals').doc();
    const participantRef = proposalRef.collection('participants').doc(uid);
    const lockRef = campaignRef.collection('publicState').doc('restLock');
    const combatRef = campaignRef.collection('publicState').doc('combat');
    await db.runTransaction(async transaction => {
      const [campaignSnap, lockSnap, combatSnap] = await Promise.all([
        transaction.get(campaignRef),
        transaction.get(lockRef),
        transaction.get(combatRef)
      ]);
      if (!campaignSnap.exists || campaignSnap.data().archivedAt != null) {
        throw new Error('Cette campagne n’est pas disponible');
      }
      if (lockSnap.exists && lockSnap.data().activeProposalId) {
        throw new Error('Un repos est déjà proposé au groupe');
      }
      if (combatSnap.exists && combatSnap.data().active === true) {
        throw new Error('Impossible de proposer un repos pendant un combat');
      }
      const tableId = String(campaignSnap.data().tableId || '');
      const memberRef = db.collection('tables').doc(tableId).collection('members').doc(uid);
      const playerRef = campaignRef.collection('players').doc(uid);
      const [memberSnap, playerSnap] = await Promise.all([
        transaction.get(memberRef),
        transaction.get(playerRef)
      ]);
      if (!memberSnap.exists || memberSnap.data().leftAt != null) {
        throw new Error('Membre actif introuvable');
      }
      if (memberSnap.data().role === 'player'
        && (!playerSnap.exists || playerSnap.data().leftAt != null)) {
        throw new Error('Participation active à la campagne requise');
      }
      const now = this._timestamp();
      transaction.set(proposalRef, {
        schemaVersion: 2,
        type,
        status: 'proposed',
        requestedBy: uid,
        requestedAt: now
      });
      transaction.set(participantRef, {
        schemaVersion: 2,
        userId: uid,
        participates: true,
        healing: 0,
        hitDiceSpent: {},
        answeredAt: now,
        appliedAt: null
      });
      transaction.set(lockRef, {
        schemaVersion: 2,
        activeProposalId: proposalRef.id,
        updatedAt: now
      });
    });
    return { ok: true, proposalId: proposalRef.id };
  },

  rejectRest(campaignId, proposalId) {
    return this._decideRest(campaignId, proposalId, 'rejected');
  },

  async _decideRest(campaignId, proposalId, status) {
    if (!['approved', 'rejected'].includes(status)) throw new TypeError('Décision invalide');
    const db = this._db();
    const uid = this._uid();
    const campaignRef = db.collection('campaigns').doc(campaignId);
    const proposalRef = campaignRef.collection('restProposals').doc(proposalId);
    const lockRef = campaignRef.collection('publicState').doc('restLock');
    await db.runTransaction(async transaction => {
      const [campaignSnap, proposalSnap, lockSnap] = await Promise.all([
        transaction.get(campaignRef),
        transaction.get(proposalRef),
        transaction.get(lockRef)
      ]);
      if (!campaignSnap.exists || !proposalSnap.exists
        || proposalSnap.data().status !== 'proposed') {
        throw new Error('Proposition de repos introuvable ou déjà close');
      }
      const tableId = String(campaignSnap.data().tableId || '');
      const gmRef = db.collection('tables').doc(tableId).collection('members').doc(uid);
      const gmSnap = await transaction.get(gmRef);
      if (!gmSnap.exists || gmSnap.data().leftAt != null
        || !['owner', 'gm'].includes(gmSnap.data().role)) {
        throw new Error('Action réservée aux MJ');
      }
      if (!lockSnap.exists || lockSnap.data().activeProposalId !== proposalId) {
        throw new Error('Verrou de repos incohérent');
      }
      const now = this._timestamp();
      transaction.update(proposalRef, {
        status,
        decidedBy: uid,
        decidedAt: now
      });
      transaction.set(lockRef, {
        schemaVersion: 2,
        activeProposalId: null,
        updatedAt: now
      });
    });
    return { ok: true, status };
  },

  async deleteArchivedCampaign(campaignId) {
    const db = this._db();
    const uid = this._uid();
    const ref = db.collection('campaigns').doc(campaignId);
    await db.runTransaction(async transaction => {
      const campaignSnap = await transaction.get(ref);
      if (!campaignSnap.exists) throw new Error('Campagne introuvable');
      const campaign = campaignSnap.data();
      const tableSnap = await transaction.get(db.collection('tables').doc(campaign.tableId));
      if (!tableSnap.exists || tableSnap.data().ownerId !== uid) {
        throw new Error('Seul le propriétaire peut supprimer une campagne');
      }
      if (!campaign.archivedAt) {
        throw new Error('La campagne doit être archivée avant sa suppression');
      }
      const now = this._timestamp();
      transaction.update(ref, { deletedAt: now, deletedBy: uid, updatedAt: now });
    });
    return { ok: true, charactersPreserved: true, recoverable: true };
  },

  async archiveCampaign(campaignId) {
    const db = this._db();
    const uid = this._uid();
    const campaignRef = db.collection('campaigns').doc(campaignId);
    await db.runTransaction(async transaction => {
      const campaignSnap = await transaction.get(campaignRef);
      if (!campaignSnap.exists) throw new Error('Campagne introuvable');
      const campaign = campaignSnap.data();
      const gmSnap = await transaction.get(
        db.collection('tables').doc(campaign.tableId).collection('members').doc(uid)
      );
      if (!gmSnap.exists || gmSnap.data().leftAt != null
        || !['owner', 'gm'].includes(gmSnap.data().role)) {
        throw new Error('Action réservée aux MJ');
      }
      if (campaign.archivedAt) throw new Error('Cette campagne est déjà archivée');
      const participations = await transaction.get(
        campaignRef.collection('characters')
      );
      if (participations.size > 100) {
        throw new Error('Trop de personnages pour archiver en une opération');
      }
      const publicSnapshots = await Promise.all(participations.docs.map(docSnap =>
        transaction.get(campaignRef.collection('publicCharacters').doc(docSnap.id))
      ));
      const sheetSnapshots = await Promise.all(participations.docs.map(docSnap =>
        transaction.get(
          db.collection('characters').doc(docSnap.id).collection('sheet').doc('current')
        )
      ));
      const archivedAt = firebase.firestore.Timestamp.now();
      const now = this._timestamp();
      participations.docs.forEach((docSnap, index) => {
        const participation = docSnap.data() || {};
        const publicData = publicSnapshots[index].exists
          ? publicSnapshots[index].data() : null;
        transaction.update(docSnap.ref, {
          finalSnapshot: publicData
            ? { ...publicData, archivedAt }
            : { characterId: docSnap.id, archivedAt },
          updatedAt: now
        });
        if (sheetSnapshots[index].exists) {
          transaction.set(
            db.collection('characters').doc(docSnap.id)
              .collection('campaignSnapshots').doc(campaignId),
            {
              schemaVersion: 2, campaignId, tableId: campaign.tableId,
              characterId: docSnap.id,
              ownerId: participation.ownerId
                || (publicData && publicData.userId) || null,
              archivedAt,
              sheet: sheetSnapshots[index].data()
            }
          );
        }
      });
      transaction.update(campaignRef, {
        archivedAt: now, archivedBy: uid, updatedAt: now
      });
    });
    return { ok: true };
  },

  async deleteOwnedCharacter(characterId) {
    const db = this._db();
    const uid = this._uid();
    const ref = db.collection('characters').doc(characterId);
    const [characterSnap, participations, snapshots, grants] = await Promise.all([
      ref.get(),
      db.collectionGroup('characters')
        .where('ownerId', '==', uid)
        .where('characterId', '==', characterId)
        .limit(1).get(),
      ref.collection('campaignSnapshots').limit(1).get(),
      ref.collection('gmAccess').limit(1).get()
    ]);
    if (!characterSnap.exists) throw new Error('Personnage introuvable');
    if (characterSnap.data().ownerId !== uid) {
      throw new Error('Seul le propriétaire peut supprimer ce personnage');
    }
    if (!participations.empty || !snapshots.empty || !grants.empty
      || (characterSnap.data().gmAccessIds || []).length) {
      throw new Error(
        'Ce personnage possède encore un historique de campagne et ne peut pas être supprimé'
      );
    }
    const now = this._timestamp();
    await ref.update({ deletedAt: now, deletedBy: uid, updatedAt: now });
    return { ok: true, recoverable: true };
  },

  async applyCorrection(campaignId, requestId) {
    const db = this._db();
    const uid = this._uid();
    const campaignRef = db.collection('campaigns').doc(campaignId);
    const correctionRef = campaignRef.collection('correctionRequests').doc(requestId);
    await db.runTransaction(async transaction => {
      const [campaignSnap, correctionSnap] = await Promise.all([
        transaction.get(campaignRef), transaction.get(correctionRef)
      ]);
      if (!campaignSnap.exists || !correctionSnap.exists) {
        throw new Error('Correction introuvable');
      }
      const correction = correctionSnap.data();
      const gmSnap = await transaction.get(
        db.collection('tables').doc(campaignSnap.data().tableId)
          .collection('members').doc(uid)
      );
      if (!gmSnap.exists || gmSnap.data().leftAt != null
        || !['owner', 'gm'].includes(gmSnap.data().role)) {
        throw new Error('Action réservée aux MJ');
      }
      if (correction.status !== 'pending') {
        throw new Error('Cette correction est déjà traitée');
      }
      const characterId = String(correction.characterId || '');
      if (!characterId) throw new Error('Personnage invalide');
      const characterRef = db.collection('characters').doc(characterId);
      const sheetRef = characterRef.collection('sheet').doc('current');
      const participationRef = campaignRef.collection('characters').doc(characterId);
      const accessRef = characterRef.collection('gmAccess').doc(uid);
      const [characterSnap, sheetSnap, participationSnap, accessSnap] = await Promise.all([
        transaction.get(characterRef), transaction.get(sheetRef),
        transaction.get(participationRef), transaction.get(accessRef)
      ]);
      if (!characterSnap.exists || !sheetSnap.exists
        || !participationSnap.exists || !accessSnap.exists) {
        throw new Error('Personnage, fiche ou autorisation introuvable');
      }
      if (correction.ownerId !== characterSnap.data().ownerId) {
        throw new Error('Propriétaire de la demande incohérent');
      }
      const now = this._timestamp();
      const eventRef = characterRef.collection('journey').doc();
      let journeyPayload;
      if (correction.kind === 'progression' && correction.proposedSheet) {
        const proposed = correction.proposedSheet;
        if (!proposed || typeof proposed !== 'object' || Array.isArray(proposed)
          || JSON.stringify(proposed).length > 750000) {
          throw new Error('Fiche proposée invalide ou trop volumineuse');
        }
        const levelOf = value => (value.classes || []).reduce(
          (sum, entry) => sum + Math.max(0, Number(entry.level) || 0), 0
        );
        const previousLevel = levelOf(sheetSnap.data());
        const nextLevel = levelOf(proposed);
        if (nextLevel !== previousLevel + 1) {
          throw new Error('Une validation de progression doit ajouter exactement un niveau');
        }
        const cleanSheet = {
          ...proposed,
          inventory: Array.isArray(proposed.inventory)
            ? proposed.inventory.filter(item => !item || !item._v2InstanceId) : [],
          schemaVersion: 2,
          lastGmEdit: { campaignId, by: uid, reason: 'progression', at: now },
          updatedAt: now
        };
        transaction.set(sheetRef, cleanSheet);
        transaction.set(campaignRef.collection('publicCharacters').doc(characterId), {
          schemaVersion: 2, characterId, userId: characterSnap.data().ownerId,
          name: proposed.charName || proposed.name || 'Personnage',
          portrait: proposed.portrait || null,
          race: proposed.race || null,
          classes: (proposed.classes || []).map(entry =>
            `${entry.name || '?'} ${entry.level || 1}`
          ).join(' / '),
          hp: Math.max(0, Number(proposed.hp) || 0),
          hpMax: Math.max(0, Number(proposed.hpMax) || 0),
          temporaryHp: Math.max(0, Number(
            proposed.tempHp == null ? proposed.temporaryHp : proposed.tempHp
          ) || 0),
          conditions: Array.isArray(proposed.conditions) ? proposed.conditions : [],
          concentration: proposed.concentration || null,
          inspiration: proposed.inspiration === true,
          updatedAt: now
        }, { merge: true });
        journeyPayload = {
          previousLevel, nextLevel, classes: proposed.classes || [],
          hpMethod: correction.hpMethod || null, choices: correction.patch || {}
        };
      } else {
        const allowed = [
          'abilities', 'classes', 'level', 'xp', 'milestones', 'proficiencies',
          'savingThrows', 'maxHpFormula', 'chosenFeatures', 'background'
        ];
        const patch = correction.patch;
        const keys = patch && typeof patch === 'object' && !Array.isArray(patch)
          ? Object.keys(patch) : [];
        if (!keys.length || keys.some(key => !allowed.includes(key))) {
          throw new Error('Champ de correction interdit');
        }
        const cleanPatch = Object.fromEntries(keys.map(key => [key, patch[key]]));
        transaction.set(sheetRef, {
          ...cleanPatch,
          lastGmEdit: { campaignId, by: uid, reason: 'correction', at: now },
          updatedAt: now
        }, { merge: true });
        journeyPayload = { patch: cleanPatch };
      }
      transaction.set(eventRef, {
        schemaVersion: 2,
        type: correction.kind === 'progression' ? 'progression' : 'correction',
        campaignId, correctionRequestId: requestId, ...journeyPayload,
        validatedBy: uid, createdAt: now
      });
      transaction.update(correctionRef, {
        status: 'applied', appliedBy: uid, appliedAt: now,
        journeyEventId: eventRef.id
      });
    });
    return { ok: true };
  },

  async rejectCorrection(campaignId, requestId) {
    const db = this._db();
    const uid = this._uid();
    const campaignRef = db.collection('campaigns').doc(campaignId);
    const correctionRef = campaignRef.collection('correctionRequests').doc(requestId);
    await db.runTransaction(async transaction => {
      const [campaignSnap, correctionSnap] = await Promise.all([
        transaction.get(campaignRef), transaction.get(correctionRef)
      ]);
      if (!campaignSnap.exists || !correctionSnap.exists) {
        throw new Error('Demande introuvable');
      }
      const gmSnap = await transaction.get(
        db.collection('tables').doc(campaignSnap.data().tableId)
          .collection('members').doc(uid)
      );
      if (!gmSnap.exists || gmSnap.data().leftAt != null
        || !['owner', 'gm'].includes(gmSnap.data().role)) {
        throw new Error('Action réservée aux MJ');
      }
      if (correctionSnap.data().status !== 'pending') {
        throw new Error('Cette demande est déjà traitée');
      }
      transaction.update(correctionRef, {
        status: 'rejected', rejectedBy: uid, rejectedAt: this._timestamp()
      });
    });
    return { ok: true };
  },

  async updateCharacterSheet(campaignId, characterId, sheet) {
    if (!sheet || typeof sheet !== 'object' || Array.isArray(sheet)) {
      throw new TypeError('Fiche invalide');
    }
    const db = this._db();
    const uid = this._uid();
    const campaignRef = db.collection('campaigns').doc(campaignId);
    const participationRef = campaignRef.collection('characters').doc(characterId);
    const characterRef = db.collection('characters').doc(characterId);
    const sheetRef = characterRef.collection('sheet').doc('current');
    const projectionRef = campaignRef.collection('publicCharacters').doc(characterId);
    const journeyRef = characterRef.collection('journey').doc();
    await db.runTransaction(async transaction => {
      const [campaignSnap, participationSnap, currentSheetSnap] = await Promise.all([
        transaction.get(campaignRef),
        transaction.get(participationRef),
        transaction.get(sheetRef)
      ]);
      if (!campaignSnap.exists || !participationSnap.exists || !currentSheetSnap.exists) {
        throw new Error('Campagne, participation ou fiche introuvable');
      }
      const gmSnap = await transaction.get(
        db.collection('tables').doc(campaignSnap.data().tableId)
          .collection('members').doc(uid)
      );
      if (!gmSnap.exists || gmSnap.data().leftAt != null
        || !['owner', 'gm'].includes(gmSnap.data().role)) {
        throw new Error('Action réservée aux MJ');
      }
      const ownerId = String(
        participationSnap.data().ownerId || participationSnap.data().userId || ''
      );
      if (!ownerId) throw new Error('Propriétaire introuvable');
      const now = this._timestamp();
      transaction.set(sheetRef, {
        ...sheet,
        schemaVersion: 2,
        lastGmEdit: { campaignId, by: uid, reason: 'gm-edit', at: now },
        updatedAt: now
      });
      transaction.set(projectionRef, {
        schemaVersion: 2, characterId, userId: ownerId,
        name: String(sheet.charName || sheet.name || 'Personnage').slice(0, 120),
        portrait: sheet.portrait || null,
        race: sheet.race || null,
        classes: (sheet.classes || []).map(entry =>
          `${entry.name || '?'} ${entry.level || 1}`
        ).join(' / '),
        hp: Number(sheet.hp) || 0,
        hpMax: Math.max(1, Number(sheet.hpMax) || 1),
        temporaryHp: Math.max(0, Number(
          sheet.tempHp == null ? sheet.temporaryHp : sheet.tempHp
        ) || 0),
        conditions: Array.isArray(sheet.conditions) ? sheet.conditions : [],
        concentration: sheet.concentration || null,
        inspiration: Boolean(sheet.inspiration),
        updatedAt: now
      }, { merge: true });
      const before = currentSheetSnap.data();
      const structuralKeys = [
        'abilities', 'classes', 'level', 'xp', 'milestones', 'proficiencies',
        'savingThrows', 'maxHpFormula', 'chosenFeatures', 'background'
      ];
      const changedFields = structuralKeys.filter(key =>
        JSON.stringify(before[key]) !== JSON.stringify(sheet[key])
      );
      if (changedFields.length) {
        transaction.set(journeyRef, {
          schemaVersion: 2, type: 'gm-correction', campaignId,
          changedFields, appliedBy: uid, validatedBy: uid, createdAt: now
        });
      }
    });
    return { ok: true, campaignId, characterId };
  },

  async updateCharacterVitals(campaignId, characterId, source) {
    const allowed = [
      'hp', 'hpMax', 'tempHp', 'temporaryHp', 'conditions', 'deathSaves', 'wildshape'
    ];
    if (!source || typeof source !== 'object' || Array.isArray(source)
      || Object.keys(source).some(key => !allowed.includes(key))) {
      throw new TypeError('État vital invalide');
    }
    const db = this._db();
    const uid = this._uid();
    const campaignRef = db.collection('campaigns').doc(campaignId);
    const participationRef = campaignRef.collection('characters').doc(characterId);
    const sheetRef = db.collection('characters').doc(characterId)
      .collection('sheet').doc('current');
    const projectionRef = campaignRef.collection('publicCharacters').doc(characterId);
    await db.runTransaction(async transaction => {
      const [campaignSnap, participationSnap, sheetSnap] = await Promise.all([
        transaction.get(campaignRef),
        transaction.get(participationRef),
        transaction.get(sheetRef)
      ]);
      if (!campaignSnap.exists || !participationSnap.exists || !sheetSnap.exists) {
        throw new Error('Campagne, participation ou fiche introuvable');
      }
      const gmSnap = await transaction.get(
        db.collection('tables').doc(campaignSnap.data().tableId)
          .collection('members').doc(uid)
      );
      if (!gmSnap.exists || gmSnap.data().leftAt != null
        || !['owner', 'gm'].includes(gmSnap.data().role)) {
        throw new Error('Action réservée aux MJ');
      }
      const sheetPatch = {
        lastGmEdit: {
          campaignId, by: uid, reason: 'vitals', at: this._timestamp()
        },
        updatedAt: this._timestamp()
      };
      const publicPatch = { updatedAt: this._timestamp() };
      if (Object.prototype.hasOwnProperty.call(source, 'hp')) {
        sheetPatch.hp = Math.max(0, Number(source.hp) || 0);
        publicPatch.hp = sheetPatch.hp;
      }
      if (Object.prototype.hasOwnProperty.call(source, 'hpMax')) {
        sheetPatch.hpMax = Math.max(1, Number(source.hpMax) || 1);
        publicPatch.hpMax = sheetPatch.hpMax;
      }
      if (Object.prototype.hasOwnProperty.call(source, 'tempHp')
        || Object.prototype.hasOwnProperty.call(source, 'temporaryHp')) {
        const value = Math.max(0, Number(
          source.tempHp == null ? source.temporaryHp : source.tempHp
        ) || 0);
        sheetPatch.tempHp = value;
        publicPatch.temporaryHp = value;
      }
      if (Object.prototype.hasOwnProperty.call(source, 'conditions')) {
        sheetPatch.conditions = Array.isArray(source.conditions)
          ? source.conditions.map(String).slice(0, 30) : [];
        publicPatch.conditions = sheetPatch.conditions;
      }
      if (Object.prototype.hasOwnProperty.call(source, 'deathSaves')) {
        sheetPatch.deathSaves = source.deathSaves
          && typeof source.deathSaves === 'object'
          ? source.deathSaves : { success: 0, fail: 0 };
        publicPatch.deathSaves = sheetPatch.deathSaves;
      }
      if (Object.prototype.hasOwnProperty.call(source, 'wildshape')) {
        sheetPatch.wildshape = source.wildshape
          && typeof source.wildshape === 'object' ? source.wildshape : null;
      }
      transaction.update(sheetRef, sheetPatch);
      transaction.set(projectionRef, publicPatch, { merge: true });
    });
    return { ok: true, campaignId, characterId };
  },

  async updateOwnedItemState(tableId, instanceId, source) {
    const db = this._db();
    const uid = this._uid();
    const ref = db.collection('tables').doc(tableId).collection('itemInstances').doc(instanceId);
    await db.runTransaction(async transaction => {
      const snap = await transaction.get(ref);
      if (!snap.exists) throw new Error('Objet introuvable');
      const item = snap.data();
      const characterId = item.ownerType === 'character'
        ? item.ownerId
        : item.ownerType === 'group' ? item.carrierCharacterId : null;
      if (!characterId) throw new Error('Cet objet ne peut pas être modifié par un joueur');
      const character = await transaction.get(db.collection('characters').doc(characterId));
      if (!character.exists || character.data().ownerId !== uid) {
        throw new Error('Cet objet ne vous appartient pas');
      }
      const patch = { updatedAt: this._timestamp() };
      const state = { ...(item.state || {}) };
      const changed = [];
      if (Object.prototype.hasOwnProperty.call(source || {}, 'attuned')) {
        state.attuned = Boolean(source.attuned);
        changed.push(state.attuned ? 'liaison' : 'rupture de liaison');
      }
      if (Object.prototype.hasOwnProperty.call(source || {}, 'chargesUsed')) {
        const max = Math.max(0, Number(item.charges) || 0);
        state.chargesUsed = Math.max(0, Math.min(
          max, Math.trunc(Number(source.chargesUsed) || 0)
        ));
        changed.push('charges');
      }
      if (Object.prototype.hasOwnProperty.call(source || {}, 'equipped')) {
        patch.equipped = Boolean(source.equipped);
        changed.push(patch.equipped ? 'équipement' : 'déséquipement');
      }
      if (Object.prototype.hasOwnProperty.call(source || {}, 'quantity')) {
        patch.quantity = Math.max(0, Math.trunc(Number(source.quantity) || 0));
        changed.push('consommation');
      }
      patch.state = state;
      if (changed.length) {
        patch.history = firebase.firestore.FieldValue.arrayUnion({
          type: changed.join(', '), by: uid, at: firebase.firestore.Timestamp.now()
        });
      }
      transaction.update(ref, patch);
    });
    return { ok: true };
  },

  async proposeItemTransfer(tableId, instanceId, targetCharacterId) {
    const db = this._db();
    const uid = this._uid();
    const table = db.collection('tables').doc(tableId);
    const itemRef = table.collection('itemInstances').doc(instanceId);
    const targetRef = db.collection('characters').doc(targetCharacterId);
    const transferRef = table.collection('itemTransfers').doc();
    await db.runTransaction(async transaction => {
      const [itemSnap, targetSnap] = await Promise.all([
        transaction.get(itemRef), transaction.get(targetRef)
      ]);
      if (!itemSnap.exists || !targetSnap.exists) {
        throw new Error('Objet ou destinataire introuvable');
      }
      const item = itemSnap.data();
      if (item.ownerType !== 'character' || !item.ownerId) {
        throw new Error('Cet objet ne peut pas être transféré');
      }
      const sourceSnap = await transaction.get(db.collection('characters').doc(item.ownerId));
      if (!sourceSnap.exists || sourceSnap.data().ownerId !== uid) {
        throw new Error('Cet objet ne vous appartient pas');
      }
      if (item.pendingTransferId) throw new Error('Un transfert est déjà en attente');
      const targetUserId = String(targetSnap.data().ownerId || '');
      if (!targetUserId) throw new Error('Destinataire invalide');
      if (targetUserId === uid && targetCharacterId === item.ownerId) {
        throw new Error('Choisissez un autre personnage');
      }
      const memberSnap = await transaction.get(table.collection('members').doc(targetUserId));
      if (!memberSnap.exists || memberSnap.data().leftAt != null) {
        throw new Error('Le destinataire doit être membre actif');
      }
      const now = this._timestamp();
      transaction.set(transferRef, {
        schemaVersion: 2, instanceId,
        displayName: item.displayName || 'Objet',
        fromCharacterId: item.ownerId, fromUserId: uid,
        toCharacterId: targetCharacterId, toUserId: targetUserId,
        status: 'pending', createdAt: now, updatedAt: now
      });
      transaction.update(itemRef, { pendingTransferId: transferRef.id, updatedAt: now });
    });
    return { ok: true, transferId: transferRef.id };
  },

  async decideItemTransfer(tableId, transferId, accepted) {
    const db = this._db();
    const uid = this._uid();
    const table = db.collection('tables').doc(tableId);
    const transferRef = table.collection('itemTransfers').doc(transferId);
    await db.runTransaction(async transaction => {
      const transferSnap = await transaction.get(transferRef);
      if (!transferSnap.exists) throw new Error('Transfert introuvable');
      const transfer = transferSnap.data();
      if (transfer.status !== 'pending') throw new Error('Ce transfert est déjà traité');
      if (transfer.toUserId !== uid) throw new Error('Ce transfert ne vous est pas destiné');
      const itemRef = table.collection('itemInstances').doc(transfer.instanceId);
      const itemSnap = await transaction.get(itemRef);
      if (!itemSnap.exists || itemSnap.data().pendingTransferId !== transferId) {
        throw new Error('L’objet n’est plus disponible');
      }
      const now = this._timestamp();
      const itemPatch = {
        pendingTransferId: firebase.firestore.FieldValue.delete(),
        updatedAt: now
      };
      if (accepted === true) {
        itemPatch.ownerType = 'character';
        itemPatch.ownerId = transfer.toCharacterId;
        itemPatch.carrierCharacterId = transfer.toCharacterId;
        itemPatch.equipped = false;
        itemPatch.state = { ...(itemSnap.data().state || {}), attuned: false };
        itemPatch.history = firebase.firestore.FieldValue.arrayUnion({
          type: 'transfert',
          fromCharacterId: transfer.fromCharacterId,
          toCharacterId: transfer.toCharacterId,
          by: uid,
          at: firebase.firestore.Timestamp.now()
        });
      }
      transaction.update(itemRef, itemPatch);
      transaction.update(transferRef, {
        status: accepted === true ? 'accepted' : 'rejected',
        decidedAt: now,
        updatedAt: now
      });
    });
    return { ok: true, accepted: accepted === true };
  }
};
