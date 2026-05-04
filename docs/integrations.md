# Intégrations — design notes

4 systèmes externes à câbler. Notes par intégration.

## 1. Google Calendar API

**But** : créer un événement "Récupérer [produit] chez [relais]" dès qu'un colis arrive au relais. L'événement contient :
- Titre : `Récupérer [produit] chez [relais.name]`
- Localisation : `[relais.address]` → deeplink Maps natif depuis l'agenda
- Heure de début : aujourd'hui
- Heure de fin : `relais.deadline` (date au-delà laquelle le colis repart)
- Description : numéro de tracking + lien vers la fiche produit / commande dans le système
- Rappels : J-3 + J-1 + jour J matin

**OAuth** : option de réutiliser le projet Google `home-assistant-495021` (déjà configuré chez Benoît cf. `~/.claude/projects/.../memory/project_google_assistant_sdk_setup.md`) ou en créer un dédié. Réutiliser = pas de re-validation OAuth screen ; séparer = scope isolé. À décider.

**Scope minimum** : `https://www.googleapis.com/auth/calendar.events` — créer/modifier des events seulement, pas lire le calendrier complet. Principe du moindre privilège.

**Refresh token** : à stocker en local backend ou env var. Pas de PII, mais token = accès calendar — protéger comme un secret (chiffrement au repos si possible).

## 2. IMAP poll Gmail

**But** : détecter automatiquement les emails "colis arrivé au relais" envoyés par Mondial Relay / Colissimo / Chronopost / DPD.

**Approche** : poll Gmail via IMAP IDLE toutes les 15 min (compromis entre réactivité et load).

**Filtre `from:` initial** :
- `noreply@mondialrelay.com`
- `colissimo@laposte.fr`
- `chronopost@chronopost.com`
- À étoffer selon usage Benoît (cf. questionnaire scope)

**Parsing du body** (HTML ou texte) pour extraire :
- Numéro de tracking (souvent dans le subject)
- Nom du relais
- Adresse du relais
- Deadline (souvent absente — calculer = `delivered_at + 7d` par défaut, à confirmer par transporteur)

**Auth Gmail** : OAuth XOAUTH2 (pas un mot de passe d'app — Google les phase out). Réutiliser le même projet Google que Calendar.

**Risque** : changement de format des emails = parser cassé. Stratégie :
- 1 fixture email par transporteur dans `tests/fixtures/relay_emails/`
- Test unitaire qui passe la fixture au parser
- Alerte (push) si parser échoue 3× d'affilée sur de nouveaux emails

**Alternative low-tech** : adresse Gmail dédiée + filtre Gmail "transférer à un endpoint" + webhook backend. Plus simple si on tolère 1× /h de latence.

## 3. HA Companion app — push smartphone (iOS et Android)

**But** : notifs sur le smartphone de chaque utilisateur pour : reorder à faire, colis arrivé, deadline approchant, tap reminder daily, validation order. Marche aussi bien sur iOS (APNs) que sur Android (FCM) — l'app Companion HA est cross-platform.

**Approche** : Home Assistant a `notify.mobile_app_<device>` qui pousse direct via APNs (iOS) ou FCM (Android) — c'est transparent côté serveur, le device_id détermine le canal. L'app Companion est déjà installée chez Benoît côté iOS (cf. `feedback_no_test_via_real_actions.md` en memory). Pour un répondant Android, il suffit d'installer la même app (gratuite sur Play Store) et de la connecter au même HA.

**API** : POST sur `https://<ha-url>/api/services/notify/mobile_app_<device>` :
```json
{
  "title": "Colis arrivé chez Mondial Relay Carrefour Limoges",
  "message": "Récupère ton magnésium avant le 12 mai. Tap pour Maps.",
  "data": {
    "url": "https://maps.google.com/?q=...",
    "actions": [
      { "action": "PICKUP_DONE", "title": "✅ Récupéré" },
      { "action": "PICKUP_LATER", "title": "⏰ Rappelle-moi demain" }
    ],
    "push": { "category": "vitamins_pickup" }
  }
}
```

**Auth** : long-lived access token HA, en env var `HA_TOKEN`.

**Quick actions** : iOS supporte des `actions` dans la notif (long-press). Permet :
- Tap reminder : "✅ J'ai pris" sans ouvrir l'app
- Pickup deadline : "✅ Récupéré" / "⏰ Demain"
- Order draft : "✅ Valider" / "❌ Annuler"

**Fallback** : si HA down ou réseau local pas disponible, Pushover en backup ($5 one-shot, fiable, app iOS dispo).

## 4. Playwright — auto-order draft (V1)

**But** : dès qu'un produit approche stockout, ouvrir le site vendeur, ajouter au panier, **stopper avant validation**, retourner l'URL panier pour validation 1-clic depuis la notif.

**Stack** : Playwright Python (cohérent si backend Python). Headless Chromium, fingerprint réaliste, attente nav explicite.

**Vendeurs cibles V1** : à lister selon questionnaire scope. Probablement 1-3 vendeurs (Anastore, iHerb, marque directe, Amazon).

**Auth** :
- Credentials par vendeur stockés en keychain OS ou env var (jamais en clair dans repo).
- Login via Playwright = `page.fill` username/password.
- 2FA : si SMS, demande à Benoît d'autoriser une session longue ; si TOTP, stocker la seed en keychain.

**Flux V1 (draft only)** :
1. Login automatique sur le site vendeur.
2. Ajouter `Product` cible au panier.
3. Naviguer jusqu'à la page panier.
4. Capturer l'URL du panier (souvent persistée à la session login).
5. Logout.
6. Push smartphone (iOS / Android) : "Panier prêt — Valider en 1 clic [URL]".
7. **Stop**. L'humain finalise.

**Risque** : changement UI du site vendeur = script cassé. Stratégie :
- 1 test smoke par vendeur (login + add-to-cart + URL panier extrait), exécuté daily.
- Alerte (push) si test smoke échoue → script à mettre à jour.

**V2 (différé)** : checkout auto + paiement, **strictement gardé par allowlist + cap quotidien** + validation manuelle restant obligatoire à chaque achat.

**V3 (différé)** : comparateur prix multi-vendeurs en temps réel.

## Sécurité — récap

| Secret | Stockage | Rotation |
|---|---|---|
| Refresh token Google (Calendar + Gmail) | Env var ou keychain OS | À chaque révocation manuelle |
| HA long-lived access token | Env var `HA_TOKEN` | Tous les 6 mois |
| Credentials vendeurs Playwright | Keychain OS (macOS Keychain, Linux GNOME Keyring) ou env var chiffrée | À chaque changement password vendeur |
| TOTP seeds 2FA vendeurs | Keychain OS | Ne tourne pas |

**Règle** : jamais en clair dans le repo. `.gitignore` couvre déjà `credentials.json`, `token.json`, `vendors.yaml`, `.env*`.
