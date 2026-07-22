function genCode(){return Math.random().toString(36).slice(2,8).toUpperCase();}
let _hubCache=null;

async function toggleCampExpand(tableId,campId){
  const key=tableId+'_'+campId;
  _expandedCamp=(_expandedCamp===key)?null:key;
  // Recharge le hub HTML sans refaire les requêtes Firestore (utilise le cache)
  if(_hubCache){
    // Charger les infos de personnage si pas encore fait
    if(_expandedCamp){
      for(const t of _hubCache){
        if(t.id===tableId){
          if(!t._charInfos) t._charInfos={};
          if(!t._campParticipants) t._campParticipants={};
          if(t._charInfos[campId]===undefined){
            try{
              const ref=fbDb.collection('characters').doc(currentUser.uid+'_'+campId);
              const doc=await ref.get();
              if(doc.exists){
                const d=doc.data().characterData||{};
                t._charInfos[campId]={charName:d.charName||'?',charClass:(d.classes||[]).map(c=>c.name+' '+c.level).join('/')};
              }else{t._charInfos[campId]=null;}
            }catch(e){t._charInfos[campId]=null;}
          }
          // Charge tous les participants de la campagne
          if(!t._campParticipants[campId]){
            try{
              const charsSnap=await fbDb.collection('characters').where('campaignId','==',campId).get();
              const participants=[];
              for(const cdoc of charsSnap.docs){
                if(cdoc.id.endsWith('_mj'))continue;
                const cdata=cdoc.data();
                if(cdata.userId===t.mjId)continue;
                if(cdata.ejectedFromCampaign||cdata.leftCampaign)continue;
                const charData=cdata.characterData||{};
                const priv=charData.privacy||{name:true,hp:true,abilities:false,notes:false};
                const uid=cdata.userId;
                let playerName='Joueur';let playerAvatar='⚔';
                try{const udoc=await fbDb.collection('users').doc(uid).get();if(udoc.exists){const u=udoc.data();playerName=u.displayName||'Joueur';playerAvatar=u.avatar||'⚔';}}catch(e){}
                participants.push({uid,playerName,playerAvatar:playerAvatar,charName:priv.name!==false?charData.charName||'?':'???',charClass:priv.name!==false?(charData.classes||[]).map(c=>c.name+' '+c.level).join('/'):'',avatar:playerAvatar,priv,fullData:charData});
              }
              t._campParticipants[campId]=participants;
            }catch(e){t._campParticipants[campId]=[];}
          }
          break;
        }
      }
    }
    document.getElementById('hubContent').innerHTML=renderHubHTML(_hubCache);
  }else{await renderHub();}
}

async function renderHub(){
  const hub=document.getElementById('hubContent');
  if(!hub)return;
  hub.innerHTML='<div class="hub-empty"><span class="auth-spinner"></span> Chargement...</div>';
  try{
    let tables=[];
    const snap=await fbDb.collection('tables').where('memberIds','array-contains',currentUser.uid).get();
    tables=snap.docs.map(d=>({id:d.id,...d.data()}));
    const tablesWithCamps=await Promise.all(tables.map(async t=>{
      const cs=await fbDb.collection('campaigns').where('tableId','==',t.id).orderBy('createdAt','desc').get();
      return{...t,campaigns:cs.docs.map(d=>({id:d.id,...d.data()}))};
    }));
    // Récupère les noms/avatars manquants pour les anciens membres
    for(const t of tablesWithCamps){
      const memberNames=t.memberNames||{};
      const missingUids=(t.memberIds||[]).filter(uid=>!memberNames[uid]);
      for(const uid of missingUids){
        try{
          const udoc=await fbDb.collection('users').doc(uid).get();
          if(udoc.exists){
            const d=udoc.data();
            if(!t.memberNames)t.memberNames={};
            if(!t.memberAvatars)t.memberAvatars={};
            t.memberNames[uid]=d.displayName||'Joueur';
            t.memberAvatars[uid]=d.avatar||'⚔';
          }
        }catch(e){}
      }
    }
    // MIGRATION AUTOMATIQUE — les tables créées avant l'index des codes n'ont
    // pas leur document 'inviteCodes/{CODE}'. Le MJ le recrée en arrivant au Hub
    // (lui seul en a le droit). Sans ça, leur code deviendrait inutilisable.
    for(const t of tablesWithCamps){
      if(t.mjId===currentUser.uid&&t.inviteCode){
        campaignService.registerInviteCode(t.inviteCode,t.id,currentUser.uid).catch(()=>{});
      }
    }
    _hubCache=tablesWithCamps;
    const mjBadge=document.getElementById('hubMJBadge');
    if(mjBadge) mjBadge.style.display='none';
    hub.innerHTML=renderHubHTML(tablesWithCamps);
    const params=new URLSearchParams(window.location.search);
    const joinCode=params.get('join');
    if(joinCode) setTimeout(()=>promptJoinTable(joinCode),300);
  }catch(e){hub.innerHTML=`<div style="color:var(--danger);padding:16px">Erreur: ${e.message}</div>`;}
}

function campImgOnLoad(img){
  if(img.naturalHeight>img.naturalWidth){
    img.style.cssText='float:right;width:38%;max-width:130px;border-radius:2px;object-fit:cover;margin:0 0 8px 10px;display:block';
  }else{
    img.style.cssText='width:100%;max-height:200px;border-radius:2px;object-fit:cover;margin-bottom:10px;display:block';
  }
}
let _hubSelectedTableId=null, _hubMobileDetail=false;
function _hubRerender(){ const el=document.getElementById('hubContent'); if(el&&_hubCache) el.innerHTML=renderHubHTML(_hubCache); }
function hubSelectTable(id){ _hubSelectedTableId=id; _hubMobileDetail=true; _hubRerender(); } // mobile : bascule sur le détail
function hubBackToTables(){ _hubMobileDetail=false; _hubRerender(); } // mobile : revient à la liste

// Carte de campagne — design-system (logique d'origine INTACTE ; bouton Chroniques RETIRÉ → page Groupe, P3)
function _hubCampCardHTML(t,c,isMJ){
      const key=t.id+'_'+c.id;
      const expanded=_expandedCamp===key;
      let expandedHtml='';
      if(expanded){
        const charInfo=t._charInfos&&t._charInfos[c.id];
        const imgHtml=c.imageUrl?`<img src="${esc(c.imageUrl)}" style="width:100%;max-height:200px;object-fit:cover;margin-bottom:10px;display:block;border:1px solid var(--ds-line)" onload="campImgOnLoad(this)" onerror="this.style.display='none'">`:'';
        const campParticipants=t._campParticipants&&t._campParticipants[c.id]||[];
        const participantHtml=campParticipants.length?`<div style="margin-top:10px"><div class="ds-seclbl" style="margin-bottom:6px">Personnages</div>
          ${campParticipants.map(pp=>{
            const isMe=pp.uid===currentUser.uid;
            const fd=pp.fullData||{};
            const pPortrait=fd.portrait||fd.equipPortrait;
            return`<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--ds-card2);border:1px solid var(--ds-line-soft);margin-bottom:4px">
              ${pPortrait
                ?`<img src="${pPortrait}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;border:1.5px solid ${isMe?'var(--ds-acc-strong)':'var(--ds-line)'};flex-shrink:0">`
                :`<div style="width:30px;height:30px;border-radius:50%;background:var(--ds-card);border:1.5px solid ${isMe?'var(--ds-acc-strong)':'var(--ds-line)'};display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">${pp.avatar||'⚔'}</div>`}
              <div style="flex:1;min-width:0">
                <div style="display:flex;align-items:center;gap:4px">
                  <span style="font-size:12px;font-weight:600;color:${isMe?'var(--ds-acc-strong)':'var(--ds-ink)'}">${esc(pp.charName||'?')}</span>
                  <span class="ds-note" style="font-size:12px">${isMe?'Moi':esc(pp.playerName||'')}</span>
                </div>
                <div class="ds-note">${esc(pp.charClass||'')}</div>
              </div>
              ${isMJ
                ?`<button class="ds-btn quiet" style="color:var(--ds-seal);border-color:var(--ds-seal);flex-shrink:0;min-height:30px;padding:2px 8px" onclick="hubKickConfirm('${t.id}','${pp.uid}','${jsq(pp.playerName||'ce joueur')}')">✕</button>`
                :`<button class="ds-btn quiet" style="flex-shrink:0;min-height:30px;padding:2px 8px" title="${isMe?'Ouvrir ma fiche':'Voir la fiche'}" onclick="${isMe?`enterCampaign('${t.id}','${c.id}')`:`openHubPlayerSheet('${pp.uid}','${c.id}')`}">📋</button>`}
            </div>`;
          }).join('')}
        </div>`:'';
        const charBlock=isMJ
          ?`<button class="ds-btn primary" style="width:100%;margin-top:8px" onclick="enterCampaign('${t.id}','${c.id}')">👑 Gérer la campagne</button>`
          :(charInfo&&!charInfo.leftCampaign
            ?`<div style="margin-top:8px">
                <div style="display:flex;align-items:center;gap:6px;padding:8px;background:var(--ds-card2);border:1px solid var(--ds-line);border-bottom:none">
                  <span style="font-size:18px">${currentUserData&&currentUserData.avatar||'⚔'}</span>
                  <div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:600">${esc(charInfo.charName||'?')}</div><div class="ds-note">${esc(charInfo.charClass||'')}</div></div>
                  <button class="ds-btn quiet" style="color:var(--ds-seal);border-color:var(--ds-seal);flex-shrink:0;min-height:32px;padding:3px 9px" onclick="playerLeaveCharacter('${c.id}')">✕ Quitter</button>
                </div>
                ${(()=>{const cur=_dsCurrentGame();return (cur&&cur.campaignId===c.id)?_dsInGameBadge()
                  :`<button class="ds-btn primary" style="width:100%" onclick="joinGroupOnly('${t.id}','${c.id}')">👥 Rejoindre le groupe</button>`;})()}
              </div>`
            :(charInfo&&charInfo.leftCampaign
              ?`<div style="margin-top:8px">
                  <div style="display:flex;align-items:center;gap:6px;padding:8px;background:var(--ds-card2);border:1px solid var(--ds-line);border-bottom:none">
                    <span style="font-size:18px;opacity:.5">${currentUserData&&currentUserData.avatar||'⚔'}</span>
                    <div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:600;color:var(--ds-soft)">${esc(charInfo.charName||'?')}</div><div class="ds-note">Inactif — vous avez quitté cette campagne</div></div>
                  </div>
                  <div style="display:flex;gap:6px">
                    <button class="ds-btn primary" style="flex:2" onclick="playerRejoinCampaign('${c.id}')">↩ Rejoindre</button>
                    <button class="ds-btn quiet" style="flex:1;color:var(--ds-seal);border-color:var(--ds-seal)" onclick="deleteCharFromLib('${c.id}')">🗑</button>
                  </div>
                </div>`
              :`<button class="ds-btn primary" style="width:100%;margin-top:8px" onclick="openCharOrCreate('${t.id}','${c.id}')">＋ Créer mon personnage</button>`));
        const mjEditHtml=isMJ?`
          <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">
            <button class="ds-btn quiet" onclick="openEditCampaign('${t.id}','${c.id}')">✏ Modifier</button>
          </div>`:'';
        expandedHtml=`<div style="padding:10px 12px;border:1px solid var(--ds-line);border-top:none;background:var(--ds-card)">${imgHtml}
          ${c.detailedDesc?`<p style="font-size:12px;color:var(--ds-ink);line-height:1.65;margin:0 0 8px">${esc(c.detailedDesc)}</p>`:''}
          <div style="clear:both"></div>
          ${charBlock}${participantHtml}${mjEditHtml}
        </div>`;
      }
      return`<div style="margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--ds-card);border:1px solid var(--ds-line);cursor:pointer" onclick="toggleCampExpand('${t.id}','${c.id}')">
          ${c.imageUrl?`<img src="${esc(c.imageUrl)}" style="width:44px;height:44px;object-fit:cover;border:1px solid var(--ds-line);flex-shrink:0" onerror="this.style.display='none'">`:`<div style="width:44px;height:44px;background:var(--ds-card2);border:1px solid var(--ds-line);display:grid;place-items:center;font-size:15px;flex-shrink:0">⚔</div>`}
          <div style="flex:1;min-width:0"><div style="font-family:var(--ds-disp);font-size:15.5px;font-weight:700;color:var(--ds-ink)">${esc(c.name)}</div>
            ${c.description?`<div class="ds-note" style="margin-top:2px">${esc(c.description)}</div>`:''}
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="ds-chip ${c.status==='finished'?'':'good'}" style="font-size:11px">${c.status==='finished'?'Terminée':'Active'}</span>
            <span style="color:var(--ds-acc-strong);transition:transform .2s;${expanded?'transform:rotate(90deg)':''}">›</span>
          </div>
        </div>${expandedHtml}</div>`;
}

// « Partie en cours » (lot A7, 2026-07-22) — s'appuie sur la mémoire de session du lot 0.
// Une partie est EN COURS tant que la table+campagne sont mémorisées, même quand on remonte
// au Hub (showHub n'écrase que `mode`). C'est ce qui remplace les boutons Reprendre / Rejoindre.
function _dsCurrentGame(){
  const s=(typeof loadSessionState==='function')?loadSessionState():null;
  return (s&&s.tableId&&s.campaignId)?s:null;
}
function _dsInGameBadge(){
  return`<div class="ds-ingame" style="width:100%;margin-top:8px;display:flex;align-items:center;justify-content:center;gap:7px;
    padding:8px 10px;border:1px solid var(--ds-acc-strong);background:var(--ds-card2);
    font-family:var(--ds-disp);font-size:12px;letter-spacing:.06em;color:var(--ds-acc-strong)">
    <span class="ds-livedot" style="width:8px;height:8px;border-radius:50%;background:var(--ds-acc-strong);flex:none"></span>Partie en cours</div>`;
}
// Carte de table (rail) — illustration + catégorie code couleur + « Reprendre » direct (P1 validée)
function _dsTableCardHTML(t,selected){
  const isMJ=t.mjId===currentUser.uid;
  const n=(t.campaigns||[]).length;
  const thumb=(t.campaigns||[]).map(c=>c.imageUrl).find(Boolean);
  const lastId=localStorage.getItem('lastCamp_'+t.id);
  const last=(t.campaigns||[]).find(c=>c.id===lastId)||(t.campaigns||[]).find(c=>c.status!=='finished');
  const cur=_dsCurrentGame();
  const resume=(cur&&cur.tableId===t.id)?_dsInGameBadge()
    :last?`<button class="ds-btn primary" style="width:100%;margin-top:8px" onclick="event.stopPropagation();hubResumeTable('${t.id}')">${isMJ?'👑 Ouvrir':'▶ Reprendre'} — ${esc(last.name)}</button>`:'';
  return`<div class="ds-tablecard${isMJ?' mj':''}${selected?' sel':''}" onclick="hubSelectTable('${t.id}')">
    <div class="art">${isMJ?'🏰':'⚔'}${thumb?`<img src="${esc(thumb)}" onerror="this.remove()">`:''}</div>
    <div class="bd">
      <div style="display:flex;align-items:center;gap:8px">
        <div style="flex:1;min-width:0">
          <div style="font-family:var(--ds-disp);font-size:12.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(t.name)}</div>
          <div class="ds-note">${isMJ?'Maître de jeu':'Joueur'} · ${n} campagne${n>1?'s':''}${!isMJ&&t.mjName?` · MJ : ${esc(t.mjName)}`:''}</div>
        </div>
        ${isMJ?`<button class="ds-btn quiet" style="min-height:34px;padding:4px 10px" title="Réglages de la table" onclick="event.stopPropagation();openTableSettings('${t.id}','${jsq(t.name)}','${t.inviteCode}')">⚙</button>`:''}
      </div>
      ${resume}
    </div>
  </div>`;
}
// « Reprendre » : ouvre DIRECTEMENT la dernière campagne jouée de la table (fallback : détail).
function hubResumeTable(tableId){
  const t=_hubCache&&_hubCache.find(x=>x.id===tableId);
  if(!t){hubSelectTable(tableId);return;}
  const lastId=localStorage.getItem('lastCamp_'+tableId);
  const c=(t.campaigns||[]).find(x=>x.id===lastId)||(t.campaigns||[]).find(x=>x.status!=='finished')||(t.campaigns||[])[0];
  if(c)enterCampaign(tableId,c.id);
  else hubSelectTable(tableId);
}

// Panneau de détail (table sélectionnée) — réutilise _hubCampCardHTML
function _hubTableDetailHTML(t){
  if(!t) return`<div class="ds-note" style="padding:30px;text-align:center">Sélectionne une table, ou crées-en une.</div>`;
  const isMJ=t.mjId===currentUser.uid;
  const memberAvatars=t.memberAvatars||{},memberNames=t.memberNames||{};
  const players=(t.memberIds||[]).filter(uid=>uid!==t.mjId);
  const memberBadges=players.map(uid=>`<span class="ds-chip">${memberAvatars[uid]||'⚔'} ${esc(memberNames[uid]||'Joueur')}</span>`).join('');
  const campList=(t.campaigns||[]).length?t.campaigns.map(c=>_hubCampCardHTML(t,c,isMJ)).join(''):`<div class="ds-note" style="font-style:italic;padding:6px 0">Aucune campagne pour l'instant.</div>`;
  const art=(t.campaigns||[]).map(c=>c.imageUrl).find(Boolean);
  // Étape D — paquets requis par la table que CE joueur ne possède pas encore
  const _missing=(!isMJ&&typeof COMP!=='undefined'&&typeof compTableRequiredPacks==='function')?(COMP.missingPacks(compTableRequiredPacks(t))||[]):[];
  return`
    <div class="ds-card" style="padding:0;overflow:hidden;margin-bottom:12px">
      <div class="ds-artband" style="height:${art?'110px':'56px'};background:linear-gradient(120deg,var(--ds-leather2),color-mix(in srgb,${isMJ?'var(--ds-good)':'var(--ds-acc)'} 40%,var(--ds-leather2)))">${isMJ?'🏰':'⚔'}${art?`<img src="${esc(art)}" onerror="this.remove()">`:''}</div>
      <div style="padding:10px 14px 12px">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span style="font-family:var(--ds-disp);font-size:14px;font-weight:700">${esc(t.name)}</span>
          <span class="ds-chip ${isMJ?'good':''}">${isMJ?'👑 MJ':'🧙 Joueur'}</span>
          ${isMJ?`<button class="ds-btn quiet" style="margin-left:auto;min-height:34px;padding:4px 10px" onclick="openTableSettings('${t.id}','${jsq(t.name)}','${t.inviteCode}')">⚙ Réglages</button>`:''}
        </div>
        <div class="ds-note" style="margin-top:4px">MJ : ${t.mjAvatar||'🎲'} ${esc(t.mjName||'MJ')}${players.length?` · ${players.length} joueur${players.length>1?'s':''}`:''}</div>
        ${memberBadges?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:8px">${memberBadges}</div>`:''}
      </div>
    </div>
    ${_missing.length?`<div class="ds-card" style="border-color:var(--ds-seal);margin-bottom:12px">
      <div style="font-size:12px;color:var(--ds-seal);font-weight:700">⚠ Compendium(s) requis manquant(s)</div>
      <div class="ds-note" style="margin-top:4px">Cette table utilise des paquets que tu n'as pas encore importés : ${_missing.map(id=>`<strong>${esc(id)}</strong>`).join(', ')}. Demande le fichier à ton MJ, puis importe-le.</div>
      <button class="ds-btn primary" style="margin-top:8px" onclick="importCompPack()">📥 Importer un paquet</button>
    </div>`:''}
    <div class="ds-title">📜 Campagnes ${isMJ?`<button class="ds-btn primary" style="min-height:34px;padding:4px 12px" onclick="openCreateCampaign('${t.id}')">＋ Nouvelle</button>`:''}</div>
    ${campList}
    ${!isMJ?`<div style="margin-top:18px;text-align:center">
      <button class="ds-btn quiet" style="color:var(--ds-seal);border-color:var(--ds-seal);min-height:32px;padding:4px 12px" onclick="promptLeaveTable('${t.id}')">🚪 Quitter la table</button>
    </div>`:''}`;
}
// ─── QUITTER UNE TABLE (joueur) — lot B, 2026-07-23 ───
// Le joueur est retiré de la table (donc de TOUTES ses campagnes d'un coup), mais ses
// personnages RESTENT dans « Mes personnages » du profil (décision utilisateur). On ne
// touche donc NI aux fiches `characters/<uid>_<camp>`, NI à `charLib`. Le MJ ne peut pas
// quitter sa propre table (il la supprime) — le bouton ne s'affiche pas pour lui.
function promptLeaveTable(tableId){
  const t=_hubCache&&_hubCache.find(x=>x.id===tableId);
  if(!t){showToast('❌ Table introuvable.');return;}
  const nbCamp=(t.campaigns||[]).length;
  window._pendingLeaveTable=tableId;
  openModal(`<div class="pt" style="color:var(--danger)">Quitter « ${esc(t.name)} » ?</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:16px">Tu seras retiré de la table${nbCamp?` et de ses <b>${nbCamp} campagne${nbCamp>1?'s':''}</b>`:''}. Tes personnages <b>restent dans « Mes personnages »</b> : tu les retrouves si tu es réinvité.</div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn" style="flex:2;color:var(--danger);border-color:rgba(229,57,53,.5)" onclick="confirmLeaveTable()">🚪 Quitter la table</button>
    </div>`);
}
async function confirmLeaveTable(){
  const tableId=window._pendingLeaveTable;
  if(!tableId||!currentUser)return;
  closeModal();
  const t=_hubCache&&_hubCache.find(x=>x.id===tableId);
  if(!t)return;
  try{
    // Update AUTORISÉ par les règles : ne touche QUE memberIds/Names/Avatars, en se retirant SOI-MÊME.
    const upd={memberIds:(t.memberIds||[]).filter(u=>u!==currentUser.uid)};
    upd['memberNames.'+currentUser.uid]=firebase.firestore.FieldValue.delete();
    upd['memberAvatars.'+currentUser.uid]=firebase.firestore.FieldValue.delete();
    await fbDb.collection('tables').doc(tableId).update(upd);
    // Si la partie en cours était sur cette table, on efface la mémoire de session (sinon F5 tenterait d'y revenir).
    const _s=(typeof loadSessionState==='function')?loadSessionState():null;
    if(_s&&_s.tableId===tableId&&typeof clearSessionState==='function')clearSessionState();
    if(_hubCache)_hubCache=_hubCache.filter(x=>x.id!==tableId);
    _hubSelectedTableId=null;
    showToast('✅ Tu as quitté la table. Tes personnages sont conservés.');
    renderHub();
  }catch(e){showToast('❌ Une erreur est survenue, réessaie.');}
}

function renderHubHTML(tables){
  // Premier lancement : hero « Prêt pour l'aventure ? » (P1 validée)
  if(!tables||!tables.length) return`<div class="ds-hub-hero">
    <div class="ey">La Boîte à Outils</div>
    <h2>Prêt pour l'aventure ?</h2>
    <div class="ds-note" style="max-width:42ch">Rejoins tes compagnons avec un code d'invitation, ou crée ta propre table et deviens Maître de Jeu.</div>
    <button class="ds-btn primary" onclick="openCreateTable()">＋ Créer une table</button>
    <button class="ds-btn" onclick="openJoinTable()">🚪 Rejoindre une table</button>
  </div>`;
  // A7 : à défaut de sélection explicite, on ouvre la table de la PARTIE EN COURS
  // (et non la première de la liste) — cohérent avec la campagne laissée dépliée.
  if(!_hubSelectedTableId||!tables.find(t=>t.id===_hubSelectedTableId)){
    const _cur=_dsCurrentGame();
    _hubSelectedTableId=(_cur&&tables.find(t=>t.id===_cur.tableId))?_cur.tableId:tables[0].id;
  }
  const sel=tables.find(t=>t.id===_hubSelectedTableId);
  const mine=tables.filter(t=>t.mjId===currentUser.uid);
  const others=tables.filter(t=>t.mjId!==currentUser.uid);
  const sec=(lbl,cls,arr)=>arr.length?`<div class="ds-seclbl ${cls}" style="margin:12px 0 8px">${lbl}</div>${arr.map(t=>_dsTableCardHTML(t,t.id===_hubSelectedTableId)).join('')}`:'';
  return`<div class="hub-2col${_hubMobileDetail?' show-detail':''}">
    <div class="hub-rail">
      <div class="ds-title">Mes tables <span class="r">${tables.length}</span></div>
      ${sec('🧙 Joueur','',others)}
      ${sec('👑 Maître de jeu','mj',mine)}
      <div style="display:flex;gap:8px;margin-top:12px">
        <button class="ds-btn" style="flex:1" onclick="openCreateTable()">＋ Créer</button>
        <button class="ds-btn" style="flex:1" onclick="openJoinTable()">🚪 Rejoindre</button>
      </div>
    </div>
    <div class="hub-detail">
      <button class="ds-btn quiet hub-back" onclick="hubBackToTables()">← Mes tables</button>
      ${_hubTableDetailHTML(sel)}
    </div>
  </div>`;
}

// ─── CRÉER UNE TABLE (MJ) ───
function openCreateTable(){
  if(typeof compSetTableEditContext==='function')compSetTableEditContext(null); // mode création : pas d'auto-save
  // Sélection par défaut : le contenu actuel (paquet « legacy ») sur toutes les catégories — non régressif.
  const defaultSel = typeof compTableRequiredPacks==='function' ? compTableRequiredPacks(null) : {};
  const selectorHtml = typeof compTableSelectorHtml==='function' ? compTableSelectorHtml(defaultSel) : '';
  openModal(`<div class="pt">🎲 Nouvelle table</div>
    <div class="fl mb6">Nom de la table</div>
    <input class="fi" id="newTableName" placeholder="Ex: Table du vendredi" style="margin-bottom:14px">
    <details class="acc" style="margin-bottom:12px">
      <summary>🧩 Compendiums de la table</summary>
      <div class="acc-body">
        <div style="font-size:13px;color:var(--text3);margin-bottom:8px">Choisis les paquets (et catégories) que cette table utilise. Tes joueurs devront posséder ces paquets.</div>
        <div id="tbl_pack_selector">${selectorHtml}</div>
      </div>
    </details>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="confirmCreateTable()">✓ Créer</button>
    </div>`);
  setTimeout(()=>{const i=document.getElementById('newTableName');if(i)i.focus();},50);
}
async function confirmCreateTable(){
  const name=document.getElementById('newTableName').value.trim();
  if(!name){showToast('❌ Donnez un nom à la table.');return;}
  const requiredPacks = typeof compReadTableSelection==='function' ? compReadTableSelection() : {};
  const inviteCode=genCode();
  try{
    const ref=await fbDb.collection('tables').add({
      name,mjId:currentUser.uid,mjName:currentUserData.displayName,mjAvatar:currentUserData.avatar||'🎲',
      inviteCode,memberIds:[currentUser.uid],
      memberNames:{[currentUser.uid]:currentUserData.displayName},
      memberAvatars:{[currentUser.uid]:currentUserData.avatar||'🎲'},
      requiredPacks,
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    // Index du code d'invitation (seule porte d'entrée publique — cf. campaign-service)
    await campaignService.registerInviteCode(inviteCode,ref.id,currentUser.uid);
    closeModal();showToast('✅ Table "'+name+'" créée !');renderHub();
  }catch(e){showToast('❌ Une erreur est survenue, réessaie.');}
}

// ─── CRÉER UNE CAMPAGNE (MJ) ───
function openCreateCampaign(tableId){
  openModal(`<div class="pt">⚔ Nouvelle campagne</div>
    <div class="fl mb6">Nom de la campagne</div>
    <input class="fi" id="newCampName" placeholder="Ex: La Mine Perdue" style="margin-bottom:10px">
    <div class="fl mb6">Description (optionnel)</div>
    <input class="fi" id="newCampDesc" placeholder="Courte description..." style="margin-bottom:16px">
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="confirmCreateCampaign('${tableId}')">✓ Créer</button>
    </div>`);
}
async function confirmCreateCampaign(tableId){
  const name=document.getElementById('newCampName').value.trim();
  const desc=document.getElementById('newCampDesc').value.trim();
  if(!name){showToast('❌ Donnez un nom à la campagne.');return;}
  try{
    await fbDb.collection('campaigns').add({
      tableId,name,description:desc,status:'active',
      ownerId:currentUser.uid,
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    closeModal();showToast('✅ Campagne "'+name+'" créée !');renderHub();
  }catch(e){showToast('❌ Une erreur est survenue, réessaie.');}
}

// ─── PARAMÈTRES TABLE (MJ) ───
function openTableSettings(tableId,tableName,inviteCode){
  const tableData=(typeof _hubCache!=='undefined'&&_hubCache)?_hubCache.find(t=>t.id===tableId):null;
  const sel=typeof compTableRequiredPacks==='function'?compTableRequiredPacks(tableData):{};
  const selectorHtml=typeof compTableSelectorHtml==='function'?compTableSelectorHtml(sel):'';
  if(typeof compSetTableEditContext==='function')compSetTableEditContext(tableId); // mode édition : auto-save à chaque changement
  openModal(`<div class="pt">⚙ Table : ${esc(tableName)}</div>
    <div class="fl mb6" style="margin-top:0">Lien d'invitation</div>
    <div class="invite-box" style="margin-bottom:16px">Code : <span class="invite-code">${inviteCode}</span><button class="btn bsm" onclick="copyCode('${inviteCode}')" style="margin-left:4px">📋 Copier le code</button><button class="btn bsm" onclick="copyInviteLink('${inviteCode}')" style="margin-left:4px">🔗 Lien</button></div>
    <details class="acc" style="margin-bottom:16px" open>
      <summary>🧩 Compendiums de la table</summary>
      <div class="acc-body">
        <div style="font-size:13px;color:var(--text3);margin-bottom:8px">Paquets (et catégories) utilisés par cette table. Tes joueurs doivent les posséder. <em>Enregistrement automatique.</em></div>
        <div id="tbl_pack_selector">${selectorHtml}</div>
      </div>
    </details>
    <div style="display:flex;gap:8px">
      <button class="btn bdanger" style="flex:1" onclick="confirmDeleteTable('${tableId}')">🗑 Supprimer la table</button>
    </div>`);
}
async function saveTableCompendiums(tableId, auto){
  const requiredPacks=typeof compReadTableSelection==='function'?compReadTableSelection():{};
  try{
    await campaignService.updateTable(tableId,{requiredPacks});
    if(typeof _hubCache!=='undefined'&&_hubCache){const t=_hubCache.find(x=>x.id===tableId);if(t)t.requiredPacks=requiredPacks;}
    // si on est actuellement dans cette table, ré-applique tout de suite
    if(typeof currentTableId!=='undefined'&&currentTableId===tableId&&typeof COMP!=='undefined')COMP.applyTableSelection(requiredPacks);
    showToast(auto?'💾 Enregistré':'✅ Compendiums de la table enregistrés.');
  }catch(e){showToast('❌ Une erreur est survenue, réessaie.');}
}
async function confirmDeleteTable(tableId){
  if(!confirm('Supprimer cette table et toutes ses campagnes ? Cette action est irréversible.'))return;
  try{
    const camps=await fbDb.collection('campaigns').where('tableId','==',tableId).get();
    const batch=fbDb.batch();
    camps.docs.forEach(d=>batch.delete(d.ref));
    batch.delete(fbDb.collection('tables').doc(tableId));
    await batch.commit();
    closeModal();showToast('🗑 Table supprimée.');renderHub();
  }catch(e){showToast('❌ Une erreur est survenue, réessaie.');}
}

// ─── MODIFIER UNE CAMPAGNE (MJ) ───
function openEditCampaign(tableId,campId){
  const t=_hubCache&&_hubCache.find(t=>t.id===tableId);
  const c=t&&t.campaigns.find(c=>c.id===campId);
  if(!c)return;
  openModal(`<div class="pt">✏ Modifier : ${esc(c.name)}</div>
    <div class="fl mb6">Description courte</div>
    <input class="fi" id="editCampDesc" value="${esc(c.description||'')}" style="margin-bottom:10px">
    <div class="fl mb6">Description détaillée (ambiance, histoire...)</div>
    <textarea class="fi" id="editCampDetailedDesc" rows="4" style="resize:vertical;margin-bottom:10px">${esc(c.detailedDesc||'')}</textarea>
    <div class="fl mb6">Image (URL directe vers une image)</div>
    <input class="fi" id="editCampImg" value="${esc(c.imageUrl||'')}" placeholder="https://..." style="margin-bottom:16px">
    <div class="fl mb6">Statut</div>
    <div style="display:flex;gap:8px;margin-bottom:16px">
      <button class="btn${c.status!=='finished'?' bac':''}" onclick="this.dataset.v='active';document.querySelectorAll('.camp-status-opt').forEach(b=>b.className='btn camp-status-opt');this.className='btn bac camp-status-opt'" data-v="active">Active</button>
      <button class="btn camp-status-opt${c.status==='finished'?' bac':''}" onclick="this.dataset.v='finished'" data-v="finished">Terminée</button>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="saveEditCampaign('${tableId}','${campId}')">💾 Sauvegarder</button>
    </div>
    <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border)">
      <button class="btn" style="width:100%;color:var(--danger);border-color:rgba(229,57,53,.35)" onclick="openDeleteCampaign('${tableId}','${campId}')">🗑 Supprimer cette campagne</button>
    </div>`);
}
function openDeleteCampaign(tableId,campId){
  const t=_hubCache&&_hubCache.find(t=>t.id===tableId);
  const c=t&&t.campaigns.find(c=>c.id===campId);
  const campName=c?c.name:'cette campagne';
  openModal(`<div class="pt" style="color:var(--danger)">🗑 Supprimer la campagne ?</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:8px">Vous êtes sur le point de supprimer :</div>
    <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:12px;padding:8px 12px;background:rgba(229,57,53,.08);border:1px solid rgba(229,57,53,.3);border-radius:2px">${esc(campName)}</div>
    <div style="font-size:13px;color:var(--text3);margin-bottom:16px;line-height:1.6">Cette action supprimera définitivement la campagne ainsi que <b style="color:var(--text2)">tous les personnages</b> créés par les joueurs dans cette campagne. Elle est <b style="color:var(--danger)">irréversible</b>.</div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="openEditCampaign('${tableId}','${campId}')">← Retour</button>
      <button class="btn" style="flex:2;color:var(--danger);border-color:rgba(229,57,53,.5)" onclick="doDeleteCampaign('${tableId}','${campId}')">🗑 Confirmer la suppression</button>
    </div>`);
}
async function doDeleteCampaign(tableId,campId){
  closeModal();
  try{
    const charsSnap=await fbDb.collection('characters').where('campaignId','==',campId).get();
    const batch=fbDb.batch();
    const libCleanups=[];
    charsSnap.docs.forEach(d=>{
      const uid=d.data().userId;
      if(uid)libCleanups.push(fbDb.collection('users').doc(uid).update({['charLib.'+campId]:firebase.firestore.FieldValue.delete()}).catch(()=>{}));
      batch.delete(d.ref);
    });
    batch.delete(fbDb.collection('campaigns').doc(campId));
    await batch.commit();
    await Promise.all(libCleanups);
    if(_hubCache){const t=_hubCache.find(t=>t.id===tableId);if(t)t.campaigns=t.campaigns.filter(c=>c.id!==campId);}
    showToast('🗑 Campagne supprimée.');
    renderHub();
  }catch(e){showToast('❌ Une erreur est survenue, réessaie.');}
}

async function saveEditCampaign(tableId,campId){
  const desc=document.getElementById('editCampDesc').value.trim();
  const detailed=document.getElementById('editCampDetailedDesc').value.trim();
  const img=document.getElementById('editCampImg').value.trim();
  const statusBtns=document.querySelectorAll('.camp-status-opt');
  let status='active';
  statusBtns.forEach(b=>{if(b.classList.contains('bac'))status=b.dataset.v||'active';});
  try{
    await fbDb.collection('campaigns').doc(campId).update({description:desc,detailedDesc:detailed,imageUrl:img,status});
    // Mise à jour du cache local
    const t=_hubCache&&_hubCache.find(t=>t.id===tableId);
    if(t){const c=t.campaigns.find(c=>c.id===campId);if(c){c.description=desc;c.detailedDesc=detailed;c.imageUrl=img;c.status=status;}}
    closeModal();showToast('✅ Campagne mise à jour !');
    document.getElementById('hubContent').innerHTML=renderHubHTML(_hubCache);
  }catch(e){showToast('❌ Une erreur est survenue, réessaie.');}
}

// ─── REJOINDRE UNE TABLE (JOUEUR) ───
function openJoinTable(){
  openModal(`<div class="pt">🔗 Rejoindre une table</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:12px">Entrez le code d'invitation partagé par votre MJ.</div>
    <div class="fl mb6">Code d'invitation</div>
    <input class="fi" id="joinCode" placeholder="Ex: AB12CD" style="margin-bottom:16px;text-transform:uppercase;letter-spacing:.1em;font-size:16px;text-align:center">
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="confirmJoinTable()">Rejoindre →</button>
    </div>`);
}
async function promptJoinTable(code){
  openModal(`<div class="pt">🔗 Invitation reçue</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:16px">Vous avez été invité à rejoindre une table. Code : <strong style="color:var(--cp)">${esc(code)}</strong></div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Ignorer</button>
      <button class="btn bac" style="flex:2" onclick="doJoinTable('${jsq(code)}')">Rejoindre →</button>
    </div>`);
}
async function confirmJoinTable(){
  const code=(document.getElementById('joinCode').value||'').trim().toUpperCase();
  if(!code){showToast('❌ Entrez un code.');return;}
  await doJoinTable(code);
}
async function doJoinTable(code){
  try{
    // On résout le code via l'index dédié : la table elle-même n'est PAS
    // lisible tant qu'on n'en est pas membre (cf. règles Firestore).
    const idx=await campaignService.resolveInviteCode(code);
    if(!idx.exists){showToast('❌ Code invalide.');return;}
    const {tableId,mjId}=idx.data();
    if(mjId===currentUser.uid){showToast('Vous êtes déjà le MJ de cette table.');closeModal();return;}
    // Écriture « à l'aveugle » : arrayUnion est idempotent, et la règle
    // n'autorise à s'ajouter QUE soi-même.
    await fbDb.collection('tables').doc(tableId).update({
      memberIds:firebase.firestore.FieldValue.arrayUnion(currentUser.uid),
      ['memberNames.'+currentUser.uid]:currentUserData.displayName,
      ['memberAvatars.'+currentUser.uid]:currentUserData.avatar||'⚔'
    });
    closeModal();showToast('✅ Vous avez rejoint la table !');
    // Nettoie le paramètre URL
    window.history.replaceState({},'',window.location.pathname);
    renderHub();
  }catch(e){showToast('❌ Une erreur est survenue, réessaie.');}
}

// ─── QUITTER UNE CAMPAGNE (JOUEUR) ───
function hubKickConfirm(tableId,uid,playerName){
  openModal(`<div class="pt" style="color:var(--danger)">⚠️ Retirer ce joueur ?</div>
    <div style="font-size:13px;color:var(--text2);margin:10px 0 18px"><b>${esc(playerName)}</b> sera retiré de la table et ne pourra plus y accéder.<br><span style="font-size:13px;color:var(--text3)">Son personnage reste dans sa bibliothèque personnelle.</span></div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn" style="flex:2;color:var(--danger);border-color:rgba(229,57,53,.5);font-weight:600" onclick="hubKickMember('${tableId}','${uid}')">✓ Retirer de la table</button>
    </div>`);
}
async function hubKickMember(tableId,uid){
  closeModal();
  try{
    await fbDb.collection('tables').doc(tableId).update({
      memberIds:firebase.firestore.FieldValue.arrayRemove(uid),
      ['memberNames.'+uid]:firebase.firestore.FieldValue.delete(),
      ['memberAvatars.'+uid]:firebase.firestore.FieldValue.delete()
    });
    showToast('✅ Joueur retiré de la table.');
    renderHub();
  }catch(e){showToast('❌ Une erreur est survenue, réessaie.');}
}
function playerLeaveCharacter(campId){
  const c=currentUserData&&currentUserData.charLib&&currentUserData.charLib[campId];
  const charName=c&&c.charName||'votre personnage';
  window._pendingLeave=campId;
  openModal(`<div class="pt" style="color:var(--danger)">Quitter la campagne ?</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:16px"><b>${esc(charName)}</b> sera conservé dans votre bibliothèque. Vous pourrez rejoindre à nouveau cette campagne à tout moment.</div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn" style="flex:2;color:var(--danger);border-color:rgba(229,57,53,.5)" onclick="confirmPlayerLeave()">✕ Quitter</button>
    </div>`);
}
async function confirmPlayerLeave(){
  const campId=window._pendingLeave;
  if(!campId||!currentUser)return;
  closeModal();
  try{
    await fbDb.collection('characters').doc(currentUser.uid+'_'+campId).update({leftCampaign:true});
    await fbDb.collection('users').doc(currentUser.uid).update({['charLib.'+campId+'.leftCampaign']:true});
    if(currentUserData&&currentUserData.charLib&&currentUserData.charLib[campId])currentUserData.charLib[campId].leftCampaign=true;
    showToast('✅ Vous avez quitté la campagne. Votre personnage est conservé.');
    renderHub();
  }catch(e){showToast('❌ Une erreur est survenue, réessaie.');}
}
async function playerRejoinCampaign(campId){
  if(!campId||!currentUser)return;
  try{
    await fbDb.collection('characters').doc(currentUser.uid+'_'+campId).update({leftCampaign:firebase.firestore.FieldValue.delete()});
    await fbDb.collection('users').doc(currentUser.uid).update({['charLib.'+campId+'.leftCampaign']:firebase.firestore.FieldValue.delete()});
    if(currentUserData&&currentUserData.charLib&&currentUserData.charLib[campId])delete currentUserData.charLib[campId].leftCampaign;
    showToast('✅ Bienvenue de retour ! Votre personnage est actif.');
    renderHub();
  }catch(e){showToast('❌ Une erreur est survenue, réessaie.');}
}

// ─── SUPPRIMER DE LA BIBLIOTHÈQUE (JOUEUR) ───
function deleteCharFromLib(campId){
  const c=currentUserData&&currentUserData.charLib&&currentUserData.charLib[campId];
  const charName=c&&c.charName||'ce personnage';
  window._pendingDeleteLib=campId;
  openModal(`<div class="pt" style="color:var(--danger)">🗑 Supprimer "${esc(charName)}" ?</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:16px">Ce personnage sera supprimé de votre bibliothèque et de la campagne. Cette action est irréversible.</div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn" style="flex:2;color:var(--danger);border-color:rgba(229,57,53,.5)" onclick="confirmDeleteCharLib()">🗑 Supprimer</button>
    </div>`);
}
async function confirmDeleteCharLib(){
  const campId=window._pendingDeleteLib;
  if(!campId||!currentUser)return;
  closeModal();
  try{
    await fbDb.collection('characters').doc(currentUser.uid+'_'+campId).delete();
    await fbDb.collection('users').doc(currentUser.uid).update({['charLib.'+campId]:firebase.firestore.FieldValue.delete()});
    if(currentUserData&&currentUserData.charLib)delete currentUserData.charLib[campId];
    showToast('✅ Personnage supprimé.');
    openUserSettings();
  }catch(e){showToast('❌ Une erreur est survenue, réessaie.');}
}

// ─── COPIER LE LIEN ───
function viewCharSheet(uid,campId){
  // Cherche les données du personnage dans le cache
  let pp=null;
  if(_hubCache){for(const t of _hubCache){if(t._campParticipants){for(const [cid,parts] of Object.entries(t._campParticipants)){if(cid===campId){pp=parts.find(p=>p.uid===uid);break;}}}if(pp)break;}}
  if(!pp){showToast('❌ Personnage introuvable.');return;}
  const p=pp.fullData||{};
  const priv=pp.priv||{};
  const isMJ2=!!(currentTableId&&_hubCache&&(_hubCache.find(t=>t.id===currentTableId)||{}).mjId===currentUser.uid);
  const isOwn=uid===currentUser.uid;
  const canSee=tab=>(isMJ2||isOwn||priv[tab]!==false);
  const cls=(p.classes||[]).map(c=>c.name+' niv.'+c.level).join(' / ')||'?';
  const hidden=`<span style="color:var(--text3);font-style:italic;font-size:13px">🔒 Non partagé</span>`;
  const portrait=p.portrait||p.equipPortrait;
  openModal(`
    ${canSee('perso')&&portrait?`<div style="text-align:center;margin-bottom:10px"><img src="${portrait}" style="width:72px;height:72px;border-radius:50%;object-fit:cover;border:2px solid rgba(200,168,75,.4)"></div>`:''}
    <div class="pt" style="margin-bottom:10px">${pp.avatar||'⚔'} ${canSee('perso')?esc(pp.charName||'?'):'???'} <span style="font-weight:400;font-size:13px;color:var(--text3)">— ${esc(pp.playerName||'')}</span></div>
    <div style="max-height:70vh;overflow-y:auto;padding-right:4px">
    ${canSee('perso')?`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
      <div class="g-sub" style="padding:10px"><div class="fl mb6">Classe & Niveau</div><div style="font-size:13px">${esc(cls)}</div></div>
      <div class="g-sub" style="padding:10px"><div class="fl mb6">Race</div><div style="font-size:13px">${esc(p.race||'?')}</div></div>
    </div>`:hidden}
    ${canSee('combat')?`<div class="g-sub" style="padding:10px;margin-bottom:8px">
      <div class="fl mb6">Combat</div>
      <div style="display:flex;gap:16px"><div><div style="font-size:12px;color:var(--text3)">PV</div><div style="font-size:15px;font-weight:600;color:var(--good)">${p.hp||0}/${p.hpMax||0}</div></div><div><div style="font-size:12px;color:var(--text3)">CA</div><div style="font-size:15px;font-weight:600">${p.ac||10}</div></div></div>
    </div>`:''}
    ${canSee('competences')?`<div class="g-sub" style="padding:10px;margin-bottom:8px">
      <div class="fl mb6">Caractéristiques</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">${(p.abilities||[]).map((v,i)=>`<div style="text-align:center"><div style="font-size:13px;color:var(--text3)">${['FOR','DEX','CON','INT','SAG','CHA'][i]}</div><div style="font-size:16px;font-weight:600">${v}</div></div>`).join('')}</div>
    </div>`:''}
    ${canSee('historique')&&p.backstory?`<div class="g-sub" style="padding:10px;margin-bottom:8px"><div class="fl mb6">Backstory</div><div style="font-size:13px;color:var(--text2);white-space:pre-wrap">${esc(p.backstory)}</div></div>`:''}
    ${(isMJ2||isOwn)&&p.secrets?`<div style="background:rgba(200,168,75,.06);border:1px solid rgba(200,168,75,.3);border-radius:2px;padding:10px;margin-bottom:8px"><div class="fl mb6" style="color:var(--cp)">🔐 Secrets</div><div style="font-size:13px;color:var(--text2);white-space:pre-wrap">${esc(p.secrets)}</div></div>`:''}
    </div>
    <div style="display:flex;justify-content:flex-end;margin-top:8px">
    </div>`);
}

function copyCode(code){
  navigator.clipboard.writeText(code).then(()=>showToast('📋 Code copié : '+code));
}
function copyInviteLink(code){
  // Demande utilisateur 2026-06-12 : copier le CODE lui-même (pas un lien) — c'est le code qu'on partage.
  navigator.clipboard.writeText(code).then(()=>showToast('📋 Code copié : '+code));
}

// ─── ENTRER DANS UNE CAMPAGNE ───
async function enterCampaign(tableId,campaignId,tName,cName,preloadedCharData,forceNew){
  currentTableId=tableId;
  currentCampaignId=campaignId;
  try{localStorage.setItem('lastCamp_'+tableId,campaignId);}catch(e){} // mémo « Reprendre » (P1)
  saveSessionState({tableId,campaignId,mode:'play'}); // lot 0 : F5 rouvre ICI (voir firebase.js)
  if(!tName&&_hubCache){const t=_hubCache.find(t=>t.id===tableId);if(t){tName=t.name;const c=t.campaigns.find(c=>c.id===campaignId);if(c)cName=c.name;}}
  currentTableName=tName||'';
  currentCampaignName=cName||'';
  const tableData=_hubCache&&_hubCache.find(t=>t.id===tableId);
  const asMJ=!!(tableData&&tableData.mjId===currentUser.uid);
  window._currentCampIsMJ=asMJ; // mémorisé pour la barre de modes (label Personnage/MJ + ré-entrée)
  // Active les paquets de la table (rechargement paresseux ensuite via loadXDB) — migration douce de l'ancien modèle.
  if(typeof COMP!=='undefined'){ try{ COMP.applyTableSelection(typeof compTableRequiredPacks==='function'?compTableRequiredPacks(tableData):null); }catch(e){} }
  try{
    if(asMJ){
      // MJ : pas de personnage jouable, on charge le journal + données MJ
      _mjJournal=[];_journalSubTab='mj';_compilationData=null;
      _mjPlayersData=[];_mjCombatants=[];_mjNPCs=[];_mjObjets=[];_mjReserve=[];
      _mjCombatStarted=false;_mjCurrentTurn=0;_mjRound=1;_mjCombatLog=[];_mjSelectedNPC=null;
      try{
        const mjRef=fbDb.collection('characters').doc(currentUser.uid+'_'+campaignId+'_mj');
        const mjDoc=await mjRef.get();
        if(mjDoc.exists){
          const d=mjDoc.data();
          _mjJournal=d.entries||[];
          _mjNPCs=d.npcs||[];
          _mjObjets=d.objets||[];
          _mjReserve=d.reserve||[];
          if(d.combatState?.active&&Array.isArray(d.combatState.combatants)&&d.combatState.combatants.length){
            _mjCombatants=d.combatState.combatants;
            _mjCombatStarted=true;
            _mjCurrentTurn=d.combatState.currentTurn||0;
            _mjRound=d.combatState.round||1;
          }
        }
      }catch(e){}
      showMJScreen();
      // Arrête les éventuels listeners précédents avant d'en ouvrir de nouveaux
      stopAllListeners();
      // Lance le listener temps réel pour les joueurs (remplace loadMJPlayersData)
      startMJPlayersListener(campaignId);
      if(currentTableId)startWhisperListener(currentTableId,currentUser.uid);
      // Charge la bibliothèque de compendiums puis filtre selon les compendiums actifs de la table
      if(!Object.keys(_mjCompLib).length)await loadMJCompLib();
      const activeCustomIds=tableData?.activeCustomCompendiums||Object.keys(_mjCompLib);
      _mjActiveCompId=activeCustomIds.find(id=>_mjCompLib[id])||Object.keys(_mjCompLib)[0]||null;
      _mjCustomFeats=_mjActiveCompId?(_mjCompLib[_mjActiveCompId].feats||[]):[];
      _refreshMjPool();
      renderMJContent();
      // Chargement silencieux des petits compendiums en arrière-plan
      loadFeatsDB();loadRacesDB();loadBackgroundsDB();loadClassesDB();
    }else{
      // Joueur : charge ou crée le personnage (lecture initiale one-shot)
      const charRef=fbDb.collection('characters').doc(currentUser.uid+'_'+campaignId);
      const charDoc=await charRef.get();
      if(charDoc.exists&&!forceNew){
        const d=charDoc.data();
        state.players=[migratePlayer(d.characterData)];
      }else{
        state.players=[migratePlayer(preloadedCharData||defPlayer(currentUserData?currentUserData.displayName:'Personnage'))];
      }
      state.activeIdx=0;
      state.activeTab=localStorage.getItem('lastTab_'+campaignId)||'perso';
      _mjJournal=[];_journalSubTab='mj';_compilationData=null;
      _groupOnlyMode=false;
      showApp();
      await loadMJPool();
      _suppressUnsavedMark=true;render();
      if(!localStorage.getItem('tuto_fiche_done')&&state.players[0]?.created) setTimeout(()=>startTutorial('fiche'),800);
      // Lance les listeners temps réel
      currentTableMjId=tableData?.mjId||null;
      stopAllListeners();
      _groupData=[];
      _groupHudOpen=false; // panneau groupe fermé à l'entrée — seul le bouton 👥 apparaît
      // Pré-charger le compendium de sorts en arrière-plan
      if(!SPELLS_DB)loadSpellsDB();
      startPlayerListener(campaignId);
      startGroupListener(campaignId);
      if(currentTableMjId)startCombatListener(campaignId,currentTableMjId);
      if(currentTableId)startWhisperListener(currentTableId,currentUser.uid);
    }
  }catch(e){showToast('❌ Erreur chargement : '+e.message);}
}

async function openCampChronicle(tableId,campId){
  await enterCampaign(tableId,campId);
  _playerJournalSubTab='chronicle';
  _compilationData=null;
  state.activeTab='journal';
  renderTabBar();
  renderTab();
}

