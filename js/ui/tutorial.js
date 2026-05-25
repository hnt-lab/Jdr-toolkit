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
