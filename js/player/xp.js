// TAB: XP
// ═══════════════════════════════════════
function tabXP(p){
  const cur=p.xp||0;const lvl=totalLevel(p);
  const curT=XP_LEVELS[lvl-1]||0;const nextT=XP_LEVELS[lvl]||XP_LEVELS[19];
  const pct=Math.min(100,Math.round(((cur-curT)/Math.max(1,nextT-curT))*100));
  const toNext=Math.max(0,nextT-cur);const canLvlUp=(isMJ()||cur>=nextT)&&lvl<20&&!p.pendingLevelUp;

  const xpBar=`<div style="display:flex;align-items:baseline;gap:8px;margin-bottom:4px">
    <span style="font-size:28px;font-weight:700;color:var(--cp)">${cur.toLocaleString()}</span>
    <span style="color:var(--text3)">XP</span>
  </div>
  <div class="xp-bar-wrap"><div class="xp-bar-fill" style="width:${pct}%"></div></div>
  <div style="font-size:12px;color:var(--text3);margin-bottom:10px">${toNext>0?`${toNext.toLocaleString()} XP jusqu'au niveau ${lvl+1}`:'Prêt !'}</div>`;

  const lvlUpBtn=canLvlUp?`<div style="padding:10px;background:var(--cglow);border:1px solid var(--cp);border-radius:8px;text-align:center;margin-bottom:10px">
    <div style="font-size:14px;font-weight:600;color:var(--cp);margin-bottom:6px">⬆ Niveau ${lvl+1} disponible !</div>
    <button class="btn bac" onclick="unlockLevelUp()">Ouvrir montée de niveau</button>
  </div>`:p.pendingLevelUp?`<div style="padding:10px;background:var(--cglow);border:1px solid #ffd54f;border-radius:8px;text-align:center;font-size:13px;color:#ffd54f;margin-bottom:10px">⬆ Voir l'onglet <strong>Niveau +</strong></div>`:'';

  const niveauTable=`<div class="panel"><div class="pt">Table des niveaux</div>
    <table style="width:100%;border-collapse:collapse;font-size:12px">
      <thead><tr style="color:var(--text3);border-bottom:1px solid var(--border)"><th style="text-align:left;padding:4px 8px">Niv.</th><th style="text-align:right;padding:4px 8px">XP</th><th style="text-align:right;padding:4px 8px">Maîtrise</th></tr></thead>
      <tbody>${XP_LEVELS.map((xp,i)=>`<tr style="background:${i+1===lvl?'var(--cglow)':'transparent'};border-bottom:1px solid var(--border)">
        <td style="padding:4px 8px;color:${i+1===lvl?'var(--cp)':'var(--text2)'};font-weight:${i+1===lvl?700:400}">${i+1}${i+1===lvl?' ◀':''}</td>
        <td style="text-align:right;padding:4px 8px;color:var(--text3)">${xp.toLocaleString()}</td>
        <td style="text-align:right;padding:4px 8px;color:var(--cp)">+${pb(i+1)}</td>
      </tr>`).join('')}</tbody>
    </table>
  </div>`;

  if(!isMJ()){
    // Mode joueur : barre XP + bouton level up + table
    return`<div class="g2" style="gap:10px">
      <div><div class="panel mb10"><div class="pt">Expérience</div>${xpBar}${lvlUpBtn}</div></div>
      <div>${niveauTable}</div>
    </div>`;
  }

  // Mode MJ : tout + récompenses rapides + ajout XP
  const recompenses=`<div class="panel" style="padding:8px;margin-top:10px">
    <div class="pt" style="font-size:11px">Récompenses rapides</div>
    ${[[10,'Piège désamorcé'],[25,'Gobelin tué'],[50,'Rencontre facile'],[100,'Rencontre moyenne'],[200,'Rencontre difficile'],[450,'Boss tué'],[1000,'Jalon narratif']].map(([xp,lbl])=>`<div class="xp-reward" onclick="quickXP(${xp})">+${xp} XP — ${lbl}</div>`).join('')}
  </div>`;

  const encCalcPanel=`<div class="panel" style="margin-top:10px">
    <div class="pt" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
      <span>🎯 Calculateur de rencontre</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
      <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Nb de joueurs</div><input class="fi" id="enc_size" type="number" min="1" max="8" value="${_encGroupSize}" oninput="encRefresh()"></div>
      <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Niveau moyen</div><input class="fi" id="enc_level" type="number" min="1" max="20" value="${_encGroupLevel}" oninput="encRefresh()"></div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
      <div style="font-size:11px;font-weight:600;color:var(--text2)">Monstres de la rencontre</div>
      <button class="btn bsm bprimary" onclick="encAddMonster()">+ Monstre</button>
    </div>
    <div id="enc_monsterList">${_encMonsters.length?_encMonsters.map((m,i)=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px"><span style="font-size:12px"><strong>${esc(m.name)}</strong> <span style="color:var(--text3)">CR ${m.cr}</span> — <span style="color:var(--cp)">${m.xp.toLocaleString()} XP</span></span><button class="btn bsm" style="color:#e53935;border-color:rgba(229,57,53,.4);padding:0 6px" onclick="encRemoveMonster(${i})">✕</button></div>`).join(''):'<div style="font-size:11px;color:var(--text3);font-style:italic;text-align:center;padding:8px">Aucun monstre — ajoutez-en ci-dessus.</div>'}</div>
    <div id="enc_result" style="margin-top:8px">${encResultHTML(_encGroupSize,_encGroupLevel)}</div>
    <button class="btn bac" style="width:100%;margin-top:10px" onclick="encDistribute()">⭐ Distribuer l'XP aux joueurs</button>
  </div>`;

  return`<div class="g2" style="gap:10px">
    <div>
      <div class="panel mb10">
        <div class="pt" style="display:flex;align-items:center;justify-content:space-between"><span>Expérience</span><span style="font-size:10px;color:var(--cp);border:1px solid var(--cp);border-radius:10px;padding:2px 8px">🎲 MJ</span></div>
        ${xpBar}
        <div style="display:flex;gap:6px;margin-bottom:10px">
          <input class="fi" id="xpAdd" type="number" placeholder="XP à ajouter" min="0">
          <button class="btn bac bsm" style="white-space:nowrap" onclick="addXP()">+ Ajouter</button>
        </div>
        ${lvlUpBtn}
        ${recompenses}
      </div>
      ${encCalcPanel}
      <div style="margin-top:10px;padding:10px;background:rgba(229,57,53,.05);border:1px solid rgba(229,57,53,.3);border-radius:8px">
        <div style="font-size:12px;font-weight:600;color:#e53935;margin-bottom:6px">🔄 Réinitialisation des niveaux</div>
        <div style="font-size:11px;color:var(--text3);margin-bottom:8px">Remet le personnage au niveau 1. Les capacités de classe sont réinitialisées, l'XP est conservée et il devra repasser toutes les étapes de montée de niveau.</div>
        <button class="btn bsm" style="color:#e53935;border-color:rgba(229,57,53,.5);width:100%" onclick="mjRespecCharacter()">🔄 Réinitialiser les niveaux</button>
      </div>
    </div>
    <div>${niveauTable}</div>
  </div>`;
}
function _checkLevelUpPopup(oldXp,newXp,lvl){
  const nextT=XP_LEVELS[lvl]||XP_LEVELS[19];
  if(lvl<20&&oldXp<nextT&&newXp>=nextT){
    const newLvl=lvl+1;
    _showCombatPopup('⬆',`Niveau ${newLvl} !`,`Tu peux monter au niveau ${newLvl}. Va dans l'onglet ⭐ XP.`,5500);
  }
}
function removeXP(){const v=parseInt(document.getElementById('xpRemove')?.value)||0;if(v<=0)return;P().xp=Math.max(0,(P().xp||0)-v);document.getElementById('xpRemove').value='';render();}
function addXP(){const p=P();const v=parseInt(document.getElementById('xpAdd')?.value)||0;if(v<=0)return;const old=p.xp||0;p.xp=old+v;document.getElementById('xpAdd').value='';_checkLevelUpPopup(old,p.xp,totalLevel(p));render();}
function quickXP(xp){const p=P();const old=p.xp||0;p.xp=old+xp;_checkLevelUpPopup(old,p.xp,totalLevel(p));render();}
function unlockLevelUp(){P().pendingLevelUp=true;setTab('levelup');}
function mjAdjustLevel(delta){
  const p=P();const mc=mainClass(p);if(!mc)return;
  const entry=p.classes.find(c=>c.name===mc.name);if(!entry)return;
  const newLvl=Math.max(1,Math.min(20,entry.level+delta));
  if(newLvl===entry.level)return;
  const dSrd=SRD.classes.find(c=>c.name===mc.name);
  const hd=dSrd?dSrd.hdVal:8;
  const avg=Math.floor(hd/2)+1;
  const conMod=mod(p.abilities[2]);
  // Ajuster PV max proportionnellement
  const diff=newLvl-entry.level;
  p.hpMax=Math.max(1,p.hpMax+diff*Math.max(1,avg+conMod));
  if(p.race==='Nain des collines')p.hpMax+=diff; // Ténacité naine
  p.hp=Math.min(p.hp,p.hpMax);
  entry.level=newLvl;
  // Mettre l'XP au début du nouveau niveau si on monte, ou à la fin du niveau précédent si on descend
  p.xp=XP_LEVELS[Math.max(0,newLvl-1)]||0;
  p.pendingLevelUp=false;
  render();showToast(`🎲 MJ — Niveau ${mc.name} → ${newLvl}`);
}
function mjRespecCharacter(){
  if(!confirm('Réinitialiser ce personnage au niveau 1 ?\n\nToutes les capacités de classe acquises seront perdues. L\'XP sera conservée et le personnage pourra passer à nouveau tous ses niveaux.'))return;
  const p=P();const mc=mainClass(p);if(!mc){showToast('❌ Aucune classe principale détectée.');return;}
  const dSrd=SRD.classes.find(c=>c.name===mc.name);
  const hd=dSrd?dSrd.hdVal:8;
  const conMod=mod((p.abilities||[10,10,10,10,10,10])[2]);
  p.classes=[{name:mc.name,level:1}];
  const classNames=SRD.classes.map(c=>c.name);
  p.features=(p.features||[]).filter(f=>!f.classe||!classNames.includes(f.classe));
  p.archetype={};
  p.spellSlotsUsed=[];
  p.hpMax=Math.max(1,hd+conMod);
  p.hp=p.hpMax;
  p.combatCharges={};
  p.dmgResistances=(p.dmgResistances||[]).filter(r=>!['Contondant','Perforant','Tranchant','Feu','Froid','Foudre','Nécrotique','Acide','Tonnerre','Radiant','Poison'].includes(r));
  p.conditions=[];
  p.exhaustion=0;
  p.eldritchInvocations=[];
  p.pendingLevelUp=true;
  saveAll();render();showToast(`🔄 ${p.charName||'Personnage'} réinitialisé au niveau 1. L'XP est conservée.`);
}

// ═══════════════════════════════════════
// DONNÉES MONTÉE DE NIVEAU PAR CLASSE
// ═══════════════════════════════════════
const CLASS_LEVEL_DATA={
  Guerrier:{
    archetypes:[
      {name:"Champion",desc:"Niv.3 : Critique amélioré (19-20). Niv.7 : Athlète accompli (½ maîtrise aux jets FOR/DEX/CON sans maîtrise). Niv.10 : Style de combat supplémentaire. Niv.15 : Critique supérieur (18-20). Niv.18 : Survivant (récup. 5+CON PV au début du tour si ≤ ½ PV max).",icon:"🏆"},
      {name:"Maître de guerre",desc:"Niv.3 : Supériorité martiale — 3 manœuvres, 4 dés de supériorité d8 (DD = 8+maîtrise+FOR/DEX). Niv.7 : +2 manœuvres, +1 dé, Observation de l'ennemi. Niv.10 : +2 manœuvres, dés → d10. Niv.15 : +2 manœuvres, +1 dé, Implacable (récupère 1 dé d'initiative si à 0). Niv.18 : dés → d12.",icon:"⚔"},
      {name:"Chevalier occulte",desc:"Niv.3 : Sorts de magicien (INT, abjuration/évocation), Lien d'arme (invoquer une arme liée par action bonus). Niv.7 : Magie de guerre (attaque bonus après un cantrip). Niv.10 : Frappe occulte (désavantage JS contre prochain sort si touché). Niv.15 : Charge arcanique (téléportation 9m via Fougue). Niv.18 : Magie de guerre améliorée (attaque bonus après n'importe quel sort).",icon:"🔮"},
    ],
    combatStyles:[
      {name:"Archerie",desc:"+2 aux jets d'attaque avec armes à distance."},
      {name:"Arme à deux mains",desc:"Relancer les 1 et 2 sur les dés de dégâts avec armes à deux mains."},
      {name:"Combat à deux armes",desc:"Ajouter le modificateur de carac. aux dégâts de la seconde attaque."},
      {name:"Défense",desc:"+1 CA si tu portes une armure."},
      {name:"Duel",desc:"+2 aux dégâts avec une arme tenue en une main."},
      {name:"Protection",desc:"Utiliser ta réaction pour donner désavantage à une attaque contre un allié à 1,5m."},
    ],
    levelFeatures:{
      1:["Style de combat (choix)","Second souffle (1/repos court)"],
      2:["Fougue (1/repos court) — action supplémentaire"],
      3:["Archétype martial (choix)"],
      4:["Amélioration de caractéristiques"],
      5:["Attaque supplémentaire (2 attaques par action)"],
      6:["Amélioration de caractéristiques"],
      7:["Capacité de l'archétype"],
      8:["Amélioration de caractéristiques"],
      9:["Inflexible (1/repos long) — relancer un JS raté"],
      10:["Capacité de l'archétype"],
      11:["Attaque supplémentaire (3 attaques)"],
      12:["Amélioration de caractéristiques"],
      13:["Inflexible (2/repos long)"],
      14:["Amélioration de caractéristiques"],
      15:["Capacité de l'archétype"],
      16:["Amélioration de caractéristiques"],
      17:["Fougue (2/repos court)","Inflexible (3/repos long)"],
      18:["Capacité de l'archétype"],
      19:["Amélioration de caractéristiques"],
      20:["Attaque supplémentaire (4 attaques)"],
    },
    asiLevels:[4,6,8,12,14,16,19],
    archetypeLevel:3,
    styleLevel:1,
  },
  Barbare:{
    archetypes:[
      {name:"Voie du berserker",desc:"Frénésie niv.3 (attaque bonus en rage, +1 épuisement à la fin). Rage aveugle niv.6 (immunité charme/peur en rage). Présence intimidante niv.10 (action : effraie une créature, JS SAG). Représailles niv.14 (réaction : attaque de mêlée si touché).",icon:"🔥"},
      {name:"Voie du guerrier totem",desc:"Esprit totem niv.3 (choix : ours — résistances en rage / aigle — pas d'attaque d'opportunité en rage / loup — avantage allié). Aspect de la bête niv.6. Marcheur spirituel niv.10 (Communion avec la nature rituel). Lien totémique niv.14.",icon:"🐺"},
      {name:"Voie de la magie sauvage",desc:"Sursaut sauvage niv.3 (effet magique aléatoire d8 à chaque rage). Réserve de magie niv.6. Réaction instable niv.10. Sursaut contrôlé niv.14.",icon:"✨"},
    ],
    levelFeatures:{
      1:["Rage (2 utilisations, +2 dégâts)","Défense sans armure (CA = 10+DEX+CON)"],
      2:["Attaque téméraire (avantage attaque FOR, mais attaquants aussi)","Sens du danger (avantage JS DEX vs pièges/sorts/effets visibles)"],
      3:["Voie primitive (choix)","3 rages"],
      4:["Amélioration de caractéristiques"],
      5:["Attaque supplémentaire (2 attaques)","Déplacement rapide (+3m sans armure lourde)"],
      6:["4 rages","Capacité de la voie"],
      7:["Instinct sauvage (avantage Initiative, peut rager si surpris)"],
      8:["Amélioration de caractéristiques"],
      9:["Critique brutal (1 dé de dégâts sup. sur critique)","Bonus dégâts rage: +3"],
      10:["Capacité de la voie"],
      11:["Rage implacable (JS CON DD10 si tombe à 0 PV en rage → 1 PV)"],
      12:["Amélioration de caractéristiques","5 rages"],
      13:["Critique brutal (2 dés sup.)"],
      14:["Capacité de la voie"],
      15:["Rage persistante (reste en rage si plus d'actions hostiles, sauf si inconscient)"],
      16:["Amélioration de caractéristiques","Bonus dégâts rage: +4"],
      17:["6 rages","Critique brutal (3 dés sup.)"],
      18:["Puissance indomptable (résultat d'un jet de FOR < valeur de FOR → utiliser la valeur)"],
      19:["Amélioration de caractéristiques"],
      20:["Champion primitif (+4 FOR et CON, max 24)","Rages illimitées"],
    },
    asiLevels:[4,8,12,16,19],
    archetypeLevel:3,
  },
  Barde:{
    archetypes:[
      {name:"Collège du savoir",desc:"Maîtrises supplémentaires (3 compétences au choix). Mots cinglants niv.3 (réaction : dépense 1 inspiration bardique, la cible soustrait le dé à son jet). Secrets magiques supplémentaires niv.6 (2 sorts de n'importe quelle classe). Compétence hors-pair niv.14 (dépense 1 inspiration pour améliorer un jet raté).",icon:"📚"},
      {name:"Collège de la vaillance",desc:"Maîtrises armures intermédiaires, boucliers et armes de guerre. Inspiration martiale niv.3 (allié utilise le dé sur dégâts ou CA). Attaque supplémentaire niv.6. Magie de combat niv.14 (sort bardique comme action bonus si tu attaques).",icon:"🛡"},
    ],
    levelFeatures:{
      1:["Incantation","Inspiration bardique (1d6, CHA fois/repos long)"],
      2:["Touche-à-tout","Chant reposant (1d6)"],
      3:["Collège bardique (choix)","Expertise (2 compétences ×2 maîtrise)"],
      4:["Amélioration de caractéristiques"],
      5:["Inspiration bardique (1d8)","Source d'inspiration (repos court)"],
      6:["Contre-charme","Capacité du collège"],
      7:[],
      8:["Amélioration de caractéristiques"],
      9:["Chant reposant (1d8)"],
      10:["Inspiration bardique (1d10)","Expertise (2 autres compétences)","Secrets magiques (2 sorts de n'importe quelle classe)"],
      11:[],
      12:["Amélioration de caractéristiques"],
      13:["Chant reposant (1d10)"],
      14:["Secrets magiques (2 sorts)","Capacité du collège"],
      15:["Inspiration bardique (1d12)"],
      16:["Amélioration de caractéristiques"],
      17:["Chant reposant (1d12)"],
      18:["Secrets magiques (2 sorts supplémentaires de n'importe quelle classe)"],
      19:["Amélioration de caractéristiques"],
      20:["Inspiration supérieure (min 1 dé si 0)"],
    },
    asiLevels:[4,8,12,16,19],
    archetypeLevel:3,
    spellsPerLevel:{3:1,4:2,5:1,7:1,8:1,9:1,10:2,11:1,13:1,14:1,15:1,16:1,17:1,19:1,20:1},
    cantripAtLevels:[4,10],
  },
  Clerc:{
    archetypes:[
      {name:"Domaine de la vie",desc:"Maîtrise armures lourdes. Disciple de la vie (soins +2+niv du sort). Conduit : Préservation de la vie niv.2. Guérisseur béni niv.6. Guérison suprême niv.17.",icon:"💚"},
      {name:"Domaine de la lumière",desc:"Sort mineur : Lumière. Illumination protectrice niv.1 (réaction, désavantage attaquant). Conduit : Radiance de l'aube niv.2. Illumination améliorée niv.6. Halo de lumière niv.17.",icon:"☀"},
      {name:"Domaine de la nature",desc:"Maîtrise armures lourdes + 1 compétence (Dressage/Nature/Survie). Sort mineur druide niv.1. Conduit : Charme des animaux et plantes niv.2. Atténuation des éléments niv.6. Maître de la nature niv.17.",icon:"🌿"},
      {name:"Domaine de la tempête",desc:"Maîtrises armures lourdes et armes de guerre. Fureur de l'ouragan niv.1 (réaction, 2d8 foudre/tonnerre). Conduit : Fureur destructrice niv.2. Frappe de l'éclair niv.6. Enfant de la tempête niv.17.",icon:"⚡"},
      {name:"Domaine de la tromperie",desc:"Bénédiction de l'escroc niv.1 (avantage Discrétion). Conduit : Invocation de réplique (illusion) niv.2. Linceul d'ombre niv.6. Réplique améliorée niv.17.",icon:"🎭"},
      {name:"Domaine de la guerre",desc:"Maîtrises armures lourdes et armes de guerre. Prêtre de guerre niv.1 (attaque bonus avec Sagesse). Conduit : Frappe guidée (+10 attaque) niv.2. Bénédiction du dieu de la guerre niv.6. Avatar de bataille niv.17.",icon:"⚔"},
      {name:"Domaine du savoir",desc:"Bénédictions du savoir niv.1 (2 langues + maîtrise doublée en 2 compétences parmi Arcanes/Histoire/Nature/Religion). Conduit : Savoir ancestral niv.2. Lecture des pensées niv.6. Visions du passé niv.17.",icon:"📚"},
      {name:"Domaine de la forge",desc:"Maîtrises armures lourdes et outils de forgeron. Bénédiction de la forge niv.1 (+1 arme/armure après repos long). Conduit : Bénédiction de l'artisan niv.2. Âme de la forge niv.6. Saint de la forge niv.17.",icon:"🔨"},
    ],
    levelFeatures:{
      1:["Incantation","Domaine divin (choix)","Capacité du domaine niv.1"],
      2:["Conduit divin (1 utilisation — dont Renvoi des morts-vivants)","Capacité du domaine"],
      3:["Sorts du domaine niv.2"],
      4:["Amélioration de caractéristiques"],
      5:["Destruction des morts-vivants (IM 1/2)","Sorts du domaine niv.3"],
      6:["Conduit divin (2 utilisations)","Capacité du domaine"],
      7:["Sorts du domaine niv.4"],
      8:["Amélioration de caractéristiques","Destruction des morts-vivants (IM 1)","Capacité du domaine"],
      9:["Sorts du domaine niv.5"],
      10:["Intervention divine"],
      11:["Destruction des morts-vivants (IM 2)"],
      12:["Amélioration de caractéristiques"],
      13:[],
      14:["Destruction des morts-vivants (IM 3)","Capacité du domaine"],
      15:[],
      16:["Amélioration de caractéristiques"],
      17:["Destruction des morts-vivants (IM 4)","Capacité du domaine"],
      18:["Conduit divin (3 utilisations)"],
      19:["Amélioration de caractéristiques"],
      20:["Intervention divine améliorée (succès automatique)"],
    },
    asiLevels:[4,8,12,16,19],
    archetypeLevel:1,
    spellsPerLevel:{2:1,3:1,5:1,7:1,9:1},
  },
  Druide:{
    archetypes:[
      {name:"Cercle de la lune",desc:"Forme sauvage en action bonus niv.2 (CR=1). Frappe primitive niv.6 (attaques en forme animale = magiques). Forme élémentaire niv.10 (2 utilisations : devenir un élémentaire air/eau/terre/feu). Mille formes niv.14 (modifier son apparence à volonté).",icon:"🌙"},
      {name:"Cercle des terres",desc:"Récupération naturelle niv.2 (repos court : récupérer emplacements ≤ ceil(niv/2), max niv.5). Foulée tellurique niv.6 (terrains difficiles non-magiques sans coût). Protégée de dame Nature niv.10 (immunité charme/peur élémentaires/fées + poison/maladie). Sanctuaire de dame Nature niv.14 (bêtes/plantes : JS SAG pour attaquer).",icon:"🗺"},
    ],
    levelFeatures:{
      1:["Incantation"],
      2:["Forme sauvage (CR 1/4, pas nage/vol)","Cercle druidique (choix)"],
      3:["Sorts du cercle niv.2"],
      4:["Forme sauvage améliorée (CR 1/2 nage)","Amélioration de caractéristiques"],
      5:["Sorts du cercle niv.3"],
      6:["Capacité du cercle","Forme sauvage (CR = niv/3, ex. CR 2 à niv.6)"],
      7:["Sorts du cercle niv.4"],
      8:["Amélioration de caractéristiques","Forme sauvage améliorée (vol autorisé)"],
      9:["Sorts du cercle niv.5"],
      10:["Capacité du cercle"],
      11:["Accès aux emplacements de sorts de niveau 6"],
      12:["Amélioration de caractéristiques"],
      13:["Accès aux emplacements de sorts de niveau 7"],
      14:["Capacité du cercle"],
      15:["Accès aux emplacements de sorts de niveau 8"],
      16:["Amélioration de caractéristiques"],
      17:["Accès aux emplacements de sorts de niveau 9"],
      18:["Corps intemporel (vieillissement ×10)","Sorts de bête"],
      19:["Amélioration de caractéristiques"],
      20:["Archidruide (Forme sauvage illimitée)"],
    },
    asiLevels:[4,8,12,16,19],
    archetypeLevel:2,
    spellsPerLevel:{2:1,3:1,5:1,7:1,9:1},
  },
  Moine:{
    archetypes:[
      {name:"Voie de la paume",desc:"Niv.3 : Technique de la paume (toucher via Déluge de coups pour pousser 4,5m / faire tomber / priver de réaction). Niv.6 : Plénitude physique (soigner niv×3 PV, 1/repos long). Niv.11 : Tranquillité (aura de sanctuaire après repos long). Niv.17 : Paume frémissante (3 ki : vibrations létales, JS CON ou tomber à 0 PV).",icon:"🥋"},
      {name:"Voie de l'ombre",desc:"Niv.3 : Arts des ombres (2 ki : lancer ténèbres, vision dans le noir, passage sans trace ou silence). Niv.6 : Foulée d'ombre (téléportation 18m dans zone sombre, avantage à la prochaine attaque). Niv.11 : Linceul d'ombre (devenir invisible dans la pénombre par une action). Niv.17 : Opportuniste (réaction : attaquer une créature touchée par un allié).",icon:"🌑"},
      {name:"Voie des quatre éléments",desc:"Niv.3 : Disciple des éléments (Lien élémentaire + 1 discipline au choix, +1 aux niv.6/11/17). Disciplines : Déluge de coups via ki pour effets élémentaires (feu, eau, air, terre). Max ki/sort selon niveau (3 niv.5-8, 4 niv.9-12, 5 niv.13-16, 6 niv.17+).",icon:"🌊"},
    ],
    levelFeatures:{
      1:["Arts martiaux (1d4)","Défense sans armure (CA=10+DEX+SAG)"],
      2:["Ki (2 pts — Défense patiente, Déluge de coups, Déplacement aérien)","Déplacement sans armure (+3m)"],
      3:["Tradition monastique (choix)","Parade de projectiles"],
      4:["Amélioration de caractéristiques","Chute ralentie"],
      5:["Attaque supplémentaire","Arts martiaux 1d6","Frappe étourdissante (1 ki : JS CON ou étourdi)"],
      6:["Frappes de ki (attaques magiques)","Capacité de la tradition monastique"],
      7:["Esquive totale (aucun dégât sur JS DEX réussi)","Sérénité (action : fin charme/peur)"],
      8:["Amélioration de caractéristiques"],
      9:["Déplacement sans armure amélioré (marcher sur parois et surfaces liquides)"],
      10:["Pureté physique (immunité maladies et poisons)"],
      11:["Arts martiaux 1d8","Capacité de la tradition monastique"],
      12:["Amélioration de caractéristiques"],
      13:["Langue du soleil et de la lune (comprendre et être compris de tous)"],
      14:["Âme de diamant (maîtrise de tous les JS ; dépenser 1 ki pour relancer un JS raté)"],
      15:["Jeunesse éternelle (ne vieillit plus, n'a plus besoin de manger ni boire)"],
      16:["Amélioration de caractéristiques"],
      17:["Arts martiaux 1d10","Capacité de la tradition monastique"],
      18:["Désertion de l'âme (4 ki : invisible 1 min + résistance tous dégâts sauf force)"],
      19:["Amélioration de caractéristiques"],
      20:["Perfection de l'être (regagne 4 pts de ki si à 0 à l'initiative)"],
    },
    asiLevels:[4,8,12,16,19],
    archetypeLevel:3,
  },
  Paladin:{
    archetypes:[
      {name:"Serment de dévotion",desc:"Niv.3 : Conduit — Arme sacrée (+CHA aux attaques, arme lumineuse 1 min) / Renvoi des impies (JS SAG mort-vivants/fiélons ou renvoyés). Niv.7 : Aura de dévotion (immunité charme, 3m→9m niv.18). Niv.15 : Pureté de l'esprit (protection contre le mal et le bien en permanence). Niv.20 : Nimbe sacré (lumière 9m, 10 dégâts radiants aux ennemis au début de leur tour, avantage JS vs fiélons/mort-vivants).",icon:"⚔"},
      {name:"Serment des anciens",desc:"Niv.3 : Conduit — Courroux de la nature (vignes : Entravé, JS FOR/DEX) / Renvoi des infidèles (fées et fiélons : renvoyés). Niv.7 : Aura de garde (résistance dégâts de sorts, 3m→9m niv.18). Niv.15 : Sentinelle immortelle (1/repos long : passer à 1 PV au lieu de 0 PV). Niv.20 : Champion antique (1 min : soins 10 PV/tour, sorts en action bonus, désavantage JS ennemis à 3m).",icon:"🌿"},
      {name:"Serment de vengeance",desc:"Niv.3 : Conduit — Conspuer l'ennemi (JS SAG : cible effrayée ou vitesse divisée par 2) / Vœu d'hostilité (action bonus : avantage attaques contre une cible 1 min). Niv.7 : Vengeur implacable (attaque d'opportunité → déplacement ½ vitesse en réaction). Niv.15 : Âme vengeresse (réaction : attaquer la cible du vœu si elle attaque). Niv.20 : Ange de la vengeance (1 heure : vol 18m, aura peur 9m, avantage attaques contre créatures effrayées).",icon:"🗡"},
    ],
    levelFeatures:{
      1:["Sens divin (détecter célestes/fiélons/morts-vivants à 18m, 1+CHA fois/repos long)","Imposition des mains (niv×5 PV)"],
      2:["Style de combat","Incantation (CHA)","Châtiment divin"],
      3:["Santé divine (immunité maladies)","Serment sacré (choix)","Conduit divin (2 options selon serment)"],
      4:["Amélioration de caractéristiques"],
      5:["Attaque supplémentaire"],
      6:["Aura de protection (+CHA à tous les JS, alliés à 3m)"],
      7:["Capacité du serment sacré"],
      8:["Amélioration de caractéristiques"],
      9:[],
      10:["Aura de courage (immunité peur, alliés à 3m)"],
      11:["Châtiment divin amélioré (+1d8 radiant automatique sur toutes attaques)"],
      12:["Amélioration de caractéristiques"],
      13:[],
      14:["Contact purifiant (CHA fois/repos long : fin d'un sort sur soi ou allié touché)"],
      15:["Capacité du serment sacré"],
      16:["Amélioration de caractéristiques"],
      17:[],
      18:["Amélioration d'auras (auras de protection et courage : rayon 9m)"],
      19:["Amélioration de caractéristiques"],
      20:["Capacité du serment sacré"],
    },
    asiLevels:[4,8,12,16,19],
    archetypeLevel:3,
    styleLevel:2,
    spellsPerLevel:{2:1,3:1,5:1,7:1,9:1},
  },
  Rôdeur:{
    archetypes:[
      {name:"Chasseur",desc:"Niv.3 : Proie du chasseur (Tueur de colosses / Tueur de géants / Briseur de hordes). Niv.7 : Tactiques défensives (Échapper à la horde / Défense multi-attaques / Moral d'acier). Niv.11 : Attaques multiples (Volée / Attaque tourbillonnante). Niv.15 : Défense du chasseur supérieure (Esquive totale / Retour de bâton / Esquive instinctive).",icon:"🎯"},
      {name:"Maître des bêtes",desc:"Niv.3 : Compagnon du rôdeur (bête taille M max, CR≤1/4, maîtrise PV = 4×niv). Niv.7 : Entraînement exceptionnel (action bonus : commander + attaques magiques). Niv.11 : Fureur bestiale (le compagnon attaque 2× sur ordre). Niv.15 : Partage des sorts (un sort te ciblant affecte aussi le compagnon à 9m).",icon:"🐾"},
      {name:"Gardien de drake",desc:"Niv.3 : Compagnon drake (invoquer un drake élémentaire taille P, CA 14+BM, PV 5+5×niv, Coups imprégnés). Niv.7 : Lien du croc et d'écailles (drake taille M + ailes + tu peux le monter + résistance élémentaire). Niv.11 : Souffle de drake (cône 9m, 8d6→10d6 niv.15). Niv.15 : Lien parfait (drake taille G, résistance réflexive partagée).",icon:"🐉"},
    ],
    levelFeatures:{
      1:["Ennemi juré (1 type + langue)","Explorateur-né (1 terrain favori)"],
      2:["Style de combat","Incantation (SAG)"],
      3:["Archétype de rôdeur (choix)","Vigilance primitive (détecter créatures à 1,5km via emplacement de sort)"],
      4:["Amélioration de caractéristiques"],
      5:["Attaque supplémentaire"],
      6:["Ennemi juré amélioré (2ème type)","Explorateur-né amélioré (2ème terrain)"],
      7:["Capacité de l'archétype"],
      8:["Amélioration de caractéristiques","Foulée tellurique (terrain difficile non magique ne coûte plus de mouvement)"],
      9:[],
      10:["Explorateur-né amélioré (3ème terrain)","Camouflage naturel (+10 Discrétion immobile)"],
      11:["Capacité de l'archétype"],
      12:["Amélioration de caractéristiques"],
      13:[],
      14:["Ennemi juré amélioré (3ème type)","Disparition (Se cacher en action bonus)"],
      15:["Capacité de l'archétype"],
      16:["Amélioration de caractéristiques"],
      17:[],
      18:["Sens sauvages (attaquer l'invisible sans désavantage, position des créatures invisibles à 9m)"],
      19:["Amélioration de caractéristiques"],
      20:["Tueur implacable (ajouter mod SAG à attaque ou dégâts vs ennemi juré, 1/tour)"],
    },
    asiLevels:[4,8,12,16,19],
    archetypeLevel:3,
    styleLevel:2,
    spellsPerLevel:{2:1,3:1,5:1,7:1,9:1},
  },
  Roublard:{
    archetypes:[
      {name:"Voleur",desc:"Niv.3 : Mains lestes (utiliser Ruse pour objet, pickpocket, kit de crochetage), Monte-en-l'air (Foncer en action bonus = escalade vitesse normale, saut bonus, rester agile). Niv.9 : Discrétion suprême (se cacher si légèrement obscurci). Niv.13 : Utilisation d'objets magiques (utiliser objets magiques sans conditions de classe/race). Niv.17 : Réflexes de voleur (toujours agir au premier tour de surprise, deux actions au 1er tour si non surpris).",icon:"🎭"},
      {name:"Escroc arcanique",desc:"Niv.3 : Incantation (INT, sorts d'enchantement et d'illusion), main de mage invisible (gratuite, invisible, action bonus). Niv.9 : Embuscade magique (cible du sort désavantagée au JS si caché). Niv.13 : Escroc polyvalent (main de mage : une action par tour supplémentaire). Niv.17 : Voleur de sort (réaction : contre-sort, utiliser le sort contre la cible ou le conserver).",icon:"🔮"},
      {name:"Assassin",desc:"Niv.3 : Maîtrise kit de déguisement/empoisonneur, Assassinat (avantage sur créature n'ayant pas encore agi, coup critique si surprise). Niv.9 : Expert en infiltration (créer de fausses identités, faux papiers). Niv.13 : Imposteur (dupliquer apparence/voix d'une personne étudiée 3h). Niv.17 : Frappe meurtrière (si Attaque sournoise : cible doit réussir CON DD 8+maîtrise+DEX ou tomber à 0 PV).",icon:"🗡"},
      {name:"Conspirateur",desc:"Niv.3 : Maître des intrigues (maîtrises kit déguisement, faussaire, jeu et deux langues), Maître des tactiques (action Aider en action bonus à portée 9m). Niv.9 : Manipulateur perspicace (Intuition/Tromperie doublement maîtrisées, lire les actions d'une cible). Niv.13 : Redirection (réaction : détourner une attaque contre toi vers une autre créature à 1,5m). Niv.17 : Âme de trompeur (résistance psychiques, avantage contre magie de charme/terreur).",icon:"🕵"},
    ],
    levelFeatures:{
      1:["Attaque sournoise (1d6)","Expertise (2×maîtrise sur 2 comp.)","Jargon des voleurs"],
      2:["Ruse (action bonus: Foncer/Désengager/Se cacher)"],
      3:["Archétype (choix)","Attaque sournoise (2d6)"],
      4:["Amélioration de caractéristiques"],
      5:["Attaque sournoise (3d6)","Esquive instinctive (réaction : réduire dégâts d'une attaque de moitié)"],
      6:["Expertise (2 autres compétences)"],
      7:["Attaque sournoise (4d6)","Esquive totale (JS DEX réussi = 0 dégâts)"],
      8:["Amélioration de caractéristiques"],
      9:["Attaque sournoise (5d6)","Capacité de l'archétype"],
      10:["Amélioration de caractéristiques"],
      11:["Attaque sournoise (6d6)","Savoir-faire (tout jet de compétence maîtrisé min 10)"],
      12:["Amélioration de caractéristiques"],
      13:["Attaque sournoise (7d6)","Capacité de l'archétype"],
      14:["Perception aveugle (créatures cachées/invisibles à 3m)"],
      15:["Attaque sournoise (8d6)","Esprit fuyant (maîtrise JS SAG)"],
      16:["Amélioration de caractéristiques"],
      17:["Attaque sournoise (9d6)","Capacité de l'archétype"],
      18:["Insaisissable"],
      19:["Amélioration de caractéristiques","Attaque sournoise (10d6)"],
      20:["Coup de chance"],
    },
    asiLevels:[4,8,10,12,16,19],
    archetypeLevel:3,
  },
  Ensorceleur:{
    archetypes:[
      {name:"Origine draconique",desc:"Ancêtre dragon (type au choix). Niv.1 : CA 13+DEX, parle draconique, PV max +1/niveau (Résistance draconique). Niv.6 : Affinité élémentaire (bonus dégâts + résistance). Niv.14 : Ailes draconiques. Niv.18 : Présence draconique.",icon:"🐉"},
      {name:"Magie sauvage",desc:"Surtension de magie sauvage (MJ lance 1d20 après un sort niv1+, sur 1: effet aléatoire). Niv.1 : Marée du chaos (avantage sur un jet, jusqu'à prochaine surtension). Niv.6 : Chance forcée (2 pts : impose désavantage/avantage sur le jet d'une cible). Niv.14 : Chaos contrôlé (choisir parmi 2 effets de surtension). Niv.18 : Bombardement de sort (relancer les 1 aux dégâts).",icon:"🌀"},
    ],
    levelFeatures:{
      1:["Incantation","Origine d'ensorceleur (choix) — capacité immédiate selon l'origine"],
      2:["Points de sorcellerie (2 pts)","Magie flexible (convertir emplacements↔points de sorcellerie)"],
      3:["Métamagie (2 options au choix)"],
      4:["Amélioration de caractéristiques","1 sort mineur supplémentaire"],
      5:[],
      6:["Capacité de l'origine (niv.6)"],
      7:[],
      8:["Amélioration de caractéristiques"],
      9:[],
      10:["Métamagie (3e option)","1 sort mineur supplémentaire"],
      11:[],
      12:["Amélioration de caractéristiques"],
      13:[],
      14:["Capacité de l'origine (niv.14)"],
      15:[],
      16:["Amélioration de caractéristiques"],
      17:["Métamagie (4e option)"],
      18:["Capacité de l'origine (niv.18)"],
      19:["Amélioration de caractéristiques"],
      20:["Restauration d'ensorceleur (1/repos court : récupère 4 pts de sorcellerie)"],
    },
    asiLevels:[4,8,12,16,19],
    archetypeLevel:1,
    spellsPerLevel:{1:2,2:1,3:1,4:2,5:1,6:1,7:1,8:1,9:1,10:2,11:1,13:1,15:1,17:1},
    cantripAtLevels:[4,10],
    metamagicOptions:[
      {name:"Magie prudente",desc:"Dépense 1 pt : les créatures choisies réussissent automatiquement leur JS contre ton sort."},
      {name:"Magie distante",desc:"Dépense 1 pt : double la portée du sort (min 9m si contact)."},
      {name:"Magie renforcée",desc:"Dépense 1 pt : relance jusqu'à CHA dés de dégâts du sort (garder le nouveau résultat)."},
      {name:"Magie étendue",desc:"Dépense 1 pt : double la durée du sort (maximum 24h)."},
      {name:"Magie intensifiée",desc:"Dépense 3 pts : la cible a désavantage au JS contre ton sort."},
      {name:"Magie promptive",desc:"Dépense 2 pts : lancer un sort (temps de lancement 1 action) comme action bonus si l'autre sort de ce tour est un cantrip."},
      {name:"Magie subtile",desc:"Dépense 1 pt : lancer sans composante verbale ni somatique."},
      {name:"Magie jumelle",desc:"Dépense des points égaux au niveau du sort (1 min pour cantrip) : cibler une 2ème créature admissible."},
    ],
  },
  Occultiste:{
    archetypes:[
      {name:"L'Archifée",desc:"Niv.1 : Présence féerique (action : charmer ou effrayer dans un cube 3m, JS SAG, 1/repos). Niv.6 : Échappatoire brumeuse (réaction sur dégâts : invisible + téléportation 18m, 1/repos). Niv.10 : Défenses captivantes (immunité charme + retourner le charme contre l'attaquant). Niv.14 : Sombre délire (action : charmer/effrayer concentr. 1 min, illusion immersive).",icon:"🧚"},
      {name:"Le Fiélon",desc:"Niv.1 : Bénédiction du ténébreux (tuer une créature hostile → PV temporaires = CHA + niveau). Niv.6 : Chance du ténébreux (ajouter 1d10 à un jet de carac. ou sauvegarde, 1/repos). Niv.10 : Résistance fiélonne (choisir 1 type de dégâts par repos, résistance à ce type). Niv.14 : Traversée des enfers (toucher → cible disparaît 1 tour dans les plans inférieurs, 10d10 dégâts psychiques au retour).",icon:"😈"},
      {name:"Le Grand Ancien",desc:"Niv.1 : Esprit éveillé (télépathie à 9m vers toute créature comprenant une langue). Niv.6 : Protection entropique (réaction : désavantage à l'attaquant + avantage en retour si l'attaque rate, 1/repos). Niv.10 : Bouclier mental (immunité lecture de pensées, résistance dégâts psychiques). Niv.14 : Asservissement (toucher un humanoïde incapable d'agir → charme permanent + télépathie).",icon:"🐙"},
      {name:"Le Génie",desc:"Niv.1 : Catalyseur de Génie (focaliseur + Répit embouteillé : entrer dans le catalyseur pour se cacher/reposer + Ire du génie : +maîtrise dégâts élémentaires 1/tour). Niv.6 : Présent élémentaire (résistance élémentaire + vol 9m × maîtrise/repos long). Niv.10 : Sanctuaire du génie (5 alliés dans le catalyseur, repos court amélioré). Niv.14 : Souhait limité (1 sort niv.≤6 sans composantes, 1/1d4 repos longs).",icon:"🌟"},
    ],
    levelFeatures:{
      1:["Patron d'Outremonde (choix)","Magie de pacte (1 emplacement niv.1)"],
      2:["Manifestations occultes (2 au choix)","Magie de pacte (2 emplacements niv.1)"],
      3:["Faveur de pacte (choix: Chaîne / Lame / Grimoire)","Emplacements de sorts niv.2"],
      4:["Amélioration de caractéristiques"],
      5:["Manifestations occultes (3 total)","Emplacements niv.3"],
      6:["Capacité du patron d'Outremonde","Manifestations occultes (3 total)"],
      7:["Manifestations occultes (4 total)","Emplacements niv.4"],
      8:["Amélioration de caractéristiques"],
      9:["Manifestations occultes (5 total)","Emplacements niv.5"],
      10:["Capacité du patron d'Outremonde"],
      11:["Arcanum mystique niv.6 (1/repos long sans emplacement)","Emplacements : 3"],
      12:["Amélioration de caractéristiques","Manifestations occultes (6 total)"],
      13:["Arcanum mystique niv.7"],
      14:["Capacité du patron d'Outremonde"],
      15:["Arcanum mystique niv.8","Manifestations occultes (7 total)"],
      16:["Amélioration de caractéristiques"],
      17:["Arcanum mystique niv.9","Emplacements : 4"],
      18:["Manifestations occultes (8 total)"],
      19:["Amélioration de caractéristiques"],
      20:["Maître de l'occulte (1/repos long : 1 min → récup. tous emplacements Magie de pacte)"],
    },
    asiLevels:[4,8,12,16,19],
    archetypeLevel:1,
    spellsPerLevel:{1:2,2:1,3:1,4:1,5:1,6:1,7:1,8:1,9:1,11:1,13:1,15:1,17:1,19:1},
  },
  Magicien:{
    archetypes:[
      {name:"École d'abjuration",desc:"Niv.2 : Protection arcanique (bouclier PV = 2×niv+INT, absorbe dégâts). Niv.6 : Protection projetée (reporter le bouclier sur un allié à 9m). Niv.10 : Abjuration améliorée (+maîtrise aux jets de carac. d'abjuration). Niv.14 : Résistance aux sorts (avantage JS vs sorts + résistance dégâts de sorts).",icon:"🛡"},
      {name:"École de divination",desc:"Niv.2 : Présage (2 d20 après repos long, remplacer n'importe quel jet avant le lancer). Niv.6 : Divination experte (récup. emplacement inférieur en lançant une divination niv.2+). Niv.10 : Troisième œil (lire toutes langues / vision nocturne 18m / vision éthérée / voir invisible). Niv.14 : Présage supérieur (3 d20 au lieu de 2).",icon:"🔮"},
      {name:"École d'enchantement",desc:"Niv.2 : Regard hypnotique (charmer une créature à 1,5m, JS SAG, action). Niv.6 : Charme instinctif (réaction : dévier une attaque vers une autre cible, JS SAG). Niv.10 : Partage d'enchantement (cibler 2 créatures avec un sort d'enchantement). Niv.14 : Altération mémorielle (effacer jusqu'à 1+CHA heures de mémoire charmée).",icon:"💜"},
      {name:"École d'évocation",desc:"Niv.2 : Façonneur de sorts (protéger 1+niv. du sort alliés des effets de zone). Niv.6 : Sort mineur puissant (demi-dégâts même sur JS réussi). Niv.10 : Évocation améliorée (+INT à un jet de dégâts par sort d'évocation). Niv.14 : Surcharge magique (dégâts max avec un sort niv.1-5 ; réutilisation → 2d12 nécrotiques/niveau).",icon:"🔥"},
      {name:"École d'illusion",desc:"Niv.2 : Illusion mineure améliorée (créer son + image simultanément). Niv.6 : Illusions malléables (modifier une illusion active par une action). Niv.10 : Double illusoire (réaction : faire manquer une attaque, 1/repos court). Niv.14 : Réalité illusoire (rendre un objet illusoire réel pendant 1 min).",icon:"🌀"},
      {name:"École d'invocation",desc:"Niv.2 : Invocation mineure (invoquer un objet ≤5kg à 3m). Niv.6 : Permutation (téléportation 9m ou échange de place avec créature consentante P/M). Niv.10 : Invocation consciencieuse (concentration ne se brise pas en prenant des dégâts). Niv.14 : Convocations coriaces (créatures invoquées gagnent 30 PV temporaires).",icon:"✨"},
      {name:"École de nécromancie",desc:"Niv.2 : Sinistre moisson (récup. 2×niveau du sort en PV en tuant par un sort). Niv.6 : Serviteurs morts-vivants (morts-vivants animés gagnent PV+niv. et bonus maîtrise aux dégâts). Niv.10 : Insensibilité à la non-vie (résistance dégâts nécrotiques, PV max non réductible). Niv.14 : Contrôle des morts-vivants (contrôler tout mort-vivant visible à 18m).",icon:"💀"},
      {name:"École de transmutation",desc:"Niv.2 : Alchimie mineure (transmuter temporairement bois/pierre/fer/cuivre/argent). Niv.6 : Pierre du transmutateur (vitesse / résistance / vision nocturne / maîtrise JS CON). Niv.10 : Métamorphe (lancer métamorphose 1/repos sans emplacement sur soi en bête CR≤1). Niv.14 : Maître transmutateur (consommer la pierre → jouvence / panacée / rappel à la vie / transformation majeure).",icon:"⚗"},
    ],
    levelFeatures:{
      1:["Incantation (grimoire: 6 sorts niv.1 + 3 mineurs)","Restauration arcanique (1/repos court)"],
      2:["Tradition arcanique (choix)","Capacité de la tradition"],
      3:["2 sorts niv.1-2 au grimoire"],
      4:["Amélioration de caractéristiques","1 sort mineur supplémentaire"],
      5:["2 sorts niv.1-3 au grimoire"],
      6:["Capacité de la tradition","2 sorts niv.1-3 au grimoire"],
      7:["2 sorts niv.1-4 au grimoire"],
      8:["Amélioration de caractéristiques","2 sorts niv.1-4 au grimoire"],
      9:["2 sorts niv.1-5 au grimoire"],
      10:["Capacité de la tradition","1 sort mineur supp.","2 sorts niv.1-5 au grimoire"],
      11:["2 sorts niv.1-6 au grimoire"],
      12:["Amélioration de caractéristiques","2 sorts niv.1-6 au grimoire"],
      13:["2 sorts niv.1-7 au grimoire"],
      14:["Capacité de la tradition","2 sorts niv.1-7 au grimoire"],
      15:["2 sorts niv.1-8 au grimoire"],
      16:["Amélioration de caractéristiques","2 sorts niv.1-8 au grimoire"],
      17:["2 sorts niv.1-9 au grimoire"],
      18:["Maîtrise des sorts (lancer niv.1-2 sans emplacement)","2 sorts niv.1-9 au grimoire"],
      19:["Amélioration de caractéristiques"],
      20:["Sorts de prédilection (2 sorts préparés qui ne comptent pas)"],
    },
    asiLevels:[4,8,12,16,19],
    archetypeLevel:2,
    spellsPerLevel:{1:2,2:2,3:2,4:3,5:2,6:2,7:2,8:2,9:2,10:3,11:2,12:2,13:2,14:2,15:2,16:2,17:2,18:2,19:2,20:2},
    cantripAtLevels:[4,10],
  },
  Artificier:{
    archetypes:[
      {name:"Alchimiste",desc:"Extraits alchimiques au niv.3 (soins, acide, feu, vapeur). Formules améliorées au niv.5 et 9.",icon:"⚗"},
      {name:"Artilleur",desc:"Canon arcanique au niv.3 (choc, feu ou protection). Canon amélioré au niv.9.",icon:"💥"},
      {name:"Forgeron de bataille",desc:"Compagnon d'acier (CA=13+maîtrise). Arme de pacte niv.3. Magie défensive niv.9.",icon:"🤖"},
      {name:"Maître armurier",desc:"Armure de gardien ou d'infiltrateur. Améliorations aux niveaux 9 et 15.",icon:"🛡"},
    ],
    levelFeatures:{
      1:["Bricolage magique","Incantation (INT)"],
      2:["Infuser un objet (4 formules, 2 actives)"],
      3:["Spécialité d'artificier (choix)","Le bon outil pour le travail"],
      4:["Amélioration de caractéristiques"],
      5:["Attaque supplémentaire","Sorts du spécialiste niv.3"],
      6:["Expertise en outils"],
      7:["Éclair de génie (réaction : +INT à un jet raté)"],
      8:["Amélioration de caractéristiques","Infusions (6 formules, 4 actives)"],
      9:["Capacité du spécialiste","Sorts niv.5"],
      10:["Expert en objets magiques (3 attuned supplémentaires)","Infusions (8 formules, 4 actives)"],
      11:["Objet stocke-sort"],
      12:["Amélioration de caractéristiques","Infusions (10 formules, 5 actives)"],
      13:["Sorts niv.7"],
      14:["Savant en objets magiques (4 attuned)","Infusions (10 formules, 6 actives)"],
      15:["Capacité du spécialiste","Sorts niv.9"],
      16:["Amélioration de caractéristiques","Infusions (12 formules, 6 actives)"],
      17:[],
      18:["Maître des objets magiques (5 attuned)"],
      19:["Amélioration de caractéristiques"],
      20:["Âme d'artifice (+1 à tous JS, 5 infusions simultanées)"],
    },
    asiLevels:[4,8,12,16,19],
    archetypeLevel:3,
    spellsPerLevel:{1:2,3:1,5:1,9:1,13:1,15:1,17:1,19:1},
  },
};

// ═══════════════════════════════════════
// GESTIONNAIRE MONTÉE DE NIVEAU
// ═══════════════════════════════════════
let LU={
  step:1,steps:[],choice:null,mcTarget:null,
  asiChoice:null,archetypeChoice:null,styleChoice:null,terrainChoice:null,
  metamagicChoices:[],newSpells:[],
  expertiseChoices:[],secretsChoices:[],mcSkillChoices:[],invocationChoices:[],
};
function resetLU(){LU={step:1,steps:[],choice:null,mcTarget:null,asiChoice:null,archetypeChoice:null,styleChoice:null,terrainChoice:null,metamagicChoices:[],newSpells:[],expertiseChoices:[],secretsChoices:[],mcSkillChoices:[],invocationChoices:[]};_luSpellSearch='';_luSecretsSearch='';}

const DRUID_CIRCLE_FEATS={
  'Cercle de la lune':{
    6:{name:'Frappe primitive',desc:'Tes attaques en forme animale sont considérées comme magiques et ignorent les résistances aux dégâts non magiques.'},
    10:{name:'Forme élémentaire',desc:'Tu peux dépenser 2 utilisations de Forme sauvage pour te transformer en un élémentaire de CR 5 ou moins (air, eau, terre, feu).'},
    14:{name:'Mille formes',desc:"Tu peux utiliser Modification d'apparence à volonté (action bonus)."}
  },
  'Cercle des terres':{
    6:{name:'Foulée tellurique',desc:'Les terrains difficiles non-magiques ne te coûtent pas de déplacement supplémentaire.'},
    10:{name:'Protégée de dame Nature',desc:'Immunité aux poisons et maladies. Résistance aux types élémentaires. Insensible au charme et à la peur des fées et élémentaires.'},
    14:{name:'Sanctuaire de dame Nature',desc:"Les bêtes et plantes doivent réussir un JS Sagesse DD 8+maîtrise+SAG pour t'attaquer, sinon elles choisissent une autre cible."}
  }
};
function _resolveDruidCircleFeat(featName,circleArchetype,level){
  if(featName!=='Capacité du cercle')return null;
  const circleFeat=circleArchetype&&DRUID_CIRCLE_FEATS[circleArchetype];
  return circleFeat&&circleFeat[level]?circleFeat[level]:null;
}

const DRUID_CIRCLE_SPELLS={
  'Arctique':[
    {name:'Immobilisation de personne',level:2},{name:'Spike Growth',level:2},
    {name:'Tempête de grésil',level:3},{name:'Lenteur',level:3},
    {name:'Liberté de mouvement',level:4},{name:'Tempête de glace',level:4},
    {name:'Communion avec la nature',level:5},{name:'Cône de froid',level:5}
  ],
  'Désert':[
    {name:'Flou',level:2},{name:'Silence',level:2},
    {name:"Création de nourriture et d'eau",level:3},{name:"Protection contre l'énergie",level:3},
    {name:'Flétrissement',level:4},{name:'Terrain hallucinatoire',level:4},
    {name:"Nuée d'insectes",level:5},{name:'Mur de pierre',level:5}
  ],
  'Forêt':[
    {name:"Peau d'écorce",level:2},{name:'Escalade',level:2},
    {name:'Appel de la foudre',level:3},{name:'Croissance végétale',level:3},
    {name:'Localisation de créature',level:4},{name:'Métamorphose',level:4},
    {name:'Communion avec la nature',level:5},{name:'Déplacement sylvestre',level:5}
  ],
  'Littoral':[
    {name:'Image miroir',level:2},{name:'Foulée brumeuse',level:2},
    {name:'Respiration aquatique',level:3},{name:"Marche sur l'eau",level:3},
    {name:"Contrôle de l'eau",level:4},{name:'Liberté de mouvement',level:4},
    {name:"Invocation d'élémentaire",level:5},{name:'Scrutation',level:5}
  ],
  'Marais':[
    {name:'Flèche acide de Melf',level:2},{name:'Ténèbres',level:2},
    {name:"Marche sur l'eau",level:3},{name:'Nuage nauséabond',level:3},
    {name:'Liberté de mouvement',level:4},{name:'Localisation de créature',level:4},
    {name:"Nuée d'insectes",level:5},{name:'Scrutation',level:5}
  ],
  'Montagne':[
    {name:'Escalade',level:2},{name:'Spike Growth',level:2},
    {name:'Meld Into Stone',level:3},{name:'Éclair',level:3},
    {name:'Façonnage de la pierre',level:4},{name:'Peau de pierre',level:4},
    {name:'Passage dans les pierres',level:5},{name:'Transmutation de la roche',level:5}
  ],
  'Outreterre':[
    {name:'Escalade',level:2},{name:'Toile',level:2},
    {name:'Forme gazeuse',level:3},{name:'Nuage nauséabond',level:3},
    {name:'Invisibilité supérieure',level:4},{name:'Façonnage de la pierre',level:4},
    {name:"Nuée d'insectes",level:5},{name:'Nuage mortel',level:5}
  ],
  'Plaine':[
    {name:'Invisibilité',level:2},{name:'Pass without Trace',level:2},
    {name:'Lumière du jour',level:3},{name:'Hâte',level:3},
    {name:'Divination',level:4},{name:'Liberté de mouvement',level:4},
    {name:'Rêve',level:5},{name:"Nuée d'insectes",level:5}
  ]
};

function getDruidCircleSpells(p){
  const druEntry=(p.classes||[]).find(c=>c.name==='Druide');
  if(!druEntry||druEntry.level<3)return[];
  const arch=(p.archetype||{})['Druide']||'';
  if(!arch.toLowerCase().includes('terres'))return[];
  const terrain=p.druidTerrain||'';
  if(!terrain)return[];
  const spells=DRUID_CIRCLE_SPELLS[terrain]||[];
  const druLvl=druEntry.level;
  const maxSlotLvl=druLvl>=9?5:druLvl>=7?4:druLvl>=5?3:2;
  return spells.filter(s=>s.level<=maxSlotLvl);
}

// Calcule les étapes nécessaires pour cette montée de niveau
function calcLUSteps(p,className,newClassLevel){
  const cd=CLASS_LEVEL_DATA[className];
  const steps=['direction'];
  if(cd){
    const isASI=cd.asiLevels&&cd.asiLevels.includes(newClassLevel);
    const isArchetype=cd.archetypeLevel===newClassLevel;
    const isStyle=cd.styleLevel===newClassLevel;
    const _PREPARED=['Clerc','Druide','Paladin'];
    const needSpells=!_PREPARED.includes(className)&&cd.spellsPerLevel&&cd.spellsPerLevel[newClassLevel];
    const isMetamagic=className==='Ensorceleur'&&[3,10,17].includes(newClassLevel);
    const isOrigin=className==='Ensorceleur'&&newClassLevel===1;
    const _EXPERTISE_LVL={'Barde':[3,10],'Roublard':[1,6]};
    const needExpertise=_EXPERTISE_LVL[className]&&_EXPERTISE_LVL[className].includes(newClassLevel);
    const needSecrets=className==='Barde'&&[9,14,18].includes(newClassLevel);
    const needInvocations=className==='Occultiste'&&[2,5,7,9,12,15,18].includes(newClassLevel);
    if(isStyle)steps.push('style');
    if(isArchetype||isOrigin)steps.push('archetype');
    if(isASI)steps.push('asi');
    if(needExpertise)steps.push('expertise');
    if(needSpells)steps.push('spells');
    if(needSecrets)steps.push('secretsMagiques');
    if(isMetamagic)steps.push('metamagic');
    if(needInvocations)steps.push('invocations');
  }
  steps.push('recap');
  return steps;
}

function tabLevelUp(p){
  const lvl=totalLevel(p);const newLvl=lvl+1;const mc=mainClass(p);
  const stepLabels={direction:'Direction',style:'Style de combat',archetype:'Archétype',asi:'Amélioration',expertise:'Expertise',spells:'Sorts',secretsMagiques:'Secrets Magiques',metamagic:'Métamagie',mcSkill:'Compétence',invocations:'Invocations',recap:'Confirmation'};

  const displaySteps=LU.steps.length?LU.steps:['direction','recap'];
  const progress=LU.steps.length>1?`<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:16px">
    ${displaySteps.map((s,i)=>`<span class="cp-step${i<LU.step-1?' done':i===LU.step-1?' active':''}">${i<LU.step-1?'✓ ':''+(i+1)+'. '}${stepLabels[s]||s}</span>${i<displaySteps.length-1?'<span style="color:var(--text3);font-size:10px;align-self:center">›</span>':''}`).join('')}
  </div>`:'';

  const curStep=LU.steps[LU.step-1]||'direction';
  let content='';
  if(curStep==='direction')content=luStepDirection(p,newLvl,mc);
  else if(curStep==='style')content=luStepStyle(p);
  else if(curStep==='archetype')content=luStepArchetype(p);
  else if(curStep==='asi')content=luStepASI(p);
  else if(curStep==='expertise')content=luStepExpertise(p);
  else if(curStep==='spells')content=luStepSpells(p);
  else if(curStep==='secretsMagiques')content=luStepSecretsM(p);
  else if(curStep==='metamagic')content=luStepMetamagic(p);
  else if(curStep==='mcSkill')content=luStepMcSkill(p);
  else if(curStep==='invocations')content=luStepInvocations(p);
  else if(curStep==='recap')content=luStepRecap(p,newLvl);

  return`<div class="creation-wrap"><div class="panel">
    <div class="pt" style="color:#ffd54f;font-size:15px">⬆ Passage au niveau ${newLvl}</div>
    ${progress}
    ${content}
  </div></div>`;
}

function luStepDirection(p,newLvl,mc){
  const isMultiClass=LU.choice==='multiclass';
  return`<div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:14px">Ton personnage gagne un niveau ! Comment souhaites-tu progresser ?</p>
    ${mc?`<div class="lu-choice${LU.choice==='continue'?' selected':''}" onclick="LU.choice='continue';renderTab()">
      <h3>📈 Continuer en ${esc(mc.name)}</h3>
      <p>Passer au niveau ${(p.classes.find(c=>c.name===mc.name)||{level:1}).level+1} de ${esc(mc.name)}. Nouvelles capacités garanties.</p>
    </div>`:''}
    <div class="lu-choice${LU.choice==='multiclass'?' selected':''}" onclick="LU.choice='multiclass';LU.mcTarget=null;renderTab()">
      <h3>🔀 Se multiclasser</h3>
      <p>Commencer une nouvelle classe. Les prérequis de caractéristiques s'appliquent.</p>
    </div>
    ${LU.choice==='multiclass'?`<div style="margin-top:12px"><p style="font-size:12px;color:var(--text2);margin-bottom:10px">Choisis la classe (vert = prérequis OK) :</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${SRD.classes.map(c=>{
      const alr=(p.classes||[]).find(cl=>cl.name===c.name);
      const req=checkMcReq(p,c.name);
      return`<div style="background:var(--surface2);border:2px solid ${LU.mcTarget===c.name?'var(--cp)':req.ok?'var(--border)':'var(--border)'};border-radius:8px;padding:10px;cursor:${req.ok?'pointer':'not-allowed'};opacity:${req.ok?1:.4};text-align:center;transition:all .2s" onclick="${req.ok?`LU.mcTarget='${esc(c.name)}';renderTab()`:''}">
        <div style="font-family:var(--F);font-size:12px;color:var(--cp)">${esc(c.name)}</div>
        <div style="font-size:10px;color:var(--text3)">${c.hd}${c.spellcaster?' ✦':''}</div>
        ${alr?`<div style="font-size:10px;color:#4caf50">Niv.${alr.level}</div>`:''}
        ${req.ok?`<div style="font-size:10px;color:#4caf50">✓</div>`:`<div style="font-size:10px;color:#e53935">${req.msg}</div>`}
      </div>`;}).join('')}</div></div>`:''}
    ${LU.choice&&(LU.choice==='continue'||(LU.choice==='multiclass'&&LU.mcTarget))?`<button class="btn bac" style="margin-top:14px;width:100%" onclick="luDirectionNext()">Continuer →</button>`:''}
  </div>`.replace('p_placeholder','');
}

function luDirectionNext(){
  const p=P();const mc=mainClass(p);
  if(LU.choice==='continue'&&mc){
    const entry=p.classes.find(c=>c.name===mc.name);
    const newCLvl=(entry?entry.level:1)+1;
    LU.steps=calcLUSteps(p,mc.name,newCLvl);
  } else if(LU.choice==='multiclass'&&LU.mcTarget){
    const d=SRD.classes.find(c=>c.name===LU.mcTarget);
    const steps=['direction'];
    if(d&&d.mcSkillCount)steps.push('mcSkill');
    steps.push('recap');
    LU.steps=steps;
  } else {return;}
  LU.step=2;renderTab();
}

// ── Style de combat ──
function luStepStyle(p){
  const mc=mainClass(p);const cd=mc?CLASS_LEVEL_DATA[mc.name]:null;
  const styles=cd&&cd.combatStyles?cd.combatStyles:[];
  return`<div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:12px">Choisis ton style de combat. Ce choix est permanent.</p>
    ${styles.map(s=>`<div class="lu-choice${LU.styleChoice===s.name?' selected':''}" onclick="LU.styleChoice='${esc(s.name)}';renderTab()">
      <h3>${esc(s.name)}</h3><p>${esc(s.desc)}</p>
    </div>`).join('')}
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn" style="flex:1" onclick="LU.step--;renderTab()">← Retour</button>
      <button class="btn bac" style="flex:2" onclick="LU.step++;renderTab()" ${LU.styleChoice?'':'disabled'}>Continuer →</button>
    </div>
  </div>`;
}

// ── Archétype ──
function luStepArchetype(p){
  const mc=mainClass(p);const cd=mc?CLASS_LEVEL_DATA[mc.name]:null;
  const archs=cd&&cd.archetypes?cd.archetypes:[];
  window._luArchs=archs;
  const isDruide=mc&&mc.name==='Druide';
  const needsTerrain=isDruide&&LU.archetypeChoice==='Cercle des terres';
  const terrains=['Arctique','Désert','Forêt','Littoral','Marais','Montagne','Outreterre','Plaine'];
  const canContinue=LU.archetypeChoice&&(!needsTerrain||LU.terrainChoice);
  const terrainSection=needsTerrain?`<div style="margin-top:12px;padding:10px;background:var(--surface2);border-radius:10px">
    <div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:8px">🗺 Choisis ton terrain</div>
    <div style="font-size:11px;color:var(--text3);margin-bottom:8px">Détermine tes sorts de cercle — toujours préparés, ne comptent pas dans le quota.</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      ${terrains.map(t=>`<button class="btn bsm${LU.terrainChoice===t?' bprimary':''}" onclick="LU.terrainChoice='${t}';renderTab()">${t}</button>`).join('')}
    </div>
  </div>`:'';
  return`<div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:12px">Choisis ton archétype pour ${esc(mc?mc.name:'')}. Ce choix est permanent.</p>
    ${archs.map((a,i)=>`<div class="lu-choice${LU.archetypeChoice===a.name?' selected':''}" onclick="LU.archetypeChoice=window._luArchs[${i}].name;LU.terrainChoice=null;renderTab()">
      <h3>${a.icon} ${esc(a.name)}</h3><p>${esc(a.desc)}</p>
    </div>`).join('')}
    ${terrainSection}
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn" style="flex:1" onclick="LU.step--;renderTab()">← Retour</button>
      <button class="btn bac" style="flex:2" onclick="LU.step++;renderTab()" ${canContinue?'':'disabled'}>Continuer →</button>
    </div>
  </div>`;
}

// ── ASI ──
function luStepASI(p){
  const ab=p.abilities||[10,10,10,10,10,10];
  const choice=LU.asiChoice||{type:'double',stats:[],val:1};
  const isFeat=choice.type==='feat';
  const valid=isFeat?!!choice.featName:(choice.type==='asi'&&choice.stats.length===1)||(choice.type==='double'&&choice.stats.length===2);

  const featSection=isFeat?(FEATS_DB?`
    <input class="fi" id="featSearch" placeholder="Rechercher un don (ex: Alert, Actor...)..." oninput="luFilterFeats(this.value)" style="margin-bottom:8px">
    ${choice.featName?`<div style="padding:10px;background:rgba(76,175,80,.1);border:1px solid #4caf50;border-radius:8px;margin-bottom:8px">
      <div style="font-size:13px;font-weight:600;color:#4caf50">✓ ${esc(choice.featName)}</div>
      <div style="font-size:11px;color:var(--text2);margin-top:4px">${esc((FEATS_DB.find(f=>f.n===choice.featName)||{}).tx||'')}</div>
      <button class="btn bsm" style="margin-top:6px;font-size:11px" onclick="LU.asiChoice.featName='';renderTab()">Changer</button>
    </div>`:''}
    <div id="featResults"></div>
  `:`<div style="text-align:center;padding:14px;color:var(--text3);font-size:12px">Compendium non chargé — patiente un instant puis reviens à cet écran.</div>`):'';

  return`<div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:12px">Amélioration de caractéristiques — Choisis l'une des options :</p>
    <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">
      <button class="smb${!LU.asiChoice||LU.asiChoice.type==='double'?' on':''}" onclick="LU.asiChoice={type:'double',stats:[],val:1};renderTab()">+1 à deux stats</button>
      <button class="smb${LU.asiChoice&&LU.asiChoice.type==='asi'?' on':''}" onclick="LU.asiChoice={type:'asi',stats:[],val:2};renderTab()">+2 à une stat</button>
      <button class="smb${isFeat?' on':''}" onclick="LU.asiChoice={type:'feat',featName:'',stats:[],val:0};if(!FEATS_DB)loadFeatsDB(()=>renderTab());else renderTab()">🎯 Prendre un Don</button>
    </div>
    ${isFeat?featSection:`
      <p style="font-size:12px;color:var(--text3);margin-bottom:10px">Maximum 20. Clique sur les caractéristiques à améliorer :</p>
      <div class="g6">
        ${ABILITIES.map((ab_name,i)=>{
          const cur=ab[i];const isSel=choice.stats.includes(i);const atMax=cur>=20;
          const canSel=!isSel&&((choice.type==='double'&&choice.stats.length<2)||(choice.type==='asi'&&choice.stats.length<1));
          const bonus=isSel?choice.val:0;
          return`<div class="sb hi${isSel?' selected':''}" style="cursor:${atMax?'not-allowed':'pointer'};border-color:${isSel?'#4caf50':atMax?'var(--border)':'var(--border)'};" onclick="${atMax||(!canSel&&!isSel)?'':('luToggleASI('+i+')')}">
            <div class="sn">${ABILITIES_SH[i]}</div>
            <div style="font-size:18px;font-weight:700;color:${isSel?'#4caf50':atMax?'var(--text3)':'var(--text)'}">${cur+bonus}</div>
            <div style="font-size:11px;color:${isSel?'#4caf50':'var(--cp)'};">${fmt(mod(cur+bonus))}</div>
            ${isSel?`<div style="font-size:9px;color:#4caf50">+${choice.val}</div>`:''}
            ${atMax?`<div style="font-size:9px;color:var(--text3)">MAX</div>`:''}
          </div>`;
        }).join('')}
      </div>
    `}
    <div style="display:flex;gap:8px;margin-top:14px">
      <button class="btn" style="flex:1" onclick="LU.step--;renderTab()">← Retour</button>
      <button class="btn bac" style="flex:2" onclick="LU.step++;renderTab()" ${valid?'':'disabled'}>Continuer →</button>
    </div>
  </div>`;
}
function luToggleASI(i){
  if(!LU.asiChoice)LU.asiChoice={type:'double',stats:[],val:1};
  const idx=LU.asiChoice.stats.indexOf(i);
  if(idx>=0)LU.asiChoice.stats.splice(idx,1);
  else if((LU.asiChoice.type==='double'&&LU.asiChoice.stats.length<2)||(LU.asiChoice.type==='asi'&&LU.asiChoice.stats.length<1))LU.asiChoice.stats.push(i);
  renderTab();
}
function luFilterFeats(q){
  const el=document.getElementById('featResults');if(!el||!FEATS_DB)return;
  const _featHasPrereq=f=>!!(f.tx&&(f.tx.includes('Prérequis')||f.tx.toLowerCase().includes('prerequisite')));
  const _featCard=f=>{const hasPre=_featHasPrereq(f);return`<div class="lu-choice" style="margin-bottom:6px;padding:8px 10px;cursor:pointer" onclick="LU.asiChoice.featName='${esc(f.n)}';renderTab()"><h3 style="font-size:13px;margin-bottom:4px">${esc(f.n)}${hasPre?` <span style="font-size:10px;color:#ff9800;font-weight:400">⚠ Prérequis</span>`:''}</h3><p style="font-size:11px;color:var(--text2);line-height:1.4">${esc(f.tx||'')}</p></div>`;};
  if(!q.trim()){const preview=FEATS_DB.slice(0,24);el.innerHTML=preview.map(_featCard).join('')+`<div style="font-size:11px;color:var(--text3);text-align:center;padding:4px">…et ${FEATS_DB.length-24} autres. Tapez pour filtrer.</div>`;return;}
  const low=q.toLowerCase();
  const res=[];
  for(let i=0;i<FEATS_DB.length&&res.length<12;i++){
    if(FEATS_DB[i].n&&FEATS_DB[i].n.toLowerCase().includes(low))res.push(FEATS_DB[i]);
  }
  el.innerHTML=res.length?res.map(_featCard).join(''):'<div style="font-size:12px;color:var(--text3);text-align:center;padding:8px">Aucun résultat.</div>';
}

// ── Sorts ──
const _CLASS_NAME_EN={'Barde':'Bard','Clerc':'Cleric','Druide':'Druid','Ensorceleur':'Sorcerer','Guerrier':'Fighter','Magicien':'Wizard','Moine':'Monk','Occultiste':'Warlock','Paladin':'Paladin','Rôdeur':'Ranger','Roublard':'Rogue','Artificier':'Artificer','Barbare':'Barbarian'};
function _maxSpellLevelForLevelUp(p,className){
  if(className==='Occultiste'){
    const wc=p.classes.find(c=>c.name==='Occultiste');
    const newLvl=(wc?wc.level:0)+1;
    const ws=WARLOCK_SLOT_TABLE[Math.min(newLvl-1,19)];
    return ws?ws[1]:1;
  }
  let e=0;
  (p.classes||[]).forEach(c=>{
    if(c.name==='Occultiste')return;
    const d=SRD.classes.find(cl=>cl.name===c.name);if(!d)return;
    const lvl=c.name===className?c.level+1:c.level;
    if(d.spellWeight===1)e+=lvl;
    else if(d.spellWeight===0.5)e+=Math.ceil(lvl/2);
  });
  if(e<1)return 1;
  const slots=MC_SLOT_TABLE[Math.min(e-1,19)];
  return slots?slots.length:1;
}
function luStepSpells(p){
  if(!SPELLS_DB){
    loadSpellsDB(()=>renderTab());
    return`<div><p style="font-size:13px;color:var(--text2);margin-bottom:12px">⏳ Chargement du compendium de sorts...</p><button class="btn" onclick="LU.step--;renderTab()">← Retour</button></div>`;
  }
  const mc=mainClass(p);
  const cd=mc?CLASS_LEVEL_DATA[mc.name]:null;
  const entry=p.classes.find(c=>c.name===(mc?mc.name:''));
  const newCLvl=(entry?entry.level:1)+1;
  const count=cd&&cd.spellsPerLevel?cd.spellsPerLevel[newCLvl]||0:0;
  const isCantripLevel=!!(cd&&cd.cantripAtLevels&&cd.cantripAtLevels.includes(newCLvl));
  const className=mc?mc.name:'';
  const classNameEN=_CLASS_NAME_EN[className]||className;
  const maxLvl=_maxSpellLevelForLevelUp(p,className);
  const knownNames=(p.spells||[]).map(s=>s.name);
  const _spDb=getSpellsDB();
  const q=_luSpellSearch.toLowerCase().trim();
  const classSpells=_spDb.filter(s=>{
    if(s.classes&&s.classes.length&&!s.classes.includes(className)&&!s.classes.includes(classNameEN))return false;
    if(knownNames.includes(s.name))return false;
    if(q&&!s.name.toLowerCase().includes(q)&&!(s.nameEN||'').toLowerCase().includes(q))return false;
    return true;
  });
  const cantrips=classSpells.filter(s=>s.level===0);
  const l1=classSpells.filter(s=>s.level===1);
  const l2plus=classSpells.filter(s=>s.level>=2&&s.level<=maxLvl);
  const sel=LU.newSpells;
  const spellRow=(s)=>{const isSel=sel.includes(s.name);const dis=!isSel&&sel.length>=count;return`<div class="sk-choice${isSel?' selected':dis?' disabled':''}" onclick="${dis?'':'luToggleSpell(\''+esc(s.name)+'\')'}"><span class="sk-dot${isSel?' p':''}"></span><span style="flex:1;font-size:13px">${esc(s.name)}${s.level>1?` <span style="font-size:10px;color:var(--text3)">niv.${s.level}</span>`:''}</span><span style="font-size:11px;color:var(--text3)">${esc(s.school||'')}</span>${isSel?`<span style="color:var(--cp)">✓</span>`:''}</div>`;};
  return`<div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:8px">Choisis <strong style="color:var(--cp)">${count}</strong> nouveau${count>1?'x':''} sort${count>1?'s':''}${isCantripLevel?' (dont 1 sort mineur)':''}. (${sel.length}/${count} sélectionné${sel.length>1?'s':''})</p>
    <input type="text" placeholder="🔍 Rechercher..." value="${esc(_luSpellSearch)}" oninput="_luSpellSearch=this.value;renderTab()" style="width:100%;box-sizing:border-box;padding:7px 10px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px;margin-bottom:8px">
    ${isCantripLevel?`<div style="font-size:12px;font-weight:600;color:var(--cp);margin:8px 0 4px">Sorts mineurs</div>${cantrips.length?cantrips.map(spellRow).join(''):'<div style="font-size:12px;color:var(--text3);padding:4px 0">Aucun résultat.</div>'}`:``}
    <div style="font-size:12px;font-weight:600;color:var(--cp);margin:8px 0 4px">Sorts niveau 1</div>
    ${l1.length?l1.map(spellRow).join(''):'<div style="font-size:12px;color:var(--text3);padding:4px 0">Aucun résultat.</div>'}
    ${maxLvl>=2?`<div style="font-size:12px;font-weight:600;color:var(--cp);margin:8px 0 4px">Sorts niveau 2–${maxLvl}</div>${l2plus.length?l2plus.map(spellRow).join(''):'<div style="font-size:12px;color:var(--text3);padding:4px 0">Aucun sort disponible à ce niveau.</div>'}`:``}
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn" style="flex:1" onclick="LU.step--;_luSpellSearch='';renderTab()">← Retour</button>
      <button class="btn bac" style="flex:2" onclick="LU.step++;_luSpellSearch='';renderTab()" ${sel.length>=count?'':'disabled'}>Continuer →</button>
    </div>
  </div>`;
}
function luToggleSpell(name){const idx=LU.newSpells.indexOf(name);if(idx>=0)LU.newSpells.splice(idx,1);else LU.newSpells.push(name);renderTab();}

// ── Expertise ──
function luStepExpertise(p){
  const profSkills=SKILLS.filter(sk=>(p.skillProf||{})[sk.name]===1);
  const sel=LU.expertiseChoices;const count=2;
  return`<div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:8px">Choisis <strong style="color:var(--cp)">${count}</strong> compétences maîtrisées pour doubler ton bonus (expertise). (${sel.length}/${count})</p>
    ${profSkills.length?profSkills.map(sk=>{const isSel=sel.includes(sk.name);const dis=!isSel&&sel.length>=count;return`<div class="sk-choice${isSel?' selected':dis?' disabled':''}" onclick="${dis?'':'luToggleExpertise(\''+esc(sk.name)+'\')'}"><span class="sk-dot${isSel?' p':''}"></span><span style="flex:1;font-size:13px">${esc(sk.name)}</span><span style="font-size:11px;color:var(--text3)">${ABILITIES_SH[sk.ab]}</span>${isSel?`<span style="color:var(--cp)">✓ Expertise</span>`:''}</div>`;}).join(''):`<div style="font-size:12px;color:var(--text3);font-style:italic;padding:8px 0">Aucune compétence maîtrisée disponible. Ajoute des maîtrises d'abord dans l'onglet Compétences.</div>`}
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn" style="flex:1" onclick="LU.step--;renderTab()">← Retour</button>
      <button class="btn bac" style="flex:2" onclick="LU.step++;renderTab()" ${sel.length>=count||profSkills.length<count?'':'disabled'}>Continuer →</button>
    </div>
  </div>`;
}
function luToggleExpertise(name){const idx=LU.expertiseChoices.indexOf(name);if(idx>=0)LU.expertiseChoices.splice(idx,1);else LU.expertiseChoices.push(name);renderTab();}

// ── Compétence multiclasse (Barde, Rôdeur, Roublard) ──
function luStepMcSkill(p){
  const d=SRD.classes.find(c=>c.name===LU.mcTarget);
  const count=d?d.mcSkillCount||0:0;
  const available=d?d.skills||[]:[];
  const sel=LU.mcSkillChoices;
  const already=p.skillProf||{};
  return`<div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:8px">Multiclassage en <strong style="color:var(--cp)">${esc(LU.mcTarget)}</strong> — Choisis <strong style="color:var(--cp)">${count}</strong> compétence${count>1?'s':''} dans la liste de classe. (${sel.length}/${count})</p>
    ${available.map(sk=>{const isSel=sel.includes(sk);const alreadyHas=already[sk]>=1;const dis=alreadyHas||(!isSel&&sel.length>=count);return`<div class="sk-choice${isSel?' selected':dis?' disabled':''}" onclick="${(dis&&!isSel)?'':'luToggleMcSkill(\''+esc(sk)+'\')'}"><span class="sk-dot${isSel?' p':''}"></span><span style="flex:1;font-size:13px">${esc(sk)}</span>${alreadyHas?`<span style="font-size:11px;color:var(--text3)">déjà maîtrisée</span>`:isSel?`<span style="color:var(--cp)">✓</span>`:''}</div>`;}).join('')}
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn" style="flex:1" onclick="LU.step--;renderTab()">← Retour</button>
      <button class="btn bac" style="flex:2" onclick="LU.step++;renderTab()" ${sel.length>=count?'':'disabled'}>Continuer →</button>
    </div>
  </div>`;
}
function luToggleMcSkill(name){const idx=LU.mcSkillChoices.indexOf(name);if(idx>=0)LU.mcSkillChoices.splice(idx,1);else LU.mcSkillChoices.push(name);renderTab();}

// ── Manifestations occultes (Occultiste) ──
function luStepInvocations(p){
  const occEntry=p.classes.find(c=>c.name==='Occultiste');
  const occLvl=occEntry?(occEntry.level+1):2;
  const totalByLevel={2:2,5:3,7:4,9:5,12:6,15:7,18:8};
  const targetTotal=totalByLevel[occLvl]||2;
  const currentCount=(p.eldritchInvocations||[]).length;
  const toChoose=Math.max(1,targetTotal-currentCount);
  const sel=LU.invocationChoices;
  const alreadyHas=p.eldritchInvocations||[];
  const available=(ELDRITCH_INVOCATIONS||[]).filter(inv=>{
    if(alreadyHas.includes(inv.name))return false;
    if(inv.minLevel>occLvl)return false;
    return true;
  });
  return`<div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:8px">Choisis <strong style="color:var(--cp)">${toChoose}</strong> manifestation${toChoose>1?'s':''} occulte${toChoose>1?'s':''}. (${sel.length}/${toChoose} sélectionnée${sel.length>1?'s':''})</p>
    ${alreadyHas.length?`<div style="font-size:11px;color:var(--text3);margin-bottom:8px;padding:5px 8px;background:var(--surface2);border-radius:6px">Déjà choisies : ${alreadyHas.map(n=>esc(n)).join(', ')}</div>`:''}
    ${available.map(inv=>{
      const isSel=sel.includes(inv.name);const dis=!isSel&&sel.length>=toChoose;
      return`<div class="lu-choice${isSel?' selected':dis?' disabled':''}" style="margin-bottom:6px;padding:8px 10px;cursor:${dis?'default':'pointer'}" onclick="${dis?'':'luToggleInvocation(\''+esc(inv.name)+'\')'}">
        <div style="display:flex;align-items:flex-start;gap:8px">
          <span style="color:var(--cp);font-size:14px;margin-top:1px;flex-shrink:0">${isSel?'✓':'◯'}</span>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600">${esc(inv.name)}${inv.minLevel>0?` <span style="font-size:10px;color:var(--text3);font-weight:400">niv.${inv.minLevel}+</span>`:''}</div>
            <div style="font-size:11px;color:var(--text2);margin-top:3px;line-height:1.4">${esc(inv.desc)}</div>
          </div>
        </div>
      </div>`;
    }).join('')}
    ${!available.length?`<div style="font-size:12px;color:var(--text3);font-style:italic;padding:8px">Toutes les manifestations disponibles ont déjà été choisies.</div>`:''}
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn" style="flex:1" onclick="LU.step--;renderTab()">← Retour</button>
      <button class="btn bac" style="flex:2" onclick="LU.step++;renderTab()" ${sel.length>=toChoose||!available.length?'':'disabled'}>Continuer →</button>
    </div>
  </div>`;
}
function luToggleInvocation(name){const idx=LU.invocationChoices.indexOf(name);if(idx>=0)LU.invocationChoices.splice(idx,1);else LU.invocationChoices.push(name);renderTab();}

// ── Secrets Magiques (Barde) ──
let _luSecretsSearch='';
function luStepSecretsM(p){
  if(!SPELLS_DB){
    loadSpellsDB(()=>renderTab());
    return`<div><p style="font-size:13px;color:var(--text2);margin-bottom:12px">⏳ Chargement du compendium de sorts...</p><button class="btn" onclick="LU.step--;renderTab()">← Retour</button></div>`;
  }
  const count=2;const sel=LU.secretsChoices;
  const knownNames=(p.spells||[]).map(s=>s.name).concat(LU.newSpells);
  const _spDb=getSpellsDB();
  const q=_luSecretsSearch.toLowerCase().trim();
  const allSpells=_spDb.filter(s=>!knownNames.includes(s.name)&&s.level>0&&(!q||s.name.toLowerCase().includes(q)||(s.nameEN||'').toLowerCase().includes(q)));
  const maxLvl=_maxSpellLevelForLevelUp(p,'Barde');
  const byLevel={};allSpells.forEach(s=>{if(s.level<=maxLvl){if(!byLevel[s.level])byLevel[s.level]=[];byLevel[s.level].push(s);}});
  const spellRow=(s)=>{const isSel=sel.includes(s.name);const dis=!isSel&&sel.length>=count;return`<div class="sk-choice${isSel?' selected':dis?' disabled':''}" onclick="${dis?'':'luToggleSecret(\''+esc(s.name)+'\')'}"><span class="sk-dot${isSel?' p':''}"></span><span style="flex:1;font-size:13px">${esc(s.name)} <span style="font-size:10px;color:var(--text3)">niv.${s.level}</span></span><span style="font-size:11px;color:var(--text3)">${esc(s.school||'')}</span>${isSel?`<span style="color:var(--cp)">✓</span>`:''}</div>`;};
  return`<div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:4px">🎭 <strong style="color:var(--cp)">Secrets Magiques</strong> — Choisis ${count} sorts de <em>n'importe quelle classe</em>. (${sel.length}/${count})</p>
    <input type="text" placeholder="🔍 Rechercher un sort..." value="${esc(_luSecretsSearch)}" oninput="_luSecretsSearch=this.value;renderTab()" style="width:100%;box-sizing:border-box;padding:7px 10px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px;margin-bottom:8px">
    ${Object.keys(byLevel).sort((a,b)=>a-b).map(lvl=>`<div style="font-size:12px;font-weight:600;color:var(--cp);margin:8px 0 4px">Niveau ${lvl}</div>${byLevel[lvl].map(spellRow).join('')}`).join('')}
    ${!allSpells.length?`<div style="font-size:12px;color:var(--text3);padding:8px 0">Aucun résultat.</div>`:''}
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn" style="flex:1" onclick="LU.step--;_luSecretsSearch='';renderTab()">← Retour</button>
      <button class="btn bac" style="flex:2" onclick="LU.step++;_luSecretsSearch='';renderTab()" ${sel.length>=count?'':'disabled'}>Continuer →</button>
    </div>
  </div>`;
}
function luToggleSecret(name){const idx=LU.secretsChoices.indexOf(name);if(idx>=0)LU.secretsChoices.splice(idx,1);else LU.secretsChoices.push(name);renderTab();}

// ── Métamagie ──
function luStepMetamagic(p){
  const cd=CLASS_LEVEL_DATA['Ensorceleur'];
  const options=cd?cd.metamagicOptions:[];
  const mc=mainClass(p);const entry=p.classes.find(c=>c.name===(mc?mc.name:''));
  const newCLvl=(entry?entry.level:1)+1;
  const count=newCLvl===3?2:1;
  const sel=LU.metamagicChoices;
  return`<div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:12px">Choisis <strong style="color:var(--cp)">${count}</strong> option${count>1?'s':''} de Métamagie (${sel.length}/${count}) :</p>
    ${options.map(o=>{const isSel=sel.includes(o.name);const dis=!isSel&&sel.length>=count;return`<div class="lu-choice${isSel?' selected':dis?' disabled opacity-40':''}" onclick="${dis?'':'luToggleMeta(\''+esc(o.name)+'\')'}">
      <h3>${esc(o.name)}</h3><p>${esc(o.desc)}</p>
    </div>`;}).join('')}
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn" style="flex:1" onclick="LU.step--;renderTab()">← Retour</button>
      <button class="btn bac" style="flex:2" onclick="LU.step++;renderTab()" ${sel.length>=count?'':'disabled'}>Continuer →</button>
    </div>
  </div>`;
}
function luToggleMeta(name){const idx=LU.metamagicChoices.indexOf(name);if(idx>=0)LU.metamagicChoices.splice(idx,1);else LU.metamagicChoices.push(name);renderTab();}

// ── Récap & Confirmation ──
function luStepRecap(p,newLvl){
  const mc=mainClass(p);
  const entry=mc?p.classes.find(c=>c.name===mc.name):null;
  const newCLvl=entry?(entry.level+1):1;
  const cd=mc?CLASS_LEVEL_DATA[mc.name]:null;
  const druideCircle=mc&&mc.name==='Druide'&&p.archetype?p.archetype['Druide']:null;
  const _PREPARED_RECAP=['Clerc','Druide','Paladin'];
  const isPrepared=mc&&_PREPARED_RECAP.includes(mc.name);
  const feats=(cd?((cd.levelFeatures||{})[newCLvl]||[]):[]).filter(f=>f&&!f.includes('Amélioration de caractéristiques')&&!f.startsWith('Sorts du cercle')&&!f.includes('(choix)')).map(f=>{
    const resolved=_resolveDruidCircleFeat(f,druideCircle,newCLvl);
    return resolved?resolved.name:f;
  });
  const isMulti=LU.choice==='multiclass';

  // Texte explicatif des nouvelles capacités (depuis FEAT_DESCS)
  const explainFeats=feats.map(f=>{const desc=getFeatDesc(f);return{name:f,desc};});

  return`<div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:14px">Récapitulatif — niveau <strong style="color:var(--cp)">${newLvl}</strong>. Confirme pour appliquer.</p>

    <div style="background:var(--surface2);border-radius:8px;padding:12px;margin-bottom:12px">
      <div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:8px">Ce qui change</div>
      ${isMulti?`<div style="font-size:13px;color:var(--text2)">🔀 Multiclassage → <strong>${esc(LU.mcTarget)}</strong> niveau 1</div>
        <div style="font-size:12px;color:var(--text3);margin-top:4px">${esc((SRD.classes.find(c=>c.name===LU.mcTarget)||{}).mcProf||'—')}</div>`:
      `${explainFeats.map(f=>`<div style="padding:6px 0;border-bottom:1px solid var(--border)">
          <div style="font-size:13px;font-weight:600;color:var(--cp)">✦ ${esc(f.name)}</div>
          <div style="font-size:12px;color:var(--text2);margin-top:2px;line-height:1.5">${esc(f.desc)}</div>
        </div>`).join('')}
      ${LU.archetypeChoice?`<div style="padding:6px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;font-weight:600;color:var(--cp)">🎭 Archétype : ${esc(LU.archetypeChoice)}</div></div>`:''}
      ${LU.terrainChoice?`<div style="padding:6px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;font-weight:600;color:var(--cp)">🗺 Terrain du cercle : ${esc(LU.terrainChoice)}</div></div>`:''}
      ${LU.styleChoice?`<div style="padding:6px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;font-weight:600;color:var(--cp)">⚔ Style : ${esc(LU.styleChoice)}</div></div>`:''}
      ${LU.asiChoice&&LU.asiChoice.type==='feat'&&LU.asiChoice.featName?`<div style="padding:6px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;font-weight:600;color:#4caf50">🎯 Don : ${esc(LU.asiChoice.featName)}</div></div>`:''}
      ${LU.asiChoice&&LU.asiChoice.type!=='feat'&&LU.asiChoice.stats.length?`<div style="padding:6px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;font-weight:600;color:#4caf50">📈 Amélioration : +${LU.asiChoice.val} à ${LU.asiChoice.stats.map(j=>ABILITIES[j]).join(' et ')}</div></div>`:''}
      ${LU.expertiseChoices.length?`<div style="padding:6px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;font-weight:600;color:#4caf50">🎯 Expertise : ${LU.expertiseChoices.join(', ')}</div></div>`:''}
      ${LU.newSpells.length?`<div style="padding:6px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;font-weight:600;color:var(--cp)">✨ Nouveaux sorts : ${LU.newSpells.join(', ')}</div></div>`:''}
      ${LU.secretsChoices.length?`<div style="padding:6px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;font-weight:600;color:#9c27b0">🎭 Secrets Magiques : ${LU.secretsChoices.join(', ')}</div></div>`:''}
      ${LU.metamagicChoices.length?`<div style="padding:6px 0"><div style="font-size:13px;font-weight:600;color:var(--cp)">🔮 Métamagie : ${LU.metamagicChoices.join(', ')}</div></div>`:''}
      ${(!explainFeats.length&&!LU.archetypeChoice&&!LU.styleChoice&&!(LU.asiChoice&&(LU.asiChoice.featName||(LU.asiChoice.stats&&LU.asiChoice.stats.length)))&&!LU.expertiseChoices.length&&!LU.newSpells.length&&!LU.secretsChoices.length&&!LU.metamagicChoices.length)?`<div style="font-size:12px;color:var(--text3);font-style:italic;padding:6px 0">Aucune nouvelle capacité de classe à ce niveau — tes points de vie augmentent.</div>`:''}
      `}
    </div>

    <div style="padding:8px 12px;background:var(--cglow);border:1px solid var(--cp);border-radius:8px;margin-bottom:8px">
      <div style="font-size:12px;color:var(--text2)">PV gagnés : <strong style="color:var(--cp)">${(()=>{const d=mc?SRD.classes.find(c=>c.name===mc.name):null;if(!d)return'?';const ab=p.abilities||[10,10,10,10,10,10];const avg=Math.floor(d.hdVal/2)+1;return`${avg} + CON (${fmt(mod(ab[2]))}) = ${Math.max(1,avg+mod(ab[2]))} PV supplémentaires`})()}</strong></div>
    </div>
    ${!isMulti&&isPrepared?`<div style="padding:8px 12px;background:rgba(0,150,136,.08);border:1px solid rgba(0,150,136,.3);border-radius:8px;margin-bottom:8px;font-size:12px;color:var(--text2)">💡 <strong>Sorts :</strong> Tu peux préparer n'importe quel sort de ta liste de classe lors d'un repos long. Accède à <strong>Sorts → 📚 Parcourir</strong> pour ajouter de nouveaux sorts.</div>`:''}

    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="LU.step--;renderTab()">← Retour</button>
      <button class="btn bac" style="flex:2" onclick="applyLevelUp()">✓ Confirmer le niveau ${newLvl}</button>
    </div>
  </div>`;
}

function applyLevelUp(){
  const p=P();const mc=mainClass(p);
  const isMulti=LU.choice==='multiclass';

  if(isMulti&&LU.mcTarget){
    const ex=p.classes.find(c=>c.name===LU.mcTarget);
    if(ex)ex.level++;else p.classes.push({name:LU.mcTarget,level:1});
    const d=SRD.classes.find(c=>c.name===LU.mcTarget);
    if(d){
      p.weaponProfs=[...new Set([...p.weaponProfs,...(d.weaponTypes||[])])];
      p.armorProfs=[...new Set([...p.armorProfs,...(d.mcArmorTypes||d.armorTypes||[])])];
    }
    // PV multiclasse
    const dSrd=SRD.classes.find(c=>c.name===LU.mcTarget);
    const avg=dSrd?Math.floor(dSrd.hdVal/2)+1:4;
    p.hpMax+=Math.max(1,avg+mod(p.abilities[2]));
    if(p.race==='Nain des collines')p.hpMax+=1; // Ténacité naine
    p.hp=p.hpMax;
    // Capacités niveau 1 multiclasse
    const newFeats=getLevel1Features(LU.mcTarget);
    newFeats.forEach(f=>{if(!p.features.find(x=>x.name===f.name))p.features.push(f);});
    // Compétence multiclasse (Barde, Rôdeur, Roublard)
    if(LU.mcSkillChoices.length){
      if(!p.skillProf)p.skillProf={};
      LU.mcSkillChoices.forEach(sk=>{if(!p.skillProf[sk])p.skillProf[sk]=1;});
    }
  } else if(mc){
    const entry=p.classes.find(c=>c.name===mc.name);
    if(entry)entry.level++;
    const dSrd=SRD.classes.find(c=>c.name===mc.name);
    const avg=dSrd?Math.floor(dSrd.hdVal/2)+1:4;
    p.hpMax+=Math.max(1,avg+mod(p.abilities[2]));
    if(p.race==='Nain des collines')p.hpMax+=1; // Ténacité naine
    p.hp=p.hpMax;
    // Capacités du nouveau niveau — exclure ASI et les pures mécaniques de compteur
    const newClassLevel=entry?entry.level:1;
    const EXCLUDED_FEATS=[
      'Amélioration de caractéristiques',
      'Points de sorcellerie',
      'Inspiration bardique',
      'Points de ki','Ki',
      'Rage',
      'Forme sauvage',
      'Récupération arcanique',
      'Magie de pacte',
      'Conduit divin',
      'Sorts du cercle',
      'Sorts du spécialiste',
      'Accès aux emplacements',
      'Capacité du domaine',
      'Capacité du serment sacré',
      'Capacité de la tradition monastique',
      'Capacité du spécialiste',
      'Infusions',
    ];
    const druideCircle2=mc.name==='Druide'&&p.archetype?p.archetype['Druide']:null;
    const newFeats=getLevelFeatures(mc.name,newClassLevel)
      .filter(f=>!EXCLUDED_FEATS.some(ex=>f.name===ex||f.name.startsWith(ex+' (')||f.name.startsWith(ex+' :')))
      .map(f=>{
        const resolved=_resolveDruidCircleFeat(f.name,druideCircle2,newClassLevel);
        return resolved?{name:resolved.name,desc:resolved.desc,classe:mc.name}:f;
      });
    newFeats.forEach(f=>{if(!p.features.find(x=>x.name===f.name))p.features.push(f);});
  }

  // ASI ou Don
  if(LU.asiChoice&&LU.asiChoice.type==='feat'&&LU.asiChoice.featName){
    const feat=FEATS_DB?FEATS_DB.find(f=>f.n===LU.asiChoice.featName):null;
    if(!p.features)p.features=[];
    p.features.push({name:LU.asiChoice.featName,desc:(feat?feat.tx:'')||'',classe:'Don'});
  } else if(LU.asiChoice&&LU.asiChoice.stats.length){
    LU.asiChoice.stats.forEach(i=>{p.abilities[i]=Math.min(20,p.abilities[i]+LU.asiChoice.val);});
  }

  // Archétype → ajouter comme capacité + mémoriser dans p.archetype
  if(LU.archetypeChoice){
    const cd=mc?CLASS_LEVEL_DATA[mc.name]:null;
    const arch=cd&&cd.archetypes?cd.archetypes.find(a=>a.name===LU.archetypeChoice):null;
    if(arch){
      p.features.push({name:LU.archetypeChoice,desc:arch.desc,classe:mc?mc.name:''});
      if(!p.archetype)p.archetype={};
      p.archetype[mc.name]=LU.archetypeChoice;
      if(mc&&mc.name==='Druide'&&LU.archetypeChoice==='Cercle des terres'&&LU.terrainChoice){
        p.druidTerrain=LU.terrainChoice;
      }
    }
  }

  // Style de combat → ajouter comme capacité
  if(LU.styleChoice){
    const cd=mc?CLASS_LEVEL_DATA[mc.name]:null;
    const style=cd&&cd.combatStyles?cd.combatStyles.find(s=>s.name===LU.styleChoice):null;
    if(style)p.features.push({name:'Style : '+LU.styleChoice,desc:style.desc,classe:mc?mc.name:''});
  }

  // Expertise → upgrader skillProf de 1 à 2
  if(LU.expertiseChoices.length){
    if(!p.skillProf)p.skillProf={};
    LU.expertiseChoices.forEach(sk=>{p.skillProf[sk]=2;});
  }

  // Nouveaux sorts (classe) + Secrets Magiques (Barde, any class)
  if(!p.spells)p.spells=[];
  [...LU.newSpells,...LU.secretsChoices].forEach(name=>{if(!p.spells.find(s=>s.name===name))p.spells.push({name});});

  // Métamagie → ajouter comme capacités
  if(LU.metamagicChoices.length){
    const cd=CLASS_LEVEL_DATA['Ensorceleur'];
    LU.metamagicChoices.forEach(name=>{
      const opt=cd&&cd.metamagicOptions?cd.metamagicOptions.find(o=>o.name===name):null;
      if(opt)p.features.push({name:'Métamagie : '+name,desc:opt.desc,classe:'Ensorceleur'});
    });
  }

  // Manifestations occultes → stocker dans p.eldritchInvocations
  if(LU.invocationChoices.length){
    if(!p.eldritchInvocations)p.eldritchInvocations=[];
    LU.invocationChoices.forEach(name=>{if(!p.eldritchInvocations.includes(name))p.eldritchInvocations.push(name);});
  }

  p.pendingLevelUp=false;
  resetLU();
  saveAll();
  setTab('perso');
  showToast(`⬆ Niveau confirmé ! ${(p.classes||[]).map(c=>c.name+' '+c.level).join(' / ')} — PV max : ${p.hpMax}`);
  (()=>{if(!document.getElementById('lu-anim-style')){const s=document.createElement('style');s.id='lu-anim-style';s.textContent='@keyframes luOverlayFade{0%{background:rgba(0,0,0,0)}15%{background:rgba(0,0,0,.35)}85%{background:rgba(0,0,0,.35)}100%{background:rgba(0,0,0,0);opacity:0}}@keyframes luTextBounce{0%{transform:scale(0);opacity:0}20%{transform:scale(1.15);opacity:1}30%{transform:scale(1)}80%{transform:scale(1);opacity:1}100%{transform:scale(1.5);opacity:0}}';document.head.appendChild(s);}const el=document.createElement('div');el.style.cssText='position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:9999;pointer-events:none;animation:luOverlayFade 2.5s ease forwards';el.innerHTML='<div style="font-size:56px;font-weight:900;color:var(--cp);text-shadow:0 0 40px rgba(200,168,75,.9);animation:luTextBounce 2.5s ease forwards;text-align:center;line-height:1.2">⬆<br><span style="font-size:28px">NIVEAU !</span></div>';document.body.appendChild(el);setTimeout(()=>el.remove(),2500);})();
}

// ═══════════════════════════════════════
// AUTOCOMPLETE
// ═══════════════════════════════════════
function searchClasse(q){const drop=document.getElementById('classeDrop');if(!drop)return;if(!q){drop.style.display='none';return;}const res=SRD.classes.filter(c=>c.name.toLowerCase().includes(q.toLowerCase())).slice(0,8);if(!res.length){drop.style.display='none';return;}drop.style.display='block';drop.innerHTML=res.map(c=>`<div class="aci" onmousedown="event.preventDefault();addClassEntry('${esc(c.name)}')"><div class="ain">${esc(c.name)}</div><div class="ais">${c.hd} — JS: ${c.saves.join(', ')}</div></div>`).join('');}
function addClassEntry(name){const p=P();if(!p.classes)p.classes=[];if(!p.classes.find(c=>c.name===name))p.classes.push({name,level:1});const inp=document.getElementById('classeInput');if(inp)inp.value='';const drop=document.getElementById('classeDrop');if(drop)drop.style.display='none';render();}
function searchBgPerso(q){const drop=document.getElementById('bgDropPerso');if(!drop)return;upd('background',q);if(!q){drop.style.display='none';return;}const res=BACKGROUNDS.filter(b=>b.name.toLowerCase().includes(q.toLowerCase()));if(!res.length){drop.style.display='none';return;}drop.style.display='block';drop.innerHTML=res.map(b=>`<div class="aci" onmousedown="event.preventDefault();selectBgPerso('${esc(b.name)}')"><div class="ain">${esc(b.name)}</div><div class="ais">${esc(b.skills.join(', '))} — ${esc(b.desc)}</div></div>`).join('');}
function selectBgPerso(name){upd('background',name);const inp=document.getElementById('bgInputPerso');if(inp)inp.value=name;const drop=document.getElementById('bgDropPerso');if(drop)drop.style.display='none';}

