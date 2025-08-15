const express = require("express");
const router = express.Router();
const { googleMapsScrapper,getAllGoogleScrapData } = require("../controllers/googleMapsScrapper");

router.post("/", googleMapsScrapper);
router.get("/", getAllGoogleScrapData);
module.exports = router;
