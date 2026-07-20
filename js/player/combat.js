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
  // Le style de combat n'apparaît qu'à partir du niveau d'obtention de la classe (Guerrier 1, Paladin/Rôdeur 2)
  const availableStyles=[...new Set((p.classes||[]).flatMap(c=>{const _sl=((typeof CLASS_LEVEL_DATA!=='undefined'&&CLASS_LEVEL_DATA[c.name])||{}).styleLevel||1;return c.level>=_sl?(COMBAT_STYLES_BY_CLASS[c.name]||[]):[];}))];
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
  const frenActive=isBerserker&&barbareLvl>=3&&rageActive&&cc['FrénésieActive']===true;

  // Assassinat (Roublard — Assassin niv.3) : toggle « armer-puis-frapper » — '' / 'adv' (cible n'ayant pas agi) / 'surprise' (critique auto + Frappe meurtrière niv.17)
  const _rogLvlTC=((p.classes||[]).find(c=>c.name==='Roublard')||{}).level||0;
  const assassinMode=(_rogLvlTC>=3&&(p.features||[]).some(f=>f.name==='Assassin'))?(cc['AssassinatReady']||''):'';

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
  const clercPath=(p.features||[]).find(f=>['Domaine de la vie','Domaine de la lumière','Domaine de la nature','Domaine de la tempête','Domaine de la duperie','Domaine de la guerre','Domaine du savoir','Domaine de la forge'].includes(f.name));
  const druLvl=((p.classes||[]).find(c=>c.name==='Druide')||{}).level||0;
  const druPath=(p.features||[]).find(f=>['Cercle de la lune','Cercle de la terre'].includes(f.name));
  const isLune=druPath?.name==='Cercle de la lune';
  const isTerres=druPath?.name==='Cercle de la terre';
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
  const artPath=(p.features||[]).find(f=>['Alchimiste','Artilleur','Forgeron de guerre','Maître armurier'].includes(f.name));
  const isAlchi=artPath?.name==='Alchimiste';
  const isArtil=artPath?.name==='Artilleur';
  const isFdB=artPath?.name==='Forgeron de guerre';
  const artsMartiauxDie=moineLvl>=17?'d10':moineLvl>=11?'d8':moineLvl>=5?'d6':'d4';
  const snkDice=Math.ceil(roublardLvl/2);
  const isVaillanceCombat=(p.features||[]).some(f=>f.name==='Collège de la vaillance');
  const _artLvlAtk=((p.classes||[]).find(c=>c.name==='Artificier')||{}).level||0;
  const _artExtraAtk=_artLvlAtk>=5&&(artPath?.name==='Forgeron de guerre'||artPath?.name==='Maître armurier');
  const hasExtraAttack=(p.classes||[]).some(c=>['Guerrier','Barbare','Paladin','Rôdeur','Moine'].includes(c.name)&&(c.level||0)>=5)||(isVaillanceCombat&&bardeLvl>=6)||_artExtraAtk;
  const attackCount=guerrierLvl>=20?4:guerrierLvl>=11?3:hasExtraAttack?2:1;
  const wsC=p.wildshape;

  // Collecte les capacités de combat — exclut par classe celles gérées par un panneau dédié
  const _DEDICATED_PANEL_FEATS_BY_CLASS={
    'Barbare':['Rage','Défense sans armure'],
    'Barde':['Inspiration bardique','Contre-charme','Inspiration supérieure'],
    'Moine':['Points de ki'],
    'Ensorceleur':['Points de sorcellerie'],
    'Guerrier':['Second souffle','Fougue','Inflexible'],
    'Druide':['Forme sauvage'],
    'Clerc':['Conduit divin','Intervention divine'],
    'Paladin':['Conduit divin','Imposition des mains','Aura de protection','Aura de courage','Forme sacrée'],
    'Roublard':['Attaque sournoise'],
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

  const _buffBanners=[];
  const _activeInspi=(p.activeBuffs||[]).find(b=>b.name==='InspirationBardique');
  if(_activeInspi)_buffBanners.push(`<div style="background:rgba(200,168,75,.1);border:2px solid var(--cp);border-radius:2px;padding:10px 12px;margin-bottom:8px;display:flex;align-items:center;gap:10px;flex-wrap:wrap"><span style="font-size:15px">🎵</span><div style="flex:1"><div style="font-size:13px;font-weight:700;color:var(--cp)">Inspiration bardique — ${_activeInspi.die}</div><div style="font-size:12px;color:var(--text3)">de ${esc(_activeInspi.sourceName||'Le barde')} • Jet d'attaque, compétence ou sauvegarde</div></div><div style="display:flex;gap:6px"><button class="btn bsm bac" onclick="useInspirationBardique('${_activeInspi.die}')">✦ Utiliser</button><button class="btn bsm" onclick="discardInspirationBardique()" style="color:var(--text3)">✕</button></div></div>`);
  const _activeBened=(p.activeBuffs||[]).find(b=>b.name==='Benediction');
  if(_activeBened)_buffBanners.push(`<div style="background:rgba(200,168,75,.08);border:2px solid var(--cp);border-radius:2px;padding:10px 12px;margin-bottom:8px;display:flex;align-items:center;gap:10px;flex-wrap:wrap"><span style="font-size:15px">✨</span><div style="flex:1"><div style="font-size:13px;font-weight:700;color:var(--cp)">Bénédiction — +1d4</div><div style="font-size:12px;color:var(--text3)">de ${esc(_activeBened.sourceName||'Allié')} • Concentration</div></div><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn bsm" onclick="rollSupportBuff('Benediction','d4',false)" style="color:var(--cp);border-color:var(--cp)">⚔ Attaque</button><button class="btn bsm" onclick="rollSupportBuff('Benediction','d4',false)" style="color:var(--cp);border-color:var(--cp)">🎲 Save</button><button class="btn bsm" onclick="removeSupportBuff('Benediction')" style="color:var(--text3)">✕ Fin</button></div></div>`);
  const _activeAssist=(p.activeBuffs||[]).find(b=>b.name==='Assistance');
  if(_activeAssist)_buffBanners.push(`<div style="background:rgba(76,175,80,.07);border:2px solid rgba(76,175,80,.5);border-radius:2px;padding:10px 12px;margin-bottom:8px;display:flex;align-items:center;gap:10px;flex-wrap:wrap"><span style="font-size:15px">🤝</span><div style="flex:1"><div style="font-size:13px;font-weight:700;color:var(--good)">Assistance — +1d4</div><div style="font-size:12px;color:var(--text3)">de ${esc(_activeAssist.sourceName||'Allié')} • Prochain jet de compétence</div></div><div style="display:flex;gap:6px"><button class="btn bsm bac" onclick="rollSupportBuff('Assistance','d4',true)" style="background:rgba(76,175,80,.15);border-color:var(--good);color:var(--good)">✦ Utiliser</button><button class="btn bsm" onclick="removeSupportBuff('Assistance')" style="color:var(--text3)">✕</button></div></div>`);
  const _activeAura=(p.activeBuffs||[]).find(b=>b.name==='AuraProtection');
  if(_activeAura)_buffBanners.push(`<div style="background:rgba(255,213,79,.08);border:2px solid var(--cp);border-radius:2px;padding:10px 12px;margin-bottom:8px;display:flex;align-items:center;gap:10px;flex-wrap:wrap"><span style="font-size:15px">🛡</span><div style="flex:1"><div style="font-size:13px;font-weight:700;color:var(--cp)">Aura de protection — +${_activeAura.value||0} à TOUS tes JS</div><div style="font-size:12px;color:var(--text3)">de ${esc(_activeAura.sourceName||'Paladin')} • appliqué automatiquement (tant que tu es dans l'aura)</div></div><button class="btn bsm" onclick="removeSupportBuff('AuraProtection')" style="color:var(--text3)">✕ Quitter</button></div>`);
  return`<div id="combatContainer" data-csgroup="combat">
  <button class="btn" style="width:100%;margin-bottom:10px;background:var(--danger);color:#fff;border-color:var(--danger);min-height:46px;font-size:13px;font-weight:700" onclick="openHpModal()">💥 Dégâts / 💚 Soins</button>
  ${_buffBanners.join('')}
  ${typeof renderVeille==='function'?renderVeille(p):''}
  ${typeof renderActionEco==='function'?renderActionEco(p):''}
  ${typeof renderBaseActions==='function'?renderBaseActions(p):''}
  ${cs('cs-armes',wsC?.active?`<div class="panel mb10" style="border-color:rgba(76,175,80,.4)"><div class="pt" style="display:flex;align-items:center;justify-content:space-between"><div style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span><span style="color:var(--good)">${wsC.beast.icon} ${esc(wsC.beast.name)} — Attaques</span></div><span style="font-size:12px;color:var(--good);border:1px solid rgba(76,175,80,.4);border-radius:2px;padding:2px 8px">🐺 Forme sauvage</span></div>
      ${wsC.beast.attacks.map(a=>`<div style="background:rgba(76,175,80,.06);border:1px solid rgba(76,175,80,.25);border-radius:2px;padding:10px;margin-bottom:6px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:14px;font-weight:600;color:var(--good)">${esc(a.name)}</span>
          <span style="color:var(--good);font-weight:600">+${a.bonus} / ${esc(a.dmg)} ${esc(a.type||'')}</span>
        </div>
        ${a.special?`<div style="font-size:13px;color:var(--text3);margin-top:3px">${esc(a.special)}</div>`:''}
        <div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:6px"><button class="btn bsm" style="border-color:rgba(76,175,80,.4);color:var(--good)" onclick="rollAttack('${jsq(a.name)}',${a.bonus},'${jsq(a.dmg)}')" title="Jet d'attaque + dégâts">⚔ Attaque</button></div>
      </div>`).join('')}
      <div style="margin-top:10px;display:flex;gap:5px;flex-wrap:wrap">${['d4','d6','d8','d10','d12','d20'].map(d=>`<button class="dice-btn" onclick="rollDie('${d}')">${d}</button>`).join('')}</div>
      <div id="rollResult" style="margin-top:8px;padding:8px;background:var(--surface2);border-radius:2px;display:${_lastRollResultHtml?'block':'none'};font-size:14px;font-weight:600;color:var(--cp);text-align:center">${_lastRollResultHtml}</div>
    </div>`:`<div class="panel mb10"><div class="pt" style="display:flex;align-items:center;justify-content:space-between"><div style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span>Armes équipées</div>${attackCount>1?`<span style="font-size:12px;font-weight:600;color:var(--cp);border:1px solid rgba(200,168,75,.4);border-radius:2px;padding:2px 8px">⚔ ×${attackCount} attaques</span>`:''}</div>
      ${availableStyles.length?`<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="font-size:13px;color:var(--text3)">🗡 Style :</span><select style="font-size:13px;background:var(--surface3,var(--surface2));border:1px solid var(--border);border-radius:2px;padding:3px 6px;color:var(--text)" onchange="P().combatStyle=this.value;P().ac=_calcArmorCA(P());_markUnsaved();render()"><option value="">— Aucun</option>${availableStyles.map(s=>`<option value="${s}"${combatStyle===s?' selected':''}>${s}</option>`).join('')}</select></div>`:''}
      ${(()=>{
        // Fix 7 — Attaque à main nue si aucune arme équipée
        const hasMainhand=!!(p.equip||{}).mainhand?.name;
        if(!hasMainhand&&!wsC?.active){
          const unarmedMod=moineLvl>=1?Math.max(forM,dexM):forM;
          const unarmedAtk=pb(lvl)+unarmedMod;
          const kiMagic=moineLvl>=6?' (magique ✨)':''; // Frappes de ki (Moine niv.6) : mains nues = attaques magiques
          const unarmedDmg=moineLvl>=1?`1${artsMartiauxDie.replace('d','d')} contondant${kiMagic}`:'1 contondant';
          const unarmedDmgRaw=moineLvl>=1?artsMartiauxDie:'1';
          return`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:2px;padding:10px;margin-bottom:6px">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span style="font-size:14px;font-weight:600">Poing</span>
              <span style="color:var(--cp);font-weight:600">+${unarmedAtk} / ${esc(unarmedDmg)}</span>
            </div>
            <div style="font-size:13px;color:var(--text3);margin-top:3px">Main nue — ${moineLvl>=1?'Arts martiaux ('+ABILITIES_SH[forM>=dexM?0:1]+')':'Force'}${moineLvl>=6?' • ✨ magique (Frappes de ki)':''}</div>
            <div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:6px">
              ${Array.from({length:attackCount},(_,ai)=>`<button class="btn bsm${(temActive||assassinMode)?' bac':''}" onclick="rollAttack('Poing',${unarmedAtk},'${jsq(unarmedDmgRaw)} contondant${kiMagic}','mainhand',${rageActive?rageBonus:0},false,${(temActive||assassinMode)?1:0})">🎲${attackCount>1?' Att.'+(ai+1):'  Attaque'}</button>`).join('')}
            </div>
          </div>`;
        }
        return'';
      })()}
      ${weapons.length?weapons.map(w=>{
        const srdW=findSRDWeapon(w.name);
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
        const mainhandSrd=mainhandWpn?findSRDWeapon(mainhandWpn.name):null;
        const mainhandIsLegere=mainhandSrd?(mainhandSrd.properties||'').toLowerCase().includes('légère'):false;
        const offhandLegereOk=!isOffhand||(isLegere&&mainhandIsLegere);
        const rageMeleeBonus=rageActive&&!isRanged?rageBonus:0;
        const dmgBonus=(isOffhand?(combatStyle==='Combat à deux armes'?atkM:0):isDueling?2:0)+rageMeleeBonus;
        const isMagic=w.magic;
        const slotLabel=isRanged?'Distance':w.slot==='mainhand'?'Main droite':'Main gauche';
        const ammoItem=isRanged&&w.ammoLink?(p.inventory||[]).find(i=>i.name===w.ammoLink):null;
        const ammoCount=ammoItem?ammoItem.qty:null;
        let styleBadge='';
        if(assassinMode)styleBadge+=`<span style="font-size:12px;color:var(--arcane);margin-left:4px">🎯 Assassinat${assassinMode==='surprise'?' (surprise : critique auto)':''} — avantage</span>`;
        if(rageActive&&!isRanged)styleBadge+=`<span style="font-size:12px;color:var(--danger);margin-left:4px">🔥 +${rageBonus} rage</span>`;
        if(isDueling)styleBadge+=`<span style="font-size:12px;color:var(--good);margin-left:4px">+2 dégâts (Duel)</span>`;
        else if(archerieBonus)styleBadge+=`<span style="font-size:12px;color:var(--good);margin-left:4px">+2 att. (Archerie)</span>`;
        else if(isTwoHandedStyle)styleBadge+=`<span style="font-size:12px;color:var(--good);margin-left:4px">Relance 1-2 (2 mains)</span>`;
        else if(isOffhand&&combatStyle==='Combat à deux armes'&&atkM!==0)styleBadge+=`<span style="font-size:12px;color:var(--good);margin-left:4px">${atkM>0?'+':''}${atkM} dégâts (2 armes)</span>`;
        else if(isOffhand&&!offhandLegereOk)styleBadge+=`<span style="font-size:12px;color:var(--danger);margin-left:4px">⚠ Légère requis</span>`;
        return`<div style="background:var(--surface2);border:1px solid ${isMagic?'var(--arcane)':'var(--border)'};border-radius:2px;padding:10px;margin-bottom:6px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:14px;font-weight:600">${esc(w.name)}${isMagic?` <span class="magic-badge">✨ Magique${w.linkedTo?' • Lié: '+esc(w.linkedTo):''}</span>`:''}</span>
            <span style="color:var(--cp);font-weight:600">+${atkBonus} / ${esc(dmgStr)}${dmgBonus>0?' +'+dmgBonus:dmgBonus<0?' '+dmgBonus:''}</span>
          </div>
          <div style="font-size:13px;color:var(--text3);margin-top:3px">${slotLabel}${isOffhand?' • Action bonus':''}${isRanged&&ammoCount!==null?` • 🏹 <span style="color:${ammoCount<=5?'var(--danger)':'var(--cp)'}">${ammoCount}</span> ${esc(w.ammoLink||'munitions')}`:''}${styleBadge}</div>
          ${isFinesse?`<div style="display:flex;gap:4px;margin-top:4px;align-items:center"><span style="font-size:12px;color:var(--text3)">Finesse :</span><button class="btn bsm${atkStat==='STR'?' bac':''}" style="font-size:12px;padding:2px 6px" onclick="setWeaponPref('${w.slot}','stat','STR')">FOR ${fmt(forM)}</button><button class="btn bsm${atkStat==='DEX'?' bac':''}" style="font-size:12px;padding:2px 6px" onclick="setWeaponPref('${w.slot}','stat','DEX')">DEX ${fmt(dexM)}</button></div>`:''}
          ${isPolyvalente&&versDie?`<div style="display:flex;gap:4px;margin-top:4px;align-items:center"><span style="font-size:12px;color:var(--text3)">Prise :</span><button class="btn bsm${!twoHanded?' bac':''}" style="font-size:12px;padding:2px 6px" onclick="setWeaponPref('${w.slot}','twoHanded',false)">1 main (${esc(srdW.damage.split(' ')[0])})</button><button class="btn bsm${twoHanded?' bac':''}" style="font-size:12px;padding:2px 6px" onclick="setWeaponPref('${w.slot}','twoHanded',true)">2 mains (${esc(versDie)})</button></div>`:''}
          ${isRanged?`<div style="font-size:13px;color:var(--text3);margin-top:4px">
            ${w.ammoLink?`<button class="btn bsm" style="font-size:12px" onclick="unlinkRangedAmmo()">↩ Délier ${esc(w.ammoLink)}</button>`:
            `<button class="btn bsm" style="font-size:12px" onclick="openLinkAmmoModal()">🏹 Lier des munitions</button>`}
          </div>`:''}
          <div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:6px">${isOffhand?`<button class="btn bsm${(temActive||assassinMode)?' bac':''}" onclick="rollAttack('${jsq(w.name)}',${atkBonus},'${jsq(dmgStr)}','${w.slot}',${dmgBonus},false,${((temActive&&!isRanged)||assassinMode)?1:0})">🎲${temActive?' ⚡':''} Att. bonus</button>`:Array.from({length:attackCount},(_,ai)=>`<button class="btn bsm${((temActive&&!isRanged)||assassinMode)?' bac':''}" onclick="rollAttack('${jsq(w.name)}',${atkBonus},'${jsq(dmgStr)}','${w.slot}',${dmgBonus},${isTwoHandedStyle},${((temActive&&!isRanged)||assassinMode)?1:0})">🎲${temActive&&!isRanged?' ⚡':''}${attackCount>1?' Att.'+(ai+1):'  Attaque'}</button>`).join('')}${!isOffhand&&!isRanged&&(typeof _activeCombatState!=='undefined'&&_activeCombatState&&_activeCombatState.active)&&!(typeof _veilleMyTurn==='function'&&_veilleMyTurn())?`<button class="btn bsm" style="border-color:var(--arcane);color:var(--arcane)${(p.actionEco&&p.actionEco.r)?';opacity:.45':''}" ${(p.actionEco&&p.actionEco.r)?'disabled':''} onclick="rollOpportunityAttack('${jsq(w.name)}',${atkBonus},'${jsq(dmgStr)}','${w.slot}',${dmgBonus},${isTwoHandedStyle})" title="Attaque d'opportunité (tour ennemi) — consomme ta réaction">↪ AO</button>`:''}</div>
          ${frenActive&&!isRanged&&!isOffhand?`<div style="margin-top:4px"><button class="btn bsm" style="border-color:var(--danger);color:var(--danger);background:rgba(183,28,28,.12)" onclick="rollAttack('${jsq(w.name)}',${atkBonus},'${jsq(dmgStr)}','${w.slot}',${dmgBonus},false,${temActive?1:0})">💢 Frénésie (bonus)</button></div>`:''}
        </div>`;
      }).join(''):`<div style="font-size:13px;color:var(--text3);font-style:italic">Aucune arme équipée.</div>`}
      <div style="margin-top:10px;display:flex;gap:5px;flex-wrap:wrap">${['d4','d6','d8','d10','d12','d20'].map(d=>`<button class="dice-btn" onclick="rollDie('${d}')">${d}</button>`).join('')}</div>
      <div id="rollResult" style="margin-top:8px;padding:8px;background:var(--surface2);border-radius:2px;display:${_lastRollResultHtml?'block':'none'};font-size:14px;font-weight:600;color:var(--cp);text-align:center">${_lastRollResultHtml}</div>
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
              <div style="font-size:12px;color:var(--text3)">${esc(f.className)} • ${isPassive?'Passif':f.recovery==='short'?'Repos court':'Repos long'}</div>
            </div>
            ${!isPassive&&maxCharges>0?`<div class="feat-bubbles" style="display:flex;gap:3px;align-items:center;flex-wrap:wrap;margin-right:8px;max-width:200px">${Array.from({length:maxCharges},(_,i)=>`<span class="slot-bubble${i<usedCharges?'':' used'}" onclick="event.stopPropagation();useCombatCharge('${jsq(f.name)}',${maxCharges})"></span>`).join('')}</div>`:''}
            <span style="color:var(--text3);font-size:13px">▾</span>
          </div>
          <div class="feat-body" id="${fid}">
            <p>${esc(f.desc)}</p>
            ${f.dice?`<button class="btn bsm" style="margin-top:6px" onclick="rollCustomDmg('${jsq(f.dice)}','${jsq(f.name)}')">🎲 ${esc(f.dice)}</button>`:''}
            ${!isPassive&&maxCharges>0?`<button class="btn bsm" style="margin-top:6px" onclick="recoverCombatCharge('${jsq(f.name)}',${maxCharges})">↺ Récupérer</button>`:''}
          </div>
        </div>`;
      }).join('')}
      ${!allCombatFeats.length&&isMJ()?`<div style="font-size:13px;color:var(--text3);font-style:italic">Aucune capacité de classe. Le MJ peut en ajouter via le bouton ci-dessus.</div>`:''}
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
  ${(()=>{if(!(p.race||'').startsWith('Dragonide')||!p.draconicAncestry)return'';const anc=SRD.draconicAncestries.find(a=>a.name===p.draconicAncestry);if(!anc)return'';const conM=p.abilities?Math.floor((p.abilities[2]-10)/2):0;const dc=8+pb(lvl)+conM;const diceCnt=lvl>=16?5:lvl>=11?4:lvl>=6?3:2;const dmg=`${diceCnt}d6 ${anc.damage}`;const used=(p.combatCharges||{})['SouffleDraconique']===true;return cs('cs-dragon',`<div class="panel mb10">
        <div class="pt" style="display:flex;align-items:center;justify-content:space-between"><div style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span><span>${anc.icon} Souffle draconique — ${esc(anc.name)}</span></div>
          <span style="font-size:12px;color:var(--cp);border:1px solid var(--cp);border-radius:2px;padding:2px 8px">1×/Repos</span>
        </div>
        <div style="font-size:13px;color:var(--text2);margin-bottom:8px">
          ${esc(anc.shape)} • <strong style="color:var(--cp)">${esc(dmg)}</strong> • JS CON DD ${dc} (½ si réussi)<br>
          <span style="font-size:13px;color:var(--text3)">Résistance au type ${esc(anc.damage)}</span>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <span class="slot-bubble${used?' used':''}" style="width:18px;height:18px" onclick="toggleDraconicBreath()"></span>
          <span style="font-size:13px;color:${used?'var(--text3)':'var(--cp)'}">${used?'Utilisé — Recharge au repos':'Disponible'}</span>
          <button class="btn bsm" onclick="rollCustomDmg('${diceCnt}d6','Souffle ${esc(anc.name)}')">🎲 ${esc(dmg)}</button>
        </div>
        ${used?`<button class="btn bsm" style="margin-top:8px" onclick="P().combatCharges=P().combatCharges||{};delete P().combatCharges['SouffleDraconique'];saveAll();render();">↺ Récupérer (Repos court/long)</button>`:''}
      </div>`);})()}
  ${(()=>{
    if(p.race!=='Tieffelin')return'';
    const chaM=mod(p.abilities[5]||10);const spellDC=8+pb(lvl)+chaM;
    const usedNiv3=(cc||{})['SortsInfernaux_Niv3']===true;
    const usedNiv5=(cc||{})['SortsInfernaux_Niv5']===true;
    const niv3=lvl<3?'':'<div style="padding:6px 8px;background:var(--surface2);border-radius:2px;margin-bottom:4px;display:flex;align-items:center;justify-content:space-between"><div><div style="font-size:13px;font-weight:600">🔥 Bénédiction infernale</div><div style="font-size:12px;color:var(--text3)">Niv.2 — 1×/repos long • Réaction : 2d10 feu quand blessé</div></div><div style="display:flex;align-items:center;gap:6px"><span class="slot-bubble'+(usedNiv3?' used':'')+'" style="width:18px;height:18px" onclick="P().combatCharges=P().combatCharges||{};P().combatCharges[\'SortsInfernaux_Niv3\']=!P().combatCharges[\'SortsInfernaux_Niv3\'];saveAll();render()"></span><button class="btn bsm" onclick="rollCustomDmg(\'2d10\',\'Bénédiction infernale\')">🎲</button>'+(usedNiv3?'<button class="btn bsm" onclick="P().combatCharges=P().combatCharges||{};delete P().combatCharges[\'SortsInfernaux_Niv3\'];saveAll();render()">↺</button>':'')+'</div></div>';
    const niv5=lvl<5?'':'<div style="padding:6px 8px;background:var(--surface2);border-radius:2px;display:flex;align-items:center;justify-content:space-between"><div><div style="font-size:13px;font-weight:600">🌑 Ténèbres</div><div style="font-size:12px;color:var(--text3)">Niv.2 — 1×/repos long • Obscurité magique (rayon 4,5m)</div></div><div style="display:flex;align-items:center;gap:6px"><span class="slot-bubble'+(usedNiv5?' used':'')+'" style="width:18px;height:18px" onclick="P().combatCharges=P().combatCharges||{};P().combatCharges[\'SortsInfernaux_Niv5\']=!P().combatCharges[\'SortsInfernaux_Niv5\'];saveAll();render()"></span>'+(usedNiv5?'<button class="btn bsm" onclick="P().combatCharges=P().combatCharges||{};delete P().combatCharges[\'SortsInfernaux_Niv5\'];saveAll();render()">↺</button>':'')+'</div></div>';
    return cs('cs-tiefling','<div class="panel mb10"><div class="pt" style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span>🔥 Sorts infernaux</div><div style="font-size:13px;color:var(--text3);margin-bottom:8px">DD sorts : <strong style="color:var(--cp)">'+spellDC+'</strong> • Bonus attaque sorts : <strong style="color:var(--cp)">'+fmt(pb(lvl)+chaM)+'</strong> (CHA)</div><div style="padding:6px 8px;background:var(--surface2);border-radius:2px;margin-bottom:4px;display:flex;align-items:center;justify-content:space-between"><div><div style="font-size:13px;font-weight:600">✨ Thaumaturgie</div><div style="font-size:12px;color:var(--text3)">Sort mineur — À volonté</div></div><span style="font-size:16px;color:var(--cp)">∞</span></div>'+niv3+niv5+'</div>');
  })()}
  ${wsC?.active?cs('cs-ws-info',`<div class="panel mb10" style="border-color:rgba(76,175,80,.3);background:rgba(76,175,80,.04)"><div style="font-size:13px;color:var(--text3);text-align:center;padding:8px">🐺 En forme animale — sorts et capacités de classe indisponibles${druLvl>=18?'<br><span style="color:var(--good);font-size:13px">Niv. 18 — Incantation animale : tu peux lancer des sorts ✓</span>':''}</div></div>`):''}
  ${renderOccultiste(p)}
  ${renderMagicien(p)}
  ${renderRodeur(p)}
  ${renderFamilier(p)}
  ${renderCompagnonAnimal(p)}
  ${typeof renderConcPanel==='function'?renderConcPanel(p):''}
  ${(!wsC?.active||druLvl>=18)&&hasCaster&&(slots||(p.spells||[]).length>0)?cs('cs-sorts',`<div class="panel"><div class="pt" style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span>Sorts</div>
      <div class="g3 mb10">
        <div class="sb hi"><div class="sn">Bonus sort</div><div style="font-size:18px;font-weight:600;color:var(--cp)">${fmt(pb(lvl)+spellMod)}</div></div>
        <div class="sb hi"><div class="sn">DD sort</div><div style="font-size:18px;font-weight:600;color:var(--cp)">${8+pb(lvl)+spellMod}</div></div>
        <div class="sb"><div class="sn">Mod.</div><div style="font-size:14px;font-weight:600">${fmt(spellMod)}</div></div>
      </div>
      ${slots?`<div style="margin-bottom:10px"><div class="fl mb6">Emplacements</div>${slots.map((total,ni)=>total?`<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><span style="font-size:13px;color:var(--text2);width:50px">Niv. ${ni+1}</span><div>${Array.from({length:total},(_,si)=>`<span class="slot-bubble${si<(slotsUsed[ni]||0)?' used':''}" onclick="toggleSlot(${ni},${si},${total})"></span>`).join('')}</div><span style="font-size:12px;color:var(--text3)">${total-(slotsUsed[ni]||0)}/${total}</span></div>`:'').join('')}<button class="btn bsm" style="margin-top:4px" onclick="upd('spellSlotsUsed',[]);render()">Récupérer tous</button></div>`:''}
      ${(()=>{const magLvl=((p.classes||[]).find(c=>c.name==='Magicien')||{}).level||0;if(!magLvl)return'';const prepMax=Math.max(1,intM+magLvl);const known=(p.spells||[]).filter(s=>{const sp=findSpellData(s.name);return sp&&sp.level>0;}).length;return`<div style="margin-top:8px;padding:8px;background:var(--surface2);border-radius:2px;font-size:13px;color:var(--text2)">📚 Sorts préparés : <strong style="color:${known>prepMax?'var(--danger)':'var(--cp)'}">${known}/${prepMax}</strong> (INT ${fmt(intM)} + niv. ${magLvl})</div>`;})()}
      ${renderSpellList(p, true)}
    </div>`):''}
  </div>`;
}

// ── Tracker d'économie d'action (style BG3) — 3 jauges : Action / Action bonus / Réaction ──
// Visible EN COMBAT UNIQUEMENT. Se réinitialise au début du tour du joueur (firebase.js).
function renderActionEco(p){
  if(!(typeof _activeCombatState!=='undefined'&&_activeCombatState&&_activeCombatState.active))return ''; // en combat seulement
  const ae=p.actionEco||{a:false,b:false,r:false};
  const g=(key,icon,label,used)=>`<div class="ae-gauge${used?' used':''}" onclick="_toggleActionEco('${key}')" title="${label} — clique pour ${used?'récupérer':'consommer'}"><div class="ae-ico">${icon}</div><div class="ae-lbl">${label}</div><div class="ae-state">${used?'utilisée':'dispo'}</div></div>`;
  return cs('cs-actioneco',`<div class="panel mb10"><div class="pt" style="display:flex;align-items:center;justify-content:space-between"><div style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span>⚡ Économie d'action</div><button class="btn bsm" onclick="_resetActionEco(true)" title="Réinitialiser (début de tour)">↺ Mon tour</button></div>
    <div class="ae-row">${g('a','●','Action',ae.a)}${g('b','◆','Action bonus',ae.b)}${g('r','↪','Réaction',ae.r)}</div>
    <div style="font-size:11.5px;color:var(--text3);margin-top:6px">Se réinitialise au début de ton tour. Clique une jauge pour la consommer / récupérer.</div>
  </div>`);
}
function _toggleActionEco(k){const p=P();if(!p)return;if(!p.actionEco)p.actionEco={a:false,b:false,r:false};p.actionEco[k]=!p.actionEco[k];if(typeof _markUnsaved==='function')_markUnsaved();render();}
function _resetActionEco(rerender){const p=(typeof P==='function')?P():null;if(!p)return;p.actionEco={a:false,b:false,r:false};if(rerender&&typeof render==='function')render();}

// ── MOTEUR DE VEILLE — rappels dorés contextuels (cf. feedback_veille_pattern) ──
// S'affiche UNIQUEMENT sur momentum : isMyTurn / tour ennemi / round 1 / condition active.
// Display-only + IRL : rappelle au bon moment, le joueur juge. JAMAIS de tracking d'état ennemi
// (la traçabilité réelle l'interdit : l'app ne connaît pas CA/touche/statuts ennemis côté joueur).
function _veilleMyTurn(){const c=(typeof _activeCombatState!=='undefined')?_activeCombatState:null;return !!(c&&c.active&&c.currentTurnUid===(typeof currentUser!=='undefined'&&currentUser?currentUser.uid:null));}
function _veilleRound(){const c=(typeof _activeCombatState!=='undefined')?_activeCombatState:null;return (c&&c.round)||1;}
function _veilleClsLvl(p,cls){return ((p.classes||[]).find(c=>c.name===cls)||{}).level||0;}
function _veilleHasArch(p,cls,arch){return ((p.archetype||{})[cls]===arch)||((p.features||[]).some(f=>f.name===arch));}
function _veilleHasFeat(p,re){return (p.features||[]).some(f=>re.test(f.name||''));}
// Cas validés (table feedback_veille_pattern). when : 'myturn' | 'enemyturn' | 'round1'.
const _VEILLE_CASES=[
  {cls:'Rôdeur',lvl:14,when:'myturn',icon:'👻',title:'Disparition',text:"Action bonus : te cacher. Tu ne peux pas être pisté par des moyens non magiques."},
  {cls:'Ensorceleur',lvl:14,arch:'Lignée draconique',when:'myturn',icon:'🦋',title:'Ailes draconiques',text:"Action bonus : déployer tes ailes → vitesse de vol = ton déplacement."},
  {cls:'Moine',lvl:2,when:'myturn',icon:'🥋',title:'Défense patiente',text:"Action bonus (1 ki) : Esquive — les attaques contre toi ont le désavantage ce tour."},
  {cls:'Roublard',lvl:3,arch:'Assassin',when:'round1',icon:'🗡',title:'Assassinat',text:"1er tour : avantage contre toute créature n'ayant pas encore agi · critique auto si la cible est surprise."},
  {cls:'Paladin',lvl:7,arch:'Serment de vengeance',when:'enemyturn',icon:'↪',title:'Vengeur implacable',text:"Si ton attaque d'opportunité touche → réaction : déplacement de ½ vitesse."},
  {cls:'Paladin',lvl:15,arch:'Serment de vengeance',when:'enemyturn',icon:'↪',title:'Âme vengeresse',text:"Réaction : si la cible de ton Vœu d'hostilité attaque une autre créature, attaque-la."},
  {cls:'Artificier',lvl:7,when:'enemyturn',icon:'↪',title:'Éclair de génie',text:"Réaction : +mod INT à un jet de carac/sauvegarde de toi ou d'un allié visible à 9 m (si charge dispo)."},
  {cls:'Artificier',lvl:15,arch:'Maître armurier',when:'round1',icon:'🎯',title:'Armure de chasse',cond:p=>(p.combatCharges||{})['ArmorModel']==='Infiltrateur',text:"1er tour : +1d6 aux dégâts de ton Lance-lumière contre une créature."},
];
function _veilleBanner(icon,title,text){return `<div class="veille-banner"><span class="veille-ico">${icon}</span><div class="veille-body"><div class="veille-title">${esc(title)}</div><div class="veille-text">${esc(text)}</div></div></div>`;}
function renderVeille(p){
  if(!(typeof _activeCombatState!=='undefined'&&_activeCombatState&&_activeCombatState.active))return ''; // en combat seulement
  const myTurn=_veilleMyTurn(),round=_veilleRound();
  const out=[];
  for(const c of _VEILLE_CASES){
    if(_veilleClsLvl(p,c.cls)<c.lvl)continue;
    if(c.arch&&!_veilleHasArch(p,c.cls,c.arch))continue;
    if(c.cond&&!c.cond(p))continue;
    let show=false;
    if(c.when==='myturn')show=myTurn;
    else if(c.when==='round1')show=myTurn&&round<=1;
    else if(c.when==='enemyturn')show=!myTurn;
    if(show)out.push(_veilleBanner(c.icon,c.title,c.text));
  }
  // Représailles (Barbare niv.14) — rage active + tour ennemi
  if(_veilleClsLvl(p,'Barbare')>=14&&(p.combatCharges||{})['RageActive']&&!myTurn&&_veilleHasFeat(p,/repr[ée]sailles/i)){
    out.push(_veilleBanner('↪','Représailles',"En rage : si une créature à 1,50 m te touche, réaction → attaque de mêlée gratuite contre elle."));
  }
  return out.length?`<div class="veille-wrap">${out.join('')}</div>`:'';
}

// ── Panneau d'actions de base (style BG3) — rappel des actions génériques, combat seulement ──
const _BG3_ACTIONS=[
  {ic:'🏃',n:'Foncer',d:"Double ton déplacement pour ce tour."},
  {ic:'💨',n:'Se désengager',d:"Tes déplacements ne provoquent pas d'attaque d'opportunité ce tour."},
  {ic:'🛡',n:'Esquiver',d:"Les attaques contre toi ont le désavantage ; avantage à tes JS DEX."},
  {ic:'🤝',n:'Aider',d:"Un allié obtient l'avantage à sa prochaine attaque ou un test que tu assistes."},
  {ic:'👁',n:'Se cacher',d:"Test de Discrétion pour devenir non vu."},
  {ic:'🔎',n:'Chercher',d:"Test de Perception ou d'Investigation pour repérer quelque chose."},
  {ic:'🎯',n:'Se préparer',d:"Prépare une action déclenchée par une condition (utilise ta réaction)."},
  {ic:'🎒',n:"Utiliser un objet",d:"Interagir avec ou activer un second objet pendant ton tour."},
];
function renderBaseActions(p){
  if(!(typeof _activeCombatState!=='undefined'&&_activeCombatState&&_activeCombatState.active))return ''; // en combat seulement
  return cs('cs-baseactions',`<div class="panel mb10"><div class="pt" style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span>🎬 Actions de base</div>
    <div style="font-size:11.5px;color:var(--text3);margin:2px 0 8px">Rappel des actions génériques. Clique → consomme ta jauge Action.</div>
    <div class="ba-grid">${_BG3_ACTIONS.map(a=>`<button class="ba-btn" onclick="_useBaseAction('${jsq(a.n)}','${jsq(a.d)}')" title="${esc(a.d)}"><span class="ba-ic">${a.ic}</span><span class="ba-n">${esc(a.n)}</span></button>`).join('')}</div>
  </div>`);
}
function _useBaseAction(name,desc){const p=P();if(!p)return;if(!p.actionEco)p.actionEco={a:false,b:false,r:false};p.actionEco.a=true;if(typeof showBanner==='function')showBanner('🎬',name,desc,{variant:'info'});if(typeof _markUnsaved==='function')_markUnsaved();render();}

// ── Journal d'actions joueur→MJ (principe 25) ──
// Pousse une action récente dans le doc Firestore du joueur ; le MJ la lit via son listener (firebase.js).
// 3ᵉ personne : le MJ verra « {nom du perso} {texte} ». Cap à 25 entrées (ring buffer). Campagne seulement.
function _logMJAction(text){
  if(typeof currentCampaignId==='undefined'||!currentCampaignId||currentCampaignId==='__solo__')return;
  const p=(typeof P==='function')?P():null;if(!p||!text)return;
  if(!p.actionLog)p.actionLog=[];
  p.actionLog.push({id:Date.now()+'-'+Math.floor(Math.random()*1000),t:Date.now(),name:p.charName||'',text:text});
  if(p.actionLog.length>25)p.actionLog=p.actionLog.slice(-25);
  if(typeof _markUnsaved==='function')_markUnsaved();
}

function rollCustomDmg(dice,name){
  if(_isIRLMode()){showIRLRoll(`<strong style="font-size:15px;color:var(--cp)">${name}</strong><br>Lance <strong style="font-size:26px">${dice}</strong>`);return;}
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
  // Épuisement niv.3+ → désavantage aux jets d'attaque (avantage+désavantage = normal per D&D rules)
  const _exh=P().exhaustion||0;
  if(_exh>=3){if(advantageMode>0)advantageMode=0;else if(advantageMode===0)advantageMode=-1;}
  if(typeof _logMJAction==='function')_logMJAction('⚔ attaque — '+name);
  if(_isIRLMode()){
    const advNote=advantageMode>0?'<div style="color:var(--good);font-size:14px;margin-top:4px">🟢 AVANTAGE — 2d20, garde le plus haut</div>':advantageMode<0?'<div style="color:var(--danger);font-size:14px;margin-top:4px">🔴 DÉSAVANTAGE — 2d20, garde le plus bas</div>':'';
    const dmgFull=dmg+(dmgBonus?fmt(dmgBonus):'');
    const luckyNote=_isHalfling(P())?'<div style="margin-top:6px;font-size:13px;color:#8d6e63">🍀 Si résultat = 1, vous pouvez relancer</div>':'';
    // Fix 20 — Rappel Critique brutal en rage (IRL)
    const _rp=P();const _barbLvlIRL=((_rp.classes||[]).find(c=>c.name==='Barbare')||{}).level||0;
    const _rageIRL=(_rp.combatCharges||{})['RageActive']===true;
    const _critDiceIRL=_barbLvlIRL>=17?3:_barbLvlIRL>=13?2:1;
    const critBrutalNote=_barbLvlIRL>=9&&_rageIRL&&slot!=='ranged'?`<div style="margin-top:6px;padding:6px 8px;background:rgba(255,152,0,.1);border:1px solid rgba(255,152,0,.3);border-radius:2px;font-size:13px;color:var(--warn)">💥 Si critique (20) : n'oublie pas +${_critDiceIRL} dé${_critDiceIRL>1?'s':''} de dégâts (Critique brutal niv.${_barbLvlIRL})</div>`:'';
    const _palLvlIRL=((_rp.classes||[]).find(c=>c.name==='Paladin')||{}).level||0;
    const smiteIRLNote=_palLvlIRL>=11&&slot&&slot!=='ranged'&&name!=='Poing'?`<div style="margin-top:6px;padding:6px 8px;background:rgba(255,213,79,.1);border:1px solid rgba(255,213,79,.3);border-radius:2px;font-size:13px;color:var(--cp)">⚡ Si touche : +1d8 radiants (Châtiment divin amélioré) — doublé sur critique</div>`:'';
    const _rogLvlIRL=((_rp.classes||[]).find(c=>c.name==='Roublard')||{}).level||0;
    const _assIRL=slot!==undefined&&_rogLvlIRL>=3&&(_rp.combatCharges||{})['AssassinatReady']==='surprise'&&(_rp.features||[]).some(f=>f.name==='Assassin');
    const assassinIRLNote=_assIRL?`<div style="margin-top:6px;padding:6px 8px;background:rgba(156,39,176,.1);border:1px solid rgba(156,39,176,.3);border-radius:2px;font-size:13px;color:var(--arcane)">🎯 Cible surprise : toute touche = CRITIQUE automatique${_rogLvlIRL>=17?` · 🗡 Frappe meurtrière : JS CON DD ${8+pb(totalLevel(_rp))+mod((_rp.abilities||[])[1]||10)} raté → dégâts DOUBLÉS`:''}</div>`:'';
    showIRLRoll(`<strong style="font-size:15px;color:var(--cp)">⚔ ${name}</strong>
      <div style="margin-top:12px;padding:10px;background:var(--surface2);border-radius:2px">
        <div style="font-size:13px;color:var(--text3);margin-bottom:4px">ATTAQUE</div>
        <div style="font-size:16px">d20 <span style="color:var(--text3)">${fmt(bonus)}</span></div>
        ${advNote}${luckyNote}
      </div>
      <div style="margin-top:8px;padding:10px;background:var(--surface2);border-radius:2px">
        <div style="font-size:13px;color:var(--text3);margin-bottom:4px">DÉGÂTS SI TOUCHE</div>
        <div style="font-size:16px;color:var(--cp)">${esc(dmgFull)}</div>
      </div>${critBrutalNote}${smiteIRLNote}${assassinIRLNote}`);
    return;
  }
  let ra,rb=null;
  if(advantageMode!==0){ra=Math.ceil(Math.random()*20);rb=Math.ceil(Math.random()*20);}
  else{ra=Math.ceil(Math.random()*20);}
  function _finishAttack(finalRolls){
    const fr1=finalRolls[0],fr2=finalRolls.length>1?finalRolls[1]:null;
    let atk,atkAlt=null;
    if(fr2!==null){atk=advantageMode>0?Math.max(fr1,fr2):Math.min(fr1,fr2);atkAlt=advantageMode>0?Math.min(fr1,fr2):Math.max(fr1,fr2);}
    else{atk=fr1;}
    const total=atk+bonus;
    // Guerrier Champion : Critique amélioré (19-20 niv.3) / supérieur (18-20 niv.15)
    const _pa=P();const _gLvlC=(((_pa.classes||[]).find(c=>c.name==='Guerrier')||{}).level)||0;const critMin=((_pa.features||[]).some(f=>f.name==='Champion'))?(_gLvlC>=15?18:19):20;
    // Assassinat (Roublard Assassin) : mode « cible surprise » armé → toute touche est un critique automatique
    const _rogLvlFA=(((_pa.classes||[]).find(c=>c.name==='Roublard')||{}).level)||0;
    const _assSurprise=slot!==undefined&&_rogLvlFA>=3&&((_pa.combatCharges||{})['AssassinatReady']==='surprise')&&(_pa.features||[]).some(f=>f.name==='Assassin');
    const isFumble=atk===1;const isCrit=!isFumble&&(atk>=critMin||_assSurprise);
    const col=isCrit?'var(--cp)':isFumble?'var(--danger)':'var(--cp)';
    const advTag=atkAlt!==null?(advantageMode>0?`<span style="font-size:12px;color:var(--good);margin-left:3px">AVT(${atk},~~${atkAlt}~~)</span>`:`<span style="font-size:12px;color:var(--danger);margin-left:3px">DES(~~${atk}~~,${atkAlt})</span>`):'';
    let dmgHtml='';let _totalDmgOut=0;
    if(!isFumble){
      const m=(dmg+'').match(/(\d+)d(\d+)([+-]\d+)?/);
      if(m){
        const dq=parseInt(m[1]),ds=parseInt(m[2]),fixedBonus=(m[3]?parseInt(m[3]):0)+(dmgBonus||0);
        const _p=P();
        const barbLvl=((_p.classes||[]).find(c=>c.name==='Barbare')||{}).level||0;
        const brutCritExtra=isCrit&&barbLvl>=9&&slot!=='ranged'?(barbLvl>=17?3:barbLvl>=13?2:1):0;
        const demiOrcExtra=isCrit&&_p.race==='Demi-Orc'&&slot!=='ranged'?1:0;
        const numDice=isCrit?dq*2+brutCritExtra+demiOrcExtra:dq;
        const rolls=[];for(let i=0;i<numDice;i++){let r=Math.ceil(Math.random()*ds);if(rerollLow&&(r===1||r===2))r=Math.ceil(Math.random()*ds);rolls.push(r);}
        const totalDmg=rolls.reduce((s,v)=>s+v,0)+fixedBonus;_totalDmgOut=totalDmg;
        const typeMatch=(dmg+'').match(/\d+d\d+[+-]?\d*\s+(.*)/);
        const dmgType=typeMatch?typeMatch[1].trim():'';
        const critNote=isCrit?((brutCritExtra>0||demiOrcExtra>0)?' (critique + '+(brutCritExtra+demiOrcExtra)+' dé'+((brutCritExtra+demiOrcExtra)>1?'s':'')+' supplémentaire)':' (critique — dés doublés)'):'';
        dmgHtml=`<div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.1);font-size:13px">Dégâts : <span style="color:var(--text2)">${rolls.join('+')}${fixedBonus?fmt(fixedBonus):''}</span> = <b style="color:var(--cp);font-size:17px">${totalDmg}</b>${dmgType?` <span style="font-size:13px;color:var(--text3)">${esc(dmgType)}${critNote}</span>`:''}</div>`;
      }
    }
    // Châtiment divin amélioré (Paladin niv.11) : +1d8 radiant AUTO sur toute touche d'arme de corps à corps
    // (slot requis = attaque du perso, pas des entités ; mains nues exclues : pas une arme RAW)
    const _palLvlFA=(((_pa.classes||[]).find(c=>c.name==='Paladin')||{}).level)||0;
    if(!isFumble&&_palLvlFA>=11&&slot&&slot!=='ranged'&&name!=='Poing'){
      const _nd=isCrit?2:1;const _rs=[];for(let i=0;i<_nd;i++)_rs.push(Math.ceil(Math.random()*8));
      const _st=_rs.reduce((s,v)=>s+v,0);_totalDmgOut+=_st;
      dmgHtml+=`<div style="margin-top:4px;font-size:13px;color:var(--cp)">⚡ Châtiment divin amélioré : +${_nd}d8(${_rs.join('+')}) = <b>${_st}</b> radiants${isCrit?' (critique : dé doublé)':''}</div>`;
    }
    // Assassinat / Frappe meurtrière (Roublard Assassin niv.17) : rappel critique auto + total doublé si JS CON raté
    if(!isFumble&&_assSurprise){
      const _fmDD=8+pb(totalLevel(_pa))+mod((_pa.abilities||[])[1]||10);
      dmgHtml+=`<div style="margin-top:4px;font-size:13px;color:var(--arcane)">🎯 Assassinat — critique automatique (cible surprise)${_rogLvlFA>=17?`<br>🗡 Frappe meurtrière : JS CON DD ${_fmDD} — si la cible rate, dégâts DOUBLÉS = <b>${_totalDmgOut*2}</b>`:''}</div>`;
    }
    _lastRollResultHtml=`<div>⚔ ${esc(name)} — d20(${atk})${advTag}${fmt(bonus)} = <span style="font-size:15px;color:${col};font-weight:800">${total}</span>${isCrit?' 🎉 CRITIQUE!':isFumble?' 💀 FUMBLE!':''}</div>${dmgHtml}`;
    const el=document.getElementById('rollResult');
    if(el){el.style.display='block';el.innerHTML=_lastRollResultHtml;el.classList.remove('roll-flash');void el.offsetWidth;el.classList.add('roll-flash');}
    if(slot==='ranged'){const p=P();const eq=(p.equip||{})[slot];if(eq&&eq.ammoLink){const ai=(p.inventory||[]).findIndex(i=>i.name===eq.ammoLink);if(ai>=0){p.inventory[ai].qty=Math.max(0,p.inventory[ai].qty-1);if(p.inventory[ai].qty===0)showToast('⚠️ Plus de '+eq.ammoLink+' !');saveAll();}}}
    if(typeof _diceFX==='function')_diceFX(atk,{crit:isCrit,fail:isFumble,label:name});
    diceHistory.push({die:'d20',label:name,roll:atk,bonus,result:total});
    if(diceHistory.length>10)diceHistory.shift();
    if(diceOpen)renderDicePanel();
  }
  const rawRolls=rb!==null?[ra,rb]:[ra];
  if(_isHalfling(P()))_luckyCheckRolls(rawRolls,0,_finishAttack);
  else _finishAttack(rawRolls);
}
// Attaque d'opportunité (charte combat) : variante d'attaque qui consomme la jauge Réaction.
// Grisée tant que la réaction est utilisée ; la jauge se réarme au début du tour (reset éco d'action).
function rollOpportunityAttack(name,bonus,dmg,slot,dmgBonus=0,rerollLow=false){
  const p=P();if(!p)return;
  if(!p.actionEco)p.actionEco={a:false,b:false,r:false};
  if(p.actionEco.r){showToast('↪ Réaction déjà utilisée ce tour.');return;}
  p.actionEco.r=true;
  rollAttack("↪ AO — "+name,bonus,dmg,slot,dmgBonus,rerollLow,0); // rollAttack notifie déjà le MJ avec ce nom

  if(typeof _markUnsaved==='function')_markUnsaved();
  render();
}
function rollDie(d){const n=parseInt(d.replace('d',''));const r=Math.ceil(Math.random()*n);_lastRollResultHtml=`${d}: <strong>${r}</strong>`;const el=document.getElementById('rollResult');if(el){el.style.display='block';el.innerHTML=_lastRollResultHtml;el.classList.remove('roll-flash');void el.offsetWidth;el.classList.add('roll-flash');}}
function openLinkAmmoModal(){
  const p=P();const inv=(p.inventory||[]).filter(i=>i.name&&i.qty>0);
  openModal(`<div class="pt">🏹 Lier des munitions à l'arme à distance</div>
    <div style="font-size:13px;color:var(--text3);margin-bottom:10px">Sélectionnez l'objet de munitions dans votre sac :</div>
    ${inv.length?inv.map(item=>`<div class="aci" onclick="linkRangedAmmo('${jsq(item.name)}')">
      <div class="ain">${esc(item.name)}</div>
      <div class="ais">Quantité : ${item.qty}</div>
    </div>`).join(''):`<div style="font-size:13px;color:var(--text3);padding:8px">Sac vide.</div>`}
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
// Rappels d'avantage racial aux JS (contextuels — l'appli ne connaît pas la source du JS, donc on rappelle).
function _racialSaveAdvText(p,ab){
  if(!p)return[];
  const race=p.race||'',A=(''+ab).toUpperCase(),out=[];
  if(/elfe/i.test(race))out.push('contre le charme (ascendance féerique ; immunité au sommeil magique)');
  if(/halfelin/i.test(race))out.push('contre la peur (Brave)');
  if(A.includes('CON')&&(/nain/i.test(race)||/halfelin robuste/i.test(race)))out.push('contre le poison');
  if((A.includes('INT')||A.includes('SAG')||A.includes('CHA'))&&/gnome/i.test(race))out.push('contre un effet magique (Ruse gnome)');
  return out;
}
function rollSave(ab,m,advantageMode=0){
  // Épuisement niv.3+ → désavantage (avantage + désavantage = normal per D&D rules)
  const _p=P();const _exh=_p?(_p.exhaustion||0):0;
  if(_exh>=3){if(advantageMode>0)advantageMode=0;else if(advantageMode===0)advantageMode=-1;}
  const _racAdv=_racialSaveAdvText(_p,ab);
  const _racNote=_racAdv.length?`<div style="margin-top:6px;font-size:12.5px;color:#a98bdb">🧬 Avantage si ce JS est ${_racAdv.join(' ou ')}.</div>`:'';
  if(_isIRLMode()){
    const advNote=advantageMode>0?'<div style="color:var(--good);font-size:14px;margin-top:8px">🟢 AVANTAGE — 2d20, garde le plus haut</div>':advantageMode<0?'<div style="color:var(--danger);font-size:14px;margin-top:8px">🔴 DÉSAVANTAGE — 2d20, garde le plus bas</div>':'';
    const luckyNote=_isHalfling(_p)?'<div style="margin-top:6px;font-size:13px;color:#8d6e63">🍀 Si résultat = 1, vous pouvez relancer</div>':'';
    showIRLRoll(`<strong style="font-size:15px;color:var(--cp)">Jet de sauvegarde ${ab}</strong><br><span style="font-size:26px">d20 <span style="color:var(--text3)">${fmt(m)}</span></span>${advNote}${luckyNote}${_racNote}`);
    return;
  }
  let ra,rb=null;
  if(advantageMode!==0){ra=Math.ceil(Math.random()*20);rb=Math.ceil(Math.random()*20);}
  else{ra=Math.ceil(Math.random()*20);}
  function _finishSave(finalRolls){
    const fr1=finalRolls[0],fr2=finalRolls.length>1?finalRolls[1]:null;
    let r=fr1,alt=null;
    if(fr2!==null){r=advantageMode>0?Math.max(fr1,fr2):Math.min(fr1,fr2);alt=advantageMode>0?Math.min(fr1,fr2):Math.max(fr1,fr2);}
    let total=r+m;
    let auraTag='';
    const _aura=((_p&&_p.activeBuffs)||[]).find(b=>b.name==='AuraProtection');
    if(_aura&&_aura.value){total+=_aura.value;auraTag=` <span style="font-size:12px;color:var(--cp)">🛡 +${_aura.value} (aura)</span>`;}
    const altTag=alt!==null?(advantageMode>0?` <span style="color:var(--good);font-size:12px">AVT(${r},~~${alt}~~)</span>`:`<span style="color:var(--danger);font-size:12px">DES(${r},~~${alt}~~)</span>`):'';
    let piTag='';
    if(_p){const _bLvl=((_p.classes||[]).find(c=>c.name==='Barbare')||{}).level||0;if(_bLvl>=18&&ab.includes('FOR')&&total<(_p.abilities[0]||10)){piTag=` <span style="font-size:12px;color:var(--warn)">💪 →${_p.abilities[0]} (Puissance indomptable)</span>`;total=_p.abilities[0];}}
    let diamondBtn='',evasionNote='';
    if(_p){
      const _mLvl=((_p.classes||[]).find(c=>c.name==='Moine')||{}).level||0;
      const _rLvl=((_p.classes||[]).find(c=>c.name==='Rôdeur')||{}).level||0;
      if(_mLvl>=14){const _ki=(_p.combatCharges&&_p.combatCharges['Ki']!==undefined)?_p.combatCharges['Ki']:0;
        diamondBtn=` <button onclick="_diamondSoulReroll('${ab}',${m},${advantageMode})" style="margin-left:8px;padding:3px 10px;border:1px solid var(--cp);border-radius:2px;background:transparent;color:var(--cp);cursor:pointer;font-size:12.5px"${_ki<=0?' disabled':''}>🥋 Raté ? Relancer (1 ki${_ki<=0?' — épuisé':''})</button>`;}
      if((''+ab).includes('DEX')&&(_mLvl>=7||_rLvl>=7))evasionNote=`<div style="font-size:11.5px;color:#7fd1c4;margin-top:3px">🐈 Évasion : réussite = aucun dégât · échec = ½ dégâts</div>`;
    }
    if(typeof _logMJAction==='function')_logMJAction('🛡 JS '+ab+' : '+total);
    if(typeof _diceFX==='function')_diceFX(r,{crit:r===20,fail:r===1,label:'JS '+ab});
    showToast(`JS ${ab}: d20(${r})${altTag}${fmt(m)}${auraTag} = <strong>${total}</strong>${piTag}${r===20?' 🎉':r===1?' 💀':''}${diamondBtn}${evasionNote}${_racNote}`,(diamondBtn||evasionNote||_racNote)?6000:3000);
  }
  const rawRolls=rb!==null?[ra,rb]:[ra];
  if(_isHalfling(_p))_luckyCheckRolls(rawRolls,0,_finishSave);
  else _finishSave(rawRolls);
}
// Âme de diamant (Moine niv.14) — relancer un JS raté contre 1 ki (le joueur juge l'échec)
function _diamondSoulReroll(ab,m,advantageMode){
  const p=P();if(!p)return;
  const ki=(p.combatCharges&&p.combatCharges['Ki']!==undefined)?p.combatCharges['Ki']:0;
  if(ki<=0){showToast('❌ Plus de ki pour Âme de diamant !');return;}
  if(!p.combatCharges)p.combatCharges={};
  p.combatCharges['Ki']=ki-1;if(typeof _markUnsaved==='function')_markUnsaved();
  if(typeof render==='function')render();
  showToast('🥋 Âme de diamant — relance (−1 ki)',1500);
  setTimeout(()=>rollSave(ab,m,advantageMode||0),350);
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
    dmgHtml=`Dégâts : <span style="color:var(--text2)">${rolls.join('+')}${extra?fmt(extra):''}</span> = <b style="color:var(--cp);font-size:16px">${totalDmg}</b>${dmgType?` <span style="font-size:13px;color:var(--text3)">${esc(dmgType)}</span>`:''}`;
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
  if(!spells.length&&!druCircleSpells.length)return`<div style="font-size:13px;color:var(--text3);font-style:italic;padding:8px">Aucun sort enregistré.</div>`;
  const wsActive=p.wildshape?.active&&!p.wildshape?.isElemental;
  const druEntry=(p.classes||[]).find(c=>c.name==='Druide');
  const druLvl=druEntry?druEntry.level:0;
  if(wsActive&&druLvl<18)return`<div style="padding:12px;background:rgba(76,175,80,.08);border:1px solid rgba(76,175,80,.3);border-radius:2px;font-size:13px;color:var(--text3);text-align:center">🐺 En forme animale — l'incantation est impossible avant le niveau 18 (Incantation animale).</div>`;
  const wsMaterialRestrict=wsActive&&druLvl>=18;
  const materialNote=wsMaterialRestrict?`<div style="padding:8px 10px;background:rgba(76,175,80,.08);border:1px solid rgba(76,175,80,.3);border-radius:2px;font-size:13px;color:var(--text2);margin-bottom:8px">🐺 <strong>Incantation animale (niv.18)</strong> — Seuls les sorts sans composante matérielle (V/S uniquement) sont lancables en forme animale. Les sorts avec <strong style="color:var(--danger)">M</strong> sont grisés.</div>`:'';
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
  if(!Object.keys(byLvl).length)return materialNote+`<div style="font-size:13px;color:var(--text3);font-style:italic;padding:8px">Aucun sort préparé.</div>`;
  const STAR_COLORS=['#ffd700','#4fc3f7','var(--good)','#ff8a65','#ba68c8','#f06292','#4db6ac','#ff7043','var(--danger)','var(--arcane)'];
  return materialNote+Object.keys(byLvl).sort((a,b)=>a-b).map(lv=>{
    const lvInt=parseInt(lv);
    const color=STAR_COLORS[Math.min(lvInt,9)];
    const star=`<span style="color:${color};font-size:13px">★</span>`;
    const lvLabel=lv==='0'?`${star} Sorts mineurs`:`${star} Niveau ${lv}`;
    const isOpen=_spellLevelsOpen[lv]!==false;
    return`
    <div style="margin-bottom:10px">
      <div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;padding-bottom:3px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;cursor:pointer" onclick="_spellLevelsOpen['${lv}']=!(_spellLevelsOpen['${lv}']!==false);render()">
        <span>${lvLabel} <span style="color:var(--text3);font-size:13px">(${byLvl[lv].length})</span></span>
        <span style="font-size:12px;color:var(--text3)">${isOpen?'▴':'▾'}</span>
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
        const isConc=!!(d&&d.duration&&/concentration/i.test(d.duration));
        const rolls=d&&d.rolls?d.rolls:[];
        const lvi=parseInt(lv);
        const isPrepared=s.prepared||lvi===0||!prepCaster;
        const hasMComponent=wsMaterialRestrict&&components&&components.includes('M');
        return`
        <div class="sort-row"${hasMComponent?' style="opacity:0.4"':''}>
          <div class="sort-head" onclick="document.getElementById('${s.stableId}').classList.toggle('open')">
            <div style="flex:1">
              <div style="font-size:13px;font-weight:600;${!isPrepared?'color:var(--text3)':''}">${s.isCircle?'<span style="font-size:12px;color:var(--cp);margin-right:4px">⭐</span>':''}${esc(s.name)}${ritual?' <span style="font-size:12px;color:var(--cp)">(R)</span>':''}${isConc?' <span title="Concentration" style="font-size:11.5px">🔵</span>':''}${s.isCircle?'  <span style="font-size:13px;background:rgba(200,168,75,.15);color:var(--cp);border-radius:2px;padding:1px 5px">Cercle</span>':isPrepared&&lvi>0&&prepCaster?'  <span style="font-size:13px;background:rgba(76,175,80,.15);color:var(--good);border-radius:2px;padding:1px 5px">Préparé</span>':''}</div>
              ${d?`<div style="font-size:13px;color:var(--text3)">${esc(school)}${castTime?' • '+esc(castTime):''}${range?' • '+esc(range):''}</div>`:''}
            </div>
            ${damage?`<span style="font-size:13px;color:var(--cp);margin-right:6px">${esc(damage)}</span>`:''}
            ${isPrepared&&!hasMComponent?`<button class="btn bac bsm" style="flex-shrink:0;margin-right:6px" onclick="event.stopPropagation();castSpell('${jsq(s.name)}',${lvi})">⚡ Lancer</button>`:''}
            ${!combatOnly&&prepCaster&&lvi>0&&!s.isCircle?`<button class="btn bsm" style="margin-right:6px;${isPrepared?'background:rgba(76,175,80,.15);color:var(--good);border-color:var(--good)':''}" onclick="event.stopPropagation();togglePrepareSpell('${jsq(s.name)}')">${isPrepared?'✓ Prêt':'Préparer'}</button>`:''}
            <span style="color:var(--text3)">▾</span>
          </div>
          <div class="sort-body" id="${s.stableId}">
            ${d?`
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px">
                ${components?`<span style="font-size:12px;background:var(--surface2);padding:2px 7px;border-radius:2px;color:var(--text2)">${esc(components)}</span>`:''}
                ${duration?`<span style="font-size:12px;background:var(--surface2);padding:2px 7px;border-radius:2px;color:var(--text2)">⏱ ${esc(duration)}</span>`:''}
                ${isConc?`<span style="font-size:12px;background:rgba(255,213,79,.14);padding:2px 7px;border-radius:2px;color:var(--cp)">🔵 Concentration</span>`:''}
                ${ritual?`<span style="font-size:12px;background:var(--cg,rgba(200,168,75,.15));padding:2px 7px;border-radius:2px;color:var(--cp)">Rituel</span>`:''}
              </div>
              <p style="font-size:13px;color:var(--text2);line-height:1.6">${esc(desc)}</p>
              ${rolls.length>1?`<div style="margin-top:6px;font-size:13px;color:var(--text3)">Progression: ${rolls.filter(r=>r[1]).map(r=>`Niv.${r[1]}: ${r[0]}`).join(' → ')}</div>`:''}
              ${damage||d&&d.savingThrow?`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:6px">
                ${d&&d.savingThrow?`<span style="font-size:13px;padding:2px 8px;background:rgba(200,168,75,.12);border-radius:2px;color:var(--cp)">JS ${esc(d.savingThrow)} DD ${spellDC}</span>`:''}
                ${damage?`<button class="btn bsm" onclick="rollSpellPlayer('${jsq(s.name)}','${jsq(damage)}','${jsq(d&&d.savingThrow||'')}')">✨ Lancer ${esc(damage)}</button>`:''}
              </div>`:''}
            `:`<p style="font-size:13px;color:var(--text3);display:flex;align-items:center;gap:8px">Données non disponibles. <button class="btn bsm" style="font-size:12px;padding:2px 8px" onclick="loadSpellsDB(()=>render())">Charger le compendium</button></p>`}
          </div>
        </div>`;
      }).join(''):''}
    </div>`;
  }).join('');
}

function useInspirationBardique(die){
  const dieSize=parseInt(die.replace('d',''));
  if(_isIRLMode()){
    openModal(`<div class="pt">🎵 Inspiration bardique — Mode IRL</div>
      <div style="text-align:center;padding:12px 0">
        <div style="font-size:30px;margin-bottom:8px">🎵</div>
        <div style="font-size:14px;color:var(--text2);margin-bottom:4px">Lance ton dé d'inspiration :</div>
        <div style="font-size:28px;font-weight:700;color:var(--cp);margin-bottom:12px">${die}</div>
        <div style="font-size:13px;color:var(--text3);margin-bottom:14px">Entre le résultat — tu l'ajoutes à ton jet.</div>
        <input class="fi" id="inspIRLInput" type="number" min="1" max="${dieSize}" style="text-align:center;font-size:16px;margin-bottom:14px">
        <div style="display:flex;gap:8px">
          <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
          <button class="btn bac" style="flex:2" onclick="(()=>{const v=parseInt(document.getElementById('inspIRLInput').value)||0;if(v<1)return;discardInspirationBardique();closeModal();showToast('🎵 Inspiration : <strong>+'+v+'</strong> à ajouter à ton jet !',3500);})()">✓ Utiliser</button>
        </div>
      </div>`);
  }else{
    const roll=Math.ceil(Math.random()*dieSize);
    discardInspirationBardique();
    showToast(`🎵 Inspiration bardique : ${die}(${roll}) — ajoute <strong>+${roll}</strong> à ton jet !`,3500);
  }
}
function discardInspirationBardique(){
  const p=P();
  p.activeBuffs=(p.activeBuffs||[]).filter(b=>b.name!=='InspirationBardique');
  saveAll();
  if(typeof currentUser!=='undefined'&&currentUser&&typeof currentCampaignId!=='undefined'&&currentCampaignId){
    fbDb.collection('characters').doc(currentUser.uid+'_'+currentCampaignId)
      .update({'characterData.activeBuffs':p.activeBuffs}).catch(()=>{});
  }
  render();
}
function rollSupportBuff(buffName,die,consume){
  const dieSize=parseInt(die.replace('d',''));
  if(_isIRLMode()){
    openModal(`<div class="pt">🎲 ${buffName==='Benediction'?'Bénédiction':'Assistance'} — Mode IRL</div><div style="text-align:center;padding:12px 0"><div style="font-size:14px;color:var(--text2);margin-bottom:8px">Lance ton <strong style="color:var(--cp)">${die}</strong> et note le résultat.</div><div style="font-size:28px;font-weight:700;color:var(--cp);margin-bottom:12px">${die}</div><div style="display:flex;gap:8px;justify-content:center"><button class="btn bac" onclick="${consume?`removeSupportBuff('${buffName}');`:''}closeModal()">✓ Noté</button></div></div>`);
  }else{
    const roll=Math.ceil(Math.random()*dieSize);
    if(consume)removeSupportBuff(buffName);
    showToast(`${buffName==='Benediction'?'✨ Bénédiction':'🤝 Assistance'} : d4 = <strong>+${roll}</strong> à ajouter à ton jet !`,3000);
  }
}
function removeSupportBuff(buffName){
  const p=P();
  p.activeBuffs=(p.activeBuffs||[]).filter(b=>b.name!==buffName);
  saveAll();
  if(typeof currentUser!=='undefined'&&currentUser&&typeof currentCampaignId!=='undefined'&&currentCampaignId){
    fbDb.collection('characters').doc(currentUser.uid+'_'+currentCampaignId)
      .update({'characterData.activeBuffs':p.activeBuffs}).catch(()=>{});
  }
  render();
}

function togglePrepareSpell(name){
  const p=P();
  if(!p.spells)return;
  const s=p.spells.find(x=>x.name===name);
  if(s)s.prepared=!s.prepared;
  saveAll();render();
}



// ═══════════════════════════════════════
