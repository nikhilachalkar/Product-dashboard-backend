// controllers/combinedController.js
const { getDB } = require('../config/db');
const { getStatistics } = require('./statController');
const { getPriceRangeBarChart, getCategoryPieChart } = require('./chartController');

const getCombinedData = async (req, res) => {
  const { month } = req.query;

  if (!month || isNaN(month) || month < 1 || month > 12) {
    return res.status(400).send('Invalid month');
  }

  try {
    const collection = getDB().collection('products');

    // Initiate all queries concurrently
    const transactionsPromise = collection.find({
      $expr: {
        $eq: [{ $month: "$dateOfSale" }, parseInt(month)]
      }
    }).toArray();

    const statisticsPromise = getStatisticsInternal(month);
    const priceBarChartPromise = getPriceRangeBarChartInternal(month);
    const categoryPieChartPromise = getCategoryPieChartInternal(month);

    const [transactions, statistics, priceBarChart, categoryPieChart] = await Promise.all([
      transactionsPromise,
      statisticsPromise,
      priceBarChartPromise,
      categoryPieChartPromise,
    ]);

    const combinedData = {
      transactions,
      statistics,
      priceBarChart,
      categoryPieChart,
    };

    res.json(combinedData);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving combined data');
  }
};

// Internal functions to fetch data without sending responses
const getStatisticsInternal = async (month) => {
  const collection = getDB().collection('products');
  const stats = await collection.aggregate([
    {
      $match: {
        $expr: {
          $eq: [{ $month: "$dateOfSale" }, parseInt(month)]
        }
      }
    },
    {
      $group: {
        _id: null,
        totalSaleAmount: { $sum: '$price' },
        soldItems: { $sum: { $cond: [{ $eq: ['$sold', true] }, 1, 0] } },
        notSoldItems: { $sum: { $cond: [{ $eq: ['$sold', false] }, 1, 0] } },
      },
    },
  ]).toArray();

  return stats[0] || { totalSaleAmount: 0, soldItems: 0, notSoldItems: 0 };
};

const getPriceRangeBarChartInternal = async (month) => {
  const collection = getDB().collection('products');
  const priceRanges = await collection.aggregate([
    {
      $match: {
        $expr: {
          $eq: [{ $month: "$dateOfSale" }, parseInt(month)]
        }
      }
    },
    {
      $bucket: {
        groupBy: '$price',
        boundaries: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, Infinity],
        default: '901-above',
        output: { count: { $sum: 1 } },
      }
    },
  ]).toArray();

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

  return priceRanges.map((range, index) => ({
    range: labels[index] || range._id,
    count: range.count,
  }));
};

const getCategoryPieChartInternal = async (month) => {
  const collection = getDB().collection('products');
  const categories = await collection.aggregate([
    {
      $match: {
        $expr: {
          $eq: [{ $month: "$dateOfSale" }, parseInt(month)]
        }
      }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
  ]).toArray();

  return categories;
};

module.exports = { getCombinedData };
