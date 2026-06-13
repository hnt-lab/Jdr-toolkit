# VEILLE DA / UI — Études comparatives (2026-06-12)

> Objectif : confronter MJ Toolkit aux références les mieux notées en direction artistique et interface
> (jeux + apps JdR), en extraire des points d'amélioration **compatibles avec notre ancre DA verrouillée**
> (magitech laiton/cuivre + énergie arcanique teal ; engrenages RÉSERVÉS au chargement).
> Fichier durable — à enrichir à chaque veille. Voir aussi `_audit/AUDIT.md` et la charte DA (mémoire).

---

## 1. CORPUS ÉTUDIÉ

### Jeux référents en UI/DA
| Référence | Pourquoi elle fait référence |
|---|---|
| **Persona 5 / Metaphor (Atlus)** | L'UI la plus citée de la décennie : chaque menu, icône et transition **prolonge le thème** du jeu. Leur directeur insiste sur l'« unité » : toute l'équipe travaille l'UI comme un sujet majeur, pas une finition. |
| **Hades (Supergiant)** | Hiérarchie visuelle exemplaire (taille/couleur/espacement), **feedback systématique** (survol, pression, son) ; lisibilité parfaite même dans le chaos du combat. |
| **Baldur's Gate 3 (Larian)** | Déjà notre référence mécanique (variantes d'attaque, actions de base, smite post-touche). Côté UI : tooltips riches partout, portraits + cadres de tour, barre d'actions contextuelle. |

### Apps JdR
| Référence | Enseignement |
|---|---|
| **D&D Beyond** (leader du marché) | ⚠️ **Anti-modèle partiel** documenté : trop de couleurs sans hiérarchie, éléments qui se concurrencent, **tâches simples = trop d'étapes**, fiche trop dense sur mobile, édition impossible dans l'app. Leçon : la sobriété de notre palette est un ATOUT ; surveiller le « nombre de taps » de nos parcours. |
| **Alchemy RPG** (VTT « cinématique ») | La plus belle DA du marché VTT : structure en **scènes**, ambiances sonores, art immersif, **Zen Mode** (tout masquer d'un raccourci pour ne garder que la scène), mode streamer. Priorité au théâtre de l'esprit plutôt qu'au tactique — exactement notre philosophie « la table ». |
| **Owlbear Rodeo** | Minimalisme radical : n'afficher QUE l'essentiel, tout le reste à la demande — conforte notre principe de filtrage (charte UX). |
| **Pathbuilder 2e / 5e Companion** | Les mieux notés sur mobile : dés intégrés, hors-ligne, fiche pensée tactile d'abord. |

### Standards mobile 2025 (notre cas : joueurs sur téléphone à table)
- **75 % des utilisateurs naviguent au pouce, 49 % à une main** → la « thumb zone » (bas de l'écran) doit recevoir les actions fréquentes ; le haut de l'écran est la zone la plus coûteuse.
- **Dark theme** : désaturer les couleurs claires sur fond sombre (gamme claire 200→50), contraste suffisant pour les textes secondaires.
- Cibles tactiles ≥ 44 px ; animations courtes et performantes ; accessibilité = standard, plus un bonus.

---

## 2. COMPARATIF — où en est MJ Toolkit

### ✅ Nos forces (confirmées par la veille)
- **Palette sobre et identitaire** (laiton/teal sur bois sombre) — là où D&D Beyond se fait critiquer pour sa cacophonie de couleurs.
- **Philosophie BG3 déjà intégrée au gameplay** (variantes d'attaque, actions de base, économie d'action) — peu d'apps le font.
- **Filtrage** (« ne jamais montrer l'inutilisable ») = la leçon Owlbear, déjà dans notre charte.
- **Dé flottant en bas à droite** = déjà dans la thumb zone. Bannières > toasts = déjà acté (principe 20).
- Théâtre de l'esprit assumé (pas de VTT tactique) = le créneau d'Alchemy, le mieux noté en immersion.

### ⚠️ Nos écarts (les opportunités)
1. **L'ancre DA ne vit que sur les écrans d'entrée** (connexion, chargement, MAJ). Le quotidien (panneaux, boutons, onglets, bannières, modals) reste « dark theme générique ». *Leçon Persona : l'identité doit se décliner sur TOUS les composants, pas seulement le hall d'entrée.*
2. **Feedback d'interaction inégal** : pas d'état « pression » ni de micro-confirmations cohérentes sur les boutons critiques (jets, PV, sorts). *Leçon Hades.*
3. **Pas de « moment signature »** : le jet de dé — l'action la plus répétée — n'a aucune mise en scène. *Persona/Hades : l'action centrale du jeu mérite une identité forte.* (La « carte de jet animée » du journal est déjà spécifiée dans la charte UX — c'est LE candidat.)
4. **Nombre de taps non mesuré** sur les parcours fréquents (attaquer, lancer un sort, prendre des dégâts, JS, se reposer). *Anti-leçon D&D Beyond.*
5. **Navigation en haut d'écran sur mobile** (barre d'onglets) = zone la plus difficile au pouce. *Standard 2025 : navigation en bas.*
6. **Pas de « mode immersion »** : pendant une scène narrative, l'écran reste chargé. *Leçon Alchemy (Zen Mode).*
7. **Contraste des textes tertiaires** (`--text3`) sur fond sombre à vérifier (désaturation/gamme claire).

---

## 3. POINTS D'AMÉLIORATION PROPOSÉS (priorisés)

### Lot A — Quick wins de cohérence DA (petit effort, gros effet quotidien)
- **A1. Kit de composants arcanepunk** : décliner l'ancre sur les composants du quotidien — titres de panneaux avec filet laiton, bannières avec liseré arcanique teal, modals avec coins rivetés discrets. (Un seul fichier CSS, pas de refonte.)
- **A2. Hiérarchie de boutons stricte** : 3 styles seulement (primaire laiton plein / secondaire contour / danger) + audit des incohérences existantes.
- **A3. États d'interaction** : `:active` (pression) avec micro-scale + lueur teal sur les boutons de jets/PV/sorts ; état sélectionné unifié sur toutes les cartes de choix.
- **A4. Passe contraste** : vérifier `--text3` et les tailles ≤15px sur fond sombre (désaturer/éclaircir si besoin).

### Lot B — Le « moment signature » (effort moyen, identité forte)
- **B1. Animation de jet de dé** (= la carte de jet du journal, déjà spécifiée charte UX) : le dé se matérialise en **runes d'énergie teal** (PAS d'engrenages — réservés au chargement), résultat en gros, contexte, puis la carte se range dans le journal. Une seule animation, réutilisée partout (joueur, HUD, MJ) = cohérence Persona.

### Lot C — Ergonomie mobile (à débattre — change des habitudes)
- **C1. Mesure des parcours** : compter les taps des 5 actions les plus fréquentes, cible ≤ 2-3 ; corriger les pires.
- **C2. Barre d'onglets en bas sur mobile** (thumb zone) — gros changement d'habitude, à trancher ensemble, éventuellement en option.

### Lot D — Immersion (s'insère dans « La table partagée », Phase 2)
- **D1. Mode immersion / Zen** : un toggle qui masque tout sauf l'essentiel (image de scène du MJ + PV) pendant les moments narratifs. S'appuie sur l'espace MJ Cartes/Visuels déjà prévu.
- **D2. Ambiances** : sons d'ambiance optionnels par scène (très différenciant, mais Phase 2+, opt-in, poids à surveiller).
- **D3. Son de dé optionnel** (feedback Hades) — micro-fichier audio, toggle dans le profil.

---

## 4bis. IMPLÉMENTATION (2026-06-12, v0.9.105)

### ✅ FAIT
- **Lot A (kit arcanepunk quotidien)** — `css/da-theme.css` étendu : accent laiton gravé sous chaque titre de panneau (`.pt::after`), **retour de pression** sur tous les boutons (`:active` micro-enfoncement, leçon Hades), **état sélectionné unifié** (race/classe/style/sort/équipement : liseré laiton + halo + point arcane teal), barre latérale sur cartes dépliées. Variable `--arc` (teal) ajoutée. + **fix : `da-theme.css` ajouté au PRECACHE du SW** (il manquait → KO hors-ligne au 1er chargement).
- **Lot B (moment signature)** — `_diceFX()` (index.js) : éclat de **runes arcaniques teal** + résultat en grand (Cinzel) à chaque jet, ≈0,95 s, **non bloquant** (`pointer-events:none`), défensif (try/catch, ne casse aucun jet), **mode virtuel seulement**. Hooké sur `diceRoll` (carac/JS/compétence), `rollAttack` (attaque), `rollSave` (sauvegarde). Crit=doré, échec=rouge. Respecte `prefers-reduced-motion`.
- **Lot D partiel (son + contrôle)** — `_diceSound()` (WebAudio synthétisé, **aucun fichier**, OFF par défaut) accompagne l'éclat. **Réglages profil → « 🎲 Effets de dé »** : 2 bascules (animation ON par défaut / son OFF par défaut). Répond au besoin « certains n'en voudront pas ».

### ⏸️ NON CODÉ À L'AVEUGLE — décision / Phase 2
- **C1 — audit des parcours (taps)** : estimation par lecture du code (sur la fiche déjà ouverte) — Attaquer ≈ 2 (onglet Combat → bouton arme) · Lancer un sort ≈ 2-3 (Combat → ⚡ → picker si plusieurs emplacements) · Subir des dégâts ≈ 3-4 (Perso → 💥 → saisie → ✓) · JS ≈ 2. **Verdict : les actions elles-mêmes sont courtes ; la friction réelle = la navigation entre onglets via la barre EN HAUT** (zone difficile au pouce). → renforce C2.
- **C2 — barre d'onglets en bas sur mobile** : faisable en CSS (`@media ≤640px` : `#tabBar`/`#mjTabBar` en `position:fixed;bottom:0` + padding-bas du contenu), MAIS **gros changement d'habitude + collision potentielle avec le dé flottant (bas-droite) + risque de masquer du contenu**. NON codé à l'aveugle : à voir ensemble (idéalement en option activable). **Décision utilisateur requise.**
- **D1 — mode Zen / immersion** : dépend du système de scènes MJ (Cartes/Visuels) = **Phase 2 « La table partagée »**. Prématuré tant que la scène partagée n'existe pas.
- **D2 — ambiances sonores par scène** : Phase 2+, asset/poids à cadrer, opt-in.

## 4. SOURCES
- [GamesRadar — comment Atlus (Persona/Metaphor) fait la meilleure UI du JRPG](https://www.gamesradar.com/games/rpg/how-did-persona-5-persona-3-and-now-metaphor-refantazio-achieve-some-of-the-best-ui-in-jrpg-history-its-veteran-atlus-director-stresses-unity-and-support-for-dev-teams/)
- [The UI and UX of Persona 5 (Ridwan Khan)](https://ridwankhan.com/the-ui-and-ux-of-persona-5-183180eb7cce)
- [Game menus as UX masterpieces — leçons Hades/BG3 (Medium)](https://krishnamohanyag.medium.com/game-menus-as-ux-masterpieces-lessons-for-designers-5c328050cfc7)
- [UI/UX Case Study : D&D Beyond App Redesign (Medium)](https://medium.com/@alekainast/ui-ux-case-study-d-d-beyond-app-redesign-caa73e429551)
- [D&D Beyond mobile : critique fiche mobile (Blizzard Watch)](https://blizzardwatch.com/2020/07/07/dd-beyond-character-sheet-app/)
- [Best D&D Character Sheet Apps (DungeonSolvers)](https://www.dungeonsolvers.com/dnd-character-sheet-apps/)
- [Why Alchemy RPG is the Best VTT for Storytelling (Churape)](https://churapereviews.com/2025/04/11/why-alchemy-rpg-is-the-best-virtual-tabletop-for-storytelling/)
- [New Player's Guide to Alchemy RPG — Zen Mode (StartPlaying)](https://startplaying.games/blog/virtual-table-tops/the-new-players-guide-to-alchemy-rpg)
- [Play Your Game, Not the VTT (Medium)](https://yourgmchandler.medium.com/play-your-game-not-the-vtt-0a2f3882df9f)
- [Thumb-Zone Optimization — 75 % pouce / 49 % une main (Medium)](https://webdesignerindia.medium.com/thumb-zone-optimization-mobile-navigation-patterns-9fbc54418b81)
- [Design for the Dark Theme — désaturation, gamme 200-50 (Snapp Mobile)](https://medium.com/snapp-mobile/design-for-the-dark-theme-9a2185bbb1d5)
