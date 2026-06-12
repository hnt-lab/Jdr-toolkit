
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
  "Rage implacable (revenir à 1 PV au lieu de 0, 1 fois par rage)":"Si tu tombes à 0 PV en rage, tu peux tomber à 1 PV à la place. Une fois par rage.",
  "Rage persistante (reste en rage si plus d'actions hostiles, sauf si inconscient)":"Ta rage ne s'arrête plus automatiquement si tu n'as pas attaqué ni subi de dégâts. Elle ne prend fin que si tu en décides ainsi, que tu t'évanouisses, ou que le combat se termine.",
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
  "Fougue (1/repos court) — action supplémentaire":"Action bonus : prends une seconde action (attaquer, foncer, désengager, esquiver, aider). 1 utilisation/repos court.",
  "Fougue (2/repos court) — action supplémentaire":"Tu peux utiliser Fougue 2 fois par repos court.",
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
  "Roublardise (1d6)":"1d6 dégâts supplémentaires si tu as l'avantage OU un allié adjacent à la cible (et tu n'as pas désavantage). Arme de finesse ou à distance. Progresse de +1d6 tous les 2 niveaux.",
  "Roublardise (2d6)":"Tes dés de Roublardise passent à 2d6.",
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
  "Action rusée (Foncer/Désengager/Cacher)":"Action bonus : Foncer, Se désengager ou Se cacher.",
  "Archétype (choix)":"Tu choisis ton archétype de roublard (Escroc, Archer arcanique, Assassin).",
  "Esquive totale":"Si un effet permet un JS DEX pour moitié dégâts, tu n'en subis aucun en cas de succès (et seulement moitié en cas d'échec).",
  "Esquive":"Action pour esquiver : toutes les attaques contre toi ont désavantage jusqu'à ton prochain tour.",
  "Expertise (2 autres compétences)":"Doublement du bonus de maîtrise pour 2 compétences supplémentaires.",
  "Talent de roublard":"Expertise sur 2 compétences supplémentaires ou avec des outils de voleur.",
  "Sens perspicace":"Avantage aux jets de Sagesse (Perspicacité) pour détecter les mensonges.",
  "Esprit glissant":"Avantage aux jets de sauvegarde de Charisme, Intelligence et Sagesse.",
  "Insaisissable":"Aucune attaque n'a l'avantage contre toi si tu n'es pas incapacité.",
  "Coup de chance":"Si tu rates un jet d'attaque, un jet de caractéristique ou un JS, tu peux le relancer (une fois par tour, récupéré après repos court ou long).",
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
  "Capacités du domaine divin":"Tu reçois les capacités spéciales de ton domaine divin choisi (Vie, Lumière, Nature, Tempête, Tromperie, Guerre).",
  "Capacité du domaine (Conduit divin)":"Tu peux utiliser une option de Conduit divin propre à ton domaine.",
  "Capacité du domaine":"Tu gagnes une nouvelle capacité de ton domaine divin.",
  "Sorts du domaine niv.2":"Tu prépares automatiquement les sorts de domaine de niveau 2.",
  "Sorts du domaine niv.3":"Tu prépares automatiquement les sorts de domaine de niveau 3.",
  "Sorts du domaine niv.4":"Tu prépares automatiquement les sorts de domaine de niveau 4.",
  "Sorts du domaine niv.5":"Tu prépares automatiquement les sorts de domaine de niveau 5.",
  "Sorts du domaine niv.7":"Tu prépares automatiquement les sorts de domaine de niveau 7.",
  "Sorts du domaine niv.8":"Tu prépares automatiquement les sorts de domaine de niveau 8.",
  "Sorts du domaine niv.9":"Tu prépares automatiquement les sorts de domaine de niveau 9.",
  "Destruction des morts-vivants (IM 1/2)":"Lors du Renvoi des morts-vivants, tu détruis les morts-vivants d'IM ≤ 1/2 au lieu de les faire fuir.",
  "Destruction des morts-vivants (IM 1)":"Lors du Renvoi, tu détruis les morts-vivants d'IM ≤ 1.",
  "Destruction des morts-vivants (IM 2)":"Lors du Renvoi, tu détruis les morts-vivants d'IM ≤ 2.",
  "Destruction des morts-vivants (IM 3)":"Lors du Renvoi, tu détruis les morts-vivants d'IM ≤ 3.",
  "Destruction des morts-vivants (IM 4)":"Lors du Renvoi, tu détruis les morts-vivants d'IM ≤ 4.",
  "Intervention divine":"Tu peux invoquer l'aide de ta divinité. 1 chance sur 100 de réussir à niv.1, +1% par niveau. En cas de succès, effet comme un sort divin. 1 utilisation/repos long si réussi.",
  "Intervention divine améliorée (succès automatique)":"L'Intervention divine réussit automatiquement.",
  // ── DRUIDE ──
  "Forme sauvage (CR 1/4, pas nage/vol)":"Action : transformation en bête de CR ≤ 1/4, sans nage ni vol. 2 fois/repos court. Dure niv/2 heures max.",
  "Forme sauvage améliorée (CR 1/2 nage)":"Forme sauvage : CR ≤ 1/2, les bêtes nageuses sont autorisées.",
  "Forme sauvage (CR 1, vol)":"Forme sauvage : CR ≤ 1, les bêtes volantes sont autorisées.",
  "Forme sauvage (CR 2)":"Forme sauvage : CR ≤ 2.",
  "Cercle druidique (choix)":"Tu rejoins un Cercle druidique (Lune ou Terres) qui définit tes capacités avancées.",
  "Frappe primitive":"Cercle de la lune niv.6 — En forme animale, tes attaques sont considérées comme magiques. Elles ignorent les résistances et immunités aux dégâts non magiques.",
  "Forme élémentaire":"Cercle de la lune niv.10 — Tu peux dépenser 2 utilisations de Forme sauvage pour te transformer en élémentaire de CR 5 ou moins (air, eau, terre, feu). Tu récupères la Forme sauvage au repos long.",
  "Mille formes":"Cercle de la lune niv.14 — Tu peux utiliser la magie de Modification d'apparence à volonté, sous forme d'action bonus.",
  "Foulée tellurique":"Cercle des terres niv.6 — Les terrains difficiles non-magiques ne te coûtent pas de déplacement supplémentaire.",
  "Protégée de dame Nature":"Cercle des terres niv.10 — Tu es immunisée aux poisons et maladies. Tu ne peux être charmée ni effrayée par des élémentaires ou des fées. Tu résistes aux types élémentaires.",
  "Sanctuaire de dame Nature":"Cercle des terres niv.14 — Les bêtes et plantes doivent réussir un JS de Sagesse (DD 8 + bonus de maîtrise + mod. SAG) pour t'attaquer, ou elles choisissent une autre cible.",
  "Récupération naturelle":"Cercle des terres niv.2 — Une fois par repos long, lors d'un repos court, tu récupères des emplacements de sorts dont le total de niveaux est ≤ à la moitié de ton niveau de druide (max niv.5).",
  "Sorts du cercle niv.2":"Tu prépares automatiquement les sorts de ton Cercle de niveau 2.",
  "Sorts du cercle niv.3":"Tu prépares automatiquement les sorts de ton Cercle de niveau 3.",
  "Sorts du cercle niv.4":"Tu prépares automatiquement les sorts de ton Cercle de niveau 4.",
  "Sorts du cercle niv.5":"Tu prépares automatiquement les sorts de ton Cercle de niveau 5.",
  "Capacité du cercle":"Tu gagnes une nouvelle capacité de ton Cercle druidique.",
  "Corps intemporel (vieillissement ×10)":"Tu vieillis 10 fois plus lentement grâce à la magie druidique.",
  "Sorts de bête":"En forme sauvage, tu peux lancer des sorts avec composantes verbale et somatique.",
  "Accès aux emplacements de sorts de niveau 6":"Tu débloques des emplacements de sorts de niveau 6. En tant que Druide préparé, tu peux préparer n'importe quel sort Druide de niveau 6 lors d'un repos long.",
  "Accès aux emplacements de sorts de niveau 7":"Tu débloques des emplacements de sorts de niveau 7. En tant que Druide préparé, tu peux préparer n'importe quel sort Druide de niveau 7 lors d'un repos long.",
  "Accès aux emplacements de sorts de niveau 8":"Tu débloques des emplacements de sorts de niveau 8. En tant que Druide préparé, tu peux préparer n'importe quel sort Druide de niveau 8 lors d'un repos long.",
  "Accès aux emplacements de sorts de niveau 9":"Tu débloques des emplacements de sorts de niveau 9. En tant que Druide préparé, tu peux préparer n'importe quel sort Druide de niveau 9 lors d'un repos long.",
  "Archidruide (Forme sauvage illimitée)":"Tu peux utiliser la Forme sauvage un nombre illimité de fois.",
  // ── BARDE ──
  "Incantation":"Tu peux lancer des sorts en utilisant CHA comme modificateur de sort.",
  "Inspiration bardique (1d6, CHA fois/repos long)":"Action bonus : accorde 1d6 d'inspiration bardique à un allié à 18m. Il peut l'ajouter à un jet d'attaque, de carac. ou de sauvegarde dans l'heure. CHA utilisations/repos long.",
  "Touche-à-tout":"Moitié du bonus de maîtrise (arrondi inférieur) pour les jets de compétence où tu n'as pas la maîtrise.",
  "Chant reposant (1d6)":"Lors d'un repos court, tes alliés qui entendent ta musique regagnent 1d6 PV supplémentaires en dépensant leurs dés de vie.",
  "Chant reposant (1d8)":"Tes alliés regagnent 1d8 PV supplémentaires avec le Chant reposant.",
  "Chant reposant (1d10)":"Tes alliés regagnent 1d10 PV supplémentaires avec le Chant reposant.",
  "Chant reposant (1d12)":"Tes alliés regagnent 1d12 PV supplémentaires avec le Chant reposant.",
  "Collège bardique (choix)":"Tu rejoins un Collège bardique (Savoir ou Vaillance) qui définit tes capacités avancées.",
  "Expertise (2 compétences ×2 maîtrise)":"Doublement du bonus de maîtrise pour 2 compétences de ton choix parmi celles que tu maîtrises.",
  "Expertise (2 autres compétences)":"Doublement du bonus de maîtrise pour 2 compétences supplémentaires.",
  "Contre-charme":"Action : tu émets un son pour protéger tes alliés à 9m contre les effets de charme et de peur. Concentration, jusqu'à la fin de ton prochain tour.",
  "Secrets magiques (2 sorts)":"Tu apprends 2 sorts de n'importe quelle classe. Ils comptent comme des sorts de barde.",
  "Secrets magiques (2 sorts supp.)":"Tu apprends 2 sorts supplémentaires de n'importe quelle classe.",
  "Inspiration bardique (1d8)":"Ton dé d'Inspiration bardique passe à 1d8.",
  "Inspiration bardique (1d10)":"Ton dé d'Inspiration bardique passe à 1d10.",
  "Inspiration bardique (1d12)":"Ton dé d'Inspiration bardique passe à 1d12.",
  "Source d'inspiration (repos court)":"Tu récupères tes utilisations d'Inspiration bardique au repos court au lieu du repos long.",
  "Inspiration bardique (CHA/repos court)":"Tu récupères tes utilisations d'Inspiration bardique au repos court.",
  "Magie supérieure (2 sorts supplémentaires)":"Tu apprends 2 sorts supplémentaires de n'importe quelle classe.",
  "Inspiration supérieure (min 1 dé si 0)":"Si tu n'as plus d'Inspiration bardique au début de ton tour, tu en récupères 1.",
  "Capacité du collège":"Tu gagnes une nouvelle capacité de ton Collège bardique.",
  // ── MOINE ──
  "Arts martiaux (1d4)":"Sans armure ni bouclier : attaque à mains nues = 1d4 + DEX ou FOR. Après l'action Attaquer, attaque bonus à mains nues. Les attaques à mains nues sont des armes de moine.",
  "Arts martiaux 1d6":"Tes attaques à mains nues infligent 1d6 dégâts.",
  "Arts martiaux 1d8":"Tes attaques à mains nues infligent 1d8 dégâts.",
  "Arts martiaux 1d10":"Tes attaques à mains nues infligent 1d10 dégâts.",
  "Défense sans armure (CA=10+DEX+SAG)":"Sans armure ni bouclier, ta CA = 10 + mod DEX + mod SAG.",
  "Ki (2 pts)":"Points de ki = niveau. Récupérés au repos court. Permettent : Déluge de coups (action bonus : 2 attaques à mains nues), Pas du vent (désengagement OU esquive), Parade de projectiles.",
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
  "Quiétude de l'esprit":"Action : mettre fin à un effet de charme ou de peur qui t'affecte.",
  "Déplacement rapide amélioré":"Ta vitesse de déplacement augmente encore.",
  "Pureté du corps":"Immunité aux maladies et aux poisons.",
  "Langue du soleil et de la lune":"Tu comprends toutes les créatures parlantes et elles te comprennent.",
  "Âme de diamant (JS tous maîtrisés)":"Maîtrise de tous les jets de sauvegarde. Si tu rates l'un d'eux, tu peux dépenser 1 point de ki pour le relancer.",
  "Corps intemporel":"Tu vieillis 10 fois plus lentement. Pas besoin de nourriture ni d'eau.",
  "Vide":"Action : immunité aux dégâts jusqu'au début de ton prochain tour. Dépense 4 points de ki.",
  "Perfection du moi (+4 DEX/SAG sans dépasser 25)":"Tes scores de Dextérité et de Sagesse augmentent de 4, leur maximum est 25.",
  "Capacité de déplacement 1 (capacité monastique)":"Tu gagnes une capacité avancée de ta Tradition monastique.",
  "Capacité monastique":"Tu gagnes une nouvelle capacité de ta Tradition monastique.",
  "Déplacement 1 (capacité monastique)":"Tu gagnes une capacité de ta tradition monastique.",
  // ── RÔDEUR ──
  "Ennemi juré (1 type)":"Avantage aux jets de Sagesse (Survie/Pistage) et de Connaissance sur un type d'ennemi juré. Bonus aux jets d'attaque contre eux. Apprends une langue de ce type.",
  "Ennemi juré (2 types)":"Tu as maintenant 2 types d'ennemis jurés.",
  "Ennemi juré (3 types)":"Tu as maintenant 3 types d'ennemis jurés.",
  "Ennemi juré amélioré":"Tes capacités contre les ennemis jurés sont améliorées.",
  "Ennemi juré suprême":"Tu peux choisir n'importe quel type de créature comme ennemi juré temporaire.",
  "Explorateur-né (1 terrain)":"Dans un terrain de prédilection : avantage aux jets INT/SAG, double maîtrise si applicable, jamais perdu, groupe marche discrètement, fourrager double les vivres.",
  "Explorateur-né (2 terrains)":"Tu as maintenant 2 terrains de prédilection.",
  "Explorateur-né (3 terrains)":"Tu as maintenant 3 terrains de prédilection.",
  "Conscience primitive":"Action : concentrer 1 min sur un terrain de prédilection pour détecter les types d'ennemis jurés à 1,5 km (nature) ou 300m (ailleurs).",
  "Archétype (choix)":"Tu choisis ton archétype de rôdeur (Chasseur ou Maître des bêtes).",
  "Capacité de l'archétype de rôdeur":"Tu gagnes une nouvelle capacité de ton archétype de rôdeur.",
  "Attaque supplémentaire":"Tu peux attaquer deux fois lorsque tu prends l'action Attaquer.",
  "Déplacement sylvestre":"Tu peux traverser une végétation non magique sans être ralenti ni blessé.",
  "Camouflage naturel":"Tu peux te cacher si partiellement dissimulé par la végétation, même légère.",
  "Conscience des terres":"Ton Explorateur-né s'applique désormais dans tous les terrains.",
  "Vision des terres":"Tu peux voir à travers la végétation dense comme si elle était du verre teinté.",
  "Sens de la terre":"Tu peux détecter le passage de créatures à travers le sol dans un rayon de 18m.",
  "Disparition":"Action : te cacher. Tu peux disparaître quand tu es à découvert si dans la nature.",
  "Chasseur insaisissable":"Tu ne peux pas être pisté par des moyens non magiques si tu ne veux pas l'être.",
  "Style de combat":"Tu choisis un style de combat qui t'accorde un bonus permanent.",
  // ── ENSORCELEUR ──
  "Incantation":"Tu peux lancer des sorts en utilisant CHA comme modificateur de sort.",
  "Origine d'ensorceleur (choix) — capacité immédiate selon l'origine":"Tu choisis ton Origine draconique qui t'accorde des capacités innées dès le niveau 1.",
  "Points de sorcellerie (2 pts)":"Points de sorcellerie = niveau. Servent à la Magie flexible et à la Métamagie.",
  "Magie flexible (convertir emplacements↔points de sorcellerie)":"Dépense des emplacements de sorts pour gagner des points de sorcellerie (niv×1) ou vice versa (créer un emplacement niv1=2pts, niv2=3pts, niv3=5pts, niv4=6pts, niv5=7pts).",
  "Métamagie (2 options au choix)":"Tu choisis 2 options de Métamagie pour modifier tes sorts en dépensant des points de sorcellerie.",
  "Métamagie (3e option)":"Tu choisis une 3e option de Métamagie.",
  "Métamagie (4e option)":"Tu choisis une 4e option de Métamagie.",
  "Capacité de l'origine (niv.6)":"Tu gagnes la capacité de niveau 6 de ton Origine draconique.",
  "Capacité de l'origine (niv.14)":"Tu gagnes la capacité de niveau 14 de ton Origine draconique.",
  "Capacité de l'origine (niv.18)":"Tu gagnes la capacité de niveau 18 de ton Origine draconique.",
  "Restauration d'ensorceleur (récupère 4 pts de sorcellerie si à 0, 1/repos long)":"Au début de ton tour, si tu as 0 point de sorcellerie, tu en récupères 4. 1 fois/repos long.",
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
const _GENERIC_FEAT_NAMES=['Capacité de la voie','Capacité de la voie primitive',"Capacité de l'archétype","Capacité de l'archétype martial","Capacité de l'archétype de rôdeur",'Amélioration archétype',"Amélioration de l'archétype",'Capacité du domaine','Capacité du serment','Capacité du serment sacré','Capacité du cercle','Capacité du collège','Capacité monastique','Capacité de la tradition monastique','Capacité du spécialiste'];
function _migrateGenericFeats(p){
  if(!p||!Array.isArray(p.features))return;
  if(!p.features.some(f=>_GENERIC_FEAT_NAMES.includes(f.name)))return; // aucun générique → rien à faire
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
  let TABS=[
    {id:'perso',label:'🧑 Perso'},
    {id:'competences',label:'🎯 Compétences'},
    {id:'combat',label:'⚔️ Combat'},
    {id:'sorts',label:'✨ Sorts'},
    {id:'equipement',label:'🛡️ Équip.'},
    {id:'sac',label:'🎒 Sac'},
    {id:'historique',label:'📖 Historique'},
    {id:'journal',label:'📝 Journal'},
    {id:'xp',label:'⭐ XP',cls:(()=>{const _lvl=totalLevel(p);const _nxt=XP_LEVELS[_lvl]||XP_LEVELS[19];return(p.xp||0)>=_nxt&&_lvl<20&&!p.pendingLevelUp?'lvlup':''})()},
  ];
  if(p.tabOrder&&p.tabOrder.length){
    const ordered=[];
    p.tabOrder.forEach(id=>{const t=TABS.find(x=>x.id===id);if(t)ordered.push(t);});
    TABS.forEach(t=>{if(!ordered.find(x=>x.id===t.id))ordered.push(t);});
    TABS=ordered;
  }
  if(p.pendingLevelUp)TABS.push({id:'levelup',label:'⬆ Niveau +',cls:'lvlup'});
  bar.innerHTML=TABS.map(t=>`<button class="tab${state.activeTab===t.id?' on':''}${t.cls?' '+t.cls:''}" onclick="setTab('${t.id}')">${t.label}</button>`).join('')
    +`<button class="tab" onclick="openPrivacySettings()" title="Confidentialité" style="margin-left:auto;opacity:.7;font-size:18px">🔒</button>`
    +`<button class="tab" onclick="openTabOrderSettings()" title="Réorganiser les onglets" style="opacity:.7;font-size:18px">↕</button>`;
}

function openTabOrderSettings(){
  const p=P();
  const BASE_IDS=['perso','competences','combat','sorts','equipement','sac','historique','journal','xp'];
  const LABELS={perso:'🧑 Perso',competences:'🎯 Compétences',combat:'⚔️ Combat',sorts:'✨ Sorts',equipement:'🛡️ Équip.',sac:'🎒 Sac',historique:'📖 Historique',journal:'📝 Journal',xp:'⭐ XP'};
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
    return`<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;margin-bottom:5px">
      <span style="font-size:19px;flex:1">${LABELS[id]||id}</span>
      <button onclick="_tabOrderMove('${id}',-1)" ${isFirst?'disabled':''} style="background:none;border:1px solid var(--border);color:var(--text);border-radius:5px;padding:3px 9px;cursor:pointer;font-size:19px;opacity:${isFirst?.3:1}">↑</button>
      <button onclick="_tabOrderMove('${id}',1)" ${isLast?'disabled':''} style="background:none;border:1px solid var(--border);color:var(--text);border-radius:5px;padding:3px 9px;cursor:pointer;font-size:19px;opacity:${isLast?.3:1}">↓</button>
    </div>`;
  }).join('');
  openModal(`<div class="pt">↕ Réorganiser les onglets</div>
    <p style="font-size:18px;color:var(--text3);margin-bottom:12px">Déplace les onglets pour les mettre dans l'ordre qui te convient. La modification est sauvegardée avec ta fiche.</p>
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
  _enableTabDrag();applyAllSectionOrders(); // FIX : enveloppe + ordre AUSSI au changement d'onglet (sinon le drag « saute »)
  setTimeout(autoGrowAll,0);
}

function renderTab(){
  const el=document.getElementById('tabContent');if(!el)return;
  const p=P();
  if(!p.created){el.innerHTML=tabCreation(p);return;}
  const map={perso:tabPerso,competences:tabCompetences,combat:tabCombat,equipement:tabEquipement,sac:tabSac,historique:tabHistorique,xp:tabXP,sorts:tabSorts,levelup:tabLevelUp,journal:tabJournal};
  el.innerHTML=(map[state.activeTab]||tabPerso)(p);
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
  openModal(`<div class="pt" style="color:#e53935">🗑 Supprimer</div>
    <p style="font-size:18px;color:var(--text2);margin-bottom:12px">Tape <strong style="color:var(--cp)">${esc(nom)}</strong> pour confirmer :</p>
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
    ${steps.map((s,i)=>`<span class="cp-step${i<stepIdx?' done':i===stepIdx?' active':''}">${i<stepIdx?'✓ ':''+(i+1)+'. '}${s}</span>${i<steps.length-1?'<span style="color:var(--text3);font-size:15px;align-self:center">›</span>':''}`).join('')}
  </div>`;
  const map={1:creStep1,2:creStep2,3:creStep3,4:creStep4,5:creStep5,6:()=>{const cd=SRD.classes.find(c=>c.name===CS.classe);return cd&&cd.spellcaster&&cd.startSpells>0?creStep6Sorts():creStep7();},7:()=>{const cd=SRD.classes.find(c=>c.name===CS.classe);return cd&&cd.spellcaster&&cd.startSpells>0?creStep7():creStep8();},8:creStep8};
  return`<div class="creation-wrap"><div class="panel"><div class="pt" style="font-size:21px">🧙 Création du personnage</div>${progress}${(map[CS.step]||creStep1)()}</div></div>`;
}

function creStep1(){
  const isDragonide = CS.race==='Dragonide';
  const canContinue = CS.race && (!isDragonide || CS.draconicAncestry);
  return`<div><p style="font-size:18px;color:var(--text2);margin-bottom:12px">Choisis la race de ton personnage.</p>
    <div class="crd-grid">${SRD.races.map(r=>{const b=r.allBonus?`+${r.allBonus} à tout`:r.bonuses.map((v,i)=>v?`+${v} ${ABILITIES_SH[i]}`:'').filter(Boolean).join(', ');return`<div class="crd${CS.race===r.name?' selected':''}" onclick="CS.race='${esc(r.name)}';CS.draconicAncestry=null;CS.flexSet=0;CS.flexChoices=[];renderTab()"><h3>${esc(r.name)}</h3><p>${esc(r.traits.slice(0,65))}…</p><span class="tag">🏃 ${r.speed}m</span><span class="tag" style="color:#4caf50">${b}</span></div>`;}).join('')}</div>
    ${CS.race?`<div style="margin-top:12px;padding:10px;background:var(--surface2);border-radius:8px"><div style="font-size:18px;font-weight:600;color:var(--cp)">${esc(CS.race)}</div><div style="font-size:18px;color:var(--text2);margin-top:4px">${esc((SRD.races.find(r=>r.name===CS.race)||{}).traits||'')}</div></div>`:''}
    ${isDragonide?`<div style="margin-top:12px">
      <div style="font-size:18px;font-weight:600;color:var(--cp);margin-bottom:8px">🐉 Choisis ton ascendance draconique <span style="color:#e53935">*</span></div>
      <div class="crd-grid">${SRD.draconicAncestries.map(a=>`<div class="crd${CS.draconicAncestry===a.name?' selected':''}" onclick="CS.draconicAncestry='${esc(a.name)}';renderTab()">
        <h3>${a.icon} ${esc(a.name)}</h3>
        <p style="font-size:17px">${esc(a.damage)}</p>
        <span class="tag" style="font-size:15px">${esc(a.shape)}</span>
      </div>`).join('')}</div>
      ${CS.draconicAncestry?`<div style="margin-top:8px;padding:8px;background:var(--surface2);border-radius:6px;font-size:18px;color:#4caf50">✓ Dragon <strong>${esc(CS.draconicAncestry)}</strong> — Souffle : ${esc((SRD.draconicAncestries.find(a=>a.name===CS.draconicAncestry)||{}).damage||'')} (${esc((SRD.draconicAncestries.find(a=>a.name===CS.draconicAncestry)||{}).shape||'')})</div>`:``}
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
  return`<div><p style="font-size:18px;color:var(--text2);margin-bottom:12px">Choisis la classe de ton personnage.</p>
    <div class="crd-grid">${SRD.classes.map(c=>`<div class="crd${CS.classe===c.name?' selected':''}" onclick="CS.classe='${esc(c.name)}';CS.archetype=null;CS.combatStyle=null;renderTab()"><h3>${esc(c.name)}</h3><p>${c.hd}${c.spellcaster?' • ✦ sorts':''}</p><span class="tag">JS: ${c.saves.join(', ')}</span><span class="tag" style="color:var(--cp)">${c.skillCount} comp.</span><span class="tag" style="color:#ffd54f">★ ${(c.primaryStats||[]).join(', ')}</span></div>`).join('')}</div>
    ${CS.classe?`<div style="margin-top:12px;padding:10px;background:var(--surface2);border-radius:8px">${(()=>{const c=SRD.classes.find(cl=>cl.name===CS.classe);return c?`<div style="font-size:18px;font-weight:600;color:var(--cp)">${esc(c.name)}</div><div style="font-size:18px;color:var(--text2);margin-top:4px">Armures: ${esc(c.armor)} • Armes: ${esc(c.weapons)}</div>`:''})()}</div>
    ${hasArchetype?`<div style="margin-top:12px"><div style="font-size:18px;font-weight:600;color:var(--cp);margin-bottom:8px">${CS.classe==='Ensorceleur'?'🔮 Choisis ton Origine draconique':'🌑 Choisis ton Mécène d\'Outremonde'} <span style="color:#e53935">*</span></div>
      <div class="crd-grid">${archetypes.map(a=>`<div class="crd${CS.archetype===a.name?' selected':''}" onclick="CS.archetype='${a.name.replace(/'/g,"\\'").replace(/"/g,'&quot;')}';renderTab()"><h3>${a.icon||''} ${esc(a.name)}</h3><p>${esc(a.desc.slice(0,80))}…</p></div>`).join('')}</div>
      ${CS.archetype?`<div style="margin-top:8px;padding:8px;background:var(--surface2);border-radius:6px;font-size:18px;color:#4caf50">✓ ${esc(CS.archetype)} sélectionné</div>`:''}</div>`:''}
    ${hasStyle?`<div style="margin-top:12px"><div style="font-size:18px;font-weight:600;color:var(--cp);margin-bottom:8px">⚔ Choisis ton style de combat <span style="color:#e53935">*</span></div>
      <div class="crd-grid">${styles.map(s=>`<div class="crd${CS.combatStyle===s.name?' selected':''}" onclick="CS.combatStyle='${esc(s.name)}';renderTab()"><h3>${esc(s.name)}</h3><p>${esc(s.desc)}</p></div>`).join('')}</div>
      ${CS.combatStyle?`<div style="margin-top:8px;padding:8px;background:var(--surface2);border-radius:6px;font-size:18px;color:#4caf50">✓ Style : ${esc(CS.combatStyle)}</div>`:''}</div>`:''}
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
    <div style="display:flex;gap:8px;margin-bottom:14px"><button class="smb${CS.statMethod==='pointbuy'?' on':''}" onclick="CS.statMethod='pointbuy';renderTab()">🪙 Achat de points</button><button class="smb${CS.statMethod==='dice'?' on':''}" onclick="CS.statMethod='dice';renderTab()">🎲 Lancer les dés</button></div>
    ${CS.statMethod==='pointbuy'?`<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;padding:8px;background:var(--surface2);border-radius:8px"><span style="font-size:18px;color:var(--text2)">Points restants :</span><span style="font-size:20px;font-weight:700;color:${rem<0?'#e53935':'var(--cp)'}">${rem}</span><span style="font-size:17px;color:var(--text3)">/ 27 • valeurs 8–15</span></div>`:''}
    ${CS.statMethod==='dice'?`<div style="margin-bottom:12px"><button class="btn bac" onclick="CS.diceRolls=ABILITIES.map(()=>{const d=[1,2,3,4].map(()=>Math.ceil(Math.random()*6));d.sort((a,b)=>b-a);return d[0]+d[1]+d[2];});renderTab()">🎲 Lancer les 6 dés (4d6 garde 3)</button>${CS.diceRolls?`<span style="margin-left:10px;font-size:18px;color:var(--cp)">${CS.diceRolls.join(' — ')}</span>`:''}</div>`:''}
    ${ABILITIES.map((ab,i)=>{const v=CS.statMethod==='dice'&&CS.diceRolls?CS.diceRolls[i]:CS.baseStats[i];const fx=flexSet?flexSet.reduce((a,val,k)=>a+(CS.flexChoices[k]===i?val:0),0):0;const rb=(rd?(rd.allBonus||rd.bonuses[i]||0):0)+fx;const final=v+rb;const canInc=CS.statMethod==='pointbuy'&&v<15&&rem>=(POINT_BUY_COST[v+1]||99)-POINT_BUY_COST[v];const canDec=CS.statMethod==='pointbuy'&&v>8;const isPrio=cd&&cd.primaryStats&&cd.primaryStats.includes(ABILITIES_SH[i]);
    return`<div class="stat-row"><span class="stat-row-name">${ab}${isPrio?` <span style="color:#ffd54f;font-size:15px">★</span>`:''}</span>${CS.statMethod==='pointbuy'?`<div class="stat-ctrl"><button onclick="creStatDec(${i})" ${canDec?'':'disabled'}>−</button><span class="stat-val">${v}</span><button onclick="creStatInc(${i})" ${canInc?'':'disabled'}>+</button></div>`:`<span class="stat-val" style="margin:0 8px">${v}</span>`}<span style="font-size:18px;color:var(--cp);width:28px">${fmt(mod(v))}</span>${rb?`<span style="font-size:17px;color:#4caf50;width:50px">+${rb} race</span>`:`<span style="width:50px"></span>`}<span style="font-size:17px;color:var(--text3)">→</span><span style="font-size:22px;font-weight:700;color:var(--cp);width:28px;text-align:center">${final}</span><span style="font-size:18px;color:var(--text2)">${fmt(mod(final))}</span></div>`;}).join('')}
    ${flexSet?`<div style="margin-top:12px;padding:10px;background:var(--surface2);border:1px solid var(--cp);border-radius:8px">
      <div style="font-size:18px;font-weight:600;color:var(--cp);margin-bottom:6px">🧬 Bonus raciaux au choix</div>
      ${flexSets.length>1?`<div style="display:flex;gap:6px;margin-bottom:8px">${flexSets.map((s,k)=>`<button class="smb${k===(CS.flexSet||0)?' on':''}" onclick="CS.flexSet=${k};CS.flexChoices=[];renderTab()">${s.map(v=>'+'+v).join(' / ')}</button>`).join('')}</div>`:''}
      ${flexSet.map((val,k)=>`<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="font-size:19px;font-weight:700;color:#4caf50;width:34px">+${val}</span>
        <select class="fi" style="flex:1;margin:0" onchange="CS.flexChoices[${k}]=this.value===''?null:parseInt(this.value);renderTab()">
          <option value="">— choisir une caractéristique —</option>
          ${ABILITIES.map((ab,i)=>{const fixed=!!(rd&&(rd.allBonus||(rd.bonuses&&rd.bonuses[i]>0)));const taken=CS.flexChoices.some((c,kk)=>kk!==k&&c===i);if(fixed||taken)return'';return`<option value="${i}"${CS.flexChoices[k]===i?' selected':''}>${ab}</option>`;}).join('')}
        </select></div>`).join('')}
      ${flexIncomplete?`<div style="font-size:16px;color:#ff9800">⚠ Choisis ${flexSet.length>1?'toutes tes caractéristiques bonus':'ta caractéristique bonus'} pour continuer.</div>`:''}
    </div>`:''}
    <div style="margin-top:10px;padding:8px;background:var(--surface2);border-radius:8px;font-size:18px;color:var(--text2)">PV de départ estimés : <strong style="color:var(--cp)">${hpTotal}</strong></div>
    <div style="display:flex;gap:8px;margin-top:12px"><button class="btn" style="flex:1" onclick="CS.step=2;renderTab()">← Retour</button><button class="btn bac" style="flex:2" onclick="CS.step=4;renderTab()" ${(CS.statMethod==='dice'&&!CS.diceRolls)||flexIncomplete?'disabled':''}>Continuer → Historique</button></div>
  </div>`;
}
function creStatInc(i){const v=CS.baseStats[i];if(v>=15)return;const cost=(POINT_BUY_COST[v+1]||99)-POINT_BUY_COST[v];if(27-pointsSpent(CS.baseStats)<cost)return;CS.baseStats[i]++;renderTab();}
function creStatDec(i){if(CS.baseStats[i]<=8)return;CS.baseStats[i]--;renderTab();}

function creStep4(){
  const bg=CS.background?BACKGROUNDS.find(b=>b.name===CS.background):null;
  return`<div><p style="font-size:18px;color:var(--text2);margin-bottom:12px">L'historique t'accorde 2 compétences et des maîtrises d'outils/langues.</p>
    <div class="fl mb6">Cherche ou clique</div>
    <div class="acw mb10"><input class="fi" id="bgInputCre" placeholder="Historique..." value="${esc(CS.background||'')}" oninput="if(!BACKGROUNDS_DB)loadBackgroundsDB(()=>searchCreBG(this.value));else searchCreBG(this.value)" autocomplete="off"><div class="acd" id="bgDropCre"></div></div>
    <div class="crd-grid" style="grid-template-columns:repeat(auto-fill,minmax(130px,1fr))">${BACKGROUNDS.map(b=>`<div class="crd${CS.background===b.name?' selected':''}" onclick="CS.background='${esc(b.name)}';document.getElementById('bgInputCre').value='${esc(b.name)}';document.getElementById('bgDropCre').style.display='none';renderTab()"><h3 style="font-size:17px">${esc(b.name)}</h3><p>${esc(b.skills.join(', '))}</p>${b.tools?`<span class="tag">${esc(b.tools.slice(0,20))}</span>`:''}${b.langs?`<span class="tag">+${b.langs} langue${b.langs>1?'s':''}</span>`:''}</div>`).join('')}</div>
    ${bg?`<div style="margin-top:12px;padding:12px;background:var(--surface2);border-radius:8px"><div style="font-size:18px;font-weight:600;color:var(--cp)">${esc(bg.name)}</div><div style="font-size:18px;color:var(--text2);margin-bottom:4px">${esc(bg.desc)}</div><div style="font-size:18px;color:#4caf50">Compétences : ${bg.skills.join(', ')}</div>${bg.tools?`<div style="font-size:18px;color:var(--text2);margin-top:2px">Outils : ${esc(bg.tools)}</div>`:''}${bg.langs?`<div style="font-size:18px;color:var(--text2);margin-top:2px">Langues supplémentaires : ${bg.langs}</div>`:''}</div>
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
  drop.innerHTML=res.map((b,i)=>`<div class="aci" onmousedown="event.preventDefault();_selectCreBGIdx(${i})"><div class="ain">${esc(b.name)}${b._comp?' <span style="font-size:15px;color:var(--text3)">[Compendium]</span>':''}</div><div class="ais">${esc(b.skills.join(', '))||'—'} — ${esc(b.desc||'')}</div></div>`).join('');
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
    <p style="font-size:18px;color:var(--text2);margin-bottom:8px">Choisis <strong style="color:var(--cp)">${max} compétences</strong> parmi celles de la classe ${esc(CS.classe)}.</p>
    ${bgSk.length?`<div style="padding:8px 10px;background:rgba(76,175,80,.1);border:1px solid #4caf50;border-radius:6px;margin-bottom:10px;font-size:18px;color:#4caf50">✓ Via l'historique <strong>${esc(CS.background)}</strong> : ${bgSk.join(', ')}</div>`:''}
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;padding:6px 10px;background:var(--surface2);border-radius:6px"><span style="font-size:18px;color:var(--text2)">Sélectionnées :</span><span style="font-size:25px;font-weight:700;color:var(--cp)">${sel.length}/${max}</span></div>
    ${cd.skills.map(sk=>{const isBg=bgSk.includes(sk);const isSel=sel.includes(sk);const dis=!isSel&&sel.length>=max;return`<div class="sk-choice${isBg?' from-bg':isSel?' selected':dis?' disabled':''}" onclick="${dis&&!isBg?'':'creToggleSkill(\''+sk+'\')'}"><span class="sk-dot${isBg||isSel?' p':''}"></span><span style="flex:1;font-size:18px">${esc(sk)}${isBg?' <span style="font-size:15px;color:#4caf50">(historique)</span>':''}</span>${isBg?`<span style="font-size:17px;color:#4caf50">✓</span>`:isSel?`<span style="color:var(--cp)">✓</span>`:''}</div>`;}).join('')}
    <div style="margin-top:12px;padding:10px;background:var(--surface2);border-radius:8px"><div style="font-size:17px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Maîtrises</div><div style="font-size:18px;color:var(--text2)">Armures : ${esc(cd.armor)} • Armes : ${esc(cd.weapons)}</div><div style="font-size:18px;color:var(--text2);margin-top:2px">Sauvegardes : ${cd.saves.join(', ')}</div></div>
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
    <p style="font-size:18px;color:var(--text2);margin-bottom:12px">Choisis tes sorts de départ pour ${esc(CS.classe)}.</p>
    <div style="display:flex;gap:10px;margin-bottom:12px">
      <div style="flex:1;padding:8px;background:var(--surface2);border-radius:8px;text-align:center"><div style="font-size:17px;color:var(--text3)">Sorts mineurs</div><div style="font-size:20px;font-weight:700;color:var(--cp)">${selC.length}/${cantripCount}</div></div>
      <div style="flex:1;padding:8px;background:var(--surface2);border-radius:8px;text-align:center"><div style="font-size:17px;color:var(--text3)">Sorts niv.1</div><div style="font-size:20px;font-weight:700;color:var(--cp)">${selL1.length}/${l1Max}</div></div>
    </div>
    <div style="font-size:18px;font-weight:600;color:var(--cp);margin-bottom:6px">Sorts mineurs</div>
    ${(SPELLS_DB||SRD.spells).filter(s=>s.level===0&&(!SPELLS_DB||(s.classes||[]).includes(CS.classe||''))).map(s=>{const isSel=sel.includes(s.name);const dis=!isSel&&selC.length>=cantripCount;return`<div class="sk-choice${isSel?' selected':dis?' disabled':''}" onclick="${dis?'':'creToggleSpell(\''+jsq(s.name)+'\')'}"><span class="sk-dot${isSel?' p':''}"></span><span style="flex:1;font-size:18px">${esc(s.name)}</span><span style="font-size:17px;color:var(--text3)">${esc(s.school)} • ${esc(s.castTime)}</span>${isSel?`<span style="color:var(--cp)">✓</span>`:''}</div>`;}).join('')}
    <div style="font-size:18px;font-weight:600;color:var(--cp);margin:10px 0 6px">Sorts de niveau 1</div>
    ${getSpellsDB().filter(s=>s.level===1&&(!SPELLS_DB||(s.classes||[]).includes(CS.classe||''))).map(s=>{const isSel=sel.includes(s.name);const dis=!isSel&&selL1.length>=l1Max;return`<div class="sk-choice${isSel?' selected':dis?' disabled':''}" onclick="${dis?'':'creToggleSpell(\''+jsq(s.name)+'\')'}"><span class="sk-dot${isSel?' p':''}"></span><span style="flex:1;font-size:18px">${esc(s.name)}</span><span style="font-size:17px;color:var(--text3)">${esc(s.school)}${s.damage?' • '+esc(s.damage):''}</span>${isSel?`<span style="color:var(--cp)">✓</span>`:''}</div>`;}).join('')}
    <div style="display:flex;gap:8px;margin-top:12px"><button class="btn" style="flex:1" onclick="CS.step=5;renderTab()">← Retour</button><button class="btn bac" style="flex:2" onclick="CS.step=7;renderTab()" ${selC.length>=cantripCount&&selL1.length>=l1Max?'':'disabled'}>Continuer → Équipement</button></div>
  </div>`;
}
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
      <button class="btn${!CS.goldMode?' bac':''}" style="flex:1;font-size:18px" onclick="CS.goldMode=false;renderTab()">🎒 Équipement standard</button>
      <button class="btn${CS.goldMode?' bac':''}" style="flex:1;font-size:18px" onclick="CS.goldMode=true;renderTab()">💰 Pièces d'or</button>
    </div>
    ${!CS.goldMode?`
      <p style="font-size:18px;color:var(--text2);margin-bottom:12px">Choisis ton équipement de départ.</p>
      ${cd.equipment.map((opt,i)=>`<div class="eq-opt${CS.equipChoice===i?' selected':''}" onclick="CS.equipChoice=${i};renderTab()"><div style="font-size:18px;font-weight:600;color:var(--cp);margin-bottom:6px">Option ${String.fromCharCode(65+i)} ${CS.equipChoice===i?'✓':''}</div><div style="display:flex;flex-wrap:wrap;gap:4px">${opt.map(item=>`<span style="background:var(--surface3);border:1px solid var(--border);border-radius:6px;padding:3px 8px;font-size:18px;color:var(--text2)">${esc(item.name)}</span>`).join('')}</div></div>`).join('')}
    `:`
      <div style="background:var(--surface2);border-radius:8px;padding:14px;text-align:center">
        <div style="font-size:18px;color:var(--text2);margin-bottom:10px">Au lieu de l'équipement standard, lance les dés et dépense librement vos pièces.</div>
        <div style="font-size:22px;font-weight:700;color:var(--cp);margin-bottom:10px">${goldFormula}</div>
        <button class="btn bac" onclick="rollStartGold()" style="margin-bottom:10px">🎲 Lancer les dés</button>
        ${CS.rolledGold>0?`<div style="font-size:25px;font-weight:700;color:#ffd700">Résultat : ${CS.rolledGold} po</div>`:'<div style="font-size:18px;color:var(--text3)">Lance les dés pour obtenir tes pièces d\'or de départ.</div>'}
      </div>
      ${CS.rolledGold>0?(()=>{const cat=_creCatalog();const left=_creGoldLeft();const groups={};cat.forEach((c,i)=>{(groups[c.cat]=groups[c.cat]||[]).push({c,i});});
        return`<div style="text-align:left;margin-top:12px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><div style="font-size:18px;font-weight:600;color:var(--cp)">🛒 Boutique (facultatif)</div><div style="font-size:20px;font-weight:700;color:#ffd700">Reste : ${left} po</div></div>
          ${(CS.bought&&CS.bought.length)?`<div style="margin-bottom:8px;padding:8px;background:var(--surface3);border-radius:8px"><div style="font-size:16px;color:var(--text3);margin-bottom:4px">Panier :</div>${CS.bought.map((b,i)=>`<div style="display:flex;justify-content:space-between;align-items:center;font-size:17px;margin-bottom:2px"><span>${esc(b.name)}${b.qty>1?' ×'+b.qty:''} <span style="color:var(--text3)">(${esc(b.price)})</span></span><button class="btn bsm" style="color:#e53935" onclick="creUnbuy(${i})">✕</button></div>`).join('')}</div>`:''}
          <div style="max-height:260px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:6px">
            ${Object.keys(groups).map(g=>`<div style="font-size:16px;color:var(--cp);margin:6px 0 4px">${g}</div>`+groups[g].map(({c,i})=>`<div style="display:flex;justify-content:space-between;align-items:center;font-size:17px;padding:3px 4px;border-bottom:1px solid var(--surface3)"><span style="flex:1;min-width:0">${esc(c.name)}${c.qty>1?' ×'+c.qty:''} <span style="color:var(--text3);font-size:15px">${esc((c.desc||'').slice(0,42))}</span></span><span style="color:#ffd700;white-space:nowrap;margin:0 8px">${esc(c.price)}</span><button class="btn bsm" onclick="creBuy(${i})" ${left<c.v?'disabled':''}>＋</button></div>`).join('')).join('')}
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
    <p style="font-size:18px;color:var(--text2);margin-bottom:14px">Finalise ton personnage. <strong style="color:var(--cp)">Les stats seront verrouillées.</strong></p>
    <div class="g2" style="gap:10px;margin-bottom:14px">
      <div><div class="fl mb6">Nom *</div><input class="fi mb6" id="recapName" placeholder="Requis..." value="${esc(CS.charName)}" oninput="CS.charName=this.value;document.getElementById('confirmCreBtn').disabled=!this.value.trim()">
      <div class="fl mb6">Alignement</div><select class="fi" onchange="CS.alignment=this.value"><option value="">— Choisir —</option>${ALIGNMENTS.map(a=>`<option ${CS.alignment===a?'selected':''}>${a}</option>`).join('')}</select></div>
      <div style="background:var(--surface2);border-radius:8px;padding:10px"><div style="font-size:18px;font-weight:600;color:var(--cp);margin-bottom:6px">Résumé</div>
        ${[['Race',CS.race],['Classe',CS.classe],['Historique',CS.background],['PV max',''+hpMax],['Compétences',''+allSk.length],...(CS.selectedSpells.length?[['Sorts',''+CS.selectedSpells.length]]:[])].map(([k,v])=>`<div class="recap-stat"><span>${k}</span><span style="color:var(--cp)">${esc(v||'—')}</span></div>`).join('')}
      </div>
    </div>
    <div style="background:var(--surface2);border-radius:8px;padding:10px;margin-bottom:14px">
      <div style="font-size:18px;font-weight:600;color:var(--cp);margin-bottom:6px">Statistiques finales</div>
      <div class="g6">${ABILITIES.map((ab,i)=>`<div class="sb hi"><div class="sn">${ABILITIES_SH[i]}</div><div style="font-size:20px;font-weight:700">${finals[i]}</div><div class="sm">${fmt(mod(finals[i]))}</div></div>`).join('')}</div>
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
