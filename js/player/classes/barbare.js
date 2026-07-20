// BARBARE — Panneau de combat + actions
// ═══════════════════════════════════════

const BARBARE_SURSAUT = [
  'Cible à 9m — JS CON ou 1d12 nécrotiques. Toi : +1d12+niv PV temporaires.',
  'Téléportation 9m (espace visible). Répétable comme action bonus en rage.',
  'Esprit à 1,5m d\'une cible → explose : JS DEX ou 1d6 force dans 1,5m. Répétable comme action bonus.',
  'Éclair de lumière : une créature au choix à 9m → JS CON ou 1d6 radiant + aveuglée jusqu\'au début de ton prochain tour. Répétable comme action bonus.',
  'Représailles passives : chaque créature qui te touche subit 1d6 force.',
  '+1 CA pour toi. Alliés à 3m : +1 CA également.',
  'Terrain difficile 4,5m autour de toi pour les ennemis jusqu\'à fin de la rage.',
  'Arme choisie → dégâts de force + légère + lancer (6m/18m). Revient en main automatiquement.'
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
  const critDice = barbareLvl>=17?3:barbareLvl>=13?2:1;
  const implacableUses = cc['RageImplacableUses']||0;
  const implacableDC = 10 + implacableUses * 5;

  // ── Rage : charges + toggle ───────────────────────────────
  const rageBubbles = unlimited
    ? `<div style="font-size:15px;font-weight:700;color:var(--cp)">∞</div><div style="font-size:12px;color:var(--text3);margin-top:2px">Rages illimitées</div>`
    : `<div style="display:flex;gap:4px;flex-wrap:wrap">${Array.from({length:rageMax},(_,i)=>`<span class="slot-bubble${i<rem?'':' used'}" onclick="useCombatCharge('RageCharges',${rageMax})" title="Utiliser une rage"></span>`).join('')}</div><div style="font-size:12px;color:var(--text3);margin-top:4px">${rem}/${rageMax} • Récup. repos long</div><button class="btn bsm" style="margin-top:4px" onclick="recoverCombatCharge('RageCharges',${rageMax})">↺ Récupérer</button>`;

  const baseResTags = ['Contondant','Perforant','Tranchant'].map(r=>`<span style="font-size:13px;padding:2px 8px;border-radius:2px;background:${rageActive?'rgba(229,57,53,.2)':'var(--surface3)'};color:${rageActive?'var(--danger)':'var(--text3)'};border:1px solid ${rageActive?'var(--danger)':'var(--border)'}">${r}</span>`).join('');
  const totemOursTags = (isTotem&&totemChoice==='Ours'&&rageActive)?['Feu','Froid','Foudre','Nécrotique','Acide','Tonnerre','Radiant','Poison','Force'].map(r=>`<span style="font-size:13px;padding:2px 8px;border-radius:2px;background:rgba(76,175,80,.2);color:var(--good);border:1px solid var(--good)">${r}</span>`).join(''):'';
  const berserkerImmuTag = (isBerserker&&barbareLvl>=6&&rageActive)?`<span style="font-size:13px;padding:2px 8px;border-radius:2px;background:rgba(76,175,80,.2);color:var(--good);border:1px solid var(--good)">🛡 Imm. charme/peur</span>`:'';

  panels.push(`<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px">
    <div class="sb hi" style="flex:1;min-width:80px"><div class="sn">Bonus dégâts</div><div style="font-size:15px;font-weight:700;color:var(--cp)">+${rageBonus}</div></div>
    <div style="flex:2"><div style="font-size:13px;color:var(--text3);margin-bottom:4px">Charges de Rage</div>${rageBubbles}</div>
  </div>
  <div style="margin-bottom:10px;padding:8px;background:${rageActive?'rgba(229,57,53,.1)':'var(--surface2)'};border-radius:2px;border:1px solid ${rageActive?'var(--danger)':'var(--border)'}">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
      <span style="font-size:13px;font-weight:600;color:${rageActive?'var(--danger)':'var(--text3)'}">${rageActive?'🔥 En rage':'💤 Hors rage'}</span>
      <button class="btn bsm" style="${rageActive?'color:var(--danger);border-color:var(--danger);':''}" onclick="toggleRageActive()">${rageActive?'⬛ Sortir de la rage':'🔸🔥 Entrer en rage'}</button>
    </div>
    ${rageActive?`<div style="margin-bottom:8px">${isPersistante?`<div style="font-size:13px;color:var(--warn);margin-bottom:4px">♾ Rage persistante — durée illimitée.</div>`:`<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px"><div style="display:flex;gap:2px">${Array.from({length:10},(_,i)=>`<span style="width:14px;height:14px;border-radius:2px;border:1px solid ${i<rageTurns?'var(--danger)':'var(--border)'};background:${i<rageTurns?'rgba(229,57,53,.35)':'transparent'};display:inline-block"></span>`).join('')}</div><span style="font-size:13px;color:${rageTurns<=3?'var(--danger)':'var(--text3)'}">⏱ ${rageTurns}/10 tours</span></div><button class="btn bsm" style="color:var(--danger);border-color:var(--danger);margin-bottom:4px" onclick="endRageTurn()">⏩ Fin de tour</button>`}</div>`:''}
    <div style="font-size:13px;color:var(--text3);margin-bottom:4px">Résistances actives en rage :</div>
    <div style="display:flex;gap:4px;flex-wrap:wrap">${baseResTags}${totemOursTags}${berserkerImmuTag}</div>
  </div>`);

  // Défense sans armure → Capacités & traits uniquement (Fix 6)

  // ── Jets avec avantage (en rage) ─────────────────────────
  if (rageActive) {
    const forMod = mod(p.abilities[0]);
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:rgba(229,57,53,.07);border-radius:2px;border:1px solid rgba(229,57,53,.5);animation:combatPulse 3s ease-in-out infinite">
      <div style="font-size:13px;font-weight:600;color:var(--danger);margin-bottom:6px">🔥 Avantage en rage — Force</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px">
        <button class="btn bsm" style="background:rgba(229,57,53,.15);color:var(--danger);border-color:var(--danger);font-weight:600" onclick="rollSave('JS FOR',${forMod},1)">🔥⚡ JS FOR (avantage)</button>
        <button class="btn bsm" style="background:rgba(229,57,53,.15);color:var(--danger);border-color:var(--danger);font-weight:600" onclick="rollSave('Jet FOR',${forMod},1)">🔥⚡ Jet FOR (avantage)</button>
      </div>
      <div style="font-size:12px;color:var(--text3);line-height:1.5">Avantage sur tous les jets de Force en rage : sauvegardes <em>et</em> jets de compétence (Athlétisme, etc.).<br>Pour les compétences physiques hors app, applique l'avantage dans l'outil Dés ou lance deux fois et garde le meilleur.</div>
    </div>`);
  }

  // ── Sens du danger (niv.2+) ───────────────────────────────
  if (barbareLvl>=2) {
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:2px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:13px;font-weight:600;color:var(--cp)">👁 Sens du danger</span>
        <button class="btn bsm" onclick="rollSave('JS DEX',${dexMod},1)">⚡ JS DEX (avantage)</button>
      </div>
      <div style="font-size:13px;color:var(--text3)">Avantage aux JS DEX contre les effets visibles (pièges, sorts, effets de zone). Pas d'application si aveuglé, sourd, ou incapable d'agir.</div>
    </div>`);
  }

  // Déplacement rapide et Attaque supplémentaire → supprimés du panel (Fix 6)

  // ── Attaque téméraire (niv.2+) — Fix 15 : statut auto ────
  if (barbareLvl>=2) {
    const temActive = cc['Témérité']===true;
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:${temActive?'rgba(255,152,0,.1)':'var(--surface2)'};border-radius:2px;border:1px solid ${temActive?'var(--warn)':'var(--border)'}">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:13px;font-weight:600;color:${temActive?'var(--warn)':'var(--cp)'}">😤 Attaque téméraire</span>
        <button class="btn bsm" style="${temActive?'color:var(--warn);border-color:var(--warn)':''}" onclick="toggleTémérité()">${temActive?'✕ Désactiver':'⚔ Activer'}</button>
      </div>
      <div style="font-size:13px;color:var(--text3)">${temActive?'✅ Avantage sur tes attaques de mêlée (Force). ❌ Les attaquants ont l\'avantage contre toi jusqu\'à ton prochain tour.':'Avantage sur tes attaques de mêlée (Force) ce tour, au prix de donner l\'avantage aux attaquants jusqu\'à ton prochain tour.'}</div>
    </div>`);
  }

  // ── BERSERKER — Fix 17 : Frénésie & Épuisement fusionnés ─
  if (isBerserker && barbareLvl>=3) {
    const frenActive = cc['FrénésieActive']===true;
    const exh = p.exhaustion||0;
    const exhDesc = ['Aucun épuisement','Désavantage aux jets de compétence','Vitesse divisée par 2','Désavantage aux jets d\'attaque et de sauvegarde','PV maximum réduits de moitié','Vitesse réduite à 0','☠ La créature meurt'];
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:${frenActive?'rgba(183,28,28,.1)':exh>=3?'rgba(229,57,53,.06)':'var(--surface2)'};border-radius:2px;border:1px solid ${frenActive?'var(--danger)':exh>=3?'rgba(229,57,53,.4)':'var(--border)'}">
      <div style="font-size:13px;font-weight:700;color:${frenActive?'var(--danger)':'var(--cp)'};margin-bottom:8px">💢 Frénésie & Épuisement</div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:13px;font-weight:600;color:${frenActive?'var(--danger)':'var(--text2)'}">Frénésie</span>
        <button class="btn bsm" style="${frenActive?'color:var(--danger);border-color:var(--danger)':''}" onclick="P().combatCharges=P().combatCharges||{};P().combatCharges['FrénésieActive']=!${frenActive};_markUnsaved();render()">${frenActive?'✕ Désactiver':'⚔ Activer pour cette rage'}</button>
      </div>
      <div style="font-size:13px;color:var(--text3);margin-bottom:10px">${frenActive?'⚔ Attaque bonus (mêlée) à chaque tour de rage. ⚠ +1 épuisement à la fin de la rage.':'Attaque bonus (mêlée) par tour de rage, au coût de 1 niveau d\'épuisement à la fin.'}</div>
      <div style="border-top:1px solid ${exh>=3?'rgba(229,57,53,.25)':'var(--border)'};padding-top:8px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <span style="font-size:13px;font-weight:600;color:${exh>=3?'var(--danger)':'var(--text2)'}">💀 Épuisement — ${exh}/6</span>
          <div style="display:flex;gap:4px">
            <button class="btn bsm" onclick="changeExhaustion(1)">+1</button>
            <button class="btn bsm" onclick="changeExhaustion(-1)">-1</button>
          </div>
        </div>
        <div style="display:flex;gap:3px;margin-bottom:6px">${Array.from({length:6},(_,i)=>`<span style="width:18px;height:18px;border-radius:50%;border:2px solid ${i<exh?'var(--danger)':'var(--border)'};background:${i<exh?'rgba(229,57,53,.35)':'transparent'};display:inline-block"></span>`).join('')}</div>
        <div style="font-size:13px;color:${exh>=3?'var(--danger)':'var(--text3)'}">Pallier actuel : ${exhDesc[exh]||''}</div>
      </div>
    </div>`);
    if (barbareLvl>=10) {
      panels.push(`<div style="margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:2px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
          <span style="font-size:13px;font-weight:600;color:var(--cp)">😱 Présence intimidante</span>
          <span style="font-size:12px;color:var(--text3)">Action • portée 9m</span>
        </div>
        <button class="btn bsm" style="margin-bottom:6px" onclick="rollSave('JS SAG',${chaMod+pb(lvl)})">🎲 JS SAG DD ${8+pb(lvl)+chaMod} — Effrayée</button>
        <div style="font-size:13px;color:var(--text3)">Cible une créature visible/audible à 9m. Si elle rate, elle est Effrayée jusqu\'à la fin de ton prochain tour.</div>
      </div>`);
    }
    if (barbareLvl>=14) {
      panels.push(`<div style="margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:2px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
          <span style="font-size:13px;font-weight:600;color:var(--cp)">↪ Représailles</span>
          <span style="font-size:12px;color:var(--arcane);border:1px solid rgba(156,39,176,.4);border-radius:2px;padding:1px 6px">Réaction</span>
        </div>
        <div style="font-size:13px;color:var(--text3)">Quand tu subis des dégâts d\'une créature à 1,5m de toi, tu peux utiliser ta réaction pour faire une attaque de mêlée avec une arme contre elle.</div>
      </div>`);
    }
  }

  // ── GUERRIER TOTEM ────────────────────────────────────────
  if (isTotem && barbareLvl>=3) {
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:2px">
      <div style="font-size:13px;font-weight:600;color:var(--cp);margin-bottom:4px">🕊 Quêteur spirituel</div>
      <div style="font-size:13px;color:var(--text3)">Tu peux lancer <em>Communication avec les animaux</em> et <em>Sens animal</em>, mais uniquement en tant que rituels.</div>
    </div>`);
    const totems = [
      {id:'Ours',icon:'🐻',desc:'Résistance à tous les dégâts sauf psychiques en rage.'},
      {id:'Aigle',icon:'🦅',desc:'En rage (hors armure lourde) : les attaques d\'opportunité contre toi ont un désavantage, et tu peux Foncer en action bonus.'},
      {id:'Loup',icon:'🐺',desc:'En rage, tes alliés ont l\'avantage sur les attaques de mêlée contre les créatures à 1,5m de toi.'}
    ];
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:2px">
      <div style="font-size:13px;font-weight:600;color:var(--cp);margin-bottom:8px">🌿 Esprit totem</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">${totems.map(t=>`<button class="btn bsm${totemChoice===t.id?' bac':''}" onclick="P().combatCharges=P().combatCharges||{};P().combatCharges['TotemSpirit']='${t.id}';_markUnsaved();render()">${t.icon} ${t.id}</button>`).join('')}</div>
      ${totemChoice?`<div style="font-size:13px;color:var(--text3)">${totems.find(t=>t.id===totemChoice)?.desc||''}</div>`:'<div style="font-size:13px;color:var(--text3);font-style:italic">Choisissez votre esprit totem ci-dessus.</div>'}
    </div>`);

    if (barbareLvl>=6) {
      const aspectDesc = ({
        Ours:'🐻 Force de portage doublée. Avantage sur les jets de Force pour pousser, tirer, soulever ou casser des objets.',
        Aigle:'🦅 Vision jusqu\'à 1,5km sans difficulté (détails comme à 30m). La faible luminosité n\'impose pas de désavantage à tes jets de Sagesse (Perception).',
        Loup:'🐺 Tu peux pister des créatures même à allure rapide. Déplacement furtif à vitesse normale possible.'
      })[totemChoice]||'<em style="color:var(--text3)">Choisissez d\'abord votre esprit totem (niv.3).</em>';
      panels.push(`<div style="margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:2px">
        <div style="font-size:13px;font-weight:600;color:var(--cp);margin-bottom:4px">🌿 Aspect de la bête</div>
        <div style="font-size:13px;color:var(--text3)">${aspectDesc}</div>
      </div>`);
    }

    if (barbareLvl>=10) {
      panels.push(`<div style="margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:2px">
        <div style="font-size:13px;font-weight:600;color:var(--cp);margin-bottom:4px">🚶 Marcheur spirituel</div>
        <div style="font-size:13px;color:var(--text3)">Tu peux lancer <em>Communion avec la nature</em> comme un rituel. Au lieu d'une vraie bête, tu communies avec une version spirituelle de l'animal de ton totem.</div>
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
      panels.push(`<div style="margin-bottom:10px;padding:8px;background:${rageActive&&totemChoice?'rgba(33,150,243,.07)':'var(--surface2)'};border-radius:2px;border:1px solid ${rageActive&&totemChoice?'rgba(33,150,243,.3)':'var(--border)'}">
        <div style="font-size:13px;font-weight:600;color:var(--cp);margin-bottom:4px">🔗 Lien totémique</div>
        <div style="font-size:13px;color:var(--text3)">${lienDesc}</div>
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
      srsHtml = `<div style="font-size:13px;color:var(--arcane);font-weight:600;margin-bottom:6px">🎯 Choisissez un résultat :</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">
        <div style="padding:6px;background:rgba(156,39,176,.1);border:1px solid rgba(156,39,176,.3);border-radius:2px;cursor:pointer" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['SursautResult']=${srsResult2[0]};delete p.combatCharges['SursautResult2'];_markUnsaved();render();})()">
          <div style="font-size:13px;font-weight:600;color:var(--arcane)">${srsResult2[0]+1}/8</div>
          <div style="font-size:12px;color:var(--text3);line-height:1.3">${BARBARE_SURSAUT[srsResult2[0]]||''}</div>
          <div style="font-size:12px;color:var(--arcane);margin-top:3px">✓ Choisir</div>
        </div>
        <div style="padding:6px;background:rgba(156,39,176,.1);border:1px solid rgba(156,39,176,.3);border-radius:2px;cursor:pointer" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['SursautResult']=${srsResult2[1]};delete p.combatCharges['SursautResult2'];_markUnsaved();render();})()">
          <div style="font-size:13px;font-weight:600;color:var(--arcane)">${srsResult2[1]+1}/8</div>
          <div style="font-size:12px;color:var(--text3);line-height:1.3">${BARBARE_SURSAUT[srsResult2[1]]||''}</div>
          <div style="font-size:12px;color:var(--arcane);margin-top:3px">✓ Choisir</div>
        </div>
      </div>`;
    } else if (srsResult!==undefined) {
      srsHtml = `<div style="padding:6px 10px;background:rgba(156,39,176,.1);border:1px solid rgba(156,39,176,.3);border-radius:2px;font-size:13px;color:var(--text2);margin-bottom:6px"><strong style="color:var(--arcane)">Résultat ${srsResult+1}/8 :</strong> ${BARBARE_SURSAUT[srsResult]||''}</div>${_sursBtn(srsResult)}<div style="margin-top:6px"><button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};delete p.combatCharges['SursautResult'];_markUnsaved();render();})()">↺ Effacer</button></div>`;
    } else {
      srsHtml = `<div style="font-size:13px;color:var(--text3);font-style:italic">Lancé automatiquement quand tu entres en rage.</div>`;
    }

    let msContent = `<div style="margin-bottom:10px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:13px;font-weight:600;color:var(--text2)">🔍 Sens de la magie (${sensMagieCur}/${sensMagieMax})</span>
        <button class="btn bsm" onclick="recoverCombatCharge('SensMagie',${sensMagieMax})">↺ Récupérer</button>
      </div>
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px">${Array.from({length:sensMagieMax},(_,i)=>`<span class="slot-bubble${i<sensMagieCur?'':' used'}" onclick="useCombatCharge('SensMagie',${sensMagieMax})" title="Utiliser Sens de la magie"></span>`).join('')}</div>
      <div style="font-size:12px;color:var(--text3)">Action : détecter sorts/objets magiques à 18m jusqu'à la fin de ton prochain tour. Récup. repos long.</div>
    </div>
    <div style="margin-bottom:8px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <span style="font-size:13px;font-weight:600;color:var(--text2)">⚡ Sursaut sauvage</span>
        <div style="display:flex;gap:4px">${barbareLvl>=10?`<button class="btn bsm" onclick="(()=>{const r=Math.floor(Math.random()*8);const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['SursautResult']=r;delete p.combatCharges['SursautResult2'];_markUnsaved();render();showToast('Sursaut réaction — '+(r+1)+'/8')})()">⚡ Réaction</button>`:''}<button class="btn bsm bac" onclick="${sursLancerOnClick}">✨ Lancer${barbareLvl>=14?' (×2)':''}</button></div>
      </div>
      ${srsHtml}
    </div>`;

    if (barbareLvl>=6) {
      const rmMax = pb(lvl);
      const rmCur = cc['ReserveMagie']!==undefined ? cc['ReserveMagie'] : rmMax;
      msContent += `<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border)">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
          <span style="font-size:13px;font-weight:600;color:var(--text2)">⚡ Réserve de magie (${rmCur}/${rmMax})</span>
          <button class="btn bsm" onclick="recoverCombatCharge('ReserveMagie',${rmMax})">↺ Récupérer</button>
        </div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px">${Array.from({length:rmMax},(_,i)=>`<span class="slot-bubble${i<rmCur?'':' used'}" onclick="useCombatCharge('ReserveMagie',${rmMax})" title="Utiliser Réserve de magie"></span>`).join('')}</div>
        <div style="font-size:12px;color:var(--text3);margin-bottom:4px">Action : touche une créature (toi inclus). Au choix : pendant 10 min elle ajoute 1d3 à chaque jet d'attaque et de caractéristique, OU elle regagne un emplacement de sort de niveau ≤ 1d3 (cette 2ᵉ option : 1×/repos long par créature). Récup. repos long.</div>
        <button class="btn bsm bac" onclick="rollCustomDmg('1d3','Réserve de magie')">🎲 1d3</button>
      </div>`;
    }
    if (barbareLvl>=10) msContent += `<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border)"><div style="font-size:13px;font-weight:600;color:var(--text2);margin-bottom:2px">🌀 Réaction instable</div><div style="font-size:13px;color:var(--text3)">Réaction : juste après avoir subi des dégâts ou raté un JS pendant ta rage, déclenche un Sursaut sauvage (remplace l'effet en cours). Utilise le bouton ⚡ Réaction ci-dessus.</div></div>`;
    if (barbareLvl>=14) msContent += `<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border)"><div style="font-size:13px;font-weight:600;color:var(--text2);margin-bottom:2px">🎯 Sursaut contrôlé</div><div style="font-size:13px;color:var(--text3)">Lors d'un Sursaut sauvage, deux résultats sont tirés (🎲 ×2). Choisissez le résultat à appliquer en cliquant dessus.</div></div>`;

    panels.push(`<div style="margin-bottom:10px;padding:10px;background:rgba(156,39,176,.07);border:1px solid rgba(156,39,176,.2);border-radius:2px">
      <div style="font-size:13px;font-weight:700;color:var(--arcane);margin-bottom:10px">✨ Magie sauvage</div>
      ${msContent}
    </div>`);
  }

  // ── Instinct sauvage (niv.7+) — Fix 21 : bouton supprimé, avantage auto ─
  if (barbareLvl>=7) {
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:2px">
      <div style="font-size:13px;font-weight:600;color:var(--cp);margin-bottom:2px">🦅 Instinct sauvage</div>
      <div style="font-size:13px;color:var(--text3)">Avantage sur les jets d'initiative (2d20, prend le meilleur — appliqué automatiquement). Si surpris, tu peux entrer en rage au premier tour.</div>
    </div>`);
  }

  // Fix 12 — Passives liées à la rage dans le panel Rage
  const ragePassives=[];
  if(barbareLvl>=9)ragePassives.push(`<div style="display:flex;align-items:center;gap:6px;padding:5px 0;border-top:1px solid ${rageActive?'rgba(229,57,53,.2)':'var(--border)'}"><span style="font-size:14px">💥</span><div style="flex:1"><div style="font-size:13px;font-weight:600;color:var(--cp)">Critique brutal</div><div style="font-size:12px;color:var(--text3)">+${critDice} dé${critDice>1?'s':''} supplémentaire${critDice>1?'s':''} sur coup critique${rageActive?' (actif en rage)':''}</div></div></div>`);
  if(barbareLvl>=11)ragePassives.push(`<div style="display:flex;align-items:center;gap:6px;padding:5px 0;border-top:1px solid ${rageActive?'rgba(229,57,53,.2)':'var(--border)'}"><span style="font-size:14px">💪</span><div style="flex:1"><div style="font-size:13px;font-weight:600;color:var(--cp)">Rage implacable</div><div style="font-size:12px;color:var(--text3)">Tombe à 0 PV en rage → popup automatique JS CON DD ${implacableDC}${implacableUses>0?' ('+implacableUses+' usage':''}</div></div><button class="btn bsm" onclick="P().combatCharges=P().combatCharges||{};P().combatCharges['RageImplacableUses']=0;_markUnsaved();render()" title="Remettre à 0 au repos">↺</button></div>`);
  if(barbareLvl>=15)ragePassives.push(`<div style="display:flex;align-items:center;gap:6px;padding:5px 0;border-top:1px solid ${rageActive?'rgba(229,57,53,.2)':'var(--border)'}"><span style="font-size:14px">♾</span><div style="font-size:13px;color:var(--cp)">Rage persistante — la rage ne s\'arrête plus si pas d\'action hostile</div></div>`);

  // Fix 13 — Liseré animé quand en rage (ragePulse CSS)
  const rageAnimStyle = rageActive ? 'animation:ragePulse 2s ease-in-out infinite;' : '';

  return cs('cs-barbare', `<div class="panel mb10" style="${rageAnimStyle}">
    <div class="pt" style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span>🔥 Rage — Barbare</div>
    ${panels.join('')}
    ${ragePassives.length?`<div style="margin-top:4px">${ragePassives.join('')}</div>`:''}
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
  const TOTEM_OURS_RES = ['Feu','Froid','Foudre','Nécrotique','Acide','Tonnerre','Radiant','Poison','Force'];

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
    // Fix 15 — Nettoyer statut Attaque téméraire à la fin de la rage
    if (p.statuses) p.statuses = p.statuses.filter(s=>s.name!=='Attaque téméraire');
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

// Fix 15 — Attaque téméraire : statut auto sur p.statuses
function toggleTémérité() {
  const p = P();
  if (!p.combatCharges) p.combatCharges = {};
  const wasActive = p.combatCharges['Témérité']===true;
  p.combatCharges['Témérité'] = !wasActive;
  if (!wasActive) {
    // Ajout du statut visible
    if (!p.statuses) p.statuses = [];
    if (!p.statuses.find(s=>s.name==='Attaque téméraire')) {
      p.statuses.push({name:'Attaque téméraire',type:'malus',icon:'😤',desc:'Les attaquants ont l\'avantage contre toi jusqu\'au début de ton prochain tour.',rollPenalty:'',tempRage:true});
    }
  } else {
    // Retrait du statut
    if (p.statuses) p.statuses = p.statuses.filter(s=>s.name!=='Attaque téméraire');
  }
  _markUnsaved(); render();
}

// Fix 17 — Épuisement avec statuts automatiques
function changeExhaustion(delta) {
  const p = P();
  const prev = p.exhaustion||0;
  const next = Math.max(0, Math.min(6, prev + delta));
  p.exhaustion = next;
  // Appliquer les statuts correspondants
  if (!p.statuses) p.statuses = [];
  p.statuses = p.statuses.filter(s=>!s.exhaustionTag);
  if (next>=1) p.statuses.push({name:'Épuisement 1',type:'malus',icon:'😓',desc:'Désavantage aux jets de compétence.',rollPenalty:'carac',exhaustionTag:true});
  if (next>=2) p.statuses.push({name:'Épuisement 2',type:'malus',icon:'😰',desc:'Vitesse divisée par 2.',rollPenalty:'',exhaustionTag:true});
  if (next>=3) p.statuses.push({name:'Épuisement 3',type:'malus',icon:'😵',desc:'Désavantage aux jets d\'attaque et de sauvegarde.',rollPenalty:'attaque,save',exhaustionTag:true});
  if (next>=4) p.statuses.push({name:'Épuisement 4',type:'malus',icon:'🤢',desc:'PV maximum réduits de moitié.',rollPenalty:'',exhaustionTag:true});
  if (next>=5) p.statuses.push({name:'Épuisement 5',type:'malus',icon:'💀',desc:'Vitesse réduite à 0.',rollPenalty:'',exhaustionTag:true});
  if (next>=6) p.statuses.push({name:'Épuisement 6',type:'malus',icon:'☠',desc:'La créature meurt.',rollPenalty:'',exhaustionTag:true});
  _markUnsaved(); render();
}

// Fix 18 — Rage implacable automatisée (appelée depuis applyHp quand PV → 0 en rage)
function checkRageImplacable() {
  const p = P();
  if (!p.combatCharges) return;
  const barbareLvl = ((p.classes||[]).find(c=>c.name==='Barbare')||{}).level||0;
  if (barbareLvl < 11) return;
  if (p.combatCharges['RageActive'] !== true) return;
  if (p.hp > 0) return;
  const uses = p.combatCharges['RageImplacableUses']||0;
  const dc = 10 + uses * 5;
  const conMod = mod((p.abilities||[])[2]||10);
  openModal(`<div style="text-align:center;padding:16px 12px">
    <div style="font-size:36px;margin-bottom:8px">💪</div>
    <div class="pt" style="margin-bottom:6px">Rage implacable</div>
    <div style="font-size:14px;color:var(--text2);margin-bottom:6px">Tu tombes à 0 PV en rage !</div>
    <div style="font-size:13px;font-weight:600;color:var(--cp);margin-bottom:14px">JS CON DD ${dc}${uses>0?' (usage '+uses+')':''}</div>
    <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
      <button class="btn bac" onclick="_implacableRoll(${dc},${conMod})">✨ Lancer</button>
      <button class="btn" onclick="_implacableIRL(${dc},${conMod})">✏ IRL</button>
      <button class="btn" onclick="closeModal()">Ignorer</button>
    </div>
  </div>`);
}
function _implacableRoll(dc, conMod) {
  const p = P(); if (!p.combatCharges) p.combatCharges = {};
  const d20 = Math.ceil(Math.random()*20);
  const total = d20 + conMod;
  p.combatCharges['RageImplacableUses'] = (p.combatCharges['RageImplacableUses']||0)+1;
  if (total >= dc) { p.hp = 1; showToast(`💪 Rage implacable — d20(${d20})+CON = ${total} ≥ DD${dc} ✓ → 1 PV !`,4000); }
  else { showToast(`💪 Rage implacable — d20(${d20})+CON = ${total} < DD${dc} ✗ — reste à 0 PV.`,4000); }
  closeModal(); _markUnsaved(); render();
}
function _implacableIRL(dc, conMod) {
  openModal(`<div style="text-align:center;padding:14px 12px">
    <div class="pt" style="margin-bottom:8px">Rage implacable — Mode IRL</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:12px">Lance 1d20, entre le résultat brut :</div>
    <input class="fi" id="implacableIRLInput" type="number" min="1" max="20" style="text-align:center;font-size:16px;width:80px;margin-bottom:14px">
    <div style="display:flex;gap:8px;justify-content:center">
      <button class="btn" onclick="closeModal()">Annuler</button>
      <button class="btn bac" onclick="(()=>{const v=parseInt(document.getElementById('implacableIRLInput')?.value)||0;if(v<1||v>20){showToast('❌ Invalide');return;}_implacableRoll2(${dc},${conMod},v);})()">Valider</button>
    </div>
  </div>`);
}
function _implacableRoll2(dc, conMod, d20) {
  const p = P(); if (!p.combatCharges) p.combatCharges = {};
  const total = d20 + conMod;
  p.combatCharges['RageImplacableUses'] = (p.combatCharges['RageImplacableUses']||0)+1;
  if (total >= dc) { p.hp = 1; showToast(`💪 Rage implacable — d20(${d20})+CON = ${total} ≥ DD${dc} ✓ → 1 PV !`,4000); }
  else { showToast(`💪 Rage implacable — d20(${d20})+CON = ${total} < DD${dc} ✗ — reste à 0 PV.`,4000); }
  closeModal(); _markUnsaved(); render();
}

function endRageTurn() {
  const p = P();
  if (!p.combatCharges) p.combatCharges = {};
  if (!p.combatCharges['RageActive']) return;
  const barbareLvl = ((p.classes||[]).find(c=>c.name==='Barbare')||{}).level||0;
  if (barbareLvl >= 15) { showToast('♾ Rage persistante — durée illimitée.'); return; }

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
