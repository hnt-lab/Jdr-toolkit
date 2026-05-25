let _mjJournal=[];
let _journalSubTab='mj';
let _playerJournalSubTab='entries';
let _compilationData=null;
// MJ Screen state
let _mjTab='joueurs';
let _mjPlayersData=[];
let _mjCustomFeats=[];
let _mjCompLib={};
let _mjActiveCompId=null;
let _mjCombatants=[];
let _mjCombatStarted=false;
let _mjCurrentTurn=0;
let _mjRound=1;
let _mjCombatLog=[];
let _mjNPCs=[];
let _mjObjets=[];
let _mjSelectedNPC=null;
let _encMonsters=[];
let _encGroupSize=4;
let _encGroupLevel=5;
let _encRarityFilter='';
let ITEMS_DB=null;
let MONSTERS_DB=null;
let FEATS_DB=null;
let RACES_DB=null;
let BACKGROUNDS_DB=null;
let CLASSES_DB=null;
let _mjReglesComp=''; // '' | 'dons' | 'races' | 'historiques' | 'classes'
let _mjNewMonsterAttacks=[];
let _mjNewMonsterSpells=[];
let _mjNewMonsterTraits=[];
let _mjEditingMonsterIdx=-1;

// ─── NAVIGATION ───
function showAuthScreen(){
  document.getElementById('authScreen').style.display='flex';
  document.getElementById('hubScreen').style.display='none';
  document.getElementById('app').style.display='none';
}
async function joinGroupOnly(tableId,campaignId){
  const tableData=_hubCache&&_hubCache.find(t=>t.id===tableId);
  currentTableId=tableId;currentCampaignId=campaignId;
  currentTableName=tableData?.name||'';currentTableMjId=tableData?.mjId||null;
  _groupOnlyMode=true;
  stopAllListeners();
  _groupData=[];_activeCombatState=null;_combatListenerInitialized=false;_prevCombatTurnUid=null;
  _groupHudOpen=true;
  const hud=document.getElementById('partyHud');
  const panel=document.getElementById('partyHudPanel');
  if(hud&&panel){
    hud.style.display='block';
    panel.style.display='block';
    panel.innerHTML='<div style="padding:12px;text-align:center;color:var(--text3);font-size:12px">Connexion au groupe...</div>';
  }
  startGroupListener(campaignId);
  if(currentTableMjId)startCombatListener(campaignId,currentTableMjId);
  // Animation éclair sur le bouton HUD
  const hudBtn=document.getElementById('partyHudBtn');
  if(hudBtn){hudBtn.style.transition='box-shadow .3s';hudBtn.style.boxShadow='0 0 0 5px rgba(200,168,75,.5)';setTimeout(()=>{hudBtn.style.boxShadow='';},1200);}
}
function showHub(){
  stopAllListeners();
  _groupData=[];_activeCombatState=null;_combatListenerInitialized=false;_prevCombatTurnUid=null;_groupHudOpen=false;_groupOnlyMode=false;_hideHudDetail();
  const hud=document.getElementById('partyHud');if(hud)hud.style.display='none';
  const banner=document.getElementById('combatTurnBanner');if(banner)banner.style.display='none';
  const mjBadge=document.getElementById('hubMJBadge');if(mjBadge)mjBadge.style.display='none';
  document.getElementById('authScreen').style.display='none';
  document.getElementById('hubScreen').style.display='block';
  document.getElementById('app').style.display='none';
  document.getElementById('mjScreen').style.display='none';
  _expandedCamp=null;
  const btn=document.getElementById('hubUserBtn');
  if(btn&&currentUserData) btn.innerHTML=`👤 ${esc(currentUserData.displayName)}`;
  renderHub();
  if(!localStorage.getItem('tuto_player_done')) setTimeout(()=>startTutorial('player'),700);
}
function showApp(){
  document.getElementById('authScreen').style.display='none';
  document.getElementById('hubScreen').style.display='none';
  document.getElementById('app').style.display='block';
  document.getElementById('mjScreen').style.display='none';
  mjMode=false;
  const mjBtn=document.getElementById('mjBtn');
  if(mjBtn) mjBtn.style.display='none';
  const hdrUser=document.getElementById('hdrUser');
  if(hdrUser&&currentUserData) hdrUser.textContent=`⚔ ${currentUserData.displayName}`;
}

// ─── CACHE INVALIDATION ───
const _DB_VERSION='srd-v1';
(function(){
  if(localStorage.getItem('_db_version')!==_DB_VERSION){
    ['dnd5e_spells_db','dnd5e_items_db','dnd5e_monsters_db','dnd5e_feats_db','dnd5e_races_db','dnd5e_backgrounds_db','dnd5e_classes_db'].forEach(k=>localStorage.removeItem(k));
    localStorage.setItem('_db_version',_DB_VERSION);
  }
})();

// ─── AUTH STATE ───
fbAuth.onAuthStateChanged(async user=>{
  if(user){
    currentUser=user;
    try{
      const doc=await fbDb.collection('users').doc(user.uid).get();
      currentUserData=doc.exists?doc.data():{displayName:user.displayName||'Utilisateur',role:'Joueur'};
    }catch(e){currentUserData={displayName:user.displayName||'Utilisateur',role:'Joueur'};}
    hideSplash();
    showHub();
    loadMJCompLib();
  }else{
    currentUser=null;currentUserData=null;
    hideSplash();
    showAuthScreen();
  }
});
