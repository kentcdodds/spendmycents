SMC.addFavorite = function(item) {
  $.ajax({
    type: "PUT",
    url: "/users/me/favorites?ids=" + item.data('product-id'),
    success: function(res) {
      SMC.response = res;
      SMC.showAlert('info', '<strong>Sweet!</strong> Another item on the favorites list.');
      item.data('is-favorite', true);
      item.attr('title', 'Remove from favorites');
    },
    error: function(e) {
      SMC.showAlert('error', '<strong>Sorry!</strong> Couldn\'t add that one for some reason!');
      console.log(e);
    }
  });
};

SMC.removeFavorite = function(item) {
  $.ajax({
    type: "DELETE",
    url: "/users/me/favorites?ids=" + item.data('product-id'),
    success: function(res) {
      SMC.response = res;
      SMC.showAlert('info', '<strong>Sayonara!</strong> That item is no longer a favorite.');
      item.data('is-favorite', false);
      item.attr('title', 'Save to favorites');
    },
    error: function(e) {
      SMC.showAlert('error', '<strong>Sorry!</strong> Couldn\'t remove that one for some reason!');
      console.log(e);
    }
  });
};

SMC.loadUserFavorites = function(index, append) {
  index = index || 0;
  append = append || false;
  SMC.displayLoadingGif();
//  $('.product-panel').remove();
  $.ajax({
    type: "GET",
    url: "/users/me/favorites?index=" + index,
    success: function(res) {
      SMC.hideLoadingGif();
      console.log('favs' + SMC.user.favorites.length);
      console.log('index' + index);
      if (SMC.user.favorites.length <= index) {
        console.log('removing more button');
        $('#more-button').remove();
      }
      var moreButton;
      SMC.response = res;
      if (_.isEmpty(SMC.response)) {
        SMC.showAlert("error", "<strong>Bummer!</strong> Looks like you don't have any favorites yet.");
      } else if (res['code']) {
        SMC.showAlert("error", "<strong>Weird...</strong> We had a problem. That's lame, sorry about that");
      } else if (res.ItemLookupResponse && res.ItemLookupResponse.Items[0].Item) {

        SMC.setupProductView(res.ItemLookupResponse.Items[0].Item, append);
        $('#more-button').remove();
        if (SMC.user.favorites.length > index) {
          moreButton = '<br /><button class="btn" id="more-button" onclick="SMC.loadUserFavorites(' + (index + 10) + ', true)">Load more...</button>';
          $('#product-container').append(moreButton);
        }
        SMC.setupHover();
        SMC.showAlert('info', 'Ok ' + SMC.user['name'] + ', here are your favorites.');
      } else {
        SMC.showAlert("error", "<strong>Weird...</strong> We weren't able to get your favorites for some reason.");
      }
    },
    error: function(e) {
      SMC.hideLoadingGif();
      if (SMC.user.favorites.length > index) {
        $('#more-button').remove();
      }
      SMC.showAlert("error", "<strong>Error!</strong> Something crazy happened. If it happens again let us know.");
      console.log(e);
    }
  });
};

SMC.setupFavoriteStars = function() {
  var productId, toggleOn, toggleOff, $self;
  $('.favorites-link').each(function() {
    $self = $(this);
    productId = $self.data('product-id');
    toggleOn = 'icon-star';
    toggleOff = 'icon-star-empty';
    $self.hover(function() {
      if ($(this).data('is-favorite')) {
        $(this).addClass(toggleOff);
        $(this).removeClass(toggleOn);
      } else {
        $(this).addClass(toggleOn);
        $(this).removeClass(toggleOff);
      }
    }, function() {
      if ($(this).data('is-favorite')) {
        $(this).removeClass(toggleOff);
        $(this).addClass(toggleOn);
      } else {
        $(this).removeClass(toggleOn);
        $(this).addClass(toggleOff);
      }
    });
    $self.click(function() {
      if ($(this).data('is-favorite')) {
        SMC.removeFavorite($(this));
      } else {
        SMC.addFavorite($(this));
      }
    });
    if ($self.data('is-favorite')) {
      $(this).addClass(toggleOn);
      $(this).removeClass(toggleOff);
      $(this).attr('title', 'Remove from favorites');
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
