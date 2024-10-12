// routes/transactions.js
const express = require('express');
const { listTransactions, seedDatabase } = require('../controllers/transactionsController');

const router = express.Router();

// Route to list transactions with search and pagination
router.get('/transactions', listTransactions);

// Route to seed the database
router.get('/seed-database', seedDatabase);

module.exports = router;
