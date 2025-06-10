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
