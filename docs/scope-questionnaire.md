# Scope questionnaire

Avant le premier code commit, on figure le scope. Le questionnaire couvre :

- **Tes produits actuels** (concret : nom, dose, contenu boîte, vendeur, prix)
- **Ton quotidien et tes oublis** (qualitatif : où ça te prend la tête)
- **Pickup colis** (relais habituels, source des notifs livraison)
- **Ton idéal** (scénario décharge mentale rêvé)
- **Contraintes tech** (hosting, support cible)
- **Multi-user / multi-device / backup**
- **V1 minimum + libre**

L'esprit : pas un tableau Excel à remplir, mais des **paragraphes en mots libres** pour qu'on capte la nuance et les détails qu'on n'aurait pas anticipés. La majorité des questions sont des zones de texte ouvertes — quelques choix multiples seulement pour les forks tech clairs.

Compte ~15 minutes.

## Comment générer le Form

Le contenu de [scope-questionnaire-form.gs](scope-questionnaire-form.gs) est un Google Apps Script qui crée le Form quand tu le colles dans `script.google.com`.

**Étapes** :

1. Ouvre [https://script.google.com/create](https://script.google.com/create) (Chrome déjà connecté à ton Google).
2. Sélectionne tout le code par défaut (`Cmd+A`) et remplace-le par le contenu de [scope-questionnaire-form.gs](scope-questionnaire-form.gs) (`Cmd+V`).
3. Renomme le projet : "vitamins-scope-form".
4. Clique sur ▶ "Run" (vérifie que la fonction sélectionnée est `createScopeQuestionnaire`).
5. Apps Script demande l'autorisation d'accéder à ton compte Google (créer Forms + Drive) → accepte.
6. Le Form est créé. L'URL apparaît dans le panneau "Execution log" (en bas).
7. Ouvre l'URL pour répondre, ou édite le Form pour l'envoyer à un répondant.

## Sections du Form

1. **Tes vitamines / compléments aujourd'hui** — produits, doses, vendeurs, prix, fréquence, irrégularités, produits que tu changes parfois de marque.
2. **Ton quotidien et tes oublis** — la dernière fois où ça t'a pris la tête, les moments dans la semaine où tu y penses, ta routine de prise.
3. **Pickup relais colis** — flux complet d'une commande, relais habituels, source des notifs transporteur.
4. **Comment tu imagines l'idéal** — scénario décharge mentale rêvé, niveau d'autonomie pour les achats, modalité du tap-to-log.
5. **Contraintes techniques** — hosting backend, support cible (PWA / native / web), contraintes particulières.
6. **Utilisateurs, supports, durabilité** — mono ou multi-user, supports (iPhone / iPad / Mac / Watch), criticité du backup.
7. **V1 et ouverture libre** — top 3 features V1, et tout ce qui te passe par la tête qu'on n'a pas anticipé.
8. **Champ libre** — zone totalement non-prompted, sans cadre, pour tout ce qui ne rentre dans aucune section.

## Ensuite

Une fois rempli, tu m'envoies l'URL des réponses (Form → Réponses → Voir dans Sheets) et on rentre dans :
1. Choix d'archi (PWA seule / backend + front / native) — voir [architecture.md](architecture.md).
2. Choix d'hosting si backend retenu.
3. Modélisation domaine selon les produits réellement suivis.
4. Premier sprint de code.
