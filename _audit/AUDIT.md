# REGISTRE D'AUDIT — La Boîte à Outils

> **Fichier durable.** Il survit aux sessions de Claude. C'est LA source de vérité sur « qu'est-ce qui est réellement vérifié ».
> Tant qu'un item n'est pas ✅ **daté + justifié** ici, il est **non vérifié** — peu importe ce que dit un résumé de session ou un autre fichier mémoire.

## RÈGLE ZÉRO (rappel)
Rien n'est « fini » tant que ce n'est pas coché ici contre les checklists ACTUELLES. Tout « ✅ terminé » d'une session passée **redevient ⬜ à vérifier** par défaut. Le re-check est obligatoire — jamais de « c'était fait avant ».

## Légende
- ✅ Vérifié dans le code + justifié (avec date).
- ⚠️ Partiel / à confirmer (raison indiquée).
- ❌ Manquant ou cassé → devient une **théorisation à valider** avant tout code.
- ⬜ **Non audité en profondeur** (le statut « par défaut » — ne PAS lire comme « absent », lire comme « pas encore vérifié »).

## Méthode d'audit (par capacité)
Les **4 dimensions** : 1. Affiche · 2. Calcule · 3. Déclenche · 4. Interagit.
+ checklist classe 12 points + 28 principes UI + cahier des charges (charte UX/Technique/DA).

---

# SECTION A — SYSTÈMES CENTRAUX (audités le 2026-06-08)

Ces systèmes sont partagés ; s'ils marchent, les classes qui les appellent en héritent.

| Système | Statut | Preuve / Note |
|---|---|---|
| Dés `diceRoll` | ✅ | index.js:556 — respecte IRL (560), avantage/désav.→2d20, chanceux halfelin, Puissance indomptable |
| Mode IRL (saisie manuelle) | ✅ | `_isIRLMode()` + `_irlToggleHtml()` + `showIRLRoll()` (index.js:134-259, 560) |
| Avantage/Désavantage moteur | ✅ | `getStatusEffects()` injecte hasAdv/hasDisadv dans diceRoll |
| Concentration | ✅ | Mécanique : panneau `renderConcPanel` + conflit au lancer (`castSpell`). **Badge 🔵 par-sort AJOUTÉ 2026-06-09** (combat.js : `isConc` via regex sur `duration` → pastille 🔵 dans l'en-tête + badge « 🔵 Concentration » dans le corps de chaque sort). |
| Attaque `rollAttack` | ✅ | combat.js:408 (audité 2026-06-09). 4D OK : touche d20+bonus, dégâts (dés+bonus), **crit** (dés doublés + Critique brutal Barbare + Attaques sauvages Demi-Orc + crit 19-20/18-20 Champion), **avantage/désav.** 2d20, chance halfelin, épuisement≥3→désav., munitions décrémentées, type de dégâts affiché, IRL, log MJ. |
| **« Veille » (rappels dorés isMyTurn / NOT-isMyTurn)** | ⚠️ | **Moteur créé v0.9.98** (`renderVeille` combat.js, data-driven `_VEILLE_CASES`, CSS `.veille-banner`). Cas câblés : Disparition, Ailes draconiques, Défense patiente, Assassinat, Vengeur implacable, Âme vengeresse, Représailles. HP→0 : Sentinelle immortelle + Âme de l'artifice (`_checkHpZeroVeille` perso.js). **RESTE** : cas Chasseur niv.7 (option choisie), Âme de diamant (Moine JS raté), Esquive totale, Nimbe sacré niv.20, Trait de génie Artificier — à câbler |
| **Tracker éco d'action** | ⚠️ | v0.9.98 : jauges Action/Bonus/Réaction + reset auto début de tour/combat + **panneau Actions de base BG3** (`renderBaseActions`, clic → consomme la jauge Action). **RESTE** : grisage automatique des vrais boutons d'attaque (invasif, différé), AO explicite sur la jauge Réaction |
| **Panneau d'actions de base BG3** | ✅ | v0.9.98 `renderBaseActions` (Foncer/Désengager/Esquiver/Aider/Cacher/Chercher/Préparer/Utiliser objet), combat seulement |
| Notif MJ 3ᵉ personne | ⬜ | Présent dans mj/* + journal — à auditer (toutes les capacités notifient-elles ?) |
| Journal d'actions + dés | ⬜ | player/journal.js + mj/journal.js — à auditer vs spec charte (animation carte, MJ voit tout) |
| Badges 🔸/↪/🔵 | ⬜ | Présents par endroits ; **aucune passe exhaustive** capacité par capacité |
| Type de dégâts à la saisie HP (résist/immunités auto) | ⬜ | openHpModal existe — à auditer : applique-t-il ÷2/annulé auto + bannière ? (Option B) |

---

# SECTION B — CLASSES (13) — DEEP AUDIT À FAIRE

> **Vérifs ponctuelles 2026-06-08** (gaps du backlog confrontés au code v0.9.97, Règle Zéro dans les 2 sens) :
> - ✅ Barbare `conMod` (barbare.js:396 = `mod(...)`) — bug 2026-06-02 corrigé.
> - ✅ Druide **Cercle des terres** (Récup naturelle / Foulée tellurique / Protégée / Sanctuaire) — gap « ABSENT » soldé.
> - ✅ Paladin **auras** (`_paladinBroadcastAura` → appliqué dans `rollSave` combat.js:439).
> - ✅ **Réflexes de voleur** (clone init−10, retrait round 2 — mj/combat.js).
> - ✅ Consommables **« Utiliser »** (`useConsumable` sac.js).
> - ✅ **PNJ/Monstre** : filtre Tous / 🐉 Monstres / 🧑 PNJ ajouté (pnj.js `_mjNPCFilter`, v0.9.99) — Monstre=type Monstre/Boss, reste=PNJ.
> - ✅ Artificier **Éclair de génie** (artificier.js:19) = +mod INT, réaction, INT/repos long — bug RAW 2026-06-02 (était +1d6) corrigé. Cas Veille câblé v0.9.98.
>
> Le tableau ci-dessous reste la **carte structurelle** (grep), PAS un verdict d'audit profond.
> Colonnes : boutons onclick / appels de dés / badges 🔸↪🔵 (dans le fichier de classe).

| Classe | onclick | dés | 🔸 | ↪ | 🔵 | Statut audit |
|---|---|---|---|---|---|---|
| Barbare | 32 | 5 | 1 | 1 | 0 | ⬜ |
| Barde | 12 | 1 | 1 | 0 | 0 | ⬜ |
| Clerc | 23 | 8 | 0 | 0 | 0 | ⬜ |
| Druide | 18 | 0 | 1 | 0 | 0 | ⬜ |
| Ensorceleur | 13 | 0 | 1 | 1 | 0 | ⬜ |
| Guerrier | 18 | 2 | 7 | 4 | 0 | ⬜ |
| Magicien | 19 | 0 | 0 | 0 | 0 | ⬜ |
| Moine | 10 | 3 | 3 | 4 | 0 | ⬜ |
| Occultiste | 38 | 2 | 0 | 3 | 0 | ⬜ |
| Paladin | 24 | 1 | 1 | 0 | 0 | ⬜ |
| Rôdeur | 11 | 1 | 2 | 0 | 0 | ⬜ |
| Roublard | 3 | 1 | 1 | 1 | 0 | ⬜ |
| Artificier | 21 | 4 | 0 | 2 | 0 | ⬜ |

**Note :** 🔵 (concentration) = 0 dans TOUS les fichiers de classe → normal SI le badge est rendu centralement par sorts.js (à confirmer, cf. Section A). Sinon ❌ systémique.

### Détail deep-audit par classe

#### ✝ CLERC — audité 2026-06-08 (lecture clerc.js + perso.js) — **solide**
Le flag « pré-théorisation » du backlog est **caduc**. Le panneau couvre les **8 domaines** niv.1→20.
- ✅ Panel Combat complet (Conduit divin, Destruction morts-vivants, Intervention divine d100 + niv.20 auto, 8 domaines détaillés).
- ✅ Frappe divine (niv.8) : bouton 🎲 + bons types par domaine.
- ✅ Renvoi des morts-vivants : bouton + bannière (DD + FP détruits).
- ✅ Résistances/immunités passives (Forge feu, Saint immunité feu, Guerre Avatar CPT) → `_classPassiveResist`/`_classPassiveImmun`.
- ✅ **Frappe guidée / Bénédiction du dieu de la guerre** : boutons +10 dépensant 1 Conduit (`_clercGuidedStrike`) — **codé v0.9.100** (étaient texte seul).
- ⚠️ Atténuation des éléments (Nature niv.6) = texte seul (pas de bouton octroyant la résistance) → ❌ Déclenche.
- ⚠️ Notifs MJ (principe 25) quasi absentes (bannières locales joueur, rien poussé au MJ).
- ⚠️ Frappe divine = bouton dégâts isolé, pas variante d'attaque BG3 (principe 26) ni Veille post-touche.
- ⚠️ Badges 🔸/↪ incomplets (Prêtre de guerre = action bonus sans 🔸 ; réactions sans ↪ partout).
- 🧪 **Runtime requis** : Déclenche/Interagit des boutons (conduit, frappe divine) à confirmer en jeu.

#### 😈 OCCULTISTE — audité 2026-06-08 (lecture occultiste.js + perso.js) — **solide**
Flag « pré-théorisation » **caduc**. 4 patrons (Archifée/Fiélon/Grand Ancien/Génie) détaillés niv.1→14.
- ✅ Magie de pacte (emplacements repos court), Arcanum mystique (niv.11-17), Maître de l'occulte (niv.20).
- ✅ Familier complet (barre PV, modal dégâts calqué perso, attaques `rollAttack`+d20, jsq) — conforme au pattern entités.
- ✅ Résistances appliquées : Fiélonne (type choisi), Bouclier mental psychique, Présent élémentaire du génie (perso.js:272-276).
- ✅ Bénédiction du ténébreux (PV temp bouton), Ire du génie (bouton + bannière), réactions (Échappatoire/Chance/Protection) avec ↪.
- ⚠️ **Effets de pacte** (Lame=arme de pacte dans l'inventaire · Grimoire=+3 cantrips · Chaîne=familier amélioré) = **sélecteur sans effet mécanique** → couplé inventaire/compendium (@OPTION_B passe 3, non codé à l'aveugle).
- ⚠️ Manifestations occultes = liste + descriptions, effets = texte (Option A, @OPTION_B compendium).
- ⚠️ Notifs MJ (principe 25) absentes (bannières locales).
- 🧪 **Runtime requis** : résistances effectives + boutons de charge à confirmer en jeu.

#### SYNTHÈSE 13 CLASSES — 2026-06-08 (Clerc+Occultiste lus en entier ; 11 autres vérifiés par grep ciblé sur leurs résidus documentés)
**Verdict : aucune classe n'a de capacité de base manquante.** Les flags « pré-théorisation » du backlog sont tous caducs. Vérifié présent :
- **Guerrier** : Champion crit 19-20 (niv.3) / supérieur 18-20 (niv.15), Athlète accompli (niv.7), Survivant (niv.18 bouton) ✅
- **Rôdeur** : toutes les options Chasseur (Proie/Tactiques/Multi-attaques/Défense sup.) présentes ✅ (mais en **texte** — cf. thème 1)
- **Druide** : Archidruide niv.20 (FS illimitée), Cercle lune + Cercle des terres complets ✅
- **Paladin** : Châtiment divin = boutons par niveau d'emplacement + case critique + `rollChatimentDivin` (rider-ressource, principe 26 ✅), Frappe divine améliorée niv.11, auras diffusées ✅
- **Artificier** : Éclair de génie (RAW ✅), Élixir, Canon occulte, Défenseur d'acier, Maître armurier (Gardien/Infiltrateur) ✅ — imprégnations = compteur (cf. thème 4)
- **Barbare/Barde/Ensorceleur/Magicien/Moine** : confirmés développés (sessions BLOC 3) ; Touche-à-tout au moteur ✅, conMod ✅

**Ce qui reste = 5 THÈMES TRANSVERSAUX (pas du par-classe) :**
1. **Options de sous-classe en TEXTE** (Rôdeur Chasseur, certaines manifestations) — pourraient devenir variantes d'attaque (principe 26) / sélecteurs. *Plusieurs couplées inventaire/compendium.*
2. **Notifs MJ (principe 25)** — quasi absentes ; les capacités montrent des bannières locales mais ne poussent rien au MJ (= feature « journal de combat MJ » du backlog, transversale).
3. **Badges 🔸/↪/🔵** — incomplets par endroits (polish).
4. **@OPTION_B — bloqué compendium** : effets de pacte Occultiste, infusions Artificier, manifestations, upcasting/scaling des sorts. **Ne peut PAS être codé sans données structurées.**
5. **Quelques passifs non appliqués au moteur de dés** (Athlète accompli ½ maîtrise sur jets de carac bruts — même edge que Touche-à-tout).

**Tous ces thèmes sont soit bloqués (compendium), soit couplés inventaire (risqué à l'aveugle), soit du polish, soit runtime-bound.** → Le « finir tout avant de tester » bute ici sur ces dépendances ; la suite la plus utile = **passe de test runtime** (dimensions Déclenche/Interagit) + décisions sur les thèmes 1-2.

### Checklist classe (12 pts) à appliquer à CHAQUE classe (héritée de feedback_work_methodology)
1. Panel Combat — toutes capacités/niveaux/archétypes · 2. Panel Armes (attaques spéciales) · 3. Panel Sorts (préparés, badges, castSpell) · 4. Passives → traits (pas dans Combat) · 5. Création perso (choix niv.1) · 6. Passage de niveau (sélecteurs/automatisations) · 7. Buffs groupe (notifs push) · 8. HUD/MJ tracker (notifs) · 9. Cross-systèmes (armes/familier/inventaire) · 10. IRL (tous jets + rappels dorés) · 11. Badges 🔸/↪/🔵 sur TOUTES les capacités concernées · 12. Veille (momentums + déclencheurs).

---

# SECTION C — CAHIER DES CHARGES (charte UX) — couverture

| Item charte UX | Statut | Note |
|---|---|---|
| Création perso (race/classe/archétype/carac/compét/équipement, import = assistant) | ⚠️ | Vérifié 2026-06-12 : création complète ✅ ; **import = bouton JSON brut** (auth.js:326), PAS l'« assistant pas à pas » de la charte. ⚠️ **Demi-Elfe `flexBonus:2` défini (config.js:76) mais JAMAIS appliqué** (getFinalStats ignore flexBonus → +1/+1 perdus) ; idem Dragonide métallique (bonus « manuels » = perdus). |
| Boutique d'achat à la création (or → liste+prix, prix existent config.js) | ✅ | **CODÉE 2026-06-12 (v0.9.103)** : mode or → catalogue (armes/armures/équipement, prix po/pa), panier, solde restant, achats→inventaire, reliquat→bourse. |
| Level-up : sorts ET capacités fonctionnels (jamais display-only) | ⚠️ | Texte générique corrigé v0.9.95 ; reste à auditer le « jamais display-only » par capacité |
| Barde Touche-à-tout (½ maîtrise au moteur) | ✅ | competences.js:21 — bonus inclut `halfPb` sur compét. non maîtrisées + perception passive (gap backlog caduc). Edge mineur : jets de carac bruts du panneau dé n'incluent pas le ½ (à voir) |
| Dépliants partout (F1) : panneau description par sort/capacité au choix | ⬜ | `_featDesc` existe — couverture à vérifier |
| Capacités de RACE rendues fonctionnelles (pas que stats+vitesse) | ⚠️ | **Re-audit 2026-06-09 : verdict ❌ caduc.** Races de création = `config.js SRD.races` (pas `data/base-srd/races.json` qui n'est que la fiche compendium). Mécaniques CÂBLÉES : chance halfelin (`_isHalfling`), Demi-Orc Attaques sauvages (crit +1 dé) + Endurance implacable (HP→1, perso.js:385), Tieffelin résist Feu (perso.js:257), Dragonide souffle (combat.js:259) + résist élément (perso.js:262), Nain PV (state.js:901/xp.js) + poison (perso.js:259 `_RR`), Aasimar/Goliath résist. **RESTE display-only** : avantages aux JS (Nain poison, Elfe charme/sommeil, Halfelin brave-peur, Gnome ruse), maîtrises de compétence raciales (Demi-Orc Intimidation), vision dans le noir (cosmétique). → ⚠️ partiel, pas ❌. |
| Sorts : upcasting (modal emplacement, filtre amplifiables, IRL) | ⬜ | À auditer |
| Sorts : badges préparé/connu/rituel/🔵 | ⚠️ | À confirmer (cf. Section A concentration) |
| Inventaire : encombrement par paliers | ✅ (partiel assumé) | **CODÉ 2026-06-12 (v0.9.103)** : `ITEM_WEIGHTS_KG` (~50 objets standard, kg), paliers FOR×2,5/×5/×7,5, jauge Sac, **malus vitesse auto** + chip rail. Objets sans poids = non comptés + signalés (poids compendium = @OPTION_B). |
| Inventaire : munitions format quantité | ✅ | CORRIGÉ 2026-06-12 (v0.9.103) — 7 variantes (Flèche×20, Carreau×20, Épée courte×2, Dague×2, Hachette×2, Javeline×5, Fléchette×10). Historique : : équipement de départ config.js = **« 20 flèches » qty:1, « 2 Épées courtes » qty:1, « 2 Dagues » qty:1** — anti-pattern interdit par la charte, ET casse le décompte de munitions de rollAttack (1 tir → qty 0 → « Plus de 20 flèches ! »). Fix simple : `{name:"Flèche",qty:20}` etc. |
| Inventaire : type de dégâts à la saisie HP (÷2/annulé auto + réactions) | ✅ | Vérifié 2026-06-12 : `#hpDmgType` (perso.js:323/369) avec marqueurs ✦ immun / 🛡 résist — câblé (BLOC 2 F4). |
| Inventaire : échange entre joueurs, consommables (Utiliser), objets→sorts | ⚠️ | Échange ✅ + Utiliser ✅ (vérifs antérieures) ; objets→sorts = @OPTION_B. |
| **Combat : tracker éco d'action complet** | ✅ | LIGNE DÉSYNCHRONISÉE corrigée 2026-06-12 — fait v0.9.98 (cf. Sections A et D ; reste grisage auto différé). |
| **Combat : panneau d'actions de base BG3 (Foncer/Désengager/Esquiver…)** | ✅ | LIGNE DÉSYNCHRONISÉE corrigée 2026-06-12 — fait v0.9.98 (`renderBaseActions`). |
| **Combat : AO dans panneau attaque (↪ réutilisable au tour suivant)** | ✅ | CODÉ 2026-06-12 (v0.9.103) : bouton ↪ AO par arme de mêlée (combat seulement), consomme la jauge Réaction, grisé après usage, réarmé au reset de tour. |
| Combat : avantage/désav. indiqué par le joueur, variantes BG3, IRL | ⚠️ | Moteur adv/désav OK ; variantes BG3 à auditer |
| MJ : tracker, sync, conditions, combat persisté, jets de mort | ⬜ | À auditer |
| MJ : notifs 3ᵉ pers., buffs groupe (résultat transmis), invocations unifiées | ⬜ | À auditer |
| Journal d'actions + dés (animation carte, MJ voit tout) | ⬜ | À auditer vs spec |
| Hub : bouton Accueil (≠ Quitter), panneau campagne = table simulée | ⬜ | Redesign fait ; conformité spec à vérifier |
| Espace MJ : 🗺 Cartes / 🖼 Visuels / 📜 Textes / 📖 Quêtes | ⬜ | À vérifier |
| Guides (profil) classe/archétype/base | 🟢 | Différés (rédaction contenu) |
| IRL partout (saisie + rappels dorés) | ✅ | LIGNE DÉSYNCHRONISÉE corrigée 2026-06-12 — saisie OK (diceRoll) + Veille codée v0.9.98 (`renderVeille`, 9 cas + HP→0) + rappels raciaux JS (2026-06-09). |

---

# SECTION D — REGISTRE DES ❌ / RESTE (état affiné 2026-06-08 après audit 13 classes)

**Soldés cette session (v0.9.98-0.9.100) :**
- ✅ Veille / rappels dorés (moteur + 9 cas + 2 HP→0)
- ✅ Panneau d'actions de base BG3
- ✅ Tracker éco d'action (jauges + reset + actions de base ; reste grisage auto des boutons d'attaque = différé)
- ✅ Clerc Frappe guidée/Bénédiction (boutons) · Moine Âme de diamant + Évasion · PNJ/Monstre filtre

**RESTE — 5 thèmes transversaux (cf. Synthèse 13 classes, Section B) :**
1. **Options de sous-classe en texte** (Rôdeur Chasseur…) → variantes d'attaque/sélecteurs — *partiellement couplé compendium/inventaire*.
2. **Notifs MJ 3ᵉ pers. (principe 25)** — ✅ **socle codé v0.9.101** : `_logMJAction` (combat.js) écrit `actionLog` (capé 25) dans le doc Firestore du joueur ; hooks sur `rollAttack` (attaque), `rollSave` (JS), `_finalizeCast` (sort), `applyHp` (dégâts/soins) ; le listener MJ (firebase.js) diffe et pousse en 3ᵉ pers. dans `_mjCombatLog`. 🧪 **Runtime 2 clients requis** (sync temps réel non testable par moi). RESTE : capacités via boutons (showBanner) non encore loggées ; surface = journal de combat (réinitialisé au combat) → panneau de campagne persistant = future.
3. **Badges 🔸/↪/🔵** incomplets (polish).
4. **@OPTION_B — BLOQUÉ COMPENDIUM** : effets de pacte Occultiste, infusions Artificier, manifestations, upcasting/scaling sorts.
5. **Passifs ½ maîtrise sur jets de carac bruts** (Athlète accompli — edge mineur).

**Hors classes (cahier des charges, toujours valides) :**
- ⚠️ Capacités de RACE : **verdict ❌ révisé le 2026-06-09** → la plupart sont câblées (résistances, PV nain, crit/endurance Demi-Orc, souffle Dragonide, chance halfelin). RESTE display-only : avantages aux JS raciaux, maîtrises de compétence raciales, vision dans le noir. Petit lot, codable (`config.js SRD.races`).
- ❌ Encombrement par paliers — bloqué compendium (poids/objet absent).
- 🧪 **Déclenche/Interagit de TOUTES les classes** = à confirmer en **runtime** (test utilisateur) — incompressible.

---

# SECTION E — CHARTE TECHNIQUE (auditée 2026-06-09)
| Item | Statut | Preuve |
|---|---|---|
| Pas d'ES Modules, scripts séquentiels, découpage player/mj/ui/css | ✅ | conforme |
| Version unifiée `version.js` (page + SW) | ✅ | version.js + sw.js `importScripts` (v0.9.102) |
| Overlay de MAJ (`_showUpdateOverlay`/`SW_UPDATED`) | ✅ | firebase.js |
| Responsive 640/480/380 | ✅ | css : 640px, 480px, 380px tous présents |
| SW cache-first + bump version (PAS network-first) | ✅ (volontaire) | **Le « fix A network-first » de la charte est CADUC** : essayé en v0.9.78 → page blanche (course auth Firebase / scripts séquentiels, `loadMJCompLib is not defined`) → rétabli cache-first en v0.9.79. Tenté de nouveau le 2026-06-09 puis **reverté** (même risque). ⇒ cache-first conservé ; **bumper `version.js` à chaque déploiement reste obligatoire** pour la fraîcheur (prix assumé). Voir feedback-sw-version. |
| Compat Windows 10 — emoji 🪄 (charte : utiliser ✏) | ⚠️ | 🪄 utilisé dans l'UI mode IRL (index.js:109/121/210) + icône bâton (equipement.js:64). User SOUS Win10 → risque de glyphe « tofu ». À remplacer par ✏ dans l'UI IRL. |
| Persistance/sync Firestore (perso/combat/conditions/buffs) | 🧪 | structurellement présent ; survie refresh + multi-clients = runtime. |

# SECTION F — CHARTE DA (auditée 2026-06-09)
| Item | Statut | Preuve |
|---|---|---|
| Ancre « boîte à outils steampunk/arcanepunk » + tokens (laiton/cuivre/teal) | ✅ | appliqués écran connexion + chargement + popup MAJ (charte, fait 2026-06-02) |
| Engrenages réservés au chargement | ⬜ | règle ; pas re-vérifiée exhaustivement |
| **#3 États + résistances regroupés près de la barre de vie** | ✅ | **2026-06-09** : la section « États & résistances » remontée dans le rail **juste sous la barre de vie** (avant les caracs) — perso.js. |
| **#4 Barre de vie retravaillée (plus grosse + laiton/lueur arcane)** | ✅ | **2026-06-09** : classe dédiée `.hp-bar-hero` (16px, bordure laiton #6b5527, lueur arcane teal, fill gloss) appliquée à la barre PV principale du rail (perso.js + components.css). `.hp-bar` partagée inchangée (tracker MJ/compagnons). |
| Animations (sort/attaque traversant l'écran, transformation, invocation) | ⬜ | à auditer (certaines existent : Halo divin, etc.) |

# SECTION G — 28 PRINCIPES UI (état 2026-06-09)
✅ Satisfaits/câblés : 1,2,3,4 (structure) · 5,6,7,12 (ressources/dés/PV) · 8,13,15 (buffs — socle ; 15 result-not-formula respecté) · 9,10,11 (calcul/filtrage) · 16 (un bouton — vérifié Attaque précise/Frappe guidée) · 17 (sélecteur cible — pattern présent) · 18 (prépa repos long `_openLongRestPrep`) · 21/28 (familiers→tracker socle `_mjSyncFamiliars`) · 23 (sorts au LU, 3 mécanismes) · 24 (armer-puis-déclencher = métamagie) · 26 (variante d'attaque BG3) · 27 (capacité narrative à coût).
⚠️ Partiels : **14** (🔸/↪ : présents sur l'essentiel — Barbare/Guerrier/Roublard/Barde/Moine/Rôdeur — codés EN DUR par classe, pas de levier central. Gaps = capacités qui disent déjà « Réaction »/« action bonus » EN TEXTE mais sans symbole = cosmétique pur, valeur quasi nulle. Clerc (3 réactions ↪) + Artificier (Éclair de génie ↪) ajoutés 2026-06-09 → **sweep terminé** (les autres classes étaient déjà badgées ou sans capacité bonus/réaction de classe : Magicien, et réactions de Paladin/Ensorceleur/Magicien = des SORTS gérés dans la liste de sorts). ; 🔵 fait 2026-06-09) · **19** (badges sorts préparé/📖/rituel — partiel) · **20** (toasts→bannières : clés faites, sweep complet non) · **25** (notif MJ 3ᵉ pers. : socle `_logMJAction`, capacités via boutons non encore loggées, runtime 2 clients).
🧪 Runtime/bloqués : @OPTION_B (manifestations/pacte/infusions/upcasting — compendium) · Déclenche/Interagit de toutes les classes (test en jeu).

# JOURNAL D'AUDIT
- **2026-06-15 (2)** — **En-têtes desktop nettoyés (v0.9.123)** : intitulé de page masqué (redondant avec la nav-en-tête) — #hdrChar en visibility:hidden (garde son flex:1 → contrôles à droite), .mj-hdr-title (« 🎲 MJ ») en display:none. #mjHdrCamp (nom de campagne) conservé. Hauteur d'en-tête UNIFORME sur les 3 pages (.hdr/.mj-hdr/.hub-hdr min-height:64px, padding vertical 8px, align center, nowrap) @media≥641px. Mobile inchangé. CSS 224/224.
- **2026-06-15 (1)** — **Nav desktop dans l'en-tête + onglet actif mobile + FABs (v0.9.122)** : (1) DESKTOP : la nav [Hub/Personnage] ne flotte plus au milieu du contenu — _placeModeNavDesktop() (core.js) DÉPLACE #modeNav dans l'en-tête actif (.hdr/.mj-hdr/.hub-hdr, juste après le logo .hdr-home) avec la classe .modeNav-inHeader = contrôle segmenté inline ; remis en bandeau bas sur mobile (≤640). Appelé par _refreshModeNav + au resize. (2) FABs dé+groupe AGRANDIS sur desktop 64→80px (font 36/34, panneaux remontés à 122px). (3) MOBILE : onglet de fiche sélectionné se CENTRE dans la barre (_centerActiveTab, scrollBy au changement d'onglet, joueur+MJ) + contour & texte qui BRILLENT (pulse tabActiveGlow box-shadow+text-shadow, reduced-motion géré). node --check OK (core/state/mj), CSS 221/221.
- **2026-06-14 (6)** — **Bandeau nav en mode groupe + nettoyage menu dé (v0.9.115)** : (1) joinGroupOnly (core.js) appelle désormais _refreshModeNav() à la fin → le bandeau [Hub / Personnage] apparaît dès « Rejoindre le groupe » (avant : seulement via enterCampaign/showApp ; le mode groupe-only ne le montrait pas). « Fiche perso » du menu campagne (📋 → enterCampaign) le montrait déjà. (2) Raccourci « Personnage » RETIRÉ du menu dé (appui long, player/index.js _openDiceShortcuts) — le bouton Personnage du bandeau joue ce rôle. Restent Journal 📓 + Chuchoter 🤫. node --check OK (core, player/index).
- **2026-06-14 (5)** — **Retour screen v0.9.111 → v0.9.112** : (1) **Fond au bouton groupe** : #partyHudBtn passe de contour vide à un disque CUIVRE plein (linear-gradient #d99a5e→#a85f28, icône sombre, sans bord) → distinct du dé doré (cadran cuivre vs laiton, palette magitech) tout en restant rempli comme lui. (2) **Hub/Personnage = moitié du bandeau chacun** : .mode-btn repassé en flex:1 (au lieu de flex:0 0 auto compact) + tailles relevées (icône 22, label 12). (3) **ANGULAIRE PARTOUT** : BR1 réécrit en règle universelle :where(div,section,button,input,...) border-radius:0 !important, avec re-cerclage des seuls éléments ronds (FAB dé/groupe, avatar nav, spinner, pastilles, anneaux FX dé) + préservation des <img> détourés. Fini les coins arrondis sur cartes/boutons/onglets/pastilles. CSS équilibré (da-theme 41/41, redesign 209/209, components 261/261). 🧪 vrai téléphone : cohérence dé(or)/groupe(cuivre), Hub/Perso à 50%, vérifier qu'aucun cercle voulu n'est devenu carré (sinon l'ajouter au re-cerclage).
- **2026-06-14 (4)** — **Onglets + icône app (v0.9.110)** : (1) **Animation de changement d'onglet** (fade+rise 0.22s) sur #tabContent et #mjTabContent, déclenchée par setTab/setMJTab seulement (pas sur re-render data → pas de flicker), respecte prefers-reduced-motion. (2) **Flèches latérales scrollables** : nouveau conteneur .tab-scroller créé en JS (core.js _initTabScrollers) autour de #tabBar/#mjTabBar (persiste car renderTabBar ne touche que l'innerHTML) ; flèches ‹ › affichées seulement quand c'est réellement scrollable (classes .more-l/.more-r maj au scroll/resize), cliquables (scrollBy fluide), dégradé de fondu + pulse, desktop ET mobile. Sur mobile le .tab-scroller devient le bandeau fixe (les styles de bande déplacés de #tabBar vers .tab-scroller). (3) **Nouvelle icône d'app** (chest arcanepunk fourni par user) : manifest.json repointé vers icon-512.png en purpose any + MASKABLE (remplit le bouton Android, fini l'icône riquiqui sur fond blanc) ; apple-touch-icon → icon-512.png ; header : emoji 🧰 remplacé par logo.png (version alpha) dans les 3 en-têtes (.hdr-logo) ; sw.js precache icon-512.png + logo.png. ⚠️ Les 2 PNG doivent être enregistrés par l'user (Claude ne peut pas créer de binaire) : icon-512.png (fond plein) + logo.png (alpha) à la racine. node --check OK (core/state/mj), CSS 209/209, manifest JSON OK.
- **2026-06-14 (3)** — **Retour screen mobile (v0.9.109)** : (bleu) FABs encore agrandis 60→64px, font 29/28. (jaune) **bordures manquantes corrigées** : onglets .tab/.mj-tab avaient un bord en var(--border) sombre = invisible sur fond noir → passé en #5e4d2a (inactif) / laiton vif (actif) via da-theme BR3c, sans !important (l'actif doré survit). La bande d'onglets gagne un bord laiton en haut + noir en bas = vrai bandeau. (rouge) bande d'onglets confirmée au-dessus de la bande de modes. **Liseré du creux des FABs épaissi** (anneau var(--cp) 2→3px + arête sombre). Bandeau min-height 66px, gouttières 90px, paddings/onglets/panneaux réalignés. CSS équilibré (da-theme 40/40, redesign 185/185). NB : le screen user était en v0.9.107 (Hub/Perso encore étirés) ; 0.9.108+ les compacte déjà.
- **2026-06-14 (2)** — **Itération retour user (v0.9.108)** : (a) **BUG MAJ manuel corrigé** — la section « 🔄 Mise à jour » du profil n avait aucun bouton actionnable quand aucune MAJ n était déjà détectée (texte mort). Ajout _manualCheckUpdate() (reg.update() → overlay si nouveau SW, sinon toast « déjà à jour ») + _forceHardReload() (vide tous les caches + désinscrit le SW + reload — garantit la dernière version, aucune donnée perdue). 2 boutons toujours présents dans le profil (firebase.js + auth.js). (b) **Bande mobile affinée** : Hub/Perso compacts (flex:0 0 auto, centrés), **FABs agrandis 52→60px**, **creux retravaillé avec LISERÉ laiton** (socket = halo bandeau → anneau var(--cp) → arête sombre → dôme serti), bandeau min-height 62px, gouttières 84px, paddings/onglets/panneaux réalignés. (c) **Bordures des div ACCENTUÉES desktop+mobile** (da-theme BR3/BR3b) : bord laiton vieilli net #5e4d2a sur cartes/panneaux/sections + #4f4023 sur en-têtes/onglets/choix/champs. Bande reste **mobile-only** (user OK). CSS équilibré (da-theme 38/38, redesign 185/185), JS node --check OK. 🧪 vrai téléphone : taille FABs + liseré du creux ; desktop : densité des bords accentués.
- **2026-06-14 (1)** — **Refonte DA « brute/usée » + bandeau de nav mobile (v0.9.107)** suite retour user sur C2.
  - **DA brute** (da-theme.css, bloc « BRUT/USÉ », rollback isolé) : (1) dé-arrondi global → arête nette 2px sur ~50 classes de conteneurs/boutons/champs/pastilles (les cercles = FAB/portraits/jauges restent ronds, vocabulaire « cadran/rivet ») ; (2) texture usée sur le fond du body (vignette + fines stries brossées, gradients only, offline-safe, toujours derrière le contenu) ; (3) biseau gravé « métal estampé » sur les plaques (filet clair haut + ombre bas + dégradé de surface).
  - **Bandeau de nav** (relocalisé en FIN de redesign.css car @import après layout → gagne sur la pilule #modeNav) : #modeNav devient un GROS BANDEAU plein-largeur ancré en bas (≤640px), liseré laiton, safe-area-inset respectée. Les 2 FABs (🎲 dé droite / 👥 groupe gauche) ENCASTRÉS dans des creux (halo couleur-bandeau + arête sombre = serti). Onglets de fiche posés juste AU-DESSUS du bandeau. z 844<845<870/888. Padding-bas contenu ajusté. Corrige « barre trop basse » + « nav de modes oubliée ».
  - CSS équilibré (da-theme 37/37, redesign 185/185, layout 131/131). 🧪 **test vrai téléphone requis** : alignement FABs dans les creux, rien masqué, joueur+MJ+Hub ; + avis sur l intensité du brut (arrondi 2px→0 ? texture +/- ? couleurs encore plus patinées ?).
- **2026-06-12 (8)** — **C2 nav mobile en bas codée (v0.9.106)** suite validation user (avec sa solution anti-collision). layout.css @media≤640 : barres d'onglets fixées en bas (thumb zone) + liseré laiton ; la barre réserve 64px de gouttière de chaque côté → boutons 👥 groupe (bas-gauche) et 🎲 dé (bas-droite) flottent par-dessus, z-index barre 840 < boutons. Padding-bas 78px (#app/#mjTabContent), panneaux du dé remontés au-dessus de la barre. CSS équilibré. D1 reporté, D2 Phase 2 (acté). 🧪 test sur vrai téléphone requis (joueur+MJ).
- **2026-06-12 (7)** — **Veille DA/UI → lots A+B+D codés (v0.9.105)**, autonome. Détail + sources dans `_veille/VEILLE-DA-UI-2026-06.md`. **Lot A** (kit arcanepunk quotidien, css/da-theme.css) : accent laiton sous titres `.pt`, `:active` sur boutons (feedback Hades), état sélectionné unifié (race/classe/style/sort/équipement) + point arcane, variable `--arc`. **Fix : `da-theme.css` ajouté au PRECACHE sw.js** (manquait → KO 1er chargement hors-ligne). **Lot B** (moment signature) : `_diceFX()` éclat de runes teal + résultat Cinzel à chaque jet (diceRoll/rollAttack/rollSave), non bloquant, défensif, virtuel-only, `prefers-reduced-motion`. **Lot D partiel** : `_diceSound()` WebAudio synthétisé (aucun asset, OFF défaut) + section profil « 🎲 Effets de dé » (2 bascules). `node --check` OK sur tout js/, CSS équilibré. **NON codé (décision/Phase 2)** : C2 nav-bas mobile (gros changement d'habitude + collision dé flottant → avis user), D1 mode Zen (dépend scènes MJ Phase 2), D2 ambiances. 🧪 Runtime : voir le rendu de l'éclat de dé + l'état sélectionné en jeu.
- **2026-06-12 (6)** — 🔴 **Bug RAW Magicien attrapé via question user** : le modal de préparation au repos long traitait le Magicien en « liste complète » (`_lrPrepClassList` = toute la liste de classe) → il pouvait préparer des sorts **jamais appris**, contournant le grimoire et rendant inutile « copier un sort (50 po/niveau) ». **Corrigé** : cas Magicien = préparation depuis **son grimoire uniquement** (`p.spells` résolus via findSpellData, niveaux 1→max lançable, tri niveau+nom, dédup). Clerc/Druide/Paladin/Artificier restent à liste complète (RAW). Rappel mécanismes : Ensorceleur=connus (sélecteur LU, pas de prépa) ; Magicien=+2 grimoire au LU (sélecteur) PUIS prépa quotidienne grimoire-only. Inclus v0.9.104.
- **2026-06-12 (5)** — **LU préparateurs : bloc « 🔓 Sorts de niveau X débloqués »** (demande user). Dans `luStepRecap` (xp.js) : détection du déblocage d'un nouveau niveau de sorts en comparant `calcSpellSlots` avant/après le niveau pris (réutilise le vrai moteur, clone de p) → panneau teal avec le nombre de nouveaux sorts de la classe + **liste dépliable** (ⓘ par sort, réutilise `creToggleSpellDesc`) + fallback « charger le compendium » si SPELLS_DB pas encore chargé. Concerne Clerc/Druide/Paladin/Artificier (les connus/Magicien ont déjà leur sélecteur au LU). Inclus dans v0.9.104. Multiclass exclu (récap différent) — à traiter si besoin.
- **2026-06-12 (4)** — Question user « le druide prépare dans tout le compendium ? » → vérifié : NON, le modal de préparation filtre par **liste de classe** (125 sorts Druide/319) **et niveau lançable** (`_lrPrepClassList` + `_prepMaxSpellLevel`), quota mod SAG+niveau, Cercle hors quota verrouillé = conforme RAW + principe de filtrage. **Fuite corrigée** : 2 sorts sans champ `classes` (Branding Smite, Find Steed) passaient le filtre pour tous les préparateurs → `classes:["Paladin"]` ajouté dans `_tools/_en_backup/spells.json` + base-srd régénérée (0 sort sans classes). Inclus dans v0.9.104.
- **2026-06-12 (3)** — **RAPPORT DE TEST UTILISATEUR traité en un lot (v0.9.104)**. 🔴 **Bug racine découvert : apostrophes dans les onclick** — les noms FR (« L'Archifée ») insérés via `esc()` (qui n'échappe pas `'`) cassaient les handlers (= erreurs console, archétypes non cliquables, création/LU buggés). **Sweep global `'${esc(` → `'${jsq(` : 46 occurrences, 11 fichiers.** 🔴 **LU bloqué niv.1→2 Rôdeur/Paladin** : `styleLevel:2` sans tableau `combatStyles` → étape vide, Continuer grisé → **listes ajoutées** (CLASS_LEVEL_DATA). Souffles : sélecteur d'ascendance + panneau Souffle + résistance étendus à « Dragonide métallique » (`startsWith('Dragonide')`). Autres : repos **bloqués en combat** (garde + boutons grisés) ; **invitation de repos de groupe** (restInvite dans le doc joueur → popup Oui/Non chez les alliés via _checkIncomingBuffs, anti-boucle `_restNoPropagate`) ; **modal de concentration stylisé** (remplace confirm(), message clair, bouton « Briser et lancer ») ; **ⓘ descriptions dépliables** sur les sorts de la CRÉATION (`creToggleSpellDesc`) ; **police mobile** ≥17px sur les descriptions (layout.css ≤640px) ; **chuchoter** : noms enrichis depuis le groupe + **startWhisperListener manquait en mode groupe** (joinGroupOnly + showHub) = cause du « historique KO côté joueur » ; **fiche chargée en mode groupe** (joinGroupOnly fetch character) = corrige le lanceur de dé générique ; **HUD : statuts des alliés** (icônes sous la barre PV) ; **MJ : statut Endormi ajouté** + compendiums monstres/objets listent TOUT (suppression des coupes 15/20/30) ; **copier le CODE** d'invitation (pas le lien) ; **panel Familier masqué si aucun familier** (ligne discrète) ; icône familier par type (joueurs.js) ; **Barde** : ligne de stats redondante retirée + « +1dX par jeton » près des compteurs ; **AO affichée uniquement hors de ton tour**. `node --check` OK sur tout js/. **PARQUÉ** : compendium dans l'éditeur MJ de fiches (grosse feature) ; persistance du mode groupe au refresh (chantier refonte HUD) ; 9 autres confirm() (destructifs, natifs acceptables). 🧪 Runtime : invitation repos 2 clients, chuchotements joueur, souffles Ensorceleur à confirmer.
- **2026-06-12 (2)** — **LOT « tout corriger » codé (v0.9.103)**, les 8 trouvailles du tour : ① flexBonus appliqué (générique `flexOptions` : Demi-Elfe [[1,1]], Dragonide métallique [[2,1],[1,1,1]] ; picker à l'étape caracs + gating Continuer + getFinalStats 3 sites) ② munitions format qté (7 variantes config.js : Flèche×20, Carreau×20, Épée courte×2, Dague×2, Hachette×2, Javeline×5, Fléchette×10) ③ saveAll : échec Firestore → point de sync revient + bannière danger (anti-spam `_saveFailNotified`, réarmé au succès) ④ `enablePersistence({synchronizeTabs:true})` (firebase.js, juste après init) ⑤ capteur d'erreurs global (`window._errLog` ring 15 + bannière 1/min + rapport auto-joint dans sendFeedback avec version) ⑥ **boutique de création** (mode or : catalogue armes/armures/CRE_GEAR avec prix, panier, reste en po, achats→inventaire+itemType, reliquat→bourse po+pa ; reroll de l'or vide le panier) ⑦ **bouton ↪ AO** par arme de mêlée (combat seulement, consomme jauge Réaction, grisé si utilisée, `rollOpportunityAttack`) ⑧ **encombrement par paliers** (sac.js : `ITEM_WEIGHTS_KG` ~50 objets standard, `getEncumbrance` FOR×2,5/×5/×7,5 kg, jauge dans Sac, malus vitesse auto + chip dans le rail ; objets sans poids signalés = @OPTION_B). `node --check` OK sur les 9 fichiers. Sections C mises à jour ci-dessous. 🧪 Runtime à valider.
- **2026-06-12** — **Tour complet « œil neuf »** (reprise après pause Bingo, code v0.9.102). Section C resynchronisée (5 lignes caduques corrigées : tracker éco ✅, BG3 ✅, hpDmgType ✅, Veille ✅, munitions/boutique précisées). **TROUVAILLES NOUVELLES** : 🔴 Demi-Elfe `flexBonus` jamais appliqué (+1/+1 perdus, idem Dragonide métallique) · 🔴 munitions « 20 flèches » qty:1 (casse le décompte rollAttack) · 🔴 `saveAll` : `_clearUnsaved()` AVANT l'await Firestore → échec d'écriture silencieux (joueur croit que c'est sauvegardé) · 🟠 pas de persistance offline Firestore (1 ligne, SDK 10.12 compat) · 🟠 pas de capteur d'erreurs global (beta avec joueurs non techniques = erreurs silencieuses) · 🟢 boutique de création absente (charte la dit « faisable maintenant ») · 🟢 bouton AO absent du panneau d'armes · 🟢 encombrement : blocage « pas de poids » PARTIELLEMENT levé (base-srd items a `w` en lb sur les ordinaires). Sain : XSS chuchotements/journal MJ (esc OK), data/_split exclu du déploiement, 49 scripts sans defer (choix assumé, cf. Section E).
- **2026-06-09 (4)** — Correctifs post-peigne-fin (sauf emojis, à la demande de l'user) : ✅ **#4 barre de vie DA** (`.hp-bar-hero` 16px laiton+arcane, perso.js+components.css) ; ✅ **#3 États & résistances** remontés sous la barre de vie (perso.js). ❌ **#1 network-first ANNULÉ** : codé puis **reverté** — la lecture de [[feedback-sw-version]] a rappelé que c'était la cause de la page blanche v0.9.78 (course auth Firebase / scripts séquentiels). Cache-first conservé ; charte Technique corrigée (fix-A marqué caduc). `node --check` OK. Tout dans v0.9.102.
- **2026-06-09 (3)** — **Peigne fin demandé : confrontation au RÉFÉRENTIEL COMPLET** (lecture intégrale charte UX + Technique + DA + 28 principes + méthodo, pas l'index). Ajout **Sections E (Technique), F (DA), G (28 principes)** au registre — elles manquaient. Trouvailles concrètes nouvelles : ❌ SW reste **cache-first** (fix-A network-first de la charte jamais codé → bump version obligatoire à chaque déploiement) ; ❌ **barre de vie** non retravaillée DA (6px plat) ; ⚠️ emoji **🪄** dans l'UI IRL (Win10 → ✏ recommandé) ; ⚠️ états/résistances regroupés en « rail » (partiel). Responsive 640/480/380 ✅, version unifiée ✅.
- **2026-06-09 (2)** — Codé le « petit lot racial » + badge concentration : (1) **rappels d'avantage racial aux JS** — `_racialSaveAdvText(p,ab)` + affichage dans `rollSave` (virtuel + IRL) : Elfe→charme/sommeil, Halfelin→peur, Nain/Halfelin robuste→poison (CON), Gnome→magie (INT/SAG/CHA). Mis dans rollSave (pas la Veille) car les JS arrivent hors combat. (2) **Maîtrises de compétence raciales** auto+verrouillées (`racialSkillProfs` state.js : Elfe→Perception, Demi-Orc→Intimidation, Goliath→Athlétisme ; quota competences.js ajusté). (3) **Badge 🔵 Concentration** par-sort (combat.js). `node --check` OK sur les 3 fichiers. 🧪 runtime à confirmer. RESTE polish : 🔸/↪ par capacité (sweep par-classe, non bloquant) ; Demi-Elfe 2 compét. au choix (picker, non fait).
- **2026-06-09** — Passe « bugs puis audit » (v0.9.102). **Bugs** : les 3 régressions « 🔴 » du backlog (panneau de dé fermé au lancer/toggle, fiche→HUD quitte le groupe, swipe onglets) re-vérifiées dans le code = **toutes déjà corrigées** (notes 2026-06-03 caduques) ; backlog de bugs concrets vide. **Audit Section A clôturée** : `rollAttack` (combat.js:408) audité = ✅ 4D solide ; Concentration = mécanique ✅ mais badge 🔵 par-sort ❌ absent (polish). **Capacités de RACE** : verdict ❌ « display-only » du 2026-06-02 **révisé en ⚠️** — la plupart sont câblées (config.js SRD.races : résistances, PV nain, crit/endurance Demi-Orc, souffle Dragonide, chance halfelin) ; reste display-only = avantages aux JS raciaux + maîtrises compétence raciales + vision dans le noir (petit lot codable). NB : `data/base-srd/races.json` (traduit ce jour) = fiche compendium, distinct des races de création.
- **2026-06-08 (1)** — Création du registre. Audit Section A (systèmes centraux) + Section C (cahier des charges UX) au niveau structurel. Section B (deep audit 13 classes) NON commencée. 5 ❌ confirmés (Section D). Version app : 0.9.97.
- **2026-06-08 (5)** — Codé v0.9.101 : **socle notifs MJ (journal d'actions joueur→MJ)** — helper `_logMJAction` + hooks (attaque/JS/sort/PV) + diff côté listener MJ → `_mjCombatLog`. `node --check` OK ; **nécessite test 2 clients** (sync temps réel).
- **2026-06-08 (4)** — **Audit des 13 classes terminé** (Clerc+Occultiste lus en entier, 11 autres vérifiés par grep ciblé sur résidus documentés). Verdict : aucune capacité de base manquante ; tous les flags « pré-théorisation » caducs. Reste = 5 thèmes transversaux (Section D), majoritairement bloqués compendium / couplés inventaire / runtime-bound. Codé v0.9.100 : Clerc Frappe guidée + Bénédiction du dieu de la guerre (boutons +10 / −1 conduit).
- **2026-06-08 (3)** — Codé v0.9.99 : (1) **filtre PNJ/Monstre** (pnj.js) ; (2) **Âme de diamant** Moine niv.14 (bouton de relance de JS −1 ki, `_diamondSoulReroll`) ; (3) **Évasion** Moine/Rôdeur niv.7 (note rappel sur JS DEX) ; (4) cas Veille Artificier Maître armurier (round 1) + support `cond`. Tout `node --check` OK (pas de runtime).
- **2026-06-08 (2)** — Lecture du corpus de théorisation (backlog 42 Ko = historique d'audit jusqu'à BLOC 3/v0.9.43, 28 principes, Veille, Option B, règles maison). Confrontation des gaps documentés au code RÉEL : la plupart sont **déjà faits** (Barbare conMod, Druide Cercle des terres, Paladin auras, Réflexes de voleur, consommables, Éclair de génie, Touche-à-tout). **Codé v0.9.98** : (1) **moteur de Veille** (`renderVeille` + `_VEILLE_CASES` + `_checkHpZeroVeille` + CSS) — 8 cas câblés + 2 HP→0 ; (2) **tracker éco d'action** complété par le **panneau Actions de base BG3** (`renderBaseActions`). Tout vérifié `node --check` (PAS de runtime — à confirmer en jeu). RESTE : deep audit 12-points des 13 classes, cas Veille restants (Chasseur option/Moine JS-raté/Nimbe niv.20), grisage auto des boutons d'attaque, PNJ/Monstre filtre, @OPTION_B (bloqué compendium), passe toasts→bannières.
