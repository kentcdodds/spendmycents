var ProductRoutes = {
    setupRoutes: function(app, ProductController) {
      app.get('/products', ProductController.getProducts);
  }
}

module.exports = ProductRoutes;