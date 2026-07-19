// TAB: HISTORIQUE
// ═══════════════════════════════════════
// ═══════════════════════════════════════
// TAB: JOURNAL
// ═══════════════════════════════════════
function tabJournal(p){
  return isMJ()?tabJournalMJ():tabJournalPlayer(p);
}

function _journalEntryForm(idPrefix,btnFn){
  const today=new Date().toISOString().slice(0,10);
  return`<div class="panel mb10">
    <div class="pt">📓 Nouvelle entrée</div>
    <div class="g2" style="gap:8px;margin-bottom:8px">
      <div><div class="fl mb6">Date</div><input class="fi" id="${idPrefix}Date" type="date" value="${today}"></div>
      <div><div class="fl mb6">Titre de session</div><input class="fi" id="${idPrefix}Title" placeholder="Ex: Session 3 — La mine" value="${esc(_journalDraft.title||'')}" oninput="_journalDraft.title=this.value"></div>
    </div>
    <div class="fl mb6">Notes${_journalDraft.content?'<span style="font-size:15px;color:var(--cp);margin-left:8px">● brouillon</span>':''}</div>
    <textarea class="fi mb6" id="${idPrefix}Content" rows="5" placeholder="Ce qui s'est passé ce soir..." style="resize:vertical" oninput="_journalDraft.content=this.value">${esc(_journalDraft.content||'')}</textarea>
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
      <label style="display:flex;align-items:center;gap:6px;font-size:18px;color:var(--text2);cursor:pointer">
        <input type="checkbox" id="${idPrefix}Public" style="accent-color:var(--cp)">
        <span>Visible dans la Chronique</span>
      </label>
      <button class="btn bac bsm" onclick="${btnFn}()">+ Ajouter</button>
    </div>
  </div>`;
}

function _journalEntriesList(entries, deleteFn){
  if(!entries||!entries.length) return`<div style="text-align:center;padding:24px;color:var(--text3);font-style:italic">Aucune entrée pour l'instant.</div>`;
  return`<div style="display:flex;flex-direction:column;gap:10px;max-height:520px;overflow-y:auto;padding-right:4px">
    ${[...entries].reverse().map((e,ri)=>{
      const realIdx=entries.length-1-ri;
      return`<div class="journal-entry ${e.isPublic?'public':'private'}">
        <div class="journal-entry-meta">
          <div>
            <span class="journal-session">${esc(e.sessionTitle||'Sans titre')}</span>
            <span class="journal-date" style="margin-left:8px">${esc(e.date||'')}</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:15px;color:${e.isPublic?'#4caf50':'var(--text3)'}">${e.isPublic?'✓ Chronique':'🔒 Privé'}</span>
            <button class="btn bsm" style="color:#e53935;border-color:#e53935;padding:1px 6px" onclick="${deleteFn}(${realIdx})">✕</button>
          </div>
        </div>
        <div class="journal-content">${esc(e.content||'')}</div>
      </div>`;
    }).join('')}
  </div>`;
}

function tabJournalPlayer(p){
  // REFONTE P3 : la Chronique a DÉMÉNAGÉ sur la page Groupe — plus de sous-onglet ici.
  // On garde le rendu chronicle pour l'arrivée via la page Groupe (openCampChronicle), avec un retour.
  if(_playerJournalSubTab==='chronicle'){
    return`<div><button class="ds-btn quiet" style="margin-bottom:10px" onclick="_playerJournalSubTab='entries';renderTab()">← Mes entrées</button>${renderChronicleView()}</div>`;
  }
  const entries=p.journal||[];
  return`<div>
    ${_journalEntryForm('j','addJournalEntry')}
    ${_journalEntriesList(entries,'deleteJournalEntry')}
  </div>`;
}

function addJournalEntry(){
  const p=P();
  if(!p.journal)p.journal=[];
  const date=document.getElementById('jDate')?.value||'';
  const title=document.getElementById('jTitle')?.value.trim()||'';
  const content=document.getElementById('jContent')?.value.trim()||'';
  const isPublic=document.getElementById('jPublic')?.checked||false;
  if(!content){showToast('❌ Écris quelque chose avant d\'ajouter.');return;}
  p.journal.push({id:Date.now(),date,sessionTitle:title,content,isPublic});
  _journalDraft={title:'',content:''};
  saveAll();renderTab();showToast('✅ Entrée ajoutée !');
}

function deleteJournalEntry(idx){
  const p=P();if(!p.journal)return;
  p.journal.splice(idx,1);saveAll();renderTab();
}

// Rendu adaptatif : joueur ou MJ screen
function renderCurrentView(){
  if(document.getElementById('mjScreen')?.style.display==='block')renderMJContent();
  else renderTab();
}

// ── JOURNAL MJ ──
function tabJournalMJ(){
  const subTabs=[
    {id:'mj',label:'📓 Mon journal'},
    {id:'players',label:'📖 Joueurs'},
    {id:'chronicle',label:'📜 Chronique'},
  ];
  const bar=`<div class="journal-subtab">
    ${subTabs.map(t=>`<button class="${_journalSubTab===t.id?'on':''}" onclick="_journalSubTab='${t.id}';renderCurrentView()">${t.label}</button>`).join('')}
  </div>`;

  if(_journalSubTab==='mj'){
    return`<div>${bar}
      ${_journalEntryForm('mj','addMJJournalEntry')}
      ${_journalEntriesList(_mjJournal,'deleteMJJournalEntry')}
    </div>`;
  }
  if(_journalSubTab==='players'){
    return`<div>${bar}${renderPlayersJournalView()}</div>`;
  }
  if(_journalSubTab==='chronicle'){
    return`<div>${bar}${renderChronicleView()}</div>`;
  }
  return`<div>${bar}</div>`;
}

async function addMJJournalEntry(){
  const date=document.getElementById('mjDate')?.value||'';
  const title=document.getElementById('mjTitle')?.value.trim()||'';
  const content=document.getElementById('mjContent')?.value.trim()||'';
  const isPublic=document.getElementById('mjPublic')?.checked||false;
  if(!content){showToast('❌ Écris quelque chose avant d\'ajouter.');return;}
  _mjJournal.push({id:Date.now(),date,sessionTitle:title,content,isPublic});
  await saveMJJournal();renderCurrentView();showToast('✅ Entrée ajoutée !');
}
async function deleteMJJournalEntry(idx){
  _mjJournal.splice(idx,1);await saveMJJournal();renderCurrentView();
}
async function saveMJJournal(){
  if(!currentUser||!currentCampaignId)return;
  try{
    await fbDb.collection('characters').doc(currentUser.uid+'_'+currentCampaignId+'_mj').set({
      entries:_mjJournal,npcs:_mjNPCs,objets:_mjObjets,userId:currentUser.uid,campaignId:currentCampaignId,
      updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    },{merge:true});
  }catch(e){showToast('❌ Erreur sauvegarde journal : '+e.message);}
}

// ── VUE JOURNAUX JOUEURS (MJ) ──
let _playersJournalData=null;
let _selectedPlayerJournal=null;

function renderPlayersJournalView(){
  if(!_playersJournalData){
    // Déclenchement du chargement
    loadPlayersJournalData();
    return`<div style="text-align:center;padding:24px"><span class="auth-spinner"></span> Chargement des journaux...</div>`;
  }
  const players=_playersJournalData;
  if(!players.length) return`<div style="text-align:center;padding:24px;color:var(--text3);font-style:italic">Aucun joueur n'a encore de journal.</div>`;

  const sel=_selectedPlayerJournal||players[0]?.uid;
  const selPlayer=players.find(p=>p.uid===sel)||players[0];
  const selectorHtml=`<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">
    ${players.map(p=>`<button class="btn bsm${p.uid===sel?' bac':''}" onclick="_selectedPlayerJournal='${p.uid}';renderCurrentView()">${p.avatar||'⚔'} ${esc(p.playerName)}</button>`).join('')}
  </div>`;

  if(!selPlayer) return selectorHtml+`<div style="color:var(--text3);font-style:italic">Sélectionnez un joueur.</div>`;
  const entries=selPlayer.journal||[];
  return selectorHtml+`<div style="font-size:18px;color:var(--text3);margin-bottom:10px">${esc(selPlayer.charName||'?')} — ${entries.length} entrée(s)</div>`
    +_journalEntriesList(entries,'()=>{}');
}

async function loadPlayersJournalData(){
  try{
    const snap=await fbDb.collection('characters').where('campaignId','==',currentCampaignId).get();
    const result=[];
    for(const doc of snap.docs){
      const d=doc.data();
      if(d.userId===currentUser.uid)continue; // skip MJ's own char
      if(doc.id.endsWith('_mj'))continue;
      const char=d.characterData||{};
      let playerName='Joueur';let avatar='⚔';
      try{const u=await fbDb.collection('users').doc(d.userId).get();if(u.exists){playerName=u.data().displayName||'Joueur';avatar=u.data().avatar||'⚔';}}catch(e){}
      result.push({uid:d.userId,playerName,avatar,charName:char.charName||'?',journal:char.journal||[]});
    }
    _playersJournalData=result;
    renderCurrentView();
  }catch(e){showToast('❌ Erreur chargement journaux : '+e.message);}
}

// ── CHRONIQUE (compilation) ──
function renderChronicleView(){
  if(!_compilationData){
    loadChronicleData();
    return`<div style="text-align:center;padding:24px"><span class="auth-spinner"></span> Compilation en cours...</div>`;
  }
  const bySession=_compilationData;
  if(!Object.keys(bySession).length) return`<div style="text-align:center;padding:24px;color:var(--text3);font-style:italic">Aucune entrée publique pour l'instant. Les joueurs doivent cocher "Visible dans la Chronique" lors de l'ajout.</div>`;

  const sessions=Object.keys(bySession).sort((a,b)=>{
    const da=bySession[a][0]?.date||'';const db2=bySession[b][0]?.date||'';return da.localeCompare(db2);
  });

  return`<div style="max-height:600px;overflow-y:auto;padding-right:4px">
    ${sessions.map(sess=>`<div class="chronicle-session">
      <div class="chronicle-session-title">📜 ${esc(sess)}</div>
      ${bySession[sess].map(v=>`<div class="chronicle-voice">
        <div class="chronicle-avatar">${v.avatar||'⚔'}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:17px;color:var(--cp);font-weight:600;margin-bottom:4px">${esc(v.playerName)} <span style="color:var(--text3);font-weight:400">— ${esc(v.charName)}</span> <span style="color:var(--text3);font-size:15px">${v.date||''}</span></div>
          <div class="journal-content">${esc(v.content)}</div>
        </div>
      </div>`).join('')}
    </div>`).join('')}
  </div>`;
}

async function loadChronicleData(){
  try{
    const snap=await fbDb.collection('characters').where('campaignId','==',currentCampaignId).get();
    const bySession={};
    for(const doc of snap.docs){
      if(doc.id.endsWith('_mj'))continue;
      const d=doc.data();const char=d.characterData||{};
      let playerName='Joueur';let avatar='⚔';
      try{const u=await fbDb.collection('users').doc(d.userId).get();if(u.exists){playerName=u.data().displayName||'Joueur';avatar=u.data().avatar||'⚔';}}catch(e){}
      for(const entry of (char.journal||[])){
        if(!entry.isPublic)continue;
        const key=entry.sessionTitle||'Sans titre';
        if(!bySession[key])bySession[key]=[];
        bySession[key].push({playerName,avatar,charName:char.charName||'?',content:entry.content,date:entry.date});
      }
    }
    _compilationData=bySession;
    renderCurrentView();
  }catch(e){showToast('❌ Erreur compilation : '+e.message);}
}

function tabHistorique(p){
  return`<div class="g2" style="gap:10px">
    <div>
      <div class="panel mb10">
        <div class="pt">Traits de personnalité</div>
        <div class="fl mb6">Trait</div><textarea class="fi mb6" rows="2" oninput="upd('traits',this.value);autoGrow(this)" style="resize:vertical">${esc(p.traits)}</textarea>
        <div class="fl mb6">Idéaux</div><textarea class="fi mb6" rows="2" oninput="upd('ideals',this.value);autoGrow(this)" style="resize:vertical">${esc(p.ideals)}</textarea>
        <div class="fl mb6">Liens</div><textarea class="fi mb6" rows="2" oninput="upd('bonds',this.value);autoGrow(this)" style="resize:vertical">${esc(p.bonds)}</textarea>
        <div class="fl mb6">Défauts</div><textarea class="fi" rows="2" oninput="upd('flaws',this.value);autoGrow(this)" style="resize:vertical">${esc(p.flaws)}</textarea>
      </div>
      <div class="panel" style="border-color:rgba(200,168,75,.3);background:rgba(200,168,75,.04)">
        <div class="pt" style="color:var(--cp)">🔐 Secrets <span style="font-size:15px;color:var(--text3);font-weight:400;margin-left:6px">Visible uniquement par toi et le MJ</span></div>
        <textarea class="fi" rows="2" oninput="upd('secrets',this.value);autoGrow(this)" placeholder="Informations secrètes sur ton personnage, objectifs cachés, traumatismes, liens secrets avec des PNJ..." style="resize:vertical">${esc(p.secrets||'')}</textarea>
      </div>
    </div>
    <div>
      <div class="panel mb10">
        <div class="pt">Maîtrises & langues</div>
        <div class="fl mb6">Maîtrises</div><textarea class="fi mb6" rows="2" oninput="upd('proficiencies',this.value);autoGrow(this)" style="resize:vertical">${esc(p.proficiencies)}</textarea>
        <div class="fl mb6">Langues</div><textarea class="fi mb6" rows="2" oninput="upd('languages',this.value);autoGrow(this)" style="resize:vertical">${esc(p.languages)}</textarea>
      </div>
      <div class="panel">
        <div class="pt">Backstory</div>
        <textarea class="fi" rows="3" oninput="upd('backstory',this.value);autoGrow(this)" placeholder="L'histoire de ton personnage..." style="resize:vertical">${esc(p.backstory)}</textarea>
      </div>
    </div>
  </div>`;
}

// ═══════════════════════════════════════
// ─────────────────────────────────────────
// CALCULATEUR DE RENCONTRE
// ─────────────────────────────────────────
function crToXP(cr){return CR_XP_TABLE[cr]||(parseFloat(cr)>0?CR_XP_TABLE[String(Math.round(parseFloat(cr)))]||0:0);}
function crToPB(cr){const v=cr==='1/8'?.125:cr==='1/4'?.25:cr==='1/2'?.5:parseFloat(cr)||0;if(v<5)return 2;if(v<9)return 3;if(v<13)return 4;if(v<17)return 5;if(v<21)return 6;if(v<25)return 7;if(v<29)return 8;return 9;}
function encMultiplier(n){if(n<=1)return 1;if(n===2)return 1.5;if(n<=6)return 2;if(n<=10)return 2.5;if(n<=14)return 3;return 4;}
function encCalc(groupSize,groupLevel,monsters){
  const lv=Math.min(20,Math.max(1,groupLevel));
  const thPerPc=ENC_THRESHOLDS[lv-1];
  const th=thPerPc.map(v=>v*groupSize);
  const rawXP=monsters.reduce((s,m)=>s+m.xp,0);
  const mult=encMultiplier(monsters.length);
  const adjXP=Math.round(rawXP*mult);
  let diff='—';let diffColor='var(--text3)';
  if(monsters.length){
    if(adjXP>=th[3]){diff='Mortelle';diffColor='#e53935';}
    else if(adjXP>=th[2]){diff='Difficile';diffColor='#ff9800';}
    else if(adjXP>=th[1]){diff='Moyenne';diffColor='#fdd835';}
    else if(adjXP>=th[0]){diff='Facile';diffColor='#4caf50';}
    else{diff='Triviale';diffColor='var(--text3)';}
  }
  return{th,rawXP,adjXP,mult,diff,diffColor};
}
function encRefresh(){
  const sz=parseInt(document.getElementById('enc_size')?.value)||4;
  const lv=Math.min(20,Math.max(1,parseInt(document.getElementById('enc_level')?.value)||5));
  _encGroupSize=sz;_encGroupLevel=lv;
  const r=document.getElementById('enc_result');
  if(r)r.innerHTML=encResultHTML(sz,lv);
}
function encResultHTML(sz,lv){
  const res=encCalc(sz,lv,_encMonsters);
  if(!_encMonsters.length)return'<div style="font-size:17px;color:var(--text3);text-align:center;padding:6px">Ajoutez des monstres pour voir la difficulté.</div>';
  const names=['Facile','Moyenne','Difficile','Mortelle'];
  const bars=res.th.map((v,i)=>`<div style="font-size:15px;color:var(--text3)">${names[i]}<br><strong style="color:var(--text2)">${v.toLocaleString()}</strong></div>`).join('');
  return`<div style="background:var(--surface2);border-radius:8px;padding:10px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <div>
        <div style="font-size:17px;color:var(--text3)">XP brut — ×${res.mult} → XP ajusté</div>
        <div style="font-size:22px;font-weight:700;color:var(--text)">${res.rawXP.toLocaleString()} → <span style="color:var(--cp)">${res.adjXP.toLocaleString()} XP</span></div>
      </div>
      <div style="text-align:right">
        <div style="font-size:15px;color:var(--text3)">Difficulté</div>
        <div style="font-size:25px;font-weight:700;color:${res.diffColor}">${res.diff}</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;text-align:center;padding:6px 0;border-top:1px solid var(--border)">${bars}</div>
  </div>`;
}
function encRenderMonsters(){
  const el=document.getElementById('enc_monsterList');if(!el)return;
  el.innerHTML=_encMonsters.length?_encMonsters.map((m,i)=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">
    <span style="font-size:18px"><strong>${esc(m.name)}</strong> <span style="color:var(--text3)">CR ${m.cr}</span> — <span style="color:var(--cp)">${m.xp.toLocaleString()} XP</span></span>
    <button class="btn bsm" style="color:#e53935;border-color:rgba(229,57,53,.4);padding:0 6px" onclick="encRemoveMonster(${i})">✕</button>
  </div>`).join(''):'<div style="font-size:17px;color:var(--text3);font-style:italic;text-align:center;padding:8px">Aucun monstre — ajoutez-en ci-dessus.</div>';
  encRefresh();
}
function encAddMonster(){
  const crOpts=['0','1/8','1/4','1/2',...Array.from({length:30},(_,i)=>String(i+1))];
  openModal(`<div class="pt">➕ Ajouter un monstre</div>
    <div class="g2" style="gap:8px;margin-bottom:12px">
      <div><div class="fl mb6">Nom (optionnel)</div><input class="fi" id="enc_mname" placeholder="Gobelin, Ogre..."></div>
      <div><div class="fl mb6">Facteur de Puissance (CR)</div>
        <select class="fi" id="enc_mcr" onchange="document.getElementById('enc_mxp').textContent=crToXP(this.value).toLocaleString()+' XP'">
          ${crOpts.map(c=>`<option value="${c}"${c==='1'?' selected':''}>${c}</option>`).join('')}
        </select>
      </div>
    </div>
    <div style="text-align:center;font-size:18px;color:var(--text3);margin-bottom:14px">XP : <strong id="enc_mxp" style="color:var(--cp)">200 XP</strong></div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:14px">
      ${[1,2,3,4,5,6].map(n=>`<button class="btn bsm" onclick="for(let i=0;i<${n}-1;i++)encConfirmAddMonster(false);encConfirmAddMonster(true);" style="font-size:17px">×${n}</button>`).join('')}
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="encConfirmAddMonster(true)">✓ Ajouter</button>
    </div>`);
}
function encConfirmAddMonster(andClose){
  const name=(document.getElementById('enc_mname')?.value?.trim())||'Monstre';
  const cr=(document.getElementById('enc_mcr')?.value||'1');
  const xp=crToXP(cr);
  _encMonsters.push({name,cr,xp});
  if(andClose)closeModal();
  encRenderMonsters();
}
function encRemoveMonster(i){_encMonsters.splice(i,1);encRenderMonsters();}
async function encDistribute(){
  if(!_encMonsters.length){showToast('❌ Aucun monstre dans la rencontre.');return;}
  if(!_mjPlayersData.length){showToast('❌ Aucun joueur dans la campagne.');return;}
  const xpPerPlayer=Math.round(_encMonsters.reduce((s,m)=>s+m.xp,0)/_mjPlayersData.length);
  if(!xpPerPlayer){showToast('❌ XP nul.');return;}
  let ok=0;
  for(const pp of _mjPlayersData){
    try{
      const ref=fbDb.collection('characters').doc(pp.uid+'_'+currentCampaignId);
      const doc=await ref.get();
      if(!doc.exists)continue;
      const cd=doc.data().characterData||{};
      const oldXP=cd.xp||0;
      cd.xp=oldXP+xpPerPlayer;
      await ref.update({'characterData.xp':cd.xp});
      ok++;
    }catch(e){}
  }
  showToast(`⭐ ${xpPerPlayer.toLocaleString()} XP distribués à ${ok} joueur(s) !`);
  _encMonsters=[];encRenderMonsters();
}

