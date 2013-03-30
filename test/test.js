var UserController = require('../controller/UserController');
var prefNum = '0010100010000';
var preferences = UserController.convertPreferenceNumberToPreferences(prefNum);
var prefNumAgain = UserController.convertPreferencesToPreferenceNumber(preferences);
var preferences2 = UserController.convertPreferenceNumberToPreferences(prefNumAgain);

console.log(JSON.stringify(preferences) === JSON.stringify(preferences2));
console.log(JSON.stringify(preferences, null, 2));