/**
 * vitamins — Google Apps Script générateur de questionnaire de scope
 *
 * Deux fonctions :
 *
 *  - createScopeQuestionnaire() : crée un NOUVEAU Form et le remplit.
 *  - populateScopeQuestionnaire() : remplit un Form EXISTANT (FORM_ID
 *    en constante en tête de cette fonction) — utilise ça si tu as déjà
 *    créé un Form vide à la main.
 *
 * Usage :
 *   1. Ouvrir https://script.google.com/create (Chrome connecté à Google).
 *   2. Cmd+A puis Cmd+V pour remplacer le code par défaut.
 *   3. Renommer le projet "vitamins-scope-form".
 *   4. Choisir la fonction (createScopeQuestionnaire ou populateScopeQuestionnaire).
 *   5. ▶ Run → Autoriser l'accès Forms + Drive.
 *   6. L'URL du Form apparaît dans "Execution log".
 *
 * Lien repo : https://github.com/Beennnn/vitamins
 *
 * Esprit du questionnaire : zones de texte larges pour recueil de besoin pas
 * trop formaté. On laisse parler le répondant en mots libres ; quelques QCM
 * seulement pour les forks tech clairs.
 */

// ID du Form vide créé par Benoît à populate (utilisé par populateScopeQuestionnaire)
var EXISTING_FORM_ID = '1tDnp7ddTo6JCyraTZguygs9BiCXZYbF5GbafRrc9HRI';

function populateScopeQuestionnaire() {
  var form = FormApp.openById(EXISTING_FORM_ID);
  // Wipe existing items (au cas où un placeholder par défaut existe)
  var existing = form.getItems();
  for (var i = existing.length - 1; i >= 0; i--) {
    form.deleteItem(existing[i]);
  }
  form.setTitle('Vitamins — questionnaire de scope');
  applyDescription(form);
  addAllItems(form);

  var responseUrl = form.getPublishedUrl();
  var editUrl = form.getEditUrl();
  Logger.log('═══════════════════════════════════════════════');
  Logger.log('FORM EXISTANT POPULÉ AVEC SUCCÈS');
  Logger.log('═══════════════════════════════════════════════');
  Logger.log('URL pour répondre : ' + responseUrl);
  Logger.log('URL pour éditer   : ' + editUrl);
  Logger.log('Repo GitHub       : https://github.com/Beennnn/vitamins');
  Logger.log('═══════════════════════════════════════════════');
}

function createScopeQuestionnaire() {
  var form = FormApp.create('Vitamins — questionnaire de scope');
  applyDescription(form);
  addAllItems(form);

  var responseUrl = form.getPublishedUrl();
  var editUrl = form.getEditUrl();
  Logger.log('═══════════════════════════════════════════════');
  Logger.log('FORM CRÉÉ AVEC SUCCÈS');
  Logger.log('═══════════════════════════════════════════════');
  Logger.log('URL pour répondre : ' + responseUrl);
  Logger.log('URL pour éditer   : ' + editUrl);
  Logger.log('Repo GitHub       : https://github.com/Beennnn/vitamins');
  Logger.log('═══════════════════════════════════════════════');
}

function applyDescription(form) {
  form.setDescription(
    'Questionnaire pour figer le scope de l\'outil "vitamins" — un système qui aide à gérer ' +
    'les vitamines / compléments alimentaires : suivi de stock, commandes auto-préparées (validation manuelle), ' +
    'pickup relais colis dans l\'agenda, notifs iPhone, log quotidien des prises par tap.\n\n' +
    'Repo : https://github.com/Beennnn/vitamins\n\n' +
    'L\'idée n\'est PAS de cocher des cases mais de raconter en mots libres ce qui te prend la tête ' +
    'aujourd\'hui et comment tu rêverais que ça se passe. Compte ~15 minutes. ' +
    'Toutes les questions sont optionnelles ; saute si pas pertinent.'
  );

  form.setCollectEmail(false)
      .setLimitOneResponsePerUser(false)
      .setShowLinkToRespondAgain(false)
      .setRequireLogin(false);
}

function makeFormPublic() {
  var form = FormApp.openById(EXISTING_FORM_ID);
  form.setRequireLogin(false);
  form.setAcceptingResponses(true);
  Logger.log('Form rendu public — anyone with link peut répondre.');
  Logger.log('URL : ' + form.getPublishedUrl());
}

function addAllItems(form) {
  // ───────────────────────────────────────────────────────────────────────
  // SECTION 1 — TES PRODUITS AUJOURD'HUI
  // ───────────────────────────────────────────────────────────────────────
  form.addSectionHeaderItem()
    .setTitle('1. Tes vitamines / compléments aujourd\'hui')
    .setHelpText('Donne-moi le contenu de tes étagères / placards, pas un tableau Excel.');

  form.addParagraphTextItem()
    .setTitle('Quels produits tu prends actuellement ? Raconte-les comme tu les présenterais à un proche.')
    .setHelpText(
      'Pour chaque produit, donne ce qui te vient : nom (commercial ou générique), marque, ' +
      'quelle dose tu prends et à quelle fréquence (1×/jour, 1 cure de 3 mois /an, etc.), ' +
      'combien d\'unités dans la boîte, où tu les commandes (site, magasin), ' +
      'combien tu paies, et ce qui te ferait dire "stop, c\'est trop cher".\n\n' +
      'Ne te formalise pas — un produit par paragraphe, des notes en vrac, c\'est parfait.'
    );

  form.addParagraphTextItem()
    .setTitle('Y a-t-il des produits que tu prends de façon irrégulière ou en cure ?')
    .setHelpText('Ex : "magnésium seulement quand je sens que je dors mal", "vitamine D 6 mois /an l\'hiver".');

  form.addParagraphTextItem()
    .setTitle('Quels produits tu changes parfois de marque / vendeur, et pourquoi ?')
    .setHelpText('Important pour savoir ce qui ne pourra JAMAIS être en auto-order draft.');

  // ───────────────────────────────────────────────────────────────────────
  // SECTION 2 — TON QUOTIDIEN ET LES OUBLIS
  // ───────────────────────────────────────────────────────────────────────
  form.addSectionHeaderItem()
    .setTitle('2. Ton quotidien et tes oublis')
    .setHelpText('Plus c\'est concret, mieux je comprends ce qui te prend la tête.');

  form.addParagraphTextItem()
    .setTitle('Raconte-moi la dernière fois où ça t\'a pris la tête.')
    .setHelpText(
      'Stock vide d\'un coup ? Colis oublié au relais qui est reparti ? Plusieurs commandes en parallèle ' +
      'que tu mélangeais ? Tu as commandé en double parce que tu pensais avoir oublié ? ' +
      'Le détail concret m\'aide à prioriser ce qui doit absolument marcher en V1.'
    );

  form.addParagraphTextItem()
    .setTitle('À quels moments de la journée / semaine tu penses "merde, je dois m\'occuper de mes vitamines" ?')
    .setHelpText('Ex : "le dimanche soir je liste ce qu\'il manque", "à chaque flacon vide je panique 5 min".');

  form.addParagraphTextItem()
    .setTitle('Tes prises quotidiennes : routine fixe ou anarchique ?')
    .setHelpText(
      'Tu prends à heure fixe (matin / midi / soir) ? Ça dépend des produits ? Tu oublies souvent ? ' +
      'Tu prends parfois en double ? Avec ou sans repas ?'
    );

  // ───────────────────────────────────────────────────────────────────────
  // SECTION 3 — PICKUP RELAIS COLIS
  // ───────────────────────────────────────────────────────────────────────
  form.addSectionHeaderItem()
    .setTitle('3. Pickup relais colis');

  form.addParagraphTextItem()
    .setTitle('Comment se passe une commande de A à Z aujourd\'hui ?')
    .setHelpText(
      'De "je commande" à "j\'ai le produit en main" : combien de jours, combien d\'étapes, ' +
      'combien de relais différents, combien d\'emails, est-ce que tu tracks ou tu attends ' +
      'que le colis arrive, qu\'est-ce qui te fait galérer.'
    );

  form.addParagraphTextItem()
    .setTitle('Quels relais tu utilises le plus ? (nom, ville approximative, transporteur)')
    .setHelpText('Ex : "Mondial Relay tabac rue Jean Jaurès Limoges", "Colissimo bureau de poste centre".');

  form.addParagraphTextItem()
    .setTitle('Tu reçois les notifs des transporteurs comment ?')
    .setHelpText(
      'Sur quelle adresse mail ? SMS ? App du transporteur ? Tu lis les emails vite ' +
      'ou ils s\'accumulent ? Y a-t-il déjà un colis qui t\'a échappé parce que tu n\'as pas ' +
      'vu l\'email à temps ?'
    );

  // ───────────────────────────────────────────────────────────────────────
  // SECTION 4 — COMMENT TU IMAGINES L'IDÉAL
  // ───────────────────────────────────────────────────────────────────────
  form.addSectionHeaderItem()
    .setTitle('4. Comment tu imagines l\'idéal');

  form.addParagraphTextItem()
    .setTitle('Si une baguette magique faisait disparaître la charge mentale, ça ressemblerait à quoi ?')
    .setHelpText(
      'Tu reçois une notif et tu cliques OK ? Un événement apparaît dans ton agenda ? ' +
      'Tu ne penses plus à rien jusqu\'à ce qu\'on te dise "récupère ton colis" ? ' +
      'Décris le scénario rêvé.'
    );

  form.addParagraphTextItem()
    .setTitle('Quel niveau d\'autonomie tu donnes au système pour acheter à ta place ?')
    .setHelpText(
      'Plusieurs niveaux possibles :\n' +
      '— Niveau 0 : juste un rappel "à commander", je fais à la main.\n' +
      '— Niveau 1 : le système prépare un panier sur le site vendeur, je clique "Valider" pour finaliser.\n' +
      '— Niveau 2 : si dans une allowlist (vendeur + produit + prix max + fréquence min), il commande seul et m\'avertit après.\n\n' +
      'Quoi que tu choisisses, le pacte est : aucun achat passé sans que tu aies validé une fois. ' +
      'Décris ce qui te met à l\'aise et ce qui te ferait flipper.'
    );

  form.addParagraphTextItem()
    .setTitle('Pour le tap-to-log quotidien (confirmer "j\'ai pris X aujourd\'hui"), tu vois ça comment ?')
    .setHelpText(
      'Notif iPhone avec quick-action ? Page web ouverte le matin ? Widget sur l\'écran d\'accueil ? ' +
      'Apple Watch ? Combinaison ? Ou tu n\'en veux pas et tu préfères que le système devine seul ?'
    );

  // ───────────────────────────────────────────────────────────────────────
  // SECTION 5 — CONTRAINTES TECH
  // ───────────────────────────────────────────────────────────────────────
  form.addSectionHeaderItem()
    .setTitle('5. Contraintes techniques');

  form.addMultipleChoiceItem()
    .setTitle('Tu acceptes d\'héberger un backend ?')
    .setChoiceValues([
      'Oui, sur un VPS perso (€3-5/mo)',
      'Oui, sur Cloud Run / Fly.io free tier',
      'Oui, sur un Raspberry Pi à la maison',
      'Non, je veux 100 % local sur le téléphone',
      'Pas d\'avis, recommande-moi'
    ])
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('Tu veux le système où ?')
    .setChoiceValues([
      'Web app dans le navigateur iPhone',
      'PWA installable iPhone (ajout à l\'écran d\'accueil)',
      'App native iPhone',
      'Plusieurs supports en parallèle',
      'Pas d\'avis, recommande-moi'
    ])
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('Y a-t-il des contraintes particulières que je n\'aurais pas devinées ?')
    .setHelpText(
      'Ex : "je n\'ai pas confiance pour stocker mes credentials Amazon", ' +
      '"je veux que ça marche sans réseau pendant 24h", ' +
      '"je n\'utilise pas Gmail", "j\'ai pas de Mac dispo H24", etc.'
    );

  // ───────────────────────────────────────────────────────────────────────
  // SECTION 6 — UTILISATEURS / SUPPORTS / BACKUP
  // ───────────────────────────────────────────────────────────────────────
  form.addSectionHeaderItem()
    .setTitle('6. Utilisateurs, supports, durabilité');

  form.addMultipleChoiceItem()
    .setTitle('Combien d\'utilisateurs vont l\'utiliser ?')
    .setChoiceValues([
      '1 (juste moi)',
      '2 (moi + conjoint·e)',
      '3+ (famille élargie)',
      'Pas sûr — peut-être plus tard'
    ])
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('Si plusieurs utilisateurs, comment tu vois la séparation ?')
    .setHelpText('Stocks séparés ? Notifs séparées ? Allowlist d\'achat partagée ?');

  form.addCheckboxItem()
    .setTitle('Sur quels supports tu veux y accéder ?')
    .setChoiceValues([
      'iPhone (web ou app)',
      'iPad',
      'Mac (Chrome / Safari)',
      'Apple Watch',
      'Aucun, juste les notifs me suffisent'
    ])
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('Si tu perds toutes les données du système demain, c\'est grave ?')
    .setHelpText(
      'Aide à choisir le niveau de backup : critique (backup auto cloud quotidien) ? ' +
      'important mais pas vital (export JSON manuel) ? OK je re-saisis (10 produits max) ?'
    );

  // ───────────────────────────────────────────────────────────────────────
  // SECTION 7 — V1 + OUVERTURE LIBRE
  // ───────────────────────────────────────────────────────────────────────
  form.addSectionHeaderItem()
    .setTitle('7. V1 et ouverture libre');

  form.addParagraphTextItem()
    .setTitle('Si tu devais lister 3 features qui doivent ABSOLUMENT marcher en V1, lesquelles ?')
    .setHelpText('Le reste pourra suivre. Aide à savoir où concentrer l\'effort initial.');

  form.addParagraphTextItem()
    .setTitle('Quoi d\'autre que je n\'ai pas anticipé ?')
    .setHelpText(
      'Tout ce qui te passe par la tête : feature, contrainte, peur, idée folle, intégration ' +
      'à laquelle tu n\'avais pas pensé, ami·e qui pourrait l\'utiliser, lien avec un autre outil...'
    );

  // ───────────────────────────────────────────────────────────────────────
  // SECTION 8 — CHAMP LIBRE FINAL
  // ───────────────────────────────────────────────────────────────────────
  form.addSectionHeaderItem()
    .setTitle('8. Champ libre')
    .setHelpText('Pour tout ce qui ne rentre dans aucune des sections précédentes.');

  form.addParagraphTextItem()
    .setTitle('Vas-y.')
    .setHelpText('Pas de cadre, pas de prompt — c\'est à toi. Vrac, listes, anecdotes, dessins en ASCII, tout est bon.');

}
