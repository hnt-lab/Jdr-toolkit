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
let _mjReserve=[]; // lot B — antichambre du MJ : indices/artefacts/objets préparés, pas encore révélés
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
  if(typeof _placeModeNavDesktop==='function')_placeModeNavDesktop(); // desktop : nav dans l'en-tête ; mobile : bandeau bas
}
// SOURCE UNIQUE de la visibilité des boutons flottants (dé + groupe). À appeler depuis TOUS les écrans.
// ⚠️ RÉGRESSION RÉCURRENTE : ne JAMAIS re-cacher le dé/groupe ailleurs (showHub/showApp/showMJScreen).
// Règle : dé visible dès qu'une campagne est active (Hub + jeu) ; groupe visible si campagne active + JOUEUR.
function _syncFloatingUI(){
  const auth=document.getElementById('authScreen');
  const onAuth=auth&&auth.style.display!=='none';
  const hasCamp=!!currentCampaignId;
  const mj=!!window._currentCampIsMJ;
  // Dé = élément PERMANENT du chrome (2026-07-19) : visible dès la connexion, campagne ou pas
  const _df=document.getElementById('diceFloat');if(_df)_df.style.display=(!onAuth)?'flex':'none';
  const hud=document.getElementById('partyHud');if(hud)hud.style.display=(!onAuth&&hasCamp&&!mj)?'block':'none';
}
function showAuthScreen(){
  document.getElementById('authScreen').style.display='flex';
  document.getElementById('hubScreen').style.display='none';
  document.getElementById('app').style.display='none';
  const _ds=document.getElementById('diceShortcuts');if(_ds)_ds.style.display='none';
  const _mn=document.getElementById('modeNav');if(_mn)_mn.style.display='none';
  _syncFloatingUI();
}
async function joinGroupOnly(tableId,campaignId){
  const tableData=_hubCache&&_hubCache.find(t=>t.id===tableId);
  currentTableId=tableId;currentCampaignId=campaignId;
  currentTableName=tableData?.name||'';currentTableMjId=tableData?.mjId||null;
  _groupOnlyMode=true;
  saveSessionState({tableId,campaignId,mode:'group'}); // lot 0 : F5 revient en mode groupe, pas au Hub
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
  // Chuchotements aussi en mode groupe (sinon : historique vide côté joueur — bug 2026-06-12)
  if(typeof startWhisperListener==='function'&&currentUser)startWhisperListener(tableId,currentUser.uid);
  // Charge SA fiche pour que le lanceur de dé propose les jets du personnage (pas le panneau générique)
  try{
    const _cdoc=await fbDb.collection('characters').doc(currentUser.uid+'_'+campaignId).get();
    if(_cdoc.exists&&_cdoc.data().characterData){state.players=[migratePlayer(_cdoc.data().characterData)];state.activeIdx=0;}
  }catch(e){}
  // Animation éclair sur le bouton HUD
  const hudBtn=document.getElementById('partyHudBtn');
  if(hudBtn){hudBtn.style.transition='box-shadow .3s';hudBtn.style.boxShadow='0 0 0 5px rgba(200,168,75,.5)';setTimeout(()=>{hudBtn.style.boxShadow='';},1200);}
  // Afficher le bandeau de nav [Hub / Personnage] dès qu'on rejoint le groupe
  // (le bouton « Personnage » du bandeau remplace l'ancien raccourci fiche du menu dé)
  if(typeof _refreshModeNav==='function')_refreshModeNav();
}
function showHub(){
  stopAllListeners();
  _groupData=[];_activeCombatState=null;_combatListenerInitialized=false;_prevCombatTurnUid=null;_groupHudOpen=false;_groupOnlyMode=false;_hideHudDetail();
  const vEl=document.getElementById('hubVersion');if(vEl&&typeof APP_VERSION!=='undefined')vEl.textContent='v'+APP_VERSION;
  // Dé flottant + groupe PERSISTANTS au Hub quand une campagne est active (on « jette un œil » sans quitter le groupe)
  // Groupe vivant au Hub : relancer le listener (stopAllListeners l'a coupé) si campagne JOUEUR active
  if(currentCampaignId&&!window._currentCampIsMJ){const _pp=document.getElementById('partyHudPanel');if(_pp)_pp.style.display='none';startGroupListener(currentCampaignId);if(currentTableMjId)startCombatListener(currentCampaignId,currentTableMjId);if(typeof startWhisperListener==='function'&&currentUser&&currentTableId)startWhisperListener(currentTableId,currentUser.uid);}
  const banner=document.getElementById('combatTurnBanner');if(banner)banner.style.display='none';
  const mjBadge=document.getElementById('hubMJBadge');if(mjBadge)mjBadge.style.display='none';
  document.getElementById('authScreen').style.display='none';
  document.getElementById('hubScreen').style.display='block';
  document.getElementById('app').style.display='none';
  document.getElementById('mjScreen').style.display='none';
  // A7 : au retour au Hub, la campagne EN COURS reste dépliée (au lieu de tout replier).
  // Sinon on repliait exactement la carte que l'utilisateur venait de quitter.
  // ⚠ _expandedCamp est une clé COMPOSITE « tableId_campaignId » (hub.js:5-6, hub.js:115) —
  //   y mettre le seul campaignId ne correspondait à aucune carte : rien ne se dépliait.
  {const _cur=(typeof loadSessionState==='function')?loadSessionState():null;
   _expandedCamp=(_cur&&_cur.tableId&&_cur.campaignId)?(_cur.tableId+'_'+_cur.campaignId):null;}
  _refreshNavAvatars();_refreshModeNav();_syncFloatingUI();
  // Lot 0 : on note l'ÉCRAN sans toucher à la partie en cours — un F5 depuis le Hub reste au Hub,
  // mais la table/campagne restent mémorisées (« Partie en cours »).
  saveSessionState({mode:'hub'});
  const _rh=renderHub(); // renderHub est async : la promesse sert à la restauration (voir _restoreSession)
  if(!localStorage.getItem('tuto_player_done')) setTimeout(()=>startTutorial('player'),700);
  return _rh;
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
  _refreshNavAvatars();_refreshModeNav();_syncFloatingUI();
}

// ─── CACHE INVALIDATION ───
const _DB_VERSION='comp-v2'; // bump → purge les caches de données comp_* (garde le choix de paquets). v2 : spells_db legacy nettoyé en 482 officiels FR (2026-07-07)
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

// ─── RESTAURATION DE SESSION (lot 0, 2026-07-22) ───
// Rouvre la partie où l'utilisateur en était au lieu de repartir du Hub à chaque F5.
//
// ⚠️ TIMING CRITIQUE — NE PAS APPELER enterCampaign() PLUS TÔT.
// enterCampaign déduit le rôle MJ ainsi (hub.js) :
//     const tableData=_hubCache&&_hubCache.find(t=>t.id===tableId);
//     const asMJ=!!(tableData&&tableData.mjId===currentUser.uid);
// et _hubCache n'est rempli qu'à la FIN de renderHub() (async, plusieurs requêtes réseau).
// Restaurer avant ⇒ _hubCache null ⇒ asMJ=false ⇒ un MJ serait rouvert comme JOUEUR.
// D'où l'ordre imposé : showHub() (qui attend renderHub) PUIS restauration.
// ⚠️ La note est lue AVANT showHub() et passée en argument : showHub() écrit mode:'hub',
// donc une lecture faite après ne verrait jamais 'play'/'group' — la restauration ne se
// déclencherait plus jamais. Ne pas « simplifier » en relisant loadSessionState() ici.
async function _restoreSession(s){
  if(!s||!s.tableId||!s.campaignId)return false;
  if(s.mode!=='play'&&s.mode!=='group')return false;
  // La table et la campagne existent-elles ENCORE ? Couvre d'un coup : table supprimée,
  // campagne supprimée, joueur exclu de la table. Le rôle MJ/joueur est redéduit par
  // enterCampaign à partir de la table — jamais lu depuis la note.
  const t=_hubCache&&_hubCache.find(x=>x.id===s.tableId);
  const c=t&&(t.campaigns||[]).find(x=>x.id===s.campaignId);
  if(!t||!c){clearSessionState();return false;} // on reste au Hub, silencieusement
  if(s.mode==='group')await joinGroupOnly(s.tableId,s.campaignId);
  else await enterCampaign(s.tableId,s.campaignId,t.name,c.name);
  return true;
}
async function _bootToLastScreen(){
  const s=loadSessionState(); // LIRE D'ABORD — showHub() va écrire mode:'hub' par-dessus
  try{
    await showHub();          // remplit _hubCache : indispensable avant toute restauration
    await _restoreSession(s); // échec ⇒ on reste au Hub, que showHub a déjà noté comme mode courant
  }catch(e){}
  finally{hideSplash();}      // retardé si une restauration était prévue (voir onAuthStateChanged)
}

// ─── AUTH STATE ───
fbAuth.onAuthStateChanged(async user=>{
  if(user){
    currentUser=user;
    try{
      const doc=await fbDb.collection('users').doc(user.uid).get();
      currentUserData=doc.exists?doc.data():{displayName:user.displayName||'Utilisateur',role:'Joueur'};
    }catch(e){currentUserData={displayName:user.displayName||'Utilisateur',role:'Joueur'};}
    // Listener TEMPS RÉEL sur le doc user → « Mes personnages » (charLib), avatar et pseudo
    // restent à jour ENTRE APPAREILS. Avant : figé à la connexion → un perso créé sur PC
    // n'apparaissait pas sur mobile (et inversement) tant qu'on ne se reconnectait pas.
    try{
      if(window._userDocUnsub)window._userDocUnsub();
      window._userDocUnsub=fbDb.collection('users').doc(user.uid).onSnapshot(d=>{
        if(d.exists){currentUserData=d.data();if(typeof _refreshNavAvatars==='function')_refreshNavAvatars();}
      },()=>{});
    }catch(e){}
    // Lot 0 : si une partie est à restaurer, on GARDE le splash le temps de la restauration —
    // sinon l'utilisateur voit le Hub clignoter une fraction de seconde avant sa fiche.
    // (_bootToLastScreen retire le splash dans tous les cas, y compris en cas d'erreur.)
    const _sess=loadSessionState();
    if(!(_sess&&_sess.mode==='play'&&_sess.tableId&&_sess.campaignId))hideSplash();
    if(typeof _refreshNavAvatars==='function')_refreshNavAvatars();
    if(typeof loadMJCompLib==='function')loadMJCompLib();
    const _authEl=document.getElementById('authScreen');
    if(_authEl&&getComputedStyle(_authEl).display!=='none'&&typeof _mjtkEntrance==='function'){_mjtkEntrance(_bootToLastScreen);}
    else{_bootToLastScreen();}
  }else{
    if(window._userDocUnsub){try{window._userDocUnsub();}catch(e){}window._userDocUnsub=null;}
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

// ── Onglets scrollables : conteneur .tab-scroller + flèches latérales ──
// Enveloppe #tabBar / #mjTabBar dans un conteneur (créé une seule fois, persiste car
// renderTabBar/renderMJTabs ne touchent que l'innerHTML de la barre, pas le parent),
// y pose 2 flèches « ‹ › » et bascule .more-l/.more-r selon la position de défilement.
function _updTabScroller(wrap){
  const bar=wrap.querySelector('.tabs,.mj-tabs'); if(!bar) return;
  const max=bar.scrollWidth-bar.clientWidth;
  wrap.classList.toggle('more-l',bar.scrollLeft>4);
  wrap.classList.toggle('more-r',max>2 && bar.scrollLeft<max-3);
}
function _initTabScrollers(){
  ['tabBar','mjTabBar'].forEach(id=>{
    const bar=document.getElementById(id); if(!bar) return;
    let wrap=bar.parentElement;
    if(!wrap || !wrap.classList.contains('tab-scroller')){
      wrap=document.createElement('div'); wrap.className='tab-scroller';
      bar.parentNode.insertBefore(wrap,bar); wrap.appendChild(bar);
      const mk=(cls,glyph)=>{const b=document.createElement('button');b.type='button';b.className='tab-arrow '+cls;b.textContent=glyph;b.tabIndex=-1;b.setAttribute('aria-hidden','true');return b;};
      const la=mk('tab-arrow-l','‹'), ra=mk('tab-arrow-r','›');
      const step=()=>Math.max(120,Math.round(bar.clientWidth*0.6));
      la.addEventListener('click',()=>bar.scrollBy({left:-step(),behavior:'smooth'}));
      ra.addEventListener('click',()=>bar.scrollBy({left:step(),behavior:'smooth'}));
      wrap.appendChild(la); wrap.appendChild(ra);
      bar.addEventListener('scroll',()=>_updTabScroller(wrap),{passive:true});
    }
    _updTabScroller(wrap);
  });
}
window.addEventListener('resize',()=>{
  if(typeof _initTabScrollers==='function')_initTabScrollers();
  if(typeof _placeModeNavDesktop==='function')_placeModeNavDesktop();
});
// DESKTOP : place la nav [Hub/Personnage] DANS l'en-tête actif (contrôle segmenté inline).
// MOBILE : la remet en bandeau fixe en bas (dans le body). Appelé par _refreshModeNav + au resize.
function _placeModeNavDesktop(){
  const nav=document.getElementById('modeNav'); if(!nav) return;
  const desktop=window.innerWidth>640;
  const vis=el=>el&&el.offsetParent!==null;
  let hdr=null;
  if(vis(document.getElementById('app'))) hdr=document.querySelector('#app .hdr');
  else if(vis(document.getElementById('mjScreen'))) hdr=document.querySelector('#mjScreen .mj-hdr');
  else if(vis(document.getElementById('hubScreen'))) hdr=document.querySelector('#hubScreen .hub-hdr');
  if(desktop && hdr){
    nav.classList.add('modeNav-inHeader');
    const logo=hdr.querySelector('.hdr-home');
    if(logo){ if(nav.parentElement!==hdr || nav.previousElementSibling!==logo) logo.insertAdjacentElement('afterend',nav); }
    else if(nav.parentElement!==hdr){ hdr.appendChild(nav); }
  } else {
    nav.classList.remove('modeNav-inHeader');
    if(nav.parentElement!==document.body) document.body.appendChild(nav);
  }
}
// Création / Level-up : quand les choix sont faits (bouton d'action « prêt » présent et actif),
// scrolle jusqu'à lui et le fait pulser/briller. Appelé après chaque rendu de création/LU.
function _ctaScrollGlow(){
  const c=document.getElementById('tabContent'); if(!c) return;
  const cand=[...c.querySelectorAll('.btn.bac,.btn.bprimary')].filter(b=>
    !b.disabled && b.offsetParent!==null &&
    /continuer|suivant|valider|cr[ée]er|terminer|confirmer|commencer|finaliser|valide/i.test(b.textContent||''));
  const btn=cand[cand.length-1];
  c.querySelectorAll('.cta-ready').forEach(b=>b.classList.remove('cta-ready'));
  if(!btn) return;
  btn.classList.add('cta-ready');
  try{ btn.scrollIntoView({behavior:'smooth',block:'center'}); }catch(e){ try{btn.scrollIntoView();}catch(_){} }
}
// Centre l'onglet ACTIF dans la barre scrollable (appelé au changement d'onglet).
function _centerActiveTab(){
  ['tabBar','mjTabBar'].forEach(id=>{
    const bar=document.getElementById(id); if(!bar) return;
    const active=bar.querySelector('.tab.on,.mj-tab.on'); if(!active) return;
    const barRect=bar.getBoundingClientRect(), aRect=active.getBoundingClientRect();
    const delta=(aRect.left-barRect.left)+aRect.width/2 - bar.clientWidth/2;
    if(Math.abs(delta)>2)bar.scrollBy({left:delta,behavior:'smooth'});
  });
}
