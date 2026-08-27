// ============================================================
// SAMARAMBH — SITE CONFIG
// Edit everything here. No need to touch component files.
// ============================================================

const config = {
  fest: {
    name: "Freshers' & Star Night",
    year: "2026",
    tagline: "Everyone's invited.",
    date: "August 30, 2026",
    isoDate: "2026-08-30T15:00:00+05:30",
    time: "3:00 PM onwards",
    venue: "Main Ground",
    college: "Echelon Institute of Technology, Faridabad",
    collegeShort: "EIT Faridabad",
    ipu: "IPU University",
    // Promotional copy — used for the marketing/hype section
    marketing: {
      checklist: ["Good music?", "Your gang?", "Freshers' madness?"],
      pitch:
        "This isn't just a freshers' party. It's THE night of the session. Echelon students, GGSIPU fam, freshers from other colleges — everyone's invited. So bring your gang, your best moves and your loudest voice.",
    },
  },

  artist: {
    name: "Sunanda Sharma",
    role: "Live at Echelon",
    bio: "One campus, one star, one unforgettable night — Sunanda Sharma brings her live energy to Echelon for a Freshers' & Star Night open to everyone: Echelon students, the wider GGSIPU family, freshers from other colleges, and anyone ready to experience a truly vibrant campus night.",
    // Best-effort list from general knowledge — I don't have web search in
    // this chat to verify her current setlist, so please confirm/correct
    // these titles before the event.
    songs: ["Mymmu Nu Pasand", "Duji Vari Pyar", "Boyfriend", "Choti Umar", "Ni Main Sass Kuttni"],
    // Filenames expected in src/assets/audio/ — must match 1:1 with songs above
    audioFiles: [
      "02-mummy-nu-pasand.mp3",
      "01-duji-vari-pyar.mp3",
      "03-boyfriend.mp3",
      "04-choti-umar.mp3",
      "05-ni-main-sass-kuttni.mp3",
    ],
    // Clip window per track (seconds) - player plays only this slice then moves to next
    // Edit these per song once you know which part sounds best as a teaser
    audioClips: [
      { start: 8, end: 18 },
      { start: 46, end: 56 },
      { start: 10, end: 25 },
      { start: 10, end: 25 },
      { start: 10, end: 25 },
    ],
  },

  schedule: [
    { time: "3:00 PM", title: "Gates open", desc: "Entry, seating & merch stalls open" },
    { time: "5:00 PM", title: "Gates close", desc: "Last entry — no admissions after this" },
    { time: "6:00 PM", title: "Sunanda Sharma takes the stage", desc: "The main event begins" },
  ],

  registration: {
    enabled: true,
    formEndpoint: "/api/register",
    fields: ["studentType", "name", "email", "phone", "college", "passingYear"],
  },

  // Student coordinators — shown always. Add/remove entries as needed.
  studentCoordinators: [
    { name: "Sapna", role: "Student Coordinator", phone: "8595645795" },
    { name: "Shuddhi", role: "Student Coordinator", phone: "9897988170" },
    { name: "Raghav", role: "Student Coordinator", phone: "8130707852" },
    { name: "Abhinav", role: "Student Coordinator", phone: "9971713324" },
  ],

  // Faculty coordinators — optional section. Set enabled: false to hide entirely.
  facultyCoordinators: {
    enabled: true,
    list: [
      { name: "Dr. Anupama Jain", role: "Faculty Coordinator", phone: "9891780167" },
      { name: "Dr. Sunil Verma", role: "Faculty Coordinator", phone: "9910788932" },
    ],
  },

  // Past sponsors — optional section. Set enabled: false to hide entirely.
  sponsors: {
    enabled: true,
    list: [
      { name: "Pizza Hut", logo: "sponsor1.jpeg" },
      { name: "Giani Ice Cream", logo: "sponsor2.jpeg" },
      { name: "WJC", logo: "sponsor3.jpeg" },
      { name: "BSC", logo: "sponsor4.jpeg" },
      { name: "The Burger Club", logo: "sponsor5.jpeg" },
      { name: "Cornitos", logo: "sponsor6.jpeg" },
      { name: "Hindware", logo: "sponsor7.jpeg" },
      { name: "Swiss Beauty", logo: "sponsor8.jpeg" },
      { name: "Jaquar", logo: "sponsor9.jpeg" },
    ],
  },

  contact: {
    enabled: true,
    email: "fest@eitfaridabad.co.in",
    phone: "9999753763",
    address: "Echelon Institute of Technology, Faridabad, Haryana",
  },

  socials: {
    instagram: "https://instagram.com/eit_faridabad",
    facebook: "https://facebook.com/eitfaridabad",
    youtube: "",
  },

  theme: {
    // Vibrant, warm concert-night palette
    bg: "#1a0b2e",       // deep night purple base
    bgAlt: "#2d1145",
    accent1: "#ff3d68",  // hot pink/coral
    accent2: "#ffb020",  // amber/gold
    accent3: "#7c3aed",  // violet
    text: "#fdf6ec",
    textMuted: "#c9b8d9",
  },
};

export default config;