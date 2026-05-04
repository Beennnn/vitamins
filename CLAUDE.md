# vitamins — instructions Claude

Outil personnel pour décharger la logistique des compléments alimentaires : suivi de stock, commandes pré-remplies (validées manuellement), calendar des pickups relais, notifs smartphone (iOS / Android), log quotidien des prises par tap.

## Domaine en un coup d'œil

| Entité | Rôle |
|---|---|
| `Product` | Un complément (vitamine D, magnésium, etc.) avec dose journalière prescrite + units/pack + vendeur préféré + prix max accepté |
| `Stock` | Quantité actuelle d'un produit (compteur ajustable manuellement, décrémenté par `IntakeLog`) |
| `IntakeLog` | Une prise réelle confirmée par l'utilisateur via tap (product_id, taken_at, dose) — c'est la source de vérité de la consommation |
| `Order` | Une commande en cours (du panier au pickup fini) — toujours validée manuellement avant placement |
| `Relais` | Point de retrait (Mondial Relay / Colissimo / Chronopost) avec adresse + deadline |
| `OrderAllowlist` | Règle pré-autorisée (product + vendor + max_price + min_days_between_orders) — valide la pré-commande, mais l'achat reste à confirmer |

## Flux principaux

1. **Tap-to-log quotidien** : l'utilisateur reçoit une notif "as-tu pris tes vitamines ?" → tape le bouton de chaque produit pris → `IntakeLog` créé → `Stock` décrémenté.
2. **Prédiction stockout** : moyenne glissante des `IntakeLog` (7-14 j) projette la rupture par produit.
3. **Reorder trigger** : `stockout_date - lead_time - safety_margin = aujourd'hui` → notif "commande à passer" + ouverture d'un draft de commande.
4. **Commande pré-remplie** : Playwright headless ouvre le site vendeur, ajoute au panier, **stoppe avant validation**, envoie un push avec lien "Valider [URL]". L'utilisateur clique = checkout.
5. **Pickup tracking** : IMAP poll Gmail détecte "colis arrivé au relais" → Google Calendar event créé + push smartphone (iOS / Android).
6. **Pickup deadline** : J-3 / J-1 avant que le relais renvoie le colis → push smartphone (iOS / Android).

## Garde-fous non négociables

- **Aucune commande sans validation manuelle**. Même avec une `OrderAllowlist` qui pré-autorise (vendeur + produit + prix max + fréquence min), chaque achat envoie un push pour validation explicite. Pas de "full auto" V1, V2, ou V3.
- **Stock = log réel, pas prescription théorique**. Le décrément se fait par tap utilisateur, pas par calcul `dose × jours`. La prescription sert uniquement au démarrage (bootstrap stockout-date) et au calcul de moyenne attendue.
- **Credentials vendeurs chiffrés**. Si on stocke des login/password vendeur pour Playwright, c'est en keychain OS ou env var avec rotation, jamais en clair dans le repo.

## Architecture — encore ouverte

3 options listées dans [docs/architecture.md](docs/architecture.md). Décision pas prise. Recommandation initiale : **Option B** (backend Python + frontend mobile-first) car c'est la seule qui débloque les features qui font 80 % de la valeur (auto-order draft + IMAP relais + cron jobs). À discuter avec Benoît après remplissage du questionnaire de scope.

## Intégrations prévues

Listées dans [docs/integrations.md](docs/integrations.md) :
- **Google Calendar API** — events pickup
- **IMAP Gmail** — détection "colis arrivé"
- **HA Companion app push** — notifs smartphone (iOS / Android) (déjà installée chez Benoît)
- **Playwright** — pré-remplissage panier vendeur (V1 = draft, jamais full auto)

## Scope à figer

[docs/scope-questionnaire.md](docs/scope-questionnaire.md) liste les questions à poser avant le premier code commit, et inclut un Google Apps Script à coller dans script.google.com pour générer le Form correspondant. Le formulaire couvre : produits pris (nom / dose / units par boîte / vendeur / fréquence / prix), habitudes pickup, préférences tech, niveau d'auto-order accepté, tap-to-log oui/non.

## Conventions

- Branche stable : `main`. Branche de travail : `dev` (à créer au premier feature commit).
- Commits : Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).
- Pas de stack figée encore — voir `docs/architecture.md`.

Pour le reste (git safety, file length hygiene, comments style, etc.), voir `~/.claude/CLAUDE.md` (règles globales).
