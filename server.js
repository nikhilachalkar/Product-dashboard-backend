const express = require('express');
const bodyParser = require('body-parser');

require('dotenv').config();
const { connectDB, getDB } = require('./config/db');
const transactionsRoutes = require('./routes/transactions');
const statisticsRoutes = require('./routes/stats');
const chartsRoutes = require('./routes/charts');
const combinedRoutes = require('./routes/combined');
const cors = require('cors');

const app = express();
app.use(cors());


app.use(bodyParser.json());


// // Example API to filter by month
// app.get('/products-by-month', async (req, res) => {
//   const { month } = req.query; // expected value is a number between 1 (January) and 12 (December)
  
//   if (!month || isNaN(month) || month < 1 || month > 12) {
//     return res.status(400).send('Invalid month');
//   }

//   try {
//     const collection = db.collection('products');
    
//     const products = await collection.find({
//       dateOfSale: {
//         $gte: new Date(2023, month - 1, 1),
//         $lt: new Date(2023, month, 1)
//       }
//     }).toArray();

//     res.json(products);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Error retrieving products');
//   }
// });

const startServer = async () => {
  await connectDB();

  
  
  app.use('/', transactionsRoutes);
  app.use('/', statisticsRoutes);
  app.use('/', chartsRoutes);
  app.use('/', combinedRoutes);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});