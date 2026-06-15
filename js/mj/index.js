
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
  _mjTab='joueurs';
  renderMJTabs();
  if(!localStorage.getItem('tuto_mj_done')) setTimeout(()=>startTutorial('mj'),700);
}

function setMJTab(tab){
  _mjTab=tab;
  renderMJTabs();
  renderMJContent();
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
      entries:_mjJournal,npcs:_mjNPCs,objets:_mjObjets,
      userId:currentUser.uid,campaignId:currentCampaignId,
      updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    },{merge:true});
  }catch(e){showToast('❌ Erreur sauvegarde : '+e.message);}
}

// ─────────────────────────────────────────
// TAB JOUEURS
// ─────────────────────────────────────────
