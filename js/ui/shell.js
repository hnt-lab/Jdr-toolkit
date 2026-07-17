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
function _dsNavGoGroup(){
  if(window._currentCampIsMJ){return;} // MJ : pas d'item Groupe (nav = Tables · Panneau MJ)
  if(typeof _togglePartyHud==='function')_togglePartyHud();
}
function _dsBuildNav(){
  const nav=document.getElementById('modeNav');if(!nav)return;
  if(nav.dataset.ds3)return; // déjà construit
  nav.dataset.ds3='1';
  nav.innerHTML=
    `<button class="mode-btn mode-hub" onclick="showHub()"><span class="mode-ico">🗺</span><span class="mode-lbl">Tables</span></button>`+
    `<button class="mode-btn mode-char" onclick="_navGoChar()"><span class="mode-ico mode-char-ico">🧙</span><span class="mode-lbl mode-char-lbl">Personnage</span></button>`+
    `<button class="mode-btn mode-group" onclick="_dsNavGoGroup()" style="position:relative"><span class="mode-ico">👥</span><span class="mode-lbl">Groupe</span>`+
    `<span id="dsNavTurn" class="ds-navbdg" style="display:none;position:absolute;top:2px;right:14px;min-width:16px;height:16px;border-radius:50%;background:#6d28d9;color:#fff;font-size:11px;font-weight:700;display:none;align-items:center;justify-content:center;animation:combatPulse 1.6s ease-in-out infinite">⚡</span>`+
    `<span id="dsNavDanger" style="display:none;position:absolute;top:2px;left:14px;min-width:16px;height:16px;border-radius:50%;background:#e53935;color:#fff;font-size:10px;font-weight:700;align-items:center;justify-content:center"></span>`+
    `</button>`;
}
// Surcharge de core.js : gère les 3 items + masque Groupe côté MJ.
function _refreshModeNav(){
  const nav=document.getElementById('modeNav');if(!nav)return;
  if(!currentCampaignId){nav.style.display='none';return;}
  _dsBuildNav();
  nav.style.display='flex';
  const vis=el=>el&&el.style.display!=='none';
  const onHub=vis(document.getElementById('hubScreen'));
  const onChar=vis(document.getElementById('app'))||vis(document.getElementById('mjScreen'));
  const mj=!!window._currentCampIsMJ;
  nav.querySelectorAll('.mode-char-lbl').forEach(el=>el.textContent=mj?'Panneau MJ':'Personnage');
  nav.querySelectorAll('.mode-char-ico').forEach(el=>el.textContent=mj?'👑':'🧙');
  const grp=nav.querySelector('.mode-group');if(grp)grp.style.display=mj?'none':'';
  const hb=nav.querySelector('.mode-hub'),ch=nav.querySelector('.mode-char');
  if(hb)hb.classList.toggle('on',!!onHub);
  if(ch)ch.classList.toggle('on',!!onChar);
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
  _updatePartyHUD=function(){_dsOldUPH.apply(this,arguments);try{_dsNavSignals();}catch(e){}};
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
    if(!el())return;
    df.classList.remove('ds-idle');
    clearTimeout(idleT);
    idleT=setTimeout(()=>{if(df)df.classList.add('ds-idle');},4000);
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
