var ProductController = (function() {
  var OperationHelper = require('apac').OperationHelper;
  var ErrorController = require('./ErrorController');
  var _ = require('underscore');
  var instanceOpHelper;
  var getOpHelper;
  var searchInputIsValid;
  var ifEachExistsAreValidNumbers;
  var defaultResponseGroups = 'Small,OfferSummary,Images';

  getOpHelper = function() {
    if (!instanceOpHelper) {
      instanceOpHelper = new OperationHelper({
        awsId: process.env.AMZ_ACCESS_KEY_CODE,
        awsSecret: process.env.AMZ_SECRET_ACCESS_KEY,
        assocId: process.env.AMZ_ASSOCIATE_ID
      });
    }
    return instanceOpHelper;
  };

  searchInputIsValid = function(req) {
    var q = req.query;
    var priceIsValid = ifEachExistsAreValidNumbers([q.price, q.maxPrice, q.minPrice]);
    return priceIsValid;
  };

  ifEachExistsAreValidNumbers = function(candidates) {
    var i, item;
    if (!_.isArray(candidates)) {
      candidates = [candidates];
    }
    for (i = 0; i < candidates.length; i++) {
      item = candidates[i];
      if (item && !_.isFinite(item)) {
        return false;
      }
    }
    return true;
  };

  return {
    searchProducts: function(req, res) {
      if (!searchInputIsValid(req)) {
        ErrorController.sendErrorJson(res, 400, 'Invalid price. If a given price is present, it must be valid.' + JSON.stringify({
          price: req.query.price,
          maxPrice: req.query.maxPrice,
          minPrice: req.query.minPrice
        }));
      }
      var itemPage = req.query.itemPage || Math.floor(Math.random() * 6);
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
          if (_.isEmpty(results) && itemPage !== 1 && !req.query.hasOwnProperty('itemPage')) {
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
