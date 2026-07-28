// Catégorisation PNJ narratif vs Monstre de combat (le champ `type` existe déjà)
var _mjNPCFilter=(typeof _mjNPCFilter!=='undefined')?_mjNPCFilter:'all';
var _mjNPCSearch=(typeof _mjNPCSearch!=='undefined')?_mjNPCSearch:'';
function startV2NpcListener(tableId){
  if(typeof v2CompatService==='undefined'||!v2CompatService.isEnabled()||!tableId)return;
  const unsub=fbDb.collection('tables').doc(tableId).collection('npcs')
    .onSnapshot(snapshot=>{
      _mjNPCs=snapshot.docs.map(doc=>({_v2Id:doc.id,...doc.data()}));
      if(_mjSelectedNPC!=null&&_mjSelectedNPC>=_mjNPCs.length)_mjSelectedNPC=null;
      if(typeof _mjTab!=='undefined'&&_mjTab==='pnj')renderMJContent();
    },error=>console.warn('PNJ V2 sync error:',error));
  _unsubscribes.push(unsub);
}
async function saveMJNPCData(){
  if(typeof v2CompatService==='undefined'||!v2CompatService.isEnabled()){
    return saveMJData();
  }
  if(!currentTableId)throw new Error('Table introuvable');
  const collection=fbDb.collection('tables').doc(currentTableId).collection('npcs');
  const existing=await collection.get();
  const batch=fbDb.batch();
  const kept=new Set();
  _mjNPCs.forEach(npc=>{
    const id=npc._v2Id||collection.doc().id;
    npc._v2Id=id;
    kept.add(id);
    const clean=JSON.parse(JSON.stringify(npc));
    delete clean._v2Id;
    batch.set(collection.doc(id),{
      ...clean,
      schemaVersion:2,
      tableId:currentTableId,
      updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    });
  });
  existing.docs.forEach(doc=>{if(!kept.has(doc.id))batch.delete(doc.ref);});
  await batch.commit();
  const campaigns=await fbDb.collection('campaigns').where('tableId','==',currentTableId).get();
  const publicBatch=fbDb.batch();
  campaigns.docs.forEach(campaignDoc=>{
    const sidekicks=_mjNPCs
      .filter(npc=>npc.isSidekick===true
        &&npc.archived!==true
        &&(npc.campaignIds||[]).includes(campaignDoc.id))
      .map(npc=>({
        id:npc._v2Id,
        name:npc.name||'Comparse',
        portrait:npc.portrait||null,
        race:npc.race||'Comparse',
        classes:`${npc.sidekickLabel||'Comparse'} ${npc.sidekickLevel||1}`,
        hp:Math.max(0,Number(npc.hp)||0),
        hpMax:Math.max(1,Number(npc.hpMax||npc.hp)||1),
        temporaryHp:Math.max(0,Number(npc.tempHp)||0),
        conditions:Array.isArray(npc.conditions)?npc.conditions:[],
        controller:'gm'
      }));
    publicBatch.set(
      campaignDoc.ref.collection('publicState').doc('sidekicks'),
      {schemaVersion:2,sidekicks,updatedAt:firebase.firestore.FieldValue.serverTimestamp()}
    );
  });
  await publicBatch.commit();
}
function _npcIsMonster(n){return ['Monstre','Boss'].includes(n&&n.type);}
function mjSetNPCFilter(f){_mjNPCFilter=f;renderMJContent();}
function mjSetNPCSearch(value){
  _mjNPCSearch=String(value||'');
  renderMJContent();
  setTimeout(()=>{
    const input=document.getElementById('mjNPCSearch');
    if(input){input.focus();input.setSelectionRange(input.value.length,input.value.length);}
  },0);
}
function mjTabPNJ(){
  const sel=_mjSelectedNPC;
  const detail=sel!=null&&_mjNPCs[sel]?mjNPCDetail(_mjNPCs[sel],sel):'<div style="color:var(--text3);font-size:13px;font-style:italic;text-align:center;padding:20px">Sélectionnez un PNJ ou créez-en un nouveau.</div>';
  const campaignCount=_mjNPCs.filter(n=>(n.campaignIds||[]).includes(currentCampaignId)).length;
  const deadCount=_mjNPCs.filter(n=>n.status==='dead').length;
  const archivedCount=_mjNPCs.filter(n=>n.archived===true).length;
  const _matchFilter=n=>{
    const matchesName=!_mjNPCSearch||(n.name||'').toLowerCase().includes(_mjNPCSearch.toLowerCase());
    const matchesState=_mjNPCFilter==='all'
      ||(_mjNPCFilter==='campaign'&&(n.campaignIds||[]).includes(currentCampaignId))
      ||(_mjNPCFilter==='dead'&&n.status==='dead')
      ||(_mjNPCFilter==='archived'&&n.archived===true);
    return matchesName&&matchesState;
  };
  const sortedNPCs=_mjNPCs.map((n,i)=>({n,i})).filter(({n})=>_matchFilter(n)).sort((a,b)=>(a.n.name||'').localeCompare(b.n.name||''));
  const _fbtn=(f,label)=>`<button class="btn bsm${_mjNPCFilter===f?' bprimary':''}" onclick="mjSetNPCFilter('${f}')">${label}</button>`;
  const filterBar=`<div style="margin-bottom:8px">
    <input class="fi" id="mjNPCSearch" value="${esc(_mjNPCSearch)}" placeholder="Rechercher par nom…" oninput="mjSetNPCSearch(this.value)" style="margin-bottom:6px">
    <div style="display:flex;gap:4px;flex-wrap:wrap">${_fbtn('all','Tous ('+_mjNPCs.length+')')}${_fbtn('campaign','Dans cette campagne ('+campaignCount+')')}${_fbtn('dead','Morts ('+deadCount+')')}${_fbtn('archived','Archivés ('+archivedCount+')')}</div>
  </div>`;
  const list=sortedNPCs.length?sortedNPCs.map(({n,i})=>`<div class="pnj-card${i===sel?' pnj-selected':''}" onclick="mjSelectNPC(${i})">
    <div style="display:flex;align-items:center;justify-content:space-between">
      <div>
        <div style="font-size:13px;font-weight:600;color:var(--text)">${esc(n.name||'?')}</div>
        <div style="font-size:13px;color:var(--text3)">${esc(n.type||'PNJ')} ${n.cr?'— CR '+n.cr:''} — PV ${n.hp||0} — CA ${n.ac||0}</div>
      </div>
      <div style="display:flex;gap:4px">
        <button class="btn bsm bprimary" onclick="event.stopPropagation();mjAddNPCToCombat(${i})">⚡</button>
        <button class="btn bsm" style="color:var(--danger);border-color:var(--danger)" onclick="event.stopPropagation();mjDeleteNPC(${i})">✕</button>
      </div>
    </div>
  </div>`).join(''):`<div style="color:var(--text3);font-size:13px;font-style:italic;padding:8px 0">${_mjNPCs.length?'Aucune entrée dans cette catégorie.':'Aucun PNJ sauvegardé.'}</div>`;

  return`<div class="md-2col">
    <div class="md-list">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div class="pt" style="margin-bottom:0;padding-bottom:0;border-bottom:none">PNJ sauvegardés</div>
        <div style="display:flex;gap:4px">
          <button class="btn bsm bprimary" onclick="mjNewNPC()">+ PNJ</button>
          <button class="btn bsm" style="color:var(--arcane);border-color:rgba(156,39,176,.5)" onclick="mjOpenSidekickForm()">🤝 Comparse</button>
        </div>
      </div>
      ${filterBar}
      ${list}
    </div>
    <div class="md-detail">${detail}</div>
  </div>`;
}

function mjSelectNPC(i){_mjSelectedNPC=i;renderMJContent();}

function mjNPCDetail(n,i){
  const ab=n.abilities||[10,10,10,10,10,10];
  const statLabels=['FOR','DEX','CON','INT','SAG','CHA'];
  const abHtml=`<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:5px;margin-bottom:10px">
    ${statLabels.map((l,idx)=>{const val=ab[idx]||10;const mod=Math.floor((val-10)/2);return`<div style="background:var(--surface2);border-radius:2px;padding:5px;text-align:center"><div style="font-size:13px;color:var(--text3);letter-spacing:.05em">${l}</div><div style="font-size:14px;font-weight:700">${val}</div><div style="font-size:12px;color:var(--cp)">${mod>=0?'+'+mod:mod}</div></div>`;}).join('')}
  </div>`;
  const attacks=Array.isArray(n.attacks)?n.attacks:[];
  const spells=Array.isArray(n.spells)?n.spells:[];
  const traits=Array.isArray(n.traits)?n.traits:[];
  const attHtml=attacks.length?`<div style="margin-bottom:8px"><div class="fl mb6">⚔ Attaques</div>${attacks.map(a=>`<div style="font-size:13px;padding:5px 8px;background:var(--surface2);border-radius:2px;margin-bottom:4px"><span style="font-weight:600">${esc(a.name)}</span><span style="color:var(--text3)"> · +${a.atkBonus||0} · ${a.dmgDice||'1d6'}${a.dmgBonus?'+'+(a.dmgBonus):''}${a.dmgType?' '+esc(a.dmgType):''}${a.range?' · '+esc(a.range):''}</span></div>`).join('')}</div>`:'';
  const spHtml=spells.length?`<div style="margin-bottom:8px"><div class="fl mb6">✦ Sorts & Pouvoirs</div>${spells.map(s=>`<div style="font-size:13px;padding:5px 8px;background:var(--surface2);border-radius:2px;margin-bottom:4px"><span style="font-weight:600">${esc(s.name)}</span>${s.level?` <span style="color:var(--text3)">Niv.${s.level}</span>`:''}${s.saveStat&&s.saveDC?` <span style="color:var(--text3)">· JS ${esc(s.saveStat)} DD${s.saveDC}</span>`:''}${s.dmgDice?` <span style="color:var(--text3)">· ${esc(s.dmgDice)}${s.dmgType?' '+esc(s.dmgType):''}</span>`:''}${s.desc?`<div style="color:var(--text2);font-size:13px;margin-top:2px">${esc(s.desc)}</div>`:''}</div>`).join('')}</div>`:'';
  const trHtml=traits.length?`<div style="margin-bottom:8px"><div class="fl mb6">📜 Traits & Capacités</div>${traits.map(t=>`<div style="font-size:13px;padding:5px 8px;background:var(--surface2);border-radius:2px;margin-bottom:4px"><div style="font-weight:600">${esc(t.name)}</div>${t.desc?`<div style="color:var(--text2);font-size:13px;margin-top:2px">${esc(t.desc)}</div>`:''}</div>`).join('')}</div>`:'';
  const oldAttHtml=typeof n.attacks==='string'&&n.attacks?`<div style="margin-bottom:8px"><div class="fl mb6">Attaques</div><div style="font-size:13px;color:var(--text2);background:var(--surface2);border-radius:2px;padding:8px;white-space:pre-wrap">${esc(n.attacks)}</div></div>`:'';
  const mechanicalNotes=[
    ['Sauvegardes',n.savingThrows],['Compétences',n.skills],['Sens',n.senses],
    ['Langues',n.languages],['Résistances',n.resistances],
    ['Vulnérabilités',n.vulnerabilities],['Immunités',n.immunities]
  ].filter(([,value])=>value).map(([label,value])=>`<div style="font-size:13px;color:var(--text2);margin-bottom:3px"><strong>${label} :</strong> ${esc(value)}</div>`).join('');
  const history=n.history||{};
  const historyHtml=[
    ['Traits',history.traits],['Idéaux',history.ideals],['Liens',history.bonds],
    ['Défauts',history.flaws],['Backstory',history.backstory]
  ].filter(([,value])=>value).map(([label,value])=>`<div style="font-size:13px;color:var(--text2);margin-bottom:5px"><strong>${label} :</strong> ${esc(value)}</div>`).join('');
  return`<div class="panel">
    <div class="pt">${esc(n.name||'?')} <span style="font-size:13px;color:var(--text3);font-family:var(--B)">${esc(n.race||n.type||'PNJ')}${n.profession?' · '+esc(n.profession):''}</span></div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">
      ${n.cr?`<div style="background:var(--surface2);border-radius:2px;padding:6px 10px;text-align:center;min-width:50px"><div style="font-size:13px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em">Difficulté</div><div style="font-size:15px;font-weight:600;color:var(--cp)">${esc(n.cr)}</div></div>`:''}
      <div style="background:var(--surface2);border-radius:2px;padding:6px 10px;text-align:center;min-width:50px"><div style="font-size:13px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em">PV</div><div style="font-size:15px;font-weight:600;color:var(--good)">${n.hp||0}</div></div>
      <div style="background:var(--surface2);border-radius:2px;padding:6px 10px;text-align:center;min-width:50px"><div style="font-size:13px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em">CA</div><div style="font-size:15px;font-weight:600">${n.ac||0}</div></div>
      ${n.speed?`<div style="background:var(--surface2);border-radius:2px;padding:6px 10px;text-align:center;min-width:50px"><div style="font-size:13px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em">Vitesse</div><div style="font-size:13px;font-weight:600">${esc(n.speed)}</div></div>`:''}
    </div>
    ${abHtml}${mechanicalNotes?`<div style="margin-bottom:10px;background:var(--surface2);border-radius:2px;padding:8px">${mechanicalNotes}</div>`:''}${oldAttHtml}${attHtml}${spHtml}${trHtml}
    ${n.notes?`<div style="margin-bottom:10px"><div class="fl mb6">Description</div><div style="font-size:13px;color:var(--text2);white-space:pre-wrap;background:var(--surface2);border-radius:2px;padding:8px">${esc(n.notes)}</div></div>`:''}
    ${historyHtml?`<div style="margin-bottom:10px"><div class="fl mb6">Historique</div><div style="background:var(--surface2);border-radius:2px;padding:8px">${historyHtml}</div></div>`:''}
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      <button class="btn bsm bprimary" onclick="mjAddNPCToCombat(${i})">⚡ Ajouter au combat</button>
      <button class="btn bsm" onclick="mjEditNPC(${i})">✏ Modifier</button>
      ${!n.isSidekick?`<button class="btn bsm" style="color:var(--arcane);border-color:rgba(156,39,176,.5)" onclick="mjConvertNpcToSidekick(${i})">🤝 Devenir comparse</button>`:''}
      <button class="btn bsm" onclick="mjDuplicateNPC(${i})">📋 Dupliquer</button>
      <button class="btn bsm" title="Enregistrer dans un compendium" onclick="mjNpcToPack(${i})">📚 Compendium</button>
      <button class="btn bsm" style="color:var(--danger);border-color:var(--danger)" onclick="mjDeleteNPC(${i})">🗑 Supprimer</button>
    </div>
  </div>`;
}
async function mjDuplicateNPC(i){
  const n=_mjNPCs[i];if(!n)return;
  const clone={...n,name:(n.name||'PNJ')+' (copie)',attacks:JSON.parse(JSON.stringify(n.attacks||[])),spells:JSON.parse(JSON.stringify(n.spells||[])),traits:JSON.parse(JSON.stringify(n.traits||[]))};
  delete clone._v2Id;
  _mjNPCs.push(clone);_mjSelectedNPC=_mjNPCs.length-1;
  await saveMJNPCData();showToast('📋 PNJ dupliqué !');renderMJContent();
}

function mjNewNPC(){
  mjOpenNPCForm(null);
}
function mjEditNPC(i){
  mjOpenNPCForm(i);
}

function mjOpenNPCForm(editIdx){
  const ROTURIER_2014={
    type:'PNJ',race:'Humain',profession:'Roturier',size:'Moyenne',
    hp:4,hpMax:4,hitDice:'1d8',ac:10,speed:'9m',cr:'0',
    abilities:[10,10,10,10,10,10],
    attacks:[{name:'Gourdin',atkBonus:2,dmgDice:'1d4',dmgBonus:0,dmgType:'contondant',range:'1,5m'}],
    spells:[],traits:[],campaignIds:currentCampaignId?[currentCampaignId]:[],
    status:'alive',archived:false
  };
  const n=editIdx!=null?(_mjNPCs[editIdx]||{}):ROTURIER_2014;
  const title=editIdx!=null?'✏ Modifier le PNJ':'🐉 Nouveau PNJ / Monstre';
  _mjNewMonsterAttacks=Array.isArray(n.attacks)?n.attacks.map(a=>({...a})):[];
  _mjNewMonsterSpells=Array.isArray(n.spells)?n.spells.map(s=>({...s})):[];
  _mjNewMonsterTraits=Array.isArray(n.traits)?n.traits.map(t=>({...t})):[];
  if(typeof n.attacks==='string'&&n.attacks)_mjNewMonsterTraits.unshift({name:'Attaques',desc:n.attacks});
  const ab=n.abilities||[10,10,10,10,10,10];
  const statLabels=['FOR','DEX','CON','INT','SAG','CHA'];
  openWideModal(`<div class="pt">${title}</div>
    <div class="g2" style="gap:8px;margin-bottom:8px">
      <div><div class="fl mb6">Nom</div><input class="fi" id="pnj_name" value="${esc(n.name||'')}" placeholder="Gobelin, Marchand..."></div>
      <div><div class="fl mb6">Type</div>
        <select class="fi" id="pnj_type">
          ${['Monstre','PNJ','Garde','Marchand','Boss','Allié','Comparse','Autre'].map(t=>`<option${(n.type||'PNJ')===t?' selected':''}>${t}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="g2" style="gap:8px;margin-bottom:8px">
      <div><div class="fl mb6">Race ou nature</div><input class="fi" id="pnj_race" value="${esc(n.race||'')}" placeholder="Humain, Gobelin…"></div>
      <div><div class="fl mb6">Classe et/ou métier</div><input class="fi" id="pnj_profession" value="${esc(n.profession||'')}" placeholder="Roturier, forgeron, mage…"></div>
    </div>
    <div class="g2" style="gap:8px;margin-bottom:8px">
      <div><div class="fl mb6">Nom montré aux joueurs</div>
        <select class="fi" id="pnj_publicNameMode" onchange="document.getElementById('pnj_publicLabelWrap').style.display=this.value==='custom'?'':'none'">
          <option value="race"${(n.publicNameMode||'race')==='race'?' selected':''}>Race ou nature numérotée</option>
          <option value="known"${n.publicNameMode==='known'?' selected':''}>Nom véritable connu</option>
          <option value="custom"${n.publicNameMode==='custom'?' selected':''}>Désignation personnalisée</option>
        </select>
      </div>
      <div id="pnj_publicLabelWrap" style="display:${n.publicNameMode==='custom'?'':'none'}"><div class="fl mb6">Désignation publique</div><input class="fi" id="pnj_publicLabel" value="${esc(n.publicLabel||'')}" placeholder="Le capitaine masqué…"></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">
      <div><div class="fl mb6">État</div><select class="fi" id="pnj_status"><option value="alive"${n.status!=='dead'?' selected':''}>Vivant</option><option value="dead"${n.status==='dead'?' selected':''}>Mort</option></select></div>
      <label style="display:flex;align-items:end;gap:7px;padding:8px 0;font-size:13px;color:var(--text2)"><input type="checkbox" id="pnj_campaign" ${(n.campaignIds||[]).includes(currentCampaignId)?'checked':''}> Cette campagne</label>
      <label style="display:flex;align-items:end;gap:7px;padding:8px 0;font-size:13px;color:var(--text2)"><input type="checkbox" id="pnj_archived" ${n.archived?'checked':''}> Archivé</label>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">
      <div><div class="fl mb6">PV max</div><input class="fi" id="pnj_hp" type="number" min="1" value="${n.hpMax||n.hp||4}"></div>
      <div><div class="fl mb6">CA</div><input class="fi" id="pnj_ac" type="number" min="0" value="${n.ac??10}"></div>
      <div><div class="fl mb6">Vitesse</div><input class="fi" id="pnj_speed" value="${esc(n.speed||'9m')}" placeholder="9m"></div>
    </div>
    <div class="g2" style="gap:8px;margin-bottom:8px">
      <div><div class="fl mb6">Dés de vie</div><input class="fi" id="pnj_hitDice" value="${esc(n.hitDice||'1d8')}" placeholder="1d8"></div>
      <div><div class="fl mb6">PV actuels</div><input class="fi" id="pnj_hpCurrent" type="number" min="0" value="${n.hp??n.hpMax??4}"></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:4px">
      <div>
        <div class="fl mb6">Taille</div>
        <select class="fi" id="pnj_size" onchange="mjUpdateCRPreview()">
          ${['Très Petite','Petite','Moyenne','Grande','Très Grande','Gigantesque'].map(s=>`<option${(n.size||'Moyenne')===s?' selected':''}>${s}</option>`).join('')}
        </select>
      </div>
      <div>
        <div class="fl mb6">Difficulté (CR)</div>
        <select class="fi" id="pnj_cr" onchange="mjUpdateCRPreview()">
          ${['0','1/8','1/4','1/2',...Array.from({length:30},(_,i)=>String(i+1))].map(c=>`<option${String(n.cr??'0')===c?' selected':''}>${c}</option>`).join('')}
        </select>
      </div>
    </div>
    <div id="pnj_cr_preview" style="font-size:13px;color:var(--text3);text-align:right;margin-bottom:8px;padding-right:2px"></div>
    <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin-bottom:16px">
      ${statLabels.map((l,idx)=>`<div>
        <div style="font-size:12px;color:var(--text3);text-align:center;margin-bottom:3px">${l}</div>
        <input class="fi" id="pnj_ab${idx}" type="number" min="1" max="30" value="${ab[idx]||10}" style="text-align:center;padding:6px 4px">
      </div>`).join('')}
    </div>
    <div style="border-top:1px solid var(--border);padding-top:12px;margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="font-size:13px;font-weight:700;color:var(--text2)">⚔ Attaques</div>
        <button class="btn bsm" onclick="mjToggleMonsterSubForm('mAttForm')">+ Ajouter</button>
      </div>
      <div id="mAttForm" style="display:none;background:var(--surface2);border-radius:2px;padding:10px;margin-bottom:8px">
        <input class="fi" id="mAtt_name" placeholder="Nom (ex: Cimeterre, Arc court...)" style="margin-bottom:6px">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:6px">
          <div><div style="font-size:12px;color:var(--text3);margin-bottom:3px">Bonus attaque</div><input class="fi" id="mAtt_bonus" type="number" value="0"></div>
          <div><div style="font-size:12px;color:var(--text3);margin-bottom:3px">Dés de dégâts</div><input class="fi" id="mAtt_dice" placeholder="1d6" value="1d6"></div>
          <div><div style="font-size:12px;color:var(--text3);margin-bottom:3px">Bonus dégâts</div><input class="fi" id="mAtt_dmgBonus" type="number" value="0"></div>
        </div>
        <div class="g2" style="gap:6px;margin-bottom:8px">
          <div><div style="font-size:12px;color:var(--text3);margin-bottom:3px">Type de dégâts</div><input class="fi" id="mAtt_type" placeholder="tranchant, feu..."></div>
          <div><div style="font-size:12px;color:var(--text3);margin-bottom:3px">Portée (optionnel)</div><input class="fi" id="mAtt_range" placeholder="1.5m / 18/72m"></div>
        </div>
        <button class="btn bac bsm" style="width:100%" onclick="mjConfirmAddFormAttack()">✓ Confirmer cette attaque</button>
      </div>
      <div id="mAdd_attacksList"></div>
    </div>
    <div style="border-top:1px solid var(--border);padding-top:12px;margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="font-size:13px;font-weight:700;color:var(--text2)">✦ Sorts & Pouvoirs</div>
        <button class="btn bsm" onclick="mjToggleMonsterSubForm('mSpForm')">+ Ajouter</button>
      </div>
      <div id="mSpForm" style="display:none;background:var(--surface2);border-radius:2px;padding:10px;margin-bottom:8px">
        <div style="position:relative;margin-bottom:8px">
          <input class="fi" id="mjSpSearchQ" placeholder="🔍 Chercher dans le compendium..." oninput="_mjSpellSearch(this.value)" onfocus="_mjSpellSearch(this.value)" autocomplete="off" onblur="setTimeout(()=>{const r=document.getElementById('mjSpSearchRes');if(r)r.style.display='none';},150)">
          <div id="mjSpSearchRes" style="display:none;position:absolute;top:100%;left:0;right:0;z-index:200;background:var(--surface);border:1px solid rgba(200,168,75,.4);border-radius:0 0 6px 6px;max-height:200px;overflow-y:auto;box-shadow:0 4px 16px rgba(0,0,0,.5)"></div>
        </div>
        <input class="fi" id="mSp_name" placeholder="Nom du sort (ex: Boule de feu)" style="margin-bottom:6px">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:6px">
          <div><div style="font-size:12px;color:var(--text3);margin-bottom:3px">Niveau sort</div><input class="fi" id="mSp_level" type="number" value="1" min="0" max="9"></div>
          <div><div style="font-size:12px;color:var(--text3);margin-bottom:3px">Stat sauvegarde</div><input class="fi" id="mSp_saveStat" placeholder="DEX, CON..."></div>
          <div><div style="font-size:12px;color:var(--text3);margin-bottom:3px">DD sauvegarde</div><input class="fi" id="mSp_saveDC" type="number" value="13" min="0"></div>
        </div>
        <div class="g2" style="gap:6px;margin-bottom:6px">
          <div><div style="font-size:12px;color:var(--text3);margin-bottom:3px">Dés de dégâts</div><input class="fi" id="mSp_dice" placeholder="8d6, 2d8..."></div>
          <div><div style="font-size:12px;color:var(--text3);margin-bottom:3px">Type de dégâts</div><input class="fi" id="mSp_type" placeholder="feu, foudre..."></div>
        </div>
        <div><div style="font-size:12px;color:var(--text3);margin-bottom:3px">Description (optionnel)</div><textarea class="fi" id="mSp_desc" rows="2" placeholder="Zone 6m, chaque créature doit réussir un JS..." style="resize:vertical;margin-bottom:8px"></textarea></div>
        <button class="btn bac bsm" style="width:100%" onclick="mjConfirmAddFormSpell()">✓ Confirmer ce sort</button>
      </div>
      <div id="mAdd_spellsList"></div>
    </div>
    <div style="border-top:1px solid var(--border);padding-top:12px;margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="font-size:13px;font-weight:700;color:var(--text2)">📜 Traits & Capacités passives</div>
        <button class="btn bsm" onclick="mjToggleMonsterSubForm('mTrForm')">+ Ajouter</button>
      </div>
      <div id="mTrForm" style="display:none;background:var(--surface2);border-radius:2px;padding:10px;margin-bottom:8px">
        <input class="fi" id="mTr_name" placeholder="Nom (ex: Vision dans le noir, Résistance au feu...)" style="margin-bottom:6px">
        <textarea class="fi" id="mTr_desc" rows="2" placeholder="Description du trait ou de la capacité..." style="resize:vertical;margin-bottom:6px"></textarea>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px">
          <div><div style="font-size:12px;color:var(--text3);margin-bottom:3px">Charges (0=passif)</div><input class="fi" id="mTr_uses" type="number" min="0" value="0"></div>
          <div><div style="font-size:12px;color:var(--text3);margin-bottom:3px">Récupération</div><select class="fi" id="mTr_recovery"><option value="passive">Passif</option><option value="short">Repos court</option><option value="long">Repos long</option></select></div>
          <div><div style="font-size:12px;color:var(--text3);margin-bottom:3px">Dé (ex: 2d6+3)</div><input class="fi" id="mTr_dice" placeholder="2d6+3"></div>
        </div>
        <button class="btn bac bsm" style="width:100%" onclick="mjConfirmAddFormTrait()">✓ Confirmer ce trait</button>
      </div>
      <div id="mAdd_traitsList"></div>
    </div>
    <details style="border-top:1px solid var(--border);padding-top:10px;margin-bottom:12px">
      <summary style="cursor:pointer;font-size:13px;font-weight:700;color:var(--text2);margin-bottom:8px">Statistiques complémentaires (facultatif)</summary>
      <div class="g2" style="gap:8px">
        <div><div class="fl mb6">Sauvegardes</div><input class="fi mb6" id="pnj_savingThrows" value="${esc(n.savingThrows||'')}" placeholder="FOR +2, CON +4…"></div>
        <div><div class="fl mb6">Compétences</div><input class="fi mb6" id="pnj_skills" value="${esc(n.skills||'')}" placeholder="Perception +3…"></div>
        <div><div class="fl mb6">Sens</div><input class="fi mb6" id="pnj_senses" value="${esc(n.senses||'')}" placeholder="Vision dans le noir 18m…"></div>
        <div><div class="fl mb6">Langues</div><input class="fi mb6" id="pnj_languages" value="${esc(n.languages||'')}" placeholder="Commun…"></div>
        <div><div class="fl mb6">Résistances</div><input class="fi mb6" id="pnj_resistances" value="${esc(n.resistances||'')}"></div>
        <div><div class="fl mb6">Vulnérabilités</div><input class="fi mb6" id="pnj_vulnerabilities" value="${esc(n.vulnerabilities||'')}"></div>
      </div>
      <div class="fl mb6">Immunités</div><input class="fi" id="pnj_immunities" value="${esc(n.immunities||'')}">
    </details>
    <details style="border-top:1px solid var(--border);padding-top:10px;margin-bottom:12px">
      <summary style="cursor:pointer;font-size:13px;font-weight:700;color:var(--text2);margin-bottom:8px">Historique narratif (facultatif)</summary>
      <div class="g2" style="gap:8px">
        <div><div class="fl mb6">Traits</div><textarea class="fi mb6" id="pnj_history_traits" rows="2">${esc((n.history||{}).traits||'')}</textarea></div>
        <div><div class="fl mb6">Idéaux</div><textarea class="fi mb6" id="pnj_history_ideals" rows="2">${esc((n.history||{}).ideals||'')}</textarea></div>
        <div><div class="fl mb6">Liens</div><textarea class="fi mb6" id="pnj_history_bonds" rows="2">${esc((n.history||{}).bonds||'')}</textarea></div>
        <div><div class="fl mb6">Défauts</div><textarea class="fi mb6" id="pnj_history_flaws" rows="2">${esc((n.history||{}).flaws||'')}</textarea></div>
      </div>
      <div class="fl mb6">Backstory</div><textarea class="fi" id="pnj_history_backstory" rows="3">${esc((n.history||{}).backstory||'')}</textarea>
    </details>
    <div class="fl mb6">Description</div>
    <textarea class="fi" id="pnj_notes" rows="2" placeholder="Comportement, motivation..." style="margin-bottom:16px;resize:vertical">${esc(n.notes||'')}</textarea>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="mjSaveNPC(${editIdx!=null?editIdx:'null'})">💾 Sauvegarder</button>
    </div>`);
  mjRenderAttacksList();mjRenderSpellsList();mjRenderTraitsList();
  setTimeout(mjUpdateCRPreview,50);
}

function mjUpdateCRPreview(){
  const crEl=document.getElementById('pnj_cr');
  const szEl=document.getElementById('pnj_size');
  const prev=document.getElementById('pnj_cr_preview');
  if(!crEl||!prev)return;
  const cr=crEl.value||'1';
  const xp=crToXP(cr);
  const pb=crToPB(cr);
  const SIZE_HD={'Très Petite':'d4','Petite':'d6','Moyenne':'d8','Grande':'d10','Très Grande':'d12','Gigantesque':'d20'};
  const hd=szEl?SIZE_HD[szEl.value]||'d8':'d8';
  prev.innerHTML=`CR ${cr} → <strong style="color:var(--cp)">${xp.toLocaleString()} XP</strong> · Maîtrise <strong>+${pb}</strong> · Dé de vie suggéré : <strong>${hd}</strong>`;
}

function mjOpenSidekickForm(){
  openModal(`<div class="pt">🤝 Créer un comparse</div>
    <div style="font-size:13px;color:var(--text3);margin-bottom:12px">Un comparse gagne des niveaux avec le groupe. Ses stats s'auto-remplissent.</div>
    <div class="fl mb6">Nom</div>
    <input class="fi" id="sk_name" placeholder="Nom du comparse..." style="margin-bottom:10px" autofocus>
    <div class="g2" style="gap:8px;margin-bottom:8px">
      <div><div class="fl mb6">Type</div>
        <select class="fi" id="sk_type" onchange="mjUpdateSidekickPreview()">
          <option value="warrior">⚔ Compagnon d'armes</option>
          <option value="expert">🎭 Expert</option>
          <option value="caster">✨ Incantateur</option>
        </select>
      </div>
      <div id="sk_subtypeDiv"><div class="fl mb6">Spécialité</div>
        <select class="fi" id="sk_subtype" onchange="mjUpdateSidekickPreview()">
          <option value="healer">🩹 Guérisseur</option>
          <option value="mage">🔮 Mage</option>
        </select>
      </div>
    </div>
    <div class="fl mb6">Niveau (1–6)</div>
    <select class="fi" id="sk_level" onchange="mjUpdateSidekickPreview()" style="margin-bottom:10px">
      ${[1,2,3,4,5,6].map(l=>`<option value="${l}">Niveau ${l}</option>`).join('')}
    </select>
    <div id="sk_preview" style="background:var(--surface2);border-radius:2px;padding:10px;margin-bottom:16px;font-size:13px;color:var(--text2);min-height:60px"></div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="mjCreateSidekick()">🤝 Créer ce comparse</button>
    </div>`);
  mjUpdateSidekickPreview();
}
function mjConvertNpcToSidekick(index){
  const npc=_mjNPCs[index];if(!npc)return;
  mjOpenSidekickForm();
  setTimeout(()=>{
    const name=document.getElementById('sk_name');
    if(name)name.value=npc.name||'Comparse';
    const confirmButton=document.querySelector('[onclick="mjCreateSidekick()"]');
    if(confirmButton){
      confirmButton.textContent='🤝 Transformer ce PNJ';
      confirmButton.setAttribute('onclick',`mjCreateSidekick(${index})`);
    }
  },0);
}

function mjUpdateSidekickPreview(){
  const type=document.getElementById('sk_type')?.value||'warrior';
  const sub=document.getElementById('sk_subtype')?.value||'healer';
  const lv=parseInt(document.getElementById('sk_level')?.value||'1');
  const prev=document.getElementById('sk_preview');
  const subtypeDiv=document.getElementById('sk_subtypeDiv');
  if(!prev)return;
  if(subtypeDiv)subtypeDiv.style.display=type==='caster'?'':'none';
  const SK={
    warrior:{label:'Compagnon d\'armes',hp:[13,19,26,32,39,45],hd:['2d8+4','3d8+6','4d8+8','5d8+10','6d8+12','7d8+14'],ab:['Rôle martial — armures, armes de guerre, boucliers','Second souffle (1d10+niv PV, 1×/repos court)','Critique amélioré (19–20)','Amélioration de caractéristique (+2 ou +1/+1)','Bonus de maîtrise +1','Attaque supplémentaire (×2 par action Attaquer)']},
    expert:{label:'Expert',hp:[11,16,22,27,33,38],hd:['2d8+2','3d8+3','4d8+4','5d8+5','6d8+6','7d8+7'],ab:['Serviable & Outils — armes courantes, armures légères','Ruse (bonus : Foncer / Désengager / Se cacher)','Expertise (×2 maîtrise sur 2 compétences)','Amélioration de caractéristique (+2 ou +1/+1)','Bonus de maîtrise +1','Attaque supplémentaire (×2 par action Attaquer)']},
    caster:{label:'Incantateur',hp:[9,13,18,22,27,31],hd:['2d8','3d8','4d8','5d8','6d8','7d8'],
      healer:['Guérisseur — sorts mineurs : stabilisation, lumière · 2 emp.niv1','+ Sort niv1 : bénédiction (3 alliés +1d4 jets attaque/JS, conc. 1min)','+ Sort niv1 : bouclier de la foi (+2 CA, conc. 10min)','Amélioration caract. + sort mineur : résistance','Bonus maîtrise +1 · + Sort niv2 : aide · 2 emp.niv2','Sorts mineurs puissants (+mod. SAG aux dégâts mineurs)'],
      mage:['Mage — sorts mineurs : lumières dansantes, poigne électrique · 2 emp.niv1','+ Sort niv1 : mains brûlantes (cône 4,5m, 3d6 feu, JS DEX)','+ Sort niv1 : bouclier (+5 CA réaction, immunité projectile magique)','Amélioration caract. + sort mineur : main de mage','Bonus maîtrise +1 · + Sort niv2 : invisibilité · 2 emp.niv2','Sorts mineurs puissants (+mod. INT aux dégâts mineurs)']}
  };
  const sk=SK[type];
  const hp=type==='caster'?SK.caster.hp[lv-1]:sk.hp[lv-1];
  const hd=type==='caster'?SK.caster.hd[lv-1]:sk.hd[lv-1];
  const abilities=type==='caster'?SK.caster[sub]:sk.ab;
  prev.innerHTML=`<div style="font-weight:600;color:var(--cp);margin-bottom:6px">${sk.label||'Incantateur'} — Niveau ${lv} · PV max <strong>${hp}</strong> (${hd})</div>
    <ul style="margin:0;padding-left:14px;font-size:13px;line-height:1.7">${abilities.slice(0,lv).map(a=>`<li>${a}</li>`).join('')}</ul>`;
}

async function mjCreateSidekick(sourceIndex=null){
  const name=(document.getElementById('sk_name')?.value||'').trim()||'Comparse';
  const type=document.getElementById('sk_type')?.value||'warrior';
  const sub=document.getElementById('sk_subtype')?.value||'healer';
  const lv=parseInt(document.getElementById('sk_level')?.value||'1');
  const SK_HP={warrior:[13,19,26,32,39,45],expert:[11,16,22,27,33,38],caster:[9,13,18,22,27,31]};
  const SK_LABEL={warrior:'Compagnon d\'armes',expert:'Expert',caster:'Incantateur'};
  const SK_TRAITS={
    warrior:[
      {name:'Rôle martial',desc:'Maîtrise toutes armures, armes courantes et de guerre, boucliers.'},
      {name:'Second souffle',desc:'Action bonus : regagner 1d10 + niveau de PV. 1× par repos court ou long.',uses:1,recovery:'short',dice:'1d10'},
      {name:'Critique amélioré',desc:'Les attaques du comparse sont des coups critiques sur un résultat naturel de 19 ou 20.'},
      {name:'Amélioration de caractéristique',desc:'+2 à une valeur de caractéristique, ou +1 à deux. Maximum 20.'},
      {name:'Bonus de maîtrise +1',desc:'Le bonus de maîtrise du comparse augmente de +1.'},
      {name:'Attaque supplémentaire',desc:'Le comparse peut attaquer deux fois lorsqu\'il effectue l\'action Attaquer.'}
    ],
    expert:[
      {name:'Serviable & Outils',desc:'Maîtrise armes courantes, rapières, épées courtes, armures légères. +1 outil au choix.'},
      {name:'Ruse',desc:'Action bonus au choix : Foncer, Se désengager ou Se cacher.'},
      {name:'Expertise',desc:'Bonus de maîtrise doublé pour 2 compétences maîtrisées au choix.'},
      {name:'Amélioration de caractéristique',desc:'+2 à une valeur de caractéristique, ou +1 à deux. Maximum 20.'},
      {name:'Bonus de maîtrise +1',desc:'Le bonus de maîtrise du comparse augmente de +1.'},
      {name:'Attaque supplémentaire',desc:'Le comparse peut attaquer deux fois lorsqu\'il effectue l\'action Attaquer.'}
    ],
    caster_healer:[
      {name:'Guérisseur — Incantation',desc:'Sorts mineurs : stabilisation, lumière. Sorts connus niv.1 : 2. Emplacements niv.1 : 2. Mod. incantation : SAG.'},
      {name:'Sort niv.1 : bénédiction',desc:'Action, concentration 1 min. Jusqu\'à 3 créatures gagnent +1d4 aux jets d\'attaque et de sauvegarde.'},
      {name:'Sort niv.1 : bouclier de la foi',desc:'Action bonus, concentration 10 min. Une créature gagne +2 CA.'},
      {name:'Sort mineur : résistance',desc:'Action, concentration 1 min. Une créature gagne +1d4 à un jet de sauvegarde avant la fin du sort.'},
      {name:'Sort niv.2 : aide + emp. niv.2',desc:'Action, 8h. 2 créatures gagnent +5 PV max et PV actuels. Nouveaux : 4 sorts connus, 4 emp.niv1, 2 emp.niv2.'},
      {name:'Sorts mineurs puissants',desc:'Ajoute son modificateur de SAG aux dégâts de ses sorts mineurs.'}
    ],
    caster_mage:[
      {name:'Mage — Incantation',desc:'Sorts mineurs : lumières dansantes, poigne électrique. Sorts connus niv.1 : 2. Emplacements niv.1 : 2. Mod. incantation : INT.'},
      {name:'Sort niv.1 : mains brûlantes',desc:'1 action, cône 4,5m. Chaque créature : JS DEX ou 3d6 dégâts de feu (½ en cas de succès).'},
      {name:'Sort niv.1 : bouclier',desc:'Réaction. +5 CA jusqu\'au début du prochain tour, immunité à projectile magique.'},
      {name:'Sort mineur : main de mage',desc:'Crée une main spectrale à 9m pour manipuler des objets légers, ouvrir des portes, etc.'},
      {name:'Sort niv.2 : invisibilité + emp. niv.2',desc:'Action, concentration 1h. Une créature devient invisible. 4 sorts connus, 4 emp.niv1, 2 emp.niv2.'},
      {name:'Sorts mineurs puissants',desc:'Ajoute son modificateur d\'INT aux dégâts de ses sorts mineurs.'}
    ]
  };
  const hp=(type==='caster'?SK_HP.caster:SK_HP[type])[lv-1]||10;
  const traitKey=type==='caster'?`caster_${sub}`:type;
  const traits=(SK_TRAITS[traitKey]||[]).slice(0,lv);
  const subtypeLabel=type==='caster'?(sub==='healer'?' — Guérisseur':' — Mage'):'';
  const npc={
    name,type:'Comparse',size:'Moyenne',
    hp,ac:12,speed:'9m',cr:'',xp:0,
    abilities:[10,12,10,10,10,10],
    attacks:[],spells:[],traits,
    notes:`Comparse niveau ${lv} — ${SK_LABEL[type]||type}${subtypeLabel}`,
    isSidekick:true,
    sidekickType:type,
    sidekickLabel:(SK_LABEL[type]||type)+subtypeLabel,
    sidekickLevel:lv,
    campaignIds:currentCampaignId?[currentCampaignId]:[],
    status:'alive',
    archived:false
  };
  if(sourceIndex!=null&&_mjNPCs[sourceIndex]){
    const source=_mjNPCs[sourceIndex];
    _mjNPCs[sourceIndex]={
      ...source,
      ...npc,
      name:source.name||npc.name,
      race:source.race||npc.race,
      profession:source.profession||npc.sidekickLabel,
      hp:Math.max(Number(source.hp)||0,npc.hp),
      hpMax:Math.max(Number(source.hpMax||source.hp)||0,npc.hp),
      abilities:Array.isArray(source.abilities)?source.abilities:npc.abilities,
      attacks:Array.isArray(source.attacks)?source.attacks:[],
      spells:Array.isArray(source.spells)?source.spells:[],
      traits:[...(source.traits||[]),...npc.traits],
      campaignIds:Array.from(new Set([...(source.campaignIds||[]),...npc.campaignIds]))
    };
    _mjSelectedNPC=sourceIndex;
  }else{
    _mjNPCs.push(npc);_mjSelectedNPC=_mjNPCs.length-1;
  }
  await saveMJNPCData();
  closeModal();showToast(`✅ Comparse "${name}" créé (niv. ${lv}) !`);renderMJContent();
}

async function mjSaveNPC(editIdx){
  const cr=(document.getElementById('pnj_cr')?.value||'1').trim();
  const previous=editIdx!=null&&editIdx!=='null'?(_mjNPCs[editIdx]||{}):{};
  const campaignIds=(previous.campaignIds||[]).filter(id=>id!==currentCampaignId);
  if(document.getElementById('pnj_campaign')?.checked&&currentCampaignId)campaignIds.push(currentCampaignId);
  const npc={
    name:(document.getElementById('pnj_name').value||'PNJ').trim(),
    type:document.getElementById('pnj_type').value,
    race:(document.getElementById('pnj_race')?.value||'').trim(),
    profession:(document.getElementById('pnj_profession')?.value||'').trim(),
    publicNameMode:document.getElementById('pnj_publicNameMode')?.value||'race',
    publicLabel:(document.getElementById('pnj_publicLabel')?.value||'').trim(),
    status:document.getElementById('pnj_status')?.value||'alive',
    archived:document.getElementById('pnj_archived')?.checked||false,
    campaignIds,
    size:(document.getElementById('pnj_size')?.value||'Moyenne'),
    cr,
    xp:crToXP(cr),
    hpMax:parseInt(document.getElementById('pnj_hp').value)||4,
    hp:Math.max(0,parseInt(document.getElementById('pnj_hpCurrent')?.value)||0),
    hitDice:(document.getElementById('pnj_hitDice')?.value||'1d8').trim(),
    ac:parseInt(document.getElementById('pnj_ac').value)||10,
    speed:(document.getElementById('pnj_speed').value||'9m').trim(),
    abilities:[0,1,2,3,4,5].map(idx=>parseInt(document.getElementById('pnj_ab'+idx)?.value)||10),
    attacks:[..._mjNewMonsterAttacks],
    spells:[..._mjNewMonsterSpells],
    traits:[..._mjNewMonsterTraits],
    savingThrows:(document.getElementById('pnj_savingThrows')?.value||'').trim(),
    skills:(document.getElementById('pnj_skills')?.value||'').trim(),
    senses:(document.getElementById('pnj_senses')?.value||'').trim(),
    languages:(document.getElementById('pnj_languages')?.value||'').trim(),
    resistances:(document.getElementById('pnj_resistances')?.value||'').trim(),
    vulnerabilities:(document.getElementById('pnj_vulnerabilities')?.value||'').trim(),
    immunities:(document.getElementById('pnj_immunities')?.value||'').trim(),
    history:{
      traits:(document.getElementById('pnj_history_traits')?.value||'').trim(),
      ideals:(document.getElementById('pnj_history_ideals')?.value||'').trim(),
      bonds:(document.getElementById('pnj_history_bonds')?.value||'').trim(),
      flaws:(document.getElementById('pnj_history_flaws')?.value||'').trim(),
      backstory:(document.getElementById('pnj_history_backstory')?.value||'').trim()
    },
    isSidekick:previous.isSidekick===true||document.getElementById('pnj_type').value==='Comparse',
    sidekickType:previous.sidekickType||null,
    sidekickLabel:previous.sidekickLabel||null,
    sidekickLevel:previous.sidekickLevel||null,
    notes:(document.getElementById('pnj_notes').value||'').trim(),
  };
  _mjNewMonsterAttacks=[];_mjNewMonsterSpells=[];_mjNewMonsterTraits=[];
  if(editIdx!=null&&editIdx!=='null'){_mjNPCs[editIdx]=npc;_mjSelectedNPC=editIdx;}
  else{_mjNPCs.push(npc);_mjSelectedNPC=_mjNPCs.length-1;}
  await saveMJNPCData();
  closeModal();showToast('✅ PNJ sauvegardé !');renderMJContent();
}

async function mjDeleteNPC(i){
  if(!confirm('Supprimer ce PNJ ?'))return;
  _mjNPCs.splice(i,1);
  if(_mjSelectedNPC===i)_mjSelectedNPC=null;
  else if(_mjSelectedNPC>i)_mjSelectedNPC--;
  await saveMJNPCData();showToast('🗑 PNJ supprimé.');renderMJContent();
}

function mjAddNPCToCombat(i){
  const n=_mjNPCs[i];if(!n)return;
  const abilities=n.abilities||[10,10,10,10,10,10];
  const dexMod=Math.floor(((abilities[1]||10)-10)/2);
  const attacks=Array.isArray(n.attacks)?[...n.attacks]:[];
  const spells=Array.isArray(n.spells)?[...n.spells]:[];
  const traits=Array.isArray(n.traits)?[...n.traits]:[];
  if(typeof n.attacks==='string'&&n.attacks)traits.unshift({name:'Attaques',desc:n.attacks});
  if(n.notes)traits.push({name:'Notes',desc:n.notes});
  const publicBase=(n.race||n.type||'PNJ').trim()||'PNJ';
  let combatName=n.name||publicBase;
  if(n.publicNameMode==='custom'&&n.publicLabel)combatName=n.publicLabel;
  else if(n.publicNameMode!=='known'){
    const samePublicBase=_mjCombatants.filter(c=>!c.isPlayer&&c.publicBase===publicBase);
    if(samePublicBase.length===1&&samePublicBase[0].name===publicBase)samePublicBase[0].name=`${publicBase} 1`;
    combatName=samePublicBase.length?`${publicBase} ${samePublicBase.length+1}`:publicBase;
  }
  _mjCombatants.push({id:'npc_'+i+'_'+Date.now(),name:combatName,trueName:n.name||'',publicBase,hp:n.hp||10,hpMax:n.hpMax||n.hp||10,ac:n.ac||10,speed:n.speed||'',initiative:0,dexMod,conditions:[],isPlayer:false,abilities:[...abilities],attacks,spells,traits});
  _mjCombatLog.push(`🐉 "${esc(n.name||'PNJ')}" ajouté au combat.`);
  // setMJTab repeint déjà ; _mjPersistCombat écrit la nouvelle composition (voir combat.js).
  if(typeof _mjPersistCombat==='function')_mjPersistCombat();
  setMJTab('combat');showToast('✅ Ajouté au combat !');
}

// ─────────────────────────────────────────
// TAB OBJETS
// ─────────────────────────────────────────
