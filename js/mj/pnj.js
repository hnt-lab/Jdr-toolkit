function mjTabPNJ(){
  const sel=_mjSelectedNPC;
  const detail=sel!=null&&_mjNPCs[sel]?mjNPCDetail(_mjNPCs[sel],sel):'<div style="color:var(--text3);font-size:12px;font-style:italic;text-align:center;padding:20px">SÃ©lectionnez un PNJ ou crÃ©ez-en un nouveau.</div>';
  const list=_mjNPCs.length?_mjNPCs.map((n,i)=>`<div class="pnj-card${i===sel?' pnj-selected':''}" onclick="mjSelectNPC(${i})">
    <div style="display:flex;align-items:center;justify-content:space-between">
      <div>
        <div style="font-size:13px;font-weight:600;color:var(--text)">${esc(n.name||'?')}</div>
        <div style="font-size:11px;color:var(--text3)">${esc(n.type||'PNJ')} ${n.cr?'â€” CR '+n.cr:''} â€” PV ${n.hp||0} â€” CA ${n.ac||0}</div>
      </div>
      <div style="display:flex;gap:4px">
        <button class="btn bsm bprimary" onclick="event.stopPropagation();mjAddNPCToCombat(${i})">âš¡</button>
        <button class="btn bsm" style="color:#e53935;border-color:#e53935" onclick="event.stopPropagation();mjDeleteNPC(${i})">âœ•</button>
      </div>
    </div>
  </div>`).join(''):`<div style="color:var(--text3);font-size:12px;font-style:italic;padding:8px 0">Aucun PNJ sauvegardÃ©.</div>`;

  return`<div style="display:grid;grid-template-columns:280px 1fr;gap:12px">
    <div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div class="pt" style="margin-bottom:0;padding-bottom:0;border-bottom:none">PNJ sauvegardÃ©s</div>
        <div style="display:flex;gap:4px">
          <button class="btn bsm bprimary" onclick="mjNewNPC()">+ PNJ</button>
          <button class="btn bsm" style="color:#9c27b0;border-color:rgba(156,39,176,.5)" onclick="mjOpenSidekickForm()">ðŸ¤ Comparse</button>
        </div>
      </div>
      ${list}
    </div>
    <div>${detail}</div>
  </div>`;
}

function mjSelectNPC(i){_mjSelectedNPC=i;renderMJContent();}

function mjNPCDetail(n,i){
  const ab=n.abilities||[10,10,10,10,10,10];
  const statLabels=['FOR','DEX','CON','INT','SAG','CHA'];
  const abHtml=`<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:5px;margin-bottom:10px">
    ${statLabels.map((l,idx)=>{const val=ab[idx]||10;const mod=Math.floor((val-10)/2);return`<div style="background:var(--surface2);border-radius:6px;padding:5px;text-align:center"><div style="font-size:9px;color:var(--text3);letter-spacing:.05em">${l}</div><div style="font-size:14px;font-weight:700">${val}</div><div style="font-size:10px;color:var(--cp)">${mod>=0?'+'+mod:mod}</div></div>`;}).join('')}
  </div>`;
  const attacks=Array.isArray(n.attacks)?n.attacks:[];
  const spells=Array.isArray(n.spells)?n.spells:[];
  const traits=Array.isArray(n.traits)?n.traits:[];
  const attHtml=attacks.length?`<div style="margin-bottom:8px"><div class="fl mb6">âš” Attaques</div>${attacks.map(a=>`<div style="font-size:12px;padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px"><span style="font-weight:600">${esc(a.name)}</span><span style="color:var(--text3)"> Â· +${a.atkBonus||0} Â· ${a.dmgDice||'1d6'}${a.dmgBonus?'+'+(a.dmgBonus):''}${a.dmgType?' '+esc(a.dmgType):''}${a.range?' Â· '+esc(a.range):''}</span></div>`).join('')}</div>`:'';
  const spHtml=spells.length?`<div style="margin-bottom:8px"><div class="fl mb6">âœ¦ Sorts & Pouvoirs</div>${spells.map(s=>`<div style="font-size:12px;padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px"><span style="font-weight:600">${esc(s.name)}</span>${s.level?` <span style="color:var(--text3)">Niv.${s.level}</span>`:''}${s.saveStat&&s.saveDC?` <span style="color:var(--text3)">Â· JS ${esc(s.saveStat)} DD${s.saveDC}</span>`:''}${s.dmgDice?` <span style="color:var(--text3)">Â· ${esc(s.dmgDice)}${s.dmgType?' '+esc(s.dmgType):''}</span>`:''}${s.desc?`<div style="color:var(--text2);font-size:11px;margin-top:2px">${esc(s.desc)}</div>`:''}</div>`).join('')}</div>`:'';
  const trHtml=traits.length?`<div style="margin-bottom:8px"><div class="fl mb6">ðŸ“œ Traits & CapacitÃ©s</div>${traits.map(t=>`<div style="font-size:12px;padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px"><div style="font-weight:600">${esc(t.name)}</div>${t.desc?`<div style="color:var(--text2);font-size:11px;margin-top:2px">${esc(t.desc)}</div>`:''}</div>`).join('')}</div>`:'';
  const oldAttHtml=typeof n.attacks==='string'&&n.attacks?`<div style="margin-bottom:8px"><div class="fl mb6">Attaques</div><div style="font-size:12px;color:var(--text2);background:var(--surface2);border-radius:6px;padding:8px;white-space:pre-wrap">${esc(n.attacks)}</div></div>`:'';
  return`<div class="panel">
    <div class="pt">${esc(n.name||'?')} <span style="font-size:11px;color:var(--text3);font-family:var(--B)">${esc(n.type||'PNJ')}</span></div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">
      ${n.cr?`<div style="background:var(--surface2);border-radius:6px;padding:6px 10px;text-align:center;min-width:50px"><div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em">DifficultÃ©</div><div style="font-size:15px;font-weight:600;color:var(--cp)">${esc(n.cr)}</div></div>`:''}
      <div style="background:var(--surface2);border-radius:6px;padding:6px 10px;text-align:center;min-width:50px"><div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em">PV</div><div style="font-size:15px;font-weight:600;color:#4caf50">${n.hp||0}</div></div>
      <div style="background:var(--surface2);border-radius:6px;padding:6px 10px;text-align:center;min-width:50px"><div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em">CA</div><div style="font-size:15px;font-weight:600">${n.ac||0}</div></div>
      ${n.speed?`<div style="background:var(--surface2);border-radius:6px;padding:6px 10px;text-align:center;min-width:50px"><div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em">Vitesse</div><div style="font-size:13px;font-weight:600">${esc(n.speed)}</div></div>`:''}
    </div>
    ${abHtml}${oldAttHtml}${attHtml}${spHtml}${trHtml}
    ${n.notes?`<div style="margin-bottom:10px"><div class="fl mb6">Notes</div><div style="font-size:12px;color:var(--text2);white-space:pre-wrap;background:var(--surface2);border-radius:6px;padding:8px">${esc(n.notes)}</div></div>`:''}
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      <button class="btn bsm bprimary" onclick="mjAddNPCToCombat(${i})">âš¡ Ajouter au combat</button>
      <button class="btn bsm" onclick="mjEditNPC(${i})">âœ Modifier</button>
      <button class="btn bsm" onclick="mjDuplicateNPC(${i})">ðŸ“‹ Dupliquer</button>
      <button class="btn bsm" style="color:#e53935;border-color:#e53935" onclick="mjDeleteNPC(${i})">ðŸ—‘ Supprimer</button>
    </div>
  </div>`;
}
async function mjDuplicateNPC(i){
  const n=_mjNPCs[i];if(!n)return;
  const clone={...n,name:(n.name||'PNJ')+' (copie)',attacks:JSON.parse(JSON.stringify(n.attacks||[])),spells:JSON.parse(JSON.stringify(n.spells||[])),traits:JSON.parse(JSON.stringify(n.traits||[]))};
  _mjNPCs.push(clone);_mjSelectedNPC=_mjNPCs.length-1;
  await saveMJData();showToast('ðŸ“‹ PNJ dupliquÃ© !');renderMJContent();
}

function mjNewNPC(){
  mjOpenNPCForm(null);
}
function mjEditNPC(i){
  mjOpenNPCForm(i);
}

function mjOpenNPCForm(editIdx){
  const n=editIdx!=null?(_mjNPCs[editIdx]||{}):{};
  const title=editIdx!=null?'âœ Modifier le PNJ':'ðŸ‰ Nouveau PNJ / Monstre';
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
          ${['Monstre','PNJ','Garde','Marchand','Boss','AlliÃ©','Autre'].map(t=>`<option${(n.type||'PNJ')===t?' selected':''}>${t}</option>`).join('')}
        </select>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">
      <div><div class="fl mb6">PV max</div><input class="fi" id="pnj_hp" type="number" min="1" value="${n.hp||10}"></div>
      <div><div class="fl mb6">CA</div><input class="fi" id="pnj_ac" type="number" min="0" value="${n.ac||13}"></div>
      <div><div class="fl mb6">Vitesse</div><input class="fi" id="pnj_speed" value="${esc(n.speed||'9m')}" placeholder="9m"></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:4px">
      <div>
        <div class="fl mb6">Taille</div>
        <select class="fi" id="pnj_size" onchange="mjUpdateCRPreview()">
          ${['TrÃ¨s Petite','Petite','Moyenne','Grande','TrÃ¨s Grande','Gigantesque'].map(s=>`<option${(n.size||'Moyenne')===s?' selected':''}>${s}</option>`).join('')}
        </select>
      </div>
      <div>
        <div class="fl mb6">DifficultÃ© (CR)</div>
        <select class="fi" id="pnj_cr" onchange="mjUpdateCRPreview()">
          ${['0','1/8','1/4','1/2',...Array.from({length:30},(_,i)=>String(i+1))].map(c=>`<option${(n.cr||'1')===c?' selected':''}>${c}</option>`).join('')}
        </select>
      </div>
    </div>
    <div id="pnj_cr_preview" style="font-size:11px;color:var(--text3);text-align:right;margin-bottom:8px;padding-right:2px"></div>
    <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin-bottom:16px">
      ${statLabels.map((l,idx)=>`<div>
        <div style="font-size:10px;color:var(--text3);text-align:center;margin-bottom:3px">${l}</div>
        <input class="fi" id="pnj_ab${idx}" type="number" min="1" max="30" value="${ab[idx]||10}" style="text-align:center;padding:6px 4px">
      </div>`).join('')}
    </div>
    <div style="border-top:1px solid var(--border);padding-top:12px;margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">âš” Attaques</div>
        <button class="btn bsm" onclick="mjToggleMonsterSubForm('mAttForm')">+ Ajouter</button>
      </div>
      <div id="mAttForm" style="display:none;background:var(--surface2);border-radius:8px;padding:10px;margin-bottom:8px">
        <input class="fi" id="mAtt_name" placeholder="Nom (ex: Cimeterre, Arc court...)" style="margin-bottom:6px">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:6px">
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Bonus attaque</div><input class="fi" id="mAtt_bonus" type="number" value="0"></div>
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">DÃ©s de dÃ©gÃ¢ts</div><input class="fi" id="mAtt_dice" placeholder="1d6" value="1d6"></div>
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Bonus dÃ©gÃ¢ts</div><input class="fi" id="mAtt_dmgBonus" type="number" value="0"></div>
        </div>
        <div class="g2" style="gap:6px;margin-bottom:8px">
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Type de dÃ©gÃ¢ts</div><input class="fi" id="mAtt_type" placeholder="tranchant, feu..."></div>
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">PortÃ©e (optionnel)</div><input class="fi" id="mAtt_range" placeholder="1.5m / 18/72m"></div>
        </div>
        <button class="btn bac bsm" style="width:100%" onclick="mjConfirmAddFormAttack()">âœ“ Confirmer cette attaque</button>
      </div>
      <div id="mAdd_attacksList"></div>
    </div>
    <div style="border-top:1px solid var(--border);padding-top:12px;margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">âœ¦ Sorts & Pouvoirs</div>
        <button class="btn bsm" onclick="mjToggleMonsterSubForm('mSpForm')">+ Ajouter</button>
      </div>
      <div id="mSpForm" style="display:none;background:var(--surface2);border-radius:8px;padding:10px;margin-bottom:8px">
        <div style="position:relative;margin-bottom:8px">
          <input class="fi" id="mjSpSearchQ" placeholder="ðŸ” Chercher dans le compendium..." oninput="_mjSpellSearch(this.value)" onfocus="_mjSpellSearch(this.value)" autocomplete="off" onblur="setTimeout(()=>{const r=document.getElementById('mjSpSearchRes');if(r)r.style.display='none';},150)">
          <div id="mjSpSearchRes" style="display:none;position:absolute;top:100%;left:0;right:0;z-index:200;background:var(--surface);border:1px solid rgba(200,168,75,.4);border-radius:0 0 6px 6px;max-height:200px;overflow-y:auto;box-shadow:0 4px 16px rgba(0,0,0,.5)"></div>
        </div>
        <input class="fi" id="mSp_name" placeholder="Nom du sort (ex: Boule de feu)" style="margin-bottom:6px">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:6px">
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Niveau sort</div><input class="fi" id="mSp_level" type="number" value="1" min="0" max="9"></div>
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Stat sauvegarde</div><input class="fi" id="mSp_saveStat" placeholder="DEX, CON..."></div>
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">DD sauvegarde</div><input class="fi" id="mSp_saveDC" type="number" value="13" min="0"></div>
        </div>
        <div class="g2" style="gap:6px;margin-bottom:6px">
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">DÃ©s de dÃ©gÃ¢ts</div><input class="fi" id="mSp_dice" placeholder="8d6, 2d8..."></div>
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Type de dÃ©gÃ¢ts</div><input class="fi" id="mSp_type" placeholder="feu, foudre..."></div>
        </div>
        <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Description (optionnel)</div><textarea class="fi" id="mSp_desc" rows="2" placeholder="Zone 6m, chaque crÃ©ature doit rÃ©ussir un JS..." style="resize:vertical;margin-bottom:8px"></textarea></div>
        <button class="btn bac bsm" style="width:100%" onclick="mjConfirmAddFormSpell()">âœ“ Confirmer ce sort</button>
      </div>
      <div id="mAdd_spellsList"></div>
    </div>
    <div style="border-top:1px solid var(--border);padding-top:12px;margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">ðŸ“œ Traits & CapacitÃ©s passives</div>
        <button class="btn bsm" onclick="mjToggleMonsterSubForm('mTrForm')">+ Ajouter</button>
      </div>
      <div id="mTrForm" style="display:none;background:var(--surface2);border-radius:8px;padding:10px;margin-bottom:8px">
        <input class="fi" id="mTr_name" placeholder="Nom (ex: Vision dans le noir, RÃ©sistance au feu...)" style="margin-bottom:6px">
        <textarea class="fi" id="mTr_desc" rows="2" placeholder="Description du trait ou de la capacitÃ©..." style="resize:vertical;margin-bottom:6px"></textarea>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px">
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Charges (0=passif)</div><input class="fi" id="mTr_uses" type="number" min="0" value="0"></div>
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">RÃ©cupÃ©ration</div><select class="fi" id="mTr_recovery"><option value="passive">Passif</option><option value="short">Repos court</option><option value="long">Repos long</option></select></div>
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">DÃ© (ex: 2d6+3)</div><input class="fi" id="mTr_dice" placeholder="2d6+3"></div>
        </div>
        <button class="btn bac bsm" style="width:100%" onclick="mjConfirmAddFormTrait()">âœ“ Confirmer ce trait</button>
      </div>
      <div id="mAdd_traitsList"></div>
    </div>
    <div class="fl mb6">Notes / Description</div>
    <textarea class="fi" id="pnj_notes" rows="2" placeholder="Comportement, motivation..." style="margin-bottom:16px;resize:vertical">${esc(n.notes||'')}</textarea>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="mjSaveNPC(${editIdx!=null?editIdx:'null'})">ðŸ’¾ Sauvegarder</button>
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
  const SIZE_HD={'TrÃ¨s Petite':'d4','Petite':'d6','Moyenne':'d8','Grande':'d10','TrÃ¨s Grande':'d12','Gigantesque':'d20'};
  const hd=szEl?SIZE_HD[szEl.value]||'d8':'d8';
  prev.innerHTML=`CR ${cr} â†’ <strong style="color:var(--cp)">${xp.toLocaleString()} XP</strong> Â· MaÃ®trise <strong>+${pb}</strong> Â· DÃ© de vie suggÃ©rÃ© : <strong>${hd}</strong>`;
}

function mjOpenSidekickForm(){
  openModal(`<div class="pt">ðŸ¤ CrÃ©er un comparse</div>
    <div style="font-size:12px;color:var(--text3);margin-bottom:12px">Un comparse gagne des niveaux avec le groupe. Ses stats s'auto-remplissent.</div>
    <div class="fl mb6">Nom</div>
    <input class="fi" id="sk_name" placeholder="Nom du comparse..." style="margin-bottom:10px" autofocus>
    <div class="g2" style="gap:8px;margin-bottom:8px">
      <div><div class="fl mb6">Type</div>
        <select class="fi" id="sk_type" onchange="mjUpdateSidekickPreview()">
          <option value="warrior">âš” Compagnon d'armes</option>
          <option value="expert">ðŸŽ­ Expert</option>
          <option value="caster">âœ¨ Incantateur</option>
        </select>
      </div>
      <div id="sk_subtypeDiv"><div class="fl mb6">SpÃ©cialitÃ©</div>
        <select class="fi" id="sk_subtype" onchange="mjUpdateSidekickPreview()">
          <option value="healer">ðŸ©¹ GuÃ©risseur</option>
          <option value="mage">ðŸ”® Mage</option>
        </select>
      </div>
    </div>
    <div class="fl mb6">Niveau (1â€“6)</div>
    <select class="fi" id="sk_level" onchange="mjUpdateSidekickPreview()" style="margin-bottom:10px">
      ${[1,2,3,4,5,6].map(l=>`<option value="${l}">Niveau ${l}</option>`).join('')}
    </select>
    <div id="sk_preview" style="background:var(--surface2);border-radius:8px;padding:10px;margin-bottom:16px;font-size:12px;color:var(--text2);min-height:60px"></div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="mjCreateSidekick()">ðŸ¤ CrÃ©er ce comparse</button>
    </div>`);
  mjUpdateSidekickPreview();
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
    warrior:{label:'Compagnon d\'armes',hp:[13,19,26,32,39,45],hd:['2d8+4','3d8+6','4d8+8','5d8+10','6d8+12','7d8+14'],ab:['RÃ´le martial â€” armures, armes de guerre, boucliers','Second souffle (1d10+niv PV, 1Ã—/repos court)','Critique amÃ©liorÃ© (19â€“20)','AmÃ©lioration de caractÃ©ristique (+2 ou +1/+1)','Bonus de maÃ®trise +1','Attaque supplÃ©mentaire (Ã—2 par action Attaquer)']},
    expert:{label:'Expert',hp:[11,16,22,27,33,38],hd:['2d8+2','3d8+3','4d8+4','5d8+5','6d8+6','7d8+7'],ab:['Serviable & Outils â€” armes courantes, armures lÃ©gÃ¨res','Ruse (bonus : Foncer / DÃ©sengager / Se cacher)','Expertise (Ã—2 maÃ®trise sur 2 compÃ©tences)','AmÃ©lioration de caractÃ©ristique (+2 ou +1/+1)','Bonus de maÃ®trise +1','Attaque supplÃ©mentaire (Ã—2 par action Attaquer)']},
    caster:{label:'Incantateur',hp:[9,13,18,22,27,31],hd:['2d8','3d8','4d8','5d8','6d8','7d8'],
      healer:['GuÃ©risseur â€” sorts mineurs : stabilisation, lumiÃ¨re Â· 2 emp.niv1','+ Sort niv1 : bÃ©nÃ©diction (3 alliÃ©s +1d4 jets attaque/JS, conc. 1min)','+ Sort niv1 : bouclier de la foi (+2 CA, conc. 10min)','AmÃ©lioration caract. + sort mineur : rÃ©sistance','Bonus maÃ®trise +1 Â· + Sort niv2 : aide Â· 2 emp.niv2','Sorts mineurs puissants (+mod. SAG aux dÃ©gÃ¢ts mineurs)'],
      mage:['Mage â€” sorts mineurs : lumiÃ¨res dansantes, poigne Ã©lectrique Â· 2 emp.niv1','+ Sort niv1 : mains brÃ»lantes (cÃ´ne 4,5m, 3d6 feu, JS DEX)','+ Sort niv1 : bouclier (+5 CA rÃ©action, immunitÃ© projectile magique)','AmÃ©lioration caract. + sort mineur : main de mage','Bonus maÃ®trise +1 Â· + Sort niv2 : invisibilitÃ© Â· 2 emp.niv2','Sorts mineurs puissants (+mod. INT aux dÃ©gÃ¢ts mineurs)']}
  };
  const sk=SK[type];
  const hp=type==='caster'?SK.caster.hp[lv-1]:sk.hp[lv-1];
  const hd=type==='caster'?SK.caster.hd[lv-1]:sk.hd[lv-1];
  const abilities=type==='caster'?SK.caster[sub]:sk.ab;
  prev.innerHTML=`<div style="font-weight:600;color:var(--cp);margin-bottom:6px">${sk.label||'Incantateur'} â€” Niveau ${lv} Â· PV max <strong>${hp}</strong> (${hd})</div>
    <ul style="margin:0;padding-left:14px;font-size:11px;line-height:1.7">${abilities.slice(0,lv).map(a=>`<li>${a}</li>`).join('')}</ul>`;
}

async function mjCreateSidekick(){
  const name=(document.getElementById('sk_name')?.value||'').trim()||'Comparse';
  const type=document.getElementById('sk_type')?.value||'warrior';
  const sub=document.getElementById('sk_subtype')?.value||'healer';
  const lv=parseInt(document.getElementById('sk_level')?.value||'1');
  const SK_HP={warrior:[13,19,26,32,39,45],expert:[11,16,22,27,33,38],caster:[9,13,18,22,27,31]};
  const SK_LABEL={warrior:'Compagnon d\'armes',expert:'Expert',caster:'Incantateur'};
  const SK_TRAITS={
    warrior:[
      {name:'RÃ´le martial',desc:'MaÃ®trise toutes armures, armes courantes et de guerre, boucliers.'},
      {name:'Second souffle',desc:'Action bonus : regagner 1d10 + niveau de PV. 1Ã— par repos court ou long.',uses:1,recovery:'short',dice:'1d10'},
      {name:'Critique amÃ©liorÃ©',desc:'Les attaques du comparse sont des coups critiques sur un rÃ©sultat naturel de 19 ou 20.'},
      {name:'AmÃ©lioration de caractÃ©ristique',desc:'+2 Ã  une valeur de caractÃ©ristique, ou +1 Ã  deux. Maximum 20.'},
      {name:'Bonus de maÃ®trise +1',desc:'Le bonus de maÃ®trise du comparse augmente de +1.'},
      {name:'Attaque supplÃ©mentaire',desc:'Le comparse peut attaquer deux fois lorsqu\'il effectue l\'action Attaquer.'}
    ],
    expert:[
      {name:'Serviable & Outils',desc:'MaÃ®trise armes courantes, rapiÃ¨res, Ã©pÃ©es courtes, armures lÃ©gÃ¨res. +1 outil au choix.'},
      {name:'Ruse',desc:'Action bonus au choix : Foncer, Se dÃ©sengager ou Se cacher.'},
      {name:'Expertise',desc:'Bonus de maÃ®trise doublÃ© pour 2 compÃ©tences maÃ®trisÃ©es au choix.'},
      {name:'AmÃ©lioration de caractÃ©ristique',desc:'+2 Ã  une valeur de caractÃ©ristique, ou +1 Ã  deux. Maximum 20.'},
      {name:'Bonus de maÃ®trise +1',desc:'Le bonus de maÃ®trise du comparse augmente de +1.'},
      {name:'Attaque supplÃ©mentaire',desc:'Le comparse peut attaquer deux fois lorsqu\'il effectue l\'action Attaquer.'}
    ],
    caster_healer:[
      {name:'GuÃ©risseur â€” Incantation',desc:'Sorts mineurs : stabilisation, lumiÃ¨re. Sorts connus niv.1 : 2. Emplacements niv.1 : 2. Mod. incantation : SAG.'},
      {name:'Sort niv.1 : bÃ©nÃ©diction',desc:'Action, concentration 1 min. Jusqu\'Ã  3 crÃ©atures gagnent +1d4 aux jets d\'attaque et de sauvegarde.'},
      {name:'Sort niv.1 : bouclier de la foi',desc:'Action bonus, concentration 10 min. Une crÃ©ature gagne +2 CA.'},
      {name:'Sort mineur : rÃ©sistance',desc:'Action, concentration 1 min. Une crÃ©ature gagne +1d4 Ã  un jet de sauvegarde avant la fin du sort.'},
      {name:'Sort niv.2 : aide + emp. niv.2',desc:'Action, 8h. 2 crÃ©atures gagnent +5 PV max et PV actuels. Nouveaux : 4 sorts connus, 4 emp.niv1, 2 emp.niv2.'},
      {name:'Sorts mineurs puissants',desc:'Ajoute son modificateur de SAG aux dÃ©gÃ¢ts de ses sorts mineurs.'}
    ],
    caster_mage:[
      {name:'Mage â€” Incantation',desc:'Sorts mineurs : lumiÃ¨res dansantes, poigne Ã©lectrique. Sorts connus niv.1 : 2. Emplacements niv.1 : 2. Mod. incantation : INT.'},
      {name:'Sort niv.1 : mains brÃ»lantes',desc:'1 action, cÃ´ne 4,5m. Chaque crÃ©ature : JS DEX ou 3d6 dÃ©gÃ¢ts de feu (Â½ en cas de succÃ¨s).'},
      {name:'Sort niv.1 : bouclier',desc:'RÃ©action. +5 CA jusqu\'au dÃ©but du prochain tour, immunitÃ© Ã  projectile magique.'},
      {name:'Sort mineur : main de mage',desc:'CrÃ©e une main spectrale Ã  9m pour manipuler des objets lÃ©gers, ouvrir des portes, etc.'},
      {name:'Sort niv.2 : invisibilitÃ© + emp. niv.2',desc:'Action, concentration 1h. Une crÃ©ature devient invisible. 4 sorts connus, 4 emp.niv1, 2 emp.niv2.'},
      {name:'Sorts mineurs puissants',desc:'Ajoute son modificateur d\'INT aux dÃ©gÃ¢ts de ses sorts mineurs.'}
    ]
  };
  const hp=(type==='caster'?SK_HP.caster:SK_HP[type])[lv-1]||10;
  const traitKey=type==='caster'?`caster_${sub}`:type;
  const traits=(SK_TRAITS[traitKey]||[]).slice(0,lv);
  const subtypeLabel=type==='caster'?(sub==='healer'?' â€” GuÃ©risseur':' â€” Mage'):'';
  const npc={
    name,type:'Comparse',size:'Moyenne',
    hp,ac:12,speed:'9m',cr:'',xp:0,
    abilities:[10,12,10,10,10,10],
    attacks:[],spells:[],traits,
    notes:`Comparse niveau ${lv} â€” ${SK_LABEL[type]||type}${subtypeLabel}`
  };
  _mjNPCs.push(npc);_mjSelectedNPC=_mjNPCs.length-1;
  await saveMJData();
  closeModal();showToast(`âœ… Comparse "${name}" crÃ©Ã© (niv. ${lv}) !`);renderMJContent();
}

async function mjSaveNPC(editIdx){
  const cr=(document.getElementById('pnj_cr')?.value||'1').trim();
  const npc={
    name:(document.getElementById('pnj_name').value||'PNJ').trim(),
    type:document.getElementById('pnj_type').value,
    size:(document.getElementById('pnj_size')?.value||'Moyenne'),
    cr,
    xp:crToXP(cr),
    hp:parseInt(document.getElementById('pnj_hp').value)||10,
    ac:parseInt(document.getElementById('pnj_ac').value)||13,
    speed:(document.getElementById('pnj_speed').value||'9m').trim(),
    abilities:[0,1,2,3,4,5].map(idx=>parseInt(document.getElementById('pnj_ab'+idx)?.value)||10),
    attacks:[..._mjNewMonsterAttacks],
    spells:[..._mjNewMonsterSpells],
    traits:[..._mjNewMonsterTraits],
    notes:(document.getElementById('pnj_notes').value||'').trim(),
  };
  _mjNewMonsterAttacks=[];_mjNewMonsterSpells=[];_mjNewMonsterTraits=[];
  if(editIdx!=null&&editIdx!=='null'){_mjNPCs[editIdx]=npc;_mjSelectedNPC=editIdx;}
  else{_mjNPCs.push(npc);_mjSelectedNPC=_mjNPCs.length-1;}
  await saveMJData();
  closeModal();showToast('âœ… PNJ sauvegardÃ© !');renderMJContent();
}

async function mjDeleteNPC(i){
  if(!confirm('Supprimer ce PNJ ?'))return;
  _mjNPCs.splice(i,1);
  if(_mjSelectedNPC===i)_mjSelectedNPC=null;
  else if(_mjSelectedNPC>i)_mjSelectedNPC--;
  await saveMJData();showToast('ðŸ—‘ PNJ supprimÃ©.');renderMJContent();
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
  _mjCombatants.push({id:'npc_'+i+'_'+Date.now(),name:n.name||'PNJ',hp:n.hp||10,hpMax:n.hp||10,ac:n.ac||13,speed:n.speed||'',initiative:0,dexMod,conditions:[],isPlayer:false,abilities:[...abilities],attacks,spells,traits});
  _mjCombatLog.push(`ðŸ‰ "${esc(n.name||'PNJ')}" ajoutÃ© au combat.`);
  setMJTab('combat');showToast('âœ… AjoutÃ© au combat !');
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// TAB OBJETS
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
