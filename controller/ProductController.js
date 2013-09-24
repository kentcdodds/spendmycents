'use strict';

var ProductController = (function() {
  var OperationHelper = require('apac').OperationHelper;
  var ErrorController = require('./ErrorController');
  var _ = require('underscore');
  var instanceOpHelper;
  var getOpHelper;
  var searchInputIsValid;
  var ifEachExistsAreValidNumbers;
  var defaultResponseGroups = 'Small,OfferSummary,Images';
  var backupSearchIndexes = [
    "All",
    "Apparel",
    "Appliances",
    "ArtsAndCrafts",
    "Automotive",
    "Baby",
    "Beauty",
    "Blended",
    "Books",
    "Classical",
    "Collectibles",
    "DVD",
    "DigitalMusic",
    "Electronics",
    "GiftCards",
    "GourmetFood",
    "Grocery",
    "HealthPersonalCare",
    "HomeGarden",
    "Industrial",
    "Jewelry",
    "KindleStore",
    "Kitchen",
    "LawnAndGarden",
    "Marketplace",
    "MP3Downloads",
    "Magazines",
    "Miscellaneous",
    "Music",
    "MusicTracks",
    "MusicalInstruments",
    "MobileApps",
    "OfficeProducts",
    "OutdoorLiving",
    "PCHardware",
    "PetSupplies",
    "Photo",
    "Shoes",
    "Software",
    "SportingGoods",
    "Tools",
    "Toys",
    "UnboxVideo",
    "VHS",
    "Video",
    "VideoGames",
    "Watches",
    "Wireless",
    "WirelessAccessories"
  ];
  var specialCaseCapitals = {
    "DVD": "DVD",
    "VHS": "VHS",
    "MP3Downloads": "MP3 Downloads",
    "PCHardware": "PC Hardware",
    "ArtsAndCrafts": "Arts and Crafts"
  };

  getOpHelper = function() {
    return new OperationHelper({
        awsId: "AKIAIZJAGS6K4VTM3ZNA",
        awsSecret: "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",
        assocId: "spmyce-20"
      });
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
      if (itemPage <= 0) {
        itemPage = 1;
      }
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
      if (!req.query.ids) {
        res.send({});
      }
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
    },
    getSearchIndices: function(req, res) {
      getOpHelper().execute('ItemSearch', {
        SearchIndex: 'INVALID',
        Keywords: ' '
      }, function(error, results) {
        var arryToSend = backupSearchIndexes;
        if (!error) {
          try {
            var message = results.ItemSearchResponse.Items[0].Request[0].Errors[0].Error[0].Message[0];
            var start = message.indexOf('[');
            var end = message.indexOf(']') + 1;
            var arryString = message.substring(start, end).replace(/'/g, '"').replace(/,,/g, ',');
            arryToSend = JSON.parse(arryString); 
          } catch (e) {
          }
        }
        //Add spaces where necessary
        for (var i = 0; i < arryToSend.length; i++) {
          var fixedVersion = specialCaseCapitals[arryToSend[i]];
          if (!fixedVersion) {
            fixedVersion = arryToSend[i].replace(/(.)([A-Z])/g, '$1 $2');
          }
          arryToSend[i] = fixedVersion;
        }
        res.send(arryToSend);
      });
    }
  };
})();

module.exports = ProductController;
