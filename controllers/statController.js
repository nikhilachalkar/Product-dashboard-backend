const { getDB } = require('../config/db');

const getStatistics = async (req, res) => {
  const { month } = req.query;

  if (!month || isNaN(month) || month < 1 || month > 13) {
    return res.status(400).send('Invalid month');
  }

  try {
    const collection = getDB().collection('products');

    
    const matchStage = parseInt(month) === 13 
      ? {}
      : {
          $expr: {
            $eq: [{ $month: "$dateOfSale" }, parseInt(month)] 
          },
        };
    
    const stats = await collection.aggregate([
      {
        $match: matchStage,
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

    res.json(stats[0] || { totalSaleAmount: 0, soldItems: 0, notSoldItems: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving statistics');
  }
};

module.exports = { getStatistics };
