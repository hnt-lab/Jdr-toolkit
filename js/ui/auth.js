// â”€â”€â”€ AUTH UI â”€â”€â”€
function switchAuthTab(tab){
  document.getElementById('formLogin').style.display=tab==='login'?'':'none';
  document.getElementById('formRegister').style.display=tab==='register'?'':'none';
  document.getElementById('authTabLogin').className=tab==='login'?'on':'';
  document.getElementById('authTabRegister').className=tab==='register'?'on':'';
  document.getElementById('authError').style.display='none';
}
function selectAvatar(av){
  selectedAvatar=av;
  document.querySelectorAll('.avatar-opt').forEach(el=>{
    el.className='avatar-opt'+(el.textContent===av?' on':'');
  });
}
function showAuthError(msg){const el=document.getElementById('authError');el.textContent=msg;el.style.display='block';}

async function doLogin(){
  const email=document.getElementById('loginEmail').value.trim();
  const pw=document.getElementById('loginPassword').value;
  if(!email||!pw){showAuthError('Remplissez tous les champs.');return;}
  try{await fbAuth.signInWithEmailAndPassword(email,pw);}
  catch(e){const m={'auth/user-not-found':'Aucun compte avec cet email.','auth/wrong-password':'Mot de passe incorrect.','auth/invalid-email':'Email invalide.','auth/invalid-credential':'Email ou mot de passe incorrect.'};showAuthError(m[e.code]||'Erreur : '+e.message);}
}
async function doResetPassword(){
  const email=document.getElementById('loginEmail').value.trim();
  if(!email){showAuthError('Entrez votre email ci-dessus, puis cliquez sur "Mot de passe oubliÃ© ?".');return;}
  try{
    await fbAuth.sendPasswordResetEmail(email);
    document.getElementById('authError').style.display='none';
    showToast('ðŸ“§ Email de rÃ©initialisation envoyÃ© Ã  '+email);
  }catch(e){const m={'auth/user-not-found':'Aucun compte avec cet email.','auth/invalid-email':'Email invalide.'};showAuthError(m[e.code]||'Erreur : '+e.message);}
}
async function doRegister(){
  const name=document.getElementById('regName').value.trim();
  const email=document.getElementById('regEmail').value.trim();
  const pw=document.getElementById('regPassword').value;
  if(!name||!email||!pw){showAuthError('Remplissez tous les champs.');return;}
  if(pw.length<6){showAuthError('Mot de passe : 6 caractÃ¨res minimum.');return;}
  try{
    const cred=await fbAuth.createUserWithEmailAndPassword(email,pw);
    await fbDb.collection('users').doc(cred.user.uid).set({displayName:name,avatar:selectedAvatar,email,charLib:{},createdAt:firebase.firestore.FieldValue.serverTimestamp()});
    await cred.user.updateProfile({displayName:name});
    cred.user.sendEmailVerification().catch(()=>{});
    showToast('ðŸ“§ Un email de vÃ©rification a Ã©tÃ© envoyÃ© Ã  '+email);
  }catch(e){const m={'auth/email-already-in-use':'Email dÃ©jÃ  utilisÃ©.','auth/invalid-email':'Email invalide.','auth/weak-password':'Mot de passe trop faible.'};showAuthError(m[e.code]||'Erreur : '+e.message);}
}
async function doLogout(){
  stopAllListeners();
  await fbAuth.signOut();
  state={players:[],activeIdx:0,activeTab:'perso'};
  currentTableId=null;currentCampaignId=null;
  _userInfoCache={};
  _mjCompLib={};_mjActiveCompId=null;
}

function openUserSettings(){
  if(!currentUserData)return;
  const av=currentUserData.avatar||'âš”';
  const avatars=['âš”','ðŸ§™','ðŸ¹','ðŸ›¡','ðŸŽ²','ðŸ—¡','âœ¨','ðŸ‰','ðŸ§','ðŸŒ™','ðŸ”®','ðŸŒŸ'];
  const charLib=currentUserData.charLib||{};
  const chars=Object.entries(charLib);
  const charHtml=chars.length?chars.map(([campId,c])=>{
    const isSolo=c.tableName==='__solo__';
    const subtitle=isSolo
      ?`${esc(c.charClass||'Classe inconnue')} â€¢ BibliothÃ¨que personnelle`
      :`${esc(c.charClass||'')} â€¢ ${esc(c.campaignName||'')} (${esc(c.tableName||'')})`;
    const actionLabel=isSolo?'Ã‰diter â†’':'Jouer â†’';
    return`<div class="charlib-item" onclick="enterCampaignFromLib('${campId}','${esc(c.tableName||'')}','${esc(c.campaignName||'')}')">
      <span style="font-size:20px">${currentUserData.avatar||'âš”'}</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:600;color:var(--text)">${esc(c.charName||'?')}</div>
        <div style="font-size:11px;color:var(--text3)">${subtitle}</div>
      </div>
      <span style="color:var(--cp);font-size:11px;flex-shrink:0">${actionLabel}</span>
      <button class="btn bsm" style="flex-shrink:0;margin-left:4px" onclick="event.stopPropagation();exportCharacter('${campId}')" title="Exporter en JSON">â¬‡</button>
      <button class="btn bsm" style="color:#e53935;border-color:rgba(229,57,53,.3);margin-left:4px;flex-shrink:0" onclick="event.stopPropagation();deleteCharFromLib('${campId}')" title="Supprimer ce personnage">ðŸ—‘</button>
    </div>`;}).join('')
    :`<div style="font-size:12px;color:var(--text3);font-style:italic;padding:6px 0">Aucun personnage sauvegardÃ©.</div>`;
  // Section compendiums
  const compIds=Object.keys(_mjCompLib);
  const compHtml=compIds.length?compIds.map(id=>{
    const c=_mjCompLib[id];
    return`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:6px;display:flex;align-items:center;gap:8px">
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:600;color:var(--text)">${esc(c.name)}</div>
        <div style="font-size:11px;color:var(--text3)">${(c.feats||[]).length} capacitÃ©(s) Â· ${(c.spells||[]).length} sort(s) Â· ${(c.items||[]).length} objet(s)</div>
      </div>
      <button class="btn bsm" onclick="closeModal();mjOpenCompendiumEditor('${id}')" title="Ã‰diter">âœï¸</button>
      <button class="btn bsm" onclick="exportMJCompendium('${id}')" title="Exporter">ðŸ“¤</button>
      <button class="btn bsm" style="color:#e53935;border-color:rgba(229,57,53,.3)" onclick="mjDeleteComp('${id}')" title="Supprimer">ðŸ—‘</button>
    </div>`;}).join('')
    :`<div style="font-size:12px;color:var(--text3);font-style:italic;padding:6px 0">Aucun compendium personnalisÃ©.</div>`;
  openModal(`<div class="pt" style="margin-bottom:12px">âš™ ParamÃ¨tres du profil</div>
    <details class="acc" open>
      <summary>ðŸ§‘ Profil</summary>
      <div class="acc-body">
        <div class="fl mb6">IcÃ´ne</div>
        <div class="avatar-pick" id="settingsAvatarPick">
          ${avatars.map(a=>`<span class="avatar-opt${a===av?' on':''}" onclick="selectSettingsAvatar('${a}')">${a}</span>`).join('')}
        </div>
        <div class="fl mb6">Pseudo</div>
        <input class="fi" id="settingsName" value="${esc(currentUserData.displayName)}" style="margin-bottom:12px">
        <button class="btn bac" style="width:100%" onclick="saveUserSettings()">ðŸ’¾ Sauvegarder</button>
      </div>
    </details>
    <details class="acc" open>
      <summary>ðŸ“š Mes personnages</summary>
      <div class="acc-body">
        <div style="display:flex;gap:6px;margin-bottom:10px">
          <button class="btn bsm" onclick="importStandaloneChar()">ðŸ“¥ Importer JSON</button>
          <button class="btn bsm bprimary" onclick="openCreateStandaloneChar()">+ CrÃ©er</button>
        </div>
        <div>${charHtml}</div>
      </div>
    </details>
    <details class="acc">
      <summary>ðŸ§° Mes compendiums</summary>
      <div class="acc-body">
        <div style="display:flex;gap:6px;margin-bottom:10px">
          <button class="btn bsm bprimary" onclick="closeModal();mjCreateNewComp()">+ Nouveau</button>
          <button class="btn bsm" onclick="closeModal();importMJCompendium()">ðŸ“¥ Importer</button>
        </div>
        <div>${compHtml}</div>
      </div>
    </details>
    <details class="acc">
      <summary>â“ Aide & Guide</summary>
      <div class="acc-body">
        <p style="font-size:12px;color:var(--text3);margin-bottom:10px">Revoir les guides de dÃ©marrage pas Ã  pas.</p>
        <div style="display:flex;flex-direction:column;gap:6px">
          <button class="btn bsm" onclick="closeModal();startTutorial('player')">ðŸ“– Guide Joueur</button>
          <button class="btn bsm" onclick="closeModal();startTutorial('fiche')">ðŸ§‘ Guide Fiche de personnage</button>
          <button class="btn bsm" onclick="closeModal();startTutorial('mj')">ðŸŽ² Guide MaÃ®tre du Jeu</button>
        </div>
      </div>
    </details>
    <details class="acc">
      <summary>ðŸ” Compte</summary>
      <div class="acc-body">
        <div style="font-size:12px;color:var(--text3);margin-bottom:10px">Email : <strong style="color:var(--text2)">${esc(currentUser.email)}</strong></div>
        <div style="display:flex;flex-direction:column;gap:6px">
          <button class="btn bsm" onclick="openChangeEmail()">âœ‰ï¸ Changer l'email</button>
          <button class="btn bsm" onclick="openChangePassword()">ðŸ”‘ Changer le mot de passe</button>
          <button class="btn bsm" style="color:#e53935;border-color:rgba(229,57,53,.3);margin-top:4px" onclick="openDeleteAccount()">ðŸ—‘ Supprimer le compte</button>
        </div>
      </div>
    </details>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;gap:8px">
      <button class="btn bsm" style="color:#e53935;border-color:rgba(229,57,53,.3)" onclick="closeModal();doLogout()">ðŸšª DÃ©connexion</button>
      <button class="btn bsm" style="border-color:rgba(200,168,75,.4);color:var(--cp)" onclick="openFeedbackModal()">ðŸ’¬ Avis / Bug</button>
      <button class="btn" onclick="closeModal()">Fermer</button>
    </div>`);
  window._settingsAvatar=av;
}
function selectSettingsAvatar(av){
  window._settingsAvatar=av;
  document.querySelectorAll('#settingsAvatarPick .avatar-opt').forEach(el=>{
    el.className='avatar-opt'+(el.textContent===av?' on':'');
  });
}

function openChangeEmail(){
  openModal(`<div class="pt">âœ‰ï¸ Changer l'email</div>
    <div style="font-size:12px;color:var(--text3);margin-bottom:12px">Email actuel : <strong style="color:var(--text2)">${esc(currentUser.email)}</strong></div>
    <div class="fl mb6">Nouvel email</div>
    <input class="fi" id="newEmail" type="email" placeholder="nouveau@email.com" style="margin-bottom:10px">
    <div class="fl mb6">Mot de passe actuel (confirmation)</div>
    <input class="fi" id="reAuthPwdEmail" type="password" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" style="margin-bottom:16px">
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="openUserSettings()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="doChangeEmail()">âœ“ Confirmer</button>
    </div>`);
}
async function doChangeEmail(){
  const newEmail=document.getElementById('newEmail')?.value.trim();
  const pwd=document.getElementById('reAuthPwdEmail')?.value;
  if(!newEmail||!pwd){showToast('âŒ Remplissez tous les champs.');return;}
  try{
    const cred=firebase.auth.EmailAuthProvider.credential(currentUser.email,pwd);
    await currentUser.reauthenticateWithCredential(cred);
    await currentUser.updateEmail(newEmail);
    await fbDb.collection('users').doc(currentUser.uid).update({email:newEmail});
    showToast('âœ… Email mis Ã  jour !');closeModal();
  }catch(e){
    const m={'auth/wrong-password':'Mot de passe incorrect.','auth/invalid-email':'Email invalide.','auth/email-already-in-use':'Email dÃ©jÃ  utilisÃ©.'};
    showToast('âŒ '+(m[e.code]||e.message));
  }
}

function openChangePassword(){
  openModal(`<div class="pt">ðŸ”‘ Changer le mot de passe</div>
    <div class="fl mb6">Mot de passe actuel</div>
    <input class="fi" id="oldPwd" type="password" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" style="margin-bottom:10px">
    <div class="fl mb6">Nouveau mot de passe (6 car. min.)</div>
    <input class="fi" id="newPwd" type="password" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" style="margin-bottom:10px">
    <div class="fl mb6">Confirmer le nouveau mot de passe</div>
    <input class="fi" id="newPwd2" type="password" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" style="margin-bottom:16px">
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="openUserSettings()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="doChangePassword()">âœ“ Confirmer</button>
    </div>`);
}
async function doChangePassword(){
  const oldPwd=document.getElementById('oldPwd')?.value;
  const newPwd=document.getElementById('newPwd')?.value;
  const newPwd2=document.getElementById('newPwd2')?.value;
  if(!oldPwd||!newPwd||!newPwd2){showToast('âŒ Remplissez tous les champs.');return;}
  if(newPwd!==newPwd2){showToast('âŒ Les mots de passe ne correspondent pas.');return;}
  if(newPwd.length<6){showToast('âŒ Mot de passe trop court (6 car. min.)');return;}
  try{
    const cred=firebase.auth.EmailAuthProvider.credential(currentUser.email,oldPwd);
    await currentUser.reauthenticateWithCredential(cred);
    await currentUser.updatePassword(newPwd);
    showToast('âœ… Mot de passe mis Ã  jour !');closeModal();
  }catch(e){
    const m={'auth/wrong-password':'Mot de passe actuel incorrect.','auth/weak-password':'Nouveau mot de passe trop faible.'};
    showToast('âŒ '+(m[e.code]||e.message));
  }
}

function openDeleteAccount(){
  openModal(`<div class="pt" style="color:#e53935">âš ï¸ Supprimer le compte</div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:14px">Cette action est <strong>irrÃ©versible</strong>. Toutes vos donnÃ©es seront supprimÃ©es dÃ©finitivement.</p>
    <div class="fl mb6">Mot de passe (confirmation)</div>
    <input class="fi" id="deleteAccPwd" type="password" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" style="margin-bottom:10px">
    <div class="fl mb6">Tapez <strong style="color:var(--cp)">SUPPRIMER</strong> pour confirmer</div>
    <input class="fi" id="deleteAccConfirm" placeholder="SUPPRIMER" style="margin-bottom:16px">
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="openUserSettings()">Annuler</button>
      <button class="btn bdanger" style="flex:2" onclick="doDeleteAccount()">ðŸ—‘ Supprimer dÃ©finitivement</button>
    </div>`);
}
async function doDeleteAccount(){
  const pwd=document.getElementById('deleteAccPwd')?.value;
  const confirm=document.getElementById('deleteAccConfirm')?.value;
  if(confirm!=='SUPPRIMER'){showToast('âŒ Tapez exactement SUPPRIMER pour confirmer.');return;}
  if(!pwd){showToast('âŒ Mot de passe requis.');return;}
  try{
    const cred=firebase.auth.EmailAuthProvider.credential(currentUser.email,pwd);
    await currentUser.reauthenticateWithCredential(cred);
    await fbDb.collection('users').doc(currentUser.uid).delete();
    await currentUser.delete();
  }catch(e){
    const m={'auth/wrong-password':'Mot de passe incorrect.'};
    showToast('âŒ '+(m[e.code]||e.message));
  }
}
function openFeedbackModal(){
  openModal(`<div class="pt" style="margin-bottom:12px">ðŸ’¬ Avis & retours bÃªta</div>
    <p style="font-size:12px;color:var(--text2);margin-bottom:14px">Un bug ? Une idÃ©e ? Un truc qui manque ? Dis-nous tout â€” chaque retour compte.</p>
    <div class="fl mb6">Type</div>
    <select class="fi" id="fbType" style="margin-bottom:10px">
      <option value="bug">ðŸ› Bug / problÃ¨me</option>
      <option value="suggestion">ðŸ’¡ Suggestion</option>
      <option value="question">â“ Question</option>
      <option value="autre">ðŸ’¬ Autre</option>
    </select>
    <div class="fl mb6">Message</div>
    <textarea class="fi" id="fbMsg" placeholder="DÃ©cris le bug ou ton idÃ©e..." rows="5" style="resize:vertical;margin-bottom:12px"></textarea>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="openUserSettings()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="sendFeedback()">ðŸ“¤ Envoyer</button>
    </div>`);
}
async function sendFeedback(){
  const type=document.getElementById('fbType')?.value;
  const msg=document.getElementById('fbMsg')?.value.trim();
  if(!msg){showToast('âŒ Le message ne peut pas Ãªtre vide.');return;}
  try{
    await fbDb.collection('feedback').add({
      userId:currentUser?.uid||'anonymous',
      email:currentUser?.email||'',
      type,
      message:msg,
      ts:firebase.firestore.FieldValue.serverTimestamp()
    });
    closeModal();
    showToast('âœ… Merci pour ton retour !');
  }catch(e){showToast('âŒ Erreur : '+e.message);}
}

async function saveUserSettings(){
  const name=document.getElementById('settingsName').value.trim();
  if(!name){showToast('âŒ Le pseudo ne peut pas Ãªtre vide.');return;}
  const av=window._settingsAvatar||currentUserData.avatar||'âš”';
  try{
    await fbDb.collection('users').doc(currentUser.uid).update({displayName:name,avatar:av});
    currentUserData={...currentUserData,displayName:name,avatar:av};
    await currentUser.updateProfile({displayName:name});
    const btn=document.getElementById('hubUserBtn');
    if(btn) btn.innerHTML=`ðŸ‘¤ ${esc(name)}`;
    closeModal();showToast('âœ… Profil mis Ã  jour !');
  }catch(e){showToast('âŒ Erreur : '+e.message);}
}
async function enterCampaignFromLib(campaignId, tableName, campaignName){
  closeModal();
  if(tableName==='__solo__'){
    await enterCampaign('__solo__',campaignId,'__solo__',campaignName);
    return;
  }
  const tableSnap=await fbDb.collection('tables').where('memberIds','array-contains',currentUser.uid).get();
  let tableId=null;
  tableSnap.docs.forEach(d=>{if((d.data().memberIds||[]).includes(currentUser.uid)&&d.data().name===tableName)tableId=d.id;});
  if(!tableId){
    const snap2=await fbDb.collection('tables').where('mjId','==',currentUser.uid).get();
    snap2.docs.forEach(d=>{if(d.data().name===tableName)tableId=d.id;});
  }
  if(tableId) await enterCampaign(tableId,campaignId,tableName,campaignName);
  else showToast('âŒ Table introuvable.');
}

function openCreateStandaloneChar(){
  closeModal();
  const soloId='solo_'+Date.now();
  enterCampaign('__solo__',soloId,'__solo__','BibliothÃ¨que');
}

function importStandaloneChar(){
  const input=document.createElement('input');
  input.type='file';
  input.accept='.json,application/json';
  input.onchange=async e=>{
    const file=e.target.files[0];
    if(!file)return;
    try{
      const text=await file.text();
      const data=JSON.parse(text);
      const soloId='solo_'+Date.now();
      closeModal();
      await enterCampaign('__solo__',soloId,'__solo__','BibliothÃ¨que',data);
    }catch(err){showToast('âŒ Fichier JSON invalide.');}
  };
  input.click();
}

// â”€â”€â”€ EXPORT / IMPORT PERSONNAGE â”€â”€â”€
async function exportCharacter(campId){
  const charName=(currentUserData&&currentUserData.charLib&&currentUserData.charLib[campId]&&currentUserData.charLib[campId].charName)||'personnage';
  try{
    const doc=await fbDb.collection('characters').doc(currentUser.uid+'_'+campId).get();
    if(!doc.exists){showToast('âŒ Personnage introuvable.');return;}
    const data=doc.data().characterData||{};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download=charName.replace(/[^a-z0-9Ã Ã¢Ã¤Ã©Ã¨ÃªÃ«Ã®Ã¯Ã´Ã¶Ã¹Ã»Ã¼Ã§]/gi,'_')+'.json';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('âœ… Personnage exportÃ©.');
  }catch(e){showToast('âŒ Erreur export : '+e.message);}
}

function openCharOrCreate(tableId,campId){
  const charLib=(currentUserData&&currentUserData.charLib)||{};
  const others=Object.entries(charLib).filter(([cid])=>cid!==campId);
  const existingSection=others.length?`
    <div style="margin-bottom:14px">
      <div class="fl mb6" style="margin-bottom:8px">Utiliser un personnage existant</div>
      ${others.map(([cid,c])=>`<div class="charlib-item" style="cursor:pointer" onclick="useExistingCharForCampaign('${cid}','${tableId}','${campId}')">
        <span style="font-size:18px">${(currentUserData&&currentUserData.avatar)||'âš”'}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600">${esc(c.charName||'?')}</div>
          <div style="font-size:11px;color:var(--text3)">${esc(c.charClass||'')} â€¢ ${esc(c.campaignName||'')}</div>
        </div>
        <span style="color:var(--cp);font-size:11px">Utiliser â†’</span>
      </div>`).join('')}
    </div>`:'';
  openModal(`<div class="pt">+ Rejoindre la campagne</div>
    ${existingSection}
    <div style="display:flex;flex-direction:column;gap:8px">
      <button class="btn bac" style="width:100%" onclick="closeModal();enterCampaign('${tableId}','${campId}')">âœ¨ CrÃ©er un nouveau personnage</button>
      <button class="btn" style="width:100%" onclick="importCharForCampaign('${tableId}','${campId}')">ðŸ“¥ Importer depuis un fichier JSON</button>
    </div>`);
}

async function useExistingCharForCampaign(sourceCampId,tableId,campId){
  closeModal();
  try{
    const doc=await fbDb.collection('characters').doc(currentUser.uid+'_'+sourceCampId).get();
    if(!doc.exists){showToast('âŒ Personnage introuvable.');return;}
    const data=JSON.parse(JSON.stringify(doc.data().characterData||{}));
    await enterCampaign(tableId,campId,null,null,data);
    await saveAll(true);
  }catch(e){showToast('âŒ Erreur : '+e.message);}
}

function importCharForCampaign(tableId,campId){
  const input=document.createElement('input');
  input.type='file';
  input.accept='.json,application/json';
  input.onchange=async e=>{
    const file=e.target.files[0];
    if(!file)return;
    try{
      const text=await file.text();
      const data=JSON.parse(text);
      closeModal();
      await enterCampaign(tableId,campId,null,null,data);
    }catch(err){showToast('âŒ Fichier JSON invalide.');}
  };
  input.click();
}

// â”€â”€â”€ HUB : TABLES & CAMPAGNES â”€â”€â”€
