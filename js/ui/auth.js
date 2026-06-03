// ─── AUTH UI ───
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
  try{await authService.signIn(email,pw);}
  catch(e){const m={'auth/user-not-found':'Aucun compte avec cet email.','auth/wrong-password':'Mot de passe incorrect.','auth/invalid-email':'Email invalide.','auth/invalid-credential':'Email ou mot de passe incorrect.'};showAuthError(m[e.code]||'Erreur : '+e.message);}
}
async function doResetPassword(){
  const email=document.getElementById('loginEmail').value.trim();
  if(!email){showAuthError('Entrez votre email ci-dessus, puis cliquez sur "Mot de passe oublié ?".');return;}
  try{
    await authService.resetPassword(email);
    document.getElementById('authError').style.display='none';
    showToast('📧 Email de réinitialisation envoyé à '+email);
  }catch(e){const m={'auth/user-not-found':'Aucun compte avec cet email.','auth/invalid-email':'Email invalide.'};showAuthError(m[e.code]||'Erreur : '+e.message);}
}
async function doRegister(){
  const name=document.getElementById('regName').value.trim();
  const email=document.getElementById('regEmail').value.trim();
  const pw=document.getElementById('regPassword').value;
  if(!name||!email||!pw){showAuthError('Remplissez tous les champs.');return;}
  if(pw.length<6){showAuthError('Mot de passe : 6 caractères minimum.');return;}
  try{
    const cred=await authService.register(email,pw);
    await userService.createUser(cred.user.uid,{displayName:name,avatar:selectedAvatar,email,charLib:{}});
    await authService.updateProfile({displayName:name});
    authService.sendEmailVerification().catch(()=>{});
    showToast('📧 Un email de vérification a été envoyé à '+email);
  }catch(e){const m={'auth/email-already-in-use':'Email déjà utilisé.','auth/invalid-email':'Email invalide.','auth/weak-password':'Mot de passe trop faible.'};showAuthError(m[e.code]||'Erreur : '+e.message);}
}
async function doLogout(){
  stopAllListeners();
  await authService.signOut();
  state={players:[],activeIdx:0,activeTab:'perso'};
  currentTableId=null;currentCampaignId=null;
  _userInfoCache={};
  _mjCompLib={};_mjActiveCompId=null;
}

function openUserSettings(){
  if(!currentUserData)return;
  const av=currentUserData.avatar||'⚔';
  const avatars=['⚔','🧙','🏹','🛡','🎲','🗡','✨','🐉','🧝','🌙','🔮','🌟'];
  const charLib=currentUserData.charLib||{};
  const chars=Object.entries(charLib);
  const charHtml=chars.length?chars.map(([campId,c])=>{
    const isSolo=c.tableName==='__solo__';
    const subtitle=isSolo
      ?`${esc(c.charClass||'Classe inconnue')} • Bibliothèque personnelle`
      :`${esc(c.charClass||'')} • ${esc(c.campaignName||'')} (${esc(c.tableName||'')})`;
    const actionLabel=isSolo?'Éditer →':'Jouer →';
    return`<div class="charlib-item" onclick="enterCampaignFromLib('${campId}','${esc(c.tableName||'')}','${esc(c.campaignName||'')}')">
      <span style="font-size:20px">${currentUserData.avatar||'⚔'}</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:600;color:var(--text)">${esc(c.charName||'?')}</div>
        <div style="font-size:11px;color:var(--text3)">${subtitle}</div>
      </div>
      <span style="color:var(--cp);font-size:11px;flex-shrink:0">${actionLabel}</span>
      <button class="btn bsm" style="flex-shrink:0;margin-left:4px" onclick="event.stopPropagation();exportCharacter('${campId}')" title="Exporter en JSON">⬇</button>
      <button class="btn bsm" style="color:#e53935;border-color:rgba(229,57,53,.3);margin-left:4px;flex-shrink:0" onclick="event.stopPropagation();deleteCharFromLib('${campId}')" title="Supprimer ce personnage">🗑</button>
    </div>`;}).join('')
    :`<div style="font-size:12px;color:var(--text3);font-style:italic;padding:6px 0">Aucun personnage sauvegardé.</div>`;
  // Section compendiums
  const compIds=Object.keys(_mjCompLib);
  const compHtml=compIds.length?compIds.map(id=>{
    const c=_mjCompLib[id];
    return`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:6px;display:flex;align-items:center;gap:8px">
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:600;color:var(--text)">${esc(c.name)}</div>
        <div style="font-size:11px;color:var(--text3)">${(c.feats||[]).length} capacité(s) · ${(c.spells||[]).length} sort(s) · ${(c.items||[]).length} objet(s)</div>
      </div>
      <button class="btn bsm" onclick="closeModal();mjOpenCompendiumEditor('${id}')" title="Éditer">✏️</button>
      <button class="btn bsm" onclick="exportMJCompendium('${id}')" title="Exporter">📤</button>
      <button class="btn bsm" style="color:#e53935;border-color:rgba(229,57,53,.3)" onclick="mjDeleteComp('${id}')" title="Supprimer">🗑</button>
    </div>`;}).join('')
    :`<div style="font-size:12px;color:var(--text3);font-style:italic;padding:6px 0">Aucun compendium personnalisé.</div>`;
  openModal(`<div class="pt" style="margin-bottom:12px">⚙ Paramètres du profil</div>
    <details class="acc" open>
      <summary>🧑 Profil</summary>
      <div class="acc-body">
        <div class="fl mb6">Icône</div>
        <div class="avatar-pick" id="settingsAvatarPick">
          ${avatars.map(a=>`<span class="avatar-opt${a===av?' on':''}" onclick="selectSettingsAvatar('${a}')">${a}</span>`).join('')}
        </div>
        <div class="fl mb6">Pseudo</div>
        <input class="fi" id="settingsName" value="${esc(currentUserData.displayName)}" style="margin-bottom:12px">
        <button class="btn bac" style="width:100%" onclick="saveUserSettings()">💾 Sauvegarder</button>
      </div>
    </details>
    <details class="acc" open>
      <summary>📚 Mes personnages</summary>
      <div class="acc-body">
        <div style="display:flex;gap:6px;margin-bottom:10px">
          <button class="btn bsm" onclick="importStandaloneChar()">📥 Importer JSON</button>
          <button class="btn bsm bprimary" onclick="openCreateStandaloneChar()">+ Créer</button>
        </div>
        <div>${charHtml}</div>
      </div>
    </details>
    <details class="acc">
      <summary>🧰 Mes compendiums</summary>
      <div class="acc-body">
        <div style="display:flex;gap:6px;margin-bottom:10px">
          <button class="btn bsm bprimary" onclick="closeModal();mjCreateNewComp()">+ Nouveau</button>
          <button class="btn bsm" onclick="closeModal();importMJCompendium()">📥 Importer</button>
        </div>
        <div>${compHtml}</div>
      </div>
    </details>
    <details class="acc">
      <summary>🔄 Mise à jour</summary>
      <div class="acc-body">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <div><div style="font-size:12px;color:var(--text2)">Version installée</div><div style="font-size:16px;font-weight:700;color:var(--cp);font-family:monospace">v${typeof APP_VERSION!=='undefined'?APP_VERSION:'—'}</div></div>
          ${typeof _pendingSwUpdate!=='undefined'&&_pendingSwUpdate?`<span style="font-size:10px;padding:2px 8px;border-radius:10px;background:rgba(200,168,75,.15);border:1px solid var(--cp);color:var(--cp)">Mise à jour disponible</span>`:'<span style="font-size:11px;color:var(--text3)">✓ À jour</span>'}
        </div>
        ${typeof _pendingSwUpdate!=='undefined'&&_pendingSwUpdate?`<button class="btn bac" style="width:100%" onclick="closeModal();_showUpdateOverlay()">✨ Installer la mise à jour</button>`:`<div style="font-size:11px;color:var(--text3);font-style:italic">Aucune mise à jour en attente. Le site vérifie automatiquement au chargement.</div>`}
      </div>
    </details>
    <details class="acc">
      <summary>❓ Aide & Guide</summary>
      <div class="acc-body">
        <p style="font-size:12px;color:var(--text3);margin-bottom:10px">Revoir les guides de démarrage pas à pas.</p>
        <div style="display:flex;flex-direction:column;gap:6px">
          <button class="btn bsm" onclick="closeModal();startTutorial('player')">📖 Guide Joueur</button>
          <button class="btn bsm" onclick="closeModal();startTutorial('fiche')">🧑 Guide Fiche de personnage</button>
          <button class="btn bsm" onclick="closeModal();startTutorial('mj')">🎲 Guide Maître du Jeu</button>
        </div>
      </div>
    </details>
    <details class="acc">
      <summary>🔐 Compte</summary>
      <div class="acc-body">
        <div style="font-size:12px;color:var(--text3);margin-bottom:10px">Email : <strong style="color:var(--text2)">${esc(currentUser.email)}</strong></div>
        <div style="display:flex;flex-direction:column;gap:6px">
          <button class="btn bsm" onclick="openChangeEmail()">✉️ Changer l'email</button>
          <button class="btn bsm" onclick="openChangePassword()">🔑 Changer le mot de passe</button>
          <button class="btn bsm" style="color:#e53935;border-color:rgba(229,57,53,.3);margin-top:4px" onclick="openDeleteAccount()">🗑 Supprimer le compte</button>
        </div>
      </div>
    </details>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;gap:8px">
      <button class="btn bsm" style="color:#e53935;border-color:rgba(229,57,53,.3)" onclick="closeModal();doLogout()">🚪 Déconnexion</button>
      <button class="btn bsm" style="border-color:rgba(200,168,75,.4);color:var(--cp)" onclick="openFeedbackModal()">💬 Avis / Bug</button>
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
  openModal(`<div class="pt">✉️ Changer l'email</div>
    <div style="font-size:12px;color:var(--text3);margin-bottom:12px">Email actuel : <strong style="color:var(--text2)">${esc(currentUser.email)}</strong></div>
    <div class="fl mb6">Nouvel email</div>
    <input class="fi" id="newEmail" type="email" placeholder="nouveau@email.com" style="margin-bottom:10px">
    <div class="fl mb6">Mot de passe actuel (confirmation)</div>
    <input class="fi" id="reAuthPwdEmail" type="password" placeholder="••••••••" style="margin-bottom:16px">
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="openUserSettings()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="doChangeEmail()">✓ Confirmer</button>
    </div>`);
}
async function doChangeEmail(){
  const newEmail=document.getElementById('newEmail')?.value.trim();
  const pwd=document.getElementById('reAuthPwdEmail')?.value;
  if(!newEmail||!pwd){showToast('❌ Remplissez tous les champs.');return;}
  try{
    await authService.reauthenticate(currentUser.email,pwd);
    await authService.updateEmail(newEmail);
    await userService.updateUser(currentUser.uid,{email:newEmail});
    showToast('✅ Email mis à jour !');closeModal();
  }catch(e){
    const m={'auth/wrong-password':'Mot de passe incorrect.','auth/invalid-email':'Email invalide.','auth/email-already-in-use':'Email déjà utilisé.'};
    showToast('❌ '+(m[e.code]||e.message));
  }
}

function openChangePassword(){
  openModal(`<div class="pt">🔑 Changer le mot de passe</div>
    <div class="fl mb6">Mot de passe actuel</div>
    <input class="fi" id="oldPwd" type="password" placeholder="••••••••" style="margin-bottom:10px">
    <div class="fl mb6">Nouveau mot de passe (6 car. min.)</div>
    <input class="fi" id="newPwd" type="password" placeholder="••••••••" style="margin-bottom:10px">
    <div class="fl mb6">Confirmer le nouveau mot de passe</div>
    <input class="fi" id="newPwd2" type="password" placeholder="••••••••" style="margin-bottom:16px">
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="openUserSettings()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="doChangePassword()">✓ Confirmer</button>
    </div>`);
}
async function doChangePassword(){
  const oldPwd=document.getElementById('oldPwd')?.value;
  const newPwd=document.getElementById('newPwd')?.value;
  const newPwd2=document.getElementById('newPwd2')?.value;
  if(!oldPwd||!newPwd||!newPwd2){showToast('❌ Remplissez tous les champs.');return;}
  if(newPwd!==newPwd2){showToast('❌ Les mots de passe ne correspondent pas.');return;}
  if(newPwd.length<6){showToast('❌ Mot de passe trop court (6 car. min.)');return;}
  try{
    await authService.reauthenticate(currentUser.email,oldPwd);
    await authService.updatePassword(newPwd);
    showToast('✅ Mot de passe mis à jour !');closeModal();
  }catch(e){
    const m={'auth/wrong-password':'Mot de passe actuel incorrect.','auth/weak-password':'Nouveau mot de passe trop faible.'};
    showToast('❌ '+(m[e.code]||e.message));
  }
}

function openDeleteAccount(){
  openModal(`<div class="pt" style="color:#e53935">⚠️ Supprimer le compte</div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:14px">Cette action est <strong>irréversible</strong>. Toutes vos données seront supprimées définitivement.</p>
    <div class="fl mb6">Mot de passe (confirmation)</div>
    <input class="fi" id="deleteAccPwd" type="password" placeholder="••••••••" style="margin-bottom:10px">
    <div class="fl mb6">Tapez <strong style="color:var(--cp)">SUPPRIMER</strong> pour confirmer</div>
    <input class="fi" id="deleteAccConfirm" placeholder="SUPPRIMER" style="margin-bottom:16px">
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="openUserSettings()">Annuler</button>
      <button class="btn bdanger" style="flex:2" onclick="doDeleteAccount()">🗑 Supprimer définitivement</button>
    </div>`);
}
async function doDeleteAccount(){
  const pwd=document.getElementById('deleteAccPwd')?.value;
  const confirm=document.getElementById('deleteAccConfirm')?.value;
  if(confirm!=='SUPPRIMER'){showToast('❌ Tapez exactement SUPPRIMER pour confirmer.');return;}
  if(!pwd){showToast('❌ Mot de passe requis.');return;}
  try{
    await authService.reauthenticate(currentUser.email,pwd);
    await userService.deleteUser(currentUser.uid);
    await authService.deleteAccount();
  }catch(e){
    const m={'auth/wrong-password':'Mot de passe incorrect.'};
    showToast('❌ '+(m[e.code]||e.message));
  }
}
function openFeedbackModal(){
  openModal(`<div class="pt" style="margin-bottom:12px">💬 Avis & retours bêta</div>
    <p style="font-size:12px;color:var(--text2);margin-bottom:14px">Un bug ? Une idée ? Un truc qui manque ? Dis-nous tout — chaque retour compte.</p>
    <div class="fl mb6">Type</div>
    <select class="fi" id="fbType" style="margin-bottom:10px">
      <option value="bug">🐛 Bug / problème</option>
      <option value="suggestion">💡 Suggestion</option>
      <option value="question">❓ Question</option>
      <option value="autre">💬 Autre</option>
    </select>
    <div class="fl mb6">Message</div>
    <textarea class="fi" id="fbMsg" placeholder="Décris le bug ou ton idée..." rows="5" style="resize:vertical;margin-bottom:12px"></textarea>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="openUserSettings()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="sendFeedback()">📤 Envoyer</button>
    </div>`);
}
async function sendFeedback(){
  const type=document.getElementById('fbType')?.value;
  const msg=document.getElementById('fbMsg')?.value.trim();
  if(!msg){showToast('❌ Le message ne peut pas être vide.');return;}
  try{
    await userService.sendFeedback(currentUser?.uid,currentUser?.email,type,msg);
    closeModal();
    showToast('✅ Merci pour ton retour !');
  }catch(e){showToast('❌ Erreur : '+e.message);}
}

async function saveUserSettings(){
  const name=document.getElementById('settingsName').value.trim();
  if(!name){showToast('❌ Le pseudo ne peut pas être vide.');return;}
  const av=window._settingsAvatar||currentUserData.avatar||'⚔';
  try{
    await userService.updateUser(currentUser.uid,{displayName:name,avatar:av});
    currentUserData={...currentUserData,displayName:name,avatar:av};
    await authService.updateProfile({displayName:name});
    const btn=document.getElementById('hubUserBtn');
    if(btn) btn.innerHTML=`👤 ${esc(name)}`;
    closeModal();showToast('✅ Profil mis à jour !');
  }catch(e){showToast('❌ Erreur : '+e.message);}
}
async function enterCampaignFromLib(campaignId, tableName, campaignName){
  closeModal();
  if(tableName==='__solo__'){
    await enterCampaign('__solo__',campaignId,'__solo__',campaignName);
    return;
  }
  const tableSnap=await campaignService.getTablesByMember(currentUser.uid);
  let tableId=null;
  tableSnap.docs.forEach(d=>{if((d.data().memberIds||[]).includes(currentUser.uid)&&d.data().name===tableName)tableId=d.id;});
  if(!tableId){
    const snap2=await campaignService.getTablesByMj(currentUser.uid);
    snap2.docs.forEach(d=>{if(d.data().name===tableName)tableId=d.id;});
  }
  if(tableId) await enterCampaign(tableId,campaignId,tableName,campaignName);
  else showToast('❌ Table introuvable.');
}

function openCreateStandaloneChar(){
  closeModal();
  const soloId='solo_'+Date.now();
  enterCampaign('__solo__',soloId,'__solo__','Bibliothèque');
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
      await enterCampaign('__solo__',soloId,'__solo__','Bibliothèque',data);
    }catch(err){showToast('❌ Fichier JSON invalide.');}
  };
  input.click();
}

// ─── EXPORT / IMPORT PERSONNAGE ───
async function exportCharacter(campId){
  const charName=(currentUserData&&currentUserData.charLib&&currentUserData.charLib[campId]&&currentUserData.charLib[campId].charName)||'personnage';
  try{
    const doc=await characterService.getCharacter(currentUser.uid,campId);
    if(!doc.exists){showToast('❌ Personnage introuvable.');return;}
    const data=doc.data().characterData||{};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download=charName.replace(/[^a-z0-9àâäéèêëîïôöùûüç]/gi,'_')+'.json';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('✅ Personnage exporté.');
  }catch(e){showToast('❌ Erreur export : '+e.message);}
}

function openCharOrCreate(tableId,campId){
  const charLib=(currentUserData&&currentUserData.charLib)||{};
  const others=Object.entries(charLib).filter(([cid])=>cid!==campId);
  const existingSection=others.length?`
    <div style="margin-bottom:14px">
      <div class="fl mb6" style="margin-bottom:8px">Utiliser un personnage existant</div>
      ${others.map(([cid,c])=>`<div class="charlib-item" style="cursor:pointer" onclick="useExistingCharForCampaign('${cid}','${tableId}','${campId}')">
        <span style="font-size:18px">${(currentUserData&&currentUserData.avatar)||'⚔'}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600">${esc(c.charName||'?')}</div>
          <div style="font-size:11px;color:var(--text3)">${esc(c.charClass||'')} • ${esc(c.campaignName||'')}</div>
        </div>
        <span style="color:var(--cp);font-size:11px">Utiliser →</span>
      </div>`).join('')}
    </div>`:'';
  openModal(`<div class="pt">+ Rejoindre la campagne</div>
    ${existingSection}
    <div style="display:flex;flex-direction:column;gap:8px">
      <button class="btn bac" style="width:100%" onclick="closeModal();enterCampaign('${tableId}','${campId}',null,null,null,true)">✨ Créer un nouveau personnage</button>
      <button class="btn" style="width:100%" onclick="importCharForCampaign('${tableId}','${campId}')">📥 Importer depuis un fichier JSON</button>
    </div>`);
}

async function useExistingCharForCampaign(sourceCampId,tableId,campId){
  closeModal();
  try{
    const doc=await characterService.getCharacter(currentUser.uid,sourceCampId);
    if(!doc.exists){showToast('❌ Personnage introuvable.');return;}
    const data=JSON.parse(JSON.stringify(doc.data().characterData||{}));
    await enterCampaign(tableId,campId,null,null,data);
    state.players=[typeof migratePlayer==='function'?migratePlayer(data):data];
    render();
    await saveAll(true);
  }catch(e){showToast('❌ Erreur : '+e.message);}
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
    }catch(err){showToast('❌ Fichier JSON invalide.');}
  };
  input.click();
}

// ─── HUB : TABLES & CAMPAGNES ───
