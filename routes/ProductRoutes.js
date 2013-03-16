var ProductRoutes = {
    setupRoutes: function(app, ProductController) {
      app.get('/products', ProductController.get);
      app.get('/products/:id', ProductController.get);
  }
}

module.exports = ProductRoutes;