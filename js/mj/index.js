
// ═══════════════════════════════════════
// INTERFACE MJ
// ═══════════════════════════════════════

function showMJScreen(){
  document.getElementById('authScreen').style.display='none';
  document.getElementById('hubScreen').style.display='none';
  document.getElementById('app').style.display='none';
  document.getElementById('mjScreen').style.display='block';
  const el=document.getElementById('mjHdrCamp');
  if(el) el.textContent=(currentTableName?currentTableName+' — ':'')+currentCampaignName;
  if(typeof _refreshNavAvatars==='function')_refreshNavAvatars();
  if(typeof _refreshModeNav==='function')_refreshModeNav();
  if(typeof _syncFloatingUI==='function')_syncFloatingUI();
  // Restaure l'onglet MJ où le MJ en était (symétrique de lastTab_ côté joueur). Avant, un
  // 'joueurs' figé ramenait TOUJOURS l'écran MJ sur l'onglet Groupe après un F5 (signalé 2026-07-23).
  _mjTab=_validMJTab(localStorage.getItem('lastMJTab_'+currentCampaignId))||'joueurs';
  renderMJTabs();
  if(!localStorage.getItem('tuto_mj_done')) setTimeout(()=>startTutorial('mj'),700);
}

// Onglets MJ valides — sert à filtrer une clé localStorage périmée (une clé d'un onglet
// disparu ne doit pas laisser _mjTab sur une valeur qui ne rend rien).
const _MJ_TABS=['joueurs','combat','pnj','objets','journal','regles','stock'];

// Les demandes de repos arrivent par les listeners de _dsLoadGroupData (ui/shell.js),
// jusqu'ici démarrés seulement à l'ouverture de la page Groupe. Le MJ suivant
// désormais les repos depuis son onglet Joueurs (§10.1), il faut qu'ils tournent
// aussi en session MJ.
// ⚠️ On teste la PRÉSENCE RÉELLE du listener plutôt qu'un drapeau « déjà fait » :
// _dsCloseGroup() les coupe, donc un MJ qui ouvre puis referme la page Groupe
// perdrait le suivi jusqu'au prochain changement de campagne.
function _mjEnsureRestListener(){
  try{
    if(!(typeof v2CompatService!=='undefined'&&v2CompatService.isEnabled()))return;
    if(!currentCampaignId||typeof _dsLoadGroupData!=='function')return;
    if(typeof _dsGroupRestUnsub==='function')return;
    _dsLoadGroupData(); // idempotent : coupe ses propres listeners avant d'en reposer
  }catch(e){}
}
let _mjProgressionRequests=[];
let _mjProgressionUnsub=null;
let _mjProgressionCampaignId=null;
function _mjEnsureProgressionListener(){
  const enabled=typeof v2CompatService!=='undefined'
    &&v2CompatService.isEnabled()
    &&typeof v2ProgressionService!=='undefined'
    &&currentCampaignId;
  if(!enabled){
    if(_mjProgressionUnsub)_mjProgressionUnsub();
    _mjProgressionUnsub=null;_mjProgressionCampaignId=null;_mjProgressionRequests=[];
    return;
  }
  if(_mjProgressionUnsub&&_mjProgressionCampaignId===currentCampaignId)return;
  if(_mjProgressionUnsub)_mjProgressionUnsub();
  _mjProgressionCampaignId=currentCampaignId;
  _mjProgressionUnsub=v2ProgressionService.listenPending(
    currentCampaignId,
    snapshot=>{
      _mjProgressionRequests=snapshot.docs.map(doc=>({id:doc.id,...doc.data()}));
      if(_mjTab==='joueurs')renderMJContent();
    },
    ()=>{_mjProgressionRequests=[];if(_mjTab==='joueurs')renderMJContent();}
  );
}
function _validMJTab(t){return _MJ_TABS.includes(t)?t:null;}
function setMJTab(tab){
  _mjTab=tab;
  // Mémorise l'onglet MJ actif par campagne (restauré par showMJScreen au F5 / à la ré-entrée).
  if(currentCampaignId){try{localStorage.setItem('lastMJTab_'+currentCampaignId,tab);}catch(e){}}
  renderMJTabs();   // peint AUSSI le contenu (cf. shell.js) — pas de 2ᵉ appel : évite un double rendu
  const el=document.getElementById('mjTabContent');
  if(el){el.classList.remove('tab-switch-anim');void el.offsetWidth;el.classList.add('tab-switch-anim');} // animation de changement d'onglet MJ
  if(typeof _centerActiveTab==='function')setTimeout(_centerActiveTab,40); // centre l'onglet actif dans la barre
}

// ⚠️ renderMJTabs VIVAIT ICI et n'a JAMAIS servi : ui/shell.js est chargé après ce
// fichier (index.html) et redéfinit la fonction, donc c'est toujours SA version qui
// peignait le rail. Les deux listes avaient divergé — celle-ci respectait l'ordre du
// §10, celle qui s'affichait non — si bien qu'un audit lisant ce fichier concluait
// « conforme » à l'inverse de ce que voyait l'utilisateur (2026-07-25).
// La définition unique est désormais dans ui/shell.js. Ne pas en recréer une ici.

function renderMJContent(){
  const el=document.getElementById('mjTabContent');
  if(!el)return;
  _mjEnsureProgressionListener();
  _mjEnsureRestListener();
  if(_mjTab==='joueurs') el.innerHTML=mjTabJoueurs();
  else if(_mjTab==='combat') el.innerHTML=mjTabCombat();
  else if(_mjTab==='pnj') el.innerHTML=mjTabPNJ();
  else if(_mjTab==='objets') el.innerHTML=mjTabObjets();
  else if(_mjTab==='journal') el.innerHTML=mjTabJournalScreen();
  else if(_mjTab==='regles'){el.innerHTML=mjTabRegles();mjInitRulesDnD();}
  // A8/B2b — onglet « Réserve » : antichambre du MJ (mjTabReserve, plus bas).
  else if(_mjTab==='stock') el.innerHTML=mjTabReserve();
  // Panneaux déplaçables aussi côté MJ (sauf Règles qui a son propre drag)
  if(_mjTab!=='regles'&&typeof _enableTabDrag==='function'){_enableTabDrag('mjTabContent');applyAllSectionOrders('mjTabContent');}
}

// ── Chargement des joueurs de la campagne ──
// loadMJPlayersData() a été SUPPRIMÉE : plus aucun appelant (vérifié par recherche sur
// tout js/ et index.html). startMJPlayersListener (firebase.js) l'a remplacée par un
// listener temps réel, qui a lui une branche V2 lisant les projections publiques
// campaigns/{camp}/publicCharacters. La fonction, elle, était restée sur la requête V1
// where('campaignId') — inopérante en V2 et prête à réintroduire le bug si on l'appelait.

// ── Sauvegarde données MJ (journal + PNJ + objets) ──
async function saveMJData(){
  if(!currentUser||!currentCampaignId)return;
  try{
    if(_mjV2Enabled()){
      const combatOrder=_mjCombatStarted
        ?[...(_mjCombatants||[])].sort((a,b)=>(b.initiative||0)-(a.initiative||0))
        :(_mjCombatants||[]);
      const currentCombatant=combatOrder.length
        ?combatOrder[(_mjCurrentTurn||0)%combatOrder.length]
        :null;
      const combatState={
        active:!!_mjCombatStarted,
        currentTurn:_mjCurrentTurn||0,
        currentTurnUid:currentCombatant?.uid||null,
        currentTurnName:currentCombatant?.isPlayer
          ?currentCombatant?.name||null
          :currentCombatant?.publicName||currentCombatant?.race||'Créature',
        round:_mjRound||1,
        combatants:(_mjCombatants||[]).map(combatant=>({
          uid:combatant.uid||null,
          characterId:combatant.characterId||null,
          isPlayer:!!combatant.isPlayer,
          name:combatant.isPlayer
            ?(combatant.name||'Personnage')
            :(combatant.hidden?'Créature inconnue':combatant.publicName||combatant.race||'Créature'),
          initiative:combatant.initiative||0,
          conditions:combatant.conditions||[],
          hidden:!!combatant.hidden
        }))
      };
      const batch=fbDb.batch();
      batch.set(
        fbDb.collection('campaigns').doc(currentCampaignId).collection('gmData').doc('core'),
        {
          schemaVersion:2,
          objets:_mjObjets,
          combatState:{
            active:!!_mjCombatStarted,
            combatants:_mjCombatants,
            currentTurn:_mjCurrentTurn||0,
            round:_mjRound||1
          },
          updatedAt:firebase.firestore.FieldValue.serverTimestamp()
        },
        {merge:true}
      );
      batch.set(
        fbDb.collection('campaigns').doc(currentCampaignId).collection('publicState').doc('combat'),
        {...combatState,updatedAt:firebase.firestore.FieldValue.serverTimestamp()}
      );
      await batch.commit();
      return;
    }
    await fbDb.collection('characters').doc(currentUser.uid+'_'+currentCampaignId+'_mj').set({
      entries:_mjJournal,npcs:_mjNPCs,objets:_mjObjets,reserve:_mjReserve,
      // tableId AJOUTÉ le 2026-07-22 : sans lui, les règles Firestore refusaient ce document
      // aux joueurs → groupe ET combat cassés (cf. firebase/rules/archive/tools-legacy.rules).
      userId:currentUser.uid,campaignId:currentCampaignId,tableId:currentTableId,
      updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    },{merge:true});
  }catch(e){showToast('❌ Erreur sauvegarde : '+e.message);}
}

// ═════════════════════════════════════════════════════════════════════════
//  ONGLET RÉSERVE (B2b, 2026-07-23) — antichambre du MJ
//  Le MJ prépare des indices / artefacts / objets de quête qui restent PRIVÉS
//  (`_mjReserve`, dans le doc _mj) tant qu'il ne clique pas « Mettre à
//  disposition ». À ce moment, l'item QUITTE la réserve et rejoint les partages
//  de la campagne (`campaigns/<camp>.shares`), que la page Groupe des joueurs
//  affiche déjà (_dsShares, shell.js). Décision utilisateur : il PASSE, il n'est
//  pas copié.
//  ⚠️ LIMITE DE CONFIDENTIALITÉ (à traiter avec le durcissement Firestore) : le
//     doc _mj est LISIBLE par les membres de la table (nécessaire pour le combat
//     et le groupe). La réserve y est donc techniquement lisible par un joueur qui
//     inspecterait la base — comme l'est déjà le journal MJ privé. Ce n'est pas une
//     confidentialité forte ; c'est « hors de vue » dans l'app, pas « inaccessible ».
// ═════════════════════════════════════════════════════════════════════════
let _mjV2ReserveUnsub=null,_mjV2ReserveCampaignId=null;
let _mjV2RevealedUnsub=null,_mjV2RevealedCampaignId=null,_mjRevealedDiscoveries=[];
let _mjReserveView='pending';
function _mjV2Enabled(){
  return typeof v2CompatService!=='undefined'&&v2CompatService.isEnabled();
}
function _mjNormalizeV2Reserve(doc){
  const data=doc.data();
  return{
    ...data,
    _v2Id:doc.id,
    type:data.type==='clue'?'indice':data.type==='artifact'?'artefact':'quete',
    text:data.content||''
  };
}
function _mjEnsureV2ReserveListener(){
  if(!_mjV2Enabled()||typeof v2GroupService==='undefined'||!currentCampaignId)return;
  if(_mjV2ReserveCampaignId!==currentCampaignId||typeof _mjV2ReserveUnsub!=='function'){
    if(typeof _mjV2ReserveUnsub==='function')_mjV2ReserveUnsub();
    _mjV2ReserveCampaignId=currentCampaignId;
    _mjV2ReserveUnsub=v2GroupService.listenReserve(
      currentCampaignId,
      snapshot=>{
        _mjReserve=snapshot.docs.map(_mjNormalizeV2Reserve);
        if(_mjTab==='stock')renderMJContent();
      },
      ()=>{_mjReserve=[];if(_mjTab==='stock')renderMJContent();}
    );
  }
  if(_mjV2RevealedCampaignId!==currentCampaignId||typeof _mjV2RevealedUnsub!=='function'){
    if(typeof _mjV2RevealedUnsub==='function')_mjV2RevealedUnsub();
    _mjV2RevealedCampaignId=currentCampaignId;
    _mjV2RevealedUnsub=v2GroupService.listenDiscoveries(
      currentCampaignId,
      snapshot=>{
        _mjRevealedDiscoveries=snapshot.docs.map(doc=>({id:doc.id,...doc.data()}));
        if(_mjTab==='stock'&&_mjReserveView==='revealed')renderMJContent();
      },
      ()=>{_mjRevealedDiscoveries=[];if(_mjTab==='stock')renderMJContent();}
    );
  }
}
function mjSetReserveView(view){
  _mjReserveView=['pending','revealed','archived'].includes(view)?view:'pending';
  renderMJContent();
}
function mjTabReserve(){
  _mjEnsureV2ReserveListener();
  const _shHTML=(typeof _dsShareHTML==='function')?_dsShareHTML:null;
  const reserveItems=(_mjReserve||[])
    .filter(item=>_mjReserveView==='archived'
      ?item.status==='archived'
      :(item.status||'pending')==='pending');
  const items=_mjReserveView==='revealed'
    ?(_mjRevealedDiscoveries||[]).map((it,i)=>{
      const inner=_shHTML?_shHTML(it,i,false):`<div class="ds-note">${esc(it.title||it.content||'?')}</div>`;
      return`<div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:8px">
        <div style="flex:1;min-width:0">${inner}</div>
        <button class="btn bsm" onclick="mjReturnDiscoveryToReserve(${i})" title="Retirer des Découvertes du groupe et replacer dans ta Réserve">↩ Reprendre</button>
      </div>`;
    }).join('')
    :reserveItems.map(it=>{
    const i=_mjReserve.indexOf(it);
    const inner=_shHTML?_shHTML(it,i,false):`<div class="ds-note">${esc(it.title||it.text||'?')}</div>`;
    return`<div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:8px">
      <div style="flex:1;min-width:0">${inner}${it.privateNote?`<div class="ds-note" style="margin-top:4px;color:var(--warn)">🔒 ${esc(it.privateNote)}</div>`:''}</div>
      <div style="display:flex;flex-direction:column;gap:4px;flex:none">
        ${_mjReserveView==='pending'?`<button class="btn bsm bac" onclick="mjPublishReserveItem(${i})" title="Révéler au groupe">🎁 Révéler</button>
          <button class="btn bsm" onclick="mjArchiveReserveItem(${i},true)">🗄 Archiver</button>`
          :`<button class="btn bsm" onclick="mjArchiveReserveItem(${i},false)">↩ Restaurer</button>`}
        <button class="btn bsm bdanger" onclick="mjDeleteReserveItem(${i})" title="Supprimer">🗑</button>
      </div>
    </div>`;
  }).join('');
  const viewButton=(id,label,count)=>`<button class="btn bsm${_mjReserveView===id?' bprimary':''}" onclick="mjSetReserveView('${id}')">${label} (${count})</button>`;
  const pendingCount=(_mjReserve||[]).filter(item=>(item.status||'pending')==='pending').length;
  const archivedCount=(_mjReserve||[]).filter(item=>item.status==='archived').length;
  return`<div class="panel"><div class="pt">🎒 Réserve</div>
    <p style="font-size:13px;color:var(--text3);line-height:1.5;margin-bottom:10px">Carnet privé de préparation. Révéler déplace l’entrée vers les Découvertes du groupe ; la retirer la replace ici sans prétendre effacer ce que les joueurs ont vu.</p>
    <div style="display:flex;gap:8px;margin-bottom:12px">
      <button class="btn" style="flex:1" onclick="mjOpenReserveModal('indice')">📜 Indice</button>
      <button class="btn" style="flex:1" onclick="mjOpenReserveModal('artefact')">🗡 Artefact</button>
      <button class="btn" style="flex:1" onclick="mjOpenReserveModal('quete')">🗝 Obj. quête</button>
    </div>
    <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px">
      ${viewButton('pending','À révéler',pendingCount)}
      ${viewButton('revealed','Révélées',_mjRevealedDiscoveries.length)}
      ${viewButton('archived','Archivées',archivedCount)}
    </div>
    ${items||'<div class="ds-note" style="font-style:italic;padding:10px 0">Aucune entrée dans cette vue.</div>'}
  </div>`;
}
function mjOpenReserveModal(type){
  const T={indice:'📜 Indice',artefact:'🗡 Artefact',quete:'🗝 Objet de quête'}[type]||type;
  const MI={parchemin:'📜',pierre:'🪨',bois:'🌳',rune:'🔮'};
  const mat=type==='indice'?`<div class="fl mb6">Matière de l'indice</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
      ${['parchemin','pierre','bois','rune'].map((m,i)=>`<button class="btn mjResMat${i===0?' bac':''}" data-m="${m}" onclick="document.querySelectorAll('.mjResMat').forEach(b=>b.classList.remove('bac'));this.classList.add('bac')">${MI[m]} ${m}</button>`).join('')}
    </div>`:'';
  openModal(`<div class="pt">${T} — ajouter à la réserve</div>
    <div class="fl mb6">Titre${type==='indice'?' (optionnel)':''}</div>
    <input class="fi" id="mjResTitle" style="margin-bottom:10px">
    ${mat}
    <div class="fl mb6">${type==='indice'?"Texte de l'indice":'Description'}</div>
    <textarea class="fi" id="mjResText" rows="3" style="resize:vertical;margin-bottom:12px"></textarea>
    <div class="fl mb6">Image (facultative)</div>
    <input class="fi" id="mjResImage" type="file" accept="image/jpeg,image/png,image/webp" style="margin-bottom:4px">
    <div class="ds-note" style="margin-bottom:12px">JPG, PNG ou WebP · redimensionnée automatiquement · 240 Ko maximum après compression</div>
    <div class="fl mb6">Note privée (facultatif)</div>
    <textarea class="fi" id="mjResPrivateNote" rows="2" placeholder="Contexte, condition de révélation…" style="resize:vertical;margin-bottom:10px"></textarea>
    <div class="fl mb6">Objet lié (identifiant facultatif)</div>
    <input class="fi" id="mjResLinkedItem" placeholder="Aucun lien automatique" style="margin-bottom:12px">
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="mjConfirmReserve('${type}')">🎒 Mettre en réserve</button>
    </div>`);
}
async function mjConfirmReserve(type){
  const title=((document.getElementById('mjResTitle')||{}).value||'').trim();
  const text=((document.getElementById('mjResText')||{}).value||'').trim();
  const privateNote=((document.getElementById('mjResPrivateNote')||{}).value||'').trim();
  const linkedItemId=((document.getElementById('mjResLinkedItem')||{}).value||'').trim();
  if(!text&&!title){showToast('❌ Écris au moins un titre ou un texte.');return;}
  let image=null;
  try{
    const file=(document.getElementById('mjResImage')||{}).files?.[0];
    if(file)image=await discoveryImageService.upload(currentCampaignId,file,title||'Découverte du groupe');
  }catch(e){showToast('❌ Image impossible : '+e.message,4500);return;}
  if(_mjV2Enabled()&&typeof v2GroupService!=='undefined'){
    try{
      const v2Type=type==='indice'?'clue':type==='artefact'?'artifact':'quest_item';
      await v2GroupService.addReserveEntry(currentCampaignId,{
        type:v2Type,
        title:title||'Découverte',
        content:text||null,
        privateNote:privateNote||null,
        linkedItemId:linkedItemId||null,
        image,
        material:type==='indice'?(document.querySelector('.mjResMat.bac')?.dataset.m||'parchemin'):null,
        status:'pending',
        createdBy:currentUser.uid
      });
      closeModal();
      showToast('🎒 Ajouté à la réserve.');
    }catch(e){if(image)await discoveryImageService.remove(currentCampaignId,image).catch(()=>{});showToast('❌ Ajout impossible : '+e.message);}
    return;
  }
  const item={type,title,text,image,ts:Date.now()};
  if(type==='indice'){const mEl=document.querySelector('.mjResMat.bac');item.matiere=mEl?mEl.dataset.m:'parchemin';}
  _mjReserve.push(item);
  closeModal();
  await saveMJData();
  renderMJContent();
  showToast('🎒 Ajouté à la réserve.');
}
async function mjArchiveReserveItem(idx,archived){
  const item=_mjReserve[idx];
  if(!item?._v2Id)return;
  try{
    await v2GroupService.updateReserveEntry(currentCampaignId,item._v2Id,{status:archived?'archived':'pending'});
    showToast(archived?'🗄 Entrée archivée.':'↩ Entrée restaurée.');
  }catch(e){showToast('❌ Modification impossible : '+e.message);}
}
async function mjReturnDiscoveryToReserve(idx){
  const discovery=(_mjRevealedDiscoveries||[])[idx];
  if(!discovery?.id)return;
  try{
    await v2GroupService.returnDiscoveryToReserve(currentCampaignId,discovery.id,currentUser.uid);
    showToast('↩ Découverte replacée dans la Réserve.');
  }catch(e){showToast('❌ Retrait impossible : '+e.message);}
}
async function mjDeleteReserveItem(idx){
  if(idx<0||idx>=_mjReserve.length)return;
  if(_mjV2Enabled()&&typeof v2GroupService!=='undefined'){
    const item=_mjReserve[idx];
    if(!item?._v2Id)return;
    try{
      await v2GroupService.deleteReserveEntry(currentCampaignId,item._v2Id);
      if(item.image)await discoveryImageService.remove(currentCampaignId,item.image);
      showToast('🗑 Retiré de la réserve.');
    }catch(e){showToast('❌ Suppression impossible : '+e.message);}
    return;
  }
  const removed=_mjReserve.splice(idx,1)[0];
  if(removed?.image)await discoveryImageService.remove(currentCampaignId,removed.image).catch(()=>{});
  await saveMJData();
  renderMJContent();
  showToast('🗑 Retiré de la réserve.');
}
async function mjPublishReserveItem(idx){
  const it=_mjReserve[idx];
  if(!it||!currentCampaignId)return;
  if(_mjV2Enabled()&&typeof v2GroupService!=='undefined'){
    if(!it._v2Id)return;
    try{
      await v2GroupService.revealReserveEntry(currentCampaignId,it._v2Id,currentUser.uid);
      // Dire OÙ l'entrée est partie et comment la reprendre : elle quitte la vue
      // « À révéler », et rien n'indiquait qu'elle atterrissait dans « Révélées »,
      // d'où « il faut au MJ la possibilité de retirer un élément qu'il a apporté
      // au groupe » (test du 2026-07-26) — alors que le bouton existait déjà là.
      showToast('🎁 Révélé au groupe — reprends-le quand tu veux dans la vue « Révélées ».',4000);
    }catch(e){showToast('❌ Publication impossible : '+e.message);}
    return;
  }
  try{
    // 1) publier vers les partages de la campagne (page Groupe des joueurs)
    await fbDb.collection('campaigns').doc(currentCampaignId).update({shares:firebase.firestore.FieldValue.arrayUnion(it)});
    // 2) seulement ensuite le retirer de la réserve (si l'étape 1 échoue, rien n'est perdu)
    _mjReserve.splice(idx,1);
    await saveMJData();
    if(typeof _dsShares!=='undefined')_dsShares=null; // force le rechargement des partages MJ
    renderMJContent();
    showToast('🔎 Découvert par le groupe.');
  }catch(e){showToast('❌ Une erreur est survenue, réessaie.');}
}

// ─────────────────────────────────────────
// TAB JOUEURS
// ─────────────────────────────────────────
