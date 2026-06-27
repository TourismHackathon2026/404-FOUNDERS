import mongoose from "mongoose";
import dotenv from "dotenv";
import BusStop from "./models/BusStop.js";
import BusRoute from "./models/BusRoute.js";

dotenv.config();

// ─────────────────────────────────────────────────────────────
// REAL NEPAL BUS FARE MATRIX (Government Rate 2024)
// Tier 1: 0-5km   → NPR 25
// Tier 2: 5-10km  → NPR 35
// Tier 3: 10-15km → NPR 40
// Tier 4: 15-20km → NPR 45
// Tier 5: 20+km   → NPR 50
// ─────────────────────────────────────────────────────────────
export const getFare = (distanceKm) => {
  if (distanceKm <= 5) return 25;
  if (distanceKm <= 10) return 35;
  if (distanceKm <= 15) return 40;
  if (distanceKm <= 20) return 45;
  return 50;
};

// ─────────────────────────────────────────────────────────────
// ALL BUS STOPS — Real GPS coordinates from Kathmandu Valley
// Format: [longitude, latitude] — MongoDB GeoJSON order
// ─────────────────────────────────────────────────────────────
const stops = [
  // ── Central Kathmandu Hub ──
  {
    name: "Ratnapark",
    landmark_near: "Rani Pokhari, Dharahara, Tundikhel",
    tourist_places: [
      "Rani Pokhari",
      "Dharahara Tower",
      "Kathmandu Durbar Square (10 min walk)",
    ],
    location: { type: "Point", coordinates: [85.3149, 27.7061] },
  },
  {
    name: "Sundhara",
    landmark_near: "Dharahara Tower Park, Civil Mall",
    tourist_places: ["Dharahara Tower", "Golden Water Spouts", "Civil Mall"],
    location: { type: "Point", coordinates: [85.3125, 27.7011] },
  },
  {
    name: "Bagbazar",
    landmark_near: "Bagbazar area, Central Kathmandu",
    tourist_places: ["Padmini Traditional Market"],
    location: { type: "Point", coordinates: [85.3175, 27.7058] },
  },
  {
    name: "Bhadrakali",
    landmark_near: "Bhadrakali Temple, Sahid Gate area",
    tourist_places: ["Bhadrakali Temple", "Martyr's Gate (Sahid Gate)"],
    location: { type: "Point", coordinates: [85.3148, 27.6997] },
  },
  {
    name: "Old Buspark",
    landmark_near: "Khula Manch, Central Kathmandu",
    tourist_places: ["Khula Manch National Square"],
    location: { type: "Point", coordinates: [85.3164, 27.7028] },
  },
  {
    name: "Jamal",
    landmark_near: "Rastriya Naach Ghar, Rani Pokhari East",
    tourist_places: ["National Dance Theatre", "Rani Pokhari East Bank"],
    location: { type: "Point", coordinates: [85.3156, 27.7081] },
  },
  {
    name: "Kamaladi",
    landmark_near: "Kamaladi Ganesha Temple",
    tourist_places: ["Kamaladi Ganesha Temple (White Ganesha)"],
    location: { type: "Point", coordinates: [85.3203, 27.7067] },
  },
  {
    name: "Kamalpokhari",
    landmark_near: "Kamal Pokhari Lotus Pond",
    tourist_places: ["Kamal Pokhari Lotus Pond Park"],
    location: { type: "Point", coordinates: [85.3256, 27.7089] },
  },
  {
    name: "Charkhal",
    landmark_near: "Charkhal junction",
    tourist_places: ["Historical Judicial Rana Administrative Block"],
    location: { type: "Point", coordinates: [85.3312, 27.7056] },
  },

  // ── Thamel & North Kathmandu ──
  {
    name: "Thamel",
    landmark_near: "Thamel Tourist Area, Garden of Dreams",
    tourist_places: [
      "Garden of Dreams",
      "Thamel Night Market",
      "Tridevi Temple",
    ],
    location: { type: "Point", coordinates: [85.3112, 27.7149] },
  },
  {
    name: "Lainchaur",
    landmark_near: "Narayanhiti Palace West Gate",
    tourist_places: [
      "Narayanhiti Palace Museum (West Gate)",
      "British Council",
    ],
    location: { type: "Point", coordinates: [85.3134, 27.7145] },
  },
  {
    name: "Lazimpat",
    landmark_near: "Narayanhiti Palace North Gate",
    tourist_places: ["Narayanhiti Palace Museum", "Shangri-La Heritage Garden"],
    location: { type: "Point", coordinates: [85.3189, 27.7214] },
  },
  {
    name: "Sorhakhutte",
    landmark_near: "Sorhakhutte 16-Pillar Junction",
    tourist_places: ["Historical 16-Pillar Rest House Junction"],
    location: { type: "Point", coordinates: [85.3056, 27.7189] },
  },
  {
    name: "Dhumbarahi",
    landmark_near: "Dhumbarahi Varaha Temple",
    tourist_places: [
      "Dhumbarahi Varaha Temple (Ancient Vaishnavite Stone Carving)",
    ],
    location: { type: "Point", coordinates: [85.3421, 27.7241] },
  },

  // ── Gongabu / New Buspark North ──
  {
    name: "Gongabu Buspark",
    landmark_near: "New Bus Park, Gongabu",
    tourist_places: ["Lhotse Mall & Transit Hub"],
    location: { type: "Point", coordinates: [85.3045, 27.7303] },
  },
  {
    name: "Samakhusi",
    landmark_near: "Samakhusi Town Center",
    tourist_places: ["Radha Krishna Temple"],
    location: { type: "Point", coordinates: [85.3112, 27.7289] },
  },
  {
    name: "Basundhara",
    landmark_near: "Basundhara Community Park",
    tourist_places: ["Basundhara Community Eco-Park"],
    location: { type: "Point", coordinates: [85.3214, 27.7356] },
  },
  {
    name: "Narayan Gopal Chowk",
    landmark_near: "Maharajgunj, near Palace",
    tourist_places: ["Maharajgunj Palace Complex Walls"],
    location: { type: "Point", coordinates: [85.3314, 27.7348] },
  },
  {
    name: "Maharajgunj",
    landmark_near: "Maharajgunj Embassy Enclave",
    tourist_places: ["Nirvana Palace Gardens"],
    location: { type: "Point", coordinates: [85.3323, 27.7378] },
  },
  {
    name: "Bansbari",
    landmark_near: "Bansbari Area",
    tourist_places: ["Royal Family Historical Area"],
    location: { type: "Point", coordinates: [85.3345, 27.7421] },
  },
  {
    name: "Golfutar",
    landmark_near: "Golfutar Recreation Park",
    tourist_places: ["Golfutar Basketball Arena & Recreation Park"],
    location: { type: "Point", coordinates: [85.3412, 27.7512] },
  },
  {
    name: "Bhangrahiti",
    landmark_near: "Near Budhanilkantha inflow",
    tourist_places: ["Budhanilkantha Spring Inflow Spouts"],
    location: { type: "Point", coordinates: [85.3512, 27.7634] },
  },
  {
    name: "Narayanthan",
    landmark_near: "Near Budhanilkantha Temple",
    tourist_places: ["Budhanilkantha Temple (Giant Reclining Vishnu in water)"],
    location: { type: "Point", coordinates: [85.3614, 27.7725] },
  },
  {
    name: "Budhanilkantha School",
    landmark_near: "Shivapuri National Park Entry",
    tourist_places: [
      "Shivapuri Nagarjun National Park Entry",
      "Tarebhir Hiking Trail",
    ],
    location: { type: "Point", coordinates: [85.3625, 27.7784] },
  },
  {
    name: "Machhapokhari",
    landmark_near: "Fish Pond Monument Crossing",
    tourist_places: ["Historical Fish Pond Monument"],
    location: { type: "Point", coordinates: [85.2971, 27.7334] },
  },
  {
    name: "Balaju",
    landmark_near: "Balaju Water Gardens",
    tourist_places: ["Balaju Water Gardens (22 Stone Water Spouts)"],
    location: { type: "Point", coordinates: [85.2923, 27.7322] },
  },
  {
    name: "Bypass",
    landmark_near: "Northern Ring Road Bypass",
    tourist_places: ["Balaju Northern Hill Hiking Base"],
    location: { type: "Point", coordinates: [85.2956, 27.7364] },
  },

  // ── Bouddha / East Kathmandu ──
  {
    name: "Putalisadak",
    landmark_near: "Singha Durbar Main Gate area",
    tourist_places: ["Singha Durbar (Government Seat)"],
    location: { type: "Point", coordinates: [85.3194, 27.7042] },
  },
  {
    name: "Kalopul",
    landmark_near: "Dhobi Khola Riverfront",
    tourist_places: ["Dhobi Khola Riverfront Promenade"],
    location: { type: "Point", coordinates: [85.3341, 27.7139] },
  },
  {
    name: "Chabahil",
    landmark_near: "Chabahil Stupa (3rd Century BC)",
    tourist_places: [
      "Chabahil Stupa (Charumati Stupa)",
      "Chandra Binayak Ganesh Temple",
    ],
    location: { type: "Point", coordinates: [85.3464, 27.7171] },
  },
  {
    name: "Bouddha",
    landmark_near: "Boudhanath Stupa UNESCO World Heritage",
    tourist_places: [
      "Boudhanath Stupa (UNESCO World Heritage)",
      "Kopan Monastery",
      "Taragaon Museum",
    ],
    location: { type: "Point", coordinates: [85.3621, 27.7215] },
  },
  {
    name: "Jorpati",
    landmark_near: "Gokarneshwor Mahadev Temple route",
    tourist_places: ["Gokarneshwor Mahadev Temple"],
    location: { type: "Point", coordinates: [85.3784, 27.7223] },
  },
  {
    name: "Gokarna",
    landmark_near: "Gokarna Forest Resort",
    tourist_places: [
      "Gokarna Forest Resort & Safari Golf Course",
      "Gokarneshwor Mahadev Temple",
    ],
    location: { type: "Point", coordinates: [85.3956, 27.7391] },
  },
  {
    name: "Nayapati",
    landmark_near: "Sundarijal watershed trail",
    tourist_places: ["Sundarijal Watershed Mountain Streams Trailhead"],
    location: { type: "Point", coordinates: [85.4098, 27.7445] },
  },
  {
    name: "Sundarijal",
    landmark_near: "Sundarijal Waterfalls, Shivapuri National Park",
    tourist_places: [
      "Sundarijal Waterfalls",
      "Shivapuri National Park Entry (Helambu Route)",
    ],
    location: { type: "Point", coordinates: [85.4241, 27.7561] },
  },
  {
    name: "Makalbari",
    landmark_near: "Bagmati Eco-Park",
    tourist_places: ["Bagmati Eco-Park Linear Paths"],
    location: { type: "Point", coordinates: [85.3934, 27.7211] },
  },
  {
    name: "Dillibazar",
    landmark_near: "Dillibazar area",
    tourist_places: ["Historical Dillibazar Charikhal Fountain"],
    location: { type: "Point", coordinates: [85.3276, 27.7041] },
  },
  {
    name: "Gaushala",
    landmark_near: "Pashupatinath Temple (3 min walk)",
    tourist_places: [
      "Pashupatinath Temple (UNESCO World Heritage - 3 min walk)",
      "Deer Park",
    ],
    location: { type: "Point", coordinates: [85.3458, 27.7073] },
  },
  {
    name: "Tilganga",
    landmark_near: "Bagmati River Holy Confluence",
    tourist_places: [
      "Tilganga Eye Center",
      "Bagmati River Holy Ritual Confluence",
    ],
    location: { type: "Point", coordinates: [85.3491, 27.7028] },
  },
  {
    name: "Sinamangal",
    landmark_near: "Aviation Museum Nepal",
    tourist_places: ["Aviation Museum Nepal (inside a real Airbus aircraft)"],
    location: { type: "Point", coordinates: [85.3494, 27.6971] },
  },
  {
    name: "Gopi Krishna",
    landmark_near: "Gopi Krishna Cinema area",
    tourist_places: ["Gopi Krishna Heritage Cinema Crossing"],
    location: { type: "Point", coordinates: [85.3489, 27.7194] },
  },

  // ── Airport to City ──
  {
    name: "Tribhuvan Airport",
    landmark_near: "TIA International Airport",
    tourist_places: ["Aviation Museum (Sinamangal side)", "Airport Viewpoint"],
    location: { type: "Point", coordinates: [85.3591, 27.6976] },
  },
  {
    name: "Tinkune",
    landmark_near: "Tinkune Bus Stop, Royal Nepal Golf Club nearby",
    tourist_places: ["Royal Nepal Golf Club (Nearby)"],
    location: { type: "Point", coordinates: [85.3486, 27.6836] },
  },
  {
    name: "Minbhawan",
    landmark_near: "Civil Service Hospital area",
    tourist_places: ["VS Niketan Historical Landmark"],
    location: { type: "Point", coordinates: [85.3414, 27.6873] },
  },
  {
    name: "Naya Baneshwor",
    landmark_near: "Federal Parliament / ICC",
    tourist_places: [
      "Federal Parliament (International Convention Center)",
      "Baneshwor Shopping",
    ],
    location: { type: "Point", coordinates: [85.3331, 27.6917] },
  },
  {
    name: "Babarmahal",
    landmark_near: "Babar Mahal Vilas Heritage Palace",
    tourist_places: [
      "Babar Mahal Vilas (Heritage Boutique Palace)",
      "Nepal Art Council Gallery",
    ],
    location: { type: "Point", coordinates: [85.3248, 27.6911] },
  },
  {
    name: "Maitighar",
    landmark_near: "Maitighar Mandala National Monument",
    tourist_places: ["Maitighar Mandala (National Monument Park)"],
    location: { type: "Point", coordinates: [85.3216, 27.6923] },
  },

  // ── Baneshwor / East ──
  {
    name: "Purano Baneshwor",
    landmark_near: "Bhimsengola Shrines",
    tourist_places: ["Bhimsengola Religious Shrines"],
    location: { type: "Point", coordinates: [85.3392, 27.6998] },
  },
  {
    name: "Maitidevi",
    landmark_near: "Maitidevi Temple (Shaktipitha)",
    tourist_places: ["Maitidevi Temple (Highly Revered Shaktipitha)"],
    location: { type: "Point", coordinates: [85.3308, 27.7031] },
  },
  {
    name: "Old Baneshwor",
    landmark_near: "Mahendra Ratna Campus",
    tourist_places: ["Mahendra Ratna Campus Historical Grounds"],
    location: { type: "Point", coordinates: [85.3375, 27.6978] },
  },

  // ── Bhaktapur Route ──
  {
    name: "Koteshwor",
    landmark_near: "Mahadevsthan Temple Koteshwor",
    tourist_places: ["Mahadevsthan Temple", "Jadibuti Heritage Hub"],
    location: { type: "Point", coordinates: [85.3489, 27.6773] },
  },
  {
    name: "Jadibuti",
    landmark_near: "Manohara River Park",
    tourist_places: ["Manohara River Park Banks"],
    location: { type: "Point", coordinates: [85.3571, 27.6761] },
  },
  {
    name: "Lokanthali",
    landmark_near: "Manohara River Confluence",
    tourist_places: ["Manohara River Confluence Sightseeing"],
    location: { type: "Point", coordinates: [85.3654, 27.6749] },
  },
  {
    name: "Kaushaltar",
    landmark_near: "Kaushaltar Viewpoint Marketplace",
    tourist_places: ["Kaushaltar Viewpoint"],
    location: { type: "Point", coordinates: [85.3739, 27.6738] },
  },
  {
    name: "Gaththaghar",
    landmark_near: "Citizen Park, Siddhi Binayak Temple nearby",
    tourist_places: ["Citizen Park Greens", "Siddhi Binayak Temple"],
    location: { type: "Point", coordinates: [85.3812, 27.6761] },
  },
  {
    name: "Thimi",
    landmark_near: "Balkumari Temple Thimi, Traditional Pottery Square",
    tourist_places: [
      "Balkumari Temple Thimi",
      "Traditional Pottery Square of Thimi",
    ],
    location: { type: "Point", coordinates: [85.3934, 27.6775] },
  },
  {
    name: "Sallaghari",
    landmark_near: "Sallaghari Pine Forest",
    tourist_places: ["Sallaghari Pine Forest Landscape"],
    location: { type: "Point", coordinates: [85.4143, 27.6723] },
  },
  {
    name: "Suryabinayak",
    landmark_near: "Suryabinayak Ganesh Temple",
    tourist_places: ["Suryabinayak Ganesh Temple (Famous Guardian Deity)"],
    location: { type: "Point", coordinates: [85.4219, 27.6659] },
  },
  {
    name: "Bhaktapur",
    landmark_near: "Bhaktapur Durbar Square UNESCO",
    tourist_places: [
      "Bhaktapur Durbar Square (UNESCO)",
      "55-Window Palace",
      "Nyatapola Temple",
      "Pottery Square",
    ],
    location: { type: "Point", coordinates: [85.4274, 27.6732] },
  },
  {
    name: "Balkumari",
    landmark_near: "Balkumari Temple, Lalitpur",
    tourist_places: ["Balkumari Temple Complex"],
    location: { type: "Point", coordinates: [85.3421, 27.6698] },
  },
  {
    name: "Gwarko",
    landmark_near: "Balkumari Temple Ancient Lalitpur",
    tourist_places: ["Balkumari Temple (Ancient Lalitpur Heritage)"],
    location: { type: "Point", coordinates: [85.3331, 27.6621] },
  },

  // ── Changunarayan Route ──
  {
    name: "Duwakot",
    landmark_near: "Duwakot Hilltop Viewpoint",
    tourist_places: ["Duwakot Hilltop Panoramic Country Viewpoints"],
    location: { type: "Point", coordinates: [85.4014, 27.6961] },
  },
  {
    name: "Mwahan",
    landmark_near: "Changu Valley Ancient Pine Trails",
    tourist_places: ["Changu Valley Ancient Pine Trailwoods"],
    location: { type: "Point", coordinates: [85.4156, 27.7012] },
  },
  {
    name: "Changunarayan",
    landmark_near: "Changu Narayan Temple UNESCO",
    tourist_places: [
      "Changu Narayan Temple (Oldest Inscribed Hindu Temple in Nepal - UNESCO)",
      "Changu Museum",
    ],
    location: { type: "Point", coordinates: [85.4278, 27.7159] },
  },
  {
    name: "Nepal Engineering College",
    landmark_near: "NEC Campus, Bhaktapur",
    tourist_places: [
      "Nepal Engineering College (Hackathon Venue)",
      "Bhaktapur Heritage Gateway",
    ],
    location: { type: "Point", coordinates: [85.4156, 27.7109] },
  },

  // ── Patan / South Kathmandu ──
  {
    name: "Lagankhel",
    landmark_near: "Patan Bus Terminal, Ashoka Stupa",
    tourist_places: ["Batuk Bhairav Temple", "Lagankhel Stupa (Ashoka Stupa)"],
    location: { type: "Point", coordinates: [85.3236, 27.6672] },
  },
  {
    name: "Jawalakhel",
    landmark_near: "Central Zoo, Tibetan Refugee Handicraft Center",
    tourist_places: [
      "Central Zoo of Nepal",
      "Jawalakhel Handicraft Center (Tibetan Refugee Camp)",
    ],
    location: { type: "Point", coordinates: [85.3121, 27.6684] },
  },
  {
    name: "Pulchowk",
    landmark_near: "Patan Durbar Square walking distance",
    tourist_places: [
      "Patan Durbar Square (Walking Distance)",
      "UN House Grounds",
    ],
    location: { type: "Point", coordinates: [85.3164, 27.6778] },
  },
  {
    name: "Kupondole",
    landmark_near: "Kandevsthan Temple",
    tourist_places: [
      "Kupondole Art Murals & Street Galleries",
      "Kandevsthan Temple",
    ],
    location: { type: "Point", coordinates: [85.3161, 27.6869] },
  },
  {
    name: "Thapathali",
    landmark_near: "Thapathali Heritage Ghats, Kala Mochan Temple",
    tourist_places: [
      "Thapathali Heritage Ghats",
      "Kala Mochan Temple",
      "NRB Museum",
    ],
    location: { type: "Point", coordinates: [85.3197, 27.6903] },
  },
  {
    name: "Tripureshwor",
    landmark_near: "Tripureshwar Mahadev Temple, Dasharath Stadium",
    tourist_places: [
      "Tripureshwar Mahadev Temple",
      "Dasharath Rangasala Stadium",
    ],
    location: { type: "Point", coordinates: [85.3115, 27.6934] },
  },
  {
    name: "Patan Dhoka",
    landmark_near: "Historical Patan City Gate",
    tourist_places: ["Historical Patan Gate", "Madan Puraskar Library"],
    location: { type: "Point", coordinates: [85.3214, 27.6789] },
  },
  {
    name: "Mangal Bazar",
    landmark_near: "Patan Durbar Square UNESCO",
    tourist_places: [
      "Patan Durbar Square (UNESCO World Heritage)",
      "Krishna Mandir",
      "Patan Museum",
    ],
    location: { type: "Point", coordinates: [85.3254, 27.6728] },
  },
  {
    name: "Satdobato",
    landmark_near: "ANFA Complex, Sports Complex",
    tourist_places: ["ANFA Complex", "International Sports Complex"],
    location: { type: "Point", coordinates: [85.3274, 27.6517] },
  },
  {
    name: "Ekantakuna",
    landmark_near: "Central Zoo Forest Edge",
    tourist_places: ["Central Zoo Forest Edge Trail"],
    location: { type: "Point", coordinates: [85.3039, 27.6681] },
  },
  {
    name: "Kumaripati",
    landmark_near: "Patan Shopping High Street",
    tourist_places: ["Patan Shopping High Street Lanes"],
    location: { type: "Point", coordinates: [85.3182, 27.6669] },
  },
  {
    name: "Bhaisepati",
    landmark_near: "Bhaisepati Scenic Plateau",
    tourist_places: ["Bhaisepati Scenic Plateau View Parks"],
    location: { type: "Point", coordinates: [85.3012, 27.6434] },
  },
  {
    name: "Sunakothi",
    landmark_near: "Balkumari Temple Sunakothi",
    tourist_places: ["Balkumari Temple Sunakothi (Old Newar Houses)"],
    location: { type: "Point", coordinates: [85.3212, 27.6323] },
  },
  {
    name: "Thecho",
    landmark_near: "Bramhayani Temple, Mustard Oil Press Mills",
    tourist_places: [
      "Historical Bramhayani Temple",
      "Traditional Mustard Oil Press Mills",
    ],
    location: { type: "Point", coordinates: [85.3194, 27.6156] },
  },
  {
    name: "Chapagaon",
    landmark_near: "Bajrabarahi Temple Sacred Forest",
    tourist_places: [
      "Bajrabarahi Temple (Sacred Forest Sanctuary Protected by Deity taboos)",
    ],
    location: { type: "Point", coordinates: [85.3211, 27.5945] },
  },
  {
    name: "Bungamati",
    landmark_near: "Rato Machindranath Temple",
    tourist_places: [
      "Rato Machindranath Temple (Home Base of Rain God)",
      "Master Woodcarving Artisan Courtyards",
    ],
    location: { type: "Point", coordinates: [85.2978, 27.6189] },
  },

  // ── West / Swayambhu / Kalanki ──
  {
    name: "Kalanki",
    landmark_near: "Kalanki Mai Temple, Ring Road junction",
    tourist_places: ["Kalanki Mai Temple"],
    location: { type: "Point", coordinates: [85.2719, 27.6939] },
  },
  {
    name: "Kalimati",
    landmark_near: "Kalimati Heritage Fruit & Vegetable Market",
    tourist_places: ["Kalimati Heritage Market Area", "Shani Dham Temple"],
    location: { type: "Point", coordinates: [85.2913, 27.6928] },
  },
  {
    name: "Teku",
    landmark_near: "Teku Ghat Heritage Shrines",
    tourist_places: [
      "Teku Ghat Heritage Shrines",
      "Kankeshwari Temple",
      "Pachali Bhairav Temple",
    ],
    location: { type: "Point", coordinates: [85.3014, 27.6931] },
  },
  {
    name: "Swayambhu",
    landmark_near: "Swayambhunath Stupa (Monkey Temple) UNESCO",
    tourist_places: [
      "Swayambhunath Stupa (Monkey Temple - UNESCO)",
      "Amideva Buddha Park",
    ],
    location: { type: "Point", coordinates: [85.2817, 27.7153] },
  },
  {
    name: "Bafal",
    landmark_near: "Ring Road Bafal junction",
    tourist_places: ["Ring Road Modern Urban Walk Square"],
    location: { type: "Point", coordinates: [85.2751, 27.7011] },
  },
  {
    name: "Sitapaila",
    landmark_near: "Ichangu Narayan Temple route",
    tourist_places: ["Padma Sambhava Monastery", "Ichangu Narayan Temple"],
    location: { type: "Point", coordinates: [85.2764, 27.7083] },
  },
  {
    name: "Thulobharyang",
    landmark_near: "Swayambhu West Gate",
    tourist_places: ["Swayambhu West Gate Entrance Park"],
    location: { type: "Point", coordinates: [85.2798, 27.7175] },
  },
  {
    name: "Banasthali",
    landmark_near: "Banasthali Stupa Gardens",
    tourist_places: ["Banasthali Stupa Gardens"],
    location: { type: "Point", coordinates: [85.2869, 27.7264] },
  },
  {
    name: "Balkhu",
    landmark_near: "Vishwa Vinayak Temple, TU Ground",
    tourist_places: ["Tribhuvan University Grounds", "Vishwa Vinayak Temple"],
    location: { type: "Point", coordinates: [85.2891, 27.6789] },
  },
  {
    name: "Kuleshwor",
    landmark_near: "Kuleshwor Mahadev Temple Hillside",
    tourist_places: ["Kuleshwor Mahadev Temple Hillside Forest"],
    location: { type: "Point", coordinates: [85.2921, 27.6875] },
  },
  {
    name: "TU Gate",
    landmark_near: "Tribhuvan University Main Gate",
    tourist_places: ["Tribhuvan University Central Library Campus"],
    location: { type: "Point", coordinates: [85.2831, 27.6798] },
  },
  {
    name: "Naya Bazaar",
    landmark_near: "Kirtipur Foothill Craft Markets",
    tourist_places: ["Kirtipur Foothill Local Craft Markets"],
    location: { type: "Point", coordinates: [85.2798, 27.6811] },
  },
  {
    name: "Kirtipur Hillside",
    landmark_near: "Uma Maheshwar Temple Panoramic Overlook",
    tourist_places: ["Uma Maheshwar High Panoramic Overlook"],
    location: { type: "Point", coordinates: [85.2712, 27.6764] },
  },
  {
    name: "Kirtipur",
    landmark_near: "Bagh Bhairab Temple, Chilancho Stupa",
    tourist_places: [
      "Bagh Bhairab Temple",
      "Uma Maheshwar Temple (Hilltop)",
      "Chilancho Stupa",
      "Historical Newar Village Square",
    ],
    location: { type: "Point", coordinates: [85.2773, 27.6784] },
  },

  // ── Thankot / West Highway ──
  {
    name: "Thankot Checkpost",
    landmark_near: "Chandragiri Cable Car Bottom Station",
    tourist_places: ["Chandragiri Cable Car Bottom Station"],
    location: { type: "Point", coordinates: [85.2078, 27.6841] },
  },
  {
    name: "Mahadevsthan",
    landmark_near: "Thankot Mahadevsthan Cave Shrines",
    tourist_places: ["Thankot Mahadevsthan Cave Shrines"],
    location: { type: "Point", coordinates: [85.2151, 27.6836] },
  },
  {
    name: "Satungal",
    landmark_near: "Vishnu Devi Temple Satungal",
    tourist_places: ["Vishnu Devi Temple Satungal"],
    location: { type: "Point", coordinates: [85.2341, 27.6881] },
  },
  {
    name: "Gurjudhara",
    landmark_near: "Gurjudhara Local Market",
    tourist_places: ["Gurjudhara Local Market Squares"],
    location: { type: "Point", coordinates: [85.2239, 27.6864] },
  },
  {
    name: "Naikap",
    landmark_near: "Naikap Hilltop Hiking Trails",
    tourist_places: [
      "Naikap Hilltop Hiking Trails",
      "Historical Battlefield Points",
    ],
    location: { type: "Point", coordinates: [85.2514, 27.6892] },
  },
  {
    name: "Dhungeadda",
    landmark_near: "Chandragiri Gateway",
    tourist_places: ["Chandragiri Gateway Highway"],
    location: { type: "Point", coordinates: [85.2608, 27.6908] },
  },

  // ── Dakshinkali / South Pilgrim Route ──
  {
    name: "Chobhar",
    landmark_near: "Chobhar Gorge, Adinath Temple",
    tourist_places: [
      "Chobhar Gorge (Cut by Manjushri's Sword)",
      "Adinath Lokeshwar Temple",
    ],
    location: { type: "Point", coordinates: [85.2891, 27.6567] },
  },
  {
    name: "Taudaha",
    landmark_near: "Taudaha Lake Sacred Bird-Watching",
    tourist_places: ["Taudaha Lake (Sacred Bird-Watching Wetland Sanctuary)"],
    location: { type: "Point", coordinates: [85.2834, 27.6489] },
  },
  {
    name: "Pharping",
    landmark_near: "Asura Cave, Nepal's 1st Hydro Station",
    tourist_places: [
      "Asura Cave Monastery (Guru Rinpoche Meditation Site)",
      "Pharping Hydropower Station Museum",
    ],
    location: { type: "Point", coordinates: [85.2691, 27.6134] },
  },
  {
    name: "Dakshinkali Temple",
    landmark_near: "Dakshinkali Shaktipitha Forest Temple",
    tourist_places: [
      "Dakshinkali Temple (Major Hindu Shaktipitha Animal Sacrifice Forest Temple)",
    ],
    location: { type: "Point", coordinates: [85.2634, 27.5912] },
  },
];

// ─────────────────────────────────────────────────────────────
// BUS ROUTES — 15 Tourist-Relevant Routes
// Data sourced from: busStops.json (Kathmandu Valley Real Routes)
// Minutes estimated based on typical Kathmandu traffic patterns
// Fare based on Nepal Government 2024 distance tier matrix
// ─────────────────────────────────────────────────────────────
const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding...");

    await BusStop.deleteMany();
    await BusRoute.deleteMany();
    console.log("Cleared existing data");

    const insertedStops = await BusStop.insertMany(stops);
    console.log(`Inserted ${insertedStops.length} bus stops`);

    const getStop = (name) => {
      const stop = insertedStops.find((s) => s.name === name);
      if (!stop) throw new Error(`Stop not found in seed: "${name}"`);
      return stop;
    };

    const routes = [
      // ─────────────────────────────────────────────────────
      // ROUTE 1 — Airport → Ratnapark
      // Source: busStops.json id 5 (Sajha Yatayat / Mahanagar Yatayat)
      // Distance: ~7km → NPR 35
      // ─────────────────────────────────────────────────────
      {
        route_number: "M1",
        name: "Airport - Ratnapark",
        yatayat: "Sajha Yatayat / Mahanagar Yatayat",
        base_fare: 35,
        fare_per_km: 0,
        stops: [
          {
            stop_id: getStop("Tribhuvan Airport")._id,
            name: "Tribhuvan Airport",
            sequence: 1,
            minutes_from_terminal: 0,
          },
          {
            stop_id: getStop("Tinkune")._id,
            name: "Tinkune",
            sequence: 2,
            minutes_from_terminal: 8,
          },
          {
            stop_id: getStop("Minbhawan")._id,
            name: "Minbhawan",
            sequence: 3,
            minutes_from_terminal: 14,
          },
          {
            stop_id: getStop("Naya Baneshwor")._id,
            name: "Naya Baneshwor",
            sequence: 4,
            minutes_from_terminal: 18,
          },
          {
            stop_id: getStop("Babarmahal")._id,
            name: "Babarmahal",
            sequence: 5,
            minutes_from_terminal: 22,
          },
          {
            stop_id: getStop("Maitighar")._id,
            name: "Maitighar",
            sequence: 6,
            minutes_from_terminal: 25,
          },
          {
            stop_id: getStop("Bhadrakali")._id,
            name: "Bhadrakali",
            sequence: 7,
            minutes_from_terminal: 29,
          },
          {
            stop_id: getStop("Bagbazar")._id,
            name: "Bagbazar",
            sequence: 8,
            minutes_from_terminal: 32,
          },
          {
            stop_id: getStop("Ratnapark")._id,
            name: "Ratnapark",
            sequence: 9,
            minutes_from_terminal: 36,
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // ROUTE 2 — Lagankhel → Jorpati (via Bouddha)
      // Source: busStops.json id 10 (Sajha Yatayat Line 1)
      // Distance: ~15km → NPR 40
      // ─────────────────────────────────────────────────────
      {
        route_number: "S1",
        name: "Lagankhel - Ratnapark - Bouddha - Jorpati",
        yatayat: "Sajha Yatayat Line 1",
        base_fare: 40,
        fare_per_km: 0,
        stops: [
          {
            stop_id: getStop("Lagankhel")._id,
            name: "Lagankhel",
            sequence: 1,
            minutes_from_terminal: 0,
          },
          {
            stop_id: getStop("Jawalakhel")._id,
            name: "Jawalakhel",
            sequence: 2,
            minutes_from_terminal: 5,
          },
          {
            stop_id: getStop("Pulchowk")._id,
            name: "Pulchowk",
            sequence: 3,
            minutes_from_terminal: 9,
          },
          {
            stop_id: getStop("Kupondole")._id,
            name: "Kupondole",
            sequence: 4,
            minutes_from_terminal: 13,
          },
          {
            stop_id: getStop("Thapathali")._id,
            name: "Thapathali",
            sequence: 5,
            minutes_from_terminal: 17,
          },
          {
            stop_id: getStop("Tripureshwor")._id,
            name: "Tripureshwor",
            sequence: 6,
            minutes_from_terminal: 21,
          },
          {
            stop_id: getStop("Sundhara")._id,
            name: "Sundhara",
            sequence: 7,
            minutes_from_terminal: 25,
          },
          {
            stop_id: getStop("Ratnapark")._id,
            name: "Ratnapark",
            sequence: 8,
            minutes_from_terminal: 28,
          },
          {
            stop_id: getStop("Jamal")._id,
            name: "Jamal",
            sequence: 9,
            minutes_from_terminal: 31,
          },
          {
            stop_id: getStop("Kamaladi")._id,
            name: "Kamaladi",
            sequence: 10,
            minutes_from_terminal: 34,
          },
          {
            stop_id: getStop("Putalisadak")._id,
            name: "Putalisadak",
            sequence: 11,
            minutes_from_terminal: 37,
          },
          {
            stop_id: getStop("Kalopul")._id,
            name: "Kalopul",
            sequence: 12,
            minutes_from_terminal: 41,
          },
          {
            stop_id: getStop("Chabahil")._id,
            name: "Chabahil",
            sequence: 13,
            minutes_from_terminal: 47,
          },
          {
            stop_id: getStop("Bouddha")._id,
            name: "Bouddha",
            sequence: 14,
            minutes_from_terminal: 53,
          },
          {
            stop_id: getStop("Jorpati")._id,
            name: "Jorpati",
            sequence: 15,
            minutes_from_terminal: 60,
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // ROUTE 3 — Bhaktapur → Ratnapark (Sajha Yatayat)
      // Source: busStops.json id 18
      // Distance: ~14km → NPR 40
      // ─────────────────────────────────────────────────────
      {
        route_number: "S4",
        name: "Bhaktapur - Ratnapark",
        yatayat: "Sajha Yatayat",
        base_fare: 40,
        fare_per_km: 0,
        stops: [
          {
            stop_id: getStop("Suryabinayak")._id,
            name: "Suryabinayak",
            sequence: 1,
            minutes_from_terminal: 0,
          },
          {
            stop_id: getStop("Sallaghari")._id,
            name: "Sallaghari",
            sequence: 2,
            minutes_from_terminal: 7,
          },
          {
            stop_id: getStop("Thimi")._id,
            name: "Thimi",
            sequence: 3,
            minutes_from_terminal: 14,
          },
          {
            stop_id: getStop("Gaththaghar")._id,
            name: "Gaththaghar",
            sequence: 4,
            minutes_from_terminal: 19,
          },
          {
            stop_id: getStop("Lokanthali")._id,
            name: "Lokanthali",
            sequence: 5,
            minutes_from_terminal: 24,
          },
          {
            stop_id: getStop("Jadibuti")._id,
            name: "Jadibuti",
            sequence: 6,
            minutes_from_terminal: 28,
          },
          {
            stop_id: getStop("Koteshwor")._id,
            name: "Koteshwor",
            sequence: 7,
            minutes_from_terminal: 33,
          },
          {
            stop_id: getStop("Tinkune")._id,
            name: "Tinkune",
            sequence: 8,
            minutes_from_terminal: 38,
          },
          {
            stop_id: getStop("Purano Baneshwor")._id,
            name: "Purano Baneshwor",
            sequence: 9,
            minutes_from_terminal: 42,
          },
          {
            stop_id: getStop("Maitidevi")._id,
            name: "Maitidevi",
            sequence: 10,
            minutes_from_terminal: 46,
          },
          {
            stop_id: getStop("Putalisadak")._id,
            name: "Putalisadak",
            sequence: 11,
            minutes_from_terminal: 50,
          },
          {
            stop_id: getStop("Bagbazar")._id,
            name: "Bagbazar",
            sequence: 12,
            minutes_from_terminal: 53,
          },
          {
            stop_id: getStop("Ratnapark")._id,
            name: "Ratnapark",
            sequence: 13,
            minutes_from_terminal: 56,
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // ROUTE 4 — Thankot → Ratnapark (Chandragiri Cable Car gateway)
      // Source: busStops.json id 20
      // Distance: ~20km → NPR 50
      // ─────────────────────────────────────────────────────
      {
        route_number: "C1",
        name: "Thankot - Ratnapark",
        yatayat: "Chandragiri Yatayat",
        base_fare: 50,
        fare_per_km: 0,
        stops: [
          {
            stop_id: getStop("Thankot Checkpost")._id,
            name: "Thankot Checkpost",
            sequence: 1,
            minutes_from_terminal: 0,
          },
          {
            stop_id: getStop("Mahadevsthan")._id,
            name: "Mahadevsthan",
            sequence: 2,
            minutes_from_terminal: 8,
          },
          {
            stop_id: getStop("Satungal")._id,
            name: "Satungal",
            sequence: 3,
            minutes_from_terminal: 16,
          },
          {
            stop_id: getStop("Gurjudhara")._id,
            name: "Gurjudhara",
            sequence: 4,
            minutes_from_terminal: 22,
          },
          {
            stop_id: getStop("Naikap")._id,
            name: "Naikap",
            sequence: 5,
            minutes_from_terminal: 30,
          },
          {
            stop_id: getStop("Dhungeadda")._id,
            name: "Dhungeadda",
            sequence: 6,
            minutes_from_terminal: 36,
          },
          {
            stop_id: getStop("Kalanki")._id,
            name: "Kalanki",
            sequence: 7,
            minutes_from_terminal: 42,
          },
          {
            stop_id: getStop("Kalimati")._id,
            name: "Kalimati",
            sequence: 8,
            minutes_from_terminal: 48,
          },
          {
            stop_id: getStop("Teku")._id,
            name: "Teku",
            sequence: 9,
            minutes_from_terminal: 53,
          },
          {
            stop_id: getStop("Tripureshwor")._id,
            name: "Tripureshwor",
            sequence: 10,
            minutes_from_terminal: 57,
          },
          {
            stop_id: getStop("Sundhara")._id,
            name: "Sundhara",
            sequence: 11,
            minutes_from_terminal: 61,
          },
          {
            stop_id: getStop("Ratnapark")._id,
            name: "Ratnapark",
            sequence: 12,
            minutes_from_terminal: 65,
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // ROUTE 5 — Ratnapark → Budhanilkantha (Reclining Vishnu Temple)
      // Source: busStops.json id 22
      // Distance: ~12km → NPR 40
      // ─────────────────────────────────────────────────────
      {
        route_number: "B1",
        name: "Ratnapark - Budhanilkantha",
        yatayat: "Budhanilkantha Yatayat / Sajha Yatayat",
        base_fare: 40,
        fare_per_km: 0,
        stops: [
          {
            stop_id: getStop("Ratnapark")._id,
            name: "Ratnapark",
            sequence: 1,
            minutes_from_terminal: 0,
          },
          {
            stop_id: getStop("Jamal")._id,
            name: "Jamal",
            sequence: 2,
            minutes_from_terminal: 4,
          },
          {
            stop_id: getStop("Lainchaur")._id,
            name: "Lainchaur",
            sequence: 3,
            minutes_from_terminal: 9,
          },
          {
            stop_id: getStop("Lazimpat")._id,
            name: "Lazimpat",
            sequence: 4,
            minutes_from_terminal: 14,
          },
          {
            stop_id: getStop("Narayan Gopal Chowk")._id,
            name: "Narayan Gopal Chowk",
            sequence: 5,
            minutes_from_terminal: 20,
          },
          {
            stop_id: getStop("Bansbari")._id,
            name: "Bansbari",
            sequence: 6,
            minutes_from_terminal: 26,
          },
          {
            stop_id: getStop("Golfutar")._id,
            name: "Golfutar",
            sequence: 7,
            minutes_from_terminal: 32,
          },
          {
            stop_id: getStop("Bhangrahiti")._id,
            name: "Bhangrahiti",
            sequence: 8,
            minutes_from_terminal: 37,
          },
          {
            stop_id: getStop("Narayanthan")._id,
            name: "Narayanthan",
            sequence: 9,
            minutes_from_terminal: 42,
          },
          {
            stop_id: getStop("Budhanilkantha School")._id,
            name: "Budhanilkantha School",
            sequence: 10,
            minutes_from_terminal: 47,
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // ROUTE 6 — New Buspark → Bouddha
      // Source: busStops.json id 24 (Gokarneshwor Yatayat)
      // Distance: ~10km → NPR 35
      // ─────────────────────────────────────────────────────
      {
        route_number: "G1",
        name: "Gongabu Buspark - Bouddha - Jorpati",
        yatayat: "Gokarneshwor Yatayat",
        base_fare: 35,
        fare_per_km: 0,
        stops: [
          {
            stop_id: getStop("Gongabu Buspark")._id,
            name: "Gongabu Buspark",
            sequence: 1,
            minutes_from_terminal: 0,
          },
          {
            stop_id: getStop("Samakhusi")._id,
            name: "Samakhusi",
            sequence: 2,
            minutes_from_terminal: 6,
          },
          {
            stop_id: getStop("Basundhara")._id,
            name: "Basundhara",
            sequence: 3,
            minutes_from_terminal: 11,
          },
          {
            stop_id: getStop("Narayan Gopal Chowk")._id,
            name: "Narayan Gopal Chowk",
            sequence: 4,
            minutes_from_terminal: 16,
          },
          {
            stop_id: getStop("Chabahil")._id,
            name: "Chabahil",
            sequence: 5,
            minutes_from_terminal: 23,
          },
          {
            stop_id: getStop("Bouddha")._id,
            name: "Bouddha",
            sequence: 6,
            minutes_from_terminal: 29,
          },
          {
            stop_id: getStop("Jorpati")._id,
            name: "Jorpati",
            sequence: 7,
            minutes_from_terminal: 35,
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // ROUTE 7 — Ratnapark → Kirtipur (Ancient Newar Town)
      // Source: busStops.json id 25
      // Distance: ~7km → NPR 35
      // ─────────────────────────────────────────────────────
      {
        route_number: "K1",
        name: "Ratnapark - Kirtipur",
        yatayat: "Kirtipur Yatayat",
        base_fare: 35,
        fare_per_km: 0,
        stops: [
          {
            stop_id: getStop("Ratnapark")._id,
            name: "Ratnapark",
            sequence: 1,
            minutes_from_terminal: 0,
          },
          {
            stop_id: getStop("Sundhara")._id,
            name: "Sundhara",
            sequence: 2,
            minutes_from_terminal: 4,
          },
          {
            stop_id: getStop("Tripureshwor")._id,
            name: "Tripureshwor",
            sequence: 3,
            minutes_from_terminal: 8,
          },
          {
            stop_id: getStop("Teku")._id,
            name: "Teku",
            sequence: 4,
            minutes_from_terminal: 12,
          },
          {
            stop_id: getStop("Kalimati")._id,
            name: "Kalimati",
            sequence: 5,
            minutes_from_terminal: 16,
          },
          {
            stop_id: getStop("Kuleshwor")._id,
            name: "Kuleshwor",
            sequence: 6,
            minutes_from_terminal: 21,
          },
          {
            stop_id: getStop("Balkhu")._id,
            name: "Balkhu",
            sequence: 7,
            minutes_from_terminal: 25,
          },
          {
            stop_id: getStop("TU Gate")._id,
            name: "TU Gate",
            sequence: 8,
            minutes_from_terminal: 30,
          },
          {
            stop_id: getStop("Naya Bazaar")._id,
            name: "Naya Bazaar",
            sequence: 9,
            minutes_from_terminal: 34,
          },
          {
            stop_id: getStop("Kirtipur Hillside")._id,
            name: "Kirtipur Hillside",
            sequence: 10,
            minutes_from_terminal: 38,
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // ROUTE 8 — Kalanki → Chabahil (via Swayambhu / Ring Road North)
      // Source: busStops.json id 27 (Mahanagar Yatayat)
      // Distance: ~18km → NPR 45
      // ─────────────────────────────────────────────────────
      {
        route_number: "MN1",
        name: "Kalanki - Swayambhu - Chabahil",
        yatayat: "Mahanagar Yatayat",
        base_fare: 45,
        fare_per_km: 0,
        stops: [
          {
            stop_id: getStop("Kalanki")._id,
            name: "Kalanki",
            sequence: 1,
            minutes_from_terminal: 0,
          },
          {
            stop_id: getStop("Bafal")._id,
            name: "Bafal",
            sequence: 2,
            minutes_from_terminal: 6,
          },
          {
            stop_id: getStop("Sitapaila")._id,
            name: "Sitapaila",
            sequence: 3,
            minutes_from_terminal: 11,
          },
          {
            stop_id: getStop("Swayambhu")._id,
            name: "Swayambhu",
            sequence: 4,
            minutes_from_terminal: 17,
          },
          {
            stop_id: getStop("Thulobharyang")._id,
            name: "Thulobharyang",
            sequence: 5,
            minutes_from_terminal: 22,
          },
          {
            stop_id: getStop("Banasthali")._id,
            name: "Banasthali",
            sequence: 6,
            minutes_from_terminal: 28,
          },
          {
            stop_id: getStop("Balaju")._id,
            name: "Balaju",
            sequence: 7,
            minutes_from_terminal: 33,
          },
          {
            stop_id: getStop("Machhapokhari")._id,
            name: "Machhapokhari",
            sequence: 8,
            minutes_from_terminal: 38,
          },
          {
            stop_id: getStop("Gongabu Buspark")._id,
            name: "Gongabu Buspark",
            sequence: 9,
            minutes_from_terminal: 43,
          },
          {
            stop_id: getStop("Samakhusi")._id,
            name: "Samakhusi",
            sequence: 10,
            minutes_from_terminal: 48,
          },
          {
            stop_id: getStop("Basundhara")._id,
            name: "Basundhara",
            sequence: 11,
            minutes_from_terminal: 53,
          },
          {
            stop_id: getStop("Narayan Gopal Chowk")._id,
            name: "Narayan Gopal Chowk",
            sequence: 12,
            minutes_from_terminal: 58,
          },
          {
            stop_id: getStop("Dhumbarahi")._id,
            name: "Dhumbarahi",
            sequence: 13,
            minutes_from_terminal: 63,
          },
          {
            stop_id: getStop("Chabahil")._id,
            name: "Chabahil",
            sequence: 14,
            minutes_from_terminal: 68,
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // ROUTE 9 — Ratnapark → Gongabu (New Bus Park)
      // Source: busStops.json id 37
      // Distance: ~5km → NPR 25
      // ─────────────────────────────────────────────────────
      {
        route_number: "R1",
        name: "Ratnapark - Gongabu Buspark",
        yatayat: "Gongabu-Ratnapark Micro-Bus Association",
        base_fare: 25,
        fare_per_km: 0,
        stops: [
          {
            stop_id: getStop("Ratnapark")._id,
            name: "Ratnapark",
            sequence: 1,
            minutes_from_terminal: 0,
          },
          {
            stop_id: getStop("Jamal")._id,
            name: "Jamal",
            sequence: 2,
            minutes_from_terminal: 4,
          },
          {
            stop_id: getStop("Lainchaur")._id,
            name: "Lainchaur",
            sequence: 3,
            minutes_from_terminal: 9,
          },
          {
            stop_id: getStop("Lazimpat")._id,
            name: "Lazimpat",
            sequence: 4,
            minutes_from_terminal: 13,
          },
          {
            stop_id: getStop("Narayan Gopal Chowk")._id,
            name: "Narayan Gopal Chowk",
            sequence: 5,
            minutes_from_terminal: 18,
          },
          {
            stop_id: getStop("Basundhara")._id,
            name: "Basundhara",
            sequence: 6,
            minutes_from_terminal: 22,
          },
          {
            stop_id: getStop("Samakhusi")._id,
            name: "Samakhusi",
            sequence: 7,
            minutes_from_terminal: 26,
          },
          {
            stop_id: getStop("Gongabu Buspark")._id,
            name: "Gongabu Buspark",
            sequence: 8,
            minutes_from_terminal: 30,
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // ROUTE 10 — Ratnapark → Bungamati (Rato Machindranath Temple)
      // Source: busStops.json id 42
      // Distance: ~12km → NPR 40
      // ─────────────────────────────────────────────────────
      {
        route_number: "L1",
        name: "Ratnapark - Bungamati",
        yatayat: "Lalitpur Yatayat",
        base_fare: 40,
        fare_per_km: 0,
        stops: [
          {
            stop_id: getStop("Ratnapark")._id,
            name: "Ratnapark",
            sequence: 1,
            minutes_from_terminal: 0,
          },
          {
            stop_id: getStop("Bhadrakali")._id,
            name: "Bhadrakali",
            sequence: 2,
            minutes_from_terminal: 5,
          },
          {
            stop_id: getStop("Maitighar")._id,
            name: "Maitighar",
            sequence: 3,
            minutes_from_terminal: 9,
          },
          {
            stop_id: getStop("Thapathali")._id,
            name: "Thapathali",
            sequence: 4,
            minutes_from_terminal: 13,
          },
          {
            stop_id: getStop("Kupondole")._id,
            name: "Kupondole",
            sequence: 5,
            minutes_from_terminal: 18,
          },
          {
            stop_id: getStop("Pulchowk")._id,
            name: "Pulchowk",
            sequence: 6,
            minutes_from_terminal: 22,
          },
          {
            stop_id: getStop("Jawalakhel")._id,
            name: "Jawalakhel",
            sequence: 7,
            minutes_from_terminal: 27,
          },
          {
            stop_id: getStop("Ekantakuna")._id,
            name: "Ekantakuna",
            sequence: 8,
            minutes_from_terminal: 33,
          },
          {
            stop_id: getStop("Bhaisepati")._id,
            name: "Bhaisepati",
            sequence: 9,
            minutes_from_terminal: 40,
          },
          {
            stop_id: getStop("Bungamati")._id,
            name: "Bungamati",
            sequence: 10,
            minutes_from_terminal: 48,
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // ROUTE 11 — Ratnapark → Chapagaon (Bajrabarahi Temple)
      // Source: busStops.json id 55
      // Distance: ~16km → NPR 45
      // ─────────────────────────────────────────────────────
      {
        route_number: "L2",
        name: "Ratnapark - Chapagaon",
        yatayat: "Lalitpur Yatayat",
        base_fare: 45,
        fare_per_km: 0,
        stops: [
          {
            stop_id: getStop("Ratnapark")._id,
            name: "Ratnapark",
            sequence: 1,
            minutes_from_terminal: 0,
          },
          {
            stop_id: getStop("Bhadrakali")._id,
            name: "Bhadrakali",
            sequence: 2,
            minutes_from_terminal: 5,
          },
          {
            stop_id: getStop("Thapathali")._id,
            name: "Thapathali",
            sequence: 3,
            minutes_from_terminal: 10,
          },
          {
            stop_id: getStop("Kupondole")._id,
            name: "Kupondole",
            sequence: 4,
            minutes_from_terminal: 15,
          },
          {
            stop_id: getStop("Jawalakhel")._id,
            name: "Jawalakhel",
            sequence: 5,
            minutes_from_terminal: 20,
          },
          {
            stop_id: getStop("Satdobato")._id,
            name: "Satdobato",
            sequence: 6,
            minutes_from_terminal: 28,
          },
          {
            stop_id: getStop("Sunakothi")._id,
            name: "Sunakothi",
            sequence: 7,
            minutes_from_terminal: 36,
          },
          {
            stop_id: getStop("Thecho")._id,
            name: "Thecho",
            sequence: 8,
            minutes_from_terminal: 44,
          },
          {
            stop_id: getStop("Chapagaon")._id,
            name: "Chapagaon",
            sequence: 9,
            minutes_from_terminal: 52,
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // ROUTE 12 — Ratnapark → Changunarayan (Oldest UNESCO Temple)
      // Source: busStops.json id 63
      // Distance: ~18km → NPR 45
      // ─────────────────────────────────────────────────────
      {
        route_number: "CH1",
        name: "Ratnapark - Changunarayan",
        yatayat: "Changunarayan Yatayat",
        base_fare: 45,
        fare_per_km: 0,
        stops: [
          {
            stop_id: getStop("Ratnapark")._id,
            name: "Ratnapark",
            sequence: 1,
            minutes_from_terminal: 0,
          },
          {
            stop_id: getStop("Koteshwor")._id,
            name: "Koteshwor",
            sequence: 2,
            minutes_from_terminal: 14,
          },
          {
            stop_id: getStop("Jadibuti")._id,
            name: "Jadibuti",
            sequence: 3,
            minutes_from_terminal: 19,
          },
          {
            stop_id: getStop("Lokanthali")._id,
            name: "Lokanthali",
            sequence: 4,
            minutes_from_terminal: 24,
          },
          {
            stop_id: getStop("Kaushaltar")._id,
            name: "Kaushaltar",
            sequence: 5,
            minutes_from_terminal: 30,
          },
          {
            stop_id: getStop("Duwakot")._id,
            name: "Duwakot",
            sequence: 6,
            minutes_from_terminal: 38,
          },
          {
            stop_id: getStop("Mwahan")._id,
            name: "Mwahan",
            sequence: 7,
            minutes_from_terminal: 46,
          },
          {
            stop_id: getStop("Changunarayan")._id,
            name: "Changunarayan",
            sequence: 8,
            minutes_from_terminal: 54,
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // ROUTE 13 — Ratnapark → Dakshinkali (Pilgrim Temple)
      // Source: busStops.json id 89
      // Distance: ~20km → NPR 50
      // ─────────────────────────────────────────────────────
      {
        route_number: "D1",
        name: "Ratnapark - Dakshinkali Temple",
        yatayat: "Dakshinkali Yatayat",
        base_fare: 50,
        fare_per_km: 0,
        stops: [
          {
            stop_id: getStop("Ratnapark")._id,
            name: "Ratnapark",
            sequence: 1,
            minutes_from_terminal: 0,
          },
          {
            stop_id: getStop("Sundhara")._id,
            name: "Sundhara",
            sequence: 2,
            minutes_from_terminal: 4,
          },
          {
            stop_id: getStop("Tripureshwor")._id,
            name: "Tripureshwor",
            sequence: 3,
            minutes_from_terminal: 8,
          },
          {
            stop_id: getStop("Teku")._id,
            name: "Teku",
            sequence: 4,
            minutes_from_terminal: 12,
          },
          {
            stop_id: getStop("Balkhu")._id,
            name: "Balkhu",
            sequence: 5,
            minutes_from_terminal: 17,
          },
          {
            stop_id: getStop("Chobhar")._id,
            name: "Chobhar",
            sequence: 6,
            minutes_from_terminal: 28,
          },
          {
            stop_id: getStop("Taudaha")._id,
            name: "Taudaha",
            sequence: 7,
            minutes_from_terminal: 36,
          },
          {
            stop_id: getStop("Pharping")._id,
            name: "Pharping",
            sequence: 8,
            minutes_from_terminal: 52,
          },
          {
            stop_id: getStop("Dakshinkali Temple")._id,
            name: "Dakshinkali Temple",
            sequence: 9,
            minutes_from_terminal: 62,
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // ROUTE 14 — Kalanki → Nepal Engineering College (NEC)
      // Source: busStops.json id 104 (Hackathon Venue Route!)
      // Distance: ~16km → NPR 45
      // ─────────────────────────────────────────────────────
      {
        route_number: "NEC1",
        name: "Kalanki - Nepal Engineering College",
        yatayat: "Bhaktapur Minibus Sewa Samiti",
        base_fare: 45,
        fare_per_km: 0,
        stops: [
          {
            stop_id: getStop("Kalanki")._id,
            name: "Kalanki",
            sequence: 1,
            minutes_from_terminal: 0,
          },
          {
            stop_id: getStop("Maitighar")._id,
            name: "Maitighar",
            sequence: 2,
            minutes_from_terminal: 10,
          },
          {
            stop_id: getStop("Koteshwor")._id,
            name: "Koteshwor",
            sequence: 3,
            minutes_from_terminal: 20,
          },
          {
            stop_id: getStop("Jadibuti")._id,
            name: "Jadibuti",
            sequence: 4,
            minutes_from_terminal: 25,
          },
          {
            stop_id: getStop("Lokanthali")._id,
            name: "Lokanthali",
            sequence: 5,
            minutes_from_terminal: 30,
          },
          {
            stop_id: getStop("Kaushaltar")._id,
            name: "Kaushaltar",
            sequence: 6,
            minutes_from_terminal: 35,
          },
          {
            stop_id: getStop("Gaththaghar")._id,
            name: "Gaththaghar",
            sequence: 7,
            minutes_from_terminal: 40,
          },
          {
            stop_id: getStop("Thimi")._id,
            name: "Thimi",
            sequence: 8,
            minutes_from_terminal: 45,
          },
          {
            stop_id: getStop("Sallaghari")._id,
            name: "Sallaghari",
            sequence: 9,
            minutes_from_terminal: 51,
          },
          {
            stop_id: getStop("Nepal Engineering College")._id,
            name: "Nepal Engineering College",
            sequence: 10,
            minutes_from_terminal: 57,
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // ROUTE 15 — Ratnapark → Sundarijal (Shivapuri National Park entry)
      // Source: busStops.json id 35
      // Distance: ~18km → NPR 45
      // ─────────────────────────────────────────────────────
      {
        route_number: "SJ1",
        name: "Ratnapark - Sundarijal",
        yatayat: "Sundarijal Yatayat / Samyukta Yatayat",
        base_fare: 45,
        fare_per_km: 0,
        stops: [
          {
            stop_id: getStop("Ratnapark")._id,
            name: "Ratnapark",
            sequence: 1,
            minutes_from_terminal: 0,
          },
          {
            stop_id: getStop("Jamal")._id,
            name: "Jamal",
            sequence: 2,
            minutes_from_terminal: 4,
          },
          {
            stop_id: getStop("Kamaladi")._id,
            name: "Kamaladi",
            sequence: 3,
            minutes_from_terminal: 7,
          },
          {
            stop_id: getStop("Putalisadak")._id,
            name: "Putalisadak",
            sequence: 4,
            minutes_from_terminal: 10,
          },
          {
            stop_id: getStop("Dillibazar")._id,
            name: "Dillibazar",
            sequence: 5,
            minutes_from_terminal: 13,
          },
          {
            stop_id: getStop("Charkhal")._id,
            name: "Charkhal",
            sequence: 6,
            minutes_from_terminal: 16,
          },
          {
            stop_id: getStop("Kalopul")._id,
            name: "Kalopul",
            sequence: 7,
            minutes_from_terminal: 20,
          },
          {
            stop_id: getStop("Chabahil")._id,
            name: "Chabahil",
            sequence: 8,
            minutes_from_terminal: 26,
          },
          {
            stop_id: getStop("Bouddha")._id,
            name: "Bouddha",
            sequence: 9,
            minutes_from_terminal: 32,
          },
          {
            stop_id: getStop("Jorpati")._id,
            name: "Jorpati",
            sequence: 10,
            minutes_from_terminal: 38,
          },
          {
            stop_id: getStop("Makalbari")._id,
            name: "Makalbari",
            sequence: 11,
            minutes_from_terminal: 45,
          },
          {
            stop_id: getStop("Gokarna")._id,
            name: "Gokarna",
            sequence: 12,
            minutes_from_terminal: 52,
          },
          {
            stop_id: getStop("Nayapati")._id,
            name: "Nayapati",
            sequence: 13,
            minutes_from_terminal: 58,
          },
          {
            stop_id: getStop("Sundarijal")._id,
            name: "Sundarijal",
            sequence: 14,
            minutes_from_terminal: 65,
          },
        ],
      },
    ];

    await BusRoute.insertMany(routes);
    console.log(`Inserted ${routes.length} bus routes`);
    console.log("─────────────────────────────────────────");
    console.log("Seeding complete. Summary:");
    console.log(`  Bus Stops : ${insertedStops.length}`);
    console.log(`  Bus Routes: ${routes.length}`);
    console.log("  Routes cover:");
    console.log("  Airport → City");
    console.log("  Boudhanath Stupa (UNESCO)");
    console.log("  Patan Durbar Square (UNESCO)");
    console.log("  Bhaktapur Durbar Square (UNESCO)");
    console.log("  Changu Narayan Temple (UNESCO)");
    console.log("  Swayambhunath Stupa (UNESCO)");
    console.log("  Pashupatinath Temple (UNESCO - via Gaushala)");
    console.log("  Budhanilkantha Temple");
    console.log("  Dakshinkali Temple");
    console.log("  Kirtipur Ancient Town");
    console.log("  Bungamati (Rato Machindranath)");
    console.log("  Sundarijal / Shivapuri National Park");
    console.log("  Chandragiri Cable Car (via Thankot)");
    console.log("  Nepal Engineering College (Hackathon Venue)");
    console.log("─────────────────────────────────────────");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exit(1);
  }
};

seedDB();
