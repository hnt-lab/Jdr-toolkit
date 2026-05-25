function mjTabRegles(){
  function ds(id,html){return`<div class="mj-rules-section" data-ruleid="${id}" draggable="true" ondragstart="mjRuleDragStart('${id}',this)" ondragend="mjRuleDragEnd(this)" ondragover="mjRuleDragOver(event,this)" ondrop="mjRuleDrop(event,'${id}')">${html}</div>`;}
  function dh(id,title){const col=_rulesCollapsed[id];return`<div class="pt" style="display:flex;align-items:center;gap:6px;cursor:pointer;user-select:none" onclick="toggleRuleSection('${id}')"><span class="mj-drag-handle" title="Glisser pour rÃ©organiser" onclick="event.stopPropagation()">â ¿</span>${title}<span id="rschev_${id}" style="margin-left:auto;font-size:10px;color:var(--text3);transition:transform .2s${col?';transform:rotate(-90deg)':''}">â–¼</span></div>`;}
  function gh(id,label){const col=_rulesCollapsed[id];return`<div style="display:flex;align-items:center;gap:6px;padding:4px 0 8px;color:var(--text3);font-size:11px;cursor:pointer;user-select:none" onclick="toggleRuleSection('${id}')"><span class="mj-drag-handle" title="Glisser pour rÃ©organiser" onclick="event.stopPropagation()">â ¿</span>${label}<span id="rschev_${id}" style="margin-left:auto;font-size:10px;transition:transform .2s${col?';transform:rotate(-90deg)':''}">â–¼</span></div>`;}
  function rb(id,html){return`<div id="rsb_${id}"${_rulesCollapsed[id]?' style="display:none"':''}>${html}</div>`;}
  return`<div id="mjRulesContainer">
    ${ds('s-actions',`${gh('s-actions','âš” Combat â€” Actions &amp; Initiative')}
    ${rb('s-actions',`<div class="g2" style="gap:10px">
      <div class="regles-section">
        <div class="pt">ðŸŽ¯ Actions disponibles</div>
        <table class="regles-table">
          <tr><th>Action</th><th>Description</th></tr>
          <tr><td><strong>Attaquer</strong></td><td>1 attaque au corps Ã  corps ou Ã  distance. Certaines classes = 2 attaques au niv.5.</td></tr>
          <tr><td><strong>Lancer un sort</strong></td><td>Selon le temps d'incantation du sort (1 action, action bonus, rÃ©actionâ€¦)</td></tr>
          <tr><td><strong>Foncer</strong></td><td>+Vitesse ce tour (dÃ©placement total doublÃ©).</td></tr>
          <tr><td><strong>Se dÃ©sengager</strong></td><td>Le mouvement ne provoque pas d'attaque d'opportunitÃ© pour le reste du tour.</td></tr>
          <tr><td><strong>Esquiver</strong></td><td>Jusqu'au prochain tour : attaques contre soi en dÃ©savantage (si visible), jets DEX en avantage. AnnulÃ© si vitesse = 0 ou incapable d'agir.</td></tr>
          <tr><td><strong>Aider</strong></td><td>AlliÃ© Ã  portÃ©e 1,5m : avantage Ã  sa prochaine attaque ou son prochain jet de compÃ©tence (avant ton prochain tour).</td></tr>
          <tr><td><strong>Se cacher</strong></td><td>Jet de DEX (DiscrÃ©tion) contre la Perception passive des ennemis.</td></tr>
          <tr><td><strong>Chercher</strong></td><td>SAG (Perception) ou INT (Investigation) pour trouver quelque chose.</td></tr>
          <tr><td><strong>Se tenir prÃªt</strong></td><td>DÃ©clarer un dÃ©clencheur et une rÃ©action associÃ©e (attaque, sort, dÃ©placement). Agit via rÃ©action quand le dÃ©clencheur survient. Sort prÃ©parÃ© = concentration requise.</td></tr>
          <tr><td><strong>Utiliser un objet</strong></td><td>Pour interagir avec un 2e objet dans le tour, ou un objet qui requiert l'action explicitement.</td></tr>
          <tr><td><strong>Improviser</strong></td><td>Toute action hors liste â€” le MJ dÃ©cide de la possibilitÃ© et du jet requis.</td></tr>
        </table>
        <div style="font-size:11px;color:var(--text3);margin-top:8px;line-height:1.8">
          <strong>Action bonus</strong> : 1 max/tour, accordÃ©e par une capacitÃ© spÃ©cifique (Ruse du roublard, sort en action bonusâ€¦).<br>
          <strong>RÃ©action</strong> : 1 max/tour. Recharge au dÃ©but de ton tour. Exemples : attaque d'opportunitÃ©, bouclier, reprÃ©sailles infernales.<br>
          <strong>Interaction libre</strong> : 1 objet simple par tour sans action (dÃ©gainer, ouvrir une porteâ€¦). Le 2e objet coÃ»te l'action.
        </div>
      </div>
      <div class="regles-section">
        <div class="pt">ðŸŽ² Initiative &amp; Surprise</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          <strong>Initiative</strong> : 1d20 + mod DEX au dÃ©but du combat. Ordre dÃ©croissant. Ã‰galitÃ© : le MJ dÃ©cide (ou d20 supplÃ©mentaire).<br><br>
          <strong>Surprise</strong> : Si un groupe ne dÃ©tecte pas l'ennemi (DEX DiscrÃ©tion vs Perception passive), ses membres sont <em>surpris</em> au premier round.<br>
          Surpris = <strong>pas de mouvement, pas d'action, pas de rÃ©action</strong> pendant le premier tour.<br><br>
          <strong>Tour de combat</strong> :<br>
          1. Se dÃ©placer (â‰¤ vitesse, fragmentable)<br>
          2. Agir (1 action)<br>
          3. Action bonus si disponible<br>
          4. RÃ©action si dÃ©clencheur (mÃªme hors tour)
        </div>
        <div class="pt" style="margin-top:12px">âš” Attaques d'opportunitÃ©</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          DÃ©clenchÃ©e quand une crÃƒÂ©ature hostile <strong>quitte ton allonge</strong> volontairement.<br>
          CoÃ»te ta rÃ©action â†’ 1 attaque au corps Ã  corps.<br>
          AnnulÃ©e par l'action <strong>Se dÃ©sengager</strong>, la tÃ©lÃ©portation ou un dÃ©placement forcÃ©.
        </div>
        <div class="pt" style="margin-top:12px">ðŸ—¡ Combat Ã  deux armes</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          AprÃ¨s attaque avec arme CÃ C <strong>lÃ©gÃ¨re</strong> â†’ action bonus pour attaquer avec l'autre arme lÃ©gÃ¨re.<br>
          Pas de modificateur de caractÃ©ristique aux dÃ©gÃ¢ts de l'attaque bonus (sauf si nÃ©gatif).
        </div>
      </div>
    </div>`)}`)}
    ${ds('s-dc',`<div class="regles-section">
      ${dh('s-dc','ðŸŽ² DifficultÃ© (DC) suggÃ©rÃ©e')}
      ${rb('s-dc',`<table class="regles-table">
        <tr><th>DifficultÃ©</th><th>DC</th><th>Exemple</th></tr>
        <tr><td>TrÃ¨s facile</td><td><strong style="color:var(--cp)">5</strong></td><td>Escalader un mur avec des prises</td></tr>
        <tr><td>Facile</td><td><strong style="color:var(--cp)">10</strong></td><td>Crocheter une serrure ordinaire</td></tr>
        <tr><td>Moyen</td><td><strong style="color:var(--cp)">15</strong></td><td>Convaincre un garde mÃ©fiant</td></tr>
        <tr><td>Difficile</td><td><strong style="color:var(--cp)">20</strong></td><td>Escalader une paroi glissante</td></tr>
        <tr><td>TrÃ¨s difficile</td><td><strong style="color:var(--cp)">25</strong></td><td>RepÃ©rer une porte secrÃ¨te bien cachÃ©e</td></tr>
        <tr><td>Quasi-impossible</td><td><strong style="color:var(--cp)">30</strong></td><td>DÃ©foncer une porte de pierre renforcÃ©e Ã  mains nues</td></tr>
      </table>`)}
    </div>`)}
    ${ds('s-conditions',`${gh('s-conditions','ðŸ˜µ Conditions &amp; PV temporaires')}
    ${rb('s-conditions',`<div class="g2" style="gap:10px">
      <div class="regles-section">
        <div class="pt">Conditions</div>
        <table class="regles-table">
          <tr><th>Condition</th><th>Effets principaux</th></tr>
          <tr><td><strong>Ã€ terre (RenversÃ©)</strong></td><td>Seul mouvement = ramper (coÃ»t Ã—2). Se relever = Â½ vitesse. Attaques en dÃ©savantage. Contre lui : CÃ C en avantage, distance en dÃ©savantage.</td></tr>
          <tr><td><strong>AgrippÃ©</strong></td><td>Vitesse = 0 (aucun bonus). Prend fin si le ravisseur est incapable d'agir ou si la crÃ©ature est hors portÃ©e. Ã‰chapper = action â†’ FOR (AthlÃ©tisme) ou DEX (Acrobaties) opposÃ©.</td></tr>
          <tr><td><strong>AveuglÃ©</strong></td><td>Rate tout jet nÃ©cessitant la vue. Attaques en dÃ©savantage, contre lui en avantage.</td></tr>
          <tr><td><strong>CharmÃ©</strong></td><td>Ne peut pas attaquer ni cibler la source du charme. La source a l'avantage sur ses jets de CHA contre lui.</td></tr>
          <tr><td><strong>Sourd</strong></td><td>Rate tout jet nÃ©cessitant l'ouÃ¯e.</td></tr>
          <tr><td><strong>EffrayÃ©</strong></td><td>DÃ©savantage aux jets d'attaque et de caractÃ©ristiques tant que la source est visible. Ne peut pas s'approcher volontairement.</td></tr>
          <tr><td><strong>EmpoisonnÃ©</strong></td><td>DÃ©savantage aux jets d'attaque et de caractÃ©ristiques.</td></tr>
          <tr><td><strong>EntravÃ©</strong></td><td>Vitesse = 0. Attaques en dÃ©savantage. Contre lui en avantage. DÃ©savantage aux JS DEX.</td></tr>
          <tr><td><strong>Ã‰tourdi</strong></td><td>Incapable d'agir, ne peut bouger ni parler normalement. Rate JS FOR et DEX. Contre lui en avantage.</td></tr>
          <tr><td><strong>Inconscient</strong></td><td>Incapable d'agir, immobile, lÃ¢che ce qu'il tient, tombe Ã  terre. Rate JS FOR et DEX. Contre lui en avantage. Toute attaque de moins de 1,5m = critique auto.</td></tr>
          <tr><td><strong>Invisible</strong></td><td>Introuvable sans magie ou sens spÃ©ciaux. Attaques en avantage, contre lui en dÃ©savantage. Position rÃ©vÃ©lÃ©e si bruit ou traces.</td></tr>
          <tr><td><strong>NeutralisÃ©</strong></td><td>Ne peut effectuer aucune action ni rÃ©action.</td></tr>
          <tr><td><strong>ParalysÃ©</strong></td><td>NeutralisÃ© + immobile. Rate JS FOR et DEX. Contre lui en avantage. TouchÃ© Ã  â‰¤1,5m = critique auto.</td></tr>
          <tr><td><strong>PÃ©trifiÃ©</strong></td><td>TransformÃ© en substance solide (poids Ã—10, vieillissement suspendu). Incapable d'agir, immobile. RÃ©sistance Ã  tous dÃ©gÃ¢ts. ImmunisÃ© poison/maladie (suspendus). Contre lui en avantage. Rate JS FOR et DEX.</td></tr>
          <tr><td><strong>Ã‰puisÃ©</strong></td><td>6 niveaux cumulatifs. Niv.1 : dÃ©sav. jets caract. Â· Niv.2 : vitesse Ã·2 Â· Niv.3 : dÃ©sav. attaques et JS Â· Niv.4 : PV max Ã·2 Â· Niv.5 : vitesse = 0 Â· Niv.6 : mort. Repos long = âˆ’1 niveau (si mangÃ© et bu).</td></tr>
        </table>
      </div>
      <div class="regles-section">
        <div class="pt">â¤ Points de vie temporaires</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          Les PV temporaires absorbent les dÃ©gÃ¢ts <strong>avant</strong> les PV normaux.<br>
          Ils <strong>ne se cumulent pas</strong> : si tu en reÃ§ois de nouveaux, tu choisis de garder les anciens ou les nouveaux.<br>
          Les soins <strong>ne restaurent pas</strong> les PV temporaires.<br>
          Ils persistent jusqu'Ã  Ã©puisement ou repos long, sauf durÃ©e spÃ©cifiÃ©e.<br>
          Ils peuvent dÃ©passer ton maximum de PV, mais Ã  0 PV ils ne te font pas revenir conscient.
        </div>
      </div>
    </div>`)}`)}
    ${ds('s-couverture',`${gh('s-couverture','Couverture, DÃ©gÃ¢ts &amp; Combat spÃ©cial')}
    ${rb('s-couverture',`<div class="g2" style="gap:10px">
      <div class="regles-section">
        <div class="pt">ðŸ›¡ Couverture</div>
        <table class="regles-table">
          <tr><th>Type</th><th>Bonus</th><th>Exemple</th></tr>
          <tr><td>MoitiÃ© (50%)</td><td><strong style="color:var(--cp)">+2 CA et JS DEX</strong></td><td>Mur bas, tonneau, alliÃ©</td></tr>
          <tr><td>Trois quarts (75%)</td><td><strong style="color:var(--cp)">+5 CA et JS DEX</strong></td><td>MeurtriÃ¨re, herse, gros tronc</td></tr>
          <tr><td>Totale (100%)</td><td>Impossible Ã  cibler</td><td>Mur plein</td></tr>
        </table>
        <div style="font-size:11px;color:var(--text3);margin-top:4px">Si plusieurs sources : seul le type le plus Ã©levÃ© s'applique (pas de cumul).</div>
      </div>
      <div class="regles-section">
        <div class="pt">ðŸŽ¯ Attaques spÃ©ciales</div>
        <table class="regles-table">
          <tr><th>Type</th><th>Condition</th><th>Effet</th></tr>
          <tr><td><strong>Coup critique (20 nat.)</strong></td><td>Jet d'attaque</td><td>DÃ©s de dÃ©gÃ¢ts Ã— 2 (modificateurs normaux). Le 1 nat. rate toujours.</td></tr>
          <tr><td><strong>Lutte</strong></td><td>Cible â‰¤ taille+1, main libre</td><td>FOR (AthlÃ©tisme) opposÃ© Ã  FOR (Ath.) ou DEX (Acro.) â†’ AgrippÃ©. DÃ©placer la cible : vitesse Ã·2.</td></tr>
          <tr><td><strong>Bousculer</strong></td><td>Cible â‰¤ taille+1</td><td>FOR (AthlÃ©tisme) opposÃ© Ã  FOR (Ath.) ou DEX (Acro.) â†’ RenversÃ© ou recule 1,5m.</td></tr>
          <tr><td><strong>Assommer</strong></td><td>RÃ©duit Ã  0 PV (CÃ C)</td><td>Choix de l'attaquant : cible inconsciente et stable au lieu de mourir.</td></tr>
          <tr><td><strong>RÃ©sistance</strong></td><td>RÃ©sistance au type</td><td>DÃ©gÃ¢ts Ã·2. VulnÃ©rabilitÃ© = Ã—2. Pas de cumul entre elles.</td></tr>
        </table>
      </div>
      <div class="regles-section">
        <div class="pt">ðŸ“ Taille des crÃ©atures</div>
        <table class="regles-table">
          <tr><th>Taille</th><th>Espace contrÃ´lÃ©</th></tr>
          <tr><td>TrÃ¨s petite (TP)</td><td>75 cm Ã— 75 cm</td></tr>
          <tr><td>Petite (P)</td><td>1,5 m Ã— 1,5 m</td></tr>
          <tr><td>Moyenne (M)</td><td>1,5 m Ã— 1,5 m</td></tr>
          <tr><td>Grande (G)</td><td>3 m Ã— 3 m</td></tr>
          <tr><td>TrÃ¨s grande (TG)</td><td>4,5 m Ã— 4,5 m</td></tr>
          <tr><td>Gigantesque (Gig)</td><td>6 m Ã— 6 m ou plus</td></tr>
        </table>
        <div style="font-size:11px;color:var(--text3);margin-top:4px">Se faufiler dans un espace d'1 taille en dessous : coÃ»t Ã—2, dÃ©savantage attaques et JS DEX, attaques contre lui en avantage.</div>
      </div>
      <div class="regles-section">
        <div class="pt">ðŸ’¥ Types de dÃ©gÃ¢ts</div>
        <table class="regles-table" style="font-size:11px">
          <tr><th>Type</th><th>Exemples</th></tr>
          <tr><td><strong>Acide</strong></td><td>Souffle dragon noir, gelÃ©e noire</td></tr>
          <tr><td><strong>Contondant</strong></td><td>Marteaux, chute, constriction</td></tr>
          <tr><td><strong>Feu</strong></td><td>Souffle dragon rouge, boule de feu</td></tr>
          <tr><td><strong>Force</strong></td><td>Projectile magique, arme spirituelle</td></tr>
          <tr><td><strong>Foudre</strong></td><td>Ã‰clair, souffle dragon bleu</td></tr>
          <tr><td><strong>Froid</strong></td><td>CÃ´ne de froid, souffle dragon blanc</td></tr>
          <tr><td><strong>NÃ©crotique</strong></td><td>Morts-vivants, certains sorts</td></tr>
          <tr><td><strong>Perforant</strong></td><td>Lances, morsures, flÃ¨ches</td></tr>
          <tr><td><strong>Poison</strong></td><td>Venin, souffle dragon vert</td></tr>
          <tr><td><strong>Psychique</strong></td><td>Illithid, attaque psionique</td></tr>
          <tr><td><strong>Radiant</strong></td><td>Colonne de flamme, chÃ¢timent angÃ©lique</td></tr>
          <tr><td><strong>Tonnerre</strong></td><td>Vague tonnante, explosion sonore</td></tr>
          <tr><td><strong>Tranchant</strong></td><td>Ã‰pÃ©es, haches, griffes</td></tr>
        </table>
      </div>
      <div class="regles-section">
        <div class="pt">ðŸ‡ Combat montÃ©</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          Monture consentante, au moins 1 taille plus grande. Monter/descendre = Â½ vitesse.<br>
          <strong>Monture contrÃ´lÃ©e</strong> (dressÃ©e) : partage l'initiative du cavalier, actions limitÃ©es Ã  Foncer/Esquiver/Se dÃ©sengager.<br>
          <strong>Monture indÃ©pendante</strong> : garde son initiative, agit seule (peut fuir, attaquerâ€¦).<br>
          Monture renversÃ©e ou vitesse rÃ©duite Ã  0 â†’ JS DEX DD10 pour rester en selle sinon tombÃ© Ã  1,5m.
        </div>
      </div>
      <div class="regles-section">
        <div class="pt">ðŸŒŠ Combat subaquatique</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          Sans vitesse de nage : dÃ©savantage aux attaques CÃ C (sauf dague, javeline, Ã©pÃ©e courte, lance, trident).<br>
          Attaque Ã  distance : rate auto au-delÃ  de la portÃ©e normale. DÃ©savantage mÃªme dans la portÃ©e normale (sauf arbalÃ¨te, filet, javelot/lance/trident/flÃ©chette).<br>
          CrÃ©ature entiÃ¨rement immergÃ©e : rÃ©sistance aux dÃ©gÃ¢ts de feu.
        </div>
      </div>
    </div>`)}`)}
    ${ds('s-armes-c',`<div class="regles-section">
      ${dh('s-armes-c','âš” Armes courantes')}
      ${rb('s-armes-c',`<table class="regles-table">
        <tr><th>Arme</th><th>DÃ©gÃ¢ts</th><th>PropriÃ©tÃ©s</th></tr>
        <tr><td colspan="3" style="color:var(--cp);font-size:11px;font-weight:600">Corps Ã  corps</td></tr>
        <tr><td>BÃ¢ton</td><td>1d6 contondant</td><td>Polyvalente (1d8)</td></tr>
        <tr><td>Dague</td><td>1d4 perforant</td><td>Finesse, lÃ©gÃ¨re, lancer (6/18m)</td></tr>
        <tr><td>Gourdin</td><td>1d4 contondant</td><td>LÃ©gÃ¨re</td></tr>
        <tr><td>Hachette</td><td>1d6 tranchant</td><td>LÃ©gÃ¨re, lancer (6/18m)</td></tr>
        <tr><td>Javeline</td><td>1d6 perforant</td><td>Lancer (9/36m)</td></tr>
        <tr><td>Lance</td><td>1d6 perforant</td><td>Lancer (6/18m), polyvalente (1d8)</td></tr>
        <tr><td>Marteau lÃ©ger</td><td>1d4 contondant</td><td>LÃ©gÃ¨re, lancer (6/18m)</td></tr>
        <tr><td>Masse d'armes</td><td>1d6 contondant</td><td>â€”</td></tr>
        <tr><td>Massue</td><td>1d8 contondant</td><td>Ã€ deux mains</td></tr>
        <tr><td>Serpe</td><td>1d4 tranchant</td><td>LÃ©gÃ¨re</td></tr>
        <tr><td colspan="3" style="color:var(--cp);font-size:11px;font-weight:600">Ã€ distance</td></tr>
        <tr><td>Arc court</td><td>1d6 perforant</td><td>Munitions (24/96m), 2 mains</td></tr>
        <tr><td>ArbalÃ¨te lÃ©gÃ¨re</td><td>1d8 perforant</td><td>Munitions (24/96m), chargement, 2 mains</td></tr>
        <tr><td>FlÃ©chette</td><td>1d4 perforant</td><td>Finesse, lancer (6/18m)</td></tr>
        <tr><td>Fronde</td><td>1d4 contondant</td><td>Munitions (9/36m)</td></tr>
      </table>`)}
    </div>`)}
    ${ds('s-armes-g',`<div class="regles-section">
      ${dh('s-armes-g','âš” Armes de guerre')}
      ${rb('s-armes-g',`<table class="regles-table">
        <tr><th>Arme</th><th>DÃ©gÃ¢ts</th><th>PropriÃ©tÃ©s</th></tr>
        <tr><td colspan="3" style="color:var(--cp);font-size:11px;font-weight:600">Corps Ã  corps</td></tr>
        <tr><td>Cimeterre</td><td>1d6 tranchant</td><td>Finesse, lÃ©gÃ¨re</td></tr>
        <tr><td>Coutille</td><td>1d10 tranchant</td><td>Lourde, allonge, 2 mains</td></tr>
        <tr><td>Ã‰pÃ©e Ã  deux mains</td><td>2d6 tranchant</td><td>Lourde, 2 mains</td></tr>
        <tr><td>Ã‰pÃ©e courte</td><td>1d6 perforant</td><td>Finesse, lÃ©gÃ¨re</td></tr>
        <tr><td>Ã‰pÃ©e longue</td><td>1d8 tranchant</td><td>Polyvalente (1d10)</td></tr>
        <tr><td>FlÃ©au d'armes</td><td>1d8 contondant</td><td>â€”</td></tr>
        <tr><td>Fouet</td><td>1d4 tranchant</td><td>Finesse, allonge</td></tr>
        <tr><td>Hache Ã  deux mains</td><td>1d12 tranchant</td><td>Lourde, 2 mains</td></tr>
        <tr><td>Hache d'armes</td><td>1d8 tranchant</td><td>Polyvalente (1d10)</td></tr>
        <tr><td>Hallebarde</td><td>1d10 tranchant</td><td>Lourde, allonge, 2 mains</td></tr>
        <tr><td>Lance d'arÃ§on</td><td>1d12 perforant</td><td>Allonge, spÃ©cialeâ€ </td></tr>
        <tr><td>Maillet</td><td>2d6 contondant</td><td>Lourde, 2 mains</td></tr>
        <tr><td>Marteau de guerre</td><td>1d8 contondant</td><td>Polyvalente (1d10)</td></tr>
        <tr><td>Morgenstern</td><td>1d8 perforant</td><td>â€”</td></tr>
        <tr><td>Pic de guerre</td><td>1d8 perforant</td><td>â€”</td></tr>
        <tr><td>Pique</td><td>1d10 perforant</td><td>Lourde, allonge, 2 mains</td></tr>
        <tr><td>RapiÃ¨re</td><td>1d8 perforant</td><td>Finesse</td></tr>
        <tr><td>Trident</td><td>1d6 perforant</td><td>Lancer (6/18m), polyvalente (1d8)</td></tr>
        <tr><td colspan="3" style="color:var(--cp);font-size:11px;font-weight:600">Ã€ distance</td></tr>
        <tr><td>Arc long</td><td>1d8 perforant</td><td>Munitions (45/180m), lourde, 2 mains</td></tr>
        <tr><td>ArbalÃ¨te de poing</td><td>1d6 perforant</td><td>Munitions (9/36m), lÃ©gÃ¨re, chargement</td></tr>
        <tr><td>ArbalÃ¨te lourde</td><td>1d10 perforant</td><td>Munitions (30/120m), lourde, chargement, 2 mains</td></tr>
        <tr><td>Filet</td><td>â€”</td><td>SpÃ©cialeâ€¡, lancer (1,5/4,5m)</td></tr>
        <tr><td>Sarbacane</td><td>1 perforant</td><td>Munitions (7,5/30m), chargement</td></tr>
      </table>
      <div style="font-size:11px;color:var(--text3);margin-top:6px;line-height:1.7"><strong>Finesse</strong> : FOR ou DEX &nbsp;Â·&nbsp; <strong>LÃ©gÃ¨re</strong> : combat Ã  2 armes &nbsp;Â·&nbsp; <strong>Allonge</strong> : +1,5m portÃ©e &nbsp;Â·&nbsp; <strong>Lourde</strong> : dÃ©savantage taille P &nbsp;Â·&nbsp; <strong>Chargement</strong> : 1 tir/action &nbsp;Â·&nbsp; <strong>ImprovisÃ©e</strong> : 1d4 &nbsp;Â·&nbsp; <strong>Argent</strong> : plaquer une arme 100 po &nbsp;Â·&nbsp; <strong>â€ Lance d'arÃ§on</strong> : dÃ©savantage â‰¤1,5m, 2 mains hors monture &nbsp;Â·&nbsp; <strong>â€¡Filet</strong> : entrave â‰¤taille G, JS FOR DD10 pour se libÃ©rer, 5 dgts tranchants (CA10) dÃ©truisent le filet, 1 attaque/action max</div>
      `)}
    </div>`)}
    ${ds('s-armures',`<div class="regles-section">
      ${dh('s-armures','ðŸ›¡ Armures')}
      ${rb('s-armures',`<table class="regles-table">
        <tr><th>Armure</th><th>CA</th><th>DiscrÃ©tion</th></tr>
        <tr><td colspan="3" style="color:var(--cp);font-size:11px;font-weight:600">LÃ©gÃ¨res</td></tr>
        <tr><td>MatelassÃ©e</td><td>11 + mod DEX</td><td>DÃ©savantage</td></tr>
        <tr><td>Cuir</td><td>11 + mod DEX</td><td>â€”</td></tr>
        <tr><td>Cuir cloutÃ©</td><td>12 + mod DEX</td><td>â€”</td></tr>
        <tr><td colspan="3" style="color:var(--cp);font-size:11px;font-weight:600">IntermÃ©diaires</td></tr>
        <tr><td>Peau</td><td>12 + mod DEX (max +2)</td><td>â€”</td></tr>
        <tr><td>Chemise de mailles</td><td>13 + mod DEX (max +2)</td><td>â€”</td></tr>
        <tr><td>Ã‰cailles</td><td>14 + mod DEX (max +2)</td><td>DÃ©savantage</td></tr>
        <tr><td>Cuirasse</td><td>14 + mod DEX (max +2)</td><td>â€”</td></tr>
        <tr><td>Demi-plate</td><td>15 + mod DEX (max +2)</td><td>DÃ©savantage</td></tr>
        <tr><td colspan="3" style="color:var(--cp);font-size:11px;font-weight:600">Lourdes</td></tr>
        <tr><td>Broigne</td><td>14</td><td>DÃ©savantage</td></tr>
        <tr><td>Cotte de mailles</td><td>16 (FOR 13 ou âˆ’3m)</td><td>DÃ©savantage</td></tr>
        <tr><td>Clibanion</td><td>17 (FOR 15 ou âˆ’3m)</td><td>DÃ©savantage</td></tr>
        <tr><td>Harnois</td><td>18 (FOR 15 ou âˆ’3m)</td><td>DÃ©savantage</td></tr>
        <tr><td>Bouclier</td><td>+2</td><td>â€”</td></tr>
      </table>
      <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin:10px 0 4px">Mettre / Ã”ter une armure</div>
      <table class="regles-table">
        <tr><th>CatÃ©gorie</th><th>Mettre</th><th>Ã”ter</th></tr>
        <tr><td>LÃ©gÃ¨re</td><td>1 min</td><td>1 min</td></tr>
        <tr><td>IntermÃ©diaire</td><td>5 min</td><td>1 min</td></tr>
        <tr><td>Lourde</td><td>10 min</td><td>5 min</td></tr>
        <tr><td>Bouclier</td><td>1 action</td><td>1 action</td></tr>
      </table>`)}
    </div>`)}
    ${ds('s-modifs',`<div class="regles-section">
      ${dh('s-modifs','ðŸŽ² Modificateurs de caractÃ©ristiques')}
      ${rb('s-modifs',`<table class="regles-table">
        <tr><th>Score</th><th>Mod.</th></tr>
        <tr><td>1</td><td style="color:#e53935">âˆ’5</td></tr>
        <tr><td>2â€“3</td><td style="color:#e53935">âˆ’4</td></tr>
        <tr><td>4â€“5</td><td style="color:#e53935">âˆ’3</td></tr>
        <tr><td>6â€“7</td><td style="color:#e53935">âˆ’2</td></tr>
        <tr><td>8â€“9</td><td style="color:#e53935">âˆ’1</td></tr>
        <tr><td>10â€“11</td><td>+0</td></tr>
        <tr><td>12â€“13</td><td style="color:var(--cp)">+1</td></tr>
        <tr><td>14â€“15</td><td style="color:var(--cp)">+2</td></tr>
        <tr><td>16â€“17</td><td style="color:var(--cp)">+3</td></tr>
        <tr><td>18â€“19</td><td style="color:var(--cp)">+4</td></tr>
        <tr><td>20â€“21</td><td style="color:var(--cp)">+5</td></tr>
        <tr><td>22â€“23</td><td style="color:var(--cp)">+6</td></tr>
        <tr><td>24â€“25</td><td style="color:var(--cp)">+7</td></tr>
        <tr><td>28â€“30</td><td style="color:var(--cp)">+9/+10</td></tr>
      </table>`)}
    </div>`)}
    ${ds('s-multiclasse',`<div class="regles-section">
      ${dh('s-multiclasse','ðŸ”€ Multiclassage')}
      ${rb('s-multiclasse',`<div style="font-size:11px;color:var(--text3);margin-bottom:8px">Option : ajouter un niveau dans une autre classe plutÃ´t que dans sa classe actuelle. NÃ©cessite les valeurs minimum dans les deux classes.</div>
      <div class="g2" style="gap:10px">
        <div>
          <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">PrÃ©requis</div>
          <table class="regles-table">
            <tr><th>Classe</th><th>Minimum requis</th></tr>
            <tr><td>Barbare</td><td>FOR 13</td></tr>
            <tr><td>Barde</td><td>CHA 13</td></tr>
            <tr><td>Clerc</td><td>SAG 13</td></tr>
            <tr><td>Druide</td><td>SAG 13</td></tr>
            <tr><td>Ensorceleur</td><td>CHA 13</td></tr>
            <tr><td>Guerrier</td><td>FOR 13 ou DEX 13</td></tr>
            <tr><td>Magicien</td><td>INT 13</td></tr>
            <tr><td>Moine</td><td>DEX 13 et SAG 13</td></tr>
            <tr><td>Occultiste</td><td>CHA 13</td></tr>
            <tr><td>Paladin</td><td>FOR 13 et CHA 13</td></tr>
            <tr><td>RÃ´deur</td><td>DEX 13 et SAG 13</td></tr>
            <tr><td>Roublard</td><td>DEX 13</td></tr>
          </table>
        </div>
        <div>
          <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">MaÃ®trises gagnÃ©es (nouveau niveau)</div>
          <table class="regles-table">
            <tr><th>Classe</th><th>MaÃ®trises gagnÃ©es</th></tr>
            <tr><td>Barbare</td><td>Boucliers, armes courantes &amp; de guerre</td></tr>
            <tr><td>Barde</td><td>Armure lÃ©gÃ¨re, 1 compÃ©tence, 1 instrument</td></tr>
            <tr><td>Clerc</td><td>Armure lÃ©gÃ¨re, intermÃ©diaire, boucliers</td></tr>
            <tr><td>Druide</td><td>Armure lÃ©gÃ¨re, intermÃ©diaire, boucliers (pas mÃ©tal)</td></tr>
            <tr><td>Ensorceleur</td><td>â€”</td></tr>
            <tr><td>Guerrier</td><td>Armures lÃ©gÃ¨re, intermÃ©diaire, boucliers, armes courantes &amp; de guerre</td></tr>
            <tr><td>Magicien</td><td>â€”</td></tr>
            <tr><td>Moine</td><td>Armes courantes, Ã©pÃ©e courte</td></tr>
            <tr><td>Occultiste</td><td>Armure lÃ©gÃ¨re, armes courantes</td></tr>
            <tr><td>Paladin</td><td>Armures lÃ©gÃ¨re, intermÃ©diaire, boucliers, armes courantes &amp; de guerre</td></tr>
            <tr><td>RÃ´deur</td><td>Armures lÃ©gÃ¨re, intermÃ©diaire, boucliers, armes courantes &amp; de guerre, 1 compÃ©tence</td></tr>
            <tr><td>Roublard</td><td>Armure lÃ©gÃ¨re, 1 compÃ©tence de la liste, outils de voleur</td></tr>
          </table>
        </div>
      </div>
      <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin:10px 0 4px">Emplacements de sorts multiclasse (niveau total de lanceur)</div>
      <div style="max-height:220px;overflow-y:auto">
      <table class="regles-table" style="font-size:11px">
        <tr><th>Niv.</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th></tr>
        <tr><td>1</td><td>2</td><td>â€”</td><td>â€”</td><td>â€”</td><td>â€”</td><td>â€”</td><td>â€”</td><td>â€”</td><td>â€”</td></tr>
        <tr><td>2</td><td>3</td><td>â€”</td><td>â€”</td><td>â€”</td><td>â€”</td><td>â€”</td><td>â€”</td><td>â€”</td><td>â€”</td></tr>
        <tr><td>3</td><td>4</td><td>2</td><td>â€”</td><td>â€”</td><td>â€”</td><td>â€”</td><td>â€”</td><td>â€”</td><td>â€”</td></tr>
        <tr><td>4</td><td>4</td><td>3</td><td>â€”</td><td>â€”</td><td>â€”</td><td>â€”</td><td>â€”</td><td>â€”</td><td>â€”</td></tr>
        <tr><td>5</td><td>4</td><td>3</td><td>2</td><td>â€”</td><td>â€”</td><td>â€”</td><td>â€”</td><td>â€”</td><td>â€”</td></tr>
        <tr><td>6</td><td>4</td><td>3</td><td>3</td><td>â€”</td><td>â€”</td><td>â€”</td><td>â€”</td><td>â€”</td><td>â€”</td></tr>
        <tr><td>7</td><td>4</td><td>3</td><td>3</td><td>1</td><td>â€”</td><td>â€”</td><td>â€”</td><td>â€”</td><td>â€”</td></tr>
        <tr><td>8</td><td>4</td><td>3</td><td>3</td><td>2</td><td>â€”</td><td>â€”</td><td>â€”</td><td>â€”</td><td>â€”</td></tr>
        <tr><td>9</td><td>4</td><td>3</td><td>3</td><td>3</td><td>1</td><td>â€”</td><td>â€”</td><td>â€”</td><td>â€”</td></tr>
        <tr><td>10</td><td>4</td><td>3</td><td>3</td><td>3</td><td>2</td><td>â€”</td><td>â€”</td><td>â€”</td><td>â€”</td></tr>
        <tr><td>11</td><td>4</td><td>3</td><td>3</td><td>3</td><td>2</td><td>1</td><td>â€”</td><td>â€”</td><td>â€”</td></tr>
        <tr><td>12</td><td>4</td><td>3</td><td>3</td><td>3</td><td>2</td><td>1</td><td>â€”</td><td>â€”</td><td>â€”</td></tr>
        <tr><td>13</td><td>4</td><td>3</td><td>3</td><td>3</td><td>2</td><td>1</td><td>1</td><td>â€”</td><td>â€”</td></tr>
        <tr><td>14</td><td>4</td><td>3</td><td>3</td><td>3</td><td>2</td><td>1</td><td>1</td><td>â€”</td><td>â€”</td></tr>
        <tr><td>15</td><td>4</td><td>3</td><td>3</td><td>3</td><td>2</td><td>1</td><td>1</td><td>1</td><td>â€”</td></tr>
        <tr><td>16</td><td>4</td><td>3</td><td>3</td><td>3</td><td>2</td><td>1</td><td>1</td><td>1</td><td>â€”</td></tr>
        <tr><td>17</td><td>4</td><td>3</td><td>3</td><td>3</td><td>2</td><td>1</td><td>1</td><td>1</td><td>1</td></tr>
        <tr><td>18</td><td>4</td><td>3</td><td>3</td><td>3</td><td>3</td><td>1</td><td>1</td><td>1</td><td>1</td></tr>
        <tr><td>19</td><td>4</td><td>3</td><td>3</td><td>3</td><td>3</td><td>2</td><td>1</td><td>1</td><td>1</td></tr>
        <tr><td>20</td><td>4</td><td>3</td><td>3</td><td>3</td><td>3</td><td>2</td><td>2</td><td>1</td><td>1</td></tr>
      </table>
      </div>
      <div style="font-size:11px;color:var(--text3);margin-top:6px;line-height:1.7">Niv. lanceur = Barde+Clerc+Druide+Ensorc.+Mage (Ã—1) + Paladin+RÃ´deur (Ã—Â½ arrondi inf.) + Guerrier/Roublard Ã©ligibles (Ã—â…“ arrondi inf.) &nbsp;Â·&nbsp; Occultiste : Magie de pacte utilisable pour sorts des autres classes et vice versa &nbsp;Â·&nbsp; Attaque supplÃ©mentaire : ne se cumule pas entre classes &nbsp;Â·&nbsp; DÃ©fense sans armure : une seule source</div>`)}
    </div>`)}
    ${ds('s-epuisement',`<div class="regles-section">
      ${dh('s-epuisement','ðŸ˜µ Ã‰puisement Â· ðŸ– Faim & Soif')}
      ${rb('s-epuisement',`<div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Niveaux d'Ã©puisement</div>
        <table class="regles-table">
          <tr><th>Niv.</th><th>Effet</th></tr>
          <tr><td>1</td><td>DÃ©savantage aux jets de caractÃ©ristique</td></tr>
          <tr><td>2</td><td>Vitesse divisÃ©e par deux</td></tr>
          <tr><td>3</td><td>DÃ©savantage aux jets d'attaque et de sauvegarde</td></tr>
          <tr><td>4</td><td>Max PV divisÃ© par deux</td></tr>
          <tr><td>5</td><td>Vitesse rÃ©duite Ã  0</td></tr>
          <tr><td style="color:#e53935;font-weight:600">6</td><td style="color:#e53935">Mort</td></tr>
        </table>
        <div style="font-size:11px;color:var(--text3);margin-top:5px;margin-bottom:10px">Repos long : âˆ’1 niveau d'Ã©puisement.</div>
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Faim</div>
        <div style="font-size:12px;color:var(--text2);line-height:1.7;margin-bottom:8px">
          Besoin : <strong>500 g/jour</strong>. Moins de la moitiÃ© â†’ JS CON DD 10 ou +1 Ã©puisement.<br>
          Sans nourriture : aprÃ¨s <strong>3 + mod CON jours</strong> (min 1), +1 Ã©puisement automatique/jour.
        </div>
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Soif</div>
        <div style="font-size:12px;color:var(--text2);line-height:1.7">
          Besoin : <strong>3,5 l/jour</strong> (7 l en chaleur extrÃªme).<br>
          Sans eau 1 jour â†’ JS CON DD 15 ou +1 Ã©puisement (+2 si ratÃ© de 5+).<br>
          Armure intermÃ©diaire/lourde â†’ dÃ©savantage au jet.
        </div>`)}
    </div>`)}
    ${ds('s-voyage',`${gh('s-voyage','Voyage, Mouvement &amp; LumiÃ¨re')}
    ${rb('s-voyage',`<div class="g2" style="gap:10px">
      <div class="regles-section">
        <div class="pt">ðŸš¶ Allures de voyage</div>
        <table class="regles-table">
          <tr><th>Allure</th><th>Minute</th><th>Heure</th><th>Jour</th><th>Effet</th></tr>
          <tr><td>Rapide</td><td>120 m</td><td>6 km</td><td>45 km</td><td style="color:#e53935">âˆ’5 Percep.</td></tr>
          <tr><td>Normale</td><td>90 m</td><td>4,5 km</td><td>36 km</td><td>â€”</td></tr>
          <tr><td>Lente</td><td>60 m</td><td>3 km</td><td>27 km</td><td style="color:var(--cp)">DiscrÃ©tion</td></tr>
        </table>
        <div style="font-size:11px;color:var(--text3);margin-top:6px;line-height:1.7">
          <strong>Marche forcÃ©e</strong> : aprÃ¨s 8h/jour, chaque heure supplÃ©mentaire â†’ JS CON DD (10 + 1/h sup.). Ã‰chec = 1 niveau d'Ã©puisement.<br>
          <strong>Terrain difficile</strong> : vitesse Ã· 2 (forÃªt dense, marais, montagne, glace, ruinesâ€¦)<br>
          <strong>Monture</strong> : peut galoper 1h Ã  vitesse Ã—2 (allure rapide). VÃ©hicule terrestre = allure normale.
        </div>
      </div>
      <div class="regles-section">
        <div class="pt">ðŸ•¯ Sources de lumiÃ¨re</div>
        <table class="regles-table">
          <tr><th>Source</th><th>Vive</th><th>Faible</th><th>DurÃ©e</th></tr>
          <tr><td>Bougie</td><td>1,5 m</td><td>+1,5 m</td><td>1 h</td></tr>
          <tr><td>Lampe</td><td>4,5 m</td><td>+9 m</td><td>6 h</td></tr>
          <tr><td>Lanterne Ã  capote</td><td>9 m</td><td>+9 m</td><td>6 h</td></tr>
          <tr><td>Lanterne sourde</td><td>18 m</td><td>+18 m</td><td>6 h</td></tr>
          <tr><td>Torche</td><td>6 m</td><td>+6 m</td><td>1 h</td></tr>
        </table>
      </div>
      <div class="regles-section">
        <div class="pt">ðŸ§— Mouvements spÃ©ciaux</div>
        <table class="regles-table">
          <tr><th>Action</th><th>CoÃ»t</th><th>Jet Ã©ventuel</th></tr>
          <tr><td>Escalader</td><td>2 m par mÃ¨tre (terrain difficile : 3 m)</td><td>FOR (AthlÃ©tisme) si surface glissante</td></tr>
          <tr><td>Nager</td><td>2 m par mÃ¨tre (eaux agitÃ©es : jet requis)</td><td>FOR (AthlÃ©tisme) si courant fort</td></tr>
          <tr><td>Ramper</td><td>2 m par mÃ¨tre</td><td>â€”</td></tr>
          <tr><td>Saut en longueur (Ã©lan)</td><td>FOR Ã· 3 mÃ¨tres</td><td>FOR (AthlÃ©tisme) DD 10 pour obstacle â‰¤ 1/4 distance</td></tr>
          <tr><td>Saut en longueur (sur place)</td><td>FOR Ã· 6 mÃ¨tres</td><td>â€”</td></tr>
          <tr><td>Saut en hauteur (Ã©lan)</td><td>mod FOR Ã· 3 + 1 m (min 0)</td><td>â€”</td></tr>
          <tr><td>Saut en hauteur (sur place)</td><td>MoitiÃ© ci-dessus</td><td>â€”</td></tr>
        </table>
        <div style="font-size:11px;color:var(--text3);margin-top:6px">Atterrissage en terrain difficile â†’ DEX (Acrobaties) DD 10 ou chute Ã  terre.</div>
      </div>
      <div class="regles-section">
        <div class="pt">ðŸ‘ Types de vision</div>
        <table class="regles-table">
          <tr><th>Vision</th><th>Effet</th></tr>
          <tr><td><strong>LumiÃ¨re vive</strong></td><td>VisibilitÃ© normale</td></tr>
          <tr><td><strong>PÃ©nombre</strong> (lumiÃ¨re faible)</td><td>Zone Ã  visibilitÃ© rÃ©duite â€” dÃ©savantage aux jets de Perception (vue)</td></tr>
          <tr><td><strong>TÃ©nÃ¨bres</strong></td><td>VisibilitÃ© nulle â€” Ã©tat AveuglÃ© pour voir dans cette zone</td></tr>
          <tr><td><strong>Vision aveugle</strong></td><td>PerÃ§oit l'environnement sans la vue dans un rayon donnÃ© (vases, dragons, chauves-sourisâ€¦)</td></tr>
          <tr><td><strong>Vision dans le noir</strong></td><td>PÃ©nombre = lumiÃ¨re vive Â· TÃ©nÃ¨bres = pÃ©nombre (niveaux de gris uniquement)</td></tr>
          <tr><td><strong>Vision vÃ©ritable</strong></td><td>Voit dans toutes tÃ©nÃ¨bres, dÃ©tecte l'invisible, les illusions, les mÃ©tamorphes, et le plan Ã©thÃ©rÃ©</td></tr>
        </table>
      </div>
    </div>`)}`)}
    ${ds('s-dangers',`${gh('s-dangers','Dangers &amp; Survie')}
    ${rb('s-dangers',`<div class="g2" style="gap:10px">
      <div class="regles-section">
        <div class="pt">â¬‡ Chuter</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          <strong>1d6 dÃ©gÃ¢ts contondants par 3 m de chute</strong> (max 20d6).<br>
          La crÃ©ature atterrit Ã  terre, sauf si elle Ã©vite les dÃ©gÃ¢ts.
        </div>
      </div>
      <div class="regles-section">
        <div class="pt">ðŸ« Suffoquer</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          <strong>Retenir sa respiration</strong> : 1 + mod CON minutes (min 30 s).<br>
          <strong>En train de suffoquer</strong> : survit mod CON rounds (min 1).<br>
          Au dÃ©but du round suivant â†’ 0 PV, Ã©tat mourant. Impossible de rÃ©cupÃ©rer des PV ni d'Ãªtre stabilisÃ© avant de respirer.
        </div>
      </div>
      <div class="regles-section">
        <div class="pt">ðŸ– Nourriture & eau</div>
        <table class="regles-table">
          <tr><th></th><th>Besoin/jour</th><th>Survie sans</th><th>ConsÃ©quence</th></tr>
          <tr><td><strong>Nourriture</strong></td><td>500 g</td><td>3 + mod CON jours (min 1)</td><td>+1 niv. Ã©puisement/jour au-delÃ  Â· Demi-ration = demi-jour</td></tr>
          <tr><td><strong>Eau</strong></td><td>4 L (8 L si chaud)</td><td>MoitiÃ© â†’ JS CON DD 15 ou +1 Ã©puis.</td><td>Moins de moitiÃ© â†’ +1 Ã©puis. auto (Ã—2 si dÃ©jÃ  Ã©puisÃ©)</td></tr>
        </table>
      </div>
    </div>`)}`)}
    ${ds('s-vie',`${gh('s-vie','Train de vie &amp; Monnaies')}
    ${rb('s-vie',`<div class="g2" style="gap:10px">
      <div class="regles-section">
        <div class="pt">ðŸ¨ Train de vie</div>
        <table class="regles-table">
          <tr><th>Train de vie</th><th>CoÃ»t/jour</th><th>Auberge</th></tr>
          <tr><td>Sordide</td><td>1 pa</td><td>7 pc</td></tr>
          <tr><td>Pauvre</td><td>2 pa</td><td>1 pa</td></tr>
          <tr><td>Modeste</td><td>1 po</td><td>5 pa</td></tr>
          <tr><td>Confortable</td><td>2 po</td><td>8 pa</td></tr>
          <tr><td>Riche</td><td>4 po</td><td>2 po</td></tr>
          <tr><td>Aristocratique</td><td>10 po min.</td><td>4 po</td></tr>
        </table>
      </div>
      <div class="regles-section">
        <div class="pt">ðŸ’° Monnaies & Conversions</div>
        <table class="regles-table">
          <tr><th>UnitÃ©</th><th>Ã‰quivalent</th></tr>
          <tr><td>1 pc</td><td>â€”</td></tr>
          <tr><td>1 pa</td><td>= 10 pc</td></tr>
          <tr><td>1 pe</td><td>= 50 pc</td></tr>
          <tr><td>1 po</td><td>= 100 pc</td></tr>
          <tr><td>1 pp</td><td>= 1000 pc</td></tr>
        </table>
        <div style="font-size:11px;color:var(--text3);margin-top:6px">5 ft = 1,5 m &nbsp;Â·&nbsp; 1 mile = 1,5 km &nbsp;Â·&nbsp; 1 lb = 500 g</div>
      </div>
    </div>`)}`)}
    ${ds('s-temps-mort',`${gh('s-temps-mort','ðŸŒ™ Temps morts (XGtE)')}
    ${rb('s-temps-mort',`
      <div class="regles-section" style="margin-bottom:10px">
        <div class="pt">ðŸ‘¤ Antagonistes</div>
        <div style="font-size:12px;color:var(--text2);line-height:1.6">
          PNJ actifs qui s'opposent au groupe (2â€“3 simultanÃ©ment recommandÃ©s). Chaque temps mort rÃ©solu, faire <strong>avancer 1 plan d'antagoniste</strong> : attaque, intrigue, Ã©vÃ©nement de fond. Chaque antagoniste a des <strong>Objectifs</strong>, des <strong>Ressources</strong> et un plan en 3â€“4 Ã©tapes.
        </div>
      </div>
      <div class="regles-section">
        <div class="pt">ðŸ“‹ ActivitÃ©s (XGtE) â€” 1 semaine = 5 jours, 8h/jour minimum</div>
        <div style="max-height:380px;overflow-y:auto">
        <table class="regles-table" style="font-size:10px">
          <tr><th style="min-width:130px">ActivitÃ©</th><th>Ressources</th><th>Jet / RÃ©sultat</th></tr>
          <tr><td><strong>ðŸ›’ Acheter objet mag.</strong></td><td>1 sem + 100 po min</td><td>CHA Persuasion (+1/sem sup., +1/100 po, max +10) â†’ qualitÃ© du vendeur</td></tr>
          <tr><td><strong>ðŸº Faire la fÃªte</strong></td><td>1 sem + 10/50/250 po (peuple/bourgeois/aristocratie)</td><td>CHA Persuasion : â‰¤5 ennemi Â· 6-10 rien Â· 11-15 alliÃ© Â· 16-20 Ã—2 Â· 21+ Ã—3</td></tr>
          <tr><td><strong>âš’ Fabriquer objet</strong></td><td>MatÃ©riaux = Â½ prix, outils requis</td><td>50 po de valeur / semaine. Collaboration possible.</td></tr>
          <tr><td><strong>âœ¨ Objet magique</strong></td><td>Formule + quÃªte + 50 poâ€“100k po</td><td>1â€“50 sem. selon raretÃ©. Consommables Ã·2.</td></tr>
          <tr><td><strong>ðŸ§ª Potion de soins</strong></td><td>Kit herboriste requis</td><td>Soins 25 po/1j Â· Maj. 100 po/1sem Â· Sup. 1 000 po/3sem Â· Supr. 10 000 po/4sem</td></tr>
          <tr><td><strong>ðŸ—¡ Crime</strong></td><td>1 sem + 25 po</td><td>3 jets (DiscrÃ©tion / Outils voleur / libre) vs DD 10/15/20/25 â†’ 0â€“1 000 po</td></tr>
          <tr><td><strong>ðŸŽ² Parier</strong></td><td>1 sem + 10â€“1 000 po</td><td>3 jets (Intuition/Tromperie/Intimidation) vs DD 5+2d10 â†’ Ã—0 Â· Ã—0,5 Â· Ã—1,5 Â· Ã—2</td></tr>
          <tr><td><strong>ðŸ¥Š Combattre</strong></td><td>1 sem</td><td>3 jets (AthlÃ©tisme/Acrobaties/CON+dÃ© vie) vs DD 5+2d10 â†’ 0/50/100/200 po</td></tr>
          <tr><td><strong>ðŸ˜´ Relaxation</strong></td><td>1 sem, train de vie modeste min.</td><td>Avantage JS maladie/poison. Fin sem. : supprimer 1 effet ou restaurer 1 caract.</td></tr>
          <tr><td><strong>â›ª Service religieux</strong></td><td>1 sem, gratuit</td><td>INT (Religion) ou CHA (Persuasion) : 1-10 rien Â· 11-20 une faveur Â· 21+ deux faveurs</td></tr>
          <tr><td><strong>ðŸ“– Recherches</strong></td><td>1 sem + 50 po min (+1/50 po, max +6)</td><td>INT : 1-5 rien Â· 6-10 une info Â· 11-20 deux Â· 21+ trois informations</td></tr>
          <tr><td><strong>ðŸ“œ Parchemin de sort</strong></td><td>MaÃ®trise Arcanes, sort prÃ©parÃ©</td><td>Mineur 15po/1j Â· Niv1 25po/1j Â· Niv2 250po/3j Â· Niv3 500po/1sem Â· Niv4 2,5k/2sem Â· Niv5 5k/4sem</td></tr>
          <tr><td><strong>ðŸ’° Vendre objet mag.</strong></td><td>1 sem + 25 po</td><td>CHA Persuasion : â‰¤10 â†’ 50% Â· 11-20 â†’ 100% Â· 21+ â†’ 150% du prix de base</td></tr>
          <tr><td><strong>ðŸ“š Se former</strong></td><td>10 sem (âˆ’ mod INT), 25 po/sem</td><td>Langue ou maÃ®trise d'outil. Instructeur requis.</td></tr>
          <tr><td><strong>ðŸ”¨ Travailler</strong></td><td>1 sem</td><td>Jet compÃ©tence : â‰¤9 pauvre Â· 10-14 modeste Â· 15-20 confortable Â· 21+ confort + 25 po</td></tr>
          <tr><td><strong>ðŸ° Construire</strong></td><td>Terrain + charte royale requis</td><td>Fort 15k/100j Â· Donjon 50k/400j Â· Palace 500k/1 200j Â· SiÃ¨ge guilde 5k/60j Â· Temple 50k/400j</td></tr>
        </table>
        </div>
        <div style="font-size:10px;color:var(--text3);margin-top:6px">Complications : 10% de chances par semaine d'activitÃ©. Absent lors d'une construction = +3 jours par jour d'absence.</div>
      </div>
    `)}`)}
    ${ds('s-packs',`<div class="regles-section">
      ${dh('s-packs','ðŸŽ’ Sacs d\'Ã©quipement')}
      ${rb('s-packs',`<table class="regles-table">
        <tr><th>Sac</th><th>Prix</th><th>Contenu</th></tr>
        <tr><td><strong>Artiste</strong></td><td>40 po</td><td>Sac Ã  dos, sac de couchage, 2 costumes, 5 bougies, 5j rations, gourde, kit de dÃ©guisement</td></tr>
        <tr><td><strong>Cambrioleur</strong></td><td>16 po</td><td>Sac Ã  dos, 1000 billes, 3m chaÃ®ne, cloche, 5 bougies, pied-de-biche, marteau, 10 pitons, lanterne Ã  capuchon, 2 huiles, 5j rations, allume-feu, gourde, 15m corde chanvre</td></tr>
        <tr><td><strong>Diplomate</strong></td><td>39 po</td><td>Coffre, 2 Ã©tuis Ã  cartes, vÃªtements fins, encre, plume, lampe, 2 huiles, 5 papiers, parfum, cire Ã  cacheter, savon</td></tr>
        <tr><td><strong>EcclÃ©siastique</strong></td><td>19 po</td><td>Sac Ã  dos, couverture, 10 bougies, allume-feu, boÃ®te aumÃ´ne, 2 bÃ¢tonnets d'encens, encensoir, habits de cÃ©rÃ©monie, 2j rations, gourde</td></tr>
        <tr><td><strong>Ã‰rudit</strong></td><td>40 po</td><td>Sac Ã  dos, livre, encre, plume, 10 parchemins, sac de sable, petit couteau</td></tr>
        <tr><td><strong>Explorateur</strong></td><td>10 po</td><td>Sac Ã  dos, sac de couchage, gamelle, allume-feu, 10 torches, 10j rations, gourde, 15m corde chanvre</td></tr>
        <tr><td><strong>Exploration souterraine</strong></td><td>12 po</td><td>Sac Ã  dos, pied-de-biche, marteau, 10 pitons, 10 torches, allume-feu, 10j rations, gourde, 15m corde chanvre</td></tr>
      </table>`)}
    </div>`)}
    ${ds('s-services',`<div class="regles-section">
      ${dh('s-services','âš™ Services & Embauche')}
      ${rb('s-services',`<table class="regles-table">
        <tr><th>Service</th><th>Prix</th></tr>
        <tr><td>Embauche non qualifiÃ©e</td><td>2 pa / jour</td></tr>
        <tr><td>Embauche qualifiÃ©e</td><td>2 po / jour</td></tr>
        <tr><td>Messager</td><td>2 pc / 1,5 km</td></tr>
        <tr><td>PÃ©age routier ou de porte</td><td>1 pc</td></tr>
        <tr><td>Transport en ville</td><td>1 pc</td></tr>
        <tr><td>Transport entre deux villes</td><td>3 pc / 1,5 km</td></tr>
        <tr><td>Voyage en bateau</td><td>1 pa / 1,5 km</td></tr>
      </table>
      <div style="font-size:11px;color:var(--text3);margin-top:6px;line-height:1.7"><strong>Sorts niv.1â€“2</strong> : 10â€“50 po + composantes coÃ»teuses &nbsp;Â·&nbsp; Sorts niv. supÃ©rieur : temple ou universitÃ©, tarif ou service rendu en Ã©change</div>`)}
    </div>`)}
    ${ds('s-depart',`${gh('s-depart','ðŸª™ Or de dÃ©part &amp; Revente')}
    ${rb('s-depart',`<div class="g2" style="gap:10px">
      <div class="regles-section">
        <div class="pt">ðŸª™ Or de dÃ©part (alternative Ã  l'Ã©quipement)</div>
        <table class="regles-table">
          <tr><th>Classe</th><th>Formule</th><th>Moy.</th></tr>
          <tr><td>Barbare</td><td>2d4 Ã— 10 po</td><td>50 po</td></tr>
          <tr><td>Barde</td><td>5d4 Ã— 10 po</td><td>125 po</td></tr>
          <tr><td>Clerc</td><td>5d4 Ã— 10 po</td><td>125 po</td></tr>
          <tr><td>Druide</td><td>2d4 Ã— 10 po</td><td>50 po</td></tr>
          <tr><td>Ensorceleur</td><td>3d4 Ã— 10 po</td><td>75 po</td></tr>
          <tr><td>Guerrier</td><td>5d4 Ã— 10 po</td><td>125 po</td></tr>
          <tr><td>Magicien</td><td>4d4 Ã— 10 po</td><td>100 po</td></tr>
          <tr><td>Moine</td><td>5d4 po</td><td>12 po</td></tr>
          <tr><td>Occultiste</td><td>4d4 Ã— 10 po</td><td>100 po</td></tr>
          <tr><td>Paladin</td><td>5d4 Ã— 10 po</td><td>125 po</td></tr>
          <tr><td>RÃ´deur</td><td>5d4 Ã— 10 po</td><td>125 po</td></tr>
          <tr><td>Roublard</td><td>4d4 Ã— 10 po</td><td>100 po</td></tr>
          <tr><td>Artificier</td><td>5d4 Ã— 10 po</td><td>125 po</td></tr>
        </table>
      </div>
      <div class="regles-section">
        <div class="pt">ðŸ’± Vente d'Ã©quipement</div>
        <div style="font-size:12px;color:var(--text2);line-height:1.8">
          Un objet se revend Ã  <strong>la moitiÃ© de son prix de liste</strong>.<br>
          Les objets magiques et les pierres prÃ©cieuses trouvent des acheteurs plus difficilement â€” Ã  la discrÃ©tion du MJ.
        </div>
      </div>
    </div>`)}`)}
    ${ds('s-repos',`<div class="regles-section">
      ${dh('s-repos','ðŸ’¤ Repos')}
      ${rb('s-repos',`<table class="regles-table">
        <tr><th></th><th>Repos court (â‰¥ 1h)</th><th>Repos long (â‰¥ 8h)</th></tr>
        <tr><td><strong>PV rÃ©cupÃ©rÃ©s</strong></td><td>DÃ©s de vie dÃ©pensÃ©s + mod CON</td><td>Tous les PV max</td></tr>
        <tr><td><strong>DÃ©s de vie</strong></td><td>Utilisables librement</td><td>RÃ©cupÃ¨re niv/2 (min 1)</td></tr>
        <tr><td><strong>CapacitÃ©s</strong></td><td>Ki, Magie de pacte, DeuxiÃ¨me Souffle...</td><td>Magie, Rage, quasi-tout</td></tr>
      </table>`)}
    </div>`)}
    ${ds('s-mort',`<div class="regles-section">
      ${dh('s-mort','ðŸ’€ Jet de sauvegarde contre la mort')}
      ${rb('s-mort',`<div style="font-size:13px;color:var(--text2);line-height:1.8">
        Ã€ 0 PV : jets de sauvegarde Ã  chaque tour (1d20, sans modificateur).<br>
        â€¢ <strong style="color:#4caf50">10+</strong> â†’ SuccÃ¨s (3 succÃ¨s = stable, inconscient mais vivant).<br>
        â€¢ <strong style="color:#e53935">1-9</strong> â†’ Ã‰chec (3 Ã©checs = mort).<br>
        â€¢ <strong style="color:#ffd54f">1 naturel</strong> â†’ 2 Ã©checs d'un coup.<br>
        â€¢ <strong style="color:#ffd54f">20 naturel</strong> â†’ Retour Ã  1 PV, debout.<br>
        â€¢ Subir des dÃ©gÃ¢ts Ã  0 PV â†’ 1 Ã©chec (ou 2 si corps Ã  corps).
      </div>`)}
    </div>`)}
    ${ds('s-incantation',`${gh('s-incantation','âœ¨ RÃ¨gles d\'incantation')}
    ${rb('s-incantation',`<div class="g2" style="gap:10px">
      <div class="regles-section">
        <div class="pt">ðŸ“Š Formules clÃ©s</div>
        <table class="regles-table">
          <tr><th>Formule</th><th>Calcul</th></tr>
          <tr><td><strong>DD de sort</strong></td><td>8 + bonus de maÃ®trise + mod. caractÃ©ristique d'incantation</td></tr>
          <tr><td><strong>Bonus d'attaque de sort</strong></td><td>Bonus de maÃ®trise + mod. caractÃ©ristique d'incantation</td></tr>
        </table>
        <div style="font-size:11px;color:var(--text3);margin-top:6px">CaractÃ©ristique d'incantation : INT (Magicien), SAG (Clerc/Druide/RÃ´deur), CHA (Barde/Paladin/Ensorceleur/Occultiste)</div>
      </div>
      <div class="regles-section">
        <div class="pt">ðŸ”„ Concentration</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          Un seul sort Ã  concentration Ã  la fois. Lancer un autre sort Ã  concentration y met fin.<br>
          <strong>Prendre des dÃ©gÃ¢ts</strong> â†’ JS CON (DD = max(10, Â½ dÃ©gÃ¢ts reÃ§us)) par source.<br>
          <strong>Incapable d'agir ou mort</strong> â†’ concentration brisÃ©e automatiquement.<br>
          MJ peut aussi demander JS CON DD10 pour phÃ©nomÃ¨nes violents (vague, tempÃªteâ€¦).
        </div>
      </div>
      <div class="regles-section">
        <div class="pt">ðŸ“œ Rituels</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          Les sorts avec la mention <strong>rituel</strong> peuvent Ãªtre lancÃ©s sans dÃ©penser d'emplacement.<br>
          La version rituel prend <strong>+10 minutes</strong> de plus que le temps normal.<br>
          Ne peut pas Ãªtre lancÃ© Ã  un niveau supÃ©rieur.<br>
          NÃ©cessite d'avoir le sort prÃ©parÃ© (sauf rÃ¨gle spÃ©cifique de classe comme le Magicien).
        </div>
      </div>
      <div class="regles-section">
        <div class="pt">ðŸ›¡ Port d'armure &amp; sorts</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          Pour lancer un sort, tu dois <strong>maÃ®triser l'armure portÃ©e</strong>, sinon l'incantation Ã©choue.<br>
          Concerne les sorts avec composante verbale ou somatique (la quasi-totalitÃ©).
        </div>
      </div>
      <div class="regles-section">
        <div class="pt">ðŸ“ Zones d'effet</div>
        <table class="regles-table">
          <tr><th>Forme</th><th>RÃ¨gle</th></tr>
          <tr><td><strong>CÃ´ne</strong></td><td>S'Ã©largit depuis toi. Largeur = distance depuis l'origine. Toi non inclus.</td></tr>
          <tr><td><strong>Cube</strong></td><td>Point d'origine = une face du cube. Toi non inclus par dÃ©faut.</td></tr>
          <tr><td><strong>Cylindre</strong></td><td>Centre du cercle de base = point d'origine. S'Ã©tend en hauteur. Toi inclus.</td></tr>
          <tr><td><strong>Ligne</strong></td><td>S'Ã©tend depuis l'origine. Largeur prÃ©cisÃ©e. Toi non inclus.</td></tr>
          <tr><td><strong>SphÃ¨re</strong></td><td>Point d'origine = centre. Rayon vers l'extÃ©rieur. Toi inclus.</td></tr>
        </table>
        <div style="font-size:11px;color:var(--text3);margin-top:4px">ObstruÃ© par un abri total. Ligne droite du point d'origine vers chaque case â€” si bloquÃ©e, case exclue de la zone.</div>
      </div>
      <div class="regles-section">
        <div class="pt">âš¡ RÃ¨gles spÃ©ciales</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          <strong>Action bonus + sort</strong> : si tu lances un sort en action bonus, seul un sort mineur (temps d'incantation 1 action) peut Ãªtre lancÃ© ce tour-lÃ .<br><br>
          <strong>Lancer Ã  niveau supÃ©rieur</strong> : utiliser un emplacement de niveau plus Ã©levÃ© â†’ sort adopte ce niveau (effets souvent amÃ©liorÃ©s).<br><br>
          <strong>Combiner les effets</strong> : effets de sorts diffÃ©rents se cumulent. Effets du mÃªme sort lancÃ© plusieurs fois ne se cumulent pas â†’ le plus puissant s'applique.
        </div>
      </div>
    </div>`)}`)}
    ${ds('s-magie-sauvage',`<div class="regles-section">
      ${dh('s-magie-sauvage','ðŸŽ² Magie Sauvage â€” Table de Sursaut (d100)')}
      ${rb('s-magie-sauvage',`<div style="font-size:11px;color:var(--text3);margin-bottom:8px">DÃ©clenchÃ© par <strong>MarÃ©e du chaos</strong> ou Ã  la discrÃ©tion du MJ aprÃ¨s qu'un ensorceleur lance un sort. Lancez 1d100.</div>
      <div style="max-height:320px;overflow-y:auto">
      <table class="regles-table" style="font-size:11px">
        <tr><th style="width:52px">d100</th><th>Effet</th></tr>
        <tr><td>01â€“02</td><td>Lancez sur ce tableau au dÃ©but de chacun de vos tours pendant 1 minute (ignorez ce rÃ©sultat lors des lancers suivants).</td></tr>
        <tr><td>03â€“04</td><td>Pendant 1 minute, vous voyez toute crÃ©ature invisible dans votre ligne de vue.</td></tr>
        <tr><td>05â€“06</td><td>Un modrone contrÃ´lÃ© par le MJ apparaÃ®t Ã  1,50 m de vous, puis disparaÃ®t aprÃ¨s 1 minute.</td></tr>
        <tr><td style="color:#e53935;font-weight:600">07â€“08</td><td><strong>Boule de feu</strong> niv. 3 centrÃ©e sur vous-mÃªme.</td></tr>
        <tr><td>09â€“10</td><td><strong>Projectile magique</strong> niv. 5.</td></tr>
        <tr><td>11â€“12</td><td>Lancez 1d10. Votre taille change de ce nombre de cm. Impair = vous rÃ©trÃ©cissez, pair = vous grandissez.</td></tr>
        <tr><td style="color:#e53935;font-weight:600">13â€“14</td><td><strong>Confusion</strong> centrÃ©e sur vous-mÃªme.</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">15â€“16</td><td>Pendant 1 minute, vous rÃ©cupÃ©rez 5 PV au dÃ©but de chacun de vos tours.</td></tr>
        <tr><td>17â€“18</td><td>Vous faites pousser une barbe de plumes. Elle disparaÃ®t quand vous Ã©ternuez (les plumes explosent).</td></tr>
        <tr><td style="color:#e53935;font-weight:600">19â€“20</td><td><strong>Graisse</strong> centrÃ©e sur vous-mÃªme.</td></tr>
        <tr><td style="color:#e53935;font-weight:600">21â€“22</td><td>Les crÃ©atures ont le dÃ©savantage aux JS contre votre prochain sort lancÃ© dans la prochaine minute.</td></tr>
        <tr><td>23â€“24</td><td>Votre peau devient bleue vif. Un <em>DÃ©senvoÃ»tement</em> met fin Ã  l'effet.</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">25â€“26</td><td>Un Å“il apparaÃ®t sur votre front pendant 1 minute : avantage aux tests de Perception (vue).</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">27â€“28</td><td>Pendant 1 minute, vos sorts Ã  temps d'incantation de 1 action deviennent des actions bonus.</td></tr>
        <tr><td>29â€“30</td><td>TÃ©lÃ©portation jusqu'Ã  18 m vers un espace inoccupÃ© visible.</td></tr>
        <tr><td>31â€“32</td><td>TransportÃ© dans le Plan Astral jusqu'Ã  la fin de votre prochain tour, puis retour Ã  votre emplacement prÃ©cÃ©dent.</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">33â€“34</td><td>Maximisez les dÃ©gÃ¢ts du prochain sort d'attaque dans la prochaine minute.</td></tr>
        <tr><td>35â€“36</td><td>Lancez 1d10. Votre Ã¢ge change de ce nombre d'annÃ©es. Impair = rajeunit (min. 1 an), pair = vieillit.</td></tr>
        <tr><td>37â€“38</td><td>1d6 flumphs contrÃ´lÃ©s par le MJ apparaissent dans un rayon de 18 m, effrayÃ©s par vous. Disparaissent aprÃ¨s 1 minute.</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">39â€“40</td><td>Vous rÃ©cupÃ©rez 2d10 PV.</td></tr>
        <tr><td style="color:#e53935;font-weight:600">41â€“42</td><td>Vous devenez une plante en pot jusqu'Ã  votre prochain tour : neutralisÃ©, vulnÃ©rabilitÃ© Ã  tous les dÃ©gÃ¢ts.</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">43â€“44</td><td>Pendant 1 minute, tÃ©lÃ©portation jusqu'Ã  6 m en action bonus Ã  chaque tour.</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">45â€“46</td><td><strong>LÃ©vitation</strong> sur vous-mÃªme.</td></tr>
        <tr><td>47â€“48</td><td>Une licorne contrÃ´lÃ©e par le MJ apparaÃ®t Ã  1,50 m, disparaÃ®t aprÃ¨s 1 minute.</td></tr>
        <tr><td>49â€“50</td><td>Vous ne pouvez pas parler pendant 1 minute (des bulles roses sortent de votre bouche Ã  la place).</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">51â€“52</td><td>Bouclier spectral pendant 1 minute : +2 CA et immunitÃ© aux Projectiles magiques.</td></tr>
        <tr><td>53â€“54</td><td>ImmunitÃ© Ã  l'ivresse alcoolique pendant 5d6 jours.</td></tr>
        <tr><td>55â€“56</td><td>Vos cheveux tombent, mais repoussent en 24 heures.</td></tr>
        <tr><td>57â€“58</td><td>Pendant 1 minute, tout objet inflammable non portÃ© que vous touchez s'enflamme.</td></tr>
        <tr><td style="color:#e53935;font-weight:600">59â€“60</td><td>TÃ©lÃ©portation jusqu'Ã  18 m ; toutes les crÃ©atures dans l'espace d'arrivÃ©e subissent 1d10 dÃ©gÃ¢ts de force.</td></tr>
        <tr><td style="color:#e53935;font-weight:600">61â€“62</td><td>Vous Ãªtes effrayÃ© par la crÃ©ature la plus proche jusqu'Ã  la fin de votre prochain tour.</td></tr>
        <tr><td>63â€“64</td><td>Toutes les crÃ©atures dans un rayon de 9 m deviennent invisibles pendant 1 minute (cesse si elles attaquent ou lancent un sort).</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">65â€“66</td><td>RÃ©sistance Ã  tous les dÃ©gÃ¢ts pendant 1 minute.</td></tr>
        <tr><td style="color:#e53935;font-weight:600">67â€“68</td><td>Une crÃ©ature alÃ©atoire dans un rayon de 18 m est empoisonnÃ©e pendant 1d4 heures.</td></tr>
        <tr><td>69â€“70</td><td>LumiÃ¨re vive dans un rayon de 9 m pendant 1 minute. CrÃ©ature terminant son tour Ã  1,50 m = aveuglÃ©e jusqu'Ã  son prochain tour.</td></tr>
        <tr><td style="color:#e53935;font-weight:600">71â€“72</td><td><strong>MÃ©tamorphose</strong> sur vous-mÃªme. En cas d'Ã©chec au JS, vous devenez un mouton pour la durÃ©e du sort.</td></tr>
        <tr><td>73â€“74</td><td>Papillons illusoires et pÃ©tales de fleurs dans un rayon de 3 m pendant 1 minute (aucun effet mÃ©canique).</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">75â€“76</td><td>Vous pouvez immÃ©diatement prendre une action supplÃ©mentaire.</td></tr>
        <tr><td>77â€“78</td><td>Chaque crÃ©ature dans un rayon de 9 m subit 1d10 dÃ©gÃ¢ts nÃ©crotiques. Vous rÃ©cupÃ©rez autant de PV.</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">79â€“80</td><td><strong>Image miroir</strong>.</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">81â€“82</td><td><strong>Vol</strong> sur une crÃ©ature alÃ©atoire dans un rayon de 18 m.</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">83â€“84</td><td>Vous devenez invisible jusqu'au dÃ©but de votre prochain tour (ou jusqu'Ã  ce que vous attaquiez ou lanciez un sort).</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">85â€“86</td><td>Si vous mourez dans la prochaine minute, vous revenez Ã  la vie comme par <em>RÃ©incarnation</em>.</td></tr>
        <tr><td>87â€“88</td><td>Votre catÃ©gorie de taille augmente d'un cran pendant 1 minute.</td></tr>
        <tr><td style="color:#e53935;font-weight:600">89â€“90</td><td>Vous et toutes les crÃ©atures dans un rayon de 9 m gagnez la vulnÃ©rabilitÃ© aux dÃ©gÃ¢ts perforants pendant 1 minute.</td></tr>
        <tr><td>91â€“92</td><td>Une musique Ã©thÃ©rÃ©e vous entoure pendant 1 minute (aucun effet mÃ©canique).</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">93â€“94</td><td>Vous rÃ©cupÃ©rez votre emplacement de sort dÃ©pensÃ© de plus bas niveau.</td></tr>
        <tr><td style="color:#e53935;font-weight:600">95â€“96</td><td>Pendant 1 minute, vous devez crier quand vous parlez.</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">97â€“98</td><td>Pendant 1 minute, Ã  chaque sort lancÃ©, le DD augmente de 2.</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">99â€“00</td><td><strong>ArrÃªt du temps</strong>.</td></tr>
      </table>
      </div>
      `)}
    </div>`)}
    ${ds('s-rencontres',`<div class="regles-section">
      ${dh('s-rencontres','âš” Construction de rencontre')}
      ${rb('s-rencontres',`
        <div style="font-size:11px;color:var(--text3);margin-bottom:8px"><strong>Ã‰tapes :</strong> 1) Seuils XP du groupe par difficultÃ© Â· 2) Additionner XP des monstres Â· 3) Appliquer le multiplicateur Â· 4) Comparer aux seuils.</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <div style="flex:1;min-width:200px">
            <div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:4px">Seuils XP par PJ et par niveau</div>
            <div style="max-height:210px;overflow-y:auto">
            <table class="regles-table" style="font-size:10px">
              <tr><th>Niv.</th><th style="color:#4caf50">Facile</th><th style="color:#ff9800">Moy.</th><th style="color:#f44336">Diff.</th><th style="color:#b71c1c">Mort.</th></tr>
              ${[...Array(20)].map((_,i)=>`<tr><td>${i+1}</td><td>${ENC_THRESHOLDS[i][0]}</td><td>${ENC_THRESHOLDS[i][1]}</td><td>${ENC_THRESHOLDS[i][2]}</td><td>${ENC_THRESHOLDS[i][3]}</td></tr>`).join('')}
            </table>
            </div>
          </div>
          <div style="flex:0 0 auto">
            <div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:4px">Multiplicateur</div>
            <table class="regles-table" style="font-size:11px">
              <tr><th>Monstres</th><th>Ã—</th></tr>
              <tr><td>1</td><td>Ã—1</td></tr>
              <tr><td>2</td><td>Ã—1,5</td></tr>
              <tr><td>3â€“6</td><td>Ã—2</td></tr>
              <tr><td>7â€“10</td><td>Ã—2,5</td></tr>
              <tr><td>11â€“14</td><td>Ã—3</td></tr>
              <tr><td>15+</td><td>Ã—4</td></tr>
            </table>
            <div style="font-size:10px;color:var(--text3);margin-top:6px;line-height:1.5"><strong>Budget journalier</strong> :<br>6â€“8 rencontres Moyennes<br>avant Ã©puisement.</div>
          </div>
        </div>
      `)}
    </div>`)}
    ${ds('s-alterations',`${gh('s-alterations','â˜£ Maladies, Poisons &amp; Folie')}
    ${rb('s-alterations',`
      <div class="g2" style="gap:10px">
        <div class="regles-section">
          <div class="pt">ðŸ¤’ Maladies</div>
          <div style="font-size:11px;color:var(--text2);line-height:1.6">
            <strong>FiÃ¨vre rieuse</strong> (humanoÃ¯des, gnomes immunisÃ©s) â€” Infection : contact Ã  3 m d'une victime en crise (JS CON DD 10). SymptÃ´mes 1d4h aprÃ¨s. Gagne 1 niveau d'Ã©puisement. Stress â†’ JS CON DD 13 : Ã©chec = 5 (1d10) dÃ©gÃ¢ts psychiques + incapable 1 min. Repos long : JS CON DD 13, succÃ¨s = DD âˆ’ 1d6. DD 0 = guÃ©rison. 3 Ã©checs â†’ folie illimitÃ©e.<br><br>
            <strong>Peste des Ã©gouts</strong> â€” Morsure de rat ou contact cadavre (JS CON DD 11). SymptÃ´mes 1d4 jours. Ã‰puisement, dÃ©s de vie donnent Â½ PV, 0 PV au repos long. Repos long : JS CON DD 11, Ã©chec = +1 Ã©puisement, succÃ¨s = âˆ’1. Niveau 0 = guÃ©rison.<br><br>
            <strong>Pourriture oculaire</strong> â€” Eau contaminÃ©e (JS CON DD 15). 1 jour aprÃ¨s : âˆ’1 aux attaques et jets de vue. Fin de chaque repos long : malus +1. Ã€ âˆ’5 : aveugle. GuÃ©rison : sort ou onguent d'Å“il vif (3 doses).
          </div>
        </div>
        <div>
          <div class="regles-section" style="margin-bottom:10px">
            <div class="pt">â˜  Poisons</div>
            <table class="regles-table" style="font-size:10px">
              <tr><th>Type</th><th>Activation</th></tr>
              <tr><td><strong>Blessure</strong></td><td>Armes, munitions, piÃ¨ges tranchants/perforants</td></tr>
              <tr><td><strong>Contact</strong></td><td>Peau touchant l'objet enduit</td></tr>
              <tr><td><strong>Ingestion</strong></td><td>Dose entiÃ¨re dans nourriture/boisson</td></tr>
              <tr><td><strong>Inhalation</strong></td><td>Cube 1,5 m (poudre ou gaz, muqueuses)</td></tr>
            </table>
            <div style="max-height:170px;overflow-y:auto;margin-top:6px">
            <table class="regles-table" style="font-size:10px">
              <tr><th>Poison</th><th>Type</th><th>Prix/dose</th></tr>
              <tr><td>Essence Ã©thÃ©rÃ©e</td><td>Inhalation</td><td>300 po</td></tr>
              <tr><td>FumÃ©es d'othur</td><td>Inhalation</td><td>500 po</td></tr>
              <tr><td>Huile de taggit</td><td>Contact</td><td>400 po</td></tr>
              <tr><td>Larmes de minuit</td><td>Ingestion</td><td>1 500 po</td></tr>
              <tr><td>Malice</td><td>Inhalation</td><td>250 po</td></tr>
              <tr><td>Mucus de charognard</td><td>Contact</td><td>200 po</td></tr>
              <tr><td>Poison de ver pourpre</td><td>Blessure</td><td>2 000 po</td></tr>
              <tr><td>Poison de wiverne</td><td>Blessure</td><td>1 200 po</td></tr>
              <tr><td>Poison drow</td><td>Blessure</td><td>200 po</td></tr>
              <tr><td>Sang d'assassin</td><td>Ingestion</td><td>150 po</td></tr>
              <tr><td>SÃ©rum de vÃ©ritÃ©</td><td>Ingestion</td><td>150 po</td></tr>
              <tr><td>Teinture pÃ¢le</td><td>Ingestion</td><td>250 po</td></tr>
              <tr><td>Torpeur</td><td>Ingestion</td><td>600 po</td></tr>
              <tr><td>Venin de serpent</td><td>Blessure</td><td>200 po</td></tr>
            </table>
            </div>
          </div>
          <div class="regles-section">
            <div class="pt">ðŸ§  Folie</div>
            <div style="font-size:11px;color:var(--text2);line-height:1.5;margin-bottom:6px">JS SAG ou CHA pour rÃ©sister. GuÃ©rison : <em>apaisement des Ã©motions</em> (supprime), <em>restauration partielle</em> (courte/longue), <em>restauration supÃ©rieure</em> (illimitÃ©e).</div>
            <table class="regles-table" style="font-size:10px">
              <tr><th>Type</th><th>DurÃ©e</th><th>Exemples d'effet</th></tr>
              <tr><td><strong>PassagÃ¨re</strong></td><td>1d10 min</td><td>ParalysÃ© Â· Incapable + cri Â· EffrayÃ© Â· BÃ©gaiement Â· Attaque la crÃ©ature la plus proche Â· Hallucinations (dÃ©sav. jets) Â· Inconscient</td></tr>
              <tr><td><strong>Persistante</strong></td><td>1d10Ã—10 h</td><td>Comportement compulsif Â· ParanoÃ¯a (dÃ©sav. SAG/CHA) Â· RÃ©vulsion Â· AmnÃ©sie partielle Â· Tremblement (dÃ©sav. FOR/DEX) Â· Aveugle ou sourd</td></tr>
              <tr><td><strong>IllimitÃ©e</strong></td><td>Jusqu'Ã  guÃ©rison</td><td>Alcoolisme Â· Avarice Â· Se croit le plus fort Â· Conviction d'Ãªtre traquÃ© Â· Ami imaginaire Â· Ne prend rien au sÃ©rieux</td></tr>
            </table>
          </div>
        </div>
      </div>
    `)}`)}
    ${ds('s-objets-mag',`${gh('s-objets-mag','âœ¨ Objets magiques')}
    ${rb('s-objets-mag',`
      <div class="g2" style="gap:10px">
        <div class="regles-section">
          <div class="pt">RaretÃ©, niveau &amp; prix</div>
          <table class="regles-table" style="font-size:11px">
            <tr><th>RaretÃ©</th><th>Niveau rec.</th><th>Prix indicatif</th></tr>
            ${Object.entries(RARITY_INFO).map(([name,ri])=>`<tr><td><span style="color:${ri.color}">â– </span> ${name}</td><td>${ri.level}</td><td>${ri.price}</td></tr>`).join('')}
          </table>
          <div style="font-size:10px;color:var(--text3);margin-top:6px;line-height:1.5">Prix de revente = Â½ du prix de liste. Objets consommables (potions, parchemins) = Â½ prix.</div>
        </div>
        <div class="regles-section">
          <div class="pt">ðŸ”— Attunement (Lien)</div>
          <div style="font-size:12px;color:var(--text2);line-height:1.7">
            â€¢ Maximum <strong>3 objets liÃ©s</strong> simultanÃ©ment.<br>
            â€¢ Ã‰tablir un lien : <strong>repos court</strong> passÃ© en contact avec l'objet.<br>
            â€¢ Rompre un lien : <strong>repos court</strong>, ou mort du personnage.<br>
            â€¢ Certains objets exigent une condition (classe, alignement, don).<br><br>
            <strong>CatÃ©gories d'objets :</strong> Armure Â· Potion Â· Anneau Â· Sceptre Â· Parchemin Â· BÃ¢ton Â· Baguette Â· Arme Â· Objet merveilleux.<br><br>
            <strong>Objets intelligents</strong> â€” PossÃ¨dent FOR, DEX, CON, INT, SAG, CHA ainsi qu'une personnalitÃ©. Peuvent entrer en conflit (jet de CHA contre SAG de l'objet).<br><br>
            <strong>Artefacts</strong> â€” Objets uniques Ã  propriÃ©tÃ©s majeures et mineures (bienfaits et flÃ©aux). Ne peuvent Ãªtre dÃ©truits que par des moyens spÃ©cifiques.
          </div>
        </div>
      </div>
    `)}`)}
    ${ds('s-pieges',`<div class="regles-section">
      ${dh('s-pieges','ðŸª¤ PiÃ¨ges')}
      ${rb('s-pieges',`
        <div style="font-size:11px;color:var(--text2);margin-bottom:8px;line-height:1.6">
          <strong>DÃ©tecter :</strong> SAG (Perception) passive ou active vs DD du piÃ¨ge. <strong>DÃ©samorcer :</strong> INT (Investigation) puis DEX (outils de voleur). PiÃ¨ges magiques : INT (Arcanes) ou <em>dissipation de la magie</em>.
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <div style="flex:1;min-width:180px">
            <div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:4px">DD et bonus d'attaque</div>
            <table class="regles-table" style="font-size:11px">
              <tr><th>Danger</th><th>DD JS</th><th>Bonus att.</th></tr>
              <tr><td>GÃªnant</td><td>10â€“11</td><td>+3 Ã  +5</td></tr>
              <tr><td>Dangereux</td><td>12â€“15</td><td>+6 Ã  +8</td></tr>
              <tr><td>Mortel</td><td>16â€“20</td><td>+9 Ã  +12</td></tr>
            </table>
          </div>
          <div style="flex:1;min-width:200px">
            <div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:4px">DÃ©gÃ¢ts par niveau</div>
            <table class="regles-table" style="font-size:11px">
              <tr><th>Niveaux PJ</th><th>GÃªnant</th><th>Dangereux</th><th>Mortel</th></tr>
              <tr><td>1â€“4</td><td>1d10</td><td>2d10</td><td>4d10</td></tr>
              <tr><td>5â€“10</td><td>2d10</td><td>4d10</td><td>10d10</td></tr>
              <tr><td>11â€“16</td><td>4d10</td><td>10d10</td><td>18d10</td></tr>
              <tr><td>17â€“20</td><td>10d10</td><td>18d10</td><td>24d10</td></tr>
            </table>
          </div>
        </div>
        <div style="font-size:11px;color:var(--text2);margin-top:8px;line-height:1.6">
          <strong>PiÃ¨ges complexes</strong> â€” Font un jet d'initiative et agissent Ã  chaque tour (comme un combat). DÃ©tection et dÃ©sarmement identiques aux piÃ¨ges simples.<br>
          <strong>Exemples :</strong> Aiguille empoisonnÃ©e Â· Chute de filet Â· Effondrement de plafond Â· FlÃ©chettes empoisonnÃ©es Â· Fosse (simple/camouflÃ©e/Ã  fermeture/hÃ©rissÃ©e) Â· Statue soufflant des flammes Â· SphÃ¨re roulante.
        </div>
      `)}
    </div>`)}
    ${ds('s-comparses',`${gh('s-comparses','ðŸ¤ Comparses (Sidekicks)')}
    ${rb('s-comparses',`
      <div style="font-size:11px;color:var(--text3);margin-bottom:8px">PNJ spÃ©ciaux qui rejoignent le groupe. Le MJ choisit le type ou laisse les joueurs dÃ©cider. 3 types disponibles :</div>
      <div class="g2" style="gap:10px">
        <div class="regles-section">
          <div class="pt">âš” Compagnon d'armes</div>
          <div style="font-size:10px;color:var(--text3);margin-bottom:4px">MaÃ®trise : toutes armures, armes courantes &amp; de guerre, boucliers</div>
          <table class="regles-table" style="font-size:10px">
            <tr><th>Niv.</th><th>PV max</th><th>CapacitÃ©</th></tr>
            <tr><td>1</td><td>13 (2d8+4)</td><td>RÃ´le martial</td></tr>
            <tr><td>2</td><td>19 (3d8+6)</td><td>Second souffle (1d10 + niv, 1Ã—/repos court)</td></tr>
            <tr><td>3</td><td>26 (4d8+8)</td><td>Critique amÃ©liorÃ© (19â€“20)</td></tr>
            <tr><td>4</td><td>32 (5d8+10)</td><td>AmÃ©lioration de caractÃ©ristique (+2/+1+1)</td></tr>
            <tr><td>5</td><td>39 (6d8+12)</td><td>Bonus de maÃ®trise +1</td></tr>
            <tr><td>6</td><td>45 (7d8+14)</td><td>Attaque supplÃ©mentaire (Ã—2)</td></tr>
          </table>
        </div>
        <div class="regles-section">
          <div class="pt">ðŸŽ­ Expert</div>
          <div style="font-size:10px;color:var(--text3);margin-bottom:4px">MaÃ®trise : armes courantes, rapiÃ¨res, Ã©pÃ©es courtes, armures lÃ©gÃ¨res</div>
          <table class="regles-table" style="font-size:10px">
            <tr><th>Niv.</th><th>PV max</th><th>CapacitÃ©</th></tr>
            <tr><td>1</td><td>11 (2d8+2)</td><td>Serviable, Outils</td></tr>
            <tr><td>2</td><td>16 (3d8+3)</td><td>Ruse (Foncer/DÃ©sengager/Se cacher en bonus)</td></tr>
            <tr><td>3</td><td>22 (4d8+4)</td><td>Expertise (Ã—2 maÃ®trise sur 2 compÃ©tences)</td></tr>
            <tr><td>4</td><td>27 (5d8+5)</td><td>AmÃ©lioration de caractÃ©ristique (+2/+1+1)</td></tr>
            <tr><td>5</td><td>33 (6d8+6)</td><td>Bonus de maÃ®trise +1</td></tr>
            <tr><td>6</td><td>38 (7d8+7)</td><td>Attaque supplÃ©mentaire (Ã—2)</td></tr>
          </table>
        </div>
        <div class="regles-section">
          <div class="pt">âœ¨ Incantateur</div>
          <div style="font-size:10px;color:var(--text3);margin-bottom:4px">MaÃ®trise : armes courantes, armures lÃ©gÃ¨res. 2 rÃ´les : GuÃ©risseur ou Mage</div>
          <table class="regles-table" style="font-size:10px">
            <tr><th>Niv.</th><th>PV</th><th>Min.</th><th>Sorts</th><th>Emp1</th><th>Emp2</th><th>CapacitÃ©</th></tr>
            <tr><td>1</td><td>9 (2d8)</td><td>2</td><td>2</td><td>2</td><td>â€”</td><td>RÃ´le magique, Incantation</td></tr>
            <tr><td>2</td><td>13 (3d8)</td><td>2</td><td>2</td><td>2</td><td>â€”</td><td>+1 sort niv1 (bÃ©nÃ©diction ou mains brÃ»lantes)</td></tr>
            <tr><td>3</td><td>18 (4d8)</td><td>2</td><td>3</td><td>3</td><td>â€”</td><td>+1 sort niv1 (bouclier de la foi ou bouclier)</td></tr>
            <tr><td>4</td><td>22 (5d8)</td><td>3</td><td>3</td><td>3</td><td>â€”</td><td>AmÃ©lioration caract. (+sort mineur)</td></tr>
            <tr><td>5</td><td>27 (6d8)</td><td>3</td><td>4</td><td>4</td><td>2</td><td>Bonus de maÃ®trise +1 (+sort niv2)</td></tr>
            <tr><td>6</td><td>31 (7d8)</td><td>3</td><td>4</td><td>4</td><td>2</td><td>Sorts mineurs puissants (+mod. incant.)</td></tr>
          </table>
        </div>
      </div>
    `)}`)}
    ${ds('s-compendium',`<div class="regles-section">
      ${dh('s-compendium','ðŸ“š Compendium D&D 5e')}
      ${rb('s-compendium',`<div style="font-size:11px;color:var(--text3);margin-bottom:10px">RÃ©fÃ©rence rapide â€” descriptions en franÃ§ais</div>
      <div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">
        <button class="btn bsm${_mjReglesComp==='classes'?' bprimary':''}" onclick="mjSetReglesComp('classes')">âš” Classes${CLASSES_DB?' ('+CLASSES_DB.length+')':''}</button>
        <button class="btn bsm${_mjReglesComp==='dons'?' bprimary':''}" onclick="mjSetReglesComp('dons')">ðŸŽ¯ Dons${FEATS_DB?' ('+FEATS_DB.length+')':''}</button>
        <button class="btn bsm${_mjReglesComp==='races'?' bprimary':''}" onclick="mjSetReglesComp('races')">ðŸ§¬ Races${RACES_DB?' ('+RACES_DB.length+')':''}</button>
        <button class="btn bsm${_mjReglesComp==='historiques'?' bprimary':''}" onclick="mjSetReglesComp('historiques')">ðŸ“– Historiques${BACKGROUNDS_DB?' ('+BACKGROUNDS_DB.length+')':''}</button>
        ${_mjReglesComp?'<button class="btn bsm" style="color:#e53935;border-color:#e53935" onclick="mjSetReglesComp(\'\')">âœ• Fermer</button>':''}
      </div>
      ${_mjReglesComp?'<input class="fi" id="compSearch" placeholder="Rechercher..." oninput="mjFilterComp(this.value)" style="margin-bottom:8px" autofocus><div id="compResults" style="max-height:300px;overflow-y:auto"></div>':'<div style="font-size:12px;color:var(--text3);font-style:italic">Cliquez sur une catÃ©gorie pour rechercher.</div>'}`)}
    </div>`)}
  </div>`;
}

function mjSetReglesComp(cat){
  _mjReglesComp=cat;
  renderMJContent();
}

function mjFilterComp(q){
  const el=document.getElementById('compResults');if(!el)return;
  const db=_mjReglesComp==='dons'?FEATS_DB:_mjReglesComp==='races'?RACES_DB:_mjReglesComp==='historiques'?BACKGROUNDS_DB:_mjReglesComp==='classes'?CLASSES_DB:null;
  if(!db){el.innerHTML='<div style="font-size:12px;color:var(--text3);text-align:center;padding:8px">Compendium non chargÃ© â€” revenez dans un instant.</div>';return;}
  if(!q.trim()){
    el.innerHTML='<div style="font-size:12px;color:var(--text3);text-align:center;padding:8px">Tapez pour rechercher parmi '+db.length+' entrÃ©es.</div>';
    return;
  }
  const low=q.toLowerCase();
  const res=[];
  for(let i=0;i<db.length&&res.length<20;i++){
    if(db[i].n&&db[i].n.toLowerCase().includes(low))res.push(db[i]);
  }
  if(!res.length){el.innerHTML='<div style="font-size:12px;color:var(--text3);text-align:center;padding:8px">Aucun rÃ©sultat.</div>';return;}
  el.innerHTML=res.map(e=>{
    let meta='';
    if(e.ab)meta+=` Â· <span style="color:var(--cp)">${esc(e.ab)}</span>`;
    if(e.spd)meta+=` Â· Vit. ${esc(e.spd)} ft`;
    if(e.sk)meta+=` Â· Comp. : ${esc(_parseCompBGSkills(e.sk).join(', '))||esc(e.sk)}`;
    if(e.hd)meta+=` Â· d${esc(e.hd)} (dÃ© de vie)`;
    if(e.ar)meta+=` Â· Armures : ${esc(e.ar)}`;
    if(e.wp)meta+=` Â· Armes : ${esc(e.wp)}`;
    return`<div style="border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:6px;background:var(--surface2)">
      <div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:4px">${esc(e.n)}</div>
      ${meta?`<div style="font-size:11px;color:var(--text3);margin-bottom:4px">${meta}</div>`:''}
      <div style="font-size:11px;color:var(--text2);line-height:1.5">${esc(e.tx||'')}</div>
    </div>`;
  }).join('');
}
