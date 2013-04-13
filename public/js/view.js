// Global object
var SMC = {};

function setupHover() {
    $('.hover').hover(function(){
			$(this).addClass('flip');
		},function(){
			$(this).removeClass('flip');
  });
}


function sendSearchRequest(){
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
          setupHover();
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