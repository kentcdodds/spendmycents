// Global object for 
var SMC = {};
SMC.MAX_REQUEST_RETRIES = 3;

/******** Formatting Functions ********/

SMC.setupHover = function () {
    $('.hover').hover(function(){
			$(this).addClass('flip');
		},function(){
			$(this).removeClass('flip');
  });
};

/***************************************/

/******* Ajax Requests ********/

SMC.sendRequest = function (){
  var userInput, userInputIsValid; 
  
  userInput = $('#user-input-price').val();
  userInputIsValid = SMC.validateUserInput(userInput);
  
  if (userInputIsValid){
    SMC.sendSearchRequest(userInput);
  } else {
    userInput = userInput.toLowerCase();
  
    if (_.isEqual(userInput, 'favorites')) {
      SMC.loadUserFavorites();
    } else {
      SMC.showAlert("error", "<strong>Warning!</strong> Easy there tiger. We only do numbers.");
    }
  } 
  
  
};


/***********************************/

/******** User authentication functions ********/

SMC.checkIfUserIsLoggedIn = function () {  
  $.ajax({  
    type: "GET",  
    url: "/users/me",  
    success: function(resp){
      
      if (resp['name']) {
        SMC.user = resp;
        SMC.setupForUser(); 
      } else if (resp['code'] === 403) {
        $('#favorites-button').hide();
      }
    },  
    error: function(e){  
    }  
  });     
  
};
/***********************************************/

/******** Utility Functions ********/

SMC.validateUserInput = function (userInput) {
  console.log(userInput)
  if ((userInput || userInput === "") && !_.isFinite(userInput)) {
    return false;
  }

  return true;
};



SMC.setupForUser = function () {
  $('#user-status-button').html(SMC.user['name']);  
  $('li.login').remove();
  
  var logoutHTML = "<li class='logout'><span class='logout'><h5>All done? Click below to sign out.</h5></span></li>" +
                    "<li class='logout divider'></li>" +
                    "<li class='logout'><span><a href='/auth/logout' id='logout-button' class='btn'>" + 
                        "Sign Out" +
                    "</a></span></li>";
                    
  $('#login-dropdown').append(logoutHTML);
  
};

SMC.displayLoadingGif = function () {
  $('.loading-image').css('visibility', 'visible');
};

SMC.hideLoadingGif = function () {
  $('.loading-image').css('visibility', 'hidden');
};

SMC.removeProductPanels = function () {
  $('.product-panel').remove();
};

/********************************/

/******** Alert Handling ********/

SMC.showAlert = function (type, text) {
  var alertText = text;
  if (type === 'error') {
    $(".alert").addClass('alert-error'); 
  } 
  $('.alert').html(alertText);
  $(".alert").css('visibility', 'visible');
   
  window.setTimeout(function() { 
    $(".alert").css('visibility', 'hidden');
    $(".alert").removeClass('alert-error'); 
  }, 4000);
};

/******** App setup ********/

$(document).ready(function () {
  
  // Bind event handlers
  $('#user-input-price').keypress(function (e) {
    if (e.which == 13) {
      SMC.sendRequest();
    }
  });
  
  $('#favorites-button').click(function () {
    $('#user-input-price').val('favorites');
    SMC.loadUserFavorites();
    console.log('calling loaduser favorites')
  });
  
  $('#search-button').click(function () {
    SMC.sendRequest();
  })
  
  SMC.checkIfUserIsLoggedIn();
  
});

