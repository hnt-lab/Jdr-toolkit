// BARBARE — Panneau de combat + actions
// ═══════════════════════════════════════

const BARBARE_SURSAUT = [
  'Cible à 9m — JS CON ou 1d12 nécrotiques. Toi : +1d12+niv PV temporaires.',
  'Téléportation 9m (espace visible). Répétable comme action bonus en rage.',
  'Esprit à 1,5m d\'une cible → explose : JS DEX ou 1d6 force dans 1,5m. Répétable comme action bonus.',
  'Lumière éblouissante : créatures à 1,5m → JS CON ou 1d6 radiant + aveuglées jusqu\'à ton prochain tour.',
  'Représailles passives : chaque créature qui te touche subit 1d6 force.',
  '+1 CA pour toi. Alliés à 3m : +1 CA également.',
  'Terrain difficile 4,5m autour de toi pour les ennemis jusqu\'à fin de la rage.',
  'Arme choisie → dégâts de force + légère + lancer (4,5m/9m). Revient en main automatiquement.'
];

function renderBarbare(p) {
  const barbareLvl = ((p.classes||[]).find(c=>c.name==='Barbare')||{}).level||0;
  if (!barbareLvl) return '';
  const lvl = totalLevel(p);
  const dexMod = mod(p.abilities[1]);
  const conMod = mod(p.abilities[2]);
  const chaMod = mod(p.abilities[5]);
  const rageBonus = barbareLvl>=16?4:barbareLvl>=9?3:2;
  const rageMax = barbareLvl>=17?6:barbareLvl>=12?5:barbareLvl>=6?4:barbareLvl>=3?3:2;
  const unlimited = barbareLvl>=20;
  const barbarePath = (p.features||[]).find(f=>['Voie du berserker','Voie du guerrier totem','Voie de la magie sauvage'].includes(f.name));
  const isBerserker = barbarePath?.name==='Voie du berserker';
  const isTotem = barbarePath?.name==='Voie du guerrier totem';
  const isMagieSauvage = barbarePath?.name==='Voie de la magie sauvage';
  const cc = p.combatCharges||{};
  const rageActive = cc['RageActive']===true;
  const totemChoice = cc['TotemSpirit']||'';
  const rem = cc['RageCharges']!==undefined ? cc['RageCharges'] : rageMax;

  const panels = [];

  // ── Rage : charges + toggle ───────────────────────────────
  const rageBubbles = unlimited
    ? `<div style="font-size:20px;font-weight:700;color:var(--cp)">∞</div><div style="font-size:10px;color:var(--text3);margin-top:2px">Rages illimitées</div>`
    : `<div style="display:flex;gap:4px;flex-wrap:wrap">${Array.from({length:rageMax},(_,i)=>`<span class="slot-bubble${i<rem?'':' used'}" onclick="useCombatCharge('RageCharges',${rageMax})" title="Utiliser une rage"></span>`).join('')}</div><div style="font-size:10px;color:var(--text3);margin-top:4px">${rem}/${rageMax} • Récup. repos long</div><button class="btn bsm" style="margin-top:4px" onclick="recoverCombatCharge('RageCharges',${rageMax})">↺ Récupérer</button>`;

  const baseResTags = ['Contondant','Perforant','Tranchant'].map(r=>`<span style="font-size:11px;padding:2px 8px;border-radius:10px;background:${rageActive?'rgba(229,57,53,.2)':'var(--surface3)'};color:${rageActive?'#e53935':'var(--text3)'};border:1px solid ${rageActive?'#e53935':'var(--border)'}">${r}</span>`).join('');
  const totemOursTags = (isTotem&&totemChoice==='Ours'&&rageActive)?['Feu','Froid','Foudre','Nécrotique','Acide','Tonnerre','Radiant','Poison'].map(r=>`<span style="font-size:11px;padding:2px 8px;border-radius:10px;background:rgba(76,175,80,.2);color:#4caf50;border:1px solid #4caf50">${r}</span>`).join(''):'';
  const berserkerImmuTag = (isBerserker&&barbareLvl>=6&&rageActive)?`<span style="font-size:11px;padding:2px 8px;border-radius:10px;background:rgba(76,175,80,.2);color:#4caf50;border:1px solid #4caf50">🛡 Imm. charme/peur</span>`:'';

  panels.push(`<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px">
    <div class="sb hi" style="flex:1;min-width:80px"><div class="sn">Bonus dégâts</div><div style="font-size:20px;font-weight:700;color:var(--cp)">+${rageBonus}</div></div>
    <div style="flex:2"><div style="font-size:11px;color:var(--text3);margin-bottom:4px">Charges de Rage</div>${rageBubbles}</div>
  </div>
  <div style="margin-bottom:10px;padding:8px;background:${rageActive?'rgba(229,57,53,.1)':'var(--surface2)'};border-radius:6px;border:1px solid ${rageActive?'#e53935':'var(--border)'}">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
      <span style="font-size:12px;font-weight:600;color:${rageActive?'#e53935':'var(--text3)'}">${rageActive?'🔥 En rage':'💤 Hors rage'}</span>
      <button class="btn bsm" style="${rageActive?'color:#e53935;border-color:#e53935;':''}" onclick="toggleRageActive()">${rageActive?'⬛ Sortir de la rage':'🔥 Entrer en rage'}</button>
    </div>
    <div style="font-size:11px;color:var(--text3);margin-bottom:4px">Résistances actives en rage :</div>
    <div style="display:flex;gap:4px;flex-wrap:wrap">${baseResTags}${totemOursTags}${berserkerImmuTag}</div>
  </div>`);

  // ── Défense sans armure ───────────────────────────────────
  panels.push(`<div style="margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:6px">
    <div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:2px">🛡 Défense sans armure</div>
    <div style="font-size:11px;color:var(--text3)">Sans armure : CA = 10 + DEX (${dexMod>=0?'+':''}${dexMod}) + CON (${conMod>=0?'+':''}${conMod}) = <strong style="color:var(--cp)">${10+dexMod+conMod}</strong></div>
  </div>`);

  // ── Attaque téméraire (niv.2+) ────────────────────────────
  if (barbareLvl>=2) {
    const temActive = cc['Témérité']===true;
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:${temActive?'rgba(255,152,0,.1)':'var(--surface2)'};border-radius:6px;border:1px solid ${temActive?'#ff9800':'var(--border)'}">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:12px;font-weight:600;color:${temActive?'#ff9800':'var(--cp)'}">😤 Attaque téméraire</span>
        <button class="btn bsm" style="${temActive?'color:#ff9800;border-color:#ff9800':''}" onclick="P().combatCharges=P().combatCharges||{};P().combatCharges['Témérité']=!${temActive};_markUnsaved();render()">${temActive?'✕ Désactiver':'⚔ Activer'}</button>
      </div>
      <div style="font-size:11px;color:var(--text3)">${temActive?'✅ Avantage sur tes attaques de mêlée (Force). ❌ Les attaquants ont l\'avantage contre toi jusqu\'à ton prochain tour.':'Avantage sur tes attaques de mêlée (Force) ce tour, au prix de donner l\'avantage aux attaquants jusqu\'à ton prochain tour.'}</div>
    </div>`);
  }

  // ── Épuisement ────────────────────────────────────────────
  const exh = p.exhaustion||0;
  const exhDesc = ['Aucun épuisement','Désavantage aux jets de caractéristique','Vitesse divisée par 2','Désavantage aux attaques et jets de sauvegarde','Vitesse réduite à 0','Désavantage à tous les jets de sauvegarde','☠ La créature meurt'];
  panels.push(`<div style="margin-bottom:10px;padding:8px;background:${exh>=3?'rgba(229,57,53,.08)':'var(--surface2)'};border-radius:6px;border:1px solid ${exh>=3?'rgba(229,57,53,.4)':'var(--border)'}">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
      <span style="font-size:12px;font-weight:600;color:${exh>=3?'#e53935':'var(--text2)'}">💀 Épuisement — ${exh}/6</span>
      <div style="display:flex;gap:4px">
        <button class="btn bsm" onclick="P().exhaustion=Math.min(6,(P().exhaustion||0)+1);_markUnsaved();render()">+1</button>
        <button class="btn bsm" onclick="P().exhaustion=Math.max(0,(P().exhaustion||0)-1);_markUnsaved();render()">-1</button>
      </div>
    </div>
    <div style="display:flex;gap:3px;margin-bottom:6px">${Array.from({length:6},(_,i)=>`<span style="width:18px;height:18px;border-radius:50%;border:2px solid ${i<exh?'#e53935':'var(--border)'};background:${i<exh?'rgba(229,57,53,.35)':'transparent'};display:inline-block"></span>`).join('')}</div>
    <div style="font-size:11px;color:${exh>=3?'#e53935':'var(--text3)'}">${exhDesc[exh]||''}</div>
  </div>`);

  // ── BERSERKER ─────────────────────────────────────────────
  if (isBerserker && barbareLvl>=3) {
    const frenActive = cc['FrénésieActive']===true;
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:${frenActive?'rgba(183,28,28,.1)':'var(--surface2)'};border-radius:6px;border:1px solid ${frenActive?'#b71c1c':'var(--border)'}">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:12px;font-weight:600;color:${frenActive?'#b71c1c':'var(--cp)'}">💢 Frénésie</span>
        <button class="btn bsm" style="${frenActive?'color:#b71c1c;border-color:#b71c1c':''}" onclick="P().combatCharges=P().combatCharges||{};P().combatCharges['FrénésieActive']=!${frenActive};_markUnsaved();render()">${frenActive?'✕ Désactiver':'⚔ Activer pour cette rage'}</button>
      </div>
      <div style="font-size:11px;color:var(--text3)">${frenActive?'⚔ Attaque bonus (mêlée) à chaque tour de rage. ⚠ +1 épuisement à la fin de la rage.':'Attaque bonus (mêlée) par tour de rage, au coût de 1 niveau d\'épuisement à la fin.'}</div>
    </div>`);
    if (barbareLvl>=10) {
      panels.push(`<div style="margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:6px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
          <span style="font-size:12px;font-weight:600;color:var(--cp)">😱 Présence intimidante</span>
          <span style="font-size:10px;color:var(--text3)">Action • portée 9m</span>
        </div>
        <div style="font-size:11px;color:var(--text3)">Cible une créature visible/audible. JS SAG DD <strong style="color:var(--cp)">${8+pb(lvl)+chaMod}</strong> ou Effrayée jusqu'à la fin de ton prochain tour.</div>
      </div>`);
    }
    if (barbareLvl>=14) {
      panels.push(`<div style="margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:6px">
        <div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:2px">⚡ Représailles</div>
        <div style="font-size:11px;color:var(--text3)">Réaction : quand tu subis des dégâts d'une attaque de mêlée, tu peux immédiatement faire 1 attaque de mêlée contre l'attaquant.</div>
      </div>`);
    }
  }

  // ── GUERRIER TOTEM ────────────────────────────────────────
  if (isTotem && barbareLvl>=3) {
    const totems = [
      {id:'Ours',icon:'🐻',desc:'Résistance à tous les dégâts sauf psychiques en rage.'},
      {id:'Aigle',icon:'🦅',desc:'Tes déplacements ne provoquent pas d\'attaques d\'opportunité en rage (hors armure lourde).'},
      {id:'Loup',icon:'🐺',desc:'En rage, tes alliés ont l\'avantage sur les attaques de mêlée contre les créatures à 1,5m de toi.'}
    ];
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:6px">
      <div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:8px">🌿 Esprit totem</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">${totems.map(t=>`<button class="btn bsm${totemChoice===t.id?' bac':''}" onclick="P().combatCharges=P().combatCharges||{};P().combatCharges['TotemSpirit']='${t.id}';_markUnsaved();render()">${t.icon} ${t.id}</button>`).join('')}</div>
      ${totemChoice?`<div style="font-size:11px;color:var(--text3)">${totems.find(t=>t.id===totemChoice)?.desc||''}</div>`:'<div style="font-size:11px;color:var(--text3);font-style:italic">Choisissez votre esprit totem ci-dessus.</div>'}
    </div>`);

    if (barbareLvl>=6) {
      const aspectDesc = ({
        Ours:'🐻 Force de portage doublée. Avantage sur les jets de Force pour pousser, tirer, soulever ou casser des objets.',
        Aigle:'🦅 Vision jusqu\'à 1,5km sans difficulté (détails comme à 30m). Nuages et brouillard n\'entravent pas ta vue.',
        Loup:'🐺 Tu peux pister des créatures même à allure rapide. Déplacement furtif à vitesse normale possible.'
      })[totemChoice]||'<em style="color:var(--text3)">Choisissez d\'abord votre esprit totem (niv.3).</em>';
      panels.push(`<div style="margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:6px">
        <div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:4px">🌿 Aspect de la bête</div>
        <div style="font-size:11px;color:var(--text3)">${aspectDesc}</div>
      </div>`);
    }

    if (barbareLvl>=10) {
      panels.push(`<div style="margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:6px">
        <div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:4px">🚶 Marcheur spirituel</div>
        <div style="font-size:11px;color:var(--text3)">Tu peux lancer <em>Communion avec la nature</em> comme un rituel. Au lieu d'une vraie bête, tu communies avec une version spirituelle de l'animal de ton totem.</div>
      </div>`);
    }

    if (barbareLvl>=14) {
      const lienDesc = ({
        Ours:'🐻 En rage, les créatures hostiles à 1,5m de toi ont un désavantage sur leurs attaques contre toute cible autre que toi.',
        Aigle:'🦅 En rage, tu as une vitesse de vol égale à ta vitesse de marche.',
        Loup:'🐺 En rage, quand tu touches une créature Grande ou plus petite, tu peux utiliser une action bonus pour la faire tomber à terre.'
      })[totemChoice]||'<em style="color:var(--text3)">Choisissez d\'abord votre esprit totem.</em>';
      panels.push(`<div style="margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:6px">
        <div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:4px">🔗 Lien totémique</div>
        <div style="font-size:11px;color:var(--text3)">${lienDesc}</div>
      </div>`);
    }
  }

  // ── MAGIE SAUVAGE ─────────────────────────────────────────
  if (isMagieSauvage && barbareLvl>=3) {
    const srsResult = cc['SursautResult'];
    const sensMagieMax = pb(lvl);
    const sensMagieCur = cc['SensMagie']!==undefined ? cc['SensMagie'] : sensMagieMax;
    let msContent = `<div style="margin-bottom:10px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:11px;font-weight:600;color:var(--text2)">🔍 Sens de la magie (${sensMagieCur}/${sensMagieMax})</span>
        <button class="btn bsm" onclick="recoverCombatCharge('SensMagie',${sensMagieMax})">↺ Récupérer</button>
      </div>
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px">${Array.from({length:sensMagieMax},(_,i)=>`<span class="slot-bubble${i<sensMagieCur?'':' used'}" onclick="useCombatCharge('SensMagie',${sensMagieMax})" title="Utiliser Sens de la magie"></span>`).join('')}</div>
      <div style="font-size:10px;color:var(--text3)">Action : détecter sorts/objets magiques à 18m jusqu'à la fin de ton prochain tour. Récup. repos long.</div>
    </div>
    <div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <span style="font-size:11px;font-weight:600;color:var(--text2)">⚡ Sursaut sauvage</span>
        <button class="btn bsm bac" onclick="(()=>{const r=Math.floor(Math.random()*8);P().combatCharges=P().combatCharges||{};P().combatCharges['SursautResult']=r;_markUnsaved();render();showToast('Sursaut — '+(r+1)+'/8')})()">🎲 Lancer</button>
      </div>
      ${srsResult!==undefined?`<div style="padding:6px 10px;background:rgba(156,39,176,.1);border:1px solid rgba(156,39,176,.3);border-radius:6px;font-size:11px;color:var(--text2);margin-bottom:6px"><strong style="color:#9c27b0">Résultat ${srsResult+1}/8 :</strong> ${BARBARE_SURSAUT[srsResult]||''}</div><button class="btn bsm" onclick="P().combatCharges=P().combatCharges||{};delete P().combatCharges['SursautResult'];_markUnsaved();render()">↺ Effacer</button>`:'<div style="font-size:11px;color:var(--text3);font-style:italic">Lancé automatiquement quand tu entres en rage.</div>'}
    </div>`;
    if (barbareLvl>=6) msContent += `<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border)"><div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:2px">⚡ Réserve de magie</div><div style="font-size:11px;color:var(--text3)">Si tu n'as plus de charges de rage au début de ton tour, tu en regagnes 1 automatiquement.</div></div>`;
    if (barbareLvl>=10) msContent += `<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border)"><div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:2px">🌀 Réaction instable</div><div style="font-size:11px;color:var(--text3)">Réaction : quand tu subis les effets d'un sort, tu peux déclencher un Sursaut sauvage.</div></div>`;
    if (barbareLvl>=14) msContent += `<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border)"><div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:2px">🎯 Sursaut contrôlé</div><div style="font-size:11px;color:var(--text3)">Lors d'un Sursaut sauvage, tu peux choisir entre deux résultats tirés du d8.</div></div>`;
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:6px">
      <div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:10px">✨ Magie sauvage</div>
      ${msContent}
    </div>`);
  }

  // ── Capacités de haut niveau ──────────────────────────────
  if (barbareLvl>=9) {
    const critDice = barbareLvl>=17?3:barbareLvl>=13?2:1;
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:6px">
      <div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:2px">💥 Critique brutal</div>
      <div style="font-size:11px;color:var(--text3)">+${critDice} dé${critDice>1?'s':''} de dégâts supplémentaire${critDice>1?'s':''} en rage sur un coup critique.</div>
    </div>`);
  }
  if (barbareLvl>=7) {
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:6px">
      <div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:2px">🦅 Instinct sauvage</div>
      <div style="font-size:11px;color:var(--text3)">Avantage sur les jets d'initiative. Si tu es surpris, tu peux quand même entrer en rage au premier tour — tu agis normalement.</div>
    </div>`);
  }
  if (barbareLvl>=11) {
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:6px">
      <div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:2px">💪 Rage implacable</div>
      <div style="font-size:11px;color:var(--text3)">Si tu tombes à 0 PV en rage sans mourir sur le coup : JS CON DD 10 (+5 à chaque usage consécutif, remis à zéro après un repos). Succès → tu reviens à 1 PV.</div>
    </div>`);
  }
  if (barbareLvl>=15) {
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:6px">
      <div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:2px">🔥 Rage persistante</div>
      <div style="font-size:11px;color:var(--text3)">Ta rage ne prend fin que si tu perds connaissance ou si tu choisis de l'arrêter. L'absence d'action hostile ne la stoppe plus.</div>
    </div>`);
  }
  if (barbareLvl>=18) {
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:6px">
      <div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:2px">🏋 Puissance indomptable</div>
      <div style="font-size:11px;color:var(--text3)">Si le résultat brut d'un jet de Force est inférieur à ta valeur de Force, tu peux utiliser la valeur à la place du résultat.</div>
    </div>`);
  }
  if (barbareLvl>=20) {
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:rgba(200,168,75,.08);border-radius:6px;border:1px solid rgba(200,168,75,.4)">
      <div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:2px">👑 Champion primitif</div>
      <div style="font-size:11px;color:var(--text3)">+4 Force et +4 Constitution (maximum 24 pour chacune). Rages illimitées.</div>
    </div>`);
  }

  return cs('cs-barbare', `<div class="panel mb10">
    <div class="pt" style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span>🔥 Rage — Barbare</div>
    ${panels.join('')}
  </div>`);
}

function toggleRageActive() {
  const p = P();
  if (!p.combatCharges) p.combatCharges = {};
  const barbareLvl = ((p.classes||[]).find(c=>c.name==='Barbare')||{}).level||0;
  const rageMax = barbareLvl>=17?6:barbareLvl>=12?5:barbareLvl>=6?4:barbareLvl>=3?3:2;
  const barbarePath = (p.features||[]).find(f=>['Voie du berserker','Voie du guerrier totem','Voie de la magie sauvage'].includes(f.name));
  const isBerserker = barbarePath?.name==='Voie du berserker';
  const isTotem = barbarePath?.name==='Voie du guerrier totem';
  const isMagieSauvage = barbarePath?.name==='Voie de la magie sauvage';
  const totemChoice = p.combatCharges['TotemSpirit']||'';
  const RAGE_RES = ['Contondant','Perforant','Tranchant'];
  const TOTEM_OURS_RES = ['Feu','Froid','Foudre','Nécrotique','Acide','Tonnerre','Radiant','Poison'];

  if (p.combatCharges['RageActive']===true) {
    p.combatCharges['RageActive'] = false;
    const allRageRes = [...RAGE_RES, ...(isTotem&&totemChoice==='Ours'?TOTEM_OURS_RES:[])];
    p.dmgResistances = (p.dmgResistances||[]).filter(r=>!allRageRes.includes(r));
    if (isBerserker && p.combatCharges['FrénésieActive']) {
      p.exhaustion = Math.min(6, (p.exhaustion||0)+1);
      p.combatCharges['FrénésieActive'] = false;
      showToast('💀 Frénésie — +1 niveau d\'épuisement');
    }
    if (isMagieSauvage) delete p.combatCharges['SursautResult'];
    delete p.combatCharges['Témérité'];
  } else {
    const unlimited = barbareLvl>=20;
    const cur = p.combatCharges['RageCharges']!==undefined ? p.combatCharges['RageCharges'] : rageMax;
    if (!unlimited && cur<=0) { showToast('❌ Plus de charges de rage disponibles !'); return; }
    if (!unlimited) p.combatCharges['RageCharges'] = cur-1;
    p.combatCharges['RageActive'] = true;
    p.dmgResistances = p.dmgResistances||[];
    RAGE_RES.forEach(r=>{ if(!p.dmgResistances.includes(r)) p.dmgResistances.push(r); });
    if (isTotem && totemChoice==='Ours') {
      TOTEM_OURS_RES.forEach(r=>{ if(!p.dmgResistances.includes(r)) p.dmgResistances.push(r); });
    }
    if (isBerserker && barbareLvl>=6) {
      p.conditions = (p.conditions||[]).filter(c=>!['Charmé','Effrayé'].includes(c));
    }
    if (isMagieSauvage) {
      const r = Math.floor(Math.random()*8);
      p.combatCharges['SursautResult'] = r;
      showToast(`✨ Sursaut sauvage — résultat ${r+1}/8`);
    }
  }
  saveAll(); render();
}
