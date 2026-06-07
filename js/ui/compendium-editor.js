// ═══════════════════════════════════════════════════════════════════
// COMPENDIUM-EDITOR — éditeur MJ de contenu perso (sorts/objets/monstres/capacités)
// au FORMAT du schéma (cf. mémoire project-compendium-schema), avec VALIDATION
// des champs obligatoires. Écrit dans _mjCompLib[compId] (Firestore via saveMJCompLib)
// → exposé en paquet par COMP.syncPersoPacks.
// ═══════════════════════════════════════════════════════════════════

// ─── Référentiels (valeurs contrôlées) ───
const CE_SCHOOLS = [ {v:'Abjuration',l:'Abjuration'},{v:'Conjuration',l:'Invocation'},{v:'Divination',l:'Divination'},
  {v:'Enchantment',l:'Enchantement'},{v:'Evocation',l:'Évocation'},{v:'Illusion',l:'Illusion'},
  {v:'Necromancy',l:'Nécromancie'},{v:'Transmutation',l:'Transmutation'} ];
const CE_DMG = [ {v:'acid',l:'acide'},{v:'bludgeoning',l:'contondant'},{v:'cold',l:'froid'},{v:'fire',l:'feu'},
  {v:'force',l:'force'},{v:'lightning',l:'foudre'},{v:'necrotic',l:'nécrotique'},{v:'piercing',l:'perforant'},
  {v:'poison',l:'poison'},{v:'psychic',l:'psychique'},{v:'radiant',l:'radiant'},{v:'slashing',l:'tranchant'},{v:'thunder',l:'tonnerre'} ];
const CE_ITEM_TYPES = [ {v:'M',l:'Arme de mêlée'},{v:'R',l:'Arme à distance'},{v:'A',l:'Munition'},
  {v:'LA',l:'Armure légère'},{v:'MA',l:'Armure intermédiaire'},{v:'HA',l:'Armure lourde'},{v:'S',l:'Bouclier'},
  {v:'W',l:'Objet merveilleux'},{v:'RG',l:'Anneau'},{v:'RD',l:'Sceptre'},{v:'WD',l:'Baguette'},{v:'ST',l:'Bâton'},
  {v:'P',l:'Potion'},{v:'SC',l:'Parchemin'},{v:'G',l:'Divers'} ];
const CE_ABILITIES = [ {v:'STR',l:'Force'},{v:'DEX',l:'Dextérité'},{v:'CON',l:'Constitution'},
  {v:'INT',l:'Intelligence'},{v:'WIS',l:'Sagesse'},{v:'CHA',l:'Charisme'} ];

// ─── Spécifications de champs par type (req:true = obligatoire) ───
const CE_SPEC = {
  spells: { label:'Sorts', icon:'📖', name:e=>e.name||'(sans nom)', fields:[
    {k:'name',label:'Nom',req:true},
    {k:'nameEN',label:'Nom anglais'},
    {k:'level',label:'Niveau (0 = sort mineur)',req:true,type:'number',min:0,max:9},
    {k:'school',label:'École',req:true,type:'select',options:CE_SCHOOLS},
    {k:'castTime',label:'Temps d\'incantation',req:true,ph:'1 action'},
    {k:'range',label:'Portée',req:true,ph:'18 m'},
    {k:'components',label:'Composantes',req:true,ph:'V, S, M'},
    {k:'duration',label:'Durée',req:true,ph:'Instantané'},
    {k:'classes',label:'Classes',req:true,type:'tags',ph:'Magicien, Clerc'},
    {k:'desc',label:'Description',req:true,type:'textarea'},
    {k:'concentration',label:'Concentration',type:'check'},
    {k:'ritual',label:'Rituel',type:'check'},
    {k:'saveAbility',label:'Jet de sauvegarde (facultatif)',type:'select',options:CE_ABILITIES},
    {k:'saveEffect',label:'Effet si JS réussi',type:'select',options:[{v:'half',l:'demi-dégâts'},{v:'negate',l:'annule'}]},
    {k:'attack',label:'Jet d\'attaque',type:'select',options:[{v:'melee',l:'mêlée'},{v:'ranged',l:'à distance'}]},
    {k:'dmgDice',label:'Dés de dégâts (facultatif)',ph:'8d6'},
    {k:'dmgType',label:'Type de dégâts',type:'select',options:CE_DMG},
  ]},
  items: { label:'Objets', icon:'⚔️', name:e=>e.n||'(sans nom)', fields:[
    {k:'n',label:'Nom',req:true},
    {k:'t',label:'Type',req:true,type:'select',options:CE_ITEM_TYPES},
    {k:'tx',label:'Description',req:true,type:'textarea'},
    {k:'mg',label:'Objet magique',type:'check'},
    {k:'d',label:'Rareté (si magique)',ph:'commun / peu commun / rare…'},
    {k:'d1',label:'Dégâts (arme)',ph:'1d8'},
    {k:'d2',label:'Dégâts à deux mains',ph:'1d10'},
    {k:'dt',label:'Type de dégâts',type:'select',options:CE_DMG},
    {k:'ac',label:'CA (armure)',ph:'14 + Dex (max 2)'},
    {k:'w',label:'Poids',ph:'1,5 kg'},
    {k:'v',label:'Valeur',ph:'10 po'},
    {k:'cat',label:'Catégorie',ph:'Arme de guerre'},
  ]},
  monsters: { label:'Monstres', icon:'👾', name:e=>e.n||'(sans nom)', fields:[
    {k:'n',label:'Nom',req:true},
    {k:'sz',label:'Taille',req:true,ph:'Moyenne'},
    {k:'t',label:'Type',req:true,ph:'Humanoïde'},
    {k:'al',label:'Alignement',req:true,ph:'Neutre'},
    {k:'ac',label:'Classe d\'armure',req:true,ph:'13'},
    {k:'hp',label:'Points de vie',req:true,ph:'22 (5d8)'},
    {k:'spd',label:'Vitesse',req:true,ph:'9 m'},
    {k:'str',label:'FOR',req:true,ph:'12'},{k:'dex',label:'DEX',req:true,ph:'14'},{k:'con',label:'CON',req:true,ph:'12'},
    {k:'int',label:'INT',req:true,ph:'10'},{k:'wis',label:'SAG',req:true,ph:'11'},{k:'cha',label:'CHA',req:true,ph:'10'},
    {k:'cr',label:'Facteur de puissance',req:true,ph:'1/4'},
    {k:'acts',label:'Actions / traits',type:'textarea',ph:'Description des attaques et capacités…'},
    {k:'sv',label:'Jets de sauvegarde'},{k:'sk',label:'Compétences'},{k:'sen',label:'Sens'},
    {k:'pas',label:'Perception passive'},{k:'imm',label:'Immunités (dégâts)'},{k:'res',label:'Résistances'},
    {k:'ci',label:'Immunités (conditions)'},{k:'lng',label:'Langues'},
  ]},
  feats: { label:'Capacités', icon:'🌟', name:e=>e.name||e.n||'(sans nom)', fields:[
    {k:'name',label:'Nom',req:true},
    {k:'category',label:'Catégorie',ph:'Racial, Combat…'},
    {k:'description',label:'Description',req:true,type:'textarea'},
  ]},
};
const CE_TYPES = ['spells','items','monsters','feats'];

// ─── Rendu d'un champ ───
function _ceOpts(options, cur){
  return options.map(o => `<option value="${esc(o.v)}"${String(cur)===String(o.v)?' selected':''}>${esc(o.l)}</option>`).join('');
}
function _ceField(f, view){
  const v = view[f.k];
  const id = 'cef_'+f.k;
  const lab = `<div class="fl mb6" style="margin-top:0">${esc(f.label)}${f.req?' <span style="color:#e57373">*</span>':''}</div>`;
  if(f.type==='check')
    return `<label style="display:flex;align-items:center;gap:8px;font-size:18px;cursor:pointer;margin:8px 0"><input type="checkbox" id="${id}" ${v?'checked':''} style="accent-color:var(--cp)"> ${esc(f.label)}</label>`;
  if(f.type==='textarea')
    return lab+`<textarea id="${id}" class="fi" rows="4" style="resize:vertical;margin-bottom:10px"${f.ph?` placeholder="${esc(f.ph)}"`:''}>${esc(v||'')}</textarea>`;
  if(f.type==='select')
    return lab+`<select id="${id}" class="fi" style="margin-bottom:10px"><option value="">—</option>${_ceOpts(f.options, v==null?'':v)}</select>`;
  if(f.type==='number')
    return lab+`<input type="number" id="${id}" class="fi" value="${v==null||v===''?'':esc(String(v))}"${f.min!=null?` min="${f.min}"`:''}${f.max!=null?` max="${f.max}"`:''} style="margin-bottom:10px">`;
  return lab+`<input type="text" id="${id}" class="fi" value="${esc(v==null?'':String(v))}"${f.ph?` placeholder="${esc(f.ph)}"`:''} style="margin-bottom:10px">`;
}

// ─── Vue « aplatie » pour pré-remplir (champs synthétiques @OPTION_B) ───
function _ceFlatten(type, e){
  const view = Object.assign({}, e||{});
  if(type==='spells'){
    if(e && e.save){ view.saveAbility=e.save.ability||''; view.saveEffect=e.save.effect||''; }
    if(e && e.dmg && e.dmg[0]){ view.dmgDice=e.dmg[0].dice||''; view.dmgType=e.dmg[0].type||''; }
  }
  return view;
}

// ─── Lecture du formulaire ───
function _ceGather(type){
  const o = {};
  CE_SPEC[type].fields.forEach(f => {
    const el = document.getElementById('cef_'+f.k); if(!el) return;
    if(f.type==='check') o[f.k] = el.checked;
    else if(f.type==='number') o[f.k] = el.value===''?'':parseInt(el.value,10);
    else if(f.type==='tags') o[f.k] = el.value.split(',').map(s=>s.trim()).filter(Boolean);
    else o[f.k] = el.value.trim();
  });
  return o;
}
function _ceValidate(type, o){
  const missing = [];
  CE_SPEC[type].fields.forEach(f => {
    if(!f.req) return;
    const v = o[f.k];
    const empty = f.type==='tags' ? !(Array.isArray(v) && v.length)
      : f.type==='number' ? (v==='' || v==null || isNaN(v))
      : f.type==='check' ? false
      : !String(v==null?'':v).trim();
    if(empty) missing.push(f.label);
  });
  return missing;
}
// Recompose les champs synthétiques en structures @OPTION_B, nettoie les vides.
function _ceFinalize(type, o){
  if(type==='spells'){
    if(o.saveAbility){ o.save = { ability:o.saveAbility }; if(o.saveEffect) o.save.effect = o.saveEffect; }
    if(o.dmgDice){ o.dmg = [{ dice:o.dmgDice, type:o.dmgType||'' }]; }
    ['saveAbility','saveEffect','dmgDice','dmgType'].forEach(k => delete o[k]);
  }
  // retire les chaînes vides (garde les bool false et 0)
  Object.keys(o).forEach(k => { if(o[k]==='' || (Array.isArray(o[k]) && !o[k].length)) delete o[k]; });
  return o;
}

// ─── Éditeur d'un paquet perso ───
async function openPackEditor(compId){
  if(typeof _mjCompLib==='undefined'){ showToast('❌ Indisponible.'); return; }
  if(!Object.keys(_mjCompLib).length && typeof loadMJCompLib==='function' && typeof currentUser!=='undefined' && currentUser){ await loadMJCompLib(); }
  const c = _mjCompLib[compId];
  if(!c){ showToast('❌ Compendium introuvable.'); return; }
  CE_TYPES.forEach(t => { if(!Array.isArray(c[t])) c[t] = []; });
  const sections = CE_TYPES.map(type => {
    const spec = CE_SPEC[type]; const arr = c[type];
    const rows = arr.length ? arr.map((e,i) => `<div style="display:flex;align-items:center;gap:8px;background:var(--surface2);border:1px solid var(--border);border-radius:7px;padding:7px 9px;margin-bottom:5px">
        <div style="flex:1;min-width:0;font-size:18px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(spec.name(e))}</div>
        <button class="btn bsm" onclick="ceEditEntry('${compId}','${type}',${i})">✏️</button>
        <button class="btn bsm" style="color:#e53935;border-color:rgba(229,57,53,.3)" onclick="ceDeleteEntry('${compId}','${type}',${i})">🗑</button>
      </div>`).join('') : `<div style="font-size:18px;color:var(--text3);font-style:italic;padding:4px 0">Aucune entrée.</div>`;
    return `<details class="acc" style="margin-bottom:8px">
      <summary>${spec.icon} ${spec.label} <span style="color:var(--text3);font-weight:400">(${arr.length})</span></summary>
      <div class="acc-body">
        <button class="btn bsm bprimary" style="margin-bottom:8px" onclick="ceEditEntry('${compId}','${type}',-1)">+ Ajouter ${spec.label.toLowerCase().replace(/s$/,'')}</button>
        ${rows}
      </div>
    </details>`;
  }).join('');
  openWideModal(`<div class="pt">📚 Éditeur — ${esc(c.name||'Compendium')}</div>
    <div style="font-size:18px;color:var(--text2);margin-bottom:12px">Crée et modifie ton contenu. Les champs marqués <span style="color:#e57373">*</span> sont obligatoires.</div>
    <div style="max-height:60vh;overflow-y:auto">${sections}</div>
    <div style="display:flex;justify-content:flex-end;margin-top:12px"></div>`);
}

// ─── Formulaire d'une entrée (création si index=-1) ───
function ceEditEntry(compId, type, index){
  const c = _mjCompLib[compId]; if(!c) return;
  const existing = index>=0 ? (c[type]||[])[index] : null;
  const view = _ceFlatten(type, existing);
  const spec = CE_SPEC[type];
  const formHtml = spec.fields.map(f => _ceField(f, view)).join('');
  openWideModal(`<div class="pt">${spec.icon} ${index>=0?'Modifier':'Nouveau'} — ${spec.label.toLowerCase().replace(/s$/,'')}</div>
    <div id="ce_form" style="max-height:62vh;overflow-y:auto;padding-right:4px">${formHtml}</div>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn" style="flex:1" onclick="openPackEditor('${compId}')">← Annuler</button>
      <button class="btn bac" style="flex:2" onclick="ceSaveEntry('${compId}','${type}',${index})">💾 Enregistrer</button>
    </div>`);
}

async function ceSaveEntry(compId, type, index){
  const c = _mjCompLib[compId]; if(!c) return;
  let o = _ceGather(type);
  const missing = _ceValidate(type, o);
  if(missing.length){ showToast('❌ Champs obligatoires manquants : '+missing.join(', ')); return; }
  o = _ceFinalize(type, o);
  if(!Array.isArray(c[type])) c[type] = [];
  if(index>=0) c[type][index] = o; else c[type].push(o);
  if(typeof saveMJCompLib==='function') await saveMJCompLib(); // → Firestore + COMP.syncPersoPacks
  showToast('✅ Enregistré.');
  openPackEditor(compId);
}

function ceDeleteEntry(compId, type, index){
  const c = _mjCompLib[compId]; if(!c || !Array.isArray(c[type]) || !c[type][index]) return;
  const nom = CE_SPEC[type].name(c[type][index]);
  if(!confirm('Supprimer « '+nom+' » ?')) return;
  c[type].splice(index,1);
  if(typeof saveMJCompLib==='function') saveMJCompLib();
  showToast('🗑 Supprimé.');
  openPackEditor(compId);
}

// ═══════════════════════════════════════════════════════════════════
// PONT « ENREGISTRER DANS UN COMPENDIUM PERSO » depuis les éditeurs MJ
// (PNJ → monstre, objet MJ → objet). Convertit au format schéma + sélecteur.
// ═══════════════════════════════════════════════════════════════════
const _MJ_ITEM_TYPE_CODE = { 'Arme':'M', 'Armure':'MA', 'Potion':'P', 'Parchemin':'SC', 'Objet magique':'W', 'Outil':'ST', 'Divers':'G' };
function _mjItemToSchema(o){
  return { n:o.name||'Objet', t:_MJ_ITEM_TYPE_CODE[o.type]||'G', tx:o.desc||'',
    mg:(o.type==='Objet magique')||!!(o.rarity&&o.rarity!=='Commun'),
    d:(o.rarity&&o.rarity!=='Commun')?o.rarity:'', v:o.value?(o.value+' po'):'', attunement:!!o.attunement };
}
function _mjNpcToSchema(n){
  const a = n.abilities||[10,10,10,10,10,10];
  const acts = [];
  (n.attacks||[]).forEach(x => { if(x&&x.name) acts.push(`${x.name}: +${x.atkBonus||0} à l'attaque, ${x.dmgDice||'1d6'}${x.dmgBonus?'+'+x.dmgBonus:''}${x.dmgType?' '+x.dmgType:''}${x.range?' ('+x.range+')':''}.`); });
  (n.spells||[]).forEach(s => { if(s&&s.name) acts.push(`${s.name}${s.level?' (niv. '+s.level+')':''}${s.saveStat&&s.saveDC?' — JS '+s.saveStat+' DD '+s.saveDC:''}${s.dmgDice?' — '+s.dmgDice+(s.dmgType?' '+s.dmgType:''):''}${s.desc?': '+s.desc:''}`); });
  (n.traits||[]).forEach(t => { if(t&&t.name) acts.push(`${t.name}: ${t.desc||''}`); });
  if(typeof n.attacks==='string' && n.attacks) acts.push(n.attacks);
  let actsTxt = acts.filter(Boolean).join('\n\n'); if(n.notes) actsTxt += (actsTxt?'\n\n':'')+n.notes;
  return { n:n.name||'Créature', sz:n.size||'Moyenne', t:n.type||'', al:n.alignment||'',
    ac:String(n.ac||''), hp:String(n.hp||''), spd:n.speed||'',
    str:String(a[0]), dex:String(a[1]), con:String(a[2]), int:String(a[3]), wis:String(a[4]), cha:String(a[5]),
    cr:String(n.cr||''), acts:actsTxt };
}
// Points d'entrée depuis les listes MJ
function mjItemToPack(i){ if(typeof _mjObjets==='undefined'||!_mjObjets[i])return; mjSaveToPersoPack('items', _mjItemToSchema(_mjObjets[i])); }
function mjNpcToPack(i){ if(typeof _mjNPCs==='undefined'||!_mjNPCs[i])return; mjSaveToPersoPack('monsters', _mjNpcToSchema(_mjNPCs[i])); }

// Sélecteur : choisir un compendium perso existant, ou en créer un (nommé).
function mjSaveToPersoPack(type, entry){
  if(typeof _mjCompLib==='undefined'){ showToast('❌ Compendiums indisponibles.'); return; }
  window._mjPendingPackEntry = { type, entry };
  const ids = Object.keys(_mjCompLib);
  const list = ids.length ? ids.map(id => `<div class="charlib-item" style="cursor:pointer" onclick="_mjDoSaveToPack('${id}')">
      <div style="flex:1"><div style="font-size:18px;font-weight:600">${esc(_mjCompLib[id].name||'Compendium')}</div>
      <div style="font-size:17px;color:var(--text3)">${(_mjCompLib[id].spells||[]).length} sorts · ${(_mjCompLib[id].items||[]).length} objets · ${(_mjCompLib[id].monsters||[]).length} monstres</div></div>
      <span style="color:var(--cp);font-size:17px">+ Ajouter</span></div>`).join('')
    : `<div style="font-size:18px;color:var(--text3);font-style:italic;padding:6px 0">Aucun compendium perso pour l'instant.</div>`;
  openModal(`<div class="pt">📚 Enregistrer dans un compendium</div>
    <div style="font-size:18px;color:var(--text2);margin-bottom:12px">Choisis un compendium perso, ou crée-en un nouveau :</div>
    <div style="max-height:40vh;overflow-y:auto;margin-bottom:10px">${list}</div>
    <div style="display:flex;gap:8px">
      <button class="btn bsm bprimary" onclick="_mjNewPackForEntry()">+ Nouveau compendium</button>
      <button class="btn bsm" onclick="closeModal()">Annuler</button>
    </div>`);
}
function _mjDoSaveToPack(compId){
  const pend = window._mjPendingPackEntry; if(!pend) return;
  const c = _mjCompLib[compId]; if(!c){ showToast('❌ Compendium introuvable.'); return; }
  if(!Array.isArray(c[pend.type])) c[pend.type] = [];
  c[pend.type].push(pend.entry);
  if(typeof saveMJCompLib==='function') saveMJCompLib(); // → Firestore + COMP.syncPersoPacks
  window._mjPendingPackEntry = null;
  closeModal();
  showToast('✅ Ajouté à « '+(c.name||'compendium')+' ».');
}
async function _mjNewPackForEntry(){
  const pend = window._mjPendingPackEntry; if(!pend) return;
  const name = (prompt('Nom du nouveau compendium :','Mon compendium')||'').trim();
  if(!name) return;
  if(typeof _genCompId!=='function' || typeof saveMJCompLib!=='function'){ showToast('❌ Indisponible.'); return; }
  const id = _genCompId();
  _mjCompLib[id] = { name, createdAt:new Date().toISOString(), feats:[], spells:[], items:[], monsters:[] };
  await saveMJCompLib();
  _mjDoSaveToPack(id);
}

// ─── Créer un nouveau paquet perso puis l'éditer ───
async function compCreateNewPack(){
  const name = (prompt('Nom du nouveau compendium :','Mon compendium')||'').trim();
  if(!name) return;
  if(typeof _mjCompLib==='undefined' || typeof saveMJCompLib!=='function' || typeof _genCompId!=='function'){ showToast('❌ Indisponible.'); return; }
  const id = _genCompId();
  _mjCompLib[id] = { name, createdAt:new Date().toISOString(), feats:[], spells:[], items:[], monsters:[] };
  await saveMJCompLib();
  openPackEditor(id);
}
