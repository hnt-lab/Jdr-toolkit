
// ═══════════════════════════════════════
// TAB: PERSONNAGE
// ═══════════════════════════════════════
function tabPerso(p){
  const mc=mainClass(p);const cd=mc?SRD.classes.find(c=>c.name===mc.name):null;const rd=SRD.races.find(r=>r.name===p.race);
  const lvl=totalLevel(p);const dexM=mod(p.abilities[1]);
  const ws=p.wildshape;
  const pct=Math.max(0,Math.min(100,Math.round((ws?.active?ws.beast.hpCur/Math.max(1,ws.beast.hpMax):p.hp/Math.max(1,p.hpMax))*100)));
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
      <div class="g3 mb6">
        <div class="sb hi"><div class="sn">PV actuels</div><div style="font-size:20px;font-weight:700;color:${hpBonus?'var(--cp)':'var(--text)'}">${p.hp}${hpBonus?`<span style="font-size:12px;color:#4caf50"> +${hpBonus}</span>`:''}</div><div class="sm">${p.hp}/${p.hpMax}</div></div>
        <div class="sb"><div class="sn">PV max</div>${isMJ()?`<input type="number" min="1" max="999" value="${p.hpMax}" oninput="P().hpMax=Math.max(1,parseInt(this.value)||1);render()" style="width:100%;text-align:center;font-size:18px;font-weight:700;background:transparent;border:none;color:var(--cp);outline:none;padding:2px 0">`:` <div style="font-size:20px;font-weight:700">${p.hpMax}</div>`}</div>
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
        <div class="sb"><div class="sn">Vitesse (m)</div><input type="number" min="0" max="99" value="${p.speed||9}" oninput="P().speed=parseInt(this.value)||9;saveAll()" style="width:100%;text-align:center;font-size:18px;font-weight:700;background:transparent;border:none;color:var(--text);outline:none;padding:2px 0"></div>
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
    p.hp=Math.max(0,Math.min(p.hpMax+(p.hpTemp||0),p.hp+sign*delta));
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

// ── REPOS ──
function doShortRest(){
  const p=P();const mc=mainClass(p);const cd=mc?SRD.classes.find(c=>c.name===mc.name):null;if(!cd)return;
  const roll=Math.ceil(Math.random()*cd.hdVal)+mod(p.abilities[2]);
  const healed=Math.max(1,roll);p.hp=Math.min(p.hpMax,p.hp+healed);
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
  const p=P();p.hp=p.hpMax;p.spellSlotsUsed=[];
  p.deathSaves={success:0,fail:0};
  p.conditions=[];
  if(!p.combatCharges)p.combatCharges={};
  (p.classes||[]).forEach(cls=>{const d=SRD.classes.find(c=>c.name===cls.name);if(!d||!d.combatFeatures)return;d.combatFeatures.forEach(f=>{if(f.recovery!=='passive'){const max=getChargesMax(f,p);p.combatCharges[f.name]=max;}});});
  (p.customCombatFeats||[]).forEach(f=>{if(f.recovery!=='passive'&&f.charges>0)p.combatCharges[f.name]=f.charges;});
  render();saveAll();showToast('🌙 Repos long — PV, sorts, charges et conditions récupérés !');
}

// ═══════════════════════════════════════
// TAB: COMPÉTENCES
// ═══════════════════════════════════════
function tabCompetences(p){
  const mc=mainClass(p);const cd=mc?SRD.classes.find(c=>c.name===mc.name):null;const rd=SRD.races.find(r=>r.name===p.race);
  const lvl=totalLevel(p);
  const bardeLvlC=((p.classes||[]).find(c=>c.name==='Barde')||{}).level||0;
  const hasToucheATout=bardeLvlC>=2;
  const halfPb=Math.floor(pb(lvl)/2);
  const percProf=(p.skillProf||{})['Perception']||0;
  const passive=10+mod(p.abilities[4])+(percProf===2?pb(lvl)*2:percProf===1?pb(lvl):hasToucheATout?halfPb:0);
  // Nombre max de compétences autorisées
  const maxSkills=(()=>{let tot=0;(p.classes||[]).forEach(c=>{const d=SRD.classes.find(cl=>cl.name===c.name);if(d)tot+=d.skillCount;});const bg=BACKGROUNDS.find(b=>b.name===p.background);if(bg)tot+=bg.skills.length;return tot;})();
  const currentCount=Object.values(p.skillProf||{}).filter(v=>v>0).length;
  return`<div class="g2" style="gap:10px">
  <div><div class="panel mb10">
    <div class="pt" style="display:flex;align-items:center;justify-content:space-between"><span>Compétences</span><span style="font-size:11px;color:var(--text3)">${currentCount}/${maxSkills} maîtrisées</span></div>
    ${SKILLS.map(sk=>{
      const prof=(p.skillProf||{})[sk.name]||0;
      const isLocked=(p.skillsLocked||{})[sk.name];
      const classSkill=cd&&(cd.skills||[]).includes(sk.name);
      const bonus=mod(p.abilities[sk.ab])+(prof===2?pb(lvl)*2:prof===1?pb(lvl):hasToucheATout?halfPb:0);
      const dotClass=prof===2?' e':prof===1?' p':hasToucheATout?' h':'';
      // Couleur classe
      return`<div class="sk" style="${classSkill?`color:var(--cp)`:''};${isLocked?'cursor:default':'cursor:pointer'}" onclick="${isLocked?'':'cycleSkillIfAllowed(\''+sk.name+'\','+prof+','+maxSkills+')'}">
        <span class="sk-dot${dotClass}" title="${prof===2?'Expertise (×2)':prof===1?'Maîtrise':hasToucheATout?'Touche-à-tout (½ maîtrise)':'Aucune maîtrise'}"></span>
        <span class="sk-n${classSkill?' cs':''}">${sk.name}</span>
        <span class="sk-ab">${ABILITIES_SH[sk.ab]}</span>
        <span class="sk-v">${fmt(bonus)}</span>
      </div>`;
    }).join('')}
    <div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--border);font-size:12px;color:var(--text2)">Perception passive : <strong style="color:var(--cp)">${passive}</strong></div>
  </div></div>
  <div>
    <div class="panel mb10"><div class="pt" style="display:flex;align-items:center;justify-content:space-between"><span>Capacités & traits</span>${isMJ()?`<button class="btn bsm" onclick="openFeatSearch()">+ Ajouter</button>`:''}</div>
      ${(()=>{
        // Noms de capacités purement de combat (ont un tracker ou charges dans combatFeatures)
        const combatFeatNames=new Set();
        (p.classes||[]).forEach(cls=>{const d=SRD.classes.find(c=>c.name===cls.name);if(d&&d.combatFeatures)d.combatFeatures.forEach(f=>combatFeatNames.add(f.name));});
        // Filtrer : afficher seulement les features non-combat, avec description
        const combatFeatPrefixes=[...combatFeatNames];
        const chosenArchByClass={};
        (p.classes||[]).forEach(c=>{if((p.archetype||{})[c.name])chosenArchByClass[c.name]=(p.archetype||{})[c.name];});
        const displayFeats=(p.features||[]).filter(f=>{
          if(combatFeatPrefixes.some(cn=>f.name===cn||f.name.startsWith(cn+' (')||f.name.startsWith(cn+' :')))return false;
          if(f.name.startsWith('Sorts du cercle')||f.name.startsWith('Capacité du cercle'))return false;
          if(isFeatExcluded(f.name))return false;
          if(f.name.includes('(choix)')&&f.classe&&chosenArchByClass[f.classe])return false;
          return true;
        });
        if(!displayFeats.length)return`<div style="font-size:12px;color:var(--text3);font-style:italic">Aucune capacité passive.</div>`;

        // Calcul du contexte Forme sauvage pour les Druides
        const druLvl=((p.classes||[]).find(c=>c.name==='Druide')||{}).level||0;
        const fsCrMax=druLvl>=6?String(Math.floor(druLvl/3)):druLvl>=4?'1/2':'1/4';
        const fsVolNage=druLvl>=8?'Vol ✓ / Nage ✓':druLvl>=4?'Nage ✓ / Vol ✗':'Nage ✗ / Vol ✗';
        const fsUsed=(p.combatCharges||{})['Forme sauvage']!==undefined?p.combatCharges['Forme sauvage']:2;

        return displayFeats.map((f,idx)=>{
          const realIdx=(p.features||[]).indexOf(f);
          const fid='feat_'+f.name.replace(/[^a-zA-Z0-9]/g,'_')+'_'+realIdx;
          const classLvl=f.classe?((p.classes||[]).find(c=>c.name===f.classe)||{}).level||0:totalLevel(p);
          const desc=filterDescByLevel(f.desc||getFeatDesc(f.name),classLvl);
          const isFormeSauvage=f.name.startsWith('Forme sauvage')||f.name.startsWith('Archidruide');
          return`<div class="sort-row">
            <div class="sort-head" onclick="document.getElementById('${fid}').classList.toggle('open')">
              <div style="flex:1">
                <div style="font-size:13px;font-weight:600;color:var(--cp)">${f.icon?f.icon+' ':''}${esc(f.name)}</div>
                ${f.classe?`<div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-top:1px">${esc(f.classe)}</div>`:''}
              </div>
              ${isFormeSauvage&&druLvl>=2?`<div style="display:flex;gap:3px;align-items:center;margin-right:8px">
                ${Array.from({length:2},(_,fs)=>`<span class="slot-bubble${fs<fsUsed?'':' used'}" onclick="event.stopPropagation();useCombatCharge('Forme sauvage',2)"></span>`).join('')}
              </div>`:''}
              <span style="color:var(--text3);font-size:11px;margin-right:8px">▾</span>
              ${isMJ()?`<span onclick="event.stopPropagation();removeFeat(${realIdx})" style="cursor:pointer;color:var(--text3);font-size:15px">×</span>`:''}
            </div>
            <div class="sort-body" id="${fid}">
              <p>${esc(desc||'Consulter aidedd.org/regles/classes/ pour les détails.')}</p>
              ${isFormeSauvage&&druLvl>=2?`<div style="margin-top:8px;padding:6px 8px;background:var(--surface3);border-radius:6px;font-size:12px">
                <div style="color:#4caf50;margin-bottom:4px">🐺 CR max actuel : <strong>${fsCrMax}</strong> — ${fsVolNage}</div>
                <div style="display:flex;align-items:center;gap:8px">
                  <div style="display:flex;gap:4px">${Array.from({length:2},(_,fs)=>`<span class="slot-bubble${fs<fsUsed?'':' used'}" onclick="useCombatCharge('Forme sauvage',2)" style="cursor:pointer"></span>`).join('')}</div>
                  <span style="color:var(--text3)">${fsUsed}/2 • Repos court</span>
                  <button class="btn bsm" onclick="recoverCombatCharge('Forme sauvage',2)">↺</button>
                </div>
              </div>`:''}
            </div>
          </div>`;
        }).join('');
      })()}
    </div>
    ${rd?`<div class="panel"><div class="pt">Traits raciaux</div><div style="font-size:13px;color:var(--text2);line-height:1.6">${esc(rd.traits)}</div><div style="font-size:11px;color:var(--text2);margin-top:8px"><span style="color:var(--text3)">Vitesse :</span> ${rd.speed}m • <span style="color:var(--text3)">Langues :</span> ${esc(rd.languages)}</div></div>`:''}
  </div></div>`;
}

function maxExpertise(p){
  let max=0;
  (p.classes||[]).forEach(c=>{
    if(c.name==='Roublard')max+=c.level>=6?4:2;
    if(c.name==='Barde')max+=c.level>=10?4:c.level>=3?2:0;
  });
  return max;
}
function cycleSkillIfAllowed(name,current,maxSkills){
  const p=P();if(!p.skillProf)p.skillProf={};
  const total=Object.values(p.skillProf).filter(v=>v>0).length;
  if(!isMJ()&&current===0&&total>=maxSkills){
    showToast('❌ Maximum de compétences atteint.');return;
  }
  const nextVal=((p.skillProf[name]||0)+1)%3;
  if(!isMJ()&&nextVal===2){
    const maxExp=maxExpertise(p);
    if(maxExp===0){showToast('❌ Ta classe ne permet pas l\'expertise (Roublard ou Barde requis).');return;}
    const curExp=Object.values(p.skillProf).filter(v=>v===2).length;
    if(curExp>=maxExp){showToast(`❌ Limite d'expertise atteinte (${maxExp} max pour ta classe).`);return;}
  }
  p.skillProf[name]=nextVal;
  render();
}
function openFeatSearch(){openModal(`<div class="pt">Ajouter une capacité</div>
<input class="fi" id="featQ" placeholder="🔍 Chercher dans les capacités SRD..." oninput="filterFeats(this.value)" style="margin-bottom:8px">
<div id="featList">${renderFeatList('')}</div>
<div style="margin-top:12px;padding:10px;background:var(--surface2);border-radius:8px;border:1px solid var(--border)">
  <div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:8px">✨ Capacité personnalisée (univers alternatif)</div>
  <input class="fi" id="featCustomName" placeholder="Nom de la capacité" style="margin-bottom:6px">
  <textarea class="fi" id="featCustomDesc" rows="2" placeholder="Description de la capacité..." style="resize:vertical;margin-bottom:6px"></textarea>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px">
    <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Charges (0 = passif)</div><input class="fi" id="featCustomCharges" type="number" min="0" value="0" placeholder="0"></div>
    <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Récupération</div><select class="fi" id="featCustomRecovery"><option value="passive">Passif</option><option value="short">Repos court</option><option value="long">Repos long</option></select></div>
    <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Dé (ex : 2d6+3)</div><input class="fi" id="featCustomDice" placeholder="2d6+3"></div>
  </div>
  <button class="btn bac bsm" style="width:100%" onclick="addCustomCombatFeat()">+ Ajouter cette capacité</button>
</div>
<button class="btn bsm bdanger" style="margin-top:8px;width:100%" onclick="closeModal()">Fermer</button>`);}
const FEATS_SRD=[
  {name:"Rage",classe:"Barbare",desc:"2/repos long. Bonus dégâts, résistance physique, avantage FOR."},
  {name:"Attaque supplémentaire",classe:"Guerrier/Barbare",desc:"Attaque 2 fois par action Attaquer au niv.5."},
  {name:"Frappe divine",classe:"Paladin",desc:"Dépense un emplacement pour ajouter des dégâts radiants."},
  {name:"Roublardise",classe:"Roublard",desc:"1d6 dégâts supp. si avantage ou allié adjacent."},
  {name:"Terreur sombre",classe:"Occultiste",desc:"Mécène surnaturel. Emplacements récupérés au repos court."},
  {name:"Défense sans armure",classe:"Barbare/Moine",desc:"CA calculée différemment sans armure."},
  {name:"Conduit divin",classe:"Clerc/Paladin",desc:"Effets cumulables, pas les utilisations."},
  {name:"Métamagie",classe:"Ensorceleur",desc:"Dépense des points de sorcellerie pour modifier tes sorts."},
];
function renderFeatList(q){return FEATS_SRD.filter(f=>!q||f.name.toLowerCase().includes(q.toLowerCase())).map(f=>`<div class="aci" onclick="addFeat('${esc(f.name)}','${esc(f.desc)}','${esc(f.classe)}')"><div class="ain">${esc(f.name)}</div><div class="ais">${esc(f.desc.slice(0,80))}…</div></div>`).join('')||'<div style="color:var(--text3);font-size:12px;padding:8px">Aucun résultat.</div>';}
function filterFeats(q){const el=document.getElementById('featList');if(el)el.innerHTML=renderFeatList(q);}
function addFeat(name,desc,classe){P().features.push({name,desc,classe});closeModal();render();}
function addCustomFeat(){const n=document.getElementById('featCustomName')?.value;const d=document.getElementById('featCustomDesc')?.value;if(!n)return;P().features.push({name:n,desc:d||'',classe:''});closeModal();render();}
function addCustomCombatFeat(){
  const n=(document.getElementById('featCustomName')?.value||'').trim();
  if(!n){showToast('❌ Nom requis.');return;}
  const d=(document.getElementById('featCustomDesc')?.value||'').trim();
  const ch=parseInt(document.getElementById('featCustomCharges')?.value)||0;
  const rec=document.getElementById('featCustomRecovery')?.value||'passive';
  const dice=(document.getElementById('featCustomDice')?.value||'').trim();
  const feat={name:n,desc:d,charges:ch,recovery:ch>0?rec:'passive',icon:'⚡'};
  if(dice)feat.dice=dice;
  if(!P().customCombatFeats)P().customCombatFeats=[];
  P().customCombatFeats.push(feat);
  closeModal();render();
}
function removeFeat(i){P().features.splice(i,1);render();}

// ═══════════════════════════════════════
// TAB: COMBAT
// ═══════════════════════════════════════
function tabCombat(p){
  const mc=mainClass(p);const cd=mc?SRD.classes.find(c=>c.name===mc.name):null;const lvl=totalLevel(p);
  const forM=mod(p.abilities[0]),dexM=mod(p.abilities[1]),intM=mod(p.abilities[3]),sagM=mod(p.abilities[4]),chaM=mod(p.abilities[5]);
  const spellMod=cd?({CHA:chaM,SAG:sagM,INT:intM}[cd.saves&&cd.saves[1]]||intM):intM;
  const slots=calcSpellSlots(p);const slotsUsed=p.spellSlotsUsed||[];
  const warlockSlots=getWarlockSlots(p);
  const hasCaster=(p.classes||[]).some(c=>{const d=SRD.classes.find(cl=>cl.name===c.name);return d&&d.spellcaster;});
  const weapons=['mainhand','offhand','ranged'].map(slot=>{const i=(p.equip||{})[slot];return i&&i.name?{...i,slot}:null;}).filter(Boolean);

  // Style de combat
  const COMBAT_STYLES_BY_CLASS={
    'Guerrier':['Défense','Duel','Archerie','Armes à deux mains','Protection'],
    'Paladin':['Défense','Duel','Armes à deux mains','Protection'],
    'Rôdeur':['Archerie','Défense','Duel','Combat à deux armes'],
    'Barde':['Duel','Armes à deux mains'],
    'Artificier':['Défense','Archerie'],
  };
  const availableStyles=[...new Set((p.classes||[]).flatMap(c=>COMBAT_STYLES_BY_CLASS[c.name]||[]))];
  const combatStyle=p.combatStyle||'';

  // Bonus de rage Barbare selon niveau
  const barbareLvl=((p.classes||[]).find(c=>c.name==='Barbare')||{}).level||0;
  const rageBonus=barbareLvl>=16?4:barbareLvl>=9?3:2;
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
    'Barbare':['Rage'],
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
  // Helper : récupère la desc d'une feature depuis le SRD
  function _featDesc(className,featName){return(SRD.classes.find(c=>c.name===className)?.combatFeatures||[]).find(f=>f.name===featName)?.desc||'';}

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
        const finesse=srdW&&(srdW.properties||'').includes('Finesse');
        const isRanged=w.slot==='ranged';
        const atkM=finesse?Math.max(forM,dexM):isRanged?dexM:forM;
        const archerieBonus=combatStyle==='Archerie'&&isRanged?2:0;
        const atkBonus=pb(lvl)+atkM+archerieBonus;
        const hasOffhandWeapon=weapons.some(w2=>w2.slot==='offhand');
        const isDueling=combatStyle==='Duel'&&!isRanged&&w.slot==='mainhand'&&!hasOffhandWeapon;
        const isTwoHanded=combatStyle==='Armes à deux mains'&&(srdW?.properties||'').includes('deux mains');
        const isMagic=w.magic;
        const slotLabel=isRanged?'Distance':w.slot==='mainhand'?'Main droite':'Main gauche';
        const ammoItem=isRanged&&w.ammoLink?(p.inventory||[]).find(i=>i.name===w.ammoLink):null;
        const ammoCount=ammoItem?ammoItem.qty:null;
        const styleBadge=isDueling?`<span style="font-size:10px;color:#4caf50;margin-left:4px">+2 dégâts (Duel)</span>`:archerieBonus?`<span style="font-size:10px;color:#4caf50;margin-left:4px">+2 att. (Archerie)</span>`:isTwoHanded?`<span style="font-size:10px;color:#4caf50;margin-left:4px">Relance 1-2 (2 mains)</span>`:'';
        return`<div style="background:var(--surface2);border:1px solid ${isMagic?'#9b59b6':'var(--border)'};border-radius:6px;padding:10px;margin-bottom:6px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:14px;font-weight:600">${esc(w.name)}${isMagic?` <span class="magic-badge">✨ Magique${w.linkedTo?' • Lié: '+esc(w.linkedTo):''}</span>`:''}</span>
            <span style="color:var(--cp);font-weight:600">+${atkBonus} / ${esc(srdW?srdW.damage:'—')}${isDueling?' +2':''}</span>
          </div>
          <div style="font-size:11px;color:var(--text3);margin-top:3px">${slotLabel}${isRanged&&ammoCount!==null?` • 🏹 <span style="color:${ammoCount<=5?'#e53935':'var(--cp)'}">${ammoCount}</span> ${esc(w.ammoLink||'munitions')}`:''}${styleBadge}</div>
          ${isRanged?`<div style="font-size:11px;color:var(--text3);margin-top:4px">
            ${w.ammoLink?`<button class="btn bsm" style="font-size:10px" onclick="unlinkRangedAmmo()">↩ Délier ${esc(w.ammoLink)}</button>`:
            `<button class="btn bsm" style="font-size:10px" onclick="openLinkAmmoModal()">🏹 Lier des munitions</button>`}
          </div>`:''}
          <div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:6px">${Array.from({length:attackCount},(_,ai)=>`<button class="btn bsm" onclick="rollAttack('${esc(w.name)}',${atkBonus},'${esc(srdW?srdW.damage:'1d6')}','${w.slot}',${isDueling?2:0})">🎲${attackCount>1?' Att.'+(ai+1):'  Attaque'}</button>`).join('')}</div>
        </div>`;
      }).join(''):`<div style="font-size:12px;color:var(--text3);font-style:italic">Aucune arme équipée.</div>`}
      <div style="margin-top:10px;display:flex;gap:5px;flex-wrap:wrap">${['d4','d6','d8','d10','d12','d20'].map(d=>`<button class="dice-btn" onclick="rollDie('${d}')">🎲 ${d}</button>`).join('')}</div>
      <div id="rollResult" style="margin-top:8px;padding:8px;background:var(--surface2);border-radius:6px;display:${_lastRollResultHtml?'block':'none'};font-size:14px;font-weight:600;color:var(--cp);text-align:center">${_lastRollResultHtml}</div>
    </div>`)}
  ${cs('cs-sauvegardes',`<div class="panel"><div class="pt" style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span>Sauvegardes</div>
      ${ABILITIES_SH.map((ab,i)=>{const saves=CLASS_SAVES[mc?mc.name:'']||[];const hasSave=saves.includes(i);const m=mod(p.abilities[i])+(hasSave?pb(lvl):0);return`<div class="save-btn" onclick="rollSave('${ab}',${m})"><span class="save-dot${hasSave?' p':''}"></span><span style="flex:1;font-size:13px">${ab}</span><span style="color:var(--cp);font-weight:600">${fmt(m)}</span><span style="font-size:10px;color:var(--text3)">🎲</span></div>`;}).join('')}
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
  ${!wsC?.active&&barbareLvl>0?cs('cs-barbare',`<div class="panel mb10"><div class="pt" style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span>🔥 Rage — Barbare</div>
      <div style="font-size:11px;color:var(--text3);margin-bottom:10px">${_featDesc('Barbare','Rage')}</div>
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <div class="sb hi" style="flex:1;min-width:80px"><div class="sn">Bonus dégâts</div><div style="font-size:20px;font-weight:700;color:var(--cp)">+${rageBonus}</div></div>
        <div style="flex:2"><div style="font-size:11px;color:var(--text3);margin-bottom:4px">Charges de Rage (Niv. ${barbareLvl})</div>${(()=>{const rageKey='Rage (2 utilisations, +2 dégâts)';const rageMax=barbareLvl>=17?6:barbareLvl>=12?5:barbareLvl>=6?4:barbareLvl>=3?3:2;const cc=p.combatCharges||{};const remaining=cc[rageKey]!==undefined?cc[rageKey]:rageMax;return`<div style="display:flex;gap:4px;flex-wrap:wrap">${Array.from({length:rageMax},(_,i)=>`<span class="slot-bubble${i<remaining?'':' used'}" onclick="useCombatCharge('Rage (2 utilisations, +2 dégâts)',${rageMax})" title="Utiliser une rage"></span>`).join('')}</div><div style="font-size:10px;color:var(--text3);margin-top:4px">${remaining}/${rageMax} • Récup. repos long</div><button class="btn bsm" style="margin-top:4px" onclick="recoverCombatCharge('Rage (2 utilisations, +2 dégâts)',${rageMax})">↺ Récupérer</button>`;})()}</div>
      </div>
      ${(()=>{const cc=p.combatCharges||{};const rageActive=cc['RageActive']===true;const totemChoice=cc['TotemSpirit']||'';const bg=rageActive?'rgba(229,57,53,0.1)':'var(--surface2)';const bc=rageActive?'#e53935':'var(--border)';const col=rageActive?'#e53935':'var(--text3)';const tagBg=rageActive?'rgba(229,57,53,0.2)':'var(--surface3)';const baseResTags=['Contondant','Perforant','Tranchant'].map(r=>`<span style="font-size:11px;padding:2px 8px;border-radius:10px;background:${tagBg};color:${col};border:1px solid ${bc}">${r}</span>`).join('');const rageAveugleTag=(isBerserker&&barbareLvl>=6&&rageActive)?`<span style="font-size:11px;padding:2px 8px;border-radius:10px;background:rgba(76,175,80,.2);color:#4caf50;border:1px solid #4caf50">🛡 Immunité charme/peur</span>`:'';const totemOursTags=(isTotem&&totemChoice==='Ours'&&rageActive)?['Feu','Froid','Foudre','Nécrotique','Acide','Tonnerre','Radiant','Poison'].map(r=>`<span style="font-size:11px;padding:2px 8px;border-radius:10px;background:rgba(76,175,80,.2);color:#4caf50;border:1px solid #4caf50">${r}</span>`).join(''):'';return`<div style="margin-top:10px;padding:8px;background:${bg};border-radius:6px;border:1px solid ${bc}"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px"><span style="font-size:12px;font-weight:600;color:${col}">${rageActive?'🔥 En rage':'💤 Hors rage'}</span><button class="btn bsm" style="${rageActive?'color:#e53935;border-color:#e53935;':''}" onclick="toggleRageActive()">${rageActive?'⬛ Sortir de la rage':'🔥 Entrer en rage'}</button></div><div style="font-size:11px;color:var(--text3);margin-bottom:4px">Résistances actives en rage :</div><div style="display:flex;gap:4px;flex-wrap:wrap">${baseResTags}${rageAveugleTag}${totemOursTags}</div></div>`;})()}
      ${(()=>{const exh=p.exhaustion||0;const exhDesc=['Aucun épuisement','Désavantage aux jets de caractéristique','Vitesse ÷2','Désavantage aux attaques et jets de sauvegarde','Vitesse = 0','Désavantage à tous les jets de sauvegarde','☠ La créature meurt'];return`<div style="margin-top:10px;padding:8px;background:${exh>=3?'rgba(229,57,53,.08)':'var(--surface2)'};border-radius:6px;border:1px solid ${exh>=3?'rgba(229,57,53,.4)':'var(--border)'}"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px"><span style="font-size:12px;font-weight:600;color:${exh>=3?'#e53935':'var(--text2)'}">💀 Épuisement — ${exh}/6</span><div style="display:flex;gap:4px"><button class="btn bsm" onclick="P().exhaustion=Math.min(6,(P().exhaustion||0)+1);_markUnsaved();render()" title="Ajouter un niveau">+1</button><button class="btn bsm" onclick="P().exhaustion=Math.max(0,(P().exhaustion||0)-1);_markUnsaved();render()" title="Récupérer un niveau">-1</button></div></div><div style="display:flex;gap:3px;margin-bottom:6px">${Array.from({length:6},(_,i)=>`<span style="width:18px;height:18px;border-radius:50%;border:2px solid ${i<exh?'#e53935':'var(--border)'};background:${i<exh?'rgba(229,57,53,.35)':'transparent'};display:inline-block"></span>`).join('')}</div><div style="font-size:11px;color:${exh>=3?'#e53935':'var(--text3)'}">${exhDesc[exh]||''}</div></div>`;})()}
      ${(()=>{if(barbareLvl<2)return'';const temActive=(p.combatCharges||{})['Témérité']===true;return`<div style="margin-top:10px;padding:8px;background:${temActive?'rgba(255,152,0,.1)':'var(--surface2)'};border-radius:6px;border:1px solid ${temActive?'#ff9800':'var(--border)'}"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px"><span style="font-size:12px;font-weight:600;color:${temActive?'#ff9800':'var(--cp)'}">😤 Attaque téméraire</span><button class="btn bsm" style="${temActive?'color:#ff9800;border-color:#ff9800':''}" onclick="P().combatCharges=P().combatCharges||{};P().combatCharges['Témérité']=!${temActive};_markUnsaved();render()">${temActive?'✕ Désactiver':'Activer ce tour'}</button></div><div style="font-size:11px;color:var(--text3)">${temActive?'✅ Avantage sur tes attaques de mêlée. ❌ Les attaquants ont l\'avantage contre toi jusqu\'au prochain tour.':'Avantage sur toutes les attaques de mêlée (Force) ce tour. Les attaquants ont l\'avantage contre toi jusqu\'à ton prochain tour.'}</div></div>`})()}
      ${(isBerserker&&barbareLvl>=3)?(()=>{const frenActive=(p.combatCharges||{})['FrénésieActive']===true;return`<div style="margin-top:10px;padding:8px;background:${frenActive?'rgba(183,28,28,.1)':'var(--surface2)'};border-radius:6px;border:1px solid ${frenActive?'#b71c1c':'var(--border)'}"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px"><span style="font-size:12px;font-weight:600;color:${frenActive?'#b71c1c':'var(--cp)'}">💢 Frénésie</span><button class="btn bsm" style="${frenActive?'color:#b71c1c;border-color:#b71c1c':''}" onclick="P().combatCharges=P().combatCharges||{};P().combatCharges['FrénésieActive']=!${frenActive};_markUnsaved();render()">${frenActive?'✕ Désactiver':'⚔ Activer pour cette rage'}</button></div><div style="font-size:11px;color:var(--text3)">${frenActive?'⚔ Attaque bonus (mêlée) à chaque tour de rage. ⚠ +1 épuisement à la fin de la rage.':'Attaque bonus (mêlée) par tour de rage, au coût de 1 épuisement à la fin.'}</div></div>`})():''}
      ${(isBerserker&&barbareLvl>=10)?`<div style="margin-top:10px;padding:8px;background:var(--surface2);border-radius:6px"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px"><span style="font-size:12px;font-weight:600;color:var(--cp)">😱 Présence intimidante</span><span style="font-size:11px;color:var(--text3)">Action • portée 9m</span></div><div style="font-size:11px;color:var(--text3)">Cible une créature qui peut te voir/entendre. JS SAG DD <strong style="color:var(--cp)">${8+pb(lvl)+chaM}</strong> ou Effrayée jusqu'à la fin de ton prochain tour.</div></div>`:''}
      ${(isBerserker&&barbareLvl>=14)?`<div style="margin-top:10px;padding:8px;background:var(--surface2);border-radius:6px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:2px">⚡ Représailles</div><div style="font-size:11px;color:var(--text3)">Réaction : quand tu subis des dégâts d'une attaque de mêlée, tu peux immédiatement faire 1 attaque de mêlée contre l'attaquant.</div></div>`:''}
      ${(isTotem&&barbareLvl>=3)?(()=>{const tc=(p.combatCharges||{})['TotemSpirit']||'';const totems=[{id:'Ours',icon:'🐻',desc:'Résistance à tous les dégâts en rage (sauf psychiques). Appliquée automatiquement à l\'entrée en rage.'},{id:'Aigle',icon:'🦅',desc:'Tes déplacements ne provoquent pas d\'attaques d\'opportunité en rage (hors armure lourde).'},{id:'Loup',icon:'🐺',desc:'En rage, tes alliés ont l\'avantage sur les jets d\'attaque de mêlée contre les créatures à 1,5m de toi.'}];return`<div style="margin-top:10px;padding:8px;background:var(--surface2);border-radius:6px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:8px">🌿 Esprit totem</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">${totems.map(t=>`<button class="btn bsm${tc===t.id?' bac':''}" onclick="P().combatCharges=P().combatCharges||{};P().combatCharges['TotemSpirit']='${t.id}';_markUnsaved();render()">${t.icon} ${t.id}</button>`).join('')}</div>${tc?`<div style="font-size:11px;color:var(--text3)">${totems.find(t=>t.id===tc)?.desc||''}</div>`:'<div style="font-size:11px;color:var(--text3);font-style:italic">Choisissez votre esprit totem ci-dessus.</div>'}</div>`})():''}
      ${(isMagieSauvage&&barbareLvl>=3)?(()=>{const cc2=p.combatCharges||{};const srsResult=cc2['SursautResult'];const SRSAUT=['Régénération : récupère 1d6 PV au début de chaque tour.','Flammes : créatures dans 1,5m subissent 1d6 feu (JS DEX DD15 annule).','Téléportation aléatoire : apparais à 18m dans un espace libre visible à la fin du tour.','Aveuglement : tu es aveuglé jusqu\'à la fin de ton prochain tour.','Spectre : +1d6 dégâts de force sur chaque attaque réussie.','Répulsion : créatures dans 9m — JS FOR DD(8+PB+FOR) ou repoussées de 3m.','Lumière spectrale : éclaire 9m, désavantage sur les attaques contre toi jusqu\'au prochain tour.','Tremblement : créatures au sol dans 9m — JS DEX DD(8+PB+DEX) ou renversées.'];return`<div style="margin-top:10px;padding:8px;background:var(--surface2);border-radius:6px"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px"><span style="font-size:12px;font-weight:600;color:var(--cp)">✨ Magie sauvage</span><button class="btn bsm bac" onclick="(()=>{const r=Math.floor(Math.random()*8);P().combatCharges=P().combatCharges||{};P().combatCharges['SursautResult']=r;_markUnsaved();render();showToast('✨ Sursaut sauvage — '+(r+1)+'/8')})()">🎲 Sursaut sauvage</button></div>${srsResult!==undefined?`<div style="padding:6px 10px;background:rgba(156,39,176,.1);border:1px solid rgba(156,39,176,.3);border-radius:6px;font-size:11px;color:var(--text2);margin-bottom:6px"><strong style="color:#9c27b0">Résultat ${srsResult+1}/8 :</strong> ${SRSAUT[srsResult]||''}</div><button class="btn bsm" onclick="P().combatCharges=P().combatCharges||{};delete P().combatCharges['SursautResult'];_markUnsaved();render()">↺ Effacer</button>`:'<div style="font-size:11px;color:var(--text3);font-style:italic;margin-bottom:6px">Lancez le dé en entrant en rage.</div>'}${barbareLvl>=6?`<div style="margin-top:8px;font-size:11px;color:var(--text3)">⚡ <strong>Réserve de magie :</strong> sans charge de rage lors du jet d'initiative → regagne 1 automatiquement.</div>`:''}${barbareLvl>=10?`<div style="margin-top:4px;font-size:11px;color:var(--text3)">🌀 <strong>Réaction instable :</strong> subir les effets d'un sort → déclencher un Sursaut sauvage en réaction.</div>`:''}${barbareLvl>=14?`<div style="margin-top:4px;font-size:11px;color:var(--text3)">🎯 <strong>Sursaut contrôlé :</strong> tu peux choisir parmi 2 résultats du d8.</div>`:''}` +`</div>`})():''}
      ${barbareLvl>=9?(()=>{const critDice=barbareLvl>=17?3:barbareLvl>=13?2:1;return`<div style="margin-top:10px;padding:8px;background:var(--surface2);border-radius:6px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:2px">💥 Critique brutal</div><div style="font-size:11px;color:var(--text3)">+${critDice} dé${critDice>1?'s':''} de dégâts supplémentaire${critDice>1?'s':''} sur un coup critique en rage.</div></div>`;})():''}
      ${barbareLvl>=7?`<div style="margin-top:10px;padding:8px;background:var(--surface2);border-radius:6px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:2px">🦅 Instinct sauvage</div><div style="font-size:11px;color:var(--text3)">Initiative : avantage. Impossible d'être surpris (si en rage au début du combat).</div></div>`:''}
      ${barbareLvl>=11?`<div style="margin-top:10px;padding:8px;background:var(--surface2);border-radius:6px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:2px">💪 Rage implacable</div><div style="font-size:11px;color:var(--text3)">Si tu tombes à 0 PV en rage sans mourir sur le coup, JS CON DD 10 (+5 à chaque usage, reset repos) — succès : tu reviens à 1 PV.</div></div>`:''}
      ${barbareLvl>=18?`<div style="margin-top:10px;padding:8px;background:var(--surface2);border-radius:6px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:2px">🏋 Puissance indomptable</div><div style="font-size:11px;color:var(--text3)">Si le résultat d'un jet de Force est inférieur à ta valeur de Force, tu peux utiliser la valeur de Force à la place.</div></div>`:''}
    </div>`):''}
  ${!wsC?.active&&moineLvl>0?cs('cs-moine',`<div class="panel mb10"><div class="pt" style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span>☯ Moine — Capacités</div>
      <!-- Arts martiaux -->
      <div style="margin-bottom:12px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:4px">👊 Arts martiaux</div>
        <div style="font-size:11px;color:var(--text3);margin-bottom:6px">Frappe à mains nues ou arme moine — utilise FOR ou DEX au choix. Dé de base à ce niveau :</div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <div class="sb hi" style="padding:6px 14px;flex-shrink:0"><div class="sn">Dé</div><div style="font-size:20px;font-weight:700;color:var(--cp)">${artsMartiauxDie}</div></div>
          <div><button class="btn bsm" onclick="rollCustomDmg('1${artsMartiauxDie}+${Math.max(forM,dexM)}','Arts martiaux')">🎲 1${artsMartiauxDie}${fmt(Math.max(forM,dexM))} dégâts</button>
          <div style="font-size:10px;color:var(--text3);margin-top:3px">Action bonus : 1 frappe supplémentaire (sans ki)</div></div>
        </div>
        ${!(p.equip||{}).chest?.name?`<div style="margin-top:8px;padding:6px 10px;background:var(--surface2);border-radius:6px;font-size:11px;color:var(--text3)">🛡 Défense sans armure (sans armure) : CA = 10 + DEX (${fmt(dexM)}) + SAG (${fmt(sagM)}) = <strong style="color:var(--cp)">${10+dexM+sagM}</strong></div>`:''}
      </div>
      <!-- Points de ki (niv.2+) -->
      ${moineLvl>=2?(()=>{const remaining=(p.combatCharges?.['Ki']!==undefined)?p.combatCharges['Ki']:kiMax;return`<div style="border-top:1px solid var(--border);padding-top:10px;margin-bottom:10px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:4px">☯ Points de ki — ${kiMax} / récup. repos court</div><div style="font-size:11px;color:var(--text3);margin-bottom:8px">Points dépensés pour activer des techniques de moine. Coût : 1 à plusieurs ki selon la technique.</div><div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">${Array.from({length:kiMax},(_,ki)=>`<span class="slot-bubble${ki<remaining?'':' used'}" onclick="toggleKi(${ki},${kiMax})" style="cursor:pointer" title="${ki<remaining?'Cliquer pour dépenser 1 ki':'ki dépensé'}"></span>`).join('')}</div><div style="display:flex;align-items:center;gap:8px"><span style="font-size:11px;color:var(--text3)">${remaining}/${kiMax} disponibles</span><button class="btn bsm" onclick="P().combatCharges=P().combatCharges||{};P().combatCharges['Ki']=${kiMax};_markUnsaved();render()">↺ Repos court</button></div></div>`;})():''}
      <!-- Techniques de ki -->
      <div style="border-top:1px solid var(--border);padding-top:10px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:8px">Techniques disponibles</div>
        ${moineLvl>=2?`<div style="padding:7px 10px;background:var(--surface2);border-radius:6px;margin-bottom:6px"><div style="font-size:12px;font-weight:600">🌊 Déluge de coups <span style="font-size:10px;color:var(--cp);margin-left:4px">1 ki</span></div><div style="font-size:11px;color:var(--text3);margin-top:2px">Action bonus : effectue 2 frappes à mains nues supplémentaires après l'action Attaquer.</div></div>`:''}
        ${moineLvl>=2?`<div style="padding:7px 10px;background:var(--surface2);border-radius:6px;margin-bottom:6px"><div style="font-size:12px;font-weight:600">💨 Pas du vent <span style="font-size:10px;color:var(--cp);margin-left:4px">1 ki</span></div><div style="font-size:11px;color:var(--text3);margin-top:2px">Action bonus : Se désengager OU Esquiver. Réaction : Se dresser quand une créature rate une attaque contre toi.</div></div>`:''}
        ${moineLvl>=3?`<div style="padding:7px 10px;background:var(--surface2);border-radius:6px;margin-bottom:6px"><div style="font-size:12px;font-weight:600">🛡 Parade de projectiles <span style="font-size:10px;color:var(--cp);margin-left:4px">1 ki (réaction)</span></div><div style="font-size:11px;color:var(--text3);margin-top:2px">Réaction : réduis les dégâts d'une attaque à distance de 1d10 + DEX + niveau. Si tu ramènes à 0, tu peux relancer le projectile.</div></div>`:''}
        ${moineLvl<2?`<div style="font-size:11px;color:var(--text3);font-style:italic;padding:4px 0">Ki et techniques disponibles à partir du niveau 2.</div>`:''}
        ${moineLvl>=5?`<div style="padding:7px 10px;background:var(--surface2);border-radius:6px;margin-bottom:6px"><div style="font-size:12px;font-weight:600">⚡ Frappe étourdissante <span style="font-size:10px;color:var(--cp);margin-left:4px">1 ki</span></div><div style="font-size:11px;color:var(--text3);margin-top:2px">Lors d'une attaque qui touche : la cible doit réussir un JS CON (DD ${8+pb(lvl)+Math.max(forM,dexM)}) ou est étourdie jusqu'à la fin de ton prochain tour.</div></div>`:''}
        ${moineLvl>=5?`<div style="padding:7px 10px;background:var(--surface2);border-radius:6px;margin-bottom:6px"><div style="font-size:12px;font-weight:600">🏹 Déflexion de projectiles <span style="font-size:10px;color:var(--text3);margin-left:4px">niv.5</span></div><div style="font-size:11px;color:var(--text3);margin-top:2px">Si tu pares à 0, tu peux relancer le projectile (portée 18m, att. DEX, dégâts Arts martiaux + DEX).</div></div>`:''}
        ${moineLvl>=9?`<div style="padding:7px 10px;background:var(--surface2);border-radius:6px;margin-bottom:6px"><div style="font-size:12px;font-weight:600">⚡ Pas comme l'éclair <span style="font-size:10px;color:var(--cp);margin-left:4px">2 ki</span></div><div style="font-size:11px;color:var(--text3);margin-top:2px">Action bonus : téléporte-toi jusqu'à 18m vers un espace libre que tu vois.</div></div>`:''}
        ${moineLvl>=11?`<div style="padding:7px 10px;background:var(--surface2);border-radius:6px;margin-bottom:6px"><div style="font-size:12px;font-weight:600">💫 Frappe des quatre vents <span style="font-size:10px;color:var(--cp);margin-left:4px">3 ki</span></div><div style="font-size:11px;color:var(--text3);margin-top:2px">Tous les ennemis dans un rayon de 4,5m doivent réussir un JS DEX (DD ${8+pb(lvl)+Math.max(forM,dexM)}) ou subir 3 × ${artsMartiauxDie} dégâts contondants.</div></div>`:''}
        ${isPaume&&moineLvl>=17?`<div style="padding:7px 10px;background:var(--surface2);border-radius:6px;margin-bottom:6px"><div style="font-size:12px;font-weight:600">☠ Frappe des vibrations <span style="font-size:10px;color:var(--cp);margin-left:4px">3 ki</span></div><div style="font-size:11px;color:var(--text3);margin-top:2px">Lors d'une attaque : paralyse (JS CON DD ${8+pb(lvl)+Math.max(forM,dexM)}) ou arrêt du cœur si la cible est déjà paralysée (JS CON ou tombe à 0 PV).</div></div>`:''}
        ${moineLvl>=18?`<div style="padding:7px 10px;background:var(--surface2);border-radius:6px;margin-bottom:6px"><div style="font-size:12px;font-weight:600">👻 Corps vide <span style="font-size:10px;color:var(--cp);margin-left:4px">4 ki</span></div><div style="font-size:11px;color:var(--text3);margin-top:2px">Action : invisible 1 minute, résistance à tous les dégâts sauf force psychique.</div></div>`:''}
      </div>
      ${isPaume&&moineLvl>=3?`<div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:6px">🥋 Voie de la paume</div><div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Technique de la paume (niv.3) — Quand tu touches avec Déluge de coups : pousser 4,5m / faire tomber / priver de réaction (au choix)</div>${moineLvl>=6?(()=>{const ppUsed=!!(p.combatCharges||{})['PlénitudePhysiqueUsed'];return`<div style="padding:6px 8px;background:${ppUsed?'rgba(200,168,75,.08)':'var(--surface2)'};border:1px solid ${ppUsed?'var(--cp)':'var(--border)'};border-radius:6px;margin-bottom:4px"><div style="font-size:11px;font-weight:600;color:var(--text2)">Plénitude physique (niv.6) — 1×/repos long</div><div style="font-size:10px;color:var(--text3);margin:2px 0">Action : récupère ${moineLvl*3} PV (niveau × 3)</div>${ppUsed?`<button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};delete p.combatCharges['PlénitudePhysiqueUsed'];saveAll();render();})()">↺ Repos long</button>`:`<button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['PlénitudePhysiqueUsed']=true;p.hp=Math.min(p.hpMax||(p.hp||0),p.hp+${moineLvl*3});saveAll();render();showToast('💚 +${moineLvl*3} PV (Plénitude physique)');})()">⚡ Soigner (+${moineLvl*3} PV)</button>`}</div>`;})():''}${moineLvl>=11?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">Tranquillité (niv.11) — Après un repos long, bénéfice de Sanctuaire (DD ${8+pb(moineLvl)+sagM}) jusqu'au prochain tour de combat</div>`:''}</div>`:''}
      ${isOmbre&&moineLvl>=3?`<div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:6px">🌑 Voie de l'ombre</div><div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Arts des ombres (niv.3) — 2 ki : lancer ténèbres, vision dans le noir, passage sans trace ou silence. Illusion mineure gratuite en tout temps.</div>${moineLvl>=6?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Foulée d'ombre (niv.6) — Action bonus : téléportation 18m dans un espace en pénombre ou ténèbres. Avantage sur la prochaine attaque.</div>`:''} ${moineLvl>=11?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Linceul d'ombre (niv.11) — Action : devenir invisible en pénombre/ténèbres (jusqu'au début de ton prochain tour)</div>`:''} ${moineLvl>=17?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">Opportuniste (niv.17) — Réaction : quand une créature à 1,5m est touchée par un allié, tu peux faire 1 attaque contre elle</div>`:''}</div>`:''}
      ${isQE&&moineLvl>=3?`<div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:6px">🌊 Voie des quatre éléments</div><div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Disciple des éléments — Lien élémentaire + 1 discipline au niv.3 (nouvelles aux niv.6/11/17). Chaque discipline coûte 2 à 6 pts de ki selon son niveau.</div><div style="font-size:11px;color:var(--text3)">DD des sorts : ${8+pb(moineLvl)+sagM}. Utilise les pts de ki communs.</div></div>`:''}
      <!-- Traits passifs hauts niveaux -->
      ${moineLvl>=10?`<div style="margin-top:8px;padding:6px 10px;background:var(--surface2);border-radius:6px;font-size:11px;color:var(--text3)">🌿 <strong>Pureté du corps</strong> (niv.10) : Immunité aux maladies et aux poisons.</div>`:''}
      ${moineLvl>=13?`<div style="margin-top:6px;padding:6px 10px;background:var(--surface2);border-radius:6px;font-size:11px;color:var(--text3)">💎 <strong>Âme de diamant</strong> (niv.13) : Maîtrise de tous les jets de sauvegarde.</div>`:''}
      ${moineLvl>=15?`<div style="margin-top:6px;padding:6px 10px;background:var(--surface2);border-radius:6px;font-size:11px;color:var(--text3)">🧘 <strong>Silence éternel</strong> (niv.15) : Immunité aux états charmé et effrayé.</div>`:''}
      ${moineLvl>=20?`<div style="margin-top:6px;padding:6px 10px;background:var(--surface2);border-radius:6px;font-size:11px;color:var(--text3)">✨ <strong>Perfection du soi</strong> (niv.20) : Si tu tires un 9 ou moins à un jet de caractéristique FOR ou DEX, tu obtiens 10.</div>`:''}
    </div>`):''}
  ${!wsC?.active&&bardeLvl>0?cs('cs-barde',`<div class="panel mb10"><div class="pt" style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span>🎵 Barde — Capacités</div>
    <div style="margin-bottom:14px">
      <div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:4px">🎵 Inspiration bardique</div>
      <div style="font-size:11px;color:var(--text3);margin-bottom:8px">${_featDesc('Barde','Inspiration bardique')}</div>
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <div class="sb hi" style="flex:1;min-width:80px"><div class="sn">Dé</div><div style="font-size:18px;font-weight:700;color:var(--cp)">${bardDie}</div></div>
        <div style="flex:2">
          <div style="font-size:11px;color:var(--text3);margin-bottom:4px">Utilisations (CHA = ${Math.max(1,chaM)}/repos ${bardeLvl>=5?'court':'long'})</div>
          ${(()=>{const biUsed=(p.combatCharges||{})['Inspiration bardique']!==undefined?p.combatCharges['Inspiration bardique']:bardInspiUses;return`<div style="display:flex;gap:4px;flex-wrap:wrap">${Array.from({length:bardInspiUses},(_,bi)=>`<span class="slot-bubble${bi<biUsed?'':' used'}" onclick="useCombatCharge('Inspiration bardique',${bardInspiUses})"></span>`).join('')}</div><div style="font-size:10px;color:var(--text3);margin-top:4px">${biUsed}/${bardInspiUses} • Lancer : <button class="btn bsm" onclick="rollCustomDmg('1${bardDie}','Inspiration bardique')">🎲 ${bardDie}</button></div><button class="btn bsm" style="margin-top:4px" onclick="recoverCombatCharge('Inspiration bardique',${bardInspiUses})">↺ Récupérer</button>`;})()}
        </div>
      </div>
    </div>
    ${bardeLvl>=2?(()=>{const chantDie=bardeLvl>=17?'d12':bardeLvl>=13?'d10':bardeLvl>=9?'d8':'d6';return`<div style="margin-bottom:12px;padding:8px;background:var(--surface2);border-radius:6px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:2px">🎶 Chant reposant <span style="font-size:10px;color:var(--text3)">(${chantDie})</span></div><div style="font-size:11px;color:var(--text3)">Durant un repos court, les alliés qui t'écoutent récupèrent <strong>${chantDie}</strong> PV supplémentaires en plus de leurs propres dés de vie.</div></div>`;})():''}
    ${bardeLvl>=6?(()=>{const cmActive=!!(p.combatCharges||{})['ContreCharmeActive'];return`<div style="margin-bottom:12px;padding:8px;background:${cmActive?'rgba(33,150,243,.1)':'var(--surface2)'};border-radius:6px;border:1px solid ${cmActive?'rgba(33,150,243,.5)':'transparent'}"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px"><div style="font-size:12px;font-weight:600;color:var(--cp)">🎤 Contre-charme <span style="font-size:10px;color:var(--text3)">niv.6+</span></div><button class="btn bsm" style="${cmActive?'color:#2196f3;border-color:#2196f3':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['ContreCharmeActive']=!p.combatCharges['ContreCharmeActive'];saveAll();render();})()">${cmActive?'🎤 Actif':'▶ Activer'}</button></div><div style="font-size:11px;color:var(--text3)">Action : les alliés à portée de voix (9m) ont l'avantage aux JS contre charme et peur jusqu'à la fin de ton prochain tour.</div></div>`;})():''}
    ${bardeLvl>=20?`<div style="margin-bottom:12px;padding:8px;background:var(--surface2);border-radius:6px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:2px">⭐ Inspiration supérieure <span style="font-size:10px;color:var(--text3)">niv.20</span></div><div style="font-size:11px;color:var(--text3)">Tu récupères toutes tes inspirations bardiques lors d'un repos court.</div></div>`:''}
    ${isSavoir&&bardeLvl>=3?`<div style="margin-top:4px;padding:10px;background:rgba(156,39,176,.07);border:1px solid rgba(156,39,176,.2);border-radius:8px"><div style="font-size:12px;font-weight:700;color:#9c27b0;margin-bottom:8px">📚 Collège du savoir</div><div style="padding:7px 10px;background:var(--surface2);border-radius:6px;margin-bottom:6px"><div style="font-size:12px;font-weight:600">🗡 Mots cinglants <span style="font-size:10px;color:var(--cp);margin-left:4px">1 inspiration (réaction)</span></div><div style="font-size:11px;color:var(--text3);margin-top:2px">Réaction quand une créature visible fait un jet d'attaque, compétence ou sauvegarde : dépense 1 inspiration bardique, la cible soustrait le résultat du dé à son jet.</div></div>${bardeLvl>=6?`<div style="padding:7px 10px;background:var(--surface2);border-radius:6px;margin-bottom:6px"><div style="font-size:12px;font-weight:600">📖 Secrets magiques supplémentaires <span style="font-size:10px;color:var(--text3)">niv.6</span></div><div style="font-size:11px;color:var(--text3);margin-top:2px">Tu connais 2 sorts supplémentaires issus de n'importe quelle liste de classe.</div></div>`:''} ${bardeLvl>=14?`<div style="padding:7px 10px;background:var(--surface2);border-radius:6px"><div style="font-size:12px;font-weight:600">🎯 Compétence hors-pair <span style="font-size:10px;color:var(--text3)">niv.14</span></div><div style="font-size:11px;color:var(--text3);margin-top:2px">Quand tu rates un jet de compétence, dépense 1 inspiration bardique et ajoute le résultat du dé (peut transformer l'échec en réussite).</div></div>`:''}</div>`:''}
    ${isVaillance&&bardeLvl>=3?`<div style="margin-top:4px;padding:10px;background:rgba(33,150,243,.07);border:1px solid rgba(33,150,243,.2);border-radius:8px"><div style="font-size:12px;font-weight:700;color:#2196f3;margin-bottom:8px">🛡 Collège de la vaillance</div><div style="padding:7px 10px;background:var(--surface2);border-radius:6px;margin-bottom:6px"><div style="font-size:12px;font-weight:600">⚔ Inspiration martiale <span style="font-size:10px;color:var(--cp);margin-left:4px">1 inspiration bardique</span></div><div style="font-size:11px;color:var(--text3);margin-top:2px">Un allié qui reçoit une inspiration bardique peut utiliser le dé pour ajouter son résultat à un jet de dégâts OU à sa CA contre une attaque.</div></div>${bardeLvl>=6?`<div style="padding:7px 10px;background:var(--surface2);border-radius:6px;margin-bottom:6px"><div style="font-size:12px;font-weight:600">⚔ Attaque supplémentaire <span style="font-size:10px;color:var(--text3)">niv.6</span></div><div style="font-size:11px;color:var(--text3);margin-top:2px">Tu peux attaquer deux fois au lieu d'une quand tu prends l'action Attaquer.</div></div>`:''} ${bardeLvl>=14?`<div style="padding:7px 10px;background:var(--surface2);border-radius:6px"><div style="font-size:12px;font-weight:600">✨ Magie de combat <span style="font-size:10px;color:var(--text3)">niv.14</span></div><div style="font-size:11px;color:var(--text3);margin-top:2px">Quand tu prends l'action Attaquer, tu peux lancer un sort bardique comme action bonus à la place d'une de tes attaques.</div></div>`:''}</div>`:''}
  </div>`):''}
  ${!wsC?.active&&roublardLvl>0?cs('cs-roublard',`<div class="panel mb10"><div class="pt" style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span>🗡 Roublard — Capacités</div>
    <div style="margin-bottom:14px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:4px">🎯 Attaque sournoise</div><div style="font-size:11px;color:var(--text3);margin-bottom:8px">1 fois par tour. Si avantage OU allié adjacent à la cible (pas de désavantage). Arme de finesse ou à distance. Ajoute ${snkDice}d6 aux dégâts.</div><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><div class="sb hi" style="padding:6px 14px;flex-shrink:0"><div class="sn">Dés</div><div style="font-size:20px;font-weight:700;color:var(--cp)">${snkDice}d6</div></div><button class="btn bsm" onclick="rollCustomDmg('${snkDice}d6','Attaque sournoise')">🎲 ${snkDice}d6</button></div></div>
    ${roublardLvl>=2?`<div style="margin-bottom:8px;padding:8px;background:var(--surface2);border-radius:6px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:2px">⚡ Action rusée (niv.2)</div><div style="font-size:11px;color:var(--text3)">Action bonus chaque tour : Foncer (vitesse ×2), Se désengager (pas d'attaque d'opportunité) ou Se cacher (jet de Discrétion).</div></div>`:''}
    ${roublardLvl>=5?`<div style="margin-bottom:8px;padding:8px;background:var(--surface2);border-radius:6px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:2px">🛡 Esquive instinctive (niv.5)</div><div style="font-size:11px;color:var(--text3)">Réaction quand un attaquant que tu vois te touche : réduire de moitié les dégâts reçus.</div></div>`:''}
    ${roublardLvl>=7?`<div style="margin-bottom:8px;padding:8px;background:var(--surface2);border-radius:6px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:2px">💨 Esquive totale (niv.7)</div><div style="font-size:11px;color:var(--text3)">Si tu réussis un JS DEX contre un effet qui inflige la moitié des dégâts, tu ne subis aucun dégât. Si tu rates, seulement la moitié.</div></div>`:''}
    ${roublardLvl>=11?`<div style="margin-bottom:8px;padding:8px;background:var(--surface2);border-radius:6px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:2px">💎 Savoir-faire (niv.11)</div><div style="font-size:11px;color:var(--text3)">Tout jet de compétence maîtrisée : un résultat du d20 de 9 ou moins compte automatiquement comme 10.</div></div>`:''}
    ${roublardLvl>=14?`<div style="margin-bottom:8px;padding:8px;background:var(--surface2);border-radius:6px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:2px">👁 Perception aveugle (niv.14)</div><div style="font-size:11px;color:var(--text3)">Si tu peux entendre, tu connais la position de toute créature cachée ou invisible à 3m ou moins.</div></div>`:''}
    ${roublardLvl>=15?`<div style="margin-bottom:8px;padding:8px;background:var(--surface2);border-radius:6px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:2px">🧠 Esprit fuyant (niv.15)</div><div style="font-size:11px;color:var(--text3)">Tu gagnes la maîtrise aux jets de sauvegarde de Sagesse.</div></div>`:''}
    ${roublardLvl>=18?`<div style="margin-bottom:8px;padding:8px;background:var(--surface2);border-radius:6px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:2px">👻 Insaisissable (niv.18)</div><div style="font-size:11px;color:var(--text3)">Aucun jet d'attaque n'a d'avantage contre toi tant que tu n'es pas incapable d'agir.</div></div>`:''}
    ${roublardLvl>=20?(()=>{const ccUsed=!!((p.combatCharges||{})['CoupDeChanceUsed']);return`<div style="margin-bottom:8px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:4px">🍀 Coup de chance (niv.20) — 1/repos court</div><div style="font-size:11px;color:var(--text3);margin-bottom:6px">Si ton attaque rate : transformer en succès. Si tu rates un jet de caractéristique : traiter le d20 comme 20.</div><div style="display:flex;align-items:center;gap:6px"><span class="slot-bubble${ccUsed?' used':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['CoupDeChanceUsed']=!p.combatCharges['CoupDeChanceUsed'];saveAll();render();})()"></span><button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};delete p.combatCharges['CoupDeChanceUsed'];saveAll();render();})()">↺ Repos court</button></div></div>`;})():''}
    ${roublardLvl>=3?(()=>{if(!roublardPath)return'';const archIcon=isAssassin?'🗡':isVoleur?'🎭':isEscrocArc?'🔮':'🕵';let html=`<div style="border-top:1px solid var(--border);padding-top:10px;margin-top:8px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:6px">${archIcon} ${roublardPath.name}</div>`;
    if(isAssassin){html+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Assassinat (niv.3) — Avantage contre toute créature n'ayant pas encore agi. Coup critique automatique si la cible est surprise.</div>${roublardLvl>=9?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Expert en infiltration (niv.9) — Créer de fausses identités (1 semaine, 25 po). Elles passent pour réelles jusqu'à preuve du contraire.</div>`:''}${roublardLvl>=13?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Imposteur (niv.13) — Dupliquer parfaitement la voix, l'écriture et les manières d'une personne étudiée 3h.</div>`:''}${roublardLvl>=17?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">Frappe meurtrière (niv.17) — Attaque sournoise sur une cible surprise : JS CON DD ${8+pb(roublardLvl)+dexM} ou tomber à 0 PV.</div>`:''}`;}
    if(isVoleur){html+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Mains lestes (niv.3) — Action bonus (via Ruse) : Escamotage, crocheter serrure/piège, ou Utiliser un objet.</div><div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Monte-en-l'air (niv.3) — Escalade sans surcoût de mouvement. Saut en longueur +DEX×30cm.</div>${roublardLvl>=9?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Discrétion suprême (niv.9) — Avantage à Discrétion si tu ne te déplaces pas de plus de la moitié de ta vitesse.</div>`:''}${roublardLvl>=13?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Utilisation d'objets magiques (niv.13) — Ignorer conditions de classe/race/niveau pour les objets magiques.</div>`:''}${roublardLvl>=17?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">Réflexes de voleur (niv.17) — Deux tours au 1er round : initiative normale, puis initiative−10.</div>`:''}`;}
    if(isEscrocArc){html+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Incantation (niv.3) — Sorts INT (enchantement/illusion). DD ${8+pb(roublardLvl)+intM} · Bonus attaque +${pb(roublardLvl)+intM}.</div><div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Escamotage et main de mage (niv.3) — Main de mage invisible gratuite, contrôlée via action bonus (Ruse).</div>${roublardLvl>=9?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Embuscade magique (niv.9) — Si caché quand tu lances un sort sur une cible : elle a désavantage à son JS.</div>`:''}${roublardLvl>=13?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Escroc polyvalent (niv.13) — Action bonus : main de mage distrait une créature à 1,5m → avantage à tes attaques contre elle.</div>`:''}${roublardLvl>=17?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">Voleur de sort (niv.17) — Réaction contre un sort qui te cible : JS du lanceur ou tu voles le sort 8h.</div>`:''}`;}
    if(isCons){html+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Maître des tactiques (niv.3) — Action Aider en action bonus, portée 9m si la cible peut te voir ou t'entendre.</div>${roublardLvl>=9?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Manipulateur perspicace (niv.9) — 1 min d'interaction : comparer INT/SAG/CHA/niveau de classe avec la cible.</div>`:''}${roublardLvl>=13?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Redirection (niv.13) — Réaction : détourner une attaque te ciblant vers une créature à 1,5m qui t'offre un abri.</div>`:''}${roublardLvl>=17?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">Âme de trompeur (niv.17) — Pensées illisibles. La détection de mensonge indique la vérité si tu le souhaites.</div>`:''}`;}
    html+='</div>';return html;})():''}
  </div>`):''}
  ${!wsC?.active&&guerrierLvl>0?cs('cs-guerrier',`<div class="panel mb10"><div class="pt" style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span>⚔ Guerrier — Capacités</div>
    <div style="margin-bottom:${guerrierLvl>=2?'14':'0'}px">
      <div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:4px">💨 Second souffle</div>
      <div style="font-size:11px;color:var(--text3);margin-bottom:8px">${_featDesc('Guerrier','Second souffle')}</div>
      ${(()=>{const ssUsed=(p.combatCharges||{})['Second souffle']!==undefined?p.combatCharges['Second souffle']:1;return`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><div style="display:flex;gap:4px"><span class="slot-bubble${ssUsed>0?'':' used'}" onclick="useCombatCharge('Second souffle',1)"></span></div><button class="btn bsm" onclick="rollCustomDmg('1d10+${lvl}','Second souffle')">🎲 1d10+${lvl}</button><button class="btn bsm" onclick="recoverCombatCharge('Second souffle',1)">↺ Repos court</button></div>`;})()}
    </div>
    ${guerrierLvl>=2?(()=>{const saMax=guerrierLvl>=17?2:1;const saUsed=(p.combatCharges||{})['SursautAction']!==undefined?p.combatCharges['SursautAction']:saMax;return`<div style="margin-bottom:${guerrierLvl>=9?'14':'0'}px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:4px">⚡ Sursaut d'action${guerrierLvl>=17?' (×2)':''}</div><div style="font-size:11px;color:var(--text3);margin-bottom:8px">${_featDesc('Guerrier',"Sursaut d'action")}</div><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><div style="display:flex;gap:4px">${Array.from({length:saMax},(_,i)=>`<span class="slot-bubble${i<saUsed?'':' used'}" onclick="useCombatCharge('SursautAction',${saMax})"></span>`).join('')}</div><span style="font-size:10px;color:var(--text3)">${saUsed}/${saMax}</span><button class="btn bsm" onclick="recoverCombatCharge('SursautAction',${saMax})">↺ Repos court</button></div></div>`;})():''}
    ${guerrierLvl>=9?(()=>{const indMax=guerrierLvl>=17?3:(guerrierLvl>=13?2:1);const indUsed=(p.combatCharges||{})['Indomptable']!==undefined?p.combatCharges['Indomptable']:indMax;return`<div><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:4px">🔄 Indomptable${guerrierLvl>=13?` (×${indMax})`:''}</div><div style="font-size:11px;color:var(--text3);margin-bottom:8px">${_featDesc('Guerrier','Indomptable')}</div><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><div style="display:flex;gap:4px">${Array.from({length:indMax},(_,i)=>`<span class="slot-bubble${i<indUsed?'':' used'}" onclick="useCombatCharge('Indomptable',${indMax})"></span>`).join('')}</div><span style="font-size:10px;color:var(--text3)">${indUsed}/${indMax}</span><button class="btn bsm" onclick="recoverCombatCharge('Indomptable',${indMax})">↺ Repos long</button></div></div>`;})():''}
    ${combatStyle?`<div style="margin-top:8px;padding:6px 8px;background:var(--surface2);border-radius:6px;font-size:11px;color:var(--text2)">⚔ Style de combat : <strong>${combatStyle}</strong></div>`:''}
    ${isChampion&&guerrierLvl>=3?`<div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:6px">🏆 Champion</div><div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Critique amélioré (niv.3) — Coup critique sur 19-20</div>${guerrierLvl>=7?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Athlète accompli (niv.7) — ½ maîtrise aux jets FOR/DEX/CON sans maîtrise</div>`:''} ${guerrierLvl>=15?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Critique supérieur (niv.15) — Coup critique sur 18-20</div>`:''} ${guerrierLvl>=18?(()=>{const conM=p.abilities?Math.floor((p.abilities[2]-10)/2):0;return`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:rgba(76,175,80,.07);border:1px solid rgba(76,175,80,.2);border-radius:6px">Survivant (niv.18) — Si PV ≤ ½ max au début de ton tour : récupère <strong style="color:#4caf50">5+${conM}</strong> PV automatiquement</div>`;})():''}</div>`:''}
    ${isMdG&&guerrierLvl>=3?(()=>{const mdgDiceMax=guerrierLvl>=15?7:guerrierLvl>=10?6:guerrierLvl>=7?5:4;const mdgDie=guerrierLvl>=18?'d12':guerrierLvl>=10?'d10':'d8';const mdgManoevres=guerrierLvl>=15?9:guerrierLvl>=10?7:guerrierLvl>=7?5:3;const mdgUsed=(p.combatCharges||{})['DésSupériorité']!==undefined?p.combatCharges['DésSupériorité']:mdgDiceMax;return`<div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:6px">⚔ Maître de guerre</div><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap"><div class="sb hi" style="padding:4px 12px;flex-shrink:0"><div class="sn">Dé</div><div style="font-size:16px;font-weight:700;color:var(--cp)">${mdgDie}</div></div><div class="sb" style="padding:4px 12px;flex-shrink:0"><div class="sn">Manœuvres</div><div style="font-size:16px;font-weight:700;color:var(--cp)">${mdgManoevres}</div></div></div><div style="font-size:11px;color:var(--text3);margin-bottom:4px">Supériorité martiale (DD = ${8+pb(guerrierLvl)+Math.max(strM,dexM)}) :</div><div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px">${Array.from({length:mdgDiceMax},(_,i)=>`<span class="slot-bubble${i<mdgUsed?'':' used'}" onclick="useCombatCharge('DésSupériorité',${mdgDiceMax})"></span>`).join('')}</div><div style="font-size:10px;color:var(--text3);margin-bottom:6px">${mdgUsed}/${mdgDiceMax} • Repos court</div><div style="display:flex;gap:4px;flex-wrap:wrap"><button class="btn bsm" onclick="rollCustomDmg('1${mdgDie}','Dé de supériorité')">🎲 1${mdgDie}</button><button class="btn bsm" onclick="recoverCombatCharge('DésSupériorité',${mdgDiceMax})">↺ Repos court</button></div>${guerrierLvl>=7?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-top:6px">Observation de l'ennemi (niv.7) — 1 min à observer : savoir si une cible est inférieure/égale/supérieure en FOR</div>`:''} ${guerrierLvl>=15?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-top:4px">Implacable (niv.15) — Si à 0 dés au début de l'initiative, récupère 1 dé de supériorité</div>`:''}</div>`;})():''}
    ${isCO&&guerrierLvl>=3?`<div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:6px">🔮 Chevalier occulte</div><div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Sorts de magicien (INT), abjuration/évocation. Lien d'arme (niv.3) — action bonus : invoquer ou rappeler l'arme liée</div>${guerrierLvl>=7?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Magie de guerre (niv.7) — Quand tu lances un cantrip, tu peux effectuer 1 attaque en action bonus</div>`:''} ${guerrierLvl>=10?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Frappe occulte (niv.10) — Si tu touches une créature, elle a désavantage à son prochain JS contre un de tes sorts ce tour</div>`:''} ${guerrierLvl>=15?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Charge arcanique (niv.15) — Quand tu utilises Sursaut d'action, tu peux te téléporter jusqu'à 9m</div>`:''} ${guerrierLvl>=18?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">Magie de guerre améliorée (niv.18) — L'attaque bonus s'applique à n'importe quel sort, pas seulement les cantrieps</div>`:''}</div>`:''}
  </div>`):''}
  ${!wsC?.active&&paladinLvl>0?cs('cs-paladin',`<div class="panel mb10"><div class="pt" style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span>🛡 Paladin — Capacités</div>
    ${slots&&slots.length>0?(()=>{const maxSmite=Math.min(5,slots.length);return`<div style="margin-bottom:14px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:4px">⚡ Châtiment divin</div><div style="font-size:11px;color:var(--text3);margin-bottom:8px">Dépense un emplacement après avoir touché : +2d8 radiants au niv.1, +1d8/niveau supplémentaire (max 5d8). +1d8 bonus vs morts-vivants/fiélons.</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">${Array.from({length:maxSmite},(_,n)=>{const slotLvl=n+1;const remaining=Math.max(0,(slots[n]||0)-(slotsUsed[n]||0));const dice=Math.min(5,slotLvl+1);return`<button class="btn bsm${remaining<=0?' disabled':''}" ${remaining<=0?'disabled':''} onclick="rollChatimentDivin(${slotLvl})" style="${remaining<=0?'opacity:.4':''}">Niv.${slotLvl} — ${dice}d8 <span style="font-size:9px;color:var(--text3)">(${remaining} slot${remaining>1?'s':''})</span></button>`;}).join('')}</div><label style="font-size:11px;color:var(--text3);display:flex;align-items:center;gap:6px"><input type="checkbox" id="smiteCritCheck"> Coup critique (dés × 2)</label></div>`;})():''}
    ${paladinLvl>=3?(()=>{const cdUsed=(p.combatCharges||{})['Conduit divin']!==undefined?p.combatCharges['Conduit divin']:1;return`<div style="margin-bottom:14px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:4px">✝ Conduit divin</div><div style="font-size:11px;color:var(--text3);margin-bottom:8px">${_featDesc('Paladin','Conduit divin')}</div><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><div style="display:flex;gap:4px"><span class="slot-bubble${cdUsed>0?'':' used'}" onclick="useCombatCharge('Conduit divin',1)"></span></div><button class="btn bsm" onclick="recoverCombatCharge('Conduit divin',1)">↺ Repos court</button></div></div>`;})():''}
    <div style="margin-bottom:14px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:4px">🙏 Imposition des mains</div>
      <div style="font-size:11px;color:var(--text3);margin-bottom:8px">${_featDesc('Paladin','Imposition des mains')}</div>
      ${(()=>{const imMax=paladinLvl*5;const imCur=(p.combatCharges||{})['ImpositionMains']!==undefined?p.combatCharges['ImpositionMains']:imMax;const imPct=imMax>0?Math.round(imCur/imMax*100):0;return`<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text3);margin-bottom:4px"><span>Réservoir</span><span style="font-weight:700;color:${imCur<=0?'#e53935':'var(--cp)'}">${imCur} / ${imMax} PV</span></div><div style="height:8px;background:var(--surface2);border-radius:4px;overflow:hidden;margin-bottom:10px"><div style="height:100%;width:${imPct}%;background:var(--cp);border-radius:4px"></div></div><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn bsm" onclick="_spendImpositionMains(1)" ${imCur<1?'disabled':''}>−1 PV</button><button class="btn bsm" onclick="_spendImpositionMains(5)" ${imCur<5?'disabled':''}>−5 PV</button><button class="btn bsm" onclick="_spendImpositionMains(10)" ${imCur<10?'disabled':''}>−10 PV</button><button class="btn bsm" onclick="_restoreImpositionMains()">↺ Repos long</button></div>`;})()}
    </div>
    ${paladinLvl>=6?`<div style="margin-bottom:${paladinLvl>=10?'14':'0'}px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:4px">🛡 Aura de protection</div><div style="font-size:11px;color:var(--text3)">${_featDesc('Paladin','Aura de protection')}</div><div style="font-size:13px;font-weight:700;color:var(--cp);margin-top:6px">+${Math.max(1,chaM)} à tous les JS des alliés proches</div></div>`:''}
    ${paladinLvl>=10?`<div style="margin-bottom:${paladinLvl>=20?'14':'0'}px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:4px">💛 Aura de courage</div><div style="font-size:11px;color:var(--text3)">${_featDesc('Paladin','Aura de courage')}</div></div>`:''}
    ${paladinLvl>=20?(()=>{const fsUsed=(p.combatCharges||{})['FormeSacree']!==undefined?p.combatCharges['FormeSacree']:1;return`<div><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:4px">👼 Forme sacrée</div><div style="font-size:11px;color:var(--text3);margin-bottom:8px">${_featDesc('Paladin','Forme sacrée')}</div><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><span class="slot-bubble${fsUsed>0?'':' used'}" onclick="useCombatCharge('FormeSacree',1)"></span><button class="btn bsm" onclick="recoverCombatCharge('FormeSacree',1)">↺ Repos long</button></div></div>`;})():''}
    ${(()=>{const sdMax=Math.max(1,1+chaM);const sdCur=(p.combatCharges||{})['SensDivin']!==undefined?p.combatCharges['SensDivin']:sdMax;return`<div style="margin-top:10px;border-top:1px solid var(--border);padding-top:10px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:4px">👁 Sens divin</div><div style="font-size:11px;color:var(--text3);margin-bottom:6px">Action bonus : détecter célestes/fiélons/morts-vivants à 18m pendant 1 tour. ${sdMax}/repos long.</div><div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap"><div style="display:flex;gap:4px">${Array.from({length:sdMax},(_,i)=>`<span class="slot-bubble${i<sdCur?'':' used'}" onclick="useCombatCharge('SensDivin',${sdMax})"></span>`).join('')}</div><span style="font-size:10px;color:var(--text3)">${sdCur}/${sdMax}</span><button class="btn bsm" onclick="recoverCombatCharge('SensDivin',${sdMax})">↺ Repos long</button></div></div>`;})()}
    ${paladinLvl>=3?`<div style="margin-top:6px;padding:5px 8px;background:var(--surface2);border-radius:6px;font-size:11px;color:var(--text2)">🏥 Santé divine (niv.3) — Immunité aux maladies</div>`:''}
    ${paladinLvl>=14?(()=>{const cpMax=Math.max(1,chaM);const cpCur=(p.combatCharges||{})['ContactPurifiant']!==undefined?p.combatCharges['ContactPurifiant']:cpMax;return`<div style="margin-top:6px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:4px">✋ Contact purifiant (niv.14)</div><div style="font-size:11px;color:var(--text3);margin-bottom:6px">Action : toucher une créature → mettre fin à 1 sort. ${cpMax}/repos long.</div><div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap"><div style="display:flex;gap:4px">${Array.from({length:cpMax},(_,i)=>`<span class="slot-bubble${i<cpCur?'':' used'}" onclick="useCombatCharge('ContactPurifiant',${cpMax})"></span>`).join('')}</div><span style="font-size:10px;color:var(--text3)">${cpCur}/${cpMax}</span><button class="btn bsm" onclick="recoverCombatCharge('ContactPurifiant',${cpMax})">↺ Repos long</button></div></div>`;})():''}
    ${paladinLvl>=18?`<div style="margin-top:6px;padding:5px 8px;background:var(--surface2);border-radius:6px;font-size:11px;color:var(--text2)">📡 Amélioration des auras (niv.18) — Rayon des auras : 3m → 9m</div>`:''}
    ${isDevot&&paladinLvl>=3?`<div style="margin-top:10px;border-top:1px solid var(--border);padding-top:10px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:6px">⚔ Serment de dévotion</div><div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Conduit : Arme sacrée (action : +CHA aux attaques, lumière 1 min) / Renvoi des impies (JS SAG DD ${8+pb(paladinLvl)+chaM} ou morts-vivants/fiélons renvoyés)</div>${paladinLvl>=7?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Aura de dévotion (niv.7) — Immunité aux charmes pour toi et tes alliés dans l'aura</div>`:''} ${paladinLvl>=15?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Pureté de l'esprit (niv.15) — Sous les effets permanents de Protection contre le mal et le bien</div>`:''} ${paladinLvl>=20?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">Nimbe sacré (niv.20) — Lumière 9m, 10 radiants/début tour ennemi, avantage JS vs fiélons/morts-vivants</div>`:''}</div>`:''}
    ${isAnciens&&paladinLvl>=3?(()=>{const siUsed=!!((p.combatCharges||{})['SentinelleImmortelleUsed']);return`<div style="margin-top:10px;border-top:1px solid var(--border);padding-top:10px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:6px">🌿 Serment des anciens</div><div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Conduit : Courroux de la nature (vignes : Entravé, JS FOR/DEX) / Renvoi des infidèles (fées/fiélons : renvoyés)</div>${paladinLvl>=7?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Aura de garde (niv.7) — Toi et alliés dans l'aura : résistance aux dégâts des sorts</div>`:''} ${paladinLvl>=15?`<div style="padding:5px 8px;background:${siUsed?'rgba(200,168,75,.1)':'var(--surface2)'};border:1px solid ${siUsed?'var(--cp)':'var(--border)'};border-radius:6px;margin-bottom:4px"><div style="font-size:11px;font-weight:600">Sentinelle immortelle (niv.15) — 1/repos long</div><div style="font-size:10px;color:var(--text3);margin:2px 0">Si tu tombes à 0 PV, tu restes à 1 PV à la place</div><div style="display:flex;gap:4px;margin-top:4px"><span class="slot-bubble${siUsed?' used':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['SentinelleImmortelleUsed']=!p.combatCharges['SentinelleImmortelleUsed'];saveAll();render();})()"></span><button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};delete p.combatCharges['SentinelleImmortelleUsed'];saveAll();render();})()">↺ Repos long</button></div></div>`:''} ${paladinLvl>=20?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">Champion antique (niv.20) — 1 min : soins 10 PV/tour, sorts en action bonus, désavantage JS ennemis à 3m</div>`:''}</div>`;})():''}
    ${isVengeance&&paladinLvl>=3?(()=>{const voeuUsed=!!((p.combatCharges||{})['VoeuHostiliteUsed']);return`<div style="margin-top:10px;border-top:1px solid var(--border);padding-top:10px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:6px">🗡 Serment de vengeance</div><div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Conduit : Conspuer l'ennemi (JS SAG DD ${8+pb(paladinLvl)+chaM} : effrayé ou vitesse ÷2) / Vœu d'hostilité (action bonus : avantage vs 1 cible 1 min)</div>${paladinLvl>=7?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Vengeur implacable (niv.7) — Attaque d'opportunité réussie → déplacement ½ vitesse en réaction</div>`:''} ${paladinLvl>=15?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Âme vengeresse (niv.15) — Réaction : attaquer la cible du Vœu quand elle attaque une autre créature</div>`:''} ${paladinLvl>=20?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">Ange de la vengeance (niv.20) — 1h : vol 18m, aura peur 9m, avantage vs créatures effrayées</div>`:''}</div>`;})():''}
  </div>`):''}
  ${!wsC?.active&&clercLvl>0?cs('cs-clerc',`<div class="panel mb10"><div class="pt" style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span>✝ Clerc — Capacités</div>
    <div style="font-size:11px;color:var(--text3);margin-bottom:10px">DD sorts : <strong style="color:var(--cp)">${8+pb(clercLvl)+sagM}</strong> · Bonus attaque sort : <strong>+${pb(clercLvl)+sagM}</strong></div>
    ${clercLvl>=2?(()=>{const cdMax=clercLvl>=18?3:clercLvl>=6?2:1;const cdUsed=(p.combatCharges||{})['Conduit divin']!==undefined?p.combatCharges['Conduit divin']:cdMax;return`<div style="margin-bottom:14px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:4px">✝ Conduit divin</div><div style="font-size:11px;color:var(--text3);margin-bottom:8px">${_featDesc('Clerc','Conduit divin')}</div><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><div style="display:flex;gap:4px">${Array.from({length:cdMax},(_,i)=>`<span class="slot-bubble${i<cdUsed?'':' used'}" onclick="useCombatCharge('Conduit divin',${cdMax})"></span>`).join('')}</div><span style="font-size:10px;color:var(--text3)">${cdUsed}/${cdMax} • Repos court</span><button class="btn bsm" onclick="recoverCombatCharge('Conduit divin',${cdMax})">↺ Repos court</button></div></div>`;})():''}
    ${clercLvl>=5?`<div style="margin-bottom:8px;padding:5px 8px;background:var(--surface2);border-radius:6px;font-size:11px;color:var(--text2)">💀 Destruction des morts-vivants (niv.5) — Conduit divin : morts-vivants de FP ≤ <strong>${clercLvl>=17?4:clercLvl>=14?3:clercLvl>=11?2:clercLvl>=8?1:'1/2'}</strong> détruits automatiquement</div>`:''}
    ${clercLvl>=10?(()=>{const idUsed=(p.combatCharges||{})['Intervention divine']!==undefined?p.combatCharges['Intervention divine']:1;return`<div><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:4px">🙏 Intervention divine</div><div style="font-size:11px;color:var(--text3);margin-bottom:8px">${_featDesc('Clerc','Intervention divine')}</div><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><span class="slot-bubble${idUsed>0?'':' used'}" onclick="useCombatCharge('Intervention divine',1)"></span><button class="btn bsm" onclick="recoverCombatCharge('Intervention divine',1)">↺ Repos long</button></div></div>`;})():''}
    ${clercPath?(()=>{let dhtml='<div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:6px">✝ '+clercPath.name+'</div>';const dn=clercPath.name;if(dn==='Domaine de la vie'){dhtml+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">💚 Disciple de la vie (niv.1) — Sorts de soin : +2+niveau_du_sort PV supplémentaires</div>`;if(clercLvl>=6)dhtml+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">🌟 Guérisseur béni (niv.6) — Soigner un allié → tu récupères 2+niveau_du_sort PV</div>`;if(clercLvl>=8)dhtml+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">⚡ Frappe divine (niv.8) — +${clercLvl>=14?'2d8':'1d8'} radiants aux attaques d'arme 1×/tour</div>`;if(clercLvl>=17)dhtml+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">✨ Guérison suprême (niv.17) — Sorts de soin : remplace chaque dé par son maximum</div>`;}if(dn==='Domaine de la lumière'){const ipMax=Math.max(1,sagM);const ipCur=(p.combatCharges||{})['IlluminationProtectrice']!==undefined?p.combatCharges['IlluminationProtectrice']:ipMax;dhtml+=`<div style="margin-bottom:8px"><div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:4px">🔆 Illumination protectrice (niv.1) — Réaction : désavantage à une attaque vs toi/allié. ${ipMax}/repos long.</div><div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap"><div style="display:flex;gap:4px">${Array.from({length:ipMax},(_,i)=>`<span class="slot-bubble${i<ipCur?'':' used'}" onclick="useCombatCharge('IlluminationProtectrice',${ipMax})"></span>`).join('')}</div><span style="font-size:10px;color:var(--text3)">${ipCur}/${ipMax}</span><button class="btn bsm" onclick="recoverCombatCharge('IlluminationProtectrice',${ipMax})">↺ Repos long</button></div></div>`;if(clercLvl>=6)dhtml+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">✨ Illumination améliorée (niv.6) — Lumière du jour 18m · lumière magique à volonté</div>`;if(clercLvl>=8)dhtml+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">⚡ Incantation puissante (niv.8) — +${sagM} aux dégâts des sorts de clerc</div>`;if(clercLvl>=17)dhtml+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">☀ Halo de lumière (niv.17) — Ennemis à 9m : désavantage aux jets d'attaque</div>`;}if(dn==='Domaine de la nature'){if(clercLvl>=2)dhtml+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">🌿 Charme des animaux et plantes (niv.2) — Conduit divin : charmés (JS SAG DD ${8+pb(clercLvl)+sagM})</div>`;if(clercLvl>=6)dhtml+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">🛡 Atténuation des éléments (niv.6) — Résistance froid, feu et foudre</div>`;if(clercLvl>=8)dhtml+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">⚡ Frappe divine (niv.8) — +${clercLvl>=14?'2d8':'1d8'} froid/feu/foudre aux attaques d'arme 1×/tour</div>`;if(clercLvl>=17)dhtml+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">🌳 Maître de la nature (niv.17) — Commander animaux/plantes charmés (action bonus)</div>`;}if(dn==='Domaine de la tempête'){const foMax=Math.max(1,sagM);const foCur=(p.combatCharges||{})['FureurOuragan']!==undefined?p.combatCharges['FureurOuragan']:foMax;dhtml+=`<div style="margin-bottom:8px"><div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:4px">⚡ Fureur de l'ouragan (niv.1) — Réaction après touché : repousser 3m (JS FOR/DEX DD ${8+pb(clercLvl)+sagM}). ${foMax}/repos long.</div><div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap"><div style="display:flex;gap:4px">${Array.from({length:foMax},(_,i)=>`<span class="slot-bubble${i<foCur?'':' used'}" onclick="useCombatCharge('FureurOuragan',${foMax})"></span>`).join('')}</div><span style="font-size:10px;color:var(--text3)">${foCur}/${foMax}</span><button class="btn bsm" onclick="recoverCombatCharge('FureurOuragan',${foMax})">↺ Repos long</button></div></div>`;if(clercLvl>=6)dhtml+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">🌩 Frappe de l'éclair (niv.6) — Conduit divin : éclairs 18m (2d8 foudre, sans JS)</div>`;if(clercLvl>=8)dhtml+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">⚡ Frappe divine (niv.8) — +${clercLvl>=14?'2d8':'1d8'} tonnerre aux attaques d'arme 1×/tour</div>`;if(clercLvl>=17)dhtml+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">🌪 Enfant de la tempête (niv.17) — Vol 18m · Résistance foudre/tonnerre · Immunité tempête</div>`;}if(dn==='Domaine de la tromperie'){dhtml+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">🎭 Bénédiction de l'escroc (niv.1) — Conduit divin : désavantage aux attaques d'une créature ou avantage aux attaques d'un allié</div>`;if(clercLvl>=8)dhtml+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">⚡ Frappe divine (niv.8) — +${clercLvl>=14?'2d8':'1d8'} poison aux attaques d'arme 1×/tour</div>`;if(clercLvl>=17)dhtml+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">🔮 Réplique améliorée (niv.17) — Double de toi-même qui peut lancer des sorts à ta place</div>`;}if(dn==='Domaine de la guerre'){const pgMax=Math.max(1,sagM);const pgCur=(p.combatCharges||{})['PretreGuerre']!==undefined?p.combatCharges['PretreGuerre']:pgMax;dhtml+=`<div style="margin-bottom:8px"><div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:4px">⚔ Prêtre de guerre (niv.1) — Action bonus : +${pb(clercLvl)} à un jet d'attaque. ${pgMax}/repos long.</div><div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap"><div style="display:flex;gap:4px">${Array.from({length:pgMax},(_,i)=>`<span class="slot-bubble${i<pgCur?'':' used'}" onclick="useCombatCharge('PretreGuerre',${pgMax})"></span>`).join('')}</div><span style="font-size:10px;color:var(--text3)">${pgCur}/${pgMax}</span><button class="btn bsm" onclick="recoverCombatCharge('PretreGuerre',${pgMax})">↺ Repos long</button></div></div>`;if(clercLvl>=6)dhtml+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">⚔ Bénédiction du dieu de la guerre (niv.6) — Conduit divin : accorder action bonus d'attaque à un allié</div>`;if(clercLvl>=8)dhtml+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">⚡ Frappe divine (niv.8) — +${clercLvl>=14?'2d8':'1d8'} du type de l'arme 1×/tour</div>`;if(clercLvl>=17)dhtml+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">👑 Avatar de bataille (niv.17) — Résistance dégâts non magiques · 3 attaques au total</div>`;}if(dn==='Domaine du savoir'){dhtml+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">📚 Bénédictions du savoir (niv.1) — Maîtrise de 2 compétences : Histoire, Nature, Arcanes, Religion</div>`;if(clercLvl>=6)dhtml+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">🧠 Lecture des pensées (niv.6) — Conduit divin : lire pensées (JS SAG DD ${8+pb(clercLvl)+sagM}) et contraindre</div>`;if(clercLvl>=8)dhtml+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">⚡ Incantation puissante (niv.8) — +${sagM} aux dégâts des sorts de clerc</div>`;if(clercLvl>=17){const vpUsed=!!((p.combatCharges||{})['VisionsPasse']);dhtml+=`<div style="padding:6px 8px;background:${vpUsed?'rgba(200,168,75,.1)':'var(--surface2)'};border:1px solid ${vpUsed?'var(--cp)':'var(--border)'};border-radius:6px"><div style="font-size:11px;font-weight:600">🔮 Visions du passé (niv.17) — 1×/repos court</div><div style="font-size:10px;color:var(--text3);margin:2px 0">Méditation 1 min : visions liées à un objet ou un lieu</div><div style="display:flex;gap:4px;margin-top:4px"><span class="slot-bubble${vpUsed?' used':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['VisionsPasse']=!p.combatCharges['VisionsPasse'];saveAll();render();})()"></span><button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};delete p.combatCharges['VisionsPasse'];saveAll();render();})()">↺ Repos court</button></div></div>`;}}if(dn==='Domaine de la forge'){dhtml+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">🔨 Bénédiction de la forge (niv.1) — Repos long : rendre une armure ou arme non magique +1</div>`;if(clercLvl>=6)dhtml+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">🛡 Âme de la forge (niv.6) — +1 CA avec armure · Résistance feu · Immunité chaleur extrême</div>`;if(clercLvl>=8)dhtml+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">⚡ Frappe divine (niv.8) — +${clercLvl>=14?'2d8':'1d8'} feu aux attaques d'arme 1×/tour</div>`;if(clercLvl>=17)dhtml+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">🏰 Saint de la forge (niv.17) — Immunité feu · Résistance dégâts non magiques</div>`;}dhtml+='</div>';return dhtml;})():''}
  </div>`):''}
  ${!wsC?.active&&artLvl>0?cs('cs-artificier',`<div class="panel mb10"><div class="pt" style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span>⚙ Artificier — Capacités</div>
    <div style="font-size:11px;color:var(--text3);margin-bottom:10px">DD sorts : <strong style="color:var(--cp)">${8+pb(artLvl)+intM}</strong> · Bonus attaque sort : <strong>+${pb(artLvl)+intM}</strong> · Demi-lanceur (niv. eff. ${Math.floor(artLvl/2)})</div>
    ${artLvl>=2?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">🔧 Imprégnation d'objet (niv.2) — ${artLvl>=18?6:artLvl>=14?5:artLvl>=10?4:artLvl>=6?3:2} objets magiques max simultanément</div>`:''}
    ${artLvl>=7?(()=>{const egMax=Math.max(1,intM);const egCur=(p.combatCharges||{})['EclairGenie']!==undefined?p.combatCharges['EclairGenie']:egMax;return`<div style="margin-bottom:8px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:4px">💡 Éclair de génie (niv.7)</div><div style="font-size:11px;color:var(--text3);margin-bottom:6px">Réaction : ajouter 1d6 à un jet d'attaque, dégâts ou compétence d'un allié à 9m. ${egMax}/repos long.</div><div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap"><div style="display:flex;gap:4px">${Array.from({length:egMax},(_,i)=>`<span class="slot-bubble${i<egCur?'':' used'}" onclick="useCombatCharge('EclairGenie',${egMax})"></span>`).join('')}</div><span style="font-size:10px;color:var(--text3)">${egCur}/${egMax}</span><button class="btn bsm" onclick="recoverCombatCharge('EclairGenie',${egMax})">↺ Repos long</button></div></div>`;})():''}
    ${artLvl>=10?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">✨ Expert en objets magiques (niv.10) — Attunement de 4 objets max (au lieu de 3)</div>`:''}
    ${artLvl>=11?(()=>{const ossMax=Math.max(2,2*intM);const ossCur=(p.combatCharges||{})['ObjetStockeSort']!==undefined?p.combatCharges['ObjetStockeSort']:ossMax;return`<div style="margin-bottom:8px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:4px">📦 Objet stocke-sort (niv.11)</div><div style="font-size:11px;color:var(--text3);margin-bottom:6px">Sort niv.1-2 stocké dans un objet (${ossMax} charges). Un allié peut l'utiliser. Repos long.</div><div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap"><div style="display:flex;gap:4px">${Array.from({length:ossMax},(_,i)=>`<span class="slot-bubble${i<ossCur?'':' used'}" onclick="useCombatCharge('ObjetStockeSort',${ossMax})"></span>`).join('')}</div><span style="font-size:10px;color:var(--text3)">${ossCur}/${ossMax}</span><button class="btn bsm" onclick="recoverCombatCharge('ObjetStockeSort',${ossMax})">↺ Repos long</button></div></div>`;})():''}
    ${artLvl>=14?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">🏆 Savant en objets magiques (niv.14) — Attunement de 5 objets max</div>`:''}
    ${artLvl>=20?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">💎 Âme d'artifice (niv.20) — +1 à tous les jets de sauvegarde · Résistances magiques</div>`:''}
    ${artPath?(()=>{let shtml='<div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:6px">⚙ '+artPath.name+'</div>';if(isAlchi){const elixMax=artLvl>=15?3:artLvl>=9?2:1;const elixCur=(p.combatCharges||{})['ElixirExp']!==undefined?p.combatCharges['ElixirExp']:elixMax;shtml+=`<div style="margin-bottom:8px"><div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:4px">⚗ Élixir expérimental — ${elixMax}/repos long</div><div style="font-size:10px;color:var(--text3);margin-bottom:4px">Guérison · Vitesse · Résilience · Bravoure · Vol · Transformation</div><div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap"><div style="display:flex;gap:4px">${Array.from({length:elixMax},(_,i)=>`<span class="slot-bubble${i<elixCur?'':' used'}" onclick="useCombatCharge('ElixirExp',${elixMax})"></span>`).join('')}</div><span style="font-size:10px;color:var(--text3)">${elixCur}/${elixMax}</span><button class="btn bsm" onclick="recoverCombatCharge('ElixirExp',${elixMax})">↺ Repos long</button></div></div>`;if(artLvl>=5)shtml+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">🧪 Érudit alchimique (niv.5) — +${intM} aux dégâts sorts acide/poison · Sorts de domaine gratuits</div>`;if(artLvl>=9){const irMax=Math.max(1,intM);const irCur=(p.combatCharges||{})['IngredientsRevigo']!==undefined?p.combatCharges['IngredientsRevigo']:irMax;shtml+=`<div style="margin-bottom:8px"><div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:4px">💊 Ingrédients revigorants (niv.9) — Potion de soin (2d4+2) ou antitoxine. ${irMax}/repos long.</div><div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap"><div style="display:flex;gap:4px">${Array.from({length:irMax},(_,i)=>`<span class="slot-bubble${i<irCur?'':' used'}" onclick="useCombatCharge('IngredientsRevigo',${irMax})"></span>`).join('')}</div><span style="font-size:10px;color:var(--text3)">${irCur}/${irMax}</span><button class="btn bsm" onclick="recoverCombatCharge('IngredientsRevigo',${irMax})">↺ Repos long</button></div></div>`;}if(artLvl>=15){const mc1Used=!!((p.combatCharges||{})['MaitriseChim1']);const mc2Used=!!((p.combatCharges||{})['MaitriseChim2']);shtml+=`<div style="margin-bottom:6px"><div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:4px">⚗ Maîtrise chimique (niv.15) — 2 effets/repos long</div><div style="display:flex;gap:8px;align-items:center"><span class="slot-bubble${mc1Used?' used':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['MaitriseChim1']=!p.combatCharges['MaitriseChim1'];saveAll();render();})()"></span><span style="font-size:10px;color:var(--text3)">Effet 1</span><span class="slot-bubble${mc2Used?' used':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['MaitriseChim2']=!p.combatCharges['MaitriseChim2'];saveAll();render();})()"></span><span style="font-size:10px;color:var(--text3)">Effet 2</span><button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};delete p.combatCharges['MaitriseChim1'];delete p.combatCharges['MaitriseChim2'];saveAll();render();})()">↺ Repos long</button></div></div>`;}}if(isArtil){const coUsed=!!((p.combatCharges||{})['CanonOcculteUsed']);shtml+=`<div style="padding:6px 8px;background:${coUsed?'rgba(200,168,75,.1)':'var(--surface2)'};border:1px solid ${coUsed?'var(--cp)':'var(--border)'};border-radius:6px;margin-bottom:6px"><div style="font-size:11px;font-weight:600">💣 Canon occulte — PV ${5*artLvl} · DD ${8+pb(artLvl)+intM}</div><div style="font-size:10px;color:var(--text3);margin:2px 0">Protecteur (soin 1d8+${intM}) · Rayon (1d8+${intM} force) · Tonnerre (2d8+${intM}, zone)</div><div style="margin-top:4px"><button class="btn bsm" style="${coUsed?'color:var(--cp)':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['CanonOcculteUsed']=!p.combatCharges['CanonOcculteUsed'];saveAll();render();})()">${coUsed?'✓ Actif':'⚙ Invoquer'}</button></div></div>`;if(artLvl>=5)shtml+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">🔫 Arme à feu arcanique (niv.5) — +1d8 aux dégâts des sorts lancés via une arme à feu</div>`;if(artLvl>=9)shtml+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">💥 Canon explosif (niv.9) — +1d8 aux dégâts · Détonation area JS DEX DD ${8+pb(artLvl)+intM}</div>`;if(artLvl>=15)shtml+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">🏰 Position fortifiée (niv.15) — 2 canons simultanément · +2 CA alliés dans la zone</div>`;}if(isFdB){shtml+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">⚔ Apte au combat (niv.3) — Utiliser INT pour les jets d'attaque avec les armes</div>`;shtml+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">🤖 Défenseur d'acier (niv.3) — Compagnon mécanique · PV ${2+intM+5*artLvl} · CA 17</div>`;if(artLvl>=5)shtml+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">⚔ Attaque supplémentaire (niv.5) — 2 attaques par action d'Attaque</div>`;if(artLvl>=9){const daMax=Math.max(1,intM);const daCur=(p.combatCharges||{})['DechargeArcanique']!==undefined?p.combatCharges['DechargeArcanique']:daMax;shtml+=`<div style="margin-bottom:8px"><div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:4px">⚡ Décharge arcanique (niv.9) — Lancer un sort via le défenseur. ${daMax}/repos long.</div><div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap"><div style="display:flex;gap:4px">${Array.from({length:daMax},(_,i)=>`<span class="slot-bubble${i<daCur?'':' used'}" onclick="useCombatCharge('DechargeArcanique',${daMax})"></span>`).join('')}</div><span style="font-size:10px;color:var(--text3)">${daCur}/${daMax}</span><button class="btn bsm" onclick="recoverCombatCharge('DechargeArcanique',${daMax})">↺ Repos long</button></div></div>`;}if(artLvl>=15)shtml+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">🔱 Défenseur amélioré (niv.15) — Défenseur : +4d6 force sur une attaque par tour</div>`;}shtml+='</div>';return shtml;})():''}
  </div>`):''}`
  ${druLvl>=2?cs('cs-druide',(()=>{const crMax=druLvl>=6?String(Math.floor(druLvl/3)):isLune?'1':druLvl>=4?'1/2':'1/4';const canFly=druLvl>=8;const canSwim=druLvl>=4;const fsMax=druLvl>=20?99:2;const fsUsed=druLvl>=20?fsMax:(p.combatCharges||{})['Forme sauvage']!==undefined?p.combatCharges['Forme sauvage']:2;const feMax=2;const feUsed=(p.combatCharges||{})['FormeElementaire']!==undefined?p.combatCharges['FormeElementaire']:feMax;
    if(wsC?.active){const bHpPct=Math.min(100,Math.round(wsC.beast.hpCur/Math.max(1,wsC.beast.hpMax)*100));const availSlots=[1,2,3,4,5].filter(n=>(slots[n-1]||0)-(slotsUsed[n-1]||0)>0);return`<div class="panel mb10" style="border-color:rgba(76,175,80,.5);background:rgba(76,175,80,.04)"><div class="pt" style="display:flex;align-items:center;justify-content:space-between"><div style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span><span style="color:#4caf50">${wsC.beast.icon} En forme de ${esc(wsC.beast.name)}</span></div><span style="font-size:10px;color:#4caf50;border:1px solid rgba(76,175,80,.4);border-radius:10px;padding:2px 8px">🐺 Actif</span></div><div style="margin:10px 0"><div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text3);margin-bottom:4px"><span>PV bête</span><span style="color:#4caf50;font-weight:700">${wsC.beast.hpCur} / ${wsC.beast.hpMax}</span></div><div class="hp-bar"><div class="hp-fill" style="width:${bHpPct}%;background:#4caf50"></div></div></div><div style="display:flex;gap:8px;margin-bottom:8px;font-size:11px;color:var(--text3)"><span>CA ${wsC.beast.ac}</span><span>•</span><span>${wsC.beast.speed}</span><span>•</span><span>Charges : <strong style="color:var(--cp)">${druLvl>=20?'∞':fsUsed+'/'+fsMax}</strong></span></div>${isLune&&druLvl>=6?`<div style="font-size:11px;color:#4caf50;margin-bottom:8px">✨ Frappe primitive — Attaques en forme animale : magiques</div>`:''}${isLune&&availSlots.length?`<div style="margin-bottom:8px"><div style="font-size:11px;color:var(--text3);margin-bottom:4px">🌙 Guérison via emplacement (1d8/niveau) :</div><div style="display:flex;gap:4px;flex-wrap:wrap">${availSlots.map(n=>`<button class="btn bsm" onclick="(()=>{const p=P();if(!p.wildshape?.active)return;let h=0;for(let i=0;i<${n};i++)h+=Math.floor(Math.random()*8)+1;p.wildshape.beast.hpCur=Math.min(p.wildshape.beast.hpMax,p.wildshape.beast.hpCur+h);if(!p.spellSlotsUsed)p.spellSlotsUsed=[];p.spellSlotsUsed[${n-1}]=(p.spellSlotsUsed[${n-1}]||0)+1;saveAll();render();showToast('💚 +'+h+' PV (${n}d8)');})()">Niv.${n} (${n}d8)</button>`).join('')}</div></div>`:''}<button class="btn bsm" style="width:100%;border-color:rgba(76,175,80,.4);color:#4caf50" onclick="revertWildshape()">↩ Abandonner la forme</button></div>`;}
    return`<div class="panel mb10"><div class="pt" style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span>🐺 Druide — Forme sauvage</div><div style="font-size:11px;color:var(--text3);margin-bottom:10px">${_featDesc('Druide','Forme sauvage')}</div><div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px;margin-bottom:10px"><div class="sb hi"><div class="sn">CR max</div><div style="font-size:18px;font-weight:700;color:var(--cp)">${crMax}</div></div><div class="sb"><div class="sn">Nage</div><div style="font-size:14px;font-weight:600;color:${canSwim?'#4caf50':'var(--text3)'}">${canSwim?'✓':'✗'}</div></div><div class="sb"><div class="sn">Vol</div><div style="font-size:14px;font-weight:600;color:${canFly?'#4caf50':'var(--text3)'}">${canFly?'✓':'✗'}</div></div><div class="sb"><div class="sn">Durée max</div><div style="font-size:12px;font-weight:700;color:var(--cp)">${Math.floor(druLvl/2)}h</div></div></div><div style="font-size:11px;color:var(--text3);margin-bottom:8px">Action : <strong>${isLune?'Action bonus':'Action'}</strong></div>${druLvl>=20?'<div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:8px">✓ Archidruide — Utilisations illimitées</div>':`<div style="display:flex;gap:4px;margin-bottom:6px">${Array.from({length:2},(_,i)=>`<span class="slot-bubble${i<fsUsed?'':' used'}" onclick="useCombatCharge('Forme sauvage',2)"></span>`).join('')}</div><div style="font-size:10px;color:var(--text3);margin-bottom:6px">${fsUsed}/2 • Repos court</div><button class="btn bsm" style="margin-bottom:8px" onclick="recoverCombatCharge('Forme sauvage',2)">↺ Repos court</button>`}<button class="btn bac bsm" style="width:100%;background:rgba(76,175,80,.1);border-color:#4caf50;color:#4caf50" onclick="openWildshapeModal()">🐺 Entrer en Forme sauvage</button>${isLune?`<div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:6px">🌙 Cercle de la lune</div>${druLvl>=6?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">✨ Frappe primitive (niv.6) — Tes attaques en forme animale sont considérées comme magiques et ignorent les résistances aux dégâts non magiques.</div>`:''} ${druLvl>=10?(()=>{return`<div style="margin-bottom:8px"><div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:4px">🌊 Forme élémentaire (niv.10) — Élémentaire air/eau/terre/feu</div><div style="display:flex;align-items:center;gap:8px"><div style="display:flex;gap:4px">${Array.from({length:feMax},(_,fi)=>`<span class="slot-bubble${fi<feUsed?'':' used'}" onclick="useCombatCharge('FormeElementaire',${feMax})"></span>`).join('')}</div><span style="font-size:10px;color:var(--text3)">${feUsed}/${feMax} • Repos long</span><button class="btn bsm" onclick="recoverCombatCharge('FormeElementaire',${feMax})">↺ Repos long</button></div><button class="btn bac bsm" style="margin-top:6px;width:100%;background:rgba(41,182,246,.1);border-color:#29b6f6;color:#29b6f6" onclick="openElementalModal()">🌊 Entrer en Forme élémentaire</button></div>`;})():''}${druLvl>=14?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">✨ Mille formes (niv.14) — Modifier son apparence à volonté (comme Modification d'apparence)</div>`:''}</div>`:''}${isTerres?`<div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:6px">🗺 Cercle des terres</div><div style="font-size:11px;color:var(--text2);padding:6px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">🌿 Récupération naturelle — Repos court : récupère emplacements (total ≤ ${Math.ceil(druLvl/2)}, max niv.5). 1×/repos long.</div>${druLvl>=6?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">🚶 Foulée tellurique (niv.6) — Terrains difficiles non magiques sans coût de déplacement supplémentaire</div>`:''} ${druLvl>=10?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">🛡 Protégée de dame Nature (niv.10) — Immunité charme/peur (élémentaires/fées), immunité poison et maladie</div>`:''} ${druLvl>=14?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">🌳 Sanctuaire de dame Nature (niv.14) — Bêtes et plantes : JS SAG ou choisir une autre cible</div>`:''}</div>`:''}</div>`;})()):''}
  ${(()=>{if(wsC?.active)return'';const sorcLvl=((p.classes||[]).find(c=>c.name==='Ensorceleur')||{}).level||0;if(!sorcLvl)return'';const sorcPath=(p.features||[]).find(f=>['Origine draconique','Magie sauvage'].includes(f.name));const isSorcDraconique=sorcPath?.name==='Origine draconique';const isSorcSauvage=sorcPath?.name==='Magie sauvage';const sorcPtsMax=sorcLvl;const sorcPts=(p.combatCharges||{})['SorcelleriePts']!==undefined?p.combatCharges['SorcelleriePts']:sorcPtsMax;const sorcBubbles=Array.from({length:sorcPtsMax},(_,sp)=>`<span class="slot-bubble${sp<sorcPts?'':' used'}" onclick="toggleSorcPts(${sp},${sorcPtsMax})"></span>`).join('');const flexButtons=[[1,2],[2,3],[3,5],[4,6],[5,7]].map(([niv,cout])=>`<button class="btn bsm" onclick="sorcCreateSlot(${niv},${cout},${sorcPtsMax})" ${sorcPts<cout?'disabled':''}>Niv.${niv} (${cout} pts)</button>`).join('');return cs('cs-sorc',`<div class="panel mb10"><div class="pt" style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span>✨ Points de sorcellerie — Ensorceleur</div>
        <div style="font-size:11px;color:var(--text3);margin-bottom:10px">${_featDesc('Ensorceleur','Points de sorcellerie')}</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">${sorcBubbles}</div>
        <div style="font-size:11px;color:var(--text3);margin-bottom:6px">${sorcPts}/${sorcPtsMax} pts • Repos long</div>
        <div style="font-size:11px;color:var(--text3);margin-bottom:4px">Magie flexible — Créer un emplacement :</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">${flexButtons}</div>
        <button class="btn bsm" onclick="P().combatCharges=P().combatCharges||{};P().combatCharges['SorcelleriePts']=${sorcPtsMax};_markUnsaved();render()">↺ Repos long</button>
        ${sorcLvl>=3?(()=>{const METAMAGIC_OPTIONS=[{n:'Magie distante',c:1,d:'Double la portée du sort (portée tactile → 9m).'},{n:'Magie discrète',c:1,d:'Supprime une ou deux composantes (V et/ou S) au choix.'},{n:'Magie prolongée',c:1,d:'Double la durée du sort (max 24h).'},{n:'Magie accélérée',c:2,d:"Réduit l'incantation à une action bonus (si 1 action normalement)."},{n:'Magie renforcée',c:1,d:'Relance jusqu\'à '+Math.max(1,chaM)+' dé(s) de dégâts (= mod. CHA). Doit conserver les nouveaux résultats.'},{n:'Magie jumelle',c:'=niv sort',d:'Cible une 2e créature admissible. Coût = niveau d\'emplacement (min 1 pt).'},{n:'Magie très précise',c:2,d:'Choisis quelle créature doit faire son JS (pour les sorts qui en demandent un).'},{n:'Magie élevée',c:2,d:'Lance un sort niv.1 sans dépenser d\'emplacement. 1 fois/repos long.'}];const maxOpts=sorcLvl>=17?4:sorcLvl>=10?3:2;const chosen=p.metamagicOptions||[];return`<div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:4px">✨ Métamagie <span style="font-size:10px;color:var(--text3);font-weight:400">${chosen.length}/${maxOpts} options choisies</span></div><div style="display:flex;flex-wrap:wrap;gap:6px">${METAMAGIC_OPTIONS.map(m=>{const sel=chosen.includes(m.n);return`<div style="padding:6px 10px;background:${sel?'rgba(200,168,75,.15)':'var(--surface2)'};border:1px solid ${sel?'var(--cp)':'var(--border)'};border-radius:8px;cursor:pointer;flex:1;min-width:160px" onclick="toggleMetamagic('${m.n}',${maxOpts})"><div style="font-size:12px;font-weight:600;color:${sel?'var(--cp)':'var(--text2)'}">${m.n} <span style="font-size:10px;color:var(--text3)">${typeof m.c==='number'?m.c+' pt'+(m.c>1?'s':''):m.c}</span></div><div style="font-size:10px;color:var(--text3);margin-top:2px">${m.d}</div></div>`;}).join('')}</div></div>`;})():''}
      ${sorcLvl>=20?`<div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:4px">♻ Restauration d'ensorceleur (niv.20)</div><div style="font-size:11px;color:var(--text2)">Repos court : récupère 4 pts de sorcellerie. 1×/repos long.</div></div>`:''}
      ${isSorcDraconique?`<div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:6px">🐉 Origine draconique</div><div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">Résistance draconique (niv.1) — CA 13+DEX si non armé · +${sorcLvl} PV bonus (1/niveau)</div>${sorcLvl>=6?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">Affinité élémentaire (niv.6) — +${chaM} aux dégâts de ton type draconique. Dépense 1 pt → résistance à ce type 1 heure</div>`:''} ${sorcLvl>=14?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">🦋 Ailes draconiques (niv.14) — Action bonus : faire apparaître des ailes, vitesse de vol = déplacement de base</div>`:''} ${sorcLvl>=18?(()=>{const pdActive=!!(p.combatCharges||{})['PresenceDracoSorcActive'];return`<div style="padding:6px 8px;background:${pdActive?'rgba(200,168,75,.1)':'var(--surface2)'};border:1px solid ${pdActive?'var(--cp)':'var(--border)'};border-radius:6px"><div style="font-size:11px;font-weight:600;color:var(--text2)">Présence draconique (niv.18) — Aura 18m, créatures charmées ou effrayées (1 min)</div><div style="display:flex;gap:6px;margin-top:4px"><button class="btn bsm" style="${pdActive?'color:var(--cp)':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};if(!p.combatCharges['PresenceDracoSorcActive']){if((p.combatCharges['SorcelleriePts']||0)<5){showToast('❌ Pas assez de pts (5 requis)');return;}p.combatCharges['SorcelleriePts']=(p.combatCharges['SorcelleriePts']||0)-5;}p.combatCharges['PresenceDracoSorcActive']=!p.combatCharges['PresenceDracoSorcActive'];saveAll();render();})()">${pdActive?'↺ Mettre fin':'⚡ Activer (5 pts)'}</button></div></div>`;})():''}</div>`:''}
      ${isSorcSauvage?`<div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:6px">🌀 Magie sauvage</div>${(()=>{const mChaosUsed=!!(p.combatCharges||{})['MareeChaosUsed'];return`<div style="padding:6px 8px;background:${mChaosUsed?'rgba(200,168,75,.1)':'var(--surface2)'};border:1px solid ${mChaosUsed?'var(--cp)':'var(--border)'};border-radius:6px;margin-bottom:6px"><div style="font-size:11px;font-weight:600;color:var(--text2)">Marée du chaos (niv.1) — 1/repos long</div><div style="font-size:10px;color:var(--text3);margin:2px 0">Avantage sur 1 jet. La prochaine utilisation de sort provoque une surtension.</div><div style="margin-top:4px"><button class="btn bsm" style="${mChaosUsed?'color:var(--cp)':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['MareeChaosUsed']=!p.combatCharges['MareeChaosUsed'];saveAll();render();})()">${mChaosUsed?'↺ Récupérer (repos long)':'⚡ Utiliser'}</button></div></div>`;})()}${sorcLvl>=6?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">Chance forcée (niv.6) — Réaction : dépense 2 pts, impose +1d4 ou −1d4 à un jet d'une créature à portée</div>`:''} ${sorcLvl>=14?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">Chaos contrôlé (niv.14) — Quand une surtension se produit, relance 2× et choisis l'effet</div>`:''} ${sorcLvl>=18?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">Bombardement de sort (niv.18) — Si un dé de dégâts sort son maximum, relance-le et ajoute le résultat</div>`:''}</div>`:''}
      </div>`);})()}
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
  ${(!wsC?.active||druLvl>=18)&&warlockSlots?cs('cs-warlock',`<div class="panel mb10"><div class="pt" style="display:flex;align-items:center;justify-content:space-between"><div style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span><span>Magie de pacte — Occultiste</span></div><span style="font-size:10px;color:var(--cp);border:1px solid var(--cp);border-radius:10px;padding:2px 8px">Repos court</span></div>
      <div style="font-size:12px;color:var(--text2);margin-bottom:8px">Niveau des emplacements : <strong style="color:var(--cp)">${warlockSlots[1]}</strong></div>
      <div style="display:flex;align-items:center;gap:8px">
        <div style="display:flex;gap:4px">${Array.from({length:warlockSlots[0]},(_,si)=>`<span class="slot-bubble${si<(slotsUsed[9]||0)?' used':''}" onclick="toggleWarlockSlot(${si},${warlockSlots[0]})" style="width:16px;height:16px"></span>`).join('')}</div>
        <span style="font-size:11px;color:var(--text3)">${warlockSlots[0]-(slotsUsed[9]||0)}/${warlockSlots[0]} emplacement${warlockSlots[0]>1?'s':''}</span>
        <button class="btn bsm" onclick="P().spellSlotsUsed=P().spellSlotsUsed||[];P().spellSlotsUsed[9]=0;render()">↺ Repos court</button>
      </div>
      ${(()=>{const occLvl=((p.classes||[]).find(c=>c.name==='Occultiste')||{}).level||0;if(!occLvl)return'';const patronPath=(p.features||[]).find(f=>["L'Archifée","Le Fiélon","Le Grand Ancien"].includes(f.name));const isArchifee=patronPath?.name==="L'Archifée";const isFielon=patronPath?.name==="Le Fiélon";const isGrandAncien=patronPath?.name==="Le Grand Ancien";const cc=p.combatCharges||{};let html='';
        if(occLvl>=3){const pactChoix=cc['PactChoice']||'';const pacts=[{id:'Chaîne',icon:'🔗',d:"Familier amélioré (diable, pseudodragon, quasit ou lutin) invocable en 1h de rituel."},{id:'Lame',icon:'⚔',d:"Action bonus : invoquer une arme de pacte liée (lien créé sur 1h de rituel)."},{id:'Grimoire',icon:'📖',d:"Livre des ombres : +3 cantrieps de n'importe quelle classe."}];html+=`<div style="border-top:1px solid var(--border);padding-top:10px;margin-top:8px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:6px">🤝 Faveur de pacte (niv.3)</div><div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">${pacts.map(pt=>`<button class="btn bsm${pactChoix===pt.id?' bac':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['PactChoice']='${pt.id}';saveAll();render();})()">${pt.icon} ${pt.id}</button>`).join('')}</div>${pactChoix?`<div style="font-size:11px;color:var(--text3)">${pacts.find(pt=>pt.id===pactChoix)?.d||''}</div>`:'<div style="font-size:11px;color:var(--text3);font-style:italic">Choisissez votre faveur de pacte ci-dessus.</div>'}</div>`;}
        if(isArchifee){const pfU=!!cc['PresenceFeeUsed'];const ebU=!!cc['EchappatBrumeUsed'];const sdU=!!cc['SombreDelireUsed'];html+=`<div style="border-top:1px solid var(--border);padding-top:10px;margin-top:8px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:6px">🧚 L'Archifée</div><div style="display:flex;align-items:center;gap:6px;padding:5px 8px;background:${pfU?'rgba(200,168,75,.1)':'var(--surface2)'};border:1px solid ${pfU?'var(--cp)':'var(--border)'};border-radius:6px;margin-bottom:4px"><span class="slot-bubble${pfU?' used':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['PresenceFeeUsed']=!p.combatCharges['PresenceFeeUsed'];saveAll();render();})()"></span><div><div style="font-size:11px;font-weight:600">Présence féerique (niv.1) — 1/repos court</div><div style="font-size:10px;color:var(--text3)">Action : cube 3m, JS SAG DD ${8+pb(occLvl)+chaM} ou charmé/effrayé 1 tour</div></div><button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};delete p.combatCharges['PresenceFeeUsed'];saveAll();render();})()">↺</button></div>${occLvl>=6?`<div style="display:flex;align-items:center;gap:6px;padding:5px 8px;background:${ebU?'rgba(200,168,75,.1)':'var(--surface2)'};border:1px solid ${ebU?'var(--cp)':'var(--border)'};border-radius:6px;margin-bottom:4px"><span class="slot-bubble${ebU?' used':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['EchappatBrumeUsed']=!p.combatCharges['EchappatBrumeUsed'];saveAll();render();})()"></span><div><div style="font-size:11px;font-weight:600">Échappatoire brumeuse (niv.6) — 1/repos court</div><div style="font-size:10px;color:var(--text3)">Réaction sur dégâts : téléportation 18m, invisible jusqu'au prochain tour</div></div><button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};delete p.combatCharges['EchappatBrumeUsed'];saveAll();render();})()">↺</button></div>`:''} ${occLvl>=10?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Défenses captivantes (niv.10) — Immunité charme. Réaction : retourner un charme contre son auteur</div>`:''} ${occLvl>=14?`<div style="display:flex;align-items:center;gap:6px;padding:5px 8px;background:${sdU?'rgba(200,168,75,.1)':'var(--surface2)'};border:1px solid ${sdU?'var(--cp)':'var(--border)'};border-radius:6px"><span class="slot-bubble${sdU?' used':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['SombreDelireUsed']=!p.combatCharges['SombreDelireUsed'];saveAll();render();})()"></span><div><div style="font-size:11px;font-weight:600">Sombre délire (niv.14) — 1/repos court</div><div style="font-size:10px;color:var(--text3)">Action 18m : charmé/effrayé 1 min, illusion immersive. DD ${8+pb(occLvl)+chaM}</div></div><button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};delete p.combatCharges['SombreDelireUsed'];saveAll();render();})()">↺</button></div>`:''}  </div>`;}
        if(isFielon){const ctU=!!cc['ChanceTenebreuxUsed'];const teU=!!cc['TraverseeEnfersUsed'];const DMGT=['Acide','Feu','Froid','Foudre','Nécrotique','Poison','Psychique','Radiant','Tonnerre','Contondant','Perforant','Tranchant'];const curRes=cc['FielonResistance']||'';html+=`<div style="border-top:1px solid var(--border);padding-top:10px;margin-top:8px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:6px">😈 Le Fiélon</div><div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Bénédiction du ténébreux (niv.1) — PV temp. = CHA+niveau quand tu élimines une créature hostile</div>${occLvl>=6?`<div style="display:flex;align-items:center;gap:6px;padding:5px 8px;background:${ctU?'rgba(200,168,75,.1)':'var(--surface2)'};border:1px solid ${ctU?'var(--cp)':'var(--border)'};border-radius:6px;margin-bottom:4px"><span class="slot-bubble${ctU?' used':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['ChanceTenebreuxUsed']=!p.combatCharges['ChanceTenebreuxUsed'];saveAll();render();})()"></span><div><div style="font-size:11px;font-weight:600">Chance du ténébreux (niv.6) — 1/repos court</div><div style="font-size:10px;color:var(--text3)">Réaction : +1d10 à un jet d'une créature visible</div></div><button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};delete p.combatCharges['ChanceTenebreuxUsed'];saveAll();render();})()">↺</button></div>`:''} ${occLvl>=10?`<div style="padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px"><div style="font-size:11px;font-weight:600;margin-bottom:4px">Résistance fiélonne (niv.10) — Choisir à chaque repos court :</div><select style="font-size:11px;padding:3px;border-radius:4px;border:1px solid var(--border);background:var(--surface2);color:var(--text2);width:100%" onchange="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['FielonResistance']=this.value;saveAll();})()"><option value="">-- Choisir --</option>${DMGT.map(t=>`<option value="${t}"${curRes===t?' selected':''}>${t}</option>`).join('')}</select>${curRes?`<div style="font-size:10px;color:#4caf50;margin-top:2px">✓ Résistance active : ${curRes}</div>`:''}</div>`:''} ${occLvl>=14?`<div style="display:flex;align-items:center;gap:6px;padding:5px 8px;background:${teU?'rgba(200,168,75,.1)':'var(--surface2)'};border:1px solid ${teU?'var(--cp)':'var(--border)'};border-radius:6px"><span class="slot-bubble${teU?' used':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['TraverseeEnfersUsed']=!p.combatCharges['TraverseeEnfersUsed'];saveAll();render();})()"></span><div><div style="font-size:11px;font-weight:600">Traversée des enfers (niv.14) — 1/repos long</div><div style="font-size:10px;color:var(--text3)">Toucher → banni 1 tour, 10d10 psychiques au retour. DD ${8+pb(occLvl)+chaM}</div></div><button class="btn bsm" onclick="rollCustomDmg('10d10','Traversée des enfers')">🎲 10d10</button><button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};delete p.combatCharges['TraverseeEnfersUsed'];saveAll();render();})()">↺</button></div>`:''}  </div>`;}
        if(isGrandAncien){const peU=!!cc['ProtecEntropiqueUsed'];html+=`<div style="border-top:1px solid var(--border);padding-top:10px;margin-top:8px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:6px">🐙 Le Grand Ancien</div><div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Esprit éveillé (niv.1) — Télépathie à 9m vers toute créature comprenant une langue</div>${occLvl>=6?`<div style="display:flex;align-items:center;gap:6px;padding:5px 8px;background:${peU?'rgba(200,168,75,.1)':'var(--surface2)'};border:1px solid ${peU?'var(--cp)':'var(--border)'};border-radius:6px;margin-bottom:4px"><span class="slot-bubble${peU?' used':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['ProtecEntropiqueUsed']=!p.combatCharges['ProtecEntropiqueUsed'];saveAll();render();})()"></span><div><div style="font-size:11px;font-weight:600">Protection entropique (niv.6) — 1/repos court</div><div style="font-size:10px;color:var(--text3)">Réaction : désavantage à l'attaquant. Si rate : avantage sur ton prochain jet contre lui</div></div><button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};delete p.combatCharges['ProtecEntropiqueUsed'];saveAll();render();})()">↺</button></div>`:''}  ${occLvl>=10?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Bouclier mental (niv.10) — Immunité lecture de pensées, résistance dégâts psychiques</div>`:''} ${occLvl>=14?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">Asservissement (niv.14) — Action : toucher humanoïde incapacité → charme permanent (JS SAG DD ${8+pb(occLvl)+chaM})</div>`:''}</div>`;}
        if(occLvl>=11){const arcs=[{n:11,s:6},{n:13,s:7},{n:15,s:8},{n:17,s:9}].filter(a=>occLvl>=a.n);html+=`<div style="border-top:1px solid var(--border);padding-top:10px;margin-top:8px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:6px">📿 Arcanum mystique — 1 sort/niveau/repos long</div>${arcs.map(a=>{const key='ArcanumNiv'+a.s+'Used';const used=!!cc[key];return`<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><span class="slot-bubble${used?' used':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['${key}']=!p.combatCharges['${key}'];saveAll();render();})()"></span><span style="font-size:11px;color:${used?'var(--text3)':'var(--text2)'}">Niv.${a.s} ${used?'(utilisé)':'(disponible)'}</span>${used?`<button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};delete p.combatCharges['${key}'];saveAll();render();})()">↺</button>`:''}`;}).join('')}</div>`;}
        if(occLvl>=20){html+=`<div style="border-top:1px solid var(--border);padding-top:10px;margin-top:8px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:4px">👑 Maître de l'occulte (niv.20)</div><div style="font-size:11px;color:var(--text2)">Supplier ton patron 1 min → récupérer tous tes emplacements de pacte. 1×/repos long.</div></div>`;}
        return html;})()}
    </div>`):''}
  ${!wsC?.active&&magLvl>0?cs('cs-magicien',`<div class="panel mb10"><div class="pt" style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span>📚 Magicien — Capacités</div>
    <div style="font-size:11px;color:var(--text3);margin-bottom:10px">DD sorts : <strong style="color:var(--cp)">${8+pb(magLvl)+intM}</strong> · Bonus attaque sort : <strong>+${pb(magLvl)+intM}</strong></div>
    ${(()=>{const raUsed=!!((p.combatCharges||{})['RestaurationArcanUsed']);return`<div style="margin-bottom:12px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:4px">📖 Restauration arcanique — 1/repos court</div><div style="font-size:11px;color:var(--text3);margin-bottom:6px">Récupère des emplacements dépensés (total niveaux ≤ ${Math.ceil(magLvl/2)}, max niv.5 par emplacement).</div><div style="display:flex;align-items:center;gap:6px"><span class="slot-bubble${raUsed?' used':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['RestaurationArcanUsed']=!p.combatCharges['RestaurationArcanUsed'];saveAll();render();})()"></span><button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};delete p.combatCharges['RestaurationArcanUsed'];saveAll();render();})()">↺ Repos court</button></div></div>`;})()}
    ${magLvl>=18?`<div style="margin-bottom:12px;border-top:1px solid var(--border);padding-top:10px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:4px">🎯 Maîtrise des sorts (niv.18)</div><div style="font-size:11px;color:var(--text3)">Choisir 1 sort niv.1 et 1 sort niv.2 : lancés <strong>à volonté</strong>, sans dépenser d'emplacement. Changer de sorts en 8h d'étude.</div></div>`:''}
    ${magLvl>=20?(()=>{const sp1=!!((p.combatCharges||{})['SortPredilection1Used']);const sp2=!!((p.combatCharges||{})['SortPredilection2Used']);return`<div style="margin-bottom:12px;border-top:1px solid var(--border);padding-top:10px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:4px">✨ Sorts de prédilection (niv.20) — 1/repos court chacun</div><div style="font-size:11px;color:var(--text3);margin-bottom:6px">2 sorts niv.3 toujours préparés, lancés 1× gratuitement chacun/repos.</div><div style="display:flex;flex-direction:column;gap:4px"><div style="display:flex;align-items:center;gap:6px"><span class="slot-bubble${sp1?' used':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['SortPredilection1Used']=!p.combatCharges['SortPredilection1Used'];saveAll();render();})()"></span><span style="font-size:11px;color:var(--text2)">Sort de prédilection 1</span>${sp1?`<button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};delete p.combatCharges['SortPredilection1Used'];saveAll();render();})()">↺</button>`:''}</div><div style="display:flex;align-items:center;gap:6px"><span class="slot-bubble${sp2?' used':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['SortPredilection2Used']=!p.combatCharges['SortPredilection2Used'];saveAll();render();})()"></span><span style="font-size:11px;color:var(--text2)">Sort de prédilection 2</span>${sp2?`<button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};delete p.combatCharges['SortPredilection2Used'];saveAll();render();})()">↺</button>`:''}</div><button class="btn bsm" style="margin-top:4px" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};delete p.combatCharges['SortPredilection1Used'];delete p.combatCharges['SortPredilection2Used'];saveAll();render();})()">↺ Repos court</button></div></div>`;})():''}
    ${magPath?(()=>{const school=magPath.name;const icon=school.includes('abjuration')?'🛡':school.includes('divination')?'🔮':school.includes('enchantement')?'💜':school.includes('évocation')?'🔥':school.includes('illusion')?'🌀':school.includes('invocation')?'✨':school.includes('nécromancie')?'💀':'⚗';let html=`<div style="border-top:1px solid var(--border);padding-top:10px;margin-top:4px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:6px">${icon} ${school}</div>`;
    if(school==="École d'abjuration"){html+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Protection arcanique (niv.2) — Sceau ${2*magLvl+intM} PV créé en lançant un sort d'abjuration niv.1+. Absorbe les dégâts à ta place.</div>${magLvl>=6?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Protection projetée (niv.6) — Réaction : transférer le sceau sur un allié à 9m qui prend des dégâts.</div>`:''}${magLvl>=10?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Abjuration améliorée (niv.10) — +maîtrise aux jets de caractéristique pour contresort/dissipation et sorts d'abjuration similaires.</div>`:''}${magLvl>=14?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">Résistance aux sorts (niv.14) — Avantage à tous les JS contre les sorts + résistance aux dégâts de sorts.</div>`:''}`;}
    if(school==="École de divination"){const presMax=magLvl>=14?3:2;html+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Présage (niv.2) — Repos long : lance ${presMax} d20, utiliser pour remplacer n'importe quel jet (avant le lancer).</div>${magLvl>=6?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Divination experte (niv.6) — Lancer divination niv.2+ : récupérer un emplacement d'un niveau inférieur (max niv.5).</div>`:''}${magLvl>=10?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Troisième œil (niv.10) — Action : Lire toutes langues / Vision nocturne 18m / Vision éthérée / Voir invisible 3m.</div>`:''}${magLvl>=14?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">Présage supérieur (niv.14) — Lance 3 d20 au lieu de 2 pour Présage.</div>`:''}`;}
    if(school==="École d'enchantement"){html+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Regard hypnotique (niv.2) — Action : créature à 1,5m, JS SAG DD ${8+pb(magLvl)+intM} ou charmée (vitesse 0). 1×/repos long par cible.</div>${magLvl>=6?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Charme instinctif (niv.6) — Réaction : dévier attaque vers autre créature, JS SAG DD ${8+pb(magLvl)+intM}.</div>`:''}${magLvl>=10?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Partage d'enchantement (niv.10) — Sort d'enchantement sur 1 cible : peut cibler une 2e également.</div>`:''}${magLvl>=14?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">Altération mémorielle (niv.14) — Créature charmée oublie jusqu'à ${1+chaM}h (action, JS INT DD ${8+pb(magLvl)+intM}).</div>`:''}`;}
    if(school==="École d'évocation"){html+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Façonneur de sorts (niv.2) — Protéger jusqu'à 1+niv.du sort créatures choisies des effets d'un sort d'évocation de zone.</div>${magLvl>=6?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Sort mineur puissant (niv.6) — Si une créature réussit son JS contre un de tes cantrieps : elle prend quand même la moitié des dégâts.</div>`:''}${magLvl>=10?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Évocation améliorée (niv.10) — +${intM} à un jet de dégâts par sort d'évocation.</div>`:''}${magLvl>=14?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">Surcharge magique (niv.14) — Dégâts max avec un sort niv.1-5. 1ère fois gratuit ; réutilisation : +2d12 nécrotiques/niveau cumulatif.</div>`:''}`;}
    if(school==="École d'illusion"){html+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Illusion mineure améliorée (niv.2) — Illusion mineure crée un son ET une image simultanément.</div>${magLvl>=6?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Illusions malléables (niv.6) — Action : modifier la nature d'une illusion active (durée ≥ 1 min).</div>`:''}`;if(magLvl>=10){const diUsed=!!((p.combatCharges||{})['DoubleIllusoireUsed']);html+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px"><div>Double illusoire (niv.10) — Réaction : copie illusoire fait rater une attaque. 1×/repos court.</div><div style="display:flex;align-items:center;gap:6px;margin-top:4px"><span class="slot-bubble${diUsed?' used':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['DoubleIllusoireUsed']=!p.combatCharges['DoubleIllusoireUsed'];saveAll();render();})()"></span><button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};delete p.combatCharges['DoubleIllusoireUsed'];saveAll();render();})()">↺ Repos court</button></div></div>`;}if(magLvl>=14)html+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">Réalité illusoire (niv.14) — Choisir un objet inanimé dans une illusion niv.1+ et le rendre réel 1 minute.</div>`;}
    if(school==="École d'invocation"){html+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Invocation mineure (niv.2) — Action : invoquer un objet ≤5kg à 3m pendant 1h.</div>`;if(magLvl>=6){const permUsed=!!((p.combatCharges||{})['PermutationUsed']);html+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px"><div>Permutation (niv.6) — Action bonus : téléportation 9m ou échange avec créature consentante P/M. 1×/repos long ou sort d'invocation.</div><div style="display:flex;align-items:center;gap:6px;margin-top:4px"><span class="slot-bubble${permUsed?' used':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['PermutationUsed']=!p.combatCharges['PermutationUsed'];saveAll();render();})()"></span><button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};delete p.combatCharges['PermutationUsed'];saveAll();render();})()">↺ Repos long / sort invoc.</button></div></div>`;}if(magLvl>=10)html+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Invocation consciencieuse (niv.10) — Concentration ininterrompue par les dégâts (sorts d'invocation uniquement).</div>`;if(magLvl>=14)html+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">Convocations coriaces (niv.14) — Les créatures invoquées gagnent 30 PV temporaires à leur apparition.</div>`;}
    if(school==="École de nécromancie"){html+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Sinistre moisson (niv.2) — Tuer par un sort niv.1+ : récupère 2×niveau du sort en PV (3× si sort de nécromancie).</div>${magLvl>=6?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Serviteurs morts-vivants (niv.6) — Morts-vivants animés : +${magLvl} PV max, +maîtrise aux dégâts.</div>`:''}${magLvl>=10?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Insensibilité à la non-vie (niv.10) — Résistance dégâts nécrotiques. PV max ne peut pas être réduit.</div>`:''}${magLvl>=14?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">Contrôle des morts-vivants (niv.14) — Action : contrôler un mort-vivant visible à 18m, JS CHA DD ${8+pb(magLvl)+intM}.</div>`:''}`;}
    if(school==="École de transmutation"){html+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Alchimie mineure (niv.2) — Transformer temporairement bois/pierre/fer/cuivre/argent (cube 30cm/10min, 1h max).</div>${magLvl>=6?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Pierre du transmutateur (niv.6) — 8h : pierre octroyant vitesse+3m / maîtrise JS CON / résistance (type choisi) / vision nocturne 18m.</div>`:''}`;if(magLvl>=10){const metaUsed=!!((p.combatCharges||{})['MetamorpheUsed']);html+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px"><div>Métamorphe (niv.10) — Lancer Métamorphose sur soi sans emplacement (bête CR≤1). 1×/repos court ou long.</div><div style="display:flex;align-items:center;gap:6px;margin-top:4px"><span class="slot-bubble${metaUsed?' used':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['MetamorpheUsed']=!p.combatCharges['MetamorpheUsed'];saveAll();render();})()"></span><button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};delete p.combatCharges['MetamorpheUsed'];saveAll();render();})()">↺ Repos court</button></div></div>`;}if(magLvl>=14)html+=`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">Maître transmutateur (niv.14) — Détruire la pierre → Jouvence (−3d10 ans) / Panacée (soin total + fin effets) / Rappel à la vie / Transformation majeure.</div>`;}
    html+='</div>';return html;})():''}
  </div>`):''}
  ${!wsC?.active&&rodeurLvl>0?cs('cs-rodeur',`<div class="panel mb10"><div class="pt" style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span>🏹 Rôdeur — Capacités</div>
    <div style="font-size:11px;color:var(--text3);margin-bottom:10px">DD sorts : <strong style="color:var(--cp)">${8+pb(rodeurLvl)+sagM}</strong> · Bonus attaque sort : <strong>+${pb(rodeurLvl)+sagM}</strong></div>
    ${combatStyle?`<div style="margin-bottom:8px;padding:6px 8px;background:var(--surface2);border-radius:6px;font-size:11px;color:var(--text2)">⚔ Style de combat : <strong>${combatStyle}</strong></div>`:''}
    ${rodeurLvl>=3?`<div style="margin-bottom:8px;padding:6px 8px;background:var(--surface2);border-radius:6px;font-size:11px;color:var(--text2)">👁 Vigilance primitive (niv.3) — Action + emplacement : détecter aberrations/célestes/dragons/élémentaires/fées/fiélons/morts-vivants à 1,5 km (1 min/niveau d'emplacement)</div>`:''}
    ${rodeurLvl>=5?`<div style="margin-bottom:8px;padding:6px 8px;background:var(--surface2);border-radius:6px;font-size:11px;color:var(--text2)">⚔ Attaque supplémentaire (niv.5) — Attaquer 2× lors de l'action Attaquer</div>`:''}
    ${rodeurLvl>=8?`<div style="margin-bottom:8px;padding:6px 8px;background:var(--surface2);border-radius:6px;font-size:11px;color:var(--text2)">🚶 Foulée tellurique (niv.8) — Terrains difficiles non magiques sans surcoût de mouvement. Avantage JS contre enchevêtrement et plantes magiques</div>`:''}
    ${rodeurLvl>=10?`<div style="margin-bottom:8px;padding:6px 8px;background:var(--surface2);border-radius:6px;font-size:11px;color:var(--text2)">🌿 Camouflage naturel (niv.10) — 1 min de préparation avec matériaux naturels : +10 à Discrétion si immobile contre une surface solide</div>`:''}
    ${rodeurLvl>=14?`<div style="margin-bottom:8px;padding:6px 8px;background:var(--surface2);border-radius:6px;font-size:11px;color:var(--text2)">👻 Disparition (niv.14) — Se cacher en action bonus. Ne peut pas être suivi par des moyens non magiques</div>`:''}
    ${rodeurLvl>=18?`<div style="margin-bottom:8px;padding:6px 8px;background:var(--surface2);border-radius:6px;font-size:11px;color:var(--text2)">👂 Sens sauvages (niv.18) — Pas de désavantage pour attaquer une créature invisible à portée. Localise les créatures invisibles à 9m</div>`:''}
    ${rodeurLvl>=20?`<div style="margin-bottom:8px;padding:6px 8px;background:rgba(200,168,75,.07);border:1px solid rgba(200,168,75,.3);border-radius:6px;font-size:11px;color:var(--text2)">🎯 Tueur implacable (niv.20) — 1×/tour : +${sagM} aux jets d'attaque ou de dégâts contre un ennemi juré</div>`:''}
    ${isChasseur&&rodeurLvl>=3?`<div style="border-top:1px solid var(--border);padding-top:10px;margin-top:8px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:6px">🎯 Chasseur</div><div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Proie du chasseur (niv.3) — Tueur de colosses (+1d8 si cible sous max PV) / Tueur de géants (réaction contre grande créature) / Briseur de hordes (attaque bonus contre cible adjacente)</div>${rodeurLvl>=7?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Tactiques défensives (niv.7) — Échapper à la horde (désav. AO) / Défense multi-attaques (+4 CA contre même cible ce tour) / Moral d'acier (avantage JS Peur)</div>`:''} ${rodeurLvl>=11?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Attaques multiples (niv.11) — Volée (tir sur N cibles dans 3m d'un point ciblé) / Attaque tourbillonnante (corps à corps sur toutes créatures à 1,5m)</div>`:''} ${rodeurLvl>=15?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">Défense supérieure (niv.15) — Esquive totale / Retour de bâton (réaction : retourner l'attaque manquée vers une autre créature) / Esquive instinctive (réaction : dégâts de moitié)</div>`:''}</div>`:''}
    ${isMdB&&rodeurLvl>=3?`<div style="border-top:1px solid var(--border);padding-top:10px;margin-top:8px"><div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:6px">🐾 Maître des bêtes</div><div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Compagnon du rôdeur (niv.3) — Bête taille M max, CR ≤ 1/4. PV = max(normal, 4×niv). Agit à ton tour sur ordre.</div>${rodeurLvl>=7?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Entraînement exceptionnel (niv.7) — Action bonus : commander Aider/Foncer/Désengager. Attaques du compagnon = magiques.</div>`:''} ${rodeurLvl>=11?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Fureur bestiale (niv.11) — Sur ordre Attaquer : le compagnon peut attaquer 2×.</div>`:''} ${rodeurLvl>=15?`<div style="font-size:11px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">Partage des sorts (niv.15) — Un sort te ciblant affecte aussi le compagnon s'il est à 9m ou moins.</div>`:''}</div>`:''}
  </div>`):''}
  ${(()=>{
    const fam=p.familiar;
    const rodeurLvl=((p.classes||[]).find(c=>c.name==='Rôdeur')||{}).level||0;
    const magLvl=((p.classes||[]).find(c=>c.name==='Magicien')||{}).level||0;
    const occLvl=((p.classes||[]).find(c=>c.name==='Occultiste')||{}).level||0;
    const showFamiliar=fam||(magLvl||occLvl);
    if(!showFamiliar)return'';
    if(!fam||!fam.active){
      return cs('cs-familiar',`<div class="panel mb10"><div class="pt" style="display:flex;align-items:center;justify-content:space-between"><div style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span><span>🦉 Familier</span></div><button class="btn bsm" onclick="openFamiliarModal()">⚙ Configurer</button></div>
        ${fam&&!fam.active?`<div style="font-size:12px;color:var(--text3);margin-bottom:8px">🦉 <em>${fam.name}</em> est actuellement dissipé dans le plan éthéré.</div><button class="btn bsm bac" onclick="recallFamiliar()">🦉 Reconvoquer</button>`:`<div style="font-size:12px;color:var(--text3)">Aucun familier actif. Configurez-en un pour le suivre ici.</div>`}
      </div>`);
    }
    const fpct=Math.round(fam.hpCur/Math.max(1,fam.hpMax)*100);
    const fhpColor=fpct>50?'#4caf50':fpct>25?'#ff9800':'#e53935';
    return cs('cs-familiar',`<div class="panel mb10" style="border-color:rgba(200,168,75,.35)"><div class="pt" style="display:flex;align-items:center;justify-content:space-between"><div style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span><span>${fam.icon} Familier — ${fam.name}</span></div><div style="display:flex;gap:6px"><button class="btn bsm" onclick="openFamiliarModal()" title="Configurer">⚙</button><button class="btn bsm bdanger" onclick="revokeFamiliar()">✕ Révoquer</button></div></div>
      <div class="g3 mb6">
        <div class="sb hi"><div class="sn">PV</div><div style="font-size:18px;font-weight:700;color:${fhpColor}">${fam.hpCur}</div><div class="sm">${fam.hpCur}/${fam.hpMax}</div></div>
        <div class="sb"><div class="sn">CA</div><div style="font-size:18px;font-weight:700">${fam.ac}</div></div>
        <div class="sb"><div class="sn">Vitesse</div><div style="font-size:10px;font-weight:600;line-height:1.3">${fam.speed}</div></div>
      </div>
      <div class="hp-bar mb6"><div class="hp-fill" style="width:${fpct}%;background:${fhpColor}"></div></div>
      <div class="hp-ctrl mb8">
        <input class="fi" id="famHpDelta" type="number" placeholder="montant" style="width:70px">
        <button class="btn bsm" style="background:#b71c1c;color:#fff;border-color:#b71c1c" onclick="applyFamiliarHp(-1)">Dégâts</button>
        <button class="btn bsm" style="background:#2e7d32;color:#fff;border-color:#2e7d32" onclick="applyFamiliarHp(1)">Soins</button>
      </div>
      <div class="g6 mb8">${ABILITIES_SH.map((ab,i)=>`<div class="sb" style="padding:3px"><div class="sn" style="font-size:9px">${ab}</div><div style="font-size:12px;font-weight:600">${fam.ab[i]}</div><div class="sm" style="font-size:9px">${fmt(Math.floor((fam.ab[i]-10)/2))}</div></div>`).join('')}</div>
      ${fam.attacks.length?`<div style="margin-bottom:8px"><div class="fl mb4">Attaques</div>${fam.attacks.map(a=>`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:6px 10px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center"><div><strong style="font-size:12px">${a.name}</strong>${a.special?`<div style="font-size:10px;color:var(--text3)">${a.special}</div>`:''}</div><div style="display:flex;align-items:center;gap:6px"><span style="font-size:11px;color:var(--text2)">+${a.bonus} / <strong>${a.dmg}</strong> ${a.type}</span>${a.dmg&&a.dmg.includes('d')?`<button class="btn bsm" onclick="rollCustomDmg('${a.dmg}','${a.name}')">🎲</button>`:''}</div></div>`).join('')}</div>`:''}
      ${fam.traits.length?`<div><div class="fl mb4">Traits</div>${fam.traits.map(t=>`<div style="font-size:11px;color:var(--text2);padding:2px 0">▹ ${t}</div>`).join('')}</div>`:''}
    </div>`);
  })()}
  ${(()=>{
    const rodeurLvl=((p.classes||[]).find(c=>c.name==='Rôdeur')||{}).level||0;
    if(!rodeurLvl)return'';
    const bc=p.beastCompanion;
    if(!bc||!bc.active){
      return cs('cs-beast-companion',`<div class="panel mb10"><div class="pt" style="display:flex;align-items:center;justify-content:space-between"><div style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span><span>🐾 Compagnon animal</span></div><button class="btn bsm" onclick="openBeastCompanionModal()">⚙ Configurer</button></div>
        ${bc&&!bc.active?`<div style="font-size:12px;color:var(--text3);margin-bottom:8px">🐾 <em>${bc.name}</em> est tombé à 0 PV.</div><button class="btn bsm bac" onclick="recallBeastCompanion()">🐾 Reconvoquer (après repos)</button>`:`<div style="font-size:12px;color:var(--text3)">Aucun compagnon actif. Choisissez une bête pour la suivre ici.</div>`}
      </div>`);
    }
    const bpct=Math.round(bc.hpCur/Math.max(1,bc.hpMax)*100);
    const bhpColor=bpct>50?'#4caf50':bpct>25?'#ff9800':'#e53935';
    return cs('cs-beast-companion',`<div class="panel mb10" style="border-color:rgba(200,168,75,.35)"><div class="pt" style="display:flex;align-items:center;justify-content:space-between"><div style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span><span>${bc.icon} Compagnon — ${bc.name}</span></div><div style="display:flex;gap:6px"><button class="btn bsm" onclick="openBeastCompanionModal()" title="Changer">⚙</button><button class="btn bsm bdanger" onclick="removeBeastCompanion()">✕ Révoquer</button></div></div>
      <div class="g3 mb6">
        <div class="sb hi"><div class="sn">PV</div><div style="font-size:18px;font-weight:700;color:${bhpColor}">${bc.hpCur}</div><div class="sm">${bc.hpCur}/${bc.hpMax}</div></div>
        <div class="sb"><div class="sn">CA</div><div style="font-size:18px;font-weight:700">${bc.ac}</div></div>
        <div class="sb"><div class="sn">Vitesse</div><div style="font-size:10px;font-weight:600;line-height:1.3">${bc.speed}</div></div>
      </div>
      <div class="hp-bar mb6"><div class="hp-fill" style="width:${bpct}%;background:${bhpColor}"></div></div>
      <div class="hp-ctrl mb8">
        <input class="fi" id="bcHpDelta" type="number" placeholder="montant" style="width:70px">
        <button class="btn bsm" style="background:#b71c1c;color:#fff;border-color:#b71c1c" onclick="applyBeastCompanionHp(-1)">Dégâts</button>
        <button class="btn bsm" style="background:#2e7d32;color:#fff;border-color:#2e7d32" onclick="applyBeastCompanionHp(1)">Soins</button>
      </div>
      <div class="g6 mb8">${ABILITIES_SH.map((ab,i)=>`<div class="sb" style="padding:3px"><div class="sn" style="font-size:9px">${ab}</div><div style="font-size:12px;font-weight:600">${bc.ab[i]}</div><div class="sm" style="font-size:9px">${fmt(Math.floor((bc.ab[i]-10)/2))}</div></div>`).join('')}</div>
      ${bc.attacks&&bc.attacks.length?`<div style="margin-bottom:8px"><div class="fl mb4">Attaques</div>${bc.attacks.map(a=>`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:6px 10px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center"><div><strong style="font-size:12px">${a.name}</strong>${a.special?`<div style="font-size:10px;color:var(--text3)">${a.special}</div>`:''}</div><div style="display:flex;align-items:center;gap:6px"><span style="font-size:11px;color:var(--text2)">+${a.bonus} / <strong>${a.dmg}</strong> ${a.type}</span>${a.dmg&&a.dmg.includes('d')?`<button class="btn bsm" onclick="rollCustomDmg('${a.dmg}','${a.name}')">🎲</button>`:''}</div></div>`).join('')}</div>`:''}
      ${bc.traits&&bc.traits.length?`<div><div class="fl mb4">Traits</div>${bc.traits.map(t=>`<div style="font-size:11px;color:var(--text2);padding:2px 0">▹ ${t}</div>`).join('')}</div>`:''}
    </div>`);
  })()}
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
function toggleMetamagic(name,maxOpts){const p=P();if(!p.metamagicOptions)p.metamagicOptions=[];const idx=p.metamagicOptions.indexOf(name);if(idx>=0){p.metamagicOptions.splice(idx,1);}else{if(p.metamagicOptions.length>=maxOpts){showToast(`❌ Limite atteinte (${maxOpts} options max à ce niveau).`);return;}p.metamagicOptions.push(name);}_markUnsaved();render();}
function toggleRageActive(){
  const p=P();if(!p.combatCharges)p.combatCharges={};
  const barbareLvl=((p.classes||[]).find(c=>c.name==='Barbare')||{}).level||0;
  const rageKey='Rage (2 utilisations, +2 dégâts)';
  const rageMax=barbareLvl>=17?6:barbareLvl>=12?5:barbareLvl>=6?4:barbareLvl>=3?3:2;
  const barbarePath=(p.features||[]).find(f=>['Voie du berserker','Voie du guerrier totem','Voie de la magie sauvage'].includes(f.name));
  const isBerserkerT=barbarePath?.name==='Voie du berserker';
  const isTotemT=barbarePath?.name==='Voie du guerrier totem';
  const isMagieSauvageT=barbarePath?.name==='Voie de la magie sauvage';
  const totemChoice=p.combatCharges['TotemSpirit']||'';
  const RAGE_RES=['Contondant','Perforant','Tranchant'];
  const TOTEM_OURS_RES=['Feu','Froid','Foudre','Nécrotique','Acide','Tonnerre','Radiant','Poison'];
  if(p.combatCharges['RageActive']===true){
    // Sortir de la rage — retirer résistances de rage
    p.combatCharges['RageActive']=false;
    const allRageRes=[...RAGE_RES,...(isTotemT&&totemChoice==='Ours'?TOTEM_OURS_RES:[])];
    p.dmgResistances=(p.dmgResistances||[]).filter(r=>!allRageRes.includes(r));
    // Frénésie : +1 épuisement si active pendant la rage
    if(isBerserkerT&&p.combatCharges['FrénésieActive']){
      p.exhaustion=Math.min(6,(p.exhaustion||0)+1);
      p.combatCharges['FrénésieActive']=false;
      showToast('💀 Frénésie — +1 niveau d\'épuisement');
    }
    // Magie sauvage : reset sursaut sauvage
    if(isMagieSauvageT)delete p.combatCharges['SursautResult'];
  } else {
    // Entrer en rage — consommer une charge + ajouter résistances
    const cur=p.combatCharges[rageKey]!==undefined?p.combatCharges[rageKey]:rageMax;
    if(cur<=0){showToast('❌ Plus de charges de rage disponibles !');return;}
    p.combatCharges[rageKey]=cur-1;
    p.combatCharges['RageActive']=true;
    p.dmgResistances=p.dmgResistances||[];
    RAGE_RES.forEach(r=>{if(!p.dmgResistances.includes(r))p.dmgResistances.push(r);});
    // Totem Ours : résistances supplémentaires
    if(isTotemT&&totemChoice==='Ours'){
      TOTEM_OURS_RES.forEach(r=>{if(!p.dmgResistances.includes(r))p.dmgResistances.push(r);});
    }
    // Rage aveugle (Berserker niv.6+) : immunité charme/peur → retirer ces conditions
    if(isBerserkerT&&barbareLvl>=6){
      p.conditions=(p.conditions||[]).filter(c=>!['Charmé','Effrayé'].includes(c));
    }
  }
  saveAll();render();
}
function openWildshapeModal(){
  const p=P();const druLvl=((p.classes||[]).find(c=>c.name==='Druide')||{}).level||0;
  const _isLune=(p.features||[]).some(f=>f.name==='Cercle de la lune');
  const crMax=druLvl>=6?Math.floor(druLvl/3):_isLune?1:druLvl>=4?0.5:0.25;const canSwim=druLvl>=4;const canFly=druLvl>=8;
  const fsMax=druLvl>=20?99:2;const fsUsed=(p.combatCharges||{})['Forme sauvage']!==undefined?p.combatCharges['Forme sauvage']:fsMax;
  if(druLvl<20&&fsUsed<=0){showToast('❌ Plus de charges de Forme sauvage !');return;}
  const available=BEAST_FORMS.filter(b=>b.cr<=crMax&&(!b.fly||canFly)&&(!b.swim||canSwim));
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
function wsShowDetail(bIdx){
  const b=BEAST_FORMS[bIdx];if(!b)return;
  const abN=['FOR','DEX','CON','INT','SAG','CHA'];
  document.getElementById('wsGrid').style.display='none';
  document.getElementById('wsDetail').style.display='block';
  document.getElementById('wsDetail').innerHTML=`
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
function enterWildshape(bIdx){
  const p=P();const b=BEAST_FORMS[bIdx];if(!b)return;
  const druLvl=((p.classes||[]).find(c=>c.name==='Druide')||{}).level||0;
  const fsMax=druLvl>=20?99:2;
  if(!p.combatCharges)p.combatCharges={};
  const fsUsed=(p.combatCharges['Forme sauvage']!==undefined)?p.combatCharges['Forme sauvage']:fsMax;
  if(druLvl<20&&fsUsed<=0){showToast('❌ Plus de charges de Forme sauvage !');return;}
  if(druLvl<20)p.combatCharges['Forme sauvage']=fsUsed-1;
  p.wildshape={active:true,beastIdx:bIdx,beast:{name:b.name,icon:b.icon,hpMax:b.hpMax,hpCur:b.hpMax,ac:b.ac,speed:b.speed,ab:[...b.ab],attacks:b.attacks,traits:b.traits},savedHp:p.hp};
  closeModal();saveAll();render();
  showToast(`🐺 ${p.charName||'Druide'} se transforme en ${b.name} ! (${b.hpMax} PV)`);
}
function revertWildshape(){
  const p=P();if(!p.wildshape?.active)return;
  const bName=p.wildshape.beast.name;
  p.hp=p.wildshape.savedHp;
  delete p.wildshape;
  saveAll();render();showToast(`🧝 Retour à la forme de druide. PV restaurés : ${p.hp}/${p.hpMax}`);
}
function openElementalModal(){
  const p=P();const feMax=2;
  const feUsed=(p.combatCharges||{})['FormeElementaire']!==undefined?p.combatCharges['FormeElementaire']:feMax;
  if(feUsed<=0){showToast('❌ Plus de charges de Forme élémentaire !');return;}
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
function feShowDetail(efIdx){
  const ef=ELEMENTAL_FORMS[efIdx];if(!ef)return;
  const abN=['FOR','DEX','CON','INT','SAG','CHA'];
  document.getElementById('feGrid').style.display='none';
  document.getElementById('feDetail').style.display='block';
  document.getElementById('feDetail').innerHTML=`
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
function enterElementalForm(efIdx){
  const p=P();const ef=ELEMENTAL_FORMS[efIdx];if(!ef)return;
  const feMax=2;
  if(!p.combatCharges)p.combatCharges={};
  const feUsed=(p.combatCharges['FormeElementaire']!==undefined)?p.combatCharges['FormeElementaire']:feMax;
  if(feUsed<=0){showToast('❌ Plus de charges de Forme élémentaire !');return;}
  p.combatCharges['FormeElementaire']=feUsed-1;
  p.wildshape={active:true,isElemental:true,beast:{name:ef.name,icon:ef.icon,hpMax:ef.hpMax,hpCur:ef.hpMax,ac:ef.ac,speed:ef.speed,ab:[...ef.ab],attacks:ef.attacks,traits:ef.traits},savedHp:p.hp};
  closeModal();saveAll();render();
  showToast(`🌊 ${p.charName||'Druide'} se transforme en ${ef.name} ! (${ef.hpMax} PV)`);
}
// ── FAMILIER ──
function openFamiliarModal(){
  const p=P();const fam=p.familiar;
  openWideModal(`<div class="pt">🦉 Configurer un familier</div>
    <div style="font-size:11px;color:var(--text3);margin-bottom:10px">Familiers classiques (Trouver un familier) et Pacte de la Chaîne (Occultiste niv.3). Choisissez un type SRD ou modifiez ses PV/CA librement après.</div>
    <div id="famGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:6px;max-height:38vh;overflow-y:auto;margin-bottom:10px">
      ${FAMILIAR_TYPES.map((f,i)=>`<div onclick="famShowDetail(${i})" style="background:var(--surface2);border:1px solid ${fam&&fam.name===f.name?'var(--cp)':'var(--border)'};border-radius:8px;padding:8px 6px;cursor:pointer;text-align:center;transition:all .15s" onmouseover="this.style.borderColor='var(--cp)'" onmouseout="this.style.borderColor='${fam&&fam.name===f.name?'var(--cp)':'var(--border)'}'">
        <div style="font-size:22px;margin-bottom:3px">${f.icon}</div>
        <div style="font-size:10px;font-weight:600;line-height:1.2">${f.name}</div>
        <div style="font-size:9px;color:var(--text3);margin-top:2px">${f.attacks.length?'⚔ Attaque':'🕊 Passif'}</div>
      </div>`).join('')}
    </div>
    <div id="famDetail" style="min-height:80px"></div>
    <div style="display:flex;justify-content:flex-end;margin-top:10px;gap:8px">
      ${fam?`<button class="btn bsm bdanger" onclick="removeFamiliar()">Supprimer</button>`:''}
      <button class="btn bsm" onclick="closeModal()">Annuler</button>
    </div>`);
  if(fam){const idx=FAMILIAR_TYPES.findIndex(f=>f.name===fam.name);if(idx>=0)famShowDetail(idx);}
}
function famShowDetail(idx){
  const f=FAMILIAR_TYPES[idx];const el=document.getElementById('famDetail');if(!el)return;
  el.innerHTML=`<div style="background:rgba(200,168,75,.06);border:1px solid rgba(200,168,75,.2);border-radius:10px;padding:12px">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
      <span style="font-size:30px">${f.icon}</span>
      <div><div style="font-size:14px;font-weight:700;color:var(--cp)">${f.name}</div><div style="font-size:11px;color:var(--text3)">PV ${f.hp} • CA ${f.ac} • ${f.speed}</div></div>
    </div>
    <div class="g6 mb8">${ABILITIES_SH.map((ab,i)=>`<div class="sb" style="padding:3px"><div class="sn" style="font-size:9px">${ab}</div><div style="font-size:13px;font-weight:600">${f.ab[i]}</div><div class="sm" style="font-size:9px">${fmt(Math.floor((f.ab[i]-10)/2))}</div></div>`).join('')}</div>
    ${f.attacks.length?`<div style="margin-bottom:8px"><div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Attaques</div>${f.attacks.map(a=>`<div style="font-size:12px;color:var(--text2);padding:2px 0">${a.name} : <strong>+${a.bonus}</strong> / ${a.dmg} ${a.type}${a.special?` • <em style="font-size:11px">${a.special}</em>`:''}</div>`).join('')}</div>`:''}
    ${f.traits.length?`<div style="margin-bottom:10px"><div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Traits</div>${f.traits.map(t=>`<div style="font-size:11px;color:var(--text2);padding:2px 0">▹ ${t}</div>`).join('')}</div>`:''}
    <button class="btn bac" style="width:100%;margin-top:4px" onclick="setFamiliar(${idx})">🦉 Convoquer ce familier</button>
  </div>`;
}
function setFamiliar(idx){
  const p=P();const f=FAMILIAR_TYPES[idx];
  p.familiar={name:f.name,icon:f.icon,hpMax:f.hp,hpCur:f.hp,ac:f.ac,speed:f.speed,ab:[...f.ab],attacks:f.attacks.map(a=>({...a})),traits:[...f.traits],active:true};
  closeModal();saveAll();render();showToast(`🦉 ${f.name} convoqué !`);
}
function revokeFamiliar(){
  const p=P();if(!p.familiar)return;
  p.familiar.active=false;saveAll();render();showToast('🦉 Familier renvoyé dans le plan éthéré.');
}
function recallFamiliar(){
  const p=P();if(!p.familiar)return;
  p.familiar.hpCur=p.familiar.hpMax;p.familiar.active=true;
  saveAll();render();showToast(`🦉 ${p.familiar.name} reconvoqué !`);
}
function removeFamiliar(){
  const p=P();delete p.familiar;closeModal();saveAll();render();showToast('🦉 Familier supprimé.');
}
function applyFamiliarHp(sign){
  const p=P();const fam=p.familiar;if(!fam?.active)return;
  const delta=parseInt(document.getElementById('famHpDelta')?.value)||0;if(delta<=0)return;
  if(sign<0){
    fam.hpCur=Math.max(0,fam.hpCur-delta);
    if(fam.hpCur<=0){fam.active=false;showToast('💀 Le familier tombe à 0 PV et se dissipe !');}
  } else {
    fam.hpCur=Math.min(fam.hpMax,fam.hpCur+delta);
  }
  saveAll();render();
}
// ── COMPAGNON ANIMAL (Rôdeur — Maître des bêtes) ──
function openBeastCompanionModal(){
  const rodeurLvl=((P().classes||[]).find(c=>c.name==='Rôdeur')||{}).level||1;
  const hpMax=5*rodeurLvl;
  openWideModal(`<div class="pt">🐾 Choisir un compagnon animal</div>
    <div style="font-size:12px;color:var(--text3);margin-bottom:12px">PV du compagnon = 5 × niveau Rôdeur (${hpMax} PV). Choisissez la forme de base :</div>
    <div class="crd-grid">${BEAST_FORMS.map((b,i)=>`<div class="crd" onclick="bcShowDetail(${i},${hpMax})" style="text-align:center">
      <div style="font-size:30px">${b.icon}</div>
      <h3>${b.name}</h3>
      <span class="tag">CA ${b.ac}</span>
      <span class="tag">CR ${b.crD}</span>
    </div>`).join('')}</div>`);
}
function bcShowDetail(idx,hpMax){
  const b=BEAST_FORMS[idx];
  const pb2=Math.ceil((hpMax/5)/4)+1; // rough PB based on level estimate
  openWideModal(`<div class="pt">🐾 ${b.name}</div>
    <div style="text-align:center;font-size:48px;margin:8px 0">${b.icon}</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0">
      <div class="sb hi"><div class="sn">PV (max)</div><div style="font-size:18px;font-weight:700;color:var(--cp)">${hpMax}</div></div>
      <div class="sb hi"><div class="sn">CA</div><div style="font-size:18px;font-weight:700">${b.ac}</div></div>
      <div class="sb hi"><div class="sn">Vitesse</div><div style="font-size:14px;font-weight:600">${b.speed}</div></div>
    </div>
    <div style="font-size:12px;color:var(--text3);margin-bottom:8px">⚔ Attaques (avec Bonus de Maîtrise ajouté) — Action bonus du Rôdeur :</div>
    ${b.attacks.map(a=>`<div style="padding:6px;background:var(--surface2);border-radius:6px;margin-bottom:4px;font-size:12px">
      <strong>${a.name}</strong> : +${a.bonus} att. · <strong>${a.dmg}</strong> ${a.type}${a.special?`<div style="font-size:10px;color:var(--text3)">${a.special}</div>`:''}
    </div>`).join('')}
    ${b.traits.length?`<div style="font-size:11px;color:var(--text3);margin-top:8px">${b.traits.map(t=>`▹ ${t}`).join('<br>')}</div>`:''}
    <button class="btn bac" style="width:100%;margin-top:14px" onclick="setBeastCompanion(${idx})">🐾 Choisir ce compagnon</button>
    <button class="btn bsm" style="width:100%;margin-top:6px" onclick="openBeastCompanionModal()">← Retour</button>`);
}
function setBeastCompanion(idx){
  const p=P();const b=BEAST_FORMS[idx];
  const rodeurLvl=((p.classes||[]).find(c=>c.name==='Rôdeur')||{}).level||1;
  const hpMax=5*rodeurLvl;
  p.beastCompanion={name:b.name,icon:b.icon,hpMax,hpCur:hpMax,ac:b.ac,speed:b.speed,ab:[...b.ab],attacks:b.attacks.map(a=>({...a})),traits:[...b.traits],active:true};
  closeModal();saveAll();render();showToast(`🐾 ${b.name} est maintenant ton compagnon !`);
}
function removeBeastCompanion(){
  const p=P();delete p.beastCompanion;closeModal();saveAll();render();showToast('🐾 Compagnon retiré.');
}
function applyBeastCompanionHp(sign){
  const p=P();const bc=p.beastCompanion;if(!bc?.active)return;
  const delta=parseInt(document.getElementById('bcHpDelta')?.value)||0;if(delta<=0)return;
  if(sign<0){bc.hpCur=Math.max(0,bc.hpCur-delta);if(bc.hpCur<=0){bc.active=false;showToast('💀 Le compagnon tombe à 0 PV !');}}
  else{bc.hpCur=Math.min(bc.hpMax,bc.hpCur+delta);}
  saveAll();render();
}
function recallBeastCompanion(){
  const p=P();if(!p.beastCompanion)return;
  const rodeurLvl=((p.classes||[]).find(c=>c.name==='Rôdeur')||{}).level||1;
  p.beastCompanion.hpMax=5*rodeurLvl;p.beastCompanion.hpCur=p.beastCompanion.hpMax;p.beastCompanion.active=true;
  saveAll();render();showToast(`🐾 ${p.beastCompanion.name} revient (PV max mis à jour) !`);
}
function rollChatimentDivin(slotLvl){
  const p=P();const isCrit=document.getElementById('smiteCritCheck')?.checked||false;
  const dice=Math.min(5,slotLvl+1);const numDice=isCrit?dice*2:dice;
  const rolls=Array.from({length:numDice},()=>Math.ceil(Math.random()*8));
  const total=rolls.reduce((s,v)=>s+v,0);
  if(!p.spellSlotsUsed)p.spellSlotsUsed=[];
  while(p.spellSlotsUsed.length<slotLvl)p.spellSlotsUsed.push(0);
  p.spellSlotsUsed[slotLvl-1]=(p.spellSlotsUsed[slotLvl-1]||0)+1;
  _markUnsaved();
  showToast(`⚡ Châtiment divin — Niv.${slotLvl} : ${rolls.join('+')} = <strong style="color:#ffd54f;font-size:15px">${total}</strong> dégâts radiants${isCrit?' 🎉 CRITIQUE':''}`,4000);
  render();
}
function _spendImpositionMains(amount){const p=P();const mx=((p.classes||[]).find(c=>c.name==='Paladin')||{}).level*5||0;if(!p.combatCharges)p.combatCharges={};const cur=p.combatCharges['ImpositionMains']!==undefined?p.combatCharges['ImpositionMains']:mx;if(cur<amount){showToast('❌ Pas assez de PV dans le réservoir !');return;}p.combatCharges['ImpositionMains']=cur-amount;render();}
function _restoreImpositionMains(){const p=P();const mx=((p.classes||[]).find(c=>c.name==='Paladin')||{}).level*5||0;if(!p.combatCharges)p.combatCharges={};p.combatCharges['ImpositionMains']=mx;render();}
function toggleDraconicBreath(){const p=P();if(!p.combatCharges)p.combatCharges={};if(p.combatCharges['SouffleDraconique'])delete p.combatCharges['SouffleDraconique'];else p.combatCharges['SouffleDraconique']=true;saveAll();render();}
function toggleSlot(ni,si,total){const p=P();if(!p.spellSlotsUsed)p.spellSlotsUsed=[];const u=p.spellSlotsUsed[ni]||0;p.spellSlotsUsed[ni]=u>si?u-1:Math.min(total,u+1);render();}
function toggleWarlockSlot(si,total){const p=P();if(!p.spellSlotsUsed)p.spellSlotsUsed=[];const u=p.spellSlotsUsed[9]||0;p.spellSlotsUsed[9]=u>si?u-1:Math.min(total,u+1);render();}
function toggleKi(idx,max){const p=P();if(!p.combatCharges)p.combatCharges={};const cur=p.combatCharges['Ki']!==undefined?p.combatCharges['Ki']:max;p.combatCharges['Ki']=idx<cur?idx:Math.min(max,idx+1);_markUnsaved();render();}
function toggleSorcPts(idx,max){const p=P();if(!p.combatCharges)p.combatCharges={};const cur=p.combatCharges['SorcelleriePts']!==undefined?p.combatCharges['SorcelleriePts']:max;p.combatCharges['SorcelleriePts']=idx<cur?idx:Math.min(max,idx+1);render();}
function sorcCreateSlot(niv,cout,max){const p=P();if(!p.combatCharges)p.combatCharges={};const cur=p.combatCharges['SorcelleriePts']!==undefined?p.combatCharges['SorcelleriePts']:max;if(cur<cout){showToast('❌ Pas assez de points ('+cout+' requis)');return;}p.combatCharges['SorcelleriePts']=cur-cout;if(!p.spellSlotsUsed)p.spellSlotsUsed=[];p.spellSlotsUsed[niv-1]=Math.max(0,(p.spellSlotsUsed[niv-1]||1)-1);render();showToast('✓ Emplacement niv.'+niv+' créé (−'+cout+' pts)');}
function rollAttack(name,bonus,dmg,slot,dmgBonus=0){
  const atk=Math.ceil(Math.random()*20);
  const total=atk+bonus;
  const isCrit=atk===20;const isFumble=atk===1;
  const col=isCrit?'#ffd54f':isFumble?'#e53935':'var(--cp)';
  let dmgHtml='';
  if(!isFumble){
    const m=(dmg+'').match(/(\d+)d(\d+)([+-]\d+)?/);
    if(m){
      const dq=parseInt(m[1]),ds=parseInt(m[2]),fixedBonus=(m[3]?parseInt(m[3]):0)+(dmgBonus||0);
      const numDice=isCrit?dq*2:dq;
      const rolls=[];for(let i=0;i<numDice;i++)rolls.push(Math.ceil(Math.random()*ds));
      const totalDmg=rolls.reduce((s,v)=>s+v,0)+fixedBonus;
      const typeMatch=(dmg+'').match(/\d+d\d+[+-]?\d*\s+(.*)/);
      const dmgType=typeMatch?typeMatch[1].trim():'';
      dmgHtml=`<div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.1);font-size:13px">Dégâts : <span style="color:var(--text2)">${rolls.join('+')}${fixedBonus?fmt(fixedBonus):''}</span> = <b style="color:var(--cp);font-size:17px">${totalDmg}</b>${dmgType?` <span style="font-size:11px;color:var(--text3)">${esc(dmgType)}${isCrit?' (critique — dés doublés)':''}</span>`:''}</div>`;
    }
  }
  _lastRollResultHtml=`<div>⚔ ${esc(name)} — d20(${atk})${fmt(bonus)} = <span style="font-size:20px;color:${col};font-weight:800">${total}</span>${isCrit?' 🎉 CRITIQUE!':isFumble?' 💀 FUMBLE!':''}</div>${dmgHtml}`;
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
function rollSave(ab,m){const r=Math.ceil(Math.random()*20);showToast(`JS ${ab}: d20(${r}) ${fmt(m)} = <strong>${r+m}</strong>${r===20?' 🎉':r===1?' 💀':''}`);}

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
  if(!spells.length)return`<div style="font-size:12px;color:var(--text3);font-style:italic;padding:8px">Aucun sort enregistré.</div>`;
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
    // En mode combat, on filtre : cantrips toujours visibles, niveaux 1+ seulement si préparé (ou classe "connaît")
    if(combatOnly && lv>0 && prepCaster && !s.prepared) return;
    if(!byLvl[lv])byLvl[lv]=[];
    byLvl[lv].push({...s,data,stableId:'spl_'+s.name.replace(/[^a-zA-Z0-9]/g,'_')});
  });
  if(!Object.keys(byLvl).length)return`<div style="font-size:12px;color:var(--text3);font-style:italic;padding:8px">Aucun sort préparé.</div>`;
  const STAR_COLORS=['#ffd700','#4fc3f7','#81c784','#ff8a65','#ba68c8','#f06292','#4db6ac','#ff7043','#e57373','#ce93d8'];
  return Object.keys(byLvl).sort((a,b)=>a-b).map(lv=>{
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
        return`
        <div class="sort-row">
          <div class="sort-head" onclick="document.getElementById('${s.stableId}').classList.toggle('open')">
            <div style="flex:1">
              <div style="font-size:13px;font-weight:600;${!isPrepared?'color:var(--text3)':''}">${esc(s.name)}${ritual?' <span style="font-size:10px;color:var(--cp)">(R)</span>':''}${isPrepared&&lvi>0&&prepCaster?'  <span style="font-size:9px;background:rgba(76,175,80,.15);color:#4caf50;border-radius:8px;padding:1px 5px">Préparé</span>':''}</div>
              ${d?`<div style="font-size:11px;color:var(--text3)">${esc(school)}${castTime?' • '+esc(castTime):''}${range?' • '+esc(range):''}</div>`:''}
            </div>
            ${damage?`<span style="font-size:11px;color:var(--cp);margin-right:6px">${esc(damage)}</span>`:''}
            ${combatOnly&&(damage||d&&d.savingThrow)?`<button class="btn bac bsm" style="flex-shrink:0;margin-right:6px" onclick="event.stopPropagation();rollSpellPlayer('${esc(s.name)}','${esc(damage||'')}','${esc(d&&d.savingThrow||'')}')">🎲</button>`:''}
            ${!combatOnly&&prepCaster&&lvi>0?`<button class="btn bsm" style="margin-right:6px;${isPrepared?'background:rgba(76,175,80,.15);color:#4caf50;border-color:#4caf50':''}" onclick="event.stopPropagation();togglePrepareSpell('${esc(s.name)}')">${isPrepared?'✓ Prêt':'Préparer'}</button>`:''}
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
// TAB: SORTS
// ═══════════════════════════════════════
let _sortSubTab = 'mes-sorts'; // 'mes-sorts' | 'compendium' | 'apprendre'
let _learnSpellSearch = {q:'',school:''};

function tabSorts(p){
  const hasCaster = (p.classes||[{name:p.classe,level:p.niveau||1}]).some(c=>{
    const d=SRD.classes.find(x=>x.name===c.name); return d&&d.spellcaster;
  });
  if(!hasCaster) return`<div class="panel"><p style="color:var(--text3);font-size:13px">Cette classe n'est pas une classe de sorts.</p></div>`;

  const userIsMJ = isMJ(); // via mjMode — sera connecté aux rôles Firebase
  const magLvl = ((p.classes||[]).find(c=>c.name==='Magicien')||{}).level||0;
  const prepCaster = isPrepCaster(p);

  // Sous-tabs
  const hasMultiSubs=userIsMJ||magLvl>0;
  if(!hasMultiSubs)_sortSubTab='mes-sorts';
  const subBar = hasMultiSubs?`<div style="display:flex;gap:6px;margin-bottom:12px">
    <button class="btn${_sortSubTab==='mes-sorts'?' bprimary':''}" onclick="_sortSubTab='mes-sorts';render()" style="flex:1">📖 Mes sorts</button>
    ${userIsMJ?`<button class="btn${_sortSubTab==='compendium'?' bprimary':''}" onclick="_sortSubTab='compendium';render()" style="flex:1">📚 Ajouter (MJ)</button>`:''}
    ${magLvl?`<button class="btn${_sortSubTab==='apprendre'?' bprimary':''}" onclick="_sortSubTab='apprendre';render()" style="flex:1">📜 Apprendre</button>`:''}
  </div>`:'';

  const isConcentrating=(p.statuses||[]).some(s=>s.name==='Concentration');
  const _concMC=mainClass(p);const _concHasCON=(CLASS_SAVES[_concMC?_concMC.name:'']||[]).includes(2);
  const _lvlC=totalLevel(p);
  const conSaveBonus=mod(p.abilities?p.abilities[2]:10)+(_concHasCON?pb(_lvlC):0);
  const conSaveLabel=`JS CON ${fmt(conSaveBonus)}${_concHasCON?' (maîtrise incluse)':''}`;
  const concSpell=p.concentrationSpell||'';
  const concBtn=isConcentrating?`<div style="background:var(--surface2);border:2px solid #ffd54f;border-radius:10px;padding:12px;margin-bottom:10px">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
      <span style="font-size:18px">🎯</span>
      <div style="flex:1"><div style="font-size:13px;font-weight:700;color:#ffd54f">Concentration</div>${concSpell?`<div style="font-size:12px;color:var(--text2);margin-top:1px">${esc(concSpell)}</div>`:''}</div>
      <button class="btn bsm" style="font-size:11px" onclick="toggleConcentration()">✕ Briser</button>
    </div>
    <div style="font-size:11px;color:var(--text3);margin-bottom:10px;line-height:1.5">Si tu subis des dégâts, lance un <strong style="color:var(--text2)">JS CON</strong> (DD = max 10 ou moitié des dégâts reçus). Échec = concentration brisée automatiquement.</div>
    <div style="display:flex;gap:6px;align-items:center">
      <input type="number" id="concDmgInput" placeholder="Dégâts reçus" min="0" style="flex:1;padding:7px 10px;background:var(--surface);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px">
      <button class="btn bac" style="white-space:nowrap;font-size:13px" onclick="rollConcSave(parseInt(document.getElementById('concDmgInput')?.value)||0)">🎲 ${conSaveLabel}</button>
    </div>
  </div>`:`<div style="display:flex;gap:6px;margin-bottom:10px"><input id="concSpellInput" placeholder="Sort de concentration (optionnel)…" style="flex:1;padding:7px 10px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px"><button class="btn" style="white-space:nowrap;font-size:13px" onclick="activateConcentration()">🎯 Concentrer</button></div>`;

  if(_sortSubTab === 'compendium' && userIsMJ){
    return`<div>${subBar}${renderCompendiumSearch(p)}</div>`;
  }

  if(_sortSubTab === 'apprendre' && magLvl){
    return`<div>${subBar}${renderLearnSpell(p, magLvl)}</div>`;
  }

  // Sous-tab "Mes sorts"
  const allSpells = p.spells||[];
  const knownCount = allSpells.length;
  let prepInfo = '';
  if(prepCaster){
    const intM = p.abilities ? Math.floor((p.abilities[3]-10)/2) : 0;
    const sagM = p.abilities ? Math.floor((p.abilities[4]-10)/2) : 0;
    const chaM = p.abilities ? Math.floor((p.abilities[5]-10)/2) : 0;
    const lvl = (p.classes||[]).reduce((sum,c)=>sum+c.level,0);
    const magC = (p.classes||[]).find(c=>c.name==='Magicien');
    const clericC = (p.classes||[]).find(c=>c.name==='Clerc');
    const druidC = (p.classes||[]).find(c=>c.name==='Druide');
    const paladinC = (p.classes||[]).find(c=>c.name==='Paladin');
    const artificerC = (p.classes||[]).find(c=>c.name==='Artificier');
    let prepMax = 1;
    if(magC) prepMax = Math.max(1, intM + magC.level);
    else if(clericC) prepMax = Math.max(1, sagM + clericC.level);
    else if(druidC) prepMax = Math.max(1, sagM + druidC.level);
    else if(paladinC) prepMax = Math.max(1, chaM + Math.ceil(paladinC.level/2));
    else if(artificerC) prepMax = Math.max(1, intM + Math.ceil(artificerC.level/2));
    const prepCount = allSpells.filter(s=>{const sp=findSpellData(s.name);return s.prepared&&sp&&sp.level>0;}).length;
    prepInfo = `<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:8px;font-size:12px">
      <span style="color:var(--text2)">Sorts préparés :</span>
      <strong style="color:${prepCount>prepMax?'#e53935':'#4caf50'};font-size:14px">${prepCount}/${prepMax}</strong>
      <span style="color:var(--text3);font-size:11px">(Cliquez sur un sort pour le préparer / retirer)</span>
    </div>`;
  }

  // Emplacements de sorts dans l'onglet Sorts
  const slots=calcSpellSlots(p);const slotsUsed=p.spellSlotsUsed||[];
  const warlockSlots=getWarlockSlots(p);
  const slotHtml=(()=>{
    if(warlockSlots){
      return`<div style="margin-bottom:10px;padding:10px;background:var(--surface2);border-radius:8px">
        <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Magie de pacte — Niv.${warlockSlots[1]}</div>
        <div style="display:flex;align-items:center;gap:8px">
          <div style="display:flex;gap:4px">${Array.from({length:warlockSlots[0]},(_,si)=>`<span class="slot-bubble${si<(slotsUsed[9]||0)?' used':''}" onclick="toggleWarlockSlot(${si},${warlockSlots[0]})" style="width:16px;height:16px"></span>`).join('')}</div>
          <span style="font-size:11px;color:var(--text3)">${warlockSlots[0]-(slotsUsed[9]||0)}/${warlockSlots[0]}</span>
          <button class="btn bsm" onclick="P().spellSlotsUsed=P().spellSlotsUsed||[];P().spellSlotsUsed[9]=0;render()">↺</button>
        </div>
      </div>`;
    }
    if(!slots)return'';
    const rows=slots.map((total,ni)=>total?`<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
      <span style="font-size:11px;color:var(--text2);width:46px">Niv. ${ni+1}</span>
      <div>${Array.from({length:total},(_,si)=>`<span class="slot-bubble${si<(slotsUsed[ni]||0)?' used':''}" onclick="toggleSlot(${ni},${si},${total})"></span>`).join('')}</div>
      <span style="font-size:10px;color:var(--text3)">${total-(slotsUsed[ni]||0)}/${total}</span>
    </div>`:''). join('');
    return`<div style="margin-bottom:10px;padding:10px;background:var(--surface2);border-radius:8px">
      <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Emplacements de sorts</div>
      ${rows}
      <button class="btn bsm" style="margin-top:4px" onclick="upd('spellSlotsUsed',[]);render()">↺ Récupérer tous (repos long)</button>
    </div>`;
  })();
  return`<div>
    ${subBar}
    ${concBtn}
    <div class="panel">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <div class="pt" style="margin-bottom:0">Mes sorts (${knownCount})</div>
      </div>
      ${slotHtml}
      ${prepInfo}
      ${renderSpellList(p, false)}
    </div>
  </div>`;
}

function renderLearnSpell(p, magLvl){
  const cur = p.currency||{po:0};
  const knownNames = (p.spells||[]).map(s=>s.name);
  const db = getSpellsDB();
  const isLoaded = !!SPELLS_DB;
  const schools = isLoaded ? [...new Set(SPELLS_DB.map(s=>s.school).filter(Boolean))].sort() : [];
  const results = isLoaded
    ? searchSpellsDB(_learnSpellSearch.q,'Magicien',null,_learnSpellSearch.school||null)
        .filter(s=>s.level>0 && !knownNames.includes(s.name))
        .slice(0,50)
    : [];

  return`<div>
    <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:12px">
      <div style="font-size:13px;font-weight:600;color:var(--cp);margin-bottom:4px">📜 Copier un sort dans votre grimoire</div>
      <div style="font-size:12px;color:var(--text3)">Coût : 2h + <strong>50 po par niveau du sort</strong> — Tous les sorts Magicien disponibles</div>
      <div style="font-size:12px;color:var(--text2);margin-top:4px">Votre trésor actuel : <strong style="color:var(--cp)">${cur.po||0} po</strong></div>
    </div>
    ${!isLoaded?`<div style="text-align:center;padding:16px"><button class="btn bprimary" onclick="loadSpellsDB(()=>render())">⬇️ Charger le compendium</button></div>`:`
      <div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap">
        <input type="text" placeholder="🔍 Rechercher..." value="${esc(_learnSpellSearch.q)}"
          oninput="_learnSpellSearch.q=this.value;render()"
          style="flex:2;min-width:140px;padding:7px 10px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px">
        <select onchange="_learnSpellSearch.school=this.value;render()"
          style="flex:1;min-width:100px;padding:7px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:12px">
          <option value="">Toutes écoles</option>
          ${schools.map(sc=>`<option value="${sc}"${_learnSpellSearch.school===sc?' selected':''}>${sc}</option>`).join('')}
        </select>
      </div>
      <div style="font-size:11px;color:var(--text3);margin-bottom:8px">${results.length} sort(s) disponible(s) à copier</div>
      <div style="max-height:400px;overflow-y:auto">
        ${results.map(s=>{
          const cost = s.level * 50;
          const canAfford = (cur.po||0) >= cost;
          return`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:8px 10px;margin-bottom:5px;display:flex;align-items:center;gap:8px">
            <div style="flex:1;min-width:0">
              <div style="font-size:13px;font-weight:600">${esc(s.name)}</div>
              <div style="font-size:11px;color:var(--text3)">Niv.${s.level} • ${esc(s.school)} • ${esc(s.castTime)}</div>
              <div style="font-size:11px;color:${canAfford?'#4caf50':'#e53935'};margin-top:2px">${cost} po — ${canAfford?'✓ Fonds suffisants':'✗ Fonds insuffisants'}</div>
            </div>
            <button class="btn bsm${canAfford?' bprimary':''}" onclick="learnSpell('${esc(s.name)}',${s.level},${cost})" ${canAfford?'':'disabled'}>Copier</button>
          </div>`;
        }).join('')}
      </div>
    `}
  </div>`;
}

function learnSpell(name, level, cost){
  const p = P();
  const cur = p.currency||{pc:0,pa:0,pe:0,po:0,pp:0};
  if((cur.po||0) < cost){
    showToast(`❌ Fonds insuffisants ! Il vous faut ${cost} po (vous avez ${cur.po||0} po)`);
    return;
  }
  if(!p.spells)p.spells=[];
  if(p.spells.find(s=>s.name===name)){showToast('Ce sort est déjà dans votre grimoire.');return;}
  p.spells.push({name,prepared:false,level});
  if(!p.currency)p.currency={pc:0,pa:0,pe:0,po:0,pp:0};
  p.currency.po = (p.currency.po||0) - cost;
  saveAll();render();
  showToast(`✅ "${name}" copié dans votre grimoire ! −${cost} po (2h de travail)`);
}

// ═══════════════════════════════════════
// COMPENDIUM SEARCH PANEL
// ═══════════════════════════════════════
let _spellSearch={q:'',cls:'',lvl:'',school:''};
let _luSpellSearch='';

function renderCompendiumSearch(p){
  const db = getSpellsDB();
  const isLoaded = !!SPELLS_DB;
  const cls = p.classe||'';
  const results = isLoaded ? searchSpellsDB(_spellSearch.q, _spellSearch.cls||null, _spellSearch.lvl!==''?_spellSearch.lvl:null, _spellSearch.school||null).slice(0,50) : [];
  const schools = isLoaded ? [...new Set(SPELLS_DB.map(s=>s.school).filter(Boolean))].sort() : [];
  const knownNames = (p.spells||[]).map(s=>s.name);

  return`<div>
    ${!isLoaded?`
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:16px;text-align:center;margin-bottom:12px">
        <div style="font-size:14px;font-weight:600;color:var(--cp);margin-bottom:6px">📚 Compendium de sorts</div>
        <div style="font-size:12px;color:var(--text3);margin-bottom:12px">1213 sorts disponibles. Placez <strong>spells_db.json</strong> dans le même dossier que la fiche.</div>
        <button class="btn bprimary" onclick="loadSpellsDB(()=>render())">⬇️ Charger le compendium</button>
      </div>
    `:`
      <div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap">
        <input type="text" placeholder="🔍 Rechercher un sort..." value="${esc(_spellSearch.q)}"
          oninput="_spellSearch.q=this.value;render()"
          style="flex:2;min-width:140px;padding:7px 10px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px">
        <select onchange="_spellSearch.cls=this.value;render()"
          style="flex:1;min-width:100px;padding:7px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:12px">
          <option value="">Toutes classes</option>
          ${['Barbare','Barde','Clerc','Druide','Guerrier','Moine','Paladin','Rôdeur','Roublard','Ensorceleur','Occultiste','Magicien','Artificier'].map(c=>`<option value="${c}"${_spellSearch.cls===c?' selected':''}>${c}</option>`).join('')}
        </select>
        <select onchange="_spellSearch.lvl=this.value;render()"
          style="padding:7px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:12px">
          <option value="">Tous niveaux</option>
          ${[0,1,2,3,4,5,6,7,8,9].map(n=>`<option value="${n}"${_spellSearch.lvl==n?' selected':''}>${n===0?'Cantrips':'Niv.'+n}</option>`).join('')}
        </select>
        <select onchange="_spellSearch.school=this.value;render()"
          style="padding:7px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:12px">
          <option value="">Toutes écoles</option>
          ${schools.map(sc=>`<option value="${sc}"${_spellSearch.school===sc?' selected':''}>${sc}</option>`).join('')}
        </select>
      </div>
      <div style="font-size:11px;color:var(--text3);margin-bottom:8px">${results.length} résultat(s) ${results.length===50?'(50 max — affinez la recherche)':''}</div>
      <div style="max-height:420px;overflow-y:auto">
        ${results.map(s=>{
          const already = knownNames.includes(s.name)||knownNames.includes(s.nameEN);
          return`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:8px 10px;margin-bottom:5px;display:flex;align-items:center;gap:8px">
            <div style="flex:1;min-width:0">
              <div style="font-size:13px;font-weight:600;color:${already?'var(--cp)':'var(--text)'}">${esc(s.name)}${s.ritual?' <span style="font-size:10px;color:var(--cp)">(R)</span>':''}</div>
              <div style="font-size:11px;color:var(--text3)">${s.level===0?'Cantrip':'Niv.'+s.level} • ${esc(s.school)} • ${esc(s.castTime)} • ${esc(s.range)}</div>
              <div style="font-size:11px;color:var(--text3);margin-top:2px">${s.classes.join(', ')}</div>
            </div>
            ${already
              ? `<button class="btn bsm bdanger" onclick="removeSpellFromChar('${esc(s.name)}')">Retirer</button>`
              : `<button class="btn bsm bprimary" onclick="addSpellToChar('${esc(s.name)}')">+ Ajouter</button>`
            }
          </div>`;
        }).join('')}
      </div>
      <div style="margin-top:8px;text-align:right">
        <button class="btn bsm" onclick="clearSpellsCache();render()" style="font-size:10px;color:var(--text3)">🗑 Vider le cache</button>
      </div>
    `}
  </div>`;
}

function addSpellToChar(name){
  const p=P();
  if(!p.spells)p.spells=[];
  const data=findSpellData(name);
  if(!p.spells.find(s=>s.name===name)){
    p.spells.push({name,prepared:false,level:data?data.level:0});
    saveAll();render();
    showToast('✅ '+name+' ajouté !');
  }
}

function removeSpellFromChar(name){
  const p=P();
  if(!p.spells)return;
  p.spells=p.spells.filter(s=>s.name!==name);
  saveAll();render();
  showToast('🗑 '+name+' retiré.');
}

// ═══════════════════════════════════════
// TAB: ÉQUIPEMENT
// ═══════════════════════════════════════
function tabEquipement(p){
  const eq=p.equip||{};
  const slotHtml=s=>{const item=eq[s.id];const isMagic=item&&item.magic;return`<div class="eq-slot${item?' filled':''}${isMagic?' magic-slot':''}" style="${isMagic?'border-color:#9b59b6':''}" onclick="openEquipSlot('${s.id}')">
    <div class="eq-slot-label">${s.icon} ${s.label}</div>
    ${item?`<div class="eq-slot-item">${esc(item.name)}${isMagic?' ✨':''}</div><button class="btn bsm" onclick="event.stopPropagation();unequipSlot('${s.id}')" style="width:100%;margin-top:4px;color:#e53935;border-color:rgba(229,57,53,.3);font-size:10px;padding:2px 0">✕ Retirer</button>`:`<div class="eq-slot-empty">Vide</div>`}
  </div>`;};
  const left=[{id:'head',label:'Tête',icon:'🪖'},{id:'shoulders',label:'Épaules',icon:'🧥'},{id:'chest',label:'Torse',icon:'🛡'},{id:'hands',label:'Mains',icon:'🧤'},{id:'legs',label:'Jambes',icon:'👖'}];
  const right=[{id:'neck',label:'Cou',icon:'📿'},{id:'ring1',label:'Anneau G',icon:'💍'},{id:'ring2',label:'Anneau D',icon:'💍'},{id:'waist',label:'Ceinture',icon:'🪢'},{id:'feet',label:'Pieds',icon:'👢'}];
  const weapons=[{id:'mainhand',label:'Main droite',icon:'⚔️'},{id:'offhand',label:'Main gauche',icon:'🗡️'},{id:'ranged',label:'Distance',icon:'🏹'}];
  const eqImg=p.equipPortrait||p.portrait;

  // Maîtrises armes & armures
  const allWeapons=[...SRD.weapons];
  const allArmors=[...SRD.armors];
  const wProfs=p.weaponProfs||[];const aProfs=p.armorProfs||[];

  return`<div>
    <div class="eq-layout">
      <div class="eq-col">${left.map(slotHtml).join('')}</div>
      <div>
        <div class="eq-portrait" onclick="document.getElementById('eqEquipImgInput').click()" title="Image d'équipement (indépendante du portrait)">${eqImg?`<img src="${eqImg}">`:`<div class="eq-portrait-hint">📷<br>Image<br>Cliquer</div>`}</div>
        <input type="file" id="eqEquipImgInput" accept="image/jpeg,image/png,image/gif" style="display:none" onchange="uploadEquipPortrait(this)">
        ${eqImg?`<button class="btn bsm bdanger" style="width:100%;margin-top:4px" onclick="upd('equipPortrait',null);render()">Supprimer</button>`:''}
        <div style="margin-top:8px">${slotHtml({id:'back',label:'Cape/Dos',icon:'🧣'})}</div>
      </div>
      <div class="eq-col">${right.map(slotHtml).join('')}</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px">${weapons.map(slotHtml).join('')}</div>

    <!-- Maîtrises armes & armures -->
    <div class="g2" style="gap:10px">
      <div class="panel">
        <div class="pt" style="display:flex;align-items:center;justify-content:space-between;cursor:pointer" onclick="_equipProfOpen.w=!_equipProfOpen.w;render()">
          <span>Maîtrises d'armes</span>
          <span style="display:flex;align-items:center;gap:8px">${isMJ()?`<span style="font-size:10px;color:var(--cp)">🎲 toggle</span>`:''}<span style="font-size:11px;color:var(--text3)">${_equipProfOpen.w?'▴':'▾'}</span></span>
        </div>
        ${_equipProfOpen.w?allWeapons.map(w=>{
          const prof=wProfs.some(pr=>pr.toLowerCase()===w.subtype.toLowerCase()||w.name.toLowerCase().includes(pr.toLowerCase()));
          return`<div class="prof-row" style="${isMJ()?'cursor:pointer':''}" onclick="${isMJ()?`mjToggleWeaponProf('${esc(w.subtype)}')`:''}" title="${isMJ()?'Cliquer pour modifier':''}">
            <span class="prof-dot ${prof?'yes':'no'}"></span>
            <span style="flex:1;font-size:12px;color:${prof?'var(--text)':'var(--text3)'}">${esc(w.name)}</span>
            <span style="font-size:10px;color:var(--text3)">${esc(w.subtype)}</span>
            ${prof?`<span style="font-size:10px;color:#4caf50">✓</span>`:`<span style="font-size:10px;color:#e53935">✗</span>`}
          </div>`;
        }).join(''):''}
      </div>
      <div class="panel">
        <div class="pt" style="display:flex;align-items:center;justify-content:space-between;cursor:pointer" onclick="_equipProfOpen.a=!_equipProfOpen.a;render()">
          <span>Maîtrises d'armures</span>
          <span style="display:flex;align-items:center;gap:8px">${isMJ()?`<span style="font-size:10px;color:var(--cp)">🎲 toggle</span>`:''}<span style="font-size:11px;color:var(--text3)">${_equipProfOpen.a?'▴':'▾'}</span></span>
        </div>
        ${_equipProfOpen.a?allArmors.map(a=>{
          const prof=aProfs.some(pr=>a.type.toLowerCase().includes(pr.toLowerCase())||a.name.toLowerCase().includes(pr.toLowerCase()));
          return`<div class="prof-row" style="${isMJ()?'cursor:pointer':''}" onclick="${isMJ()?`mjToggleArmorProf('${esc(a.type)}')`:''}" title="${isMJ()?'Cliquer pour modifier':''}">
            <span class="prof-dot ${prof?'yes':'no'}"></span>
            <span style="flex:1;font-size:12px;color:${prof?'var(--text)':'var(--text3)'}">${esc(a.name)}</span>
            <span style="font-size:10px;color:var(--text3)">${esc(a.type)}</span>
            ${prof?`<span style="font-size:10px;color:#4caf50">✓</span>`:`<span style="font-size:10px;color:#e53935">✗</span>`}
          </div>`;
        }).join(''):''}
      </div>
    </div>
  </div>`;
}

const _TYPE_ICON={M:'⚔',R:'🏹',ST:'🪄',RD:'🔱',WD:'✨',W:'✨',MA:'🛡',HA:'🛡',LA:'🛡',S:'🛡',A:'🪃',G:'🎒',RG:'💍',P:'🧪',SC:'📜','$':'💰'};
function _itemType(name,invItem){
  if(invItem&&invItem.itemType)return invItem.itemType;
  if(typeof ITEMS_DB!=='undefined'&&ITEMS_DB){const found=ITEMS_DB.find(x=>x.n===name);if(found)return found.t||'';}
  const arm=SRD.armors.find(a=>a.name===name);
  if(arm)return arm.type==='Bouclier'?'S':arm.type==='Légère'?'LA':arm.type==='Intermédiaire'?'MA':'HA';
  const wpn=SRD.weapons.find(w=>w.name===name);
  if(wpn)return wpn.subtype&&wpn.subtype.includes('distance')?'R':'M';
  return '';
}
function _slotAccepts(slotId,t){
  if(!t)return true;
  if(slotId==='chest')return['LA','MA','HA'].includes(t);
  if(slotId==='mainhand')return['M','ST','RD','WD','R'].includes(t);
  if(slotId==='offhand')return['M','ST','S'].includes(t);
  if(slotId==='ranged')return t==='R';
  return!['M','R','ST','RD','LA','MA','HA','S','A','$'].includes(t);
}
function _isTwoHanded(name){
  const wpn=SRD.weapons.find(w=>w.name===name);
  if(wpn&&wpn.properties&&wpn.properties.includes('deux mains'))return true;
  if(typeof ITEMS_DB!=='undefined'&&ITEMS_DB){const found=ITEMS_DB.find(x=>x.n===name);if(found&&found.p&&found.p.toLowerCase().includes('two-handed'))return true;}
  return false;
}
function _calcArmorCA(p){
  const abs=p.abilities||[10,10,10,10,10,10];
  const dexM=Math.floor((abs[1]-10)/2);
  const eq=p.equip||{};
  let base=null;
  if(eq.chest&&eq.chest.name){
    const caStr=eq.chest.ca||(SRD.armors.find(a=>a.name===eq.chest.name)||{}).ca||'';
    if(caStr){
      if(caStr.startsWith('+'))base=(10+dexM)+(parseInt(caStr)||0);
      else if(caStr.includes('max 2'))base=(parseInt(caStr)||14)+Math.min(dexM,2);
      else if(caStr.includes('DEX'))base=(parseInt(caStr)||11)+dexM;
      else base=parseInt(caStr)||10;
    } else {
      const desc=eq.chest.desc||'';
      const m=desc.match(/CA\s*(\d+)/i);
      if(m){
        const caBase=parseInt(m[1]);
        if(desc.includes('max 2'))base=caBase+Math.min(dexM,2);
        else if(desc.match(/\+\s*DEX/i))base=caBase+dexM;
        else base=caBase;
      }
    }
  }
  if(base===null){
    const conM=Math.floor((abs[2]-10)/2);const sagM=Math.floor((abs[4]-10)/2);
    const classes=p.classes||[];
    const isBarbare=classes.some(c=>c.name==='Barbare');
    const isMoine=classes.some(c=>c.name==='Moine');
    const isEnsorceleurDrac=classes.some(c=>c.name==='Ensorceleur')&&(p.features||[]).some(f=>f.name==='Origine draconique');
    if(isBarbare)base=10+dexM+conM;       // Défense sans armure Barbare : 10+DEX+CON
    else if(isMoine)base=10+dexM+sagM;   // Défense sans armure Moine : 10+DEX+SAG
    else if(isEnsorceleurDrac)base=13+dexM; // Résilience draconique : 13+DEX
    else base=10+dexM;
  }
  if(eq.offhand&&eq.offhand.name){
    const shield=SRD.armors.find(a=>a.name===eq.offhand.name&&a.type==='Bouclier');
    if(shield)base+=2;
    else{const t=_itemType(eq.offhand.name,eq.offhand);if(t==='S'||(eq.offhand.desc||'').match(/bouclier|shield/i))base+=2;}
  }
  // Style de combat Défense : +1 CA si une armure est portée
  if(p.combatStyle==='Défense'&&eq.chest&&eq.chest.name)base+=1;
  // Ajouter les bonus de CA depuis les statuts (anneaux, objets magiques, etc.)
  const caBonus=(p.statuses||[]).filter(s=>s.stat==='ca'||s.stat==='CA').reduce((sum,s)=>sum+(parseInt(s.value)||0),0);
  return base+caBonus;
}
function openEquipSlot(slotId){
  const p=P();
  const allInv=(p.inventory||[]).filter(i=>i.name&&i.qty>0);
  const inv=allInv.filter(item=>_slotAccepts(slotId,_itemType(item.name,item)));
  const SLOT_LABELS={head:'🪖 Tête',shoulders:'🧥 Épaules',chest:'🛡 Torse',hands:'🧤 Mains',legs:'👖 Jambes',feet:'👢 Pieds',neck:'📿 Cou',ring1:'💍 Anneau G',ring2:'💍 Anneau D',waist:'🪢 Ceinture',back:'🧣 Dos',mainhand:'⚔️ Main droite',offhand:'🗡️ Main gauche',ranged:'🏹 Distance'};
  let html=`<div style="font-size:10px;color:var(--text3);font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px">🎒 Depuis ton sac</div>`;
  html+=inv.length?inv.map(item=>`<div class="aci" onclick="equipItem('${slotId}','${esc(item.name)}','${esc(item.desc||'')}',${item.magic||false},'${esc(item.linkedTo||'')}')"><div class="ain">${esc(item.name)}${item.magic?` <span class="magic-badge">✨</span>`:''}</div>${item.desc?`<div class="ais">${esc(item.desc)}</div>`:''}</div>`).join(''):`<div style="font-size:12px;color:var(--text3);padding:4px;font-style:italic">${allInv.length?'Aucun objet compatible dans le sac.':'Sac vide.'}</div>`;
  openModal(`<div class="pt">${SLOT_LABELS[slotId]||slotId}</div><div style="max-height:400px;overflow-y:auto">${html}</div><button class="btn bsm" style="width:100%;margin-top:8px" onclick="closeModal()">Fermer</button>`);
}
function equipItem(slotId,name,desc,magic,linkedTo){
  const p=P();if(!p.equip)p.equip={};
  if(!p.statuses)p.statuses=[];
  // Validation arme à deux mains → libère la main gauche automatiquement
  if(slotId==='mainhand'&&_isTwoHanded(name)){
    const oh=p.equip.offhand;
    if(oh&&oh.name){
      if(!p.inventory)p.inventory=[];
      const ex=p.inventory.find(i=>i.name===oh.name);
      if(ex)ex.qty++;else p.inventory.push({name:oh.name,qty:1,desc:oh.desc||'',magic:oh.magic,linkedTo:oh.linkedTo||''});
      p.statuses=p.statuses.filter(s=>s.source!=='equip_offhand');
      delete p.equip.offhand;
      showToast('⚠️ '+name+' requiert deux mains — main gauche libérée.');
    }
  }
  // Validation bouclier → bloque si arme 2 mains en main droite
  if(slotId==='offhand'){
    const t=_itemType(name,null);
    if(t==='S'||(desc||'').match(/bouclier|shield/i)){
      const mh=p.equip.mainhand;
      if(mh&&mh.name&&_isTwoHanded(mh.name)){showToast('⚠️ Impossible — '+mh.name+' nécessite deux mains.');return;}
    }
  }
  // Retirer les anciens bonus de ce slot
  p.statuses=p.statuses.filter(s=>s.source!=='equip_'+slotId);
  // Appliquer les statBonuses de l'objet s'il en a
  const invItem=(p.inventory||[]).find(i=>i.name===name);
  if(invItem&&invItem.statBonuses&&invItem.statBonuses.length){
    invItem.statBonuses.forEach(b=>{
      p.statuses.push({name:name,type:b.value>0?'bonus':'malus',stat:b.stat,value:b.value,icon:'✨',desc:'Bonus de l\'objet équipé',source:'equip_'+slotId});
    });
    showToast('✨ Bonus appliqués : '+invItem.statBonuses.map(b=>(b.value>0?'+':'')+b.value+' '+b.stat.toUpperCase()).join(', '));
  }
  // Stocker le ca depuis items_db si disponible (améliore _calcArmorCA pour armures magiques)
  let caStr=null;
  if(typeof ITEMS_DB!=='undefined'&&ITEMS_DB){const dbItem=ITEMS_DB.find(x=>x.n===name);if(dbItem&&dbItem.ac)caStr=String(dbItem.ac);}
  p.equip[slotId]={name,desc,magic:magic||false,linkedTo:linkedTo||'',...(caStr?{ca:caStr}:{})};
  if(slotId==='chest'||slotId==='offhand'){const newCA=_calcArmorCA(p);if(p.ac!==newCA){p.ac=newCA;showToast('🛡 CA mise à jour : '+newCA);}}
  closeModal();render();}
function unequipSlot(slotId){
  const p=P();if(!p.equip)return;
  const item=p.equip[slotId];
  if(item){if(!p.inventory)p.inventory=[];const ex=p.inventory.find(i=>i.name===item.name);if(ex)ex.qty++;else p.inventory.push({name:item.name,qty:1,desc:item.desc||'',magic:item.magic,linkedTo:item.linkedTo});}
  // Retirer les bonus liés à ce slot
  if(p.statuses)p.statuses=p.statuses.filter(s=>s.source!=='equip_'+slotId);
  delete p.equip[slotId];
  if(slotId==='chest'||slotId==='offhand'){const newCA=_calcArmorCA(p);p.ac=newCA;showToast('🛡 CA recalculée : '+newCA);}
  render();}
function mjToggleWeaponProf(subtype){
  const p=P();if(!p.weaponProfs)p.weaponProfs=[];
  const key=subtype.toLowerCase();
  const idx=p.weaponProfs.findIndex(pr=>pr.toLowerCase()===key);
  if(idx>=0)p.weaponProfs.splice(idx,1);else p.weaponProfs.push(subtype);
  render();
}
function mjToggleArmorProf(type){
  const p=P();if(!p.armorProfs)p.armorProfs=[];
  const key=type.toLowerCase();
  const idx=p.armorProfs.findIndex(pr=>pr.toLowerCase()===key);
  if(idx>=0)p.armorProfs.splice(idx,1);else p.armorProfs.push(type);
  render();
}

// ═══════════════════════════════════════
// TAB: SAC
// ═══════════════════════════════════════
function tabSac(p){
  const inv=p.inventory||[];const cur=p.currency||{pc:0,pa:0,pe:0,po:0,pp:0};
  const attunedCount=inv.filter(it=>it.attuned).length;
  const _invSorted=inv.map((item,i)=>({item,i})).sort((a,b)=>(a.item.name||'').localeCompare(b.item.name||''));
  const invRows=inv.length?_invSorted.map(({item,i})=>{const _t=_itemType(item.name,item);const _ico=_TYPE_ICON[_t]||'📦';return`<div class="inv-item" style="flex-direction:column;align-items:flex-start;gap:4px;${(item.qty||0)===0?'opacity:.6':''}">
    <div style="display:flex;align-items:center;gap:8px;width:100%">
      <span style="font-size:15px;flex-shrink:0" title="${_t||'Objet'}">${_ico}</span>
      <span style="flex:1;font-size:13px;font-weight:600">${esc(item.name)}${item.magic?` <span class="magic-badge">✨${item.linkedTo?' '+esc(item.linkedTo):''}</span>`:''} ${(item.qty||0)===0?'<span style="font-size:10px;color:#e53935;font-weight:600;border:1px solid rgba(229,57,53,.4);border-radius:4px;padding:0 4px">Épuisé</span>':''}</span>
      <button class="btn bsm" style="padding:1px 6px;font-size:16px;line-height:1" onclick="adjustQty(${i},-1)">−</button>
      <input type="number" min="0" value="${item.qty||0}" style="width:38px;text-align:center;font-size:13px;font-weight:600;color:${(item.qty||0)===0?'#e53935':'var(--text)'};background:transparent;border:1px solid var(--border);border-radius:4px;padding:1px 2px;outline:none" onchange="setQty(${i},this.value)" onclick="this.select()">
      <button class="btn bsm" style="padding:1px 6px;font-size:16px;line-height:1" onclick="adjustQty(${i},+1)">+</button>
      <span onclick="removeInvItem(${i})" style="cursor:pointer;color:var(--text3);font-size:15px;margin-left:4px">×</span>
    </div>
    ${item.desc?`<div style="font-size:11px;color:var(--text3)">${esc(item.desc)}</div>`:''}
    ${item.statBonuses&&item.statBonuses.length?`<div style="display:flex;gap:4px;flex-wrap:wrap">${item.statBonuses.map(b=>`<span class="status-badge ${b.value>0?'bonus':'malus'}" style="font-size:10px;padding:2px 6px">${b.stat.toUpperCase()} ${b.value>0?'+':''}${b.value}</span>`).join('')}</div>`:''}
    ${item.charges?`<div style="display:flex;align-items:center;gap:6px;margin-top:2px">
      <span style="font-size:11px;color:var(--text3)">Charges:</span>
      <div>${Array.from({length:item.charges},(_,ci)=>`<span class="slot-bubble${ci>=(item.chargesUsed||0)?'':' used'}" onclick="toggleItemCharge(${i},${ci})"></span>`).join('')}</div>
      <span style="font-size:10px;color:var(--text3)">${item.charges-(item.chargesUsed||0)}/${item.charges}</span>
    </div>`:''}
    ${(_t==='P'||_t==='SC')&&(item.qty||0)>0?`<div style="margin-top:4px"><button class="btn bsm" style="color:#7986cb;border-color:rgba(121,134,203,.4)" onclick="useConsumable(${i})">${_t==='P'?'🧪 Utiliser':'📜 Lancer'}</button></div>`:''}
    ${item.attunement?`<div style="margin-top:4px"><button class="btn bsm" onclick="toggleAttunement(${i})" style="color:${item.attuned?'#e53935':'#9c27b0'};border-color:${item.attuned?'rgba(229,57,53,.4)':'rgba(156,39,176,.4)'}">${item.attuned?'🔓 Rompre le lien':'🔗 Se lier'}</button>${item.attuned?`<span style="font-size:10px;color:#9c27b0;margin-left:6px">Lié ✓</span>`:''}</div>`:''}
  </div>`;}).join(''):`<div style="font-size:12px;color:var(--text3);font-style:italic">Inventaire vide.</div>`;
  return`<div>
  <div class="panel mb10">
    <div class="pt" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
      <span>🪙 Bourse</span>
      <span style="font-size:10px;color:var(--text3);font-style:italic">Conversion automatique</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px">
      ${[['pc','Cuivre','#b87333'],['pa','Argent','#b0bec5'],['pe','Électrum','#6abfad'],['po','Or','var(--cp)'],['pp','Platine','#dcdcdc']].map(([k,lbl,col])=>`<div class="coin"><div class="coin-lbl" style="color:${col}">${lbl}</div><div id="bourse_${k}" class="coin-val" style="font-size:18px;font-weight:600;text-align:center;padding:4px 0;color:var(--text)">${cur[k]||0}</div></div>`).join('')}
    </div>
    <div style="margin-top:8px;font-size:10px;color:var(--text3);text-align:center">10 pc → 1 pa &nbsp;·&nbsp; 5 pa → 1 pe &nbsp;·&nbsp; 2 pe → 1 po &nbsp;·&nbsp; 10 po → 1 pp</div>
    <div style="display:flex;gap:8px;margin-top:10px">
      <button class="btn bsm" style="flex:1;color:#4caf50;border-color:rgba(76,175,80,.5);font-weight:600" onclick="openBourseModal('gagner')">💰 Gagner</button>
      <button class="btn bsm" style="flex:1;color:#e53935;border-color:rgba(229,57,53,.5);font-weight:600" onclick="openBourseModal('payer')">💸 Payer</button>
    </div>
  </div>
  <div class="panel">
    <div class="pt" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
      <span>Inventaire ${inv.filter(it=>it.attunement).length?`<span style="font-size:10px;padding:2px 7px;border-radius:10px;margin-left:6px;background:${attunedCount>=3?'rgba(229,57,53,.15)':'rgba(156,39,176,.1)'};color:${attunedCount>=3?'#e53935':'#9c27b0'};border:1px solid ${attunedCount>=3?'rgba(229,57,53,.4)':'rgba(156,39,176,.3)'}">🔗 ${attunedCount}/3 liés</span>`:''}</span>
      ${isMJ()?`<button class="btn bsm bac" onclick="openMJCreateItem()">🎲 Créer objet/arme</button>`:''}
    </div>
    <div style="display:flex;gap:6px;margin-bottom:4px">
      <input class="fi" id="invName" placeholder="${ITEMS_DB?'Rechercher parmi '+ITEMS_DB.length.toLocaleString()+' objets...':'Nom ou recherche compendium...'}" oninput="filterSrdItems(this.value)" onfocus="if(this.value.trim())filterSrdItems(this.value)" onblur="setTimeout(()=>{const el=document.getElementById('srdList');if(el)el.style.display='none';},200)" style="flex:1">
      <button class="btn bsm bac" onclick="addInvItem()">+</button>
    </div>
    ${!ITEMS_DB?`<button class="btn bsm" style="font-size:11px;width:100%;margin-bottom:6px" onclick="loadItemsDB(()=>render())">📚 Charger le compendium d'objets</button>`:''}
    <div id="srdList" style="display:none;margin-bottom:8px;max-height:220px;overflow-y:auto"></div>
    ${invRows}
  </div>
  ${isMJ()&&mjPool.customItems.length?`<div class="panel" style="margin-top:8px">
    <div class="pt">Objets personnalisés (pool MJ)</div>
    ${mjPool.customItems.slice(-10).map((item,i)=>`<div class="aci" onclick="addPoolItemToSac(${mjPool.customItems.length-10+i})">
      <div class="ain">${esc(item.name)}${item.magic?' ✨':''}</div>
      <div class="ais">${esc(item.desc||'').slice(0,60)}</div>
    </div>`).join('')}
  </div>`:''}
  </div>`;
}
function toggleItemCharge(itemIdx,chargeIdx){
  const p=P();const item=p.inventory[itemIdx];if(!item)return;
  const used=item.chargesUsed||0;
  // Si on clique sur une charge utilisée → récupérer, sinon → dépenser
  if(chargeIdx<used)item.chargesUsed=chargeIdx;
  else item.chargesUsed=Math.min(item.charges,chargeIdx+1);
  render();
}
function useConsumable(itemIdx){
  const p=P();const item=p.inventory[itemIdx];if(!item||(item.qty||0)<=0)return;
  const m=(item.desc||'').match(/(\d+)d(\d+)([+-]\d+)?/);
  if(m){
    let total=0;const rolls=[];
    for(let i=0;i<parseInt(m[1]);i++){const r=Math.ceil(Math.random()*parseInt(m[2]));rolls.push(r);total+=r;}
    if(m[3])total+=parseInt(m[3]);
    showToast(`${item.itemType==='P'?'🧪':'📜'} <strong>${esc(item.name)}</strong> : [${rolls.join('+')}]${m[3]||''} = <strong style="font-size:16px;color:var(--cp)">${total}</strong>`);
  } else {
    showToast(`${item.itemType==='P'?'🧪':'📜'} <strong>${esc(item.name)}</strong> utilisé !${item.desc?' — '+esc(item.desc.slice(0,80)):''}`);
  }
  item.qty=Math.max(0,(item.qty||1)-1);
  render();_markUnsaved();
}
function addPoolItemToSac(idx){
  const item=mjPool.customItems[idx];if(!item)return;
  const p=P();if(!p.inventory)p.inventory=[];
  _addToInventory(p,{...item,chargesUsed:0});
  render();showToast(`✓ "${item.name}" ajouté au sac`);
}
function autoConvertCurrency(){
  const p=P();const c=p.currency=p.currency||{};
  if((c.pc||0)>=10){const g=Math.floor((c.pc||0)/10);c.pc=(c.pc||0)%10;c.pa=(c.pa||0)+g;}
  if((c.pa||0)>=5){const g=Math.floor((c.pa||0)/5);c.pa=(c.pa||0)%5;c.pe=(c.pe||0)+g;}
  if((c.pe||0)>=2){const g=Math.floor((c.pe||0)/2);c.pe=(c.pe||0)%2;c.po=(c.po||0)+g;}
  if((c.po||0)>=10){const g=Math.floor((c.po||0)/10);c.po=(c.po||0)%10;c.pp=(c.pp||0)+g;}
  ['pc','pa','pe','po','pp'].forEach(k=>{const el=document.getElementById('bourse_'+k);if(el)el.textContent=c[k]||0;});
}
function openBourseModal(type){
  const isGain=type==='gagner';
  const coins=[['pc','Cuivre','#b87333'],['pa','Argent','#b0bec5'],['pe','Électrum','#6abfad'],['po','Or','var(--cp)'],['pp','Platine','#dcdcdc']];
  openModal(`<div class="pt" style="color:${isGain?'#4caf50':'#e53935'}">${isGain?'💰 Recevoir des pièces':'💸 Payer'}</div>
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:14px 0">
      ${coins.map(([k,lbl,col])=>`<div style="text-align:center"><div style="font-size:10px;color:${col};text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">${lbl}</div><input id="bm_${k}" class="fi" type="number" min="0" value="0" style="text-align:center;font-size:16px;font-weight:600;padding:6px 2px"></div>`).join('')}
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2;font-weight:600" onclick="confirmBourse('${type}')">${isGain?'✓ Recevoir':'✓ Payer'}</button>
    </div>`);
  setTimeout(()=>document.getElementById('bm_pc')?.focus(),50);
}
function confirmBourse(type){
  const p=P();const c=p.currency=p.currency||{};
  const isGain=type==='gagner';
  const PC_VALUE={pc:1,pa:10,pe:50,po:100,pp:1000};
  const vals={};
  ['pc','pa','pe','po','pp'].forEach(k=>{vals[k]=parseInt(document.getElementById('bm_'+k)?.value)||0;});
  if(isGain){
    ['pc','pa','pe','po','pp'].forEach(k=>{c[k]=(c[k]||0)+vals[k];});
    autoConvertCurrency();
  } else {
    const totalCur=['pc','pa','pe','po','pp'].reduce((s,k)=>s+(c[k]||0)*PC_VALUE[k],0);
    const totalPay=['pc','pa','pe','po','pp'].reduce((s,k)=>s+vals[k]*PC_VALUE[k],0);
    if(totalPay===0){closeModal();return;}
    if(totalPay>totalCur){showToast('❌ Pas assez de pièces !');return;}
    let rem=totalCur-totalPay;
    c.pp=Math.floor(rem/1000);rem%=1000;
    c.po=Math.floor(rem/100);rem%=100;
    c.pe=Math.floor(rem/50);rem%=50;
    c.pa=Math.floor(rem/10);rem%=10;
    c.pc=rem;
    ['pc','pa','pe','po','pp'].forEach(k=>{const el=document.getElementById('bourse_'+k);if(el)el.textContent=c[k]||0;});
  }
  closeModal();
  saveAll();
  showToast(isGain?'💰 Pièces reçues !':'💸 Paiement effectué.');
}
function _addToInventory(p,item){
  if(!p.inventory)p.inventory=[];
  const ex=p.inventory.find(x=>x.name===item.name);
  if(ex){ex.qty=(ex.qty||0)+(item.qty||1);}
  else p.inventory.push(item);
}
function addInvItem(){
  const el=document.getElementById('invName');const n=el?.value?.trim();
  if(!n)return;const p=P();
  _addToInventory(p,{name:n,qty:1,desc:'',magic:false,linkedTo:''});
  if(el)el.value='';
  const sl=document.getElementById('srdList');if(sl)sl.innerHTML='';
  render();
}
function removeInvItem(i){P().inventory.splice(i,1);render();}
function adjustQty(i,delta){const p=P();if(!p.inventory[i])return;p.inventory[i].qty=Math.max(0,(p.inventory[i].qty||0)+delta);render();}
function setQty(i,val){const p=P();if(!p.inventory[i])return;p.inventory[i].qty=Math.max(0,parseInt(val)||0);render();}
function renderSrdList(q){
  if(ITEMS_DB){
    const low=q.trim().toLowerCase();
    const res=[];
    const limit=low?15:30;
    for(let i=0;i<ITEMS_DB.length&&res.length<limit;i++){
      if(!low||ITEMS_DB[i].n&&ITEMS_DB[i].n.toLowerCase().includes(low))res.push({i,it:ITEMS_DB[i]});
    }
    if(!res.length)return'<div style="font-size:11px;color:var(--text3);text-align:center;padding:6px">Aucun résultat.</div>';
    const suffix=!low&&ITEMS_DB.length>30?`<div style="font-size:10px;color:var(--text3);text-align:center;padding:4px">… et ${ITEMS_DB.length-30} autres — affinez la recherche</div>`:'';
    return res.map(({i,it})=>`<div class="aci" onclick="addCompendiumItem(${i})">
      <div class="ain">${_TYPE_ICON[it.t]||'📦'} ${esc(it.n)}${it.mg?' ✨':''}</div>
      <div class="ais">${esc(it.d||'')}${it.d1?' — '+it.d1+(it.d2?' / '+it.d2:'')+(it.dt?' '+it.dt:''):''}${it.ac?' — CA '+it.ac:''}</div>
    </div>`).join('')+suffix;
  }
  if(!q.trim())return[...SRD.weapons,...SRD.armors].slice(0,15).map(i=>`<div class="aci" onclick="addSrdItem('${esc(i.name)}','${esc(i.damage||i.ca||'')}','${esc(i.subtype||i.type||'')}')"><div class="ain">${esc(i.name)}</div><div class="ais">${esc(i.damage||i.ca||'')} — ${esc(i.price||'')}</div></div>`).join('');
  return[...SRD.weapons,...SRD.armors].filter(i=>i.name.toLowerCase().includes(q.toLowerCase())).slice(0,8).map(i=>`<div class="aci" onclick="addSrdItem('${esc(i.name)}','${esc(i.damage||i.ca||'')}','${esc(i.subtype||i.type||'')}')"><div class="ain">${esc(i.name)}</div><div class="ais">${esc(i.damage||i.ca||'')} — ${esc(i.price||'')}</div></div>`).join('');
}
function filterSrdItems(q){
  const el=document.getElementById('srdList');if(!el)return;
  const trimmed=q.trim();
  if(!trimmed){el.style.display='none';el.innerHTML='';return;}
  el.innerHTML=renderSrdList(q);
  el.style.display='block';
}
function addSrdItem(name,stats,type){
  const p=P();
  const arm=SRD.armors.find(a=>a.name===name);
  const itemType=arm?(arm.type==='Bouclier'?'S':arm.type==='Légère'?'LA':arm.type==='Intermédiaire'?'MA':'HA'):(SRD.weapons.find(w=>w.name===name)?(name.includes('Arc')||name.includes('Arbalète')?'R':'M'):'');
  _addToInventory(p,{name,qty:1,desc:`${type} — ${stats}`,magic:false,linkedTo:'',itemType});render();
}
function toggleAttunement(itemIdx){
  const p=P();const item=p.inventory[itemIdx];if(!item)return;
  if(!item.attuned){
    const alreadyAttuned=(p.inventory||[]).filter(it=>it.attuned).length;
    if(alreadyAttuned>=3){showToast('❌ Maximum 3 objets liés simultanément. Rompez un lien d\'abord.');return;}
  }
  item.attuned=!item.attuned;
  render();_markUnsaved();
}

function addCompendiumItem(idx){
  const it=ITEMS_DB[idx];if(!it)return;
  const p=P();if(!p.inventory)p.inventory=[];
  const TYPE_MAP={M:'Arme',S:'Arme',MA:'Armure',LA:'Armure',HA:'Armure',G:'Divers',W:'Objet magique',R:'Objet magique',RD:'Objet magique',ST:'Outil',WD:'Objet magique',P:'Potion',SC:'Parchemin'};
  let desc=TYPE_MAP[it.t]||'';
  if(it.d1)desc+=(desc?' — ':'')+it.d1+(it.d2?' / '+it.d2:'')+(it.dt?' '+it.dt:'');
  if(it.ac)desc+=(desc?' — ':'')+'CA '+it.ac;
  if(it.d&&!desc)desc=it.d;
  const txLow=(it.tx||'').toLowerCase();
  const attunement=!!(it.mg&&(txLow.includes('nécessite un lien')||txLow.includes('requires attunement')||txLow.includes('lien avec un')||txLow.includes('attunement')));
  _addToInventory(p,{name:it.n,qty:1,desc:desc.trim(),magic:!!it.mg,linkedTo:'',itemType:it.t||'',attunement,attuned:false});
  render();showToast(`✓ "${it.n}" ajouté au sac`);
}

// ═══════════════════════════════════════
// TAB: HISTORIQUE
// ═══════════════════════════════════════
// ═══════════════════════════════════════
// TAB: JOURNAL
// ═══════════════════════════════════════
function tabJournal(p){
  return isMJ()?tabJournalMJ():tabJournalPlayer(p);
}

function _journalEntryForm(idPrefix,btnFn){
  const today=new Date().toISOString().slice(0,10);
  return`<div class="panel mb10">
    <div class="pt">📓 Nouvelle entrée</div>
    <div class="g2" style="gap:8px;margin-bottom:8px">
      <div><div class="fl mb6">Date</div><input class="fi" id="${idPrefix}Date" type="date" value="${today}"></div>
      <div><div class="fl mb6">Titre de session</div><input class="fi" id="${idPrefix}Title" placeholder="Ex: Session 3 — La mine" value="${esc(_journalDraft.title||'')}" oninput="_journalDraft.title=this.value"></div>
    </div>
    <div class="fl mb6">Notes${_journalDraft.content?'<span style="font-size:10px;color:var(--cp);margin-left:8px">● brouillon</span>':''}</div>
    <textarea class="fi mb6" id="${idPrefix}Content" rows="5" placeholder="Ce qui s'est passé ce soir..." style="resize:vertical" oninput="_journalDraft.content=this.value">${esc(_journalDraft.content||'')}</textarea>
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text2);cursor:pointer">
        <input type="checkbox" id="${idPrefix}Public" style="accent-color:var(--cp)">
        <span>Visible dans la Chronique</span>
      </label>
      <button class="btn bac bsm" onclick="${btnFn}()">+ Ajouter</button>
    </div>
  </div>`;
}

function _journalEntriesList(entries, deleteFn){
  if(!entries||!entries.length) return`<div style="text-align:center;padding:24px;color:var(--text3);font-style:italic">Aucune entrée pour l'instant.</div>`;
  return`<div style="display:flex;flex-direction:column;gap:10px;max-height:520px;overflow-y:auto;padding-right:4px">
    ${[...entries].reverse().map((e,ri)=>{
      const realIdx=entries.length-1-ri;
      return`<div class="journal-entry ${e.isPublic?'public':'private'}">
        <div class="journal-entry-meta">
          <div>
            <span class="journal-session">${esc(e.sessionTitle||'Sans titre')}</span>
            <span class="journal-date" style="margin-left:8px">${esc(e.date||'')}</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:10px;color:${e.isPublic?'#4caf50':'var(--text3)'}">${e.isPublic?'✓ Chronique':'🔒 Privé'}</span>
            <button class="btn bsm" style="color:#e53935;border-color:#e53935;padding:1px 6px" onclick="${deleteFn}(${realIdx})">✕</button>
          </div>
        </div>
        <div class="journal-content">${esc(e.content||'')}</div>
      </div>`;
    }).join('')}
  </div>`;
}

function tabJournalPlayer(p){
  const subTabs=[
    {id:'entries',label:'📓 Mes entrées'},
    {id:'chronicle',label:'📜 Chronique'},
  ];
  const bar=`<div class="journal-subtab">
    ${subTabs.map(t=>`<button class="${_playerJournalSubTab===t.id?'on':''}" onclick="_playerJournalSubTab='${t.id}';renderTab()">${t.label}</button>`).join('')}
  </div>`;
  if(_playerJournalSubTab==='chronicle'){
    return`<div>${bar}${renderChronicleView()}</div>`;
  }
  const entries=p.journal||[];
  return`<div>${bar}
    ${_journalEntryForm('j','addJournalEntry')}
    ${_journalEntriesList(entries,'deleteJournalEntry')}
  </div>`;
}

function addJournalEntry(){
  const p=P();
  if(!p.journal)p.journal=[];
  const date=document.getElementById('jDate')?.value||'';
  const title=document.getElementById('jTitle')?.value.trim()||'';
  const content=document.getElementById('jContent')?.value.trim()||'';
  const isPublic=document.getElementById('jPublic')?.checked||false;
  if(!content){showToast('❌ Écris quelque chose avant d\'ajouter.');return;}
  p.journal.push({id:Date.now(),date,sessionTitle:title,content,isPublic});
  _journalDraft={title:'',content:''};
  saveAll();renderTab();showToast('✅ Entrée ajoutée !');
}

function deleteJournalEntry(idx){
  const p=P();if(!p.journal)return;
  p.journal.splice(idx,1);saveAll();renderTab();
}

// Rendu adaptatif : joueur ou MJ screen
function renderCurrentView(){
  if(document.getElementById('mjScreen')?.style.display==='block')renderMJContent();
  else renderTab();
}

// ── JOURNAL MJ ──
function tabJournalMJ(){
  const subTabs=[
    {id:'mj',label:'📓 Mon journal'},
    {id:'players',label:'📖 Joueurs'},
    {id:'chronicle',label:'📜 Chronique'},
  ];
  const bar=`<div class="journal-subtab">
    ${subTabs.map(t=>`<button class="${_journalSubTab===t.id?'on':''}" onclick="_journalSubTab='${t.id}';renderCurrentView()">${t.label}</button>`).join('')}
  </div>`;

  if(_journalSubTab==='mj'){
    return`<div>${bar}
      ${_journalEntryForm('mj','addMJJournalEntry')}
      ${_journalEntriesList(_mjJournal,'deleteMJJournalEntry')}
    </div>`;
  }
  if(_journalSubTab==='players'){
    return`<div>${bar}${renderPlayersJournalView()}</div>`;
  }
  if(_journalSubTab==='chronicle'){
    return`<div>${bar}${renderChronicleView()}</div>`;
  }
  return`<div>${bar}</div>`;
}

async function addMJJournalEntry(){
  const date=document.getElementById('mjDate')?.value||'';
  const title=document.getElementById('mjTitle')?.value.trim()||'';
  const content=document.getElementById('mjContent')?.value.trim()||'';
  const isPublic=document.getElementById('mjPublic')?.checked||false;
  if(!content){showToast('❌ Écris quelque chose avant d\'ajouter.');return;}
  _mjJournal.push({id:Date.now(),date,sessionTitle:title,content,isPublic});
  await saveMJJournal();renderCurrentView();showToast('✅ Entrée ajoutée !');
}
async function deleteMJJournalEntry(idx){
  _mjJournal.splice(idx,1);await saveMJJournal();renderCurrentView();
}
async function saveMJJournal(){
  if(!currentUser||!currentCampaignId)return;
  try{
    await fbDb.collection('characters').doc(currentUser.uid+'_'+currentCampaignId+'_mj').set({
      entries:_mjJournal,npcs:_mjNPCs,objets:_mjObjets,userId:currentUser.uid,campaignId:currentCampaignId,
      updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    },{merge:true});
  }catch(e){showToast('❌ Erreur sauvegarde journal : '+e.message);}
}

// ── VUE JOURNAUX JOUEURS (MJ) ──
let _playersJournalData=null;
let _selectedPlayerJournal=null;

function renderPlayersJournalView(){
  if(!_playersJournalData){
    // Déclenchement du chargement
    loadPlayersJournalData();
    return`<div style="text-align:center;padding:24px"><span class="auth-spinner"></span> Chargement des journaux...</div>`;
  }
  const players=_playersJournalData;
  if(!players.length) return`<div style="text-align:center;padding:24px;color:var(--text3);font-style:italic">Aucun joueur n'a encore de journal.</div>`;

  const sel=_selectedPlayerJournal||players[0]?.uid;
  const selPlayer=players.find(p=>p.uid===sel)||players[0];
  const selectorHtml=`<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">
    ${players.map(p=>`<button class="btn bsm${p.uid===sel?' bac':''}" onclick="_selectedPlayerJournal='${p.uid}';renderCurrentView()">${p.avatar||'⚔'} ${esc(p.playerName)}</button>`).join('')}
  </div>`;

  if(!selPlayer) return selectorHtml+`<div style="color:var(--text3);font-style:italic">Sélectionnez un joueur.</div>`;
  const entries=selPlayer.journal||[];
  return selectorHtml+`<div style="font-size:12px;color:var(--text3);margin-bottom:10px">${esc(selPlayer.charName||'?')} — ${entries.length} entrée(s)</div>`
    +_journalEntriesList(entries,'()=>{}');
}

async function loadPlayersJournalData(){
  try{
    const snap=await fbDb.collection('characters').where('campaignId','==',currentCampaignId).get();
    const result=[];
    for(const doc of snap.docs){
      const d=doc.data();
      if(d.userId===currentUser.uid)continue; // skip MJ's own char
      if(doc.id.endsWith('_mj'))continue;
      const char=d.characterData||{};
      let playerName='Joueur';let avatar='⚔';
      try{const u=await fbDb.collection('users').doc(d.userId).get();if(u.exists){playerName=u.data().displayName||'Joueur';avatar=u.data().avatar||'⚔';}}catch(e){}
      result.push({uid:d.userId,playerName,avatar,charName:char.charName||'?',journal:char.journal||[]});
    }
    _playersJournalData=result;
    renderCurrentView();
  }catch(e){showToast('❌ Erreur chargement journaux : '+e.message);}
}

// ── CHRONIQUE (compilation) ──
function renderChronicleView(){
  if(!_compilationData){
    loadChronicleData();
    return`<div style="text-align:center;padding:24px"><span class="auth-spinner"></span> Compilation en cours...</div>`;
  }
  const bySession=_compilationData;
  if(!Object.keys(bySession).length) return`<div style="text-align:center;padding:24px;color:var(--text3);font-style:italic">Aucune entrée publique pour l'instant. Les joueurs doivent cocher "Visible dans la Chronique" lors de l'ajout.</div>`;

  const sessions=Object.keys(bySession).sort((a,b)=>{
    const da=bySession[a][0]?.date||'';const db2=bySession[b][0]?.date||'';return da.localeCompare(db2);
  });

  return`<div style="max-height:600px;overflow-y:auto;padding-right:4px">
    ${sessions.map(sess=>`<div class="chronicle-session">
      <div class="chronicle-session-title">📜 ${esc(sess)}</div>
      ${bySession[sess].map(v=>`<div class="chronicle-voice">
        <div class="chronicle-avatar">${v.avatar||'⚔'}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:11px;color:var(--cp);font-weight:600;margin-bottom:4px">${esc(v.playerName)} <span style="color:var(--text3);font-weight:400">— ${esc(v.charName)}</span> <span style="color:var(--text3);font-size:10px">${v.date||''}</span></div>
          <div class="journal-content">${esc(v.content)}</div>
        </div>
      </div>`).join('')}
    </div>`).join('')}
  </div>`;
}

async function loadChronicleData(){
  try{
    const snap=await fbDb.collection('characters').where('campaignId','==',currentCampaignId).get();
    const bySession={};
    for(const doc of snap.docs){
      if(doc.id.endsWith('_mj'))continue;
      const d=doc.data();const char=d.characterData||{};
      let playerName='Joueur';let avatar='⚔';
      try{const u=await fbDb.collection('users').doc(d.userId).get();if(u.exists){playerName=u.data().displayName||'Joueur';avatar=u.data().avatar||'⚔';}}catch(e){}
      for(const entry of (char.journal||[])){
        if(!entry.isPublic)continue;
        const key=entry.sessionTitle||'Sans titre';
        if(!bySession[key])bySession[key]=[];
        bySession[key].push({playerName,avatar,charName:char.charName||'?',content:entry.content,date:entry.date});
      }
    }
    _compilationData=bySession;
    renderCurrentView();
  }catch(e){showToast('❌ Erreur compilation : '+e.message);}
}

function tabHistorique(p){
  return`<div class="g2" style="gap:10px">
    <div>
      <div class="panel mb10">
        <div class="pt">Traits de personnalité</div>
        <div class="fl mb6">Trait</div><textarea class="fi mb6" rows="2" oninput="upd('traits',this.value);autoGrow(this)" style="resize:vertical">${esc(p.traits)}</textarea>
        <div class="fl mb6">Idéaux</div><textarea class="fi mb6" rows="2" oninput="upd('ideals',this.value);autoGrow(this)" style="resize:vertical">${esc(p.ideals)}</textarea>
        <div class="fl mb6">Liens</div><textarea class="fi mb6" rows="2" oninput="upd('bonds',this.value);autoGrow(this)" style="resize:vertical">${esc(p.bonds)}</textarea>
        <div class="fl mb6">Défauts</div><textarea class="fi" rows="2" oninput="upd('flaws',this.value);autoGrow(this)" style="resize:vertical">${esc(p.flaws)}</textarea>
      </div>
      <div class="panel" style="border-color:rgba(200,168,75,.3);background:rgba(200,168,75,.04)">
        <div class="pt" style="color:var(--cp)">🔐 Secrets <span style="font-size:10px;color:var(--text3);font-weight:400;margin-left:6px">Visible uniquement par toi et le MJ</span></div>
        <textarea class="fi" rows="2" oninput="upd('secrets',this.value);autoGrow(this)" placeholder="Informations secrètes sur ton personnage, objectifs cachés, traumatismes, liens secrets avec des PNJ..." style="resize:vertical">${esc(p.secrets||'')}</textarea>
      </div>
    </div>
    <div>
      <div class="panel mb10">
        <div class="pt">Maîtrises & langues</div>
        <div class="fl mb6">Maîtrises</div><textarea class="fi mb6" rows="2" oninput="upd('proficiencies',this.value);autoGrow(this)" style="resize:vertical">${esc(p.proficiencies)}</textarea>
        <div class="fl mb6">Langues</div><textarea class="fi mb6" rows="2" oninput="upd('languages',this.value);autoGrow(this)" style="resize:vertical">${esc(p.languages)}</textarea>
      </div>
      <div class="panel">
        <div class="pt">Backstory</div>
        <textarea class="fi" rows="3" oninput="upd('backstory',this.value);autoGrow(this)" placeholder="L'histoire de ton personnage..." style="resize:vertical">${esc(p.backstory)}</textarea>
      </div>
    </div>
  </div>`;
}

// ═══════════════════════════════════════
// ─────────────────────────────────────────
// CALCULATEUR DE RENCONTRE
// ─────────────────────────────────────────
function crToXP(cr){return CR_XP_TABLE[cr]||(parseFloat(cr)>0?CR_XP_TABLE[String(Math.round(parseFloat(cr)))]||0:0);}
function crToPB(cr){const v=cr==='1/8'?.125:cr==='1/4'?.25:cr==='1/2'?.5:parseFloat(cr)||0;if(v<5)return 2;if(v<9)return 3;if(v<13)return 4;if(v<17)return 5;if(v<21)return 6;if(v<25)return 7;if(v<29)return 8;return 9;}
function encMultiplier(n){if(n<=1)return 1;if(n===2)return 1.5;if(n<=6)return 2;if(n<=10)return 2.5;if(n<=14)return 3;return 4;}
function encCalc(groupSize,groupLevel,monsters){
  const lv=Math.min(20,Math.max(1,groupLevel));
  const thPerPc=ENC_THRESHOLDS[lv-1];
  const th=thPerPc.map(v=>v*groupSize);
  const rawXP=monsters.reduce((s,m)=>s+m.xp,0);
  const mult=encMultiplier(monsters.length);
  const adjXP=Math.round(rawXP*mult);
  let diff='—';let diffColor='var(--text3)';
  if(monsters.length){
    if(adjXP>=th[3]){diff='Mortelle';diffColor='#e53935';}
    else if(adjXP>=th[2]){diff='Difficile';diffColor='#ff9800';}
    else if(adjXP>=th[1]){diff='Moyenne';diffColor='#fdd835';}
    else if(adjXP>=th[0]){diff='Facile';diffColor='#4caf50';}
    else{diff='Triviale';diffColor='var(--text3)';}
  }
  return{th,rawXP,adjXP,mult,diff,diffColor};
}
function encRefresh(){
  const sz=parseInt(document.getElementById('enc_size')?.value)||4;
  const lv=Math.min(20,Math.max(1,parseInt(document.getElementById('enc_level')?.value)||5));
  _encGroupSize=sz;_encGroupLevel=lv;
  const r=document.getElementById('enc_result');
  if(r)r.innerHTML=encResultHTML(sz,lv);
}
function encResultHTML(sz,lv){
  const res=encCalc(sz,lv,_encMonsters);
  if(!_encMonsters.length)return'<div style="font-size:11px;color:var(--text3);text-align:center;padding:6px">Ajoutez des monstres pour voir la difficulté.</div>';
  const names=['Facile','Moyenne','Difficile','Mortelle'];
  const bars=res.th.map((v,i)=>`<div style="font-size:10px;color:var(--text3)">${names[i]}<br><strong style="color:var(--text2)">${v.toLocaleString()}</strong></div>`).join('');
  return`<div style="background:var(--surface2);border-radius:8px;padding:10px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <div>
        <div style="font-size:11px;color:var(--text3)">XP brut — ×${res.mult} → XP ajusté</div>
        <div style="font-size:16px;font-weight:700;color:var(--text)">${res.rawXP.toLocaleString()} → <span style="color:var(--cp)">${res.adjXP.toLocaleString()} XP</span></div>
      </div>
      <div style="text-align:right">
        <div style="font-size:10px;color:var(--text3)">Difficulté</div>
        <div style="font-size:18px;font-weight:700;color:${res.diffColor}">${res.diff}</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;text-align:center;padding:6px 0;border-top:1px solid var(--border)">${bars}</div>
  </div>`;
}
function encRenderMonsters(){
  const el=document.getElementById('enc_monsterList');if(!el)return;
  el.innerHTML=_encMonsters.length?_encMonsters.map((m,i)=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">
    <span style="font-size:12px"><strong>${esc(m.name)}</strong> <span style="color:var(--text3)">CR ${m.cr}</span> — <span style="color:var(--cp)">${m.xp.toLocaleString()} XP</span></span>
    <button class="btn bsm" style="color:#e53935;border-color:rgba(229,57,53,.4);padding:0 6px" onclick="encRemoveMonster(${i})">✕</button>
  </div>`).join(''):'<div style="font-size:11px;color:var(--text3);font-style:italic;text-align:center;padding:8px">Aucun monstre — ajoutez-en ci-dessus.</div>';
  encRefresh();
}
function encAddMonster(){
  const crOpts=['0','1/8','1/4','1/2',...Array.from({length:30},(_,i)=>String(i+1))];
  openModal(`<div class="pt">➕ Ajouter un monstre</div>
    <div class="g2" style="gap:8px;margin-bottom:12px">
      <div><div class="fl mb6">Nom (optionnel)</div><input class="fi" id="enc_mname" placeholder="Gobelin, Ogre..."></div>
      <div><div class="fl mb6">Facteur de Puissance (CR)</div>
        <select class="fi" id="enc_mcr" onchange="document.getElementById('enc_mxp').textContent=crToXP(this.value).toLocaleString()+' XP'">
          ${crOpts.map(c=>`<option value="${c}"${c==='1'?' selected':''}>${c}</option>`).join('')}
        </select>
      </div>
    </div>
    <div style="text-align:center;font-size:13px;color:var(--text3);margin-bottom:14px">XP : <strong id="enc_mxp" style="color:var(--cp)">200 XP</strong></div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:14px">
      ${[1,2,3,4,5,6].map(n=>`<button class="btn bsm" onclick="for(let i=0;i<${n}-1;i++)encConfirmAddMonster(false);encConfirmAddMonster(true);" style="font-size:11px">×${n}</button>`).join('')}
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="encConfirmAddMonster(true)">✓ Ajouter</button>
    </div>`);
}
function encConfirmAddMonster(andClose){
  const name=(document.getElementById('enc_mname')?.value?.trim())||'Monstre';
  const cr=(document.getElementById('enc_mcr')?.value||'1');
  const xp=crToXP(cr);
  _encMonsters.push({name,cr,xp});
  if(andClose)closeModal();
  encRenderMonsters();
}
function encRemoveMonster(i){_encMonsters.splice(i,1);encRenderMonsters();}
async function encDistribute(){
  if(!_encMonsters.length){showToast('❌ Aucun monstre dans la rencontre.');return;}
  if(!_mjPlayersData.length){showToast('❌ Aucun joueur dans la campagne.');return;}
  const xpPerPlayer=Math.round(_encMonsters.reduce((s,m)=>s+m.xp,0)/_mjPlayersData.length);
  if(!xpPerPlayer){showToast('❌ XP nul.');return;}
  let ok=0;
  for(const pp of _mjPlayersData){
    try{
      const ref=fbDb.collection('characters').doc(pp.uid+'_'+currentCampaignId);
      const doc=await ref.get();
      if(!doc.exists)continue;
      const cd=doc.data().characterData||{};
      const oldXP=cd.xp||0;
      cd.xp=oldXP+xpPerPlayer;
      await ref.update({'characterData.xp':cd.xp});
      ok++;
    }catch(e){}
  }
  showToast(`⭐ ${xpPerPlayer.toLocaleString()} XP distribués à ${ok} joueur(s) !`);
  _encMonsters=[];encRenderMonsters();
}

// TAB: XP
// ═══════════════════════════════════════
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
  p.hpMax=Math.max(1,hd+conMod);
  p.hp=p.hpMax;
  p.combatCharges={};
  p.dmgResistances=(p.dmgResistances||[]).filter(r=>!['Contondant','Perforant','Tranchant','Feu','Froid','Foudre','Nécrotique','Acide','Tonnerre','Radiant','Poison'].includes(r));
  p.conditions=[];
  p.exhaustion=0;
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
      {name:"Voie du guerrier totem",desc:"Esprit totem niv.3 (choix : ours — résistances en rage / aigle — pas d'attaque d'opportunité en rage / loup — avantage allié). Aspect de la bête niv.6. Marcheur entre les mondes niv.10. Lien totémique niv.14.",icon:"🐺"},
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
      11:[],
      12:["Amélioration de caractéristiques"],
      13:[],
      14:["Capacité du cercle"],
      15:[],
      16:["Amélioration de caractéristiques"],
      17:[],
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
  asiChoice:null,archetypeChoice:null,styleChoice:null,
  metamagicChoices:[],newSpells:[],
  expertiseChoices:[],secretsChoices:[],mcSkillChoices:[],
};
function resetLU(){LU={step:1,steps:[],choice:null,mcTarget:null,asiChoice:null,archetypeChoice:null,styleChoice:null,metamagicChoices:[],newSpells:[],expertiseChoices:[],secretsChoices:[],mcSkillChoices:[]};_luSpellSearch='';_luSecretsSearch='';}

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
    if(isStyle)steps.push('style');
    if(isArchetype||isOrigin)steps.push('archetype');
    if(isASI)steps.push('asi');
    if(needExpertise)steps.push('expertise');
    if(needSpells)steps.push('spells');
    if(needSecrets)steps.push('secretsMagiques');
    if(isMetamagic)steps.push('metamagic');
  }
  steps.push('recap');
  return steps;
}

function tabLevelUp(p){
  const lvl=totalLevel(p);const newLvl=lvl+1;const mc=mainClass(p);
  const stepLabels={direction:'Direction',style:'Style de combat',archetype:'Archétype',asi:'Amélioration',expertise:'Expertise',spells:'Sorts',secretsMagiques:'Secrets Magiques',metamagic:'Métamagie',mcSkill:'Compétence',recap:'Confirmation'};

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
  return`<div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:12px">Choisis ton archétype pour ${esc(mc?mc.name:'')}. Ce choix est permanent.</p>
    ${archs.map((a,i)=>`<div class="lu-choice${LU.archetypeChoice===a.name?' selected':''}" onclick="LU.archetypeChoice=window._luArchs[${i}].name;renderTab()">
      <h3>${a.icon} ${esc(a.name)}</h3><p>${esc(a.desc)}</p>
    </div>`).join('')}
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn" style="flex:1" onclick="LU.step--;renderTab()">← Retour</button>
      <button class="btn bac" style="flex:2" onclick="LU.step++;renderTab()" ${LU.archetypeChoice?'':'disabled'}>Continuer →</button>
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
  if(!q.trim()){const preview=FEATS_DB.slice(0,24);el.innerHTML=preview.map(f=>`<div class="lu-choice" style="margin-bottom:6px;padding:8px 10px;cursor:pointer" onclick="LU.asiChoice.featName='${esc(f.n)}';renderTab()"><h3 style="font-size:13px;margin-bottom:4px">${esc(f.n)}</h3><p style="font-size:11px;color:var(--text2);line-height:1.4">${esc(f.tx||'')}</p></div>`).join('')+`<div style="font-size:11px;color:var(--text3);text-align:center;padding:4px">…et ${FEATS_DB.length-24} autres. Tapez pour filtrer.</div>`;return;}
  const low=q.toLowerCase();
  const res=[];
  for(let i=0;i<FEATS_DB.length&&res.length<12;i++){
    if(FEATS_DB[i].n&&FEATS_DB[i].n.toLowerCase().includes(low))res.push(FEATS_DB[i]);
  }
  el.innerHTML=res.length?res.map(f=>`<div class="lu-choice" style="margin-bottom:6px;padding:8px 10px;cursor:pointer" onclick="LU.asiChoice.featName='${esc(f.n)}';renderTab()">
    <h3 style="font-size:13px;margin-bottom:4px">${esc(f.n)}</h3>
    <p style="font-size:11px;color:var(--text2);line-height:1.4">${esc(f.tx||'')}</p>
  </div>`).join(''):'<div style="font-size:12px;color:var(--text3);text-align:center;padding:8px">Aucun résultat.</div>';
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

// ── Secrets Magiques (Barde) ──
let _luSecretsSearch='';
function luStepSecretsM(p){
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
  const feats=(cd?((cd.levelFeatures||{})[newCLvl]||[]):[]).filter(f=>f&&!f.includes('Amélioration de caractéristiques'));
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
      ${LU.styleChoice?`<div style="padding:6px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;font-weight:600;color:var(--cp)">⚔ Style : ${esc(LU.styleChoice)}</div></div>`:''}
      ${LU.asiChoice&&LU.asiChoice.type==='feat'&&LU.asiChoice.featName?`<div style="padding:6px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;font-weight:600;color:#4caf50">🎯 Don : ${esc(LU.asiChoice.featName)}</div></div>`:''}
      ${LU.asiChoice&&LU.asiChoice.type!=='feat'&&LU.asiChoice.stats.length?`<div style="padding:6px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;font-weight:600;color:#4caf50">📈 Amélioration : +${LU.asiChoice.val} à ${LU.asiChoice.stats.map(j=>ABILITIES[j]).join(' et ')}</div></div>`:''}
      ${LU.expertiseChoices.length?`<div style="padding:6px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;font-weight:600;color:#4caf50">🎯 Expertise : ${LU.expertiseChoices.join(', ')}</div></div>`:''}
      ${LU.newSpells.length?`<div style="padding:6px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;font-weight:600;color:var(--cp)">✨ Nouveaux sorts : ${LU.newSpells.join(', ')}</div></div>`:''}
      ${LU.secretsChoices.length?`<div style="padding:6px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;font-weight:600;color:#9c27b0">🎭 Secrets Magiques : ${LU.secretsChoices.join(', ')}</div></div>`:''}
      ${LU.metamagicChoices.length?`<div style="padding:6px 0"><div style="font-size:13px;font-weight:600;color:var(--cp)">🔮 Métamagie : ${LU.metamagicChoices.join(', ')}</div></div>`:''}
      `}
    </div>

    <div style="padding:8px 12px;background:var(--cglow);border:1px solid var(--cp);border-radius:8px;margin-bottom:14px">
      <div style="font-size:12px;color:var(--text2)">PV gagnés : <strong style="color:var(--cp)">${(()=>{const d=mc?SRD.classes.find(c=>c.name===mc.name):null;if(!d)return'?';const ab=p.abilities||[10,10,10,10,10,10];const avg=Math.floor(d.hdVal/2)+1;return`${avg} + CON (${fmt(mod(ab[2]))}) = ${Math.max(1,avg+mod(ab[2]))} PV supplémentaires`})()}</strong></div>
    </div>

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

  // Archétype → ajouter comme capacité
  if(LU.archetypeChoice){
    const cd=mc?CLASS_LEVEL_DATA[mc.name]:null;
    const arch=cd&&cd.archetypes?cd.archetypes.find(a=>a.name===LU.archetypeChoice):null;
    if(arch)p.features.push({name:LU.archetypeChoice,desc:arch.desc,classe:mc?mc.name:''});
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

// ═══════════════════════════════════════
// UTILITAIRES
// ═══════════════════════════════════════
function uploadPortrait(input){
  const file=input.files[0];if(!file)return;
  if(!['image/jpeg','image/png'].includes(file.type)){showToast('❌ Format non supporté. Utilisez JPG ou PNG.');input.value='';return;}
  if(file.size>512000){showToast('❌ Image trop lourde (max 500 Ko). Compressez-la avant import.');input.value='';return;}
  const reader=new FileReader();
  reader.onload=e=>{upd('portrait',e.target.result);render();};
  reader.readAsDataURL(file);
}
function openModal(html){const m=document.getElementById('modal');m.className='open';m.innerHTML=`<div class="modal-box" style="max-width:480px">${html}</div>`;}
function openWideModal(html){const m=document.getElementById('modal');m.className='open';m.innerHTML=`<div class="modal-box" style="max-width:600px">${html}</div>`;}
function closeModal(){const m=document.getElementById('modal');if(m){m.className='';m.innerHTML='';}if(typeof _tutoRemoveHighlight==='function')_tutoRemoveHighlight();}
document.addEventListener('click',e=>{
  if(document.getElementById('modal')?.className==='open'&&e.target===document.getElementById('modal'))closeModal();
  ['classeDrop','bgDropPerso','bgDropCre'].forEach(id=>{const d=document.getElementById(id);if(d&&!d.contains(e.target))d.style.display='none';});
});
function showToast(html,duration=3000){let t=document.getElementById('toast');if(!t){t=document.createElement('div');t.id='toast';t.style.cssText='position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--surface2);border:1px solid var(--cp);border-radius:8px;padding:10px 18px;font-size:13px;color:var(--text);z-index:9999;max-width:400px;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,.5)';document.body.appendChild(t);}t.innerHTML=html;t.style.display='block';clearTimeout(t._timer);t._timer=setTimeout(()=>{t.style.display='none';},duration);}

// ═══ DÉCLARATIONS ANTICIPÉES MJ (évite ReferenceError) ═══
function openMJCreateItem(){mjModal('item');}
function openMJCreateSpell(){mjModal('spell');}
function openMJCreateCombatFeat(){mjModal('feat');}
const _TYPE_LABEL_TO_CODE={'Arme de mêlée':'M','Arme à distance':'R','Armure légère':'LA','Armure intermédiaire':'MA','Armure lourde':'HA','Bouclier':'S','Bâton / Baguette':'ST','Anneau':'RG','Potion':'P','Parchemin':'SC','Objet magique':'WD','Munitions':'A','Équipement / Divers':'G'};
function _openMJCreateItem(){
  openModal(`<div class="pt">🎲 Créer un objet</div>
    <div class="fl mb6">Nom</div><input class="fi mb6" id="mjci_name" placeholder="Épée courte +1...">
    <div class="g2" style="gap:8px;margin-bottom:8px">
      <div><div class="fl mb6">Type</div>
        <select class="fi" id="mjci_type">
          ${Object.keys(_TYPE_LABEL_TO_CODE).map(l=>`<option value="${_TYPE_LABEL_TO_CODE[l]}">${_TYPE_ICON[_TYPE_LABEL_TO_CODE[l]]||'📦'} ${l}</option>`).join('')}
        </select>
      </div>
      <div><div class="fl mb6">Magique ?</div>
        <select class="fi" id="mjci_magic"><option value="0">Non</option><option value="1">Oui ✨</option></select>
      </div>
    </div>
    <div class="fl mb6">Description (optionnel)</div>
    <input class="fi mb10" id="mjci_desc" placeholder="Effets, bonus...">
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="_confirmMJCreateItem()">✓ Ajouter au sac</button>
    </div>`);
}
function _confirmMJCreateItem(){
  const name=(document.getElementById('mjci_name')?.value||'').trim();
  if(!name){showToast('❌ Nom requis.');return;}
  const itemType=document.getElementById('mjci_type')?.value||'';
  const magic=document.getElementById('mjci_magic')?.value==='1';
  const desc=(document.getElementById('mjci_desc')?.value||'').trim();
  _addToInventory(P(),{name,qty:1,desc,magic,linkedTo:'',itemType});
  closeModal();render();showToast(`✓ "${name}" ajouté au sac.`);
}
function mjModal(type){
  if(type==='item')_openMJCreateItem();
  else if(type==='spell')_openMJCreateSpell();
  else if(type==='feat')_openMJCreateCombatFeat();
}

// ═══ MJ POOL (shared storage) ═══
let mjPool={customSpells:[],customItems:[]};

async function loadMJPool(){
  try{
    const saved=localStorage.getItem('dnd5e_mj_pool');
    if(saved)mjPool=JSON.parse(saved);
  }catch(e){}
}
async function saveMJPool(){
  if(_mjActiveCompId&&_mjCompLib[_mjActiveCompId]){
    _mjCompLib[_mjActiveCompId].spells=mjPool.customSpells||[];
    _mjCompLib[_mjActiveCompId].items=mjPool.customItems||[];
    await saveMJCompLib();
  }else{
    try{localStorage.setItem('dnd5e_mj_pool',JSON.stringify(mjPool));}catch(e){}
  }
}

// ═══ MODE MJ ═══
let mjMode=false;
function isMJ(){return mjMode;}
function toggleMJ(){
  mjMode=!mjMode;
  render();
  showToast(mjMode?'🎲 Mode MJ activé':'👤 Mode Joueur activé');
}
// ═══════════════════════════════════════
let diceOpen=false;
let diceHistory=[];
let _lastRollResultHtml='';
let _journalDraft={title:'',content:''};

function createDiceButton(){
  // Panel de raccourcis (appui long) — contenu reconstruit dynamiquement à l'ouverture
  const sp=document.createElement('div');
  sp.id='diceShortcuts';
  sp.style.cssText=`position:fixed;bottom:88px;right:24px;z-index:889;display:none;flex-direction:column;gap:10px;align-items:flex-end;`;
  document.body.appendChild(sp);

  const btn=document.createElement('div');
  btn.id='diceFloat';
  btn.innerHTML='🎲';
  btn.style.cssText=`position:fixed;bottom:24px;right:24px;z-index:888;width:52px;height:52px;border-radius:50%;background:var(--cp);color:#1a1400;font-size:22px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.5);transition:transform .15s;user-select:none;`;
  btn.onmouseenter=()=>btn.style.transform='scale(1.1)';
  btn.onmouseleave=()=>btn.style.transform='scale(1)';
  let _pressTimer=null,_longActivated=false;
  function _startPress(){_longActivated=false;_pressTimer=setTimeout(()=>{_longActivated=true;_openDiceShortcuts();},450);}
  function _endPress(){clearTimeout(_pressTimer);if(!_longActivated)toggleDicePanel();_longActivated=false;}
  btn.addEventListener('mousedown',_startPress);
  btn.addEventListener('touchstart',e=>{e.preventDefault();_startPress();},{passive:false});
  btn.addEventListener('mouseup',_endPress);
  btn.addEventListener('touchend',e=>{e.preventDefault();_endPress();},{passive:false});
  btn.addEventListener('mouseleave',()=>{clearTimeout(_pressTimer);_longActivated=false;});
  document.body.appendChild(btn);

  const panel=document.createElement('div');
  panel.id='dicePanel';
  panel.style.cssText=`position:fixed;bottom:86px;right:24px;z-index:887;width:300px;background:var(--surface);border:1px solid var(--cp);border-radius:12px;padding:14px;box-shadow:0 8px 32px rgba(0,0,0,.6);display:none;max-height:80vh;overflow-y:auto;`;
  document.body.appendChild(panel);
}
function _openDiceShortcuts(){
  const sp=document.getElementById('diceShortcuts');if(!sp)return;
  // Reconstruction à chaque ouverture pour avoir le portrait à jour
  const p=P();
  const portrait=p?.portrait||p?.equipPortrait;
  const avatarEl=portrait
    ?`<img src="${portrait}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block">`
    :`<span style="font-size:20px">${currentUserData?.avatar||'⚔'}</span>`;
  sp.innerHTML=`
    <div style="display:flex;align-items:center;gap:8px">
      <span style="font-size:12px;color:var(--cp);background:var(--surface);padding:4px 10px;border-radius:20px;border:1px solid var(--border);white-space:nowrap">Journal</span>
      <button style="width:44px;height:44px;border-radius:50%;background:var(--surface);border:2px solid var(--cp);color:var(--cp);font-size:20px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.4)" onclick="_diceNav('journal')">📓</button>
    </div>
    <div style="display:flex;align-items:center;gap:8px">
      <span style="font-size:12px;color:var(--cp);background:var(--surface);padding:4px 10px;border-radius:20px;border:1px solid var(--border);white-space:nowrap">Personnage</span>
      <button style="width:44px;height:44px;border-radius:50%;overflow:hidden;background:var(--surface);border:2px solid var(--cp);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.4);padding:0" onclick="_diceNav('perso')">${avatarEl}</button>
    </div>`;
  sp.style.display='flex';
  setTimeout(()=>document.addEventListener('click',_closeDiceShortcutsOutside,{once:true}),50);
}
function _diceNav(tab){
  _closeDiceShortcuts();
  const app=document.getElementById('app');
  if(app&&app.style.display!=='none'){
    setTab(tab);
  }else if(P()){
    showApp();setTimeout(()=>setTab(tab),0);
  }else if(currentTableId&&currentCampaignId&&!isMJ()){
    enterCampaign(currentTableId,currentCampaignId).then(()=>{if(tab!=='perso')setTab(tab);}).catch(()=>{});
  }else{
    showToast('Ouvrez votre fiche depuis le Hub pour utiliser ce raccourci.');
  }
}
function _closeDiceShortcuts(){const sp=document.getElementById('diceShortcuts');if(sp)sp.style.display='none';}
function _closeDiceShortcutsOutside(e){
  const sp=document.getElementById('diceShortcuts');
  const btn=document.getElementById('diceFloat');
  if(sp&&!sp.contains(e.target)&&btn&&!btn.contains(e.target))sp.style.display='none';
}

function toggleDicePanel(){
  diceOpen=!diceOpen;
  const panel=document.getElementById('dicePanel');
  if(!panel)return;
  if(diceOpen){renderDicePanel();panel.style.display='block';}
  else panel.style.display='none';
}

function renderDicePanel(){
  const panel=document.getElementById('dicePanel');if(!panel)return;
  const p=P();
  if(!p||!p.abilities){
    panel.innerHTML=`<div style="font-family:var(--F);font-size:13px;color:var(--cp);letter-spacing:.06em;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center"><span>🎲 Lanceur de dés</span><span onclick="toggleDicePanel()" style="cursor:pointer;color:var(--text3);font-size:16px">×</span></div>
    <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:12px">${['d4','d6','d8','d10','d12','d20','d100'].map(d=>`<button onclick="diceRollFree('${d}')" style="padding:5px 9px;border:1px solid var(--border);border-radius:6px;font-size:12px;cursor:pointer;background:var(--surface2);color:var(--text2);font-family:var(--B)" onmouseenter="this.style.borderColor='var(--cp)';this.style.color='var(--cp)'" onmouseleave="this.style.borderColor='var(--border)';this.style.color='var(--text2)'">${d}</button>`).join('')}</div>
    <div id="diceResultFree" style="padding:8px;background:var(--surface2);border-radius:6px;display:none;font-size:14px;font-weight:600;color:var(--cp);text-align:center;margin-bottom:8px"></div>
    <div style="font-size:11px;color:var(--text3);text-align:center;font-style:italic">Entrez dans une campagne pour les jets de caractéristiques.</div>`;
    return;
  }
  const mc=mainClass(p);const lvl=totalLevel(p);
  const saves=CLASS_SAVES[mc?mc.name:'']||[];

  // Stats avec bonus statuts
  const finalAbilities=p.abilities.map((v,i)=>{
    const statKey=ABILITIES_SH[i].toLowerCase();
    const bonus=(p.statuses||[]).filter(s=>s.stat===statKey).reduce((a,s)=>a+(parseInt(s.value)||0),0);
    return v+bonus;
  });

  panel.innerHTML=`
  <div style="font-family:var(--F);font-size:13px;color:var(--cp);letter-spacing:.06em;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
    <span>🎲 Lanceur de dés</span>
    <span onclick="toggleDicePanel()" style="cursor:pointer;color:var(--text3);font-size:16px">×</span>
  </div>

  <!-- Statuts actifs -->
  ${(()=>{const p=P();const activeStatus=(p.statuses||[]).filter(s=>s.rollPenalty||s.rollBonus||s.name==='Invisible');if(!activeStatus.length)return'';return`<div style="padding:6px 8px;background:var(--surface2);border-radius:6px;margin-bottom:10px;font-size:11px"><span style="color:var(--text3)">Statuts actifs :</span> ${activeStatus.map(s=>`<span class="status-badge ${s.type}" style="font-size:10px;padding:2px 6px">${s.icon} ${esc(s.name)}</span>`).join(' ')}</div>`;})()}

  <!-- Dés libres -->
  <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Dés libres</div>
  <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:12px">
    ${['d4','d6','d8','d10','d12','d20','d100'].map(d=>`<button onclick="diceRoll('${d}','${d} libre')" style="padding:5px 9px;border:1px solid var(--border);border-radius:6px;font-size:12px;cursor:pointer;background:var(--surface2);color:var(--text2);transition:all .15s;font-family:var(--B)" onmouseenter="this.style.borderColor='var(--cp)';this.style.color='var(--cp)'" onmouseleave="this.style.borderColor='var(--border)';this.style.color='var(--text2)'">${d}</button>`).join('')}
  </div>
  <div style="display:flex;gap:6px;margin-bottom:14px;align-items:center">
    <input id="diceQty" type="number" min="1" max="20" value="1" style="width:48px;background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:5px 6px;color:var(--text);font-size:13px;text-align:center;outline:none">
    <span style="color:var(--text3);font-size:13px">×</span>
    <select id="diceType" style="flex:1;background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:5px 8px;color:var(--text);font-size:13px;outline:none">
      ${['d4','d6','d8','d10','d12','d20','d100'].map(d=>`<option>${d}</option>`).join('')}
    </select>
    <button onclick="diceRollCustom()" style="padding:5px 12px;border:1px solid var(--cp);border-radius:6px;font-size:12px;cursor:pointer;background:var(--cp);color:#1a1400;font-weight:600;font-family:var(--B)">Lancer</button>
  </div>

  <!-- Jets de caractéristiques -->
  <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Jets de caractéristiques</div>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:12px">
    ${ABILITIES.map((ab,i)=>{
      const m=mod(finalAbilities[i]);
      return`<button onclick="diceRoll('d20','${ab}',${m})" style="padding:6px 4px;border:1px solid var(--border);border-radius:6px;font-size:11px;cursor:pointer;background:var(--surface2);color:var(--text2);transition:all .15s;font-family:var(--B);text-align:center" onmouseenter="this.style.borderColor='var(--cp)';this.style.color='var(--cp)'" onmouseleave="this.style.borderColor='var(--border)';this.style.color='var(--text2)'">
        <div style="font-weight:600">${ABILITIES_SH[i]}</div>
        <div style="color:var(--cp);font-size:12px">${fmt(m)}</div>
      </button>`;
    }).join('')}
  </div>

  <!-- Jets de sauvegarde -->
  <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Jets de sauvegarde</div>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:12px">
    ${ABILITIES_SH.map((ab,i)=>{
      const hasSave=saves.includes(i);
      const m=mod(finalAbilities[i])+(hasSave?pb(lvl):0);
      return`<button onclick="diceRoll('d20','JS ${ab}',${m})" style="padding:6px 4px;border:1px solid ${hasSave?'var(--cp)':'var(--border)'};border-radius:6px;font-size:11px;cursor:pointer;background:var(--surface2);color:${hasSave?'var(--cp)':'var(--text2)'};transition:all .15s;font-family:var(--B);text-align:center" onmouseenter="this.style.borderColor='var(--cp)';this.style.color='var(--cp)'" onmouseleave="this.style.borderColor='${hasSave?'var(--cp)':'var(--border)'}';this.style.color='${hasSave?'var(--cp)':'var(--text2)'}'">
        <div style="font-weight:600">${ab}</div>
        <div style="font-size:12px">${fmt(m)}</div>
      </button>`;
    }).join('')}
  </div>

  <!-- Compétences -->
  <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Compétences</div>
  <div style="display:flex;flex-direction:column;gap:3px;margin-bottom:12px">
    ${SKILLS.map(sk=>{
      const prof=(p.skillProf||{})[sk.name]||0;
      const bonus=mod(finalAbilities[sk.ab])+(prof===1?pb(lvl):prof===2?pb(lvl)*2:0);
      const hasMaîtrise=prof>0;
      return`<button onclick="diceRoll('d20','${sk.name}',${bonus})" style="display:flex;align-items:center;gap:8px;padding:5px 8px;border:1px solid ${hasMaîtrise?'var(--cp)':'var(--border)'};border-radius:6px;font-size:12px;cursor:pointer;background:var(--surface2);color:var(--text2);transition:all .15s;font-family:var(--B);text-align:left;width:100%" onmouseenter="this.style.background='var(--surface3)'" onmouseleave="this.style.background='var(--surface2)'">
        <span style="width:10px;height:10px;border-radius:50%;background:${prof===2?'var(--cp)':prof===1?'var(--cp)':'var(--border)'};border:1px solid ${hasMaîtrise?'var(--cp)':'var(--border)'};opacity:${prof===2?1:.5};flex-shrink:0"></span>
        <span style="flex:1;color:${hasMaîtrise?'var(--cp)':'var(--text2)'}">${sk.name}</span>
        <span style="font-size:11px;color:var(--text3)">${ABILITIES_SH[sk.ab]}</span>
        <span style="font-weight:600;color:${hasMaîtrise?'var(--cp)':'var(--text2)'};min-width:28px;text-align:right">${fmt(bonus)}</span>
      </button>`;
    }).join('')}
  </div>

  <!-- Historique -->
  ${diceHistory.length?`<div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Derniers lancers</div>
  <div id="diceHistoryList" style="display:flex;flex-direction:column;gap:3px">
    ${diceHistory.slice().reverse().map(h=>`<div style="display:flex;justify-content:space-between;padding:4px 8px;background:var(--surface2);border-radius:4px;font-size:12px">
      <span style="color:var(--text2)">${esc(h.label)}</span>
      <span style="font-weight:700;color:${h.result>=20&&h.die==='d20'?'#ffd54f':h.result<=1&&h.die==='d20'?'#e53935':'var(--cp)'}">${h.result}${h.bonus?` (${fmt(h.bonus)})`:''}</span>
    </div>`).join('')}
  </div>`:''}
  `;
}

// Détecte avantage/désavantage/bonus-dé selon les statuts actifs
function getStatusEffects(p,rollType){
  // rollType: 'attaque' | 'carac' | 'save' | 'dex-save' | 'for-save' | 'skill'
  const statuses=p.statuses||[];
  let hasDisadv=false,hasAdv=false,bonusDie=null;

  function matchesRoll(target,rt){
    if(!target)return false;
    if(target==='un')return true; // s'applique à n'importe quel jet (Inspiré)
    if(target==='attaque'&&rt==='attaque')return true;
    if(target==='carac'&&(rt==='carac'||rt==='skill'))return true;
    if(target==='save'&&(rt==='save'||rt==='dex-save'||rt==='for-save'))return true;
    if(target==='dex-save'&&rt==='dex-save')return true;
    if(target==='for-save'&&rt==='for-save')return true;
    if(target==='compétence'&&rt==='skill')return true;
    return false;
  }

  statuses.forEach(s=>{
    // Désavantage
    const pen=(s.rollPenalty||'').split(',').map(r=>r.trim()).filter(Boolean);
    if(pen.some(r=>matchesRoll(r,rollType)))hasDisadv=true;

    // Avantage explicite (Invisible sur attaque)
    if(s.rollPenalty==='avantage-attaque'&&rollType==='attaque')hasAdv=true;
    if(s.name==='Invisible'&&rollType==='attaque')hasAdv=true;

    // Bonus de dé (ex: "1d4:attaque,save" ou "1d6:un")
    const bon=s.rollBonus||'';
    if(bon){
      const colonIdx=bon.indexOf(':');
      const dieStr=colonIdx>=0?bon.slice(0,colonIdx):bon;
      const targets=colonIdx>=0?bon.slice(colonIdx+1).split(',').map(t=>t.trim()):['un'];
      if(targets.some(t=>matchesRoll(t,rollType)))bonusDie=dieStr;
    }
  });

  return{hasDisadv,hasAdv,bonusDie};
}

function diceRoll(die,label,bonus=0,rollType=''){
  const p=P();
  const n=parseInt(die.replace('d',''));
  const effects=rollType?getStatusEffects(p,rollType):{hasDisadv:false,hasAdv:false,bonusDie:null};

  // Avantage / désavantage → 2 dés, garde le plus haut/bas
  const roll1=Math.ceil(Math.random()*n);
  let roll2=null,usedRoll=roll1;
  if(effects.hasAdv&&!effects.hasDisadv){roll2=Math.ceil(Math.random()*n);usedRoll=Math.max(roll1,roll2);}
  else if(effects.hasDisadv&&!effects.hasAdv){roll2=Math.ceil(Math.random()*n);usedRoll=Math.min(roll1,roll2);}

  // Bonus de dé (Béni, Inspiré…)
  let bonusDieRoll=0;
  if(effects.bonusDie){const bd=parseInt(effects.bonusDie.replace('d',''));bonusDieRoll=Math.ceil(Math.random()*bd);}

  const total=usedRoll+bonus+bonusDieRoll;
  const isCrit=die==='d20'&&usedRoll===20;
  const isFumble=die==='d20'&&usedRoll===1;

  // Historique
  diceHistory.push({die,label,roll:usedRoll,bonus,result:total,adv:effects.hasAdv,disadv:effects.hasDisadv});
  if(diceHistory.length>10)diceHistory.shift();

  // Toast
  let msg=`<strong>${label}</strong> : `;
  if(roll2!==null){
    const kept=effects.hasAdv?'🟢':'🔴';
    const dropped=effects.hasAdv?'🔴':'🟢';
    const keptVal=usedRoll,droppedVal=usedRoll===roll1?roll2:roll1;
    msg+=`[${keptVal} ${kept}, ${droppedVal} ${dropped}]`;
    msg+=effects.hasAdv?` <span style="font-size:10px;color:#4caf50">AVANTAGE</span>`:`<span style="font-size:10px;color:#e53935"> DÉSAVANTAGE</span>`;
  } else {
    msg+=`d20(${usedRoll})`;
  }
  if(bonus)msg+=` ${fmt(bonus)}`;
  if(bonusDieRoll)msg+=` <span style="color:#ffd54f">+${effects.bonusDie}(${bonusDieRoll})</span>`;
  msg+=` = <strong style="font-size:16px;color:${isCrit?'#ffd54f':isFumble?'#e53935':'var(--cp)'}">${total}</strong>`;
  if(isCrit)msg+=` 🎉 CRITIQUE !`;
  if(isFumble)msg+=` 💀 FUMBLE !`;
  showToast(msg);

  if(diceOpen)renderDicePanel();
}

function diceRollFree(d){
  const n=parseInt(d.replace('d',''));
  const r=Math.ceil(Math.random()*n);
  const el=document.getElementById('diceResultFree');
  if(el){el.style.display='block';el.innerHTML=`🎲 ${d} : <strong style="font-size:18px">${r}</strong>${r===n?' 🎉':r===1&&n>4?' 💀':''}`;}
}
function diceRollCustom(){
  const qty=parseInt(document.getElementById('diceQty')?.value)||1;
  const die=document.getElementById('diceType')?.value||'d20';
  const n=parseInt(die.replace('d',''));
  let total=0;const rolls=[];
  for(let i=0;i<qty;i++){const r=Math.ceil(Math.random()*n);rolls.push(r);total+=r;}
  const label=`${qty}${die}`;
  diceHistory.push({die,label,roll:total,bonus:0,result:total});
  if(diceHistory.length>10)diceHistory.shift();
  showToast(`<strong>${label}</strong> : [${rolls.join(', ')}] = <strong style="font-size:16px;color:var(--cp)">${total}</strong>`);
  if(diceOpen)renderDicePanel();
}

// Fermer le panel si clic ailleurs
document.addEventListener('click',e=>{
  const panel=document.getElementById('dicePanel');
  const btn=document.getElementById('diceFloat');
  if(diceOpen&&panel&&btn&&!panel.contains(e.target)&&!btn.contains(e.target)){
    diceOpen=false;panel.style.display='none';
  }
});

createDiceButton();

function createPartyHud(){
  const hud=document.createElement('div');
  hud.id='partyHud';
  hud.style.cssText='position:fixed;bottom:24px;left:24px;z-index:850;display:none';
  hud.innerHTML=`<div id="partyHudPanel" class="phud-panel" style="display:none"></div><div id="partyHudBtn" onclick="_togglePartyHud()" title="Groupe">👥<div id="partyHudBadge"></div><div id="partyHudTurnBadge">⚡</div></div>`;
  document.body.appendChild(hud);
}
createPartyHud();
