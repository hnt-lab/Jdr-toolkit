
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

function renderMJTabs(){
  const tabs=[
    {id:'joueurs',label:'⚔ Joueurs'},
    {id:'combat',label:'⚡ Combat'},
    {id:'pnj',label:'🐉 PNJ / Monstres'},
    {id:'objets',label:'💰 Objets'},
    {id:'journal',label:'📓 Journal MJ'},
    {id:'regles',label:'📖 Règles'},
  ];
  const bar=document.getElementById('mjTabBar');
  if(bar) bar.innerHTML=tabs.map(t=>{
    const combatExtra=t.id==='combat'?(_mjCombatStarted?' mj-tab-combat-active':' mj-tab-combat-idle'):'';
    return`<button class="mj-tab${_mjTab===t.id?' on':''}${combatExtra}" onclick="setMJTab('${t.id}')">${t.label}</button>`;
  }).join('');
  if(typeof _initTabScrollers==='function')setTimeout(_initTabScrollers,0);
  renderMJContent();
}

function renderMJContent(){
  const el=document.getElementById('mjTabContent');
  if(!el)return;
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
async function loadMJPlayersData(){
  try{
    const snap=await fbDb.collection('characters').where('campaignId','==',currentCampaignId).get();
    const players=[];
    for(const doc of snap.docs){
      if(doc.id.endsWith('_mj'))continue;
      const data=doc.data();
      if(data.ejectedFromCampaign)continue;
      const charData=data.characterData||{};
      let playerName='Joueur';let avatar='⚔';
      try{const u=await fbDb.collection('users').doc(data.userId).get();if(u.exists){playerName=u.data().displayName||'Joueur';avatar=u.data().avatar||'⚔';}}catch(e){}
      players.push({uid:data.userId,playerName,avatar,charData,docId:doc.id});
    }
    _mjPlayersData=players;
  }catch(e){showToast('❌ Erreur chargement joueurs : '+e.message);}
}

// ── Sauvegarde données MJ (journal + PNJ + objets) ──
async function saveMJData(){
  if(!currentUser||!currentCampaignId)return;
  try{
    await fbDb.collection('characters').doc(currentUser.uid+'_'+currentCampaignId+'_mj').set({
      entries:_mjJournal,npcs:_mjNPCs,objets:_mjObjets,reserve:_mjReserve,
      // tableId AJOUTÉ le 2026-07-22 : sans lui, les règles Firestore refusaient ce document
      // aux joueurs → groupe ET combat cassés (cf. _tools/firestore.rules, match /characters).
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
function mjTabReserve(){
  const _shHTML=(typeof _dsShareHTML==='function')?_dsShareHTML:null;
  const items=(_mjReserve||[]).map((it,i)=>{
    const inner=_shHTML?_shHTML(it,i,false):`<div class="ds-note">${esc(it.title||it.text||'?')}</div>`;
    return`<div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:8px">
      <div style="flex:1;min-width:0">${inner}</div>
      <div style="display:flex;flex-direction:column;gap:4px;flex:none">
        <button class="btn bsm bac" onclick="mjPublishReserveItem(${i})" title="Révéler au groupe">🎁 Donner</button>
        <button class="btn bsm bdanger" onclick="mjDeleteReserveItem(${i})" title="Supprimer">🗑</button>
      </div>
    </div>`;
  }).join('');
  return`<div class="panel"><div class="pt">🎒 Réserve</div>
    <p style="font-size:13px;color:var(--text3);line-height:1.5;margin-bottom:10px">Ce que tu prépares <strong>sans le donner tout de suite</strong>. Clique <strong>🎁 Donner</strong> quand le moment arrive : l'objet passe alors dans la page Groupe des joueurs.</p>
    <div style="display:flex;gap:8px;margin-bottom:12px">
      <button class="btn" style="flex:1" onclick="mjOpenReserveModal('indice')">📜 Indice</button>
      <button class="btn" style="flex:1" onclick="mjOpenReserveModal('artefact')">🗡 Artefact</button>
      <button class="btn" style="flex:1" onclick="mjOpenReserveModal('quete')">🗝 Obj. quête</button>
    </div>
    ${items||'<div class="ds-note" style="font-style:italic;padding:6px 0">Réserve vide. Prépare un indice, un artefact ou un objet de quête ci-dessus — il restera invisible aux joueurs jusqu\'à ce que tu le donnes.</div>'}
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
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="mjConfirmReserve('${type}')">🎒 Mettre en réserve</button>
    </div>`);
}
async function mjConfirmReserve(type){
  const title=((document.getElementById('mjResTitle')||{}).value||'').trim();
  const text=((document.getElementById('mjResText')||{}).value||'').trim();
  if(!text&&!title){showToast('❌ Écris au moins un titre ou un texte.');return;}
  const item={type,title,text,ts:Date.now()};
  if(type==='indice'){const mEl=document.querySelector('.mjResMat.bac');item.matiere=mEl?mEl.dataset.m:'parchemin';}
  _mjReserve.push(item);
  closeModal();
  await saveMJData();
  renderMJContent();
  showToast('🎒 Ajouté à la réserve.');
}
async function mjDeleteReserveItem(idx){
  if(idx<0||idx>=_mjReserve.length)return;
  _mjReserve.splice(idx,1);
  await saveMJData();
  renderMJContent();
  showToast('🗑 Retiré de la réserve.');
}
async function mjPublishReserveItem(idx){
  const it=_mjReserve[idx];
  if(!it||!currentCampaignId)return;
  try{
    // 1) publier vers les partages de la campagne (page Groupe des joueurs)
    await fbDb.collection('campaigns').doc(currentCampaignId).update({shares:firebase.firestore.FieldValue.arrayUnion(it)});
    // 2) seulement ensuite le retirer de la réserve (si l'étape 1 échoue, rien n'est perdu)
    _mjReserve.splice(idx,1);
    await saveMJData();
    if(typeof _dsShares!=='undefined')_dsShares=null; // force le rechargement des partages MJ
    renderMJContent();
    showToast('🎁 Mis à disposition du groupe.');
  }catch(e){showToast('❌ Une erreur est survenue, réessaie.');}
}

// ─────────────────────────────────────────
// TAB JOUEURS
// ─────────────────────────────────────────
