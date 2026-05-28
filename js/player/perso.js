
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
  const hpColor=ws?.active?'#4caf50':pct>50?'#4caf50':pct>25?'#ff9800':'#e53935';

  // Calcul CA affichée avec statuts
  const caBonus=(p.statuses||[]).filter(s=>s.stat==='ca').reduce((a,s)=>a+(parseInt(s.value)||0),0);
  const hpBonus=(p.statuses||[]).filter(s=>s.stat==='hp').reduce((a,s)=>a+(parseInt(s.value)||0),0);
  const caDisplay=p.ac+caBonus;
  const hpDisplay=p.hp+hpBonus;

  return`<div class="g2">
  <!-- COLONNE GAUCHE -->
  <div>
    <!-- Portrait -->
    <div class="panel mb10" style="text-align:center">
      <div class="pt">Portrait</div>
      <div class="eq-portrait" style="height:170px;margin:0 auto;max-width:130px" onclick="document.getElementById('portInput').click()">
        ${p.portrait?`<img src="${p.portrait}">`:`<div class="eq-portrait-hint">📷<br>Cliquer</div>`}
      </div>
      <input type="file" id="portInput" accept="image/jpeg,image/png" style="display:none" onchange="uploadPortrait(this)">
      ${p.portrait?`<button class="btn bsm bdanger" style="margin-top:6px" onclick="upd('portrait',null);render()">Supprimer</button>`:''}
    </div>

    <!-- Statistiques (lecture seule joueur / éditables MJ) -->
    <div class="panel mb10">
      <div class="pt" style="display:flex;align-items:center;justify-content:space-between"><span>Statistiques</span>${ws?.active?`<span style="font-size:10px;color:#4caf50;border:1px solid #4caf50;border-radius:10px;padding:2px 8px">🐺 Forme sauvage</span>`:isMJ()?`<span style="font-size:10px;color:var(--cp);border:1px solid var(--cp);border-radius:10px;padding:2px 8px">🎲 MJ</span>`:''}</div>
      ${ws?.active?`<div style="background:rgba(76,175,80,.08);border:1px solid rgba(76,175,80,.35);border-radius:8px;padding:10px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;gap:8px">
        <div style="display:flex;align-items:center;gap:8px"><span style="font-size:24px">${ws.beast.icon}</span><div><div style="font-size:13px;font-weight:700;color:#4caf50">🐺 ${esc(ws.beast.name)}</div><div style="font-size:10px;color:var(--text3)">CA ${ws.beast.ac} • ${ws.beast.speed}</div></div></div>
        <button class="btn bsm" style="border-color:rgba(76,175,80,.5);color:#4caf50;white-space:nowrap" onclick="revertWildshape()">↩ Reprendre forme</button>
      </div>`:''}
      <div class="g6 mb10">
        ${ABILITIES.map((ab,i)=>{
          const statKey=ABILITIES_SH[i].toLowerCase();
          const statBonuses=(p.statuses||[]).filter(s=>s.stat===statKey);
          const totalBonus=statBonuses.reduce((a,s)=>a+(parseInt(s.value)||0),0);
          const finalVal=p.abilities[i]+totalBonus;
          const hasBonus=totalBonus>0;const hasMalus=totalBonus<0;
          if(ws?.active){
            return`<div class="sb hi" style="border-color:#4caf50;box-shadow:0 0 8px rgba(76,175,80,.2)">
              <div class="sn" style="color:var(--text3)">${ABILITIES_SH[i]}</div>
              <div style="font-size:20px;font-weight:700;color:#4caf50">${ws.beast.ab[i]}</div>
              <div class="sm" style="color:#4caf50">${fmt(Math.floor((ws.beast.ab[i]-10)/2))}</div>
              <div style="font-size:9px;color:var(--text3);margin-top:1px">🧝 ${p.abilities[i]}</div>
            </div>`;
          }
          if(isMJ()){
            return`<div class="sb hi" style="${hasBonus?'border-color:#4caf50':hasMalus?'border-color:#e53935':''}">
              <div class="sn">${ABILITIES_SH[i]}</div>
              <input type="number" min="1" max="30" value="${p.abilities[i]}" oninput="P().abilities[${i}]=Math.min(30,Math.max(1,parseInt(this.value)||10));render()" style="width:100%;text-align:center;font-size:20px;font-weight:600;background:transparent;border:none;color:${hasBonus?'#4caf50':hasMalus?'#e53935':'var(--text)'};outline:none;padding:0">
              <div class="sm" style="color:${hasBonus?'#4caf50':hasMalus?'#e53935':'var(--cp)'}">${fmt(mod(finalVal))}</div>
              ${totalBonus?`<div style="font-size:9px;color:${hasBonus?'#4caf50':'#e53935'};margin-top:1px">${totalBonus>0?'+':''}${totalBonus}</div>`:''}
            </div>`;
          }
          return`<div class="sb hi" style="${hasBonus?'border-color:#4caf50;box-shadow:0 0 8px rgba(76,175,80,.3)':hasMalus?'border-color:#e53935;box-shadow:0 0 8px rgba(229,57,53,.3)':''}">
            <div class="sn">${ABILITIES_SH[i]}</div>
            <div style="font-size:22px;font-weight:600;color:${hasBonus?'#4caf50':hasMalus?'#e53935':'var(--text)'}">${finalVal}</div>
            <div class="sm" style="color:${hasBonus?'#4caf50':hasMalus?'#e53935':'var(--cp)'}">${fmt(mod(finalVal))}</div>
            ${totalBonus?`<div style="font-size:9px;color:${hasBonus?'#4caf50':'#e53935'};margin-top:1px">${totalBonus>0?'+':''}${totalBonus} statut</div>`:''}
          </div>`;
        }).join('')}
      </div>
      <!-- PV -->
      ${ws?.active?`
      <div class="g2 mb6">
        <div class="sb hi" style="border-color:#4caf50;box-shadow:0 0 8px rgba(76,175,80,.2)">
          <div class="sn" style="color:#4caf50">🐺 PV bête</div>
          <div style="font-size:22px;font-weight:700;color:#4caf50">${ws.beast.hpCur}</div>
          <div class="sm" style="color:#4caf50">${ws.beast.hpCur} / ${ws.beast.hpMax}</div>
        </div>
        <div class="sb" style="opacity:.65">
          <div class="sn">🔒 PV druide</div>
          <div style="font-size:20px;font-weight:700;color:var(--text3)">${ws.savedHp}</div>
          <div class="sm" style="color:var(--text3)">${ws.savedHp}/${p.hpMax} (gelés)</div>
        </div>
      </div>
      <div class="hp-bar"><div class="hp-fill" style="width:${pct}%;background:#4caf50"></div></div>
      <div class="hp-ctrl">
        <input class="fi" id="hpDelta" type="number" placeholder="montant" style="width:70px">
        <button class="btn bsm" style="background:#b71c1c;color:#fff;border-color:#b71c1c" onclick="applyHp(-1)">Dégâts bête</button>
        <button class="btn bsm" style="background:#2e7d32;color:#fff;border-color:#2e7d32" onclick="applyHp(1)">Soins bête</button>
      </div>
      <div class="g3 mt8">
        <div class="sb" style="border-color:#4caf50"><div class="sn" style="color:#4caf50">CA bête</div><div style="font-size:20px;font-weight:700;color:#4caf50">${ws.beast.ac}</div></div>
        <div class="sb"><div class="sn">Initiative</div><div class="sm" style="font-size:20px;font-weight:600">${fmt(Math.floor((ws.beast.ab[1]-10)/2))}</div></div>
        <div class="sb" style="border-color:#4caf50"><div class="sn" style="color:#4caf50">Vitesse</div><div style="font-size:14px;font-weight:600;color:#4caf50">${ws.beast.speed}</div></div>
      </div>`:`
      ${p.hp<=0&&!ws?.active?`<div style="background:rgba(229,57,53,.15);border:1px solid #e53935;border-radius:8px;padding:8px 12px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;animation:combatPulse 2s ease-in-out infinite">
        <span style="font-size:14px;font-weight:700;color:#e53935">💀 À TERRE — 0 PV</span>
        <span style="font-size:11px;color:var(--text3)">${p.deathSaves?.fail>=3?'☠ Mort':'Lancez vos jets de mort'}</span>
      </div>`:''}
      <div class="g3 mb6">
        <div class="sb hi" style="${p.hp<=0&&!ws?.active?'border-color:#e53935;box-shadow:0 0 8px rgba(229,57,53,.3)':''}"><div class="sn">PV actuels</div><div style="font-size:20px;font-weight:700;color:${p.hp<=0?'#e53935':hpBonus?'var(--cp)':'var(--text)'}">${p.hp}${hpBonus?`<span style="font-size:12px;color:#4caf50"> +${hpBonus}</span>`:''}</div><div class="sm">${p.hp}/${effectiveHpMax}${_exhLvl>=4?`<span style="color:#e53935"> ½</span>`:''}</div></div>
        <div class="sb" style="${_exhLvl>=4?'border-color:rgba(229,57,53,.4)':''}"><div class="sn">PV max</div>${isMJ()?`<input type="number" min="1" max="999" value="${p.hpMax}" oninput="P().hpMax=Math.max(1,parseInt(this.value)||1);render()" style="width:100%;text-align:center;font-size:18px;font-weight:700;background:transparent;border:none;color:var(--cp);outline:none;padding:2px 0">`:` <div style="font-size:20px;font-weight:700;color:${_exhLvl>=4?'#e53935':'var(--text)'}">${effectiveHpMax}${_exhLvl>=4?`<div style="font-size:9px;color:#e53935;margin-top:1px">÷2 😵 Épuisement</div>`:''}</div>`}</div>
        <div class="sb"><div class="sn">PV temp.</div>${isMJ()?`<input type="number" min="0" max="999" value="${p.hpTemp||0}" oninput="P().hpTemp=Math.max(0,parseInt(this.value)||0)" style="width:100%;text-align:center;font-size:18px;font-weight:700;background:transparent;border:none;color:var(--text);outline:none;padding:2px 0">`:` <div style="font-size:20px;font-weight:700">${p.hpTemp||0}</div>`}</div>
      </div>
      <div class="hp-bar"><div class="hp-fill" style="width:${pct}%;background:${hpColor}"></div></div>
      <div class="hp-ctrl">
        <input class="fi" id="hpDelta" type="number" placeholder="montant" style="width:70px">
        <button class="btn bsm" style="background:#b71c1c;color:#fff;border-color:#b71c1c" onclick="applyHp(-1)">Dégâts</button>
        <button class="btn bsm" style="background:#2e7d32;color:#fff;border-color:#2e7d32" onclick="applyHp(1)">Soins</button>
      </div>
      <div class="g3 mt8">
        <div class="sb"><div class="sn">CA</div><div style="font-size:20px;font-weight:700;color:${caBonus?'var(--cp)':'var(--text)'}">${caDisplay}</div></div>
        <div class="sb"><div class="sn">Initiative</div><div class="sm" style="font-size:20px;font-weight:600">${fmt(dexM)}</div></div>
        ${(()=>{
          const _barbLvl=((p.classes||[]).find(c=>c.name==='Barbare')||{}).level||0;
          const _chestSrd=((p.equip||{}).chest?.name)?SRD.armors.find(a=>a.name===((p.equip||{}).chest?.name)):null;
          const _isHeavy=!!(_chestSrd&&_chestSrd.type!=='Bouclier'&&_chestSrd.type!=='Légère'&&_chestSrd.type!=='Intermédiaire');
          const _fastMove=_barbLvl>=5&&!_isHeavy;
          const _spdBase=(p.speed||9)+(_fastMove?3:0);
          const _exhS=p.exhaustion||0;
          const _spd=_exhS>=5?0:(_exhS>=2?Math.floor(_spdBase/2):_spdBase);
          const _spdExhNote=_exhS>=5?'<div style="font-size:9px;color:#e53935;margin-top:1px">😵 Vitesse 0</div>':(_exhS>=2?'<div style="font-size:9px;color:#ff9800;margin-top:1px">÷2 😰 Épuisement</div>':'');
          const _spdBorder=_fastMove?'border-color:rgba(229,57,53,.4)':(_exhS>=5?'border-color:#e53935':(_exhS>=2?'border-color:rgba(255,152,0,.4)':''));
          return`<div class="sb" style="${_spdBorder}"><div class="sn">Vitesse (m)</div>
            <div style="font-size:18px;font-weight:700;color:${_fastMove?'#e53935':(_exhS>=5?'#e53935':(_exhS>=2?'#ff9800':'var(--text))'))}">${_spd}</div>
            ${_fastMove?'<div style="font-size:9px;color:#e53935;margin-top:1px">+3m 💨 Déplacement rapide</div>':''}${_spdExhNote}
            <input type="number" min="0" max="99" value="${p.speed||9}" oninput="P().speed=parseInt(this.value)||9;saveAll()" style="width:100%;text-align:center;font-size:10px;background:transparent;border:none;border-top:1px solid var(--border);color:var(--text3);outline:none;padding:2px 0;margin-top:2px" title="Vitesse de base">
          </div>`;
        })()}
      </div>`}
      <!-- Jets de mort -->
      ${ws?.active?'':`<div style="margin-top:10px"><div class="fl mb6">Jets de mort</div>
        <div style="display:flex;gap:16px;align-items:center">
          <div style="display:flex;align-items:center;gap:4px"><span style="font-size:11px;color:#4caf50">✓</span>${[0,1,2].map(i=>`<span class="ds-circle${i<p.deathSaves.success?' s':''}" onclick="cycleDS('success',${i})"></span>`).join('')}</div>
          <div style="display:flex;align-items:center;gap:4px"><span style="font-size:11px;color:#e53935">✗</span>${[0,1,2].map(i=>`<span class="ds-circle${i<p.deathSaves.fail?' f':''}" onclick="cycleDS('fail',${i})"></span>`).join('')}</div>
          <button class="btn bsm" onclick="upd('deathSaves',{success:0,fail:0});render()">Reset</button>
        </div>
      </div>`}
    </div>

    ${ws?.active?`<div class="panel mb10" style="border-color:rgba(76,175,80,.4);background:rgba(76,175,80,.04)">
      <div class="pt" style="color:#4caf50;display:flex;align-items:center;gap:6px">${ws.beast.icon} ${esc(ws.beast.name)} — Attaques & Traits</div>
      ${ws.beast.attacks.map(a=>`<div style="background:rgba(76,175,80,.08);border:1px solid rgba(76,175,80,.2);border-radius:6px;padding:8px 10px;margin-bottom:6px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong style="color:#4caf50;font-size:13px">${esc(a.name)}</strong>
          <span style="color:var(--text2);font-size:12px">+${a.bonus} / <strong>${esc(a.dmg)}</strong> ${esc(a.type||'')}</span>
        </div>
        ${a.special?`<div style="font-size:11px;color:var(--text3);margin-top:3px">${esc(a.special)}</div>`:''}
        <button class="btn bsm" style="margin-top:6px;border-color:rgba(76,175,80,.4);color:#4caf50" onclick="rollCustomDmg('${esc(a.dmg)}','${esc(a.name)}')">🎲 ${esc(a.dmg)}</button>
      </div>`).join('')}
      ${ws.beast.traits.map(t=>`<div style="font-size:11px;color:var(--text2);padding:5px 0;border-bottom:1px solid rgba(76,175,80,.15)">🐾 ${esc(t)}</div>`).join('')}
    </div>`:''}

    <!-- Résistances & Immunités (rétractable) -->
    <div class="panel">
      <div class="pt" style="display:flex;align-items:center;justify-content:space-between;cursor:pointer" onclick="window._riOpen=!window._riOpen;render()">
        <span>Résistances & Immunités</span>
        <div style="display:flex;gap:6px;align-items:center">
          <span style="color:var(--text3);font-size:12px">${window._riOpen?'▴':'▾'}</span>
          <button class="btn bsm" onclick="event.stopPropagation();openResistModal()">+ Ajouter</button>
        </div>
      </div>
      ${window._riOpen?(()=>{
        const res=p.dmgResistances||[];const imm=p.dmgImmunities||[];const ci=p.condImmunities||[];
        const tag=(cat,val,i)=>`<span class="status-badge bonus" style="cursor:pointer" title="Retirer" onclick="removeResist('${cat}',${i})">🛡 ${esc(val)} ✕</span>`;
        const tagImm=(cat,val,i)=>`<span class="status-badge malus" style="background:#2e1b00;border-color:#ff9800;color:#ff9800;cursor:pointer" title="Retirer" onclick="removeResist('${cat}',${i})">✦ ${esc(val)} ✕</span>`;
        const tagCond=(cat,val,i)=>`<span class="status-badge malus" style="cursor:pointer" title="Retirer" onclick="removeResist('${cat}',${i})">🚫 ${esc(val)} ✕</span>`;
        const empty='<span style="font-size:11px;color:var(--text3);font-style:italic">Aucune</span>';
        return`<div style="margin-bottom:8px"><div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Résistances dégâts</div><div style="display:flex;flex-wrap:wrap;gap:4px">${res.length?res.map((v,i)=>tag('dmgResistances',v,i)).join(''):empty}</div></div>
        <div style="margin-bottom:8px"><div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Immunités dégâts</div><div style="display:flex;flex-wrap:wrap;gap:4px">${imm.length?imm.map((v,i)=>tagImm('dmgImmunities',v,i)).join(''):empty}</div></div>
        <div><div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Immunités conditions</div><div style="display:flex;flex-wrap:wrap;gap:4px">${ci.length?ci.map((v,i)=>tagCond('condImmunities',v,i)).join(''):empty}</div></div>`;
      })():''}
    </div>
  </div>

  <!-- COLONNE DROITE -->
  <div>
    <!-- Identité -->
    <div class="panel mb10">
      <div class="pt">Identité</div>
      <div class="fl mb6">Nom</div>
      <input class="fi mb6" value="${esc(p.charName)}" onchange="upd('charName',this.value);render()">

      ${(p.classes||[]).map(c=>{const d=SRD.classes.find(cl=>cl.name===c.name);if(!d)return'';return`<div style="background:var(--surface2);border-radius:6px;padding:8px 10px;margin-bottom:6px">
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em">Classe</div>
        <div style="font-size:13px;color:var(--cp);font-weight:600;margin-top:2px">${esc(c.name)} — Niveau ${c.level}</div>
        <div style="font-size:12px;color:var(--text2);margin-top:2px">Dé: ${d.hd} • Armures: ${esc(d.armor.split(',')[0])}${d.spellcaster?' • <span style="color:var(--cp)">✦ Lanceur de sorts</span>':''}</div>
      </div>`;}).join('')}

      ${rd?`<div style="background:var(--surface2);border-radius:6px;padding:8px 10px;margin-bottom:6px">
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em">Race</div>
        <div style="font-size:13px;color:var(--cp);font-weight:600;margin-top:2px">${esc(p.race)}</div>
        <div style="font-size:12px;color:var(--text2);margin-top:2px">Langues : ${esc(rd.languages)}</div>
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
      <select class="fi mb6" onchange="upd('alignment',this.value)">${['',... ALIGNMENTS].map(a=>`<option ${p.alignment===a?'selected':''}>${a}</option>`).join('')}</select>



      <!-- Inspiration -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:var(--surface2);border-radius:6px">
        <span style="font-size:13px;color:var(--text2)">Inspiration</span>
        <span onclick="toggleInspiration()" style="cursor:pointer;font-size:24px">${p.inspiration?'✦':'✧'}</span>
      </div>
    </div>

    <!-- Repos -->
    <div class="panel">
      <div class="pt">Repos</div>
      <div style="display:flex;gap:8px">
        <div class="rest-btn short" onclick="doShortRest()">
          <div style="font-size:16px">☕</div>
          <div style="font-weight:600">Repos court</div>
          <div style="font-size:10px;color:var(--text3);margin-top:1px">≥ 1 heure</div>
          <div style="font-size:10px;margin-top:2px">Lance le dé de vie + CON</div>
        </div>
        <div class="rest-btn long" onclick="doLongRest()">
          <div style="font-size:16px">🌙</div>
          <div style="font-weight:600">Repos long</div>
          <div style="font-size:10px;color:var(--text3);margin-top:1px">≥ 8 heures</div>
          <div style="font-size:10px;margin-top:2px">PV max + sorts + charges</div>
        </div>
      </div>
    </div>

    <!-- Statuts -->
    <div class="panel mt10">
      <div class="pt" style="display:flex;align-items:center;justify-content:space-between"><span>Statuts</span><button class="btn bsm" onclick="openAddStatus()">+ Ajouter</button></div>
      ${(p.statuses||[]).length?`<div>${(p.statuses||[]).map((s,i)=>{
        const sid='st_'+i;
        const rollInfo=s.rollPenalty?` ⚠ ${s.rollPenalty.split(',').join(', ')}`:(s.rollBonus?` +🎲 ${s.rollBonus}`:'');
        const valInfo=s.value&&s.stat?` ${s.value>0?'+':''}${s.value} ${s.stat.toUpperCase()}`:'';
        return`<div class="sort-row">
          <div class="sort-head" onclick="document.getElementById('${sid}').classList.toggle('open')" style="padding:6px 10px">
            <span style="font-size:15px;margin-right:8px">${s.icon||'◆'}</span>
            <div style="flex:1">
              <span class="status-badge ${s.type}" style="cursor:default;margin:0">${esc(s.name)}${valInfo}</span>
            </div>
            <span style="font-size:10px;color:var(--text3);margin-right:8px">▾</span>
            <span onclick="event.stopPropagation();removeStatus(${i})" style="cursor:pointer;color:var(--text3);font-size:15px">×</span>
          </div>
          <div class="sort-body" id="${sid}">
            <p>${esc(s.desc||'Aucune description.')}</p>
            ${rollInfo?`<p style="margin-top:4px;color:${s.type==='bonus'?'#4caf50':'#e53935'};font-size:12px">${rollInfo}</p>`:''}
          </div>
        </div>`;}).join('')}</div>`
        :`<div style="font-size:12px;color:var(--text3);font-style:italic">Aucun statut actif.</div>`}
    </div>

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
    <div style="font-size:12px;color:var(--text3);margin-bottom:14px">Le MJ voit toujours tout. Choisissez ce que les autres joueurs peuvent voir onglet par onglet.</div>
    ${tabs.map(t=>{
      const checked=priv[t.id]!==false;
      return`<label style="display:flex;align-items:center;gap:10px;padding:8px 4px;cursor:pointer;border-bottom:1px solid var(--border)">
        <input type="checkbox" ${checked?'checked':''} onchange="togglePrivacy('${t.id}',this.checked)" style="width:16px;height:16px;accent-color:var(--cp);flex-shrink:0">
        <div>
          <div style="font-size:13px;font-weight:600">${t.label}</div>
          <div style="font-size:11px;color:var(--text3)">${t.desc}</div>
        </div>
      </label>`;
    }).join('')}
    <div style="font-size:11px;color:var(--text3);margin-top:10px;padding:8px;background:rgba(200,168,75,.06);border-radius:6px;border:1px solid rgba(200,168,75,.15)">🔐 Les <strong>Secrets</strong> (onglet Historique) sont toujours privés — uniquement toi et le MJ.</div>
    <div style="display:flex;justify-content:flex-end;margin-top:14px"><button class="btn bac" onclick="closeModal()">Fermer</button></div>`);
}

// ── PV & HP ──
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
        showToast(`💥 La bête tombe à 0 PV ! Retour à la forme de druide${overflow>0?' (-'+overflow+' PV débordants)':''}.`);
      }
    } else {
      // Soins : vers les PV de la bête (cap au max)
      ws.beast.hpCur=Math.min(ws.beast.hpMax,ws.beast.hpCur+delta);
    }
  } else {
    const _effMax=(p.exhaustion||0)>=4?Math.floor(p.hpMax/2):p.hpMax;
    p.hp=Math.max(0,Math.min(_effMax+(p.hpTemp||0),p.hp+sign*delta));
    if(sign<0&&(p.statuses||[]).some(s=>s.name==='Concentration'))showToast(`⚠️ Concentration — Lance ton JS CON (onglet Sorts) !`,3500);
  }
  _markUnsaved();render();
}
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
function toggleConcentration(spellName){const p=P();if(!p.statuses)p.statuses=[];const idx=p.statuses.findIndex(s=>s.name==='Concentration');if(idx>=0){p.statuses.splice(idx,1);delete p.concentrationSpell;}else{const preset=STATUS_PRESETS.find(s=>s.name==='Concentration');p.statuses.push(preset?{...preset}:{name:'Concentration',type:'neutral',icon:'🎯',desc:'Sort de concentration actif.',rollPenalty:''});if(spellName)p.concentrationSpell=spellName;}_markUnsaved();render();}
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
    if(p.statuses){const idx=p.statuses.findIndex(s=>s.name==='Concentration');if(idx>=0)p.statuses.splice(idx,1);}
  }
  showToast(`🎯 JS Concentration — d20(${d20})${modStr}${hasCON?' (maîtrise)':''} = <strong>${total}</strong> vs DD ${dd} — ${success?'<span style="color:#4caf50">✓ Réussi ! Concentration maintenue.</span>':'<span style="color:#e53935">✗ Raté ! Concentration brisée.</span>'}`,5000);
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
    <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Résistances aux dégâts</div>
    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px">${_DMG_TYPES.map(t=>`<span class="status-badge bonus" style="cursor:pointer" onclick="addResist('dmgResistances','${esc(t)}');closeModal()">🛡 ${esc(t)}</span>`).join('')}</div>
    <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Immunités aux dégâts</div>
    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px">${_DMG_TYPES.map(t=>`<span class="status-badge" style="background:#2e1b00;border-color:#ff9800;color:#ff9800;cursor:pointer" onclick="addResist('dmgImmunities','${esc(t)}');closeModal()">✦ ${esc(t)}</span>`).join('')}</div>
    <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Immunités aux conditions</div>
    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px">${_COND_TYPES.map(t=>`<span class="status-badge malus" style="cursor:pointer" onclick="addResist('condImmunities','${esc(t)}');closeModal()">🚫 ${esc(t)}</span>`).join('')}</div>
    <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Personnalisé</div>
    <div style="display:flex;gap:6px">
      <input class="fi" id="resistCustom" placeholder="Type de dégât ou condition..." style="flex:1">
      <select id="resistCat" style="padding:7px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:12px">
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
function doShortRest(){
  const p=P();const mc=mainClass(p);const cd=mc?SRD.classes.find(c=>c.name===mc.name):null;if(!cd)return;
  const roll=Math.ceil(Math.random()*cd.hdVal)+mod(p.abilities[2]);
  const _effMaxSR=(p.exhaustion||0)>=4?Math.floor(p.hpMax/2):p.hpMax;
  const healed=Math.max(1,roll);p.hp=Math.min(_effMaxSR,p.hp+healed);
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
  render();saveAll();showToast(`☕ Repos court — ${cd.hd}(${roll-mod(p.abilities[2])})+CON = <strong>+${healed} PV</strong>`);
}
function doLongRest(){
  const p=P();
  const _effMaxLR=(p.exhaustion||0)>=4?Math.floor(p.hpMax/2):p.hpMax;
  p.hp=_effMaxLR;p.spellSlotsUsed=[];
  p.deathSaves={success:0,fail:0};
  p.conditions=[];
  if(!p.combatCharges)p.combatCharges={};
  (p.classes||[]).forEach(cls=>{const d=SRD.classes.find(c=>c.name===cls.name);if(!d||!d.combatFeatures)return;d.combatFeatures.forEach(f=>{if(f.recovery!=='passive'){const max=getChargesMax(f,p);p.combatCharges[f.name]=max;}});});
  (p.customCombatFeats||[]).forEach(f=>{if(f.recovery!=='passive'&&f.charges>0)p.combatCharges[f.name]=f.charges;});
  render();saveAll();showToast('🌙 Repos long — PV, sorts, charges et conditions récupérés !');
}

// ═══════════════════════════════════════
