// CLERC — Panneau de combat
// ═══════════════════════════════════════

function renderClerc(p) {
  const clercLvl = ((p.classes||[]).find(c=>c.name==='Clerc')||{}).level||0;
  if (!clercLvl || p.wildshape?.active) return '';
  const sagM = mod(p.abilities[4]);
  const clercPath = (p.features||[]).find(f=>['Domaine de la vie','Domaine de la lumière','Domaine de la nature','Domaine de la tempête','Domaine de la tromperie','Domaine de la guerre','Domaine du savoir','Domaine de la forge'].includes(f.name));
  const dn = clercPath?.name || '';
  const cc = p.combatCharges || {};
  const ddSorts = 8 + pb(clercLvl) + sagM;
  const atkSorts = pb(clercLvl) + sagM;
  const panels = [];

  // ── Stats d'incantation ───────────────────────────────────
  panels.push(`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
    <div class="sb hi" style="flex:1;min-width:70px"><div class="sn">DD sorts</div><div style="font-size:18px;font-weight:700;color:var(--cp)">${ddSorts}</div></div>
    <div class="sb hi" style="flex:1;min-width:70px"><div class="sn">Atk sorts</div><div style="font-size:18px;font-weight:700;color:var(--cp)">${atkSorts>=0?'+':''}${atkSorts}</div></div>
  </div>`);

  // ── Conduit divin (niv.2+) ────────────────────────────────
  if (clercLvl >= 2) {
    const cdMax = clercLvl>=18?3:clercLvl>=6?2:1;
    const cdUsed = cc['ConduitDivin']!==undefined ? cc['ConduitDivin'] : cdMax;
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:6px">
      <div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:6px">✝ Conduit divin</div>
      <div style="font-size:11px;color:var(--text3);margin-bottom:6px">Renvoi des morts-vivants (action) + capacité de domaine. Récup. repos court.</div>
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">${Array.from({length:cdMax},(_,i)=>`<span class="slot-bubble${i<cdUsed?'':' used'}" onclick="useCombatCharge('ConduitDivin',${cdMax})"></span>`).join('')}</div>
      <div style="display:flex;gap:6px;align-items:center">
        <button class="btn bsm" onclick="recoverCombatCharge('ConduitDivin',${cdMax})">↺ Repos court</button>
        <span style="font-size:10px;color:var(--text3)">${cdUsed}/${cdMax}</span>
      </div>
    </div>`);
  }

  // ── Destruction des morts-vivants (niv.5+) ────────────────
  if (clercLvl >= 5) {
    const fp = clercLvl>=17?4:clercLvl>=14?3:clercLvl>=11?2:clercLvl>=8?1:'½';
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:6px">
      <div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:2px">💀 Destruction des morts-vivants</div>
      <div style="font-size:11px;color:var(--text3)">Renvoi des morts-vivants : créatures de FP ≤ <strong>${fp}</strong> sont détruites automatiquement si elles ratent leur JS.</div>
    </div>`);
  }

  // ── Intervention divine (niv.10+) ─────────────────────────
  if (clercLvl >= 10) {
    const idUsed = cc['InterventionDivine'] === false;
    const isLvl20 = clercLvl >= 20;
    panels.push(`<div style="margin-bottom:10px;padding:8px;background:${idUsed?'var(--surface2)':'rgba(200,168,75,.06)'};border:1px solid ${idUsed?'var(--border)':'rgba(200,168,75,.4)'};border-radius:6px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <span style="font-size:12px;font-weight:600;color:var(--cp)">🙏 Intervention divine</span>
        ${idUsed?`<button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};delete p.combatCharges['InterventionDivine'];saveAll();render();})()">↺ Repos long</button>`:`<button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['InterventionDivine']=false;saveAll();render();})()">Invoquer</button>`}
      </div>
      <div style="font-size:11px;color:var(--text3)">${isLvl20?'Niv.20 — Réussit automatiquement, aucun jet nécessaire.':idUsed?'Utilisé — Recharge dans 7 jours ou repos long.':`Action : lancer 1d100. Si résultat ≤ ${clercLvl} → divinité intervient (effet du MJ). Recharge : 7 jours si succès, repos long si échec. <button class="btn bsm" style="font-size:10px;margin-top:4px" onclick="(()=>{const r=Math.ceil(Math.random()*100);showToast('🙏 Intervention divine : d100 = <strong>'+r+'</strong> '+(r<=${clercLvl}?' ✅ Succès !':' ❌ Échec'))})()">🎲 d100</button>`}</div>
    </div>`);
  }

  // ── DOMAINE DIVIN ─────────────────────────────────────────
  if (clercPath) {
    const domStyle = {
      'Domaine de la vie':    {bg:'rgba(76,175,80,.07)',  border:'rgba(76,175,80,.25)',  col:'#4caf50', icon:'💚'},
      'Domaine de la lumière':{bg:'rgba(255,193,7,.07)',  border:'rgba(255,193,7,.4)',   col:'#ffc107', icon:'☀'},
      'Domaine de la nature': {bg:'rgba(76,175,80,.07)',  border:'rgba(76,175,80,.25)',  col:'#4caf50', icon:'🌿'},
      'Domaine de la tempête':{bg:'rgba(33,150,243,.07)', border:'rgba(33,150,243,.25)', col:'#2196f3', icon:'⚡'},
      'Domaine de la tromperie':{bg:'rgba(156,39,176,.07)',border:'rgba(156,39,176,.25)',col:'#9c27b0', icon:'🎭'},
      'Domaine de la guerre': {bg:'rgba(244,67,54,.07)',  border:'rgba(244,67,54,.25)',  col:'#f44336', icon:'⚔'},
      'Domaine du savoir':    {bg:'rgba(33,150,243,.07)', border:'rgba(33,150,243,.25)', col:'#2196f3', icon:'📚'},
      'Domaine de la forge':  {bg:'rgba(255,87,34,.07)',  border:'rgba(255,87,34,.25)',  col:'#ff5722', icon:'🔨'},
    };
    const ds = domStyle[dn] || {bg:'rgba(200,168,75,.07)',border:'rgba(200,168,75,.3)',col:'var(--cp)',icon:'✝'};
    let dc = '';

    // ─── VIE ──────────────────────────────────────────────────
    if (dn === 'Domaine de la vie') {
      dc += `<div style="padding:7px 10px;background:var(--surface2);border-radius:6px;margin-bottom:6px">
        <div style="font-size:12px;font-weight:600;margin-bottom:4px">💚 Disciple de la vie <span style="font-size:10px;color:var(--text3);margin-left:4px">niv.1</span></div>
        <div style="font-size:11px;color:var(--text3);margin-bottom:6px">Sorts de soin niv.1+ : <strong>+2 + niveau du sort</strong> PV supplémentaires à la cible. Quel niveau venez-vous de lancer ?</div>
        <div style="display:flex;gap:3px;flex-wrap:wrap">${Array.from({length:9},(_,i)=>{const niv=i+1;const bonus=2+niv;return `<button class="btn bsm" style="min-width:28px" onclick="showToast('💚 Disciple de la vie — Niv.${niv} : +${bonus} PV bonus à la cible',2500)">Niv.${niv}</button>`;}).join('')}</div>
      </div>`;
      dc += _clercPanel('✝ Préservation de la vie','Conduit divin','',`Action : dépenser 1 conduit — distribuer <strong>${5*clercLvl} PV</strong> entre des créatures à 9m (max ½ PV max chacune). Pas d'effet sur morts-vivants/artificiels.`);
      if (clercLvl>=6)  dc += _clercPanel('🌟 Guérisseur béni','niv.6','',`Quand tu soignes un allié avec un sort de niv.1+, tu récupères toi-même <strong>2 + niveau du sort</strong> PV.`);
      if (clercLvl>=8)  dc += _clercPanel(`⚡ Frappe divine`,'niv.8','',`1×/tour, quand tu touches avec une arme : <strong>+${clercLvl>=14?'2d8':'1d8'} radiants</strong>. <button class="btn bsm" style="font-size:10px;margin-top:4px" onclick="rollCustomDmg('${clercLvl>=14?'2d8':'1d8'}','Frappe divine')">🎲 ${clercLvl>=14?'2d8':'1d8'}</button>`);
      if (clercLvl>=17) dc += _clercPanel('✨ Guérison suprême','niv.17','',`Sorts de soin : applique directement le maximum de chaque dé (ex. 2d6 → 12 PV).`);
    }

    // ─── LUMIÈRE ──────────────────────────────────────────────
    else if (dn === 'Domaine de la lumière') {
      const ipMax = Math.max(1, sagM);
      const ipCur = cc['IlluminationProtectrice']!==undefined ? cc['IlluminationProtectrice'] : ipMax;
      dc += `<div style="padding:7px 10px;background:var(--surface2);border-radius:6px;margin-bottom:6px">
        <div style="font-size:12px;font-weight:600;margin-bottom:4px">🔆 Illumination protectrice <span style="font-size:10px;color:var(--cp);margin-left:4px">Réaction</span> <span style="font-size:10px;color:var(--text3);margin-left:4px">niv.1</span></div>
        <div style="font-size:11px;color:var(--text3);margin-bottom:6px">${clercLvl>=6?'Quand toi ou un allié à 9m est attaqué par une créature visible':'Quand tu es attaqué par une créature à 9m'} : imposer désavantage au jet d'attaque. Immunisé si l'attaquant ne peut pas être aveuglé.</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">${Array.from({length:ipMax},(_,i)=>`<span class="slot-bubble${i<ipCur?'':' used'}" onclick="useCombatCharge('IlluminationProtectrice',${ipMax})"></span>`).join('')}</div>
        <div style="display:flex;gap:6px;align-items:center">
          <button class="btn bsm" onclick="recoverCombatCharge('IlluminationProtectrice',${ipMax})">↺ Repos long</button>
          <span style="font-size:10px;color:var(--text3)">${ipCur}/${ipMax}</span>
        </div>
      </div>`;
      dc += _clercPanel('☀ Radiance de l\'aube','Conduit divin','',`Action : dissiper ténèbres magiques à 9m. Créatures hostiles à 9m → JS CON DD ${ddSorts} ou <strong>2d10+${clercLvl} radiants</strong> (moitié si réussi). <button class="btn bsm" style="font-size:10px;margin-top:4px" onclick="rollCustomDmg('2d10','Radiance de l\\'aube')">🎲 2d10</button>`);
      if (clercLvl>=8)  dc += _clercPanel('⚡ Incantation puissante','niv.8','',`+${sagM} aux dégâts de tous les sorts mineurs de clerc.`);
      if (clercLvl>=17) dc += _clercPanel('☀ Halo de lumière','niv.17','',`Action : lumière vive 18m + lumière faible 9m supplémentaires (1 min). Ennemis dans la lumière vive : désavantage aux JS contre sorts infligeant des dégâts de feu ou radiants.`);
    }

    // ─── NATURE ───────────────────────────────────────────────
    else if (dn === 'Domaine de la nature') {
      dc += _clercPanel('🌿 Acolyte de la nature','niv.1','',`Sort mineur de druide au choix (compte comme sort de clerc). Maîtrise au choix : Dressage, Nature ou Survie.`);
      if (clercLvl>=2) dc += _clercPanel('🐾 Charme des animaux et des plantes','Conduit divin','',`Action : créatures de type Bête ou Plante à 9m → JS SAG DD ${ddSorts} ou charmées 1 min (ou jusqu'aux dégâts). Amicales pendant la durée.`);
      if (clercLvl>=6) dc += _clercPanel('🛡 Atténuation des éléments','Réaction • niv.6','',`Réaction : quand toi ou une créature à 9m subit des dégâts d'acide, froid, feu, foudre ou tonnerre — accorder la résistance à ce type.`);
      if (clercLvl>=8) dc += _clercPanel(`⚡ Frappe divine`,'niv.8','',`1×/tour, quand tu touches avec une arme : <strong>+${clercLvl>=14?'2d8':'1d8'} froid, feu ou foudre</strong> (au choix). <button class="btn bsm" style="font-size:10px;margin-top:4px" onclick="rollCustomDmg('${clercLvl>=14?'2d8':'1d8'}','Frappe divine')">🎲 ${clercLvl>=14?'2d8':'1d8'}</button>`);
      if (clercLvl>=17) dc += _clercPanel('🌳 Maître de la nature','niv.17','',`Action bonus : commander verbalement les animaux et plantes charmés par Charme des animaux et des plantes.`);
    }

    // ─── TEMPÊTE ──────────────────────────────────────────────
    else if (dn === 'Domaine de la tempête') {
      const foMax = Math.max(1, sagM);
      const foCur = cc['FureurOuragan']!==undefined ? cc['FureurOuragan'] : foMax;
      dc += `<div style="padding:7px 10px;background:var(--surface2);border-radius:6px;margin-bottom:6px">
        <div style="font-size:12px;font-weight:600;margin-bottom:4px">⚡ Fureur de l'ouragan <span style="font-size:10px;color:var(--cp);margin-left:4px">Réaction</span> <span style="font-size:10px;color:var(--text3);margin-left:4px">niv.1</span></div>
        <div style="font-size:11px;color:var(--text3);margin-bottom:6px">Quand une créature à 1,5m te touche : JS DEX DD ${ddSorts} ou <strong>2d8 foudre ou tonnerre</strong> (moitié si réussi). Récup. repos long.</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">${Array.from({length:foMax},(_,i)=>`<span class="slot-bubble${i<foCur?'':' used'}" onclick="useCombatCharge('FureurOuragan',${foMax})"></span>`).join('')}</div>
        <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
          <button class="btn bsm" onclick="recoverCombatCharge('FureurOuragan',${foMax})">↺ Repos long</button>
          <span style="font-size:10px;color:var(--text3)">${foCur}/${foMax}</span>
          <button class="btn bsm bac" onclick="rollCustomDmg('2d8','Fureur de l\\'ouragan')">🎲 2d8</button>
        </div>
      </div>`;
      if (clercLvl>=2) dc += _clercPanel('💥 Fureur destructrice','Conduit divin','',`Quand tu infliges des dégâts de foudre ou tonnerre : dépenser 1 conduit pour infliger le maximum sans lancer les dés.`);
      if (clercLvl>=6) dc += _clercPanel('🌩 Frappe de l\'éclair','niv.6','',`Quand tu infliges des dégâts de foudre à une créature de taille G ou moins : tu peux la repousser de 3m.`);
      if (clercLvl>=8) dc += _clercPanel(`⚡ Frappe divine`,'niv.8','',`1×/tour, quand tu touches avec une arme : <strong>+${clercLvl>=14?'2d8':'1d8'} tonnerre</strong>. <button class="btn bsm" style="font-size:10px;margin-top:4px" onclick="rollCustomDmg('${clercLvl>=14?'2d8':'1d8'}','Frappe divine')">🎲 ${clercLvl>=14?'2d8':'1d8'}</button>`);
      if (clercLvl>=17) dc += _clercPanel('🌪 Enfant de la tempête','niv.17','',`Vitesse de vol égale à ta vitesse de déplacement (sauf sous terre ou en intérieur).`);
    }

    // ─── TROMPERIE ────────────────────────────────────────────
    else if (dn === 'Domaine de la tromperie') {
      dc += _clercPanel('🎭 Bénédiction de l\'escroc','Action • niv.1','',`Toucher une créature consentante (pas toi) : avantage aux jets de Discrétion (DEX) pendant 1h. Se remplace si réutilisé.`);
      if (clercLvl>=2) dc += _clercPanel('🪞 Invocation de réplique','Conduit divin','',`Action : illusion parfaite de toi dans un espace visible à 9m (conc. 1 min). Action bonus : déplacer l'illusion à 9m. Tu peux lancer des sorts depuis sa position. Avantage aux attaques contre créatures à 1,5m de l'illusion.`);
      if (clercLvl>=6) dc += _clercPanel('🌑 Linceul d\'ombre','Conduit divin • niv.6','',`Action : dépenser 1 conduit — devenir invisible jusqu'à la fin de ton prochain tour. Fin anticipée si tu attaques ou lances un sort.`);
      if (clercLvl>=8) dc += _clercPanel(`⚡ Frappe divine`,'niv.8','',`1×/tour, quand tu touches avec une arme : <strong>+${clercLvl>=14?'2d8':'1d8'} poison</strong>. <button class="btn bsm" style="font-size:10px;margin-top:4px" onclick="rollCustomDmg('${clercLvl>=14?'2d8':'1d8'}','Frappe divine')">🎲 ${clercLvl>=14?'2d8':'1d8'}</button>`);
      if (clercLvl>=17) dc += _clercPanel('🪞 Réplique améliorée','niv.17','',`Invocation de réplique crée jusqu'à 4 doublons. Action bonus : déplacer plusieurs (max 9m chacun, max 36m de toi).`);
    }

    // ─── GUERRE ───────────────────────────────────────────────
    else if (dn === 'Domaine de la guerre') {
      const pgMax = Math.max(1, sagM);
      const pgCur = cc['PretreGuerre']!==undefined ? cc['PretreGuerre'] : pgMax;
      dc += `<div style="padding:7px 10px;background:var(--surface2);border-radius:6px;margin-bottom:6px">
        <div style="font-size:12px;font-weight:600;margin-bottom:4px">⚔ Prêtre de guerre <span style="font-size:10px;color:var(--text3);margin-left:4px">niv.1</span></div>
        <div style="font-size:11px;color:var(--text3);margin-bottom:6px">Quand tu utilises l'action Attaquer : faire une attaque avec une arme en action bonus. ${pgMax}×/repos long.</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">${Array.from({length:pgMax},(_,i)=>`<span class="slot-bubble${i<pgCur?'':' used'}" onclick="useCombatCharge('PretreGuerre',${pgMax})"></span>`).join('')}</div>
        <div style="display:flex;gap:6px;align-items:center">
          <button class="btn bsm" onclick="recoverCombatCharge('PretreGuerre',${pgMax})">↺ Repos long</button>
          <span style="font-size:10px;color:var(--text3)">${pgCur}/${pgMax}</span>
        </div>
      </div>`;
      if (clercLvl>=2) dc += _clercPanel('🎯 Frappe guidée','Conduit divin','',`Quand tu fais un jet d'attaque : dépenser 1 conduit pour ajouter <strong>+10</strong> au jet (après avoir vu le résultat, avant l'annonce du MJ).`);
      if (clercLvl>=6) dc += _clercPanel('🛡 Bénédiction du dieu de la guerre','Conduit divin • niv.6','',`Réaction : quand une créature à 9m fait un jet d'attaque — dépenser 1 conduit pour lui donner <strong>+10</strong> (après avoir vu le résultat, avant l'annonce).`);
      if (clercLvl>=8) dc += _clercPanel(`⚡ Frappe divine`,'niv.8','',`1×/tour, quand tu touches avec une arme : <strong>+${clercLvl>=14?'2d8':'1d8'} du même type que l'arme</strong>. <button class="btn bsm" style="font-size:10px;margin-top:4px" onclick="rollCustomDmg('${clercLvl>=14?'2d8':'1d8'}','Frappe divine')">🎲 ${clercLvl>=14?'2d8':'1d8'}</button>`);
      if (clercLvl>=17) dc += _clercPanel('👑 Avatar de bataille','niv.17','',`Résistance aux dégâts contondants, perforants et tranchants provenant d'attaques non magiques.`);
    }

    // ─── SAVOIR ───────────────────────────────────────────────
    else if (dn === 'Domaine du savoir') {
      dc += _clercPanel('📚 Bénédictions du savoir','niv.1','',`2 langues supplémentaires. Maîtrise de 2 compétences parmi : Arcanes, Histoire, Nature, Religion. Bonus de maîtrise doublé pour ces deux compétences.`);
      if (clercLvl>=2) dc += _clercPanel('🧠 Savoir ancestral','Conduit divin','',`Action : choisir une compétence ou un outil — tu obtiens la maîtrise pendant 10 minutes.`);
      if (clercLvl>=6) dc += _clercPanel('🔮 Lecture des pensées','Conduit divin • niv.6','',`Action : créature à 18m → JS SAG DD ${ddSorts}. Si raté : lire ses pensées pendant 1 min. Tu peux ensuite lancer suggestion sans emplacement (JS automatiquement raté).`);
      if (clercLvl>=8) dc += _clercPanel('⚡ Incantation puissante','niv.8','',`+${sagM} aux dégâts de tous les sorts mineurs de clerc.`);
      if (clercLvl>=17) {
        const vpUsed = !!(cc['VisionsPasse']);
        dc += `<div style="padding:7px 10px;background:${vpUsed?'rgba(33,150,243,.08)':'var(--surface2)'};border:1px solid ${vpUsed?'rgba(33,150,243,.4)':'var(--border)'};border-radius:6px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <span style="font-size:12px;font-weight:600">🔮 Visions du passé <span style="font-size:10px;font-weight:400;color:var(--text3);margin-left:4px">niv.17</span></span>
            ${vpUsed?`<button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};delete p.combatCharges['VisionsPasse'];saveAll();render();})()">↺ Repos court</button>`:`<button class="btn bsm" onclick="(()=>{const p=P();if(!p.combatCharges)p.combatCharges={};p.combatCharges['VisionsPasse']=true;saveAll();render();})()">Utiliser</button>`}
          </div>
          <div style="font-size:11px;color:var(--text3)">${vpUsed?'Utilisé — Recharge après un repos court.':'Méditation 1 min : visions d\'un objet (propriétaires passés) ou d\'une zone (jusqu\'à SAG jours dans le passé). Conc. nécessaire.'}</div>
        </div>`;
      }
    }

    // ─── FORGE ────────────────────────────────────────────────
    else if (dn === 'Domaine de la forge') {
      dc += _clercPanel('🔨 Bénédiction de la forge','niv.1','',`Fin d'un repos long : toucher une armure ou arme courante/de guerre non magique → <strong>+1</strong> CA ou +1 attaque/dégâts jusqu'au prochain repos long. 1×/repos long.`);
      if (clercLvl>=2) dc += _clercPanel('⚒ Bénédiction de l\'artisan','Conduit divin','',`Rituel 1h : créer un objet métallique non magique de valeur ≤ 100 po (arme, armure, munitions, outils…). Le métal utilisé se transforme.`);
      if (clercLvl>=6) dc += _clercPanel('🛡 Âme de la forge','niv.6','',`Résistance aux dégâts de feu. +1 à la CA quand tu portes une armure lourde.`);
      if (clercLvl>=8) dc += _clercPanel(`⚡ Frappe divine`,'niv.8','',`1×/tour, quand tu touches avec une arme : <strong>+${clercLvl>=14?'2d8':'1d8'} feu</strong>. <button class="btn bsm" style="font-size:10px;margin-top:4px" onclick="rollCustomDmg('${clercLvl>=14?'2d8':'1d8'}','Frappe divine')">🎲 ${clercLvl>=14?'2d8':'1d8'}</button>`);
      if (clercLvl>=17) dc += _clercPanel('🏰 Saint de la forge et du feu','niv.17','',`Immunité aux dégâts de feu. En armure lourde : résistance aux dégâts contondants, perforants et tranchants d'attaques non magiques.`);
    }

    panels.push(`<div style="margin-top:6px;padding:10px;background:${ds.bg};border:1px solid ${ds.border};border-radius:8px">
      <div style="font-size:12px;font-weight:700;color:${ds.col};margin-bottom:8px">${ds.icon} ${esc(dn)}</div>
      ${dc}
    </div>`);
  }

  return cs('cs-clerc', `<div class="panel mb10">
    <div class="pt" style="display:flex;align-items:center;gap:6px"><span class="mj-drag-handle" title="Déplacer">⠿</span>✝ Clerc — Capacités</div>
    ${panels.join('')}
  </div>`);
}

function _clercPanel(title, tag, extra, desc) {
  return `<div style="padding:7px 10px;background:var(--surface2);border-radius:6px;margin-bottom:6px">
    <div style="font-size:12px;font-weight:600;margin-bottom:2px">${title}${tag?` <span style="font-size:10px;color:var(--text3);margin-left:4px">${tag}</span>`:''}${extra}</div>
    <div style="font-size:11px;color:var(--text3)">${desc}</div>
  </div>`;
}
