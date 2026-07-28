let _mjV2JournalUnsub=null,_mjV2JournalTableId=null;
let _mjJournalView='notes';
function _ensureMjV2Journal(){
  if(!(typeof v2CompatService!=='undefined'&&v2CompatService.isEnabled())
    ||typeof v2GroupService==='undefined'||!currentTableId)return;
  if(_mjV2JournalTableId===currentTableId&&typeof _mjV2JournalUnsub==='function')return;
  if(typeof _mjV2JournalUnsub==='function')_mjV2JournalUnsub();
  _mjV2JournalTableId=currentTableId;
  _mjV2JournalUnsub=v2GroupService.listenGmJournal(
    currentTableId,
    snapshot=>{
      _mjJournal=snapshot.docs.map(doc=>{
        const data=doc.data();
        return{
          ...data,
          _v2Id:doc.id,
          sessionTitle:data.title||'',
          date:typeof _dsChronicleDate==='function'?_dsChronicleDate(data.createdAt):'',
          state:data.state||'notes',
          isPublic:false
        };
      });
      if(_mjTab==='journal')renderMJContent();
    },
    ()=>{_mjJournal=[];if(_mjTab==='journal')renderMJContent();}
  );
}
function mjSetJournalView(view){
  _mjJournalView=['notes','pinned','archived'].includes(view)?view:'notes';
  renderMJContent();
}
function _mjJournalV2List(){
  const entries=(_mjJournal||[]).filter(entry=>(entry.state||'notes')===_mjJournalView);
  if(!entries.length)return`<div class="ds-note" style="padding:18px;text-align:center;font-style:italic">Aucune note dans cette vue.</div>`;
  const stateActions={
    notes:[['pinned','📌 Épingler'],['archived','🗄 Archiver']],
    pinned:[['notes','↩ Désépingler'],['archived','🗄 Archiver']],
    archived:[['notes','↩ Restaurer']]
  };
  return`<div style="display:flex;flex-direction:column;gap:9px">
    ${entries.map((entry,index)=>`<article class="journal-entry private">
      <div class="journal-entry-meta">
        <div>
          <span class="journal-session">${esc(entry.title||'Note sans titre')}</span>
          <span class="journal-date" style="margin-left:8px">${esc(entry.date||'')}</span>
        </div>
        <span class="ds-chip" style="font-size:10px">${entry.campaignId?'Campagne':'Table entière'}</span>
      </div>
      <div class="journal-content" style="white-space:pre-wrap">${esc(entry.content||'')}</div>
      ${entry.linkType&&entry.linkId?`<div class="ds-note" style="margin-top:7px">🔗 ${esc(entry.linkType)} · ${esc(entry.linkId)}</div>`:''}
      <div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:9px">
        <button class="btn bsm" onclick="mjEditJournalEntry(${index})">✏ Modifier</button>
        <button class="btn bsm" style="color:var(--cp);border-color:rgba(200,168,75,.45)" onclick="mjPublishJournalToChronicle(${index})" title="Rendre cette note publique dans la Chronique">📜 Publier</button>
        ${(stateActions[_mjJournalView]||[]).map(([state,label])=>`<button class="btn bsm" onclick="mjUpdateJournalState(${index},'${state}')">${label}</button>`).join('')}
        <button class="btn bsm bdanger" style="margin-left:auto" onclick="mjDeleteJournalV2(${index})">✕</button>
      </div>
    </article>`).join('')}
  </div>`;
}
// ═══════════════════════════════════════════════════════════════════════════
//  PUBLIER UNE NOTE DÉJÀ ÉCRITE DANS LA CHRONIQUE (demande du 2026-07-25)
//  Le choix de destination à la saisie ne servait qu'aux notes NEUVES : une note
//  privée écrite pendant la partie restait prisonnière du journal.
//  L'écriture passe par _journalWriteV2 (point unique, player/journal.js).
//
//  ⚠️ La note d'origine n'est PAS marquée « publiée » : updateGmJournalEntry
//  n'accepte que title / content / state (liste blanche du service), et élargir
//  le contrat de données pour un simple drapeau ne le vaut pas. D'où la
//  confirmation ci-dessous — c'est elle qui protège du double envoi.
// ═══════════════════════════════════════════════════════════════════════════
function mjPublishJournalToChronicle(index){
  const entry=(_mjJournal||[]).filter(item=>(item.state||'notes')===_mjJournalView)[index];
  if(!entry)return;
  window._mjPendingChronicle=entry;
  const apercu=(entry.content||'').slice(0,160);
  openModal(`<div class="pt">📜 Publier dans la Chronique</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:12px">
      Cette note deviendra <b>visible par tout le groupe</b> dans la Chronique de la campagne.
      Elle <b>reste aussi dans ton journal</b>.
    </div>
    <div class="journal-content" style="white-space:pre-wrap;margin-bottom:14px;opacity:.85">${esc(apercu)}${(entry.content||'').length>160?'…':''}</div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="mjConfirmPublishChronicle()">📜 Publier</button>
    </div>`);
}
async function mjConfirmPublishChronicle(){
  const entry=window._mjPendingChronicle;
  window._mjPendingChronicle=null;
  if(!entry)return;
  closeModal();
  try{
    await _journalWriteV2({
      asMJ:true,
      title:entry.title||'',
      content:entry.content||'',
      visibility:'chronicle'
    });
    showToast('✅ Note publiée dans la Chronique.');
  }catch(e){showToast('❌ Publication impossible : '+e.message);}
}
async function mjDeleteJournalV2(index){
  const entry=(_mjJournal||[]).filter(item=>(item.state||'notes')===_mjJournalView)[index];
  if(!entry?._v2Id)return;
  try{
    await v2GroupService.deleteGmJournalEntry(currentTableId,entry._v2Id);
    showToast('🗑 Note supprimée.');
  }catch(e){showToast('❌ Suppression impossible : '+e.message);}
}
async function mjUpdateJournalState(index,state){
  const entry=(_mjJournal||[]).filter(item=>(item.state||'notes')===_mjJournalView)[index];
  if(!entry?._v2Id)return;
  try{
    await v2GroupService.updateGmJournalEntry(currentTableId,entry._v2Id,{state});
    showToast(state==='pinned'?'📌 Note épinglée.':state==='archived'?'🗄 Note archivée.':'↩ Note restaurée.');
  }catch(e){showToast('❌ Modification impossible : '+e.message);}
}
function mjEditJournalEntry(index){
  const entry=(_mjJournal||[]).filter(item=>(item.state||'notes')===_mjJournalView)[index];
  if(!entry?._v2Id)return;
  openModal(`<div class="pt">✏ Modifier la note</div>
    <div class="fl mb6">Titre (facultatif)</div>
    <input class="fi" id="mjEditJournalTitle" value="${esc(entry.title||'')}" style="margin-bottom:8px">
    <div class="fl mb6">Note</div>
    <textarea class="fi" id="mjEditJournalContent" rows="7" style="resize:vertical;margin-bottom:12px">${esc(entry.content||'')}</textarea>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="mjConfirmJournalEdit('${entry._v2Id}')">Enregistrer</button>
    </div>`);
}
async function mjConfirmJournalEdit(entryId){
  const title=(document.getElementById('mjEditJournalTitle')?.value||'').trim();
  const content=(document.getElementById('mjEditJournalContent')?.value||'').trim();
  if(!content){showToast('❌ La note ne peut pas être vide.');return;}
  try{
    await v2GroupService.updateGmJournalEntry(currentTableId,entryId,{title,content});
    closeModal();showToast('✅ Note mise à jour.');
  }catch(e){showToast('❌ Modification impossible : '+e.message);}
}
function mjTabJournalScreen(){
  _ensureMjV2Journal();
  return tabJournalMJ();
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
