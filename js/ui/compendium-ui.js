// ═══════════════════════════════════════════════════════════════════
// COMPENDIUM-UI — écrans du système de paquets (COMP)
//   • Profil → « Ma bibliothèque » : importer / voir / exporter / supprimer
//   • (à venir) Roue crantée table → sélecteur paquets × catégories
// Le moteur (registre/fusion) est dans js/compendium.js. Ici : DOM uniquement.
// ═══════════════════════════════════════════════════════════════════

const _COMP_TYPE_SHORT = { spells:'sorts', items:'objets', monsters:'monstres', feats:'dons', races:'races', backgrounds:'historiques', classes:'classes' };

// Contexte d'édition du sélecteur de table : si défini → auto-enregistrement (réglages d'une table existante).
// null → mode création (l'enregistrement se fait au clic « Créer »).
let _compEditingTableId = null, _compSaveTimer = null;
function compSetTableEditContext(tableId){ _compEditingTableId = tableId || null; }
function _compTableSelChanged(){
  if(!_compEditingTableId) return;
  clearTimeout(_compSaveTimer);
  _compSaveTimer = setTimeout(() => { if(typeof saveTableCompendiums==='function') saveTableCompendiums(_compEditingTableId, true); }, 500);
}
function _compCountsLabel(counts){
  const parts = Object.entries(counts||{}).filter(([,n])=>n).map(([t,n])=>n+' '+(_COMP_TYPE_SHORT[t]||t));
  return parts.length ? parts.join(' · ') : '—';
}

// ─── Section « Ma bibliothèque » (insérée dans les Paramètres du profil) ───
function compLibSectionHtml(){
  return `<div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">
      <button class="btn bsm bprimary" onclick="importCompPack()">📥 Importer un paquet</button>
      ${typeof compCreateNewPack==='function'?`<button class="btn bsm" onclick="compCreateNewPack()">+ Nouveau (perso)</button>`:''}
    </div>
    <div style="font-size:11px;color:var(--text3);margin-bottom:8px">Les paquets contiennent sorts, objets, monstres… Tu choisis lesquels utiliser <strong>par table</strong> (roue crantée de la table).</div>
    <div id="comp_lib_list">${compRenderLibList()}</div>`;
}
function editPersoPack(id){
  if(typeof openPackEditor==='function'){ closeModal(); openPackEditor(id); }
  else if(typeof mjOpenCompendiumEditor==='function'){ closeModal(); mjOpenCompendiumEditor(id); }
  else showToast('✏️ Éditeur indisponible.');
}

function compRenderLibList(){
  const packs = COMP.library();
  if(!packs.length) return `<div style="font-size:12px;color:var(--text3);font-style:italic;padding:6px 0">Aucun paquet.</div>`;
  return packs.map(p => {
    const badge = p.builtin
      ? `<span style="font-size:9px;color:var(--cp);background:rgba(200,168,75,.12);border:1px solid rgba(200,168,75,.35);border-radius:8px;padding:1px 6px">Intégré</span>`
      : p.perso
      ? `<span style="font-size:9px;color:#b58be0;background:rgba(181,139,224,.12);border:1px solid rgba(181,139,224,.35);border-radius:8px;padding:1px 6px">Perso</span>`
      : `<span style="font-size:9px;color:#7eb8f7;background:rgba(126,184,247,.1);border:1px solid rgba(126,184,247,.3);border-radius:8px;padding:1px 6px">Importé</span>`;
    const nameJson = JSON.stringify(p.name).replace(/"/g,'&quot;');
    return `<div style="display:flex;align-items:center;gap:8px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:9px;margin-bottom:6px">
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:600;display:flex;align-items:center;gap:6px">${esc(p.name)} ${badge}</div>
        <div style="font-size:11px;color:var(--text3)">${_compCountsLabel(p.counts)}</div>
      </div>
      ${p.perso?`<button class="btn bsm" title="Éditer" onclick="editPersoPack('${p.id}')">✏️</button>`:''}
      <button class="btn bsm" title="Exporter / partager" onclick="exportCompPack('${p.id}')">📤</button>
      ${p.imported?`<button class="btn bsm" style="color:#e53935;border-color:rgba(229,57,53,.3)" title="Supprimer" onclick="confirmRemoveCompPack('${p.id}',${nameJson})">🗑</button>`:''}
    </div>`;
  }).join('');
}
function _refreshCompLibList(){ const el = document.getElementById('comp_lib_list'); if(el) el.innerHTML = compRenderLibList(); }

// ─── Import d'un fichier paquet (format unique, tolère un objet plat sans manifest) ───
function _parsePackFile(raw, filename){
  let manifest = (raw && raw.manifest) ? Object.assign({}, raw.manifest) : {};
  if(!manifest.name) manifest.name = String(filename||'Paquet importé').replace(/\.json$/i,'').replace(/[_-]+/g,' ').trim() || 'Paquet importé';
  if(!manifest.id)   manifest.id   = 'imp_'+manifest.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,28)+'_'+Date.now().toString(36).slice(-4);
  const data = {};
  COMP.TYPES.forEach(t => { if(Array.isArray(raw[t])) data[t] = raw[t]; });
  const total = COMP.TYPES.reduce((n,t) => n + (data[t]?data[t].length:0), 0);
  return { manifest, data, total };
}
function importCompPack(){
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.json,application/json';
  input.onchange = async e => {
    const file = e.target.files[0]; if(!file) return;
    try {
      const raw = JSON.parse(await file.text());
      const { manifest, data, total } = _parsePackFile(raw, file.name);
      if(!total){ showToast('❌ Aucun contenu reconnu dans ce fichier.'); return; }
      if(COMP._packs[manifest.id] && !confirm('Un paquet « '+manifest.name+' » existe déjà. Le remplacer ?')) return;
      COMP.addImportedPack(manifest, data);
      showToast('✅ Paquet « '+manifest.name+' » importé ('+total+' entrées).');
      _refreshCompLibList();
    } catch(err){ showToast('❌ Fichier JSON invalide.'); }
  };
  input.click();
}

// ─── Export d'un paquet au format unique (partage entre amis) ───
async function exportCompPack(id){
  const bundle = await COMP.getPackBundle(id);
  if(!bundle){ showToast('⚠️ Paquet introuvable.'); return; }
  const name = bundle.manifest.name || 'paquet';
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name.toLowerCase().replace(/[^a-z0-9à-ÿ]+/gi,'_').replace(/^_+|_+$/g,'') + '_pack.json';
  a.click(); URL.revokeObjectURL(url);
  showToast('📤 « '+name+' » exporté.');
}

function confirmRemoveCompPack(id, name){
  if(!confirm('Retirer le paquet « '+name+' » de ta bibliothèque ? (Tu pourras le réimporter.)')) return;
  COMP.removeImportedPack(id);
  _refreshCompLibList();
  showToast('🗑 Paquet retiré.');
}

// ─── Sélecteur de paquets × catégories (création/réglages de table) ───
// selected = { [packId]: ['spells','monsters',...] } (requiredPacks de la table)
function compTableSelectorHtml(selected){
  selected = selected || {};
  const rows = COMP.library().map(p => {
    const types = (p.types && p.types.length) ? p.types : Object.keys(p.counts||{});
    if(!types.length) return '';
    const sel = selected[p.id];
    const masterOn = !!(sel && sel.length);
    const cats = types.map(t => {
      const on  = sel ? sel.includes(t) : false;
      const cnt = (p.counts && p.counts[t]) ? ' ('+p.counts[t]+')' : '';
      return `<label style="display:flex;align-items:center;gap:5px;font-size:12px;cursor:pointer;color:var(--text2)">
        <input type="checkbox" class="tblcat" data-pack="${p.id}" data-type="${t}" ${on?'checked':''} onchange="_compTableSelChanged()" style="accent-color:var(--cp)"> ${_COMP_TYPE_SHORT[t]||t}${cnt}</label>`;
    }).join('');
    return `<div style="border:1px solid var(--border);border-radius:8px;padding:8px 10px;margin-bottom:6px">
      <label style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;cursor:pointer">
        <input type="checkbox" class="tblmaster" data-pack="${p.id}" ${masterOn?'checked':''} onchange="_compToggleMaster('${p.id}',this.checked);_compTableSelChanged()" style="accent-color:var(--cp)">
        ${esc(p.name)} <span style="font-size:9px;color:var(--text3);font-weight:400">${p.builtin?'Intégré':'Importé'}</span>
      </label>
      <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:7px;padding-left:24px">${cats}</div>
    </div>`;
  }).join('');
  return rows || `<div style="font-size:12px;color:var(--text3);font-style:italic">Aucun paquet dans ta bibliothèque. Importe-en un dans ton profil.</div>`;
}
function _compToggleMaster(packId, on){
  const sel = '.tblcat[data-pack="' + ((window.CSS && CSS.escape) ? CSS.escape(packId) : packId) + '"]';
  document.querySelectorAll(sel).forEach(cb => { cb.checked = on; });
}
function compReadTableSelection(){
  const req = {};
  document.querySelectorAll('.tblcat:checked').forEach(cb => {
    const pid = cb.getAttribute('data-pack'), t = cb.getAttribute('data-type');
    (req[pid] = req[pid] || []).push(t);
  });
  return req;
}
// requiredPacks d'une table (avec migration douce de l'ancien modèle). Conserve le CONTENU ACTUEL (paquet legacy).
function compTableRequiredPacks(tableData){
  if(tableData && tableData.requiredPacks && Object.keys(tableData.requiredPacks).length) return tableData.requiredPacks;
  const req = {};
  const std = tableData && tableData.activeStdCompendiums;
  req['legacy'] = (Array.isArray(std) && std.length) ? std.slice() : COMP.TYPES.slice();
  ((tableData && tableData.activeCustomCompendiums) || []).forEach(id => { if(COMP._packs[id]) req[id] = COMP.TYPES.slice(); });
  return req;
}
