// GUERRIER — Panneau de combat
// ═══════════════════════════════════════

const MDG_MANOEVRES = [
  {id:'PrecAtk', name:'Attaque précise', tag:'', desc:'Ajoute 1 dé de supériorité à un jet d\'attaque (après l\'avoir vu).'},
  {id:'DisAtk', name:'Attaque briseur', tag:'', desc:'+1 dé dégâts. Cible JS FOR ou lâche une arme.'},
  {id:'DivAtk', name:'Attaque de diversion', tag:'', desc:'+1 dé dégâts. Les alliés ont l\'avantage contre la cible ce tour.'},
  {id:'MenAtk', name:'Attaque effrayante', tag:'', desc:'+1 dé dégâts. Cible JS SAG ou effrayée jusqu\'à ton prochain tour.'},
  {id:'Parry', name:'Parade', tag:'↪', desc:'↪ Réaction : réduis les dégâts reçus de 1 dé de supériorité + DEX.'},
  {id:'PushAtk', name:'Attaque de poussée', tag:'', desc:'+1 dé dégâts. Cible JS FOR ou repoussée 4,5m.'},
  {id:'Riposte', name:'Riposte', tag:'↪', desc:'↪ Réaction : créature rate une attaque → attaque en retour + 1 dé dégâts.'},
  {id:'SwpAtk', name:'Attaque balafrante', tag:'', desc:'+1 dé dégâts à une autre créature adjacente à la cible touchée.'},
  {id:'CmdAtk', name:'Attaque de commandement', tag:'', desc:'Un allié utilise sa réaction pour attaquer la cible que tu viens de toucher.'},
  {id:'GoadAtk', name:'Attaque démoralisante', tag:'', desc:'+1 dé dégâts. Cible JS SAG ou désavantage contre toutes cibles sauf toi.'},
  {id:'Rally', name:'Ralliement', tag:'🔸', desc:'🔸 Action bonus : allié proche reçoit 1 dé de supériorité + CHA PV temporaires.'},
  {id:'TripAtk', name:'Attaque de déstabilisation', tag:'', desc:'+1 dé dégâts. Cible JS FOR ou tombée à terre.'},
  {id:'FeintAtk', name:'Attaque de feinte', tag:'🔸', desc:'🔸 Action bonus : avantage sur ta prochaine attaque contre une cible à 1,5m ce tour.'},
];

function renderGuerrier(p) {
  const wsC = p.wildshape;
  const guerrierLvl = ((p.classes||[]).find(c=>c.name==='Guerrier')||{}).level||0;
  if (!guerrierLvl || wsC?.active) return '';
  const lvl = totalLevel(p);
  const forM = mod(p.abilities[0]);
  const dexM = mod(p.abilities[1]);
  const conM = mod(p.abilities[2]);
  const intM = mod(p.abilities[3]);
  const combatStyle = p.combatStyle||'';
  const guerPath = (p.features||[]).find(f=>['Champion','Maître de guerre','Chevalier occulte'].includes(f.name));
  const isChampion = guerPath?.name==='Champion';
  const isMdG = guerPath?.name==='Maître de guerre';
  const isCO = guerPath?.name==='Chevalier occulte';

  return cs('cs-guerrier',`<div class="panel mb10"><div class="pt" style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span>⚔ Guerrier — Capacités</div>
    <div style="margin-bottom:${guerrierLvl>=2?'14':'0'}px">
      <div style="font-size:13px;font-weight:600;color:var(--cp);margin-bottom:4px">💨 Second souffle</div>
      <div style="font-size:12px;color:var(--text3);margin-bottom:8px">${_featDesc('Guerrier','Second souffle')}</div>
      ${(()=>{const ssUsed=(p.combatCharges||{})['Second souffle']!==undefined?p.combatCharges['Second souffle']:1;return`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><div style="display:flex;gap:4px"><span class="slot-bubble${ssUsed>0?'':' used'}" onclick="useCombatCharge('Second souffle',1)"></span></div><button class="btn bsm" onclick="rollCustomDmg('1d10+${lvl}','Second souffle')">🎲 1d10+${lvl}</button><button class="btn bsm" onclick="recoverCombatCharge('Second souffle',1)">↺ Repos court</button></div>`;})()}
    </div>
    ${guerrierLvl>=2?(()=>{const saMax=guerrierLvl>=17?2:1;const saUsed=(p.combatCharges||{})['SursautAction']!==undefined?p.combatCharges['SursautAction']:saMax;return`<div style="margin-bottom:${guerrierLvl>=9?'14':'0'}px"><div style="font-size:13px;font-weight:600;color:var(--cp);margin-bottom:4px">⚡ Sursaut d'action${guerrierLvl>=17?' (×2)':''}</div><div style="font-size:12px;color:var(--text3);margin-bottom:8px">${_featDesc('Guerrier',"Sursaut d'action")}</div><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><div style="display:flex;gap:4px">${Array.from({length:saMax},(_,i)=>`<span class="slot-bubble${i<saUsed?'':' used'}" onclick="useCombatCharge('SursautAction',${saMax})"></span>`).join('')}</div><span style="font-size:11px;color:var(--text3)">${saUsed}/${saMax}</span><button class="btn bsm" onclick="recoverCombatCharge('SursautAction',${saMax})">↺ Repos court</button></div></div>`;})():''}
    ${guerrierLvl>=9?(()=>{const indMax=guerrierLvl>=17?3:(guerrierLvl>=13?2:1);const indUsed=(p.combatCharges||{})['Indomptable']!==undefined?p.combatCharges['Indomptable']:indMax;return`<div><div style="font-size:13px;font-weight:600;color:var(--cp);margin-bottom:4px">🔄 Indomptable${guerrierLvl>=13?` (×${indMax})`:''}</div><div style="font-size:12px;color:var(--text3);margin-bottom:8px">${_featDesc('Guerrier','Indomptable')}</div><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><div style="display:flex;gap:4px">${Array.from({length:indMax},(_,i)=>`<span class="slot-bubble${i<indUsed?'':' used'}" onclick="useCombatCharge('Indomptable',${indMax})"></span>`).join('')}</div><span style="font-size:11px;color:var(--text3)">${indUsed}/${indMax}</span><button class="btn bsm" onclick="recoverCombatCharge('Indomptable',${indMax})">↺ Repos long</button></div></div>`;})():''}
    ${combatStyle?`<div style="margin-top:8px;padding:6px 8px;background:var(--surface2);border-radius:6px;font-size:12px;color:var(--text2)">⚔ Style de combat : <strong>${combatStyle}</strong></div>`:''}
    ${isChampion&&guerrierLvl>=3?`<div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px"><div style="font-size:13px;font-weight:600;color:var(--cp);margin-bottom:6px">🏆 Champion</div><div style="font-size:12px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Critique amélioré (niv.3) — Coup critique sur 19-20</div>${guerrierLvl>=7?`<div style="font-size:12px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Athlète accompli (niv.7) — ½ maîtrise aux jets FOR/DEX/CON sans maîtrise</div>`:''} ${guerrierLvl>=15?`<div style="font-size:12px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Critique supérieur (niv.15) — Coup critique sur 18-20</div>`:''} ${guerrierLvl>=18?`<div style="padding:5px 8px;background:rgba(76,175,80,.07);border:1px solid rgba(76,175,80,.2);border-radius:6px"><div style="font-size:12px;color:var(--text2);margin-bottom:4px">Survivant (niv.18) — Si PV ≤ ½ max au début de ton tour : récupère <strong style="color:#4caf50">${5+conM}</strong> PV automatiquement.</div><button class="btn bsm" style="color:#4caf50;border-color:#4caf50" onclick="(()=>{const p=P();const heal=${5+conM};if((p.hp||0)<=Math.floor((p.hpMax||1)/2)){p.hp=Math.min(p.hpMax||0,(p.hp||0)+heal);saveAll();render();showToast('💚 Survivant : +'+heal+' PV');}else{showToast('❌ PV > ½ max — Survivant inactif');}})()">💚 Survivant (+${5+conM} PV)</button></div>`:''}</div>`:''}
    ${isMdG&&guerrierLvl>=3?(()=>{const mdgDiceMax=guerrierLvl>=15?7:guerrierLvl>=10?6:guerrierLvl>=7?5:4;const mdgDie=guerrierLvl>=18?'d12':guerrierLvl>=10?'d10':'d8';const mdgManoevres=guerrierLvl>=15?9:guerrierLvl>=10?7:guerrierLvl>=7?5:3;const mdgUsed=(p.combatCharges||{})['DésSupériorité']!==undefined?p.combatCharges['DésSupériorité']:mdgDiceMax;return`<div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px"><div style="font-size:13px;font-weight:600;color:var(--cp);margin-bottom:6px">⚔ Maître de guerre</div><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap"><div class="sb hi" style="padding:4px 12px;flex-shrink:0"><div class="sn">Dé</div><div style="font-size:16px;font-weight:700;color:var(--cp)">${mdgDie}</div></div><div class="sb" style="padding:4px 12px;flex-shrink:0"><div class="sn">Manœuvres</div><div style="font-size:16px;font-weight:700;color:var(--cp)">${mdgManoevres}</div></div></div><div style="font-size:12px;color:var(--text3);margin-bottom:4px">Supériorité martiale (DD = ${8+pb(lvl)+Math.max(forM,dexM)}) :</div><div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px">${Array.from({length:mdgDiceMax},(_,i)=>`<span class="slot-bubble${i<mdgUsed?'':' used'}" onclick="useCombatCharge('DésSupériorité',${mdgDiceMax})"></span>`).join('')}</div><div style="font-size:11px;color:var(--text3);margin-bottom:6px">${mdgUsed}/${mdgDiceMax} • Repos court</div><div style="display:flex;gap:4px;flex-wrap:wrap"><button class="btn bsm" onclick="rollCustomDmg('1${mdgDie}','Dé de supériorité')">🎲 1${mdgDie}</button><button class="btn bsm" onclick="recoverCombatCharge('DésSupériorité',${mdgDiceMax})">↺ Repos court</button></div>${guerrierLvl>=7?`<div style="font-size:12px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-top:6px">Observation de l'ennemi (niv.7) — 1 min à observer : savoir si une cible est inférieure/égale/supérieure en FOR</div>`:''} ${guerrierLvl>=15?`<div style="font-size:12px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-top:4px">Implacable (niv.15) — Si à 0 dés au début de l'initiative, récupère 1 dé de supériorité</div>`:''}<div style="margin-top:8px;border-top:1px solid var(--border);padding-top:8px"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px"><div style="font-size:12px;color:var(--text3)">Manœuvres choisies (max ${mdgManoevres})</div><button class="btn bsm" onclick="openMDGManoevresModal(${mdgManoevres},'${mdgDie}',${mdgDiceMax})">⚙ Configurer</button></div>${(()=>{const cc=p.combatCharges||{};const chosen=MDG_MANOEVRES.filter(m=>cc['MDG_'+m.id]);if(!chosen.length)return '<div style="font-size:11px;color:var(--text3);font-style:italic">Aucune manœuvre configurée.</div>';const dn=parseInt(mdgDie.slice(1));const onc='(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};const cur=p.combatCharges[\'DésSupériorité\']!==undefined?p.combatCharges[\'DésSupériorité\']:'+mdgDiceMax+';if(cur<1){showToast(\'❌ Plus de dés !\');return;}p.combatCharges[\'DésSupériorité\']=cur-1;const r=Math.ceil(Math.random()*'+dn+');_markUnsaved();render();showToast(\'⚔ 1'+mdgDie+' → \'+r,2500);})()';return chosen.map(m=>'<div style="padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:3px;display:flex;align-items:center;justify-content:space-between;gap:4px"><div style="flex:1"><div style="font-size:12px;font-weight:600">'+m.name+(m.tag?' <span style="font-size:11px;color:var(--cp)">'+m.tag+'</span>':'')+'</div><div style="font-size:11px;color:var(--text3)">'+m.desc+'</div></div><button class="btn bsm" style="flex-shrink:0" onclick="'+onc+'">🎲 1'+mdgDie+'</button></div>').join('');})()}</div></div>`;})():''}
    ${isCO&&guerrierLvl>=3?`<div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px"><div style="font-size:13px;font-weight:600;color:var(--cp);margin-bottom:6px">🔮 Chevalier occulte</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px"><div class="sb hi" style="flex:1;min-width:60px"><div class="sn">DD sorts</div><div style="font-size:16px;font-weight:700;color:var(--cp)">${8+pb(lvl)+intM}</div></div><div class="sb hi" style="flex:1;min-width:60px"><div class="sn">Atk sorts</div><div style="font-size:16px;font-weight:700;color:var(--cp)">${pb(lvl)+intM>=0?'+':''}${pb(lvl)+intM}</div></div></div><div style="font-size:12px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Sorts de magicien (INT) — sorts d'abjuration et d'évocation.</div>${(()=>{const cc=p.combatCharges||{};const liee=cc['ArmeLiee']||'';return '<div style="padding:7px 10px;background:var(--surface2);border-radius:6px;margin-bottom:4px"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px"><div style="font-size:13px;font-weight:600">🔮 Lien d\'arme <span style="font-size:11px;color:var(--cp)">🔸 Action bonus</span></div><button class="btn bsm" onclick="openArmeLieeModal()">⚙ Lier</button></div>'+(liee?'<div style="font-size:12px;color:var(--text2);margin-bottom:6px">Liée : <strong>'+liee+'</strong></div><button class="btn bsm" onclick="showToast(\'🔸 Invoquer : \'+(P().combatCharges||{})[\'ArmeLiee\'],2500)">🔸 Invoquer</button>':'<div style="font-size:11px;color:var(--text3);font-style:italic">Aucune arme liée.</div>')+'</div>';})()}${guerrierLvl>=7?`<div style="font-size:12px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Magie de guerre (niv.7) — Quand tu lances un cantrip, tu peux effectuer 1 attaque en action bonus</div>`:''} ${guerrierLvl>=10?`<div style="font-size:12px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Frappe occulte (niv.10) — Si tu touches une créature, elle a désavantage à son prochain JS contre un de tes sorts ce tour</div>`:''} ${guerrierLvl>=15?`<div style="font-size:12px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Charge arcanique (niv.15) — Quand tu utilises Sursaut d'action, tu peux te téléporter jusqu'à 9m</div>`:''} ${guerrierLvl>=18?`<div style="font-size:12px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">Magie de guerre améliorée (niv.18) — L'attaque bonus s'applique à n'importe quel sort, pas seulement les cantrieps</div>`:''}</div>`:''}
  </div>`);
}

function openMDGManoevresModal(max, die, diceMax) {
  const p = P();
  if (!p.combatCharges) p.combatCharges = {};
  const rows = MDG_MANOEVRES.map(m => {
    const sel = !!p.combatCharges['MDG_' + m.id];
    const tag = m.tag ? ' <span style="color:var(--cp)">' + m.tag + '</span>' : '';
    return '<div style="display:flex;align-items:flex-start;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">' +
      '<input type="checkbox" id="mdg_' + m.id + '" ' + (sel ? 'checked' : '') + ' onchange="toggleMDGManouvre(\'' + m.id + '\',' + max + ')" style="margin-top:3px;flex-shrink:0">' +
      '<label for="mdg_' + m.id + '" style="cursor:pointer;flex:1">' +
      '<div style="font-size:13px;font-weight:600">' + m.name + tag + '</div>' +
      '<div style="font-size:11px;color:var(--text3)">' + m.desc + '</div>' +
      '</label></div>';
  }).join('');
  openWideModal('<div style="padding:12px">' +
    '<div style="font-size:14px;font-weight:700;margin-bottom:4px">⚔ Manœuvres — Maître de guerre</div>' +
    '<div style="font-size:12px;color:var(--text3);margin-bottom:12px">Choisissez jusqu\'à <strong>' + max + '</strong> manœuvres (dé : 1' + die + ')</div>' +
    rows +
    '<button class="btn" style="width:100%;margin-top:12px" onclick="closeModal()">✓ Fermer</button>' +
    '</div>');
}

function toggleMDGManouvre(id, max) {
  const p = P();
  if (!p.combatCharges) p.combatCharges = {};
  const key = 'MDG_' + id;
  const chosen = MDG_MANOEVRES.filter(m => p.combatCharges['MDG_' + m.id]).length;
  if (!p.combatCharges[key] && chosen >= max) {
    showToast('❌ Maximum de ' + max + ' manœuvres atteint !');
    const cb = document.getElementById('mdg_' + id);
    if (cb) cb.checked = false;
    return;
  }
  p.combatCharges[key] = !p.combatCharges[key];
  _markUnsaved();
  render();
}

function openArmeLieeModal() {
  const p = P();
  const weapons = [];
  (p.inventory || []).forEach(item => {
    if (item && item.name && (item.damage || (item.type && item.type.toLowerCase().includes('arme')))) {
      if (!weapons.includes(item.name)) weapons.push(item.name);
    }
  });
  ['hand1', 'hand2'].forEach(slot => {
    const it = p.equip && p.equip[slot];
    if (it && it.name && !weapons.includes(it.name)) weapons.push(it.name);
  });
  if (!weapons.length) {
    showToast('❌ Aucune arme trouvée dans l\'inventaire.');
    return;
  }
  const rows = weapons.map(name =>
    '<button class="btn" style="width:100%;margin-bottom:6px;text-align:left" onclick="selectArmeLiee(\'' + name.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + '\')">⚔ ' + name + '</button>'
  ).join('');
  openWideModal('<div style="padding:12px">' +
    '<div style="font-size:14px;font-weight:700;margin-bottom:12px">🔮 Lier une arme</div>' +
    rows +
    '<button class="btn bsm" style="width:100%;margin-top:6px;color:var(--text3)" onclick="closeModal()">Annuler</button>' +
    '</div>');
}

function selectArmeLiee(name) {
  const p = P();
  if (!p.combatCharges) p.combatCharges = {};
  p.combatCharges['ArmeLiee'] = name;
  saveAll();
  render();
  closeModal();
  showToast('🔮 Arme liée : ' + name, 2500);
}
