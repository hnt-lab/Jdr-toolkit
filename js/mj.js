
// ═══════════════════════════════════════
// INTERFACE MJ
// ═══════════════════════════════════════

function showMJScreen(){
  document.getElementById('authScreen').style.display='none';
  document.getElementById('hubScreen').style.display='none';
  document.getElementById('app').style.display='none';
  document.getElementById('mjScreen').style.display='block';
  const el=document.getElementById('mjHdrCamp');
  if(el) el.textContent=(currentTableName?currentTableName+' — ':'')+currentCampaignName;
  _mjTab='joueurs';
  renderMJTabs();
  if(!localStorage.getItem('tuto_mj_done')) setTimeout(()=>startTutorial('mj'),700);
}

function setMJTab(tab){
  _mjTab=tab;
  renderMJTabs();
  renderMJContent();
}

function renderMJTabs(){
  const tabs=[
    {id:'joueurs',label:'⚔ Joueurs'},
    {id:'combat',label:'⚡ Combat'},
    {id:'pnj',label:'🐉 PNJ / Monstres'},
    {id:'objets',label:'💰 Objets'},
    {id:'journal',label:'📓 Journal MJ'},
    {id:'regles',label:'📖 Règles'},
  ];
  const bar=document.getElementById('mjTabBar');
  if(bar) bar.innerHTML=tabs.map(t=>{
    const combatExtra=t.id==='combat'?(_mjCombatStarted?' mj-tab-combat-active':' mj-tab-combat-idle'):'';
    return`<button class="mj-tab${_mjTab===t.id?' on':''}${combatExtra}" onclick="setMJTab('${t.id}')">${t.label}</button>`;
  }).join('');
  renderMJContent();
}

function renderMJContent(){
  const el=document.getElementById('mjTabContent');
  if(!el)return;
  if(_mjTab==='joueurs') el.innerHTML=mjTabJoueurs();
  else if(_mjTab==='combat') el.innerHTML=mjTabCombat();
  else if(_mjTab==='pnj') el.innerHTML=mjTabPNJ();
  else if(_mjTab==='objets') el.innerHTML=mjTabObjets();
  else if(_mjTab==='journal') el.innerHTML=mjTabJournalScreen();
  else if(_mjTab==='regles'){el.innerHTML=mjTabRegles();mjInitRulesDnD();}
}

// ── Chargement des joueurs de la campagne ──
async function loadMJPlayersData(){
  try{
    const snap=await fbDb.collection('characters').where('campaignId','==',currentCampaignId).get();
    const players=[];
    for(const doc of snap.docs){
      if(doc.id.endsWith('_mj'))continue;
      const data=doc.data();
      if(data.ejectedFromCampaign)continue;
      const charData=data.characterData||{};
      let playerName='Joueur';let avatar='⚔';
      try{const u=await fbDb.collection('users').doc(data.userId).get();if(u.exists){playerName=u.data().displayName||'Joueur';avatar=u.data().avatar||'⚔';}}catch(e){}
      players.push({uid:data.userId,playerName,avatar,charData,docId:doc.id});
    }
    _mjPlayersData=players;
  }catch(e){showToast('❌ Erreur chargement joueurs : '+e.message);}
}

// ── Sauvegarde données MJ (journal + PNJ + objets) ──
async function saveMJData(){
  if(!currentUser||!currentCampaignId)return;
  try{
    await fbDb.collection('characters').doc(currentUser.uid+'_'+currentCampaignId+'_mj').set({
      entries:_mjJournal,npcs:_mjNPCs,objets:_mjObjets,
      userId:currentUser.uid,campaignId:currentCampaignId,
      updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    },{merge:true});
  }catch(e){showToast('❌ Erreur sauvegarde : '+e.message);}
}

// ─────────────────────────────────────────
// TAB JOUEURS
// ─────────────────────────────────────────
function mjTabJoueurs(){
  if(!_mjPlayersData.length) return`<div style="text-align:center;padding:32px;color:var(--text3);font-style:italic">
    <div style="font-size:32px;margin-bottom:12px">⚔</div>
    Aucun joueur n'a encore créé de personnage dans cette campagne.
    <div style="margin-top:12px"><button class="btn bsm bprimary" onclick="renderMJContent()">🔄 Actualiser</button></div>
  </div>`;
  return`<div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <div style="font-family:var(--F);font-size:12px;color:var(--cp)">${_mjPlayersData.length} joueur(s) <span style="font-size:10px;color:var(--text3);margin-left:4px">● Live</span></div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn bsm" onclick="renderMJContent()">🔄 Actualiser</button>
        <button class="btn bsm" onclick="mjOpenCompendium()">📚 Compendium</button>
        <button class="btn bsm" style="border-color:#7986cb;color:#7986cb" onclick="mjGroupRest('short')">☕ Repos court</button>
        <button class="btn bsm" style="border-color:#5c6bc0;color:#5c6bc0" onclick="mjGroupRest('long')">🌙 Repos long</button>
        <button class="btn bsm bprimary" onclick="mjAddAllToCombat()">⚡ Tous en combat</button>
      </div>
    </div>
    ${_mjPlayersData.map((pp,i)=>{
      const p=pp.charData||{};
      const hp=p.hp||0;const hpMax=p.hpMax||1;
      const hpPct=Math.max(0,Math.min(100,hpMax?hp/hpMax*100:0));
      const hpColor=hpPct>50?'#4caf50':hpPct>25?'#ff9800':'#e53935';
      const cls=(p.classes||[]).map(c=>c.name+' '+c.level).join(' / ')||'?';
      const lvl=(p.classes||[]).reduce((a,c)=>a+(c.level||1),0)||1;
      const conds=p.conditions||[];
      const abilNames=['FOR','DEX','CON','INT','SAG','CHA'];
      const mods=(p.abilities||[0,0,0,0,0,0]).map(v=>Math.floor((v-10)/2));
      return`<div class="mj-player-card">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          <span style="font-size:22px">${pp.avatar||'⚔'}</span>
          <div style="flex:1;min-width:0;cursor:pointer" onclick="mjQuickKickConfirm(${i})" title="Cliquer pour exclure ce joueur">
            <div style="font-size:14px;font-weight:600;color:var(--text)">${esc(p.charName||'?')}</div>
            <div style="font-size:11px;color:var(--text3)">${esc(cls)} — Niv.${lvl} — ${esc(pp.playerName||'')}</div>
          </div>
          <button class="btn bsm" onclick="mjShowPlayerDetail(${i})">📋 Fiche</button>
          <button class="btn bsm" onclick="mjEditPlayerSheet(${i})">✏ Modifier</button>
          <button class="btn bsm bprimary" onclick="mjAddPlayerToCombat(${i})">⚡ Combat</button>
          ${p.familiar?.active?`<button class="btn bsm" style="border-color:rgba(200,168,75,.5);color:var(--cp)" onclick="mjAddFamiliarToCombat(${i})" title="Ajouter le familier au combat">🦉 ${esc(p.familiar.name)}</button>`:''}
          <button class="btn bsm" style="color:#e53935;border-color:rgba(229,57,53,.3)" onclick="mjModerationModal(${i})" title="Modérer ce joueur">🗑</button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px;margin-bottom:8px">
          <div style="background:var(--surface2);border-radius:6px;padding:8px;text-align:center">
            <div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px">PV</div>
            <div style="font-size:17px;font-weight:600;color:${hpColor}">${hp}/${hpMax}</div>
            <div class="hp-bar"><div class="hp-fill" style="width:${hpPct}%;background:${hpColor}"></div></div>
          </div>
          <div style="background:var(--surface2);border-radius:6px;padding:8px;text-align:center">
            <div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px">CA</div>
            <div style="font-size:17px;font-weight:600">${p.ac||10}</div>
          </div>
          <div style="background:var(--surface2);border-radius:6px;padding:8px;text-align:center">
            <div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px">Init.</div>
            <div style="font-size:17px;font-weight:600;color:var(--cp)">${fmt(mods[1])}</div>
          </div>
          <div style="background:var(--surface2);border-radius:6px;padding:8px;text-align:center">
            <div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px">Niv.</div>
            <div style="font-size:17px;font-weight:600;color:var(--cp)">${lvl}</div>
          </div>
        </div>
        ${conds.length?`<div style="margin-bottom:6px">${conds.map(c=>`<span class="status-badge malus">⚠ ${esc(c)}</span>`).join('')}</div>`:''}
        ${p.secrets?`<div style="padding:8px;background:rgba(200,168,75,.06);border:1px solid rgba(200,168,75,.2);border-radius:6px;font-size:12px;color:var(--text2)"><span style="color:var(--cp);font-size:11px">🔐 Secret :</span> ${esc(p.secrets)}</div>`:''}
      </div>`;
    }).join('')}
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
  const hpColor=hpPct>50?'#4caf50':hpPct>25?'#ff9800':'#e53935';
  const cls=(p.classes||[]).map(c=>c.name+' niv.'+c.level).join(' / ')||'?';
  const fmt2=v=>(v>=0?'+':'')+v;
  const saveProf=new Set();
  (p.classes||[]).forEach(c=>{const cd=SRD.classes.find(cl=>cl.name===c.name);if(cd)(cd.saves||[]).forEach(s=>saveProf.add(s));});
  const skillsHtml=SKILLS.map(sk=>{
    const prof=(p.skillProf||{})[sk.name]||0;
    const bonus=mods[sk.ab]+(prof>=2?pb*2:prof>=1?pb:0);
    const icon=prof>=2?'◆':prof>=1?'●':'○';
    const col=prof>=2?'var(--cp)':prof>=1?'var(--text)':'var(--text3)';
    return`<div style="display:flex;align-items:center;gap:4px;padding:1px 0"><span style="font-size:10px;color:${col};width:12px">${icon}</span><span style="font-size:11px;flex:1">${esc(sk.name)}</span><span style="font-size:11px;font-weight:${prof?'600':'400'};color:${col}">${fmt2(bonus)}</span></div>`;
  }).join('');
  const savesHtml=abilNames.map((ab,i)=>{
    const isProf=saveProf.has(ab);const bonus=mods[i]+(isProf?pb:0);
    return`<div style="display:flex;align-items:center;gap:4px;padding:1px 0"><span style="font-size:10px;color:${isProf?'var(--cp)':'var(--text3)'};width:12px">${isProf?'●':'○'}</span><span style="font-size:11px;flex:1">${ab}</span><span style="font-size:11px;font-weight:${isProf?'600':'400'};color:${isProf?'var(--cp)':'var(--text2)'}">${fmt2(bonus)}</span></div>`;
  }).join('');
  const inv=p.inventory||[];
  const invHtml=inv.length?inv.map(it=>`<div style="display:flex;gap:6px;padding:3px 0;border-bottom:1px solid var(--border)"><span style="font-size:11px;min-width:18px;color:var(--text3)">${it.qty||1}×</span><div><span style="font-size:12px">${esc(it.name||'?')}${it.magic?'<span style="font-size:10px;color:var(--cp);margin-left:4px">✨</span>':''}</span>${it.desc?`<br><span style="font-size:10px;color:var(--text3)">${esc(it.desc)}</span>`:''}</div></div>`).join(''):'<div style="font-size:12px;color:var(--text3);font-style:italic">Inventaire vide.</div>';
  const cur=p.currency||{};
  const curHtml=['pp','po','pe','pa','pc'].filter(c=>cur[c]>0).map(c=>`${cur[c]} ${c.toUpperCase()}`).join(' · ')||'Aucune monnaie';
  const spells=p.spells||[];
  const spellsByLv={};spells.forEach(s=>{const l=s.level??0;if(!spellsByLv[l])spellsByLv[l]=[];spellsByLv[l].push(s);});
  const spellHtml=Object.keys(spellsByLv).sort((a,b)=>a-b).map(l=>`<div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin:6px 0 3px">${l==='0'?'Mineurs':'Niveau '+l}</div><div style="display:flex;flex-wrap:wrap;gap:3px">${spellsByLv[l].map(s=>`<span style="font-size:11px;background:rgba(200,168,75,.1);border:1px solid rgba(200,168,75,.2);border-radius:4px;padding:2px 6px">${esc(s.name||s)}</span>`).join('')}</div>`).join('');
  const feats=(p.features||[]).filter(f=>!isFeatExcluded(f.name));
  const featHtml=feats.length?feats.map(f=>`<div style="margin-bottom:8px"><div style="font-size:12px;font-weight:600;color:var(--cp)">${esc(f.name)}${f.classe?`<span style="font-size:10px;color:var(--text3);font-weight:400"> — ${esc(f.classe)}</span>`:''}</div>${f.desc?`<div style="font-size:11px;color:var(--text2);margin-top:2px">${esc((f.desc||'').substring(0,250))}${(f.desc||'').length>250?'…':''}</div>`:''}</div>`).join(''):'<div style="font-size:12px;color:var(--text3);font-style:italic">Aucune capacité.</div>';
  const conds=p.conditions||[];
  const persBlocks=[p.traits?`<div><div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:2px">Traits</div><div style="font-size:12px;color:var(--text2)">${esc(p.traits)}</div></div>`:'',p.ideals?`<div><div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:2px">Idéaux</div><div style="font-size:12px;color:var(--text2)">${esc(p.ideals)}</div></div>`:'',p.bonds?`<div><div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:2px">Liens</div><div style="font-size:12px;color:var(--text2)">${esc(p.bonds)}</div></div>`:'',p.flaws?`<div><div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:2px">Défauts</div><div style="font-size:12px;color:var(--text2)">${esc(p.flaws)}</div></div>`:''].filter(Boolean);
  openModal(`<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
    <span style="font-size:30px">${pp.avatar||'⚔'}</span>
    <div><div style="font-size:16px;font-weight:700">${esc(p.charName||'?')}</div>
    <div style="font-size:12px;color:var(--cp)">${esc(cls)}</div>
    <div style="font-size:11px;color:var(--text3)">${[p.race,p.background,pp.playerName].filter(Boolean).map(esc).join(' · ')}</div></div>
  </div>
  <div style="max-height:75vh;overflow-y:auto;padding-right:4px">
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin-bottom:10px">
      <div style="background:var(--surface2);border-radius:6px;padding:7px;text-align:center"><div style="font-size:9px;color:var(--text3);text-transform:uppercase">PV</div><div style="font-size:14px;font-weight:700;color:${hpColor}">${hp}/${hpMax}</div><div class="hp-bar"><div class="hp-fill" style="width:${hpPct}%;background:${hpColor}"></div></div></div>
      <div style="background:var(--surface2);border-radius:6px;padding:7px;text-align:center"><div style="font-size:9px;color:var(--text3);text-transform:uppercase">CA</div><div style="font-size:14px;font-weight:700">${p.ac||10}</div></div>
      <div style="background:var(--surface2);border-radius:6px;padding:7px;text-align:center"><div style="font-size:9px;color:var(--text3);text-transform:uppercase">Init.</div><div style="font-size:14px;font-weight:700;color:var(--cp)">${fmt2(mods[1])}</div></div>
      <div style="background:var(--surface2);border-radius:6px;padding:7px;text-align:center"><div style="font-size:9px;color:var(--text3);text-transform:uppercase">Vit.</div><div style="font-size:14px;font-weight:700">${p.speed||9}m</div></div>
      <div style="background:var(--surface2);border-radius:6px;padding:7px;text-align:center"><div style="font-size:9px;color:var(--text3);text-transform:uppercase">Maîtr.</div><div style="font-size:14px;font-weight:700;color:var(--cp)">+${pb}</div></div>
    </div>
    ${conds.length?`<div style="margin-bottom:10px">${conds.map(c=>`<span class="status-badge malus">⚠ ${esc(c)}</span>`).join(' ')}</div>`:''}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
      <div>
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:5px">Caractéristiques</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px;margin-bottom:8px">${abilNames.map((ab,i)=>`<div style="background:var(--surface2);border-radius:6px;padding:6px;text-align:center"><div style="font-size:9px;color:var(--text3)">${ab}</div><div style="font-size:14px;font-weight:700">${fmt2(mods[i])}</div><div style="font-size:10px;color:var(--text3)">${abs[i]}</div></div>`).join('')}</div>
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px">Sauvegardes</div>
        <div style="background:var(--surface2);border-radius:6px;padding:8px">${savesHtml}</div>
      </div>
      <div>
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:5px">Compétences</div>
        <div style="background:var(--surface2);border-radius:6px;padding:8px">${skillsHtml}</div>
      </div>
    </div>
    <div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:10px">
      <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px">Inventaire</div>
      ${invHtml}
      <div style="font-size:12px;color:var(--text3);margin-top:8px">💰 ${curHtml}</div>
    </div>
    ${spells.length?`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:10px"><div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px">Sorts</div>${spellHtml}</div>`:''}
    ${feats.length?`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:10px"><div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px">Capacités & Dons</div>${featHtml}</div>`:''}
    ${persBlocks.length?`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:10px"><div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px">Personnalité</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${persBlocks.join('')}</div></div>`:''}
    ${p.backstory?`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:10px"><div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px">Histoire du personnage</div><div style="font-size:12px;color:var(--text2);white-space:pre-wrap">${esc(p.backstory)}</div></div>`:''}
    ${p.secrets?`<div style="background:rgba(200,168,75,.06);border:1px solid rgba(200,168,75,.3);border-radius:8px;padding:10px;margin-bottom:10px"><div style="font-size:10px;color:var(--cp);text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px">🔐 Secrets (MJ)</div><div style="font-size:12px;color:var(--text2);white-space:pre-wrap">${esc(p.secrets)}</div></div>`:''}
    ${(p.languages||p.proficiencies||(p.weaponProfs&&p.weaponProfs.length))?`<div style="font-size:11px;color:var(--text3);line-height:2">${p.languages?`🗣 <b>Langues :</b> <span style="color:var(--text2)">${esc(p.languages)}</span><br>`:''}${p.proficiencies?`📜 <b>Maîtrises :</b> <span style="color:var(--text2)">${esc(p.proficiencies)}</span><br>`:''}${p.weaponProfs&&p.weaponProfs.length?`⚔ <b>Armes :</b> <span style="color:var(--text2)">${p.weaponProfs.join(', ')}</span><br>`:''}${p.armorProfs&&p.armorProfs.length?`🛡 <b>Armures :</b> <span style="color:var(--text2)">${p.armorProfs.join(', ')}</span>`:''}</div>`:''}
  </div>
  <div style="display:flex;justify-content:flex-end;margin-top:8px"><button class="btn" onclick="closeModal()">Fermer</button></div>`);
}

// ─── MJ : ÉDITION DE LA FICHE JOUEUR ───────────────────────────────────────
let _mjEditData=null;

function _mjRenderInvList(inv){
  if(!inv.length)return'<div style="font-size:11px;color:var(--text3);font-style:italic;padding:3px 0">Inventaire vide.</div>';
  return inv.map((it,i)=>`<div style="display:flex;gap:5px;align-items:center;margin-bottom:4px">
    <input type="number" id="mje_inv_qty_${i}" value="${it.qty||1}" min="1" style="width:42px;text-align:center;background:var(--surface2);border:1px solid var(--border);border-radius:4px;color:var(--text);font-size:12px;padding:3px;outline:none">
    <input id="mje_inv_name_${i}" value="${esc(it.name||'')}" placeholder="Nom de l'objet" style="flex:1;background:var(--surface2);border:1px solid var(--border);border-radius:4px;color:var(--text);font-size:12px;padding:3px 6px;outline:none">
    <button class="btn bsm" style="color:#e53935;padding:2px 7px;flex-shrink:0" onclick="mjEditRemoveInv(${i})">✕</button>
  </div>`).join('');
}

function _mjRenderSpellList(spells){
  if(!spells.length)return'<div style="font-size:11px;color:var(--text3);font-style:italic;padding:3px 0">Aucun sort.</div>';
  return spells.map((s,i)=>`<div style="display:flex;gap:5px;align-items:center;margin-bottom:3px;padding:3px 6px;background:var(--surface2);border-radius:4px">
    <span style="font-size:10px;color:var(--text3);min-width:18px;text-align:center">${s.level!=null?s.level:0}</span>
    <span style="flex:1;font-size:12px">${esc(s.name||s)}</span>
    <button class="btn bsm" style="color:#e53935;padding:1px 6px;font-size:11px" onclick="mjEditRemoveSpell(${i})">✕</button>
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
  if(chips)chips.innerHTML=conds.length?conds.map((c,j)=>`<span class="status-badge malus" style="cursor:pointer" onclick="mjEditRemoveCond(${j})">⚠ ${esc(c)} ✕</span>`).join(''):'<span style="font-size:11px;color:var(--text3);font-style:italic">Aucune condition.</span>';
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
  if(!classes.length)return'<div style="font-size:11px;color:var(--text3);font-style:italic;padding:3px 0">Aucune classe.</div>';
  return classes.map((c,i)=>`<div style="display:flex;gap:5px;align-items:center;margin-bottom:4px">
    <input id="mje_cls_name_${i}" value="${esc(c.name||'')}" placeholder="Nom de la classe" style="flex:2;background:var(--surface2);border:1px solid var(--border);border-radius:4px;color:var(--text);font-size:12px;padding:3px 6px;outline:none">
    <span style="font-size:11px;color:var(--text3);white-space:nowrap">Niv.</span>
    <input type="number" id="mje_cls_level_${i}" value="${c.level||1}" min="1" max="20" style="width:46px;text-align:center;background:var(--surface2);border:1px solid var(--border);border-radius:4px;color:var(--text);font-size:12px;padding:3px;outline:none">
    <button class="btn bsm" style="color:#e53935;padding:2px 7px;flex-shrink:0" onclick="mjEditRemoveClass(${i})">✕</button>
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
    return`<div style="display:flex;align-items:center;gap:4px;padding:3px 5px;cursor:pointer;border-radius:4px;background:var(--surface2);user-select:none" onclick="mjEditToggleSkill('${sk.name}')">
      <span style="font-size:12px;color:${col};width:14px;text-align:center">${icon}</span>
      <span style="font-size:11px;flex:1;color:${prof?'var(--text)':'var(--text2)'}">${esc(sk.name)}</span>
      <span style="font-size:9px;color:var(--text3)">${abNames[sk.ab]}</span>
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
  if(!feats.length)return'<div style="font-size:11px;color:var(--text3);font-style:italic;padding:3px 0">Aucune capacité.</div>';
  return feats.map((f,i)=>`<div style="background:var(--surface2);border-radius:6px;padding:7px;margin-bottom:6px">
    <div style="display:flex;gap:5px;align-items:center;margin-bottom:4px">
      <input id="mje_feat_name_${i}" value="${esc(f.name||'')}" placeholder="Nom de la capacité *" style="flex:2;background:var(--surface);border:1px solid var(--border);border-radius:4px;color:var(--text);font-size:12px;font-weight:600;padding:3px 6px;outline:none">
      <input id="mje_feat_class_${i}" value="${esc(f.classe||'')}" placeholder="Classe" style="flex:1;background:var(--surface);border:1px solid var(--border);border-radius:4px;color:var(--text2);font-size:11px;padding:3px 6px;outline:none">
      <button class="btn bsm" style="color:#e53935;padding:2px 7px;flex-shrink:0" onclick="mjEditRemoveFeat(${i})">✕</button>
    </div>
    <textarea id="mje_feat_desc_${i}" rows="2" placeholder="Description (optionnelle)" style="width:100%;box-sizing:border-box;background:var(--surface);border:1px solid var(--border);border-radius:4px;color:var(--text2);font-size:11px;padding:4px 6px;resize:vertical;outline:none">${esc(f.desc||'')}</textarea>
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
  if(!_mjCustomFeats.length)return'<div style="font-size:12px;color:var(--text3);font-style:italic;text-align:center;padding:20px">Aucune entrée. Créez votre première capacité ci-dessus.</div>';
  return _mjCustomFeats.map((f,i)=>`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:6px">
    <div style="display:flex;align-items:flex-start;gap:8px">
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:600;color:var(--text)">${esc(f.name)}</div>
        ${f.category?`<div style="font-size:11px;color:var(--cp);margin-bottom:3px">${esc(f.category)}</div>`:''}
        ${f.description?`<div style="font-size:12px;color:var(--text2);line-height:1.4">${esc(f.description)}</div>`:''}
      </div>
      <button class="btn bsm" style="color:#e53935;padding:2px 7px;flex-shrink:0" onclick="mjDeleteCustomFeat(${i})">🗑</button>
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
    return`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:6px;display:flex;align-items:center;gap:8px">
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:600;color:var(--text)">${esc(c.name)}</div>
        <div style="font-size:11px;color:var(--text3)">${(c.feats||[]).length} capacité(s) · ${(c.spells||[]).length} sort(s) · ${(c.items||[]).length} objet(s)</div>
      </div>
      <button class="btn bsm bprimary" onclick="mjOpenCompendiumEditor('${id}')">✏️ Éditer</button>
      <button class="btn bsm" onclick="exportMJCompendium('${id}')">📤</button>
    </div>`;}).join('')
    :`<div style="font-size:12px;color:var(--text3);font-style:italic;text-align:center;padding:20px">Aucun compendium. Créez-en un ci-dessous.</div>`;
  openWideModal(`<div class="pt">📚 Bibliothèque de compendiums</div>
    <div style="font-size:12px;color:var(--text2);margin-bottom:14px">Choisissez un compendium à éditer, ou créez-en un nouveau.</div>
    <div style="max-height:50vh;overflow-y:auto;margin-bottom:12px">${listHtml}</div>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
      <div style="display:flex;gap:6px">
        <button class="btn bsm bprimary" onclick="mjCreateNewComp()">+ Nouveau</button>
        <button class="btn bsm" onclick="importMJCompendium()">📥 Importer</button>
      </div>
      <button class="btn bsm" onclick="closeModal()">Fermer</button>
    </div>`);
}

function mjOpenCompendiumEditor(id){
  if(!_mjCompLib[id])return;
  _mjActiveCompId=id;
  const c=_mjCompLib[id];
  _mjCustomFeats=c.feats||[];
  const hasLib=Object.keys(_mjCompLib).length>1;
  openWideModal(`<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
    ${hasLib?`<button class="btn bsm" onclick="mjOpenCompendium()" style="flex-shrink:0">← Retour</button>`:''}
    <div class="pt" style="margin:0;flex:1">📚 ${esc(c.name)}</div>
  </div>
    <div style="font-size:12px;color:var(--text2);margin-bottom:12px">Capacités, dons et traits maison disponibles pour vos tables.</div>
    <div style="background:var(--surface2);border-radius:8px;padding:12px;margin-bottom:14px">
      <div style="font-size:10px;color:var(--cp);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px">+ Nouvelle capacité</div>
      <input id="mj_comp_name" class="fi" placeholder="Nom *" style="margin-bottom:6px;font-size:13px;font-weight:600">
      <input id="mj_comp_cat" class="fi" placeholder="Catégorie (ex : Racial, Magie, Roublard...)" style="margin-bottom:6px;font-size:12px">
      <textarea id="mj_comp_desc" class="fi" rows="3" placeholder="Description de la capacité..." style="font-size:12px;resize:vertical;margin-bottom:8px"></textarea>
      <button class="btn bsm bprimary" onclick="mjCreateCustomFeat()">💾 Ajouter</button>
    </div>
    <div style="font-size:10px;color:var(--cp);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px">${_mjCustomFeats.length} capacité(s)</div>
    <div id="mj_comp_list" style="max-height:38vh;overflow-y:auto">${_mjRenderCompendiumList()}</div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;gap:8px;flex-wrap:wrap">
      <div style="display:flex;gap:6px">
        <button class="btn bsm" onclick="exportMJCompendium('${id}')">📤 Exporter</button>
        <button class="btn bsm" style="color:#e53935;border-color:rgba(229,57,53,.3)" onclick="mjDeleteComp('${id}')">🗑 Supprimer</button>
      </div>
      <button class="btn bsm" onclick="closeModal()">Fermer</button>
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
    <div style="font-size:12px;color:var(--text2);margin-bottom:12px">${feats.length} capacité(s) · ${spells.length} sort(s) · ${items.length} objet(s)</div>
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
        <div style="background:var(--surface2);border-radius:8px;padding:12px;margin-bottom:14px;font-size:13px;color:var(--text2)">
          <div style="font-size:14px;font-weight:600;color:var(--cp);margin-bottom:6px">« ${esc(importedName)} »</div>
          <span style="color:var(--cp)">${feats.length}</span> capacité(s) &nbsp;·&nbsp;
          <span style="color:var(--cp)">${spells.length}</span> sort(s) &nbsp;·&nbsp;
          <span style="color:var(--cp)">${items.length}</span> objet(s)
          ${monsters.length?`&nbsp;·&nbsp;<span style="color:var(--cp)">${monsters.length}</span> monstre(s)/PNJ`:''}
        </div>
        ${feats.length||spells.length||items.length?`<div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:6px">Capacités / Sorts / Objets → compendium :</div>
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
    <div style="font-size:12px;color:var(--text2);margin-bottom:10px">Cliquez sur une capacité pour l'ajouter à la fiche du personnage.</div>
    <div style="max-height:60vh;overflow-y:auto;margin-bottom:10px">
      ${allFeats.map((f,i)=>`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:6px;cursor:pointer;transition:border-color .15s" onmouseover="this.style.borderColor='var(--cp)'" onmouseout="this.style.borderColor='var(--border)'" onclick="mjApplyCustomFeat(${i},${playerIdx})">
        <div style="display:flex;align-items:center;gap:8px">
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:600">${esc(f.name)}</div>
            ${f.category?`<div style="font-size:11px;color:var(--cp)">${esc(f.category)}</div>`:''}
            ${f.description?`<div style="font-size:12px;color:var(--text2);margin-top:3px">${esc(f.description).substring(0,120)}${f.description.length>120?'…':''}</div>`:''}
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
  const sec=t=>`<div style="font-size:10px;color:var(--cp);text-transform:uppercase;letter-spacing:.07em;border-bottom:1px solid var(--border);margin-bottom:8px;padding-bottom:3px;margin-top:4px">${t}</div>`;
  openWideModal(`<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
    <span style="font-size:24px">${pp.avatar||'⚔'}</span>
    <div style="flex:1;min-width:0">
      <div style="font-size:11px;color:var(--text3);margin-bottom:4px">${esc(pp.playerName||'')} · ✏ Modification de la fiche</div>
      <input id="mje_charname" value="${esc(p.charName||'')}" placeholder="Nom du personnage" style="width:100%;background:transparent;border:none;border-bottom:1px solid var(--border);color:var(--text);font-size:15px;font-weight:700;outline:none;padding:2px 0">
    </div>
  </div>
  <div style="max-height:65vh;overflow-y:auto;padding-right:4px">
    ${sec('Infos de base')}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px">
      <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Race</div><input id="mje_race" value="${esc(p.race||'')}" placeholder="Race" class="fi" style="font-size:12px"></div>
      <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Historique</div><input id="mje_background" value="${esc(p.background||'')}" placeholder="Historique" class="fi" style="font-size:12px"></div>
    </div>
    ${sec('Classes & Niveaux')}
    <div id="mje_class_list" style="margin-bottom:4px">${_mjRenderClassList(classes)}</div>
    <button class="btn bsm" style="width:100%;margin-bottom:12px" onclick="mjEditAddClass()">+ Ajouter une classe</button>
    ${sec('Expérience')}
    ${(()=>{const _xpLvl=classes.reduce((s,c)=>s+(c.level||0),0);const _xpCur=p.xp||0;const _xpCurT=XP_LEVELS[_xpLvl-1]||0;const _xpNextT=XP_LEVELS[_xpLvl]||XP_LEVELS[19];const _xpPct=Math.min(100,Math.round(((_xpCur-_xpCurT)/Math.max(1,_xpNextT-_xpCurT))*100));const _xpToNext=Math.max(0,_xpNextT-_xpCur);return`<div style="margin-bottom:12px"><div style="display:flex;align-items:baseline;gap:6px;margin-bottom:4px"><span style="font-size:20px;font-weight:700;color:var(--cp)">${_xpCur.toLocaleString()}</span><span style="font-size:11px;color:var(--text3)">XP actuels • Niv. ${_xpLvl}</span></div><div class="xp-bar-wrap"><div class="xp-bar-fill" style="width:${_xpPct}%"></div></div><div style="font-size:11px;color:var(--text3);margin-bottom:8px">${_xpToNext>0?`${_xpToNext.toLocaleString()} XP jusqu'au niveau ${_xpLvl+1}`:`✨ Prêt pour le niveau ${_xpLvl+1} !`}</div><div style="display:flex;gap:6px;margin-bottom:6px"><input id="mje_xp_add" type="number" min="0" placeholder="XP à ajouter..." class="fi" style="flex:1;font-size:12px"><button class="btn bsm bac" onclick="mjEditAddQuickXP(parseInt(document.getElementById('mje_xp_add').value)||0)" style="white-space:nowrap">+ Ajouter</button></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:3px">${[[25,'Gobelin tué'],[50,'Rencontre facile'],[100,'Rencontre moyenne'],[200,'Rencontre difficile'],[450,'Boss tué'],[1000,'Jalon narratif']].map(([xp,lbl])=>`<div class="xp-reward" onclick="mjEditAddQuickXP(${xp})">+${xp} XP — ${lbl}</div>`).join('')}</div></div>`;})()}
    ${sec('Stats de combat')}
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:12px">
      ${[['PV','hp',p.hp||0],['PV max','hpMax',p.hpMax||1],['CA','ac',p.ac||10],['Vit. (m)','speed',p.speed||9]].map(([label,id,val])=>`<div style="background:var(--surface2);border-radius:6px;padding:6px;text-align:center"><div style="font-size:9px;color:var(--text3);text-transform:uppercase;margin-bottom:3px">${label}</div><input id="mje_${id}" type="number" value="${val}" style="width:100%;text-align:center;background:transparent;border:none;color:var(--text);font-size:15px;font-weight:700;outline:none"></div>`).join('')}
    </div>
    ${sec('Caractéristiques')}
    <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:4px;margin-bottom:12px">
      ${abilNames.map((ab,i)=>`<div style="background:var(--surface2);border-radius:6px;padding:5px;text-align:center"><div style="font-size:9px;color:var(--text3)">${ab}</div><input id="mje_ab${i}" type="number" min="1" max="30" value="${abs[i]}" style="width:100%;text-align:center;background:transparent;border:none;color:var(--text);font-size:14px;font-weight:700;outline:none"></div>`).join('')}
    </div>
    ${sec('Compétences')}
    <div style="font-size:10px;color:var(--text3);margin-bottom:6px">Cliquer pour changer : ○ Aucune · ● Maîtrise · ◆ Expertise</div>
    <div id="mje_skill_grid" style="display:grid;grid-template-columns:1fr 1fr;gap:3px;margin-bottom:12px">${_mjRenderSkillGrid()}</div>
    ${sec('Conditions')}
    <div id="mje_cond_chips" style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">${conds.length?conds.map((c,i)=>`<span class="status-badge malus" style="cursor:pointer" onclick="mjEditRemoveCond(${i})">⚠ ${esc(c)} ✕</span>`).join(''):'<span style="font-size:11px;color:var(--text3);font-style:italic">Aucune condition.</span>'}</div>
    <div style="display:flex;gap:6px;margin-bottom:12px"><input id="mje_cond_input" class="fi" placeholder="Nom de la condition..." style="flex:1;font-size:12px;padding:5px 8px"><button class="btn bsm" onclick="mjEditAddCond()">+ Ajouter</button></div>
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
      ${['pp','po','pe','pa','pc'].map(coin=>`<div style="flex:1;text-align:center"><div style="font-size:10px;color:var(--text3);margin-bottom:2px">${coin.toUpperCase()}</div><input id="mje_cur_${coin}" type="number" min="0" value="${cur[coin]||0}" style="width:100%;text-align:center;background:var(--surface2);border:1px solid var(--border);border-radius:4px;color:var(--text);font-size:13px;padding:4px;outline:none"></div>`).join('')}
    </div>
    ${sec('Sorts')}
    <div id="mje_spell_list" style="margin-bottom:6px">${_mjRenderSpellList(spells)}</div>
    <div style="display:flex;gap:4px;margin-bottom:12px">
      <input id="mje_spell_name" class="fi" placeholder="Nom du sort" style="flex:3;font-size:12px;padding:5px 8px">
      <input id="mje_spell_level" type="number" min="0" max="9" placeholder="Niv" style="width:52px;background:var(--surface2);border:1px solid var(--border);border-radius:4px;color:var(--text);padding:5px;font-size:12px;text-align:center;outline:none">
      <button class="btn bsm" onclick="mjEditAddSpell()">+ Sort</button>
    </div>
    ${sec('Langues & Maîtrises')}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px">
      <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Langues</div><input id="mje_languages" value="${esc(p.languages||'')}" class="fi" style="font-size:12px" placeholder="Commun, Elfique..."></div>
      <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Maîtrises diverses</div><input id="mje_proficiencies" value="${esc(p.proficiencies||'')}" class="fi" style="font-size:12px" placeholder="Outils, instruments..."></div>
      <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Maîtrises d'armes</div><input id="mje_weaponprofs" value="${esc((p.weaponProfs||[]).join(', '))}" class="fi" style="font-size:12px" placeholder="Armes courantes, épée..."></div>
      <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Maîtrises d'armures</div><input id="mje_armorprofs" value="${esc((p.armorProfs||[]).join(', '))}" class="fi" style="font-size:12px" placeholder="Légères, intermédiaires..."></div>
    </div>
    ${sec('Personnalité & Histoire')}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">
      <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Traits</div><textarea id="mje_traits" class="fi" rows="2" style="font-size:11px;resize:vertical">${esc(p.traits||'')}</textarea></div>
      <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Idéaux</div><textarea id="mje_ideals" class="fi" rows="2" style="font-size:11px;resize:vertical">${esc(p.ideals||'')}</textarea></div>
      <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Liens</div><textarea id="mje_bonds" class="fi" rows="2" style="font-size:11px;resize:vertical">${esc(p.bonds||'')}</textarea></div>
      <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Défauts</div><textarea id="mje_flaws" class="fi" rows="2" style="font-size:11px;resize:vertical">${esc(p.flaws||'')}</textarea></div>
    </div>
    <div style="margin-bottom:6px"><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Histoire du personnage</div><textarea id="mje_backstory" class="fi" rows="3" style="font-size:11px;resize:vertical">${esc(p.backstory||'')}</textarea></div>
    <div style="margin-bottom:10px"><div style="font-size:10px;color:var(--cp);margin-bottom:3px">🔐 Secrets MJ</div><textarea id="mje_secrets" class="fi" rows="2" style="font-size:11px;resize:vertical;border-color:rgba(200,168,75,.35)">${esc(p.secrets||'')}</textarea></div>
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
  }catch(e){showToast('❌ Erreur : '+e.message);}
}

function mjQuickKickConfirm(idx){
  const pp=_mjPlayersData[idx];if(!pp)return;
  const charName=esc(pp.charData&&pp.charData.charName||'Sans nom');
  const playerName=esc(pp.playerName||'ce joueur');
  openModal(`<div class="pt" style="color:#e53935">⚠️ Exclure ce joueur ?</div>
    <div style="font-size:13px;color:var(--text2);margin:10px 0 18px">Retirer <b>${charName}</b> (${playerName}) de cette campagne ?<br><span style="font-size:11px;color:var(--text3)">Le personnage reste intact dans sa bibliothèque.</span></div>
    <div style="display:flex;gap:10px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn" style="flex:2;color:#e53935;border-color:rgba(229,57,53,.4);font-weight:600" onclick="mjKickCharacter(${idx})">✓ Exclure</button>
    </div>`);
}

function mjModerationModal(idx){
  const pp=_mjPlayersData[idx];if(!pp)return;
  const charName=esc(pp.charData&&pp.charData.charName||'Sans nom');
  const playerName=esc(pp.playerName||'Joueur');
  openModal(`<div class="pt" style="color:#e53935">🗑 Modération</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:16px">Joueur : <b>${playerName}</b> · Personnage : <b>${charName}</b></div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <button class="btn" style="background:rgba(229,57,53,.08);border:1px solid rgba(229,57,53,.35);color:#e53935;text-align:left;padding:12px 14px;border-radius:8px" onclick="mjKickCharacter(${idx})">
        <div style="font-weight:600;margin-bottom:3px">↩ Retirer de la campagne</div>
        <div style="font-size:11px;color:var(--text3)">Retire <b>${charName}</b> du roster MJ. Le personnage reste intact dans la bibliothèque du joueur — c'est à lui de le supprimer.</div>
      </button>
      <button class="btn" style="background:rgba(229,57,53,.15);border:1px solid rgba(229,57,53,.6);color:#e53935;text-align:left;padding:12px 14px;border-radius:8px" onclick="mjKickFromTable(${idx})">
        <div style="font-weight:600;margin-bottom:3px">🚫 Exclure de la table</div>
        <div style="font-size:11px;color:var(--text3)">Retire <b>${playerName}</b> de la table entière et supprime tous ses personnages dans toutes les campagnes. Irréversible.</div>
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
  }catch(e){showToast('❌ Erreur : '+e.message);}
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
  }catch(e){showToast('❌ Erreur : '+e.message);}
}

// ─────────────────────────────────────────
// TAB COMBAT
// ─────────────────────────────────────────
function mjTabCombat(){
  const sorted=_mjCombatStarted?[..._mjCombatants].sort((a,b)=>b.initiative-a.initiative):_mjCombatants;
  const currentC=_mjCombatStarted&&sorted.length?sorted[_mjCurrentTurn%sorted.length]:null;

  const combatantRows=sorted.length?sorted.map((c,i)=>{
    const realIdx=_mjCombatants.indexOf(c);
    const isActive=_mjCombatStarted&&(i===_mjCurrentTurn%sorted.length);
    const isDead=c.hp<=0;
    const hpPct=c.hpMax?Math.max(0,Math.min(100,c.hp/c.hpMax*100)):0;
    const hpColor=hpPct>50?'#4caf50':hpPct>25?'#ff9800':'#e53935';
    const condHtml=c.conditions&&c.conditions.length?`<div style="margin-top:3px">${c.conditions.map((cd,ci)=>`<span class="status-badge malus" style="cursor:pointer" onclick="mjRemoveCond(${realIdx},${ci})">⚠ ${esc(cd)} ✕</span>`).join('')}</div>`:'';
    const speedHtml=c.speed?`<div style="font-size:10px;color:var(--text3);margin-top:1px">🚶 ${esc(c.speed)}</div>`:'';
    return`<div class="combat-row${isActive?' active-turn':''}${isDead?' dead':''}">
      ${_mjCombatStarted?`<div style="width:34px;text-align:center;cursor:pointer" title="Cliquer pour modifier" onclick="mjEditInitiative(${realIdx})"><span style="font-family:var(--F);font-size:14px;color:var(--cp);border-bottom:1px dashed rgba(200,168,75,.4)">${c.initiative||0}</span></div>`:''}
      <div style="width:26px;text-align:center;font-size:18px">${c.isPlayer?(c.avatar||'⚔'):'👾'}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:600;color:${isActive?'var(--cp)':'var(--text)'}">${esc(c.name)}${isActive?' ◀':''}</div>
        ${speedHtml}${condHtml}
      </div>
      <div style="display:flex;align-items:center;gap:4px">
        <div style="text-align:center;min-width:60px">
          <div style="font-size:11px;color:${hpColor};font-weight:600">${c.hp}/${c.hpMax}</div>
          <div class="hp-bar" style="width:60px"><div class="hp-fill" style="width:${hpPct}%;background:${hpColor}"></div></div>
        </div>
        <button class="btn bsm" style="padding:2px 7px;font-size:14px" onclick="mjHpChange(${realIdx},-1)">−</button>
        <button class="btn bsm" style="padding:2px 7px;font-size:14px" onclick="mjHpChange(${realIdx},1)">+</button>
        <button class="btn bsm" style="font-size:10px;padding:2px 6px" onclick="mjOpenHpModal(${realIdx})">✏</button>
        <button class="btn bsm" style="font-size:10px;padding:2px 6px" onclick="mjOpenCondModal(${realIdx})">⚠</button>
        <button class="btn bsm" style="font-size:10px;padding:2px 6px;border-color:var(--cp);color:var(--cp)" onclick="mjOpenCombatDice(${realIdx})">🎲</button>
        <button class="btn bsm" style="font-size:10px;padding:2px 6px;color:#e53935;border-color:#e53935" onclick="mjRemoveCombatant(${realIdx})">✕</button>
        ${isActive?`<button class="btn bsm" style="font-size:10px;padding:2px 8px;border-color:#7c3aed;color:#a78bfa;font-weight:600" onclick="mjNextTurn()">⏩</button>`:''}
      </div>
      <div style="width:36px;text-align:center;font-size:11px;color:var(--text3)">CA ${c.ac||0}</div>
    </div>`;
  }).join(''):`<div style="color:var(--text3);font-style:italic;font-size:13px;text-align:center;padding:16px">Aucun combattant. Ajoutez des joueurs ou des monstres.</div>`;

  const logHtml=_mjCombatLog.length?`<div class="pt" style="margin-top:12px">📜 Journal de combat</div>
    <div class="mj-log">${[..._mjCombatLog].reverse().map(l=>`<div class="mj-log-entry">${l}</div>`).join('')}</div>`:'';

  return`<div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">
      <button class="btn bsm bprimary" onclick="mjAddAllToCombat()">⚔ Ajouter joueurs</button>
      <button class="btn bsm bprimary" onclick="mjOpenAddMonster()">🐉 Ajouter monstre</button>
      ${!_mjCombatStarted&&_mjCombatants.length?`<button class="btn bsm" style="border-color:#ffd54f;color:#ffd54f" onclick="mjStartCombat()">🎲 Lancer l'initiative</button>`:''}
      ${_mjCombatStarted?`<button class="btn bsm" style="border-color:var(--cp);color:var(--cp)" onclick="mjNextTurn()">▶ Tour suivant</button>
        <button class="btn bsm" style="border-color:#4caf50;color:#4caf50" onclick="mjEndCombat()">🏁 Fin du combat</button>
        <div style="display:flex;align-items:center;gap:6px;padding:4px 10px;background:var(--surface2);border:1px solid var(--border);border-radius:6px;font-size:12px">
          🔄 Round <strong style="color:var(--cp)">${_mjRound}</strong>
          ${currentC?` — Tour de <strong style="color:var(--cp)">${esc(currentC.name)}</strong>`:''}
        </div>`:''}
      ${_mjCombatants.length?`<button class="btn bsm" style="border-color:#e53935;color:#e53935" onclick="mjResetCombat()">🗑 Réinitialiser</button>`:''}
    </div>
    ${combatantRows}
    ${logHtml}
  </div>`;
}

function _extractPlayerCombatData(p){
  const lvl=totalLevel(p);
  const ab=p.abilities||[10,10,10,10,10,10];
  const mods=ab.map(v=>Math.floor((v-10)/2));
  const forM=mods[0],dexM=mods[1];
  const profB=pb(lvl);
  const attacks=[];
  ['mainhand','offhand','ranged'].forEach(slot=>{
    const w=(p.equip||{})[slot];
    if(!w||!w.name)return;
    const isRanged=slot==='ranged';
    const srdW=SRD.weapons.find(sw=>sw.name===w.name);
    if(srdW){
      const finesse=(srdW.properties||'').includes('Finesse');
      const atkM=finesse?Math.max(forM,dexM):isRanged?dexM:forM;
      const dmgParts=(srdW.damage||'1d6').split(' ');
      attacks.push({name:w.name,atkBonus:profB+atkM,dmgDice:dmgParts[0]||'1d6',dmgBonus:atkM,dmgType:dmgParts.slice(1).join(' '),range:isRanged?'Distance':'Corps à corps'});
    }else{
      // Arme personnalisée : extraire dés depuis la desc si possible
      const diceMatch=(w.desc||'').match(/(\d+d\d+)/);
      const atkM=isRanged?dexM:forM;
      attacks.push({name:w.name,atkBonus:profB+atkM,dmgDice:diceMatch?diceMatch[1]:'1d6',dmgBonus:atkM,dmgType:'',range:isRanged?'Distance':'Corps à corps'});
    }
  });
  const spells=(p.spells||[]).map(s=>({name:s.name,level:s.level||0,desc:''}));
  const traits=(p.features||[]).filter(f=>f.name).map(f=>({name:f.name,desc:f.desc||''}));
  return {attacks,spells,traits};
}

function mjAddPlayerToCombat(idx){
  const pp=_mjPlayersData[idx];
  if(!pp)return;
  const p=pp.charData||{};
  if(_mjCombatants.find(c=>c.uid===pp.uid)){showToast('Déjà dans le combat.');return;}
  const mods=(p.abilities||[0,0,0,0,0,0]).map(v=>Math.floor((v-10)/2));
  const {attacks,spells,traits}=_extractPlayerCombatData(p);
  _mjCombatants.push({id:'player_'+pp.uid,name:p.charName||pp.playerName||'Joueur',hp:p.hp||p.hpMax||1,hpMax:p.hpMax||1,ac:p.ac||10,speed:(p.speed!=null?p.speed:9)+'m',initiative:0,dexMod:mods[1]||0,conditions:[],isPlayer:true,avatar:pp.avatar||'⚔',uid:pp.uid,abilities:p.abilities||[10,10,10,10,10,10],attacks,spells,traits});
  _mjCombatLog.push(`⚔ ${esc(p.charName||pp.playerName)} ajouté au combat.`);
  renderMJContent();
}

function mjAddFamiliarToCombat(playerIdx){
  const pp=_mjPlayersData[playerIdx];if(!pp)return;
  const fam=(pp.charData||{}).familiar;if(!fam?.active){showToast('❌ Ce joueur n\'a pas de familier actif.');return;}
  const famId='familiar_'+pp.uid;
  if(_mjCombatants.find(c=>c.id===famId)){showToast('🦉 Déjà dans le combat.');return;}
  const mods=(fam.ab||[]).map(v=>Math.floor((v-10)/2));
  _mjCombatants.push({
    id:famId,name:fam.name+' (familier de '+((pp.charData||{}).charName||pp.playerName||'joueur')+')',
    hp:fam.hpCur,hpMax:fam.hpMax,ac:fam.ac,speed:fam.speed||'?',
    initiative:0,dexMod:mods[1]||0,conditions:[],isPlayer:false,avatar:fam.icon||'🦉',
    abilities:fam.ab||[10,10,10,10,10,10],
    attacks:fam.attacks||[],spells:[],
    traits:(fam.traits||[]).map(t=>({name:'Trait',desc:t,uses:0,dice:''})),
  });
  _mjCombatLog.push(`🦉 ${esc(fam.name)} (familier) ajouté au combat.`);
  renderMJContent();showToast(`🦉 ${fam.name} ajouté au combat !`);
}
function mjAddAllToCombat(){
  _mjPlayersData.forEach((_,i)=>mjAddPlayerToCombat(i));
}

function mjFillFromNPC(idx){
  const n=_mjNPCs[idx];if(!n)return;
  const nameEl=document.getElementById('mAdd_name');
  const hpEl=document.getElementById('mAdd_hp');
  const acEl=document.getElementById('mAdd_ac');
  if(nameEl)nameEl.value=n.name||'';
  if(hpEl)hpEl.value=n.hp||10;
  if(acEl)acEl.value=n.ac||13;
  _mjNewMonsterAttacks=Array.isArray(n.attacks)?n.attacks.map(a=>({...a})):[];
  _mjNewMonsterSpells=Array.isArray(n.spells)?n.spells.map(s=>({...s})):[];
  _mjNewMonsterTraits=Array.isArray(n.traits)?n.traits.map(t=>({...t})):[];
  if(typeof n.attacks==='string'&&n.attacks)_mjNewMonsterTraits.unshift({name:'Attaques',desc:n.attacks});
  if(n.notes&&!Array.isArray(n.traits))_mjNewMonsterTraits.push({name:'Notes',desc:n.notes});
  mjRenderAttacksList();mjRenderSpellsList();mjRenderTraitsList();
  showToast('✓ '+esc(n.name)+' chargé — ajustez si besoin.');
}

function mjOpenAddMonster(){
  _mjNewMonsterAttacks=[];_mjNewMonsterSpells=[];_mjNewMonsterTraits=[];_mjEditingMonsterIdx=-1;
  window._mjPendingAbilities=null;
  const npcSection=_mjNPCs.length?`<div style="margin-bottom:12px;padding:8px;background:var(--surface2);border:1px solid var(--border);border-radius:8px">
      <div style="font-size:11px;font-weight:600;color:var(--cp);margin-bottom:6px">👤 Mes PNJ (${_mjNPCs.length})</div>
      <div style="max-height:90px;overflow-y:auto">${_mjNPCs.map((n,ni)=>`<div class="aci" onclick="mjFillFromNPC(${ni})" style="padding:5px 8px">
        <div class="ain">${esc(n.name||'?')}</div>
        <div class="ais">PV ${n.hp||'?'} · CA ${n.ac||'?'}</div>
      </div>`).join('')}</div>
    </div>`:'';
  const compSection=MONSTERS_DB
    ?`<div style="margin-bottom:12px;padding:8px;background:var(--surface2);border:1px solid var(--border);border-radius:8px">
        <div style="font-size:11px;font-weight:600;color:var(--cp);margin-bottom:6px">📚 Compendium (${MONSTERS_DB.length} monstres)</div>
        <input class="fi" id="monSearch" placeholder="Rechercher : Gobelin, Dragon..." oninput="mjFilterMonsters(this.value)" onfocus="mjFilterMonsters(this.value)" style="margin-bottom:4px">
        <div id="monResults" style="max-height:120px;overflow-y:auto"></div>
      </div>`
    :`<div style="text-align:center;margin-bottom:10px">
        <button class="btn bsm bprimary" onclick="loadMonstersDB(()=>{closeModal();mjOpenAddMonster()})">📚 Charger le compendium de monstres</button>
      </div>`;
  openWideModal(`<div class="pt">🐉 Ajouter au combat</div>
    ${npcSection}${compSection}
    <div class="fl mb6">Nom</div><input class="fi" id="mAdd_name" placeholder="Gobelin, Dragon Rouge..." style="margin-bottom:8px">
    <div class="g2" style="gap:8px;margin-bottom:8px">
      <div><div class="fl mb6">PV max</div><input class="fi" id="mAdd_hp" type="number" min="1" value="10"></div>
      <div><div class="fl mb6">CA</div><input class="fi" id="mAdd_ac" type="number" min="0" value="13"></div>
    </div>
    <div class="g2" style="gap:8px;margin-bottom:16px">
      <div><div class="fl mb6">Initiative (bonus DEX)</div><input class="fi" id="mAdd_init" type="number" value="0"></div>
      <div><div class="fl mb6">Nombre</div><input class="fi" id="mAdd_qty" type="number" min="1" max="20" value="1"></div>
    </div>
    <div style="border-top:1px solid var(--border);padding-top:12px;margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">⚔ Attaques</div>
        <button class="btn bsm" onclick="mjToggleMonsterSubForm('mAttForm')">+ Ajouter</button>
      </div>
      <div id="mAttForm" style="display:none;background:var(--surface2);border-radius:8px;padding:10px;margin-bottom:8px">
        <input class="fi" id="mAtt_name" placeholder="Nom (ex: Cimeterre, Arc court...)" style="margin-bottom:6px">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:6px">
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Bonus attaque</div><input class="fi" id="mAtt_bonus" type="number" value="0"></div>
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Dés de dégâts</div><input class="fi" id="mAtt_dice" placeholder="1d6" value="1d6"></div>
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Bonus dégâts</div><input class="fi" id="mAtt_dmgBonus" type="number" value="0"></div>
        </div>
        <div class="g2" style="gap:6px;margin-bottom:8px">
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Type de dégâts</div><input class="fi" id="mAtt_type" placeholder="tranchant, feu..."></div>
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Portée (optionnel)</div><input class="fi" id="mAtt_range" placeholder="1.5m / 18/72m"></div>
        </div>
        <button class="btn bac bsm" style="width:100%" onclick="mjConfirmAddFormAttack()">✓ Confirmer cette attaque</button>
      </div>
      <div id="mAdd_attacksList"><div style="font-size:11px;color:var(--text3);font-style:italic;padding:4px 0">Aucune attaque définie</div></div>
    </div>
    <div style="border-top:1px solid var(--border);padding-top:12px;margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">✦ Sorts & Pouvoirs</div>
        <button class="btn bsm" onclick="mjToggleMonsterSubForm('mSpForm')">+ Ajouter</button>
      </div>
      <div id="mSpForm" style="display:none;background:var(--surface2);border-radius:8px;padding:10px;margin-bottom:8px">
        <div style="position:relative;margin-bottom:8px">
          <input class="fi" id="mjSpSearchQ" placeholder="🔍 Chercher dans le compendium..." oninput="_mjSpellSearch(this.value)" onfocus="_mjSpellSearch(this.value)" autocomplete="off" onblur="setTimeout(()=>{const r=document.getElementById('mjSpSearchRes');if(r)r.style.display='none';},150)">
          <div id="mjSpSearchRes" style="display:none;position:absolute;top:100%;left:0;right:0;z-index:200;background:var(--surface);border:1px solid rgba(200,168,75,.4);border-radius:0 0 6px 6px;max-height:200px;overflow-y:auto;box-shadow:0 4px 16px rgba(0,0,0,.5)"></div>
        </div>
        <input class="fi" id="mSp_name" placeholder="Nom du sort (ex: Boule de feu)" style="margin-bottom:6px">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:6px">
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Niveau sort</div><input class="fi" id="mSp_level" type="number" value="1" min="0" max="9"></div>
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Stat sauvegarde</div><input class="fi" id="mSp_saveStat" placeholder="DEX, CON..."></div>
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">DD sauvegarde</div><input class="fi" id="mSp_saveDC" type="number" value="13" min="0"></div>
        </div>
        <div class="g2" style="gap:6px;margin-bottom:6px">
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Dés de dégâts</div><input class="fi" id="mSp_dice" placeholder="8d6, 2d8..."></div>
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Type de dégâts</div><input class="fi" id="mSp_type" placeholder="feu, foudre..."></div>
        </div>
        <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Description (optionnel)</div><textarea class="fi" id="mSp_desc" rows="2" placeholder="Zone 6m, chaque créature doit réussir un JS..." style="resize:vertical;margin-bottom:8px"></textarea></div>
        <button class="btn bac bsm" style="width:100%" onclick="mjConfirmAddFormSpell()">✓ Confirmer ce sort</button>
      </div>
      <div id="mAdd_spellsList"><div style="font-size:11px;color:var(--text3);font-style:italic;padding:4px 0">Aucun sort défini</div></div>
    </div>
    <div style="border-top:1px solid var(--border);padding-top:12px;margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">📜 Traits & Capacités passives</div>
        <button class="btn bsm" onclick="mjToggleMonsterSubForm('mTrForm')">+ Ajouter</button>
      </div>
      <div id="mTrForm" style="display:none;background:var(--surface2);border-radius:8px;padding:10px;margin-bottom:8px">
        <input class="fi" id="mTr_name" placeholder="Nom (ex: Vision dans le noir, Résistance au feu...)" style="margin-bottom:6px">
        <textarea class="fi" id="mTr_desc" rows="2" placeholder="Description du trait ou de la capacité..." style="resize:vertical;margin-bottom:6px"></textarea>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px">
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Charges (0=passif)</div><input class="fi" id="mTr_uses" type="number" min="0" value="0"></div>
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Récupération</div><select class="fi" id="mTr_recovery"><option value="passive">Passif</option><option value="short">Repos court</option><option value="long">Repos long</option></select></div>
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Dé (ex: 2d6+3)</div><input class="fi" id="mTr_dice" placeholder="2d6+3"></div>
        </div>
        <button class="btn bac bsm" style="width:100%" onclick="mjConfirmAddFormTrait()">✓ Confirmer ce trait</button>
      </div>
      <div id="mAdd_traitsList"><div style="font-size:11px;color:var(--text3);font-style:italic;padding:4px 0">Aucun trait défini</div></div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="mjConfirmAddMonster()">➕ Ajouter au combat</button>
    </div>`);
}

function mjFilterMonsters(q){
  const el=document.getElementById('monResults');if(!el||!MONSTERS_DB)return;
  if(!q.trim()){el.innerHTML=MONSTERS_DB.slice(0,15).map((m,i)=>`<div class="charlib-item" style="padding:5px 8px;cursor:pointer" onclick="mjFillMonster(${i})"><div style="flex:1"><div style="font-size:12px;font-weight:600">${esc(m.n)}</div><div style="font-size:11px;color:var(--text3)">CR ${m.cr||'?'} — CA ${m.ac||'?'} — ${m.hp||'?'} PV — ${m.t||''}</div></div><span style="color:var(--cp);font-size:11px">↑ Remplir</span></div>`).join('');return;}
  const low=q.toLowerCase();
  const res=[];
  for(let i=0;i<MONSTERS_DB.length&&res.length<20;i++){
    if(MONSTERS_DB[i].n&&MONSTERS_DB[i].n.toLowerCase().includes(low))res.push({i,m:MONSTERS_DB[i]});
  }
  el.innerHTML=res.length?res.map(({i,m})=>`<div class="charlib-item" style="padding:5px 8px;cursor:pointer" onclick="mjFillMonster(${i})">
    <div style="flex:1">
      <div style="font-size:12px;font-weight:600">${esc(m.n)}</div>
      <div style="font-size:11px;color:var(--text3)">CR ${m.cr||'?'} — CA ${m.ac||'?'} — ${m.hp||'?'} PV — ${m.t||''}</div>
    </div>
    <span style="color:var(--cp);font-size:11px">↑ Remplir</span>
  </div>`).join(''):'<div style="font-size:12px;color:var(--text3);text-align:center;padding:6px">Aucun résultat</div>';
}

function mjFillMonster(idx){
  const m=MONSTERS_DB[idx];if(!m)return;
  const ac=parseInt(m.ac)||13;
  const hp=parseInt(m.hp)||10;
  const dexMod=Math.floor(((parseInt(m.dex)||10)-10)/2);
  window._mjPendingAbilities=[
    parseInt(m.str)||10,parseInt(m.dex)||10,parseInt(m.con)||10,
    parseInt(m.int)||10,parseInt(m.wis)||10,parseInt(m.cha)||10
  ];
  const nameEl=document.getElementById('mAdd_name');
  const hpEl=document.getElementById('mAdd_hp');
  const acEl=document.getElementById('mAdd_ac');
  const initEl=document.getElementById('mAdd_init');
  if(nameEl)nameEl.value=m.n||'';
  if(hpEl)hpEl.value=hp;
  if(acEl)acEl.value=ac;
  if(initEl)initEl.value=dexMod;
  // Auto-populate attacks from compendium acts field
  _mjNewMonsterAttacks=[];
  const _specialActions=[];
  const acts=Array.isArray(m.acts)?m.acts:(m.acts?[m.acts]:[]);
  acts.forEach(act=>{
    if(!act.n)return;
    // Ignorer les règles variantes (Variant: ...)
    if(act.n.startsWith('Variant:'))return;
    if(!act.atk){
      // Action sans jet d'attaque → trait/action spéciale
      _specialActions.push(act.n);
      return;
    }
    const parts=act.atk.split('|');
    if(parts.length<3)return;
    const bonus=parseInt(parts[1])||0;
    const dmgStr=(parts[2]||'1d4').trim();
    const dmgMatch=dmgStr.match(/^(\d+d\d+)([+-]\d+)?/);
    if(!dmgMatch)return;
    _mjNewMonsterAttacks.push({name:act.n||parts[0]||'Attaque',atkBonus:bonus,dmgDice:dmgMatch[1],dmgBonus:parseInt(dmgMatch[2])||0,dmgType:'',range:''});
  });
  // Auto-populate traits from monster JSON fields
  _mjNewMonsterTraits=[];
  const _feetToM=s=>s.replace(/(\d+) ft\./g,(_,n)=>Math.round(parseInt(n)*0.3)+'m');
  if(m.res&&m.res.trim())_mjNewMonsterTraits.push({name:'Résistances',desc:m.res});
  if(m.imm&&m.imm.trim())_mjNewMonsterTraits.push({name:'Immunités aux dégâts',desc:m.imm});
  if(m.ci&&m.ci.trim())_mjNewMonsterTraits.push({name:'Immunités aux conditions',desc:m.ci});
  if(m.sen&&m.sen.trim())_mjNewMonsterTraits.push({name:'Sens',desc:_feetToM(m.sen)});
  if(m.sv&&m.sv.trim())_mjNewMonsterTraits.push({name:'Jets de sauvegarde',desc:m.sv});
  if(m.sk&&m.sk.trim())_mjNewMonsterTraits.push({name:'Compétences',desc:m.sk});
  if(m.spd&&m.spd.trim()&&m.spd!=='walk 30 ft.')_mjNewMonsterTraits.push({name:'Vitesse',desc:_feetToM(m.spd)});
  // Actions spéciales (actes sans jet d'attaque) → traits
  _specialActions.forEach(n=>{
    const lc=n.toLowerCase();
    const desc=lc.includes('multiattack')||lc.includes('multiattaque')?'Effectue plusieurs attaques par action (voir manuel).':lc.includes('spellcasting')||lc.includes('innate')?'⚠ Lanceur de sorts — ajoutez les sorts manuellement ci-dessous.':'Action spéciale (voir manuel).';
    _mjNewMonsterTraits.push({name:n,desc});
  });
  _mjNewMonsterSpells=[];
  mjRenderAttacksList();mjRenderSpellsList();mjRenderTraitsList();
  // Avertissement si le monstre semble être un lanceur de sorts
  const likelyCaster=_specialActions.some(n=>/spellcast|innate|spell/i.test(n))||/mage|sorcier|lich|archimage|wizard|cleric|shaman|druid|warlock|witch|archmage/i.test(m.n+' '+m.t);
  const res=document.getElementById('monResults');
  const info=(_mjNewMonsterAttacks.length?_mjNewMonsterAttacks.length+' att.':'')+(_mjNewMonsterTraits.length?(_mjNewMonsterAttacks.length?' · ':'')+_mjNewMonsterTraits.length+' trait(s)':'');
  const spellWarn=likelyCaster?'<div style="font-size:10px;color:#ffd54f;text-align:center;margin-top:2px">⚠ Ce monstre a probablement des sorts — à ajouter manuellement.</div>':'';
  if(res)res.innerHTML='<div style="font-size:11px;color:var(--cp);text-align:center;padding:4px">✅ "'+esc(m.n)+'" importé'+(info?' ('+info+')':'')+'</div>'+spellWarn;
}

function mjConfirmAddMonster(){
  const name=(document.getElementById('mAdd_name').value||'Monstre').trim();
  const hp=parseInt(document.getElementById('mAdd_hp').value)||10;
  const ac=parseInt(document.getElementById('mAdd_ac').value)||13;
  const initBonus=parseInt(document.getElementById('mAdd_init').value)||0;
  const qty=Math.max(1,Math.min(20,parseInt(document.getElementById('mAdd_qty').value)||1));
  const abilities=window._mjPendingAbilities||[10,10,10,10,10,10];
  window._mjPendingAbilities=null;
  const attacks=[..._mjNewMonsterAttacks];
  const spells=[..._mjNewMonsterSpells];
  const traits=[..._mjNewMonsterTraits];
  _mjNewMonsterAttacks=[];_mjNewMonsterSpells=[];_mjNewMonsterTraits=[];
  for(let i=0;i<qty;i++){
    const label=qty>1?name+' '+(i+1):name;
    _mjCombatants.push({id:'monster_'+Date.now()+'_'+i,name:label,hp,hpMax:hp,ac,initiative:0,dexMod:initBonus,conditions:[],isPlayer:false,abilities:[...abilities],attacks,spells,traits});
  }
  _mjCombatLog.push(`👾 ${qty>1?qty+'× ':''}"${esc(name)}" ajouté(s) au combat.`);
  closeModal();renderMJContent();
}

function mjToggleMonsterSubForm(id){
  const el=document.getElementById(id);if(!el)return;
  el.style.display=el.style.display==='none'?'block':'none';
}

function _mjFindListEl(addId,edId){return document.getElementById(addId)||document.getElementById(edId);}

function mjRenderAttacksList(){
  const el=_mjFindListEl('mAdd_attacksList','mEd_attacksList');if(!el)return;
  el.innerHTML=_mjNewMonsterAttacks.length
    ?_mjNewMonsterAttacks.map((a,i)=>`<div style="display:flex;align-items:center;gap:6px;padding:6px 8px;background:rgba(255,255,255,.04);border-radius:6px;margin-bottom:4px">
        <span>⚔</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:600">${esc(a.name)}</div>
          <div style="font-size:11px;color:var(--text3)">${a.atkBonus>=0?'+':''}${a.atkBonus} att. · ${esc(a.dmgDice)}${a.dmgBonus?fmt(a.dmgBonus):''} ${esc(a.dmgType)}${a.range?' · '+esc(a.range):''}</div>
        </div>
        <button class="btn bsm" style="color:#e53935;padding:1px 6px;flex-shrink:0" onclick="mjRemoveFormAttack(${i})">✕</button>
      </div>`).join('')
    :'<div style="font-size:11px;color:var(--text3);font-style:italic;padding:4px 0">Aucune attaque définie</div>';
}

function mjConfirmAddFormAttack(){
  const name=(document.getElementById('mAtt_name')?.value||'').trim();
  if(!name){showToast('❌ Nom de l\'attaque requis.');return;}
  _mjNewMonsterAttacks.push({
    name,
    atkBonus:parseInt(document.getElementById('mAtt_bonus')?.value)||0,
    dmgDice:(document.getElementById('mAtt_dice')?.value||'1d6').trim(),
    dmgBonus:parseInt(document.getElementById('mAtt_dmgBonus')?.value)||0,
    dmgType:(document.getElementById('mAtt_type')?.value||'').trim(),
    range:(document.getElementById('mAtt_range')?.value||'').trim(),
  });
  ['mAtt_name','mAtt_type','mAtt_range'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const dEl=document.getElementById('mAtt_dice');if(dEl)dEl.value='1d6';
  ['mAtt_bonus','mAtt_dmgBonus'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='0';});
  const sf=document.getElementById('mAttForm')||document.getElementById('mEdAttForm');if(sf)sf.style.display='none';
  mjRenderAttacksList();
}

function mjRemoveFormAttack(i){_mjNewMonsterAttacks.splice(i,1);mjRenderAttacksList();}

function mjRenderSpellsList(){
  const el=_mjFindListEl('mAdd_spellsList','mEd_spellsList');if(!el)return;
  el.innerHTML=_mjNewMonsterSpells.length
    ?_mjNewMonsterSpells.map((s,i)=>`<div style="display:flex;align-items:center;gap:6px;padding:6px 8px;background:rgba(255,255,255,.04);border-radius:6px;margin-bottom:4px">
        <span>✦</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:600">${esc(s.name)}${s.level?' <span style="font-weight:400;color:var(--text3)">Niv.'+s.level+'</span>':''}</div>
          <div style="font-size:11px;color:var(--text3)">${s.saveStat&&s.saveDC?`DD${s.saveDC} ${esc(s.saveStat)} `:''} ${s.dmgDice?esc(s.dmgDice)+' '+esc(s.dmgType):''}</div>
        </div>
        <button class="btn bsm" style="color:#e53935;padding:1px 6px;flex-shrink:0" onclick="mjRemoveFormSpell(${i})">✕</button>
      </div>`).join('')
    :'<div style="font-size:11px;color:var(--text3);font-style:italic;padding:4px 0">Aucun sort défini</div>';
}

function mjConfirmAddFormSpell(){
  const name=(document.getElementById('mSp_name')?.value||'').trim();
  if(!name){showToast('❌ Nom du sort requis.');return;}
  _mjNewMonsterSpells.push({
    name,
    level:parseInt(document.getElementById('mSp_level')?.value)||0,
    saveStat:(document.getElementById('mSp_saveStat')?.value||'').toUpperCase().trim(),
    saveDC:parseInt(document.getElementById('mSp_saveDC')?.value)||0,
    dmgDice:(document.getElementById('mSp_dice')?.value||'').trim(),
    dmgType:(document.getElementById('mSp_type')?.value||'').trim(),
    desc:(document.getElementById('mSp_desc')?.value||'').trim(),
  });
  ['mSp_name','mSp_saveStat','mSp_dice','mSp_type','mSp_desc'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const lEl=document.getElementById('mSp_level');if(lEl)lEl.value='1';
  const dcEl=document.getElementById('mSp_saveDC');if(dcEl)dcEl.value='13';
  const sf=document.getElementById('mSpForm')||document.getElementById('mEdSpForm');if(sf)sf.style.display='none';
  mjRenderSpellsList();
}

function mjRemoveFormSpell(i){_mjNewMonsterSpells.splice(i,1);mjRenderSpellsList();}

let _mjSpellHits=[];
const _DMG_TYPE_FR={'fire damage':'feu','cold damage':'froid','lightning damage':'foudre','thunder damage':'tonnerre','poison damage':'poison','acid damage':'acide','radiant damage':'radiant','necrotic damage':'nécrotique','psychic damage':'psychique','force damage':'force','piercing damage':'perforant','slashing damage':'tranchant','bludgeoning damage':'contondant'};
function _mjSpellSearch(q){
  const res=document.getElementById('mjSpSearchRes');if(!res)return;
  q=(q||'').trim().toLowerCase();
  const db=getSpellsDB();
  if(!db||!db.length){
    res.style.display='block';
    res.innerHTML='<div style="padding:8px;font-size:11px;color:var(--text3)">⏳ Chargement du compendium...</div>';
    loadSpellsDB(()=>_mjSpellSearch(q));
    return;
  }
  if(!q){
    _mjSpellHits=db.slice(0,20);
  }else{
    _mjSpellHits=db.filter(s=>(s.name||'').toLowerCase().includes(q)||(s.nameEN||'').toLowerCase().includes(q)).slice(0,15);
  }
  if(!_mjSpellHits.length){res.style.display='block';res.innerHTML='<div style="padding:8px;font-size:11px;color:var(--text3);font-style:italic">Aucun sort trouvé.</div>';return;}
  res.style.display='block';
  res.innerHTML=_mjSpellHits.map((s,i)=>`<div onclick="_mjSpellFill(${i})" style="padding:7px 10px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,.06)" onmouseenter="this.style.background='rgba(200,168,75,.1)'" onmouseleave="this.style.background=''"><div style="font-size:12px;font-weight:600;color:var(--text)">${esc(s.name)}</div><div style="font-size:10px;color:var(--text3)">${s.level===0?'Tour de magie':'Niveau '+(s.level||1)} · ${esc(s.school||'')}${s.damage?' · 🎲 '+s.damage:''}</div></div>`).join('');
}
function _mjSpellFill(i){
  const s=_mjSpellHits[i];if(!s)return;
  const nameEl=document.getElementById('mSp_name');
  const levelEl=document.getElementById('mSp_level');
  const diceEl=document.getElementById('mSp_dice');
  const typeEl=document.getElementById('mSp_type');
  const descEl=document.getElementById('mSp_desc');
  if(nameEl)nameEl.value=s.name||'';
  if(levelEl)levelEl.value=s.level||0;
  if(diceEl)diceEl.value=s.damage||'';
  if(typeEl){
    if(s.rolls&&s.rolls[0]){const raw=(s.rolls[0][2]||'').toLowerCase();typeEl.value=_DMG_TYPE_FR[raw]||raw.replace(/ damage$/i,'');}
    else typeEl.value='';
  }
  if(descEl)descEl.value=s.desc||'';
  const searchEl=document.getElementById('mjSpSearchQ');if(searchEl)searchEl.value='';
  const resEl=document.getElementById('mjSpSearchRes');if(resEl)resEl.style.display='none';
}

function mjRenderTraitsList(){
  const el=_mjFindListEl('mAdd_traitsList','mEd_traitsList');if(!el)return;
  el.innerHTML=_mjNewMonsterTraits.length
    ?_mjNewMonsterTraits.map((t,i)=>`<div style="display:flex;align-items:flex-start;gap:6px;padding:6px 8px;background:rgba(255,255,255,.04);border-radius:6px;margin-bottom:4px">
        <span style="margin-top:1px">📜</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:600">${esc(t.name)}</div>
          ${t.desc?`<div style="font-size:11px;color:var(--text3)">${esc(t.desc)}</div>`:''}
          ${(t.uses&&t.uses>0)||t.dice?`<div style="font-size:10px;color:var(--cp);margin-top:2px">${t.uses>0?t.uses+'× · '+(t.recovery==='short'?'Repos court':t.recovery==='long'?'Repos long':'Passif'):''}${t.dice?' · 🎲 '+esc(t.dice):''}</div>`:''}
        </div>
        <button class="btn bsm" style="color:#e53935;padding:1px 6px;flex-shrink:0" onclick="mjRemoveFormTrait(${i})">✕</button>
      </div>`).join('')
    :'<div style="font-size:11px;color:var(--text3);font-style:italic;padding:4px 0">Aucun trait défini</div>';
}

function mjConfirmAddFormTrait(){
  const name=(document.getElementById('mTr_name')?.value||'').trim();
  if(!name){showToast('❌ Nom du trait requis.');return;}
  const desc=(document.getElementById('mTr_desc')?.value||'').trim();
  const uses=parseInt(document.getElementById('mTr_uses')?.value)||0;
  const recovery=document.getElementById('mTr_recovery')?.value||'passive';
  const dice=(document.getElementById('mTr_dice')?.value||'').trim();
  const trait={name,desc};
  if(uses>0){trait.uses=uses;trait.recovery=recovery;}
  if(dice)trait.dice=dice;
  _mjNewMonsterTraits.push(trait);
  ['mTr_name','mTr_desc','mTr_dice'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const usesEl=document.getElementById('mTr_uses');if(usesEl)usesEl.value='0';
  const sf=document.getElementById('mTrForm')||document.getElementById('mEdTrForm');if(sf)sf.style.display='none';
  mjRenderTraitsList();
}

function mjRemoveFormTrait(i){_mjNewMonsterTraits.splice(i,1);mjRenderTraitsList();}
function mjRollTrait(cIdx,tIdx){
  const c=_mjCombatants[cIdx];if(!c)return;
  const t=(c.traits||[])[tIdx];if(!t||!t.dice)return;
  const m=t.dice.match(/(\d+)d(\d+)([+-]\d+)?/);
  if(!m){showToast(`🎲 ${t.name} : formule non reconnue`);return;}
  let total=0;const rolls=[];
  for(let i=0;i<parseInt(m[1]);i++){const r=Math.ceil(Math.random()*parseInt(m[2]));rolls.push(r);total+=r;}
  if(m[3])total+=parseInt(m[3]);
  const el=document.getElementById('mjDiceResult');
  if(el){el.style.display='block';el.innerHTML=`<strong>${esc(c.name)}</strong> — ${esc(t.name)}<br>🎲 [${rolls.join('+')}]${m[3]||''} = <span style="font-size:22px;font-weight:700;color:var(--cp)">${total}</span>`;}
  _mjCombatLog.push(`🎲 ${esc(c.name)} ${esc(t.name)} : ${total}`);
}
function mjUseTraitCharge(cIdx,traitName,maxUses){
  const c=_mjCombatants[cIdx];if(!c)return;
  c.traitUses=c.traitUses||{};
  const cur=c.traitUses[traitName]!==undefined?c.traitUses[traitName]:maxUses;
  if(cur<=0){showToast('❌ Plus de charges disponibles !');return;}
  c.traitUses[traitName]=cur-1;
  mjOpenCombatDice(cIdx);
}
function mjRecoverTraitCharge(cIdx,traitName,maxUses){
  const c=_mjCombatants[cIdx];if(!c)return;
  c.traitUses=c.traitUses||{};
  c.traitUses[traitName]=maxUses;
  mjOpenCombatDice(cIdx);
}
function mjGroupRest(type){
  if(!_mjPlayersData.length){showToast('Aucun joueur dans la campagne.');return;}
  const label=type==='long'?'🌙 Repos long':'☕ Repos court';
  const detail=type==='long'
    ?'PV remis à fond, sorts, capacités et jets de mort réinitialisés.'
    :'Capacités à repos court récupérées.';
  openModal(`<div class="pt">${label} — Groupe</div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:16px">${detail}</p>
    <div style="display:flex;gap:8px">
      <button class="btn bsm bac" style="flex:1" onclick="mjGroupRestConfirm('${type}')">✓ Confirmer pour tous</button>
      <button class="btn bsm bdanger" onclick="closeModal()">Annuler</button>
    </div>`);
}
async function mjGroupRestConfirm(type){
  closeModal();
  let count=0;
  for(const pp of _mjPlayersData){
    if(!pp.uid||!pp.docId)continue;
    const p=pp.charData||{};
    const update={};
    if(type==='long'){
      update['characterData.hp']=p.hpMax||p.hp||0;
      update['characterData.spellSlotsUsed']=[];
      update['characterData.deathSaves']={success:0,fail:0};
      update['characterData.conditions']=[];
      update['characterData.combatCharges']={};
      pp.charData.hp=p.hpMax||p.hp||0;pp.charData.spellSlotsUsed=[];
      pp.charData.deathSaves={success:0,fail:0};pp.charData.conditions=[];pp.charData.combatCharges={};
    } else {
      const newCharges={...(p.combatCharges||{})};
      (p.classes||[]).forEach(cls=>{
        const d=SRD.classes.find(c=>c.name===cls.name);
        if(d&&d.combatFeatures)d.combatFeatures.forEach(f=>{if(f.recovery==='short')delete newCharges[f.name];});
      });
      (p.customCombatFeats||[]).forEach(f=>{if(f.recovery==='short')delete newCharges[f.name];});
      update['characterData.combatCharges']=newCharges;
      pp.charData.combatCharges=newCharges;
    }
    try{await fbDb.collection('characters').doc(pp.docId).update(update);count++;}
    catch(e){console.warn('Rest sync error',pp.uid,e);}
  }
  showToast(`${type==='long'?'🌙 Repos long':'☕ Repos court'} appliqué à ${count} joueur(s) !`);
  renderMJContent();
}

async function _mjSaveCombatState(sorted,turnIdx){
  if(!currentUser||!currentCampaignId)return;
  const cur=sorted[turnIdx%sorted.length];
  const combatState=cur?{active:true,currentTurnUid:cur.uid||null,currentTurnName:cur.name||'?',round:_mjRound}:{active:false};
  try{await fbDb.collection('characters').doc(currentUser.uid+'_'+currentCampaignId+'_mj').update({combatState});}
  catch(e){console.warn('Error saving combat state:',e);}
}

function mjStartCombat(){
  _mjCombatants.forEach(c=>{c.initiative=Math.ceil(Math.random()*20)+(c.dexMod||0);});
  _mjCombatStarted=true;_mjCurrentTurn=0;_mjRound=1;
  const sorted=[..._mjCombatants].sort((a,b)=>b.initiative-a.initiative);
  _mjCombatLog.push(`🎲 Initiative lancée — Round 1. Premier : ${esc(sorted[0]?.name||'?')} (${sorted[0]?.initiative||0})`);
  _mjSaveCombatState(sorted,0);
  renderMJContent();
}

function mjNextTurn(){
  const sorted=[..._mjCombatants].sort((a,b)=>b.initiative-a.initiative);
  if(!sorted.length)return;
  _mjCurrentTurn++;
  if(_mjCurrentTurn>=sorted.length){_mjCurrentTurn=0;_mjRound++;_mjCombatLog.push(`🔄 Début du Round ${_mjRound}.`);}
  const cur=sorted[_mjCurrentTurn];
  _mjCombatLog.push(`▶ Tour de ${esc(cur?.name||'?')}`);
  _mjSaveCombatState(sorted,_mjCurrentTurn);
  renderMJContent();
}

function mjEndCombat(){
  const survivors=_mjCombatants.filter(c=>c.hp>0);
  const fallen=_mjCombatants.filter(c=>c.hp<=0);
  const rounds=_mjRound;
  openWideModal(`<div class="pt">🏁 Fin du combat</div>
    <div style="text-align:center;margin-bottom:16px">
      <div style="font-size:36px;margin-bottom:6px">🏆</div>
      <div style="font-size:14px;color:var(--text2)">${rounds} round${rounds>1?'s':''} de combat</div>
    </div>
    ${survivors.length?`<div style="margin-bottom:12px">
      <div class="fl mb6" style="color:#4caf50">✅ Debout (${survivors.length})</div>
      ${survivors.map(c=>`<div style="font-size:12px;padding:5px 10px;background:rgba(76,175,80,.08);border-radius:6px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center"><span>${c.isPlayer?(c.avatar||'⚔')+' ':' 👾 '}${esc(c.name)}</span><span style="color:#4caf50;font-weight:600">${c.hp}/${c.hpMax} PV</span></div>`).join('')}
    </div>`:''}
    ${fallen.length?`<div style="margin-bottom:16px">
      <div class="fl mb6" style="color:#e53935">💀 Hors combat (${fallen.length})</div>
      ${fallen.map(c=>`<div style="font-size:12px;padding:5px 10px;background:rgba(229,57,53,.08);border-radius:6px;margin-bottom:4px">${c.isPlayer?(c.avatar||'⚔')+' ':' 👾 '}${esc(c.name)}</div>`).join('')}
    </div>`:''}
    <div style="display:flex;gap:8px;margin-top:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="_mjDoEndCombat()">🏁 Terminer le combat</button>
    </div>`);
}
function _mjDoEndCombat(){
  _mjCombatants=[];_mjCombatStarted=false;_mjCurrentTurn=0;_mjRound=1;_mjCombatLog=[];
  if(currentUser&&currentCampaignId){
    fbDb.collection('characters').doc(currentUser.uid+'_'+currentCampaignId+'_mj').update({combatState:{active:false}}).catch(()=>{});
  }
  closeModal();renderMJContent();showToast('🏁 Combat terminé !');
}
function mjResetCombat(){
  if(!confirm('Réinitialiser le combat ?'))return;
  _mjCombatants=[];_mjCombatStarted=false;_mjCurrentTurn=0;_mjRound=1;_mjCombatLog=[];
  if(currentUser&&currentCampaignId){
    fbDb.collection('characters').doc(currentUser.uid+'_'+currentCampaignId+'_mj').update({combatState:{active:false}}).catch(()=>{});
  }
  renderMJContent();
}

// ─── JETS DE DÉS PAR COMBATTANT ───
function mjOpenCombatDice(idx){
  const c=_mjCombatants[idx];if(!c)return;
  const ab=c.abilities||[10,10,10,10,10,10];
  const mods=ab.map(v=>Math.floor((v-10)/2));
  const AB=['FOR','DEX','CON','INT','SAG','CHA'];
  const btnStyle='padding:8px 4px;text-align:center;width:100%';
  const makeBtn=(label,bonus,fn)=>`<button class="btn" style="${btnStyle}" onclick="${fn}(${idx},'${label}',${bonus})"><div style="font-size:11px;font-weight:700">${label}</div><div style="font-size:12px;color:var(--cp)">${fmt(bonus)}</div></button>`;
  const attacks=c.attacks||[];const spells=c.spells||[];const traits=c.traits||[];
  const attacksHtml=attacks.length
    ?attacks.map((a,ai)=>`<div style="display:flex;align-items:center;gap:8px;padding:8px;background:rgba(255,255,255,.04);border-radius:8px;margin-bottom:6px">
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:700">⚔ ${esc(a.name)}</div>
          <div style="font-size:11px;color:var(--text3)">${a.atkBonus>=0?'+':''}${a.atkBonus} att. · ${esc(a.dmgDice)}${a.dmgBonus?fmt(a.dmgBonus):''} ${esc(a.dmgType||'')}${a.range?' · '+esc(a.range):''}</div>
        </div>
        <button class="btn bac bsm" style="flex-shrink:0" onclick="mjRollAttack(${idx},${ai})">🎲 Lancer</button>
      </div>`).join('')
    :`<div style="text-align:center;padding:20px;color:var(--text3);font-style:italic">Aucune attaque définie.<br><span style="font-size:11px">Utilisez ✏ Éditer pour en ajouter.</span></div>`;
  const spellsHtml=spells.length
    ?spells.map((s,si)=>`<div style="padding:8px;background:rgba(255,255,255,.04);border-radius:8px;margin-bottom:6px">
        <div style="display:flex;align-items:center;gap:8px">
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:700">✦ ${esc(s.name)}${s.level?` <span style="font-size:11px;font-weight:400;color:var(--text3)">Niv.${s.level}</span>`:''}</div>
            <div style="font-size:11px;color:var(--text3)">${s.saveStat&&s.saveDC?`JS ${esc(s.saveStat)} DD <b>${s.saveDC}</b>`:''} ${s.dmgDice?'· '+esc(s.dmgDice)+' '+esc(s.dmgType||''):''}</div>
          </div>
          ${s.dmgDice||s.saveDC?`<button class="btn bac bsm" style="flex-shrink:0" onclick="mjRollSpell(${idx},${si})">🎲 Lancer</button>`:''}
        </div>
        ${s.desc?`<div style="font-size:11px;color:var(--text2);margin-top:4px;font-style:italic">${esc(s.desc)}</div>`:''}
      </div>`).join('')
    :`<div style="text-align:center;padding:20px;color:var(--text3);font-style:italic">Aucun sort défini.<br><span style="font-size:11px">Utilisez ✏ Éditer pour en ajouter.</span></div>`;
  const traitsHtml=traits.length
    ?traits.map((t,ti)=>{
      const hasUses=t.uses&&t.uses>0;
      const maxUses=t.uses||0;
      const remaining=hasUses?(c.traitUses&&c.traitUses[t.name]!==undefined?c.traitUses[t.name]:maxUses):0;
      const recovLabel=t.recovery==='short'?'Repos court':t.recovery==='long'?'Repos long':'';
      return`<div style="padding:8px;background:rgba(255,255,255,.04);border-radius:8px;margin-bottom:6px">
        <div style="font-size:13px;font-weight:700;margin-bottom:4px">📜 ${esc(t.name)}</div>
        ${t.desc?`<div style="font-size:12px;color:var(--text2);margin-bottom:6px">${esc(t.desc)}</div>`:''}
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          ${t.dice?`<button class="btn bsm bac" onclick="mjRollTrait(${idx},${ti})">🎲 ${esc(t.dice)}</button>`:''}
          ${hasUses?`<div style="display:flex;gap:3px">${Array.from({length:maxUses},(_,bi)=>`<span class="slot-bubble${bi<remaining?'':' used'}" onclick="mjUseTraitCharge(${idx},'${esc(t.name)}',${maxUses})"></span>`).join('')}</div><span style="font-size:10px;color:var(--text3)">${remaining}/${maxUses}${recovLabel?' · '+recovLabel:''}</span><button class="btn bsm" style="padding:1px 6px" onclick="mjRecoverTraitCharge(${idx},'${esc(t.name)}',${maxUses})">↺</button>`:''}
        </div>
      </div>`;
    }).join('')
    :`<div style="text-align:center;padding:20px;color:var(--text3);font-style:italic">Aucun trait défini.<br><span style="font-size:11px">Utilisez ✏ Éditer pour en ajouter.</span></div>`;
  openWideModal(`<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
    <div class="pt" style="margin:0;flex:1">🎲 ${esc(c.name)}</div>
    <button class="btn bsm" onclick="mjOpenEditMonster(${idx})">✏ Éditer</button>
  </div>
  <div class="journal-subtab" style="margin-bottom:14px">
    <button class="on" onclick="mjDiceShowTab(this,'dtests')">🎲 Tests</button>
    <button onclick="mjDiceShowTab(this,'dattacks')">⚔ Attaques${attacks.length?' ('+attacks.length+')':''}</button>
    <button onclick="mjDiceShowTab(this,'dspells')">✦ Sorts${spells.length?' ('+spells.length+')':''}</button>
    <button onclick="mjDiceShowTab(this,'dtraits')">📜 Traits${traits.length?' ('+traits.length+')':''}</button>
  </div>
  <div id="dtests">
    <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Caractéristiques</div>
    <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:4px;margin-bottom:12px">
      ${AB.map((a,i)=>makeBtn(a,mods[i],'mjCombatRoll')).join('')}
    </div>
    <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Jets de sauvegarde</div>
    <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:4px;margin-bottom:12px">
      ${AB.map((a,i)=>makeBtn('JS '+a,mods[i],'mjCombatRoll')).join('')}
    </div>
    <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Dés libres</div>
    <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:4px">
      ${['d4','d6','d8','d10','d12','d20','d100'].map(d=>`<button class="btn" style="padding:5px 9px;font-size:12px" onclick="mjCombatRollFree(${idx},'${d}')">${d}</button>`).join('')}
    </div>
  </div>
  <div id="dattacks" style="display:none">${attacksHtml}</div>
  <div id="dspells" style="display:none">${spellsHtml}</div>
  <div id="dtraits" style="display:none">${traitsHtml}</div>
  <div id="mjDiceResult" style="display:none;padding:10px;background:var(--surface2);border-radius:8px;margin-top:10px;margin-bottom:6px"></div>
  <div style="text-align:right;margin-top:8px"><button class="btn bsm" onclick="closeModal()">Fermer</button></div>`);
}

function mjDiceShowTab(btn,tabId){
  btn.closest('.journal-subtab').querySelectorAll('button').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  ['dtests','dattacks','dspells','dtraits'].forEach(id=>{
    const el=document.getElementById(id);if(el)el.style.display=id===tabId?'block':'none';
  });
  const res=document.getElementById('mjDiceResult');if(res)res.style.display='none';
}
function mjCombatRoll(idx,label,bonus){
  const c=_mjCombatants[idx];if(!c)return;
  const r=Math.ceil(Math.random()*20);
  const total=r+bonus;
  const isCrit=r===20;const isFumble=r===1;
  const col=isCrit?'#ffd54f':isFumble?'#e53935':'var(--cp)';
  const el=document.getElementById('mjDiceResult');
  if(el){el.style.display='block';el.innerHTML=`<strong>${esc(c.name)}</strong> — ${label}<br>d20(${r}) ${fmt(bonus)} = <span style="font-size:20px;color:${col}">${total}</span>${isCrit?' 🎉 CRITIQUE!':isFumble?' 💀 FUMBLE!':''}`;}
  _mjCombatLog.push(`🎲 ${esc(c.name)} ${label} : ${r}${bonus?fmt(bonus):''} = <b>${total}</b>${isCrit?' 🎉':isFumble?' 💀':''}`);
}
function mjCombatAtkRoll(idx){
  const c=_mjCombatants[idx];if(!c)return;
  const bonus=parseInt(document.getElementById('mjAtkBonus')?.value)||0;
  mjCombatRoll(idx,'Attaque',bonus);
}

function mjRollAttack(cIdx,aIdx){
  const c=_mjCombatants[cIdx];if(!c)return;
  const a=(c.attacks||[])[aIdx];if(!a)return;
  const r=Math.ceil(Math.random()*20);
  const atkBonus=parseInt(a.atkBonus)||0;
  const total=r+atkBonus;
  const isCrit=r===20;const isFumble=r===1;
  const col=isCrit?'#ffd54f':isFumble?'#e53935':'var(--cp)';
  let dmgHtml='';let logDmg='';
  if(a.dmgDice){
    const parts=(a.dmgDice+'').toLowerCase().split('d');
    const dq=parseInt(parts[0])||1;const ds=parseInt(parts[1])||6;
    const numDice=isCrit?dq*2:dq;
    const rolls=[];for(let i=0;i<numDice;i++)rolls.push(Math.ceil(Math.random()*ds));
    const dmgBonus=parseInt(a.dmgBonus)||0;
    const totalDmg=rolls.reduce((s,v)=>s+v,0)+dmgBonus;
    dmgHtml=`<div style="font-size:13px;margin-top:8px;padding-top:8px;border-top:1px solid var(--border)">Dégâts : <span style="color:var(--text2)">${rolls.join('+')}${dmgBonus?fmt(dmgBonus):''}</span> = <b style="color:var(--cp);font-size:16px">${totalDmg}</b> <span style="font-size:11px;color:var(--text3)">${esc(a.dmgType||'')}${isCrit?' (critique — dés doublés)':''}</span></div>`;
    logDmg=` / ${totalDmg} dégâts ${a.dmgType||''}${isCrit?' 🎉':''}`;
  }
  const el=document.getElementById('mjDiceResult');
  if(el){el.style.display='block';el.innerHTML=`<div style="font-size:12px;color:var(--text3);margin-bottom:4px">${esc(c.name)} — ${esc(a.name)}</div><div>d20(${r})${fmt(atkBonus)} = <span style="font-size:22px;color:${col};font-weight:800">${total}</span>${isCrit?' 🎉 CRITIQUE!':isFumble?' 💀 FUMBLE!':''}</div>${dmgHtml}`;}
  _mjCombatLog.push(`⚔ ${esc(c.name)} — ${esc(a.name)} : att.=${r}${fmt(atkBonus)}=<b>${total}</b>${isCrit?' 🎉':isFumble?' 💀':''}${logDmg}`);
}

function mjRollSpell(cIdx,sIdx){
  const c=_mjCombatants[cIdx];if(!c)return;
  const s=(c.spells||[])[sIdx];if(!s)return;
  let dmgHtml='';let logDmg='';
  if(s.dmgDice){
    const parts=(s.dmgDice+'').toLowerCase().split('d');
    const dq=parseInt(parts[0])||1;const ds=parseInt(parts[1])||6;
    const rolls=[];for(let i=0;i<dq;i++)rolls.push(Math.ceil(Math.random()*ds));
    const totalDmg=rolls.reduce((sum,v)=>sum+v,0);
    dmgHtml=`<div style="font-size:13px;margin-top:6px">Dégâts : <span style="color:var(--text2)">${rolls.join('+')}</span> = <b style="color:var(--cp);font-size:16px">${totalDmg}</b> <span style="font-size:11px;color:var(--text3)">${esc(s.dmgType||'')}</span></div>`;
    logDmg=` / ${totalDmg} dégâts ${s.dmgType||''}`;
  }
  const others=_mjCombatants.filter((_,i)=>i!==cIdx);
  const saveTargetsHtml=s.saveStat&&s.saveDC&&others.length?`<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border)"><div style="font-size:11px;color:var(--text3);margin-bottom:5px">🎯 Lancer le JS ${esc(s.saveStat)} DD${s.saveDC} pour :</div><div style="display:flex;flex-wrap:wrap;gap:4px">${others.map(oc=>`<button class="btn bsm" style="font-size:10px" onclick="mjRollSaveFor(${_mjCombatants.indexOf(oc)},${cIdx},${sIdx})">${esc(oc.name)}</button>`).join('')}</div></div>`:'';
  const el=document.getElementById('mjDiceResult');
  if(el){el.style.display='block';el.innerHTML=`<div style="font-size:12px;color:var(--text3);margin-bottom:4px">${esc(c.name)} — ${esc(s.name)}</div>${s.saveStat&&s.saveDC?`<div style="font-size:14px;margin-bottom:4px">JS <b>${esc(s.saveStat)}</b> DD <span style="font-size:22px;color:var(--cp);font-weight:800">${s.saveDC}</span></div>`:''}${dmgHtml||'<div style="color:var(--text3);font-size:12px">Sort d\'effet — pas de jets de dégâts</div>'}${saveTargetsHtml}`;}
  _mjCombatLog.push(`✦ ${esc(c.name)} — ${esc(s.name)}${s.saveDC?` DD${s.saveDC} ${s.saveStat}`:''}${logDmg}`);
}
const _SAVE_IDX={FOR:0,STR:0,DEX:1,CON:2,INT:3,SAG:4,WIS:4,CHA:5};
function mjRollSaveFor(targetIdx,casterIdx,spellIdx){
  const target=_mjCombatants[targetIdx];if(!target)return;
  const caster=_mjCombatants[casterIdx];if(!caster)return;
  const spell=(caster.spells||[])[spellIdx];if(!spell)return;
  const statIdx=_SAVE_IDX[(spell.saveStat||'').toUpperCase()]??-1;
  const abilityVal=(target.abilities&&statIdx>=0&&target.abilities[statIdx]!==undefined)?target.abilities[statIdx]:10;
  const mod=Math.floor((abilityVal-10)/2);
  const d20=Math.ceil(Math.random()*20);
  const total=d20+mod;
  const success=total>=spell.saveDC;
  const el=document.getElementById('mjDiceResult');
  if(el){el.innerHTML+=`<div style="margin-top:6px;padding-top:6px;border-top:1px solid var(--border);font-size:12px"><b>${esc(target.name)}</b> JS ${esc(spell.saveStat||'')} : d20(${d20})${mod>=0?'+':''}${mod} = <b style="color:${success?'#4caf50':'#e53935'};font-size:15px">${total}</b> ${success?'✅ Réussite':'❌ Échec'}</div>`;}
  _mjCombatLog.push(`🎯 JS ${esc(spell.saveStat||'')} DD${spell.saveDC} — ${esc(target.name)} : ${total} (${success?'Réussite':'Échec'})`);
}

function mjOpenEditMonster(idx){
  const c=_mjCombatants[idx];if(!c)return;
  _mjNewMonsterAttacks=(c.attacks||[]).map(a=>({...a}));
  _mjNewMonsterSpells=(c.spells||[]).map(s=>({...s}));
  _mjNewMonsterTraits=(c.traits||[]).map(t=>({...t}));
  _mjEditingMonsterIdx=idx;
  openWideModal(`<div class="pt">✏ Éditer — ${esc(c.name)}</div>
    <div class="g2" style="gap:8px;margin-bottom:16px">
      <div><div class="fl mb6">PV actuels</div><input class="fi" id="mEd_hp" type="number" value="${c.hp}"></div>
      <div><div class="fl mb6">PV max</div><input class="fi" id="mEd_hpMax" type="number" value="${c.hpMax}"></div>
      <div><div class="fl mb6">CA</div><input class="fi" id="mEd_ac" type="number" value="${c.ac}"></div>
    </div>
    <div style="border-top:1px solid var(--border);padding-top:12px;margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">⚔ Attaques</div>
        <button class="btn bsm" onclick="mjToggleMonsterSubForm('mEdAttForm')">+ Ajouter</button>
      </div>
      <div id="mEdAttForm" style="display:none;background:var(--surface2);border-radius:8px;padding:10px;margin-bottom:8px">
        <input class="fi" id="mAtt_name" placeholder="Nom (ex: Cimeterre)" style="margin-bottom:6px">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:6px">
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Bonus att.</div><input class="fi" id="mAtt_bonus" type="number" value="0"></div>
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Dés dégâts</div><input class="fi" id="mAtt_dice" value="1d6"></div>
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Bonus dégâts</div><input class="fi" id="mAtt_dmgBonus" type="number" value="0"></div>
        </div>
        <div class="g2" style="gap:6px;margin-bottom:8px">
          <div><input class="fi" id="mAtt_type" placeholder="Type dégâts"></div>
          <div><input class="fi" id="mAtt_range" placeholder="Portée (optionnel)"></div>
        </div>
        <button class="btn bac bsm" style="width:100%" onclick="mjConfirmAddFormAttack()">✓ Confirmer</button>
      </div>
      <div id="mEd_attacksList"></div>
    </div>
    <div style="border-top:1px solid var(--border);padding-top:12px;margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">✦ Sorts & Pouvoirs</div>
        <button class="btn bsm" onclick="mjToggleMonsterSubForm('mEdSpForm')">+ Ajouter</button>
      </div>
      <div id="mEdSpForm" style="display:none;background:var(--surface2);border-radius:8px;padding:10px;margin-bottom:8px">
        <div style="position:relative;margin-bottom:8px">
          <input class="fi" id="mjSpSearchQ" placeholder="🔍 Chercher dans le compendium..." oninput="_mjSpellSearch(this.value)" onfocus="_mjSpellSearch(this.value)" autocomplete="off" onblur="setTimeout(()=>{const r=document.getElementById('mjSpSearchRes');if(r)r.style.display='none';},150)">
          <div id="mjSpSearchRes" style="display:none;position:absolute;top:100%;left:0;right:0;z-index:200;background:var(--surface);border:1px solid rgba(200,168,75,.4);border-radius:0 0 6px 6px;max-height:200px;overflow-y:auto;box-shadow:0 4px 16px rgba(0,0,0,.5)"></div>
        </div>
        <input class="fi" id="mSp_name" placeholder="Nom du sort" style="margin-bottom:6px">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:6px">
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Niveau</div><input class="fi" id="mSp_level" type="number" value="1" min="0"></div>
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Stat save</div><input class="fi" id="mSp_saveStat" placeholder="DEX"></div>
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">DD save</div><input class="fi" id="mSp_saveDC" type="number" value="13"></div>
        </div>
        <div class="g2" style="gap:6px;margin-bottom:6px">
          <div><input class="fi" id="mSp_dice" placeholder="Dés (ex: 8d6)"></div>
          <div><input class="fi" id="mSp_type" placeholder="Type dégâts"></div>
        </div>
        <textarea class="fi" id="mSp_desc" rows="2" placeholder="Description..." style="resize:vertical;margin-bottom:8px"></textarea>
        <button class="btn bac bsm" style="width:100%" onclick="mjConfirmAddFormSpell()">✓ Confirmer</button>
      </div>
      <div id="mEd_spellsList"></div>
    </div>
    <div style="border-top:1px solid var(--border);padding-top:12px;margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">📜 Traits & Capacités</div>
        <button class="btn bsm" onclick="mjToggleMonsterSubForm('mEdTrForm')">+ Ajouter</button>
      </div>
      <div id="mEdTrForm" style="display:none;background:var(--surface2);border-radius:8px;padding:10px;margin-bottom:8px">
        <input class="fi" id="mTr_name" placeholder="Nom du trait" style="margin-bottom:6px">
        <textarea class="fi" id="mTr_desc" rows="2" placeholder="Description..." style="resize:vertical;margin-bottom:6px"></textarea>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px">
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Charges (0=passif)</div><input class="fi" id="mTr_uses" type="number" min="0" value="0"></div>
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Récupération</div><select class="fi" id="mTr_recovery"><option value="passive">Passif</option><option value="short">Repos court</option><option value="long">Repos long</option></select></div>
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Dé (ex: 2d6+3)</div><input class="fi" id="mTr_dice" placeholder="2d6+3"></div>
        </div>
        <button class="btn bac bsm" style="width:100%" onclick="mjConfirmAddFormTrait()">✓ Confirmer</button>
      </div>
      <div id="mEd_traitsList"></div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="mjSaveEditMonster()">💾 Sauvegarder</button>
    </div>`);
  mjRenderAttacksList();mjRenderSpellsList();mjRenderTraitsList();
}

function mjSaveEditMonster(){
  const idx=_mjEditingMonsterIdx;
  const c=_mjCombatants[idx];if(!c)return;
  const hpMax=parseInt(document.getElementById('mEd_hpMax')?.value)||c.hpMax;
  const hp=Math.min(parseInt(document.getElementById('mEd_hp')?.value)||c.hp,hpMax);
  const ac=parseInt(document.getElementById('mEd_ac')?.value)||c.ac;
  c.hp=hp;c.hpMax=hpMax;c.ac=ac;
  c.attacks=[..._mjNewMonsterAttacks];
  c.spells=[..._mjNewMonsterSpells];
  c.traits=[..._mjNewMonsterTraits];
  _mjNewMonsterAttacks=[];_mjNewMonsterSpells=[];_mjNewMonsterTraits=[];_mjEditingMonsterIdx=-1;
  _mjCombatLog.push(`✏ ${esc(c.name)} modifié.`);
  closeModal();renderMJContent();
}
function mjCombatRollFree(idx,d){
  const c=_mjCombatants[idx];if(!c)return;
  const n=parseInt(d.replace('d',''));
  const r=Math.ceil(Math.random()*n);
  const isCrit=r===n&&n>4;const isFumble=r===1&&n>4;
  const el=document.getElementById('mjDiceResult');
  if(el){el.style.display='block';el.innerHTML=`<strong>${esc(c.name)}</strong> — ${d}<br><span style="font-size:20px">${r}</span>${isCrit?' 🎉':isFumble?' 💀':''}`;}
  _mjCombatLog.push(`🎲 ${esc(c.name)} ${d} : <b>${r}</b>${isCrit?' 🎉':isFumble?' 💀':''}`);
}

function mjRemoveCombatant(idx){
  const name=_mjCombatants[idx]?.name||'?';
  if(!confirm(`Retirer "${name}" du combat ?`))return;
  _mjCombatants.splice(idx,1);
  _mjCombatLog.push(`✕ ${esc(name)} retiré du combat.`);
  if(_mjCurrentTurn>=_mjCombatants.length&&_mjCurrentTurn>0)_mjCurrentTurn--;
  renderMJContent();
}

let _mjHpSyncTimers={};
function _mjSyncPlayerHp(c){
  if(!c.isPlayer||!c.uid||!currentCampaignId)return;
  clearTimeout(_mjHpSyncTimers[c.uid]);
  _mjHpSyncTimers[c.uid]=setTimeout(async()=>{
    try{
      const pp=_mjPlayersData.find(p=>p.docId===c.uid+'_'+currentCampaignId||p.charData?.uid===c.uid);
      const inWs=pp&&pp.charData&&pp.charData.wildshape?.active;
      if(inWs){
        // Le joueur est en forme animale — syncer les PV de la bête
        const overflow=Math.max(0,c.hp<0?-c.hp:0);
        const beastHp=Math.max(0,c.hp);
        const update={'characterData.wildshape.beast.hpCur':beastHp};
        if(beastHp<=0){
          // La bête tombe — déclencher le retour à la forme druide
          const savedHp=Math.max(0,(pp.charData.wildshape.savedHp||0)-overflow);
          Object.assign(update,{'characterData.hp':savedHp,'characterData.wildshape':firebase.firestore.FieldValue.delete()});
        }
        await fbDb.collection('characters').doc(c.uid+'_'+currentCampaignId).update(update);
        c.hpMax=inWs?pp.charData.wildshape.beast.hpMax:c.hpMax;
      } else {
        await fbDb.collection('characters').doc(c.uid+'_'+currentCampaignId).update({'characterData.hp':c.hp,'characterData.hpMax':c.hpMax});
      }
    }
    catch(e){}
    delete _mjHpSyncTimers[c.uid];
  },800);
}
function mjHpChange(idx,dir){
  const c=_mjCombatants[idx];if(!c)return;
  c.hp=Math.max(0,Math.min(c.hpMax,c.hp+dir));
  if(c.hp===0)_mjCombatLog.push(`💀 ${esc(c.name)} tombe à 0 PV !`);
  _mjSyncPlayerHp(c);
  renderMJContent();
}

function mjOpenHpModal(idx){
  const c=_mjCombatants[idx];if(!c)return;
  openModal(`<div class="pt">❤ PV — ${esc(c.name)}</div>
    <div style="text-align:center;font-size:22px;font-weight:700;color:var(--cp);margin-bottom:12px">${c.hp} / ${c.hpMax}</div>
    <div class="g2" style="gap:8px;margin-bottom:16px">
      <div><div class="fl mb6">Soins (+PV)</div><input class="fi" id="hpModal_heal" type="number" min="0" placeholder="0"></div>
      <div><div class="fl mb6">Dégâts (−PV)</div><input class="fi" id="hpModal_dmg" type="number" min="0" placeholder="0"></div>
    </div>
    <div><div class="fl mb6">Définir PV max</div><input class="fi" id="hpModal_max" type="number" min="1" value="${c.hpMax}" style="margin-bottom:16px"></div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="mjApplyHpModal(${idx})">Appliquer</button>
    </div>`);
}

function mjApplyHpModal(idx){
  const c=_mjCombatants[idx];if(!c)return;
  const heal=parseInt(document.getElementById('hpModal_heal').value)||0;
  const dmg=parseInt(document.getElementById('hpModal_dmg').value)||0;
  const newMax=parseInt(document.getElementById('hpModal_max').value)||c.hpMax;
  c.hpMax=newMax;
  c.hp=Math.max(0,Math.min(c.hpMax,c.hp+heal-dmg));
  if(heal) _mjCombatLog.push(`💚 ${esc(c.name)} soigné de ${heal} PV (→ ${c.hp}/${c.hpMax})`);
  if(dmg) _mjCombatLog.push(`🗡 ${esc(c.name)} subit ${dmg} dégâts (→ ${c.hp}/${c.hpMax})`);
  if(c.hp===0)_mjCombatLog.push(`💀 ${esc(c.name)} tombe à 0 PV !`);
  _mjSyncPlayerHp(c);
  closeModal();renderMJContent();
}

const MJ_CONDITIONS=[
  {n:'Aveuglé',d:'Ne peut pas voir. Attaques contre lui : avantage. Ses attaques : désavantage.'},
  {n:'Charmé',d:'Ne peut pas attaquer le charmeur. Le charmeur a avantage aux interactions sociales.'},
  {n:'Assourdi',d:'Ne peut pas entendre. Échoue automatiquement les JS liés à l\'ouïe.'},
  {n:'Épouvanté',d:'Désavantage aux jets d\'attaque et caractéristiques si la source de peur est visible.'},
  {n:'Agrippé',d:'Vitesse = 0. Condition retirée si hors de portée ou si incapacité.'},
  {n:'Neutralisé',d:'Ne peut pas effectuer d\'actions ni de réactions.'},
  {n:'Invisible',d:'Impossible à voir sans magie. Attaques contre lui : désavantage. Ses attaques : avantage.'},
  {n:'Paralysé',d:'Neutralisé, ne peut bouger/parler. Attaques au corps à corps = coup critique automatique à moins de 1,5m.'},
  {n:'Pétrifié',d:'Transformé en pierre. Neutralisé, résistance à tous les dégâts, immunité poison/maladie.'},
  {n:'Empoisonné',d:'Désavantage aux jets d\'attaque et de caractéristique.'},
  {n:'À terre',d:'Se relever coûte la moitié de la vitesse. Attaques au corps à corps contre lui : avantage. À distance : désavantage.'},
  {n:'Entravé',d:'Vitesse = 0. Attaques contre lui : avantage. Ses attaques : désavantage. JS DEX : désavantage.'},
  {n:'Étourdi',d:'Neutralisé, ne peut bouger. Attaques contre lui : avantage. Échoue automatiquement JS FOR/DEX.'},
  {n:'Inconscient',d:'Neutralisé, tombe à terre, lâche tout. Attaques contre lui : avantage. Coup critique au corps à corps < 1,5m.'},
  {n:'Épuisé',d:'Malus selon le niveau (1→désavantage jets compétences, 3→vitesse divisée par 2, 5→vitesse 0, 6→mort).'},
  {n:'Concentration',d:'Le lanceur est en concentration. Un coup peut rompre la concentration (JS CON DD 10 ou moitié des dégâts).'},
];

function mjEditInitiative(idx){
  const c=_mjCombatants[idx];if(!c)return;
  openModal(`<div class="pt">🎲 Initiative — ${esc(c.name)}</div>
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
      <div style="flex:1"><div class="fl mb6">Valeur (dé + mod)</div><input class="fi" id="initInput" type="number" value="${c.initiative||0}" style="font-size:20px;text-align:center"></div>
      <button class="btn bsm" style="margin-top:18px;border-color:#ffd54f;color:#ffd54f" onclick="mjRerollInitiative(${idx})">🎲 Relancer</button>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="_mjConfirmInitiative(${idx})">✓ Confirmer</button>
    </div>`);
  setTimeout(()=>{const el=document.getElementById('initInput');if(el){el.focus();el.select();}},50);
}
function _mjConfirmInitiative(idx){
  const c=_mjCombatants[idx];if(!c)return;
  const val=parseInt(document.getElementById('initInput')?.value)||0;
  c.initiative=val;
  closeModal();renderMJContent();
}
function mjRerollInitiative(idx){
  const c=_mjCombatants[idx];if(!c)return;
  c.initiative=Math.ceil(Math.random()*20)+(c.dexMod||0);
  _mjCombatLog.push(`🎲 ${esc(c.name)} relance l'initiative : ${c.initiative}`);
  closeModal();renderMJContent();
}

function mjOpenCondModal(idx){
  const c=_mjCombatants[idx];if(!c)return;
  const current=c.conditions||[];
  openWideModal(`<div class="pt">⚠ Conditions — ${esc(c.name)}</div>
    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:4px">
      ${MJ_CONDITIONS.map((cd,mi)=>`<span class="cond-pill${current.includes(cd.n)?' on':''}" title="${esc(cd.d)}" onclick="mjToggleCond(${idx},${mi},this)">${cd.n}</span>`).join('')}
    </div>
    <div id="condDesc" style="min-height:28px;font-size:11px;color:var(--text3);font-style:italic;padding:4px 2px;margin-bottom:10px">Survolez une condition pour voir sa description.</div>
    <div class="fl mb6">Condition personnalisée</div>
    <div style="display:flex;gap:6px;margin-bottom:14px">
      <input class="fi" id="condCustom" placeholder="Ex: Maudit, Béni, Rage..." style="flex:1">
      <button class="btn bsm" onclick="mjAddCustomCond(${idx})">Ajouter</button>
    </div>
    <div style="display:flex;justify-content:flex-end"><button class="btn bac" onclick="closeModal();renderMJContent()">Fermer</button></div>`);
  // Hover descriptions
  setTimeout(()=>{document.querySelectorAll('.cond-pill[title]').forEach(el=>{el.addEventListener('mouseenter',()=>{const d=document.getElementById('condDesc');if(d)d.textContent=el.title;});el.addEventListener('mouseleave',()=>{const d=document.getElementById('condDesc');if(d)d.textContent='Survolez une condition pour voir sa description.';});});},0);
}

function mjToggleCond(idx,cdOrIdx,el){
  const c=_mjCombatants[idx];if(!c)return;
  if(!c.conditions)c.conditions=[];
  const cd=typeof cdOrIdx==='number'?(MJ_CONDITIONS[cdOrIdx]?.n||''):cdOrIdx;
  if(!cd)return;
  const i=c.conditions.indexOf(cd);
  if(i>=0){c.conditions.splice(i,1);el.classList.remove('on');}
  else{c.conditions.push(cd);el.classList.add('on');}
}

function mjAddCustomCond(idx){
  const c=_mjCombatants[idx];if(!c)return;
  const val=(document.getElementById('condCustom').value||'').trim();
  if(!val)return;
  if(!c.conditions)c.conditions=[];
  c.conditions.push(val);
  document.getElementById('condCustom').value='';
  showToast(`✅ Condition "${val}" ajoutée.`);
}

function mjRemoveCond(idx,condIdx){
  const c=_mjCombatants[idx];if(!c||!c.conditions)return;
  c.conditions.splice(condIdx,1);
  renderMJContent();
}

// ─────────────────────────────────────────
// TAB PNJ / MONSTRES
// ─────────────────────────────────────────
function mjTabPNJ(){
  const sel=_mjSelectedNPC;
  const detail=sel!=null&&_mjNPCs[sel]?mjNPCDetail(_mjNPCs[sel],sel):'<div style="color:var(--text3);font-size:12px;font-style:italic;text-align:center;padding:20px">Sélectionnez un PNJ ou créez-en un nouveau.</div>';
  const list=_mjNPCs.length?_mjNPCs.map((n,i)=>`<div class="pnj-card${i===sel?' pnj-selected':''}" onclick="mjSelectNPC(${i})">
    <div style="display:flex;align-items:center;justify-content:space-between">
      <div>
        <div style="font-size:13px;font-weight:600;color:var(--text)">${esc(n.name||'?')}</div>
        <div style="font-size:11px;color:var(--text3)">${esc(n.type||'PNJ')} ${n.cr?'— CR '+n.cr:''} — PV ${n.hp||0} — CA ${n.ac||0}</div>
      </div>
      <div style="display:flex;gap:4px">
        <button class="btn bsm bprimary" onclick="event.stopPropagation();mjAddNPCToCombat(${i})">⚡</button>
        <button class="btn bsm" style="color:#e53935;border-color:#e53935" onclick="event.stopPropagation();mjDeleteNPC(${i})">✕</button>
      </div>
    </div>
  </div>`).join(''):`<div style="color:var(--text3);font-size:12px;font-style:italic;padding:8px 0">Aucun PNJ sauvegardé.</div>`;

  return`<div style="display:grid;grid-template-columns:280px 1fr;gap:12px">
    <div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div class="pt" style="margin-bottom:0;padding-bottom:0;border-bottom:none">PNJ sauvegardés</div>
        <div style="display:flex;gap:4px">
          <button class="btn bsm bprimary" onclick="mjNewNPC()">+ PNJ</button>
          <button class="btn bsm" style="color:#9c27b0;border-color:rgba(156,39,176,.5)" onclick="mjOpenSidekickForm()">🤝 Comparse</button>
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
  const attHtml=attacks.length?`<div style="margin-bottom:8px"><div class="fl mb6">⚔ Attaques</div>${attacks.map(a=>`<div style="font-size:12px;padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px"><span style="font-weight:600">${esc(a.name)}</span><span style="color:var(--text3)"> · +${a.atkBonus||0} · ${a.dmgDice||'1d6'}${a.dmgBonus?'+'+(a.dmgBonus):''}${a.dmgType?' '+esc(a.dmgType):''}${a.range?' · '+esc(a.range):''}</span></div>`).join('')}</div>`:'';
  const spHtml=spells.length?`<div style="margin-bottom:8px"><div class="fl mb6">✦ Sorts & Pouvoirs</div>${spells.map(s=>`<div style="font-size:12px;padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px"><span style="font-weight:600">${esc(s.name)}</span>${s.level?` <span style="color:var(--text3)">Niv.${s.level}</span>`:''}${s.saveStat&&s.saveDC?` <span style="color:var(--text3)">· JS ${esc(s.saveStat)} DD${s.saveDC}</span>`:''}${s.dmgDice?` <span style="color:var(--text3)">· ${esc(s.dmgDice)}${s.dmgType?' '+esc(s.dmgType):''}</span>`:''}${s.desc?`<div style="color:var(--text2);font-size:11px;margin-top:2px">${esc(s.desc)}</div>`:''}</div>`).join('')}</div>`:'';
  const trHtml=traits.length?`<div style="margin-bottom:8px"><div class="fl mb6">📜 Traits & Capacités</div>${traits.map(t=>`<div style="font-size:12px;padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px"><div style="font-weight:600">${esc(t.name)}</div>${t.desc?`<div style="color:var(--text2);font-size:11px;margin-top:2px">${esc(t.desc)}</div>`:''}</div>`).join('')}</div>`:'';
  const oldAttHtml=typeof n.attacks==='string'&&n.attacks?`<div style="margin-bottom:8px"><div class="fl mb6">Attaques</div><div style="font-size:12px;color:var(--text2);background:var(--surface2);border-radius:6px;padding:8px;white-space:pre-wrap">${esc(n.attacks)}</div></div>`:'';
  return`<div class="panel">
    <div class="pt">${esc(n.name||'?')} <span style="font-size:11px;color:var(--text3);font-family:var(--B)">${esc(n.type||'PNJ')}</span></div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">
      ${n.cr?`<div style="background:var(--surface2);border-radius:6px;padding:6px 10px;text-align:center;min-width:50px"><div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em">Difficulté</div><div style="font-size:15px;font-weight:600;color:var(--cp)">${esc(n.cr)}</div></div>`:''}
      <div style="background:var(--surface2);border-radius:6px;padding:6px 10px;text-align:center;min-width:50px"><div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em">PV</div><div style="font-size:15px;font-weight:600;color:#4caf50">${n.hp||0}</div></div>
      <div style="background:var(--surface2);border-radius:6px;padding:6px 10px;text-align:center;min-width:50px"><div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em">CA</div><div style="font-size:15px;font-weight:600">${n.ac||0}</div></div>
      ${n.speed?`<div style="background:var(--surface2);border-radius:6px;padding:6px 10px;text-align:center;min-width:50px"><div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em">Vitesse</div><div style="font-size:13px;font-weight:600">${esc(n.speed)}</div></div>`:''}
    </div>
    ${abHtml}${oldAttHtml}${attHtml}${spHtml}${trHtml}
    ${n.notes?`<div style="margin-bottom:10px"><div class="fl mb6">Notes</div><div style="font-size:12px;color:var(--text2);white-space:pre-wrap;background:var(--surface2);border-radius:6px;padding:8px">${esc(n.notes)}</div></div>`:''}
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      <button class="btn bsm bprimary" onclick="mjAddNPCToCombat(${i})">⚡ Ajouter au combat</button>
      <button class="btn bsm" onclick="mjEditNPC(${i})">✏ Modifier</button>
      <button class="btn bsm" onclick="mjDuplicateNPC(${i})">📋 Dupliquer</button>
      <button class="btn bsm" style="color:#e53935;border-color:#e53935" onclick="mjDeleteNPC(${i})">🗑 Supprimer</button>
    </div>
  </div>`;
}
async function mjDuplicateNPC(i){
  const n=_mjNPCs[i];if(!n)return;
  const clone={...n,name:(n.name||'PNJ')+' (copie)',attacks:JSON.parse(JSON.stringify(n.attacks||[])),spells:JSON.parse(JSON.stringify(n.spells||[])),traits:JSON.parse(JSON.stringify(n.traits||[]))};
  _mjNPCs.push(clone);_mjSelectedNPC=_mjNPCs.length-1;
  await saveMJData();showToast('📋 PNJ dupliqué !');renderMJContent();
}

function mjNewNPC(){
  mjOpenNPCForm(null);
}
function mjEditNPC(i){
  mjOpenNPCForm(i);
}

function mjOpenNPCForm(editIdx){
  const n=editIdx!=null?(_mjNPCs[editIdx]||{}):{};
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
          ${['Monstre','PNJ','Garde','Marchand','Boss','Allié','Autre'].map(t=>`<option${(n.type||'PNJ')===t?' selected':''}>${t}</option>`).join('')}
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
          ${['Très Petite','Petite','Moyenne','Grande','Très Grande','Gigantesque'].map(s=>`<option${(n.size||'Moyenne')===s?' selected':''}>${s}</option>`).join('')}
        </select>
      </div>
      <div>
        <div class="fl mb6">Difficulté (CR)</div>
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
        <div style="font-size:12px;font-weight:700;color:var(--text2)">⚔ Attaques</div>
        <button class="btn bsm" onclick="mjToggleMonsterSubForm('mAttForm')">+ Ajouter</button>
      </div>
      <div id="mAttForm" style="display:none;background:var(--surface2);border-radius:8px;padding:10px;margin-bottom:8px">
        <input class="fi" id="mAtt_name" placeholder="Nom (ex: Cimeterre, Arc court...)" style="margin-bottom:6px">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:6px">
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Bonus attaque</div><input class="fi" id="mAtt_bonus" type="number" value="0"></div>
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Dés de dégâts</div><input class="fi" id="mAtt_dice" placeholder="1d6" value="1d6"></div>
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Bonus dégâts</div><input class="fi" id="mAtt_dmgBonus" type="number" value="0"></div>
        </div>
        <div class="g2" style="gap:6px;margin-bottom:8px">
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Type de dégâts</div><input class="fi" id="mAtt_type" placeholder="tranchant, feu..."></div>
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Portée (optionnel)</div><input class="fi" id="mAtt_range" placeholder="1.5m / 18/72m"></div>
        </div>
        <button class="btn bac bsm" style="width:100%" onclick="mjConfirmAddFormAttack()">✓ Confirmer cette attaque</button>
      </div>
      <div id="mAdd_attacksList"></div>
    </div>
    <div style="border-top:1px solid var(--border);padding-top:12px;margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">✦ Sorts & Pouvoirs</div>
        <button class="btn bsm" onclick="mjToggleMonsterSubForm('mSpForm')">+ Ajouter</button>
      </div>
      <div id="mSpForm" style="display:none;background:var(--surface2);border-radius:8px;padding:10px;margin-bottom:8px">
        <div style="position:relative;margin-bottom:8px">
          <input class="fi" id="mjSpSearchQ" placeholder="🔍 Chercher dans le compendium..." oninput="_mjSpellSearch(this.value)" onfocus="_mjSpellSearch(this.value)" autocomplete="off" onblur="setTimeout(()=>{const r=document.getElementById('mjSpSearchRes');if(r)r.style.display='none';},150)">
          <div id="mjSpSearchRes" style="display:none;position:absolute;top:100%;left:0;right:0;z-index:200;background:var(--surface);border:1px solid rgba(200,168,75,.4);border-radius:0 0 6px 6px;max-height:200px;overflow-y:auto;box-shadow:0 4px 16px rgba(0,0,0,.5)"></div>
        </div>
        <input class="fi" id="mSp_name" placeholder="Nom du sort (ex: Boule de feu)" style="margin-bottom:6px">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:6px">
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Niveau sort</div><input class="fi" id="mSp_level" type="number" value="1" min="0" max="9"></div>
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Stat sauvegarde</div><input class="fi" id="mSp_saveStat" placeholder="DEX, CON..."></div>
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">DD sauvegarde</div><input class="fi" id="mSp_saveDC" type="number" value="13" min="0"></div>
        </div>
        <div class="g2" style="gap:6px;margin-bottom:6px">
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Dés de dégâts</div><input class="fi" id="mSp_dice" placeholder="8d6, 2d8..."></div>
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Type de dégâts</div><input class="fi" id="mSp_type" placeholder="feu, foudre..."></div>
        </div>
        <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Description (optionnel)</div><textarea class="fi" id="mSp_desc" rows="2" placeholder="Zone 6m, chaque créature doit réussir un JS..." style="resize:vertical;margin-bottom:8px"></textarea></div>
        <button class="btn bac bsm" style="width:100%" onclick="mjConfirmAddFormSpell()">✓ Confirmer ce sort</button>
      </div>
      <div id="mAdd_spellsList"></div>
    </div>
    <div style="border-top:1px solid var(--border);padding-top:12px;margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">📜 Traits & Capacités passives</div>
        <button class="btn bsm" onclick="mjToggleMonsterSubForm('mTrForm')">+ Ajouter</button>
      </div>
      <div id="mTrForm" style="display:none;background:var(--surface2);border-radius:8px;padding:10px;margin-bottom:8px">
        <input class="fi" id="mTr_name" placeholder="Nom (ex: Vision dans le noir, Résistance au feu...)" style="margin-bottom:6px">
        <textarea class="fi" id="mTr_desc" rows="2" placeholder="Description du trait ou de la capacité..." style="resize:vertical;margin-bottom:6px"></textarea>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px">
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Charges (0=passif)</div><input class="fi" id="mTr_uses" type="number" min="0" value="0"></div>
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Récupération</div><select class="fi" id="mTr_recovery"><option value="passive">Passif</option><option value="short">Repos court</option><option value="long">Repos long</option></select></div>
          <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Dé (ex: 2d6+3)</div><input class="fi" id="mTr_dice" placeholder="2d6+3"></div>
        </div>
        <button class="btn bac bsm" style="width:100%" onclick="mjConfirmAddFormTrait()">✓ Confirmer ce trait</button>
      </div>
      <div id="mAdd_traitsList"></div>
    </div>
    <div class="fl mb6">Notes / Description</div>
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
    <div style="font-size:12px;color:var(--text3);margin-bottom:12px">Un comparse gagne des niveaux avec le groupe. Ses stats s'auto-remplissent.</div>
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
    <div id="sk_preview" style="background:var(--surface2);border-radius:8px;padding:10px;margin-bottom:16px;font-size:12px;color:var(--text2);min-height:60px"></div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="mjCreateSidekick()">🤝 Créer ce comparse</button>
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
    notes:`Comparse niveau ${lv} — ${SK_LABEL[type]||type}${subtypeLabel}`
  };
  _mjNPCs.push(npc);_mjSelectedNPC=_mjNPCs.length-1;
  await saveMJData();
  closeModal();showToast(`✅ Comparse "${name}" créé (niv. ${lv}) !`);renderMJContent();
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
  closeModal();showToast('✅ PNJ sauvegardé !');renderMJContent();
}

async function mjDeleteNPC(i){
  if(!confirm('Supprimer ce PNJ ?'))return;
  _mjNPCs.splice(i,1);
  if(_mjSelectedNPC===i)_mjSelectedNPC=null;
  else if(_mjSelectedNPC>i)_mjSelectedNPC--;
  await saveMJData();showToast('🗑 PNJ supprimé.');renderMJContent();
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
  _mjCombatLog.push(`🐉 "${esc(n.name||'PNJ')}" ajouté au combat.`);
  setMJTab('combat');showToast('✅ Ajouté au combat !');
}

// ─────────────────────────────────────────
// TAB OBJETS
// ─────────────────────────────────────────
function mjTabObjets(){
  const itemList=_mjObjets.length?_mjObjets.map((obj,i)=>{
    const ri=obj.rarity?RARITY_INFO[obj.rarity]:null;
    return`<div class="inv-item" style="flex-wrap:wrap;gap:6px">
    <div style="flex:1;min-width:0">
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
        <span style="font-size:13px;font-weight:600;color:var(--text)">${esc(obj.name||'?')}</span>
        ${ri?`<span style="font-size:10px;padding:1px 6px;border-radius:4px;background:${ri.color}22;color:${ri.color};border:1px solid ${ri.color}55">${obj.rarity}</span>`:''}
        ${obj.attunement?`<span style="font-size:10px;padding:1px 6px;border-radius:4px;background:rgba(156,39,176,.1);color:#9c27b0;border:1px solid rgba(156,39,176,.3)">🔗 Lien requis</span>`:''}
      </div>
      <div style="font-size:11px;color:var(--text3)">${esc(obj.type||'')}${ri?' · '+ri.level+' · '+ri.price:obj.value?' — '+obj.value+' po':''}</div>
      ${obj.desc?`<div style="font-size:11px;color:var(--text2);margin-top:2px">${esc(obj.desc)}</div>`:''}
    </div>
    <div style="display:flex;gap:4px;align-items:center">
      <button class="btn bsm bprimary" onclick="mjOpenGiveItem(${i})">🎁 Donner</button>
      <button class="btn bsm" style="color:#e53935;border-color:#e53935" onclick="mjDeleteItem(${i})">✕</button>
    </div>
  </div>`;}).join(''):`<div style="color:var(--text3);font-size:12px;font-style:italic;text-align:center;padding:16px">Aucun objet dans votre liste. Créez-en un ou cherchez dans le compendium.</div>`;

  const rarFilterBar=['','Commun','Peu commun','Rare','Très rare','Légendaire','Artefact'].map(r=>{
    const ri=r?RARITY_INFO[r]:null;
    const active=_encRarityFilter===r;
    const col=ri?ri.color:'var(--cp)';
    return`<button class="btn bsm" onclick="_encRarityFilter='${r}';renderMJContent();setTimeout(()=>mjFilterItems(document.getElementById('itemSearch')?document.getElementById('itemSearch').value:''),30)" style="font-size:10px;padding:2px 8px;${active?`background:${col};color:#fff;border-color:transparent`:`border-color:var(--border);color:var(--text2)`}">${r||'Tout'}</button>`;
  }).join('');

  const compSection=ITEMS_DB
    ?`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:12px">
        <div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:8px">📚 Compendium — ${ITEMS_DB.length.toLocaleString()} objets D&D 5e</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px">${rarFilterBar}</div>
        <input class="fi" id="itemSearch" placeholder="Chercher : Épée longue, Potion de soins, Anneau..." oninput="mjFilterItems(this.value)" onfocus="mjFilterItems(this.value)" style="margin-bottom:6px">
        <div id="itemResults" style="max-height:220px;overflow-y:auto"></div>
      </div>`
    :`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:12px;text-align:center">
        <div style="font-size:12px;color:var(--text3);margin-bottom:8px">Chargez le compendium pour ajouter des objets depuis la base D&amp;D 5e SRD.</div>
        <button class="btn bsm bprimary" onclick="loadItemsDB(()=>renderMJContent())">📚 Charger le compendium d'objets</button>
      </div>`;

  return`<div>
    ${compSection}
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <div class="pt" style="margin-bottom:0;padding-bottom:0;border-bottom:none;font-size:13px">💰 Inventaire du MJ</div>
      <button class="btn bsm bprimary" onclick="mjOpenNewItem()">+ Créer manuellement</button>
    </div>
    ${itemList}
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
  return`<span style="font-size:10px;padding:1px 6px;border-radius:4px;background:${ri.color}22;color:${ri.color};border:1px solid ${ri.color}55;white-space:nowrap">${rar}</span>`;
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
  items=items.slice(0,30);
  el.innerHTML=items.length?items.map(({i,it})=>{
    const rar=_mjGetRarity(it);
    const ri=rar?RARITY_INFO[rar]:null;
    return`<div class="charlib-item" style="padding:6px 8px;cursor:pointer;flex-direction:column;align-items:flex-start;gap:2px" onclick="mjAddItemFromCompendium(${i})">
      <div style="display:flex;align-items:center;gap:6px;width:100%">
        <span style="font-size:16px;flex-shrink:0">${_TYPE_ICON[it.t]||'📦'}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:600">${esc(it.n)}</div>
          <div style="font-size:11px;color:var(--text3)">${esc(it.d||'')}${it.mg?' ✨':''}</div>
        </div>
        <span style="color:var(--cp);font-size:11px;white-space:nowrap;flex-shrink:0">+ Ajouter</span>
      </div>
      ${rar?`<div style="display:flex;gap:6px;align-items:center;padding-left:22px">${_mjRarBadge(rar)}${ri?`<span style="font-size:10px;color:var(--text3)">${ri.level} · ${ri.price}</span>`:''}</div>`:''}
    </div>`;
  }).join(''):`<div style="font-size:12px;color:var(--text3);text-align:center;padding:8px">Aucun résultat${rarF?' pour la rareté "'+esc(rarF)+'"':q.trim()?' pour "'+esc(q)+'"':''}</div>`;
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
    <label style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text2);cursor:pointer;margin-bottom:16px">
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
    <div style="font-size:12px;color:var(--text2);margin-bottom:14px">Choisissez le joueur qui recevra cet objet dans son inventaire.</div>
    ${_mjPlayersData.map((pp,pi)=>`<div class="charlib-item" onclick="mjGiveItem(${itemIdx},${pi})">
      <span style="font-size:20px">${pp.avatar||'⚔'}</span>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:600">${esc(pp.charData&&pp.charData.charName||pp.playerName||'?')}</div>
        <div style="font-size:11px;color:var(--text3)">${esc(pp.playerName||'')}</div>
      </div>
      <span style="color:var(--cp);font-size:11px">Donner →</span>
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
function mjTabJournalScreen(){
  return tabJournalMJ(); // réutilise le rendu existant
}

// ─────────────────────────────────────────
// RÈGLES — DRAG & DROP
// ─────────────────────────────────────────
let _mjDragRuleId=null;
let _rulesCollapsed=JSON.parse(localStorage.getItem('mj_rules_collapsed')||'{}');
function toggleRuleSection(id){
  _rulesCollapsed[id]=!_rulesCollapsed[id];
  localStorage.setItem('mj_rules_collapsed',JSON.stringify(_rulesCollapsed));
  const body=document.getElementById('rsb_'+id);
  const chev=document.getElementById('rschev_'+id);
  if(body)body.style.display=_rulesCollapsed[id]?'none':'';
  if(chev)chev.style.transform=_rulesCollapsed[id]?'rotate(-90deg)':'rotate(0deg)';
}
const _mjRulesDefaultOrder=['s-actions','s-couverture','s-conditions','s-mort','s-armes-c','s-armes-g','s-armures','s-dc','s-modifs','s-multiclasse','s-incantation','s-repos','s-epuisement','s-voyage','s-dangers','s-rencontres','s-alterations','s-objets-mag','s-pieges','s-comparses','s-vie','s-temps-mort','s-packs','s-depart','s-services','s-magie-sauvage','s-compendium'];
function getMjRulesOrder(){try{const o=localStorage.getItem('mj_rules_order');if(o)return JSON.parse(o);}catch(e){}return _mjRulesDefaultOrder;}
function saveMjRulesOrder(){const c=document.getElementById('mjRulesContainer');if(!c)return;localStorage.setItem('mj_rules_order',JSON.stringify([...c.querySelectorAll(':scope>[data-ruleid]')].map(e=>e.dataset.ruleid)));}
function mjInitRulesDnD(){
  const c=document.getElementById('mjRulesContainer');if(!c)return;
  const order=getMjRulesOrder();
  const map={};c.querySelectorAll(':scope>[data-ruleid]').forEach(e=>map[e.dataset.ruleid]=e);
  // Applique l'ordre (sauvegardé ou par défaut), les nouvelles sections non listées restent à la fin
  order.forEach(id=>{if(map[id])c.appendChild(map[id]);});
}
function mjRuleDragStart(id,el){_mjDragRuleId=id;setTimeout(()=>el.classList.add('mj-dragging'),0);}
function mjRuleDragEnd(el){el.classList.remove('mj-dragging');document.querySelectorAll('.mj-drop-before,.mj-drop-after').forEach(x=>x.classList.remove('mj-drop-before','mj-drop-after'));}
function mjRuleDragOver(e,el){
  e.preventDefault();if(!_mjDragRuleId||el.dataset.ruleid===_mjDragRuleId)return;
  document.querySelectorAll('.mj-drop-before,.mj-drop-after').forEach(x=>x.classList.remove('mj-drop-before','mj-drop-after'));
  const r=el.getBoundingClientRect();el.classList.add(e.clientY<r.top+r.height/2?'mj-drop-before':'mj-drop-after');
}
function mjRuleDrop(e,targetId){
  e.preventDefault();if(!_mjDragRuleId||_mjDragRuleId===targetId)return;
  const c=document.getElementById('mjRulesContainer');
  const dragged=c.querySelector('[data-ruleid="'+_mjDragRuleId+'"]');
  const target=c.querySelector('[data-ruleid="'+targetId+'"]');
  if(!dragged||!target)return;
  c.insertBefore(dragged,target.classList.contains('mj-drop-before')?target:target.nextSibling);
  target.classList.remove('mj-drop-before','mj-drop-after');
  saveMjRulesOrder();_mjDragRuleId=null;
}

// ─────────────────────────────────────────
// TAB RÈGLES
// ─────────────────────────────────────────
function mjTabRegles(){
  function ds(id,html){return`<div class="mj-rules-section" data-ruleid="${id}" draggable="true" ondragstart="mjRuleDragStart('${id}',this)" ondragend="mjRuleDragEnd(this)" ondragover="mjRuleDragOver(event,this)" ondrop="mjRuleDrop(event,'${id}')">${html}</div>`;}
  function dh(id,title){const col=_rulesCollapsed[id];return`<div class="pt" style="display:flex;align-items:center;gap:6px;cursor:pointer;user-select:none" onclick="toggleRuleSection('${id}')"><span class="mj-drag-handle" title="Glisser pour réorganiser" onclick="event.stopPropagation()">⠿</span>${title}<span id="rschev_${id}" style="margin-left:auto;font-size:10px;color:var(--text3);transition:transform .2s${col?';transform:rotate(-90deg)':''}">▼</span></div>`;}
  function gh(id,label){const col=_rulesCollapsed[id];return`<div style="display:flex;align-items:center;gap:6px;padding:4px 0 8px;color:var(--text3);font-size:11px;cursor:pointer;user-select:none" onclick="toggleRuleSection('${id}')"><span class="mj-drag-handle" title="Glisser pour réorganiser" onclick="event.stopPropagation()">⠿</span>${label}<span id="rschev_${id}" style="margin-left:auto;font-size:10px;transition:transform .2s${col?';transform:rotate(-90deg)':''}">▼</span></div>`;}
  function rb(id,html){return`<div id="rsb_${id}"${_rulesCollapsed[id]?' style="display:none"':''}>${html}</div>`;}
  return`<div id="mjRulesContainer">
    ${ds('s-actions',`${gh('s-actions','⚔ Combat — Actions &amp; Initiative')}
    ${rb('s-actions',`<div class="g2" style="gap:10px">
      <div class="regles-section">
        <div class="pt">🎯 Actions disponibles</div>
        <table class="regles-table">
          <tr><th>Action</th><th>Description</th></tr>
          <tr><td><strong>Attaquer</strong></td><td>1 attaque au corps à corps ou à distance. Certaines classes = 2 attaques au niv.5.</td></tr>
          <tr><td><strong>Lancer un sort</strong></td><td>Selon le temps d'incantation du sort (1 action, action bonus, réaction…)</td></tr>
          <tr><td><strong>Foncer</strong></td><td>+Vitesse ce tour (déplacement total doublé).</td></tr>
          <tr><td><strong>Se désengager</strong></td><td>Le mouvement ne provoque pas d'attaque d'opportunité pour le reste du tour.</td></tr>
          <tr><td><strong>Esquiver</strong></td><td>Jusqu'au prochain tour : attaques contre soi en désavantage (si visible), jets DEX en avantage. Annulé si vitesse = 0 ou incapable d'agir.</td></tr>
          <tr><td><strong>Aider</strong></td><td>Allié à portée 1,5m : avantage à sa prochaine attaque ou son prochain jet de compétence (avant ton prochain tour).</td></tr>
          <tr><td><strong>Se cacher</strong></td><td>Jet de DEX (Discrétion) contre la Perception passive des ennemis.</td></tr>
          <tr><td><strong>Chercher</strong></td><td>SAG (Perception) ou INT (Investigation) pour trouver quelque chose.</td></tr>
          <tr><td><strong>Se tenir prêt</strong></td><td>Déclarer un déclencheur et une réaction associée (attaque, sort, déplacement). Agit via réaction quand le déclencheur survient. Sort préparé = concentration requise.</td></tr>
          <tr><td><strong>Utiliser un objet</strong></td><td>Pour interagir avec un 2e objet dans le tour, ou un objet qui requiert l'action explicitement.</td></tr>
          <tr><td><strong>Improviser</strong></td><td>Toute action hors liste — le MJ décide de la possibilité et du jet requis.</td></tr>
        </table>
        <div style="font-size:11px;color:var(--text3);margin-top:8px;line-height:1.8">
          <strong>Action bonus</strong> : 1 max/tour, accordée par une capacité spécifique (Ruse du roublard, sort en action bonus…).<br>
          <strong>Réaction</strong> : 1 max/tour. Recharge au début de ton tour. Exemples : attaque d'opportunité, bouclier, représailles infernales.<br>
          <strong>Interaction libre</strong> : 1 objet simple par tour sans action (dégainer, ouvrir une porte…). Le 2e objet coûte l'action.
        </div>
      </div>
      <div class="regles-section">
        <div class="pt">🎲 Initiative &amp; Surprise</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          <strong>Initiative</strong> : 1d20 + mod DEX au début du combat. Ordre décroissant. Égalité : le MJ décide (ou d20 supplémentaire).<br><br>
          <strong>Surprise</strong> : Si un groupe ne détecte pas l'ennemi (DEX Discrétion vs Perception passive), ses membres sont <em>surpris</em> au premier round.<br>
          Surpris = <strong>pas de mouvement, pas d'action, pas de réaction</strong> pendant le premier tour.<br><br>
          <strong>Tour de combat</strong> :<br>
          1. Se déplacer (≤ vitesse, fragmentable)<br>
          2. Agir (1 action)<br>
          3. Action bonus si disponible<br>
          4. Réaction si déclencheur (même hors tour)
        </div>
        <div class="pt" style="margin-top:12px">⚔ Attaques d'opportunité</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          Déclenchée quand une crÃ©ature hostile <strong>quitte ton allonge</strong> volontairement.<br>
          Coûte ta réaction → 1 attaque au corps à corps.<br>
          Annulée par l'action <strong>Se désengager</strong>, la téléportation ou un déplacement forcé.
        </div>
        <div class="pt" style="margin-top:12px">🗡 Combat à deux armes</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          Après attaque avec arme CàC <strong>légère</strong> → action bonus pour attaquer avec l'autre arme légère.<br>
          Pas de modificateur de caractéristique aux dégâts de l'attaque bonus (sauf si négatif).
        </div>
      </div>
    </div>`)}`)}
    ${ds('s-dc',`<div class="regles-section">
      ${dh('s-dc','🎲 Difficulté (DC) suggérée')}
      ${rb('s-dc',`<table class="regles-table">
        <tr><th>Difficulté</th><th>DC</th><th>Exemple</th></tr>
        <tr><td>Très facile</td><td><strong style="color:var(--cp)">5</strong></td><td>Escalader un mur avec des prises</td></tr>
        <tr><td>Facile</td><td><strong style="color:var(--cp)">10</strong></td><td>Crocheter une serrure ordinaire</td></tr>
        <tr><td>Moyen</td><td><strong style="color:var(--cp)">15</strong></td><td>Convaincre un garde méfiant</td></tr>
        <tr><td>Difficile</td><td><strong style="color:var(--cp)">20</strong></td><td>Escalader une paroi glissante</td></tr>
        <tr><td>Très difficile</td><td><strong style="color:var(--cp)">25</strong></td><td>Repérer une porte secrète bien cachée</td></tr>
        <tr><td>Quasi-impossible</td><td><strong style="color:var(--cp)">30</strong></td><td>Défoncer une porte de pierre renforcée à mains nues</td></tr>
      </table>`)}
    </div>`)}
    ${ds('s-conditions',`${gh('s-conditions','😵 Conditions &amp; PV temporaires')}
    ${rb('s-conditions',`<div class="g2" style="gap:10px">
      <div class="regles-section">
        <div class="pt">Conditions</div>
        <table class="regles-table">
          <tr><th>Condition</th><th>Effets principaux</th></tr>
          <tr><td><strong>À terre (Renversé)</strong></td><td>Seul mouvement = ramper (coût ×2). Se relever = ½ vitesse. Attaques en désavantage. Contre lui : CàC en avantage, distance en désavantage.</td></tr>
          <tr><td><strong>Agrippé</strong></td><td>Vitesse = 0 (aucun bonus). Prend fin si le ravisseur est incapable d'agir ou si la créature est hors portée. Échapper = action → FOR (Athlétisme) ou DEX (Acrobaties) opposé.</td></tr>
          <tr><td><strong>Aveuglé</strong></td><td>Rate tout jet nécessitant la vue. Attaques en désavantage, contre lui en avantage.</td></tr>
          <tr><td><strong>Charmé</strong></td><td>Ne peut pas attaquer ni cibler la source du charme. La source a l'avantage sur ses jets de CHA contre lui.</td></tr>
          <tr><td><strong>Sourd</strong></td><td>Rate tout jet nécessitant l'ouïe.</td></tr>
          <tr><td><strong>Effrayé</strong></td><td>Désavantage aux jets d'attaque et de caractéristiques tant que la source est visible. Ne peut pas s'approcher volontairement.</td></tr>
          <tr><td><strong>Empoisonné</strong></td><td>Désavantage aux jets d'attaque et de caractéristiques.</td></tr>
          <tr><td><strong>Entravé</strong></td><td>Vitesse = 0. Attaques en désavantage. Contre lui en avantage. Désavantage aux JS DEX.</td></tr>
          <tr><td><strong>Étourdi</strong></td><td>Incapable d'agir, ne peut bouger ni parler normalement. Rate JS FOR et DEX. Contre lui en avantage.</td></tr>
          <tr><td><strong>Inconscient</strong></td><td>Incapable d'agir, immobile, lâche ce qu'il tient, tombe à terre. Rate JS FOR et DEX. Contre lui en avantage. Toute attaque de moins de 1,5m = critique auto.</td></tr>
          <tr><td><strong>Invisible</strong></td><td>Introuvable sans magie ou sens spéciaux. Attaques en avantage, contre lui en désavantage. Position révélée si bruit ou traces.</td></tr>
          <tr><td><strong>Neutralisé</strong></td><td>Ne peut effectuer aucune action ni réaction.</td></tr>
          <tr><td><strong>Paralysé</strong></td><td>Neutralisé + immobile. Rate JS FOR et DEX. Contre lui en avantage. Touché à ≤1,5m = critique auto.</td></tr>
          <tr><td><strong>Pétrifié</strong></td><td>Transformé en substance solide (poids ×10, vieillissement suspendu). Incapable d'agir, immobile. Résistance à tous dégâts. Immunisé poison/maladie (suspendus). Contre lui en avantage. Rate JS FOR et DEX.</td></tr>
          <tr><td><strong>Épuisé</strong></td><td>6 niveaux cumulatifs. Niv.1 : désav. jets caract. · Niv.2 : vitesse ÷2 · Niv.3 : désav. attaques et JS · Niv.4 : PV max ÷2 · Niv.5 : vitesse = 0 · Niv.6 : mort. Repos long = −1 niveau (si mangé et bu).</td></tr>
        </table>
      </div>
      <div class="regles-section">
        <div class="pt">❤ Points de vie temporaires</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          Les PV temporaires absorbent les dégâts <strong>avant</strong> les PV normaux.<br>
          Ils <strong>ne se cumulent pas</strong> : si tu en reçois de nouveaux, tu choisis de garder les anciens ou les nouveaux.<br>
          Les soins <strong>ne restaurent pas</strong> les PV temporaires.<br>
          Ils persistent jusqu'à épuisement ou repos long, sauf durée spécifiée.<br>
          Ils peuvent dépasser ton maximum de PV, mais à 0 PV ils ne te font pas revenir conscient.
        </div>
      </div>
    </div>`)}`)}
    ${ds('s-couverture',`${gh('s-couverture','Couverture, Dégâts &amp; Combat spécial')}
    ${rb('s-couverture',`<div class="g2" style="gap:10px">
      <div class="regles-section">
        <div class="pt">🛡 Couverture</div>
        <table class="regles-table">
          <tr><th>Type</th><th>Bonus</th><th>Exemple</th></tr>
          <tr><td>Moitié (50%)</td><td><strong style="color:var(--cp)">+2 CA et JS DEX</strong></td><td>Mur bas, tonneau, allié</td></tr>
          <tr><td>Trois quarts (75%)</td><td><strong style="color:var(--cp)">+5 CA et JS DEX</strong></td><td>Meurtrière, herse, gros tronc</td></tr>
          <tr><td>Totale (100%)</td><td>Impossible à cibler</td><td>Mur plein</td></tr>
        </table>
        <div style="font-size:11px;color:var(--text3);margin-top:4px">Si plusieurs sources : seul le type le plus élevé s'applique (pas de cumul).</div>
      </div>
      <div class="regles-section">
        <div class="pt">🎯 Attaques spéciales</div>
        <table class="regles-table">
          <tr><th>Type</th><th>Condition</th><th>Effet</th></tr>
          <tr><td><strong>Coup critique (20 nat.)</strong></td><td>Jet d'attaque</td><td>Dés de dégâts × 2 (modificateurs normaux). Le 1 nat. rate toujours.</td></tr>
          <tr><td><strong>Lutte</strong></td><td>Cible ≤ taille+1, main libre</td><td>FOR (Athlétisme) opposé à FOR (Ath.) ou DEX (Acro.) → Agrippé. Déplacer la cible : vitesse ÷2.</td></tr>
          <tr><td><strong>Bousculer</strong></td><td>Cible ≤ taille+1</td><td>FOR (Athlétisme) opposé à FOR (Ath.) ou DEX (Acro.) → Renversé ou recule 1,5m.</td></tr>
          <tr><td><strong>Assommer</strong></td><td>Réduit à 0 PV (CàC)</td><td>Choix de l'attaquant : cible inconsciente et stable au lieu de mourir.</td></tr>
          <tr><td><strong>Résistance</strong></td><td>Résistance au type</td><td>Dégâts ÷2. Vulnérabilité = ×2. Pas de cumul entre elles.</td></tr>
        </table>
      </div>
      <div class="regles-section">
        <div class="pt">📏 Taille des créatures</div>
        <table class="regles-table">
          <tr><th>Taille</th><th>Espace contrôlé</th></tr>
          <tr><td>Très petite (TP)</td><td>75 cm × 75 cm</td></tr>
          <tr><td>Petite (P)</td><td>1,5 m × 1,5 m</td></tr>
          <tr><td>Moyenne (M)</td><td>1,5 m × 1,5 m</td></tr>
          <tr><td>Grande (G)</td><td>3 m × 3 m</td></tr>
          <tr><td>Très grande (TG)</td><td>4,5 m × 4,5 m</td></tr>
          <tr><td>Gigantesque (Gig)</td><td>6 m × 6 m ou plus</td></tr>
        </table>
        <div style="font-size:11px;color:var(--text3);margin-top:4px">Se faufiler dans un espace d'1 taille en dessous : coût ×2, désavantage attaques et JS DEX, attaques contre lui en avantage.</div>
      </div>
      <div class="regles-section">
        <div class="pt">💥 Types de dégâts</div>
        <table class="regles-table" style="font-size:11px">
          <tr><th>Type</th><th>Exemples</th></tr>
          <tr><td><strong>Acide</strong></td><td>Souffle dragon noir, gelée noire</td></tr>
          <tr><td><strong>Contondant</strong></td><td>Marteaux, chute, constriction</td></tr>
          <tr><td><strong>Feu</strong></td><td>Souffle dragon rouge, boule de feu</td></tr>
          <tr><td><strong>Force</strong></td><td>Projectile magique, arme spirituelle</td></tr>
          <tr><td><strong>Foudre</strong></td><td>Éclair, souffle dragon bleu</td></tr>
          <tr><td><strong>Froid</strong></td><td>Cône de froid, souffle dragon blanc</td></tr>
          <tr><td><strong>Nécrotique</strong></td><td>Morts-vivants, certains sorts</td></tr>
          <tr><td><strong>Perforant</strong></td><td>Lances, morsures, flèches</td></tr>
          <tr><td><strong>Poison</strong></td><td>Venin, souffle dragon vert</td></tr>
          <tr><td><strong>Psychique</strong></td><td>Illithid, attaque psionique</td></tr>
          <tr><td><strong>Radiant</strong></td><td>Colonne de flamme, châtiment angélique</td></tr>
          <tr><td><strong>Tonnerre</strong></td><td>Vague tonnante, explosion sonore</td></tr>
          <tr><td><strong>Tranchant</strong></td><td>Épées, haches, griffes</td></tr>
        </table>
      </div>
      <div class="regles-section">
        <div class="pt">🏇 Combat monté</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          Monture consentante, au moins 1 taille plus grande. Monter/descendre = ½ vitesse.<br>
          <strong>Monture contrôlée</strong> (dressée) : partage l'initiative du cavalier, actions limitées à Foncer/Esquiver/Se désengager.<br>
          <strong>Monture indépendante</strong> : garde son initiative, agit seule (peut fuir, attaquer…).<br>
          Monture renversée ou vitesse réduite à 0 → JS DEX DD10 pour rester en selle sinon tombé à 1,5m.
        </div>
      </div>
      <div class="regles-section">
        <div class="pt">🌊 Combat subaquatique</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          Sans vitesse de nage : désavantage aux attaques CàC (sauf dague, javeline, épée courte, lance, trident).<br>
          Attaque à distance : rate auto au-delà de la portée normale. Désavantage même dans la portée normale (sauf arbalète, filet, javelot/lance/trident/fléchette).<br>
          Créature entièrement immergée : résistance aux dégâts de feu.
        </div>
      </div>
    </div>`)}`)}
    ${ds('s-armes-c',`<div class="regles-section">
      ${dh('s-armes-c','⚔ Armes courantes')}
      ${rb('s-armes-c',`<table class="regles-table">
        <tr><th>Arme</th><th>Dégâts</th><th>Propriétés</th></tr>
        <tr><td colspan="3" style="color:var(--cp);font-size:11px;font-weight:600">Corps à corps</td></tr>
        <tr><td>Bâton</td><td>1d6 contondant</td><td>Polyvalente (1d8)</td></tr>
        <tr><td>Dague</td><td>1d4 perforant</td><td>Finesse, légère, lancer (6/18m)</td></tr>
        <tr><td>Gourdin</td><td>1d4 contondant</td><td>Légère</td></tr>
        <tr><td>Hachette</td><td>1d6 tranchant</td><td>Légère, lancer (6/18m)</td></tr>
        <tr><td>Javeline</td><td>1d6 perforant</td><td>Lancer (9/36m)</td></tr>
        <tr><td>Lance</td><td>1d6 perforant</td><td>Lancer (6/18m), polyvalente (1d8)</td></tr>
        <tr><td>Marteau léger</td><td>1d4 contondant</td><td>Légère, lancer (6/18m)</td></tr>
        <tr><td>Masse d'armes</td><td>1d6 contondant</td><td>—</td></tr>
        <tr><td>Massue</td><td>1d8 contondant</td><td>À deux mains</td></tr>
        <tr><td>Serpe</td><td>1d4 tranchant</td><td>Légère</td></tr>
        <tr><td colspan="3" style="color:var(--cp);font-size:11px;font-weight:600">À distance</td></tr>
        <tr><td>Arc court</td><td>1d6 perforant</td><td>Munitions (24/96m), 2 mains</td></tr>
        <tr><td>Arbalète légère</td><td>1d8 perforant</td><td>Munitions (24/96m), chargement, 2 mains</td></tr>
        <tr><td>Fléchette</td><td>1d4 perforant</td><td>Finesse, lancer (6/18m)</td></tr>
        <tr><td>Fronde</td><td>1d4 contondant</td><td>Munitions (9/36m)</td></tr>
      </table>`)}
    </div>`)}
    ${ds('s-armes-g',`<div class="regles-section">
      ${dh('s-armes-g','⚔ Armes de guerre')}
      ${rb('s-armes-g',`<table class="regles-table">
        <tr><th>Arme</th><th>Dégâts</th><th>Propriétés</th></tr>
        <tr><td colspan="3" style="color:var(--cp);font-size:11px;font-weight:600">Corps à corps</td></tr>
        <tr><td>Cimeterre</td><td>1d6 tranchant</td><td>Finesse, légère</td></tr>
        <tr><td>Coutille</td><td>1d10 tranchant</td><td>Lourde, allonge, 2 mains</td></tr>
        <tr><td>Épée à deux mains</td><td>2d6 tranchant</td><td>Lourde, 2 mains</td></tr>
        <tr><td>Épée courte</td><td>1d6 perforant</td><td>Finesse, légère</td></tr>
        <tr><td>Épée longue</td><td>1d8 tranchant</td><td>Polyvalente (1d10)</td></tr>
        <tr><td>Fléau d'armes</td><td>1d8 contondant</td><td>—</td></tr>
        <tr><td>Fouet</td><td>1d4 tranchant</td><td>Finesse, allonge</td></tr>
        <tr><td>Hache à deux mains</td><td>1d12 tranchant</td><td>Lourde, 2 mains</td></tr>
        <tr><td>Hache d'armes</td><td>1d8 tranchant</td><td>Polyvalente (1d10)</td></tr>
        <tr><td>Hallebarde</td><td>1d10 tranchant</td><td>Lourde, allonge, 2 mains</td></tr>
        <tr><td>Lance d'arçon</td><td>1d12 perforant</td><td>Allonge, spéciale†</td></tr>
        <tr><td>Maillet</td><td>2d6 contondant</td><td>Lourde, 2 mains</td></tr>
        <tr><td>Marteau de guerre</td><td>1d8 contondant</td><td>Polyvalente (1d10)</td></tr>
        <tr><td>Morgenstern</td><td>1d8 perforant</td><td>—</td></tr>
        <tr><td>Pic de guerre</td><td>1d8 perforant</td><td>—</td></tr>
        <tr><td>Pique</td><td>1d10 perforant</td><td>Lourde, allonge, 2 mains</td></tr>
        <tr><td>Rapière</td><td>1d8 perforant</td><td>Finesse</td></tr>
        <tr><td>Trident</td><td>1d6 perforant</td><td>Lancer (6/18m), polyvalente (1d8)</td></tr>
        <tr><td colspan="3" style="color:var(--cp);font-size:11px;font-weight:600">À distance</td></tr>
        <tr><td>Arc long</td><td>1d8 perforant</td><td>Munitions (45/180m), lourde, 2 mains</td></tr>
        <tr><td>Arbalète de poing</td><td>1d6 perforant</td><td>Munitions (9/36m), légère, chargement</td></tr>
        <tr><td>Arbalète lourde</td><td>1d10 perforant</td><td>Munitions (30/120m), lourde, chargement, 2 mains</td></tr>
        <tr><td>Filet</td><td>—</td><td>Spéciale‡, lancer (1,5/4,5m)</td></tr>
        <tr><td>Sarbacane</td><td>1 perforant</td><td>Munitions (7,5/30m), chargement</td></tr>
      </table>
      <div style="font-size:11px;color:var(--text3);margin-top:6px;line-height:1.7"><strong>Finesse</strong> : FOR ou DEX &nbsp;·&nbsp; <strong>Légère</strong> : combat à 2 armes &nbsp;·&nbsp; <strong>Allonge</strong> : +1,5m portée &nbsp;·&nbsp; <strong>Lourde</strong> : désavantage taille P &nbsp;·&nbsp; <strong>Chargement</strong> : 1 tir/action &nbsp;·&nbsp; <strong>Improvisée</strong> : 1d4 &nbsp;·&nbsp; <strong>Argent</strong> : plaquer une arme 100 po &nbsp;·&nbsp; <strong>†Lance d'arçon</strong> : désavantage ≤1,5m, 2 mains hors monture &nbsp;·&nbsp; <strong>‡Filet</strong> : entrave ≤taille G, JS FOR DD10 pour se libérer, 5 dgts tranchants (CA10) détruisent le filet, 1 attaque/action max</div>
      `)}
    </div>`)}
    ${ds('s-armures',`<div class="regles-section">
      ${dh('s-armures','🛡 Armures')}
      ${rb('s-armures',`<table class="regles-table">
        <tr><th>Armure</th><th>CA</th><th>Discrétion</th></tr>
        <tr><td colspan="3" style="color:var(--cp);font-size:11px;font-weight:600">Légères</td></tr>
        <tr><td>Matelassée</td><td>11 + mod DEX</td><td>Désavantage</td></tr>
        <tr><td>Cuir</td><td>11 + mod DEX</td><td>—</td></tr>
        <tr><td>Cuir clouté</td><td>12 + mod DEX</td><td>—</td></tr>
        <tr><td colspan="3" style="color:var(--cp);font-size:11px;font-weight:600">Intermédiaires</td></tr>
        <tr><td>Peau</td><td>12 + mod DEX (max +2)</td><td>—</td></tr>
        <tr><td>Chemise de mailles</td><td>13 + mod DEX (max +2)</td><td>—</td></tr>
        <tr><td>Écailles</td><td>14 + mod DEX (max +2)</td><td>Désavantage</td></tr>
        <tr><td>Cuirasse</td><td>14 + mod DEX (max +2)</td><td>—</td></tr>
        <tr><td>Demi-plate</td><td>15 + mod DEX (max +2)</td><td>Désavantage</td></tr>
        <tr><td colspan="3" style="color:var(--cp);font-size:11px;font-weight:600">Lourdes</td></tr>
        <tr><td>Broigne</td><td>14</td><td>Désavantage</td></tr>
        <tr><td>Cotte de mailles</td><td>16 (FOR 13 ou −3m)</td><td>Désavantage</td></tr>
        <tr><td>Clibanion</td><td>17 (FOR 15 ou −3m)</td><td>Désavantage</td></tr>
        <tr><td>Harnois</td><td>18 (FOR 15 ou −3m)</td><td>Désavantage</td></tr>
        <tr><td>Bouclier</td><td>+2</td><td>—</td></tr>
      </table>
      <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin:10px 0 4px">Mettre / Ôter une armure</div>
      <table class="regles-table">
        <tr><th>Catégorie</th><th>Mettre</th><th>Ôter</th></tr>
        <tr><td>Légère</td><td>1 min</td><td>1 min</td></tr>
        <tr><td>Intermédiaire</td><td>5 min</td><td>1 min</td></tr>
        <tr><td>Lourde</td><td>10 min</td><td>5 min</td></tr>
        <tr><td>Bouclier</td><td>1 action</td><td>1 action</td></tr>
      </table>`)}
    </div>`)}
    ${ds('s-modifs',`<div class="regles-section">
      ${dh('s-modifs','🎲 Modificateurs de caractéristiques')}
      ${rb('s-modifs',`<table class="regles-table">
        <tr><th>Score</th><th>Mod.</th></tr>
        <tr><td>1</td><td style="color:#e53935">−5</td></tr>
        <tr><td>2–3</td><td style="color:#e53935">−4</td></tr>
        <tr><td>4–5</td><td style="color:#e53935">−3</td></tr>
        <tr><td>6–7</td><td style="color:#e53935">−2</td></tr>
        <tr><td>8–9</td><td style="color:#e53935">−1</td></tr>
        <tr><td>10–11</td><td>+0</td></tr>
        <tr><td>12–13</td><td style="color:var(--cp)">+1</td></tr>
        <tr><td>14–15</td><td style="color:var(--cp)">+2</td></tr>
        <tr><td>16–17</td><td style="color:var(--cp)">+3</td></tr>
        <tr><td>18–19</td><td style="color:var(--cp)">+4</td></tr>
        <tr><td>20–21</td><td style="color:var(--cp)">+5</td></tr>
        <tr><td>22–23</td><td style="color:var(--cp)">+6</td></tr>
        <tr><td>24–25</td><td style="color:var(--cp)">+7</td></tr>
        <tr><td>28–30</td><td style="color:var(--cp)">+9/+10</td></tr>
      </table>`)}
    </div>`)}
    ${ds('s-multiclasse',`<div class="regles-section">
      ${dh('s-multiclasse','🔀 Multiclassage')}
      ${rb('s-multiclasse',`<div style="font-size:11px;color:var(--text3);margin-bottom:8px">Option : ajouter un niveau dans une autre classe plutôt que dans sa classe actuelle. Nécessite les valeurs minimum dans les deux classes.</div>
      <div class="g2" style="gap:10px">
        <div>
          <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Prérequis</div>
          <table class="regles-table">
            <tr><th>Classe</th><th>Minimum requis</th></tr>
            <tr><td>Barbare</td><td>FOR 13</td></tr>
            <tr><td>Barde</td><td>CHA 13</td></tr>
            <tr><td>Clerc</td><td>SAG 13</td></tr>
            <tr><td>Druide</td><td>SAG 13</td></tr>
            <tr><td>Ensorceleur</td><td>CHA 13</td></tr>
            <tr><td>Guerrier</td><td>FOR 13 ou DEX 13</td></tr>
            <tr><td>Magicien</td><td>INT 13</td></tr>
            <tr><td>Moine</td><td>DEX 13 et SAG 13</td></tr>
            <tr><td>Occultiste</td><td>CHA 13</td></tr>
            <tr><td>Paladin</td><td>FOR 13 et CHA 13</td></tr>
            <tr><td>Rôdeur</td><td>DEX 13 et SAG 13</td></tr>
            <tr><td>Roublard</td><td>DEX 13</td></tr>
          </table>
        </div>
        <div>
          <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Maîtrises gagnées (nouveau niveau)</div>
          <table class="regles-table">
            <tr><th>Classe</th><th>Maîtrises gagnées</th></tr>
            <tr><td>Barbare</td><td>Boucliers, armes courantes &amp; de guerre</td></tr>
            <tr><td>Barde</td><td>Armure légère, 1 compétence, 1 instrument</td></tr>
            <tr><td>Clerc</td><td>Armure légère, intermédiaire, boucliers</td></tr>
            <tr><td>Druide</td><td>Armure légère, intermédiaire, boucliers (pas métal)</td></tr>
            <tr><td>Ensorceleur</td><td>—</td></tr>
            <tr><td>Guerrier</td><td>Armures légère, intermédiaire, boucliers, armes courantes &amp; de guerre</td></tr>
            <tr><td>Magicien</td><td>—</td></tr>
            <tr><td>Moine</td><td>Armes courantes, épée courte</td></tr>
            <tr><td>Occultiste</td><td>Armure légère, armes courantes</td></tr>
            <tr><td>Paladin</td><td>Armures légère, intermédiaire, boucliers, armes courantes &amp; de guerre</td></tr>
            <tr><td>Rôdeur</td><td>Armures légère, intermédiaire, boucliers, armes courantes &amp; de guerre, 1 compétence</td></tr>
            <tr><td>Roublard</td><td>Armure légère, 1 compétence de la liste, outils de voleur</td></tr>
          </table>
        </div>
      </div>
      <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin:10px 0 4px">Emplacements de sorts multiclasse (niveau total de lanceur)</div>
      <div style="max-height:220px;overflow-y:auto">
      <table class="regles-table" style="font-size:11px">
        <tr><th>Niv.</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th></tr>
        <tr><td>1</td><td>2</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>
        <tr><td>2</td><td>3</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>
        <tr><td>3</td><td>4</td><td>2</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>
        <tr><td>4</td><td>4</td><td>3</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>
        <tr><td>5</td><td>4</td><td>3</td><td>2</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>
        <tr><td>6</td><td>4</td><td>3</td><td>3</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>
        <tr><td>7</td><td>4</td><td>3</td><td>3</td><td>1</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>
        <tr><td>8</td><td>4</td><td>3</td><td>3</td><td>2</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>
        <tr><td>9</td><td>4</td><td>3</td><td>3</td><td>3</td><td>1</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>
        <tr><td>10</td><td>4</td><td>3</td><td>3</td><td>3</td><td>2</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>
        <tr><td>11</td><td>4</td><td>3</td><td>3</td><td>3</td><td>2</td><td>1</td><td>—</td><td>—</td><td>—</td></tr>
        <tr><td>12</td><td>4</td><td>3</td><td>3</td><td>3</td><td>2</td><td>1</td><td>—</td><td>—</td><td>—</td></tr>
        <tr><td>13</td><td>4</td><td>3</td><td>3</td><td>3</td><td>2</td><td>1</td><td>1</td><td>—</td><td>—</td></tr>
        <tr><td>14</td><td>4</td><td>3</td><td>3</td><td>3</td><td>2</td><td>1</td><td>1</td><td>—</td><td>—</td></tr>
        <tr><td>15</td><td>4</td><td>3</td><td>3</td><td>3</td><td>2</td><td>1</td><td>1</td><td>1</td><td>—</td></tr>
        <tr><td>16</td><td>4</td><td>3</td><td>3</td><td>3</td><td>2</td><td>1</td><td>1</td><td>1</td><td>—</td></tr>
        <tr><td>17</td><td>4</td><td>3</td><td>3</td><td>3</td><td>2</td><td>1</td><td>1</td><td>1</td><td>1</td></tr>
        <tr><td>18</td><td>4</td><td>3</td><td>3</td><td>3</td><td>3</td><td>1</td><td>1</td><td>1</td><td>1</td></tr>
        <tr><td>19</td><td>4</td><td>3</td><td>3</td><td>3</td><td>3</td><td>2</td><td>1</td><td>1</td><td>1</td></tr>
        <tr><td>20</td><td>4</td><td>3</td><td>3</td><td>3</td><td>3</td><td>2</td><td>2</td><td>1</td><td>1</td></tr>
      </table>
      </div>
      <div style="font-size:11px;color:var(--text3);margin-top:6px;line-height:1.7">Niv. lanceur = Barde+Clerc+Druide+Ensorc.+Mage (×1) + Paladin+Rôdeur (×½ arrondi inf.) + Guerrier/Roublard éligibles (×⅓ arrondi inf.) &nbsp;·&nbsp; Occultiste : Magie de pacte utilisable pour sorts des autres classes et vice versa &nbsp;·&nbsp; Attaque supplémentaire : ne se cumule pas entre classes &nbsp;·&nbsp; Défense sans armure : une seule source</div>`)}
    </div>`)}
    ${ds('s-epuisement',`<div class="regles-section">
      ${dh('s-epuisement','😵 Épuisement · 🍖 Faim & Soif')}
      ${rb('s-epuisement',`<div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Niveaux d'épuisement</div>
        <table class="regles-table">
          <tr><th>Niv.</th><th>Effet</th></tr>
          <tr><td>1</td><td>Désavantage aux jets de caractéristique</td></tr>
          <tr><td>2</td><td>Vitesse divisée par deux</td></tr>
          <tr><td>3</td><td>Désavantage aux jets d'attaque et de sauvegarde</td></tr>
          <tr><td>4</td><td>Max PV divisé par deux</td></tr>
          <tr><td>5</td><td>Vitesse réduite à 0</td></tr>
          <tr><td style="color:#e53935;font-weight:600">6</td><td style="color:#e53935">Mort</td></tr>
        </table>
        <div style="font-size:11px;color:var(--text3);margin-top:5px;margin-bottom:10px">Repos long : −1 niveau d'épuisement.</div>
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Faim</div>
        <div style="font-size:12px;color:var(--text2);line-height:1.7;margin-bottom:8px">
          Besoin : <strong>500 g/jour</strong>. Moins de la moitié → JS CON DD 10 ou +1 épuisement.<br>
          Sans nourriture : après <strong>3 + mod CON jours</strong> (min 1), +1 épuisement automatique/jour.
        </div>
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Soif</div>
        <div style="font-size:12px;color:var(--text2);line-height:1.7">
          Besoin : <strong>3,5 l/jour</strong> (7 l en chaleur extrême).<br>
          Sans eau 1 jour → JS CON DD 15 ou +1 épuisement (+2 si raté de 5+).<br>
          Armure intermédiaire/lourde → désavantage au jet.
        </div>`)}
    </div>`)}
    ${ds('s-voyage',`${gh('s-voyage','Voyage, Mouvement &amp; Lumière')}
    ${rb('s-voyage',`<div class="g2" style="gap:10px">
      <div class="regles-section">
        <div class="pt">🚶 Allures de voyage</div>
        <table class="regles-table">
          <tr><th>Allure</th><th>Minute</th><th>Heure</th><th>Jour</th><th>Effet</th></tr>
          <tr><td>Rapide</td><td>120 m</td><td>6 km</td><td>45 km</td><td style="color:#e53935">−5 Percep.</td></tr>
          <tr><td>Normale</td><td>90 m</td><td>4,5 km</td><td>36 km</td><td>—</td></tr>
          <tr><td>Lente</td><td>60 m</td><td>3 km</td><td>27 km</td><td style="color:var(--cp)">Discrétion</td></tr>
        </table>
        <div style="font-size:11px;color:var(--text3);margin-top:6px;line-height:1.7">
          <strong>Marche forcée</strong> : après 8h/jour, chaque heure supplémentaire → JS CON DD (10 + 1/h sup.). Échec = 1 niveau d'épuisement.<br>
          <strong>Terrain difficile</strong> : vitesse ÷ 2 (forêt dense, marais, montagne, glace, ruines…)<br>
          <strong>Monture</strong> : peut galoper 1h à vitesse ×2 (allure rapide). Véhicule terrestre = allure normale.
        </div>
      </div>
      <div class="regles-section">
        <div class="pt">🕯 Sources de lumière</div>
        <table class="regles-table">
          <tr><th>Source</th><th>Vive</th><th>Faible</th><th>Durée</th></tr>
          <tr><td>Bougie</td><td>1,5 m</td><td>+1,5 m</td><td>1 h</td></tr>
          <tr><td>Lampe</td><td>4,5 m</td><td>+9 m</td><td>6 h</td></tr>
          <tr><td>Lanterne à capote</td><td>9 m</td><td>+9 m</td><td>6 h</td></tr>
          <tr><td>Lanterne sourde</td><td>18 m</td><td>+18 m</td><td>6 h</td></tr>
          <tr><td>Torche</td><td>6 m</td><td>+6 m</td><td>1 h</td></tr>
        </table>
      </div>
      <div class="regles-section">
        <div class="pt">🧗 Mouvements spéciaux</div>
        <table class="regles-table">
          <tr><th>Action</th><th>Coût</th><th>Jet éventuel</th></tr>
          <tr><td>Escalader</td><td>2 m par mètre (terrain difficile : 3 m)</td><td>FOR (Athlétisme) si surface glissante</td></tr>
          <tr><td>Nager</td><td>2 m par mètre (eaux agitées : jet requis)</td><td>FOR (Athlétisme) si courant fort</td></tr>
          <tr><td>Ramper</td><td>2 m par mètre</td><td>—</td></tr>
          <tr><td>Saut en longueur (élan)</td><td>FOR ÷ 3 mètres</td><td>FOR (Athlétisme) DD 10 pour obstacle ≤ 1/4 distance</td></tr>
          <tr><td>Saut en longueur (sur place)</td><td>FOR ÷ 6 mètres</td><td>—</td></tr>
          <tr><td>Saut en hauteur (élan)</td><td>mod FOR ÷ 3 + 1 m (min 0)</td><td>—</td></tr>
          <tr><td>Saut en hauteur (sur place)</td><td>Moitié ci-dessus</td><td>—</td></tr>
        </table>
        <div style="font-size:11px;color:var(--text3);margin-top:6px">Atterrissage en terrain difficile → DEX (Acrobaties) DD 10 ou chute à terre.</div>
      </div>
      <div class="regles-section">
        <div class="pt">👁 Types de vision</div>
        <table class="regles-table">
          <tr><th>Vision</th><th>Effet</th></tr>
          <tr><td><strong>Lumière vive</strong></td><td>Visibilité normale</td></tr>
          <tr><td><strong>Pénombre</strong> (lumière faible)</td><td>Zone à visibilité réduite — désavantage aux jets de Perception (vue)</td></tr>
          <tr><td><strong>Ténèbres</strong></td><td>Visibilité nulle — état Aveuglé pour voir dans cette zone</td></tr>
          <tr><td><strong>Vision aveugle</strong></td><td>Perçoit l'environnement sans la vue dans un rayon donné (vases, dragons, chauves-souris…)</td></tr>
          <tr><td><strong>Vision dans le noir</strong></td><td>Pénombre = lumière vive · Ténèbres = pénombre (niveaux de gris uniquement)</td></tr>
          <tr><td><strong>Vision véritable</strong></td><td>Voit dans toutes ténèbres, détecte l'invisible, les illusions, les métamorphes, et le plan éthéré</td></tr>
        </table>
      </div>
    </div>`)}`)}
    ${ds('s-dangers',`${gh('s-dangers','Dangers &amp; Survie')}
    ${rb('s-dangers',`<div class="g2" style="gap:10px">
      <div class="regles-section">
        <div class="pt">⬇ Chuter</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          <strong>1d6 dégâts contondants par 3 m de chute</strong> (max 20d6).<br>
          La créature atterrit à terre, sauf si elle évite les dégâts.
        </div>
      </div>
      <div class="regles-section">
        <div class="pt">🫁 Suffoquer</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          <strong>Retenir sa respiration</strong> : 1 + mod CON minutes (min 30 s).<br>
          <strong>En train de suffoquer</strong> : survit mod CON rounds (min 1).<br>
          Au début du round suivant → 0 PV, état mourant. Impossible de récupérer des PV ni d'être stabilisé avant de respirer.
        </div>
      </div>
      <div class="regles-section">
        <div class="pt">🍖 Nourriture & eau</div>
        <table class="regles-table">
          <tr><th></th><th>Besoin/jour</th><th>Survie sans</th><th>Conséquence</th></tr>
          <tr><td><strong>Nourriture</strong></td><td>500 g</td><td>3 + mod CON jours (min 1)</td><td>+1 niv. épuisement/jour au-delà · Demi-ration = demi-jour</td></tr>
          <tr><td><strong>Eau</strong></td><td>4 L (8 L si chaud)</td><td>Moitié → JS CON DD 15 ou +1 épuis.</td><td>Moins de moitié → +1 épuis. auto (×2 si déjà épuisé)</td></tr>
        </table>
      </div>
    </div>`)}`)}
    ${ds('s-vie',`${gh('s-vie','Train de vie &amp; Monnaies')}
    ${rb('s-vie',`<div class="g2" style="gap:10px">
      <div class="regles-section">
        <div class="pt">🏨 Train de vie</div>
        <table class="regles-table">
          <tr><th>Train de vie</th><th>Coût/jour</th><th>Auberge</th></tr>
          <tr><td>Sordide</td><td>1 pa</td><td>7 pc</td></tr>
          <tr><td>Pauvre</td><td>2 pa</td><td>1 pa</td></tr>
          <tr><td>Modeste</td><td>1 po</td><td>5 pa</td></tr>
          <tr><td>Confortable</td><td>2 po</td><td>8 pa</td></tr>
          <tr><td>Riche</td><td>4 po</td><td>2 po</td></tr>
          <tr><td>Aristocratique</td><td>10 po min.</td><td>4 po</td></tr>
        </table>
      </div>
      <div class="regles-section">
        <div class="pt">💰 Monnaies & Conversions</div>
        <table class="regles-table">
          <tr><th>Unité</th><th>Équivalent</th></tr>
          <tr><td>1 pc</td><td>—</td></tr>
          <tr><td>1 pa</td><td>= 10 pc</td></tr>
          <tr><td>1 pe</td><td>= 50 pc</td></tr>
          <tr><td>1 po</td><td>= 100 pc</td></tr>
          <tr><td>1 pp</td><td>= 1000 pc</td></tr>
        </table>
        <div style="font-size:11px;color:var(--text3);margin-top:6px">5 ft = 1,5 m &nbsp;·&nbsp; 1 mile = 1,5 km &nbsp;·&nbsp; 1 lb = 500 g</div>
      </div>
    </div>`)}`)}
    ${ds('s-temps-mort',`${gh('s-temps-mort','🌙 Temps morts (XGtE)')}
    ${rb('s-temps-mort',`
      <div class="regles-section" style="margin-bottom:10px">
        <div class="pt">👤 Antagonistes</div>
        <div style="font-size:12px;color:var(--text2);line-height:1.6">
          PNJ actifs qui s'opposent au groupe (2–3 simultanément recommandés). Chaque temps mort résolu, faire <strong>avancer 1 plan d'antagoniste</strong> : attaque, intrigue, événement de fond. Chaque antagoniste a des <strong>Objectifs</strong>, des <strong>Ressources</strong> et un plan en 3–4 étapes.
        </div>
      </div>
      <div class="regles-section">
        <div class="pt">📋 Activités (XGtE) — 1 semaine = 5 jours, 8h/jour minimum</div>
        <div style="max-height:380px;overflow-y:auto">
        <table class="regles-table" style="font-size:10px">
          <tr><th style="min-width:130px">Activité</th><th>Ressources</th><th>Jet / Résultat</th></tr>
          <tr><td><strong>🛒 Acheter objet mag.</strong></td><td>1 sem + 100 po min</td><td>CHA Persuasion (+1/sem sup., +1/100 po, max +10) → qualité du vendeur</td></tr>
          <tr><td><strong>🍺 Faire la fête</strong></td><td>1 sem + 10/50/250 po (peuple/bourgeois/aristocratie)</td><td>CHA Persuasion : ≤5 ennemi · 6-10 rien · 11-15 allié · 16-20 ×2 · 21+ ×3</td></tr>
          <tr><td><strong>⚒ Fabriquer objet</strong></td><td>Matériaux = ½ prix, outils requis</td><td>50 po de valeur / semaine. Collaboration possible.</td></tr>
          <tr><td><strong>✨ Objet magique</strong></td><td>Formule + quête + 50 po–100k po</td><td>1–50 sem. selon rareté. Consommables ÷2.</td></tr>
          <tr><td><strong>🧪 Potion de soins</strong></td><td>Kit herboriste requis</td><td>Soins 25 po/1j · Maj. 100 po/1sem · Sup. 1 000 po/3sem · Supr. 10 000 po/4sem</td></tr>
          <tr><td><strong>🗡 Crime</strong></td><td>1 sem + 25 po</td><td>3 jets (Discrétion / Outils voleur / libre) vs DD 10/15/20/25 → 0–1 000 po</td></tr>
          <tr><td><strong>🎲 Parier</strong></td><td>1 sem + 10–1 000 po</td><td>3 jets (Intuition/Tromperie/Intimidation) vs DD 5+2d10 → ×0 · ×0,5 · ×1,5 · ×2</td></tr>
          <tr><td><strong>🥊 Combattre</strong></td><td>1 sem</td><td>3 jets (Athlétisme/Acrobaties/CON+dé vie) vs DD 5+2d10 → 0/50/100/200 po</td></tr>
          <tr><td><strong>😴 Relaxation</strong></td><td>1 sem, train de vie modeste min.</td><td>Avantage JS maladie/poison. Fin sem. : supprimer 1 effet ou restaurer 1 caract.</td></tr>
          <tr><td><strong>⛪ Service religieux</strong></td><td>1 sem, gratuit</td><td>INT (Religion) ou CHA (Persuasion) : 1-10 rien · 11-20 une faveur · 21+ deux faveurs</td></tr>
          <tr><td><strong>📖 Recherches</strong></td><td>1 sem + 50 po min (+1/50 po, max +6)</td><td>INT : 1-5 rien · 6-10 une info · 11-20 deux · 21+ trois informations</td></tr>
          <tr><td><strong>📜 Parchemin de sort</strong></td><td>Maîtrise Arcanes, sort préparé</td><td>Mineur 15po/1j · Niv1 25po/1j · Niv2 250po/3j · Niv3 500po/1sem · Niv4 2,5k/2sem · Niv5 5k/4sem</td></tr>
          <tr><td><strong>💰 Vendre objet mag.</strong></td><td>1 sem + 25 po</td><td>CHA Persuasion : ≤10 → 50% · 11-20 → 100% · 21+ → 150% du prix de base</td></tr>
          <tr><td><strong>📚 Se former</strong></td><td>10 sem (− mod INT), 25 po/sem</td><td>Langue ou maîtrise d'outil. Instructeur requis.</td></tr>
          <tr><td><strong>🔨 Travailler</strong></td><td>1 sem</td><td>Jet compétence : ≤9 pauvre · 10-14 modeste · 15-20 confortable · 21+ confort + 25 po</td></tr>
          <tr><td><strong>🏰 Construire</strong></td><td>Terrain + charte royale requis</td><td>Fort 15k/100j · Donjon 50k/400j · Palace 500k/1 200j · Siège guilde 5k/60j · Temple 50k/400j</td></tr>
        </table>
        </div>
        <div style="font-size:10px;color:var(--text3);margin-top:6px">Complications : 10% de chances par semaine d'activité. Absent lors d'une construction = +3 jours par jour d'absence.</div>
      </div>
    `)}`)}
    ${ds('s-packs',`<div class="regles-section">
      ${dh('s-packs','🎒 Sacs d\'équipement')}
      ${rb('s-packs',`<table class="regles-table">
        <tr><th>Sac</th><th>Prix</th><th>Contenu</th></tr>
        <tr><td><strong>Artiste</strong></td><td>40 po</td><td>Sac à dos, sac de couchage, 2 costumes, 5 bougies, 5j rations, gourde, kit de déguisement</td></tr>
        <tr><td><strong>Cambrioleur</strong></td><td>16 po</td><td>Sac à dos, 1000 billes, 3m chaîne, cloche, 5 bougies, pied-de-biche, marteau, 10 pitons, lanterne à capuchon, 2 huiles, 5j rations, allume-feu, gourde, 15m corde chanvre</td></tr>
        <tr><td><strong>Diplomate</strong></td><td>39 po</td><td>Coffre, 2 étuis à cartes, vêtements fins, encre, plume, lampe, 2 huiles, 5 papiers, parfum, cire à cacheter, savon</td></tr>
        <tr><td><strong>Ecclésiastique</strong></td><td>19 po</td><td>Sac à dos, couverture, 10 bougies, allume-feu, boîte aumône, 2 bâtonnets d'encens, encensoir, habits de cérémonie, 2j rations, gourde</td></tr>
        <tr><td><strong>Érudit</strong></td><td>40 po</td><td>Sac à dos, livre, encre, plume, 10 parchemins, sac de sable, petit couteau</td></tr>
        <tr><td><strong>Explorateur</strong></td><td>10 po</td><td>Sac à dos, sac de couchage, gamelle, allume-feu, 10 torches, 10j rations, gourde, 15m corde chanvre</td></tr>
        <tr><td><strong>Exploration souterraine</strong></td><td>12 po</td><td>Sac à dos, pied-de-biche, marteau, 10 pitons, 10 torches, allume-feu, 10j rations, gourde, 15m corde chanvre</td></tr>
      </table>`)}
    </div>`)}
    ${ds('s-services',`<div class="regles-section">
      ${dh('s-services','⚙ Services & Embauche')}
      ${rb('s-services',`<table class="regles-table">
        <tr><th>Service</th><th>Prix</th></tr>
        <tr><td>Embauche non qualifiée</td><td>2 pa / jour</td></tr>
        <tr><td>Embauche qualifiée</td><td>2 po / jour</td></tr>
        <tr><td>Messager</td><td>2 pc / 1,5 km</td></tr>
        <tr><td>Péage routier ou de porte</td><td>1 pc</td></tr>
        <tr><td>Transport en ville</td><td>1 pc</td></tr>
        <tr><td>Transport entre deux villes</td><td>3 pc / 1,5 km</td></tr>
        <tr><td>Voyage en bateau</td><td>1 pa / 1,5 km</td></tr>
      </table>
      <div style="font-size:11px;color:var(--text3);margin-top:6px;line-height:1.7"><strong>Sorts niv.1–2</strong> : 10–50 po + composantes coûteuses &nbsp;·&nbsp; Sorts niv. supérieur : temple ou université, tarif ou service rendu en échange</div>`)}
    </div>`)}
    ${ds('s-depart',`${gh('s-depart','🪙 Or de départ &amp; Revente')}
    ${rb('s-depart',`<div class="g2" style="gap:10px">
      <div class="regles-section">
        <div class="pt">🪙 Or de départ (alternative à l'équipement)</div>
        <table class="regles-table">
          <tr><th>Classe</th><th>Formule</th><th>Moy.</th></tr>
          <tr><td>Barbare</td><td>2d4 × 10 po</td><td>50 po</td></tr>
          <tr><td>Barde</td><td>5d4 × 10 po</td><td>125 po</td></tr>
          <tr><td>Clerc</td><td>5d4 × 10 po</td><td>125 po</td></tr>
          <tr><td>Druide</td><td>2d4 × 10 po</td><td>50 po</td></tr>
          <tr><td>Ensorceleur</td><td>3d4 × 10 po</td><td>75 po</td></tr>
          <tr><td>Guerrier</td><td>5d4 × 10 po</td><td>125 po</td></tr>
          <tr><td>Magicien</td><td>4d4 × 10 po</td><td>100 po</td></tr>
          <tr><td>Moine</td><td>5d4 po</td><td>12 po</td></tr>
          <tr><td>Occultiste</td><td>4d4 × 10 po</td><td>100 po</td></tr>
          <tr><td>Paladin</td><td>5d4 × 10 po</td><td>125 po</td></tr>
          <tr><td>Rôdeur</td><td>5d4 × 10 po</td><td>125 po</td></tr>
          <tr><td>Roublard</td><td>4d4 × 10 po</td><td>100 po</td></tr>
          <tr><td>Artificier</td><td>5d4 × 10 po</td><td>125 po</td></tr>
        </table>
      </div>
      <div class="regles-section">
        <div class="pt">💱 Vente d'équipement</div>
        <div style="font-size:12px;color:var(--text2);line-height:1.8">
          Un objet se revend à <strong>la moitié de son prix de liste</strong>.<br>
          Les objets magiques et les pierres précieuses trouvent des acheteurs plus difficilement — à la discrétion du MJ.
        </div>
      </div>
    </div>`)}`)}
    ${ds('s-repos',`<div class="regles-section">
      ${dh('s-repos','💤 Repos')}
      ${rb('s-repos',`<table class="regles-table">
        <tr><th></th><th>Repos court (≥ 1h)</th><th>Repos long (≥ 8h)</th></tr>
        <tr><td><strong>PV récupérés</strong></td><td>Dés de vie dépensés + mod CON</td><td>Tous les PV max</td></tr>
        <tr><td><strong>Dés de vie</strong></td><td>Utilisables librement</td><td>Récupère niv/2 (min 1)</td></tr>
        <tr><td><strong>Capacités</strong></td><td>Ki, Magie de pacte, Deuxième Souffle...</td><td>Magie, Rage, quasi-tout</td></tr>
      </table>`)}
    </div>`)}
    ${ds('s-mort',`<div class="regles-section">
      ${dh('s-mort','💀 Jet de sauvegarde contre la mort')}
      ${rb('s-mort',`<div style="font-size:13px;color:var(--text2);line-height:1.8">
        À 0 PV : jets de sauvegarde à chaque tour (1d20, sans modificateur).<br>
        • <strong style="color:#4caf50">10+</strong> → Succès (3 succès = stable, inconscient mais vivant).<br>
        • <strong style="color:#e53935">1-9</strong> → Échec (3 échecs = mort).<br>
        • <strong style="color:#ffd54f">1 naturel</strong> → 2 échecs d'un coup.<br>
        • <strong style="color:#ffd54f">20 naturel</strong> → Retour à 1 PV, debout.<br>
        • Subir des dégâts à 0 PV → 1 échec (ou 2 si corps à corps).
      </div>`)}
    </div>`)}
    ${ds('s-incantation',`${gh('s-incantation','✨ Règles d\'incantation')}
    ${rb('s-incantation',`<div class="g2" style="gap:10px">
      <div class="regles-section">
        <div class="pt">📊 Formules clés</div>
        <table class="regles-table">
          <tr><th>Formule</th><th>Calcul</th></tr>
          <tr><td><strong>DD de sort</strong></td><td>8 + bonus de maîtrise + mod. caractéristique d'incantation</td></tr>
          <tr><td><strong>Bonus d'attaque de sort</strong></td><td>Bonus de maîtrise + mod. caractéristique d'incantation</td></tr>
        </table>
        <div style="font-size:11px;color:var(--text3);margin-top:6px">Caractéristique d'incantation : INT (Magicien), SAG (Clerc/Druide/Rôdeur), CHA (Barde/Paladin/Ensorceleur/Occultiste)</div>
      </div>
      <div class="regles-section">
        <div class="pt">🔄 Concentration</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          Un seul sort à concentration à la fois. Lancer un autre sort à concentration y met fin.<br>
          <strong>Prendre des dégâts</strong> → JS CON (DD = max(10, ½ dégâts reçus)) par source.<br>
          <strong>Incapable d'agir ou mort</strong> → concentration brisée automatiquement.<br>
          MJ peut aussi demander JS CON DD10 pour phénomènes violents (vague, tempête…).
        </div>
      </div>
      <div class="regles-section">
        <div class="pt">📜 Rituels</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          Les sorts avec la mention <strong>rituel</strong> peuvent être lancés sans dépenser d'emplacement.<br>
          La version rituel prend <strong>+10 minutes</strong> de plus que le temps normal.<br>
          Ne peut pas être lancé à un niveau supérieur.<br>
          Nécessite d'avoir le sort préparé (sauf règle spécifique de classe comme le Magicien).
        </div>
      </div>
      <div class="regles-section">
        <div class="pt">🛡 Port d'armure &amp; sorts</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          Pour lancer un sort, tu dois <strong>maîtriser l'armure portée</strong>, sinon l'incantation échoue.<br>
          Concerne les sorts avec composante verbale ou somatique (la quasi-totalité).
        </div>
      </div>
      <div class="regles-section">
        <div class="pt">📐 Zones d'effet</div>
        <table class="regles-table">
          <tr><th>Forme</th><th>Règle</th></tr>
          <tr><td><strong>Cône</strong></td><td>S'élargit depuis toi. Largeur = distance depuis l'origine. Toi non inclus.</td></tr>
          <tr><td><strong>Cube</strong></td><td>Point d'origine = une face du cube. Toi non inclus par défaut.</td></tr>
          <tr><td><strong>Cylindre</strong></td><td>Centre du cercle de base = point d'origine. S'étend en hauteur. Toi inclus.</td></tr>
          <tr><td><strong>Ligne</strong></td><td>S'étend depuis l'origine. Largeur précisée. Toi non inclus.</td></tr>
          <tr><td><strong>Sphère</strong></td><td>Point d'origine = centre. Rayon vers l'extérieur. Toi inclus.</td></tr>
        </table>
        <div style="font-size:11px;color:var(--text3);margin-top:4px">Obstrué par un abri total. Ligne droite du point d'origine vers chaque case — si bloquée, case exclue de la zone.</div>
      </div>
      <div class="regles-section">
        <div class="pt">⚡ Règles spéciales</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          <strong>Action bonus + sort</strong> : si tu lances un sort en action bonus, seul un sort mineur (temps d'incantation 1 action) peut être lancé ce tour-là.<br><br>
          <strong>Lancer à niveau supérieur</strong> : utiliser un emplacement de niveau plus élevé → sort adopte ce niveau (effets souvent améliorés).<br><br>
          <strong>Combiner les effets</strong> : effets de sorts différents se cumulent. Effets du même sort lancé plusieurs fois ne se cumulent pas → le plus puissant s'applique.
        </div>
      </div>
    </div>`)}`)}
    ${ds('s-magie-sauvage',`<div class="regles-section">
      ${dh('s-magie-sauvage','🎲 Magie Sauvage — Table de Sursaut (d100)')}
      ${rb('s-magie-sauvage',`<div style="font-size:11px;color:var(--text3);margin-bottom:8px">Déclenché par <strong>Marée du chaos</strong> ou à la discrétion du MJ après qu'un ensorceleur lance un sort. Lancez 1d100.</div>
      <div style="max-height:320px;overflow-y:auto">
      <table class="regles-table" style="font-size:11px">
        <tr><th style="width:52px">d100</th><th>Effet</th></tr>
        <tr><td>01–02</td><td>Lancez sur ce tableau au début de chacun de vos tours pendant 1 minute (ignorez ce résultat lors des lancers suivants).</td></tr>
        <tr><td>03–04</td><td>Pendant 1 minute, vous voyez toute créature invisible dans votre ligne de vue.</td></tr>
        <tr><td>05–06</td><td>Un modrone contrôlé par le MJ apparaît à 1,50 m de vous, puis disparaît après 1 minute.</td></tr>
        <tr><td style="color:#e53935;font-weight:600">07–08</td><td><strong>Boule de feu</strong> niv. 3 centrée sur vous-même.</td></tr>
        <tr><td>09–10</td><td><strong>Projectile magique</strong> niv. 5.</td></tr>
        <tr><td>11–12</td><td>Lancez 1d10. Votre taille change de ce nombre de cm. Impair = vous rétrécissez, pair = vous grandissez.</td></tr>
        <tr><td style="color:#e53935;font-weight:600">13–14</td><td><strong>Confusion</strong> centrée sur vous-même.</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">15–16</td><td>Pendant 1 minute, vous récupérez 5 PV au début de chacun de vos tours.</td></tr>
        <tr><td>17–18</td><td>Vous faites pousser une barbe de plumes. Elle disparaît quand vous éternuez (les plumes explosent).</td></tr>
        <tr><td style="color:#e53935;font-weight:600">19–20</td><td><strong>Graisse</strong> centrée sur vous-même.</td></tr>
        <tr><td style="color:#e53935;font-weight:600">21–22</td><td>Les créatures ont le désavantage aux JS contre votre prochain sort lancé dans la prochaine minute.</td></tr>
        <tr><td>23–24</td><td>Votre peau devient bleue vif. Un <em>Désenvoûtement</em> met fin à l'effet.</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">25–26</td><td>Un œil apparaît sur votre front pendant 1 minute : avantage aux tests de Perception (vue).</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">27–28</td><td>Pendant 1 minute, vos sorts à temps d'incantation de 1 action deviennent des actions bonus.</td></tr>
        <tr><td>29–30</td><td>Téléportation jusqu'à 18 m vers un espace inoccupé visible.</td></tr>
        <tr><td>31–32</td><td>Transporté dans le Plan Astral jusqu'à la fin de votre prochain tour, puis retour à votre emplacement précédent.</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">33–34</td><td>Maximisez les dégâts du prochain sort d'attaque dans la prochaine minute.</td></tr>
        <tr><td>35–36</td><td>Lancez 1d10. Votre âge change de ce nombre d'années. Impair = rajeunit (min. 1 an), pair = vieillit.</td></tr>
        <tr><td>37–38</td><td>1d6 flumphs contrôlés par le MJ apparaissent dans un rayon de 18 m, effrayés par vous. Disparaissent après 1 minute.</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">39–40</td><td>Vous récupérez 2d10 PV.</td></tr>
        <tr><td style="color:#e53935;font-weight:600">41–42</td><td>Vous devenez une plante en pot jusqu'à votre prochain tour : neutralisé, vulnérabilité à tous les dégâts.</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">43–44</td><td>Pendant 1 minute, téléportation jusqu'à 6 m en action bonus à chaque tour.</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">45–46</td><td><strong>Lévitation</strong> sur vous-même.</td></tr>
        <tr><td>47–48</td><td>Une licorne contrôlée par le MJ apparaît à 1,50 m, disparaît après 1 minute.</td></tr>
        <tr><td>49–50</td><td>Vous ne pouvez pas parler pendant 1 minute (des bulles roses sortent de votre bouche à la place).</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">51–52</td><td>Bouclier spectral pendant 1 minute : +2 CA et immunité aux Projectiles magiques.</td></tr>
        <tr><td>53–54</td><td>Immunité à l'ivresse alcoolique pendant 5d6 jours.</td></tr>
        <tr><td>55–56</td><td>Vos cheveux tombent, mais repoussent en 24 heures.</td></tr>
        <tr><td>57–58</td><td>Pendant 1 minute, tout objet inflammable non porté que vous touchez s'enflamme.</td></tr>
        <tr><td style="color:#e53935;font-weight:600">59–60</td><td>Téléportation jusqu'à 18 m ; toutes les créatures dans l'espace d'arrivée subissent 1d10 dégâts de force.</td></tr>
        <tr><td style="color:#e53935;font-weight:600">61–62</td><td>Vous êtes effrayé par la créature la plus proche jusqu'à la fin de votre prochain tour.</td></tr>
        <tr><td>63–64</td><td>Toutes les créatures dans un rayon de 9 m deviennent invisibles pendant 1 minute (cesse si elles attaquent ou lancent un sort).</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">65–66</td><td>Résistance à tous les dégâts pendant 1 minute.</td></tr>
        <tr><td style="color:#e53935;font-weight:600">67–68</td><td>Une créature aléatoire dans un rayon de 18 m est empoisonnée pendant 1d4 heures.</td></tr>
        <tr><td>69–70</td><td>Lumière vive dans un rayon de 9 m pendant 1 minute. Créature terminant son tour à 1,50 m = aveuglée jusqu'à son prochain tour.</td></tr>
        <tr><td style="color:#e53935;font-weight:600">71–72</td><td><strong>Métamorphose</strong> sur vous-même. En cas d'échec au JS, vous devenez un mouton pour la durée du sort.</td></tr>
        <tr><td>73–74</td><td>Papillons illusoires et pétales de fleurs dans un rayon de 3 m pendant 1 minute (aucun effet mécanique).</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">75–76</td><td>Vous pouvez immédiatement prendre une action supplémentaire.</td></tr>
        <tr><td>77–78</td><td>Chaque créature dans un rayon de 9 m subit 1d10 dégâts nécrotiques. Vous récupérez autant de PV.</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">79–80</td><td><strong>Image miroir</strong>.</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">81–82</td><td><strong>Vol</strong> sur une créature aléatoire dans un rayon de 18 m.</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">83–84</td><td>Vous devenez invisible jusqu'au début de votre prochain tour (ou jusqu'à ce que vous attaquiez ou lanciez un sort).</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">85–86</td><td>Si vous mourez dans la prochaine minute, vous revenez à la vie comme par <em>Réincarnation</em>.</td></tr>
        <tr><td>87–88</td><td>Votre catégorie de taille augmente d'un cran pendant 1 minute.</td></tr>
        <tr><td style="color:#e53935;font-weight:600">89–90</td><td>Vous et toutes les créatures dans un rayon de 9 m gagnez la vulnérabilité aux dégâts perforants pendant 1 minute.</td></tr>
        <tr><td>91–92</td><td>Une musique éthérée vous entoure pendant 1 minute (aucun effet mécanique).</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">93–94</td><td>Vous récupérez votre emplacement de sort dépensé de plus bas niveau.</td></tr>
        <tr><td style="color:#e53935;font-weight:600">95–96</td><td>Pendant 1 minute, vous devez crier quand vous parlez.</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">97–98</td><td>Pendant 1 minute, à chaque sort lancé, le DD augmente de 2.</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">99–00</td><td><strong>Arrêt du temps</strong>.</td></tr>
      </table>
      </div>
      `)}
    </div>`)}
    ${ds('s-rencontres',`<div class="regles-section">
      ${dh('s-rencontres','⚔ Construction de rencontre')}
      ${rb('s-rencontres',`
        <div style="font-size:11px;color:var(--text3);margin-bottom:8px"><strong>Étapes :</strong> 1) Seuils XP du groupe par difficulté · 2) Additionner XP des monstres · 3) Appliquer le multiplicateur · 4) Comparer aux seuils.</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <div style="flex:1;min-width:200px">
            <div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:4px">Seuils XP par PJ et par niveau</div>
            <div style="max-height:210px;overflow-y:auto">
            <table class="regles-table" style="font-size:10px">
              <tr><th>Niv.</th><th style="color:#4caf50">Facile</th><th style="color:#ff9800">Moy.</th><th style="color:#f44336">Diff.</th><th style="color:#b71c1c">Mort.</th></tr>
              ${[...Array(20)].map((_,i)=>`<tr><td>${i+1}</td><td>${ENC_THRESHOLDS[i][0]}</td><td>${ENC_THRESHOLDS[i][1]}</td><td>${ENC_THRESHOLDS[i][2]}</td><td>${ENC_THRESHOLDS[i][3]}</td></tr>`).join('')}
            </table>
            </div>
          </div>
          <div style="flex:0 0 auto">
            <div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:4px">Multiplicateur</div>
            <table class="regles-table" style="font-size:11px">
              <tr><th>Monstres</th><th>×</th></tr>
              <tr><td>1</td><td>×1</td></tr>
              <tr><td>2</td><td>×1,5</td></tr>
              <tr><td>3–6</td><td>×2</td></tr>
              <tr><td>7–10</td><td>×2,5</td></tr>
              <tr><td>11–14</td><td>×3</td></tr>
              <tr><td>15+</td><td>×4</td></tr>
            </table>
            <div style="font-size:10px;color:var(--text3);margin-top:6px;line-height:1.5"><strong>Budget journalier</strong> :<br>6–8 rencontres Moyennes<br>avant épuisement.</div>
          </div>
        </div>
      `)}
    </div>`)}
    ${ds('s-alterations',`${gh('s-alterations','☣ Maladies, Poisons &amp; Folie')}
    ${rb('s-alterations',`
      <div class="g2" style="gap:10px">
        <div class="regles-section">
          <div class="pt">🤒 Maladies</div>
          <div style="font-size:11px;color:var(--text2);line-height:1.6">
            <strong>Fièvre rieuse</strong> (humanoïdes, gnomes immunisés) — Infection : contact à 3 m d'une victime en crise (JS CON DD 10). Symptômes 1d4h après. Gagne 1 niveau d'épuisement. Stress → JS CON DD 13 : échec = 5 (1d10) dégâts psychiques + incapable 1 min. Repos long : JS CON DD 13, succès = DD − 1d6. DD 0 = guérison. 3 échecs → folie illimitée.<br><br>
            <strong>Peste des égouts</strong> — Morsure de rat ou contact cadavre (JS CON DD 11). Symptômes 1d4 jours. Épuisement, dés de vie donnent ½ PV, 0 PV au repos long. Repos long : JS CON DD 11, échec = +1 épuisement, succès = −1. Niveau 0 = guérison.<br><br>
            <strong>Pourriture oculaire</strong> — Eau contaminée (JS CON DD 15). 1 jour après : −1 aux attaques et jets de vue. Fin de chaque repos long : malus +1. À −5 : aveugle. Guérison : sort ou onguent d'œil vif (3 doses).
          </div>
        </div>
        <div>
          <div class="regles-section" style="margin-bottom:10px">
            <div class="pt">☠ Poisons</div>
            <table class="regles-table" style="font-size:10px">
              <tr><th>Type</th><th>Activation</th></tr>
              <tr><td><strong>Blessure</strong></td><td>Armes, munitions, pièges tranchants/perforants</td></tr>
              <tr><td><strong>Contact</strong></td><td>Peau touchant l'objet enduit</td></tr>
              <tr><td><strong>Ingestion</strong></td><td>Dose entière dans nourriture/boisson</td></tr>
              <tr><td><strong>Inhalation</strong></td><td>Cube 1,5 m (poudre ou gaz, muqueuses)</td></tr>
            </table>
            <div style="max-height:170px;overflow-y:auto;margin-top:6px">
            <table class="regles-table" style="font-size:10px">
              <tr><th>Poison</th><th>Type</th><th>Prix/dose</th></tr>
              <tr><td>Essence éthérée</td><td>Inhalation</td><td>300 po</td></tr>
              <tr><td>Fumées d'othur</td><td>Inhalation</td><td>500 po</td></tr>
              <tr><td>Huile de taggit</td><td>Contact</td><td>400 po</td></tr>
              <tr><td>Larmes de minuit</td><td>Ingestion</td><td>1 500 po</td></tr>
              <tr><td>Malice</td><td>Inhalation</td><td>250 po</td></tr>
              <tr><td>Mucus de charognard</td><td>Contact</td><td>200 po</td></tr>
              <tr><td>Poison de ver pourpre</td><td>Blessure</td><td>2 000 po</td></tr>
              <tr><td>Poison de wiverne</td><td>Blessure</td><td>1 200 po</td></tr>
              <tr><td>Poison drow</td><td>Blessure</td><td>200 po</td></tr>
              <tr><td>Sang d'assassin</td><td>Ingestion</td><td>150 po</td></tr>
              <tr><td>Sérum de vérité</td><td>Ingestion</td><td>150 po</td></tr>
              <tr><td>Teinture pâle</td><td>Ingestion</td><td>250 po</td></tr>
              <tr><td>Torpeur</td><td>Ingestion</td><td>600 po</td></tr>
              <tr><td>Venin de serpent</td><td>Blessure</td><td>200 po</td></tr>
            </table>
            </div>
          </div>
          <div class="regles-section">
            <div class="pt">🧠 Folie</div>
            <div style="font-size:11px;color:var(--text2);line-height:1.5;margin-bottom:6px">JS SAG ou CHA pour résister. Guérison : <em>apaisement des émotions</em> (supprime), <em>restauration partielle</em> (courte/longue), <em>restauration supérieure</em> (illimitée).</div>
            <table class="regles-table" style="font-size:10px">
              <tr><th>Type</th><th>Durée</th><th>Exemples d'effet</th></tr>
              <tr><td><strong>Passagère</strong></td><td>1d10 min</td><td>Paralysé · Incapable + cri · Effrayé · Bégaiement · Attaque la créature la plus proche · Hallucinations (désav. jets) · Inconscient</td></tr>
              <tr><td><strong>Persistante</strong></td><td>1d10×10 h</td><td>Comportement compulsif · Paranoïa (désav. SAG/CHA) · Révulsion · Amnésie partielle · Tremblement (désav. FOR/DEX) · Aveugle ou sourd</td></tr>
              <tr><td><strong>Illimitée</strong></td><td>Jusqu'à guérison</td><td>Alcoolisme · Avarice · Se croit le plus fort · Conviction d'être traqué · Ami imaginaire · Ne prend rien au sérieux</td></tr>
            </table>
          </div>
        </div>
      </div>
    `)}`)}
    ${ds('s-objets-mag',`${gh('s-objets-mag','✨ Objets magiques')}
    ${rb('s-objets-mag',`
      <div class="g2" style="gap:10px">
        <div class="regles-section">
          <div class="pt">Rareté, niveau &amp; prix</div>
          <table class="regles-table" style="font-size:11px">
            <tr><th>Rareté</th><th>Niveau rec.</th><th>Prix indicatif</th></tr>
            ${Object.entries(RARITY_INFO).map(([name,ri])=>`<tr><td><span style="color:${ri.color}">■</span> ${name}</td><td>${ri.level}</td><td>${ri.price}</td></tr>`).join('')}
          </table>
          <div style="font-size:10px;color:var(--text3);margin-top:6px;line-height:1.5">Prix de revente = ½ du prix de liste. Objets consommables (potions, parchemins) = ½ prix.</div>
        </div>
        <div class="regles-section">
          <div class="pt">🔗 Attunement (Lien)</div>
          <div style="font-size:12px;color:var(--text2);line-height:1.7">
            • Maximum <strong>3 objets liés</strong> simultanément.<br>
            • Établir un lien : <strong>repos court</strong> passé en contact avec l'objet.<br>
            • Rompre un lien : <strong>repos court</strong>, ou mort du personnage.<br>
            • Certains objets exigent une condition (classe, alignement, don).<br><br>
            <strong>Catégories d'objets :</strong> Armure · Potion · Anneau · Sceptre · Parchemin · Bâton · Baguette · Arme · Objet merveilleux.<br><br>
            <strong>Objets intelligents</strong> — Possèdent FOR, DEX, CON, INT, SAG, CHA ainsi qu'une personnalité. Peuvent entrer en conflit (jet de CHA contre SAG de l'objet).<br><br>
            <strong>Artefacts</strong> — Objets uniques à propriétés majeures et mineures (bienfaits et fléaux). Ne peuvent être détruits que par des moyens spécifiques.
          </div>
        </div>
      </div>
    `)}`)}
    ${ds('s-pieges',`<div class="regles-section">
      ${dh('s-pieges','🪤 Pièges')}
      ${rb('s-pieges',`
        <div style="font-size:11px;color:var(--text2);margin-bottom:8px;line-height:1.6">
          <strong>Détecter :</strong> SAG (Perception) passive ou active vs DD du piège. <strong>Désamorcer :</strong> INT (Investigation) puis DEX (outils de voleur). Pièges magiques : INT (Arcanes) ou <em>dissipation de la magie</em>.
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <div style="flex:1;min-width:180px">
            <div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:4px">DD et bonus d'attaque</div>
            <table class="regles-table" style="font-size:11px">
              <tr><th>Danger</th><th>DD JS</th><th>Bonus att.</th></tr>
              <tr><td>Gênant</td><td>10–11</td><td>+3 à +5</td></tr>
              <tr><td>Dangereux</td><td>12–15</td><td>+6 à +8</td></tr>
              <tr><td>Mortel</td><td>16–20</td><td>+9 à +12</td></tr>
            </table>
          </div>
          <div style="flex:1;min-width:200px">
            <div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:4px">Dégâts par niveau</div>
            <table class="regles-table" style="font-size:11px">
              <tr><th>Niveaux PJ</th><th>Gênant</th><th>Dangereux</th><th>Mortel</th></tr>
              <tr><td>1–4</td><td>1d10</td><td>2d10</td><td>4d10</td></tr>
              <tr><td>5–10</td><td>2d10</td><td>4d10</td><td>10d10</td></tr>
              <tr><td>11–16</td><td>4d10</td><td>10d10</td><td>18d10</td></tr>
              <tr><td>17–20</td><td>10d10</td><td>18d10</td><td>24d10</td></tr>
            </table>
          </div>
        </div>
        <div style="font-size:11px;color:var(--text2);margin-top:8px;line-height:1.6">
          <strong>Pièges complexes</strong> — Font un jet d'initiative et agissent à chaque tour (comme un combat). Détection et désarmement identiques aux pièges simples.<br>
          <strong>Exemples :</strong> Aiguille empoisonnée · Chute de filet · Effondrement de plafond · Fléchettes empoisonnées · Fosse (simple/camouflée/à fermeture/hérissée) · Statue soufflant des flammes · Sphère roulante.
        </div>
      `)}
    </div>`)}
    ${ds('s-comparses',`${gh('s-comparses','🤝 Comparses (Sidekicks)')}
    ${rb('s-comparses',`
      <div style="font-size:11px;color:var(--text3);margin-bottom:8px">PNJ spéciaux qui rejoignent le groupe. Le MJ choisit le type ou laisse les joueurs décider. 3 types disponibles :</div>
      <div class="g2" style="gap:10px">
        <div class="regles-section">
          <div class="pt">⚔ Compagnon d'armes</div>
          <div style="font-size:10px;color:var(--text3);margin-bottom:4px">Maîtrise : toutes armures, armes courantes &amp; de guerre, boucliers</div>
          <table class="regles-table" style="font-size:10px">
            <tr><th>Niv.</th><th>PV max</th><th>Capacité</th></tr>
            <tr><td>1</td><td>13 (2d8+4)</td><td>Rôle martial</td></tr>
            <tr><td>2</td><td>19 (3d8+6)</td><td>Second souffle (1d10 + niv, 1×/repos court)</td></tr>
            <tr><td>3</td><td>26 (4d8+8)</td><td>Critique amélioré (19–20)</td></tr>
            <tr><td>4</td><td>32 (5d8+10)</td><td>Amélioration de caractéristique (+2/+1+1)</td></tr>
            <tr><td>5</td><td>39 (6d8+12)</td><td>Bonus de maîtrise +1</td></tr>
            <tr><td>6</td><td>45 (7d8+14)</td><td>Attaque supplémentaire (×2)</td></tr>
          </table>
        </div>
        <div class="regles-section">
          <div class="pt">🎭 Expert</div>
          <div style="font-size:10px;color:var(--text3);margin-bottom:4px">Maîtrise : armes courantes, rapières, épées courtes, armures légères</div>
          <table class="regles-table" style="font-size:10px">
            <tr><th>Niv.</th><th>PV max</th><th>Capacité</th></tr>
            <tr><td>1</td><td>11 (2d8+2)</td><td>Serviable, Outils</td></tr>
            <tr><td>2</td><td>16 (3d8+3)</td><td>Ruse (Foncer/Désengager/Se cacher en bonus)</td></tr>
            <tr><td>3</td><td>22 (4d8+4)</td><td>Expertise (×2 maîtrise sur 2 compétences)</td></tr>
            <tr><td>4</td><td>27 (5d8+5)</td><td>Amélioration de caractéristique (+2/+1+1)</td></tr>
            <tr><td>5</td><td>33 (6d8+6)</td><td>Bonus de maîtrise +1</td></tr>
            <tr><td>6</td><td>38 (7d8+7)</td><td>Attaque supplémentaire (×2)</td></tr>
          </table>
        </div>
        <div class="regles-section">
          <div class="pt">✨ Incantateur</div>
          <div style="font-size:10px;color:var(--text3);margin-bottom:4px">Maîtrise : armes courantes, armures légères. 2 rôles : Guérisseur ou Mage</div>
          <table class="regles-table" style="font-size:10px">
            <tr><th>Niv.</th><th>PV</th><th>Min.</th><th>Sorts</th><th>Emp1</th><th>Emp2</th><th>Capacité</th></tr>
            <tr><td>1</td><td>9 (2d8)</td><td>2</td><td>2</td><td>2</td><td>—</td><td>Rôle magique, Incantation</td></tr>
            <tr><td>2</td><td>13 (3d8)</td><td>2</td><td>2</td><td>2</td><td>—</td><td>+1 sort niv1 (bénédiction ou mains brûlantes)</td></tr>
            <tr><td>3</td><td>18 (4d8)</td><td>2</td><td>3</td><td>3</td><td>—</td><td>+1 sort niv1 (bouclier de la foi ou bouclier)</td></tr>
            <tr><td>4</td><td>22 (5d8)</td><td>3</td><td>3</td><td>3</td><td>—</td><td>Amélioration caract. (+sort mineur)</td></tr>
            <tr><td>5</td><td>27 (6d8)</td><td>3</td><td>4</td><td>4</td><td>2</td><td>Bonus de maîtrise +1 (+sort niv2)</td></tr>
            <tr><td>6</td><td>31 (7d8)</td><td>3</td><td>4</td><td>4</td><td>2</td><td>Sorts mineurs puissants (+mod. incant.)</td></tr>
          </table>
        </div>
      </div>
    `)}`)}
    ${ds('s-compendium',`<div class="regles-section">
      ${dh('s-compendium','📚 Compendium D&D 5e')}
      ${rb('s-compendium',`<div style="font-size:11px;color:var(--text3);margin-bottom:10px">Référence rapide — descriptions en français</div>
      <div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">
        <button class="btn bsm${_mjReglesComp==='classes'?' bprimary':''}" onclick="mjSetReglesComp('classes')">⚔ Classes${CLASSES_DB?' ('+CLASSES_DB.length+')':''}</button>
        <button class="btn bsm${_mjReglesComp==='dons'?' bprimary':''}" onclick="mjSetReglesComp('dons')">🎯 Dons${FEATS_DB?' ('+FEATS_DB.length+')':''}</button>
        <button class="btn bsm${_mjReglesComp==='races'?' bprimary':''}" onclick="mjSetReglesComp('races')">🧬 Races${RACES_DB?' ('+RACES_DB.length+')':''}</button>
        <button class="btn bsm${_mjReglesComp==='historiques'?' bprimary':''}" onclick="mjSetReglesComp('historiques')">📖 Historiques${BACKGROUNDS_DB?' ('+BACKGROUNDS_DB.length+')':''}</button>
        ${_mjReglesComp?'<button class="btn bsm" style="color:#e53935;border-color:#e53935" onclick="mjSetReglesComp(\'\')">✕ Fermer</button>':''}
      </div>
      ${_mjReglesComp?'<input class="fi" id="compSearch" placeholder="Rechercher..." oninput="mjFilterComp(this.value)" style="margin-bottom:8px" autofocus><div id="compResults" style="max-height:300px;overflow-y:auto"></div>':'<div style="font-size:12px;color:var(--text3);font-style:italic">Cliquez sur une catégorie pour rechercher.</div>'}`)}
    </div>`)}
  </div>`;
}

function mjSetReglesComp(cat){
  _mjReglesComp=cat;
  renderMJContent();
}

function mjFilterComp(q){
  const el=document.getElementById('compResults');if(!el)return;
  const db=_mjReglesComp==='dons'?FEATS_DB:_mjReglesComp==='races'?RACES_DB:_mjReglesComp==='historiques'?BACKGROUNDS_DB:_mjReglesComp==='classes'?CLASSES_DB:null;
  if(!db){el.innerHTML='<div style="font-size:12px;color:var(--text3);text-align:center;padding:8px">Compendium non chargé — revenez dans un instant.</div>';return;}
  if(!q.trim()){
    el.innerHTML='<div style="font-size:12px;color:var(--text3);text-align:center;padding:8px">Tapez pour rechercher parmi '+db.length+' entrées.</div>';
    return;
  }
  const low=q.toLowerCase();
  const res=[];
  for(let i=0;i<db.length&&res.length<20;i++){
    if(db[i].n&&db[i].n.toLowerCase().includes(low))res.push(db[i]);
  }
  if(!res.length){el.innerHTML='<div style="font-size:12px;color:var(--text3);text-align:center;padding:8px">Aucun résultat.</div>';return;}
  el.innerHTML=res.map(e=>{
    let meta='';
    if(e.ab)meta+=` · <span style="color:var(--cp)">${esc(e.ab)}</span>`;
    if(e.spd)meta+=` · Vit. ${esc(e.spd)} ft`;
    if(e.sk)meta+=` · Comp. : ${esc(_parseCompBGSkills(e.sk).join(', '))||esc(e.sk)}`;
    if(e.hd)meta+=` · d${esc(e.hd)} (dé de vie)`;
    if(e.ar)meta+=` · Armures : ${esc(e.ar)}`;
    if(e.wp)meta+=` · Armes : ${esc(e.wp)}`;
    return`<div style="border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:6px;background:var(--surface2)">
      <div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:4px">${esc(e.n)}</div>
      ${meta?`<div style="font-size:11px;color:var(--text3);margin-bottom:4px">${meta}</div>`:''}
      <div style="font-size:11px;color:var(--text2);line-height:1.5">${esc(e.tx||'')}</div>
    </div>`;
  }).join('');
}
