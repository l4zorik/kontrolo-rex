# Apps Vault Lite

Expo / React Native MVP ovladače pro seznam projektů z cloudového app skladu. Tato varianta je určená k lokálnímu vyzkoušení samotného ovladače na telefonu. Zobrazené aplikace jsou ukázkové cloudové importy; skutečná cloud databáze, stahování projektů, agenti ani push notifikace zatím nejsou připojené.

## MVP obrazovky

- Cloud Vault: demo importované projekty ve dvousloupcovém přehledu, filtry podle stavu, hledání a řazení podle deploye, MRR nebo stars.
- Planpoints: poznámkové karty v duchu Google Keep, přidávání, úpravy, odstranění, připínání a přepínání mezi poznámkami a checklistem. Podržení kroku otevře animovaný checklist celé fáze. Editor umí formátovat označený text tučně a zvýrazněním. Vše zatím zůstává pouze v lokálním demo stavu.
- Detail projektu: demo stack, metriky, deploy, Runs/Automations a přepínač viditelnosti portfolio preview.
- Portfolio: lokální read-only náhled projektů označených jako veřejné.
- Scoped Remote: kontext vybrané appky, ukázkový AI composer a rychlý přístup k Models, Agents, Automate a GitHub.
- Výsuvný AI build chat: lokální simulace požadavku agentům, dokončení demo buildu a upozornění uvnitř aplikace. Žádný požadavek se neposílá do cloudu.
- Přidání demo projektu a jemný mramorový povrch tlačítek.
- Budoucí roadmapa v UI: právní podpora, monetizace/reklamy a vlastní marketplace.

## Spuštění na telefonu

1. Rozbal projekt na počítači, na kterém je nainstalovaný Node.js a pnpm.
2. Ve složce projektu spusť:

   ```bash
   pnpm install
   pnpm exec expo start --host lan
   ```

3. Připoj telefon a počítač ke stejné Wi‑Fi síti, otevři Expo Go a naskenuj QR kód v terminálu. Pokud používáš Android, můžeš z Expo Go také zvolit „Enter URL manually“ a zadat LAN adresu, kterou Expo vypíše.

Webový preview, pokud jsou nainstalované Expo web závislosti:

```bash
pnpm exec expo start --web --port 8081 --host localhost
```

## Omezení prototypu

Demo data a nově přidané záznamy jsou zatím pouze v paměti aplikace a po restartu se vrátí do seed stavu. Pro skutečné cloudové importy, agent buildy a push oznámení bude nutné doplnit backend/API, přihlášení, databázi a notifikační službu. Projekt je plain-local a nepoužívá Manus-managed Mobile backend. Lokálně na telefonu se zkouší UI této aplikace, ne stažené projekty.
