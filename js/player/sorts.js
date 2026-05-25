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
