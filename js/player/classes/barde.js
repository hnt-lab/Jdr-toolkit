// BARDE — Panneau de combat
// ═══════════════════════════════════════

function renderBarde(p) {
  const bardeLvl = ((p.classes||[]).find(c=>c.name==='Barde')||{}).level||0;
  if (!bardeLvl || p.wildshape?.active) return '';
  const lvl = totalLevel(p);
  const chaM = mod(p.abilities[5]);
  const bardDie = bardeLvl>=15?'d12':bardeLvl>=10?'d10':bardeLvl>=5?'d8':'d6';
  const bardInspiMax = Math.max(1, chaM);
  const bardePath = (p.features||[]).find(f=>['Collège du savoir','Collège de la vaillance'].includes(f.name));
  const isSavoir = bardePath?.name==='Collège du savoir';
  const isVaillance = bardePath?.name==='Collège de la vaillance';
  const cc = p.combatCharges||{};
  const panels = [];

  // ── Dé d'inspiration + stats sorts ───────────────────────
  panels.push(`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
    <div class="sb hi" style="flex:1;min-width:70px"><div class="sn">Dé inspiration</div><div style="font-size:25px;font-weight:700;color:var(--cp)">${bardDie}</div></div>
    <div class="sb hi" style="flex:1;min-width:70px"><div class="sn">DD sorts</div><div style="font-size:25px;font-weight:700;color:var(--cp)">${8+pb(lvl)+chaM}</div></div>
    <div class="sb hi" style="flex:1;min-width:70px"><div class="sn">Atk sorts</div><div style="font-size:25px;font-weight:700;color:var(--cp)">${pb(lvl)+chaM>=0?'+':''}${pb(lvl)+chaM}</div></div>
  </div>`);

  // ── Inspiration bardique ──────────────────────────────────
  const biUsed = cc['InspBardique']!==undefined ? cc['InspBardique'] : bardInspiMax;
  const hasAllies = (typeof _groupData!=='undefined')&&_groupData.some(gp=>gp.uid!==(typeof currentUser!=='undefined'?currentUser?.uid:null));
  panels.push(`<div style="margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:6px">
    <div style="font-size:18px;font-weight:600;color:var(--cp);margin-bottom:6px">🎵 Inspiration bardique <span style="font-size:15px;color:var(--cp)">🔸</span></div>
    <div style="font-size:17px;color:var(--text3);margin-bottom:4px">Utilisations (mod CHA = ${Math.max(1,chaM)}) • Récup. repos ${bardeLvl>=5?'court':'long'}</div>
    <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px">${Array.from({length:bardInspiMax},(_,i)=>`<span class="slot-bubble${i<biUsed?'':' used'}" onclick="useCombatCharge('InspBardique',${bardInspiMax})" title="Dépenser une inspiration"></span>`).join('')}</div>
    <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
      <button class="btn bsm" onclick="recoverCombatCharge('InspBardique',${bardInspiMax})">↺ Récupérer</button>
      ${hasAllies&&biUsed>0?`<button class="btn bsm bac" onclick="openGiveInspirationModal('${bardDie}',${bardInspiMax})">🎵 Donner à un allié</button>`:''}
      ${!hasAllies?`<button class="btn bsm bac" onclick="rollCustomDmg('1${bardDie}','Inspiration bardique')">🎲 Lancer ${bardDie}</button>`:''}
    </div>
    <div style="font-size:15px;color:var(--text3);margin-top:6px">Action bonus : donne un dé ${bardDie} à un allié. Il peut l'ajouter à un jet d'attaque, compétence ou sauvegarde.</div>
  </div>`);

  // ── Chant reposant (niv.2+) ───────────────────────────────
  if (bardeLvl>=2) {
    const chantDie = bardeLvl>=17?'d12':bardeLvl>=13?'d10':bardeLvl>=9?'d8':'d6';
    const chantResult = cc['ChantReposantResult'];
    const hasResult = chantResult !== undefined;
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:${hasResult?'rgba(76,175,80,.07)':'var(--surface2)'};border-radius:6px;border:1px solid ${hasResult?'rgba(76,175,80,.35)':'var(--border)'}">
      <div style="font-size:18px;font-weight:600;color:var(--cp);margin-bottom:4px">🎶 Chant reposant (${chantDie})</div>
      <div style="font-size:17px;color:var(--text3);margin-bottom:8px">Au prochain repos court, chaque allié qui dépense des dés de vie récupère <strong>${chantDie}</strong> PV supplémentaires. Lance le dé et annonce le résultat.</div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn bsm${hasResult?'':' bac'}" onclick="rollChantReposant('${chantDie}')">🎶 ${hasResult?'Relancer':'Déclarer le chant'}</button>
        ${hasResult?`<span style="font-size:22px;font-weight:700;color:#4caf50">+${chantResult} PV</span><span style="font-size:15px;color:var(--text3)">annoncé aux alliés</span>`:''}
      </div>
      ${hasResult?`<div style="font-size:15px;color:var(--text3);margin-top:6px">💡 Alliés : ajoutez <strong style="color:#4caf50">+${chantResult}</strong> à votre récupération de dés de vie. Se réinitialise après le repos.</div>`:''}
    </div>`);
  }

  // ── Touche-à-tout (niv.2+) ───────────────────────────────
  if (bardeLvl>=2) {
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:6px">
      <div style="font-size:18px;font-weight:600;color:var(--cp);margin-bottom:2px">🎭 Touche-à-tout</div>
      <div style="font-size:17px;color:var(--text3)">+${Math.floor(pb(lvl)/2)} (½ maîtrise) à tous les jets de caractéristique pour lesquels tu n'appliques pas déjà ta maîtrise complète.</div>
    </div>`);
  }

  // ── Contre-charme (niv.6+) ───────────────────────────────
  if (bardeLvl>=6) {
    const cmActive = !!cc['ContreCharmeActive'];
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:${cmActive?'rgba(33,150,243,.1)':'var(--surface2)'};border-radius:6px;border:1px solid ${cmActive?'rgba(33,150,243,.5)':'var(--border)'}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <span style="font-size:18px;font-weight:600;color:var(--cp)">🎤 Contre-charme</span>
        <button class="btn bsm" style="${cmActive?'color:#2196f3;border-color:#2196f3':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['ContreCharmeActive']=!p.combatCharges['ContreCharmeActive'];saveAll();render();})()">
          ${cmActive?'⬛ Arrêter':'▶ Activer'}
        </button>
      </div>
      <div style="font-size:17px;color:var(--text3)">${cmActive?'🎤 Actif — toi et les alliés à 9m avez l\'avantage aux JS contre charme et peur.':'Action : commence une représentation jusqu\'à la fin de ton prochain tour. Toi + alliés à 9m : avantage aux JS contre charme et peur.'}</div>
    </div>`);
  }

  // ── Inspiration supérieure (niv.20) ──────────────────────
  if (bardeLvl>=20) {
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:rgba(200,168,75,.08);border-radius:6px;border:1px solid rgba(200,168,75,.4)">
      <div style="font-size:18px;font-weight:600;color:var(--cp);margin-bottom:2px">⭐ Inspiration supérieure</div>
      <div style="font-size:17px;color:var(--text3)">Quand tu lances l'initiative sans inspiration bardique, tu en regagnes 1 automatiquement.</div>
    </div>`);
  }

  // ── COLLÈGE DU SAVOIR ─────────────────────────────────────
  if (isSavoir && bardeLvl>=3) {
    let savoirContent = `<div style="padding:7px 10px;background:var(--surface2);border-radius:6px;margin-bottom:6px">
      <div style="font-size:18px;font-weight:600;margin-bottom:2px">🗡 Mots cinglants <span style="font-size:15px;color:var(--cp);margin-left:4px">Réaction • 1 inspiration</span></div>
      <div style="font-size:17px;color:var(--text3)">Quand une créature visible fait un jet d'attaque, compétence ou dégâts : dépense 1 inspiration, la cible soustrait le résultat du dé. Décider après le jet, avant l'annonce du MJ. Immunisé si la cible est insensible aux charmes.</div>
      <button class="btn bsm bac" style="margin-top:6px" onclick="_bardeUseInspi('cinglants')">🗡 Mots cinglants (−1 inspi)</button>
    </div>`;
    if (bardeLvl>=6) {
      savoirContent += `<div style="padding:7px 10px;background:var(--surface2);border-radius:6px;margin-bottom:6px">
        <div style="font-size:18px;font-weight:600;margin-bottom:2px">📖 Secrets magiques supplémentaires <span style="font-size:15px;color:var(--text3)">niv.6</span></div>
        <div style="font-size:17px;color:var(--text3)">2 sorts de n'importe quelle classe (en plus des Secrets magiques niv.10/14/18). Ne comptent pas dans le quota de sorts connus.</div>
      </div>`;
    }
    if (bardeLvl>=14) {
      savoirContent += `<div style="padding:7px 10px;background:var(--surface2);border-radius:6px">
        <div style="font-size:18px;font-weight:600;margin-bottom:2px">🎯 Compétence hors-pair <span style="font-size:15px;color:var(--text3)">niv.14</span></div>
        <div style="font-size:17px;color:var(--text3)">Quand tu rates un jet de caractéristique, dépense 1 inspiration bardique et ajoute le résultat du dé. Peut transformer un échec en réussite.</div>
        <button class="btn bsm bac" style="margin-top:6px" onclick="_bardeUseInspi('horspair')">🎯 Compétence hors-pair (−1 inspi)</button>
      </div>`;
    }
    panels.push(`<div style="margin-bottom:10px;padding:10px;background:rgba(156,39,176,.07);border:1px solid rgba(156,39,176,.2);border-radius:8px">
      <div style="font-size:18px;font-weight:700;color:#9c27b0;margin-bottom:8px">📚 Collège du savoir</div>
      ${savoirContent}
    </div>`);
  }

  // ── COLLÈGE DE LA VAILLANCE ───────────────────────────────
  if (isVaillance && bardeLvl>=3) {
    let vaillanceContent = `<div style="padding:7px 10px;background:var(--surface2);border-radius:6px;margin-bottom:6px">
      <div style="font-size:18px;font-weight:600;margin-bottom:2px">⚔ Inspiration martiale <span style="font-size:15px;color:var(--cp);margin-left:4px">1 inspiration</span></div>
      <div style="font-size:17px;color:var(--text3)">Un allié portant une inspiration bardique peut l'utiliser pour : ajouter le résultat à un jet de dégâts d'arme, OU (réaction) ajouter le résultat à sa CA contre une attaque (après avoir vu le jet).</div>
    </div>`;
    if (bardeLvl>=6) {
      vaillanceContent += `<div style="padding:7px 10px;background:var(--surface2);border-radius:6px;margin-bottom:6px">
        <div style="font-size:18px;font-weight:600;margin-bottom:2px">⚔ Attaque supplémentaire <span style="font-size:15px;color:var(--text3)">niv.6</span></div>
        <div style="font-size:17px;color:var(--text3)">Tu peux attaquer deux fois au lieu d'une lors de l'action Attaquer.</div>
      </div>`;
    }
    if (bardeLvl>=14) {
      vaillanceContent += `<div style="padding:7px 10px;background:var(--surface2);border-radius:6px">
        <div style="font-size:18px;font-weight:600;margin-bottom:2px">✨ Magie de combat <span style="font-size:15px;color:var(--text3)">niv.14</span></div>
        <div style="font-size:17px;color:var(--text3)">Quand tu utilises ton action pour lancer un sort de barde, tu peux faire une attaque avec une arme en action bonus.</div>
      </div>`;
    }
    panels.push(`<div style="margin-bottom:10px;padding:10px;background:rgba(33,150,243,.07);border:1px solid rgba(33,150,243,.2);border-radius:8px">
      <div style="font-size:18px;font-weight:700;color:#2196f3;margin-bottom:8px">🛡 Collège de la vaillance</div>
      ${vaillanceContent}
    </div>`);
  }

  return cs('cs-barde', `<div class="panel mb10">
    <div class="pt" style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span>🎵 Barde — Capacités</div>
    ${panels.join('')}
  </div>`);
}

function _bardeUseInspi(kind){
  const p=P();if(!p.combatCharges)p.combatCharges={};
  const bl=((p.classes||[]).find(c=>c.name==='Barde')||{}).level||0;
  const die=bl>=15?'d12':bl>=10?'d10':bl>=5?'d8':'d6';
  const mx=Math.max(1,mod((p.abilities||[])[5]||10));
  const cur=p.combatCharges['InspBardique']!==undefined?p.combatCharges['InspBardique']:mx;
  if(cur<1){showBanner('❌','Plus d inspiration','Repos '+(bl>=5?'court':'long')+' requis',{variant:'danger'});return;}
  p.combatCharges['InspBardique']=cur-1;
  const r=Math.ceil(Math.random()*parseInt(die.slice(1)));
  _markUnsaved();render();
  if(kind==='cinglants')showBanner('🗡','Mots cinglants',die+'('+r+') — la cible SOUSTRAIT '+r+' de son jet',{variant:'info'});
  else showBanner('🎯','Compétence hors-pair',die+'('+r+') — AJOUTE +'+r+' à ton jet raté',{variant:'success'});
}
function openGiveInspirationModal(die, maxCharges) {
  const p = P();
  const allies = (typeof _groupData!=='undefined' ? _groupData : [])
    .filter(gp => gp.uid !== (typeof currentUser!=='undefined' ? currentUser?.uid : null));
  if (!allies.length) { showToast('❌ Aucun allié en ligne dans la campagne.'); return; }
  const listHtml = allies.map((gp,i) => {
    const cd = gp.charData || {};
    const already = (cd.activeBuffs||[]).some(b=>b.name==='InspirationBardique');
    return `<div style="display:flex;align-items:center;gap:10px;padding:8px;background:${already?'rgba(200,168,75,.06)':'var(--surface2)'};border:1px solid ${already?'var(--cp)':'var(--border)'};border-radius:8px;margin-bottom:6px;cursor:${already?'default':'pointer'}" ${already?'':`onclick="_confirmGiveInspiration('${gp.docId}','${esc(gp.playerName||'')}','${die}',${maxCharges})"`}>
      <span style="font-size:25px">${gp.avatar||'⚔'}</span>
      <div style="flex:1"><div style="font-size:18px;font-weight:600">${esc(cd.charName||gp.playerName||'Joueur')}</div><div style="font-size:15px;color:var(--text3)">${esc(gp.playerName||'')}</div></div>
      ${already?`<span style="font-size:15px;color:var(--cp);border:1px solid var(--cp);border-radius:8px;padding:2px 8px">🎵 Déjà inspiré</span>`:`<span style="font-size:17px;color:var(--cp)">+1${die} →</span>`}
    </div>`;
  }).join('');
  openModal(`<div class="pt">🎵 Donner l'inspiration bardique</div>
    <div style="font-size:17px;color:var(--text3);margin-bottom:12px">Choisissez l'allié qui reçoit le dé ${die}. Dépense 1 charge.</div>
    ${listHtml}
    <button class="btn" style="width:100%;margin-top:4px" onclick="closeModal()">Annuler</button>`);
}

function _confirmGiveInspiration(targetDocId, targetName, die, maxCharges) {
  const p = P();
  if (!p.combatCharges) p.combatCharges = {};
  const current = p.combatCharges['InspBardique'] !== undefined ? p.combatCharges['InspBardique'] : maxCharges;
  if (current <= 0) { showToast('❌ Plus d\'inspiration disponible !'); return; }
  p.combatCharges['InspBardique'] = current - 1;
  _markUnsaved(); render();
  const buff = { name: 'InspirationBardique', die, sourceName: p.charName || 'Le barde' };
  if (typeof fbDb !== 'undefined' && targetDocId) {
    fbDb.collection('characters').doc(targetDocId)
      .update({'characterData.activeBuffs': firebase.firestore.FieldValue.arrayUnion(buff)})
      .catch(() => {});
  }
  closeModal();
  showToast(`🎵 Inspiration bardique envoyée à <strong>${esc(targetName)}</strong> — dé ${die} !`, 3000);
}

function rollChantReposant(die) {
  const p = P();
  if (!p.combatCharges) p.combatCharges = {};
  if (_isIRLMode()) {
    const dieSize = parseInt(die.replace('d',''));
    openModal(`<div class="pt">🎶 Chant reposant — Mode IRL</div>
      <div style="text-align:center;padding:12px 0">
        <div style="font-size:32px;margin-bottom:8px">🎶</div>
        <div style="font-size:19px;color:var(--text2);margin-bottom:4px">Lance ton dé de chant :</div>
        <div style="font-size:28px;font-weight:700;color:var(--cp);margin-bottom:12px">${die}</div>
        <div style="font-size:18px;color:var(--text3);margin-bottom:16px">Entre le résultat obtenu — tes alliés l'ajouteront à leurs soins de repos court.</div>
        <input class="fi" id="chantIRLInput" type="number" min="1" max="${dieSize}" placeholder="Résultat du ${die}" style="text-align:center;font-size:20px;margin-bottom:14px">
        <div style="display:flex;gap:8px">
          <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
          <button class="btn bac" style="flex:2" onclick="(()=>{const v=parseInt(document.getElementById('chantIRLInput').value)||0;if(v<1)return;P().combatCharges['ChantReposantResult']=v;saveAll();closeModal();render();showToast('🎶 Chant reposant : +'+v+' PV annoncés aux alliés !',3000);})()">✓ Confirmer</button>
        </div>
      </div>`);
  } else {
    const dieSize = parseInt(die.replace('d',''));
    const roll = Math.ceil(Math.random() * dieSize);
    p.combatCharges['ChantReposantResult'] = roll;
    saveAll();
    render();
    showToast(`🎶 Chant reposant : ${die}(${roll}) — annonce <strong>+${roll} PV</strong> à tes alliés !`, 3500);
  }
}
