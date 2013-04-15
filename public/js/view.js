// Global object for 
var SMC = {};
var MAX_REQUEST_RETRIES = 5;

SMC.setupHover = function () {
    $('.hover').hover(function(){
			$(this).addClass('flip');
		},function(){
			$(this).removeClass('flip');
  });
};

SMC.sendSearchRequest = function (){
  var price, priceIsValid; 
  price = $('#user-input-price').val();
  priceIsValid = SMC.validateUserInput(price);
  
  if (priceIsValid){
    price = price * 100;
    $('.product-panel').remove();
    SMC.displayLoadingGif();
    
    $.ajax({  
      type: "GET",  
      url: "/products",  
      data: "price="+price,  
      success: function(resp){
        
        var requests = 0;
        SMC.response = resp;
        
        // TODO Discuss a better way to do this, if possible.
        // Make sure that response has results, if not, try again
        if(resp.ItemSearchResponse.Items[0].Item) {
          SMC.setupProductView(resp.ItemSearchResponse.Items[0].Item);
          SMC.setupHover();
          requests += 1;
        } else if (requests <= 5) {
          SMC.sendSearchRequest();
        }
      
      },  
      error: function(e){  
        alert('Error: ' + e);  
      }  
    });      
  } else {
    SMC.showError();
  }
};

SMC.validateUserInput = function (userInput) {
  console.log(userInput)
  if (userInput && !_.isFinite(userInput)) {
    return false;
  }

  return true;
};

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
  if (!$('.loading-image').length) {
    $('#loading-image-container').append("<img src='../public/img/ajax-loader-light.gif' class='loading-image'>");
  } else {
    $('.loading-image').show();
  }
};

SMC.showError = function () {
  var alert =
              "<div class='alert alert-error'>" +
                "<button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button>" +
                "<strong>Warning!</strong> Easy there tiger. We only do numbers" + 
              "</div>";
  
  $('#loading-image-container').append(alert);
}


$(document).ready(function () {
  
  $('#user-input-price').keypress(function (e) {
    if (e.which == 13) {
      SMC.sendSearchRequest();
    }
  });
  
  // If a user is logged in, then just show favorites button
  // TODO find out how to tell if a user is authenticated
  SMC.checkIfUserIsLoggedIn();
  
});

