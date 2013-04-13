// Global object for 
var SMC = {};
var MAX_REQUEST_RETRIES = 5;

SMC.setupHover = function () {
    $('.hover').hover(function(){
			$(this).addClass('flip');
		},function(){
			$(this).removeClass('flip');
  });
}

SMC.sendSearchRequest = function (){
  var price = $('#user-input-price').val();
  if (price && parseFloat(price)){
    price = price * 100;
   
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
  }
}

SMC.setupForUser = function (isAuthenticated) {
  if(isAuthenticated) {
    $('#favorites-button').show();
  }else {
    $('#favorites-button').hide();
  }
}

$(document).ready(function () {
  
  // If a user is logged in, then just show favorites button
  // TODO find out how to tell if a user is authenticated
  SMC.setupForUser();
  
});

