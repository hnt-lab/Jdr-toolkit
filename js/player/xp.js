// TAB: XP
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function tabXP(p){
  const cur=p.xp||0;const lvl=totalLevel(p);
  const curT=XP_LEVELS[lvl-1]||0;const nextT=XP_LEVELS[lvl]||XP_LEVELS[19];
  const pct=Math.min(100,Math.round(((cur-curT)/Math.max(1,nextT-curT))*100));
  const toNext=Math.max(0,nextT-cur);const canLvlUp=cur>=nextT&&lvl<20&&!p.pendingLevelUp;

  const xpBar=`<div style="display:flex;align-items:baseline;gap:8px;margin-bottom:4px">
    <span style="font-size:28px;font-weight:700;color:var(--cp)">${cur.toLocaleString()}</span>
    <span style="color:var(--text3)">XP</span>
  </div>
  <div class="xp-bar-wrap"><div class="xp-bar-fill" style="width:${pct}%"></div></div>
  <div style="font-size:12px;color:var(--text3);margin-bottom:10px">${toNext>0?`${toNext.toLocaleString()} XP jusqu'au niveau ${lvl+1}`:'PrÃªt !'}</div>`;

  const lvlUpBtn=canLvlUp?`<div style="padding:10px;background:var(--cglow);border:1px solid var(--cp);border-radius:8px;text-align:center;margin-bottom:10px">
    <div style="font-size:14px;font-weight:600;color:var(--cp);margin-bottom:6px">â¬† Niveau ${lvl+1} disponible !</div>
    <button class="btn bac" onclick="unlockLevelUp()">Ouvrir montÃ©e de niveau</button>
  </div>`:p.pendingLevelUp?`<div style="padding:10px;background:var(--cglow);border:1px solid #ffd54f;border-radius:8px;text-align:center;font-size:13px;color:#ffd54f;margin-bottom:10px">â¬† Voir l'onglet <strong>Niveau +</strong></div>`:'';

  const niveauTable=`<div class="panel"><div class="pt">Table des niveaux</div>
    <table style="width:100%;border-collapse:collapse;font-size:12px">
      <thead><tr style="color:var(--text3);border-bottom:1px solid var(--border)"><th style="text-align:left;padding:4px 8px">Niv.</th><th style="text-align:right;padding:4px 8px">XP</th><th style="text-align:right;padding:4px 8px">MaÃ®trise</th></tr></thead>
      <tbody>${XP_LEVELS.map((xp,i)=>`<tr style="background:${i+1===lvl?'var(--cglow)':'transparent'};border-bottom:1px solid var(--border)">
        <td style="padding:4px 8px;color:${i+1===lvl?'var(--cp)':'var(--text2)'};font-weight:${i+1===lvl?700:400}">${i+1}${i+1===lvl?' â—€':''}</td>
        <td style="text-align:right;padding:4px 8px;color:var(--text3)">${xp.toLocaleString()}</td>
        <td style="text-align:right;padding:4px 8px;color:var(--cp)">+${pb(i+1)}</td>
      </tr>`).join('')}</tbody>
    </table>
  </div>`;

  if(!isMJ()){
    // Mode joueur : barre XP + bouton level up + table
    return`<div class="g2" style="gap:10px">
      <div><div class="panel mb10"><div class="pt">ExpÃ©rience</div>${xpBar}${lvlUpBtn}</div></div>
      <div>${niveauTable}</div>
    </div>`;
  }

  // Mode MJ : tout + rÃ©compenses rapides + ajout XP
  const recompenses=`<div class="panel" style="padding:8px;margin-top:10px">
    <div class="pt" style="font-size:11px">RÃ©compenses rapides</div>
    ${[[10,'PiÃ¨ge dÃ©samorcÃ©'],[25,'Gobelin tuÃ©'],[50,'Rencontre facile'],[100,'Rencontre moyenne'],[200,'Rencontre difficile'],[450,'Boss tuÃ©'],[1000,'Jalon narratif']].map(([xp,lbl])=>`<div class="xp-reward" onclick="quickXP(${xp})">+${xp} XP â€” ${lbl}</div>`).join('')}
  </div>`;

  const encCalcPanel=`<div class="panel" style="margin-top:10px">
    <div class="pt" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
      <span>ðŸŽ¯ Calculateur de rencontre</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
      <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Nb de joueurs</div><input class="fi" id="enc_size" type="number" min="1" max="8" value="${_encGroupSize}" oninput="encRefresh()"></div>
      <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Niveau moyen</div><input class="fi" id="enc_level" type="number" min="1" max="20" value="${_encGroupLevel}" oninput="encRefresh()"></div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
      <div style="font-size:11px;font-weight:600;color:var(--text2)">Monstres de la rencontre</div>
      <button class="btn bsm bprimary" onclick="encAddMonster()">+ Monstre</button>
    </div>
    <div id="enc_monsterList">${_encMonsters.length?_encMonsters.map((m,i)=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px"><span style="font-size:12px"><strong>${esc(m.name)}</strong> <span style="color:var(--text3)">CR ${m.cr}</span> â€” <span style="color:var(--cp)">${m.xp.toLocaleString()} XP</span></span><button class="btn bsm" style="color:#e53935;border-color:rgba(229,57,53,.4);padding:0 6px" onclick="encRemoveMonster(${i})">âœ•</button></div>`).join(''):'<div style="font-size:11px;color:var(--text3);font-style:italic;text-align:center;padding:8px">Aucun monstre â€” ajoutez-en ci-dessus.</div>'}</div>
    <div id="enc_result" style="margin-top:8px">${encResultHTML(_encGroupSize,_encGroupLevel)}</div>
    <button class="btn bac" style="width:100%;margin-top:10px" onclick="encDistribute()">â­ Distribuer l'XP aux joueurs</button>
  </div>`;

  return`<div class="g2" style="gap:10px">
    <div>
      <div class="panel mb10">
        <div class="pt" style="display:flex;align-items:center;justify-content:space-between"><span>ExpÃ©rience</span><span style="font-size:10px;color:var(--cp);border:1px solid var(--cp);border-radius:10px;padding:2px 8px">ðŸŽ² MJ</span></div>
        ${xpBar}
        <div style="display:flex;gap:6px;margin-bottom:10px">
          <input class="fi" id="xpAdd" type="number" placeholder="XP Ã  ajouter" min="0">
          <button class="btn bac bsm" style="white-space:nowrap" onclick="addXP()">+ Ajouter</button>
        </div>
        ${lvlUpBtn}
        ${recompenses}
      </div>
      ${encCalcPanel}
      <div style="margin-top:10px;padding:10px;background:rgba(229,57,53,.05);border:1px solid rgba(229,57,53,.3);border-radius:8px">
        <div style="font-size:12px;font-weight:600;color:#e53935;margin-bottom:6px">ðŸ”„ RÃ©initialisation des niveaux</div>
        <div style="font-size:11px;color:var(--text3);margin-bottom:8px">Remet le personnage au niveau 1. Les capacitÃ©s de classe sont rÃ©initialisÃ©es, l'XP est conservÃ©e et il devra repasser toutes les Ã©tapes de montÃ©e de niveau.</div>
        <button class="btn bsm" style="color:#e53935;border-color:rgba(229,57,53,.5);width:100%" onclick="mjRespecCharacter()">ðŸ”„ RÃ©initialiser les niveaux</button>
      </div>
    </div>
    <div>${niveauTable}</div>
  </div>`;
}
function _checkLevelUpPopup(oldXp,newXp,lvl){
  const nextT=XP_LEVELS[lvl]||XP_LEVELS[19];
  if(lvl<20&&oldXp<nextT&&newXp>=nextT){
    const newLvl=lvl+1;
    _showCombatPopup('â¬†',`Niveau ${newLvl} !`,`Tu peux monter au niveau ${newLvl}. Va dans l'onglet â­ XP.`,5500);
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
  if(p.race==='Nain des collines')p.hpMax+=diff; // TÃ©nacitÃ© naine
  p.hp=Math.min(p.hp,p.hpMax);
  entry.level=newLvl;
  // Mettre l'XP au dÃ©but du nouveau niveau si on monte, ou Ã  la fin du niveau prÃ©cÃ©dent si on descend
  p.xp=XP_LEVELS[Math.max(0,newLvl-1)]||0;
  p.pendingLevelUp=false;
  render();showToast(`ðŸŽ² MJ â€” Niveau ${mc.name} â†’ ${newLvl}`);
}
function mjRespecCharacter(){
  if(!confirm('RÃ©initialiser ce personnage au niveau 1 ?\n\nToutes les capacitÃ©s de classe acquises seront perdues. L\'XP sera conservÃ©e et le personnage pourra passer Ã  nouveau tous ses niveaux.'))return;
  const p=P();const mc=mainClass(p);if(!mc){showToast('âŒ Aucune classe principale dÃ©tectÃ©e.');return;}
  const dSrd=SRD.classes.find(c=>c.name===mc.name);
  const hd=dSrd?dSrd.hdVal:8;
  const conMod=mod((p.abilities||[10,10,10,10,10,10])[2]);
  p.classes=[{name:mc.name,level:1}];
  const classNames=SRD.classes.map(c=>c.name);
  p.features=(p.features||[]).filter(f=>!f.classe||!classNames.includes(f.classe));
  p.hpMax=Math.max(1,hd+conMod);
  p.hp=p.hpMax;
  p.combatCharges={};
  p.dmgResistances=(p.dmgResistances||[]).filter(r=>!['Contondant','Perforant','Tranchant','Feu','Froid','Foudre','NÃ©crotique','Acide','Tonnerre','Radiant','Poison'].includes(r));
  p.conditions=[];
  p.exhaustion=0;
  p.pendingLevelUp=true;
  saveAll();render();showToast(`ðŸ”„ ${p.charName||'Personnage'} rÃ©initialisÃ© au niveau 1. L'XP est conservÃ©e.`);
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// DONNÃ‰ES MONTÃ‰E DE NIVEAU PAR CLASSE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const CLASS_LEVEL_DATA={
  Guerrier:{
    archetypes:[
      {name:"Champion",desc:"Niv.3 : Critique amÃ©liorÃ© (19-20). Niv.7 : AthlÃ¨te accompli (Â½ maÃ®trise aux jets FOR/DEX/CON sans maÃ®trise). Niv.10 : Style de combat supplÃ©mentaire. Niv.15 : Critique supÃ©rieur (18-20). Niv.18 : Survivant (rÃ©cup. 5+CON PV au dÃ©but du tour si â‰¤ Â½ PV max).",icon:"ðŸ†"},
      {name:"MaÃ®tre de guerre",desc:"Niv.3 : SupÃ©rioritÃ© martiale â€” 3 manÅ“uvres, 4 dÃ©s de supÃ©rioritÃ© d8 (DD = 8+maÃ®trise+FOR/DEX). Niv.7 : +2 manÅ“uvres, +1 dÃ©, Observation de l'ennemi. Niv.10 : +2 manÅ“uvres, dÃ©s â†’ d10. Niv.15 : +2 manÅ“uvres, +1 dÃ©, Implacable (rÃ©cupÃ¨re 1 dÃ© d'initiative si Ã  0). Niv.18 : dÃ©s â†’ d12.",icon:"âš”"},
      {name:"Chevalier occulte",desc:"Niv.3 : Sorts de magicien (INT, abjuration/Ã©vocation), Lien d'arme (invoquer une arme liÃ©e par action bonus). Niv.7 : Magie de guerre (attaque bonus aprÃ¨s un cantrip). Niv.10 : Frappe occulte (dÃ©savantage JS contre prochain sort si touchÃ©). Niv.15 : Charge arcanique (tÃ©lÃ©portation 9m via Fougue). Niv.18 : Magie de guerre amÃ©liorÃ©e (attaque bonus aprÃ¨s n'importe quel sort).",icon:"ðŸ”®"},
    ],
    combatStyles:[
      {name:"Archerie",desc:"+2 aux jets d'attaque avec armes Ã  distance."},
      {name:"Arme Ã  deux mains",desc:"Relancer les 1 et 2 sur les dÃ©s de dÃ©gÃ¢ts avec armes Ã  deux mains."},
      {name:"Combat Ã  deux armes",desc:"Ajouter le modificateur de carac. aux dÃ©gÃ¢ts de la seconde attaque."},
      {name:"DÃ©fense",desc:"+1 CA si tu portes une armure."},
      {name:"Duel",desc:"+2 aux dÃ©gÃ¢ts avec une arme tenue en une main."},
      {name:"Protection",desc:"Utiliser ta rÃ©action pour donner dÃ©savantage Ã  une attaque contre un alliÃ© Ã  1,5m."},
    ],
    levelFeatures:{
      1:["Style de combat (choix)","Second souffle (1/repos court)"],
      2:["Fougue (1/repos court) â€” action supplÃ©mentaire"],
      3:["ArchÃ©type martial (choix)"],
      4:["AmÃ©lioration de caractÃ©ristiques"],
      5:["Attaque supplÃ©mentaire (2 attaques par action)"],
      6:["AmÃ©lioration de caractÃ©ristiques"],
      7:["CapacitÃ© de l'archÃ©type"],
      8:["AmÃ©lioration de caractÃ©ristiques"],
      9:["Inflexible (1/repos long) â€” relancer un JS ratÃ©"],
      10:["CapacitÃ© de l'archÃ©type"],
      11:["Attaque supplÃ©mentaire (3 attaques)"],
      12:["AmÃ©lioration de caractÃ©ristiques"],
      13:["Inflexible (2/repos long)"],
      14:["AmÃ©lioration de caractÃ©ristiques"],
      15:["CapacitÃ© de l'archÃ©type"],
      16:["AmÃ©lioration de caractÃ©ristiques"],
      17:["Fougue (2/repos court)","Inflexible (3/repos long)"],
      18:["CapacitÃ© de l'archÃ©type"],
      19:["AmÃ©lioration de caractÃ©ristiques"],
      20:["Attaque supplÃ©mentaire (4 attaques)"],
    },
    asiLevels:[4,6,8,12,14,16,19],
    archetypeLevel:3,
    styleLevel:1,
  },
  Barbare:{
    archetypes:[
      {name:"Voie du berserker",desc:"FrÃ©nÃ©sie niv.3 (attaque bonus en rage, +1 Ã©puisement Ã  la fin). Rage aveugle niv.6 (immunitÃ© charme/peur en rage). PrÃ©sence intimidante niv.10 (action : effraie une crÃ©ature, JS SAG). ReprÃ©sailles niv.14 (rÃ©action : attaque de mÃªlÃ©e si touchÃ©).",icon:"ðŸ”¥"},
      {name:"Voie du guerrier totem",desc:"Esprit totem niv.3 (choix : ours â€” rÃ©sistances en rage / aigle â€” pas d'attaque d'opportunitÃ© en rage / loup â€” avantage alliÃ©). Aspect de la bÃªte niv.6. Marcheur entre les mondes niv.10. Lien totÃ©mique niv.14.",icon:"ðŸº"},
      {name:"Voie de la magie sauvage",desc:"Sursaut sauvage niv.3 (effet magique alÃ©atoire d8 Ã  chaque rage). RÃ©serve de magie niv.6. RÃ©action instable niv.10. Sursaut contrÃ´lÃ© niv.14.",icon:"âœ¨"},
    ],
    levelFeatures:{
      1:["Rage (2 utilisations, +2 dÃ©gÃ¢ts)","DÃ©fense sans armure (CA = 10+DEX+CON)"],
      2:["Attaque tÃ©mÃ©raire (avantage attaque FOR, mais attaquants aussi)","Sens du danger (avantage JS DEX vs piÃ¨ges/sorts/effets visibles)"],
      3:["Voie primitive (choix)","3 rages"],
      4:["AmÃ©lioration de caractÃ©ristiques"],
      5:["Attaque supplÃ©mentaire (2 attaques)","DÃ©placement rapide (+3m sans armure lourde)"],
      6:["4 rages","CapacitÃ© de la voie"],
      7:["Instinct sauvage (avantage Initiative, peut rager si surpris)"],
      8:["AmÃ©lioration de caractÃ©ristiques"],
      9:["Critique brutal (1 dÃ© de dÃ©gÃ¢ts sup. sur critique)","Bonus dÃ©gÃ¢ts rage: +3"],
      10:["CapacitÃ© de la voie"],
      11:["Rage implacable (JS CON DD10 si tombe Ã  0 PV en rage â†’ 1 PV)"],
      12:["AmÃ©lioration de caractÃ©ristiques","5 rages"],
      13:["Critique brutal (2 dÃ©s sup.)"],
      14:["CapacitÃ© de la voie"],
      15:["Rage persistante (reste en rage si plus d'actions hostiles, sauf si inconscient)"],
      16:["AmÃ©lioration de caractÃ©ristiques","Bonus dÃ©gÃ¢ts rage: +4"],
      17:["6 rages","Critique brutal (3 dÃ©s sup.)"],
      18:["Puissance indomptable (rÃ©sultat d'un jet de FOR < valeur de FOR â†’ utiliser la valeur)"],
      19:["AmÃ©lioration de caractÃ©ristiques"],
      20:["Champion primitif (+4 FOR et CON, max 24)","Rages illimitÃ©es"],
    },
    asiLevels:[4,8,12,16,19],
    archetypeLevel:3,
  },
  Barde:{
    archetypes:[
      {name:"CollÃ¨ge du savoir",desc:"MaÃ®trises supplÃ©mentaires (3 compÃ©tences au choix). Mots cinglants niv.3 (rÃ©action : dÃ©pense 1 inspiration bardique, la cible soustrait le dÃ© Ã  son jet). Secrets magiques supplÃ©mentaires niv.6 (2 sorts de n'importe quelle classe). CompÃ©tence hors-pair niv.14 (dÃ©pense 1 inspiration pour amÃ©liorer un jet ratÃ©).",icon:"ðŸ“š"},
      {name:"CollÃ¨ge de la vaillance",desc:"MaÃ®trises armures intermÃ©diaires, boucliers et armes de guerre. Inspiration martiale niv.3 (alliÃ© utilise le dÃ© sur dÃ©gÃ¢ts ou CA). Attaque supplÃ©mentaire niv.6. Magie de combat niv.14 (sort bardique comme action bonus si tu attaques).",icon:"ðŸ›¡"},
    ],
    levelFeatures:{
      1:["Incantation","Inspiration bardique (1d6, CHA fois/repos long)"],
      2:["Touche-Ã -tout","Chant reposant (1d6)"],
      3:["CollÃ¨ge bardique (choix)","Expertise (2 compÃ©tences Ã—2 maÃ®trise)"],
      4:["AmÃ©lioration de caractÃ©ristiques"],
      5:["Inspiration bardique (1d8)","Source d'inspiration (repos court)"],
      6:["Contre-charme","CapacitÃ© du collÃ¨ge"],
      7:[],
      8:["AmÃ©lioration de caractÃ©ristiques"],
      9:["Chant reposant (1d8)"],
      10:["Inspiration bardique (1d10)","Expertise (2 autres compÃ©tences)","Secrets magiques (2 sorts de n'importe quelle classe)"],
      11:[],
      12:["AmÃ©lioration de caractÃ©ristiques"],
      13:["Chant reposant (1d10)"],
      14:["Secrets magiques (2 sorts)","CapacitÃ© du collÃ¨ge"],
      15:["Inspiration bardique (1d12)"],
      16:["AmÃ©lioration de caractÃ©ristiques"],
      17:["Chant reposant (1d12)"],
      18:["Secrets magiques (2 sorts supplÃ©mentaires de n'importe quelle classe)"],
      19:["AmÃ©lioration de caractÃ©ristiques"],
      20:["Inspiration supÃ©rieure (min 1 dÃ© si 0)"],
    },
    asiLevels:[4,8,12,16,19],
    archetypeLevel:3,
    spellsPerLevel:{3:1,4:2,5:1,7:1,8:1,9:1,10:2,11:1,13:1,14:1,15:1,16:1,17:1,19:1,20:1},
    cantripAtLevels:[4,10],
  },
  Clerc:{
    archetypes:[
      {name:"Domaine de la vie",desc:"MaÃ®trise armures lourdes. Disciple de la vie (soins +2+niv du sort). Conduit : PrÃ©servation de la vie niv.2. GuÃ©risseur bÃ©ni niv.6. GuÃ©rison suprÃªme niv.17.",icon:"ðŸ’š"},
      {name:"Domaine de la lumiÃ¨re",desc:"Sort mineur : LumiÃ¨re. Illumination protectrice niv.1 (rÃ©action, dÃ©savantage attaquant). Conduit : Radiance de l'aube niv.2. Illumination amÃ©liorÃ©e niv.6. Halo de lumiÃ¨re niv.17.",icon:"â˜€"},
      {name:"Domaine de la nature",desc:"MaÃ®trise armures lourdes + 1 compÃ©tence (Dressage/Nature/Survie). Sort mineur druide niv.1. Conduit : Charme des animaux et plantes niv.2. AttÃ©nuation des Ã©lÃ©ments niv.6. MaÃ®tre de la nature niv.17.",icon:"ðŸŒ¿"},
      {name:"Domaine de la tempÃªte",desc:"MaÃ®trises armures lourdes et armes de guerre. Fureur de l'ouragan niv.1 (rÃ©action, 2d8 foudre/tonnerre). Conduit : Fureur destructrice niv.2. Frappe de l'Ã©clair niv.6. Enfant de la tempÃªte niv.17.",icon:"âš¡"},
      {name:"Domaine de la tromperie",desc:"BÃ©nÃ©diction de l'escroc niv.1 (avantage DiscrÃ©tion). Conduit : Invocation de rÃ©plique (illusion) niv.2. Linceul d'ombre niv.6. RÃ©plique amÃ©liorÃ©e niv.17.",icon:"ðŸŽ­"},
      {name:"Domaine de la guerre",desc:"MaÃ®trises armures lourdes et armes de guerre. PrÃªtre de guerre niv.1 (attaque bonus avec Sagesse). Conduit : Frappe guidÃ©e (+10 attaque) niv.2. BÃ©nÃ©diction du dieu de la guerre niv.6. Avatar de bataille niv.17.",icon:"âš”"},
      {name:"Domaine du savoir",desc:"BÃ©nÃ©dictions du savoir niv.1 (2 langues + maÃ®trise doublÃ©e en 2 compÃ©tences parmi Arcanes/Histoire/Nature/Religion). Conduit : Savoir ancestral niv.2. Lecture des pensÃ©es niv.6. Visions du passÃ© niv.17.",icon:"ðŸ“š"},
      {name:"Domaine de la forge",desc:"MaÃ®trises armures lourdes et outils de forgeron. BÃ©nÃ©diction de la forge niv.1 (+1 arme/armure aprÃ¨s repos long). Conduit : BÃ©nÃ©diction de l'artisan niv.2. Ã‚me de la forge niv.6. Saint de la forge niv.17.",icon:"ðŸ”¨"},
    ],
    levelFeatures:{
      1:["Incantation","Domaine divin (choix)","CapacitÃ© du domaine niv.1"],
      2:["Conduit divin (1 utilisation â€” dont Renvoi des morts-vivants)","CapacitÃ© du domaine"],
      3:["Sorts du domaine niv.2"],
      4:["AmÃ©lioration de caractÃ©ristiques"],
      5:["Destruction des morts-vivants (IM 1/2)","Sorts du domaine niv.3"],
      6:["Conduit divin (2 utilisations)","CapacitÃ© du domaine"],
      7:["Sorts du domaine niv.4"],
      8:["AmÃ©lioration de caractÃ©ristiques","Destruction des morts-vivants (IM 1)","CapacitÃ© du domaine"],
      9:["Sorts du domaine niv.5"],
      10:["Intervention divine"],
      11:["Destruction des morts-vivants (IM 2)"],
      12:["AmÃ©lioration de caractÃ©ristiques"],
      13:[],
      14:["Destruction des morts-vivants (IM 3)","CapacitÃ© du domaine"],
      15:[],
      16:["AmÃ©lioration de caractÃ©ristiques"],
      17:["Destruction des morts-vivants (IM 4)","CapacitÃ© du domaine"],
      18:["Conduit divin (3 utilisations)"],
      19:["AmÃ©lioration de caractÃ©ristiques"],
      20:["Intervention divine amÃ©liorÃ©e (succÃ¨s automatique)"],
    },
    asiLevels:[4,8,12,16,19],
    archetypeLevel:1,
    spellsPerLevel:{2:1,3:1,5:1,7:1,9:1},
  },
  Druide:{
    archetypes:[
      {name:"Cercle de la lune",desc:"Forme sauvage en action bonus niv.2 (CR=1). Frappe primitive niv.6 (attaques en forme animale = magiques). Forme Ã©lÃ©mentaire niv.10 (2 utilisations : devenir un Ã©lÃ©mentaire air/eau/terre/feu). Mille formes niv.14 (modifier son apparence Ã  volontÃ©).",icon:"ðŸŒ™"},
      {name:"Cercle des terres",desc:"RÃ©cupÃ©ration naturelle niv.2 (repos court : rÃ©cupÃ©rer emplacements â‰¤ ceil(niv/2), max niv.5). FoulÃ©e tellurique niv.6 (terrains difficiles non-magiques sans coÃ»t). ProtÃ©gÃ©e de dame Nature niv.10 (immunitÃ© charme/peur Ã©lÃ©mentaires/fÃ©es + poison/maladie). Sanctuaire de dame Nature niv.14 (bÃªtes/plantes : JS SAG pour attaquer).",icon:"ðŸ—º"},
    ],
    levelFeatures:{
      1:["Incantation"],
      2:["Forme sauvage (CR 1/4, pas nage/vol)","Cercle druidique (choix)"],
      3:["Sorts du cercle niv.2"],
      4:["Forme sauvage amÃ©liorÃ©e (CR 1/2 nage)","AmÃ©lioration de caractÃ©ristiques"],
      5:["Sorts du cercle niv.3"],
      6:["CapacitÃ© du cercle","Forme sauvage (CR = niv/3, ex. CR 2 Ã  niv.6)"],
      7:["Sorts du cercle niv.4"],
      8:["AmÃ©lioration de caractÃ©ristiques","Forme sauvage amÃ©liorÃ©e (vol autorisÃ©)"],
      9:["Sorts du cercle niv.5"],
      10:["CapacitÃ© du cercle"],
      11:[],
      12:["AmÃ©lioration de caractÃ©ristiques"],
      13:[],
      14:["CapacitÃ© du cercle"],
      15:[],
      16:["AmÃ©lioration de caractÃ©ristiques"],
      17:[],
      18:["Corps intemporel (vieillissement Ã—10)","Sorts de bÃªte"],
      19:["AmÃ©lioration de caractÃ©ristiques"],
      20:["Archidruide (Forme sauvage illimitÃ©e)"],
    },
    asiLevels:[4,8,12,16,19],
    archetypeLevel:2,
    spellsPerLevel:{2:1,3:1,5:1,7:1,9:1},
  },
  Moine:{
    archetypes:[
      {name:"Voie de la paume",desc:"Niv.3 : Technique de la paume (toucher via DÃ©luge de coups pour pousser 4,5m / faire tomber / priver de rÃ©action). Niv.6 : PlÃ©nitude physique (soigner nivÃ—3 PV, 1/repos long). Niv.11 : TranquillitÃ© (aura de sanctuaire aprÃ¨s repos long). Niv.17 : Paume frÃ©missante (3 ki : vibrations lÃ©tales, JS CON ou tomber Ã  0 PV).",icon:"ðŸ¥‹"},
      {name:"Voie de l'ombre",desc:"Niv.3 : Arts des ombres (2 ki : lancer tÃ©nÃ¨bres, vision dans le noir, passage sans trace ou silence). Niv.6 : FoulÃ©e d'ombre (tÃ©lÃ©portation 18m dans zone sombre, avantage Ã  la prochaine attaque). Niv.11 : Linceul d'ombre (devenir invisible dans la pÃ©nombre par une action). Niv.17 : Opportuniste (rÃ©action : attaquer une crÃ©ature touchÃ©e par un alliÃ©).",icon:"ðŸŒ‘"},
      {name:"Voie des quatre Ã©lÃ©ments",desc:"Niv.3 : Disciple des Ã©lÃ©ments (Lien Ã©lÃ©mentaire + 1 discipline au choix, +1 aux niv.6/11/17). Disciplines : DÃ©luge de coups via ki pour effets Ã©lÃ©mentaires (feu, eau, air, terre). Max ki/sort selon niveau (3 niv.5-8, 4 niv.9-12, 5 niv.13-16, 6 niv.17+).",icon:"ðŸŒŠ"},
    ],
    levelFeatures:{
      1:["Arts martiaux (1d4)","DÃ©fense sans armure (CA=10+DEX+SAG)"],
      2:["Ki (2 pts â€” DÃ©fense patiente, DÃ©luge de coups, DÃ©placement aÃ©rien)","DÃ©placement sans armure (+3m)"],
      3:["Tradition monastique (choix)","Parade de projectiles"],
      4:["AmÃ©lioration de caractÃ©ristiques","Chute ralentie"],
      5:["Attaque supplÃ©mentaire","Arts martiaux 1d6","Frappe Ã©tourdissante (1 ki : JS CON ou Ã©tourdi)"],
      6:["Frappes de ki (attaques magiques)","CapacitÃ© de la tradition monastique"],
      7:["Esquive totale (aucun dÃ©gÃ¢t sur JS DEX rÃ©ussi)","SÃ©rÃ©nitÃ© (action : fin charme/peur)"],
      8:["AmÃ©lioration de caractÃ©ristiques"],
      9:["DÃ©placement sans armure amÃ©liorÃ© (marcher sur parois et surfaces liquides)"],
      10:["PuretÃ© physique (immunitÃ© maladies et poisons)"],
      11:["Arts martiaux 1d8","CapacitÃ© de la tradition monastique"],
      12:["AmÃ©lioration de caractÃ©ristiques"],
      13:["Langue du soleil et de la lune (comprendre et Ãªtre compris de tous)"],
      14:["Ã‚me de diamant (maÃ®trise de tous les JS ; dÃ©penser 1 ki pour relancer un JS ratÃ©)"],
      15:["Jeunesse Ã©ternelle (ne vieillit plus, n'a plus besoin de manger ni boire)"],
      16:["AmÃ©lioration de caractÃ©ristiques"],
      17:["Arts martiaux 1d10","CapacitÃ© de la tradition monastique"],
      18:["DÃ©sertion de l'Ã¢me (4 ki : invisible 1 min + rÃ©sistance tous dÃ©gÃ¢ts sauf force)"],
      19:["AmÃ©lioration de caractÃ©ristiques"],
      20:["Perfection de l'Ãªtre (regagne 4 pts de ki si Ã  0 Ã  l'initiative)"],
    },
    asiLevels:[4,8,12,16,19],
    archetypeLevel:3,
  },
  Paladin:{
    archetypes:[
      {name:"Serment de dÃ©votion",desc:"Niv.3 : Conduit â€” Arme sacrÃ©e (+CHA aux attaques, arme lumineuse 1 min) / Renvoi des impies (JS SAG mort-vivants/fiÃ©lons ou renvoyÃ©s). Niv.7 : Aura de dÃ©votion (immunitÃ© charme, 3mâ†’9m niv.18). Niv.15 : PuretÃ© de l'esprit (protection contre le mal et le bien en permanence). Niv.20 : Nimbe sacrÃ© (lumiÃ¨re 9m, 10 dÃ©gÃ¢ts radiants aux ennemis au dÃ©but de leur tour, avantage JS vs fiÃ©lons/mort-vivants).",icon:"âš”"},
      {name:"Serment des anciens",desc:"Niv.3 : Conduit â€” Courroux de la nature (vignes : EntravÃ©, JS FOR/DEX) / Renvoi des infidÃ¨les (fÃ©es et fiÃ©lons : renvoyÃ©s). Niv.7 : Aura de garde (rÃ©sistance dÃ©gÃ¢ts de sorts, 3mâ†’9m niv.18). Niv.15 : Sentinelle immortelle (1/repos long : passer Ã  1 PV au lieu de 0 PV). Niv.20 : Champion antique (1 min : soins 10 PV/tour, sorts en action bonus, dÃ©savantage JS ennemis Ã  3m).",icon:"ðŸŒ¿"},
      {name:"Serment de vengeance",desc:"Niv.3 : Conduit â€” Conspuer l'ennemi (JS SAG : cible effrayÃ©e ou vitesse divisÃ©e par 2) / VÅ“u d'hostilitÃ© (action bonus : avantage attaques contre une cible 1 min). Niv.7 : Vengeur implacable (attaque d'opportunitÃ© â†’ dÃ©placement Â½ vitesse en rÃ©action). Niv.15 : Ã‚me vengeresse (rÃ©action : attaquer la cible du vÅ“u si elle attaque). Niv.20 : Ange de la vengeance (1 heure : vol 18m, aura peur 9m, avantage attaques contre crÃ©atures effrayÃ©es).",icon:"ðŸ—¡"},
    ],
    levelFeatures:{
      1:["Sens divin (dÃ©tecter cÃ©lestes/fiÃ©lons/morts-vivants Ã  18m, 1+CHA fois/repos long)","Imposition des mains (nivÃ—5 PV)"],
      2:["Style de combat","Incantation (CHA)","ChÃ¢timent divin"],
      3:["SantÃ© divine (immunitÃ© maladies)","Serment sacrÃ© (choix)","Conduit divin (2 options selon serment)"],
      4:["AmÃ©lioration de caractÃ©ristiques"],
      5:["Attaque supplÃ©mentaire"],
      6:["Aura de protection (+CHA Ã  tous les JS, alliÃ©s Ã  3m)"],
      7:["CapacitÃ© du serment sacrÃ©"],
      8:["AmÃ©lioration de caractÃ©ristiques"],
      9:[],
      10:["Aura de courage (immunitÃ© peur, alliÃ©s Ã  3m)"],
      11:["ChÃ¢timent divin amÃ©liorÃ© (+1d8 radiant automatique sur toutes attaques)"],
      12:["AmÃ©lioration de caractÃ©ristiques"],
      13:[],
      14:["Contact purifiant (CHA fois/repos long : fin d'un sort sur soi ou alliÃ© touchÃ©)"],
      15:["CapacitÃ© du serment sacrÃ©"],
      16:["AmÃ©lioration de caractÃ©ristiques"],
      17:[],
      18:["AmÃ©lioration d'auras (auras de protection et courage : rayon 9m)"],
      19:["AmÃ©lioration de caractÃ©ristiques"],
      20:["CapacitÃ© du serment sacrÃ©"],
    },
    asiLevels:[4,8,12,16,19],
    archetypeLevel:3,
    styleLevel:2,
    spellsPerLevel:{2:1,3:1,5:1,7:1,9:1},
  },
  RÃ´deur:{
    archetypes:[
      {name:"Chasseur",desc:"Niv.3 : Proie du chasseur (Tueur de colosses / Tueur de gÃ©ants / Briseur de hordes). Niv.7 : Tactiques dÃ©fensives (Ã‰chapper Ã  la horde / DÃ©fense multi-attaques / Moral d'acier). Niv.11 : Attaques multiples (VolÃ©e / Attaque tourbillonnante). Niv.15 : DÃ©fense du chasseur supÃ©rieure (Esquive totale / Retour de bÃ¢ton / Esquive instinctive).",icon:"ðŸŽ¯"},
      {name:"MaÃ®tre des bÃªtes",desc:"Niv.3 : Compagnon du rÃ´deur (bÃªte taille M max, CRâ‰¤1/4, maÃ®trise PV = 4Ã—niv). Niv.7 : EntraÃ®nement exceptionnel (action bonus : commander + attaques magiques). Niv.11 : Fureur bestiale (le compagnon attaque 2Ã— sur ordre). Niv.15 : Partage des sorts (un sort te ciblant affecte aussi le compagnon Ã  9m).",icon:"ðŸ¾"},
      {name:"Gardien de drake",desc:"Niv.3 : Compagnon drake (invoquer un drake Ã©lÃ©mentaire taille P, CA 14+BM, PV 5+5Ã—niv, Coups imprÃ©gnÃ©s). Niv.7 : Lien du croc et d'Ã©cailles (drake taille M + ailes + tu peux le monter + rÃ©sistance Ã©lÃ©mentaire). Niv.11 : Souffle de drake (cÃ´ne 9m, 8d6â†’10d6 niv.15). Niv.15 : Lien parfait (drake taille G, rÃ©sistance rÃ©flexive partagÃ©e).",icon:"ðŸ‰"},
    ],
    levelFeatures:{
      1:["Ennemi jurÃ© (1 type + langue)","Explorateur-nÃ© (1 terrain favori)"],
      2:["Style de combat","Incantation (SAG)"],
      3:["ArchÃ©type de rÃ´deur (choix)","Vigilance primitive (dÃ©tecter crÃ©atures Ã  1,5km via emplacement de sort)"],
      4:["AmÃ©lioration de caractÃ©ristiques"],
      5:["Attaque supplÃ©mentaire"],
      6:["Ennemi jurÃ© amÃ©liorÃ© (2Ã¨me type)","Explorateur-nÃ© amÃ©liorÃ© (2Ã¨me terrain)"],
      7:["CapacitÃ© de l'archÃ©type"],
      8:["AmÃ©lioration de caractÃ©ristiques","FoulÃ©e tellurique (terrain difficile non magique ne coÃ»te plus de mouvement)"],
      9:[],
      10:["Explorateur-nÃ© amÃ©liorÃ© (3Ã¨me terrain)","Camouflage naturel (+10 DiscrÃ©tion immobile)"],
      11:["CapacitÃ© de l'archÃ©type"],
      12:["AmÃ©lioration de caractÃ©ristiques"],
      13:[],
      14:["Ennemi jurÃ© amÃ©liorÃ© (3Ã¨me type)","Disparition (Se cacher en action bonus)"],
      15:["CapacitÃ© de l'archÃ©type"],
      16:["AmÃ©lioration de caractÃ©ristiques"],
      17:[],
      18:["Sens sauvages (attaquer l'invisible sans dÃ©savantage, position des crÃ©atures invisibles Ã  9m)"],
      19:["AmÃ©lioration de caractÃ©ristiques"],
      20:["Tueur implacable (ajouter mod SAG Ã  attaque ou dÃ©gÃ¢ts vs ennemi jurÃ©, 1/tour)"],
    },
    asiLevels:[4,8,12,16,19],
    archetypeLevel:3,
    styleLevel:2,
    spellsPerLevel:{2:1,3:1,5:1,7:1,9:1},
  },
  Roublard:{
    archetypes:[
      {name:"Voleur",desc:"Niv.3 : Mains lestes (utiliser Ruse pour objet, pickpocket, kit de crochetage), Monte-en-l'air (Foncer en action bonus = escalade vitesse normale, saut bonus, rester agile). Niv.9 : DiscrÃ©tion suprÃªme (se cacher si lÃ©gÃ¨rement obscurci). Niv.13 : Utilisation d'objets magiques (utiliser objets magiques sans conditions de classe/race). Niv.17 : RÃ©flexes de voleur (toujours agir au premier tour de surprise, deux actions au 1er tour si non surpris).",icon:"ðŸŽ­"},
      {name:"Escroc arcanique",desc:"Niv.3 : Incantation (INT, sorts d'enchantement et d'illusion), main de mage invisible (gratuite, invisible, action bonus). Niv.9 : Embuscade magique (cible du sort dÃ©savantagÃ©e au JS si cachÃ©). Niv.13 : Escroc polyvalent (main de mage : une action par tour supplÃ©mentaire). Niv.17 : Voleur de sort (rÃ©action : contre-sort, utiliser le sort contre la cible ou le conserver).",icon:"ðŸ”®"},
      {name:"Assassin",desc:"Niv.3 : MaÃ®trise kit de dÃ©guisement/empoisonneur, Assassinat (avantage sur crÃ©ature n'ayant pas encore agi, coup critique si surprise). Niv.9 : Expert en infiltration (crÃ©er de fausses identitÃ©s, faux papiers). Niv.13 : Imposteur (dupliquer apparence/voix d'une personne Ã©tudiÃ©e 3h). Niv.17 : Frappe meurtriÃ¨re (si Attaque sournoise : cible doit rÃ©ussir CON DD 8+maÃ®trise+DEX ou tomber Ã  0 PV).",icon:"ðŸ—¡"},
      {name:"Conspirateur",desc:"Niv.3 : MaÃ®tre des intrigues (maÃ®trises kit dÃ©guisement, faussaire, jeu et deux langues), MaÃ®tre des tactiques (action Aider en action bonus Ã  portÃ©e 9m). Niv.9 : Manipulateur perspicace (Intuition/Tromperie doublement maÃ®trisÃ©es, lire les actions d'une cible). Niv.13 : Redirection (rÃ©action : dÃ©tourner une attaque contre toi vers une autre crÃ©ature Ã  1,5m). Niv.17 : Ã‚me de trompeur (rÃ©sistance psychiques, avantage contre magie de charme/terreur).",icon:"ðŸ•µ"},
    ],
    levelFeatures:{
      1:["Attaque sournoise (1d6)","Expertise (2Ã—maÃ®trise sur 2 comp.)","Jargon des voleurs"],
      2:["Ruse (action bonus: Foncer/DÃ©sengager/Se cacher)"],
      3:["ArchÃ©type (choix)","Attaque sournoise (2d6)"],
      4:["AmÃ©lioration de caractÃ©ristiques"],
      5:["Attaque sournoise (3d6)","Esquive instinctive (rÃ©action : rÃ©duire dÃ©gÃ¢ts d'une attaque de moitiÃ©)"],
      6:["Expertise (2 autres compÃ©tences)"],
      7:["Attaque sournoise (4d6)","Esquive totale (JS DEX rÃ©ussi = 0 dÃ©gÃ¢ts)"],
      8:["AmÃ©lioration de caractÃ©ristiques"],
      9:["Attaque sournoise (5d6)","CapacitÃ© de l'archÃ©type"],
      10:["AmÃ©lioration de caractÃ©ristiques"],
      11:["Attaque sournoise (6d6)","Savoir-faire (tout jet de compÃ©tence maÃ®trisÃ© min 10)"],
      12:["AmÃ©lioration de caractÃ©ristiques"],
      13:["Attaque sournoise (7d6)","CapacitÃ© de l'archÃ©type"],
      14:["Perception aveugle (crÃ©atures cachÃ©es/invisibles Ã  3m)"],
      15:["Attaque sournoise (8d6)","Esprit fuyant (maÃ®trise JS SAG)"],
      16:["AmÃ©lioration de caractÃ©ristiques"],
      17:["Attaque sournoise (9d6)","CapacitÃ© de l'archÃ©type"],
      18:["Insaisissable"],
      19:["AmÃ©lioration de caractÃ©ristiques","Attaque sournoise (10d6)"],
      20:["Coup de chance"],
    },
    asiLevels:[4,8,10,12,16,19],
    archetypeLevel:3,
  },
  Ensorceleur:{
    archetypes:[
      {name:"Origine draconique",desc:"AncÃªtre dragon (type au choix). Niv.1 : CA 13+DEX, parle draconique, PV max +1/niveau (RÃ©sistance draconique). Niv.6 : AffinitÃ© Ã©lÃ©mentaire (bonus dÃ©gÃ¢ts + rÃ©sistance). Niv.14 : Ailes draconiques. Niv.18 : PrÃ©sence draconique.",icon:"ðŸ‰"},
      {name:"Magie sauvage",desc:"Surtension de magie sauvage (MJ lance 1d20 aprÃ¨s un sort niv1+, sur 1: effet alÃ©atoire). Niv.1 : MarÃ©e du chaos (avantage sur un jet, jusqu'Ã  prochaine surtension). Niv.6 : Chance forcÃ©e (2 pts : impose dÃ©savantage/avantage sur le jet d'une cible). Niv.14 : Chaos contrÃ´lÃ© (choisir parmi 2 effets de surtension). Niv.18 : Bombardement de sort (relancer les 1 aux dÃ©gÃ¢ts).",icon:"ðŸŒ€"},
    ],
    levelFeatures:{
      1:["Incantation","Origine d'ensorceleur (choix) â€” capacitÃ© immÃ©diate selon l'origine"],
      2:["Points de sorcellerie (2 pts)","Magie flexible (convertir emplacementsâ†”points de sorcellerie)"],
      3:["MÃ©tamagie (2 options au choix)"],
      4:["AmÃ©lioration de caractÃ©ristiques","1 sort mineur supplÃ©mentaire"],
      5:[],
      6:["CapacitÃ© de l'origine (niv.6)"],
      7:[],
      8:["AmÃ©lioration de caractÃ©ristiques"],
      9:[],
      10:["MÃ©tamagie (3e option)","1 sort mineur supplÃ©mentaire"],
      11:[],
      12:["AmÃ©lioration de caractÃ©ristiques"],
      13:[],
      14:["CapacitÃ© de l'origine (niv.14)"],
      15:[],
      16:["AmÃ©lioration de caractÃ©ristiques"],
      17:["MÃ©tamagie (4e option)"],
      18:["CapacitÃ© de l'origine (niv.18)"],
      19:["AmÃ©lioration de caractÃ©ristiques"],
      20:["Restauration d'ensorceleur (1/repos court : rÃ©cupÃ¨re 4 pts de sorcellerie)"],
    },
    asiLevels:[4,8,12,16,19],
    archetypeLevel:1,
    spellsPerLevel:{1:2,2:1,3:1,4:2,5:1,6:1,7:1,8:1,9:1,10:2,11:1,13:1,15:1,17:1},
    cantripAtLevels:[4,10],
    metamagicOptions:[
      {name:"Magie prudente",desc:"DÃ©pense 1 pt : les crÃ©atures choisies rÃ©ussissent automatiquement leur JS contre ton sort."},
      {name:"Magie distante",desc:"DÃ©pense 1 pt : double la portÃ©e du sort (min 9m si contact)."},
      {name:"Magie renforcÃ©e",desc:"DÃ©pense 1 pt : relance jusqu'Ã  CHA dÃ©s de dÃ©gÃ¢ts du sort (garder le nouveau rÃ©sultat)."},
      {name:"Magie Ã©tendue",desc:"DÃ©pense 1 pt : double la durÃ©e du sort (maximum 24h)."},
      {name:"Magie intensifiÃ©e",desc:"DÃ©pense 3 pts : la cible a dÃ©savantage au JS contre ton sort."},
      {name:"Magie promptive",desc:"DÃ©pense 2 pts : lancer un sort (temps de lancement 1 action) comme action bonus si l'autre sort de ce tour est un cantrip."},
      {name:"Magie subtile",desc:"DÃ©pense 1 pt : lancer sans composante verbale ni somatique."},
      {name:"Magie jumelle",desc:"DÃ©pense des points Ã©gaux au niveau du sort (1 min pour cantrip) : cibler une 2Ã¨me crÃ©ature admissible."},
    ],
  },
  Occultiste:{
    archetypes:[
      {name:"L'ArchifÃ©e",desc:"Niv.1 : PrÃ©sence fÃ©erique (action : charmer ou effrayer dans un cube 3m, JS SAG, 1/repos). Niv.6 : Ã‰chappatoire brumeuse (rÃ©action sur dÃ©gÃ¢ts : invisible + tÃ©lÃ©portation 18m, 1/repos). Niv.10 : DÃ©fenses captivantes (immunitÃ© charme + retourner le charme contre l'attaquant). Niv.14 : Sombre dÃ©lire (action : charmer/effrayer concentr. 1 min, illusion immersive).",icon:"ðŸ§š"},
      {name:"Le FiÃ©lon",desc:"Niv.1 : BÃ©nÃ©diction du tÃ©nÃ©breux (tuer une crÃ©ature hostile â†’ PV temporaires = CHA + niveau). Niv.6 : Chance du tÃ©nÃ©breux (ajouter 1d10 Ã  un jet de carac. ou sauvegarde, 1/repos). Niv.10 : RÃ©sistance fiÃ©lonne (choisir 1 type de dÃ©gÃ¢ts par repos, rÃ©sistance Ã  ce type). Niv.14 : TraversÃ©e des enfers (toucher â†’ cible disparaÃ®t 1 tour dans les plans infÃ©rieurs, 10d10 dÃ©gÃ¢ts psychiques au retour).",icon:"ðŸ˜ˆ"},
      {name:"Le Grand Ancien",desc:"Niv.1 : Esprit Ã©veillÃ© (tÃ©lÃ©pathie Ã  9m vers toute crÃ©ature comprenant une langue). Niv.6 : Protection entropique (rÃ©action : dÃ©savantage Ã  l'attaquant + avantage en retour si l'attaque rate, 1/repos). Niv.10 : Bouclier mental (immunitÃ© lecture de pensÃ©es, rÃ©sistance dÃ©gÃ¢ts psychiques). Niv.14 : Asservissement (toucher un humanoÃ¯de incapable d'agir â†’ charme permanent + tÃ©lÃ©pathie).",icon:"ðŸ™"},
      {name:"Le GÃ©nie",desc:"Niv.1 : Catalyseur de GÃ©nie (focaliseur + RÃ©pit embouteillÃ© : entrer dans le catalyseur pour se cacher/reposer + Ire du gÃ©nie : +maÃ®trise dÃ©gÃ¢ts Ã©lÃ©mentaires 1/tour). Niv.6 : PrÃ©sent Ã©lÃ©mentaire (rÃ©sistance Ã©lÃ©mentaire + vol 9m Ã— maÃ®trise/repos long). Niv.10 : Sanctuaire du gÃ©nie (5 alliÃ©s dans le catalyseur, repos court amÃ©liorÃ©). Niv.14 : Souhait limitÃ© (1 sort niv.â‰¤6 sans composantes, 1/1d4 repos longs).",icon:"ðŸŒŸ"},
    ],
    levelFeatures:{
      1:["Patron d'Outremonde (choix)","Magie de pacte (1 emplacement niv.1)"],
      2:["Manifestations occultes (2 au choix)","Magie de pacte (2 emplacements niv.1)"],
      3:["Faveur de pacte (choix: ChaÃ®ne / Lame / Grimoire)","Emplacements de sorts niv.2"],
      4:["AmÃ©lioration de caractÃ©ristiques"],
      5:["Manifestations occultes (3 total)","Emplacements niv.3"],
      6:["CapacitÃ© du patron d'Outremonde","Manifestations occultes (3 total)"],
      7:["Manifestations occultes (4 total)","Emplacements niv.4"],
      8:["AmÃ©lioration de caractÃ©ristiques"],
      9:["Manifestations occultes (5 total)","Emplacements niv.5"],
      10:["CapacitÃ© du patron d'Outremonde"],
      11:["Arcanum mystique niv.6 (1/repos long sans emplacement)","Emplacements : 3"],
      12:["AmÃ©lioration de caractÃ©ristiques","Manifestations occultes (6 total)"],
      13:["Arcanum mystique niv.7"],
      14:["CapacitÃ© du patron d'Outremonde"],
      15:["Arcanum mystique niv.8","Manifestations occultes (7 total)"],
      16:["AmÃ©lioration de caractÃ©ristiques"],
      17:["Arcanum mystique niv.9","Emplacements : 4"],
      18:["Manifestations occultes (8 total)"],
      19:["AmÃ©lioration de caractÃ©ristiques"],
      20:["MaÃ®tre de l'occulte (1/repos long : 1 min â†’ rÃ©cup. tous emplacements Magie de pacte)"],
    },
    asiLevels:[4,8,12,16,19],
    archetypeLevel:1,
    spellsPerLevel:{1:2,2:1,3:1,4:1,5:1,6:1,7:1,8:1,9:1,11:1,13:1,15:1,17:1,19:1},
  },
  Magicien:{
    archetypes:[
      {name:"Ã‰cole d'abjuration",desc:"Niv.2 : Protection arcanique (bouclier PV = 2Ã—niv+INT, absorbe dÃ©gÃ¢ts). Niv.6 : Protection projetÃ©e (reporter le bouclier sur un alliÃ© Ã  9m). Niv.10 : Abjuration amÃ©liorÃ©e (+maÃ®trise aux jets de carac. d'abjuration). Niv.14 : RÃ©sistance aux sorts (avantage JS vs sorts + rÃ©sistance dÃ©gÃ¢ts de sorts).",icon:"ðŸ›¡"},
      {name:"Ã‰cole de divination",desc:"Niv.2 : PrÃ©sage (2 d20 aprÃ¨s repos long, remplacer n'importe quel jet avant le lancer). Niv.6 : Divination experte (rÃ©cup. emplacement infÃ©rieur en lanÃ§ant une divination niv.2+). Niv.10 : TroisiÃ¨me Å“il (lire toutes langues / vision nocturne 18m / vision Ã©thÃ©rÃ©e / voir invisible). Niv.14 : PrÃ©sage supÃ©rieur (3 d20 au lieu de 2).",icon:"ðŸ”®"},
      {name:"Ã‰cole d'enchantement",desc:"Niv.2 : Regard hypnotique (charmer une crÃ©ature Ã  1,5m, JS SAG, action). Niv.6 : Charme instinctif (rÃ©action : dÃ©vier une attaque vers une autre cible, JS SAG). Niv.10 : Partage d'enchantement (cibler 2 crÃ©atures avec un sort d'enchantement). Niv.14 : AltÃ©ration mÃ©morielle (effacer jusqu'Ã  1+CHA heures de mÃ©moire charmÃ©e).",icon:"ðŸ’œ"},
      {name:"Ã‰cole d'Ã©vocation",desc:"Niv.2 : FaÃ§onneur de sorts (protÃ©ger 1+niv. du sort alliÃ©s des effets de zone). Niv.6 : Sort mineur puissant (demi-dÃ©gÃ¢ts mÃªme sur JS rÃ©ussi). Niv.10 : Ã‰vocation amÃ©liorÃ©e (+INT Ã  un jet de dÃ©gÃ¢ts par sort d'Ã©vocation). Niv.14 : Surcharge magique (dÃ©gÃ¢ts max avec un sort niv.1-5 ; rÃ©utilisation â†’ 2d12 nÃ©crotiques/niveau).",icon:"ðŸ”¥"},
      {name:"Ã‰cole d'illusion",desc:"Niv.2 : Illusion mineure amÃ©liorÃ©e (crÃ©er son + image simultanÃ©ment). Niv.6 : Illusions mallÃ©ables (modifier une illusion active par une action). Niv.10 : Double illusoire (rÃ©action : faire manquer une attaque, 1/repos court). Niv.14 : RÃ©alitÃ© illusoire (rendre un objet illusoire rÃ©el pendant 1 min).",icon:"ðŸŒ€"},
      {name:"Ã‰cole d'invocation",desc:"Niv.2 : Invocation mineure (invoquer un objet â‰¤5kg Ã  3m). Niv.6 : Permutation (tÃ©lÃ©portation 9m ou Ã©change de place avec crÃ©ature consentante P/M). Niv.10 : Invocation consciencieuse (concentration ne se brise pas en prenant des dÃ©gÃ¢ts). Niv.14 : Convocations coriaces (crÃ©atures invoquÃ©es gagnent 30 PV temporaires).",icon:"âœ¨"},
      {name:"Ã‰cole de nÃ©cromancie",desc:"Niv.2 : Sinistre moisson (rÃ©cup. 2Ã—niveau du sort en PV en tuant par un sort). Niv.6 : Serviteurs morts-vivants (morts-vivants animÃ©s gagnent PV+niv. et bonus maÃ®trise aux dÃ©gÃ¢ts). Niv.10 : InsensibilitÃ© Ã  la non-vie (rÃ©sistance dÃ©gÃ¢ts nÃ©crotiques, PV max non rÃ©ductible). Niv.14 : ContrÃ´le des morts-vivants (contrÃ´ler tout mort-vivant visible Ã  18m).",icon:"ðŸ’€"},
      {name:"Ã‰cole de transmutation",desc:"Niv.2 : Alchimie mineure (transmuter temporairement bois/pierre/fer/cuivre/argent). Niv.6 : Pierre du transmutateur (vitesse / rÃ©sistance / vision nocturne / maÃ®trise JS CON). Niv.10 : MÃ©tamorphe (lancer mÃ©tamorphose 1/repos sans emplacement sur soi en bÃªte CRâ‰¤1). Niv.14 : MaÃ®tre transmutateur (consommer la pierre â†’ jouvence / panacÃ©e / rappel Ã  la vie / transformation majeure).",icon:"âš—"},
    ],
    levelFeatures:{
      1:["Incantation (grimoire: 6 sorts niv.1 + 3 mineurs)","Restauration arcanique (1/repos court)"],
      2:["Tradition arcanique (choix)","CapacitÃ© de la tradition"],
      3:["2 sorts niv.1-2 au grimoire"],
      4:["AmÃ©lioration de caractÃ©ristiques","1 sort mineur supplÃ©mentaire"],
      5:["2 sorts niv.1-3 au grimoire"],
      6:["CapacitÃ© de la tradition","2 sorts niv.1-3 au grimoire"],
      7:["2 sorts niv.1-4 au grimoire"],
      8:["AmÃ©lioration de caractÃ©ristiques","2 sorts niv.1-4 au grimoire"],
      9:["2 sorts niv.1-5 au grimoire"],
      10:["CapacitÃ© de la tradition","1 sort mineur supp.","2 sorts niv.1-5 au grimoire"],
      11:["2 sorts niv.1-6 au grimoire"],
      12:["AmÃ©lioration de caractÃ©ristiques","2 sorts niv.1-6 au grimoire"],
      13:["2 sorts niv.1-7 au grimoire"],
      14:["CapacitÃ© de la tradition","2 sorts niv.1-7 au grimoire"],
      15:["2 sorts niv.1-8 au grimoire"],
      16:["AmÃ©lioration de caractÃ©ristiques","2 sorts niv.1-8 au grimoire"],
      17:["2 sorts niv.1-9 au grimoire"],
      18:["MaÃ®trise des sorts (lancer niv.1-2 sans emplacement)","2 sorts niv.1-9 au grimoire"],
      19:["AmÃ©lioration de caractÃ©ristiques"],
      20:["Sorts de prÃ©dilection (2 sorts prÃ©parÃ©s qui ne comptent pas)"],
    },
    asiLevels:[4,8,12,16,19],
    archetypeLevel:2,
    spellsPerLevel:{1:2,2:2,3:2,4:3,5:2,6:2,7:2,8:2,9:2,10:3,11:2,12:2,13:2,14:2,15:2,16:2,17:2,18:2,19:2,20:2},
    cantripAtLevels:[4,10],
  },
  Artificier:{
    archetypes:[
      {name:"Alchimiste",desc:"Extraits alchimiques au niv.3 (soins, acide, feu, vapeur). Formules amÃ©liorÃ©es au niv.5 et 9.",icon:"âš—"},
      {name:"Artilleur",desc:"Canon arcanique au niv.3 (choc, feu ou protection). Canon amÃ©liorÃ© au niv.9.",icon:"ðŸ’¥"},
      {name:"Forgeron de bataille",desc:"Compagnon d'acier (CA=13+maÃ®trise). Arme de pacte niv.3. Magie dÃ©fensive niv.9.",icon:"ðŸ¤–"},
      {name:"MaÃ®tre armurier",desc:"Armure de gardien ou d'infiltrateur. AmÃ©liorations aux niveaux 9 et 15.",icon:"ðŸ›¡"},
    ],
    levelFeatures:{
      1:["Bricolage magique","Incantation (INT)"],
      2:["Infuser un objet (4 formules, 2 actives)"],
      3:["SpÃ©cialitÃ© d'artificier (choix)","Le bon outil pour le travail"],
      4:["AmÃ©lioration de caractÃ©ristiques"],
      5:["Attaque supplÃ©mentaire","Sorts du spÃ©cialiste niv.3"],
      6:["Expertise en outils"],
      7:["Ã‰clair de gÃ©nie (rÃ©action : +INT Ã  un jet ratÃ©)"],
      8:["AmÃ©lioration de caractÃ©ristiques","Infusions (6 formules, 4 actives)"],
      9:["CapacitÃ© du spÃ©cialiste","Sorts niv.5"],
      10:["Expert en objets magiques (3 attuned supplÃ©mentaires)","Infusions (8 formules, 4 actives)"],
      11:["Objet stocke-sort"],
      12:["AmÃ©lioration de caractÃ©ristiques","Infusions (10 formules, 5 actives)"],
      13:["Sorts niv.7"],
      14:["Savant en objets magiques (4 attuned)","Infusions (10 formules, 6 actives)"],
      15:["CapacitÃ© du spÃ©cialiste","Sorts niv.9"],
      16:["AmÃ©lioration de caractÃ©ristiques","Infusions (12 formules, 6 actives)"],
      17:[],
      18:["MaÃ®tre des objets magiques (5 attuned)"],
      19:["AmÃ©lioration de caractÃ©ristiques"],
      20:["Ã‚me d'artifice (+1 Ã  tous JS, 5 infusions simultanÃ©es)"],
    },
    asiLevels:[4,8,12,16,19],
    archetypeLevel:3,
    spellsPerLevel:{1:2,3:1,5:1,9:1,13:1,15:1,17:1,19:1},
  },
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// GESTIONNAIRE MONTÃ‰E DE NIVEAU
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
let LU={
  step:1,steps:[],choice:null,mcTarget:null,
  asiChoice:null,archetypeChoice:null,styleChoice:null,
  metamagicChoices:[],newSpells:[],
  expertiseChoices:[],secretsChoices:[],mcSkillChoices:[],invocationChoices:[],
};
function resetLU(){LU={step:1,steps:[],choice:null,mcTarget:null,asiChoice:null,archetypeChoice:null,styleChoice:null,metamagicChoices:[],newSpells:[],expertiseChoices:[],secretsChoices:[],mcSkillChoices:[],invocationChoices:[]};_luSpellSearch='';_luSecretsSearch='';}

// Calcule les Ã©tapes nÃ©cessaires pour cette montÃ©e de niveau
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
  const stepLabels={direction:'Direction',style:'Style de combat',archetype:'ArchÃ©type',asi:'AmÃ©lioration',expertise:'Expertise',spells:'Sorts',secretsMagiques:'Secrets Magiques',metamagic:'MÃ©tamagie',mcSkill:'CompÃ©tence',invocations:'Invocations',recap:'Confirmation'};

  const displaySteps=LU.steps.length?LU.steps:['direction','recap'];
  const progress=LU.steps.length>1?`<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:16px">
    ${displaySteps.map((s,i)=>`<span class="cp-step${i<LU.step-1?' done':i===LU.step-1?' active':''}">${i<LU.step-1?'âœ“ ':''+(i+1)+'. '}${stepLabels[s]||s}</span>${i<displaySteps.length-1?'<span style="color:var(--text3);font-size:10px;align-self:center">â€º</span>':''}`).join('')}
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
    <div class="pt" style="color:#ffd54f;font-size:15px">â¬† Passage au niveau ${newLvl}</div>
    ${progress}
    ${content}
  </div></div>`;
}

function luStepDirection(p,newLvl,mc){
  const isMultiClass=LU.choice==='multiclass';
  return`<div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:14px">Ton personnage gagne un niveau ! Comment souhaites-tu progresser ?</p>
    ${mc?`<div class="lu-choice${LU.choice==='continue'?' selected':''}" onclick="LU.choice='continue';renderTab()">
      <h3>ðŸ“ˆ Continuer en ${esc(mc.name)}</h3>
      <p>Passer au niveau ${(p.classes.find(c=>c.name===mc.name)||{level:1}).level+1} de ${esc(mc.name)}. Nouvelles capacitÃ©s garanties.</p>
    </div>`:''}
    <div class="lu-choice${LU.choice==='multiclass'?' selected':''}" onclick="LU.choice='multiclass';LU.mcTarget=null;renderTab()">
      <h3>ðŸ”€ Se multiclasser</h3>
      <p>Commencer une nouvelle classe. Les prÃ©requis de caractÃ©ristiques s'appliquent.</p>
    </div>
    ${LU.choice==='multiclass'?`<div style="margin-top:12px"><p style="font-size:12px;color:var(--text2);margin-bottom:10px">Choisis la classe (vert = prÃ©requis OK) :</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${SRD.classes.map(c=>{
      const alr=(p.classes||[]).find(cl=>cl.name===c.name);
      const req=checkMcReq(p,c.name);
      return`<div style="background:var(--surface2);border:2px solid ${LU.mcTarget===c.name?'var(--cp)':req.ok?'var(--border)':'var(--border)'};border-radius:8px;padding:10px;cursor:${req.ok?'pointer':'not-allowed'};opacity:${req.ok?1:.4};text-align:center;transition:all .2s" onclick="${req.ok?`LU.mcTarget='${esc(c.name)}';renderTab()`:''}">
        <div style="font-family:var(--F);font-size:12px;color:var(--cp)">${esc(c.name)}</div>
        <div style="font-size:10px;color:var(--text3)">${c.hd}${c.spellcaster?' âœ¦':''}</div>
        ${alr?`<div style="font-size:10px;color:#4caf50">Niv.${alr.level}</div>`:''}
        ${req.ok?`<div style="font-size:10px;color:#4caf50">âœ“</div>`:`<div style="font-size:10px;color:#e53935">${req.msg}</div>`}
      </div>`;}).join('')}</div></div>`:''}
    ${LU.choice&&(LU.choice==='continue'||(LU.choice==='multiclass'&&LU.mcTarget))?`<button class="btn bac" style="margin-top:14px;width:100%" onclick="luDirectionNext()">Continuer â†’</button>`:''}
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

// â”€â”€ Style de combat â”€â”€
function luStepStyle(p){
  const mc=mainClass(p);const cd=mc?CLASS_LEVEL_DATA[mc.name]:null;
  const styles=cd&&cd.combatStyles?cd.combatStyles:[];
  return`<div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:12px">Choisis ton style de combat. Ce choix est permanent.</p>
    ${styles.map(s=>`<div class="lu-choice${LU.styleChoice===s.name?' selected':''}" onclick="LU.styleChoice='${esc(s.name)}';renderTab()">
      <h3>${esc(s.name)}</h3><p>${esc(s.desc)}</p>
    </div>`).join('')}
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn" style="flex:1" onclick="LU.step--;renderTab()">â† Retour</button>
      <button class="btn bac" style="flex:2" onclick="LU.step++;renderTab()" ${LU.styleChoice?'':'disabled'}>Continuer â†’</button>
    </div>
  </div>`;
}

// â”€â”€ ArchÃ©type â”€â”€
function luStepArchetype(p){
  const mc=mainClass(p);const cd=mc?CLASS_LEVEL_DATA[mc.name]:null;
  const archs=cd&&cd.archetypes?cd.archetypes:[];
  window._luArchs=archs;
  return`<div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:12px">Choisis ton archÃ©type pour ${esc(mc?mc.name:'')}. Ce choix est permanent.</p>
    ${archs.map((a,i)=>`<div class="lu-choice${LU.archetypeChoice===a.name?' selected':''}" onclick="LU.archetypeChoice=window._luArchs[${i}].name;renderTab()">
      <h3>${a.icon} ${esc(a.name)}</h3><p>${esc(a.desc)}</p>
    </div>`).join('')}
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn" style="flex:1" onclick="LU.step--;renderTab()">â† Retour</button>
      <button class="btn bac" style="flex:2" onclick="LU.step++;renderTab()" ${LU.archetypeChoice?'':'disabled'}>Continuer â†’</button>
    </div>
  </div>`;
}

// â”€â”€ ASI â”€â”€
function luStepASI(p){
  const ab=p.abilities||[10,10,10,10,10,10];
  const choice=LU.asiChoice||{type:'double',stats:[],val:1};
  const isFeat=choice.type==='feat';
  const valid=isFeat?!!choice.featName:(choice.type==='asi'&&choice.stats.length===1)||(choice.type==='double'&&choice.stats.length===2);

  const featSection=isFeat?(FEATS_DB?`
    <input class="fi" id="featSearch" placeholder="Rechercher un don (ex: Alert, Actor...)..." oninput="luFilterFeats(this.value)" style="margin-bottom:8px">
    ${choice.featName?`<div style="padding:10px;background:rgba(76,175,80,.1);border:1px solid #4caf50;border-radius:8px;margin-bottom:8px">
      <div style="font-size:13px;font-weight:600;color:#4caf50">âœ“ ${esc(choice.featName)}</div>
      <div style="font-size:11px;color:var(--text2);margin-top:4px">${esc((FEATS_DB.find(f=>f.n===choice.featName)||{}).tx||'')}</div>
      <button class="btn bsm" style="margin-top:6px;font-size:11px" onclick="LU.asiChoice.featName='';renderTab()">Changer</button>
    </div>`:''}
    <div id="featResults"></div>
  `:`<div style="text-align:center;padding:14px;color:var(--text3);font-size:12px">Compendium non chargÃ© â€” patiente un instant puis reviens Ã  cet Ã©cran.</div>`):'';

  return`<div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:12px">AmÃ©lioration de caractÃ©ristiques â€” Choisis l'une des options :</p>
    <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">
      <button class="smb${!LU.asiChoice||LU.asiChoice.type==='double'?' on':''}" onclick="LU.asiChoice={type:'double',stats:[],val:1};renderTab()">+1 Ã  deux stats</button>
      <button class="smb${LU.asiChoice&&LU.asiChoice.type==='asi'?' on':''}" onclick="LU.asiChoice={type:'asi',stats:[],val:2};renderTab()">+2 Ã  une stat</button>
      <button class="smb${isFeat?' on':''}" onclick="LU.asiChoice={type:'feat',featName:'',stats:[],val:0};if(!FEATS_DB)loadFeatsDB(()=>renderTab());else renderTab()">ðŸŽ¯ Prendre un Don</button>
    </div>
    ${isFeat?featSection:`
      <p style="font-size:12px;color:var(--text3);margin-bottom:10px">Maximum 20. Clique sur les caractÃ©ristiques Ã  amÃ©liorer :</p>
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
      <button class="btn" style="flex:1" onclick="LU.step--;renderTab()">â† Retour</button>
      <button class="btn bac" style="flex:2" onclick="LU.step++;renderTab()" ${valid?'':'disabled'}>Continuer â†’</button>
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
  const _featHasPrereq=f=>!!(f.tx&&(f.tx.includes('PrÃ©requis')||f.tx.toLowerCase().includes('prerequisite')));
  const _featCard=f=>{const hasPre=_featHasPrereq(f);return`<div class="lu-choice" style="margin-bottom:6px;padding:8px 10px;cursor:pointer" onclick="LU.asiChoice.featName='${esc(f.n)}';renderTab()"><h3 style="font-size:13px;margin-bottom:4px">${esc(f.n)}${hasPre?` <span style="font-size:10px;color:#ff9800;font-weight:400">âš  PrÃ©requis</span>`:''}</h3><p style="font-size:11px;color:var(--text2);line-height:1.4">${esc(f.tx||'')}</p></div>`;};
  if(!q.trim()){const preview=FEATS_DB.slice(0,24);el.innerHTML=preview.map(_featCard).join('')+`<div style="font-size:11px;color:var(--text3);text-align:center;padding:4px">â€¦et ${FEATS_DB.length-24} autres. Tapez pour filtrer.</div>`;return;}
  const low=q.toLowerCase();
  const res=[];
  for(let i=0;i<FEATS_DB.length&&res.length<12;i++){
    if(FEATS_DB[i].n&&FEATS_DB[i].n.toLowerCase().includes(low))res.push(FEATS_DB[i]);
  }
  el.innerHTML=res.length?res.map(_featCard).join(''):'<div style="font-size:12px;color:var(--text3);text-align:center;padding:8px">Aucun rÃ©sultat.</div>';
}

// â”€â”€ Sorts â”€â”€
const _CLASS_NAME_EN={'Barde':'Bard','Clerc':'Cleric','Druide':'Druid','Ensorceleur':'Sorcerer','Guerrier':'Fighter','Magicien':'Wizard','Moine':'Monk','Occultiste':'Warlock','Paladin':'Paladin','RÃ´deur':'Ranger','Roublard':'Rogue','Artificier':'Artificer','Barbare':'Barbarian'};
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
  const spellRow=(s)=>{const isSel=sel.includes(s.name);const dis=!isSel&&sel.length>=count;return`<div class="sk-choice${isSel?' selected':dis?' disabled':''}" onclick="${dis?'':'luToggleSpell(\''+esc(s.name)+'\')'}"><span class="sk-dot${isSel?' p':''}"></span><span style="flex:1;font-size:13px">${esc(s.name)}${s.level>1?` <span style="font-size:10px;color:var(--text3)">niv.${s.level}</span>`:''}</span><span style="font-size:11px;color:var(--text3)">${esc(s.school||'')}</span>${isSel?`<span style="color:var(--cp)">âœ“</span>`:''}</div>`;};
  return`<div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:8px">Choisis <strong style="color:var(--cp)">${count}</strong> nouveau${count>1?'x':''} sort${count>1?'s':''}${isCantripLevel?' (dont 1 sort mineur)':''}. (${sel.length}/${count} sÃ©lectionnÃ©${sel.length>1?'s':''})</p>
    <input type="text" placeholder="ðŸ” Rechercher..." value="${esc(_luSpellSearch)}" oninput="_luSpellSearch=this.value;renderTab()" style="width:100%;box-sizing:border-box;padding:7px 10px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px;margin-bottom:8px">
    ${isCantripLevel?`<div style="font-size:12px;font-weight:600;color:var(--cp);margin:8px 0 4px">Sorts mineurs</div>${cantrips.length?cantrips.map(spellRow).join(''):'<div style="font-size:12px;color:var(--text3);padding:4px 0">Aucun rÃ©sultat.</div>'}`:``}
    <div style="font-size:12px;font-weight:600;color:var(--cp);margin:8px 0 4px">Sorts niveau 1</div>
    ${l1.length?l1.map(spellRow).join(''):'<div style="font-size:12px;color:var(--text3);padding:4px 0">Aucun rÃ©sultat.</div>'}
    ${maxLvl>=2?`<div style="font-size:12px;font-weight:600;color:var(--cp);margin:8px 0 4px">Sorts niveau 2â€“${maxLvl}</div>${l2plus.length?l2plus.map(spellRow).join(''):'<div style="font-size:12px;color:var(--text3);padding:4px 0">Aucun sort disponible Ã  ce niveau.</div>'}`:``}
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn" style="flex:1" onclick="LU.step--;_luSpellSearch='';renderTab()">â† Retour</button>
      <button class="btn bac" style="flex:2" onclick="LU.step++;_luSpellSearch='';renderTab()" ${sel.length>=count?'':'disabled'}>Continuer â†’</button>
    </div>
  </div>`;
}
function luToggleSpell(name){const idx=LU.newSpells.indexOf(name);if(idx>=0)LU.newSpells.splice(idx,1);else LU.newSpells.push(name);renderTab();}

// â”€â”€ Expertise â”€â”€
function luStepExpertise(p){
  const profSkills=SKILLS.filter(sk=>(p.skillProf||{})[sk.name]===1);
  const sel=LU.expertiseChoices;const count=2;
  return`<div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:8px">Choisis <strong style="color:var(--cp)">${count}</strong> compÃ©tences maÃ®trisÃ©es pour doubler ton bonus (expertise). (${sel.length}/${count})</p>
    ${profSkills.length?profSkills.map(sk=>{const isSel=sel.includes(sk.name);const dis=!isSel&&sel.length>=count;return`<div class="sk-choice${isSel?' selected':dis?' disabled':''}" onclick="${dis?'':'luToggleExpertise(\''+esc(sk.name)+'\')'}"><span class="sk-dot${isSel?' p':''}"></span><span style="flex:1;font-size:13px">${esc(sk.name)}</span><span style="font-size:11px;color:var(--text3)">${ABILITIES_SH[sk.ab]}</span>${isSel?`<span style="color:var(--cp)">âœ“ Expertise</span>`:''}</div>`;}).join(''):`<div style="font-size:12px;color:var(--text3);font-style:italic;padding:8px 0">Aucune compÃ©tence maÃ®trisÃ©e disponible. Ajoute des maÃ®trises d'abord dans l'onglet CompÃ©tences.</div>`}
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn" style="flex:1" onclick="LU.step--;renderTab()">â† Retour</button>
      <button class="btn bac" style="flex:2" onclick="LU.step++;renderTab()" ${sel.length>=count||profSkills.length<count?'':'disabled'}>Continuer â†’</button>
    </div>
  </div>`;
}
function luToggleExpertise(name){const idx=LU.expertiseChoices.indexOf(name);if(idx>=0)LU.expertiseChoices.splice(idx,1);else LU.expertiseChoices.push(name);renderTab();}

// â”€â”€ CompÃ©tence multiclasse (Barde, RÃ´deur, Roublard) â”€â”€
function luStepMcSkill(p){
  const d=SRD.classes.find(c=>c.name===LU.mcTarget);
  const count=d?d.mcSkillCount||0:0;
  const available=d?d.skills||[]:[];
  const sel=LU.mcSkillChoices;
  const already=p.skillProf||{};
  return`<div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:8px">Multiclassage en <strong style="color:var(--cp)">${esc(LU.mcTarget)}</strong> â€” Choisis <strong style="color:var(--cp)">${count}</strong> compÃ©tence${count>1?'s':''} dans la liste de classe. (${sel.length}/${count})</p>
    ${available.map(sk=>{const isSel=sel.includes(sk);const alreadyHas=already[sk]>=1;const dis=alreadyHas||(!isSel&&sel.length>=count);return`<div class="sk-choice${isSel?' selected':dis?' disabled':''}" onclick="${(dis&&!isSel)?'':'luToggleMcSkill(\''+esc(sk)+'\')'}"><span class="sk-dot${isSel?' p':''}"></span><span style="flex:1;font-size:13px">${esc(sk)}</span>${alreadyHas?`<span style="font-size:11px;color:var(--text3)">dÃ©jÃ  maÃ®trisÃ©e</span>`:isSel?`<span style="color:var(--cp)">âœ“</span>`:''}</div>`;}).join('')}
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn" style="flex:1" onclick="LU.step--;renderTab()">â† Retour</button>
      <button class="btn bac" style="flex:2" onclick="LU.step++;renderTab()" ${sel.length>=count?'':'disabled'}>Continuer â†’</button>
    </div>
  </div>`;
}
function luToggleMcSkill(name){const idx=LU.mcSkillChoices.indexOf(name);if(idx>=0)LU.mcSkillChoices.splice(idx,1);else LU.mcSkillChoices.push(name);renderTab();}

// â”€â”€ Manifestations occultes (Occultiste) â”€â”€
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
    <p style="font-size:13px;color:var(--text2);margin-bottom:8px">Choisis <strong style="color:var(--cp)">${toChoose}</strong> manifestation${toChoose>1?'s':''} occulte${toChoose>1?'s':''}. (${sel.length}/${toChoose} sÃ©lectionnÃ©e${sel.length>1?'s':''})</p>
    ${alreadyHas.length?`<div style="font-size:11px;color:var(--text3);margin-bottom:8px;padding:5px 8px;background:var(--surface2);border-radius:6px">DÃ©jÃ  choisies : ${alreadyHas.map(n=>esc(n)).join(', ')}</div>`:''}
    ${available.map(inv=>{
      const isSel=sel.includes(inv.name);const dis=!isSel&&sel.length>=toChoose;
      return`<div class="lu-choice${isSel?' selected':dis?' disabled':''}" style="margin-bottom:6px;padding:8px 10px;cursor:${dis?'default':'pointer'}" onclick="${dis?'':'luToggleInvocation(\''+esc(inv.name)+'\')'}">
        <div style="display:flex;align-items:flex-start;gap:8px">
          <span style="color:var(--cp);font-size:14px;margin-top:1px;flex-shrink:0">${isSel?'âœ“':'â—¯'}</span>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600">${esc(inv.name)}${inv.minLevel>0?` <span style="font-size:10px;color:var(--text3);font-weight:400">niv.${inv.minLevel}+</span>`:''}</div>
            <div style="font-size:11px;color:var(--text2);margin-top:3px;line-height:1.4">${esc(inv.desc)}</div>
          </div>
        </div>
      </div>`;
    }).join('')}
    ${!available.length?`<div style="font-size:12px;color:var(--text3);font-style:italic;padding:8px">Toutes les manifestations disponibles ont dÃ©jÃ  Ã©tÃ© choisies.</div>`:''}
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn" style="flex:1" onclick="LU.step--;renderTab()">â† Retour</button>
      <button class="btn bac" style="flex:2" onclick="LU.step++;renderTab()" ${sel.length>=toChoose||!available.length?'':'disabled'}>Continuer â†’</button>
    </div>
  </div>`;
}
function luToggleInvocation(name){const idx=LU.invocationChoices.indexOf(name);if(idx>=0)LU.invocationChoices.splice(idx,1);else LU.invocationChoices.push(name);renderTab();}

// â”€â”€ Secrets Magiques (Barde) â”€â”€
let _luSecretsSearch='';
function luStepSecretsM(p){
  const count=2;const sel=LU.secretsChoices;
  const knownNames=(p.spells||[]).map(s=>s.name).concat(LU.newSpells);
  const _spDb=getSpellsDB();
  const q=_luSecretsSearch.toLowerCase().trim();
  const allSpells=_spDb.filter(s=>!knownNames.includes(s.name)&&s.level>0&&(!q||s.name.toLowerCase().includes(q)||(s.nameEN||'').toLowerCase().includes(q)));
  const maxLvl=_maxSpellLevelForLevelUp(p,'Barde');
  const byLevel={};allSpells.forEach(s=>{if(s.level<=maxLvl){if(!byLevel[s.level])byLevel[s.level]=[];byLevel[s.level].push(s);}});
  const spellRow=(s)=>{const isSel=sel.includes(s.name);const dis=!isSel&&sel.length>=count;return`<div class="sk-choice${isSel?' selected':dis?' disabled':''}" onclick="${dis?'':'luToggleSecret(\''+esc(s.name)+'\')'}"><span class="sk-dot${isSel?' p':''}"></span><span style="flex:1;font-size:13px">${esc(s.name)} <span style="font-size:10px;color:var(--text3)">niv.${s.level}</span></span><span style="font-size:11px;color:var(--text3)">${esc(s.school||'')}</span>${isSel?`<span style="color:var(--cp)">âœ“</span>`:''}</div>`;};
  return`<div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:4px">ðŸŽ­ <strong style="color:var(--cp)">Secrets Magiques</strong> â€” Choisis ${count} sorts de <em>n'importe quelle classe</em>. (${sel.length}/${count})</p>
    <input type="text" placeholder="ðŸ” Rechercher un sort..." value="${esc(_luSecretsSearch)}" oninput="_luSecretsSearch=this.value;renderTab()" style="width:100%;box-sizing:border-box;padding:7px 10px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px;margin-bottom:8px">
    ${Object.keys(byLevel).sort((a,b)=>a-b).map(lvl=>`<div style="font-size:12px;font-weight:600;color:var(--cp);margin:8px 0 4px">Niveau ${lvl}</div>${byLevel[lvl].map(spellRow).join('')}`).join('')}
    ${!allSpells.length?`<div style="font-size:12px;color:var(--text3);padding:8px 0">Aucun rÃ©sultat.</div>`:''}
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn" style="flex:1" onclick="LU.step--;_luSecretsSearch='';renderTab()">â† Retour</button>
      <button class="btn bac" style="flex:2" onclick="LU.step++;_luSecretsSearch='';renderTab()" ${sel.length>=count?'':'disabled'}>Continuer â†’</button>
    </div>
  </div>`;
}
function luToggleSecret(name){const idx=LU.secretsChoices.indexOf(name);if(idx>=0)LU.secretsChoices.splice(idx,1);else LU.secretsChoices.push(name);renderTab();}

// â”€â”€ MÃ©tamagie â”€â”€
function luStepMetamagic(p){
  const cd=CLASS_LEVEL_DATA['Ensorceleur'];
  const options=cd?cd.metamagicOptions:[];
  const mc=mainClass(p);const entry=p.classes.find(c=>c.name===(mc?mc.name:''));
  const newCLvl=(entry?entry.level:1)+1;
  const count=newCLvl===3?2:1;
  const sel=LU.metamagicChoices;
  return`<div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:12px">Choisis <strong style="color:var(--cp)">${count}</strong> option${count>1?'s':''} de MÃ©tamagie (${sel.length}/${count}) :</p>
    ${options.map(o=>{const isSel=sel.includes(o.name);const dis=!isSel&&sel.length>=count;return`<div class="lu-choice${isSel?' selected':dis?' disabled opacity-40':''}" onclick="${dis?'':'luToggleMeta(\''+esc(o.name)+'\')'}">
      <h3>${esc(o.name)}</h3><p>${esc(o.desc)}</p>
    </div>`;}).join('')}
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn" style="flex:1" onclick="LU.step--;renderTab()">â† Retour</button>
      <button class="btn bac" style="flex:2" onclick="LU.step++;renderTab()" ${sel.length>=count?'':'disabled'}>Continuer â†’</button>
    </div>
  </div>`;
}
function luToggleMeta(name){const idx=LU.metamagicChoices.indexOf(name);if(idx>=0)LU.metamagicChoices.splice(idx,1);else LU.metamagicChoices.push(name);renderTab();}

// â”€â”€ RÃ©cap & Confirmation â”€â”€
function luStepRecap(p,newLvl){
  const mc=mainClass(p);
  const entry=mc?p.classes.find(c=>c.name===mc.name):null;
  const newCLvl=entry?(entry.level+1):1;
  const cd=mc?CLASS_LEVEL_DATA[mc.name]:null;
  const feats=(cd?((cd.levelFeatures||{})[newCLvl]||[]):[]).filter(f=>f&&!f.includes('AmÃ©lioration de caractÃ©ristiques'));
  const isMulti=LU.choice==='multiclass';

  // Texte explicatif des nouvelles capacitÃ©s (depuis FEAT_DESCS)
  const explainFeats=feats.map(f=>{const desc=getFeatDesc(f);return{name:f,desc};});

  return`<div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:14px">RÃ©capitulatif â€” niveau <strong style="color:var(--cp)">${newLvl}</strong>. Confirme pour appliquer.</p>

    <div style="background:var(--surface2);border-radius:8px;padding:12px;margin-bottom:12px">
      <div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:8px">Ce qui change</div>
      ${isMulti?`<div style="font-size:13px;color:var(--text2)">ðŸ”€ Multiclassage â†’ <strong>${esc(LU.mcTarget)}</strong> niveau 1</div>
        <div style="font-size:12px;color:var(--text3);margin-top:4px">${esc((SRD.classes.find(c=>c.name===LU.mcTarget)||{}).mcProf||'â€”')}</div>`:
      `${explainFeats.map(f=>`<div style="padding:6px 0;border-bottom:1px solid var(--border)">
          <div style="font-size:13px;font-weight:600;color:var(--cp)">âœ¦ ${esc(f.name)}</div>
          <div style="font-size:12px;color:var(--text2);margin-top:2px;line-height:1.5">${esc(f.desc)}</div>
        </div>`).join('')}
      ${LU.archetypeChoice?`<div style="padding:6px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;font-weight:600;color:var(--cp)">ðŸŽ­ ArchÃ©type : ${esc(LU.archetypeChoice)}</div></div>`:''}
      ${LU.styleChoice?`<div style="padding:6px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;font-weight:600;color:var(--cp)">âš” Style : ${esc(LU.styleChoice)}</div></div>`:''}
      ${LU.asiChoice&&LU.asiChoice.type==='feat'&&LU.asiChoice.featName?`<div style="padding:6px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;font-weight:600;color:#4caf50">ðŸŽ¯ Don : ${esc(LU.asiChoice.featName)}</div></div>`:''}
      ${LU.asiChoice&&LU.asiChoice.type!=='feat'&&LU.asiChoice.stats.length?`<div style="padding:6px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;font-weight:600;color:#4caf50">ðŸ“ˆ AmÃ©lioration : +${LU.asiChoice.val} Ã  ${LU.asiChoice.stats.map(j=>ABILITIES[j]).join(' et ')}</div></div>`:''}
      ${LU.expertiseChoices.length?`<div style="padding:6px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;font-weight:600;color:#4caf50">ðŸŽ¯ Expertise : ${LU.expertiseChoices.join(', ')}</div></div>`:''}
      ${LU.newSpells.length?`<div style="padding:6px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;font-weight:600;color:var(--cp)">âœ¨ Nouveaux sorts : ${LU.newSpells.join(', ')}</div></div>`:''}
      ${LU.secretsChoices.length?`<div style="padding:6px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;font-weight:600;color:#9c27b0">ðŸŽ­ Secrets Magiques : ${LU.secretsChoices.join(', ')}</div></div>`:''}
      ${LU.metamagicChoices.length?`<div style="padding:6px 0"><div style="font-size:13px;font-weight:600;color:var(--cp)">ðŸ”® MÃ©tamagie : ${LU.metamagicChoices.join(', ')}</div></div>`:''}
      `}
    </div>

    <div style="padding:8px 12px;background:var(--cglow);border:1px solid var(--cp);border-radius:8px;margin-bottom:14px">
      <div style="font-size:12px;color:var(--text2)">PV gagnÃ©s : <strong style="color:var(--cp)">${(()=>{const d=mc?SRD.classes.find(c=>c.name===mc.name):null;if(!d)return'?';const ab=p.abilities||[10,10,10,10,10,10];const avg=Math.floor(d.hdVal/2)+1;return`${avg} + CON (${fmt(mod(ab[2]))}) = ${Math.max(1,avg+mod(ab[2]))} PV supplÃ©mentaires`})()}</strong></div>
    </div>

    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="LU.step--;renderTab()">â† Retour</button>
      <button class="btn bac" style="flex:2" onclick="applyLevelUp()">âœ“ Confirmer le niveau ${newLvl}</button>
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
    if(p.race==='Nain des collines')p.hpMax+=1; // TÃ©nacitÃ© naine
    p.hp=p.hpMax;
    // CapacitÃ©s niveau 1 multiclasse
    const newFeats=getLevel1Features(LU.mcTarget);
    newFeats.forEach(f=>{if(!p.features.find(x=>x.name===f.name))p.features.push(f);});
    // CompÃ©tence multiclasse (Barde, RÃ´deur, Roublard)
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
    if(p.race==='Nain des collines')p.hpMax+=1; // TÃ©nacitÃ© naine
    p.hp=p.hpMax;
    // CapacitÃ©s du nouveau niveau â€” exclure ASI et les pures mÃ©caniques de compteur
    const newClassLevel=entry?entry.level:1;
    const EXCLUDED_FEATS=[
      'AmÃ©lioration de caractÃ©ristiques',
      'Points de sorcellerie',
      'Inspiration bardique',
      'Points de ki','Ki',
      'Rage',
      'Forme sauvage',
      'RÃ©cupÃ©ration arcanique',
      'Magie de pacte',
      'Conduit divin',
    ];
    const newFeats=getLevelFeatures(mc.name,newClassLevel)
      .filter(f=>!EXCLUDED_FEATS.some(ex=>f.name===ex||f.name.startsWith(ex+' (')||f.name.startsWith(ex+' :')));
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

  // ArchÃ©type â†’ ajouter comme capacitÃ©
  if(LU.archetypeChoice){
    const cd=mc?CLASS_LEVEL_DATA[mc.name]:null;
    const arch=cd&&cd.archetypes?cd.archetypes.find(a=>a.name===LU.archetypeChoice):null;
    if(arch)p.features.push({name:LU.archetypeChoice,desc:arch.desc,classe:mc?mc.name:''});
  }

  // Style de combat â†’ ajouter comme capacitÃ©
  if(LU.styleChoice){
    const cd=mc?CLASS_LEVEL_DATA[mc.name]:null;
    const style=cd&&cd.combatStyles?cd.combatStyles.find(s=>s.name===LU.styleChoice):null;
    if(style)p.features.push({name:'Style : '+LU.styleChoice,desc:style.desc,classe:mc?mc.name:''});
  }

  // Expertise â†’ upgrader skillProf de 1 Ã  2
  if(LU.expertiseChoices.length){
    if(!p.skillProf)p.skillProf={};
    LU.expertiseChoices.forEach(sk=>{p.skillProf[sk]=2;});
  }

  // Nouveaux sorts (classe) + Secrets Magiques (Barde, any class)
  if(!p.spells)p.spells=[];
  [...LU.newSpells,...LU.secretsChoices].forEach(name=>{if(!p.spells.find(s=>s.name===name))p.spells.push({name});});

  // MÃ©tamagie â†’ ajouter comme capacitÃ©s
  if(LU.metamagicChoices.length){
    const cd=CLASS_LEVEL_DATA['Ensorceleur'];
    LU.metamagicChoices.forEach(name=>{
      const opt=cd&&cd.metamagicOptions?cd.metamagicOptions.find(o=>o.name===name):null;
      if(opt)p.features.push({name:'MÃ©tamagie : '+name,desc:opt.desc,classe:'Ensorceleur'});
    });
  }

  // Manifestations occultes â†’ stocker dans p.eldritchInvocations
  if(LU.invocationChoices.length){
    if(!p.eldritchInvocations)p.eldritchInvocations=[];
    LU.invocationChoices.forEach(name=>{if(!p.eldritchInvocations.includes(name))p.eldritchInvocations.push(name);});
  }

  p.pendingLevelUp=false;
  resetLU();
  saveAll();
  setTab('perso');
  showToast(`â¬† Niveau confirmÃ© ! ${(p.classes||[]).map(c=>c.name+' '+c.level).join(' / ')} â€” PV max : ${p.hpMax}`);
  (()=>{if(!document.getElementById('lu-anim-style')){const s=document.createElement('style');s.id='lu-anim-style';s.textContent='@keyframes luOverlayFade{0%{background:rgba(0,0,0,0)}15%{background:rgba(0,0,0,.35)}85%{background:rgba(0,0,0,.35)}100%{background:rgba(0,0,0,0);opacity:0}}@keyframes luTextBounce{0%{transform:scale(0);opacity:0}20%{transform:scale(1.15);opacity:1}30%{transform:scale(1)}80%{transform:scale(1);opacity:1}100%{transform:scale(1.5);opacity:0}}';document.head.appendChild(s);}const el=document.createElement('div');el.style.cssText='position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:9999;pointer-events:none;animation:luOverlayFade 2.5s ease forwards';el.innerHTML='<div style="font-size:56px;font-weight:900;color:var(--cp);text-shadow:0 0 40px rgba(200,168,75,.9);animation:luTextBounce 2.5s ease forwards;text-align:center;line-height:1.2">â¬†<br><span style="font-size:28px">NIVEAU !</span></div>';document.body.appendChild(el);setTimeout(()=>el.remove(),2500);})();
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// AUTOCOMPLETE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function searchClasse(q){const drop=document.getElementById('classeDrop');if(!drop)return;if(!q){drop.style.display='none';return;}const res=SRD.classes.filter(c=>c.name.toLowerCase().includes(q.toLowerCase())).slice(0,8);if(!res.length){drop.style.display='none';return;}drop.style.display='block';drop.innerHTML=res.map(c=>`<div class="aci" onmousedown="event.preventDefault();addClassEntry('${esc(c.name)}')"><div class="ain">${esc(c.name)}</div><div class="ais">${c.hd} â€” JS: ${c.saves.join(', ')}</div></div>`).join('');}
function addClassEntry(name){const p=P();if(!p.classes)p.classes=[];if(!p.classes.find(c=>c.name===name))p.classes.push({name,level:1});const inp=document.getElementById('classeInput');if(inp)inp.value='';const drop=document.getElementById('classeDrop');if(drop)drop.style.display='none';render();}
function searchBgPerso(q){const drop=document.getElementById('bgDropPerso');if(!drop)return;upd('background',q);if(!q){drop.style.display='none';return;}const res=BACKGROUNDS.filter(b=>b.name.toLowerCase().includes(q.toLowerCase()));if(!res.length){drop.style.display='none';return;}drop.style.display='block';drop.innerHTML=res.map(b=>`<div class="aci" onmousedown="event.preventDefault();selectBgPerso('${esc(b.name)}')"><div class="ain">${esc(b.name)}</div><div class="ais">${esc(b.skills.join(', '))} â€” ${esc(b.desc)}</div></div>`).join('');}
function selectBgPerso(name){upd('background',name);const inp=document.getElementById('bgInputPerso');if(inp)inp.value=name;const drop=document.getElementById('bgDropPerso');if(drop)drop.style.display='none';}

