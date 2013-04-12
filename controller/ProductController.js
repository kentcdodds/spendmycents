var ProductController = (function() {
  var OperationHelper = require('apac').OperationHelper;
  var ErrorController = require('./ErrorController');
  var _ = require('underscore');
  var instanceOpHelper;
  var getOpHelper;
  var defaultResponseGroups = 'Small,OfferSummary,Images'

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
    searchProducts: function(req, res) {
      var itemPage = req.query.itemPage || Math.floor(Math.random()*6);
      getOpHelper().execute('ItemSearch', {
        SearchIndex: req.query.searchIndex || 'All',
        Keywords: req.query.keywords || ' ',
        MaximumPrice: req.query.price || req.query.maxPrice || req.query.minPrice || 1000,
        MinimumPrice: req.query.price || req.query.minPrice || req.query.maxPrice || 1000,
        ResponseGroup: req.query.responseGroup || defaultResponseGroups,
        ItemPage: itemPage
      }, function(error, results) {
        if (error) {
          ErrorController.sendErrorJson(res, 500, error);
        } else {
          if (_.isEmpty(results) && itemPage !==1 && !req.query.hasOwnProperty('itemPage')) {
            req.query.itemPage = 1;
            this.searchProducts(req, res);
          } else {
            res.send(results);
          }
        }
      });
    },
    getProducts: function(req, res) {
      getOpHelper().execute('ItemLookup', {
        ItemId: req.query.ids,
        IdType: req.query.idType || 'ASIN',
        ResponseGroup: req.query.responseGroup || defaultResponseGroups
      }, function(error, results) {
        if (error) {
          ErrorController.sendErrorJson(res, 500, error);
        } else {
          res.send(results);
        }
      });
    }
  }
})();

module.exports = ProductController;
