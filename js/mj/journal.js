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
