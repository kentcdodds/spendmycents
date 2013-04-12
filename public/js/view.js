$(document).ready(function () {
  // $('#search-button').click(function () {
//     sendSearchRequest();
//   });
  setupHover();
  
  
});

function setupHover() {
  var loaded = false;
  // while(!loaded) {
    loaded = ($('.hover').length === 10);
    console.log($('.hover'));
  // }
  
  if (loaded) {
    $('.hover').hover(function(){
  			$(this).addClass('flip');
  		},function(){
  			$(this).removeClass('flip');
    });
  }
}

// function sendSearchRequest(){
//   console.log('sending!')
//   var price = $('#user-input-price').val();
//   console.log(price);
//   if (price && parseFloat(price)){
//     price = price * 100;
//     console.log(price)
//     var requestData;
//     return requestData = {"price": price};
//     
//     // $.ajax({  
// //       type: "GET",  
// //       url: "/products",  
// //       data: "price="+price,  
// //       success: function(resp){  
// //         
// //       },  
// //       error: function(e){  
// //         alert('Error: ' + e);  
// //       }  
// //     });  
//     
//   }
  
// }