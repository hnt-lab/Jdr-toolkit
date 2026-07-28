// TAB: HISTORIQUE
// ═══════════════════════════════════════
// ═══════════════════════════════════════
// TAB: JOURNAL
// ═══════════════════════════════════════
function tabJournal(p){
  return isMJ()?tabJournalMJ():tabJournalPlayer(p);
}

let _v2PersonalNotes=null;
let _v2PersonalNotesCharacterId=null;

async function _loadV2PersonalNotes(){
  try{
    const characterId=(typeof currentSheetCharacterId!=='undefined'&&currentSheetCharacterId)
      ||currentCharacterId
      ||(currentCampaignId
        ?await v2CompatService.getCurrentCharacterId(currentCampaignId,currentUser.uid)
        :null);
    if(!characterId)throw new Error('Personnage courant introuvable');
    _v2PersonalNotesCharacterId=characterId;
    const notes=await v2CharacterNotesService.list(characterId);
    _v2PersonalNotes=notes.map(note=>({
      id:note.id,
      date:note.date||'',
      // ⚠️ Pas de repli « Sans titre » ICI : c'est un libellé d'AFFICHAGE, que
      // _journalEntriesList pose déjà. Le stocker dans la donnée le faisait
      // ressortir ailleurs — une note sans titre publiée dans la Chronique
      // s'y intitulait littéralement « Sans titre — … » (constaté le 25/07).
      sessionTitle:note.title||'',
      content:note.content||'',
      isPublic:false,
      sharedWithGm:note.visibility==='gm',
      _v2Visibility:note.visibility
    }));
    renderTab();
  }catch(e){
    _v2PersonalNotes=[];
    showToast('❌ Chargement des notes impossible : '+e.message);
    renderTab();
  }
}

// idPrefix préfixe TOUS les identifiants du formulaire, et il est transmis à la
// fonction d'ajout. C'est ce qui permet d'afficher ce même formulaire dans une
// modale ('qn') pendant qu'il est déjà présent dans la page ('j' ou 'mj') :
// sans préfixe distinct, getElementById lirait les champs de la page cachée
// derrière la modale, et le joueur enverrait un texte qu'il ne voit pas.
function _journalEntryForm(idPrefix,btnFn,roleMJ){
  const today=new Date().toISOString().slice(0,10);
  const isPlayerEntry=roleMJ===undefined?idPrefix==='j':!roleMJ;
  return`<div class="panel mb10">
    <div class="pt">📓 Nouvelle entrée</div>
    <div class="g2" style="gap:8px;margin-bottom:8px">
      <div><div class="fl mb6">Date</div><input class="fi" id="${idPrefix}Date" type="date" value="${today}"></div>
      <div><div class="fl mb6">Titre de session</div><input class="fi" id="${idPrefix}Title" placeholder="Ex: Session 3 — La mine" value="${esc(_journalDraft.title||'')}" oninput="_journalDraft.title=this.value"></div>
    </div>
    <div class="fl mb6">Notes${_journalDraft.content?'<span style="font-size:12px;color:var(--cp);margin-left:8px">● brouillon</span>':''}</div>
    <textarea class="fi mb6" id="${idPrefix}Content" rows="5" placeholder="Ce qui s'est passé ce soir..." style="resize:vertical" oninput="_journalDraft.content=this.value">${esc(_journalDraft.content||'')}</textarea>
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
      <label style="display:flex;align-items:center;gap:6px;font-size:13px;color:var(--text2)">
        <span>Destination</span>
        <select class="fi" id="${idPrefix}Visibility" style="width:auto;min-width:180px">
          <option value="private">${isPlayerEntry?'Moi uniquement':'Journal MJ uniquement'}</option>
          ${isPlayerEntry?'<option value="gm">Partager au MJ</option>':''}
          <option value="chronicle">Publier dans la Chronique</option>
        </select>
      </label>
      <button class="btn bac bsm" onclick="${btnFn}('${idPrefix}')">+ Ajouter</button>
    </div>
  </div>`;
}

// Formulaire de note du MJ (V2). Même rôle que _journalEntryForm côté joueur, et
// même raison d'être paramétré : il s'affiche dans l'onglet Journal MJ ('mj') ET
// dans la modale du raccourci 📓 ('qn'), qui peuvent coexister à l'écran.
function _mjJournalEntryForm(idPrefix){
  const pf=idPrefix||'mj';
  return`<div class="panel mb10">
    <div class="pt">📓 Journal du MJ</div>
    <div class="ds-note" style="margin-bottom:10px">Privé par défaut : visible des seuls MJ de la table. Une note peut aussi être publiée directement dans la Chronique, lue par tout le groupe.</div>
    <div class="fl mb6">Titre (facultatif)</div>
    <input class="fi" id="${pf}Title" placeholder="Ex: Idée pour la prochaine scène" style="margin-bottom:8px">
    <div class="fl mb6">Note</div>
    <textarea class="fi" id="${pf}Content" rows="3" placeholder="Note privée rapide…" style="resize:vertical;margin-bottom:8px"></textarea>
    <div class="g2" style="gap:8px;margin-bottom:8px">
      <label><span class="fl mb6">Destination</span>
        <select class="fi" id="${pf}Visibility">
          <option value="private">🔒 Journal MJ uniquement</option>
          <option value="chronicle">📜 Publier dans la Chronique</option>
        </select>
      </label>
      <label><span class="fl mb6">Portée</span>
        <select class="fi" id="${pf}JournalScope">
          <option value="campaign">Campagne actuelle</option>
          <option value="table">Toute la table</option>
        </select>
      </label>
      <label><span class="fl mb6">Lien facultatif</span>
        <select class="fi" id="${pf}JournalLinkType">
          <option value="">Aucun lien</option>
          <option value="npc">PNJ</option>
          <option value="item">Objet</option>
          <option value="campaign">Campagne</option>
          <option value="character">Personnage</option>
        </select>
      </label>
    </div>
    <input class="fi" id="${pf}JournalLinkId" placeholder="Identifiant du lien (facultatif)" style="margin-bottom:8px">
    <button class="btn bac" style="width:100%" onclick="addMJJournalEntry('${pf}')">+ Ajouter la note</button>
  </div>`;
}

// `publishFn` (facultatif) : nom d'une fonction JS recevant l'index de l'entrée.
// Fourni uniquement pour SES PROPRES notes — cette liste sert aussi à afficher
// les journaux d'autrui, où publier à leur place n'aurait aucun sens.
function _journalEntriesList(entries, deleteFn, publishFn){
  if(!entries||!entries.length) return`<div style="text-align:center;padding:24px;color:var(--text3);font-style:italic">Aucune entrée pour l'instant.</div>`;
  return`<div style="display:flex;flex-direction:column;gap:10px;max-height:520px;overflow-y:auto;padding-right:4px">
    ${[...entries].reverse().map((e,ri)=>{
      const realIdx=entries.length-1-ri;
      const visibility=e.isPublic?'chronicle':e.sharedWithGm?'gm':'private';
      const visibilityLabel=visibility==='chronicle'?'✓ Chronique':visibility==='gm'?'🎲 Partagé au MJ':'🔒 Moi uniquement';
      // Déjà dans la Chronique : plus rien à publier.
      const publier=publishFn&&visibility!=='chronicle'
        ?`<button class="btn bsm" style="color:var(--cp);border-color:rgba(200,168,75,.45);padding:1px 6px" onclick="${publishFn}(${realIdx})" title="Rendre cette note publique dans la Chronique">📜 Publier</button>`
        :'';
      return`<div class="journal-entry ${visibility==='chronicle'?'public':'private'}">
        <div class="journal-entry-meta">
          <div>
            <span class="journal-session">${esc(e.sessionTitle||'Sans titre')}</span>
            <span class="journal-date" style="margin-left:8px">${esc(e.date||'')}</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:12px;color:${visibility==='chronicle'?'var(--good)':visibility==='gm'?'var(--cp)':'var(--text3)'}">${visibilityLabel}</span>
            ${publier}
            <button class="btn bsm" style="color:var(--danger);border-color:var(--danger);padding:1px 6px" onclick="${deleteFn}(${realIdx})">✕</button>
          </div>
        </div>
        <div class="journal-content">${esc(e.content||'')}</div>
      </div>`;
    }).join('')}
  </div>`;
}

// Publier une note de personnage DÉJÀ écrite (pendant du bouton MJ, voir mj/journal.js).
// La note d'origine est conservée : la Chronique reçoit une copie signée du personnage.
function playerPublishToChronicle(idx){
  const v2=typeof v2CompatService!=='undefined'&&v2CompatService.isEnabled();
  const entries=v2?(_v2PersonalNotes||[]):((typeof P==='function'?P().journal:null)||[]);
  const e=entries[idx];
  if(!e)return;
  window._playerPendingChronicle=e;
  const apercu=(e.content||'').slice(0,160);
  openModal(`<div class="pt">📜 Publier dans la Chronique</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:12px">
      Cette entrée deviendra <b>visible par tout le groupe</b>. Elle <b>reste aussi dans ton journal</b>.
    </div>
    <div class="journal-content" style="white-space:pre-wrap;margin-bottom:14px;opacity:.85">${esc(apercu)}${(e.content||'').length>160?'…':''}</div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="playerConfirmPublishChronicle()">📜 Publier</button>
    </div>`);
}
async function playerConfirmPublishChronicle(){
  const e=window._playerPendingChronicle;
  window._playerPendingChronicle=null;
  if(!e)return;
  closeModal();
  const v2=typeof v2CompatService!=='undefined'&&v2CompatService.isEnabled();
  try{
    if(v2){
      await _journalWriteV2({asMJ:false,title:e.sessionTitle||'',content:e.content||'',visibility:'chronicle'});
    }else{
      // Chemin historique : la visibilité vit dans l'entrée elle-même.
      e.isPublic=true;e.sharedWithGm=false;
      saveAll();
    }
    renderTab();
    showToast('✅ Entrée publiée dans la Chronique.');
  }catch(err){showToast('❌ Publication impossible : '+err.message);}
}

function tabJournalPlayer(p){
  // REFONTE P3 : la Chronique a DÉMÉNAGÉ sur la page Groupe — plus de sous-onglet ici.
  // On garde le rendu chronicle pour l'arrivée via la page Groupe (openCampChronicle), avec un retour.
  if(_playerJournalSubTab==='chronicle'){
    return`<div><button class="ds-btn quiet" style="margin-bottom:10px" onclick="_playerJournalSubTab='entries';renderTab()">← Mes entrées</button>${renderChronicleView()}</div>`;
  }
  const v2NotesEnabled=typeof v2CompatService!=='undefined'&&v2CompatService.isEnabled()
    &&typeof v2CharacterNotesService!=='undefined';
  if(v2NotesEnabled&&_v2PersonalNotes===null){
    setTimeout(_loadV2PersonalNotes,0);
    return`<div style="text-align:center;padding:24px"><span class="auth-spinner"></span> Chargement des notes personnelles...</div>`;
  }
  const entries=v2NotesEnabled?_v2PersonalNotes:(p.journal||[]);
  return`<div>
    ${_journalEntryForm('j','addJournalEntry')}
    ${_journalEntriesList(entries,'deleteJournalEntry','playerPublishToChronicle')}
  </div>`;
}

// ═══════════════════════════════════════════════════════════════════════════
//  ÉCRITURE V2 D'UNE NOTE — POINT UNIQUE
//  Trois entrées y mènent : le journal du joueur, le journal du MJ, et la note
//  rapide du menu du dé. La logique est ici pour qu'elles ne divergent JAMAIS :
//  une destination ajoutée à cet endroit vaut aussitôt pour les trois.
//  Renvoie la destination réellement écrite, pour le message de confirmation.
// ═══════════════════════════════════════════════════════════════════════════
async function _journalWriteV2({asMJ,title,date,content,visibility,scope,linkType,linkId}){
  if(visibility==='chronicle'){
    if(!currentCampaignId)throw new Error('Aucune campagne active pour publier dans une chronique');
    const campaign=await fbDb.collection('campaigns').doc(currentCampaignId).get();
    const chronicleId=campaign.exists?campaign.data().chronicleId:null;
    if(!chronicleId)throw new Error('Chronique introuvable');
    // La Chronique est signée du PERSONNAGE côté joueur, du compte côté MJ ;
    // elle n'a pas de champ de titre, d'où le titre préfixé au contenu.
    const perso=asMJ?null:(typeof P==='function'?P():null);
    await v2GroupService.addChronicleEntry(chronicleId,{
      campaignId:currentCampaignId,
      authorId:currentUser.uid,
      authorNameSnapshot:(!asMJ&&perso?.charName)||currentUserData?.displayName||(asMJ?'MJ':'Membre'),
      content:title?title+' — '+content:content
    });
    return 'chronicle';
  }
  if(asMJ){
    await v2GroupService.addGmJournalEntry(currentTableId,{
      campaignId:scope==='table'?null:(currentCampaignId||null),
      authorId:currentUser.uid,
      title:title||null,
      content,
      state:'notes',
      linkType:linkType||null,
      linkId:linkId||null
    });
    return 'gm';
  }
  const characterId=_v2PersonalNotesCharacterId
    ||(typeof currentSheetCharacterId!=='undefined'&&currentSheetCharacterId)
    ||currentCharacterId
    ||(currentCampaignId
      ?await v2CompatService.getCurrentCharacterId(currentCampaignId,currentUser.uid)
      :null);
  if(!characterId)throw new Error('Personnage introuvable');
  await v2CharacterNotesService.add(characterId,visibility,{title,date,content,authorId:currentUser.uid});
  return 'note';
}

// ═══════════════════════════════════════════════════════════════════════════
//  NOTE RAPIDE (bouton 📓 du menu du dé) — écrire SANS quitter l'écran
//  Demande du 2026-07-25 : le bouton renvoyait vers la page Journal, ce qui
//  interrompt la partie. Il ouvre désormais cette saisie, disponible pour le
//  joueur comme pour le MJ, avec le même choix de destination que le journal.
//  L'écriture passe par _journalWriteV2 : aucune logique dupliquée ici.
// ═══════════════════════════════════════════════════════════════════════════
function openQuickNote(){
  const asMJ=!!window._currentCampIsMJ;
  if(!currentCampaignId){showToast('Rejoins ton groupe depuis le Hub pour prendre une note.');return;}
  // On affiche LE formulaire du journal, pas une version allégée : mêmes champs,
  // mêmes destinations, même fonction d'ajout. Seul le préfixe des identifiants
  // change ('qn'), ce qui permet la coexistence avec le formulaire de l'onglet.
  openModal(asMJ
    ?_mjJournalEntryForm('qn')
    :_journalEntryForm('qn','addJournalEntry',false));
  setTimeout(()=>document.getElementById('qnContent')?.focus(),50);
}

async function addJournalEntry(idPrefix){
  const pf=idPrefix||'j'; // 'j' = formulaire de l'onglet ; 'qn' = même formulaire en modale
  const p=P();
  if(!p.journal)p.journal=[];
  const date=document.getElementById(pf+'Date')?.value||'';
  const title=document.getElementById(pf+'Title')?.value.trim()||'';
  const content=document.getElementById(pf+'Content')?.value.trim()||'';
  const visibility=document.getElementById(pf+'Visibility')?.value||'private';
  const isPublic=visibility==='chronicle';
  const sharedWithGm=visibility==='gm';
  if(!content){showToast('❌ Écris quelque chose avant d\'ajouter.');return;}
  return guardAction('addJournalEntry:'+pf,async()=>{
  const v2NotesEnabled=typeof v2CompatService!=='undefined'&&v2CompatService.isEnabled()
    &&typeof v2CharacterNotesService!=='undefined';
  if(v2NotesEnabled){
    try{
      await _journalWriteV2({asMJ:false,title,date,content,visibility});
      _journalDraft={title:'',content:''};
      _v2PersonalNotes=null;
      _journalCloseIfModal(pf);
      renderTab();
      showToast(visibility==='chronicle'?'✅ Entrée publiée dans la Chronique.':'✅ Note enregistrée.');
    }catch(e){showToast('❌ Enregistrement impossible : '+e.message);}
    return;
  }
  p.journal.push({id:Date.now(),date,sessionTitle:title,content,isPublic,sharedWithGm});
  _journalDraft={title:'',content:''};
  _journalCloseIfModal(pf);
  saveAll();renderTab();showToast('✅ Entrée ajoutée !');
  });
}

// Le formulaire ouvert en modale ('qn') se referme après l'ajout ; celui de
// l'onglet reste en place. Ainsi une seule fonction d'ajout sert aux deux.
function _journalCloseIfModal(idPrefix){
  if(idPrefix==='qn'&&typeof closeModal==='function')closeModal();
}

async function deleteJournalEntry(idx){
  const v2NotesEnabled=typeof v2CompatService!=='undefined'&&v2CompatService.isEnabled()
    &&typeof v2CharacterNotesService!=='undefined';
  if(v2NotesEnabled){
    const entry=(_v2PersonalNotes||[])[idx];
    if(!entry||!entry._v2Visibility)return;
    try{
      await v2CharacterNotesService.remove(
        _v2PersonalNotesCharacterId,
        entry._v2Visibility,
        entry.id
      );
      _v2PersonalNotes=null;
      renderTab();
    }catch(e){showToast('❌ Suppression impossible : '+e.message);}
    return;
  }
  const p=P();if(!p.journal)return;
  p.journal.splice(idx,1);saveAll();renderTab();
}

// Rendu adaptatif : joueur ou MJ screen
function renderCurrentView(){
  if(document.getElementById('mjScreen')?.style.display==='block')renderMJContent();
  else renderTab();
}

// ── JOURNAL MJ ──
function tabJournalMJ(){
  const v2=typeof v2CompatService!=='undefined'&&v2CompatService.isEnabled();
  if(v2){
    const viewButton=(id,label)=>`<button class="btn bsm${_mjJournalView===id?' bprimary':''}" onclick="mjSetJournalView('${id}')">${label}</button>`;
    return`<div>
      ${_mjJournalEntryForm('mj')}
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
        ${viewButton('notes','Notes')}
        ${viewButton('pinned','📌 Épinglées')}
        ${viewButton('archived','🗄 Archivées')}
      </div>
      ${_mjJournalV2List()}
    </div>`;
  }
  const subTabs=[
    {id:'mj',label:'📓 Mon journal'},
    {id:'players',label:'📖 Joueurs'},
    {id:'chronicle',label:'📜 Chronique'},
  ];
  const bar=`<div class="journal-subtab">
    ${subTabs.map(t=>`<button class="${_journalSubTab===t.id?'on':''}" onclick="_journalSubTab='${t.id}';renderCurrentView()">${t.label}</button>`).join('')}
  </div>`;

  if(_journalSubTab==='mj'){
    return`<div>${bar}
      ${_journalEntryForm('mj','addMJJournalEntry')}
      ${_journalEntriesList(_mjJournal,'deleteMJJournalEntry')}
    </div>`;
  }
  if(_journalSubTab==='players'){
    return`<div>${bar}${renderPlayersJournalView()}</div>`;
  }
  if(_journalSubTab==='chronicle'){
    return`<div>${bar}${renderChronicleView()}</div>`;
  }
  return`<div>${bar}</div>`;
}

async function addMJJournalEntry(idPrefix){
  const pf=idPrefix||'mj'; // 'mj' = onglet Journal MJ ; 'qn' = même formulaire en modale
  const date=document.getElementById(pf+'Date')?.value||'';
  const title=document.getElementById(pf+'Title')?.value.trim()||'';
  const content=document.getElementById(pf+'Content')?.value.trim()||'';
  const isPublic=document.getElementById(pf+'Visibility')?.value==='chronicle';
  if(!content){showToast('❌ Écris quelque chose avant d\'ajouter.');return;}
  return guardAction('addMJJournalEntry:'+pf,async()=>{
  if(typeof v2CompatService!=='undefined'&&v2CompatService.isEnabled()){
    try{
      // Le MJ choisit sa destination comme les joueurs (demande du 25/07) : sans ce
      // choix, il ne pouvait écrire que dans son espace privé et devait passer par la
      // page Groupe pour s'adresser à la Chronique.
      const ou=await _journalWriteV2({
        asMJ:true,title,date,content,
        visibility:isPublic?'chronicle':'private',
        scope:document.getElementById(pf+'JournalScope')?.value,
        linkType:document.getElementById(pf+'JournalLinkType')?.value||null,
        linkId:(document.getElementById(pf+'JournalLinkId')?.value||'').trim()||null
      });
      _journalCloseIfModal(pf);
      renderCurrentView();
      showToast(ou==='chronicle'?'✅ Entrée publiée dans la Chronique.':'✅ Entrée ajoutée !');
    }catch(e){showToast('❌ Erreur sauvegarde journal : '+e.message);}
    return;
  }
  _mjJournal.push({id:Date.now(),date,sessionTitle:title,content,isPublic});
  _journalCloseIfModal(pf);
  await saveMJJournal();renderCurrentView();showToast('✅ Entrée ajoutée !');
  });
}
async function deleteMJJournalEntry(idx){
  if(typeof v2CompatService!=='undefined'&&v2CompatService.isEnabled()){
    const entry=_mjJournal[idx];
    if(!entry?._v2Id)return;
    try{await v2GroupService.deleteGmJournalEntry(currentTableId,entry._v2Id);}
    catch(e){showToast('❌ Suppression impossible : '+e.message);}
    return;
  }
  _mjJournal.splice(idx,1);await saveMJJournal();renderCurrentView();
}
async function saveMJJournal(){
  if(!currentUser||!currentCampaignId)return;
  try{
    await fbDb.collection('characters').doc(currentUser.uid+'_'+currentCampaignId+'_mj').set({
      // tableId : même raison qu'en mj/index.js — sans lui les règles refusent ce doc aux joueurs.
      entries:_mjJournal,npcs:_mjNPCs,objets:_mjObjets,reserve:_mjReserve,userId:currentUser.uid,campaignId:currentCampaignId,tableId:currentTableId,
      updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    },{merge:true});
  }catch(e){showToast('❌ Erreur sauvegarde journal : '+e.message);}
}

// ── VUE JOURNAUX JOUEURS (MJ) ──
let _playersJournalData=null;
let _selectedPlayerJournal=null;

function renderPlayersJournalView(){
  if(!_playersJournalData){
    // Déclenchement du chargement
    loadPlayersJournalData();
    return`<div style="text-align:center;padding:24px"><span class="auth-spinner"></span> Chargement des journaux...</div>`;
  }
  const players=_playersJournalData;
  if(!players.length) return`<div style="text-align:center;padding:24px;color:var(--text3);font-style:italic">Aucun joueur n'a encore de journal.</div>`;

  const sel=_selectedPlayerJournal||players[0]?.uid;
  const selPlayer=players.find(p=>p.uid===sel)||players[0];
  const selectorHtml=`<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">
    ${players.map(p=>`<button class="btn bsm${p.uid===sel?' bac':''}" onclick="_selectedPlayerJournal='${p.uid}';renderCurrentView()">${p.avatar||'⚔'} ${esc(p.playerName)}</button>`).join('')}
  </div>`;

  if(!selPlayer) return selectorHtml+`<div style="color:var(--text3);font-style:italic">Sélectionnez un joueur.</div>`;
  const entries=(selPlayer.journal||[]).filter(entry=>entry.sharedWithGm||entry.isPublic);
  return selectorHtml+`<div style="font-size:13px;color:var(--text3);margin-bottom:10px">${esc(selPlayer.charName||'?')} — ${entries.length} entrée(s)</div>`
    +_journalEntriesList(entries,'()=>{}');
}

async function loadPlayersJournalData(){
  try{
    const snap=await fbDb.collection('characters').where('campaignId','==',currentCampaignId).get();
    const result=[];
    for(const doc of snap.docs){
      const d=doc.data();
      if(d.userId===currentUser.uid)continue; // skip MJ's own char
      if(doc.id.endsWith('_mj'))continue;
      const char=d.characterData||{};
      let playerName='Joueur';let avatar='⚔';
      try{const u=await fbDb.collection('users').doc(d.userId).get();if(u.exists){playerName=u.data().displayName||'Joueur';avatar=u.data().avatar||'⚔';}}catch(e){}
      const visibleJournal=(char.journal||[]).filter(entry=>entry.sharedWithGm||entry.isPublic);
      if(visibleJournal.length)result.push({uid:d.userId,playerName,avatar,charName:char.charName||'?',journal:visibleJournal});
    }
    _playersJournalData=result;
    renderCurrentView();
  }catch(e){showToast('❌ Erreur chargement journaux : '+e.message);}
}

// ── CHRONIQUE (compilation) ──
function renderChronicleView(){
  if(!_compilationData){
    loadChronicleData();
    return`<div style="text-align:center;padding:24px"><span class="auth-spinner"></span> Compilation en cours...</div>`;
  }
  const bySession=_compilationData;
  if(!Object.keys(bySession).length) return`<div style="text-align:center;padding:24px;color:var(--text3);font-style:italic">Aucune entrée publique pour l'instant. Les joueurs doivent cocher "Visible dans la Chronique" lors de l'ajout.</div>`;

  const sessions=Object.keys(bySession).sort((a,b)=>{
    const da=bySession[a][0]?.date||'';const db2=bySession[b][0]?.date||'';return da.localeCompare(db2);
  });

  return`<div style="max-height:600px;overflow-y:auto;padding-right:4px">
    ${sessions.map(sess=>`<div class="chronicle-session">
      <div class="chronicle-session-title">📜 ${esc(sess)}</div>
      ${bySession[sess].map(v=>`<div class="chronicle-voice">
        <div class="chronicle-avatar">${v.avatar||'⚔'}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;color:var(--cp);font-weight:600;margin-bottom:4px">${esc(v.playerName)} <span style="color:var(--text3);font-weight:400">— ${esc(v.charName)}</span> <span style="color:var(--text3);font-size:12px">${v.date||''}</span></div>
          <div class="journal-content">${esc(v.content)}</div>
        </div>
      </div>`).join('')}
    </div>`).join('')}
  </div>`;
}

async function loadChronicleData(){
  try{
    const snap=await fbDb.collection('characters').where('campaignId','==',currentCampaignId).get();
    const bySession={};
    for(const doc of snap.docs){
      if(doc.id.endsWith('_mj'))continue;
      const d=doc.data();const char=d.characterData||{};
      let playerName='Joueur';let avatar='⚔';
      try{const u=await fbDb.collection('users').doc(d.userId).get();if(u.exists){playerName=u.data().displayName||'Joueur';avatar=u.data().avatar||'⚔';}}catch(e){}
      for(const entry of (char.journal||[])){
        if(!entry.isPublic)continue;
        const key=entry.sessionTitle||'Sans titre';
        if(!bySession[key])bySession[key]=[];
        bySession[key].push({playerName,avatar,charName:char.charName||'?',content:entry.content,date:entry.date});
      }
    }
    _compilationData=bySession;
    renderCurrentView();
  }catch(e){showToast('❌ Erreur compilation : '+e.message);}
}

function tabHistorique(p){
  return`<div class="g2" style="gap:10px">
    <div>
      <div class="panel mb10">
        <div class="pt">Traits de personnalité</div>
        <div class="fl mb6">Trait</div><textarea class="fi mb6" rows="2" oninput="upd('traits',this.value);autoGrow(this)" style="resize:vertical">${esc(p.traits)}</textarea>
        <div class="fl mb6">Idéaux</div><textarea class="fi mb6" rows="2" oninput="upd('ideals',this.value);autoGrow(this)" style="resize:vertical">${esc(p.ideals)}</textarea>
        <div class="fl mb6">Liens</div><textarea class="fi mb6" rows="2" oninput="upd('bonds',this.value);autoGrow(this)" style="resize:vertical">${esc(p.bonds)}</textarea>
        <div class="fl mb6">Défauts</div><textarea class="fi" rows="2" oninput="upd('flaws',this.value);autoGrow(this)" style="resize:vertical">${esc(p.flaws)}</textarea>
      </div>
      <div class="panel" style="border-color:rgba(200,168,75,.3);background:rgba(200,168,75,.04)">
        <div class="pt" style="color:var(--cp)">🔐 Secrets <span style="font-size:12px;color:var(--text3);font-weight:400;margin-left:6px">Visible uniquement par toi et le MJ</span></div>
        <textarea class="fi" rows="2" oninput="upd('secrets',this.value);autoGrow(this)" placeholder="Informations secrètes sur ton personnage, objectifs cachés, traumatismes, liens secrets avec des PNJ..." style="resize:vertical">${esc(p.secrets||'')}</textarea>
      </div>
    </div>
    <div>
      <div class="panel mb10">
        <div class="pt">Maîtrises & langues</div>
        <div class="fl mb6">Maîtrises</div><textarea class="fi mb6" rows="2" oninput="upd('proficiencies',this.value);autoGrow(this)" style="resize:vertical">${esc(p.proficiencies)}</textarea>
        <div class="fl mb6">Langues</div><textarea class="fi mb6" rows="2" oninput="upd('languages',this.value);autoGrow(this)" style="resize:vertical">${esc(p.languages)}</textarea>
      </div>
      <div class="panel">
        <div class="pt">Backstory</div>
        <textarea class="fi" rows="3" oninput="upd('backstory',this.value);autoGrow(this)" placeholder="L'histoire de ton personnage..." style="resize:vertical">${esc(p.backstory)}</textarea>
      </div>
    </div>
  </div>`;
}

// ═══════════════════════════════════════
// ─────────────────────────────────────────
// CALCULATEUR DE RENCONTRE
// ─────────────────────────────────────────
function crToXP(cr){return CR_XP_TABLE[cr]||(parseFloat(cr)>0?CR_XP_TABLE[String(Math.round(parseFloat(cr)))]||0:0);}
function crToPB(cr){const v=cr==='1/8'?.125:cr==='1/4'?.25:cr==='1/2'?.5:parseFloat(cr)||0;if(v<5)return 2;if(v<9)return 3;if(v<13)return 4;if(v<17)return 5;if(v<21)return 6;if(v<25)return 7;if(v<29)return 8;return 9;}
function encMultiplier(n){if(n<=1)return 1;if(n===2)return 1.5;if(n<=6)return 2;if(n<=10)return 2.5;if(n<=14)return 3;return 4;}
function encCalc(groupSize,groupLevel,monsters){
  const lv=Math.min(20,Math.max(1,groupLevel));
  const thPerPc=ENC_THRESHOLDS[lv-1];
  const th=thPerPc.map(v=>v*groupSize);
  const rawXP=monsters.reduce((s,m)=>s+m.xp,0);
  const mult=encMultiplier(monsters.length);
  const adjXP=Math.round(rawXP*mult);
  let diff='—';let diffColor='var(--text3)';
  if(monsters.length){
    if(adjXP>=th[3]){diff='Mortelle';diffColor='var(--danger)';}
    else if(adjXP>=th[2]){diff='Difficile';diffColor='var(--warn)';}
    else if(adjXP>=th[1]){diff='Moyenne';diffColor='#fdd835';}
    else if(adjXP>=th[0]){diff='Facile';diffColor='var(--good)';}
    else{diff='Triviale';diffColor='var(--text3)';}
  }
  return{th,rawXP,adjXP,mult,diff,diffColor};
}
function encRefresh(){
  const sz=parseInt(document.getElementById('enc_size')?.value)||4;
  const lv=Math.min(20,Math.max(1,parseInt(document.getElementById('enc_level')?.value)||5));
  _encGroupSize=sz;_encGroupLevel=lv;
  const r=document.getElementById('enc_result');
  if(r)r.innerHTML=encResultHTML(sz,lv);
}
function encResultHTML(sz,lv){
  const res=encCalc(sz,lv,_encMonsters);
  if(!_encMonsters.length)return'<div style="font-size:13px;color:var(--text3);text-align:center;padding:6px">Ajoutez des monstres pour voir la difficulté.</div>';
  const names=['Facile','Moyenne','Difficile','Mortelle'];
  const bars=res.th.map((v,i)=>`<div style="font-size:12px;color:var(--text3)">${names[i]}<br><strong style="color:var(--text2)">${v.toLocaleString()}</strong></div>`).join('');
  return`<div style="background:var(--surface2);border-radius:2px;padding:10px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <div>
        <div style="font-size:13px;color:var(--text3)">XP brut — ×${res.mult} → XP ajusté</div>
        <div style="font-size:16px;font-weight:700;color:var(--text)">${res.rawXP.toLocaleString()} → <span style="color:var(--cp)">${res.adjXP.toLocaleString()} XP</span></div>
      </div>
      <div style="text-align:right">
        <div style="font-size:12px;color:var(--text3)">Difficulté</div>
        <div style="font-size:18px;font-weight:700;color:${res.diffColor}">${res.diff}</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;text-align:center;padding:6px 0;border-top:1px solid var(--border)">${bars}</div>
  </div>`;
}
function encRenderMonsters(){
  const el=document.getElementById('enc_monsterList');if(!el)return;
  el.innerHTML=_encMonsters.length?_encMonsters.map((m,i)=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 8px;background:var(--surface2);border-radius:2px;margin-bottom:4px">
    <span style="font-size:13px"><strong>${esc(m.name)}</strong> <span style="color:var(--text3)">CR ${m.cr}</span> — <span style="color:var(--cp)">${m.xp.toLocaleString()} XP</span></span>
    <button class="btn bsm" style="color:var(--danger);border-color:rgba(229,57,53,.4);padding:0 6px" onclick="encRemoveMonster(${i})">✕</button>
  </div>`).join(''):'<div style="font-size:13px;color:var(--text3);font-style:italic;text-align:center;padding:8px">Aucun monstre — ajoutez-en ci-dessus.</div>';
  encRefresh();
}
function encAddMonster(){
  const crOpts=['0','1/8','1/4','1/2',...Array.from({length:30},(_,i)=>String(i+1))];
  openModal(`<div class="pt">➕ Ajouter un monstre</div>
    <div class="g2" style="gap:8px;margin-bottom:12px">
      <div><div class="fl mb6">Nom (optionnel)</div><input class="fi" id="enc_mname" placeholder="Gobelin, Ogre..."></div>
      <div><div class="fl mb6">Facteur de Puissance (CR)</div>
        <select class="fi" id="enc_mcr" onchange="document.getElementById('enc_mxp').textContent=crToXP(this.value).toLocaleString()+' XP'">
          ${crOpts.map(c=>`<option value="${c}"${c==='1'?' selected':''}>${c}</option>`).join('')}
        </select>
      </div>
    </div>
    <div style="text-align:center;font-size:13px;color:var(--text3);margin-bottom:14px">XP : <strong id="enc_mxp" style="color:var(--cp)">200 XP</strong></div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:14px">
      ${[1,2,3,4,5,6].map(n=>`<button class="btn bsm" onclick="for(let i=0;i<${n}-1;i++)encConfirmAddMonster(false);encConfirmAddMonster(true);" style="font-size:13px">×${n}</button>`).join('')}
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="encConfirmAddMonster(true)">✓ Ajouter</button>
    </div>`);
}
function encConfirmAddMonster(andClose){
  const name=(document.getElementById('enc_mname')?.value?.trim())||'Monstre';
  const cr=(document.getElementById('enc_mcr')?.value||'1');
  const xp=crToXP(cr);
  _encMonsters.push({name,cr,xp});
  if(andClose)closeModal();
  encRenderMonsters();
}
function encRemoveMonster(i){_encMonsters.splice(i,1);encRenderMonsters();}
async function encDistribute(){
  if(!_encMonsters.length){showToast('❌ Aucun monstre dans la rencontre.');return;}
  if(!_mjPlayersData.length){showToast('❌ Aucun joueur dans la campagne.');return;}
  const xpPerPlayer=Math.round(_encMonsters.reduce((s,m)=>s+m.xp,0)/_mjPlayersData.length);
  if(!xpPerPlayer){showToast('❌ XP nul.');return;}
  let ok=0;
  for(const pp of _mjPlayersData){
    try{
      const ref=fbDb.collection('characters').doc(pp.uid+'_'+currentCampaignId);
      const doc=await ref.get();
      if(!doc.exists)continue;
      const cd=doc.data().characterData||{};
      const oldXP=cd.xp||0;
      cd.xp=oldXP+xpPerPlayer;
      await ref.update({'characterData.xp':cd.xp});
      ok++;
    }catch(e){}
  }
  showToast(`⭐ ${xpPerPlayer.toLocaleString()} XP distribués à ${ok} joueur(s) !`);
  _encMonsters=[];encRenderMonsters();
}
