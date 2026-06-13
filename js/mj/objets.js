function mjTabObjets(){
  const itemList=_mjObjets.length?_mjObjets.map((obj,i)=>{
    const ri=obj.rarity?RARITY_INFO[obj.rarity]:null;
    return`<div class="inv-item" style="flex-wrap:wrap;gap:6px">
    <div style="flex:1;min-width:0">
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
        <span style="font-size:18px;font-weight:600;color:var(--text)">${esc(obj.name||'?')}</span>
        ${ri?`<span style="font-size:15px;padding:1px 6px;border-radius:4px;background:${ri.color}22;color:${ri.color};border:1px solid ${ri.color}55">${obj.rarity}</span>`:''}
        ${obj.attunement?`<span style="font-size:15px;padding:1px 6px;border-radius:4px;background:rgba(156,39,176,.1);color:#9c27b0;border:1px solid rgba(156,39,176,.3)">🔗 Lien requis</span>`:''}
      </div>
      <div style="font-size:17px;color:var(--text3)">${esc(obj.type||'')}${ri?' · '+ri.level+' · '+ri.price:obj.value?' — '+obj.value+' po':''}</div>
      ${obj.desc?`<div style="font-size:17px;color:var(--text2);margin-top:2px">${esc(obj.desc)}</div>`:''}
    </div>
    <div style="display:flex;gap:4px;align-items:center">
      <button class="btn bsm bprimary" onclick="mjOpenGiveItem(${i})">🎁 Donner</button>
      <button class="btn bsm" title="Enregistrer dans un compendium" onclick="mjItemToPack(${i})">📚</button>
      <button class="btn bsm" style="color:#e53935;border-color:#e53935" onclick="mjDeleteItem(${i})">✕</button>
    </div>
  </div>`;}).join(''):`<div style="color:var(--text3);font-size:18px;font-style:italic;text-align:center;padding:16px">Aucun objet dans votre liste. Créez-en un ou cherchez dans le compendium.</div>`;

  const rarFilterBar=['','Commun','Peu commun','Rare','Très rare','Légendaire','Artefact'].map(r=>{
    const ri=r?RARITY_INFO[r]:null;
    const active=_encRarityFilter===r;
    const col=ri?ri.color:'var(--cp)';
    return`<button class="btn bsm" onclick="_encRarityFilter='${r}';renderMJContent();setTimeout(()=>mjFilterItems(document.getElementById('itemSearch')?document.getElementById('itemSearch').value:''),30)" style="font-size:15px;padding:2px 8px;${active?`background:${col};color:#fff;border-color:transparent`:`border-color:var(--border);color:var(--text2)`}">${r||'Tout'}</button>`;
  }).join('');

  const compSection=ITEMS_DB
    ?`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:12px">
        <div style="font-size:18px;font-weight:600;color:var(--cp);margin-bottom:8px">📚 Compendium — ${ITEMS_DB.length.toLocaleString()} objets D&D 5e</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px">${rarFilterBar}</div>
        <input class="fi" id="itemSearch" placeholder="Chercher : Épée longue, Potion de soins, Anneau..." oninput="mjFilterItems(this.value)" onfocus="mjFilterItems(this.value)" style="margin-bottom:6px">
        <div id="itemResults" style="max-height:220px;overflow-y:auto"></div>
      </div>`
    :`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:12px;text-align:center">
        <div style="font-size:18px;color:var(--text3);margin-bottom:8px">Chargez le compendium pour ajouter des objets depuis la base D&amp;D 5e SRD.</div>
        <button class="btn bsm bprimary" onclick="loadItemsDB(()=>renderMJContent())">📚 Charger le compendium d'objets</button>
      </div>`;

  return`<div>
    ${compSection}
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <div class="pt" style="margin-bottom:0;padding-bottom:0;border-bottom:none;font-size:18px">💰 Inventaire du MJ</div>
      <button class="btn bsm bprimary" onclick="mjOpenNewItem()">+ Créer manuellement</button>
    </div>
    <div class="mj-grid">${itemList}</div>
  </div>`;
}

function _mjGetRarity(it){
  const RARITY_MAP={'très rare':'Très rare','peu commun':'Peu commun','légendaire':'Légendaire','artefact':'Artefact','commun':'Commun','rare':'Rare'};
  const low=(it.d||'').toLowerCase();
  for(const [k,v] of Object.entries(RARITY_MAP)){if(low.includes(k))return v;}
  return it.mg?'Commun':null;
}
function _mjRarBadge(rar){
  if(!rar||!RARITY_INFO[rar])return '';
  const ri=RARITY_INFO[rar];
  return`<span style="font-size:15px;padding:1px 6px;border-radius:4px;background:${ri.color}22;color:${ri.color};border:1px solid ${ri.color}55;white-space:nowrap">${rar}</span>`;
}
function mjFilterItems(q){
  const el=document.getElementById('itemResults');if(!el||!ITEMS_DB)return;
  const rarF=_encRarityFilter;
  let items;
  if(!q.trim()){
    items=ITEMS_DB.map((it,i)=>({i,it}));
  }else{
    const low=q.toLowerCase();
    items=[];
    for(let i=0;i<ITEMS_DB.length;i++){
      if(ITEMS_DB[i].n&&ITEMS_DB[i].n.toLowerCase().includes(low))items.push({i,it:ITEMS_DB[i]});
    }
  }
  if(rarF)items=items.filter(({it})=>_mjGetRarity(it)===rarF);
  items.sort((a,b)=>(a.it.n||'').localeCompare(b.it.n||''));
  // liste complète (scrollable) — demande 2026-06-12
  el.innerHTML=items.length?items.map(({i,it})=>{
    const rar=_mjGetRarity(it);
    const ri=rar?RARITY_INFO[rar]:null;
    return`<div class="charlib-item" style="padding:6px 8px;cursor:pointer;flex-direction:column;align-items:flex-start;gap:2px" onclick="mjAddItemFromCompendium(${i})">
      <div style="display:flex;align-items:center;gap:6px;width:100%">
        <span style="font-size:22px;flex-shrink:0">${_TYPE_ICON[it.t]||'📦'}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:18px;font-weight:600">${esc(it.n)}</div>
          <div style="font-size:17px;color:var(--text3)">${esc(it.d||'')}${it.mg?' ✨':''}</div>
        </div>
        <span style="color:var(--cp);font-size:17px;white-space:nowrap;flex-shrink:0">+ Ajouter</span>
      </div>
      ${rar?`<div style="display:flex;gap:6px;align-items:center;padding-left:22px">${_mjRarBadge(rar)}${ri?`<span style="font-size:15px;color:var(--text3)">${ri.level} · ${ri.price}</span>`:''}</div>`:''}
    </div>`;
  }).join(''):`<div style="font-size:18px;color:var(--text3);text-align:center;padding:8px">Aucun résultat${rarF?' pour la rareté "'+esc(rarF)+'"':q.trim()?' pour "'+esc(q)+'"':''}</div>`;
}

async function mjAddItemFromCompendium(idx){
  const it=ITEMS_DB[idx];if(!it)return;
  const RARITY_MAP={'très rare':'Très rare','peu commun':'Peu commun','légendaire':'Légendaire','artefact':'Artefact','commun':'Commun','rare':'Rare'};
  const TYPE_MAP={M:'Arme',S:'Arme',MA:'Armure',LA:'Armure',HA:'Armure',G:'Divers',W:'Objet magique',R:'Objet magique',RD:'Objet magique',ST:'Outil',WD:'Objet magique',P:'Potion',SC:'Parchemin'};
  const detailLow=(it.d||'').toLowerCase();
  let rarity='Commun';
  for(const [k,v] of Object.entries(RARITY_MAP)){if(detailLow.includes(k)){rarity=v;break;}}
  const item={
    name:it.n||'Objet',
    type:TYPE_MAP[it.t]||'Divers',
    rarity,
    value:it.v||'',
    desc:(it.tx||'').substring(0,300)
  };
  _mjObjets.push(item);
  await saveMJData();
  showToast(`✅ "${item.name}" ajouté à votre inventaire !`);
  renderMJContent();
}

function mjOpenNewItem(){
  openModal(`<div class="pt">💰 Nouvel objet</div>
    <div class="g2" style="gap:8px;margin-bottom:8px">
      <div><div class="fl mb6">Nom</div><input class="fi" id="item_name" placeholder="Épée courte +1..."></div>
      <div><div class="fl mb6">Type</div>
        <select class="fi" id="item_type">
          ${['Arme','Armure','Potion','Parchemin','Objet magique','Outil','Divers'].map(t=>`<option>${t}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="g2" style="gap:8px;margin-bottom:8px">
      <div><div class="fl mb6">Rareté</div>
        <select class="fi" id="item_rarity">
          ${['Commun','Peu commun','Rare','Très rare','Légendaire','Artefact'].map(r=>`<option>${r}</option>`).join('')}
        </select>
      </div>
      <div><div class="fl mb6">Valeur (po)</div><input class="fi" id="item_value" type="number" min="0" placeholder="0"></div>
    </div>
    <div class="fl mb6">Description</div>
    <textarea class="fi" id="item_desc" rows="3" placeholder="Description, effets magiques..." style="margin-bottom:10px;resize:vertical"></textarea>
    <label style="display:flex;align-items:center;gap:8px;font-size:18px;color:var(--text2);cursor:pointer;margin-bottom:16px">
      <input type="checkbox" id="item_attunement" style="accent-color:var(--cp)">
      <span>🔗 Nécessite un lien (attunement)</span>
    </label>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="mjSaveItem()">💾 Sauvegarder</button>
    </div>`);
}

async function mjSaveItem(){
  const item={
    name:(document.getElementById('item_name').value||'Objet').trim(),
    type:document.getElementById('item_type').value,
    rarity:document.getElementById('item_rarity').value,
    value:(document.getElementById('item_value').value||'').trim(),
    desc:(document.getElementById('item_desc').value||'').trim(),
    attunement:!!(document.getElementById('item_attunement')&&document.getElementById('item_attunement').checked),
  };
  _mjObjets.push(item);
  await saveMJData();
  closeModal();showToast('✅ Objet créé !');renderMJContent();
}

async function mjDeleteItem(i){
  _mjObjets.splice(i,1);
  await saveMJData();showToast('🗑 Objet supprimé.');renderMJContent();
}

function mjOpenGiveItem(itemIdx){
  if(!_mjPlayersData.length){showToast('❌ Aucun joueur dans la campagne.');return;}
  const item=_mjObjets[itemIdx];
  openModal(`<div class="pt">🎁 Donner "${esc(item.name||'?')}"</div>
    <div style="font-size:18px;color:var(--text2);margin-bottom:14px">Choisissez le joueur qui recevra cet objet dans son inventaire.</div>
    ${_mjPlayersData.map((pp,pi)=>`<div class="charlib-item" onclick="mjGiveItem(${itemIdx},${pi})">
      <span style="font-size:20px">${pp.avatar||'⚔'}</span>
      <div style="flex:1">
        <div style="font-size:18px;font-weight:600">${esc(pp.charData&&pp.charData.charName||pp.playerName||'?')}</div>
        <div style="font-size:17px;color:var(--text3)">${esc(pp.playerName||'')}</div>
      </div>
      <span style="color:var(--cp);font-size:17px">Donner →</span>
    </div>`).join('')}
    <div style="display:flex;justify-content:flex-end;margin-top:10px"><button class="btn" onclick="closeModal()">Annuler</button></div>`);
}

async function mjGiveItem(itemIdx,playerIdx){
  const item=_mjObjets[itemIdx];
  const pp=_mjPlayersData[playerIdx];
  if(!item||!pp)return;
  try{
    const charRef=fbDb.collection('characters').doc(pp.uid+'_'+currentCampaignId);
    const charDoc=await charRef.get();
    if(!charDoc.exists){showToast('❌ Personnage introuvable.');return;}
    const charData=charDoc.data().characterData||{};
    if(!charData.inventory)charData.inventory=[];
    const ex=charData.inventory.find(i=>i.name===item.name);
    if(ex)ex.qty=(ex.qty||0)+1;
    else charData.inventory.push({name:item.name,qty:1,desc:item.desc||'',magic:item.type==='Objet magique',linkedTo:'',itemType:_TYPE_LABEL_TO_CODE[item.type]||'',attunement:item.attunement||false,attuned:false});
    await charRef.update({'characterData.inventory':charData.inventory});
    closeModal();
    showToast(`✅ "${esc(item.name||'?')}" donné à ${esc(pp.charData&&pp.charData.charName||pp.playerName||'?')} !`);
  }catch(e){showToast('❌ Erreur : '+e.message);}
}

// ─────────────────────────────────────────
// TAB JOURNAL MJ (dans l'écran MJ)
// ─────────────────────────────────────────
