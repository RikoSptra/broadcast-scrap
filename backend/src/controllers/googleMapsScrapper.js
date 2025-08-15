const { v4: uuidv4 } = require("uuid");
const { getDB } = require("../config/database");

const { getJson } = require("serpapi");
const API_KEY =
  "dc422f437b14a6d13cdd5e49e85d938c67400bb2488e3c69882db59c8694bfa9"; //process.env.SERPAPI_KEY;

exports.googleMapsScrapper = async (req, res) => {
  try {
    const { searchQuery } = req.body || {};

    console.log("Received searchQuery:", searchQuery);

    // if (
    //   !searchQuery ||
    //   typeof searchQuery !== "string" ||
    //   !searchQuery.trim()
    // ) {
    //   return res.status(400).json({
    //     success: false,
    //     error: "Body must be JSON with a non-empty 'searchQuery' string.",
    //     example: { searchQuery: "cafe di surabaya" },
    //   });
    // }

    // Untuk sementara return success response
    // Code yang dikomentari untuk implementasi sebenarnya nanti
    const queryVariations = searchQuery.split(",");

    const results = await fetchAll({
      q: queryVariations,
      hl: "id",
      gl: "id",
      targetCount: 100, // ditingkatkan untuk mendapatkan lebih banyak data
    });

    return res.status(200).json({
      success: true,
      message: "Google Maps scrapper received query successfully",
    });
  } catch (error) {
    console.error("Error in googleMapsScrapper:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

exports.getAllGoogleScrapData = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const db = getDB();
    
    // Build search query if search parameter exists
    const searchQuery = req.query.search;
    const searchFilter = searchQuery ? {
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { phone: { $regex: searchQuery, $options: 'i' } }
      ]
    } : {};

    // Combine search filter with deleted filter
    const filter = {
      _deleted: { $exists: false },
      ...searchFilter
    };

    // Get total count
    const totalItems = await db
      .collection("GoogleMapsScrapContacts")
      .countDocuments(filter);

    // Get paginated data
    const contacts = await db
      .collection("GoogleMapsScrapContacts")
      .find(filter)
      .sort({ _createdAt: -1 }) // Sort by creation date, newest first
      .skip(skip)
      .limit(limit)
      .toArray();

    // Transform data
    const transformedContacts = contacts.map(contact => ({
      title: contact.title,
      phone: contact.phone || '',
      rating: contact.rating || 0,
      reviews: contact.reviews || 0,
      price: contact.price || '',
      website: contact.website || '',
      address: contact.address || '',
      latitude: contact.latitude || '',
      longitude: contact.longitude || '',
    }));

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      success: true,
      data: transformedContacts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error("Error getting contacts:", error);
    res.status(500).json({ 
      success: false, 
      message: "Terjadi kesalahan server",
      error: error.message 
    });
  }
};

const sleep = (ms) => {
  return new Promise((r) => setTimeout(r, ms));
};

const normalizePlace = (p) => {
  const gps = p.gps_coordinates || {};
  return {
    title: p.title || "",
    type: p.type || p.category || "",
    address: p.address || "",
    neighborhood: p.neighborhood || "",
    open_state: p.open_state || "",
    hours: Array.isArray(p.hours) ? p.hours.join(" | ") : p.hours || "",
    phone: p.phone || p.phone_number || p.telephone || "",
    website: p.website || "",
    rating: typeof p.rating === "number" ? p.rating : "",
    reviews: typeof p.reviews === "number" ? p.reviews : "",
    price: p.price || "",
    service_options: Array.isArray(p.service_options)
      ? p.service_options.join("; ")
      : p.service_options || "",
    menu: p.menu || "",
    reservation: p.reservations || p.reserve || "",
    latitude: gps.latitude ?? "",
    longitude: gps.longitude ?? "",
    data_id: p.data_id || "",
    place_id: p.place_id || "",
    google_maps_link: p.link || p.google_maps_link || "",
    serpapi_link: p.serpapi_link || "",
  };
};

async function fetchAll({ q, hl = "id", gl = "id", targetCount = 100 }) {
  let allResults = [];
  const seen = new Set();
  const BASE_DELAY = 3000; // tunggu token aktif - ditingkatkan untuk stabilitas
  const MAX_PAGES = 5; // ditingkatkan untuk mendapatkan lebih banyak data

  // Dapatkan variasi query untuk mencari lebih banyak data
  const queryVariations = q;
  console.log(
    `\n=== MENCARI DENGAN ${queryVariations.length} VARIASI QUERY ===`
  );
  queryVariations.forEach((query, index) => {
    console.log(`${index + 1}. "${query}"`);
  });
  console.log("================================================\n");

  for (const [queryIndex, currentQuery] of queryVariations.entries()) {
    console.log(
      `\n--- PENCARIAN ${queryIndex + 1}/${
        queryVariations.length
      }: "${currentQuery}" ---`
    );

    let results = [];
    let token = null;

    for (let i = 0; i < MAX_PAGES; i++) {
      console.log(`Memproses halaman ${i + 1}/${MAX_PAGES}`);
      const params = {
        engine: "google_maps",
        type: "search",
        q: currentQuery, // menggunakan currentQuery untuk variasi
        hl,
        gl,
        num: 20, // maksimal hasil per halaman (default 20, maksimal 20 untuk Google Maps)
        api_key: API_KEY,
      };
      if (token) params.next_page_token = token;

      const json = await getJson(params);
      const local = json.local_results || [];
      console.log(`Halaman ${i + 1}: ditemukan ${local.length} hasil lokal`);

      for (const p of local.map(normalizePlace)) {
        const key = p.data_id || p.place_id || `${p.title}::${p.address}`;
        if (!seen.has(key)) {
          seen.add(key);
          results.push(p);
          allResults.push(p);
        }
      }

      console.log(`Query "${currentQuery}" - hasil unik: ${results.length}`);
      console.log(`Total kombinasi semua query: ${allResults.length}`);

      // Hentikan jika sudah mencapai target untuk semua query
      if (allResults.length >= targetCount) {
        console.log(
          `Target ${targetCount} tercapai dari semua query, menghentikan pencarian`
        );
        break;
      }

      const pagination = json.serpapi_pagination || {};
      token = pagination.next_page_token || null;
      if (!token) {
        console.log(
          `Tidak ada halaman berikutnya untuk query "${currentQuery}"`
        );
        break;
      }

      console.log(`Menunggu ${BASE_DELAY}ms sebelum halaman berikutnya...`);
      await sleep(BASE_DELAY);
    }

    // Hentikan semua query jika sudah mencapai target
    if (allResults.length >= targetCount) {
      break;
    }

    // Delay antar query yang berbeda
    if (queryIndex < queryVariations.length - 1) {
      console.log(`Menunggu ${BASE_DELAY}ms sebelum query berikutnya...`);
      await sleep(BASE_DELAY);
    }
  }

  console.log(`\n=== RINGKASAN PENCARIAN ===`);
  console.log(`Query asli: ${q}`);
  console.log(`Jumlah variasi query: ${queryVariations.length}`);
  console.log(`Total hasil ditemukan: ${allResults.length}`);
  console.log(`Target: ${targetCount}`);
  console.log(
    `Hasil yang dikembalikan: ${Math.min(allResults.length, targetCount)}`
  );
  console.log(`========================\n`);

  //Msukkan data scrap ke dalam DB
  for (const result of allResults) {
    const db = getDB();
    const found = await db.collection("GoogleMapsScrapContacts").findOne({
      data_id: result.data_id,
    });

    if (!found) {
      const newData = {
        _id: uuidv4(),
        ...result,
        _createdAt: new Date().toISOString(),
        _updatedAt: new Date().toISOString(),
      };
      await db.collection("GoogleMapsScrapContacts").insertOne(newData);
    }
  }

  return allResults.slice(0, targetCount);
}
