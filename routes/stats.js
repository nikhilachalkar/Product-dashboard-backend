// routes/statistics.js
const express = require('express');
const { getStatistics } = require('../controllers/statController');

const router = express.Router();

// Route to get statistics
router.get('/statistics', getStatistics);

module.exports = router;
