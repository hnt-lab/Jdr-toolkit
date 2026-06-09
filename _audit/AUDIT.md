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
| Concentration | ⚠️ | Panneau partagé + statut + conflit géré (sorts.js:6,495-521). **À confirmer : badge 🔵 visible sur chaque sort de la liste** |
| Attaque `rollAttack` | ⬜ | combat.js:332 — à auditer (touche+dégâts, crit, avantage, types) |
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
| Création perso (race/classe/archétype/carac/compét/équipement, import = assistant) | ⬜ | À auditer |
| Boutique d'achat à la création (or → liste+prix, prix existent config.js) | ⬜ | Faisable, à vérifier si fait |
| Level-up : sorts ET capacités fonctionnels (jamais display-only) | ⚠️ | Texte générique corrigé v0.9.95 ; reste à auditer le « jamais display-only » par capacité |
| Barde Touche-à-tout (½ maîtrise au moteur) | ✅ | competences.js:21 — bonus inclut `halfPb` sur compét. non maîtrisées + perception passive (gap backlog caduc). Edge mineur : jets de carac bruts du panneau dé n'incluent pas le ½ (à voir) |
| Dépliants partout (F1) : panneau description par sort/capacité au choix | ⬜ | `_featDesc` existe — couverture à vérifier |
| Capacités de RACE rendues fonctionnelles (pas que stats+vitesse) | ❌ | Audit 2026-06-02 : reste display-only (traits texte). Non traité depuis |
| Sorts : upcasting (modal emplacement, filtre amplifiables, IRL) | ⬜ | À auditer |
| Sorts : badges préparé/connu/rituel/🔵 | ⚠️ | À confirmer (cf. Section A concentration) |
| Inventaire : encombrement par paliers | ❌ | Bloqué compendium (poids par objet absent — Option B) |
| Inventaire : munitions format quantité | ⬜ | À vérifier |
| Inventaire : type de dégâts à la saisie HP (÷2/annulé auto + réactions) | ⬜ | openHpModal — à auditer |
| Inventaire : échange entre joueurs, consommables (Utiliser), objets→sorts | ⬜ | À auditer |
| **Combat : tracker éco d'action complet** | ❌ | v0.9.97 incomplet (cf. Section A) |
| **Combat : panneau d'actions de base BG3 (Foncer/Désengager/Esquiver…)** | ❌ | Pas commencé |
| **Combat : AO dans panneau attaque (↪ réutilisable au tour suivant)** | ⬜ | À vérifier |
| Combat : avantage/désav. indiqué par le joueur, variantes BG3, IRL | ⚠️ | Moteur adv/désav OK ; variantes BG3 à auditer |
| MJ : tracker, sync, conditions, combat persisté, jets de mort | ⬜ | À auditer |
| MJ : notifs 3ᵉ pers., buffs groupe (résultat transmis), invocations unifiées | ⬜ | À auditer |
| Journal d'actions + dés (animation carte, MJ voit tout) | ⬜ | À auditer vs spec |
| Hub : bouton Accueil (≠ Quitter), panneau campagne = table simulée | ⬜ | Redesign fait ; conformité spec à vérifier |
| Espace MJ : 🗺 Cartes / 🖼 Visuels / 📜 Textes / 📖 Quêtes | ⬜ | À vérifier |
| Guides (profil) classe/archétype/base | 🟢 | Différés (rédaction contenu) |
| IRL partout (saisie + rappels dorés) | ⚠️ | Saisie OK (diceRoll) ; **rappels dorés = ❌ (Veille absente)** |

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
- ❌ Capacités de RACE display-only (audit 2026-06-02 jamais soldé — stats+vitesse seuls appliqués).
- ❌ Encombrement par paliers — bloqué compendium (poids/objet absent).
- 🧪 **Déclenche/Interagit de TOUTES les classes** = à confirmer en **runtime** (test utilisateur) — incompressible.

---

# JOURNAL D'AUDIT
- **2026-06-08 (1)** — Création du registre. Audit Section A (systèmes centraux) + Section C (cahier des charges UX) au niveau structurel. Section B (deep audit 13 classes) NON commencée. 5 ❌ confirmés (Section D). Version app : 0.9.97.
- **2026-06-08 (5)** — Codé v0.9.101 : **socle notifs MJ (journal d'actions joueur→MJ)** — helper `_logMJAction` + hooks (attaque/JS/sort/PV) + diff côté listener MJ → `_mjCombatLog`. `node --check` OK ; **nécessite test 2 clients** (sync temps réel).
- **2026-06-08 (4)** — **Audit des 13 classes terminé** (Clerc+Occultiste lus en entier, 11 autres vérifiés par grep ciblé sur résidus documentés). Verdict : aucune capacité de base manquante ; tous les flags « pré-théorisation » caducs. Reste = 5 thèmes transversaux (Section D), majoritairement bloqués compendium / couplés inventaire / runtime-bound. Codé v0.9.100 : Clerc Frappe guidée + Bénédiction du dieu de la guerre (boutons +10 / −1 conduit).
- **2026-06-08 (3)** — Codé v0.9.99 : (1) **filtre PNJ/Monstre** (pnj.js) ; (2) **Âme de diamant** Moine niv.14 (bouton de relance de JS −1 ki, `_diamondSoulReroll`) ; (3) **Évasion** Moine/Rôdeur niv.7 (note rappel sur JS DEX) ; (4) cas Veille Artificier Maître armurier (round 1) + support `cond`. Tout `node --check` OK (pas de runtime).
- **2026-06-08 (2)** — Lecture du corpus de théorisation (backlog 42 Ko = historique d'audit jusqu'à BLOC 3/v0.9.43, 28 principes, Veille, Option B, règles maison). Confrontation des gaps documentés au code RÉEL : la plupart sont **déjà faits** (Barbare conMod, Druide Cercle des terres, Paladin auras, Réflexes de voleur, consommables, Éclair de génie, Touche-à-tout). **Codé v0.9.98** : (1) **moteur de Veille** (`renderVeille` + `_VEILLE_CASES` + `_checkHpZeroVeille` + CSS) — 8 cas câblés + 2 HP→0 ; (2) **tracker éco d'action** complété par le **panneau Actions de base BG3** (`renderBaseActions`). Tout vérifié `node --check` (PAS de runtime — à confirmer en jeu). RESTE : deep audit 12-points des 13 classes, cas Veille restants (Chasseur option/Moine JS-raté/Nimbe niv.20), grisage auto des boutons d'attaque, PNJ/Monstre filtre, @OPTION_B (bloqué compendium), passe toasts→bannières.
