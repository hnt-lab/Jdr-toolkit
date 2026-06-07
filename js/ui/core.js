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
// Avatar du compte affiché dans les en-têtes (clic → Profil). Remplace l'ancien bouton « 👤 Profil ».
function _refreshNavAvatars(){
  const a=(typeof currentUserData!=='undefined'&&currentUserData&&currentUserData.avatar)?currentUserData.avatar:'👤';
  ['hubUserBtn','mjUserBtn','ficheUserBtn'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=a;});
}
// Barre de modes : Hub · Personnage/MJ (Profil = avatar, chuchotements = dé).
function _isMJOfCurrent(){return !!window._currentCampIsMJ;}
function _navGoChar(){
  // Ré-entrer dans la campagne (même mécanisme que le bouton « Ouvrir » → gère Personnage ET MJ)
  if(currentTableId&&currentCampaignId&&typeof enterCampaign==='function'){enterCampaign(currentTableId,currentCampaignId);return;}
  if(typeof showToast==='function')showToast('Rejoins ton groupe depuis le Hub d\'abord.');
}
function _refreshModeNav(){
  const nav=document.getElementById('modeNav');if(!nav)return;
  // La barre de modes n'apparaît qu'une fois une campagne rejointe
  if(!currentCampaignId){nav.style.display='none';return;}
  nav.style.display='flex';
  const vis=el=>el&&el.style.display!=='none';
  const onHub=vis(document.getElementById('hubScreen'));
  const onChar=vis(document.getElementById('app'))||vis(document.getElementById('mjScreen'));
  const mj=_isMJOfCurrent();
  nav.querySelectorAll('.mode-char-lbl').forEach(el=>el.textContent=mj?'MJ':'Personnage');
  nav.querySelectorAll('.mode-char-ico').forEach(el=>el.textContent=mj?'🎲':'🧙');
  const hb=nav.querySelector('.mode-hub'),ch=nav.querySelector('.mode-char');
  if(hb)hb.classList.toggle('on',!!onHub);
  if(ch)ch.classList.toggle('on',!!onChar);
}
function showAuthScreen(){
  document.getElementById('authScreen').style.display='flex';
  document.getElementById('hubScreen').style.display='none';
  document.getElementById('app').style.display='none';
  const _df=document.getElementById('diceFloat');if(_df)_df.style.display='none';
  const _ds=document.getElementById('diceShortcuts');if(_ds)_ds.style.display='none';
  const _mn=document.getElementById('modeNav');if(_mn)_mn.style.display='none';
}
async function joinGroupOnly(tableId,campaignId){
  const tableData=_hubCache&&_hubCache.find(t=>t.id===tableId);
  currentTableId=tableId;currentCampaignId=campaignId;
  currentTableName=tableData?.name||'';currentTableMjId=tableData?.mjId||null;
  _groupOnlyMode=true;
  stopAllListeners();
  _groupData=[];_activeCombatState=null;_combatListenerInitialized=false;_prevCombatTurnUid=null;
  _groupHudOpen=false; // ne PAS ouvrir le panneau : juste afficher le bouton 👥 (l'utilisateur l'ouvre quand il veut)
  // Le bouton dé flottant apparaît aussi (il donne le raccourci vers sa propre fiche)
  const _df=document.getElementById('diceFloat');if(_df)_df.style.display='flex';
  const hud=document.getElementById('partyHud');
  const panel=document.getElementById('partyHudPanel');
  if(hud&&panel){
    hud.style.display='block';
    panel.style.display='none';
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
  const _df=document.getElementById('diceFloat');if(_df)_df.style.display='none';
  const vEl=document.getElementById('hubVersion');if(vEl&&typeof APP_VERSION!=='undefined')vEl.textContent='v'+APP_VERSION;
  const hud=document.getElementById('partyHud');if(hud)hud.style.display='none';
  const banner=document.getElementById('combatTurnBanner');if(banner)banner.style.display='none';
  const mjBadge=document.getElementById('hubMJBadge');if(mjBadge)mjBadge.style.display='none';
  document.getElementById('authScreen').style.display='none';
  document.getElementById('hubScreen').style.display='block';
  document.getElementById('app').style.display='none';
  document.getElementById('mjScreen').style.display='none';
  _expandedCamp=null;
  _refreshNavAvatars();_refreshModeNav();
  renderHub();
  if(!localStorage.getItem('tuto_player_done')) setTimeout(()=>startTutorial('player'),700);
}
function showApp(){
  document.getElementById('authScreen').style.display='none';
  document.getElementById('hubScreen').style.display='none';
  document.getElementById('app').style.display='block';
  document.getElementById('mjScreen').style.display='none';
  const _df=document.getElementById('diceFloat');if(_df)_df.style.display='flex';
  mjMode=false;
  const mjBtn=document.getElementById('mjBtn');
  if(mjBtn) mjBtn.style.display='none';
  const hdrUser=document.getElementById('hdrUser');
  if(hdrUser&&currentUserData) hdrUser.textContent=`⚔ ${currentUserData.displayName}`;
  _refreshNavAvatars();_refreshModeNav();
}

// ─── CACHE INVALIDATION ───
const _DB_VERSION='comp-v1'; // bump → purge l'ancien cache (passage au système de paquets COMP)
(function(){
  if(localStorage.getItem('_db_version')!==_DB_VERSION){
    // anciennes clés de cache mono-fichier (remplacées par comp_<packId>_<type>)
    ['dnd5e_spells_db','dnd5e_items_db','dnd5e_monsters_db','dnd5e_feats_db','dnd5e_races_db','dnd5e_backgrounds_db','dnd5e_classes_db'].forEach(k=>localStorage.removeItem(k));
    // purge aussi tout cache de paquets éventuel d'une version précédente
    try{ Object.keys(localStorage).filter(k=>k.indexOf('comp_')===0&&k!=='comp_active').forEach(k=>localStorage.removeItem(k)); }catch(e){}
    localStorage.setItem('_db_version',_DB_VERSION);
  }
})();

// ─── CINÉMATIQUE D'ENTRÉE (login réussi → HUD) ───
function _mjtkEntrance(done){
  const scene=document.getElementById('authScreen');
  const panel=document.querySelector('.mjtkBox');
  if(panel){panel.style.transition='opacity .45s ease, transform .45s ease';panel.style.opacity='0';panel.style.transform=(panel.style.transform||'')+' scale(.9)';}
  const ov=document.createElement('div');ov.id='mjtkEntrance';
  const ring=[[0,-150],[130,-75],[130,75],[0,150],[-130,75],[-130,-75]];
  const glyphs=ring.map(p=>`<svg width="40" height="40" viewBox="0 0 40 40" style="transform:translate(-50%,-50%) translate(${p[0]}px,${p[1]}px)"><circle cx="20" cy="20" r="16" fill="none" stroke="#9ff0e6" stroke-width="1.6"/><polygon points="20,7 31,27 9,27" fill="none" stroke="#cdeef2" stroke-width="1.4"/><circle cx="20" cy="20" r="3" fill="#9ff0e6"/></svg>`).join('');
  ov.innerHTML=`<div class="mjtkGlyphs">${glyphs}</div><div class="mjtkBurst"></div><div class="mjtkFlash"></div>`;
  document.body.appendChild(ov);
  if(scene){scene.style.transition='transform 1.2s cubic-bezier(.55,0,.4,1)';scene.style.transformOrigin='50% 52%';}
  setTimeout(()=>{if(scene)scene.style.transform='scale(2.6)';},1250);
  setTimeout(()=>{try{done&&done();}catch(e){}},2350);
  setTimeout(()=>{if(ov.parentNode)ov.remove();if(scene){scene.style.transform='';scene.style.transition='';scene.style.transformOrigin='';}if(panel){panel.style.opacity='';panel.style.transform='';panel.style.transition='';}},3300);
}

// ─── AUTH STATE ───
fbAuth.onAuthStateChanged(async user=>{
  if(user){
    currentUser=user;
    try{
      const doc=await fbDb.collection('users').doc(user.uid).get();
      currentUserData=doc.exists?doc.data():{displayName:user.displayName||'Utilisateur',role:'Joueur'};
    }catch(e){currentUserData={displayName:user.displayName||'Utilisateur',role:'Joueur'};}
    hideSplash();
    if(typeof _refreshNavAvatars==='function')_refreshNavAvatars();
    if(typeof loadMJCompLib==='function')loadMJCompLib();
    const _authEl=document.getElementById('authScreen');
    if(_authEl&&getComputedStyle(_authEl).display!=='none'&&typeof _mjtkEntrance==='function'){_mjtkEntrance(showHub);}
    else{showHub();}
  }else{
    currentUser=null;currentUserData=null;
    hideSplash();
    showAuthScreen();
  }
});

// ─── SWIPE ENTRE ONGLETS (tactile / mobile) ───
// Glisser horizontalement dans le corps d'un menu à onglets passe à l'onglet voisin.
// Marche pour la fiche joueur (#tabContent / setTab) ET l'écran MJ (#mjTabContent / setMJTab).
(function(){
  let x0=null,y0=null,t0=0,ctx=null,skip=false;
  // Ne pas voler le geste si on glisse dans un élément qui scrolle horizontalement (tableau large, etc.)
  function _hScrollable(node,stop){
    while(node&&node!==stop&&node!==document.body){
      if(node.scrollWidth-node.clientWidth>8){
        const ox=getComputedStyle(node).overflowX;
        if(ox==='auto'||ox==='scroll')return true;
      }
      node=node.parentElement;
    }
    return false;
  }
  // Lit l'ordre RÉEL des onglets depuis la barre (respecte l'ordre perso + onglets conditionnels)
  function _tabIds(barId){
    const bar=document.getElementById(barId);if(!bar)return[];
    return [...bar.querySelectorAll('button')].map(b=>{
      const m=(b.getAttribute('onclick')||'').match(/set(?:MJ)?Tab\('([^']+)'\)/);
      return m?m[1]:null;
    }).filter(Boolean);
  }
  function _go(dir){
    if(ctx==='player'){
      const ids=_tabIds('tabBar');const i=ids.indexOf(state.activeTab);
      const j=i+dir;if(i<0||j<0||j>=ids.length)return;
      if(typeof setTab==='function')setTab(ids[j]);
    }else if(ctx==='mj'){
      const ids=_tabIds('mjTabBar');const i=ids.indexOf(_mjTab);
      const j=i+dir;if(i<0||j<0||j>=ids.length)return;
      if(typeof setMJTab==='function')setMJTab(ids[j]);
    }
  }
  document.addEventListener('touchstart',e=>{
    ctx=null;skip=false;x0=null;
    if(e.touches.length!==1)return;
    const t=e.touches[0],tgt=t.target;
    const pc=document.getElementById('tabContent');
    const mc=document.getElementById('mjTabContent');
    let container=null;
    if(pc&&pc.contains(tgt)&&document.getElementById('app')?.style.display!=='none'){ctx='player';container=pc;}
    else if(mc&&mc.contains(tgt)&&document.getElementById('mjScreen')?.style.display!=='none'){ctx='mj';container=mc;}
    else return;
    if(_hScrollable(tgt,container)){skip=true;return;}
    x0=t.clientX;y0=t.clientY;t0=Date.now();
  },{passive:true});
  document.addEventListener('touchend',e=>{
    if(x0===null||skip||!ctx)return;
    const t=e.changedTouches[0];
    const dx=t.clientX-x0,dy=t.clientY-y0,dt=Date.now()-t0;
    x0=null;
    if(dt>700)return;                        // trop lent = pas un swipe
    if(Math.abs(dx)<60)return;               // trop court
    if(Math.abs(dx)<Math.abs(dy)*1.6)return; // trop vertical (= scroll)
    _go(dx<0?1:-1);                          // gauche → onglet suivant, droite → précédent
  },{passive:true});
})();
