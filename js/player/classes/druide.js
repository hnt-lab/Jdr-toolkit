// DRUIDE — Panneau de combat + fonctions Forme sauvage / Forme élémentaire
// ═══════════════════════════════════════

function renderDruide(p) {
  const druLvl = ((p.classes||[]).find(c=>c.name==='Druide')||{}).level||0;
  if (druLvl < 2) return '';
  const sagM = mod(p.abilities[4]);
  const druPath = (p.features||[]).find(f=>['Cercle de la lune','Cercle des terres'].includes(f.name));
  const isLune = druPath?.name==='Cercle de la lune';
  const isTerres = druPath?.name==='Cercle des terres';
  const wsC = p.wildshape;
  const slots = calcSpellSlots(p);
  const slotsUsed = p.spellSlotsUsed||[];

  const crMax = druLvl>=6?String(Math.floor(druLvl/3)):isLune?'1':druLvl>=4?'1/2':'1/4';
  const canFly = druLvl>=8;
  const canSwim = druLvl>=4;
  const fsMax = druLvl>=20?99:2;
  const fsUsed = druLvl>=20?fsMax:(p.combatCharges||{})['Forme sauvage']!==undefined?p.combatCharges['Forme sauvage']:2;
  const feMax = 2;
  const feUsed = (p.combatCharges||{})['FormeElementaire']!==undefined?p.combatCharges['FormeElementaire']:feMax;
  const rnUsed = !!(p.combatCharges||{})['RecupNaturelle'];

  if (wsC?.active) {
    const bHpPct = Math.min(100,Math.round(wsC.beast.hpCur/Math.max(1,wsC.beast.hpMax)*100));
    const availSlots = [1,2,3,4,5].filter(n=>(slots[n-1]||0)-(slotsUsed[n-1]||0)>0);
    return cs('cs-druide',`<div class="panel mb10" style="border-color:rgba(76,175,80,.5);background:rgba(76,175,80,.04)"><div class="pt" style="display:flex;align-items:center;justify-content:space-between"><div style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span><span style="color:#4caf50">${wsC.beast.icon} En forme de ${esc(wsC.beast.name)}</span></div><span style="font-size:10px;color:#4caf50;border:1px solid rgba(76,175,80,.4);border-radius:10px;padding:2px 8px">🐺 Actif</span></div><div style="margin:10px 0"><div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text3);margin-bottom:4px"><span>PV bête</span><span style="color:#4caf50;font-weight:700">${wsC.beast.hpCur} / ${wsC.beast.hpMax}</span></div><div class="hp-bar"><div class="hp-fill" style="width:${bHpPct}%;background:#4caf50"></div></div></div><div style="display:flex;gap:8px;margin-bottom:8px;font-size:11px;color:var(--text3)"><span>CA ${wsC.beast.ac}</span><span>•</span><span>${wsC.beast.speed}</span><span>•</span><span>Charges : <strong style="color:var(--cp)">${druLvl>=20?'∞':fsUsed+'/'+fsMax}</strong></span></div>${isLune&&druLvl>=6?`<div style="font-size:11px;color:#4caf50;margin-bottom:8px">✨ Frappe primitive — Attaques en forme animale : magiques</div>`:''}${isLune&&availSlots.length?`<div style="margin-bottom:8px"><div style="font-size:11px;color:var(--text3);margin-bottom:4px">🌙 Guérison via emplacement (1d8/niveau) :</div><div style="display:flex;gap:4px;flex-wrap:wrap">${availSlots.map(n=>`<button class="btn bsm" onclick="(()=>{const p=P();if(!p.wildshape?.active)return;let h=0;for(let i=0;i<${n};i++)h+=Math.floor(Math.random()*8)+1;p.wildshape.beast.hpCur=Math.min(p.wildshape.beast.hpMax,p.wildshape.beast.hpCur+h);if(!p.spellSlotsUsed)p.spellSlotsUsed=[];p.spellSlotsUsed[${n-1}]=(p.spellSlotsUsed[${n-1}]||0)+1;saveAll();render();showToast('💚 +'+h+' PV (${n}d8)');})()">Niv.${n} (${n}d8)</button>`).join('')}</div></div>`:''}<button class="btn bsm" style="width:100%;border-color:rgba(76,175,80,.4);color:#4caf50" onclick="revertWildshape()">↩ Abandonner la forme</button></div>`);
  }

  return cs('cs-druide',`<div class="panel mb10"><div class="pt" style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span>🐺 Druide — Forme sauvage</div><div style="font-size:11px;color:var(--text3);margin-bottom:10px">${_featDesc('Druide','Forme sauvage')}</div><div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px;margin-bottom:10px"><div class="sb hi"><div class="sn">CR max</div><div style="font-size:18px;font-weight:700;color:var(--cp)">${crMax}</div></div><div class="sb"><div class="sn">Nage</div><div style="font-size:14px;font-weight:600;color:${canSwim?'#4caf50':'var(--text3)'}">${canSwim?'✓':'✗'}</div></div><div class="sb"><div class="sn">Vol</div><div style="font-size:14px;font-weight:600;color:${canFly?'#4caf50':'var(--text3)'}">${canFly?'✓':'✗'}</div></div><div class="sb"><div class="sn">Durée max</div><div style="font-size:12px;font-weight:700;color:var(--cp)">${Math.floor(druLvl/2)}h</div></div></div><div style="font-size:11px;color:var(--text3);margin-bottom:8px">Action : <strong>${isLune?'Action bonus':'Action'}</strong></div>${druLvl>=20?'<div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:8px">✓ Archidruide — Utilisations illimitées</div>':`<div style="display:flex;gap:4px;margin-bottom:6px">${Array.from({length:2},(_,i)=>`<span class="slot-bubble${i<fsUsed?'':' used'}" onclick="useCombatCharge('Forme sauvage',2)"></span>`).join('')}</div><div style="font-size:10px;color:var(--text3);margin-bottom:6px">${fsUsed}/2 • Repos court</div><button class="btn bsm" style="margin-bottom:8px" onclick="recoverCombatCharge('Forme sauvage',2)">↺ Repos court</button>`}<button class="btn bac bsm" style="width:100%;background:rgba(76,175,80,.1);border-color:#4caf50;color:#4caf50" onclick="openWildshapeModal()">🐺 Entrer en Forme sauvage</button>${isLune?`<div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:6px">🌙 Cercle de la lune</div>${druLvl>=6?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">✨ Frappe primitive (niv.6) — Tes attaques en forme animale sont considérées comme magiques et ignorent les résistances aux dégâts non magiques.</div>`:''} ${druLvl>=10?(()=>{return`<div style="margin-bottom:8px"><div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:4px">🌊 Forme élémentaire (niv.10) — Élémentaire air/eau/terre/feu</div><div style="display:flex;align-items:center;gap:8px"><div style="display:flex;gap:4px">${Array.from({length:feMax},(_,fi)=>`<span class="slot-bubble${fi<feUsed?'':' used'}" onclick="useCombatCharge('FormeElementaire',${feMax})"></span>`).join('')}</div><span style="font-size:10px;color:var(--text3)">${feUsed}/${feMax} • Repos long</span><button class="btn bsm" onclick="recoverCombatCharge('FormeElementaire',${feMax})">↺ Repos long</button></div><button class="btn bac bsm" style="margin-top:6px;width:100%;background:rgba(41,182,246,.1);border-color:#29b6f6;color:#29b6f6" onclick="openElementalModal()">🌊 Entrer en Forme élémentaire</button></div>`;})():''}${druLvl>=14?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">✨ Mille formes (niv.14) — Modifier son apparence à volonté (comme Modification d'apparence)</div>`:''}</div>`:''}${isTerres?`<div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:6px">🗺 Cercle des terres</div><div style="margin-bottom:8px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:4px">🌿 Récupération naturelle — 1/repos long</div><div style="font-size:11px;color:var(--text3);margin-bottom:6px">Repos court : récupère des emplacements (total niveaux ≤ ${Math.ceil(druLvl/2)}, max niv.5).</div><div style="display:flex;align-items:center;gap:6px"><span class="slot-bubble${rnUsed?' used':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['RecupNaturelle']=!p.combatCharges['RecupNaturelle'];saveAll();render();})()"></span><button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};delete p.combatCharges['RecupNaturelle'];saveAll();render();})()">↺ Repos long</button></div></div>${druLvl>=6?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">🚶 Foulée tellurique (niv.6) — Terrains difficiles non magiques sans coût de déplacement supplémentaire</div>`:''} ${druLvl>=10?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">🛡 Protégée de dame Nature (niv.10) — Immunité charme/peur (élémentaires/fées), immunité poison et maladie</div>`:''} ${druLvl>=14?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">🌳 Sanctuaire de dame Nature (niv.14) — Bêtes et plantes : JS SAG ou choisir une autre cible</div>`:''}</div>`:''}</div>`);
}

function openWildshapeModal() {
  const p = P();
  const druLvl = ((p.classes||[]).find(c=>c.name==='Druide')||{}).level||0;
  const _isLune = (p.features||[]).some(f=>f.name==='Cercle de la lune');
  const crMax = druLvl>=6?Math.floor(druLvl/3):_isLune?1:druLvl>=4?0.5:0.25;
  const canSwim = druLvl>=4;
  const canFly = druLvl>=8;
  const fsMax = druLvl>=20?99:2;
  const fsUsed = (p.combatCharges||{})['Forme sauvage']!==undefined?p.combatCharges['Forme sauvage']:fsMax;
  if (druLvl<20&&fsUsed<=0) { showToast('❌ Plus de charges de Forme sauvage !'); return; }
  const available = BEAST_FORMS.filter(b=>b.cr<=crMax&&(!b.fly||canFly)&&(!b.swim||canSwim));
  openWideModal(`<div class="pt">🐺 Entrer en Forme sauvage</div>
    <div style="font-size:11px;color:var(--text3);margin-bottom:10px">CR max : ${crMax<=0.25?'1/4':crMax<=0.5?'1/2':crMax} — Nage : ${canSwim?'<span style="color:#4caf50">✓</span>':'✗'} — Vol : ${canFly?'<span style="color:#4caf50">✓</span>':'✗'} — Charges : <strong style="color:var(--cp)">${druLvl>=20?'∞':fsUsed+'/'+fsMax}</strong></div>
    <div id="wsGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:6px;max-height:48vh;overflow-y:auto;margin-bottom:10px">
      ${available.map((b,gi)=>{const bi=BEAST_FORMS.indexOf(b);return`<div onclick="wsShowDetail(${bi})" style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:10px;cursor:pointer;text-align:center;transition:all .15s" onmouseover="this.style.borderColor='#4caf50';this.style.background='rgba(76,175,80,.06)'" onmouseout="this.style.borderColor='var(--border)';this.style.background='var(--surface2)'">
        <div style="font-size:26px;margin-bottom:4px">${b.icon}</div>
        <div style="font-size:12px;font-weight:600">${b.name}</div>
        <div style="font-size:10px;color:var(--text3)">CR ${b.crD}</div>
        <div style="font-size:10px;color:var(--text3)">${b.hpMax} PV • CA ${b.ac}</div>
      </div>`;}).join('')}
    </div>
    <div id="wsDetail" style="display:none;max-height:55vh;overflow-y:auto"></div>
    <div style="text-align:right;margin-top:8px"><button class="btn bsm" onclick="closeModal()">Annuler</button></div>`);
}

function wsShowDetail(bIdx) {
  const b = BEAST_FORMS[bIdx]; if (!b) return;
  const abN = ['FOR','DEX','CON','INT','SAG','CHA'];
  document.getElementById('wsGrid').style.display = 'none';
  document.getElementById('wsDetail').style.display = 'block';
  document.getElementById('wsDetail').innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid var(--border)">
      <span style="font-size:36px">${b.icon}</span>
      <div><div style="font-size:16px;font-weight:700;color:#4caf50">${b.name}</div>
        <div style="font-size:11px;color:var(--text3)">CR ${b.crD} • ${b.hpMax} PV • CA ${b.ac} • ${b.speed}</div>
        ${b.swim?'<span style="font-size:10px;color:#4caf50;margin-right:6px">🌊 Nage</span>':''}${b.fly?'<span style="font-size:10px;color:#4caf50">🦅 Vol</span>':''}
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:4px;margin-bottom:12px">
      ${b.ab.map((v,i)=>`<div style="background:rgba(76,175,80,.08);border:1px solid rgba(76,175,80,.3);border-radius:6px;padding:6px;text-align:center">
        <div style="font-size:9px;color:var(--text3)">${abN[i]}</div>
        <div style="font-size:16px;font-weight:700;color:#4caf50">${v}</div>
        <div style="font-size:11px;color:var(--text3)">${fmt(Math.floor((v-10)/2))}</div>
      </div>`).join('')}
    </div>
    <div style="margin-bottom:10px"><div style="font-size:10px;color:var(--cp);text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px">Attaques</div>
      ${b.attacks.map(a=>`<div style="background:var(--surface2);border-radius:6px;padding:7px 10px;margin-bottom:4px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong style="color:#4caf50;font-size:13px">${a.name}</strong>
          <span style="font-size:12px;color:var(--text2)">+${a.bonus} / <strong>${a.dmg}</strong> ${a.type}</span>
        </div>
        ${a.special?`<div style="font-size:11px;color:var(--text3);margin-top:3px">${a.special}</div>`:''}
      </div>`).join('')}
    </div>
    ${b.traits.length?`<div style="margin-bottom:14px"><div style="font-size:10px;color:var(--cp);text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px">Capacités & Traits</div>
      ${b.traits.map(t=>`<div style="font-size:12px;color:var(--text2);padding:5px 0;border-bottom:1px solid var(--border)">🐾 ${t}</div>`).join('')}
    </div>`:''}
    <div style="display:flex;gap:8px;justify-content:flex-end;padding-top:8px;border-top:1px solid var(--border)">
      <button class="btn bsm" onclick="document.getElementById('wsDetail').style.display='none';document.getElementById('wsGrid').style.display='grid'">← Retour</button>
      <button class="btn bac" style="background:rgba(76,175,80,.15);border-color:#4caf50;color:#4caf50" onclick="enterWildshape(${bIdx})">🐺 Entrer en forme</button>
    </div>`;
}

function enterWildshape(bIdx) {
  const p = P(); const b = BEAST_FORMS[bIdx]; if (!b) return;
  const druLvl = ((p.classes||[]).find(c=>c.name==='Druide')||{}).level||0;
  const fsMax = druLvl>=20?99:2;
  if (!p.combatCharges) p.combatCharges = {};
  const fsUsed = (p.combatCharges['Forme sauvage']!==undefined)?p.combatCharges['Forme sauvage']:fsMax;
  if (druLvl<20&&fsUsed<=0) { showToast('❌ Plus de charges de Forme sauvage !'); return; }
  if (druLvl<20) p.combatCharges['Forme sauvage'] = fsUsed-1;
  p.wildshape = {active:true,beastIdx:bIdx,beast:{name:b.name,icon:b.icon,hpMax:b.hpMax,hpCur:b.hpMax,ac:b.ac,speed:b.speed,ab:[...b.ab],attacks:b.attacks,traits:b.traits},savedHp:p.hp};
  closeModal(); saveAll(); render();
  showToast(`🐺 ${p.charName||'Druide'} se transforme en ${b.name} ! (${b.hpMax} PV)`);
}

function revertWildshape() {
  const p = P(); if (!p.wildshape?.active) return;
  const bName = p.wildshape.beast.name;
  p.hp = p.wildshape.savedHp;
  delete p.wildshape;
  saveAll(); render(); showToast(`🧝 Retour à la forme de druide. PV restaurés : ${p.hp}/${p.hpMax}`);
}

function openElementalModal() {
  const p = P(); const feMax = 2;
  const feUsed = (p.combatCharges||{})['FormeElementaire']!==undefined?p.combatCharges['FormeElementaire']:feMax;
  if (feUsed<=0) { showToast('❌ Plus de charges de Forme élémentaire !'); return; }
  openWideModal(`<div class="pt">🌊 Entrer en Forme élémentaire</div>
    <div style="font-size:11px;color:var(--text3);margin-bottom:10px">CR 5 — Charges : <strong style="color:var(--cp)">${feUsed}/${feMax}</strong> • Repos long</div>
    <div id="feGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:6px;margin-bottom:10px">
      ${ELEMENTAL_FORMS.map((ef,gi)=>`<div onclick="feShowDetail(${gi})" style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:10px;cursor:pointer;text-align:center;transition:all .15s" onmouseover="this.style.borderColor='#29b6f6';this.style.background='rgba(41,182,246,.06)'" onmouseout="this.style.borderColor='var(--border)';this.style.background='var(--surface2)'">
        <div style="font-size:26px;margin-bottom:4px">${ef.icon}</div>
        <div style="font-size:12px;font-weight:600">${ef.name}</div>
        <div style="font-size:10px;color:var(--text3)">CR 5</div>
        <div style="font-size:10px;color:var(--text3)">${ef.hpMax} PV • CA ${ef.ac}</div>
      </div>`).join('')}
    </div>
    <div id="feDetail" style="display:none;max-height:55vh;overflow-y:auto"></div>
    <div style="text-align:right;margin-top:8px"><button class="btn bsm" onclick="closeModal()">Annuler</button></div>`);
}

function feShowDetail(efIdx) {
  const ef = ELEMENTAL_FORMS[efIdx]; if (!ef) return;
  const abN = ['FOR','DEX','CON','INT','SAG','CHA'];
  document.getElementById('feGrid').style.display = 'none';
  document.getElementById('feDetail').style.display = 'block';
  document.getElementById('feDetail').innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid var(--border)">
      <span style="font-size:36px">${ef.icon}</span>
      <div><div style="font-size:16px;font-weight:700;color:#29b6f6">${ef.name}</div>
        <div style="font-size:11px;color:var(--text3)">CR 5 • ${ef.hpMax} PV • CA ${ef.ac} • ${ef.speed}</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:4px;margin-bottom:12px">
      ${ef.ab.map((v,i)=>`<div style="background:rgba(41,182,246,.08);border:1px solid rgba(41,182,246,.3);border-radius:6px;padding:6px;text-align:center">
        <div style="font-size:9px;color:var(--text3)">${abN[i]}</div>
        <div style="font-size:16px;font-weight:700;color:#29b6f6">${v}</div>
        <div style="font-size:11px;color:var(--text3)">${fmt(Math.floor((v-10)/2))}</div>
      </div>`).join('')}
    </div>
    <div style="margin-bottom:10px"><div style="font-size:10px;color:var(--cp);text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px">Attaques</div>
      ${ef.attacks.map(a=>`<div style="background:var(--surface2);border-radius:6px;padding:7px 10px;margin-bottom:4px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong style="color:#29b6f6;font-size:13px">${a.name}</strong>
          <span style="font-size:12px;color:var(--text2)">+${a.bonus} / <strong>${a.dmg}</strong> ${a.type}</span>
        </div>
        ${a.special?`<div style="font-size:11px;color:var(--text3);margin-top:3px">${a.special}</div>`:''}
      </div>`).join('')}
    </div>
    ${ef.traits.length?`<div style="margin-bottom:14px"><div style="font-size:10px;color:var(--cp);text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px">Capacités & Traits</div>
      ${ef.traits.map(t=>`<div style="font-size:12px;color:var(--text2);padding:5px 0;border-bottom:1px solid var(--border)">🌀 ${t}</div>`).join('')}
    </div>`:''}
    <div style="display:flex;gap:8px;justify-content:flex-end;padding-top:8px;border-top:1px solid var(--border)">
      <button class="btn bsm" onclick="document.getElementById('feDetail').style.display='none';document.getElementById('feGrid').style.display='grid'">← Retour</button>
      <button class="btn bac" style="background:rgba(41,182,246,.15);border-color:#29b6f6;color:#29b6f6" onclick="enterElementalForm(${efIdx})">🌊 Entrer en forme</button>
    </div>`;
}

function enterElementalForm(efIdx) {
  const p = P(); const ef = ELEMENTAL_FORMS[efIdx]; if (!ef) return;
  const feMax = 2;
  if (!p.combatCharges) p.combatCharges = {};
  const feUsed = (p.combatCharges['FormeElementaire']!==undefined)?p.combatCharges['FormeElementaire']:feMax;
  if (feUsed<=0) { showToast('❌ Plus de charges de Forme élémentaire !'); return; }
  p.combatCharges['FormeElementaire'] = feUsed-1;
  p.wildshape = {active:true,isElemental:true,beast:{name:ef.name,icon:ef.icon,hpMax:ef.hpMax,hpCur:ef.hpMax,ac:ef.ac,speed:ef.speed,ab:[...ef.ab],attacks:ef.attacks,traits:ef.traits},savedHp:p.hp};
  closeModal(); saveAll(); render();
  showToast(`🌊 ${p.charName||'Druide'} se transforme en ${ef.name} ! (${ef.hpMax} PV)`);
}
