# pensjon-regler-satsviewer
## Beskrivelse

Dette er et React prosjekt, for å starte lokalt kreves node.js.

Kan installeres på Mac med homebrev `brew install node` (for andre muligheter https://nodejs.org/en/download/package-manager/#macos, evt. https://nodejs.org/en/download/current/)

## Kjøre lokalt

For å kjøre appen lokalt må man først installere pakker med kommandoen

`npm i`

i Node kommando vindu etter å ha navigert til
(repo-location)/pensjon-regler-satsviewer/app.

Deretter kan man starte appen lokalt med kommandoen:

`npm run start`

Appen vil da åpnes i standard nettleseren på adressen *http://localhost:3000/*  
med mindre denne porten er opptatt (Node vil da finne en annen ledig port)
eller noe annet er spesifisert.

## Struktur

`App.js` er rot-komponenten for prosjektet. Her ligger overskrift, fargeknapper, logo, menyer for valg av satstabell  
og satstabell-kategori komponentene.  

Under satstabell-kategori komponentene ligger de respektive satstabellene.  

## Bygg & Deploy  
Ved push til main branchen vil det automatisk settes i gang bygg & deploy jobber både til  
dev-fss og prod-fss.  
Workflow-filene ligger under `<repo-root>/.github/workflows`

## Intern Informasjonsflyt

I det applikasjonen åpnes gjøres et kall til  
>https://pensjon-regler-q4.dev.adeo.no/alleSatstabeller 
  
for å hente en liste over alle tilgjengelige satstabeller. Disse blir så sortert for så å bli  
brukt til å populere satstabell menyene.  

I det en satstabell-kategori komponent åpnes kalles endepunktet til hver av  
tabellene i denne kategorien og selve tabell-komponenten populeres.  
  
Applikasjonen har alltid én tabell aktiv, default er tabellen som er aktiv i Q4.  
Dette kan endres ved å velge en av tabellene i de tre tabell menyene, eller å peke  
applikasjonen mot et annet miljø.  
Måten dette settes på er ved at i `app.js` sendes det en funksjon som kan endre denne verdien  
med i konstruktøren til hver av meny knappene. Dette gir disse mulighet til å endre   
denne verdien for hele applikasjonen.  

## Utvikling  

Dersom det legges til et nytt felt i en eksisterende tabell må dette også legges til 
i Satsviewer. Man må da inn i den respektive satskomponenten sin Render funksjon og legge til  
feltnavnet som en ny tabellheader  
`<th>Feltnavn</th>`  
deretter må dataene legges inn i tabell-body  
`<td>data.feltnavn</td>`  

Dersom det lages en ny satstabell må denne eksponeres via et nytt endepunkt i  
pensjon-regler 
sin `HentSatsController`.  
Deretter må det lages en ny tabell i Satsviewer på samme måte som andre tabeller er blitt laget
