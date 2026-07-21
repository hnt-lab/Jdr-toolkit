// RÔDEUR — Panneau de combat + Compagnon animal
// ═══════════════════════════════════════

function renderRodeur(p) {
  const wsC = p.wildshape;
  const rodeurLvl = ((p.classes||[]).find(c=>c.name==='Rôdeur')||{}).level||0;
  if (!rodeurLvl || wsC?.active) return '';
  const sagM = mod(p.abilities[4]);
  const combatStyle = p.combatStyle||'';
  const rodeurPath = (p.features||[]).find(f=>['Chasseur','Maître des bêtes','Gardien de drake'].includes(f.name));
  const isChasseur = rodeurPath?.name==='Chasseur';
  const isMdB = rodeurPath?.name==='Maître des bêtes';
  const isDrake = rodeurPath?.name==='Gardien de drake';

  // Rôdeur niv.1 (et niv.2 sans style de combat) : aucune capacité à afficher → pas de panneau vide
  if(!combatStyle && rodeurLvl<3) return '';
  return cs('cs-rodeur',`<div class="panel mb10"><div class="pt" style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span>🏹 Rôdeur — Capacités</div>
    ${combatStyle?`<div style="margin-bottom:8px;padding:6px 8px;background:var(--surface2);border-radius:2px;font-size:13px;color:var(--text2)">⚔ Style de combat : <strong>${combatStyle}</strong></div>`:''}
    ${rodeurLvl>=3?`<div style="margin-bottom:8px;padding:6px 8px;background:var(--surface2);border-radius:2px;font-size:13px;color:var(--text2)">👁 Vigilance primitive (niv.3) — Action + emplacement : détecter aberrations/célestes/dragons/élémentaires/fées/fiélons/morts-vivants à 1,5 km (1 min/niveau d'emplacement)</div>`:''}
    ${rodeurLvl>=5?`<div style="margin-bottom:8px;padding:6px 8px;background:var(--surface2);border-radius:2px;font-size:13px;color:var(--text2)">⚔ Attaque supplémentaire (niv.5) — Attaquer 2× lors de l'action Attaquer</div>`:''}
    ${rodeurLvl>=8?`<div style="margin-bottom:8px;padding:6px 8px;background:var(--surface2);border-radius:2px;font-size:13px;color:var(--text2)">🚶 Foulée tellurique (niv.8) — Terrains difficiles non magiques sans surcoût de mouvement. Avantage JS contre enchevêtrement et plantes magiques</div>`:''}
    ${rodeurLvl>=10?`<div style="margin-bottom:8px;padding:6px 8px;background:var(--surface2);border-radius:2px;font-size:13px;color:var(--text2)">🌿 Camouflage naturel (niv.10) — 1 min de préparation avec matériaux naturels : +10 à Discrétion si immobile contre une surface solide</div>`:''}
    ${rodeurLvl>=14?`<div style="margin-bottom:8px;padding:6px 8px;background:var(--surface2);border-radius:2px;font-size:13px;color:var(--text2)">🔸 👻 Disparition (niv.14) — Se cacher en action bonus. Ne peut pas être suivi par des moyens non magiques</div>`:''}
    ${rodeurLvl>=18?`<div style="margin-bottom:8px;padding:6px 8px;background:var(--surface2);border-radius:2px;font-size:13px;color:var(--text2)">👂 Sens sauvages (niv.18) — Pas de désavantage pour attaquer une créature invisible à portée. Localise les créatures invisibles à 9m</div>`:''}
    ${rodeurLvl>=20?`<div style="margin-bottom:8px;padding:6px 8px;background:rgba(200,168,75,.07);border:1px solid rgba(200,168,75,.3);border-radius:2px;font-size:13px;color:var(--text2)">🎯 Tueur implacable (niv.20) — 1×/tour : +${sagM} aux jets d'attaque ou de dégâts contre un ennemi juré</div>`:''}
    ${isChasseur&&rodeurLvl>=3?`<div style="border-top:1px solid var(--border);padding-top:10px;margin-top:8px"><div style="font-size:13px;font-weight:600;color:var(--cp);margin-bottom:6px">🎯 Chasseur</div><div style="font-size:13px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:2px;margin-bottom:4px">Proie du chasseur (niv.3) — Tueur de colosses (+1d8 si cible sous max PV) / Tueur de géants (réaction contre grande créature) / Briseur de hordes (attaque bonus contre cible adjacente)</div>${rodeurLvl>=7?`<div style="font-size:13px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:2px;margin-bottom:4px">Tactiques défensives (niv.7) — Échapper à la horde (désav. AO) / Défense multi-attaques (+4 CA contre même cible ce tour) / Moral d'acier (avantage JS Peur)</div>`:''} ${rodeurLvl>=11?`<div style="font-size:13px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:2px;margin-bottom:4px">Attaques multiples (niv.11) — Volée (tir sur N cibles dans 3m d'un point ciblé) / Attaque tourbillonnante (corps à corps sur toutes créatures à 1,5m)</div>`:''} ${rodeurLvl>=15?`<div style="font-size:13px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:2px">Défense supérieure (niv.15) — Esquive totale / Retour de bâton (réaction : retourner l'attaque manquée vers une autre créature) / Esquive instinctive (réaction : dégâts de moitié)</div>`:''}</div>`:''}
    ${isMdB&&rodeurLvl>=3?`<div style="border-top:1px solid var(--border);padding-top:10px;margin-top:8px"><div style="font-size:13px;font-weight:600;color:var(--cp);margin-bottom:6px">🐾 Maître des bêtes</div><div style="font-size:13px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:2px;margin-bottom:4px">Compagnon du rôdeur (niv.3) — Bête taille M max, CR ≤ 1/4. PV = 4 × niveau Rôdeur. Agit à ton tour sur ordre.</div>${rodeurLvl>=7?`<div style="font-size:13px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:2px;margin-bottom:4px">🔸 Entraînement exceptionnel (niv.7) — Action bonus : commander Aider/Foncer/Désengager. Attaques du compagnon = magiques.</div>`:''} ${rodeurLvl>=11?`<div style="font-size:13px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:2px;margin-bottom:4px">Fureur bestiale (niv.11) — Sur ordre Attaquer : le compagnon peut attaquer 2×.</div>`:''} ${rodeurLvl>=15?`<div style="font-size:13px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:2px">Partage des sorts (niv.15) — Un sort te ciblant affecte aussi le compagnon s'il est à 9m ou moins.</div>`:''}</div>`:''}
    ${isDrake&&rodeurLvl>=3?renderGardienDrake(p,rodeurLvl):''}
  </div>`);
}

// ── GARDIEN DE DRAKE (Fizban) — pattern entités-créatures ──
function renderGardienDrake(p, rodeurLvl) {
  const pbv = pb(totalLevel(p));
  const sagM = mod(p.abilities[4]);
  const dk = p.drakeCompanion;
  const hpMax = 5 + 5*rodeurLvl;
  const ESSENCES = ['Acide','Froid','Feu','Foudre','Poison'];
  const souffleUsed = !!(p.combatCharges||{})['SouffleDrake'];
  const souffleDice = rodeurLvl>=15?'10d6':'8d6';
  const biteDmg = '1d6+'+pbv + (rodeurLvl>=15?'+2d6':rodeurLvl>=7?'+1d6':'');
  const taille = rodeurLvl>=15?'G':rodeurLvl>=7?'M':'P';
  let html = `<div style="border-top:1px solid var(--border);padding-top:10px;margin-top:8px"><div style="font-size:13px;font-weight:600;color:var(--cp);margin-bottom:6px">🐉 Gardien de drake</div>
    <div style="font-size:13px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:2px;margin-bottom:4px">Don draconique (niv.3) — Tu connais Thaumaturgie (sort de rôdeur pour toi) et tu parles, lis et écris le draconique (ou une autre langue au choix).</div>`;
  if (!dk || !dk.active) {
    html += `<div style="padding:7px 10px;background:var(--surface2);border-radius:2px;margin-bottom:4px">
      <div style="font-size:13px;color:var(--text3);margin-bottom:6px">Action : invoque ton drake (${hpMax} PV, CA ${14+pbv}, taille ${taille}). Après une invocation, il faut un repos long ou dépenser un emplacement de sort de niv.1+ pour le réinvoquer. Choisis son essence draconique :</div>
      <div style="display:flex;gap:4px;flex-wrap:wrap">${ESSENCES.map(e=>`<button class="btn bsm bac" onclick="invokeDrake('${e}')">🐉 ${e}</button>`).join('')}</div>
    </div>`;
  } else {
    const dpct = Math.round(dk.hpCur/Math.max(1,dk.hpMax)*100);
    const dcol = dpct>50?'var(--good)':dpct>25?'var(--warn)':'var(--danger)';
    html += `<div style="padding:7px 10px;background:rgba(255,87,34,.06);border:1px solid rgba(255,87,34,.25);border-radius:2px;margin-bottom:4px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><span style="font-size:13px;font-weight:600">🐉 Drake — essence ${esc(dk.essence)} (taille ${taille})</span><button class="btn bsm bdanger" onclick="dismissDrake()">✕ Renvoyer</button></div>
      <div style="display:flex;gap:8px;font-size:13px;color:var(--text3);margin-bottom:6px;flex-wrap:wrap"><span>CA <strong>${14+pbv}</strong></span><span>PV <strong style="color:${dcol}">${dk.hpCur}/${dk.hpMax}</strong></span><span>Vitesse 12m${rodeurLvl>=7?' + vol 12m':''}</span><span>Immunité ${esc(dk.essence)}</span></div>
      <div class="hp-bar mb6"><div class="hp-fill" style="width:${dpct}%;background:${dcol}"></div></div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px">
        <button class="btn bsm" onclick="rollAttack('Morsure du drake',${3+pbv},'${biteDmg}')">🗡 Morsure +${3+pbv} (${biteDmg})</button>
        <button class="btn bsm" style="background:var(--danger);color:#fff;border-color:var(--danger)" onclick="openDrakeHpModal()">💥 / 💚 PV</button>
      </div>
      <div style="font-size:12px;color:var(--text3)">↪ Coups imprégnés (réaction) : quand une créature à 9m du drake touche avec une arme, l'attaque inflige +1d6 dégâts de ${esc(dk.essence)}. <button class="btn bsm" onclick="rollCustomDmg('1d6','Coups imprégnés')">🎲 1d6</button></div>
      ${rodeurLvl>=7?`<div style="font-size:12px;color:var(--text3);margin-top:4px">🛡 Lien du croc et d'écailles (niv.7) : tu as la résistance aux dégâts de ${esc(dk.essence)} tant que le drake est invoqué${rodeurLvl>=15?' ; monture volante possible (taille G)':' ; monture possible (pas de vol monté)'}.</div>`:''}
    </div>`;
  }
  if (rodeurLvl>=11) {
    html += `<div style="padding:7px 10px;background:var(--surface2);border-radius:2px;margin-bottom:4px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px"><span style="font-size:13px;font-weight:600">🌬 Souffle de drake <span style="font-size:12px;color:var(--text3)">niv.11</span></span><span class="slot-bubble${souffleUsed?' used':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['SouffleDrake']=!p.combatCharges['SouffleDrake'];saveAll();render();})()"></span></div>
      <div style="font-size:13px;color:var(--text3);margin-bottom:6px">Action : cône de 9m — JS DEX DD ${8+pbv+sagM} ou <strong>${souffleDice}</strong> dégâts (acide, froid, feu, foudre ou poison au choix), moitié si réussi. 1×/repos long, ou dépense d'un emplacement de sort de niv.3+.</div>
      <div style="display:flex;gap:6px"><button class="btn bsm bac" onclick="rollCustomDmg('${souffleDice}','Souffle de drake')">🎲 ${souffleDice}</button><button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};delete p.combatCharges['SouffleDrake'];saveAll();render();})()">↺ Repos long</button></div>
    </div>`;
  }
  html += `</div>`;
  return html;
}
function invokeDrake(essence) {
  const p = P();
  const rodeurLvl = ((p.classes||[]).find(c=>c.name==='Rôdeur')||{}).level||1;
  const hpMax = 5 + 5*rodeurLvl;
  p.drakeCompanion = {active:true, essence, hpMax, hpCur:hpMax};
  saveAll(); render(); showToast('🐉 Drake invoqué — essence '+essence+' ('+hpMax+' PV)');
}
function dismissDrake() { const p = P(); delete p.drakeCompanion; saveAll(); render(); showToast('🐉 Drake renvoyé.'); }
function openDrakeHpModal() {
  const dk = P().drakeCompanion; if (!dk || !dk.active) return;
  openModal(`<div class="pt">🐉 PV — Drake</div>
    <div class="fl mb6">Montant</div>
    <input class="fi" id="dkHpDelta" type="number" min="0" placeholder="ex : 8" style="margin-bottom:14px">
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1;background:var(--danger);color:#fff;border-color:var(--danger)" onclick="_drakeApplyHp(-1)">💥 Dégâts</button>
      <button class="btn" style="flex:1;background:var(--good);color:#fff;border-color:var(--good)" onclick="_drakeApplyHp(1)">💚 Soins</button>
    </div>`);
  setTimeout(()=>{const i=document.getElementById('dkHpDelta');if(i)i.focus();},60);
}
function _drakeApplyHp(sign) {
  const p = P(); const dk = p.drakeCompanion; if (!dk?.active) return;
  const delta = parseInt(document.getElementById('dkHpDelta')?.value)||0; if (delta<=0) return;
  if (sign<0) { dk.hpCur = Math.max(0,dk.hpCur-delta); if (dk.hpCur<=0) { dk.active=false; showBanner('💀','Drake à terre','Le drake disparaît (0 PV). Réinvocation : repos long ou emplacement de sort niv.1+.',{variant:'danger'}); } }
  else dk.hpCur = Math.min(dk.hpMax,dk.hpCur+delta);
  closeModal(); saveAll(); render();
}

function renderCompagnonAnimal(p) {
  const rodeurLvl = ((p.classes||[]).find(c=>c.name==='Rôdeur')||{}).level||0;
  if (!rodeurLvl) return '';
  const bc = p.beastCompanion;
  if (!bc || !bc.active) {
    return cs('cs-beast-companion',`<div class="panel mb10"><div class="pt" style="display:flex;align-items:center;justify-content:space-between"><div style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span><span>🐾 Compagnon animal</span></div><button class="btn bsm" onclick="openBeastCompanionModal()">⚙ Configurer</button></div>
        ${bc&&!bc.active?`<div style="font-size:13px;color:var(--text3);margin-bottom:8px">🐾 <em>${bc.name}</em> est tombé à 0 PV.</div><button class="btn bsm bac" onclick="recallBeastCompanion()">🐾 Reconvoquer (après repos)</button>`:`<div style="font-size:13px;color:var(--text3)">Aucun compagnon actif. Choisissez une bête pour la suivre ici.</div>`}
      </div>`);
  }
  const bpct = Math.round(bc.hpCur/Math.max(1,bc.hpMax)*100);
  const bhpColor = bpct>50?'var(--good)':bpct>25?'var(--warn)':'var(--danger)';
  const _bcPb = pb(totalLevel(p)); // RAW : bonus de maîtrise du rôdeur ajouté à CA, attaques et dégâts du compagnon
  return cs('cs-beast-companion',`<div class="panel mb10" style="border-color:rgba(200,168,75,.35)"><div class="pt" style="display:flex;align-items:center;justify-content:space-between"><div style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span><span>${bc.icon} Compagnon — ${bc.name}</span></div><div style="display:flex;gap:6px"><button class="btn bsm" onclick="openBeastCompanionModal()" title="Changer">⚙</button><button class="btn bsm bdanger" onclick="removeBeastCompanion()">✕ Révoquer</button></div></div>
      <div class="g3 mb6">
        <div class="sb hi"><div class="sn">PV</div><div style="font-size:18px;font-weight:700;color:${bhpColor}">${bc.hpCur}</div><div class="sm">${bc.hpCur}/${bc.hpMax}</div></div>
        <div class="sb"><div class="sn">CA</div><div style="font-size:18px;font-weight:700">${bc.ac+_bcPb}</div><div class="sm">${bc.ac}+${_bcPb} maîtrise</div></div>
        <div class="sb"><div class="sn">Vitesse</div><div style="font-size:12px;font-weight:600;line-height:1.3">${bc.speed}</div></div>
      </div>
      <div class="hp-bar mb6"><div class="hp-fill" style="width:${bpct}%;background:${bhpColor}"></div></div>
      <button class="btn bsm" style="width:100%;margin-bottom:8px;background:var(--danger);color:#fff;border-color:var(--danger)" onclick="openBeastHpModal()">💥 Dégâts / 💚 Soins</button>
      <div class="g6 mb8">${ABILITIES_SH.map((ab,i)=>`<div class="sb" style="padding:3px"><div class="sn" style="font-size:13px">${ab}</div><div style="font-size:13px;font-weight:600">${bc.ab[i]}</div><div class="sm" style="font-size:13px">${fmt(Math.floor((bc.ab[i]-10)/2))}</div></div>`).join('')}</div>
      ${bc.attacks&&bc.attacks.length?`<div style="margin-bottom:8px"><div class="fl mb4">Attaques <span style="font-size:13px;color:var(--text3);font-weight:400">(maîtrise +${_bcPb} incluse)</span></div>${bc.attacks.map(a=>`<div class="g-sub" style="padding:6px 10px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center"><div><strong style="font-size:13px">${a.name}</strong>${a.special?`<div style="font-size:12px;color:var(--text3)">${a.special}</div>`:''}</div><div style="display:flex;align-items:center;gap:6px"><span style="font-size:13px;color:var(--text2)">+${a.bonus+_bcPb} / <strong>${a.dmg}+${_bcPb}</strong> ${a.type}</span><button class="btn bsm" onclick="rollAttack('${jsq(a.name)}',${a.bonus+_bcPb},'${a.dmg}+${_bcPb}')" title="Jet d'attaque + dégâts">🎲</button></div></div>`).join('')}</div>`:''}
      ${bc.traits&&bc.traits.length?`<div><div class="fl mb4">Traits</div>${bc.traits.map(t=>`<div style="font-size:13px;color:var(--text2);padding:2px 0">▹ ${t}</div>`).join('')}</div>`:''}
    </div>`);
}

function openBeastCompanionModal() {
  const rodeurLvl = ((P().classes||[]).find(c=>c.name==='Rôdeur')||{}).level||1;
  const hpMax = 4*rodeurLvl; // affichage indicatif — le max réel = max(PV normaux de la bête, 4×niveau)
  const _crVal=s=>{s=(s||'').toString().trim();if(s.includes('/')){const a=s.split('/');return parseFloat(a[0])/parseFloat(a[1]);}return parseFloat(s)||0;};
  const _beasts=BEAST_FORMS.map((b,i)=>({b,i})).filter(x=>_crVal(x.b.crD)<=0.25);
  openWideModal(`<div class="pt">🐾 Choisir un compagnon animal</div>
    <div style="font-size:13px;color:var(--text3);margin-bottom:12px">Compagnon du rôdeur : bête de <strong>FP ≤ 1/4</strong>, taille M max, PV = 4 × niveau (${hpMax} PV). Choisis la forme :</div>
    <div class="crd-grid">${_beasts.map(({b,i})=>`<div class="crd" onclick="bcShowDetail(${i},${hpMax})" style="text-align:center">
      <div style="font-size:30px">${b.icon}</div>
      <h3>${b.name}</h3>
      <span class="tag">CA ${b.ac}</span>
      <span class="tag">FP ${b.crD}</span>
    </div>`).join('')}${_beasts.length?'':'<div style="font-size:13px;color:var(--text3);padding:8px">Aucune bête FP ≤ 1/4 dans le compendium.</div>'}</div>`);
}

function bcShowDetail(idx, hpMax) {
  const b = BEAST_FORMS[idx];
  openWideModal(`<div class="pt">🐾 ${b.name}</div>
    <div style="text-align:center;font-size:48px;margin:8px 0">${b.icon}</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0">
      <div class="sb hi"><div class="sn">PV (max)</div><div style="font-size:18px;font-weight:700;color:var(--cp)">${hpMax}</div></div>
      <div class="sb hi"><div class="sn">CA</div><div style="font-size:18px;font-weight:700">${b.ac}</div></div>
      <div class="sb hi"><div class="sn">Vitesse</div><div style="font-size:14px;font-weight:600">${b.speed}</div></div>
    </div>
    <div style="font-size:13px;color:var(--text3);margin-bottom:8px">⚔ Attaques (avec Bonus de Maîtrise ajouté) — Action bonus du Rôdeur :</div>
    ${b.attacks.map(a=>`<div style="padding:6px;background:var(--surface2);border-radius:2px;margin-bottom:4px;font-size:13px">
      <strong>${a.name}</strong> : +${a.bonus} att. · <strong>${a.dmg}</strong> ${a.type}${a.special?`<div style="font-size:12px;color:var(--text3)">${a.special}</div>`:''}
    </div>`).join('')}
    ${b.traits.length?`<div style="font-size:13px;color:var(--text3);margin-top:8px">${b.traits.map(t=>`▹ ${t}`).join('<br>')}</div>`:''}
    <button class="btn bac" style="width:100%;margin-top:14px" onclick="setBeastCompanion(${idx})">🐾 Choisir ce compagnon</button>
    <button class="btn bsm" style="width:100%;margin-top:6px" onclick="openBeastCompanionModal()">← Retour</button>`);
}

function setBeastCompanion(idx) {
  const p = P(); const b = BEAST_FORMS[idx];
  const rodeurLvl = ((p.classes||[]).find(c=>c.name==='Rôdeur')||{}).level||1;
  const hpMax = Math.max(4*rodeurLvl, b.hpMax||0); // RAW : max normal de la bête OU 4×niveau (le plus haut)
  p.beastCompanion = {name:b.name,icon:b.icon,baseHp:b.hpMax||0,hpMax,hpCur:hpMax,ac:b.ac,speed:b.speed,ab:[...b.ab],attacks:b.attacks.map(a=>({...a})),traits:[...b.traits],active:true};
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
      <button class="btn" style="flex:1;background:var(--danger);color:#fff;border-color:var(--danger)" onclick="_beastApplyHp(-1)">💥 Dégâts</button>
      <button class="btn" style="flex:1;background:var(--good);color:#fff;border-color:var(--good)" onclick="_beastApplyHp(1)">💚 Soins</button>
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
  p.beastCompanion.hpMax = Math.max(4*rodeurLvl, p.beastCompanion.baseHp||0); p.beastCompanion.hpCur = p.beastCompanion.hpMax; p.beastCompanion.active = true;
  saveAll(); render(); showToast(`🐾 ${p.beastCompanion.name} revient (PV max mis à jour) !`);
}
