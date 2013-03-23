var ErrorController;

ErrorController = (function() {
  var getCodeError
    , getErrorJSON
    ;

  getCodeError = function(code) {
    switch (code) {
      case 403:
        return 'Insufficient Privilages';
      case 400:
        return 'Bad Request';
      default:
        return null;
    }
  }

  getErrorJSON = function(code, message) {
    return {
      code: code,
      error: getCodeError(code),
      message: message
    }
  }

  return {
    getErrorJSON: function(code, message) {
      return getErrorJSON(code, message);
    },
    sendErrorJSON: function(res, code, message) {
      res.send(getErrorJSON(code, message));
    }
  };
})();

module.exports = ErrorController;