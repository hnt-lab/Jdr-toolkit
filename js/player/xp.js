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
  <div style="font-size:13px;color:var(--text3);margin-bottom:10px">${toNext>0?`${toNext.toLocaleString()} XP jusqu'au niveau ${lvl+1}`:'Prêt !'}</div>`;

  const lvlUpBtn=canLvlUp?`<div style="padding:10px;background:var(--cglow);border:1px solid var(--cp);border-radius:2px;text-align:center;margin-bottom:10px">
    <div style="font-size:14px;font-weight:600;color:var(--cp);margin-bottom:6px">⬆ Niveau ${lvl+1} disponible !</div>
    <button class="btn bac" onclick="unlockLevelUp()">Ouvrir montée de niveau</button>
  </div>`:p.pendingLevelUp?`<div style="padding:10px;background:var(--cglow);border:1px solid var(--cp);border-radius:2px;text-align:center;font-size:13px;color:var(--cp);margin-bottom:10px">⬆ Voir l'onglet <strong>Niveau +</strong></div>`:'';

  const niveauTable=`<div class="panel"><div class="pt">Table des niveaux</div>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
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
    <div class="pt" style="font-size:13px">Récompenses rapides</div>
    ${[[10,'Piège désamorcé'],[25,'Gobelin tué'],[50,'Rencontre facile'],[100,'Rencontre moyenne'],[200,'Rencontre difficile'],[450,'Boss tué'],[1000,'Jalon narratif']].map(([xp,lbl])=>`<div class="xp-reward" onclick="quickXP(${xp})">+${xp} XP — ${lbl}</div>`).join('')}
  </div>`;

  const encCalcPanel=`<div class="panel" style="margin-top:10px">
    <div class="pt" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
      <span>🎯 Calculateur de rencontre</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
      <div><div style="font-size:12px;color:var(--text3);margin-bottom:3px">Nb de joueurs</div><input class="fi" id="enc_size" type="number" min="1" max="8" value="${_encGroupSize}" oninput="encRefresh()"></div>
      <div><div style="font-size:12px;color:var(--text3);margin-bottom:3px">Niveau moyen</div><input class="fi" id="enc_level" type="number" min="1" max="20" value="${_encGroupLevel}" oninput="encRefresh()"></div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
      <div style="font-size:13px;font-weight:600;color:var(--text2)">Monstres de la rencontre</div>
      <button class="btn bsm bprimary" onclick="encAddMonster()">+ Monstre</button>
    </div>
    <div id="enc_monsterList">${_encMonsters.length?_encMonsters.map((m,i)=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 8px;background:var(--surface2);border-radius:2px;margin-bottom:4px"><span style="font-size:13px"><strong>${esc(m.name)}</strong> <span style="color:var(--text3)">CR ${m.cr}</span> — <span style="color:var(--cp)">${m.xp.toLocaleString()} XP</span></span><button class="btn bsm" style="color:var(--danger);border-color:rgba(229,57,53,.4);padding:0 6px" onclick="encRemoveMonster(${i})">✕</button></div>`).join(''):'<div style="font-size:13px;color:var(--text3);font-style:italic;text-align:center;padding:8px">Aucun monstre — ajoutez-en ci-dessus.</div>'}</div>
    <div id="enc_result" style="margin-top:8px">${encResultHTML(_encGroupSize,_encGroupLevel)}</div>
    <button class="btn bac" style="width:100%;margin-top:10px" onclick="encDistribute()">⭐ Distribuer l'XP aux joueurs</button>
  </div>`;

  return`<div class="g2" style="gap:10px">
    <div>
      <div class="panel mb10">
        <div class="pt" style="display:flex;align-items:center;justify-content:space-between"><span>Expérience</span><span style="font-size:12px;color:var(--cp);border:1px solid var(--cp);border-radius:2px;padding:2px 8px">🎲 MJ</span></div>
        ${xpBar}
        <div style="display:flex;gap:6px;margin-bottom:10px">
          <input class="fi" id="xpAdd" type="number" placeholder="XP à ajouter" min="0">
          <button class="btn bac bsm" style="white-space:nowrap" onclick="addXP()">+ Ajouter</button>
        </div>
        ${lvlUpBtn}
        ${recompenses}
      </div>
      ${encCalcPanel}
      <div style="margin-top:10px;padding:10px;background:rgba(229,57,53,.05);border:1px solid rgba(229,57,53,.3);border-radius:2px">
        <div style="font-size:13px;font-weight:600;color:var(--danger);margin-bottom:6px">🔄 Réinitialisation des niveaux</div>
        <div style="font-size:13px;color:var(--text3);margin-bottom:8px">Remet le personnage au niveau 1. Les capacités de classe sont réinitialisées, l'XP est conservée et il devra repasser toutes les étapes de montée de niveau.</div>
        <button class="btn bsm" style="color:var(--danger);border-color:rgba(229,57,53,.5);width:100%" onclick="mjRespecCharacter()">🔄 Réinitialiser les niveaux</button>
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
  if(!confirm('Réinitialiser ce personnage au niveau 1 ?\n\nToutes les capacités de classe et l\'XP seront réinitialisées. Le personnage repart à 0 XP, niveau 1.'))return;
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
  p.xp=0;
  saveAll();render();showToast(`🔄 ${p.charName||'Personnage'} réinitialisé au niveau 1 (0 XP).`);
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
      {name:"Voie du berserker",desc:"Frénésie niv.3 (attaque bonus en rage, +1 épuisement à la fin). Rage aveugle niv.6 (ni charmé ni effrayé en rage). Présence intimidante niv.10 (action : effraie une créature à 9m, JS SAG DD 8+maîtrise+CHA). Représailles niv.14 (réaction : attaque de mêlée contre une créature à 1,5m qui t'a infligé des dégâts).",icon:"🔥"},
      {name:"Voie du guerrier totem",desc:"Quêteur spirituel niv.3 (rituels : Communication avec les animaux, Sens animal) + Esprit totem niv.3 (choix : ours — résistance à tout sauf psychique en rage / aigle — désavantage aux attaques d'opportunité contre toi + Foncer en action bonus / loup — avantage des alliés au corps à corps à 1,5m de toi). Aspect de la bête niv.6. Marcheur spirituel niv.10 (Communion avec la nature en rituel). Lien totémique niv.14.",icon:"🐺"},
      {name:"Voie de la magie sauvage",desc:"Sens de la magie niv.3 (détection 18m, maîtrise/repos long) + Sursaut sauvage niv.3 (effet magique aléatoire d8 à chaque rage). Réserve de magie niv.6 (action toucher : +1d3 aux jets 10 min OU regagner un emplacement de sort ≤ 1d3 ; maîtrise/repos long). Réaction instable niv.10 (réaction sur dégâts/JS raté en rage : nouveau sursaut). Sursaut contrôlé niv.14 (tire 2 résultats, choisis).",icon:"✨"},
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
      {name:"Collège du savoir",desc:"Maîtrises supplémentaires (3 compétences au choix). Mots cinglants niv.3 (réaction : dépense 1 inspiration bardique, la cible soustrait le dé de son jet d'attaque, de caractéristique ou de dégâts). Secrets magiques supplémentaires niv.6 (2 sorts de n'importe quelle classe, ne comptent pas dans les sorts connus). Compétence hors-pair niv.14 (dépense 1 inspiration : ajoute le dé à ton propre jet de caractéristique, après le jet mais avant le verdict).",icon:"📚"},
      {name:"Collège de la vaillance",desc:"Maîtrises armures intermédiaires, boucliers et armes de guerre. Inspiration martiale niv.3 (l'allié peut utiliser le dé sur un jet de dégâts d'arme, ou en réaction l'ajouter à sa CA contre une attaque). Attaque supplémentaire niv.6. Magie de combat niv.14 (quand tu utilises ton action pour lancer un sort de barde, tu peux faire une attaque d'arme en action bonus).",icon:"🛡"},
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
    spellsPerLevel:{2:1,3:1,4:1,5:1,6:1,7:1,8:1,9:1,11:1,13:1,15:1,17:1},
    cantripAtLevels:[4,10],
  },
  Clerc:{
    archetypes:[
      {name:"Domaine de la vie",desc:"Maîtrise armures lourdes. Disciple de la vie (soins +2+niv du sort). Conduit : Préservation de la vie niv.2. Guérisseur béni niv.6. Guérison suprême niv.17.",icon:"💚"},
      {name:"Domaine de la lumière",desc:"Sort mineur : Lumière. Illumination protectrice niv.1 (réaction, désavantage attaquant). Conduit : Radiance de l'aube niv.2. Illumination améliorée niv.6. Halo de lumière niv.17.",icon:"☀"},
      {name:"Domaine de la nature",desc:"Maîtrise armures lourdes + 1 compétence (Dressage/Nature/Survie). Sort mineur druide niv.1. Conduit : Charme des animaux et plantes niv.2. Atténuation des éléments niv.6. Maître de la nature niv.17.",icon:"🌿"},
      {name:"Domaine de la tempête",desc:"Maîtrises armures lourdes et armes de guerre. Fureur de l'ouragan niv.1 (réaction, 2d8 foudre/tonnerre). Conduit : Fureur destructrice niv.2. Frappe de l'éclair niv.6. Enfant de la tempête niv.17.",icon:"⚡"},
      {name:"Domaine de la duperie",desc:"Bénédiction de l'escroc niv.1 (avantage Discrétion 1h à une créature consentante). Conduit : Invocation de réplique (illusion) niv.2. Linceul d'ombre niv.6. Frappe divine (poison) niv.8. Réplique améliorée niv.17.",icon:"🎭"},
      {name:"Domaine de la guerre",desc:"Maîtrises armures lourdes et armes de guerre. Prêtre de guerre niv.1 (attaque bonus avec Sagesse). Conduit : Frappe guidée (+10 attaque) niv.2. Bénédiction du dieu de la guerre niv.6. Avatar de bataille niv.17.",icon:"⚔"},
      {name:"Domaine du savoir",desc:"Bénédictions du savoir niv.1 (2 langues + maîtrise doublée en 2 compétences parmi Arcanes/Histoire/Nature/Religion). Conduit : Savoir ancestral niv.2. Lecture des pensées niv.6. Visions du passé niv.17.",icon:"📚"},
      {name:"Domaine de la forge",desc:"Maîtrises armures lourdes et outils de forgeron. Bénédiction de la forge niv.1 (+1 arme/armure après repos long). Conduit : Bénédiction de l'artisan niv.2. Âme de la forge niv.6. Saint de la forge niv.17.",icon:"🔨"},
    ],
    levelFeatures:{
      1:["Incantation","Domaine divin (choix)","Capacité du domaine niv.1"],
      2:["Conduit divin (1 utilisation — dont Renvoi des morts-vivants)","Capacité du domaine"],
      3:["Sorts du domaine niv.2"],
      4:["Amélioration de caractéristiques"],
      5:["Destruction des morts-vivants (FP 1/2)","Sorts du domaine niv.3"],
      6:["Conduit divin (2 utilisations)","Capacité du domaine"],
      7:["Sorts du domaine niv.4"],
      8:["Amélioration de caractéristiques","Destruction des morts-vivants (FP 1)","Capacité du domaine"],
      9:["Sorts du domaine niv.5"],
      10:["Intervention divine"],
      11:["Destruction des morts-vivants (FP 2)"],
      12:["Amélioration de caractéristiques"],
      13:[],
      14:["Destruction des morts-vivants (FP 3)","Frappe divine améliorée (2d8) selon domaine"],
      15:[],
      16:["Amélioration de caractéristiques"],
      17:["Destruction des morts-vivants (FP 4)","Capacité du domaine"],
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
      {name:"Cercle de la lune",desc:"Forme sauvage en action bonus niv.2 (CR 1) + en forme : action bonus pour dépenser un emplacement de sort et récupérer 1d8 PV/niveau. Frappe primitive niv.6 (attaques en forme animale = magiques, CR max = niv/3). Forme sauvage élémentaire niv.10 (dépenser 2 utilisations de Forme sauvage : devenir un élémentaire air/eau/terre/feu). Mille formes niv.14 (Modification d'apparence à volonté).",icon:"🌙"},
      {name:"Cercle de la terre",desc:"Sort mineur de druide supplémentaire niv.2 + Récupération naturelle niv.2 (repos court : récupérer emplacements ≤ ceil(niv/2), max niv.5). Sorts de cercle liés à un terrain (niv.3/5/7/9, toujours préparés). Foulée tellurique niv.6 (terrains difficiles non-magiques sans coût). Protégé de dame Nature niv.10 (ni charmé ni effrayé par élémentaires/fées, immunité poison/maladie). Sanctuaire de dame Nature niv.14 (bêtes/plantes : JS SAG pour attaquer).",icon:"🗺"},
    ],
    levelFeatures:{
      1:["Druidique","Incantation"],
      2:["Forme sauvage (CR 1/4, pas nage/vol)","Cercle druidique (choix)"],
      3:["Sorts du cercle niv.2"],
      4:["Forme sauvage améliorée (CR 1/2 nage)","Amélioration de caractéristiques"],
      5:["Sorts du cercle niv.3"],
      6:["Capacité du cercle"],
      7:["Sorts du cercle niv.4"],
      8:["Amélioration de caractéristiques","Forme sauvage (CR 1, vol)"],
      9:["Sorts du cercle niv.5"],
      10:["Capacité du cercle"],
      11:["Accès aux emplacements de sorts de niveau 6"],
      12:["Amélioration de caractéristiques"],
      13:["Accès aux emplacements de sorts de niveau 7"],
      14:["Capacité du cercle"],
      15:["Accès aux emplacements de sorts de niveau 8"],
      16:["Amélioration de caractéristiques"],
      17:["Accès aux emplacements de sorts de niveau 9"],
      18:["Jeunesse éternelle (vieillissement ×10)","Incantation animale"],
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
    combatStyles:[
      {name:"Défense",desc:"+1 CA si tu portes une armure."},
      {name:"Duel",desc:"+2 aux dégâts avec une arme tenue en une main."},
      {name:"Arme à deux mains",desc:"Relancer les 1 et 2 sur les dés de dégâts avec armes à deux mains."},
      {name:"Protection",desc:"Utiliser ta réaction pour donner désavantage à une attaque contre un allié à 1,5m."},
    ],
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
      7:["Capacité de l'archétype de rôdeur"],
      8:["Amélioration de caractéristiques","Foulée tellurique (terrain difficile non magique ne coûte plus de mouvement)"],
      9:[],
      10:["Explorateur-né amélioré (3ème terrain)","Camouflage naturel (+10 Discrétion immobile)"],
      11:["Capacité de l'archétype de rôdeur"],
      12:["Amélioration de caractéristiques"],
      13:[],
      14:["Ennemi juré amélioré (3ème type)","Disparition (Se cacher en action bonus)"],
      15:["Capacité de l'archétype de rôdeur"],
      16:["Amélioration de caractéristiques"],
      17:[],
      18:["Sens sauvages (attaquer l'invisible sans désavantage, position des créatures invisibles à 9m)"],
      19:["Amélioration de caractéristiques"],
      20:["Tueur implacable (ajouter mod SAG à attaque ou dégâts vs ennemi juré, 1/tour)"],
    },
    asiLevels:[4,8,12,16,19],
    archetypeLevel:3,
    styleLevel:2,
    combatStyles:[
      {name:"Archerie",desc:"+2 aux jets d'attaque avec armes à distance."},
      {name:"Défense",desc:"+1 CA si tu portes une armure."},
      {name:"Duel",desc:"+2 aux dégâts avec une arme tenue en une main."},
      {name:"Combat à deux armes",desc:"Ajouter le modificateur de carac. aux dégâts de la seconde attaque."},
    ],
    spellsPerLevel:{2:2,3:1,5:1,7:1,9:1,11:1,13:1,15:1,17:1,19:1},
  },
  Roublard:{
    archetypes:[
      {name:"Voleur",desc:"Niv.3 : Mains lestes (l'action bonus de Ruse permet aussi : Escamotage, outils de voleur, Utiliser un objet), Monte-en-l'air (escalade sans surcoût de mouvement, saut en longueur +DEX×30cm). Niv.9 : Discrétion suprême (avantage à Discrétion si tu te déplaces d'au plus la moitié de ta vitesse). Niv.13 : Utilisation d'objets magiques (ignore les conditions de classe/race/niveau des objets magiques). Niv.17 : Réflexes de voleur (deux tours au 1er round : initiative normale puis initiative −10 ; pas si surpris).",icon:"🎭"},
      {name:"Escroc arcanique",desc:"Niv.3 : Incantation (INT, sorts de magicien enchantement/illusion) + Escamotage et main de mage (main invisible, vol/dépôt d'objets, crochetage à distance, contrôlée par l'action bonus de Ruse). Niv.9 : Embuscade magique (si tu es caché quand tu lances un sort, la cible a un désavantage au JS ce tour). Niv.13 : Escroc polyvalent (action bonus : la main de mage distrait une créature à 1,5m d'elle → avantage à tes attaques contre elle ce tour). Niv.17 : Voleur de sort (réaction contre un sort qui te cible : JS du lanceur ou le sort est annulé contre toi et tu le voles pendant 8h ; 1/repos long).",icon:"🔮"},
      {name:"Assassin",desc:"Niv.3 : Maîtrise kit de déguisement/empoisonneur, Assassinat (avantage sur créature n'ayant pas encore agi, coup critique si la cible est surprise). Niv.9 : Expert en infiltration (créer de fausses identités : 1 semaine + 25 po). Niv.13 : Imposteur (dupliquer voix/écriture/manières d'une personne étudiée 3h). Niv.17 : Frappe meurtrière (touche sur une cible surprise : JS CON DD 8+maîtrise+DEX ou les dégâts de l'attaque sont DOUBLÉS).",icon:"🗡"},
      {name:"Conspirateur",desc:"Niv.3 : Maître des intrigues (maîtrises kit déguisement, faussaire, jeu et deux langues), Maître des tactiques (action Aider en action bonus à portée 9m). Niv.9 : Manipulateur perspicace (Intuition/Tromperie doublement maîtrisées, lire les actions d'une cible). Niv.13 : Redirection (réaction : détourner une attaque contre toi vers une autre créature à 1,5m). Niv.17 : Âme de la duperie (pensées illisibles par télépathie — seules de fausses pensées sont lues ; la magie de vérité te voit toujours véridique et tu peux mentir dans les langues que tu connais).",icon:"🕵"},
    ],
    levelFeatures:{
      1:["Attaque sournoise (1d6)","Expertise (2×maîtrise sur 2 comp.)","Argot des voleurs"],
      2:["Ruse (action bonus: Foncer/Désengager/Se cacher)"],
      3:["Archétype (choix)","Attaque sournoise (2d6)"],
      4:["Amélioration de caractéristiques"],
      5:["Attaque sournoise (3d6)","Esquive instinctive (réaction : réduire dégâts d'une attaque de moitié)"],
      6:["Expertise (2 autres compétences)"],
      7:["Attaque sournoise (4d6)","Esquive totale (JS DEX réussi = 0 dégâts)"],
      8:["Amélioration de caractéristiques"],
      9:["Attaque sournoise (5d6)","Capacité de l'archétype"],
      10:["Amélioration de caractéristiques"],
      11:["Attaque sournoise (6d6)","Talent fiable (tout jet de compétence maîtrisée : d20 min 10)"],
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
      {name:"Lignée draconique",desc:"Ancêtre dragon (type au choix). Niv.1 : CA 13+DEX, parle draconique, PV max +1/niveau (Résistance draconique). Niv.6 : Affinité élémentaire (bonus dégâts + résistance). Niv.14 : Ailes draconiques. Niv.18 : Présence draconique.",icon:"🐉"},
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
      20:["Restauration ensorcelée (à chaque repos court : regagne 4 pts de sorcellerie)"],
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
      6:["Capacité du patron d'Outremonde"],
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
      {name:"Alchimiste",desc:"Niv.3 : maîtrise du matériel d'alchimiste + sorts d'alchimiste toujours préparés + Élixir expérimental (1/repos long, effet au d6 ; 2 au niv.6, 3 au niv.15 ; élixirs en plus via emplacements de sorts, effet au choix). Niv.5 : Érudit alchimique (+INT à un jet de soins ou de dégâts acide/feu/nécrotique/poison des sorts lancés via le matériel d'alchimiste). Niv.9 : Ingrédients revigorants (élixirs : +2d6+INT PV temporaires ; Restauration partielle gratuite INT/repos long). Niv.15 : Maîtrise chimique (résistance acide/poison, immunité à l'état empoisonné ; Restauration supérieure et Guérison 1×/repos long chacune).",icon:"⚗"},
      {name:"Artilleur",desc:"Niv.3 : maîtrise outils de menuisier + sorts d'artilleur toujours préparés + Canon occulte (action : canon TP/P, CA 18, PV 5×niv ; action bonus pour l'activer : Lance-flammes cône 4,5m 2d8 feu / Baliste de choc 2d8 force + repoussée 1,5m / Protecteur 1d8+INT PV temp à 3m ; 1/repos long ou via emplacement). Niv.5 : Arme à feu arcanique (baguette/bâton/sceptre gravé : +1d8 à un jet de dégâts du sort). Niv.9 : Canon explosif (+1d8 aux dégâts du canon ; action : détonation 6m, 3d8 force JS DEX). Niv.15 : Position fortifiée (abri partiel pour les alliés à 3m des canons ; 2 canons à la fois, activés par la même action bonus).",icon:"💥"},
      {name:"Forgeron de guerre",desc:"Niv.3 : maîtrise outils de forgeron + armes de guerre + sorts toujours préparés + Apte au combat (INT à la place de FOR/DEX pour attaque et dégâts des armes MAGIQUES) + Défenseur d'acier (compagnon : CA 15, PV 2+INT+5×niv, Morsure de force, Réparation 3/j, réaction Parade d'attaque). Niv.5 : Attaque supplémentaire. Niv.9 : Décharge arcanique (sur touche d'arme magique — toi ou le défenseur : +2d6 force OU soigner 2d6 à une créature à 9m ; INT/repos long, 1/tour). Niv.15 : Défenseur amélioré (décharge 4d6, défenseur +2 CA, sa Parade inflige 1d4+INT force).",icon:"🤖"},
      {name:"Maître armurier",desc:"Niv.3 : Armure d'arcanes + modèle Gardien (Poings de tonnerre 1d8 tonnerre, la cible a un désavantage contre les autres que toi ; Champ défensif : action bonus, PV temp = niveau) ou Infiltrateur (Lance-foudre 1d6 foudre à distance, +1d6 1×/tour ; +1,5m vitesse, avantage Discrétion). Niv.5 : Attaque supplémentaire. Niv.9 : Modifications d'armure (l'armure compte comme plusieurs objets pour tes imprégnations, +2 imprégnations max sur elle). Niv.15 : Armure parfaite (améliore ton modèle — cf. TCE).",icon:"🛡"},
    ],
    levelFeatures:{
      1:["Bricolage magique","Incantation (INT)"],
      2:["Imprégnation d'objet (4 imprégnations connues, 2 objets)"],
      3:["Spécialité d'artificier (choix)","Outil de circonstance"],
      4:["Amélioration de caractéristiques"],
      5:["Capacité de la spécialité","Sorts de spécialité supplémentaires"],
      6:["Expertise de l'outillage (maîtrise doublée avec les outils)","Imprégnations (6 connues, 3 objets)"],
      7:["Éclair de génie (réaction : +INT à un jet de carac./JS, toi ou allié à 9m)"],
      8:["Amélioration de caractéristiques"],
      9:["Capacité de la spécialité","Sorts de spécialité supplémentaires"],
      10:["Adepte des objets magiques (4 liens ; fabrication commun/peu commun ¼ temps, ½ or)","Imprégnations (8 connues, 4 objets)"],
      11:["Objet de stockage de sort (sort niv.1-2 stocké, 2×INT utilisations)"],
      12:["Amélioration de caractéristiques"],
      13:["Sorts de spécialité supplémentaires"],
      14:["Érudit des objets magiques (5 liens ; ignore les exigences des objets magiques)","Imprégnations (10 connues, 5 objets)"],
      15:["Capacité de la spécialité"],
      16:["Amélioration de caractéristiques"],
      17:["Sorts de spécialité supplémentaires"],
      18:["Maître des objets magiques (6 liens)","Imprégnations (12 connues, 6 objets)"],
      19:["Amélioration de caractéristiques"],
      20:["Âme de l'artifice (+1 aux JS par objet magique lié ; réaction à 0 PV : sacrifier une imprégnation → 1 PV)"],
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
  metamagicChoices:[],newSpells:[],swapOut:null,
  expertiseChoices:[],secretsChoices:[],mcSkillChoices:[],invocationChoices:[],
  hpRoll:null,hpConfirmed:false,
};
function resetLU(){LU={step:1,steps:[],choice:null,mcTarget:null,asiChoice:null,archetypeChoice:null,styleChoice:null,terrainChoice:null,metamagicChoices:[],newSpells:[],swapOut:null,expertiseChoices:[],secretsChoices:[],mcSkillChoices:[],invocationChoices:[],hpRoll:null,hpConfirmed:false};_luSpellSearch='';_luSecretsSearch='';}

function _luConfirmHP(roll,avg){
  const used=roll!==null?roll:avg;
  openModal(`<div style="text-align:center;padding:16px 12px">
    <div style="font-size:32px;margin-bottom:8px">${roll!==null?'🎲':'📊'}</div>
    <div class="pt" style="margin-bottom:8px">Confirmer les PV gagnés</div>
    <div style="font-size:18px;font-weight:700;color:var(--cp);margin-bottom:8px">${used>0?'+'+used:used} PV${roll!==null?' (dé lancé)':' (moyenne)'}</div>
    <div style="font-size:13px;color:var(--text3);margin-bottom:16px">Ce choix est <strong>définitif</strong> — il ne pourra pas être modifié.</div>
    <div style="display:flex;gap:8px;justify-content:center">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="LU.hpRoll=${roll!==null?roll:'null'};LU.hpConfirmed=true;closeModal();renderTab()">✓ Confirmer</button>
    </div>
  </div>`);
}
function _luRollHP(hdVal,avg){
  if(typeof _isIRLMode==='function'&&_isIRLMode()){_luIRLHP(hdVal,avg);}
  else{_luConfirmHP(Math.ceil(Math.random()*hdVal),avg);}
}
function _luIRLHP(hdVal,avg){
  openModal(`<div style="text-align:center;padding:16px 12px">
    <div style="font-size:32px;margin-bottom:8px">🎲</div>
    <div class="pt" style="margin-bottom:8px">Lancer le dé de vie — Mode IRL</div>
    <div style="font-size:28px;font-weight:700;color:var(--cp);margin-bottom:12px">1d${hdVal}</div>
    <div style="font-size:13px;color:var(--text3);margin-bottom:12px">Lance ton vrai dé et entre le résultat :</div>
    <input class="fi" id="luIRLHPInput" type="number" min="1" max="${hdVal}" style="text-align:center;font-size:16px;margin-bottom:14px;width:80px">
    <div style="display:flex;gap:8px;justify-content:center">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="(()=>{const v=parseInt(document.getElementById('luIRLHPInput')?.value)||0;if(v<1||v>${hdVal}){showToast('❌ Valeur invalide (1-${hdVal})');return;}closeModal();_luConfirmHP(v,${avg});})()">Valider</button>
    </div>
  </div>`);
}

function _parseFeatAbilityGrants(tx){
  if(!tx)return[];
  const keys=['Force','Dextérité','Constitution','Intelligence','Sagesse','Charisme'];
  const m=tx.match(/Augmentez votre score de ([\wÀ-ÿ,\s']+?) de 1/i);
  if(!m)return[];
  const part=m[1];
  return keys.reduce((acc,k,i)=>part.includes(k)?[...acc,i]:acc,[]);
}

function _checkFeatPrereqs(f,p){
  // Retourne null si aucun prérequis connu, sinon {ok:bool, reasons:[{label,ok}]}
  const nm=f.n||'';
  const checks=[];
  const ap=p.armorProfs||[];
  const hasArmor=t=>ap.some(a=>a.toLowerCase().includes(t));
  const _canCast=(p)=>(p.spells||[]).length>0||(p.classes||[]).some(c=>{const d=SRD.classes.find(cl=>cl.name===c.name);return d&&d.spellcaster;});
  // Armures
  if(/lourdement blind/i.test(nm))
    checks.push({label:'Armure intermédiaire maîtrisée',ok:hasArmor('interm')});
  if(/mod[eé]r[eé]ment blind/i.test(nm))
    checks.push({label:'Armure légère maîtrisée',ok:ap.some(a=>/l[eé]g[eè]re?/i.test(a))});
  if(/maître des armures lourdes/i.test(nm))
    checks.push({label:'Armure lourde maîtrisée',ok:hasArmor('lourde')});
  if(/maître des armures moyennes/i.test(nm))
    checks.push({label:'Armure intermédiaire maîtrisée',ok:hasArmor('interm')});
  // Incantation
  if(/lanceur de guerre/i.test(nm))
    checks.push({label:'Pouvoir lancer au moins 1 sort',ok:_canCast(p)});
  if(/adepte de m[eé]tamagie/i.test(nm))
    checks.push({label:'Classe Ensorceleur requise',ok:(p.classes||[]).some(c=>c.name==='Ensorceleur')});
  // Race
  if(/haute magie.*elfe|magie des elfes|magie des svirfnebelin|drow haute/i.test(nm))
    checks.push({label:'Race Elfe / Drow requise',ok:/elfe|drow|svirfnebelin/i.test(p.race||'')});
  if(!checks.length)return null;
  return{ok:checks.every(c=>c.ok),reasons:checks};
}

const DRUID_CIRCLE_FEATS={
  'Cercle de la lune':{
    6:{name:'Frappe primitive',desc:'Tes attaques en forme animale sont considérées comme magiques et ignorent les résistances aux dégâts non magiques. Ta Forme sauvage atteint un CR max = ton niveau de druide ÷ 3 (arrondi à l\'inférieur).'},
    10:{name:'Forme sauvage élémentaire',desc:'Tu peux dépenser 2 utilisations de Forme sauvage en même temps pour te transformer en élémentaire de l\'air, de l\'eau, de la terre ou du feu.'},
    14:{name:'Mille formes',desc:"Tu peux lancer Modification d'apparence à volonté."}
  },
  'Cercle de la terre':{
    6:{name:'Foulée tellurique',desc:'Les terrains difficiles non-magiques ne te coûtent pas de déplacement supplémentaire, et tu traverses les plantes non magiques (épines incluses) sans dégâts. Avantage aux JS contre les plantes magiques qui gênent le mouvement.'},
    10:{name:'Protégé de dame Nature',desc:'Tu ne peux être ni charmé ni effrayé par les élémentaires et les fées, et tu es immunisé contre le poison et les maladies.'},
    14:{name:'Sanctuaire de dame Nature',desc:"Les bêtes et plantes doivent réussir un JS Sagesse contre ton DD de sort de druide pour t'attaquer, sinon elles choisissent une autre cible (réussite = immunisée 24 h)."}
  }
};
function _resolveDruidCircleFeat(featName,circleArchetype,level){
  if(featName!=='Capacité du cercle')return null;
  const circleFeat=circleArchetype&&DRUID_CIRCLE_FEATS[circleArchetype];
  return circleFeat&&circleFeat[level]?circleFeat[level]:null;
}

// Noms FR = textes de règles officiels (Documents sources). Le champ en = nom anglais canonique,
// utilisé pour retrouver le sort dans le compendium installé si sa traduction FR diffère (voir getDruidCircleSpells).
const DRUID_CIRCLE_SPELLS={
  'Arctique':[
    {name:"Croissance d'épines",en:'Spike Growth',level:2},{name:'Immobilisation de personne',en:'Hold Person',level:2},
    {name:'Lenteur',en:'Slow',level:3},{name:'Tempête de neige',en:'Sleet Storm',level:3},
    {name:'Liberté de mouvement',en:'Freedom of Movement',level:4},{name:'Tempête de grêle',en:'Ice Storm',level:4},
    {name:'Communion avec la nature',en:'Commune with Nature',level:5},{name:'Cône de froid',en:'Cone of Cold',level:5}
  ],
  'Désert':[
    {name:'Flou',en:'Blur',level:2},{name:'Silence',en:'Silence',level:2},
    {name:"Création de nourriture et d'eau",en:'Create Food and Water',level:3},{name:"Protection contre l'énergie",en:'Protection from Energy',level:3},
    {name:'Flétrissement',en:'Blight',level:4},{name:'Terrain hallucinatoire',en:'Hallucinatory Terrain',level:4},
    {name:"Fléau d'insectes",en:'Insect Plague',level:5},{name:'Mur de pierre',en:'Wall of Stone',level:5}
  ],
  'Forêt':[
    {name:"Pattes d'araignée",en:'Spider Climb',level:2},{name:"Peau d'écorce",en:'Barkskin',level:2},
    {name:'Appel de la foudre',en:'Call Lightning',level:3},{name:'Croissance végétale',en:'Plant Growth',level:3},
    {name:'Divination',en:'Divination',level:4},{name:'Liberté de mouvement',en:'Freedom of Movement',level:4},
    {name:'Communion avec la nature',en:'Commune with Nature',level:5},{name:'Passage par les arbres',en:'Tree Stride',level:5}
  ],
  'Littoral':[
    {name:'Foulée brumeuse',en:'Misty Step',level:2},{name:'Image miroir',en:'Mirror Image',level:2},
    {name:"Marche sur l'eau",en:'Water Walk',level:3},{name:'Respiration aquatique',en:'Water Breathing',level:3},
    {name:"Contrôle de l'eau",en:'Control Water',level:4},{name:'Liberté de mouvement',en:'Freedom of Movement',level:4},
    {name:"Invocation d'élémentaire",en:'Conjure Elemental',level:5},{name:'Scrutation',en:'Scrying',level:5}
  ],
  'Marais':[
    {name:'Flèche acide de Melf',en:"Melf's Acid Arrow",level:2},{name:'Ténèbres',en:'Darkness',level:2},
    {name:"Marche sur l'eau",en:'Water Walk',level:3},{name:'Nuage nauséabond',en:'Stinking Cloud',level:3},
    {name:'Liberté de mouvement',en:'Freedom of Movement',level:4},{name:'Localisation de créature',en:'Locate Creature',level:4},
    {name:"Fléau d'insectes",en:'Insect Plague',level:5},{name:'Scrutation',en:'Scrying',level:5}
  ],
  'Montagne':[
    {name:"Croissance d'épines",en:'Spike Growth',level:2},{name:"Pattes d'araignée",en:'Spider Climb',level:2},
    {name:'Éclair',en:'Lightning Bolt',level:3},{name:'Fusion dans la pierre',en:'Meld into Stone',level:3},
    {name:'Façonnage de la pierre',en:'Stone Shape',level:4},{name:'Peau de pierre',en:'Stoneskin',level:4},
    {name:'Mur de pierre',en:'Wall of Stone',level:5},{name:'Passe-muraille',en:'Passwall',level:5}
  ],
  'Outreterre':[
    {name:"Pattes d'araignée",en:'Spider Climb',level:2},{name:"Toile d'araignée",en:'Web',level:2},
    {name:'Forme gazeuse',en:'Gaseous Form',level:3},{name:'Nuage nauséabond',en:'Stinking Cloud',level:3},
    {name:'Façonnage de la pierre',en:'Stone Shape',level:4},{name:'Invisibilité supérieure',en:'Greater Invisibility',level:4},
    {name:'Brume mortelle',en:'Cloudkill',level:5},{name:"Fléau d'insectes",en:'Insect Plague',level:5}
  ],
  'Plaine':[
    {name:'Invisibilité',en:'Invisibility',level:2},{name:'Passage sans trace',en:'Pass without Trace',level:2},
    {name:'Hâte',en:'Haste',level:3},{name:'Lumière du jour',en:'Daylight',level:3},
    {name:'Divination',en:'Divination',level:4},{name:'Liberté de mouvement',en:'Freedom of Movement',level:4},
    {name:"Fléau d'insectes",en:'Insect Plague',level:5},{name:'Songe',en:'Dream',level:5}
  ]
};

function getDruidCircleSpells(p){
  const druEntry=(p.classes||[]).find(c=>c.name==='Druide');
  if(!druEntry||druEntry.level<3)return[];
  const arch=(p.archetype||{})['Druide']||'';
  if(!arch.toLowerCase().includes('terre'))return[];
  const terrain=p.druidTerrain||'';
  if(!terrain)return[];
  const spells=DRUID_CIRCLE_SPELLS[terrain]||[];
  const druLvl=druEntry.level;
  const maxSlotLvl=druLvl>=9?5:druLvl>=7?4:druLvl>=5?3:2;
  // Résolution tolérante contre le compendium installé : si le nom FR officiel (source) n'existe pas
  // dans la DB (traduction différente ou encore en anglais), on retrouve le sort par son nom EN canonique
  // et on renvoie le nom réellement installé → le « toujours préparé » matche quel que soit l'état de la traduction.
  const _db=(typeof getSpellsDB==='function')?(getSpellsDB()||[]):[];
  const _n=x=>String(x||'').toLowerCase().trim();
  return spells.filter(s=>s.level<=maxSlotLvl).map(s=>{
    if(_db.length&&!_db.some(d=>_n(d.name)===_n(s.name))){
      const hit=s.en?_db.find(d=>_n(d.nameEN)===_n(s.en)||_n(d.name)===_n(s.en)):null;
      if(hit)return{name:hit.name,level:s.level};
    }
    return s;
  });
}

// Calcule les étapes nécessaires pour cette montée de niveau
function calcLUSteps(p,className,newClassLevel){
  const cd=CLASS_LEVEL_DATA[className];
  const steps=['direction'];
  if(cd){
    const isASI=cd.asiLevels&&cd.asiLevels.includes(newClassLevel);
    const isArchetype=cd.archetypeLevel===newClassLevel;
    const isStyle=cd.styleLevel===newClassLevel;
    const _PREPARED=['Clerc','Druide','Paladin','Artificier'];
    const needSpells=!_PREPARED.includes(className)&&cd.spellsPerLevel&&cd.spellsPerLevel[newClassLevel];
    const isMetamagic=className==='Ensorceleur'&&[3,10,17].includes(newClassLevel);
    const isOrigin=className==='Ensorceleur'&&newClassLevel===1;
    const _EXPERTISE_LVL={'Barde':[3,10],'Roublard':[1,6]};
    const needExpertise=_EXPERTISE_LVL[className]&&_EXPERTISE_LVL[className].includes(newClassLevel);
    const needSecrets=className==='Barde'&&[10,14,18].includes(newClassLevel);
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
    ${displaySteps.map((s,i)=>`<span class="cp-step${i<LU.step-1?' done':i===LU.step-1?' active':''}">${i<LU.step-1?'✓ ':''+(i+1)+'. '}${stepLabels[s]||s}</span>${i<displaySteps.length-1?'<span style="color:var(--text3);font-size:12px;align-self:center">›</span>':''}`).join('')}
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
    <div class="pt" style="color:var(--cp);font-size:15px">⬆ Passage au niveau ${newLvl}</div>
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
    ${LU.choice==='multiclass'?`<div style="margin-top:12px"><p style="font-size:13px;color:var(--text2);margin-bottom:10px">Choisis la classe (vert = prérequis OK) :</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${SRD.classes.map(c=>{
      const alr=(p.classes||[]).find(cl=>cl.name===c.name);
      const req=checkMcReq(p,c.name);
      return`<div style="background:var(--surface2);border:2px solid ${LU.mcTarget===c.name?'var(--cp)':req.ok?'var(--border)':'var(--border)'};border-radius:2px;padding:10px;cursor:${req.ok?'pointer':'not-allowed'};opacity:${req.ok?1:.4};text-align:center;transition:all .2s" onclick="${req.ok?`LU.mcTarget='${jsq(c.name)}';renderTab()`:''}">
        <div style="font-family:var(--F);font-size:13px;color:var(--cp)">${esc(c.name)}</div>
        <div style="font-size:12px;color:var(--text3)">${c.hd}${c.spellcaster?' ✦':''}</div>
        ${alr?`<div style="font-size:12px;color:var(--good)">Niv.${alr.level}</div>`:''}
        ${req.ok?`<div style="font-size:12px;color:var(--good)">✓</div>`:`<div style="font-size:12px;color:var(--danger)">${req.msg}</div>`}
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
    ${styles.map(s=>`<div class="lu-choice${LU.styleChoice===s.name?' selected':''}" onclick="LU.styleChoice='${jsq(s.name)}';renderTab()">
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
  const needsTerrain=isDruide&&LU.archetypeChoice==='Cercle de la terre';
  const terrains=['Arctique','Désert','Forêt','Littoral','Marais','Montagne','Outreterre','Plaine'];
  const canContinue=LU.archetypeChoice&&(!needsTerrain||LU.terrainChoice);
  const terrainSection=needsTerrain?`<div style="margin-top:12px;padding:10px;background:var(--surface2);border-radius:2px">
    <div style="font-size:13px;font-weight:600;color:var(--cp);margin-bottom:8px">🗺 Choisis ton terrain</div>
    <div style="font-size:13px;color:var(--text3);margin-bottom:8px">Détermine tes sorts de cercle — toujours préparés, ne comptent pas dans le quota.</div>
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
  const selFeatData=isFeat&&choice.featName&&FEATS_DB?FEATS_DB.find(f=>f.n===choice.featName):null;
  const featGrants=selFeatData?_parseFeatAbilityGrants(selFeatData.tx):[];
  const needStatPick=featGrants.length>1;
  const valid=isFeat?!!choice.featName&&(!needStatPick||choice.stats.length>0):(choice.type==='asi'&&choice.stats.length===1)||(choice.type==='double'&&choice.stats.length===2);

  const statPickerSection=needStatPick?`<div style="margin-top:10px;padding:10px;background:var(--surface2);border-radius:2px">
    <div style="font-size:13px;font-weight:600;color:var(--cp);margin-bottom:8px">Ce don accorde <strong>+1</strong> à une caractéristique de ton choix :</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">
      ${featGrants.map(i=>`<div onclick="LU.asiChoice.stats=[${i}];renderTab()" style="text-align:center;padding:8px 4px;background:${choice.stats[0]===i?'rgba(76,175,80,.18)':'var(--surface)'};border:2px solid ${choice.stats[0]===i?'var(--good)':'var(--border)'};border-radius:2px;cursor:pointer;transition:all .2s">
        <div style="font-size:12px;color:var(--text3)">${ABILITIES[i]}</div>
        <div style="font-size:18px;font-weight:700;color:${choice.stats[0]===i?'var(--good)':'var(--text)'}">${ab[i]}</div>
        <div style="font-size:13px;color:var(--cp)">${fmt(mod(ab[i]))}</div>
        ${choice.stats[0]===i?`<div style="font-size:13px;color:var(--good)">+1 ✓</div>`:''}
      </div>`).join('')}
    </div>
  </div>`:'';

  const featGrantInfo=featGrants.length===1?`<div style="margin-top:6px;font-size:13px;color:var(--good)">+1 ${ABILITIES[featGrants[0]]} inclus automatiquement</div>`:'';

  const featSection=isFeat?(FEATS_DB?`
    <input class="fi" id="featSearch" placeholder="Rechercher un don (ex: Alert, Actor...)..." oninput="luFilterFeats(this.value)" style="margin-bottom:8px">
    ${choice.featName?(()=>{const selPrereq=selFeatData?_checkFeatPrereqs(selFeatData,p):null;const prereqRow=selPrereq?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px">${selPrereq.reasons.map(r=>`<span style="font-size:12px;color:${r.ok?'var(--good)':'var(--danger)'};background:${r.ok?'rgba(76,175,80,.1)':'rgba(229,57,53,.1)'};border-radius:3px;padding:2px 6px">${r.ok?'✅':'❌'} ${esc(r.label)}</span>`).join('')}</div>`:'';return`<div style="padding:10px;background:rgba(76,175,80,.1);border:1px solid var(--good);border-radius:2px;margin-bottom:8px">
      <div style="font-size:13px;font-weight:600;color:var(--good)">✓ ${esc(choice.featName)}</div>
      <div style="font-size:13px;color:var(--text2);margin-top:4px;line-height:1.4">${esc(selFeatData?selFeatData.tx:''||'')}</div>
      ${prereqRow}
      ${featGrantInfo}
      ${statPickerSection}
      <button class="btn bsm" style="margin-top:8px;font-size:13px" onclick="LU.asiChoice.featName='';LU.asiChoice.stats=[];renderTab()">Changer</button>
    </div>`})():''}
    <div id="featResults"></div>
  `:`<div style="text-align:center;padding:14px;color:var(--text3);font-size:13px">Compendium non chargé — patiente un instant puis reviens à cet écran.</div>`):'';

  return`<div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:12px">Amélioration de caractéristiques — Choisis l'une des options :</p>
    <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">
      <button class="smb${!LU.asiChoice||LU.asiChoice.type==='double'?' on':''}" onclick="LU.asiChoice={type:'double',stats:[],val:1};renderTab()">+1 à deux stats</button>
      <button class="smb${LU.asiChoice&&LU.asiChoice.type==='asi'?' on':''}" onclick="LU.asiChoice={type:'asi',stats:[],val:2};renderTab()">+2 à une stat</button>
      <button class="smb${isFeat?' on':''}" onclick="LU.asiChoice={type:'feat',featName:'',stats:[],val:0};if(!FEATS_DB)loadFeatsDB(()=>renderTab());else renderTab()">🎯 Prendre un Don</button>
    </div>
    ${isFeat?featSection:`
      <p style="font-size:13px;color:var(--text3);margin-bottom:10px">Maximum 20. Clique sur les caractéristiques à améliorer :</p>
      <div class="g6">
        ${ABILITIES.map((ab_name,i)=>{
          const cur=ab[i];const isSel=choice.stats.includes(i);const atMax=cur>=20;
          const canSel=!isSel&&((choice.type==='double'&&choice.stats.length<2)||(choice.type==='asi'&&choice.stats.length<1));
          const bonus=isSel?choice.val:0;
          return`<div class="sb hi${isSel?' selected':''}" style="cursor:${atMax?'not-allowed':'pointer'};border-color:${isSel?'var(--good)':atMax?'var(--border)':'var(--border)'};" onclick="${atMax||(!canSel&&!isSel)?'':('luToggleASI('+i+')')}">
            <div class="sn">${ABILITIES_SH[i]}</div>
            <div style="font-size:18px;font-weight:700;color:${isSel?'var(--good)':atMax?'var(--text3)':'var(--text)'}">${cur+bonus}</div>
            <div style="font-size:13px;color:${isSel?'var(--good)':'var(--cp)'};">${fmt(mod(cur+bonus))}</div>
            ${isSel?`<div style="font-size:13px;color:var(--good)">+${choice.val}</div>`:''}
            ${atMax?`<div style="font-size:13px;color:var(--text3)">MAX</div>`:''}
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
let _luFeatPage=0;
function _luFeatPageGo(d){_luFeatPage=(_luFeatPage||0)+d;if(_luFeatPage<0)_luFeatPage=0;luFilterFeats('');}
function luFilterFeats(q){
  const el=document.getElementById('featResults');if(!el||!FEATS_DB)return;
  const p=P();
  const _featCard=(f,prereq)=>{
    const grants=_parseFeatAbilityGrants(f.tx);
    const grantBadge=grants.length?` <span style="font-size:12px;color:var(--good);font-weight:400;background:rgba(76,175,80,.12);border-radius:3px;padding:1px 5px">+1 ${grants.map(i=>ABILITIES_SH[i]).join('/')}</span>`:'';
    const prereqFail=prereq&&!prereq.ok;
    const prereqRow=prereq?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">${prereq.reasons.map(r=>`<span style="font-size:12px;color:${r.ok?'var(--good)':'var(--danger)'};background:${r.ok?'rgba(76,175,80,.1)':'rgba(229,57,53,.1)'};border-radius:3px;padding:1px 5px">${r.ok?'✅':'❌'} ${esc(r.label)}</span>`).join('')}</div>`:'';
    return`<div class="lu-choice" style="margin-bottom:6px;padding:8px 10px;cursor:pointer;opacity:${prereqFail?.55:1}" onclick="LU.asiChoice.featName='${jsq(f.n)}';LU.asiChoice.stats=[];renderTab()">
      <h3 style="font-size:13px;margin-bottom:4px">${esc(f.n)}${grantBadge}</h3>
      <p style="font-size:13px;color:var(--text2);line-height:1.4">${esc(f.tx||'')}</p>
      ${prereqRow}
    </div>`;
  };
  const _sortAndCard=(list)=>{
    const withPrereq=list.map(f=>({f,prereq:_checkFeatPrereqs(f,p)}));
    withPrereq.sort((a,b)=>{
      const aOk=!a.prereq||a.prereq.ok;const bOk=!b.prereq||b.prereq.ok;
      return aOk===bOk?0:aOk?-1:1;
    });
    return withPrereq.map(({f,prereq})=>_featCard(f,prereq)).join('');
  };
  // Fix 5 — Filtrer les dons à prérequis lanceur pour les non-lanceurs
  const _isSpellcaster=(p.spells||[]).length>0||(p.classes||[]).some(c=>{const d=SRD.classes.find(cl=>cl.name===c.name);return d&&d.spellcaster;});
  const _spellFeatKeywords=['lanceur de sorts','emplacement de sort','modifier un sort','point de sorcellerie','incantation'];
  const _filterSpellFeat=(f)=>{
    if(_isSpellcaster)return true;
    const tx=(f.tx||'').toLowerCase()+(f.n||'').toLowerCase();
    return!_spellFeatKeywords.some(k=>tx.includes(k));
  };
  if(!q.trim()){
    const all=FEATS_DB.filter(_filterSpellFeat);
    const pageSize=24;
    const totalPages=Math.max(1,Math.ceil(all.length/pageSize));
    if(_luFeatPage>=totalPages)_luFeatPage=totalPages-1;
    if(_luFeatPage<0)_luFeatPage=0;
    const pageItems=all.slice(_luFeatPage*pageSize,_luFeatPage*pageSize+pageSize);
    const nav=`<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin:8px 0">
      <button class="btn bsm" ${_luFeatPage<=0?'disabled':''} onclick="_luFeatPageGo(-1)">← Précédents</button>
      <span style="font-size:13px;color:var(--text3);text-align:center">Page ${_luFeatPage+1}/${totalPages} · ${all.length} dons</span>
      <button class="btn bsm" ${_luFeatPage>=totalPages-1?'disabled':''} onclick="_luFeatPageGo(1)">Suivants →</button>
    </div>`;
    el.innerHTML=nav+_sortAndCard(pageItems)+nav;
    return;
  }
  const low=q.toLowerCase();
  const res=[];
  for(let i=0;i<FEATS_DB.length&&res.length<18;i++){
    if(FEATS_DB[i].n&&FEATS_DB[i].n.toLowerCase().includes(low)&&_filterSpellFeat(FEATS_DB[i]))res.push(FEATS_DB[i]);
  }
  el.innerHTML=res.length?_sortAndCard(res):'<div style="font-size:13px;color:var(--text3);text-align:center;padding:8px">Aucun résultat.</div>';
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
  // Cantrip(s) comptés SÉPARÉMENT des sorts à niveau ; +1 sort si on remplace un sort connu (swap RAW).
  const isGrimoire=PREP_CASTERS.includes(className);     // Magicien → grimoire (sorts non préparés)
  const canSwap=!isGrimoire;                             // swap réservé aux lanceurs "connus" (pas le Magicien)
  const needCantrip=isCantripLevel?1:0;
  const leveledCount=Math.max(0,count-needCantrip)+(LU.swapOut?1:0);
  const selCantrips=sel.filter(n=>{const s=_spDb.find(x=>x.name===n);return s&&s.level===0;});
  const selLeveled=sel.filter(n=>{const s=_spDb.find(x=>x.name===n);return !s||s.level>=1;});
  const cantripFull=selCantrips.length>=needCantrip;
  const leveledFull=selLeveled.length>=leveledCount;
  const ready=cantripFull&&leveledFull;
  const spellRow=(s)=>{const isSel=sel.includes(s.name);const isC=s.level===0;const dis=!isSel&&(isC?cantripFull:leveledFull);const sid='luspd_'+(s.name||'').replace(/[^a-zA-Z0-9]/g,'_');const meta=[s.level===0?'Sort mineur':'Niv. '+s.level,s.school,s.castTime,s.range].filter(Boolean).join(' · ');return`<div style="margin-bottom:3px"><div class="sk-choice${isSel?' selected':dis?' disabled':''}" onclick="${dis?'':'luToggleSpell(\''+esc(s.name)+'\')'}"><span class="sk-dot${isSel?' p':''}"></span><span style="flex:1;font-size:13px">${esc(s.name)}${s.level>1?` <span style="font-size:12px;color:var(--text3)">niv.${s.level}</span>`:''}</span><span style="font-size:13px;color:var(--text3)">${esc(s.school||'')}</span><span onclick="event.stopPropagation();var d=document.getElementById('${sid}');if(d)d.style.display=d.style.display==='none'?'block':'none'" style="cursor:pointer;color:var(--cp);font-size:14px;padding:0 5px" title="Voir la description">ⓘ</span>${isSel?`<span style="color:var(--cp)">✓</span>`:''}</div><div id="${sid}" style="display:none;white-space:pre-wrap;font-size:13px;color:var(--text2);line-height:1.5;padding:6px 10px;background:var(--surface2);border-radius:0 0 6px 6px">${meta?`<div style="color:var(--text3);margin-bottom:4px">${esc(meta)}</div>`:''}${esc(s.desc||'Pas de description disponible.')}</div></div>`;};
  // Section "remplacer un sort connu" (lanceurs connus uniquement)
  const ownLeveled=(p.spells||[]).filter(s=>{const d=_spDb.find(x=>x.name===s.name);return d?d.level>=1:false;});
  const swapHtml=(canSwap&&ownLeveled.length)?`<details style="margin-top:14px;border-top:1px solid var(--border);padding-top:10px">
    <summary style="cursor:pointer;font-size:13px;color:var(--text2);list-style:none">🔄 Remplacer un sort connu <span style="color:var(--text3)">(optionnel — 1 par niveau)</span>${LU.swapOut?` <span style="color:var(--cp)">: ${esc(LU.swapOut)}</span>`:''}</summary>
    <div style="margin-top:8px">
      <p style="font-size:13px;color:var(--text3);margin-bottom:6px">Oublie un sort connu : tu pourras choisir 1 sort de plus ci-dessus en remplacement.</p>
      ${ownLeveled.map(s=>{const on=LU.swapOut===s.name;return`<div class="sk-choice${on?' selected':''}" onclick="luToggleSwap('${jsq(s.name)}')"><span class="sk-dot${on?' p':''}"></span><span style="flex:1;font-size:13px">${esc(s.name)}</span>${on?`<span style="color:var(--cp)">↺</span>`:''}</div>`;}).join('')}
    </div>
  </details>`:'';
  const needLabel=[needCantrip?`${needCantrip} sort mineur`:'',leveledCount?`${leveledCount} sort${leveledCount>1?'s':''}`:''].filter(Boolean).join(' + ')||'aucun sort';
  return`<div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:8px">Choisis <strong style="color:var(--cp)">${needLabel}</strong>.${isGrimoire?' <span style="font-size:13px;color:var(--text3)">(ajoutés à ton grimoire — à préparer ensuite)</span>':''} <span style="font-size:13px;color:var(--text3)">(${needCantrip?selCantrips.length+'/'+needCantrip+' mineur · ':''}${selLeveled.length}/${leveledCount} sort${leveledCount>1?'s':''})</span></p>
    <input type="text" placeholder="🔍 Rechercher..." value="${esc(_luSpellSearch)}" oninput="_luSpellSearch=this.value;renderTab()" style="width:100%;box-sizing:border-box;padding:7px 10px;background:var(--surface2);border:1px solid var(--border);border-radius:2px;color:var(--text);font-size:13px;margin-bottom:8px">
    ${isCantripLevel?`<div style="font-size:13px;font-weight:600;color:var(--cp);margin:8px 0 4px">Sorts mineurs</div>${cantrips.length?cantrips.map(spellRow).join(''):'<div style="font-size:13px;color:var(--text3);padding:4px 0">Aucun résultat.</div>'}`:``}
    <div style="font-size:13px;font-weight:600;color:var(--cp);margin:8px 0 4px">Sorts niveau 1</div>
    ${l1.length?l1.map(spellRow).join(''):'<div style="font-size:13px;color:var(--text3);padding:4px 0">Aucun résultat.</div>'}
    ${maxLvl>=2?`<div style="font-size:13px;font-weight:600;color:var(--cp);margin:8px 0 4px">Sorts niveau 2–${maxLvl}</div>${l2plus.length?l2plus.map(spellRow).join(''):'<div style="font-size:13px;color:var(--text3);padding:4px 0">Aucun sort disponible à ce niveau.</div>'}`:``}
    ${swapHtml}
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn" style="flex:1" onclick="LU.step--;_luSpellSearch='';renderTab()">← Retour</button>
      <button class="btn bac" style="flex:2" onclick="LU.step++;_luSpellSearch='';renderTab()" ${ready?'':'disabled'}>Continuer →</button>
    </div>
  </div>`;
}
function luToggleSpell(name){const idx=LU.newSpells.indexOf(name);if(idx>=0)LU.newSpells.splice(idx,1);else LU.newSpells.push(name);renderTab();}
function luToggleSwap(name){
  if(LU.swapOut===name){
    LU.swapOut=null;
    // On a perdu le sort de remplacement autorisé → retirer un sort à niveau en trop si besoin.
    const p=P();const mc=mainClass(p);const cd=mc?CLASS_LEVEL_DATA[mc.name]:null;
    const entry=p.classes.find(c=>c.name===(mc?mc.name:''));
    const newCLvl=(entry?entry.level:1)+1;
    const count=cd&&cd.spellsPerLevel?cd.spellsPerLevel[newCLvl]||0:0;
    const isCantripLevel=!!(cd&&cd.cantripAtLevels&&cd.cantripAtLevels.includes(newCLvl));
    const leveledMax=Math.max(0,count-(isCantripLevel?1:0));
    const _db=getSpellsDB();
    const leveledSel=LU.newSpells.filter(n=>{const s=_db.find(x=>x.name===n);return !s||s.level>=1;});
    while(leveledSel.length>leveledMax){const rm=leveledSel.pop();const i=LU.newSpells.indexOf(rm);if(i>=0)LU.newSpells.splice(i,1);}
  }else{
    LU.swapOut=name;
  }
  renderTab();
}

// ── Expertise ──
function luStepExpertise(p){
  const profSkills=SKILLS.filter(sk=>(p.skillProf||{})[sk.name]===1);
  const sel=LU.expertiseChoices;const count=2;
  return`<div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:8px">Choisis <strong style="color:var(--cp)">${count}</strong> compétences maîtrisées pour doubler ton bonus (expertise). (${sel.length}/${count})</p>
    ${profSkills.length?profSkills.map(sk=>{const isSel=sel.includes(sk.name);const dis=!isSel&&sel.length>=count;return`<div class="sk-choice${isSel?' selected':dis?' disabled':''}" onclick="${dis?'':'luToggleExpertise(\''+esc(sk.name)+'\')'}"><span class="sk-dot${isSel?' p':''}"></span><span style="flex:1;font-size:13px">${esc(sk.name)}</span><span style="font-size:13px;color:var(--text3)">${ABILITIES_SH[sk.ab]}</span>${isSel?`<span style="color:var(--cp)">✓ Expertise</span>`:''}</div>`;}).join(''):`<div style="font-size:13px;color:var(--text3);font-style:italic;padding:8px 0">Aucune compétence maîtrisée disponible. Ajoute des maîtrises d'abord dans l'onglet Compétences.</div>`}
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
    ${available.map(sk=>{const isSel=sel.includes(sk);const alreadyHas=already[sk]>=1;const dis=alreadyHas||(!isSel&&sel.length>=count);return`<div class="sk-choice${isSel?' selected':dis?' disabled':''}" onclick="${(dis&&!isSel)?'':'luToggleMcSkill(\''+esc(sk)+'\')'}"><span class="sk-dot${isSel?' p':''}"></span><span style="flex:1;font-size:13px">${esc(sk)}</span>${alreadyHas?`<span style="font-size:13px;color:var(--text3)">déjà maîtrisée</span>`:isSel?`<span style="color:var(--cp)">✓</span>`:''}</div>`;}).join('')}
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
    ${alreadyHas.length?`<div style="font-size:13px;color:var(--text3);margin-bottom:8px;padding:5px 8px;background:var(--surface2);border-radius:2px">Déjà choisies : ${alreadyHas.map(n=>esc(n)).join(', ')}</div>`:''}
    ${available.map(inv=>{
      const isSel=sel.includes(inv.name);const dis=!isSel&&sel.length>=toChoose;
      return`<div class="lu-choice${isSel?' selected':dis?' disabled':''}" style="margin-bottom:6px;padding:8px 10px;cursor:${dis?'default':'pointer'}" onclick="${dis?'':'luToggleInvocation(\''+esc(inv.name)+'\')'}">
        <div style="display:flex;align-items:flex-start;gap:8px">
          <span style="color:var(--cp);font-size:14px;margin-top:1px;flex-shrink:0">${isSel?'✓':'◯'}</span>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600">${esc(inv.name)}${inv.minLevel>0?` <span style="font-size:12px;color:var(--text3);font-weight:400">niv.${inv.minLevel}+</span>`:''}</div>
            <div style="font-size:13px;color:var(--text2);margin-top:3px;line-height:1.4">${esc(inv.desc)}</div>
          </div>
        </div>
      </div>`;
    }).join('')}
    ${!available.length?`<div style="font-size:13px;color:var(--text3);font-style:italic;padding:8px">Toutes les manifestations disponibles ont déjà été choisies.</div>`:''}
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
  const spellRow=(s)=>{const isSel=sel.includes(s.name);const dis=!isSel&&sel.length>=count;return`<div class="sk-choice${isSel?' selected':dis?' disabled':''}" onclick="${dis?'':'luToggleSecret(\''+esc(s.name)+'\')'}"><span class="sk-dot${isSel?' p':''}"></span><span style="flex:1;font-size:13px">${esc(s.name)} <span style="font-size:12px;color:var(--text3)">niv.${s.level}</span></span><span style="font-size:13px;color:var(--text3)">${esc(s.school||'')}</span>${isSel?`<span style="color:var(--cp)">✓</span>`:''}</div>`;};
  return`<div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:4px">🎭 <strong style="color:var(--cp)">Secrets Magiques</strong> — Choisis ${count} sorts de <em>n'importe quelle classe</em>. (${sel.length}/${count})</p>
    <input type="text" placeholder="🔍 Rechercher un sort..." value="${esc(_luSecretsSearch)}" oninput="_luSecretsSearch=this.value;renderTab()" style="width:100%;box-sizing:border-box;padding:7px 10px;background:var(--surface2);border:1px solid var(--border);border-radius:2px;color:var(--text);font-size:13px;margin-bottom:8px">
    ${Object.keys(byLevel).sort((a,b)=>a-b).map(lvl=>`<div style="font-size:13px;font-weight:600;color:var(--cp);margin:8px 0 4px">Niveau ${lvl}</div>${byLevel[lvl].map(spellRow).join('')}`).join('')}
    ${!allSpells.length?`<div style="font-size:13px;color:var(--text3);padding:8px 0">Aucun résultat.</div>`:''}
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
  const _PREPARED_RECAP=['Clerc','Druide','Paladin','Artificier'];
  const isPrepared=mc&&_PREPARED_RECAP.includes(mc.name);
  const _archRecap=(p.archetype||{})[mc?mc.name:'']||LU.archetypeChoice||null;
  // Récap : résout les capacités d'archétype génériques en VRAIES capacités (principe #4), sinon retire l'entrée.
  const explainFeats=(cd?((cd.levelFeatures||{})[newCLvl]||[]):[]).filter(f=>f&&!f.includes('Amélioration de caractéristiques')&&!f.startsWith('Sorts du cercle')&&!f.includes('(choix)')).map(f=>{
    const resolved=_resolveDruidCircleFeat(f,druideCircle,newCLvl);
    if(resolved)return{name:resolved.name,desc:resolved.desc};
    if(typeof _GENERIC_FEAT_NAMES!=='undefined'&&_GENERIC_FEAT_NAMES.includes(f)){
      const af=(_archRecap&&typeof _ARCHETYPE_LEVEL_FEATS!=='undefined')?((_ARCHETYPE_LEVEL_FEATS[mc.name]||{})[_archRecap]||{})[newCLvl]:null;
      return af&&af.name?{name:af.name,desc:af.desc||''}:null; // principe #4 : pas de placeholder
    }
    return{name:f,desc:getFeatDesc(f)};
  }).filter(Boolean);
  const isMulti=LU.choice==='multiclass';
  // Déblocage d'un NOUVEAU niveau de sorts (préparateurs) : le dire + lister les sorts, sinon les joueurs
  // restent avec des sorts bas niveau sans savoir que leur liste s'est élargie (retour user 2026-06-12).
  let _luUnlock=null;
  if(!isMulti&&isPrepared&&mc){
    const _slotMax=(cls)=>{const sl=calcSpellSlots(Object.assign({},p,{classes:cls}))||[];let m=0;sl.forEach((n,i)=>{if(n>0)m=i+1;});return m;};
    const _bCls=p.classes.map(c=>({name:c.name,level:c.name===mc.name?Math.max(0,newCLvl-1):c.level}));
    const _aCls=p.classes.map(c=>({name:c.name,level:c.name===mc.name?newCLvl:c.level}));
    const _a=_slotMax(_aCls);
    if(_a>_slotMax(_bCls)){
      let list=null;
      if(typeof SPELLS_DB!=='undefined'&&SPELLS_DB){
        const _en=(typeof _CLASS_NAME_EN!=='undefined'?_CLASS_NAME_EN[mc.name]:'')||mc.name;
        list=getSpellsDB().filter(s=>s.level===_a&&(s.classes||[]).length&&(s.classes.includes(mc.name)||s.classes.includes(_en)));
        list.sort((x,y)=>(x.name||'').localeCompare(y.name||''));
      }
      _luUnlock={lvl:_a,list};
    }
  }

  return`<div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:14px">Récapitulatif — niveau <strong style="color:var(--cp)">${newLvl}</strong>. Confirme pour appliquer.</p>

    <div style="background:var(--surface2);border-radius:2px;padding:12px;margin-bottom:12px">
      <div style="font-size:13px;font-weight:600;color:var(--cp);margin-bottom:8px">Ce qui change</div>
      ${isMulti?`<div style="font-size:13px;color:var(--text2)">🔀 Multiclassage → <strong>${esc(LU.mcTarget)}</strong> niveau 1</div>
        <div style="font-size:13px;color:var(--text3);margin-top:4px">${esc((SRD.classes.find(c=>c.name===LU.mcTarget)||{}).mcProf||'—')}</div>`:
      `${explainFeats.map(f=>`<div style="padding:6px 0;border-bottom:1px solid var(--border)">
          <div style="font-size:13px;font-weight:600;color:var(--cp)">✦ ${esc(f.name)}</div>
          <div style="font-size:13px;color:var(--text2);margin-top:2px;line-height:1.5">${esc(f.desc)}</div>
        </div>`).join('')}
      ${LU.archetypeChoice?`<div style="padding:6px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;font-weight:600;color:var(--cp)">🎭 Archétype : ${esc(LU.archetypeChoice)}</div></div>`:''}
      ${LU.terrainChoice?`<div style="padding:6px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;font-weight:600;color:var(--cp)">🗺 Terrain du cercle : ${esc(LU.terrainChoice)}</div></div>`:''}
      ${LU.styleChoice?`<div style="padding:6px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;font-weight:600;color:var(--cp)">⚔ Style : ${esc(LU.styleChoice)}</div></div>`:''}
      ${LU.asiChoice&&LU.asiChoice.type==='feat'&&LU.asiChoice.featName?(()=>{const rf=FEATS_DB&&FEATS_DB.find(f=>f.n===LU.asiChoice.featName);const rg=rf?_parseFeatAbilityGrants(rf.tx):[];const ri=LU.asiChoice.stats[0];const statNote=rg.length>1&&ri!==undefined?` <span style="font-size:13px;font-weight:400">(+1 ${ABILITIES[ri]})</span>`:rg.length===1?` <span style="font-size:13px;font-weight:400">(+1 ${ABILITIES[rg[0]]})</span>`:'';return`<div style="padding:6px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;font-weight:600;color:var(--good)">🎯 Don : ${esc(LU.asiChoice.featName)}${statNote}</div></div>`;})():''}
      ${LU.asiChoice&&LU.asiChoice.type!=='feat'&&LU.asiChoice.stats.length?`<div style="padding:6px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;font-weight:600;color:var(--good)">📈 Amélioration : +${LU.asiChoice.val} à ${LU.asiChoice.stats.map(j=>ABILITIES[j]).join(' et ')}</div></div>`:''}
      ${LU.expertiseChoices.length?`<div style="padding:6px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;font-weight:600;color:var(--good)">🎯 Expertise : ${LU.expertiseChoices.join(', ')}</div></div>`:''}
      ${LU.newSpells.length?`<div style="padding:6px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;font-weight:600;color:var(--cp)">✨ Nouveaux sorts : ${LU.newSpells.join(', ')}</div></div>`:''}
      ${LU.swapOut?`<div style="padding:6px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;color:var(--text3)">🔄 Sort remplacé : <span style="color:var(--danger)">${esc(LU.swapOut)}</span></div></div>`:''}
      ${LU.secretsChoices.length?`<div style="padding:6px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;font-weight:600;color:var(--arcane)">🎭 Secrets Magiques : ${LU.secretsChoices.join(', ')}</div></div>`:''}
      ${LU.metamagicChoices.length?`<div style="padding:6px 0"><div style="font-size:13px;font-weight:600;color:var(--cp)">🔮 Métamagie : ${LU.metamagicChoices.join(', ')}</div></div>`:''}
      ${(!explainFeats.length&&!LU.archetypeChoice&&!LU.styleChoice&&!(LU.asiChoice&&(LU.asiChoice.featName||(LU.asiChoice.stats&&LU.asiChoice.stats.length)))&&!LU.expertiseChoices.length&&!LU.newSpells.length&&!LU.secretsChoices.length&&!LU.metamagicChoices.length)?`<div style="font-size:13px;color:var(--text3);font-style:italic;padding:6px 0">Aucune nouvelle capacité de classe à ce niveau — tes points de vie augmentent.</div>`:''}
      `}
    </div>

    <div style="padding:8px 12px;background:var(--cglow);border:1px solid var(--cp);border-radius:2px;margin-bottom:8px">
      ${(()=>{
        const d=mc?SRD.classes.find(c=>c.name===mc.name):null;
        if(!d)return'<div style="font-size:13px;color:var(--text2)">PV gagnés : ?</div>';
        const ab=p.abilities||[10,10,10,10,10,10];
        const conM=mod(ab[2]);
        const avg=Math.floor(d.hdVal/2)+1;
        const used=LU.hpRoll!==null?LU.hpRoll:avg;
        const total=Math.max(1,used+conM);
        const rolledTag=LU.hpRoll!==null?`<span style="font-size:13px;color:var(--good);margin-left:4px">🎲 dé lancé</span>`:`<span style="font-size:13px;color:var(--text3);margin-left:4px">(moyenne)</span>`;
        if(LU.hpConfirmed){
          return`<div style="padding:8px 10px;background:rgba(76,175,80,.08);border:1px solid rgba(76,175,80,.4);border-radius:2px">
            <div style="font-size:13px;color:var(--good);font-weight:600;margin-bottom:2px">✓ PV confirmés — définitif</div>
            <div style="font-size:15px;font-weight:700;color:var(--cp)">${used} + CON (${fmt(conM)}) = +${total} PV</div>
          </div>`;
        }
        return`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <div style="font-size:13px;color:var(--text2)">PV gagnés : <strong style="color:var(--cp)">${used} + CON (${fmt(conM)}) = <span style="font-size:15px">${total}</span></strong>${rolledTag}</div>
        </div>
        <div style="display:flex;gap:6px">
          <button class="btn bsm" onclick="_luConfirmHP(null,${avg})" style="flex:1;font-size:13px">${avg} Moyenne</button>
          <button class="btn bsm bac" onclick="_luRollHP(${d.hdVal},${avg})" style="flex:1;font-size:13px">✨ Lancer 1${esc('d'+d.hdVal)}</button>
        </div>`;
      })()}
    </div>
    ${_luUnlock?`<div style="padding:10px 12px;background:rgba(127,209,196,.08);border:1px solid rgba(127,209,196,.45);border-radius:2px;margin-bottom:8px">
      <div style="font-size:13px;font-weight:700;color:#7fd1c4;margin-bottom:4px">🔓 Sorts de niveau ${_luUnlock.lvl} débloqués !</div>
      <div style="font-size:13px;color:var(--text2);margin-bottom:6px">Ta liste de ${esc(mc.name)} s'élargit : ${_luUnlock.list?`<strong>${_luUnlock.list.length} sorts de niveau ${_luUnlock.lvl}</strong> sont désormais disponibles à la préparation (au repos long).`:`de nouveaux sorts sont désormais disponibles à la préparation (au repos long).`}</div>
      ${_luUnlock.list?`<button class="btn bsm" onclick="const d=document.getElementById('luNewSpells');if(d)d.style.display=d.style.display==='none'?'block':'none'">📜 Voir les ${_luUnlock.list.length} sorts</button>
      <div id="luNewSpells" style="display:none;margin-top:6px;max-height:240px;overflow-y:auto">${_luUnlock.list.map(s=>`<div class="sk-choice" style="cursor:default"><span style="flex:1;font-size:13px">${esc(s.name)}</span><span style="font-size:12px;color:var(--text3)">${esc(s.school||'')}${s.castTime?' • '+esc(s.castTime):''}</span><span onclick="creToggleSpellDesc('lu_${jsq(s.name)}')" style="cursor:pointer;color:var(--cp);font-size:13px;padding:0 6px" title="Voir la description">ⓘ</span></div><div id="cresp_${('lu_'+s.name).replace(/[^a-zA-Z0-9]/g,'_')}" style="display:none;font-size:12.5px;color:var(--text2);background:var(--surface2);border-radius:2px;padding:6px 8px;margin:2px 0 6px;line-height:1.5">${esc(s.desc||'—')}</div>`).join('')}</div>`:`<button class="btn bsm" onclick="loadSpellsDB(()=>renderTab())">📜 Voir les nouveaux sorts</button>`}
    </div>`:''}
    ${!isMulti&&isPrepared?`<div style="padding:8px 12px;background:rgba(0,150,136,.08);border:1px solid rgba(0,150,136,.3);border-radius:2px;margin-bottom:8px;font-size:13px;color:var(--text2)">💡 <strong>Sorts :</strong> Tu peux préparer n'importe quel sort de ta liste de classe lors d'un repos long. Accède à <strong>Sorts → 📚 Parcourir</strong> pour ajouter de nouveaux sorts.</div>`:''}

    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="LU.step--;renderTab()">← Retour</button>
      <button class="btn bac" style="flex:2" onclick="applyLevelUp()">✓ Confirmer le niveau ${newLvl}</button>
    </div>
  </div>`;
}

// Fix 3 — Mapping capacités d'archétype par classe/archétype/niveau
const _ARCHETYPE_LEVEL_FEATS={
  'Barbare':{
    'Voie du berserker':{
      6:{name:'Rage aveugle',desc:'En rage, tu es immunisé contre les états Charmé et Effrayé.'},
      10:{name:'Présence intimidante',desc:'Action : une créature visible à 9m doit réussir un JS de Sagesse (DD = 8+maîtrise+CHA) ou être Effrayée jusqu\'à la fin de ton prochain tour.'},
      14:{name:'Représailles',desc:'Réaction : quand tu subis des dégâts d\'une attaque de mêlée, tu peux immédiatement effectuer une attaque de mêlée contre l\'attaquant.'},
    },
    'Voie du guerrier totem':{
      6:{name:'Aspect de la bête',desc:'Avantage passif selon ton totem (Ours : force de portage ×2 ; Aigle : vision lointaine ; Loup : traquage furtif).'},
      10:{name:'Marcheur spirituel',desc:'Tu peux lancer Communion avec la nature sous forme de rituel. Tu communies avec l\'esprit de ton animal totem.'},
      14:{name:'Lien totémique',desc:'Bénéfice en rage selon ton totem (Ours : ennemis ont désavantage vs alliés ; Aigle : vitesse de vol ; Loup : renverser les cibles).'},
    },
    'Voie de la magie sauvage':{
      6:{name:'Réserve de magie',desc:'Action : touche une créature (toi inclus). Au choix : +1d3 à ses jets d\'attaque et de caractéristique pendant 10 min, OU elle regagne un emplacement de sort de niveau ≤ 1d3. Maîtrise utilisations/repos long.'},
      10:{name:'Réaction instable',desc:'Réaction : juste après avoir subi des dégâts ou raté un JS pendant ta rage, tu déclenches un nouveau Sursaut sauvage (remplace l\'effet en cours).'},
      14:{name:'Sursaut contrôlé',desc:'Lors d\'un Sursaut sauvage, deux résultats sont tirés. Tu choisis lequel appliquer.'},
    },
  },
  'Guerrier':{
    'Champion':{
      7:{name:'Athlète accompli',desc:'Tu ajoutes la moitié de ton bonus de maîtrise (arrondi au supérieur) aux jets de Force, Dextérité et Constitution qui n\'utilisent pas déjà ta maîtrise. Tes sauts en longueur gagnent mod FOR × 30 cm.'},
      10:{name:'Style de combat supplémentaire',desc:'Tu choisis un deuxième style de combat.'},
      15:{name:'Critique supérieur',desc:'Tes coups critiques surviennent sur un résultat de 18, 19 ou 20 au lieu de 20.'},
      18:{name:'Survivant',desc:'Au début de chacun de tes tours, si tu es à la moitié ou moins de tes PV max (mais pas à 0), tu récupères 5 + modificateur CON PV.'},
    },
    'Maître de guerre':{
      7:{name:'Observation de l\'ennemi',desc:'Après 1 minute à observer ou interagir avec une créature hors combat, le MJ te dit si elle t\'est égale, supérieure ou inférieure sur 2 critères de ton choix (FOR, DEX, CON, CA, PV actuels, niveaux de classe).'},
      10:{name:'Dés de supériorité améliorés (d10)',desc:'Tes dés de supériorité deviennent des d10.'},
      15:{name:'Implacable',desc:'Si tu n\'as plus de dés de supériorité quand tu lances l\'initiative, tu en regagnes 1.'},
      18:{name:'Dés de supériorité maîtrisés (d12)',desc:'Tes dés de supériorité deviennent des d12.'},
    },
    'Chevalier occulte':{
      7:{name:'Magie de guerre',desc:'Quand tu utilises ton action pour lancer un cantrip, tu peux faire une attaque avec une arme comme action bonus.'},
      10:{name:'Frappe occulte',desc:'Quand tu touches une créature avec une attaque d\'arme, elle a un désavantage à son prochain jet de sauvegarde contre un sort que tu lances avant la fin de ton prochain tour.'},
      15:{name:'Charge arcanique',desc:'Tu peux te téléporter jusqu\'à 9m vers un espace inoccupé visible quand tu utilises ta Fougue (avant ou après l\'action supplémentaire).'},
      18:{name:'Magie de guerre améliorée',desc:'Quand tu utilises ton action pour lancer un sort (quel qu\'il soit), tu peux faire une attaque avec une arme en action bonus.'},
    },
  },
  'Clerc':{
    'Domaine de la vie':{2:{name:'Préservation de la vie',desc:'Conduit divin : action — distribue 5 × niveau de clerc PV entre des créatures à 9m (sans dépasser la moitié de leur max ; sans effet sur morts-vivants/artificiels).'},6:{name:'Guérisseur béni',desc:'Quand tu lances un sort de soin de niv.1+ sur une autre créature, tu récupères aussi 2 + le niveau du sort PV.'},8:{name:'Frappe divine — Radiant',desc:'+1d8 dégâts radiants une fois par tour quand tu touches avec une arme (+2d8 au niv.14).'},17:{name:'Guérison suprême',desc:'Tes sorts de soin appliquent directement le maximum de chaque dé (ex. 2d6 → 12).'}},
    'Domaine de la lumière':{2:{name:'Radiance de l\'aube',desc:'Conduit divin : action — dissipe les ténèbres magiques à 9m ; créatures hostiles à 9m : JS CON ou 2d10 + niveau de clerc dégâts radiants (moitié si réussi).'},6:{name:'Illumination améliorée',desc:'Tu peux utiliser Illumination protectrice aussi quand une créature visible à 9m attaque quelqu\'un d\'autre que toi.'},8:{name:'Incantation puissante',desc:'Tu ajoutes ton modificateur de Sagesse aux dégâts de tes sorts mineurs de clerc.'},17:{name:'Halo de lumière',desc:'Action : aura de lumière du soleil 1 min — lumière vive 18m + faible 9m. Tes ennemis dans la lumière vive ont un désavantage aux JS contre les sorts de feu ou radiants.'}},
    'Domaine de la nature':{2:{name:'Charme des animaux et des plantes',desc:'Conduit divin : action — bêtes et plantes visibles à 9m : JS SAG ou charmées 1 min (ou jusqu\'aux dégâts), amicales envers toi.'},6:{name:'Atténuation des éléments',desc:'Réaction : quand toi ou une créature à 9m subit des dégâts d\'acide, de froid, de feu, de foudre ou de tonnerre — accorde-lui la résistance à ce type.'},8:{name:'Frappe divine — Froid/Feu/Foudre',desc:'+1d8 dégâts de froid, de feu ou de foudre (au choix) une fois par tour quand tu touches avec une arme (+2d8 au niv.14).'},17:{name:'Maître de la nature',desc:'Action bonus : commande verbalement les créatures charmées par ton Charme des animaux et des plantes (leur prochain tour).'}},
    'Domaine de la tempête':{2:{name:'Fureur destructrice',desc:'Conduit divin : quand tu infliges des dégâts de foudre ou de tonnerre, inflige le maximum au lieu de lancer les dés.'},6:{name:'Frappe de l\'éclair',desc:'Quand tu infliges des dégâts de foudre à une créature de taille G ou inférieure, tu peux la repousser de 3m.'},8:{name:'Frappe divine — Tonnerre',desc:'+1d8 dégâts de tonnerre une fois par tour quand tu touches avec une arme (+2d8 au niv.14).'},17:{name:'Enfant de la tempête',desc:'Vitesse de vol égale à ta vitesse de déplacement, tant que tu n\'es ni sous terre ni en intérieur.'}},
    'Domaine de la duperie':{2:{name:'Invocation de réplique',desc:'Conduit divin : action — illusion parfaite de toi-même à 9m (1 min, concentration). Action bonus : la déplacer de 9m. Tu peux lancer tes sorts depuis sa position ; avantage aux attaques si toi et l\'illusion êtes à 1,5m de la cible.'},6:{name:'Linceul d\'ombre',desc:'Conduit divin : action — tu deviens invisible jusqu\'à la fin de ton prochain tour (fin si tu attaques ou lances un sort).'},8:{name:'Frappe divine — Poison',desc:'+1d8 dégâts de poison une fois par tour quand tu touches avec une arme (+2d8 au niv.14).'},17:{name:'Réplique améliorée',desc:'Invocation de réplique crée jusqu\'à 4 doublons. Action bonus : en déplacer plusieurs (9m chacun, max 36m de toi).'}},
    'Domaine de la guerre':{2:{name:'Frappe guidée',desc:'Conduit divin : +10 à TON jet d\'attaque, décidé après avoir vu le jet mais avant le verdict du MJ.'},6:{name:'Bénédiction du dieu de la guerre',desc:'Conduit divin, réaction : +10 au jet d\'attaque d\'une créature à 9m (après le jet, avant le verdict).'},8:{name:'Frappe divine — Guerre',desc:'+1d8 dégâts du même type que l\'arme, une fois par tour quand tu touches (+2d8 au niv.14).'},17:{name:'Avatar de bataille',desc:'Résistance aux dégâts contondants, perforants et tranchants des attaques non magiques.'}},
    'Domaine du savoir':{2:{name:'Savoir ancestral',desc:'Conduit divin : action — choisis une compétence ou un outil : tu en obtiens la maîtrise pendant 10 minutes.'},6:{name:'Lecture des pensées',desc:'Conduit divin : action — créature à 18m : JS SAG ou tu lis ses pensées de surface 1 min ; tu peux ensuite lancer Suggestion sans emplacement (JS automatiquement raté).'},8:{name:'Incantation puissante',desc:'Tu ajoutes ton modificateur de Sagesse aux dégâts de tes sorts mineurs de clerc.'},17:{name:'Visions du passé',desc:'Méditation 1 min+ : visions du passé d\'un objet (propriétaires) ou d\'une zone (SAG jours). 1×/repos court ou long.'}},
    'Domaine de la forge':{2:{name:'Bénédiction de l\'artisan',desc:'Conduit divin : rituel d\'1h — crée un objet non magique en métal d\'une valeur ≤ 100 po (le métal utilisé se transforme).'},6:{name:'Âme de la forge',desc:'Résistance aux dégâts de feu. +1 à la CA quand tu portes une armure lourde.'},8:{name:'Frappe divine — Feu (Forge)',desc:'+1d8 dégâts de feu une fois par tour quand tu touches avec une arme (+2d8 au niv.14).'},17:{name:'Saint de la forge et du feu',desc:'Immunité aux dégâts de feu. En armure lourde : résistance aux dégâts contondants, perforants et tranchants non magiques.'}},
  },
  'Paladin':{
    'Serment de dévotion':{7:{name:'Aura de dévotion',desc:'Toi et les créatures alliées à 3m (9m au niv.18) ne pouvez pas être charmés tant que tu es conscient.'},15:{name:'Pureté de l\'esprit',desc:'Tu es en permanence sous l\'effet du sort Protection contre le mal et le bien.'},20:{name:'Nimbe sacré',desc:'Action : pendant 1 min, lumière vive 9m (+ faible 9m). Un ennemi qui commence son tour dans la lumière vive subit 10 dégâts radiants ; avantage à tes JS contre les sorts des fiélons et morts-vivants. 1/repos long.'}},
    'Serment des anciens':{7:{name:'Aura de garde',desc:'Toi et tes alliés à 3m (9m au niv.18) avez la résistance aux dégâts causés par les sorts.'},15:{name:'Sentinelle immortelle',desc:'Quand tu tombes à 0 PV sans être tué sur le coup, tu peux rester à 1 PV (1/repos long). Tu ne subis plus les inconvénients de la vieillesse et ne peux pas vieillir magiquement.'},20:{name:'Champion antique',desc:'Action : transformation 1 min — +10 PV au début de chacun de tes tours, sorts de paladin (1 action) lançables en action bonus, ennemis à 3m : désavantage aux JS contre tes sorts et Conduits. 1/repos long.'}},
    'Serment de vengeance':{7:{name:'Vengeur implacable',desc:'Quand tu touches une créature avec une attaque d\'opportunité, tu peux te déplacer de la moitié de ta vitesse juste après (dans la même réaction), sans provoquer d\'attaque d\'opportunité.'},15:{name:'Âme vengeresse',desc:'Quand la créature sous ton Vœu d\'hostilité fait une attaque, tu peux utiliser ta réaction pour l\'attaquer si elle est à portée.'},20:{name:'Ange de la vengeance',desc:'Action : transformation 1 heure — ailes (vol 18m) et aura de menace 9m (les ennemis qui y commencent leur tour : JS SAG ou effrayés 1 min). 1/repos long.'}},
  },
  'Rôdeur':{
    'Chasseur':{3:{name:'Proie du chasseur',desc:'Choisis : Tueur de colosses (+1d8 1×/tour si la cible est sous son maximum de PV) / Tueur de géants (réaction : attaquer une créature de taille G+ à 1,5m qui vient de t\'attaquer) / Briseur de hordes (1×/tour : une attaque supplémentaire avec la même arme contre une autre créature à 1,5m de la cible).'},7:{name:'Tactiques défensives',desc:'Choisis : Échapper à la horde (les attaques d\'opportunité contre toi ont un désavantage) / Défense contre les attaques multiples (+4 CA contre les attaques suivantes de la créature qui t\'a touché, jusqu\'à la fin du tour) / Moral d\'acier (avantage aux JS contre la peur).'},11:{name:'Attaques multiples',desc:'Choisis : Volée (action : une attaque à distance contre chaque créature à 3m d\'un point visible, munitions requises) / Attaque tourbillonnante (action : une attaque de mêlée contre chaque créature à 1,5m).'},15:{name:'Défense du chasseur supérieure',desc:'Choisis : Esquive totale (JS DEX réussi = 0 dégât, raté = moitié) / Retour de bâton (réaction : une attaque de mêlée qui te rate est répétée contre une autre créature de ton choix) / Esquive instinctive (réaction : les dégâts d\'une attaque visible sont réduits de moitié).'}},
    'Maître des bêtes':{7:{name:'Entraînement exceptionnel',desc:'Action bonus : ordonner au compagnon Aider, Foncer ou Se désengager (les tours où il n\'attaque pas). Ses attaques comptent comme magiques.'},11:{name:'Fureur bestiale',desc:'Quand tu ordonnes l\'action Attaquer, ton compagnon peut attaquer deux fois.'},15:{name:'Partage des sorts',desc:'Quand tu lances un sort qui te cible, tu peux aussi en faire bénéficier ton compagnon s\'il est à 9m ou moins.'}},
    'Gardien de drake':{7:{name:'Lien du croc et d\'écailles',desc:'Le drake gagne des ailes (vol = sa vitesse de marche), passe en taille M et peut te servir de monture (pas de vol monté à ce niveau). Sa morsure inflige +1d6 dégâts de son essence, et tu gagnes la résistance au type d\'essence du drake.'},11:{name:'Souffle de drake',desc:'Action : cône de 9m — JS DEX contre ton DD de sort de rôdeur, 8d6 dégâts (10d6 au niv.15) d\'acide, froid, feu, foudre ou poison au choix, moitié si réussi. 1×/repos long, ou en dépensant un emplacement de sort de niv.3+.'},15:{name:'Lien parfait',desc:'Le drake passe en taille G, sa morsure inflige +2d6 dégâts d\'essence au total, et tu peux voler en le chevauchant.'}},
  },
  'Moine':{
    'Voie de la paume':{6:{name:'Intégrité du corps',desc:'Action : tu récupères 3 × ton niveau de moine PV. 1×/repos long.'},11:{name:'Tranquillité',desc:'À la fin d\'un repos long : effet du sort Sanctuaire (DD 8 + maîtrise + SAG) jusqu\'au début de ton prochain repos long. Prend fin si tu attaques ou lances un sort.'},17:{name:'Frappe des vibrations',desc:'3 points de ki quand tu touches à mains nues : vibrations implantées pendant plusieurs jours. Action pour les déclencher : JS CON ou la cible tombe à 0 PV (réussite : 10d10 dégâts nécrotiques).'}},
    "Voie de l'ombre":{6:{name:'Pas des ombres',desc:'Action bonus dans une lumière faible ou les ténèbres : téléportation jusqu\'à 18m vers une zone sombre visible, puis avantage à ta première attaque de mêlée avant la fin du tour.'},11:{name:'Manteau des ombres',desc:'Action dans une lumière faible ou les ténèbres : invisible jusqu\'à ce que tu attaques, lances un sort ou entres dans une lumière vive.'},17:{name:'Opportuniste',desc:'Réaction : quand une créature à 1,5m de toi est touchée par une attaque d\'un autre que toi, tu peux faire une attaque de mêlée contre elle.'}},
    'Voie des quatre éléments':{6:{name:'Discipline élémentaire supplémentaire',desc:'Tu apprends une nouvelle discipline élémentaire de ton choix (tu peux aussi en remplacer une connue).'},11:{name:'Discipline élémentaire avancée',desc:'Tu apprends une nouvelle discipline élémentaire de ton choix (tu peux aussi en remplacer une connue).'},17:{name:'Discipline élémentaire maîtrisée',desc:'Tu apprends une nouvelle discipline élémentaire de ton choix (tu peux aussi en remplacer une connue).'}},
  },
  'Roublard':{
    'Voleur':{9:{name:'Discrétion suprême',desc:'Avantage aux jets de Dextérité (Discrétion) si tu ne te déplaces pas de plus de la moitié de ta vitesse pendant le tour.'},13:{name:'Utilisation d\'objets magiques',desc:'Tu ignores toutes les exigences de classe, de race et de niveau pour utiliser les objets magiques.'},17:{name:'Réflexes de voleur',desc:'Tu joues deux tours au premier round d\'un combat : le premier à ton initiative normale, le second à ton initiative −10. Pas si tu es surpris.'}},
    'Assassin':{9:{name:'Expert en infiltration',desc:'Tu peux créer de fausses identités (1 semaine + 25 po chacune) qui passent pour réelles jusqu\'à preuve du contraire.'},13:{name:'Imposteur',desc:'Après 3h d\'étude, tu dupliques parfaitement la voix, l\'écriture et les manières d\'une personne. Avantage à Tromperie en cas de soupçon.'},17:{name:'Frappe meurtrière',desc:'Quand tu touches une créature SURPRISE : JS CON DD 8 + maîtrise + DEX, ou les dégâts de l\'attaque sont doublés.'}},
    'Escroc arcanique':{9:{name:'Embuscade magique',desc:'Si tu es caché d\'une créature quand tu lui lances un sort, elle a un désavantage à ses JS contre ce sort pendant ce tour.'},13:{name:'Escroc polyvalent',desc:'Action bonus : ta main de mage distrait une créature à 1,5m d\'elle → avantage à tes jets d\'attaque contre cette créature jusqu\'à la fin du tour.'},17:{name:'Voleur de sort',desc:'Réaction quand un sort te cible : le lanceur fait un JS (son mod d\'incantation) contre ton DD ; s\'il rate, le sort est annulé contre toi et tu le voles pendant 8h. 1/repos long.'}},
    'Conspirateur':{9:{name:'Manipulateur perspicace',desc:'Après 1 min d\'observation ou d\'interaction hors combat, le MJ te dit si la cible t\'est égale, supérieure ou inférieure sur 2 critères au choix (INT, SAG, CHA, niveaux de classe).'},13:{name:'Redirection',desc:'Réaction quand une attaque te cible et qu\'une créature à 1,5m t\'offre un abri : l\'attaque cible cette créature à ta place.'},17:{name:'Âme de la duperie',desc:'Tes pensées sont illisibles par télépathie (seules de fausses pensées sont lues). La magie de vérité te voit toujours véridique, et tu peux mentir dans les langues que tu connais.'}},
  },
  'Barde':{
    'Collège du savoir':{6:{name:'Secrets magiques supplémentaires',desc:'Tu apprends 2 sorts de n\'importe quelle classe. Ils comptent comme des sorts de barde mais pas dans ton nombre de sorts connus.'},14:{name:'Compétence hors-pair',desc:'Quand tu fais un jet de caractéristique, tu peux dépenser 1 inspiration bardique et ajouter le dé au résultat (après le jet, avant le verdict du MJ).'}},
    'Collège de la vaillance':{6:{name:'Attaque supplémentaire',desc:'Tu peux attaquer deux fois, au lieu d\'une, quand tu utilises l\'action Attaquer.'},14:{name:'Magie de combat',desc:'Quand tu utilises ton action pour lancer un sort de barde, tu peux faire une attaque avec une arme en action bonus.'}},
  },
  'Occultiste':{
    "Le Fiélon":{6:{name:'Chance du ténébreux',desc:'Quand tu fais un jet de caractéristique ou de sauvegarde : ajoute 1d10 (après le dé, avant le verdict). 1/repos court ou long.'},10:{name:'Résistance fiélonne',desc:'À chaque repos court ou long, choisis un type de dégâts : tu y es résistant (ignoré par les armes magiques et en argent).'},14:{name:'Traversée des enfers',desc:'Quand tu touches avec une attaque : la cible disparaît dans les plans inférieurs jusqu\'à la fin de ton prochain tour, puis revient avec 10d10 dégâts psychiques (sauf fiélons). 1/repos long.'}},
    "L'Archifée":{6:{name:'Échappatoire brumeuse',desc:'Réaction quand tu subis des dégâts : invisible + téléportation 18m (jusqu\'au début de ton prochain tour ou jusqu\'à attaque/sort). 1/repos court ou long.'},10:{name:'Défenses captivantes',desc:'Immunité au charme. Réaction quand on tente de te charmer : JS SAG ou tu charmes la créature 1 min (ou jusqu\'aux dégâts).'},14:{name:'Sombre délire',desc:'Action : créature à 18m, JS SAG ou charmée/effrayée 1 min (concentration), perdue dans un royaume illusoire. 1/repos court ou long.'}},
    "Le Grand Ancien":{6:{name:'Protection entropique',desc:'Réaction : impose un désavantage à un jet d\'attaque contre toi ; si l\'attaque rate, avantage à ta prochaine attaque contre cette créature. 1/repos court ou long.'},10:{name:'Bouclier mental',desc:'Pensées illisibles (sauf accord), résistance aux dégâts psychiques, et toute créature qui t\'inflige des dégâts psychiques en subit autant.'},14:{name:'Asservissement',desc:'Action : toucher un humanoïde neutralisé → charmé (sans JS) jusqu\'à Délivrance des malédictions, retrait de l\'état ou réutilisation. Télépathie partagée sur le même plan.'}},
    "Le Génie":{6:{name:'Présent élémentaire',desc:'Résistance au type de dégâts de ton génie. Action bonus : vol 9m pendant 10 min (vol stationnaire), maîtrise utilisations/repos long.'},10:{name:'Sanctuaire du génie',desc:'Répit embouteillé : tu peux emmener jusqu\'à 5 créatures consentantes dans le catalyseur. 10 min dedans = repos court amélioré (+maîtrise aux PV des dés de vie).'},14:{name:'Souhait limité',desc:'Action : demander au catalyseur l\'effet d\'un sort de niveau ≤ 6 (incantation 1 action, aucune composante). Réutilisable après 1d4 repos longs.'}},
  },
  'Ensorceleur':{
    'Lignée draconique':{6:{name:'Ailes draconiques',desc:'Action bonus : déployer tes ailes et obtenir une vitesse de vol égale à ta vitesse actuelle.'},14:{name:'Présence draconique',desc:'Concentration 1 min : aura 18m — peur ou fascination (JS SAG pour résister). Utilise un emplacement de sort.'}},
    'Magie sauvage':{6:{name:'Chance forcée',desc:'2 points de sorcellerie : retirer le Désavantage à un jet (attaque, sauvegarde ou caractéristique).'},14:{name:'Maîtrise contrôlée du chaos',desc:'Quand tu lances un sort, tu peux dépenser 1 point de sorcellerie pour ajouter ton mod CHA au DD du sort.'}},
  },
  'Druide':{
    'Cercle de la lune':{6:{name:'Frappe primitive',desc:'Tes attaques en forme animale sont considérées comme magiques. CR max de Forme sauvage = niveau de druide ÷ 3.'},10:{name:'Forme sauvage élémentaire',desc:'Dépense 2 utilisations de Forme sauvage : transformation en élémentaire (air, eau, terre, feu).'},14:{name:'Mille formes',desc:'Tu peux lancer Modification d\'apparence à volonté.'}},
    'Cercle de la terre':{6:{name:'Foulée tellurique',desc:'Les terrains difficiles non-magiques ne te coûtent pas de déplacement supplémentaire.'},10:{name:'Protégé de dame Nature',desc:'Ni charmé ni effrayé par les élémentaires et les fées. Immunité au poison et aux maladies.'},14:{name:'Sanctuaire de dame Nature',desc:'Bêtes et plantes doivent réussir un JS Sagesse pour t\'attaquer.'}},
  },
  'Artificier':{
    'Alchimiste':{5:{name:'Érudit alchimique',desc:'Quand tu lances un sort avec ton matériel d\'alchimiste comme focaliseur : +INT (min +1) à UN jet de soins ou de dégâts d\'acide, de feu, nécrotiques ou de poison.'},9:{name:'Ingrédients revigorants',desc:'Boire un de tes élixirs donne 2d6+INT PV temporaires. Tu peux lancer Restauration partielle sans emplacement (via matériel d\'alchimiste), INT fois/repos long.'},15:{name:'Maîtrise chimique',desc:'Résistance aux dégâts d\'acide et de poison, immunité à l\'état empoisonné. Tu peux lancer Restauration supérieure et Guérison sans emplacement ni composantes (via matériel d\'alchimiste), 1×/repos long chacune.'}},
    'Artilleur':{5:{name:'Arme à feu arcanique',desc:'Au repos long : grave une baguette, un bâton ou un sceptre → focaliseur ; les sorts d\'artificier lancés à travers gagnent +1d8 à un de leurs jets de dégâts.'},9:{name:'Canon explosif',desc:'Les jets de dégâts de ton canon gagnent +1d8. Action (à 18m) : faire exploser le canon — créatures à 6m : JS DEX ou 3d8 dégâts de force (moitié si réussi).'},15:{name:'Position fortifiée',desc:'Toi et tes alliés avez un abri partiel à 3m de tes canons. Tu peux avoir DEUX canons à la fois, créés par la même action et activés par la même action bonus.'}},
    'Forgeron de guerre':{5:{name:'Attaque supplémentaire',desc:'Tu peux attaquer deux fois, au lieu d\'une, quand tu utilises l\'action Attaquer.'},9:{name:'Décharge arcanique',desc:'Quand toi ou ton défenseur d\'acier touchez avec une arme magique : +2d6 dégâts de force OU soigner 2d6 PV à une créature visible à 9m de la cible. INT utilisations/repos long, 1/tour.'},15:{name:'Défenseur amélioré',desc:'Ta Décharge arcanique passe à 4d6. Ton défenseur d\'acier gagne +2 CA et sa Parade d\'attaque inflige 1d4+INT dégâts de force à l\'attaquant.'}},
    'Maître armurier':{5:{name:'Attaque supplémentaire',desc:'Tu peux attaquer deux fois, au lieu d\'une, quand tu utilises l\'action Attaquer.'},9:{name:'Modifications d\'armure',desc:'Ton armure d\'arcanes compte comme plusieurs objets séparés pour tes imprégnations (torse, bottes, casque, arme intégrée), et tu peux porter 2 imprégnations de plus sur elle.'},15:{name:'Armure parfaite',desc:'Ton modèle d\'armure s\'améliore (Gardien : attirer magiquement une créature + frapper en réaction / Infiltrateur : la cible du Lance-foudre brille, désavantage à ses attaques contre toi et avantage au prochain jet contre elle — cf. TCE).'}},
  },
  'Magicien':{
    "École d'abjuration":{6:{name:'Protection de l\'abjureur',desc:'PV temporaires = mod INT chaque fois que tu lances un sort d\'abjuration niv.1+.'},10:{name:'Abjuration améliorée',desc:'Réaction : donner l\'avantage aux jets de sauvegarde d\'une créature à 9m.'},14:{name:'Résistance aux sorts',desc:'Résistance aux dégâts de sorts. Avantage aux JS contre les sorts.'}},
    "École de divination":{6:{name:'Présage expert',desc:'Tu peux utiliser Présage après avoir vu le résultat mais avant de connaître la réussite.'},10:{name:'Troisième œil',desc:'Action bonus 1×/repos : Voir l\'invisible, Lire les pensées ou Vision dans le noir.'},14:{name:'Plus grand présage',desc:'Tu peux utiliser Présage 3 fois entre deux repos longs.'}},
    "École d'enchantement":{6:{name:'Charme instinctif',desc:'Réaction : dévier une attaque vers une autre créature à portée.'},10:{name:'Présence hypnotique',desc:'Réaction : fasciner les ennemis qui t\'observent, leur faisant rater leur attaque.'},14:{name:'Domination totale',desc:'Quand tu lances Domination de monstre sur une créature déjà charmée par toi, elle a désavantage.'}},
    "École d'évocation":{6:{name:'Évocation malléable',desc:'Tes sorts d\'évocation ignorent les alliés que tu choisis dans leur zone d\'effet.'},10:{name:'Évocation puissante',desc:'Relancer un nombre de dés de dégâts égal à ton modificateur INT.'},14:{name:'Surcharge de sort',desc:'Lancer un sort d\'évocation niv.1-5 sans dépenser d\'emplacement 1×/repos long.'}},
    "École d'illusion":{6:{name:'Malléabilité des illusions',desc:'Modifier la nature d\'une illusion de concentration une fois par tour (action bonus).'},10:{name:'Illusion semi-réelle',desc:'L\'illusion peut infliger des dégâts psychiques.'},14:{name:'Maître de l\'illusion',desc:'L\'illusion devient momentanément réelle et peut provoquer des effets physiques.'}},
    "École d'invocation":{6:{name:'Éviction de sorts',desc:'Dissiper des sorts de convocation d\'alliés sans emplacement.'},10:{name:'Focus de convocation',desc:'Maintenir concentration sur deux sorts de convocation simultanément.'},14:{name:'Convocation robuste',desc:'+2 CA et bonus de maîtrise aux JS des créatures convoquées.'}},
    "École de nécromancie":{6:{name:'Mortifère',desc:'Quand tu lances un sort de nécromancie niv.1+, tu récupères max(1, mod INT) PV.'},10:{name:'Commandement des morts-vivants',desc:'Les morts-vivants que tu crées ont le maximum de PV.'},14:{name:'Commande suprême',desc:'Tu peux cibler jusqu\'à 3 fois plus de morts-vivants avec tes sorts de contrôle.'}},
    "École de transmutation":{6:{name:'Pierre de transmutation',desc:'Crée une pierre magique accordant un avantage permanent (nuit, résistance, vitesse, vision dans le noir).'},10:{name:'Façonneur',desc:'Tu peux transformer des matériaux d\'une catégorie à l\'autre.'},14:{name:'Maître transmutateur',desc:'Transformer un matériau précieux. Soigner 10d6 PV à une créature (1×/repos court).'}},
  },
};

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
    const hpGain=LU.hpRoll!==null?LU.hpRoll:avg;
    const hpEff=Math.max(1,hpGain+mod(p.abilities[2]));
    p.hpMax+=hpEff;
    if(p.race==='Nain des collines')p.hpMax+=1;
    p.hp=Math.min(p.hpMax,p.hp+hpEff+(p.race==='Nain des collines'?1:0));
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
    const hpGain=LU.hpRoll!==null?LU.hpRoll:avg;
    const hpEff=Math.max(1,hpGain+mod(p.abilities[2]));
    p.hpMax+=hpEff;
    if(p.race==='Nain des collines')p.hpMax+=1;
    p.hp=Math.min(p.hpMax,p.hp+hpEff+(p.race==='Nain des collines'?1:0));
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
      'Infusions',
      '2 rages','3 rages','4 rages','5 rages','6 rages','Rages illimitées',
      'Bonus dégâts rage',
      'Incantation',
      // Noms génériques d'archétype — remplacés par _resolveArchetypeFeat
      'Capacité du domaine','Capacité du serment sacré','Capacité de la tradition monastique',
      'Capacité du spécialiste','Capacité de la voie',"Capacité de l'archétype",
      "Capacité de l'archétype de rôdeur",
      'Capacité du collège',"Capacité du patron d'Outremonde",'Capacité de la spécialité','Capacité du cercle',
    ];
    const _curArchetype=(p.archetype||{})[mc.name]||LU.archetypeChoice||null;
    const druideCircle2=mc.name==='Druide'?_curArchetype:null;
    const newFeats=getLevelFeatures(mc.name,newClassLevel)
      .filter(f=>!EXCLUDED_FEATS.some(ex=>f.name===ex||f.name.startsWith(ex+' (')||f.name.startsWith(ex+' :')))
      .map(f=>{
        const resolved=_resolveDruidCircleFeat(f.name,druideCircle2,newClassLevel);
        return resolved?{name:resolved.name,desc:resolved.desc,classe:mc.name}:f;
      });
    newFeats.forEach(f=>{if(!p.features.find(x=>x.name===f.name))p.features.push(f);});
    // Fix 3 — Résoudre la capacité d'archétype du niveau actuel
    if(_curArchetype&&typeof _ARCHETYPE_LEVEL_FEATS!=='undefined'){
      const af=(_ARCHETYPE_LEVEL_FEATS[mc.name]||{})[_curArchetype]?.[newClassLevel];
      if(af&&!p.features.find(x=>x.name===af.name)){
        p.features.push({name:af.name,desc:af.desc,classe:mc.name});
      }
    }
  }

  // ASI ou Don
  const _conModBefore=mod(p.abilities[2]);
  if(LU.asiChoice&&LU.asiChoice.type==='feat'&&LU.asiChoice.featName){
    const feat=FEATS_DB?FEATS_DB.find(f=>f.n===LU.asiChoice.featName):null;
    if(!p.features)p.features=[];
    p.features.push({name:LU.asiChoice.featName,desc:(feat?feat.tx:'')||'',classe:'Don'});
    // Appliquer le bonus de caractéristique accordé par le don
    const grants=feat?_parseFeatAbilityGrants(feat.tx):[];
    if(grants.length===1){
      p.abilities[grants[0]]=Math.min(20,p.abilities[grants[0]]+1);
    } else if(grants.length>1&&LU.asiChoice.stats.length>0){
      p.abilities[LU.asiChoice.stats[0]]=Math.min(20,p.abilities[LU.asiChoice.stats[0]]+1);
    }
  } else if(LU.asiChoice&&LU.asiChoice.stats.length){
    LU.asiChoice.stats.forEach(i=>{p.abilities[i]=Math.min(20,p.abilities[i]+LU.asiChoice.val);});
  }
  // SRD : si le modificateur de CON augmente, +1 PV max par niveau déjà atteint
  const _conModAfter=mod(p.abilities[2]);
  if(_conModAfter>_conModBefore){
    const lvls=totalLevel(p);
    const _conHpBonus=(_conModAfter-_conModBefore)*lvls;
    p.hpMax+=_conHpBonus;
    p.hp=Math.min(p.hpMax,p.hp+_conHpBonus);
  }

  // Archétype → ajouter comme capacité + mémoriser dans p.archetype
  if(LU.archetypeChoice){
    const cd=mc?CLASS_LEVEL_DATA[mc.name]:null;
    const arch=cd&&cd.archetypes?cd.archetypes.find(a=>a.name===LU.archetypeChoice):null;
    if(arch){
      p.features.push({name:LU.archetypeChoice,desc:arch.desc,classe:mc?mc.name:''});
      if(!p.archetype)p.archetype={};
      p.archetype[mc.name]=LU.archetypeChoice;
      if(mc&&mc.name==='Druide'&&LU.archetypeChoice==='Cercle de la terre'&&LU.terrainChoice){
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

  // Nouveaux sorts (classe) + Secrets Magiques (Barde) — avec niveau + flag "préparé" correct
  if(!p.spells)p.spells=[];
  // Remplacement d'un sort connu (swap RAW, 1/niveau pour les lanceurs "connus")
  if(LU.swapOut){p.spells=p.spells.filter(s=>s.name!==LU.swapOut);}
  const _luCls=(isMulti&&LU.mcTarget)?LU.mcTarget:(mc?mc.name:'');
  const _luGrimoire=PREP_CASTERS.includes(_luCls); // Magicien → grimoire (non préparé) ; connus → préparés
  const _luDb=(typeof getSpellsDB==='function')?getSpellsDB():(SPELLS_DB||[]);
  [...LU.newSpells,...LU.secretsChoices].forEach(name=>{
    if(p.spells.find(s=>s.name===name))return;
    const sd=_luDb.find(x=>x.name===name);
    const lvl=sd?sd.level:0;
    const prepared=(lvl===0)?true:!_luGrimoire; // cantrips toujours dispo ; sorts connus auto-préparés ; grimoire non préparé
    p.spells.push({name,level:lvl,prepared});
  });

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

  // Fix 2 — Champion primitif : appliquer +4 FOR/CON (max 24)
  if((p.features||[]).some(f=>f.name==='Champion primitif (+4 FOR et CON, max 24)')||
     (p.features||[]).some(f=>f.name&&f.name.includes('Champion primitif'))){
    const _cpConBefore=mod(p.abilities[2]);
    const _cpForBefore=p.abilities[0];
    p.abilities[0]=Math.min(24,p.abilities[0]+4);
    p.abilities[2]=Math.min(24,p.abilities[2]+4);
    const _cpConAfter=mod(p.abilities[2]);
    if(_cpConAfter>_cpConBefore){
      const _cpBonus=(_cpConAfter-_cpConBefore)*totalLevel(p);
      p.hpMax+=_cpBonus;p.hp=Math.min(p.hpMax,p.hp+_cpBonus);
    }
  }
  // Fix 4 — Charges de rage : refill au nouveau max après passage de niveau
  const _luBarbLvl=((p.classes||[]).find(c=>c.name==='Barbare')||{}).level||0;
  if(_luBarbLvl>0){
    const _luRageMax=_luBarbLvl>=20?Infinity:(_luBarbLvl>=17?6:_luBarbLvl>=12?5:_luBarbLvl>=6?4:_luBarbLvl>=3?3:2);
    if(!p.combatCharges)p.combatCharges={};
    if(_luBarbLvl>=20){delete p.combatCharges['RageCharges'];}
    else{p.combatCharges['RageCharges']=_luRageMax;}
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
function searchClasse(q){const drop=document.getElementById('classeDrop');if(!drop)return;if(!q){drop.style.display='none';return;}const res=SRD.classes.filter(c=>c.name.toLowerCase().includes(q.toLowerCase())).slice(0,8);if(!res.length){drop.style.display='none';return;}drop.style.display='block';drop.innerHTML=res.map(c=>`<div class="aci" onmousedown="event.preventDefault();addClassEntry('${jsq(c.name)}')"><div class="ain">${esc(c.name)}</div><div class="ais">${c.hd} — JS: ${c.saves.join(', ')}</div></div>`).join('');}
function addClassEntry(name){const p=P();if(!p.classes)p.classes=[];if(!p.classes.find(c=>c.name===name))p.classes.push({name,level:1});const inp=document.getElementById('classeInput');if(inp)inp.value='';const drop=document.getElementById('classeDrop');if(drop)drop.style.display='none';render();}
function searchBgPerso(q){const drop=document.getElementById('bgDropPerso');if(!drop)return;upd('background',q);if(!q){drop.style.display='none';return;}const res=BACKGROUNDS.filter(b=>b.name.toLowerCase().includes(q.toLowerCase()));if(!res.length){drop.style.display='none';return;}drop.style.display='block';drop.innerHTML=res.map(b=>`<div class="aci" onmousedown="event.preventDefault();selectBgPerso('${jsq(b.name)}')"><div class="ain">${esc(b.name)}</div><div class="ais">${esc(b.skills.join(', '))} — ${esc(b.desc)}</div></div>`).join('');}
function selectBgPerso(name){upd('background',name);const inp=document.getElementById('bgInputPerso');if(inp)inp.value=name;const drop=document.getElementById('bgDropPerso');if(drop)drop.style.display='none';}

