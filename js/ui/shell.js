// ═══════════════════════════════════════════════════════════════════════
// SHELL — Étape 2 de la refonte (nav 3 destinations, dé ancrable, signaux)
// Chargé APRÈS core.js : les redéfinitions de fonctions globales GAGNENT.
// Décisions : _veille/THEORIE-PAGES.md · Composants : css/design-system.css
// Règle d'or : la visibilité dé/groupe reste pilotée par _syncFloatingUI.
// ═══════════════════════════════════════════════════════════════════════

// ── Préférences d'affichage (options de profil) ──
// ds_theme : 'light' (Grimoire, défaut) | 'dark' (Veillée)
// ds_hand  : 'right' (défaut) | 'left' (gaucher : rail + dé à gauche)
function dsApplyPrefs(){
  const t=localStorage.getItem('ds_theme')||'light';
  const h=localStorage.getItem('ds_hand')||'right';
  const m=localStorage.getItem('ds_mix')||'mix1';
  document.body.classList.toggle('ds-dark',t==='dark');
  document.body.classList.toggle('ds-lefty',h==='left');
  document.body.classList.toggle('ds-mix1',m==='mix1');
  document.body.classList.toggle('ds-mix2',m==='mix2');
  document.body.classList.toggle('ds-mix0',m==='off');
  _dsApplyClassTheme();
}
// ── IDENTITÉ DE CLASSE (A4, recâblée le 2026-07-22) ──────────────────────────
// `variables.css` définit .th-<Classe> → --cls (la couleur de la classe). Personne
// ne posait cette classe : --cls restait au laiton par défaut, donc l'identité de
// classe était INVISIBLE, quelle que soit l'option choisie. C'est ici qu'on la pose.
// ⚠️ Le style s'accroche à `.panel` — PAS seulement à `.g-card` : les composants de
// la maquette ne sont pas encore émis par le JS (dette connue, cf. JOURNAL). Câbler
// uniquement sur .g-card n'aurait strictement rien affiché.
function _dsApplyClassTheme(){
  try{
    const p=(typeof P==='function')?P():null;
    const mc=(p&&typeof mainClass==='function')?mainClass(p):null;
    const name=mc&&mc.name;
    document.body.className=document.body.className.replace(/\bth-\S+/g,'').trim();
    if(name)document.body.classList.add('th-'+name);
  }catch(e){}
}
function dsSetTheme(t){localStorage.setItem('ds_theme',t);dsApplyPrefs();}
function dsSetHand(h){localStorage.setItem('ds_hand',h);dsApplyPrefs();if(typeof _dsDieSeat==='function')_dsDieSeat();}
function dsSetMix(m){localStorage.setItem('ds_mix',m);dsApplyPrefs();}
dsApplyPrefs();

// ── MODIFICATION D'UNE FICHE HORS SESSION ───────────────────────────────────
// Consentement conservé seulement en mémoire : un rechargement ou un nouvel
// onglet redemande l'autorisation, conformément à la décision produit.
let _dsOutOfSessionEditUnlocked=false,_dsPendingEditTarget=null;
function _dsEditedCharacterId(){
  return typeof currentSheetCharacterId!=='undefined'&&currentSheetCharacterId
    ?currentSheetCharacterId
    :typeof currentCharacterId!=='undefined'?currentCharacterId:null;
}
function _dsOutOfSessionStorageKey(){
  const id=_dsEditedCharacterId();
  return id?'mjtk_out_of_session_edit_'+id:null;
}
function _dsOutOfSessionIsUnlocked(){
  if(_dsOutOfSessionEditUnlocked)return true;
  const key=_dsOutOfSessionStorageKey();
  try{return !!key&&sessionStorage.getItem(key)==='1';}catch(e){return false;}
}
function _dsSheetIsInLiveSession(){
  if(!currentCampaignId||currentCampaignId==='__solo__')return false;
  if(_dsEditedCharacterId()&&currentCharacterId
    &&_dsEditedCharacterId()!==currentCharacterId)return false;
  const saved=typeof loadSessionState==='function'?loadSessionState():null;
  return !!(saved&&saved.mode==='play'
    &&saved.tableId===currentTableId
    &&saved.campaignId===currentCampaignId);
}
function _dsConfirmOutOfSessionEdit(){
  _dsOutOfSessionEditUnlocked=true;
  const key=_dsOutOfSessionStorageKey();
  try{if(key)sessionStorage.setItem(key,'1');}catch(e){}
  const target=_dsPendingEditTarget;
  _dsPendingEditTarget=null;
  closeModal();
  if(target&&document.contains(target)){
    if(typeof target.focus==='function')target.focus();
    if(typeof target.click==='function'&&target.tagName==='BUTTON')target.click();
  }
}
function _dsCancelOutOfSessionEdit(){
  _dsPendingEditTarget=null;
  closeModal();
}
function _dsAskOutOfSessionEdit(target){
  _dsPendingEditTarget=target;
  openModal(`<div class="pt">Modifier la fiche hors session ?</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:16px">La partie n’est pas en cours. Tes changements seront tout de même enregistrés sur le personnage.</div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="_dsCancelOutOfSessionEdit()">Retour</button>
      <button class="btn bac" style="flex:2" onclick="_dsConfirmOutOfSessionEdit()">Modifier quand même</button>
    </div>`);
}
document.addEventListener('pointerdown',event=>{
  if(_dsOutOfSessionIsUnlocked()||_dsSheetIsInLiveSession())return;
  const target=event.target?.closest?.('#tabContent input,#tabContent textarea,#tabContent select,#tabContent button,#tabContent [contenteditable="true"]');
  if(!target)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  _dsAskOutOfSessionEdit(target);
},true);

// ── NAV 3 DESTINATIONS : Tables · Personnage/Panneau MJ · Groupe ──
// Remplace le contenu de #modeNav (2 items) par 3 items. Le bouton Groupe
// ouvre pour l'instant le panneau de groupe existant (partyHud) — il
// deviendra la vraie page Groupe à la migration de la page 3.
// ── PAGE GROUPE (P3) — overlay plein écran : Tour → Membres → Partages MJ → Chronique ──
let _dsGroupOpen=false,_dsShares=null,_dsChronicleEntries=null,_dsRestProposals=[];
let _dsGroupDiscoveriesUnsub=null,_dsGroupChronicleUnsub=null,_dsGroupRestUnsub=null;
let _dsGroupRestParticipantUnsubs=[];
function _dsV2Enabled(){
  return typeof v2CompatService!=='undefined'&&v2CompatService.isEnabled();
}
function _dsCurrentCampaignData(){
  const table=_hubCache&&_hubCache.find(item=>item.id===currentTableId);
  return table&&(table.campaigns||[]).find(item=>item.id===currentCampaignId);
}
function _dsStopGroupDataListeners(){
  if(typeof _dsGroupDiscoveriesUnsub==='function')_dsGroupDiscoveriesUnsub();
  if(typeof _dsGroupChronicleUnsub==='function')_dsGroupChronicleUnsub();
  if(typeof _dsGroupRestUnsub==='function')_dsGroupRestUnsub();
  _dsGroupRestParticipantUnsubs.forEach(unsub=>{try{unsub();}catch(e){}});
  _dsGroupRestParticipantUnsubs=[];
  _dsGroupDiscoveriesUnsub=null;
  _dsGroupChronicleUnsub=null;
  _dsGroupRestUnsub=null;
}
function _dsDiscoveryToShare(doc){
  const data=doc.data?doc.data():doc;
  const type=data.type==='clue'?'indice':data.type==='artifact'?'artefact':'quete';
  return {
    ...data,
    id:doc.id||data.id,
    type,
    title:data.title||'',
    text:data.content||'',
    matiere:data.material||data.matiere||''
  };
}
function _dsLoadGroupData(){
  _dsStopGroupDataListeners();
  _dsShares=null;
  _dsChronicleEntries=null;
  // Les repos aussi : sans cette remise à zéro, la liste gardait la proposition de la
  // fois précédente et la carte « ☕ Repos proposé » restait affichée alors que le MJ
  // avait déjà tranché — l'écouteur ne s'abonne qu'aux propositions EN ATTENTE, il ne
  // renvoie donc jamais rien pour effacer une proposition close (retour A8b du 26/07).
  _dsRestProposals=[];
  if(_dsV2Enabled()&&typeof v2GroupService!=='undefined'){
    _dsGroupDiscoveriesUnsub=v2GroupService.listenDiscoveries(
      currentCampaignId,
      snapshot=>{
        _dsShares=snapshot.docs.map(_dsDiscoveryToShare);
        if(_dsGroupOpen)_dsRenderGroup();
      },
      ()=>{_dsShares=[];if(_dsGroupOpen)_dsRenderGroup();}
    );
    const campaign=_dsCurrentCampaignData();
    if(campaign?.chronicleId){
      _dsGroupChronicleUnsub=v2GroupService.listenChronicleEntries(
        campaign.chronicleId,
        snapshot=>{
          _dsChronicleEntries=snapshot.docs.map(doc=>({id:doc.id,...doc.data()}));
          if(_dsGroupOpen)_dsRenderGroup();
        },
        ()=>{_dsChronicleEntries=[];if(_dsGroupOpen)_dsRenderGroup();}
      );
    }else{
      _dsChronicleEntries=[];
    }
    if(typeof v2RestService!=='undefined'){
      _dsGroupRestUnsub=v2RestService.listenOpen(
        currentCampaignId,
        snapshot=>{
          _dsRestProposals=snapshot.docs.map(doc=>({id:doc.id,...doc.data()}));
          _dsGroupRestParticipantUnsubs.forEach(unsub=>{try{unsub();}catch(e){}});
          _dsGroupRestParticipantUnsubs=_dsRestProposals.map(proposal=>
            v2RestService.listenParticipants(
              currentCampaignId,
              proposal.id,
              participants=>{
                const target=_dsRestProposals.find(item=>item.id===proposal.id);
                if(target){
                  target.participants=Object.fromEntries(
                    participants.docs.map(doc=>[doc.id,doc.data()])
                  );
                  if(target.status==='approved'){
                    const own=target.participants[currentUser?.uid];
                    if(own?.participates===true&&own.appliedAt==null){
                      _dsApplyApprovedRest(target.id,true);
                    }
                  }
                }
                _dsAfterGroupData();
              }
            )
          );
          _dsAfterGroupData();
        },
        ()=>{_dsRestProposals=[];_dsAfterGroupData();}
      );
    }
    return;
  }
  // Repli historique tant que les collections V2 ne sont pas activées localement.
  try{
    fbDb.collection('campaigns').doc(currentCampaignId).get().then(doc=>{
      _dsShares=(doc.exists&&doc.data().shares)||[];
      if(_dsGroupOpen)_dsRenderGroup();
    }).catch(()=>{_dsShares=[];if(_dsGroupOpen)_dsRenderGroup();});
  }catch(e){_dsShares=[];}
}
async function _dsChooseRest(proposalId,participates){
  const proposal=(_dsRestProposals||[]).find(item=>item.id===proposalId);
  if(participates&&proposal?.type==='short'){
    _dsOpenShortRestChoice(proposalId);
    return;
  }
  try{
    await v2RestService.setParticipation(
      currentCampaignId,proposalId,currentUser.uid,participates
    );
    showToast(participates
      ?'✅ Tu participeras si le MJ autorise ce repos.'
      :'Participation refusée.');
  }catch(e){showToast('❌ Réponse impossible : '+e.message);}
}
// ═══════════════════════════════════════════════════════════════════════════
//  REPOS COURT — L'ÉCRAN SUIT LE MODE DE DÉ (retour de test du 2026-07-26)
//  « c'est en fonction du mode de dé que ces options doivent apparaître. »
//  Avant, la même boîte demandait le nombre de dés ET un « résultat physique
//  total (facultatif) » — elle parlait donc des deux mondes à la fois, à un
//  joueur qui n'en vit qu'un. Désormais :
//   • dé virtuel → un bouton « 🎲 Lancer les dés de vie », l'app lance ;
//   • dé réel    → le message « Lance 2d8 · ajoute +2 par dé », puis le total.
//  Le CHOIX du nombre de dés est conservé (arbitrage utilisateur du 26/07) : les
//  dés de vie ne se rechargent qu'à moitié au repos long, tout dépenser d'office
//  viderait la réserve de la journée sans que le joueur l'ait décidé.
// ═══════════════════════════════════════════════════════════════════════════
function _dsShortRestIsIRL(){return typeof _isIRLMode==='function'&&_isIRLMode();}
// Met à jour la consigne de lancer réel quand les compteurs changent.
function _dsShortRestSyncHint(){
  const hint=document.getElementById('dsRestIRLHint');if(!hint)return;
  const p=P();
  const conMod=Math.floor((((p.abilities||[])[2]||10)-10)/2);
  const parts=[];let totalDice=0;
  document.querySelectorAll('.ds-rest-die').forEach(input=>{
    const count=Math.max(0,Math.min(Number(input.max)||0,Math.trunc(Number(input.value)||0)));
    if(!count)return;
    totalDice+=count;
    parts.push(`${count}d${input.dataset.die||8}`);
  });
  hint.innerHTML=totalDice
    ?`🎲 Lance <b>${parts.join(' + ')}</b>${conMod?` · ajoute <b>${conMod>0?'+':''}${conMod}</b> à chaque dé`:''}, puis saisis le total.`
    :`Choisis au moins un dé de vie, ou valide sans en dépenser.`;
}
function _dsOpenShortRestChoice(proposalId){
  const p=P();
  const used=p.hitDiceUsed||{};
  const classes=(p.classes||[]).filter(entry=>(entry.level||0)>0);
  if(!classes.length){
    _dsConfirmShortRestChoice(proposalId,false);
    return;
  }
  const irl=_dsShortRestIsIRL();
  openModal(`<div class="pt">☕ Participer au repos court</div>
    <div class="ds-note" style="margin-bottom:10px">Choisis combien de dés de vie tu dépenses. Tu peux tout laisser à zéro.</div>
    ${classes.map(entry=>{
      const definition=(SRD.classes||[]).find(item=>item.name===entry.name)||{};
      const available=Math.max(0,(entry.level||0)-(used[entry.name]||0));
      return`<div class="g-sub" style="display:flex;align-items:center;gap:8px;padding:8px;margin-bottom:6px">
        <div style="flex:1"><b>${esc(entry.name)}</b><div class="ds-note">d${definition.hdVal||8} · ${available} disponible(s)</div></div>
        <input class="fi ds-rest-die" data-class="${esc(entry.name)}" data-die="${definition.hdVal||8}" type="number" min="0" max="${available}" value="0" style="width:70px;text-align:center" oninput="_dsShortRestSyncHint()">
      </div>`;
    }).join('')}
    ${irl?`<div id="dsRestIRLHint" class="ds-note" style="margin:12px 0 8px;padding:9px 11px;border:1px solid rgba(200,168,75,.45);background:rgba(200,168,75,.07);line-height:1.6"></div>
    <div class="fl mb6">Total obtenu sur tes dés</div>
    <input class="fi" id="dsRestPhysicalHealing" type="number" min="0" placeholder="Ex : 11" style="margin-bottom:12px">`:''}
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn" style="flex:1" onclick="_dsConfirmShortRestChoice('${proposalId}',true)">Sans dé de vie</button>
      <button class="btn bac" style="flex:2" onclick="_dsConfirmShortRestChoice('${proposalId}',false)">${irl?'✓ Valider mon repos':'🎲 Lancer les dés de vie'}</button>
    </div>`);
  if(irl)_dsShortRestSyncHint();
}
async function _dsConfirmShortRestChoice(proposalId,withoutDice){
  const p=P();
  const hitDiceSpent={};
  let healing=0,totalDice=0;
  const conMod=Math.floor((((p.abilities||[])[2]||10)-10)/2);
  if(!withoutDice){
    document.querySelectorAll('.ds-rest-die').forEach(input=>{
      const count=Math.max(0,Math.min(Number(input.max)||0,Math.trunc(Number(input.value)||0)));
      if(!count)return;
      hitDiceSpent[input.dataset.class]=count;
      totalDice+=count;
      for(let i=0;i<count;i++)healing+=Math.max(0,Math.ceil(Math.random()*(Number(input.dataset.die)||8))+conMod);
    });
    // Dé réel : c'est le joueur qui a lancé — l'app ne doit surtout pas tirer à sa
    // place. Le champ n'existe qu'en mode réel, et il devient alors obligatoire dès
    // qu'un dé est dépensé (sinon on enregistrerait un tirage virtuel en douce).
    if(_dsShortRestIsIRL()){
      const physical=document.getElementById('dsRestPhysicalHealing')?.value;
      if(totalDice>0&&(physical===''||physical==null)){
        showToast('🎲 Saisis le total obtenu sur tes dés.');
        return;
      }
      healing=Math.max(0,Math.trunc(Number(physical)||0));
    }
    const chant=(_groupData||[]).find(member=>
      member.uid!==currentUser?.uid
      &&member.charData?.combatCharges?.ChantReposantResult!==undefined
    )?.charData?.combatCharges?.ChantReposantResult||0;
    if(totalDice>0)healing+=chant;
  }
  try{
    await v2RestService.setParticipation(
      currentCampaignId,proposalId,currentUser.uid,true,{healing,hitDiceSpent}
    );
    closeModal();
    showToast(totalDice
      ?`✅ Participation enregistrée · ${totalDice} dé(s) de vie · +${healing} PV si le MJ autorise.`
      :'✅ Participation enregistrée sans dé de vie.');
  }catch(e){showToast('❌ Réponse impossible : '+e.message);}
}
// ═══════════════════════════════════════════════════════════════════════════
//  BLOC « REPOS PROPOSÉ » — rendu PARTAGÉ
//  Affiché sur la page Groupe ET dans l'onglet Joueurs du panneau MJ (§10.1 :
//  « repos collectifs »). Le MJ ne doit pas avoir à quitter son panneau en
//  pleine session pour autoriser un repos ; le joueur, lui, répond depuis la
//  page Groupe. Un seul rendu pour les deux : les boutons s'adaptent au rôle.
// ═══════════════════════════════════════════════════════════════════════════
function _dsRestBlockHTML(){
  if(!_dsV2Enabled()||!(_dsRestProposals||[]).length)return'';
  return`<div class="ds-seclbl" style="margin:14px 0 8px">☕ Repos proposé</div>
    ${_dsRestProposals.map(proposal=>{
      const participants=proposal.participants||{};
      const own=participants[currentUser?.uid];
      const table=_hubCache&&_hubCache.find(item=>item.id===currentTableId);
      const names=table?.memberNames||{};
      const accepted=Object.entries(participants).filter(([,p])=>p.participates===true).map(([uid,p])=>
        (names[uid]||'Membre')+(proposal.type==='short'&&p.healing?` (+${p.healing} PV)`:'')
      );
      const declined=Object.entries(participants).filter(([,p])=>p.participates===false).map(([uid])=>names[uid]||'Membre');
      if(proposal.status==='approved'){
        const pending=Object.values(participants).filter(p=>
          p.participates===true&&p.appliedAt==null
        ).length;
        if(!window._currentCampIsMJ&&!(own?.participates===true&&own?.appliedAt==null)){
          return'';
        }
        return`<div class="ds-card" style="padding:10px;margin-bottom:8px">
          <div style="font-weight:700">✅ ${proposal.type==='long'?'Repos long':'Repos court'} autorisé</div>
          <div class="ds-note" style="margin:3px 0 9px">${window._currentCampIsMJ
            ?`${pending} participant(s) doivent encore appliquer leur récupération.`
            :'Ta récupération doit être appliquée à ta fiche.'}</div>
          ${!window._currentCampIsMJ
            ?`<button class="ds-btn primary" style="width:100%" onclick="_dsApplyApprovedRest('${proposal.id}',false)">Appliquer maintenant</button>`
            :''}
        </div>`;
      }
      return`<div class="ds-card" style="padding:10px;margin-bottom:8px">
        <div style="font-weight:700">${proposal.type==='long'?'🌙 Repos long':'☕ Repos court'}</div>
        <div class="ds-note" style="margin:3px 0 9px">Proposé par ${esc(proposal.requestedByName||'un membre')}. Aucun effet avant la décision du MJ.</div>
        ${accepted.length||declined.length?`<div class="ds-note" style="margin-bottom:8px">${accepted.length?'✓ '+esc(accepted.join(', ')):''}${accepted.length&&declined.length?' · ':''}${declined.length?'Ne participe pas : '+esc(declined.join(', ')):''}</div>`:''}
        <div style="display:flex;gap:7px">
          ${window._currentCampIsMJ
            ?`<button class="ds-btn primary" style="flex:1" onclick="_dsDecideRest('${proposal.id}',true)">Autoriser</button>
              <button class="ds-btn quiet" style="flex:1" onclick="_dsDecideRest('${proposal.id}',false)">Refuser</button>`
            :`<button class="ds-btn ${own?.participates===true?'primary':'quiet'}" style="flex:1" onclick="_dsChooseRest('${proposal.id}',true)">Participer</button>
              <button class="ds-btn ${own?.participates===false?'primary':'quiet'}" style="flex:1" onclick="_dsChooseRest('${proposal.id}',false)">Ne pas participer</button>`}
        </div>
      </div>`;
    }).join('')}`;
}
async function _dsApplyApprovedRest(proposalId,silent){
  return guardAction('applyRest:'+proposalId,async()=>{
    try{
      const result=await v2RestService.applyForSelf(
        currentCampaignId,proposalId,currentUser.uid
      );
      if(result?.applied&&typeof v2DataService!=='undefined'){
        const sheet=await v2DataService.loadCharacterSheet(result.characterId);
        if(sheet&&typeof P==='function'){
          Object.assign(P(),sheet);
          if(typeof renderCharRail==='function')renderCharRail();
          if(typeof renderTab==='function')renderTab();
        }
      }
      if(!silent&&result?.applied)showToast('✅ Récupération appliquée à ta fiche.');
      return result;
    }catch(e){
      if(!silent)showToast('❌ Application du repos impossible : '+e.message);
      return null;
    }
  });
}
// Après réception de données de groupe : repeindre l'écran qui les montre.
// La page Groupe n'est pas le seul consommateur depuis que le MJ suit les repos
// depuis son panneau — sans ce second cas, une demande arrivait sans rien repeindre.
function _dsAfterGroupData(){
  if(_dsGroupOpen){_dsRenderGroup();return;}
  if(window._currentCampIsMJ&&typeof _mjTab!=='undefined'&&_mjTab==='joueurs'
    &&typeof renderMJContent==='function')renderMJContent();
}
async function _dsDecideRest(proposalId,approved){
  // Anti-spam : la décision applique des soins et consomme des dés de vie — la
  // rejouer deux fois n'est pas une écriture inoffensive. Clé par proposition.
  return guardAction('decideRest:'+proposalId,async()=>{
    try{
      await v2RestService.decide(
        currentCampaignId,proposalId,currentUser.uid,approved
      );
      showToast(approved
        ?'✅ Repos autorisé. Chaque participant applique maintenant sa récupération.'
        :'Repos refusé.');
    }catch(e){showToast('❌ Décision impossible : '+e.message);}
  });
}
function _dsNavGoGroup(){
  if(!currentCampaignId)return;
  _dsGroupOpen?_dsCloseGroup():_dsOpenGroup();
}
function _dsOpenGroup(){
  if(typeof _dsCloseCharacterPage==='function')_dsCloseCharacterPage();
  _dsGroupOpen=true;
  let el=document.getElementById('dsGroupPage');
  if(!el){el=document.createElement('div');el.id='dsGroupPage';document.body.appendChild(el);}
  el.style.display='block';
  _dsRenderGroup();
  _dsLoadGroupData();
  if(typeof _refreshModeNav==='function')_refreshModeNav();
}
function _dsCloseGroup(){
  _dsGroupOpen=false;
  _dsStopGroupDataListeners();
  const el=document.getElementById('dsGroupPage');if(el)el.style.display='none';
  if(typeof _refreshModeNav==='function')_refreshModeNav();
}
function _dsChronicleDate(value){
  if(!value)return'À l’instant';
  const date=typeof value.toDate==='function'?value.toDate():new Date(value);
  if(Number.isNaN(date.getTime()))return'';
  return new Intl.DateTimeFormat('fr-FR',{
    day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'
  }).format(date);
}
function _dsChronicleWasEdited(entry){
  if(!entry?.createdAt||!entry?.updatedAt)return false;
  const millis=value=>typeof value.toMillis==='function'
    ?value.toMillis()
    :new Date(value).getTime();
  return millis(entry.updatedAt)>millis(entry.createdAt)+1000;
}
async function _dsAddChronicleEntry(){
  if(!_dsV2Enabled()||typeof v2GroupService==='undefined')return;
  const campaign=_dsCurrentCampaignData();
  const input=document.getElementById('dsChronicleInput');
  const content=String(input?.value||'').trim();
  if(!campaign?.chronicleId){showToast('❌ Chronique V2 indisponible pour cette campagne.');return;}
  if(!content){showToast('❌ Écris quelque chose avant de publier.');return;}
  // Anti-spam : deux clics = deux fois la même entrée dans la Chronique. Le champ
  // n'est vidé qu'APRÈS l'écriture, donc rien ne protégeait de la répétition.
  return guardAction('addChronicleEntry',async()=>{
    try{
      await v2GroupService.addChronicleEntry(campaign.chronicleId,{
        campaignId:currentCampaignId,
        authorId:currentUser.uid,
        authorNameSnapshot:currentUserData?.displayName||'Membre',
        content
      });
      if(input)input.value='';
      showToast('📜 Entrée publiée dans la chronique.');
    }catch(e){showToast('❌ Publication impossible : '+e.message);}
  });
}
function _dsEditChronicleEntry(entryId){
  const entry=(_dsChronicleEntries||[]).find(item=>item.id===entryId);
  if(!entry||entry.authorId!==currentUser?.uid)return;
  openModal(`<div class="pt">✏ Modifier mon entrée</div>
    <textarea class="fi" id="dsChronicleEditContent" rows="8" style="resize:vertical;margin-bottom:12px">${esc(entry.content||'')}</textarea>
    <div class="ds-note" style="margin-bottom:12px">La date de publication reste inchangée ; l’entrée portera la mention « modifié ».</div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="_dsConfirmChronicleEdit('${entryId}')">Enregistrer</button>
    </div>`);
}
async function _dsConfirmChronicleEdit(entryId){
  const campaign=_dsCurrentCampaignData();
  const content=(document.getElementById('dsChronicleEditContent')?.value||'').trim();
  if(!campaign?.chronicleId||!content)return;
  try{
    await v2GroupService.updateChronicleEntry(campaign.chronicleId,entryId,content);
    closeModal();showToast('✅ Entrée modifiée.');
  }catch(e){showToast('❌ Modification impossible : '+e.message);}
}
async function _dsDeleteChronicleEntry(entryId){
  const campaign=_dsCurrentCampaignData();
  const entry=(_dsChronicleEntries||[]).find(item=>item.id===entryId);
  if(!campaign?.chronicleId||entry?.authorId!==currentUser?.uid)return;
  if(!confirm('Supprimer cette entrée de la chronique ?'))return;
  try{
    await v2GroupService.deleteChronicleEntry(campaign.chronicleId,entryId);
    showToast('Entrée supprimée.');
  }catch(e){showToast('❌ Suppression impossible : '+e.message);}
}

// ── PAGE PERSONNAGE ──────────────────────────────────────────────────────────
// Destination stable de la navigation. La fiche en cours reste prioritaire ;
// la collection et les actions secondaires occupent un espace réduit.
let _dsCharacterPageOpen=false;
let _dsV2CharacterCache=null;
function _dsCloseCharacterPage(){
  _dsCharacterPageOpen=false;
  const el=document.getElementById('dsCharacterPage');
  if(el)el.style.display='none';
}
async function _dsLoadV2Characters(){
  try{
    _dsV2CharacterCache=await v2DataService.listOwnedCharacters(currentUser.uid);
  }catch(e){
    _dsV2CharacterCache=[];
    showToast('❌ Chargement des personnages impossible : '+e.message);
  }
  if(_dsCharacterPageOpen)_dsRenderCharacterPage();
}
function _dsV2CharacterCard(character,isCurrent){
  const sheet=character.sheet||{};
  const cls=(sheet.classes||[]).map(c=>c.name+' '+c.level).join(' / ');
  return`<article class="ds-card" style="margin-bottom:8px;${isCurrent?'border-color:var(--ds-acc-strong);':''}">
    <div style="display:flex;align-items:center;gap:10px">
      ${sheet.portrait
        ?`<img src="${sheet.portrait}" style="width:42px;height:42px;object-fit:cover;border:1px solid var(--ds-line);flex:none">`
        :`<span style="width:42px;height:42px;display:grid;place-items:center;background:var(--ds-card2);border:1px solid var(--ds-line);font-size:20px;flex:none">${currentUserData?.avatar||'⚔'}</span>`}
      <button class="flat" style="flex:1;min-width:0;text-align:left" onclick="_dsOpenV2Character('${character.id}')">
        <span style="display:block;font-family:var(--ds-disp);font-size:${isCurrent?'17px':'14px'};font-weight:700;color:var(--ds-ink)">${esc(sheet.charName||sheet.name||character.identity?.name||'Personnage')}</span>
        <span class="ds-note">${esc(cls||'Classe à définir')}${isCurrent?' · personnage joué':''}</span>
      </button>
      ${isCurrent?'<span class="ds-chip good" style="font-size:10px">En cours</span>':''}
      <button class="ds-btn quiet" style="min-height:30px;padding:2px 8px" onclick="exportV2Character('${character.id}')" title="Exporter">⬇</button>
    </div>
  </article>`;
}
async function _dsOpenV2Character(characterId){
  try{
    const sheet=await v2DataService.loadCharacterSheet(characterId);
    if(!sheet){showToast('❌ Fiche introuvable.');return;}
    _dsCloseCharacterPage();
    _dsCloseGroup();
    currentSheetCharacterId=characterId;
    if(typeof _v2PersonalNotes!=='undefined')_v2PersonalNotes=null;
    if(typeof _v2PersonalNotesCharacterId!=='undefined')_v2PersonalNotesCharacterId=null;
    _dsOutOfSessionEditUnlocked=false;
    state.players=[migratePlayer(sheet)];
    state.activeIdx=0;
    state.activeTab='perso';
    stopAllListeners();
    if(currentCampaignId){
      _groupData=[];
      startGroupListener(currentCampaignId);
      if(currentTableMjId)startCombatListener(currentCampaignId,currentTableMjId);
    }
    showApp();
    _suppressUnsavedMark=true;
    render();
  }catch(e){showToast('❌ Ouverture impossible : '+e.message);}
}
function _dsCharacterCard(campaignId,character,isCurrent){
  const solo=character.tableName==='__solo__';
  const context=solo
    ?'Personnage indépendant'
    :[character.campaignName,character.tableName].filter(Boolean).map(esc).join(' · ');
  return`<article class="ds-card" style="margin-bottom:8px;${isCurrent?'border-color:var(--ds-acc-strong);':''}">
    <div style="display:flex;align-items:center;gap:10px">
      <span style="width:42px;height:42px;display:grid;place-items:center;background:var(--ds-card2);border:1px solid var(--ds-line);font-size:20px;flex:none">${currentUserData?.avatar||'⚔'}</span>
      <button class="flat" style="flex:1;min-width:0;text-align:left" onclick="enterCampaignFromLib('${campaignId}','${jsq(character.tableName||'')}','${jsq(character.campaignName||'')}')">
        <span style="display:block;font-family:var(--ds-disp);font-size:${isCurrent?'17px':'14px'};font-weight:700;color:var(--ds-ink)">${esc(character.charName||'Personnage')}</span>
        <span class="ds-note">${esc(character.charClass||'Classe à définir')}${context?' · '+context:''}</span>
      </button>
      ${isCurrent?'<span class="ds-chip good" style="font-size:10px">En cours</span>':''}
      <button class="ds-btn quiet" style="min-height:30px;padding:2px 8px" onclick="exportCharacter('${campaignId}')" title="Exporter">⬇</button>
    </div>
  </article>`;
}
function _dsRenderCharacterPage(){
  const el=document.getElementById('dsCharacterPage');
  if(!el)return;
  if(_dsV2Enabled()){
    if(_dsV2CharacterCache===null){
      el.innerHTML='<div class="ds-grouppage"><div class="gp-body"><div class="ds-title">Personnage</div><div class="ds-note" style="padding:18px 0">Chargement…</div></div></div>';
      _dsLoadV2Characters();
      return;
    }
    const chars=_dsV2CharacterCache;
    const current=chars.find(character=>character.id===currentCharacterId)||null;
    const others=chars.filter(character=>!current||character.id!==current.id);
    el.innerHTML=`<div class="ds-grouppage">
      <div class="gp-body">
        <div class="ds-title" style="margin-bottom:10px">Personnage</div>
        ${current
          ?`<div class="ds-seclbl" style="margin-bottom:7px">Fiche en cours</div>${_dsV2CharacterCard(current,true)}`
          :`<div class="ds-card" style="text-align:center;padding:20px;margin-bottom:12px">
              <div style="font-family:var(--ds-disp);font-size:17px;font-weight:700">Aucune fiche en cours</div>
              <div class="ds-note" style="margin-top:4px">Tes personnages restent disponibles ci-dessous.</div>
            </div>`}
        <div style="display:flex;align-items:center;gap:8px;margin:14px 0 8px">
          <div class="ds-seclbl" style="flex:1">Mes personnages${chars.length?' · '+chars.length:''}</div>
          <button class="ds-btn quiet" style="min-height:30px;padding:2px 8px" onclick="importStandaloneChar()">Importer</button>
          <button class="ds-btn primary" style="min-height:30px;padding:2px 9px" onclick="openCreateStandaloneChar()">＋ Créer</button>
        </div>
        ${others.length?others.map(character=>_dsV2CharacterCard(character,false)).join(''):'<div class="ds-note" style="padding:12px 0">Aucun autre personnage.</div>'}
        <div style="height:90px"></div>
      </div>
    </div>`;
    return;
  }
  const chars=Object.entries(currentUserData?.charLib||{});
  const currentIndex=chars.findIndex(([id])=>id===currentCampaignId);
  const current=currentIndex>=0?chars[currentIndex]:null;
  const others=chars.filter((_,index)=>index!==currentIndex);
  el.innerHTML=`<div class="ds-grouppage">
    <div class="gp-body">
      <div class="ds-title" style="margin-bottom:10px">Personnage</div>
      ${current
        ?`<div class="ds-seclbl" style="margin-bottom:7px">Fiche en cours</div>${_dsCharacterCard(current[0],current[1],true)}`
        :`<div class="ds-card" style="text-align:center;padding:20px;margin-bottom:12px">
            <div style="font-family:var(--ds-disp);font-size:17px;font-weight:700">Aucune fiche en cours</div>
            <div class="ds-note" style="margin-top:4px">Choisis un personnage ci-dessous ou crée-en un.</div>
          </div>`}
      <div style="display:flex;align-items:center;gap:8px;margin:14px 0 8px">
        <div class="ds-seclbl" style="flex:1">Mes personnages${chars.length?' · '+chars.length:''}</div>
        <button class="ds-btn quiet" style="min-height:30px;padding:2px 8px" onclick="importStandaloneChar()">Importer</button>
        <button class="ds-btn primary" style="min-height:30px;padding:2px 9px" onclick="openCreateStandaloneChar()">＋ Créer</button>
      </div>
      ${others.length
        ?others.map(([id,character])=>_dsCharacterCard(id,character,false)).join('')
        :current?'':`<div class="ds-note" style="padding:12px 0">Tu n’as encore aucun personnage.</div>`}
      <div style="height:90px"></div>
    </div>
  </div>`;
}
function _dsOpenCharacterPage(){
  _dsCloseGroup();
  _dsCharacterPageOpen=true;
  let el=document.getElementById('dsCharacterPage');
  if(!el){
    el=document.createElement('div');
    el.id='dsCharacterPage';
    document.body.appendChild(el);
  }
  el.style.display='block';
  if(_dsV2Enabled())_dsV2CharacterCache=null;
  _dsRenderCharacterPage();
  if(typeof _refreshModeNav==='function')_refreshModeNav();
}
function _navGoChar(){
  if(window._currentCampIsMJ){
    // ⚠️ Fermer les pages plein écran AVANT d'ouvrir le panneau MJ. La page Groupe et
    // la page Personnage sont des surcouches posées sur <body> : sans ces fermetures,
    // showMJScreen() peignait bien le panneau MJ… DERRIÈRE la page Groupe restée
    // visible. D'où « en mode MJ, depuis la page Groupe, on ne peut pas cliquer sur
    // Panneau MJ, il faut passer par Tables » (test du 25/07) — passer par Tables
    // « marchait » seulement parce que showHub, lui, ferme ces surcouches.
    // La branche joueur, juste en dessous, faisait déjà ces deux fermetures.
    if(typeof _dsCloseGroup==='function')_dsCloseGroup();
    if(typeof _dsCloseCharacterPage==='function')_dsCloseCharacterPage();
    if(currentTableId&&currentCampaignId&&typeof enterCampaign==='function'){
      enterCampaign(currentTableId,currentCampaignId);
    }
    return;
  }
  // Une fiche chargée reste le cœur de cette destination.
  if(currentCampaignId&&state?.players?.length){
    _dsCloseGroup();
    _dsCloseCharacterPage();
    showApp();
    // ⚠️ showApp() ne fait qu'AFFICHER l'écran : il ne dessine rien. Sans le render()
    // ci-dessous, arriver par « Reprendre » ouvrait une page BLANCHE — signalé au test
    // du 25/07 (« je clique sur reprendre puis sur personnage »). Ce chemin-là passe par
    // joinGroupOnly, qui charge bien la fiche en mémoire pour le lanceur de dés mais ne
    // peint jamais : personne n'avait donc dessiné la fiche avant nous. Les deux autres
    // entrées font déjà ce couple showApp()+render() (enterCampaign, _dsOpenV2Character).
    // _suppressUnsavedMark : peindre n'est pas modifier — sans lui la fiche s'ouvrirait
    // marquée « non sauvegardée » alors que le joueur n'a rien touché.
    _suppressUnsavedMark=true;
    if(typeof render==='function')render();
    return;
  }
  _dsOpenCharacterPage();
}
function _dsShareHTML(s,idx,mjMode){
  const del=mjMode?`<button class="ds-btn quiet" style="min-height:26px;padding:2px 8px;color:var(--ds-seal);border-color:var(--ds-seal)" onclick="_dsRemoveShare(${idx})">🗑</button>`:'';
  const media=s.image?.mediaId?`<button class="ds-discovery-media ${s.type}" onclick="_dsOpenDiscoveryImage(${idx})" aria-label="Agrandir l'image : ${esc(s.image.alt||s.title||'Découverte')}"><img data-discovery-media="${esc(s.image.mediaId)}" alt="${esc(s.image.alt||s.title||'Découverte')}" loading="lazy"></button>`:'';
  if(s.type==='indice'){
    const mat=s.matiere==='pierre'?'stone':s.matiere==='bois'?'wood':s.matiere==='rune'?'rune':'';
    return`<div class="ds-pin ${mat}">${media}${s.title?`<b>${esc(s.title)}</b><br>`:''}${esc(s.text||'')}${del?`<div style="margin-top:6px;text-align:right">${del}</div>`:''}</div>`;
  }
  const ic=s.type==='artefact'?'🗡':'🗝';
  const chip=s.type==='artefact'?'<span class="ds-chip seal" style="font-size:10px;padding:1px 6px">Artefact</span>':'<span class="ds-chip" style="font-size:10px;padding:1px 6px">Objet de quête</span>';
  return`<div class="ds-item ${s.type==='artefact'?'artefact':''}">${media||`<span class="ic">${ic}</span>`}
    <div style="flex:1;min-width:0"><div style="font-family:var(--ds-disp);font-size:11.5px;font-weight:700">${esc(s.title||'?')} ${chip}</div>
    ${s.text?`<div class="ds-note">${esc(s.text)}</div>`:''}</div>${del}</div>`;
}
async function _dsOpenDiscoveryImage(idx){
  const s=(_dsShares||[])[idx];if(!s?.image)return;
  try{
    const url=await discoveryImageService.url(currentCampaignId,s.image);
    openWideModal(`<div class="pt">${esc(s.title||'Découverte')}</div>
      <img class="ds-discovery-full" src="${esc(url)}" alt="${esc(s.image.alt||s.title||'Découverte')}">
      ${s.text?`<div class="ds-discovery-description">${esc(s.text)}</div>`:''}`);
  }catch(e){showToast("❌ Impossible d'ouvrir l'image.");}
}
// ⛔ NE JAMAIS LIRE L'ÉTAT DE L'APP VIA « window.X » — CE FICHIER EN EST MORT LE 2026-07-22.
// currentUser, _groupData, _activeCombatState, _mjTab, _mjCombatStarted sont déclarés avec
// « let » (firebase.js, core.js). Or « let » au premier niveau d'un <script> classique crée
// une variable de portée SCRIPT, PAS une propriété de window : window._groupData vaut donc
// TOUJOURS undefined. Écrit en garde défensive, « window.X && X.champ » ne protégeait rien —
// il forçait la branche vide en silence, sans la moindre erreur en console.
// Conséquences réelles : page Groupe bloquée sur « En attente des joueurs… » avec 4 joueurs à
// table · aucun bandeau de tour de jeu · onglet MJ actif jamais surligné (donc intercalaire MJ
// impossible). Preuve : `node -e "let a=1;console.log(globalThis.a)"` → undefined.
// shell.js étant chargé EN DERNIER (index.html:269), ces variables existent toujours :
// on les lit DIRECTEMENT. Pour une variable qui pourrait manquer, utiliser typeof, pas window.
const _DS_GROUP_SECTIONS_KEY='ds_group_sections_v1';
function _dsGroupSectionState(){
  const defaults={members:true,discoveries:true,chronicle:true};
  try{
    const saved=JSON.parse(localStorage.getItem(_DS_GROUP_SECTIONS_KEY)||'null');
    return saved&&typeof saved==='object'?{...defaults,...saved}:defaults;
  }catch(e){return defaults;}
}
function _dsToggleGroupSection(section){
  if(!['members','discoveries','chronicle'].includes(section))return;
  const state=_dsGroupSectionState();
  state[section]=!state[section];
  try{localStorage.setItem(_DS_GROUP_SECTIONS_KEY,JSON.stringify(state));}catch(e){}
  const panel=document.getElementById('dsGroupSection-'+section);
  const button=document.querySelector(`[data-ds-group-toggle="${section}"]`);
  if(panel)panel.hidden=!state[section];
  if(button){
    button.setAttribute('aria-expanded',String(state[section]));
    const chevron=button.querySelector('.ds-group-chevron');
    if(chevron)chevron.textContent=state[section]?'▾':'▸';
  }
}
function _dsGroupSection(section,title,content,extraClass=''){
  const open=_dsGroupSectionState()[section]!==false;
  return`<section class="ds-group-section ${extraClass}">
    <button type="button" class="ds-group-section-head" data-ds-group-toggle="${section}"
      aria-expanded="${open}" aria-controls="dsGroupSection-${section}"
      onclick="_dsToggleGroupSection('${section}')">
      <span>${title}</span><span class="ds-group-chevron" aria-hidden="true">${open?'▾':'▸'}</span>
    </button>
    <div class="ds-group-section-body" id="dsGroupSection-${section}"${open?'':' hidden'}>${content}</div>
  </section>`;
}
function _dsRenderGroup(){
  const el=document.getElementById('dsGroupPage');if(!el||!_dsGroupOpen)return;
  const combat=_activeCombatState&&_activeCombatState.active;
  const myTurn=combat&&currentUser&&_activeCombatState.currentTurnUid===currentUser.uid;
  const gd=window._currentCampIsMJ?(_mjPlayersData||[]):(_groupData||[]);
  const localSidekicks=window._currentCampIsMJ
    ?(_mjNPCs||[]).filter(npc=>npc.isSidekick===true
      &&npc.archived!==true
      &&(npc.campaignIds||[]).includes(currentCampaignId)).map(npc=>({
        uid:`sidekick:${npc._v2Id||npc.name}`,
        characterId:`sidekick:${npc._v2Id||npc.name}`,
        playerName:'Contrôlé par le MJ',
        avatar:'🤝',
        isSidekick:true,
        charData:{
          charName:npc.name,
          portrait:npc.portrait,
          race:npc.race,
          classes:[{name:npc.sidekickLabel||'Comparse',level:npc.sidekickLevel||1}],
          hp:npc.hp,
          hpMax:npc.hpMax||npc.hp,
          tempHp:npc.tempHp,
          conditions:npc.conditions||[]
        }
      }))
    :(_groupSidekicks||[]);
  const groupMembers=[...gd,...localSidekicks];
  const publicOrder=combat
    ?[...(_activeCombatState.combatants||[])]
      .filter(combatant=>!combatant.hidden)
      .sort((a,b)=>(b.initiative||0)-(a.initiative||0))
    :[];
  const currentIndex=publicOrder.findIndex(combatant=>{
    if(_activeCombatState.currentTurnUid)return combatant.uid===_activeCombatState.currentTurnUid;
    return combatant.name===_activeCombatState.currentTurnName;
  });
  const turnOwner=(gd.find(pp=>pp.uid===_activeCombatState?.currentTurnUid)||{});
  const currentTurnName=_activeCombatState?.currentTurnName
    ||turnOwner.playerName
    ||(turnOwner.charData||{}).charName
    ||'Créature';
  const orderHtml=publicOrder.length
    ?`<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:8px" aria-label="Ordre d'initiative">
        ${publicOrder.map((combatant,index)=>{
          const active=index===currentIndex;
          const conditions=(combatant.conditions||[]).slice(0,2);
          return`<span class="ds-chip${active?' good':''}" style="${active?'font-weight:800;':''}" title="Initiative ${combatant.initiative||0}${conditions.length?' · '+esc(conditions.join(', ')):''}">
            ${active?'▶ ':''}${esc(combatant.name||'Créature')} · ${combatant.initiative||0}${conditions.length?' · ⚠ '+esc(conditions.join(', ')):''}
          </span>`;
        }).join('')}
      </div>`
    :'';
  const tour=combat?`<div class="ds-seclbl" style="margin:12px 0 8px">⚡ Tour de jeu · Round ${_activeCombatState.round||1}</div>
    ${myTurn?`<div class="ds-turnbar"><span>⚡ C'est ton tour !</span><button class="ds-btn quiet" style="min-height:34px" onclick="_dsOpenCombatTab()">⚔ Combat</button><button class="ds-btn" style="min-height:34px" onclick="playerEndTurn()">⏩ Fin du tour</button></div>`
      :`<div class="ds-banner">⚔ <span style="flex:1">Combat en cours — au tour de <b>${esc(currentTurnName)}</b></span><button class="ds-btn quiet" style="min-height:32px" onclick="_dsOpenCombatTab()">⚔ Combat</button></div>`}
    ${orderHtml}`:'';
  const membres=groupMembers.length?groupMembers.map(pp=>{
    const p=pp.charData||{};
    const hp=p.hp||0,hpMax=p.hpMax||1;
    const pct=Math.max(0,Math.min(100,hp/hpMax*100));
    const low=pct<=25,mid=pct>25&&pct<=50;
    const down=hp<=0,dead=down&&(p.deathSaves&&p.deathSaves.fail>=3);
    const isOwn=!!currentUser&&pp.uid===currentUser.uid;
    const isSidekick=pp.isSidekick===true;
    const portrait=p.portrait||p.equipPortrait;
    const cls=(p.classes||[]).map(c=>c.name+' '+c.level).join(' / ');
    const chips=(typeof _buildChargeChips==='function')?_buildChargeChips(p):'';
    return`<div class="ds-corners" style="margin-bottom:10px;cursor:${isOwn||isSidekick?'default':'pointer'}" ${isOwn||isSidekick?'':`onclick="_showHudDetail('${pp.uid}')"`}><i class="cx"></i>
      <div style="display:flex;gap:9px;align-items:center">
        ${portrait?`<img src="${portrait}" style="width:42px;height:42px;object-fit:cover;border:1px solid var(--ds-acc);flex:none">`
          :`<span style="width:42px;height:42px;border:1px solid var(--ds-acc);background:var(--ds-card2);display:grid;place-items:center;font-size:15px;flex:none">${pp.avatar||'⚔'}</span>`}
        <div style="flex:1;min-width:0">
          <div style="font-family:var(--ds-disp);font-size:14.5px;color:var(--ds-ink)"><b>${esc(p.charName||pp.playerName||'?')}</b>
            <span class="ds-note" style="font-size:11px">${isOwn?'Moi':isSidekick?'Comparse · contrôlé par le MJ':esc(pp.playerName||'')}${cls?' · '+esc(cls):''}</span></div>
          <div class="ds-hp ${low?'low':mid?'mid':''}" style="height:13px;margin-top:4px"><i style="width:${pct}%"></i><span class="vv">${dead?'💀':down?'⚠ 0':hp+'/'+hpMax}</span></div>
          ${(p.conditions||[]).length?`<div class="ds-note" style="margin-top:3px">${p.conditions.slice(0,4).join(' ')}</div>`:''}
          ${chips?`<div style="margin-top:3px">${chips}</div>`:''}
        </div>
      </div></div>`;
  }).join(''):`<div class="ds-note" style="padding:10px 0">En attente des joueurs…</div>`;
  const shares=_dsShares===null?`<div class="ds-note">Chargement…</div>`
    :(_dsShares.length?_dsShares.map((s,i)=>_dsShareHTML(s,i,false)).join(''):`<div class="ds-note" style="font-style:italic">Le groupe n'a encore rien découvert.</div>`);
  const chronicle=_dsV2Enabled()
    ?(_dsChronicleEntries===null
      ?`<div class="ds-note">Chargement…</div>`
      :(_dsChronicleEntries.length
        ?_dsChronicleEntries.map(entry=>`<article class="ds-card" style="margin-bottom:8px;padding:10px">
            <div style="display:flex;gap:8px;align-items:baseline;margin-bottom:5px">
              <b style="font-size:12px;color:var(--ds-acc-strong)">${esc(entry.authorNameSnapshot||'Membre')}</b>
              <span class="ds-note" style="margin-left:auto">${_dsChronicleDate(entry.createdAt)}${_dsChronicleWasEdited(entry)?' · modifié':''}</span>
            </div>
            <div style="font-size:13px;line-height:1.55;white-space:pre-wrap">${esc(entry.content||'')}</div>
            ${entry.authorId===currentUser?.uid?`<div style="display:flex;gap:5px;justify-content:flex-end;margin-top:8px">
              <button class="ds-btn quiet" style="min-height:28px;padding:2px 7px" onclick="_dsEditChronicleEntry('${entry.id}')">Modifier</button>
              <button class="ds-btn quiet" style="min-height:28px;padding:2px 7px;color:var(--danger)" onclick="_dsDeleteChronicleEntry('${entry.id}')">Supprimer</button>
            </div>`:''}
          </article>`).join('')
        :`<div class="ds-note" style="padding:6px 0">La chronique ne contient encore aucune entrée.</div>`))
    :`<button class="ds-btn" style="width:100%" onclick="_dsCloseGroup();openCampChronicle(currentTableId,currentCampaignId)">📜 Consulter la chronique</button>`;
  const rests=_dsRestBlockHTML();
  const membersSection=_dsGroupSection('members','🧑‍🤝‍🧑 Membres · '+groupMembers.length,membres,'ds-group-members');
  const discoveriesSection=_dsGroupSection('discoveries','🔎 Découvertes'+(_dsShares?.length?' · '+_dsShares.length:''),shares,'ds-group-discoveries');
  const chronicleComposer=_dsV2Enabled()?`<div class="ds-card ds-group-composer">
    <textarea class="fi" id="dsChronicleInput" rows="3" placeholder="Ajouter une entrée à la chronique…" style="resize:vertical"></textarea>
    <button class="ds-btn primary" style="width:100%;margin-top:7px" onclick="_dsAddChronicleEntry()">Publier</button>
  </div>`:'';
  const chronicleSection=_dsGroupSection(
    'chronicle',
    `📜 Chronique${currentCampaignName?' · '+esc(currentCampaignName):''}`,
    chronicle+chronicleComposer,
    'ds-group-chronicle'
  );
  // A5 (2026-07-22) — Groupe = MODE de plein rang, pas une fenêtre : plus de titre de page
  // ni de bouton ✕. On en sort par la nav (Tables · Personnage · Groupe), comme des autres modes.
  // Le nom du groupe se règlera dans les réglages de table (lot B) ; à défaut, aucun titre.
  el.innerHTML=`<div class="ds-grouppage">
    <div class="gp-body">
      ${tour}
      ${rests}
      <div class="ds-group-layout">
        ${membersSection}
        <div class="ds-group-main">
          ${discoveriesSection}
          ${chronicleSection}
        </div>
      </div>
      <div style="height:90px"></div>
    </div>
  </div>`;
  discoveryImageService.bind(el,currentCampaignId);
}
function _dsOpenCombatTab(){
  _dsCloseGroup();
  if(window._currentCampIsMJ){
    _mjTab='combat';
    renderMJContent();
  }else{
    setTab('combat');
  }
}
function _dsBuildNav(){
  const nav=document.getElementById('modeNav');if(!nav)return;
  if(nav.dataset.ds3)return; // déjà construit
  nav.dataset.ds3='1';
  nav.classList.add('norg-nav'); // structure maquette
  nav.innerHTML=
    `<button class="flat mode-btn mode-hub" onclick="_dsCloseGroup();_dsCloseCharacterPage();showHub()"><span class="mode-ico">🧭</span><br><span class="mode-lbl">Tables</span></button>`+
    `<button class="flat mode-btn mode-char" onclick="_navGoChar()"><span class="mode-ico mode-char-ico">🧙</span><br><span class="mode-lbl mode-char-lbl">Personnage</span></button>`+
    `<button class="flat mode-btn mode-combat" onclick="openActiveCombat()" style="display:none;position:relative"><span class="mode-ico">⚔</span><br><span class="mode-lbl">Combat</span><span class="ds-navbdg combat-live">●</span></button>`+
    `<button class="flat mode-btn mode-group" onclick="_dsNavGoGroup()" style="position:relative"><span class="mode-ico">👥</span><br><span class="mode-lbl">Groupe</span>`+
    `<span id="dsNavTurn" class="ds-navbdg" style="display:none;position:absolute;top:2px;right:14px;min-width:16px;height:16px;border-radius:50%;background:var(--arcane);color:#fff;font-size:11px;font-weight:700;display:none;align-items:center;justify-content:center;animation:combatPulse 1.6s ease-in-out infinite">⚡</span>`+
    `<span id="dsNavDanger" style="display:none;position:absolute;top:2px;left:14px;min-width:16px;height:16px;border-radius:50%;background:var(--danger);color:#fff;font-size:10px;font-weight:700;align-items:center;justify-content:center"></span>`+
    `</button>`+
    `<button class="flat mode-btn mode-stop" onclick="stopCurrentSession()" title="Arrêter la session sans supprimer les données"><span class="mode-ico">⏹</span><br><span class="mode-lbl">Arrêter</span></button>`;
}
// Surcharge de core.js : gère les 3 items + masque Groupe côté MJ.
function _refreshModeNav(){
  const nav=document.getElementById('modeNav');if(!nav)return;
  // La nav reste VISIBLE dès qu'on est connecté (avant : cachée sans campagne → bandeau qui
  // apparaît/disparaît, déroutant). Sans campagne : Personnage/Groupe grisés.
  const auth=document.getElementById('authScreen');
  if(auth&&auth.style.display!=='none'){nav.style.display='none';return;}
  _dsBuildNav();
  nav.style.display='flex';
  const noCamp=!currentCampaignId;
  const charButton=nav.querySelector('.mode-char');
  const groupButton=nav.querySelector('.mode-group');
  const stopButton=nav.querySelector('.mode-stop');
  if(charButton){
    const disabled=noCamp&&!!window._currentCampIsMJ;
    charButton.style.opacity=disabled?'.35':'';
    charButton.style.pointerEvents=disabled?'none':'';
  }
  if(groupButton){
    groupButton.style.opacity=noCamp?'.35':'';
    groupButton.style.pointerEvents=noCamp?'none':'';
  }
  if(stopButton)stopButton.style.display=noCamp?'none':'';
  const vis=el=>el&&el.style.display!=='none';
  const onHub=vis(document.getElementById('hubScreen'));
  const onChar=vis(document.getElementById('app'))||vis(document.getElementById('mjScreen'));
  const mj=!!window._currentCampIsMJ;
  nav.querySelectorAll('.mode-char-lbl').forEach(el=>el.textContent=mj?'Panneau MJ':'Personnage');
  nav.querySelectorAll('.mode-char-ico').forEach(el=>el.textContent=mj?'👑':'🧙');
  const grp=nav.querySelector('.mode-group');if(grp)grp.style.display='';
  const combat=nav.querySelector('.mode-combat');
  const combatActive=!!((_activeCombatState&&_activeCombatState.active)
    ||(window._currentCampIsMJ&&typeof _mjCombatStarted!=='undefined'&&_mjCombatStarted));
  if(combat)combat.style.display=combatActive?'':'none';
  const hb=nav.querySelector('.mode-hub'),ch=nav.querySelector('.mode-char');
  const gOpen=typeof _dsGroupOpen!=='undefined'&&_dsGroupOpen;
  if(hb)hb.classList.toggle('on',!!onHub&&!gOpen);
  if(ch)ch.classList.toggle('on',(!!onChar||_dsCharacterPageOpen)&&!gOpen);
  if(grp)grp.classList.toggle('on',gOpen);
  if(typeof _placeModeNavDesktop==='function')_placeModeNavDesktop();
}
function openActiveCombat(){
  if(!currentCampaignId){showToast('Aucune partie en cours.');return;}
  if(typeof _dsCloseGroup==='function')_dsCloseGroup();
  if(typeof _dsCloseCharacterPage==='function')_dsCloseCharacterPage();
  if(window._currentCampIsMJ){
    showMJScreen();
    setMJTab('combat');
    return;
  }
  showApp();
  setTab('combat');
}

function stopCurrentSession(){
  if(!currentCampaignId){clearSessionState();showHub();return;}
  openModal(`<div class="pt">Arrêter la session en cours ?</div>
    <div style="font-size:14px;color:var(--text2);line-height:1.55;margin-bottom:16px">
      Tu reviendras à ta bibliothèque de tables et de personnages. La campagne,
      les fiches et le combat sauvegardés ne seront pas supprimés.
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="_confirmStopCurrentSession()">Arrêter la session</button>
    </div>`);
}
function _confirmStopCurrentSession(){
  closeModal();
  stopAllListeners();
  clearSessionState();
  currentTableId=null;
  currentCampaignId=null;
  currentCharacterId=null;
  currentSheetCharacterId=null;
  currentTableName='';
  currentCampaignName='';
  currentTableMjId=null;
  window._currentCampIsMJ=false;
  _activeCombatState=null;
  _combatListenerInitialized=false;
  _prevCombatTurnUid=null;
  if(typeof _dsCloseGroup==='function')_dsCloseGroup();
  if(typeof _dsCloseCharacterPage==='function')_dsCloseCharacterPage();
  _syncGlobalCombatControls();
  showHub();
  showToast('Session arrêtée. Tes données restent sauvegardées.');
}
// Signaux sur l'item Groupe (appelé par _updatePartyHUD via patch ci-dessous)
function _dsNavSignals(){
  const turn=document.getElementById('dsNavTurn');
  const dng=document.getElementById('dsNavDanger');
  if(!turn&&!dng)return;
  const combatActive=!!(_activeCombatState&&_activeCombatState.active); // voir l'avertissement « window.X » plus haut
  const myTurn=combatActive&&!!currentUser&&_activeCombatState.currentTurnUid===currentUser.uid;
  const dCount=(_groupData||[]).filter(pp=>{const p=pp.charData||{};return p.hpMax&&p.hp/p.hpMax<=.25;}).length;
  if(turn)turn.style.display=myTurn?'flex':'none';
  if(dng){dng.style.display=dCount?'flex':'none';dng.textContent=dCount||'';}
  const combat=document.querySelector('#modeNav .mode-combat');
  if(combat)combat.style.display=(combatActive||(window._currentCampIsMJ&&typeof _mjCombatStarted!=='undefined'&&_mjCombatStarted))?'':'none';
  if(typeof _syncGlobalCombatControls==='function')_syncGlobalCombatControls();
}
// Patch : chaque rafraîchissement du HUD de groupe met aussi à jour la nav.
if(typeof _updatePartyHUD==='function'){
  const _dsOldUPH=_updatePartyHUD;
  _updatePartyHUD=function(){_dsOldUPH.apply(this,arguments);try{_dsNavSignals();}catch(e){}
    try{if(typeof _dsGroupOpen!=='undefined'&&_dsGroupOpen)_dsRenderGroup();}catch(e){}};
}
// Suppression d'un partage (côté MJ uniquement)
function _dsRemoveShare(idx){
  if(!window._currentCampIsMJ||!currentCampaignId)return;
  const s=(_dsShares||[])[idx];if(!s)return;
  if(_dsV2Enabled()&&typeof v2GroupService!=='undefined'){
    v2GroupService.returnDiscoveryToReserve(currentCampaignId,s.id,currentUser.uid)
      .then(()=>{_dsShares.splice(idx,1);showToast('🎒 Découverte replacée dans la Réserve.');_dsRenderMJShares();})
      .catch(()=>showToast('❌ Une erreur est survenue, réessaie.'));
    return;
  }
  fbDb.collection('campaigns').doc(currentCampaignId).update({shares:firebase.firestore.FieldValue.arrayRemove(s)})
    .then(()=>{_dsShares.splice(idx,1);showToast('🗑 Partage retiré.');if(typeof _dsRenderMJShares==='function')_dsRenderMJShares();})
    .catch(()=>showToast('❌ Une erreur est survenue, réessaie.'));
}

// ── MJ (P4) : onglet « Joueurs » → « 👥 Groupe » + « 🎁 Apporter au groupe » ──
// ⚠️ DÉFINITION UNIQUE de renderMJTabs. Il en existait une seconde dans mj/index.js ;
// shell.js étant chargé en dernier (index.html), c'est TOUJOURS celle-ci qui peignait le
// rail — l'autre était du code mort, et un audit qui la lisait concluait « conforme »
// alors que l'écran affichait autre chose (constaté le 2026-07-25). La version morte a
// été retirée : ne pas en réintroduire ailleurs.
//
// Ordre et libellés : §10 du cahier des charges du 2026-07-24.
// « Groupe » y devient « Joueurs » pour ne pas se confondre avec la vraie page Groupe.
function renderMJTabs(){
  const tabs=[
    {id:'joueurs',ico:'👥',txt:'Joueurs'},
    {id:'combat',ico:'⚡',txt:'Combat'},
    {id:'pnj',ico:'🐉',txt:'PNJ'},
    {id:'objets',ico:'💰',txt:'Objets'},
    // La RÉSERVE du MJ : ce qu'il a préparé mais pas encore donné au groupe.
    {id:'stock',ico:'🎒',txt:'Réserve'},
    {id:'journal',ico:'📓',txt:'Journal MJ'},
    {id:'regles',ico:'📖',txt:'Règles'},
  ];
  const bar=document.getElementById('mjTabBar');
  if(bar) bar.innerHTML=tabs.map(t=>{
    // _mjTab / _mjCombatStarted : lecture DIRECTE — voir l'avertissement « window.X » plus haut.
    // Avec window._mjTab (undefined), AUCUN onglet MJ ne recevait « on » : d'où le rail MJ sans
    // onglet actif, et l'intercalaire MJ (::after posé sur .on) qui ne pouvait pas fonctionner.
    const ce=t.id==='combat'?(_mjCombatStarted?' mj-tab-combat-active':' mj-tab-combat-idle'):'';
    return`<button class="mj-tab${_mjTab===t.id?' on':''}${ce}" onclick="setMJTab('${t.id}')"><span class="ti">${t.ico}</span><span class="tl">${t.txt}</span></button>`;
  }).join('');
  // CRUCIAL : envelopper la barre dans .tab-scroller (le rail fixe) — en session MJ pure,
  // renderTabBar (joueur) ne tourne jamais, donc personne d'autre ne crée le wrapper.
  if(typeof _initTabScrollers==='function')setTimeout(_initTabScrollers,0);
  // ⚠ showMJScreen() n'appelle QUE renderMJTabs et compte sur lui pour peindre le
  // contenu (comportement de l'original) — sans ça le Panneau MJ s'ouvre VIDE.
  if(typeof renderMJContent==='function')renderMJContent();
}
function _dsOpenShareModal(type){
  const T={indice:'📜 Indice',artefact:'🗡 Artefact',quete:'🗝 Objet de quête'}[type]||type;
  const MI={parchemin:'📜',pierre:'🪨',bois:'🌳',rune:'🔮'};
  const mat=type==='indice'?`<div class="fl mb6">Matière de l'indice</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
      ${['parchemin','pierre','bois','rune'].map((m,i)=>`<button class="btn ds-matopt${i===0?' bac':''}" data-m="${m}" onclick="document.querySelectorAll('.ds-matopt').forEach(b=>b.classList.remove('bac'));this.classList.add('bac')">${MI[m]} ${m}</button>`).join('')}
    </div>`:'';
  openModal(`<div class="pt">${T} — apporter au groupe</div>
    <div class="fl mb6">Titre${type==='indice'?' (optionnel)':''}</div>
    <input class="fi" id="dsShTitle" style="margin-bottom:10px">
    ${mat}
    <div class="fl mb6">${type==='indice'?"Texte de l'indice":'Description'}</div>
    <textarea class="fi" id="dsShText" rows="3" style="resize:vertical;margin-bottom:12px"></textarea>
    <div class="fl mb6">Image (facultative)</div>
    <input class="fi" id="dsShImage" type="file" accept="image/jpeg,image/png,image/webp" style="margin-bottom:12px">
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="_dsConfirmShare('${type}')">🎁 Mettre à disposition</button>
    </div>`);
}
async function _dsConfirmShare(type){
  const title=((document.getElementById('dsShTitle')||{}).value||'').trim();
  const text=((document.getElementById('dsShText')||{}).value||'').trim();
  if(!text&&!title){showToast('❌ Écris au moins un titre ou un texte.');return;}
  const mEl=document.querySelector('.ds-matopt.bac');
  let image=null;
  try{
    const file=(document.getElementById('dsShImage')||{}).files?.[0];
    if(file)image=await discoveryImageService.upload(currentCampaignId,file,title||'Découverte du groupe');
  }catch(e){showToast('❌ Image impossible : '+e.message,4500);return;}
  const share={type,title,text,image,ts:Date.now()};
  if(type==='indice')share.matiere=mEl?mEl.dataset.m:'parchemin';
  if(_dsV2Enabled()&&typeof v2GroupService!=='undefined'){
    const discoveryType=type==='indice'?'clue':type==='artefact'?'artifact':'quest_item';
    const fallbackTitle=title||text.slice(0,60)||'Découverte';
    v2GroupService.addDiscovery(currentCampaignId,{
      type:discoveryType,
      title:fallbackTitle,
      content:text||null,
      material:share.matiere||null,
      image,
      revealedBy:currentUser.uid
    })
      .then(()=>{closeModal();showToast('🔎 Découvert par le groupe.');_dsShares=null;_dsRenderMJShares(true);})
      .catch(async()=>{if(image)await discoveryImageService.remove(currentCampaignId,image).catch(()=>{});showToast('❌ Une erreur est survenue, réessaie.');});
    return;
  }
  fbDb.collection('campaigns').doc(currentCampaignId).update({shares:firebase.firestore.FieldValue.arrayUnion(share)})
    .then(()=>{closeModal();showToast('🔎 Découvert par le groupe.');_dsShares=null;_dsRenderMJShares(true);})
    .catch(async()=>{if(image)await discoveryImageService.remove(currentCampaignId,image).catch(()=>{});showToast('❌ Une erreur est survenue, réessaie.');});
}
function _dsRenderMJShares(reload){
  const host=document.getElementById('dsMJShares');if(!host)return;
  if(_dsShares===null||reload){
    host.innerHTML='<div class="ds-note">Chargement…</div>';
    if(_dsV2Enabled()&&typeof v2GroupService!=='undefined'){
      v2GroupService.listDiscoveries(currentCampaignId)
        .then(items=>{_dsShares=items.map(_dsDiscoveryToShare);_dsRenderMJShares();})
        .catch(()=>{_dsShares=[];_dsRenderMJShares();});
      return;
    }
    fbDb.collection('campaigns').doc(currentCampaignId).get()
      .then(d=>{_dsShares=(d.exists&&d.data().shares)||[];_dsRenderMJShares();})
      .catch(()=>{_dsShares=[];_dsRenderMJShares();});
    return;
  }
  host.innerHTML=_dsShares.length
    ?_dsShares.map((s,i)=>_dsShareHTML(s,i,true)).join('')
    :'<div class="ds-note" style="font-style:italic">Rien de partagé pour l\'instant — indices, artefacts et objets de quête apparaîtront sur la page Groupe des joueurs.</div>';
  discoveryImageService.bind(host,currentCampaignId);
}
// ⚠️ RETIRÉ le 2026-07-25 — un monkey-patch de renderMJContent injectait en tête de
// l'onglet Joueurs : « 🎁 Apporter au groupe » (3 boutons), la liste des découvertes
// partagées, et « 📜 Chronique de la campagne ». Il datait de la refonte UI de juillet,
// avant le cahier des charges du 24/07, qui tranche l'inverse :
//   §10.1 — l'onglet Joueurs « ne duplique ni Chronique, ni Découvertes, ni inventaires
//           complets » ;
//   phase F4 — « retrait des journaux joueurs et de la Chronique du panneau ».
// Aucune capacité n'est perdue, vérifié avant retrait :
//   • préparer ET donner un indice / artefact / objet de quête = onglet RÉSERVE
//     (mjOpenReserveModal, mêmes trois types, plus le bouton « 🎁 Donner ») ;
//   • consulter la chronique = Hub, détail de campagne (« 📜 Consulter la chronique »),
//     et page Groupe côté joueurs.
// Ne pas réinjecter de contenu dans un onglet MJ par surcharge : le contenu d'un onglet
// appartient à sa fonction mjTab*(), sinon un audit qui la lit décrit un écran faux.

// ── TOASTS RICHES → POPUPS GRIMOIRE (rapport 2026-07-19) ──
// Les toasts COURTS (confirmations passives) restent des toasts ; les toasts RICHES
// (résultats de combat, contenus multi-lignes) deviennent une popup avec bouton OK.
if(typeof showToast==='function'){
  const _dsOldToast=showToast;
  showToast=function(html,duration){
    const big=(typeof html==='string')&&(html.length>140||/<(div|table|br|ul)/i.test(html));
    if(!big)return _dsOldToast.apply(this,arguments);
    let ov=document.getElementById('dsToastPop');
    if(!ov){
      ov=document.createElement('div');ov.id='dsToastPop';
      ov.addEventListener('click',e=>{if(e.target===ov)ov.style.display='none';});
      document.body.appendChild(ov);
    }
    ov.innerHTML=`<div class="dsp-box">${html}<button class="btn" onclick="document.getElementById('dsToastPop').style.display='none'">✓ OK</button></div>`;
    ov.style.display='flex';
    clearTimeout(ov._t);ov._t=setTimeout(()=>{ov.style.display='none';},Math.max(duration||0,6000));
  };
}

// DEUX COQUES : mobile = nav = bandeau du BAS · desktop = nav dans la BARRE DU HAUT
// (cahier des charges : « Desktop = top bar ; mobile = bottom bar »).
function _placeModeNavDesktop(){
  const nav=document.getElementById('modeNav');
  const top=document.getElementById('dtopbar');
  const slot=document.getElementById('dtopbarNav');
  if(!nav)return;
  const desktop=window.innerWidth>=900;
  const connected=typeof currentUser!=='undefined'&&currentUser;
  if(desktop){
    if(slot&&nav.parentElement!==slot)slot.appendChild(nav);
    nav.classList.add('nav-top');nav.classList.remove('norg-nav');
    if(top)top.style.display=connected?'flex':'none';
    const av=document.getElementById('dtopAvatar');
    if(av&&typeof currentUserData!=='undefined'&&currentUserData&&currentUserData.avatar)av.textContent=currentUserData.avatar;
  }else{
    if(nav.parentElement!==document.body)document.body.appendChild(nav);
    nav.classList.remove('nav-top');nav.classList.add('norg-nav');
    if(top)top.style.display='none';
  }
}
window.addEventListener('resize',_placeModeNavDesktop);

// ── EN-TÊTE FICHE : cale la hauteur du bandeau fixe (bandeau+vitals) sur mobile ──
// Robuste aux variations (bouclier, jets de mort, inputs MJ) : mesure réelle → --fiche-head.
function _dsSyncFicheHead(){
  try{
    const head=document.querySelector('#charRail .norg-head');
    const vit=document.querySelector('#charRail .norg-vitals');
    if(!head)return;
    const hh=head.offsetHeight;
    if(vit)vit.style.top=hh+'px';                       // les vitals se posent sous le bandeau
    const total=hh+(vit?vit.offsetHeight:0);
    if(total>0)document.documentElement.style.setProperty('--head-h',total+'px');
  }catch(e){}
}
// ── PRÉSERVATION DU DÉFILEMENT (lot B, 2026-07-23) ───────────────────────────
// Plainte : « les pages se réinitialisent en permanence ». Cause : render() (fiche)
// et renderMJContent() (MJ) reconstruisent tout le contenu par innerHTML → la page
// remonte en haut à CHAQUE action (cocher une charge, lancer un dé, modifier les PV…).
// Correctif : mémoriser la position juste avant de reconstruire, la restaurer juste après.
//   • MÊME onglet (refresh in-place)  → on restaure la position (le vrai correctif).
//   • onglet DIFFÉRENT (on vient d'en changer) → on remonte en haut (comportement voulu).
// C'est ce qui distingue un rafraîchissement d'un changement d'onglet, sans toucher à setTab.
let _dsScrollLastKey=null;
function _dsPreserveScroll(key,fn){
  const se=document.scrollingElement||document.documentElement;
  const same=(key===_dsScrollLastKey);
  const y=same?(se?se.scrollTop:0):0;
  try{fn();}finally{
    _dsScrollLastKey=key;
    if(same){
      if(se)se.scrollTop=y;
      // autoGrow/layout peut décaler la hauteur juste après → on refixe au frame suivant.
      requestAnimationFrame(()=>{if(se)se.scrollTop=y;});
    }else if(se){se.scrollTop=0;}
  }
}
if(typeof render==='function'){
  const _dsOldRender=render;
  // _dsApplyClassTheme à CHAQUE rendu : la classe du personnage peut changer (montée de
  // niveau, multiclassage, changement de perso) — la couleur d'identité doit suivre.
  render=function(){
    const _k='fiche:'+((typeof state!=='undefined'&&state)?state.activeTab:'')+':'+((typeof state!=='undefined'&&state)?state.activeIdx:'');
    _dsPreserveScroll(_k,()=>_dsOldRender.apply(this,arguments));
    _dsApplyClassTheme();setTimeout(_dsSyncFicheHead,0);
  };
}
if(typeof renderMJContent==='function'){
  const _dsOldMJRender=renderMJContent;
  renderMJContent=function(){
    // Clé = onglet MJ courant : un simple refresh garde la position, un changement d'onglet remonte.
    const _k='mj:'+((typeof _mjTab!=='undefined')?_mjTab:'');
    _dsPreserveScroll(_k,()=>_dsOldMJRender.apply(this,arguments));
  };
}
window.addEventListener('resize',_dsSyncFicheHead);

// ── REPRISE DE SESSION — RETIRÉE ICI le 2026-07-22, remplacée par le « lot 0 » ──
// Il y avait à cet endroit deux enveloppes (sur enterCampaign et showHub) qui mémorisaient la
// campagne dans une clé `ds_resume` et y replongeaient au démarrage. Elles portaient 5 défauts :
//   1. ⚠ GRAVE — elles appelaient enterCampaign() AVANT le vrai showHub(), donc avant que
//      renderHub() ait rempli _hubCache. Or enterCampaign en déduit le rôle :
//      `asMJ = tableData && tableData.mjId===currentUser.uid`. Avec _hubCache null → asMJ=false
//      → un MJ était rouvert comme JOUEUR.
//   2. leur `return;` empêchait le vrai showHub() de s'exécuter : _hubCache restait null pour
//      TOUTE la session, alors que enterCampaign et joinGroupOnly s'en servent.
//   3. `ds_resume` n'était pas cloisonnée par compte → deux comptes sur le même navigateur
//      héritaient de la partie de l'autre.
//   4. la branche `else` effaçait la clé dès le 2e appel à showHub, c.-à-d. dès un simple retour
//      aux Tables → la reprise ne fonctionnait qu'une fois puis se désarmait silencieusement.
//   5. enterCampaign était appelée sans nom de table ni de campagne, et sans _hubCache pour les
//      retrouver → bandeaux vides.
// Le remplacement vit désormais à la source, pas en surcouche :
//   • écriture  : enterCampaign (hub.js) · joinGroupOnly + showHub (core.js)
//   • lecture   : _bootToLastScreen / _restoreSession (core.js), APRÈS le remplissage de _hubCache
//   • stockage  : mjtk_session_<uid> (firebase.js), cloisonné par compte
// Purge de l'ancienne clé, devenue morte :
try{localStorage.removeItem('ds_resume');}catch(e){}

// ── OPTIONS PROFIL : thème ☀/🌙 + main 🖐/✋ (section ajoutée au modal Profil) ──
if(typeof openUserSettings==='function'){
  const _dsOldUS=openUserSettings;
  openUserSettings=function(){
    _dsOldUS.apply(this,arguments);
    try{
      setTimeout(()=>{
        const box=document.querySelector('#modal .modal-box');
        if(box){
          // Toutes les sections du Profil REPLIÉES par défaut (rapport 2026-07-19)
          box.querySelectorAll('details.acc[open]').forEach(d=>d.removeAttribute('open'));
        }
        if(box&&!document.getElementById('dsPrefsSec')){
          const t=localStorage.getItem('ds_theme')||'light';
          const h=localStorage.getItem('ds_hand')||'right';
          const m=localStorage.getItem('ds_mix')||'mix1';
          const w=document.createElement('details');w.id='dsPrefsSec';w.className='acc';w.open=false;
          w.innerHTML=`<summary>🎨 Affichage</summary>
            <div class="acc-body">
              <div class="fl mb6">Thème</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
                <button class="btn${t==='light'?' bac':''}" onclick="dsSetTheme('light');closeModal();openUserSettings()">☀ Grimoire</button>
                <button class="btn${t==='dark'?' bac':''}" onclick="dsSetTheme('dark');closeModal();openUserSettings()">🌙 Veillée</button>
              </div>
              <div class="fl mb6">Main directrice</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
                <button class="btn${h==='right'?' bac':''}" onclick="dsSetHand('right');closeModal();openUserSettings()">🖐 Droitier</button>
                <button class="btn${h==='left'?' bac':''}" onclick="dsSetHand('left');closeModal();openUserSettings()">✋ Gaucher</button>
              </div>
              <div class="fl mb6">Identité de classe</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap">
                <button class="btn${m==='mix1'?' bac':''}" onclick="dsSetMix('mix1');closeModal();openUserSettings()">⬛ Complet</button>
                <button class="btn${m==='mix2'?' bac':''}" onclick="dsSetMix('mix2');closeModal();openUserSettings()">〰 Motif</button>
                <button class="btn${m==='off'?' bac':''}" onclick="dsSetMix('off');closeModal();openUserSettings()">∅ Aucune</button>
              </div>
              <div class="ds-note" style="margin-top:6px">La couleur de ta classe marque les encarts : coins gravés (Complet) ou liseré (Motif).</div>
              <button class="btn" style="width:100%;margin-top:12px" onclick="resetAllBlockLayouts()">↺ Réinitialiser la disposition</button>
            </div>`;
          // Placer « Affichage » JUSTE APRÈS l'accordéon « Profil » (1ᵉʳ .acc), pas à la fin
          const accs=box.querySelectorAll('details.acc');
          let profAcc=null;
          accs.forEach(a=>{const s=a.querySelector('summary');if(s&&/profil/i.test(s.textContent)&&!profAcc)profAcc=a;});
          if(profAcc)profAcc.insertAdjacentElement('afterend',w); else box.appendChild(w);
        }
      },60);
    }catch(e){}
  };
}

// ── DÉ FLOTTANT : déplaçable + ancrage + estompage (sur #diceFloat existant) ──
// Tap court = comportement existant (ouvre le panneau de dés — onclick intact).
// Glisser (>8px) = déplacement libre ; relâcher près du logement = re-sertissage.
// 4 s sans contact = estompage à 45 % (.ds-idle). Position mémorisée par appareil.
(function(){
  let df=null,sock=null,drag=null,moved=false,idleT=null;
  function el(){df=df||document.getElementById('diceFloat');return df;}
  function socket(){
    if(sock)return sock;
    sock=document.createElement('div');sock.className='ds-dsock';sock.id='dsDieSock';
    document.body.appendChild(sock);
    return sock;
  }
  function wake(){
    // Estompage ANNULÉ (2026-07-19) : le dé serti dans le bandeau reste pleinement visible.
    if(!el())return;
    df.classList.remove('ds-idle');
    clearTimeout(idleT);
  }
  window._dsDieSeat=function(){ // repose le dé dans son ancrage (position CSS par défaut)
    if(!el())return;
    df.style.left='';df.style.top='';df.style.right='';df.style.bottom='';
    localStorage.removeItem('ds_die_pos');
    wake();
  };
  function restore(){
    if(!el())return;
    try{
      const s=localStorage.getItem('ds_die_pos');
      if(s){const p=JSON.parse(s);
        df.style.left=Math.min(p.x,window.innerWidth-60)+'px';
        df.style.top=Math.min(p.y,window.innerHeight-60)+'px';
        df.style.right='auto';df.style.bottom='auto';}
    }catch(e){}
    wake();
  }
  function onDown(e){
    if(!el())return;
    moved=false;
    const r=df.getBoundingClientRect();
    drag={dx:e.clientX-r.left,dy:e.clientY-r.top};
    wake();
  }
  function onMove(e){
    if(!drag||!el())return;
    const x=e.clientX-drag.dx,y=e.clientY-drag.dy;
    if(!moved){
      const r=df.getBoundingClientRect();
      if(Math.abs(x-r.left)<8&&Math.abs(y-r.top)<8)return; // pas encore un drag
      moved=true;socket().classList.add('show');
      try{df.setPointerCapture(e.pointerId);}catch(_){}
    }
    e.preventDefault();
    df.style.left=Math.max(2,Math.min(x,window.innerWidth-df.offsetWidth-2))+'px';
    df.style.top=Math.max(2,Math.min(y,window.innerHeight-df.offsetHeight-2))+'px';
    df.style.right='auto';df.style.bottom='auto';
  }
  function onUp(e){
    if(!drag)return;
    const wasDrag=moved;drag=null;moved=false;
    const sk=socket();sk.classList.remove('show');
    if(wasDrag&&el()){
      const dr=df.getBoundingClientRect(),sr=sk.getBoundingClientRect();
      const d=Math.hypot(dr.left+dr.width/2-(sr.left+sr.width/2),dr.top+dr.height/2-(sr.top+sr.height/2));
      if(d<60){_dsDieSeat();}
      else{try{localStorage.setItem('ds_die_pos',JSON.stringify({x:dr.left,y:dr.top}));}catch(_){}}
      // un drag ne doit PAS ouvrir le panneau de dés : on avale le clic qui suit
      df.addEventListener('click',ev=>{ev.stopPropagation();ev.preventDefault();},{capture:true,once:true});
    }
    wake();
  }
  function init(){
    if(!el())return;
    if(df.dataset.dsDrag)return;
    df.dataset.dsDrag='1';
    df.style.touchAction='none';
    df.addEventListener('pointerdown',onDown);
    df.addEventListener('pointermove',onMove);
    df.addEventListener('pointerup',onUp);
    df.addEventListener('pointercancel',onUp);
    df.addEventListener('pointerenter',wake);
    restore();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
