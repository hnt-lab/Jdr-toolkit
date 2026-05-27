
// ═══════════════════════════════════════
// SRD DATA
// ═══════════════════════════════════════
const POINT_BUY_COST={8:0,9:1,10:2,11:3,12:4,13:5,14:7,15:9};
const SRD={
classes:[
  {name:"Barbare",hd:"d12",hdVal:12,saves:["FOR","CON"],armor:"Légères, intermédiaires, boucliers",weapons:"Simples, de guerre",weaponTypes:["simple","guerre"],armorTypes:["légère","intermédiaire","bouclier"],skills:["Athlétisme","Intimidation","Nature","Perception","Survie","Dressage"],skillCount:2,spellcaster:false,spellWeight:0,mcProf:"Boucliers, armes courantes, armes de guerre",primaryStats:["FOR","CON"],startSpells:0,
   combatFeatures:[{name:"Rage",charges:2,recovery:"long",desc:"Bonus de dégâts, résistance aux dégâts physiques (contondant/perforant/tranchant), avantage sur jets de FOR et JS FOR. Dure 1 min. Prend fin si tu n'attaques pas ou reçois des dégâts au tour précédent.",icon:"🔥"},{name:"Défense sans armure",charges:0,recovery:"passive",desc:"Sans armure, CA = 10 + mod DEX + mod CON. Bouclier autorisé.",icon:"🛡"}],
   equipment:[[{name:"Grande hache",qty:1,desc:"1d12 tranchant, lourde"},{name:"Hachette",qty:2,desc:"1d6 tranchant, légère"},{name:"Pack d'explorateur",qty:1,desc:"Sac à dos, couchage, rations"},{name:"4 javelines",qty:1,desc:"1d6 perforant, lancer"}]]},
  {name:"Barde",hd:"d8",hdVal:8,saves:["DEX","CHA"],armor:"Légères",weapons:"Armes courantes, arbalète de poing, épée longue, épée courte, rapière",weaponTypes:["simple","rapière","épée longue","épée courte","arbalète main"],armorTypes:["légère"],skills:["Acrobaties","Arcanes","Athlétisme","Dressage","Tromperie","Histoire","Intuition","Intimidation","Investigation","Médecine","Nature","Perception","Représentation","Persuasion","Religion","Escamotage","Discrétion","Survie"],skillCount:3,mcSkillCount:1,spellcaster:true,spellWeight:1,mcProf:"Armure légère, une compétence, un instrument",primaryStats:["CHA","DEX"],startSpells:4,
   combatFeatures:[{name:"Inspiration bardique",charges:null,recovery:"short",desc:"Accorde 1d6 d'inspiration à un allié (portée 18m). Dé : d6→d8 (niv5)→d10 (niv10)→d12 (niv15). Niv5 : récupération au repos court.",icon:"🎵",chargesFormula:"CHA"},{name:"Contre-charme",charges:0,recovery:"passive",desc:"Action pour entonner une mélodie — jusqu'à la fin de ton prochain tour, toi et tes alliés proches êtes avantagés aux JS contre charme et peur.",icon:"🎶",minLevel:6},{name:"Inspiration supérieure",charges:0,recovery:"passive",desc:"Si tu lances l'initiative sans aucune inspiration bardique disponible, tu en récupères automatiquement une.",icon:"⭐",minLevel:20}],
   equipment:[[{name:"Rapière",qty:1,desc:"1d8 perforant, finesse"},{name:"Armure de cuir",qty:1,desc:"CA 11+DEX"},{name:"Pack du diplomate",qty:1,desc:"Coffret, parchemins"},{name:"Luth",qty:1,desc:"Focaliseur bardique"},{name:"Dague",qty:1,desc:"1d4 perforant, finesse"}]]},
  {name:"Clerc",hd:"d8",hdVal:8,saves:["SAG","CHA"],armor:"Légères, intermédiaires, boucliers",weapons:"Simples",weaponTypes:["simple"],armorTypes:["légère","intermédiaire","bouclier"],skills:["Histoire","Intuition","Médecine","Persuasion","Religion"],skillCount:2,spellcaster:true,spellWeight:1,mcProf:"Armure légère, armure intermédiaire, boucliers",primaryStats:["SAG","CON"],startSpells:4,
   combatFeatures:[{name:"Conduit divin",charges:null,recovery:"short",desc:"Canalise l'énergie divine. Effet selon domaine divin. (Renvoi des morts-vivants disponible à tous les clercs). 2 utilisations au niveau 6, 3 au niveau 18.",icon:"✝",chargesFormula:"clericCD"},{name:"Intervention divine",charges:1,recovery:"long",desc:"Implore l'aide de ta divinité (d100 ≤ niveau = succès). Niv20 : succès garanti. Utilisation par semaine si succès.",icon:"🙏",minLevel:10}],
   equipment:[[{name:"Masse d'armes",qty:1,desc:"1d6 contondant"},{name:"Cotte de mailles (inter.)",qty:1,desc:"CA 14+DEX(max2)"},{name:"Bouclier",qty:1,desc:"+2 CA"},{name:"Symbole sacré",qty:1,desc:"Focaliseur divin"},{name:"Pack du prêtre",qty:1,desc:"Bougies, couverture, rations"}]]},
  {name:"Druide",hd:"d8",hdVal:8,saves:["INT","SAG"],armor:"Légères, intermédiaires, boucliers (non métal)",weapons:"Gourdins, dagues, fléchettes, javelines, masses d'armes, bâtons, cimeterre, frondes, serpes, lances",weaponTypes:["simple","cimeterre"],armorTypes:["légère","intermédiaire","bouclier"],skills:["Arcanes","Dressage","Intuition","Médecine","Nature","Perception","Religion","Survie"],skillCount:2,spellcaster:true,spellWeight:1,mcProf:"Armure légère, intermédiaire, boucliers (non métal) — Outil : kit d'herboriste",primaryStats:["SAG","CON"],startSpells:4,
   combatFeatures:[{name:"Forme sauvage",charges:2,recovery:"short",desc:"Transformation en bête (niv.2). CR 1/4 (niv.2), CR 1/2 + nage (niv.4), CR = niv/3 + vol (niv.6+). Dure niv/2 heures. Niv.18 : sorts possibles en forme. Niv.20 (Archidruide) : illimité.",icon:"🐺",minLevel:2}],
   equipment:[[{name:"Bâton",qty:1,desc:"1d6 contondant, polyvalente"},{name:"Armure de cuir",qty:1,desc:"CA 11+DEX"},{name:"Focaliseur druidique",qty:1,desc:"Bois sacré"},{name:"Pack de l'explorateur",qty:1,desc:"Sac à dos, couchage, rations"}]]},
  {name:"Guerrier",hd:"d10",hdVal:10,saves:["FOR","CON"],armor:"Toutes, boucliers",weapons:"Simples, de guerre",weaponTypes:["simple","guerre"],armorTypes:["légère","intermédiaire","lourde","bouclier"],mcArmorTypes:["légère","intermédiaire","bouclier"],skills:["Acrobaties","Athlétisme","Dressage","Histoire","Intuition","Intimidation","Perception","Survie"],skillCount:2,spellcaster:false,spellWeight:0,mcProf:"Armure légère, intermédiaire, boucliers, armes courantes et de guerre",primaryStats:["FOR","CON"],startSpells:0,
   combatFeatures:[{name:"Second souffle",charges:1,recovery:"short",desc:"Action bonus : regagne 1d10+niveau PV.",icon:"💨"},{name:"Fougue",charges:null,recovery:"short",desc:"Une action supplémentaire en plus de ton action normale. 2 utilisations au niveau 17.",icon:"⚡",chargesFormula:"actionSurge"},{name:"Inflexible",charges:null,recovery:"long",desc:"Relancer un jet de sauvegarde raté. Doit utiliser le nouveau résultat. 1 utilisation (niv9-12), 2 (niv13-16), 3 (niv17+).",icon:"🔄",chargesFormula:"indomptable",minLevel:9},{name:"Attaque supplémentaire",charges:0,recovery:"passive",desc:"Attaque 2 fois par action Attaquer (niv5). 3× au niv11, 4× au niv20.",icon:"⚔",minLevel:5}],
   equipment:[
     [{name:"Cotte de mailles",qty:1,desc:"CA 16"},{name:"Épée longue",qty:1,desc:"1d8 tranchant"},{name:"Bouclier",qty:1,desc:"+2 CA"},{name:"2 Hachettes",qty:1,desc:"1d6 tranchant"},{name:"Pack du donjon",qty:1,desc:"Pied de biche, torches"}],
     [{name:"Armure de cuir",qty:1,desc:"CA 11+DEX"},{name:"Arc long",qty:1,desc:"1d8 perforant, distance"},{name:"20 flèches",qty:1,desc:"Munitions"},{name:"Épée à deux mains",qty:1,desc:"2d6 tranchant, lourde"},{name:"Pack du donjon",qty:1,desc:"Pied de biche, torches"}]]},
  {name:"Moine",hd:"d8",hdVal:8,saves:["FOR","DEX"],armor:"Aucune",weapons:"Simples, épées courtes",weaponTypes:["simple","épée courte"],armorTypes:[],skills:["Acrobaties","Athlétisme","Histoire","Intuition","Religion","Discrétion"],skillCount:2,spellcaster:false,spellWeight:0,mcProf:"Armes courantes, épée courte",primaryStats:["DEX","SAG"],startSpells:0,
   combatFeatures:[{name:"Arts martiaux",charges:0,recovery:"passive",desc:"Dé à mains nues : 1d4 (niv1-4) → 1d6 (niv5-10) → 1d8 (niv11-16) → 1d10 (niv17+). Attaque à mains nues bonus après attaque simple ou épée courte. Peut utiliser DEX à la place de FOR.",icon:"🥋"},{name:"Défense sans armure",charges:0,recovery:"passive",desc:"Sans armure ni bouclier, CA = 10 + mod DEX + mod SAG.",icon:"🛡"},{name:"Ki",charges:null,recovery:"short",desc:"Points = niveau. Défense patiente (1 ki : Esquiver en action bonus), Déluge de coups (1 ki : 2 frappes à mains nues en action bonus), Déplacement aérien (1 ki : Se désengager ou Foncer en action bonus, saut ×2).",icon:"☯",chargesFormula:"level",minLevel:2},{name:"Attaque supplémentaire",charges:0,recovery:"passive",desc:"Attaque 2 fois par action Attaquer.",icon:"⚔",minLevel:5},{name:"Frappes de ki",charges:0,recovery:"passive",desc:"Tes attaques à mains nues sont considérées comme magiques.",icon:"✨",minLevel:6},{name:"Désertion de l'âme",charges:0,recovery:"passive",desc:"Action : dépense 4 ki → invisible 1 min + résistance à tous dégâts (sauf force). Ou 8 ki : lancer projection astral (toi seul).",icon:"🌌",minLevel:18},{name:"Perfection de l'être",charges:0,recovery:"passive",desc:"Si tu lances l'initiative avec 0 pts de ki, tu en regagnes 4.",icon:"🌟",minLevel:20}],
   equipment:[[{name:"Épée courte",qty:1,desc:"1d6 perforant, finesse"},{name:"10 fléchettes",qty:1,desc:"1d4 perforant"},{name:"Pack du donjon",qty:1,desc:"Pied de biche, torches"}]]},
  {name:"Paladin",hd:"d10",hdVal:10,saves:["SAG","CHA"],armor:"Toutes, boucliers",weapons:"Simples, de guerre",weaponTypes:["simple","guerre"],armorTypes:["légère","intermédiaire","lourde","bouclier"],mcArmorTypes:["légère","intermédiaire","bouclier"],skills:["Athlétisme","Intuition","Intimidation","Médecine","Persuasion","Religion"],skillCount:2,spellcaster:true,spellWeight:0.5,mcProf:"Armure légère, intermédiaire, boucliers, armes courantes et de guerre",primaryStats:["FOR","CHA"],startSpells:0,
   combatFeatures:[{name:"Châtiment divin",charges:0,recovery:"passive",desc:"Dépense un emplacement de sort sur une attaque de corps à corps touchée : 2d8 radiants (slot niv.1) + 1d8/niveau supplémentaire (max 5d8). Mort-vivants/fiélons : +1d8 (max 6d8).",icon:"✨",minLevel:2},{name:"Conduit divin",charges:1,recovery:"short",desc:"Canalise l'énergie divine. Chaque serment propose 2 options (ex: Arme sacrée + Renvoi des impies). 1 utilisation entre deux repos courts ou longs.",icon:"✝",minLevel:3},{name:"Imposition des mains",charges:null,recovery:"long",desc:"Réservoir de PV = niveau×5. Soigne au toucher ou guérit une maladie/poison (5 PV).",icon:"🙏",chargesFormula:"level5"},{name:"Aura de protection",charges:0,recovery:"passive",desc:"Toi et alliés dans un rayon de 3m (9m au niv.18) ajoutent ton mod CHA (min +1) à tous leurs jets de sauvegarde.",icon:"🛡",minLevel:6},{name:"Aura de courage",charges:0,recovery:"passive",desc:"Toi et alliés dans un rayon de 3m (9m au niv.18) ne peuvent pas être effrayés tant que tu es conscient.",icon:"💛",minLevel:10},{name:"Châtiment divin amélioré",charges:0,recovery:"passive",desc:"+1d8 dégâts radiants automatiques sur toutes tes attaques de corps à corps (en plus du Châtiment divin normal).",icon:"⭐",minLevel:11},{name:"Contact purifiant",charges:null,recovery:"long",desc:"CHA fois/repos long : action pour mettre fin à un sort affectant toi ou une créature consentante que tu touches.",icon:"🌿",chargesFormula:"CHA",minLevel:14}],
   equipment:[[{name:"Épée longue",qty:1,desc:"1d8 tranchant"},{name:"Cotte de mailles",qty:1,desc:"CA 16"},{name:"Bouclier",qty:1,desc:"+2 CA"},{name:"5 javelines",qty:1,desc:"1d6 perforant"},{name:"Sac d'ecclésiastique",qty:1,desc:"Bougies, rations, encens"},{name:"Symbole sacré",qty:1,desc:"Focaliseur divin"}]]},
  {name:"Rôdeur",hd:"d10",hdVal:10,saves:["FOR","DEX"],armor:"Légères, intermédiaires, boucliers",weapons:"Simples, de guerre",weaponTypes:["simple","guerre"],armorTypes:["légère","intermédiaire","bouclier"],skills:["Athlétisme","Dressage","Intuition","Investigation","Nature","Perception","Discrétion","Survie"],skillCount:3,mcSkillCount:1,spellcaster:true,spellWeight:0.5,mcProf:"Armure légère, intermédiaire, boucliers, armes courantes et de guerre, une compétence",primaryStats:["DEX","SAG"],startSpells:0,
   combatFeatures:[{name:"Ennemi juré",charges:0,recovery:"passive",desc:"Avantage aux jets de Survie pour pister et aux jets d'INT pour se rappeler d'informations sur tes ennemis jurés. +1 type aux niv.6 et 14.",icon:"🎯"},{name:"Explorateur-né",charges:0,recovery:"passive",desc:"Double maîtrise en terrain favori. Groupe : pas de terrain difficile ni de risque de se perdre. +1 terrain aux niv.6 et 10.",icon:"🌿"},{name:"Attaque supplémentaire",charges:0,recovery:"passive",desc:"Attaque 2 fois par action Attaquer.",icon:"⚔",minLevel:5},{name:"Disparition",charges:0,recovery:"passive",desc:"Se cacher comme action bonus. Ne peut pas être suivi par des moyens non magiques.",icon:"👁",minLevel:14},{name:"Sens sauvages",charges:0,recovery:"passive",desc:"Attaquer des créatures que tu ne vois pas sans désavantage. Connaître la position des créatures invisibles à 9m (si non cachées).",icon:"🌙",minLevel:18},{name:"Tueur implacable",charges:0,recovery:"passive",desc:"1 fois/tour : ajouter ton mod SAG au jet d'attaque ou de dégâts contre un ennemi juré.",icon:"🎯",minLevel:20}],
   equipment:[
     [{name:"Armure d'écailles",qty:1,desc:"CA 14+DEX(max2)"},{name:"2 Épées courtes",qty:1,desc:"1d6 perforant, finesse"},{name:"Arc long",qty:1,desc:"1d8 perforant, distance"},{name:"20 flèches",qty:1,desc:"Munitions"},{name:"Pack du donjon",qty:1,desc:"Pied de biche, torches"}],
     [{name:"Armure de cuir",qty:1,desc:"CA 11+DEX"},{name:"2 Épées courtes",qty:1,desc:"1d6 perforant, finesse"},{name:"Arc long",qty:1,desc:"1d8 perforant, distance"},{name:"20 flèches",qty:1,desc:"Munitions"},{name:"Pack du donjon",qty:1,desc:"Pied de biche, torches"}]]},
  {name:"Roublard",hd:"d8",hdVal:8,saves:["DEX","INT"],armor:"Légères",weapons:"Simples, arbalètes main, épées longues, rapières, épées courtes",weaponTypes:["simple","rapière","épée longue","épée courte","arbalète main"],armorTypes:["légère"],skills:["Acrobaties","Athlétisme","Tromperie","Discrétion","Intuition","Intimidation","Investigation","Perception","Représentation","Persuasion","Escamotage"],skillCount:4,mcSkillCount:1,spellcaster:false,spellWeight:0,mcProf:"Armure légère, une compétence de la liste, outils de voleur",primaryStats:["DEX","INT"],startSpells:0,
   combatFeatures:[{name:"Attaque sournoise",charges:0,recovery:"passive",desc:"1/tour : +1d6 dégâts si avantage OU allié adjacent à la cible (sans désavantage). Arme de finesse ou arme à distance. Progression : 1d6→2d6→…→10d6 au niv.19.",icon:"🗡"},{name:"Ruse",charges:0,recovery:"passive",desc:"Action bonus chaque tour pour : Foncer, Se désengager ou Se cacher.",icon:"🃏"},{name:"Esquive instinctive",charges:0,recovery:"passive",desc:"Réaction : réduire de moitié les dégâts d'une attaque d'un attaquant visible.",icon:"💨",minLevel:5},{name:"Esquive totale",charges:0,recovery:"passive",desc:"Sur un JS DEX réussi contre un effet de zone, tu ne subis aucun dégât. Raté = demi-dégâts.",icon:"🌀",minLevel:7},{name:"Savoir-faire",charges:0,recovery:"passive",desc:"Tout jet de compétence avec maîtrise donne au minimum 10 (si le dé affiche 9 ou moins).",icon:"🎯",minLevel:11},{name:"Perception aveugle",charges:0,recovery:"passive",desc:"Si tu peux entendre, tu connais la position de toute créature cachée ou invisible à 3m ou moins.",icon:"👁",minLevel:14},{name:"Esprit fuyant",charges:0,recovery:"passive",desc:"Maîtrise des jets de sauvegarde de Sagesse.",icon:"🧠",minLevel:15},{name:"Insaisissable",charges:0,recovery:"passive",desc:"Aucun jet d'attaque n'a l'avantage contre toi tant que tu n'es pas incapable d'agir.",icon:"🌫",minLevel:18},{name:"Coup de chance",charges:1,recovery:"short",desc:"Transformer un jet d'attaque raté en succès, OU traiter un jet de caractéristique raté comme un 20.",icon:"🍀",minLevel:20}],
   equipment:[[{name:"Rapière",qty:1,desc:"1d8 perforant, finesse"},{name:"Arc court",qty:1,desc:"1d6 perforant, distance"},{name:"20 flèches",qty:1,desc:"Munitions"},{name:"Armure de cuir",qty:1,desc:"CA 11+DEX"},{name:"2 Dagues",qty:1,desc:"1d4 perforant, finesse"},{name:"Outils de voleur",qty:1,desc:"Maîtrise requise"},{name:"Sac de cambrioleur",qty:1,desc:"Pied de biche, outils de roublard, cordes"}]]},
  {name:"Ensorceleur",hd:"d6",hdVal:6,saves:["CON","CHA"],armor:"Aucune",weapons:"Dagues, fléchettes, frondes, bâtons, arbalètes légères",weaponTypes:["dague","fléchette","fronde","bâton","arbalète légère"],armorTypes:[],skills:["Arcanes","Tromperie","Intuition","Intimidation","Persuasion","Religion"],skillCount:2,spellcaster:true,spellWeight:1,mcProf:"—",primaryStats:["CHA","CON"],startSpells:6,
   combatFeatures:[{name:"Points de sorcellerie",charges:null,recovery:"long",desc:"Points = niveau. Permet la Magie flexible (convertir emplacements ↔ points) et la Métamagie.",icon:"✨",chargesFormula:"level"},{name:"Métamagie",charges:0,recovery:"passive",desc:"Modifier tes sorts : Étendue, Subtile, Jumelle, Renforcée, Intensifiée, Distante, Prudente, Promptive.",icon:"🔮",minLevel:3}],
   equipment:[[{name:"Arbalète légère",qty:1,desc:"1d8 perforant"},{name:"20 carreaux",qty:1,desc:"Munitions"},{name:"Focaliseur arcanique",qty:1,desc:"Cristal ou baguette"},{name:"Pack du donjon",qty:1,desc:"Pied de biche, torches"},{name:"2 Dagues",qty:1,desc:"1d4 perforant, finesse"}]]},
  {name:"Occultiste",hd:"d8",hdVal:8,saves:["SAG","CHA"],armor:"Légères",weapons:"Simples",weaponTypes:["simple"],armorTypes:["légère"],skills:["Arcanes","Tromperie","Histoire","Intimidation","Investigation","Nature","Religion"],skillCount:2,spellcaster:true,spellWeight:1,mcProf:"Armure légère, armes courantes",primaryStats:["CHA","CON"],startSpells:2,
   combatFeatures:[{name:"Magie de pacte",charges:null,recovery:"short",desc:"1 emplacement niv.1 (niv.1), 2 emplacements niv.1 (niv.2), puis niveau = niv.occultiste/2 arrondi sup. Tous récupérés au repos court ou long. 3 emplacements au niv.11, 4 au niv.17.",icon:"🌑",chargesFormula:"warlockSlots"},{name:"Manifestations occultes",charges:0,recovery:"passive",desc:"Fragments de savoir interdit conférant des capacités permanentes. 2 au niv.2, +1 aux niv.5/7/9/12/15/18 (8 total).",icon:"📖",minLevel:2},{name:"Arcanum mystique",charges:0,recovery:"passive",desc:"Sort de haut niveau lancé 1/repos long sans emplacement : niv.6 (niv.11), niv.7 (niv.13), niv.8 (niv.15), niv.9 (niv.17).",icon:"⭐",minLevel:11},{name:"Maître de l'occulte",charges:0,recovery:"passive",desc:"1 fois/repos long : passer 1 min à supplier ton patron pour regagner tous tes emplacements de Magie de pacte.",icon:"👁",minLevel:20}],
   equipment:[[{name:"Arbalète légère",qty:1,desc:"1d8 perforant"},{name:"20 carreaux",qty:1,desc:"Munitions"},{name:"Armure de cuir",qty:1,desc:"CA 11+DEX"},{name:"Focaliseur arcanique",qty:1,desc:"Cristal"},{name:"Sac d'érudit",qty:1,desc:"Livre, plume, encre, parchemins"},{name:"2 Dagues",qty:1,desc:"1d4 perforant, finesse"}]]},
  {name:"Magicien",hd:"d6",hdVal:6,saves:["INT","SAG"],armor:"Aucune",weapons:"Dagues, fléchettes, frondes, bâtons, arbalètes légères",weaponTypes:["dague","fléchette","fronde","bâton","arbalète légère"],armorTypes:[],skills:["Arcanes","Histoire","Intuition","Investigation","Médecine","Religion"],skillCount:2,spellcaster:true,spellWeight:1,mcProf:"—",primaryStats:["INT","CON"],startSpells:6,
   combatFeatures:[{name:"Restauration arcanique",charges:1,recovery:"short",desc:"1/jour lors d'un repos court : récupère des emplacements de sorts dont le niveau total ≤ niv/2 (arrondi sup, max niv.5).",icon:"📚"},{name:"Maîtrise des sorts",charges:0,recovery:"passive",desc:"Choisis 1 sort niv.1 et 1 sort niv.2 de ton grimoire — tu peux les lancer à leur niveau minimal sans dépenser d'emplacement.",icon:"✍",minLevel:18},{name:"Sorts de prédilection",charges:0,recovery:"passive",desc:"2 sorts de niveau 3 toujours préparés (ne comptent pas dans le quota). Chacun peut être lancé 1 fois gratuitement entre deux repos courts ou longs.",icon:"⭐",minLevel:20}],
   equipment:[[{name:"Bâton",qty:1,desc:"1d6 contondant, polyvalente"},{name:"Grimoire",qty:1,desc:"6 sorts niv.1 au départ"},{name:"Focaliseur arcanique",qty:1,desc:"Cristal ou baguette"},{name:"Sac d'érudit",qty:1,desc:"Livre, plume, encre, parchemins"}]]},
  {name:"Artificier",hd:"d8",hdVal:8,saves:["CON","INT"],armor:"Légères, intermédiaires, boucliers",weapons:"Simples, arbalètes",weaponTypes:["simple","arbalète légère","arbalète lourde"],armorTypes:["légère","intermédiaire","bouclier"],skills:["Arcanes","Histoire","Investigation","Médecine","Nature","Perception","Escamotage"],skillCount:2,spellcaster:true,spellWeight:0.5,mcProf:"Armure légère, intermédiaire, boucliers",primaryStats:["INT","CON"],startSpells:2,
   combatFeatures:[{name:"Infuser un objet",charges:2,recovery:"long",desc:"Infuse des objets non-magiques avec des propriétés magiques. Infusions actives = niv/2 (arrondi inf).",icon:"⚙"},{name:"Bricolage magique",charges:0,recovery:"passive",desc:"Touche un objet inanimé : lumière, message enregistré, odeur, image ou son.",icon:"🔧"},{name:"Attaque supplémentaire",charges:0,recovery:"passive",desc:"Attaque 2 fois par action Attaquer.",icon:"⚔",minLevel:5},{name:"Flash de génie",charges:null,recovery:"long",desc:"Réaction pour ajouter ton mod INT à un jet de caractéristique ou de sauvegarde d'un allié visible dans 9m. Utilisations = mod INT (min 1).",icon:"💡",chargesFormula:"INT",minLevel:7},{name:"Stockeur de sorts",charges:2,recovery:"short",desc:"Stocke un sort de niv1 ou 2 dans un objet. Un allié peut l'activer (2 charges, récup. repos court).",icon:"🔋",minLevel:11}],
   equipment:[[{name:"Arbalète légère",qty:1,desc:"1d8 perforant"},{name:"20 carreaux",qty:1,desc:"Munitions"},{name:"Armure d'écailles",qty:1,desc:"CA 14+DEX(max2)"},{name:"Outils de voleur",qty:1,desc:"Maîtrise requise"},{name:"Pack du donjon",qty:1,desc:"Pied de biche, torches"}]]},
],
draconicAncestries:[
  {name:"Noir",damage:"Acide",shape:"Ligne 1,5m × 9m",icon:"🖤"},
  {name:"Bleu",damage:"Foudre",shape:"Ligne 1,5m × 9m",icon:"💙"},
  {name:"Laiton",damage:"Feu",shape:"Ligne 1,5m × 9m",icon:"🟡"},
  {name:"Bronze",damage:"Foudre",shape:"Ligne 1,5m × 9m",icon:"🟤"},
  {name:"Cuivre",damage:"Acide",shape:"Ligne 1,5m × 9m",icon:"🟠"},
  {name:"Or",damage:"Feu",shape:"Cône 4,5m",icon:"⭐"},
  {name:"Vert",damage:"Poison",shape:"Cône 4,5m",icon:"💚"},
  {name:"Rouge",damage:"Feu",shape:"Cône 4,5m",icon:"❤️"},
  {name:"Argent",damage:"Froid",shape:"Cône 4,5m",icon:"🩶"},
  {name:"Blanc",damage:"Froid",shape:"Cône 4,5m",icon:"🤍"},
],
mcReqs:{Barbare:[[0,13]],Barde:[[5,13]],Clerc:[[4,13]],Druide:[[4,13]],Ensorceleur:[[5,13]],Guerrier:[[0,13],[1,13],'or'],Magicien:[[3,13]],Moine:[[1,13],[4,13],'and'],Occultiste:[[5,13]],Paladin:[[0,13],[5,13],'and'],Rôdeur:[[1,13],[4,13],'and'],Roublard:[[1,13]],Artificier:[[3,13]]},
races:[
  {name:"Humain",speed:9,bonuses:[0,0,0,0,0,0],allBonus:1,traits:"Polyvalent : +1 à toutes les caractéristiques.",languages:"Commun + 1 au choix"},
  {name:"Elfe (Haut-Elfe)",speed:9,bonuses:[0,2,0,1,0,0],traits:"Sens aiguisés (maîtrise Perception), vision nuit 18m, ascendance féerique (avantage JS charme, immunité sommeil magique), transe, maîtrise épées longues/courtes et arcs longs/courts, sort mineur magicien (INT), langue supplémentaire au choix.",languages:"Commun, Elfique + 1 au choix"},
  {name:"Elfe des bois",speed:10.5,bonuses:[0,2,0,0,1,0],traits:"Sens aiguisés (maîtrise Perception), vision nuit 18m, ascendance féerique (avantage JS charme, immunité sommeil magique), transe, foulée légère (10,5m), maîtrise épées longues/courtes et arcs longs/courts, cachette naturelle (se cacher dans zones à visibilité réduite).",languages:"Commun, Elfique"},
  {name:"Elfe noir (Drow)",speed:9,bonuses:[0,2,0,0,0,1],traits:"Vision nuit 36m, sensibilité au soleil (désavantage attaques et Perception en lumière solaire), ascendance féerique, magie drow : lumières dansantes (cantrip), lueurs féeriques (niv.3, 1/repos long), ténèbres (niv.5, 1/repos long) — CHA, maîtrise rapières/épées courtes/arbalètes de poing.",languages:"Commun, Elfique"},
  {name:"Nain des montagnes",speed:7.5,bonuses:[2,0,2,0,0,0],traits:"Vision nuit 18m, résistance poison (avantage JS + résistance dégâts), formation armes naines (hachettes, haches d'armes, marteaux légers, marteaux de guerre), maîtrise armures légères et intermédiaires, connaissance de la pierre (double maîtrise Histoire lié à la pierre).",languages:"Commun, Nain"},
  {name:"Nain des collines",speed:7.5,bonuses:[0,0,2,0,1,0],traits:"Vision nuit 18m, résistance poison (avantage JS + résistance dégâts), formation armes naines (hachettes, haches d'armes, marteaux légers, marteaux de guerre), ténacité naine (+1 PV max/niveau), connaissance de la pierre (double maîtrise Histoire lié à la pierre).",languages:"Commun, Nain"},
  {name:"Halfelin pied-léger",speed:7.5,bonuses:[0,2,0,0,0,1],traits:"Chanceux (relancer les 1 aux attaques/JS/carac.), brave (avantage JS peur), agilité halfeline (traverser l'espace d'une créature plus grande), discrétion naturelle (se cacher derrière une créature plus grande).",languages:"Commun, Halfelin"},
  {name:"Halfelin robuste",speed:7.5,bonuses:[0,2,1,0,0,0],traits:"Chanceux (relancer les 1 aux attaques/JS/carac.), brave (avantage JS peur), agilité halfeline (traverser l'espace d'une créature plus grande), résistance des robustes (avantage JS poison, résistance dégâts poison).",languages:"Commun, Halfelin"},
  {name:"Gnome des forêts",speed:7.5,bonuses:[0,1,0,2,0,0],traits:"Vision nuit 18m, ruse gnome, illusion mineure, communication animale.",languages:"Commun, Gnome"},
  {name:"Gnome des roches",speed:7.5,bonuses:[0,0,1,2,0,0],traits:"Vision nuit 18m, ruse gnome, connaissance artificielle.",languages:"Commun, Gnome"},
  {name:"Demi-Elfe",speed:9,bonuses:[0,0,0,0,0,2],flexBonus:2,traits:"+2 CHA, +1 à deux autres au choix. Vision nuit 18m, résistance enchantement, 2 compétences.",languages:"Commun, Elfique + 1 au choix"},
  {name:"Demi-Orc",speed:9,bonuses:[2,0,1,0,0,0],traits:"Vision nuit 18m, menaçant (maîtrise Intimidation), endurance implacable (tomber à 0 PV → passer à 1 PV, 1/repos long), attaques sauvages (coup critique corps à corps : lancer un dé de dégâts supplémentaire).",languages:"Commun, Orc"},
  {name:"Tieffelin",speed:9,bonuses:[0,0,0,1,0,2],traits:"Vision nuit 18m, résistance feu, ascendance infernale.",languages:"Commun, Infernal"},
  {name:"Dragonide",speed:9,bonuses:[2,0,0,0,0,1],traits:"Ascendance draconique au choix (couleur du dragon). Souffle draconique : action, JS CON, 1 fois/repos court ou long. Résistance au type de dégâts correspondant.",languages:"Commun, Draconique"},
  {name:"Aasimar",speed:9,bonuses:[0,0,0,0,1,2],traits:"Vision nuit 18m, résistance nécrotique et radiant, connaissance céleste.",languages:"Commun, Céleste"},
  {name:"Aarakocra",speed:7.5,bonuses:[0,2,0,0,1,0],traits:"Vol 15m (impossible en armure intermédiaire ou lourde). Serres : arme naturelle, 1d4 tranchant. Attention : race exotique, certaines tables l'interdisent.",languages:"Commun, Aarakocra, Aérien"},
  {name:"Dragonide métallique",speed:9,bonuses:[0,0,0,0,0,0],traits:"Bonus flexible : +2 à une carac. au choix et +1 à une autre, OU +1 à trois carac. au choix (à appliquer manuellement). Ascendance métallique au choix (airain/argent/bronze/cuivre/or → feu/froid/foudre/acide/feu). Souffle : remplace une attaque, cône 4,5m, JS DEX, 1d10→4d10, récup. bonus maîtrise fois/repos long. Résistance au type correspondant. Niv.5 : Souffle métallique (1/repos long : effet débilitant ou repoussé 6m).",languages:"Commun + 1 au choix"},
  {name:"Gnome des profondeurs",speed:7.5,bonuses:[0,1,0,2,0,0],traits:"Vision nuit 36m (supérieure). Ruse gnome (avantage JS INT/SAG/CHA contre magie). Teint pierreux (avantage Discrétion sur terrain rocheux). Taille Petite.",languages:"Commun, Gnome, Commun des profondeurs"},
  {name:"Goliath",speed:9,bonuses:[2,0,1,0,0,0],traits:"Athlète naturel (maîtrise Athlétisme). Endurance de la pierre (réaction : lancer 1d12+CON, réduire les dégâts subis de ce total, 1/repos). Puissamment bâti (compte comme taille supérieure pour la capacité de charge). Montagnard (résistance froid, acclimaté aux hautes altitudes).",languages:"Commun, Géant"},
],
weapons:[
  {name:"Dague",damage:"1d4 perforant",subtype:"Simple",properties:"Finesse, légère, lancer (6/18)",price:"2 po"},
  {name:"Gourdin",damage:"1d4 contondant",subtype:"Simple",properties:"Légère",price:"1 pa"},
  {name:"Hachette",damage:"1d6 tranchant",subtype:"Simple",properties:"Légère, lancer (6/18)",price:"5 po"},
  {name:"Bâton",damage:"1d6 contondant",subtype:"Simple",properties:"Polyvalente (1d8)",price:"2 pa"},
  {name:"Arc court",damage:"1d6 perforant",subtype:"Simple distance",properties:"Munitions (24/96)",price:"25 po"},
  {name:"Arbalète légère",damage:"1d8 perforant",subtype:"Simple distance",properties:"Munitions (24/96)",price:"25 po"},
  {name:"Épée courte",damage:"1d6 perforant",subtype:"Guerre",properties:"Finesse, légère",price:"10 po"},
  {name:"Rapière",damage:"1d8 perforant",subtype:"Guerre",properties:"Finesse",price:"25 po"},
  {name:"Épée longue",damage:"1d8 tranchant",subtype:"Guerre",properties:"Polyvalente (1d10)",price:"15 po"},
  {name:"Hache de guerre",damage:"1d8 tranchant",subtype:"Guerre",properties:"Polyvalente (1d10)",price:"10 po"},
  {name:"Grande hache",damage:"1d12 tranchant",subtype:"Guerre",properties:"Lourde, à deux mains",price:"30 po"},
  {name:"Épée à deux mains",damage:"2d6 tranchant",subtype:"Guerre",properties:"Lourde, à deux mains",price:"50 po"},
  {name:"Arc long",damage:"1d8 perforant",subtype:"Guerre distance",properties:"Munitions (45/180)",price:"50 po"},
],
armors:[
  {name:"Armure de cuir",ca:"11 + DEX",type:"Légère",price:"10 po"},
  {name:"Armure de cuir clouté",ca:"12 + DEX",type:"Légère",price:"45 po"},
  {name:"Cotte de mailles (inter.)",ca:"14 + DEX (max 2)",type:"Intermédiaire",price:"50 po"},
  {name:"Armure d'écailles",ca:"14 + DEX (max 2)",type:"Intermédiaire",price:"50 po"},
  {name:"Cuirasse",ca:"13 + DEX (max 2)",type:"Intermédiaire",price:"400 po"},
  {name:"Harnois",ca:"18",type:"Lourde",price:"1500 po"},
  {name:"Bouclier",ca:"+2",type:"Bouclier",price:"10 po"},
],
spells:[
  {name:"Lumière",level:0,school:"Évocation",castTime:"1 action",range:"Toucher",components:"V,M",duration:"1h",desc:"Un objet brille dans un rayon de 6m."},
  {name:"Prestidigitation",level:0,school:"Transmutation",castTime:"1 action",range:"3m",components:"V,S",duration:"1h",desc:"Petits effets magiques variés."},
  {name:"Trait de feu",level:0,school:"Évocation",castTime:"1 action",range:"36m",components:"V,S",duration:"Instantané",desc:"Jet d'attaque à distance. Succès: 1d10 feu.",damage:"1d10 feu"},
  {name:"Bouffée de poison",level:0,school:"Nécomancie",castTime:"1 action",range:"3m",components:"V,S",duration:"Instantané",desc:"JS CON ou 1d12 poison.",damage:"1d12 poison"},
  {name:"Main du mage",level:0,school:"Invocation",castTime:"1 action",range:"9m",components:"V,S",duration:"1 min",desc:"Main spectrale qui manipule des objets à distance."},
  {name:"Mot de guérison",level:1,school:"Évocation",castTime:"1 action bonus",range:"18m",components:"V",duration:"Instantané",desc:"Cible visible regagne 1d4 + mod SAG PV.",damage:"1d4+SAG soins"},
  {name:"Soin des blessures",level:1,school:"Évocation",castTime:"1 action",range:"Toucher",components:"V,S",duration:"Instantané",desc:"Cible touchée regagne 1d8 + mod SAG PV.",damage:"1d8+SAG soins"},
  {name:"Bouclier de la foi",level:1,school:"Abjuration",castTime:"1 action bonus",range:"18m",components:"V,S,M",duration:"Conc. 10 min",desc:"+2 CA à une créature visible."},
  {name:"Projectile magique",level:1,school:"Évocation",castTime:"1 action",range:"36m",components:"V,S",duration:"Instantané",desc:"3 fléchettes magiques. Chacune inflige 1d4+1 force. Toujours touché.",damage:"3×(1d4+1) force"},
  {name:"Bouclier",level:1,school:"Abjuration",castTime:"1 réaction",range:"Personnel",components:"V,S",duration:"1 round",desc:"+5 CA jusqu'au prochain tour (y compris l'attaque déclencheuse)."},
  {name:"Charme-personne",level:1,school:"Enchantement",castTime:"1 action",range:"9m",components:"V,S",duration:"1h",desc:"JS SAG ou cible charmée. Elle te considère comme un ami.",savingThrow:"SAG"},
  {name:"Sommeil",level:1,school:"Enchantement",castTime:"1 action",range:"27m",components:"V,S,M",duration:"1 min",desc:"5d8 PV de créatures endormies (plus faibles PV en premier)."},
  {name:"Boule de feu",level:3,school:"Évocation",castTime:"1 action",range:"45m",components:"V,S,M",duration:"Instantané",desc:"Explosion 6m rayon. JS DEX ou 8d6 feu (réussite: moitié).",damage:"8d6 feu"},
  {name:"Éclair",level:3,school:"Évocation",castTime:"1 action",range:"Ligne 30m",components:"V,S,M",duration:"Instantané",desc:"Ligne 1.5m×30m. JS DEX ou 8d6 foudre (réussite: moitié).",damage:"8d6 foudre"},
]
};

const BACKGROUNDS=[
  {name:"Acolyte",skills:["Intuition","Religion"],tools:"",langs:2,desc:"Serviteur d'un temple."},
  {name:"Artisan de guilde",skills:["Investigation","Persuasion"],tools:"Outils d'artisan au choix",langs:1,desc:"Membre d'une guilde."},
  {name:"Artiste",skills:["Acrobaties","Représentation"],tools:"Déguisement, instrument de musique",langs:0,desc:"Artiste de scène."},
  {name:"Charlatan",skills:["Tromperie","Escamotage"],tools:"Déguisement, matériel de faussaire",langs:0,desc:"Maître de l'escroquerie."},
  {name:"Criminel",skills:["Tromperie","Discrétion"],tools:"Jeu de dés, outils de voleur",langs:0,desc:"Ancien criminel."},
  {name:"Enfant des rues",skills:["Discrétion","Escamotage"],tools:"Déguisement",langs:1,desc:"Survie en milieu urbain."},
  {name:"Ermite",skills:["Médecine","Religion"],tools:"Herboriste",langs:1,desc:"Vie de solitude."},
  {name:"Héros du peuple",skills:["Dressage","Survie"],tools:"Outils d'artisan, véhicules terrestres",langs:0,desc:"Défenseur des faibles."},
  {name:"Marin",skills:["Athlétisme","Perception"],tools:"Navigateur, véhicules nautiques",langs:0,desc:"Vie en mer."},
  {name:"Noble",skills:["Histoire","Persuasion"],tools:"Jeu d'échecs ou cartes",langs:1,desc:"Noblesse et privilèges."},
  {name:"Sage",skills:["Arcanes","Histoire"],tools:"",langs:2,desc:"Érudit passionné."},
  {name:"Sauvageon",skills:["Athlétisme","Survie"],tools:"Instrument de musique",langs:1,desc:"Proche de la nature."},
  {name:"Soldat",skills:["Athlétisme","Intimidation"],tools:"Jeu de dés, véhicules terrestres",langs:0,desc:"Expérience militaire."},
  {name:"Chasseur de primes",skills:["Tromperie","Persuasion"],tools:"Jeu de dés, véhicules terrestres",langs:0,desc:"Traqueur de criminels."},
  {name:"Hanté",skills:["Intuition","Religion"],tools:"Jeu de cartes",langs:1,desc:"Touché par l'au-delà."},
  {name:"Voyageur",skills:["Athlétisme","Survie"],tools:"",langs:2,desc:"Parcourt les routes du monde."},
];


// ═══════════════════════════════════════
// COMPENDIUM DE SORTS (chargé dynamiquement)
// ═══════════════════════════════════════
let SPELLS_DB = null; // Sera chargé depuis data/spells_db.json

function getSpellsDB(){
  // Retourne SPELLS_DB si chargé, sinon SRD.spells (fallback)
  if(SPELLS_DB) return SPELLS_DB;
  return SRD.spells;
}

async function loadSpellsDB(onDone){
  // Essayer localStorage d'abord
  try {
    const cached = localStorage.getItem('dnd5e_spells_db');
    if(cached){
      const arr = JSON.parse(cached);
      SPELLS_DB = parseSpellsDB(arr);
      showToast('📚 Compendium chargé depuis le cache ('+SPELLS_DB.length+' sorts)');
      if(onDone) onDone();
      return;
    }
  } catch(e){}
  
  // Charger depuis data/spells_db.json
  showToast('⏳ Chargement du compendium...');
  try {
    const resp = await fetch('data/spells_db.json');
    if(!resp.ok) throw new Error('Fichier introuvable');
    const arr = await resp.json();
    // Mettre en cache
    try { localStorage.setItem('dnd5e_spells_db', JSON.stringify(arr)); } catch(e){}
    SPELLS_DB = parseSpellsDB(arr);
    showToast('✅ Compendium chargé ! '+SPELLS_DB.length+' sorts disponibles.');
    if(onDone) onDone();
  } catch(e){
    showToast('❌ Impossible de charger data/spells_db.json. Placez le fichier dans le même dossier que la fiche.');
  }
}

function parseSpellsDB(arr){
  // Convertit le format compact [nameFR, nameEN, level, school, castTime, range, components, duration, classes[], desc, ritual, rolls[]]
  return arr.map(r => ({
    name: r[0], nameEN: r[1], level: r[2], school: r[3],
    castTime: r[4], range: r[5], components: r[6], duration: r[7],
    classes: r[8], desc: r[9], ritual: !!r[10], rolls: r[11]||[],
    damage: (r[11]&&r[11][0]) ? r[11][0][0] : ''
  }));
}

function clearSpellsCache(){
  localStorage.removeItem('dnd5e_spells_db');
  SPELLS_DB = null;
  showToast('🗑️ Cache du compendium effacé.');
}

// ═══════════════════════════════════════
// COMPENDIUM OBJETS (data/items_db.json)
// ═══════════════════════════════════════
async function loadItemsDB(onDone){
  if(ITEMS_DB){if(onDone)onDone();return;}
  try{const c=localStorage.getItem('dnd5e_items_db');if(c){ITEMS_DB=JSON.parse(c);showToast('📦 Objets chargés depuis le cache ('+ITEMS_DB.length+')');if(onDone)onDone();return;}}catch(e){}
  showToast('⏳ Chargement du compendium d\'objets...');
  try{
    const resp=await fetch('data/items_db.json');
    if(!resp.ok)throw new Error();
    ITEMS_DB=await resp.json();
    try{localStorage.setItem('dnd5e_items_db',JSON.stringify(ITEMS_DB));}catch(e){}
    showToast('✅ '+ITEMS_DB.length+' objets chargés !');
    if(onDone)onDone();
  }catch(e){showToast('❌ Impossible de charger data/items_db.json — placez le fichier avec index.html');}
}

// ═══════════════════════════════════════
// COMPENDIUM MONSTRES (data/monsters_db.json)
// ═══════════════════════════════════════
async function loadMonstersDB(onDone){
  if(MONSTERS_DB){if(onDone)onDone();return;}
  try{const c=localStorage.getItem('dnd5e_monsters_db');if(c){MONSTERS_DB=JSON.parse(c);showToast('👾 Monstres chargés depuis le cache ('+MONSTERS_DB.length+')');if(onDone)onDone();return;}}catch(e){}
  showToast('⏳ Chargement du compendium de monstres...');
  try{
    const resp=await fetch('data/monsters_db.json');
    if(!resp.ok)throw new Error();
    MONSTERS_DB=await resp.json();
    try{localStorage.setItem('dnd5e_monsters_db',JSON.stringify(MONSTERS_DB));}catch(e){}
    showToast('✅ '+MONSTERS_DB.length+' monstres chargés !');
    if(onDone)onDone();
  }catch(e){showToast('❌ Impossible de charger data/monsters_db.json — placez le fichier avec index.html');}
}

async function loadFeatsDB(){
  if(FEATS_DB)return;
  try{const c=localStorage.getItem('dnd5e_feats_db');if(c){FEATS_DB=JSON.parse(c);return;}}catch(e){}
  try{const r=await fetch('data/feats_db.json');if(r.ok){FEATS_DB=await r.json();try{localStorage.setItem('dnd5e_feats_db',JSON.stringify(FEATS_DB));}catch(e){}}}catch(e){}
}
async function loadRacesDB(){
  if(RACES_DB)return;
  try{const c=localStorage.getItem('dnd5e_races_db');if(c){RACES_DB=JSON.parse(c);return;}}catch(e){}
  try{const r=await fetch('data/races_db.json');if(r.ok){RACES_DB=await r.json();try{localStorage.setItem('dnd5e_races_db',JSON.stringify(RACES_DB));}catch(e){}}}catch(e){}
}
async function loadBackgroundsDB(){
  if(BACKGROUNDS_DB)return;
  try{const c=localStorage.getItem('dnd5e_backgrounds_db');if(c){BACKGROUNDS_DB=JSON.parse(c);return;}}catch(e){}
  try{const r=await fetch('data/backgrounds_db.json');if(r.ok){BACKGROUNDS_DB=await r.json();try{localStorage.setItem('dnd5e_backgrounds_db',JSON.stringify(BACKGROUNDS_DB));}catch(e){}}}catch(e){}
}
async function loadClassesDB(){
  if(CLASSES_DB)return;
  try{const c=localStorage.getItem('dnd5e_classes_db');if(c){CLASSES_DB=JSON.parse(c);return;}}catch(e){}
  try{const r=await fetch('data/classes_db.json');if(r.ok){CLASSES_DB=await r.json();try{localStorage.setItem('dnd5e_classes_db',JSON.stringify(CLASSES_DB));}catch(e){}}}catch(e){}
}

function searchSpellsDB(query, filterClass, filterLevel, filterSchool){
  const db = getSpellsDB();
  const q = query.toLowerCase().trim();
  return db.filter(s => {
    if(filterClass && !s.classes.includes(filterClass)) return false;
    if(filterLevel !== '' && filterLevel !== null && s.level !== parseInt(filterLevel)) return false;
    if(filterSchool && s.school !== filterSchool) return false;
    if(q && !s.name.toLowerCase().includes(q) && !s.nameEN.toLowerCase().includes(q)) return false;
    return true;
  }).sort((a,b)=>a.level-b.level||(a.name||'').localeCompare(b.name||''));
}

const MC_SLOT_TABLE=[[2],[3],[4,2],[4,3],[4,3,2],[4,3,3],[4,3,3,1],[4,3,3,2],[4,3,3,3,1],[4,3,3,3,2],[4,3,3,3,2,1],[4,3,3,3,2,1,1],[4,3,3,3,2,1,1,1],[4,3,3,3,2,1,1,1],[4,3,3,3,2,1,1,1,1],[4,3,3,3,2,1,1,1,1],[4,3,3,3,2,1,1,1,1],[4,3,3,3,3,1,1,1,1],[4,3,3,3,3,2,1,1,1],[4,3,3,3,3,2,2,1,1]];
// Occultiste : [nb_emplacements, niveau_des_emplacements] par niveau de classe
const WARLOCK_SLOT_TABLE=[[1,1],[2,1],[2,2],[2,2],[2,3],[2,3],[2,4],[2,4],[2,5],[2,5],[3,5],[3,5],[3,5],[3,5],[3,5],[3,5],[4,5],[4,5],[4,5],[4,5]];
const XP_LEVELS=[0,300,900,2700,6500,14000,23000,34000,48000,64000,85000,100000,120000,140000,165000,195000,225000,265000,305000,355000];
const CR_XP_TABLE={'0':10,'1/8':25,'1/4':50,'1/2':100,'1':200,'2':450,'3':700,'4':1100,'5':1800,'6':2300,'7':2900,'8':3900,'9':5000,'10':5900,'11':7200,'12':8400,'13':10000,'14':11500,'15':13000,'16':15000,'17':18000,'18':20000,'19':22000,'20':25000,'21':33000,'22':41000,'23':50000,'24':62000,'25':75000,'26':90000,'27':105000,'28':120000,'29':135000,'30':155000};
const ENC_THRESHOLDS=[[25,50,75,100],[50,100,150,200],[75,150,225,400],[125,250,375,500],[250,500,750,1100],[300,600,900,1400],[350,750,1100,1700],[450,900,1400,2100],[550,1100,1600,2400],[600,1200,1900,2800],[800,1600,2400,3600],[1000,2000,3000,4500],[1100,2200,3400,5100],[1250,2500,3800,5700],[1400,2800,4300,6400],[1600,3200,4800,7200],[2000,3900,5900,8800],[2100,4200,6300,9500],[2400,4900,7300,10900],[2800,5700,8500,12700]];
const RARITY_INFO={Commun:{color:'#9e9e9e',level:'Niv. 1+',price:'50–100 po'},'Peu commun':{color:'#4caf50',level:'Niv. 1+',price:'101–500 po'},Rare:{color:'#2196f3',level:'Niv. 5+',price:'501–5 000 po'},'Très rare':{color:'#9c27b0',level:'Niv. 11+',price:'5 001–50 000 po'},Légendaire:{color:'var(--cp)',level:'Niv. 17+',price:'50 001+ po'},Artefact:{color:'#e53935',level:'Unique',price:'Inestimable'}};
const BEAST_FORMS=[
  {name:"Chat",icon:"🐈",cr:0,crD:"0",hpMax:2,ac:12,speed:"9m",ab:[3,15,10,3,12,7],swim:false,fly:false,attacks:[{name:"Griffes",bonus:0,dmg:"1",type:"tranchant"}],traits:["Vision dans le noir 18m","Sens aiguisés — avantage (ouïe, odorat)"]},
  {name:"Aigle",icon:"🦅",cr:0,crD:"0",hpMax:4,ac:12,speed:"3m / Vol 18m",ab:[6,15,10,2,14,7],swim:false,fly:true,attacks:[{name:"Serres",bonus:4,dmg:"1d4+2",type:"tranchant"}],traits:["Vue perçante — avantage aux jets de Perception (vue)"]},
  {name:"Mastiff",icon:"🐕",cr:0.125,crD:"1/8",hpMax:5,ac:12,speed:"12m",ab:[13,14,12,3,12,7],swim:false,fly:false,attacks:[{name:"Morsure",bonus:3,dmg:"1d6+1",type:"perforant",special:"Ciblé : JS FOR DD10 ou à terre"}],traits:["Perception aiguisée — avantage (ouïe, odorat)"]},
  {name:"Serpent venimeux",icon:"🐍",cr:0.125,crD:"1/8",hpMax:2,ac:13,speed:"9m / Nage 9m",ab:[2,16,11,1,10,3],swim:true,fly:false,attacks:[{name:"Morsure",bonus:5,dmg:"1 + 2d4",type:"perforant + venin",special:"JS CON DD10 ou 2d4 poison"}],traits:["Amphibie (nage)"]},
  {name:"Loup",icon:"🐺",cr:0.25,crD:"1/4",hpMax:11,ac:13,speed:"12m",ab:[12,15,12,3,12,6],swim:false,fly:false,attacks:[{name:"Morsure",bonus:4,dmg:"2d4+2",type:"perforant",special:"Ciblé : JS FOR DD11 ou à terre"}],traits:["Perception aiguisée (ouïe, odorat)","Tactique de meute — avantage si un allié est adjacent à la cible"]},
  {name:"Panthère",icon:"🐆",cr:0.25,crD:"1/4",hpMax:13,ac:12,speed:"15m",ab:[14,15,10,3,14,7],swim:false,fly:false,attacks:[{name:"Morsure",bonus:4,dmg:"1d6+2",type:"perforant"},{name:"Griffes",bonus:4,dmg:"1d4+2",type:"tranchant"}],traits:["Saut amélioré (+3m distance, +1,5m hauteur)","Bond félin — si charge 6m → JS FOR DD12 ou à terre + action bonus Griffes"]},
  {name:"Sanglier",icon:"🐗",cr:0.25,crD:"1/4",hpMax:11,ac:11,speed:"12m",ab:[13,11,12,2,9,5],swim:false,fly:false,attacks:[{name:"Défenses",bonus:3,dmg:"1d6+1",type:"perforant"}],traits:["Charge — si déplace 6m avant attaque → JS FOR DD11 ou dégâts supp. et à terre","Inarrêtable — peut se relever sans utiliser de mouvement"]},
  {name:"Grenouille géante",icon:"🐸",cr:0.25,crD:"1/4",hpMax:18,ac:11,speed:"9m / Nage 9m",ab:[12,13,11,2,10,3],swim:true,fly:false,attacks:[{name:"Morsure",bonus:3,dmg:"1d6+1",type:"perforant"},{name:"Langue",bonus:3,dmg:"—",type:"—",special:"Agrippée jusqu'à 5,5m, JS FOR DD11 pour se libérer"}],traits:["Amphibie — respire sous l'eau","Langue collante — attrape jusqu'à 5,5m"]},
  {name:"Ours noir",icon:"🐻",cr:0.5,crD:"1/2",hpMax:19,ac:11,speed:"12m",ab:[15,10,14,2,12,7],swim:false,fly:false,attacks:[{name:"Griffes",bonus:5,dmg:"2d6+2",type:"tranchant"},{name:"Morsure",bonus:5,dmg:"1d6+2",type:"perforant"}],traits:["Odorat aiguisé — avantage aux jets de Perception (odorat)"]},
  {name:"Crocodile",icon:"🐊",cr:0.5,crD:"1/2",hpMax:19,ac:12,speed:"6m / Nage 9m",ab:[15,10,13,2,10,5],swim:true,fly:false,attacks:[{name:"Morsure",bonus:4,dmg:"1d10+2",type:"perforant",special:"Cible agrippée (évasion DD12) et immobilisée"}],traits:["Apnée 15 minutes","Nage 9m"]},
  {name:"Cheval de guerre",icon:"🐴",cr:0.5,crD:"1/2",hpMax:19,ac:11,speed:"18m",ab:[18,12,13,2,12,7],swim:false,fly:false,attacks:[{name:"Sabots",bonus:6,dmg:"2d6+4",type:"contondant"}],traits:["Charge — si déplace 6m avant attaque → JS FOR DD14 ou dégâts supp. et à terre"]},
  {name:"Ours brun",icon:"🐻",cr:1,crD:"1",hpMax:34,ac:11,speed:"12m",ab:[19,10,16,2,13,7],swim:false,fly:false,attacks:[{name:"Griffes",bonus:5,dmg:"2d6+4",type:"tranchant"},{name:"Morsure",bonus:5,dmg:"2d8+4",type:"perforant"}],traits:["Odorat aiguisé — avantage aux jets de Perception (odorat)"]},
  {name:"Tigre",icon:"🐯",cr:1,crD:"1",hpMax:37,ac:12,speed:"12m",ab:[17,15,14,3,12,8],swim:false,fly:false,attacks:[{name:"Griffes",bonus:5,dmg:"1d6+3",type:"tranchant"},{name:"Morsure",bonus:5,dmg:"1d10+3",type:"perforant"}],traits:["Saut amélioré (+3m distance, +1,5m hauteur)","Bond félin — si charge 6m → JS FOR DD13 ou à terre + action bonus Morsure","Odorat aiguisé"]},
  {name:"Araignée géante",icon:"🕷",cr:1,crD:"1",hpMax:26,ac:14,speed:"9m",ab:[14,16,12,2,11,4],swim:false,fly:false,attacks:[{name:"Morsure",bonus:5,dmg:"1d8+3",type:"perforant",special:"JS CON DD11 ou 5d8 poison (½ si réussi)"}],traits:["Vision dans le noir 18m","Sens des vibrations 6m","Escalade 9m (murs/plafonds)","Toile — JS DEX DD11 ou entravé"]},
  {name:"Ours polaire",icon:"🐻",cr:2,crD:"2",hpMax:42,ac:12,speed:"12m / Nage 9m",ab:[20,10,16,2,13,7],swim:true,fly:false,attacks:[{name:"Griffes",bonus:7,dmg:"2d8+5",type:"tranchant"},{name:"Morsure",bonus:7,dmg:"2d6+5",type:"perforant"}],traits:["Odorat aiguisé — avantage aux jets de Perception (odorat)","Nage 9m"]},
  {name:"Rhinocéros",icon:"🦏",cr:2,crD:"2",hpMax:45,ac:11,speed:"12m",ab:[21,8,15,2,12,6],swim:false,fly:false,attacks:[{name:"Corne",bonus:7,dmg:"2d8+5",type:"contondant"}],traits:["Charge — si déplace 9m avant attaque → JS FOR DD15 ou dégâts supp. et à terre"]},
  {name:"Tigre à dents de sabre",icon:"🐅",cr:2,crD:"2",hpMax:52,ac:12,speed:"12m",ab:[18,14,15,3,12,8],swim:false,fly:false,attacks:[{name:"Morsure",bonus:6,dmg:"2d10+4",type:"perforant"},{name:"Griffes",bonus:6,dmg:"2d6+4",type:"tranchant"}],traits:["Saut amélioré (+4,5m / +3m hauteur)","Bond félin — si charge 6m → JS FOR DD14 ou à terre + action bonus Griffes","Odorat aiguisé"]},
  {name:"Sanglier géant",icon:"🐗",cr:2,crD:"2",hpMax:42,ac:12,speed:"12m",ab:[17,10,16,2,7,5],swim:false,fly:false,attacks:[{name:"Défenses",bonus:5,dmg:"2d6+3",type:"perforant"}],traits:["Charge — si déplace 6m avant attaque → JS FOR DD13 ou dégâts supp. et à terre","Inarrêtable — peut se relever sans utiliser de mouvement","Vigilance farouche — ne peut pas être surpris"]},
];
const ELEMENTAL_FORMS=[
  {name:"Élémentaire de l'air",icon:"💨",hpMax:90,ac:15,speed:"Vol 27m",ab:[14,20,14,6,10,6],attacks:[{name:"Frappe de vent",bonus:8,dmg:"2d8+5",type:"contondant",special:"2 attaques par action"},{name:"Tourbillon",bonus:8,dmg:"2d8+5",type:"contondant",special:"Cone 9m : JS FOR DD13 ou à terre et 3d8+5"}],traits:["Forme d'air — peut traverser tout espace d'1 pouce ou plus","Résistance aux dégâts contondants/perforants/tranchants non magiques","Immunité : foudre, tonnerre, poison, étourdissement","Vision dans le noir 18m"]},
  {name:"Élémentaire de la terre",icon:"🪨",hpMax:126,ac:17,speed:"9m / Creuse 9m",ab:[20,8,20,5,10,5],attacks:[{name:"Coup",bonus:8,dmg:"2d8+5",type:"contondant",special:"2 attaques par action"},{name:"Piétinement",bonus:8,dmg:"2d10+5",type:"contondant",special:"Créature à terre : avantage + 2d10 supplémentaires"}],traits:["Forme de terre — creuse dans la roche et la terre non travaillée","Résistance aux dégâts contondants/perforants/tranchants non magiques","Immunité : poison, étourdissement","Vue dans la roche 18m"]},
  {name:"Élémentaire du feu",icon:"🔥",hpMax:102,ac:13,speed:"15m",ab:[10,17,16,6,10,7],attacks:[{name:"Toucher enflammé",bonus:6,dmg:"2d6+3",type:"feu",special:"2 attaques par action"},{name:"Embrasement",bonus:6,dmg:"2d6+3",type:"feu",special:"Cible enflammée : 1d10 feu/tour (DD10 pour éteindre)"}],traits:["Forme de feu — illumine 3m brillant / 6m faible","Résistance aux dégâts contondants/perforants/tranchants non magiques","Immunité : feu, poison, étourdissement","Inflammabilité — les créatures touchées peuvent s'enflammer"]},
  {name:"Élémentaire de l'eau",icon:"🌊",hpMax:114,ac:14,speed:"9m / Nage 27m",ab:[18,14,18,5,10,8],attacks:[{name:"Frappe",bonus:7,dmg:"2d8+4",type:"contondant",special:"2 attaques par action"},{name:"Engloutissement",bonus:7,dmg:"2d8+4",type:"contondant",special:"Cible agrippée (taille M/S) : noyade DD13 CON chaque tour"}],traits:["Forme d'eau — peut traverser tout espace d'1 pouce ou plus","Résistance aux dégâts contondants/perforants/tranchants non magiques","Immunité : acide, poison, étourdissement","Marche sur l'eau — se déplace sur les surfaces liquides"]},
];
const ELDRITCH_INVOCATIONS=[
  {name:"Trait torturant",minLevel:0,desc:"Quand tu touches avec le Rayon occulte, ajoute ton modificateur de CHA aux dégâts (même si 0 ou négatif). Prérequis : sort Rayon occulte."},
  {name:"Armure d'ombres",minLevel:0,desc:"Tu peux lancer Armure de mage sur toi-même à volonté, sans dépenser d'emplacement ni de composantes."},
  {name:"Influence ensorcelante",minLevel:0,desc:"Tu maîtrises les compétences Tromperie et Persuasion."},
  {name:"Vision du diable",minLevel:0,desc:"Tu vois normalement dans les ténèbres, magiques ou non, jusqu'à une portée de 36 mètres."},
  {name:"Vue occulte",minLevel:0,desc:"Tu peux lancer Détection de la magie à volonté, sans dépenser d'emplacement ni de composantes."},
  {name:"Lance occulte",minLevel:0,desc:"La portée de ton Rayon occulte passe à 90 mètres. Prérequis : sort Rayon occulte."},
  {name:"Yeux du gardien de runes",minLevel:0,desc:"Tu peux lire toutes les formes d'écriture, qu'elles soient normales ou magiques."},
  {name:"Vigueur fiélonne",minLevel:0,desc:"Tu peux lancer Forme de faux-mort sur toi-même à volonté, sans dépenser d'emplacement ni de composantes."},
  {name:"Regard de deux esprits",minLevel:0,desc:"Tu touches un humanoïde consentant et pendant 1 heure tu peux percevoir à travers ses sens. Tu peux y mettre fin à volonté."},
  {name:"Masque aux mille visages",minLevel:0,desc:"Tu peux lancer Déguisement à volonté, sans dépenser d'emplacement ni de composantes."},
  {name:"Visions brumeuses",minLevel:0,desc:"Tu peux lancer Image silencieuse à volonté, sans dépenser d'emplacement ni de composantes."},
  {name:"Explosion repoussante",minLevel:0,desc:"Quand tu touches avec le Rayon occulte, tu peux repousser la cible de 3 mètres en ligne droite. Prérequis : sort Rayon occulte."},
  {name:"Un avec les ombres",minLevel:5,desc:"Dans une zone de lumière faible ou de ténèbres, tu peux utiliser ton action pour devenir invisible jusqu'à ce que tu te déplaces ou effectues une action ou réaction. Prérequis : niveau 5."},
  {name:"Lame assoiffée",minLevel:5,desc:"Tu peux attaquer deux fois au lieu d'une quand tu effectues l'action Attaquer avec ton arme de pacte. Prérequis : niveau 5, Faveur de pacte (Lame)."},
  {name:"Signe mauvais",minLevel:5,desc:"Tu peux lancer Imprécation à volonté, sans dépenser d'emplacement ni de composantes. Prérequis : niveau 5."},
  {name:"Sculpteur de chair",minLevel:7,desc:"Tu peux lancer Métamorphose une fois sans dépenser d'emplacement de sort. Tu dois finir un repos long avant de pouvoir le refaire. Prérequis : niveau 7."},
  {name:"Marche ascendante",minLevel:9,desc:"Tu peux lancer Lévitation sur toi-même à volonté, sans dépenser d'emplacement ni de composantes. Prérequis : niveau 9."},
  {name:"Chuchotements de la tombe",minLevel:9,desc:"Tu peux lancer Communication avec les morts à volonté, sans dépenser d'emplacement ni de composantes. Prérequis : niveau 9."},
  {name:"Buveur de vie",minLevel:12,desc:"Quand tu frappes avec ton arme de pacte, la cible subit des dégâts nécrotiques supplémentaires égaux à 1 + ton modificateur de CHA. Prérequis : niveau 12, Faveur de pacte (Lame)."},
  {name:"Visions de royaumes lointains",minLevel:15,desc:"Tu peux lancer Œil invisible à volonté, sans dépenser d'emplacement ni de composantes. Prérequis : niveau 15."},
  {name:"Vue de sorcière",minLevel:15,desc:"Tu peux voir la vraie forme de tout changeforme ou créature invisible dans un rayon de 9 mètres et dans ton champ de vision. Prérequis : niveau 15."},
];
// Familiers SRD — Trouver un familier + Pacte de la Chaîne
const FAMILIAR_TYPES=[
  {name:'Chauve-souris',icon:'🦇',hp:1,ac:12,speed:'Vol 9m',ab:[2,15,8,2,12,4],attacks:[],traits:['Écholocalisation — avantage ouïe (hors cécité/surdité)','Ouïe fine — avantage Perception (ouïe)']},
  {name:'Chat',icon:'🐈',hp:2,ac:12,speed:'12m',ab:[3,15,10,3,12,7],attacks:[{name:'Griffes',bonus:0,dmg:'1',type:'tranchant'}],traits:['Sens aiguisés — avantage Perception (ouïe, odorat)']},
  {name:'Crabe',icon:'🦀',hp:2,ac:11,speed:'6m, nage 6m',ab:[2,11,10,1,8,2],attacks:[{name:'Pince',bonus:0,dmg:'1',type:'tranchant'}],traits:['Amphibie — respire air et eau']},
  {name:'Grenouille',icon:'🐸',hp:1,ac:11,speed:'6m, nage 6m',ab:[1,13,8,1,8,3],attacks:[],traits:['Amphibie — respire air et eau','Saut amélioré — +1,5m de distance']},
  {name:'Faucon',icon:'🦅',hp:1,ac:13,speed:'Vol 18m',ab:[5,14,8,2,14,6],attacks:[{name:'Serres',bonus:4,dmg:'1',type:'tranchant'}],traits:['Ouïe et vue fines — avantage Perception (ouïe, vue)']},
  {name:'Lézard',icon:'🦎',hp:2,ac:10,speed:'6m, escalade 6m',ab:[2,11,10,1,8,3],attacks:[{name:'Morsure',bonus:0,dmg:'1',type:'perforant'}],traits:[]},
  {name:'Poulpe',icon:'🐙',hp:3,ac:12,speed:'1,5m, nage 9m',ab:[4,15,11,3,10,4],attacks:[{name:'Tentacules',bonus:4,dmg:'1',type:'contondant',special:'Cible agrippée (évasion DD10)'}],traits:['Amphibie — apnée 30 min','Camouflage — avantage Discrétion dans l\'eau','Tentacules portée 1m']},
  {name:'Chouette',icon:'🦉',hp:1,ac:11,speed:'Vol 18m',ab:[3,13,8,2,12,7],attacks:[{name:'Serres',bonus:3,dmg:'1',type:'tranchant'}],traits:['Vol sur place — nul besoin de recul','Vision dans le noir 36m','Ouïe et vue fines — avantage Perception (ouïe, vue)']},
  {name:'Rat',icon:'🐀',hp:1,ac:10,speed:'6m',ab:[2,11,10,2,10,4],attacks:[{name:'Morsure',bonus:0,dmg:'1',type:'perforant'}],traits:['Odorat fin — avantage Perception (odorat)']},
  {name:'Corbeau',icon:'🐦',hp:1,ac:12,speed:'Vol 15m',ab:[2,14,8,2,12,6],attacks:[{name:'Bec',bonus:4,dmg:'1',type:'perforant'}],traits:['Imitation — imite sons entendus (Perspicacité DD10 pour différencier)']},
  {name:'Cheval de mer',icon:'🐡',hp:1,ac:11,speed:'Nage 12m',ab:[1,12,8,1,10,2],attacks:[],traits:['Aquatique — ne peut respirer l\'air']},
  {name:'Araignée',icon:'🕷️',hp:1,ac:12,speed:'6m, escalade 6m',ab:[2,14,8,2,10,2],attacks:[{name:'Morsure',bonus:4,dmg:'1 + venin',type:'perforant',special:'JS CON DD9 ou 2d4 venin'}],traits:['Vision dans le noir 9m','Sens des vibrations via toile 6m','Escalade (murs et plafonds)']},
  {name:'Belette',icon:'🦡',hp:1,ac:13,speed:'9m',ab:[3,16,8,2,12,3],attacks:[{name:'Morsure',bonus:5,dmg:'1',type:'perforant'}],traits:['Ouïe et odorat fins — avantage Perception (ouïe, odorat)']},
  // Pacte de la Chaîne — Occultiste niv. 3
  {name:'Diablotin',icon:'😈',hp:10,ac:13,speed:'9m, vol 12m',ab:[6,17,13,11,12,14],attacks:[{name:'Dard',bonus:5,dmg:'1d4+3',type:'perforant',special:'JS CON DD11 ou 2d4 venin'}],traits:['Résistance à la magie — avantage contre sorts','Changeforme (araignée / rat / corbeau)','Vision dans le noir 36m','Résistances : froid, feu, foudre, venin']},
  {name:'Pseudodragon',icon:'🐲',hp:7,ac:13,speed:'4,5m, vol 18m',ab:[6,15,13,10,12,10],attacks:[{name:'Morsure',bonus:4,dmg:'1d4+2',type:'perforant'},{name:'Dard',bonus:4,dmg:'1d4+2 + venin',type:'perforant',special:'JS CON DD11 ou endormi 1h'}],traits:['Résistance à la magie — avantage contre sorts','Sens magiques — détecte magie 10m','Télépathie limitée 30m avec son lien']},
  {name:'Quasit',icon:'👿',hp:7,ac:13,speed:'7,5m',ab:[5,17,10,7,10,8],attacks:[{name:'Griffes',bonus:4,dmg:'1d4+3',type:'perforant',special:'JS CON DD10 ou empoisonné 1 min'}],traits:['Résistance à la magie — avantage contre sorts','Changeforme (chauve-souris / centipède / crapaud)','Invisibilité à volonté','Vision dans le noir 36m']},
  {name:'Sylphe',icon:'🧚',hp:2,ac:15,speed:'3m, vol 15m',ab:[3,18,10,14,11,11],attacks:[{name:'Épée longue',bonus:2,dmg:'1',type:'tranchant'},{name:'Arc court',bonus:6,dmg:'1 + venin',type:'perforant',special:'JS CON DD10 ou endormi 1 min'}],traits:['Sens du cœur — détecte alignement et émotions à 9m','Invisibilité à volonté','Vol furtif — avantage Discrétion en vol']},
];
const ALIGNMENTS=["Loyal Bon","Neutre Bon","Chaotique Bon","Loyal Neutre","Neutre","Chaotique Neutre","Loyal Mauvais","Neutre Mauvais","Chaotique Mauvais"];
const SKILLS=[
  {name:"Acrobaties",ab:1},{name:"Arcanes",ab:3},{name:"Athlétisme",ab:0},{name:"Discrétion",ab:1},
  {name:"Dressage",ab:4},{name:"Histoire",ab:3},{name:"Intimidation",ab:5},{name:"Investigation",ab:3},
  {name:"Intuition",ab:4},{name:"Médecine",ab:4},{name:"Nature",ab:3},{name:"Perception",ab:4},
  {name:"Représentation",ab:5},{name:"Persuasion",ab:5},{name:"Religion",ab:3},{name:"Escamotage",ab:1},
  {name:"Survie",ab:4},{name:"Tromperie",ab:5}
];
const ABILITIES=["Force","Dextérité","Constitution","Intelligence","Sagesse","Charisme"];
const ABILITIES_SH=["FOR","DEX","CON","INT","SAG","CHA"];
const CLASS_SAVES={Barbare:[0,2],Barde:[1,5],Clerc:[4,5],Druide:[3,4],Guerrier:[0,2],Moine:[0,1],Paladin:[4,5],Rôdeur:[0,1],Roublard:[1,3],Ensorceleur:[2,5],Occultiste:[4,5],Magicien:[3,4],Artificier:[2,3]};
