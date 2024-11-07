Programa skirta susirašinėjimui tarp dviejų vartotojų:

Atsidarius puslapį paprašys prisijungti arba prisiregistruoti.
Prisijungus, puslapio viršutinėje dalyje yra trys puslapiai: 
Users - galima peržiūrėti visus prisiregistravusius vartotojus:
Šiame puslapyje paspaudus ant vartotojo kortelės nukeliama į to vartotojo puslapį kuriame matoma vartotojo informacija ir yra mygtukai:
Grįžti arba pradėti/tęsti pokalbį.
Conversations - prisijungusio vartotojo jau pradėti pokalbiai. 
Paspaudus ant vartotojo kortelės nukeliama į pokalbio puslapį.
Delete mygtukas ištrina pokalbį ir visas žinutes.
Pradėjus arba tęsiant pokalbį galima paspausti ant žvaigždutės esančios prie datos, kad "palaikinti" žinutę.
Prisijungusio vartotojo vardas - jame galima pakeisti prisijungusio vartotojo informaciją ir slaptažodį.
Logout mygtukas - atjungia esamą vartotoją ir nukelia į prisijungimo puslapį.

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
