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
  if(!q.trim())return[...SRD.weapons,...SRD.armors].slice(0,15).map(i=>`<div class="aci" onclick="addSrdItem('${jsq(i.name)}','${esc(i.damage||i.ca||'')}','${esc(i.subtype||i.type||'')}')"><div class="ain">${esc(i.name)}</div><div class="ais">${esc(i.damage||i.ca||'')} — ${esc(i.price||'')}</div></div>`).join('');
  return[...SRD.weapons,...SRD.armors].filter(i=>i.name.toLowerCase().includes(q.toLowerCase())).slice(0,8).map(i=>`<div class="aci" onclick="addSrdItem('${jsq(i.name)}','${esc(i.damage||i.ca||'')}','${esc(i.subtype||i.type||'')}')"><div class="ain">${esc(i.name)}</div><div class="ais">${esc(i.damage||i.ca||'')} — ${esc(i.price||'')}</div></div>`).join('');
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
