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
    <div class="sb hi" style="flex:1;min-width:70px"><div class="sn">Dé inspiration</div><div style="font-size:18px;font-weight:700;color:var(--cp)">${bardDie}</div></div>
    <div class="sb hi" style="flex:1;min-width:70px"><div class="sn">DD sorts</div><div style="font-size:18px;font-weight:700;color:var(--cp)">${8+pb(lvl)+chaM}</div></div>
    <div class="sb hi" style="flex:1;min-width:70px"><div class="sn">Atk sorts</div><div style="font-size:18px;font-weight:700;color:var(--cp)">${pb(lvl)+chaM>=0?'+':''}${pb(lvl)+chaM}</div></div>
  </div>`);

  // ── Inspiration bardique ──────────────────────────────────
  const biUsed = cc['InspBardique']!==undefined ? cc['InspBardique'] : bardInspiMax;
  panels.push(`<div style="margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:6px">
    <div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:6px">🎵 Inspiration bardique</div>
    <div style="font-size:11px;color:var(--text3);margin-bottom:4px">Utilisations (mod CHA = ${Math.max(1,chaM)}) • Récup. repos ${bardeLvl>=5?'court':'long'}</div>
    <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">${Array.from({length:bardInspiMax},(_,i)=>`<span class="slot-bubble${i<biUsed?'':' used'}" onclick="useCombatCharge('InspBardique',${bardInspiMax})" title="Dépenser une inspiration"></span>`).join('')}</div>
    <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
      <button class="btn bsm" onclick="recoverCombatCharge('InspBardique',${bardInspiMax})">↺ Récupérer</button>
      <button class="btn bsm bac" onclick="rollCustomDmg('1${bardDie}','Inspiration bardique')">🎲 Lancer ${bardDie}</button>
    </div>
    <div style="font-size:10px;color:var(--text3);margin-top:6px">Action bonus : donne un dé ${bardDie} à un allié à 18m. Il peut l'ajouter à un jet d'attaque, compétence ou sauvegarde (dans les 10 min).</div>
  </div>`);

  // ── Chant reposant (niv.2+) ───────────────────────────────
  if (bardeLvl>=2) {
    const chantDie = bardeLvl>=17?'d12':bardeLvl>=13?'d10':bardeLvl>=9?'d8':'d6';
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:6px">
      <div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:2px">🎶 Chant reposant (${chantDie})</div>
      <div style="font-size:11px;color:var(--text3)">Pendant un repos court, les alliés qui t'entendent récupèrent <strong>${chantDie}</strong> PV supplémentaires quand ils dépensent des dés de vie.</div>
    </div>`);
  }

  // ── Touche-à-tout (niv.2+) ───────────────────────────────
  if (bardeLvl>=2) {
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:6px">
      <div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:2px">🎭 Touche-à-tout</div>
      <div style="font-size:11px;color:var(--text3)">+${Math.floor(pb(lvl)/2)} (½ maîtrise) à tous les jets de caractéristique pour lesquels tu n'appliques pas déjà ta maîtrise complète.</div>
    </div>`);
  }

  // ── Contre-charme (niv.6+) ───────────────────────────────
  if (bardeLvl>=6) {
    const cmActive = !!cc['ContreCharmeActive'];
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:${cmActive?'rgba(33,150,243,.1)':'var(--surface2)'};border-radius:6px;border:1px solid ${cmActive?'rgba(33,150,243,.5)':'var(--border)'}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <span style="font-size:12px;font-weight:600;color:var(--cp)">🎤 Contre-charme</span>
        <button class="btn bsm" style="${cmActive?'color:#2196f3;border-color:#2196f3':''}" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['ContreCharmeActive']=!p.combatCharges['ContreCharmeActive'];saveAll();render();})()">
          ${cmActive?'⬛ Arrêter':'▶ Activer'}
        </button>
      </div>
      <div style="font-size:11px;color:var(--text3)">${cmActive?'🎤 Actif — toi et les alliés à 9m avez l\'avantage aux JS contre charme et peur.':'Action : commence une représentation jusqu\'à la fin de ton prochain tour. Toi + alliés à 9m : avantage aux JS contre charme et peur.'}</div>
    </div>`);
  }

  // ── Inspiration supérieure (niv.20) ──────────────────────
  if (bardeLvl>=20) {
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:rgba(200,168,75,.08);border-radius:6px;border:1px solid rgba(200,168,75,.4)">
      <div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:2px">⭐ Inspiration supérieure</div>
      <div style="font-size:11px;color:var(--text3)">Quand tu lances l'initiative sans inspiration bardique, tu en regagnes 1 automatiquement.</div>
    </div>`);
  }

  // ── COLLÈGE DU SAVOIR ─────────────────────────────────────
  if (isSavoir && bardeLvl>=3) {
    let savoirContent = `<div style="padding:7px 10px;background:var(--surface2);border-radius:6px;margin-bottom:6px">
      <div style="font-size:12px;font-weight:600;margin-bottom:2px">🗡 Mots cinglants <span style="font-size:10px;color:var(--cp);margin-left:4px">Réaction • 1 inspiration</span></div>
      <div style="font-size:11px;color:var(--text3)">Quand une créature visible fait un jet d'attaque, compétence ou dégâts : dépense 1 inspiration, la cible soustrait le résultat du dé. Décider après le jet, avant l'annonce du MJ. Immunisé si la cible est insensible aux charmes.</div>
    </div>`;
    if (bardeLvl>=6) {
      savoirContent += `<div style="padding:7px 10px;background:var(--surface2);border-radius:6px;margin-bottom:6px">
        <div style="font-size:12px;font-weight:600;margin-bottom:2px">📖 Secrets magiques supplémentaires <span style="font-size:10px;color:var(--text3)">niv.6</span></div>
        <div style="font-size:11px;color:var(--text3)">2 sorts de n'importe quelle classe (en plus des Secrets magiques niv.10/14/18). Ne comptent pas dans le quota de sorts connus.</div>
      </div>`;
    }
    if (bardeLvl>=14) {
      savoirContent += `<div style="padding:7px 10px;background:var(--surface2);border-radius:6px">
        <div style="font-size:12px;font-weight:600;margin-bottom:2px">🎯 Compétence hors-pair <span style="font-size:10px;color:var(--text3)">niv.14</span></div>
        <div style="font-size:11px;color:var(--text3)">Quand tu rates un jet de caractéristique, dépense 1 inspiration bardique et ajoute le résultat du dé. Peut transformer un échec en réussite.</div>
      </div>`;
    }
    panels.push(`<div style="margin-bottom:10px;padding:10px;background:rgba(156,39,176,.07);border:1px solid rgba(156,39,176,.2);border-radius:8px">
      <div style="font-size:12px;font-weight:700;color:#9c27b0;margin-bottom:8px">📚 Collège du savoir</div>
      ${savoirContent}
    </div>`);
  }

  // ── COLLÈGE DE LA VAILLANCE ───────────────────────────────
  if (isVaillance && bardeLvl>=3) {
    let vaillanceContent = `<div style="padding:7px 10px;background:var(--surface2);border-radius:6px;margin-bottom:6px">
      <div style="font-size:12px;font-weight:600;margin-bottom:2px">⚔ Inspiration martiale <span style="font-size:10px;color:var(--cp);margin-left:4px">1 inspiration</span></div>
      <div style="font-size:11px;color:var(--text3)">Un allié portant une inspiration bardique peut l'utiliser pour : ajouter le résultat à un jet de dégâts d'arme, OU (réaction) ajouter le résultat à sa CA contre une attaque (après avoir vu le jet).</div>
    </div>`;
    if (bardeLvl>=6) {
      vaillanceContent += `<div style="padding:7px 10px;background:var(--surface2);border-radius:6px;margin-bottom:6px">
        <div style="font-size:12px;font-weight:600;margin-bottom:2px">⚔ Attaque supplémentaire <span style="font-size:10px;color:var(--text3)">niv.6</span></div>
        <div style="font-size:11px;color:var(--text3)">Tu peux attaquer deux fois au lieu d'une lors de l'action Attaquer.</div>
      </div>`;
    }
    if (bardeLvl>=14) {
      vaillanceContent += `<div style="padding:7px 10px;background:var(--surface2);border-radius:6px">
        <div style="font-size:12px;font-weight:600;margin-bottom:2px">✨ Magie de combat <span style="font-size:10px;color:var(--text3)">niv.14</span></div>
        <div style="font-size:11px;color:var(--text3)">Quand tu utilises ton action pour lancer un sort de barde, tu peux faire une attaque avec une arme en action bonus.</div>
      </div>`;
    }
    panels.push(`<div style="margin-bottom:10px;padding:10px;background:rgba(33,150,243,.07);border:1px solid rgba(33,150,243,.2);border-radius:8px">
      <div style="font-size:12px;font-weight:700;color:#2196f3;margin-bottom:8px">🛡 Collège de la vaillance</div>
      ${vaillanceContent}
    </div>`);
  }

  return cs('cs-barde', `<div class="panel mb10">
    <div class="pt" style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span>🎵 Barde — Capacités</div>
    ${panels.join('')}
  </div>`);
}
