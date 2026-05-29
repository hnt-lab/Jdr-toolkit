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
  if (!barbareLvl || p.wildshape?.active) return '';
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
  const rageTurns = cc['RageTurns']!==undefined ? cc['RageTurns'] : 10;
  const isPersistante = barbareLvl >= 15;

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
      <button class="btn bsm" style="${rageActive?'color:#e53935;border-color:#e53935;':''}" onclick="toggleRageActive()">${rageActive?'⬛ Sortir de la rage':'🔸🔥 Entrer en rage'}</button>
    </div>
    ${rageActive?`<div style="margin-bottom:8px">${isPersistante?`<div style="font-size:11px;color:#ff9800;margin-bottom:4px">♾ Rage persistante — durée illimitée.</div>`:`<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px"><div style="display:flex;gap:2px">${Array.from({length:10},(_,i)=>`<span style="width:14px;height:14px;border-radius:2px;border:1px solid ${i<rageTurns?'#e53935':'var(--border)'};background:${i<rageTurns?'rgba(229,57,53,.35)':'transparent'};display:inline-block"></span>`).join('')}</div><span style="font-size:11px;color:${rageTurns<=3?'#e53935':'var(--text3)'}">⏱ ${rageTurns}/10 tours</span></div><button class="btn bsm" style="color:#e53935;border-color:#e53935;margin-bottom:4px" onclick="endRageTurn()">⏩ Fin de tour</button>`}</div>`:''}
    <div style="font-size:11px;color:var(--text3);margin-bottom:4px">Résistances actives en rage :</div>
    <div style="display:flex;gap:4px;flex-wrap:wrap">${baseResTags}${totemOursTags}${berserkerImmuTag}</div>
  </div>`);

  // ── Défense sans armure ───────────────────────────────────
  panels.push(`<div style="margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:6px">
    <div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:2px">🛡 Défense sans armure</div>
    <div style="font-size:11px;color:var(--text3)">Sans armure : CA = 10 + DEX (${dexMod>=0?'+':''}${dexMod}) + CON (${conMod>=0?'+':''}${conMod}) = <strong style="color:var(--cp)">${10+dexMod+conMod}</strong></div>
  </div>`);

  // ── Jets avec avantage (en rage) ─────────────────────────
  if (rageActive) {
    const forMod = mod(p.abilities[0]);
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:rgba(229,57,53,.07);border-radius:6px;border:1px solid rgba(229,57,53,.5);animation:combatPulse 3s ease-in-out infinite">
      <div style="font-size:12px;font-weight:600;color:#e53935;margin-bottom:6px">🔥 Avantage en rage — Force</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px">
        <button class="btn bsm" style="background:rgba(229,57,53,.15);color:#e53935;border-color:#e53935;font-weight:600" onclick="rollSave('JS FOR',${forMod},1)">🔥⚡ JS FOR (avantage)</button>
        <button class="btn bsm" style="background:rgba(229,57,53,.15);color:#e53935;border-color:#e53935;font-weight:600" onclick="rollSave('Jet FOR',${forMod},1)">🔥⚡ Jet FOR (avantage)</button>
      </div>
      <div style="font-size:10px;color:var(--text3);line-height:1.5">Avantage sur tous les jets de Force en rage : sauvegardes <em>et</em> jets de compétence (Athlétisme, etc.).<br>Pour les compétences physiques hors app, applique l'avantage dans l'outil Dés ou lance deux fois et garde le meilleur.</div>
    </div>`);
  }

  // ── Sens du danger (niv.2+) ───────────────────────────────
  if (barbareLvl>=2) {
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:6px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:12px;font-weight:600;color:var(--cp)">👁 Sens du danger</span>
        <button class="btn bsm" onclick="rollSave('JS DEX',${dexMod},1)">⚡ JS DEX (avantage)</button>
      </div>
      <div style="font-size:11px;color:var(--text3)">Avantage aux JS DEX contre les effets visibles (pièges, sorts, effets de zone). Pas d'application si aveuglé, sourd, ou incapable d'agir.</div>
    </div>`);
  }

  // ── Déplacement rapide (niv.5+) ──────────────────────────
  if (barbareLvl>=5) {
    const chestName = ((p.equip||{}).chest||{}).name||'';
    const chestSrd = chestName ? SRD.armors.find(a=>a.name===chestName) : null;
    const isHeavy = !!(chestSrd && chestSrd.type !== 'Bouclier' && chestSrd.type !== 'Légère' && chestSrd.type !== 'Intermédiaire');
    const baseSpeed = p.speed||9;
    const fastSpeed = isHeavy ? baseSpeed : baseSpeed + 3;
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:6px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px">
        <span style="font-size:12px;font-weight:600;color:var(--cp)">💨 Déplacement rapide</span>
        <span style="font-size:16px;font-weight:700;color:${isHeavy?'var(--text3)':'var(--cp)'}">${fastSpeed}m${isHeavy?'':' <span style="font-size:10px;color:var(--text3)">+3m</span>'}</span>
      </div>
      <div style="font-size:11px;color:var(--text3)">${isHeavy?'⚠ Armure lourde — +3m inactif.':'Vitesse '+baseSpeed+'m + 3m (sans armure lourde).'}</div>
    </div>`);
  }

  // ── Attaque supplémentaire (niv.5+) ──────────────────────
  if (barbareLvl>=5) {
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:6px">
      <div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:2px">⚔ Attaque supplémentaire</div>
      <div style="font-size:11px;color:var(--text3)">Tu peux attaquer deux fois (au lieu d'une) quand tu prends l'action Attaquer.</div>
    </div>`);
  }

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

  // ── Épuisement — affiché seulement pour Berserker (Frénésie en cause) ───
  if (isBerserker && barbareLvl>=3) {
    const exh = p.exhaustion||0;
    const exhDesc = ['Aucun épuisement','Désavantage aux jets de caractéristique','Vitesse divisée par 2','Désavantage aux jets d\'attaque et de sauvegarde','PV maximum réduits de moitié','Vitesse réduite à 0','☠ La créature meurt'];
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:${exh>=3?'rgba(229,57,53,.08)':'var(--surface2)'};border-radius:6px;border:1px solid ${exh>=3?'rgba(229,57,53,.4)':'var(--border)'}">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <span style="font-size:12px;font-weight:600;color:${exh>=3?'#e53935':'var(--text2)'}">💀 Épuisement (Frénésie) — ${exh}/6</span>
        <div style="display:flex;gap:4px">
          <button class="btn bsm" onclick="P().exhaustion=Math.min(6,(P().exhaustion||0)+1);_markUnsaved();render()">+1</button>
          <button class="btn bsm" onclick="P().exhaustion=Math.max(0,(P().exhaustion||0)-1);_markUnsaved();render()">-1</button>
        </div>
      </div>
      <div style="display:flex;gap:3px;margin-bottom:6px">${Array.from({length:6},(_,i)=>`<span style="width:18px;height:18px;border-radius:50%;border:2px solid ${i<exh?'#e53935':'var(--border)'};background:${i<exh?'rgba(229,57,53,.35)':'transparent'};display:inline-block"></span>`).join('')}</div>
      <div style="font-size:11px;color:${exh>=3?'#e53935':'var(--text3)'}">Pallier actuel : ${exhDesc[exh]||''}</div>
    </div>`);
  }

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
      const chestNL=((p.equip||{}).chest||{}).name||'';
      const chestSrdL=chestNL?SRD.armors.find(a=>a.name===chestNL):null;
      const isHeavyL=!!(chestSrdL&&chestSrdL.type!=='Bouclier'&&chestSrdL.type!=='Légère'&&chestSrdL.type!=='Intermédiaire');
      const lienFlySpeed=(p.speed||9)+(barbareLvl>=5&&!isHeavyL?3:0);
      const lienDesc = ({
        Ours:'🐻 En rage, les créatures hostiles à 1,5m de toi ont un désavantage sur leurs attaques contre toute cible autre que toi.',
        Aigle:rageActive?`🦅 Vitesse de vol active : <strong style="color:var(--cp)">${lienFlySpeed}m</strong> (= vitesse de marche).`:'🦅 En rage, tu as une vitesse de vol égale à ta vitesse de marche.',
        Loup:`🐺 En rage, quand tu touches une créature Grande ou plus petite, tu peux utiliser une action bonus pour la faire tomber à terre.${rageActive?' <button class="btn bsm" style="margin-left:6px" onclick="showToast(\'⚡ Action bonus : cible tombée à terre.\')">⚡ Renverser</button>':''}`
      })[totemChoice]||'<em style="color:var(--text3)">Choisissez d\'abord votre esprit totem.</em>';
      panels.push(`<div style="margin-bottom:10px;padding:8px;background:${rageActive&&totemChoice?'rgba(33,150,243,.07)':'var(--surface2)'};border-radius:6px;border:1px solid ${rageActive&&totemChoice?'rgba(33,150,243,.3)':'var(--border)'}">
        <div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:4px">🔗 Lien totémique</div>
        <div style="font-size:11px;color:var(--text3)">${lienDesc}</div>
      </div>`);
    }
  }

  // ── MAGIE SAUVAGE ─────────────────────────────────────────
  if (isMagieSauvage && barbareLvl>=3) {
    const srsResult = cc['SursautResult'];
    const srsResult2 = cc['SursautResult2'];
    const sensMagieMax = pb(lvl);
    const sensMagieCur = cc['SensMagie']!==undefined ? cc['SensMagie'] : sensMagieMax;
    const sursautDC_con = 8+pb(lvl)+conMod;
    const sursautDC_dex = 8+pb(lvl)+mod(p.abilities[1]);

    const _sursBtn = idx => {
      if (idx===0) return `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px"><button class="btn bsm bac" onclick="rollCustomDmg('1d12','Nécrotique cible (DD CON ${sursautDC_con})')">🎲 1d12 nécro</button><button class="btn bsm" onclick="rollCustomDmg('1d12+${lvl}','PV temporaires (toi)')">💚 1d12+${lvl} PV temp</button></div>`;
      if (idx===2) return `<div style="margin-top:4px"><button class="btn bsm bac" onclick="rollCustomDmg('1d6','Force explosion (DD DEX ${sursautDC_dex})')">🎲 1d6 force</button></div>`;
      if (idx===3) return `<div style="margin-top:4px"><button class="btn bsm bac" onclick="rollCustomDmg('1d6','Lumière radiant (DD CON ${sursautDC_con})')">🎲 1d6 radiant</button></div>`;
      if (idx===4) return `<div style="margin-top:4px"><button class="btn bsm bac" onclick="rollCustomDmg('1d6','Représailles passives force (réaction)')">🎲 1d6 force</button></div>`;
      return '';
    };

    const sursLancerOnClick = barbareLvl>=14
      ? `(()=>{const r1=Math.floor(Math.random()*8);const r2=Math.floor(Math.random()*8);const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['SursautResult2']=[r1,r2];delete p.combatCharges['SursautResult'];_markUnsaved();render();showToast('Sursaut contrôlé — '+(r1+1)+'/8 ou '+(r2+1)+'/8')})()`
      : `(()=>{const r=Math.floor(Math.random()*8);const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['SursautResult']=r;delete p.combatCharges['SursautResult2'];_markUnsaved();render();showToast('Sursaut — '+(r+1)+'/8')})()`;

    let srsHtml;
    if (srsResult2 && Array.isArray(srsResult2) && srsResult2.length===2) {
      srsHtml = `<div style="font-size:11px;color:#9c27b0;font-weight:600;margin-bottom:6px">🎯 Choisissez un résultat :</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">
        <div style="padding:6px;background:rgba(156,39,176,.1);border:1px solid rgba(156,39,176,.3);border-radius:6px;cursor:pointer" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['SursautResult']=${srsResult2[0]};delete p.combatCharges['SursautResult2'];_markUnsaved();render();})()">
          <div style="font-size:11px;font-weight:600;color:#9c27b0">${srsResult2[0]+1}/8</div>
          <div style="font-size:10px;color:var(--text3);line-height:1.3">${BARBARE_SURSAUT[srsResult2[0]]||''}</div>
          <div style="font-size:10px;color:#9c27b0;margin-top:3px">✓ Choisir</div>
        </div>
        <div style="padding:6px;background:rgba(156,39,176,.1);border:1px solid rgba(156,39,176,.3);border-radius:6px;cursor:pointer" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['SursautResult']=${srsResult2[1]};delete p.combatCharges['SursautResult2'];_markUnsaved();render();})()">
          <div style="font-size:11px;font-weight:600;color:#9c27b0">${srsResult2[1]+1}/8</div>
          <div style="font-size:10px;color:var(--text3);line-height:1.3">${BARBARE_SURSAUT[srsResult2[1]]||''}</div>
          <div style="font-size:10px;color:#9c27b0;margin-top:3px">✓ Choisir</div>
        </div>
      </div>`;
    } else if (srsResult!==undefined) {
      srsHtml = `<div style="padding:6px 10px;background:rgba(156,39,176,.1);border:1px solid rgba(156,39,176,.3);border-radius:6px;font-size:11px;color:var(--text2);margin-bottom:6px"><strong style="color:#9c27b0">Résultat ${srsResult+1}/8 :</strong> ${BARBARE_SURSAUT[srsResult]||''}</div>${_sursBtn(srsResult)}<div style="margin-top:6px"><button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};delete p.combatCharges['SursautResult'];_markUnsaved();render();})()">↺ Effacer</button></div>`;
    } else {
      srsHtml = `<div style="font-size:11px;color:var(--text3);font-style:italic">Lancé automatiquement quand tu entres en rage.</div>`;
    }

    let msContent = `<div style="margin-bottom:10px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:11px;font-weight:600;color:var(--text2)">🔍 Sens de la magie (${sensMagieCur}/${sensMagieMax})</span>
        <button class="btn bsm" onclick="recoverCombatCharge('SensMagie',${sensMagieMax})">↺ Récupérer</button>
      </div>
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px">${Array.from({length:sensMagieMax},(_,i)=>`<span class="slot-bubble${i<sensMagieCur?'':' used'}" onclick="useCombatCharge('SensMagie',${sensMagieMax})" title="Utiliser Sens de la magie"></span>`).join('')}</div>
      <div style="font-size:10px;color:var(--text3)">Action : détecter sorts/objets magiques à 18m jusqu'à la fin de ton prochain tour. Récup. repos long.</div>
    </div>
    <div style="margin-bottom:8px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <span style="font-size:11px;font-weight:600;color:var(--text2)">⚡ Sursaut sauvage</span>
        <div style="display:flex;gap:4px">${barbareLvl>=10?`<button class="btn bsm" onclick="(()=>{const r=Math.floor(Math.random()*8);const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['SursautResult']=r;delete p.combatCharges['SursautResult2'];_markUnsaved();render();showToast('Sursaut réaction — '+(r+1)+'/8')})()">⚡ Réaction</button>`:''}<button class="btn bsm bac" onclick="${sursLancerOnClick}">🎲 Lancer${barbareLvl>=14?' (×2)':''}</button></div>
      </div>
      ${srsHtml}
    </div>`;

    if (barbareLvl>=6) msContent += `<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border)"><div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:2px">⚡ Réserve de magie</div><div style="font-size:11px;color:var(--text3)">Si tu n'as plus de charges de rage au début de ton tour (clique <em>Fin de tour</em> dans le panneau rage), tu en regagnes 1 automatiquement.</div></div>`;
    if (barbareLvl>=10) msContent += `<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border)"><div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:2px">🌀 Réaction instable</div><div style="font-size:11px;color:var(--text3)">Réaction : quand tu subis les effets d'un sort, tu peux déclencher un Sursaut sauvage. Utilise le bouton ⚡ Réaction ci-dessus.</div></div>`;
    if (barbareLvl>=14) msContent += `<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border)"><div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:2px">🎯 Sursaut contrôlé</div><div style="font-size:11px;color:var(--text3)">Lors d'un Sursaut sauvage, deux résultats sont tirés (🎲 ×2). Choisissez le résultat à appliquer en cliquant dessus.</div></div>`;

    panels.push(`<div style="margin-bottom:10px;padding:10px;background:rgba(156,39,176,.07);border:1px solid rgba(156,39,176,.2);border-radius:8px">
      <div style="font-size:12px;font-weight:700;color:#9c27b0;margin-bottom:10px">✨ Magie sauvage</div>
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
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:12px;font-weight:600;color:var(--cp)">🦅 Instinct sauvage</span>
        <button class="btn bsm" onclick="diceRoll('d20','🦅 Initiative',${dexMod},'initiative')">🎲 Initiative (avantage)</button>
      </div>
      <div style="font-size:11px;color:var(--text3)">Avantage sur les jets d'initiative. Si surpris, tu peux entrer en rage au premier tour.</div>
    </div>`);
  }
  if (barbareLvl>=11) {
    const implacableUses = cc['RageImplacableUses']||0;
    const implacableDC = 10 + implacableUses * 5;
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:${rageActive?'rgba(229,57,53,.07)':'var(--surface2)'};border-radius:6px;border:1px solid ${rageActive?'rgba(229,57,53,.3)':'var(--border)'}">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:12px;font-weight:600;color:var(--cp)">💪 Rage implacable</span>
        <span style="font-size:10px;color:var(--text3)">DD ${implacableDC}${implacableUses>0?' ('+implacableUses+' usage'+(implacableUses>1?'s':'')+')':''}</span>
      </div>
      ${rageActive?`<button class="btn bsm" style="color:#e53935;border-color:#e53935;margin-bottom:6px;width:100%" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['RageImplacableUses']=(p.combatCharges['RageImplacableUses']||0)+1;saveAll();rollSave('JS CON',${conMod});render();})()">🎲 JS CON DD ${implacableDC} (à 0 PV en rage)</button>`:''}
      <div style="display:flex;gap:6px;align-items:center">
        <button class="btn bsm" onclick="P().combatCharges=P().combatCharges||{};P().combatCharges['RageImplacableUses']=0;_markUnsaved();render()">↺ Repos (remettre à zéro)</button>
      </div>
      <div style="font-size:11px;color:var(--text3);margin-top:4px">À 0 PV en rage : JS CON DD ${implacableDC}. Succès → 1 PV. DD +5 par usage consécutif (remis à 0 au repos).</div>
    </div>`);
  }
  if (barbareLvl>=15) {
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:6px">
      <div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:2px">🔥 Rage persistante</div>
      <div style="font-size:11px;color:var(--text3)">Ta rage ne prend fin que si tu perds connaissance ou si tu choisis de l'arrêter. L'absence d'action hostile ne la stoppe plus.</div>
    </div>`);
  }
  if (barbareLvl>=18) {
    const forScore = p.abilities[0]||10;
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:rgba(255,152,0,.07);border-radius:6px;border:1px solid rgba(255,152,0,.3)">
      <div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:4px">💪 Puissance indomptable <span style="font-size:10px;color:#ff9800">Actif</span></div>
      <div style="font-size:11px;color:var(--text3);margin-bottom:4px">Si le résultat brut d'un jet de Force est inférieur à ta valeur de Force (${forScore}), la valeur est utilisée à la place. S'applique automatiquement à tous tes jets FOR via le panneau Dés <span style="font-size:12px">💪</span>.</div>
      <div style="font-size:10px;color:#ff9800">Valeur minimum appliquée : <strong>${forScore}</strong></div>
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
    if (isMagieSauvage) { delete p.combatCharges['SursautResult']; delete p.combatCharges['SursautResult2']; }
    delete p.combatCharges['Témérité'];
  } else {
    const unlimited = barbareLvl>=20;
    const cur = p.combatCharges['RageCharges']!==undefined ? p.combatCharges['RageCharges'] : rageMax;
    if (!unlimited && cur<=0) { showToast('❌ Plus de charges de rage disponibles !'); return; }
    if (!unlimited) p.combatCharges['RageCharges'] = cur-1;
    p.combatCharges['RageActive'] = true;
    p.combatCharges['RageTurns'] = 10;
    p.dmgResistances = p.dmgResistances||[];
    RAGE_RES.forEach(r=>{ if(!p.dmgResistances.includes(r)) p.dmgResistances.push(r); });
    if (isTotem && totemChoice==='Ours') {
      TOTEM_OURS_RES.forEach(r=>{ if(!p.dmgResistances.includes(r)) p.dmgResistances.push(r); });
    }
    if (isBerserker && barbareLvl>=6) {
      p.conditions = (p.conditions||[]).filter(c=>!['Charmé','Effrayé'].includes(c));
    }
    if (isMagieSauvage) {
      if (barbareLvl>=14) {
        const r1 = Math.floor(Math.random()*8);
        const r2 = Math.floor(Math.random()*8);
        p.combatCharges['SursautResult2'] = [r1, r2];
        delete p.combatCharges['SursautResult'];
        showToast(`✨ Sursaut contrôlé — ${r1+1}/8 ou ${r2+1}/8`);
      } else {
        const r = Math.floor(Math.random()*8);
        p.combatCharges['SursautResult'] = r;
        delete p.combatCharges['SursautResult2'];
        showToast(`✨ Sursaut sauvage — résultat ${r+1}/8`);
      }
    }
  }
  saveAll(); render();
}

function endRageTurn() {
  const p = P();
  if (!p.combatCharges) p.combatCharges = {};
  if (!p.combatCharges['RageActive']) return;
  const barbareLvl = ((p.classes||[]).find(c=>c.name==='Barbare')||{}).level||0;
  if (barbareLvl >= 15) { showToast('♾ Rage persistante — durée illimitée.'); return; }

  // Réserve de magie (niv.6) : si 0 charges au début de ce tour, regagne 1
  const _msPath = (p.features||[]).find(f=>f.name==='Voie de la magie sauvage');
  if (_msPath && barbareLvl>=6) {
    const _rMax = barbareLvl>=17?6:barbareLvl>=12?5:barbareLvl>=6?4:barbareLvl>=3?3:2;
    const _cur = p.combatCharges['RageCharges']!==undefined ? p.combatCharges['RageCharges'] : _rMax;
    if (_cur <= 0) {
      p.combatCharges['RageCharges'] = 1;
      showToast('⚡ Réserve de magie — 1 charge de rage regagnée !');
    }
  }

  const turns = Math.max(0, (p.combatCharges['RageTurns']||0) - 1);
  if (turns <= 0) {
    showToast('🔥 Rage terminée — 10 tours écoulés.');
    toggleRageActive();
  } else {
    p.combatCharges['RageTurns'] = turns;
    saveAll(); render();
    showToast('⏱ Fin de tour — ' + turns + ' tour' + (turns>1?'s':'') + ' de rage restant' + (turns>1?'s':'') + '.');
  }
}
