function genCode(){return Math.random().toString(36).slice(2,8).toUpperCase();}
let _hubCache=null;

function _hubTableIsMJ(table,uid){
  const userId=uid||(currentUser&&currentUser.uid);
  if(!table||!userId)return false;
  if(table._memberRoles){
    return table._memberRoles[userId]==='owner'||table._memberRoles[userId]==='gm';
  }
  return table.mjId===userId;
}

function _hubTableIsOwner(table,uid){
  const userId=uid||(currentUser&&currentUser.uid);
  if(!table||!userId)return false;
  return (table.ownerId||table.mjId)===userId;
}

function _hubMemberIsMJ(table,uid){
  if(!table||!uid)return false;
  if(table._memberRoles)return ['owner','gm'].includes(table._memberRoles[uid]);
  return table.mjId===uid;
}

// État de personnage affiché dans le Hub. La bibliothèque utilisateur sert de
// repli immédiat, puis le document de campagne reste la source de vérité.
function _hubFallbackCharInfo(campId){
  const meta=currentUserData&&currentUserData.charLib&&currentUserData.charLib[campId];
  return meta?{charName:meta.charName||'?',charClass:meta.charClass||'',leftCampaign:!!meta.leftCampaign}:null;
}
async function _hubLoadCharInfo(table,campId){
  if(!table._charInfos)table._charInfos={};
  const fallback=_hubFallbackCharInfo(campId);
  try{
    if(typeof v2CompatService!=='undefined'&&v2CompatService.isEnabled()){
      const participation=await v2CompatService.getCampaignPlayer(campId,currentUser.uid);
      const characterId=participation?.currentCharacterId||null;
      if(!characterId){table._charInfos[campId]=null;return null;}
      const data=await v2DataService.loadCharacterSheet(characterId);
      const info={
        characterId,
        charName:data?.charName||data?.name||'Personnage',
        charClass:(data?.classes||[]).map(c=>c.name+' '+c.level).join('/')||'',
        leftCampaign:participation.leftAt!=null
      };
      table._charInfos[campId]=info;
      return info;
    }
    const doc=await fbDb.collection('characters').doc(currentUser.uid+'_'+campId).get();
    if(!doc.exists){table._charInfos[campId]=fallback;return fallback;}
    const raw=doc.data()||{}, data=raw.characterData||{};
    const info={
      ...(fallback||{}),
      charName:data.charName||fallback?.charName||'?',
      charClass:(data.classes||[]).map(c=>c.name+' '+c.level).join('/')||fallback?.charClass||'',
      leftCampaign:!!raw.leftCampaign
    };
    table._charInfos[campId]=info;
    return info;
  }catch(e){
    table._charInfos[campId]=fallback;
    return fallback;
  }
}

async function _hubLoadCampDetails(tableId,campId){
  const t=_hubCache&&_hubCache.find(x=>x.id===tableId);
  if(!t)return;
  if(!t._charInfos)t._charInfos={};
  if(!t._campParticipants)t._campParticipants={};
  if(t._charInfos[campId]===undefined)await _hubLoadCharInfo(t,campId);
  if(t._campParticipants[campId])return;
  try{
    if(typeof v2CompatService!=='undefined'&&v2CompatService.isEnabled()){
      const campaign=(t.campaigns||[]).find(c=>c.id===campId)||{};
      const archived=!!(campaign.archivedAt||campaign.status==='finished');
      const snapshot=await fbDb.collection('campaigns').doc(campId)
        .collection(archived?'characters':'publicCharacters').get();
      t._campParticipants[campId]=await Promise.all(snapshot.docs.map(async doc=>{
        const participation=archived?(doc.data()||{}):null;
        const pub=archived?(participation.finalSnapshot||{}):(doc.data()||{});
        const characterId=pub.characterId||doc.id;
        const uid=pub.userId||(participation&&participation.ownerId);
        const canLoadFull=uid===currentUser.uid||_hubTableIsMJ(t);
        let fullData={
          charName:pub.charName||pub.name,
          portrait:pub.portrait,
          race:pub.race,
          classes:pub.classes?String(pub.classes).split(' / ').map(label=>{
            const match=label.match(/^(.*)\s+(\d+)$/);
            return match?{name:match[1],level:Number(match[2])}:{name:label,level:1};
          }):[],
          hp:pub.hp,
          hpMax:pub.hpMax,
          tempHp:pub.temporaryHp,
          conditions:pub.conditions||[],
          inspiration:!!pub.inspiration
        };
        if(canLoadFull){
          try{
            if(archived){
              const archivedData=await v2DataService.loadArchivedCharacterSnapshot(characterId,campId);
              fullData=(archivedData&&archivedData.sheet)||fullData;
            }else{
              fullData=await v2DataService.loadCharacterSheet(characterId)||fullData;
            }
          }catch(e){}
        }
        return{
          uid,
          characterId,
          playerName:(t.memberNames||{})[uid]||'Joueur',
          playerAvatar:(t.memberAvatars||{})[uid]||'⚔',
          avatar:(t.memberAvatars||{})[uid]||'⚔',
          charName:pub.name||'Personnage',
          charClass:pub.classes||'',
          priv:{},
          fullData,
          archivedSnapshot:archived
        };
      }));
      return;
    }
    const charsSnap=await fbDb.collection('characters').where('campaignId','==',campId).get();
    const participants=[];
    for(const cdoc of charsSnap.docs){
      if(cdoc.id.endsWith('_mj'))continue;
      const cdata=cdoc.data();
      if(_hubMemberIsMJ(t,cdata.userId))continue;
      if(cdata.ejectedFromCampaign||cdata.leftCampaign)continue;
      const charData=cdata.characterData||{};
      const priv=charData.privacy||{name:true,hp:true,abilities:false,notes:false};
      const uid=cdata.userId;
      let playerName='Joueur';let playerAvatar='⚔';
      try{
        const udoc=await fbDb.collection('users').doc(uid).get();
        if(udoc.exists){
          const u=udoc.data();
          playerName=u.displayName||'Joueur';
          playerAvatar=u.avatar||'⚔';
        }
      }catch(e){}
      participants.push({uid,playerName,playerAvatar,charName:priv.name!==false?charData.charName||'?':'???',charClass:priv.name!==false?(charData.classes||[]).map(c=>c.name+' '+c.level).join('/'):'',avatar:playerAvatar,priv,fullData:charData});
    }
    t._campParticipants[campId]=participants;
  }catch(e){t._campParticipants[campId]=[];}
}

async function toggleCampExpand(tableId,campId){
  const key=tableId+'_'+campId;
  _expandedCamp=(_expandedCamp===key)?null:key;
  // Le clic doit produire un retour visuel immédiat. Le contenu complémentaire
  // (participants, portraits…) est chargé ensuite sans bloquer le dépliage.
  if(_hubCache)_hubRerender();
  // Recharge les données sans refaire toutes les requêtes du Hub.
  if(_hubCache){
    if(_expandedCamp===key){
      await _hubLoadCampDetails(tableId,campId);
    }
    // Respecte l'état le plus récent si l'utilisateur a replié ou ouvert une
    // autre campagne pendant le chargement asynchrone.
    _hubRerender();
  }else{await renderHub();}
}

async function renderHub(){
  const hub=document.getElementById('hubContent');
  if(!hub)return;
  hub.innerHTML='<div class="hub-empty"><span class="auth-spinner"></span> Chargement...</div>';
  try{
    const tablesWithCamps=typeof v2CompatService!=='undefined'
      ?await v2CompatService.getHubTables(currentUser.uid)
      :await (async()=>{
        const snap=await fbDb.collection('tables').where('memberIds','array-contains',currentUser.uid).get();
        const tables=snap.docs.map(d=>({id:d.id,...d.data()}));
        return Promise.all(tables.map(async t=>{
          const cs=await fbDb.collection('campaigns').where('tableId','==',t.id).orderBy('createdAt','desc').get();
          return{...t,campaigns:cs.docs.map(d=>({id:d.id,...d.data()})).filter(c=>!c.deletedAt)};
        }));
      })();
    // Une campagne déjà rejointe ne doit jamais afficher « Créer mon personnage »
    // pendant le premier rendu. On hydrate donc les cartes avant de les afficher.
    await Promise.all(tablesWithCamps.flatMap(t=>(t.campaigns||[]).map(c=>_hubLoadCharInfo(t,c.id))));
    // Récupère les noms/avatars manquants pour les anciens membres
    for(const t of tablesWithCamps){
      if(t._schema===2&&typeof _userInfoCache!=='undefined'){
        (t.memberIds||[]).forEach(uid=>{
          _userInfoCache[uid]={
            playerName:(t.memberNames||{})[uid]||'Joueur',
            avatar:(t.memberAvatars||{})[uid]||'⚔'
          };
        });
      }
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
      if(_hubTableIsOwner(t)&&t.inviteCode&&t._schema!==2){
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
      const archived=!!(c.archivedAt||c.status==='finished');
      const charInfo=t._charInfos&&t._charInfos[c.id];
      let expandedHtml='';
      if(expanded){
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
              ${archived
                ?`<button class="ds-btn quiet" style="flex-shrink:0;min-height:30px;padding:2px 8px" title="Consulter la fiche archivée" onclick="openHubPlayerSheet('${pp.uid}','${c.id}','${pp.characterId||''}')">📋</button>`
                :(isMJ
                  ?`<div style="display:flex;gap:4px">
                      <button class="ds-btn quiet" style="flex-shrink:0;min-height:30px;padding:2px 8px" title="Voir la fiche" onclick="openHubPlayerSheet('${pp.uid}','${c.id}','${pp.characterId||''}')">📋</button>
                      <button class="ds-btn quiet" style="color:var(--ds-seal);border-color:var(--ds-seal);flex-shrink:0;min-height:30px;padding:2px 8px" title="Retirer de la table" onclick="hubKickConfirm('${t.id}','${pp.uid}','${jsq(pp.playerName||'ce joueur')}')">✕</button>
                    </div>`
                  :`<button class="ds-btn quiet" style="flex-shrink:0;min-height:30px;padding:2px 8px" title="${isMe?'Ouvrir ma fiche sans rejoindre':'Voir la fiche'}" onclick="${isMe&&_dsV2Enabled()?`_dsOpenV2Character('${pp.characterId||''}')`:`openHubPlayerSheet('${pp.uid}','${c.id}','${pp.characterId||''}')`}">📋</button>`)}
            </div>`;
          }).join('')}
        </div>`:'';
        const charBlock=archived?'':isMJ
          ?`<button class="ds-btn primary" style="width:100%;margin-top:8px" onclick="enterCampaign('${t.id}','${c.id}')">👑 Gérer la campagne</button>`
          :(charInfo&&!charInfo.leftCampaign
            ?`<div style="margin-top:8px">
                ${(()=>{const cur=_dsCurrentGame();return (cur&&cur.tableId===t.id&&cur.campaignId===c.id)
                  ?_dsInGameStatus()
                  :`<button class="ds-btn primary" style="width:100%" onclick="joinGroupFromHub('${t.id}','${c.id}')">👥 Rejoindre le groupe</button>`;})()}
              </div>`
            :(charInfo&&charInfo.leftCampaign
              ?`<div style="margin-top:8px">
                  <div style="display:flex;align-items:center;gap:6px;padding:8px;background:var(--ds-card2);border:1px solid var(--ds-line);border-bottom:none">
                    <span style="font-size:18px;opacity:.5">${currentUserData&&currentUserData.avatar||'⚔'}</span>
                    <div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:600;color:var(--ds-soft)">${esc(charInfo.charName||'?')}</div><div class="ds-note">Inactif — vous avez quitté cette campagne</div></div>
                  </div>
                  <div style="display:flex;gap:6px">
                    <button class="ds-btn primary" style="flex:2" onclick="playerRejoinCampaign('${c.id}')">↩ Rejoindre</button>
                    ${_dsV2Enabled()?'':`<button class="ds-btn quiet" style="flex:1;color:var(--ds-seal);border-color:var(--ds-seal)" onclick="deleteCharFromLib('${c.id}')">🗑</button>`}
                  </div>
                </div>`
              :`<button class="ds-btn primary" style="width:100%;margin-top:8px" onclick="openCharOrCreate('${t.id}','${c.id}')">＋ Créer mon personnage</button>`));
        const mjEditHtml=isMJ?`
          <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">
            <button class="ds-btn quiet" onclick="${archived?`openArchiveOptions('${t.id}','${c.id}')`:`openEditCampaign('${t.id}','${c.id}')`}">${archived?'📦 Gérer l’archive':'✏ Modifier'}</button>
          </div>`:'';
        expandedHtml=`<div style="padding:10px 12px;border:1px solid var(--ds-line);border-top:none;background:var(--ds-card)">${imgHtml}
          ${c.detailedDesc?`<p style="font-size:12px;color:var(--ds-ink);line-height:1.65;margin:0 0 8px">${esc(c.detailedDesc)}</p>`:''}
          <div style="clear:both"></div>
          ${charBlock}${participantHtml}
          <button class="ds-btn quiet" style="width:100%;margin-top:8px" onclick="openCampChronicle('${t.id}','${c.id}')">📜 Consulter la chronique</button>
          ${mjEditHtml}
        </div>`;
      }
      return`<div style="margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--ds-card);border:1px solid var(--ds-line);cursor:pointer" onclick="toggleCampExpand('${t.id}','${c.id}')">
          ${c.imageUrl?`<img src="${esc(c.imageUrl)}" style="width:44px;height:44px;object-fit:cover;border:1px solid var(--ds-line);flex-shrink:0" onerror="this.style.display='none'">`:`<div style="width:44px;height:44px;background:var(--ds-card2);border:1px solid var(--ds-line);display:grid;place-items:center;font-size:15px;flex-shrink:0">⚔</div>`}
          <div style="flex:1;min-width:0"><div style="font-family:var(--ds-disp);font-size:15.5px;font-weight:700;color:var(--ds-ink)">${esc(c.name)}</div>
            ${c.description?`<div class="ds-note" style="margin-top:2px">${esc(c.description)}</div>`:''}
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            ${c.status==='finished'||c.archivedAt
              ?`<span class="ds-chip" style="font-size:11px">Archivée</span>`
              :''}
            ${!isMJ&&charInfo&&!charInfo.leftCampaign?`<button class="ds-btn quiet" style="color:var(--ds-seal);border-color:var(--ds-seal);flex-shrink:0;min-height:0;padding:3px 9px;font-size:11px;line-height:normal" onclick="event.stopPropagation();playerLeaveCharacter('${c.id}')">✕ Quitter</button>`:''}
            <span style="width:32px;height:32px;display:grid;place-items:center;flex-shrink:0;font-size:26px;line-height:1;color:var(--ds-acc-strong);transition:transform .2s;${expanded?'transform:rotate(90deg)':''}">›</span>
          </div>
        </div>${expandedHtml}</div>`;
}

// Une partie est EN COURS uniquement si elle est réellement activée dans cette session
// navigateur. La sauvegarde locale sert à PROPOSER « Reprendre » après un rechargement,
// mais ne doit jamais afficher un faux état actif qui laisserait la navigation désactivée.
function _dsCurrentGame(){
  return (currentTableId&&currentCampaignId)?{tableId:currentTableId,campaignId:currentCampaignId}:null;
}
function _dsInGameStatus(extraClass=''){
  return`<button type="button" class="ds-btn quiet ds-in-game ${extraClass}" style="width:100%;margin-top:8px" disabled><span class="ds-livedot"></span>Partie en cours</button>`;
}
// Carte de table (rail) — illustration + catégorie code couleur + « Reprendre » direct (P1 validée)
function _dsTableCardHTML(t,selected){
  const isMJ=_hubTableIsMJ(t);
  const n=(t.campaigns||[]).length;
  const thumb=(t.campaigns||[]).map(c=>c.imageUrl).find(Boolean);
  const lastId=localStorage.getItem('lastCamp_'+t.id);
  const last=(t.campaigns||[]).find(c=>c.id===lastId&&!c.archivedAt&&c.status!=='finished')
    ||(t.campaigns||[]).find(c=>!c.archivedAt&&c.status!=='finished');
  const cur=_dsCurrentGame();
  const activeCamp=cur&&cur.tableId===t.id?(t.campaigns||[]).find(c=>c.id===cur.campaignId):null;
  const resume=activeCamp?_dsInGameStatus()
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
      ${selected?'':`<div style="margin-top:8px;padding-top:7px;border-top:1px solid var(--ds-line-soft);font-size:11px;font-weight:600;text-align:right;color:var(--ds-acc-strong)">Voir les campagnes ›</div>`}
    </div>
  </div>`;
}
// « Reprendre » : ouvre DIRECTEMENT la dernière campagne jouée de la table (fallback : détail).
function hubResumeTable(tableId){
  const t=_hubCache&&_hubCache.find(x=>x.id===tableId);
  if(!t){hubSelectTable(tableId);return;}
  const lastId=localStorage.getItem('lastCamp_'+tableId);
  const c=(t.campaigns||[]).find(x=>x.id===lastId&&!x.archivedAt&&x.status!=='finished')
    ||(t.campaigns||[]).find(x=>!x.archivedAt&&x.status!=='finished')
    ||(t.campaigns||[])[0];
  if(c)resumeCampaignFromHub(tableId,c.id);
  else hubSelectTable(tableId);
}

// Active la campagne sans quitter le Hub et verrouille sa carte en état déplié.
// Utilisé aussi bien par « Rejoindre le groupe » que par « Reprendre ».
function _confirmCampaignSwitch(tableId,campaignId,continueAction){
  const current=_dsCurrentGame();
  if(!current||(current.tableId===tableId&&current.campaignId===campaignId))return false;
  const currentTable=_hubCache&&_hubCache.find(x=>x.id===current.tableId);
  const currentCampaign=currentTable&&(currentTable.campaigns||[])
    .find(x=>x.id===current.campaignId);
  const nextTable=_hubCache&&_hubCache.find(x=>x.id===tableId);
  const nextCampaign=nextTable&&(nextTable.campaigns||[]).find(x=>x.id===campaignId);
  if(!currentCampaign||!nextCampaign)return false;
  window._pendingCampaignSwitch=continueAction;
  openModal(`<div class="pt">Changer de partie en cours ?</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:16px">
      Tu suis actuellement « <b>${esc(currentCampaign.name)}</b> ».<br>
      Rejoindre « <b>${esc(nextCampaign.name)}</b> » ?
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="window._pendingCampaignSwitch=null;closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="confirmCampaignSwitch()">Rejoindre</button>
    </div>`);
  return true;
}
function confirmCampaignSwitch(){
  const action=window._pendingCampaignSwitch;
  window._pendingCampaignSwitch=null;
  closeModal();
  if(typeof action==='function')action();
}
async function joinGroupFromHub(tableId,campaignId,confirmed){
  const t=_hubCache&&_hubCache.find(x=>x.id===tableId);
  const c=t&&(t.campaigns||[]).find(x=>x.id===campaignId);
  if(!t||!c){showToast('❌ Campagne introuvable.');return;}
  if(!confirmed&&_confirmCampaignSwitch(
    tableId,
    campaignId,
    ()=>joinGroupFromHub(tableId,campaignId,true)
  ))return;
  const expandedKey=tableId+'_'+campaignId;
  _hubSelectedTableId=tableId;
  _hubMobileDetail=true;
  _expandedCamp=expandedKey;
  // Affiche immédiatement le détail ciblé depuis le cache, avant toute lecture
  // Firestore nécessaire à l'activation du groupe.
  _hubRerender();
  await Promise.all([
    joinGroupOnly(tableId,campaignId),
    _hubLoadCampDetails(tableId,campaignId)
  ]);
  // Réaffectation volontaire après les chargements asynchrones : aucun rerender
  // intermédiaire ne doit pouvoir replier la campagne que l'utilisateur vient d'activer.
  _hubSelectedTableId=tableId;
  _hubMobileDetail=true;
  _expandedCamp=expandedKey;
  // Pas de renderHub() complet ici : son écran de chargement masquait la carte
  // ouverte et pouvait donner l'impression que le clic n'avait rien fait.
  _hubRerender();
}
function resumeCampaignFromHub(tableId,campaignId){
  return joinGroupFromHub(tableId,campaignId);
}

// Panneau de détail (table sélectionnée) — réutilise _hubCampCardHTML
function _hubTableDetailHTML(t){
  if(!t) return`<div class="ds-note" style="padding:30px;text-align:center">Sélectionne une table, ou crées-en une.</div>`;
  const isMJ=_hubTableIsMJ(t);
  const memberAvatars=t.memberAvatars||{},memberNames=t.memberNames||{};
  const players=(t.memberIds||[]).filter(uid=>!_hubMemberIsMJ(t,uid));
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
          ${isMJ
            ?`<button class="ds-btn quiet" style="margin-left:auto;min-height:34px;padding:4px 10px" onclick="openTableSettings('${t.id}','${jsq(t.name)}','${t.inviteCode}')">⚙ Réglages</button>`
            :`<button class="ds-btn quiet" style="margin-left:auto;color:var(--ds-seal);border-color:var(--ds-seal);min-height:0;padding:3px 9px;font-size:11px;line-height:normal" onclick="promptLeaveTable('${t.id}')">🚪 Quitter la table</button>`}
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
    ${campList}`;
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
    if(typeof v2CompatService!=='undefined'&&v2CompatService.isEnabled()){
      await v2AuthorityService.leaveTable(tableId);
      const saved=(typeof loadSessionState==='function')?loadSessionState():null;
      if(saved&&saved.tableId===tableId&&typeof clearSessionState==='function')clearSessionState();
      if(_hubCache)_hubCache=_hubCache.filter(x=>x.id!==tableId);
      _hubSelectedTableId=null;
      showToast('✅ Tu as quitté la table. Tes personnages sont conservés.');
      renderHub();
      return;
    }
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
  const mine=tables.filter(t=>_hubTableIsMJ(t));
  const others=tables.filter(t=>!_hubTableIsMJ(t));
  const sec=(lbl,cls,arr)=>arr.length?`<div class="ds-seclbl ${cls}" style="margin:12px 0 8px">${lbl}</div>${arr.map(t=>_dsTableCardHTML(t,t.id===_hubSelectedTableId)).join('')}`:'';
  return`<div class="hub-2col${_hubMobileDetail?' show-detail':''}">
    <div class="hub-rail">
      <div class="ds-title">Mes tables</div>
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
  // Anti-spam : sans ce garde, deux clics rapprochés créaient DEUX tables — la
  // seconde partait avant que la première n'ait répondu (signalé le 2026-07-26).
  return guardAction('createTable',async()=>{
  const requiredPacks = typeof compReadTableSelection==='function' ? compReadTableSelection() : {};
  const inviteCode=genCode();
  try{
    if(typeof v2CompatService!=='undefined'&&v2CompatService.isEnabled()){
      const tableId=await v2DataService.createTableWithOwner({
        name,
        ownerId:currentUser.uid,
        inviteCode,
        requiredPacks,
        displayNameSnapshot:currentUserData.displayName,
        avatarSnapshot:currentUserData.avatar||'🎲'
      });
      await v2AuthorityService.createInvite(tableId,inviteCode);
      closeModal();showToast('✅ Table "'+name+'" créée !');renderHub();
      return;
    }
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
  });
}

// ─── CRÉER UNE CAMPAGNE (MJ) ───
function openCreateCampaign(tableId){
  if(typeof v2CompatService!=='undefined'&&v2CompatService.isEnabled()){
    openCreateCampaignV2(tableId);
    return;
  }
  openModal(`<div class="pt">⚔ Nouvelle campagne</div>
    <div class="fl mb6">Nom de la campagne</div>
    <input class="fi" id="newCampName" placeholder="Ex: La Mine Perdue" style="margin-bottom:10px">
    <div class="fl mb6">Description (optionnel)</div>
    <input class="fi" id="newCampDesc" placeholder="Courte description..." style="margin-bottom:10px">
    <div class="fl mb6">Encombrement</div>
    <select class="fi" id="newCampEncumbrance" style="margin-bottom:16px">
      <option value="none">Aucun</option><option value="simple">Simple</option><option value="detailed" selected>Détaillé</option>
    </select>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="confirmCreateCampaign('${tableId}')">✓ Créer</button>
    </div>`);
}
async function openCreateCampaignV2(tableId){
  let chronicles=[];
  try{chronicles=await v2GroupService.listTableChronicles(tableId);}catch(e){}
  const options=chronicles.map(c=>`<option value="${c.id}">${esc(c.name||'Chronique existante')}</option>`).join('');
  openModal(`<div class="pt">⚔ Nouvelle campagne</div>
    <div class="fl mb6">Nom de la campagne</div>
    <input class="fi" id="newCampName" placeholder="Ex: La Mine Perdue" style="margin-bottom:10px">
    <div class="fl mb6">Description (optionnel)</div>
    <input class="fi" id="newCampDesc" placeholder="Courte description..." style="margin-bottom:10px">
    <div class="fl mb6">Encombrement</div>
    <select class="fi" id="newCampEncumbrance" style="margin-bottom:10px">
      <option value="none">Aucun</option><option value="simple">Simple</option><option value="detailed" selected>Détaillé</option>
    </select>
    <div class="fl mb6">Chronique</div>
    <select class="fi" id="newCampChronicle" style="margin-bottom:16px">
      <option value="">Créer une nouvelle chronique</option>
      ${options}
    </select>
    <div class="ds-note" style="margin:-8px 0 14px">Une chronique existante ne peut provenir que de cette table.</div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="confirmCreateCampaign('${tableId}')">✓ Créer</button>
    </div>`);
}
async function confirmCreateCampaign(tableId){
  const name=document.getElementById('newCampName').value.trim();
  const desc=document.getElementById('newCampDesc').value.trim();
  const encumbranceMode=document.getElementById('newCampEncumbrance')?.value||'detailed';
  if(!name){showToast('❌ Donnez un nom à la campagne.');return;}
  return guardAction('createCampaign:'+tableId,async()=>{
  try{
    if(typeof v2CompatService!=='undefined'&&v2CompatService.isEnabled()){
      const chronicleId=document.getElementById('newCampChronicle')?.value||null;
      await v2DataService.createCampaign({
        tableId,
        name,
        description:desc||null,
        encumbranceMode,
        createdBy:currentUser.uid,
        chronicleId
      });
      closeModal();showToast('✅ Campagne "'+name+'" créée !');renderHub();
      return;
    }
    await fbDb.collection('campaigns').add({
      tableId,name,description:desc,encumbranceMode,status:'active',
      ownerId:currentUser.uid,
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    closeModal();showToast('✅ Campagne "'+name+'" créée !');renderHub();
  }catch(e){showToast('❌ Une erreur est survenue, réessaie.');}
  });
}

// ─── PARAMÈTRES TABLE (MJ) ───
function openTableSettings(tableId,tableName,inviteCode){
  const tableData=(typeof _hubCache!=='undefined'&&_hubCache)?_hubCache.find(t=>t.id===tableId):null;
  const sel=typeof compTableRequiredPacks==='function'?compTableRequiredPacks(tableData):{};
  const selectorHtml=typeof compTableSelectorHtml==='function'?compTableSelectorHtml(sel):'';
  if(typeof compSetTableEditContext==='function')compSetTableEditContext(tableId); // mode édition : auto-save à chaque changement
  const memberAdmin=tableData&&tableData._schema===2&&tableData._role==='owner'
    ?`<details class="acc" style="margin-bottom:16px" open>
      <summary>👥 Membres et co-MJ</summary>
      <div class="acc-body">${(tableData.memberIds||[]).map(uid=>{
        const role=(tableData._memberRoles||{})[uid]||'player';
        const owner=role==='owner';
        return`<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">
          <span style="flex:1">${esc((tableData.memberNames||{})[uid]||'Membre')}</span>
          ${owner?'<span class="ds-chip">Propriétaire</span>':`<select class="fi" style="width:auto;padding:4px 7px" onchange="setV2TableRole('${tableId}','${uid}',this.value)">
            <option value="player"${role==='player'?' selected':''}>Joueur</option>
            <option value="gm"${role==='gm'?' selected':''}>MJ</option>
          </select>
          <button class="btn bsm" onclick="promptV2OwnershipTransfer('${tableId}','${uid}','${jsq((tableData.memberNames||{})[uid]||'Membre')}')">Transférer</button>
          <button class="btn bsm" style="color:var(--danger)" onclick="hubKickConfirm('${tableId}','${uid}','${jsq((tableData.memberNames||{})[uid]||'Membre')}')">Retirer</button>`}
        </div>`;
      }).join('')}</div>
    </details>`:'';
  openModal(`<div class="pt">⚙ Table : ${esc(tableName)}</div>
    <div class="fl mb6" style="margin-top:0">Lien d'invitation</div>
    <div class="invite-box" style="margin-bottom:16px">Code : <span class="invite-code">${inviteCode}</span><button class="btn bsm" onclick="copyCode('${inviteCode}')" style="margin-left:4px">📋 Copier le code</button><button class="btn bsm" onclick="copyInviteLink('${inviteCode}')" style="margin-left:4px">🔗 Lien</button></div>
    ${memberAdmin}
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
async function setV2TableRole(tableId,userId,role){
  try{
    await v2DataService.setMemberRole(tableId,userId,role);
    showToast(role==='gm'?'✅ Membre nommé MJ.':'✅ Membre redevenu joueur.');
    closeModal();await renderHub();
  }catch(e){showToast('❌ '+(e.message||'Modification impossible.'));}
}
function promptV2OwnershipTransfer(tableId,userId,name){
  openModal(`<div class="pt">Transférer la propriété ?</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:16px"><b>${esc(name)}</b> deviendra propriétaire de la table. Tu resteras MJ.</div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="confirmV2OwnershipTransfer('${tableId}','${userId}')">Transférer</button>
    </div>`);
}
async function confirmV2OwnershipTransfer(tableId,userId){
  try{
    await v2DataService.transferTableOwnership(tableId,currentUser.uid,userId);
    closeModal();showToast('✅ Propriété transférée. Tu restes MJ.');
    await renderHub();
  }catch(e){showToast('❌ '+(e.message||'Transfert impossible.'));}
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
function openArchiveOptions(tableId,campId){
  const t=_hubCache&&_hubCache.find(entry=>entry.id===tableId);
  const c=t&&(t.campaigns||[]).find(entry=>entry.id===campId);
  if(!c)return;
  openModal(`<div class="pt">📦 Archive : ${esc(c.name)}</div>
    <div class="ds-note" style="margin-bottom:16px">Cette campagne est en lecture seule. Vous pouvez la restaurer ou la supprimer définitivement sans supprimer les personnages des joueurs.</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn" style="flex:1" onclick="closeModal()">Fermer</button>
      <button class="btn bac" style="flex:2" onclick="restoreCampaignFromArchive('${tableId}','${campId}')">↩ Restaurer</button>
      <button class="btn" style="width:100%;color:var(--danger);border-color:rgba(229,57,53,.35)" onclick="openDeleteCampaign('${tableId}','${campId}')">🗑 Supprimer définitivement</button>
    </div>`);
}
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
    <input class="fi" id="editCampImg" value="${esc(c.imageUrl||'')}" placeholder="https://..." style="margin-bottom:10px">
    <div class="fl mb6">Encombrement</div>
    <select class="fi" id="editCampEncumbrance" style="margin-bottom:16px">
      <option value="none"${c.encumbranceMode==='none'?' selected':''}>Aucun</option>
      <option value="simple"${c.encumbranceMode==='simple'?' selected':''}>Simple</option>
      <option value="detailed"${!c.encumbranceMode||c.encumbranceMode==='detailed'?' selected':''}>Détaillé</option>
    </select>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="saveEditCampaign('${tableId}','${campId}')">💾 Sauvegarder</button>
    </div>
    <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border)">
      <button class="btn" style="width:100%;margin-bottom:8px" onclick="${c.archivedAt||c.status==='finished'
        ?`restoreCampaignFromArchive('${tableId}','${campId}')`
        :`openArchiveCampaign('${tableId}','${campId}')`}">${c.archivedAt||c.status==='finished'?'↩ Restaurer la campagne':'📦 Archiver la campagne'}</button>
      ${c.archivedAt||c.status==='finished'?`<button class="btn" style="width:100%;color:var(--danger);border-color:rgba(229,57,53,.35)" onclick="openDeleteCampaign('${tableId}','${campId}')">🗑 Supprimer cette campagne</button>`:''}
    </div>`);
}
function openArchiveCampaign(tableId,campId){
  const t=_hubCache&&_hubCache.find(x=>x.id===tableId);
  const c=t&&(t.campaigns||[]).find(x=>x.id===campId);
  if(!c)return;
  openModal(`<div class="pt">Archiver « ${esc(c.name)} » ?</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:16px">La campagne restera consultable et pourra être restaurée plus tard. Les personnages et la chronique sont conservés.</div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="openEditCampaign('${tableId}','${campId}')">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="archiveCampaignFromHub('${tableId}','${campId}')">📦 Archiver</button>
    </div>`);
}
async function archiveCampaignFromHub(tableId,campId){
  try{
    if(typeof v2CompatService!=='undefined'&&v2CompatService.isEnabled()){
      await v2DataService.archiveCampaign(campId,currentUser.uid);
    }else{
      const now=firebase.firestore.FieldValue.serverTimestamp();
      await fbDb.collection('campaigns').doc(campId).update({
        archivedAt:now,
        archivedBy:currentUser.uid,
        status:'finished'
      });
    }
    const t=_hubCache&&_hubCache.find(x=>x.id===tableId);
    const c=t&&(t.campaigns||[]).find(x=>x.id===campId);
    if(c){c.archivedAt=new Date();c.archivedBy=currentUser.uid;c.status='finished';}
    closeModal();
    showToast('📦 Campagne archivée.');
    _hubRerender();
  }catch(e){showToast('❌ Une erreur est survenue, réessaie.');}
}
async function restoreCampaignFromArchive(tableId,campId){
  try{
    if(typeof v2CompatService!=='undefined'&&v2CompatService.isEnabled()){
      await v2DataService.restoreCampaign(campId);
    }else{
      await fbDb.collection('campaigns').doc(campId).update({
        archivedAt:null,
        archivedBy:null,
        status:'active'
      });
    }
    const t=_hubCache&&_hubCache.find(x=>x.id===tableId);
    const c=t&&(t.campaigns||[]).find(x=>x.id===campId);
    if(c){c.archivedAt=null;c.archivedBy=null;c.status='active';}
    closeModal();
    showToast('✅ Campagne restaurée.');
    _hubRerender();
  }catch(e){showToast('❌ Une erreur est survenue, réessaie.');}
}
function openDeleteCampaign(tableId,campId){
  const t=_hubCache&&_hubCache.find(t=>t.id===tableId);
  const c=t&&t.campaigns.find(c=>c.id===campId);
  const campName=c?c.name:'cette campagne';
  openModal(`<div class="pt" style="color:var(--danger)">🗑 Supprimer la campagne ?</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:8px">Vous êtes sur le point de supprimer :</div>
    <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:12px;padding:8px 12px;background:rgba(229,57,53,.08);border:1px solid rgba(229,57,53,.3);border-radius:2px">${esc(campName)}</div>
    <div style="font-size:13px;color:var(--text3);margin-bottom:16px;line-height:1.6">Cette action supprimera définitivement la campagne et ses données de session. <b style="color:var(--text2)">Les personnages des joueurs seront conservés.</b> Elle est <b style="color:var(--danger)">irréversible</b>.</div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="openEditCampaign('${tableId}','${campId}')">← Retour</button>
      <button class="btn" style="flex:2;color:var(--danger);border-color:rgba(229,57,53,.5)" onclick="doDeleteCampaign('${tableId}','${campId}')">🗑 Confirmer la suppression</button>
    </div>`);
}
async function doDeleteCampaign(tableId,campId){
  closeModal();
  try{
    if(typeof v2CompatService!=='undefined'&&v2CompatService.isEnabled()){
      await v2AuthorityService.deleteArchivedCampaign(campId);
      if(_hubCache){const t=_hubCache.find(t=>t.id===tableId);if(t)t.campaigns=t.campaigns.filter(c=>c.id!==campId);}
      showToast('🗑 Campagne supprimée. Les personnages sont conservés.');
      renderHub();
      return;
    }
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
  const encumbranceMode=document.getElementById('editCampEncumbrance')?.value||'detailed';
  try{
    await fbDb.collection('campaigns').doc(campId).update({description:desc,detailedDesc:detailed,imageUrl:img,encumbranceMode});
    // Mise à jour du cache local
    const t=_hubCache&&_hubCache.find(t=>t.id===tableId);
    if(t){const c=t.campaigns.find(c=>c.id===campId);if(c){c.description=desc;c.detailedDesc=detailed;c.imageUrl=img;c.encumbranceMode=encumbranceMode;}}
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
    if(typeof v2CompatService!=='undefined'&&v2CompatService.isEnabled()){
      await v2AuthorityService.joinTable(code,{
        displayName:currentUserData.displayName,
        avatar:currentUserData.avatar||'⚔'
      });
      closeModal();showToast('✅ Vous avez rejoint la table !');
      window.history.replaceState({},'',window.location.pathname);
      renderHub();
      return;
    }
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
    if(typeof v2CompatService!=='undefined'&&v2CompatService.isEnabled()){
      await v2AuthorityService.removeMember(tableId,uid);
      showToast('✅ Joueur retiré de la table.');
      renderHub();
      return;
    }
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
  let c=currentUserData&&currentUserData.charLib&&currentUserData.charLib[campId];
  if(typeof v2CompatService!=='undefined'&&v2CompatService.isEnabled()){
    const table=_hubCache&&_hubCache.find(t=>(t.campaigns||[]).some(camp=>camp.id===campId));
    c=table&&table._charInfos&&table._charInfos[campId];
  }
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
    if(typeof v2CompatService!=='undefined'&&v2CompatService.isEnabled()){
      await v2AuthorityService.leaveCampaign(campId);
      if(currentCampaignId===campId){
        currentCampaignId=null;
        currentCharacterId=null;
        currentSheetCharacterId=null;
        saveSessionState({mode:'hub'});
      }
    }else{
      await fbDb.collection('characters').doc(currentUser.uid+'_'+campId).update({leftCampaign:true});
      await fbDb.collection('users').doc(currentUser.uid).update({['charLib.'+campId+'.leftCampaign']:true});
      if(currentUserData&&currentUserData.charLib&&currentUserData.charLib[campId])currentUserData.charLib[campId].leftCampaign=true;
    }
    showToast('✅ Vous avez quitté la campagne. Votre personnage est conservé.');
    renderHub();
  }catch(e){showToast('❌ Une erreur est survenue, réessaie.');}
}
async function playerRejoinCampaign(campId){
  if(!campId||!currentUser)return;
  try{
    if(typeof v2CompatService!=='undefined'&&v2CompatService.isEnabled()){
      const participation=await v2CompatService.getCampaignPlayer(campId,currentUser.uid);
      if(!participation?.currentCharacterId)throw new Error('Personnage de campagne introuvable');
      await v2DataService.joinCampaignWithCharacter({
        campaignId:campId,
        characterId:participation.currentCharacterId,
        userId:currentUser.uid
      });
    }else{
      await fbDb.collection('characters').doc(currentUser.uid+'_'+campId).update({leftCampaign:firebase.firestore.FieldValue.delete()});
      await fbDb.collection('users').doc(currentUser.uid).update({['charLib.'+campId+'.leftCampaign']:firebase.firestore.FieldValue.delete()});
      if(currentUserData&&currentUserData.charLib&&currentUserData.charLib[campId])delete currentUserData.charLib[campId].leftCampaign;
    }
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
    <div style="font-size:13px;color:var(--text2);margin-bottom:16px">Ce personnage sera supprimé de votre bibliothèque. Cette action est irréversible.</div>
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
    if(typeof _dsRenderCharacterPage==='function')_dsRenderCharacterPage();
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
  const isMJ2=!!(currentTableId&&_hubCache&&_hubTableIsMJ(_hubCache.find(t=>t.id===currentTableId)));
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
  // ⚠️ CHANGEMENT DE CAMPAGNE vs SIMPLE RETOUR — la distinction est tout sauf cosmétique.
  // Revenir au panneau MJ depuis la page Groupe rejoue cette fonction ENTIÈRE (shell.js,
  // _navGoChar). Elle remettait alors à zéro TOUS les états MJ… alors qu'en V2 ce sont des
  // listeners qui les alimentent, et qu'un listener déjà en place ne re-livre rien tant que
  // la base ne bouge pas. D'où les deux symptômes du test du 2026-07-26 : « mes notes du
  // Journal MJ ont disparu » (elles revenaient au F5 ou en publiant — les deux seuls
  // événements qui provoquent une nouvelle livraison) et « mon combat en cours a disparu ».
  // On ne repart donc de zéro que si on change réellement de table ou de campagne.
  const _mjStateStale=(currentTableId!==tableId||currentCampaignId!==campaignId);
  currentTableId=tableId;
  currentCampaignId=campaignId;
  try{localStorage.setItem('lastCamp_'+tableId,campaignId);}catch(e){} // mémo « Reprendre » (P1)
  currentCharacterId=(typeof v2CompatService!=='undefined'&&currentUser)
    ?await v2CompatService.getCurrentCharacterId(campaignId,currentUser.uid)
    :null;
  currentSheetCharacterId=currentCharacterId;
  saveSessionState({tableId,campaignId,characterId:currentCharacterId,mode:'play'}); // lot 0 : F5 rouvre ICI (voir firebase.js)
  if(!tName&&_hubCache){const t=_hubCache.find(t=>t.id===tableId);if(t){tName=t.name;const c=t.campaigns.find(c=>c.id===campaignId);if(c)cName=c.name;}}
  currentTableName=tName||'';
  currentCampaignName=cName||'';
  const tableData=_hubCache&&_hubCache.find(t=>t.id===tableId);
  const asMJ=_hubTableIsMJ(tableData);
  window._currentCampIsMJ=asMJ; // mémorisé pour la barre de modes (label Personnage/MJ + ré-entrée)
  // Active les paquets de la table (rechargement paresseux ensuite via loadXDB) — migration douce de l'ancien modèle.
  if(typeof COMP!=='undefined'){ try{ COMP.applyTableSelection(typeof compTableRequiredPacks==='function'?compTableRequiredPacks(tableData):null); }catch(e){} }
  try{
    if(asMJ){
      // MJ : pas de personnage jouable, on charge le journal + données MJ
      _journalSubTab='mj';_compilationData=null;
      if(_mjStateStale){
        _mjJournal=[];
        _mjPlayersData=[];_mjCombatants=[];_mjNPCs=[];_mjObjets=[];_mjReserve=[];
        _mjCombatStarted=false;_mjCurrentTurn=0;_mjRound=1;_mjCombatLog=[];_mjSelectedNPC=null;
      }
      try{
        const isV2=typeof v2CompatService!=='undefined'&&v2CompatService.isEnabled();
        const mjRef=isV2
          ?fbDb.collection('campaigns').doc(campaignId).collection('gmData').doc('core')
          :fbDb.collection('characters').doc(currentUser.uid+'_'+campaignId+'_mj');
        const mjDoc=await mjRef.get();
        if(mjDoc.exists){
          const d=mjDoc.data();
          if(!isV2)_mjJournal=d.entries||[];
          if(!isV2)_mjNPCs=d.npcs||[];
          _mjObjets=d.objets||[];
          if(!isV2)_mjReserve=d.reserve||[];
          // Un combat PRÉPARÉ (combattants ajoutés, initiative pas encore lancée) doit se
          // retrouver au retour, au même titre qu'un combat démarré : la condition exigeait
          // `active`, si bien que tout le travail de mise en place était perdu dès qu'on
          // quittait l'écran. On restaure dès qu'il y a des combattants, et `active` reste
          // ce qu'il était en base.
          if(Array.isArray(d.combatState?.combatants)&&d.combatState.combatants.length){
            _mjCombatants=d.combatState.combatants;
            _mjCombatStarted=!!d.combatState.active;
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
      if(typeof startMJCombatStateListener==='function')startMJCombatStateListener(campaignId);
      if(typeof startV2NpcListener==='function')startV2NpcListener(tableId);
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
      // ⚠️ V2 ET V1 SONT DEUX CHEMINS DISJOINTS — ne pas les faire se rejoindre.
      // En V1 la fiche est le document characters/{uid}_{campagne}. En V2 elle vit
      // dans characters/{characterId} (identifiant opaque), et c'est la campagne qui
      // désigne le personnage joué (campaigns/{camp}/players/{uid}.currentCharacterId).
      // Le repli V1 était donc atteint dès que la campagne ne désignait aucun
      // personnage : il ne pouvait rien trouver et retombait sur defPlayer(), soit une
      // fiche VIERGE présentée comme celle du joueur (recette du 25/07, anomalie 3).
      const isV2=typeof v2CompatService!=='undefined'&&v2CompatService.isEnabled();
      if(isV2){
        if(currentCharacterId&&!forceNew){
          const sheet=await v2DataService.loadCharacterSheet(currentCharacterId);
          state.players=[migratePlayer(sheet||defPlayer(currentUserData?currentUserData.displayName:'Personnage'))];
        }else if(forceNew||preloadedCharData){
          state.players=[migratePlayer(preloadedCharData||defPlayer(currentUserData?currentUserData.displayName:'Personnage'))];
        }else{
          // Aucun personnage engagé dans cette campagne : on propose ceux du compte
          // (même sélecteur que « ＋ Créer mon personnage ») plutôt qu'une fiche vide.
          // Rien n'a encore été affiché : on reste au Hub, d'où mode:'hub'.
          saveSessionState({mode:'hub'});
          if(typeof openCharOrCreate==='function')openCharOrCreate(tableId,campaignId);
          else showToast('❌ Aucun personnage dans cette campagne.');
          return;
        }
      }else{
        const charRef=fbDb.collection('characters').doc(currentUser.uid+'_'+campaignId);
        const charDoc=await charRef.get();
        if(charDoc.exists&&!forceNew){
          const d=charDoc.data();
          state.players=[migratePlayer(d.characterData)];
        }else{
          state.players=[migratePlayer(preloadedCharData||defPlayer(currentUserData?currentUserData.displayName:'Personnage'))];
        }
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
  if(typeof v2CompatService!=='undefined'&&v2CompatService.isEnabled()){
    const table=_hubCache&&_hubCache.find(item=>item.id===tableId);
    const campaign=table&&(table.campaigns||[]).find(item=>item.id===campId);
    if(!campaign?.chronicleId){showToast('❌ Chronique introuvable.');return;}
    try{
      const entries=await v2GroupService.listChronicleEntries(campaign.chronicleId);
      const campaignsById=new Map((table.campaigns||[]).map(item=>[item.id,item.name]));
      const grouped=[];
      entries.forEach(entry=>{
        let group=grouped.find(item=>item.campaignId===entry.campaignId);
        if(!group){
          group={
            campaignId:entry.campaignId,
            name:campaignsById.get(entry.campaignId)||'Campagne',
            entries:[]
          };
          grouped.push(group);
        }
        group.entries.push(entry);
      });
      const entriesHtml=grouped.map(group=>`<section style="margin-bottom:14px">
        <div class="ds-seclbl" style="margin:4px 0 8px">⚔ ${esc(group.name)}</div>
        ${group.entries.map(entry=>`<article class="ds-card" style="padding:10px;margin-bottom:8px">
          <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:5px">
            <b style="font-size:12px;color:var(--ds-acc-strong)">${esc(entry.authorNameSnapshot||'Membre')}</b>
            <span class="ds-note" style="margin-left:auto">${typeof _dsChronicleDate==='function'?_dsChronicleDate(entry.createdAt):''}${typeof _dsChronicleWasEdited==='function'&&_dsChronicleWasEdited(entry)?' · modifié':''}</span>
          </div>
          <div style="font-size:13px;line-height:1.55;white-space:pre-wrap">${esc(entry.content||'')}</div>
        </article>`).join('')}
      </section>`).join('');
      openModal(`<div class="pt">📜 ${esc(campaign.name||'Chronique')}</div>
        <div style="max-height:68vh;overflow:auto;padding-right:4px">
          ${entries.length?entriesHtml:'<div class="ds-note" style="padding:12px 0">La chronique est encore vide.</div>'}
        </div>`);
    }catch(e){showToast('❌ Lecture impossible : '+e.message);}
    return;
  }
  await enterCampaign(tableId,campId);
  _playerJournalSubTab='chronicle';
  _compilationData=null;
  state.activeTab='historique';
  renderTabBar();
  renderTab();
}
