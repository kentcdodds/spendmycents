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
          
        SMC.setupProductView(resp.ItemSearchResponse.Items[0].Item);
        setupHover();
      },  
      error: function(e){  
        alert('Error: ' + e);  
      }  
    });      
  }
}