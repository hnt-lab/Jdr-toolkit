function _featDesc(className,featName){return(SRD.classes.find(c=>c.name===className)?.combatFeatures||[]).find(f=>f.name===featName)?.desc||'';}
// TAB: COMBAT
// ═══════════════════════════════════════
function tabCombat(p){
  const mc=mainClass(p);const cd=mc?SRD.classes.find(c=>c.name===mc.name):null;const lvl=totalLevel(p);
  const forM=mod(p.abilities[0]),dexM=mod(p.abilities[1]),intM=mod(p.abilities[3]),sagM=mod(p.abilities[4]),chaM=mod(p.abilities[5]);
  const spellMod=cd?({CHA:chaM,SAG:sagM,INT:intM}[cd.saves&&cd.saves[1]]||intM):intM;
  const slots=calcSpellSlots(p);const slotsUsed=p.spellSlotsUsed||[];
  const warlockSlots=getWarlockSlots(p);
  const hasCaster=(p.classes||[]).some(c=>{const d=SRD.classes.find(cl=>cl.name===c.name);return d&&d.spellcaster;});
  const cc=p.combatCharges||{};
  const weapons=['mainhand','offhand','ranged'].map(slot=>{const i=(p.equip||{})[slot];return i&&i.name?{...i,slot}:null;}).filter(Boolean);

  // Style de combat
  const COMBAT_STYLES_BY_CLASS={
    'Guerrier':['Défense','Duel','Archerie','Armes à deux mains','Protection'],
    'Paladin':['Défense','Duel','Armes à deux mains','Protection'],
    'Rôdeur':['Archerie','Défense','Duel','Combat à deux armes'],
    'Artificier':['Défense','Archerie'],
  };
  const availableStyles=[...new Set((p.classes||[]).flatMap(c=>COMBAT_STYLES_BY_CLASS[c.name]||[]))];
  const combatStyle=availableStyles.includes(p.combatStyle)?p.combatStyle:'';

  // Bonus de rage Barbare selon niveau
  const barbareLvl=((p.classes||[]).find(c=>c.name==='Barbare')||{}).level||0;
  const rageBonus=barbareLvl>=16?4:barbareLvl>=9?3:2;
  const rageActive=barbareLvl>0&&cc['RageActive']===true;
  const temActive=barbareLvl>0&&cc['Témérité']===true;
  const barbarePath=(p.features||[]).find(f=>['Voie du berserker','Voie du guerrier totem','Voie de la magie sauvage'].includes(f.name));
  const isBerserker=barbarePath?.name==='Voie du berserker';
  const isTotem=barbarePath?.name==='Voie du guerrier totem';
  const isMagieSauvage=barbarePath?.name==='Voie de la magie sauvage';

  // Bonus ki Moine selon niveau
  const moineLvl=((p.classes||[]).find(c=>c.name==='Moine')||{}).level||0;
  const moinePath=(p.features||[]).find(f=>["Voie de la paume","Voie de l'ombre",'Voie des quatre éléments'].includes(f.name));
  const isPaume=moinePath?.name==='Voie de la paume';
  const isOmbre=moinePath?.name==="Voie de l'ombre";
  const isQE=moinePath?.name==='Voie des quatre éléments';
  const kiMax=moineLvl;

  // Inspiration bardique selon niveau
  const bardeLvl=((p.classes||[]).find(c=>c.name==='Barde')||{}).level||0;
  const bardDie=bardeLvl>=15?'d12':bardeLvl>=10?'d10':bardeLvl>=5?'d8':'d6';
  const bardInspiUses=Math.max(1,chaM);
  const bardePath=(p.features||[]).find(f=>['Collège du savoir','Collège de la vaillance'].includes(f.name));
  const isSavoir=bardePath?.name==='Collège du savoir';
  const isVaillance=bardePath?.name==='Collège de la vaillance';

  // Niveaux des classes à panneau dédié
  const guerrierLvl=((p.classes||[]).find(c=>c.name==='Guerrier')||{}).level||0;
  const guerPath=(p.features||[]).find(f=>['Champion','Maître de guerre','Chevalier occulte'].includes(f.name));
  const isChampion=guerPath?.name==='Champion';
  const isMdG=guerPath?.name==='Maître de guerre';
  const isCO=guerPath?.name==='Chevalier occulte';
  const clercLvl=((p.classes||[]).find(c=>c.name==='Clerc')||{}).level||0;
  const clercPath=(p.features||[]).find(f=>['Domaine de la vie','Domaine de la lumière','Domaine de la nature','Domaine de la tempête','Domaine de la tromperie','Domaine de la guerre','Domaine du savoir','Domaine de la forge'].includes(f.name));
  const druLvl=((p.classes||[]).find(c=>c.name==='Druide')||{}).level||0;
  const druPath=(p.features||[]).find(f=>['Cercle de la lune','Cercle des terres'].includes(f.name));
  const isLune=druPath?.name==='Cercle de la lune';
  const isTerres=druPath?.name==='Cercle des terres';
  const paladinLvl=((p.classes||[]).find(c=>c.name==='Paladin')||{}).level||0;
  const paladinPath=(p.features||[]).find(f=>['Serment de dévotion','Serment des anciens','Serment de vengeance'].includes(f.name));
  const isDevot=paladinPath?.name==='Serment de dévotion';
  const isAnciens=paladinPath?.name==='Serment des anciens';
  const isVengeance=paladinPath?.name==='Serment de vengeance';
  const rodeurLvl=((p.classes||[]).find(c=>c.name==='Rôdeur')||{}).level||0;
  const rodeurPath=(p.features||[]).find(f=>['Chasseur','Maître des bêtes'].includes(f.name));
  const isChasseur=rodeurPath?.name==='Chasseur';
  const isMdB=rodeurPath?.name==='Maître des bêtes';
  const magLvl=((p.classes||[]).find(c=>c.name==='Magicien')||{}).level||0;
  const magPath=(p.features||[]).find(f=>["École d'abjuration","École de divination","École d'enchantement","École d'évocation","École d'illusion","École d'invocation","École de nécromancie","École de transmutation"].includes(f.name));
  const roublardLvl=((p.classes||[]).find(c=>c.name==='Roublard')||{}).level||0;
  const roublardPath=(p.features||[]).find(f=>['Voleur','Escroc arcanique','Assassin','Conspirateur'].includes(f.name));
  const isAssassin=roublardPath?.name==='Assassin';
  const isVoleur=roublardPath?.name==='Voleur';
  const isEscrocArc=roublardPath?.name==='Escroc arcanique';
  const isCons=roublardPath?.name==='Conspirateur';
  const artLvl=((p.classes||[]).find(c=>c.name==='Artificier')||{}).level||0;
  const artPath=(p.features||[]).find(f=>['Alchimiste','Artilleur','Forgeron de bataille','Maître armurier'].includes(f.name));
  const isAlchi=artPath?.name==='Alchimiste';
  const isArtil=artPath?.name==='Artilleur';
  const isFdB=artPath?.name==='Forgeron de bataille';
  const artsMartiauxDie=moineLvl>=17?'d10':moineLvl>=11?'d8':moineLvl>=5?'d6':'d4';
  const snkDice=Math.ceil(roublardLvl/2);
  const hasExtraAttack=(p.classes||[]).some(c=>['Guerrier','Barbare','Paladin','Rôdeur','Moine'].includes(c.name)&&(c.level||0)>=5);
  const attackCount=guerrierLvl>=20?4:guerrierLvl>=11?3:hasExtraAttack?2:1;
  const wsC=p.wildshape;

  // Collecte les capacités de combat — exclut par classe celles gérées par un panneau dédié
  const _DEDICATED_PANEL_FEATS_BY_CLASS={
    'Barbare':['Rage','Défense sans armure'],
    'Barde':['Inspiration bardique','Contre-charme','Inspiration supérieure'],
    'Moine':['Points de ki'],
    'Ensorceleur':['Points de sorcellerie'],
    'Guerrier':['Second souffle',"Sursaut d'action",'Indomptable'],
    'Druide':['Forme sauvage'],
    'Clerc':['Conduit divin','Intervention divine'],
    'Paladin':['Conduit divin','Imposition des mains','Aura de protection','Aura de courage','Forme sacrée'],
    'Roublard':['Roublardise'],
    'Rôdeur':['Vigilance primitive','Foulée tellurique','Camouflage naturel','Disparition','Sens sauvages','Tueur implacable'],
    'Magicien':['Restauration arcanique','Maîtrise des sorts','Sorts de prédilection'],
  };
  const allCombatFeats=[];
  (p.classes||[]).forEach(cls=>{
    const d=SRD.classes.find(c=>c.name===cls.name);
    const excluded=_DEDICATED_PANEL_FEATS_BY_CLASS[cls.name]||[];
    if(d&&d.combatFeatures)d.combatFeatures.forEach(f=>{
      if(excluded.includes(f.name))return;
      if(f.minLevel&&(cls.level||0)<f.minLevel)return;
      allCombatFeats.push({...f,className:cls.name});
    });
  });
  (p.customCombatFeats||[]).forEach(f=>allCombatFeats.push({...f,className:'Personnalisé'}));

  return`<div id="combatContainer">
  ${cs('cs-armes',wsC?.active?`<div class="panel mb10" style="border-color:rgba(76,175,80,.4)"><div class="pt" style="display:flex;align-items:center;justify-content:space-between"><div style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span><span style="color:#4caf50">${wsC.beast.icon} ${esc(wsC.beast.name)} — Attaques</span></div><span style="font-size:10px;color:#4caf50;border:1px solid rgba(76,175,80,.4);border-radius:10px;padding:2px 8px">🐺 Forme sauvage</span></div>
      ${wsC.beast.attacks.map(a=>`<div style="background:rgba(76,175,80,.06);border:1px solid rgba(76,175,80,.25);border-radius:6px;padding:10px;margin-bottom:6px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:14px;font-weight:600;color:#4caf50">${esc(a.name)}</span>
          <span style="color:#4caf50;font-weight:600">+${a.bonus} / ${esc(a.dmg)} ${esc(a.type||'')}</span>
        </div>
        ${a.special?`<div style="font-size:11px;color:var(--text3);margin-top:3px">${esc(a.special)}</div>`:''}
        <div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:6px"><button class="btn bsm" style="border-color:rgba(76,175,80,.4);color:#4caf50" onclick="rollCustomDmg('${esc(a.dmg)}','${esc(a.name)}')">🎲 ${esc(a.dmg)}</button></div>
      </div>`).join('')}
      <div style="margin-top:10px;display:flex;gap:5px;flex-wrap:wrap">${['d4','d6','d8','d10','d12','d20'].map(d=>`<button class="dice-btn" onclick="rollDie('${d}')">🎲 ${d}</button>`).join('')}</div>
      <div id="rollResult" style="margin-top:8px;padding:8px;background:var(--surface2);border-radius:6px;display:${_lastRollResultHtml?'block':'none'};font-size:14px;font-weight:600;color:var(--cp);text-align:center">${_lastRollResultHtml}</div>
    </div>`:`<div class="panel mb10"><div class="pt" style="display:flex;align-items:center;justify-content:space-between"><div style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span>Armes équipées</div>${attackCount>1?`<span style="font-size:10px;font-weight:600;color:var(--cp);border:1px solid rgba(200,168,75,.4);border-radius:10px;padding:2px 8px">⚔ ×${attackCount} attaques</span>`:''}</div>
      ${availableStyles.length?`<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="font-size:11px;color:var(--text3)">🗡 Style :</span><select style="font-size:12px;background:var(--surface3,var(--surface2));border:1px solid var(--border);border-radius:6px;padding:3px 6px;color:var(--text)" onchange="P().combatStyle=this.value;P().ac=_calcArmorCA(P());_markUnsaved();render()"><option value="">— Aucun</option>${availableStyles.map(s=>`<option value="${s}"${combatStyle===s?' selected':''}>${s}</option>`).join('')}</select></div>`:''}
      ${weapons.length?weapons.map(w=>{
        const srdW=SRD.weapons.find(sw=>sw.name===w.name);
        const props=(srdW?.properties||'').toLowerCase();
        const isFinesse=props.includes('finesse');
        const isPolyvalente=props.includes('polyvalente');
        const isLegere=props.includes('légère');
        const isRanged=w.slot==='ranged';
        const isOffhand=w.slot==='offhand';
        const prefs=(p.weaponPrefs||{})[w.slot]||{};
        const atkStat=isFinesse?(prefs.stat||(forM>=dexM?'STR':'DEX')):(isRanged?'DEX':'STR');
        const atkM=atkStat==='DEX'?dexM:forM;
        const versMatch=isPolyvalente?(srdW?.properties||'').match(/Polyvalente \((\w+)\)/i):null;
        const versDie=versMatch?versMatch[1]:null;
        const twoHanded=isPolyvalente&&(prefs.twoHanded===true);
        let dmgStr=srdW?srdW.damage:'1d6';
        if(twoHanded&&versDie)dmgStr=dmgStr.replace(/^\d+d\d+/,versDie);
        const archerieBonus=combatStyle==='Archerie'&&isRanged?2:0;
        const atkBonus=pb(lvl)+atkM+archerieBonus;
        const hasOffhandWeapon=weapons.some(w2=>w2.slot==='offhand');
        const isDueling=combatStyle==='Duel'&&!isRanged&&w.slot==='mainhand'&&!hasOffhandWeapon;
        const isTwoHandedStyle=combatStyle==='Armes à deux mains'&&props.includes('deux mains');
        const mainhandWpn=(p.equip||{}).mainhand;
        const mainhandSrd=mainhandWpn?SRD.weapons.find(sw=>sw.name===mainhandWpn.name):null;
        const mainhandIsLegere=mainhandSrd?(mainhandSrd.properties||'').toLowerCase().includes('légère'):false;
        const offhandLegereOk=!isOffhand||(isLegere&&mainhandIsLegere);
        const rageMeleeBonus=rageActive&&!isRanged?rageBonus:0;
        const dmgBonus=(isOffhand?(combatStyle==='Combat à deux armes'?atkM:0):isDueling?2:0)+rageMeleeBonus;
        const isMagic=w.magic;
        const slotLabel=isRanged?'Distance':w.slot==='mainhand'?'Main droite':'Main gauche';
        const ammoItem=isRanged&&w.ammoLink?(p.inventory||[]).find(i=>i.name===w.ammoLink):null;
        const ammoCount=ammoItem?ammoItem.qty:null;
        let styleBadge='';
        if(rageActive&&!isRanged)styleBadge+=`<span style="font-size:10px;color:#e53935;margin-left:4px">🔥 +${rageBonus} rage</span>`;
        if(isDueling)styleBadge+=`<span style="font-size:10px;color:#4caf50;margin-left:4px">+2 dégâts (Duel)</span>`;
        else if(archerieBonus)styleBadge+=`<span style="font-size:10px;color:#4caf50;margin-left:4px">+2 att. (Archerie)</span>`;
        else if(isTwoHandedStyle)styleBadge+=`<span style="font-size:10px;color:#4caf50;margin-left:4px">Relance 1-2 (2 mains)</span>`;
        else if(isOffhand&&combatStyle==='Combat à deux armes'&&atkM!==0)styleBadge+=`<span style="font-size:10px;color:#4caf50;margin-left:4px">${atkM>0?'+':''}${atkM} dégâts (2 armes)</span>`;
        else if(isOffhand&&!offhandLegereOk)styleBadge+=`<span style="font-size:10px;color:#e53935;margin-left:4px">⚠ Légère requis</span>`;
        return`<div style="background:var(--surface2);border:1px solid ${isMagic?'#9b59b6':'var(--border)'};border-radius:6px;padding:10px;margin-bottom:6px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:14px;font-weight:600">${esc(w.name)}${isMagic?` <span class="magic-badge">✨ Magique${w.linkedTo?' • Lié: '+esc(w.linkedTo):''}</span>`:''}</span>
            <span style="color:var(--cp);font-weight:600">+${atkBonus} / ${esc(dmgStr)}${dmgBonus>0?' +'+dmgBonus:dmgBonus<0?' '+dmgBonus:''}</span>
          </div>
          <div style="font-size:11px;color:var(--text3);margin-top:3px">${slotLabel}${isOffhand?' • Action bonus':''}${isRanged&&ammoCount!==null?` • 🏹 <span style="color:${ammoCount<=5?'#e53935':'var(--cp)'}">${ammoCount}</span> ${esc(w.ammoLink||'munitions')}`:''}${styleBadge}</div>
          ${isFinesse?`<div style="display:flex;gap:4px;margin-top:4px;align-items:center"><span style="font-size:10px;color:var(--text3)">Finesse :</span><button class="btn bsm${atkStat==='STR'?' bac':''}" style="font-size:10px;padding:2px 6px" onclick="setWeaponPref('${w.slot}','stat','STR')">FOR ${fmt(forM)}</button><button class="btn bsm${atkStat==='DEX'?' bac':''}" style="font-size:10px;padding:2px 6px" onclick="setWeaponPref('${w.slot}','stat','DEX')">DEX ${fmt(dexM)}</button></div>`:''}
          ${isPolyvalente&&versDie?`<div style="display:flex;gap:4px;margin-top:4px;align-items:center"><span style="font-size:10px;color:var(--text3)">Prise :</span><button class="btn bsm${!twoHanded?' bac':''}" style="font-size:10px;padding:2px 6px" onclick="setWeaponPref('${w.slot}','twoHanded',false)">1 main (${esc(srdW.damage.split(' ')[0])})</button><button class="btn bsm${twoHanded?' bac':''}" style="font-size:10px;padding:2px 6px" onclick="setWeaponPref('${w.slot}','twoHanded',true)">2 mains (${esc(versDie)})</button></div>`:''}
          ${isRanged?`<div style="font-size:11px;color:var(--text3);margin-top:4px">
            ${w.ammoLink?`<button class="btn bsm" style="font-size:10px" onclick="unlinkRangedAmmo()">↩ Délier ${esc(w.ammoLink)}</button>`:
            `<button class="btn bsm" style="font-size:10px" onclick="openLinkAmmoModal()">🏹 Lier des munitions</button>`}
          </div>`:''}
          <div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:6px">${isOffhand?`<button class="btn bsm${temActive?' bac':''}" onclick="rollAttack('${esc(w.name)}',${atkBonus},'${esc(dmgStr)}','${w.slot}',${dmgBonus},false,${temActive&&!isRanged?1:0})">🎲${temActive?' ⚡':''} Att. bonus</button>`:Array.from({length:attackCount},(_,ai)=>`<button class="btn bsm${temActive&&!isRanged?' bac':''}" onclick="rollAttack('${esc(w.name)}',${atkBonus},'${esc(dmgStr)}','${w.slot}',${dmgBonus},${isTwoHandedStyle},${temActive&&!isRanged?1:0})">🎲${temActive&&!isRanged?' ⚡':''}${attackCount>1?' Att.'+(ai+1):'  Attaque'}</button>`).join('')}</div>
        </div>`;
      }).join(''):`<div style="font-size:12px;color:var(--text3);font-style:italic">Aucune arme équipée.</div>`}
      <div style="margin-top:10px;display:flex;gap:5px;flex-wrap:wrap">${['d4','d6','d8','d10','d12','d20'].map(d=>`<button class="dice-btn" onclick="rollDie('${d}')">🎲 ${d}</button>`).join('')}</div>
      <div id="rollResult" style="margin-top:8px;padding:8px;background:var(--surface2);border-radius:6px;display:${_lastRollResultHtml?'block':'none'};font-size:14px;font-weight:600;color:var(--cp);text-align:center">${_lastRollResultHtml}</div>
    </div>`)}
  ${cs('cs-sauvegardes',`<div class="panel"><div class="pt" style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span>Sauvegardes</div>
      ${ABILITIES_SH.map((ab,i)=>{const saves=CLASS_SAVES[mc?mc.name:'']||[];const hasSave=saves.includes(i);const m=mod(p.abilities[i])+(hasSave?pb(lvl):0);const forRageAdv=i===0&&rageActive;return forRageAdv?`<div style="display:flex;align-items:center;gap:3px"><div class="save-btn" style="flex:1" onclick="rollSave('${ab}',${m})"><span class="save-dot${hasSave?' p':''}"></span><span style="flex:1;font-size:13px">${ab}</span><span style="color:var(--cp);font-weight:600">${fmt(m)}</span><span style="font-size:10px;color:var(--text3)">🎲</span></div><button class="btn bsm" style="padding:2px 6px;color:#e53935;border-color:#e53935;font-size:10px;flex-shrink:0" onclick="rollSave('${ab}',${m},1)" title="Avantage (rage)">🔥⚡</button></div>`:`<div class="save-btn" onclick="rollSave('${ab}',${m})"><span class="save-dot${hasSave?' p':''}"></span><span style="flex:1;font-size:13px">${ab}</span><span style="color:var(--cp);font-weight:600">${fmt(m)}</span><span style="font-size:10px;color:var(--text3)">🎲</span></div>`;}).join('')}
    </div>`)}
  ${!wsC?.active&&(allCombatFeats.length||isMJ())?cs('cs-capacites',`<div class="panel mb10"><div class="pt" style="display:flex;align-items:center;justify-content:space-between"><div style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span><span>Capacités de combat</span></div>${isMJ()?`<button class="btn bsm" onclick="openFeatSearch()">+ Ajouter</button>`:''}</div>
      ${allCombatFeats.map(f=>{
        const fid='cf_'+f.name.replace(/\s+/g,'_');
        const maxCharges=getChargesMax(f,p);
        const usedCharges=(p.combatCharges||{})[f.name]!==undefined?(p.combatCharges||{})[f.name]:maxCharges;
        const isPassive=f.recovery==='passive'||f.charges===0;
        return`<div class="feat-card">
          <div class="feat-head" onclick="document.getElementById('${fid}').classList.toggle('open')">
            <span style="font-size:16px;margin-right:8px">${f.icon||'⚡'}</span>
            <div style="flex:1">
              <div style="font-size:13px;font-weight:600;color:var(--cp)">${esc(f.name)}</div>
              <div style="font-size:10px;color:var(--text3)">${esc(f.className)} • ${isPassive?'Passif':f.recovery==='short'?'Repos court':'Repos long'}</div>
            </div>
            ${!isPassive&&maxCharges>0?`<div style="display:flex;gap:3px;align-items:center;margin-right:8px">${Array.from({length:maxCharges},(_,i)=>`<span class="slot-bubble${i<usedCharges?'':' used'}" onclick="event.stopPropagation();useCombatCharge('${esc(f.name)}',${maxCharges})"></span>`).join('')}</div>`:''}
            <span style="color:var(--text3);font-size:11px">▾</span>
          </div>
          <div class="feat-body" id="${fid}">
            <p>${esc(f.desc)}</p>
            ${f.dice?`<button class="btn bsm" style="margin-top:6px" onclick="rollCustomDmg('${esc(f.dice)}','${esc(f.name)}')">🎲 ${esc(f.dice)}</button>`:''}
            ${!isPassive&&maxCharges>0?`<button class="btn bsm" style="margin-top:6px" onclick="recoverCombatCharge('${esc(f.name)}',${maxCharges})">↺ Récupérer</button>`:''}
          </div>
        </div>`;
      }).join('')}
      ${!allCombatFeats.length&&isMJ()?`<div style="font-size:12px;color:var(--text3);font-style:italic">Aucune capacité de classe. Le MJ peut en ajouter via le bouton ci-dessus.</div>`:''}
    </div>`):''}
  ${renderBarbare(p)}
  ${renderMoine(p)}
  ${renderBarde(p)}
  ${renderRoublard(p)}
  ${renderGuerrier(p)}
  ${renderPaladin(p)}
  ${renderClerc(p)}
  ${renderArtificier(p)}
  ${renderDruide(p)}
  ${renderEnsorceleur(p)}
  ${(()=>{if(p.race!=='Dragonide'||!p.draconicAncestry)return'';const anc=SRD.draconicAncestries.find(a=>a.name===p.draconicAncestry);if(!anc)return'';const conM=p.abilities?Math.floor((p.abilities[2]-10)/2):0;const dc=8+pb(lvl)+conM;const diceCnt=lvl>=16?5:lvl>=11?4:lvl>=6?3:2;const dmg=`${diceCnt}d6 ${anc.damage}`;const used=(p.combatCharges||{})['SouffleDraconique']===true;return cs('cs-dragon',`<div class="panel mb10">
        <div class="pt" style="display:flex;align-items:center;justify-content:space-between"><div style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span><span>${anc.icon} Souffle draconique — ${esc(anc.name)}</span></div>
          <span style="font-size:10px;color:var(--cp);border:1px solid var(--cp);border-radius:10px;padding:2px 8px">1×/Repos</span>
        </div>
        <div style="font-size:12px;color:var(--text2);margin-bottom:8px">
          ${esc(anc.shape)} • <strong style="color:var(--cp)">${esc(dmg)}</strong> • JS CON DD ${dc} (½ si réussi)<br>
          <span style="font-size:11px;color:var(--text3)">Résistance au type ${esc(anc.damage)}</span>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <span class="slot-bubble${used?' used':''}" style="width:18px;height:18px" onclick="toggleDraconicBreath()"></span>
          <span style="font-size:12px;color:${used?'var(--text3)':'var(--cp)'}">${used?'Utilisé — Recharge au repos':'Disponible'}</span>
          <button class="btn bsm" onclick="rollCustomDmg('${diceCnt}d6','Souffle ${esc(anc.name)}')">🎲 ${esc(dmg)}</button>
        </div>
        ${used?`<button class="btn bsm" style="margin-top:8px" onclick="P().combatCharges=P().combatCharges||{};delete P().combatCharges['SouffleDraconique'];saveAll();render();">↺ Récupérer (Repos court/long)</button>`:''}
      </div>`);})()}
  ${wsC?.active?cs('cs-ws-info',`<div class="panel mb10" style="border-color:rgba(76,175,80,.3);background:rgba(76,175,80,.04)"><div style="font-size:12px;color:var(--text3);text-align:center;padding:8px">🐺 En forme animale — sorts et capacités de classe indisponibles${druLvl>=18?'<br><span style="color:#4caf50;font-size:11px">Niv. 18 — Sorts de bête : tu peux lancer des sorts ✓</span>':''}</div></div>`):''}
  ${renderOccultiste(p)}
  ${renderMagicien(p)}
  ${renderRodeur(p)}
  ${renderFamilier(p)}
  ${renderCompagnonAnimal(p)}
  ${(!wsC?.active||druLvl>=18)&&hasCaster?cs('cs-sorts',`<div class="panel"><div class="pt" style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span>Sorts</div>
      <div class="g3 mb10">
        <div class="sb hi"><div class="sn">Bonus sort</div><div style="font-size:18px;font-weight:600;color:var(--cp)">${fmt(pb(lvl)+spellMod)}</div></div>
        <div class="sb hi"><div class="sn">DD sort</div><div style="font-size:18px;font-weight:600;color:var(--cp)">${8+pb(lvl)+spellMod}</div></div>
        <div class="sb"><div class="sn">Mod.</div><div style="font-size:14px;font-weight:600">${fmt(spellMod)}</div></div>
      </div>
      ${slots?`<div style="margin-bottom:10px"><div class="fl mb6">Emplacements</div>${slots.map((total,ni)=>total?`<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><span style="font-size:11px;color:var(--text2);width:50px">Niv. ${ni+1}</span><div>${Array.from({length:total},(_,si)=>`<span class="slot-bubble${si<(slotsUsed[ni]||0)?' used':''}" onclick="toggleSlot(${ni},${si},${total})"></span>`).join('')}</div><span style="font-size:10px;color:var(--text3)">${total-(slotsUsed[ni]||0)}/${total}</span></div>`:'').join('')}<button class="btn bsm" style="margin-top:4px" onclick="upd('spellSlotsUsed',[]);render()">Récupérer tous</button></div>`:''}
      ${(()=>{const magLvl=((p.classes||[]).find(c=>c.name==='Magicien')||{}).level||0;if(!magLvl)return'';const prepMax=Math.max(1,intM+magLvl);const known=(p.spells||[]).filter(s=>{const sp=findSpellData(s.name);return sp&&sp.level>0;}).length;return`<div style="margin-top:8px;padding:8px;background:var(--surface2);border-radius:6px;font-size:12px;color:var(--text2)">📚 Sorts préparés : <strong style="color:${known>prepMax?'#e53935':'var(--cp)'}">${known}/${prepMax}</strong> (INT ${fmt(intM)} + niv. ${magLvl})</div>`;})()}
      ${renderSpellList(p, true)}
    </div>`):''}
  </div>`;
}

function rollCustomDmg(dice,name){
  const m=dice.match(/(\d+)d(\d+)([+-]\d+)?/);
  if(!m){showToast(`🎲 ${name} : dés non reconnus`);return;}
  let total=0;const rolls=[];
  for(let i=0;i<parseInt(m[1]);i++){const r=Math.ceil(Math.random()*parseInt(m[2]));rolls.push(r);total+=r;}
  if(m[3])total+=parseInt(m[3]);
  showToast(`<strong>${name}</strong> : [${rolls.join('+')}]${m[3]||''} = <strong style="font-size:16px;color:var(--cp)">${total}</strong>`);
  if(diceOpen)renderDicePanel();
}

function useCombatCharge(name,max){const p=P();if(!p.combatCharges)p.combatCharges={};const cur=p.combatCharges[name]!==undefined?p.combatCharges[name]:max;if(cur<=0){showToast('❌ Plus de charges disponibles !');return;}p.combatCharges[name]=cur-1;_markUnsaved();render();}
function recoverCombatCharge(name,max){const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges[name]=max;_markUnsaved();render();}
function setWeaponPref(slot,key,value){const p=P();if(!p.weaponPrefs)p.weaponPrefs={};if(!p.weaponPrefs[slot])p.weaponPrefs[slot]={};p.weaponPrefs[slot][key]=value;_markUnsaved();render();}
function toggleDraconicBreath(){const p=P();if(!p.combatCharges)p.combatCharges={};if(p.combatCharges['SouffleDraconique'])delete p.combatCharges['SouffleDraconique'];else p.combatCharges['SouffleDraconique']=true;saveAll();render();}
function toggleSlot(ni,si,total){const p=P();if(!p.spellSlotsUsed)p.spellSlotsUsed=[];const u=p.spellSlotsUsed[ni]||0;p.spellSlotsUsed[ni]=u>si?u-1:Math.min(total,u+1);render();}
// advantageMode: 0=normal, 1=avantage (2d20 highest), -1=désavantage (2d20 lowest)
function rollAttack(name,bonus,dmg,slot,dmgBonus=0,rerollLow=false,advantageMode=0){
  let atk,atkAlt=null;
  if(advantageMode!==0){
    const r1=Math.ceil(Math.random()*20),r2=Math.ceil(Math.random()*20);
    atk=advantageMode>0?Math.max(r1,r2):Math.min(r1,r2);
    atkAlt=advantageMode>0?Math.min(r1,r2):Math.max(r1,r2);
  }else{atk=Math.ceil(Math.random()*20);}
  const total=atk+bonus;
  const isCrit=atk===20;const isFumble=atk===1;
  const col=isCrit?'#ffd54f':isFumble?'#e53935':'var(--cp)';
  const advTag=atkAlt!==null?(advantageMode>0?`<span style="font-size:10px;color:#4caf50;margin-left:3px">AVT(${atk},~~${atkAlt}~~)</span>`:`<span style="font-size:10px;color:#e53935;margin-left:3px">DES(~~${atk}~~,${atkAlt})</span>`):'';
  let dmgHtml='';
  if(!isFumble){
    const m=(dmg+'').match(/(\d+)d(\d+)([+-]\d+)?/);
    if(m){
      const dq=parseInt(m[1]),ds=parseInt(m[2]),fixedBonus=(m[3]?parseInt(m[3]):0)+(dmgBonus||0);
      const numDice=isCrit?dq*2:dq;
      const rolls=[];for(let i=0;i<numDice;i++){let r=Math.ceil(Math.random()*ds);if(rerollLow&&(r===1||r===2))r=Math.ceil(Math.random()*ds);rolls.push(r);}
      const totalDmg=rolls.reduce((s,v)=>s+v,0)+fixedBonus;
      const typeMatch=(dmg+'').match(/\d+d\d+[+-]?\d*\s+(.*)/);
      const dmgType=typeMatch?typeMatch[1].trim():'';
      dmgHtml=`<div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.1);font-size:13px">Dégâts : <span style="color:var(--text2)">${rolls.join('+')}${fixedBonus?fmt(fixedBonus):''}</span> = <b style="color:var(--cp);font-size:17px">${totalDmg}</b>${dmgType?` <span style="font-size:11px;color:var(--text3)">${esc(dmgType)}${isCrit?' (critique — dés doublés)':''}</span>`:''}</div>`;
    }
  }
  _lastRollResultHtml=`<div>⚔ ${esc(name)} — d20(${atk})${advTag}${fmt(bonus)} = <span style="font-size:20px;color:${col};font-weight:800">${total}</span>${isCrit?' 🎉 CRITIQUE!':isFumble?' 💀 FUMBLE!':''}</div>${dmgHtml}`;
  const el=document.getElementById('rollResult');
  if(el){el.style.display='block';el.innerHTML=_lastRollResultHtml;}
  if(slot==='ranged'){const p=P();const eq=(p.equip||{})[slot];if(eq&&eq.ammoLink){const ai=(p.inventory||[]).findIndex(i=>i.name===eq.ammoLink);if(ai>=0){p.inventory[ai].qty=Math.max(0,p.inventory[ai].qty-1);if(p.inventory[ai].qty===0)showToast('⚠️ Plus de '+eq.ammoLink+' !');saveAll();}}}
  diceHistory.push({die:'d20',label:name,roll:atk,bonus,result:total});
  if(diceHistory.length>10)diceHistory.shift();
  if(diceOpen)renderDicePanel();
}
function rollDie(d){const n=parseInt(d.replace('d',''));const r=Math.ceil(Math.random()*n);_lastRollResultHtml=`${d}: <strong>${r}</strong>`;const el=document.getElementById('rollResult');if(el){el.style.display='block';el.innerHTML=_lastRollResultHtml;}}
function openLinkAmmoModal(){
  const p=P();const inv=(p.inventory||[]).filter(i=>i.name&&i.qty>0);
  openModal(`<div class="pt">🏹 Lier des munitions à l'arme à distance</div>
    <div style="font-size:12px;color:var(--text3);margin-bottom:10px">Sélectionnez l'objet de munitions dans votre sac :</div>
    ${inv.length?inv.map(item=>`<div class="aci" onclick="linkRangedAmmo('${esc(item.name)}')">
      <div class="ain">${esc(item.name)}</div>
      <div class="ais">Quantité : ${item.qty}</div>
    </div>`).join(''):`<div style="font-size:12px;color:var(--text3);padding:8px">Sac vide.</div>`}
    <button class="btn bsm bdanger" style="margin-top:8px;width:100%" onclick="closeModal()">Annuler</button>`);
}
function linkRangedAmmo(itemName){
  const p=P();if(!p.equip)p.equip={};if(!p.equip.ranged)return;
  p.equip.ranged.ammoLink=itemName;closeModal();render();
  showToast(`✓ Munitions liées : ${itemName}`);
}
function unlinkRangedAmmo(){
  const p=P();if(p.equip&&p.equip.ranged)delete p.equip.ranged.ammoLink;render();
}
function rollSave(ab,m,advantageMode=0){
  let r,alt=null;
  if(advantageMode!==0){const r1=Math.ceil(Math.random()*20),r2=Math.ceil(Math.random()*20);r=advantageMode>0?Math.max(r1,r2):Math.min(r1,r2);alt=advantageMode>0?Math.min(r1,r2):Math.max(r1,r2);}
  else{r=Math.ceil(Math.random()*20);}
  const total=r+m;
  const altTag=alt!==null?(advantageMode>0?` <span style="color:#4caf50;font-size:10px">AVT(${r},~~${alt}~~)</span>`:`<span style="color:#e53935;font-size:10px">DES(${r},~~${alt}~~)</span>`):'';
  showToast(`JS ${ab}: d20(${r})${altTag}${fmt(m)} = <strong>${total}</strong>${r===20?' 🎉':r===1?' 💀':''}`);
}

function rollSpellPlayer(name,dmgStr,saveStat){
  const p=P();
  const mc=mainClass(p);const cd=mc?SRD.classes.find(c=>c.name===mc.name):null;
  const lvl=totalLevel(p);
  const sagM=mod(p.abilities[4]||10),intM=mod(p.abilities[3]||10),chaM=mod(p.abilities[5]||10);
  const spellMod=cd?({CHA:chaM,SAG:sagM,INT:intM}[cd.saves&&cd.saves[1]]||intM):intM;
  const spellDC=8+pb(lvl)+spellMod;

  let dmgHtml='';
  const m=(dmgStr+'').match(/(\d+)d(\d+)/);
  if(m){
    const dq=parseInt(m[1]),ds=parseInt(m[2]);
    let extra=0;
    const statMatch=(dmgStr+'').match(/[+]([A-Z]{3})/);
    if(statMatch){const st=statMatch[1];if(st==='SAG')extra=sagM;else if(st==='INT')extra=intM;else if(st==='CHA')extra=chaM;}
    else{const numMatch=(dmgStr+'').match(/d\d+([+-]\d+)/);if(numMatch)extra=parseInt(numMatch[1]);}
    const rolls=[];for(let i=0;i<dq;i++)rolls.push(Math.ceil(Math.random()*ds));
    const totalDmg=rolls.reduce((s,v)=>s+v,0)+extra;
    const typeMatch=(dmgStr+'').match(/d\d+[^a-zA-ZÀ-ÿ]*\s+([a-zA-ZÀ-ÿ]+)/i);
    const dmgType=typeMatch?typeMatch[1]:'';
    dmgHtml=`Dégâts : <span style="color:var(--text2)">${rolls.join('+')}${extra?fmt(extra):''}</span> = <b style="color:var(--cp);font-size:16px">${totalDmg}</b>${dmgType?` <span style="font-size:11px;color:var(--text3)">${esc(dmgType)}</span>`:''}`;
  } else if(dmgStr){
    dmgHtml=`<span style="color:var(--text3)">${esc(dmgStr)}</span>`;
  }
  const saveHtml=saveStat?`JS <b>${esc(saveStat)}</b> DD <span style="font-size:18px;font-weight:800;color:var(--cp)">${spellDC}</span><br>`:'';
  showToast(`✦ <strong>${esc(name)}</strong><br>${saveHtml}${dmgHtml||'Effet sans jet de dégâts'}`);
}

function rollDice(name,dmgStr){rollSpellPlayer(name,dmgStr,'');}
function findSpellData(name){
  // Cherche dans SPELLS_DB d'abord, puis SRD.spells
  if(SPELLS_DB){
    const found = SPELLS_DB.find(s=>s.name===name||s.nameEN===name);
    if(found) return found;
  }
  const srd = SRD.spells.find(s=>s.name===name);
  if(srd) return srd;
  return null;
}

// Classes qui préparent leurs sorts (les autres les "connaissent" → toujours prêts)
const PREP_CASTERS=['Magicien','Clerc','Druide','Paladin','Artificier'];

function isPrepCaster(p){
  return (p.classes||[]).some(c=>PREP_CASTERS.includes(c.name));
}

// combatOnly=true → n'affiche que cantrips + sorts préparés (pour l'onglet Combat)
function renderSpellList(p, combatOnly){
  const spells = p.spells||[];
  const druCircleSpells=combatOnly?getDruidCircleSpells(p):[];
  const druCircleNames=new Set(druCircleSpells.map(s=>s.name));
  if(!spells.length&&!druCircleSpells.length)return`<div style="font-size:12px;color:var(--text3);font-style:italic;padding:8px">Aucun sort enregistré.</div>`;
  const wsActive=p.wildshape?.active&&!p.wildshape?.isElemental;
  const druEntry=(p.classes||[]).find(c=>c.name==='Druide');
  const druLvl=druEntry?druEntry.level:0;
  if(wsActive&&druLvl<18)return`<div style="padding:12px;background:rgba(76,175,80,.08);border:1px solid rgba(76,175,80,.3);border-radius:8px;font-size:13px;color:var(--text3);text-align:center">🐺 En forme animale — l'incantation est impossible avant le niveau 18 (Sorts de bête).</div>`;
  const wsMaterialRestrict=wsActive&&druLvl>=18;
  const materialNote=wsMaterialRestrict?`<div style="padding:8px 10px;background:rgba(76,175,80,.08);border:1px solid rgba(76,175,80,.3);border-radius:8px;font-size:12px;color:var(--text2);margin-bottom:8px">🐺 <strong>Sorts de bête (niv.18)</strong> — Seuls les sorts sans composante matérielle (V/S uniquement) sont lancables en forme animale. Les sorts avec <strong style="color:#e57373">M</strong> sont grisés.</div>`:'';
  const prepCaster = isPrepCaster(p);
  const _mc=mainClass(p);const _cd=_mc?SRD.classes.find(c=>c.name===_mc.name):null;
  const _lvl=totalLevel(p);
  const _sagM=mod(p.abilities[4]||10),_intM=mod(p.abilities[3]||10),_chaM=mod(p.abilities[5]||10);
  const _spellMod=_cd?({CHA:_chaM,SAG:_sagM,INT:_intM}[_cd.saves&&_cd.saves[1]]||_intM):_intM;
  const spellDC=8+pb(_lvl)+_spellMod;
  const byLvl={};
  spells.forEach(s=>{
    const data=findSpellData(s.name);
    const lv=data?data.level:(s.level||0);
    // En mode combat, on filtre : cantrips toujours visibles, niveaux 1+ seulement si préparé (ou classe "connaît") — les sorts de cercle sont toujours affichés
    if(combatOnly && lv>0 && prepCaster && !s.prepared && !druCircleNames.has(s.name)) return;
    if(!byLvl[lv])byLvl[lv]=[];
    byLvl[lv].push({...s,data,stableId:'spl_'+s.name.replace(/[^a-zA-Z0-9]/g,'_')});
  });
  // Ajouter les sorts de cercle (combat uniquement, s'ils ne sont pas déjà dans p.spells)
  druCircleSpells.forEach(cs=>{
    const data=findSpellData(cs.name);
    const lv=data?data.level:cs.level;
    if(!byLvl[lv])byLvl[lv]=[];
    if(!byLvl[lv].find(x=>x.name===cs.name)){
      byLvl[lv].push({name:cs.name,prepared:true,level:lv,data,stableId:'spl_circ_'+cs.name.replace(/[^a-zA-Z0-9]/g,'_'),isCircle:true});
    }
  });
  if(!Object.keys(byLvl).length)return materialNote+`<div style="font-size:12px;color:var(--text3);font-style:italic;padding:8px">Aucun sort préparé.</div>`;
  const STAR_COLORS=['#ffd700','#4fc3f7','#81c784','#ff8a65','#ba68c8','#f06292','#4db6ac','#ff7043','#e57373','#ce93d8'];
  return materialNote+Object.keys(byLvl).sort((a,b)=>a-b).map(lv=>{
    const lvInt=parseInt(lv);
    const color=STAR_COLORS[Math.min(lvInt,9)];
    const star=`<span style="color:${color};font-size:12px">★</span>`;
    const lvLabel=lv==='0'?`${star} Sorts mineurs`:`${star} Niveau ${lv}`;
    const isOpen=_spellLevelsOpen[lv]!==false;
    return`
    <div style="margin-bottom:10px">
      <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;padding-bottom:3px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;cursor:pointer" onclick="_spellLevelsOpen['${lv}']=!(_spellLevelsOpen['${lv}']!==false);render()">
        <span>${lvLabel} <span style="color:var(--text3);font-size:9px">(${byLvl[lv].length})</span></span>
        <span style="font-size:10px;color:var(--text3)">${isOpen?'▴':'▾'}</span>
      </div>
      ${isOpen?byLvl[lv].slice().sort((a,b)=>(a.name||'').localeCompare(b.name||'')).map(s=>{
        const d=s.data;
        const school=d?d.school:'';
        const castTime=d?d.castTime:'';
        const range=d?d.range:'';
        const duration=d?d.duration:'';
        const components=d?d.components:'';
        const desc=d?d.desc:'';
        const damage=d?d.damage:'';
        const ritual=d&&d.ritual;
        const rolls=d&&d.rolls?d.rolls:[];
        const lvi=parseInt(lv);
        const isPrepared=s.prepared||lvi===0||!prepCaster;
        const hasMComponent=wsMaterialRestrict&&components&&components.includes('M');
        return`
        <div class="sort-row"${hasMComponent?' style="opacity:0.4"':''}>
          <div class="sort-head" onclick="document.getElementById('${s.stableId}').classList.toggle('open')">
            <div style="flex:1">
              <div style="font-size:13px;font-weight:600;${!isPrepared?'color:var(--text3)':''}">${s.isCircle?'<span style="font-size:10px;color:var(--cp);margin-right:4px">⭐</span>':''}${esc(s.name)}${ritual?' <span style="font-size:10px;color:var(--cp)">(R)</span>':''}${s.isCircle?'  <span style="font-size:9px;background:rgba(200,168,75,.15);color:var(--cp);border-radius:8px;padding:1px 5px">Cercle</span>':isPrepared&&lvi>0&&prepCaster?'  <span style="font-size:9px;background:rgba(76,175,80,.15);color:#4caf50;border-radius:8px;padding:1px 5px">Préparé</span>':''}</div>
              ${d?`<div style="font-size:11px;color:var(--text3)">${esc(school)}${castTime?' • '+esc(castTime):''}${range?' • '+esc(range):''}</div>`:''}
            </div>
            ${damage?`<span style="font-size:11px;color:var(--cp);margin-right:6px">${esc(damage)}</span>`:''}
            ${combatOnly&&(damage||d&&d.savingThrow)?`<button class="btn bac bsm" style="flex-shrink:0;margin-right:6px" onclick="event.stopPropagation();rollSpellPlayer('${esc(s.name)}','${esc(damage||'')}','${esc(d&&d.savingThrow||'')}')">🎲</button>`:''}
            ${!combatOnly&&prepCaster&&lvi>0&&!s.isCircle?`<button class="btn bsm" style="margin-right:6px;${isPrepared?'background:rgba(76,175,80,.15);color:#4caf50;border-color:#4caf50':''}" onclick="event.stopPropagation();togglePrepareSpell('${esc(s.name)}')">${isPrepared?'✓ Prêt':'Préparer'}</button>`:''}
            <span style="color:var(--text3)">▾</span>
          </div>
          <div class="sort-body" id="${s.stableId}">
            ${d?`
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px">
                ${components?`<span style="font-size:10px;background:var(--surface2);padding:2px 7px;border-radius:10px;color:var(--text2)">${esc(components)}</span>`:''}
                ${duration?`<span style="font-size:10px;background:var(--surface2);padding:2px 7px;border-radius:10px;color:var(--text2)">⏱ ${esc(duration)}</span>`:''}
                ${ritual?`<span style="font-size:10px;background:var(--cg,rgba(200,168,75,.15));padding:2px 7px;border-radius:10px;color:var(--cp)">Rituel</span>`:''}
              </div>
              <p style="font-size:12px;color:var(--text2);line-height:1.6">${esc(desc)}</p>
              ${rolls.length>1?`<div style="margin-top:6px;font-size:11px;color:var(--text3)">Progression: ${rolls.filter(r=>r[1]).map(r=>`Niv.${r[1]}: ${r[0]}`).join(' → ')}</div>`:''}
              ${damage||d&&d.savingThrow?`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:6px">
                ${d&&d.savingThrow?`<span style="font-size:11px;padding:2px 8px;background:rgba(200,168,75,.12);border-radius:8px;color:var(--cp)">JS ${esc(d.savingThrow)} DD ${spellDC}</span>`:''}
                ${damage?`<button class="btn bsm" onclick="rollSpellPlayer('${esc(s.name)}','${esc(damage)}','${esc(d&&d.savingThrow||'')}')">🎲 Lancer ${esc(damage)}</button>`:''}
              </div>`:''}
            `:`<p style="font-size:12px;color:var(--text3);display:flex;align-items:center;gap:8px">Données non disponibles. <button class="btn bsm" style="font-size:10px;padding:2px 8px" onclick="loadSpellsDB(()=>render())">Charger le compendium</button></p>`}
          </div>
        </div>`;
      }).join(''):''}
    </div>`;
  }).join('');
}

function togglePrepareSpell(name){
  const p=P();
  if(!p.spells)return;
  const s=p.spells.find(x=>x.name===name);
  if(s)s.prepared=!s.prepared;
  saveAll();render();
}



// ═══════════════════════════════════════
