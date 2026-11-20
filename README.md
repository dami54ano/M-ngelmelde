# Mängelmelde

Mängelmelde führt Gebäudemängel an einem Ort zusammen. Statt Meldungen in verschiedenen Teams-Chats zu suchen, können Mitarbeitende einen Mangel mit Ort und Beschreibung erfassen und den Bearbeitungsstatus in einer gemeinsamen Übersicht verfolgen.

## Büroauswahl

Vor dem Anzeigen oder Erfassen von Meldungen muss eines der neun hinterlegten Büros ausgewählt werden. Die Auswahl gilt bis zum Neuladen der Seite und lässt sich über «Büro wechseln» ändern. Suche, Kennzahlen und Meldungen beziehen sich ausschliesslich auf dieses Büro. Verfügbare Situationspläne öffnen in einem neuen Tab.

Die Standorte stehen in `shared/offices.ts`. Neue Meldungen speichern eine verpflichtende `officeId`; `location` bezeichnet den Raum oder Arbeitsplatz innerhalb dieses Büros. Bestehende Datensätze ohne `officeId` bleiben erhalten, werden aber keinem Büro automatisch zugeordnet und erscheinen deshalb in keiner Büroübersicht. Eine spätere Zuordnung muss anhand des tatsächlichen Standorts erfolgen.

## Funktionen des MVP

- Gebäudemangel mit Titel, Ort, Kategorie, Beschreibung, Priorität und meldender Person erfassen
- Meldungen suchen und nach Status filtern
- Details anzeigen und Status auf «Neu», «In Bearbeitung» oder «Erledigt» setzen
- Offene, neue, in Bearbeitung befindliche und dringende Meldungen auf einen Blick sehen

Die Anwendung besteht aus einer React-/TypeScript-Oberfläche und einer Express-/TypeScript-API. Für das MVP speichert die API die Daten lokal in `data/issues.json`; eine Datenbank ist noch nicht angebunden. Beim ersten Start ohne Datendatei werden Demo-Meldungen erstellt. Es gibt derzeit keine Anmeldung oder Berechtigungsverwaltung; die Anwendung ist daher als lokaler Prototyp gedacht.

## Lokal starten

```powershell
npm install
npm run dev
```

Die Oberfläche läuft unter http://localhost:5173, die API unter http://localhost:3001. Neue Meldungen und Statusänderungen bleiben in der lokalen JSON-Datei gespeichert.

- `npm run check` prüft die TypeScript-Typen.
- `npm run build` prüft und erstellt den Produktionsbuild der Oberfläche.

## API

- `GET /api/health` – Status der API
- `GET /api/issues?officeId=<id>` – Meldungen abrufen
- `POST /api/issues` – Meldung mit gültiger `officeId` erfassen
- `PATCH /api/issues/:id/status` – Status ändern (gültige `officeId` im JSON-Body erforderlich; muss zur Meldung passen)

## Nächste Schritte

Für einen gemeinsamen produktiven Einsatz braucht es eine Datenbank, Anmeldung und passende Berechtigungen. Die konkrete Datenbank und eine mögliche Anbindung an bestehende Unternehmenssysteme sind noch zu klären. Zugangsdaten gehören in Umgebungsvariablen oder einen freigegebenen Secret Store, nicht in den Quellcode.

## Bürozuordnung testen

`node tests/offices.mjs` prüft Pflichtauswahl, ungültige Büros, standortbezogene Erstellung, getrennte Übersichten und Statusänderungen mit einer temporären Datendatei auf Port 3107. Die vorhandenen Meldungen werden dabei nicht verändert.

## SDX-Migration (Branch feat/sdx-ui-foundation)

Die Grundlage verwendet das offizielle Swisscom-Paket `@swisscom/sdx`: globales CSS, Web-Component-Registrierung und lokale SDX-Assets. Erste Aktionen nutzen `sdx-button`. Die bisherigen Daten, API-Routen und Backend-Funktionen wurden nicht verändert.

**Noch keine vollständige Migration:** Formulare, Standortkacheln, Tabellen, Filter und Dialoge haben noch projektspezifisches Markup und CSS. Prüfe deshalb die konkrete SDX-API und migriere sie schrittweise, bevor der Branch gemergt wird.

Nach Checkout: `npm install` (aktualisiert die noch alte `package-lock.json` und kopiert SDX-Assets), `npm run check`, `npm run build`, `node tests/offices.mjs`. Den aktualisierten Lockfile committen und die installierte SDX-Paketversion fixieren. Die Änderungen konnten hier nicht lokal gebaut oder im Browser geprüft werden.

[Offizielle React-Dokumentation](https://sdx.swisscom.com/latest/get-started/developers/get-to-know-sdx/react-uzdntrO8)
