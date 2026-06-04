// ═══════════════════════════════════════════════════════════════════
// COMPENDIUM — registre de paquets + fusion des sources ACTIVES
// ───────────────────────────────────────────────────────────────────
// Remplace le chargement direct des data/*.json par un système de paquets
// activables (base-srd + contenu actuel + imports futurs). Les globales
// SPELLS_DB / ITEMS_DB / MONSTERS_DB / FEATS_DB / RACES_DB / BACKGROUNDS_DB /
// CLASSES_DB deviennent l'UNION des paquets actifs (dédoublonnée par nom).
// Voir mémoire : project-compendium-architecture / project-compendium-schema.
// ═══════════════════════════════════════════════════════════════════

const COMP = (() => {
  const TYPES = ['spells','items','monsters','feats','races','backgrounds','classes'];

  // Paquets intégrés (builtin). `path(type)` = URL du fichier de ce type.
  const BUILTIN = {
    'base-srd': {
      id:'base-srd', name:'Base officielle (SRD 5.1)', builtin:true, lang:'en',
      types:TYPES.slice(), path:t=>'data/base-srd/'+t+'.json'
    },
    'legacy': {
      id:'legacy', name:'Mon contenu actuel (à trier)', builtin:true, lang:'mix',
      types:TYPES.slice(), path:t=>'data/'+t+'_db.json'
    }
  };

  // Registre des paquets connus (builtin + imports inline ajoutés à l'exécution).
  const packs = {};
  Object.values(BUILTIN).forEach(p => { packs[p.id] = Object.assign({}, p, { _data:{} }); });

  // État d'activation : { [packId]: { [type]: bool } }. Persisté en localStorage.
  // Défaut (1er lancement) : contenu actuel ACTIF, base-srd ÉTEINTE → aucun doublon, aucune perte.
  let active = {};
  try { active = JSON.parse(localStorage.getItem('comp_active')) || {}; } catch(e) {}
  if(!active || !Object.keys(active).length){
    active = { legacy:{}, 'base-srd':{} };
    TYPES.forEach(t => { active.legacy[t] = true; active['base-srd'][t] = false; });
    _saveActive();
  }
  function _saveActive(){ try { localStorage.setItem('comp_active', JSON.stringify(active)); } catch(e){} }

  function isActive(packId, type){ return !!(active[packId] && active[packId][type]); }
  function activePacksFor(type){ return Object.keys(packs).filter(id => isActive(id, type)); }

  // Globale cible pour un type donné (assignation directe — scope global partagé entre scripts).
  function _setGlobal(type, arr){
    switch(type){
      case 'spells':      SPELLS_DB      = parseSpellsDB(arr); break; // parsé en objets (dual-format)
      case 'items':       ITEMS_DB       = arr; break;
      case 'monsters':    MONSTERS_DB    = arr; break;
      case 'feats':       FEATS_DB       = arr; break;
      case 'races':       RACES_DB       = arr; break;
      case 'backgrounds': BACKGROUNDS_DB = arr; break;
      case 'classes':     CLASSES_DB     = arr; break;
    }
  }

  // Recompose la globale = union des paquets actifs (base-srd d'abord), dédoublonnée par nom.
  function _rebuild(type){
    let merged = [];
    activePacksFor(type)
      .sort((a,b)=> (a==='base-srd'?-1:b==='base-srd'?1:0)) // base-srd prioritaire en cas de doublon
      .forEach(id => { const d = packs[id]._data[type]; if(Array.isArray(d)) merged = merged.concat(d); });
    // Dédoublonnage par nom (clé `name` après parse pour les sorts ; `n` pour le reste)
    const seen = new Set();
    const keyOf = type==='spells' ? (e=>Array.isArray(e)?e[0]:e.name) : (e=>e&&e.n);
    merged = merged.filter(e => { const k=(keyOf(e)||'').toLowerCase(); if(!k) return true; if(seen.has(k)) return false; seen.add(k); return true; });
    _setGlobal(type, merged);
  }

  // Charge les données d'un type pour un paquet (fetch + cache localStorage), si pas déjà en mémoire.
  async function _loadPackType(pack, type){
    if(Array.isArray(pack._data[type])) return;            // déjà en mémoire
    if(pack.inline && pack.inline[type]){ pack._data[type] = pack.inline[type]; return; } // import inline
    const ckey = 'comp_'+pack.id+'_'+type;
    try { const c = localStorage.getItem(ckey); if(c){ pack._data[type] = JSON.parse(c); return; } } catch(e){}
    if(typeof pack.path !== 'function'){ pack._data[type] = []; return; } // paquet importé sans données pour ce type
    const resp = await fetch(pack.path(type));
    if(!resp.ok) throw new Error('introuvable: '+pack.path(type));
    const arr = await resp.json();
    pack._data[type] = arr;
    try { localStorage.setItem(ckey, JSON.stringify(arr)); } catch(e){} // gros fichiers : quota possible → ignoré
  }

  // Assure que toutes les sources actives d'un type sont chargées, puis recompose la globale.
  async function ensureType(type, onDone){
    const ids = activePacksFor(type);
    let loadedSomething = false, errors = 0;
    for(const id of ids){
      try { if(!Array.isArray(packs[id]._data[type])){ await _loadPackType(packs[id], type); loadedSomething = true; } }
      catch(e){ errors++; }
    }
    _rebuild(type);
    if(loadedSomething){
      const arr = _globalCount(type);
      if(typeof showToast==='function') showToast('📚 '+_typeLabel(type)+' : '+arr+' chargé(s)');
    }
    if(ids.length && errors===ids.length && typeof showToast==='function')
      showToast('❌ Impossible de charger '+_typeLabel(type)+'.');
    if(onDone) onDone();
  }
  function _globalCount(type){
    switch(type){case 'spells':return (SPELLS_DB||[]).length;case 'items':return (ITEMS_DB||[]).length;
      case 'monsters':return (MONSTERS_DB||[]).length;case 'feats':return (FEATS_DB||[]).length;
      case 'races':return (RACES_DB||[]).length;case 'backgrounds':return (BACKGROUNDS_DB||[]).length;
      case 'classes':return (CLASSES_DB||[]).length;}return 0;
  }
  const _LABELS = {spells:'Sorts',items:'Objets',monsters:'Monstres',feats:'Dons',races:'Races',backgrounds:'Historiques',classes:'Classes'};
  function _typeLabel(t){ return _LABELS[t]||t; }

  // Active/désactive un paquet pour un type, persiste, et recompose (recharge si besoin).
  async function setActive(packId, type, on, onDone){
    if(!active[packId]) active[packId] = {};
    active[packId][type] = !!on;
    _saveActive();
    if(on){ await ensureType(type, onDone); }
    else { _rebuild(type); if(onDone) onDone(); }
  }
  // Active/désactive un paquet pour TOUS les types d'un coup.
  async function setActiveAll(packId, on, onDone){
    if(!active[packId]) active[packId] = {};
    TYPES.forEach(t => active[packId][t] = !!on);
    _saveActive();
    for(const t of TYPES){ if(on){ await ensureType(t); } else { _rebuild(t); } }
    if(onDone) onDone();
  }

  // Enregistre un paquet importé (données inline). data = {spells:[...], items:[...], ...}
  function registerImported(manifest, data){
    const id = manifest.id || 'imp_'+Date.now().toString(36);
    packs[id] = Object.assign({}, manifest, { id, builtin:false, inline:data, _data:{} });
    if(!active[id]){ active[id] = {}; TYPES.forEach(t => active[id][t] = !!(data && data[t] && data[t].length)); _saveActive(); }
    return id;
  }

  // Pour l'UI « Contenus » : liste des paquets + comptes + état d'activation par type.
  function list(){
    return Object.values(packs).map(p => ({
      id:p.id, name:p.name, builtin:!!p.builtin, lang:p.lang||'',
      active:Object.assign({}, active[p.id]||{}),
      loaded:Object.fromEntries(TYPES.map(t=>[t, Array.isArray(p._data[t])?p._data[t].length:null]))
    }));
  }

  function clearCache(){
    // ne purge QUE les caches builtin (base-srd/legacy) ; garde les données des paquets importés
    Object.values(packs).filter(p=>!p.imported).forEach(p => { TYPES.forEach(t => { try{ localStorage.removeItem('comp_'+p.id+'_'+t); }catch(e){} }); p._data = {}; });
  }

  // ─── BIBLIOTHÈQUE (paquets importés persistés) ───────────────────────
  function _loadLibrary(){
    let lib = [];
    try { lib = JSON.parse(localStorage.getItem('comp_library')) || []; } catch(e){}
    lib.forEach(m => { if(!packs[m.id]) packs[m.id] = Object.assign({}, m, { builtin:false, imported:true, _data:{} }); });
  }
  function _saveLibrary(){
    const lib = Object.values(packs).filter(p=>p.imported).map(p => ({
      id:p.id, name:p.name, version:p.version||'1.0', schema:p.schema||1, sourceCat:p.sourceCat||'import', lang:p.lang||'', counts:p.counts||{}
    }));
    try { localStorage.setItem('comp_library', JSON.stringify(lib)); } catch(e){}
  }
  // Ajoute un paquet importé à la bibliothèque (persistant). dataByType = {spells:[...], items:[...], ...}
  function addImportedPack(manifest, dataByType){
    const id = manifest.id || ('imp_'+Date.now().toString(36)+Math.random().toString(36).slice(2,4));
    const counts = {};
    const pack = Object.assign({}, manifest, { id, builtin:false, imported:true, counts, _data:{} });
    packs[id] = pack;
    TYPES.forEach(t => {
      if(Array.isArray(dataByType[t]) && dataByType[t].length){
        counts[t] = dataByType[t].length;
        pack._data[t] = dataByType[t];
        try { localStorage.setItem('comp_'+id+'_'+t, JSON.stringify(dataByType[t])); } catch(e){ /* quota → données en mémoire seulement cette session */ }
      }
    });
    _saveLibrary();
    return id;
  }
  function removeImportedPack(id){
    const p = packs[id]; if(!p || !p.imported) return;
    TYPES.forEach(t => { try{ localStorage.removeItem('comp_'+id+'_'+t); }catch(e){} });
    delete packs[id];
    if(active[id]){ delete active[id]; _saveActive(); }
    _saveLibrary();
    TYPES.forEach(t => _rebuild(t));
  }
  // Construit le bundle au format paquet unique (pour export/partage). Async : charge les types au besoin.
  async function getPackBundle(id){
    const p = packs[id]; if(!p) return null;
    const data = {};
    for(const t of TYPES){ try{ await _loadPackType(p, t); }catch(e){} if(Array.isArray(p._data[t]) && p._data[t].length) data[t] = p._data[t]; }
    const counts = {}; TYPES.forEach(t => { if(data[t]) counts[t] = data[t].length; });
    return Object.assign({ manifest: { id:p.id, name:p.name, version:p.version||'1.0', schema:p.schema||1, sourceCat:p.sourceCat||'import', lang:p.lang||'', counts } }, data);
  }

  // ─── ACTIVATION PILOTÉE PAR LA TABLE ─────────────────────────────────
  // req = { [packId]: ['spells','monsters',...] } (grain paquet × catégorie). Ignore les paquets non possédés.
  // Léger : fixe l'ensemble actif puis INVALIDE les globales → rechargement PARESSEUX par les loadXDB (pas de 12 Mo à l'entrée).
  function applyTableSelection(req){
    active = {};
    Object.keys(req||{}).forEach(pid => {
      if(!packs[pid]) return;
      active[pid] = {};
      (req[pid]||[]).forEach(t => { if(TYPES.includes(t)) active[pid][t] = true; });
    });
    if(!Object.keys(active).length && packs['base-srd']){ active['base-srd'] = {}; TYPES.forEach(t => active['base-srd'][t] = true); }
    _saveActive();
    SPELLS_DB = ITEMS_DB = MONSTERS_DB = FEATS_DB = RACES_DB = BACKGROUNDS_DB = CLASSES_DB = null;
  }
  // Paquets requis par une table que l'utilisateur ne POSSÈDE pas (pour l'icône d'erreur, étape D).
  function missingPacks(req){ return Object.keys(req||{}).filter(pid => !packs[pid]); }

  // Liste pour la biblio (profil) + sélecteur table : builtin + importés, avec comptes et types fournis.
  function library(){
    return Object.values(packs).map(p => ({ id:p.id, name:p.name, builtin:!!p.builtin, imported:!!p.imported, lang:p.lang||'', sourceCat:p.sourceCat||'', counts:p.counts||{}, types:(p.types||Object.keys(p.counts||{})) }));
  }

  _loadLibrary();

  return { TYPES, ensureType, setActive, setActiveAll, isActive, registerImported,
           addImportedPack, removeImportedPack, getPackBundle, applyTableSelection, missingPacks,
           library, list, clearCache, _packs:packs, _active:()=>active };
})();
