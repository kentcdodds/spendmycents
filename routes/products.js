exports.search = function(req, res) {

  OperationHelper = require('apac').OperationHelper;

  var opHelper = new OperationHelper({
      awsId: process.env.AMZ_ACCESS_KEY_CODE,
      awsSecret: process.env.AMZ_SECRET_ACCESS_KEY,
      assocId: process.env.AMZ_ASSOCIATE_ID
  });

  opHelper.execute('ItemSearch', {
      'SearchIndex': req.query.searchIndex || 'All',
      'Keywords': req.query.keywords || ' ',
      'MaximumPrice': req.query.maxPrice || 10,
      'MinimumPrice': req.query.minPrice || 0,
      'ResponseGroup': 'Medium'
  }, function(error, results) {
      if (error) {
       res.json(500, {
        error: "Something weird happened!",
        message: error
      });
     }
     res.send(results);
  });
};