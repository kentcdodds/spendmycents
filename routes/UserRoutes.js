var UserController = require('../controller/UserController');
userRoutes = {
  setupRoutes: function(app) {
    app.get('/users', UserController.getAllUsers);
    app.get('/users/:id', UserController.getUser);
    app.post('/users', UserController.saveUser);
    app.put('/users', UserController.saveUser);
    app.del('/users/:id', UserController.deleteUser);
  }
}

module.exports = userRoutes;
