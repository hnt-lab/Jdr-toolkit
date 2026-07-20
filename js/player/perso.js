
// ═══════════════════════════════════════
// RAIL PERSO (résumé persistant — lecture seule ; l'édition reste dans l'onglet Perso)
// ═══════════════════════════════════════
function renderCharRail(p){
  if(!p||!p.created) return '';
  const cls=(p.classes||[]).map(c=>`${c.name} ${c.level}`).join(' / ')||'';
  const align=p.alignment||p.align||'';
  const ws=p.wildshape;
  const mj=isMJ();
  const _exhLvl=p.exhaustion||0;
  const effectiveHpMax=_exhLvl>=4?Math.floor(p.hpMax/2):p.hpMax;
  const pct=Math.max(0,Math.min(100,Math.round((ws?.active?ws.beast.hpCur/Math.max(1,ws.beast.hpMax):p.hp/Math.max(1,effectiveHpMax))*100)));
  const hpColor=ws?.active?'var(--good)':pct>50?'var(--good)':pct>25?'var(--warn)':'var(--danger)';
  const caBonus=(p.statuses||[]).filter(s=>s.stat==='ca').reduce((a,s)=>a+(parseInt(s.value)||0),0);
  const hpBonus=(p.statuses||[]).filter(s=>s.stat==='hp').reduce((a,s)=>a+(parseInt(s.value)||0),0);
  const caDisplay=p.ac+caBonus;
  const dexM=mod(p.abilities[1]);
  // (Caracs déplacées dans l'onglet Personnage — décision maquette 2026-07-19 :
  //  le rail ne garde que CA / PV / Init / Vitesse. Voir _caracsChipsHTML.)
  // Rail = UNE ligne compacte CA · jauge PV (tap = Dégâts/Soins) · Init · Vitesse (maquette 2026-07-20).
  // Le bouton Dégâts/Soins vit en tête de l'onglet COMBAT (double accès validé P2-Q3).
  let barText,hpExtra='';
  if(ws?.active){
    barText=`🐺 ${ws.beast.hpCur}/${ws.beast.hpMax}`;
    hpExtra=`<button class="btn bsm" style="width:100%;margin-top:6px;border-color:rgba(76,175,80,.5);color:var(--good)" onclick="revertWildshape()">↩ Reprendre forme</button>`;
  } else {
    barText=`${p.hp}${(p.hpTemp||0)>0?`+${p.hpTemp}`:''}/${effectiveHpMax}${_exhLvl>=4?' ½':''}`;
    hpExtra=`${(p.shieldHp||0)>0?`<div class="rail-shield">🔵 Bouclier ${p.shieldHp}/${p.shieldHpMax||p.shieldHp}</div>`:''}
      ${mj?`<div class="rail-mjhp"><label>PV max <input type="number" min="1" value="${p.hpMax}" oninput="P().hpMax=Math.max(1,parseInt(this.value)||1);render()"></label><label>Temp <input type="number" min="0" value="${p.hpTemp||0}" oninput="P().hpTemp=Math.max(0,parseInt(this.value)||0)"></label></div>`:''}
      ${p.hp<=0?`<div class="rail-down">💀 À TERRE — 0 PV${p.deathSaves?.fail>=3?' ☠':''}</div><div class="rail-ds"><span style="color:var(--good)">✓</span>${[0,1,2].map(i=>`<span class="ds-circle${i<(p.deathSaves?.success||0)?' s':''}" onclick="cycleDS('success',${i})"></span>`).join('')}<span style="color:var(--danger);margin-left:10px">✗</span>${[0,1,2].map(i=>`<span class="ds-circle${i<(p.deathSaves?.fail||0)?' f':''}" onclick="cycleDS('fail',${i})"></span>`).join('')}</div>`:''}`;
  }
  // Vitesse (forme sauvage / barbare rapide / épuisement)
  const _barbLvl=((p.classes||[]).find(c=>c.name==='Barbare')||{}).level||0;
  const _chestSrd=((p.equip||{}).chest?.name)?SRD.armors.find(a=>a.name===((p.equip||{}).chest?.name)):null;
  const _isHeavy=!!(_chestSrd&&_chestSrd.type!=='Bouclier'&&_chestSrd.type!=='Légère'&&_chestSrd.type!=='Intermédiaire');
  const _fastMove=_barbLvl>=5&&!_isHeavy;
  const _encum=(typeof getEncumbrance==='function')?getEncumbrance(p):null; // malus d'encombrement (sac.js)
  const _spdBase=Math.max(0,(p.speed||9)+(_fastMove?3:0)-(_encum?_encum.speedMalus:0));
  const _spd=_exhLvl>=5?0:(_exhLvl>=2?Math.floor(_spdBase/2):_spdBase);
  const spdVal=ws?.active?ws.beast.speed:(_spd+' m');
  const caVal=ws?.active?ws.beast.ac:caDisplay;
  const initVal=ws?.active?fmt(Math.floor((ws.beast.ab[1]-10)/2)):fmt(dexM);
  return `
    <div class="rail-id">
      ${p.portrait?`<img class="rail-portrait" src="${p.portrait}" onclick="document.getElementById('portInput')?.click()">`:`<div class="rail-portrait rail-portrait-ph" onclick="document.getElementById('portInput')?.click()">🧑</div>`}
      <input type="file" id="portInput" accept="image/jpeg,image/png" style="display:none" onchange="uploadPortrait(this)">
      <div class="rail-id-txt" style="min-width:0">
        <div class="rail-name">${esc(p.charName||'Personnage')}${ws?.active?' 🐺':''}<span id="playerSyncDot" class="sync-dot" title="Mis à jour en temps réel"></span></div>
        <div class="rail-sub">${esc(p.race||'')}${cls?' · '+esc(cls):''}${align?' · '+esc(align):''}</div>
      </div>
      <button class="rail-gear" onclick="showHub()" title="Retour aux tables">🧭</button>
      <button class="rail-gear" onclick="openUserSettings()" title="Profil & options">⚙</button>
    </div>
    <div class="rail-vitals">
      <div class="dsv-row">
        <span class="dsv-stat" title="Classe d'armure">🛡 <b>${caVal}</b></span>
        <div class="hp-bar hp-bar-hero" onclick="openHpModal()" title="Dégâts / Soins"><div class="hp-fill" style="width:${pct}%;background:${ws?.active?'var(--good)':hpColor}"></div><span class="dsv-hp">${barText}</span></div>
        <span class="dsv-stat" title="Initiative">⚡ <b>${initVal}</b></span>
        <span class="dsv-stat" title="Vitesse">👣 <b>${spdVal}</b></span>
      </div>
      ${hpExtra}
    </div>
    `;
}

// Caractéristiques + états/résistances — vivent dans l'onglet PERSONNAGE (maquette :
// le rail ne garde que CA/PV/Init/Vitesse). MJ éditable, forme sauvage reflétée.
function _caracsChipsHTML(p){
  const ws=p.wildshape;const mj=isMJ();
  const caracs=ABILITIES_SH.map((ab,i)=>{
    const totalBonus=(p.statuses||[]).filter(s=>s.stat===ab.toLowerCase()).reduce((a,s)=>a+(parseInt(s.value)||0),0);
    const finalVal=p.abilities[i]+totalBonus;
    if(ws?.active) return `<div class="rail-carac" style="border-color:var(--good)"><div class="rail-carac-n">${ab}</div><div class="rail-carac-v" style="color:var(--good)">${ws.beast.ab[i]}</div><div class="rail-carac-m" style="color:var(--good)">${fmt(Math.floor((ws.beast.ab[i]-10)/2))}</div></div>`;
    if(mj) return `<div class="rail-carac"><div class="rail-carac-n">${ab}</div><input type="number" min="1" max="30" value="${p.abilities[i]}" oninput="P().abilities[${i}]=Math.min(30,Math.max(1,parseInt(this.value)||10));render()" class="rail-carac-input"><div class="rail-carac-m">${fmt(mod(finalVal))}</div></div>`;
    return `<div class="rail-carac"><div class="rail-carac-n">${ab}</div><div class="rail-carac-v"${totalBonus?' style="color:var(--good)"':''}>${finalVal}</div><div class="rail-carac-m">${fmt(mod(finalVal))}</div></div>`;
  }).join('');
  const resist=(typeof getEffectiveResistances==='function')?getEffectiveResistances(p):[];
  const _encum=(typeof getEncumbrance==='function')?getEncumbrance(p):null;
  const chips=(p.statuses||[]).slice(0,8).map(s=>`<span class="rail-chip">${esc(s.icon||'•')} ${esc(s.name||s.stat||'')}</span>`).join('')+resist.map(t=>`<span class="rail-chip rail-resist">🛡 ${esc(t)}</span>`).join('')+(_encum&&_encum.level?`<span class="rail-chip" style="color:${_encum.level===2?'var(--danger)':'var(--warn)'};border-color:${_encum.level===2?'rgba(229,57,53,.4)':'rgba(255,152,0,.4)'}">🎒 ${_encum.label} (−${_encum.speedMalus} m)</span>`:'');
  return`<div class="rail-caracs" style="margin-bottom:10px">${caracs}</div>
    ${chips?`<div class="rail-chips" style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px">${chips}</div>`:''}`;
}

// ═══════════════════════════════════════
// TAB: PERSONNAGE
// ═══════════════════════════════════════
function tabPerso(p){
  const mc=mainClass(p);const cd=mc?SRD.classes.find(c=>c.name===mc.name):null;const rd=SRD.races.find(r=>r.name===p.race);
  const lvl=totalLevel(p);const dexM=mod(p.abilities[1]);
  const ws=p.wildshape;
  const _exhLvl=p.exhaustion||0;
  const effectiveHpMax=_exhLvl>=4?Math.floor(p.hpMax/2):p.hpMax;
  const pct=Math.max(0,Math.min(100,Math.round((ws?.active?ws.beast.hpCur/Math.max(1,ws.beast.hpMax):p.hp/Math.max(1,effectiveHpMax))*100)));
  const hpColor=ws?.active?'var(--good)':pct>50?'var(--good)':pct>25?'var(--warn)':'var(--danger)';

  // Calcul CA affichée avec statuts
  const caBonus=(p.statuses||[]).filter(s=>s.stat==='ca').reduce((a,s)=>a+(parseInt(s.value)||0),0);
  const hpBonus=(p.statuses||[]).filter(s=>s.stat==='hp').reduce((a,s)=>a+(parseInt(s.value)||0),0);
  const caDisplay=p.ac+caBonus;
  const hpDisplay=p.hp+hpBonus;

  return`${_caracsChipsHTML(p)}<div class="g2">
  <!-- COLONNE GAUCHE -->
  <div data-csgroup="perso-gauche">
    <!-- (Portrait déplacé dans le rail ; caractéristiques ci-dessus — _caracsChipsHTML) -->

    ${ws?.active?`<div class="panel mb10" style="border-color:rgba(76,175,80,.4);background:rgba(76,175,80,.04)">
      <div class="pt" style="color:var(--good);display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span>${ws.beast.icon} ${esc(ws.beast.name)} — Attaques & Traits</div>
      ${ws.beast.attacks.map(a=>`<div style="background:rgba(76,175,80,.08);border:1px solid rgba(76,175,80,.2);border-radius:2px;padding:8px 10px;margin-bottom:6px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong style="color:var(--good);font-size:13px">${esc(a.name)}</strong>
          <span style="color:var(--text2);font-size:13px">+${a.bonus} / <strong>${esc(a.dmg)}</strong> ${esc(a.type||'')}</span>
        </div>
        ${a.special?`<div style="font-size:13px;color:var(--text3);margin-top:3px">${esc(a.special)}</div>`:''}
        <button class="btn bsm" style="margin-top:6px;border-color:rgba(76,175,80,.4);color:var(--good)" onclick="rollAttack('${jsq(a.name)}',${a.bonus},'${jsq(a.dmg)}')" title="Jet d'attaque + dégâts">⚔ Attaque</button>
      </div>`).join('')}
      ${ws.beast.traits.map(t=>`<div style="font-size:13px;color:var(--text2);padding:5px 0;border-bottom:1px solid rgba(76,175,80,.15)">🐾 ${esc(t)}</div>`).join('')}
    </div>`:''}

    <!-- Résistances & Immunités (rétractable) -->
    <div class="panel">
      <div class="pt" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px">
        <span style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span>🎯 Statuts & Résistances</span>
        <div style="display:flex;gap:6px">
          <button class="btn bsm" onclick="openAddStatus()">+ Statut</button>
          <button class="btn bsm" onclick="openResistModal()">+ Résist./Immu</button>
        </div>
      </div>
      ${(()=>{
        const sts=p.statuses||[];
        const res=p.dmgResistances||[];const imm=p.dmgImmunities||[];const ci=p.condImmunities||[];
        const passRes=getPassiveResistances(p);const passImm=getPassiveImmunities(p);
        const tag=(cat,val,i)=>`<span class="status-badge bonus" style="cursor:pointer" title="Retirer" onclick="removeResist('${cat}',${i})">🛡 ${esc(val)} ✕</span>`;
        const tagImm=(cat,val,i)=>`<span class="status-badge malus" style="background:#2e1b00;border-color:var(--warn);color:var(--warn);cursor:pointer" title="Retirer" onclick="removeResist('${cat}',${i})">✦ ${esc(val)} ✕</span>`;
        const tagCond=(cat,val,i)=>`<span class="status-badge malus" style="cursor:pointer" title="Retirer" onclick="removeResist('${cat}',${i})">🚫 ${esc(val)} ✕</span>`;
        const empty='<span style="font-size:13px;color:var(--text3);font-style:italic">Aucune</span>';
        const lockR=v=>`<span class="status-badge bonus" style="opacity:.85" title="Résistance passive (automatique)">🛡 ${esc(v)} 🔒</span>`;
        const lockI=v=>`<span class="status-badge malus" style="background:#2e1b00;border-color:var(--warn);color:var(--warn);opacity:.85" title="Immunité passive (automatique)">✦ ${esc(v)} 🔒</span>`;
        const stRow=(s,i)=>`<span class="status-badge ${s.type||'neutral'}" title="${esc(s.desc||'')}">${s.icon||'◆'} ${esc(s.name||'')}${(s.value&&s.stat)?` ${s.value>0?'+':''}${s.value} ${esc(s.stat.toUpperCase())}`:''} <span onclick="event.stopPropagation();removeStatus(${i})" style="cursor:pointer;font-weight:700;opacity:.7">×</span></span>`;
        const lbl=t=>`<div style="font-size:12px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">${t}</div>`;
        return`<div style="margin-bottom:10px">${lbl('Statuts actifs')}<div style="display:flex;flex-wrap:wrap;gap:4px">${sts.length?sts.map(stRow).join(''):empty}</div></div>
        <div style="margin-bottom:8px">${lbl('Résistances dégâts')}<div style="display:flex;flex-wrap:wrap;gap:4px">${(res.length||passRes.length)?res.map((v,i)=>passRes.includes(v)?'':tag('dmgResistances',v,i)).join('')+passRes.map(lockR).join(''):empty}</div></div>
        <div style="margin-bottom:8px">${lbl('Immunités dégâts')}<div style="display:flex;flex-wrap:wrap;gap:4px">${(imm.length||passImm.length)?imm.map((v,i)=>passImm.includes(v)?'':tagImm('dmgImmunities',v,i)).join('')+passImm.map(lockI).join(''):empty}</div></div>
        <div>${lbl('Immunités conditions')}<div style="display:flex;flex-wrap:wrap;gap:4px">${ci.length?ci.map((v,i)=>tagCond('condImmunities',v,i)).join(''):empty}</div></div>`;
      })()}
    </div>
    <!-- Sauvegardes (déplacé depuis Combat — concerne tous les jets) -->
    <div class="panel"><div class="pt">Sauvegardes</div>
      ${(()=>{const rageActive=(p.combatCharges||{})['RageActive']===true;return ABILITIES_SH.map((ab,i)=>{const saves=CLASS_SAVES[mc?mc.name:'']||[];const hasSave=saves.includes(i);const m=mod(p.abilities[i])+(hasSave?pb(lvl):0);const forRageAdv=i===0&&rageActive;return forRageAdv?`<div style="display:flex;align-items:center;gap:3px"><div class="save-btn" style="flex:1" onclick="rollSave('${ab}',${m})"><span class="save-dot${hasSave?' p':''}"></span><span style="flex:1;font-size:13px">${ab}</span><span style="color:var(--cp);font-weight:600">${fmt(m)}</span><span style="font-size:12px;color:var(--text3)">🎲</span></div><button class="btn bsm" style="padding:2px 6px;color:var(--danger);border-color:var(--danger);font-size:12px;flex-shrink:0" onclick="rollSave('${ab}',${m},1)" title="Avantage (rage)">🔥⚡</button></div>`:`<div class="save-btn" onclick="rollSave('${ab}',${m})"><span class="save-dot${hasSave?' p':''}"></span><span style="flex:1;font-size:13px">${ab}</span><span style="color:var(--cp);font-weight:600">${fmt(m)}</span><span style="font-size:12px;color:var(--text3)">🎲</span></div>`;}).join('');})()}
    </div>
  </div>

  <!-- COLONNE DROITE -->
  <div data-csgroup="perso-droite">
    <!-- Identité -->
    <div class="panel mb10">
      <div class="pt" style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span>Identité</div>
      <div class="fl mb6">Nom</div>
      <input class="fi mb6" value="${esc(p.charName)}" onchange="upd('charName',this.value);render()">

      ${(p.classes||[]).map(c=>{const d=SRD.classes.find(cl=>cl.name===c.name);if(!d)return'';return`<div style="background:var(--surface2);border-radius:2px;padding:8px 10px;margin-bottom:6px">
        <div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em">Classe</div>
        <div style="font-size:13px;color:var(--cp);font-weight:600;margin-top:2px">${esc(c.name)} — Niveau ${c.level}</div>
        <div style="font-size:13px;color:var(--text2);margin-top:2px">Dé: ${d.hd} • Armures: ${esc(d.armor.split(',')[0])}${d.spellcaster?' • <span style="color:var(--cp)">✦ Lanceur de sorts</span>':''}</div>
      </div>`;}).join('')}

      ${rd?`<div style="background:var(--surface2);border-radius:2px;padding:8px 10px;margin-bottom:6px">
        <div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em">Race</div>
        <div style="font-size:13px;color:var(--cp);font-weight:600;margin-top:2px">${esc(p.race)}</div>
        <div style="font-size:13px;color:var(--text2);margin-top:2px">Langues : ${esc(rd.languages)}</div>
      </div>`:''}

      <div class="fl mb6">Historique</div>
      <div class="acw mb6">
        <input class="fi" id="bgInputPerso" value="${esc(p.background)}" placeholder="Historique..." oninput="searchBgPerso(this.value)" autocomplete="off">
        <div class="acd" id="bgDropPerso"></div>
      </div>
      <div class="g2 mb6">
        <div><div class="fl mb6">Niveau total</div><input class="fi" value="${lvl}" readonly style="color:var(--cp);font-weight:600"></div>
        <div><div class="fl mb6">Bonus maîtrise</div><input class="fi" value="+${pb(lvl)}" readonly style="color:var(--cp);font-weight:600"></div>
      </div>
      <div class="fl mb6">Alignement</div>
      ${(()=>{if(isMJ())return '<select class="fi mb6" onchange="upd(\'alignment\',this.value)">'+['',...ALIGNMENTS].map(a=>'<option'+(p.alignment===a?' selected':'')+'>'+a+'</option>').join('')+'</select>';return '<div class="fi mb6" style="opacity:.85;min-height:38px;display:flex;align-items:center">'+esc(p.alignment||'Non défini')+'</div>';})()}



      <!-- Inspiration -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:var(--surface2);border-radius:2px">
        <span style="font-size:13px;color:var(--text2)">Inspiration</span>
        <span onclick="toggleInspiration()" style="cursor:pointer;font-size:17px">${p.inspiration?'✦':'✧'}</span>
      </div>
    </div>

    <!-- Repos (colonne droite, sous Identité) -->
    ${(()=>{
      const _chantG=(typeof _groupData!=='undefined'?_groupData:[]).find(gp=>gp.uid!==(typeof currentUser!=='undefined'?currentUser?.uid:null)&&gp.charData?.combatCharges?.ChantReposantResult!==undefined);
      const _chantB=_chantG?.charData.combatCharges.ChantReposantResult;
      const _chantSrc=_chantG?.charData.charName||'Barde';
      const _restLocked=(typeof _activeCombatState!=='undefined'&&_activeCombatState&&_activeCombatState.active);
      return`<div class="panel mb10">
        <div class="pt" style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span>Repos</div>
        <div style="display:flex;gap:8px;${_chantB?'padding:6px;border:2px solid var(--cp);border-radius:2px;background:rgba(200,168,75,.04)':''}">
          <div class="rest-btn short"${_restLocked?' style="opacity:.45;pointer-events:none" title="Pas de repos en combat"':''} onclick="doShortRest()">
            <div style="font-size:16px">☕</div>
            <div style="font-weight:600">Repos court</div>
            <div style="font-size:12px;color:var(--text3);margin-top:1px">≥ 1 heure</div>
            <div style="font-size:12px;margin-top:2px">Lance le dé de vie + CON</div>
            ${_chantB?`<div style="font-size:12px;color:var(--cp);font-weight:600;margin-top:4px;border-top:1px solid rgba(200,168,75,.3);padding-top:3px">🎶 +${_chantB} PV (${esc(_chantSrc)})</div>`:''}
          </div>
          <div class="rest-btn long"${_restLocked?' style="opacity:.45;pointer-events:none" title="Pas de repos en combat"':''} onclick="doLongRest()">
            <div style="font-size:16px">🌙</div>
            <div style="font-weight:600">Repos long</div>
            <div style="font-size:12px;color:var(--text3);margin-top:1px">≥ 8 heures</div>
            <div style="font-size:12px;margin-top:2px">PV max + sorts + charges</div>
          </div>
        </div>
      </div>`;
    })()}

  </div>
  </div>`;
}

// ── CONFIDENTIALITÉ ──
function togglePrivacy(key,val){
  const p=P();
  if(!p.privacy)p.privacy={};
  p.privacy[key]=val;
  saveAll();
}
function openPrivacySettings(){
  const p=P();
  const priv=p.privacy||{};
  const tabs=[
    {id:'perso',label:'⚔ Personnage',desc:'Nom, race, classe, apparence'},
    {id:'competences',label:'✦ Compétences',desc:'Compétences & modificateurs'},
    {id:'combat',label:'🗡 Combat',desc:'PV, CA, attaques'},
    {id:'sorts',label:'✦ Sorts',desc:'Liste de sorts'},
    {id:'equipement',label:'🛡 Équipement',desc:'Armures & armes'},
    {id:'sac',label:'🎒 Sac',desc:'Inventaire & monnaie'},
    {id:'historique',label:'📜 Historique',desc:'Traits, backstory (pas les secrets)'},
    {id:'xp',label:'✧ Expérience',desc:'XP & niveau'},
  ];
  openModal(`<div class="pt">🔒 Confidentialité</div>
    <div style="font-size:13px;color:var(--text3);margin-bottom:14px">Le MJ voit toujours tout. Choisissez ce que les autres joueurs peuvent voir onglet par onglet.</div>
    ${tabs.map(t=>{
      const checked=priv[t.id]!==false;
      return`<label style="display:flex;align-items:center;gap:10px;padding:8px 4px;cursor:pointer;border-bottom:1px solid var(--border)">
        <input type="checkbox" ${checked?'checked':''} onchange="togglePrivacy('${t.id}',this.checked)" style="width:16px;height:16px;accent-color:var(--cp);flex-shrink:0">
        <div>
          <div style="font-size:13px;font-weight:600">${t.label}</div>
          <div style="font-size:13px;color:var(--text3)">${t.desc}</div>
        </div>
      </label>`;
    }).join('')}
    <div style="font-size:13px;color:var(--text3);margin-top:10px;padding:8px;background:rgba(200,168,75,.06);border-radius:2px;border:1px solid rgba(200,168,75,.15)">🔐 Les <strong>Secrets</strong> (onglet Historique) sont toujours privés — uniquement toi et le MJ.</div>
    <div style="display:flex;justify-content:flex-end;margin-top:14px"></div>`);
}

// ── PV & HP ──
// ── Résistances / immunités effectives (manuelles + passives) — Fondation 4 ──
// Le code de classe/archétype peut alimenter p.autoResist / p.autoImmun (tableaux) au fil du BLOC 3.
function getPassiveResistances(p){
  const r=[];
  if(p.race==='Tieffelin')r.push('Feu');
  // Résistances raciales (passives → verrouillées, non supprimables)
  const _RR={'Nain des montagnes':['Poison'],'Nain des collines':['Poison'],'Halfelin robuste':['Poison'],'Aasimar':['Nécrotique','Radiant'],'Goliath':['Froid']};
  if(_RR[p.race])r.push(..._RR[p.race]);
  // Dragonide — résistance au type de dégâts de son ascendance draconique
  if((p.race||'').startsWith('Dragonide')&&p.draconicAncestry&&typeof SRD!=='undefined'&&SRD.draconicAncestries){const anc=SRD.draconicAncestries.find(a=>a.name===p.draconicAncestry);if(anc&&anc.damage)r.push(anc.damage);}
  if(Array.isArray(p.autoResist))r.push(...p.autoResist);
  r.push(..._classPassiveResist(p));
  return [...new Set(r)];
}
// Résistances passives calculées depuis l'état de classe (étendu classe par classe au BLOC 3)
function _classPassiveResist(p){
  const r=[];const feats=p.features||[];const cc=p.combatCharges||{};
  const occLvl=((p.classes||[]).find(c=>c.name==='Occultiste')||{}).level||0;
  // Occultiste — Le Fiélon : Résistance fiélonne (niv.10, type choisi au repos court)
  if(occLvl>=10&&feats.some(f=>f.name==='Le Fiélon')&&cc['FielonResistance'])r.push(cc['FielonResistance']);
  // Occultiste — Le Grand Ancien : Bouclier mental (niv.10) → résistance psychique
  if(occLvl>=10&&feats.some(f=>f.name==='Le Grand Ancien'))r.push('Psychique');
  // Occultiste — Le Génie : Présent élémentaire (niv.6) → résistance de l'élément du génie
  if(occLvl>=6&&feats.some(f=>f.name==='Le Génie')){const m={Dao:'Contondant',Djinn:'Tonnerre',Efreet:'Feu',Marid:'Froid'}[cc['GenieKind']];if(m)r.push(m);}
  // Clerc — résistances de domaine (le joueur choisit le type au moment des dégâts, donc "non magique" jugé par lui)
  const clercLvl=((p.classes||[]).find(c=>c.name==='Clerc')||{}).level||0;
  if(feats.some(f=>f.name==='Domaine de la forge')){if(clercLvl>=6)r.push('Feu');if(clercLvl>=17)r.push('Contondant','Perforant','Tranchant');}
  if(clercLvl>=17&&feats.some(f=>f.name==='Domaine de la guerre'))r.push('Contondant','Perforant','Tranchant');
  // Barbare — Rage : résistance contondant/perforant/tranchant (totem de l'Ours = tout sauf psychique)
  const barbLvl=((p.classes||[]).find(c=>c.name==='Barbare')||{}).level||0;
  if(barbLvl>0&&cc['RageActive']===true){
    if(feats.some(f=>f.name==='Voie du guerrier totem')&&barbLvl>=3&&cc['TotemSpirit']==='Ours')['Acide','Feu','Force','Froid','Foudre','Nécrotique','Poison','Radiant','Tonnerre','Contondant','Perforant','Tranchant'].forEach(t=>r.push(t));
    else r.push('Contondant','Perforant','Tranchant');
  }
  // Magicien — Insensibilité à la non-vie (École de nécromancie niv.10) : résistance nécrotique
  if((((p.classes||[]).find(c=>c.name==='Magicien')||{}).level||0)>=10&&feats.some(f=>f.name==='École de nécromancie'))r.push('Nécrotique');
  // Rôdeur — Lien du croc et d'écailles (Gardien de drake niv.7) : résistance à l'essence du drake invoqué
  const _rodDrakeLvl=((p.classes||[]).find(c=>c.name==='Rôdeur')||{}).level||0;
  if(_rodDrakeLvl>=7&&p.drakeCompanion&&p.drakeCompanion.active&&p.drakeCompanion.essence)r.push(p.drakeCompanion.essence);
  // Artificier — Maîtrise chimique (Alchimiste niv.15) : résistance acide et poison
  const _artAlchiLvl=((p.classes||[]).find(c=>c.name==='Artificier')||{}).level||0;
  if(_artAlchiLvl>=15&&feats.some(f=>f.name==='Alchimiste'))r.push('Acide','Poison');
  return r;
}
// Immunités passives calculées (miroir de _classPassiveResist) — étendu classe par classe
function _classPassiveImmun(p){
  const r=[];const feats=p.features||[];
  const clercLvl=((p.classes||[]).find(c=>c.name==='Clerc')||{}).level||0;
  // Clerc — Saint de la forge et du feu (niv.17) : immunité au feu
  if(clercLvl>=17&&feats.some(f=>f.name==='Domaine de la forge'))r.push('Feu');
  // Druide — Protégé de dame Nature (Cercle de la terre niv.10) : immunité poison
  const druLvl=((p.classes||[]).find(c=>c.name==='Druide')||{}).level||0;
  if(druLvl>=10&&((p.archetype||{})['Druide']||'').toLowerCase().includes('terre'))r.push('Poison');
  // Moine — Pureté physique (niv.10) : immunité poison
  if((((p.classes||[]).find(c=>c.name==='Moine')||{}).level||0)>=10)r.push('Poison');
  return r;
}
function getPassiveImmunities(p){
  const r=[];
  if(Array.isArray(p.autoImmun))r.push(...p.autoImmun);
  r.push(..._classPassiveImmun(p));
  return [...new Set(r)];
}
function getEffectiveResistances(p){return [...new Set([...(p.dmgResistances||[]),...getPassiveResistances(p)])];}
function getEffectiveImmunities(p){return [...new Set([...(p.dmgImmunities||[]),...getPassiveImmunities(p)])];}
// Modal Dégâts / Soins (ouvert depuis le rail) — saisie montant + type de dégâts (plus de sélecteur permanent).
function openHpModal(){
  const p=P();const ws=p.wildshape;
  const er=(typeof getEffectiveResistances==='function')?getEffectiveResistances(p):[];
  const ei=(typeof getEffectiveImmunities==='function')?getEffectiveImmunities(p):[];
  const list=(typeof _DMG_TYPES!=='undefined'?_DMG_TYPES:[]);
  openModal(`<div class="pt">${ws&&ws.active?'🐺 PV de la bête':'❤ Points de vie'}</div>
    <span id="hpModalMarker" style="display:none"></span>
    <div class="fl mb6">Montant</div>
    <input class="fi" id="hpDelta" type="number" min="0" placeholder="ex : 8" style="margin-bottom:10px">
    <div class="fl mb6">Type de dégâts <span style="color:var(--text3);font-weight:400">(facultatif — 🛡 résistance / ✦ immunité)</span></div>
    <select id="hpDmgType" class="fi" style="margin-bottom:14px"><option value="">— Non typé —</option>${list.map(t=>`<option value="${esc(t)}">${ei.includes(t)?'✦ ':er.includes(t)?'🛡 ':''}${esc(t)}</option>`).join('')}</select>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1;background:var(--danger);color:#fff;border-color:var(--danger)" onclick="_railApplyHp(-1)">💥 Dégâts</button>
      <button class="btn" style="flex:1;background:var(--good);color:#fff;border-color:var(--good)" onclick="_railApplyHp(1)">💚 Soins</button>
    </div>`);
  setTimeout(()=>{const i=document.getElementById('hpDelta');if(i)i.focus();},60);
}
function _railApplyHp(sign){
  applyHp(sign);
  if(document.getElementById('hpModalMarker')) closeModal(); // ferme sauf si applyHp a ouvert son propre modal (endurance/rage/veille)
}

// Veille concentration : pop-up de jet de sauvegarde quand on subit des dégâts en concentrant.
function promptConcSave(dmg){
  const p=P(); if(!p||!(p.statuses||[]).some(s=>s.name==='Concentration'))return;
  const dc=Math.max(10,Math.floor((parseInt(dmg)||0)/2));
  openModal(`<div style="text-align:center;padding:6px 4px">
    <div style="font-size:32px;margin-bottom:4px">🎯</div>
    <div class="pt" style="margin-bottom:6px">Concentration menacée</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:16px">Tu as subi <strong style="color:var(--danger)">${dmg}</strong> dégâts en te concentrant${p.concentrationSpell?` sur <strong style="color:var(--cp)">${esc(p.concentrationSpell)}</strong>`:''}.<br>Jet de sauvegarde : <strong>CON DD ${dc}</strong>.<br><span style="font-size:13px;color:var(--text3)">Échec = concentration brisée.</span></div>
    <div style="display:flex;gap:8px;justify-content:center">
      <button class="btn bac" onclick="closeModal();${typeof rollConcSave==='function'?`rollConcSave(${dmg})`:''}">✨ Lancer le JS CON</button>
      <button class="btn" onclick="closeModal()">Plus tard</button>
    </div></div>`);
}
function applyHp(sign){
  const p=P();const delta=parseInt(document.getElementById('hpDelta')?.value)||0;if(delta<=0)return;
  const ws=p.wildshape;
  if(ws?.active){
    if(sign<0){
      // Dégâts : bête en priorité, overflow sur le druide
      const overflow=Math.max(0,delta-ws.beast.hpCur);
      ws.beast.hpCur=Math.max(0,ws.beast.hpCur-delta);
      if(ws.beast.hpCur<=0){
        p.hp=Math.max(0,ws.savedHp-overflow);
        delete p.wildshape;
        showBanner('💥','Forme sauvage terminée',`La bête tombe à 0 PV — retour en forme de druide${overflow>0?' (−'+overflow+' PV)':''}`,{variant:'danger'});
      }
    } else {
      // Soins : vers les PV de la bête (cap au max)
      ws.beast.hpCur=Math.min(ws.beast.hpMax,ws.beast.hpCur+delta);
    }
  } else {
    if(sign<0){
      let dmg=delta;
      // Fondation 4 — résistance (÷2) / immunité (0) selon le type de dégâts sélectionné
      const _dt=document.getElementById('hpDmgType')?.value||'';
      if(_dt){
        if(getEffectiveImmunities(p).includes(_dt)){showBanner('✦','Immunité',`${_dt} : ${dmg} dégâts annulés`,{variant:'info'});dmg=0;}
        else if(getEffectiveResistances(p).includes(_dt)){const _h=Math.floor(dmg/2);showBanner('🛡','Résistance',`${_dt} : ${dmg} → ${_h}`,{variant:'info'});dmg=_h;}
        if(dmg<=0){_markUnsaved();render();return;}
      }
      // 1. Bouclier magique absorbe en premier
      if((p.shieldHp||0)>0){
        const absorbed=Math.min(p.shieldHp,dmg);
        p.shieldHp-=absorbed;dmg-=absorbed;
        showToast(`🔵 Bouclier magique absorbe ${absorbed} dégâts${p.shieldHp>0?' ('+p.shieldHp+' restants)':' (dissipé)'}`,3000);
        if(dmg<=0){_markUnsaved();render();return;}
      }
      // 2. PV normaux
      const _effMax=(p.exhaustion||0)>=4?Math.floor(p.hpMax/2):p.hpMax;
      const _newHp=Math.max(0,Math.min(_effMax+(p.hpTemp||0),p.hp-dmg));
      if(_newHp===0&&p.race==='Demi-Orc'&&!p.relentlessEnduranceUsed){
        p.hp=0;_markUnsaved();render();
        openModal('<div style="text-align:center;padding:20px 16px"><div style="font-size:36px;margin-bottom:8px">🧟</div><div class="pt" style="margin-bottom:6px">Endurance implacable</div><div style="font-size:14px;color:var(--text2);margin-bottom:20px">Vous tombez à 0 PV !<br>Utiliser <strong>Endurance implacable</strong> pour tomber à <strong style="color:var(--good)">1 PV</strong> ?<br><span style="font-size:13px;color:var(--text3)">(1 utilisation par repos long)</span></div><div style="display:flex;gap:8px;justify-content:center"><button class="btn bprimary" style="min-width:80px" onclick="useRelentlessEndurance()">✅ Oui</button><button class="btn" style="min-width:80px" onclick="closeModal()">❌ Non</button></div></div>');
        return;
      }
      p.hp=_newHp;
      if((p.statuses||[]).some(s=>s.name==='Concentration')&&dmg>0)setTimeout(()=>promptConcSave(dmg),300); // veille : pop-up JS CON
      // Fix 18 — Rage implacable automatique
      if(p.hp<=0&&typeof checkRageImplacable==='function')setTimeout(()=>checkRageImplacable(),200);
      // Veille HP→0 — effets "tomber à 1 PV au lieu de 0" (Sentinelle immortelle, Âme de l'artifice)
      if(p.hp<=0)setTimeout(()=>_checkHpZeroVeille(),250);
    } else {
      const _effMax=(p.exhaustion||0)>=4?Math.floor(p.hpMax/2):p.hpMax;
      p.hp=Math.max(0,Math.min(_effMax+(p.hpTemp||0),p.hp+delta));
    }
  }
  if(typeof _logMJAction==='function')_logMJAction(sign<0?('💥 subit '+delta+' PV ('+p.hp+'/'+p.hpMax+')'):('💚 regagne '+delta+' PV ('+p.hp+'/'+p.hpMax+')'));
  _markUnsaved();render();
}
function applyShieldHp(amount){const p=P();if(!amount||amount<=0)return;p.shieldHp=(p.shieldHp||0)+amount;if(!p.shieldHpMax||p.shieldHp>p.shieldHpMax)p.shieldHpMax=p.shieldHp;_markUnsaved();render();showToast(`🔵 Bouclier magique : +${amount} PV (total ${p.shieldHp})`,2500);}

// Veille HP→0 — prompts dorés "rester à 1 PV au lieu de 0" (cf. feedback_veille_pattern)
function _checkHpZeroVeille(){
  const p=P();if(!p||p.hp>0)return;
  const cc=p.combatCharges||{};
  const palLvl=((p.classes||[]).find(c=>c.name==='Paladin')||{}).level||0;
  const isAnciens=((p.archetype||{})['Paladin']==='Serment des anciens')||(p.features||[]).some(f=>f.name==='Serment des anciens');
  const artLvl=((p.classes||[]).find(c=>c.name==='Artificier')||{}).level||0;
  if(palLvl>=15&&isAnciens&&!cc['SentinelleImmortelleUsed']){
    openModal('<div style="text-align:center;padding:20px 16px"><div style="font-size:36px;margin-bottom:8px">🌿</div><div class="pt" style="margin-bottom:6px">Sentinelle immortelle</div><div style="font-size:14px;color:var(--text2);margin-bottom:20px">Tu tombes à 0 PV !<br>Rester à <strong style="color:var(--good)">1 PV</strong> à la place ?<br><span style="font-size:13px;color:var(--text3)">(1 utilisation par repos long)</span></div><div style="display:flex;gap:8px;justify-content:center"><button class="btn bprimary" style="min-width:80px" onclick="_applyDropTo1HP(\'SentinelleImmortelleUsed\')">✅ Oui</button><button class="btn" style="min-width:80px" onclick="closeModal()">❌ Non</button></div></div>');
    return;
  }
  if(artLvl>=20){
    openModal('<div style="text-align:center;padding:20px 16px"><div style="font-size:36px;margin-bottom:8px">⚙</div><div class="pt" style="margin-bottom:6px">Âme de l\'artifice</div><div style="font-size:14px;color:var(--text2);margin-bottom:20px">Tu tombes à 0 PV !<br>Mettre fin à une <strong>infusion</strong> (réaction) pour rester à <strong style="color:var(--good)">1 PV</strong> ?<br><span style="font-size:13px;color:var(--text3)">(retire l\'infusion dans ton panneau)</span></div><div style="display:flex;gap:8px;justify-content:center"><button class="btn bprimary" style="min-width:80px" onclick="_applyDropTo1HP(null)">✅ Oui</button><button class="btn" style="min-width:80px" onclick="closeModal()">❌ Non</button></div></div>');
    return;
  }
}
function _applyDropTo1HP(chargeKey){
  const p=P();if(!p)return;
  p.hp=1;
  if(chargeKey){if(!p.combatCharges)p.combatCharges={};p.combatCharges[chargeKey]=true;}
  if(typeof closeModal==='function')closeModal();
  _markUnsaved();render();
  if(typeof showBanner==='function')showBanner('💗','Tu restes à 1 PV','Effet de classe déclenché',{variant:'gold'});
}
function removeShieldHp(){const p=P();delete p.shieldHp;delete p.shieldHpMax;_markUnsaved();render();showToast('🔵 Bouclier magique dissipé.',2000);}
function useRelentlessEndurance(){const p=P();p.hp=1;p.relentlessEnduranceUsed=true;closeModal();showToast('🧟 Endurance implacable — tombé à 1 PV !');_markUnsaved();render();}
function cycleDS(type,idx){const p=P();p.deathSaves[type]=p.deathSaves[type]>idx?idx:idx+1;_markUnsaved();render();}

// ── STATUTS ──
// États officiels SRD + bonus courants
const STATUS_PRESETS=[
  // ── États officiels ──
  {name:"À terre",type:"malus",stat:"",value:0,icon:"⬇",desc:"Désavantage aux jets d'attaque. Avantage pour les attaquants à 1,5m. Seul mouvement possible : ramper.",rollPenalty:"attaque"},
  {name:"Agrippé",type:"malus",stat:"",value:0,icon:"✊",desc:"Vitesse réduite à 0.",rollPenalty:""},
  {name:"Assourdi",type:"malus",stat:"",value:0,icon:"🔇",desc:"Rate automatiquement les jets nécessitant l'ouïe.",rollPenalty:""},
  {name:"Aveuglé",type:"malus",stat:"",value:0,icon:"👁",desc:"Rate les jets nécessitant la vue. Désavantage aux jets d'attaque. Les attaquants ont avantage.",rollPenalty:"attaque"},
  {name:"Charmé",type:"malus",stat:"",value:0,icon:"💜",desc:"Ne peut pas attaquer le charmeur. Le charmeur a avantage aux jets sociaux.",rollPenalty:""},
  {name:"Effrayé",type:"malus",stat:"",value:0,icon:"😱",desc:"Désavantage aux jets de carac. et d'attaque si la source est en vue.",rollPenalty:"attaque,carac"},
  {name:"Empoisonné",type:"malus",stat:"",value:0,icon:"☠",desc:"Désavantage aux jets d'attaque et aux jets de caractéristique.",rollPenalty:"attaque,carac"},
  {name:"Entravé",type:"malus",stat:"",value:0,icon:"⛓",desc:"Vitesse 0. Désavantage aux jets d'attaque et JS DEX. Avantage pour les attaquants.",rollPenalty:"attaque,dex-save"},
  {name:"Étourdi",type:"malus",stat:"",value:0,icon:"💫",desc:"Incapable d'agir. Rate automatiquement JS FOR et DEX. Avantage pour les attaquants.",rollPenalty:"attaque,for-save,dex-save"},
  {name:"Incapacité",type:"malus",stat:"",value:0,icon:"🚫",desc:"Ne peut effectuer aucune action ni réaction.",rollPenalty:""},
  {name:"Inconscient",type:"malus",stat:"",value:0,icon:"💤",desc:"Incapable d'agir, tombe à terre. Rate JS FOR et DEX. Attaquants ont avantage. Coups critiques à 1,5m.",rollPenalty:"attaque,for-save,dex-save"},
  {name:"Invisible",type:"bonus",stat:"",value:0,icon:"👻",desc:"Avantage aux jets d'attaque. Désavantage pour les attaquants.",rollPenalty:""},
  {name:"Paralysé",type:"malus",stat:"",value:0,icon:"🧊",desc:"Incapable d'agir. Rate JS FOR et DEX. Attaquants ont avantage. Critiques à 1,5m.",rollPenalty:"for-save,dex-save"},
  {name:"Pétrifié",type:"malus",stat:"",value:0,icon:"🗿",desc:"Transformé en pierre. Incapable d'agir. Rate JS FOR et DEX. Résistance à tous les dégâts.",rollPenalty:"for-save,dex-save"},
  // ── Épuisement ──
  {name:"Épuisement 1",type:"malus",stat:"",value:0,icon:"😓",desc:"Désavantage aux jets de caractéristique.",rollPenalty:"carac"},
  {name:"Épuisement 2",type:"malus",stat:"",value:0,icon:"😰",desc:"Désavantage aux jets de carac. + vitesse divisée par 2.",rollPenalty:"carac"},
  {name:"Épuisement 3",type:"malus",stat:"",value:0,icon:"😵",desc:"Désavantage aux jets d'attaque, de carac. et de sauvegarde.",rollPenalty:"attaque,carac,save"},
  // ── Bonus courants ──
  {name:"Béni",type:"bonus",stat:"",value:0,icon:"✨",desc:"+1d4 aux jets d'attaque et jets de sauvegarde.",rollBonus:"1d4:attaque,save"},
  {name:"Maudit",type:"malus",stat:"",value:0,icon:"🌑",desc:"Désavantage aux jets de caractéristique pour une stat.",rollPenalty:"carac"},
  {name:"Inspiré",type:"bonus",stat:"",value:0,icon:"⚡",desc:"+1d6 à un jet (bardique).",rollBonus:"1d6:un"},
  {name:"Guidé",type:"bonus",stat:"",value:0,icon:"🌟",desc:"+1d4 à un jet de compétence (sort Guidance).",rollBonus:"1d4:compétence"},
  {name:"Concentration",type:"neutral",stat:"",value:0,icon:"🎯",desc:"Sort de concentration actif. Prend fin si blessé (JS CON DD10 ou moitié dégâts).",rollPenalty:""},
  {name:"Hâte",type:"bonus",stat:"ca",value:2,icon:"💨",desc:"+2 CA, avantage aux JS DEX, vitesse doublée, action supplémentaire.",rollPenalty:""},
  {name:"Lenteur",type:"malus",stat:"",value:0,icon:"🐢",desc:"Vitesse divisée par 2, -2 CA, désavantage aux JS DEX.",rollPenalty:"dex-save"},
  {name:"À couvert ½",type:"bonus",stat:"ca",value:2,icon:"🛡",desc:"+2 CA et jets de sauvegarde DEX (demi-couvert).",rollPenalty:""},
  {name:"À couvert ¾",type:"bonus",stat:"ca",value:5,icon:"🛡",desc:"+5 CA et jets de sauvegarde DEX (couvert 3/4).",rollPenalty:""},
  // ── Bonus/Malus de stats ──
  {name:"FOR boostée",type:"bonus",stat:"for",value:4,icon:"💪",desc:"+4 à la Force (sort Amélioration de caractéristique)."},
  {name:"DEX boostée",type:"bonus",stat:"dex",value:4,icon:"🐈",desc:"+4 à la Dextérité."},
  {name:"CON boostée",type:"bonus",stat:"con",value:4,icon:"❤",desc:"+4 à la Constitution."},
  {name:"INT réduite",type:"malus",stat:"int",value:-4,icon:"🧠",desc:"-4 à l'Intelligence (malédiction)."},
  {name:"SAG réduite",type:"malus",stat:"sag",value:-4,icon:"👁",desc:"-4 à la Sagesse."},
  {name:"CHA réduit",type:"malus",stat:"cha",value:-4,icon:"💬",desc:"-4 au Charisme."},
  {name:"PV temp. (sort)",type:"bonus",stat:"hp",value:10,icon:"💚",desc:"+10 PV temporaires (sort Fausse vie ou similaire)."},
];
function openAddStatus(){
  openModal(`<div class="pt">+ Ajouter un statut</div>
    <div style="margin-bottom:12px">
      <div class="fl mb6">États officiels & conditions</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;max-height:180px;overflow-y:auto;padding:4px">
        ${STATUS_PRESETS.map((s,i)=>`<span class="status-badge ${s.type}" style="cursor:pointer" onclick="quickAddStatus(${i})">${s.icon} ${esc(s.name)}</span>`).join('')}
      </div>
    </div>
    <hr style="border-color:var(--border);margin-bottom:12px">
    <div class="fl mb6">Statut personnalisé</div>
    <input class="fi mb6" id="stName" placeholder="Nom du statut">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">
      <select class="fi" id="stType">
        <option value="bonus">✅ Bonus</option>
        <option value="malus">❌ Malus</option>
        <option value="neutral">◆ Neutre</option>
      </select>
      <select class="fi" id="stStat">
        <option value="">Stat affectée (optionnel)</option>
        <option value="for">FOR</option>
        <option value="dex">DEX</option>
        <option value="con">CON</option>
        <option value="int">INT</option>
        <option value="sag">SAG</option>
        <option value="cha">CHA</option>
        <option value="ca">Classe d'Armure</option>
        <option value="hp">PV temporaires</option>
      </select>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">
      <input class="fi" id="stVal" type="number" placeholder="Valeur bonus/malus (ex: +2 ou -4)">
      <select class="fi" id="stRollPenalty">
        <option value="">Jet affecté (optionnel)</option>
        <option value="attaque">Désavantage aux attaques</option>
        <option value="carac">Désavantage jets carac.</option>
        <option value="save">Désavantage sauvegardes</option>
        <option value="dex-save">Désavantage JS DEX</option>
        <option value="for-save">Désavantage JS FOR</option>
        <option value="avantage-attaque">Avantage aux attaques</option>
      </select>
    </div>
    <input class="fi mb6" id="stDesc" placeholder="Description (optionnel)">
    <div style="display:flex;gap:8px;margin-top:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="addCustomStatus()">+ Ajouter</button>
    </div>`);
}

function quickAddStatus(idx){
  const s=STATUS_PRESETS[idx];
  const p=P();if(!p.statuses)p.statuses=[];
  p.statuses.push({
    name:s.name,type:s.type,stat:s.stat||'',
    value:s.value||0,icon:s.icon||'◆',desc:s.desc||'',
    rollPenalty:s.rollPenalty||'',rollBonus:s.rollBonus||''
  });
  closeModal();render();
}

function addCustomStatus(){
  const name=(document.getElementById('stName')?.value||'').trim();
  if(!name){showToast('❌ Nom requis');return;}
  const type=document.getElementById('stType')?.value||'neutral';
  const stat=document.getElementById('stStat')?.value||'';
  const value=parseInt(document.getElementById('stVal')?.value)||0;
  const rollPenalty=document.getElementById('stRollPenalty')?.value||'';
  const desc=document.getElementById('stDesc')?.value||'';
  const p=P();if(!p.statuses)p.statuses=[];
  p.statuses.push({name,type,stat,value,icon:type==='bonus'?'✅':type==='malus'?'❌':'◆',desc,rollPenalty,rollBonus:''});
  closeModal();render();
}
function removeStatus(i){const p=P();if(p.statuses)p.statuses.splice(i,1);render();}
function toggleConcentration(spellName){const p=P();if(!p.statuses)p.statuses=[];const idx=p.statuses.findIndex(s=>s.name==='Concentration');if(idx>=0){const _endSpell=p.concentrationSpell,_endName=p.charName||'';p.statuses.splice(idx,1);delete p.concentrationSpell;if(_endSpell&&typeof _clearGroupConcentrationBuff==='function')_clearGroupConcentrationBuff(_endSpell,_endName);}else{const preset=STATUS_PRESETS.find(s=>s.name==='Concentration');p.statuses.push(preset?{...preset}:{name:'Concentration',type:'neutral',icon:'🎯',desc:'Sort de concentration actif.',rollPenalty:''});if(spellName)p.concentrationSpell=spellName;}_markUnsaved();render();}
function activateConcentration(){const spell=(document.getElementById('concSpellInput')?.value||'').trim();toggleConcentration(spell||undefined);}
function rollConcSave(dmg){
  const p=P();
  const mc=mainClass(p);const hasCON=(CLASS_SAVES[mc?mc.name:'']||[]).includes(2);
  const lvl=totalLevel(p);
  const bonus=mod(p.abilities?p.abilities[2]:10)+(hasCON?pb(lvl):0);
  const dd=Math.max(10,Math.floor(Math.max(1,dmg)/2));
  const d20=Math.ceil(Math.random()*20);
  const total=d20+bonus;
  const success=total>=dd;
  const modStr=bonus>=0?'+'+bonus:''+bonus;
  if(!success){
    const _endSpell=p.concentrationSpell,_endName=p.charName||'';
    if(p.statuses){const idx=p.statuses.findIndex(s=>s.name==='Concentration');if(idx>=0)p.statuses.splice(idx,1);}
    delete p.concentrationSpell;
    if(_endSpell&&typeof _clearGroupConcentrationBuff==='function')_clearGroupConcentrationBuff(_endSpell,_endName);
  }
  showBanner(success?'🎯':'💥',success?'Concentration maintenue':'Concentration brisée',`JS CON : d20(${d20})${modStr}${hasCON?' (maîtrise)':''} = ${total} vs DD ${dd}`,{variant:success?'success':'danger'});
  render();
}

// ── RÉSISTANCES & IMMUNITÉS ──
const _DMG_TYPES=['Acide','Froid','Feu','Foudre','Nécrotique','Poison','Psychique','Radieux','Tonnerre','Contondant','Perforant','Tranchant','Contondant/Perforant/Tranchant non-magiques','Contondant/Perforant/Tranchant (non-argent/non-magique)'];
const _COND_TYPES=['Charmé','Effrayé','Empoisonné','Assourdi','Aveuglé','À terre','Agrippé','Entravé','Étourdi','Incapacité','Inconscient','Paralysé','Pétrifié','Épuisement'];
function removeResist(cat,i){const p=P();if(!p[cat])return;p[cat].splice(i,1);render();}
function addResist(cat,val){const p=P();if(!val||!val.trim())return;if(!p[cat])p[cat]=[];if(!p[cat].includes(val.trim()))p[cat].push(val.trim());render();}
function openResistModal(){
  openModal(`<div>
    <div class="pt" style="margin-bottom:12px">+ Résistances & Immunités</div>
    <div style="font-size:13px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Résistances aux dégâts</div>
    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px">${_DMG_TYPES.map(t=>`<span class="status-badge bonus" style="cursor:pointer" onclick="addResist('dmgResistances','${jsq(t)}');closeModal()">🛡 ${esc(t)}</span>`).join('')}</div>
    <div style="font-size:13px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Immunités aux dégâts</div>
    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px">${_DMG_TYPES.map(t=>`<span class="status-badge" style="background:#2e1b00;border-color:var(--warn);color:var(--warn);cursor:pointer" onclick="addResist('dmgImmunities','${jsq(t)}');closeModal()">✦ ${esc(t)}</span>`).join('')}</div>
    <div style="font-size:13px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Immunités aux conditions</div>
    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px">${_COND_TYPES.map(t=>`<span class="status-badge malus" style="cursor:pointer" onclick="addResist('condImmunities','${jsq(t)}');closeModal()">🚫 ${esc(t)}</span>`).join('')}</div>
    <div style="font-size:13px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Personnalisé</div>
    <div style="display:flex;gap:6px">
      <input class="fi" id="resistCustom" placeholder="Type de dégât ou condition..." style="flex:1">
      <select id="resistCat" style="padding:7px;background:var(--surface2);border:1px solid var(--border);border-radius:2px;color:var(--text);font-size:13px">
        <option value="dmgResistances">Résistance</option>
        <option value="dmgImmunities">Immunité dégâts</option>
        <option value="condImmunities">Immunité condition</option>
      </select>
      <button class="btn bac bsm" onclick="addResist(document.getElementById('resistCat').value,document.getElementById('resistCustom').value);closeModal()">+ Ajouter</button>
    </div>
  </div>`);
}

function toggleInspiration(){const p=P();p.inspiration=!p.inspiration;_markUnsaved();render();}

// ── REPOS ──
// Reset centralisé des jauges internes des panneaux de classe (audit RAW 2026-07-07).
// Les combatFeatures de config.js sont resetées par nom ailleurs ; ici = les clés propres aux panneaux.
function _classGaugeRestResets(p,type){
  const cc=p.combatCharges;if(!cc)return;
  const lvlOf=n=>((p.classes||[]).find(c=>c.name===n)||{}).level||0;
  const _pbv=pb(totalLevel(p));
  const intM=mod((p.abilities||[])[3]||10),sagM=mod((p.abilities||[])[4]||10),chaM=mod((p.abilities||[])[5]||10);
  // ── Repos court OU long ──
  const guer=lvlOf('Guerrier');
  if(guer>0){cc['SursautAction']=guer>=17?2:1;if(guer>=3)cc['DésSupériorité']=guer>=15?6:guer>=7?5:4;}
  const clerc=lvlOf('Clerc');
  if(clerc>=2)cc['ConduitDivin']=clerc>=18?3:clerc>=6?2:1;
  if(clerc>=17)delete cc['VisionsPasse'];
  if(lvlOf('Paladin')>=3)cc['Conduit divin']=1;
  if(lvlOf('Occultiste')>0)['PresenceFeeUsed','EchappatBrumeUsed','SombreDelireUsed','ChanceTenebreuxUsed','ProtecEntropiqueUsed'].forEach(k=>delete cc[k]);
  if(lvlOf('Ensorceleur')>=20)delete cc['RestaurationEnsorceleurUsed'];
  if(lvlOf('Roublard')>=20)delete cc['CoupDeChanceUsed'];
  if(lvlOf('Roublard')>0)delete cc['AssassinatReady']; // le mode Assassinat armé ne survit pas à un repos
  const barde=lvlOf('Barde');
  if(barde>0&&(type==='long'||barde>=5))cc['InspBardique']=Math.max(1,chaM);
  if(lvlOf('Barbare')>=11)cc['RageImplacableUses']=0; // le DD retombe à 10 (repos court ou long)
  // ── Repos long uniquement ──
  if(type==='long'){
    const barb=lvlOf('Barbare');
    if(barb>0){cc['RageCharges']=barb>=20?99:barb>=17?6:barb>=12?5:barb>=6?4:barb>=3?3:2;cc['SensMagie']=_pbv;cc['ReserveMagie']=_pbv;}
    if(guer>=9)cc['Indomptable']=guer>=17?3:guer>=13?2:1;
    const pala=lvlOf('Paladin');
    if(pala>0){cc['SensDivin']=Math.max(1,1+chaM);if(pala>=14)cc['ContactPurifiant']=Math.max(1,chaM);if(pala>=20)cc['FormeSacree']=1;delete cc['SentinelleImmortelleUsed'];}
    if(clerc>0){if(clerc>=1)cc['IlluminationProtectrice']=Math.max(1,sagM);cc['FureurOuragan']=Math.max(1,sagM);cc['PretreGuerre']=Math.max(1,sagM);}
    if(lvlOf('Occultiste')>0){delete cc['TraverseeEnfersUsed'];delete cc['MaitreOcculteUsed'];['ArcanumNiv6Used','ArcanumNiv7Used','ArcanumNiv8Used','ArcanumNiv9Used'].forEach(k=>delete cc[k]);}
    if(lvlOf('Druide')>=2)delete cc['RecupNaturelle'];
    if(lvlOf('Rôdeur')>=11)delete cc['SouffleDrake'];
    const art=lvlOf('Artificier');
    if(art>0){cc['EclairGenie']=Math.max(1,intM);cc['DechargeArcanique']=Math.max(1,intM);cc['DefenseurReparation']=3;cc['ChampDefensif']=_pbv;cc['ObjetStockeSort']=Math.max(2,2*intM);cc['ElixirExp']=art>=15?3:art>=6?2:1;cc['IngredientsRevigo']=Math.max(1,intM);delete cc['MaitriseChim1'];delete cc['MaitriseChim2'];}
  }
}
function doShortRest(){
  if(typeof _activeCombatState!=='undefined'&&_activeCombatState&&_activeCombatState.active){showToast('⛔ Pas de repos pendant un combat !');return;}
  const p=P();const mc=mainClass(p);const cd=mc?SRD.classes.find(c=>c.name===mc.name):null;if(!cd)return;
  const _chantGiver=(typeof _groupData!=='undefined'?_groupData:[]).find(gp=>gp.uid!==(typeof currentUser!=='undefined'?currentUser?.uid:null)&&gp.charData?.combatCharges?.ChantReposantResult!==undefined);
  const _chantBonus=_chantGiver?.charData.combatCharges.ChantReposantResult||0;
  const roll=Math.ceil(Math.random()*cd.hdVal)+mod(p.abilities[2]);
  const _effMaxSR=(p.exhaustion||0)>=4?Math.floor(p.hpMax/2):p.hpMax;
  const healed=Math.max(1,roll);p.hp=Math.min(_effMaxSR,p.hp+healed+_chantBonus);
  if(!p.combatCharges)p.combatCharges={};
  (p.classes||[]).forEach(cls=>{
    const d=SRD.classes.find(c=>c.name===cls.name);
    if(!d||!d.combatFeatures)return;
    d.combatFeatures.forEach(f=>{
      if(f.recovery==='short'){const max=getChargesMax(f,p);p.combatCharges[f.name]=max;}
    });
  });
  (p.customCombatFeats||[]).forEach(f=>{if(f.recovery==='short'&&f.charges>0)p.combatCharges[f.name]=f.charges;});
  if((p.classes||[]).find(c=>c.name==='Occultiste'))p.spellSlotsUsed=[];
  // Reset Forme sauvage druide (repos court)
  const _druRestLvl=((p.classes||[]).find(c=>c.name==='Druide')||{}).level||0;
  if(_druRestLvl>0)p.combatCharges['Forme sauvage']=_druRestLvl>=20?99:2;
  // Reset Ki moine (repos court)
  const _moineRestLvl=((p.classes||[]).find(c=>c.name==='Moine')||{}).level||0;
  if(_moineRestLvl>0)p.combatCharges['Ki']=_moineRestLvl;
  delete p.combatCharges['ChantReposantResult'];
  _classGaugeRestResets(p,'court');
  render();saveAll();showToast(`☕ Repos court — ${cd.hd}(${roll-mod(p.abilities[2])})+CON = <strong>+${healed}</strong>${_chantBonus?` + 🎶 <strong>+${_chantBonus}</strong>`:''} PV`);
}
function _applyIRLShortRest(){
  const val=parseInt(document.getElementById('irlRestResult')?.value)||0;
  if(!val||val<1){showToast('❌ Résultat invalide.');return;}
  const p=P();const mc=mainClass(p);const cd=mc?SRD.classes.find(c=>c.name===mc.name):null;if(!cd)return;
  const _effMaxSR=(p.exhaustion||0)>=4?Math.floor(p.hpMax/2):p.hpMax;
  const _rlChantG=(typeof _groupData!=='undefined'?_groupData:[]).find(gp=>gp.uid!==(typeof currentUser!=='undefined'?currentUser?.uid:null)&&gp.charData?.combatCharges?.ChantReposantResult!==undefined);
  const _rlChantB=_rlChantG?.charData.combatCharges.ChantReposantResult||0;
  const healed=Math.max(1,val);
  p.hp=Math.min(_effMaxSR,p.hp+healed+_rlChantB);
  if(!p.combatCharges)p.combatCharges={};
  (p.classes||[]).forEach(cls=>{const d=SRD.classes.find(c=>c.name===cls.name);if(!d||!d.combatFeatures)return;d.combatFeatures.forEach(f=>{if(f.recovery==='short'){const max=getChargesMax(f,p);p.combatCharges[f.name]=max;}});});
  (p.customCombatFeats||[]).forEach(f=>{if(f.recovery==='short'&&f.charges>0)p.combatCharges[f.name]=f.charges;});
  if((p.classes||[]).find(c=>c.name==='Occultiste'))p.spellSlotsUsed=[];
  // Reset Forme sauvage druide (repos court)
  const _druIRLLvl=((p.classes||[]).find(c=>c.name==='Druide')||{}).level||0;
  if(_druIRLLvl>0)p.combatCharges['Forme sauvage']=_druIRLLvl>=20?99:2;
  // Reset Ki moine (repos court)
  const _moineIRLLvl=((p.classes||[]).find(c=>c.name==='Moine')||{}).level||0;
  if(_moineIRLLvl>0)p.combatCharges['Ki']=_moineIRLLvl;
  delete p.combatCharges['ChantReposantResult'];
  _classGaugeRestResets(p,'court');
  _proposeGroupRest('court');closeModal();render();saveAll();showToast(`☕ Repos court — <strong>+${healed}</strong>${_rlChantB?` + 🎶 <strong>+${_rlChantB}</strong>`:''} PV`);
}
function doLongRest(){
  if(typeof _activeCombatState!=='undefined'&&_activeCombatState&&_activeCombatState.active){showToast('⛔ Pas de repos pendant un combat !');return;}
  const p=P();
  const _effMaxLR=(p.exhaustion||0)>=4?Math.floor(p.hpMax/2):p.hpMax;
  p.hp=_effMaxLR;p.spellSlotsUsed=[];
  p.deathSaves={success:0,fail:0};
  p.conditions=[];
  if(!p.combatCharges)p.combatCharges={};
  (p.classes||[]).forEach(cls=>{const d=SRD.classes.find(c=>c.name===cls.name);if(!d||!d.combatFeatures)return;d.combatFeatures.forEach(f=>{if(f.recovery!=='passive'){const max=getChargesMax(f,p);p.combatCharges[f.name]=max;}});});
  (p.customCombatFeats||[]).forEach(f=>{if(f.recovery!=='passive'&&f.charges>0)p.combatCharges[f.name]=f.charges;});
  delete p.relentlessEnduranceUsed;
  delete p.combatCharges['ChantReposantResult'];
  delete p.combatCharges['SortsInfernaux_Niv3'];delete p.combatCharges['SortsInfernaux_Niv5'];
  _classGaugeRestResets(p,'long');
  // Reset Forme sauvage / Ki (le repos long compte aussi comme repos court)
  const _druLRLvl=((p.classes||[]).find(c=>c.name==='Druide')||{}).level||0;
  if(_druLRLvl>0)p.combatCharges['Forme sauvage']=_druLRLvl>=20?99:2;
  const _moineLRLvl=((p.classes||[]).find(c=>c.name==='Moine')||{}).level||0;
  if(_moineLRLvl>0)p.combatCharges['Ki']=_moineLRLvl;
  _proposeGroupRest('long');render();saveAll();showBanner('🌙','Repos long','PV, sorts, charges et conditions récupérés',{variant:'info'});
  // Principe 18 — prompt de (re)préparation des sorts pour les préparateurs
  if(typeof isPrepCaster==='function'&&isPrepCaster(p)&&typeof _openLongRestPrep==='function')_openLongRestPrep(p);
}

// ═══════════════════════════════════════

// ─── Repos de groupe (2026-06-12) : après MON repos, proposer aux alliés de se reposer aussi ───
// Écrit restInvite dans mon doc ; le listener de groupe des alliés (firebase.js) leur montre la proposition.
function _proposeGroupRest(type){
  try{
    if(typeof currentCampaignId==='undefined'||!currentCampaignId||currentCampaignId==='__solo__')return;
    if(window._restNoPropagate)return; // repos déclenché PAR une invitation → ne pas re-proposer en boucle
    const hasAllies=(typeof _groupData!=='undefined')&&_groupData.some(gp=>gp.uid!==(typeof currentUser!=='undefined'?currentUser?.uid:null));
    if(!hasAllies)return;
    const p=P();if(!p)return;
    p.restInvite={t:Date.now(),type:type,name:p.charName||'Un aventurier'};
    if(typeof _markUnsaved==='function')_markUnsaved();
  }catch(e){}
}
