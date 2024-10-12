const axios = require('axios');
const { getDB } = require('../config/db');

const listTransactions = async (req, res) => {
  const { month, search = '', page = 1, perPage = 10 } = req.query;

  if (!month || isNaN(month) || month < 1 || month > 12) {
    return res.status(400).send('Invalid month');
  }

  try {
    const skip = (page - 1) * perPage;
    const filter = {
      $expr: {
        $eq: [{ $month: "$dateOfSale" }, parseInt(month)]
      }
    };

    if (search) {
      const priceSearch = Number(search);
      if (!isNaN(priceSearch)) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { price: priceSearch },
        ];
      } else {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }
    }

    const collection = getDB().collection('products');
    const transactions = await collection
      .find(filter)
      .skip(parseInt(skip))
      .limit(parseInt(perPage))
      .toArray();

    res.status(200).json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving transactions');
  }
};

const seedDatabase = async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const data = response.data;

    const collection = getDB().collection('products');

    // Clear existing records
    await collection.deleteMany({});

    // Insert new data
    await collection.insertMany(data);

    collection.updateMany(
      { dateOfSale: { $type: "string" } }, // Select documents where dateOfSale is a string
      [
        {
          $set: {
            dateOfSale: {
              $dateFromString: {
                dateString: "$dateOfSale" // Convert string to Date
              }
            }
          }
        }
      ]
    );
    
    res.status(200).send('Database initialized with seed data');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error seeding the database');
  }
};

module.exports = { listTransactions, seedDatabase };
