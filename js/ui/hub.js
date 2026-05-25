function genCode(){return Math.random().toString(36).slice(2,8).toUpperCase();}
let _hubCache=null;

async function toggleCampExpand(tableId,campId){
  const key=tableId+'_'+campId;
  _expandedCamp=(_expandedCamp===key)?null:key;
  // Recharge le hub HTML sans refaire les requÃªtes Firestore (utilise le cache)
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
                if(cdata.ejectedFromCampaign)continue;
                const charData=cdata.characterData||{};
                const priv=charData.privacy||{name:true,hp:true,abilities:false,notes:false};
                const uid=cdata.userId;
                let playerName='Joueur';let playerAvatar='âš”';
                try{const udoc=await fbDb.collection('users').doc(uid).get();if(udoc.exists){const u=udoc.data();playerName=u.displayName||'Joueur';playerAvatar=u.avatar||'âš”';}}catch(e){}
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
    // RÃ©cupÃ¨re les noms/avatars manquants pour les anciens membres
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
            t.memberAvatars[uid]=d.avatar||'âš”';
          }
        }catch(e){}
      }
    }
    _hubCache=tablesWithCamps;
    const mjBadge=document.getElementById('hubMJBadge');
    if(mjBadge) mjBadge.style.display='none';
    hub.innerHTML=renderHubHTML(tablesWithCamps);
    const params=new URLSearchParams(window.location.search);
    const joinCode=params.get('join');
    if(joinCode) setTimeout(()=>promptJoinTable(joinCode),300);
  }catch(e){hub.innerHTML=`<div style="color:#e53935;padding:16px">Erreur: ${e.message}</div>`;}
}

function campImgOnLoad(img){
  if(img.naturalHeight>img.naturalWidth){
    img.style.cssText='float:right;width:38%;max-width:130px;border-radius:8px;object-fit:cover;margin:0 0 8px 10px;display:block';
  }else{
    img.style.cssText='width:100%;max-height:200px;border-radius:8px;object-fit:cover;margin-bottom:10px;display:block';
  }
}
function renderHubHTML(tables){
  const tableCards=tables.length?tables.map(t=>{
    const isMJ=t.mjId===currentUser.uid;
    const memberNames=t.memberNames||{};
    const memberAvatars=t.memberAvatars||{};
    const memberBadges=(t.memberIds||[]).filter(uid=>uid!==t.mjId).map(uid=>`<span class="member-badge">${memberAvatars[uid]||'âš”'} ${esc(memberNames[uid]||'Joueur')}</span>`).join('');
    const campCards=t.campaigns.length?t.campaigns.map(c=>{
      const key=t.id+'_'+c.id;
      const expanded=_expandedCamp===key;
      let expandedHtml='';
      if(expanded){
        const charInfo=t._charInfos&&t._charInfos[c.id];
        const imgHtml=c.imageUrl?`<img src="${esc(c.imageUrl)}" style="width:100%;max-height:200px;border-radius:8px;object-fit:cover;margin-bottom:10px;display:block" onload="campImgOnLoad(this)" onerror="this.style.display='none'">`:'';
        const campParticipants=t._campParticipants&&t._campParticipants[c.id]||[];
        const participantHtml=campParticipants.length?`<div style="margin-top:10px"><div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Personnages</div>
          ${campParticipants.map(pp=>{
            const isMe=pp.uid===currentUser.uid;
            const fd=pp.fullData||{};
            const pPortrait=fd.portrait||fd.equipPortrait;
            return`<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:rgba(255,255,255,.03);border-radius:6px;margin-bottom:4px">
              ${pPortrait
                ?`<img src="${pPortrait}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;border:1.5px solid ${isMe?'var(--cp)':'var(--border)'};flex-shrink:0">`
                :`<div style="width:30px;height:30px;border-radius:50%;background:var(--surface2);border:1.5px solid ${isMe?'var(--cp)':'var(--border)'};display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">${pp.avatar||'âš”'}</div>`}
              <div style="flex:1;min-width:0">
                <div style="display:flex;align-items:center;gap:4px">
                  <span style="font-size:12px;font-weight:600;color:${isMe?'var(--cp)':'var(--text)'}">${esc(pp.charName||'?')}</span>
                  <span style="font-size:9px;color:var(--text3)">${isMe?'Moi':esc(pp.playerName||'')}</span>
                </div>
                <div style="font-size:10px;color:var(--text3)">${esc(pp.charClass||'')}</div>
              </div>
              ${isMJ
                ?`<button class="btn bsm" style="color:#e53935;border-color:rgba(229,57,53,.35);flex-shrink:0;font-size:10px;padding:2px 6px" onclick="hubKickConfirm('${t.id}','${pp.uid}','${esc(pp.playerName||'ce joueur')}')">âœ•</button>`
                :`<button class="btn bsm" style="flex-shrink:0;font-size:12px;padding:2px 7px;border-color:rgba(200,168,75,.3)" title="${isMe?'Ouvrir ma fiche':'Voir la fiche'}" onclick="${isMe?`enterCampaign('${t.id}','${c.id}')`:`openHubPlayerSheet('${pp.uid}','${c.id}')`}">ðŸ“‹</button>`}
            </div>`;
          }).join('')}
        </div>`:'';
        const charBlock=isMJ
          ?`<button class="btn bac" style="width:100%;margin-top:8px;font-weight:600" onclick="enterCampaign('${t.id}','${c.id}')">ðŸŽ² GÃ©rer la campagne</button>`
          :(charInfo
            ?`<div style="margin-top:8px">
                <div style="display:flex;align-items:center;gap:6px;padding:8px;background:rgba(200,168,75,.06);border-radius:6px 6px 0 0;border:1px solid rgba(200,168,75,.15);border-bottom:none">
                  <span style="font-size:18px">${currentUserData&&currentUserData.avatar||'âš”'}</span>
                  <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600">${esc(charInfo.charName||'?')}</div><div style="font-size:11px;color:var(--text3)">${esc(charInfo.charClass||'')}</div></div>
                  <button class="btn bsm" style="color:#e53935;border-color:rgba(229,57,53,.35);flex-shrink:0" onclick="playerLeaveCharacter('${c.id}')">âœ• Quitter</button>
                </div>
                <button class="btn bac" style="width:100%;font-weight:600;border-radius:0 0 6px 6px" onclick="joinGroupOnly('${t.id}','${c.id}')">ðŸ‘¥ Rejoindre le groupe</button>
              </div>`
            :`<button class="btn bprimary" style="width:100%;margin-top:8px" onclick="openCharOrCreate('${t.id}','${c.id}')">+ CrÃ©er mon personnage</button>`);
        const mjEditHtml=isMJ?`
          <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">
            <button class="btn bsm" onclick="openEditCampaign('${t.id}','${c.id}')">âœ Modifier</button>
          </div>`:'';
        const chronicleBtn=!isMJ?`<button class="btn bsm" style="width:100%;margin-top:6px" onclick="openCampChronicle('${t.id}','${c.id}')">ðŸ“œ Voir les Chroniques</button>`:'';
        expandedHtml=`<div class="camp-expanded">${imgHtml}
          ${c.detailedDesc?`<p style="font-size:12px;color:var(--text2);line-height:1.6;margin-bottom:8px">${esc(c.detailedDesc)}</p>`:''}
          <div style="clear:both"></div>
          ${charBlock}${chronicleBtn}${participantHtml}${mjEditHtml}
        </div>`;
      }
      return`<div>
        <div class="camp-card" onclick="toggleCampExpand('${t.id}','${c.id}')">
          <div><div class="camp-card-name">${esc(c.name)}</div>
            ${c.description?`<div style="font-size:11px;color:var(--text3);margin-top:2px">${esc(c.description)}</div>`:''}
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="camp-card-status ${c.status==='finished'?'camp-status-finished':'camp-status-active'}">${c.status==='finished'?'TerminÃ©e':'Active'}</span>
            <span style="color:var(--cp);transition:transform .2s;${expanded?'transform:rotate(90deg)':''}"">â€º</span>
          </div>
        </div>${expandedHtml}</div>`;
    }).join(''):`<div style="font-size:12px;color:var(--text3);font-style:italic;padding:6px 0">Aucune campagne pour l'instant.</div>`;
    return`<div class="table-card">
      <div class="table-card-hdr">
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <div class="table-card-name" style="margin:0">${esc(t.name)}</div>
            ${isMJ
              ?`<span style="font-size:10px;font-family:var(--F);letter-spacing:.07em;color:var(--cp);background:rgba(200,168,75,.12);border:1px solid rgba(200,168,75,.35);border-radius:10px;padding:2px 8px;flex-shrink:0">ðŸŽ² MaÃ®tre de Jeu</span>`
              :`<span style="font-size:10px;font-family:var(--F);letter-spacing:.07em;color:#7eb8f7;background:rgba(126,184,247,.1);border:1px solid rgba(126,184,247,.3);border-radius:10px;padding:2px 8px;flex-shrink:0">âš” Joueur</span>`}
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;flex-wrap:wrap">
            <span style="font-size:11px;color:var(--text3)">MJ :</span>
            <span class="member-badge" style="border-color:rgba(200,168,75,.3);color:var(--cp)">${t.mjAvatar||'ðŸŽ²'} ${esc(t.mjName||'MJ')}</span>
          </div>
          ${memberBadges?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:4px"><span style="font-size:10px;color:var(--text3);align-self:center">Joueurs :</span>${memberBadges}</div>`:''}
        </div>
        <div style="display:flex;gap:6px;align-items:flex-start">
          ${isMJ?`<button class="btn bsm" onclick="openCreateCampaign('${t.id}')">+ Campagne</button><button class="btn bsm" onclick="openTableSettings('${t.id}','${esc(t.name)}','${t.inviteCode}')">âš™</button>`:''}
        </div>
      </div>
      ${campCards}
      ${isMJ?`<div class="invite-box" style="margin-top:10px">ðŸ”— Invitation : <button class="btn bsm" onclick="copyInviteLink('${t.inviteCode}')" style="margin-left:4px">Copier le lien</button></div>`:''}
    </div>`;
  }).join(''):
    `<div class="hub-empty">Aucune table. CrÃ©ez une table ou rejoignez-en une !</div>`;
  return`
    <div class="hub-section">
      <div class="hub-section-title">
        <span>âš” Mes Tables</span>
        <div style="display:flex;gap:6px">
          <button class="btn bsm bprimary" onclick="openCreateTable()">+ Nouvelle table</button>
          <button class="btn bsm" onclick="openJoinTable()">+ Rejoindre</button>
        </div>
      </div>
      ${tableCards}
    </div>`;
}

// â”€â”€â”€ CRÃ‰ER UNE TABLE (MJ) â”€â”€â”€
function openCreateTable(){
  const STD_COMP=[
    {id:'spells',label:'ðŸ“– Sorts SRD'},
    {id:'items',label:'âš”ï¸ Objets SRD'},
    {id:'monsters',label:'ðŸ‘¾ Monstres SRD'},
    {id:'feats',label:'ðŸŒŸ Dons SRD'},
    {id:'races',label:'ðŸ§ Races SRD'},
    {id:'backgrounds',label:'ðŸ“œ Historiques SRD'},
    {id:'classes',label:'ðŸ›¡ Classes SRD'},
  ];
  const compIds=Object.keys(_mjCompLib);
  const stdHtml=STD_COMP.map(s=>`<label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer;font-size:13px">
    <input type="checkbox" id="std_${s.id}" checked style="accent-color:var(--cp)"> ${s.label}
  </label>`).join('');
  const custHtml=compIds.length?compIds.map(id=>`<label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer;font-size:13px">
    <input type="checkbox" id="cust_${id}" checked style="accent-color:var(--cp)"> ðŸ§° ${esc(_mjCompLib[id].name)}
  </label>`).join('')
    :`<div style="font-size:12px;color:var(--text3);font-style:italic">Aucun compendium perso â€” crÃ©ez-en un dans votre profil.</div>`;
  openModal(`<div class="pt">ðŸŽ² Nouvelle table</div>
    <div class="fl mb6">Nom de la table</div>
    <input class="fi" id="newTableName" placeholder="Ex: Table du vendredi" style="margin-bottom:14px">
    <details class="acc" style="margin-bottom:12px">
      <summary>ðŸ§° Compendiums disponibles</summary>
      <div class="acc-body">
        <div style="font-size:11px;color:var(--text3);margin-bottom:8px">Choisissez les compendiums actifs pour cette table.</div>
        <div style="font-size:10px;color:var(--cp);text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px">Standard (SRD)</div>
        ${stdHtml}
        ${compIds.length?`<div style="font-size:10px;color:var(--cp);text-transform:uppercase;letter-spacing:.07em;margin:10px 0 4px">PersonnalisÃ©s</div>${custHtml}`:''}
      </div>
    </details>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="confirmCreateTable()">âœ“ CrÃ©er</button>
    </div>`);
  setTimeout(()=>{const i=document.getElementById('newTableName');if(i)i.focus();},50);
}
async function confirmCreateTable(){
  const name=document.getElementById('newTableName').value.trim();
  if(!name){showToast('âŒ Donnez un nom Ã  la table.');return;}
  const STD_IDS=['spells','items','monsters','feats','races','backgrounds','classes'];
  const activeStd=STD_IDS.filter(id=>document.getElementById('std_'+id)?.checked!==false);
  const activeCustom=Object.keys(_mjCompLib).filter(id=>document.getElementById('cust_'+id)?.checked!==false);
  const inviteCode=genCode();
  try{
    await fbDb.collection('tables').add({
      name,mjId:currentUser.uid,mjName:currentUserData.displayName,mjAvatar:currentUserData.avatar||'ðŸŽ²',
      inviteCode,memberIds:[currentUser.uid],
      memberNames:{[currentUser.uid]:currentUserData.displayName},
      memberAvatars:{[currentUser.uid]:currentUserData.avatar||'ðŸŽ²'},
      activeStdCompendiums:activeStd,
      activeCustomCompendiums:activeCustom,
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    closeModal();showToast('âœ… Table "'+name+'" crÃ©Ã©e !');renderHub();
  }catch(e){showToast('âŒ Erreur : '+e.message);}
}

// â”€â”€â”€ CRÃ‰ER UNE CAMPAGNE (MJ) â”€â”€â”€
function openCreateCampaign(tableId){
  openModal(`<div class="pt">âš” Nouvelle campagne</div>
    <div class="fl mb6">Nom de la campagne</div>
    <input class="fi" id="newCampName" placeholder="Ex: La Mine Perdue" style="margin-bottom:10px">
    <div class="fl mb6">Description (optionnel)</div>
    <input class="fi" id="newCampDesc" placeholder="Courte description..." style="margin-bottom:16px">
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="confirmCreateCampaign('${tableId}')">âœ“ CrÃ©er</button>
    </div>`);
}
async function confirmCreateCampaign(tableId){
  const name=document.getElementById('newCampName').value.trim();
  const desc=document.getElementById('newCampDesc').value.trim();
  if(!name){showToast('âŒ Donnez un nom Ã  la campagne.');return;}
  try{
    await fbDb.collection('campaigns').add({
      tableId,name,description:desc,status:'active',
      ownerId:currentUser.uid,
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    closeModal();showToast('âœ… Campagne "'+name+'" crÃ©Ã©e !');renderHub();
  }catch(e){showToast('âŒ Erreur : '+e.message);}
}

// â”€â”€â”€ PARAMÃˆTRES TABLE (MJ) â”€â”€â”€
function openTableSettings(tableId,tableName,inviteCode){
  openModal(`<div class="pt">âš™ Table : ${esc(tableName)}</div>
    <div class="fl mb6" style="margin-top:0">Lien d'invitation</div>
    <div class="invite-box" style="margin-bottom:16px">Code : <span class="invite-code">${inviteCode}</span><button class="btn bsm" onclick="copyInviteLink('${inviteCode}')" style="margin-left:4px">Copier lien</button></div>
    <div style="display:flex;gap:8px">
      <button class="btn bdanger" style="flex:1" onclick="confirmDeleteTable('${tableId}')">ðŸ—‘ Supprimer la table</button>
      <button class="btn bac" style="flex:2" onclick="closeModal()">Fermer</button>
    </div>`);
}
async function confirmDeleteTable(tableId){
  if(!confirm('Supprimer cette table et toutes ses campagnes ? Cette action est irrÃ©versible.'))return;
  try{
    const camps=await fbDb.collection('campaigns').where('tableId','==',tableId).get();
    const batch=fbDb.batch();
    camps.docs.forEach(d=>batch.delete(d.ref));
    batch.delete(fbDb.collection('tables').doc(tableId));
    await batch.commit();
    closeModal();showToast('ðŸ—‘ Table supprimÃ©e.');renderHub();
  }catch(e){showToast('âŒ Erreur : '+e.message);}
}

// â”€â”€â”€ MODIFIER UNE CAMPAGNE (MJ) â”€â”€â”€
function openEditCampaign(tableId,campId){
  const t=_hubCache&&_hubCache.find(t=>t.id===tableId);
  const c=t&&t.campaigns.find(c=>c.id===campId);
  if(!c)return;
  openModal(`<div class="pt">âœ Modifier : ${esc(c.name)}</div>
    <div class="fl mb6">Description courte</div>
    <input class="fi" id="editCampDesc" value="${esc(c.description||'')}" style="margin-bottom:10px">
    <div class="fl mb6">Description dÃ©taillÃ©e (ambiance, histoire...)</div>
    <textarea class="fi" id="editCampDetailedDesc" rows="4" style="resize:vertical;margin-bottom:10px">${esc(c.detailedDesc||'')}</textarea>
    <div class="fl mb6">Image (URL directe vers une image)</div>
    <input class="fi" id="editCampImg" value="${esc(c.imageUrl||'')}" placeholder="https://..." style="margin-bottom:16px">
    <div class="fl mb6">Statut</div>
    <div style="display:flex;gap:8px;margin-bottom:16px">
      <button class="btn${c.status!=='finished'?' bac':''}" onclick="this.dataset.v='active';document.querySelectorAll('.camp-status-opt').forEach(b=>b.className='btn camp-status-opt');this.className='btn bac camp-status-opt'" data-v="active">Active</button>
      <button class="btn camp-status-opt${c.status==='finished'?' bac':''}" onclick="this.dataset.v='finished'" data-v="finished">TerminÃ©e</button>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="saveEditCampaign('${tableId}','${campId}')">ðŸ’¾ Sauvegarder</button>
    </div>
    <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border)">
      <button class="btn" style="width:100%;color:#e53935;border-color:rgba(229,57,53,.35)" onclick="openDeleteCampaign('${tableId}','${campId}')">ðŸ—‘ Supprimer cette campagne</button>
    </div>`);
}
function openDeleteCampaign(tableId,campId){
  const t=_hubCache&&_hubCache.find(t=>t.id===tableId);
  const c=t&&t.campaigns.find(c=>c.id===campId);
  const campName=c?c.name:'cette campagne';
  openModal(`<div class="pt" style="color:#e53935">ðŸ—‘ Supprimer la campagne ?</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:8px">Vous Ãªtes sur le point de supprimer :</div>
    <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:12px;padding:8px 12px;background:rgba(229,57,53,.08);border:1px solid rgba(229,57,53,.3);border-radius:6px">${esc(campName)}</div>
    <div style="font-size:12px;color:var(--text3);margin-bottom:16px;line-height:1.6">Cette action supprimera dÃ©finitivement la campagne ainsi que <b style="color:var(--text2)">tous les personnages</b> crÃ©Ã©s par les joueurs dans cette campagne. Elle est <b style="color:#e53935">irrÃ©versible</b>.</div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="openEditCampaign('${tableId}','${campId}')">â† Retour</button>
      <button class="btn" style="flex:2;color:#e53935;border-color:rgba(229,57,53,.5)" onclick="doDeleteCampaign('${tableId}','${campId}')">ðŸ—‘ Confirmer la suppression</button>
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
    showToast('ðŸ—‘ Campagne supprimÃ©e.');
    renderHub();
  }catch(e){showToast('âŒ Erreur : '+e.message);}
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
    // Mise Ã  jour du cache local
    const t=_hubCache&&_hubCache.find(t=>t.id===tableId);
    if(t){const c=t.campaigns.find(c=>c.id===campId);if(c){c.description=desc;c.detailedDesc=detailed;c.imageUrl=img;c.status=status;}}
    closeModal();showToast('âœ… Campagne mise Ã  jour !');
    document.getElementById('hubContent').innerHTML=renderHubHTML(_hubCache);
  }catch(e){showToast('âŒ Erreur : '+e.message);}
}

// â”€â”€â”€ REJOINDRE UNE TABLE (JOUEUR) â”€â”€â”€
function openJoinTable(){
  openModal(`<div class="pt">ðŸ”— Rejoindre une table</div>
    <div style="font-size:12px;color:var(--text2);margin-bottom:12px">Entrez le code d'invitation partagÃ© par votre MJ.</div>
    <div class="fl mb6">Code d'invitation</div>
    <input class="fi" id="joinCode" placeholder="Ex: AB12CD" style="margin-bottom:16px;text-transform:uppercase;letter-spacing:.1em;font-size:16px;text-align:center">
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="confirmJoinTable()">Rejoindre â†’</button>
    </div>`);
}
async function promptJoinTable(code){
  openModal(`<div class="pt">ðŸ”— Invitation reÃ§ue</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:16px">Vous avez Ã©tÃ© invitÃ© Ã  rejoindre une table. Code : <strong style="color:var(--cp)">${esc(code)}</strong></div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Ignorer</button>
      <button class="btn bac" style="flex:2" onclick="doJoinTable('${esc(code)}')">Rejoindre â†’</button>
    </div>`);
}
async function confirmJoinTable(){
  const code=(document.getElementById('joinCode').value||'').trim().toUpperCase();
  if(!code){showToast('âŒ Entrez un code.');return;}
  await doJoinTable(code);
}
async function doJoinTable(code){
  try{
    const snap=await fbDb.collection('tables').where('inviteCode','==',code).limit(1).get();
    if(snap.empty){showToast('âŒ Code invalide.');return;}
    const tableDoc=snap.docs[0];
    if(tableDoc.data().mjId===currentUser.uid){showToast('Vous Ãªtes dÃ©jÃ  le MJ de cette table.');closeModal();return;}
    const members=tableDoc.data().memberIds||[];
    if(members.includes(currentUser.uid)){showToast('Vous Ãªtes dÃ©jÃ  dans cette table.');closeModal();return;}
    await tableDoc.ref.update({
      memberIds:firebase.firestore.FieldValue.arrayUnion(currentUser.uid),
      ['memberNames.'+currentUser.uid]:currentUserData.displayName,
      ['memberAvatars.'+currentUser.uid]:currentUserData.avatar||'âš”'
    });
    closeModal();showToast('âœ… Vous avez rejoint la table "'+tableDoc.data().name+'" !');
    // Nettoie le paramÃ¨tre URL
    window.history.replaceState({},'',window.location.pathname);
    renderHub();
  }catch(e){showToast('âŒ Erreur : '+e.message);}
}

// â”€â”€â”€ QUITTER UNE CAMPAGNE (JOUEUR) â”€â”€â”€
function hubKickConfirm(tableId,uid,playerName){
  openModal(`<div class="pt" style="color:#e53935">âš ï¸ Retirer ce joueur ?</div>
    <div style="font-size:13px;color:var(--text2);margin:10px 0 18px"><b>${esc(playerName)}</b> sera retirÃ© de la table et ne pourra plus y accÃ©der.<br><span style="font-size:11px;color:var(--text3)">Son personnage reste dans sa bibliothÃ¨que personnelle.</span></div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn" style="flex:2;color:#e53935;border-color:rgba(229,57,53,.5);font-weight:600" onclick="hubKickMember('${tableId}','${uid}')">âœ“ Retirer de la table</button>
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
    showToast('âœ… Joueur retirÃ© de la table.');
    renderHub();
  }catch(e){showToast('âŒ Erreur : '+e.message);}
}
function playerLeaveCharacter(campId){
  window._pendingLeave=campId;
  openModal(`<div class="pt" style="color:#e53935">Quitter la campagne ?</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:16px">Votre personnage sera dÃ©finitivement supprimÃ© de cette campagne. Cette action est irrÃ©versible.</div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn" style="flex:2;color:#e53935;border-color:rgba(229,57,53,.5)" onclick="confirmPlayerLeave()">âœ• Confirmer</button>
    </div>`);
}
async function confirmPlayerLeave(){
  const campId=window._pendingLeave;
  if(!campId||!currentUser)return;
  closeModal();
  try{
    await fbDb.collection('characters').doc(currentUser.uid+'_'+campId).delete();
    await fbDb.collection('users').doc(currentUser.uid).update({['charLib.'+campId]:firebase.firestore.FieldValue.delete()});
    if(currentUserData&&currentUserData.charLib)delete currentUserData.charLib[campId];
    showToast('âœ… Personnage supprimÃ© de la campagne.');
    renderHub();
  }catch(e){showToast('âŒ Erreur : '+e.message);}
}

// â”€â”€â”€ SUPPRIMER DE LA BIBLIOTHÃˆQUE (JOUEUR) â”€â”€â”€
function deleteCharFromLib(campId){
  const c=currentUserData&&currentUserData.charLib&&currentUserData.charLib[campId];
  const charName=c&&c.charName||'ce personnage';
  window._pendingDeleteLib=campId;
  openModal(`<div class="pt" style="color:#e53935">ðŸ—‘ Supprimer "${esc(charName)}" ?</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:16px">Ce personnage sera supprimÃ© de votre bibliothÃ¨que et de la campagne. Cette action est irrÃ©versible.</div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn" style="flex:2;color:#e53935;border-color:rgba(229,57,53,.5)" onclick="confirmDeleteCharLib()">ðŸ—‘ Supprimer</button>
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
    showToast('âœ… Personnage supprimÃ©.');
    openUserSettings();
  }catch(e){showToast('âŒ Erreur : '+e.message);}
}

// â”€â”€â”€ COPIER LE LIEN â”€â”€â”€
function viewCharSheet(uid,campId){
  // Cherche les donnÃ©es du personnage dans le cache
  let pp=null;
  if(_hubCache){for(const t of _hubCache){if(t._campParticipants){for(const [cid,parts] of Object.entries(t._campParticipants)){if(cid===campId){pp=parts.find(p=>p.uid===uid);break;}}}if(pp)break;}}
  if(!pp){showToast('âŒ Personnage introuvable.');return;}
  const p=pp.fullData||{};
  const priv=pp.priv||{};
  const isMJ2=!!(currentTableId&&_hubCache&&(_hubCache.find(t=>t.id===currentTableId)||{}).mjId===currentUser.uid);
  const isOwn=uid===currentUser.uid;
  const canSee=tab=>(isMJ2||isOwn||priv[tab]!==false);
  const cls=(p.classes||[]).map(c=>c.name+' niv.'+c.level).join(' / ')||'?';
  const hidden=`<span style="color:var(--text3);font-style:italic;font-size:12px">ðŸ”’ Non partagÃ©</span>`;
  const portrait=p.portrait||p.equipPortrait;
  openModal(`
    ${canSee('perso')&&portrait?`<div style="text-align:center;margin-bottom:10px"><img src="${portrait}" style="width:72px;height:72px;border-radius:50%;object-fit:cover;border:2px solid rgba(200,168,75,.4)"></div>`:''}
    <div class="pt" style="margin-bottom:10px">${pp.avatar||'âš”'} ${canSee('perso')?esc(pp.charName||'?'):'???'} <span style="font-weight:400;font-size:11px;color:var(--text3)">â€” ${esc(pp.playerName||'')}</span></div>
    <div style="max-height:70vh;overflow-y:auto;padding-right:4px">
    ${canSee('perso')?`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:10px"><div class="fl mb6">Classe & Niveau</div><div style="font-size:13px">${esc(cls)}</div></div>
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:10px"><div class="fl mb6">Race</div><div style="font-size:13px">${esc(p.race||'?')}</div></div>
    </div>`:hidden}
    ${canSee('combat')?`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:8px">
      <div class="fl mb6">Combat</div>
      <div style="display:flex;gap:16px"><div><div style="font-size:10px;color:var(--text3)">PV</div><div style="font-size:15px;font-weight:600;color:#4caf50">${p.hp||0}/${p.hpMax||0}</div></div><div><div style="font-size:10px;color:var(--text3)">CA</div><div style="font-size:15px;font-weight:600">${p.ac||10}</div></div></div>
    </div>`:''}
    ${canSee('competences')?`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:8px">
      <div class="fl mb6">CaractÃ©ristiques</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">${(p.abilities||[]).map((v,i)=>`<div style="text-align:center"><div style="font-size:9px;color:var(--text3)">${['FOR','DEX','CON','INT','SAG','CHA'][i]}</div><div style="font-size:16px;font-weight:600">${v}</div></div>`).join('')}</div>
    </div>`:''}
    ${canSee('historique')&&p.backstory?`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:8px"><div class="fl mb6">Backstory</div><div style="font-size:12px;color:var(--text2);white-space:pre-wrap">${esc(p.backstory)}</div></div>`:''}
    ${(isMJ2||isOwn)&&p.secrets?`<div style="background:rgba(200,168,75,.06);border:1px solid rgba(200,168,75,.3);border-radius:8px;padding:10px;margin-bottom:8px"><div class="fl mb6" style="color:var(--cp)">ðŸ” Secrets</div><div style="font-size:12px;color:var(--text2);white-space:pre-wrap">${esc(p.secrets)}</div></div>`:''}
    </div>
    <div style="display:flex;justify-content:flex-end;margin-top:8px">
      <button class="btn" onclick="closeModal()">Fermer</button>
    </div>`);
}

function copyInviteLink(code){
  const url=`${window.location.origin}${window.location.pathname}?join=${code}`;
  navigator.clipboard.writeText(url).then(()=>showToast('ðŸ”— Lien copiÃ© dans le presse-papiers !'));
}

// â”€â”€â”€ ENTRER DANS UNE CAMPAGNE â”€â”€â”€
async function enterCampaign(tableId,campaignId,tName,cName,preloadedCharData){
  currentTableId=tableId;
  currentCampaignId=campaignId;
  if(!tName&&_hubCache){const t=_hubCache.find(t=>t.id===tableId);if(t){tName=t.name;const c=t.campaigns.find(c=>c.id===campaignId);if(c)cName=c.name;}}
  currentTableName=tName||'';
  currentCampaignName=cName||'';
  const tableData=_hubCache&&_hubCache.find(t=>t.id===tableId);
  const asMJ=!!(tableData&&tableData.mjId===currentUser.uid);
  try{
    if(asMJ){
      // MJ : pas de personnage jouable, on charge le journal + donnÃ©es MJ
      _mjJournal=[];_journalSubTab='mj';_compilationData=null;
      _mjPlayersData=[];_mjCombatants=[];_mjNPCs=[];_mjObjets=[];
      _mjCombatStarted=false;_mjCurrentTurn=0;_mjRound=1;_mjCombatLog=[];_mjSelectedNPC=null;
      try{
        const mjRef=fbDb.collection('characters').doc(currentUser.uid+'_'+campaignId+'_mj');
        const mjDoc=await mjRef.get();
        if(mjDoc.exists){
          const d=mjDoc.data();
          _mjJournal=d.entries||[];
          _mjNPCs=d.npcs||[];
          _mjObjets=d.objets||[];
        }
      }catch(e){}
      showMJScreen();
      // ArrÃªte les Ã©ventuels listeners prÃ©cÃ©dents avant d'en ouvrir de nouveaux
      stopAllListeners();
      // Lance le listener temps rÃ©el pour les joueurs (remplace loadMJPlayersData)
      startMJPlayersListener(campaignId);
      if(currentTableId)startWhisperListener(currentTableId,currentUser.uid);
      // Charge la bibliothÃ¨que de compendiums puis filtre selon les compendiums actifs de la table
      if(!Object.keys(_mjCompLib).length)await loadMJCompLib();
      const activeCustomIds=tableData?.activeCustomCompendiums||Object.keys(_mjCompLib);
      _mjActiveCompId=activeCustomIds.find(id=>_mjCompLib[id])||Object.keys(_mjCompLib)[0]||null;
      _mjCustomFeats=_mjActiveCompId?(_mjCompLib[_mjActiveCompId].feats||[]):[];
      _refreshMjPool();
      renderMJContent();
      // Chargement silencieux des petits compendiums en arriÃ¨re-plan
      loadFeatsDB();loadRacesDB();loadBackgroundsDB();loadClassesDB();
    }else{
      // Joueur : charge ou crÃ©e le personnage (lecture initiale one-shot)
      const charRef=fbDb.collection('characters').doc(currentUser.uid+'_'+campaignId);
      const charDoc=await charRef.get();
      if(charDoc.exists){
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
      // Lance les listeners temps rÃ©el
      currentTableMjId=tableData?.mjId||null;
      stopAllListeners();
      _groupData=[];
      startPlayerListener(campaignId);
      startGroupListener(campaignId);
      if(currentTableMjId)startCombatListener(campaignId,currentTableMjId);
      if(currentTableId)startWhisperListener(currentTableId,currentUser.uid);
    }
  }catch(e){showToast('âŒ Erreur chargement : '+e.message);}
}

async function openCampChronicle(tableId,campId){
  await enterCampaign(tableId,campId);
  _playerJournalSubTab='chronicle';
  _compilationData=null;
  state.activeTab='journal';
  renderTabBar();
  renderTab();
}

