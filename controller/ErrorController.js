var ErrorController = (function() {
  var getCodeError;
  var getErrorJSON;

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
    sendErrorJson: function(res, code, message) {
      res.send(code, getErrorJSON(code, message));
    }
  };
})();

module.exports = ErrorController;