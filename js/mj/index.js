
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// INTERFACE MJ
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function showMJScreen(){
  document.getElementById('authScreen').style.display='none';
  document.getElementById('hubScreen').style.display='none';
  document.getElementById('app').style.display='none';
  document.getElementById('mjScreen').style.display='block';
  const el=document.getElementById('mjHdrCamp');
  if(el) el.textContent=(currentTableName?currentTableName+' â€” ':'')+currentCampaignName;
  _mjTab='joueurs';
  renderMJTabs();
  if(!localStorage.getItem('tuto_mj_done')) setTimeout(()=>startTutorial('mj'),700);
}

function setMJTab(tab){
  _mjTab=tab;
  renderMJTabs();
  renderMJContent();
}

function renderMJTabs(){
  const tabs=[
    {id:'joueurs',label:'âš” Joueurs'},
    {id:'combat',label:'âš¡ Combat'},
    {id:'pnj',label:'ðŸ‰ PNJ / Monstres'},
    {id:'objets',label:'ðŸ’° Objets'},
    {id:'journal',label:'ðŸ““ Journal MJ'},
    {id:'regles',label:'ðŸ“– RÃ¨gles'},
  ];
  const bar=document.getElementById('mjTabBar');
  if(bar) bar.innerHTML=tabs.map(t=>{
    const combatExtra=t.id==='combat'?(_mjCombatStarted?' mj-tab-combat-active':' mj-tab-combat-idle'):'';
    return`<button class="mj-tab${_mjTab===t.id?' on':''}${combatExtra}" onclick="setMJTab('${t.id}')">${t.label}</button>`;
  }).join('');
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
}

// â”€â”€ Chargement des joueurs de la campagne â”€â”€
async function loadMJPlayersData(){
  try{
    const snap=await fbDb.collection('characters').where('campaignId','==',currentCampaignId).get();
    const players=[];
    for(const doc of snap.docs){
      if(doc.id.endsWith('_mj'))continue;
      const data=doc.data();
      if(data.ejectedFromCampaign)continue;
      const charData=data.characterData||{};
      let playerName='Joueur';let avatar='âš”';
      try{const u=await fbDb.collection('users').doc(data.userId).get();if(u.exists){playerName=u.data().displayName||'Joueur';avatar=u.data().avatar||'âš”';}}catch(e){}
      players.push({uid:data.userId,playerName,avatar,charData,docId:doc.id});
    }
    _mjPlayersData=players;
  }catch(e){showToast('âŒ Erreur chargement joueurs : '+e.message);}
}

// â”€â”€ Sauvegarde donnÃ©es MJ (journal + PNJ + objets) â”€â”€
async function saveMJData(){
  if(!currentUser||!currentCampaignId)return;
  try{
    await fbDb.collection('characters').doc(currentUser.uid+'_'+currentCampaignId+'_mj').set({
      entries:_mjJournal,npcs:_mjNPCs,objets:_mjObjets,
      userId:currentUser.uid,campaignId:currentCampaignId,
      updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    },{merge:true});
  }catch(e){showToast('âŒ Erreur sauvegarde : '+e.message);}
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// TAB JOUEURS
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
