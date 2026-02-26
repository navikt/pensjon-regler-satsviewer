# pensjon-regler-satsviewer
## Beskrivelse

Dette er et Vite React prosjekt, for å starte lokalt kreves node.js.

Kan installeres på Mac med Homebrev `brew install node` (for andre muligheter https://nodejs.org/en/download/package-manager/#macos, evt. https://nodejs.org/en/download/current/)

## Kjøre lokalt

For å kjøre appen lokalt må man først installere pakker med kommandoen

`npm i`

i Node kommando-vindu etter å ha navigert til
<repo-location>/pensjon-regler-satsviewer

Deretter kan man starte appen lokalt med kommandoen:

`npm run dev`

Appen vil da åpnes i standard nettleseren på adressen *http://localhost:5137/*  
med mindre denne porten er opptatt (Node vil da finne en annen ledig port)
eller noe annet om spesifisert.

## Struktur

`App.ts` er rot-komponenten for prosjektet. 

Under satstabell-kategori komponentene ligger de respektive satstabellene.

## Bygg & Deploy
Ved push til main branchen vil det automatisk settes i gang bygg & deploy jobber både til  
dev-gcp og prod-gcp.  
Workflow-filene ligger under `<repo-root>/.github/workflows`

## Intern Informasjonsflyt

I det applikasjonen åpnes gjøres et kall til (default q2)
>https://pensjon-regler-q2.intern.dev.nav.no/alleSatstabeller 
og
>https://pensjon-regler-q2.intern.dev.nav.no/aktivTabell

for å hente en liste over alle tilgjengelige satstabeller, samt aktiv satstabell for valgt miljø.

I det en satstabell-kategori komponent åpnes kalles endepunktet til hver av  
tabellene i denne kategorien og selve tabell-komponenten populeres. 

Applikasjonen har alltid én tabell aktiv, default er tabellen som er aktiv i Q2.  
Dette kan endres ved å velge et annet miljø i menyen.
## Utvikling

Dersom det lages en ny satstabell må denne eksponeres via et nytt endepunkt i  
komponenten `HentSatsController` fra pensjon-regler. 
Deretter må det lages en ny tabell i Satsviewer på samme måte som andre tabeller er blitt laget i `src/components/satstabeller/`.
