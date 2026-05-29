
function _buildChargeChips(p){
  if(!SRD||!SRD.classes)return'';
  const tracked=p.combatCharges||{};
  const chips=[];
  for(const cls of(p.classes||[])){
    const clsDef=SRD.classes.find(c=>c.name===cls.name);
    if(!clsDef)continue;
    for(const f of(clsDef.combatFeatures||[])){
      if(f.recovery==='passive'||f.charges===0)continue;
      let max=f.charges||1;
      if(f.chargesFormula==='CHA'){const cha=(p.abilities||[])[5]||10;max=Math.max(1,Math.floor((cha-10)/2));}
      else if(f.chargesFormula==='level'){max=(p.classes||[]).reduce((s,c)=>s+(c.level||1),0);}
      const rem=tracked[f.name]!==undefined?tracked[f.name]:max;
      const depleted=rem<=0;
      chips.push(`<span style="font-size:9px;padding:1px 5px;border-radius:8px;border:1px solid ${depleted?'rgba(229,57,53,.4)':'rgba(200,168,75,.35)'};color:${depleted?'#e53935':'var(--cp)'};background:${depleted?'rgba(229,57,53,.06)':'rgba(200,168,75,.06)'};white-space:nowrap">${f.icon||'⚡'} ${rem}/${max}</span>`);
    }
  }
  return chips.length?`<div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:3px">${chips.join('')}</div>`:'';
}
function _updatePartyHUD(){
  const hud=document.getElementById('partyHud');
  const panel=document.getElementById('partyHudPanel');
  const btn=document.getElementById('partyHudBtn');
  const badge=document.getElementById('partyHudBadge');
  if(!hud||!panel||!btn)return;
  if(_groupData.length===0&&!_groupOnlyMode){hud.style.display='none';return;}
  hud.style.display='block';

  const dangerCount=_groupData.filter(pp=>{const p=pp.charData||{};const pct=p.hpMax?p.hp/p.hpMax:1;return pct<=.25;}).length;
  if(badge){
    badge.style.display=dangerCount?'flex':'none';
    badge.textContent=dangerCount||'';
    badge.style.background=dangerCount?'#e53935':'transparent';
  }

  const combatActive=!!(_activeCombatState?.active);
  const activeTurnUid=combatActive?_activeCombatState.currentTurnUid:null;
  const isMyTurn=combatActive&&activeTurnUid===currentUser?.uid;
  const STATS_SH=['FOR','DEX','CON','INT','SAG','CHA'];

  // Badge ⚡ + animation violet sur le bouton HUD quand c'est mon tour
  const turnBadge=document.getElementById('partyHudTurnBadge');
  if(turnBadge)turnBadge.style.display=isMyTurn?'flex':'none';
  if(btn){
    if(isMyTurn)btn.classList.add('my-turn');
    else btn.classList.remove('my-turn');
  }

  // Bandeau "C'est ton tour" en haut du panel
  const myTurnBannerHtml=isMyTurn?`<div style="background:linear-gradient(135deg,#6d28d9,#4338ca);border-radius:8px;padding:8px 10px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;gap:6px;animation:combatPulse 2s ease-in-out infinite">
    <span style="font-size:13px;font-weight:700;color:white">⚡ C'est ton tour !</span>
    <button onclick="playerEndTurn()" style="background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.4);border-radius:6px;color:white;font-size:11px;font-weight:600;padding:4px 8px;cursor:pointer;white-space:nowrap">⏩ Fin du tour</button>
  </div>`:'';

  const headerHtml=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,.08)">
    <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em">👥 Groupe</span>
    <button style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:14px;padding:0 4px;line-height:1" onclick="_togglePartyHud()" title="Replier">▼</button>
  </div>`;

  const membersHtml=_groupData.length===0
    ?'<div style="padding:8px 0;text-align:center;font-size:12px;color:var(--text3)">En attente des joueurs...</div>'
    :_groupData.map(pp=>{
      const p=pp.charData||{};
      const hp=p.hp||0;const hpMax=p.hpMax||1;
      const hpPct=Math.max(0,Math.min(100,hpMax?hp/hpMax*100:0));
      const hpColor=hpPct>50?'#4caf50':hpPct>25?'#ff9800':'#e53935';
      const isOwn=pp.uid===currentUser?.uid;
      const isActiveTurn=activeTurnUid&&pp.uid===activeTurnUid;
      const portrait=p.portrait||p.equipPortrait;
      const charName=p.charName||pp.playerName||'?';
      const cls=(p.classes||[]).map(c=>c.name+' '+c.level).join(' / ');
      const race=p.race||'';
      const bg=p.background||'';
      const subLine=[cls,race?race+(bg?' · '+bg:''):bg].filter(Boolean).join(' · ');
      const conds=p.conditions||[];
      const down=hp<=0;
      const dead=down&&(p.deathSaves?.fail>=3);
      const dimmed=combatActive&&!isActiveTurn&&!isOwn;
      const isSelected=_currentHudDetailUid===pp.uid;
      return`<div class="party-member" data-uid="${pp.uid}" style="${dimmed?'opacity:.4;':''}cursor:pointer;${isSelected?'background:rgba(200,168,75,.07);border-radius:6px;':''}">
        <div class="pm-portrait${isOwn?' self':''}${isActiveTurn?' active-turn-portrait':''}" style="width:34px;height:34px;align-self:flex-start;margin-top:2px;flex-shrink:0">
          ${portrait?`<img src="${portrait}" style="width:100%;height:100%;object-fit:cover">`:`<span style="font-size:16px">${pp.avatar||'⚔'}</span>`}
        </div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:4px">
            <span class="pm-name${isOwn?' self':''}">${esc(charName)}</span>
            <span style="font-size:9px;color:${isOwn?'var(--cp)':'var(--text3)'};opacity:.8;flex-shrink:0">${isOwn?'Moi':esc(pp.playerName||'')}</span>
          </div>
          <div style="display:flex;align-items:center;gap:4px;margin-top:2px">
            <div class="pm-hp-bar" style="flex:1"><div class="pm-hp-fill" style="width:${hpPct}%;background:${hpColor}"></div></div>
            <span style="font-size:9px;color:${down?'#e53935':hpColor};flex-shrink:0;font-weight:700">${dead?'💀':down?'⚠ À terre':hp+'/'+hpMax}</span>
          </div>
          ${conds.length?`<div class="pm-sub" style="margin-top:1px">${conds.slice(0,3).join(' ')}${conds.length>3?` <span style="opacity:.55">+${conds.length-3}</span>`:''}</div>`:''}
          ${_buildChargeChips(p)}
        </div>
      </div>`;
    }).join('');

  panel.innerHTML=myTurnBannerHtml+headerHtml+membersHtml;

  // Rafraîchit le panneau détail si un joueur est sélectionné
  if(_currentHudDetailUid)_showHudDetail(_currentHudDetailUid);

  panel.onclick=e=>{
    if(e.target.closest('summary'))return;
    const card=e.target.closest('.party-member');
    if(card&&card.dataset.uid){
      const uid=card.dataset.uid;
      if(_currentHudDetailUid===uid){_hideHudDetail();_updatePartyHUD();}
      else{_showHudDetail(uid);_updatePartyHUD();}
    }
  };

  if(!_groupHudOpen)panel.style.display='none';
}
function _hideHudDetail(){
  _currentHudDetailUid=null;
  document.getElementById('hudDetailPopup')?.remove();
  document.getElementById('hudDetailOverlay')?.remove();
}
function _showHudDetail(uid){
  const pp=_groupData.find(x=>x.uid===uid);
  if(!pp){_hideHudDetail();return;}
  _currentHudDetailUid=uid;
  const p=pp.charData||{};
  const isOwn=uid===currentUser?.uid;
  const portrait=p.portrait||p.equipPortrait;
  const cls=(p.classes||[]).map(c=>c.name+' '+c.level).join(' / ');
  const race=p.race||'';const bg=p.background||'';
  const subLine=[cls,race+(bg?' · '+bg:'')].filter(Boolean).join(' · ');
  const combatActive=!!(_activeCombatState?.active);
  const isActiveTurn=combatActive&&_activeCombatState.currentTurnUid===uid;
  const hp=p.hp||0;const hpMax=p.hpMax||1;
  const hpPct=Math.max(0,Math.min(100,hpMax?hp/hpMax*100:0));
  const hpColor=hpPct>50?'#4caf50':hpPct>25?'#ff9800':'#e53935';
  const down=hp<=0;
  const dead=down&&(p.deathSaves?.fail>=3);
  const conds=p.conditions||[];
  const STATS_SH=['FOR','DEX','CON','INT','SAG','CHA'];
  const statsHtml=p.abilities?STATS_SH.map((s,i)=>{const v=p.abilities[i]||10;const m=Math.floor((v-10)/2);return`<div style="text-align:center;background:var(--surface2);border:1px solid var(--border);border-radius:4px;padding:3px"><div style="font-size:8px;color:var(--text3)">${s}</div><div style="font-size:12px;font-weight:700;color:var(--text)">${v}</div><div style="font-size:8px;color:var(--cp)">${m>=0?'+':''}${m}</div></div>`;}).join(''):'';
  const chargesHtml=_buildChargeChips(p);

  // Mode : overlay (hub/mj/group-only) ou flottant (fiche perso ouverte)
  const onCharSheet=document.getElementById('app').style.display!=='none';

  const innerHtml=`
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,.08)">
      ${portrait?`<img src="${portrait}" style="width:42px;height:42px;border-radius:50%;object-fit:cover;border:2px solid var(--cp);flex-shrink:0">`:`<div style="width:42px;height:42px;border-radius:50%;background:var(--surface2);border:2px solid var(--cp);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">${pp.avatar||'⚔'}</div>`}
      <div style="flex:1;min-width:0">
        <div style="font-size:14px;font-weight:700;color:${isOwn?'var(--cp)':'var(--text)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(p.charName||pp.playerName||'?')}</div>
        <div style="font-size:10px;color:var(--text3)">${isOwn?'Moi':esc(pp.playerName||'')}</div>
      </div>
      <button onclick="_hideHudDetail();_updatePartyHUD()" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:14px;padding:0 4px;flex-shrink:0">✕</button>
    </div>
    ${subLine?`<div style="font-size:11px;color:var(--text3);margin-bottom:6px">${esc(subLine)}</div>`:''}
    ${!isOwn?`<div style="font-size:11px;color:var(--text3);margin-bottom:6px">Joueur : ${esc(pp.playerName||'')}</div>`:''}
    <div class="pm-combat-badge ${combatActive?'pm-combat-active':'pm-combat-inactive'}" style="margin-bottom:10px">
      ${combatActive?(isActiveTurn?'⚔ Son tour':'⚔ En combat'):'🏳 Hors combat'}
    </div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:${(p.shieldHp||0)>0?'4':'8'}px">
      <div style="flex:1"><div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3);margin-bottom:3px"><span>PV</span><span style="font-weight:700;color:${down?'#e53935':hpColor}">${dead?'💀':down?'⚠ À terre':hp+'/'+hpMax}</span></div><div style="height:7px;background:var(--surface2);border-radius:4px;overflow:hidden"><div style="height:100%;width:${hpPct}%;background:${hpColor};border-radius:4px"></div></div></div>
      ${p.ac?`<div style="text-align:center;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:4px 10px;flex-shrink:0"><div style="font-size:8px;color:var(--text3)">CA</div><div style="font-size:16px;font-weight:700">${p.ac}</div></div>`:''}
    </div>
    ${(p.shieldHp||0)>0?`<div style="margin-bottom:8px;padding:4px 6px;background:rgba(33,150,243,.08);border:1px solid rgba(33,150,243,.25);border-radius:6px"><div style="display:flex;justify-content:space-between;font-size:9px;color:#42a5f5;margin-bottom:2px"><span>🔵 Bouclier magique</span><span style="font-weight:700">${p.shieldHp}/${p.shieldHpMax||p.shieldHp}</span></div><div style="height:4px;background:rgba(33,150,243,.15);border-radius:2px;overflow:hidden"><div style="height:100%;width:${Math.round((p.shieldHp/Math.max(1,p.shieldHpMax||p.shieldHp))*100)}%;background:#1565c0;border-radius:2px"></div></div></div>`:''}
    ${conds.length?`<div style="font-size:11px;color:var(--text2);margin-bottom:8px">${conds.join(' ')}</div>`:''}
    ${chargesHtml?`<div style="margin-bottom:8px">${chargesHtml}</div>`:''}
    ${statsHtml?`<details style="margin-bottom:10px"><summary style="font-size:10px;color:var(--text3);cursor:pointer;list-style:none;display:flex;align-items:center;gap:3px"><span>▶</span> Caractéristiques</summary><div style="display:grid;grid-template-columns:repeat(6,1fr);gap:3px;margin-top:6px">${statsHtml}</div></details>`:''}
    <button onclick="${isOwn?`enterCampaign('${currentTableId}','${currentCampaignId}')`:`_partyMemberClick('${uid}')`}" style="width:100%;background:none;border:1px solid rgba(200,168,75,.3);border-radius:8px;color:var(--cp);cursor:pointer;font-size:12px;padding:7px 0;font-weight:600">📋 ${isOwn?'Ma fiche':'Voir la fiche'}</button>`;

  if(onCharSheet){
    // Petit panneau flottant à côté du HUD
    document.getElementById('hudDetailOverlay')?.remove();
    let el=document.getElementById('hudDetailPopup');
    if(!el){el=document.createElement('div');el.id='hudDetailPopup';document.body.appendChild(el);}
    el.style.cssText='position:fixed;z-index:851;background:rgba(10,7,3,.96);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(200,168,75,.3);border-radius:12px;padding:12px 14px;width:260px;max-height:80vh;overflow-y:auto;box-shadow:0 8px 28px rgba(0,0,0,.7)';
    el.innerHTML=innerHtml;
    const hudPanel=document.getElementById('partyHudPanel');
    if(hudPanel){const r=hudPanel.getBoundingClientRect();if(r.right+276<window.innerWidth){el.style.left=(r.right+8)+'px';el.style.bottom=(window.innerHeight-r.bottom)+'px';}else{el.style.left=Math.max(8,r.left)+'px';el.style.bottom=(window.innerHeight-r.top+8)+'px';}el.style.top='auto';}
  } else {
    // Overlay plein écran (hub, mode groupe seul, écran MJ)
    let overlay=document.getElementById('hudDetailOverlay');
    if(!overlay){
      overlay=document.createElement('div');
      overlay.id='hudDetailOverlay';
      overlay.style.cssText='position:fixed;inset:0;z-index:1050;background:rgba(0,0,0,.72);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)';
      overlay.addEventListener('click',e=>{if(e.target===overlay){_hideHudDetail();_updatePartyHUD();}});
      document.body.appendChild(overlay);
    }
    let el=document.getElementById('hudDetailPopup');
    if(!el){el=document.createElement('div');el.id='hudDetailPopup';overlay.appendChild(el);}
    el.style.cssText='position:fixed;z-index:1051;background:var(--bg);border:1px solid rgba(200,168,75,.3);border-radius:14px;padding:16px 18px;width:min(320px,calc(100vw - 32px));max-height:80vh;overflow-y:auto;box-shadow:0 12px 40px rgba(0,0,0,.8)';
    el.innerHTML=innerHtml;
    // Positionné à droite du HUD ou centré si pas assez de place
    const hudPanel=document.getElementById('partyHudPanel');
    if(hudPanel){const r=hudPanel.getBoundingClientRect();if(r.right+336<window.innerWidth){el.style.left=(r.right+12)+'px';el.style.bottom=(window.innerHeight-r.bottom)+'px';}else{el.style.left='50%';el.style.transform='translateX(-50%)';el.style.bottom='90px';}el.style.top='auto';}
  }
}
