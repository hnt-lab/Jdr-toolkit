// TAB: ÉQUIPEMENT
// ═══════════════════════════════════════
function tabEquipement(p){
  const eq=p.equip||{};
  const slotHtml=s=>{const item=eq[s.id];const isMagic=item&&item.magic;return`<div class="eq-slot${item?' filled':''}${isMagic?' magic-slot':''}" style="${isMagic?'border-color:#9b59b6':''}" onclick="openEquipSlot('${s.id}')">
    <div class="eq-slot-label">${s.icon} ${s.label}</div>
    ${item?`<div class="eq-slot-item">${esc(item.name)}${isMagic?' ✨':''}</div><button class="btn bsm" onclick="event.stopPropagation();unequipSlot('${s.id}')" style="width:100%;margin-top:4px;color:#e53935;border-color:rgba(229,57,53,.3);font-size:15px;padding:2px 0">✕ Retirer</button>`:`<div class="eq-slot-empty">Vide</div>`}
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

    <!-- Maîtrises armes & armures — panneau fusionné -->
    <div class="panel">
      <div class="pt" style="display:flex;align-items:center;justify-content:space-between;cursor:pointer" onclick="_equipProfOpen.all=!_equipProfOpen.all;render()">
        <span>Maîtrises</span>
        <span style="display:flex;align-items:center;gap:8px">${isMJ()?`<span style="font-size:15px;color:var(--cp)">🎲 toggle</span>`:''}<span style="font-size:17px;color:var(--text3)">${_equipProfOpen.all?'▴':'▾'}</span></span>
      </div>
      ${_equipProfOpen.all?`
        <div style="font-size:15px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin:4px 0 6px">⚔ Armes</div>
        ${allWeapons.map(w=>{
          const prof=wProfs.some(pr=>pr.toLowerCase()===w.subtype.toLowerCase()||w.name.toLowerCase().includes(pr.toLowerCase()));
          return`<div class="prof-row" style="${isMJ()?'cursor:pointer':''}" onclick="${isMJ()?`mjToggleWeaponProf('${jsq(w.subtype)}')`:''}" title="${isMJ()?'Cliquer pour modifier':''}">
            <span class="prof-dot ${prof?'yes':'no'}"></span>
            <span style="flex:1;font-size:18px;color:${prof?'var(--text)':'var(--text3)'}">${esc(w.name)}</span>
            <span style="font-size:15px;color:var(--text3)">${esc(w.subtype)}</span>
            ${prof?`<span style="font-size:15px;color:#4caf50">✓</span>`:`<span style="font-size:15px;color:#e53935">✗</span>`}
          </div>`;
        }).join('')}
        <div style="font-size:15px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin:10px 0 6px">🛡 Armures</div>
        ${allArmors.map(a=>{
          const prof=aProfs.some(pr=>a.type.toLowerCase().includes(pr.toLowerCase())||a.name.toLowerCase().includes(pr.toLowerCase()));
          return`<div class="prof-row" style="${isMJ()?'cursor:pointer':''}" onclick="${isMJ()?`mjToggleArmorProf('${jsq(a.type)}')`:''}" title="${isMJ()?'Cliquer pour modifier':''}">
            <span class="prof-dot ${prof?'yes':'no'}"></span>
            <span style="flex:1;font-size:18px;color:${prof?'var(--text)':'var(--text3)'}">${esc(a.name)}</span>
            <span style="font-size:15px;color:var(--text3)">${esc(a.type)}</span>
            ${prof?`<span style="font-size:15px;color:#4caf50">✓</span>`:`<span style="font-size:15px;color:#e53935">✗</span>`}
          </div>`;
        }).join('')}
      `:''}
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
  let html=`<div style="font-size:15px;color:var(--text3);font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px">🎒 Depuis ton sac</div>`;
  html+=inv.length?inv.map(item=>`<div class="aci" onclick="equipItem('${slotId}','${jsq(item.name)}','${jsq(item.desc||'')}',${item.magic||false},'${jsq(item.linkedTo||'')}')"><div class="ain">${esc(item.name)}${item.magic?` <span class="magic-badge">✨</span>`:''}</div>${item.desc?`<div class="ais">${esc(item.desc)}</div>`:''}</div>`).join(''):`<div style="font-size:18px;color:var(--text3);padding:4px;font-style:italic">${allInv.length?'Aucun objet compatible dans le sac.':'Sac vide.'}</div>`;
  openModal(`<div class="pt">${SLOT_LABELS[slotId]||slotId}</div><div style="max-height:400px;overflow-y:auto">${html}</div>`);
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
