// ═══════════════════════════════════════════════════════════════════════
// SHELL — Étape 2 de la refonte (nav 3 destinations, dé ancrable, signaux)
// Chargé APRÈS core.js : les redéfinitions de fonctions globales GAGNENT.
// Décisions : _veille/THEORIE-PAGES.md · Composants : css/design-system.css
// Règle d'or : la visibilité dé/groupe reste pilotée par _syncFloatingUI.
// ═══════════════════════════════════════════════════════════════════════

// ── Préférences d'affichage (options de profil) ──
// ds_theme : 'light' (Grimoire, défaut) | 'dark' (Veillée)
// ds_hand  : 'right' (défaut) | 'left' (gaucher : rail + dé à gauche)
function dsApplyPrefs(){
  const t=localStorage.getItem('ds_theme')||'light';
  const h=localStorage.getItem('ds_hand')||'right';
  document.body.classList.toggle('ds-dark',t==='dark');
  document.body.classList.toggle('ds-lefty',h==='left');
}
function dsSetTheme(t){localStorage.setItem('ds_theme',t);dsApplyPrefs();}
function dsSetHand(h){localStorage.setItem('ds_hand',h);dsApplyPrefs();if(typeof _dsDieSeat==='function')_dsDieSeat();}
dsApplyPrefs();

// ── NAV 3 DESTINATIONS : Tables · Personnage/Panneau MJ · Groupe ──
// Remplace le contenu de #modeNav (2 items) par 3 items. Le bouton Groupe
// ouvre pour l'instant le panneau de groupe existant (partyHud) — il
// deviendra la vraie page Groupe à la migration de la page 3.
// ── PAGE GROUPE (P3) — overlay plein écran : Tour → Membres → Partages MJ → Chronique ──
let _dsGroupOpen=false,_dsShares=null;
function _dsNavGoGroup(){
  if(window._currentCampIsMJ)return;
  _dsGroupOpen?_dsCloseGroup():_dsOpenGroup();
}
function _dsOpenGroup(){
  _dsGroupOpen=true;_dsShares=null;
  let el=document.getElementById('dsGroupPage');
  if(!el){el=document.createElement('div');el.id='dsGroupPage';document.body.appendChild(el);}
  el.style.display='block';
  _dsRenderGroup();
  // Partages du MJ : lecture du doc campagne à l'ouverture
  try{
    if(currentCampaignId&&typeof fbDb!=='undefined'){
      fbDb.collection('campaigns').doc(currentCampaignId).get().then(d=>{
        _dsShares=(d.exists&&d.data().shares)||[];
        if(_dsGroupOpen)_dsRenderGroup();
      }).catch(()=>{_dsShares=[];});
    }
  }catch(e){_dsShares=[];}
  if(typeof _refreshModeNav==='function')_refreshModeNav();
}
function _dsCloseGroup(){
  _dsGroupOpen=false;
  const el=document.getElementById('dsGroupPage');if(el)el.style.display='none';
  if(typeof _refreshModeNav==='function')_refreshModeNav();
}
function _dsShareHTML(s,idx,mjMode){
  const del=mjMode?`<button class="ds-btn quiet" style="min-height:26px;padding:2px 8px;color:var(--ds-seal);border-color:var(--ds-seal)" onclick="_dsRemoveShare(${idx})">🗑</button>`:'';
  if(s.type==='indice'){
    const mat=s.matiere==='pierre'?'stone':s.matiere==='bois'?'wood':s.matiere==='rune'?'rune':'';
    return`<div class="ds-pin ${mat}">${s.title?`<b>${esc(s.title)}</b><br>`:''}${esc(s.text||'')}${del?`<div style="margin-top:6px;text-align:right">${del}</div>`:''}</div>`;
  }
  const ic=s.type==='artefact'?'🗡':'🗝';
  const chip=s.type==='artefact'?'<span class="ds-chip seal" style="font-size:10px;padding:1px 6px">Artefact</span>':'<span class="ds-chip" style="font-size:10px;padding:1px 6px">Objet de quête</span>';
  return`<div class="ds-item ${s.type==='artefact'?'artefact':''}"><span class="ic">${ic}</span>
    <div style="flex:1;min-width:0"><div style="font-family:var(--ds-disp);font-size:11.5px;font-weight:700">${esc(s.title||'?')} ${chip}</div>
    ${s.text?`<div class="ds-note">${esc(s.text)}</div>`:''}</div>${del}</div>`;
}
function _dsRenderGroup(){
  const el=document.getElementById('dsGroupPage');if(!el||!_dsGroupOpen)return;
  const combat=window._activeCombatState&&_activeCombatState.active;
  const myTurn=combat&&_activeCombatState.currentTurnUid===(window.currentUser&&currentUser.uid);
  const gd=window._groupData||[];
  const tour=combat?`<div class="ds-seclbl" style="margin:12px 0 8px">⚡ Tour de jeu</div>
    ${myTurn?`<div class="ds-turnbar"><span>⚡ C'est ton tour !</span><button class="ds-btn" style="min-height:34px" onclick="playerEndTurn()">⏩ Fin du tour</button></div>`
      :`<div class="ds-banner">⚔ <span>Combat en cours — au tour de <b>${esc((gd.find(pp=>pp.uid===_activeCombatState.currentTurnUid)||{}).playerName||(((gd.find(pp=>pp.uid===_activeCombatState.currentTurnUid)||{}).charData||{}).charName)||'…')}</b></span></div>`}`:'';
  const membres=gd.length?gd.map(pp=>{
    const p=pp.charData||{};
    const hp=p.hp||0,hpMax=p.hpMax||1;
    const pct=Math.max(0,Math.min(100,hp/hpMax*100));
    const low=pct<=25,mid=pct>25&&pct<=50;
    const down=hp<=0,dead=down&&(p.deathSaves&&p.deathSaves.fail>=3);
    const isOwn=pp.uid===(window.currentUser&&currentUser.uid);
    const portrait=p.portrait||p.equipPortrait;
    const cls=(p.classes||[]).map(c=>c.name+' '+c.level).join(' / ');
    const chips=(typeof _buildChargeChips==='function')?_buildChargeChips(p):'';
    return`<div class="ds-corners" style="margin-bottom:10px;cursor:${isOwn?'default':'pointer'}" ${isOwn?'':`onclick="_showHudDetail('${pp.uid}')"`}><i class="cx"></i>
      <div style="display:flex;gap:9px;align-items:center">
        ${portrait?`<img src="${portrait}" style="width:42px;height:42px;object-fit:cover;border:1px solid var(--ds-acc);flex:none">`
          :`<span style="width:42px;height:42px;border:1px solid var(--ds-acc);background:var(--ds-card2);display:grid;place-items:center;font-size:15px;flex:none">${pp.avatar||'⚔'}</span>`}
        <div style="flex:1;min-width:0">
          <div style="font-family:var(--ds-disp);font-size:14.5px;color:var(--ds-ink)"><b>${esc(p.charName||pp.playerName||'?')}</b>
            <span class="ds-note" style="font-size:11px">${isOwn?'Moi':esc(pp.playerName||'')}${cls?' · '+esc(cls):''}</span></div>
          <div class="ds-hp ${low?'low':mid?'mid':''}" style="height:13px;margin-top:4px"><i style="width:${pct}%"></i><span class="vv">${dead?'💀':down?'⚠ 0':hp+'/'+hpMax}</span></div>
          ${(p.conditions||[]).length?`<div class="ds-note" style="margin-top:3px">${p.conditions.slice(0,4).join(' ')}</div>`:''}
          ${chips?`<div style="margin-top:3px">${chips}</div>`:''}
        </div>
      </div></div>`;
  }).join(''):`<div class="ds-note" style="padding:10px 0">En attente des joueurs…</div>`;
  const shares=_dsShares===null?`<div class="ds-note">Chargement…</div>`
    :(_dsShares.length?_dsShares.map((s,i)=>_dsShareHTML(s,i,false)).join(''):`<div class="ds-note" style="font-style:italic">Le MJ n'a encore rien mis à disposition.</div>`);
  // A5 (2026-07-22) — Groupe = MODE de plein rang, pas une fenêtre : plus de titre de page
  // ni de bouton ✕. On en sort par la nav (Tables · Personnage · Groupe), comme des autres modes.
  // Le nom du groupe se règlera dans les réglages de table (lot B) ; à défaut, aucun titre.
  el.innerHTML=`<div class="ds-grouppage">
    <div class="gp-body">
      ${tour}
      <div class="ds-seclbl" style="margin:12px 0 8px">🧑‍🤝‍🧑 Membres</div>
      ${membres}
      <div class="ds-seclbl" style="margin:14px 0 8px">🎁 Apporté par le MJ</div>
      ${shares}
      <div class="ds-seclbl" style="margin:14px 0 8px">📜 Chronique</div>
      <button class="ds-btn" style="width:100%" onclick="_dsCloseGroup();openCampChronicle(currentTableId,currentCampaignId)">📜 Ouvrir la chronique de la campagne</button>
      <div style="height:90px"></div>
    </div>
  </div>`;
}
function _dsBuildNav(){
  const nav=document.getElementById('modeNav');if(!nav)return;
  if(nav.dataset.ds3)return; // déjà construit
  nav.dataset.ds3='1';
  nav.classList.add('norg-nav'); // structure maquette
  nav.innerHTML=
    `<button class="flat mode-btn mode-hub" onclick="_dsCloseGroup();showHub()"><span class="mode-ico">🧭</span><br><span class="mode-lbl">Tables</span></button>`+
    `<button class="flat mode-btn mode-char" onclick="_dsCloseGroup();_navGoChar()"><span class="mode-ico mode-char-ico">🧙</span><br><span class="mode-lbl mode-char-lbl">Personnage</span></button>`+
    `<button class="flat mode-btn mode-group" onclick="_dsNavGoGroup()" style="position:relative"><span class="mode-ico">👥</span><br><span class="mode-lbl">Groupe</span>`+
    `<span id="dsNavTurn" class="ds-navbdg" style="display:none;position:absolute;top:2px;right:14px;min-width:16px;height:16px;border-radius:50%;background:var(--arcane);color:#fff;font-size:11px;font-weight:700;display:none;align-items:center;justify-content:center;animation:combatPulse 1.6s ease-in-out infinite">⚡</span>`+
    `<span id="dsNavDanger" style="display:none;position:absolute;top:2px;left:14px;min-width:16px;height:16px;border-radius:50%;background:var(--danger);color:#fff;font-size:10px;font-weight:700;align-items:center;justify-content:center"></span>`+
    `</button>`;
}
// Surcharge de core.js : gère les 3 items + masque Groupe côté MJ.
function _refreshModeNav(){
  const nav=document.getElementById('modeNav');if(!nav)return;
  // La nav reste VISIBLE dès qu'on est connecté (avant : cachée sans campagne → bandeau qui
  // apparaît/disparaît, déroutant). Sans campagne : Personnage/Groupe grisés.
  const auth=document.getElementById('authScreen');
  if(auth&&auth.style.display!=='none'){nav.style.display='none';return;}
  _dsBuildNav();
  nav.style.display='flex';
  const noCamp=!currentCampaignId;
  nav.querySelectorAll('.mode-char,.mode-group').forEach(b=>{b.style.opacity=noCamp?'.35':'';b.style.pointerEvents=noCamp?'none':'';});
  const vis=el=>el&&el.style.display!=='none';
  const onHub=vis(document.getElementById('hubScreen'));
  const onChar=vis(document.getElementById('app'))||vis(document.getElementById('mjScreen'));
  const mj=!!window._currentCampIsMJ;
  nav.querySelectorAll('.mode-char-lbl').forEach(el=>el.textContent=mj?'Panneau MJ':'Personnage');
  nav.querySelectorAll('.mode-char-ico').forEach(el=>el.textContent=mj?'👑':'🧙');
  const grp=nav.querySelector('.mode-group');if(grp)grp.style.display=mj?'none':'';
  const hb=nav.querySelector('.mode-hub'),ch=nav.querySelector('.mode-char');
  const gOpen=typeof _dsGroupOpen!=='undefined'&&_dsGroupOpen;
  if(hb)hb.classList.toggle('on',!!onHub&&!gOpen);
  if(ch)ch.classList.toggle('on',!!onChar&&!gOpen);
  if(grp)grp.classList.toggle('on',gOpen);
  if(typeof _placeModeNavDesktop==='function')_placeModeNavDesktop();
}
// Signaux sur l'item Groupe (appelé par _updatePartyHUD via patch ci-dessous)
function _dsNavSignals(){
  const turn=document.getElementById('dsNavTurn');
  const dng=document.getElementById('dsNavDanger');
  if(!turn&&!dng)return;
  const combatActive=!!(window._activeCombatState&&_activeCombatState.active);
  const myTurn=combatActive&&_activeCombatState.currentTurnUid===(window.currentUser&&currentUser.uid);
  const dCount=(window._groupData||[]).filter(pp=>{const p=pp.charData||{};return p.hpMax&&p.hp/p.hpMax<=.25;}).length;
  if(turn)turn.style.display=myTurn?'flex':'none';
  if(dng){dng.style.display=dCount?'flex':'none';dng.textContent=dCount||'';}
}
// Patch : chaque rafraîchissement du HUD de groupe met aussi à jour la nav.
if(typeof _updatePartyHUD==='function'){
  const _dsOldUPH=_updatePartyHUD;
  _updatePartyHUD=function(){_dsOldUPH.apply(this,arguments);try{_dsNavSignals();}catch(e){}
    try{if(typeof _dsGroupOpen!=='undefined'&&_dsGroupOpen)_dsRenderGroup();}catch(e){}};
}
// Suppression d'un partage (côté MJ uniquement)
function _dsRemoveShare(idx){
  if(!window._currentCampIsMJ||!currentCampaignId)return;
  const s=(_dsShares||[])[idx];if(!s)return;
  fbDb.collection('campaigns').doc(currentCampaignId).update({shares:firebase.firestore.FieldValue.arrayRemove(s)})
    .then(()=>{_dsShares.splice(idx,1);showToast('🗑 Partage retiré.');if(typeof _dsRenderMJShares==='function')_dsRenderMJShares();})
    .catch(()=>showToast('❌ Une erreur est survenue, réessaie.'));
}

// ── MJ (P4) : onglet « Joueurs » → « 👥 Groupe » + « 🎁 Apporter au groupe » ──
function renderMJTabs(){ // surcharge de mj/index.js — rail 6 onglets {ico,txt}
  const tabs=[
    {id:'joueurs',ico:'👥',txt:'Groupe'},
    {id:'combat',ico:'⚡',txt:'Combat'},
    {id:'pnj',ico:'🐉',txt:'PNJ'},
    {id:'objets',ico:'💰',txt:'Objets'},
    {id:'journal',ico:'📓',txt:'Journal MJ'},
    {id:'regles',ico:'📖',txt:'Règles'},
  ];
  const bar=document.getElementById('mjTabBar');
  if(bar) bar.innerHTML=tabs.map(t=>{
    const ce=t.id==='combat'?(window._mjCombatStarted?' mj-tab-combat-active':' mj-tab-combat-idle'):'';
    return`<button class="mj-tab${window._mjTab===t.id?' on':''}${ce}" onclick="setMJTab('${t.id}')"><span class="ti">${t.ico}</span><span class="tl">${t.txt}</span></button>`;
  }).join('');
  // CRUCIAL : envelopper la barre dans .tab-scroller (le rail fixe) — en session MJ pure,
  // renderTabBar (joueur) ne tourne jamais, donc personne d'autre ne crée le wrapper.
  if(typeof _initTabScrollers==='function')setTimeout(_initTabScrollers,0);
  // ⚠ showMJScreen() n'appelle QUE renderMJTabs et compte sur lui pour peindre le
  // contenu (comportement de l'original) — sans ça le Panneau MJ s'ouvre VIDE.
  if(typeof renderMJContent==='function')renderMJContent();
}
function _dsOpenShareModal(type){
  const T={indice:'📜 Indice',artefact:'🗡 Artefact',quete:'🗝 Objet de quête'}[type]||type;
  const MI={parchemin:'📜',pierre:'🪨',bois:'🌳',rune:'🔮'};
  const mat=type==='indice'?`<div class="fl mb6">Matière de l'indice</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
      ${['parchemin','pierre','bois','rune'].map((m,i)=>`<button class="btn ds-matopt${i===0?' bac':''}" data-m="${m}" onclick="document.querySelectorAll('.ds-matopt').forEach(b=>b.classList.remove('bac'));this.classList.add('bac')">${MI[m]} ${m}</button>`).join('')}
    </div>`:'';
  openModal(`<div class="pt">${T} — apporter au groupe</div>
    <div class="fl mb6">Titre${type==='indice'?' (optionnel)':''}</div>
    <input class="fi" id="dsShTitle" style="margin-bottom:10px">
    ${mat}
    <div class="fl mb6">${type==='indice'?"Texte de l'indice":'Description'}</div>
    <textarea class="fi" id="dsShText" rows="3" style="resize:vertical;margin-bottom:12px"></textarea>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="_dsConfirmShare('${type}')">🎁 Mettre à disposition</button>
    </div>`);
}
function _dsConfirmShare(type){
  const title=((document.getElementById('dsShTitle')||{}).value||'').trim();
  const text=((document.getElementById('dsShText')||{}).value||'').trim();
  if(!text&&!title){showToast('❌ Écris au moins un titre ou un texte.');return;}
  const mEl=document.querySelector('.ds-matopt.bac');
  const share={type,title,text,ts:Date.now()};
  if(type==='indice')share.matiere=mEl?mEl.dataset.m:'parchemin';
  fbDb.collection('campaigns').doc(currentCampaignId).update({shares:firebase.firestore.FieldValue.arrayUnion(share)})
    .then(()=>{closeModal();showToast('🎁 Mis à disposition du groupe.');_dsShares=null;_dsRenderMJShares(true);})
    .catch(()=>showToast('❌ Une erreur est survenue, réessaie.'));
}
function _dsRenderMJShares(reload){
  const host=document.getElementById('dsMJShares');if(!host)return;
  if(_dsShares===null||reload){
    host.innerHTML='<div class="ds-note">Chargement…</div>';
    fbDb.collection('campaigns').doc(currentCampaignId).get()
      .then(d=>{_dsShares=(d.exists&&d.data().shares)||[];_dsRenderMJShares();})
      .catch(()=>{_dsShares=[];_dsRenderMJShares();});
    return;
  }
  host.innerHTML=_dsShares.length
    ?_dsShares.map((s,i)=>_dsShareHTML(s,i,true)).join('')
    :'<div class="ds-note" style="font-style:italic">Rien de partagé pour l\'instant — indices, artefacts et objets de quête apparaîtront sur la page Groupe des joueurs.</div>';
}
if(typeof renderMJContent==='function'){
  const _dsOldMJC=renderMJContent;
  renderMJContent=function(){
    _dsOldMJC.apply(this,arguments);
    try{
      if(typeof _mjTab!=='undefined'&&_mjTab==='joueurs'){
        const c=document.getElementById('mjTabContent');
        if(c&&!document.getElementById('dsMJShares')){
          const w=document.createElement('div');
          w.innerHTML=`<div class="ds-seclbl" style="margin:4px 0 8px">🎁 Apporter au groupe</div>
            <div style="display:flex;gap:8px;margin-bottom:8px">
              <button class="ds-btn" style="flex:1" onclick="_dsOpenShareModal('indice')">📜 Indice</button>
              <button class="ds-btn" style="flex:1" onclick="_dsOpenShareModal('artefact')">🗡 Artefact</button>
              <button class="ds-btn" style="flex:1" onclick="_dsOpenShareModal('quete')">🗝 Obj. quête</button>
            </div><div id="dsMJShares"></div>
            <button class="ds-btn" style="width:100%;margin:10px 0 4px" onclick="setMJTab('journal');setTimeout(()=>{_journalSubTab='chronicle';renderMJContent();},0)">📜 Chronique de la campagne</button>
            <div class="ds-seclbl" style="margin:12px 0 8px">👥 Joueurs</div>`;
          c.insertBefore(w,c.firstChild);
          _dsRenderMJShares();
        }
      }
    }catch(e){}
  };
}

// ── TOASTS RICHES → POPUPS GRIMOIRE (rapport 2026-07-19) ──
// Les toasts COURTS (confirmations passives) restent des toasts ; les toasts RICHES
// (résultats de combat, contenus multi-lignes) deviennent une popup avec bouton OK.
if(typeof showToast==='function'){
  const _dsOldToast=showToast;
  showToast=function(html,duration){
    const big=(typeof html==='string')&&(html.length>140||/<(div|table|br|ul)/i.test(html));
    if(!big)return _dsOldToast.apply(this,arguments);
    let ov=document.getElementById('dsToastPop');
    if(!ov){
      ov=document.createElement('div');ov.id='dsToastPop';
      ov.addEventListener('click',e=>{if(e.target===ov)ov.style.display='none';});
      document.body.appendChild(ov);
    }
    ov.innerHTML=`<div class="dsp-box">${html}<button class="btn" onclick="document.getElementById('dsToastPop').style.display='none'">✓ OK</button></div>`;
    ov.style.display='flex';
    clearTimeout(ov._t);ov._t=setTimeout(()=>{ov.style.display='none';},Math.max(duration||0,6000));
  };
}

// DEUX COQUES : mobile = nav = bandeau du BAS · desktop = nav dans la BARRE DU HAUT
// (cahier des charges : « Desktop = top bar ; mobile = bottom bar »).
function _placeModeNavDesktop(){
  const nav=document.getElementById('modeNav');
  const top=document.getElementById('dtopbar');
  const slot=document.getElementById('dtopbarNav');
  if(!nav)return;
  const desktop=window.innerWidth>=900;
  const connected=typeof currentUser!=='undefined'&&currentUser;
  if(desktop){
    if(slot&&nav.parentElement!==slot)slot.appendChild(nav);
    nav.classList.add('nav-top');nav.classList.remove('norg-nav');
    if(top)top.style.display=connected?'flex':'none';
    const av=document.getElementById('dtopAvatar');
    if(av&&typeof currentUserData!=='undefined'&&currentUserData&&currentUserData.avatar)av.textContent=currentUserData.avatar;
  }else{
    if(nav.parentElement!==document.body)document.body.appendChild(nav);
    nav.classList.remove('nav-top');nav.classList.add('norg-nav');
    if(top)top.style.display='none';
  }
}
window.addEventListener('resize',_placeModeNavDesktop);

// ── EN-TÊTE FICHE : cale la hauteur du bandeau fixe (bandeau+vitals) sur mobile ──
// Robuste aux variations (bouclier, jets de mort, inputs MJ) : mesure réelle → --fiche-head.
function _dsSyncFicheHead(){
  try{
    const head=document.querySelector('#charRail .norg-head');
    const vit=document.querySelector('#charRail .norg-vitals');
    if(!head)return;
    const hh=head.offsetHeight;
    if(vit)vit.style.top=hh+'px';                       // les vitals se posent sous le bandeau
    const total=hh+(vit?vit.offsetHeight:0);
    if(total>0)document.documentElement.style.setProperty('--head-h',total+'px');
  }catch(e){}
}
if(typeof render==='function'){
  const _dsOldRender=render;
  render=function(){_dsOldRender.apply(this,arguments);setTimeout(_dsSyncFicheHead,0);};
}
window.addEventListener('resize',_dsSyncFicheHead);

// ── REPRISE DE SESSION — RETIRÉE ICI le 2026-07-22, remplacée par le « lot 0 » ──
// Il y avait à cet endroit deux enveloppes (sur enterCampaign et showHub) qui mémorisaient la
// campagne dans une clé `ds_resume` et y replongeaient au démarrage. Elles portaient 5 défauts :
//   1. ⚠ GRAVE — elles appelaient enterCampaign() AVANT le vrai showHub(), donc avant que
//      renderHub() ait rempli _hubCache. Or enterCampaign en déduit le rôle :
//      `asMJ = tableData && tableData.mjId===currentUser.uid`. Avec _hubCache null → asMJ=false
//      → un MJ était rouvert comme JOUEUR.
//   2. leur `return;` empêchait le vrai showHub() de s'exécuter : _hubCache restait null pour
//      TOUTE la session, alors que enterCampaign et joinGroupOnly s'en servent.
//   3. `ds_resume` n'était pas cloisonnée par compte → deux comptes sur le même navigateur
//      héritaient de la partie de l'autre.
//   4. la branche `else` effaçait la clé dès le 2e appel à showHub, c.-à-d. dès un simple retour
//      aux Tables → la reprise ne fonctionnait qu'une fois puis se désarmait silencieusement.
//   5. enterCampaign était appelée sans nom de table ni de campagne, et sans _hubCache pour les
//      retrouver → bandeaux vides.
// Le remplacement vit désormais à la source, pas en surcouche :
//   • écriture  : enterCampaign (hub.js) · joinGroupOnly + showHub (core.js)
//   • lecture   : _bootToLastScreen / _restoreSession (core.js), APRÈS le remplissage de _hubCache
//   • stockage  : mjtk_session_<uid> (firebase.js), cloisonné par compte
// Purge de l'ancienne clé, devenue morte :
try{localStorage.removeItem('ds_resume');}catch(e){}

// ── OPTIONS PROFIL : thème ☀/🌙 + main 🖐/✋ (section ajoutée au modal Profil) ──
if(typeof openUserSettings==='function'){
  const _dsOldUS=openUserSettings;
  openUserSettings=function(){
    _dsOldUS.apply(this,arguments);
    try{
      setTimeout(()=>{
        const box=document.querySelector('#modal .modal-box');
        if(box){
          // Toutes les sections du Profil REPLIÉES par défaut (rapport 2026-07-19)
          box.querySelectorAll('details.acc[open]').forEach(d=>d.removeAttribute('open'));
        }
        if(box&&!document.getElementById('dsPrefsSec')){
          const t=localStorage.getItem('ds_theme')||'light';
          const h=localStorage.getItem('ds_hand')||'right';
          const w=document.createElement('details');w.id='dsPrefsSec';w.className='acc';w.open=false;
          w.innerHTML=`<summary>🎨 Affichage</summary>
            <div class="acc-body">
              <div class="fl mb6">Thème</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
                <button class="btn${t==='light'?' bac':''}" onclick="dsSetTheme('light');closeModal();openUserSettings()">☀ Grimoire</button>
                <button class="btn${t==='dark'?' bac':''}" onclick="dsSetTheme('dark');closeModal();openUserSettings()">🌙 Veillée</button>
              </div>
              <div class="fl mb6">Main directrice</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap">
                <button class="btn${h==='right'?' bac':''}" onclick="dsSetHand('right');closeModal();openUserSettings()">🖐 Droitier</button>
                <button class="btn${h==='left'?' bac':''}" onclick="dsSetHand('left');closeModal();openUserSettings()">✋ Gaucher</button>
              </div>
            </div>`;
          // Placer « Affichage » JUSTE APRÈS l'accordéon « Profil » (1ᵉʳ .acc), pas à la fin
          const accs=box.querySelectorAll('details.acc');
          let profAcc=null;
          accs.forEach(a=>{const s=a.querySelector('summary');if(s&&/profil/i.test(s.textContent)&&!profAcc)profAcc=a;});
          if(profAcc)profAcc.insertAdjacentElement('afterend',w); else box.appendChild(w);
        }
      },60);
    }catch(e){}
  };
}

// ── DÉ FLOTTANT : déplaçable + ancrage + estompage (sur #diceFloat existant) ──
// Tap court = comportement existant (ouvre le panneau de dés — onclick intact).
// Glisser (>8px) = déplacement libre ; relâcher près du logement = re-sertissage.
// 4 s sans contact = estompage à 45 % (.ds-idle). Position mémorisée par appareil.
(function(){
  let df=null,sock=null,drag=null,moved=false,idleT=null;
  function el(){df=df||document.getElementById('diceFloat');return df;}
  function socket(){
    if(sock)return sock;
    sock=document.createElement('div');sock.className='ds-dsock';sock.id='dsDieSock';
    document.body.appendChild(sock);
    return sock;
  }
  function wake(){
    // Estompage ANNULÉ (2026-07-19) : le dé serti dans le bandeau reste pleinement visible.
    if(!el())return;
    df.classList.remove('ds-idle');
    clearTimeout(idleT);
  }
  window._dsDieSeat=function(){ // repose le dé dans son ancrage (position CSS par défaut)
    if(!el())return;
    df.style.left='';df.style.top='';df.style.right='';df.style.bottom='';
    localStorage.removeItem('ds_die_pos');
    wake();
  };
  function restore(){
    if(!el())return;
    try{
      const s=localStorage.getItem('ds_die_pos');
      if(s){const p=JSON.parse(s);
        df.style.left=Math.min(p.x,window.innerWidth-60)+'px';
        df.style.top=Math.min(p.y,window.innerHeight-60)+'px';
        df.style.right='auto';df.style.bottom='auto';}
    }catch(e){}
    wake();
  }
  function onDown(e){
    if(!el())return;
    moved=false;
    const r=df.getBoundingClientRect();
    drag={dx:e.clientX-r.left,dy:e.clientY-r.top};
    wake();
  }
  function onMove(e){
    if(!drag||!el())return;
    const x=e.clientX-drag.dx,y=e.clientY-drag.dy;
    if(!moved){
      const r=df.getBoundingClientRect();
      if(Math.abs(x-r.left)<8&&Math.abs(y-r.top)<8)return; // pas encore un drag
      moved=true;socket().classList.add('show');
      try{df.setPointerCapture(e.pointerId);}catch(_){}
    }
    e.preventDefault();
    df.style.left=Math.max(2,Math.min(x,window.innerWidth-df.offsetWidth-2))+'px';
    df.style.top=Math.max(2,Math.min(y,window.innerHeight-df.offsetHeight-2))+'px';
    df.style.right='auto';df.style.bottom='auto';
  }
  function onUp(e){
    if(!drag)return;
    const wasDrag=moved;drag=null;moved=false;
    const sk=socket();sk.classList.remove('show');
    if(wasDrag&&el()){
      const dr=df.getBoundingClientRect(),sr=sk.getBoundingClientRect();
      const d=Math.hypot(dr.left+dr.width/2-(sr.left+sr.width/2),dr.top+dr.height/2-(sr.top+sr.height/2));
      if(d<60){_dsDieSeat();}
      else{try{localStorage.setItem('ds_die_pos',JSON.stringify({x:dr.left,y:dr.top}));}catch(_){}}
      // un drag ne doit PAS ouvrir le panneau de dés : on avale le clic qui suit
      df.addEventListener('click',ev=>{ev.stopPropagation();ev.preventDefault();},{capture:true,once:true});
    }
    wake();
  }
  function init(){
    if(!el())return;
    if(df.dataset.dsDrag)return;
    df.dataset.dsDrag='1';
    df.style.touchAction='none';
    df.addEventListener('pointerdown',onDown);
    df.addEventListener('pointermove',onMove);
    df.addEventListener('pointerup',onUp);
    df.addEventListener('pointercancel',onUp);
    df.addEventListener('pointerenter',wake);
    restore();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
