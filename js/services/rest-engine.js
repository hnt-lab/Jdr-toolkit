(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.RestEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function applyClassRestResets(next,type){
    const charges=next.combatCharges;
    const classes=Array.isArray(next.classes)?next.classes:[];
    const levelOf=name=>Number((classes.find(entry=>entry.name===name)||{}).level)||0;
    const abilities=Array.isArray(next.abilities)?next.abilities:[10,10,10,10,10,10];
    const abilityMod=index=>Math.floor(((Number(abilities[index])||10)-10)/2);
    const totalLevel=classes.reduce((sum,entry)=>sum+(Number(entry.level)||0),0);
    const proficiency=2+Math.floor(Math.max(0,totalLevel-1)/4);
    const intelligence=abilityMod(3);
    const wisdom=abilityMod(4);
    const charisma=abilityMod(5);
    const fighter=levelOf('Guerrier');
    if(fighter>0){
      charges.SursautAction=fighter>=17?2:1;
      if(fighter>=3)charges['DésSupériorité']=fighter>=15?6:fighter>=7?5:4;
    }
    const cleric=levelOf('Clerc');
    if(cleric>=2)charges.ConduitDivin=cleric>=18?3:cleric>=6?2:1;
    if(cleric>=17)delete charges.VisionsPasse;
    if(levelOf('Paladin')>=3)charges['Conduit divin']=1;
    if(levelOf('Occultiste')>0){
      ['PresenceFeeUsed','EchappatBrumeUsed','SombreDelireUsed',
        'ChanceTenebreuxUsed','ProtecEntropiqueUsed'].forEach(key=>delete charges[key]);
      next.spellSlotsUsed=[];
    }
    if(levelOf('Ensorceleur')>=20)delete charges.RestaurationEnsorceleurUsed;
    if(levelOf('Roublard')>=20)delete charges.CoupDeChanceUsed;
    if(levelOf('Roublard')>0)delete charges.AssassinatReady;
    const bard=levelOf('Barde');
    if(bard>0&&(type==='long'||bard>=5)){
      charges.InspBardique=Math.max(1,charisma);
    }
    if(levelOf('Barbare')>=11)charges.RageImplacableUses=0;
    const druid=levelOf('Druide');
    if(druid>0)charges['Forme sauvage']=druid>=20?99:2;
    const monk=levelOf('Moine');
    if(monk>0)charges.Ki=monk;
    delete charges.ChantReposantResult;
    if(type!=='long')return;
    const barbarian=levelOf('Barbare');
    if(barbarian>0){
      charges.RageCharges=barbarian>=20?99
        :barbarian>=17?6:barbarian>=12?5:barbarian>=6?4:barbarian>=3?3:2;
      charges.SensMagie=proficiency;
      charges.ReserveMagie=proficiency;
    }
    if(fighter>=9)charges.Indomptable=fighter>=17?3:fighter>=13?2:1;
    const paladin=levelOf('Paladin');
    if(paladin>0){
      charges.SensDivin=Math.max(1,1+charisma);
      charges.ImpositionMains=paladin*5;
      if(paladin>=14)charges.ContactPurifiant=Math.max(1,charisma);
      if(paladin>=20)charges.FormeSacree=1;
      delete charges.SentinelleImmortelleUsed;
    }
    if(cleric>0){
      charges.IlluminationProtectrice=Math.max(1,wisdom);
      charges.FureurOuragan=Math.max(1,wisdom);
      charges.PretreGuerre=Math.max(1,wisdom);
    }
    if(levelOf('Occultiste')>0){
      delete charges.TraverseeEnfersUsed;
      delete charges.MaitreOcculteUsed;
      ['ArcanumNiv6Used','ArcanumNiv7Used','ArcanumNiv8Used','ArcanumNiv9Used']
        .forEach(key=>delete charges[key]);
    }
    if(druid>=2)delete charges.RecupNaturelle;
    if(levelOf('Rôdeur')>=11)delete charges.SouffleDrake;
    const artificer=levelOf('Artificier');
    if(artificer>0){
      charges.EclairGenie=Math.max(1,intelligence);
      charges.DechargeArcanique=Math.max(1,intelligence);
      charges.DefenseurReparation=3;
      charges.ChampDefensif=proficiency;
      charges.ObjetStockeSort=Math.max(2,2*intelligence);
      charges.ElixirExp=artificer>=15?3:artificer>=6?2:1;
      charges.IngredientsRevigo=Math.max(1,intelligence);
      delete charges.MaitriseChim1;
      delete charges.MaitriseChim2;
    }
  }

  function applyRestToSheet(sheet,type,options){
    if(!['short','long'].includes(type))throw new TypeError('type de repos invalide');
    const next={...(sheet||{})};
    const resources={};
    next.combatCharges={...(next.combatCharges||{})};
    for(const [key,resource] of Object.entries(next.resources||{})){
      const copy={...(resource||{})};
      if(copy.recovery==='short'||(type==='long'&&copy.recovery==='long')){
        copy.current=Math.max(0,Number(copy.max)||0);
        if(copy.stateKey)next.combatCharges[copy.stateKey]=copy.current;
      }
      resources[key]=copy;
    }
    next.resources=resources;
    if(type==='short'){
      const healing=Math.max(0,Math.trunc(Number(options&&options.healing)||0));
      next.hp=Math.min(
        Math.max(0,Number(next.hpMax)||0),
        Math.max(0,Number(next.hp)||0)+healing
      );
      const used={...(next.hitDiceUsed||{})};
      for(const [className,amount] of Object.entries(
        options&&options.hitDiceSpent||{}
      )){
        const classLevel=Number(
          ((next.classes||[]).find(entry=>entry.name===className)||{}).level
        )||0;
        used[className]=Math.min(
          classLevel,
          Math.max(0,Number(used[className])||0)
            +Math.max(0,Math.trunc(Number(amount)||0))
        );
      }
      next.hitDiceUsed=used;
    }
    if(type==='long'){
      next.hp=Math.max(0,Number(next.hpMax)||0);
      next.spellSlotsUsed=[];
      next.deathSaves={success:0,fail:0};
      next.conditions=[];
      const used={...(next.hitDiceUsed||{})};
      const totalLevel=(next.classes||[]).reduce(
        (sum,entry)=>sum+(Number(entry.level)||0),0
      );
      let recovered=Math.max(1,Math.floor(totalLevel/2));
      Object.keys(used).forEach(className=>{
        if(recovered<=0)return;
        const amount=Math.max(0,Number(used[className])||0);
        const restored=Math.min(amount,recovered);
        used[className]=amount-restored;
        recovered-=restored;
      });
      next.hitDiceUsed=used;
    }
    applyClassRestResets(next,type);
    return next;
  }

  return{applyRestToSheet};
});
