function mjTabCombat(){
  const sorted=_mjCombatStarted?[..._mjCombatants].sort((a,b)=>b.initiative-a.initiative):_mjCombatants;
  const currentC=_mjCombatStarted&&sorted.length?sorted[_mjCurrentTurn%sorted.length]:null;

  const combatantRows=sorted.length?sorted.map((c,i)=>{
    const realIdx=_mjCombatants.indexOf(c);
    const isActive=_mjCombatStarted&&(i===_mjCurrentTurn%sorted.length);
    const isDead=c.hp<=0;
    const hpPct=c.hpMax?Math.max(0,Math.min(100,c.hp/c.hpMax*100)):0;
    const hpColor=hpPct>50?'#4caf50':hpPct>25?'#ff9800':'#e53935';
    const condHtml=c.conditions&&c.conditions.length?`<div style="margin-top:3px">${c.conditions.map((cd,ci)=>`<span class="status-badge malus" style="cursor:pointer" onclick="mjRemoveCond(${realIdx},${ci})">⚠ ${esc(cd)} ✕</span>`).join('')}</div>`:'';
    const speedHtml=c.speed?`<div style="font-size:15px;color:var(--text3);margin-top:1px">🚶 ${esc(c.speed)}</div>`:'';
    const ds=c.deathSaves||{success:0,fail:0};
    const dsaveHtml=isDead&&c.isPlayer?`<div style="margin-top:4px;display:flex;gap:4px;align-items:center;flex-wrap:wrap"><span style="font-size:15px;color:var(--text3)">JS mort :</span><span style="color:#4caf50;font-size:17px">${Array.from({length:3},(_,i)=>`<span style="opacity:${ds.success>i?1:0.3}">●</span>`).join('')}</span><span style="color:#e53935;font-size:17px">${Array.from({length:3},(_,i)=>`<span style="opacity:${ds.fail>i?1:0.3}">●</span>`).join('')}</span><button class="btn bsm" style="font-size:13px;padding:1px 4px;color:#4caf50;border-color:#4caf50" onclick="mjDsave(${realIdx},'success')">✓</button><button class="btn bsm" style="font-size:13px;padding:1px 4px;color:#e53935;border-color:#e53935" onclick="mjDsave(${realIdx},'fail')">✕</button><button class="btn bsm" style="font-size:13px;padding:1px 4px" onclick="mjDsave(${realIdx},'reset')">↺</button></div>`:'';
    const isSurprised=!!c.surprised;
    const surprisedBadge=isSurprised?`<span style="font-size:15px;background:rgba(229,57,53,.15);color:#e53935;border:1px solid rgba(229,57,53,.4);border-radius:6px;padding:1px 6px;margin-left:4px;vertical-align:middle">😵 SURPRIS</span>`:'';
    return`<div class="combat-row${isActive?' active-turn':''}${isDead?' dead':''}" style="${isSurprised?'border-left:3px solid #e53935;padding-left:6px;':''}">
      ${_mjCombatStarted?`<div style="width:34px;text-align:center;cursor:pointer" title="Cliquer pour modifier" onclick="mjEditInitiative(${realIdx})"><span style="font-family:var(--F);font-size:19px;color:var(--cp);border-bottom:1px dashed rgba(200,168,75,.4)">${c.initiative||0}</span></div>`:''}
      <div style="width:26px;text-align:center;font-size:25px">${c.isPlayer?(c.avatar||'⚔'):'👾'}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:18px;font-weight:600;color:${isActive?'var(--cp)':'var(--text)'}">${esc(c.name)}${isActive?' ◀':''}${surprisedBadge}</div>
        ${speedHtml}${condHtml}${dsaveHtml}
      </div>
      <div class="cbt-actions" style="display:flex;align-items:center;gap:4px">
        <div style="text-align:center;min-width:60px">
          <div style="font-size:17px;color:${hpColor};font-weight:600">${isDead?'💀 À terre':c.hp+'/'+c.hpMax}</div>
          <div class="hp-bar" style="width:60px"><div class="hp-fill" style="width:${hpPct}%;background:${hpColor}"></div></div>
        </div>
        <button class="btn bsm" style="padding:2px 7px;font-size:19px" onclick="mjHpChange(${realIdx},-1)">−</button>
        <button class="btn bsm" style="padding:2px 7px;font-size:19px" onclick="mjHpChange(${realIdx},1)">+</button>
        <button class="btn bsm" style="font-size:15px;padding:2px 6px" onclick="mjOpenHpModal(${realIdx})">✏</button>
        <button class="btn bsm" style="font-size:15px;padding:2px 6px" onclick="mjOpenCondModal(${realIdx})">⚠</button>
        <button class="btn bsm" style="font-size:15px;padding:2px 6px${isSurprised?';background:rgba(229,57,53,.15);border-color:#e53935;color:#e53935':''}" onclick="mjToggleSurprise(${realIdx})" title="Basculer état : Surpris">😵</button>
        <button class="btn bsm" style="font-size:15px;padding:2px 6px;border-color:var(--cp);color:var(--cp)" onclick="mjOpenCombatDice(${realIdx})">🎲</button>
        <button class="btn bsm" style="font-size:15px;padding:2px 6px;color:#e53935;border-color:#e53935" onclick="mjRemoveCombatant(${realIdx})">✕</button>
        ${isActive?`<button class="btn bsm" style="font-size:15px;padding:2px 8px;border-color:#7c3aed;color:#a78bfa;font-weight:600" onclick="mjNextTurn()">⏩</button>`:''}
      </div>
      <div style="width:36px;text-align:center;font-size:17px;color:var(--text3)">CA ${c.ac||0}</div>
    </div>`;
  }).join(''):`<div style="color:var(--text3);font-style:italic;font-size:18px;text-align:center;padding:16px">Aucun combattant. Ajoutez des joueurs ou des monstres.</div>`;

  const logHtml=_mjCombatLog.length?`<div class="pt" style="margin-top:12px">📜 Journal de combat</div>
    <div class="mj-log">${[..._mjCombatLog].reverse().map(l=>`<div class="mj-log-entry">${l}</div>`).join('')}</div>`:'';

  return`<div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">
      <button class="btn bsm bprimary" onclick="mjAddAllToCombat()">⚔ Ajouter joueurs</button>
      <button class="btn bsm bprimary" onclick="mjOpenAddMonster()">🐉 Ajouter monstre</button>
      ${!_mjCombatStarted&&_mjCombatants.length?`<button class="btn bsm" style="border-color:#ffd54f;color:#ffd54f" onclick="mjStartCombat()">🎲 Lancer l'initiative</button>`:''}
      ${_mjCombatStarted?`<button class="btn bsm" style="border-color:var(--cp);color:var(--cp)" onclick="mjNextTurn()">▶ Tour suivant</button>
        <button class="btn bsm" style="border-color:#4caf50;color:#4caf50" onclick="mjEndCombat()">🏁 Fin du combat</button>
        <div style="display:flex;align-items:center;gap:6px;padding:4px 10px;background:var(--surface2);border:1px solid var(--border);border-radius:6px;font-size:18px">
          🔄 Round <strong style="color:var(--cp)">${_mjRound}</strong>
          ${currentC?` — Tour de <strong style="color:var(--cp)">${esc(currentC.name)}</strong>`:''}
        </div>`:''}
      ${_mjCombatants.length?`<button class="btn bsm" style="border-color:#e53935;color:#e53935" onclick="mjResetCombat()">🗑 Réinitialiser</button>`:''}
    </div>
    ${combatantRows}
    ${logHtml}
  </div>`;
}

function _extractPlayerCombatData(p){
  const lvl=totalLevel(p);
  const ab=p.abilities||[10,10,10,10,10,10];
  const mods=ab.map(v=>Math.floor((v-10)/2));
  const forM=mods[0],dexM=mods[1];
  const profB=pb(lvl);
  const attacks=[];
  ['mainhand','offhand','ranged'].forEach(slot=>{
    const w=(p.equip||{})[slot];
    if(!w||!w.name)return;
    const isRanged=slot==='ranged';
    const srdW=findSRDWeapon(w.name);
    if(srdW){
      const finesse=(srdW.properties||'').includes('Finesse');
      const atkM=finesse?Math.max(forM,dexM):isRanged?dexM:forM;
      const dmgParts=(srdW.damage||'1d6').split(' ');
      attacks.push({name:w.name,atkBonus:profB+atkM,dmgDice:dmgParts[0]||'1d6',dmgBonus:atkM,dmgType:dmgParts.slice(1).join(' '),range:isRanged?'Distance':'Corps à corps'});
    }else{
      // Arme personnalisée : extraire dés depuis la desc si possible
      const diceMatch=(w.desc||'').match(/(\d+d\d+)/);
      const atkM=isRanged?dexM:forM;
      attacks.push({name:w.name,atkBonus:profB+atkM,dmgDice:diceMatch?diceMatch[1]:'1d6',dmgBonus:atkM,dmgType:'',range:isRanged?'Distance':'Corps à corps'});
    }
  });
  const spells=(p.spells||[]).map(s=>({name:s.name,level:s.level||0,desc:''}));
  const traits=(p.features||[]).filter(f=>f.name).map(f=>({name:f.name,desc:f.desc||''}));
  return {attacks,spells,traits};
}

function mjAddPlayerToCombat(idx){
  const pp=_mjPlayersData[idx];
  if(!pp)return;
  const p=pp.charData||{};
  if(_mjCombatants.find(c=>c.uid===pp.uid)){showToast('Déjà dans le combat.');return;}
  const mods=(p.abilities||[0,0,0,0,0,0]).map(v=>Math.floor((v-10)/2));
  const {attacks,spells,traits}=_extractPlayerCombatData(p);
  _mjCombatants.push({id:'player_'+pp.uid,name:p.charName||pp.playerName||'Joueur',hp:p.hp||p.hpMax||1,hpMax:p.hpMax||1,ac:p.ac||10,speed:(p.speed!=null?p.speed:9)+'m',initiative:0,dexMod:mods[1]||0,conditions:[],deathSaves:p.deathSaves||{success:0,fail:0},surprised:false,isPlayer:true,reflexesVoleur:(p.features||[]).some(f=>f.name==='Réflexes de voleur'),avatar:pp.avatar||'⚔',uid:pp.uid,abilities:p.abilities||[10,10,10,10,10,10],attacks,spells,traits});
  _mjCombatLog.push(`⚔ ${esc(p.charName||pp.playerName)} ajouté au combat.`);
  renderMJContent();
}

function mjAddFamiliarToCombat(playerIdx){
  const pp=_mjPlayersData[playerIdx];if(!pp)return;
  const fam=(pp.charData||{}).familiar;if(!fam?.active){showToast('❌ Ce joueur n\'a pas de familier actif.');return;}
  const famId='familiar_'+pp.uid;
  if(_mjCombatants.find(c=>c.id===famId)){showToast('🦉 Déjà dans le combat.');return;}
  const mods=(fam.ab||[]).map(v=>Math.floor((v-10)/2));
  _mjCombatants.push({
    id:famId,name:fam.name+' (familier de '+((pp.charData||{}).charName||pp.playerName||'joueur')+')',
    hp:fam.hpCur,hpMax:fam.hpMax,ac:fam.ac,speed:fam.speed||'?',
    initiative:0,dexMod:mods[1]||0,conditions:[],isPlayer:false,avatar:fam.icon||'🦉',
    abilities:fam.ab||[10,10,10,10,10,10],
    attacks:fam.attacks||[],spells:[],
    traits:(fam.traits||[]).map(t=>({name:'Trait',desc:t,uses:0,dice:''})),
  });
  _mjCombatLog.push(`🦉 ${esc(fam.name)} (familier) ajouté au combat.`);
  renderMJContent();showToast(`🦉 ${fam.name} ajouté au combat !`);
}
// ─── AUTO-SYNC DES FAMILIERS AU TRACKER (Fondation 5 — principes 21/28) ───
// « Familier » = terme générique (tout être vivant contrôlé). Un familier ACTIF apparaît
// tout seul dans le combat (y compris invoqué en plein combat) ; renvoyé/mort côté joueur
// → retiré ; le MJ peut le retirer ("kick") → il ne réapparaît pas tant qu'il reste actif.
let _mjKickedFamiliars=new Set();
function _mjSyncFamiliars(){
  if(!_mjCombatStarted)return false;
  let changed=false;
  const activeIds=new Set();
  // Sources de "familiers" (terme générique) — extensible au fil du BLOC 3 (défenseur, canon, mort-vivant…)
  const _petsOf=pp=>{
    const cd=pp.charData||{};const owner=cd.charName||pp.playerName||'joueur';const out=[];
    if(cd.familiar)out.push({fam:cd.familiar,id:'familiar_'+pp.uid,kind:'familier',uid:pp.uid,owner});
    if(cd.beastCompanion)out.push({fam:cd.beastCompanion,id:'companion_'+pp.uid,kind:'compagnon',uid:pp.uid,owner});
    return out;
  };
  (_mjPlayersData||[]).forEach(pp=>{
    _petsOf(pp).forEach(({fam,id,kind,uid,owner})=>{
      if(!fam||!fam.active)return;
      activeIds.add(id);
      if(_mjKickedFamiliars.has(id))return;
      const present=_mjCombatants.findIndex(c=>c.id===id);
      if(present<0){
        const mods=(fam.ab||[]).map(v=>Math.floor((v-10)/2));
        _mjCombatants.push({
          id,name:fam.name+' ('+kind+' de '+owner+')',
          hp:fam.hpCur,hpMax:fam.hpMax,ac:fam.ac,speed:fam.speed||'?',
          initiative:Math.ceil(Math.random()*20)+(mods[1]||0),
          dexMod:mods[1]||0,conditions:[],isPlayer:false,isFamiliar:true,ownerUid:uid,
          avatar:fam.icon||'🦉',abilities:fam.ab||[10,10,10,10,10,10],attacks:fam.attacks||[],spells:[],
          traits:(fam.traits||[]).map(t=>typeof t==='string'?{name:'Trait',desc:t,uses:0,dice:''}:t),
        });
        _mjCombatLog.push(`🦉 ${esc(fam.name)} (${kind}) rejoint le combat.`);
        changed=true;
      }else{
        const c=_mjCombatants[present];
        if(c.hp!==fam.hpCur||c.hpMax!==fam.hpMax){c.hp=fam.hpCur;c.hpMax=fam.hpMax;changed=true;}
      }
    });
  });
  // Retire les pets dont la source n'est plus active + nettoie la garde "kick"
  for(let i=_mjCombatants.length-1;i>=0;i--){
    const c=_mjCombatants[i];
    if(c.isFamiliar&&!activeIds.has(c.id)){_mjCombatants.splice(i,1);changed=true;}
  }
  _mjKickedFamiliars.forEach(id=>{if(!activeIds.has(id))_mjKickedFamiliars.delete(id);});
  if(changed&&typeof _mjPersistCombat==='function')_mjPersistCombat();
  return changed;
}
function mjAddAllToCombat(){
  _mjPlayersData.forEach((_,i)=>mjAddPlayerToCombat(i));
}

function mjFillFromNPC(idx){
  const n=_mjNPCs[idx];if(!n)return;
  const nameEl=document.getElementById('mAdd_name');
  const hpEl=document.getElementById('mAdd_hp');
  const acEl=document.getElementById('mAdd_ac');
  if(nameEl)nameEl.value=n.name||'';
  if(hpEl)hpEl.value=n.hp||10;
  if(acEl)acEl.value=n.ac||13;
  _mjNewMonsterAttacks=Array.isArray(n.attacks)?n.attacks.map(a=>({...a})):[];
  _mjNewMonsterSpells=Array.isArray(n.spells)?n.spells.map(s=>({...s})):[];
  _mjNewMonsterTraits=Array.isArray(n.traits)?n.traits.map(t=>({...t})):[];
  if(typeof n.attacks==='string'&&n.attacks)_mjNewMonsterTraits.unshift({name:'Attaques',desc:n.attacks});
  if(n.notes&&!Array.isArray(n.traits))_mjNewMonsterTraits.push({name:'Notes',desc:n.notes});
  mjRenderAttacksList();mjRenderSpellsList();mjRenderTraitsList();
  showToast('✓ '+esc(n.name)+' chargé — ajustez si besoin.');
}

function mjOpenAddMonster(){
  _mjNewMonsterAttacks=[];_mjNewMonsterSpells=[];_mjNewMonsterTraits=[];_mjEditingMonsterIdx=-1;
  window._mjPendingAbilities=null;
  const npcSection=_mjNPCs.length?`<div style="margin-bottom:12px;padding:8px;background:var(--surface2);border:1px solid var(--border);border-radius:8px">
      <div style="font-size:17px;font-weight:600;color:var(--cp);margin-bottom:6px">👤 Mes PNJ (${_mjNPCs.length})</div>
      <div style="max-height:90px;overflow-y:auto">${_mjNPCs.map((n,ni)=>`<div class="aci" onclick="mjFillFromNPC(${ni})" style="padding:5px 8px">
        <div class="ain">${esc(n.name||'?')}</div>
        <div class="ais">PV ${n.hp||'?'} · CA ${n.ac||'?'}</div>
      </div>`).join('')}</div>
    </div>`:'';
  const compSection=MONSTERS_DB
    ?`<div style="margin-bottom:12px;padding:8px;background:var(--surface2);border:1px solid var(--border);border-radius:8px">
        <div style="font-size:17px;font-weight:600;color:var(--cp);margin-bottom:6px">📚 Compendium (${MONSTERS_DB.length} monstres)</div>
        <input class="fi" id="monSearch" placeholder="Rechercher : Gobelin, Dragon..." oninput="mjFilterMonsters(this.value)" onfocus="mjFilterMonsters(this.value)" style="margin-bottom:4px">
        <div id="monResults" style="max-height:120px;overflow-y:auto"></div>
      </div>`
    :`<div style="text-align:center;margin-bottom:10px">
        <button class="btn bsm bprimary" onclick="loadMonstersDB(()=>{closeModal();mjOpenAddMonster()})">📚 Charger le compendium de monstres</button>
      </div>`;
  openWideModal(`<div class="pt">🐉 Ajouter au combat</div>
    ${npcSection}${compSection}
    <div class="fl mb6">Nom</div><input class="fi" id="mAdd_name" placeholder="Gobelin, Dragon Rouge..." style="margin-bottom:8px">
    <div class="g2" style="gap:8px;margin-bottom:8px">
      <div><div class="fl mb6">PV max</div><input class="fi" id="mAdd_hp" type="number" min="1" value="10"></div>
      <div><div class="fl mb6">CA</div><input class="fi" id="mAdd_ac" type="number" min="0" value="13"></div>
    </div>
    <div class="g2" style="gap:8px;margin-bottom:16px">
      <div><div class="fl mb6">Initiative (bonus DEX)</div><input class="fi" id="mAdd_init" type="number" value="0"></div>
      <div><div class="fl mb6">Nombre</div><input class="fi" id="mAdd_qty" type="number" min="1" max="20" value="1"></div>
    </div>
    <div style="border-top:1px solid var(--border);padding-top:12px;margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="font-size:18px;font-weight:700;color:var(--text2)">⚔ Attaques</div>
        <button class="btn bsm" onclick="mjToggleMonsterSubForm('mAttForm')">+ Ajouter</button>
      </div>
      <div id="mAttForm" style="display:none;background:var(--surface2);border-radius:8px;padding:10px;margin-bottom:8px">
        <input class="fi" id="mAtt_name" placeholder="Nom (ex: Cimeterre, Arc court...)" style="margin-bottom:6px">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:6px">
          <div><div style="font-size:15px;color:var(--text3);margin-bottom:3px">Bonus attaque</div><input class="fi" id="mAtt_bonus" type="number" value="0"></div>
          <div><div style="font-size:15px;color:var(--text3);margin-bottom:3px">Dés de dégâts</div><input class="fi" id="mAtt_dice" placeholder="1d6" value="1d6"></div>
          <div><div style="font-size:15px;color:var(--text3);margin-bottom:3px">Bonus dégâts</div><input class="fi" id="mAtt_dmgBonus" type="number" value="0"></div>
        </div>
        <div class="g2" style="gap:6px;margin-bottom:8px">
          <div><div style="font-size:15px;color:var(--text3);margin-bottom:3px">Type de dégâts</div><input class="fi" id="mAtt_type" placeholder="tranchant, feu..."></div>
          <div><div style="font-size:15px;color:var(--text3);margin-bottom:3px">Portée (optionnel)</div><input class="fi" id="mAtt_range" placeholder="1.5m / 18/72m"></div>
        </div>
        <button class="btn bac bsm" style="width:100%" onclick="mjConfirmAddFormAttack()">✓ Confirmer cette attaque</button>
      </div>
      <div id="mAdd_attacksList"><div style="font-size:17px;color:var(--text3);font-style:italic;padding:4px 0">Aucune attaque définie</div></div>
    </div>
    <div style="border-top:1px solid var(--border);padding-top:12px;margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="font-size:18px;font-weight:700;color:var(--text2)">✦ Sorts & Pouvoirs</div>
        <button class="btn bsm" onclick="mjToggleMonsterSubForm('mSpForm')">+ Ajouter</button>
      </div>
      <div id="mSpForm" style="display:none;background:var(--surface2);border-radius:8px;padding:10px;margin-bottom:8px">
        <div style="position:relative;margin-bottom:8px">
          <input class="fi" id="mjSpSearchQ" placeholder="🔍 Chercher dans le compendium..." oninput="_mjSpellSearch(this.value)" onfocus="_mjSpellSearch(this.value)" autocomplete="off" onblur="setTimeout(()=>{const r=document.getElementById('mjSpSearchRes');if(r)r.style.display='none';},150)">
          <div id="mjSpSearchRes" style="display:none;position:absolute;top:100%;left:0;right:0;z-index:200;background:var(--surface);border:1px solid rgba(200,168,75,.4);border-radius:0 0 6px 6px;max-height:200px;overflow-y:auto;box-shadow:0 4px 16px rgba(0,0,0,.5)"></div>
        </div>
        <input class="fi" id="mSp_name" placeholder="Nom du sort (ex: Boule de feu)" style="margin-bottom:6px">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:6px">
          <div><div style="font-size:15px;color:var(--text3);margin-bottom:3px">Niveau sort</div><input class="fi" id="mSp_level" type="number" value="1" min="0" max="9"></div>
          <div><div style="font-size:15px;color:var(--text3);margin-bottom:3px">Stat sauvegarde</div><input class="fi" id="mSp_saveStat" placeholder="DEX, CON..."></div>
          <div><div style="font-size:15px;color:var(--text3);margin-bottom:3px">DD sauvegarde</div><input class="fi" id="mSp_saveDC" type="number" value="13" min="0"></div>
        </div>
        <div class="g2" style="gap:6px;margin-bottom:6px">
          <div><div style="font-size:15px;color:var(--text3);margin-bottom:3px">Dés de dégâts</div><input class="fi" id="mSp_dice" placeholder="8d6, 2d8..."></div>
          <div><div style="font-size:15px;color:var(--text3);margin-bottom:3px">Type de dégâts</div><input class="fi" id="mSp_type" placeholder="feu, foudre..."></div>
        </div>
        <div><div style="font-size:15px;color:var(--text3);margin-bottom:3px">Description (optionnel)</div><textarea class="fi" id="mSp_desc" rows="2" placeholder="Zone 6m, chaque créature doit réussir un JS..." style="resize:vertical;margin-bottom:8px"></textarea></div>
        <button class="btn bac bsm" style="width:100%" onclick="mjConfirmAddFormSpell()">✓ Confirmer ce sort</button>
      </div>
      <div id="mAdd_spellsList"><div style="font-size:17px;color:var(--text3);font-style:italic;padding:4px 0">Aucun sort défini</div></div>
    </div>
    <div style="border-top:1px solid var(--border);padding-top:12px;margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="font-size:18px;font-weight:700;color:var(--text2)">📜 Traits & Capacités passives</div>
        <button class="btn bsm" onclick="mjToggleMonsterSubForm('mTrForm')">+ Ajouter</button>
      </div>
      <div id="mTrForm" style="display:none;background:var(--surface2);border-radius:8px;padding:10px;margin-bottom:8px">
        <input class="fi" id="mTr_name" placeholder="Nom (ex: Vision dans le noir, Résistance au feu...)" style="margin-bottom:6px">
        <textarea class="fi" id="mTr_desc" rows="2" placeholder="Description du trait ou de la capacité..." style="resize:vertical;margin-bottom:6px"></textarea>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px">
          <div><div style="font-size:15px;color:var(--text3);margin-bottom:3px">Charges (0=passif)</div><input class="fi" id="mTr_uses" type="number" min="0" value="0"></div>
          <div><div style="font-size:15px;color:var(--text3);margin-bottom:3px">Récupération</div><select class="fi" id="mTr_recovery"><option value="passive">Passif</option><option value="short">Repos court</option><option value="long">Repos long</option></select></div>
          <div><div style="font-size:15px;color:var(--text3);margin-bottom:3px">Dé (ex: 2d6+3)</div><input class="fi" id="mTr_dice" placeholder="2d6+3"></div>
        </div>
        <button class="btn bac bsm" style="width:100%" onclick="mjConfirmAddFormTrait()">✓ Confirmer ce trait</button>
      </div>
      <div id="mAdd_traitsList"><div style="font-size:17px;color:var(--text3);font-style:italic;padding:4px 0">Aucun trait défini</div></div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="mjConfirmAddMonster()">➕ Ajouter au combat</button>
    </div>`);
}

function mjFilterMonsters(q){
  const el=document.getElementById('monResults');if(!el||!MONSTERS_DB)return;
  if(!q.trim()){
    const sorted=MONSTERS_DB.map((m,i)=>({i,m})).sort((a,b)=>(a.m.n||'').localeCompare(b.m.n||'')).slice(0,15);
    el.innerHTML=sorted.map(({i,m})=>`<div class="charlib-item" style="padding:5px 8px;cursor:pointer" onclick="mjFillMonster(${i})"><div style="flex:1"><div style="font-size:18px;font-weight:600">${esc(m.n)}</div><div style="font-size:17px;color:var(--text3)">CR ${m.cr||'?'} — CA ${m.ac||'?'} — ${m.hp||'?'} PV — ${m.t||''}</div></div><span style="color:var(--cp);font-size:17px">↑ Remplir</span></div>`).join('');return;}
  const low=q.toLowerCase();
  const res=[];
  for(let i=0;i<MONSTERS_DB.length;i++){
    if(MONSTERS_DB[i].n&&MONSTERS_DB[i].n.toLowerCase().includes(low))res.push({i,m:MONSTERS_DB[i]});
  }
  res.sort((a,b)=>(a.m.n||'').localeCompare(b.m.n||''));
  const res20=res.slice(0,20);
  el.innerHTML=res20.length?res20.map(({i,m})=>`<div class="charlib-item" style="padding:5px 8px;cursor:pointer" onclick="mjFillMonster(${i})">
    <div style="flex:1">
      <div style="font-size:18px;font-weight:600">${esc(m.n)}</div>
      <div style="font-size:17px;color:var(--text3)">CR ${m.cr||'?'} — CA ${m.ac||'?'} — ${m.hp||'?'} PV — ${m.t||''}</div>
    </div>
    <span style="color:var(--cp);font-size:17px">↑ Remplir</span>
  </div>`).join(''):'<div style="font-size:18px;color:var(--text3);text-align:center;padding:6px">Aucun résultat</div>';
}

function mjFillMonster(idx){
  const m=MONSTERS_DB[idx];if(!m)return;
  const ac=parseInt(m.ac)||13;
  const hp=parseInt(m.hp)||10;
  const dexMod=Math.floor(((parseInt(m.dex)||10)-10)/2);
  window._mjPendingAbilities=[
    parseInt(m.str)||10,parseInt(m.dex)||10,parseInt(m.con)||10,
    parseInt(m.int)||10,parseInt(m.wis)||10,parseInt(m.cha)||10
  ];
  const nameEl=document.getElementById('mAdd_name');
  const hpEl=document.getElementById('mAdd_hp');
  const acEl=document.getElementById('mAdd_ac');
  const initEl=document.getElementById('mAdd_init');
  if(nameEl)nameEl.value=m.n||'';
  if(hpEl)hpEl.value=hp;
  if(acEl)acEl.value=ac;
  if(initEl)initEl.value=dexMod;
  // Auto-populate attacks from compendium acts field
  _mjNewMonsterAttacks=[];
  const _specialActions=[];
  const acts=Array.isArray(m.acts)?m.acts:(m.acts?[m.acts]:[]);
  acts.forEach(act=>{
    if(!act.n)return;
    // Ignorer les règles variantes (Variant: ...)
    if(act.n.startsWith('Variant:'))return;
    if(!act.atk){
      // Action sans jet d'attaque → trait/action spéciale
      _specialActions.push(act.n);
      return;
    }
    const parts=act.atk.split('|');
    if(parts.length<3)return;
    const bonus=parseInt(parts[1])||0;
    const dmgStr=(parts[2]||'1d4').trim();
    const dmgMatch=dmgStr.match(/^(\d+d\d+)([+-]\d+)?/);
    if(!dmgMatch)return;
    _mjNewMonsterAttacks.push({name:act.n||parts[0]||'Attaque',atkBonus:bonus,dmgDice:dmgMatch[1],dmgBonus:parseInt(dmgMatch[2])||0,dmgType:'',range:''});
  });
  // Auto-populate traits from monster JSON fields
  _mjNewMonsterTraits=[];
  const _feetToM=s=>s.replace(/(\d+) ft\./g,(_,n)=>Math.round(parseInt(n)*0.3)+'m');
  if(m.res&&m.res.trim())_mjNewMonsterTraits.push({name:'Résistances',desc:m.res});
  if(m.imm&&m.imm.trim())_mjNewMonsterTraits.push({name:'Immunités aux dégâts',desc:m.imm});
  if(m.ci&&m.ci.trim())_mjNewMonsterTraits.push({name:'Immunités aux conditions',desc:m.ci});
  if(m.sen&&m.sen.trim())_mjNewMonsterTraits.push({name:'Sens',desc:_feetToM(m.sen)});
  if(m.sv&&m.sv.trim())_mjNewMonsterTraits.push({name:'Jets de sauvegarde',desc:m.sv});
  if(m.sk&&m.sk.trim())_mjNewMonsterTraits.push({name:'Compétences',desc:m.sk});
  if(m.spd&&m.spd.trim()&&m.spd!=='walk 30 ft.')_mjNewMonsterTraits.push({name:'Vitesse',desc:_feetToM(m.spd)});
  // Actions spéciales (actes sans jet d'attaque) → traits
  _specialActions.forEach(n=>{
    const lc=n.toLowerCase();
    const desc=lc.includes('multiattack')||lc.includes('multiattaque')?'Effectue plusieurs attaques par action (voir manuel).':lc.includes('spellcasting')||lc.includes('innate')?'⚠ Lanceur de sorts — ajoutez les sorts manuellement ci-dessous.':'Action spéciale (voir manuel).';
    _mjNewMonsterTraits.push({name:n,desc});
  });
  _mjNewMonsterSpells=[];
  mjRenderAttacksList();mjRenderSpellsList();mjRenderTraitsList();
  // Avertissement si le monstre semble être un lanceur de sorts
  const likelyCaster=_specialActions.some(n=>/spellcast|innate|spell/i.test(n))||/mage|sorcier|lich|archimage|wizard|cleric|shaman|druid|warlock|witch|archmage/i.test(m.n+' '+m.t);
  const res=document.getElementById('monResults');
  const info=(_mjNewMonsterAttacks.length?_mjNewMonsterAttacks.length+' att.':'')+(_mjNewMonsterTraits.length?(_mjNewMonsterAttacks.length?' · ':'')+_mjNewMonsterTraits.length+' trait(s)':'');
  const spellWarn=likelyCaster?'<div style="font-size:15px;color:#ffd54f;text-align:center;margin-top:2px">⚠ Ce monstre a probablement des sorts — à ajouter manuellement.</div>':'';
  if(res)res.innerHTML='<div style="font-size:17px;color:var(--cp);text-align:center;padding:4px">✅ "'+esc(m.n)+'" importé'+(info?' ('+info+')':'')+'</div>'+spellWarn;
}

function mjConfirmAddMonster(){
  const name=(document.getElementById('mAdd_name').value||'Monstre').trim();
  const hp=parseInt(document.getElementById('mAdd_hp').value)||10;
  const ac=parseInt(document.getElementById('mAdd_ac').value)||13;
  const initBonus=parseInt(document.getElementById('mAdd_init').value)||0;
  const qty=Math.max(1,Math.min(20,parseInt(document.getElementById('mAdd_qty').value)||1));
  const abilities=window._mjPendingAbilities||[10,10,10,10,10,10];
  window._mjPendingAbilities=null;
  const attacks=[..._mjNewMonsterAttacks];
  const spells=[..._mjNewMonsterSpells];
  const traits=[..._mjNewMonsterTraits];
  _mjNewMonsterAttacks=[];_mjNewMonsterSpells=[];_mjNewMonsterTraits=[];
  for(let i=0;i<qty;i++){
    const label=qty>1?name+' '+(i+1):name;
    _mjCombatants.push({id:'monster_'+Date.now()+'_'+i,name:label,hp,hpMax:hp,ac,initiative:0,dexMod:initBonus,conditions:[],surprised:false,isPlayer:false,abilities:[...abilities],attacks,spells,traits});
  }
  _mjCombatLog.push(`👾 ${qty>1?qty+'× ':''}"${esc(name)}" ajouté(s) au combat.`);
  closeModal();renderMJContent();
}

function mjToggleMonsterSubForm(id){
  const el=document.getElementById(id);if(!el)return;
  el.style.display=el.style.display==='none'?'block':'none';
}

function _mjFindListEl(addId,edId){return document.getElementById(addId)||document.getElementById(edId);}

function mjRenderAttacksList(){
  const el=_mjFindListEl('mAdd_attacksList','mEd_attacksList');if(!el)return;
  el.innerHTML=_mjNewMonsterAttacks.length
    ?_mjNewMonsterAttacks.map((a,i)=>`<div style="display:flex;align-items:center;gap:6px;padding:6px 8px;background:rgba(255,255,255,.04);border-radius:6px;margin-bottom:4px">
        <span>⚔</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:18px;font-weight:600">${esc(a.name)}</div>
          <div style="font-size:17px;color:var(--text3)">${a.atkBonus>=0?'+':''}${a.atkBonus} att. · ${esc(a.dmgDice)}${a.dmgBonus?fmt(a.dmgBonus):''} ${esc(a.dmgType)}${a.range?' · '+esc(a.range):''}</div>
        </div>
        <button class="btn bsm" style="color:#e53935;padding:1px 6px;flex-shrink:0" onclick="mjRemoveFormAttack(${i})">✕</button>
      </div>`).join('')
    :'<div style="font-size:17px;color:var(--text3);font-style:italic;padding:4px 0">Aucune attaque définie</div>';
}

function mjConfirmAddFormAttack(){
  const name=(document.getElementById('mAtt_name')?.value||'').trim();
  if(!name){showToast('❌ Nom de l\'attaque requis.');return;}
  _mjNewMonsterAttacks.push({
    name,
    atkBonus:parseInt(document.getElementById('mAtt_bonus')?.value)||0,
    dmgDice:(document.getElementById('mAtt_dice')?.value||'1d6').trim(),
    dmgBonus:parseInt(document.getElementById('mAtt_dmgBonus')?.value)||0,
    dmgType:(document.getElementById('mAtt_type')?.value||'').trim(),
    range:(document.getElementById('mAtt_range')?.value||'').trim(),
  });
  ['mAtt_name','mAtt_type','mAtt_range'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const dEl=document.getElementById('mAtt_dice');if(dEl)dEl.value='1d6';
  ['mAtt_bonus','mAtt_dmgBonus'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='0';});
  const sf=document.getElementById('mAttForm')||document.getElementById('mEdAttForm');if(sf)sf.style.display='none';
  mjRenderAttacksList();
}

function mjRemoveFormAttack(i){_mjNewMonsterAttacks.splice(i,1);mjRenderAttacksList();}

function mjRenderSpellsList(){
  const el=_mjFindListEl('mAdd_spellsList','mEd_spellsList');if(!el)return;
  el.innerHTML=_mjNewMonsterSpells.length
    ?_mjNewMonsterSpells.map((s,i)=>`<div style="display:flex;align-items:center;gap:6px;padding:6px 8px;background:rgba(255,255,255,.04);border-radius:6px;margin-bottom:4px">
        <span>✦</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:18px;font-weight:600">${esc(s.name)}${s.level?' <span style="font-weight:400;color:var(--text3)">Niv.'+s.level+'</span>':''}</div>
          <div style="font-size:17px;color:var(--text3)">${s.saveStat&&s.saveDC?`DD${s.saveDC} ${esc(s.saveStat)} `:''} ${s.dmgDice?esc(s.dmgDice)+' '+esc(s.dmgType):''}</div>
        </div>
        <button class="btn bsm" style="color:#e53935;padding:1px 6px;flex-shrink:0" onclick="mjRemoveFormSpell(${i})">✕</button>
      </div>`).join('')
    :'<div style="font-size:17px;color:var(--text3);font-style:italic;padding:4px 0">Aucun sort défini</div>';
}

function mjConfirmAddFormSpell(){
  const name=(document.getElementById('mSp_name')?.value||'').trim();
  if(!name){showToast('❌ Nom du sort requis.');return;}
  _mjNewMonsterSpells.push({
    name,
    level:parseInt(document.getElementById('mSp_level')?.value)||0,
    saveStat:(document.getElementById('mSp_saveStat')?.value||'').toUpperCase().trim(),
    saveDC:parseInt(document.getElementById('mSp_saveDC')?.value)||0,
    dmgDice:(document.getElementById('mSp_dice')?.value||'').trim(),
    dmgType:(document.getElementById('mSp_type')?.value||'').trim(),
    desc:(document.getElementById('mSp_desc')?.value||'').trim(),
  });
  ['mSp_name','mSp_saveStat','mSp_dice','mSp_type','mSp_desc'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const lEl=document.getElementById('mSp_level');if(lEl)lEl.value='1';
  const dcEl=document.getElementById('mSp_saveDC');if(dcEl)dcEl.value='13';
  const sf=document.getElementById('mSpForm')||document.getElementById('mEdSpForm');if(sf)sf.style.display='none';
  mjRenderSpellsList();
}

function mjRemoveFormSpell(i){_mjNewMonsterSpells.splice(i,1);mjRenderSpellsList();}

let _mjSpellHits=[];
const _DMG_TYPE_FR={'fire damage':'feu','cold damage':'froid','lightning damage':'foudre','thunder damage':'tonnerre','poison damage':'poison','acid damage':'acide','radiant damage':'radiant','necrotic damage':'nécrotique','psychic damage':'psychique','force damage':'force','piercing damage':'perforant','slashing damage':'tranchant','bludgeoning damage':'contondant'};
function _mjSpellSearch(q){
  const res=document.getElementById('mjSpSearchRes');if(!res)return;
  q=(q||'').trim().toLowerCase();
  const db=getSpellsDB();
  if(!db||!db.length){
    res.style.display='block';
    res.innerHTML='<div style="padding:8px;font-size:17px;color:var(--text3)">⏳ Chargement du compendium...</div>';
    loadSpellsDB(()=>_mjSpellSearch(q));
    return;
  }
  if(!q){
    _mjSpellHits=db.slice(0,20);
  }else{
    _mjSpellHits=db.filter(s=>(s.name||'').toLowerCase().includes(q)||(s.nameEN||'').toLowerCase().includes(q)).slice(0,15);
  }
  if(!_mjSpellHits.length){res.style.display='block';res.innerHTML='<div style="padding:8px;font-size:17px;color:var(--text3);font-style:italic">Aucun sort trouvé.</div>';return;}
  res.style.display='block';
  res.innerHTML=_mjSpellHits.map((s,i)=>`<div onclick="_mjSpellFill(${i})" style="padding:7px 10px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,.06)" onmouseenter="this.style.background='rgba(200,168,75,.1)'" onmouseleave="this.style.background=''"><div style="font-size:18px;font-weight:600;color:var(--text)">${esc(s.name)}</div><div style="font-size:15px;color:var(--text3)">${s.level===0?'Tour de magie':'Niveau '+(s.level||1)} · ${esc(s.school||'')}${s.damage?' · 🎲 '+s.damage:''}</div></div>`).join('');
}
function _mjSpellFill(i){
  const s=_mjSpellHits[i];if(!s)return;
  const nameEl=document.getElementById('mSp_name');
  const levelEl=document.getElementById('mSp_level');
  const diceEl=document.getElementById('mSp_dice');
  const typeEl=document.getElementById('mSp_type');
  const descEl=document.getElementById('mSp_desc');
  if(nameEl)nameEl.value=s.name||'';
  if(levelEl)levelEl.value=s.level||0;
  if(diceEl)diceEl.value=s.damage||'';
  if(typeEl){
    if(s.rolls&&s.rolls[0]){const raw=(s.rolls[0][2]||'').toLowerCase();typeEl.value=_DMG_TYPE_FR[raw]||raw.replace(/ damage$/i,'');}
    else typeEl.value='';
  }
  if(descEl)descEl.value=s.desc||'';
  const searchEl=document.getElementById('mjSpSearchQ');if(searchEl)searchEl.value='';
  const resEl=document.getElementById('mjSpSearchRes');if(resEl)resEl.style.display='none';
}

function mjRenderTraitsList(){
  const el=_mjFindListEl('mAdd_traitsList','mEd_traitsList');if(!el)return;
  el.innerHTML=_mjNewMonsterTraits.length
    ?_mjNewMonsterTraits.map((t,i)=>`<div style="display:flex;align-items:flex-start;gap:6px;padding:6px 8px;background:rgba(255,255,255,.04);border-radius:6px;margin-bottom:4px">
        <span style="margin-top:1px">📜</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:18px;font-weight:600">${esc(t.name)}</div>
          ${t.desc?`<div style="font-size:17px;color:var(--text3)">${esc(t.desc)}</div>`:''}
          ${(t.uses&&t.uses>0)||t.dice?`<div style="font-size:15px;color:var(--cp);margin-top:2px">${t.uses>0?t.uses+'× · '+(t.recovery==='short'?'Repos court':t.recovery==='long'?'Repos long':'Passif'):''}${t.dice?' · 🎲 '+esc(t.dice):''}</div>`:''}
        </div>
        <button class="btn bsm" style="color:#e53935;padding:1px 6px;flex-shrink:0" onclick="mjRemoveFormTrait(${i})">✕</button>
      </div>`).join('')
    :'<div style="font-size:17px;color:var(--text3);font-style:italic;padding:4px 0">Aucun trait défini</div>';
}

function mjConfirmAddFormTrait(){
  const name=(document.getElementById('mTr_name')?.value||'').trim();
  if(!name){showToast('❌ Nom du trait requis.');return;}
  const desc=(document.getElementById('mTr_desc')?.value||'').trim();
  const uses=parseInt(document.getElementById('mTr_uses')?.value)||0;
  const recovery=document.getElementById('mTr_recovery')?.value||'passive';
  const dice=(document.getElementById('mTr_dice')?.value||'').trim();
  const trait={name,desc};
  if(uses>0){trait.uses=uses;trait.recovery=recovery;}
  if(dice)trait.dice=dice;
  _mjNewMonsterTraits.push(trait);
  ['mTr_name','mTr_desc','mTr_dice'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const usesEl=document.getElementById('mTr_uses');if(usesEl)usesEl.value='0';
  const sf=document.getElementById('mTrForm')||document.getElementById('mEdTrForm');if(sf)sf.style.display='none';
  mjRenderTraitsList();
}

function mjRemoveFormTrait(i){_mjNewMonsterTraits.splice(i,1);mjRenderTraitsList();}
function mjRollTrait(cIdx,tIdx){
  const c=_mjCombatants[cIdx];if(!c)return;
  const t=(c.traits||[])[tIdx];if(!t||!t.dice)return;
  const m=t.dice.match(/(\d+)d(\d+)([+-]\d+)?/);
  if(!m){showToast(`🎲 ${t.name} : formule non reconnue`);return;}
  let total=0;const rolls=[];
  for(let i=0;i<parseInt(m[1]);i++){const r=Math.ceil(Math.random()*parseInt(m[2]));rolls.push(r);total+=r;}
  if(m[3])total+=parseInt(m[3]);
  const el=document.getElementById('mjDiceResult');
  if(el){el.style.display='block';el.innerHTML=`<strong>${esc(c.name)}</strong> — ${esc(t.name)}<br>🎲 [${rolls.join('+')}]${m[3]||''} = <span style="font-size:22px;font-weight:700;color:var(--cp)">${total}</span>`;}
  _mjCombatLog.push(`🎲 ${esc(c.name)} ${esc(t.name)} : ${total}`);
}
function mjUseTraitCharge(cIdx,traitName,maxUses){
  const c=_mjCombatants[cIdx];if(!c)return;
  c.traitUses=c.traitUses||{};
  const cur=c.traitUses[traitName]!==undefined?c.traitUses[traitName]:maxUses;
  if(cur<=0){showToast('❌ Plus de charges disponibles !');return;}
  c.traitUses[traitName]=cur-1;
  mjOpenCombatDice(cIdx);
}
function mjRecoverTraitCharge(cIdx,traitName,maxUses){
  const c=_mjCombatants[cIdx];if(!c)return;
  c.traitUses=c.traitUses||{};
  c.traitUses[traitName]=maxUses;
  mjOpenCombatDice(cIdx);
}
function mjGroupRest(type){
  if(!_mjPlayersData.length){showToast('Aucun joueur dans la campagne.');return;}
  const label=type==='long'?'🌙 Repos long':'☕ Repos court';
  const detail=type==='long'
    ?'PV remis à fond, sorts, capacités et jets de mort réinitialisés.'
    :'Capacités à repos court récupérées.';
  openModal(`<div class="pt">${label} — Groupe</div>
    <p style="font-size:18px;color:var(--text2);margin-bottom:16px">${detail}</p>
    <div style="display:flex;gap:8px">
      <button class="btn bsm bac" style="flex:1" onclick="mjGroupRestConfirm('${type}')">✓ Confirmer pour tous</button>
      <button class="btn bsm bdanger" onclick="closeModal()">Annuler</button>
    </div>`);
}
async function mjGroupRestConfirm(type){
  closeModal();
  let count=0;
  for(const pp of _mjPlayersData){
    if(!pp.uid||!pp.docId)continue;
    const p=pp.charData||{};
    const update={};
    if(type==='long'){
      update['characterData.hp']=p.hpMax||p.hp||0;
      update['characterData.spellSlotsUsed']=[];
      update['characterData.deathSaves']={success:0,fail:0};
      update['characterData.conditions']=[];
      update['characterData.combatCharges']={};
      pp.charData.hp=p.hpMax||p.hp||0;pp.charData.spellSlotsUsed=[];
      pp.charData.deathSaves={success:0,fail:0};pp.charData.conditions=[];pp.charData.combatCharges={};
    } else {
      const newCharges={...(p.combatCharges||{})};
      (p.classes||[]).forEach(cls=>{
        const d=SRD.classes.find(c=>c.name===cls.name);
        if(d&&d.combatFeatures)d.combatFeatures.forEach(f=>{if(f.recovery==='short')delete newCharges[f.name];});
      });
      (p.customCombatFeats||[]).forEach(f=>{if(f.recovery==='short')delete newCharges[f.name];});
      update['characterData.combatCharges']=newCharges;
      pp.charData.combatCharges=newCharges;
    }
    try{await fbDb.collection('characters').doc(pp.docId).update(update);count++;}
    catch(e){console.warn('Rest sync error',pp.uid,e);}
  }
  showToast(`${type==='long'?'🌙 Repos long':'☕ Repos court'} appliqué à ${count} joueur(s) !`);
  renderMJContent();
}

async function _mjSaveCombatState(sorted,turnIdx){
  if(!currentUser||!currentCampaignId)return;
  const cur=sorted[turnIdx%sorted.length];
  const combatState=cur
    ?{active:true,currentTurnUid:cur.uid||null,currentTurnName:cur.name||'?',round:_mjRound,currentTurn:turnIdx,combatants:_mjCombatants}
    :{active:false};
  try{await fbDb.collection('characters').doc(currentUser.uid+'_'+currentCampaignId+'_mj').update({combatState});}
  catch(e){console.warn('Error saving combat state:',e);}
}
let _mjPersistTimer=null;
function _mjPersistCombat(){
  clearTimeout(_mjPersistTimer);
  _mjPersistTimer=setTimeout(()=>{
    const sorted=_mjCombatStarted?[..._mjCombatants].sort((a,b)=>b.initiative-a.initiative):_mjCombatants;
    _mjSaveCombatState(sorted,_mjCurrentTurn);
  },1000);
}

function mjStartCombat(){
  _mjCombatStarted=true;_mjCurrentTurn=0;_mjRound=1;
  if(typeof _mjKickedFamiliars!=='undefined')_mjKickedFamiliars.clear();
  if(typeof _mjSyncFamiliars==='function')_mjSyncFamiliars(); // intègre les familiers déjà actifs
  _mjCombatants.forEach(c=>{c.initiative=Math.ceil(Math.random()*20)+(c.dexMod||0);});
  // Réflexes de voleur (Roublard niv.17) : un 2e tour au round 1, à l'initiative −10 (retiré au round 2)
  _mjCombatants.filter(c=>c.reflexesVoleur&&!c._reflexClone).forEach(c=>{
    _mjCombatants.push({...c,id:c.id+'_reflex',name:c.name+' (Réflexes — 2e tour)',initiative:Math.max(0,(c.initiative||0)-10),_reflexClone:true,reflexesVoleur:false,uid:null});
  });
  const sorted=[..._mjCombatants].sort((a,b)=>b.initiative-a.initiative);
  // Fix 11 — Liste triée des initiatives dans le log
  const _initList=sorted.map((c,i)=>`${i+1}. ${c.name} : ${c.initiative}`).join(' | ');
  _mjCombatLog.push(`🎲 Initiative lancée — Round 1.\n📋 Ordre : ${_initList}`);
  _mjSaveCombatState(sorted,0);
  renderMJContent();
}

function mjToggleSurprise(idx){
  if(!_mjCombatants[idx])return;
  _mjCombatants[idx].surprised=!_mjCombatants[idx].surprised;
  renderMJContent();
}

function mjNextTurn(){
  const sorted=[..._mjCombatants].sort((a,b)=>b.initiative-a.initiative);
  if(!sorted.length)return;
  _mjCurrentTurn++;
  if(_mjCurrentTurn>=sorted.length){
    _mjCurrentTurn=0;_mjRound++;
    _mjCombatLog.push(`🔄 Début du Round ${_mjRound}.`);
    if(_mjRound===2){
      _mjCombatants.forEach(c=>{c.surprised=false;});
      _mjCombatLog.push(`👁 Surprise levée — tous les combattants agissent normalement.`);
      // Réflexes de voleur : le 2e tour n'existe qu'au round 1 → retirer le clone
      if(_mjCombatants.some(c=>c._reflexClone)){_mjCombatants=_mjCombatants.filter(c=>!c._reflexClone);_mjCombatLog.push('🗡 Réflexes de voleur — fin du 2e tour (round 2).');}
    }
  }
  const cur=sorted[_mjCurrentTurn];
  if(cur?.surprised){
    _mjCombatLog.push(`😵 SURPRIS — ${esc(cur?.name||'?')} ne peut pas agir ce tour !`);
  }else{
    _mjCombatLog.push(`▶ Tour de ${esc(cur?.name||'?')}`);
  }
  _mjSaveCombatState(sorted,_mjCurrentTurn);
  renderMJContent();
}

function mjEndCombat(){
  const survivors=_mjCombatants.filter(c=>c.hp>0);
  const fallen=_mjCombatants.filter(c=>c.hp<=0);
  const rounds=_mjRound;
  openWideModal(`<div class="pt">🏁 Fin du combat</div>
    <div style="text-align:center;margin-bottom:16px">
      <div style="font-size:36px;margin-bottom:6px">🏆</div>
      <div style="font-size:19px;color:var(--text2)">${rounds} round${rounds>1?'s':''} de combat</div>
    </div>
    ${survivors.length?`<div style="margin-bottom:12px">
      <div class="fl mb6" style="color:#4caf50">✅ Debout (${survivors.length})</div>
      ${survivors.map(c=>`<div style="font-size:18px;padding:5px 10px;background:rgba(76,175,80,.08);border-radius:6px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center"><span>${c.isPlayer?(c.avatar||'⚔')+' ':' 👾 '}${esc(c.name)}</span><span style="color:#4caf50;font-weight:600">${c.hp}/${c.hpMax} PV</span></div>`).join('')}
    </div>`:''}
    ${fallen.length?`<div style="margin-bottom:16px">
      <div class="fl mb6" style="color:#e53935">💀 Hors combat (${fallen.length})</div>
      ${fallen.map(c=>`<div style="font-size:18px;padding:5px 10px;background:rgba(229,57,53,.08);border-radius:6px;margin-bottom:4px">${c.isPlayer?(c.avatar||'⚔')+' ':' 👾 '}${esc(c.name)}</div>`).join('')}
    </div>`:''}
    <div style="display:flex;gap:8px;margin-top:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="_mjDoEndCombat()">🏁 Terminer le combat</button>
    </div>`);
}
function _mjDoEndCombat(){
  _mjCombatants=[];_mjCombatStarted=false;_mjCurrentTurn=0;_mjRound=1;_mjCombatLog=[];
  if(currentUser&&currentCampaignId){
    fbDb.collection('characters').doc(currentUser.uid+'_'+currentCampaignId+'_mj').update({combatState:{active:false}}).catch(()=>{});
  }
  closeModal();renderMJContent();showToast('🏁 Combat terminé !');
}
function mjResetCombat(){
  if(!confirm('Réinitialiser le combat ?'))return;
  _mjCombatants=[];_mjCombatStarted=false;_mjCurrentTurn=0;_mjRound=1;_mjCombatLog=[];
  if(currentUser&&currentCampaignId){
    fbDb.collection('characters').doc(currentUser.uid+'_'+currentCampaignId+'_mj').update({combatState:{active:false}}).catch(()=>{});
  }
  renderMJContent();
}

// ─── JETS DE DÉS PAR COMBATTANT ───
function mjOpenCombatDice(idx){
  const c=_mjCombatants[idx];if(!c)return;
  const ab=c.abilities||[10,10,10,10,10,10];
  const mods=ab.map(v=>Math.floor((v-10)/2));
  const AB=['FOR','DEX','CON','INT','SAG','CHA'];
  const btnStyle='padding:8px 4px;text-align:center;width:100%';
  const makeBtn=(label,bonus,fn)=>`<button class="btn" style="${btnStyle}" onclick="${fn}(${idx},'${label}',${bonus})"><div style="font-size:17px;font-weight:700">${label}</div><div style="font-size:18px;color:var(--cp)">${fmt(bonus)}</div></button>`;
  const attacks=c.attacks||[];const spells=c.spells||[];const traits=c.traits||[];
  const attacksHtml=attacks.length
    ?attacks.map((a,ai)=>`<div style="display:flex;align-items:center;gap:8px;padding:8px;background:rgba(255,255,255,.04);border-radius:8px;margin-bottom:6px">
        <div style="flex:1;min-width:0">
          <div style="font-size:18px;font-weight:700">⚔ ${esc(a.name)}</div>
          <div style="font-size:17px;color:var(--text3)">${a.atkBonus>=0?'+':''}${a.atkBonus} att. · ${esc(a.dmgDice)}${a.dmgBonus?fmt(a.dmgBonus):''} ${esc(a.dmgType||'')}${a.range?' · '+esc(a.range):''}</div>
        </div>
        <button class="btn bac bsm" style="flex-shrink:0" onclick="mjRollAttack(${idx},${ai})">🎲 Lancer</button>
      </div>`).join('')
    :`<div style="text-align:center;padding:20px;color:var(--text3);font-style:italic">Aucune attaque définie.<br><span style="font-size:17px">Utilisez ✏ Éditer pour en ajouter.</span></div>`;
  const spellsHtml=spells.length
    ?spells.map((s,si)=>`<div style="padding:8px;background:rgba(255,255,255,.04);border-radius:8px;margin-bottom:6px">
        <div style="display:flex;align-items:center;gap:8px">
          <div style="flex:1;min-width:0">
            <div style="font-size:18px;font-weight:700">✦ ${esc(s.name)}${s.level?` <span style="font-size:17px;font-weight:400;color:var(--text3)">Niv.${s.level}</span>`:''}</div>
            <div style="font-size:17px;color:var(--text3)">${s.saveStat&&s.saveDC?`JS ${esc(s.saveStat)} DD <b>${s.saveDC}</b>`:''} ${s.dmgDice?'· '+esc(s.dmgDice)+' '+esc(s.dmgType||''):''}</div>
          </div>
          ${s.dmgDice||s.saveDC?`<button class="btn bac bsm" style="flex-shrink:0" onclick="mjRollSpell(${idx},${si})">🎲 Lancer</button>`:''}
        </div>
        ${s.desc?`<div style="font-size:17px;color:var(--text2);margin-top:4px;font-style:italic">${esc(s.desc)}</div>`:''}
      </div>`).join('')
    :`<div style="text-align:center;padding:20px;color:var(--text3);font-style:italic">Aucun sort défini.<br><span style="font-size:17px">Utilisez ✏ Éditer pour en ajouter.</span></div>`;
  const traitsHtml=traits.length
    ?traits.map((t,ti)=>{
      const hasUses=t.uses&&t.uses>0;
      const maxUses=t.uses||0;
      const remaining=hasUses?(c.traitUses&&c.traitUses[t.name]!==undefined?c.traitUses[t.name]:maxUses):0;
      const recovLabel=t.recovery==='short'?'Repos court':t.recovery==='long'?'Repos long':'';
      return`<div style="padding:8px;background:rgba(255,255,255,.04);border-radius:8px;margin-bottom:6px">
        <div style="font-size:18px;font-weight:700;margin-bottom:4px">📜 ${esc(t.name)}</div>
        ${t.desc?`<div style="font-size:18px;color:var(--text2);margin-bottom:6px">${esc(t.desc)}</div>`:''}
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          ${t.dice?`<button class="btn bsm bac" onclick="mjRollTrait(${idx},${ti})">🎲 ${esc(t.dice)}</button>`:''}
          ${hasUses?`<div style="display:flex;gap:3px">${Array.from({length:maxUses},(_,bi)=>`<span class="slot-bubble${bi<remaining?'':' used'}" onclick="mjUseTraitCharge(${idx},'${esc(t.name)}',${maxUses})"></span>`).join('')}</div><span style="font-size:15px;color:var(--text3)">${remaining}/${maxUses}${recovLabel?' · '+recovLabel:''}</span><button class="btn bsm" style="padding:1px 6px" onclick="mjRecoverTraitCharge(${idx},'${esc(t.name)}',${maxUses})">↺</button>`:''}
        </div>
      </div>`;
    }).join('')
    :`<div style="text-align:center;padding:20px;color:var(--text3);font-style:italic">Aucun trait défini.<br><span style="font-size:17px">Utilisez ✏ Éditer pour en ajouter.</span></div>`;
  openWideModal(`<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
    <div class="pt" style="margin:0;flex:1">🎲 ${esc(c.name)}</div>
    <button class="btn bsm" onclick="mjOpenEditMonster(${idx})">✏ Éditer</button>
  </div>
  <div class="journal-subtab" style="margin-bottom:14px">
    <button class="on" onclick="mjDiceShowTab(this,'dtests')">🎲 Tests</button>
    <button onclick="mjDiceShowTab(this,'dattacks')">⚔ Attaques${attacks.length?' ('+attacks.length+')':''}</button>
    <button onclick="mjDiceShowTab(this,'dspells')">✦ Sorts${spells.length?' ('+spells.length+')':''}</button>
    <button onclick="mjDiceShowTab(this,'dtraits')">📜 Traits${traits.length?' ('+traits.length+')':''}</button>
  </div>
  <div id="dtests">
    <div style="font-size:17px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Caractéristiques</div>
    <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:4px;margin-bottom:12px">
      ${AB.map((a,i)=>makeBtn(a,mods[i],'mjCombatRoll')).join('')}
    </div>
    <div style="font-size:17px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Jets de sauvegarde</div>
    <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:4px;margin-bottom:12px">
      ${AB.map((a,i)=>makeBtn('JS '+a,mods[i],'mjCombatRoll')).join('')}
    </div>
    <div style="font-size:17px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Dés libres</div>
    <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:4px">
      ${['d4','d6','d8','d10','d12','d20','d100'].map(d=>`<button class="btn" style="padding:5px 9px;font-size:18px" onclick="mjCombatRollFree(${idx},'${d}')">${d}</button>`).join('')}
    </div>
  </div>
  <div id="dattacks" style="display:none">${attacksHtml}</div>
  <div id="dspells" style="display:none">${spellsHtml}</div>
  <div id="dtraits" style="display:none">${traitsHtml}</div>
  <div id="mjDiceResult" style="display:none;padding:10px;background:var(--surface2);border-radius:8px;margin-top:10px;margin-bottom:6px"></div>
  <div style="text-align:right;margin-top:8px"><button class="btn bsm" onclick="closeModal()">Fermer</button></div>`);
}

function mjDiceShowTab(btn,tabId){
  btn.closest('.journal-subtab').querySelectorAll('button').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  ['dtests','dattacks','dspells','dtraits'].forEach(id=>{
    const el=document.getElementById(id);if(el)el.style.display=id===tabId?'block':'none';
  });
  const res=document.getElementById('mjDiceResult');if(res)res.style.display='none';
}
function mjCombatRoll(idx,label,bonus){
  const c=_mjCombatants[idx];if(!c)return;
  const r=Math.ceil(Math.random()*20);
  const total=r+bonus;
  const isCrit=r===20;const isFumble=r===1;
  const col=isCrit?'#ffd54f':isFumble?'#e53935':'var(--cp)';
  const el=document.getElementById('mjDiceResult');
  if(el){el.style.display='block';el.innerHTML=`<strong>${esc(c.name)}</strong> — ${label}<br>d20(${r}) ${fmt(bonus)} = <span style="font-size:20px;color:${col}">${total}</span>${isCrit?' 🎉 CRITIQUE!':isFumble?' 💀 FUMBLE!':''}`;}
  _mjCombatLog.push(`🎲 ${esc(c.name)} ${label} : ${r}${bonus?fmt(bonus):''} = <b>${total}</b>${isCrit?' 🎉':isFumble?' 💀':''}`);
}
function mjCombatAtkRoll(idx){
  const c=_mjCombatants[idx];if(!c)return;
  const bonus=parseInt(document.getElementById('mjAtkBonus')?.value)||0;
  mjCombatRoll(idx,'Attaque',bonus);
}

function mjRollAttack(cIdx,aIdx){
  const c=_mjCombatants[cIdx];if(!c)return;
  const a=(c.attacks||[])[aIdx];if(!a)return;
  const r=Math.ceil(Math.random()*20);
  const atkBonus=parseInt(a.atkBonus)||0;
  const total=r+atkBonus;
  const isCrit=r===20;const isFumble=r===1;
  const col=isCrit?'#ffd54f':isFumble?'#e53935':'var(--cp)';
  let dmgHtml='';let logDmg='';
  if(a.dmgDice){
    const parts=(a.dmgDice+'').toLowerCase().split('d');
    const dq=parseInt(parts[0])||1;const ds=parseInt(parts[1])||6;
    const numDice=isCrit?dq*2:dq;
    const rolls=[];for(let i=0;i<numDice;i++)rolls.push(Math.ceil(Math.random()*ds));
    const dmgBonus=parseInt(a.dmgBonus)||0;
    const totalDmg=rolls.reduce((s,v)=>s+v,0)+dmgBonus;
    dmgHtml=`<div style="font-size:18px;margin-top:8px;padding-top:8px;border-top:1px solid var(--border)">Dégâts : <span style="color:var(--text2)">${rolls.join('+')}${dmgBonus?fmt(dmgBonus):''}</span> = <b style="color:var(--cp);font-size:22px">${totalDmg}</b> <span style="font-size:17px;color:var(--text3)">${esc(a.dmgType||'')}${isCrit?' (critique — dés doublés)':''}</span></div>`;
    logDmg=` / ${totalDmg} dégâts ${a.dmgType||''}${isCrit?' 🎉':''}`;
  }
  const el=document.getElementById('mjDiceResult');
  if(el){el.style.display='block';el.innerHTML=`<div style="font-size:18px;color:var(--text3);margin-bottom:4px">${esc(c.name)} — ${esc(a.name)}</div><div>d20(${r})${fmt(atkBonus)} = <span style="font-size:22px;color:${col};font-weight:800">${total}</span>${isCrit?' 🎉 CRITIQUE!':isFumble?' 💀 FUMBLE!':''}</div>${dmgHtml}`;}
  _mjCombatLog.push(`⚔ ${esc(c.name)} — ${esc(a.name)} : att.=${r}${fmt(atkBonus)}=<b>${total}</b>${isCrit?' 🎉':isFumble?' 💀':''}${logDmg}`);
}

function mjRollSpell(cIdx,sIdx){
  const c=_mjCombatants[cIdx];if(!c)return;
  const s=(c.spells||[])[sIdx];if(!s)return;
  let dmgHtml='';let logDmg='';
  if(s.dmgDice){
    const parts=(s.dmgDice+'').toLowerCase().split('d');
    const dq=parseInt(parts[0])||1;const ds=parseInt(parts[1])||6;
    const rolls=[];for(let i=0;i<dq;i++)rolls.push(Math.ceil(Math.random()*ds));
    const totalDmg=rolls.reduce((sum,v)=>sum+v,0);
    dmgHtml=`<div style="font-size:18px;margin-top:6px">Dégâts : <span style="color:var(--text2)">${rolls.join('+')}</span> = <b style="color:var(--cp);font-size:22px">${totalDmg}</b> <span style="font-size:17px;color:var(--text3)">${esc(s.dmgType||'')}</span></div>`;
    logDmg=` / ${totalDmg} dégâts ${s.dmgType||''}`;
  }
  const others=_mjCombatants.filter((_,i)=>i!==cIdx);
  const saveTargetsHtml=s.saveStat&&s.saveDC&&others.length?`<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border)"><div style="font-size:17px;color:var(--text3);margin-bottom:5px">🎯 Lancer le JS ${esc(s.saveStat)} DD${s.saveDC} pour :</div><div style="display:flex;flex-wrap:wrap;gap:4px">${others.map(oc=>`<button class="btn bsm" style="font-size:15px" onclick="mjRollSaveFor(${_mjCombatants.indexOf(oc)},${cIdx},${sIdx})">${esc(oc.name)}</button>`).join('')}</div></div>`:'';
  const el=document.getElementById('mjDiceResult');
  if(el){el.style.display='block';el.innerHTML=`<div style="font-size:18px;color:var(--text3);margin-bottom:4px">${esc(c.name)} — ${esc(s.name)}</div>${s.saveStat&&s.saveDC?`<div style="font-size:19px;margin-bottom:4px">JS <b>${esc(s.saveStat)}</b> DD <span style="font-size:22px;color:var(--cp);font-weight:800">${s.saveDC}</span></div>`:''}${dmgHtml||'<div style="color:var(--text3);font-size:18px">Sort d\'effet — pas de jets de dégâts</div>'}${saveTargetsHtml}`;}
  _mjCombatLog.push(`✦ ${esc(c.name)} — ${esc(s.name)}${s.saveDC?` DD${s.saveDC} ${s.saveStat}`:''}${logDmg}`);
}
const _SAVE_IDX={FOR:0,STR:0,DEX:1,CON:2,INT:3,SAG:4,WIS:4,CHA:5};
function mjRollSaveFor(targetIdx,casterIdx,spellIdx){
  const target=_mjCombatants[targetIdx];if(!target)return;
  const caster=_mjCombatants[casterIdx];if(!caster)return;
  const spell=(caster.spells||[])[spellIdx];if(!spell)return;
  const statIdx=_SAVE_IDX[(spell.saveStat||'').toUpperCase()]??-1;
  const abilityVal=(target.abilities&&statIdx>=0&&target.abilities[statIdx]!==undefined)?target.abilities[statIdx]:10;
  const mod=Math.floor((abilityVal-10)/2);
  const d20=Math.ceil(Math.random()*20);
  const total=d20+mod;
  const success=total>=spell.saveDC;
  const el=document.getElementById('mjDiceResult');
  if(el){el.innerHTML+=`<div style="margin-top:6px;padding-top:6px;border-top:1px solid var(--border);font-size:18px"><b>${esc(target.name)}</b> JS ${esc(spell.saveStat||'')} : d20(${d20})${mod>=0?'+':''}${mod} = <b style="color:${success?'#4caf50':'#e53935'};font-size:21px">${total}</b> ${success?'✅ Réussite':'❌ Échec'}</div>`;}
  _mjCombatLog.push(`🎯 JS ${esc(spell.saveStat||'')} DD${spell.saveDC} — ${esc(target.name)} : ${total} (${success?'Réussite':'Échec'})`);
}

function mjOpenEditMonster(idx){
  const c=_mjCombatants[idx];if(!c)return;
  _mjNewMonsterAttacks=(c.attacks||[]).map(a=>({...a}));
  _mjNewMonsterSpells=(c.spells||[]).map(s=>({...s}));
  _mjNewMonsterTraits=(c.traits||[]).map(t=>({...t}));
  _mjEditingMonsterIdx=idx;
  openWideModal(`<div class="pt">✏ Éditer — ${esc(c.name)}</div>
    <div class="g2" style="gap:8px;margin-bottom:16px">
      <div><div class="fl mb6">PV actuels</div><input class="fi" id="mEd_hp" type="number" value="${c.hp}"></div>
      <div><div class="fl mb6">PV max</div><input class="fi" id="mEd_hpMax" type="number" value="${c.hpMax}"></div>
      <div><div class="fl mb6">CA</div><input class="fi" id="mEd_ac" type="number" value="${c.ac}"></div>
    </div>
    <div style="border-top:1px solid var(--border);padding-top:12px;margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="font-size:18px;font-weight:700;color:var(--text2)">⚔ Attaques</div>
        <button class="btn bsm" onclick="mjToggleMonsterSubForm('mEdAttForm')">+ Ajouter</button>
      </div>
      <div id="mEdAttForm" style="display:none;background:var(--surface2);border-radius:8px;padding:10px;margin-bottom:8px">
        <input class="fi" id="mAtt_name" placeholder="Nom (ex: Cimeterre)" style="margin-bottom:6px">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:6px">
          <div><div style="font-size:15px;color:var(--text3);margin-bottom:3px">Bonus att.</div><input class="fi" id="mAtt_bonus" type="number" value="0"></div>
          <div><div style="font-size:15px;color:var(--text3);margin-bottom:3px">Dés dégâts</div><input class="fi" id="mAtt_dice" value="1d6"></div>
          <div><div style="font-size:15px;color:var(--text3);margin-bottom:3px">Bonus dégâts</div><input class="fi" id="mAtt_dmgBonus" type="number" value="0"></div>
        </div>
        <div class="g2" style="gap:6px;margin-bottom:8px">
          <div><input class="fi" id="mAtt_type" placeholder="Type dégâts"></div>
          <div><input class="fi" id="mAtt_range" placeholder="Portée (optionnel)"></div>
        </div>
        <button class="btn bac bsm" style="width:100%" onclick="mjConfirmAddFormAttack()">✓ Confirmer</button>
      </div>
      <div id="mEd_attacksList"></div>
    </div>
    <div style="border-top:1px solid var(--border);padding-top:12px;margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="font-size:18px;font-weight:700;color:var(--text2)">✦ Sorts & Pouvoirs</div>
        <button class="btn bsm" onclick="mjToggleMonsterSubForm('mEdSpForm')">+ Ajouter</button>
      </div>
      <div id="mEdSpForm" style="display:none;background:var(--surface2);border-radius:8px;padding:10px;margin-bottom:8px">
        <div style="position:relative;margin-bottom:8px">
          <input class="fi" id="mjSpSearchQ" placeholder="🔍 Chercher dans le compendium..." oninput="_mjSpellSearch(this.value)" onfocus="_mjSpellSearch(this.value)" autocomplete="off" onblur="setTimeout(()=>{const r=document.getElementById('mjSpSearchRes');if(r)r.style.display='none';},150)">
          <div id="mjSpSearchRes" style="display:none;position:absolute;top:100%;left:0;right:0;z-index:200;background:var(--surface);border:1px solid rgba(200,168,75,.4);border-radius:0 0 6px 6px;max-height:200px;overflow-y:auto;box-shadow:0 4px 16px rgba(0,0,0,.5)"></div>
        </div>
        <input class="fi" id="mSp_name" placeholder="Nom du sort" style="margin-bottom:6px">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:6px">
          <div><div style="font-size:15px;color:var(--text3);margin-bottom:3px">Niveau</div><input class="fi" id="mSp_level" type="number" value="1" min="0"></div>
          <div><div style="font-size:15px;color:var(--text3);margin-bottom:3px">Stat save</div><input class="fi" id="mSp_saveStat" placeholder="DEX"></div>
          <div><div style="font-size:15px;color:var(--text3);margin-bottom:3px">DD save</div><input class="fi" id="mSp_saveDC" type="number" value="13"></div>
        </div>
        <div class="g2" style="gap:6px;margin-bottom:6px">
          <div><input class="fi" id="mSp_dice" placeholder="Dés (ex: 8d6)"></div>
          <div><input class="fi" id="mSp_type" placeholder="Type dégâts"></div>
        </div>
        <textarea class="fi" id="mSp_desc" rows="2" placeholder="Description..." style="resize:vertical;margin-bottom:8px"></textarea>
        <button class="btn bac bsm" style="width:100%" onclick="mjConfirmAddFormSpell()">✓ Confirmer</button>
      </div>
      <div id="mEd_spellsList"></div>
    </div>
    <div style="border-top:1px solid var(--border);padding-top:12px;margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="font-size:18px;font-weight:700;color:var(--text2)">📜 Traits & Capacités</div>
        <button class="btn bsm" onclick="mjToggleMonsterSubForm('mEdTrForm')">+ Ajouter</button>
      </div>
      <div id="mEdTrForm" style="display:none;background:var(--surface2);border-radius:8px;padding:10px;margin-bottom:8px">
        <input class="fi" id="mTr_name" placeholder="Nom du trait" style="margin-bottom:6px">
        <textarea class="fi" id="mTr_desc" rows="2" placeholder="Description..." style="resize:vertical;margin-bottom:6px"></textarea>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px">
          <div><div style="font-size:15px;color:var(--text3);margin-bottom:3px">Charges (0=passif)</div><input class="fi" id="mTr_uses" type="number" min="0" value="0"></div>
          <div><div style="font-size:15px;color:var(--text3);margin-bottom:3px">Récupération</div><select class="fi" id="mTr_recovery"><option value="passive">Passif</option><option value="short">Repos court</option><option value="long">Repos long</option></select></div>
          <div><div style="font-size:15px;color:var(--text3);margin-bottom:3px">Dé (ex: 2d6+3)</div><input class="fi" id="mTr_dice" placeholder="2d6+3"></div>
        </div>
        <button class="btn bac bsm" style="width:100%" onclick="mjConfirmAddFormTrait()">✓ Confirmer</button>
      </div>
      <div id="mEd_traitsList"></div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="mjSaveEditMonster()">💾 Sauvegarder</button>
    </div>`);
  mjRenderAttacksList();mjRenderSpellsList();mjRenderTraitsList();
}

function mjSaveEditMonster(){
  const idx=_mjEditingMonsterIdx;
  const c=_mjCombatants[idx];if(!c)return;
  const hpMax=parseInt(document.getElementById('mEd_hpMax')?.value)||c.hpMax;
  const hp=Math.min(parseInt(document.getElementById('mEd_hp')?.value)||c.hp,hpMax);
  const ac=parseInt(document.getElementById('mEd_ac')?.value)||c.ac;
  c.hp=hp;c.hpMax=hpMax;c.ac=ac;
  c.attacks=[..._mjNewMonsterAttacks];
  c.spells=[..._mjNewMonsterSpells];
  c.traits=[..._mjNewMonsterTraits];
  _mjNewMonsterAttacks=[];_mjNewMonsterSpells=[];_mjNewMonsterTraits=[];_mjEditingMonsterIdx=-1;
  _mjCombatLog.push(`✏ ${esc(c.name)} modifié.`);
  closeModal();renderMJContent();
}
function mjCombatRollFree(idx,d){
  const c=_mjCombatants[idx];if(!c)return;
  const n=parseInt(d.replace('d',''));
  const r=Math.ceil(Math.random()*n);
  const isCrit=r===n&&n>4;const isFumble=r===1&&n>4;
  const el=document.getElementById('mjDiceResult');
  if(el){el.style.display='block';el.innerHTML=`<strong>${esc(c.name)}</strong> — ${d}<br><span style="font-size:20px">${r}</span>${isCrit?' 🎉':isFumble?' 💀':''}`;}
  _mjCombatLog.push(`🎲 ${esc(c.name)} ${d} : <b>${r}</b>${isCrit?' 🎉':isFumble?' 💀':''}`);
}

function mjRemoveCombatant(idx){
  const name=_mjCombatants[idx]?.name||'?';
  if(!confirm(`Retirer "${name}" du combat ?`))return;
  const _rid=_mjCombatants[idx]?.id;
  if(_rid&&_rid.indexOf('familiar_')===0&&typeof _mjKickedFamiliars!=='undefined')_mjKickedFamiliars.add(_rid);
  _mjCombatants.splice(idx,1);
  _mjCombatLog.push(`✕ ${esc(name)} retiré du combat.`);
  if(_mjCurrentTurn>=_mjCombatants.length&&_mjCurrentTurn>0)_mjCurrentTurn--;
  renderMJContent();
}

let _mjHpSyncTimers={};
function _mjSyncPlayerHp(c){
  if(!c.isPlayer||!c.uid||!currentCampaignId)return;
  clearTimeout(_mjHpSyncTimers[c.uid]);
  _mjHpSyncTimers[c.uid]=setTimeout(async()=>{
    try{
      const pp=_mjPlayersData.find(p=>p.docId===c.uid+'_'+currentCampaignId||p.charData?.uid===c.uid);
      const inWs=pp&&pp.charData&&pp.charData.wildshape?.active;
      if(inWs){
        // Le joueur est en forme animale — syncer les PV de la bête
        const overflow=Math.max(0,c.hp<0?-c.hp:0);
        const beastHp=Math.max(0,c.hp);
        const update={'characterData.wildshape.beast.hpCur':beastHp};
        if(beastHp<=0){
          // La bête tombe — déclencher le retour à la forme druide
          const savedHp=Math.max(0,(pp.charData.wildshape.savedHp||0)-overflow);
          Object.assign(update,{'characterData.hp':savedHp,'characterData.wildshape':firebase.firestore.FieldValue.delete()});
        }
        await fbDb.collection('characters').doc(c.uid+'_'+currentCampaignId).update(update);
        c.hpMax=inWs?pp.charData.wildshape.beast.hpMax:c.hpMax;
      } else {
        await fbDb.collection('characters').doc(c.uid+'_'+currentCampaignId).update({'characterData.hp':c.hp,'characterData.hpMax':c.hpMax});
      }
    }
    catch(e){}
    delete _mjHpSyncTimers[c.uid];
  },800);
}
function _mjSyncPlayerConditions(c){
  if(!c.isPlayer||!c.uid||!currentCampaignId)return;
  const pp=_mjPlayersData.find(p=>p.uid===c.uid);
  if(!pp?.docId)return;
  fbDb.collection('characters').doc(pp.docId).update({'characterData.conditions':c.conditions||[]}).catch(()=>{});
}
function mjHpChange(idx,dir){
  const c=_mjCombatants[idx];if(!c)return;
  c.hp=Math.max(0,Math.min(c.hpMax,c.hp+dir));
  if(c.hp===0)_mjCombatLog.push(`💀 ${esc(c.name)} tombe à 0 PV !`);
  _mjSyncPlayerHp(c);
  _mjPersistCombat();
  renderMJContent();
}

function mjOpenHpModal(idx){
  const c=_mjCombatants[idx];if(!c)return;
  openModal(`<div class="pt">❤ PV — ${esc(c.name)}</div>
    <div style="text-align:center;font-size:22px;font-weight:700;color:var(--cp);margin-bottom:12px">${c.hp} / ${c.hpMax}</div>
    <div class="g2" style="gap:8px;margin-bottom:16px">
      <div><div class="fl mb6">Soins (+PV)</div><input class="fi" id="hpModal_heal" type="number" min="0" placeholder="0"></div>
      <div><div class="fl mb6">Dégâts (−PV)</div><input class="fi" id="hpModal_dmg" type="number" min="0" placeholder="0"></div>
    </div>
    <div><div class="fl mb6">Définir PV max</div><input class="fi" id="hpModal_max" type="number" min="1" value="${c.hpMax}" style="margin-bottom:16px"></div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="mjApplyHpModal(${idx})">Appliquer</button>
    </div>`);
}

function mjApplyHpModal(idx){
  const c=_mjCombatants[idx];if(!c)return;
  const heal=parseInt(document.getElementById('hpModal_heal').value)||0;
  const dmg=parseInt(document.getElementById('hpModal_dmg').value)||0;
  const newMax=parseInt(document.getElementById('hpModal_max').value)||c.hpMax;
  c.hpMax=newMax;
  c.hp=Math.max(0,Math.min(c.hpMax,c.hp+heal-dmg));
  if(heal) _mjCombatLog.push(`💚 ${esc(c.name)} soigné de ${heal} PV (→ ${c.hp}/${c.hpMax})`);
  if(dmg) _mjCombatLog.push(`🗡 ${esc(c.name)} subit ${dmg} dégâts (→ ${c.hp}/${c.hpMax})`);
  if(c.hp===0)_mjCombatLog.push(`💀 ${esc(c.name)} tombe à 0 PV !`);
  _mjSyncPlayerHp(c);
  _mjPersistCombat();
  closeModal();renderMJContent();
}

const MJ_CONDITIONS=[
  {n:'Aveuglé',d:'Ne peut pas voir. Attaques contre lui : avantage. Ses attaques : désavantage.'},
  {n:'Charmé',d:'Ne peut pas attaquer le charmeur. Le charmeur a avantage aux interactions sociales.'},
  {n:'Assourdi',d:'Ne peut pas entendre. Échoue automatiquement les JS liés à l\'ouïe.'},
  {n:'Épouvanté',d:'Désavantage aux jets d\'attaque et caractéristiques si la source de peur est visible.'},
  {n:'Agrippé',d:'Vitesse = 0. Condition retirée si hors de portée ou si incapacité.'},
  {n:'Neutralisé',d:'Ne peut pas effectuer d\'actions ni de réactions.'},
  {n:'Invisible',d:'Impossible à voir sans magie. Attaques contre lui : désavantage. Ses attaques : avantage.'},
  {n:'Paralysé',d:'Neutralisé, ne peut bouger/parler. Attaques au corps à corps = coup critique automatique à moins de 1,5m.'},
  {n:'Pétrifié',d:'Transformé en pierre. Neutralisé, résistance à tous les dégâts, immunité poison/maladie.'},
  {n:'Empoisonné',d:'Désavantage aux jets d\'attaque et de caractéristique.'},
  {n:'À terre',d:'Se relever coûte la moitié de la vitesse. Attaques au corps à corps contre lui : avantage. À distance : désavantage.'},
  {n:'Entravé',d:'Vitesse = 0. Attaques contre lui : avantage. Ses attaques : désavantage. JS DEX : désavantage.'},
  {n:'Étourdi',d:'Neutralisé, ne peut bouger. Attaques contre lui : avantage. Échoue automatiquement JS FOR/DEX.'},
  {n:'Inconscient',d:'Neutralisé, tombe à terre, lâche tout. Attaques contre lui : avantage. Coup critique au corps à corps < 1,5m.'},
  {n:'Épuisé',d:'Malus selon le niveau (1→désavantage jets compétences, 3→vitesse divisée par 2, 5→vitesse 0, 6→mort).'},
  {n:'Concentration',d:'Le lanceur est en concentration. Un coup peut rompre la concentration (JS CON DD 10 ou moitié des dégâts).'},
];

function mjEditInitiative(idx){
  const c=_mjCombatants[idx];if(!c)return;
  openModal(`<div class="pt">🎲 Initiative — ${esc(c.name)}</div>
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
      <div style="flex:1"><div class="fl mb6">Valeur (dé + mod)</div><input class="fi" id="initInput" type="number" value="${c.initiative||0}" style="font-size:20px;text-align:center"></div>
      <button class="btn bsm" style="margin-top:18px;border-color:#ffd54f;color:#ffd54f" onclick="mjRerollInitiative(${idx})">🎲 Relancer</button>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="_mjConfirmInitiative(${idx})">✓ Confirmer</button>
    </div>`);
  setTimeout(()=>{const el=document.getElementById('initInput');if(el){el.focus();el.select();}},50);
}
function _mjConfirmInitiative(idx){
  const c=_mjCombatants[idx];if(!c)return;
  const val=parseInt(document.getElementById('initInput')?.value)||0;
  c.initiative=val;
  closeModal();renderMJContent();
}
function mjRerollInitiative(idx){
  const c=_mjCombatants[idx];if(!c)return;
  c.initiative=Math.ceil(Math.random()*20)+(c.dexMod||0);
  _mjCombatLog.push(`🎲 ${esc(c.name)} relance l'initiative : ${c.initiative}`);
  closeModal();renderMJContent();
}

function mjOpenCondModal(idx){
  const c=_mjCombatants[idx];if(!c)return;
  const current=c.conditions||[];
  openWideModal(`<div class="pt">⚠ Conditions — ${esc(c.name)}</div>
    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:4px">
      ${MJ_CONDITIONS.map((cd,mi)=>`<span class="cond-pill${current.includes(cd.n)?' on':''}" title="${esc(cd.d)}" onclick="mjToggleCond(${idx},${mi},this)">${cd.n}</span>`).join('')}
    </div>
    <div id="condDesc" style="min-height:28px;font-size:17px;color:var(--text3);font-style:italic;padding:4px 2px;margin-bottom:10px">Survolez une condition pour voir sa description.</div>
    <div class="fl mb6">Condition personnalisée</div>
    <div style="display:flex;gap:6px;margin-bottom:14px">
      <input class="fi" id="condCustom" placeholder="Ex: Maudit, Béni, Rage..." style="flex:1">
      <button class="btn bsm" onclick="mjAddCustomCond(${idx})">Ajouter</button>
    </div>
    <div style="display:flex;justify-content:flex-end"><button class="btn bac" onclick="closeModal();renderMJContent()">Fermer</button></div>`);
  // Hover descriptions
  setTimeout(()=>{document.querySelectorAll('.cond-pill[title]').forEach(el=>{el.addEventListener('mouseenter',()=>{const d=document.getElementById('condDesc');if(d)d.textContent=el.title;});el.addEventListener('mouseleave',()=>{const d=document.getElementById('condDesc');if(d)d.textContent='Survolez une condition pour voir sa description.';});});},0);
}

function mjToggleCond(idx,cdOrIdx,el){
  const c=_mjCombatants[idx];if(!c)return;
  if(!c.conditions)c.conditions=[];
  const cd=typeof cdOrIdx==='number'?(MJ_CONDITIONS[cdOrIdx]?.n||''):cdOrIdx;
  if(!cd)return;
  const i=c.conditions.indexOf(cd);
  if(i>=0){c.conditions.splice(i,1);el.classList.remove('on');}
  else{c.conditions.push(cd);el.classList.add('on');}
  _mjSyncPlayerConditions(c);
}

function mjAddCustomCond(idx){
  const c=_mjCombatants[idx];if(!c)return;
  const val=(document.getElementById('condCustom').value||'').trim();
  if(!val)return;
  if(!c.conditions)c.conditions=[];
  c.conditions.push(val);
  document.getElementById('condCustom').value='';
  _mjSyncPlayerConditions(c);
  showToast(`✅ Condition "${val}" ajoutée.`);
}

function mjRemoveCond(idx,condIdx){
  const c=_mjCombatants[idx];if(!c||!c.conditions)return;
  c.conditions.splice(condIdx,1);
  _mjSyncPlayerConditions(c);
  renderMJContent();
}

function mjDsave(idx,type){
  const c=_mjCombatants[idx];if(!c||!c.isPlayer)return;
  if(!c.deathSaves)c.deathSaves={success:0,fail:0};
  if(type==='success')c.deathSaves.success=Math.min(3,c.deathSaves.success+1);
  else if(type==='fail')c.deathSaves.fail=Math.min(3,c.deathSaves.fail+1);
  else c.deathSaves={success:0,fail:0};
  if(c.deathSaves.success>=3){
    _mjCombatLog.push(`🌟 ${esc(c.name)} : 3 succès — stabilisé !`);
    c.hp=1;c.deathSaves={success:0,fail:0};
    _mjSyncPlayerHp(c);
  }else if(c.deathSaves.fail>=3){
    _mjCombatLog.push(`💀 ${esc(c.name)} : 3 échecs aux JS de mort !`);
    c.deathSaves={success:0,fail:0};
  }
  if(c.uid&&currentCampaignId){
    const pp=_mjPlayersData.find(p=>p.uid===c.uid);
    if(pp?.docId)fbDb.collection('characters').doc(pp.docId).update({'characterData.deathSaves':c.deathSaves}).catch(()=>{});
  }
  renderMJContent();
}

// ─────────────────────────────────────────
// TAB PNJ / MONSTRES
// ─────────────────────────────────────────
