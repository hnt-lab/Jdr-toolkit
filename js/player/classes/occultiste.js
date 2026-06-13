// OCCULTISTE — Panneau de combat (Magie de pacte + patron) + Familier
// ═══════════════════════════════════════

function renderOccultiste(p) {
  const wsC = p.wildshape;
  const druLvl = ((p.classes||[]).find(c=>c.name==='Druide')||{}).level||0;
  const warlockSlots = getWarlockSlots(p);
  if ((!wsC?.active || druLvl>=18) && !warlockSlots) return '';
  if (wsC?.active && druLvl<18) return '';

  const slotsUsed = p.spellSlotsUsed||[];
  const occLvl = ((p.classes||[]).find(c=>c.name==='Occultiste')||{}).level||0;
  const chaM = mod(p.abilities[5]);

  return cs('cs-warlock',`<div class="panel mb10"><div class="pt" style="display:flex;align-items:center;justify-content:space-between"><div style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span><span>Magie de pacte — Occultiste</span></div><span style="font-size:15px;color:var(--cp);border:1px solid var(--cp);border-radius:10px;padding:2px 8px">Repos court</span></div>
      <div style="font-size:18px;color:var(--text2);margin-bottom:8px">Niveau des emplacements : <strong style="color:var(--cp)">${warlockSlots[1]}</strong></div>
      <div style="display:flex;align-items:center;gap:8px">
        <div style="display:flex;gap:4px">${Array.from({length:warlockSlots[0]},(_,si)=>`<span class="slot-bubble${si<(slotsUsed[9]||0)?' used':''}" onclick="toggleWarlockSlot(${si},${warlockSlots[0]})" style="width:16px;height:16px"></span>`).join('')}</div>
        <span style="font-size:17px;color:var(--text3)">${warlockSlots[0]-(slotsUsed[9]||0)}/${warlockSlots[0]} emplacement${warlockSlots[0]>1?'s':''}</span>
        <button class="btn bsm" onclick="P().spellSlotsUsed=P().spellSlotsUsed||[];P().spellSlotsUsed[9]=0;render()">↺ Repos court</button>
      </div>
      ${(()=>{if(!occLvl)return'';const patronPath=(p.features||[]).find(f=>["L'Archifée","Le Fiélon","Le Grand Ancien","Le Génie"].includes(f.name));const isArchifee=patronPath?.name==="L'Archifée";const isFielon=patronPath?.name==="Le Fiélon";const isGrandAncien=patronPath?.name==="Le Grand Ancien";const isGenie=patronPath?.name==="Le Génie";const cc=p.combatCharges||{};let html='';
        if(occLvl>=3){const pactChoix=cc['PactChoice']||'';const pacts=[{id:'Chaîne',icon:'🔗',d:"Familier amélioré (diable, pseudodragon, quasit ou lutin) invocable en 1h de rituel."},{id:'Lame',icon:'⚔',d:"Action bonus : invoquer une arme de pacte liée (lien créé sur 1h de rituel)."},{id:'Grimoire',icon:'📖',d:"Livre des ombres : +3 cantrieps de n'importe quelle classe."}];html+=`<div style="border-top:1px solid var(--border);padding-top:10px;margin-top:8px"><div style="font-size:18px;font-weight:600;color:var(--cp);margin-bottom:6px">🤝 Faveur de pacte (niv.3)</div><div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">${pacts.map(pt=>`<button class="btn bsm${pactChoix===pt.id?' bac':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['PactChoice']='${pt.id}';saveAll();render();})()">${pt.icon} ${pt.id}</button>`).join('')}</div>${pactChoix?`<div style="font-size:17px;color:var(--text3)">${pacts.find(pt=>pt.id===pactChoix)?.d||''}</div>`:'<div style="font-size:17px;color:var(--text3);font-style:italic">Choisissez votre faveur de pacte ci-dessus.</div>'}</div>`;}
        if(isArchifee){const pfU=!!cc['PresenceFeeUsed'];const ebU=!!cc['EchappatBrumeUsed'];const sdU=!!cc['SombreDelireUsed'];html+=`<div style="border-top:1px solid var(--border);padding-top:10px;margin-top:8px"><div style="font-size:18px;font-weight:600;color:var(--cp);margin-bottom:6px">🧚 L'Archifée</div><div style="display:flex;align-items:center;gap:6px;padding:5px 8px;background:${pfU?'rgba(200,168,75,.1)':'var(--surface2)'};border:1px solid ${pfU?'var(--cp)':'var(--border)'};border-radius:6px;margin-bottom:4px"><span class="slot-bubble${pfU?' used':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['PresenceFeeUsed']=!p.combatCharges['PresenceFeeUsed'];saveAll();render();})()"></span><div><div style="font-size:17px;font-weight:600">Présence féerique (niv.1) — 1/repos court</div><div style="font-size:15px;color:var(--text3)">Action : cube 3m, JS SAG DD ${8+pb(occLvl)+chaM} ou charmé/effrayé 1 tour</div></div><button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};delete p.combatCharges['PresenceFeeUsed'];saveAll();render();})()">↺</button></div>${occLvl>=6?`<div style="display:flex;align-items:center;gap:6px;padding:5px 8px;background:${ebU?'rgba(200,168,75,.1)':'var(--surface2)'};border:1px solid ${ebU?'var(--cp)':'var(--border)'};border-radius:6px;margin-bottom:4px"><span class="slot-bubble${ebU?' used':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['EchappatBrumeUsed']=!p.combatCharges['EchappatBrumeUsed'];saveAll();render();})()"></span><div><div style="font-size:17px;font-weight:600">↪ Échappatoire brumeuse (niv.6) — 1/repos court</div><div style="font-size:15px;color:var(--text3)">Réaction sur dégâts : téléportation 18m, invisible jusqu'au prochain tour</div></div><button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};delete p.combatCharges['EchappatBrumeUsed'];saveAll();render();})()">↺</button></div>`:''}${occLvl>=10?`<div style="font-size:17px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Défenses captivantes (niv.10) — Immunité charme. Réaction : retourner un charme contre son auteur</div>`:''} ${occLvl>=14?`<div style="display:flex;align-items:center;gap:6px;padding:5px 8px;background:${sdU?'rgba(200,168,75,.1)':'var(--surface2)'};border:1px solid ${sdU?'var(--cp)':'var(--border)'};border-radius:6px"><span class="slot-bubble${sdU?' used':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['SombreDelireUsed']=!p.combatCharges['SombreDelireUsed'];saveAll();render();})()"></span><div><div style="font-size:17px;font-weight:600">Sombre délire (niv.14) — 1/repos court</div><div style="font-size:15px;color:var(--text3)">Action 18m : charmé/effrayé 1 min, illusion immersive. DD ${8+pb(occLvl)+chaM}</div></div><button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};delete p.combatCharges['SombreDelireUsed'];saveAll();render();})()">↺</button></div>`:''}  </div>`;}
        if(isFielon){const ctU=!!cc['ChanceTenebreuxUsed'];const teU=!!cc['TraverseeEnfersUsed'];const DMGT=['Acide','Feu','Froid','Foudre','Nécrotique','Poison','Psychique','Radiant','Tonnerre','Contondant','Perforant','Tranchant'];const curRes=cc['FielonResistance']||'';html+=`<div style="border-top:1px solid var(--border);padding-top:10px;margin-top:8px"><div style="font-size:18px;font-weight:600;color:var(--cp);margin-bottom:6px">😈 Le Fiélon</div><div style="font-size:17px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px;display:flex;align-items:center;justify-content:space-between;gap:6px"><span>Bénédiction du ténébreux (niv.1) — PV temp. <strong>${chaM+occLvl}</strong> à l'élimination d'un ennemi</span><button class="btn bsm" style="flex-shrink:0" onclick="(()=>{const p=P();const v=${chaM+occLvl};p.hpTemp=Math.max(p.hpTemp||0,v);saveAll();render();showBanner('🩸','PV temporaires','+'+v+' PV (Bénédiction du ténébreux)',{variant:'success'});})()">💀 Ennemi vaincu</button></div>${occLvl>=6?`<div style="display:flex;align-items:center;gap:6px;padding:5px 8px;background:${ctU?'rgba(200,168,75,.1)':'var(--surface2)'};border:1px solid ${ctU?'var(--cp)':'var(--border)'};border-radius:6px;margin-bottom:4px"><span class="slot-bubble${ctU?' used':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['ChanceTenebreuxUsed']=!p.combatCharges['ChanceTenebreuxUsed'];saveAll();render();})()"></span><div><div style="font-size:17px;font-weight:600">↪ Chance du ténébreux (niv.6) — 1/repos court</div><div style="font-size:15px;color:var(--text3)">Réaction : +1d10 à un jet d'une créature visible</div></div><button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};delete p.combatCharges['ChanceTenebreuxUsed'];saveAll();render();})()">↺</button></div>`:''}${occLvl>=10?`<div style="padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px"><div style="font-size:17px;font-weight:600;margin-bottom:4px">Résistance fiélonne (niv.10) — Choisir à chaque repos court :</div><select style="font-size:17px;padding:3px;border-radius:4px;border:1px solid var(--border);background:var(--surface2);color:var(--text2);width:100%" onchange="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['FielonResistance']=this.value;saveAll();})()"><option value="">-- Choisir --</option>${DMGT.map(t=>`<option value="${t}"${curRes===t?' selected':''}>${t}</option>`).join('')}</select>${curRes?`<div style="font-size:15px;color:#4caf50;margin-top:2px">✓ Résistance active : ${curRes}</div>`:''}</div>`:''}${occLvl>=14?`<div style="display:flex;align-items:center;gap:6px;padding:5px 8px;background:${teU?'rgba(200,168,75,.1)':'var(--surface2)'};border:1px solid ${teU?'var(--cp)':'var(--border)'};border-radius:6px"><span class="slot-bubble${teU?' used':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['TraverseeEnfersUsed']=!p.combatCharges['TraverseeEnfersUsed'];saveAll();render();})()"></span><div><div style="font-size:17px;font-weight:600">Traversée des enfers (niv.14) — 1/repos long</div><div style="font-size:15px;color:var(--text3)">Toucher → banni 1 tour, 10d10 psychiques au retour. DD ${8+pb(occLvl)+chaM}</div></div><button class="btn bsm" onclick="rollCustomDmg('10d10','Traversée des enfers')">🎲 10d10</button><button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};delete p.combatCharges['TraverseeEnfersUsed'];saveAll();render();})()">↺</button></div>`:''}  </div>`;}
        if(isGrandAncien){const peU=!!cc['ProtecEntropiqueUsed'];html+=`<div style="border-top:1px solid var(--border);padding-top:10px;margin-top:8px"><div style="font-size:18px;font-weight:600;color:var(--cp);margin-bottom:6px">🐙 Le Grand Ancien</div><div style="font-size:17px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Esprit éveillé (niv.1) — Télépathie à 9m vers toute créature comprenant une langue</div>${occLvl>=6?`<div style="display:flex;align-items:center;gap:6px;padding:5px 8px;background:${peU?'rgba(200,168,75,.1)':'var(--surface2)'};border:1px solid ${peU?'var(--cp)':'var(--border)'};border-radius:6px;margin-bottom:4px"><span class="slot-bubble${peU?' used':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['ProtecEntropiqueUsed']=!p.combatCharges['ProtecEntropiqueUsed'];saveAll();render();})()"></span><div><div style="font-size:17px;font-weight:600">↪ Protection entropique (niv.6) — 1/repos court</div><div style="font-size:15px;color:var(--text3)">Réaction : désavantage à l'attaquant. Si rate : avantage sur ton prochain jet contre lui</div></div><button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};delete p.combatCharges['ProtecEntropiqueUsed'];saveAll();render();})()">↺</button></div>`:''}  ${occLvl>=10?`<div style="font-size:17px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Bouclier mental (niv.10) — Immunité lecture de pensées, résistance dégâts psychiques</div>`:''} ${occLvl>=14?`<div style="font-size:17px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">Asservissement (niv.14) — Action : toucher humanoïde incapacité → charme permanent (JS SAG DD ${8+pb(occLvl)+chaM})</div>`:''}</div>`;}
        if(isGenie){const kinds=[{id:'Dao',icon:'⛰',el:'Contondant'},{id:'Djinn',icon:'🌪',el:'Tonnerre'},{id:'Efreet',icon:'🔥',el:'Feu'},{id:'Marid',icon:'🌊',el:'Froid'}];const gk=cc['GenieKind']||'';const elem=(kinds.find(k=>k.id===gk)||{}).el||'';const slU=!!cc['SouhaitLimiteUsed'];html+=`<div style="border-top:1px solid var(--border);padding-top:10px;margin-top:8px"><div style="font-size:18px;font-weight:600;color:var(--cp);margin-bottom:6px">🌟 Le Génie</div><div style="font-size:17px;color:var(--text3);margin-bottom:4px">Type de génie (élément) :</div><div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">${kinds.map(k=>`<button class="btn bsm${gk===k.id?' bac':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['GenieKind']='${k.id}';saveAll();render();})()">${k.icon} ${k.id}</button>`).join('')}</div>${elem?`<div style="font-size:17px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px;display:flex;align-items:center;justify-content:space-between;gap:6px"><span>⚡ Ire du génie (niv.1) — 1×/tour : +<strong>${pb(occLvl)}</strong> dégâts <strong>${elem}</strong></span><button class="btn bsm" style="flex-shrink:0" onclick="showBanner('⚡','Ire du génie','+${pb(occLvl)} dégâts ${elem} sur une cible touchée (1×/tour)',{variant:'info'})">⚡ +${pb(occLvl)}</button></div>`:'<div style="font-size:17px;color:var(--text3);font-style:italic;margin-bottom:4px">Choisis ton type de génie ci-dessus.</div>'}<div style="font-size:17px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">🍶 Catalyseur de Génie (niv.1) — Répit embouteillé : ton focaliseur sert d'abri/repos.</div>${occLvl>=6?`<div style="font-size:17px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">🛡 Présent élémentaire (niv.6) — Résistance <strong>${elem||'(choisis ton génie)'}</strong>${elem?' (appliquée auto)':''} · Vol 9m, ${Math.max(1,chaM)}×/repos long.</div>`:''}${occLvl>=10?`<div style="font-size:17px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">🏛 Sanctuaire du génie (niv.10) — 5 alliés dans le catalyseur (repos court amélioré).</div>`:''}${occLvl>=14?`<div style="display:flex;align-items:center;gap:6px;padding:5px 8px;background:${slU?'rgba(200,168,75,.1)':'var(--surface2)'};border:1px solid ${slU?'var(--cp)':'var(--border)'};border-radius:6px"><span class="slot-bubble${slU?' used':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['SouhaitLimiteUsed']=!p.combatCharges['SouhaitLimiteUsed'];saveAll();render();})()"></span><div><div style="font-size:17px;font-weight:600">🌠 Souhait limité (niv.14) — 1×/1d4 repos longs</div><div style="font-size:15px;color:var(--text3)">Lancer 1 sort niv.≤6 sans composante</div></div><button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};delete p.combatCharges['SouhaitLimiteUsed'];saveAll();render();})()">↺</button></div>`:''}</div>`;}
        if(occLvl>=11){const arcs=[{n:11,s:6},{n:13,s:7},{n:15,s:8},{n:17,s:9}].filter(a=>occLvl>=a.n);html+=`<div style="border-top:1px solid var(--border);padding-top:10px;margin-top:8px"><div style="font-size:18px;font-weight:600;color:var(--cp);margin-bottom:6px">📿 Arcanum mystique — 1 sort/niveau/repos long</div>${arcs.map(a=>{const key='ArcanumNiv'+a.s+'Used';const used=!!cc[key];return`<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><span class="slot-bubble${used?' used':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['${key}']=!p.combatCharges['${key}'];saveAll();render();})()"></span><span style="font-size:17px;color:${used?'var(--text3)':'var(--text2)'}">Niv.${a.s} ${used?'(utilisé)':'(disponible)'}</span>${used?`<button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};delete p.combatCharges['${key}'];saveAll();render();})()">↺</button>`:''}</div>`;}).join('')}</div>`;}
        if(occLvl>=20){const moUsed=!!cc['MaitreOcculteUsed'];html+=`<div style="border-top:1px solid var(--border);padding-top:10px;margin-top:8px"><div style="font-size:18px;font-weight:600;color:var(--cp);margin-bottom:4px">👑 Maître de l'occulte (niv.20)</div><div style="font-size:17px;color:var(--text2);margin-bottom:6px">Supplier ton patron 1 min → récupérer tous tes emplacements de pacte. 1×/repos long.</div><div style="display:flex;align-items:center;gap:6px"><span class="slot-bubble${moUsed?' used':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['MaitreOcculteUsed']=!p.combatCharges['MaitreOcculteUsed'];saveAll();render();})()"></span><button class="btn bsm" ${moUsed?'disabled':''} onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};if(p.combatCharges['MaitreOcculteUsed']){showToast('❌ Déjà utilisé ce repos long.');return;}p.spellSlotsUsed=p.spellSlotsUsed||[];p.spellSlotsUsed[9]=0;p.combatCharges['MaitreOcculteUsed']=true;saveAll();render();showToast('👑 Emplacements de pacte récupérés !');})()">↺ Récupérer empl.</button><button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};delete p.combatCharges['MaitreOcculteUsed'];saveAll();render();})()">↺ Repos long</button></div></div>`;}
        if(occLvl>=2&&(p.eldritchInvocations||[]).length){html+=`<div style="border-top:1px solid var(--border);padding-top:10px;margin-top:8px"><div style="font-size:18px;font-weight:600;color:var(--cp);margin-bottom:6px">📖 Manifestations occultes</div>${(p.eldritchInvocations||[]).map(name=>{const inv=(typeof ELDRITCH_INVOCATIONS!=='undefined'?ELDRITCH_INVOCATIONS:[]).find(i=>i.name===name);return`<div style="margin-bottom:5px;padding:5px 8px;background:var(--surface2);border-radius:6px"><div style="font-size:17px;font-weight:600;color:var(--cp)">${esc(name)}</div>${inv?`<div style="font-size:15px;color:var(--text3);margin-top:2px;line-height:1.4">${esc(inv.desc)}</div>`:''}</div>`;}).join('')}</div>`;}
        return html;})()}
    </div>`);
}

function renderFamilier(p) {
  const magLvl = ((p.classes||[]).find(c=>c.name==='Magicien')||{}).level||0;
  const occLvl = ((p.classes||[]).find(c=>c.name==='Occultiste')||{}).level||0;
  if (!magLvl && !occLvl) return '';
  const fam = p.familiar;
  if (!fam || !fam.active) {
    // Pas de familier actif → pas de panneau entier (demande 2026-06-12) : une ligne discrète suffit.
    return cs('cs-familiar',`<div style="margin-bottom:10px">${fam&&!fam.active?`<button class="btn bsm bac" onclick="recallFamiliar()">🦉 Reconvoquer ${esc(fam.name)}</button>`:`<button class="btn bsm" style="color:var(--text3)" onclick="openFamiliarModal()">🦉 Configurer un familier</button>`}</div>`);
  }
  const fpct = Math.round(fam.hpCur/Math.max(1,fam.hpMax)*100);
  const fhpColor = fpct>50?'#4caf50':fpct>25?'#ff9800':'#e53935';
  return cs('cs-familiar',`<div class="panel mb10" style="border-color:rgba(200,168,75,.35)"><div class="pt" style="display:flex;align-items:center;justify-content:space-between"><div style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span><span>${fam.icon} Familier — ${fam.name}</span></div><div style="display:flex;gap:6px"><button class="btn bsm" onclick="openFamiliarModal()" title="Configurer">⚙</button><button class="btn bsm bdanger" onclick="revokeFamiliar()">✕ Révoquer</button></div></div>
      <div class="g3 mb6">
        <div class="sb hi"><div class="sn">PV</div><div style="font-size:25px;font-weight:700;color:${fhpColor}">${fam.hpCur}</div><div class="sm">${fam.hpCur}/${fam.hpMax}</div></div>
        <div class="sb"><div class="sn">CA</div><div style="font-size:25px;font-weight:700">${fam.ac}</div></div>
        <div class="sb"><div class="sn">Vitesse</div><div style="font-size:15px;font-weight:600;line-height:1.3">${fam.speed}</div></div>
      </div>
      <div class="hp-bar mb6"><div class="hp-fill" style="width:${fpct}%;background:${fhpColor}"></div></div>
      <button class="btn bsm" style="width:100%;margin-bottom:8px;background:#b71c1c;color:#fff;border-color:#b71c1c" onclick="openFamiliarHpModal()">💥 Dégâts / 💚 Soins</button>
      <div class="g6 mb8">${ABILITIES_SH.map((ab,i)=>`<div class="sb" style="padding:3px"><div class="sn" style="font-size:13px">${ab}</div><div style="font-size:18px;font-weight:600">${fam.ab[i]}</div><div class="sm" style="font-size:13px">${fmt(Math.floor((fam.ab[i]-10)/2))}</div></div>`).join('')}</div>
      ${fam.attacks.length?`<div style="margin-bottom:8px"><div class="fl mb4">Attaques</div>${fam.attacks.map(a=>`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:6px 10px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center"><div><strong style="font-size:18px">${a.name}</strong>${a.special?`<div style="font-size:15px;color:var(--text3)">${a.special}</div>`:''}</div><div style="display:flex;align-items:center;gap:6px"><span style="font-size:17px;color:var(--text2)">+${a.bonus} / <strong>${a.dmg}</strong> ${a.type}</span><button class="btn bsm" onclick="rollAttack('${jsq(a.name)}',${a.bonus},'${a.dmg}')" title="Jet d'attaque + dégâts">🎲</button></div></div>`).join('')}</div>`:''}
      ${fam.traits.length?`<div><div class="fl mb4">Traits</div>${fam.traits.map(t=>`<div style="font-size:17px;color:var(--text2);padding:2px 0">▹ ${t}</div>`).join('')}</div>`:''}
    </div>`);
}

function toggleWarlockSlot(si, total) {
  const p = P();
  if (!p.spellSlotsUsed) p.spellSlotsUsed = [];
  const u = p.spellSlotsUsed[9]||0;
  p.spellSlotsUsed[9] = u>si?u-1:Math.min(total,u+1);
  render();
}

function openFamiliarModal() {
  const p = P(); const fam = p.familiar;
  openWideModal(`<div class="pt">🦉 Configurer un familier</div>
    <div style="font-size:17px;color:var(--text3);margin-bottom:10px">Familiers classiques (Trouver un familier) et Pacte de la Chaîne (Occultiste niv.3). Choisissez un type SRD ou modifiez ses PV/CA librement après.</div>
    <div id="famGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:6px;max-height:38vh;overflow-y:auto;margin-bottom:10px">
      ${FAMILIAR_TYPES.map((f,i)=>`<div onclick="famShowDetail(${i})" style="background:var(--surface2);border:1px solid ${fam&&fam.name===f.name?'var(--cp)':'var(--border)'};border-radius:8px;padding:8px 6px;cursor:pointer;text-align:center;transition:all .15s" onmouseover="this.style.borderColor='var(--cp)'" onmouseout="this.style.borderColor='${fam&&fam.name===f.name?'var(--cp)':'var(--border)'}'">
        <div style="font-size:22px;margin-bottom:3px">${f.icon}</div>
        <div style="font-size:15px;font-weight:600;line-height:1.2">${f.name}</div>
        <div style="font-size:13px;color:var(--text3);margin-top:2px">${f.attacks.length?'⚔ Attaque':'🕊 Passif'}</div>
      </div>`).join('')}
    </div>
    <div id="famDetail" style="min-height:80px"></div>
    <div style="display:flex;justify-content:flex-end;margin-top:10px;gap:8px">
      ${fam?`<button class="btn bsm bdanger" onclick="removeFamiliar()">Supprimer</button>`:''}
      <button class="btn bsm" onclick="closeModal()">Annuler</button>
    </div>`);
  if (fam) { const idx=FAMILIAR_TYPES.findIndex(f=>f.name===fam.name); if (idx>=0) famShowDetail(idx); }
}

function famShowDetail(idx) {
  const f = FAMILIAR_TYPES[idx]; const el = document.getElementById('famDetail'); if (!el) return;
  el.innerHTML = `<div style="background:rgba(200,168,75,.06);border:1px solid rgba(200,168,75,.2);border-radius:10px;padding:12px">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
      <span style="font-size:30px">${f.icon}</span>
      <div><div style="font-size:19px;font-weight:700;color:var(--cp)">${f.name}</div><div style="font-size:17px;color:var(--text3)">PV ${f.hp} • CA ${f.ac} • ${f.speed}</div></div>
    </div>
    <div class="g6 mb8">${ABILITIES_SH.map((ab,i)=>`<div class="sb" style="padding:3px"><div class="sn" style="font-size:13px">${ab}</div><div style="font-size:18px;font-weight:600">${f.ab[i]}</div><div class="sm" style="font-size:13px">${fmt(Math.floor((f.ab[i]-10)/2))}</div></div>`).join('')}</div>
    ${f.attacks.length?`<div style="margin-bottom:8px"><div style="font-size:15px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Attaques</div>${f.attacks.map(a=>`<div style="font-size:18px;color:var(--text2);padding:2px 0">${a.name} : <strong>+${a.bonus}</strong> / ${a.dmg} ${a.type}${a.special?` • <em style="font-size:17px">${a.special}</em>`:''}</div>`).join('')}</div>`:''}
    ${f.traits.length?`<div style="margin-bottom:10px"><div style="font-size:15px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Traits</div>${f.traits.map(t=>`<div style="font-size:17px;color:var(--text2);padding:2px 0">▹ ${t}</div>`).join('')}</div>`:''}
    <button class="btn bac" style="width:100%;margin-top:4px" onclick="setFamiliar(${idx})">🦉 Convoquer ce familier</button>
  </div>`;
}

function setFamiliar(idx) {
  const p = P(); const f = FAMILIAR_TYPES[idx];
  p.familiar = {name:f.name,icon:f.icon,hpMax:f.hp,hpCur:f.hp,ac:f.ac,speed:f.speed,ab:[...f.ab],attacks:f.attacks.map(a=>({...a})),traits:[...f.traits],active:true};
  closeModal(); saveAll(); render(); showToast(`🦉 ${f.name} convoqué !`);
}

function revokeFamiliar() {
  const p = P(); if (!p.familiar) return;
  p.familiar.active = false; saveAll(); render(); showToast('🦉 Familier renvoyé dans le plan éthéré.');
}

function recallFamiliar() {
  const p = P(); if (!p.familiar) return;
  p.familiar.hpCur = p.familiar.hpMax; p.familiar.active = true;
  saveAll(); render(); showToast(`🦉 ${p.familiar.name} reconvoqué !`);
}

function removeFamiliar() {
  const p = P(); delete p.familiar; closeModal(); saveAll(); render(); showToast('🦉 Familier supprimé.');
}

// Modal Dégâts/Soins du familier — calqué sur openHpModal (perso)
function openFamiliarHpModal(){
  const fam=P().familiar;if(!fam||!fam.active)return;
  openModal(`<div class="pt">🦉 PV — ${esc(fam.name||'Familier')}</div>
    <span id="famHpModalMarker" style="display:none"></span>
    <div class="fl mb6">Montant</div>
    <input class="fi" id="famHpDelta" type="number" min="0" placeholder="ex : 8" style="margin-bottom:14px">
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1;background:#b71c1c;color:#fff;border-color:#b71c1c" onclick="_famApplyHp(-1)">💥 Dégâts</button>
      <button class="btn" style="flex:1;background:#2e7d32;color:#fff;border-color:#2e7d32" onclick="_famApplyHp(1)">💚 Soins</button>
    </div>`);
  setTimeout(()=>{const i=document.getElementById('famHpDelta');if(i)i.focus();},60);
}
function _famApplyHp(sign){
  applyFamiliarHp(sign);
  if(document.getElementById('famHpModalMarker'))closeModal();
}
function applyFamiliarHp(sign) {
  const p = P(); const fam = p.familiar; if (!fam?.active) return;
  const delta = parseInt(document.getElementById('famHpDelta')?.value)||0; if (delta<=0) return;
  if (sign<0) {
    fam.hpCur = Math.max(0,fam.hpCur-delta);
    if (fam.hpCur<=0) { fam.active=false; showBanner('💀','Familier dissipé',(fam.name||'Le familier')+' tombe à 0 PV',{variant:'danger'}); }
  } else {
    fam.hpCur = Math.min(fam.hpMax,fam.hpCur+delta);
  }
  saveAll(); render();
}
