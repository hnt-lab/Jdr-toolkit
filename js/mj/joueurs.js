function mjTabJoueurs(){
  if(!_mjPlayersData.length) return`<div style="text-align:center;padding:32px;color:var(--text3);font-style:italic">
    <div style="font-size:32px;margin-bottom:12px">⚔</div>
    Aucun joueur n'a encore créé de personnage dans cette campagne.
    <div style="margin-top:12px"><button class="btn bsm bprimary" onclick="renderMJContent()">🔄 Actualiser</button></div>
  </div>`;
  return`<div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px">
      <div style="font-family:var(--F);font-size:13px;color:var(--cp);white-space:nowrap">${_mjPlayersData.length} joueur(s) <span style="font-size:12px;color:var(--text3);margin-left:4px">● Live</span></div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn bsm" onclick="renderMJContent()">🔄 Actualiser</button>
        <button class="btn bsm" onclick="mjOpenCompendium()">📚 Compendium</button>
        <button class="btn bsm" style="border-color:#7986cb;color:#7986cb" onclick="mjGroupRest('short')">☕ Repos court</button>
        <button class="btn bsm" style="border-color:#5c6bc0;color:#5c6bc0" onclick="mjGroupRest('long')">🌙 Repos long</button>
        <button class="btn bsm bprimary" onclick="mjAddAllToCombat()">⚡ Tous en combat</button>
      </div>
    </div>
    <div class="mj-players-grid">${_mjPlayersData.map((pp,i)=>{
      const p=pp.charData||{};
      const hp=p.hp||0;const hpMax=p.hpMax||1;
      const hpPct=Math.max(0,Math.min(100,hpMax?hp/hpMax*100:0));
      const hpColor=hpPct>50?'var(--good)':hpPct>25?'var(--warn)':'var(--danger)';
      const cls=(p.classes||[]).map(c=>c.name+' '+c.level).join(' / ')||'?';
      const lvl=(p.classes||[]).reduce((a,c)=>a+(c.level||1),0)||1;
      const conds=p.conditions||[];
      const abilNames=['FOR','DEX','CON','INT','SAG','CHA'];
      const mods=(p.abilities||[0,0,0,0,0,0]).map(v=>Math.floor((v-10)/2));
      return`<div class="mj-player-card">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap">
          <span style="font-size:16px">${pp.avatar||'⚔'}</span>
          <div style="flex:1;min-width:150px;cursor:pointer" onclick="mjQuickKickConfirm(${i})" title="Cliquer pour exclure ce joueur">
            <div style="font-size:14px;font-weight:600;color:var(--text)">${esc(p.charName||'?')}</div>
            <div style="font-size:13px;color:var(--text3)">${esc(cls)} — Niv.${lvl} — ${esc(pp.playerName||'')}</div>
          </div>
          <button class="btn bsm" onclick="mjShowPlayerDetail(${i})">📋 Fiche</button>
          <button class="btn bsm" onclick="mjEditPlayerSheet(${i})">✏ Modifier</button>
          <button class="btn bsm bprimary" onclick="mjAddPlayerToCombat(${i})">⚡ Combat</button>
          <button class="btn bsm" style="color:var(--warn);border-color:rgba(255,152,0,.3)" onclick="mjRespecPlayer(${i})" title="Réinitialiser les niveaux">↩ Respec</button>
          <button class="btn bsm" style="color:var(--arcane);border-color:rgba(156,39,176,.3)" onclick="mjWhisperPlayer(${i})" title="Chuchoter à ce joueur">🤫</button>
          ${(p.features||[]).some(f=>f.name==='Magie sauvage')?`<button class="btn bsm" style="color:var(--arcane);border-color:rgba(206,147,216,.3)" onclick="mjTriggerSurtension(${i})" title="Déclencher une surtension de magie sauvage">🌀 Surtension</button>`:''}
          ${p.familiar?.active?`<button class="btn bsm" style="border-color:rgba(200,168,75,.5);color:var(--cp)" onclick="mjAddFamiliarToCombat(${i})" title="Ajouter le familier au combat">${p.familiar.icon||'🦉'} ${esc(p.familiar.name)}</button>`:''}
          <button class="btn bsm" style="color:var(--danger);border-color:rgba(229,57,53,.3)" onclick="mjModerationModal(${i})" title="Modérer ce joueur">🗑</button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px;margin-bottom:8px">
          <div style="background:var(--surface2);border-radius:2px;padding:8px;text-align:center">
            <div style="font-size:13px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px">PV</div>
            <div style="font-size:${hp<=0?'11':'17'}px;font-weight:600;color:${hpColor}">${hp<=0?'💀 À terre':hp+'/'+hpMax}</div>
            <div class="hp-bar"><div class="hp-fill" style="width:${hpPct}%;background:${hpColor}"></div></div>
          </div>
          <div style="background:var(--surface2);border-radius:2px;padding:8px;text-align:center">
            <div style="font-size:13px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px">CA</div>
            <div style="font-size:17px;font-weight:600">${p.ac||10}</div>
          </div>
          <div style="background:var(--surface2);border-radius:2px;padding:8px;text-align:center">
            <div style="font-size:13px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px">Init.</div>
            <div style="font-size:17px;font-weight:600;color:var(--cp)">${fmt(mods[1])}</div>
          </div>
          <div style="background:var(--surface2);border-radius:2px;padding:8px;text-align:center">
            <div style="font-size:13px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px">Niv.</div>
            <div style="font-size:17px;font-weight:600;color:var(--cp)">${lvl}</div>
          </div>
        </div>
        ${conds.length?`<div style="margin-bottom:6px">${conds.map(c=>`<span class="status-badge malus">⚠ ${esc(c)}</span>`).join('')}</div>`:''}
        ${p.secrets?`<div style="padding:8px;background:rgba(200,168,75,.06);border:1px solid rgba(200,168,75,.2);border-radius:2px;font-size:13px;color:var(--text2)"><span style="color:var(--cp);font-size:13px">🔐 Secret :</span> ${esc(p.secrets)}</div>`:''}
      </div>`;
    }).join('')}</div>
  </div>`;
}

function mjShowPlayerDetail(idx){
  const pp=_mjPlayersData[idx];if(!pp)return;
  const p=pp.charData||{};
  const abilNames=['FOR','DEX','CON','INT','SAG','CHA'];
  const abs=p.abilities||[10,10,10,10,10,10];
  const mods=abs.map(v=>Math.floor((v-10)/2));
  const lvl=(p.classes||[]).reduce((a,c)=>a+(c.level||1),0)||1;
  const pb=p.profBonus||(Math.ceil(lvl/4)+1);
  const hp=p.hp||0;const hpMax=p.hpMax||1;
  const hpPct=Math.max(0,Math.min(100,hpMax?hp/hpMax*100:0));
  const hpColor=hpPct>50?'var(--good)':hpPct>25?'var(--warn)':'var(--danger)';
  const cls=(p.classes||[]).map(c=>c.name+' niv.'+c.level).join(' / ')||'?';
  const fmt2=v=>(v>=0?'+':'')+v;
  const saveProf=new Set();
  (p.classes||[]).forEach(c=>{const cd=SRD.classes.find(cl=>cl.name===c.name);if(cd)(cd.saves||[]).forEach(s=>saveProf.add(s));});
  if((((p.classes||[]).find(c=>c.name==='Moine')||{}).level||0)>=14)['FOR','DEX','CON','INT','SAG','CHA'].forEach(s=>saveProf.add(s)); // Âme de diamant
  const skillsHtml=SKILLS.map(sk=>{
    const prof=(p.skillProf||{})[sk.name]||0;
    const bonus=mods[sk.ab]+(prof>=2?pb*2:prof>=1?pb:0);
    const icon=prof>=2?'◆':prof>=1?'●':'○';
    const col=prof>=2?'var(--cp)':prof>=1?'var(--text)':'var(--text3)';
    return`<div style="display:flex;align-items:center;gap:4px;padding:1px 0"><span style="font-size:12px;color:${col};width:12px">${icon}</span><span style="font-size:13px;flex:1">${esc(sk.name)}</span><span style="font-size:13px;font-weight:${prof?'600':'400'};color:${col}">${fmt2(bonus)}</span></div>`;
  }).join('');
  const savesHtml=abilNames.map((ab,i)=>{
    const isProf=saveProf.has(ab);const bonus=mods[i]+(isProf?pb:0);
    return`<div style="display:flex;align-items:center;gap:4px;padding:1px 0"><span style="font-size:12px;color:${isProf?'var(--cp)':'var(--text3)'};width:12px">${isProf?'●':'○'}</span><span style="font-size:13px;flex:1">${ab}</span><span style="font-size:13px;font-weight:${isProf?'600':'400'};color:${isProf?'var(--cp)':'var(--text2)'}">${fmt2(bonus)}</span></div>`;
  }).join('');
  const inv=p.inventory||[];
  const invHtml=inv.length?inv.map(it=>`<div style="display:flex;gap:6px;padding:3px 0;border-bottom:1px solid var(--border)"><span style="font-size:13px;min-width:18px;color:var(--text3)">${it.qty||1}×</span><div><span style="font-size:13px">${esc(it.name||'?')}${it.magic?'<span style="font-size:12px;color:var(--cp);margin-left:4px">✨</span>':''}</span>${it.desc?`<br><span style="font-size:12px;color:var(--text3)">${esc(it.desc)}</span>`:''}</div></div>`).join(''):'<div style="font-size:13px;color:var(--text3);font-style:italic">Inventaire vide.</div>';
  const cur=p.currency||{};
  const curHtml=['pp','po','pe','pa','pc'].filter(c=>cur[c]>0).map(c=>`${cur[c]} ${c.toUpperCase()}`).join(' · ')||'Aucune monnaie';
  const spells=p.spells||[];
  const spellsByLv={};spells.forEach(s=>{const l=s.level??0;if(!spellsByLv[l])spellsByLv[l]=[];spellsByLv[l].push(s);});
  const spellHtml=Object.keys(spellsByLv).sort((a,b)=>a-b).map(l=>`<div style="font-size:12px;color:var(--text3);text-transform:uppercase;margin:6px 0 3px">${l==='0'?'Mineurs':'Niveau '+l}</div><div style="display:flex;flex-wrap:wrap;gap:3px">${spellsByLv[l].map(s=>`<span style="font-size:13px;background:rgba(200,168,75,.1);border:1px solid rgba(200,168,75,.2);border-radius:2px;padding:2px 6px">${esc(s.name||s)}</span>`).join('')}</div>`).join('');
  const feats=(p.features||[]).filter(f=>!isFeatExcluded(f.name));
  const featHtml=feats.length?feats.map(f=>`<div style="margin-bottom:8px"><div style="font-size:13px;font-weight:600;color:var(--cp)">${esc(f.name)}${f.classe?`<span style="font-size:12px;color:var(--text3);font-weight:400"> — ${esc(f.classe)}</span>`:''}</div>${f.desc?`<div style="font-size:13px;color:var(--text2);margin-top:2px">${esc((f.desc||'').substring(0,250))}${(f.desc||'').length>250?'…':''}</div>`:''}</div>`).join(''):'<div style="font-size:13px;color:var(--text3);font-style:italic">Aucune capacité.</div>';
  const conds=p.conditions||[];
  const persBlocks=[p.traits?`<div><div style="font-size:12px;color:var(--text3);text-transform:uppercase;margin-bottom:2px">Traits</div><div style="font-size:13px;color:var(--text2)">${esc(p.traits)}</div></div>`:'',p.ideals?`<div><div style="font-size:12px;color:var(--text3);text-transform:uppercase;margin-bottom:2px">Idéaux</div><div style="font-size:13px;color:var(--text2)">${esc(p.ideals)}</div></div>`:'',p.bonds?`<div><div style="font-size:12px;color:var(--text3);text-transform:uppercase;margin-bottom:2px">Liens</div><div style="font-size:13px;color:var(--text2)">${esc(p.bonds)}</div></div>`:'',p.flaws?`<div><div style="font-size:12px;color:var(--text3);text-transform:uppercase;margin-bottom:2px">Défauts</div><div style="font-size:13px;color:var(--text2)">${esc(p.flaws)}</div></div>`:''].filter(Boolean);
  openModal(`<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
    <span style="font-size:30px">${pp.avatar||'⚔'}</span>
    <div><div style="font-size:16px;font-weight:700">${esc(p.charName||'?')}</div>
    <div style="font-size:13px;color:var(--cp)">${esc(cls)}</div>
    <div style="font-size:13px;color:var(--text3)">${[p.race,p.background,pp.playerName].filter(Boolean).map(esc).join(' · ')}</div></div>
  </div>
  <div style="max-height:75vh;overflow-y:auto;padding-right:4px">
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin-bottom:10px">
      <div style="background:var(--surface2);border-radius:2px;padding:7px;text-align:center"><div style="font-size:13px;color:var(--text3);text-transform:uppercase">PV</div><div style="font-size:14px;font-weight:700;color:${hpColor}">${hp}/${hpMax}</div><div class="hp-bar"><div class="hp-fill" style="width:${hpPct}%;background:${hpColor}"></div></div></div>
      <div style="background:var(--surface2);border-radius:2px;padding:7px;text-align:center"><div style="font-size:13px;color:var(--text3);text-transform:uppercase">CA</div><div style="font-size:14px;font-weight:700">${p.ac||10}</div></div>
      <div style="background:var(--surface2);border-radius:2px;padding:7px;text-align:center"><div style="font-size:13px;color:var(--text3);text-transform:uppercase">Init.</div><div style="font-size:14px;font-weight:700;color:var(--cp)">${fmt2(mods[1])}</div></div>
      <div style="background:var(--surface2);border-radius:2px;padding:7px;text-align:center"><div style="font-size:13px;color:var(--text3);text-transform:uppercase">Vit.</div><div style="font-size:14px;font-weight:700">${p.speed||9}m</div></div>
      <div style="background:var(--surface2);border-radius:2px;padding:7px;text-align:center"><div style="font-size:13px;color:var(--text3);text-transform:uppercase">Maîtr.</div><div style="font-size:14px;font-weight:700;color:var(--cp)">+${pb}</div></div>
    </div>
    ${conds.length?`<div style="margin-bottom:10px">${conds.map(c=>`<span class="status-badge malus">⚠ ${esc(c)}</span>`).join(' ')}</div>`:''}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
      <div>
        <div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:5px">Caractéristiques</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px;margin-bottom:8px">${abilNames.map((ab,i)=>`<div style="background:var(--surface2);border-radius:2px;padding:6px;text-align:center"><div style="font-size:13px;color:var(--text3)">${ab}</div><div style="font-size:14px;font-weight:700">${fmt2(mods[i])}</div><div style="font-size:12px;color:var(--text3)">${abs[i]}</div></div>`).join('')}</div>
        <div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px">Sauvegardes</div>
        <div style="background:var(--surface2);border-radius:2px;padding:8px">${savesHtml}</div>
      </div>
      <div>
        <div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:5px">Compétences</div>
        <div style="background:var(--surface2);border-radius:2px;padding:8px">${skillsHtml}</div>
      </div>
    </div>
    <div style="background:var(--surface2);border:1px solid var(--border);border-radius:2px;padding:10px;margin-bottom:10px">
      <div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px">Inventaire</div>
      ${invHtml}
      <div style="font-size:13px;color:var(--text3);margin-top:8px">💰 ${curHtml}</div>
    </div>
    ${spells.length?`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:2px;padding:10px;margin-bottom:10px"><div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px">Sorts</div>${spellHtml}</div>`:''}
    ${feats.length?`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:2px;padding:10px;margin-bottom:10px"><div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px">Capacités & Dons</div>${featHtml}</div>`:''}
    ${persBlocks.length?`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:2px;padding:10px;margin-bottom:10px"><div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px">Personnalité</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${persBlocks.join('')}</div></div>`:''}
    ${p.backstory?`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:2px;padding:10px;margin-bottom:10px"><div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px">Histoire du personnage</div><div style="font-size:13px;color:var(--text2);white-space:pre-wrap">${esc(p.backstory)}</div></div>`:''}
    ${p.secrets?`<div style="background:rgba(200,168,75,.06);border:1px solid rgba(200,168,75,.3);border-radius:2px;padding:10px;margin-bottom:10px"><div style="font-size:12px;color:var(--cp);text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px">🔐 Secrets (MJ)</div><div style="font-size:13px;color:var(--text2);white-space:pre-wrap">${esc(p.secrets)}</div></div>`:''}
    ${(p.languages||p.proficiencies||(p.weaponProfs&&p.weaponProfs.length))?`<div style="font-size:13px;color:var(--text3);line-height:2">${p.languages?`🗣 <b>Langues :</b> <span style="color:var(--text2)">${esc(p.languages)}</span><br>`:''}${p.proficiencies?`📜 <b>Maîtrises :</b> <span style="color:var(--text2)">${esc(p.proficiencies)}</span><br>`:''}${p.weaponProfs&&p.weaponProfs.length?`⚔ <b>Armes :</b> <span style="color:var(--text2)">${p.weaponProfs.join(', ')}</span><br>`:''}${p.armorProfs&&p.armorProfs.length?`🛡 <b>Armures :</b> <span style="color:var(--text2)">${p.armorProfs.join(', ')}</span>`:''}</div>`:''}
  </div>
  <div style="display:flex;justify-content:flex-end;margin-top:8px"></div>`);
}

// ─── MJ : ÉDITION DE LA FICHE JOUEUR ───────────────────────────────────────
let _mjEditData=null;

function _mjRenderInvList(inv){
  if(!inv.length)return'<div style="font-size:13px;color:var(--text3);font-style:italic;padding:3px 0">Inventaire vide.</div>';
  return inv.map((it,i)=>`<div style="display:flex;gap:5px;align-items:center;margin-bottom:4px">
    <input type="number" id="mje_inv_qty_${i}" value="${it.qty||1}" min="1" style="width:42px;text-align:center;background:var(--surface2);border:1px solid var(--border);border-radius:2px;color:var(--text);font-size:13px;padding:3px;outline:none">
    <input id="mje_inv_name_${i}" value="${esc(it.name||'')}" placeholder="Nom de l'objet" style="flex:1;background:var(--surface2);border:1px solid var(--border);border-radius:2px;color:var(--text);font-size:13px;padding:3px 6px;outline:none">
    <button class="btn bsm" style="color:var(--danger);padding:2px 7px;flex-shrink:0" onclick="mjEditRemoveInv(${i})">✕</button>
  </div>`).join('');
}

function _mjRenderSpellList(spells){
  if(!spells.length)return'<div style="font-size:13px;color:var(--text3);font-style:italic;padding:3px 0">Aucun sort.</div>';
  return spells.map((s,i)=>`<div style="display:flex;gap:5px;align-items:center;margin-bottom:3px;padding:3px 6px;background:var(--surface2);border-radius:2px">
    <span style="font-size:12px;color:var(--text3);min-width:18px;text-align:center">${s.level!=null?s.level:0}</span>
    <span style="flex:1;font-size:13px">${esc(s.name||s)}</span>
    <button class="btn bsm" style="color:var(--danger);padding:1px 6px;font-size:13px" onclick="mjEditRemoveSpell(${i})">✕</button>
  </div>`).join('');
}

function _mjReadInvFromDOM(){
  const inv=_mjEditData.p.inventory||[];
  return inv.map((it,i)=>({...it,
    qty:parseInt(document.getElementById('mje_inv_qty_'+i)?.value)||1,
    name:document.getElementById('mje_inv_name_'+i)?.value||it.name||''
  }));
}

function mjEditAddCond(){
  const input=document.getElementById('mje_cond_input');
  const val=(input&&input.value||'').trim();if(!val)return;
  _mjEditData.p.conditions=_mjEditData.p.conditions||[];
  _mjEditData.p.conditions.push(val);input.value='';
  const chips=document.getElementById('mje_cond_chips');
  if(chips)chips.innerHTML=_mjEditData.p.conditions.map((c,i)=>`<span class="status-badge malus" style="cursor:pointer" onclick="mjEditRemoveCond(${i})">⚠ ${esc(c)} ✕</span>`).join('');
}
function mjEditRemoveCond(i){
  (_mjEditData.p.conditions||[]).splice(i,1);
  const chips=document.getElementById('mje_cond_chips');
  const conds=_mjEditData.p.conditions||[];
  if(chips)chips.innerHTML=conds.length?conds.map((c,j)=>`<span class="status-badge malus" style="cursor:pointer" onclick="mjEditRemoveCond(${j})">⚠ ${esc(c)} ✕</span>`).join(''):'<span style="font-size:13px;color:var(--text3);font-style:italic">Aucune condition.</span>';
}
function mjEditAddInv(){
  _mjEditData.p.inventory=_mjReadInvFromDOM();
  _mjEditData.p.inventory.push({qty:1,name:'',magic:false,desc:''});
  const list=document.getElementById('mje_inv_list');
  if(list)list.innerHTML=_mjRenderInvList(_mjEditData.p.inventory);
}
function mjEditRemoveInv(i){
  const current=_mjReadInvFromDOM();current.splice(i,1);
  _mjEditData.p.inventory=current;
  const list=document.getElementById('mje_inv_list');
  if(list)list.innerHTML=_mjRenderInvList(current);
}
function mjEditAddSpell(){
  const name=(document.getElementById('mje_spell_name')?.value||'').trim();if(!name)return;
  const level=parseInt(document.getElementById('mje_spell_level')?.value)||0;
  _mjEditData.p.spells=_mjEditData.p.spells||[];
  _mjEditData.p.spells.push({name,level});
  if(document.getElementById('mje_spell_name'))document.getElementById('mje_spell_name').value='';
  if(document.getElementById('mje_spell_level'))document.getElementById('mje_spell_level').value='';
  const list=document.getElementById('mje_spell_list');
  if(list)list.innerHTML=_mjRenderSpellList(_mjEditData.p.spells);
}
function mjEditRemoveSpell(i){
  (_mjEditData.p.spells||[]).splice(i,1);
  const list=document.getElementById('mje_spell_list');
  if(list)list.innerHTML=_mjRenderSpellList(_mjEditData.p.spells||[]);
}

// ── Classes helpers ──
function _mjRenderClassList(classes){
  if(!classes.length)return'<div style="font-size:13px;color:var(--text3);font-style:italic;padding:3px 0">Aucune classe.</div>';
  return classes.map((c,i)=>`<div style="display:flex;gap:5px;align-items:center;margin-bottom:4px">
    <input id="mje_cls_name_${i}" value="${esc(c.name||'')}" placeholder="Nom de la classe" style="flex:2;background:var(--surface2);border:1px solid var(--border);border-radius:2px;color:var(--text);font-size:13px;padding:3px 6px;outline:none">
    <span style="font-size:13px;color:var(--text3);white-space:nowrap">Niv.</span>
    <input type="number" id="mje_cls_level_${i}" value="${c.level||1}" min="1" max="20" style="width:46px;text-align:center;background:var(--surface2);border:1px solid var(--border);border-radius:2px;color:var(--text);font-size:13px;padding:3px;outline:none">
    <button class="btn bsm" style="color:var(--danger);padding:2px 7px;flex-shrink:0" onclick="mjEditRemoveClass(${i})">✕</button>
  </div>`).join('');
}
function _mjReadClassFromDOM(){
  const classes=_mjEditData.p.classes||[];
  return classes.map((_,i)=>({name:document.getElementById('mje_cls_name_'+i)?.value||'',level:parseInt(document.getElementById('mje_cls_level_'+i)?.value)||1})).filter(c=>c.name);
}
function mjEditAddClass(){
  _mjEditData.p.classes=_mjReadClassFromDOM();
  _mjEditData.p.classes.push({name:'',level:1});
  const list=document.getElementById('mje_class_list');
  if(list)list.innerHTML=_mjRenderClassList(_mjEditData.p.classes);
}
function mjEditRemoveClass(i){
  const current=_mjReadClassFromDOM();current.splice(i,1);
  _mjEditData.p.classes=current;
  const list=document.getElementById('mje_class_list');
  if(list)list.innerHTML=_mjRenderClassList(current);
}

// ── Compétences helpers ──
function _mjRenderSkillGrid(){
  const sp=_mjEditData.p.skillProf||{};
  const abNames=['FOR','DEX','CON','INT','SAG','CHA'];
  return SKILLS.map(sk=>{
    const prof=sp[sk.name]||0;
    const icon=prof>=2?'◆':prof>=1?'●':'○';
    const col=prof>=2?'var(--cp)':prof>=1?'var(--text)':'var(--text3)';
    return`<div style="display:flex;align-items:center;gap:4px;padding:3px 5px;cursor:pointer;border-radius:2px;background:var(--surface2);user-select:none" onclick="mjEditToggleSkill('${sk.name}')">
      <span style="font-size:13px;color:${col};width:14px;text-align:center">${icon}</span>
      <span style="font-size:13px;flex:1;color:${prof?'var(--text)':'var(--text2)'}">${esc(sk.name)}</span>
      <span style="font-size:13px;color:var(--text3)">${abNames[sk.ab]}</span>
    </div>`;
  }).join('');
}
function mjEditToggleSkill(name){
  const sp=_mjEditData.p.skillProf=_mjEditData.p.skillProf||{};
  sp[name]=((sp[name]||0)+1)%3;
  const grid=document.getElementById('mje_skill_grid');
  if(grid)grid.innerHTML=_mjRenderSkillGrid();
}

// ── Capacités helpers ──
function _mjRenderFeatList(feats){
  if(!feats.length)return'<div style="font-size:13px;color:var(--text3);font-style:italic;padding:3px 0">Aucune capacité.</div>';
  return feats.map((f,i)=>`<div style="background:var(--surface2);border-radius:2px;padding:7px;margin-bottom:6px">
    <div style="display:flex;gap:5px;align-items:center;margin-bottom:4px">
      <input id="mje_feat_name_${i}" value="${esc(f.name||'')}" placeholder="Nom de la capacité *" style="flex:2;background:var(--surface);border:1px solid var(--border);border-radius:2px;color:var(--text);font-size:13px;font-weight:600;padding:3px 6px;outline:none">
      <input id="mje_feat_class_${i}" value="${esc(f.classe||'')}" placeholder="Classe" style="flex:1;background:var(--surface);border:1px solid var(--border);border-radius:2px;color:var(--text2);font-size:13px;padding:3px 6px;outline:none">
      <button class="btn bsm" style="color:var(--danger);padding:2px 7px;flex-shrink:0" onclick="mjEditRemoveFeat(${i})">✕</button>
    </div>
    <textarea id="mje_feat_desc_${i}" rows="2" placeholder="Description (optionnelle)" style="width:100%;box-sizing:border-box;background:var(--surface);border:1px solid var(--border);border-radius:2px;color:var(--text2);font-size:13px;padding:4px 6px;resize:vertical;outline:none">${esc(f.desc||'')}</textarea>
  </div>`).join('');
}
function _mjReadFeatsFromDOM(){
  const feats=_mjEditData.p.features||[];
  return feats.map((_,i)=>({name:document.getElementById('mje_feat_name_'+i)?.value||'',classe:document.getElementById('mje_feat_class_'+i)?.value||'',desc:document.getElementById('mje_feat_desc_'+i)?.value||''})).filter(f=>f.name);
}
function mjEditAddFeat(){
  _mjEditData.p.features=_mjReadFeatsFromDOM();
  _mjEditData.p.features.push({name:'',classe:'',desc:''});
  const list=document.getElementById('mje_feat_list');
  if(list)list.innerHTML=_mjRenderFeatList(_mjEditData.p.features);
}
function mjEditRemoveFeat(i){
  const current=_mjReadFeatsFromDOM();current.splice(i,1);
  _mjEditData.p.features=current;
  const list=document.getElementById('mje_feat_list');
  if(list)list.innerHTML=_mjRenderFeatList(current);
}

// ── Compendium personnalisé ──
// ═══ BIBLIOTHÈQUE COMPENDIUMS ═══
function _genCompId(){return Date.now().toString(36)+Math.random().toString(36).slice(2,5);}

async function loadMJCompLib(){
  if(!currentUser)return;
  try{
    const doc=await fbDb.collection('users').doc(currentUser.uid).get();
    const data=doc.exists?doc.data():{};
    _mjCompLib=data.compendiumLib||{};
    if(!Object.keys(_mjCompLib).length){
      // Migration depuis l'ancien système
      const oldFeats=data.customFeats||[];
      let oldSpells=[],oldItems=[];
      try{const saved=localStorage.getItem('dnd5e_mj_pool');if(saved){const p=JSON.parse(saved);oldSpells=p.customSpells||[];oldItems=p.customItems||[];}}catch(e){}
      if(oldFeats.length||oldSpells.length||oldItems.length){
        const id=_genCompId();
        _mjCompLib[id]={name:'Mon compendium',createdAt:new Date().toISOString(),feats:oldFeats,spells:oldSpells,items:oldItems};
        await fbDb.collection('users').doc(currentUser.uid).update({compendiumLib:_mjCompLib}).catch(()=>{});
      }
    }
  }catch(e){_mjCompLib={};}
  _refreshMjPool();
  if(typeof COMP!=='undefined')COMP.syncPersoPacks(_mjCompLib); // expose les perso comme paquets dans la biblio unifiée
}

function _refreshMjPool(){
  mjPool.customSpells=Object.values(_mjCompLib).flatMap(c=>c.spells||[]);
  mjPool.customItems=Object.values(_mjCompLib).flatMap(c=>c.items||[]);
}

function _mjAllFeats(){
  return Object.values(_mjCompLib).flatMap(c=>c.feats||[]);
}

function _ensureActiveComp(){
  const ids=Object.keys(_mjCompLib);
  if(_mjActiveCompId&&_mjCompLib[_mjActiveCompId])return;
  if(ids.length>0){_mjActiveCompId=ids[0];}
  else{const id=_genCompId();_mjCompLib[id]={name:'Mon compendium',createdAt:new Date().toISOString(),feats:[],spells:[],items:[]};_mjActiveCompId=id;}
}

async function saveMJCompLib(){
  if(typeof COMP!=='undefined')COMP.syncPersoPacks(_mjCompLib); // garde la biblio unifiée à jour après édition
  if(!currentUser)return;
  try{await fbDb.collection('users').doc(currentUser.uid).update({compendiumLib:_mjCompLib});}
  catch(e){showToast('❌ Erreur sauvegarde compendiums.');}
}

async function loadMJCustomFeats(){return loadMJCompLib();}

async function saveMJCustomFeats(){
  if(!currentUser)return;
  _ensureActiveComp();
  _mjCompLib[_mjActiveCompId].feats=_mjCustomFeats;
  await saveMJCompLib();
}
function _mjRenderCompendiumList(){
  if(!_mjCustomFeats.length)return'<div style="font-size:13px;color:var(--text3);font-style:italic;text-align:center;padding:20px">Aucune entrée. Créez votre première capacité ci-dessus.</div>';
  return _mjCustomFeats.map((f,i)=>`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:2px;padding:10px;margin-bottom:6px">
    <div style="display:flex;align-items:flex-start;gap:8px">
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:600;color:var(--text)">${esc(f.name)}</div>
        ${f.category?`<div style="font-size:13px;color:var(--cp);margin-bottom:3px">${esc(f.category)}</div>`:''}
        ${f.description?`<div style="font-size:13px;color:var(--text2);line-height:1.4">${esc(f.description)}</div>`:''}
      </div>
      <button class="btn bsm" style="color:var(--danger);padding:2px 7px;flex-shrink:0" onclick="mjDeleteCustomFeat(${i})">🗑</button>
    </div>
  </div>`).join('');
}
function mjOpenCompendium(){
  const ids=Object.keys(_mjCompLib);
  if(ids.length===1){mjOpenCompendiumEditor(ids[0]);return;}
  // Bibliothèque : liste des compendiums
  const listHtml=ids.length?ids.map(id=>{
    const c=_mjCompLib[id];
    const total=(c.feats||[]).length+(c.spells||[]).length+(c.items||[]).length;
    return`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:2px;padding:10px;margin-bottom:6px;display:flex;align-items:center;gap:8px">
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:600;color:var(--text)">${esc(c.name)}</div>
        <div style="font-size:13px;color:var(--text3)">${(c.feats||[]).length} capacité(s) · ${(c.spells||[]).length} sort(s) · ${(c.items||[]).length} objet(s)</div>
      </div>
      <button class="btn bsm bprimary" onclick="mjOpenCompendiumEditor('${id}')">✏️ Éditer</button>
      <button class="btn bsm" onclick="exportMJCompendium('${id}')">📤</button>
    </div>`;}).join('')
    :`<div style="font-size:13px;color:var(--text3);font-style:italic;text-align:center;padding:20px">Aucun compendium. Créez-en un ci-dessous.</div>`;
  openWideModal(`<div class="pt">📚 Bibliothèque de compendiums</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:14px">Choisissez un compendium à éditer, ou créez-en un nouveau.</div>
    <div style="max-height:50vh;overflow-y:auto;margin-bottom:12px">${listHtml}</div>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
      <div style="display:flex;gap:6px">
        <button class="btn bsm bprimary" onclick="mjCreateNewComp()">+ Nouveau</button>
        <button class="btn bsm" onclick="importMJCompendium()">📥 Importer</button>
      </div>
    </div>`);
}

function mjOpenCompendiumEditor(id){
  if(!_mjCompLib[id])return;
  _mjActiveCompId=id;
  const c=_mjCompLib[id];
  _mjCustomFeats=c.feats||[];
  // Éditeur complet (sorts/objets/monstres/capacités) si dispo ; sinon ancien éditeur de capacités.
  if(typeof openPackEditor==='function'){ openPackEditor(id); return; }
  const hasLib=Object.keys(_mjCompLib).length>1;
  openWideModal(`<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
    ${hasLib?`<button class="btn bsm" onclick="mjOpenCompendium()" style="flex-shrink:0">← Retour</button>`:''}
    <div class="pt" style="margin:0;flex:1">📚 ${esc(c.name)}</div>
  </div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:12px">Capacités, dons et traits maison disponibles pour vos tables.</div>
    <div style="background:var(--surface2);border-radius:2px;padding:12px;margin-bottom:14px">
      <div style="font-size:12px;color:var(--cp);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px">+ Nouvelle capacité</div>
      <input id="mj_comp_name" class="fi" placeholder="Nom *" style="margin-bottom:6px;font-size:13px;font-weight:600">
      <input id="mj_comp_cat" class="fi" placeholder="Catégorie (ex : Racial, Magie, Roublard...)" style="margin-bottom:6px;font-size:13px">
      <textarea id="mj_comp_desc" class="fi" rows="3" placeholder="Description de la capacité..." style="font-size:13px;resize:vertical;margin-bottom:8px"></textarea>
      <button class="btn bsm bprimary" onclick="mjCreateCustomFeat()">💾 Ajouter</button>
    </div>
    <div style="font-size:12px;color:var(--cp);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px">${_mjCustomFeats.length} capacité(s)</div>
    <div id="mj_comp_list" style="max-height:38vh;overflow-y:auto">${_mjRenderCompendiumList()}</div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;gap:8px;flex-wrap:wrap">
      <div style="display:flex;gap:6px">
        <button class="btn bsm" onclick="exportMJCompendium('${id}')">📤 Exporter</button>
        <button class="btn bsm" style="color:var(--danger);border-color:rgba(229,57,53,.3)" onclick="mjDeleteComp('${id}')">🗑 Supprimer</button>
      </div>
    </div>`);
}

function mjCreateNewComp(){
  openModal(`<div class="pt">📚 Nouveau compendium</div>
    <div class="fl mb6">Nom du compendium</div>
    <input class="fi" id="newCompName" placeholder="ex : Magie du Nord, Campagne Ravenloft..." style="margin-bottom:16px">
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="mjOpenCompendium()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="mjConfirmCreateComp()">✓ Créer</button>
    </div>`);
  setTimeout(()=>{const i=document.getElementById('newCompName');if(i)i.focus();},50);
}

async function mjConfirmCreateComp(){
  const name=(document.getElementById('newCompName')?.value||'').trim();
  if(!name){showToast('❌ Donnez un nom au compendium.');return;}
  const id=_genCompId();
  _mjCompLib[id]={name,createdAt:new Date().toISOString(),feats:[],spells:[],items:[]};
  await saveMJCompLib();
  showToast('✅ Compendium "'+name+'" créé !');
  mjOpenCompendiumEditor(id);
}

async function mjDeleteComp(id){
  if(!_mjCompLib[id])return;
  const name=_mjCompLib[id].name;
  if(!confirm('Supprimer le compendium "'+name+'" ? Cette action est irréversible.'))return;
  delete _mjCompLib[id];
  if(_mjActiveCompId===id)_mjActiveCompId=null;
  await saveMJCompLib();
  _refreshMjPool();
  showToast('🗑 Compendium supprimé.');
  mjOpenCompendium();
}
async function mjCreateCustomFeat(){
  const name=(document.getElementById('mj_comp_name')?.value||'').trim();
  if(!name){showToast('❌ Le nom est obligatoire.');return;}
  const category=(document.getElementById('mj_comp_cat')?.value||'').trim();
  const description=(document.getElementById('mj_comp_desc')?.value||'').trim();
  _mjCustomFeats.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),name,category,description});
  await saveMJCustomFeats();
  showToast('✅ "'+name+'" ajouté au compendium !');
  if(document.getElementById('mj_comp_name'))document.getElementById('mj_comp_name').value='';
  if(document.getElementById('mj_comp_cat'))document.getElementById('mj_comp_cat').value='';
  if(document.getElementById('mj_comp_desc'))document.getElementById('mj_comp_desc').value='';
  const list=document.getElementById('mj_comp_list');
  if(list)list.innerHTML=_mjRenderCompendiumList();
}
async function mjDeleteCustomFeat(i){
  _mjCustomFeats.splice(i,1);
  await saveMJCustomFeats();
  const list=document.getElementById('mj_comp_list');
  if(list)list.innerHTML=_mjRenderCompendiumList();
}

function exportMJCompendium(id){
  const compId=id||_mjActiveCompId;
  const c=compId?_mjCompLib[compId]:null;
  if(!c){showToast('⚠️ Sélectionnez un compendium à exporter.');return;}
  const feats=c.feats||[];const spells=c.spells||[];const items=c.items||[];
  const total=feats.length+spells.length+items.length;
  if(!total){showToast('⚠️ Compendium vide, rien à exporter.');return;}
  window._exportCompId=compId;
  openModal(`<div class="pt">📤 Exporter « ${esc(c.name)} »</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:12px">${feats.length} capacité(s) · ${spells.length} sort(s) · ${items.length} objet(s)</div>
    <div class="fl mb6">Nom du fichier</div>
    <input class="fi" id="compExportName" style="margin-bottom:16px" value="${esc(c.name)}">
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="_doExportMJCompendium()">📤 Télécharger</button>
    </div>`);
  setTimeout(()=>{const i=document.getElementById('compExportName');if(i){i.focus();i.select();}},50);
}

function _doExportMJCompendium(){
  const compId=window._exportCompId||_mjActiveCompId;
  const c=compId?_mjCompLib[compId]:null;
  if(!c){closeModal();return;}
  const name=(document.getElementById('compExportName')?.value||c.name).trim();
  const data={version:2,tool:'La Boîte à Outils',name,exportDate:new Date().toISOString(),
    customFeats:c.feats||[],customSpells:c.spells||[],customItems:c.items||[]};
  const total=data.customFeats.length+data.customSpells.length+data.customItems.length;
  const filename=name.toLowerCase().replace(/[^a-z0-9À-ÿ]+/gi,'_')+'_compendium.json';
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=filename;a.click();
  URL.revokeObjectURL(url);
  closeModal();
  showToast(`📤 "${name}" exporté (${total} entrée${total>1?'s':''}) !`);
}

function _parseCompendiumJSON(raw,filename){
  let feats=[],spells=[],items=[],monsters=[];
  let name='Compendium importé';
  // Format 1 : export La Boîte à Outils (v1 ou v2)
  if(raw.customFeats||raw.customSpells||raw.customItems){
    feats=raw.customFeats||[];spells=raw.customSpells||[];items=raw.customItems||[];
    name=raw.name||name;
  }
  // Format 2 : clés feats/spells/items/monsters directes
  else if(raw.feats||raw.spells||raw.items||raw.monsters){
    const mapStr=arr=>arr.map(x=>typeof x==='string'?{name:x,desc:''}:x);
    feats=(raw.feats||[]).map(f=>typeof f==='string'?{id:Date.now().toString(36),name:f,category:'',description:''}:{...f,id:f.id||(Date.now().toString(36)+Math.random().toString(36).slice(2,5))});
    spells=mapStr(raw.spells||[]);items=mapStr(raw.items||[]);
    monsters=(raw.monsters||[]);
    name=raw.name||name;
  }
  // Format 3 : tableau plat — détection par champs
  else if(Array.isArray(raw)){
    name=filename.replace(/\.json$/i,'').replace(/[_-]/g,' ')||name;
    raw.forEach(obj=>{
      if(!obj||!obj.name)return;
      const hasSpellFields=obj.level!==undefined||obj.school||obj.casting_time||obj.components||obj.spell_level;
      const hasItemFields=obj.damage||obj.damage_dice||obj.ac||obj.weight||obj.cost||obj.price;
      const hasMonsterFields=obj.hp!==undefined||obj.challenge_rating||obj.armor_class||obj.hit_dice;
      if(hasMonsterFields){
        monsters.push({name:obj.name,hp:parseInt(obj.hp)||parseInt(obj.average_hp)||10,ac:parseInt(obj.ac)||parseInt(obj.armor_class)||13,speed:obj.speed||'9m',attacks:obj.actions?JSON.stringify(obj.actions).slice(0,200):'',notes:obj.desc||obj.description||''});
      }else if(hasSpellFields){
        spells.push({name:obj.name,desc:obj.desc||obj.description||''});
      }else if(hasItemFields){
        items.push({name:obj.name,desc:obj.desc||obj.description||obj.damage||''});
      }else{
        feats.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),name:obj.name,category:obj.category||obj.type||'',description:obj.description||obj.desc||''});
      }
    });
  }
  return{name,feats,spells,items,monsters};
}

function importMJCompendium(){
  const input=document.createElement('input');
  input.type='file';input.accept='.json,application/json';
  input.onchange=async e=>{
    const file=e.target.files[0];if(!file)return;
    try{
      const text=await file.text();
      const raw=JSON.parse(text);
      const data=_parseCompendiumJSON(raw,file.name);
      const {feats,spells,items,monsters}=data;
      const total=feats.length+spells.length+items.length+monsters.length;
      if(!total){showToast('❌ Aucun élément reconnu dans ce fichier.');return;}
      const importedName=data.name;
      window._pendingCompendiumImport={name:importedName,feats,spells,items,monsters};
      const existingIds=Object.keys(_mjCompLib);
      const mergeOpts=existingIds.map(id=>`<option value="${id}">${esc(_mjCompLib[id].name)}</option>`).join('');
      openModal(`<div class="pt">📥 Importer un compendium</div>
        <div style="background:var(--surface2);border-radius:2px;padding:12px;margin-bottom:14px;font-size:13px;color:var(--text2)">
          <div style="font-size:14px;font-weight:600;color:var(--cp);margin-bottom:6px">« ${esc(importedName)} »</div>
          <span style="color:var(--cp)">${feats.length}</span> capacité(s) &nbsp;·&nbsp;
          <span style="color:var(--cp)">${spells.length}</span> sort(s) &nbsp;·&nbsp;
          <span style="color:var(--cp)">${items.length}</span> objet(s)
          ${monsters.length?`&nbsp;·&nbsp;<span style="color:var(--cp)">${monsters.length}</span> monstre(s)/PNJ`:''}
        </div>
        ${feats.length||spells.length||items.length?`<div style="font-size:13px;font-weight:600;color:var(--text2);margin-bottom:6px">Capacités / Sorts / Objets → compendium :</div>
        <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px">
          <button class="btn bac" onclick="confirmImportMJCompendium('new')">✨ Nouveau compendium</button>
          ${existingIds.length?`<div style="display:flex;gap:6px;align-items:center">
            <select class="fi" id="mergeTargetId" style="flex:1">${mergeOpts}</select>
            <button class="btn" onclick="confirmImportMJCompendium('merge')">➕ Fusionner dans</button>
          </div>`:''}
        </div>`:''}
        ${monsters.length?`<button class="btn bac" style="width:100%;margin-bottom:8px" onclick="confirmImportMJMonsters()">👾 Importer ${monsters.length} monstre(s) dans Mes PNJ</button>`:''}
        <div style="text-align:right"><button class="btn bsm" onclick="closeModal()">Annuler</button></div>`);
    }catch(err){showToast('❌ Fichier JSON invalide.');}
  };
  input.click();
}

async function confirmImportMJMonsters(){
  const data=window._pendingCompendiumImport;
  if(!data||!data.monsters||!data.monsters.length){closeModal();return;}
  _mjNPCs=[..._mjNPCs,...data.monsters];
  await saveMJData();
  showToast(`✅ ${data.monsters.length} monstre(s) importé(s) dans Mes PNJ !`);
  window._pendingCompendiumImport=null;
  closeModal();
}

async function confirmImportMJCompendium(mode){
  const data=window._pendingCompendiumImport;
  if(!data){closeModal();return;}
  if(mode==='new'){
    const id=_genCompId();
    _mjCompLib[id]={name:data.name,createdAt:new Date().toISOString(),feats:data.feats||[],spells:data.spells||[],items:data.items||[]};
    _mjActiveCompId=id;
  }else{
    const targetId=document.getElementById('mergeTargetId')?.value||Object.keys(_mjCompLib)[0];
    if(!targetId||!_mjCompLib[targetId]){showToast('❌ Compendium cible introuvable.');return;}
    const c=_mjCompLib[targetId];
    c.feats=[...c.feats,...(data.feats||[])];
    c.spells=[...c.spells,...(data.spells||[])];
    c.items=[...c.items,...(data.items||[])];
    _mjActiveCompId=targetId;
  }
  await saveMJCompLib();
  _refreshMjPool();
  window._pendingCompendiumImport=null;
  const total=data.feats.length+data.spells.length+data.items.length;
  showToast(`✅ ${total} entrée${total>1?'s':''} importée${total>1?'s':''} !`);
  closeModal();
  mjOpenCompendiumEditor(_mjActiveCompId);
}
function _mjSnapshotEditData(){
  if(!_mjEditData)return;
  const p=_mjEditData.p;
  const getNum=id=>parseInt(document.getElementById(id)?.value)||0;
  const getVal=id=>document.getElementById(id)?.value||'';
  if(document.getElementById('mje_charname'))p.charName=getVal('mje_charname')||p.charName;
  if(document.getElementById('mje_race'))p.race=getVal('mje_race');
  if(document.getElementById('mje_druid_terrain')){const t=getVal('mje_druid_terrain');if(t)p.druidTerrain=t;}
  if(document.getElementById('mje_background'))p.background=getVal('mje_background');
  if(document.getElementById('mje_cls_name_0'))p.classes=_mjReadClassFromDOM();
  if(document.getElementById('mje_hp'))p.hp=getNum('mje_hp');
  if(document.getElementById('mje_hpMax'))p.hpMax=getNum('mje_hpMax')||1;
  if(document.getElementById('mje_ac'))p.ac=getNum('mje_ac')||10;
  if(document.getElementById('mje_speed'))p.speed=getNum('mje_speed')||9;
  if(document.getElementById('mje_ab0'))p.abilities=[0,1,2,3,4,5].map(i=>parseInt(document.getElementById('mje_ab'+i)?.value)||10);
  if(document.getElementById('mje_feat_name_0')||(_mjEditData.p.features&&_mjEditData.p.features.length===0))p.features=_mjReadFeatsFromDOM();
  if(document.getElementById('mje_inv_name_0')||(_mjEditData.p.inventory&&_mjEditData.p.inventory.length===0))p.inventory=_mjReadInvFromDOM();
  p.currency=p.currency||{};
  ['pp','po','pe','pa','pc'].forEach(coin=>{if(document.getElementById('mje_cur_'+coin))p.currency[coin]=parseInt(document.getElementById('mje_cur_'+coin).value)||0;});
  if(document.getElementById('mje_weaponprofs')){const v=getVal('mje_weaponprofs');p.weaponProfs=v?v.split(',').map(s=>s.trim()).filter(Boolean):[];}
  if(document.getElementById('mje_armorprofs')){const v=getVal('mje_armorprofs');p.armorProfs=v?v.split(',').map(s=>s.trim()).filter(Boolean):[];}
  ['languages','proficiencies','traits','ideals','bonds','flaws','backstory','secrets'].forEach(k=>{if(document.getElementById('mje_'+k))p[k]=getVal('mje_'+k);});
  const xpAdd=parseInt(document.getElementById('mje_xp_add')?.value)||0;if(xpAdd>0){p.xp=(p.xp||0)+xpAdd;const el=document.getElementById('mje_xp_add');if(el)el.value='';}
}
function mjEditAddQuickXP(amount){
  if(!_mjEditData||amount<=0)return;
  _mjSnapshotEditData();
  _mjEditData.p.xp=(_mjEditData.p.xp||0)+amount;
  const el=document.getElementById('mje_xp_add');if(el)el.value='';
  mjEditPlayerSheet(_mjEditData.idx);
}
function mjOpenFeatPicker(playerIdx){
  _mjSnapshotEditData();
  const allFeats=_mjAllFeats();
  if(!allFeats.length){showToast('Compendium vide — créez des capacités d\'abord via le bouton 📚 Compendium.');return;}
  openWideModal(`<div class="pt">📚 Importer depuis le compendium</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:10px">Cliquez sur une capacité pour l'ajouter à la fiche du personnage.</div>
    <div style="max-height:60vh;overflow-y:auto;margin-bottom:10px">
      ${allFeats.map((f,i)=>`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:2px;padding:10px;margin-bottom:6px;cursor:pointer;transition:border-color .15s" onmouseover="this.style.borderColor='var(--cp)'" onmouseout="this.style.borderColor='var(--border)'" onclick="mjApplyCustomFeat(${i},${playerIdx})">
        <div style="display:flex;align-items:center;gap:8px">
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:600">${esc(f.name)}</div>
            ${f.category?`<div style="font-size:13px;color:var(--cp)">${esc(f.category)}</div>`:''}
            ${f.description?`<div style="font-size:13px;color:var(--text2);margin-top:3px">${esc(f.description).substring(0,120)}${f.description.length>120?'…':''}</div>`:''}
          </div>
          <span style="font-size:18px;color:var(--cp)">+</span>
        </div>
      </div>`).join('')}
    </div>
    <div style="text-align:right"><button class="btn bsm" onclick="mjEditPlayerSheet(${playerIdx})">← Retour à la fiche</button></div>`);
}
function mjApplyCustomFeat(featIdx,playerIdx){
  const f=_mjAllFeats()[featIdx];if(!f||!_mjEditData)return;
  _mjEditData.p.features=_mjEditData.p.features||[];
  _mjEditData.p.features.push({name:f.name,classe:f.category||'',desc:f.description||''});
  mjEditPlayerSheet(playerIdx);
}

// ── Modale principale ──
function mjEditPlayerSheet(idx){
  const pp=_mjPlayersData[idx];if(!pp)return;
  if(!_mjEditData||_mjEditData.idx!==idx){
    _mjEditData={idx,p:JSON.parse(JSON.stringify(pp.charData||{}))};
  }
  const p=_mjEditData.p;
  const abilNames=['FOR','DEX','CON','INT','SAG','CHA'];
  const abs=p.abilities||[10,10,10,10,10,10];
  const conds=p.conditions||[];
  const inv=p.inventory||[];
  const cur=p.currency||{};
  const spells=p.spells||[];
  const classes=p.classes||[];
  const feats=p.features||[];
  const sec=t=>`<div style="font-size:12px;color:var(--cp);text-transform:uppercase;letter-spacing:.07em;border-bottom:1px solid var(--border);margin-bottom:8px;padding-bottom:3px;margin-top:4px">${t}</div>`;
  openWideModal(`<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
    <span style="font-size:17px">${pp.avatar||'⚔'}</span>
    <div style="flex:1;min-width:0">
      <div style="font-size:13px;color:var(--text3);margin-bottom:4px">${esc(pp.playerName||'')} · ✏ Modification de la fiche</div>
      <input id="mje_charname" value="${esc(p.charName||'')}" placeholder="Nom du personnage" style="width:100%;background:transparent;border:none;border-bottom:1px solid var(--border);color:var(--text);font-size:15px;font-weight:700;outline:none;padding:2px 0">
    </div>
  </div>
  <div style="max-height:65vh;overflow-y:auto;padding-right:4px">
    ${sec('Infos de base')}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px">
      <div><div style="font-size:12px;color:var(--text3);margin-bottom:3px">Race</div><input id="mje_race" value="${esc(p.race||'')}" placeholder="Race" class="fi" style="font-size:13px"></div>
      <div><div style="font-size:12px;color:var(--text3);margin-bottom:3px">Historique</div><input id="mje_background" value="${esc(p.background||'')}" placeholder="Historique" class="fi" style="font-size:13px"></div>
    </div>
    ${sec('Classes & Niveaux')}
    <div id="mje_class_list" style="margin-bottom:4px">${_mjRenderClassList(classes)}</div>
    <button class="btn bsm" style="width:100%;margin-bottom:12px" onclick="mjEditAddClass()">+ Ajouter une classe</button>
    ${(p.archetype||{})['Druide']==='Cercle de la terre'?`<div style="margin-bottom:12px;padding:8px 10px;background:rgba(200,168,75,.08);border-radius:2px">
      <div style="font-size:12px;color:var(--text3);margin-bottom:4px">🗺 Terrain du Cercle de la terre</div>
      <select id="mje_druid_terrain" style="width:100%;padding:5px 8px;background:var(--surface2);border:1px solid var(--border);border-radius:2px;color:var(--text);font-size:13px">
        <option value="">-- Choisir un terrain --</option>
        ${['Arctique','Désert','Forêt','Littoral','Marais','Montagne','Outreterre','Plaine'].map(t=>`<option value="${t}"${p.druidTerrain===t?' selected':''}>${t}</option>`).join('')}
      </select>
    </div>`:''}
    ${sec('Expérience')}
    ${(()=>{const _xpLvl=classes.reduce((s,c)=>s+(c.level||0),0);const _xpCur=p.xp||0;const _xpCurT=XP_LEVELS[_xpLvl-1]||0;const _xpNextT=XP_LEVELS[_xpLvl]||XP_LEVELS[19];const _xpPct=Math.min(100,Math.round(((_xpCur-_xpCurT)/Math.max(1,_xpNextT-_xpCurT))*100));const _xpToNext=Math.max(0,_xpNextT-_xpCur);return`<div style="margin-bottom:12px"><div style="display:flex;align-items:baseline;gap:6px;margin-bottom:4px"><span style="font-size:15px;font-weight:700;color:var(--cp)">${_xpCur.toLocaleString()}</span><span style="font-size:13px;color:var(--text3)">XP actuels • Niv. ${_xpLvl}</span></div><div class="xp-bar-wrap"><div class="xp-bar-fill" style="width:${_xpPct}%"></div></div><div style="font-size:13px;color:var(--text3);margin-bottom:8px">${_xpToNext>0?`${_xpToNext.toLocaleString()} XP jusqu'au niveau ${_xpLvl+1}`:`✨ Prêt pour le niveau ${_xpLvl+1} !`}</div><div style="display:flex;gap:6px;margin-bottom:6px"><input id="mje_xp_add" type="number" min="0" placeholder="XP à ajouter..." class="fi" style="flex:1;font-size:13px"><button class="btn bsm bac" onclick="mjEditAddQuickXP(parseInt(document.getElementById('mje_xp_add').value)||0)" style="white-space:nowrap">+ Ajouter</button></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:3px">${[[25,'Gobelin tué'],[50,'Rencontre facile'],[100,'Rencontre moyenne'],[200,'Rencontre difficile'],[450,'Boss tué'],[1000,'Jalon narratif']].map(([xp,lbl])=>`<div class="xp-reward" onclick="mjEditAddQuickXP(${xp})">+${xp} XP — ${lbl}</div>`).join('')}</div></div>`;})()}
    ${sec('Stats de combat')}
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:12px">
      ${[['PV','hp',p.hp||0],['PV max','hpMax',p.hpMax||1],['CA','ac',p.ac||10],['Vit. (m)','speed',p.speed||9]].map(([label,id,val])=>`<div style="background:var(--surface2);border-radius:2px;padding:6px;text-align:center"><div style="font-size:13px;color:var(--text3);text-transform:uppercase;margin-bottom:3px">${label}</div><input id="mje_${id}" type="number" value="${val}" style="width:100%;text-align:center;background:transparent;border:none;color:var(--text);font-size:15px;font-weight:700;outline:none"></div>`).join('')}
    </div>
    ${sec('Caractéristiques')}
    <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:4px;margin-bottom:12px">
      ${abilNames.map((ab,i)=>`<div style="background:var(--surface2);border-radius:2px;padding:5px;text-align:center"><div style="font-size:13px;color:var(--text3)">${ab}</div><input id="mje_ab${i}" type="number" min="1" max="30" value="${abs[i]}" style="width:100%;text-align:center;background:transparent;border:none;color:var(--text);font-size:14px;font-weight:700;outline:none"></div>`).join('')}
    </div>
    ${sec('Compétences')}
    <div style="font-size:12px;color:var(--text3);margin-bottom:6px">Cliquer pour changer : ○ Aucune · ● Maîtrise · ◆ Expertise</div>
    <div id="mje_skill_grid" style="display:grid;grid-template-columns:1fr 1fr;gap:3px;margin-bottom:12px">${_mjRenderSkillGrid()}</div>
    ${sec('Conditions')}
    <div id="mje_cond_chips" style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">${conds.length?conds.map((c,i)=>`<span class="status-badge malus" style="cursor:pointer" onclick="mjEditRemoveCond(${i})">⚠ ${esc(c)} ✕</span>`).join(''):'<span style="font-size:13px;color:var(--text3);font-style:italic">Aucune condition.</span>'}</div>
    <div style="display:flex;gap:6px;margin-bottom:12px"><input id="mje_cond_input" class="fi" placeholder="Nom de la condition..." style="flex:1;font-size:13px;padding:5px 8px"><button class="btn bsm" onclick="mjEditAddCond()">+ Ajouter</button></div>
    ${sec('Capacités & Dons')}
    <div id="mje_feat_list" style="margin-bottom:4px">${_mjRenderFeatList(feats)}</div>
    <div style="display:flex;gap:6px;margin-bottom:12px">
      <button class="btn bsm" style="flex:1" onclick="mjEditAddFeat()">+ Nouvelle</button>
      <button class="btn bsm" style="flex:1" onclick="mjOpenFeatPicker(${idx})">📚 Depuis le compendium</button>
    </div>
    ${sec('Inventaire')}
    <div id="mje_inv_list" style="margin-bottom:4px">${_mjRenderInvList(inv)}</div>
    <button class="btn bsm" style="width:100%;margin-bottom:12px" onclick="mjEditAddInv()">+ Ajouter un objet</button>
    ${sec('Monnaie')}
    <div style="display:flex;gap:6px;margin-bottom:12px">
      ${['pp','po','pe','pa','pc'].map(coin=>`<div style="flex:1;text-align:center"><div style="font-size:12px;color:var(--text3);margin-bottom:2px">${coin.toUpperCase()}</div><input id="mje_cur_${coin}" type="number" min="0" value="${cur[coin]||0}" style="width:100%;text-align:center;background:var(--surface2);border:1px solid var(--border);border-radius:2px;color:var(--text);font-size:13px;padding:4px;outline:none"></div>`).join('')}
    </div>
    ${sec('Sorts')}
    <div id="mje_spell_list" style="margin-bottom:6px">${_mjRenderSpellList(spells)}</div>
    <div style="display:flex;gap:4px;margin-bottom:12px">
      <input id="mje_spell_name" class="fi" placeholder="Nom du sort" style="flex:3;font-size:13px;padding:5px 8px">
      <input id="mje_spell_level" type="number" min="0" max="9" placeholder="Niv" style="width:52px;background:var(--surface2);border:1px solid var(--border);border-radius:2px;color:var(--text);padding:5px;font-size:13px;text-align:center;outline:none">
      <button class="btn bsm" onclick="mjEditAddSpell()">+ Sort</button>
    </div>
    ${sec('Langues & Maîtrises')}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px">
      <div><div style="font-size:12px;color:var(--text3);margin-bottom:3px">Langues</div><input id="mje_languages" value="${esc(p.languages||'')}" class="fi" style="font-size:13px" placeholder="Commun, Elfique..."></div>
      <div><div style="font-size:12px;color:var(--text3);margin-bottom:3px">Maîtrises diverses</div><input id="mje_proficiencies" value="${esc(p.proficiencies||'')}" class="fi" style="font-size:13px" placeholder="Outils, instruments..."></div>
      <div><div style="font-size:12px;color:var(--text3);margin-bottom:3px">Maîtrises d'armes</div><input id="mje_weaponprofs" value="${esc((p.weaponProfs||[]).join(', '))}" class="fi" style="font-size:13px" placeholder="Armes courantes, épée..."></div>
      <div><div style="font-size:12px;color:var(--text3);margin-bottom:3px">Maîtrises d'armures</div><input id="mje_armorprofs" value="${esc((p.armorProfs||[]).join(', '))}" class="fi" style="font-size:13px" placeholder="Légères, intermédiaires..."></div>
    </div>
    ${sec('Personnalité & Histoire')}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">
      <div><div style="font-size:12px;color:var(--text3);margin-bottom:3px">Traits</div><textarea id="mje_traits" class="fi" rows="2" style="font-size:13px;resize:vertical">${esc(p.traits||'')}</textarea></div>
      <div><div style="font-size:12px;color:var(--text3);margin-bottom:3px">Idéaux</div><textarea id="mje_ideals" class="fi" rows="2" style="font-size:13px;resize:vertical">${esc(p.ideals||'')}</textarea></div>
      <div><div style="font-size:12px;color:var(--text3);margin-bottom:3px">Liens</div><textarea id="mje_bonds" class="fi" rows="2" style="font-size:13px;resize:vertical">${esc(p.bonds||'')}</textarea></div>
      <div><div style="font-size:12px;color:var(--text3);margin-bottom:3px">Défauts</div><textarea id="mje_flaws" class="fi" rows="2" style="font-size:13px;resize:vertical">${esc(p.flaws||'')}</textarea></div>
    </div>
    <div style="margin-bottom:6px"><div style="font-size:12px;color:var(--text3);margin-bottom:3px">Histoire du personnage</div><textarea id="mje_backstory" class="fi" rows="3" style="font-size:13px;resize:vertical">${esc(p.backstory||'')}</textarea></div>
    <div style="margin-bottom:10px"><div style="font-size:12px;color:var(--cp);margin-bottom:3px">🔐 Secrets MJ</div><textarea id="mje_secrets" class="fi" rows="2" style="font-size:13px;resize:vertical;border-color:rgba(200,168,75,.35)">${esc(p.secrets||'')}</textarea></div>
  </div>
  <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:10px">
    <button class="btn bsm" onclick="closeModal()">Annuler</button>
    <button class="btn bsm bprimary" onclick="mjSavePlayerSheet(${idx})">💾 Sauvegarder</button>
  </div>`);
}

async function mjSavePlayerSheet(idx){
  if(!_mjEditData)return;
  const pp=_mjPlayersData[idx];if(!pp)return;
  _mjSnapshotEditData();
  const p=_mjEditData.p;
  try{
    await fbDb.collection('characters').doc(pp.docId).update({
      characterData:p,
      updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    pp.charData=p;
    _mjEditData=null;
    closeModal();
    showToast('✅ Fiche de '+esc(pp.playerName||'joueur')+' mise à jour !');
    renderMJContent();
  }catch(e){showToast('❌ Une erreur est survenue, réessaie.');}
}

function mjWhisperPlayer(idx){
  if(!currentTableId){showToast('❌ Rejoignez une campagne pour chuchoter.');return;}
  _whisperTarget=idx;
  const players=typeof _mjPlayersData!=='undefined'?_mjPlayersData:[];
  const targetUid=players[idx]?.uid||'';
  openWideModal(`<div class="pt" style="margin-bottom:8px">🤫 Chuchoter à un joueur</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
      ${players.map((pl,i)=>`<button class="btn bsm${idx===i?' bprimary':''}" id="mjwrecip_${i}" style="padding:5px 10px" onclick="_mjSelectWhisperPlayer(${i})">${esc(pl.playerName||'Joueur')}${(pl.charData||{}).charName?` <span style="font-size:12px;opacity:.7">(${esc((pl.charData||{}).charName)})</span>`:''}</button>`).join('')}
    </div>
    <div id="mjWhisperHistory" style="min-height:80px;max-height:180px;overflow-y:auto;background:var(--surface2);border:1px solid var(--border);border-radius:2px;padding:8px;margin-bottom:8px">${typeof _whisperConvHtml==='function'?_whisperConvHtml(targetUid):'<div style="font-size:13px;color:var(--text3);font-style:italic;text-align:center;padding:8px">Aucun message échangé.</div>'}</div>
    <textarea id="whisperMsg" placeholder="Message secret..." style="width:100%;box-sizing:border-box;min-height:64px;padding:8px;background:var(--surface2);border:1px solid var(--border);border-radius:2px;color:var(--text);font-size:13px;resize:vertical;margin-bottom:8px"></textarea>
    <div style="display:flex;gap:8px">
      <button class="btn bac" style="flex:1" onclick="_sendMJWhisperAndRefresh()">🤫 Envoyer</button>
    </div>`);
  setTimeout(()=>{const h=document.getElementById('mjWhisperHistory');if(h)h.scrollTop=h.scrollHeight;},50);
}
function _mjSelectWhisperPlayer(idx){
  _whisperTarget=idx;
  document.querySelectorAll('[id^="mjwrecip_"]').forEach((el,j)=>{el.classList.toggle('bprimary',j===idx);});
  const players=typeof _mjPlayersData!=='undefined'?_mjPlayersData:[];
  const h=document.getElementById('mjWhisperHistory');
  if(!h)return;
  h.innerHTML=typeof _whisperConvHtml==='function'?_whisperConvHtml(players[idx]?.uid||''):'';
  h.scrollTop=h.scrollHeight;
}
function _sendMJWhisperAndRefresh(){
  const msg=document.getElementById('whisperMsg')?.value?.trim();
  if(!msg){showToast('❌ Message vide.');return;}
  const players=typeof _mjPlayersData!=='undefined'?_mjPlayersData:[];
  if(_whisperTarget<0||!players[_whisperTarget]){showToast('❌ Sélectionnez un destinataire.');return;}
  const pl=players[_whisperTarget];
  sendWhisperMsg(pl.uid,pl.playerName||'Joueur',msg);
  const ta=document.getElementById('whisperMsg');if(ta)ta.value='';
  setTimeout(()=>{
    const h=document.getElementById('mjWhisperHistory');
    if(!h)return;
    h.innerHTML=typeof _whisperConvHtml==='function'?_whisperConvHtml(pl.uid):'';
    h.scrollTop=h.scrollHeight;
  },400);
}

function mjRespecPlayer(idx){
  const pp=_mjPlayersData[idx];if(!pp)return;
  const charName=esc((pp.charData||{}).charName||'ce personnage');
  openModal(`<div class="pt" style="color:var(--warn)">↩ Réinitialiser les niveaux ?</div>
    <div style="font-size:13px;color:var(--text2);margin:10px 0 18px">Ramener <b>${charName}</b> au niveau 1 pour chaque classe ?<br><span style="font-size:13px;color:var(--text3)">Capacités, sorts et PV réinitialisés. Équipement et statistiques de base conservés.</span></div>
    <div style="display:flex;gap:10px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn" style="flex:2;color:var(--warn);border-color:rgba(255,152,0,.4);font-weight:600" onclick="mjRespecConfirm(${idx})">↩ Réinitialiser</button>
    </div>`);
}
async function mjRespecConfirm(idx){
  const pp=_mjPlayersData[idx];if(!pp)return;
  const p=JSON.parse(JSON.stringify(pp.charData||{}));
  const conScore=(p.abilities||[10,10,10,10,10,10])[2];
  const conMod=Math.floor((conScore-10)/2);
  let newHpMax=0;
  (p.classes||[]).forEach(c=>{
    const cd=SRD.classes.find(cl=>cl.name===c.name);
    const hd=cd?parseInt((cd.hd||'d8').replace(/[^0-9]/g,''))||8:8;
    c.level=1;
    newHpMax+=hd+conMod;
  });
  p.hpMax=Math.max(1,newHpMax);
  p.hp=Math.min(p.hp||p.hpMax,p.hpMax);
  const lvl1Names=new Set();
  (p.classes||[]).forEach(c=>{(getLevel1Features(c.name)||[]).forEach(f=>lvl1Names.add(f.name));});
  p.features=(p.features||[]).filter(f=>lvl1Names.has(f.name));
  p.metamagicOptions=[];
  p.pendingLevelUp=true;
  try{
    await fbDb.collection('characters').doc(pp.docId).update({characterData:p,updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
    pp.charData=p;
    closeModal();
    showToast('↩ '+esc(p.charName||'Personnage')+' réinitialisé au niveau 1');
    renderMJContent();
  }catch(e){showToast('❌ Une erreur est survenue, réessaie.');}
}
function mjQuickKickConfirm(idx){
  const pp=_mjPlayersData[idx];if(!pp)return;
  const charName=esc(pp.charData&&pp.charData.charName||'Sans nom');
  const playerName=esc(pp.playerName||'ce joueur');
  openModal(`<div class="pt" style="color:var(--danger)">⚠️ Exclure ce joueur ?</div>
    <div style="font-size:13px;color:var(--text2);margin:10px 0 18px">Retirer <b>${charName}</b> (${playerName}) de cette campagne ?<br><span style="font-size:13px;color:var(--text3)">Le personnage reste intact dans sa bibliothèque.</span></div>
    <div style="display:flex;gap:10px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn" style="flex:2;color:var(--danger);border-color:rgba(229,57,53,.4);font-weight:600" onclick="mjKickCharacter(${idx})">✓ Exclure</button>
    </div>`);
}

function mjModerationModal(idx){
  const pp=_mjPlayersData[idx];if(!pp)return;
  const charName=esc(pp.charData&&pp.charData.charName||'Sans nom');
  const playerName=esc(pp.playerName||'Joueur');
  openModal(`<div class="pt" style="color:var(--danger)">🗑 Modération</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:16px">Joueur : <b>${playerName}</b> · Personnage : <b>${charName}</b></div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <button class="btn" style="background:rgba(229,57,53,.08);border:1px solid rgba(229,57,53,.35);color:var(--danger);text-align:left;padding:12px 14px;border-radius:2px" onclick="mjKickCharacter(${idx})">
        <div style="font-weight:600;margin-bottom:3px">↩ Retirer de la campagne</div>
        <div style="font-size:13px;color:var(--text3)">Retire <b>${charName}</b> du roster MJ. Le personnage reste intact dans la bibliothèque du joueur — c'est à lui de le supprimer.</div>
      </button>
      <button class="btn" style="background:rgba(229,57,53,.15);border:1px solid rgba(229,57,53,.6);color:var(--danger);text-align:left;padding:12px 14px;border-radius:2px" onclick="mjKickFromTable(${idx})">
        <div style="font-weight:600;margin-bottom:3px">🚫 Exclure de la table</div>
        <div style="font-size:13px;color:var(--text3)">Retire <b>${playerName}</b> de la table entière et supprime tous ses personnages dans toutes les campagnes. Irréversible.</div>
      </button>
    </div>
    <div style="margin-top:14px;text-align:right"><button class="btn bsm" onclick="closeModal()">Annuler</button></div>`);
}

async function mjKickCharacter(idx){
  const pp=_mjPlayersData[idx];if(!pp)return;
  const charName=pp.charData&&pp.charData.charName||'?';
  closeModal();
  try{
    await fbDb.collection('characters').doc(pp.docId).update({ejectedFromCampaign:true});
    showToast('✅ '+(pp.playerName||'Joueur')+' retiré de la campagne. Son personnage reste dans sa bibliothèque.');
    // Le listener onSnapshot va détecter ejectedFromCampaign et mettre à jour _mjPlayersData automatiquement
  }catch(e){showToast('❌ Une erreur est survenue, réessaie.');}
}

async function mjKickFromTable(idx){
  const pp=_mjPlayersData[idx];if(!pp)return;
  const playerName=pp.playerName||'ce joueur';
  closeModal();
  try{
    const charsSnap=await fbDb.collection('characters').where('tableId','==',currentTableId).where('userId','==',pp.uid).get();
    const batch=fbDb.batch();
    charsSnap.docs.forEach(d=>batch.delete(d.ref));
    batch.update(fbDb.collection('tables').doc(currentTableId),{
      memberIds:firebase.firestore.FieldValue.arrayRemove(pp.uid),
      ['memberNames.'+pp.uid]:firebase.firestore.FieldValue.delete(),
      ['memberAvatars.'+pp.uid]:firebase.firestore.FieldValue.delete()
    });
    await batch.commit();
    showToast(`✅ ${playerName} exclu(e) de la table.`);
    // Les docs supprimés déclenchent le listener onSnapshot (type='removed') — pas besoin de loadMJPlayersData
  }catch(e){showToast('❌ Une erreur est survenue, réessaie.');}
}

// ─────────────────────────────────────────
// MAGIE SAUVAGE — TABLE & TRIGGER
// ─────────────────────────────────────────
const WILD_MAGIC_SURGE_TABLE = [
  {range:'01-02', icon:'🔁', title:'Boucle chaotique',        effect:'Lance ce dé au début de chacun de tes tours pendant 1 min (ignore ce résultat sur les relances).'},
  {range:'03-04', icon:'👁', title:'Vision mystique',          effect:'Pendant 1 min, tu vois les créatures invisibles si tu as une ligne de vue vers elles.'},
  {range:'05-06', icon:'🤖', title:'Modron invoqué',           effect:'Un modron apparaît dans un espace libre à 1,5m de toi, puis disparaît après 1 min.'},
  {range:'07-08', icon:'🔥', title:'Boule de feu sur soi',     effect:'Tu lances Boule de feu (niv.3) centrée sur toi-même.'},
  {range:'09-10', icon:'✨', title:'Missiles magiques (niv.5)', effect:'Tu lances Missiles magiques comme un sort de niveau 5.'},
  {range:'11-12', icon:'📏', title:'Changement de taille',     effect:'Lance 1d10 : si impair, tu rapetisses du résultat en pouces ; si pair, tu grandis.'},
  {range:'13-14', icon:'😵', title:'Confusion',                effect:'Tu lances Confusion centré sur toi-même.'},
  {range:'15-16', icon:'💚', title:'Régénération',             effect:'Pendant 1 min, tu récupères 5 PV au début de chacun de tes tours.'},
  {range:'17-18', icon:'🐦', title:'Barbe de plumes',          effect:'Tu fais pousser une longue barbe de plumes jusqu\'à ton prochain éternuement.'},
  {range:'19-20', icon:'🛢', title:'Sol gras',                 effect:'Tu lances Sol gras centré sur toi-même.'},
  {range:'21-22', icon:'⚡', title:'Sorts amplifiés',          effect:'Les créatures ont le désavantage aux JS contre ton prochain sort dans la minute.'},
  {range:'23-24', icon:'🔵', title:'Peau bleue',               effect:'Ta peau vire au bleu vif. Seul Délivrance des malédictions peut annuler l\'effet.'},
  {range:'25-26', icon:'👀', title:'Troisième œil',            effect:'Un œil apparaît sur ton front pendant 1 min : avantage aux tests de Perception (vue).'},
  {range:'27-28', icon:'⏩', title:'Sorts accélérés',          effect:'Pendant 1 min, tes sorts de 1 action passent en action bonus.'},
  {range:'29-30', icon:'💨', title:'Téléportation',            effect:'Tu te téléportes jusqu\'à 18m vers un espace libre que tu peux voir.'},
  {range:'31-32', icon:'🌌', title:'Plan astral',              effect:'Tu es transporté dans le Plan Astral jusqu\'à la fin de ton prochain tour.'},
  {range:'33-34', icon:'💥', title:'Dégâts maximisés',         effect:'Le prochain sort infligeant des dégâts est automatiquement maximisé (dans la minute).'},
  {range:'35-36', icon:'⏳', title:'Changement d\'âge',        effect:'Lance 1d10 : si impair, tu rajeunit d\'autant d\'années ; si pair, tu vieillit.'},
  {range:'37-38', icon:'🦋', title:'Flumphs',                  effect:'1d6 flumphs apparaissent dans un rayon de 18m, effrayés de toi. Disparaissent après 1 min.'},
  {range:'39-40', icon:'💖', title:'Soin spontané',            effect:'Tu récupères 2d10 PV.'},
  {range:'41-42', icon:'🌿', title:'Plante en pot',            effect:'Tu deviens une plante en pot jusqu\'au début de ton prochain tour (incapable d\'agir, vulnérable à tout).'},
  {range:'43-44', icon:'🏃', title:'Téléportation bonus',      effect:'Pendant 1 min, tu peux te téléporter de 6m en action bonus à chaque tour.'},
  {range:'45-46', icon:'🎈', title:'Lévitation',               effect:'Tu lances Lévitation sur toi-même.'},
  {range:'47-48', icon:'🦄', title:'Licorne invoquée',         effect:'Une licorne apparaît dans un espace libre à 1,5m de toi et disparaît après 1 min.'},
  {range:'49-50', icon:'💬', title:'Bulles roses',             effect:'Tu ne peux pas parler pendant 1 min. Tes tentatives produisent des bulles roses.'},
  {range:'51-52', icon:'🛡', title:'Bouclier spectral',        effect:'Pendant 1 min, +2 CA et immunité aux Missiles magiques.'},
  {range:'53-54', icon:'🍺', title:'Sobriété totale',          effect:'Tu deviens immunisé à l\'ivresse alcoolique pendant 5d6 jours.'},
  {range:'55-56', icon:'💈', title:'Calvitie temporaire',      effect:'Tes cheveux tombent mais repoussent dans les 24h.'},
  {range:'57-58', icon:'🔥', title:'Toucher enflammé',         effect:'Pendant 1 min, tout objet inflammable que tu touches (non porté) s\'enflamme.'},
  {range:'59-60', icon:'✨', title:'Sort récupéré',            effect:'Tu récupères ton emplacement de sort le plus bas dépensé.'},
  {range:'61-62', icon:'📢', title:'Cris involontaires',       effect:'Tu dois crier tout ce que tu dis pendant 1 min.'},
  {range:'63-64', icon:'🌫', title:'Brouillard',               effect:'Tu lances Nappe de brouillard centré sur toi-même.'},
  {range:'65-66', icon:'⚡', title:'Foudre multiple',          effect:'Jusqu\'à 3 créatures de ton choix dans un rayon de 9m reçoivent 4d10 dégâts de foudre.'},
  {range:'67-68', icon:'😨', title:'Terreur soudaine',         effect:'Tu es effrayé par la créature la plus proche jusqu\'à la fin de ton prochain tour.'},
  {range:'69-70', icon:'👻', title:'Invisibilité de masse',    effect:'Les créatures à 9m de toi deviennent invisibles pendant 1 min (fin si elles attaquent ou lancent un sort).'},
  {range:'71-72', icon:'🔰', title:'Résistance totale',        effect:'Tu gagnes la résistance à tous les dégâts pendant 1 min.'},
  {range:'73-74', icon:'☠', title:'Poison aléatoire',         effect:'Une créature aléatoire dans un rayon de 18m est empoisonnée pendant 1d4 heures.'},
  {range:'75-76', icon:'✨', title:'Halo éblouissant',         effect:'Tu rayonnes une lumière vive (9m) pendant 1 min. Créatures à 1,5m aveuglées jusqu\'à fin de leur prochain tour.'},
  {range:'77-78', icon:'🐑', title:'Métamorphose',             effect:'Tu lances Métamorphose sur toi-même. En cas d\'échec au JS, tu deviens un mouton.'},
  {range:'79-80', icon:'🦋', title:'Papillons illusoires',     effect:'Des papillons et pétales de fleurs tourbillonnent à 3m de toi pendant 1 min.'},
  {range:'81-82', icon:'⚡', title:'Action supplémentaire',    effect:'Tu peux immédiatement effectuer une action supplémentaire.'},
  {range:'83-84', icon:'💜', title:'Drain nécrotique',         effect:'Les créatures à 9m de toi reçoivent 1d10 dégâts nécrotiques. Tu récupères autant de PV.'},
  {range:'85-86', icon:'🪞', title:'Image miroir',             effect:'Tu lances Image miroir.'},
  {range:'87-88', icon:'🦅', title:'Vol aléatoire',            effect:'Tu lances Vol sur une créature aléatoire dans un rayon de 18m.'},
  {range:'89-90', icon:'🌑', title:'Invisibilité',             effect:'Tu deviens invisible jusqu\'au début de ton prochain tour ou jusqu\'à ton prochain sort/attaque.'},
  {range:'91-92', icon:'💫', title:'Résurrection imminente',   effect:'Si tu meurs dans la minute, tu reviens à la vie comme par Réincarnation.'},
  {range:'93-94', icon:'🔼', title:'Taille augmentée',        effect:'Tu grandis d\'une catégorie de taille pendant 1 min.'},
  {range:'95-96', icon:'📌', title:'Vulnérabilité perçante',   effect:'Toi et les créatures à 9m êtes vulnérables aux dégâts perforants pendant 1 min.'},
  {range:'97-98', icon:'🎵', title:'Musique éthérée',          effect:'Tu es entouré d\'une musique éthérée douce pendant 1 min.'},
  {range:'99-00', icon:'✨', title:'Points de sorcellerie',    effect:'Tu récupères tous tes points de sorcellerie dépensés.'},
];

function mjTriggerSurtension(idx){
  const pp=_mjPlayersData[idx];if(!pp)return;
  const charName=esc((pp.charData||{}).charName||'Le personnage');
  const roll=Math.floor(Math.random()*100)+1;
  const display=roll===100?'00':String(roll).padStart(2,'0');
  let entry=WILD_MAGIC_SURGE_TABLE[Math.floor((roll-1)/2)];
  if(!entry)entry=WILD_MAGIC_SURGE_TABLE[WILD_MAGIC_SURGE_TABLE.length-1];
  openWideModal(
    '<div style="padding:4px">'
    +'<div style="font-size:15px;font-weight:700;color:var(--arcane);margin-bottom:6px">🌀 Surtension de magie sauvage</div>'
    +'<div style="font-size:13px;color:var(--text2);margin-bottom:10px">'+charName+' — d100 = <strong style="font-size:15px;color:var(--arcane)">'+display+'</strong> (entrée '+entry.range+')</div>'
    +'<div style="padding:12px;background:rgba(156,39,176,.12);border:1px solid rgba(156,39,176,.4);border-radius:2px;margin-bottom:14px">'
    +'<div style="font-size:14px;font-weight:600;margin-bottom:5px">'+entry.icon+' '+entry.title+'</div>'
    +'<div style="font-size:13px;color:var(--text2);line-height:1.5">'+entry.effect+'</div>'
    +'</div>'
    +'<div style="text-align:right"><button class="btn bsm" onclick="closeModal()">✓ Fermer</button></div>'
    +'</div>'
  );
}

// ─────────────────────────────────────────
// TAB COMBAT
// ─────────────────────────────────────────
