import mongoose from "mongoose";
import dotenv from "dotenv";
import busStop from "./models/busStop.js";
import busRoute from "./models/busRoute.js";

dotenv.config();

const stops = [
  // Central Hub
  {
    name: "Ratnapark",
    landmark_near: "Ratna Park, Central Kathmandu",
    location: { type: "Point", coordinates: [85.3157, 27.7041] },
  },
  {
    name: "Shahid Gate",
    landmark_near: "Near Tundikhel",
    location: { type: "Point", coordinates: [85.3178, 27.7021] },
  },
  {
    name: "Shantinagar",
    landmark_near: "Shantinagar Bus Stop",
    location: { type: "Point", coordinates: [85.3308, 27.6938] },
  },

  // Thamel area
  {
    name: "Thamel Bus Stop",
    landmark_near: "Thamel Tourist Area",
    location: { type: "Point", coordinates: [85.3078, 27.7151] },
  },
  {
    name: "Chetrapati",
    landmark_near: "Chetrapati Chowk",
    location: { type: "Point", coordinates: [85.3069, 27.7111] },
  },
  {
    name: "Kalimati",
    landmark_near: "Kalimati Chowk",
    location: { type: "Point", coordinates: [85.2964, 27.6993] },
  },

  // Boudha route
  {
    name: "Gaushala",
    landmark_near: "Gaushala Bus Stop",
    location: { type: "Point", coordinates: [85.3445, 27.7089] },
  },
  {
    name: "Chabahil",
    landmark_near: "Chabahil Chowk",
    location: { type: "Point", coordinates: [85.3534, 27.7192] },
  },
  {
    name: "Boudha",
    landmark_near: "Boudhanath Stupa",
    location: { type: "Point", coordinates: [85.362, 27.7215] },
  },

  // Patan route
  {
    name: "Thapathali",
    landmark_near: "Thapathali Bridge",
    location: { type: "Point", coordinates: [85.3181, 27.6938] },
  },
  {
    name: "Balkhu",
    landmark_near: "Balkhu Chowk",
    location: { type: "Point", coordinates: [85.2978, 27.6823] },
  },
  {
    name: "Lagankhel",
    landmark_near: "Patan Bus Terminal",
    location: { type: "Point", coordinates: [85.3169, 27.6636] },
  },
  {
    name: "Patan Dhoka",
    landmark_near: "Patan Durbar Square Entry",
    location: { type: "Point", coordinates: [85.3178, 27.671] },
  },

  // Pashupatinath route
  {
    name: "Maitighar",
    landmark_near: "Maitighar Mandala",
    location: { type: "Point", coordinates: [85.3234, 27.6985] },
  },
  {
    name: "Tinkune",
    landmark_near: "Tinkune Bus Stop",
    location: { type: "Point", coordinates: [85.3456, 27.6895] },
  },
  {
    name: "Pashupatinath",
    landmark_near: "Pashupatinath Temple",
    location: { type: "Point", coordinates: [85.3486, 27.7104] },
  },

  // Bhaktapur route
  {
    name: "Koteshwor",
    landmark_near: "Koteshwor Chowk",
    location: { type: "Point", coordinates: [85.3563, 27.6788] },
  },
  {
    name: "Jadibuti",
    landmark_near: "Jadibuti Bus Stop",
    location: { type: "Point", coordinates: [85.3698, 27.6756] },
  },
  {
    name: "Bhaktapur Bus Park",
    landmark_near: "Bhaktapur Bus Terminal",
    location: { type: "Point", coordinates: [85.4195, 27.6715] },
  },
  {
    name: "Bhaktapur Durbar Square",
    landmark_near: "Bhaktapur Durbar Square",
    location: { type: "Point", coordinates: [85.4271, 27.6722] },
  },

  // Swayambhu route
  {
    name: "Swayambhu",
    landmark_near: "Swayambhunath Stupa",
    location: { type: "Point", coordinates: [85.2904, 27.7149] },
  },
  {
    name: "Dallu",
    landmark_near: "Dallu Chowk",
    location: { type: "Point", coordinates: [85.2978, 27.7089] },
  },

  // New Bus Park (Gongabu)
  {
    name: "Gongabu",
    landmark_near: "New Bus Park",
    location: { type: "Point", coordinates: [85.3078, 27.7289] },
  },
  {
    name: "Balaju",
    landmark_near: "Balaju Bus Stop",
    location: { type: "Point", coordinates: [85.2978, 27.7234] },
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding...");

    // Clear existing data
    await busStop.deleteMany();
    await busRoute.deleteMany();
    console.log("Cleared existing data");

    // Insert stops and get their MongoDB IDs back
    const insertedStops = await busStop.insertMany(stops);
    console.log(`Inserted ${insertedStops.length} bus stops`);

    // Helper to find a stop's MongoDB ID by name
    const getStop = (name) => {
      const stop = insertedStops.find((s) => s.name === name);
      if (!stop) throw new Error(`Stop not found: ${name}`);
      return stop;
    };

    const routes = [
      {
        route_number: "1",
        name: "Ratnapark - Boudha",
        base_fare: 15,
        fare_per_km: 2.5,
        stops: [
          {
            stop_id: getStop("Ratnapark")._id,
            name: "Ratnapark",
            sequence: 1,
            minutes_from_terminal: 0,
          },
          {
            stop_id: getStop("Shahid Gate")._id,
            name: "Shahid Gate",
            sequence: 2,
            minutes_from_terminal: 3,
          },
          {
            stop_id: getStop("Gaushala")._id,
            name: "Gaushala",
            sequence: 3,
            minutes_from_terminal: 12,
          },
          {
            stop_id: getStop("Chabahil")._id,
            name: "Chabahil",
            sequence: 4,
            minutes_from_terminal: 18,
          },
          {
            stop_id: getStop("Boudha")._id,
            name: "Boudha",
            sequence: 5,
            minutes_from_terminal: 25,
          },
        ],
      },
      {
        route_number: "2",
        name: "Ratnapark - Lagankhel (Patan)",
        base_fare: 15,
        fare_per_km: 2.5,
        stops: [
          {
            stop_id: getStop("Ratnapark")._id,
            name: "Ratnapark",
            sequence: 1,
            minutes_from_terminal: 0,
          },
          {
            stop_id: getStop("Thapathali")._id,
            name: "Thapathali",
            sequence: 2,
            minutes_from_terminal: 7,
          },
          {
            stop_id: getStop("Patan Dhoka")._id,
            name: "Patan Dhoka",
            sequence: 3,
            minutes_from_terminal: 15,
          },
          {
            stop_id: getStop("Lagankhel")._id,
            name: "Lagankhel",
            sequence: 4,
            minutes_from_terminal: 22,
          },
        ],
      },
      {
        route_number: "3",
        name: "Ratnapark - Pashupatinath",
        base_fare: 15,
        fare_per_km: 2.5,
        stops: [
          {
            stop_id: getStop("Ratnapark")._id,
            name: "Ratnapark",
            sequence: 1,
            minutes_from_terminal: 0,
          },
          {
            stop_id: getStop("Maitighar")._id,
            name: "Maitighar",
            sequence: 2,
            minutes_from_terminal: 5,
          },
          {
            stop_id: getStop("Gaushala")._id,
            name: "Gaushala",
            sequence: 3,
            minutes_from_terminal: 14,
          },
          {
            stop_id: getStop("Pashupatinath")._id,
            name: "Pashupatinath",
            sequence: 4,
            minutes_from_terminal: 20,
          },
        ],
      },
      {
        route_number: "4",
        name: "Ratnapark - Bhaktapur",
        base_fare: 25,
        fare_per_km: 2.5,
        stops: [
          {
            stop_id: getStop("Ratnapark")._id,
            name: "Ratnapark",
            sequence: 1,
            minutes_from_terminal: 0,
          },
          {
            stop_id: getStop("Shantinagar")._id,
            name: "Shantinagar",
            sequence: 2,
            minutes_from_terminal: 8,
          },
          {
            stop_id: getStop("Koteshwor")._id,
            name: "Koteshwor",
            sequence: 3,
            minutes_from_terminal: 18,
          },
          {
            stop_id: getStop("Jadibuti")._id,
            name: "Jadibuti",
            sequence: 4,
            minutes_from_terminal: 25,
          },
          {
            stop_id: getStop("Bhaktapur Bus Park")._id,
            name: "Bhaktapur Bus Park",
            sequence: 5,
            minutes_from_terminal: 45,
          },
          {
            stop_id: getStop("Bhaktapur Durbar Square")._id,
            name: "Bhaktapur Durbar Square",
            sequence: 6,
            minutes_from_terminal: 50,
          },
        ],
      },
      {
        route_number: "5",
        name: "Thamel - Ratnapark - Lagankhel",
        base_fare: 15,
        fare_per_km: 2.5,
        stops: [
          {
            stop_id: getStop("Thamel Bus Stop")._id,
            name: "Thamel Bus Stop",
            sequence: 1,
            minutes_from_terminal: 0,
          },
          {
            stop_id: getStop("Chetrapati")._id,
            name: "Chetrapati",
            sequence: 2,
            minutes_from_terminal: 5,
          },
          {
            stop_id: getStop("Ratnapark")._id,
            name: "Ratnapark",
            sequence: 3,
            minutes_from_terminal: 12,
          },
          {
            stop_id: getStop("Thapathali")._id,
            name: "Thapathali",
            sequence: 4,
            minutes_from_terminal: 19,
          },
          {
            stop_id: getStop("Lagankhel")._id,
            name: "Lagankhel",
            sequence: 5,
            minutes_from_terminal: 32,
          },
        ],
      },
      {
        route_number: "6",
        name: "Ratnapark - Swayambhu",
        base_fare: 15,
        fare_per_km: 2.5,
        stops: [
          {
            stop_id: getStop("Ratnapark")._id,
            name: "Ratnapark",
            sequence: 1,
            minutes_from_terminal: 0,
          },
          {
            stop_id: getStop("Dallu")._id,
            name: "Dallu",
            sequence: 2,
            minutes_from_terminal: 10,
          },
          {
            stop_id: getStop("Swayambhu")._id,
            name: "Swayambhu",
            sequence: 3,
            minutes_from_terminal: 18,
          },
        ],
      },
      {
        route_number: "7",
        name: "Gongabu - Ratnapark - Koteshwor",
        base_fare: 20,
        fare_per_km: 2.5,
        stops: [
          {
            stop_id: getStop("Gongabu")._id,
            name: "Gongabu",
            sequence: 1,
            minutes_from_terminal: 0,
          },
          {
            stop_id: getStop("Balaju")._id,
            name: "Balaju",
            sequence: 2,
            minutes_from_terminal: 8,
          },
          {
            stop_id: getStop("Thamel Bus Stop")._id,
            name: "Thamel Bus Stop",
            sequence: 3,
            minutes_from_terminal: 15,
          },
          {
            stop_id: getStop("Ratnapark")._id,
            name: "Ratnapark",
            sequence: 4,
            minutes_from_terminal: 22,
          },
          {
            stop_id: getStop("Koteshwor")._id,
            name: "Koteshwor",
            sequence: 5,
            minutes_from_terminal: 38,
          },
        ],
      },
    ];

    await busRoute.insertMany(routes);
    console.log(`Inserted ${routes.length} bus routes`);
    console.log("Seeding complete");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exit(1);
  }
};

seedDB();
