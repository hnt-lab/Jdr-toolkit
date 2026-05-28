// ═══════════════════════════════════════
// UTILITAIRES
// ═══════════════════════════════════════
function uploadPortrait(input){
  const file=input.files[0];if(!file)return;
  if(!['image/jpeg','image/png'].includes(file.type)){showToast('❌ Format non supporté. Utilisez JPG ou PNG.');input.value='';return;}
  if(file.size>512000){showToast('❌ Image trop lourde (max 500 Ko). Compressez-la avant import.');input.value='';return;}
  const reader=new FileReader();
  reader.onload=e=>{upd('portrait',e.target.result);render();};
  reader.readAsDataURL(file);
}
function openModal(html){const m=document.getElementById('modal');m.className='open';m.innerHTML=`<div class="modal-box" style="max-width:480px">${html}</div>`;}
function openWideModal(html){const m=document.getElementById('modal');m.className='open';m.innerHTML=`<div class="modal-box" style="max-width:600px">${html}</div>`;}
function closeModal(){const m=document.getElementById('modal');if(m){m.className='';m.innerHTML='';}if(typeof _tutoRemoveHighlight==='function')_tutoRemoveHighlight();}
document.addEventListener('click',e=>{
  if(document.getElementById('modal')?.className==='open'&&e.target===document.getElementById('modal'))closeModal();
  ['classeDrop','bgDropPerso','bgDropCre'].forEach(id=>{const d=document.getElementById(id);if(d&&!d.contains(e.target))d.style.display='none';});
});
function showToast(html,duration=3000){let t=document.getElementById('toast');if(!t){t=document.createElement('div');t.id='toast';t.style.cssText='position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--surface2);border:1px solid var(--cp);border-radius:8px;padding:10px 18px;font-size:13px;color:var(--text);z-index:9999;max-width:400px;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,.5)';document.body.appendChild(t);}t.innerHTML=html;t.style.display='block';clearTimeout(t._timer);t._timer=setTimeout(()=>{t.style.display='none';},duration);}

// ═══ DÉCLARATIONS ANTICIPÉES MJ (évite ReferenceError) ═══
function openMJCreateItem(){mjModal('item');}
function openMJCreateSpell(){mjModal('spell');}
function openMJCreateCombatFeat(){mjModal('feat');}
const _TYPE_LABEL_TO_CODE={'Arme de mêlée':'M','Arme à distance':'R','Armure légère':'LA','Armure intermédiaire':'MA','Armure lourde':'HA','Bouclier':'S','Bâton / Baguette':'ST','Anneau':'RG','Potion':'P','Parchemin':'SC','Objet magique':'WD','Munitions':'A','Équipement / Divers':'G'};
function _openMJCreateItem(){
  openModal(`<div class="pt">🎲 Créer un objet</div>
    <div class="fl mb6">Nom</div><input class="fi mb6" id="mjci_name" placeholder="Épée courte +1...">
    <div class="g2" style="gap:8px;margin-bottom:8px">
      <div><div class="fl mb6">Type</div>
        <select class="fi" id="mjci_type">
          ${Object.keys(_TYPE_LABEL_TO_CODE).map(l=>`<option value="${_TYPE_LABEL_TO_CODE[l]}">${_TYPE_ICON[_TYPE_LABEL_TO_CODE[l]]||'📦'} ${l}</option>`).join('')}
        </select>
      </div>
      <div><div class="fl mb6">Magique ?</div>
        <select class="fi" id="mjci_magic"><option value="0">Non</option><option value="1">Oui ✨</option></select>
      </div>
    </div>
    <div class="fl mb6">Description (optionnel)</div>
    <input class="fi mb10" id="mjci_desc" placeholder="Effets, bonus...">
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="_confirmMJCreateItem()">✓ Ajouter au sac</button>
    </div>`);
}
function _confirmMJCreateItem(){
  const name=(document.getElementById('mjci_name')?.value||'').trim();
  if(!name){showToast('❌ Nom requis.');return;}
  const itemType=document.getElementById('mjci_type')?.value||'';
  const magic=document.getElementById('mjci_magic')?.value==='1';
  const desc=(document.getElementById('mjci_desc')?.value||'').trim();
  _addToInventory(P(),{name,qty:1,desc,magic,linkedTo:'',itemType});
  closeModal();render();showToast(`✓ "${name}" ajouté au sac.`);
}
function mjModal(type){
  if(type==='item')_openMJCreateItem();
  else if(type==='spell')_openMJCreateSpell();
  else if(type==='feat')_openMJCreateCombatFeat();
}

// ═══ MJ POOL (shared storage) ═══
let mjPool={customSpells:[],customItems:[]};

async function loadMJPool(){
  try{
    const saved=localStorage.getItem('dnd5e_mj_pool');
    if(saved)mjPool=JSON.parse(saved);
  }catch(e){}
}
async function saveMJPool(){
  if(_mjActiveCompId&&_mjCompLib[_mjActiveCompId]){
    _mjCompLib[_mjActiveCompId].spells=mjPool.customSpells||[];
    _mjCompLib[_mjActiveCompId].items=mjPool.customItems||[];
    await saveMJCompLib();
  }else{
    try{localStorage.setItem('dnd5e_mj_pool',JSON.stringify(mjPool));}catch(e){}
  }
}

// ═══ MODE MJ ═══
let mjMode=false;
function isMJ(){return mjMode;}
function toggleMJ(){
  mjMode=!mjMode;
  render();
  showToast(mjMode?'🎲 Mode MJ activé':'👤 Mode Joueur activé');
}
// ═══════════════════════════════════════
let diceOpen=false;
let diceHistory=[];
let _whisperTarget=-1;
let _lastRollResultHtml='';
let _journalDraft={title:'',content:''};

function createDiceButton(){
  // Panel de raccourcis (appui long) — contenu reconstruit dynamiquement à l'ouverture
  const sp=document.createElement('div');
  sp.id='diceShortcuts';
  sp.style.cssText=`position:fixed;bottom:88px;right:24px;z-index:889;display:none;flex-direction:column;gap:10px;align-items:flex-end;`;
  document.body.appendChild(sp);

  const btn=document.createElement('div');
  btn.id='diceFloat';
  btn.innerHTML='🎲';
  btn.style.cssText=`position:fixed;bottom:24px;right:24px;z-index:888;width:52px;height:52px;border-radius:50%;background:var(--cp);color:#1a1400;font-size:22px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.5);transition:transform .15s;user-select:none;`;
  btn.onmouseenter=()=>btn.style.transform='scale(1.1)';
  btn.onmouseleave=()=>btn.style.transform='scale(1)';
  let _pressTimer=null,_longActivated=false;
  function _startPress(){_longActivated=false;_pressTimer=setTimeout(()=>{_longActivated=true;_openDiceShortcuts();},450);}
  function _endPress(){clearTimeout(_pressTimer);if(!_longActivated)toggleDicePanel();_longActivated=false;}
  btn.addEventListener('mousedown',_startPress);
  btn.addEventListener('touchstart',e=>{e.preventDefault();_startPress();},{passive:false});
  btn.addEventListener('mouseup',_endPress);
  btn.addEventListener('touchend',e=>{e.preventDefault();_endPress();},{passive:false});
  btn.addEventListener('mouseleave',()=>{clearTimeout(_pressTimer);_longActivated=false;});
  document.body.appendChild(btn);

  const panel=document.createElement('div');
  panel.id='dicePanel';
  panel.style.cssText=`position:fixed;bottom:86px;right:24px;z-index:887;width:300px;background:var(--surface);border:1px solid var(--cp);border-radius:12px;padding:14px;box-shadow:0 8px 32px rgba(0,0,0,.6);display:none;max-height:80vh;overflow-y:auto;`;
  document.body.appendChild(panel);
}
function _openDiceShortcuts(){
  const sp=document.getElementById('diceShortcuts');if(!sp)return;
  // Reconstruction à chaque ouverture pour avoir le portrait à jour
  const p=P();
  const portrait=p?.portrait||p?.equipPortrait;
  const avatarEl=portrait
    ?`<img src="${portrait}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block">`
    :`<span style="font-size:20px">${currentUserData?.avatar||'⚔'}</span>`;
  sp.innerHTML=`
    <div style="display:flex;align-items:center;gap:8px">
      <span style="font-size:12px;color:var(--cp);background:var(--surface);padding:4px 10px;border-radius:20px;border:1px solid var(--border);white-space:nowrap">Journal</span>
      <button style="width:44px;height:44px;border-radius:50%;background:var(--surface);border:2px solid var(--cp);color:var(--cp);font-size:20px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.4)" onclick="_diceNav('journal')">📓</button>
    </div>
    <div style="display:flex;align-items:center;gap:8px">
      <span style="font-size:12px;color:var(--cp);background:var(--surface);padding:4px 10px;border-radius:20px;border:1px solid var(--border);white-space:nowrap">Personnage</span>
      <button style="width:44px;height:44px;border-radius:50%;overflow:hidden;background:var(--surface);border:2px solid var(--cp);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.4);padding:0" onclick="_diceNav('perso')">${avatarEl}</button>
    </div>`;
  sp.style.display='flex';
  setTimeout(()=>document.addEventListener('click',_closeDiceShortcutsOutside,{once:true}),50);
}
function _diceNav(tab){
  _closeDiceShortcuts();
  const app=document.getElementById('app');
  if(app&&app.style.display!=='none'){
    setTab(tab);
  }else if(P()){
    showApp();setTimeout(()=>setTab(tab),0);
  }else if(currentTableId&&currentCampaignId&&!isMJ()){
    enterCampaign(currentTableId,currentCampaignId).then(()=>{if(tab!=='perso')setTab(tab);}).catch(()=>{});
  }else{
    showToast('Ouvrez votre fiche depuis le Hub pour utiliser ce raccourci.');
  }
}
function _closeDiceShortcuts(){const sp=document.getElementById('diceShortcuts');if(sp)sp.style.display='none';}
function _closeDiceShortcutsOutside(e){
  const sp=document.getElementById('diceShortcuts');
  const btn=document.getElementById('diceFloat');
  if(sp&&!sp.contains(e.target)&&btn&&!btn.contains(e.target))sp.style.display='none';
}

function toggleDicePanel(){
  diceOpen=!diceOpen;
  const panel=document.getElementById('dicePanel');
  if(!panel)return;
  if(diceOpen){renderDicePanel();panel.style.display='block';}
  else panel.style.display='none';
}

function renderDicePanel(){
  const panel=document.getElementById('dicePanel');if(!panel)return;
  const p=P();
  if(!p||!p.abilities){
    panel.innerHTML=`<div style="font-family:var(--F);font-size:13px;color:var(--cp);letter-spacing:.06em;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center"><span>🎲 Lanceur de dés</span><span onclick="toggleDicePanel()" style="cursor:pointer;color:var(--text3);font-size:16px">×</span></div>
    <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:12px">${['d4','d6','d8','d10','d12','d20','d100'].map(d=>`<button onclick="diceRollFree('${d}')" style="padding:5px 9px;border:1px solid var(--border);border-radius:6px;font-size:12px;cursor:pointer;background:var(--surface2);color:var(--text2);font-family:var(--B)" onmouseenter="this.style.borderColor='var(--cp)';this.style.color='var(--cp)'" onmouseleave="this.style.borderColor='var(--border)';this.style.color='var(--text2)'">${d}</button>`).join('')}</div>
    <div id="diceResultFree" style="padding:8px;background:var(--surface2);border-radius:6px;display:none;font-size:14px;font-weight:600;color:var(--cp);text-align:center;margin-bottom:8px"></div>
    <div style="font-size:11px;color:var(--text3);text-align:center;font-style:italic">Entrez dans une campagne pour les jets de caractéristiques.</div>
    ${currentTableId?`<div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--border)"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em">Chuchotements</div><button onclick="openWhisperModal()" style="padding:4px 10px;border:1px solid var(--cp);border-radius:6px;font-size:11px;cursor:pointer;background:transparent;color:var(--cp);font-family:var(--B)">🤫 Chuchoter</button></div>${(typeof _whisperHistory!=='undefined'&&_whisperHistory.length)?_whisperHistory.slice(0,5).map(w=>`<div style="padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px;font-size:11px"><div style="color:var(--cp);font-weight:600;margin-bottom:1px">${esc(w.fromName||'?')}</div><div style="color:var(--text2)">${esc(w.message||'')}</div></div>`).join(''):'<div style="font-size:11px;color:var(--text3);font-style:italic">Aucun chuchotement reçu.</div>'}</div>`:''}`;
    return;
  }
  const mc=mainClass(p);const lvl=totalLevel(p);
  const saves=CLASS_SAVES[mc?mc.name:'']||[];
  const barbareLvl=((p.classes||[]).find(c=>c.name==='Barbare')||{}).level||0;
  const rageActive=barbareLvl>0&&(p.combatCharges||{})['RageActive']===true;

  // Stats avec bonus statuts
  const finalAbilities=p.abilities.map((v,i)=>{
    const statKey=ABILITIES_SH[i].toLowerCase();
    const bonus=(p.statuses||[]).filter(s=>s.stat===statKey).reduce((a,s)=>a+(parseInt(s.value)||0),0);
    return v+bonus;
  });

  panel.innerHTML=`
  <div style="font-family:var(--F);font-size:13px;color:var(--cp);letter-spacing:.06em;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
    <span>🎲 Lanceur de dés</span>
    <span onclick="toggleDicePanel()" style="cursor:pointer;color:var(--text3);font-size:16px">×</span>
  </div>

  <!-- Statuts actifs -->
  ${(()=>{const p=P();const activeStatus=(p.statuses||[]).filter(s=>s.rollPenalty||s.rollBonus||s.name==='Invisible');if(!activeStatus.length)return'';return`<div style="padding:6px 8px;background:var(--surface2);border-radius:6px;margin-bottom:10px;font-size:11px"><span style="color:var(--text3)">Statuts actifs :</span> ${activeStatus.map(s=>`<span class="status-badge ${s.type}" style="font-size:10px;padding:2px 6px">${s.icon} ${esc(s.name)}</span>`).join(' ')}</div>`;})()}

  <!-- Dés libres -->
  <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Dés libres</div>
  <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:12px">
    ${['d4','d6','d8','d10','d12','d20','d100'].map(d=>`<button onclick="diceRoll('${d}','${d} libre')" style="padding:5px 9px;border:1px solid var(--border);border-radius:6px;font-size:12px;cursor:pointer;background:var(--surface2);color:var(--text2);transition:all .15s;font-family:var(--B)" onmouseenter="this.style.borderColor='var(--cp)';this.style.color='var(--cp)'" onmouseleave="this.style.borderColor='var(--border)';this.style.color='var(--text2)'">${d}</button>`).join('')}
  </div>
  <div style="display:flex;gap:6px;margin-bottom:14px;align-items:center">
    <input id="diceQty" type="number" min="1" max="20" value="1" style="width:48px;background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:5px 6px;color:var(--text);font-size:13px;text-align:center;outline:none">
    <span style="color:var(--text3);font-size:13px">×</span>
    <select id="diceType" style="flex:1;background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:5px 8px;color:var(--text);font-size:13px;outline:none">
      ${['d4','d6','d8','d10','d12','d20','d100'].map(d=>`<option>${d}</option>`).join('')}
    </select>
    <button onclick="diceRollCustom()" style="padding:5px 12px;border:1px solid var(--cp);border-radius:6px;font-size:12px;cursor:pointer;background:var(--cp);color:#1a1400;font-weight:600;font-family:var(--B)">Lancer</button>
  </div>

  <!-- Jets de caractéristiques -->
  <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Jets de caractéristiques</div>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:12px">
    ${ABILITIES.map((ab,i)=>{
      const m=mod(finalAbilities[i]);
      const isRageFor=rageActive&&i===0;
      const rollType=isRageFor?'for-carac':'';
      const btnBorder=isRageFor?'#e53935':'var(--border)';
      const btnColor=isRageFor?'#e53935':'var(--text2)';
      const btnBg=isRageFor?'rgba(229,57,53,.08)':'var(--surface2)';
      return`<button onclick="diceRoll('d20','${ab}',${m},'${rollType}')" style="padding:6px 4px;border:1px solid ${btnBorder};border-radius:6px;font-size:11px;cursor:pointer;background:${btnBg};color:${btnColor};transition:all .15s;font-family:var(--B);text-align:center" onmouseenter="this.style.borderColor='var(--cp)';this.style.color='var(--cp)'" onmouseleave="this.style.borderColor='${btnBorder}';this.style.color='${btnColor}'">
        <div style="font-weight:600">${ABILITIES_SH[i]}</div>
        <div style="color:${isRageFor?'#e53935':'var(--cp)'};font-size:12px">${fmt(m)}${isRageFor?' 🔥':''}</div>
      </button>`;
    }).join('')}
  </div>

  <!-- Jets de sauvegarde -->
  <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Jets de sauvegarde</div>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:12px">
    ${ABILITIES_SH.map((ab,i)=>{
      const hasSave=saves.includes(i);
      const m=mod(finalAbilities[i])+(hasSave?pb(lvl):0);
      const isRageFor=rageActive&&i===0;
      const rollType=isRageFor?'for-save':'';
      const baseBorder=hasSave?'var(--cp)':'var(--border)';
      const baseColor=hasSave?'var(--cp)':'var(--text2)';
      const btnBorder=isRageFor?'#e53935':baseBorder;
      const btnColor=isRageFor?'#e53935':baseColor;
      const btnBg=isRageFor?'rgba(229,57,53,.08)':'var(--surface2)';
      return`<button onclick="diceRoll('d20','JS ${ab}',${m},'${rollType}')" style="padding:6px 4px;border:1px solid ${btnBorder};border-radius:6px;font-size:11px;cursor:pointer;background:${btnBg};color:${btnColor};transition:all .15s;font-family:var(--B);text-align:center" onmouseenter="this.style.borderColor='var(--cp)';this.style.color='var(--cp)'" onmouseleave="this.style.borderColor='${btnBorder}';this.style.color='${btnColor}'">
        <div style="font-weight:600">${ab}</div>
        <div style="font-size:12px">${fmt(m)}${isRageFor?' 🔥':''}</div>
      </button>`;
    }).join('')}
  </div>

  <!-- Compétences -->
  <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Compétences</div>
  <div style="display:flex;flex-direction:column;gap:3px;margin-bottom:12px">
    ${SKILLS.map(sk=>{
      const prof=(p.skillProf||{})[sk.name]||0;
      const bonus=mod(finalAbilities[sk.ab])+(prof===1?pb(lvl):prof===2?pb(lvl)*2:0);
      const hasMaîtrise=prof>0;
      const isRageFor=rageActive&&sk.ab===0;
      const rollType=isRageFor?'for-carac':'';
      const btnBorder=isRageFor?'#e53935':hasMaîtrise?'var(--cp)':'var(--border)';
      const labelColor=isRageFor?'#e53935':hasMaîtrise?'var(--cp)':'var(--text2)';
      return`<button onclick="diceRoll('d20','${sk.name}',${bonus},'${rollType}')" style="display:flex;align-items:center;gap:8px;padding:5px 8px;border:1px solid ${btnBorder};border-radius:6px;font-size:12px;cursor:pointer;background:${isRageFor?'rgba(229,57,53,.08)':'var(--surface2)'};color:var(--text2);transition:all .15s;font-family:var(--B);text-align:left;width:100%" onmouseenter="this.style.background='var(--surface3)'" onmouseleave="this.style.background='${isRageFor?'rgba(229,57,53,.08)':'var(--surface2)'}'">
        <span style="width:10px;height:10px;border-radius:50%;background:${isRageFor?'#e53935':prof===2?'var(--cp)':prof===1?'var(--cp)':'var(--border)'};border:1px solid ${isRageFor?'#e53935':hasMaîtrise?'var(--cp)':'var(--border)'};opacity:${prof===2?1:.5};flex-shrink:0"></span>
        <span style="flex:1;color:${labelColor}">${sk.name}${isRageFor?' 🔥':''}</span>
        <span style="font-size:11px;color:var(--text3)">${ABILITIES_SH[sk.ab]}</span>
        <span style="font-weight:600;color:${labelColor};min-width:28px;text-align:right">${fmt(bonus)}</span>
      </button>`;
    }).join('')}
  </div>

  <!-- Historique -->
  ${diceHistory.length?`<div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Derniers lancers</div>
  <div id="diceHistoryList" style="display:flex;flex-direction:column;gap:3px">
    ${diceHistory.slice().reverse().map(h=>`<div style="display:flex;justify-content:space-between;padding:4px 8px;background:var(--surface2);border-radius:4px;font-size:12px">
      <span style="color:var(--text2)">${esc(h.label)}</span>
      <span style="font-weight:700;color:${h.result>=20&&h.die==='d20'?'#ffd54f':h.result<=1&&h.die==='d20'?'#e53935':'var(--cp)'}">${h.result}${h.bonus?` (${fmt(h.bonus)})`:''}</span>
    </div>`).join('')}
  </div>`:''}

  ${currentTableId?`<div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--border)">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em">Chuchotements</div>
      <button onclick="openWhisperModal()" style="padding:4px 10px;border:1px solid var(--cp);border-radius:6px;font-size:11px;cursor:pointer;background:transparent;color:var(--cp);font-family:var(--B)">🤫 Chuchoter</button>
    </div>
    ${(typeof _whisperHistory!=='undefined'&&_whisperHistory.length)?_whisperHistory.slice(0,5).map(w=>`<div style="padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px;font-size:11px">
      <div style="color:var(--cp);font-weight:600;margin-bottom:1px">${esc(w.fromName||'?')}</div>
      <div style="color:var(--text2)">${esc(w.message||'')}</div>
    </div>`).join(''):'<div style="font-size:11px;color:var(--text3);font-style:italic">Aucun chuchotement reçu.</div>'}
  </div>`:''}
  `;
}

// ─── CHUCHOTEMENTS ───
function openWhisperModal(){
  if(!currentTableId){showToast('❌ Rejoignez une campagne pour chuchoter.');return;}
  if(typeof isMJ==='function'&&isMJ()){
    const players=typeof _mjPlayersData!=='undefined'?_mjPlayersData:[];
    openWideModal(`<div class="pt">🤫 Chuchoter à un joueur</div>
      <div style="margin-bottom:10px">${players.length?players.map((pl,i)=>`<div class="lu-choice${_whisperTarget===i?' selected':''}" style="padding:8px 12px;margin-bottom:6px;cursor:pointer" onclick="_whisperTarget=${i};document.querySelectorAll('#modal .lu-choice').forEach((el,j)=>{el.classList.toggle('selected',j===${i});})">
        <div style="font-size:13px;font-weight:600">${esc(pl.playerName||'Joueur')}</div>
        <div style="font-size:11px;color:var(--text3)">${esc((pl.charData||{}).charName||'?')}</div>
      </div>`).join(''):'<div style="font-size:12px;color:var(--text3);padding:8px">Aucun joueur connecté.</div>'}</div>
      <textarea id="whisperMsg" placeholder="Message secret..." style="width:100%;box-sizing:border-box;min-height:72px;padding:8px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px;resize:vertical;margin-bottom:8px"></textarea>
      <div style="display:flex;gap:8px">
        <button class="btn" onclick="closeModal()">Annuler</button>
        <button class="btn bac" style="flex:1" onclick="_sendMJWhisper()">🤫 Envoyer</button>
      </div>`);
  }else{
    if(!currentTableMjId){showToast('❌ MJ introuvable.');return;}
    openModal(`<div class="pt">🤫 Chuchoter au MJ</div>
      <textarea id="whisperMsg" placeholder="Message secret pour le MJ..." style="width:100%;box-sizing:border-box;min-height:72px;padding:8px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px;resize:vertical;margin-bottom:8px"></textarea>
      <div style="display:flex;gap:8px">
        <button class="btn" onclick="closeModal()">Annuler</button>
        <button class="btn bac" style="flex:1" onclick="_sendPlayerWhisper()">🤫 Envoyer au MJ</button>
      </div>`);
  }
}
function _sendPlayerWhisper(){
  const msg=document.getElementById('whisperMsg')?.value?.trim();
  if(!msg){showToast('❌ Message vide.');return;}
  sendWhisperMsg(currentTableMjId,'Maître de Jeu',msg);
  closeModal();
}
function _sendMJWhisper(){
  const msg=document.getElementById('whisperMsg')?.value?.trim();
  if(!msg){showToast('❌ Message vide.');return;}
  const players=typeof _mjPlayersData!=='undefined'?_mjPlayersData:[];
  if(_whisperTarget<0||!players[_whisperTarget]){showToast('❌ Sélectionnez un destinataire.');return;}
  const pl=players[_whisperTarget];
  sendWhisperMsg(pl.uid,pl.playerName||'Joueur',msg);
  _whisperTarget=-1;closeModal();
}

// Détecte avantage/désavantage/bonus-dé selon les statuts actifs
function getStatusEffects(p,rollType){
  // rollType: 'attaque' | 'carac' | 'save' | 'dex-save' | 'for-save' | 'skill' | 'for-carac'
  const statuses=p.statuses||[];
  let hasDisadv=false,hasAdv=false,bonusDie=null;

  // Barbare en rage → avantage sur tous les jets de Force
  const barbareLvl=((p.classes||[]).find(c=>c.name==='Barbare')||{}).level||0;
  if(barbareLvl&&(p.combatCharges||{})['RageActive']===true){
    if(rollType==='for-carac'||rollType==='for-save')hasAdv=true;
  }

  function matchesRoll(target,rt){
    if(!target)return false;
    if(target==='un')return true; // s'applique à n'importe quel jet (Inspiré)
    if(target==='attaque'&&rt==='attaque')return true;
    if(target==='carac'&&(rt==='carac'||rt==='skill'||rt==='for-carac'))return true;
    if(target==='save'&&(rt==='save'||rt==='dex-save'||rt==='for-save'))return true;
    if(target==='dex-save'&&rt==='dex-save')return true;
    if(target==='for-save'&&rt==='for-save')return true;
    if(target==='compétence'&&(rt==='skill'||rt==='for-carac'))return true;
    return false;
  }

  statuses.forEach(s=>{
    // Désavantage
    const pen=(s.rollPenalty||'').split(',').map(r=>r.trim()).filter(Boolean);
    if(pen.some(r=>matchesRoll(r,rollType)))hasDisadv=true;

    // Avantage explicite (Invisible sur attaque)
    if(s.rollPenalty==='avantage-attaque'&&rollType==='attaque')hasAdv=true;
    if(s.name==='Invisible'&&rollType==='attaque')hasAdv=true;

    // Bonus de dé (ex: "1d4:attaque,save" ou "1d6:un")
    const bon=s.rollBonus||'';
    if(bon){
      const colonIdx=bon.indexOf(':');
      const dieStr=colonIdx>=0?bon.slice(0,colonIdx):bon;
      const targets=colonIdx>=0?bon.slice(colonIdx+1).split(',').map(t=>t.trim()):['un'];
      if(targets.some(t=>matchesRoll(t,rollType)))bonusDie=dieStr;
    }
  });

  return{hasDisadv,hasAdv,bonusDie};
}

function diceRoll(die,label,bonus=0,rollType=''){
  const p=P();
  const n=parseInt(die.replace('d',''));
  const effects=rollType?getStatusEffects(p,rollType):{hasDisadv:false,hasAdv:false,bonusDie:null};

  // Avantage / désavantage → 2 dés, garde le plus haut/bas
  const roll1=Math.ceil(Math.random()*n);
  let roll2=null,usedRoll=roll1;
  if(effects.hasAdv&&!effects.hasDisadv){roll2=Math.ceil(Math.random()*n);usedRoll=Math.max(roll1,roll2);}
  else if(effects.hasDisadv&&!effects.hasAdv){roll2=Math.ceil(Math.random()*n);usedRoll=Math.min(roll1,roll2);}

  // Bonus de dé (Béni, Inspiré…)
  let bonusDieRoll=0;
  if(effects.bonusDie){const bd=parseInt(effects.bonusDie.replace('d',''));bonusDieRoll=Math.ceil(Math.random()*bd);}

  const total=usedRoll+bonus+bonusDieRoll;
  const isCrit=die==='d20'&&usedRoll===20;
  const isFumble=die==='d20'&&usedRoll===1;

  // Historique
  diceHistory.push({die,label,roll:usedRoll,bonus,result:total,adv:effects.hasAdv,disadv:effects.hasDisadv});
  if(diceHistory.length>10)diceHistory.shift();

  // Toast
  let msg=`<strong>${label}</strong> : `;
  if(roll2!==null){
    const kept=effects.hasAdv?'🟢':'🔴';
    const dropped=effects.hasAdv?'🔴':'🟢';
    const keptVal=usedRoll,droppedVal=usedRoll===roll1?roll2:roll1;
    msg+=`[${keptVal} ${kept}, ${droppedVal} ${dropped}]`;
    msg+=effects.hasAdv?` <span style="font-size:10px;color:#4caf50">AVANTAGE</span>`:`<span style="font-size:10px;color:#e53935"> DÉSAVANTAGE</span>`;
  } else {
    msg+=`d20(${usedRoll})`;
  }
  if(bonus)msg+=` ${fmt(bonus)}`;
  if(bonusDieRoll)msg+=` <span style="color:#ffd54f">+${effects.bonusDie}(${bonusDieRoll})</span>`;
  msg+=` = <strong style="font-size:16px;color:${isCrit?'#ffd54f':isFumble?'#e53935':'var(--cp)'}">${total}</strong>`;
  if(isCrit)msg+=` 🎉 CRITIQUE !`;
  if(isFumble)msg+=` 💀 FUMBLE !`;
  showToast(msg);

  if(diceOpen)renderDicePanel();
}

function diceRollFree(d){
  const n=parseInt(d.replace('d',''));
  const r=Math.ceil(Math.random()*n);
  const el=document.getElementById('diceResultFree');
  if(el){el.style.display='block';el.innerHTML=`🎲 ${d} : <strong style="font-size:18px">${r}</strong>${r===n?' 🎉':r===1&&n>4?' 💀':''}`;}
}
function diceRollCustom(){
  const qty=parseInt(document.getElementById('diceQty')?.value)||1;
  const die=document.getElementById('diceType')?.value||'d20';
  const n=parseInt(die.replace('d',''));
  let total=0;const rolls=[];
  for(let i=0;i<qty;i++){const r=Math.ceil(Math.random()*n);rolls.push(r);total+=r;}
  const label=`${qty}${die}`;
  diceHistory.push({die,label,roll:total,bonus:0,result:total});
  if(diceHistory.length>10)diceHistory.shift();
  showToast(`<strong>${label}</strong> : [${rolls.join(', ')}] = <strong style="font-size:16px;color:var(--cp)">${total}</strong>`);
  if(diceOpen)renderDicePanel();
}

// Fermer le panel si clic ailleurs
document.addEventListener('click',e=>{
  const panel=document.getElementById('dicePanel');
  const btn=document.getElementById('diceFloat');
  if(diceOpen&&panel&&btn&&!panel.contains(e.target)&&!btn.contains(e.target)){
    diceOpen=false;panel.style.display='none';
  }
});

createDiceButton();

function createPartyHud(){
  const hud=document.createElement('div');
  hud.id='partyHud';
  hud.style.cssText='position:fixed;bottom:24px;left:24px;z-index:850;display:none';
  hud.innerHTML=`<div id="partyHudPanel" class="phud-panel" style="display:none"></div><div id="partyHudBtn" onclick="_togglePartyHud()" title="Groupe">👥<div id="partyHudBadge"></div><div id="partyHudTurnBadge">⚡</div></div>`;
  document.body.appendChild(hud);
}
createPartyHud();
