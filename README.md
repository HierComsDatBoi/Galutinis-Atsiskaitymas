Programa skirta susirašinėjimui tarp dviejų vartotojų:

1. Atsidarius puslapį paprašys prisijungti arba prisiregistruoti.
2. Prisijungus, puslapio viršutinėje dalyje yra trys puslapiai: 
  2.1 Users - galima peržiūrėti visus prisiregistravusius vartotojus:
     2.1.1 Šiame puslapyje paspaudus ant vartotojo kortelės nukeliama į to vartotojo puslapį kuriame matoma vartotojo informacija ir yra mygtukai:
     2.1.2 Grįžti arba pradėti/tęsti pokalbį.
  2.2 Conversations - prisijungusio vartotojo jau pradėti pokalbiai. 
     2.2.1 Paspaudus ant vartotojo kortelės nukeliama į pokalbio puslapį.
     2.2.2 Delete mygtukas ištrina pokalbį ir visas žinutes.
     2.2.3 Pradėjus arba tęsiant pokalbį galima paspausti ant žvaigždutės esančios prie datos, kad "palaikinti" žinutę.
  2.3 Prisijungusio vartotojo vardas - jame galima pakeisti prisijungusio vartotojo informaciją ir slaptažodį.
  2.4 Logout mygtukas - atjungia esamą vartotoją ir nukelia į prisijungimo puslapį.

Paleidimo instrukcijos:
Parsisiųsti ir išarchyvuoti .zip failą.
'server' aplanke susikurti '.env' failą ir įklijuoti šią informaciją:

SERVER_PORT=5500
FRONT_PORT=5173
DB_USER=Testing
DB_PASSWORD=Testing333
DB_CLUSTER=cluster0
CLUSTER_ID=qpe8h

VS Code programoje pasileisti 2 terminalus.
Pirmame terminale: 4.1. Nusinaviguoti į /server aplanką. 4.2. Paleisti 'npm i' komandą - parsiųsti viesiems reikalingiems moduliams. 4.3. Paleisti 'npm run dev' komandą - paleisti serveriui.
Antrame terminale: 5.1. Nusinaviguoti į /client aplanką. 5.2. Paleisti 'npm i' komandą - parsiųsti viesiems reikalingiems moduliams. 5.3. Paleisti 'npm run dev' komandą - paleisti puslapio projektą.
