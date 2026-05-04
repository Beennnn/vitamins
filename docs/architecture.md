# Architecture — décision en cours

3 options sur la table. Aucune n'est tranchée. Ce doc liste les options + critères pour choisir.

## Option A — PWA installable (iOS et Android)

**Stack** : Angular 21 (zoneless, signals — cohérent avec [iris-ui](https://gitlab.com/iris-7/iris-ui)) + IndexedDB local + Service Worker pour push Web.

**Pour** :
- Pas de backend = pas de coût d'hébergement.
- Installable via "Add to Home Screen" sur iOS ET Android — feel d'app native.
- Android supporte mieux les Service Workers que iOS (background sync plus fiable, push web stable).
- Tout reste sur l'appareil = privacy ++.

**Contre** :
- **Pas d'auto-order** : un service worker peut pas faire de Playwright headless.
- **Pas d'IMAP poll** : sur iOS les periodic background sync sont aléatoires ; sur Android légèrement mieux mais Doze mode reste un risque H24.
- **Pas de calendar create depuis le phone seul** facilement — OAuth flow Google sans backend = friction utilisateur sévère.

→ Adapté si l'utilisateur accepte de **passer les commandes manuellement** et **forwarder les emails relais à la main**. Pas vrai V1 décharge mentale.

## Option B — Backend Python + frontend mobile-first

**Stack** : FastAPI + SQLite + APScheduler (cron jobs in-process) + frontend Angular ou simple HTML+HTMX.

**Pour** :
- **Toutes les features faisables** : auto-order draft Playwright, IMAP poll, Google Calendar API server-to-server, push smartphone (iOS via APNs, Android via FCM) via HA Companion qui gère les deux.
- Cron natif pour les daily checks (stockout, deadline approche).
- Stack alignée avec [iris-service-python](https://gitlab.com/iris-7/iris-service-python) — Benoît la connaît.
- Backup centralisé facile (SQLite → S3 quotidien).

**Contre** :
- Besoin d'un host. Options : VPS perso (€3-5/mo), Cloud Run free tier, Raspberry Pi à la maison, Fly.io free tier.
- Nécessite gestion de secrets côté serveur (credentials vendeurs, tokens OAuth Google) — solvable via env vars + keychain OS.

→ Adapté si Benoît est OK pour héberger ~24/7. **Recommandé pour V1** car débloque toutes les features.

## Option C — App native (iOS et/ou Android)

**Stack** : SwiftUI (iOS) + Kotlin Compose (Android), ou un framework cross-platform : Flutter, React Native, KMP (Kotlin Multiplatform).

**Pour** :
- Notifs natives APNs (iOS) / FCM (Android) = meilleure expérience.
- Accès direct au calendrier natif (Apple Calendar / Google Calendar Android).
- Smartwatch complication possible nativement (Apple Watch / Wear OS).
- Background work plus permissif sur Android (foreground service) — IMAP poll local possible.

**Contre** :
- **iOS** : Apple Developer Account 99 $/an, cycles de revue App Store, Xcode + Mac requis.
- **Android** : Google Play Developer fee 25 $ one-shot (moins cher), revue plus rapide, mais Doze mode + Battery Optimizer limitent quand même les jobs background.
- **Cross-platform** (Flutter / RN / KMP) : économise un dev par stack, mais perd du natif côté OS-spécifique (notif actions, Watch).
- Idem option A : sans backend, l'auto-order Playwright n'existe pas en local. → Hybride C + backend = lourd.
- Friction de déploiement énorme pour un outil perso (signing, store account, TestFlight / internal testing).

→ Pas adapté pour V1. Peut-être V2 si l'outil prend de l'ampleur ou si la smartwatch devient un must.

## Critères de décision

| Critère | A — PWA | B — Backend | C — Native |
|---|---|---|---|
| Auto-order draft (Playwright) | ❌ | ✅ | ❌ (sans backend) |
| IMAP poll (détection colis) | ❌ | ✅ | ❌ (sans backend) |
| Google Calendar event create | 🟡 (OAuth lourd) | ✅ | 🟡 |
| Push smartphone (iOS+Android) | 🟡 (Web Push — limité iOS) | ✅ (HA Companion APNs+FCM, Pushover) | ✅ (APNs / FCM natifs) |
| Coût hosting | 0 | €3-5/mo ou free tier | 99 $/an |
| Friction déploiement | basse | moyenne | haute |
| Time-to-V1 | ~2 semaines (mais V1 dégradé) | ~3-4 semaines | ~6-8 semaines |
| Backup données | 🟡 (export JSON manuel) | ✅ (SQLite → S3 cron) | 🟡 (iCloud sync) |
| Multi-utilisateur | 🟡 (chacun son device) | ✅ (server-side) | 🟡 (chacun son device) |
| Smartwatch (Apple Watch / Wear OS) | ❌ | ❌ direct | ✅ (natif iOS et Android) |

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
