// TAB: SAC
// ═══════════════════════════════════════
// ─── ENCOMBREMENT (règle variante, métrique FR : lb→kg ÷2) ───
// Poids des objets STANDARD (kg). Couverture partielle assumée : un objet inconnu compte 0
// et est signalé « sans poids connu » (poids structuré par objet du compendium = @OPTION_B).
const ITEM_WEIGHTS_KG={
  'Dague':0.5,'Gourdin':1,'Massue':5,'Bâton':2,'Hachette':1,'Javeline':1,'Marteau léger':1,"Masse d'armes":2,'Serpe':1,'Lance':1.5,
  'Arbalète légère':2.5,'Fléchette':0.125,'Arc court':1,'Fronde':0,
  'Épée courte':1,'Épée longue':1.5,'Épée à deux mains':3,'Rapière':1,'Cimeterre':1.5,'Hache de guerre':2,'Hache à deux mains':3.5,
  'Marteau de guerre':1,'Maillet':5,'Morgenstern':2,"Fléau d'armes":1,'Coutille':3,'Hallebarde':3,'Pique':9,"Lance d'arçon":3,
  'Trident':2,'Pic de guerre':1,'Fouet':1.5,'Arc long':1,'Arbalète lourde':9,'Arbalète de poing':1.5,'Sarbacane':0.5,'Filet':1.5,
  'Flèche':0.05,'Carreau':0.075,
  'Armure matelassée':4,'Armure de cuir':5,'Cuir clouté':6.5,'Armure de peau':6,'Chemise de mailles':10,"Armure d'écailles":22.5,
  'Cuirasse':10,'Demi-plate':20,'Broigne':20,'Cotte de mailles':27.5,'Clibanion':30,'Harnois':32.5,'Bouclier':3,
  'Pack du donjon':30,"Pack d'explorateur":29,"Sac d'érudit":5,"Sac d'ecclésiastique":12,'Sac de cambrioleur':22,
  'Outils de voleur':0.5,'Symbole sacré':0.5,'Focaliseur arcanique':0.5,'Focaliseur druidique':0.5,'Grimoire':1.5,
  'Potion de soins':0.25,'Corde de chanvre (15 m)':5,'Lanterne sourde':1,'Rations (10 jours)':10,
};
let _v2IncomingItemTransfers=[];
function getCarriedWeight(p){
  let kg=0,unknown=0;
  (p.inventory||[]).forEach(it=>{const w=ITEM_WEIGHTS_KG[it.name];const q=it.qty||0;if(w!=null)kg+=w*q;else if(q>0)unknown++;});
  return{kg:Math.round(kg*10)/10,unknown};
}
function getCampaignEncumbranceMode(){
  try{
    const table=(typeof _hubCache!=='undefined'&&_hubCache)
      ?_hubCache.find(entry=>entry.id===currentTableId)
      :null;
    const campaign=table&&(table.campaigns||[]).find(entry=>entry.id===currentCampaignId);
    return ['none','simple','detailed'].includes(campaign?.encumbranceMode)
      ?campaign.encumbranceMode
      :'detailed';
  }catch(e){return'detailed';}
}
// Paliers (variante D&D 5e en kg) : encombré > FOR×2,5 (−3 m) · lourdement > FOR×5 (−6 m + désavantage FOR/DEX/CON) · max FOR×7,5.
function getEncumbrance(p){
  const FOR=(p.abilities||[])[0]||10;
  const cw=getCarriedWeight(p);
  const mode=getCampaignEncumbranceMode();
  const t1=FOR*2.5,t2=FOR*5,max=FOR*7.5;
  let level=0,label='',speedMalus=0;
  if(mode==='detailed'){
    if(cw.kg>t2){level=2;label='Lourdement encombré';speedMalus=6;}
    else if(cw.kg>t1){level=1;label='Encombré';speedMalus=3;}
  }
  return{kg:cw.kg,unknown:cw.unknown,t1,t2,max,level,label,speedMalus,FOR,mode,overloaded:cw.kg>max};
}

function tabSac(p){
  const inv=p.inventory||[];const cur=p.currency||{pc:0,pa:0,pe:0,po:0,pp:0};
  const attunedCount=inv.filter(it=>it.attuned).length;
  const _invSorted=inv.map((item,i)=>({item,i})).sort((a,b)=>(a.item.name||'').localeCompare(b.item.name||''));
  const invRows=inv.length?_invSorted.map(({item,i})=>{const _t=_itemType(item.name,item);const _ico=_TYPE_ICON[_t]||'📦';const _given=!!item._v2InstanceId;const _canManageGiven=!_given||item._v2OwnerType==='character'||item._v2CarrierCharacterId===currentCharacterId;return`<div class="inv-item" style="flex-direction:column;align-items:flex-start;gap:4px;${(item.qty||0)===0?'opacity:.6':''}">
    <div style="display:flex;align-items:center;gap:8px;width:100%">
      <span style="font-size:15px;flex-shrink:0" title="${_t||'Objet'}">${_ico}</span>
      <span style="flex:1;font-size:13px;font-weight:600">${esc(item.name)}${item.magic?` <span class="magic-badge">✨${item.linkedTo?' '+esc(item.linkedTo):''}</span>`:''} ${(item.qty||0)===0?'<span style="font-size:12px;color:var(--danger);font-weight:600;border:1px solid rgba(229,57,53,.4);border-radius:2px;padding:0 4px">Épuisé</span>':''}</span>
      ${_given
        ?`<span class="ds-chip" style="font-size:11px">${item._v2OwnerType==='group'?'Groupe · ':''}${item._v2Identification==='identified'?'Identifié':item._v2Identification==='partial'?'Partiellement identifié':'Non identifié'}</span><span style="font-size:12px;color:var(--text3)">×${item.qty}</span>`
        :`<button class="btn bsm" style="padding:1px 6px;font-size:16px;line-height:1" onclick="adjustQty(${i},-1)">−</button>
          <input type="number" min="0" value="${item.qty||0}" style="width:38px;text-align:center;font-size:13px;font-weight:600;color:${(item.qty||0)===0?'var(--danger)':'var(--text)'};background:transparent;border:1px solid var(--border);border-radius:2px;padding:1px 2px;outline:none" onchange="setQty(${i},this.value)" onclick="this.select()">
          <button class="btn bsm" style="padding:1px 6px;font-size:16px;line-height:1" onclick="adjustQty(${i},+1)">+</button>
          <span onclick="removeInvItem(${i})" style="cursor:pointer;color:var(--text3);font-size:15px;margin-left:4px">×</span>`}
    </div>
    ${item.desc?`<div style="font-size:13px;color:var(--text3)">${esc(item.desc)}</div>`:''}
    ${item.statBonuses&&item.statBonuses.length?`<div style="display:flex;gap:4px;flex-wrap:wrap">${item.statBonuses.map(b=>`<span class="status-badge ${b.value>0?'bonus':'malus'}" style="font-size:12px;padding:2px 6px">${b.stat.toUpperCase()} ${b.value>0?'+':''}${b.value}</span>`).join('')}</div>`:''}
    ${item.charges?`<div style="display:flex;align-items:center;gap:6px;margin-top:2px">
      <span style="font-size:13px;color:var(--text3)">Charges:</span>
      <div>${Array.from({length:item.charges},(_,ci)=>`<span class="slot-bubble${ci>=(item.chargesUsed||0)?'':' used'}" ${_canManageGiven?`onclick="${_given?`toggleV2ItemCharge(${i},${ci})`:`toggleItemCharge(${i},${ci})`}"`:''}></span>`).join('')}</div>
      <span style="font-size:12px;color:var(--text3)">${item.charges-(item.chargesUsed||0)}/${item.charges}</span>
    </div>`:''}
    ${(_t==='P'||_t==='SC')&&(item.qty||0)>0&&_canManageGiven?`<div style="margin-top:4px"><button class="btn bsm" style="color:#7986cb;border-color:rgba(121,134,203,.4)" onclick="${_given?`useV2Consumable(${i})`:`useConsumable(${i})`}">${_t==='P'?'🧪 Utiliser':'📜 Lancer'}</button></div>`:''}
    ${item.attunement&&(!_given||item._v2OwnerType==='character')?`<div style="margin-top:4px"><button class="btn bsm" onclick="${_given?`toggleV2Attunement(${i})`:`toggleAttunement(${i})`}" style="color:${item.attuned?'var(--danger)':'var(--arcane)'};border-color:${item.attuned?'rgba(229,57,53,.4)':'rgba(156,39,176,.4)'}">${item.attuned?'🔓 Rompre le lien':'🔗 Se lier'}</button>${item.attuned?`<span style="font-size:12px;color:var(--arcane);margin-left:6px">Lié ✓</span>`:''}</div>`:''}
    ${_given?`<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:4px">
      ${item._v2OwnerType==='character'?`<button class="btn bsm" onclick="toggleV2Equipped(${i})">${item.equipped?'🧳 Ranger':'🛡 Équiper'}</button>
      <button class="btn bsm" ${item._v2PendingTransferId?'disabled title="Transfert déjà en attente"':''} onclick="openV2ItemTransfer(${i})">↗ Transférer</button>`:`<span class="ds-note">Trésor collectif${item._v2CarrierCharacterId===currentCharacterId?' · tu le transportes':''}</span>`}
      ${item._v2History?.length?`<span class="ds-note">${item._v2History.length} événement(s)</span>`:''}
    </div>`:''}
  </div>`;}).join(''):`<div style="font-size:13px;color:var(--text3);font-style:italic">Inventaire vide.</div>`;
  return`<div>
  ${_v2IncomingItemTransfers.length?`<div class="panel mb10" style="border-color:var(--cp)">
    <div class="pt">📨 Objets proposés</div>
    ${_v2IncomingItemTransfers.map(transfer=>`<div style="display:flex;gap:8px;align-items:center;padding:7px 0;border-bottom:1px solid var(--border)">
      <span style="flex:1"><b>${esc(transfer.displayName||'Objet')}</b><span class="ds-note"> · transfert proposé</span></span>
      <button class="btn bsm bac" onclick="decideV2ItemTransfer('${transfer.id}',true)">Accepter</button>
      <button class="btn bsm" onclick="decideV2ItemTransfer('${transfer.id}',false)">Refuser</button>
    </div>`).join('')}
  </div>`:''}
  ${(()=>{const enc=getEncumbrance(p);if(enc.mode==='none')return'';const pct=Math.min(100,Math.round(enc.kg/enc.max*100));const col=enc.overloaded||enc.level===2?'var(--danger)':enc.level===1?'var(--warn)':'var(--good)';
    return`<div class="panel mb10">
      <div class="pt" style="display:flex;align-items:center;justify-content:space-between"><span>🎒 Encombrement${enc.mode==='simple'?' simple':''}</span><span style="font-size:13px;font-weight:600;color:${col}">${enc.kg} kg <span style="color:var(--text3);font-weight:400">/ ${enc.max} kg</span></span></div>
      <div class="hp-bar" style="height:10px"><div class="hp-fill" style="width:${pct}%;background:${col}"></div></div>
      ${enc.mode==='detailed'?`<div style="display:flex;justify-content:space-between;gap:8px;font-size:11.5px;color:var(--text3);margin-top:3px;flex-wrap:wrap"><span>Encombré &gt; ${enc.t1} kg (−3 m)</span><span>Lourdement &gt; ${enc.t2} kg (−6 m + désavantage FOR/DEX/CON)</span></div>`:'<div class="ds-note" style="margin-top:4px">Seule la capacité de transport maximale est suivie.</div>'}
      ${enc.level?`<div style="margin-top:6px;padding:6px 8px;border-radius:2px;background:rgba(${enc.level===2?'229,57,53':'255,152,0'},.12);border:1px solid ${col};font-size:12.5px;color:${col}">⚠ ${enc.label} — vitesse réduite de ${enc.speedMalus} m (appliqué automatiquement)${enc.level===2?' · désavantage aux jets de FOR/DEX/CON (à appliquer à tes jets)':''}.</div>`:''}
      ${enc.mode==='simple'&&enc.overloaded?`<div style="margin-top:6px;padding:6px 8px;border:1px solid var(--danger);color:var(--danger);font-size:12.5px">⚠ Capacité de transport dépassée.</div>`:''}
      ${enc.unknown?`<div style="font-size:11.5px;color:var(--text3);margin-top:4px">${enc.unknown} objet(s) sans poids connu — non comptés.</div>`:''}
    </div>`;})()}
  <div class="panel mb10">
    <div class="pt" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
      <span>🪙 Bourse</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px">
      ${[['pc','Cuivre','#b87333'],['pa','Argent','#b0bec5'],['pe','Électrum','#6abfad'],['po','Or','var(--cp)'],['pp','Platine','#dcdcdc']].map(([k,lbl,col])=>`<div class="coin"><div class="coin-lbl" style="color:${col}">${lbl}</div><div id="bourse_${k}" class="coin-val" style="font-size:18px;font-weight:600;text-align:center;padding:4px 0;color:var(--text)">${cur[k]||0}</div></div>`).join('')}
    </div>
    <div style="margin-top:8px;font-size:12px;color:var(--text3);text-align:center">10 pc → 1 pa &nbsp;·&nbsp; 5 pa → 1 pe &nbsp;·&nbsp; 2 pe → 1 po &nbsp;·&nbsp; 10 po → 1 pp</div>
    <div style="display:flex;gap:8px;margin-top:10px">
      <button class="btn bsm" style="flex:1;color:var(--good);border-color:rgba(76,175,80,.5);font-weight:600" onclick="openBourseModal('gagner')">💰 Gagner</button>
      <button class="btn bsm" style="flex:1;color:var(--danger);border-color:rgba(229,57,53,.5);font-weight:600" onclick="openBourseModal('payer')">💸 Payer</button>
    </div>
  </div>
  <div class="panel">
    <div class="pt" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
      <span>Inventaire ${inv.filter(it=>it.attunement).length?`<span style="font-size:12px;padding:2px 7px;border-radius:2px;margin-left:6px;background:${attunedCount>=3?'rgba(229,57,53,.15)':'rgba(156,39,176,.1)'};color:${attunedCount>=3?'var(--danger)':'var(--arcane)'};border:1px solid ${attunedCount>=3?'rgba(229,57,53,.4)':'rgba(156,39,176,.3)'}">🔗 ${attunedCount}/3 liés</span>`:''}</span>
      ${isMJ()?`<button class="btn bsm bac" onclick="openMJCreateItem()">🎲 Créer objet/arme</button>`:''}
    </div>
    <div style="display:flex;gap:6px;margin-bottom:4px">
      <input class="fi" id="invName" placeholder="${ITEMS_DB?'Rechercher parmi '+ITEMS_DB.length.toLocaleString()+' objets...':'Nom ou recherche compendium...'}" oninput="filterSrdItems(this.value)" onfocus="if(this.value.trim())filterSrdItems(this.value)" onblur="setTimeout(()=>{const el=document.getElementById('srdList');if(el)el.style.display='none';},200)" style="flex:1">
      <button class="btn bsm bac" onclick="addInvItem()">+</button>
    </div>
    ${!ITEMS_DB?`<button class="btn bsm" style="font-size:13px;width:100%;margin-bottom:6px" onclick="loadItemsDB(()=>render())">📚 Charger le compendium d'objets</button>`:''}
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
async function _updateV2Item(item,patch,message){
  if(!item?._v2InstanceId||!currentTableId)return;
  try{
    await v2ItemService.updateOwnedState(currentTableId,item._v2InstanceId,patch);
    if(message)showToast(message);
  }catch(e){showToast('❌ Modification impossible : '+e.message);}
}
function toggleV2ItemCharge(itemIdx,chargeIdx){
  const item=P()?.inventory?.[itemIdx];if(!item)return;
  const used=item.chargesUsed||0;
  const chargesUsed=chargeIdx<used?chargeIdx:Math.min(item.charges,chargeIdx+1);
  _updateV2Item(item,{chargesUsed},'⚡ Charges mises à jour.');
}
function useV2Consumable(itemIdx){
  const item=P()?.inventory?.[itemIdx];if(!item||(item.qty||0)<=0)return;
  showToast(`${_itemType(item.name,item)==='P'?'🧪':'📜'} <strong>${esc(item.name)}</strong> utilisé.`);
  _updateV2Item(item,{quantity:Math.max(0,item.qty-1)},'');
}
function toggleV2Attunement(itemIdx){
  const p=P(),item=p?.inventory?.[itemIdx];if(!item)return;
  if(!item.attuned&&(p.inventory||[]).filter(entry=>entry.attuned).length>=3){
    showToast('❌ Maximum 3 objets liés.');return;
  }
  _updateV2Item(item,{attuned:!item.attuned},item.attuned?'🔓 Lien rompu.':'🔗 Objet lié.');
}
function toggleV2Equipped(itemIdx){
  const item=P()?.inventory?.[itemIdx];if(!item)return;
  _updateV2Item(item,{equipped:!item.equipped},item.equipped?'🧳 Objet rangé.':'🛡 Objet équipé.');
}
function openV2ItemTransfer(itemIdx){
  const item=P()?.inventory?.[itemIdx];if(!item?._v2InstanceId)return;
  const recipients=(_groupData||[])
    .filter(member=>(member.characterId||member.docId)!==currentCharacterId);
  if(!recipients.length){showToast('Aucun autre personnage disponible dans le groupe.');return;}
  openModal(`<div class="pt">↗ Proposer le transfert</div>
    <div class="ds-note" style="margin-bottom:10px">L’objet reste dans ton inventaire jusqu’à l’acceptation du destinataire.</div>
    <div class="fl mb6">Objet</div><div style="margin-bottom:10px"><b>${esc(item.name)}</b></div>
    <div class="fl mb6">Personnage destinataire</div>
    <select class="fi" id="v2TransferTarget" style="margin-bottom:14px">
      ${recipients.map(member=>`<option value="${esc(member.characterId||member.docId)}">${esc((member.charData||{}).charName||member.playerName||'Personnage')}</option>`).join('')}
    </select>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="confirmV2ItemTransfer('${item._v2InstanceId}')">Proposer</button>
    </div>`);
}
async function confirmV2ItemTransfer(instanceId){
  const targetCharacterId=document.getElementById('v2TransferTarget')?.value;
  if(!targetCharacterId)return;
  return guardAction('proposeItemTransfer:'+instanceId,async()=>{
  try{
    await v2ItemService.proposeTransfer(currentTableId,instanceId,targetCharacterId);
    closeModal();showToast('📨 Transfert proposé. L’objet reste à toi jusqu’à son acceptation.');
  }catch(e){showToast('❌ Transfert impossible : '+e.message);}
  });
}
async function decideV2ItemTransfer(transferId,accepted){
  return guardAction('decideItemTransfer:'+transferId,async()=>{
  try{
    await v2ItemService.decideTransfer(currentTableId,transferId,accepted);
    showToast(accepted?'✅ Objet reçu.':'↩ Transfert refusé.');
  }catch(e){showToast('❌ Décision impossible : '+e.message);}
  });
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
  openModal(`<div class="pt" style="color:${isGain?'var(--good)':'var(--danger)'}">${isGain?'💰 Recevoir des pièces':'💸 Payer'}</div>
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:14px 0">
      ${coins.map(([k,lbl,col])=>`<div style="text-align:center"><div style="font-size:12px;color:${col};text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">${lbl}</div><input id="bm_${k}" class="fi" type="number" min="0" value="0" style="text-align:center;font-size:16px;font-weight:600;padding:6px 2px"></div>`).join('')}
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
  if(!n){showToast('✍️ Tape un nom d\'objet à ajouter.');return;}
  const p=P();
  const _clear=()=>{if(el)el.value='';const sl=document.getElementById('srdList');if(sl){sl.innerHTML='';sl.style.display='none';}};
  // Garde-fou : si le nom correspond exactement à un objet du compendium, ajoute le VRAI objet (avec stats).
  if(ITEMS_DB){const idx=ITEMS_DB.findIndex(x=>x.n&&x.n.toLowerCase()===n.toLowerCase());if(idx>=0&&typeof addCompendiumItem==='function'){addCompendiumItem(idx);_clear();return;}}
  const srd=[...SRD.weapons,...SRD.armors].find(x=>x.name.toLowerCase()===n.toLowerCase());
  if(srd){addSrdItem(srd.name,srd.damage||srd.ca||'',srd.subtype||srd.type||'');_clear();return;}
  // Sinon : objet personnalisé (nom libre).
  _addToInventory(p,{name:n,qty:1,desc:'',magic:false,linkedTo:''});
  _clear();render();
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
    if(!res.length)return'<div style="font-size:13px;color:var(--text3);text-align:center;padding:6px">Aucun résultat.</div>';
    const suffix=!low&&ITEMS_DB.length>30?`<div style="font-size:12px;color:var(--text3);text-align:center;padding:4px">… et ${ITEMS_DB.length-30} autres — affinez la recherche</div>`:'';
    return res.map(({i,it})=>`<div class="aci" onclick="addCompendiumItem(${i})">
      <div class="ain">${_TYPE_ICON[it.t]||'📦'} ${esc(it.n)}${it.mg?' ✨':''}</div>
      <div class="ais">${esc(it.d||'')}${it.d1?' — '+it.d1+(it.d2?' / '+it.d2:'')+(it.dt?' '+it.dt:''):''}${it.ac?' — CA '+it.ac:''}</div>
    </div>`).join('')+suffix;
  }
  if(!q.trim())return[...SRD.weapons,...SRD.armors].slice(0,15).map(i=>`<div class="aci" onclick="addSrdItem('${jsq(i.name)}','${jsq(i.damage||i.ca||'')}','${jsq(i.subtype||i.type||'')}')"><div class="ain">${esc(i.name)}</div><div class="ais">${esc(i.damage||i.ca||'')} — ${esc(i.price||'')}</div></div>`).join('');
  return[...SRD.weapons,...SRD.armors].filter(i=>i.name.toLowerCase().includes(q.toLowerCase())).slice(0,8).map(i=>`<div class="aci" onclick="addSrdItem('${jsq(i.name)}','${jsq(i.damage||i.ca||'')}','${jsq(i.subtype||i.type||'')}')"><div class="ain">${esc(i.name)}</div><div class="ais">${esc(i.damage||i.ca||'')} — ${esc(i.price||'')}</div></div>`).join('');
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
