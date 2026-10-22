/* Mock data for Mockup E (D-busy).
 *
 * Two demo datasets, both deterministic:
 *   window.TA_DATA.power  — a power user: ~150 past trips 2017–2026, a few dated plans, 4 undated ideas
 *   window.TA_DATA.light  — D's original five trips plus one idea (plain-D behaviour)
 *
 * Every stop carries a country code (`cc`). A trip's countries are always
 * derived from its stops — there is no trip.country field — so one trip can
 * span Portugal → Spain → France without being split into three entries.
 *
 * Also exports the gazetteer used for place search / bulk paste:
 *   window.TA_GAZ        [{ name, cc, lng, lat }]
 *   window.TA_COUNTRIES  { cc: { name, continent } }
 */
(() => {
  "use strict";
  const img = (seed, w = 600, h = 400) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

  /* ---------------- countries ---------------- */
  const EU = "Europe", AS = "Asia", AF = "Africa", NA = "North America", SA = "South America", OC = "Oceania";
  const COUNTRIES = {
    JP: ["Japan", AS], KR: ["South Korea", AS], TW: ["Taiwan", AS], HK: ["Hong Kong", AS], CN: ["China", AS], TH: ["Thailand", AS],
    VN: ["Vietnam", AS], KH: ["Cambodia", AS], LA: ["Laos", AS], MM: ["Myanmar", AS], SG: ["Singapore", AS], MY: ["Malaysia", AS],
    ID: ["Indonesia", AS], PH: ["Philippines", AS], NP: ["Nepal", AS], IN: ["India", AS], LK: ["Sri Lanka", AS], MV: ["Maldives", AS],
    AE: ["United Arab Emirates", AS], OM: ["Oman", AS], QA: ["Qatar", AS], JO: ["Jordan", AS], IL: ["Israel", AS], TR: ["Türkiye", AS],
    GE: ["Georgia", AS], AM: ["Armenia", AS], UZ: ["Uzbekistan", AS],
    GR: ["Greece", EU], IT: ["Italy", EU], ES: ["Spain", EU], PT: ["Portugal", EU], FR: ["France", EU], MC: ["Monaco", EU],
    GB: ["United Kingdom", EU], IE: ["Ireland", EU], NL: ["Netherlands", EU], BE: ["Belgium", EU], LU: ["Luxembourg", EU],
    DE: ["Germany", EU], CH: ["Switzerland", EU], AT: ["Austria", EU], CZ: ["Czechia", EU], SK: ["Slovakia", EU], HU: ["Hungary", EU],
    PL: ["Poland", EU], SI: ["Slovenia", EU], HR: ["Croatia", EU], BA: ["Bosnia & Herzegovina", EU], ME: ["Montenegro", EU],
    AL: ["Albania", EU], MK: ["North Macedonia", EU], RS: ["Serbia", EU], BG: ["Bulgaria", EU], RO: ["Romania", EU],
    DK: ["Denmark", EU], SE: ["Sweden", EU], NO: ["Norway", EU], FI: ["Finland", EU], EE: ["Estonia", EU], LV: ["Latvia", EU],
    LT: ["Lithuania", EU], IS: ["Iceland", EU], MT: ["Malta", EU], CY: ["Cyprus", EU],
    MA: ["Morocco", AF], EG: ["Egypt", AF], KE: ["Kenya", AF], TZ: ["Tanzania", AF], ZA: ["South Africa", AF], NA: ["Namibia", AF],
    BW: ["Botswana", AF], ZW: ["Zimbabwe", AF], RW: ["Rwanda", AF], TN: ["Tunisia", AF], SN: ["Senegal", AF],
    US: ["United States", NA], CA: ["Canada", NA], MX: ["Mexico", NA], CU: ["Cuba", NA], BZ: ["Belize", NA], GT: ["Guatemala", NA],
    CR: ["Costa Rica", NA], PA: ["Panama", NA], PR: ["Puerto Rico", NA],
    PE: ["Peru", SA], BO: ["Bolivia", SA], BR: ["Brazil", SA], AR: ["Argentina", SA], CL: ["Chile", SA], CO: ["Colombia", SA],
    EC: ["Ecuador", SA], UY: ["Uruguay", SA],
    AU: ["Australia", OC], NZ: ["New Zealand", OC], FJ: ["Fiji", OC],
  };

  /* ---------------- gazetteer (real coordinates, rounded) ---------------- */
  const G = `
JP|Tokyo|139.69|35.69;Kyoto|135.77|35.01;Osaka|135.50|34.69;Sapporo|141.35|43.06;Hakone|139.02|35.23;Hiroshima|132.46|34.39;Nara|135.80|34.69;Fukuoka|130.40|33.59;Kanazawa|136.66|36.56;Naha, Okinawa|127.68|26.21;Takayama|137.25|36.14;Nikko|139.60|36.75
KR|Seoul|126.98|37.57;Busan|129.08|35.18;Jeju|126.53|33.50
TW|Taipei|121.56|25.03
HK|Hong Kong|114.17|22.32
CN|Beijing|116.40|39.90;Shanghai|121.47|31.23;Guilin|110.29|25.27;Chengdu|104.07|30.57
TH|Bangkok|100.50|13.76;Chiang Mai|98.99|18.79;Phuket|98.39|7.88;Krabi|98.91|8.09;Koh Samui|100.01|9.51
VN|Hanoi|105.85|21.03;Hoi An|108.33|15.88;Ho Chi Minh City|106.70|10.78;Ha Long Bay|107.08|20.95;Hue|107.59|16.46
KH|Siem Reap|103.86|13.36;Phnom Penh|104.92|11.56
LA|Luang Prabang|102.14|19.89;Vientiane|102.63|17.97
MM|Bagan|94.86|21.17
SG|Singapore|103.82|1.35
MY|Kuala Lumpur|101.69|3.14;Penang|100.33|5.41;Langkawi|99.73|6.35
ID|Ubud, Bali|115.26|-8.51;Jakarta|106.85|-6.21;Yogyakarta|110.37|-7.80;Labuan Bajo|119.89|-8.50
PH|Manila|120.98|14.60;El Nido|119.40|11.18;Cebu|123.89|10.32
NP|Kathmandu|85.32|27.72;Pokhara|83.99|28.21
IN|Jaipur|75.79|26.91;Mumbai|72.88|19.08;Delhi|77.21|28.61;Agra|78.01|27.18;Goa|73.83|15.50;Udaipur|73.71|24.59;Kochi|76.27|9.93
LK|Colombo|79.86|6.93;Kandy|80.64|7.29;Ella|81.05|6.87
MV|Malé|73.51|4.18
AE|Dubai|55.27|25.20;Abu Dhabi|54.37|24.45
OM|Muscat|58.41|23.59
QA|Doha|51.53|25.29
JO|Amman|35.93|31.95;Petra|35.44|30.33;Wadi Rum|35.42|29.58
IL|Tel Aviv|34.78|32.09;Jerusalem|35.21|31.77
TR|Istanbul|28.98|41.01;Cappadocia|34.83|38.64;Antalya|30.71|36.90
GE|Tbilisi|44.79|41.72
AM|Yerevan|44.51|40.18
UZ|Samarkand|66.96|39.65
GR|Athens|23.73|37.98;Santorini|25.43|36.39;Chania, Crete|24.02|35.51;Thessaloniki|22.94|40.64;Naxos|25.38|37.10
IT|Rome|12.50|41.90;Florence|11.26|43.77;Venice|12.33|45.44;Dolomites (Cortina)|12.14|46.54;Milan|9.19|45.46;Naples|14.27|40.85;Amalfi|14.60|40.63;Cinque Terre|9.71|44.13;Bologna|11.34|44.49;Palermo|13.36|38.12;Lake Como|9.26|45.99
ES|Barcelona|2.17|41.39;Madrid|-3.70|40.42;Seville|-5.98|37.39;Granada|-3.60|37.18;Valencia|-0.38|39.47;San Sebastián|-1.98|43.32;Palma, Mallorca|2.65|39.57;Bilbao|-2.93|43.26;Málaga|-4.42|36.72
PT|Lisbon|-9.14|38.72;Porto|-8.61|41.15;Lagos|-8.67|37.10;Sintra|-9.39|38.80;Funchal, Madeira|-16.91|32.65;Ponta Delgada, Azores|-25.67|37.74
FR|Paris|2.35|48.86;Chamonix|6.87|45.92;Nice|7.26|43.70;Lyon|4.84|45.76;Bordeaux|-0.58|44.84;Marseille|5.37|43.30;Strasbourg|7.75|48.57;Mont-Saint-Michel|-1.51|48.64
MC|Monaco|7.42|43.74
GB|London|-0.13|51.51;Edinburgh|-3.19|55.95;Isle of Skye|-6.20|57.27;Manchester|-2.24|53.48;Bath|-2.36|51.38;Keswick, Lake District|-3.13|54.60;St Ives, Cornwall|-5.48|50.21
IE|Dublin|-6.26|53.35;Galway|-9.05|53.27
NL|Amsterdam|4.90|52.37;Rotterdam|4.48|51.92
BE|Brussels|4.35|50.85;Bruges|3.22|51.21
LU|Luxembourg|6.13|49.61
DE|Berlin|13.40|52.52;Munich|11.58|48.14;Hamburg|9.99|53.55;Cologne|6.96|50.94;Frankfurt|8.68|50.11
CH|Zurich|8.54|47.37;Lucerne|8.31|47.05;Zermatt|7.75|46.02;Geneva|6.14|46.20;Interlaken|7.86|46.69
AT|Vienna|16.37|48.21;Salzburg|13.05|47.81;Innsbruck|11.40|47.27;Hallstatt|13.65|47.56
CZ|Prague|14.42|50.08;Český Krumlov|14.32|48.81
SK|Bratislava|17.11|48.15
HU|Budapest|19.04|47.50
PL|Kraków|19.94|50.06;Warsaw|21.01|52.23;Gdańsk|18.65|54.35
SI|Ljubljana|14.51|46.06;Lake Bled|14.11|46.37
HR|Zagreb|15.98|45.81;Split|16.44|43.51;Dubrovnik|18.09|42.65;Plitvice Lakes|15.58|44.88;Hvar|16.44|43.17
BA|Sarajevo|18.41|43.86;Mostar|17.81|43.34
ME|Kotor|18.77|42.42
AL|Tirana|19.82|41.33;Berat|19.95|40.70;Ksamil|20.00|39.77
MK|Ohrid|20.80|41.12
RS|Belgrade|20.46|44.79
BG|Sofia|23.32|42.70
RO|Bucharest|26.10|44.43;Brașov|25.59|45.66
DK|Copenhagen|12.57|55.68
SE|Stockholm|18.07|59.33;Gothenburg|11.97|57.71;Abisko|18.83|68.35
NO|Oslo|10.75|59.91;Lofoten|13.60|68.20;Tromsø|18.96|69.65;Bergen|5.32|60.39;Geiranger|7.21|62.10
FI|Helsinki|24.94|60.17;Rovaniemi|25.73|66.50
EE|Tallinn|24.75|59.44
LV|Riga|24.11|56.95
LT|Vilnius|25.28|54.69
IS|Reykjavík|-21.94|64.15;Vík|-19.01|63.42;Höfn|-15.21|64.25;Akureyri|-18.09|65.68
MT|Valletta|14.51|35.90
CY|Paphos|32.42|34.77
MA|Marrakech|-7.99|31.63;Fes|-5.00|34.03;Merzouga|-4.01|31.10;Chefchaouen|-5.27|35.17;Essaouira|-9.77|31.51
EG|Cairo|31.24|30.04;Luxor|32.64|25.69;Aswan|32.90|24.09
KE|Nairobi|36.82|-1.29;Maasai Mara|35.14|-1.49
TZ|Zanzibar|39.19|-6.17;Serengeti|34.83|-2.33;Arusha|36.68|-3.37
ZA|Cape Town|18.42|-33.92;Johannesburg|28.05|-26.20;Kruger Park|31.50|-24.01;Knysna|23.05|-34.04
NA|Windhoek|17.08|-22.56;Sossusvlei|15.29|-24.73
BW|Maun, Okavango|23.42|-19.98
ZW|Victoria Falls|25.84|-17.93
RW|Kigali|30.06|-1.95
TN|Tunis|10.18|36.81
SN|Dakar|-17.47|14.72
US|New York|-74.01|40.71;San Francisco|-122.42|37.77;Yosemite|-119.54|37.87;Honolulu|-157.86|21.31;Los Angeles|-118.24|34.05;Chicago|-87.63|41.88;Seattle|-122.33|47.61;Boston|-71.06|42.36;Washington DC|-77.04|38.91;Austin|-97.74|30.27;New Orleans|-90.07|29.95;Miami|-80.19|25.76;Las Vegas|-115.14|36.17;Grand Canyon|-112.11|36.06;Zion|-113.03|37.30;Denver|-104.99|39.74;Portland|-122.68|45.52;Maui|-156.68|20.88;Nashville|-86.78|36.16;Orlando|-81.38|28.54;Anchorage|-149.90|61.22;Moab|-109.55|38.57;Big Sur|-121.81|36.27;San Diego|-117.16|32.72;Philadelphia|-75.17|39.95
CA|Vancouver|-123.12|49.28;Banff|-115.57|51.18;Toronto|-79.38|43.65;Montréal|-73.57|45.50;Québec City|-71.21|46.81;Jasper|-118.08|52.87;Victoria BC|-123.37|48.43
MX|Mexico City|-99.13|19.43;Oaxaca|-96.73|17.07;Tulum|-87.47|20.21;Cancún|-86.85|21.16;Guadalajara|-103.35|20.66;San Miguel de Allende|-100.74|20.91
CU|Havana|-82.37|23.11;Viñales|-83.71|22.62
BZ|Caye Caulker|-88.03|17.76
GT|Antigua Guatemala|-90.73|14.56;Lake Atitlán|-91.18|14.69
CR|San José|-84.09|9.93;Arenal|-84.67|10.46;Manuel Antonio|-84.15|9.39
PA|Panama City|-79.52|8.98
PR|San Juan|-66.11|18.47
PE|Cusco|-71.97|-13.53;Lima|-77.04|-12.05;Machu Picchu|-72.55|-13.16;Arequipa|-71.54|-16.41
BO|La Paz|-68.15|-16.50;Uyuni|-66.83|-20.46
BR|Rio de Janeiro|-43.17|-22.91;São Paulo|-46.63|-23.55;Iguaçu Falls|-54.44|-25.55;Salvador|-38.50|-12.97
AR|Buenos Aires|-58.38|-34.60;El Calafate|-72.27|-50.34;El Chaltén|-72.89|-49.33;Mendoza|-68.84|-32.89;Bariloche|-71.31|-41.13;Ushuaia|-68.30|-54.80;Salta|-65.41|-24.78
CL|Santiago|-70.67|-33.45;Puerto Natales|-72.51|-51.73;San Pedro de Atacama|-68.20|-22.91;Valparaíso|-71.63|-33.05
CO|Bogotá|-74.07|4.71;Cartagena|-75.51|10.39;Medellín|-75.56|6.24
EC|Quito|-78.47|-0.18;Galápagos|-90.31|-0.74
UY|Montevideo|-56.16|-34.90
AU|Sydney|151.21|-33.87;Melbourne|144.96|-37.81;Cairns|145.77|-16.92;Uluru|131.04|-25.34;Perth|115.86|-31.95;Brisbane|153.03|-27.47;Hobart|147.33|-42.88
NZ|Queenstown|168.66|-45.03;Auckland|174.76|-36.85;Wellington|174.78|-41.29;Rotorua|176.25|-38.14;Milford Sound|167.93|-44.67
FJ|Nadi|177.42|-17.80`;
  const GAZ = [];
  for (const line of G.trim().split("\n")) {
    const [cc, rest] = [line.slice(0, 2), line.slice(3)];
    for (const p of rest.split(";")) { const [name, lng, lat] = p.split("|"); GAZ.push({ name, cc, lng: +lng, lat: +lat }); }
  }
  const BY = Object.fromEntries(GAZ.map((p) => [p.name, p]));
  const place = (name) => { const p = BY[name]; if (!p) throw new Error("gazetteer: " + name); return p; };
  const countriesOut = Object.fromEntries(Object.entries(COUNTRIES).map(([cc, [name, continent]]) => [cc, { name, continent }]));

  /* ---------------- seeded PRNG ---------------- */
  function mulberry32(a) {
    return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const rnd = mulberry32(20170101);
  const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const pickOne = (arr) => arr[Math.floor(rnd() * arr.length)];
  const PALETTE = ["#f97316", "#0ea5e9", "#22c55e", "#a855f7", "#eab308", "#ec4899", "#14b8a6", "#ef4444", "#6366f1"];
  const iso = (d) => d.toISOString().slice(0, 10);
  const addDays = (s, n) => { const d = new Date(s + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return iso(d); };

  /* ---------------- D's original trips, upgraded ---------------- */
  // stop.cc + rough nights; media gets a stop index so collages can filter by country segment.
  function fromD(t) {
    const c = structuredClone(t);
    c.stops = c.stops.map((s) => ({ ...s, cc: (BY[s.name] || nearest(s)).cc }));
    if (c.id === 2) { // make one of D's trips multi-country: carry on over the border to Seville
      c.title = "Lisbon, the Algarve & Seville";
      c.summary = "Tram 28, pastéis de nata, the Lagos cliffs — then over the border for tapas in Seville.";
      c.end = "2024-06-21";
      c.stops.push({ name: "Seville", lng: -5.98, lat: 37.39, cc: "ES" });
      c.media.push(
        { src: "immich", type: "image", url: img("es-sev1", 600, 800), caption: "Plaza de España" },
        { src: "immich", type: "image", url: img("es-sev2"), caption: "Tapas crawl in Triana" },
        { src: "local", type: "video", url: img("es-sev3"), caption: "Flamenco, Casa de la Memoria", duration: "1:32" });
    }
    c.companions = { 1: ["Sam"], 2: ["Sam", "Alex"], 3: ["Sam"], 4: ["Sam"], 5: ["Family"] }[c.id] || ["Solo"];
    c.starred = c.id === 1 || c.id === 3;
    assignNights(c);
    spreadMediaOverStops(c);
    c.photos = c.status === "past" ? c.media.length * 37 + 40 : 0;
    return c;
  }
  function nearest(s) { let b = GAZ[0], bd = Infinity; for (const p of GAZ) { const d = (p.lng - s.lng) ** 2 + (p.lat - s.lat) ** 2; if (d < bd) { bd = d; b = p; } } return b; }
  function spreadMediaOverStops(t) {
    const n = t.media.length, k = t.stops.length;
    t.media.forEach((m, i) => { if (m.stop == null) m.stop = Math.min(k - 1, Math.floor((i / Math.max(1, n)) * k)); });
  }
  // nights per stop (sum = trip nights); for dated trips, also each stop's arrival date
  function assignNights(t) {
    const a = t.start && new Date(t.start + "T00:00:00Z"), b = t.end && new Date(t.end + "T00:00:00Z");
    if (!a || !b) return;
    const total = Math.max(0, Math.round((b - a) / 864e5));
    if (t.stops.every((s) => s.nights != null)) { /* keep hand-written */ }
    else {
      const w = t.stops.map(() => 0.6 + rnd());
      const sw = w.reduce((x, y) => x + y, 0);
      let left = total;
      t.stops.forEach((s, i) => {
        const n = i === t.stops.length - 1 ? left : Math.max(total >= t.stops.length ? 1 : 0, Math.min(left - (t.stops.length - 1 - i) * (total >= t.stops.length ? 1 : 0), Math.round((w[i] / sw) * total)));
        s.nights = Math.max(0, n); left -= s.nights;
      });
    }
    let cur = t.start;
    t.stops.forEach((s) => { s.arrive = cur; cur = addDays(cur, s.nights || 0); });
  }

  /* ---------------- templates for the power user ---------------- */
  // [title, stops, tags, companions pool, [minDays, maxDays], big?]
  const MC = [
    ["Euro rail: Paris to Prague", ["Paris", "Brussels", "Amsterdam", "Berlin", "Prague"], ["rail", "food", "cities"], [["Sam"]], [12, 16], 1],
    ["Southeast Asia backpacking", ["Bangkok", "Siem Reap", "Phnom Penh", "Ho Chi Minh City", "Hoi An", "Hanoi"], ["backpacking", "food", "temples"], [["Alex"], ["Solo"]], [18, 24], 1],
    ["Balkans by bus", ["Ljubljana", "Zagreb", "Plitvice Lakes", "Split", "Dubrovnik", "Kotor"], ["road trip", "beach", "hike"], [["Sam"]], [12, 16], 1],
    ["Scandinavia by train", ["Copenhagen", "Stockholm", "Oslo", "Bergen"], ["rail", "cities"], [["Sam"]], [10, 13], 1],
    ["Pacific Northwest & the Rockies", ["Seattle", "Vancouver", "Banff", "Jasper"], ["road trip", "hike"], [["Sam"], ["Family"]], [10, 14], 1],
    ["Iberia slow travel", ["Porto", "Lisbon", "Seville", "Granada", "Madrid"], ["food", "rail"], [["Sam"]], [12, 15], 1],
    ["Danube capitals", ["Vienna", "Bratislava", "Budapest"], ["cities", "food"], [["Alex", "Priya"]], [6, 8], 0],
    ["Baltic long weekend+", ["Tallinn", "Riga", "Vilnius"], ["cities"], [["Solo"]], [6, 8], 0],
    ["Alps hut-to-hut", ["Munich", "Salzburg", "Innsbruck", "Zurich", "Zermatt"], ["hike", "mountains"], [["Alex"]], [10, 13], 1],
    ["Andes overland", ["Lima", "Cusco", "Machu Picchu", "La Paz", "Uyuni", "San Pedro de Atacama"], ["hike", "backpacking"], [["Sam"]], [18, 22], 1],
    ["Southern Africa safari", ["Cape Town", "Windhoek", "Sossusvlei", "Maun, Okavango", "Victoria Falls"], ["safari", "road trip"], [["Sam"]], [14, 18], 1],
    ["Korea & Kyushu", ["Seoul", "Busan", "Fukuoka", "Kyoto", "Tokyo"], ["food", "rail"], [["Sam"]], [12, 15], 1],
    ["Singapore & Malaysia", ["Singapore", "Kuala Lumpur", "Penang", "Langkawi"], ["food", "beach"], [["Sam"]], [9, 12], 0],
    ["Yucatán to Guatemala", ["Cancún", "Tulum", "Caye Caulker", "Antigua Guatemala", "Lake Atitlán"], ["beach", "backpacking"], [["Alex"], ["Sam"]], [12, 15], 1],
    ["Riviera road trip", ["Nice", "Monaco", "Cinque Terre", "Florence"], ["road trip", "food", "beach"], [["Sam"]], [7, 9], 0],
    ["Ireland & Scotland", ["Dublin", "Galway", "Edinburgh", "Isle of Skye"], ["road trip", "hike"], [["Family"], ["Sam"]], [9, 12], 0],
    ["Jordan & Egypt", ["Amman", "Petra", "Wadi Rum", "Cairo", "Luxor"], ["history", "desert"], [["Sam"]], [10, 13], 1],
    ["Caucasus wine & mountains", ["Tbilisi", "Yerevan"], ["food", "hike"], [["Alex"]], [7, 9], 0],
    ["Australia & New Zealand", ["Sydney", "Melbourne", "Queenstown", "Milford Sound", "Auckland"], ["road trip", "hike", "beach"], [["Sam"]], [18, 23], 1],
    ["East Africa safari & Zanzibar", ["Nairobi", "Maasai Mara", "Serengeti", "Zanzibar"], ["safari", "beach"], [["Sam"], ["Family"]], [11, 14], 1],
    ["Benelux by bike", ["Amsterdam", "Bruges", "Brussels", "Luxembourg"], ["cycling", "food"], [["Sam"]], [6, 8], 0],
    ["Argentina & Chile wine country", ["Buenos Aires", "Mendoza", "Santiago", "Valparaíso"], ["food", "wine"], [["Sam"]], [11, 14], 0],
    ["Iguaçu & Rio", ["Buenos Aires", "Iguaçu Falls", "Rio de Janeiro"], ["nature", "beach"], [["Alex", "Priya"]], [9, 11], 0],
    ["Down the Danube", ["Vienna", "Budapest", "Belgrade", "Bucharest"], ["rail", "cities"], [["Solo"]], [9, 12], 0],
    ["Adriatic islands", ["Split", "Hvar", "Dubrovnik", "Kotor"], ["beach", "sailing"], [["Sam", "Alex", "Priya"]], [8, 10], 0],
    ["Kraków & Bohemia", ["Kraków", "Prague", "Český Krumlov"], ["cities", "history"], [["Family"]], [6, 8], 0],
    ["Gulf stopover", ["Dubai", "Abu Dhabi", "Muscat"], ["desert", "cities"], [["Sam"]], [5, 7], 0],
    ["Northern Thailand & Laos", ["Chiang Mai", "Luang Prabang", "Vientiane"], ["temples", "slow travel"], [["Solo"]], [10, 13], 0],
    ["Swiss & Italian lakes", ["Zurich", "Lucerne", "Lake Como", "Milan"], ["rail", "lakes"], [["Sam"], ["Family"]], [7, 9], 0],
    ["Arctic winter: Helsinki to Tromsø", ["Helsinki", "Rovaniemi", "Abisko", "Tromsø"], ["winter", "aurora"], [["Sam"]], [8, 10], 1],
    ["New England & Québec", ["Boston", "Montréal", "Québec City", "Toronto"], ["road trip", "food"], [["Family"]], [9, 11], 0],
    ["Colombia & Galápagos", ["Bogotá", "Medellín", "Cartagena", "Quito", "Galápagos"], ["nature", "beach"], [["Sam"]], [15, 18], 1],
    ["Malta & Sicily", ["Valletta", "Palermo"], ["beach", "food"], [["Sam"]], [6, 8], 0],
    ["Basque coast: Bilbao to Bordeaux", ["Bilbao", "San Sebastián", "Bordeaux"], ["food", "wine"], [["Alex", "Priya"]], [5, 7], 0],
  ];
  const SC = [
    ["Kyoto & Osaka food trip", ["Osaka", "Kyoto", "Nara"], ["food", "temples"], [["Sam"]], [6, 9], 0],
    ["Tokyo long weekend", ["Tokyo", "Nikko"], ["food", "cities"], [["Solo"], ["Sam"]], [4, 6], 0],
    ["Hokkaido powder", ["Sapporo"], ["ski", "winter"], [["Alex"]], [6, 8], 0],
    ["Japan Alps", ["Tokyo", "Takayama", "Kanazawa", "Kyoto"], ["hike", "rail"], [["Sam"]], [9, 12], 1],
    ["Amalfi Coast", ["Naples", "Amalfi"], ["beach", "food"], [["Sam"]], [5, 7], 0],
    ["Rome & Florence", ["Rome", "Florence"], ["history", "food"], [["Family"], ["Sam"]], [6, 8], 0],
    ["Venice & the Dolomites", ["Venice", "Dolomites (Cortina)"], ["hike", "mountains"], [["Sam"]], [7, 9], 0],
    ["Greek islands", ["Athens", "Naxos", "Santorini"], ["beach", "sailing"], [["Sam", "Alex", "Priya"]], [8, 11], 0],
    ["Crete with the family", ["Chania, Crete"], ["beach", "family"], [["Family"]], [7, 9], 0],
    ["Barcelona weekend", ["Barcelona"], ["food", "beach"], [["Sam"]], [3, 4], 0],
    ["Mallorca beach week", ["Palma, Mallorca"], ["beach"], [["Family"]], [6, 8], 0],
    ["Paris weekend", ["Paris"], ["food", "cities"], [["Sam"]], [3, 4], 0],
    ["Provence & Lyon", ["Lyon", "Marseille"], ["food", "wine"], [["Sam"]], [5, 7], 0],
    ["Chamonix hiking", ["Chamonix"], ["hike", "mountains"], [["Alex"]], [5, 7], 0],
    ["Edinburgh Fringe", ["Edinburgh"], ["festival"], [["Alex", "Priya"]], [4, 5], 0],
    ["Cornwall coast", ["St Ives, Cornwall", "Bath"], ["beach", "road trip"], [["Family"]], [5, 7], 0],
    ["Lake District with the kids", ["Keswick, Lake District"], ["hike", "family"], [["Family"]], [4, 6], 0],
    ["Iceland in winter", ["Reykjavík", "Vík"], ["winter", "aurora"], [["Sam"]], [5, 7], 0],
    ["Lofoten in summer", ["Lofoten"], ["hike", "photography"], [["Solo"]], [6, 8], 1],
    ["Norway's fjords", ["Bergen", "Geiranger"], ["hike", "road trip"], [["Sam"]], [6, 8], 0],
    ["Essaouira & Marrakech", ["Marrakech", "Essaouira"], ["food", "beach"], [["Sam"]], [6, 7], 0],
    ["Nile cruise", ["Cairo", "Luxor", "Aswan"], ["history"], [["Family"]], [8, 10], 0],
    ["Bali retreat", ["Ubud, Bali"], ["yoga", "slow travel"], [["Solo"], ["Sam"]], [8, 11], 0],
    ["Philippine islands", ["Manila", "El Nido", "Cebu"], ["beach", "diving"], [["Alex"]], [10, 12], 0],
    ["Thai islands", ["Phuket", "Krabi", "Koh Samui"], ["beach", "diving"], [["Sam"]], [9, 12], 0],
    ["Northern Vietnam", ["Hanoi", "Ha Long Bay"], ["food", "nature"], [["Solo"]], [6, 8], 0],
    ["Sri Lanka by train", ["Colombo", "Kandy", "Ella"], ["rail", "nature"], [["Sam"]], [10, 13], 1],
    ["India's Golden Triangle", ["Delhi", "Agra", "Jaipur", "Udaipur"], ["history", "food"], [["Sam"]], [10, 12], 0],
    ["Goa beach week", ["Goa"], ["beach"], [["Alex", "Priya"]], [6, 8], 0],
    ["Annapurna trek", ["Kathmandu", "Pokhara"], ["hike", "mountains"], [["Alex"]], [14, 18], 1],
    ["Istanbul & Cappadocia", ["Istanbul", "Cappadocia"], ["food", "history"], [["Sam"]], [6, 8], 0],
    ["Maldives", ["Malé"], ["beach", "diving"], [["Sam"]], [6, 8], 1],
    ["Hawaii: Oahu & Maui", ["Honolulu", "Maui"], ["beach", "hike"], [["Sam"], ["Family"]], [8, 10], 0],
    ["Utah national parks", ["Las Vegas", "Zion", "Moab", "Grand Canyon"], ["road trip", "hike"], [["Sam"]], [8, 10], 1],
    ["California coast", ["San Francisco", "Big Sur", "Los Angeles", "San Diego"], ["road trip", "beach"], [["Sam"]], [8, 11], 0],
    ["New Orleans jazz weekend", ["New Orleans"], ["music", "food"], [["Alex", "Priya"]], [3, 4], 0],
    ["Austin & Nashville music", ["Austin", "Nashville"], ["music", "food"], [["Alex"]], [5, 7], 0],
    ["Miami beach weekend", ["Miami"], ["beach"], [["Sam"]], [3, 4], 0],
    ["Alaska summer", ["Anchorage"], ["hike", "nature"], [["Sam"]], [7, 9], 0],
    ["Yosemite camping", ["San Francisco", "Yosemite"], ["hike", "camping"], [["Alex"]], [4, 6], 0],
    ["Mexico City & Oaxaca", ["Mexico City", "Oaxaca"], ["food", "markets"], [["Sam"]], [7, 9], 0],
    ["Cuba", ["Havana", "Viñales"], ["music", "history"], [["Sam"]], [7, 9], 0],
    ["Costa Rica", ["San José", "Arenal", "Manuel Antonio"], ["nature", "beach", "family"], [["Family"]], [9, 11], 0],
    ["Tierra del Fuego", ["Ushuaia", "El Calafate"], ["hike", "nature"], [["Sam"]], [8, 10], 0],
    ["Sydney for New Year", ["Sydney"], ["festival", "beach"], [["Sam"]], [6, 8], 0],
    ["Great Barrier Reef", ["Cairns"], ["diving", "beach"], [["Alex"]], [5, 7], 0],
    ["Tasmania", ["Hobart"], ["road trip", "food"], [["Sam"]], [6, 8], 0],
    ["Madeira hiking", ["Funchal, Madeira"], ["hike"], [["Solo"]], [5, 7], 0],
    ["Azores road trip", ["Ponta Delgada, Azores"], ["road trip", "nature"], [["Sam"]], [6, 8], 0],
    ["Taipei food crawl", ["Taipei"], ["food"], [["Solo"]], [4, 5], 0],
    ["Hong Kong layover", ["Hong Kong"], ["food", "cities"], [["Solo"]], [2, 3], 0],
    ["Guilin & Chengdu", ["Guilin", "Chengdu"], ["nature", "food"], [["Alex"]], [8, 10], 0],
    ["Kruger & the Garden Route", ["Johannesburg", "Kruger Park", "Knysna", "Cape Town"], ["safari", "road trip"], [["Family"]], [11, 14], 0],
    ["Rwanda gorilla trek", ["Kigali"], ["nature", "hike"], [["Sam"]], [5, 6], 1],
  ];
  // repeat destinations (single-city, so they merge into "Regulars" stacks)
  const NYC = ["NYC — client week", "New York offsite", "NYC quarterly", "New York sales kickoff", "NYC — board prep", "NYC workshop week"];
  const FIXED = {
    2017: [["NYC", 3], ["London", 1], ["Berlin", 9]],
    2018: [["NYC", 2], ["NYC", 9], ["SF", 4], ["Chicago", 12]],
    2019: [["NYC", 3], ["NYC", 10], ["London", 5], ["SF", 9], ["Chicago", 12]],
    2020: [["NYC", 2]],
    2021: [["NYC", 10], ["Chicago", 12]],
    2022: [["NYC", 5], ["London", 3], ["Berlin", 6]],
    2023: [["NYC", 3], ["NYC", 9], ["SF", 4], ["Chicago", 12]],
    2024: [["NYC", 6], ["London", 4], ["Berlin", 11]],
    2025: [["NYC", 5], ["SF", 10], ["London", 7]],
    2026: [["NYC", 4]],
  };
  const REG = {
    NYC: () => [pickOne(NYC), ["New York"], ["work"], [["Solo"], ["Alex"]], [3, 5], 0],
    London: () => [pickOne(["London — team week", "London weekend", "London conference"]), ["London"], [pickOne(["work", "work", "theatre"])], [["Solo"], ["Sam"]], [3, 5], 0],
    SF: () => [pickOne(["SF — partner summit", "San Francisco offsite"]), ["San Francisco"], ["work"], [["Solo"], ["Alex"]], [3, 5], 0],
    Berlin: () => [pickOne(["Berlin — conference", "Berlin dev summit"]), ["Berlin"], ["work", "conference"], [["Alex"]], [3, 4], 0],
    Chicago: () => ["Christmas in Chicago", ["Chicago"], ["family", "holidays"], [["Family"]], [5, 6], 0],
  };
  const PER_YEAR = { 2017: 14, 2018: 15, 2019: 16, 2020: 5, 2021: 12, 2022: 17, 2023: 18, 2024: 17, 2025: 18, 2026: 15 };
  const CAPTIONS = ["first morning", "golden hour", "street food", "the view", "old town", "night walk", "market", "trailhead", "sunset", "by the water", "rooftop", "the station", "local bar", "breakfast spot"];

  function makeMedia(t, n) {
    const shapes = [[600, 800], [600, 400], [600, 600], [600, 900], [800, 533], [600, 400]];
    const out = [];
    for (let i = 0; i < n; i++) {
      const [w, h] = shapes[(t.id + i) % shapes.length];
      const si = Math.min(t.stops.length - 1, Math.floor((i / n) * t.stops.length));
      const r = rnd();
      const vid = r < 0.14, local = r > 0.86, post = r > 0.8 && r <= 0.86;
      out.push(post
        ? { src: "instagram", type: "post", url: img(`b${t.id}-${i}`, 600, 750), caption: `${t.stops[si].name} — our reel`, link: `https://www.instagram.com/reel/b${t.id}${i}/`, stop: si }
        : { src: local ? "local" : "immich", type: vid ? "video" : "image", url: img(`b${t.id}-${i}`, w, h), caption: `${t.stops[si].name} · ${pickOne(CAPTIONS)}`, stop: si, ...(vid ? { duration: `0:${String(ri(12, 59))}` } : {}) });
    }
    return out;
  }

  function buildPower(D) {
    const trips = [];
    const usedMC = new Map(); // template title → last year used
    let id = 100;
    const mk = (tpl, year, startDay, maxLen) => {
      const [title, names, tags, comps, [d0, d1], big] = tpl;
      const len = Math.max(2, Math.min(maxLen, ri(d0, d1)));
      const start = addDays(`${year}-01-01`, startDay);
      const t = {
        id: id++, title, status: "past", start, end: addDays(start, len - 1),
        color: PALETTE[(id * 7) % PALETTE.length],
        tags: [...tags], companions: [...pickOne(comps)], starred: false, big: !!big,
        summary: "", stops: names.map((n) => ({ ...place(n) })), notes: [],
      };
      if (t.companions.includes("Family") && !t.tags.includes("family")) t.tags.push("family");
      assignNights(t);
      const photos = t.tags.includes("work") ? ri(4, 40) : big ? ri(180, 900) : ri(30, 220);
      t.photos = photos;
      t.media = makeMedia(t, Math.min(9, Math.max(3, Math.round(photos / 40) + 3)));
      const cs = [...new Set(t.stops.map((s) => s.cc))].map((c) => COUNTRIES[c][0]);
      t.summary = t.stops.length > 1
        ? `${t.stops[0].name} to ${t.stops[t.stops.length - 1].name}${cs.length > 1 ? ` across ${cs.length} countries` : ""}, ${len} days.`
        : `${len} days in ${t.stops[0].name}.`;
      return t;
    };
    for (let year = 2017; year <= 2026; year++) {
      const n = PER_YEAR[year];
      const last = year === 2026 ? 276 : 362; // 2026 stops before "today" (Oct 13)
      const seg = last / n;
      const fixed = (FIXED[year] || []).map(([k, m]) => ({ k, m }));
      const slots = Array.from({ length: n }, (_, i) => ({ i, day: Math.round(i * seg) }));
      // put fixed trips in the slot nearest their month
      const taken = new Map();
      for (const f of fixed) {
        let best = null, bd = Infinity;
        for (const s of slots) { if (taken.has(s.i)) continue; const d = Math.abs(s.day - (f.m - 1) * 30.4); if (d < bd) { bd = d; best = s; } }
        taken.set(best.i, f);
      }
      let bigThisYear = 0;
      for (const s of slots) {
        const room = Math.max(2, Math.floor(seg) - 1);
        const jitter = Math.floor(rnd() * Math.max(1, seg * 0.35));
        let tpl;
        const f = taken.get(s.i);
        if (f) {
          tpl = REG[f.k]();
          if (f.k === "Chicago") { trips.push(mk(tpl, year, 355, 6)); continue; }
        } else {
          // ~1 in 3 trips is a multi-country trip; never repeat one within 4 years
          const wantMC = rnd() < 0.36 && year !== 2020;
          const pool = wantMC ? MC.filter((x) => !(usedMC.get(x[0]) > year - 6)) : SC.filter((x) => !(usedMC.get(x[0]) > year - 3));
          tpl = pickOne(pool.length ? pool : SC);
          if (tpl[5] && bigThisYear >= 2) tpl = pickOne(SC.filter((x) => !x[5]));
          usedMC.set(tpl[0], year);
          if (tpl[5]) bigThisYear++;
        }
        trips.push(mk(tpl, year, Math.min(s.day + jitter, last - 3), room));
      }
    }
    // ~16 highlights: the big, photo-heavy trips, spread over the years
    const byYear = {};
    for (const t of trips) (byYear[t.start.slice(0, 4)] ||= []).push(t);
    for (const [y, list] of Object.entries(byYear)) {
      const ranked = list.filter((t) => !t.tags.includes("work")).sort((a, b) => (b.big - a.big) || (b.photos - a.photos));
      ranked.slice(0, list.length < 16 ? 1 : 2).forEach((t) => (t.starred = true));
    }
    trips.forEach((t) => delete t.big);

    const base = D.map(fromD);
    const planned = [
      { id: 90, title: "NYC — Q4 planning", status: "planned", start: "2026-11-09", end: "2026-11-12", color: "#0ea5e9", tags: ["work"], companions: ["Solo"],
        summary: "Planning week with the New York team.", stops: [{ ...place("New York") }], media: [], notes: ["Book the hotel near the office", "Dinner with Alex on Tuesday"] },
      { id: 91, title: "Christmas in Chicago", status: "planned", start: "2026-12-22", end: "2026-12-27", color: "#ef4444", tags: ["family", "holidays"], companions: ["Family"],
        summary: "Home for the holidays.", stops: [{ ...place("Chicago") }], media: [], notes: ["Gifts for the nephews"] },
      { id: 92, title: "Ski week: Dolomites & Tyrol", status: "planned", start: "2027-01-23", end: "2027-01-31", color: "#14b8a6", tags: ["ski", "winter"], companions: ["Alex", "Priya"],
        summary: "Sella Ronda, then over the Brenner to Innsbruck.", stops: [{ ...place("Venice") }, { ...place("Dolomites (Cortina)") }, { ...place("Innsbruck") }],
        media: [
          { src: "youtube", type: "post", url: img("ski1", 640, 360), caption: "Sella Ronda in one day", link: "https://youtube.com/watch?v=sella" },
          { src: "instagram", type: "post", url: img("ski2", 600, 1000), caption: "Rifugio lunch spots", link: "https://www.instagram.com/reel/rifugio/" },
          { src: "web", type: "post", url: img("ski3"), caption: "Dolomiti Superski pass guide", link: "https://example.com/superski" },
        ], notes: ["Ski pass online", "Train Bolzano → Innsbruck"] },
    ].map((t) => { assignNights(t); t.photos = 0; t.starred = false; return t; });

    return [...base, ...planned, ...ideas(), ...trips];
  }

  /* ---------------- ideas: undated posterboards ---------------- */
  // stops carry rough `nights` and an optional `maybe` flag; the trip has no dates,
  // only a rough season. "Set dates" turns one into a planned trip.
  function ideas() {
    const post = (src, seed, caption, link, w = 600, h = 1000, extra = {}) => ({ src, type: "post", url: img(seed, w, h), caption, link, ...extra });
    return [
      { id: 80, title: "Japan in cherry blossom season", status: "idea", start: null, end: null, season: "Spring", color: "#ec4899",
        tags: ["food", "rail"], companions: ["Sam"], starred: false,
        summary: "Hanami done properly — Tokyo, a ryokan night, then Kyoto before the crowds.",
        stops: [{ ...place("Tokyo"), nights: 4 }, { ...place("Hakone"), nights: 1, maybe: true }, { ...place("Kyoto"), nights: 4 }, { ...place("Nara"), nights: 0 }, { ...place("Osaka"), nights: 2 }],
        media: [
          post("instagram", "sakura1", "Meguro River at night — lanterns + blossoms", "https://www.instagram.com/reel/sakura1/"),
          post("tiktok", "sakura2", "Philosopher's Path at 6am (no crowds)", "https://www.tiktok.com/@kyoto/video/2"),
          post("youtube", "sakura3", "Sakura forecast: how to time it", "https://youtube.com/watch?v=sakura", 640, 360),
          post("web", "sakura4", "Best ryokan in Hakone under ¥40k", "https://example.com/ryokan", 600, 400),
          post("instagram", "sakura5", "Osaka street food in 60s", "https://www.instagram.com/reel/osaka60/"),
          { src: "immich", type: "image", url: img("sakura6", 600, 800), caption: "From our autumn trip — want this in pink", stop: 2 },
        ],
        notes: ["Blossoms peak late Mar – early Apr", "JR Pass or not?", "Book ryokan 3 months out"] },
      { id: 81, title: "Balkans road trip", status: "idea", start: null, end: null, season: "Sep-ish", color: "#f97316",
        tags: ["road trip", "beach", "food"], companions: ["Sam"], starred: false,
        summary: "Pick up a car in Sarajevo, wind down through Montenegro to the Albanian Riviera.",
        stops: [{ ...place("Sarajevo"), nights: 2 }, { ...place("Mostar"), nights: 1 }, { ...place("Kotor"), nights: 3 }, { ...place("Ohrid"), nights: 2, maybe: true }, { ...place("Tirana"), nights: 1 }, { ...place("Berat"), nights: 1 }, { ...place("Ksamil"), nights: 3 }],
        media: [
          post("instagram", "balk1", "Stari Most divers, Mostar", "https://www.instagram.com/reel/mostar/"),
          post("youtube", "balk2", "Driving the Bay of Kotor", "https://youtube.com/watch?v=kotor", 640, 360),
          post("web", "balk3", "One-way car rental across Balkan borders", "https://example.com/balkan-rental", 600, 400),
          post("tiktok", "balk4", "Ksamil beaches ranked", "https://www.tiktok.com/@alb/video/9"),
        ],
        notes: ["Green card insurance for the car", "Ohrid is a detour — worth it?"] },
      { id: 82, title: "Patagonia someday", status: "idea", start: null, end: null, season: "Nov–Mar", color: "#22c55e",
        tags: ["hike", "nature"], companions: ["Sam"], starred: false,
        summary: "After the W Trek: the far south — Ushuaia, glaciers, and Bariloche's lakes.",
        stops: [{ ...place("Buenos Aires"), nights: 2 }, { ...place("Ushuaia"), nights: 3 }, { ...place("El Calafate"), nights: 3 }, { ...place("Puerto Natales"), nights: 2, maybe: true }, { ...place("Bariloche"), nights: 4 }],
        media: [
          post("instagram", "pat1", "Beagle Channel penguins", "https://www.instagram.com/reel/beagle/"),
          post("web", "pat2", "Perito Moreno mini-trekking", "https://example.com/perito", 600, 400),
          post("youtube", "pat3", "Ruta 40 by campervan", "https://youtube.com/watch?v=ruta40", 640, 360),
        ],
        notes: ["Combine with Chile again?"] },
      { id: 83, title: "Northern lights: Lofoten → Lapland", status: "idea", start: null, end: null, season: "Winter", color: "#6366f1",
        tags: ["winter", "aurora", "rail"], companions: ["Sam"], starred: false,
        summary: "Aurora chasing across three countries by train and bus.",
        stops: [{ ...place("Lofoten"), nights: 3 }, { ...place("Tromsø"), nights: 2 }, { ...place("Abisko"), nights: 2 }, { ...place("Rovaniemi"), nights: 3, maybe: true }],
        media: [
          post("instagram", "aur1", "Aurora over Reine", "https://www.instagram.com/reel/reine/"),
          post("tiktok", "aur2", "Abisko sky station at -25°", "https://www.tiktok.com/@north/video/4"),
        ],
        notes: [] },
    ].map((t) => { t.photos = 0; spreadMediaOverStops(t); return t; });
  }

  const D = window.TRIPS || [];
  const power = buildPower(D);
  const light = [...D.map(fromD), ideas()[0]];

  window.TA_GAZ = GAZ;
  window.TA_COUNTRIES = countriesOut;
  window.TA_DATA = { power, light };
})();
