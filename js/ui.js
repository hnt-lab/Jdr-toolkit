// ═══════════════════════════════════════
// TUTO GUIDÉ
// ═══════════════════════════════════════

// Tuto 1 — Joueur (hub, profil, groupe, campagne)
const _TUTO_PLAYER=[
  {icon:'🧰',title:'Bienvenue dans La Boîte à Outils !',text:'Ton compagnon numérique pour D&D 5e. Fiche de personnage, suivi de combat, sorts, inventaire, monnaie — tout en un, synchronisé en temps réel avec ton MJ.',sel:'#hubScreen'},
  {icon:'🏠',title:'Le Hub — ta page d\'accueil',text:'C\'est d\'ici que tout part. Rejoins une campagne avec le code donné par ton MJ, ou crée ta propre table pour tester l\'outil. Toutes tes tables apparaissent ici.',sel:'#hubContent'},
  {icon:'🧑',title:'Rejoindre une campagne',text:'Quand tu rejoins une campagne pour la première fois, une fiche de personnage est créée automatiquement. Tu la remplis à ton rythme — nom, race, classe, stats... Un guide dédié à la fiche est disponible dans ton Profil.',sel:'.hub-section'},
  {icon:'📥',title:'Ton profil & ta bibliothèque',text:'Accède à ton profil via le bouton 👤 en haut à droite. Tu peux y gérer tes personnages, tes compendiums et ton compte. Si tu rejoins une nouvelle campagne, importe un personnage existant depuis ta bibliothèque — sans rien perdre.',sel:'#hubUserBtn'},
  {icon:'📋',title:'Menu campagne',text:'Sur la carte d\'une campagne, tu trouveras la description et la liste des membres. L\'icône 📋 à droite ouvre ta fiche ou celle de n\'importe quel participant. Clique sur "👥 Rejoindre le groupe" pour partir à l\'aventure.',sel:'.hub-card'},
  {icon:'👥',title:'Le menu Groupe',text:'Le bouton 👥 en bas à gauche est disponible partout — hub et fiche. Il affiche les PV, conditions et ressources de tous tes alliés en temps réel. Un badge rouge signale un allié en danger (PV < 25%).',sel:'#partyHudBtn'},
  {icon:'💬',title:'Donner un retour',text:'Un formulaire de feedback est accessible depuis ton Profil. Retours, questions, bugs, idées — tout est bienvenu. Tes retours aident directement à améliorer l\'outil pour toute la communauté.',sel:'#hubUserBtn'},
  {icon:'⚔️',title:'Combats',text:'Lorsque le MJ lance le combat, une bannière violette apparaît en haut de ta fiche quand c\'est ton tour. Clique sur ⏩ Fin de tour pour passer la main — le MJ et tes alliés le voient instantanément.',sel:null},
];

// Tuto 2 — Fiche personnage, onglet par onglet
const _TUTO_FICHE=[
  {icon:'🧑',title:'Ta fiche de personnage',text:'La fiche est ton tableau de bord en jeu. Elle est divisée en onglets pour organiser toutes tes informations. Parcourons-la ensemble onglet par onglet.',tab:null,sel:null},
  {icon:'🧑',title:'Onglet Perso — l\'identité',text:'Nom, race, classe, niveau, portrait... C\'est ici que tu définis ton identité. Tes statistiques (FOR, DEX, CON...), tes PV, ta CA et ton initiative sont également sur cet onglet — c\'est ton tableau de bord principal.',tab:'perso',sel:'#tabBar .tab:nth-child(1)'},
  {icon:'🎯',title:'Onglet Compétences',text:'Toutes tes compétences avec leurs modificateurs calculés. Coche les cases de maîtrise et expertise — les bonus s\'appliquent automatiquement.',tab:'competences',sel:'#tabBar .tab:nth-child(2)'},
  {icon:'⚔️',title:'Onglet Combat',text:'Tes armes équipées avec leurs bonus d\'attaque et dégâts calculés automatiquement — un bouton lance le jet en un clic. Tes jets de sauvegarde par caractéristique sont aussi là.',tab:'combat',sel:'#tabBar .tab:nth-child(3)'},
  {icon:'⚡',title:'Combat — Capacités de classe',text:'Tes ressources de classe (Discipline Ki, Rage, Inspiration bardique…) apparaissent ici avec leur nombre de charges restantes. Clique sur les bulles pour les dépenser, et récupère-les après un repos.',tab:'combat',sel:'#tabContent'},
  {icon:'✨',title:'Onglet Sorts',text:'Ta liste de sorts et tes emplacements par niveau. Coche un sort pour le préparer ou le retirer. Utilise les bulles de slot pour suivre les emplacements dépensés au fil de la session.',tab:'sorts',sel:'#tabBar .tab:nth-child(4)'},
  {icon:'🛡️',title:'Onglet Équipement',text:'Tes armes et armures actives, avec un portrait d\'équipement séparé. Change d\'équipement en sélectionnant un item. La CA s\'adapte à l\'armure portée.',tab:'equipement',sel:'#tabBar .tab:nth-child(5)'},
  {icon:'🎒',title:'Onglet Sac',text:'Ton inventaire complet avec ta Bourse (conversion automatique des pièces). Ajoute des objets manuellement ou via le compendium. Les potions ont un bouton 🧪 Utiliser et les parchemins un bouton 📜 Lancer. Pour les objets qui nécessitent un lien magique, un bouton 🔗 Se lier apparaît — tu peux en avoir jusqu\'à 3 liés simultanément.',tab:'sac',sel:'#tabBar .tab:nth-child(6)'},
  {icon:'📖',title:'Onglet Historique',text:'Traits de personnalité, idéaux, liens, défauts, apparence, backstory — tout ce qui fait la profondeur de ton personnage. Tu peux même y ajouter des secrets uniquement visibles par le MJ.',tab:'historique',sel:'#tabBar .tab:nth-child(7)'},
  {icon:'📝',title:'Onglet Journal',text:'Un journal pour noter tes observations, tes secrets, les infos que tu veux retenir. Choisis si tu veux partager certaines entrées en les ajoutant à la chronique du groupe.',tab:'journal',sel:'#tabBar .tab:nth-child(8)'},
  {icon:'⭐',title:'Onglet XP',text:'Ton expérience et ton niveau. Le MJ peut t\'attribuer de l\'XP directement. Quand tu passes un niveau, un onglet ⬆ Niveau + apparaît pour choisir tes améliorations.',tab:'xp',sel:'#tabBar .tab:nth-child(9)'},
  {icon:'🎲',title:'Le bouton dé',text:'Le bouton 🎲 en bas à droite est ton lanceur de dés rapide. Un appui court ouvre le panneau complet — d4, d6, d8, d10, d12, d20, d100. Un appui long affiche des raccourcis vers le Journal et ton onglet Perso.',tab:null,sel:'#diceFloat'},
  {icon:'🔒',title:'Confidentialité',text:'Le cadenas 🔒 en bout de barre d\'onglets te permet de choisir les onglets que les autres joueurs peuvent voir. Chaque onglet peut être rendu public ou privé.',tab:'perso',sel:'#tabBar .tab[onclick*="openPrivacySettings"]'},
];

// Tuto 3 — Maître du Jeu
const _TUTO_MJ=[
  {icon:'🎲',title:'Interface Maître du Jeu',text:'Bienvenue dans ton espace MJ. Depuis ici, tu coordonnes ta campagne en temps réel — joueurs, combat, PNJ, règles. Parcourons chaque onglet ensemble.',mjTab:'joueurs',sel:'#mjTabContent'},
  {icon:'👤',title:'Onglet Joueurs',text:'Vois les PV, CA, initiative et conditions de chaque joueur en temps réel. Modifie leurs stats directement — les changements sont instantanément visibles sur leur fiche. Tu peux aussi leur attribuer de l\'XP. Les boutons ☕ Repos court et 🌙 Repos long en bas de l\'onglet appliquent la récupération à tout le groupe en un seul clic.',mjTab:'joueurs',sel:'#mjTabContent'},
  {icon:'⚔️',title:'Onglet Combat',text:'Lance l\'initiative, ajoute joueurs et monstres (ou tes PNJ sauvegardés). Quand tu modifies les PV d\'un joueur dans le tracker, sa fiche se met à jour instantanément. L\'initiative est cliquable pour être modifiée ou relancée. Quand tu passes au tour d\'un joueur, il reçoit automatiquement une notification ⚡ "C\'est ton tour !".',mjTab:'combat',sel:'#mjTabContent'},
  {icon:'🐉',title:'Onglet PNJ / Monstres',text:'Crée des PNJ ou importe depuis le compendium SRD (6 500+ monstres, stats préremplies). Le bouton 🤝 Comparse génère un PNJ allié avec HP, capacités et progression niveau par niveau (Compagnon d\'armes, Expert ou Incantateur). Ajoute n\'importe quel PNJ directement au tracker de combat.',mjTab:'pnj',sel:'#mjTabContent'},
  {icon:'💰',title:'Onglet Objets',text:'Crée tes récompenses ou cherche dans le compendium SRD (5 000+ objets). Filtre par rareté — chaque objet affiche son badge coloré, son niveau recommandé et son prix estimé. Coche ☑ Nécessite un lien lors de la création pour que le bouton 🔗 Se lier apparaisse automatiquement dans le sac du joueur à qui tu donnes l\'objet.',mjTab:'objets',sel:'#mjTabContent'},
  {icon:'📖',title:'Onglet Règles',text:'Référence complète en jeu : actions, conditions, repos, sorts, armures, multiclassage, voyages, dangers, ⚔ construction de rencontre, ☣ maladies & poisons & folie, ✨ objets magiques, 🪤 pièges, 🤝 comparses, 🌙 temps morts (XGtE). Les sections sont réorganisables par glisser-déposer. Plus besoin d\'ouvrir le livre en pleine partie.',mjTab:'regles',sel:'#mjTabContent'},
  {icon:'🧰',title:'Compendiums & Profil',text:'Dans 👤 Profil → Mes compendiums, crée des recueils de sorts, objets ou capacités maison. Tu peux en créer plusieurs, les nommer et les partager. L\'icône 📋 sur une carte campagne ouvre la fiche d\'un joueur en lecture seule — même les onglets privés.',mjTab:'joueurs',sel:'#mjTabContent'},
  {icon:'🔄',title:'Synchronisation en temps réel',text:'Tout ce que tu fais est visible instantanément par tes joueurs — PV, conditions, tours de combat. Et inversement, tu vois leurs modifications en temps réel. Fini les "attends je note ça" en cours de partie.',mjTab:'joueurs',sel:'#mjTabContent'},
];

let _tutoIdx=0;
let _tutoType='player';
let _tutoHighlightEl=null;

function _tutoApplyHighlight(sel){
  _tutoRemoveHighlight();
  if(!sel)return;
  const el=document.querySelector(sel);
  if(!el)return;
  _tutoHighlightEl=el;
  el.classList.add('tuto-highlight');
  el.scrollIntoView({behavior:'smooth',block:'nearest'});
}
function _tutoRemoveHighlight(){
  if(_tutoHighlightEl){_tutoHighlightEl.classList.remove('tuto-highlight');_tutoHighlightEl=null;}
}

function startTutorial(type){
  _tutoType=type||'player';
  _tutoIdx=0;
  _renderTutoStep();
}
function _renderTutoStep(){
  const steps=_tutoType==='mj'?_TUTO_MJ:(_tutoType==='fiche'?_TUTO_FICHE:_TUTO_PLAYER);
  const s=steps[_tutoIdx];
  const total=steps.length;
  const isLast=_tutoIdx===total-1;
  if(s.tab&&typeof setTab==='function'){
    try{if(document.getElementById('tabBar'))setTab(s.tab);}catch(e){}
  }
  if(s.mjTab&&typeof setMJTab==='function'){
    try{setMJTab(s.mjTab);}catch(e){}
  }
  const dots=Array.from({length:total},(_,i)=>`<div style="width:7px;height:7px;border-radius:50%;background:${i===_tutoIdx?'var(--cp)':'var(--surface2)'};border:1px solid ${i===_tutoIdx?'var(--cp)':'var(--border)'};transition:background .2s;flex-shrink:0"></div>`).join('');
  document.getElementById('_tutoBubble')?.remove();
  const bubble=document.createElement('div');
  bubble.id='_tutoBubble';
  bubble.innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
      <div style="display:flex;gap:4px;flex-wrap:wrap">${dots}</div>
      <button style="background:none;border:none;color:var(--text3);font-size:18px;cursor:pointer;line-height:1;padding:0 0 0 8px" onclick="_tutoFinish()" title="Fermer">✕</button>
    </div>
    <div style="font-size:30px;margin-bottom:6px;line-height:1">${s.icon}</div>
    <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:6px">${s.title}</div>
    <p style="font-size:12px;color:var(--text2);line-height:1.6;margin-bottom:14px">${s.text}</p>
    <div style="display:flex;gap:8px">
      ${_tutoIdx>0?`<button class="btn bsm" style="flex:1" onclick="_tutoIdx--;_renderTutoStep()">← Préc.</button>`:''}
      <button class="btn bac bsm" style="flex:2" onclick="${isLast?'_tutoFinish()':'_tutoIdx++;_renderTutoStep()'}">
        ${isLast?'✓ Terminer':'Suivant →'}
      </button>
    </div>`;
  document.body.appendChild(bubble);
  setTimeout(()=>{
    _tutoApplyHighlight(s.sel);
    _tutoPositionBubble(bubble,s.sel);
  },150);
}
function _tutoPositionBubble(bubble,sel){
  const W=window.innerWidth,H=window.innerHeight;
  const bw=bubble.offsetWidth||320,bh=bubble.offsetHeight||220;
  const margin=12;
  if(!sel){bubble.style.left=Math.max(margin,(W-bw)/2)+'px';bubble.style.bottom=(margin+60)+'px';return;}
  const el=document.querySelector(sel);
  if(!el){bubble.style.left=Math.max(margin,(W-bw)/2)+'px';bubble.style.bottom=(margin+60)+'px';return;}
  const r=el.getBoundingClientRect();
  let top=r.bottom+margin;
  let left=r.left+r.width/2-bw/2;
  left=Math.max(margin,Math.min(left,W-bw-margin));
  if(top+bh>H-margin)top=r.top-bh-margin;
  if(top<margin)top=margin;
  bubble.style.top=top+'px';
  bubble.style.left=left+'px';
}
function _tutoFinish(){
  _tutoRemoveHighlight();
  document.getElementById('_tutoBubble')?.remove();
  const key=_tutoType==='mj'?'tuto_mj_done':(_tutoType==='fiche'?'tuto_fiche_done':'tuto_player_done');
  localStorage.setItem(key,'1');
}

function _buildChargeChips(p){
  if(!SRD||!SRD.classes)return'';
  const tracked=p.combatCharges||{};
  const chips=[];
  for(const cls of(p.classes||[])){
    const clsDef=SRD.classes.find(c=>c.name===cls.name);
    if(!clsDef)continue;
    for(const f of(clsDef.combatFeatures||[])){
      if(f.recovery==='passive'||f.charges===0)continue;
      let max=f.charges||1;
      if(f.chargesFormula==='CHA'){const cha=(p.abilities||[])[5]||10;max=Math.max(1,Math.floor((cha-10)/2));}
      else if(f.chargesFormula==='level'){max=(p.classes||[]).reduce((s,c)=>s+(c.level||1),0);}
      const rem=tracked[f.name]!==undefined?tracked[f.name]:max;
      const depleted=rem<=0;
      chips.push(`<span style="font-size:9px;padding:1px 5px;border-radius:8px;border:1px solid ${depleted?'rgba(229,57,53,.4)':'rgba(200,168,75,.35)'};color:${depleted?'#e53935':'var(--cp)'};background:${depleted?'rgba(229,57,53,.06)':'rgba(200,168,75,.06)'};white-space:nowrap">${f.icon||'⚡'} ${rem}/${max}</span>`);
    }
  }
  return chips.length?`<div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:3px">${chips.join('')}</div>`:'';
}
function _updatePartyHUD(){
  const hud=document.getElementById('partyHud');
  const panel=document.getElementById('partyHudPanel');
  const btn=document.getElementById('partyHudBtn');
  const badge=document.getElementById('partyHudBadge');
  if(!hud||!panel||!btn)return;
  if(_groupData.length===0&&!_groupOnlyMode){hud.style.display='none';return;}
  hud.style.display='block';

  const dangerCount=_groupData.filter(pp=>{const p=pp.charData||{};const pct=p.hpMax?p.hp/p.hpMax:1;return pct<=.25;}).length;
  if(badge){
    badge.style.display=dangerCount?'flex':'none';
    badge.textContent=dangerCount||'';
    badge.style.background=dangerCount?'#e53935':'transparent';
  }

  const combatActive=!!(_activeCombatState?.active);
  const activeTurnUid=combatActive?_activeCombatState.currentTurnUid:null;
  const isMyTurn=combatActive&&activeTurnUid===currentUser?.uid;
  const STATS_SH=['FOR','DEX','CON','INT','SAG','CHA'];

  // Badge ⚡ + animation violet sur le bouton HUD quand c'est mon tour
  const turnBadge=document.getElementById('partyHudTurnBadge');
  if(turnBadge)turnBadge.style.display=isMyTurn?'flex':'none';
  if(btn){
    if(isMyTurn)btn.classList.add('my-turn');
    else btn.classList.remove('my-turn');
  }

  // Bandeau "C'est ton tour" en haut du panel
  const myTurnBannerHtml=isMyTurn?`<div style="background:linear-gradient(135deg,#6d28d9,#4338ca);border-radius:8px;padding:8px 10px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;gap:6px;animation:combatPulse 2s ease-in-out infinite">
    <span style="font-size:13px;font-weight:700;color:white">⚡ C'est ton tour !</span>
    <button onclick="playerEndTurn()" style="background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.4);border-radius:6px;color:white;font-size:11px;font-weight:600;padding:4px 8px;cursor:pointer;white-space:nowrap">⏩ Fin du tour</button>
  </div>`:'';

  const headerHtml=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,.08)">
    <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em">👥 Groupe</span>
    <button style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:14px;padding:0 4px;line-height:1" onclick="_togglePartyHud()" title="Replier">▼</button>
  </div>`;

  const membersHtml=_groupData.length===0
    ?'<div style="padding:8px 0;text-align:center;font-size:12px;color:var(--text3)">En attente des joueurs...</div>'
    :_groupData.map(pp=>{
      const p=pp.charData||{};
      const hp=p.hp||0;const hpMax=p.hpMax||1;
      const hpPct=Math.max(0,Math.min(100,hpMax?hp/hpMax*100:0));
      const hpColor=hpPct>50?'#4caf50':hpPct>25?'#ff9800':'#e53935';
      const isOwn=pp.uid===currentUser?.uid;
      const isActiveTurn=activeTurnUid&&pp.uid===activeTurnUid;
      const portrait=p.portrait||p.equipPortrait;
      const charName=p.charName||pp.playerName||'?';
      const cls=(p.classes||[]).map(c=>c.name+' '+c.level).join(' / ');
      const race=p.race||'';
      const bg=p.background||'';
      const subLine=[cls,race?race+(bg?' · '+bg:''):bg].filter(Boolean).join(' · ');
      const conds=p.conditions||[];
      const down=hp<=0;
      const dead=down&&(p.deathSaves?.fail>=3);
      const dimmed=combatActive&&!isActiveTurn&&!isOwn;
      const isSelected=_currentHudDetailUid===pp.uid;
      return`<div class="party-member" data-uid="${pp.uid}" style="${dimmed?'opacity:.4;':''}cursor:pointer;${isSelected?'background:rgba(200,168,75,.07);border-radius:6px;':''}">
        <div class="pm-portrait${isOwn?' self':''}${isActiveTurn?' active-turn-portrait':''}" style="width:34px;height:34px;align-self:flex-start;margin-top:2px;flex-shrink:0">
          ${portrait?`<img src="${portrait}" style="width:100%;height:100%;object-fit:cover">`:`<span style="font-size:16px">${pp.avatar||'⚔'}</span>`}
        </div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:4px">
            <span class="pm-name${isOwn?' self':''}">${esc(charName)}</span>
            <span style="font-size:9px;color:${isOwn?'var(--cp)':'var(--text3)'};opacity:.8;flex-shrink:0">${isOwn?'Moi':esc(pp.playerName||'')}</span>
          </div>
          <div style="display:flex;align-items:center;gap:4px;margin-top:2px">
            <div class="pm-hp-bar" style="flex:1"><div class="pm-hp-fill" style="width:${hpPct}%;background:${hpColor}"></div></div>
            <span style="font-size:9px;color:${down?'#e53935':hpColor};flex-shrink:0;font-weight:700">${dead?'💀':down?'⚠ À terre':hp+'/'+hpMax}</span>
          </div>
          ${conds.length?`<div class="pm-sub" style="margin-top:1px">${conds.slice(0,3).join(' ')}${conds.length>3?` <span style="opacity:.55">+${conds.length-3}</span>`:''}</div>`:''}
          ${_buildChargeChips(p)}
        </div>
      </div>`;
    }).join('');

  panel.innerHTML=myTurnBannerHtml+headerHtml+membersHtml;

  // Rafraîchit le panneau détail si un joueur est sélectionné
  if(_currentHudDetailUid)_showHudDetail(_currentHudDetailUid);

  panel.onclick=e=>{
    if(e.target.closest('summary'))return;
    const card=e.target.closest('.party-member');
    if(card&&card.dataset.uid){
      const uid=card.dataset.uid;
      if(_currentHudDetailUid===uid){_hideHudDetail();_updatePartyHUD();}
      else{_showHudDetail(uid);_updatePartyHUD();}
    }
  };

  if(!_groupHudOpen)panel.style.display='none';
}
function _hideHudDetail(){
  _currentHudDetailUid=null;
  document.getElementById('hudDetailPopup')?.remove();
  document.getElementById('hudDetailOverlay')?.remove();
}
function _showHudDetail(uid){
  const pp=_groupData.find(x=>x.uid===uid);
  if(!pp){_hideHudDetail();return;}
  _currentHudDetailUid=uid;
  const p=pp.charData||{};
  const isOwn=uid===currentUser?.uid;
  const portrait=p.portrait||p.equipPortrait;
  const cls=(p.classes||[]).map(c=>c.name+' '+c.level).join(' / ');
  const race=p.race||'';const bg=p.background||'';
  const subLine=[cls,race+(bg?' · '+bg:'')].filter(Boolean).join(' · ');
  const combatActive=!!(_activeCombatState?.active);
  const isActiveTurn=combatActive&&_activeCombatState.currentTurnUid===uid;
  const hp=p.hp||0;const hpMax=p.hpMax||1;
  const hpPct=Math.max(0,Math.min(100,hpMax?hp/hpMax*100:0));
  const hpColor=hpPct>50?'#4caf50':hpPct>25?'#ff9800':'#e53935';
  const dead=hp<=0;
  const conds=p.conditions||[];
  const STATS_SH=['FOR','DEX','CON','INT','SAG','CHA'];
  const statsHtml=p.abilities?STATS_SH.map((s,i)=>{const v=p.abilities[i]||10;const m=Math.floor((v-10)/2);return`<div style="text-align:center;background:var(--surface2);border:1px solid var(--border);border-radius:4px;padding:3px"><div style="font-size:8px;color:var(--text3)">${s}</div><div style="font-size:12px;font-weight:700;color:var(--text)">${v}</div><div style="font-size:8px;color:var(--cp)">${m>=0?'+':''}${m}</div></div>`;}).join(''):'';
  const chargesHtml=_buildChargeChips(p);

  // Mode : overlay (hub/mj/group-only) ou flottant (fiche perso ouverte)
  const onCharSheet=document.getElementById('app').style.display!=='none';

  const innerHtml=`
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,.08)">
      ${portrait?`<img src="${portrait}" style="width:42px;height:42px;border-radius:50%;object-fit:cover;border:2px solid var(--cp);flex-shrink:0">`:`<div style="width:42px;height:42px;border-radius:50%;background:var(--surface2);border:2px solid var(--cp);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">${pp.avatar||'⚔'}</div>`}
      <div style="flex:1;min-width:0">
        <div style="font-size:14px;font-weight:700;color:${isOwn?'var(--cp)':'var(--text)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(p.charName||pp.playerName||'?')}</div>
        <div style="font-size:10px;color:var(--text3)">${isOwn?'Moi':esc(pp.playerName||'')}</div>
      </div>
      <button onclick="_hideHudDetail();_updatePartyHUD()" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:14px;padding:0 4px;flex-shrink:0">✕</button>
    </div>
    ${subLine?`<div style="font-size:11px;color:var(--text3);margin-bottom:6px">${esc(subLine)}</div>`:''}
    ${!isOwn?`<div style="font-size:11px;color:var(--text3);margin-bottom:6px">Joueur : ${esc(pp.playerName||'')}</div>`:''}
    <div class="pm-combat-badge ${combatActive?'pm-combat-active':'pm-combat-inactive'}" style="margin-bottom:10px">
      ${combatActive?(isActiveTurn?'⚔ Son tour':'⚔ En combat'):'🏳 Hors combat'}
    </div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
      <div style="flex:1"><div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3);margin-bottom:3px"><span>PV</span><span style="font-weight:700;color:${down?'#e53935':hpColor}">${dead?'💀':down?'⚠ À terre':hp+'/'+hpMax}</span></div><div style="height:7px;background:var(--surface2);border-radius:4px;overflow:hidden"><div style="height:100%;width:${hpPct}%;background:${hpColor};border-radius:4px"></div></div></div>
      ${p.ac?`<div style="text-align:center;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:4px 10px;flex-shrink:0"><div style="font-size:8px;color:var(--text3)">CA</div><div style="font-size:16px;font-weight:700">${p.ac}</div></div>`:''}
    </div>
    ${conds.length?`<div style="font-size:11px;color:var(--text2);margin-bottom:8px">${conds.join(' ')}</div>`:''}
    ${chargesHtml?`<div style="margin-bottom:8px">${chargesHtml}</div>`:''}
    ${statsHtml?`<details style="margin-bottom:10px"><summary style="font-size:10px;color:var(--text3);cursor:pointer;list-style:none;display:flex;align-items:center;gap:3px"><span>▶</span> Caractéristiques</summary><div style="display:grid;grid-template-columns:repeat(6,1fr);gap:3px;margin-top:6px">${statsHtml}</div></details>`:''}
    <button onclick="${isOwn?`enterCampaign('${currentTableId}','${currentCampaignId}')`:`_partyMemberClick('${uid}')`}" style="width:100%;background:none;border:1px solid rgba(200,168,75,.3);border-radius:8px;color:var(--cp);cursor:pointer;font-size:12px;padding:7px 0;font-weight:600">📋 ${isOwn?'Ma fiche':'Voir la fiche'}</button>`;

  if(onCharSheet){
    // Petit panneau flottant à côté du HUD
    document.getElementById('hudDetailOverlay')?.remove();
    let el=document.getElementById('hudDetailPopup');
    if(!el){el=document.createElement('div');el.id='hudDetailPopup';document.body.appendChild(el);}
    el.style.cssText='position:fixed;z-index:851;background:rgba(10,7,3,.96);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(200,168,75,.3);border-radius:12px;padding:12px 14px;width:260px;max-height:80vh;overflow-y:auto;box-shadow:0 8px 28px rgba(0,0,0,.7)';
    el.innerHTML=innerHtml;
    const hudPanel=document.getElementById('partyHudPanel');
    if(hudPanel){const r=hudPanel.getBoundingClientRect();if(r.right+276<window.innerWidth){el.style.left=(r.right+8)+'px';el.style.bottom=(window.innerHeight-r.bottom)+'px';}else{el.style.left=Math.max(8,r.left)+'px';el.style.bottom=(window.innerHeight-r.top+8)+'px';}el.style.top='auto';}
  } else {
    // Overlay plein écran (hub, mode groupe seul, écran MJ)
    let overlay=document.getElementById('hudDetailOverlay');
    if(!overlay){
      overlay=document.createElement('div');
      overlay.id='hudDetailOverlay';
      overlay.style.cssText='position:fixed;inset:0;z-index:1050;background:rgba(0,0,0,.72);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)';
      overlay.addEventListener('click',e=>{if(e.target===overlay){_hideHudDetail();_updatePartyHUD();}});
      document.body.appendChild(overlay);
    }
    let el=document.getElementById('hudDetailPopup');
    if(!el){el=document.createElement('div');el.id='hudDetailPopup';overlay.appendChild(el);}
    el.style.cssText='position:fixed;z-index:1051;background:var(--bg);border:1px solid rgba(200,168,75,.3);border-radius:14px;padding:16px 18px;width:min(320px,calc(100vw - 32px));max-height:80vh;overflow-y:auto;box-shadow:0 12px 40px rgba(0,0,0,.8)';
    el.innerHTML=innerHtml;
    // Positionné à droite du HUD ou centré si pas assez de place
    const hudPanel=document.getElementById('partyHudPanel');
    if(hudPanel){const r=hudPanel.getBoundingClientRect();if(r.right+336<window.innerWidth){el.style.left=(r.right+12)+'px';el.style.bottom=(window.innerHeight-r.bottom)+'px';}else{el.style.left='50%';el.style.transform='translateX(-50%)';el.style.bottom='90px';}el.style.top='auto';}
  }
}
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

// ─── AUTH UI ───
function switchAuthTab(tab){
  document.getElementById('formLogin').style.display=tab==='login'?'':'none';
  document.getElementById('formRegister').style.display=tab==='register'?'':'none';
  document.getElementById('authTabLogin').className=tab==='login'?'on':'';
  document.getElementById('authTabRegister').className=tab==='register'?'on':'';
  document.getElementById('authError').style.display='none';
}
function selectAvatar(av){
  selectedAvatar=av;
  document.querySelectorAll('.avatar-opt').forEach(el=>{
    el.className='avatar-opt'+(el.textContent===av?' on':'');
  });
}
function showAuthError(msg){const el=document.getElementById('authError');el.textContent=msg;el.style.display='block';}

async function doLogin(){
  const email=document.getElementById('loginEmail').value.trim();
  const pw=document.getElementById('loginPassword').value;
  if(!email||!pw){showAuthError('Remplissez tous les champs.');return;}
  try{await fbAuth.signInWithEmailAndPassword(email,pw);}
  catch(e){const m={'auth/user-not-found':'Aucun compte avec cet email.','auth/wrong-password':'Mot de passe incorrect.','auth/invalid-email':'Email invalide.','auth/invalid-credential':'Email ou mot de passe incorrect.'};showAuthError(m[e.code]||'Erreur : '+e.message);}
}
async function doResetPassword(){
  const email=document.getElementById('loginEmail').value.trim();
  if(!email){showAuthError('Entrez votre email ci-dessus, puis cliquez sur "Mot de passe oublié ?".');return;}
  try{
    await fbAuth.sendPasswordResetEmail(email);
    document.getElementById('authError').style.display='none';
    showToast('📧 Email de réinitialisation envoyé à '+email);
  }catch(e){const m={'auth/user-not-found':'Aucun compte avec cet email.','auth/invalid-email':'Email invalide.'};showAuthError(m[e.code]||'Erreur : '+e.message);}
}
async function doRegister(){
  const name=document.getElementById('regName').value.trim();
  const email=document.getElementById('regEmail').value.trim();
  const pw=document.getElementById('regPassword').value;
  if(!name||!email||!pw){showAuthError('Remplissez tous les champs.');return;}
  if(pw.length<6){showAuthError('Mot de passe : 6 caractères minimum.');return;}
  try{
    const cred=await fbAuth.createUserWithEmailAndPassword(email,pw);
    await fbDb.collection('users').doc(cred.user.uid).set({displayName:name,avatar:selectedAvatar,email,charLib:{},createdAt:firebase.firestore.FieldValue.serverTimestamp()});
    await cred.user.updateProfile({displayName:name});
    cred.user.sendEmailVerification().catch(()=>{});
    showToast('📧 Un email de vérification a été envoyé à '+email);
  }catch(e){const m={'auth/email-already-in-use':'Email déjà utilisé.','auth/invalid-email':'Email invalide.','auth/weak-password':'Mot de passe trop faible.'};showAuthError(m[e.code]||'Erreur : '+e.message);}
}
async function doLogout(){
  stopAllListeners();
  await fbAuth.signOut();
  state={players:[],activeIdx:0,activeTab:'perso'};
  currentTableId=null;currentCampaignId=null;
  _userInfoCache={};
  _mjCompLib={};_mjActiveCompId=null;
}

function openUserSettings(){
  if(!currentUserData)return;
  const av=currentUserData.avatar||'⚔';
  const avatars=['⚔','🧙','🏹','🛡','🎲','🗡','✨','🐉','🧝','🌙','🔮','🌟'];
  const charLib=currentUserData.charLib||{};
  const chars=Object.entries(charLib);
  const charHtml=chars.length?chars.map(([campId,c])=>{
    const isSolo=c.tableName==='__solo__';
    const subtitle=isSolo
      ?`${esc(c.charClass||'Classe inconnue')} • Bibliothèque personnelle`
      :`${esc(c.charClass||'')} • ${esc(c.campaignName||'')} (${esc(c.tableName||'')})`;
    const actionLabel=isSolo?'Éditer →':'Jouer →';
    return`<div class="charlib-item" onclick="enterCampaignFromLib('${campId}','${esc(c.tableName||'')}','${esc(c.campaignName||'')}')">
      <span style="font-size:20px">${currentUserData.avatar||'⚔'}</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:600;color:var(--text)">${esc(c.charName||'?')}</div>
        <div style="font-size:11px;color:var(--text3)">${subtitle}</div>
      </div>
      <span style="color:var(--cp);font-size:11px;flex-shrink:0">${actionLabel}</span>
      <button class="btn bsm" style="flex-shrink:0;margin-left:4px" onclick="event.stopPropagation();exportCharacter('${campId}')" title="Exporter en JSON">⬇</button>
      <button class="btn bsm" style="color:#e53935;border-color:rgba(229,57,53,.3);margin-left:4px;flex-shrink:0" onclick="event.stopPropagation();deleteCharFromLib('${campId}')" title="Supprimer ce personnage">🗑</button>
    </div>`;}).join('')
    :`<div style="font-size:12px;color:var(--text3);font-style:italic;padding:6px 0">Aucun personnage sauvegardé.</div>`;
  // Section compendiums
  const compIds=Object.keys(_mjCompLib);
  const compHtml=compIds.length?compIds.map(id=>{
    const c=_mjCompLib[id];
    return`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:6px;display:flex;align-items:center;gap:8px">
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:600;color:var(--text)">${esc(c.name)}</div>
        <div style="font-size:11px;color:var(--text3)">${(c.feats||[]).length} capacité(s) · ${(c.spells||[]).length} sort(s) · ${(c.items||[]).length} objet(s)</div>
      </div>
      <button class="btn bsm" onclick="closeModal();mjOpenCompendiumEditor('${id}')" title="Éditer">✏️</button>
      <button class="btn bsm" onclick="exportMJCompendium('${id}')" title="Exporter">📤</button>
      <button class="btn bsm" style="color:#e53935;border-color:rgba(229,57,53,.3)" onclick="mjDeleteComp('${id}')" title="Supprimer">🗑</button>
    </div>`;}).join('')
    :`<div style="font-size:12px;color:var(--text3);font-style:italic;padding:6px 0">Aucun compendium personnalisé.</div>`;
  openModal(`<div class="pt" style="margin-bottom:12px">⚙ Paramètres du profil</div>
    <details class="acc" open>
      <summary>🧑 Profil</summary>
      <div class="acc-body">
        <div class="fl mb6">Icône</div>
        <div class="avatar-pick" id="settingsAvatarPick">
          ${avatars.map(a=>`<span class="avatar-opt${a===av?' on':''}" onclick="selectSettingsAvatar('${a}')">${a}</span>`).join('')}
        </div>
        <div class="fl mb6">Pseudo</div>
        <input class="fi" id="settingsName" value="${esc(currentUserData.displayName)}" style="margin-bottom:12px">
        <button class="btn bac" style="width:100%" onclick="saveUserSettings()">💾 Sauvegarder</button>
      </div>
    </details>
    <details class="acc" open>
      <summary>📚 Mes personnages</summary>
      <div class="acc-body">
        <div style="display:flex;gap:6px;margin-bottom:10px">
          <button class="btn bsm" onclick="importStandaloneChar()">📥 Importer JSON</button>
          <button class="btn bsm bprimary" onclick="openCreateStandaloneChar()">+ Créer</button>
        </div>
        <div>${charHtml}</div>
      </div>
    </details>
    <details class="acc">
      <summary>🧰 Mes compendiums</summary>
      <div class="acc-body">
        <div style="display:flex;gap:6px;margin-bottom:10px">
          <button class="btn bsm bprimary" onclick="closeModal();mjCreateNewComp()">+ Nouveau</button>
          <button class="btn bsm" onclick="closeModal();importMJCompendium()">📥 Importer</button>
        </div>
        <div>${compHtml}</div>
      </div>
    </details>
    <details class="acc">
      <summary>❓ Aide & Guide</summary>
      <div class="acc-body">
        <p style="font-size:12px;color:var(--text3);margin-bottom:10px">Revoir les guides de démarrage pas à pas.</p>
        <div style="display:flex;flex-direction:column;gap:6px">
          <button class="btn bsm" onclick="closeModal();startTutorial('player')">📖 Guide Joueur</button>
          <button class="btn bsm" onclick="closeModal();startTutorial('fiche')">🧑 Guide Fiche de personnage</button>
          <button class="btn bsm" onclick="closeModal();startTutorial('mj')">🎲 Guide Maître du Jeu</button>
        </div>
      </div>
    </details>
    <details class="acc">
      <summary>🔐 Compte</summary>
      <div class="acc-body">
        <div style="font-size:12px;color:var(--text3);margin-bottom:10px">Email : <strong style="color:var(--text2)">${esc(currentUser.email)}</strong></div>
        <div style="display:flex;flex-direction:column;gap:6px">
          <button class="btn bsm" onclick="openChangeEmail()">✉️ Changer l'email</button>
          <button class="btn bsm" onclick="openChangePassword()">🔑 Changer le mot de passe</button>
          <button class="btn bsm" style="color:#e53935;border-color:rgba(229,57,53,.3);margin-top:4px" onclick="openDeleteAccount()">🗑 Supprimer le compte</button>
        </div>
      </div>
    </details>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;gap:8px">
      <button class="btn bsm" style="color:#e53935;border-color:rgba(229,57,53,.3)" onclick="closeModal();doLogout()">🚪 Déconnexion</button>
      <button class="btn bsm" style="border-color:rgba(200,168,75,.4);color:var(--cp)" onclick="openFeedbackModal()">💬 Avis / Bug</button>
      <button class="btn" onclick="closeModal()">Fermer</button>
    </div>`);
  window._settingsAvatar=av;
}
function selectSettingsAvatar(av){
  window._settingsAvatar=av;
  document.querySelectorAll('#settingsAvatarPick .avatar-opt').forEach(el=>{
    el.className='avatar-opt'+(el.textContent===av?' on':'');
  });
}

function openChangeEmail(){
  openModal(`<div class="pt">✉️ Changer l'email</div>
    <div style="font-size:12px;color:var(--text3);margin-bottom:12px">Email actuel : <strong style="color:var(--text2)">${esc(currentUser.email)}</strong></div>
    <div class="fl mb6">Nouvel email</div>
    <input class="fi" id="newEmail" type="email" placeholder="nouveau@email.com" style="margin-bottom:10px">
    <div class="fl mb6">Mot de passe actuel (confirmation)</div>
    <input class="fi" id="reAuthPwdEmail" type="password" placeholder="••••••••" style="margin-bottom:16px">
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="openUserSettings()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="doChangeEmail()">✓ Confirmer</button>
    </div>`);
}
async function doChangeEmail(){
  const newEmail=document.getElementById('newEmail')?.value.trim();
  const pwd=document.getElementById('reAuthPwdEmail')?.value;
  if(!newEmail||!pwd){showToast('❌ Remplissez tous les champs.');return;}
  try{
    const cred=firebase.auth.EmailAuthProvider.credential(currentUser.email,pwd);
    await currentUser.reauthenticateWithCredential(cred);
    await currentUser.updateEmail(newEmail);
    await fbDb.collection('users').doc(currentUser.uid).update({email:newEmail});
    showToast('✅ Email mis à jour !');closeModal();
  }catch(e){
    const m={'auth/wrong-password':'Mot de passe incorrect.','auth/invalid-email':'Email invalide.','auth/email-already-in-use':'Email déjà utilisé.'};
    showToast('❌ '+(m[e.code]||e.message));
  }
}

function openChangePassword(){
  openModal(`<div class="pt">🔑 Changer le mot de passe</div>
    <div class="fl mb6">Mot de passe actuel</div>
    <input class="fi" id="oldPwd" type="password" placeholder="••••••••" style="margin-bottom:10px">
    <div class="fl mb6">Nouveau mot de passe (6 car. min.)</div>
    <input class="fi" id="newPwd" type="password" placeholder="••••••••" style="margin-bottom:10px">
    <div class="fl mb6">Confirmer le nouveau mot de passe</div>
    <input class="fi" id="newPwd2" type="password" placeholder="••••••••" style="margin-bottom:16px">
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="openUserSettings()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="doChangePassword()">✓ Confirmer</button>
    </div>`);
}
async function doChangePassword(){
  const oldPwd=document.getElementById('oldPwd')?.value;
  const newPwd=document.getElementById('newPwd')?.value;
  const newPwd2=document.getElementById('newPwd2')?.value;
  if(!oldPwd||!newPwd||!newPwd2){showToast('❌ Remplissez tous les champs.');return;}
  if(newPwd!==newPwd2){showToast('❌ Les mots de passe ne correspondent pas.');return;}
  if(newPwd.length<6){showToast('❌ Mot de passe trop court (6 car. min.)');return;}
  try{
    const cred=firebase.auth.EmailAuthProvider.credential(currentUser.email,oldPwd);
    await currentUser.reauthenticateWithCredential(cred);
    await currentUser.updatePassword(newPwd);
    showToast('✅ Mot de passe mis à jour !');closeModal();
  }catch(e){
    const m={'auth/wrong-password':'Mot de passe actuel incorrect.','auth/weak-password':'Nouveau mot de passe trop faible.'};
    showToast('❌ '+(m[e.code]||e.message));
  }
}

function openDeleteAccount(){
  openModal(`<div class="pt" style="color:#e53935">⚠️ Supprimer le compte</div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:14px">Cette action est <strong>irréversible</strong>. Toutes vos données seront supprimées définitivement.</p>
    <div class="fl mb6">Mot de passe (confirmation)</div>
    <input class="fi" id="deleteAccPwd" type="password" placeholder="••••••••" style="margin-bottom:10px">
    <div class="fl mb6">Tapez <strong style="color:var(--cp)">SUPPRIMER</strong> pour confirmer</div>
    <input class="fi" id="deleteAccConfirm" placeholder="SUPPRIMER" style="margin-bottom:16px">
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="openUserSettings()">Annuler</button>
      <button class="btn bdanger" style="flex:2" onclick="doDeleteAccount()">🗑 Supprimer définitivement</button>
    </div>`);
}
async function doDeleteAccount(){
  const pwd=document.getElementById('deleteAccPwd')?.value;
  const confirm=document.getElementById('deleteAccConfirm')?.value;
  if(confirm!=='SUPPRIMER'){showToast('❌ Tapez exactement SUPPRIMER pour confirmer.');return;}
  if(!pwd){showToast('❌ Mot de passe requis.');return;}
  try{
    const cred=firebase.auth.EmailAuthProvider.credential(currentUser.email,pwd);
    await currentUser.reauthenticateWithCredential(cred);
    await fbDb.collection('users').doc(currentUser.uid).delete();
    await currentUser.delete();
  }catch(e){
    const m={'auth/wrong-password':'Mot de passe incorrect.'};
    showToast('❌ '+(m[e.code]||e.message));
  }
}
function openFeedbackModal(){
  openModal(`<div class="pt" style="margin-bottom:12px">💬 Avis & retours bêta</div>
    <p style="font-size:12px;color:var(--text2);margin-bottom:14px">Un bug ? Une idée ? Un truc qui manque ? Dis-nous tout — chaque retour compte.</p>
    <div class="fl mb6">Type</div>
    <select class="fi" id="fbType" style="margin-bottom:10px">
      <option value="bug">🐛 Bug / problème</option>
      <option value="suggestion">💡 Suggestion</option>
      <option value="question">❓ Question</option>
      <option value="autre">💬 Autre</option>
    </select>
    <div class="fl mb6">Message</div>
    <textarea class="fi" id="fbMsg" placeholder="Décris le bug ou ton idée..." rows="5" style="resize:vertical;margin-bottom:12px"></textarea>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="openUserSettings()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="sendFeedback()">📤 Envoyer</button>
    </div>`);
}
async function sendFeedback(){
  const type=document.getElementById('fbType')?.value;
  const msg=document.getElementById('fbMsg')?.value.trim();
  if(!msg){showToast('❌ Le message ne peut pas être vide.');return;}
  try{
    await fbDb.collection('feedback').add({
      userId:currentUser?.uid||'anonymous',
      email:currentUser?.email||'',
      type,
      message:msg,
      ts:firebase.firestore.FieldValue.serverTimestamp()
    });
    closeModal();
    showToast('✅ Merci pour ton retour !');
  }catch(e){showToast('❌ Erreur : '+e.message);}
}

async function saveUserSettings(){
  const name=document.getElementById('settingsName').value.trim();
  if(!name){showToast('❌ Le pseudo ne peut pas être vide.');return;}
  const av=window._settingsAvatar||currentUserData.avatar||'⚔';
  try{
    await fbDb.collection('users').doc(currentUser.uid).update({displayName:name,avatar:av});
    currentUserData={...currentUserData,displayName:name,avatar:av};
    await currentUser.updateProfile({displayName:name});
    const btn=document.getElementById('hubUserBtn');
    if(btn) btn.innerHTML=`👤 ${esc(name)}`;
    closeModal();showToast('✅ Profil mis à jour !');
  }catch(e){showToast('❌ Erreur : '+e.message);}
}
async function enterCampaignFromLib(campaignId, tableName, campaignName){
  closeModal();
  if(tableName==='__solo__'){
    await enterCampaign('__solo__',campaignId,'__solo__',campaignName);
    return;
  }
  const tableSnap=await fbDb.collection('tables').where('memberIds','array-contains',currentUser.uid).get();
  let tableId=null;
  tableSnap.docs.forEach(d=>{if((d.data().memberIds||[]).includes(currentUser.uid)&&d.data().name===tableName)tableId=d.id;});
  if(!tableId){
    const snap2=await fbDb.collection('tables').where('mjId','==',currentUser.uid).get();
    snap2.docs.forEach(d=>{if(d.data().name===tableName)tableId=d.id;});
  }
  if(tableId) await enterCampaign(tableId,campaignId,tableName,campaignName);
  else showToast('❌ Table introuvable.');
}

function openCreateStandaloneChar(){
  closeModal();
  const soloId='solo_'+Date.now();
  enterCampaign('__solo__',soloId,'__solo__','Bibliothèque');
}

function importStandaloneChar(){
  const input=document.createElement('input');
  input.type='file';
  input.accept='.json,application/json';
  input.onchange=async e=>{
    const file=e.target.files[0];
    if(!file)return;
    try{
      const text=await file.text();
      const data=JSON.parse(text);
      const soloId='solo_'+Date.now();
      closeModal();
      await enterCampaign('__solo__',soloId,'__solo__','Bibliothèque',data);
    }catch(err){showToast('❌ Fichier JSON invalide.');}
  };
  input.click();
}

// ─── EXPORT / IMPORT PERSONNAGE ───
async function exportCharacter(campId){
  const charName=(currentUserData&&currentUserData.charLib&&currentUserData.charLib[campId]&&currentUserData.charLib[campId].charName)||'personnage';
  try{
    const doc=await fbDb.collection('characters').doc(currentUser.uid+'_'+campId).get();
    if(!doc.exists){showToast('❌ Personnage introuvable.');return;}
    const data=doc.data().characterData||{};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download=charName.replace(/[^a-z0-9àâäéèêëîïôöùûüç]/gi,'_')+'.json';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('✅ Personnage exporté.');
  }catch(e){showToast('❌ Erreur export : '+e.message);}
}

function openCharOrCreate(tableId,campId){
  const charLib=(currentUserData&&currentUserData.charLib)||{};
  const others=Object.entries(charLib).filter(([cid])=>cid!==campId);
  const existingSection=others.length?`
    <div style="margin-bottom:14px">
      <div class="fl mb6" style="margin-bottom:8px">Utiliser un personnage existant</div>
      ${others.map(([cid,c])=>`<div class="charlib-item" style="cursor:pointer" onclick="useExistingCharForCampaign('${cid}','${tableId}','${campId}')">
        <span style="font-size:18px">${(currentUserData&&currentUserData.avatar)||'⚔'}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600">${esc(c.charName||'?')}</div>
          <div style="font-size:11px;color:var(--text3)">${esc(c.charClass||'')} • ${esc(c.campaignName||'')}</div>
        </div>
        <span style="color:var(--cp);font-size:11px">Utiliser →</span>
      </div>`).join('')}
    </div>`:'';
  openModal(`<div class="pt">+ Rejoindre la campagne</div>
    ${existingSection}
    <div style="display:flex;flex-direction:column;gap:8px">
      <button class="btn bac" style="width:100%" onclick="closeModal();enterCampaign('${tableId}','${campId}')">✨ Créer un nouveau personnage</button>
      <button class="btn" style="width:100%" onclick="importCharForCampaign('${tableId}','${campId}')">📥 Importer depuis un fichier JSON</button>
    </div>`);
}

async function useExistingCharForCampaign(sourceCampId,tableId,campId){
  closeModal();
  try{
    const doc=await fbDb.collection('characters').doc(currentUser.uid+'_'+sourceCampId).get();
    if(!doc.exists){showToast('❌ Personnage introuvable.');return;}
    const data=JSON.parse(JSON.stringify(doc.data().characterData||{}));
    await enterCampaign(tableId,campId,null,null,data);
    await saveAll(true);
  }catch(e){showToast('❌ Erreur : '+e.message);}
}

function importCharForCampaign(tableId,campId){
  const input=document.createElement('input');
  input.type='file';
  input.accept='.json,application/json';
  input.onchange=async e=>{
    const file=e.target.files[0];
    if(!file)return;
    try{
      const text=await file.text();
      const data=JSON.parse(text);
      closeModal();
      await enterCampaign(tableId,campId,null,null,data);
    }catch(err){showToast('❌ Fichier JSON invalide.');}
  };
  input.click();
}

// ─── HUB : TABLES & CAMPAGNES ───
function genCode(){return Math.random().toString(36).slice(2,8).toUpperCase();}
let _hubCache=null;

async function toggleCampExpand(tableId,campId){
  const key=tableId+'_'+campId;
  _expandedCamp=(_expandedCamp===key)?null:key;
  // Recharge le hub HTML sans refaire les requêtes Firestore (utilise le cache)
  if(_hubCache){
    // Charger les infos de personnage si pas encore fait
    if(_expandedCamp){
      for(const t of _hubCache){
        if(t.id===tableId){
          if(!t._charInfos) t._charInfos={};
          if(!t._campParticipants) t._campParticipants={};
          if(t._charInfos[campId]===undefined){
            try{
              const ref=fbDb.collection('characters').doc(currentUser.uid+'_'+campId);
              const doc=await ref.get();
              if(doc.exists){
                const d=doc.data().characterData||{};
                t._charInfos[campId]={charName:d.charName||'?',charClass:(d.classes||[]).map(c=>c.name+' '+c.level).join('/')};
              }else{t._charInfos[campId]=null;}
            }catch(e){t._charInfos[campId]=null;}
          }
          // Charge tous les participants de la campagne
          if(!t._campParticipants[campId]){
            try{
              const charsSnap=await fbDb.collection('characters').where('campaignId','==',campId).get();
              const participants=[];
              for(const cdoc of charsSnap.docs){
                if(cdoc.id.endsWith('_mj'))continue;
                const cdata=cdoc.data();
                if(cdata.userId===t.mjId)continue;
                if(cdata.ejectedFromCampaign)continue;
                const charData=cdata.characterData||{};
                const priv=charData.privacy||{name:true,hp:true,abilities:false,notes:false};
                const uid=cdata.userId;
                let playerName='Joueur';let playerAvatar='⚔';
                try{const udoc=await fbDb.collection('users').doc(uid).get();if(udoc.exists){const u=udoc.data();playerName=u.displayName||'Joueur';playerAvatar=u.avatar||'⚔';}}catch(e){}
                participants.push({uid,playerName,playerAvatar:playerAvatar,charName:priv.name!==false?charData.charName||'?':'???',charClass:priv.name!==false?(charData.classes||[]).map(c=>c.name+' '+c.level).join('/'):'',avatar:playerAvatar,priv,fullData:charData});
              }
              t._campParticipants[campId]=participants;
            }catch(e){t._campParticipants[campId]=[];}
          }
          break;
        }
      }
    }
    document.getElementById('hubContent').innerHTML=renderHubHTML(_hubCache);
  }else{await renderHub();}
}

async function renderHub(){
  const hub=document.getElementById('hubContent');
  if(!hub)return;
  hub.innerHTML='<div class="hub-empty"><span class="auth-spinner"></span> Chargement...</div>';
  try{
    let tables=[];
    const snap=await fbDb.collection('tables').where('memberIds','array-contains',currentUser.uid).get();
    tables=snap.docs.map(d=>({id:d.id,...d.data()}));
    const tablesWithCamps=await Promise.all(tables.map(async t=>{
      const cs=await fbDb.collection('campaigns').where('tableId','==',t.id).orderBy('createdAt','desc').get();
      return{...t,campaigns:cs.docs.map(d=>({id:d.id,...d.data()}))};
    }));
    // Récupère les noms/avatars manquants pour les anciens membres
    for(const t of tablesWithCamps){
      const memberNames=t.memberNames||{};
      const missingUids=(t.memberIds||[]).filter(uid=>!memberNames[uid]);
      for(const uid of missingUids){
        try{
          const udoc=await fbDb.collection('users').doc(uid).get();
          if(udoc.exists){
            const d=udoc.data();
            if(!t.memberNames)t.memberNames={};
            if(!t.memberAvatars)t.memberAvatars={};
            t.memberNames[uid]=d.displayName||'Joueur';
            t.memberAvatars[uid]=d.avatar||'⚔';
          }
        }catch(e){}
      }
    }
    _hubCache=tablesWithCamps;
    const mjBadge=document.getElementById('hubMJBadge');
    if(mjBadge) mjBadge.style.display='none';
    hub.innerHTML=renderHubHTML(tablesWithCamps);
    const params=new URLSearchParams(window.location.search);
    const joinCode=params.get('join');
    if(joinCode) setTimeout(()=>promptJoinTable(joinCode),300);
  }catch(e){hub.innerHTML=`<div style="color:#e53935;padding:16px">Erreur: ${e.message}</div>`;}
}

function campImgOnLoad(img){
  if(img.naturalHeight>img.naturalWidth){
    img.style.cssText='float:right;width:38%;max-width:130px;border-radius:8px;object-fit:cover;margin:0 0 8px 10px;display:block';
  }else{
    img.style.cssText='width:100%;max-height:200px;border-radius:8px;object-fit:cover;margin-bottom:10px;display:block';
  }
}
function renderHubHTML(tables){
  const tableCards=tables.length?tables.map(t=>{
    const isMJ=t.mjId===currentUser.uid;
    const memberNames=t.memberNames||{};
    const memberAvatars=t.memberAvatars||{};
    const memberBadges=(t.memberIds||[]).filter(uid=>uid!==t.mjId).map(uid=>`<span class="member-badge">${memberAvatars[uid]||'⚔'} ${esc(memberNames[uid]||'Joueur')}</span>`).join('');
    const campCards=t.campaigns.length?t.campaigns.map(c=>{
      const key=t.id+'_'+c.id;
      const expanded=_expandedCamp===key;
      let expandedHtml='';
      if(expanded){
        const charInfo=t._charInfos&&t._charInfos[c.id];
        const imgHtml=c.imageUrl?`<img src="${esc(c.imageUrl)}" style="width:100%;max-height:200px;border-radius:8px;object-fit:cover;margin-bottom:10px;display:block" onload="campImgOnLoad(this)" onerror="this.style.display='none'">`:'';
        const campParticipants=t._campParticipants&&t._campParticipants[c.id]||[];
        const participantHtml=campParticipants.length?`<div style="margin-top:10px"><div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Personnages</div>
          ${campParticipants.map(pp=>{
            const isMe=pp.uid===currentUser.uid;
            const fd=pp.fullData||{};
            const pPortrait=fd.portrait||fd.equipPortrait;
            return`<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:rgba(255,255,255,.03);border-radius:6px;margin-bottom:4px">
              ${pPortrait
                ?`<img src="${pPortrait}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;border:1.5px solid ${isMe?'var(--cp)':'var(--border)'};flex-shrink:0">`
                :`<div style="width:30px;height:30px;border-radius:50%;background:var(--surface2);border:1.5px solid ${isMe?'var(--cp)':'var(--border)'};display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">${pp.avatar||'⚔'}</div>`}
              <div style="flex:1;min-width:0">
                <div style="display:flex;align-items:center;gap:4px">
                  <span style="font-size:12px;font-weight:600;color:${isMe?'var(--cp)':'var(--text)'}">${esc(pp.charName||'?')}</span>
                  <span style="font-size:9px;color:var(--text3)">${isMe?'Moi':esc(pp.playerName||'')}</span>
                </div>
                <div style="font-size:10px;color:var(--text3)">${esc(pp.charClass||'')}</div>
              </div>
              ${isMJ
                ?`<button class="btn bsm" style="color:#e53935;border-color:rgba(229,57,53,.35);flex-shrink:0;font-size:10px;padding:2px 6px" onclick="hubKickConfirm('${t.id}','${pp.uid}','${esc(pp.playerName||'ce joueur')}')">✕</button>`
                :`<button class="btn bsm" style="flex-shrink:0;font-size:12px;padding:2px 7px;border-color:rgba(200,168,75,.3)" title="${isMe?'Ouvrir ma fiche':'Voir la fiche'}" onclick="${isMe?`enterCampaign('${t.id}','${c.id}')`:`openHubPlayerSheet('${pp.uid}','${c.id}')`}">📋</button>`}
            </div>`;
          }).join('')}
        </div>`:'';
        const charBlock=isMJ
          ?`<button class="btn bac" style="width:100%;margin-top:8px;font-weight:600" onclick="enterCampaign('${t.id}','${c.id}')">🎲 Gérer la campagne</button>`
          :(charInfo
            ?`<div style="margin-top:8px">
                <div style="display:flex;align-items:center;gap:6px;padding:8px;background:rgba(200,168,75,.06);border-radius:6px 6px 0 0;border:1px solid rgba(200,168,75,.15);border-bottom:none">
                  <span style="font-size:18px">${currentUserData&&currentUserData.avatar||'⚔'}</span>
                  <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600">${esc(charInfo.charName||'?')}</div><div style="font-size:11px;color:var(--text3)">${esc(charInfo.charClass||'')}</div></div>
                  <button class="btn bsm" style="color:#e53935;border-color:rgba(229,57,53,.35);flex-shrink:0" onclick="playerLeaveCharacter('${c.id}')">✕ Quitter</button>
                </div>
                <button class="btn bac" style="width:100%;font-weight:600;border-radius:0 0 6px 6px" onclick="joinGroupOnly('${t.id}','${c.id}')">👥 Rejoindre le groupe</button>
              </div>`
            :`<button class="btn bprimary" style="width:100%;margin-top:8px" onclick="openCharOrCreate('${t.id}','${c.id}')">+ Créer mon personnage</button>`);
        const mjEditHtml=isMJ?`
          <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">
            <button class="btn bsm" onclick="openEditCampaign('${t.id}','${c.id}')">✏ Modifier</button>
          </div>`:'';
        const chronicleBtn=!isMJ?`<button class="btn bsm" style="width:100%;margin-top:6px" onclick="openCampChronicle('${t.id}','${c.id}')">📜 Voir les Chroniques</button>`:'';
        expandedHtml=`<div class="camp-expanded">${imgHtml}
          ${c.detailedDesc?`<p style="font-size:12px;color:var(--text2);line-height:1.6;margin-bottom:8px">${esc(c.detailedDesc)}</p>`:''}
          <div style="clear:both"></div>
          ${charBlock}${chronicleBtn}${participantHtml}${mjEditHtml}
        </div>`;
      }
      return`<div>
        <div class="camp-card" onclick="toggleCampExpand('${t.id}','${c.id}')">
          <div><div class="camp-card-name">${esc(c.name)}</div>
            ${c.description?`<div style="font-size:11px;color:var(--text3);margin-top:2px">${esc(c.description)}</div>`:''}
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="camp-card-status ${c.status==='finished'?'camp-status-finished':'camp-status-active'}">${c.status==='finished'?'Terminée':'Active'}</span>
            <span style="color:var(--cp);transition:transform .2s;${expanded?'transform:rotate(90deg)':''}"">›</span>
          </div>
        </div>${expandedHtml}</div>`;
    }).join(''):`<div style="font-size:12px;color:var(--text3);font-style:italic;padding:6px 0">Aucune campagne pour l'instant.</div>`;
    return`<div class="table-card">
      <div class="table-card-hdr">
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <div class="table-card-name" style="margin:0">${esc(t.name)}</div>
            ${isMJ
              ?`<span style="font-size:10px;font-family:var(--F);letter-spacing:.07em;color:var(--cp);background:rgba(200,168,75,.12);border:1px solid rgba(200,168,75,.35);border-radius:10px;padding:2px 8px;flex-shrink:0">🎲 Maître de Jeu</span>`
              :`<span style="font-size:10px;font-family:var(--F);letter-spacing:.07em;color:#7eb8f7;background:rgba(126,184,247,.1);border:1px solid rgba(126,184,247,.3);border-radius:10px;padding:2px 8px;flex-shrink:0">⚔ Joueur</span>`}
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;flex-wrap:wrap">
            <span style="font-size:11px;color:var(--text3)">MJ :</span>
            <span class="member-badge" style="border-color:rgba(200,168,75,.3);color:var(--cp)">${t.mjAvatar||'🎲'} ${esc(t.mjName||'MJ')}</span>
          </div>
          ${memberBadges?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:4px"><span style="font-size:10px;color:var(--text3);align-self:center">Joueurs :</span>${memberBadges}</div>`:''}
        </div>
        <div style="display:flex;gap:6px;align-items:flex-start">
          ${isMJ?`<button class="btn bsm" onclick="openCreateCampaign('${t.id}')">+ Campagne</button><button class="btn bsm" onclick="openTableSettings('${t.id}','${esc(t.name)}','${t.inviteCode}')">⚙</button>`:''}
        </div>
      </div>
      ${campCards}
      ${isMJ?`<div class="invite-box" style="margin-top:10px">🔗 Invitation : <button class="btn bsm" onclick="copyInviteLink('${t.inviteCode}')" style="margin-left:4px">Copier le lien</button></div>`:''}
    </div>`;
  }).join(''):
    `<div class="hub-empty">Aucune table. Créez une table ou rejoignez-en une !</div>`;
  return`
    <div class="hub-section">
      <div class="hub-section-title">
        <span>⚔ Mes Tables</span>
        <div style="display:flex;gap:6px">
          <button class="btn bsm bprimary" onclick="openCreateTable()">+ Nouvelle table</button>
          <button class="btn bsm" onclick="openJoinTable()">+ Rejoindre</button>
        </div>
      </div>
      ${tableCards}
    </div>`;
}

// ─── CRÉER UNE TABLE (MJ) ───
function openCreateTable(){
  const STD_COMP=[
    {id:'spells',label:'📖 Sorts SRD'},
    {id:'items',label:'⚔️ Objets SRD'},
    {id:'monsters',label:'👾 Monstres SRD'},
    {id:'feats',label:'🌟 Dons SRD'},
    {id:'races',label:'🧝 Races SRD'},
    {id:'backgrounds',label:'📜 Historiques SRD'},
    {id:'classes',label:'🛡 Classes SRD'},
  ];
  const compIds=Object.keys(_mjCompLib);
  const stdHtml=STD_COMP.map(s=>`<label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer;font-size:13px">
    <input type="checkbox" id="std_${s.id}" checked style="accent-color:var(--cp)"> ${s.label}
  </label>`).join('');
  const custHtml=compIds.length?compIds.map(id=>`<label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer;font-size:13px">
    <input type="checkbox" id="cust_${id}" checked style="accent-color:var(--cp)"> 🧰 ${esc(_mjCompLib[id].name)}
  </label>`).join('')
    :`<div style="font-size:12px;color:var(--text3);font-style:italic">Aucun compendium perso — créez-en un dans votre profil.</div>`;
  openModal(`<div class="pt">🎲 Nouvelle table</div>
    <div class="fl mb6">Nom de la table</div>
    <input class="fi" id="newTableName" placeholder="Ex: Table du vendredi" style="margin-bottom:14px">
    <details class="acc" style="margin-bottom:12px">
      <summary>🧰 Compendiums disponibles</summary>
      <div class="acc-body">
        <div style="font-size:11px;color:var(--text3);margin-bottom:8px">Choisissez les compendiums actifs pour cette table.</div>
        <div style="font-size:10px;color:var(--cp);text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px">Standard (SRD)</div>
        ${stdHtml}
        ${compIds.length?`<div style="font-size:10px;color:var(--cp);text-transform:uppercase;letter-spacing:.07em;margin:10px 0 4px">Personnalisés</div>${custHtml}`:''}
      </div>
    </details>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="confirmCreateTable()">✓ Créer</button>
    </div>`);
  setTimeout(()=>{const i=document.getElementById('newTableName');if(i)i.focus();},50);
}
async function confirmCreateTable(){
  const name=document.getElementById('newTableName').value.trim();
  if(!name){showToast('❌ Donnez un nom à la table.');return;}
  const STD_IDS=['spells','items','monsters','feats','races','backgrounds','classes'];
  const activeStd=STD_IDS.filter(id=>document.getElementById('std_'+id)?.checked!==false);
  const activeCustom=Object.keys(_mjCompLib).filter(id=>document.getElementById('cust_'+id)?.checked!==false);
  const inviteCode=genCode();
  try{
    await fbDb.collection('tables').add({
      name,mjId:currentUser.uid,mjName:currentUserData.displayName,mjAvatar:currentUserData.avatar||'🎲',
      inviteCode,memberIds:[currentUser.uid],
      memberNames:{[currentUser.uid]:currentUserData.displayName},
      memberAvatars:{[currentUser.uid]:currentUserData.avatar||'🎲'},
      activeStdCompendiums:activeStd,
      activeCustomCompendiums:activeCustom,
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    closeModal();showToast('✅ Table "'+name+'" créée !');renderHub();
  }catch(e){showToast('❌ Erreur : '+e.message);}
}

// ─── CRÉER UNE CAMPAGNE (MJ) ───
function openCreateCampaign(tableId){
  openModal(`<div class="pt">⚔ Nouvelle campagne</div>
    <div class="fl mb6">Nom de la campagne</div>
    <input class="fi" id="newCampName" placeholder="Ex: La Mine Perdue" style="margin-bottom:10px">
    <div class="fl mb6">Description (optionnel)</div>
    <input class="fi" id="newCampDesc" placeholder="Courte description..." style="margin-bottom:16px">
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="confirmCreateCampaign('${tableId}')">✓ Créer</button>
    </div>`);
}
async function confirmCreateCampaign(tableId){
  const name=document.getElementById('newCampName').value.trim();
  const desc=document.getElementById('newCampDesc').value.trim();
  if(!name){showToast('❌ Donnez un nom à la campagne.');return;}
  try{
    await fbDb.collection('campaigns').add({
      tableId,name,description:desc,status:'active',
      ownerId:currentUser.uid,
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    closeModal();showToast('✅ Campagne "'+name+'" créée !');renderHub();
  }catch(e){showToast('❌ Erreur : '+e.message);}
}

// ─── PARAMÈTRES TABLE (MJ) ───
function openTableSettings(tableId,tableName,inviteCode){
  openModal(`<div class="pt">⚙ Table : ${esc(tableName)}</div>
    <div class="fl mb6" style="margin-top:0">Lien d'invitation</div>
    <div class="invite-box" style="margin-bottom:16px">Code : <span class="invite-code">${inviteCode}</span><button class="btn bsm" onclick="copyInviteLink('${inviteCode}')" style="margin-left:4px">Copier lien</button></div>
    <div style="display:flex;gap:8px">
      <button class="btn bdanger" style="flex:1" onclick="confirmDeleteTable('${tableId}')">🗑 Supprimer la table</button>
      <button class="btn bac" style="flex:2" onclick="closeModal()">Fermer</button>
    </div>`);
}
async function confirmDeleteTable(tableId){
  if(!confirm('Supprimer cette table et toutes ses campagnes ? Cette action est irréversible.'))return;
  try{
    const camps=await fbDb.collection('campaigns').where('tableId','==',tableId).get();
    const batch=fbDb.batch();
    camps.docs.forEach(d=>batch.delete(d.ref));
    batch.delete(fbDb.collection('tables').doc(tableId));
    await batch.commit();
    closeModal();showToast('🗑 Table supprimée.');renderHub();
  }catch(e){showToast('❌ Erreur : '+e.message);}
}

// ─── MODIFIER UNE CAMPAGNE (MJ) ───
function openEditCampaign(tableId,campId){
  const t=_hubCache&&_hubCache.find(t=>t.id===tableId);
  const c=t&&t.campaigns.find(c=>c.id===campId);
  if(!c)return;
  openModal(`<div class="pt">✏ Modifier : ${esc(c.name)}</div>
    <div class="fl mb6">Description courte</div>
    <input class="fi" id="editCampDesc" value="${esc(c.description||'')}" style="margin-bottom:10px">
    <div class="fl mb6">Description détaillée (ambiance, histoire...)</div>
    <textarea class="fi" id="editCampDetailedDesc" rows="4" style="resize:vertical;margin-bottom:10px">${esc(c.detailedDesc||'')}</textarea>
    <div class="fl mb6">Image (URL directe vers une image)</div>
    <input class="fi" id="editCampImg" value="${esc(c.imageUrl||'')}" placeholder="https://..." style="margin-bottom:16px">
    <div class="fl mb6">Statut</div>
    <div style="display:flex;gap:8px;margin-bottom:16px">
      <button class="btn${c.status!=='finished'?' bac':''}" onclick="this.dataset.v='active';document.querySelectorAll('.camp-status-opt').forEach(b=>b.className='btn camp-status-opt');this.className='btn bac camp-status-opt'" data-v="active">Active</button>
      <button class="btn camp-status-opt${c.status==='finished'?' bac':''}" onclick="this.dataset.v='finished'" data-v="finished">Terminée</button>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="saveEditCampaign('${tableId}','${campId}')">💾 Sauvegarder</button>
    </div>
    <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border)">
      <button class="btn" style="width:100%;color:#e53935;border-color:rgba(229,57,53,.35)" onclick="openDeleteCampaign('${tableId}','${campId}')">🗑 Supprimer cette campagne</button>
    </div>`);
}
function openDeleteCampaign(tableId,campId){
  const t=_hubCache&&_hubCache.find(t=>t.id===tableId);
  const c=t&&t.campaigns.find(c=>c.id===campId);
  const campName=c?c.name:'cette campagne';
  openModal(`<div class="pt" style="color:#e53935">🗑 Supprimer la campagne ?</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:8px">Vous êtes sur le point de supprimer :</div>
    <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:12px;padding:8px 12px;background:rgba(229,57,53,.08);border:1px solid rgba(229,57,53,.3);border-radius:6px">${esc(campName)}</div>
    <div style="font-size:12px;color:var(--text3);margin-bottom:16px;line-height:1.6">Cette action supprimera définitivement la campagne ainsi que <b style="color:var(--text2)">tous les personnages</b> créés par les joueurs dans cette campagne. Elle est <b style="color:#e53935">irréversible</b>.</div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="openEditCampaign('${tableId}','${campId}')">← Retour</button>
      <button class="btn" style="flex:2;color:#e53935;border-color:rgba(229,57,53,.5)" onclick="doDeleteCampaign('${tableId}','${campId}')">🗑 Confirmer la suppression</button>
    </div>`);
}
async function doDeleteCampaign(tableId,campId){
  closeModal();
  try{
    const charsSnap=await fbDb.collection('characters').where('campaignId','==',campId).get();
    const batch=fbDb.batch();
    const libCleanups=[];
    charsSnap.docs.forEach(d=>{
      const uid=d.data().userId;
      if(uid)libCleanups.push(fbDb.collection('users').doc(uid).update({['charLib.'+campId]:firebase.firestore.FieldValue.delete()}).catch(()=>{}));
      batch.delete(d.ref);
    });
    batch.delete(fbDb.collection('campaigns').doc(campId));
    await batch.commit();
    await Promise.all(libCleanups);
    if(_hubCache){const t=_hubCache.find(t=>t.id===tableId);if(t)t.campaigns=t.campaigns.filter(c=>c.id!==campId);}
    showToast('🗑 Campagne supprimée.');
    renderHub();
  }catch(e){showToast('❌ Erreur : '+e.message);}
}

async function saveEditCampaign(tableId,campId){
  const desc=document.getElementById('editCampDesc').value.trim();
  const detailed=document.getElementById('editCampDetailedDesc').value.trim();
  const img=document.getElementById('editCampImg').value.trim();
  const statusBtns=document.querySelectorAll('.camp-status-opt');
  let status='active';
  statusBtns.forEach(b=>{if(b.classList.contains('bac'))status=b.dataset.v||'active';});
  try{
    await fbDb.collection('campaigns').doc(campId).update({description:desc,detailedDesc:detailed,imageUrl:img,status});
    // Mise à jour du cache local
    const t=_hubCache&&_hubCache.find(t=>t.id===tableId);
    if(t){const c=t.campaigns.find(c=>c.id===campId);if(c){c.description=desc;c.detailedDesc=detailed;c.imageUrl=img;c.status=status;}}
    closeModal();showToast('✅ Campagne mise à jour !');
    document.getElementById('hubContent').innerHTML=renderHubHTML(_hubCache);
  }catch(e){showToast('❌ Erreur : '+e.message);}
}

// ─── REJOINDRE UNE TABLE (JOUEUR) ───
function openJoinTable(){
  openModal(`<div class="pt">🔗 Rejoindre une table</div>
    <div style="font-size:12px;color:var(--text2);margin-bottom:12px">Entrez le code d'invitation partagé par votre MJ.</div>
    <div class="fl mb6">Code d'invitation</div>
    <input class="fi" id="joinCode" placeholder="Ex: AB12CD" style="margin-bottom:16px;text-transform:uppercase;letter-spacing:.1em;font-size:16px;text-align:center">
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="confirmJoinTable()">Rejoindre →</button>
    </div>`);
}
async function promptJoinTable(code){
  openModal(`<div class="pt">🔗 Invitation reçue</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:16px">Vous avez été invité à rejoindre une table. Code : <strong style="color:var(--cp)">${esc(code)}</strong></div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Ignorer</button>
      <button class="btn bac" style="flex:2" onclick="doJoinTable('${esc(code)}')">Rejoindre →</button>
    </div>`);
}
async function confirmJoinTable(){
  const code=(document.getElementById('joinCode').value||'').trim().toUpperCase();
  if(!code){showToast('❌ Entrez un code.');return;}
  await doJoinTable(code);
}
async function doJoinTable(code){
  try{
    const snap=await fbDb.collection('tables').where('inviteCode','==',code).limit(1).get();
    if(snap.empty){showToast('❌ Code invalide.');return;}
    const tableDoc=snap.docs[0];
    if(tableDoc.data().mjId===currentUser.uid){showToast('Vous êtes déjà le MJ de cette table.');closeModal();return;}
    const members=tableDoc.data().memberIds||[];
    if(members.includes(currentUser.uid)){showToast('Vous êtes déjà dans cette table.');closeModal();return;}
    await tableDoc.ref.update({
      memberIds:firebase.firestore.FieldValue.arrayUnion(currentUser.uid),
      ['memberNames.'+currentUser.uid]:currentUserData.displayName,
      ['memberAvatars.'+currentUser.uid]:currentUserData.avatar||'⚔'
    });
    closeModal();showToast('✅ Vous avez rejoint la table "'+tableDoc.data().name+'" !');
    // Nettoie le paramètre URL
    window.history.replaceState({},'',window.location.pathname);
    renderHub();
  }catch(e){showToast('❌ Erreur : '+e.message);}
}

// ─── QUITTER UNE CAMPAGNE (JOUEUR) ───
function hubKickConfirm(tableId,uid,playerName){
  openModal(`<div class="pt" style="color:#e53935">⚠️ Retirer ce joueur ?</div>
    <div style="font-size:13px;color:var(--text2);margin:10px 0 18px"><b>${esc(playerName)}</b> sera retiré de la table et ne pourra plus y accéder.<br><span style="font-size:11px;color:var(--text3)">Son personnage reste dans sa bibliothèque personnelle.</span></div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn" style="flex:2;color:#e53935;border-color:rgba(229,57,53,.5);font-weight:600" onclick="hubKickMember('${tableId}','${uid}')">✓ Retirer de la table</button>
    </div>`);
}
async function hubKickMember(tableId,uid){
  closeModal();
  try{
    await fbDb.collection('tables').doc(tableId).update({
      memberIds:firebase.firestore.FieldValue.arrayRemove(uid),
      ['memberNames.'+uid]:firebase.firestore.FieldValue.delete(),
      ['memberAvatars.'+uid]:firebase.firestore.FieldValue.delete()
    });
    showToast('✅ Joueur retiré de la table.');
    renderHub();
  }catch(e){showToast('❌ Erreur : '+e.message);}
}
function playerLeaveCharacter(campId){
  window._pendingLeave=campId;
  openModal(`<div class="pt" style="color:#e53935">Quitter la campagne ?</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:16px">Votre personnage sera définitivement supprimé de cette campagne. Cette action est irréversible.</div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn" style="flex:2;color:#e53935;border-color:rgba(229,57,53,.5)" onclick="confirmPlayerLeave()">✕ Confirmer</button>
    </div>`);
}
async function confirmPlayerLeave(){
  const campId=window._pendingLeave;
  if(!campId||!currentUser)return;
  closeModal();
  try{
    await fbDb.collection('characters').doc(currentUser.uid+'_'+campId).delete();
    await fbDb.collection('users').doc(currentUser.uid).update({['charLib.'+campId]:firebase.firestore.FieldValue.delete()});
    if(currentUserData&&currentUserData.charLib)delete currentUserData.charLib[campId];
    showToast('✅ Personnage supprimé de la campagne.');
    renderHub();
  }catch(e){showToast('❌ Erreur : '+e.message);}
}

// ─── SUPPRIMER DE LA BIBLIOTHÈQUE (JOUEUR) ───
function deleteCharFromLib(campId){
  const c=currentUserData&&currentUserData.charLib&&currentUserData.charLib[campId];
  const charName=c&&c.charName||'ce personnage';
  window._pendingDeleteLib=campId;
  openModal(`<div class="pt" style="color:#e53935">🗑 Supprimer "${esc(charName)}" ?</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:16px">Ce personnage sera supprimé de votre bibliothèque et de la campagne. Cette action est irréversible.</div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn" style="flex:2;color:#e53935;border-color:rgba(229,57,53,.5)" onclick="confirmDeleteCharLib()">🗑 Supprimer</button>
    </div>`);
}
async function confirmDeleteCharLib(){
  const campId=window._pendingDeleteLib;
  if(!campId||!currentUser)return;
  closeModal();
  try{
    await fbDb.collection('characters').doc(currentUser.uid+'_'+campId).delete();
    await fbDb.collection('users').doc(currentUser.uid).update({['charLib.'+campId]:firebase.firestore.FieldValue.delete()});
    if(currentUserData&&currentUserData.charLib)delete currentUserData.charLib[campId];
    showToast('✅ Personnage supprimé.');
    openUserSettings();
  }catch(e){showToast('❌ Erreur : '+e.message);}
}

// ─── COPIER LE LIEN ───
function viewCharSheet(uid,campId){
  // Cherche les données du personnage dans le cache
  let pp=null;
  if(_hubCache){for(const t of _hubCache){if(t._campParticipants){for(const [cid,parts] of Object.entries(t._campParticipants)){if(cid===campId){pp=parts.find(p=>p.uid===uid);break;}}}if(pp)break;}}
  if(!pp){showToast('❌ Personnage introuvable.');return;}
  const p=pp.fullData||{};
  const priv=pp.priv||{};
  const isMJ2=!!(currentTableId&&_hubCache&&(_hubCache.find(t=>t.id===currentTableId)||{}).mjId===currentUser.uid);
  const isOwn=uid===currentUser.uid;
  const canSee=tab=>(isMJ2||isOwn||priv[tab]!==false);
  const cls=(p.classes||[]).map(c=>c.name+' niv.'+c.level).join(' / ')||'?';
  const hidden=`<span style="color:var(--text3);font-style:italic;font-size:12px">🔒 Non partagé</span>`;
  const portrait=p.portrait||p.equipPortrait;
  openModal(`
    ${canSee('perso')&&portrait?`<div style="text-align:center;margin-bottom:10px"><img src="${portrait}" style="width:72px;height:72px;border-radius:50%;object-fit:cover;border:2px solid rgba(200,168,75,.4)"></div>`:''}
    <div class="pt" style="margin-bottom:10px">${pp.avatar||'⚔'} ${canSee('perso')?esc(pp.charName||'?'):'???'} <span style="font-weight:400;font-size:11px;color:var(--text3)">— ${esc(pp.playerName||'')}</span></div>
    <div style="max-height:70vh;overflow-y:auto;padding-right:4px">
    ${canSee('perso')?`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:10px"><div class="fl mb6">Classe & Niveau</div><div style="font-size:13px">${esc(cls)}</div></div>
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:10px"><div class="fl mb6">Race</div><div style="font-size:13px">${esc(p.race||'?')}</div></div>
    </div>`:hidden}
    ${canSee('combat')?`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:8px">
      <div class="fl mb6">Combat</div>
      <div style="display:flex;gap:16px"><div><div style="font-size:10px;color:var(--text3)">PV</div><div style="font-size:15px;font-weight:600;color:#4caf50">${p.hp||0}/${p.hpMax||0}</div></div><div><div style="font-size:10px;color:var(--text3)">CA</div><div style="font-size:15px;font-weight:600">${p.ac||10}</div></div></div>
    </div>`:''}
    ${canSee('competences')?`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:8px">
      <div class="fl mb6">Caractéristiques</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">${(p.abilities||[]).map((v,i)=>`<div style="text-align:center"><div style="font-size:9px;color:var(--text3)">${['FOR','DEX','CON','INT','SAG','CHA'][i]}</div><div style="font-size:16px;font-weight:600">${v}</div></div>`).join('')}</div>
    </div>`:''}
    ${canSee('historique')&&p.backstory?`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:8px"><div class="fl mb6">Backstory</div><div style="font-size:12px;color:var(--text2);white-space:pre-wrap">${esc(p.backstory)}</div></div>`:''}
    ${(isMJ2||isOwn)&&p.secrets?`<div style="background:rgba(200,168,75,.06);border:1px solid rgba(200,168,75,.3);border-radius:8px;padding:10px;margin-bottom:8px"><div class="fl mb6" style="color:var(--cp)">🔐 Secrets</div><div style="font-size:12px;color:var(--text2);white-space:pre-wrap">${esc(p.secrets)}</div></div>`:''}
    </div>
    <div style="display:flex;justify-content:flex-end;margin-top:8px">
      <button class="btn" onclick="closeModal()">Fermer</button>
    </div>`);
}

function copyInviteLink(code){
  const url=`${window.location.origin}${window.location.pathname}?join=${code}`;
  navigator.clipboard.writeText(url).then(()=>showToast('🔗 Lien copié dans le presse-papiers !'));
}

// ─── ENTRER DANS UNE CAMPAGNE ───
async function enterCampaign(tableId,campaignId,tName,cName,preloadedCharData){
  currentTableId=tableId;
  currentCampaignId=campaignId;
  if(!tName&&_hubCache){const t=_hubCache.find(t=>t.id===tableId);if(t){tName=t.name;const c=t.campaigns.find(c=>c.id===campaignId);if(c)cName=c.name;}}
  currentTableName=tName||'';
  currentCampaignName=cName||'';
  const tableData=_hubCache&&_hubCache.find(t=>t.id===tableId);
  const asMJ=!!(tableData&&tableData.mjId===currentUser.uid);
  try{
    if(asMJ){
      // MJ : pas de personnage jouable, on charge le journal + données MJ
      _mjJournal=[];_journalSubTab='mj';_compilationData=null;
      _mjPlayersData=[];_mjCombatants=[];_mjNPCs=[];_mjObjets=[];
      _mjCombatStarted=false;_mjCurrentTurn=0;_mjRound=1;_mjCombatLog=[];_mjSelectedNPC=null;
      try{
        const mjRef=fbDb.collection('characters').doc(currentUser.uid+'_'+campaignId+'_mj');
        const mjDoc=await mjRef.get();
        if(mjDoc.exists){
          const d=mjDoc.data();
          _mjJournal=d.entries||[];
          _mjNPCs=d.npcs||[];
          _mjObjets=d.objets||[];
        }
      }catch(e){}
      showMJScreen();
      // Arrête les éventuels listeners précédents avant d'en ouvrir de nouveaux
      stopAllListeners();
      // Lance le listener temps réel pour les joueurs (remplace loadMJPlayersData)
      startMJPlayersListener(campaignId);
      if(currentTableId)startWhisperListener(currentTableId,currentUser.uid);
      // Charge la bibliothèque de compendiums puis filtre selon les compendiums actifs de la table
      if(!Object.keys(_mjCompLib).length)await loadMJCompLib();
      const activeCustomIds=tableData?.activeCustomCompendiums||Object.keys(_mjCompLib);
      _mjActiveCompId=activeCustomIds.find(id=>_mjCompLib[id])||Object.keys(_mjCompLib)[0]||null;
      _mjCustomFeats=_mjActiveCompId?(_mjCompLib[_mjActiveCompId].feats||[]):[];
      _refreshMjPool();
      renderMJContent();
      // Chargement silencieux des petits compendiums en arrière-plan
      loadFeatsDB();loadRacesDB();loadBackgroundsDB();loadClassesDB();
    }else{
      // Joueur : charge ou crée le personnage (lecture initiale one-shot)
      const charRef=fbDb.collection('characters').doc(currentUser.uid+'_'+campaignId);
      const charDoc=await charRef.get();
      if(charDoc.exists){
        const d=charDoc.data();
        state.players=[migratePlayer(d.characterData)];
      }else{
        state.players=[migratePlayer(preloadedCharData||defPlayer(currentUserData?currentUserData.displayName:'Personnage'))];
      }
      state.activeIdx=0;
      state.activeTab=localStorage.getItem('lastTab_'+campaignId)||'perso';
      _mjJournal=[];_journalSubTab='mj';_compilationData=null;
      _groupOnlyMode=false;
      showApp();
      await loadMJPool();
      _suppressUnsavedMark=true;render();
      if(!localStorage.getItem('tuto_fiche_done')&&state.players[0]?.created) setTimeout(()=>startTutorial('fiche'),800);
      // Lance les listeners temps réel
      currentTableMjId=tableData?.mjId||null;
      stopAllListeners();
      _groupData=[];
      startPlayerListener(campaignId);
      startGroupListener(campaignId);
      if(currentTableMjId)startCombatListener(campaignId,currentTableMjId);
      if(currentTableId)startWhisperListener(currentTableId,currentUser.uid);
    }
  }catch(e){showToast('❌ Erreur chargement : '+e.message);}
}

async function openCampChronicle(tableId,campId){
  await enterCampaign(tableId,campId);
  _playerJournalSubTab='chronicle';
  _compilationData=null;
  state.activeTab='journal';
  renderTabBar();
  renderTab();
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
