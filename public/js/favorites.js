SMC.setFavorite = function (id) {
  $.ajax({  
    type: "PUT",  
    url: "/user/me/favorites",  
    data: id,  
    success: function(resp){
      
      SMC.response = resp;
      
      if(resp.ItemSearchResponse.Items[0].Item) {
        SMC.setupProductView(resp.ItemSearchResponse.Items[0].Item);
        SMC.setupHover();
      } 
    },  
    error: function(e){  
      alert('Error: ' + e);  
    }  
  });
}