const express = require('express');
const { getPriceRangeBarChart, getCategoryPieChart } = require('../controllers/chartController');

const router = express.Router();

// Route for price range bar chart
router.get('/price-range-bar-chart', getPriceRangeBarChart);

// Route for category pie chart
router.get('/category-pie-chart', getCategoryPieChart);

module.exports = router;
