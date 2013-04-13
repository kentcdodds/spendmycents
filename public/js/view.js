// Global object
var SMC = {};

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
        
        if(resp.ItemSearchResponse.Items[0].Item.length) {  
          SMC.setupProductView(resp.ItemSearchResponse.Items[0].Item);
          SMC.setupHover();
        } else {
          sendSearchRequest();
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

