// TAB: SORTS
// ═══════════════════════════════════════
let _sortSubTab = 'mes-sorts'; // 'mes-sorts' | 'compendium' | 'apprendre'
let _learnSpellSearch = {q:'',school:''};

// Panneau Concentration (partagé) — affiché dans l'onglet Combat quand un sort de concentration est actif.
function renderConcPanel(p){
  if(!(p.statuses||[]).some(s=>s.name==='Concentration')) return '';
  const _mc=mainClass(p);const _hasCON=(CLASS_SAVES[_mc?_mc.name:'']||[]).includes(2);
  const conSaveBonus=mod(p.abilities?p.abilities[2]:10)+(_hasCON?pb(totalLevel(p)):0);
  const conSaveLabel=`JS CON ${fmt(conSaveBonus)}${_hasCON?' (maîtrise incluse)':''}`;
  const concSpell=p.concentrationSpell||'';
  return `<div class="conc-panel-pulse" style="background:var(--surface2);border:2px solid #ffd54f;border-radius:10px;padding:12px;margin-bottom:10px">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
      <span style="font-size:25px">🎯</span>
      <div style="flex:1"><div style="font-size:18px;font-weight:700;color:#ffd54f">Concentration</div>${concSpell?`<div style="font-size:18px;color:var(--text2);margin-top:1px">${esc(concSpell)}</div>`:''}</div>
      <button class="btn bsm" style="font-size:17px" onclick="toggleConcentration()">✕ Briser</button>
    </div>
    <div style="font-size:17px;color:var(--text3);margin-bottom:10px;line-height:1.5">Si tu subis des dégâts, lance un <strong style="color:var(--text2)">JS CON</strong> (DD = max 10 ou moitié des dégâts reçus). Échec = concentration brisée.</div>
    <div style="display:flex;gap:6px;align-items:center">
      <input type="number" id="concDmgInput" placeholder="Dégâts reçus" min="0" style="flex:1;padding:7px 10px;background:var(--surface);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:18px">
      <button class="btn bac" style="white-space:nowrap;font-size:18px" onclick="rollConcSave(parseInt(document.getElementById('concDmgInput')?.value)||0)">🎲 ${conSaveLabel}</button>
    </div>
  </div>`;
}

function tabSorts(p){
  const hasCaster = (p.classes||[{name:p.classe,level:p.niveau||1}]).some(c=>{
    const d=SRD.classes.find(x=>x.name===c.name); return d&&d.spellcaster;
  }) || (p.features||[]).some(f=>f.name==='Escroc arcanique'||f.name==='Chevalier occulte'); // tiers-lanceurs
  if(!hasCaster) return`<div class="panel"><p style="color:var(--text3);font-size:18px">Cette classe n'est pas une classe de sorts.</p></div>`;

  const userIsMJ = isMJ(); // via mjMode — sera connecté aux rôles Firebase
  const magLvl = ((p.classes||[]).find(c=>c.name==='Magicien')||{}).level||0;
  const prepCaster = isPrepCaster(p);

  // Sous-tabs
  const hasMultiSubs=userIsMJ||magLvl>0||prepCaster;
  if(!hasMultiSubs)_sortSubTab='mes-sorts';
  const subBar = hasMultiSubs?`<div style="display:flex;gap:6px;margin-bottom:12px">
    <button class="btn${_sortSubTab==='mes-sorts'?' bprimary':''}" onclick="_sortSubTab='mes-sorts';render()" style="flex:1">📖 Mes sorts</button>
    ${(userIsMJ||prepCaster)?`<button class="btn${_sortSubTab==='compendium'?' bprimary':''}" onclick="_sortSubTab='compendium';${prepCaster&&!userIsMJ?`_spellSearch.cls='${(mainClass(p)||{name:''}).name}';`:''}render()" style="flex:1">📚 ${userIsMJ?'Ajouter (MJ)':'Parcourir'}</button>`:''}
    ${magLvl?`<button class="btn${_sortSubTab==='apprendre'?' bprimary':''}" onclick="_sortSubTab='apprendre';render()" style="flex:1">📜 Apprendre</button>`:''}
  </div>`:'';

  // Panneau Concentration déplacé vers l'onglet Combat (renderConcPanel).

  if(_sortSubTab === 'compendium' && (userIsMJ||prepCaster)){
    return`<div>${subBar}${prepCaster&&!userIsMJ?`<div style="font-size:17px;color:var(--text3);padding:4px 0 8px">Cliquez sur un sort pour l'ajouter à votre liste. Vous pouvez ensuite le préparer depuis "Mes sorts".</div>`:''}${renderCompendiumSearch(p)}</div>`;
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
    prepInfo = `<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:8px;font-size:18px">
      <span style="color:var(--text2)">Sorts préparés :</span>
      <strong style="color:${prepCount>prepMax?'#e53935':'#4caf50'};font-size:19px">${prepCount}/${prepMax}</strong>
      <span style="color:var(--text3);font-size:17px">(Cliquez sur un sort pour le préparer / retirer)</span>
    </div>`;
  }

  // Emplacements de sorts dans l'onglet Sorts
  const slots=calcSpellSlots(p);const slotsUsed=p.spellSlotsUsed||[];
  const warlockSlots=getWarlockSlots(p);
  const slotHtml=(()=>{
    if(warlockSlots){
      return`<div style="margin-bottom:10px;padding:10px;background:var(--surface2);border-radius:8px">
        <div style="font-size:17px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Magie de pacte — Niv.${warlockSlots[1]}</div>
        <div style="display:flex;align-items:center;gap:8px">
          <div style="display:flex;gap:4px">${Array.from({length:warlockSlots[0]},(_,si)=>`<span class="slot-bubble${si<(slotsUsed[9]||0)?' used':''}" onclick="toggleWarlockSlot(${si},${warlockSlots[0]})" style="width:16px;height:16px"></span>`).join('')}</div>
          <span style="font-size:17px;color:var(--text3)">${warlockSlots[0]-(slotsUsed[9]||0)}/${warlockSlots[0]}</span>
          <button class="btn bsm" onclick="P().spellSlotsUsed=P().spellSlotsUsed||[];P().spellSlotsUsed[9]=0;render()">↺</button>
        </div>
      </div>`;
    }
    if(!slots)return'';
    const rows=slots.map((total,ni)=>total?`<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
      <span style="font-size:17px;color:var(--text2);width:46px">Niv. ${ni+1}</span>
      <div>${Array.from({length:total},(_,si)=>`<span class="slot-bubble${si<(slotsUsed[ni]||0)?' used':''}" onclick="toggleSlot(${ni},${si},${total})"></span>`).join('')}</div>
      <span style="font-size:15px;color:var(--text3)">${total-(slotsUsed[ni]||0)}/${total}</span>
    </div>`:''). join('');
    return`<div style="margin-bottom:10px;padding:10px;background:var(--surface2);border-radius:8px">
      <div style="font-size:17px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Emplacements de sorts</div>
      ${rows}
      <button class="btn bsm" style="margin-top:4px" onclick="upd('spellSlotsUsed',[]);render()">↺ Récupérer tous (repos long)</button>
    </div>`;
  })();
  const circleSection=(()=>{
    const druEntry=(p.classes||[]).find(c=>c.name==='Druide');
    if(!druEntry||druEntry.level<3)return'';
    const arch=(p.archetype||{})['Druide']||'';
    if(!arch.toLowerCase().includes('terres'))return'';
    const terrain=p.druidTerrain||'';
    if(!terrain)return`<div style="font-size:17px;color:var(--text3);padding:8px 0;font-style:italic">⭐ Sorts du Cercle — terrain non configuré. Réinitialisez votre personnage (respec MJ) pour choisir un terrain.</div>`;
    const cs=getDruidCircleSpells(p);
    if(!cs.length)return'';
    return`<div style="margin-bottom:10px;padding:10px;background:rgba(200,168,75,.06);border:1px solid rgba(200,168,75,.3);border-radius:10px">
      <div style="font-size:17px;font-weight:700;color:var(--cp);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">⭐ Sorts du Cercle — ${esc(terrain)}</div>
      <div style="font-size:15px;color:var(--text3);margin-bottom:8px;font-style:italic">Toujours préparés · Ne comptent pas dans le quota · Consomment un emplacement de sort au lancer</div>
      ${cs.map(sp=>{const d=findSpellData(sp.name);return`<div style="font-size:18px;padding:5px 8px;margin-bottom:3px;background:var(--surface2);border-radius:6px;display:flex;align-items:center;gap:8px">
        <span style="color:var(--cp);font-size:17px">⭐</span>
        <div style="flex:1"><span style="font-weight:500">${esc(sp.name)}</span>${d?`<span style="font-size:15px;color:var(--text3);margin-left:6px">${sp.level===0?'Cantrip':'Niv.'+sp.level}${d.school?' · '+esc(d.school):''}${d.castTime?' · '+esc(d.castTime):''}</span>`:'<span style="font-size:15px;color:var(--text3);margin-left:6px">Niv.'+sp.level+'</span>'}</div>
      </div>`;}).join('')}
    </div>`;
  })();
  return`<div>
    ${subBar}
    <div class="panel">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <div class="pt" style="margin-bottom:0">Mes sorts (${knownCount})</div>
      </div>
      ${slotHtml}
      ${circleSection}
      ${prepInfo}
      ${renderSpellList(p, false)}
    </div>
  </div>`;
}

// ═══════════════════════════════════════════════════════════
//  PRÉPARATION DES SORTS AU REPOS LONG (principe 18 / mécanisme C)
//  Liste complète : Clerc, Druide, Paladin, Artificier. MAGICIEN = depuis son GRIMOIRE uniquement.
// ═══════════════════════════════════════════════════════════
let _lrPrep=null;
function _prepMaxForClass(p,className){
  const ab=p.abilities||[10,10,10,10,10,10];
  const intM=mod(ab[3]),sagM=mod(ab[4]),chaM=mod(ab[5]);
  const c=(p.classes||[]).find(x=>x.name===className);if(!c)return 1;
  const lvl=c.level;
  if(className==='Magicien')return Math.max(1,intM+lvl);
  if(className==='Clerc'||className==='Druide')return Math.max(1,sagM+lvl);
  if(className==='Paladin')return Math.max(1,chaM+Math.ceil(lvl/2));
  if(className==='Artificier')return Math.max(1,intM+Math.ceil(lvl/2));
  return 1;
}
function _prepMaxSpellLevel(p){
  const slots=calcSpellSlots(p)||[];let m=0;slots.forEach((n,i)=>{if(n>0)m=i+1;});return Math.max(1,m);
}
function _lrPrepClassList(p,className){
  const db=getSpellsDB()||[];const en=(typeof _CLASS_NAME_EN!=='undefined'?_CLASS_NAME_EN[className]:'')||className;const maxLvl=_prepMaxSpellLevel(p);
  // MAGICIEN : prépare depuis son GRIMOIRE uniquement (p.spells), PAS toute la liste de classe (RAW + principe 18).
  // Sinon il pourrait préparer des sorts jamais appris — et la copie au grimoire (50 po/niveau) ne servirait à rien.
  if(className==='Magicien'){
    const seen=new Set();const out=[];
    (p.spells||[]).forEach(sp=>{const d=findSpellData(sp.name);if(d&&d.level>=1&&d.level<=maxLvl&&!seen.has(d.name)){seen.add(d.name);out.push(d);}});
    out.sort((a,b)=>(a.level-b.level)||(a.name||'').localeCompare(b.name||''));
    return out;
  }
  return db.filter(s=>s.level>=1&&s.level<=maxLvl&&(!s.classes||!s.classes.length||s.classes.includes(className)||s.classes.includes(en)));
}
function _lrAlwaysPrepared(p,className){
  // Sorts TOUJOURS préparés modélisés (Cercle des terres). Domaine/Serment → à brancher avec ces classes (@OPTION_B).
  if(className==='Druide'&&typeof getDruidCircleSpells==='function')return getDruidCircleSpells(p).filter(s=>s.level>0).map(s=>s.name);
  return [];
}
function _openLongRestPrep(p){
  p=p||P();
  const prepClasses=(p.classes||[]).filter(c=>typeof PREP_CASTERS!=='undefined'&&PREP_CASTERS.includes(c.name));
  if(!prepClasses.length)return false;
  if(!SPELLS_DB){loadSpellsDB(()=>_openLongRestPrep(p));return true;}
  const cls=prepClasses.slice().sort((a,b)=>(b.level||0)-(a.level||0))[0];
  const sel=new Set((p.spells||[]).filter(s=>{const d=findSpellData(s.name);return s.prepared&&d&&d.level>0;}).map(s=>s.name));
  _lrPrep={cls:cls.name,sel,search:'',multi:prepClasses.length>1};
  _renderLongRestPrepModal(p);
  return true;
}
function _lrPrepToggle(name){
  if(!_lrPrep)return;
  const p=P();const N=_prepMaxForClass(p,_lrPrep.cls);
  if(_lrPrep.sel.has(name))_lrPrep.sel.delete(name);
  else{if(_lrPrep.sel.size>=N)return;_lrPrep.sel.add(name);}
  _renderLongRestPrepModal(p);
}
function _lrPrepSearch(v){if(_lrPrep){_lrPrep.search=v;_renderLongRestPrepModal(P());}}
function _renderLongRestPrepModal(p){
  if(!_lrPrep)return;
  const className=_lrPrep.cls;
  const N=_prepMaxForClass(p,className);
  const always=new Set(_lrAlwaysPrepared(p,className));
  const list=_lrPrepClassList(p,className).filter(s=>!always.has(s.name));
  const q=(_lrPrep.search||'').toLowerCase().trim();
  const shown=q?list.filter(s=>s.name.toLowerCase().includes(q)||(s.nameEN||'').toLowerCase().includes(q)):list;
  const byLvl={};shown.forEach(s=>{(byLvl[s.level]=byLvl[s.level]||[]).push(s);});
  const full=_lrPrep.sel.size>=N;
  const row=s=>{const on=_lrPrep.sel.has(s.name);const dis=!on&&full;return`<div class="sk-choice${on?' selected':dis?' disabled':''}" onclick="${dis?'':`_lrPrepToggle('${jsq(s.name)}')`}"><span class="sk-dot${on?' p':''}"></span><span style="flex:1;font-size:18px">${esc(s.name)}</span><span style="font-size:17px;color:var(--text3)">${esc(s.school||'')}</span>${on?'<span style="color:var(--cp)">✓</span>':''}</div>`;};
  let body='';
  Object.keys(byLvl).map(Number).sort((a,b)=>a-b).forEach(l=>{body+=`<div style="font-size:18px;font-weight:600;color:var(--cp);margin:8px 0 4px">Niveau ${l}</div>${byLvl[l].map(row).join('')}`;});
  if(!shown.length)body=`<div style="font-size:18px;color:var(--text3);padding:8px 0">Aucun sort.</div>`;
  const alwaysHtml=always.size?`<div style="font-size:17px;color:var(--text3);margin-bottom:8px">⭐ Toujours préparés (hors quota) : ${[...always].map(esc).join(', ')}</div>`:'';
  openModal(`<div class="pt">🌙 Préparation des sorts — ${esc(className)}</div>
    ${_lrPrep.multi?`<div style="font-size:17px;color:#ff9800;margin-bottom:8px">Multiclasse : préparation de la classe principale (${esc(className)}). Les autres classes se préparent depuis l'onglet Sorts.</div>`:''}
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:18px"><span style="color:var(--text2)">Sorts préparés :</span><strong style="color:${_lrPrep.sel.size>N?'#e53935':'#4caf50'};font-size:21px">${_lrPrep.sel.size}/${N}</strong></div>
    ${alwaysHtml}
    <input type="text" placeholder="🔍 Rechercher..." value="${esc(_lrPrep.search||'')}" oninput="_lrPrepSearch(this.value)" style="width:100%;box-sizing:border-box;padding:7px 10px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:18px;margin-bottom:8px">
    <div style="max-height:46vh;overflow-y:auto">${body}</div>
    <div style="display:flex;gap:8px;margin-top:14px">
      <button class="btn" style="flex:1" onclick="_lrPrep=null;closeModal()">Garder l'actuel</button>
      <button class="btn bac" style="flex:2" onclick="_applyLongRestPrep()">✓ Valider</button>
    </div>`);
  // Rendre la recherche utilisable malgré la reconstruction de la modale (re-focus + curseur en fin)
  setTimeout(()=>{const i=document.querySelector('#modal input');if(i&&_lrPrep&&_lrPrep.search){i.focus();try{i.setSelectionRange(i.value.length,i.value.length);}catch(e){}}},0);
}
function _applyLongRestPrep(){
  const p=P();if(!_lrPrep){closeModal();return;}
  const className=_lrPrep.cls;
  const list=_lrPrepClassList(p,className);
  const always=new Set(_lrAlwaysPrepared(p,className));
  if(!p.spells)p.spells=[];
  list.forEach(s=>{
    if(always.has(s.name))return;
    const checked=_lrPrep.sel.has(s.name);
    const ex=p.spells.find(x=>x.name===s.name);
    if(checked){if(ex){ex.prepared=true;if(ex.level==null)ex.level=s.level;}else p.spells.push({name:s.name,level:s.level,prepared:true});}
    else if(ex){ex.prepared=false;}
  });
  _lrPrep=null;closeModal();render();saveAll();showToast('✨ Sorts préparés mis à jour.');
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
      <div style="font-size:18px;font-weight:600;color:var(--cp);margin-bottom:4px">📜 Copier un sort dans votre grimoire</div>
      <div style="font-size:18px;color:var(--text3)">Coût : 2h + <strong>50 po par niveau du sort</strong> — Tous les sorts Magicien disponibles</div>
      <div style="font-size:18px;color:var(--text2);margin-top:4px">Votre trésor actuel : <strong style="color:var(--cp)">${cur.po||0} po</strong></div>
    </div>
    ${!isLoaded?`<div style="text-align:center;padding:16px"><button class="btn bprimary" onclick="loadSpellsDB(()=>render())">⬇️ Charger le compendium</button></div>`:`
      <div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap">
        <input type="text" placeholder="🔍 Rechercher..." value="${esc(_learnSpellSearch.q)}"
          oninput="_learnSpellSearch.q=this.value;render()"
          style="flex:2;min-width:140px;padding:7px 10px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:18px">
        <select onchange="_learnSpellSearch.school=this.value;render()"
          style="flex:1;min-width:100px;padding:7px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:18px">
          <option value="">Toutes écoles</option>
          ${schools.map(sc=>`<option value="${sc}"${_learnSpellSearch.school===sc?' selected':''}>${sc}</option>`).join('')}
        </select>
      </div>
      <div style="font-size:17px;color:var(--text3);margin-bottom:8px">${results.length} sort(s) disponible(s) à copier</div>
      <div style="max-height:400px;overflow-y:auto">
        ${results.map(s=>{
          const cost = s.level * 50;
          const canAfford = (cur.po||0) >= cost;
          return`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:8px 10px;margin-bottom:5px;display:flex;align-items:center;gap:8px">
            <div style="flex:1;min-width:0">
              <div style="font-size:18px;font-weight:600">${esc(s.name)}</div>
              <div style="font-size:17px;color:var(--text3)">Niv.${s.level} • ${esc(s.school)} • ${esc(s.castTime)}</div>
              <div style="font-size:17px;color:${canAfford?'#4caf50':'#e53935'};margin-top:2px">${cost} po — ${canAfford?'✓ Fonds suffisants':'✗ Fonds insuffisants'}</div>
            </div>
            <button class="btn bsm${canAfford?' bprimary':''}" onclick="learnSpell('${jsq(s.name)}',${s.level},${cost})" ${canAfford?'':'disabled'}>Copier</button>
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
        <div style="font-size:19px;font-weight:600;color:var(--cp);margin-bottom:6px">📚 Compendium de sorts</div>
        <div style="font-size:18px;color:var(--text3);margin-bottom:12px">1213 sorts disponibles. Placez <strong>spells_db.json</strong> dans le même dossier que la fiche.</div>
        <button class="btn bprimary" onclick="loadSpellsDB(()=>render())">⬇️ Charger le compendium</button>
      </div>
    `:`
      <div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap">
        <input type="text" placeholder="🔍 Rechercher un sort..." value="${esc(_spellSearch.q)}"
          oninput="_spellSearch.q=this.value;render()"
          style="flex:2;min-width:140px;padding:7px 10px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:18px">
        <select onchange="_spellSearch.cls=this.value;render()"
          style="flex:1;min-width:100px;padding:7px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:18px">
          <option value="">Toutes classes</option>
          ${['Barbare','Barde','Clerc','Druide','Guerrier','Moine','Paladin','Rôdeur','Roublard','Ensorceleur','Occultiste','Magicien','Artificier'].map(c=>`<option value="${c}"${_spellSearch.cls===c?' selected':''}>${c}</option>`).join('')}
        </select>
        <select onchange="_spellSearch.lvl=this.value;render()"
          style="padding:7px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:18px">
          <option value="">Tous niveaux</option>
          ${[0,1,2,3,4,5,6,7,8,9].map(n=>`<option value="${n}"${_spellSearch.lvl==n?' selected':''}>${n===0?'Cantrips':'Niv.'+n}</option>`).join('')}
        </select>
        <select onchange="_spellSearch.school=this.value;render()"
          style="padding:7px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:18px">
          <option value="">Toutes écoles</option>
          ${schools.map(sc=>`<option value="${sc}"${_spellSearch.school===sc?' selected':''}>${sc}</option>`).join('')}
        </select>
      </div>
      <div style="font-size:17px;color:var(--text3);margin-bottom:8px">${results.length} résultat(s) ${results.length===50?'(50 max — affinez la recherche)':''}</div>
      <div style="max-height:420px;overflow-y:auto">
        ${results.map(s=>{
          const already = knownNames.includes(s.name)||knownNames.includes(s.nameEN);
          return`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:8px 10px;margin-bottom:5px;display:flex;align-items:center;gap:8px">
            <div style="flex:1;min-width:0">
              <div style="font-size:18px;font-weight:600;color:${already?'var(--cp)':'var(--text)'}">${esc(s.name)}${s.ritual?' <span style="font-size:15px;color:var(--cp)">(R)</span>':''}</div>
              <div style="font-size:17px;color:var(--text3)">${s.level===0?'Cantrip':'Niv.'+s.level} • ${esc(s.school)} • ${esc(s.castTime)} • ${esc(s.range)}</div>
              <div style="font-size:17px;color:var(--text3);margin-top:2px">${s.classes.join(', ')}</div>
            </div>
            ${already
              ? `<button class="btn bsm bdanger" onclick="removeSpellFromChar('${jsq(s.name)}')">Retirer</button>`
              : `<button class="btn bsm bprimary" onclick="addSpellToChar('${jsq(s.name)}')">+ Ajouter</button>`
            }
          </div>`;
        }).join('')}
      </div>
      <div style="margin-top:8px;text-align:right">
        <button class="btn bsm" onclick="clearSpellsCache();render()" style="font-size:15px;color:var(--text3)">🗑 Vider le cache</button>
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

// ─── SORTS DE SOUTIEN GROUPE ───
const _SUPPORT_SPELLS={
  'Bénédiction':{buff:'Benediction',die:'d4',maxTargets:3,icon:'✨',detail:'+1d4 aux jets d\'attaque et sauvegardes',persistent:true},
  'Assistance':{buff:'Assistance',die:'d4',maxTargets:1,icon:'🤝',detail:'+1d4 au prochain jet de compétence',persistent:false},
  'Guidage':{buff:'Assistance',die:'d4',maxTargets:1,icon:'🤝',detail:'+1d4 au prochain jet de compétence',persistent:false},
  'Mot de guérison':{heal:true,dieBase:'d4',maxTargets:1,icon:'💚',detail:'Soins à distance (action bonus)'},
  'Soin':{heal:true,dieBase:'d8',maxTargets:1,icon:'💉',detail:'Soins au toucher (action)',canSelf:true},
};
let _supportPending=null,_supportTargetSel=[],_healIRLPending=null;

function _openSupportSpellModal(name,def,spellMod,upcastLvl){
  const p=P();
  const allTargets=[];
  if(def.heal||def.canSelf){allTargets.push({uid:currentUser?.uid,docId:null,name:p.charName||'Moi',isSelf:true,avatar:p.avatar||'⚔'});}
  (typeof _groupData!=='undefined'?_groupData:[]).filter(gp=>gp.uid!==currentUser?.uid).forEach(gp=>{
    allTargets.push({uid:gp.uid,docId:gp.docId,name:gp.charData?.charName||gp.playerName||'Joueur',isSelf:false,avatar:gp.avatar||'⚔'});
  });
  _supportPending={name,def,spellMod,upcastLvl,allTargets};
  _supportTargetSel=[];
  if(!allTargets.length){showToast('❌ Aucun allié connecté.');return;}
  const diceCount=upcastLvl>0?upcastLvl:1;
  const healLabel=def.heal?`${diceCount}${def.dieBase}${spellMod>=0?'+':''}${spellMod}`:'';
  const rowStyle='display:flex;align-items:center;gap:10px;padding:8px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;margin-bottom:6px';
  if(def.maxTargets===1){
    const listHtml=allTargets.map((t,i)=>`<div style="${rowStyle};cursor:pointer" onclick="closeModal();_applySupport([${i}])">`+
      `<span style="font-size:25px">${t.avatar}</span><div style="flex:1"><div style="font-size:18px;font-weight:600">${esc(t.name)}</div></div>`+
      `<span style="font-size:17px;color:var(--cp)">${def.heal?healLabel:'+1'+def.die} →</span></div>`).join('');
    openModal(`<div class="pt">${def.icon} ${esc(name)}</div><div style="font-size:17px;color:var(--text3);margin-bottom:12px">${def.heal?`Soigne : <strong style="color:var(--cp)">${healLabel}</strong>`:esc(def.detail)}</div>${listHtml}<button class="btn" style="width:100%;margin-top:4px" onclick="closeModal()">Annuler</button>`);
  }else{
    const listHtml=allTargets.map((t,i)=>`<div id="starg_${i}" style="${rowStyle};cursor:pointer" onclick="_toggleSupTarget(${i})">`+
      `<div id="stchk_${i}" style="width:18px;height:18px;border-radius:4px;border:2px solid var(--border);background:var(--surface);flex-shrink:0"></div>`+
      `<span style="font-size:25px">${t.avatar}</span><div style="flex:1"><div style="font-size:18px;font-weight:600">${esc(t.name)}</div></div></div>`).join('');
    openModal(`<div class="pt">${def.icon} ${esc(name)} — jusqu'à ${def.maxTargets} cibles</div><div style="font-size:17px;color:var(--text3);margin-bottom:10px">${esc(def.detail)}</div>${listHtml}<div style="display:flex;gap:8px;margin-top:8px"><button class="btn" style="flex:1" onclick="closeModal()">Annuler</button><button class="btn bac" id="stConfBtn" style="flex:2;opacity:.5" disabled onclick="_applySupport([..._supportTargetSel])">✓ Confirmer (<span id="stCnt">0</span>)</button></div>`);
  }
}
function _toggleSupTarget(idx){
  if(!_supportPending)return;
  const max=_supportPending.def.maxTargets;
  const ei=_supportTargetSel.indexOf(idx);
  const chk=document.getElementById('stchk_'+idx),row=document.getElementById('starg_'+idx);
  if(ei>=0){_supportTargetSel.splice(ei,1);if(chk){chk.style.background='var(--surface)';chk.style.borderColor='var(--border)';}if(row)row.style.borderColor='var(--border)';}
  else if(_supportTargetSel.length<max){_supportTargetSel.push(idx);if(chk){chk.style.background='var(--cp)';chk.style.borderColor='var(--cp)';}if(row)row.style.borderColor='var(--cp)';}
  else{showToast(`❌ Maximum ${max} cibles.`);return;}
  const btn=document.getElementById('stConfBtn'),cnt=document.getElementById('stCnt');
  if(btn){btn.disabled=!_supportTargetSel.length;btn.style.opacity=_supportTargetSel.length?'1':'.5';}
  if(cnt)cnt.textContent=_supportTargetSel.length;
}
function _applySupport(indices){
  if(!_supportPending)return;
  const {name,def,spellMod,upcastLvl,allTargets}=_supportPending;
  const targets=indices.map(i=>allTargets[i]).filter(Boolean);
  closeModal();_supportPending=null;_supportTargetSel=[];
  if(!targets.length){showToast('❌ Aucune cible.');return;}
  const p=P();const sourceName=p.charName||'Allié';
  if(def.heal){
    const diceCount=upcastLvl>0?upcastLvl:1,dieSize=parseInt(def.dieBase.replace('d',''));
    if(_isIRLMode()){
      const formula=`${diceCount}${def.dieBase}${spellMod>=0?'+'+spellMod:spellMod}`;
      _healIRLPending={targets,name};
      openModal(`<div class="pt">${def.icon} ${esc(name)} — Mode IRL</div><div style="text-align:center;padding:12px 0"><div style="font-size:19px;color:var(--text2);margin-bottom:4px">Lance : <strong style="color:var(--cp)">${formula}</strong></div><div style="font-size:17px;color:var(--text3);margin-bottom:12px">Pour : <strong>${targets.map(t=>esc(t.name)).join(', ')}</strong></div><input class="fi" id="healIRLIn" type="number" min="1" style="text-align:center;font-size:22px;margin-bottom:12px"><div style="display:flex;gap:8px"><button class="btn" style="flex:1" onclick="closeModal()">Annuler</button><button class="btn bac" style="flex:2" onclick="(()=>{const v=parseInt(document.getElementById('healIRLIn').value)||0;if(v<1)return;_applyHealTargets(_healIRLPending.targets,v,_healIRLPending.name);_healIRLPending=null;closeModal();})()">✓ Soigner</button></div></div>`);
    }else{
      let total=spellMod;for(let i=0;i<diceCount;i++)total+=Math.ceil(Math.random()*dieSize);total=Math.max(1,total);
      _applyHealTargets(targets,total,name);
      showToast(`${def.icon} ${esc(name)} : <strong>+${total} PV</strong> pour ${targets.map(t=>esc(t.name)).join(', ')} !`,2500);
    }
  }else{
    const buff={name:def.buff,die:def.die,sourceName,persistent:!!def.persistent};
    targets.forEach(t=>{
      if(t.isSelf){if(!p.activeBuffs)p.activeBuffs=[];if(!p.activeBuffs.some(b=>b.name===def.buff))p.activeBuffs.push(buff);saveAll();}
      else if(t.docId&&typeof fbDb!=='undefined')fbDb.collection('characters').doc(t.docId).update({'characterData.activeBuffs':firebase.firestore.FieldValue.arrayUnion(buff)}).catch(()=>{});
    });
    render();showToast(`${def.icon} ${esc(name)} lancé sur ${targets.map(t=>esc(t.name)).join(', ')} !`,2500);
  }
}
function _applyHealTargets(targets,amount,spellName){
  const p=P();
  targets.forEach(t=>{
    if(t.isSelf){p.hp=Math.min(p.hpMax||1,(p.hp||0)+amount);saveAll();render();}
    else if(t.docId&&typeof fbDb!=='undefined'){
      const gp=(typeof _groupData!=='undefined'?_groupData:[]).find(x=>x.docId===t.docId);
      if(gp){const newHp=Math.min(gp.charData.hpMax||1,(gp.charData.hp||0)+amount);fbDb.collection('characters').doc(t.docId).update({'characterData.hp':newHp}).catch(()=>{});}
    }
  });
}

function _clearGroupConcentrationBuff(spellName,casterName){
  if(!spellName)return;
  const def=_SUPPORT_SPELLS[spellName];
  if(!def||!def.buff)return;
  const buffName=def.buff;
  const p=P();
  // Retire le buff de la fiche du lanceur lui-même si nécessaire
  if((p.activeBuffs||[]).some(b=>b.name===buffName)){
    p.activeBuffs=(p.activeBuffs||[]).filter(b=>b.name!==buffName);
    saveAll();
  }
  // Retire le buff de tous les alliés qui l'avaient reçu de ce lanceur
  const affected=(typeof _groupData!=='undefined'?_groupData:[])
    .filter(gp=>gp.uid!==currentUser?.uid&&(gp.charData?.activeBuffs||[]).some(b=>b.name===buffName&&b.sourceName===casterName));
  if(!affected.length){render();return;}
  affected.forEach(gp=>{
    const newBuffs=(gp.charData.activeBuffs||[]).filter(b=>!(b.name===buffName&&b.sourceName===casterName));
    if(typeof fbDb!=='undefined')fbDb.collection('characters').doc(gp.docId).update({'characterData.activeBuffs':newBuffs}).catch(()=>{});
  });
  showToast(`✕ ${esc(spellName)} terminé — buff retiré de ${affected.map(g=>esc(g.charData?.charName||g.playerName||'Joueur')).join(', ')}.`,3000);
  render();
}

// ─── LANCER UN SORT ───
let _castPendingSlots=null;
function castSpell(name,level,_forceConc){
  const p=P();const d=findSpellData(name);
  if(!level){_finalizeCast(name,d,0,false);return;}
  const isConc=!!(d&&d.duration&&/concentration/i.test(d.duration));
  if(isConc&&(p.statuses||[]).some(s=>s.name==='Concentration')){
    if(!_forceConc){
      openModal(`<div class="pt">🔵 Concentration déjà active</div>
        <p style="font-size:18px;color:var(--text2);line-height:1.5;margin-bottom:6px">Tu te concentres déjà sur <strong style="color:#ffd54f">${esc(p.concentrationSpell||'un sort')}</strong>.</p>
        <p style="font-size:18px;color:var(--text2);line-height:1.5;margin-bottom:14px">On ne maintient qu'<strong>une seule concentration</strong> à la fois : lancer <strong style="color:var(--cp)">${esc(name)}</strong> mettra fin à l'effet précédent (et retirera ses bonus aux alliés concernés).</p>
        <div style="display:flex;gap:8px">
          <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
          <button class="btn bac" style="flex:2" onclick="closeModal();castSpell('${jsq(name)}',${level},true)">🔵 Briser et lancer</button>
        </div>`);
      return;
    }
    const _prevConc=p.concentrationSpell,_prevName=p.charName||'';
    p.statuses=(p.statuses||[]).filter(s=>s.name!=='Concentration');p.concentrationSpell='';
    if(_prevConc)_clearGroupConcentrationBuff(_prevConc,_prevName);
  }
  const slots=calcSpellSlots(p);const su=p.spellSlotsUsed||[];const wSlots=getWarlockSlots(p);
  const available=[];
  if(slots){for(let ni=level-1;ni<=8;ni++){const tot=slots[ni]||0;const used=su[ni]||0;if(tot>0&&used<tot)available.push({ni,label:`Niv.${ni+1} — ${tot-used}/${tot} dispo`});}}
  if(wSlots&&level<=wSlots[1]){const wUsed=su[9]||0,wTot=wSlots[0];if(wUsed<wTot)available.push({ni:9,label:`Pacte Niv.${wSlots[1]} — ${wTot-wUsed}/${wTot} dispo`,wLvl:wSlots[1]});}
  if(!available.length){showToast('❌ Aucun emplacement disponible pour ce sort !');return;}
  if(available.length===1){_spendAndCast(name,level,available[0],d,isConc);return;}
  _castPendingSlots={name,level,available,d,isConc};
  openModal(`<div>
    <div style="font-size:21px;font-weight:700;color:var(--cp);margin-bottom:4px">✦ ${esc(name)}</div>
    <div style="font-size:18px;color:var(--text2);margin-bottom:14px">Choisir l'emplacement de sort :</div>
    ${available.map((sl,i)=>`<button class="btn bprimary" style="width:100%;margin-bottom:8px;padding:10px 14px;text-align:left;font-size:18px" onclick="closeModal();_confirmCastSlot(${i})">${esc(sl.label)}</button>`).join('')}
    <button class="btn" style="width:100%;font-size:18px;margin-top:4px" onclick="closeModal();_castPendingSlots=null">Annuler</button>
  </div>`);
}
function _confirmCastSlot(idx){if(!_castPendingSlots)return;const{name,level,available,d,isConc}=_castPendingSlots;_castPendingSlots=null;_spendAndCast(name,level,available[idx],d,isConc);}
function _spendAndCast(name,minLevel,slot,d,isConc){
  const p=P();if(!p.spellSlotsUsed)p.spellSlotsUsed=[];
  p.spellSlotsUsed[slot.ni]=(p.spellSlotsUsed[slot.ni]||0)+1;
  const usedLvl=slot.wLvl||(slot.ni+1);
  if(isConc){if(!p.statuses)p.statuses=[];if(!p.statuses.some(s=>s.name==='Concentration'))p.statuses.push({name:'Concentration'});p.concentrationSpell=name;}
  saveAll();render();
  _finalizeCast(name,d,usedLvl>minLevel?usedLvl:0,isConc);
}
function _finalizeCast(name,d,upcastLvl,isConc){
  const p=P();const dmg=d?d.damage||'':'';const save=d?d.savingThrow||'':'';
  if(typeof _logMJAction==='function')_logMJAction('✦ lance '+name+(upcastLvl?(' (niv.'+upcastLvl+')'):''));
  const mc=mainClass(p);const cd=mc?SRD.classes.find(c=>c.name===mc.name):null;
  const sagM=mod(p.abilities[4]||10),intM=mod(p.abilities[3]||10),chaM=mod(p.abilities[5]||10);
  const spellMod=cd?({CHA:chaM,SAG:sagM,INT:intM}[cd.saves&&cd.saves[1]]||intM):intM;
  const spellDC=8+pb(totalLevel(p))+spellMod;
  const suppDef=_SUPPORT_SPELLS[name];
  if(suppDef){
    const hasAllies=(typeof _groupData!=='undefined')&&_groupData.some(gp=>gp.uid!==currentUser?.uid);
    if(hasAllies||suppDef.heal||suppDef.canSelf){_openSupportSpellModal(name,suppDef,spellMod,upcastLvl);return;}
  }
  if(_isIRLMode()){
    let html=`<strong style="font-size:22px">${esc(name)}</strong>`;
    if(upcastLvl)html+=` <span style="font-size:17px;color:var(--cp)">(amplifié niv.${upcastLvl})</span>`;
    if(isConc)html+=`<br><span style="font-size:18px;color:#ffd54f">🎯 Concentration activée</span>`;
    if(save)html+=`<br>JS <strong>${esc(save)}</strong> — DD <strong style="font-size:20px;color:var(--cp)">${spellDC}</strong>`;
    if(dmg)html+=`<br>Dégâts : lance <strong style="font-size:21px">${esc(dmg)}</strong>`;
    if(!dmg&&!save)html+=`<br><span style="font-size:18px;color:var(--text3)">Applique l'effet du sort</span>`;
    showIRLRoll(html);
  }else{
    rollSpellPlayer(name,dmg,save);
    if(upcastLvl)showToast(`✦ ${name} — amplifié au niveau ${upcastLvl} !`,2500);
  }
}

// ═══════════════════════════════════════
