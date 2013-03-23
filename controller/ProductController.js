var ProductController = (function() {

  var OperationHelper = require('apac').OperationHelper
    , ErrorController = require('./ErrorController')
    , instanceOpHelper
    , getOpHelper;

  getOpHelper = function() {
    if (!instanceOpHelper) {
      instanceOpHelper = new OperationHelper({
        awsId: process.env.AMZ_ACCESS_KEY_CODE,
        awsSecret: process.env.AMZ_SECRET_ACCESS_KEY,
        assocId: process.env.AMZ_ASSOCIATE_ID
      });
    }
    return instanceOpHelper;
  }

  return {
    getProducts: function(req, res) {
      getOpHelper().execute('ItemSearch', {
        SearchIndex: req.query.searchIndex || 'All',
        Keywords: req.query.keywords || ' ',
        MaximumPrice: req.query.price || req.query.maxPrice || req.query.minPrice || 1000,
        MinimumPrice: req.query.price || req.query.minPrice || req.query.maxPrice || 1000,
        ResponseGroup: req.query.responseGroup || 'Small,OfferSummary'
      }, function(error, results) {
        if (error) {
          ErrorController.sendErrorJSON(res, 500, error);
        } else {
          res.send(results);
        }
      });
    }
  }
})();

module.exports = ProductController;
