// ═══════════════════════════════════════
// FIREBASE
// ═══════════════════════════════════════
const firebaseConfig={
  apiKey:"AIzaSyDWP3G8M96ZKYFnmTB5w8uZC26anUyLMgk",
  authDomain:"jdr-toolkit.firebaseapp.com",
  projectId:"jdr-toolkit",
  storageBucket:"jdr-toolkit.firebasestorage.app",
  messagingSenderId:"783573298968",
  appId:"1:783573298968:web:69c7768cda01c60667786d"
};
firebase.initializeApp(firebaseConfig);
const fbAuth=firebase.auth();
const fbDb=firebase.firestore();

// ─── SPLASH + MISE À JOUR AUTO ───
function hideSplash(){
  const el=document.getElementById('splashScreen');
  if(!el)return;
  el.style.opacity='0';
  setTimeout(()=>{if(el.parentNode)el.parentNode.removeChild(el);},500);
}
setTimeout(()=>{
  const el=document.getElementById('splashScreen');
  if(!el)return;
  const msg=document.getElementById('splashMsg');
  const spinner=el.querySelector('.auth-spinner');
  if(spinner)spinner.style.display='none';
  if(msg){msg.innerHTML='Problème de connexion<br><span style="font-size:17px;color:#5a5870">Vérifiez votre réseau et réessayez.</span>';}
  const btn=document.createElement('button');
  btn.textContent='↺ Réessayer';
  btn.style.cssText='margin-top:8px;padding:8px 20px;background:none;border:1px solid #c8a84b;border-radius:6px;color:#c8a84b;font-size:18px;cursor:pointer;font-family:inherit';
  btn.onclick=()=>location.reload();
  el.appendChild(btn);
},8000);
// APP_VERSION vient de version.js (source unique), chargé avant firebase.js dans index.html
let _pendingSwUpdate=false;
function _showUpdateOverlay(){
  if(document.getElementById('_updateOverlay'))return;
  const ov=document.createElement('div');
  ov.id='_updateOverlay';
  ov.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.75);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center';
  ov.innerHTML=`<div style="position:relative;background:linear-gradient(145deg,#3e3018,#1d1609);border:2px solid #6b5527;border-radius:16px;padding:30px 26px;max-width:340px;width:92%;text-align:center;box-shadow:0 8px 40px rgba(0,0,0,.6),inset 0 0 30px rgba(0,0,0,.35),0 0 26px rgba(200,168,75,.14)">
    <span style="position:absolute;left:12px;top:12px;width:8px;height:8px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#d9bd6e,#6b5527)"></span>
    <span style="position:absolute;right:12px;top:12px;width:8px;height:8px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#d9bd6e,#6b5527)"></span>
    <span style="position:absolute;left:12px;bottom:12px;width:8px;height:8px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#d9bd6e,#6b5527)"></span>
    <span style="position:absolute;right:12px;bottom:12px;width:8px;height:8px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#d9bd6e,#6b5527)"></span>
    <svg viewBox="24 18 166 138" style="display:block;width:96px;height:auto;margin:0 auto 12px;filter:drop-shadow(0 0 8px rgba(200,168,75,.4))">
      <g style="filter:drop-shadow(0 0 6px rgba(200,168,75,.5))"><animateTransform attributeName="transform" type="rotate" from="0 75 70" to="360 75 70" dur="9s" repeatCount="indefinite"/><g fill="#c8a84b"><rect x="106" y="66.5" width="9" height="7" rx="2" transform="rotate(10 75 70)"/><rect x="106" y="66.5" width="9" height="7" rx="2" transform="rotate(40 75 70)"/><rect x="106" y="66.5" width="9" height="7" rx="2" transform="rotate(70 75 70)"/><rect x="106" y="66.5" width="9" height="7" rx="2" transform="rotate(100 75 70)"/><rect x="106" y="66.5" width="9" height="7" rx="2" transform="rotate(130 75 70)"/><rect x="106" y="66.5" width="9" height="7" rx="2" transform="rotate(160 75 70)"/><rect x="106" y="66.5" width="9" height="7" rx="2" transform="rotate(190 75 70)"/><rect x="106" y="66.5" width="9" height="7" rx="2" transform="rotate(220 75 70)"/><rect x="106" y="66.5" width="9" height="7" rx="2" transform="rotate(250 75 70)"/><rect x="106" y="66.5" width="9" height="7" rx="2" transform="rotate(280 75 70)"/><rect x="106" y="66.5" width="9" height="7" rx="2" transform="rotate(310 75 70)"/><rect x="106" y="66.5" width="9" height="7" rx="2" transform="rotate(340 75 70)"/></g><circle cx="75" cy="70" r="33" fill="#b8860b" stroke="#7d641d" stroke-width="2"/><circle cx="75" cy="70" r="18" fill="#16110a"/><circle cx="75" cy="70" r="8" fill="#d9bd6e"/><circle cx="75" cy="70" r="4" fill="#7fd1c4"/></g>
      <g style="filter:drop-shadow(0 0 5px rgba(184,115,51,.5))"><animateTransform attributeName="transform" type="rotate" from="0 123 110" to="-360 123 110" dur="6.75s" repeatCount="indefinite"/><g fill="#b87333"><rect x="145" y="106.5" width="9" height="7" rx="2" transform="rotate(0 123 110)"/><rect x="145" y="106.5" width="9" height="7" rx="2" transform="rotate(40 123 110)"/><rect x="145" y="106.5" width="9" height="7" rx="2" transform="rotate(80 123 110)"/><rect x="145" y="106.5" width="9" height="7" rx="2" transform="rotate(120 123 110)"/><rect x="145" y="106.5" width="9" height="7" rx="2" transform="rotate(160 123 110)"/><rect x="145" y="106.5" width="9" height="7" rx="2" transform="rotate(200 123 110)"/><rect x="145" y="106.5" width="9" height="7" rx="2" transform="rotate(240 123 110)"/><rect x="145" y="106.5" width="9" height="7" rx="2" transform="rotate(280 123 110)"/><rect x="145" y="106.5" width="9" height="7" rx="2" transform="rotate(320 123 110)"/></g><circle cx="123" cy="110" r="24" fill="#9c5a28" stroke="#6e3f1c" stroke-width="2"/><circle cx="123" cy="110" r="13" fill="#16110a"/><circle cx="123" cy="110" r="6" fill="#d99a5e"/></g>
      <g style="filter:drop-shadow(0 0 4px rgba(200,168,75,.45))"><animateTransform attributeName="transform" type="rotate" from="0 158 82" to="360 158 82" dur="4.5s" repeatCount="indefinite"/><g fill="#c8a84b"><rect x="171" y="78.5" width="9" height="7" rx="2" transform="rotate(-10 158 82)"/><rect x="171" y="78.5" width="9" height="7" rx="2" transform="rotate(50 158 82)"/><rect x="171" y="78.5" width="9" height="7" rx="2" transform="rotate(110 158 82)"/><rect x="171" y="78.5" width="9" height="7" rx="2" transform="rotate(170 158 82)"/><rect x="171" y="78.5" width="9" height="7" rx="2" transform="rotate(230 158 82)"/><rect x="171" y="78.5" width="9" height="7" rx="2" transform="rotate(290 158 82)"/></g><circle cx="158" cy="82" r="15" fill="#b8860b" stroke="#7d641d" stroke-width="2"/><circle cx="158" cy="82" r="8" fill="#16110a"/><circle cx="158" cy="82" r="3.5" fill="#d9bd6e"/></g>
    </svg>
    <div style="font-family:var(--F,'serif');font-size:25px;color:#c8a84b;letter-spacing:.08em;margin-bottom:8px;text-shadow:0 0 14px rgba(200,168,75,.4)">Nouvelle mise à jour disponible</div>
    <div style="font-size:18px;color:#9a8a5a;margin-bottom:22px">L'atelier a affûté ses outils — une nouvelle version est prête.</div>
    <div id="_updateBar" style="display:none;height:5px;background:rgba(200,168,75,.15);border:1px solid rgba(200,168,75,.3);border-radius:3px;margin-bottom:16px;overflow:hidden"><div id="_updateBarFill" style="height:100%;width:0%;background:linear-gradient(90deg,#c8a84b,#7fd1c4,#d9bd6e);border-radius:3px;transition:width .1s linear"></div></div>
    <div id="_updateStatus" style="font-size:17px;color:#9a8a5a;margin-bottom:16px;display:none">Rouages en mouvement…</div>
    <div id="_updateBtns" style="display:flex;gap:10px">
      <button onclick="_doUpdate()" style="flex:2;padding:11px;border-radius:8px;border:1px solid #7d641d;background:linear-gradient(#d9bd6e,#c8a84b);color:#1a1400;font-weight:700;font-size:19px;cursor:pointer;font-family:var(--B,'sans-serif')">⚙ Mettre à jour</button>
      <button onclick="_skipUpdate()" style="flex:1;padding:11px;border-radius:8px;border:1px solid #6b5527;background:transparent;color:#9a8a5a;font-size:18px;cursor:pointer">Plus tard</button>
    </div>
  </div>`;
  document.body.appendChild(ov);
}
function _doUpdate(){
  const bar=document.getElementById('_updateBar'),fill=document.getElementById('_updateBarFill'),btns=document.getElementById('_updateBtns'),status=document.getElementById('_updateStatus');
  if(bar)bar.style.display='block';if(btns)btns.style.display='none';if(status)status.style.display='block';
  let pct=0;const iv=setInterval(()=>{pct=Math.min(95,pct+Math.random()*8+2);if(fill)fill.style.width=pct+'%';},120);
  setTimeout(()=>{clearInterval(iv);if(fill)fill.style.width='100%';setTimeout(()=>location.reload(true),300);},2000);
}
function _skipUpdate(){
  _pendingSwUpdate=true;
  const ov=document.getElementById('_updateOverlay');if(ov)ov.remove();
  if(typeof showToast==='function')showToast('💡 Mise à jour disponible dans ton profil.',3000);
}
if('serviceWorker' in navigator){
  navigator.serviceWorker.addEventListener('message',e=>{
    if(e.data?.type!=='SW_UPDATED')return;
    _showUpdateOverlay();
  });
}
// Rechargement automatique si l'appli est restée en fond plus de 15 minutes
let _hiddenAt=0;
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){
    _hiddenAt=Date.now();
  } else if(_hiddenAt&&Date.now()-_hiddenAt>15*60*1000){
    location.reload(true);
  } else {
    _hiddenAt=0;
  }
});

let currentUser=null;
let currentUserData=null;
let selectedAvatar='⚔';
let currentTableId=null;
let currentCampaignId=null;
let currentTableName='';
let currentCampaignName='';
let currentTableMjId=null;
let _activeCombatState=null;
let _combatListenerInitialized=false;
let _prevCombatTurnUid=null;
let _expandedCamp=null;
// ═══ SYNC TEMPS RÉEL ═══
let _unsubscribes=[];
let _mjRenderDebounce=null;
let _unsaved=false;
let _suppressUnsavedMark=false;
let _saveDebounce=null;
let _ownWritePending=0;
let _ownWriteData=null;
let _ownWriteDataSet=new Set();
function _stableJSON(v){if(v===null||v===undefined||typeof v!=='object')return JSON.stringify(v);if(Array.isArray(v))return'['+v.map(_stableJSON).join(',')+']';const keys=Object.keys(v).sort();return'{'+keys.map(k=>JSON.stringify(k)+':'+_stableJSON(v[k])).join(',')+'}';}

let _userInfoCache={};
let _whisperHistory=[];
let _whisperInited=false;
function stopAllListeners(){_unsubscribes.forEach(fn=>{try{fn();}catch(e){}});_unsubscribes=[];_whisperHistory=[];_whisperInited=false;}
window.addEventListener('beforeunload',()=>{if(_unsaved){clearTimeout(_saveDebounce);try{localStorage.setItem(getUserSK(),JSON.stringify(state));}catch(e){}}});
function _debouncedMJRender(){clearTimeout(_mjRenderDebounce);_mjRenderDebounce=setTimeout(()=>{renderMJContent();_flashSyncDot('mjSyncDot');},350);}
function _flashSyncDot(id){const d=document.getElementById(id);if(!d)return;d.className='sync-dot on';setTimeout(()=>{d.className='sync-dot';},2500);}
async function _getPlayerInfo(uid){
  if(_userInfoCache[uid])return _userInfoCache[uid];
  try{const u=await fbDb.collection('users').doc(uid).get();_userInfoCache[uid]=u.exists?{playerName:u.data().displayName||'Joueur',avatar:u.data().avatar||'⚔'}:{playerName:'Joueur',avatar:'⚔'};}
  catch(e){_userInfoCache[uid]={playerName:'Joueur',avatar:'⚔'};}
  return _userInfoCache[uid];
}
function startMJPlayersListener(campaignId){
  const unsub=fbDb.collection('characters').where('campaignId','==',campaignId)
    .onSnapshot(async snap=>{
      let changed=false;
      for(const change of snap.docChanges()){
        if(change.doc.id.endsWith('_mj'))continue;
        const data=change.doc.data();
        if(data.ejectedFromCampaign){
          const wasPresent=_mjPlayersData.some(p=>p.docId===change.doc.id);
          if(wasPresent){_mjPlayersData=_mjPlayersData.filter(p=>p.docId!==change.doc.id);changed=true;}
          continue;
        }
        // Joueur a signalé fin de son tour → avancer automatiquement
        if(change.type==='modified'&&data.turnDone===true&&!change.doc.metadata.hasPendingWrites){
          fbDb.collection('characters').doc(change.doc.id).update({turnDone:firebase.firestore.FieldValue.delete()}).catch(()=>{});
          if(_mjCombatStarted)mjNextTurn();
          continue;
        }
        const uid=data.userId;
        const info=await _getPlayerInfo(uid);
        if(change.type==='added'){
          if(!_mjPlayersData.find(p=>p.docId===change.doc.id)){
            _mjPlayersData.push({uid,docId:change.doc.id,playerName:info.playerName,avatar:info.avatar,charData:data.characterData||{}});
            changed=true;
          }
        }else if(change.type==='modified'){
          if(!change.doc.metadata.hasPendingWrites){
            const idx=_mjPlayersData.findIndex(p=>p.docId===change.doc.id);
            if(idx>=0){
              const _oldLog=(_mjPlayersData[idx].charData&&_mjPlayersData[idx].charData.actionLog)||[];
              _mjPlayersData[idx].charData=data.characterData||{};
              // Journal d'actions joueur→MJ (principe 25) — pousse les nouvelles entrées dans le journal de combat (3ᵉ personne)
              const _newLog=(data.characterData&&data.characterData.actionLog)||[];
              if(_newLog.length){
                const _seen=new Set(_oldLog.map(e=>e&&e.id));
                _newLog.forEach(e=>{if(e&&e.id&&!_seen.has(e.id)){_mjCombatLog.push('📩 '+esc(e.name||info.playerName||'Joueur')+' '+esc(e.text||''));changed=true;}});
                if(_mjCombatLog.length>80)_mjCombatLog=_mjCombatLog.slice(-80);
              }
              // Sync HP dans le tracker de combat si ce joueur est en combat
              const newHp=data.characterData?.hp;
              const newHpMax=data.characterData?.hpMax;
              const combIdx=_mjCombatants.findIndex(cb=>cb.uid===uid&&cb.isPlayer);
              if(combIdx>=0){
                if(newHp!==undefined){
                  _mjCombatants[combIdx].hp=newHp;
                  if(newHpMax!==undefined)_mjCombatants[combIdx].hpMax=newHpMax;
                }
                const newInit=data.characterData?.pendingInitiative;
                if(newInit!==undefined)_mjCombatants[combIdx].initiative=newInit;
                const newDs=data.characterData?.deathSaves;
                if(newDs!==undefined)_mjCombatants[combIdx].deathSaves=newDs;
              }
              changed=true;
            }
          }
        }else if(change.type==='removed'){
          _mjPlayersData=_mjPlayersData.filter(p=>p.docId!==change.doc.id);changed=true;
        }
      }
      // Fondation 5 — auto-sync des familiers (apparition/retrait, y compris invocation mid-combat)
      if(typeof _mjSyncFamiliars==='function'&&_mjSyncFamiliars())changed=true;
      if(changed)_debouncedMJRender();
    },err=>console.warn('MJ sync error:',err));
  _unsubscribes.push(unsub);
}
let _implacableDC=10,_implacableConMod=0;
function _showRageImplacablePopup(p){
  const uses=(p.combatCharges||{})['RageImplacableUses']||0;
  _implacableDC=10+uses*5;
  const conVal=(p.abilities&&p.abilities[2]!==undefined)?p.abilities[2]:10;
  _implacableConMod=Math.floor((conVal-10)/2);
  openModal(`<div class="pt">💪 Rage implacable — 0 PV !</div>
    <div style="font-size:18px;color:var(--text2);margin-bottom:12px">Tu tombes à 0 PV pendant ta rage.<br>Lance un <strong>JS CON DD ${_implacableDC}</strong> pour rester à 1 PV !</div>
    <div style="font-size:18px;color:var(--text3);margin-bottom:16px">DD actuel : ${_implacableDC}${uses>0?' ('+uses+' usage'+(uses>1?'s':'')+')':''} . +5 par usage, remis à 0 au repos.</div>
    <button class="btn bac" style="width:100%;margin-bottom:8px" onclick="_doRageImplacableRoll()">🎲 Lancer JS CON DD ${_implacableDC}</button>
    <button class="btn" style="width:100%" onclick="closeModal()">✕ Lancer physiquement</button>`);
}
function _doRageImplacableRoll(){
  const p=P();
  if(p){if(!p.combatCharges)p.combatCharges={};p.combatCharges['RageImplacableUses']=(p.combatCharges['RageImplacableUses']||0)+1;_markUnsaved();saveAll();}
  rollSave('JS CON',_implacableConMod);
  closeModal();
}
function startPlayerListener(campaignId){
  const docId=currentUser.uid+'_'+campaignId;
  const unsub=fbDb.collection('characters').doc(docId)
    .onSnapshot(snap=>{
      if(!snap.exists||snap.metadata.hasPendingWrites)return;
      // Ignorer notre propre sauvegarde (évite re-render + fermeture de modals)
      if(_ownWritePending>0){_ownWritePending--;return;}
      const newData=snap.data()?.characterData;
      if(!newData)return;
      // Comparaison stable (indépendante de l'ordre des clés) pour éviter les faux positifs
      const newStr=_stableJSON(newData);
      // Vérification secondaire : snapshot correspond à l'une de nos propres sauvegardes (snapshots tardifs)
      if(_ownWriteDataSet.has(newStr)){_ownWriteDataSet.delete(newStr);_ownWriteData=null;return;}
      if(_ownWriteData&&_ownWriteData===newStr){_ownWriteData=null;return;}
      _ownWriteData=null;
      if(_stableJSON(state.players[0])===newStr)return;
      // Rage implacable : détecter la chute à 0 PV pendant la rage
      const _oldHp=(state.players[0]?.hp??0);
      const _newHp=(newData.hp??0);
      const _rageActive=(newData.combatCharges||{})['RageActive']===true;
      const _barbLvl=((newData.classes||[]).find(c=>c.name==='Barbare')||{}).level||0;
      state.players[0]=newData;
      _suppressUnsavedMark=true;render();
      _flashSyncDot('playerSyncDot');
      showToast('🎲 Fiche mise à jour par le MJ');
      if(_barbLvl>=11&&_rageActive&&_oldHp>0&&_newHp<=0)_showRageImplacablePopup(newData);
    },err=>console.warn('Player sync error:',err));
  _unsubscribes.push(unsub);
}
// ═══ PARTY HUD ═══
let _groupData=[];
let _groupHudOpen=false;
let _seenGroupBuffs=new Set();
// ─── BANNIÈRE SLIDE RÉUTILISABLE (principe 20 — événements importants > toasts discrets) ───
// Règle : bannière = événement de jeu important (dégâts/soins notables, repos, montée de niveau,
//   charge épuisée, statut gagné/perdu, concentration brisée, jets de mort…).
//   showToast = confirmations mineures sans impact (Sauvegardé, Copié, Récupéré, Ajouté).
const BANNER_VARIANTS={
  gold:{c:'var(--cp)',g:'rgba(200,168,75,.3)'},
  success:{c:'#4caf50',g:'rgba(76,175,80,.32)'},
  danger:{c:'#e53935',g:'rgba(229,57,53,.32)'},
  info:{c:'#7fd1c4',g:'rgba(127,209,196,.32)'},
  warn:{c:'#ff9800',g:'rgba(255,152,0,.32)'},
};
function showBanner(icon,title,detail,opts){
  opts=opts||{};
  const v=BANNER_VARIANTS[opts.variant||'gold']||BANNER_VARIANTS.gold;
  const ex=document.getElementById('_buffNotif');if(ex)ex.remove();
  const d=document.createElement('div');d.id='_buffNotif';
  d.style.borderColor=v.c;d.style.boxShadow=`0 4px 24px ${v.g}`;
  d.innerHTML=`<div style="font-size:26px;margin-bottom:4px">${icon}</div><div style="font-size:18px;font-weight:700;color:${v.c};margin-bottom:2px">${esc(title)}</div>${detail?`<div style="font-size:17px;color:var(--text2);margin-bottom:4px">${esc(detail)}</div>`:''}${opts.source?`<div style="font-size:15px;color:var(--text3)">par ${esc(opts.source)}</div>`:''}`;
  document.body.appendChild(d);
  const hide=()=>{d.style.transition='opacity .4s';d.style.opacity='0';setTimeout(()=>{if(d.parentNode)d.remove();},400);};
  setTimeout(hide,opts.duration||4500);d.addEventListener('click',hide);
}
// Compat : ancienne signature des notifications de buff
function _showBuffNotification(icon,title,detail,sourceName){showBanner(icon,title,detail,{source:sourceName});}
function _checkIncomingBuffs(oldCD,newCD,isSelf){
  // Chant reposant : écrit sur le doc du BARDE → notifie les AUTRES alliés (pas le barde)
  if(!isSelf){
    const oldChant=oldCD?.combatCharges?.ChantReposantResult;
    const newChant=newCD?.combatCharges?.ChantReposantResult;
    if(newChant!==undefined&&newChant!==oldChant){
      const src=newCD.charName||'Le barde';
      const key=`ChantReposant:${src}:${newChant}`;
      if(!_seenGroupBuffs.has(key)){_seenGroupBuffs.add(key);_showBuffNotification('🎶','Chant reposant',`+${newChant} PV au prochain repos court`,src);}
    }
  }
  // Buffs CIBLÉS (Inspiration/Bénédiction/Assistance) + soins : écrits sur le doc de la CIBLE → notifient la cible (soi)
  if(isSelf){
    const _buffDefs=[
      {name:'InspirationBardique',icon:'🎵',title:'Inspiration bardique',detail:b=>`+1${b.die} sur ton prochain jet`},
      {name:'Benediction',icon:'✨',title:'Bénédiction',detail:()=>'+1d4 aux jets d\'attaque et sauvegardes (concentration)'},
      {name:'Assistance',icon:'🤝',title:'Assistance',detail:()=>'+1d4 à ton prochain jet de compétence'},
      {name:'AuraProtection',icon:'🛡',title:'Aura de protection',detail:b=>'+'+(b.value||0)+' à tous tes jets de sauvegarde (tant que tu es à portée)'},
    ];
    _buffDefs.forEach(def=>{
      const oldB=(oldCD?.activeBuffs||[]).find(b=>b.name===def.name);
      const newB=(newCD?.activeBuffs||[]).find(b=>b.name===def.name);
      if(newB&&!oldB){
        const src=newB.sourceName||'Un allié';
        const key=`${def.name}:${src}:${Date.now()}`;
        if(!_seenGroupBuffs.has(key)){_seenGroupBuffs.add(key);_showBuffNotification(def.icon,def.title,def.detail(newB),src);}
      }
    });
    // Soins directs reçus (Mot de guérison, Soin) — hausse de HP via une écriture distante (pas un soin manuel local)
    const oldHp=oldCD?.hp,newHp=newCD?.hp;
    if(newHp!==undefined&&oldHp!==undefined&&newHp>oldHp){
      _showBuffNotification('💚','Soins reçus',`+${newHp-oldHp} PV`,null);
    }
  }
}
let _groupOnlyMode=false;
let _currentHudDetailUid=null;

function startGroupListener(campaignId){
  const unsub=fbDb.collection('characters').where('campaignId','==',campaignId)
    .onSnapshot(async snap=>{
      let changed=false;
      for(const change of snap.docChanges()){
        if(change.doc.id.endsWith('_mj'))continue;
        const data=change.doc.data();
        if(data.ejectedFromCampaign){
          const wasPresent=_groupData.some(p=>p.docId===change.doc.id);
          if(wasPresent){_groupData=_groupData.filter(p=>p.docId!==change.doc.id);changed=true;}
          continue;
        }
        const uid=data.userId;
        const info=await _getPlayerInfo(uid);
        const charData=data.characterData||{};
        if(change.type==='added'){
          if(!_groupData.find(p=>p.docId===change.doc.id)){
            _groupData.push({uid,docId:change.doc.id,playerName:info.playerName,avatar:info.avatar,charData});
            changed=true;
          }
        }else if(change.type==='modified'){
          const idx=_groupData.findIndex(p=>p.docId===change.doc.id);
          const oldCharData=idx>=0?_groupData[idx].charData:null;
          if(idx>=0){_groupData[idx].charData=charData;changed=true;}
          else{_groupData.push({uid,docId:change.doc.id,playerName:info.playerName,avatar:info.avatar,charData});changed=true;}
          if(!change.doc.metadata.hasPendingWrites){
            _checkIncomingBuffs(oldCharData,charData,uid===currentUser?.uid);
            if(uid===currentUser?.uid&&state?.players?.[state.activeIdx]){
              const _newB=JSON.stringify(charData.activeBuffs||[]);
              const _oldB=JSON.stringify(state.players[state.activeIdx].activeBuffs||[]);
              if(_newB!==_oldB){
                state.players[state.activeIdx].activeBuffs=charData.activeBuffs||[];
                if(typeof render==='function')render();
              }
            }
          }
        }else if(change.type==='removed'){
          _groupData=_groupData.filter(p=>p.docId!==change.doc.id);changed=true;
        }
      }
      if(changed)_updatePartyHUD();
    },err=>console.warn('Group HUD error:',err));
  _unsubscribes.push(unsub);
}

function startCombatListener(campaignId,mjUid){
  const unsub=fbDb.collection('characters').doc(mjUid+'_'+campaignId+'_mj')
    .onSnapshot(snap=>{
      if(!snap.exists)return;
      _updateCombatNotification(snap.data().combatState||null);
    },err=>console.warn('Combat listener error:',err));
  _unsubscribes.push(unsub);
}
function _showCombatPopup(icon,title,sub,duration=3400){
  const popup=document.getElementById('combatPopup');if(!popup)return;
  document.getElementById('combatPopupIcon').textContent=icon;
  document.getElementById('combatPopupTitle').textContent=title;
  document.getElementById('combatPopupSub').textContent=sub;
  const box=popup.querySelector('.combat-popup-box');
  if(box){box.style.animation='none';void box.offsetHeight;box.style.animation='';}
  popup.className='show';
  clearTimeout(popup._timer);
  popup._timer=setTimeout(()=>{popup.className='';},duration);
}
function _showInitiativePopup(){
  const p=P();
  if(!p){_showCombatPopup('⚔','Le combat commence !','Préparez-vous !');return;}
  const popup=document.getElementById('combatPopup');if(!popup)return;
  document.getElementById('combatPopupIcon').textContent='⚔';
  document.getElementById('combatPopupTitle').textContent='Le combat commence !';
  const _barbLvlInit=((p.classes||[]).find(c=>c.name==='Barbare')||{}).level||0;
  const _initHasAdv=_barbLvlInit>=7;
  const _initAdvNote=_initHasAdv?'<div style="font-size:17px;color:#e53935;margin-bottom:6px">🦅 Instinct sauvage — 2d20, prend le meilleur</div>':'';
  const _initIRLBtn=typeof _isIRLMode==='function'&&_isIRLMode()?`<button onclick="_rollMyInitiativeIRL();event.stopPropagation()" style="margin-top:6px;padding:8px 16px;background:transparent;color:var(--cp);border:2px solid var(--cp);border-radius:10px;font-size:19px;font-weight:700;cursor:pointer;font-family:var(--F)">✏ Saisir le résultat IRL</button>`:'';
  document.getElementById('combatPopupSub').innerHTML=`${_initAdvNote}<button onclick="_rollMyInitiative();event.stopPropagation()" style="margin-top:10px;padding:12px 28px;background:var(--cp);color:#000;border:none;border-radius:10px;font-size:25px;font-weight:700;cursor:pointer;font-family:var(--F)">🎲 Lancer mon initiative</button>${_initIRLBtn?'<br>'+_initIRLBtn:''}`;
  const box=popup.querySelector('.combat-popup-box');
  if(box){box.style.animation='none';void box.offsetHeight;box.style.animation='';}
  popup.className='show';
}
async function _rollMyInitiative(){
  const p=P();if(!p||!currentUser||!currentCampaignId)return;
  const dexVal=(p.abilities&&p.abilities[1]!==undefined)?p.abilities[1]:10;
  const dexMod=Math.floor((dexVal-10)/2);
  const barbareLvl=((p.classes||[]).find(c=>c.name==='Barbare')||{}).level||0;
  const hasAdv=barbareLvl>=7;
  const d20a=Math.ceil(Math.random()*20);
  const d20b=hasAdv?Math.ceil(Math.random()*20):null;
  const d20=hasAdv?Math.max(d20a,d20b):d20a;
  const total=d20+dexMod;
  const sub=document.getElementById('combatPopupSub');
  if(sub)sub.innerHTML=`<div style="font-size:52px;font-weight:800;color:var(--cp);font-family:var(--F);line-height:1">${total}</div><div style="font-size:18px;color:var(--text3);margin-top:4px">d20(${hasAdv?d20a+','+d20b+'→'+d20:d20}) ${dexMod>=0?'+':''}${dexMod} DEX${hasAdv?' 🦅':''}</div>`;
  try{await fbDb.collection('characters').doc(currentUser.uid+'_'+currentCampaignId).update({'characterData.pendingInitiative':total});}catch(e){}
  const popup=document.getElementById('combatPopup');
  if(popup){clearTimeout(popup._timer);popup._timer=setTimeout(()=>{popup.className='';},3000);}
}
async function _rollMyInitiativeIRL(){
  const p=P();if(!p||!currentUser||!currentCampaignId)return;
  const dexVal=(p.abilities&&p.abilities[1]!==undefined)?p.abilities[1]:10;
  const dexMod=Math.floor((dexVal-10)/2);
  const barbareLvl=((p.classes||[]).find(c=>c.name==='Barbare')||{}).level||0;
  const hasAdv=barbareLvl>=7;
  const advTxt=hasAdv?'Lance 2 dés, entre le meilleur résultat :':'Entre le résultat de ton d20 :';
  openModal(`<div style="text-align:center;padding:14px 12px">
    <div class="pt" style="margin-bottom:8px">Initiative — Mode IRL</div>
    <div style="font-size:18px;color:var(--text3);margin-bottom:12px">${advTxt}${hasAdv?'<br><span style="color:#e53935;font-size:17px">🦅 Instinct sauvage — avantage</span>':''}</div>
    <input class="fi" id="initIRLInput" type="number" min="1" max="20" style="text-align:center;font-size:22px;width:80px;margin-bottom:14px">
    <div style="font-size:17px;color:var(--text3);margin-bottom:12px">+${dexMod>=0?'+':''}${dexMod} DEX sera ajouté automatiquement</div>
    <div style="display:flex;gap:8px;justify-content:center">
      <button class="btn" onclick="closeModal()">Annuler</button>
      <button class="btn bac" onclick="(async()=>{const v=parseInt(document.getElementById('initIRLInput')?.value)||0;if(v<1||v>20){showToast('❌ Invalide (1-20)');return;}const tot=v+${dexMod};const sub=document.getElementById('combatPopupSub');if(sub)sub.innerHTML='<div style=\"font-size:52px;font-weight:800;color:var(--cp);\">'+tot+'</div><div style=\"font-size:18px;color:var(--text3);margin-top:4px\">d20('+v+') ${dexMod>=0?'+':''}${dexMod} DEX</div>';closeModal();try{await fbDb.collection('characters').doc(currentUser.uid+'_'+currentCampaignId).update({'characterData.pendingInitiative':tot});}catch(e){}const popup=document.getElementById('combatPopup');if(popup){clearTimeout(popup._timer);popup._timer=setTimeout(()=>{popup.className='';},3000);}})()">Valider</button>
    </div>
  </div>`);
}
function _updateCombatNotification(combatState){
  const wasActive=!!(_activeCombatState?.active);
  const isNowActive=!!(combatState?.active);
  const prevTurnUid=_prevCombatTurnUid;
  const newTurnUid=isNowActive?(combatState?.currentTurnUid||null):null;
  const isFirstCall=!_combatListenerInitialized;
  _combatListenerInitialized=true;
  _prevCombatTurnUid=newTurnUid;
  _activeCombatState=combatState;
  if(!isFirstCall){
    const isMyTurn=isNowActive&&newTurnUid===currentUser?.uid;
    const wasMyTurn=wasActive&&prevTurnUid===currentUser?.uid;
    if(!wasActive&&isNowActive){
      if(typeof _resetActionEco==='function')_resetActionEco();
      _showInitiativePopup();
    } else if(wasActive&&!isNowActive){
      _showCombatPopup('🏆','Combat terminé !','');
    } else if(isMyTurn&&!wasMyTurn){
      if(typeof _resetActionEco==='function')_resetActionEco(true); // jauges Action/Bonus/Réaction neuves au début de mon tour
      _showCombatPopup('⚡',"C'est ton tour !",'Prépare tes actions !',2800);
      // Fix 14 — Popup "action hostile?" si barbare en rage
      setTimeout(()=>_checkRageHostilePrompt(),500);
      // Fix 15 — Nettoyer le statut Attaque téméraire (il expire à la fin du tour précédent)
      setTimeout(()=>_clearTemérité(),300);
    }
  }
  const banner=document.getElementById('combatTurnBanner');
  if(banner){
    const isMyTurn=combatState&&combatState.active&&combatState.currentTurnUid===currentUser?.uid;
    banner.style.display=isMyTurn?'flex':'none';
    if(isMyTurn){const nm=document.getElementById('combatTurnName');if(nm)nm.textContent='C\'est votre tour !';}
  }
  _updatePartyHUD();
}
async function playerEndTurn(){
  if(!currentUser||!currentCampaignId)return;
  try{
    await fbDb.collection('characters').doc(currentUser.uid+'_'+currentCampaignId).update({turnDone:true});
    const banner=document.getElementById('combatTurnBanner');
    if(banner)banner.style.display='none';
    showToast('⏩ Fin de tour signalée. <button onclick="_undoEndTurn()" style="margin-left:8px;padding:3px 10px;border:1px solid var(--cp);border-radius:6px;background:transparent;color:var(--cp);cursor:pointer;font-size:18px">Annuler</button>',6000);
  }catch(e){showToast('❌ Erreur : '+e.message);}
}
async function _undoEndTurn(){
  if(!currentUser||!currentCampaignId)return;
  try{
    await fbDb.collection('characters').doc(currentUser.uid+'_'+currentCampaignId).update({turnDone:false});
    const t=document.getElementById('toast');if(t)t.style.display='none';
    showToast('↩ Tour annulé.');
  }catch(e){}
}
// Fix 14 — Popup "action hostile?" pour le barbare en rage
function _checkRageHostilePrompt() {
  const p = P();
  if (!p) return;
  const barbareLvl = ((p.classes||[]).find(c=>c.name==='Barbare')||{}).level||0;
  if (!barbareLvl) return;
  if (!(p.combatCharges||{})['RageActive']) return;
  const isPersistante = barbareLvl >= 15;
  if (isPersistante) return;
  const round = (_activeCombatState||{}).round||1;
  if (round <= 1) return;
  openModal(`<div style="text-align:center;padding:16px 12px">
    <div style="font-size:36px;margin-bottom:8px">🔥</div>
    <div class="pt" style="margin-bottom:8px">Tu es en rage !</div>
    <div style="font-size:19px;color:var(--text2);margin-bottom:14px">As-tu attaqué ou subi des dégâts lors de ton dernier tour ?</div>
    <div style="display:flex;gap:8px;justify-content:center">
      <button class="btn bac" style="flex:1" onclick="closeModal()">✅ Oui — Rage continue</button>
      <button class="btn" style="flex:1;color:#e53935;border-color:#e53935" onclick="closeModal();toggleRageActive();showToast('🔥 Rage terminée — aucune action hostile.')">❌ Non — Fin de rage</button>
    </div>
  </div>`);
}

// Fix 15 — Nettoyer statut Attaque téméraire au début du nouveau tour
function _clearTemérité() {
  const p = P();
  if (!p || !p.statuses) return;
  if (!p.statuses.find(s=>s.name==='Attaque téméraire')) return;
  p.statuses = p.statuses.filter(s=>s.name!=='Attaque téméraire');
  if (p.combatCharges) p.combatCharges['Témérité'] = false;
  _markUnsaved(); render();
}

function _togglePartyHud(){
  _groupHudOpen=!_groupHudOpen;
  const panel=document.getElementById('partyHudPanel');
  if(panel)panel.style.display=_groupHudOpen?'block':'none';
  if(!_groupHudOpen)_hideHudDetail();
}
function _partyMemberClick(uid){
  const pp=_groupData.find(x=>x.uid===uid);
  if(!pp)return;
  openPlayerReadonlySheet(pp);
}
function openPlayerReadonlySheet(pp){
  const p=pp.charData||{};
  openPlayerReadonlySheetFull(p,p.privacy||{},{playerName:pp.playerName,avatar:pp.avatar},false);
}
function openPlayerReadonlySheetFull(p,priv,playerInfo,isMJ){
  const isPublic=tab=>isMJ||priv[tab]!==false;
  const portrait=p.portrait||p.equipPortrait;
  const abilities=p.abilities||[10,10,10,10,10,10];
  const lvl=(p.classes||[]).reduce((s,c)=>s+(c.level||1),0)||1;
  const pb=lvl>=17?6:lvl>=13?5:lvl>=9?4:lvl>=5?3:2;
  const cls=(p.classes||[]).map(c=>`${c.name} ${c.level||1}`).join(' / ')||'—';
  const charName=esc(p.charName||playerInfo?.playerName||'?');

  // helpers
  const roCell=(label,val)=>`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:10px"><div style="font-size:15px;color:var(--text3);margin-bottom:3px">${label}</div><div style="font-size:18px">${val}</div></div>`;
  const roSection=(label)=>`<div style="font-size:15px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin:14px 0 8px">${label}</div>`;

  // Onglet Perso
  const persoContent=isPublic('perso')?`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:4px">
      ${roCell('Classe',esc(cls))}
      ${roCell('Race',esc(p.race||'—'))}
      ${roCell('Historique',esc(p.background||'—'))}
      ${p.alignment?roCell('Alignement',esc(p.alignment)):''}
      ${roCell('Niveau total',lvl)}
      ${roCell('Bonus maîtrise',`+${pb}`)}
      ${p.speed?roCell('Vitesse',p.speed+' m'):''}
    </div>
    ${isPublic('competences')&&abilities?`${roSection('Caractéristiques')}
    <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:5px;margin-bottom:4px">
      ${ABILITIES_SH.map((s,i)=>{const v=abilities[i]||10;const m=Math.floor((v-10)/2);return`<div style="text-align:center;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:6px 3px"><div style="font-size:13px;color:var(--text3);font-weight:600">${s}</div><div style="font-size:25px;font-weight:700">${v}</div><div style="font-size:17px;color:var(--cp)">${m>=0?'+':''}${m}</div></div>`;}).join('')}
    </div>`:''}
    ${!isPublic('competences')?`<div style="padding:8px;background:var(--surface2);border-radius:6px;font-size:18px;color:var(--text3);margin-bottom:8px">🔒 Caractéristiques — section privée</div>`:''}
    ${(()=>{
      // Capacités & traits (race + background)
      const traits=[];
      if(SRD&&SRD.races){const rd=SRD.races.find(r=>r.name===p.race);if(rd&&rd.traits){if(Array.isArray(rd.traits))rd.traits.forEach(t=>traits.push({name:t.name,source:esc(p.race||''),desc:t.desc||''}));else if(typeof rd.traits==='string')traits.push({name:'Traits raciaux',source:esc(p.race||''),desc:rd.traits});}}
      if(SRD&&SRD.backgrounds){const bd=SRD.backgrounds.find(b=>b.name===p.background);if(bd&&bd.feature)traits.push({name:bd.feature,source:esc(p.background||''),desc:bd.featureDesc||''});}
      if(!traits.length)return'';
      return`${roSection('Capacités & traits')}${traits.map(t=>`<div style="margin-bottom:8px;padding:8px;background:var(--surface2);border:1px solid var(--border);border-radius:8px"><div style="font-size:18px;font-weight:600;color:var(--cp)">${esc(t.name)}</div><div style="font-size:15px;color:var(--text3);margin-bottom:3px">${t.source}</div>${t.desc?`<div style="font-size:18px;color:var(--text2);margin-top:4px">${esc(t.desc)}</div>`:''}</div>`).join('')}`;
    })()}
    ${(()=>{
      const sts=p.statuses||[];if(!sts.length)return'';
      return`${roSection('Statuts')}${sts.map(s=>`<span class="status-badge ${s.type||'malus'}" style="margin:2px">${s.icon||'◆'} ${esc(s.name)}</span>`).join('')}`;
    })()}
  `:`<div style="padding:12px;background:var(--surface2);border-radius:8px;font-size:18px;color:var(--text3)">🔒 Section Perso — privée</div>`;

  // Onglet Combat
  const combatContent=isPublic('combat')?`
    ${(()=>{
      const hp=p.hp||0;const hpMax=p.hpMax||1;const hpPct=Math.max(0,Math.min(100,hpMax?hp/hpMax*100:0));const hpColor=hpPct>50?'#4caf50':hpPct>25?'#ff9800':'#e53935';
      const conds=p.conditions||[];const charges=_buildChargeChips(p);
      // Armes
      const eq=p.equip||{};const forM=Math.floor((abilities[0]-10)/2);const dexM=Math.floor((abilities[1]-10)/2);
      const weapons=['mainhand','offhand','ranged'].map(slot=>{const it=eq[slot];return it&&it.name?{...it,slot}:null;}).filter(Boolean);
      const weaponsHtml=weapons.length?`${roSection('Armes équipées')}${weapons.map(w=>{
        const srdW=findSRDWeapon(w.name);
        const finesse=srdW&&(srdW.properties||'').includes('Finesse');
        const atkM=finesse?Math.max(forM,dexM):w.slot==='ranged'?dexM:forM;
        const bonus=pb+atkM;
        const slotLabel=w.slot==='mainhand'?'Main droite':w.slot==='offhand'?'Main gauche':'Distance';
        return`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;margin-bottom:5px"><div><div style="font-size:18px;font-weight:600">${esc(w.name)}</div><div style="font-size:15px;color:var(--text3)">${slotLabel}</div></div><span style="color:var(--cp);font-weight:700">${bonus>=0?'+':''}${bonus}${srdW?' / '+esc(srdW.damage):''}</span></div>`;
      }).join('')}`:'';
      // Sauvegardes
      const mc=(p.classes||[])[0];const saveProfIds=mc?(CLASS_SAVES[mc.name]||[]):[];
      const savesHtml=`${roSection('Sauvegardes')}<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:4px;margin-bottom:4px">${ABILITIES_SH.map((ab,i)=>{const m=Math.floor((abilities[i]-10)/2)+(saveProfIds.includes(i)?pb:0);const hasSave=saveProfIds.includes(i);return`<div style="text-align:center;background:var(--surface2);border:1px solid ${hasSave?'rgba(200,168,75,.4)':'var(--border)'};border-radius:8px;padding:6px 2px"><div style="font-size:13px;color:var(--text3);font-weight:600">${ab}</div><div style="font-size:21px;font-weight:700;color:${hasSave?'var(--cp)':'var(--text)'}">${m>=0?'+':''}${m}</div></div>`;}).join('')}</div>`;
      return`<div style="display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;margin-bottom:12px">
        <div><div style="display:flex;justify-content:space-between;font-size:17px;color:var(--text3);margin-bottom:4px"><span>Points de vie</span><span style="font-weight:700;color:${hp<=0?'#e53935':hpColor}">${hp<=0?(p.deathSaves?.fail>=3?'💀 Mort':'⚠ À terre'):hp+' / '+hpMax}</span></div>
        <div style="height:10px;background:var(--surface2);border-radius:5px;overflow:hidden"><div style="height:100%;width:${hpPct}%;background:${hpColor};border-radius:5px"></div></div></div>
        ${p.ac?`<div style="text-align:center;background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:8px 14px"><div style="font-size:15px;color:var(--text3)">CA</div><div style="font-size:22px;font-weight:700">${p.ac}</div></div>`:''}
      </div>
      ${conds.length?`<div style="margin-bottom:12px"><div style="font-size:15px;color:var(--text3);font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Conditions</div><div style="display:flex;flex-wrap:wrap;gap:5px">${conds.map(c=>`<span class="status-badge malus">⚠ ${esc(c)}</span>`).join('')}</div></div>`:''}
      ${charges?`<div style="margin-bottom:8px"><div style="font-size:15px;color:var(--text3);font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Capacités</div>${charges}</div>`:''}
      ${weaponsHtml}${savesHtml}`;
    })()}
  `:`<div style="padding:12px;background:var(--surface2);border-radius:8px;font-size:18px;color:var(--text3)">🔒 Section Combat — privée</div>`;

  // Onglet Sorts
  const spells=p.spells||[];
  const sortsContent=isPublic('sorts')?(spells.length?
    [0,1,2,3,4,5,6,7,8,9].map(lvl=>{const ls=spells.filter(s=>s.level===lvl);if(!ls.length)return'';return`<div style="margin-bottom:12px"><div style="font-size:17px;color:var(--text3);margin-bottom:5px">${lvl===0?'Sorts mineurs':'Niveau '+lvl}</div><div style="display:flex;flex-wrap:wrap;gap:4px">${ls.map(s=>`<span style="font-size:17px;padding:2px 8px;border-radius:10px;border:1px solid ${s.prepared?'rgba(200,168,75,.4)':'var(--border)'};color:${s.prepared?'var(--cp)':'var(--text2)'}">${esc(s.name)}</span>`).join('')}</div></div>`;}).join('')
    :`<div style="font-size:18px;color:var(--text3);font-style:italic">Aucun sort connu.</div>`)
    :`<div style="padding:12px;background:var(--surface2);border-radius:8px;font-size:18px;color:var(--text3)">🔒 Section Sorts — privée</div>`;

  // Onglet Équipement
  const equipContent=isPublic('equipement')?`
    ${(()=>{const eq=p.equip||{};const worn=[{k:'chest',l:'Torse'},{k:'mainhand',l:'Main principale'},{k:'offhand',l:'Main secondaire'},{k:'ranged',l:'Distance'}].filter(s=>eq[s.k]&&eq[s.k].name);
    return worn.length?`<div style="font-size:15px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">Équipement porté</div>${worn.map(s=>`<div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:18px"><span style="color:var(--text3);min-width:130px;font-size:17px">${s.l}</span><span>${esc(eq[s.k].name)}</span></div>`).join('')}`:`<div style="font-size:18px;color:var(--text3);font-style:italic">Aucun équipement porté.</div>`;})()}
  `:`<div style="padding:12px;background:var(--surface2);border-radius:8px;font-size:18px;color:var(--text3)">🔒 Section Équipement — privée</div>`;

  // Onglet Sac
  const sacContent=isPublic('sac')?`
    ${(()=>{const inv=p.inventory||[];const cur=p.currency||{};
    const curLine=[{k:'pp',l:'pp'},{k:'po',l:'po'},{k:'pe',l:'pe'},{k:'pa',l:'pa'},{k:'pc',l:'pc'}].filter(x=>cur[x.k]>0).map(x=>`<span style="font-size:18px;padding:3px 9px;border-radius:10px;border:1px solid var(--border);color:var(--cp)">${cur[x.k]} ${x.l}</span>`).join('');
    return`${curLine?`<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px">${curLine}</div>`:''}${inv.length?`<div style="font-size:15px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Inventaire</div>${inv.map(item=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:18px"><span>${esc(item.name||item)}</span>${item.qty!==undefined?`<span style="color:var(--text3)">×${item.qty}</span>`:''}</div>`).join('')}`:`<div style="font-size:18px;color:var(--text3);font-style:italic">Sac vide.</div>`}`;})()}
  `:`<div style="padding:12px;background:var(--surface2);border-radius:8px;font-size:18px;color:var(--text3)">🔒 Section Sac — privée</div>`;

  // Onglet Historique
  const histContent=isPublic('historique')?`
    ${[{l:'Traits',v:p.traits},{l:'Idéaux',v:p.ideals},{l:'Liens',v:p.bonds},{l:'Défauts',v:p.flaws},{l:'Langues',v:p.languages},{l:'Backstory',v:p.backstory}].filter(x=>x.v).map(x=>`<div style="margin-bottom:14px"><div style="font-size:15px;color:var(--text3);font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px">${x.l}</div><div style="font-size:18px;color:var(--text2);white-space:pre-wrap;line-height:1.55">${esc(x.v)}</div></div>`).join('')||`<div style="font-size:18px;color:var(--text3);font-style:italic">Aucune info.</div>`}
  `:`<div style="padding:12px;background:var(--surface2);border-radius:8px;font-size:18px;color:var(--text3)">🔒 Section Historique — privée</div>`;

  const tabs=[{id:'perso',l:'Perso',c:persoContent},{id:'combat',l:'Combat',c:combatContent},{id:'sorts',l:'Sorts',c:sortsContent},{id:'equipement',l:'Équip.',c:equipContent},{id:'sac',l:'Sac',c:sacContent},{id:'historique',l:'Hist.',c:histContent}];
  const first=tabs[0].id;

  const el=document.createElement('div');
  el.id='roSheetOverlay';
  el.style.cssText='position:fixed;inset:0;z-index:1100;background:rgba(0,0,0,.8);display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;padding:12px 8px';
  el.innerHTML=`<div style="background:var(--bg);border:1px solid var(--border);border-radius:12px;width:100%;max-width:600px;display:flex;flex-direction:column;min-height:70vh">
    <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid var(--border);flex-shrink:0">
      ${portrait?`<img src="${portrait}" style="width:52px;height:52px;border-radius:50%;object-fit:cover;border:2px solid var(--cp);flex-shrink:0">`:`<div style="width:52px;height:52px;border-radius:50%;background:var(--surface2);border:2px solid var(--cp);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0">${playerInfo?.avatar||'⚔'}</div>`}
      <div style="flex:1;min-width:0">
        <div style="font-size:22px;font-weight:700;color:var(--text)">${charName}</div>
        <div style="font-size:18px;color:var(--cp)">${esc(cls)}</div>
        <div style="font-size:17px;color:var(--text3)">${esc(p.race||'')}${p.background?' · '+esc(p.background):''} · Joueur : ${esc(playerInfo?.playerName||'')}</div>
      </div>
      <button onclick="document.getElementById('roSheetOverlay')?.remove()" style="background:none;border:1px solid var(--border);color:var(--text3);border-radius:6px;padding:4px 10px;cursor:pointer;font-size:18px;flex-shrink:0">✕</button>
    </div>
    <div style="display:flex;overflow-x:auto;border-bottom:1px solid var(--border);flex-shrink:0;background:var(--surface)">
      ${tabs.map(t=>`<button id="rotab_${t.id}" onclick="_roTab('${t.id}')" style="flex:1;min-width:52px;padding:9px 5px;border:none;background:none;font-size:18px;cursor:pointer;border-bottom:2px solid ${t.id===first?'var(--cp)':'transparent'};color:${t.id===first?'var(--cp)':'var(--text3)'};font-weight:${t.id===first?'700':'400'};white-space:nowrap">${t.l}</button>`).join('')}
    </div>
    <div style="flex:1;overflow-y:auto">
      ${tabs.map(t=>`<div id="rocontent_${t.id}" style="padding:16px;display:${t.id===first?'block':'none'}">${t.c}</div>`).join('')}
    </div>
  </div>`;
  document.getElementById('roSheetOverlay')?.remove();
  document.body.appendChild(el);
  el.addEventListener('click',e=>{if(e.target===el)el.remove();});
}
function _roTab(tabId){
  document.querySelectorAll('[id^="rotab_"]').forEach(b=>{const t=b.id.replace('rotab_','');b.style.borderBottomColor=t===tabId?'var(--cp)':'transparent';b.style.color=t===tabId?'var(--cp)':'var(--text3)';b.style.fontWeight=t===tabId?'700':'400';});
  document.querySelectorAll('[id^="rocontent_"]').forEach(c=>{c.style.display=c.id.replace('rocontent_','')===tabId?'block':'none';});
}
function openHubPlayerSheet(uid,campId){
  let pp=null;
  if(_hubCache){for(const t of _hubCache){if(t._campParticipants){for(const [cid,parts] of Object.entries(t._campParticipants)){if(cid===campId){pp=parts.find(x=>x.uid===uid);break;}}}if(pp)break;}}
  if(!pp){showToast('❌ Données introuvables.');return;}
  const isMJ=!!(currentUser&&_hubCache&&(_hubCache.find(t=>t.campaigns&&t.campaigns.some(c=>c.id===campId))?.mjId===currentUser.uid));
  openPlayerReadonlySheetFull(pp.fullData||{},pp.priv||{},{playerName:pp.playerName,avatar:pp.avatar},isMJ);
}

// ─── CHUCHOTEMENTS ───
function startWhisperListener(tableId,uid){
  if(!tableId||!uid||tableId==='__solo__')return;
  _whisperHistory=[];_whisperInited=false;
  // Listener 1 : messages reçus
  const unsub1=fbDb.collection('tables').doc(tableId).collection('whispers')
    .where('to','==',uid)
    .limit(30)
    .onSnapshot(snap=>{
      const firstBatch=!_whisperInited;
      _whisperInited=true;
      snap.docChanges().forEach(change=>{
        if(change.type!=='added')return;
        const d=change.doc.data();
        if(!_whisperHistory.some(w=>w.id===change.doc.id)){
          _whisperHistory.unshift({id:change.doc.id,...d,sent:false});
          _whisperHistory.sort((a,b)=>(b.ts?.seconds||0)-(a.ts?.seconds||0));
          if(_whisperHistory.length>60)_whisperHistory.pop();
          if(!firstBatch&&typeof showToast==='function'){
            showToast(`🤫 <strong>${typeof esc==='function'?esc(d.fromName||'?'):d.fromName||'?'}</strong> vous chuchote : "${typeof esc==='function'?esc(d.message||''):d.message||''}"`,8000);
            if(typeof _refreshWhisperHistoryDisplay==='function')_refreshWhisperHistoryDisplay();
          }
        }
      });
    },err=>console.warn('Whisper listener error:',err));
  _unsubscribes.push(unsub1);
  // Listener 2 : messages envoyés
  const unsub2=fbDb.collection('tables').doc(tableId).collection('whispers')
    .where('from','==',uid)
    .limit(30)
    .onSnapshot(snap=>{
      snap.docChanges().forEach(change=>{
        if(change.type!=='added')return;
        const d=change.doc.data();
        const id=change.doc.id;
        if(!_whisperHistory.some(w=>w.id===id)){
          _whisperHistory.unshift({id,...d,sent:true});
          _whisperHistory.sort((a,b)=>(b.ts?.seconds||0)-(a.ts?.seconds||0));
          if(_whisperHistory.length>60)_whisperHistory.pop();
        }
      });
    },err=>console.warn('Whisper sent listener error:',err));
  _unsubscribes.push(unsub2);
}

async function sendWhisperMsg(toUid,toName,message){
  if(!currentUser||!currentTableId||!message.trim())return;
  try{
    const fromName=currentUserData?.displayName||currentUserData?.playerName||'Joueur';
    await fbDb.collection('tables').doc(currentTableId).collection('whispers').add({
      from:currentUser.uid,
      fromName,
      to:toUid,
      toName,
      message:message.trim(),
      ts:firebase.firestore.FieldValue.serverTimestamp(),
      campaignId:currentCampaignId||null
    });
  }catch(e){if(typeof showToast==='function')showToast('❌ Erreur envoi : '+e.message);}
}

