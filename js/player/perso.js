
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// TAB: PERSONNAGE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function tabPerso(p){
  const mc=mainClass(p);const cd=mc?SRD.classes.find(c=>c.name===mc.name):null;const rd=SRD.races.find(r=>r.name===p.race);
  const lvl=totalLevel(p);const dexM=mod(p.abilities[1]);
  const ws=p.wildshape;
  const pct=Math.max(0,Math.min(100,Math.round((ws?.active?ws.beast.hpCur/Math.max(1,ws.beast.hpMax):p.hp/Math.max(1,p.hpMax))*100)));
  const hpColor=ws?.active?'#4caf50':pct>50?'#4caf50':pct>25?'#ff9800':'#e53935';

  // Calcul CA affichÃ©e avec statuts
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
        ${p.portrait?`<img src="${p.portrait}">`:`<div class="eq-portrait-hint">ðŸ“·<br>Cliquer</div>`}
      </div>
      <input type="file" id="portInput" accept="image/jpeg,image/png" style="display:none" onchange="uploadPortrait(this)">
      ${p.portrait?`<button class="btn bsm bdanger" style="margin-top:6px" onclick="upd('portrait',null);render()">Supprimer</button>`:''}
    </div>

    <!-- Statistiques (lecture seule joueur / Ã©ditables MJ) -->
    <div class="panel mb10">
      <div class="pt" style="display:flex;align-items:center;justify-content:space-between"><span>Statistiques</span>${ws?.active?`<span style="font-size:10px;color:#4caf50;border:1px solid #4caf50;border-radius:10px;padding:2px 8px">ðŸº Forme sauvage</span>`:isMJ()?`<span style="font-size:10px;color:var(--cp);border:1px solid var(--cp);border-radius:10px;padding:2px 8px">ðŸŽ² MJ</span>`:''}</div>
      ${ws?.active?`<div style="background:rgba(76,175,80,.08);border:1px solid rgba(76,175,80,.35);border-radius:8px;padding:10px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;gap:8px">
        <div style="display:flex;align-items:center;gap:8px"><span style="font-size:24px">${ws.beast.icon}</span><div><div style="font-size:13px;font-weight:700;color:#4caf50">ðŸº ${esc(ws.beast.name)}</div><div style="font-size:10px;color:var(--text3)">CA ${ws.beast.ac} â€¢ ${ws.beast.speed}</div></div></div>
        <button class="btn bsm" style="border-color:rgba(76,175,80,.5);color:#4caf50;white-space:nowrap" onclick="revertWildshape()">â†© Reprendre forme</button>
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
              <div style="font-size:9px;color:var(--text3);margin-top:1px">ðŸ§ ${p.abilities[i]}</div>
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
          <div class="sn" style="color:#4caf50">ðŸº PV bÃªte</div>
          <div style="font-size:22px;font-weight:700;color:#4caf50">${ws.beast.hpCur}</div>
          <div class="sm" style="color:#4caf50">${ws.beast.hpCur} / ${ws.beast.hpMax}</div>
        </div>
        <div class="sb" style="opacity:.65">
          <div class="sn">ðŸ”’ PV druide</div>
          <div style="font-size:20px;font-weight:700;color:var(--text3)">${ws.savedHp}</div>
          <div class="sm" style="color:var(--text3)">${ws.savedHp}/${p.hpMax} (gelÃ©s)</div>
        </div>
      </div>
      <div class="hp-bar"><div class="hp-fill" style="width:${pct}%;background:#4caf50"></div></div>
      <div class="hp-ctrl">
        <input class="fi" id="hpDelta" type="number" placeholder="montant" style="width:70px">
        <button class="btn bsm" style="background:#b71c1c;color:#fff;border-color:#b71c1c" onclick="applyHp(-1)">DÃ©gÃ¢ts bÃªte</button>
        <button class="btn bsm" style="background:#2e7d32;color:#fff;border-color:#2e7d32" onclick="applyHp(1)">Soins bÃªte</button>
      </div>
      <div class="g3 mt8">
        <div class="sb" style="border-color:#4caf50"><div class="sn" style="color:#4caf50">CA bÃªte</div><div style="font-size:20px;font-weight:700;color:#4caf50">${ws.beast.ac}</div></div>
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
        <button class="btn bsm" style="background:#b71c1c;color:#fff;border-color:#b71c1c" onclick="applyHp(-1)">DÃ©gÃ¢ts</button>
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
          <div style="display:flex;align-items:center;gap:4px"><span style="font-size:11px;color:#4caf50">âœ“</span>${[0,1,2].map(i=>`<span class="ds-circle${i<p.deathSaves.success?' s':''}" onclick="cycleDS('success',${i})"></span>`).join('')}</div>
          <div style="display:flex;align-items:center;gap:4px"><span style="font-size:11px;color:#e53935">âœ—</span>${[0,1,2].map(i=>`<span class="ds-circle${i<p.deathSaves.fail?' f':''}" onclick="cycleDS('fail',${i})"></span>`).join('')}</div>
          <button class="btn bsm" onclick="upd('deathSaves',{success:0,fail:0});render()">Reset</button>
        </div>
      </div>`}
    </div>

    ${ws?.active?`<div class="panel mb10" style="border-color:rgba(76,175,80,.4);background:rgba(76,175,80,.04)">
      <div class="pt" style="color:#4caf50;display:flex;align-items:center;gap:6px">${ws.beast.icon} ${esc(ws.beast.name)} â€” Attaques & Traits</div>
      ${ws.beast.attacks.map(a=>`<div style="background:rgba(76,175,80,.08);border:1px solid rgba(76,175,80,.2);border-radius:6px;padding:8px 10px;margin-bottom:6px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong style="color:#4caf50;font-size:13px">${esc(a.name)}</strong>
          <span style="color:var(--text2);font-size:12px">+${a.bonus} / <strong>${esc(a.dmg)}</strong> ${esc(a.type||'')}</span>
        </div>
        ${a.special?`<div style="font-size:11px;color:var(--text3);margin-top:3px">${esc(a.special)}</div>`:''}
        <button class="btn bsm" style="margin-top:6px;border-color:rgba(76,175,80,.4);color:#4caf50" onclick="rollCustomDmg('${esc(a.dmg)}','${esc(a.name)}')">ðŸŽ² ${esc(a.dmg)}</button>
      </div>`).join('')}
      ${ws.beast.traits.map(t=>`<div style="font-size:11px;color:var(--text2);padding:5px 0;border-bottom:1px solid rgba(76,175,80,.15)">ðŸ¾ ${esc(t)}</div>`).join('')}
    </div>`:''}

    <!-- RÃ©sistances & ImmunitÃ©s (rÃ©tractable) -->
    <div class="panel">
      <div class="pt" style="display:flex;align-items:center;justify-content:space-between;cursor:pointer" onclick="window._riOpen=!window._riOpen;render()">
        <span>RÃ©sistances & ImmunitÃ©s</span>
        <div style="display:flex;gap:6px;align-items:center">
          <span style="color:var(--text3);font-size:12px">${window._riOpen?'â–´':'â–¾'}</span>
          <button class="btn bsm" onclick="event.stopPropagation();openResistModal()">+ Ajouter</button>
        </div>
      </div>
      ${window._riOpen?(()=>{
        const res=p.dmgResistances||[];const imm=p.dmgImmunities||[];const ci=p.condImmunities||[];
        const tag=(cat,val,i)=>`<span class="status-badge bonus" style="cursor:pointer" title="Retirer" onclick="removeResist('${cat}',${i})">ðŸ›¡ ${esc(val)} âœ•</span>`;
        const tagImm=(cat,val,i)=>`<span class="status-badge malus" style="background:#2e1b00;border-color:#ff9800;color:#ff9800;cursor:pointer" title="Retirer" onclick="removeResist('${cat}',${i})">âœ¦ ${esc(val)} âœ•</span>`;
        const tagCond=(cat,val,i)=>`<span class="status-badge malus" style="cursor:pointer" title="Retirer" onclick="removeResist('${cat}',${i})">ðŸš« ${esc(val)} âœ•</span>`;
        const empty='<span style="font-size:11px;color:var(--text3);font-style:italic">Aucune</span>';
        return`<div style="margin-bottom:8px"><div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">RÃ©sistances dÃ©gÃ¢ts</div><div style="display:flex;flex-wrap:wrap;gap:4px">${res.length?res.map((v,i)=>tag('dmgResistances',v,i)).join(''):empty}</div></div>
        <div style="margin-bottom:8px"><div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">ImmunitÃ©s dÃ©gÃ¢ts</div><div style="display:flex;flex-wrap:wrap;gap:4px">${imm.length?imm.map((v,i)=>tagImm('dmgImmunities',v,i)).join(''):empty}</div></div>
        <div><div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">ImmunitÃ©s conditions</div><div style="display:flex;flex-wrap:wrap;gap:4px">${ci.length?ci.map((v,i)=>tagCond('condImmunities',v,i)).join(''):empty}</div></div>`;
      })():''}
    </div>
  </div>

  <!-- COLONNE DROITE -->
  <div>
    <!-- IdentitÃ© -->
    <div class="panel mb10">
      <div class="pt">IdentitÃ©</div>
      <div class="fl mb6">Nom</div>
      <input class="fi mb6" value="${esc(p.charName)}" onchange="upd('charName',this.value);render()">

      ${(p.classes||[]).map(c=>{const d=SRD.classes.find(cl=>cl.name===c.name);if(!d)return'';return`<div style="background:var(--surface2);border-radius:6px;padding:8px 10px;margin-bottom:6px">
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em">Classe</div>
        <div style="font-size:13px;color:var(--cp);font-weight:600;margin-top:2px">${esc(c.name)} â€” Niveau ${c.level}</div>
        <div style="font-size:12px;color:var(--text2);margin-top:2px">DÃ©: ${d.hd} â€¢ Armures: ${esc(d.armor.split(',')[0])}${d.spellcaster?' â€¢ <span style="color:var(--cp)">âœ¦ Lanceur de sorts</span>':''}</div>
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
        <div><div class="fl mb6">Bonus maÃ®trise</div><input class="fi" value="+${pb(lvl)}" readonly style="color:var(--cp);font-weight:600"></div>
      </div>
      <div class="fl mb6">Alignement</div>
      <select class="fi mb6" onchange="upd('alignment',this.value)">${['',... ALIGNMENTS].map(a=>`<option ${p.alignment===a?'selected':''}>${a}</option>`).join('')}</select>



      <!-- Inspiration -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:var(--surface2);border-radius:6px">
        <span style="font-size:13px;color:var(--text2)">Inspiration</span>
        <span onclick="toggleInspiration()" style="cursor:pointer;font-size:24px">${p.inspiration?'âœ¦':'âœ§'}</span>
      </div>
    </div>

    <!-- Repos -->
    <div class="panel">
      <div class="pt">Repos</div>
      <div style="display:flex;gap:8px">
        <div class="rest-btn short" onclick="doShortRest()">
          <div style="font-size:16px">â˜•</div>
          <div style="font-weight:600">Repos court</div>
          <div style="font-size:10px;color:var(--text3);margin-top:1px">â‰¥ 1 heure</div>
          <div style="font-size:10px;margin-top:2px">Lance le dÃ© de vie + CON</div>
        </div>
        <div class="rest-btn long" onclick="doLongRest()">
          <div style="font-size:16px">ðŸŒ™</div>
          <div style="font-weight:600">Repos long</div>
          <div style="font-size:10px;color:var(--text3);margin-top:1px">â‰¥ 8 heures</div>
          <div style="font-size:10px;margin-top:2px">PV max + sorts + charges</div>
        </div>
      </div>
    </div>

    <!-- Statuts -->
    <div class="panel mt10">
      <div class="pt" style="display:flex;align-items:center;justify-content:space-between"><span>Statuts</span><button class="btn bsm" onclick="openAddStatus()">+ Ajouter</button></div>
      ${(p.statuses||[]).length?`<div>${(p.statuses||[]).map((s,i)=>{
        const sid='st_'+i;
        const rollInfo=s.rollPenalty?` âš  ${s.rollPenalty.split(',').join(', ')}`:(s.rollBonus?` +ðŸŽ² ${s.rollBonus}`:'');
        const valInfo=s.value&&s.stat?` ${s.value>0?'+':''}${s.value} ${s.stat.toUpperCase()}`:'';
        return`<div class="sort-row">
          <div class="sort-head" onclick="document.getElementById('${sid}').classList.toggle('open')" style="padding:6px 10px">
            <span style="font-size:15px;margin-right:8px">${s.icon||'â—†'}</span>
            <div style="flex:1">
              <span class="status-badge ${s.type}" style="cursor:default;margin:0">${esc(s.name)}${valInfo}</span>
            </div>
            <span style="font-size:10px;color:var(--text3);margin-right:8px">â–¾</span>
            <span onclick="event.stopPropagation();removeStatus(${i})" style="cursor:pointer;color:var(--text3);font-size:15px">Ã—</span>
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

// â”€â”€ CONFIDENTIALITÃ‰ â”€â”€
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
    {id:'perso',label:'âš” Personnage',desc:'Nom, race, classe, apparence'},
    {id:'competences',label:'âœ¦ CompÃ©tences',desc:'CompÃ©tences & modificateurs'},
    {id:'combat',label:'ðŸ—¡ Combat',desc:'PV, CA, attaques'},
    {id:'sorts',label:'âœ¦ Sorts',desc:'Liste de sorts'},
    {id:'equipement',label:'ðŸ›¡ Ã‰quipement',desc:'Armures & armes'},
    {id:'sac',label:'ðŸŽ’ Sac',desc:'Inventaire & monnaie'},
    {id:'historique',label:'ðŸ“œ Historique',desc:'Traits, backstory (pas les secrets)'},
    {id:'xp',label:'âœ§ ExpÃ©rience',desc:'XP & niveau'},
  ];
  openModal(`<div class="pt">ðŸ”’ ConfidentialitÃ©</div>
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
    <div style="font-size:11px;color:var(--text3);margin-top:10px;padding:8px;background:rgba(200,168,75,.06);border-radius:6px;border:1px solid rgba(200,168,75,.15)">ðŸ” Les <strong>Secrets</strong> (onglet Historique) sont toujours privÃ©s â€” uniquement toi et le MJ.</div>
    <div style="display:flex;justify-content:flex-end;margin-top:14px"><button class="btn bac" onclick="closeModal()">Fermer</button></div>`);
}

// â”€â”€ PV & HP â”€â”€
function applyHp(sign){
  const p=P();const delta=parseInt(document.getElementById('hpDelta')?.value)||0;if(delta<=0)return;
  const ws=p.wildshape;
  if(ws?.active){
    if(sign<0){
      // DÃ©gÃ¢ts : bÃªte en prioritÃ©, overflow sur le druide
      const overflow=Math.max(0,delta-ws.beast.hpCur);
      ws.beast.hpCur=Math.max(0,ws.beast.hpCur-delta);
      if(ws.beast.hpCur<=0){
        p.hp=Math.max(0,ws.savedHp-overflow);
        delete p.wildshape;
        showToast(`ðŸ’¥ La bÃªte tombe Ã  0 PV ! Retour Ã  la forme de druide${overflow>0?' (-'+overflow+' PV dÃ©bordants)':''}.`);
      }
    } else {
      // Soins : vers les PV de la bÃªte (cap au max)
      ws.beast.hpCur=Math.min(ws.beast.hpMax,ws.beast.hpCur+delta);
    }
  } else {
    p.hp=Math.max(0,Math.min(p.hpMax+(p.hpTemp||0),p.hp+sign*delta));
    if(sign<0&&(p.statuses||[]).some(s=>s.name==='Concentration'))showToast(`âš ï¸ Concentration â€” Lance ton JS CON (onglet Sorts) !`,3500);
  }
  _markUnsaved();render();
}
function cycleDS(type,idx){const p=P();p.deathSaves[type]=p.deathSaves[type]>idx?idx:idx+1;_markUnsaved();render();}

// â”€â”€ STATUTS â”€â”€
// Ã‰tats officiels SRD + bonus courants
const STATUS_PRESETS=[
  // â”€â”€ Ã‰tats officiels â”€â”€
  {name:"Ã€ terre",type:"malus",stat:"",value:0,icon:"â¬‡",desc:"DÃ©savantage aux jets d'attaque. Avantage pour les attaquants Ã  1,5m. Seul mouvement possible : ramper.",rollPenalty:"attaque"},
  {name:"AgrippÃ©",type:"malus",stat:"",value:0,icon:"âœŠ",desc:"Vitesse rÃ©duite Ã  0.",rollPenalty:""},
  {name:"Assourdi",type:"malus",stat:"",value:0,icon:"ðŸ”‡",desc:"Rate automatiquement les jets nÃ©cessitant l'ouÃ¯e.",rollPenalty:""},
  {name:"AveuglÃ©",type:"malus",stat:"",value:0,icon:"ðŸ‘",desc:"Rate les jets nÃ©cessitant la vue. DÃ©savantage aux jets d'attaque. Les attaquants ont avantage.",rollPenalty:"attaque"},
  {name:"CharmÃ©",type:"malus",stat:"",value:0,icon:"ðŸ’œ",desc:"Ne peut pas attaquer le charmeur. Le charmeur a avantage aux jets sociaux.",rollPenalty:""},
  {name:"EffrayÃ©",type:"malus",stat:"",value:0,icon:"ðŸ˜±",desc:"DÃ©savantage aux jets de carac. et d'attaque si la source est en vue.",rollPenalty:"attaque,carac"},
  {name:"EmpoisonnÃ©",type:"malus",stat:"",value:0,icon:"â˜ ",desc:"DÃ©savantage aux jets d'attaque et aux jets de caractÃ©ristique.",rollPenalty:"attaque,carac"},
  {name:"EntravÃ©",type:"malus",stat:"",value:0,icon:"â›“",desc:"Vitesse 0. DÃ©savantage aux jets d'attaque et JS DEX. Avantage pour les attaquants.",rollPenalty:"attaque,dex-save"},
  {name:"Ã‰tourdi",type:"malus",stat:"",value:0,icon:"ðŸ’«",desc:"Incapable d'agir. Rate automatiquement JS FOR et DEX. Avantage pour les attaquants.",rollPenalty:"attaque,for-save,dex-save"},
  {name:"IncapacitÃ©",type:"malus",stat:"",value:0,icon:"ðŸš«",desc:"Ne peut effectuer aucune action ni rÃ©action.",rollPenalty:""},
  {name:"Inconscient",type:"malus",stat:"",value:0,icon:"ðŸ’¤",desc:"Incapable d'agir, tombe Ã  terre. Rate JS FOR et DEX. Attaquants ont avantage. Coups critiques Ã  1,5m.",rollPenalty:"attaque,for-save,dex-save"},
  {name:"Invisible",type:"bonus",stat:"",value:0,icon:"ðŸ‘»",desc:"Avantage aux jets d'attaque. DÃ©savantage pour les attaquants.",rollPenalty:""},
  {name:"ParalysÃ©",type:"malus",stat:"",value:0,icon:"ðŸ§Š",desc:"Incapable d'agir. Rate JS FOR et DEX. Attaquants ont avantage. Critiques Ã  1,5m.",rollPenalty:"for-save,dex-save"},
  {name:"PÃ©trifiÃ©",type:"malus",stat:"",value:0,icon:"ðŸ—¿",desc:"TransformÃ© en pierre. Incapable d'agir. Rate JS FOR et DEX. RÃ©sistance Ã  tous les dÃ©gÃ¢ts.",rollPenalty:"for-save,dex-save"},
  // â”€â”€ Ã‰puisement â”€â”€
  {name:"Ã‰puisement 1",type:"malus",stat:"",value:0,icon:"ðŸ˜“",desc:"DÃ©savantage aux jets de caractÃ©ristique.",rollPenalty:"carac"},
  {name:"Ã‰puisement 2",type:"malus",stat:"",value:0,icon:"ðŸ˜°",desc:"DÃ©savantage aux jets de carac. + vitesse divisÃ©e par 2.",rollPenalty:"carac"},
  {name:"Ã‰puisement 3",type:"malus",stat:"",value:0,icon:"ðŸ˜µ",desc:"DÃ©savantage aux jets d'attaque, de carac. et de sauvegarde.",rollPenalty:"attaque,carac,save"},
  // â”€â”€ Bonus courants â”€â”€
  {name:"BÃ©ni",type:"bonus",stat:"",value:0,icon:"âœ¨",desc:"+1d4 aux jets d'attaque et jets de sauvegarde.",rollBonus:"1d4:attaque,save"},
  {name:"Maudit",type:"malus",stat:"",value:0,icon:"ðŸŒ‘",desc:"DÃ©savantage aux jets de caractÃ©ristique pour une stat.",rollPenalty:"carac"},
  {name:"InspirÃ©",type:"bonus",stat:"",value:0,icon:"âš¡",desc:"+1d6 Ã  un jet (bardique).",rollBonus:"1d6:un"},
  {name:"GuidÃ©",type:"bonus",stat:"",value:0,icon:"ðŸŒŸ",desc:"+1d4 Ã  un jet de compÃ©tence (sort Guidance).",rollBonus:"1d4:compÃ©tence"},
  {name:"Concentration",type:"neutral",stat:"",value:0,icon:"ðŸŽ¯",desc:"Sort de concentration actif. Prend fin si blessÃ© (JS CON DD10 ou moitiÃ© dÃ©gÃ¢ts).",rollPenalty:""},
  {name:"HÃ¢te",type:"bonus",stat:"ca",value:2,icon:"ðŸ’¨",desc:"+2 CA, avantage aux JS DEX, vitesse doublÃ©e, action supplÃ©mentaire.",rollPenalty:""},
  {name:"Lenteur",type:"malus",stat:"",value:0,icon:"ðŸ¢",desc:"Vitesse divisÃ©e par 2, -2 CA, dÃ©savantage aux JS DEX.",rollPenalty:"dex-save"},
  {name:"Ã€ couvert Â½",type:"bonus",stat:"ca",value:2,icon:"ðŸ›¡",desc:"+2 CA et jets de sauvegarde DEX (demi-couvert).",rollPenalty:""},
  {name:"Ã€ couvert Â¾",type:"bonus",stat:"ca",value:5,icon:"ðŸ›¡",desc:"+5 CA et jets de sauvegarde DEX (couvert 3/4).",rollPenalty:""},
  // â”€â”€ Bonus/Malus de stats â”€â”€
  {name:"FOR boostÃ©e",type:"bonus",stat:"for",value:4,icon:"ðŸ’ª",desc:"+4 Ã  la Force (sort AmÃ©lioration de caractÃ©ristique)."},
  {name:"DEX boostÃ©e",type:"bonus",stat:"dex",value:4,icon:"ðŸˆ",desc:"+4 Ã  la DextÃ©ritÃ©."},
  {name:"CON boostÃ©e",type:"bonus",stat:"con",value:4,icon:"â¤",desc:"+4 Ã  la Constitution."},
  {name:"INT rÃ©duite",type:"malus",stat:"int",value:-4,icon:"ðŸ§ ",desc:"-4 Ã  l'Intelligence (malÃ©diction)."},
  {name:"SAG rÃ©duite",type:"malus",stat:"sag",value:-4,icon:"ðŸ‘",desc:"-4 Ã  la Sagesse."},
  {name:"CHA rÃ©duit",type:"malus",stat:"cha",value:-4,icon:"ðŸ’¬",desc:"-4 au Charisme."},
  {name:"PV temp. (sort)",type:"bonus",stat:"hp",value:10,icon:"ðŸ’š",desc:"+10 PV temporaires (sort Fausse vie ou similaire)."},
];
function openAddStatus(){
  openModal(`<div class="pt">+ Ajouter un statut</div>
    <div style="margin-bottom:12px">
      <div class="fl mb6">Ã‰tats officiels & conditions</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;max-height:180px;overflow-y:auto;padding:4px">
        ${STATUS_PRESETS.map((s,i)=>`<span class="status-badge ${s.type}" style="cursor:pointer" onclick="quickAddStatus(${i})">${s.icon} ${esc(s.name)}</span>`).join('')}
      </div>
    </div>
    <hr style="border-color:var(--border);margin-bottom:12px">
    <div class="fl mb6">Statut personnalisÃ©</div>
    <input class="fi mb6" id="stName" placeholder="Nom du statut">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">
      <select class="fi" id="stType">
        <option value="bonus">âœ… Bonus</option>
        <option value="malus">âŒ Malus</option>
        <option value="neutral">â—† Neutre</option>
      </select>
      <select class="fi" id="stStat">
        <option value="">Stat affectÃ©e (optionnel)</option>
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
        <option value="">Jet affectÃ© (optionnel)</option>
        <option value="attaque">DÃ©savantage aux attaques</option>
        <option value="carac">DÃ©savantage jets carac.</option>
        <option value="save">DÃ©savantage sauvegardes</option>
        <option value="dex-save">DÃ©savantage JS DEX</option>
        <option value="for-save">DÃ©savantage JS FOR</option>
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
    value:s.value||0,icon:s.icon||'â—†',desc:s.desc||'',
    rollPenalty:s.rollPenalty||'',rollBonus:s.rollBonus||''
  });
  closeModal();render();
}

function addCustomStatus(){
  const name=(document.getElementById('stName')?.value||'').trim();
  if(!name){showToast('âŒ Nom requis');return;}
  const type=document.getElementById('stType')?.value||'neutral';
  const stat=document.getElementById('stStat')?.value||'';
  const value=parseInt(document.getElementById('stVal')?.value)||0;
  const rollPenalty=document.getElementById('stRollPenalty')?.value||'';
  const desc=document.getElementById('stDesc')?.value||'';
  const p=P();if(!p.statuses)p.statuses=[];
  p.statuses.push({name,type,stat,value,icon:type==='bonus'?'âœ…':type==='malus'?'âŒ':'â—†',desc,rollPenalty,rollBonus:''});
  closeModal();render();
}
function removeStatus(i){const p=P();if(p.statuses)p.statuses.splice(i,1);render();}
function toggleConcentration(spellName){const p=P();if(!p.statuses)p.statuses=[];const idx=p.statuses.findIndex(s=>s.name==='Concentration');if(idx>=0){p.statuses.splice(idx,1);delete p.concentrationSpell;}else{const preset=STATUS_PRESETS.find(s=>s.name==='Concentration');p.statuses.push(preset?{...preset}:{name:'Concentration',type:'neutral',icon:'ðŸŽ¯',desc:'Sort de concentration actif.',rollPenalty:''});if(spellName)p.concentrationSpell=spellName;}_markUnsaved();render();}
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
  showToast(`ðŸŽ¯ JS Concentration â€” d20(${d20})${modStr}${hasCON?' (maÃ®trise)':''} = <strong>${total}</strong> vs DD ${dd} â€” ${success?'<span style="color:#4caf50">âœ“ RÃ©ussi ! Concentration maintenue.</span>':'<span style="color:#e53935">âœ— RatÃ© ! Concentration brisÃ©e.</span>'}`,5000);
  render();
}

// â”€â”€ RÃ‰SISTANCES & IMMUNITÃ‰S â”€â”€
const _DMG_TYPES=['Acide','Froid','Feu','Foudre','NÃ©crotique','Poison','Psychique','Radieux','Tonnerre','Contondant','Perforant','Tranchant','Contondant/Perforant/Tranchant non-magiques','Contondant/Perforant/Tranchant (non-argent/non-magique)'];
const _COND_TYPES=['CharmÃ©','EffrayÃ©','EmpoisonnÃ©','Assourdi','AveuglÃ©','Ã€ terre','AgrippÃ©','EntravÃ©','Ã‰tourdi','IncapacitÃ©','Inconscient','ParalysÃ©','PÃ©trifiÃ©','Ã‰puisement'];
function removeResist(cat,i){const p=P();if(!p[cat])return;p[cat].splice(i,1);render();}
function addResist(cat,val){const p=P();if(!val||!val.trim())return;if(!p[cat])p[cat]=[];if(!p[cat].includes(val.trim()))p[cat].push(val.trim());render();}
function openResistModal(){
  openModal(`<div>
    <div class="pt" style="margin-bottom:12px">+ RÃ©sistances & ImmunitÃ©s</div>
    <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">RÃ©sistances aux dÃ©gÃ¢ts</div>
    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px">${_DMG_TYPES.map(t=>`<span class="status-badge bonus" style="cursor:pointer" onclick="addResist('dmgResistances','${esc(t)}');closeModal()">ðŸ›¡ ${esc(t)}</span>`).join('')}</div>
    <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">ImmunitÃ©s aux dÃ©gÃ¢ts</div>
    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px">${_DMG_TYPES.map(t=>`<span class="status-badge" style="background:#2e1b00;border-color:#ff9800;color:#ff9800;cursor:pointer" onclick="addResist('dmgImmunities','${esc(t)}');closeModal()">âœ¦ ${esc(t)}</span>`).join('')}</div>
    <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">ImmunitÃ©s aux conditions</div>
    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px">${_COND_TYPES.map(t=>`<span class="status-badge malus" style="cursor:pointer" onclick="addResist('condImmunities','${esc(t)}');closeModal()">ðŸš« ${esc(t)}</span>`).join('')}</div>
    <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">PersonnalisÃ©</div>
    <div style="display:flex;gap:6px">
      <input class="fi" id="resistCustom" placeholder="Type de dÃ©gÃ¢t ou condition..." style="flex:1">
      <select id="resistCat" style="padding:7px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:12px">
        <option value="dmgResistances">RÃ©sistance</option>
        <option value="dmgImmunities">ImmunitÃ© dÃ©gÃ¢ts</option>
        <option value="condImmunities">ImmunitÃ© condition</option>
      </select>
      <button class="btn bac bsm" onclick="addResist(document.getElementById('resistCat').value,document.getElementById('resistCustom').value);closeModal()">+ Ajouter</button>
    </div>
  </div>`);
}

// â”€â”€ REPOS â”€â”€
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
  render();saveAll();showToast(`â˜• Repos court â€” ${cd.hd}(${roll-mod(p.abilities[2])})+CON = <strong>+${healed} PV</strong>`);
}
function doLongRest(){
  const p=P();p.hp=p.hpMax;p.spellSlotsUsed=[];
  p.deathSaves={success:0,fail:0};
  p.conditions=[];
  if(!p.combatCharges)p.combatCharges={};
  (p.classes||[]).forEach(cls=>{const d=SRD.classes.find(c=>c.name===cls.name);if(!d||!d.combatFeatures)return;d.combatFeatures.forEach(f=>{if(f.recovery!=='passive'){const max=getChargesMax(f,p);p.combatCharges[f.name]=max;}});});
  (p.customCombatFeats||[]).forEach(f=>{if(f.recovery!=='passive'&&f.charges>0)p.combatCharges[f.name]=f.charges;});
  render();saveAll();showToast('ðŸŒ™ Repos long â€” PV, sorts, charges et conditions rÃ©cupÃ©rÃ©s !');
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
