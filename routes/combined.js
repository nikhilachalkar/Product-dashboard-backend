// routes/combined.js
const express = require('express');
const { getCombinedData } = require('../controllers/combinedController');

const router = express.Router();

// Route to get combined data
router.get('/combined-data', getCombinedData);

module.exports = router;