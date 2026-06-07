// RÔDEUR — Panneau de combat + Compagnon animal
// ═══════════════════════════════════════

function renderRodeur(p) {
  const wsC = p.wildshape;
  const rodeurLvl = ((p.classes||[]).find(c=>c.name==='Rôdeur')||{}).level||0;
  if (!rodeurLvl || wsC?.active) return '';
  const sagM = mod(p.abilities[4]);
  const combatStyle = p.combatStyle||'';
  const rodeurPath = (p.features||[]).find(f=>['Chasseur','Maître des bêtes'].includes(f.name));
  const isChasseur = rodeurPath?.name==='Chasseur';
  const isMdB = rodeurPath?.name==='Maître des bêtes';

  // Rôdeur niv.1 (et niv.2 sans style de combat) : aucune capacité à afficher → pas de panneau vide
  if(!combatStyle && rodeurLvl<3) return '';
  return cs('cs-rodeur',`<div class="panel mb10"><div class="pt" style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span>🏹 Rôdeur — Capacités</div>
    ${combatStyle?`<div style="margin-bottom:8px;padding:6px 8px;background:var(--surface2);border-radius:6px;font-size:17px;color:var(--text2)">⚔ Style de combat : <strong>${combatStyle}</strong></div>`:''}
    ${rodeurLvl>=3?`<div style="margin-bottom:8px;padding:6px 8px;background:var(--surface2);border-radius:6px;font-size:17px;color:var(--text2)">👁 Vigilance primitive (niv.3) — Action + emplacement : détecter aberrations/célestes/dragons/élémentaires/fées/fiélons/morts-vivants à 1,5 km (1 min/niveau d'emplacement)</div>`:''}
    ${rodeurLvl>=5?`<div style="margin-bottom:8px;padding:6px 8px;background:var(--surface2);border-radius:6px;font-size:17px;color:var(--text2)">⚔ Attaque supplémentaire (niv.5) — Attaquer 2× lors de l'action Attaquer</div>`:''}
    ${rodeurLvl>=8?`<div style="margin-bottom:8px;padding:6px 8px;background:var(--surface2);border-radius:6px;font-size:17px;color:var(--text2)">🚶 Foulée tellurique (niv.8) — Terrains difficiles non magiques sans surcoût de mouvement. Avantage JS contre enchevêtrement et plantes magiques</div>`:''}
    ${rodeurLvl>=10?`<div style="margin-bottom:8px;padding:6px 8px;background:var(--surface2);border-radius:6px;font-size:17px;color:var(--text2)">🌿 Camouflage naturel (niv.10) — 1 min de préparation avec matériaux naturels : +10 à Discrétion si immobile contre une surface solide</div>`:''}
    ${rodeurLvl>=14?`<div style="margin-bottom:8px;padding:6px 8px;background:var(--surface2);border-radius:6px;font-size:17px;color:var(--text2)">🔸 👻 Disparition (niv.14) — Se cacher en action bonus. Ne peut pas être suivi par des moyens non magiques</div>`:''}
    ${rodeurLvl>=18?`<div style="margin-bottom:8px;padding:6px 8px;background:var(--surface2);border-radius:6px;font-size:17px;color:var(--text2)">👂 Sens sauvages (niv.18) — Pas de désavantage pour attaquer une créature invisible à portée. Localise les créatures invisibles à 9m</div>`:''}
    ${rodeurLvl>=20?`<div style="margin-bottom:8px;padding:6px 8px;background:rgba(200,168,75,.07);border:1px solid rgba(200,168,75,.3);border-radius:6px;font-size:17px;color:var(--text2)">🎯 Tueur implacable (niv.20) — 1×/tour : +${sagM} aux jets d'attaque ou de dégâts contre un ennemi juré</div>`:''}
    ${isChasseur&&rodeurLvl>=3?`<div style="border-top:1px solid var(--border);padding-top:10px;margin-top:8px"><div style="font-size:18px;font-weight:600;color:var(--cp);margin-bottom:6px">🎯 Chasseur</div><div style="font-size:17px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Proie du chasseur (niv.3) — Tueur de colosses (+1d8 si cible sous max PV) / Tueur de géants (réaction contre grande créature) / Briseur de hordes (attaque bonus contre cible adjacente)</div>${rodeurLvl>=7?`<div style="font-size:17px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Tactiques défensives (niv.7) — Échapper à la horde (désav. AO) / Défense multi-attaques (+4 CA contre même cible ce tour) / Moral d'acier (avantage JS Peur)</div>`:''} ${rodeurLvl>=11?`<div style="font-size:17px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Attaques multiples (niv.11) — Volée (tir sur N cibles dans 3m d'un point ciblé) / Attaque tourbillonnante (corps à corps sur toutes créatures à 1,5m)</div>`:''} ${rodeurLvl>=15?`<div style="font-size:17px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">Défense supérieure (niv.15) — Esquive totale / Retour de bâton (réaction : retourner l'attaque manquée vers une autre créature) / Esquive instinctive (réaction : dégâts de moitié)</div>`:''}</div>`:''}
    ${isMdB&&rodeurLvl>=3?`<div style="border-top:1px solid var(--border);padding-top:10px;margin-top:8px"><div style="font-size:18px;font-weight:600;color:var(--cp);margin-bottom:6px">🐾 Maître des bêtes</div><div style="font-size:17px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Compagnon du rôdeur (niv.3) — Bête taille M max, CR ≤ 1/4. PV = 4 × niveau Rôdeur. Agit à ton tour sur ordre.</div>${rodeurLvl>=7?`<div style="font-size:17px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">🔸 Entraînement exceptionnel (niv.7) — Action bonus : commander Aider/Foncer/Désengager. Attaques du compagnon = magiques.</div>`:''} ${rodeurLvl>=11?`<div style="font-size:17px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:4px">Fureur bestiale (niv.11) — Sur ordre Attaquer : le compagnon peut attaquer 2×.</div>`:''} ${rodeurLvl>=15?`<div style="font-size:17px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">Partage des sorts (niv.15) — Un sort te ciblant affecte aussi le compagnon s'il est à 9m ou moins.</div>`:''}</div>`:''}
  </div>`);
}

function renderCompagnonAnimal(p) {
  const rodeurLvl = ((p.classes||[]).find(c=>c.name==='Rôdeur')||{}).level||0;
  if (!rodeurLvl) return '';
  const bc = p.beastCompanion;
  if (!bc || !bc.active) {
    return cs('cs-beast-companion',`<div class="panel mb10"><div class="pt" style="display:flex;align-items:center;justify-content:space-between"><div style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span><span>🐾 Compagnon animal</span></div><button class="btn bsm" onclick="openBeastCompanionModal()">⚙ Configurer</button></div>
        ${bc&&!bc.active?`<div style="font-size:18px;color:var(--text3);margin-bottom:8px">🐾 <em>${bc.name}</em> est tombé à 0 PV.</div><button class="btn bsm bac" onclick="recallBeastCompanion()">🐾 Reconvoquer (après repos)</button>`:`<div style="font-size:18px;color:var(--text3)">Aucun compagnon actif. Choisissez une bête pour la suivre ici.</div>`}
      </div>`);
  }
  const bpct = Math.round(bc.hpCur/Math.max(1,bc.hpMax)*100);
  const bhpColor = bpct>50?'#4caf50':bpct>25?'#ff9800':'#e53935';
  return cs('cs-beast-companion',`<div class="panel mb10" style="border-color:rgba(200,168,75,.35)"><div class="pt" style="display:flex;align-items:center;justify-content:space-between"><div style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span><span>${bc.icon} Compagnon — ${bc.name}</span></div><div style="display:flex;gap:6px"><button class="btn bsm" onclick="openBeastCompanionModal()" title="Changer">⚙</button><button class="btn bsm bdanger" onclick="removeBeastCompanion()">✕ Révoquer</button></div></div>
      <div class="g3 mb6">
        <div class="sb hi"><div class="sn">PV</div><div style="font-size:25px;font-weight:700;color:${bhpColor}">${bc.hpCur}</div><div class="sm">${bc.hpCur}/${bc.hpMax}</div></div>
        <div class="sb"><div class="sn">CA</div><div style="font-size:25px;font-weight:700">${bc.ac}</div></div>
        <div class="sb"><div class="sn">Vitesse</div><div style="font-size:15px;font-weight:600;line-height:1.3">${bc.speed}</div></div>
      </div>
      <div class="hp-bar mb6"><div class="hp-fill" style="width:${bpct}%;background:${bhpColor}"></div></div>
      <button class="btn bsm" style="width:100%;margin-bottom:8px;background:#b71c1c;color:#fff;border-color:#b71c1c" onclick="openBeastHpModal()">💥 Dégâts / 💚 Soins</button>
      <div class="g6 mb8">${ABILITIES_SH.map((ab,i)=>`<div class="sb" style="padding:3px"><div class="sn" style="font-size:13px">${ab}</div><div style="font-size:18px;font-weight:600">${bc.ab[i]}</div><div class="sm" style="font-size:13px">${fmt(Math.floor((bc.ab[i]-10)/2))}</div></div>`).join('')}</div>
      ${bc.attacks&&bc.attacks.length?`<div style="margin-bottom:8px"><div class="fl mb4">Attaques</div>${bc.attacks.map(a=>`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:6px 10px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center"><div><strong style="font-size:18px">${a.name}</strong>${a.special?`<div style="font-size:15px;color:var(--text3)">${a.special}</div>`:''}</div><div style="display:flex;align-items:center;gap:6px"><span style="font-size:17px;color:var(--text2)">+${a.bonus} / <strong>${a.dmg}</strong> ${a.type}</span><button class="btn bsm" onclick="rollAttack('${jsq(a.name)}',${a.bonus},'${a.dmg}')" title="Jet d'attaque + dégâts">🎲</button></div></div>`).join('')}</div>`:''}
      ${bc.traits&&bc.traits.length?`<div><div class="fl mb4">Traits</div>${bc.traits.map(t=>`<div style="font-size:17px;color:var(--text2);padding:2px 0">▹ ${t}</div>`).join('')}</div>`:''}
    </div>`);
}

function openBeastCompanionModal() {
  const rodeurLvl = ((P().classes||[]).find(c=>c.name==='Rôdeur')||{}).level||1;
  const hpMax = 4*rodeurLvl;
  const _crVal=s=>{s=(s||'').toString().trim();if(s.includes('/')){const a=s.split('/');return parseFloat(a[0])/parseFloat(a[1]);}return parseFloat(s)||0;};
  const _beasts=BEAST_FORMS.map((b,i)=>({b,i})).filter(x=>_crVal(x.b.crD)<=0.25);
  openWideModal(`<div class="pt">🐾 Choisir un compagnon animal</div>
    <div style="font-size:18px;color:var(--text3);margin-bottom:12px">Compagnon du rôdeur : bête de <strong>FP ≤ 1/4</strong>, taille M max, PV = 4 × niveau (${hpMax} PV). Choisis la forme :</div>
    <div class="crd-grid">${_beasts.map(({b,i})=>`<div class="crd" onclick="bcShowDetail(${i},${hpMax})" style="text-align:center">
      <div style="font-size:30px">${b.icon}</div>
      <h3>${b.name}</h3>
      <span class="tag">CA ${b.ac}</span>
      <span class="tag">FP ${b.crD}</span>
    </div>`).join('')}${_beasts.length?'':'<div style="font-size:18px;color:var(--text3);padding:8px">Aucune bête FP ≤ 1/4 dans le compendium.</div>'}</div>`);
}

function bcShowDetail(idx, hpMax) {
  const b = BEAST_FORMS[idx];
  openWideModal(`<div class="pt">🐾 ${b.name}</div>
    <div style="text-align:center;font-size:48px;margin:8px 0">${b.icon}</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0">
      <div class="sb hi"><div class="sn">PV (max)</div><div style="font-size:25px;font-weight:700;color:var(--cp)">${hpMax}</div></div>
      <div class="sb hi"><div class="sn">CA</div><div style="font-size:25px;font-weight:700">${b.ac}</div></div>
      <div class="sb hi"><div class="sn">Vitesse</div><div style="font-size:19px;font-weight:600">${b.speed}</div></div>
    </div>
    <div style="font-size:18px;color:var(--text3);margin-bottom:8px">⚔ Attaques (avec Bonus de Maîtrise ajouté) — Action bonus du Rôdeur :</div>
    ${b.attacks.map(a=>`<div style="padding:6px;background:var(--surface2);border-radius:6px;margin-bottom:4px;font-size:18px">
      <strong>${a.name}</strong> : +${a.bonus} att. · <strong>${a.dmg}</strong> ${a.type}${a.special?`<div style="font-size:15px;color:var(--text3)">${a.special}</div>`:''}
    </div>`).join('')}
    ${b.traits.length?`<div style="font-size:17px;color:var(--text3);margin-top:8px">${b.traits.map(t=>`▹ ${t}`).join('<br>')}</div>`:''}
    <button class="btn bac" style="width:100%;margin-top:14px" onclick="setBeastCompanion(${idx})">🐾 Choisir ce compagnon</button>
    <button class="btn bsm" style="width:100%;margin-top:6px" onclick="openBeastCompanionModal()">← Retour</button>`);
}

function setBeastCompanion(idx) {
  const p = P(); const b = BEAST_FORMS[idx];
  const rodeurLvl = ((p.classes||[]).find(c=>c.name==='Rôdeur')||{}).level||1;
  const hpMax = 4*rodeurLvl;
  p.beastCompanion = {name:b.name,icon:b.icon,hpMax,hpCur:hpMax,ac:b.ac,speed:b.speed,ab:[...b.ab],attacks:b.attacks.map(a=>({...a})),traits:[...b.traits],active:true};
  closeModal(); saveAll(); render(); showToast(`🐾 ${b.name} est maintenant ton compagnon !`);
}

function removeBeastCompanion() {
  const p = P(); delete p.beastCompanion; closeModal(); saveAll(); render(); showToast('🐾 Compagnon retiré.');
}

// Modal Dégâts/Soins du compagnon — calqué sur openHpModal (perso)
function openBeastHpModal(){
  const bc=P().beastCompanion;if(!bc||!bc.active)return;
  openModal(`<div class="pt">🐾 PV — ${esc(bc.name)}</div>
    <span id="bcHpModalMarker" style="display:none"></span>
    <div class="fl mb6">Montant</div>
    <input class="fi" id="bcHpDelta" type="number" min="0" placeholder="ex : 8" style="margin-bottom:14px">
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1;background:#b71c1c;color:#fff;border-color:#b71c1c" onclick="_beastApplyHp(-1)">💥 Dégâts</button>
      <button class="btn" style="flex:1;background:#2e7d32;color:#fff;border-color:#2e7d32" onclick="_beastApplyHp(1)">💚 Soins</button>
    </div>`);
  setTimeout(()=>{const i=document.getElementById('bcHpDelta');if(i)i.focus();},60);
}
function _beastApplyHp(sign){
  applyBeastCompanionHp(sign);
  if(document.getElementById('bcHpModalMarker'))closeModal();
}
function applyBeastCompanionHp(sign) {
  const p = P(); const bc = p.beastCompanion; if (!bc?.active) return;
  const delta = parseInt(document.getElementById('bcHpDelta')?.value)||0; if (delta<=0) return;
  if (sign<0) { bc.hpCur=Math.max(0,bc.hpCur-delta); if (bc.hpCur<=0) { bc.active=false; showBanner('💀','Compagnon à terre',(bc.name||'Le compagnon')+' tombe à 0 PV',{variant:'danger'}); } }
  else { bc.hpCur=Math.min(bc.hpMax,bc.hpCur+delta); }
  saveAll(); render();
}

function recallBeastCompanion() {
  const p = P(); if (!p.beastCompanion) return;
  const rodeurLvl = ((p.classes||[]).find(c=>c.name==='Rôdeur')||{}).level||1;
  p.beastCompanion.hpMax = 4*rodeurLvl; p.beastCompanion.hpCur = p.beastCompanion.hpMax; p.beastCompanion.active = true;
  saveAll(); render(); showToast(`🐾 ${p.beastCompanion.name} revient (PV max mis à jour) !`);
}
