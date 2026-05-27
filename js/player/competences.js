// TAB: COMPÉTENCES
// ═══════════════════════════════════════
function tabCompetences(p){
  const mc=mainClass(p);const cd=mc?SRD.classes.find(c=>c.name===mc.name):null;const rd=SRD.races.find(r=>r.name===p.race);
  const lvl=totalLevel(p);
  const bardeLvlC=((p.classes||[]).find(c=>c.name==='Barde')||{}).level||0;
  const hasToucheATout=bardeLvlC>=2;
  const halfPb=Math.floor(pb(lvl)/2);
  const percProf=(p.skillProf||{})['Perception']||0;
  const passive=10+mod(p.abilities[4])+(percProf===2?pb(lvl)*2:percProf===1?pb(lvl):hasToucheATout?halfPb:0);
  // Nombre max de compétences autorisées
  const maxSkills=(()=>{let tot=0;(p.classes||[]).forEach(c=>{const d=SRD.classes.find(cl=>cl.name===c.name);if(d)tot+=d.skillCount;});const bg=BACKGROUNDS.find(b=>b.name===p.background);if(bg)tot+=bg.skills.length;return tot;})();
  const currentCount=Object.values(p.skillProf||{}).filter(v=>v>0).length;
  return`<div class="g2" style="gap:10px">
  <div><div class="panel mb10">
    <div class="pt" style="display:flex;align-items:center;justify-content:space-between"><span>Compétences</span><span style="font-size:11px;color:var(--text3)">${currentCount}/${maxSkills} maîtrisées</span></div>
    ${SKILLS.map(sk=>{
      const prof=(p.skillProf||{})[sk.name]||0;
      const isLocked=(p.skillsLocked||{})[sk.name];
      const classSkill=cd&&(cd.skills||[]).includes(sk.name);
      const bonus=mod(p.abilities[sk.ab])+(prof===2?pb(lvl)*2:prof===1?pb(lvl):hasToucheATout?halfPb:0);
      const dotClass=prof===2?' e':prof===1?' p':hasToucheATout?' h':'';
      // Couleur classe
      return`<div class="sk" style="${classSkill?`color:var(--cp)`:''};${isLocked?'cursor:default':'cursor:pointer'}" onclick="${isLocked?'':'cycleSkillIfAllowed(\''+sk.name+'\','+prof+','+maxSkills+')'}">
        <span class="sk-dot${dotClass}" title="${prof===2?'Expertise (×2)':prof===1?'Maîtrise':hasToucheATout?'Touche-à-tout (½ maîtrise)':'Aucune maîtrise'}"></span>
        <span class="sk-n${classSkill?' cs':''}">${sk.name}</span>
        <span class="sk-ab">${ABILITIES_SH[sk.ab]}</span>
        <span class="sk-v">${fmt(bonus)}</span>
      </div>`;
    }).join('')}
    <div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--border);font-size:12px;color:var(--text2)">Perception passive : <strong style="color:var(--cp)">${passive}</strong></div>
  </div></div>
  <div>
    <div class="panel mb10"><div class="pt" style="display:flex;align-items:center;justify-content:space-between"><span>Capacités & traits</span>${isMJ()?`<button class="btn bsm" onclick="openFeatSearch()">+ Ajouter</button>`:''}</div>
      ${(()=>{
        // Noms de capacités purement de combat (ont un tracker ou charges dans combatFeatures)
        const combatFeatNames=new Set();
        (p.classes||[]).forEach(cls=>{const d=SRD.classes.find(c=>c.name===cls.name);if(d&&d.combatFeatures)d.combatFeatures.forEach(f=>combatFeatNames.add(f.name));});
        // Filtrer : afficher seulement les features non-combat, avec description
        const combatFeatPrefixes=[...combatFeatNames];
        const chosenArchByClass={};
        (p.classes||[]).forEach(c=>{if((p.archetype||{})[c.name])chosenArchByClass[c.name]=(p.archetype||{})[c.name];});
        const druLvl=((p.classes||[]).find(c=>c.name==='Druide')||{}).level||0;
        const displayFeats=(p.features||[]).filter(f=>{
          if(combatFeatPrefixes.some(cn=>f.name===cn||f.name.startsWith(cn+' (')||f.name.startsWith(cn+' :')))return false;
          if(f.name.startsWith('Sorts du cercle')||f.name.startsWith('Capacité du cercle'))return false;
          if(isFeatExcluded(f.name))return false;
          if(f.name.includes('(choix)')&&f.classe&&chosenArchByClass[f.classe])return false;
          if((f.name.startsWith('Forme sauvage')||f.name.startsWith('Forme sauvage améliorée'))&&druLvl<2)return false;
          return true;
        });
        if(!displayFeats.length)return`<div style="font-size:12px;color:var(--text3);font-style:italic">Aucune capacité passive.</div>`;

        // Calcul du contexte Forme sauvage pour les Druides
        const fsCrMax=druLvl>=6?String(Math.floor(druLvl/3)):druLvl>=4?'1/2':'1/4';
        const fsVolNage=druLvl>=8?'Vol ✓ / Nage ✓':druLvl>=4?'Nage ✓ / Vol ✗':'Nage ✗ / Vol ✗';
        const fsUsed=(p.combatCharges||{})['Forme sauvage']!==undefined?p.combatCharges['Forme sauvage']:2;

        return displayFeats.map((f,idx)=>{
          const realIdx=(p.features||[]).indexOf(f);
          const fid='feat_'+f.name.replace(/[^a-zA-Z0-9]/g,'_')+'_'+realIdx;
          const classLvl=f.classe?((p.classes||[]).find(c=>c.name===f.classe)||{}).level||0:totalLevel(p);
          const desc=filterDescByLevel(f.desc||getFeatDesc(f.name),classLvl);
          const isFormeSauvage=f.name.startsWith('Forme sauvage')||f.name.startsWith('Archidruide');
          return`<div class="sort-row">
            <div class="sort-head" onclick="document.getElementById('${fid}').classList.toggle('open')">
              <div style="flex:1">
                <div style="font-size:13px;font-weight:600;color:var(--cp)">${f.icon?f.icon+' ':''}${esc(f.name)}</div>
                ${f.classe?`<div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-top:1px">${esc(f.classe)}</div>`:''}
              </div>
              ${isFormeSauvage&&druLvl>=2?druLvl>=20?`<span style="font-size:11px;color:var(--cp);margin-right:8px">∞</span>`:`<div style="display:flex;gap:3px;align-items:center;margin-right:8px">
                ${Array.from({length:2},(_,fs)=>`<span class="slot-bubble${fs<fsUsed?'':' used'}" onclick="event.stopPropagation();useCombatCharge('Forme sauvage',2)"></span>`).join('')}
              </div>`:''}
              <span style="color:var(--text3);font-size:11px;margin-right:8px">▾</span>
              ${isMJ()?`<span onclick="event.stopPropagation();removeFeat(${realIdx})" style="cursor:pointer;color:var(--text3);font-size:15px">×</span>`:''}
            </div>
            <div class="sort-body" id="${fid}">
              <p>${esc(desc||'Consulter aidedd.org/regles/classes/ pour les détails.')}</p>
              ${isFormeSauvage&&druLvl>=2?`<div style="margin-top:8px;padding:6px 8px;background:var(--surface3);border-radius:6px;font-size:12px">
                <div style="color:#4caf50;margin-bottom:4px">🐺 CR max actuel : <strong>${fsCrMax}</strong> — ${fsVolNage}</div>
                ${druLvl>=20?`<div style="color:var(--cp);font-weight:600">✓ Archidruide — Utilisations illimitées</div>`:
                `<div style="display:flex;align-items:center;gap:8px">
                  <div style="display:flex;gap:4px">${Array.from({length:2},(_,fs)=>`<span class="slot-bubble${fs<fsUsed?'':' used'}" onclick="useCombatCharge('Forme sauvage',2)" style="cursor:pointer"></span>`).join('')}</div>
                  <span style="color:var(--text3)">${fsUsed}/2 • Repos court</span>
                  <button class="btn bsm" onclick="recoverCombatCharge('Forme sauvage',2)">↺</button>
                </div>`}
              </div>`:''}
            </div>
          </div>`;
        }).join('');
      })()}
    </div>
    ${rd?`<div class="panel"><div class="pt">Traits raciaux</div><div style="font-size:13px;color:var(--text2);line-height:1.6">${esc(rd.traits)}</div><div style="font-size:11px;color:var(--text2);margin-top:8px"><span style="color:var(--text3)">Vitesse :</span> ${rd.speed}m • <span style="color:var(--text3)">Langues :</span> ${esc(rd.languages)}</div></div>`:''}
  </div></div>`;
}

function maxExpertise(p){
  let max=0;
  (p.classes||[]).forEach(c=>{
    if(c.name==='Roublard')max+=c.level>=6?4:2;
    if(c.name==='Barde')max+=c.level>=10?4:c.level>=3?2:0;
  });
  return max;
}
function cycleSkillIfAllowed(name,current,maxSkills){
  const p=P();if(!p.skillProf)p.skillProf={};
  const total=Object.values(p.skillProf).filter(v=>v>0).length;
  if(!isMJ()&&current===0&&total>=maxSkills){
    showToast('❌ Maximum de compétences atteint.');return;
  }
  const nextVal=((p.skillProf[name]||0)+1)%3;
  if(!isMJ()&&nextVal===2){
    const maxExp=maxExpertise(p);
    if(maxExp===0){showToast('❌ Ta classe ne permet pas l\'expertise (Roublard ou Barde requis).');return;}
    const curExp=Object.values(p.skillProf).filter(v=>v===2).length;
    if(curExp>=maxExp){showToast(`❌ Limite d'expertise atteinte (${maxExp} max pour ta classe).`);return;}
  }
  p.skillProf[name]=nextVal;
  render();
}
function openFeatSearch(){openModal(`<div class="pt">Ajouter une capacité</div>
<input class="fi" id="featQ" placeholder="🔍 Chercher dans les capacités SRD..." oninput="filterFeats(this.value)" style="margin-bottom:8px">
<div id="featList">${renderFeatList('')}</div>
<div style="margin-top:12px;padding:10px;background:var(--surface2);border-radius:8px;border:1px solid var(--border)">
  <div style="font-size:12px;font-weight:600;color:var(--cp);margin-bottom:8px">✨ Capacité personnalisée (univers alternatif)</div>
  <input class="fi" id="featCustomName" placeholder="Nom de la capacité" style="margin-bottom:6px">
  <textarea class="fi" id="featCustomDesc" rows="2" placeholder="Description de la capacité..." style="resize:vertical;margin-bottom:6px"></textarea>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px">
    <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Charges (0 = passif)</div><input class="fi" id="featCustomCharges" type="number" min="0" value="0" placeholder="0"></div>
    <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Récupération</div><select class="fi" id="featCustomRecovery"><option value="passive">Passif</option><option value="short">Repos court</option><option value="long">Repos long</option></select></div>
    <div><div style="font-size:10px;color:var(--text3);margin-bottom:3px">Dé (ex : 2d6+3)</div><input class="fi" id="featCustomDice" placeholder="2d6+3"></div>
  </div>
  <button class="btn bac bsm" style="width:100%" onclick="addCustomCombatFeat()">+ Ajouter cette capacité</button>
</div>
<button class="btn bsm bdanger" style="margin-top:8px;width:100%" onclick="closeModal()">Fermer</button>`);}
const FEATS_SRD=[
  {name:"Rage",classe:"Barbare",desc:"2/repos long. Bonus dégâts, résistance physique, avantage FOR."},
  {name:"Attaque supplémentaire",classe:"Guerrier/Barbare",desc:"Attaque 2 fois par action Attaquer au niv.5."},
  {name:"Frappe divine",classe:"Paladin",desc:"Dépense un emplacement pour ajouter des dégâts radiants."},
  {name:"Roublardise",classe:"Roublard",desc:"1d6 dégâts supp. si avantage ou allié adjacent."},
  {name:"Terreur sombre",classe:"Occultiste",desc:"Mécène surnaturel. Emplacements récupérés au repos court."},
  {name:"Défense sans armure",classe:"Barbare/Moine",desc:"CA calculée différemment sans armure."},
  {name:"Conduit divin",classe:"Clerc/Paladin",desc:"Effets cumulables, pas les utilisations."},
  {name:"Métamagie",classe:"Ensorceleur",desc:"Dépense des points de sorcellerie pour modifier tes sorts."},
];
function renderFeatList(q){return FEATS_SRD.filter(f=>!q||f.name.toLowerCase().includes(q.toLowerCase())).map(f=>`<div class="aci" onclick="addFeat('${esc(f.name)}','${esc(f.desc)}','${esc(f.classe)}')"><div class="ain">${esc(f.name)}</div><div class="ais">${esc(f.desc.slice(0,80))}…</div></div>`).join('')||'<div style="color:var(--text3);font-size:12px;padding:8px">Aucun résultat.</div>';}
function filterFeats(q){const el=document.getElementById('featList');if(el)el.innerHTML=renderFeatList(q);}
function addFeat(name,desc,classe){P().features.push({name,desc,classe});closeModal();render();}
function addCustomFeat(){const n=document.getElementById('featCustomName')?.value;const d=document.getElementById('featCustomDesc')?.value;if(!n)return;P().features.push({name:n,desc:d||'',classe:''});closeModal();render();}
function addCustomCombatFeat(){
  const n=(document.getElementById('featCustomName')?.value||'').trim();
  if(!n){showToast('❌ Nom requis.');return;}
  const d=(document.getElementById('featCustomDesc')?.value||'').trim();
  const ch=parseInt(document.getElementById('featCustomCharges')?.value)||0;
  const rec=document.getElementById('featCustomRecovery')?.value||'passive';
  const dice=(document.getElementById('featCustomDice')?.value||'').trim();
  const feat={name:n,desc:d,charges:ch,recovery:ch>0?rec:'passive',icon:'⚡'};
  if(dice)feat.dice=dice;
  if(!P().customCombatFeats)P().customCombatFeats=[];
  P().customCombatFeats.push(feat);
  closeModal();render();
}
function removeFeat(i){P().features.splice(i,1);render();}

// ═══════════════════════════════════════
