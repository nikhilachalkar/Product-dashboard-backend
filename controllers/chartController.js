const { getDB } = require('../config/db');

const getPriceRangeBarChart = async (req, res) => {
  const { month } = req.query;

  if (!month || isNaN(month) || month < 1 || month > 12) {
    return res.status(400).send('Invalid month');
  }

  try {
    const collection = getDB().collection('products');
    const priceRanges = await collection.aggregate([
      {
        $match: {
          $expr: {
            $eq: [{ $month: "$dateOfSale" }, parseInt(month)] // Compare month of dateOfSale with selected month
          }
        }
      },
      {
        $bucket: {
          groupBy: '$price',
          boundaries: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, Infinity],
          default: '901-above',
          output: { count: { $sum: 1 } },
        },
      },
    ]).toArray();

    // Rename boundaries to desired labels
    const labels = [
      '0-100',
      '101-200',
      '201-300',
      '301-400',
      '401-500',
      '501-600',
      '601-700',
      '701-800',
      '801-900',
      '901-above',
    ];

    const formattedRanges = priceRanges.map((range, index) => ({
      range: labels[index] || range._id,
      count: range.count,
    }));

    res.json(formattedRanges);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating bar chart');
  }
};

const getCategoryPieChart = async (req, res) => {
  const { month } = req.query;

  if (!month || isNaN(month) || month < 1 || month > 12) {
    return res.status(400).send('Invalid month');
  }

  try {
    const collection = getDB().collection('products');
    const priceRanges = await collection.aggregate([
      {
        $match: {
          $expr: {
            $eq: [{ $month: "$dateOfSale" }, parseInt(month)] // Compare month of dateOfSale with selected month
          }
        }
      },
      {
        $bucket: {
          groupBy: '$price',
          boundaries: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, Infinity],
          default: '901-above',
          output: { count: { $sum: 1 } }
        }
      }
    ]).toArray();

    console.log('Price ranges:', priceRanges); // Log the query result for debugging

    res.json(priceRanges);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating pie chart');
  }
};

module.exports = { getPriceRangeBarChart, getCategoryPieChart };
