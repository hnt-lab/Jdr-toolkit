
// ═══════════════════════════════════════
// STATE
// ═══════════════════════════════════════
const SK='dnd5e_v5';
let state={players:[],activeIdx:0,activeTab:'perso'};
const START_GOLD={Barbare:{dice:2,mult:10},Barde:{dice:5,mult:10},Clerc:{dice:5,mult:10},Druide:{dice:2,mult:10},Ensorceleur:{dice:3,mult:10},Guerrier:{dice:5,mult:10},Magicien:{dice:4,mult:10},Moine:{dice:5,mult:1},Occultiste:{dice:4,mult:10},Paladin:{dice:5,mult:10},Rôdeur:{dice:5,mult:10},Roublard:{dice:4,mult:10},Artificier:{dice:5,mult:10}};
function rollStartGold(){const sg=START_GOLD[CS.classe];if(!sg)return;let t=0;for(let i=0;i<sg.dice;i++)t+=Math.ceil(Math.random()*4);CS.rolledGold=t*sg.mult;CS.bought=[];renderTab();}
let CS={step:1,race:null,classe:null,archetype:null,combatStyle:null,statMethod:'pointbuy',baseStats:[8,8,8,8,8,8],background:null,selectedSkills:[],selectedSpells:[],equipChoice:0,goldMode:false,rolledGold:0,charName:'',alignment:'',diceRolls:null,draconicAncestry:null,flexSet:0,flexChoices:[],bought:[]};
function resetCS(){CS={step:1,race:null,classe:null,archetype:null,combatStyle:null,statMethod:'pointbuy',baseStats:[8,8,8,8,8,8],background:null,selectedSkills:[],selectedSpells:[],equipChoice:0,goldMode:false,rolledGold:0,charName:'',alignment:'',diceRolls:null,draconicAncestry:null,flexSet:0,flexChoices:[],bought:[]};}

// Descriptions des capacités par nom (source SRD aidedd)
const FEAT_DESCS={
  // ── BARBARE ──
  "Rage (2 utilisations, +2 dégâts)":"Action bonus : entrer en rage. Avantage aux jets de FOR et JS FOR. +2 dégâts aux attaques au corps à corps (FOR). Résistance dégâts contondants, perforants, tranchants. Dure 1 min. 2 utilisations/repos long.",
  "Défense sans armure (CA = 10+DEX+CON)":"Sans armure, ta CA = 10 + mod DEX + mod CON. Compatible avec un bouclier.",
  "Attaque téméraire (avantage attaque FOR, mais attaquants aussi)":"Lors de ta première attaque du tour, tu peux attaquer téméraire : avantage aux jets d'attaque corps à corps (FOR) ce tour, mais les attaques contre toi ont aussi avantage jusqu'à ton prochain tour.",
  "Sens du danger (avantage JS DEX vs pièges/sorts/effets visibles)":"Avantage aux JS DEX contre les effets que tu peux voir (pièges, sorts…). Pas d'application si tu es aveuglé, sourd ou incapable d'agir.",
  "Attaque supplémentaire (2 attaques)":"Tu peux attaquer deux fois lorsque tu prends l'action Attaquer.",
  "Déplacement rapide (+3m sans armure lourde)":"Ta vitesse augmente de 3m si tu ne portes pas d'armure lourde.",
  "Instinct sauvage (avantage Initiative, peut rager si surpris)":"Avantage aux jets d'initiative. Si surpris en début de combat, tu peux entrer en rage au premier tour (mais aucune autre action).",
  "Critique brutal (1 dé de dégâts sup. sur critique)":"Lors d'un coup critique au corps à corps, tu lances 1 dé de dégâts supplémentaire. Passe à 2 au niv.13, 3 au niv.17.",
  "Rage implacable (JS CON DD10 si tombe à 0 PV en rage → 1 PV)":"Si tu tombes à 0 PV en rage sans mourir sur le coup, tu peux faire un JS de CON DD 10 : réussite = tu retombes à 1 PV. Chaque nouvelle utilisation augmente le DD de 5 ; il retombe à 10 après un repos court ou long.",
  "Rage persistante (reste en rage si plus d'actions hostiles, sauf si inconscient)":"Ta rage ne s'arrête plus automatiquement si tu n'as pas attaqué ni subi de dégâts. Elle ne prend fin que si tu tombes inconscient ou si tu choisis d'y mettre fin.",
  "Puissance indomptable (utiliser FOR min. = résultat de dé si inférieur)":"Si ton jet de Force est inférieur à ta valeur de Force, tu peux utiliser ta valeur à la place.",
  "Champion primitif (+4 FOR et CON, max 24)":"Tes scores de Force et de Constitution augmentent de 4. Leur maximum est 24.",
  "Voie primitive (choix)":"Tu choisis ta Voie primitive (Berserker ou Guerrier totem) qui définit tes capacités de rage avancées.",
  "Capacité de la voie":"Tu gagnes une nouvelle capacité de ta Voie primitive (Berserker, Guerrier totem, ou Magie sauvage).",
  "3 rages":"Tu disposes maintenant de 3 utilisations de Rage par repos long.",
  "4 rages":"Tu disposes maintenant de 4 utilisations de Rage par repos long.",
  "5 rages":"Tu disposes maintenant de 5 utilisations de Rage par repos long.",
  "6 rages":"Tu disposes maintenant de 6 utilisations de Rage par repos long.",
  "Rages illimitées":"Tu peux entrer en rage un nombre illimité de fois.",
  "Critique brutal (2 dés sup.)":"En coup critique au corps à corps, tu lances 2 dés de dégâts supplémentaires.",
  "Critique brutal (3 dés sup.)":"En coup critique au corps à corps, tu lances 3 dés de dégâts supplémentaires.",
  "Bonus dégâts rage: +3":"Ton bonus de dégâts en Rage passe à +3.",
  "Bonus dégâts rage: +4":"Ton bonus de dégâts en Rage passe à +4.",
  // ── GUERRIER ──
  "Style de combat (choix)":"Tu choisis un style de combat (Archerie, Défense, Duel, Arme à deux mains, Combat à deux armes, Protection) qui t'accorde un bonus permanent.",
  "Second souffle (1/repos court)":"Action bonus : regagne 1d10 + niveau du guerrier PV. 1 utilisation/repos court.",
  "Fougue (1/repos court) — action supplémentaire":"À ton tour : une action SUPPLÉMENTAIRE en plus de ton action normale et de ton éventuelle action bonus. 1 utilisation/repos court.",
  "Fougue (2/repos court) — action supplémentaire":"Tu peux utiliser Fougue 2 fois entre deux repos, mais une seule fois par tour.",
  "Attaque supplémentaire (2 attaques par action)":"Tu peux attaquer deux fois lorsque tu prends l'action Attaquer.",
  "Attaque supplémentaire (3 attaques)":"Tu peux attaquer trois fois lorsque tu prends l'action Attaquer.",
  "Attaque supplémentaire (4 attaques)":"Tu peux attaquer quatre fois lorsque tu prends l'action Attaquer.",
  "Inflexible (1/repos long) — relancer un JS raté":"Tu peux relancer un jet de sauvegarde raté. Tu dois utiliser le nouveau résultat. 1 utilisation/repos long.",
  "Inflexible (2/repos long)":"Tu peux utiliser Inflexible 2 fois par repos long.",
  "Inflexible (3/repos long)":"Tu peux utiliser Inflexible 3 fois par repos long.",
  "Archétype martial (choix)":"Tu choisis ton archétype martial (Champion, Maître de guerre, Chevalier occulte) qui définit ta spécialisation.",
  "Capacité de l'archétype":"Tu gagnes une nouvelle capacité de ton archétype martial.",
  "Amélioration de caractéristiques":"Augmente une caractéristique de 2, ou deux caractéristiques de 1 chacune. Aucune ne peut dépasser 20 (sauf capacité spéciale).",
  // ── ROUBLARD ──
  "Attaque sournoise (1d6)":"1×/tour : 1d6 dégâts supplémentaires si tu as l'avantage OU si un allié est à 1,5m de la cible (et que tu n'as pas de désavantage). Arme de finesse ou à distance. Progresse de +1d6 tous les 2 niveaux.",
  "Attaque sournoise (2d6)":"Tes dés d'Attaque sournoise passent à 2d6.",
  "Attaque sournoise (3d6)":"Tes dés de roublardise passent à 3d6.",
  "Attaque sournoise (4d6)":"Tes dés de roublardise passent à 4d6.",
  "Attaque sournoise (5d6)":"Tes dés de roublardise passent à 5d6.",
  "Attaque sournoise (6d6)":"Tes dés de roublardise passent à 6d6.",
  "Attaque sournoise (7d6)":"Tes dés de roublardise passent à 7d6.",
  "Attaque sournoise (8d6)":"Tes dés de roublardise passent à 8d6.",
  "Attaque sournoise (9d6)":"Tes dés de roublardise passent à 9d6.",
  "Attaque sournoise (10d6)":"Tes dés de roublardise passent à 10d6.",
  "Attaque sournoise (11d6)":"Tes dés de roublardise passent à 11d6.",
  "Attaque sournoise (12d6)":"Tes dés de roublardise passent à 12d6.",
  "Expertise (2 compétences ×2 maîtrise)":"Doublement du bonus de maîtrise pour 2 compétences de ton choix parmi celles que tu maîtrises.",
  "Argot des voleurs":"Tu connais l'argot des voleurs, langue secrète utilisée par les criminels.",
  "Ruse (action bonus: Foncer/Désengager/Se cacher)":"Action bonus à chacun de tes tours : Foncer, Se désengager ou Se cacher.",
  "Archétype (choix)":"Tu choisis ton archétype de roublard (Voleur, Assassin, Escroc arcanique ou Conspirateur).",
  "Esquive totale":"Si un effet permet un JS DEX pour moitié dégâts, tu n'en subis aucun en cas de succès (et seulement moitié en cas d'échec).",
  "Esquive":"Action pour esquiver : toutes les attaques contre toi ont désavantage jusqu'à ton prochain tour.",
  "Expertise (2 autres compétences)":"Doublement du bonus de maîtrise pour 2 compétences supplémentaires.",
  "Talent fiable":"Pour tout jet de caractéristique utilisant une compétence maîtrisée, un résultat de 9 ou moins au d20 compte comme 10.",
  "Esprit fuyant":"Tu gagnes la maîtrise des jets de sauvegarde de Sagesse.",
  "Insaisissable":"Aucun jet d'attaque n'a l'avantage contre toi tant que tu n'es pas neutralisé.",
  "Coup de chance":"Si ton attaque rate une cible à portée, tu peux la transformer en succès. Si tu rates un jet de caractéristique, tu peux traiter le d20 comme un 20. 1 utilisation/repos court ou long.",
  "Amélioration archétype":"Tu gagnes une nouvelle capacité de ton archétype de roublard.",
  "Capacité archétype":"Tu gagnes une capacité avancée de ton archétype de roublard.",
  // ── PALADIN ──
  "Sens divin":"Action : détecte célestes, fiélons et morts-vivants dans un rayon de 18m, à travers la plupart des matières, pendant 1 tour. CHA+1 utilisations/repos long.",
  "Imposition des mains (niv×5 PV)":"Réservoir de PV = niv×5. Toucher : soigne le nombre de PV voulu depuis la réserve, ou dépense 5 PV pour neutraliser une maladie ou un poison.",
  "Frappe divine":"Quand tu touches avec une arme de corps à corps, tu peux dépenser un emplacement de sort pour ajouter 2d8 dégâts radiants (+1d8/niveau au-dessus du 1er). Action bonus.",
  "Frappe divine (2d8)":"Ta Frappe divine inflige 2d8 dégâts radiants de base.",
  "Frappe divine (3d8)":"Ta Frappe divine inflige 3d8 dégâts radiants de base.",
  "Frappe divine améliorée (4d8)":"Ta Frappe divine inflige 4d8 dégâts radiants de base.",
  "Frappe divine (5d8)":"Ta Frappe divine inflige 5d8 dégâts radiants de base.",
  "Frappe divine (6d8)":"Ta Frappe divine inflige 6d8 dégâts radiants de base.",
  "Santé divine":"Immunité aux maladies.",
  "Serment sacré (choix)":"Tu prêtes ton Serment sacré (Dévotion, Anciens, Vengeance) qui définit tes sorts et capacités de Conduit.",
  "Conduit divin (2 options)":"Tu peux utiliser le Conduit divin avec les deux options de ton serment.",
  "Attaque supplémentaire":"Tu peux attaquer deux fois lorsque tu prends l'action Attaquer.",
  "Aura de protection (+CHA aux JS, 3m)":"Toi et les alliés à 3m ajoutez ton bonus de Charisme aux jets de sauvegarde (si non négatif). Rayon de 9m au niv.18.",
  "Aura du courage (immunité peur, 3m)":"Toi et les alliés à 3m ne pouvez pas être effrayés. Rayon de 9m au niv.18.",
  "Aura des sorts (rayons des auras: 9m)":"Les rayons de tes auras (Protection et Courage) passent à 9m.",
  "Purification du toucher (neutralise venin/maladie)":"Dépense 5 PV de l'imposition des mains pour neutraliser une maladie ou un poison affectant la cible.",
  "Capacité du serment":"Tu gagnes une nouvelle capacité de ton Serment sacré.",
  "Champion sacré (transformation 1min/repos long)":"Action : transformation divine 1 minute. Avantage aux attaques, alliés ont avantage aux sauvegardes, soins au début de ton tour.",
  "Style de combat":"Tu choisis un style de combat qui t'accorde un bonus permanent (voir guerrier).",
  "Incantation":"Tu peux lancer des sorts de ta classe. Utilisateur de sorts préparés (SAG ou CHA selon la classe).",
  // ── CLERC ──
  "Conduit divin (1 utilisations)":"Canalise l'énergie divine pour alimenter des effets magiques. 1 utilisation/repos court. Inclut Renvoi des morts-vivants (action : morts-vivants à 9m, JS SAG ou fuis 1 min).",
  "Conduit divin (2 utilisations)":"Tu peux utiliser le Conduit divin 2 fois par repos court.",
  "Conduit divin (3 utilisations)":"Tu peux utiliser le Conduit divin 3 fois par repos court.",
  "Conduit divin : Renvoi des morts-vivants":"Action : les morts-vivants à 9m ratant leur JS SAG fuient pendant 1 minute.",
  "Capacités du domaine divin":"Tu reçois les capacités spéciales de ton domaine divin choisi (Vie, Lumière, Nature, Tempête, Duperie, Guerre, Savoir, Forge).",
  "Capacité du domaine (Conduit divin)":"Tu peux utiliser une option de Conduit divin propre à ton domaine.",
  "Capacité du domaine":"Tu gagnes une nouvelle capacité de ton domaine divin.",
  "Sorts du domaine niv.2":"Tu prépares automatiquement les sorts de domaine de niveau 2.",
  "Sorts du domaine niv.3":"Tu prépares automatiquement les sorts de domaine de niveau 3.",
  "Sorts du domaine niv.4":"Tu prépares automatiquement les sorts de domaine de niveau 4.",
  "Sorts du domaine niv.5":"Tu prépares automatiquement les sorts de domaine de niveau 5.",
  "Sorts du domaine niv.7":"Tu prépares automatiquement les sorts de domaine de niveau 7.",
  "Sorts du domaine niv.8":"Tu prépares automatiquement les sorts de domaine de niveau 8.",
  "Sorts du domaine niv.9":"Tu prépares automatiquement les sorts de domaine de niveau 9.",
  "Destruction des morts-vivants (FP 1/2)":"Lors du Renvoi des morts-vivants, tu détruis instantanément les morts-vivants de FP ≤ 1/2 qui ratent leur JS, au lieu de les faire fuir.",
  "Destruction des morts-vivants (FP 1)":"Lors du Renvoi, tu détruis les morts-vivants de FP ≤ 1 qui ratent leur JS.",
  "Destruction des morts-vivants (FP 2)":"Lors du Renvoi, tu détruis les morts-vivants de FP ≤ 2 qui ratent leur JS.",
  "Destruction des morts-vivants (FP 3)":"Lors du Renvoi, tu détruis les morts-vivants de FP ≤ 3 qui ratent leur JS.",
  "Destruction des morts-vivants (FP 4)":"Lors du Renvoi, tu détruis les morts-vivants de FP ≤ 4 qui ratent leur JS.",
  "Intervention divine":"Action : décris l'aide voulue et lance 1d100. Si le résultat est ≤ ton niveau de clerc, ta divinité intervient (effet choisi par le MJ, ex. un sort de clerc). Succès → réutilisable après 7 jours ; échec → après un repos long.",
  "Intervention divine améliorée (succès automatique)":"L'Intervention divine réussit automatiquement.",
  // ── DRUIDE ──
  "Druidique":"Tu connais le druidique, le langage secret des druides. Tu repères automatiquement les messages secrets qu'il dissimule ; les autres doivent réussir un jet de Sagesse (Perception) DD 15 et ne peuvent pas les déchiffrer sans magie.",
  "Forme sauvage (CR 1/4, pas nage/vol)":"Action : transformation en bête de CR ≤ 1/4, sans nage ni vol. 2 fois/repos court. Dure niv/2 heures max.",
  "Forme sauvage améliorée (CR 1/2 nage)":"Forme sauvage : CR ≤ 1/2, les bêtes nageuses sont autorisées.",
  "Forme sauvage (CR 1, vol)":"Forme sauvage : CR ≤ 1, plus aucune restriction (les bêtes volantes sont autorisées).",
  "Cercle druidique (choix)":"Tu rejoins un Cercle druidique (Lune ou Terre) qui définit tes capacités avancées.",
  "Frappe primitive":"Cercle de la lune niv.6 — En forme animale, tes attaques sont considérées comme magiques. Elles ignorent les résistances et immunités aux dégâts non magiques.",
  "Forme sauvage élémentaire":"Cercle de la lune niv.10 — Tu peux dépenser 2 utilisations de Forme sauvage en même temps pour te transformer en élémentaire de l'air, de l'eau, de la terre ou du feu.",
  "Mille formes":"Cercle de la lune niv.14 — Tu peux lancer Modification d'apparence à volonté.",
  "Foulée tellurique":"Cercle de la terre niv.6 — Les terrains difficiles non-magiques ne te coûtent pas de déplacement supplémentaire, et tu traverses la végétation non magique (épines, pointes…) sans dégâts. Avantage aux JS contre les plantes magiques qui gênent le mouvement.",
  "Protégé de dame Nature":"Cercle de la terre niv.10 — Tu ne peux être ni charmé ni effrayé par les élémentaires et les fées, et tu es immunisé contre le poison et les maladies.",
  "Sanctuaire de dame Nature":"Cercle de la terre niv.14 — Quand une bête ou une plante t'attaque, elle doit réussir un JS de Sagesse contre ton DD de sort de druide, sinon elle choisit une autre cible (réussite = immunisée 24 h).",
  "Récupération naturelle":"Cercle de la terre niv.2 — Une fois par repos long, lors d'un repos court, tu récupères des emplacements de sorts dont le total de niveaux est ≤ à la moitié de ton niveau de druide (arrondi au supérieur, aucun emplacement de niv.6+).",
  "Sorts du cercle niv.2":"Tu prépares automatiquement les sorts de ton Cercle de niveau 2.",
  "Sorts du cercle niv.3":"Tu prépares automatiquement les sorts de ton Cercle de niveau 3.",
  "Sorts du cercle niv.4":"Tu prépares automatiquement les sorts de ton Cercle de niveau 4.",
  "Sorts du cercle niv.5":"Tu prépares automatiquement les sorts de ton Cercle de niveau 5.",
  "Capacité du cercle":"Tu gagnes une nouvelle capacité de ton Cercle druidique.",
  "Jeunesse éternelle (vieillissement ×10)":"La magie primordiale ralentit ton vieillissement : tu ne prends qu'un an d'âge toutes les dix années écoulées.",
  "Incantation animale":"En Forme sauvage, tu peux lancer tes sorts de druide (composantes verbale et somatique uniquement — pas de composante matérielle).",
  "Accès aux emplacements de sorts de niveau 6":"Tu débloques des emplacements de sorts de niveau 6. En tant que Druide préparé, tu peux préparer n'importe quel sort Druide de niveau 6 lors d'un repos long.",
  "Accès aux emplacements de sorts de niveau 7":"Tu débloques des emplacements de sorts de niveau 7. En tant que Druide préparé, tu peux préparer n'importe quel sort Druide de niveau 7 lors d'un repos long.",
  "Accès aux emplacements de sorts de niveau 8":"Tu débloques des emplacements de sorts de niveau 8. En tant que Druide préparé, tu peux préparer n'importe quel sort Druide de niveau 8 lors d'un repos long.",
  "Accès aux emplacements de sorts de niveau 9":"Tu débloques des emplacements de sorts de niveau 9. En tant que Druide préparé, tu peux préparer n'importe quel sort Druide de niveau 9 lors d'un repos long.",
  "Archidruide (Forme sauvage illimitée)":"Tu peux utiliser la Forme sauvage un nombre illimité de fois.",
  // ── BARDE ──
  "Incantation":"Tu peux lancer des sorts en utilisant CHA comme modificateur de sort.",
  "Inspiration bardique (1d6, CHA fois/repos long)":"Action bonus : accorde 1d6 d'inspiration bardique à un allié à 18m qui peut t'entendre. Il peut l'ajouter à un jet d'attaque, de caractéristique ou de sauvegarde dans les 10 minutes (après le jet, avant le verdict). CHA utilisations (min 1)/repos long.",
  "Touche-à-tout":"Moitié du bonus de maîtrise (arrondi inférieur) pour les jets de compétence où tu n'as pas la maîtrise.",
  "Chant reposant (1d6)":"Lors d'un repos court, tes alliés qui entendent ta musique regagnent 1d6 PV supplémentaires en dépensant leurs dés de vie.",
  "Chant reposant (1d8)":"Tes alliés regagnent 1d8 PV supplémentaires avec le Chant reposant.",
  "Chant reposant (1d10)":"Tes alliés regagnent 1d10 PV supplémentaires avec le Chant reposant.",
  "Chant reposant (1d12)":"Tes alliés regagnent 1d12 PV supplémentaires avec le Chant reposant.",
  "Collège bardique (choix)":"Tu rejoins un Collège bardique (Savoir ou Vaillance) qui définit tes capacités avancées.",
  "Expertise (2 compétences ×2 maîtrise)":"Doublement du bonus de maîtrise pour 2 compétences de ton choix parmi celles que tu maîtrises.",
  "Expertise (2 autres compétences)":"Doublement du bonus de maîtrise pour 2 compétences supplémentaires.",
  "Contre-charme":"Action : tu commences une représentation jusqu'à la fin de ton prochain tour. Toi et les alliés à 9m qui t'entendent avez l'avantage aux JS contre le charme et la peur. Prend fin si tu es neutralisé ou réduit au silence.",
  "Secrets magiques (2 sorts)":"Tu apprends 2 sorts de n'importe quelle classe. Ils comptent comme des sorts de barde.",
  "Secrets magiques (2 sorts supp.)":"Tu apprends 2 sorts supplémentaires de n'importe quelle classe.",
  "Inspiration bardique (1d8)":"Ton dé d'Inspiration bardique passe à 1d8.",
  "Inspiration bardique (1d10)":"Ton dé d'Inspiration bardique passe à 1d10.",
  "Inspiration bardique (1d12)":"Ton dé d'Inspiration bardique passe à 1d12.",
  "Source d'inspiration (repos court)":"Tu récupères tes utilisations d'Inspiration bardique au repos court au lieu du repos long.",
  "Inspiration bardique (CHA/repos court)":"Tu récupères tes utilisations d'Inspiration bardique au repos court.",
  "Magie supérieure (2 sorts supplémentaires)":"Tu apprends 2 sorts supplémentaires de n'importe quelle classe.",
  "Inspiration supérieure (min 1 dé si 0)":"Quand tu lances l'initiative sans plus aucune Inspiration bardique, tu en regagnes une utilisation.",
  "Capacité du collège":"Tu gagnes une nouvelle capacité de ton Collège bardique.",
  // ── MOINE ──
  "Arts martiaux (1d4)":"Sans armure ni bouclier : attaque à mains nues = 1d4 + DEX ou FOR. Après l'action Attaquer, attaque bonus à mains nues. Les attaques à mains nues sont des armes de moine.",
  "Arts martiaux 1d6":"Tes attaques à mains nues infligent 1d6 dégâts.",
  "Arts martiaux 1d8":"Tes attaques à mains nues infligent 1d8 dégâts.",
  "Arts martiaux 1d10":"Tes attaques à mains nues infligent 1d10 dégâts.",
  "Défense sans armure (CA=10+DEX+SAG)":"Sans armure ni bouclier, ta CA = 10 + mod DEX + mod SAG.",
  "Ki (2 pts)":"Points de ki = niveau de moine. Récupérés au repos court/long (30 min de méditation). DD ki = 8 + maîtrise + SAG. Techniques de départ : Déluge de coups (1 ki, action bonus : 2 attaques à mains nues après Attaquer), Défense patiente (1 ki, action bonus : Esquiver), Déplacement aérien (1 ki, action bonus : Se désengager ou Foncer + saut doublé).",
  "Déplacement rapide (+3m)":"Ta vitesse augmente de 3m si tu ne portes pas d'armure ni bouclier.",
  "Tradition monastique (choix)":"Tu choisis ta Tradition monastique (Main ouverte, Ombre, Quatre éléments) qui définit tes capacités avancées.",
  "Parade de projectiles":"Réaction : réduire les dégâts d'un projectile de 1d10 + DEX + niveau. Si réduit à 0, tu peux le renvoyer.",
  "Dégâts de ki 1d4":"Tes attaques de ki infligent des dégâts supplémentaires.",
  "Chute ralentie":"Réaction : réduire les dégâts de chute d'un montant égal à 5 × ton niveau de moine.",
  "Attaque supplémentaire":"Tu peux attaquer deux fois lorsque tu prends l'action Attaquer.",
  "Déluge de coups amélioré":"Ton Déluge de coups est maintenant plus efficace.",
  "Frappes ki (magie)":"Tes attaques à mains nues sont considérées comme magiques pour contourner les résistances.",
  "Déplacement 1 (capacité monastique)":"Tu gagnes une capacité de déplacement de ta Tradition monastique.",
  "Évasion":"JS DEX réussi contre un effet = 0 dégâts. JS raté = moitié.",
  "Esquive totale":"JS DEX réussi contre un effet = 0 dégâts. JS raté = moitié.",
  "Quiétude de l'esprit":"Action : mettre fin à un effet de charme ou de peur qui t'affecte.",
  "Déplacement rapide amélioré":"Ta vitesse de déplacement augmente encore.",
  "Pureté physique":"Immunité aux maladies et aux poisons.",
  "Langue du soleil et de la lune":"Tu comprends toutes les créatures parlantes et elles te comprennent.",
  "Âme de diamant (JS tous maîtrisés)":"Maîtrise de tous les jets de sauvegarde. Si tu rates l'un d'eux, tu peux dépenser 1 point de ki pour le relancer.",
  "Jeunesse éternelle (ne vieillit plus, n'a plus besoin de manger ni boire)":"Ton ki te sustente : tu ne subis plus les affres de la vieillesse, ne peux plus être vieilli par magie et n'as plus besoin de manger ni de boire.",
  "Désertion de l'âme (4 ki : invisible 1 min + résistance tous dégâts sauf force)":"Action, 4 points de ki : invisible pendant 1 minute, avec résistance à tous les dégâts sauf ceux de force. En dépensant 8 points de ki, tu peux aussi lancer Projection astrale sur toi-même.",
  "Perfection de l'être (regagne 4 pts de ki si à 0 à l'initiative)":"Quand tu lances ton initiative sans plus aucun point de ki, tu en regagnes 4.",
  "Capacité de déplacement 1 (capacité monastique)":"Tu gagnes une capacité avancée de ta Tradition monastique.",
  "Capacité monastique":"Tu gagnes une nouvelle capacité de ta Tradition monastique.",
  "Déplacement 1 (capacité monastique)":"Tu gagnes une capacité de ta tradition monastique.",
  // ── RÔDEUR ──
  "Ennemi juré (1 type)":"Choisis un type d'ennemi juré (ou 2 races d'humanoïdes) : avantage aux jets de Sagesse (Survie) pour le pister et aux jets d'Intelligence pour se souvenir d'informations sur lui. Tu apprends une de ses langues.",
  "Ennemi juré (2 types)":"Tu choisis un 2ᵉ type d'ennemi juré (+ une langue associée).",
  "Ennemi juré (3 types)":"Tu choisis un 3ᵉ type d'ennemi juré (+ une langue associée).",
  "Explorateur-né (1 terrain)":"Choisis un terrain favori : bonus de maîtrise doublé pour les jets INT/SAG de compétences maîtrisées liés à ce terrain. En voyage : terrain difficile sans ralentir le groupe, jamais perdu (sauf magie), alerte même occupé, furtif seul à allure normale, nourriture ×2, pistage précis (nombre, tailles, ancienneté).",
  "Explorateur-né (2 terrains)":"Tu choisis un 2ᵉ terrain favori.",
  "Explorateur-né (3 terrains)":"Tu choisis un 3ᵉ terrain favori.",
  "Vigilance primitive":"Action + dépense d'un emplacement de sort : pendant 1 min/niveau d'emplacement, tu sens la présence (sans position ni nombre) des aberrations, célestes, dragons, élémentaires, fées, fiélons et morts-vivants à 1,5 km (9 km dans ton terrain favori).",
  "Archétype (choix)":"Tu choisis ton archétype de rôdeur (Chasseur, Maître des bêtes ou Gardien de drake).",
  "Capacité de l'archétype de rôdeur":"Tu gagnes une nouvelle capacité de ton archétype de rôdeur.",
  "Attaque supplémentaire":"Tu peux attaquer deux fois lorsque tu prends l'action Attaquer.",
  "Camouflage naturel":"1 minute + matériaux naturels (boue, plantes, suie…) : +10 aux jets de Dextérité (Discrétion) tant que tu restes immobile contre une surface solide. À refaire après tout déplacement ou action.",
  "Disparition":"Tu peux utiliser l'action Se cacher en action bonus. Tu ne peux pas être pisté par des moyens non magiques, sauf si tu le choisis.",
  "Sens sauvages":"Attaquer une créature que tu ne vois pas ne t'impose pas de désavantage. Tu connais la position des créatures invisibles à 9m (si elles ne sont pas cachées et que tu n'es ni aveuglé ni assourdi).",
  "Tueur implacable":"1×/tour : ajoute ton modificateur de Sagesse au jet d'attaque OU de dégâts d'une attaque contre un ennemi juré (avant ou après le jet, avant les effets).",
  "Style de combat":"Tu choisis un style de combat qui t'accorde un bonus permanent.",
  // ── ENSORCELEUR ──
  "Incantation":"Tu peux lancer des sorts en utilisant CHA comme modificateur de sort.",
  "Origine d'ensorceleur (choix) — capacité immédiate selon l'origine":"Tu choisis ton Lignée draconique qui t'accorde des capacités innées dès le niveau 1.",
  "Points de sorcellerie (2 pts)":"Points de sorcellerie = niveau. Servent à la Magie flexible et à la Métamagie.",
  "Magie flexible (convertir emplacements↔points de sorcellerie)":"Dépense des emplacements de sorts pour gagner des points de sorcellerie (niv×1) ou vice versa (créer un emplacement niv1=2pts, niv2=3pts, niv3=5pts, niv4=6pts, niv5=7pts).",
  "Métamagie (2 options au choix)":"Tu choisis 2 options de Métamagie pour modifier tes sorts en dépensant des points de sorcellerie.",
  "Métamagie (3e option)":"Tu choisis une 3e option de Métamagie.",
  "Métamagie (4e option)":"Tu choisis une 4e option de Métamagie.",
  "Capacité de l'origine (niv.6)":"Tu gagnes la capacité de niveau 6 de ton Lignée draconique.",
  "Capacité de l'origine (niv.14)":"Tu gagnes la capacité de niveau 14 de ton Lignée draconique.",
  "Capacité de l'origine (niv.18)":"Tu gagnes la capacité de niveau 18 de ton Lignée draconique.",
  "Restauration ensorcelée (repos court : +4 pts de sorcellerie)":"À chaque repos court terminé, tu regagnes 4 points de sorcellerie dépensés.",
  // ── OCCULTISTE ──
  "Mécène d'outremonde (choix)":"Tu choisis ton Mécène (Archéfée, Grand Ancien, Fiélon) qui définit tes sorts et capacités.",
  "Magie de pacte (1 emplacement niv.1)":"Tu lances des sorts via des emplacements récupérés au repos court. Niveau des emplacements = ceil(niv/2).",
  "Invocations occultes (1)":"Tu choisis 1 invocation occulte parmi celles disponibles. Tu en ajoutes au fil des niveaux.",
  "Invocations occultes (2 total)":"Tu as maintenant 2 invocations occultes actives.",
  "Invocations occultes (3 total)":"Tu as maintenant 3 invocations occultes actives.",
  "Invocations occultes (4 total)":"Tu as maintenant 4 invocations occultes actives.",
  "Invocations occultes (5 total)":"Tu as maintenant 5 invocations occultes actives.",
  "Invocations occultes (6 total)":"Tu as maintenant 6 invocations occultes actives.",
  "Invocations occultes (7 total)":"Tu as maintenant 7 invocations occultes actives.",
  "Invocations occultes (8 total)":"Tu as maintenant 8 invocations occultes actives.",
  "Pacte (choix: Chaîne/Lame/Livre)":"Bénédiction du mécène niv.3 : Chaîne (familier spécial), Lame (arme de pacte), Livre (Livre des ombres : 3 cantrips supplémentaires).",
  "Arcanum mystique niv.6":"Tu peux lancer un sort de niveau 6 de ta liste une fois par repos long sans emplacement.",
  "Arcanum mystique niv.7":"Tu peux lancer un sort de niveau 7 de ta liste une fois par repos long sans emplacement.",
  "Arcanum mystique niv.8":"Tu peux lancer un sort de niveau 8 de ta liste une fois par repos long sans emplacement.",
  "Arcanum mystique niv.9":"Tu peux lancer un sort de niveau 9 de ta liste une fois par repos long sans emplacement.",
  "Maître ténébreux (CHA fois/repos long : récup. tous emplacements)":"Action : récupère tous tes emplacements de pacte. CHA fois/repos long.",
  // ── MAGICIEN ──
  "Incantation (grimoire: 6 sorts niv.1 + 3 mineurs)":"Tu apprends la magie via un grimoire. Tu prépares des sorts en utilisant INT. Grimoire : 6 sorts niv.1 + 3 sorts mineurs.",
  "Restauration arcanique (1/repos court)":"1 fois/repos court : récupère des emplacements de sorts de niveaux totaux ≤ niv/2 (arrondi sup). Aucun au-dessus du niv.5.",
  "Tradition arcanique (choix)":"Tu rejoins une Tradition arcanique (école de magie) qui définit ta spécialisation.",
  "Capacité de la tradition":"Tu gagnes une nouvelle capacité de ta Tradition arcanique.",
  "Maîtrise des sorts (lancer niv.1-2 sans emplacement)":"Tu peux lancer n'importe quel sort niv.1 ou 2 que tu as préparé sans dépenser d'emplacement. Chaque sort peut être lancé gratuitement une fois entre deux repos longs.",
  "Sorts de prédilection (2 sorts préparés qui ne comptent pas)":"Choisis 2 sorts de ton grimoire. Ils sont toujours préparés et ne comptent pas dans ta limite de sorts préparés.",
};

function getFeatDesc(name){
  if(FEAT_DESCS[name])return FEAT_DESCS[name];
  // Recherche partielle
  const key=Object.keys(FEAT_DESCS).find(k=>name.includes(k.split(' ')[0])&&name.includes(k.split(' ')[1]||''));
  return key?FEAT_DESCS[key]:'Description non disponible dans le SRD. Consulter aidedd.org/regles/classes/ pour les détails complets.';
}
function filterDescByLevel(desc,classLvl){
  if(!desc)return'';
  return desc.split('. ').filter(part=>{const m=part.match(/niv\.(\d+)/);return!m||parseInt(m[1])<=classLvl;}).join('. ');
}
// Capacités purement de compteur/UI, déjà affichées ailleurs — exclure des features
const FEAT_EXCLUDE=[
  'Amélioration de caractéristiques',
  'Points de sorcellerie','Magie flexible',
  'Source d\'inspiration',
  'Magie de pacte',
  'Invocations occultes',        // compteur géré dans combat
  'Pacte (choix',                // choix narratif, pas de desc utile
  '1 sort mineur supplémentaire', // vague
  '2 sorts niv.',                 // entrées de grimoire magicien
  'Capacité du domaine',          // générique Clerc — remplacé par la vraie capacité
  'Capacité du serment sacré',    // générique Paladin
  'Capacité de la tradition monastique', // générique Moine
  'Capacité du spécialiste',      // générique Artificier
  'Sorts du spécialiste',         // Artificier, même logique que Sorts du cercle
  'Infusions',                    // compteur géré dans combat
  'Accès aux emplacements',       // info de slot Druide, purement mécanique
  // Barbare — compteurs redondants (affichés dans le panneau Combat)
  '2 rages','3 rages','4 rages','5 rages','6 rages','Rages illimitées',
  'Bonus dégâts rage',
  // Sorts — couvert par l'onglet Sorts
  'Incantation',
];
function isFeatExcluded(name){return FEAT_EXCLUDE.some(ex=>name.startsWith(ex)||name===ex||name.includes(ex));}  

function getLevel1Features(className){
  const cd=CLASS_LEVEL_DATA[className];
  if(!cd)return[];
  const feats=cd.levelFeatures[1]||[];
  return feats.filter(f=>f&&!isFeatExcluded(f)).map(f=>({name:f,desc:getFeatDesc(f),classe:className}));
}

// Génère les capacités gagnées à un niveau précis
function getLevelFeatures(className,level){
  const cd=CLASS_LEVEL_DATA[className];
  if(!cd)return[];
  const feats=cd.levelFeatures[level]||[];
  return feats.filter(f=>f&&!isFeatExcluded(f)).map(f=>({name:f,desc:getFeatDesc(f),classe:className}));
}

function defPlayer(name='Nouveau'){return{
  id:Date.now(),name,charName:'',classes:[],race:'',background:'',alignment:'',inspiration:false,
  abilities:[10,10,10,10,10,10],abilitiesLocked:false,
  hp:10,hpMax:10,hpTemp:0,ac:10,speed:9,
  deathSaves:{success:0,fail:0},
  skillProf:{},skillsLocked:{},
  equip:{},inventory:[],
  weaponProfs:[],armorProfs:[],// maîtrises d'armes/armures
  currency:{pc:0,pa:0,pe:0,po:0,pp:0},
  spells:[],spellsLocked:false,spellSlotsUsed:[],
  features:[],combatCharges:{},// charges pour les capacités de combat
  proficiencies:'',languages:'Commun',
  statuses:[],// [{name,type,value,desc}]
  xp:0,portrait:null,traits:'',ideals:'',bonds:'',flaws:'',backstory:'',
  pendingLevelUp:false,created:false
};}

// Principe #4 — « texte générique = bug » : remplace les capacités d'archétype génériques
// (« Capacité de la voie », etc.) par les VRAIES capacités de l'archétype choisi, sinon supprime l'entrée.
const _GENERIC_FEAT_NAMES=['Capacité de la voie','Capacité de la voie primitive',"Capacité de l'archétype","Capacité de l'archétype martial","Capacité de l'archétype de rôdeur",'Amélioration archétype',"Amélioration de l'archétype",'Capacité du domaine','Capacité du serment','Capacité du serment sacré','Capacité du cercle','Capacité du collège','Capacité monastique','Capacité de la tradition monastique','Capacité du spécialiste',"Capacité du patron d'Outremonde",'Capacité de la spécialité',"Capacité de la spécialité d'artificier"];
function _migrateGenericFeats(p){
  if(!p||!Array.isArray(p.features))return;
  // Retire les placeholders génériques s'il y en a, puis backfill SYSTÉMATIQUE (idempotent) :
  // répare aussi les persos dont l'archétype n'avait jamais reçu ses capacités (ex. bug clés Occultiste).
  p.features=p.features.filter(f=>!_GENERIC_FEAT_NAMES.includes(f.name)); // retire les placeholders
  if(typeof _ARCHETYPE_LEVEL_FEATS==='undefined')return;
  (p.classes||[]).forEach(c=>{
    const arch=(p.archetype||{})[c.name];if(!arch)return;
    const byLevel=(_ARCHETYPE_LEVEL_FEATS[c.name]||{})[arch];if(!byLevel)return;
    Object.keys(byLevel).forEach(lvl=>{
      if(+lvl<=(c.level||0)){const af=byLevel[lvl];if(af&&af.name&&!p.features.find(x=>x.name===af.name))p.features.push({name:af.name,desc:af.desc||'',classe:c.name});}
    });
  });
}
function migratePlayer(p){
  if(p.classe!==undefined&&!p.classes){p.classes=p.classe?[{name:p.classe,level:p.level||1}]:[];delete p.classe;delete p.level;}
  if(!p.classes)p.classes=[];
  if(p.created===undefined)p.created=p.classes.length>0;
  if(!p.skillsLocked)p.skillsLocked={};
  if(!p.statuses)p.statuses=[];
  if(!p.combatCharges)p.combatCharges={};
  if(!p.weaponProfs)p.weaponProfs=[];
  if(!p.armorProfs)p.armorProfs=[];
  // Migration nom officiel : sous-classe Ensorceleur « Origine draconique » → « Lignée draconique »
  if(Array.isArray(p.features))p.features.forEach(f=>{if(f&&f.name==='Origine draconique')f.name='Lignée draconique';});
  // Migration noms officiels Druide (audit RAW) : cercle + capacités renommés, descriptions rafraîchies
  if(Array.isArray(p.features))p.features.forEach(f=>{
    if(!f)return;
    if(f.name==='Cercle des terres')f.name='Cercle de la terre';
    if(f.name==='Protégée de dame Nature')f.name='Protégé de dame Nature';
    if(f.name==='Forme élémentaire')f.name='Forme sauvage élémentaire';
    if(f.name==='Protégé de dame Nature')f.desc='Tu ne peux être ni charmé ni effrayé par les élémentaires et les fées, et tu es immunisé contre le poison et les maladies.';
    if(f.name==='Forme sauvage élémentaire')f.desc="Tu peux dépenser 2 utilisations de Forme sauvage en même temps pour te transformer en élémentaire de l'air, de l'eau, de la terre ou du feu.";
    if(f.name==='Mille formes')f.desc="Tu peux lancer Modification d'apparence à volonté.";
    if((f.name==='Cercle de la terre'||f.name==='Cercle de la lune')&&typeof CLASS_LEVEL_DATA!=='undefined'){
      const _a=((CLASS_LEVEL_DATA['Druide']||{}).archetypes||[]).find(x=>x.name===f.name);
      if(_a)f.desc=_a.desc;
    }
  });
  if(p.archetype&&p.archetype['Druide']==='Cercle des terres')p.archetype['Druide']='Cercle de la terre';
  if(p.combatCharges&&p.combatCharges['FormeElementaire']!==undefined)delete p.combatCharges['FormeElementaire'];
  // Migration noms officiels Barde (audit RAW) : capacités de collège mal nommées
  if(Array.isArray(p.features))p.features.forEach(f=>{
    if(!f)return;
    if(f.name==='Maîtrise inégalée'){f.name='Compétence hors-pair';f.desc="Quand tu fais un jet de caractéristique, tu peux dépenser 1 inspiration bardique et ajouter le dé au résultat (après le jet, avant le verdict du MJ).";}
    if(f.name==='Inspiration de combat'){f.name='Attaque supplémentaire';f.desc="Tu peux attaquer deux fois, au lieu d'une, quand tu utilises l'action Attaquer.";}
    if(f.name==='Attaque magique'){f.name='Magie de combat';f.desc="Quand tu utilises ton action pour lancer un sort de barde, tu peux faire une attaque avec une arme en action bonus.";}
  });
  // Migration noms officiels Clerc (audit RAW) : domaine Duperie + capacités de domaine du LU corrigées
  if(Array.isArray(p.features))p.features.forEach(f=>{
    if(!f)return;
    if(f.name==='Domaine de la tromperie')f.name='Domaine de la duperie';
    // Guerre — l'ordre compte : l'ancienne « Frappe guidée » (niv.6, desc « avant de voir ») devient Bénédiction AVANT que « Maîtrise martiale » ne devienne Frappe guidée
    if(f.name==='Frappe guidée'&&f.desc&&f.desc.includes('avant de voir')){f.name='Bénédiction du dieu de la guerre';f.desc="Conduit divin, réaction : +10 au jet d'attaque d'une créature à 9m (après le jet, avant le verdict).";}
    if(f.name==='Maîtrise martiale'){f.name='Frappe guidée';f.desc="Conduit divin : +10 à TON jet d'attaque, décidé après avoir vu le jet mais avant le verdict du MJ.";}
    if(f.name==='Maîtrise des armures lourdes — Vie'){f.name='Préservation de la vie';f.desc='Conduit divin : action — distribue 5 × niveau de clerc PV entre des créatures à 9m (max ½ de leur max ; sans effet sur morts-vivants/artificiels).';}
    if(f.name==='Guérison bénie'){f.name='Guérisseur béni';f.desc='Quand tu lances un sort de soin de niv.1+ sur une autre créature, tu récupères aussi 2 + le niveau du sort PV.';}
    if(f.name==='Flash ardent'){f.name="Radiance de l'aube";f.desc='Conduit divin : action — dissipe les ténèbres magiques à 9m ; hostiles à 9m : JS CON ou 2d10 + niveau de clerc dégâts radiants (moitié si réussi).';}
    if(f.name==='Lumière protectrice'){f.name='Illumination améliorée';f.desc="Tu peux utiliser Illumination protectrice aussi quand une créature visible à 9m attaque quelqu'un d'autre que toi.";}
    if(f.name==='Frappe divine — Feu/Radiant'){f.name='Incantation puissante';f.desc='Tu ajoutes ton modificateur de Sagesse aux dégâts de tes sorts mineurs de clerc.';}
    if(f.name==='Couronne de lumière'){f.name='Halo de lumière';f.desc='Action : aura de lumière du soleil 1 min — vive 18m + faible 9m ; ennemis dans la lumière vive : désavantage aux JS contre les sorts de feu/radiants.';}
    if(f.name==='Maîtrise des armures lourdes — Nature'){f.name='Charme des animaux et des plantes';f.desc='Conduit divin : action — bêtes et plantes visibles à 9m : JS SAG ou charmées 1 min, amicales envers toi.';}
    if(f.name==='Arrêter la nature'){f.name='Atténuation des éléments';f.desc="Réaction : quand toi ou une créature à 9m subit des dégâts d'acide, de froid, de feu, de foudre ou de tonnerre — accorde la résistance à ce type.";}
    if(f.name==='Frappe divine — Foudre/Poison'){f.name='Frappe divine — Froid/Feu/Foudre';f.desc='+1d8 dégâts de froid, de feu ou de foudre (au choix) 1×/tour quand tu touches avec une arme (+2d8 au niv.14).';}
    if(f.name==='Maîtrise des armures lourdes — Tempête'){f.name='Fureur destructrice';f.desc='Conduit divin : quand tu infliges des dégâts de foudre ou de tonnerre, inflige le maximum au lieu de lancer les dés.';}
    if(f.name==='Frappe de tonnerre'){f.name="Frappe de l'éclair";f.desc='Quand tu infliges des dégâts de foudre à une créature de taille G ou inférieure, tu peux la repousser de 3m.';}
    if(f.name==='Stase éolienne'){f.name='Enfant de la tempête';f.desc="Vitesse de vol égale à ta vitesse de déplacement, tant que tu n'es ni sous terre ni en intérieur.";}
    if(f.name==='Invocation du double'){f.name='Invocation de réplique';f.desc='Conduit divin : action — illusion parfaite de toi-même à 9m (1 min, concentration) ; action bonus : la déplacer de 9m.';}
    if(f.name==='Cloak of Shadows'){f.name="Linceul d'ombre";f.desc="Conduit divin : action — tu deviens invisible jusqu'à la fin de ton prochain tour (fin si tu attaques ou lances un sort).";}
    if(f.name==='Frappe améliorée'){f.name='Réplique améliorée';f.desc='Invocation de réplique crée jusqu\'à 4 doublons. Action bonus : en déplacer plusieurs (9m chacun, max 36m de toi).';}
    if(f.name==='Avatar de la bataille')f.name='Avatar de bataille';
    if(f.name==='Visions du passé'&&f.desc&&f.desc.includes('tenir un objet')){f.name='Savoir ancestral';f.desc="Conduit divin : action — maîtrise d'une compétence ou d'un outil pendant 10 minutes.";}
    if(f.name==='Visions du passé améliorées'){f.name='Visions du passé';f.desc="Méditation 1 min+ : visions du passé d'un objet (propriétaires) ou d'une zone (SAG jours). 1×/repos court ou long.";}
    if(f.name==='Frappe puissante'){f.name='Incantation puissante';f.desc='Tu ajoutes ton modificateur de Sagesse aux dégâts de tes sorts mineurs de clerc.';}
    if(f.name==='Bénédiction de la forge'&&f.desc&&f.desc.includes('attiser')){f.name="Bénédiction de l'artisan";f.desc="Conduit divin : rituel d'1h — crée un objet métallique non magique d'une valeur ≤ 100 po.";}
    if(f.name==='Forgé dans le feu'){f.name='Saint de la forge et du feu';f.desc='Immunité aux dégâts de feu. En armure lourde : résistance aux dégâts contondants, perforants et tranchants non magiques.';}
  });
  if(p.archetype&&p.archetype['Clerc']==='Domaine de la tromperie')p.archetype['Clerc']='Domaine de la duperie';
  // Migration noms officiels Rôdeur (audit RAW) : capacités d'archétype mal nommées
  if(Array.isArray(p.features))p.features.forEach(f=>{
    if(!f)return;
    if(f.name==='Protecteur exceptionnel'){f.name='Entraînement exceptionnel';f.desc="Action bonus : ordonner au compagnon Aider, Foncer ou Se désengager (les tours où il n'attaque pas). Ses attaques comptent comme magiques.";}
    if(f.name==='Assaut bestial'){f.name='Fureur bestiale';f.desc='Quand tu ordonnes l\'action Attaquer, ton compagnon peut attaquer deux fois.';}
    if(f.name==='Partager des sorts'){f.name='Partage des sorts';f.desc="Quand tu lances un sort qui te cible, tu peux aussi en faire bénéficier ton compagnon s'il est à 9m ou moins.";}
    if(f.name==='Salve ou Frappe tourbillonnante'){f.name='Attaques multiples';f.desc="Choisis : Volée (action : une attaque à distance contre chaque créature à 3m d'un point visible) / Attaque tourbillonnante (action : une attaque de mêlée contre chaque créature à 1,5m).";}
    if(f.name==='Défense supérieure'&&f.desc&&f.desc.includes('Esquive améliorée')){f.name='Défense du chasseur supérieure';f.desc="Choisis : Esquive totale (JS DEX réussi = 0 dégât, raté = moitié) / Retour de bâton (réaction : une attaque de mêlée qui te rate est répétée contre une autre créature) / Esquive instinctive (réaction : dégâts réduits de moitié).";}
    // Occultiste : capacités de patron du LU mal nommées (audit RAW)
    if(f.name==='Résistance du Fiélon'){f.name='Chance du ténébreux';f.desc='Quand tu fais un jet de caractéristique ou de sauvegarde : ajoute 1d10 (après le dé, avant le verdict). 1/repos court ou long.';}
    if(f.name==='Résistance infernale'){f.name='Résistance fiélonne';f.desc='À chaque repos court ou long, choisis un type de dégâts : tu y es résistant (ignoré par les armes magiques et en argent).';}
    if(f.name==='Feu infernal'){f.name='Traversée des enfers';f.desc="Quand tu touches avec une attaque : la cible disparaît dans les plans inférieurs jusqu'à la fin de ton prochain tour, puis revient avec 10d10 dégâts psychiques (sauf fiélons). 1/repos long.";}
    if(f.name==='Séduction féérique'){f.name='Échappatoire brumeuse';f.desc="Réaction quand tu subis des dégâts : invisible + téléportation 18m (jusqu'au début de ton prochain tour ou jusqu'à attaque/sort). 1/repos court ou long.";}
    if(f.name==='Revêtement des fées'){f.name='Défenses captivantes';f.desc='Immunité au charme. Réaction quand on tente de te charmer : JS SAG ou tu charmes la créature 1 min (ou jusqu\'aux dégâts).';}
    if(f.name==='Brume féérique'){f.name='Sombre délire';f.desc='Action : créature à 18m, JS SAG ou charmée/effrayée 1 min (concentration), perdue dans un royaume illusoire. 1/repos court ou long.';}
    if(f.name==='Pensée élonguée'){f.name='Protection entropique';f.desc="Réaction : impose un désavantage à un jet d'attaque contre toi ; si l'attaque rate, avantage à ta prochaine attaque contre cette créature. 1/repos court ou long.";}
    if(f.name==="Bouclier d'avatars"){f.name='Bouclier mental';f.desc="Pensées illisibles (sauf accord), résistance aux dégâts psychiques, et toute créature qui t'inflige des dégâts psychiques en subit autant.";}
    if(f.name==='Créer un thrall'){f.name='Asservissement';f.desc="Action : toucher un humanoïde neutralisé → charmé (sans JS) jusqu'à Délivrance des malédictions, retrait de l'état ou réutilisation. Télépathie partagée sur le même plan.";}
    // Moine : capacités de voie du LU mal nommées (audit RAW, complément du re-pass Moine)
    if(f.name==='Bras agile'){f.name='Intégrité du corps';f.desc='Action : tu récupères 3 × ton niveau de moine PV. 1×/repos long.';}
    if(f.name==='Tranquillité'&&f.desc&&f.desc.includes('Pas du vent')){f.desc="À la fin d'un repos long : effet du sort Sanctuaire (DD 8 + maîtrise + SAG) jusqu'au début de ton prochain repos long. Prend fin si tu attaques ou lances un sort.";}
    if(f.name==='Vibrations frappantes'){f.name='Frappe des vibrations';f.desc='3 points de ki quand tu touches à mains nues : vibrations implantées pendant plusieurs jours. Action pour les déclencher : JS CON ou la cible tombe à 0 PV (réussite : 10d10 dégâts nécrotiques).';}
    if(f.name==='Frappe des ombres'){f.name='Pas des ombres';f.desc="Action bonus dans une lumière faible ou les ténèbres : téléportation jusqu'à 18m vers une zone sombre visible, puis avantage à ta première attaque de mêlée avant la fin du tour.";}
    if(f.name==='Manteau des ombres'&&f.desc&&f.desc.includes('1 point de ki')){f.desc="Action dans une lumière faible ou les ténèbres : invisible jusqu'à ce que tu attaques, lances un sort ou entres dans une lumière vive.";}
    if(f.name==='Opportuniste des ombres'){f.name='Opportuniste';f.desc="Réaction : quand une créature à 1,5m de toi est touchée par une attaque d'un autre que toi, tu peux faire une attaque de mêlée contre elle.";}
    // Paladin : capacités de serment du LU mal nommées (audit RAW)
    if(f.name==="Pureté d'esprit"){f.name="Pureté de l'esprit";f.desc="Tu es en permanence sous l'effet du sort Protection contre le mal et le bien.";}
    if(f.name==="Forme d'avatar sacré"){f.name='Nimbe sacré';f.desc="Action : pendant 1 min, lumière vive 9m (+ faible 9m). Un ennemi qui commence son tour dans la lumière vive subit 10 dégâts radiants ; avantage à tes JS contre les sorts des fiélons et morts-vivants. 1/repos long.";}
    if(f.name==="Aura d'entraves"){f.name='Aura de garde';f.desc='Toi et tes alliés à 3m (9m au niv.18) avez la résistance aux dégâts causés par les sorts.';}
    if(f.name==='Ancienneté protectrice'){f.name='Sentinelle immortelle';f.desc='Quand tu tombes à 0 PV sans être tué sur le coup, tu peux rester à 1 PV (1/repos long). Tu ne subis plus les inconvénients de la vieillesse et ne peux pas vieillir magiquement.';}
    if(f.name==="Seigneur de l'hiver"){f.name='Champion antique';f.desc='Action : transformation 1 min — +10 PV au début de chacun de tes tours, sorts de paladin (1 action) lançables en action bonus, ennemis à 3m : désavantage aux JS contre tes sorts et Conduits. 1/repos long.';}
    if(f.name==='Aura implacable'){f.name='Vengeur implacable';f.desc="Quand tu touches une créature avec une attaque d'opportunité, tu peux te déplacer de la moitié de ta vitesse juste après (même réaction), sans provoquer d'attaque d'opportunité.";}
    if(f.name==='Âme vindicative'){f.name='Âme vengeresse';f.desc="Quand la créature sous ton Vœu d'hostilité fait une attaque, tu peux utiliser ta réaction pour l'attaquer si elle est à portée.";}
    if(f.name==='Avatar de la vengeance'){f.name='Ange de la vengeance';f.desc='Action : transformation 1 heure — ailes (vol 18m) et aura de menace 9m (les ennemis qui y commencent leur tour : JS SAG ou effrayés 1 min). 1/repos long.';}
    // Roublard : capacités d'archétype du LU mal nommées (audit RAW)
    if(f.name==='Emploi rapide'){f.name='Discrétion suprême';f.desc='Avantage aux jets de Dextérité (Discrétion) si tu ne te déplaces pas de plus de la moitié de ta vitesse pendant le tour.';}
    if(f.name==='Infiltrateur'){f.name="Utilisation d'objets magiques";f.desc='Tu ignores toutes les exigences de classe, de race et de niveau pour utiliser les objets magiques.';}
    if(f.name==='Glissement'){f.name='Réflexes de voleur';f.desc='Tu joues deux tours au premier round : initiative normale, puis initiative −10. Pas si tu es surpris.';}
    if(f.name==='Imposteur'&&f.desc&&f.desc.includes('Parfaitement reproduire')){f.name='Expert en infiltration';f.desc='Tu peux créer de fausses identités (1 semaine + 25 po chacune) qui passent pour réelles jusqu\'à preuve du contraire.';}
    if(f.name==='Morte imposteur'){f.name='Imposteur';f.desc="Après 3h d'étude, tu dupliques parfaitement la voix, l'écriture et les manières d'une personne. Avantage à Tromperie en cas de soupçon.";}
    if(f.name==='Mort instantanée'){f.name='Frappe meurtrière';f.desc='Quand tu touches une créature SURPRISE : JS CON DD 8 + maîtrise + DEX, ou les dégâts de l\'attaque sont doublés.';}
    if(f.name==='Voleur de sorts'&&f.desc&&f.desc.includes('contresort')){f.name='Embuscade magique';f.desc="Si tu es caché d'une créature quand tu lui lances un sort, elle a un désavantage à ses JS contre ce sort pendant ce tour.";}
    if(f.name==='Main versatile'){f.name='Escroc polyvalent';f.desc="Action bonus : ta main de mage distrait une créature à 1,5m d'elle → avantage à tes jets d'attaque contre cette créature jusqu'à la fin du tour.";}
    if(f.name==='Voleur de sorts amélioré'){f.name='Voleur de sort';f.desc="Réaction quand un sort te cible : JS du lanceur contre ton DD ; s'il rate, le sort est annulé contre toi et tu le voles pendant 8h. 1/repos long.";}
    if(f.name==='Informateur'){f.name='Manipulateur perspicace';f.desc="Après 1 min d'observation hors combat, le MJ te dit si la cible t'est égale, supérieure ou inférieure sur 2 critères au choix (INT, SAG, CHA, niveaux).";}
    if(f.name==='Protections'){f.name='Redirection';f.desc="Réaction quand une attaque te cible et qu'une créature à 1,5m t'offre un abri : l'attaque cible cette créature à ta place.";}
    if(f.name==='Mémoire infaillible'){f.name='Âme de la duperie';f.desc='Tes pensées sont illisibles par télépathie (seules de fausses pensées sont lues). La magie de vérité te voit toujours véridique, et tu peux mentir dans les langues que tu connais.';}
    // Artificier : sous-classe + capacités du LU mal nommées (audit RAW)
    if(f.name==='Forgeron de bataille')f.name='Forgeron de guerre';
    if(f.name==='Réactif alchimique'){f.name='Ingrédients revigorants';f.desc='Boire un de tes élixirs donne 2d6+INT PV temporaires. Tu peux lancer Restauration partielle sans emplacement (via matériel d\'alchimiste), INT fois/repos long.';}
    if(f.name==='Maître chimiste'){f.name='Maîtrise chimique';f.desc='Résistance aux dégâts d\'acide et de poison, immunité à l\'état empoisonné. Restauration supérieure et Guérison sans emplacement ni composantes, 1×/repos long chacune.';}
    if(f.name==='Artillerie explosive'){f.name='Canon explosif';f.desc='Les jets de dégâts de ton canon gagnent +1d8. Action : faire exploser le canon — créatures à 6m : JS DEX ou 3d8 dégâts de force (moitié si réussi).';}
    if(f.name==='Canon arcaniste'){f.name='Position fortifiée';f.desc='Toi et tes alliés avez un abri partiel à 3m de tes canons. Tu peux avoir deux canons à la fois.';}
    if(f.name==='Arme animée'){f.name='Décharge arcanique';f.desc='Quand toi ou ton défenseur d\'acier touchez avec une arme magique : +2d6 dégâts de force OU soigner 2d6 PV à une créature à 9m. INT/repos long, 1/tour.';}
    if(f.name==='Améliorations de forge'){f.name='Défenseur amélioré';f.desc='Décharge arcanique 4d6. Défenseur d\'acier : +2 CA et sa Parade d\'attaque inflige 1d4+INT dégâts de force.';}
    if(f.name==='Armure améliorée — Rang 2'){f.name='Modifications d\'armure';f.desc='Ton armure d\'arcanes compte comme plusieurs objets séparés pour tes imprégnations, et peut en porter 2 de plus.';}
    if(f.name==='Armure parfaite'&&f.desc&&f.desc.includes('lancer des sorts depuis ton armure')){f.desc='Ton modèle d\'armure s\'améliore (Gardien : attirer une créature + frapper en réaction / Infiltrateur : cible scintillante, désavantage contre toi — cf. TCE).';}
  });
  if(p.archetype&&p.archetype['Artificier']==='Forgeron de bataille')p.archetype['Artificier']='Forgeron de guerre';
  if(!p.deathSaves||typeof p.deathSaves!=='object')p.deathSaves={success:0,fail:0};
  if(p.deathSaves.success===undefined)p.deathSaves.success=0;
  if(p.deathSaves.fail===undefined)p.deathSaves.fail=0;
  if(p.equipPortrait===undefined)p.equipPortrait=null;
  // Migration : reconstruire p.archetype depuis p.features pour les persos existants
  if(!p.archetype&&p.features&&typeof CLASS_LEVEL_DATA!=='undefined'){
    p.archetype={};
    const allArchNames=new Set();
    Object.values(CLASS_LEVEL_DATA).forEach(cd=>(cd.archetypes||[]).forEach(a=>allArchNames.add(a.name)));
    p.features.forEach(f=>{if(f.name&&f.classe&&allArchNames.has(f.name))p.archetype[f.classe]=f.name;});
  }
  _migrateGenericFeats(p); // principe #4 : résout les capacités d'archétype génériques
  // Correction maîtrises "non-métal" → valeurs propres
  p.weaponProfs=p.weaponProfs.map(pr=>pr.replace(' non-métal','').trim()).filter(Boolean);
  p.armorProfs=p.armorProfs.map(pr=>pr.replace(' non-métal','').trim()).filter(Boolean);
  // Si un perso existant a des maîtrises vides mais une classe définie, les resynchroniser
  if(p.created&&p.classes.length&&!p.weaponProfs.length&&!p.armorProfs.length){
    p.classes.forEach(c=>{
      const d=SRD.classes.find(cl=>cl.name===c.name);
      if(d){
        p.weaponProfs=[...new Set([...p.weaponProfs,...(d.weaponTypes||[])])];
        p.armorProfs=[...new Set([...p.armorProfs,...(d.armorTypes||[])])];
      }
    });
  }
  return p;
}

// ═══════════════════════════════════════
// CALCULS
// ═══════════════════════════════════════
function totalLevel(p){return(p.classes||[]).reduce((s,c)=>s+c.level,0)||1;}
function pb(lvl){return Math.ceil(lvl/4)+1;}
function mod(s){return Math.floor((s-10)/2);}
function fmt(n){return n>=0?'+'+n:''+n;}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
// Échappement pour insérer une valeur dans une chaîne JS à l'intérieur d'un onclick="..." (apostrophes FR : « Nuée d'insectes »).
function jsq(s){return String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'&quot;').replace(/[\r\n]/g,' ');}
function mainClass(p){if(!p.classes||!p.classes.length)return null;return p.classes.reduce((a,b)=>a.level>=b.level?a:b);}
function calcSpellSlots(p){
  // L'Occultiste utilise sa propre table (gérée séparément dans l'UI)
  let e=0;
  (p.classes||[]).forEach(c=>{
    if(c.name==='Occultiste')return; // géré séparément
    const d=SRD.classes.find(cl=>cl.name===c.name);if(!d)return;
    if(c.name==='Paladin'||c.name==='Rôdeur'){if(c.level>=2)e+=Math.ceil(c.level/2);} // niv1 = 0 slot, niv2+ demi-lanceur
    else if(d.spellWeight===1)e+=c.level;
    else if(d.spellWeight===0.5)e+=Math.ceil(c.level/2);
  });
  // Tiers-lanceurs (archétypes Escroc arcanique / Chevalier occulte) : 1/3 du niveau de classe
  const _feats=p.features||[];
  const _roub=(p.classes||[]).find(c=>c.name==='Roublard');
  if(_roub&&_roub.level>=3&&_feats.some(f=>f.name==='Escroc arcanique'))e+=Math.floor(_roub.level/3);
  const _guer=(p.classes||[]).find(c=>c.name==='Guerrier');
  if(_guer&&_guer.level>=3&&_feats.some(f=>f.name==='Chevalier occulte'))e+=Math.floor(_guer.level/3);
  if(e<1)return null;
  return MC_SLOT_TABLE[Math.min(e-1,19)]||null;
}
function getWarlockSlots(p){
  const wc=(p.classes||[]).find(c=>c.name==='Occultiste');
  if(!wc)return null;
  return WARLOCK_SLOT_TABLE[Math.min(wc.level-1,19)]; // [nb, niveau]
}
function checkMcReq(p,cn){const r=SRD.mcReqs[cn];if(!r)return{ok:true,msg:''};const s=p.abilities||[10,10,10,10,10,10];if(r.length===1){const ok=s[r[0][0]]>=r[0][1];return{ok,msg:ok?'':`${ABILITIES_SH[r[0][0]]} ≥ ${r[0][1]} requis (actuel: ${s[r[0][0]]})`};}if(r[2]==='or'){const ok=s[r[0][0]]>=r[0][1]||s[r[1][0]]>=r[1][1];return{ok,msg:ok?'':`${ABILITIES_SH[r[0][0]]} ≥ ${r[0][1]} OU ${ABILITIES_SH[r[1][0]]} ≥ ${r[1][1]}`};}const o1=s[r[0][0]]>=r[0][1],o2=s[r[1][0]]>=r[1][1];return{ok:o1&&o2,msg:[!o1?`${ABILITIES_SH[r[0][0]]} ≥ ${r[0][1]}`:'',!o2?`${ABILITIES_SH[r[1][0]]} ≥ ${r[1][1]}`:''].filter(Boolean).join(', ')};}
function getFinalStats(base,raceName,flexChoices,flexSetIdx){
  const rd=SRD.races.find(r=>r.name===raceName);
  const out=base.map((v,i)=>{if(!rd)return v;let b=0;if(rd.allBonus)b=rd.allBonus;else if(rd.bonuses&&rd.bonuses[i])b=rd.bonuses[i];return v+b;});
  // Bonus raciaux FLEXIBLES (Demi-Elfe +1/+1, Dragonide métallique +2/+1 ou +1/+1/+1) choisis à la création
  if(rd&&rd.flexOptions&&Array.isArray(flexChoices)){
    const set=rd.flexOptions[flexSetIdx||0]||rd.flexOptions[0];
    set.forEach((val,k)=>{const ai=flexChoices[k];if(ai!=null&&ai>=0&&ai<6)out[ai]+=val;});
  }
  return out;
}
function pointsSpent(s){return s.reduce((a,v)=>a+(POINT_BUY_COST[v]||0),0);}
// Calcul charges d'une capacité
function getChargesMax(feat,p){
  if(feat.charges===null&&feat.chargesFormula){
    if(feat.chargesFormula==='CHA')return Math.max(1,mod((p.abilities||[])[5]||10));
    if(feat.chargesFormula==='level')return totalLevel(p);
    if(feat.chargesFormula==='level5')return totalLevel(p)*5;
    if(feat.chargesFormula==='actionSurge'){const gl=((p.classes||[]).find(c=>c.name==='Guerrier')||{}).level||0;return gl>=17?2:(gl>=2?1:0);}
    if(feat.chargesFormula==='clericCD'){const cl=((p.classes||[]).find(c=>c.name==='Clerc')||{}).level||0;return cl>=18?3:(cl>=6?2:1);}
    if(feat.chargesFormula==='indomptable'){const gl=((p.classes||[]).find(c=>c.name==='Guerrier')||{}).level||0;return gl>=17?3:(gl>=13?2:(gl>=9?1:0));}
    if(feat.chargesFormula==='INT')return Math.max(1,mod((p.abilities||[])[3]||10));
    return 0;
  }
  if(!feat.charges&&feat.charges!==0)return 0;
  if(feat.chargesFormula==='CHA')return Math.max(1,mod((p.abilities||[])[5]||10));
  if(feat.chargesFormula==='level')return totalLevel(p);
  if(feat.chargesFormula==='level5')return totalLevel(p)*5;
  return feat.charges||0;
}
// Vérif si une arme/armure est maîtrisée
function hasProficiency(p,itemName,itemType){
  const all=[...p.weaponProfs||[],...p.armorProfs||[]];
  return all.some(pr=>pr.toLowerCase()===itemName.toLowerCase()||pr.toLowerCase()===itemType.toLowerCase()||itemName.toLowerCase().includes(pr.toLowerCase()));
}

// ═══════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════
function getUserSK(){return currentUser?SK+'_'+currentUser.uid:SK;}
function _markUnsaved(){_unsaved=true;const b=document.getElementById('saveBtn');if(b)b.classList.add('save-pending');clearTimeout(_saveDebounce);_saveDebounce=setTimeout(()=>saveAll(true),1500);}
function _clearUnsaved(){_unsaved=false;const b=document.getElementById('saveBtn');if(b)b.classList.remove('save-pending');}
async function saveAll(silent=false){
  clearTimeout(_saveDebounce);
  _clearUnsaved();
  if(currentUser&&currentCampaignId&&state.players[0]){
    try{
      _ownWritePending++;
      _ownWriteData=_stableJSON(state.players[0]);
      _ownWriteDataSet.add(_ownWriteData);
      const p=state.players[0];
      await fbDb.collection('characters').doc(currentUser.uid+'_'+currentCampaignId).set({
        userId:currentUser.uid,campaignId:currentCampaignId,tableId:currentTableId,
        characterData:p,
        updatedAt:firebase.firestore.FieldValue.serverTimestamp()
      },{merge:true});
      const charMeta={
        charName:p.charName||'Personnage',
        charClass:(p.classes||[]).map(c=>c.name+' '+c.level).join(' / '),
        charLevel:totalLevel(p),
        campaignName:currentCampaignName,
        tableName:currentTableName
      };
      await fbDb.collection('users').doc(currentUser.uid).update({['charLib.'+currentCampaignId]:charMeta});
      if(currentUserData){if(!currentUserData.charLib)currentUserData.charLib={};currentUserData.charLib[currentCampaignId]=charMeta;}
      window._saveFailNotified=false; // écriture serveur OK → réarme l'alerte d'échec
    }catch(e){
      console.error('Firestore save error',e);
      // Échec d'écriture en ligne : ne PAS laisser croire que c'est sauvegardé — le point de sync revient.
      _unsaved=true;const _sb=document.getElementById('saveBtn');if(_sb)_sb.classList.add('save-pending');
      if(!window._saveFailNotified){window._saveFailNotified=true;
        if(typeof showBanner==='function')showBanner('⚠️','Sauvegarde en ligne échouée',"Tes derniers changements ne sont pas enregistrés sur le serveur. Vérifie ta connexion — nouvel essai à la prochaine modification.",{variant:'danger'});
        else showToast('⚠️ Sauvegarde en ligne échouée — vérifie ta connexion');
      }
    }
  }
  try{localStorage.setItem(getUserSK(),JSON.stringify(state));}catch(e){}
  // Toast sauvegarde supprimé — le sync dot suffit comme indicateur
}
function P(){return state.players[state.activeIdx]||state.players[0];}
function upd(k,v){P()[k]=v;}

function autoGrow(el){el.style.height='auto';el.style.height=Math.min(el.scrollHeight+2,500)+'px';}
function autoGrowAll(){document.querySelectorAll('textarea.fi').forEach(autoGrow);}

// Réorganisation des panneaux par glisser-déposer — GÉNÉRIQUE, scopé par conteneur (data-csgroup).
// Combat (#combatContainer) et chaque colonne de la fiche Perso ont leur propre ordre (mémoire de session).
// Drop interdit entre deux conteneurs différents (pas de passage d'une colonne à l'autre).
let _sectionOrders={};        // { groupKey: [csid,...] }
let _combatSectionOrder=[];   // (compat — plus utilisé directement)
let _combatDragId=null;
let _combatDragGroup=null;    // conteneur d'origine du panneau tiré
function _csGroupKey(c){return (c&&c.dataset)?(c.dataset.csgroup||c.id||'default'):'default';}
function combatDragStart(e,id,el){if(e&&e.target&&/^(INPUT|TEXTAREA|SELECT|BUTTON|OPTION|A)$/.test(e.target.tagName)){if(e.preventDefault)e.preventDefault();return;}_combatDragId=id;_combatDragGroup=el.parentElement;setTimeout(()=>el.classList.add('mj-dragging'),0);}
function combatDragEnd(el){el.classList.remove('mj-dragging');_combatDragGroup=null;document.querySelectorAll('.mj-drop-before,.mj-drop-after').forEach(x=>x.classList.remove('mj-drop-before','mj-drop-after'));}
function _qcsid(id){try{return (window.CSS&&CSS.escape)?CSS.escape(id):id;}catch(e){return id;}}
function combatDragOver(e,el){if(!_combatDragId||el.dataset.csid===_combatDragId)return;e.preventDefault();document.querySelectorAll('.mj-drop-before,.mj-drop-after').forEach(x=>x.classList.remove('mj-drop-before','mj-drop-after'));const r=el.getBoundingClientRect();el.classList.add(e.clientY<r.top+r.height/2?'mj-drop-before':'mj-drop-after');}
function combatDrop(e,targetId){e.preventDefault();if(!_combatDragId||_combatDragId===targetId)return;const root=document;const target=root.querySelector('[data-csid="'+_qcsid(targetId)+'"]');const dragged=root.querySelector('[data-csid="'+_qcsid(_combatDragId)+'"]');document.querySelectorAll('.mj-drop-before,.mj-drop-after').forEach(x=>x.classList.remove('mj-drop-before','mj-drop-after'));if(!target||!dragged){_combatDragId=null;return;}const c=target.parentElement,fromC=dragged.parentElement;if(target.classList.contains('mj-drop-before'))c.insertBefore(dragged,target);else c.insertBefore(dragged,target.nextSibling);_combatDragId=null;_sectionOrders[_csGroupKey(c)]=[...c.querySelectorAll(':scope>[data-csid]')].map(x=>x.dataset.csid);if(fromC&&fromC!==c)_sectionOrders[_csGroupKey(fromC)]=[...fromC.querySelectorAll(':scope>[data-csid]')].map(x=>x.dataset.csid);}
// Applique l'ordre ET la colonne sauvegardés (un panneau peut avoir été déplacé d'une colonne à l'autre).
function applyAllSectionOrders(rootId){const root=document.getElementById(rootId||'tabContent');if(!root)return;root.querySelectorAll('[data-csgroup]').forEach(c=>{const order=_sectionOrders[_csGroupKey(c)];if(!order||!order.length)return;order.forEach(id=>{const el=root.querySelector('[data-csid="'+_qcsid(id)+'"]');if(el)c.appendChild(el);});});}
function applyCombatOrder(){applyAllSectionOrders();} // compat (appelé depuis renderTab)
// Rend déplaçables TOUS les .panel de l'onglet courant (sauf Combat, déjà géré par cs()). Idempotent.
function _enableTabDrag(rootId){
  const root=document.getElementById(rootId||'tabContent');if(!root)return;
  let _wrapped=0,_seen=0,_err='';
  const _p0=root.querySelector('.panel');
  const _p0par=_p0&&_p0.parentElement?(_p0.parentElement.getAttribute('class')||('csg:'+_p0.parentElement.getAttribute('data-csgroup'))||_p0.parentElement.tagName):'none';
  try{
    root.querySelectorAll('.panel').forEach(pan=>{
      _seen++;
      const parent=pan.parentElement;
      if(!parent)return;
      if(parent.classList.contains('mj-rules-section'))return; // déjà enveloppé (Combat via cs(), ou run précédent)
      if(!parent.dataset.csgroup){const gi=[...(parent.parentElement?parent.parentElement.children:[])].indexOf(parent);parent.dataset.csgroup=(state.activeTab||'tab')+'-col'+(gi<0?0:gi);}
      const t=(((pan.querySelector('.pt')||{}).textContent)||'').replace(/[^0-9A-Za-zÀ-ÿ]/g,'').slice(0,28);
      const sibs=[...parent.children].filter(c=>c.classList&&c.classList.contains('panel'));
      const csid=parent.dataset.csgroup+'_'+(t||('p'+sibs.indexOf(pan)));
      // Enveloppe propre = élément déplaçable (exactement comme cs() pour le Combat)
      const w=document.createElement('div');
      w.className='mj-rules-section';
      w.setAttribute('data-csid',csid);
      w.setAttribute('draggable','true');
      w.setAttribute('ondragstart',"combatDragStart(event,'"+csid+"',this)");
      w.setAttribute('ondragend','combatDragEnd(this)');
      w.setAttribute('ondragover','combatDragOver(event,this)');
      w.setAttribute('ondrop',"combatDrop(event,'"+csid+"')");
      parent.insertBefore(w,pan);
      w.appendChild(pan);
      // Poignée visuelle dans le titre (si absente)
      const pt=pan.querySelector('.pt');
      if(pt&&!pt.querySelector('.mj-drag-handle')){const h=document.createElement('span');h.className='mj-drag-handle';h.title='Déplacer';h.textContent='⠿';h.style.marginRight='6px';pt.insertBefore(h,pt.firstChild);}
      _wrapped++;
    });
  }catch(e){_err=e&&e.stack?e.stack.split('\n').slice(0,2).join(' | '):String(e);}
  if(window._DRAG_DIAG&&typeof showToast==='function')showToast('🔧 vus:'+_seen+' env:'+_wrapped+' | p0par:['+_p0par+']'+(_err?(' | ERR: '+_err):' | sans erreur'),15000);
}
window._DRAG_DIAG=false; // diagnostic (mettre true pour réafficher le toast)
function cs(id,html){return`<div class="mj-rules-section" data-csid="${id}" draggable="true" ondragstart="combatDragStart(event,'${id}',this)" ondragend="combatDragEnd(this)" ondragover="combatDragOver(event,this)" ondrop="combatDrop(event,'${id}')">${html}</div>`;}
let _spellLevelsOpen={};
let _equipProfOpen={all:false};

async function uploadEquipPortrait(input){
  const file=input.files[0];if(!file)return;
  if(!['image/jpeg','image/png','image/gif'].includes(file.type)){showToast('❌ Format non supporté. Utilisez JPG, PNG ou GIF.');input.value='';return;}
  if(file.size>819200){showToast('❌ Image trop lourde (max 800 Ko). Compressez-la avant import.');input.value='';return;}
  const reader=new FileReader();
  reader.onload=e=>{upd('equipPortrait',e.target.result);render();};
  reader.readAsDataURL(file);
}

// ═══════════════════════════════════════
// RENDER
// ═══════════════════════════════════════
function render(){
  if(currentCampaignId&&!_suppressUnsavedMark)_markUnsaved();
  _suppressUnsavedMark=false;
  const p=P();const mc=mainClass(p);
  document.getElementById('app').className=mc?'th-'+mc.name:'';
  const hdr=document.getElementById('hdrChar');
  if(hdr){const cs=(p.classes||[]).map(c=>`${c.name} ${c.level}`).join(' / ')||'?';hdr.textContent=p.charName?`${p.charName} — ${cs}`:'Fiche de personnage';}
  const mjBtn=document.getElementById('mjBtn');
  if(mjBtn){mjBtn.textContent=mjMode?'🎲 MJ ✓':'🎲 MJ';mjBtn.style.background=mjMode?'var(--cp)':'transparent';mjBtn.style.color=mjMode?'#1a1400':'var(--cp)';}
  renderPlayerBar();renderTabBar();renderTab();
  const _cr=document.getElementById('charRail');
  if(_cr)_cr.innerHTML=(typeof renderCharRail==='function'?renderCharRail(p):'');
  const _f2=document.querySelector('.fiche-2col');
  if(_f2)_f2.classList.toggle('no-rail',!p.created); // pas de rail pendant la création
}

function renderPlayerBar(){
  const bar=document.getElementById('playerBar');if(!bar)return;
  if(state.players.length<=1){bar.innerHTML='';bar.style.display='none';return;}
  bar.style.display='';
  bar.innerHTML=state.players.map((pl,i)=>`<span class="ptag${i===state.activeIdx?' on':''}" onclick="switchPlayer(${i})">${esc(pl.charName||pl.name)}</span>`).join('');
}

function renderTabBar(){
  const bar=document.getElementById('tabBar');if(!bar)return;
  const p=P();
  if(!p.created){bar.innerHTML='';return;}
  // REFONTE P2 : 6 onglets fusionnés (Personnage=Perso+Compétences · Inventaire=Équip.+Sac · Historique=XP+Historique)
  const _lvlupCls=(()=>{const _lvl=totalLevel(p);const _nxt=XP_LEVELS[_lvl]||XP_LEVELS[19];return(p.xp||0)>=_nxt&&_lvl<20&&!p.pendingLevelUp?'lvlup':''})();
  let TABS=[
    {id:'perso',ico:'👤',txt:'Personnage'},
    {id:'combat',ico:'⚔️',txt:'Combat'},
    {id:'sorts',ico:'✨',txt:'Sorts'},
    {id:'equipement',ico:'🎒',txt:'Inventaire'},
    {id:'historique',ico:'📜',txt:'Historique',cls:_lvlupCls},
    {id:'journal',ico:'📖',txt:'Journal'},
  ];
  if(p.tabOrder&&p.tabOrder.length){
    const ordered=[];
    p.tabOrder.forEach(id=>{const t=TABS.find(x=>x.id===id);if(t)ordered.push(t);});
    TABS.forEach(t=>{if(!ordered.find(x=>x.id===t.id))ordered.push(t);});
    TABS=ordered;
  }
  if(p.pendingLevelUp)TABS.unshift({id:'levelup',ico:'⬆',txt:'Niveau +',cls:'lvlup'});
  // Alias des anciens onglets fusionnés (activeTab sauvegardé en 9-onglets)
  const _alias={competences:'perso',sac:'equipement',xp:'historique'};
  if(_alias[state.activeTab])state.activeTab=_alias[state.activeTab];
  bar.innerHTML=TABS.map(t=>`<button class="tab${state.activeTab===t.id?' on':''}${t.cls?' '+t.cls:''}" onclick="setTab('${t.id}')"><span class="ti">${t.ico||''}</span><span class="tl">${t.txt||t.label||''}</span></button>`).join('')
    +`<button class="tab tab-foot" onclick="openPrivacySettings()" title="Confidentialité"><span class="ti">🔒</span></button>`
    +`<button class="tab tab-foot" onclick="openTabOrderSettings()" title="Réorganiser les onglets"><span class="ti">↕</span></button>`;
  if(typeof _initTabScrollers==='function')setTimeout(_initTabScrollers,0);
}

function openTabOrderSettings(){
  const p=P();
  const BASE_IDS=['perso','combat','sorts','equipement','historique','journal'];
  const LABELS={perso:'👤 Personnage',combat:'⚔️ Combat',sorts:'✨ Sorts',equipement:'🎒 Inventaire',historique:'📜 Historique',journal:'📖 Journal'};
  if(!p.tabOrder||p.tabOrder.length<BASE_IDS.length)p.tabOrder=[...BASE_IDS];
  window._tabOrderMove=(id,dir)=>{
    const order=p.tabOrder;const i=order.indexOf(id);const j=i+dir;
    if(j<0||j>=order.length)return;
    [order[i],order[j]]=[order[j],order[i]];
    _markUnsaved();renderTabBar();openTabOrderSettings();
  };
  window._tabOrderReset=()=>{
    p.tabOrder=[...BASE_IDS];_markUnsaved();renderTabBar();openTabOrderSettings();
  };
  const rows=p.tabOrder.map((id,i)=>{
    const isFirst=i===0;const isLast=i===p.tabOrder.length-1;
    return`<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--surface2);border:1px solid var(--border);border-radius:2px;margin-bottom:5px">
      <span style="font-size:14px;flex:1">${LABELS[id]||id}</span>
      <button onclick="_tabOrderMove('${id}',-1)" ${isFirst?'disabled':''} style="background:none;border:1px solid var(--border);color:var(--text);border-radius:2px;padding:3px 9px;cursor:pointer;font-size:14px;opacity:${isFirst?.3:1}">↑</button>
      <button onclick="_tabOrderMove('${id}',1)" ${isLast?'disabled':''} style="background:none;border:1px solid var(--border);color:var(--text);border-radius:2px;padding:3px 9px;cursor:pointer;font-size:14px;opacity:${isLast?.3:1}">↓</button>
    </div>`;
  }).join('');
  openModal(`<div class="pt">↕ Réorganiser les onglets</div>
    <p style="font-size:13px;color:var(--text3);margin-bottom:12px">Déplace les onglets pour les mettre dans l'ordre qui te convient. La modification est sauvegardée avec ta fiche.</p>
    ${rows}
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px;gap:8px">
      <button class="btn bsm" style="color:var(--text3)" onclick="_tabOrderReset()">↺ Ordre par défaut</button>
    </div>`);
}

function setTab(id){
  state.activeTab=id;
  if(currentCampaignId)localStorage.setItem('lastTab_'+currentCampaignId,id);
  if(id==='levelup')resetLU();
  renderTabBar();
  const el=document.getElementById('tabContent');if(!el)return;
  const map={perso:tabPerso,competences:tabCompetences,combat:tabCombat,equipement:tabEquipement,sac:tabSac,historique:tabHistorique,xp:tabXP,sorts:tabSorts,levelup:tabLevelUp,journal:tabJournal};
  el.innerHTML=(map[id]||tabPerso)(P());
  el.classList.remove('tab-switch-anim');void el.offsetWidth;el.classList.add('tab-switch-anim'); // animation de changement d'onglet
  _enableTabDrag();applyAllSectionOrders(); // FIX : enveloppe + ordre AUSSI au changement d'onglet (sinon le drag « saute »)
  setTimeout(autoGrowAll,0);
  if(typeof _centerActiveTab==='function')setTimeout(_centerActiveTab,40); // centre l'onglet actif dans la barre
}

function renderTab(){
  const el=document.getElementById('tabContent');if(!el)return;
  const p=P();
  if(!p.created){el.innerHTML=tabCreation(p);if(typeof _ctaScrollGlow==='function')setTimeout(_ctaScrollGlow,40);return;}
  const map={perso:tabPerso,competences:tabCompetences,combat:tabCombat,equipement:tabEquipement,sac:tabSac,historique:tabHistorique,xp:tabXP,sorts:tabSorts,levelup:tabLevelUp,journal:tabJournal};
  // REFONTE P2 — onglets FUSIONNÉS : catégories dépliables (contenus d'origine INTACTS)
  const _alias={competences:'perso',sac:'equipement',xp:'historique'};
  if(_alias[state.activeTab])state.activeTab=_alias[state.activeTab];
  const FUSED={perso:[['perso','👤 Identité & caractéristiques'],['competences','🎯 Compétences']],
    equipement:[['equipement','🛡 Équipement'],['sac','🎒 Sac & encombrement']],
    historique:[['historique','⭐ Progression & XP'],['xp','📖 Montée de niveau']]};
  // NB : l'ordre Historique = progression d'abord (tabHistorique = historique du perso, tabXP = XP/LU)
  if(FUSED[state.activeTab]){
    const parts=state.activeTab==='historique'?[['xp','⭐ Progression & XP'],['historique','📖 Historique du personnage']]:FUSED[state.activeTab];
    const _fc=id=>{try{return localStorage.getItem('fold_'+id)==='1'}catch(e){return false}}; // état plié MÉMORISÉ
    el.innerHTML='<div class="norg-panel">'+parts.map(([id,lbl])=>`<div class="g-fold${_fc(id)?' closed':''}" data-fuse="${id}">
      <div class="fh" onclick="this.parentElement.classList.toggle('closed');try{localStorage.setItem('fold_'+this.parentElement.dataset.fuse,this.parentElement.classList.contains('closed')?'1':'0')}catch(e){}"><span class="grip">⠿</span>${lbl}<span class="chev">▼</span></div>
      <div class="fb">${(map[id]||(()=>''))(p)}</div>
    </div>`).join('')+'</div>';
  }else{
    el.innerHTML='<div class="norg-panel">'+(map[state.activeTab]||tabPerso)(p)+'</div>';
  }
  if(state.activeTab==='levelup'&&typeof _ctaScrollGlow==='function')setTimeout(_ctaScrollGlow,40); // scroll+glow bouton continuer au LU
  _enableTabDrag();applyAllSectionOrders(); // synchrone : pas de fenêtre où les attributs de drag manquent
  setTimeout(autoGrowAll,0);
  setTimeout(()=>{_enableTabDrag();applyAllSectionOrders();},10); // filet de sécurité
  // Pré-remplir la liste de dons quand la recherche est vide (step ASI → Don)
  setTimeout(()=>{if(typeof luFilterFeats==='function'&&document.getElementById('featResults'))luFilterFeats('');},0);
}

function switchPlayer(i){state.activeIdx=i;resetCS();render();}

// ═══════════════════════════════════════
// PLAYER MODALS
// ═══════════════════════════════════════
function addPlayer(){
  openModal(`<div class="pt">Nouveau joueur</div>
    <div class="fl mb6">Nom du joueur</div>
    <input class="fi" id="newPlayerName" value="Joueur ${state.players.length+1}" style="margin-bottom:12px">
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bac" style="flex:2" onclick="confirmAddPlayer()">✓ Créer</button>
    </div>`);
  setTimeout(()=>{const i=document.getElementById('newPlayerName');if(i){i.focus();i.select();}},50);
}
function confirmAddPlayer(){
  const n=(document.getElementById('newPlayerName')?.value||'').trim();
  if(!n){showToast('❌ Nom requis');return;}
  closeModal();state.players.push(defPlayer(n));state.activeIdx=state.players.length-1;resetCS();render();
}
function deletePlayer(){
  if(state.players.length<=1){showToast('Impossible de supprimer le dernier joueur.');return;}
  const nom=P().charName||P().name;
  openModal(`<div class="pt" style="color:var(--danger)">🗑 Supprimer</div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:12px">Tape <strong style="color:var(--cp)">${esc(nom)}</strong> pour confirmer :</p>
    <input class="fi" id="deleteConfirmInput" placeholder="${esc(nom)}" style="margin-bottom:12px">
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1" onclick="closeModal()">Annuler</button>
      <button class="btn bdanger" style="flex:2" onclick="confirmDeletePlayer('${jsq(nom)}')">🗑 Supprimer</button>
    </div>`);
  setTimeout(()=>{document.getElementById('deleteConfirmInput')?.focus();},50);
}
function confirmDeletePlayer(nom){
  const val=(document.getElementById('deleteConfirmInput')?.value||'').trim();
  if(val!==nom){showToast('❌ Nom incorrect');return;}
  closeModal();state.players.splice(state.activeIdx,1);state.activeIdx=Math.max(0,state.activeIdx-1);render();showToast('🗑 Supprimé.');
}

// ═══════════════════════════════════════
// CRÉATION GUIDÉE
// ═══════════════════════════════════════
const CRE_STEPS_BASE=['Race','Classe','Stats','Historique','Compétences','Équipement','Confirmation'];
const CRE_STEPS_SPELL=['Race','Classe','Stats','Historique','Compétences','Sorts','Équipement','Confirmation'];

function getCreSteps(){const cd=SRD.classes.find(c=>c.name===CS.classe);return cd&&cd.spellcaster&&cd.startSpells>0?CRE_STEPS_SPELL:CRE_STEPS_BASE;}

function tabCreation(){
  const steps=getCreSteps();
  const labels=['Race','Classe','Stats','Historique','Compétences','Sorts','Équipement','Confirmation'];
  const cur=labels[CS.step-1];
  const stepIdx=steps.indexOf(cur);
  const progress=`<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:18px">
    ${steps.map((s,i)=>`<span class="cp-step${i<stepIdx?' done':i===stepIdx?' active':''}">${i<stepIdx?'✓ ':''+(i+1)+'. '}${s}</span>${i<steps.length-1?'<span style="color:var(--text3);font-size:12px;align-self:center">›</span>':''}`).join('')}
  </div>`;
  const map={1:creStep1,2:creStep2,3:creStep3,4:creStep4,5:creStep5,6:()=>{const cd=SRD.classes.find(c=>c.name===CS.classe);return cd&&cd.spellcaster&&cd.startSpells>0?creStep6Sorts():creStep7();},7:()=>{const cd=SRD.classes.find(c=>c.name===CS.classe);return cd&&cd.spellcaster&&cd.startSpells>0?creStep7():creStep8();},8:creStep8};
  return`<div class="creation-wrap"><div class="panel"><div class="pt" style="font-size:15px">🧙 Création du personnage</div>${progress}${(map[CS.step]||creStep1)()}</div></div>`;
}

function creStep1(){
  const isDragonide = !!CS.race&&CS.race.startsWith('Dragonide');
  const canContinue = CS.race && (!isDragonide || CS.draconicAncestry);
  return`<div><p style="font-size:13px;color:var(--text2);margin-bottom:12px">Choisis la race de ton personnage.</p>
    <div class="crd-grid">${SRD.races.map(r=>{const b=r.allBonus?`+${r.allBonus} à tout`:r.bonuses.map((v,i)=>v?`+${v} ${ABILITIES_SH[i]}`:'').filter(Boolean).join(', ');return`<div class="crd${CS.race===r.name?' selected':''}" onclick="CS.race='${jsq(r.name)}';CS.draconicAncestry=null;CS.flexSet=0;CS.flexChoices=[];renderTab()"><h3>${esc(r.name)}</h3><p>${esc(r.traits.slice(0,65))}…</p><span class="tag">🏃 ${r.speed}m</span><span class="tag" style="color:var(--good)">${b}</span></div>`;}).join('')}</div>
    ${CS.race?`<div style="margin-top:12px;padding:10px;background:var(--surface2);border-radius:2px"><div style="font-size:13px;font-weight:600;color:var(--cp)">${esc(CS.race)}</div><div style="font-size:13px;color:var(--text2);margin-top:4px">${esc((SRD.races.find(r=>r.name===CS.race)||{}).traits||'')}</div></div>`:''}
    ${isDragonide?`<div style="margin-top:12px">
      <div style="font-size:13px;font-weight:600;color:var(--cp);margin-bottom:8px">🐉 Choisis ton ascendance draconique <span style="color:var(--danger)">*</span></div>
      <div class="crd-grid">${SRD.draconicAncestries.map(a=>`<div class="crd${CS.draconicAncestry===a.name?' selected':''}" onclick="CS.draconicAncestry='${jsq(a.name)}';renderTab()">
        <h3>${a.icon} ${esc(a.name)}</h3>
        <p style="font-size:13px">${esc(a.damage)}</p>
        <span class="tag" style="font-size:12px">${esc(a.shape)}</span>
      </div>`).join('')}</div>
      ${CS.draconicAncestry?`<div style="margin-top:8px;padding:8px;background:var(--surface2);border-radius:2px;font-size:13px;color:var(--good)">✓ Dragon <strong>${esc(CS.draconicAncestry)}</strong> — Souffle : ${esc((SRD.draconicAncestries.find(a=>a.name===CS.draconicAncestry)||{}).damage||'')} (${esc((SRD.draconicAncestries.find(a=>a.name===CS.draconicAncestry)||{}).shape||'')})</div>`:``}
    </div>`:''}
    ${CS.race?`<button class="btn bac" style="margin-top:12px;width:100%" onclick="CS.step=2;renderTab()" ${canContinue?'':'disabled'}>Continuer → Classe</button>`:''}
  </div>`;
}

function creStep2(){
  const hasArchetype=CS.classe&&CLASS_LEVEL_DATA[CS.classe]&&CLASS_LEVEL_DATA[CS.classe].archetypeLevel===1;
  const archetypes=hasArchetype?(CLASS_LEVEL_DATA[CS.classe].archetypes||[]):[];
  const cdLu=CS.classe?CLASS_LEVEL_DATA[CS.classe]:null;
  const hasStyle=cdLu&&cdLu.styleLevel===1;
  const styles=hasStyle?(cdLu.combatStyles||[]):[];
  const canContinue=CS.classe&&(!hasArchetype||CS.archetype)&&(!hasStyle||CS.combatStyle);
  return`<div><p style="font-size:13px;color:var(--text2);margin-bottom:12px">Choisis la classe de ton personnage.</p>
    <div class="crd-grid">${SRD.classes.map(c=>`<div class="crd${CS.classe===c.name?' selected':''}" onclick="CS.classe='${jsq(c.name)}';CS.archetype=null;CS.combatStyle=null;renderTab()"><h3>${esc(c.name)}</h3><p>${c.hd}${c.spellcaster?' • ✦ sorts':''}</p><span class="tag">JS: ${c.saves.join(', ')}</span><span class="tag" style="color:var(--cp)">${c.skillCount} comp.</span><span class="tag" style="color:var(--cp)">★ ${(c.primaryStats||[]).join(', ')}</span></div>`).join('')}</div>
    ${CS.classe?`<div style="margin-top:12px;padding:10px;background:var(--surface2);border-radius:2px">${(()=>{const c=SRD.classes.find(cl=>cl.name===CS.classe);return c?`<div style="font-size:13px;font-weight:600;color:var(--cp)">${esc(c.name)}</div><div style="font-size:13px;color:var(--text2);margin-top:4px">Armures: ${esc(c.armor)} • Armes: ${esc(c.weapons)}</div>`:''})()}</div>
    ${hasArchetype?`<div style="margin-top:12px"><div style="font-size:13px;font-weight:600;color:var(--cp);margin-bottom:8px">${CS.classe==='Ensorceleur'?'🔮 Choisis ton Lignée draconique':'🌑 Choisis ton Mécène d\'Outremonde'} <span style="color:var(--danger)">*</span></div>
      <div class="crd-grid">${archetypes.map(a=>`<div class="crd${CS.archetype===a.name?' selected':''}" onclick="CS.archetype='${a.name.replace(/'/g,"\\'").replace(/"/g,'&quot;')}';renderTab()"><h3>${a.icon||''} ${esc(a.name)}</h3><p>${esc(a.desc.slice(0,80))}…</p></div>`).join('')}</div>
      ${CS.archetype?`<div style="margin-top:8px;padding:8px;background:var(--surface2);border-radius:2px;font-size:13px;color:var(--good)">✓ ${esc(CS.archetype)} sélectionné</div>`:''}</div>`:''}
    ${hasStyle?`<div style="margin-top:12px"><div style="font-size:13px;font-weight:600;color:var(--cp);margin-bottom:8px">⚔ Choisis ton style de combat <span style="color:var(--danger)">*</span></div>
      <div class="crd-grid">${styles.map(s=>`<div class="crd${CS.combatStyle===s.name?' selected':''}" onclick="CS.combatStyle='${jsq(s.name)}';renderTab()"><h3>${esc(s.name)}</h3><p>${esc(s.desc)}</p></div>`).join('')}</div>
      ${CS.combatStyle?`<div style="margin-top:8px;padding:8px;background:var(--surface2);border-radius:2px;font-size:13px;color:var(--good)">✓ Style : ${esc(CS.combatStyle)}</div>`:''}</div>`:''}
    <div style="display:flex;gap:8px;margin-top:12px"><button class="btn" style="flex:1" onclick="CS.step=1;renderTab()">← Retour</button><button class="btn bac" style="flex:2" onclick="CS.step=3;renderTab()" ${canContinue?'':'disabled'}>Continuer → Stats</button></div>`:`<button class="btn" style="margin-top:12px" onclick="CS.step=1;renderTab()">← Retour</button>`}
  </div>`;
}

function creStep3(){
  const rd=SRD.races.find(r=>r.name===CS.race);const cd=SRD.classes.find(c=>c.name===CS.classe);
  let base=[...CS.baseStats];if(CS.statMethod==='dice'&&CS.diceRolls)base=[...CS.diceRolls];
  // Bonus raciaux flexibles : normaliser le tableau de choix sur le set actif
  const flexSets=rd&&rd.flexOptions?rd.flexOptions:null;
  const flexSet=flexSets?(flexSets[CS.flexSet||0]||flexSets[0]):null;
  if(flexSet&&(!Array.isArray(CS.flexChoices)||CS.flexChoices.length!==flexSet.length))CS.flexChoices=flexSet.map(()=>null);
  const flexIncomplete=!!flexSet&&CS.flexChoices.some(c=>c==null);
  const finals=getFinalStats(base,CS.race,CS.flexChoices,CS.flexSet);
  const spent=pointsSpent(CS.statMethod==='pointbuy'?CS.baseStats:[8,8,8,8,8,8]);
  const rem=27-spent;
  const hpTotal=(cd?cd.hdVal:8)+mod(finals[2]);
  return`<div>
    <div style="display:flex;gap:8px;margin-bottom:14px"><button class="smb${CS.statMethod==='pointbuy'?' on':''}" onclick="CS.statMethod='pointbuy';renderTab()">🪙 Achat de points</button><button class="smb${CS.statMethod==='dice'?' on':''}" onclick="CS.statMethod='dice';renderTab()">✨ Lancer les dés</button></div>
    ${CS.statMethod==='pointbuy'?`<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:2px"><span style="font-size:13px;color:var(--text2)">Points restants :</span><span style="font-size:15px;font-weight:700;color:${rem<0?'var(--danger)':'var(--cp)'}">${rem}</span><span style="font-size:13px;color:var(--text3)">/ 27 • valeurs 8–15</span></div>`:''}
    ${CS.statMethod==='dice'?`<div style="margin-bottom:12px"><button class="btn bac" onclick="CS.diceRolls=ABILITIES.map(()=>{const d=[1,2,3,4].map(()=>Math.ceil(Math.random()*6));d.sort((a,b)=>b-a);return d[0]+d[1]+d[2];});renderTab()">✨ Lancer les 6 dés (4d6 garde 3)</button>${CS.diceRolls?`<span style="margin-left:10px;font-size:13px;color:var(--cp)">${CS.diceRolls.join(' — ')}</span>`:''}</div>`:''}
    ${ABILITIES.map((ab,i)=>{const v=CS.statMethod==='dice'&&CS.diceRolls?CS.diceRolls[i]:CS.baseStats[i];const fx=flexSet?flexSet.reduce((a,val,k)=>a+(CS.flexChoices[k]===i?val:0),0):0;const rb=(rd?(rd.allBonus||rd.bonuses[i]||0):0)+fx;const final=v+rb;const canInc=CS.statMethod==='pointbuy'&&v<15&&rem>=(POINT_BUY_COST[v+1]||99)-POINT_BUY_COST[v];const canDec=CS.statMethod==='pointbuy'&&v>8;const isPrio=cd&&cd.primaryStats&&cd.primaryStats.includes(ABILITIES_SH[i]);
    return`<div class="stat-row"><span class="stat-row-name">${ab}${isPrio?` <span style="color:var(--cp);font-size:12px">★</span>`:''}</span>${CS.statMethod==='pointbuy'?`<div class="stat-ctrl"><button onclick="creStatDec(${i})" ${canDec?'':'disabled'}>−</button><span class="stat-val">${v}</span><button onclick="creStatInc(${i})" ${canInc?'':'disabled'}>+</button></div>`:`<span class="stat-val" style="margin:0 8px">${v}</span>`}<span style="font-size:13px;color:var(--cp);width:28px">${fmt(mod(v))}</span>${rb?`<span style="font-size:13px;color:var(--good);width:50px">+${rb} race</span>`:`<span style="width:50px"></span>`}<span style="font-size:13px;color:var(--text3)">→</span><span style="font-size:16px;font-weight:700;color:var(--cp);width:28px;text-align:center">${final}</span><span style="font-size:13px;color:var(--text2)">${fmt(mod(final))}</span></div>`;}).join('')}
    ${flexSet?`<div style="margin-top:12px;padding:10px;background:var(--surface2);border:1px solid var(--cp);border-radius:2px">
      <div style="font-size:13px;font-weight:600;color:var(--cp);margin-bottom:6px">🧬 Bonus raciaux au choix</div>
      ${flexSets.length>1?`<div style="display:flex;gap:6px;margin-bottom:8px">${flexSets.map((s,k)=>`<button class="smb${k===(CS.flexSet||0)?' on':''}" onclick="CS.flexSet=${k};CS.flexChoices=[];renderTab()">${s.map(v=>'+'+v).join(' / ')}</button>`).join('')}</div>`:''}
      ${flexSet.map((val,k)=>`<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="font-size:14px;font-weight:700;color:var(--good);width:34px">+${val}</span>
        <select class="fi" style="flex:1;margin:0" onchange="CS.flexChoices[${k}]=this.value===''?null:parseInt(this.value);renderTab()">
          <option value="">— choisir une caractéristique —</option>
          ${ABILITIES.map((ab,i)=>{const fixed=!!(rd&&(rd.allBonus||(rd.bonuses&&rd.bonuses[i]>0)));const taken=CS.flexChoices.some((c,kk)=>kk!==k&&c===i);if(fixed||taken)return'';return`<option value="${i}"${CS.flexChoices[k]===i?' selected':''}>${ab}</option>`;}).join('')}
        </select></div>`).join('')}
      ${flexIncomplete?`<div style="font-size:12.5px;color:var(--warn)">⚠ Choisis ${flexSet.length>1?'toutes tes caractéristiques bonus':'ta caractéristique bonus'} pour continuer.</div>`:''}
    </div>`:''}
    <div style="margin-top:10px;padding:8px;background:var(--surface2);border-radius:2px;font-size:13px;color:var(--text2)">PV de départ estimés : <strong style="color:var(--cp)">${hpTotal}</strong></div>
    <div style="display:flex;gap:8px;margin-top:12px"><button class="btn" style="flex:1" onclick="CS.step=2;renderTab()">← Retour</button><button class="btn bac" style="flex:2" onclick="CS.step=4;renderTab()" ${(CS.statMethod==='dice'&&!CS.diceRolls)||flexIncomplete?'disabled':''}>Continuer → Historique</button></div>
  </div>`;
}
function creStatInc(i){const v=CS.baseStats[i];if(v>=15)return;const cost=(POINT_BUY_COST[v+1]||99)-POINT_BUY_COST[v];if(27-pointsSpent(CS.baseStats)<cost)return;CS.baseStats[i]++;renderTab();}
function creStatDec(i){if(CS.baseStats[i]<=8)return;CS.baseStats[i]--;renderTab();}

function creStep4(){
  const bg=CS.background?BACKGROUNDS.find(b=>b.name===CS.background):null;
  return`<div><p style="font-size:13px;color:var(--text2);margin-bottom:12px">L'historique t'accorde 2 compétences et des maîtrises d'outils/langues.</p>
    <div class="fl mb6">Cherche ou clique</div>
    <div class="acw mb10"><input class="fi" id="bgInputCre" placeholder="Historique..." value="${esc(CS.background||'')}" oninput="if(!BACKGROUNDS_DB)loadBackgroundsDB(()=>searchCreBG(this.value));else searchCreBG(this.value)" autocomplete="off"><div class="acd" id="bgDropCre"></div></div>
    <div class="crd-grid" style="grid-template-columns:repeat(auto-fill,minmax(130px,1fr))">${BACKGROUNDS.map(b=>`<div class="crd${CS.background===b.name?' selected':''}" onclick="CS.background='${jsq(b.name)}';document.getElementById('bgInputCre').value='${jsq(b.name)}';document.getElementById('bgDropCre').style.display='none';renderTab()"><h3 style="font-size:13px">${esc(b.name)}</h3><p>${esc(b.skills.join(', '))}</p>${b.tools?`<span class="tag">${esc(b.tools.slice(0,20))}</span>`:''}${b.langs?`<span class="tag">+${b.langs} langue${b.langs>1?'s':''}</span>`:''}</div>`).join('')}</div>
    ${bg?`<div style="margin-top:12px;padding:12px;background:var(--surface2);border-radius:2px"><div style="font-size:13px;font-weight:600;color:var(--cp)">${esc(bg.name)}</div><div style="font-size:13px;color:var(--text2);margin-bottom:4px">${esc(bg.desc)}</div><div style="font-size:13px;color:var(--good)">Compétences : ${bg.skills.join(', ')}</div>${bg.tools?`<div style="font-size:13px;color:var(--text2);margin-top:2px">Outils : ${esc(bg.tools)}</div>`:''}${bg.langs?`<div style="font-size:13px;color:var(--text2);margin-top:2px">Langues supplémentaires : ${bg.langs}</div>`:''}</div>
    <div style="display:flex;gap:8px;margin-top:12px"><button class="btn" style="flex:1" onclick="CS.step=3;renderTab()">← Retour</button><button class="btn bac" style="flex:2" onclick="CS.selectedSkills=[];CS.step=5;renderTab()">Continuer → Compétences</button></div>`:`<button class="btn" style="margin-top:12px" onclick="CS.step=3;renderTab()">← Retour</button>`}
  </div>`;
}
const _EN_FR_SKILLS={'athletics':'Athlétisme','acrobatics':'Acrobatie','sleight of hand':'Escamotage','stealth':'Discrétion','arcana':'Arcanes','history':'Histoire','investigation':'Investigation','nature':'Nature','religion':'Religion','animal handling':'Dressage','insight':'Intuition','medicine':'Médecine','perception':'Perception','survival':'Survie','deception':'Tromperie','intimidation':'Intimidation','performance':'Représentation','persuasion':'Persuasion'};
function _parseCompBGSkills(sk){return(sk||'').split(',').map(s=>{const t=s.trim().toLowerCase();return _EN_FR_SKILLS[t]||s.trim();}).filter(Boolean).slice(0,2);}
function searchCreBG(q){
  const drop=document.getElementById('bgDropCre');if(!drop)return;
  if(!q){drop.style.display='none';return;}
  const low=q.toLowerCase();
  const res=BACKGROUNDS.filter(b=>b.name.toLowerCase().includes(low));
  // Étendre avec le compendium (276 historiques)
  if(BACKGROUNDS_DB&&res.length<10){
    for(let i=0;i<BACKGROUNDS_DB.length&&res.length<10;i++){
      const b=BACKGROUNDS_DB[i];
      if(b.n&&b.n.toLowerCase().includes(low)&&!res.find(r=>r.name.toLowerCase()===b.n.toLowerCase())){
        res.push({name:b.n,skills:_parseCompBGSkills(b.sk),tools:b.lg||'',langs:0,desc:(b.tx||'').substring(0,80)+'…',_comp:true});
      }
    }
  }
  if(!res.length){drop.style.display='none';return;}
  window._creSearchResults=res;
  drop.style.display='block';
  drop.innerHTML=res.map((b,i)=>`<div class="aci" onmousedown="event.preventDefault();_selectCreBGIdx(${i})"><div class="ain">${esc(b.name)}${b._comp?' <span style="font-size:12px;color:var(--text3)">[Compendium]</span>':''}</div><div class="ais">${esc(b.skills.join(', '))||'—'} — ${esc(b.desc||'')}</div></div>`).join('');
}
function _selectCreBGIdx(i){const b=window._creSearchResults&&window._creSearchResults[i];if(b)_selectCreBG(b);}
function _selectCreBG(b){
  if(b._comp&&!BACKGROUNDS.find(x=>x.name===b.name))BACKGROUNDS.push(b);
  CS.background=b.name;
  const inp=document.getElementById('bgInputCre');if(inp)inp.value=b.name;
  const drop=document.getElementById('bgDropCre');if(drop)drop.style.display='none';
  renderTab();
}

function creStep5(){
  const cd=SRD.classes.find(c=>c.name===CS.classe);if(!cd)return'';
  const bg=BACKGROUNDS.find(b=>b.name===CS.background);const bgSk=bg?bg.skills:[];
  const max=cd.skillCount;const sel=CS.selectedSkills;
  return`<div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:8px">Choisis <strong style="color:var(--cp)">${max} compétences</strong> parmi celles de la classe ${esc(CS.classe)}.</p>
    ${bgSk.length?`<div style="padding:8px 10px;background:rgba(76,175,80,.1);border:1px solid var(--good);border-radius:2px;margin-bottom:10px;font-size:13px;color:var(--good)">✓ Via l'historique <strong>${esc(CS.background)}</strong> : ${bgSk.join(', ')}</div>`:''}
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;padding:6px 10px;background:var(--surface2);border-radius:2px"><span style="font-size:13px;color:var(--text2)">Sélectionnées :</span><span style="font-size:18px;font-weight:700;color:var(--cp)">${sel.length}/${max}</span></div>
    ${cd.skills.map(sk=>{const isBg=bgSk.includes(sk);const isSel=sel.includes(sk);const dis=!isSel&&sel.length>=max;return`<div class="sk-choice${isBg?' from-bg':isSel?' selected':dis?' disabled':''}" onclick="${dis&&!isBg?'':'creToggleSkill(\''+sk+'\')'}"><span class="sk-dot${isBg||isSel?' p':''}"></span><span style="flex:1;font-size:13px">${esc(sk)}${isBg?' <span style="font-size:12px;color:var(--good)">(historique)</span>':''}</span>${isBg?`<span style="font-size:13px;color:var(--good)">✓</span>`:isSel?`<span style="color:var(--cp)">✓</span>`:''}</div>`;}).join('')}
    <div style="margin-top:12px;padding:10px;background:var(--surface2);border-radius:2px"><div style="font-size:13px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Maîtrises</div><div style="font-size:13px;color:var(--text2)">Armures : ${esc(cd.armor)} • Armes : ${esc(cd.weapons)}</div><div style="font-size:13px;color:var(--text2);margin-top:2px">Sauvegardes : ${cd.saves.join(', ')}</div></div>
    <div style="display:flex;gap:8px;margin-top:12px"><button class="btn" style="flex:1" onclick="CS.step=4;renderTab()">← Retour</button><button class="btn bac" style="flex:2" onclick="creGoNext5()" ${sel.length===max?'':'disabled'}>Continuer →</button></div>
  </div>`;
}
function creToggleSkill(sk){const cd=SRD.classes.find(c=>c.name===CS.classe);if(!cd)return;const bg=BACKGROUNDS.find(b=>b.name===CS.background);if(bg&&bg.skills.includes(sk))return;const idx=CS.selectedSkills.indexOf(sk);if(idx>=0)CS.selectedSkills.splice(idx,1);else if(CS.selectedSkills.length<cd.skillCount)CS.selectedSkills.push(sk);renderTab();}
function creGoNext5(){const cd=SRD.classes.find(c=>c.name===CS.classe);if(cd&&cd.spellcaster&&cd.startSpells>0){CS.step=6;}else{CS.step=7;}renderTab();}

function creStep6Sorts(){
  const cd=SRD.classes.find(c=>c.name===CS.classe);if(!cd)return'';
  const max=cd.startSpells||4;const sel=CS.selectedSpells;
  const cantripCount=CS.classe==='Magicien'?3:CS.classe==='Ensorceleur'?4:2;
  const selC=sel.filter(s=>{const sp=findSpellData(s);return sp&&sp.level===0;});
  const selL1=sel.filter(s=>{const sp=findSpellData(s);return sp&&sp.level===1;});
  const l1Max=max-cantripCount;
  return`<div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:12px">Choisis tes sorts de départ pour ${esc(CS.classe)}.</p>
    <div style="display:flex;gap:10px;margin-bottom:12px">
      <div style="flex:1;padding:8px;background:var(--surface2);border-radius:2px;text-align:center"><div style="font-size:13px;color:var(--text3)">Sorts mineurs</div><div style="font-size:15px;font-weight:700;color:var(--cp)">${selC.length}/${cantripCount}</div></div>
      <div style="flex:1;padding:8px;background:var(--surface2);border-radius:2px;text-align:center"><div style="font-size:13px;color:var(--text3)">Sorts niv.1</div><div style="font-size:15px;font-weight:700;color:var(--cp)">${selL1.length}/${l1Max}</div></div>
    </div>
    <div style="font-size:13px;font-weight:600;color:var(--cp);margin-bottom:6px">Sorts mineurs</div>
    ${(SPELLS_DB||SRD.spells).filter(s=>s.level===0&&(!SPELLS_DB||(s.classes||[]).includes(CS.classe||''))).map(s=>{const isSel=sel.includes(s.name);const dis=!isSel&&selC.length>=cantripCount;return`<div class="sk-choice${isSel?' selected':dis?' disabled':''}" onclick="${dis?'':'creToggleSpell(\''+jsq(s.name)+'\')'}"><span class="sk-dot${isSel?' p':''}"></span><span style="flex:1;font-size:13px">${esc(s.name)}</span><span style="font-size:13px;color:var(--text3)">${esc(s.school)} • ${esc(s.castTime)}</span>${isSel?`<span style="color:var(--cp)">✓</span>`:''}<span onclick="event.stopPropagation();creToggleSpellDesc('${jsq(s.name)}')" style="cursor:pointer;color:var(--cp);font-size:13px;padding:0 6px" title="Voir la description">ⓘ</span></div><div id="cresp_${s.name.replace(/[^a-zA-Z0-9]/g,'_')}" style="display:none;font-size:13px;color:var(--text2);background:var(--surface2);border-radius:2px;padding:6px 8px;margin:2px 0 6px;line-height:1.5">${esc(s.desc||'—')}</div>`;}).join('')}
    <div style="font-size:13px;font-weight:600;color:var(--cp);margin:10px 0 6px">Sorts de niveau 1</div>
    ${getSpellsDB().filter(s=>s.level===1&&(!SPELLS_DB||(s.classes||[]).includes(CS.classe||''))).map(s=>{const isSel=sel.includes(s.name);const dis=!isSel&&selL1.length>=l1Max;return`<div class="sk-choice${isSel?' selected':dis?' disabled':''}" onclick="${dis?'':'creToggleSpell(\''+jsq(s.name)+'\')'}"><span class="sk-dot${isSel?' p':''}"></span><span style="flex:1;font-size:13px">${esc(s.name)}</span><span style="font-size:13px;color:var(--text3)">${esc(s.school)}${s.damage?' • '+esc(s.damage):''}</span>${isSel?`<span style="color:var(--cp)">✓</span>`:''}<span onclick="event.stopPropagation();creToggleSpellDesc('${jsq(s.name)}')" style="cursor:pointer;color:var(--cp);font-size:13px;padding:0 6px" title="Voir la description">ⓘ</span></div><div id="cresp_${s.name.replace(/[^a-zA-Z0-9]/g,'_')}" style="display:none;font-size:13px;color:var(--text2);background:var(--surface2);border-radius:2px;padding:6px 8px;margin:2px 0 6px;line-height:1.5">${esc(s.desc||'—')}</div>`;}).join('')}
    <div style="display:flex;gap:8px;margin-top:12px"><button class="btn" style="flex:1" onclick="CS.step=5;renderTab()">← Retour</button><button class="btn bac" style="flex:2" onclick="CS.step=7;renderTab()" ${selC.length>=cantripCount&&selL1.length>=l1Max?'':'disabled'}>Continuer → Équipement</button></div>
  </div>`;
}
function creToggleSpellDesc(name){const d=document.getElementById('cresp_'+name.replace(/[^a-zA-Z0-9]/g,'_'));if(d)d.style.display=d.style.display==='none'?'block':'none';}
function creToggleSpell(name){const idx=CS.selectedSpells.indexOf(name);if(idx>=0)CS.selectedSpells.splice(idx,1);else CS.selectedSpells.push(name);renderTab();}

// ─── Boutique de création (mode pièces d'or) — charte UX : « or → liste + prix » ───
function _crePriceVal(pr){const m=String(pr||'').match(/([\d.]+)\s*(po|pa|pc)/i);if(!m)return null;const v=parseFloat(m[1]);const u=m[2].toLowerCase();return u==='po'?v:u==='pa'?v/10:v/100;}
const CRE_GEAR=[
  {name:"Flèche",qty:20,desc:"Munitions",price:"1 po"},
  {name:"Carreau",qty:20,desc:"Munitions",price:"1 po"},
  {name:"Pack du donjon",qty:1,desc:"Pied de biche, torches, rations, corde",price:"12 po"},
  {name:"Pack d'explorateur",qty:1,desc:"Sac de couchage, rations, gourde, corde",price:"10 po"},
  {name:"Sac d'érudit",qty:1,desc:"Livre, plume, encre, parchemins",price:"40 po"},
  {name:"Sac d'ecclésiastique",qty:1,desc:"Bougies, rations, encens",price:"19 po"},
  {name:"Sac de cambrioleur",qty:1,desc:"Pied de biche, outils, cordes",price:"16 po"},
  {name:"Outils de voleur",qty:1,desc:"Maîtrise requise",price:"25 po"},
  {name:"Symbole sacré",qty:1,desc:"Focaliseur divin",price:"5 po"},
  {name:"Focaliseur arcanique",qty:1,desc:"Cristal ou baguette",price:"10 po"},
  {name:"Focaliseur druidique",qty:1,desc:"Branche de gui, bâton",price:"10 po"},
  {name:"Potion de soins",qty:1,desc:"Récupère 2d4+2 PV",price:"50 po"},
  {name:"Corde de chanvre (15 m)",qty:1,desc:"",price:"1 po"},
  {name:"Lanterne sourde",qty:1,desc:"Lumière 18 m",price:"5 po"},
  {name:"Rations (10 jours)",qty:1,desc:"",price:"5 po"},
];
function _creCatalog(){
  const out=[];
  (SRD.weapons||[]).forEach(w=>{const v=_crePriceVal(w.price);if(v!=null)out.push({name:w.name,qty:1,desc:w.damage+(w.properties?', '+w.properties:''),price:w.price,v,cat:'⚔ Armes'});});
  (SRD.armors||[]).forEach(a=>{const v=_crePriceVal(a.price);if(v!=null)out.push({name:a.name,qty:1,desc:'CA '+a.ca,price:a.price,v,cat:'🛡 Armures'});});
  CRE_GEAR.forEach(g=>{const v=_crePriceVal(g.price);out.push(Object.assign({},g,{v,cat:'🎒 Équipement'}));});
  return out;
}
function _creGoldLeft(){const spent=(CS.bought||[]).reduce((a,b)=>a+(b.v||0),0);return Math.max(0,Math.round((CS.rolledGold-spent)*100)/100);}
function creBuy(ci){const c=_creCatalog()[ci];if(!c)return;if(_creGoldLeft()<c.v){showToast("❌ Pas assez de pièces d'or.");return;}if(!CS.bought)CS.bought=[];CS.bought.push(c);renderTab();}
function creUnbuy(i){if(CS.bought)CS.bought.splice(i,1);renderTab();}

function creStep7(){
  const cd=SRD.classes.find(c=>c.name===CS.classe);if(!cd||!cd.equipment)return'';
  const sg=START_GOLD[CS.classe];
  const goldFormula=sg?(sg.dice+'d4'+(sg.mult>1?' × '+sg.mult+' po':' po')):'—';
  const prevStep=(()=>{return cd&&cd.spellcaster&&cd.startSpells>0?6:5;})();
  return`<div>
    <div style="display:flex;gap:6px;margin-bottom:12px">
      <button class="btn${!CS.goldMode?' bac':''}" style="flex:1;font-size:13px" onclick="CS.goldMode=false;renderTab()">🎒 Équipement standard</button>
      <button class="btn${CS.goldMode?' bac':''}" style="flex:1;font-size:13px" onclick="CS.goldMode=true;renderTab()">💰 Pièces d'or</button>
    </div>
    ${!CS.goldMode?`
      <p style="font-size:13px;color:var(--text2);margin-bottom:12px">Choisis ton équipement de départ.</p>
      ${cd.equipment.map((opt,i)=>`<div class="eq-opt${CS.equipChoice===i?' selected':''}" onclick="CS.equipChoice=${i};renderTab()"><div style="font-size:13px;font-weight:600;color:var(--cp);margin-bottom:6px">Option ${String.fromCharCode(65+i)} ${CS.equipChoice===i?'✓':''}</div><div style="display:flex;flex-wrap:wrap;gap:4px">${opt.map(item=>`<span style="background:var(--surface3);border:1px solid var(--border);border-radius:2px;padding:3px 8px;font-size:13px;color:var(--text2)">${esc(item.name)}</span>`).join('')}</div></div>`).join('')}
    `:`
      <div style="background:var(--surface2);border-radius:2px;padding:14px;text-align:center">
        <div style="font-size:13px;color:var(--text2);margin-bottom:10px">Au lieu de l'équipement standard, lance les dés et dépense librement vos pièces.</div>
        <div style="font-size:16px;font-weight:700;color:var(--cp);margin-bottom:10px">${goldFormula}</div>
        <button class="btn bac" onclick="rollStartGold()" style="margin-bottom:10px">✨ Lancer les dés</button>
        ${CS.rolledGold>0?`<div style="font-size:18px;font-weight:700;color:#ffd700">Résultat : ${CS.rolledGold} po</div>`:'<div style="font-size:13px;color:var(--text3)">Lance les dés pour obtenir tes pièces d\'or de départ.</div>'}
      </div>
      ${CS.rolledGold>0?(()=>{const cat=_creCatalog();const left=_creGoldLeft();const groups={};cat.forEach((c,i)=>{(groups[c.cat]=groups[c.cat]||[]).push({c,i});});
        return`<div style="text-align:left;margin-top:12px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><div style="font-size:13px;font-weight:600;color:var(--cp)">🛒 Boutique (facultatif)</div><div style="font-size:15px;font-weight:700;color:#ffd700">Reste : ${left} po</div></div>
          ${(CS.bought&&CS.bought.length)?`<div style="margin-bottom:8px;padding:8px;background:var(--surface3);border-radius:2px"><div style="font-size:12.5px;color:var(--text3);margin-bottom:4px">Panier :</div>${CS.bought.map((b,i)=>`<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;margin-bottom:2px"><span>${esc(b.name)}${b.qty>1?' ×'+b.qty:''} <span style="color:var(--text3)">(${esc(b.price)})</span></span><button class="btn bsm" style="color:var(--danger)" onclick="creUnbuy(${i})">✕</button></div>`).join('')}</div>`:''}
          <div style="max-height:260px;overflow-y:auto;border:1px solid var(--border);border-radius:2px;padding:6px">
            ${Object.keys(groups).map(g=>`<div style="font-size:12.5px;color:var(--cp);margin:6px 0 4px">${g}</div>`+groups[g].map(({c,i})=>`<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;padding:3px 4px;border-bottom:1px solid var(--surface3)"><span style="flex:1;min-width:0">${esc(c.name)}${c.qty>1?' ×'+c.qty:''} <span style="color:var(--text3);font-size:12px">${esc((c.desc||'').slice(0,42))}</span></span><span style="color:#ffd700;white-space:nowrap;margin:0 8px">${esc(c.price)}</span><button class="btn bsm" onclick="creBuy(${i})" ${left<c.v?'disabled':''}>＋</button></div>`).join('')).join('')}
          </div>
        </div>`;})():''}
    `}
    <div style="display:flex;gap:8px;margin-top:12px"><button class="btn" style="flex:1" onclick="CS.step=${prevStep};renderTab()">← Retour</button><button class="btn bac" style="flex:2" onclick="CS.step=8;renderTab()" ${CS.goldMode&&CS.rolledGold<=0?'disabled':''}>Continuer → Confirmation</button></div>
  </div>`;
}

function creStep8(){
  const rd=SRD.races.find(r=>r.name===CS.race);const cd=SRD.classes.find(c=>c.name===CS.classe);const bg=BACKGROUNDS.find(b=>b.name===CS.background);
  let base=[...CS.baseStats];if(CS.statMethod==='dice'&&CS.diceRolls)base=[...CS.diceRolls];
  const finals=getFinalStats(base,CS.race,CS.flexChoices,CS.flexSet);const hpMax=(cd?cd.hdVal:8)+mod(finals[2]);
  const allSk=[...new Set([...(bg?bg.skills:[]),...CS.selectedSkills])];
  return`<div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:14px">Finalise ton personnage. <strong style="color:var(--cp)">Les stats seront verrouillées.</strong></p>
    <div class="g2" style="gap:10px;margin-bottom:14px">
      <div><div class="fl mb6">Nom *</div><input class="fi mb6" id="recapName" placeholder="Requis..." value="${esc(CS.charName)}" oninput="CS.charName=this.value;document.getElementById('confirmCreBtn').disabled=!this.value.trim()">
      <div class="fl mb6">Alignement</div><select class="fi" onchange="CS.alignment=this.value"><option value="">— Choisir —</option>${ALIGNMENTS.map(a=>`<option ${CS.alignment===a?'selected':''}>${a}</option>`).join('')}</select></div>
      <div style="background:var(--surface2);border-radius:2px;padding:10px"><div style="font-size:13px;font-weight:600;color:var(--cp);margin-bottom:6px">Résumé</div>
        ${[['Race',CS.race],['Classe',CS.classe],['Historique',CS.background],['PV max',''+hpMax],['Compétences',''+allSk.length],...(CS.selectedSpells.length?[['Sorts',''+CS.selectedSpells.length]]:[])].map(([k,v])=>`<div class="recap-stat"><span>${k}</span><span style="color:var(--cp)">${esc(v||'—')}</span></div>`).join('')}
      </div>
    </div>
    <div style="background:var(--surface2);border-radius:2px;padding:10px;margin-bottom:14px">
      <div style="font-size:13px;font-weight:600;color:var(--cp);margin-bottom:6px">Statistiques finales</div>
      <div class="g6">${ABILITIES.map((ab,i)=>`<div class="sb hi"><div class="sn">${ABILITIES_SH[i]}</div><div style="font-size:15px;font-weight:700">${finals[i]}</div><div class="sm">${fmt(mod(finals[i]))}</div></div>`).join('')}</div>
    </div>
    <div style="display:flex;gap:8px"><button class="btn" style="flex:1" onclick="CS.step=7;renderTab()">← Retour</button><button class="btn bac" style="flex:2" id="confirmCreBtn" onclick="confirmCreation()" ${CS.charName.trim()?'':'disabled'}>✓ Confirmer la création</button></div>
  </div>`;
}

// Maîtrises de compétence accordées par la race (auto, verrouillées). Toutes les variantes elfiques → Perception (Sens aiguisés).
function racialSkillProfs(race){
  const M={'Elfe (Haut-Elfe)':['Perception'],'Elfe des bois':['Perception'],'Elfe noir (Drow)':['Perception'],'Demi-Orc':['Intimidation'],'Goliath':['Athlétisme']};
  return M[race]||[];
}
function confirmCreation(){
  const p=P();const rd=SRD.races.find(r=>r.name===CS.race);const cd=SRD.classes.find(c=>c.name===CS.classe);const bg=BACKGROUNDS.find(b=>b.name===CS.background);
  if(!CS.charName.trim()||!CS.race||!CS.classe)return;
  let base=[...CS.baseStats];if(CS.statMethod==='dice'&&CS.diceRolls)base=[...CS.diceRolls];
  const finals=getFinalStats(base,CS.race,CS.flexChoices,CS.flexSet);
  p.charName=CS.charName.trim();p.race=CS.race;p.draconicAncestry=CS.draconicAncestry||null;p.background=CS.background||'';p.alignment=CS.alignment;
  p.classes=[{name:CS.classe,level:1}];p.abilities=[...finals];p.abilitiesLocked=true;
  const hpBase=cd?cd.hdVal:8;p.hpMax=Math.max(1,hpBase+mod(finals[2]));
  if(CS.race==='Nain des collines')p.hpMax+=1; // Ténacité naine
  p.hp=p.hpMax;
  p.ac=10+mod(finals[1]);p.speed=rd?rd.speed:9;
  p.skillProf={};p.skillsLocked={};
  const bgSk=bg?bg.skills:[];
  [...new Set([...bgSk,...CS.selectedSkills])].forEach(sk=>{p.skillProf[sk]=1;p.skillsLocked[sk]=true;});
  // Maîtrises de compétence RACIALES (auto + verrouillées) — additionnelles au quota classe/historique
  racialSkillProfs(CS.race).forEach(sk=>{p.skillProf[sk]=1;p.skillsLocked[sk]=true;});
  p.languages=rd?rd.languages:'Commun';
  p.proficiencies=cd?`Armures: ${cd.armor}\nArmes: ${cd.weapons}\nSauvegardes: ${cd.saves.join(', ')}${bg&&bg.tools?'\nOutils: '+bg.tools:''}`:'' ;
  // Maîtrises armes/armures
  p.weaponProfs=cd?cd.weaponTypes||[]:[];
  p.armorProfs=cd?cd.armorTypes||[]:[];
  p.inventory=[];p.equip={};
  if(!p.currency)p.currency={pc:0,pa:0,pe:0,po:0,pp:0};
  if(CS.goldMode&&CS.rolledGold>0){
    // Boutique de création : achats → inventaire ; le reste → bourse (po entiers + appoint en pa)
    (CS.bought||[]).forEach(b=>{
      const _arm=SRD.armors.find(a=>a.name===b.name);
      const _wpn=SRD.weapons.find(w=>w.name===b.name);
      const itemType=_arm?(_arm.type==='Bouclier'?'S':_arm.type==='Légère'?'LA':_arm.type==='Intermédiaire'?'MA':'HA'):(_wpn?(_wpn.subtype&&_wpn.subtype.includes('distance')?'R':'M'):'G');
      p.inventory.push({name:b.name,qty:b.qty||1,desc:b.desc||'',itemType});
    });
    const _left=_creGoldLeft();
    p.currency.po=(p.currency.po||0)+Math.floor(_left);
    const _paRest=Math.round((_left-Math.floor(_left))*10);
    if(_paRest>0)p.currency.pa=(p.currency.pa||0)+_paRest;
  }
  else if(!CS.goldMode&&cd&&cd.equipment&&cd.equipment[CS.equipChoice]){
    cd.equipment[CS.equipChoice].forEach(item=>{
      const _arm=SRD.armors.find(a=>a.name===item.name);
      const _wpn=SRD.weapons.find(w=>w.name===item.name);
      const itemType=_arm?(_arm.type==='Bouclier'?'S':_arm.type==='Légère'?'LA':_arm.type==='Intermédiaire'?'MA':'HA'):(_wpn?(_wpn.subtype&&_wpn.subtype.includes('distance')?'R':'M'):'G');
      p.inventory.push({name:item.name,qty:item.qty||1,desc:item.desc||'',itemType});
    });
    const arm=cd.equipment[CS.equipChoice].find(i=>SRD.armors.find(a=>a.name===i.name&&a.type!=='Bouclier'));
    const shield=cd.equipment[CS.equipChoice].find(i=>SRD.armors.find(a=>a.name===i.name&&a.type==='Bouclier'));
    const wpn=cd.equipment[CS.equipChoice].find(i=>SRD.weapons.find(w=>w.name===i.name));
    const rwpn=cd.equipment[CS.equipChoice].find(i=>SRD.weapons.find(w=>w.name===i.name&&w.subtype&&w.subtype.includes('distance')));
    if(arm)p.equip.chest={name:arm.name,desc:arm.desc||''};
    if(shield)p.equip.offhand={name:shield.name,desc:shield.desc||''};
    if(wpn&&!SRD.weapons.find(w=>w.name===wpn.name&&w.subtype&&w.subtype.includes('distance')))p.equip.mainhand={name:wpn.name,desc:wpn.desc||''};
    if(rwpn)p.equip.ranged={name:rwpn.name,desc:rwpn.desc||''};
    p.ac=_calcArmorCA(p);
  }
  p.spells=CS.selectedSpells.map(name=>({name}));p.spellsLocked=true;
  // Capacités de niveau 1 depuis CLASS_LEVEL_DATA
  p.features=getLevel1Features(CS.classe);
  // Archétype choisi en création (Ensorceleur, Occultiste niv.1)
  if(CS.archetype){
    const cdLu=CLASS_LEVEL_DATA[CS.classe];
    const arch=cdLu&&cdLu.archetypes?cdLu.archetypes.find(a=>a.name===CS.archetype):null;
    if(arch&&!p.features.find(f=>f.name===arch.name)){
      p.features.push({name:arch.name,desc:arch.desc,classe:CS.classe});
    }
    if(!p.archetype)p.archetype={};
    p.archetype[CS.classe]=CS.archetype;
    // Supprimer la feature "Origine d'ensorceleur (choix)..." générique si présente
    p.features=p.features.filter(f=>!f.name.includes('Origine d\'ensorceleur')&&!f.name.includes('Mécène d\'outremonde'));
  }
  // Style de combat choisi en création (Guerrier niv.1)
  if(CS.combatStyle){
    const cdLu2=CLASS_LEVEL_DATA[CS.classe];
    const style=cdLu2&&cdLu2.combatStyles?cdLu2.combatStyles.find(s=>s.name===CS.combatStyle):null;
    if(style)p.features.push({name:'Style : '+style.name,desc:style.desc,classe:CS.classe});
  }
  // Résistances raciales : désormais PASSIVES (calculées dans getPassiveResistances → verrouillées, non supprimables).
  // On n'écrit plus rien dans la liste éditable ; la liste ne contient que les résistances ajoutées à la main.
  p.dmgResistances=[];
  p.dmgImmunities=p.dmgImmunities||[];p.condImmunities=p.condImmunities||[];
  p.combatCharges={};
  p.xp=0;p.created=true;state.activeTab='perso';resetCS();render();
  showToast(`🎉 ${p.charName} est prêt à l'aventure !`);
  if(!localStorage.getItem('tuto_fiche_done')) setTimeout(()=>startTutorial('fiche'),1200);
}
