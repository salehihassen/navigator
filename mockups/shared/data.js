// Mock data shared by all three mockups. Images are placeholders from picsum.
const img = (seed, w = 600, h = 400) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

window.TRIPS = [
  {
    id: 1, title: "Japan in Autumn", status: "past",
    start: "2025-11-02", end: "2025-11-16", color: "#f97316",
    tags: ["food", "temples", "rail"],
    summary: "Two weeks from Tokyo to Kyoto and down to Hiroshima.",
    stops: [
      { name: "Tokyo", lng: 139.69, lat: 35.69 },
      { name: "Hakone", lng: 139.02, lat: 35.23 },
      { name: "Kyoto", lng: 135.77, lat: 35.01 },
      { name: "Hiroshima", lng: 132.46, lat: 34.39 },
    ],
    media: [
      { src: "immich", type: "image", url: img("jp1", 600, 800), caption: "Senso-ji at dawn" },
      { src: "immich", type: "image", url: img("jp2"), caption: "Shinjuku nights" },
      { src: "immich", type: "video", url: img("jp3"), caption: "Shinkansen window", duration: "0:42" },
      { src: "local", type: "image", url: img("jp4", 600, 600), caption: "Fushimi Inari" },
      { src: "immich", type: "image", url: img("jp5", 600, 900), caption: "Arashiyama bamboo" },
      { src: "instagram", type: "post", url: img("jp6", 600, 750), caption: "Best ramen in Kyoto (reel)", link: "https://www.instagram.com/reel/abc123/" },
      { src: "immich", type: "image", url: img("jp7"), caption: "Miyajima torii" },
      { src: "local", type: "video", url: img("jp8", 600, 340), caption: "Onsen steam", duration: "1:15" },
    ],
  },
  {
    id: 2, title: "Lisbon & the Algarve", status: "past",
    start: "2024-06-08", end: "2024-06-18", color: "#0ea5e9",
    tags: ["coast", "beach"],
    summary: "Tram 28, pastéis de nata, then down to Lagos for the cliffs.",
    stops: [
      { name: "Lisbon", lng: -9.14, lat: 38.72 },
      { name: "Sintra", lng: -9.39, lat: 38.80 },
      { name: "Lagos", lng: -8.67, lat: 37.10 },
    ],
    media: [
      { src: "immich", type: "image", url: img("pt1", 600, 800), caption: "Alfama rooftops" },
      { src: "immich", type: "image", url: img("pt2"), caption: "Pena Palace" },
      { src: "immich", type: "video", url: img("pt3"), caption: "Ponta da Piedade kayak", duration: "2:03" },
      { src: "local", type: "image", url: img("pt4", 600, 600), caption: "Sunset at Lagos" },
      { src: "immich", type: "image", url: img("pt5", 600, 900), caption: "Tram 28" },
    ],
  },
  {
    id: 3, title: "Iceland Ring Road", status: "past",
    start: "2023-09-01", end: "2023-09-10", color: "#22c55e",
    tags: ["road trip", "hike"],
    summary: "Clockwise around Route 1 in a camper van.",
    stops: [
      { name: "Reykjavík", lng: -21.94, lat: 64.15 },
      { name: "Vík", lng: -19.01, lat: 63.42 },
      { name: "Höfn", lng: -15.21, lat: 64.25 },
      { name: "Akureyri", lng: -18.09, lat: 65.68 },
    ],
    media: [
      { src: "immich", type: "image", url: img("is1", 600, 800), caption: "Skógafoss" },
      { src: "immich", type: "image", url: img("is2"), caption: "Black sand at Reynisfjara" },
      { src: "immich", type: "video", url: img("is3"), caption: "Glacier lagoon", duration: "0:58" },
      { src: "immich", type: "image", url: img("is4", 600, 600), caption: "Northern lights" },
    ],
  },
  {
    id: 4, title: "Patagonia trek", status: "planned",
    start: "2027-02-10", end: "2027-02-24", color: "#a855f7",
    tags: ["hike", "camping"],
    summary: "W Trek in Torres del Paine, then El Chaltén.",
    stops: [
      { name: "Santiago", lng: -70.67, lat: -33.45 },
      { name: "Puerto Natales", lng: -72.51, lat: -51.73 },
      { name: "El Chaltén", lng: -72.89, lat: -49.33 },
    ],
    media: [
      { src: "instagram", type: "post", url: img("pg1", 600, 1000), caption: "W Trek day 3 — Mirador Base Las Torres", link: "https://www.instagram.com/reel/xyz789/" },
      { src: "instagram", type: "post", url: img("pg2", 600, 1000), caption: "Fitz Roy sunrise hike", link: "https://www.instagram.com/reel/fitz01/" },
      { src: "youtube", type: "post", url: img("pg3", 640, 360), caption: "Packing list for Patagonia", link: "https://youtube.com/watch?v=demo" },
      { src: "web", type: "post", url: img("pg4", 600, 400), caption: "Refugio booking guide", link: "https://example.com/refugios" },
      { src: "instagram", type: "post", url: img("pg5", 600, 1000), caption: "Grey Glacier kayak", link: "https://www.instagram.com/reel/grey22/" },
    ],
    notes: ["Book refugios by October", "Buses Puerto Natales ↔ El Calafate", "Rent crampons in town"],
  },
  {
    id: 5, title: "Morocco loop", status: "planned",
    start: "2026-12-18", end: "2026-12-30", color: "#eab308",
    tags: ["desert", "food"],
    summary: "Marrakech → Sahara → Fes over the holidays.",
    stops: [
      { name: "Marrakech", lng: -7.99, lat: 31.63 },
      { name: "Merzouga", lng: -4.01, lat: 31.10 },
      { name: "Fes", lng: -5.00, lat: 34.03 },
      { name: "Chefchaouen", lng: -5.27, lat: 35.17 },
    ],
    media: [
      { src: "instagram", type: "post", url: img("ma1", 600, 1000), caption: "Sahara camp night sky", link: "https://www.instagram.com/reel/sahara/" },
      { src: "tiktok", type: "post", url: img("ma2", 600, 1000), caption: "Fes medina food tour", link: "https://www.tiktok.com/@x/video/1" },
      { src: "web", type: "post", url: img("ma3"), caption: "Riad shortlist", link: "https://example.com/riads" },
    ],
    notes: ["Check train Marrakech → Fes", "Desert tour 2 nights"],
  },
];
