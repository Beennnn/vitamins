# Architecture — décision en cours

3 options sur la table. Aucune n'est tranchée. Ce doc liste les options + critères pour choisir.

## Option A — PWA installable iPhone

**Stack** : Angular 21 (zoneless, signals — cohérent avec [iris-ui](https://gitlab.com/iris-7/iris-ui)) + IndexedDB local + Service Worker pour push Web.

**Pour** :
- Pas de backend = pas de coût d'hébergement.
- Installable sur iPhone via "Add to Home Screen" — feel d'app native.
- Tout reste sur l'appareil = privacy ++.

**Contre** :
- **Pas d'auto-order** : un service worker peut pas faire de Playwright headless.
- **Pas d'IMAP poll** : un service worker peut pas tourner H24, et même les periodic background sync iOS sont aléatoires.
- **Pas de calendar create depuis le phone seul** facilement — OAuth flow Google sans backend = friction utilisateur sévère.

→ Adapté si Benoît accepte de **passer les commandes manuellement** et **forwarder les emails relais à la main**. Pas vrai V1 décharge mentale.

## Option B — Backend Python + frontend mobile-first

**Stack** : FastAPI + SQLite + APScheduler (cron jobs in-process) + frontend Angular ou simple HTML+HTMX.

**Pour** :
- **Toutes les features faisables** : auto-order draft Playwright, IMAP poll, Google Calendar API server-to-server, push iPhone via HA Companion.
- Cron natif pour les daily checks (stockout, deadline approche).
- Stack alignée avec [iris-service-python](https://gitlab.com/iris-7/iris-service-python) — Benoît la connaît.
- Backup centralisé facile (SQLite → S3 quotidien).

**Contre** :
- Besoin d'un host. Options : VPS perso (€3-5/mo), Cloud Run free tier, Raspberry Pi à la maison, Fly.io free tier.
- Nécessite gestion de secrets côté serveur (credentials vendeurs, tokens OAuth Google) — solvable via env vars + keychain OS.

→ Adapté si Benoît est OK pour héberger ~24/7. **Recommandé pour V1** car débloque toutes les features.

## Option C — App native iPhone

**Stack** : SwiftUI (Xcode) ou Flutter ou React Native.

**Pour** :
- Notifs natives = meilleure expérience.
- Accès direct à Apple Calendar (pas besoin de Google).
- Apple Watch complication possible nativement.

**Contre** :
- Apple Developer Account : **99 $/an**.
- Cycles de revue App Store si distribué.
- Idem option A : sans backend, pas d'auto-order ni d'IMAP poll. → Hybride C + backend = lourd.
- Friction de déploiement énorme pour un outil perso (Xcode, signing, TestFlight).

→ Pas adapté pour V1. Peut-être V2 si l'outil prend de l'ampleur ou si on veut Apple Watch.

## Critères de décision

| Critère | A — PWA | B — Backend | C — Native |
|---|---|---|---|
| Auto-order draft (Playwright) | ❌ | ✅ | ❌ (sans backend) |
| IMAP poll (détection colis) | ❌ | ✅ | ❌ (sans backend) |
| Google Calendar event create | 🟡 (OAuth lourd) | ✅ | 🟡 |
| Push iPhone | 🟡 (Web Push) | ✅ (HA Companion / Pushover) | ✅ (APNs natif) |
| Coût hosting | 0 | €3-5/mo ou free tier | 99 $/an |
| Friction déploiement | basse | moyenne | haute |
| Time-to-V1 | ~2 semaines (mais V1 dégradé) | ~3-4 semaines | ~6-8 semaines |
| Backup données | 🟡 (export JSON manuel) | ✅ (SQLite → S3 cron) | 🟡 (iCloud sync) |
| Multi-utilisateur | 🟡 (chacun son device) | ✅ (server-side) | 🟡 (chacun son device) |
| Apple Watch | ❌ | ❌ direct, ✅ via PWA wrap | ✅ |

## Recommandation initiale

**Option B** : FastAPI + SQLite + APScheduler côté backend, frontend mobile-first (Angular PWA en bonus une fois B opérationnel). Justification : c'est la seule option qui débloque les features qui font 80 % de la valeur du système (auto-order draft + IMAP relais + cron stockout). Le backend Python s'aligne avec ce que Benoît connaît déjà ([iris-service-python](https://gitlab.com/iris-7/iris-service-python)).

À discuter avec Benoît après remplissage du [questionnaire de scope](scope-questionnaire.md).

## Hosting si Option B retenue

| Hosting | Prix | Pour | Contre |
|---|---|---|---|
| VPS perso (Hetzner / OVH / Scaleway) | €3-5/mo | Contrôle total, IP fixe possible | Maintenance OS, à updater |
| Cloud Run (GCP) | Free tier souvent suffisant | Zéro maintenance, scale to zero | Cold start 1-2 s |
| Fly.io | Free tier généreux | Edge deployment, simple | App Hibernation |
| Raspberry Pi à la maison | One-shot ~80 € | Local, full control, no recurring cost | Down si coupure courant / box |
| Iris GCP existant | Inclus dans budget Iris | Déjà configuré | Mélange perso + portfolio |

→ Pour V1 minimal, **Cloud Run free tier** ou **Fly.io free tier** sont les plus rapides à mettre en route. À reconsidérer si la latence pose problème (cold start sur push de notif).
