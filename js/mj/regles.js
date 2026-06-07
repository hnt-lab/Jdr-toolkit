function mjTabRegles(){
  function ds(id,html){return`<div class="mj-rules-section" data-ruleid="${id}" draggable="true" ondragstart="mjRuleDragStart('${id}',this)" ondragend="mjRuleDragEnd(this)" ondragover="mjRuleDragOver(event,this)" ondrop="mjRuleDrop(event,'${id}')">${html}</div>`;}
  function dh(id,title){const col=_rulesCollapsed[id];return`<div class="pt" style="display:flex;align-items:center;gap:6px;cursor:pointer;user-select:none" onclick="toggleRuleSection('${id}')"><span class="mj-drag-handle" title="Glisser pour réorganiser" onclick="event.stopPropagation()">⠿</span>${title}<span id="rschev_${id}" style="margin-left:auto;font-size:11px;color:var(--text3);transition:transform .2s${col?';transform:rotate(-90deg)':''}">▼</span></div>`;}
  function gh(id,label){const col=_rulesCollapsed[id];return`<div style="display:flex;align-items:center;gap:6px;padding:4px 0 8px;color:var(--text3);font-size:12px;cursor:pointer;user-select:none" onclick="toggleRuleSection('${id}')"><span class="mj-drag-handle" title="Glisser pour réorganiser" onclick="event.stopPropagation()">⠿</span>${label}<span id="rschev_${id}" style="margin-left:auto;font-size:11px;transition:transform .2s${col?';transform:rotate(-90deg)':''}">▼</span></div>`;}
  function rb(id,html){return`<div id="rsb_${id}"${_rulesCollapsed[id]?' style="display:none"':''}>${html}</div>`;}
  return`<div id="mjRulesContainer">
    ${ds('s-actions',`${gh('s-actions','⚔ Combat — Actions &amp; Initiative')}
    ${rb('s-actions',`<div class="g2" style="gap:10px">
      <div class="regles-section">
        <div class="pt">🎯 Actions disponibles</div>
        <table class="regles-table">
          <tr><th>Action</th><th>Description</th></tr>
          <tr><td><strong>Attaquer</strong></td><td>1 attaque au corps à corps ou à distance. Certaines classes = 2 attaques au niv.5.</td></tr>
          <tr><td><strong>Lancer un sort</strong></td><td>Selon le temps d'incantation du sort (1 action, action bonus, réaction…)</td></tr>
          <tr><td><strong>Foncer</strong></td><td>+Vitesse ce tour (déplacement total doublé).</td></tr>
          <tr><td><strong>Se désengager</strong></td><td>Le mouvement ne provoque pas d'attaque d'opportunité pour le reste du tour.</td></tr>
          <tr><td><strong>Esquiver</strong></td><td>Jusqu'au prochain tour : attaques contre soi en désavantage (si visible), jets DEX en avantage. Annulé si vitesse = 0 ou incapable d'agir.</td></tr>
          <tr><td><strong>Aider</strong></td><td>Allié à portée 1,5m : avantage à sa prochaine attaque ou son prochain jet de compétence (avant ton prochain tour).</td></tr>
          <tr><td><strong>Se cacher</strong></td><td>Jet de DEX (Discrétion) contre la Perception passive des ennemis.</td></tr>
          <tr><td><strong>Chercher</strong></td><td>SAG (Perception) ou INT (Investigation) pour trouver quelque chose.</td></tr>
          <tr><td><strong>Se tenir prêt</strong></td><td>Déclarer un déclencheur et une réaction associée (attaque, sort, déplacement). Agit via réaction quand le déclencheur survient. Sort préparé = concentration requise.</td></tr>
          <tr><td><strong>Utiliser un objet</strong></td><td>Pour interagir avec un 2e objet dans le tour, ou un objet qui requiert l'action explicitement.</td></tr>
          <tr><td><strong>Improviser</strong></td><td>Toute action hors liste — le MJ décide de la possibilité et du jet requis.</td></tr>
        </table>
        <div style="font-size:12px;color:var(--text3);margin-top:8px;line-height:1.8">
          <strong>Action bonus</strong> : 1 max/tour, accordée par une capacité spécifique (Ruse du roublard, sort en action bonus…).<br>
          <strong>Réaction</strong> : 1 max/tour. Recharge au début de ton tour. Exemples : attaque d'opportunité, bouclier, représailles infernales.<br>
          <strong>Interaction libre</strong> : 1 objet simple par tour sans action (dégainer, ouvrir une porte…). Le 2e objet coûte l'action.
        </div>
      </div>
      <div class="regles-section">
        <div class="pt">🎲 Initiative &amp; Surprise</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          <strong>Initiative</strong> : 1d20 + mod DEX au début du combat. Ordre décroissant. Égalité : le MJ décide (ou d20 supplémentaire).<br><br>
          <strong>Surprise</strong> : Si un groupe ne détecte pas l'ennemi (DEX Discrétion vs Perception passive), ses membres sont <em>surpris</em> au premier round.<br>
          Surpris = <strong>pas de mouvement, pas d'action, pas de réaction</strong> pendant le premier tour.<br><br>
          <strong>Tour de combat</strong> :<br>
          1. Se déplacer (≤ vitesse, fragmentable)<br>
          2. Agir (1 action)<br>
          3. Action bonus si disponible<br>
          4. Réaction si déclencheur (même hors tour)
        </div>
        <div class="pt" style="margin-top:12px">⚔ Attaques d'opportunité</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          Déclenchée quand une crÃ©ature hostile <strong>quitte ton allonge</strong> volontairement.<br>
          Coûte ta réaction → 1 attaque au corps à corps.<br>
          Annulée par l'action <strong>Se désengager</strong>, la téléportation ou un déplacement forcé.
        </div>
        <div class="pt" style="margin-top:12px">🗡 Combat à deux armes</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          Après attaque avec arme CàC <strong>légère</strong> → action bonus pour attaquer avec l'autre arme légère.<br>
          Pas de modificateur de caractéristique aux dégâts de l'attaque bonus (sauf si négatif).
        </div>
      </div>
    </div>`)}`)}
    ${ds('s-dc',`<div class="regles-section">
      ${dh('s-dc','🎲 Difficulté (DC) suggérée')}
      ${rb('s-dc',`<table class="regles-table">
        <tr><th>Difficulté</th><th>DC</th><th>Exemple</th></tr>
        <tr><td>Très facile</td><td><strong style="color:var(--cp)">5</strong></td><td>Escalader un mur avec des prises</td></tr>
        <tr><td>Facile</td><td><strong style="color:var(--cp)">10</strong></td><td>Crocheter une serrure ordinaire</td></tr>
        <tr><td>Moyen</td><td><strong style="color:var(--cp)">15</strong></td><td>Convaincre un garde méfiant</td></tr>
        <tr><td>Difficile</td><td><strong style="color:var(--cp)">20</strong></td><td>Escalader une paroi glissante</td></tr>
        <tr><td>Très difficile</td><td><strong style="color:var(--cp)">25</strong></td><td>Repérer une porte secrète bien cachée</td></tr>
        <tr><td>Quasi-impossible</td><td><strong style="color:var(--cp)">30</strong></td><td>Défoncer une porte de pierre renforcée à mains nues</td></tr>
      </table>`)}
    </div>`)}
    ${ds('s-conditions',`${gh('s-conditions','😵 Conditions &amp; PV temporaires')}
    ${rb('s-conditions',`<div class="g2" style="gap:10px">
      <div class="regles-section">
        <div class="pt">Conditions</div>
        <table class="regles-table">
          <tr><th>Condition</th><th>Effets principaux</th></tr>
          <tr><td><strong>À terre (Renversé)</strong></td><td>Seul mouvement = ramper (coût ×2). Se relever = ½ vitesse. Attaques en désavantage. Contre lui : CàC en avantage, distance en désavantage.</td></tr>
          <tr><td><strong>Agrippé</strong></td><td>Vitesse = 0 (aucun bonus). Prend fin si le ravisseur est incapable d'agir ou si la créature est hors portée. Échapper = action → FOR (Athlétisme) ou DEX (Acrobaties) opposé.</td></tr>
          <tr><td><strong>Aveuglé</strong></td><td>Rate tout jet nécessitant la vue. Attaques en désavantage, contre lui en avantage.</td></tr>
          <tr><td><strong>Charmé</strong></td><td>Ne peut pas attaquer ni cibler la source du charme. La source a l'avantage sur ses jets de CHA contre lui.</td></tr>
          <tr><td><strong>Sourd</strong></td><td>Rate tout jet nécessitant l'ouïe.</td></tr>
          <tr><td><strong>Effrayé</strong></td><td>Désavantage aux jets d'attaque et de caractéristiques tant que la source est visible. Ne peut pas s'approcher volontairement.</td></tr>
          <tr><td><strong>Empoisonné</strong></td><td>Désavantage aux jets d'attaque et de caractéristiques.</td></tr>
          <tr><td><strong>Entravé</strong></td><td>Vitesse = 0. Attaques en désavantage. Contre lui en avantage. Désavantage aux JS DEX.</td></tr>
          <tr><td><strong>Étourdi</strong></td><td>Incapable d'agir, ne peut bouger ni parler normalement. Rate JS FOR et DEX. Contre lui en avantage.</td></tr>
          <tr><td><strong>Inconscient</strong></td><td>Incapable d'agir, immobile, lâche ce qu'il tient, tombe à terre. Rate JS FOR et DEX. Contre lui en avantage. Toute attaque de moins de 1,5m = critique auto.</td></tr>
          <tr><td><strong>Invisible</strong></td><td>Introuvable sans magie ou sens spéciaux. Attaques en avantage, contre lui en désavantage. Position révélée si bruit ou traces.</td></tr>
          <tr><td><strong>Neutralisé</strong></td><td>Ne peut effectuer aucune action ni réaction.</td></tr>
          <tr><td><strong>Paralysé</strong></td><td>Neutralisé + immobile. Rate JS FOR et DEX. Contre lui en avantage. Touché à ≤1,5m = critique auto.</td></tr>
          <tr><td><strong>Pétrifié</strong></td><td>Transformé en substance solide (poids ×10, vieillissement suspendu). Incapable d'agir, immobile. Résistance à tous dégâts. Immunisé poison/maladie (suspendus). Contre lui en avantage. Rate JS FOR et DEX.</td></tr>
          <tr><td><strong>Épuisé</strong></td><td>6 niveaux cumulatifs. Niv.1 : désav. jets caract. · Niv.2 : vitesse ÷2 · Niv.3 : désav. attaques et JS · Niv.4 : PV max ÷2 · Niv.5 : vitesse = 0 · Niv.6 : mort. Repos long = −1 niveau (si mangé et bu).</td></tr>
        </table>
      </div>
      <div class="regles-section">
        <div class="pt">❤ Points de vie temporaires</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          Les PV temporaires absorbent les dégâts <strong>avant</strong> les PV normaux.<br>
          Ils <strong>ne se cumulent pas</strong> : si tu en reçois de nouveaux, tu choisis de garder les anciens ou les nouveaux.<br>
          Les soins <strong>ne restaurent pas</strong> les PV temporaires.<br>
          Ils persistent jusqu'à épuisement ou repos long, sauf durée spécifiée.<br>
          Ils peuvent dépasser ton maximum de PV, mais à 0 PV ils ne te font pas revenir conscient.
        </div>
      </div>
    </div>`)}`)}
    ${ds('s-couverture',`${gh('s-couverture','Couverture, Dégâts &amp; Combat spécial')}
    ${rb('s-couverture',`<div class="g2" style="gap:10px">
      <div class="regles-section">
        <div class="pt">🛡 Couverture</div>
        <table class="regles-table">
          <tr><th>Type</th><th>Bonus</th><th>Exemple</th></tr>
          <tr><td>Moitié (50%)</td><td><strong style="color:var(--cp)">+2 CA et JS DEX</strong></td><td>Mur bas, tonneau, allié</td></tr>
          <tr><td>Trois quarts (75%)</td><td><strong style="color:var(--cp)">+5 CA et JS DEX</strong></td><td>Meurtrière, herse, gros tronc</td></tr>
          <tr><td>Totale (100%)</td><td>Impossible à cibler</td><td>Mur plein</td></tr>
        </table>
        <div style="font-size:12px;color:var(--text3);margin-top:4px">Si plusieurs sources : seul le type le plus élevé s'applique (pas de cumul).</div>
      </div>
      <div class="regles-section">
        <div class="pt">🎯 Attaques spéciales</div>
        <table class="regles-table">
          <tr><th>Type</th><th>Condition</th><th>Effet</th></tr>
          <tr><td><strong>Coup critique (20 nat.)</strong></td><td>Jet d'attaque</td><td>Dés de dégâts × 2 (modificateurs normaux). Le 1 nat. rate toujours.</td></tr>
          <tr><td><strong>Lutte</strong></td><td>Cible ≤ taille+1, main libre</td><td>FOR (Athlétisme) opposé à FOR (Ath.) ou DEX (Acro.) → Agrippé. Déplacer la cible : vitesse ÷2.</td></tr>
          <tr><td><strong>Bousculer</strong></td><td>Cible ≤ taille+1</td><td>FOR (Athlétisme) opposé à FOR (Ath.) ou DEX (Acro.) → Renversé ou recule 1,5m.</td></tr>
          <tr><td><strong>Assommer</strong></td><td>Réduit à 0 PV (CàC)</td><td>Choix de l'attaquant : cible inconsciente et stable au lieu de mourir.</td></tr>
          <tr><td><strong>Résistance</strong></td><td>Résistance au type</td><td>Dégâts ÷2. Vulnérabilité = ×2. Pas de cumul entre elles.</td></tr>
        </table>
      </div>
      <div class="regles-section">
        <div class="pt">📏 Taille des créatures</div>
        <table class="regles-table">
          <tr><th>Taille</th><th>Espace contrôlé</th></tr>
          <tr><td>Très petite (TP)</td><td>75 cm × 75 cm</td></tr>
          <tr><td>Petite (P)</td><td>1,5 m × 1,5 m</td></tr>
          <tr><td>Moyenne (M)</td><td>1,5 m × 1,5 m</td></tr>
          <tr><td>Grande (G)</td><td>3 m × 3 m</td></tr>
          <tr><td>Très grande (TG)</td><td>4,5 m × 4,5 m</td></tr>
          <tr><td>Gigantesque (Gig)</td><td>6 m × 6 m ou plus</td></tr>
        </table>
        <div style="font-size:12px;color:var(--text3);margin-top:4px">Se faufiler dans un espace d'1 taille en dessous : coût ×2, désavantage attaques et JS DEX, attaques contre lui en avantage.</div>
      </div>
      <div class="regles-section">
        <div class="pt">💥 Types de dégâts</div>
        <table class="regles-table" style="font-size:12px">
          <tr><th>Type</th><th>Exemples</th></tr>
          <tr><td><strong>Acide</strong></td><td>Souffle dragon noir, gelée noire</td></tr>
          <tr><td><strong>Contondant</strong></td><td>Marteaux, chute, constriction</td></tr>
          <tr><td><strong>Feu</strong></td><td>Souffle dragon rouge, boule de feu</td></tr>
          <tr><td><strong>Force</strong></td><td>Projectile magique, arme spirituelle</td></tr>
          <tr><td><strong>Foudre</strong></td><td>Éclair, souffle dragon bleu</td></tr>
          <tr><td><strong>Froid</strong></td><td>Cône de froid, souffle dragon blanc</td></tr>
          <tr><td><strong>Nécrotique</strong></td><td>Morts-vivants, certains sorts</td></tr>
          <tr><td><strong>Perforant</strong></td><td>Lances, morsures, flèches</td></tr>
          <tr><td><strong>Poison</strong></td><td>Venin, souffle dragon vert</td></tr>
          <tr><td><strong>Psychique</strong></td><td>Illithid, attaque psionique</td></tr>
          <tr><td><strong>Radiant</strong></td><td>Colonne de flamme, châtiment angélique</td></tr>
          <tr><td><strong>Tonnerre</strong></td><td>Vague tonnante, explosion sonore</td></tr>
          <tr><td><strong>Tranchant</strong></td><td>Épées, haches, griffes</td></tr>
        </table>
      </div>
      <div class="regles-section">
        <div class="pt">🏇 Combat monté</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          Monture consentante, au moins 1 taille plus grande. Monter/descendre = ½ vitesse.<br>
          <strong>Monture contrôlée</strong> (dressée) : partage l'initiative du cavalier, actions limitées à Foncer/Esquiver/Se désengager.<br>
          <strong>Monture indépendante</strong> : garde son initiative, agit seule (peut fuir, attaquer…).<br>
          Monture renversée ou vitesse réduite à 0 → JS DEX DD10 pour rester en selle sinon tombé à 1,5m.
        </div>
      </div>
      <div class="regles-section">
        <div class="pt">🌊 Combat subaquatique</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          Sans vitesse de nage : désavantage aux attaques CàC (sauf dague, javeline, épée courte, lance, trident).<br>
          Attaque à distance : rate auto au-delà de la portée normale. Désavantage même dans la portée normale (sauf arbalète, filet, javelot/lance/trident/fléchette).<br>
          Créature entièrement immergée : résistance aux dégâts de feu.
        </div>
      </div>
    </div>`)}`)}
    ${ds('s-armes-c',`<div class="regles-section">
      ${dh('s-armes-c','⚔ Armes courantes')}
      ${rb('s-armes-c',`<table class="regles-table">
        <tr><th>Arme</th><th>Dégâts</th><th>Propriétés</th></tr>
        <tr><td colspan="3" style="color:var(--cp);font-size:12px;font-weight:600">Corps à corps</td></tr>
        <tr><td>Bâton</td><td>1d6 contondant</td><td>Polyvalente (1d8)</td></tr>
        <tr><td>Dague</td><td>1d4 perforant</td><td>Finesse, légère, lancer (6/18m)</td></tr>
        <tr><td>Gourdin</td><td>1d4 contondant</td><td>Légère</td></tr>
        <tr><td>Hachette</td><td>1d6 tranchant</td><td>Légère, lancer (6/18m)</td></tr>
        <tr><td>Javeline</td><td>1d6 perforant</td><td>Lancer (9/36m)</td></tr>
        <tr><td>Lance</td><td>1d6 perforant</td><td>Lancer (6/18m), polyvalente (1d8)</td></tr>
        <tr><td>Marteau léger</td><td>1d4 contondant</td><td>Légère, lancer (6/18m)</td></tr>
        <tr><td>Masse d'armes</td><td>1d6 contondant</td><td>—</td></tr>
        <tr><td>Massue</td><td>1d8 contondant</td><td>À deux mains</td></tr>
        <tr><td>Serpe</td><td>1d4 tranchant</td><td>Légère</td></tr>
        <tr><td colspan="3" style="color:var(--cp);font-size:12px;font-weight:600">À distance</td></tr>
        <tr><td>Arc court</td><td>1d6 perforant</td><td>Munitions (24/96m), 2 mains</td></tr>
        <tr><td>Arbalète légère</td><td>1d8 perforant</td><td>Munitions (24/96m), chargement, 2 mains</td></tr>
        <tr><td>Fléchette</td><td>1d4 perforant</td><td>Finesse, lancer (6/18m)</td></tr>
        <tr><td>Fronde</td><td>1d4 contondant</td><td>Munitions (9/36m)</td></tr>
      </table>`)}
    </div>`)}
    ${ds('s-armes-g',`<div class="regles-section">
      ${dh('s-armes-g','⚔ Armes de guerre')}
      ${rb('s-armes-g',`<table class="regles-table">
        <tr><th>Arme</th><th>Dégâts</th><th>Propriétés</th></tr>
        <tr><td colspan="3" style="color:var(--cp);font-size:12px;font-weight:600">Corps à corps</td></tr>
        <tr><td>Cimeterre</td><td>1d6 tranchant</td><td>Finesse, légère</td></tr>
        <tr><td>Coutille</td><td>1d10 tranchant</td><td>Lourde, allonge, 2 mains</td></tr>
        <tr><td>Épée à deux mains</td><td>2d6 tranchant</td><td>Lourde, 2 mains</td></tr>
        <tr><td>Épée courte</td><td>1d6 perforant</td><td>Finesse, légère</td></tr>
        <tr><td>Épée longue</td><td>1d8 tranchant</td><td>Polyvalente (1d10)</td></tr>
        <tr><td>Fléau d'armes</td><td>1d8 contondant</td><td>—</td></tr>
        <tr><td>Fouet</td><td>1d4 tranchant</td><td>Finesse, allonge</td></tr>
        <tr><td>Hache à deux mains</td><td>1d12 tranchant</td><td>Lourde, 2 mains</td></tr>
        <tr><td>Hache d'armes</td><td>1d8 tranchant</td><td>Polyvalente (1d10)</td></tr>
        <tr><td>Hallebarde</td><td>1d10 tranchant</td><td>Lourde, allonge, 2 mains</td></tr>
        <tr><td>Lance d'arçon</td><td>1d12 perforant</td><td>Allonge, spéciale†</td></tr>
        <tr><td>Maillet</td><td>2d6 contondant</td><td>Lourde, 2 mains</td></tr>
        <tr><td>Marteau de guerre</td><td>1d8 contondant</td><td>Polyvalente (1d10)</td></tr>
        <tr><td>Morgenstern</td><td>1d8 perforant</td><td>—</td></tr>
        <tr><td>Pic de guerre</td><td>1d8 perforant</td><td>—</td></tr>
        <tr><td>Pique</td><td>1d10 perforant</td><td>Lourde, allonge, 2 mains</td></tr>
        <tr><td>Rapière</td><td>1d8 perforant</td><td>Finesse</td></tr>
        <tr><td>Trident</td><td>1d6 perforant</td><td>Lancer (6/18m), polyvalente (1d8)</td></tr>
        <tr><td colspan="3" style="color:var(--cp);font-size:12px;font-weight:600">À distance</td></tr>
        <tr><td>Arc long</td><td>1d8 perforant</td><td>Munitions (45/180m), lourde, 2 mains</td></tr>
        <tr><td>Arbalète de poing</td><td>1d6 perforant</td><td>Munitions (9/36m), légère, chargement</td></tr>
        <tr><td>Arbalète lourde</td><td>1d10 perforant</td><td>Munitions (30/120m), lourde, chargement, 2 mains</td></tr>
        <tr><td>Filet</td><td>—</td><td>Spéciale‡, lancer (1,5/4,5m)</td></tr>
        <tr><td>Sarbacane</td><td>1 perforant</td><td>Munitions (7,5/30m), chargement</td></tr>
      </table>
      <div style="font-size:12px;color:var(--text3);margin-top:6px;line-height:1.7"><strong>Finesse</strong> : FOR ou DEX &nbsp;·&nbsp; <strong>Légère</strong> : combat à 2 armes &nbsp;·&nbsp; <strong>Allonge</strong> : +1,5m portée &nbsp;·&nbsp; <strong>Lourde</strong> : désavantage taille P &nbsp;·&nbsp; <strong>Chargement</strong> : 1 tir/action &nbsp;·&nbsp; <strong>Improvisée</strong> : 1d4 &nbsp;·&nbsp; <strong>Argent</strong> : plaquer une arme 100 po &nbsp;·&nbsp; <strong>†Lance d'arçon</strong> : désavantage ≤1,5m, 2 mains hors monture &nbsp;·&nbsp; <strong>‡Filet</strong> : entrave ≤taille G, JS FOR DD10 pour se libérer, 5 dgts tranchants (CA10) détruisent le filet, 1 attaque/action max</div>
      `)}
    </div>`)}
    ${ds('s-armures',`<div class="regles-section">
      ${dh('s-armures','🛡 Armures')}
      ${rb('s-armures',`<table class="regles-table">
        <tr><th>Armure</th><th>CA</th><th>Discrétion</th></tr>
        <tr><td colspan="3" style="color:var(--cp);font-size:12px;font-weight:600">Légères</td></tr>
        <tr><td>Matelassée</td><td>11 + mod DEX</td><td>Désavantage</td></tr>
        <tr><td>Cuir</td><td>11 + mod DEX</td><td>—</td></tr>
        <tr><td>Cuir clouté</td><td>12 + mod DEX</td><td>—</td></tr>
        <tr><td colspan="3" style="color:var(--cp);font-size:12px;font-weight:600">Intermédiaires</td></tr>
        <tr><td>Peau</td><td>12 + mod DEX (max +2)</td><td>—</td></tr>
        <tr><td>Chemise de mailles</td><td>13 + mod DEX (max +2)</td><td>—</td></tr>
        <tr><td>Écailles</td><td>14 + mod DEX (max +2)</td><td>Désavantage</td></tr>
        <tr><td>Cuirasse</td><td>14 + mod DEX (max +2)</td><td>—</td></tr>
        <tr><td>Demi-plate</td><td>15 + mod DEX (max +2)</td><td>Désavantage</td></tr>
        <tr><td colspan="3" style="color:var(--cp);font-size:12px;font-weight:600">Lourdes</td></tr>
        <tr><td>Broigne</td><td>14</td><td>Désavantage</td></tr>
        <tr><td>Cotte de mailles</td><td>16 (FOR 13 ou −3m)</td><td>Désavantage</td></tr>
        <tr><td>Clibanion</td><td>17 (FOR 15 ou −3m)</td><td>Désavantage</td></tr>
        <tr><td>Harnois</td><td>18 (FOR 15 ou −3m)</td><td>Désavantage</td></tr>
        <tr><td>Bouclier</td><td>+2</td><td>—</td></tr>
      </table>
      <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin:10px 0 4px">Mettre / Ôter une armure</div>
      <table class="regles-table">
        <tr><th>Catégorie</th><th>Mettre</th><th>Ôter</th></tr>
        <tr><td>Légère</td><td>1 min</td><td>1 min</td></tr>
        <tr><td>Intermédiaire</td><td>5 min</td><td>1 min</td></tr>
        <tr><td>Lourde</td><td>10 min</td><td>5 min</td></tr>
        <tr><td>Bouclier</td><td>1 action</td><td>1 action</td></tr>
      </table>`)}
    </div>`)}
    ${ds('s-modifs',`<div class="regles-section">
      ${dh('s-modifs','🎲 Modificateurs de caractéristiques')}
      ${rb('s-modifs',`<table class="regles-table">
        <tr><th>Score</th><th>Mod.</th></tr>
        <tr><td>1</td><td style="color:#e53935">−5</td></tr>
        <tr><td>2–3</td><td style="color:#e53935">−4</td></tr>
        <tr><td>4–5</td><td style="color:#e53935">−3</td></tr>
        <tr><td>6–7</td><td style="color:#e53935">−2</td></tr>
        <tr><td>8–9</td><td style="color:#e53935">−1</td></tr>
        <tr><td>10–11</td><td>+0</td></tr>
        <tr><td>12–13</td><td style="color:var(--cp)">+1</td></tr>
        <tr><td>14–15</td><td style="color:var(--cp)">+2</td></tr>
        <tr><td>16–17</td><td style="color:var(--cp)">+3</td></tr>
        <tr><td>18–19</td><td style="color:var(--cp)">+4</td></tr>
        <tr><td>20–21</td><td style="color:var(--cp)">+5</td></tr>
        <tr><td>22–23</td><td style="color:var(--cp)">+6</td></tr>
        <tr><td>24–25</td><td style="color:var(--cp)">+7</td></tr>
        <tr><td>28–30</td><td style="color:var(--cp)">+9/+10</td></tr>
      </table>`)}
    </div>`)}
    ${ds('s-multiclasse',`<div class="regles-section">
      ${dh('s-multiclasse','🔀 Multiclassage')}
      ${rb('s-multiclasse',`<div style="font-size:12px;color:var(--text3);margin-bottom:8px">Option : ajouter un niveau dans une autre classe plutôt que dans sa classe actuelle. Nécessite les valeurs minimum dans les deux classes.</div>
      <div class="g2" style="gap:10px">
        <div>
          <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Prérequis</div>
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
            <tr><td>Rôdeur</td><td>DEX 13 et SAG 13</td></tr>
            <tr><td>Roublard</td><td>DEX 13</td></tr>
          </table>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Maîtrises gagnées (nouveau niveau)</div>
          <table class="regles-table">
            <tr><th>Classe</th><th>Maîtrises gagnées</th></tr>
            <tr><td>Barbare</td><td>Boucliers, armes courantes &amp; de guerre</td></tr>
            <tr><td>Barde</td><td>Armure légère, 1 compétence, 1 instrument</td></tr>
            <tr><td>Clerc</td><td>Armure légère, intermédiaire, boucliers</td></tr>
            <tr><td>Druide</td><td>Armure légère, intermédiaire, boucliers (pas métal)</td></tr>
            <tr><td>Ensorceleur</td><td>—</td></tr>
            <tr><td>Guerrier</td><td>Armures légère, intermédiaire, boucliers, armes courantes &amp; de guerre</td></tr>
            <tr><td>Magicien</td><td>—</td></tr>
            <tr><td>Moine</td><td>Armes courantes, épée courte</td></tr>
            <tr><td>Occultiste</td><td>Armure légère, armes courantes</td></tr>
            <tr><td>Paladin</td><td>Armures légère, intermédiaire, boucliers, armes courantes &amp; de guerre</td></tr>
            <tr><td>Rôdeur</td><td>Armures légère, intermédiaire, boucliers, armes courantes &amp; de guerre, 1 compétence</td></tr>
            <tr><td>Roublard</td><td>Armure légère, 1 compétence de la liste, outils de voleur</td></tr>
          </table>
        </div>
      </div>
      <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin:10px 0 4px">Emplacements de sorts multiclasse (niveau total de lanceur)</div>
      <div style="max-height:220px;overflow-y:auto">
      <table class="regles-table" style="font-size:12px">
        <tr><th>Niv.</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th></tr>
        <tr><td>1</td><td>2</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>
        <tr><td>2</td><td>3</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>
        <tr><td>3</td><td>4</td><td>2</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>
        <tr><td>4</td><td>4</td><td>3</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>
        <tr><td>5</td><td>4</td><td>3</td><td>2</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>
        <tr><td>6</td><td>4</td><td>3</td><td>3</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>
        <tr><td>7</td><td>4</td><td>3</td><td>3</td><td>1</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>
        <tr><td>8</td><td>4</td><td>3</td><td>3</td><td>2</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>
        <tr><td>9</td><td>4</td><td>3</td><td>3</td><td>3</td><td>1</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>
        <tr><td>10</td><td>4</td><td>3</td><td>3</td><td>3</td><td>2</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>
        <tr><td>11</td><td>4</td><td>3</td><td>3</td><td>3</td><td>2</td><td>1</td><td>—</td><td>—</td><td>—</td></tr>
        <tr><td>12</td><td>4</td><td>3</td><td>3</td><td>3</td><td>2</td><td>1</td><td>—</td><td>—</td><td>—</td></tr>
        <tr><td>13</td><td>4</td><td>3</td><td>3</td><td>3</td><td>2</td><td>1</td><td>1</td><td>—</td><td>—</td></tr>
        <tr><td>14</td><td>4</td><td>3</td><td>3</td><td>3</td><td>2</td><td>1</td><td>1</td><td>—</td><td>—</td></tr>
        <tr><td>15</td><td>4</td><td>3</td><td>3</td><td>3</td><td>2</td><td>1</td><td>1</td><td>1</td><td>—</td></tr>
        <tr><td>16</td><td>4</td><td>3</td><td>3</td><td>3</td><td>2</td><td>1</td><td>1</td><td>1</td><td>—</td></tr>
        <tr><td>17</td><td>4</td><td>3</td><td>3</td><td>3</td><td>2</td><td>1</td><td>1</td><td>1</td><td>1</td></tr>
        <tr><td>18</td><td>4</td><td>3</td><td>3</td><td>3</td><td>3</td><td>1</td><td>1</td><td>1</td><td>1</td></tr>
        <tr><td>19</td><td>4</td><td>3</td><td>3</td><td>3</td><td>3</td><td>2</td><td>1</td><td>1</td><td>1</td></tr>
        <tr><td>20</td><td>4</td><td>3</td><td>3</td><td>3</td><td>3</td><td>2</td><td>2</td><td>1</td><td>1</td></tr>
      </table>
      </div>
      <div style="font-size:12px;color:var(--text3);margin-top:6px;line-height:1.7">Niv. lanceur = Barde+Clerc+Druide+Ensorc.+Mage (×1) + Paladin+Rôdeur (×½ arrondi inf.) + Guerrier/Roublard éligibles (×⅓ arrondi inf.) &nbsp;·&nbsp; Occultiste : Magie de pacte utilisable pour sorts des autres classes et vice versa &nbsp;·&nbsp; Attaque supplémentaire : ne se cumule pas entre classes &nbsp;·&nbsp; Défense sans armure : une seule source</div>`)}
    </div>`)}
    ${ds('s-epuisement',`<div class="regles-section">
      ${dh('s-epuisement','😵 Épuisement · 🍖 Faim & Soif')}
      ${rb('s-epuisement',`<div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Niveaux d'épuisement</div>
        <table class="regles-table">
          <tr><th>Niv.</th><th>Effet</th></tr>
          <tr><td>1</td><td>Désavantage aux jets de caractéristique</td></tr>
          <tr><td>2</td><td>Vitesse divisée par deux</td></tr>
          <tr><td>3</td><td>Désavantage aux jets d'attaque et de sauvegarde</td></tr>
          <tr><td>4</td><td>Max PV divisé par deux</td></tr>
          <tr><td>5</td><td>Vitesse réduite à 0</td></tr>
          <tr><td style="color:#e53935;font-weight:600">6</td><td style="color:#e53935">Mort</td></tr>
        </table>
        <div style="font-size:12px;color:var(--text3);margin-top:5px;margin-bottom:10px">Repos long : −1 niveau d'épuisement.</div>
        <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Faim</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.7;margin-bottom:8px">
          Besoin : <strong>500 g/jour</strong>. Moins de la moitié → JS CON DD 10 ou +1 épuisement.<br>
          Sans nourriture : après <strong>3 + mod CON jours</strong> (min 1), +1 épuisement automatique/jour.
        </div>
        <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Soif</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.7">
          Besoin : <strong>3,5 l/jour</strong> (7 l en chaleur extrême).<br>
          Sans eau 1 jour → JS CON DD 15 ou +1 épuisement (+2 si raté de 5+).<br>
          Armure intermédiaire/lourde → désavantage au jet.
        </div>`)}
    </div>`)}
    ${ds('s-voyage',`${gh('s-voyage','Voyage, Mouvement &amp; Lumière')}
    ${rb('s-voyage',`<div class="g2" style="gap:10px">
      <div class="regles-section">
        <div class="pt">🚶 Allures de voyage</div>
        <table class="regles-table">
          <tr><th>Allure</th><th>Minute</th><th>Heure</th><th>Jour</th><th>Effet</th></tr>
          <tr><td>Rapide</td><td>120 m</td><td>6 km</td><td>45 km</td><td style="color:#e53935">−5 Percep.</td></tr>
          <tr><td>Normale</td><td>90 m</td><td>4,5 km</td><td>36 km</td><td>—</td></tr>
          <tr><td>Lente</td><td>60 m</td><td>3 km</td><td>27 km</td><td style="color:var(--cp)">Discrétion</td></tr>
        </table>
        <div style="font-size:12px;color:var(--text3);margin-top:6px;line-height:1.7">
          <strong>Marche forcée</strong> : après 8h/jour, chaque heure supplémentaire → JS CON DD (10 + 1/h sup.). Échec = 1 niveau d'épuisement.<br>
          <strong>Terrain difficile</strong> : vitesse ÷ 2 (forêt dense, marais, montagne, glace, ruines…)<br>
          <strong>Monture</strong> : peut galoper 1h à vitesse ×2 (allure rapide). Véhicule terrestre = allure normale.
        </div>
      </div>
      <div class="regles-section">
        <div class="pt">🕯 Sources de lumière</div>
        <table class="regles-table">
          <tr><th>Source</th><th>Vive</th><th>Faible</th><th>Durée</th></tr>
          <tr><td>Bougie</td><td>1,5 m</td><td>+1,5 m</td><td>1 h</td></tr>
          <tr><td>Lampe</td><td>4,5 m</td><td>+9 m</td><td>6 h</td></tr>
          <tr><td>Lanterne à capote</td><td>9 m</td><td>+9 m</td><td>6 h</td></tr>
          <tr><td>Lanterne sourde</td><td>18 m</td><td>+18 m</td><td>6 h</td></tr>
          <tr><td>Torche</td><td>6 m</td><td>+6 m</td><td>1 h</td></tr>
        </table>
      </div>
      <div class="regles-section">
        <div class="pt">🧗 Mouvements spéciaux</div>
        <table class="regles-table">
          <tr><th>Action</th><th>Coût</th><th>Jet éventuel</th></tr>
          <tr><td>Escalader</td><td>2 m par mètre (terrain difficile : 3 m)</td><td>FOR (Athlétisme) si surface glissante</td></tr>
          <tr><td>Nager</td><td>2 m par mètre (eaux agitées : jet requis)</td><td>FOR (Athlétisme) si courant fort</td></tr>
          <tr><td>Ramper</td><td>2 m par mètre</td><td>—</td></tr>
          <tr><td>Saut en longueur (élan)</td><td>FOR ÷ 3 mètres</td><td>FOR (Athlétisme) DD 10 pour obstacle ≤ 1/4 distance</td></tr>
          <tr><td>Saut en longueur (sur place)</td><td>FOR ÷ 6 mètres</td><td>—</td></tr>
          <tr><td>Saut en hauteur (élan)</td><td>mod FOR ÷ 3 + 1 m (min 0)</td><td>—</td></tr>
          <tr><td>Saut en hauteur (sur place)</td><td>Moitié ci-dessus</td><td>—</td></tr>
        </table>
        <div style="font-size:12px;color:var(--text3);margin-top:6px">Atterrissage en terrain difficile → DEX (Acrobaties) DD 10 ou chute à terre.</div>
      </div>
      <div class="regles-section">
        <div class="pt">👁 Types de vision</div>
        <table class="regles-table">
          <tr><th>Vision</th><th>Effet</th></tr>
          <tr><td><strong>Lumière vive</strong></td><td>Visibilité normale</td></tr>
          <tr><td><strong>Pénombre</strong> (lumière faible)</td><td>Zone à visibilité réduite — désavantage aux jets de Perception (vue)</td></tr>
          <tr><td><strong>Ténèbres</strong></td><td>Visibilité nulle — état Aveuglé pour voir dans cette zone</td></tr>
          <tr><td><strong>Vision aveugle</strong></td><td>Perçoit l'environnement sans la vue dans un rayon donné (vases, dragons, chauves-souris…)</td></tr>
          <tr><td><strong>Vision dans le noir</strong></td><td>Pénombre = lumière vive · Ténèbres = pénombre (niveaux de gris uniquement)</td></tr>
          <tr><td><strong>Vision véritable</strong></td><td>Voit dans toutes ténèbres, détecte l'invisible, les illusions, les métamorphes, et le plan éthéré</td></tr>
        </table>
      </div>
    </div>`)}`)}
    ${ds('s-dangers',`${gh('s-dangers','Dangers &amp; Survie')}
    ${rb('s-dangers',`<div class="g2" style="gap:10px">
      <div class="regles-section">
        <div class="pt">⬇ Chuter</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          <strong>1d6 dégâts contondants par 3 m de chute</strong> (max 20d6).<br>
          La créature atterrit à terre, sauf si elle évite les dégâts.
        </div>
      </div>
      <div class="regles-section">
        <div class="pt">🫁 Suffoquer</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          <strong>Retenir sa respiration</strong> : 1 + mod CON minutes (min 30 s).<br>
          <strong>En train de suffoquer</strong> : survit mod CON rounds (min 1).<br>
          Au début du round suivant → 0 PV, état mourant. Impossible de récupérer des PV ni d'être stabilisé avant de respirer.
        </div>
      </div>
      <div class="regles-section">
        <div class="pt">🍖 Nourriture & eau</div>
        <table class="regles-table">
          <tr><th></th><th>Besoin/jour</th><th>Survie sans</th><th>Conséquence</th></tr>
          <tr><td><strong>Nourriture</strong></td><td>500 g</td><td>3 + mod CON jours (min 1)</td><td>+1 niv. épuisement/jour au-delà · Demi-ration = demi-jour</td></tr>
          <tr><td><strong>Eau</strong></td><td>4 L (8 L si chaud)</td><td>Moitié → JS CON DD 15 ou +1 épuis.</td><td>Moins de moitié → +1 épuis. auto (×2 si déjà épuisé)</td></tr>
        </table>
      </div>
    </div>`)}`)}
    ${ds('s-vie',`${gh('s-vie','Train de vie &amp; Monnaies')}
    ${rb('s-vie',`<div class="g2" style="gap:10px">
      <div class="regles-section">
        <div class="pt">🏨 Train de vie</div>
        <table class="regles-table">
          <tr><th>Train de vie</th><th>Coût/jour</th><th>Auberge</th></tr>
          <tr><td>Sordide</td><td>1 pa</td><td>7 pc</td></tr>
          <tr><td>Pauvre</td><td>2 pa</td><td>1 pa</td></tr>
          <tr><td>Modeste</td><td>1 po</td><td>5 pa</td></tr>
          <tr><td>Confortable</td><td>2 po</td><td>8 pa</td></tr>
          <tr><td>Riche</td><td>4 po</td><td>2 po</td></tr>
          <tr><td>Aristocratique</td><td>10 po min.</td><td>4 po</td></tr>
        </table>
      </div>
      <div class="regles-section">
        <div class="pt">💰 Monnaies & Conversions</div>
        <table class="regles-table">
          <tr><th>Unité</th><th>Équivalent</th></tr>
          <tr><td>1 pc</td><td>—</td></tr>
          <tr><td>1 pa</td><td>= 10 pc</td></tr>
          <tr><td>1 pe</td><td>= 50 pc</td></tr>
          <tr><td>1 po</td><td>= 100 pc</td></tr>
          <tr><td>1 pp</td><td>= 1000 pc</td></tr>
        </table>
        <div style="font-size:12px;color:var(--text3);margin-top:6px">5 ft = 1,5 m &nbsp;·&nbsp; 1 mile = 1,5 km &nbsp;·&nbsp; 1 lb = 500 g</div>
      </div>
    </div>`)}`)}
    ${ds('s-temps-mort',`${gh('s-temps-mort','🌙 Temps morts')}
    ${rb('s-temps-mort',`
      <div class="regles-section" style="margin-bottom:10px">
        <div class="pt">👤 Antagonistes</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.6">
          PNJ actifs qui s'opposent au groupe (2–3 simultanément recommandés). Chaque temps mort résolu, faire <strong>avancer 1 plan d'antagoniste</strong> : attaque, intrigue, événement de fond. Chaque antagoniste a des <strong>Objectifs</strong>, des <strong>Ressources</strong> et un plan en 3–4 étapes.
        </div>
      </div>
      <div class="regles-section">
        <div class="pt">📋 Activités — 1 semaine = 5 jours, 8h/jour minimum</div>
        <div style="max-height:380px;overflow-y:auto">
        <table class="regles-table" style="font-size:11px">
          <tr><th style="min-width:130px">Activité</th><th>Ressources</th><th>Jet / Résultat</th></tr>
          <tr><td><strong>🛒 Acheter objet mag.</strong></td><td>1 sem + 100 po min</td><td>CHA Persuasion (+1/sem sup., +1/100 po, max +10) → qualité du vendeur</td></tr>
          <tr><td><strong>🍺 Faire la fête</strong></td><td>1 sem + 10/50/250 po (peuple/bourgeois/aristocratie)</td><td>CHA Persuasion : ≤5 ennemi · 6-10 rien · 11-15 allié · 16-20 ×2 · 21+ ×3</td></tr>
          <tr><td><strong>⚒ Fabriquer objet</strong></td><td>Matériaux = ½ prix, outils requis</td><td>50 po de valeur / semaine. Collaboration possible.</td></tr>
          <tr><td><strong>✨ Objet magique</strong></td><td>Formule + quête + 50 po–100k po</td><td>1–50 sem. selon rareté. Consommables ÷2.</td></tr>
          <tr><td><strong>🧪 Potion de soins</strong></td><td>Kit herboriste requis</td><td>Soins 25 po/1j · Maj. 100 po/1sem · Sup. 1 000 po/3sem · Supr. 10 000 po/4sem</td></tr>
          <tr><td><strong>🗡 Crime</strong></td><td>1 sem + 25 po</td><td>3 jets (Discrétion / Outils voleur / libre) vs DD 10/15/20/25 → 0–1 000 po</td></tr>
          <tr><td><strong>🎲 Parier</strong></td><td>1 sem + 10–1 000 po</td><td>3 jets (Intuition/Tromperie/Intimidation) vs DD 5+2d10 → ×0 · ×0,5 · ×1,5 · ×2</td></tr>
          <tr><td><strong>🥊 Combattre</strong></td><td>1 sem</td><td>3 jets (Athlétisme/Acrobaties/CON+dé vie) vs DD 5+2d10 → 0/50/100/200 po</td></tr>
          <tr><td><strong>😴 Relaxation</strong></td><td>1 sem, train de vie modeste min.</td><td>Avantage JS maladie/poison. Fin sem. : supprimer 1 effet ou restaurer 1 caract.</td></tr>
          <tr><td><strong>⛪ Service religieux</strong></td><td>1 sem, gratuit</td><td>INT (Religion) ou CHA (Persuasion) : 1-10 rien · 11-20 une faveur · 21+ deux faveurs</td></tr>
          <tr><td><strong>📖 Recherches</strong></td><td>1 sem + 50 po min (+1/50 po, max +6)</td><td>INT : 1-5 rien · 6-10 une info · 11-20 deux · 21+ trois informations</td></tr>
          <tr><td><strong>📜 Parchemin de sort</strong></td><td>Maîtrise Arcanes, sort préparé</td><td>Mineur 15po/1j · Niv1 25po/1j · Niv2 250po/3j · Niv3 500po/1sem · Niv4 2,5k/2sem · Niv5 5k/4sem</td></tr>
          <tr><td><strong>💰 Vendre objet mag.</strong></td><td>1 sem + 25 po</td><td>CHA Persuasion : ≤10 → 50% · 11-20 → 100% · 21+ → 150% du prix de base</td></tr>
          <tr><td><strong>📚 Se former</strong></td><td>10 sem (− mod INT), 25 po/sem</td><td>Langue ou maîtrise d'outil. Instructeur requis.</td></tr>
          <tr><td><strong>🔨 Travailler</strong></td><td>1 sem</td><td>Jet compétence : ≤9 pauvre · 10-14 modeste · 15-20 confortable · 21+ confort + 25 po</td></tr>
          <tr><td><strong>🏰 Construire</strong></td><td>Terrain + charte royale requis</td><td>Fort 15k/100j · Donjon 50k/400j · Palace 500k/1 200j · Siège guilde 5k/60j · Temple 50k/400j</td></tr>
        </table>
        </div>
        <div style="font-size:11px;color:var(--text3);margin-top:6px">Complications : 10% de chances par semaine d'activité. Absent lors d'une construction = +3 jours par jour d'absence.</div>
      </div>
    `)}`)}
    ${ds('s-packs',`<div class="regles-section">
      ${dh('s-packs','🎒 Sacs d\'équipement')}
      ${rb('s-packs',`<table class="regles-table">
        <tr><th>Sac</th><th>Prix</th><th>Contenu</th></tr>
        <tr><td><strong>Artiste</strong></td><td>40 po</td><td>Sac à dos, sac de couchage, 2 costumes, 5 bougies, 5j rations, gourde, kit de déguisement</td></tr>
        <tr><td><strong>Cambrioleur</strong></td><td>16 po</td><td>Sac à dos, 1000 billes, 3m chaîne, cloche, 5 bougies, pied-de-biche, marteau, 10 pitons, lanterne à capuchon, 2 huiles, 5j rations, allume-feu, gourde, 15m corde chanvre</td></tr>
        <tr><td><strong>Diplomate</strong></td><td>39 po</td><td>Coffre, 2 étuis à cartes, vêtements fins, encre, plume, lampe, 2 huiles, 5 papiers, parfum, cire à cacheter, savon</td></tr>
        <tr><td><strong>Ecclésiastique</strong></td><td>19 po</td><td>Sac à dos, couverture, 10 bougies, allume-feu, boîte aumône, 2 bâtonnets d'encens, encensoir, habits de cérémonie, 2j rations, gourde</td></tr>
        <tr><td><strong>Érudit</strong></td><td>40 po</td><td>Sac à dos, livre, encre, plume, 10 parchemins, sac de sable, petit couteau</td></tr>
        <tr><td><strong>Explorateur</strong></td><td>10 po</td><td>Sac à dos, sac de couchage, gamelle, allume-feu, 10 torches, 10j rations, gourde, 15m corde chanvre</td></tr>
        <tr><td><strong>Exploration souterraine</strong></td><td>12 po</td><td>Sac à dos, pied-de-biche, marteau, 10 pitons, 10 torches, allume-feu, 10j rations, gourde, 15m corde chanvre</td></tr>
      </table>`)}
    </div>`)}
    ${ds('s-services',`<div class="regles-section">
      ${dh('s-services','⚙ Services & Embauche')}
      ${rb('s-services',`<table class="regles-table">
        <tr><th>Service</th><th>Prix</th></tr>
        <tr><td>Embauche non qualifiée</td><td>2 pa / jour</td></tr>
        <tr><td>Embauche qualifiée</td><td>2 po / jour</td></tr>
        <tr><td>Messager</td><td>2 pc / 1,5 km</td></tr>
        <tr><td>Péage routier ou de porte</td><td>1 pc</td></tr>
        <tr><td>Transport en ville</td><td>1 pc</td></tr>
        <tr><td>Transport entre deux villes</td><td>3 pc / 1,5 km</td></tr>
        <tr><td>Voyage en bateau</td><td>1 pa / 1,5 km</td></tr>
      </table>
      <div style="font-size:12px;color:var(--text3);margin-top:6px;line-height:1.7"><strong>Sorts niv.1–2</strong> : 10–50 po + composantes coûteuses &nbsp;·&nbsp; Sorts niv. supérieur : temple ou université, tarif ou service rendu en échange</div>`)}
    </div>`)}
    ${ds('s-depart',`${gh('s-depart','🪙 Or de départ &amp; Revente')}
    ${rb('s-depart',`<div class="g2" style="gap:10px">
      <div class="regles-section">
        <div class="pt">🪙 Or de départ (alternative à l'équipement)</div>
        <table class="regles-table">
          <tr><th>Classe</th><th>Formule</th><th>Moy.</th></tr>
          <tr><td>Barbare</td><td>2d4 × 10 po</td><td>50 po</td></tr>
          <tr><td>Barde</td><td>5d4 × 10 po</td><td>125 po</td></tr>
          <tr><td>Clerc</td><td>5d4 × 10 po</td><td>125 po</td></tr>
          <tr><td>Druide</td><td>2d4 × 10 po</td><td>50 po</td></tr>
          <tr><td>Ensorceleur</td><td>3d4 × 10 po</td><td>75 po</td></tr>
          <tr><td>Guerrier</td><td>5d4 × 10 po</td><td>125 po</td></tr>
          <tr><td>Magicien</td><td>4d4 × 10 po</td><td>100 po</td></tr>
          <tr><td>Moine</td><td>5d4 po</td><td>12 po</td></tr>
          <tr><td>Occultiste</td><td>4d4 × 10 po</td><td>100 po</td></tr>
          <tr><td>Paladin</td><td>5d4 × 10 po</td><td>125 po</td></tr>
          <tr><td>Rôdeur</td><td>5d4 × 10 po</td><td>125 po</td></tr>
          <tr><td>Roublard</td><td>4d4 × 10 po</td><td>100 po</td></tr>
          <tr><td>Artificier</td><td>5d4 × 10 po</td><td>125 po</td></tr>
        </table>
      </div>
      <div class="regles-section">
        <div class="pt">💱 Vente d'équipement</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          Un objet se revend à <strong>la moitié de son prix de liste</strong>.<br>
          Les objets magiques et les pierres précieuses trouvent des acheteurs plus difficilement — à la discrétion du MJ.
        </div>
      </div>
    </div>`)}`)}
    ${ds('s-repos',`<div class="regles-section">
      ${dh('s-repos','💤 Repos')}
      ${rb('s-repos',`<table class="regles-table">
        <tr><th></th><th>Repos court (≥ 1h)</th><th>Repos long (≥ 8h)</th></tr>
        <tr><td><strong>PV récupérés</strong></td><td>Dés de vie dépensés + mod CON</td><td>Tous les PV max</td></tr>
        <tr><td><strong>Dés de vie</strong></td><td>Utilisables librement</td><td>Récupère niv/2 (min 1)</td></tr>
        <tr><td><strong>Capacités</strong></td><td>Ki, Magie de pacte, Deuxième Souffle...</td><td>Magie, Rage, quasi-tout</td></tr>
      </table>`)}
    </div>`)}
    ${ds('s-mort',`<div class="regles-section">
      ${dh('s-mort','💀 Jet de sauvegarde contre la mort')}
      ${rb('s-mort',`<div style="font-size:13px;color:var(--text2);line-height:1.8">
        À 0 PV : jets de sauvegarde à chaque tour (1d20, sans modificateur).<br>
        • <strong style="color:#4caf50">10+</strong> → Succès (3 succès = stable, inconscient mais vivant).<br>
        • <strong style="color:#e53935">1-9</strong> → Échec (3 échecs = mort).<br>
        • <strong style="color:#ffd54f">1 naturel</strong> → 2 échecs d'un coup.<br>
        • <strong style="color:#ffd54f">20 naturel</strong> → Retour à 1 PV, debout.<br>
        • Subir des dégâts à 0 PV → 1 échec (ou 2 si corps à corps).
      </div>`)}
    </div>`)}
    ${ds('s-incantation',`${gh('s-incantation','✨ Règles d\'incantation')}
    ${rb('s-incantation',`<div class="g2" style="gap:10px">
      <div class="regles-section">
        <div class="pt">📊 Formules clés</div>
        <table class="regles-table">
          <tr><th>Formule</th><th>Calcul</th></tr>
          <tr><td><strong>DD de sort</strong></td><td>8 + bonus de maîtrise + mod. caractéristique d'incantation</td></tr>
          <tr><td><strong>Bonus d'attaque de sort</strong></td><td>Bonus de maîtrise + mod. caractéristique d'incantation</td></tr>
        </table>
        <div style="font-size:12px;color:var(--text3);margin-top:6px">Caractéristique d'incantation : INT (Magicien), SAG (Clerc/Druide/Rôdeur), CHA (Barde/Paladin/Ensorceleur/Occultiste)</div>
      </div>
      <div class="regles-section">
        <div class="pt">🔄 Concentration</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          Un seul sort à concentration à la fois. Lancer un autre sort à concentration y met fin.<br>
          <strong>Prendre des dégâts</strong> → JS CON (DD = max(10, ½ dégâts reçus)) par source.<br>
          <strong>Incapable d'agir ou mort</strong> → concentration brisée automatiquement.<br>
          MJ peut aussi demander JS CON DD10 pour phénomènes violents (vague, tempête…).
        </div>
      </div>
      <div class="regles-section">
        <div class="pt">📜 Rituels</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          Les sorts avec la mention <strong>rituel</strong> peuvent être lancés sans dépenser d'emplacement.<br>
          La version rituel prend <strong>+10 minutes</strong> de plus que le temps normal.<br>
          Ne peut pas être lancé à un niveau supérieur.<br>
          Nécessite d'avoir le sort préparé (sauf règle spécifique de classe comme le Magicien).
        </div>
      </div>
      <div class="regles-section">
        <div class="pt">🛡 Port d'armure &amp; sorts</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          Pour lancer un sort, tu dois <strong>maîtriser l'armure portée</strong>, sinon l'incantation échoue.<br>
          Concerne les sorts avec composante verbale ou somatique (la quasi-totalité).
        </div>
      </div>
      <div class="regles-section">
        <div class="pt">📐 Zones d'effet</div>
        <table class="regles-table">
          <tr><th>Forme</th><th>Règle</th></tr>
          <tr><td><strong>Cône</strong></td><td>S'élargit depuis toi. Largeur = distance depuis l'origine. Toi non inclus.</td></tr>
          <tr><td><strong>Cube</strong></td><td>Point d'origine = une face du cube. Toi non inclus par défaut.</td></tr>
          <tr><td><strong>Cylindre</strong></td><td>Centre du cercle de base = point d'origine. S'étend en hauteur. Toi inclus.</td></tr>
          <tr><td><strong>Ligne</strong></td><td>S'étend depuis l'origine. Largeur précisée. Toi non inclus.</td></tr>
          <tr><td><strong>Sphère</strong></td><td>Point d'origine = centre. Rayon vers l'extérieur. Toi inclus.</td></tr>
        </table>
        <div style="font-size:12px;color:var(--text3);margin-top:4px">Obstrué par un abri total. Ligne droite du point d'origine vers chaque case — si bloquée, case exclue de la zone.</div>
      </div>
      <div class="regles-section">
        <div class="pt">⚡ Règles spéciales</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          <strong>Action bonus + sort</strong> : si tu lances un sort en action bonus, seul un sort mineur (temps d'incantation 1 action) peut être lancé ce tour-là.<br><br>
          <strong>Lancer à niveau supérieur</strong> : utiliser un emplacement de niveau plus élevé → sort adopte ce niveau (effets souvent améliorés).<br><br>
          <strong>Combiner les effets</strong> : effets de sorts différents se cumulent. Effets du même sort lancé plusieurs fois ne se cumulent pas → le plus puissant s'applique.
        </div>
      </div>
    </div>`)}`)}
    ${ds('s-magie-sauvage',`<div class="regles-section">
      ${dh('s-magie-sauvage','🎲 Magie Sauvage — Table de Sursaut (d100)')}
      ${rb('s-magie-sauvage',`<div style="font-size:12px;color:var(--text3);margin-bottom:8px">Déclenché par <strong>Marée du chaos</strong> ou à la discrétion du MJ après qu'un ensorceleur lance un sort. Lancez 1d100.</div>
      <div style="max-height:320px;overflow-y:auto">
      <table class="regles-table" style="font-size:12px">
        <tr><th style="width:52px">d100</th><th>Effet</th></tr>
        <tr><td>01–02</td><td>Lancez sur ce tableau au début de chacun de vos tours pendant 1 minute (ignorez ce résultat lors des lancers suivants).</td></tr>
        <tr><td>03–04</td><td>Pendant 1 minute, vous voyez toute créature invisible dans votre ligne de vue.</td></tr>
        <tr><td>05–06</td><td>Un modrone contrôlé par le MJ apparaît à 1,50 m de vous, puis disparaît après 1 minute.</td></tr>
        <tr><td style="color:#e53935;font-weight:600">07–08</td><td><strong>Boule de feu</strong> niv. 3 centrée sur vous-même.</td></tr>
        <tr><td>09–10</td><td><strong>Projectile magique</strong> niv. 5.</td></tr>
        <tr><td>11–12</td><td>Lancez 1d10. Votre taille change de ce nombre de cm. Impair = vous rétrécissez, pair = vous grandissez.</td></tr>
        <tr><td style="color:#e53935;font-weight:600">13–14</td><td><strong>Confusion</strong> centrée sur vous-même.</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">15–16</td><td>Pendant 1 minute, vous récupérez 5 PV au début de chacun de vos tours.</td></tr>
        <tr><td>17–18</td><td>Vous faites pousser une barbe de plumes. Elle disparaît quand vous éternuez (les plumes explosent).</td></tr>
        <tr><td style="color:#e53935;font-weight:600">19–20</td><td><strong>Graisse</strong> centrée sur vous-même.</td></tr>
        <tr><td style="color:#e53935;font-weight:600">21–22</td><td>Les créatures ont le désavantage aux JS contre votre prochain sort lancé dans la prochaine minute.</td></tr>
        <tr><td>23–24</td><td>Votre peau devient bleue vif. Un <em>Désenvoûtement</em> met fin à l'effet.</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">25–26</td><td>Un œil apparaît sur votre front pendant 1 minute : avantage aux tests de Perception (vue).</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">27–28</td><td>Pendant 1 minute, vos sorts à temps d'incantation de 1 action deviennent des actions bonus.</td></tr>
        <tr><td>29–30</td><td>Téléportation jusqu'à 18 m vers un espace inoccupé visible.</td></tr>
        <tr><td>31–32</td><td>Transporté dans le Plan Astral jusqu'à la fin de votre prochain tour, puis retour à votre emplacement précédent.</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">33–34</td><td>Maximisez les dégâts du prochain sort d'attaque dans la prochaine minute.</td></tr>
        <tr><td>35–36</td><td>Lancez 1d10. Votre âge change de ce nombre d'années. Impair = rajeunit (min. 1 an), pair = vieillit.</td></tr>
        <tr><td>37–38</td><td>1d6 flumphs contrôlés par le MJ apparaissent dans un rayon de 18 m, effrayés par vous. Disparaissent après 1 minute.</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">39–40</td><td>Vous récupérez 2d10 PV.</td></tr>
        <tr><td style="color:#e53935;font-weight:600">41–42</td><td>Vous devenez une plante en pot jusqu'à votre prochain tour : neutralisé, vulnérabilité à tous les dégâts.</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">43–44</td><td>Pendant 1 minute, téléportation jusqu'à 6 m en action bonus à chaque tour.</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">45–46</td><td><strong>Lévitation</strong> sur vous-même.</td></tr>
        <tr><td>47–48</td><td>Une licorne contrôlée par le MJ apparaît à 1,50 m, disparaît après 1 minute.</td></tr>
        <tr><td>49–50</td><td>Vous ne pouvez pas parler pendant 1 minute (des bulles roses sortent de votre bouche à la place).</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">51–52</td><td>Bouclier spectral pendant 1 minute : +2 CA et immunité aux Projectiles magiques.</td></tr>
        <tr><td>53–54</td><td>Immunité à l'ivresse alcoolique pendant 5d6 jours.</td></tr>
        <tr><td>55–56</td><td>Vos cheveux tombent, mais repoussent en 24 heures.</td></tr>
        <tr><td>57–58</td><td>Pendant 1 minute, tout objet inflammable non porté que vous touchez s'enflamme.</td></tr>
        <tr><td style="color:#e53935;font-weight:600">59–60</td><td>Téléportation jusqu'à 18 m ; toutes les créatures dans l'espace d'arrivée subissent 1d10 dégâts de force.</td></tr>
        <tr><td style="color:#e53935;font-weight:600">61–62</td><td>Vous êtes effrayé par la créature la plus proche jusqu'à la fin de votre prochain tour.</td></tr>
        <tr><td>63–64</td><td>Toutes les créatures dans un rayon de 9 m deviennent invisibles pendant 1 minute (cesse si elles attaquent ou lancent un sort).</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">65–66</td><td>Résistance à tous les dégâts pendant 1 minute.</td></tr>
        <tr><td style="color:#e53935;font-weight:600">67–68</td><td>Une créature aléatoire dans un rayon de 18 m est empoisonnée pendant 1d4 heures.</td></tr>
        <tr><td>69–70</td><td>Lumière vive dans un rayon de 9 m pendant 1 minute. Créature terminant son tour à 1,50 m = aveuglée jusqu'à son prochain tour.</td></tr>
        <tr><td style="color:#e53935;font-weight:600">71–72</td><td><strong>Métamorphose</strong> sur vous-même. En cas d'échec au JS, vous devenez un mouton pour la durée du sort.</td></tr>
        <tr><td>73–74</td><td>Papillons illusoires et pétales de fleurs dans un rayon de 3 m pendant 1 minute (aucun effet mécanique).</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">75–76</td><td>Vous pouvez immédiatement prendre une action supplémentaire.</td></tr>
        <tr><td>77–78</td><td>Chaque créature dans un rayon de 9 m subit 1d10 dégâts nécrotiques. Vous récupérez autant de PV.</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">79–80</td><td><strong>Image miroir</strong>.</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">81–82</td><td><strong>Vol</strong> sur une créature aléatoire dans un rayon de 18 m.</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">83–84</td><td>Vous devenez invisible jusqu'au début de votre prochain tour (ou jusqu'à ce que vous attaquiez ou lanciez un sort).</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">85–86</td><td>Si vous mourez dans la prochaine minute, vous revenez à la vie comme par <em>Réincarnation</em>.</td></tr>
        <tr><td>87–88</td><td>Votre catégorie de taille augmente d'un cran pendant 1 minute.</td></tr>
        <tr><td style="color:#e53935;font-weight:600">89–90</td><td>Vous et toutes les créatures dans un rayon de 9 m gagnez la vulnérabilité aux dégâts perforants pendant 1 minute.</td></tr>
        <tr><td>91–92</td><td>Une musique éthérée vous entoure pendant 1 minute (aucun effet mécanique).</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">93–94</td><td>Vous récupérez votre emplacement de sort dépensé de plus bas niveau.</td></tr>
        <tr><td style="color:#e53935;font-weight:600">95–96</td><td>Pendant 1 minute, vous devez crier quand vous parlez.</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">97–98</td><td>Pendant 1 minute, à chaque sort lancé, le DD augmente de 2.</td></tr>
        <tr><td style="color:var(--cp);font-weight:600">99–00</td><td><strong>Arrêt du temps</strong>.</td></tr>
      </table>
      </div>
      `)}
    </div>`)}
    ${ds('s-rencontres',`<div class="regles-section">
      ${dh('s-rencontres','⚔ Construction de rencontre')}
      ${rb('s-rencontres',`
        <div style="font-size:12px;color:var(--text3);margin-bottom:8px"><strong>Étapes :</strong> 1) Seuils XP du groupe par difficulté · 2) Additionner XP des monstres · 3) Appliquer le multiplicateur · 4) Comparer aux seuils.</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <div style="flex:1;min-width:200px">
            <div style="font-size:12px;font-weight:600;color:var(--text2);margin-bottom:4px">Seuils XP par PJ et par niveau</div>
            <div style="max-height:210px;overflow-y:auto">
            <table class="regles-table" style="font-size:11px">
              <tr><th>Niv.</th><th style="color:#4caf50">Facile</th><th style="color:#ff9800">Moy.</th><th style="color:#f44336">Diff.</th><th style="color:#b71c1c">Mort.</th></tr>
              ${[...Array(20)].map((_,i)=>`<tr><td>${i+1}</td><td>${ENC_THRESHOLDS[i][0]}</td><td>${ENC_THRESHOLDS[i][1]}</td><td>${ENC_THRESHOLDS[i][2]}</td><td>${ENC_THRESHOLDS[i][3]}</td></tr>`).join('')}
            </table>
            </div>
          </div>
          <div style="flex:0 0 auto">
            <div style="font-size:12px;font-weight:600;color:var(--text2);margin-bottom:4px">Multiplicateur</div>
            <table class="regles-table" style="font-size:12px">
              <tr><th>Monstres</th><th>×</th></tr>
              <tr><td>1</td><td>×1</td></tr>
              <tr><td>2</td><td>×1,5</td></tr>
              <tr><td>3–6</td><td>×2</td></tr>
              <tr><td>7–10</td><td>×2,5</td></tr>
              <tr><td>11–14</td><td>×3</td></tr>
              <tr><td>15+</td><td>×4</td></tr>
            </table>
            <div style="font-size:11px;color:var(--text3);margin-top:6px;line-height:1.5"><strong>Budget journalier</strong> :<br>6–8 rencontres Moyennes<br>avant épuisement.</div>
          </div>
        </div>
      `)}
    </div>`)}
    ${ds('s-alterations',`${gh('s-alterations','☣ Maladies, Poisons &amp; Folie')}
    ${rb('s-alterations',`
      <div class="g2" style="gap:10px">
        <div class="regles-section">
          <div class="pt">🤒 Maladies</div>
          <div style="font-size:12px;color:var(--text2);line-height:1.6">
            <strong>Fièvre rieuse</strong> (humanoïdes, gnomes immunisés) — Infection : contact à 3 m d'une victime en crise (JS CON DD 10). Symptômes 1d4h après. Gagne 1 niveau d'épuisement. Stress → JS CON DD 13 : échec = 5 (1d10) dégâts psychiques + incapable 1 min. Repos long : JS CON DD 13, succès = DD − 1d6. DD 0 = guérison. 3 échecs → folie illimitée.<br><br>
            <strong>Peste des égouts</strong> — Morsure de rat ou contact cadavre (JS CON DD 11). Symptômes 1d4 jours. Épuisement, dés de vie donnent ½ PV, 0 PV au repos long. Repos long : JS CON DD 11, échec = +1 épuisement, succès = −1. Niveau 0 = guérison.<br><br>
            <strong>Pourriture oculaire</strong> — Eau contaminée (JS CON DD 15). 1 jour après : −1 aux attaques et jets de vue. Fin de chaque repos long : malus +1. À −5 : aveugle. Guérison : sort ou onguent d'œil vif (3 doses).
          </div>
        </div>
        <div>
          <div class="regles-section" style="margin-bottom:10px">
            <div class="pt">☠ Poisons</div>
            <table class="regles-table" style="font-size:11px">
              <tr><th>Type</th><th>Activation</th></tr>
              <tr><td><strong>Blessure</strong></td><td>Armes, munitions, pièges tranchants/perforants</td></tr>
              <tr><td><strong>Contact</strong></td><td>Peau touchant l'objet enduit</td></tr>
              <tr><td><strong>Ingestion</strong></td><td>Dose entière dans nourriture/boisson</td></tr>
              <tr><td><strong>Inhalation</strong></td><td>Cube 1,5 m (poudre ou gaz, muqueuses)</td></tr>
            </table>
            <div style="max-height:170px;overflow-y:auto;margin-top:6px">
            <table class="regles-table" style="font-size:11px">
              <tr><th>Poison</th><th>Type</th><th>Prix/dose</th></tr>
              <tr><td>Essence éthérée</td><td>Inhalation</td><td>300 po</td></tr>
              <tr><td>Fumées d'othur</td><td>Inhalation</td><td>500 po</td></tr>
              <tr><td>Huile de taggit</td><td>Contact</td><td>400 po</td></tr>
              <tr><td>Larmes de minuit</td><td>Ingestion</td><td>1 500 po</td></tr>
              <tr><td>Malice</td><td>Inhalation</td><td>250 po</td></tr>
              <tr><td>Mucus de charognard</td><td>Contact</td><td>200 po</td></tr>
              <tr><td>Poison de ver pourpre</td><td>Blessure</td><td>2 000 po</td></tr>
              <tr><td>Poison de wiverne</td><td>Blessure</td><td>1 200 po</td></tr>
              <tr><td>Poison drow</td><td>Blessure</td><td>200 po</td></tr>
              <tr><td>Sang d'assassin</td><td>Ingestion</td><td>150 po</td></tr>
              <tr><td>Sérum de vérité</td><td>Ingestion</td><td>150 po</td></tr>
              <tr><td>Teinture pâle</td><td>Ingestion</td><td>250 po</td></tr>
              <tr><td>Torpeur</td><td>Ingestion</td><td>600 po</td></tr>
              <tr><td>Venin de serpent</td><td>Blessure</td><td>200 po</td></tr>
            </table>
            </div>
          </div>
          <div class="regles-section">
            <div class="pt">🧠 Folie</div>
            <div style="font-size:12px;color:var(--text2);line-height:1.5;margin-bottom:6px">JS SAG ou CHA pour résister. Guérison : <em>apaisement des émotions</em> (supprime), <em>restauration partielle</em> (courte/longue), <em>restauration supérieure</em> (illimitée).</div>
            <table class="regles-table" style="font-size:11px">
              <tr><th>Type</th><th>Durée</th><th>Exemples d'effet</th></tr>
              <tr><td><strong>Passagère</strong></td><td>1d10 min</td><td>Paralysé · Incapable + cri · Effrayé · Bégaiement · Attaque la créature la plus proche · Hallucinations (désav. jets) · Inconscient</td></tr>
              <tr><td><strong>Persistante</strong></td><td>1d10×10 h</td><td>Comportement compulsif · Paranoïa (désav. SAG/CHA) · Révulsion · Amnésie partielle · Tremblement (désav. FOR/DEX) · Aveugle ou sourd</td></tr>
              <tr><td><strong>Illimitée</strong></td><td>Jusqu'à guérison</td><td>Alcoolisme · Avarice · Se croit le plus fort · Conviction d'être traqué · Ami imaginaire · Ne prend rien au sérieux</td></tr>
            </table>
          </div>
        </div>
      </div>
    `)}`)}
    ${ds('s-objets-mag',`${gh('s-objets-mag','✨ Objets magiques')}
    ${rb('s-objets-mag',`
      <div class="g2" style="gap:10px">
        <div class="regles-section">
          <div class="pt">Rareté, niveau &amp; prix</div>
          <table class="regles-table" style="font-size:12px">
            <tr><th>Rareté</th><th>Niveau rec.</th><th>Prix indicatif</th></tr>
            ${Object.entries(RARITY_INFO).map(([name,ri])=>`<tr><td><span style="color:${ri.color}">■</span> ${name}</td><td>${ri.level}</td><td>${ri.price}</td></tr>`).join('')}
          </table>
          <div style="font-size:11px;color:var(--text3);margin-top:6px;line-height:1.5">Prix de revente = ½ du prix de liste. Objets consommables (potions, parchemins) = ½ prix.</div>
        </div>
        <div class="regles-section">
          <div class="pt">🔗 Attunement (Lien)</div>
          <div style="font-size:13px;color:var(--text2);line-height:1.7">
            • Maximum <strong>3 objets liés</strong> simultanément.<br>
            • Établir un lien : <strong>repos court</strong> passé en contact avec l'objet.<br>
            • Rompre un lien : <strong>repos court</strong>, ou mort du personnage.<br>
            • Certains objets exigent une condition (classe, alignement, don).<br><br>
            <strong>Catégories d'objets :</strong> Armure · Potion · Anneau · Sceptre · Parchemin · Bâton · Baguette · Arme · Objet merveilleux.<br><br>
            <strong>Objets intelligents</strong> — Possèdent FOR, DEX, CON, INT, SAG, CHA ainsi qu'une personnalité. Peuvent entrer en conflit (jet de CHA contre SAG de l'objet).<br><br>
            <strong>Artefacts</strong> — Objets uniques à propriétés majeures et mineures (bienfaits et fléaux). Ne peuvent être détruits que par des moyens spécifiques.
          </div>
        </div>
      </div>
    `)}`)}
    ${ds('s-pieges',`<div class="regles-section">
      ${dh('s-pieges','🪤 Pièges')}
      ${rb('s-pieges',`
        <div style="font-size:12px;color:var(--text2);margin-bottom:8px;line-height:1.6">
          <strong>Détecter :</strong> SAG (Perception) passive ou active vs DD du piège. <strong>Désamorcer :</strong> INT (Investigation) puis DEX (outils de voleur). Pièges magiques : INT (Arcanes) ou <em>dissipation de la magie</em>.
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <div style="flex:1;min-width:180px">
            <div style="font-size:12px;font-weight:600;color:var(--text2);margin-bottom:4px">DD et bonus d'attaque</div>
            <table class="regles-table" style="font-size:12px">
              <tr><th>Danger</th><th>DD JS</th><th>Bonus att.</th></tr>
              <tr><td>Gênant</td><td>10–11</td><td>+3 à +5</td></tr>
              <tr><td>Dangereux</td><td>12–15</td><td>+6 à +8</td></tr>
              <tr><td>Mortel</td><td>16–20</td><td>+9 à +12</td></tr>
            </table>
          </div>
          <div style="flex:1;min-width:200px">
            <div style="font-size:12px;font-weight:600;color:var(--text2);margin-bottom:4px">Dégâts par niveau</div>
            <table class="regles-table" style="font-size:12px">
              <tr><th>Niveaux PJ</th><th>Gênant</th><th>Dangereux</th><th>Mortel</th></tr>
              <tr><td>1–4</td><td>1d10</td><td>2d10</td><td>4d10</td></tr>
              <tr><td>5–10</td><td>2d10</td><td>4d10</td><td>10d10</td></tr>
              <tr><td>11–16</td><td>4d10</td><td>10d10</td><td>18d10</td></tr>
              <tr><td>17–20</td><td>10d10</td><td>18d10</td><td>24d10</td></tr>
            </table>
          </div>
        </div>
        <div style="font-size:12px;color:var(--text2);margin-top:8px;line-height:1.6">
          <strong>Pièges complexes</strong> — Font un jet d'initiative et agissent à chaque tour (comme un combat). Détection et désarmement identiques aux pièges simples.<br>
          <strong>Exemples :</strong> Aiguille empoisonnée · Chute de filet · Effondrement de plafond · Fléchettes empoisonnées · Fosse (simple/camouflée/à fermeture/hérissée) · Statue soufflant des flammes · Sphère roulante.
        </div>
      `)}
    </div>`)}
    ${ds('s-comparses',`${gh('s-comparses','🤝 Comparses (Sidekicks)')}
    ${rb('s-comparses',`
      <div style="font-size:12px;color:var(--text3);margin-bottom:8px">PNJ spéciaux qui rejoignent le groupe. Le MJ choisit le type ou laisse les joueurs décider. 3 types disponibles :</div>
      <div class="g2" style="gap:10px">
        <div class="regles-section">
          <div class="pt">⚔ Compagnon d'armes</div>
          <div style="font-size:11px;color:var(--text3);margin-bottom:4px">Maîtrise : toutes armures, armes courantes &amp; de guerre, boucliers</div>
          <table class="regles-table" style="font-size:11px">
            <tr><th>Niv.</th><th>PV max</th><th>Capacité</th></tr>
            <tr><td>1</td><td>13 (2d8+4)</td><td>Rôle martial</td></tr>
            <tr><td>2</td><td>19 (3d8+6)</td><td>Second souffle (1d10 + niv, 1×/repos court)</td></tr>
            <tr><td>3</td><td>26 (4d8+8)</td><td>Critique amélioré (19–20)</td></tr>
            <tr><td>4</td><td>32 (5d8+10)</td><td>Amélioration de caractéristique (+2/+1+1)</td></tr>
            <tr><td>5</td><td>39 (6d8+12)</td><td>Bonus de maîtrise +1</td></tr>
            <tr><td>6</td><td>45 (7d8+14)</td><td>Attaque supplémentaire (×2)</td></tr>
          </table>
        </div>
        <div class="regles-section">
          <div class="pt">🎭 Expert</div>
          <div style="font-size:11px;color:var(--text3);margin-bottom:4px">Maîtrise : armes courantes, rapières, épées courtes, armures légères</div>
          <table class="regles-table" style="font-size:11px">
            <tr><th>Niv.</th><th>PV max</th><th>Capacité</th></tr>
            <tr><td>1</td><td>11 (2d8+2)</td><td>Serviable, Outils</td></tr>
            <tr><td>2</td><td>16 (3d8+3)</td><td>Ruse (Foncer/Désengager/Se cacher en bonus)</td></tr>
            <tr><td>3</td><td>22 (4d8+4)</td><td>Expertise (×2 maîtrise sur 2 compétences)</td></tr>
            <tr><td>4</td><td>27 (5d8+5)</td><td>Amélioration de caractéristique (+2/+1+1)</td></tr>
            <tr><td>5</td><td>33 (6d8+6)</td><td>Bonus de maîtrise +1</td></tr>
            <tr><td>6</td><td>38 (7d8+7)</td><td>Attaque supplémentaire (×2)</td></tr>
          </table>
        </div>
        <div class="regles-section">
          <div class="pt">✨ Incantateur</div>
          <div style="font-size:11px;color:var(--text3);margin-bottom:4px">Maîtrise : armes courantes, armures légères. 2 rôles : Guérisseur ou Mage</div>
          <table class="regles-table" style="font-size:11px">
            <tr><th>Niv.</th><th>PV</th><th>Min.</th><th>Sorts</th><th>Emp1</th><th>Emp2</th><th>Capacité</th></tr>
            <tr><td>1</td><td>9 (2d8)</td><td>2</td><td>2</td><td>2</td><td>—</td><td>Rôle magique, Incantation</td></tr>
            <tr><td>2</td><td>13 (3d8)</td><td>2</td><td>2</td><td>2</td><td>—</td><td>+1 sort niv1 (bénédiction ou mains brûlantes)</td></tr>
            <tr><td>3</td><td>18 (4d8)</td><td>2</td><td>3</td><td>3</td><td>—</td><td>+1 sort niv1 (bouclier de la foi ou bouclier)</td></tr>
            <tr><td>4</td><td>22 (5d8)</td><td>3</td><td>3</td><td>3</td><td>—</td><td>Amélioration caract. (+sort mineur)</td></tr>
            <tr><td>5</td><td>27 (6d8)</td><td>3</td><td>4</td><td>4</td><td>2</td><td>Bonus de maîtrise +1 (+sort niv2)</td></tr>
            <tr><td>6</td><td>31 (7d8)</td><td>3</td><td>4</td><td>4</td><td>2</td><td>Sorts mineurs puissants (+mod. incant.)</td></tr>
          </table>
        </div>
      </div>
    `)}`)}
    ${ds('s-compendium',`<div class="regles-section">
      ${dh('s-compendium','📚 Compendium D&D 5e')}
      ${rb('s-compendium',`<div style="font-size:12px;color:var(--text3);margin-bottom:10px">Référence rapide — descriptions en français</div>
      <div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">
        <button class="btn bsm${_mjReglesComp==='classes'?' bprimary':''}" onclick="mjSetReglesComp('classes')">⚔ Classes${CLASSES_DB?' ('+CLASSES_DB.length+')':''}</button>
        <button class="btn bsm${_mjReglesComp==='dons'?' bprimary':''}" onclick="mjSetReglesComp('dons')">🎯 Dons${FEATS_DB?' ('+FEATS_DB.length+')':''}</button>
        <button class="btn bsm${_mjReglesComp==='races'?' bprimary':''}" onclick="mjSetReglesComp('races')">🧬 Races${RACES_DB?' ('+RACES_DB.length+')':''}</button>
        <button class="btn bsm${_mjReglesComp==='historiques'?' bprimary':''}" onclick="mjSetReglesComp('historiques')">📖 Historiques${BACKGROUNDS_DB?' ('+BACKGROUNDS_DB.length+')':''}</button>
        ${_mjReglesComp?'<button class="btn bsm" style="color:#e53935;border-color:#e53935" onclick="mjSetReglesComp(\'\')">✕ Fermer</button>':''}
      </div>
      ${_mjReglesComp?'<input class="fi" id="compSearch" placeholder="Rechercher..." oninput="mjFilterComp(this.value)" style="margin-bottom:8px" autofocus><div id="compResults" style="max-height:300px;overflow-y:auto"></div>':'<div style="font-size:13px;color:var(--text3);font-style:italic">Cliquez sur une catégorie pour rechercher.</div>'}`)}
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
  if(!db){el.innerHTML='<div style="font-size:13px;color:var(--text3);text-align:center;padding:8px">Compendium non chargé — revenez dans un instant.</div>';return;}
  if(!q.trim()){
    el.innerHTML='<div style="font-size:13px;color:var(--text3);text-align:center;padding:8px">Tapez pour rechercher parmi '+db.length+' entrées.</div>';
    return;
  }
  const low=q.toLowerCase();
  const res=[];
  for(let i=0;i<db.length&&res.length<20;i++){
    if(db[i].n&&db[i].n.toLowerCase().includes(low))res.push(db[i]);
  }
  if(!res.length){el.innerHTML='<div style="font-size:13px;color:var(--text3);text-align:center;padding:8px">Aucun résultat.</div>';return;}
  el.innerHTML=res.map(e=>{
    let meta='';
    if(e.ab)meta+=` · <span style="color:var(--cp)">${esc(e.ab)}</span>`;
    if(e.spd)meta+=` · Vit. ${esc(e.spd)} ft`;
    if(e.sk)meta+=` · Comp. : ${esc(_parseCompBGSkills(e.sk).join(', '))||esc(e.sk)}`;
    if(e.hd)meta+=` · d${esc(e.hd)} (dé de vie)`;
    if(e.ar)meta+=` · Armures : ${esc(e.ar)}`;
    if(e.wp)meta+=` · Armes : ${esc(e.wp)}`;
    return`<div style="border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:6px;background:var(--surface2)">
      <div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:4px">${esc(e.n)}</div>
      ${meta?`<div style="font-size:12px;color:var(--text3);margin-bottom:4px">${meta}</div>`:''}
      <div style="font-size:12px;color:var(--text2);line-height:1.5">${esc(e.tx||'')}</div>
    </div>`;
  }).join('');
}
