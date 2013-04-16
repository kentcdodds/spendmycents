SMC.setFavorite = function (id) {
  SMC.fillClickedStar(id);
  $.ajax({  
    type: "PUT",  
    url: "/users/me/favorites?ids="+id,  
    success: function(resp){
      SMC.response = resp;
      SMC.showAlert('info', '<strong>Sweet!</strong> another item on the favorites list.');
    },  
    error: function(e){  
      alert('Error: ' + e);  
    }  
  });
};

SMC.loadUserFavorites = function () {
  $('.product-panel').remove();
  $.ajax({  
    type: "GET",  
    url: "/users/me/favorites",  
    success: function(resp){
      console.log(resp);
      var requests = 0;
      SMC.response = resp;
      if (_.isEmpty(SMC.response)) {
        SMC.showAlert("error", "<strong>Bummer!</strong> Looks like you don't have any favorites yet.");
      } else if (resp['code']) {
        SMC.showAlert("error", "<strong>Weird...</strong> We had a problem. That's lame, sorry about that");
      } else if(resp.ItemLookupResponse && resp.ItemLookupResponse.Items[0].Item) {
        
        SMC.setupProductView(resp.ItemLookupResponse.Items[0].Item);
        SMC.setupHover();
        SMC.showAlert('info', 'Ok, '+ SMC.user['name'] + ' Here are your favorites:');
        requests += 1;
      } else if (requests < 3) {
        // SMC.loadUserFavorites();
        SMC.showAlert("error", "<strong>Weird...</strong> We weren't able to get your favorites for some reason.");
      }
    },  
    error: function(e){  
      SMC.showAlert("error", "<strong>Error!</strong> Something crazy happened. If it happens again let us know."); 
    }  
  });      
};

//TODO In later version, set up links for user that authenticates after a search
// SMC.addSaveToFavoritesLink = function () {
//   $('.product-panel').each(function () {
//     productId = this.attr('id');
//     this.find('p.product-link').append("&nbsp;|&nbsp;<a href='#'onclick='SMC.setFavorite(\"" + productId + "\")'>Save as Favorite</a>");
//   });
// };
