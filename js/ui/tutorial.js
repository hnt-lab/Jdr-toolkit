// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// TUTO GUIDÃ‰
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Tuto 1 â€” Joueur (hub, profil, groupe, campagne)
const _TUTO_PLAYER=[
  {icon:'ðŸ§°',title:'Bienvenue dans La BoÃ®te Ã  Outils !',text:'Ton compagnon numÃ©rique pour D&D 5e. Fiche de personnage, suivi de combat, sorts, inventaire, monnaie â€” tout en un, synchronisÃ© en temps rÃ©el avec ton MJ.',sel:'#hubScreen'},
  {icon:'ðŸ ',title:'Le Hub â€” ta page d\'accueil',text:'C\'est d\'ici que tout part. Rejoins une campagne avec le code donnÃ© par ton MJ, ou crÃ©e ta propre table pour tester l\'outil. Toutes tes tables apparaissent ici.',sel:'#hubContent'},
  {icon:'ðŸ§‘',title:'Rejoindre une campagne',text:'Quand tu rejoins une campagne pour la premiÃ¨re fois, une fiche de personnage est crÃ©Ã©e automatiquement. Tu la remplis Ã  ton rythme â€” nom, race, classe, stats... Un guide dÃ©diÃ© Ã  la fiche est disponible dans ton Profil.',sel:'.hub-section'},
  {icon:'ðŸ“¥',title:'Ton profil & ta bibliothÃ¨que',text:'AccÃ¨de Ã  ton profil via le bouton ðŸ‘¤ en haut Ã  droite. Tu peux y gÃ©rer tes personnages, tes compendiums et ton compte. Si tu rejoins une nouvelle campagne, importe un personnage existant depuis ta bibliothÃ¨que â€” sans rien perdre.',sel:'#hubUserBtn'},
  {icon:'ðŸ“‹',title:'Menu campagne',text:'Sur la carte d\'une campagne, tu trouveras la description et la liste des membres. L\'icÃ´ne ðŸ“‹ Ã  droite ouvre ta fiche ou celle de n\'importe quel participant. Clique sur "ðŸ‘¥ Rejoindre le groupe" pour partir Ã  l\'aventure.',sel:'.hub-card'},
  {icon:'ðŸ‘¥',title:'Le menu Groupe',text:'Le bouton ðŸ‘¥ en bas Ã  gauche est disponible partout â€” hub et fiche. Il affiche les PV, conditions et ressources de tous tes alliÃ©s en temps rÃ©el. Un badge rouge signale un alliÃ© en danger (PV < 25%).',sel:'#partyHudBtn'},
  {icon:'ðŸ’¬',title:'Donner un retour',text:'Un formulaire de feedback est accessible depuis ton Profil. Retours, questions, bugs, idÃ©es â€” tout est bienvenu. Tes retours aident directement Ã  amÃ©liorer l\'outil pour toute la communautÃ©.',sel:'#hubUserBtn'},
  {icon:'âš”ï¸',title:'Combats',text:'Lorsque le MJ lance le combat, une banniÃ¨re violette apparaÃ®t en haut de ta fiche quand c\'est ton tour. Clique sur â© Fin de tour pour passer la main â€” le MJ et tes alliÃ©s le voient instantanÃ©ment.',sel:null},
];

// Tuto 2 â€” Fiche personnage, onglet par onglet
const _TUTO_FICHE=[
  {icon:'ðŸ§‘',title:'Ta fiche de personnage',text:'La fiche est ton tableau de bord en jeu. Elle est divisÃ©e en onglets pour organiser toutes tes informations. Parcourons-la ensemble onglet par onglet.',tab:null,sel:null},
  {icon:'ðŸ§‘',title:'Onglet Perso â€” l\'identitÃ©',text:'Nom, race, classe, niveau, portrait... C\'est ici que tu dÃ©finis ton identitÃ©. Tes statistiques (FOR, DEX, CON...), tes PV, ta CA et ton initiative sont Ã©galement sur cet onglet â€” c\'est ton tableau de bord principal.',tab:'perso',sel:'#tabBar .tab:nth-child(1)'},
  {icon:'ðŸŽ¯',title:'Onglet CompÃ©tences',text:'Toutes tes compÃ©tences avec leurs modificateurs calculÃ©s. Coche les cases de maÃ®trise et expertise â€” les bonus s\'appliquent automatiquement.',tab:'competences',sel:'#tabBar .tab:nth-child(2)'},
  {icon:'âš”ï¸',title:'Onglet Combat',text:'Tes armes Ã©quipÃ©es avec leurs bonus d\'attaque et dÃ©gÃ¢ts calculÃ©s automatiquement â€” un bouton lance le jet en un clic. Tes jets de sauvegarde par caractÃ©ristique sont aussi lÃ .',tab:'combat',sel:'#tabBar .tab:nth-child(3)'},
  {icon:'âš¡',title:'Combat â€” CapacitÃ©s de classe',text:'Tes ressources de classe (Discipline Ki, Rage, Inspiration bardiqueâ€¦) apparaissent ici avec leur nombre de charges restantes. Clique sur les bulles pour les dÃ©penser, et rÃ©cupÃ¨re-les aprÃ¨s un repos.',tab:'combat',sel:'#tabContent'},
  {icon:'âœ¨',title:'Onglet Sorts',text:'Ta liste de sorts et tes emplacements par niveau. Coche un sort pour le prÃ©parer ou le retirer. Utilise les bulles de slot pour suivre les emplacements dÃ©pensÃ©s au fil de la session.',tab:'sorts',sel:'#tabBar .tab:nth-child(4)'},
  {icon:'ðŸ›¡ï¸',title:'Onglet Ã‰quipement',text:'Tes armes et armures actives, avec un portrait d\'Ã©quipement sÃ©parÃ©. Change d\'Ã©quipement en sÃ©lectionnant un item. La CA s\'adapte Ã  l\'armure portÃ©e.',tab:'equipement',sel:'#tabBar .tab:nth-child(5)'},
  {icon:'ðŸŽ’',title:'Onglet Sac',text:'Ton inventaire complet avec ta Bourse (conversion automatique des piÃ¨ces). Ajoute des objets manuellement ou via le compendium. Les potions ont un bouton ðŸ§ª Utiliser et les parchemins un bouton ðŸ“œ Lancer. Pour les objets qui nÃ©cessitent un lien magique, un bouton ðŸ”— Se lier apparaÃ®t â€” tu peux en avoir jusqu\'Ã  3 liÃ©s simultanÃ©ment.',tab:'sac',sel:'#tabBar .tab:nth-child(6)'},
  {icon:'ðŸ“–',title:'Onglet Historique',text:'Traits de personnalitÃ©, idÃ©aux, liens, dÃ©fauts, apparence, backstory â€” tout ce qui fait la profondeur de ton personnage. Tu peux mÃªme y ajouter des secrets uniquement visibles par le MJ.',tab:'historique',sel:'#tabBar .tab:nth-child(7)'},
  {icon:'ðŸ“',title:'Onglet Journal',text:'Un journal pour noter tes observations, tes secrets, les infos que tu veux retenir. Choisis si tu veux partager certaines entrÃ©es en les ajoutant Ã  la chronique du groupe.',tab:'journal',sel:'#tabBar .tab:nth-child(8)'},
  {icon:'â­',title:'Onglet XP',text:'Ton expÃ©rience et ton niveau. Le MJ peut t\'attribuer de l\'XP directement. Quand tu passes un niveau, un onglet â¬† Niveau + apparaÃ®t pour choisir tes amÃ©liorations.',tab:'xp',sel:'#tabBar .tab:nth-child(9)'},
  {icon:'ðŸŽ²',title:'Le bouton dÃ©',text:'Le bouton ðŸŽ² en bas Ã  droite est ton lanceur de dÃ©s rapide. Un appui court ouvre le panneau complet â€” d4, d6, d8, d10, d12, d20, d100. Un appui long affiche des raccourcis vers le Journal et ton onglet Perso.',tab:null,sel:'#diceFloat'},
  {icon:'ðŸ”’',title:'ConfidentialitÃ©',text:'Le cadenas ðŸ”’ en bout de barre d\'onglets te permet de choisir les onglets que les autres joueurs peuvent voir. Chaque onglet peut Ãªtre rendu public ou privÃ©.',tab:'perso',sel:'#tabBar .tab[onclick*="openPrivacySettings"]'},
];

// Tuto 3 â€” MaÃ®tre du Jeu
const _TUTO_MJ=[
  {icon:'ðŸŽ²',title:'Interface MaÃ®tre du Jeu',text:'Bienvenue dans ton espace MJ. Depuis ici, tu coordonnes ta campagne en temps rÃ©el â€” joueurs, combat, PNJ, rÃ¨gles. Parcourons chaque onglet ensemble.',mjTab:'joueurs',sel:'#mjTabContent'},
  {icon:'ðŸ‘¤',title:'Onglet Joueurs',text:'Vois les PV, CA, initiative et conditions de chaque joueur en temps rÃ©el. Modifie leurs stats directement â€” les changements sont instantanÃ©ment visibles sur leur fiche. Tu peux aussi leur attribuer de l\'XP. Les boutons â˜• Repos court et ðŸŒ™ Repos long en bas de l\'onglet appliquent la rÃ©cupÃ©ration Ã  tout le groupe en un seul clic.',mjTab:'joueurs',sel:'#mjTabContent'},
  {icon:'âš”ï¸',title:'Onglet Combat',text:'Lance l\'initiative, ajoute joueurs et monstres (ou tes PNJ sauvegardÃ©s). Quand tu modifies les PV d\'un joueur dans le tracker, sa fiche se met Ã  jour instantanÃ©ment. L\'initiative est cliquable pour Ãªtre modifiÃ©e ou relancÃ©e. Quand tu passes au tour d\'un joueur, il reÃ§oit automatiquement une notification âš¡ "C\'est ton tour !".',mjTab:'combat',sel:'#mjTabContent'},
  {icon:'ðŸ‰',title:'Onglet PNJ / Monstres',text:'CrÃ©e des PNJ ou importe depuis le compendium SRD (6 500+ monstres, stats prÃ©remplies). Le bouton ðŸ¤ Comparse gÃ©nÃ¨re un PNJ alliÃ© avec HP, capacitÃ©s et progression niveau par niveau (Compagnon d\'armes, Expert ou Incantateur). Ajoute n\'importe quel PNJ directement au tracker de combat.',mjTab:'pnj',sel:'#mjTabContent'},
  {icon:'ðŸ’°',title:'Onglet Objets',text:'CrÃ©e tes rÃ©compenses ou cherche dans le compendium SRD (5 000+ objets). Filtre par raretÃ© â€” chaque objet affiche son badge colorÃ©, son niveau recommandÃ© et son prix estimÃ©. Coche â˜‘ NÃ©cessite un lien lors de la crÃ©ation pour que le bouton ðŸ”— Se lier apparaisse automatiquement dans le sac du joueur Ã  qui tu donnes l\'objet.',mjTab:'objets',sel:'#mjTabContent'},
  {icon:'ðŸ“–',title:'Onglet RÃ¨gles',text:'RÃ©fÃ©rence complÃ¨te en jeu : actions, conditions, repos, sorts, armures, multiclassage, voyages, dangers, âš” construction de rencontre, â˜£ maladies & poisons & folie, âœ¨ objets magiques, ðŸª¤ piÃ¨ges, ðŸ¤ comparses, ðŸŒ™ temps morts (XGtE). Les sections sont rÃ©organisables par glisser-dÃ©poser. Plus besoin d\'ouvrir le livre en pleine partie.',mjTab:'regles',sel:'#mjTabContent'},
  {icon:'ðŸ§°',title:'Compendiums & Profil',text:'Dans ðŸ‘¤ Profil â†’ Mes compendiums, crÃ©e des recueils de sorts, objets ou capacitÃ©s maison. Tu peux en crÃ©er plusieurs, les nommer et les partager. L\'icÃ´ne ðŸ“‹ sur une carte campagne ouvre la fiche d\'un joueur en lecture seule â€” mÃªme les onglets privÃ©s.',mjTab:'joueurs',sel:'#mjTabContent'},
  {icon:'ðŸ”„',title:'Synchronisation en temps rÃ©el',text:'Tout ce que tu fais est visible instantanÃ©ment par tes joueurs â€” PV, conditions, tours de combat. Et inversement, tu vois leurs modifications en temps rÃ©el. Fini les "attends je note Ã§a" en cours de partie.',mjTab:'joueurs',sel:'#mjTabContent'},
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
      <button style="background:none;border:none;color:var(--text3);font-size:18px;cursor:pointer;line-height:1;padding:0 0 0 8px" onclick="_tutoFinish()" title="Fermer">âœ•</button>
    </div>
    <div style="font-size:30px;margin-bottom:6px;line-height:1">${s.icon}</div>
    <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:6px">${s.title}</div>
    <p style="font-size:12px;color:var(--text2);line-height:1.6;margin-bottom:14px">${s.text}</p>
    <div style="display:flex;gap:8px">
      ${_tutoIdx>0?`<button class="btn bsm" style="flex:1" onclick="_tutoIdx--;_renderTutoStep()">â† PrÃ©c.</button>`:''}
      <button class="btn bac bsm" style="flex:2" onclick="${isLast?'_tutoFinish()':'_tutoIdx++;_renderTutoStep()'}">
        ${isLast?'âœ“ Terminer':'Suivant â†’'}
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
