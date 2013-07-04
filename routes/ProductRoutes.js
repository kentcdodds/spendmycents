'use strict';
var ProductRoutes = (function() {
  var ProductController = require('../controller/ProductController');
  return {
    setupRoutes: function(app) {
      app.get('/products', function(req, res) {
        if (req.query.hasOwnProperty('ids') && req.query.ids) {
          ProductController.getProducts(req, res);
        } else {
          ProductController.searchProducts(req, res);
        }
      });
      app.get('/searchIndices', function(req, res) {
          ProductController.getSearchIndices(req, res);
      });
    }
  };
})();

module.exports = ProductRoutes;