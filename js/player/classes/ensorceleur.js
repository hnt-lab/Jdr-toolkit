// ENSORCELEUR — Panneau de combat + fonctions Points de sorcellerie / Métamagie
// ═══════════════════════════════════════

function renderEnsorceleur(p) {
  const wsC = p.wildshape;
  if (wsC?.active) return '';
  const sorcLvl = ((p.classes||[]).find(c=>c.name==='Ensorceleur')||{}).level||0;
  if (!sorcLvl) return '';
  const chaM = mod(p.abilities[5]);
  const sorcPath = (p.features||[]).find(f=>['Lignée draconique','Magie sauvage'].includes(f.name));
  const isSorcDraconique = sorcPath?.name==='Lignée draconique';
  const isSorcSauvage = sorcPath?.name==='Magie sauvage';
  const sorcPtsMax = sorcLvl>=2?sorcLvl:0; // RAW : Source de magie au niveau 2 (0 pt au niveau 1)
  const sorcPts = (p.combatCharges||{})['SorcelleriePts']!==undefined?p.combatCharges['SorcelleriePts']:sorcPtsMax;
  const sorcBubbles = Array.from({length:sorcPtsMax},(_,sp)=>`<span class="slot-bubble${sp<sorcPts?'':' used'}" onclick="toggleSorcPts(${sp},${sorcPtsMax})"></span>`).join('');
  const flexButtons = [[1,2],[2,3],[3,5],[4,6],[5,7]].map(([niv,cout])=>`<button class="btn bsm" onclick="sorcCreateSlot(${niv},${cout},${sorcPtsMax})" ${sorcPts<cout?'disabled':''}>Niv.${niv} (${cout} pts)</button>`).join('');

  return cs('cs-sorc',`<div class="panel mb10"><div class="pt" style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span>✨ Points de sorcellerie — Ensorceleur</div>
        <div style="font-size:17px;color:var(--text3);margin-bottom:10px">${_featDesc('Ensorceleur','Points de sorcellerie')}</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">${sorcBubbles}</div>
        <div style="font-size:17px;color:var(--text3);margin-bottom:6px">${sorcPts}/${sorcPtsMax} pts • Repos long</div>
        <div style="font-size:17px;color:var(--text3);margin-bottom:4px">Magie flexible — Créer un emplacement :</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">${flexButtons}</div>
        <button class="btn bsm" onclick="P().combatCharges=P().combatCharges||{};P().combatCharges['SorcelleriePts']=${sorcPtsMax};_markUnsaved();render()">↺ Repos long</button>
        ${sorcLvl>=3?(()=>{const METAMAGIC_OPTIONS=[{n:'Sort accéléré',c:2,d:"Quand tu lances un sort au temps d'incantation de 1 action, dépense 2 pts pour le lancer en 1 action bonus."},{n:'Sort ample',c:1,d:'Double la portée du sort (portée de contact → 9 m).'},{n:'Sort étendu',c:1,d:'Double la durée du sort (max 24 h).'},{n:'Sort intensifié',c:3,d:'Une cible du sort subit un désavantage à son 1er jet de sauvegarde contre ce sort.'},{n:'Sort jumeau',c:'=niv sort',d:"Cible une 2e créature avec un sort à cible unique (hors portée personnelle). Coût = niveau du sort (1 pt si mineur)."},{n:'Sort prévenant',c:1,d:'Pour un sort à JS : un nombre de créatures = mod. CHA (min 1) réussissent automatiquement leur jet.'},{n:'Sort renforcé',c:1,d:'Relance un nombre de dés de dégâts ≤ mod. CHA ('+Math.max(1,chaM)+', min 1). Conserve les nouveaux résultats.'},{n:'Sort subtil',c:1,d:'Lance le sort sans composante verbale ni gestuelle.'}];const maxOpts=sorcLvl>=17?4:sorcLvl>=10?3:2;const chosen=p.metamagicOptions||[];return`<div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px"><div style="font-size:18px;font-weight:600;color:var(--cp);margin-bottom:4px">✨ Métamagie <span style="font-size:15px;color:var(--text3);font-weight:400">${chosen.length}/${maxOpts} options choisies</span></div><div style="display:flex;flex-wrap:wrap;gap:6px">${METAMAGIC_OPTIONS.map(m=>{const sel=chosen.includes(m.n);return`<div style="padding:6px 10px;background:${sel?'rgba(200,168,75,.15)':'var(--surface2)'};border:1px solid ${sel?'var(--cp)':'var(--border)'};border-radius:8px;cursor:pointer;flex:1;min-width:160px" onclick="toggleMetamagic('${m.n}',${maxOpts})"><div style="font-size:18px;font-weight:600;color:${sel?'var(--cp)':'var(--text2)'}">${m.n} <span style="font-size:15px;color:var(--text3)">${typeof m.c==='number'?m.c+' pt'+(m.c>1?'s':''):m.c}</span></div><div style="font-size:15px;color:var(--text3);margin-top:2px">${m.d}</div></div>`;}).join('')}</div></div></div>`;})():''}
      ${sorcLvl>=20?(()=>{const reUsed=!!((p.combatCharges||{})['RestaurationEnsorceleurUsed']);return`<div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px"><div style="font-size:18px;font-weight:600;color:var(--cp);margin-bottom:4px">♻ Restauration ensorcelée (niv.20)</div><div style="font-size:17px;color:var(--text2);margin-bottom:6px">À <strong>chaque</strong> repos court terminé : tu regagnes 4 pts de sorcellerie.</div><div style="display:flex;align-items:center;gap:6px"><span class="slot-bubble${reUsed?' used':''}" title="${reUsed?'Déjà appliquée pour ce repos court':'Disponible'}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['RestaurationEnsorceleurUsed']=!p.combatCharges['RestaurationEnsorceleurUsed'];saveAll();render();})()"></span><button class="btn bsm" ${reUsed?'disabled':''} onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};if(p.combatCharges['RestaurationEnsorceleurUsed']){showToast('❌ Déjà appliquée — termine un nouveau repos court.');return;}p.combatCharges['SorcelleriePts']=Math.min(${sorcPtsMax},(p.combatCharges['SorcelleriePts']||0)+4);p.combatCharges['RestaurationEnsorceleurUsed']=true;saveAll();render();showToast('♻ +4 pts de sorcellerie (Restauration ensorcelée)');})()">+4 pts</button><button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};delete p.combatCharges['RestaurationEnsorceleurUsed'];saveAll();render();})()">↺ Nouveau repos court</button></div></div>`;})():''}
      ${isSorcDraconique?`<div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px"><div style="font-size:18px;font-weight:600;color:var(--cp);margin-bottom:6px">🐉 Lignée draconique</div><div style="font-size:17px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">Résistance draconique (niv.1) — CA 13+DEX si non armé · +${sorcLvl} PV bonus (1/niveau)</div>${sorcLvl>=6?`<div style="font-size:17px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">Affinité élémentaire (niv.6) — +${chaM} aux dégâts de ton type draconique. Dépense 1 pt → résistance à ce type 1 heure. <button class="btn bsm" style="font-size:15px;margin-top:2px" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};const cur=p.combatCharges['SorcelleriePts']!==undefined?p.combatCharges['SorcelleriePts']:${sorcPtsMax};if(cur<1){showToast('❌ Pas assez de points (1 requis)');return;}p.combatCharges['SorcelleriePts']=cur-1;saveAll();render();showToast('🐉 Résistance élémentaire activée (1h) — −1 pt');})()">−1 pt (résistance 1h)</button></div>`:''} ${sorcLvl>=14?`<div style="font-size:17px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">🦋 🔸 Ailes draconiques (niv.14) — Action bonus : faire apparaître des ailes, vitesse de vol = déplacement de base</div>`:''} ${sorcLvl>=18?(()=>{const pdActive=!!(p.combatCharges||{})['PresenceDracoSorcActive'];return`<div style="padding:6px 8px;background:${pdActive?'rgba(200,168,75,.1)':'var(--surface2)'};border:1px solid ${pdActive?'var(--cp)':'var(--border)'};border-radius:6px"><div style="font-size:17px;font-weight:600;color:var(--text2)">Présence draconique (niv.18) — Aura 18m, créatures charmées ou effrayées (1 min)</div><div style="display:flex;gap:6px;margin-top:4px"><button class="btn bsm" style="${pdActive?'color:var(--cp)':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};if(!p.combatCharges['PresenceDracoSorcActive']){if((p.combatCharges['SorcelleriePts']||0)<5){showToast('❌ Pas assez de pts (5 requis)');return;}p.combatCharges['SorcelleriePts']=(p.combatCharges['SorcelleriePts']||0)-5;}p.combatCharges['PresenceDracoSorcActive']=!p.combatCharges['PresenceDracoSorcActive'];saveAll();render();})()">${pdActive?'↺ Mettre fin':'⚡ Activer (5 pts)'}</button></div></div>`;})():''}</div>`:''}
      ${isSorcSauvage?`<div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px"><div style="font-size:18px;font-weight:600;color:var(--cp);margin-bottom:6px">🌀 Magie sauvage</div>${(()=>{const mChaosUsed=!!(p.combatCharges||{})['MareeChaosUsed'];return`<div style="padding:6px 8px;background:${mChaosUsed?'rgba(200,168,75,.1)':'var(--surface2)'};border:1px solid ${mChaosUsed?'var(--cp)':'var(--border)'};border-radius:6px;margin-bottom:6px"><div style="font-size:17px;font-weight:600;color:var(--text2)">Marée du chaos (niv.1) — 1/repos long</div><div style="font-size:15px;color:var(--text3);margin:2px 0">Avantage sur 1 jet. La prochaine utilisation de sort provoque une surtension.</div><div style="margin-top:4px"><button class="btn bsm" style="${mChaosUsed?'color:var(--cp)':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['MareeChaosUsed']=!p.combatCharges['MareeChaosUsed'];saveAll();render();})()">${mChaosUsed?'↺ Récupérer (repos long)':'⚡ Utiliser'}</button></div></div>${mChaosUsed?'<div style="background:rgba(156,39,176,.15);border:1px solid rgba(156,39,176,.4);border-radius:6px;padding:6px 10px;margin-bottom:6px"><div style="font-size:17px;font-weight:600;color:#ce93d8">⚠ Surtension imminente</div><div style="font-size:15px;color:var(--text3)">Ton prochain sort déclenche une surtension de magie sauvage !</div></div>':''}`;})()}${sorcLvl>=6?`<div style="font-size:17px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">↪ Chance forcée (niv.6) — Réaction : dépense 2 pts, impose +1d4 ou −1d4 à un jet d'une créature à portée. <button class="btn bsm" style="font-size:15px;margin-top:2px" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};const cur=p.combatCharges['SorcelleriePts']!==undefined?p.combatCharges['SorcelleriePts']:${sorcPtsMax};if(cur<2){showToast('❌ Pas assez de points (2 requis)');return;}p.combatCharges['SorcelleriePts']=cur-2;const r=Math.ceil(Math.random()*4);saveAll();render();showToast('🌀 Chance forcée : 1d4 = '+r+' (ajouter ou soustraire) — −2 pts');})()">−2 pts + 🎲 1d4</button></div>`:''} ${sorcLvl>=14?`<div style="font-size:17px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px;margin-bottom:6px">Chaos contrôlé (niv.14) — Quand une surtension se produit, relance 2× et choisis l'effet</div>`:''} ${sorcLvl>=18?`<div style="font-size:17px;color:var(--text2);padding:5px 8px;background:var(--surface2);border-radius:6px">Bombardement de sort (niv.18) — Si un dé de dégâts sort son maximum, relance-le et ajoute le résultat</div>`:''}</div>`:''}
      </div>`);
}

function toggleMetamagic(name, maxOpts) {
  const p = P();
  if (!p.metamagicOptions) p.metamagicOptions = [];
  const idx = p.metamagicOptions.indexOf(name);
  if (idx >= 0) {
    p.metamagicOptions.splice(idx, 1);
  } else {
    if (p.metamagicOptions.length >= maxOpts) { showToast(`❌ Limite atteinte (${maxOpts} options max à ce niveau).`); return; }
    p.metamagicOptions.push(name);
  }
  _markUnsaved(); render();
}

function toggleSorcPts(idx, max) {
  const p = P();
  if (!p.combatCharges) p.combatCharges = {};
  const cur = p.combatCharges['SorcelleriePts']!==undefined?p.combatCharges['SorcelleriePts']:max;
  p.combatCharges['SorcelleriePts'] = idx<cur?idx:Math.min(max,idx+1);
  render();
}

function sorcCreateSlot(niv, cout, max) {
  const p = P();
  if (!p.combatCharges) p.combatCharges = {};
  const cur = p.combatCharges['SorcelleriePts']!==undefined?p.combatCharges['SorcelleriePts']:max;
  if (cur < cout) { showToast('❌ Pas assez de points ('+cout+' requis)'); return; }
  p.combatCharges['SorcelleriePts'] = cur-cout;
  if (!p.spellSlotsUsed) p.spellSlotsUsed = [];
  p.spellSlotsUsed[niv-1] = Math.max(0,(p.spellSlotsUsed[niv-1]||1)-1);
  render();
  showToast('✓ Emplacement niv.'+niv+' créé (−'+cout+' pts)');
}
