# vitamins — TASKS

## 🤔 Décisions à prendre AVANT le premier code commit

- 🤔 **Remplir le questionnaire de scope** → cf. [docs/scope-questionnaire.md](docs/scope-questionnaire.md). Sans ça, on ne sait pas quels produits suivre, quel host, quelles intégrations prioriser. **Bloque tout le reste.**
- 🤔 **Choisir l'architecture** → 3 options dans [docs/architecture.md](docs/architecture.md) : PWA seule / backend Python + front / native iPhone. Reco initiale = backend Python.
- 🤔 **Choisir le canal de notif iPhone** → HA Companion (déjà installée) / Pushover / ntfy.sh / email simple.
- 🤔 **Choisir le hosting backend** → VPS perso / Cloud Run free tier / Raspberry Pi local / autre. Lié au choix d'archi.
- 🤔 **Décider du modèle de tap-to-log** → notif quotidienne à heure fixe / widget iPhone / page web ouverte au refresh / 3 en parallèle.
- 🤔 **Mono ou multi-utilisateur** → si conjoint·e ou enfants suivent aussi des compléments, le data model change (ajout `User` + scoping).
- 🤔 **Mono ou multi-support** → uniquement iPhone ? iPhone + web depuis Mac ? Apple Watch ? Lié au choix d'UI.
- 🤔 **Backup et durabilité** → SQLite local backupé S3 ? Cloud-first (Firestore / Supabase) ? Export JSON manuel ? Tolérance perte de données ?

## ☐ V1 — modélisation domaine (après scope figé)

- ☐ Schéma `Product` (name, brand, daily_dose, units_per_pack, vendor_url, lead_time_days, max_price)
  → base pour la prédiction de rupture et l'auto-order
- ☐ Schéma `Stock` (product_id, units_on_hand, last_count_date)
  → état actuel des étagères, ajustable manuellement
- ☐ Schéma `IntakeLog` (product_id, taken_at, dose, source: tap | manual_correction)
  → source de vérité de la consommation, décrémente Stock
- ☐ Schéma `Order` (product_id, vendor, quantity, ordered_at, tracking_number, relais_id, status, expected_pickup_window)
  → tracker du panier au pickup
- ☐ Schéma `Relais` (carrier, name, address, opening_hours, deadline_days, lat, lng)
  → données pour le calendar event + Maps deeplink
- ☐ Schéma `OrderAllowlist` (product_id, vendor, max_price, min_days_between_orders)
  → règles pré-autorisées, mais validation manuelle reste obligatoire à chaque achat

## ☐ V1 — features cœur

- ☐ Daily tap reminder + endpoint POST `/intake` qui crée `IntakeLog`
  → décharge la mémoire utilisateur, alimente la conso réelle
- ☐ Calcul stockout-date par produit (moyenne 7-14 j IntakeLog)
  → alerte avant rupture, base de l'auto-order
- ☐ Reorder trigger : `stockout_date - lead_time - safety_margin = today`
  → savoir quand commander
- ☐ Pickup tracker : list ordres `at_relais` avec deadline approchant
  → ne pas oublier d'aller chercher
- ☐ Calendar event creator : Google Calendar API, événement "Récupérer X chez Y" avec adresse + deadline
  → décharge mentale principale
- ☐ Push notif iPhone pour : tap reminder / reorder / arrived / deadline-soon
  → atteindre le user où qu'il soit

## ☐ V1 — intégrations

- ☐ Google Calendar API : OAuth + event create
  → réutiliser projet `home-assistant-495021` ? À décider.
- ☐ IMAP poll Gmail : parser emails Mondial Relay / Colissimo / Chronopost
  → détection automatique colis arrivé
- ☐ HA Companion notify ou Pushover : push iPhone
  → choix selon questionnaire scope
- ☐ Playwright pré-remplissage panier vendeur (V1 = draft, jamais auto)
  → réduire la friction au minimum, garder l'humain en boucle

## ☐ V1 — UI

- ☐ Vue stock : tableau avec rupture-date par produit, code couleur (vert > 30j, orange 7-30j, rouge < 7j)
- ☐ Vue commandes en cours : avec relais + deadline + lien Maps
- ☐ Boutons quick-tap "j'ai pris X" pour chaque produit (vue principale au refresh quotidien)
- ☐ Bouton "valider draft order" : un clic = checkout

## 🚫 V2 / V3 — différé

- V2 : Multi-utilisateur (si conjoint·e suit aussi des compléments)
- V2 : Apple Watch complication (tap depuis le poignet)
- V2 : Comparaison prix multi-vendeur en temps réel
- V3 : Conso ajustée par feedback "j'ai sauté un jour" / "j'ai pris une dose double"
- V3 : Wrap PWA → App Store via PWABuilder

## 🚫 Hors scope (jamais)

- **Auto-order full** sans confirmation utilisateur — garde-fou non négociable.
- Multi-tenant SaaS (c'est un outil perso).
- Intégration assurance santé / médecin (out of personal logistics scope).
